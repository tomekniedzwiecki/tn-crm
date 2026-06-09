-- Backfill: checkout ustawial orders.lead_id tylko gdy ?lead_id bylo w URL,
-- wiec 81/168 platnych zamowien nie mialo leada — mimo ze 79 mialo pasujacego
-- leada po mailu. Podpinamy lead_id dla zamowien z JEDNOZNACZNYM dopasowaniem
-- email->lead (dokladnie 1 lead). Idempotentne (tylko gdy lead_id IS NULL).
-- Forward-fix w tpay-webhook + revolut-webhook robi to samo przy nowych platnosciach.

UPDATE orders o
SET lead_id = (SELECT l.id FROM leads l WHERE lower(l.email) = lower(o.customer_email) LIMIT 1)
WHERE o.lead_id IS NULL
  AND o.customer_email IS NOT NULL
  AND (SELECT count(*) FROM leads l WHERE lower(l.email) = lower(o.customer_email)) = 1;
