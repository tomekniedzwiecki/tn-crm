-- Automatyzacja: Po 3 nagraniach video -> aktywuj TakeDrop (po 90 min)

-- 1. Dodaj video_recordings_complete do dozwolonych trigger_types
ALTER TABLE automation_flows DROP CONSTRAINT IF EXISTS automation_flows_trigger_type_check;
ALTER TABLE automation_flows ADD CONSTRAINT automation_flows_trigger_type_check
CHECK (trigger_type IN (
    'lead_created',
    'offer_created', 'offer_viewed', 'offer_expired', 'offer_reminder_halfway',
    'payment_received', 'contract_signed', 'contract_sent', 'invoice_sent', 'proforma_generated',
    'workflow_created', 'stage_completed',
    'products_shared', 'report_published', 'branding_delivered', 'sales_page_shared',
    'video_activated', 'scenarios_shared', 'video_recordings_complete',
    'takedrop_activated', 'landing_page_connected', 'test_ready',
    'ads_activated', 'partner_step_completed', 'ads_completed'
));

-- 2. Utwórz flow
INSERT INTO automation_flows (name, description, trigger_type, is_active)
VALUES (
    'Aktywuj TakeDrop po 3 nagraniach',
    'Automatycznie włącza widoczność TakeDrop dla klienta 90 minut po dodaniu 3. nagrania video',
    'video_recordings_complete',
    true
);

-- 3. Krok 1: Delay 90 minut
INSERT INTO automation_steps (flow_id, step_order, step_type, config)
SELECT id, 1, 'delay', '{"delay_value": 90, "delay_unit": "minutes"}'::jsonb
FROM automation_flows WHERE trigger_type = 'video_recordings_complete';

-- 4. Krok 2: Aktywuj TakeDrop
INSERT INTO automation_steps (flow_id, step_order, step_type, config)
SELECT id, 2, 'action', '{"action_type": "activate_takedrop"}'::jsonb
FROM automation_flows WHERE trigger_type = 'video_recordings_complete';
