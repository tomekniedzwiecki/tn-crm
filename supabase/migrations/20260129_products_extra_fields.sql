-- Extra product fields: orders sold count and store name
ALTER TABLE workflow_products ADD COLUMN IF NOT EXISTS orders_sold INT;
ALTER TABLE workflow_products ADD COLUMN IF NOT EXISTS store_name TEXT;
