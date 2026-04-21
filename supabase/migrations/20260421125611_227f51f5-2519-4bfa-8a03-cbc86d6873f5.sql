
-- USER POINTS aggregate table
CREATE TABLE IF NOT EXISTS public.user_points (
  user_id UUID PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User points are publicly readable for leaderboard"
ON public.user_points FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Users can insert own points row"
ON public.user_points FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own points row"
ON public.user_points FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- POINT EVENTS log
CREATE TABLE IF NOT EXISTS public.point_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  amount INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.point_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Point events are publicly readable"
ON public.point_events FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Users can insert own point events"
ON public.point_events FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_point_events_user ON public.point_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_score ON public.user_points(points DESC);

-- AWARD POINTS function: atomic upsert + level + streak
CREATE OR REPLACE FUNCTION public.award_points(
  _action TEXT,
  _amount INTEGER,
  _metadata JSONB DEFAULT '{}'::jsonb
) RETURNS public.user_points
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _row public.user_points;
  _name TEXT;
  _avatar TEXT;
  _last DATE;
  _today DATE := (now() AT TIME ZONE 'UTC')::date;
  _new_streak INTEGER;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Log the event
  INSERT INTO public.point_events (user_id, action, amount, metadata)
  VALUES (_uid, _action, _amount, _metadata);

  -- Pull profile snapshot
  SELECT display_name, avatar_url INTO _name, _avatar
  FROM public.profiles WHERE id = _uid;

  -- Compute streak
  SELECT (last_active_at AT TIME ZONE 'UTC')::date INTO _last
  FROM public.user_points WHERE user_id = _uid;

  IF _last IS NULL THEN
    _new_streak := 1;
  ELSIF _last = _today THEN
    _new_streak := COALESCE((SELECT streak_days FROM public.user_points WHERE user_id = _uid), 1);
  ELSIF _last = _today - INTERVAL '1 day' THEN
    _new_streak := COALESCE((SELECT streak_days FROM public.user_points WHERE user_id = _uid), 0) + 1;
  ELSE
    _new_streak := 1;
  END IF;

  -- Upsert aggregate row
  INSERT INTO public.user_points (user_id, display_name, avatar_url, points, level, streak_days, last_active_at, updated_at)
  VALUES (_uid, _name, _avatar, _amount, GREATEST(1, (_amount / 250) + 1), _new_streak, now(), now())
  ON CONFLICT (user_id) DO UPDATE SET
    points = public.user_points.points + EXCLUDED.points,
    level = GREATEST(1, ((public.user_points.points + EXCLUDED.points) / 250) + 1),
    streak_days = _new_streak,
    last_active_at = now(),
    display_name = COALESCE(EXCLUDED.display_name, public.user_points.display_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.user_points.avatar_url),
    updated_at = now()
  RETURNING * INTO _row;

  RETURN _row;
END;
$$;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_points;
ALTER PUBLICATION supabase_realtime ADD TABLE public.point_events;
ALTER TABLE public.user_points REPLICA IDENTITY FULL;
ALTER TABLE public.point_events REPLICA IDENTITY FULL;
