-- Add WhatsApp contact tracking to leads table
-- This tracks when a salesperson clicked the WhatsApp button to contact the lead

ALTER TABLE leads ADD COLUMN IF NOT EXISTS whatsapp_contacted_at TIMESTAMPTZ;

-- Index for filtering by WhatsApp contact status
CREATE INDEX IF NOT EXISTS idx_leads_whatsapp_contacted ON leads(whatsapp_contacted_at);

COMMENT ON COLUMN leads.whatsapp_contacted_at IS 'Timestamp when WhatsApp button was clicked to contact this lead';
