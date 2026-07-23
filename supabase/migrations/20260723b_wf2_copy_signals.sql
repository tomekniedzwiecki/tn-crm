-- ============================================================================
-- WF2 — SYGNAŁY KOPII LANDINGÓW (copy signals) — 2026-07-23
-- Warstwa DETEKCJI plagiatów naszych landingów. Zbiera trzy rodzaje tropów:
--   • 'origin_gate_403' — obcy host uderzył w runtime wf2-landing-api i dostał 403
--     (Faza A origin-gate loguje 403; edge może INSERT-ować tu sygnał — patrz §4 raportu).
--   • 'serp'            — skaner copy-scan.py znalazł ukryty watermark „wf2·<build_id>"
--     (albo atrybut data-mk) na obcej domenie przez wyszukiwarkę (Google CSE / SerpAPI / Bing).
--   • 'manual'          — zgłoszenie ręczne (Tomek / obserwacja).
-- Dowód własności = watermark build_id = HMAC-SHA256(sekret,'wf2:'+product_id)[:16],
-- odtwarzalny TYLKO przez nas (kopista nie zna sekretu). Mapowanie build_id→produkt→
-- projekt→klient: iterując wf2_products (product_id FK poniżej).
--
-- Wzorzec: 20260703_wf2_foundation / 20260722t_wfp_prospektor.
-- RLS: FOR ALL TO authenticated gated team_members; ZERO anon (dane wrażliwe —
--   hosty konkurencji/kopistów). service_role (panel-sync, edge) bypassuje RLS
--   przy zapisach. Anon NIE widzi.
-- ⚠️ NIE APLIKOWANA automatycznie — patrz polecenie w raporcie.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.wf2_copy_signals (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  source      text NOT NULL CHECK (source IN ('origin_gate_403','serp','manual')),
  host        text,                                          -- goły host obcej domeny (np. kopia.example.pl)
  product_id  uuid REFERENCES public.wf2_products(id) ON DELETE SET NULL,  -- nasz produkt (mapa z build_id)
  build_id    text,                                          -- watermark HMAC[:16] potwierdzony w kopii (dowód)
  url         text,                                          -- pełny URL kopii / trafienia SERP
  detail      jsonb NOT NULL DEFAULT '{}'::jsonb             -- {phrase,provider,title,snippet,referer,ua,project_id,customer,...}
);

-- Indeksy wymagane kontraktem: po host (agregacja per domena) i po czasie (feed najnowszych).
CREATE INDEX IF NOT EXISTS wf2_copy_signals_host_idx    ON public.wf2_copy_signals (host);
CREATE INDEX IF NOT EXISTS wf2_copy_signals_created_idx ON public.wf2_copy_signals (created_at DESC);
-- Pomocniczy: kolejka per źródło (np. przegląd świeżych trafień SERP / 403).
CREATE INDEX IF NOT EXISTS wf2_copy_signals_source_idx  ON public.wf2_copy_signals (source, created_at DESC);

-- Idempotencja skanera robiona APP-SIDE (copy-scan.py: GET-before-POST po source+url+build_id,
-- wzorzec panel-sync). Gdyby edge origin-gate chciał ON CONFLICT DO NOTHING — dołóż wtedy
-- osobną migracją partial unique index (source, host, coalesce(url,''), coalesce(build_id,'')).

-- ── RLS: tylko zespół (team_members) — ZERO polityk anon; service_role bypassuje ──
ALTER TABLE public.wf2_copy_signals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wf2_copy_signals_team_all ON public.wf2_copy_signals;
CREATE POLICY wf2_copy_signals_team_all ON public.wf2_copy_signals
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = auth.uid()));

COMMENT ON TABLE public.wf2_copy_signals IS
  'WF2: sygnały kopii landingów (detekcja plagiatów). source: origin_gate_403|serp|manual. '
  'Dowód własności = watermark build_id (HMAC, recompute przez nas). RLS: team_members, ZERO anon; '
  'service-role (copy-scan.py, edge) bypassuje. Playbook DMCA: docs/zbuduje/OCHRONA-LANDINGOW.md.';
