# APLIKACJA (sparing) — mapa systemu i kontrola

**Status:** ŹRÓDŁO PRAWDY o ARCHITEKTURZE lejka Aplikacja. Aktualizuj przy każdej zmianie strukturalnej.
**Data audytu:** 2026-06-20. (Poprzedni `PLAN-PRODUKCYJNY.md` z 13.06 usunięty — opisywał wycofany model 50/50; historia decyzji w pamięci `projekt-stworze-koncepcja`.)
**Relacje (NIE duplikuj — linkuj):**
- Fakty/liczby oferty → `data-private/aplikacja-faq-klienci.md` (+ blok DB `settings.aplikacja_model_biznesowy`).
- Operacje (cennik, secrets, OAuth, sesje testowe) → `RUNBOOK.md`.
- Ten plik = etapy, komponenty, routing, dane, protokół zmian, backlog.

---

## 1. Lejek = maszyna 4 stanów (`state.stage`)

User przechodzi etapy; etap jest **wyliczany z flag serwerowych**, nie trzymany jako kolumna. Kaskada (sparing `syncProjectFromServer`, ~l. 5849):

| Etap | Wyzwalacz (flaga) | Cel | Płatność |
|---|---|---|---|
| **1. Rozmowa o pomyśle** | `verdict` ≠ zielony (lub null) | 6 KAMIENI → karta projektu + ekrany + bramka potencjału → **zielony werdykt** | — |
| **2. Współpraca + rezerwacja** | `verdict='zielony'` → `stage='rezerwacja'` | wyjaśnić model, przełamać obiekcje, **rezerwacja 500 zł** | 500 zł (oferta `a1656695…`) |
| **3. Spowiednik / know-how** | `full_paid_at` → `stage='knowhow'` | „niewidoczna inżynieria wymagań" — zbiórka know-how do `spar_knowhow_items` | **pełna płatność budowy** (tpay desc „budowa aplikacji") |
| **4. Budowa (handoff)** | `knowhow_closed_at` → `stage='build'` | komplet zebrany → `spar_knowhow_summary` handoff_pack dla Tomka/zespołu | — |

> **GAP między etapem 2 a 3:** po rezerwacji 500 zł Tomek odzywa się osobiście → plan → umowa → **pełna płatność budowy** (to ona, nie 500 zł, odpala spowiednika przez `tpay-webhook`). Etap 3 = „opłacony projekt" = po pełnej płatności.

---

## 2. Komponenty per etap

### Etap 1 — Rozmowa
- **`spar-chat`** (mózg, 1714 l.) — streaming czat; model `SPAR_OPENAI_MODEL`→`gpt-5.1`; prompt `settings.stworze_sparing_prompt`. Obsługuje WSZYSTKIE etapy (mechaniki w kodzie: GATE, KIERUNKI, PREVIEW_AFTER_GATE, COLLAB_PHASE, RESIGNATION, KNOWHOW_*). Zapisuje `spar_messages`, `spar_usage`, większość kolumn `spar_sessions`.
- **`spar-assess`** — bramka potencjału (Responses API + web_search), structured verdict; model `SPAR_ASSESS_MODEL`→`gpt-5.5`. WEWNĘTRZNY (tylko spar-chat go woła Bearer service-role).
- **`spar-image`** — 4 widoki „wow" + ekstra; `gpt-image-2`. Jedyna funkcja obrazowa z timeoutem (120 s + retry).
- Front: zakładka **Rozmowa** w `sparing/index.html`.

### Etap 2 — Współpraca + rezerwacja
- W `spar-chat`: po zielonym wstrzykiwany `COLLAB_PHASE_INSTRUCTION`; prompt sekcje `# OFERTA I WSPÓŁPRACA`, `# PRZEŁAMYWANIE OBIEKCJI`, `# FAQ OFERTY`. Marker `<makieta>` → karta rezerwacji 500 zł.
- **`spar-project`** — read-panel (karta/brief/plan/raport/economics/gtm/strona/uwagi); zapisuje `seen_landing_at`, `last_panel_at`, `panel_visits` (zasilają bramki dripu).
- **Deliverables** (gen na żądanie/drip): `spar-plan`, `spar-raport`, `spar-economics`, `spar-gtm`, `spar-landing`, `spar-prototype`.
- **`spar-drip`** (cron) + **`spar-followups`** (cron) — sekwencje maili/SMS prowadzące do rezerwacji.
- Front: zakładki **Współpraca / Plan / Rynek / Economics / GTM / Strona / Prototyp**; strona `aplikacja/wspolpraca/`; checkout + `aplikacja/regulamin/`.

### Etap 3 — Spowiednik / know-how (po pełnej płatności)
- **Brak osobnych funkcji** — żyje w `spar-chat`, gałąź `isKnowHowMode` (gdy `full_paid_at`): KNOWHOW_BASE+warianty, KNOWHOW_RESUME, KNOWHOW_EXTRACT_PROMPT, HANDOFF_PROMPT. Zapisuje `spar_knowhow_items`, `spar_knowhow_summary`.
- **Odmrażane przez `tpay-webhook`** (desc „budowa aplikacji" → `full_paid_at` + summary `status='active'`).
- Front: tryb nałożony na zakładkę Rozmowa (`.view--knowhow`); JS `buildKnowhowOpener`/`enterKnowhowChat`/`requestKnowhowNudge`/`playKnowhowIntro`/`playKnowhowOutro`/`cardBoxHTML` (sparing l. 10811–11060). Domknięcie = `event:'knowhow_close'` → `knowhow_closed_at`.

### Cross-cutting / infra
`tpay-webhook` (płatności: 500 zł→`paid_at`, budowa→`full_paid_at`; **NIE RUSZAĆ**), `lead-upsert` (lead_source='stworze'), `send-email` (Resend), `send-sms` (SMSAPI), `slack-notify` (`slack_webhook_sparing`), `spar-go` (krótki link `/p/{code}`), `spar-public-feed` (feed dla `/aplikacja`, cache 60 s), `spar-admin-settings` (edycja faktów oferty + promptu z panelu, gate team_members, auto-backup). Panel admina: `tn-crm/tn-aplikacje/` (zakładka „Źródło prawdy" = mapa etapów + edytory SSOT).

---

## 3. Routing etapu — kanoniczna definicja (UWAGA: zduplikowana)

```js
state.fullPaid = !!p.full_paid_at;
state.khClosed = !!p.knowhow_closed_at;
state.stage = state.khClosed ? 'build'
            : (state.fullPaid ? 'knowhow'
            : ((state.verdict === 'zielony' || p.verdict === 'zielony') ? 'rezerwacja' : null));
```
- Dodatkowo: `state.verdict` bramkuje WSZYSTKIE deliverables (plan/economics/gtm/strona/prototyp wymagają zielonego). `state.paid` (`paid_at`, rezerwacja) ≠ `full_paid_at`.
- ⚠️ **Ta sama reguła jest liczona NIEZALEŻNIE w panelu admina** (`tn-aplikacje` l. ~1070) — zmiana definicji etapu wymaga edycji OBU miejsc.

---

## 4. Wiedza / prompty (gdzie czego szukać)

| Co | Gdzie | Kto czyta |
|---|---|---|
| Reasoning + retoryka czatu (wszystkie etapy) | `settings.stworze_sparing_prompt` (~47k) | spar-chat |
| **Fakty/liczby oferty (SSOT)** | `settings.aplikacja_model_biznesowy` | spar-drip/economics/gtm/plan |
| Mechaniki etapów (GATE/KIERUNKI/KNOWHOW/HANDOFF…) | **w kodzie `spar-chat`** (stałe stringi) | spar-chat |
| Prompt bramki potencjału | w kodzie `spar-assess` | spar-assess |
| Prompty deliverables (plan/raport/economics/gtm/landing/prototype) | w kodzie danej funkcji | dana funkcja |
| Pełne odpowiedzi dla klientów (19 Q&A) + protokół faktów | `data-private/aplikacja-faq-klienci.md` | człowiek/Claude |

**Konflikt liczb:** wygrywa `aplikacja_model_biznesowy`. Pełny protokół propagacji faktów oferty → nagłówek `aplikacja-faq-klienci.md`.

**Edycja z panelu (2026-06-20):** zakładka „Źródło prawdy" w `tn-aplikacje` edytuje prompty z rejestru `_shared/spar-prompts.ts` przez `spar-admin-settings` (gate team_members, limity sanity, auto-backup `<key>_backup_RRRRMMDDHHMMSS`). Panel i funkcja renderują się Z REJESTRU → dodanie promptu = wpis w rejestrze + seed + odczyt w kodzie, zero zmian w panelu.

**Single-source promptów (plan F0–F5, [[aplikacja-prompty-single-source]]):** treść strojalna modelu przenoszona z kodu do `settings` (stałe USUNIĘTE; kontrakty JSON/markery zostają w kodzie). Zrobione: **F0** (rejestr + panel dynamiczny), **F1** spowiednik — 8 kluczy `aplikacja_knowhow_*` (KNOWHOW_BASE/SRC_*/RESUME/EXTRACT/HANDOFF/IDEA_SOURCE_HINT) czytane przez `spar-chat` (`ensureKnowhowPrompts`). Do zrobienia: F2 deliverables · F3 maile · F4 instrukcje etapów spar-chat (GATE/KIERUNKI/COLLAB/RESIGNATION) · F5 front + docs read-only. Migracja: `scripts/{seed,wire}-*-prompts.mjs` (fidelity 1:1).

Uwaga: to NIE zastępuje protokołu propagacji faktów — `aplikacja_model_biznesowy` (fakty) wciąż żyje też w sekcji `# FAQ OFERTY` promptu czatu i w `aplikacja-faq-klienci.md`.

---

## 5. Model danych (`spar_*`, 11 tabel)

- **`spar_sessions`** (50 kolumn) — centrum. Flagi etapu: `verdict`, `paid_at`, `full_paid_at`, `knowhow_closed_at`. Pipeline/drip: `last_user_at`, `last_panel_at`, `panel_visits`, `seen_landing_at`, `left_screen_at`, `pipeline_override`, `sequence_cancelled_at`. Treść: `preview_brief`, `preview_images`/`history`, `assessment`, `business_plan`, `market_report`, `economics`, `gtm`, `landing_url`. Higiena: `is_test`, `showcase`, `hidden_from_feed`. Kontakt/auth: `email/name/phone`, `auth_user_id/provider`, `sms_consent_at`. Dedup Slack: `slack_*_notified_at`.
- `spar_messages` (role/content/channel) · `spar_usage` (koszty: kind/model/tokeny/cost_usd) · `spar_knowhow_items` (16) + `spar_knowhow_summary` (18, handoff_pack) · `spar_reveals` (plan dripu) · `spar_emails` (idempotencja UNIQUE(session_id,kind)) · `spar_abandoned_emails` · `spar_sms` · `spar_short_links` · `spar_feedback`.

---

## 6. Crony (pg_cron)

| jobid | jobname | harmonogram | woła |
|---|---|---|---|
| 23 | spar-followups-cron | `*/30 * * * *` | `spar-followups` (abandoned/nurture_1..6/paid_welcome + sync płatności) |
| 24 | spar-drip-cron | `15,45 * * * *` | `spar-drip` (odkrywanie artefaktów + SMS reaktywacji) |

Oba: nagłówek `x-cron-secret`=`SPAR_CRON_SECRET`. Okno wysyłek 8–23 PL (sync płatności 24/7).

---

## 7. Pipeline deliverables (sekwencja odkrywania — `spar-drip`)

Tani research zawsze 0h/5h/10h: **rynek** (`spar-raport`) → **economics** → **gtm**. Drogie gated: **landing** (`spar-landing`, gate `visits2`) → **prototyp** (`spar-prototype`, gate `seen_landing`). Każdy = mail-wow GPT (`SPAR_EMAIL_MODEL`→gpt-5.1) + CTA rezerwacji. Locki: RPC `spar_claim_lock/release_lock`. Wszystko liczone w `spar_usage`.

---

## 8. Modele AI (env override → default)

`spar-chat`/know-how `gpt-5.1` · `spar-assess` `gpt-5.5` · `spar-plan` `gpt-5.1` · `spar-raport` `gpt-5.5` · `spar-economics` `gpt-5.1` · `spar-gtm` `gpt-5.5` · `spar-landing`/`spar-prototype` `gpt-5.5` · maile `gpt-5.1` · obrazy `gpt-image-2 medium`. Cennik/koszty → `RUNBOOK.md`.

---

## 9. PROTOKÓŁ ZMIAN (jak panować, nie psuć)

- **Zmiana faktu oferty** (cena/10%/hosting/gwarancja…) → idź protokołem z `aplikacja-faq-klienci.md` (6 kroków: FAQ-doc → blok DB → prompt czatu → pamięć → notatki → strony publiczne). Nigdy jedno miejsce w izolacji.
- **Zmiana promptu czatu** (`stworze_sparing_prompt`) → backup `..._backup_RRRRMMDD` PRZED UPDATE; weryfikuj `value LIKE`; czytane na żywo (bez deployu).
- **Zmiana mechaniki etapu / routingu** → edytuj `spar-chat` (logika) ORAZ sprawdź lustro w panelu `tn-aplikacje` (definicja etapu liczona 2×). Deploy `--no-verify-jwt`.
- **Zmiana modelu/limitów** → Supabase secrets (bez deployu) — patrz `RUNBOOK.md`.
- **Deploy funkcji** → `npx supabase functions deploy <f> --no-verify-jwt --project-ref yxmavwkwnfuphjqbelws --workdir c:\repos_tn\tn-crm`. Po deployu sprawdź 200.
- **Migracja schematu** → ZAWSZE przed pushem kodu czytającego nową kolumnę (inaczej PostgREST 500). Kolumny krytyczne: patrz §5.
- **Strony publiczne** (`tomekniedzwiecki.pl/aplikacja/*`) → preview przed deployem (zasada marki), commit TYLKO swoich plików (równoległe sesje), deploy = push na `main` (Vercel auto).
- **`tpay-webhook` / integracja TPay — NIE RUSZAĆ** (CLAUDE.md).

---

## 10. Backlog / ryzyka (z audytu 2026-06-20, priorytety)

**P1 — poprawność / pieniądze:**
1. `spar-project` „kolejna rozmowa": `conversations` liczy po literale `description='Aplikacja — kolejna rozmowa'`, a insert używa `offer.name` → jeśli różne, user płaci 49 zł a limit się nie zlicza. **Zweryfikować i ujednolicić.**
2. Brak timeout/retry na OpenAI w `spar-assess`, `spar-raport`, `spar-landing`, `spar-prototype` (raport: 1 call, web_search, ~$0.85, zero retry) → przejściowy 429/5xx = ciche „nie działa". Przenieść wzorzec ze `spar-image` (AbortController 120 s + retry).

**P2 — drift / spójność:**
3. Liczby oferty zahardkodowane w 4 plikach frontu (`12 500`/`10%`/`500` w wspolpraca, landing, sparing fallback `||12500`, projekt) — brak jednego źródła dla frontu. `spar-plan` nagłówek mówi „15 000" (stary). Rozważyć wstrzykiwanie z `aplikacja_model_biznesowy` lub przynajmniej spis miejsc.
4. Definicja etapu liczona 2× (front + panel) — ryzyko rozjazdu.
5. `spar-project` duplikuje owner-gate (zamiast `_shared/spar-owner.ts`) + fire-and-forget `panel_visits` (bramka dripu bywa niestemplowana).
6. `MODEL_BLOCK` jako module-level `let` — zmiana `aplikacja_model_biznesowy` nie propaguje do ciepłych kontenerów do recyklingu (minuty).

**P3 — higiena:**
7. Martwe bloki w `spar-followups` (`komplet_gotowy`/`verdict_no_payment`/`raport_ready`/`landing_ready` — wyłączone). Relikt `channel='wspolpraca'` (tryb usunięty 16.06).
8. Nieaktualne komentarze: spar-image „8 obrazów" (realnie 16), spar-public-feed „cache 10 min" (60 s), spar-plan „15 000".
9. Stare docs: `PLAN-PRODUKCYJNY.md` (model 50/50), `RUNBOOK.md` (cron jobid 22 → realnie 23/24; lista follow-upów częściowo nieaktualna).

---

### ✅ Zrobione 2026-06-20
Bug #1 (kolejna rozmowa — stała `CONVO_DESCRIPTION`) · Bug #2 (retry OpenAI w raport/landing/prototype/assess) · bezpieczeństwo bucketa `attachments` (SELECT→`team_members`) · **safety-net `full_paid_at`** (pełna płatność za budowę nadrabiana w `spar-followups`, gdy webhook nie trafi — wcześniej płacący ~12k mógł utknąć bez odmrożenia spowiednika) · sprzątnięty `c:\tmp` · panel „Źródło prawdy" (edycja SSOT).

### Nowe z audytu porządkowego 2026-06-20 (perspektywy systemowe — do decyzji)
- **Retencja danych / RODO:** brak czyszczenia porzuconych anon sesji + ich grafik w Storage (koszt + PII bezterminowo); brak ścieżki „usuń moje dane". → job retencyjny KONSERWATYWNY (anon, bez maila/płatności/showcase/feed, cisza >90 dni → usuń sesję + grafiki). Destrukcyjne — wymaga akceptacji polityki.
- **Disaster recovery:** git ≠ live — część funkcji (`_shared/spar-owner.ts`, kilka `spar-*`) istnieje tylko na dysku + zdeployowana, NIE w git. Awaria dysku = ratunek tylko z Supabase. → „commit porządkujący".
- **Observability:** zero alertu o awarii crona / runaway kosztów (był storm $0.59). → heartbeat + dzienny próg kosztu na Slack #sparing.
- **DX rozwoju:** panel edytuje ŻYWY prompt 47k bez preview/testu. → harness testowy (sesja `is_test` + draft prompt).
- **Dług promptu:** 47k z warstwami „NADRZĘDNE NAD WSZYSTKIM" — drogi (leci co turę) i trudny w utrzymaniu; refactor tylko świadomie.
- **Duplikacja:** `projekt/index.html` = kopia 1:1 rendererów ze `sparing/index.html` (zmiana logiki w 2 miejscach).
- **Poza sparingiem (dług):** leaked-password protection OFF (Auth Dashboard) · UPDATE-always-true na `tn_ad_alerts/recommendations/whatsapp_widget_status/workflow_reviews`.

---

## 11. Mapa plików (gdzie wszystko żyje)

- Edge functions: `tn-crm/supabase/functions/spar-*` (+ `_shared/spar-owner.ts`, `_shared/spar-reveal-plan.ts`).
- Migracje: `tn-crm/supabase/migrations/2026*_stworze_*.sql`.
- Prompty: `settings` DB (`stworze_sparing_prompt`, `aplikacja_model_biznesowy`); mechaniki w kodzie spar-chat.
- Front publiczny: `tomekniedzwiecki.pl/aplikacja/{index,sparing,wspolpraca,projekt,inspiracje,podglad,regulamin}/`.
- Panel admina: `tn-crm/tn-aplikacje/index.html` (crm.tomekniedzwiecki.pl/tn-aplikacje).
- Dokumentacja: `tn-crm/docs/stworze/{SYSTEM-APLIKACJA(ten — architektura), RUNBOOK(operacje)}.md`.
- Pamięć (recall): `aplikacja-faq-klienci`, `feedback-aplikacja-oferta-ssot-protokol`, `projekt-stworze-koncepcja`, `agent-wspolpraca-obiekcje`, `projekt-aplikacja-knowhow-etap` i in.
