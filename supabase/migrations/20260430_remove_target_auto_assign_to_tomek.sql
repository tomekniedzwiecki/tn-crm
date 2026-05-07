-- Wycofanie auto-przypisywania leada do Tomka przy zmianie statusu na 'negotiation' (Domykanie).
-- Zmiana statusu w pipeline (target) nie ma już zmieniać właściciela leada.
-- Przesunięcie do kolumny "Domykanie" pozostaje wyłącznie sygnałem statusu.
-- Cofa: 20260422_target_auto_assign_to_tomek.sql

DROP TRIGGER IF EXISTS trg_auto_assign_negotiation_to_tomek ON leads;
DROP FUNCTION IF EXISTS auto_assign_negotiation_to_tomek();
