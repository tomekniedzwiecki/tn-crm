-- Add invoice_token column to orders table for public invoice view URL
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_token TEXT;

-- Add comment
COMMENT ON COLUMN orders.invoice_token IS 'Token from Fakturownia for public invoice view URL';
