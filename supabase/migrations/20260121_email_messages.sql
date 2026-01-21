-- =============================================
-- EMAIL MESSAGES - Historia wszystkich emaili
-- =============================================
-- Przechowuje wszystkie wysłane i odebrane emaile
-- powiązane z leadami i kontaktami outreach

CREATE TABLE IF NOT EXISTS email_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Kierunek
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),

    -- Adresy
    from_email TEXT NOT NULL,
    from_name TEXT,
    to_email TEXT NOT NULL,
    to_name TEXT,
    reply_to TEXT,

    -- Treść
    subject TEXT,
    body_text TEXT,
    body_html TEXT,

    -- Powiązania (opcjonalne)
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    outreach_send_id UUID REFERENCES outreach_sends(id) ON DELETE SET NULL,
    outreach_contact_id UUID REFERENCES outreach_contacts(id) ON DELETE SET NULL,

    -- Metadane
    resend_id TEXT,                    -- ID z Resend (wysyłka)
    resend_message_id TEXT,            -- Message-ID z Resend (inbound)
    in_reply_to TEXT,                  -- Message-ID emaila na który to odpowiedź

    -- Statusy
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'bounced', 'failed', 'received')),

    -- Timestamps
    sent_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeksy
CREATE INDEX idx_email_messages_lead_id ON email_messages(lead_id);
CREATE INDEX idx_email_messages_from_email ON email_messages(from_email);
CREATE INDEX idx_email_messages_to_email ON email_messages(to_email);
CREATE INDEX idx_email_messages_outreach_send_id ON email_messages(outreach_send_id);
CREATE INDEX idx_email_messages_direction ON email_messages(direction);
CREATE INDEX idx_email_messages_created_at ON email_messages(created_at DESC);
CREATE INDEX idx_email_messages_in_reply_to ON email_messages(in_reply_to);

-- RLS
ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view all email messages"
    ON email_messages FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Team members can insert email messages"
    ON email_messages FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Service role full access to email messages"
    ON email_messages FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Funkcja do automatycznego powiązania z leadem po adresie email
CREATE OR REPLACE FUNCTION link_email_to_lead()
RETURNS TRIGGER AS $$
BEGIN
    -- Dla inbound - szukaj leada po from_email
    IF NEW.direction = 'inbound' AND NEW.lead_id IS NULL THEN
        SELECT id INTO NEW.lead_id
        FROM leads
        WHERE email = NEW.from_email
        LIMIT 1;
    END IF;

    -- Dla outbound - szukaj leada po to_email
    IF NEW.direction = 'outbound' AND NEW.lead_id IS NULL THEN
        SELECT id INTO NEW.lead_id
        FROM leads
        WHERE email = NEW.to_email
        LIMIT 1;
    END IF;

    -- Powiąż z outreach_contact jeśli istnieje
    IF NEW.outreach_contact_id IS NULL THEN
        SELECT id INTO NEW.outreach_contact_id
        FROM outreach_contacts
        WHERE email = CASE WHEN NEW.direction = 'inbound' THEN NEW.from_email ELSE NEW.to_email END
        LIMIT 1;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_link_email_to_lead
    BEFORE INSERT ON email_messages
    FOR EACH ROW
    EXECUTE FUNCTION link_email_to_lead();

-- Funkcja do oznaczania outreach_sends jako replied
CREATE OR REPLACE FUNCTION mark_outreach_replied()
RETURNS TRIGGER AS $$
BEGIN
    -- Jeśli to inbound email i mamy outreach_contact
    IF NEW.direction = 'inbound' AND NEW.outreach_contact_id IS NOT NULL THEN
        -- Znajdź aktywne wysyłki dla tego kontaktu i oznacz jako replied
        UPDATE outreach_sends
        SET status = 'replied',
            replied_at = COALESCE(NEW.received_at, NOW())
        WHERE contact_id = NEW.outreach_contact_id
          AND status IN ('sent', 'followed_up')
          AND replied_at IS NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_mark_outreach_replied
    AFTER INSERT ON email_messages
    FOR EACH ROW
    EXECUTE FUNCTION mark_outreach_replied();
