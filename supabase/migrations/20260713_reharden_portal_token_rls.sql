-- =====================================================================
-- 2026-07-13 — RE-HARDENING portalu klienta po tokenie (x-wf-token).
-- =====================================================================
-- REGRESJA: migracja 20260616_restore_client_anon_policies odtworzyła
-- polityki anon jako USING(true)/is_active BEZ wf_token_ok (komentarz
-- "token sprawdzany w aplikacji" = błędne założenie — anon omija filtr
-- .eq() po stronie klienta). Skutek: KAŻDY z publicznym kluczem anon mógł:
--   * czytać dane WSZYSTKICH workflowów (PESEL, nr dowodu, dane umowy w
--     `workflows`; plaintext hasła TakeDrop + creds bramki płatności w
--     `workflow_takedrop`; PII kupujących sklepu w `workflow_orders`),
--   * zapisywać do CUDZEGO workflow_takedrop (nadpisać hasło/creds/is_active).
-- Zgłoszone przez klienta (Damian Mordalski, vapoflow.pl) 2026-07-06.
-- Zweryfikowane `SET ROLE anon`: przed = 112 workflowów/48 haseł widocznych
-- bez tokenu; po = 0 bez tokenu, tylko własny wiersz z ważnym x-wf-token.
--
-- Ten skrypt przywraca model 1:1 z 20260614_portal_token_rls_step2:
-- odczyt/zapis anon TYLKO dla workflow o tokenie z nagłówka x-wf-token.
-- Frontend (client-projekt.html, payment-schedule.html) JUŻ wysyła x-wf-token
-- globalnie; wf_token_ok() + RPC-y „po id" (payment_schedule_public,
-- client_offer_public, order_conversion_tracking) istnieją. Idempotentne.
--
-- UWAGA na przyszłość: nie „restore'ować" polityk anon do USING(true).
-- Każda polityka anon na workflow_* MUSI mieć wf_token_ok(workflow_id)
-- (albo unique_token = x-wf-token dla samego `workflows`).
-- =====================================================================

-- ── workflows: token wprost z nagłówka (koniec enumeracji PESEL/umów) ──
ALTER POLICY "Anyone can view workflow by token" ON public.workflows
  USING (unique_token = current_setting('request.headers', true)::json->>'x-wf-token');

-- ── workflow_takedrop: hasła/creds — SELECT i UPDATE tylko za tokenem ──
ALTER POLICY "Client read active takedrop" ON public.workflow_takedrop
  USING (is_active = true AND public.wf_token_ok(workflow_id));
ALTER POLICY "Client update legal data" ON public.workflow_takedrop
  USING (is_active = true AND public.wf_token_ok(workflow_id))
  WITH CHECK (is_active = true AND public.wf_token_ok(workflow_id));

-- ── workflow_orders: PII kupujących sklepu ──
ALTER POLICY "Anon select orders for active ads" ON public.workflow_orders
  USING (EXISTS (SELECT 1 FROM public.workflow_ads wa
                 WHERE wa.workflow_id = workflow_orders.workflow_id AND wa.is_active = true)
         AND public.wf_token_ok(workflow_id));
ALTER POLICY "Anon insert orders for active ads" ON public.workflow_orders
  WITH CHECK (EXISTS (SELECT 1 FROM public.workflow_ads wa
                      WHERE wa.workflow_id = workflow_orders.workflow_id AND wa.is_active = true)
              AND admin_note IS NULL AND public.wf_token_ok(workflow_id));
ALTER POLICY "Anon update orders for active ads" ON public.workflow_orders
  USING (EXISTS (SELECT 1 FROM public.workflow_ads wa
                 WHERE wa.workflow_id = workflow_orders.workflow_id AND wa.is_active = true)
         AND public.wf_token_ok(workflow_id))
  WITH CHECK (EXISTS (SELECT 1 FROM public.workflow_ads wa
                      WHERE wa.workflow_id = workflow_orders.workflow_id AND wa.is_active = true)
              AND public.wf_token_ok(workflow_id));
ALTER POLICY "Anon delete orders for active ads" ON public.workflow_orders
  USING (EXISTS (SELECT 1 FROM public.workflow_ads wa
                 WHERE wa.workflow_id = workflow_orders.workflow_id AND wa.is_active = true)
         AND public.wf_token_ok(workflow_id));

-- ── pozostałe odczyty child-tabel (treść projektu) ──
ALTER POLICY "Client read branding"            ON public.workflow_branding   USING (public.wf_token_ok(workflow_id));
ALTER POLICY "Client read products"            ON public.workflow_products   USING (public.wf_token_ok(workflow_id));
ALTER POLICY "Client read comments"            ON public.workflow_comments   USING (public.wf_token_ok(workflow_id));
ALTER POLICY "Anyone can view workflow_milestones" ON public.workflow_milestones USING (public.wf_token_ok(workflow_id));
ALTER POLICY "Anyone can view workflow_tasks"  ON public.workflow_tasks      USING (public.wf_token_ok(workflow_id));
ALTER POLICY "Anon can read reviews"           ON public.workflow_reviews    USING (public.wf_token_ok(workflow_id));
ALTER POLICY "Client read visible documents"   ON public.workflow_documents  USING (visible_to_client = true AND public.wf_token_ok(workflow_id));
ALTER POLICY "Client read visible materials"   ON public.workflow_materials  USING (visible_to_client = true AND public.wf_token_ok(workflow_id));
ALTER POLICY "Client read visible reports"     ON public.workflow_reports    USING (visible_to_client = true AND public.wf_token_ok(workflow_id));
ALTER POLICY "Client read active video"        ON public.workflow_video      USING (is_active = true AND public.wf_token_ok(workflow_id));
ALTER POLICY "Anon can read whatsapp config"   ON public.workflow_optimization USING (is_active = true AND public.wf_token_ok(workflow_id));
ALTER POLICY "Client read active ads"          ON public.workflow_ads        USING (is_active = true AND public.wf_token_ok(workflow_id));

-- ── pozostałe zapisy child-tabel ──
ALTER POLICY "Client insert comments"          ON public.workflow_comments   WITH CHECK (author_type = 'client'::text AND public.wf_token_ok(workflow_id));
ALTER POLICY "Client update own data"          ON public.workflow_video      USING (is_active = true AND public.wf_token_ok(workflow_id)) WITH CHECK (is_active = true AND public.wf_token_ok(workflow_id));
ALTER POLICY "Anon can update client fields"   ON public.workflow_optimization USING (is_active = true AND public.wf_token_ok(workflow_id)) WITH CHECK (is_active = true AND public.wf_token_ok(workflow_id));
ALTER POLICY "Anon can hide reviews"           ON public.workflow_reviews    USING (public.wf_token_ok(workflow_id)) WITH CHECK (public.wf_token_ok(workflow_id));
ALTER POLICY "Client can grant partner access" ON public.workflow_ads        USING (is_active = true AND public.wf_token_ok(workflow_id)) WITH CHECK (is_active = true AND public.wf_token_ok(workflow_id));
ALTER POLICY "Client can create ads record for partner access" ON public.workflow_ads
  WITH CHECK (workflow_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.workflow_takedrop wt WHERE wt.workflow_id = workflow_ads.workflow_id AND wt.test_accepted = true)
    AND public.wf_token_ok(workflow_id));

-- =====================================================================
-- KONIEC. Weryfikacja: otwórz link portalu /projekt/<token> w incognito —
-- musi się załadować; `SET ROLE anon` bez x-wf-token musi zwracać 0 wierszy.
-- =====================================================================
