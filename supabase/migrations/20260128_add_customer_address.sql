-- Add customer_address column to orders table for invoice data
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS customer_address jsonb;

-- Comment
COMMENT ON COLUMN orders.customer_address IS 'Customer address for invoicing: {street, postal_code, city}';
