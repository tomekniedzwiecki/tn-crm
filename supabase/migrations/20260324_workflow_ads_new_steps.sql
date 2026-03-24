-- =============================================
-- ADD NEW ETAP 4 STEPS TO workflow_ads
-- =============================================
-- 3. Kampania (campaign launch)
-- 4. Raport (results report)
-- 5. Skalowanie (scaling phase)

ALTER TABLE workflow_ads
ADD COLUMN IF NOT EXISTS campaign_launched BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS campaign_launched_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS report_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS report_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS scaling_started BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS scaling_started_at TIMESTAMPTZ;

-- Comments
COMMENT ON COLUMN workflow_ads.campaign_launched IS 'Admin marked campaign as launched';
COMMENT ON COLUMN workflow_ads.campaign_launched_at IS 'When campaign was launched';
COMMENT ON COLUMN workflow_ads.report_sent IS 'Admin sent results report to client';
COMMENT ON COLUMN workflow_ads.report_sent_at IS 'When report was sent';
COMMENT ON COLUMN workflow_ads.scaling_started IS 'Scaling phase has started';
COMMENT ON COLUMN workflow_ads.scaling_started_at IS 'When scaling started';
