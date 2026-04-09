-- =============================================
-- ADD INSTAGRAM ACCESS TO workflow_ads
-- =============================================
-- Step 3 now has three sub-steps:
-- 3a: Ad account partner access (existing)
-- 3b: Fanpage partner access (existing)
-- 3c: Instagram profile partner access (new)

ALTER TABLE workflow_ads
ADD COLUMN IF NOT EXISTS instagram_access_granted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS instagram_access_granted_at TIMESTAMPTZ;

-- Comments
COMMENT ON COLUMN workflow_ads.instagram_access_granted IS 'Client confirmed they added partner access to Instagram profile';
COMMENT ON COLUMN workflow_ads.instagram_access_granted_at IS 'When client confirmed Instagram partner access';
