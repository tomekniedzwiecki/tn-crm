-- Krok STRONA FB w Etap 4 - przed Pixel.
-- Admin musi przypisac Strone FB klienta do konta reklamowego w
-- business.facebook.com/latest/settings/pages/ (Business Settings).
-- Bez tego ads_get_ad_account_pages zwroci [] i create_ad rzuci blad
-- (kazda reklama Meta wymaga page_id w object_story_spec).

ALTER TABLE workflow_ads
  ADD COLUMN IF NOT EXISTS page_assigned BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS page_assigned_at TIMESTAMPTZ;

COMMENT ON COLUMN workflow_ads.page_assigned IS 'Czy Strona FB klienta zostala przypisana do konta reklamowego w Business Settings (warunek dla create_ad przez MCP)';

-- BACKFILL: workflow_ads ktore juz maja uruchomiona kampanie traktujemy
-- jako Strone tez podpieta (kampania nie ruszylaby bez page_id).
UPDATE workflow_ads
SET
  page_assigned = TRUE,
  page_assigned_at = campaign_launched_at
WHERE campaign_launched = TRUE;
