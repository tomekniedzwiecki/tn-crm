-- ============================================
-- Skip classic workflow for "budowa sklepu" (2026-07-23)
-- ============================================
-- Zakupy budowy SKLEPU nie tworzą już klasycznego workflow (tn-workflow +
-- client-projekt): klient sklepu jest prowadzony w Workflow v2 „Sklepy"
-- (tn-sklepy + portal /twoj-biznes) — projekt wf2 tworzy tpay-webhook przy
-- pełnej płatności (blok WORKFLOW V2, od 2026-07-23 także bez bud_session
-- dla zakupów z lejka /rozmowa).
--
-- Bez tej reguły opłacone zamówienie „Budowa sklepu pełen pakiet" tworzyło
-- workflow v1 i odpalało automatyzację workflow_created — klient dostawał
-- maila z linkiem do STAREGO portalu, a w /tn-sklepy nie pojawiał się wcale.
-- Incydent: hen.mir@o2.pl, 2026-07-23 (order 7308b60f-..., workflow 32fdbb2d-...
-- usunięty ręcznie, projekt wf2 042978c6-... utworzony ręcznie).
--
-- Dwa guardy (wzorzec 20260715f dla aplikacji):
--   RULE 1c: description ILIKE '%budowa sklepu%'
--   RULE 4c: po lookupie oferty — v_offer.name ILIKE '%budowa sklepu%'
--            (łapie raty: v_offer_name hardkoduje 'Budowa sklepu pełen pakiet',
--            oraz custom payment bez frazy w opisie)
-- Reszta funkcji = wierna kopia wersji live (20260715f).

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

        -- RULE 1b (2026-07-15): aplikacje obsługuje TN App (wfa_sync_projects),
        -- nie sklepowy workflow
        IF NEW.description ILIKE '%budowa aplikacji%' THEN
            RAISE NOTICE 'Skipping workflow creation: aplikacja (TN App) (order %, %)', NEW.id, NEW.description;
            RETURN NEW;
        END IF;

        -- RULE 1c (2026-07-23): budowę sklepu obsługuje Workflow v2 „Sklepy"
        -- (projekt wf2 tworzy tpay-webhook), nie klasyczny workflow
        IF NEW.description ILIKE '%budowa sklepu%' THEN
            RAISE NOTICE 'Skipping workflow creation: budowa sklepu (Workflow v2) (order %, %)', NEW.id, NEW.description;
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

        -- FIX 2026-06-24: zainicjalizuj v_offer (RECORD) ZAWSZE, zeby odczyty
        -- v_offer.id nie wybuchaly "record v_offer is not assigned yet" gdy
        -- order nie ma lead_id (blok lead-join ponizej sie wtedy nie wykonuje).
        SELECT NULL::uuid AS id, NULL::text AS name,
               NULL::jsonb AS milestones, NULL::text AS offer_type
        INTO v_offer;

        -- ===== Offer lookup z priorytetem zrodel =====
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

        -- RULE 4b (2026-07-15): lookup wskazał ofertę aplikacji (np. custom
        -- payment bez frazy w opisie, lead.offer_id = aplikacja) → TN App
        IF v_offer.name IS NOT NULL AND v_offer.name ILIKE '%budowa aplikacji%' THEN
            RAISE NOTICE 'Skipping workflow creation: oferta aplikacji % (TN App) (order %)', v_offer.name, NEW.id;
            RETURN NEW;
        END IF;

        -- RULE 4c (2026-07-23): lookup wskazał ofertę budowy sklepu → Workflow v2
        IF v_offer.name IS NOT NULL AND v_offer.name ILIKE '%budowa sklepu%' THEN
            RAISE NOTICE 'Skipping workflow creation: oferta budowy sklepu % (Workflow v2) (order %)', v_offer.name, NEW.id;
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
            COALESCE(v_offer.name, v_offer_name, 'Zamowienie'),
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

        IF v_is_installment THEN
            UPDATE payment_schedules ps
            SET workflow_id = v_workflow_id
            FROM payment_installments pi
            WHERE pi.id = NEW.installment_id
              AND ps.id = pi.schedule_id
              AND ps.workflow_id IS NULL;
        END IF;

        IF NEW.customer_email IS NOT NULL AND NEW.customer_email != '' THEN
            v_client_name := COALESCE(split_part(NEW.customer_name, ' ', 1), 'Czesc');
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
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_workflow_on_payment() IS 'Tworzy workflow gdy order.status=paid. Pomija: skip_workflow=true, zadatki/zaliczki, aplikacje (description/oferta ILIKE %budowa aplikacji% — projekt tworzy TN App), budowę sklepu (description/oferta ILIKE %budowa sklepu% — projekt wf2 tworzy tpay-webhook, Workflow v2), kolejne raty (installment_number>1), powtórki dla tej samej oferty (per customer_email + offer_id), oferty bez workflow (offer_type != full).';
