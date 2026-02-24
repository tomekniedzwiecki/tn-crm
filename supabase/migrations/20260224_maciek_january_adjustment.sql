-- =====================================================
-- Korekta wynagrodzenia Macieja za styczeń 2026
-- (pracował tylko parę dni - 2500 zł zamiast 10000 zł)
-- =====================================================

INSERT INTO employee_bonuses (team_member_id, month, amount, description)
SELECT
    id,
    '2026-01-01',
    -7500,
    'Korekta za styczeń - pracował tylko parę dni'
FROM team_members
WHERE name ILIKE '%Maciej%' OR name ILIKE '%Kanczewski%'
ON CONFLICT DO NOTHING;
