-- =============================================
-- BRAKUJĄCE SZABLONY EMAILI DLA WORKFLOW
-- =============================================

-- =============================================
-- 1. PRODUCTS SHARED (Etap 1)
-- =============================================
INSERT INTO settings (key, value) VALUES (
  'email_template_products_shared_subject',
  'Katalog produktów jest gotowy do wyboru'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO settings (key, value) VALUES (
  'email_template_products_shared_body',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#000000;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:12px;border:1px solid #262626;"><tr><td style="padding:48px 40px 40px 40px;"><p style="margin:0 0 8px 0;color:#f59e0b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Produkty</p><h1 style="margin:0 0 24px 0;color:#ffffff;font-size:28px;font-weight:600;line-height:1.3;">Cześć {{clientName}}!</h1><p style="margin:0 0 20px 0;color:#a3a3a3;font-size:15px;line-height:1.6;">Przygotowałem dla Ciebie katalog produktów do wyboru. Wybierz ten, dla którego zbuduję Twoją markę.</p><p style="margin:0 0 32px 0;color:#a3a3a3;font-size:15px;line-height:1.6;">Znajdziesz je w zakładce <strong style="color:#fff;">Produkty</strong> w panelu klienta.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td align="center"><a href="{{projectUrl}}#produkty" style="display:inline-block;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);color:#000000;text-decoration:none;padding:16px 32px;border-radius:8px;font-size:14px;font-weight:600;text-align:center;">Zobacz produkty →</a></td></tr></table></td></tr><tr><td style="padding:20px 40px;border-top:1px solid #262626;text-align:center;"><a href="https://tomekniedzwiecki.pl" style="color:#525252;font-size:12px;text-decoration:none;">tomekniedzwiecki.pl</a></td></tr></table></td></tr></table></body></html>'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- 2. BRANDING DELIVERED (Etap 1)
-- =============================================
INSERT INTO settings (key, value) VALUES (
  'email_template_branding_delivered_subject',
  'Branding Twojej marki jest gotowy!'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO settings (key, value) VALUES (
  'email_template_branding_delivered_body',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#000000;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:12px;border:1px solid #262626;"><tr><td style="padding:48px 40px 40px 40px;"><p style="margin:0 0 8px 0;color:#8b5cf6;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Branding</p><h1 style="margin:0 0 24px 0;color:#ffffff;font-size:28px;font-weight:600;line-height:1.3;">Cześć {{clientName}}!</h1><p style="margin:0 0 20px 0;color:#a3a3a3;font-size:15px;line-height:1.6;">Mam świetne wieści - branding Twojej marki jest gotowy!</p><p style="margin:0 0 20px 0;color:#a3a3a3;font-size:15px;line-height:1.6;">W panelu klienta znajdziesz logo, kolory i wszystkie materiały graficzne. Możesz je pobrać i używać w swoich materiałach marketingowych.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td align="center"><a href="{{projectUrl}}#branding" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6 0%,#7c3aed 100%);color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:8px;font-size:14px;font-weight:600;text-align:center;">Zobacz branding →</a></td></tr></table></td></tr><tr><td style="padding:20px 40px;border-top:1px solid #262626;text-align:center;"><a href="https://tomekniedzwiecki.pl" style="color:#525252;font-size:12px;text-decoration:none;">tomekniedzwiecki.pl</a></td></tr></table></td></tr></table></body></html>'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- 3. SALES PAGE SHARED (Etap 1)
-- =============================================
INSERT INTO settings (key, value) VALUES (
  'email_template_sales_page_shared_subject',
  'Twoja strona sprzedażowa jest gotowa!'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO settings (key, value) VALUES (
  'email_template_sales_page_shared_body',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#000000;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:12px;border:1px solid #262626;"><tr><td style="padding:48px 40px 40px 40px;"><p style="margin:0 0 8px 0;color:#10b981;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Strona sprzedażowa</p><h1 style="margin:0 0 24px 0;color:#ffffff;font-size:28px;font-weight:600;line-height:1.3;">Cześć {{clientName}}!</h1><p style="margin:0 0 20px 0;color:#a3a3a3;font-size:15px;line-height:1.6;">Twoja strona sprzedażowa jest gotowa i czeka na Ciebie!</p><p style="margin:0 0 20px 0;color:#a3a3a3;font-size:15px;line-height:1.6;">Znajdziesz ją w zakładce <strong style="color:#fff;">Strona</strong> w panelu klienta. Możesz ją podejrzeć i skopiować link do udostępniania.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td align="center"><a href="{{projectUrl}}#strona" style="display:inline-block;background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:8px;font-size:14px;font-weight:600;text-align:center;">Zobacz stronę →</a></td></tr></table></td></tr><tr><td style="padding:20px 40px;border-top:1px solid #262626;text-align:center;"><a href="https://tomekniedzwiecki.pl" style="color:#525252;font-size:12px;text-decoration:none;">tomekniedzwiecki.pl</a></td></tr></table></td></tr></table></body></html>'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- 4. REPORT PUBLISHED (Etap 1/2)
-- =============================================
INSERT INTO settings (key, value) VALUES (
  'email_template_report_published_subject',
  'Nowy raport jest gotowy!'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO settings (key, value) VALUES (
  'email_template_report_published_body',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#000000;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:12px;border:1px solid #262626;"><tr><td style="padding:48px 40px 40px 40px;"><p style="margin:0 0 8px 0;color:#3b82f6;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Raport</p><h1 style="margin:0 0 24px 0;color:#ffffff;font-size:28px;font-weight:600;line-height:1.3;">Cześć {{clientName}}!</h1><p style="margin:0 0 20px 0;color:#a3a3a3;font-size:15px;line-height:1.6;">Przygotowałem dla Ciebie nowy raport: <strong style="color:#fff;">{{reportTitle}}</strong></p><p style="margin:0 0 32px 0;color:#a3a3a3;font-size:15px;line-height:1.6;">Znajdziesz go w zakładce <strong style="color:#fff;">Raporty</strong> w panelu klienta.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td align="center"><a href="{{projectUrl}}#raporty" style="display:inline-block;background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%);color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:8px;font-size:14px;font-weight:600;text-align:center;">Zobacz raport →</a></td></tr></table></td></tr><tr><td style="padding:20px 40px;border-top:1px solid #262626;text-align:center;"><a href="https://tomekniedzwiecki.pl" style="color:#525252;font-size:12px;text-decoration:none;">tomekniedzwiecki.pl</a></td></tr></table></td></tr></table></body></html>'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- AUTOMATYZACJE DLA NOWYCH SZABLONÓW
-- =============================================

-- Products Shared Automation
DO $$
DECLARE
  v_flow_id UUID;
BEGIN
  SELECT id INTO v_flow_id FROM automation_flows WHERE trigger_type = 'products_shared' LIMIT 1;

  IF v_flow_id IS NULL THEN
    INSERT INTO automation_flows (name, description, trigger_type, trigger_filters, is_active, category)
    VALUES (
      'Produkty udostępnione',
      'Wysyła email do klienta gdy admin udostępni katalog produktów',
      'products_shared',
      '{}',
      true,
      'workflow'
    )
    RETURNING id INTO v_flow_id;

    INSERT INTO automation_steps (flow_id, step_type, step_order, config)
    VALUES (v_flow_id, 'action', 0, '{"action_type": "send_email", "email_type": "products_shared"}');
  END IF;
END $$;

-- Branding Delivered Automation
DO $$
DECLARE
  v_flow_id UUID;
BEGIN
  SELECT id INTO v_flow_id FROM automation_flows WHERE trigger_type = 'branding_delivered' LIMIT 1;

  IF v_flow_id IS NULL THEN
    INSERT INTO automation_flows (name, description, trigger_type, trigger_filters, is_active, category)
    VALUES (
      'Branding dostarczony',
      'Wysyła email do klienta gdy admin udostępni branding',
      'branding_delivered',
      '{}',
      true,
      'workflow'
    )
    RETURNING id INTO v_flow_id;

    INSERT INTO automation_steps (flow_id, step_type, step_order, config)
    VALUES (v_flow_id, 'action', 0, '{"action_type": "send_email", "email_type": "branding_delivered"}');
  END IF;
END $$;

-- Sales Page Shared Automation
DO $$
DECLARE
  v_flow_id UUID;
BEGIN
  SELECT id INTO v_flow_id FROM automation_flows WHERE trigger_type = 'sales_page_shared' LIMIT 1;

  IF v_flow_id IS NULL THEN
    INSERT INTO automation_flows (name, description, trigger_type, trigger_filters, is_active, category)
    VALUES (
      'Strona sprzedażowa gotowa',
      'Wysyła email do klienta gdy admin udostępni stronę sprzedażową',
      'sales_page_shared',
      '{}',
      true,
      'workflow'
    )
    RETURNING id INTO v_flow_id;

    INSERT INTO automation_steps (flow_id, step_type, step_order, config)
    VALUES (v_flow_id, 'action', 0, '{"action_type": "send_email", "email_type": "sales_page_shared"}');
  END IF;
END $$;

-- Report Published Automation
DO $$
DECLARE
  v_flow_id UUID;
BEGIN
  SELECT id INTO v_flow_id FROM automation_flows WHERE trigger_type = 'report_published' LIMIT 1;

  IF v_flow_id IS NULL THEN
    INSERT INTO automation_flows (name, description, trigger_type, trigger_filters, is_active, category)
    VALUES (
      'Raport opublikowany',
      'Wysyła email do klienta gdy admin opublikuje nowy raport',
      'report_published',
      '{}',
      true,
      'workflow'
    )
    RETURNING id INTO v_flow_id;

    INSERT INTO automation_steps (flow_id, step_type, step_order, config)
    VALUES (v_flow_id, 'action', 0, '{"action_type": "send_email", "email_type": "report_published"}');
  END IF;
END $$;
