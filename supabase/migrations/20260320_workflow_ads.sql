-- =============================================
-- WORKFLOW ADS (Etap 4)
-- =============================================
-- Tabela do przechowywania danych reklamowych dla workflow
-- Etap 4: Konfiguracja reklam

CREATE TABLE IF NOT EXISTS workflow_ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,

    -- Etap 4 aktywny (admin aktywuje gdy etap 3 zakończony)
    is_active BOOLEAN DEFAULT FALSE,
    activated_at TIMESTAMPTZ,

    -- Krok 1: Konto reklamowe
    ad_account_ready BOOLEAN DEFAULT FALSE,
    ad_account_configured_at TIMESTAMPTZ,
    ad_account_data JSONB,

    -- Metadane
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(workflow_id)
);

-- Indeksy
CREATE INDEX IF NOT EXISTS idx_workflow_ads_workflow ON workflow_ads(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_ads_active ON workflow_ads(is_active) WHERE is_active = TRUE;

-- RLS Policies
ALTER TABLE workflow_ads ENABLE ROW LEVEL SECURITY;

-- Admin ma pełny dostęp
CREATE POLICY "Admin full access ads" ON workflow_ads
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Klient widzi tylko aktywowane rekordy
CREATE POLICY "Client read active ads" ON workflow_ads
    FOR SELECT TO anon USING (is_active = TRUE);

-- Trigger do aktualizacji updated_at
CREATE OR REPLACE FUNCTION update_workflow_ads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workflow_ads_updated_at
    BEFORE UPDATE ON workflow_ads
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_ads_updated_at();

-- Komentarze
COMMENT ON TABLE workflow_ads IS 'Dane reklamowe dla workflow - etap 4';
COMMENT ON COLUMN workflow_ads.is_active IS 'Admin aktywuje gdy etap 3 jest zakończony';
COMMENT ON COLUMN workflow_ads.ad_account_ready IS 'Konto reklamowe skonfigurowane';
