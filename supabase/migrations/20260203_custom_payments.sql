-- =============================================
-- CUSTOM PAYMENTS - Jednorazowe linki do płatności bez workflow
-- =============================================
-- Pozwala tworzyć linki płatności które nie tworzą projektów w TN Workflow

-- 1. Dodaj kolumnę skip_workflow do orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS skip_workflow BOOLEAN DEFAULT false;

-- Komentarz dla dokumentacji
COMMENT ON COLUMN orders.skip_workflow IS 'Gdy true, płatność nie tworzy workflow (custom payment links)';

-- 2. Zaktualizuj trigger create_workflow_on_payment()
CREATE OR REPLACE FUNCTION create_workflow_on_payment()
RETURNS TRIGGER AS $$
DECLARE
    v_offer RECORD;
    v_workflow_id UUID;
    v_milestone JSONB;
    v_milestone_id UUID;
    v_task JSONB;
    v_milestone_index INTEGER := 0;
    v_task_index INTEGER;
    v_start_date DATE;
    v_deadline DATE;
    v_milestones JSONB;
BEGIN
    -- Tylko gdy status zmienia się na 'paid'
    IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN

        -- NOWE: Pomiń tworzenie workflow jeśli skip_workflow = true
        IF NEW.skip_workflow = true THEN
            RAISE NOTICE 'Skipping workflow creation for order % (skip_workflow=true)', NEW.id;
            RETURN NEW;
        END IF;

        -- Sprawdź czy workflow już istnieje
        IF EXISTS (SELECT 1 FROM workflows WHERE order_id = NEW.id) THEN
            RETURN NEW;
        END IF;

        -- Znajdź ofertę po nazwie (order.description = offer.name)
        SELECT id, name, milestones
        INTO v_offer
        FROM offers
        WHERE name = NEW.description
        LIMIT 1;

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
            COALESCE(NEW.description, 'Zamówienie'),
            v_offer.id,
            NEW.amount,
            COALESCE(NEW.paid_at, NOW()),
            v_milestones
        )
        RETURNING id INTO v_workflow_id;

        -- Ustaw datę startową na dzień płatności
        v_start_date := COALESCE(NEW.paid_at::DATE, CURRENT_DATE);

        -- Iteruj przez milestones i twórz rekordy
        FOR v_milestone IN SELECT * FROM jsonb_array_elements(v_milestones)
        LOOP
            -- Oblicz deadline
            v_deadline := v_start_date + (COALESCE((v_milestone->>'duration_days')::INTEGER, 1) - 1);

            -- Utwórz milestone
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

            -- Utwórz tasks dla tego milestone
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

            -- Następny milestone zaczyna się dzień po deadline poprzedniego
            v_start_date := v_deadline + 1;
            v_milestone_index := v_milestone_index + 1;
        END LOOP;

        -- Ustaw pierwszy milestone jako aktualny
        IF v_milestone_index > 0 THEN
            UPDATE workflow_milestones
            SET status = 'in_progress', started_at = NOW()
            WHERE workflow_id = v_workflow_id AND milestone_index = 0;
        END IF;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
