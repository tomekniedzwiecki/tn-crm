-- Add view_history column to client_offers for tracking all offer view timestamps
ALTER TABLE client_offers ADD COLUMN IF NOT EXISTS view_history JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN client_offers.view_history IS 'Array of ISO timestamps when the offer was viewed by the client';
