-- Add budget_funded field to workflow_ads
-- Client confirms they funded their Meta Ads account

ALTER TABLE workflow_ads
ADD COLUMN IF NOT EXISTS budget_funded BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS budget_funded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS budget_amount INTEGER DEFAULT 1000;

-- Comments
COMMENT ON COLUMN workflow_ads.budget_funded IS 'Client confirmed they funded their ad account';
COMMENT ON COLUMN workflow_ads.budget_funded_at IS 'When client confirmed budget funding';
COMMENT ON COLUMN workflow_ads.budget_amount IS 'Amount in PLN that client funded';
