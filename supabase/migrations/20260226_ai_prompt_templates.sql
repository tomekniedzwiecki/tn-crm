-- AI Prompt Templates - szablony promptów do generowania treści
-- Migracja: 20260226_ai_prompt_templates

CREATE TABLE IF NOT EXISTS ai_prompt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identyfikator szablonu (report, branding, landing, video)
    template_key TEXT NOT NULL UNIQUE,

    -- Nazwa wyświetlana
    name TEXT NOT NULL,

    -- Treść szablonu z placeholderami
    -- Dostępne zmienne: {{customer_name}}, {{workflow_id}}, {{product_name}}
    content TEXT NOT NULL,

    -- Opis szablonu
    description TEXT,

    -- Kolejność wyświetlania
    sort_order INT DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE ai_prompt_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_prompt_templates_select" ON ai_prompt_templates
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "ai_prompt_templates_update" ON ai_prompt_templates
    FOR UPDATE TO authenticated USING (true);

-- Trigger do aktualizacji updated_at
CREATE OR REPLACE FUNCTION update_ai_prompt_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ai_prompt_templates_updated_at ON ai_prompt_templates;
CREATE TRIGGER ai_prompt_templates_updated_at
    BEFORE UPDATE ON ai_prompt_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_prompt_templates_updated_at();

-- =====================================================
-- SEED DATA - Domyślne szablony
-- =====================================================

INSERT INTO ai_prompt_templates (template_key, name, content, description, sort_order) VALUES

('report', 'Raport strategiczny',
'Przeprowadź dogłębną analizę poniższego produktu i przygotuj kompletny raport strategiczny, który posłuży jako fundament do budowy marki i sprzedaży tego produktu na rynku polskim.

PRODUKT jest załączony jako zrzut ekranu

KONTEKST BIZNESOWY:

- Model startu: dropshipping z AliExpress (pierwsze zamówienia)
- Docelowy model: import przez agenta w Chinach z pełnym brandingiem (własne opakowanie, logo na produkcie, wkładki do paczki, branded unboxing experience), a następnie import do magazynów w Polsce
- Kanał sprzedaży: dedykowany landing page (one-product store)
- Rynek docelowy: Polska

1. Przeanalizuj produkt i jego potencjał rynkowy.
2. Jaki problem rozwiązuje i jakie potrzeby zaspokaja. Jakie są czułe punkty w które warto uderzać aby potencjalny klient czuł bardzo silną potrzebę zakupu. Jak grać na emocjach.
3. Kim jest grupa docelowa i zbuduj jej avatar
4. Jak podejść do budowy marki dla tego produktu. Zaproponuj 5 nazw dla marki, mogą po polsku i po angielsku. Jak marka powinna się komunikować, jaki mieć styl, jakie wartości eksponować.
5. Opracuj plan komunikacji marketingowej
6. Przygotuj strategię rozwoju i pomysłu na skalowanie

Ten raport ma być przewodnikiem dla osoby, który już zdecydowała, że chce sprzedawać ten produkt i raport ma maksymalnie pomóc w tym, aby wprowadzić produkt na rynek, oraz zacząć budować markę wokół niego i maksymalizować zyski ze sprzedaży.

Podczas tworzenia wytycznych do Architektura Skutecznego Landing Page przemyśl dobrze układ tych sekcji aby było to zgodne z najnowszymi standardami tego, jak buduje się skuteczne i konwertujące landing page.

Raport jest przygotowany dla: {{customer_name}}
Odpowiednio to pokaż, aby osoba dla której jest raport, czuła, że to bardzo dedykowane.',
'Prompt do generowania raportu strategicznego dla produktu', 1),

('branding', 'Branding',
'Zrób branding dla workflow {{workflow_id}}
Instrukcje: c:\repos_tn\tn-crm\CLAUDE_BRANDING_PROCEDURE.md
Env: c:\repos_tn\tn-crm\.env',
'Prompt do generowania brandingu', 2),

('landing', 'Strona (Landing Page)',
'Przygotuj landing dla projektu {{workflow_id}}
i korzystaj z wytycznych CLAUDE_LANDING_PROCEDURE.md.',
'Prompt do generowania landing page', 3),

('video', 'Scenariusze Video',
'Wygeneruj scenariusze video dla workflow {{workflow_id}}

Instrukcje: c:\repos_tn\tn-crm\CLAUDE_VIDEO_SCENARIOS_PROCEDURE.md
Env: c:\repos_tn\tn-crm\.env',
'Prompt do generowania scenariuszy video', 4);

COMMENT ON TABLE ai_prompt_templates IS 'Szablony promptów AI do generowania treści dla projektów';
COMMENT ON COLUMN ai_prompt_templates.template_key IS 'Unikalny klucz szablonu: report, branding, landing, video';
COMMENT ON COLUMN ai_prompt_templates.content IS 'Treść z placeholderami: {{customer_name}}, {{workflow_id}}, {{product_name}}';
