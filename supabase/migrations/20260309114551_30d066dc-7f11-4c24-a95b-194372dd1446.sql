
CREATE TABLE public.safety_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  category text NOT NULL DEFAULT 'unsafe_area',
  description text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  location_name text,
  severity text NOT NULL DEFAULT 'moderate',
  upvotes integer NOT NULL DEFAULT 0,
  reporter_name text DEFAULT 'Anonymous'
);

ALTER TABLE public.safety_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read safety reports"
  ON public.safety_reports FOR SELECT TO public
  USING (true);

CREATE POLICY "Anyone can insert safety reports"
  ON public.safety_reports FOR INSERT TO public
  WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.safety_reports;
