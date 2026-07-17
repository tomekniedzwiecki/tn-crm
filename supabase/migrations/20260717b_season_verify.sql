-- SEZONOWOŚĆ POPYTU v2 (audyt+projekt 2026-07-17; SSOT: docs/zbuduje/SEZONOWOSC.md):
-- weryfikowalność oznaczeń + priorytet źródeł (data > manual > rule > llm2 > draft) —
-- re-skan nigdy nie nadpisuje ręcznej korekty. workflow_products dostaje season_type
-- (eksport przenosił okno, ale nie typ). Naprawa danych wykonana przy migracji:
-- 3 motywy→all_year (projektor "Halloween", lampka "Wielkanoc", pianownica),
-- okna do realiów PL: lato →08-31, ogród/grill →09-30 (prompt ucinał szczyt o 3-6 tyg.).
-- APPLIED 2026-07-17 przez MCP — plik dla spójności repo.
alter table bud_tt_products add column if not exists season_source text default 'draft';
alter table bud_tt_products add column if not exists season_verified boolean default false;
alter table bud_tt_products add column if not exists season_verified_by uuid;
alter table bud_tt_products add column if not exists season_verified_at timestamptz;
alter table workflow_products add column if not exists season_type text;
update bud_tt_products set season_verified=true, season_source='rule' where season_type='all_year' and season_verified=false;
