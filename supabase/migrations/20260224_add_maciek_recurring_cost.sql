-- =====================================================
-- Dodaj podstawę pracownika do kosztów stałych
-- (dynamiczne obliczanie prowizji/bonusów w dashboard)
-- =====================================================

INSERT INTO biznes_recurring_costs (name, amount, category, is_active, vat_rate)
VALUES ('Maciej Kanczewski - podstawa', 10000, 'pracownik', true, 0)
ON CONFLICT DO NOTHING;
