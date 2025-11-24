-- Add Retell agent ID to clinics table for multi-tenant voice agent mapping
ALTER TABLE clinics 
ADD COLUMN retell_agent_id TEXT;

COMMENT ON COLUMN clinics.retell_agent_id IS 'Retell AI agent ID used for making calls for this clinic';