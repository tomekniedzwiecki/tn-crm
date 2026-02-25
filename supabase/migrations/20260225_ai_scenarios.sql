-- AI Scenarios - tabela scenariuszy konwersacyjnych
-- Migracja: 20260225_ai_scenarios

CREATE TABLE IF NOT EXISTS ai_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,

    -- Warunki aktywacji scenariusza (wszystkie muszą być spełnione)
    conditions JSONB NOT NULL DEFAULT '{}',
    -- Przykład conditions:
    -- {
    --   "last_message_direction": "outbound",     -- kto napisał ostatni: "outbound" | "inbound" | null
    --   "days_since_last_message_min": 2,         -- min dni od ostatniej wiadomości
    --   "days_since_last_message_max": 7,         -- max dni od ostatniej wiadomości
    --   "has_client_offer": true,                 -- czy ma ofertę
    --   "has_closing_date": true,                 -- czy ma datę zamknięcia
    --   "lead_status": ["qualified", "proposal"], -- status leada (array = OR)
    --   "has_orders": false,                      -- czy ma zamówienia
    --   "message_contains": ["cena", "koszt"]     -- ostatnia wiadomość zawiera (array = OR)
    -- }

    -- Instrukcje dla AI gdy scenariusz jest aktywny
    instructions TEXT NOT NULL,

    -- Przykładowe odpowiedzi (opcjonalne, dla kontekstu AI)
    example_responses TEXT[],

    -- Priorytet (wyższy = ważniejszy, przy konfliktach wygrywa wyższy)
    priority INT DEFAULT 50,

    -- Czy aktywny
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeksy
CREATE INDEX IF NOT EXISTS idx_ai_scenarios_active ON ai_scenarios(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_scenarios_priority ON ai_scenarios(priority DESC);

-- RLS
ALTER TABLE ai_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_scenarios_select" ON ai_scenarios
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "ai_scenarios_insert" ON ai_scenarios
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "ai_scenarios_update" ON ai_scenarios
    FOR UPDATE TO authenticated USING (true);
CREATE POLICY "ai_scenarios_delete" ON ai_scenarios
    FOR DELETE TO authenticated USING (true);

-- Trigger do aktualizacji updated_at
CREATE OR REPLACE FUNCTION update_ai_scenarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ai_scenarios_updated_at ON ai_scenarios;
CREATE TRIGGER ai_scenarios_updated_at
    BEFORE UPDATE ON ai_scenarios
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_scenarios_updated_at();

-- =====================================================
-- SEED DATA - Podstawowe scenariusze
-- =====================================================

INSERT INTO ai_scenarios (name, description, conditions, instructions, example_responses, priority) VALUES

-- Follow-up gdy my pisaliśmy ostatni i minęło 2+ dni
('Follow-up - brak odpowiedzi',
 'Lead nie odpowiedział na naszą wiadomość przez 2+ dni',
 '{
   "last_message_direction": "outbound",
   "days_since_last_message_min": 2
 }',
 'To jest follow-up - lead nie odpowiedział na naszą poprzednią wiadomość.
Napisz KRÓTKI follow-up (max 1-2 zdania).
NIE powtarzaj całej oferty.
Możesz zapytać czy wiadomość dotarła, czy miał czas się zapoznać, czy ma pytania.
Bądź naturalny, nie nachalny.',
 ARRAY['Hej, widziałeś moją poprzednią wiadomość?', 'Cześć, udało Ci się przemyśleć?', 'Daj znać jak coś'],
 90),

-- Klient napisał - odpowiedz na jego wiadomość
('Odpowiedź na wiadomość klienta',
 'Klient napisał ostatnią wiadomość - trzeba odpowiedzieć',
 '{
   "last_message_direction": "inbound"
 }',
 'Klient napisał wiadomość - odpowiedz na nią bezpośrednio.
Jeśli zadał pytanie - odpowiedz na nie.
Jeśli to obiekcja - użyj wiedzy z bazy o obsłudze obiekcji.
Jeśli wyraził zainteresowanie - zaproponuj następny krok.',
 NULL,
 80),

-- Klient ma ofertę ale nie zapłacił
('Ma ofertę - nie zapłacił',
 'Klient ma wysłaną ofertę ale nie ma zamówienia',
 '{
   "has_client_offer": true,
   "has_orders": false,
   "days_since_last_message_min": 1
 }',
 'Klient ma już ofertę ale jeszcze nie zapłacił.
Możesz delikatnie przypomnieć o ofercie.
Zapytaj czy ma pytania, czy coś jest niejasne.
Jeśli ma kod rabatowy - możesz o nim wspomnieć.
NIE naciskaj agresywnie.',
 ARRAY['Widziałem że przeglądałeś ofertę - masz jakieś pytania?', 'Jak wrażenia po obejrzeniu oferty?'],
 85),

-- Zbliża się closing date
('Zbliża się termin',
 'Data zamknięcia leada jest w ciągu 3 dni',
 '{
   "has_closing_date": true,
   "closing_date_within_days": 3
 }',
 'Zbliża się termin który ustaliliście z klientem.
Przypomnij o tym delikatnie.
Zapytaj czy jest gotowy do podjęcia decyzji.
Możesz wspomnieć o ograniczonej czasowo ofercie jeśli taka jest.',
 ARRAY['Pamiętam że chciałeś się zdecydować do końca tygodnia - jak idzie?'],
 95),

-- Świeży lead - pierwszy kontakt
('Pierwszy kontakt',
 'Nowy lead bez historii wiadomości lub tylko 1-2 wiadomości',
 '{
   "lead_status": ["new"],
   "max_messages": 3
 }',
 'To świeży lead - pierwszy kontakt.
Przedstaw się krótko (Tomek/Maciek).
Zapytaj czy widział naszą propozycję/ofertę.
Bądź przyjazny i naturalny.
NIE wysyłaj od razu całej oferty - najpierw nawiąż kontakt.',
 ARRAY['Cześć! Naszą propozycję widziałeś/widziałaś czy jeszcze nie?', 'Hej, patrzę właśnie na Twoją ankietę'],
 70),

-- Klient wspomniał o cenie/kosztach
('Pytanie o cenę',
 'Klient pyta o cenę lub koszty',
 '{
   "message_contains": ["cena", "koszt", "ile", "drogo", "tanio", "zł", "złotych", "budżet"]
 }',
 'Klient pyta o cenę/koszty.
Jeśli ma ofertę - odeślij do niej z linkiem.
Jeśli nie ma oferty - powiedz że możesz przygotować spersonalizowaną ofertę.
Podkreśl model 20% od dochodu - płaci tylko jak zarabia.
Możesz wspomnieć o ratach jeśli budżet jest problemem.',
 NULL,
 88),

-- Klient ma wątpliwości/obiekcje
('Obsługa obiekcji',
 'Klient wyraża wątpliwości lub obiekcje',
 '{
   "message_contains": ["nie wiem", "zastanowię", "później", "nie jestem pewien", "ryzyko", "gwarancja", "zwrot"]
 }',
 'Klient ma wątpliwości lub obiekcje.
Użyj wiedzy z bazy o obsłudze obiekcji.
Bądź wyrozumiały - nie naciskaj.
Odpowiedz na konkretną obiekcję.
Zaproponuj że może zacząć i po otrzymaniu sklepu podjąć decyzję.',
 NULL,
 87);
