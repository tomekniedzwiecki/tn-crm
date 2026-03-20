-- =============================================
-- EMAIL TEMPLATE: Budget Funded (Client funded ad account)
-- =============================================
-- Wysylany do admina gdy klient potwierdzi doladowanie konta

INSERT INTO settings (key, value) VALUES (
  'email_template_budget_funded_subject',
  '💰 Klient doładował konto reklamowe - {{brandName}}'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO settings (key, value) VALUES (
  'email_template_budget_funded_body',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#000000;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:12px;border:1px solid #262626;"><tr><td style="padding:48px 40px 40px 40px;"><p style="margin:0 0 8px 0;color:#10b981;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Etap 4 - Budżet</p><h1 style="margin:0 0 24px 0;color:#ffffff;font-size:28px;font-weight:600;line-height:1.3;">Klient doładował konto reklamowe</h1><p style="margin:0 0 24px 0;color:#a3a3a3;font-size:15px;line-height:1.6;"><strong style="color:#ffffff;">{{clientName}}</strong> potwierdził doładowanie konta reklamowego kwotą <strong style="color:#10b981;">1000 zł</strong>.</p><p style="margin:0 0 32px 0;color:#a3a3a3;font-size:15px;line-height:1.6;">Sprawdź czy środki są na koncie i przygotuj pierwszą kampanię.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td align="center"><a href="{{projectUrl}}" style="display:inline-block;background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:8px;font-size:14px;font-weight:600;text-align:center;">Otwórz projekt →</a></td></tr></table></td></tr><tr><td style="padding:20px 40px;border-top:1px solid #262626;text-align:center;"><a href="https://tomekniedzwiecki.pl" style="color:#525252;font-size:12px;text-decoration:none;">tomekniedzwiecki.pl</a></td></tr></table></td></tr></table></body></html>'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- AUTOMATION FLOW: Budget Funded
-- =============================================

-- Aktualizuj constraint z nowym trigger_type
ALTER TABLE automation_flows DROP CONSTRAINT IF EXISTS automation_flows_trigger_type_check;
ALTER TABLE automation_flows ADD CONSTRAINT automation_flows_trigger_type_check
CHECK (trigger_type IN (
    'lead_created',
    'offer_created', 'offer_viewed', 'offer_expired',
    'payment_received', 'contract_signed', 'invoice_sent', 'proforma_generated',
    'workflow_created', 'stage_completed',
    'products_shared', 'report_published', 'branding_delivered', 'sales_page_shared',
    'video_activated',
    'takedrop_activated', 'landing_page_connected',
    'test_ready',
    'partner_access_granted', 'budget_funded'
));

-- Utworz flow dla budget_funded
DO $$
DECLARE
  v_flow_id UUID;
BEGIN
  SELECT id INTO v_flow_id FROM automation_flows WHERE trigger_type = 'budget_funded' LIMIT 1;

  IF v_flow_id IS NULL THEN
    INSERT INTO automation_flows (name, description, trigger_type, trigger_filters, is_active, category)
    VALUES (
      'Etap 4 - Budżet doładowany',
      'Wysyla email do admina gdy klient potwierdzi doladowanie konta',
      'budget_funded',
      '{}',
      true,
      'workflow'
    )
    RETURNING id INTO v_flow_id;

    INSERT INTO automation_steps (flow_id, step_type, step_order, config)
    VALUES (v_flow_id, 'action', 0, '{"action_type": "send_email", "email_type": "budget_funded", "to_admin": true}');

    RAISE NOTICE 'Created automation flow: %', v_flow_id;
  ELSE
    RAISE NOTICE 'Flow already exists: %', v_flow_id;
  END IF;
END $$;
