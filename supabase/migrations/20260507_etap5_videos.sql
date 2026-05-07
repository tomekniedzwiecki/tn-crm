-- =============================================
-- ETAP 5 / KROK 3 — Video (reels)
-- =============================================
-- Sekcja Reels w landingu pobiera video z workflow_video.video_links
-- (juz istniejace pole z Etapu 2). Tutaj dodajemy tylko trackowanie
-- kiedy admin ostatnio wstawil/zaktualizowal sekcje Reels w landingu.

ALTER TABLE workflow_optimization
    ADD COLUMN IF NOT EXISTS videos_inserted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS videos_count INT DEFAULT 0;

COMMENT ON COLUMN workflow_optimization.videos_inserted_at IS 'Timestamp ostatniego wstawienia/aktualizacji sekcji Reels w landingu (Etap 5/Krok 3)';
COMMENT ON COLUMN workflow_optimization.videos_count IS 'Liczba video z workflow_video.video_links uwzgledniona w landingu (do sidebar checkmark)';
