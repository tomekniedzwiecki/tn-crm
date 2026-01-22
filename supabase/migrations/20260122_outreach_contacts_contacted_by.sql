-- Add column to track which team member contacted via WhatsApp
ALTER TABLE outreach_contacts ADD COLUMN IF NOT EXISTS whatsapp_contacted_by UUID REFERENCES team_members(id) ON DELETE SET NULL;

-- Index for filtering by who contacted
CREATE INDEX IF NOT EXISTS idx_outreach_contacts_whatsapp_contacted_by ON outreach_contacts(whatsapp_contacted_by);

COMMENT ON COLUMN outreach_contacts.whatsapp_contacted_by IS 'ID of the team member who clicked the WhatsApp button to contact this customer';
