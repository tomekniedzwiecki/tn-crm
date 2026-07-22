# 01-MVP-SCOPE — Majster Blisko (nazwa robocza) · SCOPE v1 ZATWIERDZONY

> Zbudowane z: HANDOFF-PACK.md (12 sekcji) · KNOWHOW-ITEMS.md (164 poz.) · PREVIEW-BRIEF.json · DECYZJE.md (D-01..D-14, A-01..A-07, B-01).
> Status: **ZATWIERDZONY** (decyzja Tomka 20.07: rozstrzyga SESJA, nie proponuje; Tomek nadpisuje jednym zdaniem; akcept merytoryczny = klient przy demo).
> Projekt wfa: `e3c7f9e8-87c9-4e06-bf9e-3f744dfbb13e` · sesja spar: `637ef07e-883d-4e5a-9e2d-886837904550` · klient/operator: inwestobiznes@gmail.com.
> Zasada nadrzędna: najszybszy go-to-market, zero przekombinowania, v1 = drobne prace w JEDNYM mieście. Typ aha (ONBOARDING §6): **marketplace-dwustronne** — dwa niezależne aha, dwa lejki.

---

## 1. Definicja v1 + USP

**Definicja (1 akapit).** Majster Blisko to aplikacja dla jednego miasta, w której klient prywatny bezpłatnie publikuje drobną, lokalną pracę domową (zdjęcie + opis + kategoria + lokalizacja + termin), a fachowcy z abonamentem widzą zlecenia ze swojego powiatu i odpowiadają krótką ofertą (widełki ceny albo propozycja oględzin). Klient porównuje oferty, wybiera wykonawcę — dopiero wtedy ujawniany jest kontakt — strony dogadują szczegóły w komunikatorze, aplikacja robi z rozmowy podsumowanie ustaleń do podwójnej akceptacji, po realizacji obie strony wystawiają sobie oceny, a spory rozstrzyga ręcznie operator. Monetyzacja jest jednostronna: klient płaci 0 zł, fachowiec/firma płaci abonament miesięczny za dostęp do lokalnych zleceń (jednostka = powiat).

**USP (1–2 zdania).** „Drobna naprawa? Majster jest blisko" — klient w mniej niż minutę i za darmo dociera do realnych, lokalnych fachowców ze swojej okolicy, a fachowiec płaci za sam dostęp do świeżych zleceń z własnego powiatu, nie za każdy kontakt. Przewaga nad grupami na Facebooku i szukaniem numerów: gęsta lokalna podaż w jednym mieście, ochrona danych do momentu wyboru oferty i dwustronna reputacja.

**Kierunek wizualny (z PREVIEW-BRIEF — wiążący dla UI, nie dla scope):** ciepłe piaskowe tło `#F3EFE5`, kremowe karty `#FFFDF7`, energetyczny pomarańcz `#F05A28` (akcent/CTA), robocza zieleń statusów `#2F7D57`; mocny zwarty grotesk, duże ceny/odległości/terminy; zaokrąglenia 12 px, ciemne obrysy, krótkie offsetowe cienie; etykiety zleceń jak papierowe znaczniki z warsztatu. Praktyczny, roboczy interfejs czytelny w telefonie i dla seniorów.

---

## 2. FUNKCJE RDZENIA v1 (8 modułów)

Podział wg stron marketplace: **[W] wspólne (fundament obu stron)** · **[K] strona klienta** · **[F] strona fachowca** · **[O] panel operatora**. Zasada: 1 moduł ≈ 1 sesja (moduły cięższe dzielą się na podsesje — patrz §6).

### [W1] Konto, logowanie, lokalizacja — *fundament*
**W v1:** konto dla 4 ról (klient / fachowiec indywidualny / właściciel firmy / pracownik firmy). Logowanie dwuścieżkowe: e-mail+hasło (silnik startera) **oraz** telefon+kod SMS (Supabase Send SMS hook → SMSAPI, A-02/A-03). Telefon = pole obowiązkowe konta niezależnie od metody logowania (potrzebny do ujawnienia po wyborze oferty i do pilnych SMS). Profil pokazuje **wyłącznie imię** (bez nazwiska). Profil klienta: województwo/powiat/miasto-dzielnica + historia. Profil fachowca: zdjęcie, specjalizacje, obszar (opłacone powiaty), badge Firma/Osoba prywatna + faktura/rachunek (D-10), samodeklaracja SEP z numerem i datą ważności przy specjalizacji „Elektryka" (D-04). Lokalizacja = statyczny słownik TERYT w DB (powiat→miasto→dzielnica + centroidy lat/lng), odległość liczona haversine (A-05, D-01). **Bez zewnętrznego API map.** Schemat city-agnostic; seed = miasto startu + powiaty ościenne (czeka na B-01).
**Gotowe, gdy:** rejestracja i logowanie oboma kanałami działa E2E na koncie testowym; telefon wymagany i zweryfikowany; profile obu stron zapisują komplet pól; słownik TERYT zaseedowany dla miasta startu, a odległość na kartach zgadza się z haversine z centroidów.

### [W2] Uzgodnienie i realizacja — *pipeline domknięcia (wspólne)*
**W v1:** komunikator uruchamiany **dopiero po wyborze wykonawcy** — tekst, zdjęcia, dokumenty, wiadomości głosowe z automatyczną transkrypcją (OpenAI, A-04), edytowalną, z etykietą „edytowano". Aplikacja generuje **podsumowanie ustaleń** z rozmowy (AI, A-04). Akceptacja trzymana OSOBNO per strona; każda edycja dowolnej strony resetuje akceptację drugiej; blokada ogłoszenia następuje, gdy OBIE strony zaakceptowały tę samą ostatnią wersję (D-07). Po podwójnej akceptacji zlecenie nieedytowalne, ogłoszenie zablokowane dla innych fachowców. Statusy realizacji; fachowiec oznacza „zakończone" → licznik 4 dni startuje w tym momencie (D-08); klient potwierdza albo odrzuca z powodem + opcjonalnym zdjęciem → odrzucenie wraca do realizacji, drugie odrzucenie → kolejka operatora (D-09). Przypomnienia do klienta po 24 h i 72 h (push/e-mail, bez SMS); po 4 dobach ciszy auto-zamknięcie jako wykonane.
**Gotowe, gdy:** pełna pętla wybór→komunikator→podsumowanie→podwójna akceptacja→realizacja→zakończenie→(odrzucenie→ponowna realizacja)→auto-zamknięcie przechodzi E2E; transkrypcja i podsumowanie powstają z realnej rozmowy testowej; reset akceptacji po edycji działa; licznik 4 dni i przypomnienia wyzwalają się z właściwego momentu.

### [W3] Reputacja i powiadomienia — *sygnały zaufania (wspólne)*
**W v1:** dwustronne oceny 1–5 + komentarz, powiązane z zakończonym zleceniem (widoczne imię autora). Rezygnacje z listą usprawiedliwionych powodów (zmiana zakresu / niebezpieczne warunki / nagła choroba lub awaria — D-14): rezygnacja z powodem + opis + opcjonalny dowód nie obniża wskaźnika; druga strona może zakwestionować → kolejka operatora. Wskaźnik rzetelności (jawny scoring, D-11): score bazowy 100; każda nieuzasadniona rezygnacja z ostatnich 90 dni −25 pkt (max −75); powrót do 100 po 3 poprawnych realizacjach; wskaźnik NIE zmienia oceny gwiazdkowej — steruje pozycją ofert (sort po score DESC, czas ASC). Ostrzeżenie o kliencie po 3 nieuzasadnionych rezygnacjach, znika po 3 poprawnych. **Powiadomienia:** in-app (tabela+badge) + e-mail (Resend) + SMS (A-07). Wszystkie kanały domyślnie ON, ustawienia per kanał; fachowiec dodatkowo dni/godziny doręczeń (bez narzuconej ciszy nocnej). SMS wyłącznie dla „pilnej wiadomości" w aktywnym zleceniu: max 2/24 h per strona, blokada 2 dni po potwierdzonym nadużyciu (decyzja operatora).
**Gotowe, gdy:** oceny dwustronne zapisują się tylko po zamknięciu zlecenia; scoring i pozycja ofert liczą się deterministycznie z historii rezygnacji; ostrzeżenia pojawiają/znikają wg progów; powiadomienia docierają wszystkimi trzema kanałami wg ustawień; limit i blokada pilnych SMS egzekwowane.

### [K1] Publikacja i zarządzanie zleceniem — *strona klienta*
**W v1:** prosty, „seniorowy" formularz dodania **bezpłatnego** zlecenia: zdjęcia, opis „Co trzeba naprawić?", kategoria (hydraulika, elektryka, złota rączka, malowanie, montaż, drobne ślusarskie/budowlane, „Inna praca"), lokalizacja (miasto/dzielnica z listy → powiat ze słownika), termin (jak najszybciej / konkretny dzień / elastyczny), opcjonalna potrzeba faktury/rachunku. Rozróżnienie drobna praca vs duży remont przykładami; wybór „duży remont" → ekran informacyjny bez publikacji (D-06). Kategoria „Elektryka (instalacja)" dostaje flagę „wymaga uprawnień" (D-03); awaryjne otwieranie zamków i gaz — NIE pokazujemy wcale (D-05). Lista i szczegóły własnych zleceń ze statusami. Po opublikowaniu klient widzi natychmiastowe potwierdzenie zasięgu („Twoje zlecenie widzi N fachowców w powiecie X").
**Gotowe, gdy:** publikacja od zera na telefonie < 1 min; walidacja minimum (kategoria+lokalizacja+opis/zdjęcie+termin); flaga uprawnień ustawia się dla elektryki instalacyjnej; „duży remont" nie tworzy zlecenia; lista/szczegóły odzwierciedlają realne statusy; potwierdzenie zasięgu pokazuje realną liczbę fachowców z powiatu.

### [K2] Oferty i wybór wykonawcy — *strona klienta*
**W v1:** lista ofert do zlecenia — każda z widełkami ceny/propozycją oględzin, terminem, wiadomością, badge Firma/Osoba prywatna i ikoną faktura/rachunek; przy wykonawcy bez faktury/rachunku ostrzeżenie, a jeśli klient zaznaczył potrzebę dokumentu — wybór takiego wykonawcy wymaga dodatkowego potwierdzenia (D-10). Wybór wykonawcy: pozostałe oferty automatycznie zamykane „wybrano innego wykonawcę"; dopiero teraz ujawniany jest numer telefonu (dokładny adres klient przekazuje wybranemu bezpośrednio). Przy rezygnacji wybranego fachowca klient może przywrócić wcześniejsze oferty po ponownym potwierdzeniu dostępności wykonawców.
**Gotowe, gdy:** wybór ujawnia kontakt i zamyka pozostałe oferty; ostrzeżenie i twarde potwierdzenie „bez faktury" działają wg zaznaczonej potrzeby; ścieżka rezygnacja→przywrócenie ofert→ponowne potwierdzenie dostępności przechodzi E2E.

### [F1] Rynek zleceń i oferta fachowca — *strona fachowca*
**W v1:** pulpit „lista dnia" — nagłówki liczbowe („7 nowych zleceń", „3 do 5 km", „2 na dziś"), jedna lista kart (rodzaj naprawy, zdjęcie, dzielnica, odległość, termin), filtry specjalizacji (Hydraulika / Elektryka / Złota rączka …). Widoczność zlecenia = powiat zlecenia ∈ opłacone powiaty fachowca **+** zgodna specjalizacja (D-01). **Furtka wartości: fachowiec BEZ abonamentu widzi skrócony podgląd** realnych zleceń swojego obszaru (rodzaj/dzielnica/odległość/termin), bez danych kontaktowych i bez możliwości oferty — to dowód podaży przed zakupem. Szczegóły zlecenia + Q&A: fachowiec zadaje pytania przed ofertą; odpowiedzi fachowców zawsze publiczne, odpowiedź klienta z przełącznikiem „Widoczna dla wszystkich" (domyślnie) / „Tylko dla pytającego" (D-02). Formularz oferty (tylko z abonamentem): widełki ceny **albo** propozycja oględzin (D-06), termin, wiadomość, deklaracja faktury/rachunku. Do zlecenia z flagą „wymaga uprawnień" ofertę złoży tylko fachowiec z samodeklaracją SEP (D-04).
**Gotowe, gdy:** lista pokazuje wyłącznie zlecenia z opłaconych powiatów + specjalizacji, posortowane wg odległości/terminu; bez abonamentu widać skrócony podgląd bez kontaktu; Q&A z kontrolą widoczności działa; oferta z widełkami/oględzinami trafia do klienta; bramka SEP blokuje ofertę do zlecenia z flagą bez deklaracji.

### [F2] Monetyzacja: abonament, powiaty, firma — *strona fachowca*
**W v1:** Stripe Connect (konto Standard operatora, direct charges, `application_fee_percent` z `wfa_projects.fee_percent`, KYC = krok `stripe_kyc`; A-06). Abonamenty = Stripe Subscriptions; ceny brutto (kotwica D-13): 99 zł/mies. samodzielny fachowiec, 149 zł/mies. firma, +39 zł/mies. kolejny pracownik, +19 zł/mies. dodatkowy powiat. Plan roczny = równowartość 10 miesięcy (rabat tylko na abonament główny; dodatki płatne z góry za rok). **Bez okresu próbnego.** Podstawa = 2 powiaty; zmiana przypisania powiatów przy odnowieniu okresu; dodatkowy powiat aktywny natychmiast z proracją (Stripe proration), odnawia się automatycznie, po wyłączeniu działa do końca opłaconego okresu. Po wygaśnięciu abonamentu fachowiec przechodzi na bezpłatny skrócony podgląd. Panel firmy: właściciel administruje kontem, pracownikami (sloty — przypisanie osoby zmienne w czasie; oceny odchodzącego znikają z profilu publicznego, historia zostaje do sporów — D-12) i dwoma trybami obsługi (przydzielanie przez właściciela / samodzielne odpowiadanie pracowników). System pilnuje ważności deklaracji SEP pracownika przed przypisaniem do zlecenia z flagą; brak uprawnionego zastępcy = rezygnacja firmy. Rabaty operatora = Coupons + Promotion Codes startera.
**Gotowe, gdy:** zakup abonamentu, dokupienie powiatu z proracją i dodanie pracownika przechodzą E2E na Stripe testowym; po wygaśnięciu dostęp spada do skróconego podglądu; panel firmy przydziela zlecenia w obu trybach; kontrola ważności SEP blokuje przypisanie pracownika bez ważnej deklaracji.

### [O1] Panel operatora: spory, moderacja, aktywacja — *panel operatora*
**W v1:** kolejka „Spory i zgłoszenia" (D-09) z typami: drugie odrzucenie zakończenia, zgłoszenie nieobecności, nadużycie pilnych SMS, inne nadużycie. Operator widzi oś zdarzeń zlecenia + stanowiska obu stron (formularz odpowiedzi drugiej strony, termin 48 h), decyduje klikiem (uznaj / odrzuć / zamknij bez rozstrzygnięcia) z adnotacją; decyzja wyzwala skutki automatycznie (odblokowanie oceny, blokada SMS 2 dni, korekta wskaźnika rzetelności). **Dashboard aktywacji DWUSTRONNEJ** (standard fabryki, §1.16 ONBOARDING) — DWA lejki per strona (klient / fachowiec): activation rate, mediana TTFV, drop-off per krok, D7 retention; osobne progi per strona (§4). Meta-onboarding operatora: checklista „Pierwsze kroki operatora" (ustaw ceny, potwierdź aha per strona, pozyskaj podaż startową, zajrzyj w dashboard).
**Gotowe, gdy:** operator rozstrzyga każdy typ sporu, a skutki wykonują się automatycznie; dashboard pokazuje dwa niezależne lejki z realnymi eventami obu stron.

---

## 3. NIE-FUNKCJE v1 (świadome cięcia)

**Odłożone do v1.1+ (za DECYZJE.md i HANDOFF §10):**
- **Płatności za wykonaną usługę w aplikacji** — v1 monetyzuje tylko abonament; materiały i zapłatę za pracę strony rozliczają poza aplikacją (mniejszy zakres płatniczy, brak escrow/KYC klienta).
- **Awaryjne otwieranie mieszkań i samochodów (D-05)** — kategoria niepokazywana; wymaga realnej weryfikacji ślusarza i prawa do lokalu/pojazdu (ryzyko prawne nieproporcjonalne do startu).
- **Kategorie gazowe** — poza specjalizacjami rdzenia; wymóg prawny odrębny od SEP.
- **Weryfikacja dokumentów uprawnień przez platformę (D-04)** — v1 = samodeklaracja + termin ważności; realna weryfikacja dokumentów to osobny proces prawny.
- **Promień/mapa jako model obszaru (D-01)** — v1 operuje na powiatach (spójne z monetyzacją); mapa dodaje koszt API i klucze bez wartości dla startu.
- **Rozbudowany kalendarz i rezerwacja terminów** — termin = 3 warianty tekstowe; kalendarz to osobny moduł niepotrzebny do domknięcia zlecenia.
- **Automatyczne dobieranie fachowca** — v1 opiera się na wyborze klienta; auto-matching wymaga danych, których jeszcze nie ma.
- **Rozbudowany katalog usług** — v1 ma zamkniętą listę kategorii + „Inna praca"; katalog to rozwój po walidacji popytu.
- **Osobny abonament dla klientów** — klient płaci 0 zł (jednostronna monetyzacja = szybszy popyt).
- **Większe remonty (kilka dni)** — poza segmentem drobnych prac; „duży remont" = ekran informacyjny bez publikacji (D-06).
- **Automatyczne przenoszenie historii i ocen pracownika na konto indywidualne** — odchodzący pracownik startuje od zera (D-12); migracja reputacji to osobny, wrażliwy mechanizm.

**Poza zakresem świadomie (uproszczenia rdzenia):**
- **Tryb głosowy rozmowy „na żywo"** — komunikator obsługuje wiadomości głosowe + transkrypcję, ale nie połączenia; wartość dowozi asynchroniczna wymiana.
- **Automatyzacja sporów/moderacji** — v1 = ręczna kolejka operatora (D-09); automatyzacja czeka na realne dane (v2).
- **Nazwa/brand, domena, seed konkretnego miasta** — zależne od B-01 (miasto startu); schemat pozostaje city-agnostic.

---

## 4. METRYKA AKTYWACJI — DWA lejki (marketplace-dwustronne)

Zgodnie z ONBOARDING §6 (typ `marketplace-dwustronne`): **survey przy rejestracji wybiera STRONĘ** (Potrzebuję pomocy / Jestem fachowcem) → różny checklist, empty-state, aha i lejek per strona. **Dwa niezależne `activated` eventy, dwa lejki, dwa progi.** Zimny start rozwiązujemy **liquidity concierge (realna podaż i popyt operatora), NIE fałszywym demo-seedem** (§6).

### 4.1 Lejek KLIENTA
- **Setup:** konto + lokalizacja (miasto/dzielnica).
- **Proxy-aha (akcja własna klienta, in-session, TTFV < 10 min — cel ~3–5 min):** `zlecenie_opublikowane` — klient dodał bezpłatne zlecenie i **od razu widzi zasięg** („Twoje zlecenie widzi N fachowców w powiecie X"). To jest mierzalny, samoobsługowy moment pierwszej wartości < 10 min (formularz < 1 min wg insightu PREVIEW-BRIEF).
- **`activated` (KLIENT) = `oferta_otrzymana`** — wpłynęła PIERWSZA realna oferta na zlecenie. To aha „od third-party" → **event wstawiany SERWEROWO** (`aha_source=server-webhook`, `user_id`=klient) w chwili złożenia oferty przez fachowca (§6 pkt 2). Checklista po stronie klienta stoi w stanie `awaiting` („Zlecenie opublikowane — czekamy, aż fachowcy z okolicy odpowiedzą"), NIE aktywne CTA sugerujące porażkę usera (§6 pkt 5).
- **TTFV klienta:** proxy-aha < 10 min (samoobsługowo, niezależne od podaży) jest twardym KPI sesji 1; `oferta_otrzymana` zależy od płynności rynku — realny cel przy concierge = **ta sama doba** (mierzone osobno jako `realized_value`, medianą, nie średnią). Traktujemy proxy jako „aha oczekiwania" z widocznym harmonogramem „co się teraz wydarzy".
- **Habit klienta:** `wykonawca_wybrany` → domknięte, ocenione zlecenie (pełna pętla wartości).

### 4.2 Lejek FACHOWCA
- **Setup:** konto + wybór specjalizacji + wybór/wskazanie powiatu (bez płatności).
- **`activated` (FACHOWIEC) = `zlecenia_lokalne_zobaczone`** — fachowiec po wybraniu specjalizacji i powiatu ZOBACZYŁ listę realnych, lokalnych zleceń w **skróconym podglądzie BEZ abonamentu**. To jest **furtka wartości przed zakupem** (HANDOFF §9): dowód „są tu realne zlecenia w mojej okolicy", akcja własna, samoobsługowa, **TTFV < 10 min**. Zgodne z anty-vanity (§1.13): aha = realna wartość dla usera, NIE „wpisał kartę".
- **Konwersja/Habit (mierzone osobno, NIE jako `activated`):** `oferta_wyslana` — fachowiec kupił abonament i wysłał pierwszą ofertę (realna wartość + przychód). To predyktor retencji i twardy cel biznesowy, ale świadomie NIE jest eventem aktywacji (żeby metryka mierzyła wartość, nie transakcję).
- **TTFV fachowca:** `zlecenia_lokalne_zobaczone` < 10 min (rejestracja + specjalizacja + powiat + lista). Warunek: w powiecie MUSZĄ być realne zlecenia — patrz zimny start.

### 4.3 Zimny start (chicken-and-egg) — jak dowieźć aha obu stron
Marketplace bez podaży ani popytu nie wygeneruje żadnego aha. Rozwiązanie = **liquidity concierge operatora w jednym mieście (B-01), realny content, ZERO fałszywego seedu** (§6):
1. **Najpierw podaż fachowców.** Operator pozyskuje pionierskich fachowców w mieście startu (founder-led outreach) i uruchamia im dostęp przez **kod rabatowy operatora** (Coupons/Promo, A-06) — to NIE łamie „braku okresu próbnego", to decyzja operatora o cenie startowej. Bez podaży klient nigdy nie dostanie `oferta_otrzymana`.
2. **Równolegle popyt zleceń.** Operator zbiera realne, wczesne zlecenia (lokalna promocja „Potrzebuję pomocy" z landingu + kanały społecznościowe miasta), tak by fachowiec wchodzący do skróconego podglądu ZOBACZYŁ prawdziwe zlecenia (aha fachowca zależy od realnej listy, nie od atrapy).
3. **Skrócony podgląd = wbudowany hak płynności.** Sam mechanizm „widzisz realne zlecenia za darmo, ofertujesz po abonamencie" konwertuje podaż na przychód bez triala.
4. **Concierge sporów/nieobecności** ręcznie (D-09) do czasu realnych danych.
**Bramka launchu:** minimalny próg płynności w mieście startu (podaż fachowców × świeże zlecenia) traktujemy jak warunek uruchomienia, nie jak metrykę do zoptymalizowania po fakcie — patrz Zastrzeżenia §7.

### 4.4 Instrumentacja i dashboard
Eventy stałe (§1.14): `signed_up` · `jtbd_selected`(=wybór strony) · `setup_completed` · `onboarding_step_done` · **`activated`** (per strona, `time_since_signup`=TTFV) · `habit`. Wstawianie aha klienta serwerowo (`emitServerAha`, service-role). Dashboard operatora (O1) = **dwa lejki per strona** z osobnymi progami (activation rate cel ≥35–40%, <20% alarm; mediana TTFV; drop-off per krok; D7). Progi i okna serii maili skalowane osobno per strona (`expected_ttfv`, §6 pkt 6): klient krótkie (proxy w minutach), fachowiec krótkie (podgląd w minutach), a „czas do oferty/konwersji" mierzony jako osobna metryka realizacji wartości.

---

## 5. GRANICA „w cenie v1 vs rozwój" (akcept klienta przy demo)

**W cenie v1 (bez dopłaty, po zobaczeniu demo — łącznie do ~2 dni pracy):**
- Poprawki błędów i regresji.
- Kosmetyka i UX: kolory/odstępy/typografia w ramach tokenów, układ kart, teksty przycisków.
- Copy i ton: treści formularzy, komunikatów, powiadomień, empty-state, przykłady kategorii.
- Drobne przepływy: kolejność pól, walidacje, domyślne wartości, drobne warianty istniejącego ekranu.
- Strojenie parametrów już zdecydowanych (progi ostrzeżeń, teksty przypomnień) — bez zmiany logiki decyzji D-*.

**Rozwój (osobna wycena):**
- Każda pozycja z §3 (płatność za usługę, mapa/promień, kalendarz, auto-matching, katalog, głos na żywo, awaryjne otwieranie, gaz, weryfikacja dokumentów, abonament klienta, duże remonty).
- Nowe moduły/ekrany, nowe kategorie lub specjalizacje, nowe role.
- Nowe integracje (dostawca płatności/SMS/map inny niż w A-02..A-06).
- Zmiana modelu monetyzacji lub obszaru (np. powiat→promień), zmiana metodologii scoringu poza strojeniem wag (D-11).
- Uruchomienie kolejnego miasta jako osobnej instancji rynku.
Rozstrzyga ten dokument; przy sporze „w cenie vs rozwój" domyślnie: zmiana logiki decyzji D-* lub nowy byt danych = rozwój.

---

## 6. KOLEJNOŚĆ BUDOWY (sesje S4a..S4n)

Zasada: 1 moduł = 1 sesja; moduły cięższe (W1, F1) i cross-cutting (W3) dzielą się na podsesje ze względu na zależności i A-02. Konto/subskrypcja opierają się o standard startera (S3/S7 fabryki). Krok `onboarding` = standard fabryki PO `funkcja_glowna` (aha musi być znane, silnik maili istnieć).

| Sesja | Moduł | Zakres | Zależy od |
|---|---|---|---|
| **S4a** | W1 | Konto + role + logowanie e-mail/hasło + profile + telefon obowiązkowy | starter (S3 auth) |
| **S4b** | W1 | Lokalizacja: słownik TERYT (powiat→miasto→dzielnica+centroidy) + haversine; seed miasta startu (czeka B-01, schemat city-agnostic buduje się bez niego) | — |
| **S4c** | W1 | Logowanie telefon + SMS OTP (Supabase Send SMS hook → SMSAPI) — osobna sesja przed E2E (A-02) | S4a |
| **S4d** | K1 | Publikacja zlecenia (formularz, kategorie, flaga uprawnień, termin, faktura, „duży remont"=ekran info) + moje zlecenia | S4a, S4b |
| **S4e** | F1 | Rynek fachowca: lista lokalna (powiat∈opłacone/wybrane + specjalizacja), skrócony podgląd bez abonamentu, filtry, pulpit lista-dnia, odległość | S4b, S4d |
| **S4f** | F1 | Pytania (Q&A publiczne/prywatne, D-02) + formularz oferty (widełki/oględziny, faktura, bramka SEP D-04) | S4e, S4d |
| **S4g** | K2 | Oferty u klienta: lista + ostrzeżenia faktura + wybór + ujawnienie telefonu + zamknięcie pozostałych + przywracanie po rezygnacji | S4f |
| **S4h** | W2 | Komunikator (tekst/foto/głos+transkrypcja/dokumenty) + podsumowanie ustaleń AI + podwójna akceptacja + statusy + zakończenie/odrzucenie + auto-zamknięcie 4 dni | S4g, edge A-04, Storage |
| **S4i** | W3 | Oceny dwustronne + komentarze + rezygnacje (D-14) + wskaźnik rzetelności/scoring (D-11) + ostrzeżenia | S4h |
| **S4j** | W3 | Powiadomienia: in-app + e-mail (Resend) + SMS pilne (limit 2/24h, blokada 2 dni) + ustawienia kanałów + dni/godziny fachowca | eventy z S4d/S4g/S4h/S4i |
| **S4k** | F2 | Monetyzacja: Stripe Subscriptions + 2 powiaty + dodatki (proracja) + rok=10 mies. + panel firmy + pracownicy + kontrola SEP + spadek do skróconego podglądu po wygaśnięciu | S4a, S4e, krok `stripe_kyc` |
| **S4l** | O1 | Panel operatora: kolejka sporów (D-09) + skutki decyzji + dashboard aktywacji dwustronnej (dwa lejki) | S4h, S4i, S4j (eventy) |
| **S4m** | — | Krok `onboarding` (standard fabryki): survey wybiera STRONĘ, checklist/empty/aha per strona, liquidity concierge, instrumentacja obu lejków | wszystkie + aha znane |

**Ścieżka krytyczna (najkrótsza pętla do demo dwustronnego):** S4a → S4b → S4d → S4e → S4f → S4g → S4h. Reputacja (S4i), powiadomienia (S4j), monetyzacja (S4k) i operator (S4l) domykają wartość, ale rdzeń pętli marketplace (klient publikuje → fachowiec ofertuje → klient wybiera → domknięcie) da się zademonstrować już po S4h. Monetyzacja (S4k) może iść równolegle po S4e, bo zależy tylko od dostępu do powiatów.

---

## 7. Zastrzeżenia toru (sygnalizacja — NIE zmieniam decyzji)

1. **Zakres v1 vs „najszybszy GTM" — panel firmy/pracownicy (D-12, MUST-HAVE §9).** Panel firmy, sloty pracowników, dwa tryby przydzielania i kontrola SEP przed przypisaniem to najcięższy przyrost zakresu (potwierdza HANDOFF §12), a do UDOWODNIENIA płynności marketplace wystarcza pętla klient ↔ fachowiec indywidualny. **Rekomendacja toru:** rozważyć firmę/pracowników jako pierwszy fast-follow (v1.1) i skupić launch na parze klient–fachowiec indywidualny. Zostawiam w scope zgodnie z MUST-HAVE i D-12; sygnalizuję jako największą dźwignię skrócenia time-to-launch.

2. **`activated`(KLIENT)=`oferta_otrzymana` jest strukturalnie zależne od podaży — TTFV < 10 min dla tego eventu jest w zimnym starcie nieosiągalne.** To nie wada decyzji, ale twardy warunek: bez zobowiązania operatora do **płynności startowej (B-01 + concierge §4.3)** metryka aha klienta będzie martwa niezależnie od jakości produktu. **Rekomendacja:** traktować minimalny próg podaży w mieście startu jako BRAMKĘ launchu (nie jako metrykę do poprawy po fakcie); < 10 min egzekwować na proxy-aha `zlecenie_opublikowane`, a `oferta_otrzymana` raportować z celem „ta sama doba".

3. **Transkrypcja głosowa + podsumowanie ustaleń AI (A-04) to najcięższy technicznie element rdzenia.** Tekstowy komunikator + tekstowe podsumowanie dowożą całą pętlę wartości (wybór→ustalenia→akceptacja→realizacja). **Rekomendacja toru:** jeśli timeline się napina, głos+transkrypcja jako pierwszy fast-follow w obrębie W2, a nie blokada launchu. Zostawiam w scope zgodnie z MUST-HAVE §9; sygnalizuję jako naturalny punkt cięcia pod presją czasu.
