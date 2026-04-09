-- =============================================
-- ADD PHONE VERIFICATION TO workflow_ads
-- =============================================
-- Step 3 now has four sub-steps:
-- 3a: Ad account partner access
-- 3b: Fanpage partner access
-- 3c: Instagram profile partner access
-- 3d: Phone number verification in Meta Business Suite (new)

ALTER TABLE workflow_ads
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ;

-- Comments
COMMENT ON COLUMN workflow_ads.phone_verified IS 'Client confirmed they verified phone number in Meta Business Suite';
COMMENT ON COLUMN workflow_ads.phone_verified_at IS 'When client confirmed phone verification';
