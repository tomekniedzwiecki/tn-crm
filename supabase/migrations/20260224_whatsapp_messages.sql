-- =====================================================
-- WhatsApp Messages - historia rozmów z Chrome extension
-- =====================================================

CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identyfikacja rozmowy
    phone_number TEXT NOT NULL,           -- Numer telefonu (znormalizowany, np. "48123456789")
    contact_name TEXT,                    -- Nazwa kontaktu z WhatsApp

    -- Treść wiadomości
    message_text TEXT NOT NULL,
    message_timestamp TIMESTAMPTZ NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),

    -- Deduplikacja
    message_hash TEXT NOT NULL,           -- MD5(phone + timestamp + direction + text)

    -- Powiązanie z leadem (opcjonalne, wypełniane automatycznie)
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,

    -- Metadata
    synced_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unikalność - zapobiega duplikatom
    UNIQUE(phone_number, message_hash)
);

-- Indeksy
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone ON whatsapp_messages(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_lead ON whatsapp_messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_timestamp ON whatsapp_messages(message_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_synced ON whatsapp_messages(synced_at DESC);

-- RLS
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage whatsapp_messages"
    ON whatsapp_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to whatsapp_messages"
    ON whatsapp_messages FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =====================================================
-- Funkcja do normalizacji numeru telefonu
-- =====================================================

CREATE OR REPLACE FUNCTION normalize_phone_number(phone TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Usuń wszystko oprócz cyfr
    phone := regexp_replace(phone, '[^0-9]', '', 'g');

    -- Usuń wiodące 00 (międzynarodowe)
    phone := regexp_replace(phone, '^00', '');

    -- Jeśli zaczyna się od 48 i ma 11 cyfr, zostaw
    -- Jeśli ma 9 cyfr, dodaj 48
    IF length(phone) = 9 THEN
        phone := '48' || phone;
    END IF;

    RETURN phone;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- Funkcja do automatycznego dopasowania lead_id
-- =====================================================

CREATE OR REPLACE FUNCTION match_whatsapp_message_to_lead()
RETURNS TRIGGER AS $$
DECLARE
    matched_lead_id UUID;
BEGIN
    -- Szukaj leada po znormalizowanym numerze telefonu
    SELECT id INTO matched_lead_id
    FROM leads
    WHERE normalize_phone_number(phone) = NEW.phone_number
    LIMIT 1;

    NEW.lead_id := matched_lead_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_match_whatsapp_lead
    BEFORE INSERT ON whatsapp_messages
    FOR EACH ROW
    EXECUTE FUNCTION match_whatsapp_message_to_lead();

-- =====================================================
-- Tabela synchronizacji (ostatni sync per czat)
-- =====================================================

CREATE TABLE IF NOT EXISTS whatsapp_sync_status (
    phone_number TEXT PRIMARY KEY,
    last_message_timestamp TIMESTAMPTZ NOT NULL,
    last_synced_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE whatsapp_sync_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage whatsapp_sync_status"
    ON whatsapp_sync_status FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to whatsapp_sync_status"
    ON whatsapp_sync_status FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =====================================================
-- Widok: wiadomości z danymi leada
-- =====================================================

CREATE OR REPLACE VIEW whatsapp_conversations AS
SELECT
    wm.phone_number,
    wm.contact_name,
    wm.lead_id,
    l.email as lead_email,
    l.name as lead_name,
    l.status as lead_status,
    COUNT(*) as message_count,
    MAX(wm.message_timestamp) as last_message_at,
    SUM(CASE WHEN wm.direction = 'inbound' THEN 1 ELSE 0 END) as inbound_count,
    SUM(CASE WHEN wm.direction = 'outbound' THEN 1 ELSE 0 END) as outbound_count
FROM whatsapp_messages wm
LEFT JOIN leads l ON l.id = wm.lead_id
GROUP BY wm.phone_number, wm.contact_name, wm.lead_id, l.email, l.name, l.status
ORDER BY last_message_at DESC;
