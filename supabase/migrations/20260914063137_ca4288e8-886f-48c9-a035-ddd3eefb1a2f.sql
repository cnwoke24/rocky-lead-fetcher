CREATE TABLE public.demo_customers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL DEFAULT '',
  phone_number text NOT NULL,
  email text,
  vehicle_year text NOT NULL DEFAULT '',
  vehicle_make text NOT NULL DEFAULT '',
  vehicle_model text NOT NULL DEFAULT '',
  completed_visits integer NOT NULL DEFAULT 1,
  current_visit_stage text NOT NULL DEFAULT 'Visit 1',
  last_visit_date text NOT NULL DEFAULT '',
  last_service text NOT NULL DEFAULT '',
  recommended_service text NOT NULL DEFAULT '',
  loyalty_credit text NOT NULL DEFAULT '$0.00',
  campaign_goal text NOT NULL DEFAULT '',
  reason_for_call text NOT NULL DEFAULT '',
  offer_description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.demo_customers TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.demo_customers TO authenticated;
GRANT ALL ON public.demo_customers TO service_role;

ALTER TABLE public.demo_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view demo customers"
ON public.demo_customers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert demo customers"
ON public.demo_customers FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update demo customers"
ON public.demo_customers FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete demo customers"
ON public.demo_customers FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_demo_customers_updated_at
BEFORE UPDATE ON public.demo_customers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.demo_customers (
  slug, first_name, last_name, phone_number, email,
  vehicle_year, vehicle_make, vehicle_model,
  completed_visits, current_visit_stage, last_visit_date,
  last_service, recommended_service, loyalty_credit,
  campaign_goal, reason_for_call, offer_description
) VALUES (
  'bob', 'Bob', 'Hensley', '+17175550162', 'bob.hensley@example.com',
  '2020', 'Toyota', 'Tacoma',
  3, 'Visit 3', '92 days ago',
  'Oil Change + Multi-Point Inspection', 'Tire Rotation', '$34.75',
  'Get Visit 4',
  'It has been about 92 days since Bob''s last visit and he is at the Visit 3 priority retention stage.',
  'A tire rotation with $34.75 in loyalty credit applied toward the service.'
);