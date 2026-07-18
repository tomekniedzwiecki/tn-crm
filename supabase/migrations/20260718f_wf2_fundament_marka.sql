-- ═══════════════════════════════════════════════════════════════════════════
-- WF2 — ETAP 1 „FUNDAMENT SKLEPU" + kontrakt marki parasolowej (2026-07-18)
--
-- 1) wf2_projects: kolumny tożsamości marki parasolowej — twardy handoff
--    kroku 'marka' do konsumentów (pl_branding: logo/favicon na platformę,
--    pl_glowna: otoczka strony głównej, pl_prawne: tokeny, paczki promptów:
--    project.name/domain w nagłówku KAŻDEJ sesji fabryki).
-- 2) Etap 1 przemianowany: „Portfel produktów" → „Fundament sklepu"
--    (marka + domena + portfel). Nazwa przestaje kłamać: marka i domena to
--    fundament CAŁEGO sklepu, nie element portfela.
-- 3) pl_domena przeniesiona z Etapu 3 do Etapu 1 (sort 7, między marką
--    a wyborem): tor domeny (zakup LH.pl → add_domain → DNS → propagacja
--    24-48 h → weryfikacja w Meta BM) to najdłuższa ścieżka projektu i MUSI
--    startować równolegle do fabryki landingów, nie po niej.
-- 4) Kamień na 'wybor': akcept drabinki cenowej = produkt gotowy do fabryki
--    (sygnał kompletowania portfela per produkt).
--
-- Instancje wf2_steps są kluczowane po step_key — zmiany stage/stage_label/
-- sort/milestone_label NIE ruszają stanu instancji (zero migracji danych).
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.wf2_projects
  ADD COLUMN IF NOT EXISTS tagline     text,
  ADD COLUMN IF NOT EXISTS brand_opis  text,   -- 2-3 zdania na stronę główną-galerię
  ADD COLUMN IF NOT EXISTS palette     text,   -- hexy z rolami: primary, accent, neutrale (WYŁĄCZNIE jasne tła)
  ADD COLUMN IF NOT EXISTS fonts       text,   -- 'heading: X · body: Y' (latin-ext — polskie znaki)
  ADD COLUMN IF NOT EXISTS logo_url    text,   -- lockup PNG (Storage public URL) → pl_branding upload_logo
  ADD COLUMN IF NOT EXISTS favicon_url text;   -- favicon PNG 512 (Storage public URL) → pl_branding upload_favicon

UPDATE public.wf2_step_defs SET stage_label = 'Fundament sklepu' WHERE stage = 1;

UPDATE public.wf2_step_defs
   SET stage = 1, stage_label = 'Fundament sklepu', sort = 7
 WHERE key = 'pl_domena';

UPDATE public.wf2_step_defs
   SET milestone_label = 'Kalkulacja zaakceptowana — produkt gotowy do fabryki'
 WHERE key = 'wybor';
