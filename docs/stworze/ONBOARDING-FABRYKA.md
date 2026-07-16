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
- [ ] Standard fabryki (starter scaffolding + krok wfa_step_defs + prompt + template/CLAUDE.md)
- [ ] Wdrożenie Dobry Wstęp (aha = pierwszy wygenerowany PLAN)
- [ ] Wdrożenie Fachmat (aha = pierwszy wygenerowany PDF oferty)
