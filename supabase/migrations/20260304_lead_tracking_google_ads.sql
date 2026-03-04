-- Add Google Ads campaign detail columns to lead_tracking
-- For YouTube and other campaign type tracking

-- Network type: g=search, s=search partner, d=display, v=video (YouTube)
ALTER TABLE lead_tracking ADD COLUMN IF NOT EXISTS network TEXT;

-- Campaign details from Google Ads ValueTrack parameters
ALTER TABLE lead_tracking ADD COLUMN IF NOT EXISTS campaignid TEXT;
ALTER TABLE lead_tracking ADD COLUMN IF NOT EXISTS adgroupid TEXT;
ALTER TABLE lead_tracking ADD COLUMN IF NOT EXISTS creative TEXT;
ALTER TABLE lead_tracking ADD COLUMN IF NOT EXISTS placement TEXT;
ALTER TABLE lead_tracking ADD COLUMN IF NOT EXISTS device TEXT;
ALTER TABLE lead_tracking ADD COLUMN IF NOT EXISTS keyword TEXT;

-- Additional UTM fields
ALTER TABLE lead_tracking ADD COLUMN IF NOT EXISTS utm_content TEXT;
ALTER TABLE lead_tracking ADD COLUMN IF NOT EXISTS utm_term TEXT;

-- Comments
COMMENT ON COLUMN lead_tracking.network IS 'Google Ads network: g=search, s=search partner, d=display, v=video/YouTube';
COMMENT ON COLUMN lead_tracking.campaignid IS 'Google Ads campaign ID from {campaignid}';
COMMENT ON COLUMN lead_tracking.adgroupid IS 'Google Ads ad group ID from {adgroupid}';
COMMENT ON COLUMN lead_tracking.creative IS 'Google Ads creative/ad ID from {creative}';
COMMENT ON COLUMN lead_tracking.placement IS 'Placement where ad was shown (YouTube channel, website, etc.)';
COMMENT ON COLUMN lead_tracking.device IS 'Device type: m=mobile, c=computer, t=tablet';
COMMENT ON COLUMN lead_tracking.keyword IS 'Search keyword that triggered the ad';
COMMENT ON COLUMN lead_tracking.utm_content IS 'UTM content parameter for A/B testing';
COMMENT ON COLUMN lead_tracking.utm_term IS 'UTM term parameter for paid keywords';
