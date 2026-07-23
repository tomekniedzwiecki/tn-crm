-- 20260723i_wfp_reply_and_models.sql — Prospektor: rozdzielenie From/Reply-To + modele per krok.
-- Decyzja Tomka 23.07: (1) nadawca = ceo@tomekniedzwiecki.pl (wiarygodność domeny głównej dla
-- maila partnerskiego), a odpowiedzi WRACAJĄ do Prospektora — Reply-To = adres odbiorczy na
-- subdomenie (MX→Resend → wfa-inbox-webhook → wfp_inbox → AI proponuje). (2) Koszt ~1 zł/firmę:
-- research/idea/classify na tańszych tierach, mail/vertical na sol. Idempotentne.

-- Adres zwrotny = zweryfikowana subdomena odbiorcza (Resend odbiera; MX subdomeny → Resend).
INSERT INTO public.settings (key, value)
VALUES ('wfp_reply_to', 'tomek@kontakt.tomekniedzwiecki.pl')
ON CONFLICT (key) DO NOTHING;

-- UWAGA: wfp_from_email NIE jest tu przełączany na ceo@ — wymaga wpierw weryfikacji domeny
-- głównej do WYSYŁKI w Resend (SPF/DKIM; MX/Gmail nietknięte). Do tego czasu From pozostaje na
-- zweryfikowanej subdomenie, a Reply-To i tak działa. Flip po zweryfikowaniu: UPDATE settings
-- SET value='ceo@tomekniedzwiecki.pl' WHERE key='wfp_from_email'.

-- Modele per krok (nadpisywalne bez redeployu; kod ma te same defaulty w MODEL_DEFAULTS).
-- research=terra (ekstrakcja faktów), idea=luna (nie ujawniana w mailu), mail=sol (jakość),
-- vertical=sol (bramka GO/NO_GO, raz na wertykal), classify=luna, reply=terra.
INSERT INTO public.settings (key, value)
VALUES ('wfp_models', '{"research":"gpt-5.6-terra","idea":"gpt-5.6-luna","mail":"gpt-5.6-sol","vertical":"gpt-5.6-sol","classify":"gpt-5.6-luna","reply":"gpt-5.6-terra"}')
ON CONFLICT (key) DO NOTHING;
