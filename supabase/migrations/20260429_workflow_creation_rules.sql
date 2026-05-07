-- ============================================
-- Workflow creation rules (2026-04-29)
-- ============================================
-- Zaostrzone warunki tworzenia workflow przy płatności:
--   0. Respektuj orders.skip_workflow=true (przywrócenie flagi z 20260203 — usuniętej omyłkowo w 20260318)
--   1. Pomiń zadatki/zaliczki (description zawiera "zadatek" lub "zaliczka", case-insensitive)
--   2. Pomiń drugą i kolejne raty harmonogramu (tylko installment_number=1 tworzy workflow)
--   3. Pomiń jeśli klient (po customer_email) ma już workflow dla tej oferty (offer_id)
--   4. Pomiń jeśli oferta nie zawiera workflow (offers.offer_type != 'full')
--
-- Bazuje na 20260330_fix_installment_workflow.sql — zachowuje całą logikę po checkach.

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
    -- Tylko gdy status zmienia się na 'paid'
    IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN

        -- RULE 0: Respektuj skip_workflow flag (custom payments, zadatki ustawiane przez frontend)
        IF NEW.skip_workflow = true THEN
            RAISE NOTICE 'Skipping workflow creation: skip_workflow=true (order %)', NEW.id;
            RETURN NEW;
        END IF;

        -- Idempotencja per order
        IF EXISTS (SELECT 1 FROM workflows WHERE order_id = NEW.id) THEN
            RETURN NEW;
        END IF;

        -- RULE 1: Pomiń zadatki / zaliczki (description zawiera "zadatek" lub "zaliczka", case-insensitive)
        IF NEW.description ILIKE '%zadatek%' OR NEW.description ILIKE '%zaliczka%' THEN
            RAISE NOTICE 'Skipping workflow creation: deposit/advance payment (order %, %)', NEW.id, NEW.description;
            RETURN NEW;
        END IF;

        -- Sprawdź czy to jest płatność raty
        v_is_installment := NEW.installment_id IS NOT NULL;

        -- RULE 2: Pomiń drugą+ ratę harmonogramu
        IF v_is_installment THEN
            SELECT installment_number INTO v_installment_number
            FROM payment_installments
            WHERE id = NEW.installment_id;

            IF v_installment_number > 1 THEN
                RAISE NOTICE 'Skipping workflow creation: installment % > 1 (order %)', v_installment_number, NEW.id;
                RETURN NEW;
            END IF;
        END IF;

        -- Dla płatności rat zawsze używaj "Budowa sklepu pełen pakiet"
        IF v_is_installment THEN
            v_offer_name := 'Budowa sklepu pełen pakiet';
        ELSE
            v_offer_name := NEW.description;
        END IF;

        -- Znajdź ofertę po nazwie
        SELECT id, name, milestones, offer_type
        INTO v_offer
        FROM offers
        WHERE name = v_offer_name
        LIMIT 1;

        -- RULE 4: Pomiń jeśli oferta nie zawiera workflow (offer_type != 'full')
        -- Jeśli oferta nie istnieje (v_offer.id IS NULL) - zachowuję dotychczasowy fallback (pusty workflow)
        IF v_offer.id IS NOT NULL AND COALESCE(v_offer.offer_type, 'full') != 'full' THEN
            RAISE NOTICE 'Skipping workflow creation: offer_type=% != full (order %)', v_offer.offer_type, NEW.id;
            RETURN NEW;
        END IF;

        -- RULE 3: Idempotencja per (customer_email, offer_id) - klient ma już workflow dla tej oferty
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

        -- Jeśli nie znaleziono oferty, stwórz pusty workflow
        IF v_offer.id IS NULL THEN
            v_milestones := '[]'::JSONB;
        ELSE
            v_milestones := COALESCE(v_offer.milestones, '[]'::JSONB);
        END IF;

        -- Utwórz workflow
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
            COALESCE(v_offer_name, 'Zamówienie'),
            v_offer.id,
            NEW.amount,
            COALESCE(NEW.paid_at, NOW()),
            v_milestones
        )
        RETURNING id, unique_token INTO v_workflow_id, v_unique_token;

        -- Ustaw datę startową na dzień płatności
        v_start_date := COALESCE(NEW.paid_at::DATE, CURRENT_DATE);

        -- Iteruj przez milestones i twórz rekordy
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

        -- Ustaw pierwszy milestone jako aktualny
        IF v_milestone_index > 0 THEN
            UPDATE workflow_milestones
            SET status = 'in_progress', started_at = NOW()
            WHERE workflow_id = v_workflow_id AND milestone_index = 0;
        END IF;

        -- Wywołaj automation-trigger (workflow_created)
        IF NEW.customer_email IS NOT NULL AND NEW.customer_email != '' THEN
            v_client_name := COALESCE(split_part(NEW.customer_name, ' ', 1), 'Cześć');
            v_project_url := 'https://crm.tomekniedzwiecki.pl/projekt/' || v_unique_token;

            PERFORM net.http_post(
                url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/automation-trigger',
                headers := jsonb_build_object(
                    'Content-Type', 'application/json',
                    'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4bWF2d2t3bmZ1cGhqcWJlbHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjQyNTUsImV4cCI6MjA4NDM0MDI1NX0.XeR0Fc7OFn6YbNJrOKTBEj36JtmLISZTM87y4ai9340'
                ),
                body := jsonb_build_object(
                    'trigger_type', 'workflow_created',
                    'entity_type', 'workflow',
                    'entity_id', v_workflow_id::TEXT,
                    'context', jsonb_build_object(
                        'email', NEW.customer_email,
                        'clientName', v_client_name,
                        'offerName', COALESCE(v_offer_name, 'Projekt'),
                        'projectUrl', v_project_url
                    )
                )
            );
        END IF;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_workflow_on_payment() IS 'Tworzy workflow gdy order.status=paid. Pomija: skip_workflow=true, zadatki/zaliczki (description ILIKE %zadatek%/%zaliczka%), kolejne raty (installment_number>1), powtórki dla tej samej oferty (per customer_email + offer_id), oferty bez workflow (offer_type != full).';
