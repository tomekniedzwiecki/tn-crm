-- Krok "Dokumenty dodane do sklepu" w Etap 3 (Dokumenty prawne).
-- Po wygenerowaniu i zapisaniu dokumentow prawnych admin (Tomek) recznie
-- wgrywa je do sklepu klienta (TakeDrop). Ten checkbox potwierdza ten fakt,
-- a informacja jest widoczna rowniez w panelu klienta (client-projekt.html).

ALTER TABLE workflow_takedrop
  ADD COLUMN IF NOT EXISTS legal_documents_in_shop BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS legal_documents_in_shop_at TIMESTAMPTZ;

COMMENT ON COLUMN workflow_takedrop.legal_documents_in_shop IS 'Czy dokumenty prawne zostaly dodane do sklepu klienta (reczne potwierdzenie admina, widoczne tez u klienta)';
