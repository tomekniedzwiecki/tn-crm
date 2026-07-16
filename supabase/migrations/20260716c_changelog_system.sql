-- ============================================================================
-- CHANGELOG system — Faza 1 (TN App). SSOT: docs/stworze/CHANGELOG-SYSTEM-KONCEPCJA.md
-- Jedno źródło, dwie warstwy treści (admin_note + public_summary), visibility flag,
-- project_id NULL = zmiana globalna platformy. Klient czyta przez edge wfa-portal
-- (whitelist kolumn = VIEW changelog_public). RLS = team_members (jak wfa_*), ZERO anon.
-- Bezpieczeństwo: RLS chroni WIERSZ nie kolumny → admin_note/commit_sha/source_* NIE
-- wychodzą do klienta (osobny VIEW). visibility default 'admin' = fail-safe.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.changelog_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid REFERENCES public.wfa_projects(id) ON DELETE CASCADE,  -- NULL = globalna platforma
  platform        text NOT NULL DEFAULT 'tn-app'
                  CHECK (platform IN ('tn-app','tn-sklepy','sklep','sparing','crm')),
  version         text,                                    -- datowy RRRRMMDDNN (klucz publiczny)
  category        text NOT NULL DEFAULT 'changed'          -- Keep a Changelog (wewn.)
                  CHECK (category IN ('added','changed','deprecated','removed','fixed','security')),
  public_category text                                     -- klient (uproszczone)
                  CHECK (public_category IS NULL OR public_category IN ('new','improved','fixed','security')),
  area            text,                                    -- obszar/tag: platnosci/panel/powiadomienia/...
  title           text NOT NULL DEFAULT '',
  admin_note      text NOT NULL DEFAULT '',                -- techniczne „jak" (admin-only)
  public_summary  text,                                    -- klient „co i dlaczego"; NULL => admin-only
  media_url       text,
  cta_url         text,
  visibility      text NOT NULL DEFAULT 'admin'            -- 'admin' | 'public' (fail-safe default)
                  CHECK (visibility IN ('admin','public')),
  source_kind     text,                                    -- ślad: 'wfa_note'|'activity'|'commit'|...
  source_id       uuid,
  commit_sha      text,
  published_at    timestamptz,                             -- moment publikacji public (klucz read/unread)
  created_at      timestamptz NOT NULL DEFAULT now(),
  created_by      text NOT NULL DEFAULT 'tomek'
);
CREATE INDEX IF NOT EXISTS changelog_entries_project_idx ON public.changelog_entries(project_id, published_at DESC);
CREATE INDEX IF NOT EXISTS changelog_entries_public_idx  ON public.changelog_entries(published_at DESC) WHERE visibility='public';

-- Klient „ostatnio widziane" — jeden operator na projekt (portal token-based, nie auth user).
ALTER TABLE public.wfa_projects ADD COLUMN IF NOT EXISTS changelog_seen_at timestamptz;

-- VIEW dla klienta: whitelist BEZPIECZNYCH kolumn (bez admin_note/commit_sha/source_*/visibility).
-- Dodatkowo filtruje do opublikowanych z niepustym public_summary (double-safety).
CREATE OR REPLACE VIEW public.changelog_public AS
  SELECT id, project_id, platform, version, public_category, area, title,
         public_summary, media_url, cta_url, published_at
  FROM public.changelog_entries
  WHERE visibility = 'public' AND published_at IS NOT NULL AND public_summary IS NOT NULL;

-- RLS: tylko zespół (jak wfa_*). Klient idzie przez edge wfa-portal (service-role), NIE anon.
ALTER TABLE public.changelog_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS changelog_entries_team_all ON public.changelog_entries;
CREATE POLICY changelog_entries_team_all ON public.changelog_entries FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = auth.uid()));

-- VIEW nie dla anon/authenticated — tylko service-role (edge) i owner. Def-in-depth:
-- gdyby ktoś dostał się do view bez RLS bazowej tabeli, i tak zobaczy tylko public.
REVOKE ALL ON public.changelog_public FROM anon, authenticated;

COMMENT ON TABLE public.changelog_entries IS 'Changelog fabryki: jedno źródło, dwa widoki (admin_note vs public_summary), visibility flag. SSOT docs/stworze/CHANGELOG-SYSTEM-KONCEPCJA.md';
COMMENT ON VIEW  public.changelog_public  IS 'Whitelist kolumn dla klienta (RLS chroni wiersz nie kolumny); czytany przez edge wfa-portal service-role.';
