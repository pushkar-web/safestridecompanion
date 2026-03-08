
-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Mumbai safety documents for RAG
CREATE TABLE public.safety_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- 'police_station', 'shelter', 'helpline', 'ipc_law', 'safe_route', 'emergency'
  location_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  embedding vector(768),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.safety_documents ENABLE ROW LEVEL SECURITY;

-- Public read access (safety data is public)
CREATE POLICY "Safety documents are publicly readable"
  ON public.safety_documents FOR SELECT
  USING (true);

-- Create index for vector similarity search
CREATE INDEX idx_safety_documents_embedding ON public.safety_documents
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

-- Trip history table
CREATE TABLE public.trip_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  start_location TEXT,
  end_location TEXT,
  start_lat DOUBLE PRECISION,
  start_lng DOUBLE PRECISION,
  end_lat DOUBLE PRECISION,
  end_lng DOUBLE PRECISION,
  risk_score INTEGER DEFAULT 0,
  risks_averted INTEGER DEFAULT 0,
  badge_title TEXT,
  badge_description TEXT,
  duration_seconds INTEGER,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_history ENABLE ROW LEVEL SECURITY;

-- Public access for demo (no auth required)
CREATE POLICY "Trip history is publicly accessible"
  ON public.trip_history FOR ALL
  USING (true) WITH CHECK (true);

-- Vector similarity search function
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
