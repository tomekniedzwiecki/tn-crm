-- Lead activities timeline
--
-- Tabela do śledzenia aktywności leada poza workflow (kontakty, akcje klienta
-- na publicznych stronach jak /p/:token, /p2/:token, /projekt/:token, etc.).
--
-- Kontekst: kod w lead.html, client-offer.html, client-offer-v2.html,
-- offer-starter.html robi już insert do `lead_activities`, ale tabela nigdy
-- nie została utworzona — insert'y cicho failowały. Ta migracja naprawia.
--
-- Typy eventów (rosnące, nie enum dla elastyczności):
--   - 'proforma'           — klient pobrał proformę PDF
--   - 'checkout_started'   — klient kliknął "Rezerwuję miejsce / Opłacam całość / Opłacam pozostałość"
--   - 'note'               — ręczna notatka handlowca
--   - 'call', 'email', 'meeting' — kontakty (przyszłość)

CREATE TABLE IF NOT EXISTS lead_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,

    type TEXT NOT NULL,
    description TEXT NOT NULL,

    -- Kto wykonał (NULL gdy klient na public page)
    performed_by UUID REFERENCES team_members(id) ON DELETE SET NULL,
    performed_by_name TEXT,

    metadata JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id    ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created_at ON lead_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_activities_type       ON lead_activities(type);

-- RLS
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

-- Authenticated (CRM admin) ma pełny dostęp
DROP POLICY IF EXISTS "auth_full_access_lead_activities" ON lead_activities;
CREATE POLICY "auth_full_access_lead_activities"
    ON lead_activities FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Anon może INSERT — używane przez publiczne strony oferty (klient kliknął CTA)
-- Brak SELECT/UPDATE/DELETE dla anon (klient nie powinien czytać własnej historii ani modyfikować)
DROP POLICY IF EXISTS "anon_can_insert_lead_activities" ON lead_activities;
CREATE POLICY "anon_can_insert_lead_activities"
    ON lead_activities FOR INSERT
    TO anon
    WITH CHECK (true);

COMMENT ON TABLE lead_activities IS
    'Timeline aktywności leada — eventy z public pages (proforma, checkout_started) i ręczne notatki/kontakty.';

COMMENT ON COLUMN lead_activities.type IS
    'Typ eventu: proforma, checkout_started, note, call, email, meeting, etc. Bez CHECK — elastycznie.';

COMMENT ON COLUMN lead_activities.metadata IS
    'Kontekst eventu (offer_id, checkout_type, amount, page_version, user_agent, url, etc.).';
