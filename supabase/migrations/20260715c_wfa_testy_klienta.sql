-- ============================================================================
-- WFA — moduł „TESTY KLIENTA" (spowiednik testów). Koncept: docs/stworze/MODUL-TESTY-KLIENTA.md
-- Klient-operator w SWOIM portalu rozmawia z AI o uwagach do aplikacji, dokleja
-- zrzuty ekranu (vision), a AI składa z rozmowy USTRUKTURYZOWANE zgłoszenia.
-- Tomek rozstrzyga w panelu i zleca pracę nad zatwierdzonymi → krok poprawki_demo.
-- Dostęp klienta WYŁĄCZNIE przez edge wfa-test-chat (service-role + token+hasło portalu).
-- RLS = tylko zespół (team_members) — ZERO polityk anon (wzorzec 20260711_wfa_foundation.sql).
-- Krok workflow `testy_klienta` dokłada 20260715b_krok_testy_klienta.sql.
-- ============================================================================

-- ── Kontekst testów per projekt: lista ekranów/funkcji (brief/02) wklejana przy
--    aktywacji kroku — AI zna aplikację, o której mowa. ─────────────────────────
ALTER TABLE public.wfa_projects ADD COLUMN IF NOT EXISTS test_context text;

-- ── wfa_test_sessions: jedna „żywa" sesja rozmowy na projekt (klient może wracać) ─
CREATE TABLE IF NOT EXISTS public.wfa_test_sessions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       uuid NOT NULL REFERENCES public.wfa_projects(id) ON DELETE CASCADE,
  status           text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  started_at       timestamptz NOT NULL DEFAULT now(),
  last_activity_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS wfa_test_sessions_project_idx ON public.wfa_test_sessions(project_id);

-- ── wfa_test_messages: transkrypt = kontekst rozmowy + audyt ──────────────────
CREATE TABLE IF NOT EXISTS public.wfa_test_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid NOT NULL REFERENCES public.wfa_test_sessions(id) ON DELETE CASCADE,
  project_id  uuid NOT NULL REFERENCES public.wfa_projects(id) ON DELETE CASCADE,
  role        text NOT NULL CHECK (role IN ('user','assistant')),
  content     text NOT NULL DEFAULT '',
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,           -- [{path,url?}] zrzuty z bieżącej tury
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS wfa_test_messages_session_idx ON public.wfa_test_messages(session_id, created_at);

-- ── wfa_test_issues: ustrukturyzowane zgłoszenia złożone przez AI ─────────────
CREATE TABLE IF NOT EXISTS public.wfa_test_issues (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     uuid NOT NULL REFERENCES public.wfa_projects(id) ON DELETE CASCADE,
  session_id     uuid REFERENCES public.wfa_test_sessions(id) ON DELETE SET NULL,
  seq            integer NOT NULL,                          -- nr zgłoszenia per projekt (TK-<seq>)
  title          text NOT NULL DEFAULT '',                  -- krótki tytuł po polsku
  description    text NOT NULL DEFAULT '',                  -- kroki / oczekiwane / faktyczne (złożone przez AI)
  area           text,                                      -- ekran / moduł
  device         text,                                      -- mobile / desktop
  severity       text NOT NULL DEFAULT 'istotne'            -- sugestia AI; Tomek może zmienić
                 CHECK (severity IN ('krytyczne','istotne','kosmetyka')),
  quote          text,                                      -- dosłowny cytat klienta (jego język!)
  screenshots    jsonb NOT NULL DEFAULT '[]'::jsonb,        -- ścieżki storage z bieżącego wątku
  status         text NOT NULL DEFAULT 'new'
                 CHECK (status IN ('new','approved','rejected','in_progress','done')),
  tomek_comment  text,                                      -- widoczny klientowi przy rejected/done
  created_at     timestamptz NOT NULL DEFAULT now(),
  decided_at     timestamptz,
  done_at        timestamptz,
  UNIQUE (project_id, seq)
);
CREATE INDEX IF NOT EXISTS wfa_test_issues_project_idx ON public.wfa_test_issues(project_id, status);

-- ── RLS: tylko zespół (team_members) — ZERO polityk anon ─────────────────────
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['wfa_test_sessions','wfa_test_messages','wfa_test_issues']
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
-- Zrzuty mogą zawierać dane klientów operatora → private; brak polityk anon/authenticated.
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('wfa-test-shots', 'wfa-test-shots', false, 26214400)   -- 25 MB (defense-in-depth)
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE public.wfa_test_sessions IS
  'WFA Testy klienta: żywa sesja rozmowy „spowiednik testów" na projekt. Dostęp klienta przez edge wfa-test-chat.';
COMMENT ON TABLE public.wfa_test_messages IS
  'WFA Testy klienta: transkrypt rozmowy (kontekst dla AI + audyt). Zrzuty w attachments (bucket wfa-test-shots).';
COMMENT ON TABLE public.wfa_test_issues IS
  'WFA Testy klienta: ustrukturyzowane zgłoszenia złożone przez AI z rozmowy. Tomek zatwierdza/odrzuca; zatwierdzone → krok poprawki_demo.';
COMMENT ON COLUMN public.wfa_projects.test_context IS
  'WFA Testy klienta: opis aplikacji (ekrany/funkcje z brief/02) wklejany przy aktywacji kroku — kontekst dla AI spowiednika testów.';
