-- =============================================
-- Contract Management Fields
-- =============================================

-- Add client personal data fields to workflows
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS client_street TEXT;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS client_city TEXT;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS client_postal_code TEXT;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS client_country TEXT DEFAULT 'Polska';
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS client_pesel TEXT;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS client_id_number TEXT;

-- Contract status tracking
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS contract_status TEXT DEFAULT 'pending_data'
    CHECK (contract_status IN ('pending_data', 'data_filled', 'contract_sent', 'pending_signature', 'signed', 'rejected'));
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS contract_data_filled_at TIMESTAMPTZ;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS contract_signed_at TIMESTAMPTZ;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS contract_signature_type TEXT
    CHECK (contract_signature_type IN ('zaufany', 'kwalifikowany', 'fizyczny'));
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS contract_file_url TEXT;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS contract_signed_file_url TEXT;

-- Add contract template to offers
ALTER TABLE offers ADD COLUMN IF NOT EXISTS contract_template TEXT;

-- Index for contract status queries
CREATE INDEX IF NOT EXISTS idx_workflows_contract_status ON workflows(contract_status);

-- Update existing workflows to have pending_data status
UPDATE workflows SET contract_status = 'pending_data' WHERE contract_status IS NULL;
