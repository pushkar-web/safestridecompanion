
-- AI Cache table for CAG (Cache-Augmented Generation)
CREATE TABLE public.ai_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash text NOT NULL,
  context_hash text NOT NULL,
  response jsonb NOT NULL,
  agent_type text DEFAULT 'general',
  ttl_seconds integer DEFAULT 3600,
  hit_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(query_hash, context_hash)
);

ALTER TABLE public.ai_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "AI cache is publicly readable" ON public.ai_cache
  FOR SELECT TO public USING (true);

-- Chat history for persistent conversations
CREATE TABLE public.chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  agent_type text DEFAULT 'companion',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own chat history" ON public.chat_history
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat history" ON public.chat_history
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Cache invalidation trigger: when a new safety_report is inserted, delete cache entries matching that location
CREATE OR REPLACE FUNCTION public.invalidate_cache_on_report()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.ai_cache
  WHERE response::text ILIKE '%' || COALESCE(NEW.location_name, '') || '%'
    AND NEW.location_name IS NOT NULL
    AND NEW.location_name != '';
  RETURN NEW;
END;
$$;

CREATE TRIGGER invalidate_cache_after_report
  AFTER INSERT ON public.safety_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.invalidate_cache_on_report();
