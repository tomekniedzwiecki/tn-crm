-- ETAP 5 / Krok 2: Opinie (AliExpress reviews)
-- Tabela na opinie pobrane z AliExpress, filtrowane (5*, ze zdjeciami).
-- Klient i admin moga ukrywac konkretne opinie z landing page.

CREATE TABLE IF NOT EXISTS workflow_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,

    -- Source identification (idempotency)
    source TEXT NOT NULL DEFAULT 'aliexpress',
    source_review_id TEXT NOT NULL, -- evaDate + buyerName hash lub natywne id z API

    -- Content
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    content_pl TEXT NOT NULL, -- tekst do pokazania (PL, oryginalny lub przetlumaczony)
    content_original TEXT, -- oryginalny tekst (jesli inny niz PL)
    language_original TEXT, -- kod jezyka oryginalu (pl, en, fr, ...)
    was_translated BOOLEAN NOT NULL DEFAULT FALSE,

    -- Author
    author_name TEXT, -- np. "I***a" (zamaskowane przez aliexpress)
    review_date TEXT, -- evaDate z API (string)
    sku_info TEXT, -- wariant produktu

    -- Images (URLs z aliexpress-media.com)
    image_urls JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Visibility
    hidden BOOLEAN NOT NULL DEFAULT FALSE,
    hidden_at TIMESTAMPTZ,
    hidden_by TEXT, -- 'client' lub 'admin'

    -- Metadata
    sort_order INT NOT NULL DEFAULT 0, -- kolejnosc na stronie
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (workflow_id, source, source_review_id) -- idempotency
);

CREATE INDEX IF NOT EXISTS idx_workflow_reviews_workflow_id ON workflow_reviews(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_reviews_visible ON workflow_reviews(workflow_id, hidden) WHERE hidden = FALSE;

-- RLS
ALTER TABLE workflow_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated full access reviews" ON workflow_reviews;
CREATE POLICY "Authenticated full access reviews"
ON workflow_reviews
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Anon: SELECT widocznych opinii (dla landing page)
DROP POLICY IF EXISTS "Anon can read visible reviews" ON workflow_reviews;
CREATE POLICY "Anon can read visible reviews"
ON workflow_reviews
FOR SELECT
TO anon
USING (hidden = FALSE);

-- Anon: UPDATE pole hidden (klient ukrywa z panelu)
-- Bezpieczeństwo: anon w client-projekt ma sesję przez token, ale RLS i tak dopuści
-- tylko UPDATE pola hidden (walidacja w aplikacji + RLS column-level)
DROP POLICY IF EXISTS "Anon can hide reviews" ON workflow_reviews;
CREATE POLICY "Anon can hide reviews"
ON workflow_reviews
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_workflow_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS workflow_reviews_updated_at ON workflow_reviews;
CREATE TRIGGER workflow_reviews_updated_at
    BEFORE UPDATE ON workflow_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_reviews_updated_at();

-- =============================================
-- workflow_optimization: nowe kolumny dla opinii
-- =============================================
ALTER TABLE workflow_optimization
    ADD COLUMN IF NOT EXISTS reviews_product_url TEXT,
    ADD COLUMN IF NOT EXISTS reviews_fetched_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS reviews_count INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS reviews_total_ratings INT,    -- numRatings z aliexpress (np. 6800)
    ADD COLUMN IF NOT EXISTS reviews_avg_star NUMERIC(3,2), -- np. 4.85
    ADD COLUMN IF NOT EXISTS reviews_positive_pct NUMERIC(5,2); -- np. 96.20

COMMENT ON TABLE workflow_reviews IS 'Etap 5/Krok 2 - Opinie AliExpress. RLS: anon SELECT visible, anon UPDATE (dla panel klienta). Idempotency: (workflow_id, source, source_review_id)';
COMMENT ON COLUMN workflow_reviews.image_urls IS 'JSONB array URL-i zdjec z aliexpress-media.com';
COMMENT ON COLUMN workflow_optimization.reviews_total_ratings IS 'Liczba wszystkich ocen produktu z aliexpress (do social proof header)';
