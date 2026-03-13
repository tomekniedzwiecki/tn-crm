-- Add payment gateway columns to workflow_takedrop
ALTER TABLE workflow_takedrop
ADD COLUMN IF NOT EXISTS payment_gateway_type TEXT, -- 'payu' or 'stripe'
ADD COLUMN IF NOT EXISTS payment_gateway_ready BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payment_gateway_credentials JSONB, -- login credentials from client
ADD COLUMN IF NOT EXISTS payment_gateway_configured_at TIMESTAMPTZ;

-- Comments
COMMENT ON COLUMN workflow_takedrop.payment_gateway_type IS 'Type of payment gateway: payu (business with NIP) or stripe (individual)';
COMMENT ON COLUMN workflow_takedrop.payment_gateway_ready IS 'Whether payment gateway is fully configured by admin';
COMMENT ON COLUMN workflow_takedrop.payment_gateway_credentials IS 'Login credentials provided by client (email, password)';
COMMENT ON COLUMN workflow_takedrop.payment_gateway_configured_at IS 'When admin finished configuring the gateway';
