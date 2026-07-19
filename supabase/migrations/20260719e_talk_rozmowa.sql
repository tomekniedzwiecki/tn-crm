-- Moduł "Rozmowa" — nowe okno rozmowy AI dla leadów z /zapisy (lejek /zbuduje przywrócony 17.07).
-- Czysta rozmowa (zero artefaktów): angażuje, kwalifikuje, opowiada warunki, prowadzi do rezerwacji 500 zł.
-- Transkrypcja widoczna w CRM na stronie leada (lead.html) — wzorzec 1:1 z bud_sessions/bud_messages.
-- Zapis WYŁĄCZNIE przez edge function lead-talk (service_role). Zero polityk anon.

create table if not exists talk_sessions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  turns int not null default 0,
  last_phase text,
  -- stemple dramaturgii/obiekcji: [{t:'faza_model', at:'2026-07-19T...'}, ...]
  tags jsonb not null default '[]'::jsonb,
  is_test boolean not null default false
);
create index if not exists idx_talk_sessions_lead on talk_sessions(lead_id);

create table if not exists talk_messages (
  id bigint generated always as identity primary key,
  session_id uuid not null references talk_sessions(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_talk_messages_session on talk_messages(session_id);
create index if not exists idx_talk_messages_recent on talk_messages(session_id, created_at);

alter table talk_sessions enable row level security;
alter table talk_messages enable row level security;

-- Odczyt tylko dla zalogowanego admina CRM (jak bud_*); pisze wyłącznie service_role (omija RLS).
drop policy if exists talk_sessions_authenticated_select on talk_sessions;
create policy talk_sessions_authenticated_select on talk_sessions
  for select to authenticated using (true);

drop policy if exists talk_messages_authenticated_select on talk_messages;
create policy talk_messages_authenticated_select on talk_messages
  for select to authenticated using (true);
