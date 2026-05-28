-- ============================================
-- Auto-create order when an installment is manually marked as paid
-- ============================================
-- Bug (2026-05-28, Polańska Marzena lead 8cab1799-...): manualne oznaczenie
-- raty 1 jako oplaconej przez UI (lead.html toggleInstallmentStatus) ustawia
-- tylko `payment_installments.status='paid'` bez tworzenia ordera. Trigger
-- `create_workflow_on_payment` jest podpięty pod orders, wiec workflow nie
-- powstaje. W efekcie klient wplacil rate, status leada = won, ale brak
-- workflow + brak panelu klienta + brak maila powitalnego.
--
-- Fix:
-- 1. BEFORE trigger na payment_installments: gdy status→'paid' i order_id IS NULL,
--    tworzy order (description: "Rata N z M: <offer_name>", installment_id ustawiony).
--    Order INSERT odpala create_workflow_on_payment ktory (dla raty 1) buduje workflow.
--
-- 2. create_workflow_on_payment: gdy tworzy workflow z order-installment, linkuje
--    `payment_schedules.workflow_id = nowy workflow.id`. Inaczej pozniejsze
--    `update_workflow_payment_status` (trigger na payment_installments) wychodzi
--    od razu bo workflow_id IS NULL i payment_status workflowu zostaje 'pending'.

-- ============================================
-- 1) Funkcja: auto-create order on manual mark-as-paid
-- ============================================
CREATE OR REPLACE FUNCTION create_order_on_manual_installment_paid()
RETURNS TRIGGER AS $$
DECLARE
    v_schedule RECORD;
    v_lead RECORD;
    v_offer_name TEXT;
    v_description TEXT;
    v_new_order_id UUID;
BEGIN
    IF NEW.status != 'paid' THEN
        RETURN NEW;
    END IF;
    IF NEW.order_id IS NOT NULL THEN
        RETURN NEW;
    END IF;
    IF TG_OP = 'UPDATE' AND OLD.status = 'paid' THEN
        RETURN NEW;
    END IF;

    SELECT id, lead_id, installments_count
    INTO v_schedule
    FROM payment_schedules
    WHERE id = NEW.schedule_id;

    IF v_schedule.lead_id IS NULL THEN
        RAISE NOTICE 'Skip auto-order: schedule % bez lead_id', NEW.schedule_id;
        RETURN NEW;
    END IF;

    SELECT id, email, name, phone, offer_id
    INTO v_lead
    FROM leads
    WHERE id = v_schedule.lead_id;

    IF v_lead.email IS NULL OR v_lead.email = '' THEN
        RAISE NOTICE 'Skip auto-order: lead % bez emaila', v_schedule.lead_id;
        RETURN NEW;
    END IF;

    IF v_lead.offer_id IS NOT NULL THEN
        SELECT name INTO v_offer_name FROM offers WHERE id = v_lead.offer_id;
    END IF;
    v_offer_name := COALESCE(v_offer_name, 'Budowa sklepu pełen pakiet');

    v_description := 'Rata ' || NEW.installment_number || ' z '
        || v_schedule.installments_count || ': ' || v_offer_name;

    INSERT INTO orders (
        lead_id,
        customer_email,
        customer_name,
        customer_phone,
        description,
        amount,
        status,
        payment_source,
        manual_source,
        notes,
        paid_at,
        installment_id,
        skip_workflow
    ) VALUES (
        v_schedule.lead_id,
        v_lead.email,
        v_lead.name,
        v_lead.phone,
        v_description,
        NEW.amount,
        'paid',
        'bank_transfer',
        'manual_installment',
        'Auto-utworzone gdy rata oznaczona recznie jako oplacona w UI.',
        COALESCE(NEW.paid_at, NOW()),
        NEW.id,
        false
    )
    RETURNING id INTO v_new_order_id;

    NEW.order_id := v_new_order_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_create_order_on_manual_paid_ins ON payment_installments;
DROP TRIGGER IF EXISTS trigger_create_order_on_manual_paid_upd ON payment_installments;

CREATE TRIGGER trigger_create_order_on_manual_paid_ins
    BEFORE INSERT ON payment_installments
    FOR EACH ROW
    EXECUTE FUNCTION create_order_on_manual_installment_paid();

CREATE TRIGGER trigger_create_order_on_manual_paid_upd
    BEFORE UPDATE OF status ON payment_installments
    FOR EACH ROW
    EXECUTE FUNCTION create_order_on_manual_installment_paid();

-- ============================================
-- 2) Update create_workflow_on_payment: link payment_schedules.workflow_id
--    Pelny rewrite z dodatkowym blokiem na koncu.
-- ============================================
CREATE OR REPLACE FUNCTION create_workflow_on_payment()
RETURNS TRIGGER AS $$
DECLARE
    v_offer RECORD;
    v_workflow_id UUID;
    v_unique_token TEXT;
    v_milestone JSONB;
    v_milestone_id UUID;
    v_task JSONB;
    v_milestone_index INTEGER := 0;
    v_task_index INTEGER;
    v_start_date DATE;
    v_deadline DATE;
    v_milestones JSONB;
    v_client_name TEXT;
    v_project_url TEXT;
    v_offer_name TEXT;
    v_is_installment BOOLEAN;
    v_installment_number INTEGER;
BEGIN
    IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN

        IF NEW.skip_workflow = true THEN
            RAISE NOTICE 'Skipping workflow creation: skip_workflow=true (order %)', NEW.id;
            RETURN NEW;
        END IF;

        IF EXISTS (SELECT 1 FROM workflows WHERE order_id = NEW.id) THEN
            RETURN NEW;
        END IF;

        IF NEW.description ILIKE '%zadatek%' OR NEW.description ILIKE '%zaliczka%' THEN
            RAISE NOTICE 'Skipping workflow creation: deposit/advance payment (order %, %)', NEW.id, NEW.description;
            RETURN NEW;
        END IF;

        v_is_installment := NEW.installment_id IS NOT NULL;

        IF v_is_installment THEN
            SELECT installment_number INTO v_installment_number
            FROM payment_installments
            WHERE id = NEW.installment_id;

            IF v_installment_number > 1 THEN
                RAISE NOTICE 'Skipping workflow creation: installment % > 1 (order %)', v_installment_number, NEW.id;
                RETURN NEW;
            END IF;
        END IF;

        IF v_is_installment THEN
            v_offer_name := 'Budowa sklepu pełen pakiet';
        ELSE
            v_offer_name := NEW.description;
        END IF;

        -- ===== Offer lookup z priorytetem źródeł =====
        IF NEW.lead_id IS NOT NULL THEN
            SELECT o.id, o.name, o.milestones, o.offer_type
            INTO v_offer
            FROM leads l
            JOIN offers o ON o.id = l.offer_id
            WHERE l.id = NEW.lead_id;
        END IF;

        IF v_offer.id IS NULL AND NEW.customer_email IS NOT NULL AND NEW.customer_email != '' THEN
            SELECT o.id, o.name, o.milestones, o.offer_type
            INTO v_offer
            FROM workflows w
            JOIN offers o ON o.id = w.offer_id
            WHERE w.customer_email = NEW.customer_email
            ORDER BY w.created_at DESC
            LIMIT 1;
        END IF;

        IF v_offer.id IS NULL THEN
            SELECT id, name, milestones, offer_type
            INTO v_offer
            FROM offers
            WHERE name = v_offer_name
            LIMIT 1;
        END IF;

        IF v_offer.id IS NOT NULL AND COALESCE(v_offer.offer_type, 'full') != 'full' THEN
            RAISE NOTICE 'Skipping workflow creation: offer_type=% != full (order %)', v_offer.offer_type, NEW.id;
            RETURN NEW;
        END IF;

        IF v_offer.id IS NOT NULL
           AND NEW.customer_email IS NOT NULL
           AND NEW.customer_email != ''
           AND EXISTS (
               SELECT 1 FROM workflows
               WHERE customer_email = NEW.customer_email
                 AND offer_id = v_offer.id
           )
        THEN
            RAISE NOTICE 'Skipping workflow creation: customer % already has workflow for offer % (order %)',
                NEW.customer_email, v_offer.id, NEW.id;
            RETURN NEW;
        END IF;

        IF v_offer.id IS NULL THEN
            v_milestones := '[]'::JSONB;
        ELSE
            v_milestones := COALESCE(v_offer.milestones, '[]'::JSONB);
        END IF;

        INSERT INTO workflows (
            order_id,
            customer_email,
            customer_name,
            customer_company,
            customer_phone,
            offer_name,
            offer_id,
            amount,
            started_at,
            milestones_snapshot
        ) VALUES (
            NEW.id,
            NEW.customer_email,
            NEW.customer_name,
            NEW.customer_company,
            NEW.customer_phone,
            COALESCE(v_offer.name, v_offer_name, 'Zamówienie'),
            v_offer.id,
            NEW.amount,
            COALESCE(NEW.paid_at, NOW()),
            v_milestones
        )
        RETURNING id, unique_token INTO v_workflow_id, v_unique_token;

        v_start_date := COALESCE(NEW.paid_at::DATE, CURRENT_DATE);

        FOR v_milestone IN SELECT * FROM jsonb_array_elements(v_milestones)
        LOOP
            v_deadline := v_start_date + (COALESCE((v_milestone->>'duration_days')::INTEGER, 1) - 1);

            INSERT INTO workflow_milestones (
                workflow_id,
                milestone_index,
                title,
                description,
                duration_days,
                start_date,
                deadline,
                deliverables,
                status
            ) VALUES (
                v_workflow_id,
                v_milestone_index,
                COALESCE(v_milestone->>'title', 'Etap ' || (v_milestone_index + 1)),
                v_milestone->>'description',
                COALESCE((v_milestone->>'duration_days')::INTEGER, 1),
                v_start_date,
                v_deadline,
                COALESCE(v_milestone->'deliverables', '[]'::JSONB),
                CASE WHEN v_milestone_index = 0 THEN 'in_progress' ELSE 'pending' END
            )
            RETURNING id INTO v_milestone_id;

            v_task_index := 0;
            FOR v_task IN SELECT * FROM jsonb_array_elements(COALESCE(v_milestone->'tasks', '[]'::JSONB))
            LOOP
                INSERT INTO workflow_tasks (
                    milestone_id,
                    workflow_id,
                    task_index,
                    title,
                    responsible
                ) VALUES (
                    v_milestone_id,
                    v_workflow_id,
                    v_task_index,
                    COALESCE(v_task->>'title', 'Zadanie ' || (v_task_index + 1)),
                    COALESCE(v_task->>'responsible', 'team')
                );

                v_task_index := v_task_index + 1;
            END LOOP;

            v_start_date := v_deadline + 1;
            v_milestone_index := v_milestone_index + 1;
        END LOOP;

        IF v_milestone_index > 0 THEN
            UPDATE workflow_milestones
            SET status = 'in_progress', started_at = NOW()
            WHERE workflow_id = v_workflow_id AND milestone_index = 0;
        END IF;

        -- ===== NOWE: jesli workflow powstal z order-installment, zlinkuj schedule =====
        IF v_is_installment THEN
            UPDATE payment_schedules ps
            SET workflow_id = v_workflow_id
            FROM payment_installments pi
            WHERE pi.id = NEW.installment_id
              AND ps.id = pi.schedule_id
              AND ps.workflow_id IS NULL;
        END IF;

        IF NEW.customer_email IS NOT NULL AND NEW.customer_email != '' THEN
            v_client_name := COALESCE(split_part(NEW.customer_name, ' ', 1), 'Cześć');
            v_project_url := 'https://crm.tomekniedzwiecki.pl/projekt/' || v_unique_token;

            PERFORM net.http_post(
                url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/automation-trigger',
                headers := jsonb_build_object(
                    'Content-Type', 'application/json',
                    'Authorization', 'Bearer sb_publishable_vT94u2GI4gzYl8gCV5sHbQ_Q94YidaI'
                ),
                body := jsonb_build_object(
                    'trigger_type', 'workflow_created',
                    'entity_type', 'workflow',
                    'entity_id', v_workflow_id::TEXT,
                    'context', jsonb_build_object(
                        'email', NEW.customer_email,
                        'clientName', v_client_name,
                        'offerName', COALESCE(v_offer.name, v_offer_name, 'Projekt'),
                        'projectUrl', v_project_url
                    )
                )
            );
        END IF;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
