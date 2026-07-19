-- Twardy dedup nazw PARASOLOWYCH między projektami: bud_brand_names wymaga
-- product_id (mini-marki), więc parasol nie miał żadnej rezerwacji — dwa
-- projekty mogły wybrać tę samą nazwę zanim domena zostanie kupiona.
-- ⚠️ NIEZAAPLIKOWANA w sesji 19.07 (MCP Supabase padł mid-session, a db push
-- niebezpieczny przy rozjechanej historii CLI) — zaaplikować przez MCP
-- apply_migration w najbliższej sesji. Prompt kroku 'marka' ma miękki check
-- (SELECT po lower(name)) do tego czasu.
CREATE UNIQUE INDEX IF NOT EXISTS wf2_projects_name_unique
  ON public.wf2_projects (lower(name))
  WHERE name <> '';
