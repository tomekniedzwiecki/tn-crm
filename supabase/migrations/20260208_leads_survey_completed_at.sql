-- Migration: Add survey_completed_at column to track form submissions
-- This is separate from updated_at - only updated when survey form is submitted

-- Add survey_completed_at column
ALTER TABLE leads ADD COLUMN IF NOT EXISTS survey_completed_at TIMESTAMPTZ;

-- Set initial value for leads that have survey data
UPDATE leads
SET survey_completed_at = COALESCE(updated_at, created_at)
WHERE weekly_hours IS NOT NULL
  AND survey_completed_at IS NULL;

-- Index for sorting
CREATE INDEX IF NOT EXISTS idx_leads_survey_completed_at ON leads(survey_completed_at DESC NULLS LAST);

COMMENT ON COLUMN leads.survey_completed_at IS 'Data ostatniego wypełnienia formularza ankiety';

-- Remove the updated_at trigger since we don't need automatic updates
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
