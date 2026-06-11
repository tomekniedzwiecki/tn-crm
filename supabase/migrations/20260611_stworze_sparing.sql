-- "Stworze" (tomekniedzwiecki.pl/stworze) — sparing z AI: walidacja pomyslu SaaS z niszy zawodowej.
--
-- Lejek samoobslugowy: kafelki profesji -> kafelki problemow -> bramka e-mail+imie ->
-- sparing z AI (4 etapy: Grunt -> Polowanie na bol -> Stress-test -> Werdykt) ->
-- Karta Problemu -> platnosc 500 zl "Pierwsza Makieta".
--
-- Pisze WYLACZNIE edge function `spar-chat` (service_role, bypass RLS):
--   - INSERT spar_sessions przy pierwszej wiadomosci (sessionId generowany client-side, localStorage)
--   - INSERT spar_messages (user + assistant po zakonczeniu streamu)
--   - UPDATE spar_sessions (turns, verdict, problem_summary, lead_id, updated_at)
-- Frontend NIE dotyka bazy bezposrednio — stad ZERO polityk dla anon (default deny).
--
-- Wzorzec: migrations/20260527_zwolnie_leads.sql

-- =====================================================
-- 1. TABELE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.spar_sessions (
  -- UWAGA: brak DEFAULT — id generuje KLIENT (uuid w localStorage),
  -- edge function wstawia je jawnie. Brak defaultu = brakujace id wybucha
  -- od razu zamiast cicho tworzyc osierocona sesje.
  id              uuid PRIMARY KEY,

  -- Kontekst wejscia (chip profesji / ?p= z reklamy; NULL = AI ustala w rozmowie)
  profession      text,
  problem_hint    text,                   -- zarezerwowane (podpowiedz problemu); obecnie NULL

  -- Kontakt z bramki INLINE w rozmowie (po kilku turach) — NULL do tego momentu
  email           text,
  name            text,

  -- Stan sparingu
  status          text NOT NULL DEFAULT 'active',
  verdict         text,                   -- zielony|zolty|czerwony (z bloku <werdykt> w turze werdyktu)
  problem_summary jsonb,                  -- "karta" z markera werdyktu (problem, kto_placi, ekrany, ryzyka...)
  tracking        jsonb,                  -- {gclid,fbclid,ttclid,fbp,utm_*,landing_page,referrer}
  lead_id         uuid,                   -- leads.id po lead-upsert (tylko zielony werdykt)
  turns           int NOT NULL DEFAULT 0, -- licznik tur (limit 30 egzekwuje edge function)
  ip              text,                   -- x-forwarded-for (anty-abuse)

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.spar_messages (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id  uuid NOT NULL REFERENCES public.spar_sessions(id) ON DELETE CASCADE,
  role        text NOT NULL CHECK (role IN ('user','assistant')),
  content     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- 2. INDEKSY
-- =====================================================

-- Historia rozmowy (pelny kontekst do Claude) + rate-limit (COUNT wiadomosci/h per sesja)
CREATE INDEX IF NOT EXISTS idx_spar_messages_session_created
  ON public.spar_messages (session_id, created_at);

CREATE INDEX IF NOT EXISTS idx_spar_sessions_email
  ON public.spar_sessions (email);

CREATE INDEX IF NOT EXISTS idx_spar_sessions_created
  ON public.spar_sessions (created_at);

-- Anty-abuse: limit nowych sesji per IP (COUNT w spar-chat)
CREATE INDEX IF NOT EXISTS idx_spar_sessions_ip_created
  ON public.spar_sessions (ip, created_at);

-- =====================================================
-- 3. TRIGGER updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION public.spar_sessions_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_spar_sessions_updated_at ON public.spar_sessions;
CREATE TRIGGER trg_spar_sessions_updated_at
BEFORE UPDATE ON public.spar_sessions
FOR EACH ROW EXECUTE FUNCTION public.spar_sessions_set_updated_at();

-- =====================================================
-- 4. RLS
-- =====================================================
-- ZERO polityk dla anon — to CELOWE, nie przeoczenie:
--   * frontend rozmawia wylacznie z edge function `spar-chat`,
--     ktora pisze i czyta service_role'em (service_role omija RLS),
--   * anon z kluczem publishable NIE moze czytac cudzych sesji/rozmow
--     (email, IP, tresc sparingu = dane wrazliwe) ani niczego wstawiac,
--   * brak polityki = default deny dla anon na SELECT/INSERT/UPDATE/DELETE.
-- Authenticated (admin CRM): tylko SELECT — podglad sesji i rozmow w CRM,
-- bez prawa edycji (stan sesji zmienia wylacznie funkcja).

ALTER TABLE public.spar_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spar_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS spar_sessions_auth_select ON public.spar_sessions;
CREATE POLICY spar_sessions_auth_select
  ON public.spar_sessions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS spar_messages_auth_select ON public.spar_messages;
CREATE POLICY spar_messages_auth_select
  ON public.spar_messages FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- 5. KOMENTARZE
-- =====================================================

COMMENT ON TABLE public.spar_sessions IS
  'Sesje sparingu AI /stworze. Pisze wylacznie edge function spar-chat (service_role). Anon: zero polityk (default deny). Authenticated: SELECT (podglad w CRM).';
COMMENT ON TABLE public.spar_messages IS
  'Historia wiadomosci sparingu (user/assistant). Pisze wylacznie spar-chat (service_role). Limit 30 tur + 60 msg/h egzekwuje funkcja, nie baza.';
COMMENT ON COLUMN public.spar_sessions.verdict IS
  'zielony|zolty|czerwony — parsowane z bloku <werdykt> w odpowiedzi modelu.';
COMMENT ON COLUMN public.spar_sessions.problem_summary IS
  'JSON "karta" z markera werdyktu: problem, profesja, kto_placi, dzisiejsze_obejscie, ekrany[], kanaly_dystrybucji[], sygnal_budzetu, konkurencja, ryzyka[].';
COMMENT ON COLUMN public.spar_sessions.lead_id IS
  'leads.id zwrocone przez lead-upsert przy zielonym werdykcie (source=stworze).';

-- =====================================================
-- 6. CHECKLISTA WDROZENIA (recznie, poza ta migracja)
-- =====================================================
-- 1. Wklej ten plik w Supabase SQL Editor (projekt yxmavwkwnfuphjqbelws)
--    lub `npx supabase db push` — plik jest idempotentny (IF NOT EXISTS / DROP IF EXISTS).
-- 2. Wstaw RECZNIE w SQL Editor klucz promptu systemowego:
--      INSERT INTO settings (key, value) VALUES ('stworze_sparing_prompt', '<TRESC PROMPTU>')
--      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
--    TRESC PROMPTU NIE TRAFIA DO REPO (repo tn-crm jest publiczne).
-- 3. NIE dodawaj 'stworze_sparing_prompt' do anon-whitelisty settings
--    (patrz wzorzec per-key policy) — prompt czyta wylacznie spar-chat service_role'em;
--    whitelist = wyciek promptu przez publiczne API.
-- 4. Deploy funkcji: npx supabase functions deploy spar-chat --no-verify-jwt
--    (sekret ANTHROPIC_API_KEY juz ustawiony w Edge Secrets).
-- 5. Smoke test RLS: anon (sb_publishable_*) na /rest/v1/spar_sessions
--    musi dostac pusto/deny; authenticated w CRM widzi sesje (SELECT).
