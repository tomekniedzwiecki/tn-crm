-- 20260716e_ai_openai_bills.sql — realny miesięczny rachunek OpenAI Tomka (wpisywany RĘCZNIE).
-- =============================================================================
-- Do RECONCILIACJI (§6 EKONOMIKA-AI-ROZLICZENIE): panel liczy szacunek rachunku OpenAI jako
-- Σ(billable total_usd wszystkich apek) + Σ(nonbillable_usd wszystkich apek) za miesiąc. Tomek
-- wpisuje tu REALNY rachunek z faktury OpenAI (USD) → różnica = koszt czystego dev/fabryki poza
-- apkami. Pozwala zweryfikować, że refaktura operatorów pokrywa faktyczny koszt tokena Tomka.
--
-- RLS: dostęp WYŁĄCZNIE zespół (team_members) — wzór wfa_ai_billing_team_all.
-- =============================================================================

create table if not exists public.ai_openai_bills (
  period      date primary key,                    -- 1. dzień rozliczanego miesiąca
  amount_usd  numeric(12,2) not null default 0,    -- realny rachunek OpenAI za miesiąc (USD, z faktury)
  note        text,                                -- opcjonalny komentarz (np. „w tym $5 na obrazy")
  updated_at  timestamptz not null default now()
);

alter table public.ai_openai_bills enable row level security;

create policy ai_openai_bills_team_all on public.ai_openai_bills
  for all to authenticated
  using (exists (select 1 from public.team_members tm where tm.user_id = auth.uid()))
  with check (exists (select 1 from public.team_members tm where tm.user_id = auth.uid()));

-- =============================================================================
-- Podgląd:  select * from ai_openai_bills order by period desc;
-- =============================================================================
