CREATE TABLE public.demo_call_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id text NOT NULL UNIQUE,
  customer_slug text,
  agent_id text,
  from_number text,
  to_number text,
  call_status text,
  outcome text,
  duration_seconds integer,
  summary text,
  transcript text,
  recording_url text,
  sentiment text,
  disconnection_reason text,
  raw jsonb,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.demo_call_results TO authenticated;
GRANT ALL ON public.demo_call_results TO service_role;

ALTER TABLE public.demo_call_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view demo call results"
ON public.demo_call_results FOR SELECT TO authenticated USING (true);

CREATE TRIGGER update_demo_call_results_updated_at
BEFORE UPDATE ON public.demo_call_results
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();