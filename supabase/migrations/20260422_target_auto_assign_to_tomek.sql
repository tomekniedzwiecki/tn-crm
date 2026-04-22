-- Auto-assign lead to Tomek when status changes to 'negotiation' (Domykanie)
-- This implements the Target pipeline rule: Maciek przenosi do Domykania → Tomek automatycznie dostaje leada
-- User: tomekniedzwiecki@gmail.com (team_members.id = 6d05370c-0ada-4af9-b0d8-07e02e0f4792)

CREATE OR REPLACE FUNCTION auto_assign_negotiation_to_tomek()
RETURNS TRIGGER AS $$
DECLARE
    tomek_id UUID := '6d05370c-0ada-4af9-b0d8-07e02e0f4792';
BEGIN
    -- When status transitions TO negotiation, auto-assign to Tomek (unless already assigned to him)
    IF NEW.status = 'negotiation'
       AND (OLD.status IS NULL OR OLD.status != 'negotiation')
       AND (NEW.assigned_to IS NULL OR NEW.assigned_to != tomek_id)
    THEN
        NEW.assigned_to = tomek_id;

        -- Append activity log entry documenting the auto-reassign
        NEW.activities = COALESCE(NEW.activities, '[]'::jsonb) || jsonb_build_array(
            jsonb_build_object(
                'type', 'auto_reassign',
                'content', 'Auto-przekazano do Tomka (Domykanie)',
                'created_at', now(),
                'performed_by', NULL,
                'performed_by_name', 'System (target pipeline)'
            )
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_assign_negotiation_to_tomek ON leads;

CREATE TRIGGER trg_auto_assign_negotiation_to_tomek
BEFORE UPDATE ON leads
FOR EACH ROW
WHEN (NEW.status IS DISTINCT FROM OLD.status)
EXECUTE FUNCTION auto_assign_negotiation_to_tomek();

COMMENT ON FUNCTION auto_assign_negotiation_to_tomek IS
'Target pipeline automation: when Maciek moves a lead to Domykanie (status=negotiation), auto-assign to Tomek for closing. Fires via trigger on leads table. See /target panel.';
