-- Automatyczne wysyłanie emaila workflow_created po utworzeniu workflow przez trigger
-- Wymaga: pg_net (włączone w Supabase Dashboard -> Database -> Extensions)

CREATE EXTENSION IF NOT EXISTS pg_net;

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
BEGIN
    -- Tylko gdy status zmienia się na 'paid'
    IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN

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
        RETURNING id, unique_token INTO v_workflow_id, v_unique_token;

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

        -- Wyślij email workflow_created przez Edge Function (pg_net)
        IF NEW.customer_email IS NOT NULL AND NEW.customer_email != '' THEN
            v_client_name := COALESCE(split_part(NEW.customer_name, ' ', 1), 'Cześć');
            v_project_url := 'https://crm.tomekniedzwiecki.pl/projekt/' || v_unique_token;

            PERFORM net.http_post(
                url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/send-email',
                headers := jsonb_build_object(
                    'Content-Type', 'application/json',
                    'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4bWF2d2t3bmZ1cGhqcWJlbHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjQyNTUsImV4cCI6MjA4NDM0MDI1NX0.XeR0Fc7OFn6YbNJrOKTBEj36JtmLISZTM87y4ai9340'
                ),
                body := jsonb_build_object(
                    'type', 'workflow_created',
                    'data', jsonb_build_object(
                        'email', NEW.customer_email,
                        'clientName', v_client_name,
                        'offerName', COALESCE(NEW.description, 'Projekt'),
                        'projectUrl', v_project_url
                    )
                )
            );
        END IF;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
