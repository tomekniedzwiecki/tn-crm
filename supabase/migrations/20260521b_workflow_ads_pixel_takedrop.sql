-- Rozdzielenie kroku PIXEL na 3 etapy:
--   1. pixel_configured            - ID pixela wpisane w panelu
--   2. pixel_takedrop_added (NEW)  - pixel_id wpisany w panel TakeDrop (natywna integracja)
--   3. pixel_landing_code_added    - kod fbq() dodany do landing page (Vercel)
--
-- Krok 2 (TakeDrop) jest niezalezny od kroku 3 (Landing) — sklep TakeDrop ma wlasny
-- mechanizm wstrzykiwania pixela na wszystkie strony + Purchase event na thank-you.
-- Landing page to osobna statyczna strona ktora wymaga recznego fbq().

ALTER TABLE workflow_ads
  ADD COLUMN IF NOT EXISTS pixel_takedrop_added BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS pixel_takedrop_added_at TIMESTAMPTZ;

COMMENT ON COLUMN workflow_ads.pixel_takedrop_added IS 'Czy pixel_id zostal wpisany w panelu TakeDrop sklepu (natywna integracja, fbq i Purchase event)';

-- BACKFILL: workflow_ads ktore juz maja uruchomiona kampanie traktujemy
-- jako TakeDrop tez skonfigurowany (kampania nie ruszylaby bez pixela na sklepie).
UPDATE workflow_ads
SET
  pixel_takedrop_added = TRUE,
  pixel_takedrop_added_at = campaign_launched_at
WHERE campaign_launched = TRUE;
