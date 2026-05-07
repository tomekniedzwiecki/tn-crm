-- =============================================
-- EMAIL TEMPLATES: Etap 5 share emails
-- reviews_shared (Krok 2) + videos_shared (Krok 3)
-- =============================================

-- Najpierw rozszerz constraint trigger_type o 2 nowe wartosci
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
    'optimization_started'::text, 'reviews_shared'::text, 'videos_shared'::text
  ])
);


-- ─── REVIEWS_SHARED ─────────────────────────────
INSERT INTO settings (key, value) VALUES (
  'email_template_reviews_shared_subject',
  'Opinie klientów są już widoczne w Twoim sklepie ⭐'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO settings (key, value) VALUES (
  'email_template_reviews_shared_body',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#000000;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:12px;border:1px solid #262626;"><tr><td style="padding:48px 40px 40px 40px;"><p style="margin:0 0 8px 0;color:#fbbf24;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">⭐ Opinie gotowe</p><h1 style="margin:0 0 20px 0;color:#ffffff;font-size:26px;font-weight:600;line-height:1.3;">Cześć {{clientName}}!</h1><p style="margin:0 0 16px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Dodaliśmy opinie klientów do Twojego sklepu — teraz widzą je wszyscy odwiedzający stronę.</p><p style="margin:0 0 28px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Opinie ze zdjęciami są jednym z najsilniejszych elementów konwersji — Twoi nowi klienci od razu zobaczą, że produkt sprawdza się w prawdziwych domach.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;"><tr><td align="center"><a href="{{salesPageUrl}}" style="display:inline-block;background:linear-gradient(135deg,#fbbf24 0%,#f59e0b 100%);color:#000000;text-decoration:none;padding:15px 32px;border-radius:8px;font-size:14px;font-weight:700;text-align:center;">Zobacz opinie na stronie →</a></td></tr></table><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><a href="{{projectUrl}}" style="display:inline-block;color:#a3a3a3;text-decoration:none;padding:10px 20px;font-size:13px;">Otwórz panel projektu</a></td></tr></table></td></tr><tr><td style="padding:18px 40px;border-top:1px solid #262626;text-align:center;"><a href="https://tomekniedzwiecki.pl" style="color:#525252;font-size:12px;text-decoration:none;">tomekniedzwiecki.pl</a></td></tr></table></td></tr></table></body></html>'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ─── VIDEOS_SHARED ──────────────────────────────
INSERT INTO settings (key, value) VALUES (
  'email_template_videos_shared_subject',
  'Twoje Reels są już na sklepie 🎬'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO settings (key, value) VALUES (
  'email_template_videos_shared_body',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#000000;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:12px;border:1px solid #262626;"><tr><td style="padding:48px 40px 40px 40px;"><p style="margin:0 0 8px 0;color:#f43f5e;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">🎬 Reels gotowe</p><h1 style="margin:0 0 20px 0;color:#ffffff;font-size:26px;font-weight:600;line-height:1.3;">Cześć {{clientName}}!</h1><p style="margin:0 0 16px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Twoje nagrania video są już osadzone na stronie sprzedażowej w stylu Instagram Reels — kółka z ekranem na rogu, sekcja z phone-mockupem i pełnoekranowy odtwarzacz.</p><p style="margin:0 0 28px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Video uruchamia się automatycznie gdy klient dotrze do tej sekcji — to daje natychmiastowy social proof i znacząco zwiększa konwersję.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;"><tr><td align="center"><a href="{{salesPageUrl}}" style="display:inline-block;background:linear-gradient(135deg,#f43f5e 0%,#e11d48 100%);color:#ffffff;text-decoration:none;padding:15px 32px;border-radius:8px;font-size:14px;font-weight:700;text-align:center;">Zobacz Reels na stronie →</a></td></tr></table><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><a href="{{projectUrl}}" style="display:inline-block;color:#a3a3a3;text-decoration:none;padding:10px 20px;font-size:13px;">Otwórz panel projektu</a></td></tr></table></td></tr><tr><td style="padding:18px 40px;border-top:1px solid #262626;text-align:center;"><a href="https://tomekniedzwiecki.pl" style="color:#525252;font-size:12px;text-decoration:none;">tomekniedzwiecki.pl</a></td></tr></table></td></tr></table></body></html>'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ─── AUTOMATION FLOWS ──────────────────────────
DO $$
DECLARE
  v_flow_id UUID;
BEGIN
  -- reviews_shared flow
  SELECT id INTO v_flow_id FROM automation_flows WHERE trigger_type = 'reviews_shared' LIMIT 1;
  IF v_flow_id IS NULL THEN
    INSERT INTO automation_flows (name, description, trigger_type, trigger_filters, is_active)
    VALUES ('Etap 5/Krok 2 — Opinie dodane do sklepu', 'Email do klienta gdy admin oznaczy ze opinie sa juz widoczne w sklepie', 'reviews_shared', '{}', true)
    RETURNING id INTO v_flow_id;
    INSERT INTO automation_steps (flow_id, step_type, step_order, config)
    VALUES (v_flow_id, 'action', 0, '{"action_type": "send_email", "email_type": "reviews_shared"}');
  END IF;

  -- videos_shared flow
  SELECT id INTO v_flow_id FROM automation_flows WHERE trigger_type = 'videos_shared' LIMIT 1;
  IF v_flow_id IS NULL THEN
    INSERT INTO automation_flows (name, description, trigger_type, trigger_filters, is_active)
    VALUES ('Etap 5/Krok 3 — Reels udostepnione', 'Email do klienta gdy admin oznaczy sekcje Reels jako gotowa na landingu', 'videos_shared', '{}', true)
    RETURNING id INTO v_flow_id;
    INSERT INTO automation_steps (flow_id, step_type, step_order, config)
    VALUES (v_flow_id, 'action', 0, '{"action_type": "send_email", "email_type": "videos_shared"}');
  END IF;
END $$;
