-- 2026-06-14 — KROK 2 portalu klienta: RLS po tokenie z nagłówka.
-- ============================================================================
-- ⛔ NIE APLIKUJ, dopóki na produkcji NIE działa frontend wysyłający nagłówki
--    x-wf-token (client-projekt.html, payment-schedule.html) oraz x-offer-token
--    (client-offer-v2.html, offer-starter.html). Aplikacja przed wdrożeniem
--    frontendu = portal padnie dla klientów (USING(true) -> wymóg tokenu).
-- Sekwencja: 1) wdróż tn-crm  2) potwierdź, że portal/oferta działają
--            3) zaaplikuj tę migrację  4) ponów test portalu.
-- ============================================================================
-- Model: workflows.unique_token (32 zn., unikalny) = sekret klienta. PostgREST
-- przekazuje go w request.headers. Funkcja wf_token_ok() (SECURITY DEFINER)
-- sprawdza, że dany workflow_id należy do workflow o tokenie z nagłówka.
-- Zakres: tabele portalu workflow (x-wf-token) + client_offers (x-offer-token).
-- ODŁOŻONE (osobny pod-krok): orders, payment_schedules, payment_installments
-- (konteksty checkout/oferta po id/lead_id) — dotąd zostają USING(true).

CREATE OR REPLACE FUNCTION public.wf_token_ok(wf_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT wf_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.workflows w
    WHERE w.id = wf_id
      AND w.unique_token = current_setting('request.headers', true)::json->>'x-wf-token'
  );
$$;
GRANT EXECUTE ON FUNCTION public.wf_token_ok(uuid) TO anon, authenticated;

-- ── workflows (token bezpośrednio na unique_token) ──────────────────────────
ALTER POLICY "Anyone can view workflow by token" ON public.workflows
  USING (unique_token = current_setting('request.headers', true)::json->>'x-wf-token');

-- ── workflow_* (zawsze przez workflow_id; zachowujemy istniejące warunki) ────
ALTER POLICY "Client read branding"            ON public.workflow_branding   USING (public.wf_token_ok(workflow_id));
ALTER POLICY "Client read products"            ON public.workflow_products   USING (public.wf_token_ok(workflow_id));
ALTER POLICY "Anyone can view workflow_milestones" ON public.workflow_milestones USING (public.wf_token_ok(workflow_id));
ALTER POLICY "Anyone can view workflow_tasks"  ON public.workflow_tasks      USING (public.wf_token_ok(workflow_id));

ALTER POLICY "Client read comments"            ON public.workflow_comments   USING (public.wf_token_ok(workflow_id));
ALTER POLICY "Client insert comments"          ON public.workflow_comments   WITH CHECK (author_type = 'client'::text AND public.wf_token_ok(workflow_id));

ALTER POLICY "Anon can read reviews"           ON public.workflow_reviews    USING (public.wf_token_ok(workflow_id));
ALTER POLICY "Anon can hide reviews"           ON public.workflow_reviews    USING (public.wf_token_ok(workflow_id)) WITH CHECK (public.wf_token_ok(workflow_id));

ALTER POLICY "Client read visible documents"   ON public.workflow_documents  USING (visible_to_client = true AND public.wf_token_ok(workflow_id));
ALTER POLICY "Client read visible materials"   ON public.workflow_materials  USING (visible_to_client = true AND public.wf_token_ok(workflow_id));
ALTER POLICY "Client read visible reports"     ON public.workflow_reports    USING (visible_to_client = true AND public.wf_token_ok(workflow_id));

ALTER POLICY "Client read active video"        ON public.workflow_video      USING (is_active = true AND public.wf_token_ok(workflow_id));
ALTER POLICY "Client update own data"          ON public.workflow_video      USING (is_active = true AND public.wf_token_ok(workflow_id)) WITH CHECK (is_active = true AND public.wf_token_ok(workflow_id));

ALTER POLICY "Client read active takedrop"     ON public.workflow_takedrop   USING (is_active = true AND public.wf_token_ok(workflow_id));
ALTER POLICY "Client update legal data"        ON public.workflow_takedrop   USING (is_active = true AND public.wf_token_ok(workflow_id)) WITH CHECK (is_active = true AND public.wf_token_ok(workflow_id));

ALTER POLICY "Anon can read whatsapp config"   ON public.workflow_optimization USING (is_active = true AND public.wf_token_ok(workflow_id));
ALTER POLICY "Anon can update client fields"   ON public.workflow_optimization USING (is_active = true AND public.wf_token_ok(workflow_id)) WITH CHECK (is_active = true AND public.wf_token_ok(workflow_id));

ALTER POLICY "Client read active ads"          ON public.workflow_ads        USING (is_active = true AND public.wf_token_ok(workflow_id));
ALTER POLICY "Client can update workflow_ads"  ON public.workflow_ads        USING (is_active = true AND public.wf_token_ok(workflow_id)) WITH CHECK (is_active = true AND public.wf_token_ok(workflow_id));
ALTER POLICY "Client update partner and budget" ON public.workflow_ads       USING (is_active = true AND public.wf_token_ok(workflow_id)) WITH CHECK (is_active = true AND public.wf_token_ok(workflow_id));
ALTER POLICY "Client can create ads record for partner access" ON public.workflow_ads
  WITH CHECK (workflow_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.workflow_takedrop wt WHERE wt.workflow_id = workflow_ads.workflow_id AND wt.test_accepted = true)
    AND public.wf_token_ok(workflow_id));

ALTER POLICY "Client can view own ad reports"  ON public.workflow_ad_reports USING (auth.role() = 'anon'::text AND public.wf_token_ok(workflow_id));

ALTER POLICY "Anon select orders for active ads" ON public.workflow_orders
  USING (EXISTS (SELECT 1 FROM public.workflow_ads wa WHERE wa.workflow_id = workflow_orders.workflow_id AND wa.is_active = true) AND public.wf_token_ok(workflow_id));
ALTER POLICY "Anon insert orders for active ads" ON public.workflow_orders
  WITH CHECK (EXISTS (SELECT 1 FROM public.workflow_ads wa WHERE wa.workflow_id = workflow_orders.workflow_id AND wa.is_active = true) AND admin_note IS NULL AND public.wf_token_ok(workflow_id));
ALTER POLICY "Anon update orders for active ads" ON public.workflow_orders
  USING (EXISTS (SELECT 1 FROM public.workflow_ads wa WHERE wa.workflow_id = workflow_orders.workflow_id AND wa.is_active = true) AND public.wf_token_ok(workflow_id))
  WITH CHECK (EXISTS (SELECT 1 FROM public.workflow_ads wa WHERE wa.workflow_id = workflow_orders.workflow_id AND wa.is_active = true) AND public.wf_token_ok(workflow_id));
ALTER POLICY "Anon delete orders for active ads" ON public.workflow_orders
  USING (EXISTS (SELECT 1 FROM public.workflow_ads wa WHERE wa.workflow_id = workflow_orders.workflow_id AND wa.is_active = true) AND public.wf_token_ok(workflow_id));

-- access log: token klienta LUB zespół (gdyby admin logował dostęp bez tokenu)
ALTER POLICY "Anyone can insert workflow_access_log" ON public.workflow_access_log
  WITH CHECK (public.wf_token_ok(workflow_id) OR auth.uid() IN (SELECT user_id FROM public.team_members));

-- ── client_offers (x-offer-token) ───────────────────────────────────────────
ALTER POLICY "Allow public read by token"      ON public.client_offers USING (unique_token = current_setting('request.headers', true)::json->>'x-offer-token');
ALTER POLICY "Public can view by token"        ON public.client_offers USING (unique_token = current_setting('request.headers', true)::json->>'x-offer-token');
ALTER POLICY "Allow public read valid client_offers" ON public.client_offers USING (valid_until >= CURRENT_DATE AND unique_token = current_setting('request.headers', true)::json->>'x-offer-token');
ALTER POLICY "Allow public update view count"  ON public.client_offers USING (unique_token = current_setting('request.headers', true)::json->>'x-offer-token') WITH CHECK (unique_token = current_setting('request.headers', true)::json->>'x-offer-token');
-- ta polityka była błędnie TO public (anon-WRITE) — zespół tylko:
ALTER POLICY "Team members can manage client offers" ON public.client_offers USING (auth.uid() IN (SELECT user_id FROM public.team_members)) WITH CHECK (auth.uid() IN (SELECT user_id FROM public.team_members));
