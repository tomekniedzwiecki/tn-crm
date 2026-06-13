-- Brandowane krótkie linki do panelu w SMS: tomekniedzwiecki.pl/p/{code} → panel sesji.
-- Jeden kod na sesję (reużywany przez wszystkie SMS-y tej sesji).
-- Zastosowane na remote 2026-06-13 (MCP apply_migration spar_short_links).
create table if not exists spar_short_links (
  code text primary key,
  session_id uuid not null references spar_sessions(id) on delete cascade,
  clicks int not null default 0,
  created_at timestamptz not null default now(),
  unique (session_id)
);
alter table spar_short_links enable row level security;
drop policy if exists "spar_short_links admin read" on spar_short_links;
create policy "spar_short_links admin read" on spar_short_links for select to authenticated using (true);
