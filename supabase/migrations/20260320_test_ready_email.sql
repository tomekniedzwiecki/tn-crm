-- =============================================
-- EMAIL TEMPLATE: Test Ready (Shop ready for client review)
-- =============================================
-- Wysylany gdy admin oznacza sklep jako gotowy do testow

INSERT INTO settings (key, value) VALUES (
  'email_template_test_ready_subject',
  'Twój sklep jest gotowy do testów'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO settings (key, value) VALUES (
  'email_template_test_ready_body',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#000000;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:12px;border:1px solid #262626;"><tr><td style="padding:48px 40px 40px 40px;"><p style="margin:0 0 8px 0;color:#06b6d4;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Ostatni krok przed startem</p><h1 style="margin:0 0 24px 0;color:#ffffff;font-size:28px;font-weight:600;line-height:1.3;">{{clientName}}, Twój sklep czeka na akceptację</h1><p style="margin:0 0 24px 0;color:#a3a3a3;font-size:15px;line-height:1.6;">Wszystkie elementy są już na miejscu — strona, produkty, bramka płatności. Teraz Twoja kolej: przejrzyj sklep i sprawdź, czy wszystko wygląda tak, jak sobie wyobrażałeś.</p><p style="margin:0 0 24px 0;color:#a3a3a3;font-size:15px;line-height:1.6;">W panelu znajdziesz też <strong style="color:#ffffff;">krótkie nagranie głosowe</strong> ode mnie z instrukcją, na co zwrócić uwagę.</p><p style="margin:0 0 32px 0;color:#a3a3a3;font-size:15px;line-height:1.6;">Masz dwie opcje:<br><strong style="color:#ffffff;">1.</strong> Zgłoś uwagi mailem — jeśli coś wymaga poprawy<br><strong style="color:#ffffff;">2.</strong> Zaakceptuj i przejdź dalej — jeśli wszystko jest OK</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td align="center"><a href="{{projectUrl}}" style="display:inline-block;background:linear-gradient(135deg,#06b6d4 0%,#0891b2 100%);color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:8px;font-size:14px;font-weight:600;text-align:center;">Sprawdź swój sklep →</a></td></tr></table><p style="margin:0;color:#737373;font-size:13px;line-height:1.5;">Po Twojej akceptacji przejdziemy do uruchomienia sklepu.</p></td></tr><tr><td style="padding:20px 40px;border-top:1px solid #262626;text-align:center;"><a href="https://tomekniedzwiecki.pl" style="color:#525252;font-size:12px;text-decoration:none;">tomekniedzwiecki.pl</a></td></tr></table></td></tr></table></body></html>'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- AUTOMATION FLOW: Test Ready
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
    'test_ready'
));

-- Utworz flow
DO $$
DECLARE
  v_flow_id UUID;
BEGIN
  SELECT id INTO v_flow_id FROM automation_flows WHERE trigger_type = 'test_ready' LIMIT 1;

  IF v_flow_id IS NULL THEN
    INSERT INTO automation_flows (name, description, trigger_type, trigger_filters, is_active, category)
    VALUES (
      'Etap 3 - Test sklepu gotowy',
      'Wysyla email do klienta gdy sklep jest gotowy do testow',
      'test_ready',
      '{}',
      true,
      'workflow'
    )
    RETURNING id INTO v_flow_id;

    INSERT INTO automation_steps (flow_id, step_type, step_order, config)
    VALUES (v_flow_id, 'action', 0, '{"action_type": "send_email", "email_type": "test_ready"}');

    RAISE NOTICE 'Created automation flow: %', v_flow_id;
  ELSE
    RAISE NOTICE 'Flow already exists: %', v_flow_id;
  END IF;
END $$;
