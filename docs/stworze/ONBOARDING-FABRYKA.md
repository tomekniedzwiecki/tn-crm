# Onboarding — standard fabryki TN App (SSOT)

> Decyzja Tomka 2026-07-16: onboarding to luka fabryki — user wchodzi i nie wie, co robić.
> Ten dokument = framework UNIWERSALNY (obowiązuje każdą apkę) + PROTOKÓŁ projektowania per projekt
> + nowy krok w etapach. Oparty na researchu (3 agenci Sonnet 5, `docs/stworze/onboarding/RESEARCH-1..3.md`).
> Zasada nadrzędna: **prowadź usera najkrótszą drogą do AHA (pierwszego poczucia wartości), potem buduj nawyk.**

---

## 0. Model mentalny — Setup → Aha → Habit

Każdy onboarding projektujemy w 3 momentach (nie tylko konfiguracji):
- **Setup** („co mam zrobić?") — prerekwizyty, konto gotowe do wartości. **≠ aktywacja.** Cel: 60-75% w 24h.
- **Aha** („po co mi to?") — PIERWSZE poczucie wartości, w tej samej sesji. Cel: 50-70% (po Setup) w 1. tyg.
- **Habit** („kiedy tego używać?") — powtórka rdzenia = najlepszy predyktor retencji. Cel: 30-50% w 28 dni.

Mikro-SaaS fabryki = nisza B2B/JDG (operator=właściciel, mało czasu, sceptyk, lęk #1=scam) → model
**SELF-SERVE / product-led**. ZERO wymuszonego calla; „pokaż wartość TERAZ"; wartość najlepiej PRZED
pełną konfiguracją; każdy krok jawnie tłumaczy „po co"; human-touch tylko REAKTYWNIE (mail przy drop-offie).

---

## 1. Zasady UNIWERSALNE — obowiązują KAŻDĄ apkę (mierzalne, egzekwowane)

### In-app
1. **Rejestracja max 2 pola** (e-mail+hasło / magic-link), ZERO karty w trialu. Reszta = progressive profiling. Cel konwersji signup >70%.
2. **Welcome survey 1-3 pytania** (rola / cel / use-case = JTBD) tuż po rejestracji → wynik zapisany (`profiles`/event `jtbd_selected`) i ROUTUJE ścieżkę. Nie więcej niż 3.
3. **Welcome screen ustawia oczekiwania** — jedno zdanie „co ten produkt dla Ciebie zrobi" + ile zajmie start („2 minuty").
4. **Po surveyu DOKŁADNIE jedna jasna następna akcja** prowadząca do aha (nie menu, nie tour). CTA CZASOWNIKIEM („Utwórz…", „Wystaw…", „Przygotuj…").
5. **Checklist „Pierwsze kroki" 3-5 kroków** = najskuteczniejsza mechanika. Każdy krok = akcja IN-APP (nie „przeczytaj"), ostatni = aha-event. **Pierwszy krok PRE-CHECKED** (endowed progress: 34% vs 19% completion). Pasek „x/5"/%. Znika po ukończeniu. Cel completion >40%.
6. **Celebracja po aha/ukończeniu checklisty** — lekka, papierowa (stempel/„Gotowe!"/subtelne konfetti), NIE gadżet.
7. **Każdy pusty ekran = onboardingowy empty state**: (a) nazwa WARTOŚCI, nie funkcji; (b) kształt sukcesu (ghost row / muted preview — +15-30% first-action); (c) JEDNO główne CTA czasownikiem; (d) jedna furtka (dane przykładowe / import). ZERO przeprosin, ZERO 3 akapitów.
8. **Dane przykładowe/demo** dla ekranów typu lista/tablica/dashboard (standard fabryki `demo-seed.js`) — usuwalne jednym kliknięciem, wyraźnie oznaczone jako przykład.
9. **ZERO wieloetapowych statycznych tourów** (userzy je przeklikują, „obrażają"). Dozwolone WYŁĄCZNIE kontekstowe tooltipy wyzwalane akcją (okno 2-5 s), interaktywne „zrób to", max 1 naraz.
10. **Progressive disclosure** — pierwsza sesja pokazuje TYLKO drogę do aha; zaawansowane funkcje odsłaniane później / po kamieniach.
11. **Onboarding pomijalny i wznawialny** — nic nie blokuje ścieżki do wartości (integracje/zaproszenia opcjonalne).
12. **Copy** (papierowy, PL, B2B/JDG): wartość > funkcja; CTA czasownik; jedno zdanie wartości + jedno „jak"; ton rzeczowy, bez infantylizacji, bez purple prose.

### Aktywacja i pomiar
13. **Zdefiniuj JEDEN `aha`/`activated` event per apka** z perspektywy USERA (realny efekt, nie krok korzystny dla biznesu — NIE „wpisał kartę"/„ukończył profil"). Odkrywany z danych (korelacja z retencją + eksperyment na kauzalność); dla nowej apki = hipoteza z MVP-scope.
14. **Instrumentacja OBOWIĄZKOWA** (nazwy STAŁE across fabryka — jeden panel operatora dla wszystkich):
    `signed_up` (t0) · `onboarding_started` · `jtbd_selected` · `setup_completed` · `onboarding_step_done` (property `step_name`/`step_index`) · `activated` (property `time_since_signup`=TTFV) · `habit`. **Kolejność twarda: definiuj `activated` PRZED instrumentacją.**
15. **Mierz medianę TTFV**, nie średnią. Cel self-serve: aha w pierwszej sesji (<10 min / <5 kliknięć).
16. **Panel operatora — jeden dashboard aktywacji** (uniwersalny): activation rate (target ≥35-40%, <20%=alarm), TTFV mediana+rozkład, setup rate, **lejek onboardingu z drop-off per krok** (podświetl największy), D7 retention, habit rate, breakdown per segment.
17. **ZERO vanity** — nie liczymy signupów ani ukończonych kroków bez wartości jako sukcesu; sukces = activation rate + retencja.

### Poza aplikacją (e-mail — spina się z §2)
18. **Nurtowanie mailowe do 14 dni** spięte z eventami aktywacji (behawioralne, `aha`=true wygasza serię).

---

## 2. Seria e-mail onboardingu — SZKIELET UNIWERSALNY (treść PER PROJEKT)

Wszystkie wyzwalacze BEHAWIORALNE z fallbackiem czasowym; `aha_event=true` → NATYCHMIAST wygasza całą serię (exit+suppress). Silnik = `lifecycle-emails` fabryki.

| # | kind | wyzwalacz (aha per-projekt) | cel | 1 CTA | typ prawny |
|---|---|---|---|---|---|
| 1 | `welcome` | `signup` → w sekundy | „jesteś w środku" + 1 pierwszy krok + oczekiwania | zrób pierwszy krok | **transakcyjny** |
| 2 | `activation_step` | `welcome+24h` AND NOT `quick_win` | quick win <1 dzień, dowód działania | zobacz quick win | **transakcyjny** |
| 3 | `activation_nudge` | `signup+48-72h` AND NOT `aha` | nudge WARTOŚCIOWY (nie wyrzut), usuń blokadę | dokończ aha / pomoc | transakcyjny/graniczny |
| 4 | **`milestone`** *(LUKA — DODAĆ)* | `aha=true` natychmiast | gratulacje + „co dalej", buduj nawyk (+28% retencja, +42% LTV) | zrób krok 2 | **transakcyjny** |
| 5 | `feature_education` | `aha+~4d` (tylko aktywowani) | druga wysokowartościowa funkcja | wypróbuj funkcję 2 | **marketing** (zgoda+unsub) |
| 6 | `social_proof` | dzień 7-14 (aktywowani) | dowód społeczny / tip / ekspansja | zobacz case / zaproś | **marketing** |
| 7 | `reengagement` | N dni idle (stalled/dormant) | winback pod blokadę, potem wycisz | wróć do wartości | **marketing** |

**Reguły silnika (uniwersalne):**
- Każdy mail = JEDNO CTA. Wyzwalacz behawioralny + fallback czasowy (timeout), nie odwrotnie.
- `aha=true` → wygaś onboarding (exit+suppress) — nie leci równolegle z konwersyjnym.
- Priorytet komunikatów: **transakcyjny/dunning > activation > marketing**; 1 priorytetowy mail/okno per user.
- **`trial_ending` ROZGAŁĘZIA wg aktywacji:** aktywowany = push upgrade; NIE aktywowany = extension/pomoc (agresywny push do kogoś bez aha = negatyw).
- **`dunning` = priorytet** nad wszystkim lifecycle; w jego oknie wstrzymaj marketing (#5-7). Logika po-płatnościowa w OBU webhookach (TPay + Revolut) — [[feedback-revolut-webhook-lustro-tpay]].
- Kadencja: max 4-7 maili / 7-14 dni (degradacja ~3-5% open/mail; 69% unsub przez za dużo).
- **GUARD ŚWIEŻOŚCI (obowiązkowy dla `milestone` i każdego maila po-aktywacyjnego):** wysyłaj TYLKO gdy `activated_at >= now() - INTERVAL '7 dni'`. Bez tego włączenie/naprawa `AHA_EVENT` na apce z ISTNIEJĄCĄ bazą (§0 backfilluje `activated_at` historycznym timestampem eventu) wywoła RETROAKTYWNĄ FALĘ maili do wszystkich historycznych aktywowanych — incydent deliverability na LIVE (audyt Fachmat 2026-07-17). Guard świeżości sam wyklucza backfill (stare `activated_at`), a nowo aktywowani dostają mail normalnie. Alternatywa przy pierwszym cyklu: `kill_emails=true` + pre-seed `email_log` wierszami kindu.
- **Twardy dedup one-time maili:** nowy jednorazowy kind (np. `milestone`) dopisz do unikalnego indeksu `email_log_once_delivered_idx` — soft-dedup aplikacyjny nie wystarcza przy współbieżnych przebiegach crona.
- Metryki na KLIKACH + eventach in-product, NIE openach (Apple MPP zawyża).

**PRAWO (PL, PKE od 10.11.2024 — TAKŻE B2B/JDG):** rozdziel `kind` **transakcyjny** (welcome/activation/milestone — realizacja umowy/uzasadniony interes, bez zgody marketingowej, bez unsub marketingowego) od **marketingowego** (feature_education/social_proof/reengagement — zgoda + link opt-out w stopce; sprzeciw art. 21 = natychmiastowy). Adres imienny = dane osobowe, pełen reżim. Rozdział egzekwuj w silniku (`marketing_opt_out` blokuje tylko marketingowe).

---

## 3. PROTOKÓŁ projektowania onboardingu PER PROJEKT (krok „onboarding")

Onboarding jest UNIWERSALNIE oscaffoldowany (§4), ale ZAWSZE dopracowywany całościowo dla konkretnej apki. Sesja kroku wykonuje:

1. **Zdefiniuj aha** (protokół): „User poczuje wartość, gdy ______" (1 zdanie) → rozpisz Setup/Aha/Habit → 3-7 kandydatów → próg+okno (N akcji/M czasu) → zapis jako `activated` event + do SSOT projektu (`brief/00`/`02`). Weryfikuj vs anty-vanity (odrzuć „ukończył profil" jeśli nie koreluje).
2. **JTBD survey** — 2-4 realne role/cele TEJ niszy → mapowanie odpowiedź→ścieżka (różne dane startowe/pierwszy krok).
3. **Checklist „Pierwsze kroki"** — dobierz 3-5 kroków = NAJKRÓTSZA droga do aha tej apki (1. pre-checked, ostatni=aha).
4. **Empty states** — audyt KAŻDEGO pustego ekranu apki wg wzorca §1.7; copy korzyści niszy.
5. **Dane przykładowe** — realistyczne dla branży, po polsku, z realiami PL (NIP/PLN/VAT/branża).
6. **Progressive disclosure** — co ukryć na start, co odsłonić kiedy.
7. **Kontekstowe tooltipy** — tylko przy funkcjach nieoczywistych TEJ apki (max potrzebne minimum).
8. **Instrumentacja** — wepnij eventy §1.14 z wartościami tej apki (step_name, próg aha).
9. **Seria maili** — wypełnij szkielet §2 treścią niszy (temat, 1 CTA, quick_win, funkcje #2/#5, case #6, okno nudge wg długości trialu); dodaj `milestone`.
10. **Panel operatora** — podłącz dashboard aktywacji §1.16 do eventów apki.
11. **Cele/progi** — ustal benchmark TTFV i próg aktywacji per produkt.
12. **CAŁOŚCIOWY PRZEGLĄD** — przejdź onboarding oczami usera niszy od zera; pętla krytyka DO WYCZERPANIA (jak reszta jakości fabryki).

---

## 4. Standard fabryki (scaffolding startera — build uniwersalny z {{placeholderami}})

Starter (`saas-starter/template`) dostarcza SZKIELET, krok `onboarding` wypełnia treścią:
- **Komponent checklisty „Pierwsze kroki"** (`@dsChecklist`?) — pasek postępu, kroki z akcją, 1. pre-checked, znika po ukończeniu, celebracja; kroki = KONFIGURACJA (definiowane per projekt, nie hardcode).
- **Welcome survey** (modal/ekran, 1-3 pytania konfigurowalne) → zapis `jtbd`/segment + event.
- **Wzorce empty-state** w base.css (`@dsEmpty` rozszerzony: wartość+ghost+CTA+furtka) — do użycia na każdym pustym ekranie.
- **`demo-seed.js`** (już standard) — dane przykładowe per nisza.
- **Instrumentacja** — `track.js` z uniwersalnym zestawem eventów §1.14 (helpery `trackOnboardingStep`, `trackActivated`).
- **Silnik maili** — `lifecycle-emails` z kindami §2 (DODAĆ `milestone`, `activation_step`, `feature_education`, `social_proof`, `reengagement` jako szkielety z {{placeholderami}}; rozgałęzienie trial_ending; rozdział transakcyjny/marketingowy).
- **Dashboard aktywacji** w panelu operatora (`admin-stats` scope `onboarding`) — activation rate/TTFV/lejek/drop-off/D7/habit, uniwersalny.
- **Kontekstowy tooltip** — lekki helper (1 naraz, action-triggered), opcjonalny per projekt.
- Reguły §1 wpisane do `template/CLAUDE.md` (Gotchas UX + sekcja Onboarding).

---

## 4b. Aha za ASYNCHRONICZNĄ generacją AI (apki AI-first — OBOWIĄZKOWE)

Gdy pierwsza wartość (aha) jest ARTEFAKTEM z modelu (plan, oferta, PDF, analiza), między „user kliknął
Generuj" a „user widzi wartość" jest realny WAIT (10-60 s) + ryzyko błędu. To DOKŁADNIE punkt, w którym
sceptyk-JDG (lęk #1=scam) porzuca. Klasyczny onboarding tego nie pokrywa — fabryka MUSI. Research:
`docs/stworze/onboarding/RESEARCH-AI-ASYNC.md`. Dane: pasek postępu → cierpliwość 9 s→22,6 s; widoczny
progres → porzucenie ~30%; streaming tokenów → drop-off 22%→7%; tempo optymistyczne (szybko na starcie)
11,3% vs „szczere" 21,8% porzuceń.

1. **Generacja = NAZWANE ETAPY w 1. osobie, nie nagi spinner.** Nigdy spinner >3 s. Narracja czynności
   („Analizuję Twoją firmę…" → „Dobieram argumenty…" → „Układam plan…"), rosnąca checklista z ✓. To
   *labor illusion* — pokazanie pracy podnosi zaufanie i postrzeganą wartość. Streaming tokenów OBOWIĄZKOWY
   gdy artefakt tekstowy i model to wspiera. Skeleton = kształt REALNego artefaktu (te karty/sekcje), nie
   szare paski. Tempo optymistyczne: pierwszy etap „gotowy" w 1-2 s (choćby tania walidacja inputu).
   Anti-flicker: etap min. ~700 ms na ekranie. Zero fałszywych procentów — nazwane etapy zamiast liczby.
2. **PODCZAS czekania mów sceptykowi wprost, że to działa NA JEGO danych.** „Analizuję dane Twojej firmy
   z KRS i strony…" (konkret o JEGO wejściu = dowód że to nie atrapa). Widełki czasu, nie obietnica
   („zwykle 20-40 s"). Transparentność WARTOŚCI (co robię i po co), NIE techniczna (zero logów/promptów/
   nazw modeli/„429"/„inference"). Zawsze widoczny ruch + rotacja etykiet co kilka s (klient rotuje wg
   szacunkowego harmonogramu p50/p95 z logów, nawet gdy backend milczy).
3. **PORAŻKA pierwszej generacji = pełnoprawny stan produktu, nie wyjątek.** Wzorzec OBOWIĄZKOWY:
   (a) zapis inputu PRZED wysyłką (localStorage + wiersz `pending`) — retry NIGDY nie każe wpisywać od nowa;
   (b) automatyczny CICHY retry 1× z backoffem PRZED pokazaniem błędu (blipy OpenAI przejściowe —
   [[feedback-spar-pipeline-transient-resilience]]); (c) komunikat bez żargonu, wina po stronie SYSTEMU
   („Coś u nas przycięło — Twoje dane są zapisane, spróbujmy jeszcze raz"); (d) fallback wartości nie pusty
   ekran: degradacja modelu / częściowy wynik / kolejka operatora „przyślemy mailem"; (e) backend rozróżnia
   `rate_limit|timeout|empty|quota|other`, UI pokazuje JEDEN ludzki komunikat; `insufficient_quota` =
   alert fabryki nie retry usera ([[feedback-openai-insufficient-quota-lejki-down]]). Timeout klienta >
   p95 modelu (np. p95=35 s → 75 s); edge split + deadline 330s ([[feedback-edge-wallclock-niewidzialne-pady]]).
4. **Aha = pierwszy PERSONALIZOWANY output, NIE `generation_succeeded`.** Przy wieloetapowości
   (research→plan): aha = pierwsza widoczna, użyteczna dla usera SEKCJA artefaktu, nie „research done"
   (to jego dane odbite z powrotem). Pokaż CZĘŚCIOWY wynik ASAP (wynik researchu zanim powstanie plan) —
   pierwszy widoczny fragment = koniec percepcji czekania.
5. **Instrumentacja generacji (STAŁY zestaw across fabryka):** `generation_started`(T0) ·
   `generation_first_value`(=AHA, patrz p.4) · `generation_succeeded` · `generation_failed`
   (`fail_reason`,`retry_count`) · `generation_retried` · `generation_abandoned`. Tabela `generations`
   (status `pending→running→(partial)→succeeded|failed|abandoned`, `first_value_at`, `model_latency`,
   `fail_reason`). **TTFV = first_value_at − T0 = KPI aktywacji (NIE succeeded).** Czasu modelu NIE
   odejmuj od TTFV produktowego; loguj `model_latency` OSOBNO (metryka inżynierska). Porzucenie w trakcie:
   `sendBeacon` na `visibilitychange`/`beforeunload` + serwerowy sweep wierszy `running` przeterminowanych
   (beacon bywa gubiony); loguj ETAP porzucenia. Segmentuj `failed` (system) ≠ `abandoned` (user).
6. **Nudge po porzuceniu/porażce = DOSTARCZ WARTOŚĆ, nie „wróć".** Dokończ/regeneruj artefakt SERWEROWO
   z zapisanego inputu i wyślij GOTOWY wynik (lub zajawkę) mailem, spersonalizowany firmą usera w temacie.
   Trigger A (porzucił w trakcie): „Twój plan jest gotowy — dokończyliśmy za Ciebie", 15-60 min po.
   Trigger B (2× failed): przeprosiny + naprawiony artefakt. Max 1-2 wiadomości; KILL-SWITCH gdy w
   międzyczasie był sukces; reply-to=ceo@ ([[feedback-followup-reply-to-ceo-not-inbound]]); wysyłka wg
   reguł fabryki (nie autonomicznie); logika na `delivered_at` ([[feedback-resend-tracking-svix-and-opens-disabled]]).

**Build:** uniwersalny komponent statusu generacji (`generation.js`: etapy+narracja+streaming+retry+beacon),
tabela `generations`, eventy i wzorzec porażki powstają przy PIERWSZYM wdrożeniu AI-first (Dobry Wstęp) i
są BACKPORTOWANE do startera jako standard każdej kolejnej apki AI (walidacja na realnym flow > budowa w próżni).

---

## 5. Umiejscowienie w etapach (nowy krok)

**Nowy krok `onboarding`** w **Etapie 3 (Budowa MVP)**, PO zbudowaniu rdzenia + paneli + maili (bo aha
musi być znany, a silnik maili istnieć) — sort po `polecenia`. Owner: admin.
Kamień milowy: „Onboarding gotowy — user wie, co robić". Krok = PROTOKÓŁ §3 (projekt per apka) +
build brakujących elementów + pętla przeglądu do wyczerpania. Migracja: `wfa_step_defs` INSERT.
Zależności: `funkcja_glowna` (aha znany), `maile_trans` (silnik), `demo-seed` (dane), instrumentacja.

Uwaga: część elementów już istnieje rozproszona (welcome/activation_nudge/trial tips z S8, demo-seed,
modal „Pierwsze kroki"). Krok `onboarding` je KONSOLIDUJE do spójnego frameworka i uzupełnia luki
(milestone-mail, survey-routing, checklist zrobiony wg §1.5, empty-states audyt, pełna instrumentacja,
dashboard aktywacji).

---

## STAN WDROŻENIA (aktualizować)
- [x] Research ×3 (Sonnet 5) — `docs/stworze/onboarding/RESEARCH-1..3.md` — 2026-07-16
- [x] SSOT (ten dokument) — 2026-07-16
- [x] Research AI-async (Sonnet 5) — `docs/stworze/onboarding/RESEARCH-AI-ASYNC.md` + §4b „Aha za async-AI" — 2026-07-17
- [x] Krok `onboarding` dodany: `wfa_step_defs` (stage 3, sort 88, owner admin, milestone „Onboarding gotowy — user wie, co robić") + WS (checklista §3) + prompt sesji (streszcza §3) w `tn-app/projekt.html`; ensure_steps dla Dobry Wstęp + fachmat — 2026-07-16 (migr. `20260716f_wfa_krok_onboarding.sql`)
- [x] Standard fabryki (starter scaffolding) — LIVE 2026-07-17. Checklist `@dsChecklist` (1. pre-checked, aha tylko realnym eventem), welcome survey, empty-states, instrumentacja stałych eventów, silnik maili (milestone trwały, seria gaśnie po aha, budżet 1/przebieg, List-Unsubscribe One-Click), dashboard aktywacji (lejek po step_index + kotwica t0, JTBD k-anon, rozkład TTFV). **Siatka bezpieczeństwa:** gate FAIL na `ONBOARDING_CONFIGURED=false` / `TODO —` (public+edge) / `<placeholder_nazwy>` + runtime-guard w `sendTpl`. Spójność aha: jedna nazwa w 3 miejscach (onboard core.event + AHA_EVENT + track). 3 rundy krytyka (UX+inżynier) + 3 rundy poprawek. Commity saas-starter `80f68a1`/`d873391`.
- [x] **Wdrożenie Dobry Wstęp** (aha = pierwszy PLAN) — LIVE 2026-07-17. Wave 1 (checklist §1 + dashboard aktywacji + milestone) `4c2d91f`; poprawki krytyka A/B/C (krok-aha kontynuuje szkic, jeden ruch, mobile FAB) `70acda4`; Wave 2a async-AI UX generacji (etapy zamiast spinnera + retry/fallback + eventy) `c4f1814` + polish `d59e470`; guard świeżości milestone `c556704`. Krytyk wizualny (2×) = „proste, lekkie, buduje zaufanie". edge admin-stats+lifecycle-emails deployed. **Wave 2b = bramka Tomka** (tabela `generations`, instrumentacja edge rdzenia, sweep porzuceń, nudge A/B — plan: `docs/stworze/onboarding/` + §4b).
- [~] **Wdrożenie Fachmat** (aha = pierwszy PDF, SYNCHRONICZNY — §4b async-AI nie dotyczy aha) — KOD KOMPLETNY na gałęzi `feat/onboarding` (`7ea9016`), obie bramki (GATE A SEC-CHECK + GATE B smoke 5/5) zielone, audyt adwersarski 0 BLOCKER/0 HIGH. Checklist §1 (enhance in-place), dashboard aktywacji (activation odporne na env), milestone + guard świeżości, fix domyślnego `AHA_EVENT`. **Deploy prod = bramka Tomka** (apka LIVE z operatorem Grzegorzem): merge→main (front+dashboard), edge deploy (`--no-verify-jwt --project-ref cpzstoyvpfqydmoutcmk`), OPS sekret `AHA_EVENT=offer_pdf_generated`, `db push` 0026 (hard-dedup). Guard świeżości eliminuje falę backfillu.
