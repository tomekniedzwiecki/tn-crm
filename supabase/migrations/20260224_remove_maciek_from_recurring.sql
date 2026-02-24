-- =====================================================
-- Usun podstawe pracownika z kosztow stalych
-- (koszty pracownikow sa teraz obliczane dynamicznie)
-- =====================================================

DELETE FROM biznes_recurring_costs
WHERE name = 'Maciej Kanczewski - podstawa'
AND category = 'pracownik';
