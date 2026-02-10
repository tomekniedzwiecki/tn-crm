-- Add is_active field to workflow_products for enabling/disabling products in client selection
ALTER TABLE workflow_products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN workflow_products.is_active IS 'When false, product is hidden from client product selection view';

-- Set all existing products to active
UPDATE workflow_products SET is_active = TRUE WHERE is_active IS NULL;
