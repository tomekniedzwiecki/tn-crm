-- =============================================
-- EMAIL TEMPLATE: Partner Access Granted (Client added partner)
-- =============================================
-- Wysylany do admina gdy klient potwierdzi dostep partnera

INSERT INTO settings (key, value) VALUES (
  'email_template_partner_access_granted_subject',
  '🔗 Klient udostępnił konto reklamowe - {{brandName}}'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO settings (key, value) VALUES (
  'email_template_partner_access_granted_body',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#000000;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:12px;border:1px solid #262626;"><tr><td style="padding:48px 40px 40px 40px;"><p style="margin:0 0 8px 0;color:#f43f5e;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Etap 4 - Konto reklamowe</p><h1 style="margin:0 0 24px 0;color:#ffffff;font-size:28px;font-weight:600;line-height:1.3;">Klient udostępnił konto reklamowe</h1><p style="margin:0 0 24px 0;color:#a3a3a3;font-size:15px;line-height:1.6;"><strong style="color:#ffffff;">{{clientName}}</strong> potwierdził, że dodał Cię jako partnera w Business Manager Meta.</p><p style="margin:0 0 32px 0;color:#a3a3a3;font-size:15px;line-height:1.6;">Sprawdź czy masz dostęp do konta reklamowego i zatwierdź zaproszenie.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td align="center"><a href="{{projectUrl}}" style="display:inline-block;background:linear-gradient(135deg,#f43f5e 0%,#e11d48 100%);color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:8px;font-size:14px;font-weight:600;text-align:center;">Otwórz projekt →</a></td></tr></table></td></tr><tr><td style="padding:20px 40px;border-top:1px solid #262626;text-align:center;"><a href="https://tomekniedzwiecki.pl" style="color:#525252;font-size:12px;text-decoration:none;">tomekniedzwiecki.pl</a></td></tr></table></td></tr></table></body></html>'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- AUTOMATION FLOW: Partner Access Granted
-- =============================================

DO $$
DECLARE
  v_flow_id UUID;
BEGIN
  SELECT id INTO v_flow_id FROM automation_flows WHERE trigger_type = 'partner_access_granted' LIMIT 1;

  IF v_flow_id IS NULL THEN
    INSERT INTO automation_flows (name, description, trigger_type, trigger_filters, is_active, category)
    VALUES (
      'Etap 4 - Klient dodał partnera',
      'Wysyla email do admina gdy klient potwierdzi dostep partnera',
      'partner_access_granted',
      '{}',
      true,
      'workflow'
    )
    RETURNING id INTO v_flow_id;

    INSERT INTO automation_steps (flow_id, step_type, step_order, config)
    VALUES (v_flow_id, 'action', 0, '{"action_type": "send_email", "email_type": "partner_access_granted", "to_admin": true}');

    RAISE NOTICE 'Created automation flow: %', v_flow_id;
  ELSE
    RAISE NOTICE 'Flow already exists: %', v_flow_id;
  END IF;
END $$;
