-- 20260717f_wfa_activation_stats.sql — CENTRALNY zrzut AKTYWACJI apek fabryki (ONBOARDING-FABRYKA §7b + §1.16).
-- =============================================================================
-- Apki mikro-SaaS fabryki żyją w OSOBNYCH projektach Supabase. Każda nocnym cronem pcha tu
-- (ta sama rura co ai-billing: cron w apce → edge `wfa-activation-ingest` z WFA_INGEST_SECRET)
-- SWOJE metryki onboardingu z `admin-stats` scope `onboarding`: signups/activated/TTFV/D7/habit +
-- rozbicie po wariancie A/B i po segmencie. Centrala agreguje MEDIANY per NISZA → realne progi
-- §1.16 (activation target ≥35-40%, TTFV mediana) zamiast zgadywania. „Uczenie między apkami" —
-- waga rośnie z każdą apką.
--
-- IDENTYTA WIERSZA = (project_slug, snapshot_date). `project_slug` jest ZAWSZE obecny (apka pcha
-- swój slug), bo apka nie zawsze jest projektem w tn-crm; `project_id` to opcjonalny FK domykany
-- gdy istnieje pasujący wfa_projects.slug. Unikat na project_id byłby dziurawy przy NULL (NULLe są
-- w Postgresie różne → upsert by nie łapał apek-nie-projektów), więc klucz naturalny to slug.
--
-- RLS: dostęp WYŁĄCZNIE zespół (team_members) — wzór wfa_ai_billing/wfa_projects_team_all. Zapis
-- idzie service-rolem z edge (omija RLS); polityka trzyma odczyt/edycję z panelu w rękach zespołu.
-- ŻADNEGO anon, ŻADNEGO USING(true).
-- =============================================================================

create table if not exists public.wfa_activation_stats (
  id                 uuid primary key default gen_random_uuid(),
  project_slug       text not null,                        -- kebab-slug apki (stabilna tożsamość, zawsze obecny)
  project_id         uuid references public.wfa_projects(id) on delete set null,  -- domknięte gdy apka = projekt
  niche              text,                                 -- nisza/kategoria (do agregacji median PER NISZA)
  snapshot_date      date not null,                        -- dzień zrzutu (kohorta okna liczona po stronie apki)
  signups            int not null default 0,               -- signed_up w oknie
  activated          int not null default 0,               -- activated w oknie
  activation_rate    numeric(6,2),                         -- % (apka liczy; fallback = activated/signups)
  ttfv_median_min    numeric(12,2),                        -- MEDIANA TTFV w minutach (§1.15 — nie średnia)
  setup_rate_pct     numeric(6,2),                         -- % setup_completed (§1.16 setup rate)
  d7_retention_pct   numeric(6,2),                         -- % D7 retention
  habit_rate_pct     numeric(6,2),                         -- % habit (TTCV/nawyk — predyktor retencji)
  by_variant         jsonb not null default '{}'::jsonb,   -- {variant: {signups, activated, activation_rate, ttfv_median_min}}
  by_segment         jsonb not null default '{}'::jsonb,   -- {segment: {signups, activated, activation_rate, ttfv_median_min}}
  raw                jsonb not null default '{}'::jsonb,   -- surowy payload (lejek/drop-off, rozkład TTFV, meta)
  updated_at         timestamptz not null default now(),
  created_at         timestamptz not null default now(),
  unique (project_slug, snapshot_date)                     -- 1 wiersz na apkę/dzień (upsert on_conflict)
);

create index if not exists wfa_activation_stats_date_idx    on public.wfa_activation_stats (snapshot_date desc);
create index if not exists wfa_activation_stats_niche_idx   on public.wfa_activation_stats (niche, snapshot_date desc);
create index if not exists wfa_activation_stats_slug_idx    on public.wfa_activation_stats (project_slug, snapshot_date desc);
create index if not exists wfa_activation_stats_project_idx on public.wfa_activation_stats (project_id);

alter table public.wfa_activation_stats enable row level security;

-- Zespół (team_members) — pełen dostęp z panelu (authenticated). Publiczna rejestracja sparingu daje
-- rolę 'authenticated' każdemu, więc bramka MUSI być na team_members, nie na samej roli.
create policy wfa_activation_stats_team_all on public.wfa_activation_stats
  for all to authenticated
  using (exists (select 1 from public.team_members tm where tm.user_id = auth.uid()))
  with check (exists (select 1 from public.team_members tm where tm.user_id = auth.uid()));

-- =============================================================================
-- Podgląd (per NISZA, ostatni snapshot każdej apki):
--   select niche, project_slug, snapshot_date, activation_rate, ttfv_median_min, d7_retention_pct
--   from wfa_activation_stats order by niche, snapshot_date desc;
-- =============================================================================
