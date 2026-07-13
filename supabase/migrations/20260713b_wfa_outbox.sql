-- ============================================================================
-- WFA — kanał maili WYCHODZĄCYCH do PARTNERA (operatora aplikacji) per projekt.
-- Pełny rejestr maili wysyłanych do klienta-operatora projektu TN App.
--   Wysyłka przez Resend (edge: wfa-partner-mail) → INSERT do wfa_outbox.
-- Komplementarne do wfa_inbox (maile PRZYCHODZĄCE klientów końcowych).
-- Wzorzec RLS/tabeli = 20260713_wfa_inbox.sql (ZERO polityk anon, tylko zespół).
-- ============================================================================

-- ── wfa_outbox: maile wychodzące do partnera (1 wiersz = 1 wysłany mail) ──────
CREATE TABLE IF NOT EXISTS public.wfa_outbox (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES public.wfa_projects(id) ON DELETE CASCADE,
  to_email    text NOT NULL,                       -- adresat (domyślnie customer_email projektu)
  subject     text NOT NULL,
  body_text   text NOT NULL,                        -- treść plain-text
  kind        text NOT NULL DEFAULT 'custom',       -- typ maila (np. 'custom', 'onboarding'…)
  actor       text NOT NULL DEFAULT 'auto',         -- 'auto' = sesja Claude (service-role), 'admin' = Tomek z panelu
  resend_id   text,                                 -- id maila w Resend (gdy wysyłka OK)
  status      text NOT NULL DEFAULT 'sent'
              CHECK (status IN ('sent','failed')),
  error       text,                                 -- komunikat błędu (gdy status='failed')
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Indeks: lista maili per projekt, najnowsze pierwsze
CREATE INDEX IF NOT EXISTS wfa_outbox_project_created_idx
  ON public.wfa_outbox (project_id, created_at DESC);

-- ── RLS: tylko zespół (team_members) — ZERO polityk anon (wzorzec wfa_*) ───────
ALTER TABLE public.wfa_outbox ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wfa_outbox_team_all ON public.wfa_outbox;
CREATE POLICY wfa_outbox_team_all ON public.wfa_outbox
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = auth.uid()));

COMMENT ON TABLE public.wfa_outbox IS
  'WFA: rejestr maili wychodzących do partnerów (operatorów) per projekt TN App. Wysyłka: edge wfa-partner-mail → Resend.';
