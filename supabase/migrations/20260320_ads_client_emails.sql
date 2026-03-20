-- =============================================
-- EMAIL TEMPLATES: Etap 4 - Reklamy (Client emails)
-- =============================================

-- 1. ads_activated - gdy Etap 4 się odblokuje (po test_accepted)
INSERT INTO settings (key, value) VALUES (
  'email_template_ads_activated_subject',
  'Czas na reklamy! Dodaj mnie jako partnera w Meta'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO settings (key, value) VALUES (
  'email_template_ads_activated_body',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#000000;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:12px;border:1px solid #262626;"><tr><td style="padding:48px 40px 40px 40px;"><p style="margin:0 0 8px 0;color:#f43f5e;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Etap 4 - Reklamy</p><h1 style="margin:0 0 24px 0;color:#ffffff;font-size:28px;font-weight:600;line-height:1.3;">{{clientName}}, czas uruchomić reklamy!</h1><p style="margin:0 0 24px 0;color:#a3a3a3;font-size:15px;line-height:1.6;">Twój sklep jest gotowy. Teraz potrzebuję dostępu do Twojego konta reklamowego Meta, żeby uruchomić kampanie.</p><p style="margin:0 0 32px 0;color:#a3a3a3;font-size:15px;line-height:1.6;">W panelu klienta znajdziesz zakładkę <strong style="color:#ffffff;">„Konto reklamowe"</strong> z instrukcją krok po kroku jak dodać mnie jako partnera w Business Manager.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td align="center"><a href="{{projectUrl}}" style="display:inline-block;background:linear-gradient(135deg,#f43f5e 0%,#e11d48 100%);color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:8px;font-size:14px;font-weight:600;text-align:center;">Przejdź do panelu →</a></td></tr></table><p style="margin:0;color:#737373;font-size:13px;line-height:1.5;">Po dodaniu mnie jako partnera, poinformuję Cię o kolejnym kroku.</p></td></tr><tr><td style="padding:20px 40px;border-top:1px solid #262626;text-align:center;"><a href="https://tomekniedzwiecki.pl" style="color:#525252;font-size:12px;text-decoration:none;">tomekniedzwiecki.pl</a></td></tr></table></td></tr></table></body></html>'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. partner_step_completed - po potwierdzeniu partnera (instrukcje dla Budżet)
INSERT INTO settings (key, value) VALUES (
  'email_template_partner_step_completed_subject',
  'Świetnie! Teraz doładuj konto reklamowe'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO settings (key, value) VALUES (
  'email_template_partner_step_completed_body',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#000000;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:12px;border:1px solid #262626;"><tr><td style="padding:48px 40px 40px 40px;"><p style="margin:0 0 8px 0;color:#10b981;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Krok 1 ukończony</p><h1 style="margin:0 0 24px 0;color:#ffffff;font-size:28px;font-weight:600;line-height:1.3;">Mam dostęp do konta reklamowego!</h1><p style="margin:0 0 24px 0;color:#a3a3a3;font-size:15px;line-height:1.6;">Dzięki {{clientName}}! Zatwierdziłem zaproszenie i mam już dostęp do Twojego konta reklamowego.</p><p style="margin:0 0 32px 0;color:#a3a3a3;font-size:15px;line-height:1.6;">Teraz ostatni krok - doładuj konto reklamowe kwotą <strong style="color:#10b981;">minimum 1000 zł</strong>. To budżet na pierwsze kampanie testowe.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td align="center"><a href="{{projectUrl}}" style="display:inline-block;background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:8px;font-size:14px;font-weight:600;text-align:center;">Przejdź do instrukcji →</a></td></tr></table><p style="margin:0;color:#737373;font-size:13px;line-height:1.5;">Po doładowaniu konta uruchomię pierwszą kampanię.</p></td></tr><tr><td style="padding:20px 40px;border-top:1px solid #262626;text-align:center;"><a href="https://tomekniedzwiecki.pl" style="color:#525252;font-size:12px;text-decoration:none;">tomekniedzwiecki.pl</a></td></tr></table></td></tr></table></body></html>'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 3. ads_completed - po doładowaniu budżetu (finał)
INSERT INTO settings (key, value) VALUES (
  'email_template_ads_completed_subject',
  'Wszystko gotowe! Uruchamiam reklamy'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO settings (key, value) VALUES (
  'email_template_ads_completed_body',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#000000;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:12px;border:1px solid #262626;"><tr><td style="padding:48px 40px 40px 40px;"><p style="margin:0 0 8px 0;color:#8b5cf6;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Etap 4 ukończony</p><h1 style="margin:0 0 24px 0;color:#ffffff;font-size:28px;font-weight:600;line-height:1.3;">Uruchamiam Twoje reklamy!</h1><p style="margin:0 0 24px 0;color:#a3a3a3;font-size:15px;line-height:1.6;">Gratulacje {{clientName}}! Wszystkie kroki zostały ukończone.</p><p style="margin:0 0 32px 0;color:#a3a3a3;font-size:15px;line-height:1.6;">Mam dostęp do konta reklamowego i budżet jest doładowany. Teraz przygotowuję pierwszą kampanię testową. Dam Ci znać gdy będzie aktywna!</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td align="center"><a href="{{projectUrl}}" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6 0%,#7c3aed 100%);color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:8px;font-size:14px;font-weight:600;text-align:center;">Zobacz status projektu →</a></td></tr></table><p style="margin:0;color:#737373;font-size:13px;line-height:1.5;">Dziękuję za zaufanie i współpracę!</p></td></tr><tr><td style="padding:20px 40px;border-top:1px solid #262626;text-align:center;"><a href="https://tomekniedzwiecki.pl" style="color:#525252;font-size:12px;text-decoration:none;">tomekniedzwiecki.pl</a></td></tr></table></td></tr></table></body></html>'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- UPDATE CONSTRAINT with new trigger types
-- =============================================
ALTER TABLE automation_flows DROP CONSTRAINT IF EXISTS automation_flows_trigger_type_check;
ALTER TABLE automation_flows ADD CONSTRAINT automation_flows_trigger_type_check
CHECK (trigger_type IN (
    'lead_created',
    'offer_created', 'offer_viewed', 'offer_expired', 'offer_reminder_halfway',
    'payment_received', 'contract_signed', 'invoice_sent', 'proforma_generated',
    'workflow_created', 'stage_completed',
    'products_shared', 'report_published', 'branding_delivered', 'sales_page_shared',
    'video_activated',
    'takedrop_activated', 'landing_page_connected', 'test_ready',
    'partner_access_granted', 'budget_funded',
    'ads_activated', 'partner_step_completed', 'ads_completed'
));

-- =============================================
-- AUTOMATION FLOWS
-- =============================================

-- Flow 1: ads_activated
DO $$
DECLARE
  v_flow_id UUID;
BEGIN
  SELECT id INTO v_flow_id FROM automation_flows WHERE trigger_type = 'ads_activated' LIMIT 1;

  IF v_flow_id IS NULL THEN
    INSERT INTO automation_flows (name, description, trigger_type, trigger_filters, is_active, category)
    VALUES (
      'Etap 4 - Reklamy aktywowane',
      'Wysyla email do klienta gdy Etap 4 sie odblokuje',
      'ads_activated',
      '{}',
      true,
      'workflow'
    )
    RETURNING id INTO v_flow_id;

    INSERT INTO automation_steps (flow_id, step_type, step_order, config)
    VALUES (v_flow_id, 'action', 0, '{"action_type": "send_email", "email_type": "ads_activated"}');

    RAISE NOTICE 'Created automation flow: ads_activated %', v_flow_id;
  END IF;
END $$;

-- Flow 2: partner_step_completed (to client after partner confirmed)
DO $$
DECLARE
  v_flow_id UUID;
BEGIN
  SELECT id INTO v_flow_id FROM automation_flows WHERE trigger_type = 'partner_step_completed' LIMIT 1;

  IF v_flow_id IS NULL THEN
    INSERT INTO automation_flows (name, description, trigger_type, trigger_filters, is_active, category)
    VALUES (
      'Etap 4 - Partner potwierdzony',
      'Wysyla email do klienta po potwierdzeniu partnera',
      'partner_step_completed',
      '{}',
      true,
      'workflow'
    )
    RETURNING id INTO v_flow_id;

    INSERT INTO automation_steps (flow_id, step_type, step_order, config)
    VALUES (v_flow_id, 'action', 0, '{"action_type": "send_email", "email_type": "partner_step_completed"}');

    RAISE NOTICE 'Created automation flow: partner_step_completed %', v_flow_id;
  END IF;
END $$;

-- Flow 3: ads_completed (to client after budget funded)
DO $$
DECLARE
  v_flow_id UUID;
BEGIN
  SELECT id INTO v_flow_id FROM automation_flows WHERE trigger_type = 'ads_completed' LIMIT 1;

  IF v_flow_id IS NULL THEN
    INSERT INTO automation_flows (name, description, trigger_type, trigger_filters, is_active, category)
    VALUES (
      'Etap 4 - Reklamy ukonczone',
      'Wysyla email do klienta po doladowaniu budzetu',
      'ads_completed',
      '{}',
      true,
      'workflow'
    )
    RETURNING id INTO v_flow_id;

    INSERT INTO automation_steps (flow_id, step_type, step_order, config)
    VALUES (v_flow_id, 'action', 0, '{"action_type": "send_email", "email_type": "ads_completed"}');

    RAISE NOTICE 'Created automation flow: ads_completed %', v_flow_id;
  END IF;
END $$;
