ALTER TABLE public.demo_call_results
  ADD COLUMN IF NOT EXISTS visit_confirmed boolean,
  ADD COLUMN IF NOT EXISTS scheduled_visit text,
  ADD COLUMN IF NOT EXISTS next_follow_up_at timestamptz,
  ADD COLUMN IF NOT EXISTS follow_up_reason text,
  ADD COLUMN IF NOT EXISTS in_voicemail boolean;

ALTER TABLE public.demo_customers
  ADD COLUMN IF NOT EXISTS confirmed_visit_day text,
  ADD COLUMN IF NOT EXISTS confirmed_visit_at timestamptz,
  ADD COLUMN IF NOT EXISTS confirmed_follow_up_at timestamptz;