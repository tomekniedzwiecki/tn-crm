-- 20260720_fix_client_read_global_products.sql
--
-- BUG: portal klienta (client-projekt.html, rola anon) nie pokazywal ZADNYCH produktow
-- w zakladce "Produkty" / kaflu wyboru, mimo ze products_shared_at bylo ustawione.
--
-- Root cause: katalog produktow jest GLOBALNY -- wszystkie wiersze workflow_products maja
-- workflow_id IS NULL (patrz 20260129_products_global.sql; loadAllData czyta
-- .is('workflow_id', null).eq('visible_to_client', true).eq('is_active', true)).
-- Reharden token-gatingu (20260713_reharden_portal_token_rls.sql, wczesniej
-- 20260614_portal_token_rls_step2.sql) ustawil polityke anon "Client read products" na
-- USING (wf_token_ok(workflow_id)). wf_token_ok(NULL) = FALSE (jawny warunek wf_id IS NOT NULL),
-- wiec anon nie widzi ani jednego wiersza katalogu. Admin (authenticated) widzi wszystko przez
-- polityke "Admin full access", dlatego blad byl niewidoczny w admin_preview.
--
-- Fix: anon (klient z WAZNYM x-wf-token) moze czytac globalny katalog widoczny dla klienta.
-- Per-workflow produkty (gdyby kiedys byly) pozostaja bramkowane wlasnym tokenem.
-- INVARIANT ZACHOWANY: bez x-wf-token anon nadal widzi 0 wierszy (wf_any_token_ok() = FALSE).
-- Tabele z PII (workflows, workflow_takedrop) NIETKNIETE.

-- Helper: czy naglowek x-wf-token odpowiada JAKIEMUKOLWIEK istniejacemu workflow.
-- SECURITY DEFINER (jak wf_token_ok) -> omija RLS na workflows, zwraca tylko boolean.
CREATE OR REPLACE FUNCTION public.wf_any_token_ok()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workflows w
    WHERE w.unique_token = current_setting('request.headers', true)::json->>'x-wf-token'
  );
$$;

GRANT EXECUTE ON FUNCTION public.wf_any_token_ok() TO anon, authenticated;

ALTER POLICY "Client read products" ON public.workflow_products
  USING (
    public.wf_token_ok(workflow_id)
    OR (
      workflow_id IS NULL
      AND visible_to_client = true
      AND is_active = true
      AND public.wf_any_token_ok()
    )
  );

-- Weryfikacja (rola anon):
--   z waznym x-wf-token  -> katalog widoczny (visible_to_client=true, is_active=true)
--   bez x-wf-token       -> 0 wierszy (workflow_products ORAZ wszystkie workflow_* z PII)
