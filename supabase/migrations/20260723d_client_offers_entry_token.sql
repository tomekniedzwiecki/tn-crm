-- 2026-07-23 — jednorazowa przepustka wejścia na ofertę z czatu /rozmowa.
-- Karta oferty w czacie linkuje /p/<unique_token>?e=<entry_token>; strona oferty
-- przy zgodnym i NIEUŻYTYM tokenie konsumuje go (entry_token_used_at) i wpuszcza
-- bez bramki e-mail. Każde inne wejście (link z maila/followupów, forward,
-- ponowne użycie ?e=) trafia na bramkę, gdzie hasłem jest e-mail leada.
-- lead-talk mintuje ŚWIEŻY entry_token przy każdym podaniu offerToken frontowi
-- czatu, więc kliknięcia z czatu (także po powrocie do rozmowy) wchodzą gładko.
-- Zapis/odczyt anon działa przez istniejące polityki token-gated na client_offers
-- ("Allow public update view count" — grant tabelowy obejmuje nowe kolumny).

ALTER TABLE public.client_offers
  ADD COLUMN IF NOT EXISTS entry_token text,
  ADD COLUMN IF NOT EXISTS entry_token_used_at timestamptz;
