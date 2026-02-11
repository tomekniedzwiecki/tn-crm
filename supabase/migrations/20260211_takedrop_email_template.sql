-- =============================================
-- EMAIL TEMPLATE: TakeDrop Activated (Stage 2 Start)
-- =============================================
-- Wysyłany gdy admin aktywuje zakładkę TakeDrop dla klienta
-- Format: settings table (email_template_[type]_subject/body)

INSERT INTO settings (key, value) VALUES (
  'email_template_takedrop_activated_subject',
  'Załóż konto na platformie sklepowej'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO settings (key, value) VALUES (
  'email_template_takedrop_activated_body',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#000000;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:12px;border:1px solid #262626;"><tr><td style="padding:48px 40px 40px 40px;"><p style="margin:0 0 8px 0;color:#0ea5e9;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Platforma sklepowa</p><h1 style="margin:0 0 24px 0;color:#ffffff;font-size:28px;font-weight:600;line-height:1.3;">{{clientName}}, czas założyć konto w TakeDrop</h1><p style="margin:0 0 32px 0;color:#a3a3a3;font-size:15px;line-height:1.6;">TakeDrop to platforma e-commerce, która będzie sercem Twojego sklepu. W panelu klienta znajdziesz zakładkę „Konto TakeDrop" z linkiem do rejestracji i instrukcjami.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td align="center"><a href="{{projectUrl}}" style="display:inline-block;background:linear-gradient(135deg,#0ea5e9 0%,#0284c7 100%);color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:8px;font-size:14px;font-weight:600;text-align:center;">Przejdź do panelu →</a></td></tr></table><p style="margin:0;color:#737373;font-size:13px;line-height:1.5;">Po założeniu konta poinformuję Cię o kolejnych krokach.</p></td></tr><tr><td style="padding:20px 40px;border-top:1px solid #262626;text-align:center;"><a href="https://tomekniedzwiecki.pl" style="color:#525252;font-size:12px;text-decoration:none;">tomekniedzwiecki.pl</a></td></tr></table></td></tr></table></body></html>'
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
      'Etap 2 - Aktywuj TakeDrop',
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
