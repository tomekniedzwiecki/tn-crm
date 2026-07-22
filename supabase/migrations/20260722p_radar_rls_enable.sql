-- RLS dla tabel radaru — lint Supabase `rls_disabled_in_public` (ERROR, 22.07).
--
-- Obie tabele są używane WYŁĄCZNIE przez:
--   * edge functions (bud-shop-radar itd.) — SUPABASE_SERVICE_ROLE_KEY, omija RLS;
--   * joby pg_cron (bud_radar_next_queries w bud-radar-scan) — rola postgres = owner
--     tabel, bez FORCE ROW LEVEL SECURITY nie podlega RLS.
--
-- Włączenie RLS BEZ ŻADNYCH polityk = deny-all dla anon/authenticated przez
-- PostgREST — dokładnie to, czego chcemy: authenticated ≠ admin (wspólna baza ma
-- zalogowanych klientów spar_*), a wcześniejsze uzasadnienie „bez RLS, bo legacy
-- anon OFF" (20260717e) nie chroniło przed authenticated. Zero wpływu na pipeline.

ALTER TABLE public.bud_radar_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bud_radar_sellers ENABLE ROW LEVEL SECURITY;
