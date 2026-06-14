-- 2026-06-14 — booking_links: zamknięcie anon-WRITE/READ do zespołu.
-- Polityki TO public USING(true) (w tym ALL = anon mógł pisać/kasować).
-- Tabela nieużywana przez żadną stronę (0 wystąpień w HTML); edge functions
-- działają na service_role. Zawężamy do team_members.
ALTER POLICY "Users can manage booking_links" ON public.booking_links
  USING (auth.uid() IN (SELECT user_id FROM public.team_members))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.team_members));
ALTER POLICY "Anon can read booking_links" ON public.booking_links
  USING (auth.uid() IN (SELECT user_id FROM public.team_members));
