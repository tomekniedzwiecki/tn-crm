-- Followupy mailowe lejka /rozmowa (lead-talk) — seria dla leadów BEZ wystawionej oferty.
-- Treść generowana JIT przez GPT (env TALK_FOLLOWUP_MODEL) w edge talk-followups.
create table if not exists talk_followups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  session_id uuid references talk_sessions(id) on delete set null,
  kind text not null,
  subject text,
  body_text text,
  html text,
  status text not null default 'pending', -- pending|sent|cancelled|error
  sent_at timestamptz,
  resend_id text,
  error text,
  created_at timestamptz not null default now(),
  unique (lead_id, kind)
);
create index if not exists idx_talk_followups_lead on talk_followups(lead_id);
alter table talk_followups enable row level security;
create policy talk_followups_authenticated_select on talk_followups
  for select to authenticated using (true);
-- zapis wyłącznie service-role (edge talk-followups omija RLS)

-- ręczne wyciszenie serii per lead (ustawiane z CRM; cron respektuje)
alter table leads add column if not exists followups_muted_at timestamptz;
