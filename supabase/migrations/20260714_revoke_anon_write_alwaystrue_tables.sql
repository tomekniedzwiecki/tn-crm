-- 2026-07-14 — Domknięcie always-true UPDATE (linter: rls_policy_always_true).
-- tn_ad_alerts / tn_ad_recommendations (ads wewnętrzne, pisane przez admin/cron=service-role)
-- oraz whatsapp_widget_status (pisane tylko przez panel admina whatsapp-settings.html, team_members)
-- miały politykę USING/CHECK=true → z grantem anon KAŻDY mógł nadpisać dowolny wiersz (tampering).
-- Żaden front kliencki (anon) w nie nie pisze → rewokujemy write anon (admin/service nietknięci).
REVOKE INSERT, UPDATE, DELETE ON public.tn_ad_alerts FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.tn_ad_recommendations FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.whatsapp_widget_status FROM anon;
-- Zbędna już polityka anon (grant zdjęty, ale sprzątamy dla jasności):
DROP POLICY IF EXISTS "Anon can update whatsapp_widget_status" ON public.whatsapp_widget_status;
