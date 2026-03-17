-- =============================================
-- ADD LANDING PAGE FIELDS TO WORKFLOW_TAKEDROP
-- =============================================

ALTER TABLE workflow_takedrop
ADD COLUMN IF NOT EXISTS dns_configured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS landing_url TEXT,
ADD COLUMN IF NOT EXISTS landing_status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS landing_active BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS landing_activated_at TIMESTAMPTZ;

COMMENT ON COLUMN workflow_takedrop.dns_configured IS 'Whether DNS has been configured for landing page';
COMMENT ON COLUMN workflow_takedrop.landing_active IS 'Whether landing page tab is visible to client';
