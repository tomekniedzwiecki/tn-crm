-- Centrum Kampanii: blokery per kampania + target CPA (kill-rule)
-- UWAGA: zastosowane już na żywej bazie przez MCP apply_migration 2026-06-10;
-- plik dograny do repo dla spójności (odtworzenie bazy z migracji).

-- Target CPA per sklep — podstawa kill-rule w tygodniowym cyklu optymalizacji (CLAUDE_ADS_REPORT_PROCEDURE.md)
ALTER TABLE workflow_ads ADD COLUMN IF NOT EXISTS target_cpa numeric;
COMMENT ON COLUMN workflow_ads.target_cpa IS 'Docelowy koszt pozyskania zakupu (PLN); fallback = cena produktu x 0.3. Uzywane przez kill-rule w raportach MCP.';

-- Blokery per kampania — maszynowa lista "kto trzyma piłkę" (Centrum Kampanii)
-- Format: [{"task": "...", "owner": "tomek"|"klient"|"claude", "created": "YYYY-MM-DD", "resolved": null|"YYYY-MM-DD"}]
ALTER TABLE workflow_ads ADD COLUMN IF NOT EXISTS blockers jsonb NOT NULL DEFAULT '[]'::jsonb;
COMMENT ON COLUMN workflow_ads.blockers IS 'Blokery kampanii z ownerem (tomek/klient/claude); aktualizowane przy raportach MCP. Centrum Kampanii agreguje nierozwiazane.';
