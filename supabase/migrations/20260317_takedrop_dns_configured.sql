-- =============================================
-- ADD DNS_CONFIGURED TO WORKFLOW_TAKEDROP
-- =============================================
-- Toggle for tracking if DNS has been configured

ALTER TABLE workflow_takedrop
ADD COLUMN IF NOT EXISTS dns_configured BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN workflow_takedrop.dns_configured IS 'Whether DNS has been configured for landing page';
