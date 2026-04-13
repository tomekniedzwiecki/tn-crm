-- Historia raportów reklamowych
-- Każdy raport jest osobnym rekordem, nie nadpisujemy poprzednich

CREATE TABLE IF NOT EXISTS workflow_ad_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,

    -- Dane raportu
    report_data JSONB NOT NULL,
    period_from DATE NOT NULL,
    period_to DATE NOT NULL,

    -- Metryki główne (dla szybkiego dostępu bez parsowania JSONB)
    spend DECIMAL(12,2) DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0,
    roas DECIMAL(6,2) DEFAULT 0,
    purchases INTEGER DEFAULT 0,

    -- Status wysyłki
    sent_to_client BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMPTZ,

    -- Manus
    manus_task_id TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeksy
CREATE INDEX IF NOT EXISTS idx_ad_reports_workflow ON workflow_ad_reports(workflow_id);
CREATE INDEX IF NOT EXISTS idx_ad_reports_created ON workflow_ad_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_reports_period ON workflow_ad_reports(period_from, period_to);

-- RLS
ALTER TABLE workflow_ad_reports ENABLE ROW LEVEL SECURITY;

-- Admin ma pełny dostęp
CREATE POLICY "Admin full access to ad reports"
    ON workflow_ad_reports
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Klient widzi tylko swoje raporty
CREATE POLICY "Client can view own ad reports"
    ON workflow_ad_reports
    FOR SELECT
    USING (
        auth.role() = 'anon' AND
        workflow_id IN (
            SELECT id FROM workflows WHERE client_token IS NOT NULL
        )
    );

-- Dodaj kolumnę do workflow_ads żeby włączyć auto-raporty
ALTER TABLE workflow_ads ADD COLUMN IF NOT EXISTS auto_reports_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE workflow_ads ADD COLUMN IF NOT EXISTS auto_reports_interval_days INTEGER DEFAULT 7;
ALTER TABLE workflow_ads ADD COLUMN IF NOT EXISTS last_auto_report_at TIMESTAMPTZ;

-- Zaktualizuj cron do sprawdzania co dzień o 4:00 UTC
-- (sprawdza które workflow mają auto_reports_enabled i minęło X dni od ostatniego raportu)

-- Wyczyść stary cron jeśli istnieje
DO $$
BEGIN
    PERFORM cron.unschedule('manus-fetch-ads-cron');
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Cron job manus-fetch-ads-cron not found, skipping';
END $$;

-- Usuń też stary auto-reports jeśli istnieje (przy ponownym uruchomieniu)
DO $$
BEGIN
    PERFORM cron.unschedule('manus-auto-reports');
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Cron job manus-auto-reports not found, skipping';
END $$;

-- Nowy cron - codziennie o 4:00 sprawdza czy trzeba wygenerować raport
SELECT cron.schedule(
    'manus-auto-reports',
    '0 4 * * *',  -- Codziennie o 4:00 UTC
    $$
    SELECT net.http_post(
        url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/manus-auto-reports',
        headers := '{"Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '", "Content-Type": "application/json"}'::jsonb,
        body := '{}'::jsonb
    );
    $$
);

COMMENT ON TABLE workflow_ad_reports IS 'Historia raportów reklamowych - każdy raport to osobny rekord';

-- Szablon emaila dla raportu reklamowego
INSERT INTO email_templates (type, subject, body, is_active)
VALUES (
    'ad_report',
    'Raport z kampanii {{project_name}} — {{period_from}} - {{period_to}}',
    '<div style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #18181b; margin-bottom: 20px;">Cześć {{client_name}}!</h2>

    <p style="color: #3f3f46; line-height: 1.6;">
        Przygotowałem dla Ciebie raport z wynikami Twojej kampanii reklamowej za okres <strong>{{period_from}} - {{period_to}}</strong>.
    </p>

    <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center;">
        <div style="color: rgba(255,255,255,0.8); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">ROAS</div>
        <div style="color: #fff; font-size: 48px; font-weight: 700;">{{roas}}x</div>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
        <tr>
            <td style="padding: 16px; background: #f4f4f5; border-radius: 12px 0 0 0;">
                <div style="color: #71717a; font-size: 11px; text-transform: uppercase;">Wydatki</div>
                <div style="color: #18181b; font-size: 20px; font-weight: 600;">{{spend}} zł</div>
            </td>
            <td style="padding: 16px; background: #f4f4f5; border-radius: 0 12px 0 0;">
                <div style="color: #71717a; font-size: 11px; text-transform: uppercase;">Przychód</div>
                <div style="color: #059669; font-size: 20px; font-weight: 600;">{{revenue}} zł</div>
            </td>
        </tr>
        <tr>
            <td style="padding: 16px; background: #fafafa; border-radius: 0 0 0 12px;">
                <div style="color: #71717a; font-size: 11px; text-transform: uppercase;">Zakupy</div>
                <div style="color: #18181b; font-size: 20px; font-weight: 600;">{{purchases}}</div>
            </td>
            <td style="padding: 16px; background: #fafafa; border-radius: 0 0 12px 0;">
                <div style="color: #71717a; font-size: 11px; text-transform: uppercase;">Kliknięcia</div>
                <div style="color: #18181b; font-size: 20px; font-weight: 600;">{{clicks}}</div>
            </td>
        </tr>
    </table>

    <div style="background: #fef3c7; border-radius: 12px; padding: 16px; margin: 24px 0;">
        <div style="color: #92400e; font-size: 13px; font-weight: 600; margin-bottom: 8px;">📊 Lejek konwersji</div>
        <div style="color: #78716c; font-size: 14px;">
            Kliknięcia: {{clicks}} → Do koszyka: {{add_to_cart}} → Do kasy: {{initiate_checkout}} → Zakupy: {{purchases}}
        </div>
    </div>

    <p style="color: #3f3f46; line-height: 1.6;">
        Szczegółowy raport możesz zobaczyć w swoim panelu klienta.
    </p>

    <div style="text-align: center; margin: 32px 0;">
        <a href="https://crm.tomekniedzwiecki.pl/client-projekt.html?token={{client_token}}" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px;">Zobacz pełny raport</a>
    </div>

    <p style="color: #71717a; font-size: 13px; text-align: center; margin-top: 32px;">
        Pozdrawiam,<br>
        <strong>Tomek Niedzwiecki</strong>
    </p>
</div>',
    true
) ON CONFLICT (type) DO UPDATE SET
    subject = EXCLUDED.subject,
    body = EXCLUDED.body;
