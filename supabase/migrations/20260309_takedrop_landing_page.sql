-- =====================================================
-- ADD: Landing page fields to workflow_takedrop
-- =====================================================
-- New fields to track landing page connection to TakeDrop
-- =====================================================

ALTER TABLE workflow_takedrop
ADD COLUMN IF NOT EXISTS landing_page_connected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS landing_page_connected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS checkout_link TEXT,
ADD COLUMN IF NOT EXISTS domain TEXT,
ADD COLUMN IF NOT EXISTS domain_connected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS domain_connected_at TIMESTAMPTZ;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
