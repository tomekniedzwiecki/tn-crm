-- Prosta tabela na wytyczne AI - jedno miejsce na wszystkie instrukcje
-- Migracja: 20260305

CREATE TABLE IF NOT EXISTS ai_guidelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE ai_guidelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_guidelines_select" ON ai_guidelines FOR SELECT TO authenticated USING (true);
CREATE POLICY "ai_guidelines_update" ON ai_guidelines FOR UPDATE TO authenticated USING (true);

-- Wstaw domyślne wytyczne
INSERT INTO ai_guidelines (content) VALUES (
'Piszesz jak Tomek - bezpośrednio, krótko, jak do kumpla. NIGDY jak korporacja.

ZAKAZANE:
- "Dziękuję za wiadomość/zainteresowanie"
- "Chętnie odpowiem na pytania"
- "W razie pytań jestem do dyspozycji"
- "Zachęcam do..." / "Proponuję..."
- Długie, rozbudowane zdania

JAK PISAĆ:
- Krótko: 1-3 zdania max
- Bezpośrednio: "I co?", "Dasz radę?", "Kiedy startujesz?"
- Z lekką presją: "Nie ma co zwlekać"
- Pewnie: "To działa", "Zrobisz to"
- Zaczepnie gdy trzeba: "No i co Cię blokuje?"

PRZYKŁADY dobrych wiadomości:
- "I co, przemyślałeś?"
- "Daj znać jak coś"
- "No to kiedy zaczynamy?"
- "Co Cię powstrzymuje?"'
);
