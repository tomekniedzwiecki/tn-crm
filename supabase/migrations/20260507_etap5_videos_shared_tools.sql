-- =============================================
-- ETAP 5 / Krok 2 (Opinie share) + Krok 3 (Video) + Krok 4 (Narzedzia)
-- =============================================
-- reviews_shared_at: admin oznaczyl ze opinie sa juz dodane do sklepu (button + email)
-- videos_shared_at: admin udostepnil sekcje Reels klientowi (button + email)
-- tools_started_at, tools_ready_at: tracking nowego kroku Narzedzia (placeholder)

ALTER TABLE workflow_optimization
    ADD COLUMN IF NOT EXISTS reviews_shared_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS videos_shared_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS tools_started_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS tools_ready_at TIMESTAMPTZ;

COMMENT ON COLUMN workflow_optimization.reviews_shared_at IS 'Etap 5/Krok 2 — gdy admin oznaczyl opinie jako dodane do sklepu (button + email)';
COMMENT ON COLUMN workflow_optimization.videos_shared_at IS 'Etap 5/Krok 3 — gdy admin udostepnil sekcje Reels klientowi (button + email)';
COMMENT ON COLUMN workflow_optimization.tools_started_at IS 'Etap 5/Krok 4 (Narzedzia) — gdy krok aktywowany';
COMMENT ON COLUMN workflow_optimization.tools_ready_at IS 'Etap 5/Krok 4 — gdy ukonczony';
