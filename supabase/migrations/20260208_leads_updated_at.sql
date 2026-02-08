-- Migration: Add updated_at column to leads table
-- This allows tracking when lead data was last updated (e.g., survey answers filled later)

-- Add updated_at column
ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create trigger to automatically update updated_at on any update
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Set updated_at = created_at for existing leads that haven't been updated
UPDATE leads SET updated_at = created_at WHERE updated_at IS NULL;

-- Index for sorting by updated_at
CREATE INDEX IF NOT EXISTS idx_leads_updated_at ON leads(updated_at DESC);

COMMENT ON COLUMN leads.updated_at IS 'Data ostatniej aktualizacji leada (np. gdy uzupełniono ankietę)';
