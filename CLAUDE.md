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

Gdy słyszysz którąkolwiek frazę → **otwórz [`docs/landing/README.md`](docs/landing/README.md)** i wykonaj AUTO-RUN — wszystkie 7 etapów autonomicznie (1, 2, 3, **3.5 Manus copy review**, 4, 5, 6), **commit + push + deploy bez pytania** (landingi to preview dla klienta, nie produkcja — patrz `feedback-landing-auto-deploy.md`). Zakończ podaniem linku live: `https://tn-crm.vercel.app/landing-pages/[slug]/`.

**⛔ HARD RULE: Verify-landing 0 FAIL OBOWIĄZKOWE przed commitem**

Empirycznie wykryte 2026-04-20: `landing-pages/kidsnap/` (commit `732f117`) zostało wdrożone ze stanem łamiącym 10+ safety rules (brak html.js gate, zakazana fraza dropshipping, zero wymaganych JS effects, brak OG image URL). Procedura deklarowała ale NIE egzekwowała.

**Zasady bezwzględne:**
1. **NIE commituj landingu** (`landing-pages/[slug]/index.html`) jeśli `bash scripts/verify-landing.sh [slug]` zwraca ≥1 FAIL
2. WARN są OK (opcjonalne aesthetic choices jak js-tilt dla Rugged Heritage); FAIL = safety/quality violation
3. **Zainstaluj pre-commit hook**: `bash scripts/install-landing-hooks.sh` — blokuje commit gdy FAIL, niezależnie od pamiętania
4. Jeśli musisz pominąć (hotfix) → `git commit --no-verify` + ZRÓB follow-up fix commit w tej samej sesji

**Flow (7 etapów):**

| # | Plik | Rola |
|---|------|------|
| 1 | [`docs/landing/01-direction.md`](docs/landing/01-direction.md) | **DIRECTION** — manifesto + baseline + verify-brief gate |
| 2 | [`docs/landing/02-generate.md`](docs/landing/02-generate.md) | **GENERATE** — HTML zgodny z briefem |
| 3 | [`docs/landing/03-review.md`](docs/landing/03-review.md) | **REVIEW** — weryfikacja treści (grep checks; gate = exit code) |
| 3.5 | [`docs/landing/03-5-copy-review.md`](docs/landing/03-5-copy-review.md) | **COPY REVIEW** — Manus rewrite purple prose → direct response |
| 4 | [`docs/landing/04-design.md`](docs/landing/04-design.md) | **DESIGN** — polish + offer box |
| 5 | [`docs/landing/05-verify.md`](docs/landing/05-verify.md) | **VERIFY** — Playwright screenshoty 3 viewporty |
| 6 | [`docs/landing/06-mobile.md`](docs/landing/06-mobile.md) | **MOBILE** — polish 375px |

**Reference (cross-cutting):**
- [`docs/landing/reference/safety.md`](docs/landing/reference/safety.md) — 10 zasad bezwarunkowych (single source of truth)
- [`docs/landing/reference/copy.md`](docs/landing/reference/copy.md) — Senior Copywriter + Conversion Boosters
- [`docs/landing/reference/pagespeed.md`](docs/landing/reference/pagespeed.md) — optymalizacja wydajności
- [`docs/landing/reference/patterns.md`](docs/landing/reference/patterns.md) — 22 cross-section signature snippetów
- [`docs/landing/reference/section-variants.md`](docs/landing/reference/section-variants.md) — **35 wariantów per-sekcja (10 hero + 6 features + 6 testimonials + 13 Tier 2 v5.0)**. Claude w ETAP 2 autonomicznie wybiera warianty (drzewo decyzyjne rozdział 4; Tier 2: Problem/How/Comparison/Offer).

**Specjalne przypadki:**
- Modyfikacja / migracja starego landinga → [`docs/landing/migrate.md`](docs/landing/migrate.md)
- Historia zmian procedury → [`docs/landing/CHANGELOG.md`](docs/landing/CHANGELOG.md)

**Skrypty pomocnicze:**
- `scripts/verify-brief.sh [slug]` — walidacja briefa PRZED ETAP 2 (BLOKUJE jeśli niekompletny)
- `scripts/verify-landing.sh [slug]` — grep checks (gate = exit code: 0 PASS · 1 FAIL · 2 WARN-EXCEEDED)
- `scripts/verify-all-landings.sh` — regression check na 6 baseline'ach
- `scripts/screenshot-landing.sh [slug]` — Playwright 3 viewports (fallback gdy MCP niedostępny)
- `scripts/landing-autorun.sh [UUID]` — entry-point AUTO-RUN mode (KROK 16 v3)

**🔌 MCP integrations dla landingów (zainstalowane 2026-05-21):**

| MCP | Etap | Rola |
|---|---|---|
| **chrome-devtools** | ETAP 5 (verify), ETAP 6 (mobile), pagespeed.md | Console errors, LCP/CLS/FCP, smoke test interakcji (CTA scroll, reels lightbox, sticky-cta), fade-in opacity check, 3 viewporty. **Drop-in replacement dla `screenshot-landing.sh`** — używaj MCP gdy dostępne, fallback na bash gdy nie |
| **context7** | ETAP 2 (generate), ETAP 4 (design) | Wywołaj `resolve-library-id` + `query-docs` gdy używasz rzadkich/nowych CSS properties (`@container queries`, `view-timeline`, `anchor-positioning`, `:has()`, `subgrid`, `text-wrap: balance/pretty`). Anti-halucynacja składni |
| **magic** (21st.dev) | TYLKO research, NIGDY w pipeline | Wyłącznie ręczne wywołanie gdy user prosi o "zerknij na 21st.dev co tam jest dla X" w kontekście rozbudowy Style Atlas / motion-library. **Generuje React + framer-motion + shadcn/ui = wrong stack + AI slop dla polskich DR landingów** — NIE używaj do generowania kodu na konkretny landing |

Patrz: [`mcp-landing-tools.md`](../../Users/tomek/.claude/projects/c--repos-tn/memory/mcp-landing-tools.md) w memory + sekcja "MCP integrations" w [`docs/landing/README.md`](docs/landing/README.md).

**KRYTYCZNE:**
- **NIE wybieraj kierunku „z presetu" przed audytem produktu** — to był root cause refactoru 2026-04 (dryf Editorial↔Panoramic Calm bez danych)
- **Manifesto MUSI być zapisany PRZED generowaniem HTML** — `verify-brief.sh` to wymusza
- ⛔ **Zdjęcia AI = OPT-IN, NIGDY automatycznie w AUTO-RUN** (safety #11, incydent Linovo 2026-05-29). Domyślny deliverable = **placeholdery z 4-polowym briefem fotografa**; klient wstawia realne zdjęcia. Generuj obrazy `generate-image` TYLKO gdy user wyraźnie poprosi, i tylko ściśle wg referencji produktu (anti-drift — model dorabia cechy, których realny produkt nie ma).
- **STOP conditions (tylko te 3 zatrzymują auto-deploy):**
  1. `verify-landing.sh` GATE: FAIL — exit 1 (safety violation)
  2. `verify-all-landings.sh` zepsuły inny landing (regression)
  3. Brak placeholder-briefów (szkielet zamiast landinga — zdjęcia AI NIE są wymagane)

Wzorce: `landing-pages/paromia/` (Editorial/Luxury), `landing-pages/vitrix/` (Panoramic Calm), `landing-pages/h2vital/` (Organic), `landing-pages/pupilnik/` (Playful), `landing-pages/vibestrike/` (Retro-Futuristic), `landing-pages/kafina/` (Rugged Heritage).

### Produkty V2 — research i rekomendacje produktowe
**Plik:** `docs/products/PRODUCT_RESEARCH_PROCEDURE.md`

Kiedy uzytkownik mowi „odswiez rekomendacje produktow" / „znajdz nowe produkty do katalogu" / „research produktow V2":
1. Przeczytaj procedure — framework scoringu w `settings.product_research_framework`, rekomendacje w `product_recommendations`
2. Uruchom workflow sourcingu: `docs/products/research-sourcing-workflow.js` (generatorzy per kategoria → 3 sceptykow per kandydat → scoring)
3. INSERT wynikow jako `draft` (NIGDY nie publikuj bez decyzji Tomka), archiwizuj przeterminowane (valid_until)
4. UI: `tn-workflow/products-v2.html` — przeglad, publikacja, awans do katalogu `workflow_products`

### Generowanie contentu reklamowego Meta Ads (v2 — COD)
**Plik:** `CLAUDE_ADS_COPY_PROCEDURE.md`

Kiedy uzytkownik mowi "zrob copy reklamowe / content reklamowy dla workflow X":
1. Przeczytaj `CLAUDE_ADS_COPY_PROCEDURE.md` (v2, 2026-06-10)
2. Produkcyjnie content robi pipeline `generate-campaign-batch` (research Manus -> 5 KONCEPTOW:
   copy + image_prompt + video_hook -> grafiki Gemini z referencja produktu); fallback `generate-ad-copy`
3. Zasady v2: risk-reversal COD obowiazkowy ("placisz przy odbiorze", "zwrot 14 dni"),
   CTA default "Kup teraz" (COD zdejmuje ryzyko), ZERO zmyslonej pilnosci i obietnic dostawy,
   kazda wersja = spojny koncept (copy+wizual+video hook), hook w 125 znakach
4. Po zmianie promptow w edge functions -> deploy reczny (`--no-verify-jwt`)

### Zakladanie kampanii Meta Ads przez MCP
**Plik:** `CLAUDE_MCP_CAMPAIGN_PROCEDURE.md`

Kiedy uzytkownik mowi „utworz kampanie MCP dla workflow X" / „zaloz kampanie przez MCP":
1. Przeczytaj `CLAUDE_MCP_CAMPAIGN_PROCEDURE.md` — odtwarza spec „Pakietu Claude Cowork"
   (BRIEF z `workflow.html`), ale buduje kampanie bezposrednio przez Meta MCP zamiast agenta przegladarkowego.
2. Gate'y: konto reklamowe (mapuj po marce, potwierdz), strona FB podpieta pod konto, pixel, metoda platnosci.
3. Wszystko PAUSED — publikacja wylacznie recznie przez Tomka.

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
