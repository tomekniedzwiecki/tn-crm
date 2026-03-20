-- Add partner_access_granted field to workflow_ads
-- Client can mark that they added Tomek as partner

ALTER TABLE workflow_ads
ADD COLUMN IF NOT EXISTS partner_access_granted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS partner_access_granted_at TIMESTAMPTZ;

-- Allow anon to UPDATE partner_access_granted (client action)
CREATE POLICY "Client can grant partner access" ON workflow_ads
    FOR UPDATE TO anon
    USING (is_active = TRUE)
    WITH CHECK (is_active = TRUE);

-- Comments
COMMENT ON COLUMN workflow_ads.partner_access_granted IS 'Client confirmed they added partner access';
COMMENT ON COLUMN workflow_ads.partner_access_granted_at IS 'When client confirmed partner access';
