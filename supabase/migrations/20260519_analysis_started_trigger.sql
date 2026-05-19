-- =============================================
-- Trigger analysis_started — gdy admin oznaczy oba skrypty jako osadzone (GA + Hotjar)
-- klient dostaje email z instrukcja jak przeanalizowac sesje w Hotjar
-- =============================================

-- Kolumna chroni przed duplikacja maila (np. gdy admin odznacza/zaznacza ponownie)
ALTER TABLE workflow_optimization
  ADD COLUMN IF NOT EXISTS analysis_started_at TIMESTAMPTZ;

COMMENT ON COLUMN workflow_optimization.analysis_started_at IS 'Etap 5/Krok 5 — kiedy oba skrypty (GA+Hotjar) zostaly oznaczone jako osadzone i poszedl mail analysis_started do klienta';


-- Dodaj analysis_started do CHECK constraint
ALTER TABLE automation_flows DROP CONSTRAINT IF EXISTS automation_flows_trigger_type_check;
ALTER TABLE automation_flows ADD CONSTRAINT automation_flows_trigger_type_check CHECK (
  trigger_type = ANY (ARRAY[
    'lead_created'::text, 'lead_status_changed'::text,
    'offer_created'::text, 'offer_viewed'::text, 'offer_expired'::text, 'offer_reminder_halfway'::text,
    'payment_received'::text, 'contract_signed'::text, 'contract_sent'::text, 'invoice_sent'::text, 'proforma_generated'::text,
    'workflow_created'::text, 'stage_completed'::text,
    'products_shared'::text, 'report_published'::text, 'branding_delivered'::text, 'sales_page_shared'::text,
    'video_activated'::text, 'scenarios_shared'::text, 'video_recordings_complete'::text,
    'takedrop_activated'::text, 'landing_page_connected'::text, 'test_ready'::text,
    'ads_activated'::text, 'partner_step_completed'::text, 'ads_completed'::text, 'content_ready'::text, 'campaign_launched'::text,
    'optimization_started'::text, 'reviews_shared'::text, 'videos_shared'::text,
    'videos_reminder'::text, 'videos_skipped'::text,
    'tools_started'::text, 'tools_script_received'::text, 'tools_notes_received'::text, 'tools_completed'::text,
    'analysis_started'::text
  ])
);


-- Email template: analysis_started (klient dostaje gdy oba skrypty osadzone)
INSERT INTO settings (key, value) VALUES (
  'email_template_analysis_started_subject',
  'Hotjar zbiera już sesje — czas na analizę 📊'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO settings (key, value) VALUES (
  'email_template_analysis_started_body',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#000000;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:12px;border:1px solid #262626;"><tr><td style="padding:48px 40px 40px 40px;"><p style="margin:0 0 8px 0;color:#06b6d4;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">📊 Analiza sesji</p><h1 style="margin:0 0 20px 0;color:#ffffff;font-size:26px;font-weight:600;line-height:1.3;">Cześć {{clientName}}!</h1><p style="margin:0 0 16px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Skrypty <strong style="color:#fbbf24;">Google Analytics</strong> i <strong style="color:#fbbf24;">Hotjar</strong> zostały <strong style="color:#10b981;">osadzone w Twoim sklepie</strong>. Od teraz Hotjar nagrywa anonimowo każdą sesję odwiedzających.</p><p style="margin:0 0 16px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Za <strong style="color:#ffffff;">24-48 godzin</strong> będziesz miał pierwsze nagrania do obejrzenia. Twoje zadanie:</p><ol style="margin:0 0 24px 0;padding-left:20px;color:#a3a3a3;font-size:15px;line-height:1.85;"><li>Zaloguj się na <a href="https://insights.hotjar.com/" style="color:#fbbf24;text-decoration:none;">insights.hotjar.com</a></li><li>Wejdź w <strong style="color:#ffffff;">Recordings</strong> z lewego menu</li><li>Obejrzyj <strong style="color:#ffffff;">2-3 najnowsze nagrania</strong> (każde 2-5 min)</li><li>Wróć do panelu projektu i wpisz uwagi w zakładce <strong style="color:#fbbf24;">Narzędzia → Analiza sesji</strong></li></ol><p style="margin:0 0 12px 0;color:#a3a3a3;font-size:15px;line-height:1.65;"><strong style="color:#ffffff;">Na co zwracaj uwagę:</strong></p><ul style="margin:0 0 24px 0;padding-left:20px;color:#a3a3a3;font-size:14px;line-height:1.7;"><li>Gdzie klient zatrzymuje się najdłużej?</li><li>Gdzie scrolluje pod CTA bez kliknięcia?</li><li>Czy klika w coś co nie jest klikalne (rage-click)?</li><li>W którym momencie wychodzi ze strony?</li></ul><p style="margin:0 0 28px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Twoje uwagi pomogą mi zaproponować konkretne poprawki na landingu, które realnie podniosą konwersję.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;"><tr><td align="center"><a href="{{projectUrl}}" style="display:inline-block;background:linear-gradient(135deg,#06b6d4 0%,#0891b2 100%);color:#ffffff;text-decoration:none;padding:15px 32px;border-radius:8px;font-size:14px;font-weight:700;text-align:center;">Otwórz panel uwag →</a></td></tr></table></td></tr><tr><td style="padding:18px 40px;border-top:1px solid #262626;text-align:center;"><a href="https://tomekniedzwiecki.pl" style="color:#525252;font-size:12px;text-decoration:none;">tomekniedzwiecki.pl</a></td></tr></table></td></tr></table></body></html>'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;


-- Automation flow
DO $$
DECLARE
  v_flow_id UUID;
BEGIN
  SELECT id INTO v_flow_id FROM automation_flows WHERE trigger_type = 'analysis_started' LIMIT 1;
  IF v_flow_id IS NULL THEN
    INSERT INTO automation_flows (name, description, trigger_type, trigger_filters, is_active)
    VALUES ('Etap 5/Krok 5 — Analiza sesji aktywowana', 'Email do klienta gdy admin oznaczy oba skrypty (GA + Hotjar) jako osadzone — instrukcja jak przeanalizowac sesje w Hotjar', 'analysis_started', '{}', true)
    RETURNING id INTO v_flow_id;
    INSERT INTO automation_steps (flow_id, step_type, step_order, config)
    VALUES (v_flow_id, 'action', 0, '{"action_type": "send_email", "email_type": "analysis_started"}');
  END IF;
END $$;
