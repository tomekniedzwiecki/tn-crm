-- =====================================================
-- ADD: Landing page connected status to workflow_takedrop
-- =====================================================
-- New field to track when admin has moved the landing page to TakeDrop
-- =====================================================

ALTER TABLE workflow_takedrop
ADD COLUMN IF NOT EXISTS landing_page_connected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS landing_page_connected_at TIMESTAMPTZ;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
