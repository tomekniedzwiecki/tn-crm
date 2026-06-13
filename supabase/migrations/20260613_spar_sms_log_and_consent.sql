-- Log SMS sekwencji odkrywania (równolegle do spar_emails) + zgoda/opt-out na poziomie sesji.
-- Zastosowane na remote 2026-06-13 (MCP apply_migration spar_sms_log_and_consent).
create table if not exists spar_sms (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references spar_sessions(id) on delete cascade,
  kind text not null,                       -- ten sam co mail, który SMS reaktywuje (np. reveal_rynek)
  phone text,
  message text,
  smsapi_id text,
  points numeric,
  status text,                              -- QUEUE/SENT/DELIVERED/ERROR...
  clicked_at timestamptz,
  meta jsonb,
  created_at timestamptz not null default now(),
  unique(session_id, kind)                  -- jeden SMS na odsłonę na sesję (idempotencja)
);
create index if not exists spar_sms_session_idx on spar_sms(session_id);
alter table spar_sms enable row level security;
drop policy if exists "spar_sms admin read" on spar_sms;
create policy "spar_sms admin read" on spar_sms for select to authenticated using (true);

-- Zgoda na SMS (znacznik czasu, gdy oddał numer po uczciwej informacji przy bramce)
-- i opt-out (STOP). Service role i tak omija RLS przy zapisie.
alter table spar_sessions add column if not exists sms_consent_at timestamptz;
alter table spar_sessions add column if not exists sms_opt_out boolean not null default false;
