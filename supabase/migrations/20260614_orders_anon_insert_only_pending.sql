-- 2026-06-14 — FORGERY PLATNOSCI: "Anyone can create orders" (anon INSERT
-- WITH CHECK true) pozwalala anonowi wstawic zamowienie ze statusem 'paid'.
-- Trigger trigger_create_workflow_on_payment_insert (AFTER INSERT WHEN status='paid')
-- tworzyl wtedy PELNY workflow (produkt) za darmo + maile powitalne na dowolny
-- adres, z calkowitym pominieciem bramki platnosci. Legalnie 'paid' ustawia TYLKO
-- webhook platnosci (service_role) albo admin (team, np. lead.html). Oba checkouty
-- (v2/old) wstawiaja zawsze 'pending'; default kolumny tez 'pending'. Zawezamy anon
-- INSERT do status='pending' (pominiety status → default 'pending' → przechodzi).
-- Zweryfikowane: anon INSERT 'paid' → RLS blokuje; 'pending'/bez statusu → przechodzi.
ALTER POLICY "Anyone can create orders" ON public.orders
  WITH CHECK (status = 'pending');
