-- Restrict agreements table to authenticated users only
CREATE POLICY "Require authentication for agreements"
ON public.agreements
FOR ALL
TO anon
USING (false);

-- Restrict user_roles table to authenticated users only
CREATE POLICY "Require authentication for user_roles"
ON public.user_roles
FOR ALL
TO anon
USING (false);