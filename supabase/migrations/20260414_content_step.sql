-- Content step (Etap 4) — between budget and campaign
-- Groups: competitor research, ad copy, ad creatives (previously under campaign tab)

ALTER TABLE workflow_ads
ADD COLUMN IF NOT EXISTS content_ready BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS content_ready_at TIMESTAMPTZ;

COMMENT ON COLUMN workflow_ads.content_ready IS 'Content (research + copy + creatives) is ready — auto-set when campaign_pipeline completes successfully';
COMMENT ON COLUMN workflow_ads.content_ready_at IS 'When content was marked ready';

-- Backfill: workflows that already have completed pipeline are "content_ready"
UPDATE workflow_ads SET
  content_ready = TRUE,
  content_ready_at = manus_full_completed_at
WHERE campaign_pipeline_status = 'completed'
  AND ad_creatives IS NOT NULL
  AND jsonb_array_length(ad_creatives) > 0;
