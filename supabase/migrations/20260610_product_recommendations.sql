-- =============================================
-- PRODUKTY V2 — rekomendacje produktowe ze scoringiem
-- System weryfikacji potencjalu produktow przed dodaniem do katalogu.
-- Kazdy rekord = kandydat przebadany przez research (popyt, marza, konkurencja,
-- ryzyka prawne, potencjal reklamowy) z pelnym uzasadnieniem i dowodami.
-- =============================================

CREATE TABLE IF NOT EXISTS product_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tozsamosc produktu
    name TEXT NOT NULL,                          -- robocza nazwa PL (np. "Lampa antysmogowa do sypialni")
    category TEXT NOT NULL,                      -- kategoria z shortlisty frameworku
    problem_statement TEXT,                      -- jaki problem rozwiazuje i dla kogo
    target_audience TEXT,                        -- opis grupy docelowej + szacowana wielkosc
    description TEXT,                            -- opis produktu
    image_url TEXT,
    source_url TEXT,                             -- glowne zrodlo zaopatrzenia (AliExpress itp.)
    source_alternatives JSONB DEFAULT '[]',      -- [{url, price_pln, notes}]

    -- Unit economics (PLN, konserwatywne zalozenia)
    cogs_pln NUMERIC(10,2),                      -- koszt produktu + wysylka z Chin
    retail_price_pln NUMERIC(10,2),              -- rekomendowana cena detaliczna
    shipping_cost_pln NUMERIC(10,2),             -- wysylka krajowa (kurier/paczkomat + pobranie)
    contribution_margin_pln NUMERIC(10,2),       -- marza kontrybucyjna po WSZYSTKICH kosztach zmiennych
    max_cpa_pln NUMERIC(10,2),                   -- maksymalny oplacalny koszt pozyskania zakupu
    breakeven_roas NUMERIC(5,2),                 -- prog rentownosci ROAS
    margin_multiple NUMERIC(5,2),                -- mnoznik cena/COGS
    economics_notes TEXT,                        -- zalozenia i zastrzezenia do wyliczen

    -- Scoring (framework w settings.product_research_framework)
    total_score NUMERIC(5,1),                    -- 0-100
    scores JSONB DEFAULT '{}',                   -- {dimension_key: {score, max, rationale}}
    verdict TEXT CHECK (verdict IN ('recommended','conditional','rejected')),
    verdict_reason TEXT,                         -- 1-3 zdania dlaczego taki werdykt
    hard_fails JSONB DEFAULT '[]',               -- lista naruszonych anty-kryteriow
    risk_notes TEXT,                             -- ryzyka prawne/platformowe/operacyjne

    -- Dowody i sygnaly rynkowe
    evidence JSONB DEFAULT '[]',                 -- [{type, claim, source_url, confidence}]
    demand_signals JSONB DEFAULT '{}',           -- {allegro, google_trends, meta_ads, tiktok, ...}
    competition_notes TEXT,                      -- kto juz to sprzedaje w PL i za ile
    ad_angles JSONB DEFAULT '[]',                -- [{angle, audience, hook}] pomysly na katy reklamowe
    brand_potential TEXT,                        -- dlaczego da sie wokol tego zbudowac marke

    -- Cykl zycia rekomendacji
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived','promoted')),
    research_round TEXT,                         -- np. '2026-06-R1' — partia researchu
    researched_at TIMESTAMPTZ DEFAULT now(),
    valid_until DATE,                            -- po tej dacie wymaga ponownej weryfikacji
    promoted_product_id UUID REFERENCES workflow_products(id),  -- po awansie do katalogu

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_recommendations_status ON product_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_verdict ON product_recommendations(verdict);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_score ON product_recommendations(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_round ON product_recommendations(research_round);

COMMENT ON TABLE product_recommendations IS 'Produkty V2: kandydaci produktowi ze scoringiem potencjalu, unit economics i dowodami rynkowymi';

ALTER TABLE product_recommendations ENABLE ROW LEVEL SECURITY;

-- Admin (authenticated): pelny dostep
CREATE POLICY "Admin full access to product_recommendations" ON product_recommendations
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Klient (anon): widzi tylko opublikowane rekomendacje (przyszla integracja z portalem klienta)
CREATE POLICY "Client read published recommendations" ON product_recommendations
    FOR SELECT TO anon USING (status = 'published');
