-- Add manual_source column to orders for overriding auto-detected source
ALTER TABLE orders ADD COLUMN IF NOT EXISTS manual_source TEXT;

COMMENT ON COLUMN orders.manual_source IS 'Manual override for traffic source (google, youtube, meta, tiktok, email, organic)';
