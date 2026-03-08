
-- Fix: Move vector extension to its own schema
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION vector SET SCHEMA extensions;

-- Fix: Set search_path on the function
CREATE OR REPLACE FUNCTION public.match_safety_documents(
  query_embedding vector(768),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  category TEXT,
  location_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sd.id,
    sd.title,
    sd.content,
    sd.category,
    sd.location_name,
    sd.latitude,
    sd.longitude,
    1 - (sd.embedding <=> query_embedding) AS similarity
  FROM public.safety_documents sd
  WHERE 1 - (sd.embedding <=> query_embedding) > match_threshold
  ORDER BY sd.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Fix: Replace permissive ALL policy with separate policies  
DROP POLICY "Trip history is publicly accessible" ON public.trip_history;

CREATE POLICY "Trip history select" ON public.trip_history FOR SELECT USING (true);
CREATE POLICY "Trip history insert" ON public.trip_history FOR INSERT WITH CHECK (true);
