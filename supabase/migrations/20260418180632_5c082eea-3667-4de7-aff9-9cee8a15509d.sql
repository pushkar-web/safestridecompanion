
-- Badges table for gamification
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_type TEXT NOT NULL,
  badge_title TEXT NOT NULL,
  badge_description TEXT,
  badge_icon TEXT DEFAULT '🛡️',
  trip_id UUID,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges are publicly readable for leaderboard"
ON public.badges FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Users can insert own badges"
ON public.badges FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_badges_user ON public.badges(user_id);
CREATE INDEX idx_badges_earned ON public.badges(earned_at DESC);

-- User preferences for geofencing + notifications
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  dark_mode BOOLEAN DEFAULT false,
  geofence_alerts BOOLEAN DEFAULT true,
  time_alerts BOOLEAN DEFAULT true,
  community_digest BOOLEAN DEFAULT true,
  frequent_locations JSONB DEFAULT '[]'::jsonb,
  notification_radius_km DOUBLE PRECISION DEFAULT 2.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own preferences"
ON public.user_preferences FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own preferences"
ON public.user_preferences FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own preferences"
ON public.user_preferences FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
