# WORKFLOW APLIKACJE (wfa) — plan i źródło prawdy

> Moduł prowadzenia budowy aplikacji SaaS po pełnej płatności z lejka /aplikacja (sparing → spowiednik → budowa).
> Wzorzec architektoniczny: Workflow v2 „Sklepy" (`docs/zbuduje/WORKFLOW-V2-PLAN.md`) — świadomy FORK, nie generalizacja.
> Sekcja „STAN WDROŻENIA" na końcu = prawda o tym, co faktycznie działa.

---

## 1. Kontekst biznesowy (skrót — SSOT oferty: `settings.aplikacja_model_biznesowy`)

- Klient płaci **12 500 zł netto** (rezerwacja 500 zł wliczona) za wspólną budowę aplikacji webowej (PWA).
- Tomek pobiera **% od przychodu** aplikacji (rev-share, domyślnie 10%, konfigurowalny per projekt — `wfa_projects.fee_percent`), bezterminowo.
- Klient = **OPERATOR** (merchant of record, jego marka, jego Stripe). Tomek buduje i rozkręca do **50 klientów**, potem przekazuje stery.
- Każda aplikacja: **jedna nisza, jeden główny problem, najszybszy możliwy go-to-market**. Zakaz przekombinowania.
- Harmonogram z umowy: zwykle 4–8 tygodni; gwarancja 30 dni na błędy. Hosting: 12 mies. po stronie Tomka, potem 90/10.

## 2. Skąd bierzemy dane wejściowe (system spar_*)

Po pełnej płatności (`spar_sessions.full_paid_at`) mamy dla sesji:

| Dane | Gdzie |
|---|---|
| Transkrypcja sparingu | `spar_messages` (po `session_id`) |
| Karta projektu / ustalenia | `spar_sessions.problem_summary`, `preview_brief` |
| Makiety (panel, główna, landing…) | `spar_sessions.preview_images` (JSON) → Storage `attachments/spar/<sid>/podglad-*.png` |
| Raport / plan / ekonomika / GTM | `spar_sessions.market_report / business_plan / economics / gtm` |
| Baza wiedzy spowiednika | `spar_knowhow_items` (kind/scope/source_tag/content) |
| **Handoff pack** (12 sekcji MD, „gotowe do budowy") | `spar_knowhow_summary.handoff_pack` |

⚠️ Handoff pack generuje się TYLKO przy evencie `knowhow_close` w `spar-chat`. Workflow NIE zakłada, że istnieje —
krok `handoff` w Etapie 1 obejmuje wymuszenie generacji / złożenie pakietu z surowych `spar_knowhow_items`.

## 3. Architektura modułu

### 3.1. Tabele `wfa_*` (migracja `20260711_wfa_foundation.sql`)

- **`wfa_projects`** — projekt = jedna aplikacja. Spięcie: `spar_session_id` (UNIQUE), `lead_id`.
  Pola SaaS: `slug` (kebab; nazwa repo = projekt Vercel = ref supabase = domena), `domain`, `app_url`, `landing_url`,
  `repo_url`, `vercel_project`, `supabase_ref`, `stripe_account_id` (konto klienta), `fee_percent` (default 10).
  Portal klienta: `unique_token`, `client_password_hash`.
- **`wfa_step_defs`** — definicje kroków = KONFIGURACJA. Nowy krok = 1 INSERT, zero zmian frontu.
  Kolumny jak wf2 + **`milestone_label`** — jeśli ustawione, ukończenie kroku = kamień milowy widoczny w portalu klienta.
  Brak `scope` (aplikacja = jedna encja; nie ma macierzy produktów jak w wf2).
- **`wfa_steps`** — instancje kroków, **JEDYNE źródło postępu**. UNIQUE(project_id, step_key).
  Postęp = `done / (all − skipped)`; „aktualny krok" = pierwszy nie-done/nie-skipped wg `stage→sort`.
  ZAKAZ pól typu `current_milestone_index` (lekcja z v1 — `feedback-workflow-progress-tracking`).
- **`wfa_notes`** — uwagi Tomka per projekt (kind: uwaga/decyzja/blokada; status open/done).
  To pierwszoklasowe wejście do paczek promptów — generator paczki wstrzykuje otwarte uwagi do kontekstu.
- **`wfa_activities`** — log.

### 3.2. Funkcje SQL

- `wfa_ensure_steps(p_project)` — SECURITY DEFINER; dosiewa brakujące instancje (nowe defs). Wołana przy load panelu.
- `wfa_sync_projects()` — SECURITY DEFINER; tworzy `wfa_projects` dla każdej `spar_sessions` z `full_paid_at IS NOT NULL
  AND is_test=false` bez projektu. Wołana przy load panelu → **zero zmian w `tpay-webhook` / `spar-chat`** (celowo:
  NIE PSUJ TPAY; brak sprzężenia z mózgiem sparingu). Projekt pojawia się w panelu najpóźniej przy pierwszym otwarciu.

### 3.3. RLS

Wszystkie `wfa_*`: wyłącznie `team_members` (wzorzec wf2). **ZERO polityk anon/authenticated USING(true).**
Portal klienta (F3) pójdzie przez edge function `wfa-portal` (token + hasło), NIE przez anon RLS.

### 3.4. Panel `/tn-app` (fork `tn-sklepy`, styl Geist/Vercel twardo)

- `tn-app/index.html` — lista projektów: chipy kroków z licznikami „ile projektów czeka na kroku", filtr, podgląd.
- `tn-app/projekt.html` — ekran projektu: pigułki etapów, karty kroków, **warsztat kroku** (drawer; obiekt `WS`:
  desc/check/fields z bindingiem `col:'project.domain'` lub do `steps.data.fields`), sekcja **Uwagi Tomka** (`wfa_notes`),
  podgląd handoff packu + bazy wiedzy + makiet (ze `spar_*`), **generator promptów dla Claude Code** per krok.
- Rejestracja: `components/shared-sidebar.js` (apka „TN App"; w `detectCurrentApp` prefiks `/tn-app` NIE koliduje
  z `/tn-aplikacje` — brak wspólnego podciągu, ale sprawdzać dłuższe prefiksy pierwsze), rewrites w `vercel.json`.
- GOTCHA warsztatu (z wf2): teksty pozycji checklist = klucz deduplikacji ze stanem `data.checklist` — po wdrożeniu NIE przeredagowywać.

### 3.5. Portal klienta — kamienie milowe (F3)

Klient widzi TYLKO: nazwę aplikacji, pasek postępu (procent z kroków), listę **kamieni milowych**
(kroki z `milestone_label` + daty ukończenia) i „co się teraz dzieje" (etap bieżący, bez pojedynczych kroków).
Serwowane przez edge function `wfa-portal` (weryfikacja `unique_token` + hasło), strona `partner-app.html`.
Kamienie = konfiguracja (kolumna w `step_defs`), nie osobna tabela.

## 4. Etapy i kroki (seed `wfa_step_defs`)

Decyzja Tomka (2026-07-11): **nazwa + domena = Etap 1**, bo nazwa projektu determinuje repo/Vercel/Supabase/domenę —
infrastruktura rusza dopiero po zatwierdzeniu nazwy.

| # | Etap | Krok (key) | Owner | Kamień milowy |
|---|---|---|---|---|
| 1 | Fundament | `handoff` Handoff pack | admin | |
| 1 | Fundament | `zalaczniki` Materiały klienta | client | |
| 1 | Fundament | `uwagi_tomka` Uwagi Tomka | admin | |
| 1 | Fundament | `mvp_scope` Definicja MVP | admin | |
| 1 | Fundament | `nazwa` Nazwa aplikacji | admin | |
| 1 | Fundament | `domena` Domena (zakup: Tomek) | admin | |
| 1 | Fundament | `akcept_klienta` Akcept: MVP + nazwa | client | ✅ „Zakres i nazwa aplikacji zatwierdzone" |
| 2 | Infrastruktura | `repo_vercel` Repo + Vercel | admin | |
| 2 | Infrastruktura | `supabase_proj` Projekt Supabase (EU) | admin | |
| 2 | Infrastruktura | `resend_dns` Resend + DNS e-mail (SPF/DKIM/DMARC) | admin | |
| 2 | Infrastruktura | `stripe_kyc` Stripe klienta (KYC) | client | |
| 2 | Infrastruktura | `stripe_plany` Stripe: plany + % platformy | admin | |
| 2 | Infrastruktura | `env_secrets` Env + sekrety | admin | ✅ „Infrastruktura gotowa" |
| 3 | Budowa MVP | `paczka_cc` Paczka dla Claude Code | admin | |
| 3 | Budowa MVP | `schemat_db` Schemat DB + RLS | admin | |
| 3 | Budowa MVP | `auth_konta` Auth + konta userów | admin | |
| 3 | Budowa MVP | `funkcja_glowna` Funkcja główna | admin | |
| 3 | Budowa MVP | `panel_usera` Panel użytkownika | admin | |
| 3 | Budowa MVP | `panel_operatora` Panel operatora | admin | |
| 3 | Budowa MVP | `platnosci_e2e` Płatności Stripe E2E | admin | |
| 3 | Budowa MVP | `maile_trans` E-maile transakcyjne | admin | ✅ „Aplikacja działa (wersja robocza)" |
| 4 | Landing i jakość | `landing` Landing + cennik | admin | |
| 4 | Landing i jakość | `testy_e2e` Testy przepływów | admin | |
| 4 | Landing i jakość | `audyt` Audyt bezpieczeństwa | admin | |
| 4 | Landing i jakość | `poprawki` Poprawki po audycie | admin | ✅ „Aplikacja przeszła audyt bezpieczeństwa" |
| 5 | Start | `prawne` Regulamin + RODO + DPA | admin | |
| 5 | Start | `onboarding_op` Wdrożenie operatora | client | |
| 5 | Start | `start_live` START aplikacji | admin | ✅ „Aplikacja wystartowała" |
| 5 | Start | `gtm_50` Droga do 50 klientów | admin | |
| 5 | Start | `stery` Przekazanie sterów | admin | ✅ „Stery przekazane operatorowi" |

> **ZMIANY KROKÓW v3 (11.07 wieczór, feedback Tomka z panelu; tabela wyżej = stan historyczny):**
> OUT: `zalaczniki` (materiały zbiera SPOWIEDNIK; dane domenowe → `dane_operatora`), `akcept_klienta`
> (klient ocenia GOTOWE MVP przy `demo_klienta`; zakres wiąże Załącznik 1 umowy), osobna `domena`.
> SCALONE: `nazwa` = „Nazwa i domena" (kamień „Nazwa i domena wybrane") — sesja proponuje 10 nazw
> z WOLNYMI .pl (RDAP, fallback WHOIS), wybór w rozmowie, sesja zapisuje name/slug/domain; Tomkowi
> zostaje zakup + DNS. NOWY E3: `design` (sort 17) — brief z makiet+specu → **Claude Design** →
> 04-STYLEGUIDE + tokeny CSS w repo. `pricing` = sesja z 2 agentami researchu (Opus), iteracja
> w rozmowie, zapis finalnych planów w kroku. Razem: 34 kroki.

## 5. Stripe Connect — architektura płatności każdej aplikacji

Decyzje Tomka (2026-07-11): model zaakceptowany; aktywację Connect robi sam wg `docs/stworze/STRIPE-CONNECT-SETUP.md`;
prowizję Stripe ponosi klient (zapis do umowy).

- Konto Tomka = **platforma Stripe Connect**. Klient = **Standard connected account** (self-onboarding, własne KYC,
  własny dashboard, merchant of record).
- Płatności userów aplikacji = **direct charges** na koncie klienta (nagłówek `Stripe-Account: acct_…`).
- % Tomka: subskrypcje → `application_fee_percent` na Subscription; jednorazowe → `application_fee_amount`
  (kwota liczona serwerowo: `round(amount * fee_percent/100)`). Wartość z `wfa_projects.fee_percent` → env aplikacji.
- Prowizja Stripe obciąża konto klienta; Tomek dostaje czysty % (widoczny zbiorczo: Dashboard → Connect → Application fees).
- BLIK: capability `blik` włączona na platformie ORAZ na koncie klienta (krok w onboardingu).
- Edge functions per aplikacja: `stripe-onboard` (Account Link), `stripe-checkout`, `stripe-webhook`
  (sygnatura obowiązkowa + idempotencja po `event.id` w tabeli `stripe_events`; deploy `--no-verify-jwt`).

## 6. Starter aplikacji (fabryka) — F2

- **Stack per aplikacja (twardo):** statyczny HTML + vanilla JS + Supabase Edge Functions + Vercel. BEZ frameworków SSR.
  Osobne repo + osobny projekt Supabase (EU) + osobny projekt Vercel per aplikacja. Deploy = git push main.
- **Repo `saas-starter`** — szkielet generowany skryptem forge (ZAKAZ `cp -r`): landing+cennik, auth (email+hasło,
  Confirm OFF), panel usera, panel operatora, edge fns Stripe, helper Resend, migracja bazowa z RLS, `CLAUDE.md`, `.env.example`.
- **Design per aplikacja:** makiety ze sparingu (`preview_images`) = inspiracja + tokeny; ZAKAZ katalogu skórek
  (`projekt-stworze-design-per-projekt`).
- **E-maile:** auth-maile (reset hasła) → Supabase Auth SMTP = Resend SMTP (`smtp.resend.com`, user `resend`,
  pass = API key; default Supabase 2 maile/h — custom SMTP OBOWIĄZKOWY). Transakcyjne/produktowe → Resend API z edge fns.
  Tracking otwarć OFF; logika na `delivered_at`. Followupy: na starcie tylko tabele `email_log` + hook point, dripy później.

### 6.1. Paczka startowa dla Claude Code (generowana w kroku `paczka_cc`)

Katalog `apka-<slug>-brief/`:

```
00-KONTEKST-BIZNESOWY.md   ← wyciąg: handoff pack + uwagi Tomka (wfa_notes open) + nisza/operator/fee
01-MVP-SCOPE.md            ← co JEST (3–5 funkcji), co NIE JEST; kryteria „gotowe"; twarda granica scope
02-SPEC-FUNKCJONALNY.md    ← ekrany, user stories, flow user + flow operator
03-SCHEMAT-DB.sql          ← tabele + RLS gotowe do apply_migration
04-STYLEGUIDE.md           ← tokeny z makiet sparingu; 1 kierunek
05-STRIPE-CONFIG.md        ← plany/ceny, fee_percent, subskrypcja vs jednorazowe
06-CLAUDE.md               ← wklejany jako CLAUDE.md apki (szablon w starterze)
07-DEPLOY-RUNBOOK.md       ← kolejność: Supabase → migracja → Vercel → Resend → Stripe → smoke test
```

Zasada: Claude Code IMPLEMENTUJE, nie wymyśla — schemat DB i scope są w paczce. Prompty per krok generuje
warsztat kroku w panelu (wzorzec `sdCopyPrompt` z wf2).

## 7. Checklist audytu bezpieczeństwa (krok `audyt` — obowiązkowy gate przed startem)

```
RLS / IZOLACJA
[ ] RLS ENABLED na KAŻDEJ tabeli; zero authenticated/anon USING(true)
[ ] Polityki per auth.uid() (SELECT/INSERT/UPDATE/DELETE osobno)
[ ] Operator widzi tylko dane swojej instancji; agregaty przez edge fn (service-role), nie z frontu
[ ] Triggery liczące (COUNT/MAX) = SECURITY DEFINER
[ ] Test kluczem ANON: czy przecieka cudze konto?
SEKRETY
[ ] service_role nigdy we froncie/repo; front tylko sb_publishable_*; legacy keys OFF
[ ] Sekrety Stripe/Resend tylko w env edge functions
WEBHOOKI
[ ] stripe-webhook: constructEvent z STRIPE_WEBHOOK_SECRET; idempotencja po event.id
[ ] deploy --no-verify-jwt ALE sygnatura obowiązkowa
INPUT / XSS
[ ] zero innerHTML z danymi usera (textContent/sanityzacja); walidacja wejścia w edge fn
[ ] literal </script> w stringach splitowany; polskie znaki w regex escapowane
NADUŻYCIA
[ ] rate limiting na publicznych edge fns (checkout/onboard/rejestracja/reset)
[ ] kwoty/ceny liczone SERWEROWO, nigdy z frontu
DEPLOY
[ ] migracja PRZED pushem kodu; Confirm email OFF potwierdzone; Resend DNS zielony
```

> ⚠️ 2026-07-11: propozycja autonomizacji flow + rewizja krytyczna (2 tory, nowe kroki, bramki jakości):
> **`docs/stworze/FLOW-AUTONOMIA-PLAN.md`** — czytać razem z tym dokumentem; po decyzjach Tomka §8 poniżej
> zostanie zaktualizowane.

## 8. Fazy wdrożenia modułu

- **F1 — Fundament (panel):** migracja `wfa_*` + seed → panel `/tn-app` (index + projekt) → sidebar/rewrites →
  auto-sync projektów z `spar_sessions`. Pilot: projekty Grzegorza i Tomka J.
- **F2 — Fabryka:** repo `saas-starter` + forge + generator paczek `paczka_cc` (wstrzykiwanie handoff + wfa_notes).
- **F3 — Portal klienta:** edge fn `wfa-portal` + `partner-app.html` (kamienie milowe).
- **F4 — Automaty:** maile milestone'owe do klienta, Slack #aplikacje, sync statusu z spar (knowhow_closed → bump).

## 9. Gotchas (obowiązkowe)

- Deploy frontu tn-crm = **git push main** (NIE Vercel CLI). Migracja PRZED pushem. Bump `APP_VERSION`.
- `wfa_sync_projects` i `wfa_ensure_steps` = SECURITY DEFINER + GRANT authenticated, service_role.
- PostgREST default 1000 wierszy — `.range()` na `wfa_steps`.
- NIE dotykamy `tpay-webhook` ani `spar-chat` w F1 (sync po stronie panelu).
- Sesje testowe: zawsze filtr `is_test=false` przy syncu.
- Fakty oferty (cena/%) — NIE hardkodować w panelu; % per projekt z `wfa_projects.fee_percent`.

## 9a. Konstrukcja prawna Udziału 10% (decyzja Tomka 2026-07-11; SKORYGOWANA po researchu prawnym tego samego dnia)

Cel: „syntetyczne 10% equity" — trwałe, nienegocjowalne, zbywalne przez Tomka, komfortowe dla klienta.
Szablon: `umowy/umowa-budowa-aplikacji.html` (**v3**; wymaga przeglądu prawnika — komentarze PRAWNIK).
⚠️ Pierwotna konstrukcja licencyjna (v2) ODRZUCONA po researchu: art. 68 ust. 2 pr. aut. — licencja udzielona
na >5 lat po tym okresie traktowana jest jak bezterminowa i WYPOWIADALNA; „wieczysta nieodwołalna licencja
wyłączna" jest iluzoryczna (SA W-wa VI ACa 1735/14 dopuszcza niewypowiadalność tylko: niewyłączna + jednorazowe
wynagrodzenie + brak świadczeń ciągłych — nasze przeciwieństwo).

**Model v3 (obowiązujący):**
1. **Przeniesienie autorskich praw majątkowych z chwilą zapłaty** (pola wg art. 74 ust. 4 + prawa zależne + SaaS/sieć)
   — klient ma pełną własność kodu od dnia 1 (zgodnie z pierwotną obietnicą oferty!). Forma pisemna / podpis
   KWALIFIKOWANY (ad solemnitatem).
2. **Udział 10% = odrębna wierzytelność**: część CENY za przeniesienie praw i rozruch, rozłożona w czasie, zależna
   od Przychodu (brutto minus zwroty/chargebacki) — celowo NIE tantiema licencyjna i NIE zapłata za serwis
   (mitygacja art. 365¹: wynagrodzenie za świadczenie już wykonane). Serwis (§6: płatności, aktualizacje
   bezpieczeństwa, doradztwo) = świadczenie ODRĘBNE; jego ustanie nie gasi Udziału. Rozliczenie miesięczne,
   faktura zbiorcza netto+VAT (moment VAT przy application fee → interpretacja KIS do rozważenia).
3. **Pobór**: Stripe application fee jako TECHNIKA zapłaty (nie jedyne źródło roszczenia) + obowiązek utrzymania
   konfiguracji + zapłata przelewem na fakturę, gdy pobór niemożliwy + wgląd read-only w dane sprzedażowe.
4. **Wykup**: po 12 mies., 36× średnia miesięczna z 12 mies.; wygasza Udział i serwis.
5. **Sprzedaż biznesu**: przejęcie długu przez nabywcę (519 k.c., forma pisemna, zgoda Tomka nie odmówiona bez
   ważnego powodu) ALBO wykup; obejście = KARA UMOWNA = cena wykupu (oznaczona, miarkowalna — nie „cały przyszły udział").
6. **Anty-klon jako KONTYNUACJA, nie zakaz** (zakaz konkurencji bez ekwiwalentu grozi nieważnością — III CKN 579/01):
   apka rozwiązująca ten sam główny problem tej samej grupy odbiorców (definicja z Załącznika 1) = kontynuacja,
   Udział nalicza się; okres: Udział + 3 lata po ustaniu z naruszenia.
7. **Cesja** wierzytelności (w tym przyszłych) bez zgody klienta, ze zgodą wpisaną w umowę → portfel = aktywo.
8. **Konsument-lite** (klient-JDG może być „na prawach konsumenta"): pouczenie o odstąpieniu 14 dni + żądanie
   rozpoczęcia prac przed upływem (art. 38 u.p.k.), klauzule §5/§8/§9 indywidualnie uzgodnione, sąd wg przepisów
   ogólnych, symetryczna odpowiedzialność.

**Pytania otwarte dla prawnika (research nie rozstrzyga):** czy art. 68 ust. 2 stosuje się do licencji na programy
(art. 74-77 lex specialis) — nieistotne w modelu przeniesienia, ale ważne dla oceny; skuteczność oderwania Udziału
od 365¹; status „na prawach konsumenta" klienta kupującego narzędzie do zarabiania; kara umowna vs miarkowanie;
moment VAT przy application fee (KIS); Standard vs Express w kontekście ryzyka odłączenia platformy przez klienta.

✅ Komunikat oferty w lejku ZAKTUALIZOWANY 11.07 wg protokołu 6 kroków (FAQ-kanon, `aplikacja_model_biznesowy`,
prompt czatu ×3, front ×2 pliki; backupy `_backup_20260711`): „kod i pełna własność z chwilą opłacenia budowy
(przeniesienie praw autorskich w umowie) + udział 10% jako osobne wynagrodzenie z opcją wykupu po 12 mies.".

## 10. Decyzje Tomka (log)

- 2026-07-11: slug panelu = **/tn-app**; Stripe Standard+direct+application_fee zaakceptowane (aktywacja: Tomek wg
  instrukcji); prowizja Stripe po stronie klienta (→ umowa); handoff Grzegorza generujemy od razu po stronie zespołu;
  nazwa+domena przeniesione do Etapu 1; domeny kupuje Tomek (krok `domena` = blocked until Tomek).

---

## STAN WDROŻENIA (aktualizować przy każdej zmianie!)

- [x] Plan (ten dokument) — 2026-07-11
- [x] Migracja `20260711_wfa_foundation.sql` zaaplikowana (tabele + RLS + funkcje + seed 30 kroków) — 2026-07-11
- [x] Panel `tn-app/index.html` + `tn-app/projekt.html` (lista, ekran projektu, warsztaty WS 30 kroków,
      uwagi Tomka, dane ze sparingu, generator promptów Claude Code, kamienie milowe) — 2026-07-11
- [x] Sidebar (`TN App`) + rewrites `/tn-app` — 2026-07-11
- [x] Projekty pilotażowe: Grzegorz Pełka („Oferta Instalatora"), Tomek Jankowiak (auto-sync) — 2026-07-11
- [x] Handoff pack Grzegorza wygenerowany ręcznie z pełnej bazy 156 itemów (auto-generator ucina do 8000 zn.);
      `knowhow_closed_at` ustawiony po stronie zespołu — 2026-07-11
- [x] `docs/stworze/STRIPE-CONNECT-SETUP.md` (instrukcja dla Tomka) — 2026-07-11; aktywacja Connect: CZEKA na Tomka
- [x] `docs/stworze/METODYKA-BUDOWY.md` (spec-driven: BUILDLOG, 08-PLAN-SESJI, rytuał sesji, review adwersarski,
      bramki człowieka) — 2026-07-11
- [x] Migracja `20260711b_wfa_flow_v2.sql`: `deadline_at` + 6 nowych kroków (pricing, dane_operatora,
      review_adwersarski, demo_klienta, poprawki_demo, monthly) → 36 kroków; terminy wstępne pilotów ustawione — 2026-07-11
- [x] Panel v2: warsztaty wg metodyki (wzmocnione checklisty/desc), prompty z rytuałem sesji + 6 nowych promptów,
      badge terminu (żółty <14 dni, czerwony <7) — 2026-07-11
- [x] **`c:\repos_tn\saas-starter`** (osobne repo, git init): `forge.mjs <slug> "<Nazwa>" <dir>` + `template/`
      (CLAUDE.md z Boundaries, BUILDLOG, brief 00-08, public: landing/auth/app/admin, migracja foundation
      z RLS + is_operator() + inbox stripe_events + email_log, edge fns: stripe-onboard/checkout/webhook/
      processor + lifecycle-emails + admin-stats, Playwright, legal szablony PL). Znane TODO: linki legal
      w stopce, amount jednorazowych z Price/DB, 0002_cron do włączenia per apka — 2026-07-11
- [ ] F2 fabryka (saas-starter + paczki) — NIE ZACZĘTE
- [x] **F3 portal klienta — LIVE** 2026-07-11: edge fn `wfa-portal` (token 32-hex + hasło SHA-256 w
      `client_password_hash`; hasło nieustawione = portal wyłączony; zwraca TYLKO postęp/etapy/kamienie/termin)
      + strona `/twoja-aplikacja?t=<token>` (`tn-app/portal.html`) + panel: Ustawienia → hasło portalu + kopiuj link.
      Przetestowane E2E; hasła klientom ustawia Tomek, gdy zdecyduje się udostępnić.
- [x] Hardening po advisors (migracja `20260711c`): REVOKE anon/PUBLIC z funkcji SECURITY DEFINER + wewnętrzny
      gate team_members (service-role przechodzi); search_path w wfa_touch_updated_at — 2026-07-11
- [x] Panel: wskaźnik „u klienta od X dni" na krokach klienckich (>5 dni = followup), transkrypcja rozmowy
      sparingu w projekcie (na żądanie) — 2026-07-11
- [x] Starter: `scripts/audit-static.mjs` — automatyczny gate (sekrety/XSS/USING(true)/service_role we froncie) — 2026-07-11
- [x] **Mechanizm umowy** (odwzorowanie tn-crm v1; migracja `20260711d`): kolumny `contract_*` na wfa_projects,
      krok `umowa` (E1, kamień „Umowa podpisana"); wfa-portal: contract_meta/contract_data/contract_html (render
      W LOCIE, wykonawca z `settings.aplikacja_wykonawca_dane` — zasiane); portal: formularz danych → pobranie +
      instrukcja podpisu (FORMA PISEMNA — wydruk/kwalifikowany, wniosek z researchu) → finalna do pobrania;
      panel: karta Umowa (dane, podgląd, edycja HTML Z WALIDACJĄ placeholderów — guard na bug „baked placeholders",
      oznacz wysłaną, uploady klient/finalna → `attachments/wfa/<id>/`, auto-done kroku). E2E przetestowane — 2026-07-11
- [ ] F4 automaty — NIE ZACZĘTE
