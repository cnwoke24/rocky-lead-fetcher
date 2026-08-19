REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE POLICY "Users can insert their own agent status"
ON public.agent_status FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent status"
ON public.agent_status FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "No direct client inserts on page_visits"
ON public.page_visits FOR INSERT TO anon, authenticated
WITH CHECK (false);

REVOKE INSERT, UPDATE, DELETE ON public.page_visits FROM anon, authenticated;
GRANT ALL ON public.page_visits TO service_role;