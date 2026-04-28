-- Zapisy v2 — nowa kolumna na obecny dochód (semantyka inna od istniejącego target_income)
--
-- Stare leady (zapisy v1):
--   target_income    = "marzenie/cel" (np. "10-20k" = chcę zarabiać tyle)
--   experience       = "co próbowałeś"
--   open_question    = "czym się aktualnie zajmujesz"
--   direction        = (nieużywane, null)
--   budget           = (nieużywane, null)
--
-- Nowe leady (zapisy v2):
--   current_income   = "obecny dochód" (np. "5-10k" = tyle zarabiam dziś)
--   experience       = "powiedz coś o sobie"
--   open_question    = (nieużywane, null)
--   direction        = "sklep_online,allegro,..." (multiselect csv)
--   budget           = "15000" (liczba PLN jako tekst)
--
-- CRM rozróżnia leady przez obecność pól (current_income/direction/budget = v2; target_income/open_question = v1).

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS current_income text;

COMMENT ON COLUMN leads.current_income IS
  'Obecny miesięczny dochód klienta (zapisy v2). Format kategorii: "<5k", "5-10k", "10-20k", "20-50k", "50k+". Stare leady (v1) używają target_income jako "marzenie".';

COMMENT ON COLUMN leads.target_income IS
  'Marzenie/cel dochodu (zapisy v1, deprecated). Nowe leady używają current_income.';

COMMENT ON COLUMN leads.budget IS
  'Łączna kwota inwestycyjna w PLN (zapisy v2). Format: liczba jako tekst, np. "15000". Stare leady mają null.';

COMMENT ON COLUMN leads.direction IS
  'Multiselect "co już próbował" (zapisy v2). Format: CSV np. "sklep_online,allegro,dropshipping". Możliwe wartości: sklep_online, allegro, vinted_olx, dropshipping, takedrop, amazon, kursy, freelance, afiliacja, trading, nigdy. Stare leady mają null.';
