-- Full Manus campaign (research + copy + creatives in one task)
ALTER TABLE workflow_ads
ADD COLUMN IF NOT EXISTS manus_full_task_id TEXT,
ADD COLUMN IF NOT EXISTS manus_full_completed_at TIMESTAMPTZ;

COMMENT ON COLUMN workflow_ads.manus_full_task_id IS 'Single Manus task covering research + copy + creatives generation';
