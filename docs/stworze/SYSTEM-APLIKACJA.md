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
- **`spar-chat`** (mózg, 1714 l.) — streaming czat; model `SPAR_OPENAI_MODEL`→`gpt-5.1`; prompt `settings.stworze_sparing_prompt`. Obsługuje WSZYSTKIE etapy (mechaniki w kodzie: GATE, KIERUNKI, PREVIEW_AFTER_GATE, COLLAB_PHASE, RESIGNATION, KNOWHOW_*). Zapisuje `spar_messages`, `spar_usage`, większość kolumn `spar_sessions`. **Lead „Nowy" w CRM powstaje przy BRAMCE kontaktu** (email+telefon, `maybeNotifyContactSlack`, atomowy claim raz/sesję + anty-garbage) — parytet ze /sklep; wcześniej dopiero na zielono (wczesne dropoffy były niewidoczne w pipeline). Zielony werdykt to fallback (lead-upsert idempotentny po e-mailu). **REVIVE-ON-REENGAGE**: gdy lead w `lost/abandoned` napisze REALNĄ wiadomość (genuine user turn — gałąź `!knowhowResume` po inserckie `spar_messages`), `reviveLeadOnReengage` (`_shared/lead-stage.ts`) wskrzesza go do etapu z sygnałów (FLOOR 'new'). Sygnały pasywne (ogląd panelu, zaczepki, eventy leave_screen/contact/knowhow_close) NIE wskrzeszają. Nie koliduje z mailami „porzucony" (te bramkują po stanie sesji, nie `leads.status`).
- **`spar-assess`** — bramka potencjału (Responses API + web_search), structured verdict; model `SPAR_ASSESS_MODEL`→`gpt-5.5`. WEWNĘTRZNY (tylko spar-chat go woła Bearer service-role).
- **`spar-image`** — 4 widoki „wow" + ekstra; `gpt-image-2`. Jedyna funkcja obrazowa z timeoutem (120 s + retry).
- Front: zakładka **Rozmowa** w `sparing/index.html`.

### Etap 2 — Współpraca + rezerwacja
- W `spar-chat`: po zielonym wstrzykiwany `COLLAB_PHASE_INSTRUCTION`; prompt sekcje `# OFERTA I WSPÓŁPRACA`, `# PRZEŁAMYWANIE OBIEKCJI`, `# FAQ OFERTY`. Marker `<makieta>` → karta rezerwacji 500 zł.
- **`spar-project`** — read-panel (karta/brief/plan/raport/economics/gtm/strona/uwagi); zapisuje `seen_landing_at`, `last_panel_at`, `panel_visits` (zasilają bramki dripu). **Awansuje leada po lejku CRM** (monotonicznie, `_shared/lead-stage.ts`, `channel:'/aplikacja'`) na każdym sync `get`: full_paid→won, paid→negotiation(Rezerwacja), zielony+visits≥2→proposal(Zakwalifikowany), zielony→qualified(Oferta), seen_landing→contacted(Skontaktowany). Parytet ze /sklep (bud-project) — patrz [[sklep-pipeline-mapowanie-statusow]].
- **Deliverables** (gen na żądanie/drip): `spar-plan`, `spar-raport`, `spar-economics`, `spar-gtm`, `spar-landing`, `spar-prototype`.
- **`spar-drip`** (cron) + **`spar-followups`** (cron) — sekwencje maili/SMS prowadzące do rezerwacji.
- Front: zakładki **Współpraca / Plan / Rynek / Economics / GTM / Strona / Prototyp**; strona `aplikacja/wspolpraca/`; checkout + `aplikacja/regulamin/`.

### Etap 3 — Spowiednik / know-how (po pełnej płatności)
- **Brak osobnych funkcji** — żyje w `spar-chat`, gałąź `isKnowHowMode` (gdy `full_paid_at`): KNOWHOW_BASE+warianty, KNOWHOW_RESUME, KNOWHOW_EXTRACT_PROMPT, HANDOFF_PROMPT. Zapisuje `spar_knowhow_items`, `spar_knowhow_summary`.
- **Odmrażane przez `tpay-webhook`** (desc „budowa aplikacji" → `full_paid_at` + summary `status='active'`).
- Front: tryb nałożony na zakładkę Rozmowa (`.view--knowhow`); JS `buildKnowhowOpener`/`enterKnowhowChat`/`requestKnowhowNudge`/`playKnowhowIntro`/`playKnowhowOutro`/`cardBoxHTML` (sparing l. 10811–11060). Domknięcie = `event:'knowhow_close'` → `knowhow_closed_at`.
- **TWARDE ZAMKNIĘCIE (decyzja Tomka 2026-07-11):** po `knowhow_closed_at` czat spowiednika NIE przyjmuje nowych tur — front blokuje kompozer (`KH_CLOSED_MSG` w `enterKnowhowChat`/`closeKnowhow`), backend zwraca 403 `knowhow_zamkniety` (guard w spar-chat po `knowhowClosed`). Nowe pomysły klienta wracają przy demo wersji roboczej (krok `demo_klienta` w /tn-app). [Wcześniej czat celowo działał po zamknięciu — ZMIENIONE.]
- **Handoff (pakiet wiedzy) bez ucinania:** limit bazy wiedzy w `generateHandoffPack` podniesiony 8000→60000 znaków (karta 1500→4000) — automat składa pakiet z PEŁNEJ bazy; ręczne składanie tylko dla ekstremów/ścieżki B (klient bez spowiednika).

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

### ✅ Zrobione 2026-07-23 — FALA 5: KWALIFIKACJA = PEŁNY AUTOMAT (decyzja Tomka „nie chcę być wąskim gardłem")
- **Nic nigdy nie czeka na Tomka.** Panel tn-aplikacje służy wyłącznie do OPCJONALNEGO odrzucenia; kwalifikację robi system:
  1. **spar-chat:** zielony werdykt + ocena „mocny" → wniosek akceptowany OD RAZU przy werdykcie (bez klikania bezpłatnego zgłoszenia — audyt 23.07: 3/6 mocnych sesji odpadało na tym kliknięciu); `spar_meta.wniosek` niesie świeży status w tej samej turze, karta od razu pokazuje rezerwację; Slack `spar_wniosek` (auto) informacyjnie.
  2. **spar-followups blok 4d:** (a) pending starsze niż 2 h → auto-akcept + mail/SMS (2 h = okno na ręczne odrzucenie); (b) DOSYP: zielone „mocny" bez wniosku (≤30 dni, mail, niepłatne) → auto-akcept + zaproszenie; cap 10/przebieg, bramka międzykanałowa ≥10 h, idempotencja spar_emails. Cron `*/30`.
- **Uczciwe copy:** mail `wniosek_accepted` rozgałęziony po `wniosek_auto` — „osobiście przejrzałem" TYLKO przy ręcznym akcepcie z panelu; automat mówi „projekt przeszedł kwalifikację". SMS analogicznie. Front: karta pending i sysMsg mówią „kwalifikacja automatem, wynik do ~2 h mailem" (nie „Tomek przejrzy"). Prompt (R1–R4): kwalifikacja = szybki automat, model NIE zapowiada, który przycisk pokaże karta, i nie obiecuje ręcznego przeglądu; [STAN SESJI] pending analogicznie. Slack pending: „auto-akcept za ~2 h — możesz odrzucić w panelu".
- **SEC przy okazji:** `isAdmin` w spar-followups wymagał tylko WAŻNEGO JWT (a konta zakłada każdy lead przy bramce → dowolny lead mógł np. podglądać maile cudzych sesji przez `preview_session`). Teraz admin = wyłącznie `team_members` (wzorzec verifyTeamMember) albo service key.
- Weryfikacja produkcyjna: przebieg crona 15:30 UTC zaakceptował i zaprosił pierwszą zaległą sesję (dosyp działa).

### ✅ Zrobione 2026-07-22 — FALA 4 (drugi przebieg audytu + decyzje Tomka wieczorem)
- **TELEMETRIA PADÓW PODGLĄDÓW (spar-image):** śledztwo audytowe — incydent 18.06 (od rana do ~20:00 ŻADNA generacja obrazów nie przeszła; 4 sesje z briefem i 0 obrazów) był niewidoczny, bo pady żyły tylko w logach edge. Teraz: RPC `spar_bump_gen_error` (migracja `20260722e_spar_image_telemetry`, aplikator `scripts/apply-spar-image-telemetry.mjs`) atomowo bije `gen_error_count` sesji (chip zdrowia w panelu zapala się bez zmian panelu) + alert Slack `spar_gen_error` z artifact `podglad` i cooldownem 30 min/sesję (kolumna `gen_alert_at`); slack-notify rozróżnia copy dla podglądów vs artefaktów dripa. Sam kod generacji BEZ zmian (retry ×3 + fallback modelu były poprawne — to incydenty infrastruktury OpenAI, nie bug).
- **NDA W LEJKU (decyzja Tomka; KOREKTA wieczorem):** w rozmowie tylko WSTĘPNY zarys; PEŁNE szczegóły projektu przekazywane dopiero PO podpisaniu umowy o budowę (spowiednik). **NDA = OPT-IN: podpisywane WYŁĄCZNIE na życzenie klienta, przy zawieraniu Umowy Budowy — nie standard, nie na etapie rezerwacji.** Wzór `NDA-JEDNOSTRONNE-DRAFT.md` po recenzji prawnej (Rewizja 4: pozytywny zakaz „nie zbuduję produktu na Twoim pomyśle", załączniki w definicji, pierwszeństwo Umowy Budowy; Rewizja 5: opt-in przy umowie + „przekazał lub przekaże" obejmuje rozmowę z czatu) opublikowany jako strona `tomekniedzwiecki.pl/aplikacja/nda/` (baner WZÓR POGLĄDOWY, bez auto-zawarcia przez ujawnienie i bez NOTATEK). Prompt: obiekcja kradzieży pomysłu prowadzi do NDA + linku, z zakazem mówienia „NDA przed rozmową z Tomkiem / przy rezerwacji". **Umowa Budowy Rewizja 6: USUNIĘTY domyślny zakaz konkurencji Wykonawcy (§ 8 ust. 11 lit. d)** — Tomek nie wiąże się domyślnie; klauzula tylko na jego jawne polecenie (snippet opt-in w nocie rewizji). **Folder `prawne-aplikacja/` przeniesiony do `data-private/`** (poza publicznym repo; UWAGA: historia gitowa nadal zawiera stare wersje). Wzajemne NDA zostaje wewnętrzne (etap współpracy).
- **KONTAKT BEZPOŚREDNI:** przy twardym żądaniu telefonu AI podaje `ceo@tomekniedzwiecki.pl` (opis sprawy → ewentualna rozmowa telefoniczna z Tomkiem) — jako uzupełnienie JEDNEJ ścieżki, nigdy z własnej inicjatywy ani zamiast zgłoszenia.
- **RATY ZA JAKOŚĆ:** elastyczność harmonogramu jawnie rośnie z siłą projektu; twarda granica — ZERO wariantów „prowizja/z przychodów/udziały zamiast ceny budowy" (nie przyciągamy takich leadów).
- **MARKETING PIERWSZYCH 50 (fakty do SSOT):** start = kanały bezpłatne (bazy firm, agenci AI generujący leady, outreach), płatne reklamy NIE planowane na starcie; jeśli później — kampanie prowadzi Tomek, budżet mediowy finansuje klient (spójne z decyzją umowną „budżet reklamowy rozruchu = Partner"). Propagacja: `aplikacja_model_biznesowy` (+ linia LEJEK zaktualizowana o dwustopniowy filtr — przeoczenie Fali 2), prompt (FAQ MARKETING, bank obiekcji „skąd klienci"), FAQ-doc Q16a-c.
- **GOTOWE PRODUKTY — STANOWISKO:** Tomek nie przejmuje zbudowanych/wdrożonych projektów; zaangażowanie = wyłącznie budowa od zera przez jego zespół (prompt + model_biznesowy + FAQ Q16c).
- **Drobne z 2. przebiegu audytu:** karta rezerwacji z rozbiciem struktury kosztów (500 zwrotne/wliczone → 12 000 przy umowie/raty → 10% gdy zarabia); guard „ruchomego celu" (3. porzucony kierunek → wybór z <opcje> zamiast karuzeli); nota DWA KROKI REZERWACJI w banku obiekcji; zasada czarnej skrzynki (AI nie wyciąga „sekretnego sosu").

### ✅ Zrobione 2026-07-22 — FALA 3 (kolejne decyzje Tomka)
- **RATY za budowę:** AI może mówić o rozłożeniu 12 500 zł na raty (indywidualny harmonogram przy umowie, bez obiecywania liczby rat) — także WCZEŚNIE, przy obiekcji budżetowej. Propagacja wg protokołu: FAQ-doc (Q16) → `aplikacja_model_biznesowy` (backup `_backup_20260722`) → prompt (`# FAQ OFERTY` PŁATNOŚĆ + bank obiekcji „to dużo pieniędzy/raty" + ściąga cenowa) → `aplikacja-umowa-notatki.md`. Mechanika CRM: harmonogram rat w karcie leada (payment_schedules.offer_id); GOTCHA `full_paid_at` po PIERWSZEJ racie — patrz pamięć `harmonogram-aplikacja-offer-id-i-trigger-tn-app`.
- **ZAŁĄCZNIKI W CAŁEJ ROZMOWIE** (dotąd tylko spowiednik): eventy `knowhow_attach_*` działają też przed pełną płatnością — warunek: podany kontakt (403 `wymagany_email` na anonimach), limit `MAX_ATTACH_PER_SESSION_STAGE1=8`; treść pliku ląduje jak dotąd jako `[ZAŁĄCZNIK: …]` w spar_messages (kanał sparing) → od razu w kontekście każdej tury; blok `[ZAŁĄCZNIKI OD ROZMÓWCY — MECHANIKA]` + lista plików wstrzykiwane w trybie sparingu; `attachAck` odblokowany poza knowhow (fallback ack bez instrukcji spowiednika); `refreshKnowhowSummary` tylko po full_paid. Front: spinacz widoczny w każdym etapie poza `build`, po podaniu kontaktu (`attachStageOk`). Karty `zalacznik` w spar_knowhow_items zapisują się od etapu 1 → materiał przechodzi do bazy wiedzy budowy.
- **ETAP DECYZJI dopracowany:** `[STAN SESJI]` niesie status wniosku (nie zgłoszony / pending / accepted — model wie, do czego prowadzić); karta zaakceptowana ma mini-oś „Po rezerwacji: potwierdzenie → plan → kontakt w 2–3 dni"; ręczny akcept wniosku wysyła obok maila SMS-lustro (`wniosek_accepted_sms`, za zgodą, short-link /p/); etykieta `wniosek_accepted` w MAIL_KINDS panelu.

### ✅ Zrobione 2026-07-22 — FALA 2 (decyzje Tomka po audycie)
- **DWUSTOPNIOWY FILTR REZERWACJI (fundament — decyzja Tomka):** po zielonym werdykcie karta `<makieta>` pokazuje najpierw BEZPŁATNE „Zgłoś projekt do współpracy" (front `submitWniosek` → spar-chat `event:'wniosek'`). Kwalifikacja: `assessment.ocena='mocny'` → AUTO-akcept (`wniosek_auto=true`, natychmiast karta 500 zł + sysMsg „projekt przeszedł kwalifikację"); inaczej → `pending`, decyzja Tomka w panelu tn-aplikacje (kolumny `wniosek_*`, migracja `20260722c_spar_wniosek` + granty UPDATE `wniosek_status/wniosek_decided_at` dla team). Ręczny akcept → mail `wniosek_accepted` (spar-followups krok 4c, statyczny szablon, idempotencja spar_emails). Slack typ `spar_wniosek`. Status płynie do frontu przez `spar_meta.wniosek` + `spar-project get`. CTA rezerwacji (karta, zakładka Współpraca, menu konta) respektują status. Prompt: ściąga cenowa i K6/OFERTA mówią „najpierw bezpłatne zgłoszenie". Sesje już-zielone sprzed zmiany: dostają kartę zgłoszenia przy następnej wizycie.
- **BRAMKA KONTA ZA BADANIEM RYNKU (decyzja Tomka):** front `gatePending` odpala bramkę dopiero, gdy w historii jest `<ocena>` (user właśnie dostał research na żywo), fallback `GATE_AFTER_USER_MSGS=7` (audyt: 115/426 sesji umierało na bramce przy 4. wiadomości przed jakąkolwiek wartością). Server hard-gate 7 tur bez zmian; generowanie podglądu nadal twardo bramkowane kontaktem (`requireContactBeforeGen`).

### ✅ Zrobione 2026-07-22 (audyt 426 realnych rozmów → poprawki skuteczności)
- **RE-GATE przy zielonym werdykcie (spar-chat):** pierwszy zielony werdykt bez zapisanego `assessment.ocena='mocny'` odpala PONOWNE badanie `spar-assess` na aktualnej wersji projektu (stary hard-gate działał tylko w turze z `<ocena>` — audyt: 35/70 sesji „do_poprawy" dostało zielony bez re-weryfikacji pivotu). Mocny → zielony zostaje + świeża ocena; inny wynik → downgrade na żółty + uczciwa dogrywka tekstem z kierunkiem; pad badania → przepuszczenie warunkowe (blip infrastruktury nie karze usera). Sesje już zielone (aktualizacje karty w fazie współpracy) NIE są re-bramkowane. Prompt `aplikacja_etap_gate` ma lustrzaną twardą zasadę „PONOWNA OCENA PO PIVOCIE".
- **WARSTWA AI w propozycjach:** `spar-assess` ocenia dodatkowo „dźwignię AI" (pole `ai_dzwignia` w werdykcie — jak AI robi robotę za użytkownika TEGO narzędzia) + twardy TEST ZABAWKI (projekt osobisty/hobby/vanity nigdy nie jest „mocny"). `buildSteerInstruction` wplata dźwignię AI w wyostrzenie po badaniu. Prompt czatu: nowa sekcja `# WARSTWA AI W NARZĘDZIU` (AI = część rdzenia, nie kandydat do cięcia zasadą prostoty; widok "glowna" pokazuje moment AI w akcji), karta `<werdykt>` ma pole `warstwa_ai`, renderowane w kartach („AI robi robotę") w `sparing/index.html` (2 renderery) i `projekt/index.html`.
- **Prompt czatu (backup `_backup_20260722`):** ściąga cenowa — pierwsze pytanie o pieniądze dostaje CAŁĄ strukturę naraz (500 zwrotne → 12 500 z wliczoną rezerwacją → 10%; audyt: zamęt „500 czy 12 000, kto komu płaci" gubił leady); ponawianie propozycji domknięcia co ~3–4 wymiany dopracowania (sesje 30-wiadomościowe bez werdyktu); anty-oversteering pivotu (mostek zamiast wyburzania, po 2. odmowie uczciwe „nie poprowadzę do zielonego" zamiast zapętlenia); przekierowanie „mam już aplikację, chcę marketingu"; guard „doradź mi ×2 → poproś o mikro-konkret" (projekt bez właściciela nie konwertuje); wczesne skręcanie projektów-zabawek ku wersji komercyjnej.
- **Front:** bramka konta z obietnicą wartości („za chwilę zbadam Twój rynek na żywo…"), karta rezerwacji z linią zaufania (Tpay · umowa przed budową · TakeDrop ~5000 sklepów) — audyt: dominująca obiekcja przy paywallu to scam/nieufność, nie kwota.
- **Analiza źródłowa:** 426 sesji, 15 raportów batchowych w scratchpadzie sesji Claude (2026-07-22). Kluczowe liczby: 62% ginie przed podglądem (opener + wczesne pytania, w tym 115 sesji dokładnie na bramce konta), ~57 sesji doszło do karty rezerwacji → 10 płatności, stalle czatu (7) wszystkie sprzed frontowego retry z 20.07.

### ✅ Zrobione 2026-07-10 (audyt lejka + wdrożenie domykania)
- **Prompt (`stworze_sparing_prompt`, 51k; backup `_backup_20260710`):** DRZEWO DOMYKANIA (sygnał intencji → `<makieta>` w tej samej turze; karta projektu domknięta → następna tura = cena+karta; limit pętli poprawek; zakaz pytań o pozwolenie i furtek odroczenia w `<opcje>`; wyjątek zwięzłości na turę domknięcia), bank obiekcji +4 (scam/zaufanie, kontakt z Tomkiem = sygnał kupna, żona/wspólnik, „zastanowię się"), sekcja `# POWRÓT PO PRZERWIE`, spięty timing K5↔`<ocena>`.
- **spar-chat:** blok `[STAN SESJI]` per tura (werdykt, paid, makieta wystawiona, panel_visits, paywall open/abandon — twarde fakty zamiast skanowania historii); gałąź post-paid (opłacona rezerwacja ≠ dalszy pitch); eventy `paywall_open`/`paywall_abandon`; stempel `makieta_last_at`; uczciwy komunikat + event error przy padzie bramki `spar-assess`.
- **Kolumny:** `spar_sessions.paywall_opened_at/paywall_abandoned_at/makieta_last_at/gen_error_count`, `spar_reveals.error_count/last_error/last_error_at` (migracje `20260710*`).
- **KRYTYCZNY FIX pipeline'u dripa:** owner-gate odrzucał 403 wywołania WEWNĘTRZNE spar-drip (service-role) → generacje dla zarejestrowanych leadów nigdy nie ruszały (36 reveali wisiało w `generating`). Nowy `isTrustedInternalCall` w `_shared/spar-owner.ts` (Bearer==SERVICE_ROLE_KEY omija bramkę; `?id=` dalej nie jest hasłem). Recovery stale-generating (>30 min → pending, po 3 padach `failed` + Slack `spar_gen_error`), SMS w dripie z timeoutem 20s+retry, retry OpenAI dołożony w economics/gtm.
- **spar-followups:** `reclose_1` (+48h) / `reclose_2` (+5 dni) po sygnale paywalla/nudge; `payment_rescue` (orders pending 2–48h); linki CTA maili przez PANEL (nie goły checkout); List-Unsubscribe (flaga `unsubscribe:true`, tylko kindy marketingowe). send-sms: timeout 12s + retry + normalizacja numerów.
- **Front:** beacony paywalla, InitiateCheckout z dedupem `resv_<sid>`, idle-nudge 90s (raz/sesję, wspólny guard zaczepek), mail-capture w oknie badania rynku, ceremonia po płatności + guard `!state.paid` na karcie, hero mobile z CTA + pasek zaufania, fail-state banerów GTM. Checkout v2: linia zwrotności przy rezerwacji, piksele ujednolicone do netto.
- **Panel:** `derivedStageOf` + kanban o stany `full_paid`/`knowhow_closed`; `setReservationPaid` → negotiation (won TYLKO full_paid) + marker ręcznego księgowania; badge zdrowia generacji i chip paywalla w karcie leada.
- **spar-project:** `panel_visits`/`last_panel_at` awaited (bramka `visits2` przestaje gubić stemple).

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
