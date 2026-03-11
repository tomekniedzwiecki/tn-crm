-- Add upgrade workflow columns to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS upgrade_workflow_id UUID REFERENCES workflows(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS upgrade_to_offer_id UUID REFERENCES offers(id);

COMMENT ON COLUMN orders.upgrade_workflow_id IS 'Workflow to upgrade when payment succeeds';
COMMENT ON COLUMN orders.upgrade_to_offer_id IS 'Target offer for the workflow upgrade';

-- Create function to handle workflow upgrade on payment
CREATE OR REPLACE FUNCTION upgrade_workflow_on_payment()
RETURNS TRIGGER AS $$
DECLARE
    v_offer RECORD;
    v_workflow RECORD;
BEGIN
    -- Only when status changes to 'paid'
    IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN

        -- Check if this is an upgrade payment
        IF NEW.upgrade_workflow_id IS NOT NULL AND NEW.upgrade_to_offer_id IS NOT NULL THEN

            -- Get the target offer
            SELECT id, name, milestones INTO v_offer
            FROM offers
            WHERE id = NEW.upgrade_to_offer_id;

            IF FOUND THEN
                -- Update the workflow with new offer
                UPDATE workflows
                SET
                    offer_id = NEW.upgrade_to_offer_id,
                    offer_name = v_offer.name,
                    milestones_snapshot = v_offer.milestones,
                    amount = amount + NEW.amount,
                    updated_at = NOW()
                WHERE id = NEW.upgrade_workflow_id;

                RAISE NOTICE 'Upgraded workflow % to offer %', NEW.upgrade_workflow_id, v_offer.name;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for workflow upgrade
DROP TRIGGER IF EXISTS trigger_upgrade_workflow_on_payment ON orders;
CREATE TRIGGER trigger_upgrade_workflow_on_payment
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION upgrade_workflow_on_payment();
