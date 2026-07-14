-- =====================================================================
-- 2026-07-14 — Ochrona KOLUMNOWA sekretów TakeDrop przed rolą anon.
-- =====================================================================
-- Kontekst: reharden 20260713 przywrócił token-gating na POZIOMIE WIERSZA
-- (wf_token_ok). Ale RLS chroni WIERSZ, nie KOLUMNĘ — anon miał tabelowy
-- SELECT na WSZYSTKICH kolumnach, więc z ważnym x-wf-token (token jest w URL
-- portalu: współdzielony link / historia / referer) czytał PLAINTEXT
-- `account_password` (login TakeDrop) i `payment_gateway_credentials`
-- (creds bramki płatności). To residual z incydentu vapoflow (16.06–13.07).
--
-- Fix (wzorzec feedback-rls-row-not-column-privs): zamiana tabelowych
-- grantów anon na KOLUMNOWE. anon nie widzi już 2 sekretów; UPDATE tylko na
-- kolumnach, które portal klienta faktycznie zapisuje bezpośrednio. Hasło
-- pisane jest przez SECURITY DEFINER RPC confirm_workflow_takedrop_account
-- (omija granty), więc write klienta działa dalej. authenticated (admin,
-- polityka "Admin full access takedrop") NIETKNIĘTY — panel workflow.html
-- czyta hasło jak dotąd.
--
-- FRONT (lockstep): client-projekt.html select TakeDrop przestał prosić o
-- account_password i payment_gateway_credentials; usunięto prefill hasła.
-- =====================================================================

-- Zdejmij tabelowe (all-columns) uprawnienia anon
REVOKE SELECT, INSERT, UPDATE ON public.workflow_takedrop FROM anon;

-- SELECT: dokładny read-surface portalu klienta MINUS account_password
-- i payment_gateway_credentials (+ workflow_id do filtra/RLS).
GRANT SELECT (
  id, workflow_id, is_active, account_created, account_created_at,
  account_active, account_active_at, account_active_confirmed_by, account_email,
  landing_page_connected, landing_page_connected_at, landing_url,
  legal_documents_ready, legal_documents_in_shop, legal_documents_in_shop_at,
  legal_data, domain, payment_gateway_type, payment_gateway_ready,
  payment_gateway_configured_at, test_accepted, test_accepted_at,
  test_feedback_sent, test_feedback_sent_at
) ON public.workflow_takedrop TO anon;

-- UPDATE: tylko kolumny zapisywane bezpośrednio z portalu klienta.
-- (account_password/account_email → RPC; payment_gateway_credentials → admin.)
GRANT UPDATE (
  legal_data, legal_documents_ready,
  payment_gateway_type, payment_gateway_ready, payment_gateway_configured_at,
  test_accepted, test_accepted_at, test_feedback_sent, test_feedback_sent_at
) ON public.workflow_takedrop TO anon;

-- INSERT: portal klienta nie wstawia wierszy takedrop (tworzy admin) — nie przyznajemy.

-- =====================================================================
-- Weryfikacja: anon SELECT account_password/payment_gateway_credentials → 42501.
-- anon SELECT dozwolonych kolumn (z tokenem) → OK. authenticated → bez zmian.
-- =====================================================================
