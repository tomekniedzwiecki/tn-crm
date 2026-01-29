-- Product images gallery
CREATE TABLE IF NOT EXISTS product_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES workflow_products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_main BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- Wholesale price + rating on workflow_products
ALTER TABLE workflow_products ADD COLUMN IF NOT EXISTS wholesale_price NUMERIC(10,2);
ALTER TABLE workflow_products ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1);
ALTER TABLE workflow_products ADD COLUMN IF NOT EXISTS review_count INT;
