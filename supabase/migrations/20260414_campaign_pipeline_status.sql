-- Pipeline status fields for background campaign generation
ALTER TABLE workflow_ads
ADD COLUMN IF NOT EXISTS campaign_pipeline_status TEXT DEFAULT 'idle',
ADD COLUMN IF NOT EXISTS campaign_pipeline_step TEXT,
ADD COLUMN IF NOT EXISTS campaign_pipeline_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS campaign_pipeline_completed_at TIMESTAMPTZ;

-- Status: idle | running | completed | failed
-- Step: research | copy | creatives | done

COMMENT ON COLUMN workflow_ads.campaign_pipeline_status IS 'Background pipeline status: idle, running, completed, failed';
COMMENT ON COLUMN workflow_ads.campaign_pipeline_step IS 'Current pipeline step: research, copy, creatives, done';
