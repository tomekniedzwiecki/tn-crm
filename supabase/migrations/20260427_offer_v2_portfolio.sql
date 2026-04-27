-- =====================================================
-- OFFER V2: Portfolio (stage 4 case studies for /p2/:token)
-- =====================================================
-- 1. Two control fields on workflows:
--    portfolio_visible: master toggle (default FALSE — Tomek manualnie włącza)
--    portfolio_featured_order: 1, 2, 3 = pozycja w trailerze; NULL = tylko galeria
-- 2. SECURITY DEFINER function get_portfolio_offer() returning safe portfolio data
--    (RPC bypasses RLS on workflows/branding/products/ads — exposes only
--    pre-curated, non-sensitive fields).

ALTER TABLE workflows
  ADD COLUMN IF NOT EXISTS portfolio_visible BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS portfolio_featured_order INT NULL;

COMMENT ON COLUMN workflows.portfolio_visible IS 'Master toggle — czy ten workflow pokazujemy w client-offer-v2 portfolio';
COMMENT ON COLUMN workflows.portfolio_featured_order IS '1, 2 lub 3 = pozycja w trailerze (slajdy 3-5); NULL = tylko galeria scroll';

CREATE INDEX IF NOT EXISTS idx_workflows_portfolio
  ON workflows (portfolio_visible, portfolio_featured_order)
  WHERE portfolio_visible = TRUE;

-- =====================================================
-- get_portfolio_offer() — SECURITY DEFINER function
-- =====================================================
-- Filtry:
--   1. workflows.portfolio_visible = TRUE (Tomek włączył ręcznie)
--   2. workflow_ads.is_active = TRUE (etap 4 aktywny — reklamy lecą)
-- Zwraca tylko bezpieczne pola (logo, nazwa marki, tagline z brand_info, mockup, produkt, landing_url).
-- Brak emaili klientów, telefonów, statusów płatności, finansów.

CREATE OR REPLACE FUNCTION get_portfolio_offer()
RETURNS TABLE (
  workflow_id UUID,
  landing_page_url TEXT,
  portfolio_featured_order INT,
  created_at TIMESTAMPTZ,
  brand_name TEXT,
  brand_info_json TEXT,
  logo_url TEXT,
  mockup_url TEXT,
  product_name TEXT,
  product_image TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    w.id AS workflow_id,
    COALESCE(
      (SELECT landing_url FROM workflow_takedrop WHERE workflow_id = w.id LIMIT 1),
      w.sales_page_url
    ) AS landing_page_url,
    w.portfolio_featured_order,
    w.created_at,
    b_info.title AS brand_name,
    b_info.value AS brand_info_json,
    (SELECT file_url FROM workflow_branding
       WHERE workflow_id = w.id AND type = 'logo' AND file_url IS NOT NULL
       ORDER BY created_at DESC LIMIT 1) AS logo_url,
    (SELECT file_url FROM workflow_branding
       WHERE workflow_id = w.id AND type = 'mockup' AND file_url IS NOT NULL
       ORDER BY created_at DESC LIMIT 1) AS mockup_url,
    (SELECT name FROM workflow_products
       WHERE workflow_id = w.id ORDER BY created_at LIMIT 1) AS product_name,
    (SELECT image_url FROM workflow_products
       WHERE workflow_id = w.id AND image_url IS NOT NULL
       ORDER BY created_at LIMIT 1) AS product_image
  FROM workflows w
  LEFT JOIN workflow_branding b_info ON b_info.workflow_id = w.id AND b_info.type = 'brand_info'
  WHERE w.portfolio_visible = TRUE
    AND EXISTS (
      SELECT 1 FROM workflow_ads
      WHERE workflow_id = w.id AND is_active = TRUE
    )
  ORDER BY w.portfolio_featured_order ASC NULLS LAST, w.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION get_portfolio_offer() TO anon, authenticated;

COMMENT ON FUNCTION get_portfolio_offer() IS 'Public-safe portfolio data dla client-offer-v2 — zwraca workflow w etapie 4 z portfolio_visible=true. SECURITY DEFINER omija RLS bazowych tabel ale eksponuje tylko bezpieczne pola.';
