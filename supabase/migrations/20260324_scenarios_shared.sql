-- Add scenarios_shared_at column to workflow_video table
-- This tracks when scenarios were shared with the client

ALTER TABLE workflow_video
ADD COLUMN IF NOT EXISTS scenarios_shared_at timestamptz DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN workflow_video.scenarios_shared_at IS 'When scenarios were shared with the client (triggers email notification)';
