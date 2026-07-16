-- 20260716d_wfa_ai_billing.sql — CENTRALNY zrzut rozliczenia AI apek fabryki (§6 EKONOMIKA-AI-ROZLICZENIE).
-- =============================================================================
-- Apki AI (Dobry Wstęp, …) żyją w OSOBNYCH projektach Supabase. Każda co miesiąc pcha tu (cron
-- ai-billing-cron w apce → REST z service-key tn-crm) rozliczalne zużycie AI SWOICH userów =
-- kwota do refaktury operatora (obok rev-share). Zbiorczo dla widoku rozliczeń Tomka + reconciliacji.
--
-- RLS: dostęp WYŁĄCZNIE zespół (team_members) — wzór wfa_projects_team_all. Zapis idzie service-rolem
-- (REST z apki omija RLS), ale polityka trzyma odczyt/edycję z panelu w rękach zespołu.
-- =============================================================================

create table if not exists public.wfa_ai_billing (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references public.wfa_projects(id) on delete cascade,
  period          date not null,                       -- 1. dzień rozliczanego miesiąca
  total_pln       numeric(12,2) not null default 0,    -- rozliczalne (billable) po kursie NBP z dnia × narzut
  total_usd       numeric(12,4) not null default 0,    -- rozliczalne w USD (koszt bazowy)
  breakdown       jsonb not null default '{}'::jsonb,  -- {area: {usd, pln, count}}
  nonbillable_usd numeric(12,4) not null default 0,    -- koszt własny fabryki (testy/podglądy) — do reconciliacji
  users           int not null default 0,
  preparations    int not null default 0,
  sims            int not null default 0,
  reports         int not null default 0,
  created_at      timestamptz not null default now(),
  unique (project_id, period)                          -- 1 wiersz na apkę/miesiąc (upsert on_conflict)
);

create index if not exists wfa_ai_billing_period_idx on public.wfa_ai_billing (period desc);

alter table public.wfa_ai_billing enable row level security;

create policy wfa_ai_billing_team_all on public.wfa_ai_billing
  for all to authenticated
  using (exists (select 1 from public.team_members tm where tm.user_id = auth.uid()))
  with check (exists (select 1 from public.team_members tm where tm.user_id = auth.uid()));

-- =============================================================================
-- Podgląd:  select project_id, period, total_pln, nonbillable_usd from wfa_ai_billing order by period desc;
-- =============================================================================
