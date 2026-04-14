-- =============================================
-- ADS CAMPAIGN CONTENT: Research, Copy, Creatives
-- =============================================
-- Nowe pola w workflow_ads do przechowywania:
-- 1. Research konkurencji (z Manus)
-- 2. Copy reklamowe (5 wersji)
-- 3. Kreacje graficzne (zdjęcia do reklam)

-- Research konkurencji (wynik z Manus)
ALTER TABLE workflow_ads
ADD COLUMN IF NOT EXISTS competitor_research JSONB,
ADD COLUMN IF NOT EXISTS competitor_research_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS competitor_research_task_id TEXT,
ADD COLUMN IF NOT EXISTS competitor_research_status TEXT DEFAULT 'idle';

-- Copy reklamowe (5 wersji z różnymi kątami)
ALTER TABLE workflow_ads
ADD COLUMN IF NOT EXISTS ad_copies JSONB,
ADD COLUMN IF NOT EXISTS ad_copies_generated_at TIMESTAMPTZ;

-- Kreacje graficzne (zdjęcia reklamowe)
ALTER TABLE workflow_ads
ADD COLUMN IF NOT EXISTS ad_creatives JSONB,
ADD COLUMN IF NOT EXISTS ad_creatives_generated_at TIMESTAMPTZ;

-- Struktura competitor_research:
-- {
--   "category": "myjki parowe",
--   "keywords": ["myjka parowa", "parova"],
--   "competitors": [
--     { "brand": "Kärcher", "ad_text": "...", "format": "image", "angle": "quality", "hook": "..." },
--     ...
--   ],
--   "common_angles": ["price", "quality", "health"],
--   "gaps": ["Nikt nie mówi o..."],
--   "recommendations": ["Skup się na...", "Unikaj..."]
-- }

-- Struktura ad_copies:
-- {
--   "wow_factor": "15 sekund do pary vs 3 minuty u konkurencji",
--   "target_group": "Rodziny z dziećmi 30-45, alergicy",
--   "product_name": "Parova 3800W",
--   "landing_url": "https://...",
--   "versions": [
--     {
--       "angle": "Pain Point",
--       "primary_text": "...",
--       "headline": "...",
--       "description": "...",
--       "cta": "Sprawdź szczegóły"
--     },
--     ... (5 wersji)
--   ]
-- }

-- Struktura ad_creatives:
-- [
--   { "type": "lifestyle", "url": "https://...", "prompt": "...", "generated_at": "..." },
--   { "type": "problem", "url": "https://...", "prompt": "...", "generated_at": "..." },
--   ... (3-5 zdjęć)
-- ]

COMMENT ON COLUMN workflow_ads.competitor_research IS 'Research konkurencji z Facebook Ad Library (via Manus)';
COMMENT ON COLUMN workflow_ads.ad_copies IS 'Copy reklamowe - 5 wersji z różnymi kątami';
COMMENT ON COLUMN workflow_ads.ad_creatives IS 'Kreacje graficzne - zdjęcia do reklam (URLs z Supabase Storage)';
