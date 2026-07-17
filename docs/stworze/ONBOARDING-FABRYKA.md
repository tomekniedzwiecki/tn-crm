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

## 6. TAKSONOMIA TYPÓW AHA + PUNKTY WARIACJI (rdzeń — czytać PRZED projektowaniem apki)

> Wniosek z red-teamu fabryki (2026-07-17): §0-§5 były dopracowane dla JEDNEJ klasy niszy — **aha-solo-instant**
> (wartość powstaje z akcji SAMEGO usera, w tej samej sesji, emitowana klienckim `track()`). §4b dodał
> **aha-solo-async-AI**. Cztery UKRYTE ZAŁOŻENIA rdzenia (Z1-Z4) pękają na innych niszach — a fabryka celowo
> robi RÓŻNE nisze. Krok `onboarding` MUSI najpierw sklasyfikować typ aha; domyślne = obecny stan (obie
> zrobione apki bez zmian).

**Z1-Z4 (założenia do świadomego łamania):** Z1 aha emituje sam user, klientowo, w sesji · Z2 TTFV w minutach,
okno kohorty 7 dni, alarm <20%, trial 14 dni — zaszyte na stałe · Z3 droga do aha w pełni w rękach usera ·
Z4 wartość SOLO (1 user → 1 wartość, grain=user).

| Typ aha | Kto/co daje wartość | Kiedy | Reguły specyficzne |
|---|---|---|---|
| **solo-instant** *(default)* | user, in-app | sesja, minuty | Obecny standard bez zmian. |
| **solo-async-AI** | model AI | sesja, 10-60 s | §4b (`generation.js`). |
| **od-third-party** *(booking)* | inny aktor (gość) | godz.-dni | Aha SERWEROWE (webhook→app_events dla właściciela). Krok `awaiting` + „zrobione po Twojej stronie". Furtka = akcja TESTOWA, nie fałszywy seed. Nudge tylko gdy NOT `setup_completed`. |
| **po-integracji** *(dashboard/raporty)* | dane z podłączonego źródła | min. (sync)/async | Empty-state „Podłącz", nie „Utwórz". Demo-mode = DOMYŚLNY nośnik aha PRZED integracją. §1.11 „opcjonalne" NIE obowiązuje — integracja to pełny krok Setup. Aha serwerowe po ETL. |
| **zespołowe** *(multi-user)* | zespół (≥N członków) | dni | `activation_grain=workspace` (encja `accounts`). Dwie persony (owner/członek) = różne `ONBOARDING_STEPS` (wymaga `opts.steps`). Aha serwerowe na poziomie workspace. Zaproszeni POZA lejkiem trialu. |
| **marketplace-dwustronne** | druga strona | dni (po płynności) | Survey wybiera STRONĘ → różny checklist/empty/aha/dashboard per strona. Liquidity concierge (realna podaż operatora) zamiast seedu. Dwa niezależne aha + dwa lejki. |
| **długocyklowe** *(SEO/windykacja/oszczędzanie)* | świat/czas | dni-tygodnie | Trial ≥ TTFV LUB gating value-metered (paywall po wartości, nie po zegarze). **Leading proxy-aha** (wcześnie mierzalny kamień przewidujący wartość) jako `activated` + `realized_value` osobno. Skala dni w kubełkach/oknach. „Aha oczekiwania" (widoczny harmonogram „co i KIEDY się wydarzy") w sesji 1. Reengagement nie myli „czeka na wartość" ze „stalled". |

**9 JAWNYCH PUNKTÓW WARIACJI (krok `onboarding` ustawia, z domyślną):**
1. `aha_type` ∈ taksonomia — *default: solo-instant*.
2. `aha_source`: client-track | **server-webhook** — *default: client-track*. **[Z1-fix — najważniejsza uniwersalna poprawka]** rozszerz „KONTRAKT AHA" o 4. dozwolone źródło: event wstawiony SERWEROWO (service-role, `user_id`=właściciel) gdy wartość przychodzi async/od innego aktora. Checklist to zniesie bez zmian (nasłuchuje app_events po user_id).
3. `activation_grain`: user | workspace — *default: user*.
4. `ONBOARDING_STEPS` per segment/rola/strona — *default: jedna tablica*. **[fix silnika]** `initChecklist(ctx, {steps})` — override tablicy kroków; bez tego dwustronne/zespołowe NIEWYRAŻALNE.
5. krok `awaiting`/`enablingCta` (akcja usera vs oczekiwanie na świat) — *default: brak*. **[fix `renderChecklist`]** stan „zrobione po Twojej stronie — czekamy na X" zamiast „aktywne CTA" sugerujące porażkę usera.
6. `expected_ttfv` → napędza: krawędzie kubełków TTFV, okno kohorty (`ACT_WINDOW_D`), próg alarmu, okna serii maili, `IDLE_DAYS`, `trial_days` — *default: minuty/7 dni/14 dni*. **[Z2-fix]** dziś stałe w kodzie.
7. model furtki (§1.7d): sample-data | action-test | concierge/liquidity | demo-mode — *default: sample-data*.
8. gating: time-trial | value-metered — *default: time-trial 14 dni*. **NAJGROŹNIEJSZY POJEDYNCZY BŁĄD: trial czasowy < TTFV → paywall przed pierwszą wartością.**
9. nudge-suppression: activation_step/nudge tylko gdy `activated_at IS NULL` **AND NOT (`setup_completed` OR awaiting-external)** — *default: samo `activated_at IS NULL`* (dziś nadgorliwe wobec czekających — łamie własny zakaz nudge-„wyrzutu").

---

## 7. ROZSZERZENIA UNIWERSALNE 2026 (research zewn. + krytyk kompletności — obowiązują KAŻDĄ apkę)

Reguły do dopisania do §1/§2/§1.16 (triangulowane z 2-3 źródeł; źródła w `docs/stworze/onboarding/`).

**A11Y i mobile [NAJWIĘKSZA DZIURA — prawnie wymagane w UE od 28.06.2025, EAA/WCAG 2.2 AA]:** onboarding i maile spełniają WCAG 2.2 AA jako baseline — touch-target ≥24×24 px, widoczny nie-zasłonięty focus, kontrast ≥4.5:1, pełna klawiatura, `aria-live="polite"` na pasku postępu checklisty, **ZERO ponownego pytania o dane już podane (Redundant Entry)**, auth bez testów poznawczych (magic-link/hasło OK). Każdy ekran i mail projektowany NAJPIERW na 375 px. Gate: `axe-core` w E2E na 3 powierzchniach (survey/checklist/empty-state). **Weryfikacja wizualna: PASS ≠ brak overflow — oceniaj REALNĄ jakość + łap klatki W TRAKCIE animacji + SAM zobacz zrzuty + iteruj lokalnie** (pamięć `feedback-weryfikacja-wizualna-jakosc-nie-overflow`; incydent hero mobile 17.07).

**PAS ZAUFANIA (lęk#1=scam) [uniwersalny dla persony B2B/JDG]:** każdy onboarding niesie stały, widoczny sygnał legitymacji OD PIERWSZEGO EKRANU: kto stoi za produktem (twarz/realna firma/NIP), co dzieje się z danymi (link do trust page), 1 dowód (case/liczba), 1 żywy kanał kontaktu. Mikro-sygnał zaufania + „po co to pole" przy KAŻDYM polu Setup. Minimalizacja: nie zbieraj danych wrażliwych przed aha.

**WARTOŚĆ PRZED REJESTRACJĄ + artefakt „do zabrania":** rozważ demo-aha PRZED rejestracją (podgląd/próbka na jednym wejściu). Gdy aha musi być za loginem — pierwsza sesja MUSI wytworzyć artefakt, który user ZACHOWA nawet bez powrotu (i który jest hakiem winbacku). Bije w 98%-churn-w-2-tyg.

**PROGRESSIVE PROFILING jako MECHANIKA (nie tylko §1.1):** rejestracja ≤2 pola; każde kolejne pole zbierane KONTEKSTOWO przy pierwszym użyciu funkcji, która go wymaga (z „po co teraz") — nigdy batch, nigdy 2× (spina się z WCAG Redundant Entry). Event `profile_field_captured{field}`; wskaźnik kompletności z eventów, nie osobny formularz. ZAKAZ kroku „dokończ profil".

**AGENT DOMYKA SETUP „ZA MNIE" [naturalne dla niszy „mało czasu, nietechniczny", >2× aktywacji]:** gdzie setup ma >2 pola/decyzje, DOMYŚLNĄ ścieżką jest agent wypełniający je z inputu usera (dane z KRS/strony → gotowa konfiguracja do AKCEPTACJI); user tylko zatwierdza, ręczne klikanie opcjonalne. Aha = zaakceptowana konfiguracja + 1. wynik. Rozszerzenie §4b poza „ładne czekanie".

**DWA KPI CZASU + metoda odkrycia aha:** panel mierzy TTFV (do 1. wartości) ORAZ **TTCV = czas do `habit`** (nawyk = predyktor retencji) — OSOBNO. Aha odkrywaj metodą: kohorta retencjonowana 30d vs porzucona → NAJWCZEŚNIEJSZA akcja rozdzielająca kohorty → eksperyment na kauzalność. Cele TTFV per-KATEGORIA, nie z cross-firmowej średniej.

**DELIVERABILITY SLO + tier SMS:** silnik maili nie startuje bez SPF+DKIM+DMARC domeny; complaint <0,1% / hard-bounce <0,5% → auto-pauza kindu. Zdefiniuj 1-2 momenty time-critical per apka jako SMS-eligible (porzucona generacja, ostatni dzień trialu) — SMS tylko gdy user podał telefon i tylko transakcyjny/aktywacyjny, nigdy marketing.

**RESURRECTION jako OSOBNY etap [4. stan, ≠ nigdy-aha, ≠ rezygnacja]:** user BYŁ aktywowany, złapał częściowy nawyk, zniknął bez rezygnacji subskrypcji. Event `resurrected` (powrót po N dni idle), własna kohorta w panelu, dedykowany motion (mail/SMS zakotwiczony w JEGO minionej wartości + „co się zmieniło"). Segment `lifecycle-emails`: `activated_at IS NOT NULL AND last_active_at < now()-N AND status ∈ trialing/paying`. Guard świeżości jak milestone. Rozłączny od `activation_nudge` i `winback`.

**META-ONBOARDING OPERATORA [głęboka luka — dziś ZERO]:** operator (klient fabryki, płacący) wchodzi w pusty `admin.html` bez prowadzenia — paradoks („pusty ekran = porzucenie"). Własna checklista „Pierwsze kroki operatora" (reuse `@dsChecklist`): {ustaw ceny, potwierdź `aha_type`+`AHA_EVENT`+próg, wyślij 1. „Co nowego", zajrzyj w dashboard aktywacji, ustaw kill-switch/testowego usera}. Operator-empty-states na zakładkach. „Operator activated" = pierwszy NIETESTOWY user apki osiągnął aha.

**POMIAR JAKOŚCIOWY drop-offu (dlaczego, nie tylko ile):** mikro-prompt 1-tap przy porzuceniu Setup / po N bezczynności w oknie onboardingu („Co Cię zatrzymało?" — 3-4 gotowe powody + opcjonalne pole) → event `onboarding_friction{step, reason}` → kafel „Powody porzucenia". Lejek mówi GDZIE, to mówi DLACZEGO (inaczej pętla krytyka zgaduje).

**PROGI HANDOFFU do człowieka (uogólnienie §4b na całą apkę):** proaktywny ALERT do operatora (nie autonomiczna wysyłka) gdy: HIGH-INTENT bez aha (dodał kartę/zapłacił, brak `activated` > Xh), 2× `generation_failed` LUB powtarzalne `client_errors` usera, feedback z negatywnym sentymentem, powrót po długiej nieobecności bez akcji. Próg = punkt wariacji per apka.

**CHANGELOG ↔ ONBOARDING (dwa audytoria, te same mechanizmy):** bramkuj ogłoszenia „Co nowego" po wieku konta/aktywacji (badge tylko dla userów PO onboardingu — nowy user nie dostaje ogłoszeń o funkcjach, których nie miał). Przy MAJOR funkcji dla ISTNIEJĄCYCH userów: `feature-onboarding` = mini-checklista/`showTip` przy funkcji, nie modal na loginie.

**ONBOARDING TO SYSTEM ŻYWY (poziom fabryki):** „wdrożony" ≠ „skończony". Po launchu, przy kohorcie ≥N, największy drop-off z lejka §1.16 atakowany KWARTALNIE 1 zmianą + pomiarem (A/B lub before/after).

**UCZENIE MIĘDZY APKAMI [waga ROŚNIE z każdą apką — sedno „fabryki"]:** (a) lekki przydział wariantu w `track.js` (stabilny hash usera → property `variant` na eventach; dashboard rozbija activation po wariancie); (b) centralny widok w tn-crm „activation across apps" (ta sama rura co cron ai-billing) → mediany TTFV/activation per NISZA zasilają realne progi §1.16; (c) FORMALNA zasada: wzorzec wygrany na jednej apce = backport do `saas-starter`.

**WERSJONOWANIE ONBOARDINGU:** przy zmianie `ONBOARDING_STEPS` na żywej apce stan RE-DERIVUJ z app_events (trwałe), NIGDY z localStorage (ulotne) + stempel `onboarding_version`. (Uogólnienie gotchy `wfa_steps.data->checklist`.)

**PUNKTY WARIACJI (standard NAZYWA, nie narzuca):** i18n/podstawa prawna maila (dziś PKE/PL zaszyte — dla innego rynku = konfig), integracja-jako-prerekwizyt, multi-user/team/seat, PWA install & push priming (`beforeinstallprompt` po 1. wartości, nie na load).

---

## 8. DOPRECYZOWANIA ANTI-DRIFT (audyt 3 implementacji — usuwają dwuznaczności, które już zrodziły dług)

1. **Komponent (§4 w. „`@dsChecklist`?"):** REGUŁY §1.5 + KONTRAKT EVENTÓW §1.14 IDENTYCZNE we wszystkich apkach; komponent = wspólny silnik startera (`initChecklist`, config-only) PREFEROWANY. Własna implementacja dozwolona TYLKO z (a) tymi samymi klasami `@dsChecklist`, (b) testem E2E kontraktu eventów. (Dziś 3 forki: starter/DW/Fachmat.)
2. **Survey (§1.2):** wymagany TYLKO gdy odpowiedź JTBD realnie ROUTUJE ścieżkę; apka jedno-ścieżkowa może pominąć, ale MUSI to udokumentować i dostarczyć wymiar segmentu z innego pola (albo jawnie zadeklarować `segments:[]`).
3. **`setup_completed` (§1.14):** emituje SILNIK onboardingu po ukończeniu kroków prerekwizytowych; apka NIE MOŻE zastąpić go eventem domenowym (panel operatora wspólny). Kotwica lejka = JEDNA nazwa `signed_up` (nie `signup`).
4. **Spójność aha [egzekwuj, nie honor-system]:** aha = JEDNA współdzielona stała (front) + hardcode edge-defaultu do niej + **detektor w `audit-static`/`preflight`, że `AHA_EVENT` (jeśli ustawiony) == stała**, ORAZ (obowiązkowo) **env-niezależna aktywacja w dashboardzie** (activated_at OR 1. event aha z app_events + flaga `activated_from_fallback`) — by rozjazd env nie mógł wyzerować metryki (wzorzec Fachmata; incydent już wystąpił).
5. **Dedup one-time maili (§2):** KANONICZNA lista (welcome, activation_step, activation_nudge, milestone, winback_1, trial_ending, trial_ending_inactive, trial_expired, trial_tip_1..3, trial_half) MUSI być w `email_log_once_delivered_idx` w KAŻDEJ apce.
6. **Opt-out + List-Unsubscribe (§2):** egzekwowane CENTRALNIE w `sendTpl` (defense-in-depth po `DEFAULTS[kind].marketing`), nie w pojedynczych sekcjach + guard placeholdera `TODO —` w `sendTpl`. (Dług: DW/Fachmat miały starą `sendTpl` → winback do wypisanych = PKE; naprawiane.)
7. **Budżet maili (§2):** KAŻDA sekcja serii (także welcome/activation_step/nudge) sprawdza `mailedThisRun` przed wysyłką.
8. **Dashboard — do standardu:** clamp `step_index`[0,50] + `step_name`≤64 + cap ~30 kroków (anty-DoS lejka wstrzykniętym eventem) + env-niezależna aktywacja (p.4). Limit `step_name` ujednolicony = 64, `step_index` zawsze dołączany.
9. **§4b — apka-źródło przyjmuje uogólnienie:** po backporcie+uogólnieniu komponentu apka źródłowa (DW) MUSI przyjąć wersję generyczną (`meta.fallbackHref/Label/Note`), nie trzymać forka z zaszytym `kind==="plan"`/`factsHref`.
10. **Guard REGRESJI w apce:** każda apka ma asercję E2E/smoke: (1) checklist się renderuje, (2) `onboarding_step_done` leci z kontraktem, (3) `activated_at` ustawia się po realnym aha.

---

## STAN WDROŻENIA (aktualizować)
- [x] Research ×3 (Sonnet 5) — `docs/stworze/onboarding/RESEARCH-1..3.md` — 2026-07-16
- [x] SSOT (ten dokument) — 2026-07-16
- [x] Research AI-async (Sonnet 5) — `docs/stworze/onboarding/RESEARCH-AI-ASYNC.md` + §4b „Aha za async-AI" — 2026-07-17
- [x] Krok `onboarding` dodany: `wfa_step_defs` (stage 3, sort 88, owner admin, milestone „Onboarding gotowy — user wie, co robić") + WS (checklista §3) + prompt sesji (streszcza §3) w `tn-app/projekt.html`; ensure_steps dla Dobry Wstęp + fachmat — 2026-07-16 (migr. `20260716f_wfa_krok_onboarding.sql`)
- [x] Standard fabryki (starter scaffolding) — LIVE 2026-07-17. Checklist `@dsChecklist` (1. pre-checked, aha tylko realnym eventem), welcome survey, empty-states, instrumentacja stałych eventów, silnik maili (milestone trwały, seria gaśnie po aha, budżet 1/przebieg, List-Unsubscribe One-Click), dashboard aktywacji (lejek po step_index + kotwica t0, JTBD k-anon, rozkład TTFV). **Siatka bezpieczeństwa:** gate FAIL na `ONBOARDING_CONFIGURED=false` / `TODO —` (public+edge) / `<placeholder_nazwy>` + runtime-guard w `sendTpl`. Spójność aha: jedna nazwa w 3 miejscach (onboard core.event + AHA_EVENT + track). 3 rundy krytyka (UX+inżynier) + 3 rundy poprawek. Commity saas-starter `80f68a1`/`d873391`.
- [x] **Wdrożenie Dobry Wstęp** (aha = pierwszy PLAN) — LIVE 2026-07-17. Wave 1 (checklist §1 + dashboard aktywacji + milestone) `4c2d91f`; poprawki krytyka A/B/C (krok-aha kontynuuje szkic, jeden ruch, mobile FAB) `70acda4`; Wave 2a async-AI UX generacji (etapy zamiast spinnera + retry/fallback + eventy) `c4f1814` + polish `d59e470`; guard świeżości milestone `c556704`. Krytyk wizualny (2×) = „proste, lekkie, buduje zaufanie". edge admin-stats+lifecycle-emails deployed. **Wave 2b = bramka Tomka** (tabela `generations`, instrumentacja edge rdzenia, sweep porzuceń, nudge A/B — plan: `docs/stworze/onboarding/` + §4b).
- [x] **Wdrożenie Fachmat** (aha = pierwszy PDF, SYNCHRONICZNY) — LIVE PROD 2026-07-17 (decyzja Tomka „daj wszystko live"). Merge→main `7ea9016` (front `?v=20260726` na fachmat.pl + zakładka Aktywacja), edge `admin-stats`+`lifecycle-emails` deployed (`cpzstoyvpfqydmoutcmk`), migracja `0026` (hard-dedup milestone) zaaplikowana przez MCP, sekret `AHA_EVENT=offer_pdf_generated` ustawiony (był rozjazd — brak sekretu, domyślne `activated`). Bramki GATE A/B zielone, audyt adwersarski 0 BLOCKER. Checklist §1 (enhance in-place), dashboard aktywacji (odporne na env), milestone + GUARD ŚWIEŻOŚCI (eliminuje falę backfillu — milestone tylko dla aktywowanych ≤7 dni). UWAGA: przy najbliższym cronie lifecycle-emails milestone może dojść do userów aktywowanych w ostatnich 7 dniach (w tym konta testowe Grzegorza) — wyłącznik: `app_settings.mail_tpl_milestone enabled:false`.
- [x] **Wave 2b-A (Dobry Wstęp)** — LIVE 2026-07-17. Tabela `generations` (migr. 0026, RLS row-own + operator SELECT), instrumentacja best-effort `prep-research`/`prep-plan` (taksonomia fail_reason, model_latency_ms, alert quota), sweep porzuceń w lifecycle-emails. Parytet happy-path zachowany. + migr. 0025 (hard-dedup milestone).
- [x] **Fix PKE opt-out (obie apki)** — LIVE 2026-07-17. `winback_1`→`marketing:true` + centralny gate opt-out w `sendTpl` + guard placeholdera + budżet `mailedThisRun` w welcome/nudge; Fachmat migr. `0027` (przywraca `trial_tip_*` do dedup idx — regresja 0026). DW `baadaba`, Fachmat `bbc3415`, redeploy `lifecycle-emails` obu.
- [x] **Pętla udoskonalania fabryki — fala 1** — 2026-07-17. 4 soczewki (research zewn. Sonnet 5 + red-team 5 nisz + krytyk kompletności + audyt rozjazdu 3 impl.) → **§6 taksonomia aha + 9 punktów wariacji**, **§7 rozszerzenia 2026**, **§8 anti-drift**. Prompt kroku `onboarding` zaktualizowany (`03c61221`). Hardening startera LIVE (`ce9bc0a`): dashboard env-niezależny + `activated_from_fallback`, clamp step_index/name + cap, `initChecklist(ctx,{steps})`, a11y baseline (focus-visible, touch≥24px, aria-live), `ONBOARDING_ACTIVATION_CONFIG`.

- [x] **Backlog fala F1 (kontynuacja 17.07)** — WDROŻONE do startera (`saas-starter` `59c5a74`/`946d80c`/`444b952`) + apki: meta-onboarding OPERATORA (`operator-onboard.js` + `operator_activated`), stan kroku `awaiting`, `_shared/aha.ts emitServerAha` (4. źródło aha), pas zaufania `trustBar`, pomiar jakościowy `askFriction`, variant cross-app, progressive profiling `captureProfileField`, resurrection (osobny etap, migr. starter 0021), detektor spójności aha + a11y hook w `audit-static`, `LIFECYCLE_TIMING`+`EXPECTED_TTFV_DAYS` (okna serii/IDLE skalowane) + anti-„wyrzut" nudge. Dług apek: DW przyjął generyczny `generation.js` + render KPI generacji (`a509f02`); Fachmat emituje `setup_completed` (`b8a8106`, admin-stats redeploy). PKE opt-out fix wdrożony w obu (`baadaba`/`bbc3415`).

- [x] **Backlog fala F2 (kontynuacja 17.07, tryb AUTONOMIA)** — WDROŻONE. Starter (`saas-starter` `5dc20ac`): Deliverability SLO (bramka `mail_domain_verified` + auto-pauza `mail_health_<kind>` przy complaint>0,1%/bounce>0,5% w resend-status-webhook + `isKindHealthy` w sendTpl, migr. 0022), tier SMS provider-agnostyczny (`_shared/sms.ts`, default off + `profiles.phone`/`sms_opt_in`), value-before-signup (`demoAhaGate`+`markKeepable`), agent-domyka-setup (`agentSetup` reuse `runGeneration`), helper `activation-push`. DW plan-core (`_shared/plan-core.ts` — regeneracja serwerowa nudge, PARYTET prep-plan bajt-w-bajt, deployed). **Central „activation across apps" LIVE + ZWALIDOWANE end-to-end**: tn-crm `wfa_activation_stats` (migr. `20260717f`) + edge `wfa-activation-ingest` (deployed, sekret, POST testowy→activation_rate 40%→zapis→sprzątnięte) + panel `/tn-app/activation`; `activation-push` wdrożony+env w DW i Fachmat (READY; dobowy cron = krok start per apka). Forge test wzbogaconego startera = wszystkie komponenty propagują. **Autonomia zakodowana** (pamięć `feedback-autonomia-maks-runway` + `METODYKA-BUDOWY.md §0`).

- [x] **Walidacja integracyjna F1+F2 (kontynuacja 17.07)** — holistyczny krytyk integracji wzbogaconego startera: „INTEGRACYJNIE spójny, gotowy dziedziczyć — bez blokerów". 5 wykrytych styków między równoległymi sesjami NAPRAWIONE + wdrożone (starter `489a92c`): (1) auto-pauza SLO wyłącznie marketing (dunning/welcome/milestone nigdy wyciszane — ryzyko przychodu), (2) etykiety `ttfv_buckets` bajt-identyczne admin-stats↔activation-push, (3) `by_variant` serwerowy (hash FNV-1a==track.js), (4) once-index `0023` pełna lista jednorazowych, (5) `operator_activated` pomija adresy testowe. `activation-push` z poprawkami re-propagowany+deployed w DW i Fachmat. Forge test wzbogaconego startera = OK.

### BACKLOG (POZOSTAŁE — priorytet malejący)
Praktycznie wyczerpany w falach F1+F2 (2026-07-17), zwalidowany integracyjnie. ZROBIONE: central activation-across-apps · value-before-signup · agent-domyka-setup · axe-core a11y gate · Deliverability SLO · tier SMS · plan-core regeneracja serwerowa · meta-onboarding operatora · awaiting · server-aha · detektor aha · expected_ttfv · resurrection · friction · variant/progressive-profiling. POZOSTAJE:
- **Fachmat: migracja onboardingu z `pulpit.js` do wspólnego silnika `@dsChecklist`** — NISKI priorytet: enhance in-place DZIAŁA (dozwolona wariacja §8 p1), refaktor działającej funkcji na LIVE apce = niska wartość/ryzyko → gałąź+preview gdy będzie sens.
- **Ops per apka (krok start):** włączyć dobowy cron `activation-push` (pg_cron+pg_net, `timeout_milliseconds:=5000`, klucz service-role z Vault) — dziś funkcja+env READY, cron = bramka startu apki.
- **Uogólnienia „na później":** progi handoffu do człowieka (§7), changelog↔onboarding gating (§7), pełna implementacja providera SMS (dziś abstrakcja+HTTP generic) — dopracować gdy pojawi się realna potrzeba niszy.

### BACKLOG-DONE (referencja, świadomie odłożone → zrobione w F1)
1. **Meta-onboarding OPERATORA** (§7) — checklista „Pierwsze kroki operatora" + operator-empty-states w `admin.html`. Największa luka wg krytyka kompletności (dziś ZERO). Reuse `@dsChecklist`.
2. **Stan `awaiting`/`enablingCta`** w `renderChecklist` (§6 pkt 5) — dla aha od-third-party/po-integracji/zespołowe („zrobione po Twojej stronie — czekamy na X"). Bez tego czekający wygląda jak porażka + nudge-„wyrzut".
3. **Komponent/wzorzec server-aha** (§6 pkt 2, `aha_source=server-webhook`) — helper wstawiania eventu aha service-rolem (`user_id`=właściciel) dla wartości async/od innego aktora. Checklist już zniesie (nasłuch po user_id).
4. **Detektor aha „jedna nazwa w 3 miejscach"** w `audit-static`/`preflight` (§8 p4) — mechaniczny check `AHA_EVENT == stała frontu` (dashboard-fallback już jest, detektor nie).
5. **Pełne wpięcie `expected_ttfv`** w `lifecycle-emails` (§6 pkt 6) — okna serii, `IDLE_DAYS`, `trial_days` spięte z jednym parametrem (dziś dashboard sparametryzowany, lifecycle nie). **Krytyczne dla nisz długocyklowych** (trial<TTFV=paywall przed wartością).
6. **Resurrection jako osobny etap** (§7) — event `resurrected` + kohorta + motion (`activated_at NOT NULL AND last_active_at<now()-N AND status∈trialing/paying`).
7. **Pomiar jakościowy drop-offu** (§7) — `onboarding_friction{step,reason}` mikro-prompt przy porzuceniu + kafel „Powody porzucenia".
8. **Uczenie między apkami** (§7) — property `variant` w `track.js` (A/B) + centralny widok „activation across apps" w tn-crm (rura ai-billing).
9. **Deliverability SLO auto-pauza + tier SMS** (§7); **progi handoffu do człowieka** uogólnione (§7); **changelog↔onboarding** gating + feature-onboarding (§7).
10. **Progressive profiling mechanika** (`profile_field_captured` just-in-time) (§7); **value-before-signup + keepable artifact** (§7); **agent domyka setup** (§7); **a11y axe-core E2E gate** + **pas zaufania** komponent (§7).
11. **Wave 2b pełna regeneracja serwerowa nudge** — wydzielenie `_shared/plan-core.ts` z `prep-plan` (refaktor rdzenia, parytet+E2E) → nudge dostarcza GOTOWY plan zamiast resume-linku.
12. **Dług apek:** DW przyjmuje generyczny `generation.js` (`meta.fallbackHref/Label/Note`, usuń fork `kind==="plan"`); Fachmat emituje `setup_completed` (dziś liczy setup z `offer_created`) + poprawić martwy komentarz `admin-stats`; docelowo Fachmat migruje onboarding z `pulpit.js` do wspólnego silnika `@dsChecklist`.
