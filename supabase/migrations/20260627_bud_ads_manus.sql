-- /sklep (Zbuduję): generacja kreacji reklamowych przez agenta Manus (jak manus-full-campaign),
-- zamiast Gemini. Async: bud-ads tworzy task Manus → bud-ads (poll przy froncie) dociąga PNG-i.
-- Pola stanu na bud_sessions (session_ads jsonb JUŻ istnieje — front czyta [{headline,primary_text,image_url}]).
ALTER TABLE public.bud_sessions
  ADD COLUMN IF NOT EXISTS ads_manus_task_id     text,
  ADD COLUMN IF NOT EXISTS ads_manus_status      text,        -- running | completed | failed (NULL = nie startowano)
  ADD COLUMN IF NOT EXISTS ads_manus_step        text,        -- timeout | task_expired | no_output (diagnostyka porażki)
  ADD COLUMN IF NOT EXISTS ads_manus_started_at   timestamptz,
  ADD COLUMN IF NOT EXISTS ads_manus_completed_at timestamptz;

-- szybkie wyszukanie sesji z aktywnym taskiem (poller / ewentualny cron)
CREATE INDEX IF NOT EXISTS idx_bud_sessions_ads_manus
  ON public.bud_sessions(ads_manus_status) WHERE ads_manus_status = 'running';
