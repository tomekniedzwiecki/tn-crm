-- 2026-07-14 — Defense-in-depth: zdejmij LATENTNY grant anon na whatsapp_api_keys.
-- RLS blokuje anon (0 polityk anon), ale sam grant istnieje — dokładnie ten wzorzec
-- (grant + poślizg polityki do USING(true)) wywołał wyciek vapoflow. api_key to sekret
-- zewnętrzny (WhatsApp), którego anon nigdy nie czyta. Żaden plik frontowy go nie używa.
REVOKE ALL ON public.whatsapp_api_keys FROM anon;
