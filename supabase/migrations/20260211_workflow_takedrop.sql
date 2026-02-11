-- =============================================
-- WORKFLOW TAKEDROP ACCOUNTS
-- =============================================
-- Tabela do przechowywania danych konta TakeDrop dla workflow
-- Etap 2: Konfiguracja konta dropshipping

CREATE TABLE IF NOT EXISTS workflow_takedrop (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,

    -- Dane konta (widoczne tylko dla admina)
    account_email TEXT,
    account_password TEXT,

    -- Status aktywacji (admin musi ręcznie aktywować)
    is_active BOOLEAN DEFAULT FALSE,
    activated_at TIMESTAMPTZ,

    -- Status konta klienta
    account_created BOOLEAN DEFAULT FALSE,
    account_created_at TIMESTAMPTZ,

    -- Metadane
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(workflow_id)
);

-- Indeks dla szybkiego wyszukiwania
CREATE INDEX IF NOT EXISTS idx_workflow_takedrop_workflow ON workflow_takedrop(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_takedrop_active ON workflow_takedrop(is_active) WHERE is_active = TRUE;

-- RLS Policies
ALTER TABLE workflow_takedrop ENABLE ROW LEVEL SECURITY;

-- Admin ma pełny dostęp
CREATE POLICY "Admin full access takedrop" ON workflow_takedrop
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Klient widzi tylko aktywowane rekordy (bez hasła)
CREATE POLICY "Client read active takedrop" ON workflow_takedrop
    FOR SELECT TO anon USING (is_active = TRUE);

-- Trigger do aktualizacji updated_at
CREATE OR REPLACE FUNCTION update_workflow_takedrop_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workflow_takedrop_updated_at
    BEFORE UPDATE ON workflow_takedrop
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_takedrop_updated_at();

-- Dodaj trigger 'takedrop_activated' do dozwolonych triggerów automatyzacji
-- (constraint zaktualizowany w migracji 20260211_takedrop_email_template.sql)

COMMENT ON TABLE workflow_takedrop IS 'Dane konta TakeDrop dla workflow - etap 2';
COMMENT ON COLUMN workflow_takedrop.is_active IS 'Admin musi ręcznie aktywować aby klient widział tę zakładkę';
COMMENT ON COLUMN workflow_takedrop.account_password IS 'Hasło - widoczne tylko dla admina (RLS blokuje dla anon)';
