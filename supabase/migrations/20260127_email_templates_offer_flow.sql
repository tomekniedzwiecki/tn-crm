-- =============================================
-- EMAIL TEMPLATES - OFFER FLOW (4 szablony)
-- =============================================
-- Flow mailowe po wygenerowaniu oferty:
-- 1. offer_created - od razu (ciemny motyw, emerald akcenty)
-- 2. offer_personal - po 20 min (plain text, od Tomka)
-- 3. offer_reminder_halfway - po 24h dni roboczych (przypomnienie)
-- 4. offer_expired - po wygaśnięciu oferty
-- WhatsApp: +48 533 308 623

-- Domyślny reply-to dla flow ofertowego
INSERT INTO settings (key, value) VALUES
('offer_flow_reply_to', 'ceo@tomekniedzwiecki.pl')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- 1. OFFER CREATED (od razu po wygenerowaniu)
-- =============================================
-- Ciemny motyw, emerald CTA, ghost WhatsApp button

INSERT INTO settings (key, value) VALUES
('email_template_offer_created_subject', 'Twoja oferta jest gotowa - {{offerName}}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO settings (key, value) VALUES
('email_template_offer_created_body', '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Arial, sans-serif; background-color: #0a0a0a;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #111111; border-radius: 12px; border: 1px solid #222222;">
                    <tr>
                        <td style="padding: 48px 40px;">
                            <p style="margin: 0 0 24px 0; color: #ffffff; font-size: 18px; line-height: 1.7;">{{clientName}},</p>

                            <p style="margin: 0 0 20px 0; color: #a1a1aa; font-size: 16px; line-height: 1.7;">
                                Twoja oferta jest gotowa.
                            </p>

                            <!-- Offer box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #18181b; border-radius: 8px; border: 1px solid #27272a; margin: 32px 0;">
                                <tr>
                                    <td style="padding: 24px;">
                                        <p style="margin: 0 0 4px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Oferta</p>
                                        <p style="margin: 0 0 16px 0; color: #ffffff; font-size: 20px; font-weight: 600;">{{offerName}}</p>
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="color: #a1a1aa; font-size: 14px;">Wartość:</td>
                                                <td align="right" style="color: #10b981; font-size: 18px; font-weight: 600;">{{offerPrice}} PLN</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #a1a1aa; font-size: 14px; padding-top: 8px;">Ważna do:</td>
                                                <td align="right" style="color: #fbbf24; font-size: 14px; font-weight: 500; padding-top: 8px;">{{validUntil}}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <table cellpadding="0" cellspacing="0" style="margin: 0 0 32px 0;">
                                <tr>
                                    <td style="background-color: #10b981; border-radius: 6px;">
                                        <a href="{{offerUrl}}" style="display: inline-block; color: #000000; text-decoration: none; padding: 14px 32px; font-size: 15px; font-weight: 600;">Zobacz ofertę →</a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 24px 0; color: #71717a; font-size: 14px; line-height: 1.6;">
                                Masz pytania? Napisz do mnie.
                            </p>

                            <!-- WhatsApp ghost button -->
                            <table cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="border: 1px solid #27272a; border-radius: 6px;">
                                        <a href="https://wa.me/48533308623" style="display: inline-block; color: #22c55e; text-decoration: none; padding: 12px 20px; font-size: 14px; font-weight: 500;">WhatsApp: +48 533 308 623</a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 32px 0 0 0; color: #ffffff; font-size: 15px;">Tomek</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- 2. OFFER PERSONAL (po 20 minutach)
-- =============================================
-- Prosty mail tekstowy, jakby pisany z palca
-- System automatycznie dodaje podpis wizualny

INSERT INTO settings (key, value) VALUES
('email_template_offer_personal_subject', 'Re: {{offerName}}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO settings (key, value) VALUES
('email_template_offer_personal_body', '<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin: 0; padding: 15px; background-color: #ffffff; text-align: left;">
    <div style="max-width: 600px; font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #222222;">
        <p style="margin-top: 0; margin-bottom: 1em;">Cześć,</p>
        <p style="margin-bottom: 1em;">Przed chwilą została wysłana do Ciebie oferta. Chciałbym upewnić się, że masz świadomość, że moja inwestycja i budowa tego biznesu dla Ciebie związana jest z tym, że docelowo ten biznes Ci przekażę. Następnie staniemy się wspólnikami.</p>
        <p style="margin-bottom: 1em;">Czy masz tego świadomość?</p>
    </div>
</body>
</html>')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- 3. OFFER REMINDER HALFWAY (po 24h - dni robocze)
-- =============================================
-- Przypomnienie o ofercie, ciemny motyw

INSERT INTO settings (key, value) VALUES
('email_template_offer_reminder_halfway_subject', 'Przypomnienie: Twoja oferta wygasa {{validUntil}}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO settings (key, value) VALUES
('email_template_offer_reminder_halfway_body', '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Arial, sans-serif; background-color: #0a0a0a;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #111111; border-radius: 12px; border: 1px solid #222222;">
                    <tr>
                        <td style="padding: 48px 40px;">
                            <p style="margin: 0 0 24px 0; color: #ffffff; font-size: 18px; line-height: 1.7;">{{clientName}},</p>

                            <p style="margin: 0 0 20px 0; color: #a1a1aa; font-size: 16px; line-height: 1.7;">
                                Twoja oferta <strong style="color: #ffffff;">{{offerName}}</strong> wygasa <strong style="color: #fbbf24;">{{validUntil}}</strong>.
                            </p>

                            <p style="margin: 0 0 32px 0; color: #a1a1aa; font-size: 16px; line-height: 1.7;">
                                Jeśli masz pytania lub potrzebujesz więcej czasu na decyzję - daj znać.
                            </p>

                            <!-- CTA Button -->
                            <table cellpadding="0" cellspacing="0" style="margin: 0 0 32px 0;">
                                <tr>
                                    <td style="background-color: #10b981; border-radius: 6px;">
                                        <a href="{{offerUrl}}" style="display: inline-block; color: #000000; text-decoration: none; padding: 14px 32px; font-size: 15px; font-weight: 600;">Zobacz ofertę →</a>
                                    </td>
                                </tr>
                            </table>

                            <!-- WhatsApp ghost button -->
                            <table cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="border: 1px solid #27272a; border-radius: 6px;">
                                        <a href="https://wa.me/48533308623" style="display: inline-block; color: #22c55e; text-decoration: none; padding: 12px 20px; font-size: 14px; font-weight: 500;">WhatsApp: +48 533 308 623</a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 32px 0 0 0; color: #ffffff; font-size: 15px;">Tomek</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- 4. OFFER EXPIRED (po wygaśnięciu oferty)
-- =============================================
-- Informacja o wygaśnięciu, propozycja kontaktu

INSERT INTO settings (key, value) VALUES
('email_template_offer_expired_subject', 'Twoja oferta wygasła')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO settings (key, value) VALUES
('email_template_offer_expired_body', '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Arial, sans-serif; background-color: #0a0a0a;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #111111; border-radius: 12px; border: 1px solid #222222;">
                    <tr>
                        <td style="padding: 48px 40px;">
                            <p style="margin: 0 0 24px 0; color: #ffffff; font-size: 18px; line-height: 1.7;">{{clientName}},</p>

                            <p style="margin: 0 0 20px 0; color: #a1a1aa; font-size: 16px; line-height: 1.7;">
                                Oferta <strong style="color: #ffffff;">{{offerName}}</strong> wygasła.
                            </p>

                            <p style="margin: 0 0 32px 0; color: #a1a1aa; font-size: 16px; line-height: 1.7;">
                                Jeśli nadal jesteś zainteresowany współpracą, napisz do mnie. Chętnie porozmawiam i przygotuję nową propozycję.
                            </p>

                            <!-- WhatsApp ghost button -->
                            <table cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="border: 1px solid #27272a; border-radius: 6px;">
                                        <a href="https://wa.me/48533308623" style="display: inline-block; color: #22c55e; text-decoration: none; padding: 12px 20px; font-size: 14px; font-weight: 500;">WhatsApp: +48 533 308 623</a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 32px 0 0 0; color: #ffffff; font-size: 15px;">Tomek</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
