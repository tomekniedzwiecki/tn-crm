-- Add deadline_resets column to workflows
-- Stores reset dates per step: {"contract": "2026-03-13", "branding": "2026-03-10"}
-- When a step has a reset date, deadline is calculated from that date instead of original start

ALTER TABLE workflows ADD COLUMN IF NOT EXISTS deadline_resets JSONB DEFAULT '{}';

COMMENT ON COLUMN workflows.deadline_resets IS 'Reset dates per step for deadline calculation. Format: {"step_key": "YYYY-MM-DD"}';
