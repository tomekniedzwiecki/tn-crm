-- Trigger: gdy kampania reklamowa wystartuje (campaign_launched: false → true),
-- automatycznie włącz auto_reports_enabled, żeby cron manus-auto-reports
-- pobierał i raportował wyniki co auto_reports_interval_days (domyślnie 7).
--
-- Powód: ręczne klikanie toggle "Automatyczne raporty" było zapominane —
-- workflow nie przechodził do Etapu 5 bo report_sent nigdy nie stawał się true.
-- Po włączeniu cron sam pobiera dane z Manus, a manus-webhook wysyła email.

CREATE OR REPLACE FUNCTION enable_auto_reports_on_campaign_launch()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.campaign_launched IS TRUE
     AND COALESCE(OLD.campaign_launched, FALSE) IS DISTINCT FROM TRUE
     AND NEW.auto_reports_enabled IS NOT TRUE THEN
    NEW.auto_reports_enabled := TRUE;
    IF NEW.auto_reports_interval_days IS NULL THEN
      NEW.auto_reports_interval_days := 7;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enable_auto_reports_on_campaign_launch ON workflow_ads;

CREATE TRIGGER trg_enable_auto_reports_on_campaign_launch
BEFORE INSERT OR UPDATE OF campaign_launched ON workflow_ads
FOR EACH ROW
EXECUTE FUNCTION enable_auto_reports_on_campaign_launch();

COMMENT ON FUNCTION enable_auto_reports_on_campaign_launch() IS
'Auto-włącza auto_reports_enabled przy starcie kampanii reklamowej. Bez tego workflow nie przechodzi do Etapu 5 (Optymalizacja).';
