-- Add columns for seller-signed contract and send timestamp
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS contract_seller_signed_url TEXT;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS contract_sent_at TIMESTAMPTZ;

-- Add comments
COMMENT ON COLUMN workflows.contract_seller_signed_url IS 'URL to the contract signed by seller before sending to client';
COMMENT ON COLUMN workflows.contract_sent_at IS 'Timestamp when contract was sent to client';

-- Add default email template for contract_sent
INSERT INTO settings (key, value) VALUES
('email_template_contract_sent_subject', 'Umowa do podpisu - {{offerName}}'),
('email_template_contract_sent_body', '<!DOCTYPE html>
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
                            <p style="margin: 0 0 8px 0; color: #8b5cf6; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                                Umowa
                            </p>

                            <!-- Headline -->
                            <h1 style="margin: 0 0 24px 0; color: #ffffff; font-size: 28px; font-weight: 600; line-height: 1.3;">
                                {{clientName}}, Twoja umowa czeka na podpis
                            </h1>

                            <!-- Intro text -->
                            <p style="margin: 0 0 32px 0; color: #a3a3a3; font-size: 15px; line-height: 1.6;">
                                Przygotowalismy umowe dla projektu <span style="color: #ffffff;">{{offerName}}</span>. Pobierz ja, przeczytaj i podpisz jednym z dostepnych sposobow.
                            </p>

                            <!-- Info box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #171717; border-radius: 8px; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 24px;">
                                        <div style="margin-bottom: 16px;">
                                            <p style="margin: 0 0 4px 0; color: #737373; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                                                Projekt
                                            </p>
                                            <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 600;">
                                                {{offerName}}
                                            </p>
                                        </div>
                                        <p style="margin: 0; color: #a3a3a3; font-size: 13px; line-height: 1.5;">
                                            Na stronie projektu znajdziesz umowe do pobrania oraz instrukcje podpisania.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                                <tr>
                                    <td align="center">
                                        <a href="{{projectUrl}}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 14px; font-weight: 600; text-align: center;">
                                            Przejdz do projektu
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Note -->
                            <p style="margin: 0; color: #737373; font-size: 13px; line-height: 1.5; text-align: center;">
                                Masz pytania? Odpowiedz na tego maila.
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
