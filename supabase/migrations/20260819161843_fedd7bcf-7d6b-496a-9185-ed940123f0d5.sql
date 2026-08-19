CREATE TABLE public.workflows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Untitled workflow',
  status text NOT NULL DEFAULT 'draft',
  agent_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  graph jsonb NOT NULL DEFAULT '{"nodes":[],"edges":[]}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflows TO authenticated;
GRANT ALL ON public.workflows TO service_role;

ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own workflows"
ON public.workflows FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all workflows"
ON public.workflows FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_workflows_updated_at
BEFORE UPDATE ON public.workflows
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();