-- =====================================================
-- WhatsApp Follow-ups - wygenerowane wiadomości do wysłania
-- =====================================================

CREATE TABLE IF NOT EXISTS whatsapp_followups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Powiązanie z leadem
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    contact_name TEXT,

    -- Wygenerowana wiadomość
    message_text TEXT NOT NULL,

    -- Status follow-upu
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'skipped')),

    -- Kontekst generowania
    lead_status TEXT,                    -- Status leada w momencie generowania
    hours_since_contact INTEGER,         -- Ile godzin od ostatniego kontaktu

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,

    -- Kto wygenerował
    generated_by TEXT                    -- 'maciek' lub 'tomek'
);

-- Indeksy
CREATE INDEX IF NOT EXISTS idx_whatsapp_followups_lead ON whatsapp_followups(lead_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_followups_status ON whatsapp_followups(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_followups_created ON whatsapp_followups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_followups_phone ON whatsapp_followups(phone_number);

-- RLS
ALTER TABLE whatsapp_followups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage whatsapp_followups"
    ON whatsapp_followups FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to whatsapp_followups"
    ON whatsapp_followups FOR ALL TO service_role USING (true) WITH CHECK (true);
