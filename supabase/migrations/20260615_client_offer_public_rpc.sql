-- 2026-06-15 — Naprawa negocjowanej ceny w checkout po zacisnięciu RLS na client_offers
-- (migracja 20260614 wymaga x-offer-token). Checkout dostaje ?client_offer=<id> bez tokenu,
-- więc nie mógł odczytać custom_price -> klient płacił cenę standardową zamiast wynegocjowanej.
-- RPC zwraca tylko custom_price + dane do prefilla formularza (bez unique_token).
CREATE OR REPLACE FUNCTION public.client_offer_public(p_client_offer_id uuid)
RETURNS TABLE (
  custom_price numeric,
  lead_email   text,
  lead_phone   text,
  lead_name    text,
  lead_company text,
  lead_nip     text
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT co.custom_price, l.email, l.phone, l.name, l.company, l.nip
  FROM public.client_offers co
  LEFT JOIN public.leads l ON l.id = co.lead_id
  WHERE co.id = p_client_offer_id;
$$;

GRANT EXECUTE ON FUNCTION public.client_offer_public(uuid) TO anon, authenticated;
