-- =============================================
-- ADD AD ACCOUNT ID AND MANUS TRACKING TO workflow_ads
-- =============================================
-- Meta Ads Account ID and Manus task tracking for integration

ALTER TABLE workflow_ads
ADD COLUMN IF NOT EXISTS meta_ad_account_id TEXT,
ADD COLUMN IF NOT EXISTS manus_task_id TEXT,
ADD COLUMN IF NOT EXISTS manus_task_status TEXT,
ADD COLUMN IF NOT EXISTS manus_task_created_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS manus_task_error TEXT;

COMMENT ON COLUMN workflow_ads.meta_ad_account_id IS 'Meta Ads Account ID (e.g. act_123456789) for Manus integration';
COMMENT ON COLUMN workflow_ads.manus_task_id IS 'Current Manus task ID for fetching ads data';
COMMENT ON COLUMN workflow_ads.manus_task_status IS 'Status: pending, running, completed, failed';
COMMENT ON COLUMN workflow_ads.manus_task_created_at IS 'When Manus task was created';
COMMENT ON COLUMN workflow_ads.manus_task_error IS 'Error message if task failed';
