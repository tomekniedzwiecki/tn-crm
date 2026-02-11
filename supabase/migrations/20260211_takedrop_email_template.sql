-- =============================================
-- EMAIL TEMPLATES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_type TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_templates' AND policyname = 'Admin full access email_templates') THEN
        CREATE POLICY "Admin full access email_templates" ON email_templates
            FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;

-- =============================================
-- EMAIL TEMPLATE: TakeDrop Activation (Stage 2 Start)
-- =============================================
-- Wysyłany gdy admin aktywuje zakładkę TakeDrop dla klienta

INSERT INTO email_templates (email_type, subject, body, variables, is_active)
VALUES (
  'takedrop_account_created',
  'Etap 2: Czas założyć konto w TakeDrop',
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

          <!-- Header -->
          <tr>
            <td style="padding-bottom: 32px;">
              <div style="font-size: 24px; font-weight: 600; color: #fff;">Przechodzimy do Etapu 2</div>
              <div style="font-size: 14px; color: #666; margin-top: 4px;">Konfiguracja platformy sklepowej</div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="background: #0a0a0a; border: 1px solid #222; border-radius: 12px; padding: 32px;">
              <div style="font-size: 15px; color: #e5e5e5; line-height: 1.6;">
                <p style="margin: 0 0 16px 0;">Cześć {{customer_name}},</p>

                <p style="margin: 0 0 16px 0;">Świetna wiadomość — zakończyliśmy pierwszy etap i teraz przechodzimy do <strong style="color: #fff;">Etapu 2: konfiguracji platformy sklepowej</strong>.</p>

                <p style="margin: 0 0 16px 0;">Następny krok to założenie konta w TakeDrop — platformie e-commerce, która będzie sercem Twojego sklepu.</p>

                <p style="margin: 0 0 24px 0; color: #888;">W panelu klienta znajdziesz nową zakładkę <strong style="color: #fff;">„Konto TakeDrop"</strong> z linkiem do rejestracji i instrukcjami.</p>

                <!-- CTA -->
                <div style="text-align: center; padding: 16px 0;">
                  <a href="{{project_url}}" style="display: inline-block; background: #fff; color: #000; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">Przejdź do panelu</a>
                </div>

                <p style="margin: 24px 0 0 0; color: #888; font-size: 14px;">Jeśli masz pytania — pisz śmiało.</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 24px; text-align: center;">
              <div style="font-size: 12px; color: #555;">
                tomekniedzwiecki.pl
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  '["customer_name", "project_url"]',
  true
)
ON CONFLICT (email_type) DO UPDATE SET
  subject = EXCLUDED.subject,
  body = EXCLUDED.body,
  variables = EXCLUDED.variables,
  is_active = EXCLUDED.is_active;

-- =============================================
-- AUTOMATION FLOW: TakeDrop Account Created
-- =============================================
-- Automatycznie wysyła email gdy admin włączy widoczność TakeDrop

-- Dodaj kolumnę category jeśli nie istnieje
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'automation_flows' AND column_name = 'category') THEN
        ALTER TABLE automation_flows ADD COLUMN category TEXT DEFAULT 'workflow';
    END IF;
END $$;

-- Dodaj takedrop_account_created do dozwolonych trigger_type
ALTER TABLE automation_flows DROP CONSTRAINT IF EXISTS automation_flows_trigger_type_check;
ALTER TABLE automation_flows ADD CONSTRAINT automation_flows_trigger_type_check
CHECK (trigger_type IN (
    'offer_created', 'offer_viewed', 'offer_expired',
    'payment_received', 'contract_signed',
    'workflow_created', 'stage_completed',
    'products_shared', 'report_published', 'branding_delivered', 'sales_page_shared',
    'takedrop_account_created'
));

DO $$
DECLARE
  v_flow_id UUID;
BEGIN
  -- Sprawdź czy flow już istnieje
  SELECT id INTO v_flow_id
  FROM automation_flows
  WHERE trigger_type = 'takedrop_account_created'
  LIMIT 1;

  -- Jeśli nie istnieje, utwórz nowy
  IF v_flow_id IS NULL THEN
    INSERT INTO automation_flows (
      name,
      description,
      trigger_type,
      trigger_filters,
      is_active
    ) VALUES (
      'Etap 2 - Powiadomienie o TakeDrop',
      'Wysyła email do klienta gdy admin aktywuje zakładkę TakeDrop',
      'takedrop_account_created',
      '{}',
      true
    )
    RETURNING id INTO v_flow_id;

    -- Dodaj krok: wyślij email
    INSERT INTO automation_steps (
      flow_id,
      step_type,
      step_order,
      config
    ) VALUES (
      v_flow_id,
      'action',
      0,
      '{"action_type": "send_email", "email_type": "takedrop_account_created"}'
    );

    RAISE NOTICE 'Created automation flow: %', v_flow_id;
  ELSE
    RAISE NOTICE 'Automation flow already exists: %', v_flow_id;
  END IF;
END $$;