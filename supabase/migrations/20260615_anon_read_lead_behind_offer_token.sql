-- 2026-06-15 — Naprawa bramki e-mail w ofertach (button "Pokaż mi ofertę" nic nie robił).
-- "Allow public read leads" zostało zawężone do team_members, więc anon nie czytał leads ->
-- embed client_offers->leads(*) zwracał null -> lead=null -> lead.email.toLowerCase() rzucał
-- TypeError przy kliknięciu. Ta polityka daje anonowi odczyt leada WYŁĄCZNIE gdy posiada token
-- oferty (x-offer-token) wskazujący na tego leada — sekretem jest token oferty, zero enumeracji
-- ani wycieku pozostałych leadów. Naprawia client-offer-v2.html i offer-starter.html.
CREATE POLICY "Anon read lead behind offer token" ON public.leads
  FOR SELECT TO anon
  USING (EXISTS (
    SELECT 1 FROM public.client_offers co
    WHERE co.lead_id = leads.id
      AND co.unique_token = current_setting('request.headers', true)::json->>'x-offer-token'
  ));
