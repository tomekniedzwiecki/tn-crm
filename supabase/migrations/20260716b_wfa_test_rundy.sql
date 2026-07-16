-- ============================================================================
-- WFA — moduł „Testy klienta": SERIE POPRAWEK (rundy). Koncept: docs/stworze/MODUL-TESTY-KLIENTA.md
-- (sekcja „Serie poprawek (rundy)").
--
-- Model rund (najprostszy spójny): cykl Grzegorz testuje → zgłasza uwagi (runda N) →
-- Tomek rozstrzyga i zleca → poprawki → „Zamknij serię poprawek" (podsumowanie rundy N,
-- test_round++) → klient testuje ponownie → uwagi = runda N+1. Wiele rund, historia zostaje.
--
-- Dlaczego DEDYKOWANA tabela wfa_test_rounds (a nie nota/activity):
--  * panel grupuje zgłoszenia po round_no i renderuje NAGŁÓWEK każdej rundy
--    (otwarta/zamknięta + podsumowanie) — potrzebny szybki, ustrukturyzowany odczyt;
--  * portal pokazuje komunikat „Runda N gotowa — przetestuj ponownie" po zamknięciu serii;
--  * podsumowanie (zgłoszonych/naprawionych/odrzuconych/v1.1) trzymamy jako jsonb przy rundzie,
--    a nie parsujemy z activity log. Trzy proste kolumny + jsonb = czysta historia rund.
--
-- round_no jest USTAWIANY WYŁĄCZNIE przez edge wfa-test-chat z wfa_projects.test_round
-- (klient nigdy nie podaje go w body) — patrz insertIssue w edge.
-- RLS nowej tabeli = tylko zespół (team_members), ZERO polityk anon (wzorzec wfa_test_*).
-- ============================================================================

-- ── Bieżąca (otwarta) runda testów per projekt ───────────────────────────────
ALTER TABLE public.wfa_projects
  ADD COLUMN IF NOT EXISTS test_round integer NOT NULL DEFAULT 1;

-- ── Numer rundy, w której powstało zgłoszenie (edge ustawia z test_round) ─────
ALTER TABLE public.wfa_test_issues
  ADD COLUMN IF NOT EXISTS round_no integer NOT NULL DEFAULT 1;
CREATE INDEX IF NOT EXISTS wfa_test_issues_round_idx
  ON public.wfa_test_issues(project_id, round_no);

-- ── wfa_test_rounds: jedna runda serii poprawek (podsumowanie w summary jsonb) ─
CREATE TABLE IF NOT EXISTS public.wfa_test_rounds (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES public.wfa_projects(id) ON DELETE CASCADE,
  round_no    integer NOT NULL,
  opened_at   timestamptz NOT NULL DEFAULT now(),
  closed_at   timestamptz,                              -- NULL = runda otwarta
  summary     jsonb NOT NULL DEFAULT '{}'::jsonb,       -- {reported, fixed, rejected, dev_v11, ...} liczone przy zamknięciu
  UNIQUE (project_id, round_no)
);
CREATE INDEX IF NOT EXISTS wfa_test_rounds_project_idx
  ON public.wfa_test_rounds(project_id, round_no);

-- ── RLS: tylko zespół (team_members) — ZERO polityk anon ─────────────────────
ALTER TABLE public.wfa_test_rounds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wfa_test_rounds_team_all ON public.wfa_test_rounds;
CREATE POLICY wfa_test_rounds_team_all ON public.wfa_test_rounds
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = auth.uid()));

-- ── Backfill: dla projektów, które MAJĄ już zgłoszenia testowe, załóż otwartą rundę 1
--    (istniejące zgłoszenia mają round_no=1 z DEFAULT; nowe projekty dostaną rundę leniwie z edge). ─
INSERT INTO public.wfa_test_rounds (project_id, round_no, opened_at)
SELECT DISTINCT i.project_id, 1, now()
FROM public.wfa_test_issues i
WHERE NOT EXISTS (
  SELECT 1 FROM public.wfa_test_rounds r
  WHERE r.project_id = i.project_id AND r.round_no = 1
);

COMMENT ON TABLE public.wfa_test_rounds IS
  'WFA Testy klienta: rundy serii poprawek. Jedna runda = cykl zgloszenia→rozstrzygniecie→poprawki→zamkniecie. summary (jsonb) liczone przy zamknieciu (zgloszonych/naprawionych/odrzuconych/rozwoj v1.1). round_no ustawia edge z wfa_projects.test_round.';
COMMENT ON COLUMN public.wfa_projects.test_round IS
  'WFA Testy klienta: numer BIEZACEJ (otwartej) rundy serii poprawek. Inkrementowany przez edge wfa-test-chat action close_round.';
COMMENT ON COLUMN public.wfa_test_issues.round_no IS
  'WFA Testy klienta: numer rundy, w ktorej powstalo zgloszenie. Ustawiany WYLACZNIE przez edge z wfa_projects.test_round (klient nie podaje w body).';
