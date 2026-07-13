-- ============================================================================
-- WFA — moduł „Do uzupełnienia" (intake) w portalu klienta
-- Operator od pierwszego dnia widzi wszystko, co kiedykolwiek będzie od niego
-- potrzebne, i uzupełnia kiedy ma czas — projekt nigdy nie czeka.
-- 4 karty: Dane firmy (SSOT = wfa_projects.contract_fields), Materiały, Stripe, Beta.
-- Klient przechodzi WYŁĄCZNIE przez edge function wfa-portal (service-role + token+hasło).
-- RLS = tylko zespół (team_members) — ZERO polityk anon (wzorzec 20260711_wfa_foundation.sql).
-- ============================================================================

-- ── wfa_intake: dane per karta (materialy/beta; firma jest w contract_fields) ─
CREATE TABLE IF NOT EXISTS public.wfa_intake (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES public.wfa_projects(id) ON DELETE CASCADE,
  section     text NOT NULL,                              -- 'materialy' | 'beta'
  data        jsonb NOT NULL DEFAULT '{}'::jsonb,
  status      text NOT NULL DEFAULT 'empty'
              CHECK (status IN ('empty','partial','done')),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, section)
);
CREATE INDEX IF NOT EXISTS wfa_intake_project_idx ON public.wfa_intake(project_id);

-- ── wfa_intake_files: pliki wgrane do karty „Materiały" (bucket wfa-intake) ──
CREATE TABLE IF NOT EXISTS public.wfa_intake_files (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid NOT NULL REFERENCES public.wfa_projects(id) ON DELETE CASCADE,
  section       text NOT NULL,                            -- 'materialy'
  storage_path  text NOT NULL,                            -- <project_id>/<uuid8>-<nazwa>
  filename      text NOT NULL,
  size_bytes    bigint,
  mime          text,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS wfa_intake_files_project_idx ON public.wfa_intake_files(project_id, section);

-- ── updated_at (funkcja public.wfa_touch_updated_at() już istnieje) ──────────
DROP TRIGGER IF EXISTS wfa_intake_touch ON public.wfa_intake;
CREATE TRIGGER wfa_intake_touch BEFORE UPDATE ON public.wfa_intake
  FOR EACH ROW EXECUTE FUNCTION public.wfa_touch_updated_at();

-- ── RLS: tylko zespół (team_members) — ZERO polityk anon ─────────────────────
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['wfa_intake','wfa_intake_files']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_team_all', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated
       USING (EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = auth.uid()))
       WITH CHECK (EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = auth.uid()))',
      t || '_team_all', t);
  END LOOP;
END $$;

-- ── Storage bucket: PRIVATE (dostęp wyłącznie service-role z edge + signed URLs) ─
-- Brak polityk storage dla anon/authenticated → tylko service_role. 25 MB limit (defense-in-depth).
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('wfa-intake', 'wfa-intake', false, 26214400)
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE public.wfa_intake IS
  'WFA intake „Do uzupełnienia": dane kart materialy/beta (firma = wfa_projects.contract_fields SSOT). Dostęp klienta wyłącznie przez wfa-portal.';
COMMENT ON TABLE public.wfa_intake_files IS
  'WFA intake: pliki karty „Materiały" (bucket wfa-intake, private). Metadata; treść przez signed URLs z edge.';
