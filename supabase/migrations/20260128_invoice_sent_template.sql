-- Add default email template for invoice_sent
INSERT INTO settings (key, value) VALUES
('email_template_invoice_sent_subject', 'Faktura VAT - {{invoiceNumber}}'),
('email_template_invoice_sent_body', '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #000000;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; border-radius: 12px; border: 1px solid #262626;">
                    <tr>
                        <td style="padding: 48px 40px 40px 40px;">
                            <!-- Label -->
                            <p style="margin: 0 0 8px 0; color: #10b981; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                                Faktura VAT
                            </p>

                            <!-- Headline -->
                            <h1 style="margin: 0 0 24px 0; color: #ffffff; font-size: 28px; font-weight: 600; line-height: 1.3;">
                                {{clientName}}, oto Twoja faktura
                            </h1>

                            <!-- Intro text -->
                            <p style="margin: 0 0 32px 0; color: #a3a3a3; font-size: 15px; line-height: 1.6;">
                                Wystawilismy dla Ciebie fakture VAT za <span style="color: #ffffff;">{{description}}</span>.
                            </p>

                            <!-- Invoice box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #171717; border-radius: 8px; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 24px;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td>
                                                    <p style="margin: 0 0 4px 0; color: #737373; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                                                        Numer faktury
                                                    </p>
                                                    <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 600;">
                                                        {{invoiceNumber}}
                                                    </p>
                                                </td>
                                                <td style="text-align: right;">
                                                    <p style="margin: 0 0 4px 0; color: #737373; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                                                        Kwota
                                                    </p>
                                                    <p style="margin: 0; color: #10b981; font-size: 24px; font-weight: 700;">
                                                        {{amount}} <span style="font-size: 14px; font-weight: 400; color: #a3a3a3;">PLN</span>
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                                <tr>
                                    <td align="center">
                                        <a href="{{viewUrl}}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 14px; font-weight: 600; text-align: center;">
                                            Zobacz fakture online
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Note -->
                            <p style="margin: 0; color: #737373; font-size: 13px; line-height: 1.5; text-align: center;">
                                Dziekujemy za wspolprace!
                            </p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 40px; border-top: 1px solid #262626; text-align: center;">
                            <a href="https://tomekniedzwiecki.pl" style="color: #525252; font-size: 12px; text-decoration: none;">tomekniedzwiecki.pl</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
