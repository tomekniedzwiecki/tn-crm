-- Extend workflow_products for AliExpress product proposals
ALTER TABLE workflow_products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE workflow_products ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE workflow_products ADD COLUMN IF NOT EXISTS price NUMERIC(10,2);
ALTER TABLE workflow_products ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE workflow_products ADD COLUMN IF NOT EXISTS selected_by_client BOOLEAN DEFAULT false;
ALTER TABLE workflow_products ADD COLUMN IF NOT EXISTS visible_to_client BOOLEAN DEFAULT true;

-- Update status CHECK to include 'proposal' and 'approved'
ALTER TABLE workflow_products DROP CONSTRAINT IF EXISTS workflow_products_status_check;
ALTER TABLE workflow_products ADD CONSTRAINT workflow_products_status_check
  CHECK (status IN ('proposal', 'approved', 'pending', 'in_production', 'shipped', 'delivered'));

-- Default new products to 'proposal'
ALTER TABLE workflow_products ALTER COLUMN status SET DEFAULT 'proposal';

COMMENT ON COLUMN workflow_products.image_url IS 'Product image URL (from AliExpress or uploaded)';
COMMENT ON COLUMN workflow_products.source_url IS 'AliExpress product page URL';
COMMENT ON COLUMN workflow_products.price IS 'Product price';
COMMENT ON COLUMN workflow_products.currency IS 'Price currency (USD, PLN, etc)';
COMMENT ON COLUMN workflow_products.selected_by_client IS 'Whether client selected this product';
COMMENT ON COLUMN workflow_products.visible_to_client IS 'Whether product is visible in client portal';
