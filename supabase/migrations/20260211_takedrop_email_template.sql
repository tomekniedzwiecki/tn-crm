-- =============================================
-- EMAIL TEMPLATE: TakeDrop Activated (Stage 2 Start)
-- =============================================
-- Wysyłany gdy admin aktywuje zakładkę TakeDrop dla klienta
-- Format: settings table (email_template_[type]_subject/body)

INSERT INTO settings (key, value) VALUES (
  'email_template_takedrop_activated_subject',
  'Etap 2: Czas założyć konto w TakeDrop'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO settings (key, value) VALUES (
  'email_template_takedrop_activated_body',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #000; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #000;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px;">
          <tr>
            <td style="padding-bottom: 32px;">
              <div style="font-size: 24px; font-weight: 600; color: #fff;">Przechodzimy do Etapu 2</div>
              <div style="font-size: 14px; color: #666; margin-top: 4px;">Konfiguracja platformy sklepowej</div>
            </td>
          </tr>
          <tr>
            <td style="background: #0a0a0a; border: 1px solid #222; border-radius: 12px; padding: 32px;">
              <div style="font-size: 15px; color: #e5e5e5; line-height: 1.6;">
                <p style="margin: 0 0 16px 0;">Cześć {{clientName}},</p>
                <p style="margin: 0 0 16px 0;">Świetna wiadomość — zakończyliśmy pierwszy etap i teraz przechodzimy do <strong style="color: #fff;">Etapu 2: konfiguracji platformy sklepowej</strong>.</p>
                <p style="margin: 0 0 16px 0;">Następny krok to założenie konta w TakeDrop — platformie e-commerce, która będzie sercem Twojego sklepu.</p>
                <p style="margin: 0 0 24px 0; color: #888;">W panelu klienta znajdziesz nową zakładkę <strong style="color: #fff;">„Konto TakeDrop"</strong> z linkiem do rejestracji i instrukcjami.</p>
                <div style="text-align: center; padding: 16px 0;">
                  <a href="{{projectUrl}}" style="display: inline-block; background: #fff; color: #000; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">Przejdź do panelu</a>
                </div>
                <p style="margin: 24px 0 0 0; color: #888; font-size: 14px;">Jeśli masz pytania — pisz śmiało.</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 24px; text-align: center;">
              <div style="font-size: 12px; color: #555;">tomekniedzwiecki.pl</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- AUTOMATION FLOW: TakeDrop Activated
-- =============================================

-- Dodaj kolumnę category jeśli nie istnieje
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'automation_flows' AND column_name = 'category') THEN
        ALTER TABLE automation_flows ADD COLUMN category TEXT DEFAULT 'workflow';
    END IF;
END $$;

-- Aktualizuj constraint z nowym trigger_type
ALTER TABLE automation_flows DROP CONSTRAINT IF EXISTS automation_flows_trigger_type_check;
ALTER TABLE automation_flows ADD CONSTRAINT automation_flows_trigger_type_check
CHECK (trigger_type IN (
    'offer_created', 'offer_viewed', 'offer_expired',
    'payment_received', 'contract_signed',
    'workflow_created', 'stage_completed',
    'products_shared', 'report_published', 'branding_delivered', 'sales_page_shared',
    'takedrop_activated'
));

-- Usuń stary flow jeśli istnieje
DELETE FROM automation_flows WHERE trigger_type = 'takedrop_account_created';

-- Utwórz nowy flow
DO $$
DECLARE
  v_flow_id UUID;
BEGIN
  SELECT id INTO v_flow_id FROM automation_flows WHERE trigger_type = 'takedrop_activated' LIMIT 1;

  IF v_flow_id IS NULL THEN
    INSERT INTO automation_flows (name, description, trigger_type, trigger_filters, is_active)
    VALUES (
      'Etap 2 - TakeDrop aktywowany',
      'Wysyła email do klienta gdy admin aktywuje zakładkę TakeDrop',
      'takedrop_activated',
      '{}',
      true
    )
    RETURNING id INTO v_flow_id;

    INSERT INTO automation_steps (flow_id, step_type, step_order, config)
    VALUES (v_flow_id, 'action', 0, '{"action_type": "send_email", "email_type": "takedrop_activated"}');

    RAISE NOTICE 'Created automation flow: %', v_flow_id;
  ELSE
    RAISE NOTICE 'Flow already exists: %', v_flow_id;
  END IF;
END $$;
