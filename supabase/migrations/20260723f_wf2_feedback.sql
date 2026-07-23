-- ============================================================================
-- WF2 — moduł „UWAGI KLIENTA" (doradca uwag). Koncept: docs/zbuduje/PORTAL-UWAGI.md
-- Klient-operator w SWOIM portalu /twoj-biznes rozmawia z AI-DORADCĄ o uwagach do
-- WSZYSTKIEGO, co przygotowaliśmy (strona sprzedażowa, poprawki, kampanie, materiały,
-- wideo). Doradca dopytuje o propozycję klienta, konstruktywnie kontruje i składa
-- z rozmowy USTRUKTURYZOWANE uwagi z REKOMENDACJĄ dla Tomka.
-- Tomek rozstrzyga w panelu (tn-sklepy/projekt.html, zakładka „Uwagi klienta").
-- Dostęp klienta WYŁĄCZNIE przez edge wf2-feedback (service-role + token+hasło portalu).
-- RLS = tylko zespół (team_members) — ZERO polityk anon (wzorzec 20260715c_wfa_testy_klienta.sql).
-- seq per projekt = liczony w edge (MAX(seq)+1 + retry na 23505) — BEZ triggera.
-- ============================================================================

-- ── wf2_feedback_messages: transkrypt rozmowy z doradcą (kontekst dla AI + audyt) ─
--    Wątek na projekt (scope po project_id, jak wf2-ads-guide — bez sesji/rund). ───
CREATE TABLE IF NOT EXISTS public.wf2_feedback_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES public.wf2_projects(id) ON DELETE CASCADE,
  role        text NOT NULL CHECK (role IN ('user','assistant')),
  content     text NOT NULL DEFAULT '',
  images      jsonb NOT NULL DEFAULT '[]'::jsonb,            -- [{path,url?}] zrzuty z bieżącej tury
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS wf2_feedback_messages_project_idx
  ON public.wf2_feedback_messages(project_id, created_at);

-- ── wf2_feedback: ustrukturyzowane uwagi klienta złożone przez doradcę AII ─────
CREATE TABLE IF NOT EXISTS public.wf2_feedback (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id              uuid NOT NULL REFERENCES public.wf2_projects(id) ON DELETE CASCADE,
  product_id              uuid REFERENCES public.wf2_products(id) ON DELETE SET NULL,
  seq                     integer NOT NULL,                  -- nr uwagi per projekt (UW-<seq>)
  scope                   text NOT NULL DEFAULT 'ogolne'     -- czego dotyczy
                          CHECK (scope IN ('landing','kampania','wideo','materialy','ogolne','inne')),
  target_ref              text,                              -- konkret (nazwa strony/produktu/URL)
  title                   text NOT NULL DEFAULT '',          -- zwięzły tytuł po polsku
  remark                  text NOT NULL DEFAULT '',          -- uwaga klienta (jego język!)
  client_proposal         text,                              -- co klient proponuje, żeby było dobrze
  advisor_recommendation  text,                              -- rekomendacja AI DLA TOMKA (NIGDY do klienta)
  severity                text NOT NULL DEFAULT 'srednie'    -- sugestia AI; Tomek może zmienić
                          CHECK (severity IN ('wazne','srednie','drobne')),
  screenshots             jsonb NOT NULL DEFAULT '[]'::jsonb,-- ścieżki storage z wątku (dowód wizualny)
  status                  text NOT NULL DEFAULT 'new'
                          CHECK (status IN ('new','reviewed','in_progress','resolved','dismissed')),
  admin_note              text,                              -- odpowiedź Tomka WIDOCZNA klientowi
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),-- utrzymywane przez zapisujący kod (bez triggera)
  decided_at              timestamptz,
  resolved_at             timestamptz,
  UNIQUE (project_id, seq)
);
CREATE INDEX IF NOT EXISTS wf2_feedback_project_status_idx ON public.wf2_feedback(project_id, status);
CREATE INDEX IF NOT EXISTS wf2_feedback_project_new_idx ON public.wf2_feedback(project_id) WHERE status = 'new';

-- ── RLS: tylko zespół (team_members) — ZERO polityk anon ─────────────────────
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['wf2_feedback_messages','wf2_feedback']
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
-- Zrzuty mogą pokazywać materiały/dane → private; brak polityk anon/authenticated.
-- SEC-R3-UPLOAD: obraz png/jpg/webp; allowed_mime_types od 1 dnia (BEZ image/svg+xml).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('wf2-feedback-shots', 'wf2-feedback-shots', false, 8388608,   -- 8 MB
        ARRAY['image/png','image/jpeg','image/webp'])
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE public.wf2_feedback_messages IS
  'WF2 Uwagi klienta: transkrypt rozmowy z doradcą (kontekst dla AI + audyt). Zrzuty w images (bucket wf2-feedback-shots). Scope po project_id.';
COMMENT ON TABLE public.wf2_feedback IS
  'WF2 Uwagi klienta: ustrukturyzowane uwagi złożone przez doradcę AI z rozmowy. Tomek rozstrzyga w panelu. advisor_recommendation = TYLKO dla Tomka (nigdy do klienta).';
