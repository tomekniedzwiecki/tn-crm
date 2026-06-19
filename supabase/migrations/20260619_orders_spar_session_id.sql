-- Przypięcie zamówienia do KONKRETNEJ sesji sparingu (sid z linku checkoutu).
-- Bez tego tpay-webhook dopasowywał płatność do sesji „po lead_id/e-mailu → najnowsza
-- nieopłacona", co przy wielu rozmowach na jeden e-mail (celowo wspierane: kolejne
-- rozmowy 49 zł) albo wspólnej skrzynce trafiało w złą sesję. sid jest już w obu
-- linkach (rezerwacja: sparing front; pełna płatność: panel admina), wystarczyło go
-- zapisać na orderze i preferować w webhooku.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS spar_session_id uuid;

CREATE INDEX IF NOT EXISTS idx_orders_spar_session_id
  ON orders (spar_session_id) WHERE spar_session_id IS NOT NULL;

COMMENT ON COLUMN orders.spar_session_id IS
  'spar_sessions.id z parametru ?sid= w checkoutcie — twardy link order→sesja dla tpay-webhook (rezerwacja/pełna płatność).';
