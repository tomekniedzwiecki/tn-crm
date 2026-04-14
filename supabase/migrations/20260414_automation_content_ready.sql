-- Automatyzacja: content_ready → wyślij email content_ready
-- Tworzona poprzez INSERT do automation_flows i automation_steps

DO $$
DECLARE
  v_flow_id uuid;
BEGIN
  -- Skasuj jeśli już istnieje (idempotent)
  DELETE FROM automation_flows WHERE trigger_type = 'content_ready';

  -- Wstaw flow
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

  -- Wstaw krok: wyślij email content_ready
  INSERT INTO automation_steps (flow_id, step_order, step_type, config)
  VALUES (
    v_flow_id,
    0,
    'action',
    '{"action_type":"send_email","email_type":"content_ready"}'::jsonb
  );
END $$;
