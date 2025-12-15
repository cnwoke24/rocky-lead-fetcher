-- Add airtable_display_fields column to clinics table for dynamic field configuration
ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS airtable_display_fields jsonb DEFAULT '["Caller Name", "Phone Number", "Email Address", "Patient Type", "Call Status", "Call Summary", "Duration Seconds", "Needs Callback"]'::jsonb;