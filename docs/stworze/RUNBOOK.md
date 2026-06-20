# Stworzę — RUNBOOK operacyjny

> Architektura, etapy i protokół zmian → **`SYSTEM-APLIKACJA.md`**. Ten plik = operacje (cennik, secrets, OAuth, sesje testowe).

## Panel admina
`https://crm.tomekniedzwiecki.pl/tn-aplikacje` (zakładka „TN Aplikacje" w przełączniku
produktów CRM). Dashboard = KPI + lejek + koszty 14 dni; Pipeline = 5 etapów
wyliczanych z danych; Sesje = tabela + szczegół (transkrypt, koszt PLN per rozmowa,
grafiki, follow-upy); Koszty = zakres dat; Ustawienia = kurs USD/PLN.

## Koszty
- Każde wywołanie AI loguje się do `spar_usage` z `cost_usd` (cennik w kodzie funkcji).
- Cennik (USD/1M tok.): gpt-5.5 = 5 in / 0.5 cached / 30 out; gpt-5.1 = 1.25 / 0.125 / 10.
  Obraz gpt-image-2 1536x1024: low $0.011 / medium $0.041 / high $0.167.
- Zmiana cennika = edycja `CHAT_PRICES` w spar-chat + `IMAGE_COST_USD` w spar-image
  + ceny w spar-plan, potem deploy.
- Kurs PLN: panel → Ustawienia (settings `usd_pln_rate`).

## Zmiana modelu / limitów (Supabase secrets; bez deployu)
```bash
npx supabase secrets set SPAR_OPENAI_MODEL=gpt-5.5    # albo gpt-5.1
npx supabase secrets set SPAR_IMG_IP_DAILY=20         # obrazy/dobę/IP (ustawione 2026-06-13)
npx supabase secrets set SPAR_IMAGE_QUALITY=medium    # low|medium|high
```

## Follow-upy mailowe (spar-followups)
- Cron: pg_cron **jobid 23** (`spar-followups-cron`), co 30 min. Drip = osobny **jobid 24** (`spar-drip-cron`, :15/:45). Okno wysyłek 8–23 PL. (Aktualna sekwencja maili → `SYSTEM-APLIKACJA.md` §6–7; lista kindów niżej jest częściowo historyczna.)
- Rodzaje: `abandoned_chat` (mail jest, brak werdyktu/żółty, cisza 3–48 h),
  `verdict_no_payment` (zielony, brak wpłaty, cisza 20–96 h),
  `verdict_last_call` (zielony, brak wpłaty, cisza 5–8 dni — drugi i ostatni
  follow-up wątku, z kwotą z planu przychodu),
  `paid_welcome` (wykryta wpłata; przy okazji `leads.status='won'` + `paid_at`).
- Cron wysyła z nagłówkiem `x-cron-secret` (env `SPAR_CRON_SECRET`); ręczny
  trigger bez sekretu dostanie 401.
- Idempotencja: UNIQUE(session_id, kind) w `spar_emails` — max 1 mail rodzaju per sesja.
- Treści maili: w kodzie spar-followups (buildEmail). Wysyłka przez send-email (Resend).
- Wyłączenie crona: `SELECT cron.unschedule('spar-followups-cron');`

## Płatności
Rezerwacja = oferta `a1656695-db0d-4ae7-b107-230832042076` (500 zł). Zamówienia
rozpoznawane po `orders.description ILIKE '%Stworzę%'` + `lead_id`. Checkout v2 dla tej
oferty pokazuje WYMAGANY checkbox zgody (usługa cyfrowa przed upływem 14 dni) i linkuje
`tomekniedzwiecki.pl/aplikacja/regulamin/`.

## OAuth (Google / Facebook) — konfiguracja po stronie Tomka
1. Supabase Dashboard → Authentication → Providers → Google: wklej Client ID + Secret
   (Google Cloud Console → OAuth client, redirect: `https://yxmavwkwnfuphjqbelws.supabase.co/auth/v1/callback`).
2. To samo dla Facebook (App ID + Secret z developers.facebook.com).
3. Authentication → URL Configuration → Redirect URLs: dodaj
   `https://tomekniedzwiecki.pl/aplikacja/sparing/**`.
Bez tej konfiguracji przyciski w bramce zwrócą błąd providera — formularz ręczny
(imię+mail+telefon) działa niezależnie.

## Sesje testowe
`spar_sessions.is_test=true` = poza metrykami, pipeline'em, feedem i follow-upami.
Auto-flagowane: `*@test.local`, mail Tomka, ID `dddddddd-*`/`99999999-*` (migracja).
Ręcznie: checkbox w szczególe sesji w panelu.

## Feed na stronie głównej
`spar-public-feed` — ostatnie 12 realnych projektów (panel/glowna + nazwa), cache 10 min.
Obrazy serwowane przez render API (webp, width 480) — strona główna nie ciągnie PNG 2 MB.
