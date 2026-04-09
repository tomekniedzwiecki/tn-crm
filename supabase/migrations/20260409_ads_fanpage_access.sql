-- =============================================
-- ADD FANPAGE ACCESS TO workflow_ads
-- =============================================
-- Step 3 now has two sub-steps:
-- 3a: Ad account partner access (existing)
-- 3b: Fanpage partner access (new)

ALTER TABLE workflow_ads
ADD COLUMN IF NOT EXISTS fanpage_access_granted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fanpage_access_granted_at TIMESTAMPTZ;

-- Comments
COMMENT ON COLUMN workflow_ads.fanpage_access_granted IS 'Client confirmed they added partner access to fanpage';
COMMENT ON COLUMN workflow_ads.fanpage_access_granted_at IS 'When client confirmed fanpage partner access';
