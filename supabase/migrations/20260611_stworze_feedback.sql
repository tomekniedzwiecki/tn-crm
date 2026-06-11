-- /stworze: uwagi/propozycje usera w panelu projektu (stworze-projekt.html)
-- Pisze WYLACZNIE edge function spar-project (service_role). Anon: zero polityk.
CREATE TABLE IF NOT EXISTS public.spar_feedback (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id  uuid NOT NULL REFERENCES public.spar_sessions(id) ON DELETE CASCADE,
  text        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_spar_feedback_session
  ON public.spar_feedback (session_id, created_at);

ALTER TABLE public.spar_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS spar_feedback_auth_select ON public.spar_feedback;
CREATE POLICY spar_feedback_auth_select
  ON public.spar_feedback FOR SELECT
  TO authenticated
  USING (true);

COMMENT ON TABLE public.spar_feedback IS
  'Uwagi i propozycje usera do projektu /stworze (panel). Pisze wylacznie spar-project (service_role).';
