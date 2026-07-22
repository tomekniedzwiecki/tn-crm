-- ============================================================================
-- WF2 — „PRZEWODNIK AI" konfiguracji reklam Meta (Etap 4, krok ads_konto/strona/budzet).
-- Decyzja Tomka 22.07. Klient w portalu (/tn-sklepy/portal) zadaje pytanie o konfigurację
-- środowiska reklamowego, może WGRAĆ ZRZUT EKRANU (vision), a model prowadzi go przez proces.
-- Gdy klient utknie mimo prób lub problem wykracza poza wiedzę → marker <utkniecie> → nota
-- „blokada" dla Tomka. Dostęp klienta WYŁĄCZNIE przez edge wf2-ads-guide (service-role +
-- token+hasło portalu, jak wf2-portal). Wzorzec 1:1: 20260715c_wfa_testy_klienta.sql.
-- RLS = tylko zespół (team_members) — ZERO polityk anon. SSOT: docs/zbuduje/ADS-ONBOARDING-LEADSIE.md §14.
-- ============================================================================

-- ── wf2_guide_messages: transkrypt rozmowy przewodnika (kontekst modelu + audyt) ─
CREATE TABLE IF NOT EXISTS public.wf2_guide_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES public.wf2_projects(id) ON DELETE CASCADE,
  role        text NOT NULL CHECK (role IN ('user','assistant')),
  content     text NOT NULL DEFAULT '',
  images      jsonb NOT NULL DEFAULT '[]'::jsonb,   -- [{path}] zrzuty z bieżącej tury (bucket wf2-guide-shots)
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS wf2_guide_messages_project_idx ON public.wf2_guide_messages(project_id, created_at);

-- ── RLS: tylko zespół (team_members) — ZERO polityk anon. Klient pisze przez edge (service-role). ─
ALTER TABLE public.wf2_guide_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wf2_guide_messages_team_all ON public.wf2_guide_messages;
CREATE POLICY wf2_guide_messages_team_all ON public.wf2_guide_messages
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.user_id = auth.uid()));

-- ── Storage bucket: PRIVATE (zrzuty ekranu = dane środowiska klienta) ─────────
-- Klient wgrywa przez signed upload URL (service-role z edge); podgląd = signed URL z edge.
-- SEC-R3-UPLOAD: tylko obraz png/jpg/webp; limit 8 MB (defense-in-depth vs edge MAX_SHOT_BYTES).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('wf2-guide-shots', 'wf2-guide-shots', false, 8388608,   -- 8 MB
        ARRAY['image/png','image/jpeg','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- SELECT-policy dla zespołu (team_members): panel/podgląd admina może listować i czytać zrzuty
-- bezpośrednio (RLS storage.objects). GOTCHA (feedback-storage-upload-wymaga-select-policy):
-- ścieżka team-member wymaga polityki SELECT — anon/authenticated-nie-zespół NIE dostają nic.
DROP POLICY IF EXISTS wf2_guide_shots_team_select ON storage.objects;
CREATE POLICY wf2_guide_shots_team_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'wf2-guide-shots'
    AND EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.user_id = auth.uid())
  );

-- ── Kill-switch przewodnika (FAIL-OPEN w edge: gramy dalej, gdy klucz nieobecny/błąd). ──
-- Ubijamy TYLKO gdy jawnie 'false'/'0'/'off'/'no'. Odczyt: service_role (edge) + team (RLS settings).
INSERT INTO public.settings (key, value) VALUES ('wf2_ads_guide_enabled', 'true')
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE public.wf2_guide_messages IS
  'WF2 Przewodnik AI (Etap 4): transkrypt rozmowy klient↔asystent konfiguracji reklam Meta. Zrzuty w images (bucket wf2-guide-shots). Dostęp klienta przez edge wf2-ads-guide (token+hasło portalu).';
