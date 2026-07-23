-- ============================================================================
-- ZGODA NA PUBLIKACJĘ W GALERII „INSPIRACJE" (opt-in, cofalna) — lejek /aplikacja
-- Plan: data-private/prawne-aplikacja/SPEC-POPRAWKI-LEJKA.md (P1)
-- Wzór zgody: data-private/prawne-aplikacja/ZGODA-PUBLIKACJA-INSPIRACJE-DRAFT.md
-- Kanon prawny: https://tomekniedzwiecki.pl/aplikacja/regulamin/ §11
--
-- Zasada (decyzja Tomka 23.07.2026): domyślnie BRAK zgody. Realna rozmowa
-- klienta NIGDY nie pojawia się w galerii Inspiracje bez ważnej zgody. Zgoda
-- jest cofalna — cofnięcie = zniknięcie z galerii (twardy filtr feedu).
--
-- Kolumny na spar_sessions:
--   inspiracje_consent_at         — moment wyrażenia zgody (NULL = brak zgody = nie publikujemy)
--   inspiracje_consent_version    — wersja treści klauzuli (np. 'v1-2026-07-23')
--   inspiracje_consent_text       — snapshot treści zgody w chwili jej wyrażenia (trwały ślad)
--   inspiracje_consent_source     — kanał: 'sparing_ui' (klient) | 'panel' (admin)
--   inspiracje_consent_revoked_at — moment cofnięcia (NOT NULL = zgoda cofnięta = nie publikujemy)
--
-- Warunek widoczności w Inspiracjach dla REALNEJ rozmowy klienta (is_test=false):
--   inspiracje_consent_at IS NOT NULL AND inspiracje_consent_revoked_at IS NULL
-- Treści testowe / seed Tomka (is_test=true + showcase=true) — bez wymogu zgody klienta.
--
-- ⛔ RLS BEZ ZMIAN. spar_sessions ma polityki wyłącznie dla `authenticated`
-- (team_members: read+update; owner_select) — ZERO polityk `anon`. Zgodę
-- zapisuje edge spar-project kluczem service-role (omija RLS). Anon (front
-- sparingu, SB_PUBLISHABLE) NIC nie pisze bezpośrednio do spar_sessions.
-- Ta migracja dodaje wyłącznie kolumny — nie tworzy żadnej nowej polityki,
-- więc anon nadal nie może zapisać niczego.
-- ============================================================================

ALTER TABLE public.spar_sessions ADD COLUMN IF NOT EXISTS inspiracje_consent_at         timestamptz;
ALTER TABLE public.spar_sessions ADD COLUMN IF NOT EXISTS inspiracje_consent_version    text;
ALTER TABLE public.spar_sessions ADD COLUMN IF NOT EXISTS inspiracje_consent_text       text;
ALTER TABLE public.spar_sessions ADD COLUMN IF NOT EXISTS inspiracje_consent_source     text;
ALTER TABLE public.spar_sessions ADD COLUMN IF NOT EXISTS inspiracje_consent_revoked_at timestamptz;

-- CHECK na źródło zgody (dopuszcza NULL = brak zgody). Drop+recreate = idempotentne.
ALTER TABLE public.spar_sessions DROP CONSTRAINT IF EXISTS spar_sessions_inspiracje_consent_source_chk;
ALTER TABLE public.spar_sessions
  ADD CONSTRAINT spar_sessions_inspiracje_consent_source_chk
  CHECK (inspiracje_consent_source IS NULL OR inspiracje_consent_source IN ('sparing_ui','panel'));

COMMENT ON COLUMN public.spar_sessions.inspiracje_consent_at         IS 'Zgoda na publikację zanonimizowanego przykładu w galerii Inspiracje (opt-in; NULL = brak zgody = nie publikujemy). Regulamin §11.';
COMMENT ON COLUMN public.spar_sessions.inspiracje_consent_version    IS 'Wersja treści klauzuli zgody (np. v1-2026-07-23).';
COMMENT ON COLUMN public.spar_sessions.inspiracje_consent_text       IS 'Snapshot pełnej treści zgody w chwili jej wyrażenia (trwały ślad / dowód zgody).';
COMMENT ON COLUMN public.spar_sessions.inspiracje_consent_source     IS 'Kanał zgody: sparing_ui (klient w lejku) | panel (admin).';
COMMENT ON COLUMN public.spar_sessions.inspiracje_consent_revoked_at IS 'Moment cofnięcia zgody (NOT NULL = zgoda cofnięta = znika z galerii; zapis at/version zostaje jako ślad).';
