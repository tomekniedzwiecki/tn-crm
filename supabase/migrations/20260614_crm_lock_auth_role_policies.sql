-- 2026-06-14 — Domknięcie luki: polityki `auth.role() = 'authenticated'`
-- To samo zagrożenie co USING(true) (każdy zalogowany, w tym rejestracje z sparingu),
-- ale zapisane inaczej, więc pierwszy sweep (qual=true) ich nie objął.
-- Zawężamy 6 polityk „admin/manage" do członków zespołu. Portal klienta (anon)
-- ma osobne polityki SELECT — nietknięte tutaj.
DO $$
BEGIN
  ALTER POLICY "Admin full access to automation_executions" ON public.automation_executions USING (auth.uid() IN (SELECT user_id FROM public.team_members)) WITH CHECK (auth.uid() IN (SELECT user_id FROM public.team_members));
  ALTER POLICY "Admin full access to automation_flows"      ON public.automation_flows      USING (auth.uid() IN (SELECT user_id FROM public.team_members)) WITH CHECK (auth.uid() IN (SELECT user_id FROM public.team_members));
  ALTER POLICY "Admin full access to automation_steps"      ON public.automation_steps      USING (auth.uid() IN (SELECT user_id FROM public.team_members)) WITH CHECK (auth.uid() IN (SELECT user_id FROM public.team_members));
  ALTER POLICY "Authenticated users can manage offers"      ON public.offers                USING (auth.uid() IN (SELECT user_id FROM public.team_members)) WITH CHECK (auth.uid() IN (SELECT user_id FROM public.team_members));
  ALTER POLICY "Authenticated full access"                  ON public.product_images        USING (auth.uid() IN (SELECT user_id FROM public.team_members)) WITH CHECK (auth.uid() IN (SELECT user_id FROM public.team_members));
  ALTER POLICY "Admin full access to ad reports"            ON public.workflow_ad_reports   USING (auth.uid() IN (SELECT user_id FROM public.team_members)) WITH CHECK (auth.uid() IN (SELECT user_id FROM public.team_members));
END $$;
