-- Dodaj content_ready + campaign_launched do CHECK constraint trigger_type
ALTER TABLE automation_flows DROP CONSTRAINT IF EXISTS automation_flows_trigger_type_check;

ALTER TABLE automation_flows ADD CONSTRAINT automation_flows_trigger_type_check
CHECK (trigger_type = ANY (ARRAY[
  'lead_created'::text, 'offer_created'::text, 'offer_viewed'::text, 'offer_expired'::text,
  'offer_reminder_halfway'::text, 'payment_received'::text, 'contract_signed'::text,
  'contract_sent'::text, 'invoice_sent'::text, 'proforma_generated'::text,
  'workflow_created'::text, 'stage_completed'::text, 'products_shared'::text,
  'report_published'::text, 'branding_delivered'::text, 'sales_page_shared'::text,
  'video_activated'::text, 'scenarios_shared'::text, 'video_recordings_complete'::text,
  'takedrop_activated'::text, 'landing_page_connected'::text, 'test_ready'::text,
  'ads_activated'::text, 'partner_step_completed'::text, 'ads_completed'::text,
  'content_ready'::text, 'campaign_launched'::text
]));

-- Utwórz automatyzację content_ready → email
DO $$
DECLARE
  v_flow_id uuid;
BEGIN
  DELETE FROM automation_flows WHERE trigger_type = 'content_ready';

  INSERT INTO automation_flows (name, description, trigger_type, category, is_active, display_order)
  VALUES (
    'Materiały reklamowe gotowe',
    'Wysyłka emaila do klienta gdy admin udostępni materiały reklamowe (research + copy + kreacje graficzne)',
    'content_ready',
    'workflow',
    true,
    100
  )
  RETURNING id INTO v_flow_id;

  INSERT INTO automation_steps (flow_id, step_order, step_type, config)
  VALUES (
    v_flow_id,
    0,
    'action',
    '{"action_type":"send_email","email_type":"content_ready"}'::jsonb
  );
END $$;
