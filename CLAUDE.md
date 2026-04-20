# TN CRM — Kontekst projektu

## Czym jest ten projekt

CRM / system workflow do obslugi klientow. Stack:
- Frontend: vanilla HTML + Tailwind CSS + inline JS (brak frameworka)
- Backend: Supabase (PostgreSQL + Auth + Storage + RLS)
- Deploy: Vercel
- Ikony: Phosphor Icons (`ph ph-*`)
- UI: ciemny motyw (zinc/black), toasty, modale

## Kluczowe pliki

| Plik | Opis |
|------|------|
| `tn-workflow/workflow.html` | Panel admina — edycja pojedynczego workflow (milestones, branding, produkty, raporty, umowy, sales page) |
| `tn-workflow/workflows.html` | Lista wszystkich workflow |
| `tn-workflow/products.html` | Zarządzanie produktami |
| `client-projekt.html` | Portal klienta — widok read-only workflow |
| `dashboard.html` | Dashboard admina |
| `supabase/migrations/` | Migracje SQL |

## Baza danych — wazne tabele

- `workflows` — glowna tabela workflow
- `workflow_branding` — branding (type: logo, color, font, guideline, mockup, brand_info, other)
- `workflow_products` — produkty powiazane z workflow
- `workflow_reports` — raporty/zalaczniki
- `workflow_milestones` — kamienie milowe
- `workflow_tasks` — zadania w milestones
- `workflow_video` — etap Video (Etap 2): is_active, stage_accepted, voice_message, video_scenarios, social_profiles, video_links
- `workflow_takedrop` — konto TakeDrop (Etap 3): email, haslo, is_active, account_created

RLS: `authenticated` = admin CRUD, `anon` = klient SELECT only.

## Procedury Claude

### Tworzenie umów dla klientów
**Plik:** `CLAUDE_UMOWY_PROCEDURE.md`

Kiedy uzytkownik mowi "zrob umowe dla X" lub "dopracuj umowe":
1. **NIGDY nie modyfikuj wzoru** `umowy/umowa-budowa-sklepu.html`
2. Skopiuj wzór do `umowy/klienci/imie-nazwisko.html`
3. Wprowadź zmiany w kopii (dane klienta, negocjowane warunki)
4. Folder `umowy/klienci/` jest w `.gitignore` - umowy klientów NIE trafiają na serwer

### Generowanie brandingu
**Plik:** `CLAUDE_BRANDING_PROCEDURE.md`

Kiedy uzytkownik mowi "zrob branding dla workflow X":
1. Przeczytaj `CLAUDE_BRANDING_PROCEDURE.md`
2. Pobierz dane workflow i produktu (raporty PDF, infografiki)
3. Przeanalizuj produkt (nazwa, opis, raporty)
4. Zaproponuj 10 nazw marki z wolnymi domenami .pl
5. Po wyborze uzytkownika wygeneruj: tagline, opis, 6 kolorow, 3 fonty, 15 promptow AI
6. **WSTAW BEZPOSREDNIO DO BAZY** przez Supabase REST API (curl) — NIE generuj SQL!
7. **AUTOMATYCZNIE WYGENERUJ 5 LOGO** — wywołaj edge function `generate-image` dla każdego promptu logo

Dane wstawiane: brand_info, colors, fonts, ai_prompts (5 logo + 10 mockupow), a następnie 5 wygenerowanych logo.

### Generowanie landing page (7 etapów + reference + skrypty)

**🎯 TRIGGER FRAZY (AUTO-RUN, FULL autonomous):**
- „Przygotuj landing dla projektu [UUID]"
- „Zrób landing dla [UUID]" / „Zrób landing dla workflow [nazwa]"
- „Wygeneruj stronę sprzedażową [UUID]"

Gdy słyszysz którąkolwiek frazę → **otwórz [`docs/landing/README.md`](docs/landing/README.md)** i wykonaj AUTO-RUN — wszystkie 6 etapów autonomicznie, **commit + push + deploy bez pytania** (landingi to preview dla klienta, nie produkcja — patrz `feedback-landing-auto-deploy.md`). Zakończ podaniem linku live: `https://tn-crm.vercel.app/landing-pages/[slug]/`.

**Flow (6 etapów):**

| # | Plik | Rola |
|---|------|------|
| 1 | [`docs/landing/01-direction.md`](docs/landing/01-direction.md) | **DIRECTION** — manifesto + baseline + verify-brief gate |
| 2 | [`docs/landing/02-generate.md`](docs/landing/02-generate.md) | **GENERATE** — HTML zgodny z briefem |
| 3 | [`docs/landing/03-review.md`](docs/landing/03-review.md) | **REVIEW** — weryfikacja treści (~63 grep checks) |
| 3.5 | [`docs/landing/03-5-copy-review.md`](docs/landing/03-5-copy-review.md) | **COPY REVIEW** — Manus rewrite purple prose → direct response |
| 4 | [`docs/landing/04-design.md`](docs/landing/04-design.md) | **DESIGN** — polish + offer box |
| 5 | [`docs/landing/05-verify.md`](docs/landing/05-verify.md) | **VERIFY** — Playwright screenshoty 3 viewporty |
| 6 | [`docs/landing/06-mobile.md`](docs/landing/06-mobile.md) | **MOBILE** — polish 375px |

**Reference (cross-cutting):**
- [`docs/landing/reference/safety.md`](docs/landing/reference/safety.md) — 10 zasad bezwarunkowych (single source of truth)
- [`docs/landing/reference/copy.md`](docs/landing/reference/copy.md) — Senior Copywriter + Conversion Boosters
- [`docs/landing/reference/pagespeed.md`](docs/landing/reference/pagespeed.md) — optymalizacja wydajności
- [`docs/landing/reference/patterns.md`](docs/landing/reference/patterns.md) — 22 signature snippetów

**Specjalne przypadki:**
- Modyfikacja / migracja starego landinga → [`docs/landing/migrate.md`](docs/landing/migrate.md)
- Historia zmian procedury → [`docs/landing/CHANGELOG.md`](docs/landing/CHANGELOG.md)

**Skrypty pomocnicze:**
- `scripts/verify-brief.sh [slug]` — walidacja briefa PRZED ETAP 2 (BLOKUJE jeśli niekompletny)
- `scripts/verify-landing.sh [slug]` — ~33 grep checks (target: ≥15/18 PASS)
- `scripts/verify-all-landings.sh` — regression check na 6 baseline'ach
- `scripts/screenshot-landing.sh [slug]` — Playwright 3 viewports
- `scripts/landing-autorun.sh [UUID]` — entry-point AUTO-RUN mode (KROK 16 v3)

**KRYTYCZNE:**
- **NIE wybieraj kierunku „z presetu" przed audytem produktu** — to był root cause refactoru 2026-04 (dryf Editorial↔Panoramic Calm bez danych)
- **Manifesto MUSI być zapisany PRZED generowaniem HTML** — `verify-brief.sh` to wymusza
- **STOP conditions (tylko te 3 zatrzymują auto-deploy):**
  1. `verify-landing.sh` <15/18 PASS (safety violation)
  2. `verify-all-landings.sh` zepsuły inny landing (regression)
  3. Brak zdjęć AI **i** placeholder-briefów (szkielet zamiast landinga)

Wzorce: `landing-pages/paromia/` (Editorial/Luxury), `landing-pages/vitrix/` (Panoramic Calm), `landing-pages/h2vital/` (Organic), `landing-pages/pupilnik/` (Playful), `landing-pages/vibestrike/` (Retro-Futuristic), `landing-pages/kafina/` (Rugged Heritage).

### Generowanie copy reklamowego Meta Ads
**Plik:** `CLAUDE_ADS_COPY_PROCEDURE.md`

Kiedy uzytkownik mowi "zrob copy reklamowe dla workflow X":
1. Przeczytaj `CLAUDE_ADS_COPY_PROCEDURE.md`
2. Pobierz dane workflow z Supabase (branding, produkty, landing page URL)
3. Wygeneruj 5 wersji copy z roznymi katami (Pain Point, Transformation, Social Proof, Urgency, Curiosity)
4. Kazda wersja: Primary Text + Headline + Description + CTA

## Supabase Edge Functions

### ⚠️ KRYTYCZNE: NIE PSUJ INTEGRACJI TPAY ⚠️

**PRZED deployem jakiejkolwiek funkcji Supabase przeczytaj to:**

1. **tpay-webhook** MUSI byc ZAWSZE deployowany z `--no-verify-jwt` (uzyj `npm run deploy:tpay-webhook`)
2. **NIE ZMIENIAJ** logiki weryfikacji podpisu w tpay-webhook - jest OPCJONALNA i tak ma byc
3. **NIE MODYFIKUJ** nazw zmiennych srodowiskowych w tpay-webhook (`tpay_client_secret`, `tpay_merchant_id`)
4. **Po KAZDYM DEPLOYU** funkcji sprawdz czy platnosci dzialaja (endpoint zwraca 200)

Test: `npm run test:webhooks` - uruchom PO KAZDYM DEPLOYU funkcji!

Jezeli zmieniasz COKOLWIEK w supabase/functions/ - NIE DOTYKAJ tpay-webhook chyba ze uzytkownik wyraznie o to prosi!

---

### Deploy
Wymagany `SUPABASE_ACCESS_TOKEN` w zmiennych srodowiskowych lub zalogowanie przez `npx supabase login`.

Token mozna wygenerowac: https://supabase.com/dashboard/account/tokens

```bash
# Deploy wszystkich funkcji
npm run deploy:functions

# Deploy pojedynczej funkcji
npm run deploy:send-email
npm run deploy:resend-webhook
npm run deploy:offer-cron
npm run deploy:workflow-stage
npm run deploy:automation-executor
npm run deploy:automation-trigger
npm run deploy:automations  # executor + trigger razem
```

### Lokalizacja funkcji
`supabase/functions/[nazwa-funkcji]/index.ts`

Glowne funkcje:
- `send-email` - wysylanie emaili przez Resend
- `resend-webhook` - odbieranie webhookow z Resend (open/click tracking)
- `offer-emails-cron` - automatyczne maile ofertowe (cron)
- `workflow-stage-completed` - powiadomienia o ukonczeniu etapu
- `automation-executor` - wykonuje kroki automatyzacji (cron co 2 min)
- `automation-trigger` - tworzy automation_execution gdy wystapi event
- `tpay-webhook` - webhook platnosci TPay (oznacza zamowienia jako oplacone)
- `tpay-create-transaction` - tworzenie transakcji TPay

### WAZNE: Funkcje webhook wymagaja --no-verify-jwt

Funkcje odbierajace zewnetrzne webhooks (TPay, Resend itp.) **MUSZA** byc deployowane z flaga `--no-verify-jwt`:

```bash
# TPay webhook - BEZ JWT (zewnetrzny serwer nie ma tokena)
npm run deploy:tpay-webhook

# Resend webhook - BEZ JWT
npm run deploy:resend-webhook
```

Skrypty w package.json maja juz ustawiona flage `--no-verify-jwt`. **ZAWSZE uzywaj npm scripts zamiast bezposrednich komend supabase.**

**Dlaczego?** Supabase domyslnie wymaga naglowka Authorization z tokenem JWT. Zewnetrzne serwisy (TPay, Resend) nie moga wyslac tego tokena, wiec dostaja blad 401 Unauthorized.

**NIGDY nie deployuj tych funkcji bez --no-verify-jwt** - zepsuje to integracje platnosci!

### Bezpieczenstwo webhookow

Webhooks bez JWT musza miec wlasna weryfikacje:
- **tpay-webhook**: weryfikuje MD5 checksum (opcjonalnie, jesli ustawione `tpay_client_secret` i `tpay_merchant_id`)
- **resend-webhook**: weryfikuje podpis Resend (wymaga `RESEND_WEBHOOK_SECRET`)

Te zmienne MUSZA byc ustawione w Supabase Dashboard > Edge Functions > Secrets. Bez nich webhook odrzuci wszystkie requesty (500).

## System automatyzacji

### Tabele
- `automation_flows` - definicje automatyzacji (trigger, steps)
- `automation_steps` - kroki: action (send_email), delay, condition
- `automation_executions` - wykonania (status, logs, context)

### Triggery
Dostepne trigger_type w automation_flows:
- `lead_created` (nowy lead z formularza zapisy)
- `offer_created`, `offer_viewed`, `offer_expired`
- `payment_received`, `workflow_created`
- `stage_completed`, `products_shared`, `report_published`
- `branding_delivered`, `sales_page_shared`, `contract_signed`
- `video_activated` (Etap 2 - aktywacja Video)
- `takedrop_activated` (Etap 3 - aktywacja TakeDrop)

### Flow
1. Event (np. stage_completed) -> wywoluje automation-trigger
2. automation-trigger tworzy automation_execution dla aktywnych flow
3. automation-executor (cron) przetwarza execution step by step
4. Kroki: action (wyslij email), delay (poczekaj X dni), condition (if/else)

### Ustawienia
- `settings.automations_master_enabled` - glowny wlacznik (true/false)
- `automation_flows.is_active` - aktywacja pojedynczej automatyzacji
