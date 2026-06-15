-- 2026-06-15 — Naprawa "Nie znaleziono harmonogramu" na payment-schedule.html.
-- Po migracji 20260614_portal_token_rls_step2 tabela workflows jest zabezpieczona
-- tokenem (x-wf-token). Linki do harmonogramu (?schedule=<id>) NIE niosą tokenu,
-- więc anon nie mógł odczytać workflow.customer_* do zbudowania pseudo-leada i strona
-- zwracała "not found" dla harmonogramów opartych o workflow (lead_id IS NULL).
--
-- To RPC (SECURITY DEFINER) zwraca WYŁĄCZNIE minimalne dane klienta/oferty potrzebne
-- do bramki e-mail i renderu — NIGDY unique_token ani innych pól workflow. Sekretem
-- pozostaje samo UUID harmonogramu (jak dotąd: payment_schedules/installments = USING(true)).
CREATE OR REPLACE FUNCTION public.payment_schedule_public(p_schedule_id uuid)
RETURNS TABLE (
  schedule_id    uuid,
  workflow_id    uuid,
  total_amount   numeric,
  client_name    text,
  client_email   text,
  client_phone   text,
  client_company text,
  offer_name     text
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    ps.id,
    ps.workflow_id,
    ps.total_amount,
    COALESCE(l.name,    w.customer_name)    AS client_name,
    COALESCE(l.email,   w.customer_email)   AS client_email,
    COALESCE(l.phone,   w.customer_phone)   AS client_phone,
    COALESCE(l.company, w.customer_company) AS client_company,
    w.offer_name
  FROM public.payment_schedules ps
  LEFT JOIN public.leads     l ON l.id = ps.lead_id
  LEFT JOIN public.workflows w ON w.id = ps.workflow_id
  WHERE ps.id = p_schedule_id;
$$;

GRANT EXECUTE ON FUNCTION public.payment_schedule_public(uuid) TO anon, authenticated;
