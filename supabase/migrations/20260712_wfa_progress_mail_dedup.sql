-- Drip „mail o postępie": dedup wysyłki per krok-kamień (edge wfa-progress-drip).
-- Zaaplikowane na prod 12.07.2026.
alter table public.wfa_steps
  add column if not exists progress_mail_sent_at timestamptz;

-- Backfill: wszystkie JUŻ ukończone kroki oznacz jako powiadomione — NIE wysyłamy zaległych
-- maili wstecz przy pierwszym uruchomieniu crona. Maile pójdą tylko za NOWE przejścia na done.
update public.wfa_steps
  set progress_mail_sent_at = now()
  where status = 'done' and progress_mail_sent_at is null;

-- Harmonogram (pg_cron) — dokumentacyjnie; zaaplikowany przez cron.schedule:
--   select cron.schedule('wfa-progress-drip-cron', '40 * * * *', $$
--     SELECT net.http_post(
--       url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wfa-progress-drip',
--       headers := '{"Content-Type":"application/json","x-cron-secret":"<WFA_CRON_SECRET>"}'::jsonb,
--       body := '{}'::jsonb); $$);
