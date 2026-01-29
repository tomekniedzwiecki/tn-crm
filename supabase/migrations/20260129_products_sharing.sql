-- Allow admin to share products with client
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS products_shared_at TIMESTAMPTZ;
