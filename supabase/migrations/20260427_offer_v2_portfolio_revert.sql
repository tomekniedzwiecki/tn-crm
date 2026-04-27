-- =====================================================
-- OFFER V2: Revert portfolio mechanism
-- =====================================================
-- Wycofuje wszystko z 20260427_offer_v2_portfolio.sql i 20260427_offer_v2_autoseed.sql.
-- Tomek nie chce pokazywać innych marek w ofertach. Czyścimy:
--   1. portfolio_visible = false dla wszystkich
--   2. portfolio_featured_order = null dla wszystkich
--   3. drop RPC get_portfolio_offer()
--   4. drop index
--   5. drop kolumny

-- 1+2. Wycofaj seed (na wypadek gdyby kolumny zostały)
UPDATE workflows
SET portfolio_visible = FALSE, portfolio_featured_order = NULL
WHERE portfolio_visible = TRUE OR portfolio_featured_order IS NOT NULL;

-- 3. Drop RPC
DROP FUNCTION IF EXISTS get_portfolio_offer();

-- 4. Drop index
DROP INDEX IF EXISTS idx_workflows_portfolio;

-- 5. Drop kolumny
ALTER TABLE workflows
  DROP COLUMN IF EXISTS portfolio_visible,
  DROP COLUMN IF EXISTS portfolio_featured_order;
