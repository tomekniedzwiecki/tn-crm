-- Szablon emaila ad_report w tabeli settings (wymagane przez send-email)

INSERT INTO settings (key, value)
VALUES (
    'email_template_ad_report_subject',
    'Raport z kampanii {{project_name}} — {{period_from}} - {{period_to}}'
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO settings (key, value)
VALUES (
    'email_template_ad_report_body',
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
                <div style="color: #18181b; font-size: 20px; font-weight: 600;">{{spend}} {{currency}}</div>
            </td>
            <td style="padding: 16px; background: #f4f4f5; border-radius: 0 12px 0 0;">
                <div style="color: #71717a; font-size: 11px; text-transform: uppercase;">Przychód</div>
                <div style="color: #059669; font-size: 20px; font-weight: 600;">{{revenue}} {{currency}}</div>
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
        <div style="color: #92400e; font-size: 13px; font-weight: 600; margin-bottom: 8px;">Lejek konwersji</div>
        <div style="color: #78716c; font-size: 14px;">
            Kliknięcia: {{clicks}} → Do kasy: {{initiate_checkout}} → Zakupy: {{purchases}}
        </div>
    </div>

    <p style="color: #3f3f46; line-height: 1.6;">
        Szczegółowy raport możesz zobaczyć w swoim panelu klienta.
    </p>

    <div style="text-align: center; margin: 32px 0;">
        <a href="https://crm.tomekniedzwiecki.pl/client-projekt.html?token={{client_token}}#raport" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px;">Zobacz pełny raport</a>
    </div>

    <p style="color: #71717a; font-size: 13px; text-align: center; margin-top: 32px;">
        Pozdrawiam,<br>
        <strong>Tomek Niedzwiecki</strong>
    </p>
</div>'
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
