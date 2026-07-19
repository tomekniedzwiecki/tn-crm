-- Oferta generowana z rozmowy AI (lead-talk): przy domknięciu bot wystawia client_offer
-- (7 dni ważności) i karta w rozmowie prowadzi do /p/<token> — płatność ZAWSZE przez ofertę.
-- source='rozmowa' → strona oferty pokazuje przycisk „Wróć do rozmowy".
alter table client_offers add column if not exists source text;
alter table talk_sessions add column if not exists offer_token text;
