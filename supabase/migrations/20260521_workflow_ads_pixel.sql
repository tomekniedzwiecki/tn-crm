-- Krok PIXEL w Etap 4 - przed uruchomieniem kampanii.
-- Pozwala skonfigurowac Meta Pixel ID, wygenerowac prompt dla Claude Code
-- (dodanie fbq() do landingu) i zaznaczyc obie czynnosci jako done.
--
-- Tab "Pixel" w workflow.html wstawiany PRZED tabem "Kampania".
-- renderStepCampaign() ma gate na pixel_configured.

ALTER TABLE workflow_ads
  ADD COLUMN IF NOT EXISTS pixel_id TEXT,
  ADD COLUMN IF NOT EXISTS pixel_configured BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS pixel_configured_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pixel_landing_code_added BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS pixel_landing_code_added_at TIMESTAMPTZ;

COMMENT ON COLUMN workflow_ads.pixel_id IS 'Meta Pixel ID (numeric, np. 123456789012345) skonfigurowany dla landingu';
COMMENT ON COLUMN workflow_ads.pixel_configured IS 'Czy pixel_id zostal wpisany i zapisany w panelu admina';
COMMENT ON COLUMN workflow_ads.pixel_landing_code_added IS 'Czy kod fbq() zostal dodany do landingu i przegrany do CMS (TakeDrop)';

-- BACKFILL: workflow_ads ktore juz maja uruchomiona kampanie traktujemy
-- jako pixel skonfigurowany (kampania w Mecie nie ruszylaby bez pixela
-- z konfiguracja OFFSITE_CONVERSIONS). Pixel_id zostawiamy NULL bo nie
-- znamy historycznych wartosci - Tomek moze uzupelnic recznie pozniej.
UPDATE workflow_ads
SET
  pixel_configured = TRUE,
  pixel_configured_at = campaign_launched_at,
  pixel_landing_code_added = TRUE,
  pixel_landing_code_added_at = campaign_launched_at
WHERE campaign_launched = TRUE;
