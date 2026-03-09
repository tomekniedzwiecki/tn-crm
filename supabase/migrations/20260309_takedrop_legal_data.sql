-- Add legal data columns to workflow_takedrop
ALTER TABLE workflow_takedrop
ADD COLUMN IF NOT EXISTS legal_data JSONB,
ADD COLUMN IF NOT EXISTS legal_documents_ready BOOLEAN DEFAULT FALSE;

-- Add comment
COMMENT ON COLUMN workflow_takedrop.legal_data IS 'Legal documents data (brand_name, company_name, nip, regon, address, email, phone)';
COMMENT ON COLUMN workflow_takedrop.legal_documents_ready IS 'Whether client has submitted legal data for documents';
