-- 03-SCHEMAT-DB — Dobry Wstęp (DRAFT sesji fabryki, 2026-07-15)
-- TYLKO tabele niszy. Fundament (profiles, subskrypcje, email_log, app_settings, app_events,
-- referrals itd.) = migracje 0001-000x saas-startera. Aplikuje krok `schemat_db` (sesja S2)
-- PO zatwierdzeniu MVP. RLS: per auth.uid(), polityki S/I/U/D OSOBNO; operator przez is_operator().

-- ── Przygotowania ────────────────────────────────────────────────────────────
create table preparations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- spotkanie
  meeting_context text not null default 'klient',        -- klient|networking|rekrutacja|firmowe|inne
  meeting_at timestamptz,                                 -- termin (ręcznie, D13)
  company_name text not null default '',
  company_url text not null default '',
  contact_name text not null default '',
  contact_role text not null default '',
  contact_pasted_info text not null default '',           -- wklejka usera (LinkedIn itp., D2)
  goal text not null default '',                          -- cel spotkania
  next_step_what text not null default '',                -- następny krok: co
  next_step_who text not null default '',                 --                kto
  next_step_when text not null default '',                --                do kiedy
  plan_b text not null default '',                        -- opcjonalny (minimalny rezultat)
  -- stan
  status text not null default 'draft'                    -- draft|researching|facts|planned|trained|examined
    check (status in ('draft','researching','facts','planned','trained','examined')),
  readiness_pct int not null default 0,                   -- cache; liczone deterministycznie
  readiness_gaps jsonb not null default '[]'::jsonb,      -- lista braków
  keep_transcript boolean not null default false,         -- opt-in D10 (per przygotowanie)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on preparations (user_id, created_at desc);

-- ── Fakty researchu (etykiety wiarygodności) ────────────────────────────────
create table prep_facts (
  id uuid primary key default gen_random_uuid(),
  preparation_id uuid not null references preparations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,  -- denormalizacja pod RLS
  category text not null default 'firma'                  -- firma|rozmowca|rynek|oferta
    check (category in ('firma','rozmowca','rynek','oferta')),
  content text not null,
  label text not null default 'wniosek_ai'                -- potwierdzone|wniosek_ai|do_sprawdzenia
    check (label in ('potwierdzone','wniosek_ai','do_sprawdzenia')),
  source text not null default '',                        -- URL/„user”/„web search”
  approved boolean not null default false,                -- zatwierdzenie usera (bramka planu)
  ask_client boolean not null default false,              -- „Nie wiem — zapytaj klienta”
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create index on prep_facts (preparation_id, category, sort);

-- ── Plan rozmowy (wersjonowany; interakcje w jsonb) ─────────────────────────
create table prep_plans (
  id uuid primary key default gen_random_uuid(),
  preparation_id uuid not null references preparations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  version int not null default 1,
  sections jsonb not null default '{}'::jsonb,
  -- {otwarcie:[{id,text}], pytania:[...], problem:{text}, wartosc:{text},
  --  obiekcje:[{id,obiekcja,reakcja}], do_ustalenia:[...], followup:{text}}
  marks jsonb not null default '{}'::jsonb,               -- {"<itemId>": {read,important,favorite,copied}}
  created_at timestamptz not null default now()
);
create unique index on prep_plans (preparation_id, version);

-- ── Symulacje ────────────────────────────────────────────────────────────────
create table prep_sims (
  id uuid primary key default gen_random_uuid(),
  preparation_id uuid not null references preparations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null default 'trening' check (mode in ('trening','egzamin')),
  persona_mode text not null default 'neutralny' check (persona_mode in ('konkretny','neutralny')), -- D5/D6
  difficulty int not null default 2 check (difficulty between 1 and 4),  -- auto + ręczna zmiana
  status text not null default 'active' check (status in ('active','finished','abandoned')),
  close_attempted boolean not null default false,          -- wymuszone domknięcie (D7)
  started_at timestamptz not null default now(),
  finished_at timestamptz
);
create index on prep_sims (preparation_id, started_at desc);

create table prep_sim_messages (
  id uuid primary key default gen_random_uuid(),
  sim_id uuid not null references prep_sims(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','ai','trener')),  -- trener = podpowiedzi w treningu
  content text not null default '',                       -- CZYSZCZONE po raporcie (D10), chyba że keep_transcript
  close_attempt boolean not null default false,            -- flaga AI per tura
  created_at timestamptz not null default now()
);
create index on prep_sim_messages (sim_id, created_at);

-- ── Raporty (trwałe — treść rozmowy NIE jest potrzebna do historii) ─────────
create table prep_reports (
  id uuid primary key default gen_random_uuid(),
  sim_id uuid not null references prep_sims(id) on delete cascade,
  preparation_id uuid not null references preparations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  score numeric(3,1) not null,                             -- 1.0–10.0
  subscores jsonb not null default '{}'::jsonb,            -- {cel:40..., pytania:25..., obiekcje:20..., pewnosc:15...}
  close_result text not null default 'brak' check (close_result in ('sukces','czesciowy','brak')),
  quotes jsonb not null default '[]'::jsonb,               -- krótkie, ZANONIMIZOWANE (D11)
  insights text not null default '',                       -- wnioski trenera
  retry jsonb,                                             -- {wskazowka, close_result_2, quotes_2} — 1 powtórka; NIE zmienia score
  transcript_wiped_at timestamptz,                         -- dowód D10
  created_at timestamptz not null default now()
);
create index on prep_reports (user_id, created_at desc);

-- ── RLS (szkic — pełne polityki w migracji) ─────────────────────────────────
-- KAŻDA tabela: enable row level security; polityki select/insert/update/delete
-- osobno, wszystkie: user_id = auth.uid(). ZERO anon. Operator: agregaty WYŁĄCZNIE
-- przez edge fn (service-role) — bez polityk operatora na danych treści (prywatność
-- researchu/rozmów: operator widzi LICZBY, nie treść przygotowań userów!).

-- ── Limity / usage ───────────────────────────────────────────────────────────
-- Licznik przygotowań w okresie rozliczeniowym: COUNT(preparations) w edge fn prep-research
-- (service-role) vs limit planu (PLAN_SOLO_PREP_LIMIT / bez limitu Pro). Bez osobnej tabeli.

-- ── Retencja (cron, krok późniejszy — 0002_cron per apka) ───────────────────
-- prep-retention: DELETE content transkryptów keep_transcript=true starszych niż 90 dni
-- + kasowanie osieroconych simów 'active' > 24h (abandoned).
