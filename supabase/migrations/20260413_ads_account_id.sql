-- =============================================
-- ADD AD ACCOUNT ID TO workflow_ads
-- =============================================
-- Meta Ads Account ID needed for Manus integration

ALTER TABLE workflow_ads
ADD COLUMN IF NOT EXISTS meta_ad_account_id TEXT;

COMMENT ON COLUMN workflow_ads.meta_ad_account_id IS 'Meta Ads Account ID (e.g. act_123456789) for Manus integration';
