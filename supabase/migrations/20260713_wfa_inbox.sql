-- ============================================================================
-- WFA — moduł „Skrzynki" (wfa-inbox)
-- Centralna obsługa maili przychodzących WSZYSTKICH domen aplikacji.
-- MX apeksu domeny → Resend Inbound → wfa-inbox-webhook → wfa_inbox
--   → panel /tn-app/inbox + auto-forward per projekt.
-- SSOT specyfikacji: SPEC-SKRZYNKI.md
-- Wzorzec RLS/updated_at = 20260711_wfa_foundation.sql (funkcja wfa_touch_updated_at już istnieje).
-- ============================================================================

-- ── wfa_projects: konfiguracja przekazywania per projekt ─────────────────────
ALTER TABLE public.wfa_projects
  ADD COLUMN IF NOT EXISTS inbox_forward_to text;                  -- adres, na który przekazujemy maile domeny
ALTER TABLE public.wfa_projects
  ADD COLUMN IF NOT EXISTS inbox_enabled boolean NOT NULL DEFAULT true;

-- ── wfa_inbox: maile przychodzące (1 wiersz = 1 mail) ────────────────────────
CREATE TABLE IF NOT EXISTS public.wfa_inbox (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid REFERENCES public.wfa_projects(id) ON DELETE SET NULL,  -- NULL = nieprzypisane
  resend_id     text UNIQUE NOT NULL,                  -- id received maila w Resend (idempotencja retry svix)
  message_id    text,                                  -- do reply-in-thread (In-Reply-To/References)
  from_email    text NOT NULL,
  from_name     text,
  to_email      text NOT NULL,                         -- alias/adres, na który przyszło (catch-all)
  subject       text,
  text_body     text,
  html_body     text,                                  -- czysty HTML (data_uri już zdekodowane przy zapisie)
  attachments   jsonb NOT NULL DEFAULT '[]'::jsonb,    -- metadata [{id,filename,content_type,size}]
  received_at   timestamptz NOT NULL DEFAULT now(),
  read_at       timestamptz,
  archived_at   timestamptz,
  forwarded_to  text,
  forwarded_at  timestamptz,
  forward_error text,
  replied_at    timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Indeksy: lista per projekt (najnowsze pierwsze) + szybki licznik nieprzeczytanych (badge)
CREATE INDEX IF NOT EXISTS wfa_inbox_project_received_idx
  ON public.wfa_inbox (project_id, received_at DESC);
CREATE INDEX IF NOT EXISTS wfa_inbox_unread_idx
  ON public.wfa_inbox (received_at DESC)
  WHERE read_at IS NULL AND archived_at IS NULL;

-- updated_at (funkcja public.wfa_touch_updated_at() już istnieje w bazie)
DROP TRIGGER IF EXISTS wfa_inbox_touch ON public.wfa_inbox;
CREATE TRIGGER wfa_inbox_touch BEFORE UPDATE ON public.wfa_inbox
  FOR EACH ROW EXECUTE FUNCTION public.wfa_touch_updated_at();

-- ── RLS: tylko zespół (team_members) — ZERO polityk anon (wzorzec wfa_*) ──────
ALTER TABLE public.wfa_inbox ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wfa_inbox_team_all ON public.wfa_inbox;
CREATE POLICY wfa_inbox_team_all ON public.wfa_inbox
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = auth.uid()));

COMMENT ON TABLE public.wfa_inbox IS
  'WFA Skrzynki: maile przychodzące wszystkich domen aplikacji (Resend Inbound → wfa-inbox-webhook). SSOT: SPEC-SKRZYNKI.md';
