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

### Generowanie landing page (5 etapów + biblioteka patternów)

**🎯 TRIGGER FRAZY (AUTO-RUN):**
- „Przygotuj landing dla projektu [UUID]"
- „Zrób landing dla [UUID]" / „Zrób landing dla workflow [nazwa]"
- „Wygeneruj stronę sprzedażową [UUID]"
- Cytowanie `CLAUDE_LANDING_PROCEDURE.md` w kontekście nowego landinga

Gdy słyszysz którąkolwiek frazę → **otwórz `CLAUDE_LANDING_PROCEDURE.md`** i wykonaj **AUTO-RUN** (wszystkie 5 etapów autonomicznie, bez pytania użytkownika). Zacznij od sekcji „AUTO-RUN TRIGGER" + „Checklist auto-run".

**Master entry-point i nawigacja:** [`CLAUDE_LANDING.md`](CLAUDE_LANDING.md) — index/cheatsheet, flowchart, final checklist.

**Pliki (szczegółowe):**
- `CLAUDE_LANDING_PROCEDURE.md` — **MASTER ENTRY** + ETAP 1: generowanie (zaczyna się od AUTO-RUN trigger + **KRYTYCZNYCH LEKCJI**)
- `CLAUDE_LANDING_REVIEW.md` — ETAP 2: weryfikacja treści (18 automatycznych kontroli)
- `CLAUDE_LANDING_DIRECTION.md` — **ETAP 2.5: OBOWIĄZKOWY** manifesto → `landing-pages/[slug]/_brief.md`
- `CLAUDE_LANDING_DESIGN.md` — ETAP 3: dopracowanie estetyki + JS effects + layout discipline
- `CLAUDE_LANDING_VERIFY.md` — ETAP 4: **OBOWIĄZKOWY** Playwright screenshot 3 viewportów
- `CLAUDE_LANDING_MOBILE.md` — **ETAP 4.5: OBOWIĄZKOWY** Mobile Polish Pass (10 obszarów + bash scan + copy-paste fixy)
- `CLAUDE_LANDING_PATTERNS.md` — biblioteka 22 signature snippetów (kopiuj-wklej)

**Automatyzacja:**
- `scripts/verify-landing.sh [slug]` — one-command 18-check verification
- `scripts/screenshot-landing.sh [slug]` — Playwright 3 viewports (zamiast ad-hoc _shoot.mjs)
- `landing-pages/_templates/README.md` — mapping kierunek → baseline do kopiowania
- `landing-pages/[slug]/_brief.md` — persystentny brief (commitowany, nie /c/tmp/)

Kiedy uzytkownik mowi "zrob landing dla workflow X":

**ETAP 1 — Generowanie** (`CLAUDE_LANDING_PROCEDURE.md`):
1. Przeczytaj sekcję KRYTYCZNE LEKCJE (fade-in bug, mobile dual-bank, placeholder briefy)
2. Pobierz branding, produkty, raporty z Supabase
3. Wybierz kierunek estetyczny
4. Napisz copy (PAS framework, Senior Copywriter Playbook)
5. Wygeneruj `index.html` — używaj gotowych snippetów z `CLAUDE_LANDING_PATTERNS.md`
6. Zapisz do `landing-pages/[nazwa-marki]/index.html`

**ETAP 2 — Weryfikacja treści** (`CLAUDE_LANDING_REVIEW.md`) — OBOWIĄZKOWY:
kompletność sekcji, placeholdery, Hero deep dive, grupa docelowa, technikalia.

**ETAP 2.5 — Wybór kierunku estetycznego** (`CLAUDE_LANDING_DIRECTION.md`) — OBOWIĄZKOWY:
audyt produktu, 3 realne marki referencyjne spoza `landing-pages/`, napisanie **Design Manifesto** (5 linijek) do `/c/tmp/[slug]_manifesto.md`, walidacja anty-generic. **NIE PYTAJ użytkownika o kierunek — decyduj autonomicznie z danych Supabase.**

**ETAP 3 — Dopracowanie designu** (`CLAUDE_LANDING_DESIGN.md`) — OBOWIĄZKOWY:
implementacja manifesto z ETAP 2.5 w CSS/HTML: typografia, głębia kolorów, asymetria, animacje, tekstury, signature element.

**ETAP 4 — Wizualna weryfikacja** (`CLAUDE_LANDING_VERIFY.md`) — OBOWIĄZKOWY:
1. `npm install -D playwright && npx playwright install chromium` (pierwszy raz)
2. Uruchom `bash scripts/screenshot-landing.sh [slug]` → screenshoty 3 viewportów (desktop 1440, tablet 768, mobile 375)
3. Obejrzyj wszystkie — checklist z pliku
4. Napraw wyłapane bugi, powtórz

**ETAP 4.5 — Mobile Polish Pass** (`CLAUDE_LANDING_MOBILE.md`) — OBOWIĄZKOWY:
1. Bash grep scan (touch targets, overflow-x, 100vw leaks, images bez width/height)
2. Checklist 10 obszarów (A–J): touch, typography, spacing, layout, hero, nav, images, overflow, interactive, performance
3. Użyj copy-paste fixów (hero stack, trust strip, decorations hide, bento flat, footer 4→1)
4. Re-run screenshot → iteruj aż 5/5 finalna certyfikacja PASS
5. Dopiero po PASS: commit & deploy

**Dlaczego ETAP 4 + 4.5 są obowiązkowe:** code review nie wyłapuje `opacity:0 + JS zależnego` buga (ETAP 4), ani nie wyczuje "wciśniętego desktopu" na 375px (ETAP 4.5). 60-70% ruchu to mobile — landing musi być **idealny** na telefonie, nie tylko "działający".

Wzorce: `landing-pages/paromia/` (editorial/luxury), `landing-pages/h2vital/` (jasny), `landing-pages/pupilnik/` (playful/pet care).

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
