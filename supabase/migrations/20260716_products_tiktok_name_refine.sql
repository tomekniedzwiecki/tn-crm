-- Biblioteka produktów (/tn-workflow/products) zasilana z radaru trendów TikTok:
-- 1) tiktok_url na workflow_products — osadzenie wideo TikTok przy produkcie (admin + picker klienta)
-- 2) name_refined_at na bud_tt_products — znacznik "nazwa dopracowana z tytułu AliExpress"
--    (krok fabryki: bud-ali-snapshot dopracowuje pl_name po pobraniu snapshotu; key NIGDY nie zmieniany)
-- APPLIED 2026-07-16 przez MCP (execute_sql) — plik dla spójności repo.
alter table workflow_products add column if not exists tiktok_url text;
alter table bud_tt_products add column if not exists name_refined_at timestamptz;
