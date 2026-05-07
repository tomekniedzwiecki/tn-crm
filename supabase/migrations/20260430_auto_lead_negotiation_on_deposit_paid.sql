-- Auto-przesunięcie leada do statusu 'negotiation' (Domykanie)
-- gdy klient wpłaci zadatek/zaliczkę (order.status -> 'paid' z opisem zawierającym 'zadatek' lub 'zaliczka').
--
-- Spójne z definicją w target.html:
--   const DEPOSIT_REGEX = /(zadatek|zaliczka)/i;
--
-- Reguły:
--   1. Pala się tylko gdy order ma lead_id.
--   2. Nie nadpisuje statusów "końcowych": negotiation (już tam jest), won, lost, abandoned.
--   3. Loguje wpis 'auto_status_change' w lead.activities — dla audytu.

CREATE OR REPLACE FUNCTION auto_move_lead_to_negotiation_on_deposit()
RETURNS TRIGGER AS $$
DECLARE
    v_lead_status TEXT;
BEGIN
    IF NEW.lead_id IS NULL THEN
        RETURN NEW;
    END IF;

    IF NEW.status IS DISTINCT FROM 'paid' THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' AND OLD.status = 'paid' THEN
        RETURN NEW;
    END IF;

    IF NEW.description IS NULL
       OR NEW.description !~* '(zadatek|zaliczka)' THEN
        RETURN NEW;
    END IF;

    SELECT status INTO v_lead_status FROM leads WHERE id = NEW.lead_id;

    IF v_lead_status IS NULL
       OR v_lead_status IN ('negotiation', 'won', 'lost', 'abandoned') THEN
        RETURN NEW;
    END IF;

    UPDATE leads
    SET
        status = 'negotiation',
        activities = COALESCE(activities, '[]'::jsonb) || jsonb_build_array(
            jsonb_build_object(
                'type', 'auto_status_change',
                'content', 'Auto-przeniesiono do Domykania (wpłacony ' ||
                    CASE
                        WHEN NEW.description ~* 'zaliczka' THEN 'zaliczka'
                        ELSE 'zadatek'
                    END || ')',
                'created_at', now(),
                'performed_by', NULL,
                'performed_by_name', 'System (deposit paid)',
                'order_id', NEW.id,
                'order_number', NEW.order_number,
                'previous_status', v_lead_status
            )
        )
    WHERE id = NEW.lead_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_lead_negotiation_on_deposit_ins ON orders;
DROP TRIGGER IF EXISTS trg_auto_lead_negotiation_on_deposit_upd ON orders;

CREATE TRIGGER trg_auto_lead_negotiation_on_deposit_ins
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION auto_move_lead_to_negotiation_on_deposit();

CREATE TRIGGER trg_auto_lead_negotiation_on_deposit_upd
AFTER UPDATE OF status ON orders
FOR EACH ROW
EXECUTE FUNCTION auto_move_lead_to_negotiation_on_deposit();

COMMENT ON FUNCTION auto_move_lead_to_negotiation_on_deposit IS
'Gdy order z opisem zadatek/zaliczka zostanie oznaczony jako paid, przenosi powiązany lead w pipeline na status negotiation (Domykanie). Pomija leady już w negotiation/won/lost/abandoned. Loguje wpis auto_status_change w lead.activities.';
