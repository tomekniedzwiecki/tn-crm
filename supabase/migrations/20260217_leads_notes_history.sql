-- Add notes_history column to leads table
-- This stores an array of note objects in JSONB format

ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes_history JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN leads.notes_history IS 'Array of note objects with content, created_at, lead_status, performed_by_name';
