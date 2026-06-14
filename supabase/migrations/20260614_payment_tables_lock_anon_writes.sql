-- 2026-06-14 — payment_schedules / payment_installments: zamknięcie anon-WRITE.
-- Miały ALL TO public USING(true) — anon mógł INSERT/UPDATE/DELETE (np. skasować
-- wszystkie harmonogramy i raty). Zapisują je TYLKO strony admina
-- (orders.html/offers.html = authenticated/team) oraz edge functions (service_role,
-- np. tpay-webhook); żadna strona anon nie pisze (tylko czyta). SELECT zostaje
-- USING(true) — czyta go admin (dashboard/offers/orders) ORAZ portal/checkout;
-- zaciśnięcie SELECT zepsułoby admina (czyta bez tokenu) — patrz ODŁOŻONE.
-- Zweryfikowane: anon INSERT orders + read-back nadal działa (checkout OK);
-- anon DELETE payment_* = 0 (zablokowane); anon SELECT payment_* = działa.
ALTER POLICY payment_schedules_insert_policy ON public.payment_schedules WITH CHECK (auth.uid() IN (SELECT user_id FROM public.team_members));
ALTER POLICY payment_schedules_update_policy ON public.payment_schedules USING (auth.uid() IN (SELECT user_id FROM public.team_members)) WITH CHECK (auth.uid() IN (SELECT user_id FROM public.team_members));
ALTER POLICY payment_schedules_delete_policy ON public.payment_schedules USING (auth.uid() IN (SELECT user_id FROM public.team_members));

ALTER POLICY payment_installments_insert_policy ON public.payment_installments WITH CHECK (auth.uid() IN (SELECT user_id FROM public.team_members));
ALTER POLICY payment_installments_update_policy ON public.payment_installments USING (auth.uid() IN (SELECT user_id FROM public.team_members)) WITH CHECK (auth.uid() IN (SELECT user_id FROM public.team_members));
ALTER POLICY payment_installments_delete_policy ON public.payment_installments USING (auth.uid() IN (SELECT user_id FROM public.team_members));

-- ODŁOŻONE (read-only enumeracja, niższa waga): anon SELECT na orders +
-- payment_schedules + payment_installments wciąż USING(true) — anon może wylistować
-- dane (maile/kwoty/harmonogramy). Bezpieczne zaciśnięcie wymaga: orders →
-- token x-order-id wpięty w checkout (fresh flow robi insert().select() read-back,
-- więc trzeba generować id po stronie klienta), payment_* → predykat
-- (team_members OR wf_token_ok OR offer-token) bo SELECT czyta też admin.
