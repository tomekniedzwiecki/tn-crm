-- Add fbp (Facebook browser pixel) column to lead_tracking
-- This stores the _fbp cookie value for better Meta conversion matching

ALTER TABLE lead_tracking ADD COLUMN IF NOT EXISTS fbp TEXT;

COMMENT ON COLUMN lead_tracking.fbp IS 'Facebook browser pixel cookie (_fbp) for conversion matching';
