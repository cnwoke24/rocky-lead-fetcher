-- Create clinics table
CREATE TABLE public.clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  airtable_base_id text NOT NULL UNIQUE,
  airtable_table_name text NOT NULL DEFAULT 'Calls',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on clinics
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

-- Add clinic_id to profiles table FIRST
ALTER TABLE public.profiles 
ADD COLUMN clinic_id uuid REFERENCES public.clinics(id) ON DELETE SET NULL;

CREATE INDEX idx_profiles_clinic_id ON public.profiles(clinic_id);

-- Add clinic_id to other tables
ALTER TABLE public.agent_status
ADD COLUMN clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE;

CREATE INDEX idx_agent_status_clinic_id ON public.agent_status(clinic_id);

ALTER TABLE public.agreements
ADD COLUMN clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE;

CREATE INDEX idx_agreements_clinic_id ON public.agreements(clinic_id);

ALTER TABLE public.billing_history
ADD COLUMN clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE;

CREATE INDEX idx_billing_history_clinic_id ON public.billing_history(clinic_id);

ALTER TABLE public.daily_summaries
ADD COLUMN clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE;

CREATE INDEX idx_daily_summaries_clinic_id ON public.daily_summaries(clinic_id);

-- NOW add RLS policies for clinics (after clinic_id exists in profiles)
CREATE POLICY "Admins can view all clinics"
  ON public.clinics
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert clinics"
  ON public.clinics
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all clinics"
  ON public.clinics
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete clinics"
  ON public.clinics
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own clinic"
  ON public.clinics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.clinic_id = clinics.id
    )
  );

-- Trigger for updated_at on clinics
CREATE TRIGGER update_clinics_updated_at
  BEFORE UPDATE ON public.clinics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();