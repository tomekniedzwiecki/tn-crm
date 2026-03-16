-- Update upgrade trigger to also set offer_type
CREATE OR REPLACE FUNCTION upgrade_workflow_on_payment()
RETURNS TRIGGER AS $$
DECLARE
    v_offer RECORD;
BEGIN
    -- Only when status changes to 'paid'
    IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN

        -- Check if this is an upgrade payment
        IF NEW.upgrade_workflow_id IS NOT NULL AND NEW.upgrade_to_offer_id IS NOT NULL THEN

            -- Get the target offer (including offer_type)
            SELECT id, name, milestones, offer_type INTO v_offer
            FROM offers
            WHERE id = NEW.upgrade_to_offer_id;

            IF FOUND THEN
                -- Update the workflow with new offer and offer_type
                UPDATE workflows
                SET
                    offer_id = NEW.upgrade_to_offer_id,
                    offer_name = v_offer.name,
                    offer_type = COALESCE(v_offer.offer_type, 'full'),
                    milestones_snapshot = v_offer.milestones,
                    amount = amount + NEW.amount,
                    updated_at = NOW()
                WHERE id = NEW.upgrade_workflow_id;

                RAISE NOTICE 'Upgraded workflow % to offer % (type: %)',
                    NEW.upgrade_workflow_id, v_offer.name, v_offer.offer_type;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
