
DROP POLICY IF EXISTS "Users can update own points row" ON public.user_points;
CREATE POLICY "Users can update own points row"
ON public.user_points FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
