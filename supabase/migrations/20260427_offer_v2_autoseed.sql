-- =====================================================
-- OFFER V2: Auto-seed portfolio for stage 4 workflows
-- =====================================================
-- Jednorazowy seed: włącza portfolio_visible dla wszystkich workflow
-- które są w stage 4 (workflow_ads.is_active=true) i mają zarówno logo
-- jak i brand_info w workflow_branding.
--
-- Następnie wybiera 3 NAJNOWSZE (po created_at DESC) jako featured
-- (trailer slot 1, 2, 3). Resztę jako "tylko galeria".
--
-- Idempotentne: jeśli już ustawione ręcznie (portfolio_visible=true),
-- to UPDATE i tak ustawi to samo. Po uruchomieniu możesz dowolnie
-- zmieniać per-workflow w dropdown w nagłówku tn-workflow/workflow.

-- Krok 1: włącz portfolio_visible dla wszystkich kandydatów
UPDATE workflows w
SET portfolio_visible = TRUE
WHERE EXISTS (
    SELECT 1 FROM workflow_ads
    WHERE workflow_id = w.id AND is_active = TRUE
  )
  AND EXISTS (
    SELECT 1 FROM workflow_branding
    WHERE workflow_id = w.id AND type = 'logo' AND file_url IS NOT NULL
  )
  AND EXISTS (
    SELECT 1 FROM workflow_branding
    WHERE workflow_id = w.id AND type = 'brand_info'
  );

-- Krok 2: ustaw featured_order=1,2,3 dla 3 najnowszych
-- Najpierw wyzeruj poprzednie featured (jeśli były)
UPDATE workflows SET portfolio_featured_order = NULL
WHERE portfolio_featured_order IS NOT NULL;

WITH ranked AS (
  SELECT w.id, ROW_NUMBER() OVER (ORDER BY w.created_at DESC) AS rn
  FROM workflows w
  WHERE w.portfolio_visible = TRUE
)
UPDATE workflows
SET portfolio_featured_order = ranked.rn
FROM ranked
WHERE workflows.id = ranked.id
  AND ranked.rn <= 3;
