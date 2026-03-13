-- =====================================================
-- Auto-cleanup follow-ups when lead status changes
-- Gdy lead zmienia status, stare pending follow-upy są oznaczane jako 'skipped'
-- =====================================================

-- Funkcja wywoływana przy zmianie statusu leada
CREATE OR REPLACE FUNCTION cleanup_pending_followups_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Jeśli status się zmienił
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Oznacz wszystkie pending follow-upy dla tego leada jako skipped
        UPDATE whatsapp_followups
        SET status = 'skipped'
        WHERE lead_id = NEW.id
          AND status = 'pending';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger na tabeli leads
DROP TRIGGER IF EXISTS trigger_cleanup_followups_on_status_change ON leads;

CREATE TRIGGER trigger_cleanup_followups_on_status_change
    AFTER UPDATE OF status ON leads
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_pending_followups_on_status_change();

-- =====================================================
-- Jednorazowe czyszczenie: oznacz stare follow-upy jako skipped
-- dla leadów których aktualny status != lead_status w follow-upie
-- =====================================================

UPDATE whatsapp_followups f
SET status = 'skipped'
FROM leads l
WHERE f.lead_id = l.id
  AND f.status = 'pending'
  AND f.lead_status IS DISTINCT FROM l.status;
