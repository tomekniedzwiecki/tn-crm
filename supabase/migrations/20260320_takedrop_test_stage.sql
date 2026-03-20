-- Add test stage columns to workflow_takedrop
-- This stage allows client to review the entire shop before going live

ALTER TABLE workflow_takedrop
ADD COLUMN IF NOT EXISTS test_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS test_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS test_feedback_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS test_feedback_sent_at TIMESTAMPTZ;

-- Comments
COMMENT ON COLUMN workflow_takedrop.test_accepted IS 'Client accepted the shop without changes';
COMMENT ON COLUMN workflow_takedrop.test_accepted_at IS 'When client accepted';
COMMENT ON COLUMN workflow_takedrop.test_feedback_sent IS 'Client sent feedback via email';
COMMENT ON COLUMN workflow_takedrop.test_feedback_sent_at IS 'When client sent feedback';
