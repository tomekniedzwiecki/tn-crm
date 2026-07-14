-- 2026-07-14 — Rata harmonogramu: opis zamówienia niósł HARDKOD „Budowa sklepu pełen pakiet"
-- (checkout/v2/index.html), więc raty za aplikację nigdy nie miały w opisie frazy „budowa aplikacji"
-- → tpay-webhook nie ustawiał spar_sessions.full_paid_at → wfa_sync_projects nie tworzył projektu
-- → projekt aplikacji NIGDY nie trafiał do TN App. Fix: checkout bierze PRAWDZIWĄ nazwę powiązanej
-- oferty z harmonogramu (payment_schedules.client_offer_id → client_offers.offer_id → offers.name).
--
-- client_offers jest token-gated dla anon (x-offer-token), a checkout raty tokenu nie ma — dlatego
-- most robimy tą funkcją SECURITY DEFINER. Zwraca WYŁĄCZNIE nazwę oferty (żadnych danych klienta).
CREATE OR REPLACE FUNCTION public.installment_offer_name(p_installment_id uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT o.name
  FROM public.payment_installments pi
  JOIN public.payment_schedules  ps ON ps.id = pi.schedule_id
  JOIN public.client_offers      co ON co.id = ps.client_offer_id
  JOIN public.offers             o  ON o.id  = co.offer_id
  WHERE pi.id = p_installment_id;
$$;

GRANT EXECUTE ON FUNCTION public.installment_offer_name(uuid) TO anon, authenticated;
