-- 2026-06-15 — KRYTYCZNE: anon checkout zwracał 409 (unique_violation na order_number).
-- Po zawężeniu RLS SELECT na orders (x-order-id/x-customer-email/x-offer-token z 2026-06-14)
-- trigger generate_order_number (SECURITY INVOKER) skanował orders pod RLS roli anon, widział
-- tylko zamówienia danego klienta (zwykle 0) i generował ORD-YYYYMM-0001, które już istnieje.
-- SECURITY DEFINER pozwala policzyć MAX po PEŁNEJ tabeli → globalnie unikalny numer.
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    year_month TEXT;
    seq_num INTEGER;
BEGIN
    year_month := TO_CHAR(NOW(), 'YYYYMM');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(order_number FROM 'ORD-' || year_month || '-(\d+)') AS INTEGER)
    ), 0) + 1
    INTO seq_num
    FROM orders
    WHERE order_number LIKE 'ORD-' || year_month || '-%';

    NEW.order_number := 'ORD-' || year_month || '-' || LPAD(seq_num::TEXT, 4, '0');
    RETURN NEW;
END;
$function$;
