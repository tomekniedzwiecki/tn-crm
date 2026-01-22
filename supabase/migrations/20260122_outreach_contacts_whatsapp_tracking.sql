-- Add WhatsApp contact tracking to outreach_contacts table
-- This tracks when a salesperson clicked the WhatsApp button to contact this customer

ALTER TABLE outreach_contacts ADD COLUMN IF NOT EXISTS whatsapp_contacted_at TIMESTAMPTZ;

-- Index for filtering by WhatsApp contact status
CREATE INDEX IF NOT EXISTS idx_outreach_contacts_whatsapp_contacted ON outreach_contacts(whatsapp_contacted_at);

COMMENT ON COLUMN outreach_contacts.whatsapp_contacted_at IS 'Timestamp when WhatsApp button was clicked to contact this customer';
