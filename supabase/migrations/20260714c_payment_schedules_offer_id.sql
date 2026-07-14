-- 2026-07-14 — Harmonogram: pozwól wybrać ofertę KATALOGOWĄ wprost (bez generowania client_offer,
-- który jest sklepowym flow z proformą/wysyłką). Dotąd modal harmonogramu pokazywał tylko już
-- wygenerowaną ofertę leada (client_offer), więc np. „Budowa aplikacji — STANDARD" nie dało się wybrać.
-- Nowa kolumna offer_id = bezpośredni link payment_schedules → offers. Nic nie czytało client_offer_id
-- poza RPC installment_offer_name, więc bezpiecznie dokładamy drugą (preferowaną) ścieżkę.
ALTER TABLE public.payment_schedules ADD COLUMN IF NOT EXISTS offer_id uuid;

-- RPC nazwy oferty raty: preferuj offer_id (nowe harmonogramy), fallback na client_offer_id (stare).
CREATE OR REPLACE FUNCTION public.installment_offer_name(p_installment_id uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT o.name
  FROM public.payment_installments pi
  JOIN public.payment_schedules  ps ON ps.id = pi.schedule_id
  JOIN public.offers             o  ON o.id = COALESCE(
         ps.offer_id,
         (SELECT co.offer_id FROM public.client_offers co WHERE co.id = ps.client_offer_id)
       )
  WHERE pi.id = p_installment_id;
$$;

GRANT EXECUTE ON FUNCTION public.installment_offer_name(uuid) TO anon, authenticated;
