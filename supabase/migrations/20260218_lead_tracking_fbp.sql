-- Add fbp (Facebook browser pixel) and ip columns to lead_tracking
-- For better Meta/TikTok conversion matching

ALTER TABLE lead_tracking ADD COLUMN IF NOT EXISTS fbp TEXT;
ALTER TABLE lead_tracking ADD COLUMN IF NOT EXISTS ip TEXT;

COMMENT ON COLUMN lead_tracking.fbp IS 'Facebook browser pixel cookie (_fbp) for conversion matching';
COMMENT ON COLUMN lead_tracking.ip IS 'Client IP address for conversion matching';
