-- =============================================
-- ADD PARTNER ACCESS AND BUDGET COLUMNS TO WORKFLOW_ADS
-- =============================================

-- Add partner_access_granted columns
ALTER TABLE workflow_ads ADD COLUMN IF NOT EXISTS partner_access_granted BOOLEAN DEFAULT FALSE;
ALTER TABLE workflow_ads ADD COLUMN IF NOT EXISTS partner_access_granted_at TIMESTAMPTZ;

-- Add budget_funded columns
ALTER TABLE workflow_ads ADD COLUMN IF NOT EXISTS budget_funded BOOLEAN DEFAULT FALSE;
ALTER TABLE workflow_ads ADD COLUMN IF NOT EXISTS budget_funded_at TIMESTAMPTZ;

-- Comments
COMMENT ON COLUMN workflow_ads.partner_access_granted IS 'Klient potwierdził dodanie partnera w Business Manager';
COMMENT ON COLUMN workflow_ads.budget_funded IS 'Klient potwierdził doładowanie konta reklamowego';
