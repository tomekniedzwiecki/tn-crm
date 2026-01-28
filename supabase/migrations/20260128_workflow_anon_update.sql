-- =============================================
-- POPRAWKA: Pozwól anonimowym użytkownikom ustawiać hasło do projektu
-- =============================================
-- Problem: Klienci nie mogą ustawić hasła do podglądu projektu,
-- bo brakuje polityki UPDATE dla roli anon

-- Polityka pozwalająca anonimowym użytkownikom aktualizować workflow
-- (potrzebne do ustawiania hasła przez klienta)
CREATE POLICY "Anon can update workflow for password"
    ON workflows FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);
