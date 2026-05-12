
-- Leads captured from gym funnel
CREATE TABLE public.gym_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  business_name TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gym_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all gym leads"
ON public.gym_leads FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage gym leads"
ON public.gym_leads FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Page visit tracking
CREATE TABLE public.page_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  first_visit_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_time_seconds INTEGER NOT NULL DEFAULT 0,
  UNIQUE (visitor_id, page_path)
);

ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all page visits"
ON public.page_visits FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage page visits"
ON public.page_visits FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_page_visits_path ON public.page_visits (page_path);
CREATE INDEX idx_gym_leads_created ON public.gym_leads (created_at DESC);
