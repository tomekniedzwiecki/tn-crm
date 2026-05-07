-- ETAP 5 — Optymalizacja
-- Krok 1: "Optymalizacje" zawiera:
--   1) COD (informacja do klienta zeby wlaczyl COD w sklepie + zamowil 2-3 sztuki)
--   2) WhatsApp na stronie sprzedazowej (z numerem klienta, override mozliwy)

CREATE TABLE IF NOT EXISTS workflow_optimization (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE UNIQUE,

    -- Switch glowny (admin: "Wlacz optymalizacje" -> klient widzi Etap 5)
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    activated_at TIMESTAMPTZ,

    -- COD (Cash On Delivery)
    cod_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    cod_enabled_at TIMESTAMPTZ,
    cod_stock_confirmed BOOLEAN NOT NULL DEFAULT FALSE, -- klient potwierdza ze ma 2-3 sztuki w domu
    cod_stock_confirmed_at TIMESTAMPTZ,

    -- WhatsApp na stronie sprzedazowej
    whatsapp_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    whatsapp_phone TEXT, -- override; gdy NULL -> uzywaj workflows.customer_phone
    whatsapp_phone_set_by_client BOOLEAN NOT NULL DEFAULT FALSE,
    whatsapp_configured_at TIMESTAMPTZ,

    -- Recovery calls (proby odzyskania niedokonczonych zamowien)
    recovery_calls_done BOOLEAN NOT NULL DEFAULT FALSE,
    recovery_calls_done_at TIMESTAMPTZ,
    recovery_calls_notes TEXT, -- wspolne pole notatek (admin + klient oboje widza i edytuja)

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_optimization_workflow_id ON workflow_optimization(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_optimization_is_active ON workflow_optimization(is_active) WHERE is_active = TRUE;

-- RLS
ALTER TABLE workflow_optimization ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated full access" ON workflow_optimization;
CREATE POLICY "Authenticated full access"
ON workflow_optimization
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Anon SELECT — potrzebne dla widgetu WhatsApp na landing pages (publiczny odczyt numeru)
DROP POLICY IF EXISTS "Anon can read whatsapp config" ON workflow_optimization;
CREATE POLICY "Anon can read whatsapp config"
ON workflow_optimization
FOR SELECT
TO anon
USING (is_active = TRUE);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_workflow_optimization_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS workflow_optimization_updated_at ON workflow_optimization;
CREATE TRIGGER workflow_optimization_updated_at
    BEFORE UPDATE ON workflow_optimization
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_optimization_updated_at();

-- Auto-create row dla workflow gdy raport zostal wyslany (etap 4 zakonczony)
-- Backfill dla istniejacych workflow gdzie report_sent = TRUE
INSERT INTO workflow_optimization (workflow_id)
SELECT wa.workflow_id
FROM workflow_ads wa
WHERE wa.report_sent = TRUE
  AND NOT EXISTS (
      SELECT 1 FROM workflow_optimization wo WHERE wo.workflow_id = wa.workflow_id
  );

-- Auto-create gdy admin oznacza report_sent = TRUE w przyszlosci
CREATE OR REPLACE FUNCTION auto_create_workflow_optimization()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.report_sent = TRUE AND (OLD.report_sent IS NULL OR OLD.report_sent = FALSE) THEN
        INSERT INTO workflow_optimization (workflow_id)
        VALUES (NEW.workflow_id)
        ON CONFLICT (workflow_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS workflow_ads_create_optimization ON workflow_ads;
CREATE TRIGGER workflow_ads_create_optimization
    AFTER UPDATE ON workflow_ads
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_workflow_optimization();

COMMENT ON TABLE workflow_optimization IS 'Etap 5 - Optymalizacja. is_active = wlaczone przez admina (klient widzi etap)';
COMMENT ON COLUMN workflow_optimization.whatsapp_phone IS 'Override; NULL = uzyj workflows.customer_phone';
COMMENT ON COLUMN workflow_optimization.cod_stock_confirmed IS 'Klient potwierdza ze ma 2-3 sztuki produktu na stockach';
