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

## TN Sklepy — workflow v2 (wspólne biznesy po rezerwacji /sklep)

**Osobna aplikacja** (`tn-sklepy/index.html` lista + `tn-sklepy/projekt.html`), LIVE:
`crm.tomekniedzwiecki.pl/tn-sklepy/index`. **Przeczytaj PRZED pracą:**
`docs/zbuduje/WORKFLOW-V2-PLAN.md` (sekcja „STAN WDROŻENIA" = prawda).

- Tabele `wf2_*`: projects, products (portfel, generated `unit_profit`), step_defs
  (**kroki = konfiguracja: nowy krok = 1 INSERT, zero zmian frontu**), steps (jedyne
  źródło postępu), sales, ad_stats, payments (UI ukryte), activities. RLS wyłącznie
  `team_members` — ZERO polityk anon (portal klienta pójdzie przez edge function).
- **Etapy 1–6 (od 2026-07-18, migracja `20260718_wf2_fabryka_panel`):** 1 Portfel (marka+wybor)
  → **2 Landing** (lp_dane→lp_plan→lp_styl_marka→lp_makiety🏁→lp_grafiki→lp_kod→lp_dopasowanie→
  lp_zycie→lp_finisz🏁 = fabryka F0→F8) → **3 Sklep na platformie** (pl_* przez API Trevio,
  edge wf2-platform TYPED ACTIONS) → 4 Kampanie (konto→budżet→pixel🏁→**3 grafiki wf2-ads**→
  **ads_wideo**→kampania🏁 PAUSED) → 5 Testy i skalowanie → 6 Stery. Artefakty fabryki
  (makiety/dowody/kreacje) = tabela `wf2_artifacts` → galerie w warsztatach kroków.
  Zamówienia platformy = `wf2_orders` (cron wf2-orders-sync; licznik do 1000 = COUNT).
  Cena na landingu = publiczny edge `wf2-landing-api` + snippet
  `docs/zbuduje/assets/landing-runtime-snippet.html` (window.trevio + INIT-GUARD pixela).
  Marża testowa = ~15% narzutu (`TEST_MARGIN_PCT`). Portfel: cel 5 produktów,
  dobór = **PRAWDZIWE losowanie** z approved /trendy (bez scoringu — decyzja Tomka 17.07).
- Auto-create projektu: tpay-webhook przy opłaconej rezerwacji 500 zł (blok WORKFLOW V2,
  własny try/catch — NIGDY nie może przerwać obsługi płatności).
- **Styl modułu = Geist/Vercel (twardo)**: tła #0a0a0a/#111, 1px bordery #1f1f1f–#333,
  akcent #0070f3, success #45a557, warning #f5a623, error #e5484d, promienie 6–8px,
  zero fioletu/rose. Sidebar: `/tn-sklepy` sprawdzane PRZED `/tn-sklep` w detectCurrentApp.

### bud-ali-snapshot — GOTCHA endpointu
Detail aukcji = DWA źródła (od 17.07): (1) `/api/v3/product-info` (aliexpress-true-api,
warstwa AFILIACYJNA — tytuł/galeria/cena/sold_volume/video/shop; odpowiedź to TABLICA
`[{...}]`, błąd = `{"No information":...}`; NIGDY nie zwróci specs/opisu/SKU — żaden tier);
(2) **AliExpress DataHub** (`aliexpress-datahub.p.rapidapi.com`, ten sam klucz RapidAPI po
subskrypcji) — kaskada `item_detail_6→3→2` (pojedyncze wersje miewają 5040) dociąga:
`properties.list`→specs, `description.html`→opis, `sku.base+props`→warianty z cenami.
`target_currency=PLN`/`target_language=PL` NIE działa — tylko USD/EN (ceny w snapshocie
SĄ W USD, front przelicza kursem NBP). Sonda diagnostyczna: body `{rawProbe:true|'datahub',
product_id, dh_endpoint?, dh_summary?}`.
`source==='detail'` = potwierdzona żywa aukcja; 'search' = możliwy INNY produkt/martwa
aukcja (UI pokazuje alert + podmianę linku). Endpoint nie zwraca opisu ani cen SKU.
**Fabryka landingów: `source!=='detail'` = GATE STOP** (force:true raz, potem nota do
Tomka; incydent Latarka 17.07 — landing zbudowany na search-galerii innego produktu);
`curatedUrl` ratuje zdjęcie karty, ale NIE podnosi source. Kuracja galerii →
`bud_tt_products.gallery_curated jsonb` (procedura `docs/zbuduje/GALERIA-ALI.md`).

### Fabryka landingów — nowe kroki (17.07; SSOT `docs/zbuduje/STANDARD-LANDING-SKLEPY.md`)
- **F0.6 KARTA PRAWDY** (§1a; `FABRYKA-*/<slug>/KARTA-PRAWDY.md`) = JEDYNE źródło danych (Z7);
  każdy brief F1/F4/copy dostaje TĘ kartę, claim bez kotwicy = CUT.
- **F2.5 BRANDING + rejestr nazw**: `scripts/mockup-tools/brand-forge.py` (favicon gpt-image →
  selektor @32px → vision top-2; wordmark z fontu, NIE gpt-image); rezerwacja `bud_brand_names`
  (INSERT-or-fail; migracja `20260717b_bud_brand_names.sql`).
- **Sekcja WIDEO**: kuracja `bud_tt_products.videos_curated jsonb` (mirror `gallery_curated`;
  migracja `20260717c_videos_curated.sql`), self-host MP4 pipeline 1→N (poster własną klatką).
- **PASS 4** w `detail-lint.py` (F7.3 `docs/zbuduje/FINALNY-PASS.md`): odstępy bloków, crop/DPR2,
  interakcja per viewport (hit-test), pay-badges kanon vs imitacje (`--fix` auto-swap).
- **F7.1 DOWÓD per sekcja = GATE:** `dopasowanie/NN-*.png` komplet (hero+02–13) OBOWIĄZKOWY
  przed DONE; brak = FAIL („13/13 1:1" bez kompozytów = nieważne). Skrypt `sekcja-diff.py
  <url> <slug>` (batch cropy z granic DOM). ⛔ numeracja sekcji „01/12" na stronie = zakaz.
- **TOR-I sekcje interaktywne** (`docs/zbuduje/SEKCJE-INTERAKTYWNE.md`): kwalifikacja na
  makietach, SPEC-I, sandbox, test stanów (SSIM<0.9 + klatki), pętla max 4 → downgrade z notą.
- **PRODUKT W SCENACH** (STANDARD §2): każda sekcja produktowa = WŁASNE ujęcie; ten sam kadr
  max 1× (wyj. oferta↔sticky); ≥5 distinct views; klony pozy scene-from-mockup = P1.
- **MODELE PER FAZA (18.07; SSOT: STANDARD §Z8):** subagenci fabryki NIE są już „zawsze Opus".
  Domyślnie **Sonnet**; **Haiku** dla skryptów/REST (gate-check/sekcja-diff/detail-lint/panel-sync,
  F-1, F6, backfill); **Opus** tylko dla otwartej kreacji/architektury (F1.7 przewodnik, KRYTYK
  makiet, kod nietypowy/TOR-I flagowa, projektowanie gate'ów/mostu). Gate'y R13 ubezpieczają jakość
  → tańszy model przechodzi te same progi. Jawny `model:` w spawnie wygrywa z env
  `CLAUDE_CODE_SUBAGENT_MODEL=claude-opus-4-8` (env = bezpiecznik). Eskalacja Sonnet→Opus w LEDGER.
- **MODUŁY KANONICZNE (R13; `docs/zbuduje/moduly/` + `MODULY.md`):** sekcja z odpowiednikiem MUSI
  bazować na module (wideo-rail/lightbox/sticky-buy/faq-accordion@1) — skórka = tokeny/treść, mechanika
  i proporcje NIETYKALNE (⛔ `grid-auto-flow:column;grid-auto-columns:1fr` = slivery). Kodowanie od zera = odstępstwo w LEDGER.
- **TYPY SEKCJI + RUBRYKA WERDYKTU (R13; `gate-manifest.json` → `sekcja_typy`, `layout_diff`):** KODOWA
  (wideo/porownanie/faq/opinie/zamow/zaufanie/galeria) vs SCENOWA (hero/problem/demo/final/korzysci).
  Werdykt w DOPASOWANIE.md = **5×T/N + WERDYKT** (TAK bez 5×T=FAIL; frazy-wytrychy `bez wpływu`/`pomijalne`/
  `świadoma`/`reflow` w KODOWEJ=FAIL). **Trzy siatki obrony, nie jedna: twarde LAYOUT = DOM self-checki
  mierzone w SAMYM renderze (sliver + pustka-pod-obrazem + gutter-asym/scena-zła-strona — `layout_diff.progi`
  `pustka_*`/`gutter_*`); IR-compare (wysokość/guttery/obraz) i raw-SSIM = INFORMACYJNE ('info:', szum makiet
  AI — mockup-ir/OCR na pastelach zawodny, SSIM real-vs-AI nie dyskryminuje); rubryka vision = TRZECIA siatka,
  NIE jedyna.** DOM self-checki nie wymagają IR (18.07: FAIL Odpalak wideo+zamów+hero+final, PASS Drapek+Loczek).
  `gate-check.py` egzekwuje rubrykę + LAYOUT + IR komplet.

### Fabryka → panel `/tn-sklepy`: MOST `panel-sync.py`
- **Na końcu KAŻDEJ fazy sync do panelu** (`scripts/mockup-tools/panel-sync.py`; kontrakt+mapa
  `docs/zbuduje/MOST-PANEL.md`, skrót w STANDARD §1-sync): faza→krok (`lp_dane/lp_plan/lp_styl_marka/
  lp_makiety🏁/lp_grafiki/lp_kod/lp_dopasowanie/lp_zycie/lp_finisz🏁`) status=done + fields + checklista
  **VERBATIM** z obiektu `WS` w `tn-sklepy/projekt.html` (panel merguje po dokładnym `t` = literówka daje sierotę) + artefakty (`wf2_artifacts`).
- **Ceny/koszt/marża/status/slug/repo_path = KOLUMNY produktu** przez `product_meta` (whitelista; `unit_profit`
  GENERATED — nie pisać), NIE `data.fields`. Makiety/branding rehost → `bud-assets/<slug>/…` (WebP) = miniatury; lokalne `.md` z `storage='desktop'` = chip. Idempotentne (GET→PATCH|POST; wiązanie = `product_id`+`step_key`).
- Funkcje/CLI: `link_product · step_update · artifact_add · product_meta · project_link_add · storage_upload`.

## TN App — workflow budowy aplikacji SaaS (po pełnej płatności /aplikacja)

**Osobna aplikacja** (`tn-app/index.html` lista + `tn-app/projekt.html`), LIVE:
`crm.tomekniedzwiecki.pl/tn-app/index`. **Przeczytaj PRZED pracą:**
`docs/stworze/WORKFLOW-APLIKACJE-PLAN.md` (sekcja „STAN WDROŻENIA" = prawda).

- Tabele `wfa_*`: projects (slug/domain/repo/vercel/supabase_ref/stripe_account_id/`fee_percent`),
  step_defs (**kroki = konfiguracja + `milestone_label`** = kamień milowy portalu klienta), steps
  (jedyne źródło postępu), notes (uwagi Tomka — wejście do paczek promptów), activities.
  RLS wyłącznie `team_members`. BEZ macierzy produktów (1 projekt = 1 aplikacja).
- Etapy 1–5: Fundament (handoff→MVP→nazwa+domena→akcept) → Infrastruktura (repo/Supabase/Resend/Stripe KYC)
  → Budowa MVP (paczka Claude Code→DB→auth→funkcja→panele→płatności→maile) → Landing i jakość (audyt = gate)
  → Start (prawne→onboarding→start→50 klientów→stery).
- Auto-create projektu: RPC `wfa_sync_projects()` przy load panelu (spar_sessions z `full_paid_at`,
  `is_test=false`) — celowo ZERO zmian w tpay-webhook/spar-chat.
- Stripe Connect: Standard + direct charges + application_fee (% z `wfa_projects.fee_percent`);
  aktywacja platformy: `docs/stworze/STRIPE-CONNECT-SETUP.md`.
- Styl = Geist/Vercel (jak tn-sklepy). Slug `/tn-app` NIE koliduje z `/tn-aplikacje` (panel lejka!).
- GOTCHA: teksty checklist w obiekcie `WS` (projekt.html) = klucz deduplikacji ze stanem — nie przeredagowywać.
  Jeśli MUSISZ zmienić teksty pozycji: w TEJ SAMEJ sesji zmigruj `wfa_steps.data->checklist` każdego kroku,
  który ma już zapisany stan (nadpisz nowymi tekstami z faktycznym done) — inaczej panel pokaże sieroty:
  stare pozycje odhaczone + nowe puste (2× incydent 12.07 przy krokach `nazwa` i `repo_vercel`).

### Moduł „Skrzynki" (`/tn-app/skrzynki`) — poczta przychodząca domen aplikacji
Centralny odbiór maili WSZYSTKICH domen aplikacji: MX apeksu → **Resend Inbound** → webhook
`wfa-inbox-webhook` (--no-verify-jwt; svix sekret `RESEND_WEBHOOK_SECRET_INBOX`) → tabela `wfa_inbox`
(match projektu po domenie z `to`; RLS team_members) → panel `tn-app/skrzynki.html` + auto-forward
na `wfa_projects.inbox_forward_to` (toggle `inbox_enabled`; reply_to=nadawca, loop-guard nagłówkiem
`X-TN-Inbox-Forward`). Odpowiedzi z panelu: `wfa-inbox-api` (verify_jwt, gate team_members; reply
w wątku przez In-Reply-To; załączniki przez krótkotrwały download_url — 1 h).
- **Webhook email.received jest GLOBALNY** (1 na konto Resend, id 55eaeccf…) — nowa aplikacja NIE tworzy
  webhooka; wystarczy: `PATCH /domains/{id}` `capabilities.receiving=enabled` → GET domain → rekord
  „Receiving MX" → `vercel dns add <domena> '' MX <wartość> <prio>` → verify → ustaw `inbox_forward_to`.
- Treść maila NIE przychodzi w webhooku — jest dociągana z `GET /emails/receiving/{id}`
  (html bywa `data_uri` — webhook dekoduje przy zapisie). Inbound zużywa limit maili Resend 1:1.
- **Maile DO partnerów (operatorów)**: wysyłka BEZPOŚREDNIA przez `wfa-partner-mail`
  ({project_id, subject, body_text, kind}; service key = actor 'auto', team JWT = 'admin';
  from/reply-to z `settings` jak send-email) → rejestr `wfa_outbox`, widok Skrzynki → strumień
  „Partnerzy" (+ przycisk „Napisz do partnera"). NIE robić draftów Gmail dla partnerów TN App
  (decyzja Tomka 13.07); drafty zostają dla klientów sklepów/CRM. GOTCHA gate: service key
  występuje jako legacy JWT LUB sb_secret_* (kilka aktywnych) — funkcja akceptuje env
  SERVICE_ROLE_KEY + wartości z SUPABASE_SECRET_KEYS + claim role=service_role.

### Sekcja „Do uzupełnienia" (intake) w portalu klienta
Portal (`tn-app/portal.html`) pokazuje od pierwszego dnia 4 karty, każda zapisywana OSOBNO od razu
(bez „wyślij wszystko"): **Dane firmy** (SSOT = `wfa_projects.contract_fields`, współdzielone z flow umowy —
NIE dubluj), **Materiały** (upload plików + linki + notatka), **Stripe** (status KYC/BLIK + stały link
`wfa-stripe-onboard`), **Beta** (5–10 osób). Tabele `wfa_intake` (materialy/beta) + `wfa_intake_files`,
bucket **`wfa-intake`** (PRIVATE — dostęp tylko service-role z edge + signed URLs). Wszystko przez
`wfa-portal` (token+hasło klienta): akcje `intake_get/intake_save/intake_upload_init/_done/intake_file_delete`;
`intake_admin` = panel (`tn-app/projekt.html` zakładka „Dane od klienta", gate = team JWT, read-only, signed URLs 1 h).
Pierwsza zawartość materiałów odhacza „Dane otrzymane" w kroku `dane_operatora` (VERBATIM z WS). **Podgląd admina
„oczami klienta" = READ-ONLY**: zapisy intake zwracają 403 `{error:'podgląd — tylko odczyt'}`. RLS `wfa_intake*`
= wyłącznie `team_members` (ZERO anon). Migracja: `20260713c_wfa_intake.sql`.

### Moduł „Testy klienta" (spowiednik testów) — krok `testy_klienta`
Standard fabryki (decyzja Tomka 15.07). Klient-operator w SWOIM portalu rozmawia z AI o uwagach do
aplikacji, dokleja ZRZUTY EKRANU (vision — AI je ogląda), a AI składa z rozmowy ustrukturyzowane
zgłoszenia (`wfa_test_issues`, seq/projekt). Tomek w panelu (`tn-app/projekt.html`, krok `testy_klienta`)
edytuje wagę, ZATWIERDZA/ODRZUCA (komentarz wraca do klienta) i „Zleca pracę nad zatwierdzonymi" →
`[TK-n]` do checklisty kroku `poprawki_demo` + prompt sesji naprawczej (`done` → klient widzi ✅).
Edge **`wfa-test-chat`** (`--no-verify-jwt`; akcje history/message/upload_init/_done/end + `test_admin`
gate=team JWT; model `WFA_TEST_OPENAI_MODEL` default `gpt-4o`; marker `<zgloszenie>`; kill-switch
`settings.wfa_test_chat_enabled` FAIL-OPEN). Tabele `wfa_test_*` + kolumna `wfa_projects.test_context`
+ bucket **`wfa-test-shots` (PRIVATE)**, RLS wyłącznie `team_members`. Migracja `20260715c_wfa_testy_klienta.sql`.
Karta „Testy aplikacji" w portalu widoczna gdy krok `testy_klienta` ma status `in_progress`/`done`.
Koncept (SSOT): `docs/stworze/MODUL-TESTY-KLIENTA.md`.

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
