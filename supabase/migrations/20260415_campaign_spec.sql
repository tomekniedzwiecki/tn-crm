-- Campaign spec z Manusa: definicja kampanii + 2 ad sety (Meta Ads)
ALTER TABLE workflow_ads
ADD COLUMN IF NOT EXISTS campaign_spec JSONB,
ADD COLUMN IF NOT EXISTS campaign_spec_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS campaign_spec_requested_at TIMESTAMPTZ;

COMMENT ON COLUMN workflow_ads.campaign_spec IS 'Specyfikacja kampanii Meta Ads wygenerowana przez Manusa (campaign + ad_sets[]). Używana do eksportu XLSX Bulk Import.';
