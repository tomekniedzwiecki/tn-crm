-- Make workflow_id nullable so products can be global (not tied to a workflow)
ALTER TABLE workflow_products ALTER COLUMN workflow_id DROP NOT NULL;

-- Add selected_product_id to workflows table
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS selected_product_id UUID REFERENCES workflow_products(id);

COMMENT ON COLUMN workflows.selected_product_id IS 'Product selected by client from global catalog';
