# 02-SPEC-FUNKCJONALNY — Majster Blisko (nazwa robocza) · DRAFT sesji fabryki, 2026-07-22

> Draft do paczki `brief/02-SPEC-FUNKCJONALNY.md` (przechodzi tam krokiem `paczka_cc`; repo aplikacji jeszcze nie istnieje).
> Źródła: 01-MVP-SCOPE.md (KANON zakresu) · DECYZJE.md (D-01..D-14, A-01..A-07, B-01 — WIĄŻĄCE) · HANDOFF-PACK.md (§6 ekrany, §7 reguły) · PRICING-FINAL.md · zrodla/PREVIEW-BRIEF.json.
> Fundament: saas-starter (auth, panel usera `app.html`, panel operatora `admin.html`, edge Stripe/Resend/lifecycle, `track.js` — nazwy eventów STAŁE).
> Typ onboardingu: **marketplace-dwustronne** — DWA niezależne aha, DWA lejki, DWA progi (ONBOARDING §6).
> Zasada nadrzędna: najszybszy GTM, zero przekombinowania, v1 = drobne prace w JEDNYM mieście.

---

## 0. Decyzje techniczne rdzenia (WPROST)

Wszystkie z DECYZJE.md; tu przełożone na jednoznaczne reguły implementacyjne. Parametryzowalne progi → `app_settings` (edytowalne bez deployu), reszta = kod.

### 0.1 Lokalizacja i odległość (A-05, D-01)
- **Słownik TERYT w DB** (`teryt_wojewodztwa` → `teryt_powiaty` → `teryt_miasta` → `teryt_dzielnice`), każdy węzeł miasta/dzielnicy ma **centroid `lat`/`lng`**. Schemat **city-agnostic**; seed = miasto startu + powiaty ościenne (czeka B-01, ale schemat i haversine buduje się bez niego).
- **Odległość = haversine** z centroidów (funkcja SQL `haversine_km(lat1,lng1,lat2,lng2)` lub liczona w edge). **Bez zewnętrznego API map, bez kluczy.** Odległość na karcie fachowca = haversine(centroid dzielnicy/miasta zlecenia, centroid bazy fachowca).
- **Jednostka obszaru = POWIAT.** Widoczność zlecenia dla fachowca = `powiat(zlecenie) ∈ opłacone_powiaty(fachowiec)` **∧** `kategoria(zlecenie) ∈ specjalizacje(fachowiec)`. Klient podaje miasto/dzielnicę z listy → powiat wynika ze słownika (klient NIE wybiera powiatu ręcznie).

### 0.2 Wskaźnik rzetelności / scoring pozycji ofert (D-11) — DETERMINISTYCZNY
- `score` bazowy = **100**.
- Każda **nieuzasadniona** rezygnacja fachowca z **ostatnich 90 dni**: **−25 pkt**, kumulacja **max −75** (czyli podłoga 25 przy ≥3 rezygnacjach w oknie).
- **Powrót do 100** po **3 poprawnie zakończonych realizacjach** bez kolejnej nieuzasadnionej rezygnacji (reset licznika kar).
- **Sort ofert u klienta = `score DESC, czas_zlozenia ASC`.** Wskaźnik **NIE** zmienia oceny gwiazdkowej (osobne osie: reputacja jakościowa vs rzetelność).
- Liczony **funkcją deterministyczną** z historii rezygnacji (widok SQL / edge, nie AI) — wytłumaczalny userowi i operatorowi. Wagi (25 / 90 dni / 3 realizacje) w `app_settings` = strojenie „w cenie v1", zmiana metodologii = rozwój.
- **Ostrzeżenie o KLIENCIE** (symetryczne): pojawia się po **3 nieuzasadnionych rezygnacjach klienta**, znika po **3 poprawnych realizacjach**. Widoczne fachowcowi przed ofertą.

### 0.3 Licznik 4 dni domknięcia (D-08) — maszyna czasu
- Start odliczania = **moment oznaczenia „zakończone" przez fachowca** (jedyny jednoznaczny punkt).
- **Przypomnienia do klienta po 24 h i 72 h** kanałami **push/e-mail (BEZ SMS** — to nie „pilna wiadomość").
- Po **4 dobach** ciszy klienta → **auto-zamknięcie jako WYKONANE** (odblokowuje oceny).
- Realizacja: kolejka cron (`0002_cron.sql` + processor niszy `job-closer`) skanuje zlecenia w stanie `zakonczenie_zgloszone` z `zakonczenie_zgloszone_at` przekroczonym; przypomnienia idą tym samym mechanizmem po 24/72 h.

### 0.4 Transkrypcja głosowa + podsumowanie ustaleń AI (A-04, D-07)
- **OpenAI przez edge functions**: `transkrypcja` (model transkrypcji audio→tekst) + `podsumowanie-ustalen` (model tekstowy: rozmowa → ustrukturyzowane podsumowanie). Koszt = **pass-through na operatora** (`ai_usage`/`ai_billing_month` startera; klucz dedykowany apki — METODYKA §6).
- Transkrypcja **edytowalna**, po edycji etykieta **„edytowano"** (flaga `edytowano=true`).
- Podsumowanie generuje aplikacja; **akceptacja trzymana OSOBNO per strona**. **Każda edycja dowolnej strony resetuje akceptację DRUGIEJ**; blokada ogłoszenia następuje, gdy **OBIE strony zaakceptowały tę samą (ostatnią) wersję** (model wersjonowany — patrz §5.3).

### 0.5 SMS-y pilne z limitem (A-03, A-07)
- Kanał SMS **wyłącznie** dla: (a) kodów logowania OTP, (b) **„pilnej wiadomości"** w AKTYWNYM zleceniu.
- Limit pilnych: **max 2 SMS / 24 h per strona per zlecenie**; licznik w oknie kroczącym 24 h.
- **Potwierdzone nadużycie** (decyzja operatora) → **blokada nadawcy pilnych SMS na 2 dni**.
- Dostawca = **SMSAPI** (wzorzec tn-crm: edge fn `send-sms`), przez **Supabase Auth Send SMS hook** dla OTP (A-02).

### 0.6 Statusy ZLECENIA — maszyna stanów (patrz §5.1 pełna lista przejść)
Stany: `otwarte` → `wykonawca_wybrany` → `w_realizacji` → `zakonczenie_zgloszone` → `zamkniete_wykonane`; boczne: `anulowane`, `w_sporze`. „Duży remont" (D-06) = walidacja formularza, **NIE tworzy zlecenia** (ekran informacyjny).

### 0.7 Uprawnienia SEP (D-03, D-04) — samodeklaracja + bramka
- **Jedna** kategoria z flagą `wymaga_uprawnien` = **Elektryka (instalacja)**. Drobnica (żarówka/oprawa) bez flagi — rozróżnienie **przykładami w formularzu**. Gaz i awaryjne otwieranie **poza v1** (D-05, nie pokazujemy wcale).
- Fachowiec przy specjalizacji „Elektryka" deklaruje SEP: **numer + data ważności** (świadectwa 5-letnie). Platforma **NIE weryfikuje dokumentów** — bramka = obecność deklaracji z ważną datą.
- **Bramka oferty:** ofertę do zlecenia z flagą `wymaga_uprawnien` złoży tylko fachowiec/pracownik z **ważną** deklaracją SEP (data ważności ≥ dziś). Brak → oferta zablokowana z komunikatem.

### 0.8 Ujawnianie danych (HANDOFF §7)
- Profil pokazuje **wyłącznie imię** (bez nazwiska).
- **Przed** wyborem: fachowiec widzi imię klienta + średnią ocen + liczbę zakończonych zleceń; klient widzi ofertę, badge Firma/Osoba prywatna, faktura/rachunek, oceny fachowca. **Telefon i dokładny adres ukryte.**
- **Po** wyborze wykonawcy: ujawniany **numer telefonu** wybranego; **dokładny adres klient przekazuje wybranemu samodzielnie** (aplikacja go nie wymusza).

### 0.9 Role i konta (W1, A-02)
- 4 role: `klient`, `fachowiec_solo`, `wlasciciel_firmy`, `pracownik_firmy` + `operator` (panel). Rola zapisana na profilu.
- Logowanie **dwuścieżkowe**: e-mail+hasło (silnik startera) **oraz** telefon+kod SMS (Send SMS hook → SMSAPI).
- **Telefon = pole obowiązkowe** konta niezależnie od metody logowania (potrzebny do ujawnienia po wyborze i do pilnych SMS).

---

## 1. Ekrany (user) — inwentarz HANDOFF §6 zmapowany na moduły W1–O1

> Format: **Elementy** / **Stany puste** / **Walidacje**. Kolumna „Moduł/Sesja" wiąże ekran z 01-MVP-SCOPE §2 i §6.
> Ekrany rdzenia mobile-first (senior-friendly: duże cele dotykowe, duże ceny/odległości/terminy, minimum żargonu).

### E1 — Rejestracja i logowanie · *W1 / S4a + S4c*
- **Elementy:** przełącznik metody „E-mail + hasło" / „Telefon + kod SMS"; pola e-mail+hasło (starter) albo telefon + ekran wpisania 6-cyfrowego kodu OTP; wybór roli przy rejestracji (Klient / Fachowiec / Firma — pracownik dołącza zaproszeniem właściciela, patrz E14); pole imię; **telefon obowiązkowy zawsze**; link „nie pamiętam hasła" (reset przez Resend); zgoda regulamin+RODO.
- **Stany puste:** pierwsze wejście → ekran wyboru strony „Potrzebuję pomocy" / „Jestem fachowcem" (survey `jtbd_selected`, patrz §6) przed formularzem, spójny z landingiem.
- **Walidacje:** e-mail format; hasło wg polityki startera (HIBP pwned); telefon w formacie PL, **weryfikowany kodem** przy ścieżce SMS lub jednorazowym kodem przy ścieżce e-mail (telefon musi być potwierdzony przed pierwszą ofertą/wyborem); kod OTP 6 cyfr, wygaśnięcie, limit prób; rola wymagana.

### E2 — Panel klienta (senior-friendly) · *K1 / S4d + S5*
- **Elementy:** duże CTA „Dodaj zlecenie za darmo"; lista moich zleceń (karta = kategoria + status + liczba ofert + termin + lokalizacja ogólna); wejście w szczegóły; badge statusu w roboczej zieleni `#2F7D57` (zielony TYLKO dla stanów domkniętych/pozytywnych — nie dla „w toku"); dolna nawigacja: Zlecenia / Powiadomienia / Profil.
- **Stany puste:** brak zleceń → duża ilustracja + „Nie masz jeszcze zleceń. Opisz drobną naprawę — fachowcy z okolicy odpowiedzą." + jedno CTA.
- **Walidacje:** —

### E3 — Formularz dodania zlecenia · *K1 / S4d*
- **Elementy:** upload **zdjęć** (Storage, wiele); pole opis **„Co trzeba naprawić?"**; wybór **kategorii** (hydraulika, elektryka, złota rączka, malowanie, montaż, drobne ślusarskie/budowlane, **„Inna praca"**); wybór **lokalizacji** (miasto/dzielnica z listy → powiat auto ze słownika); **termin** (jak najszybciej / konkretny dzień [date-picker] / elastyczny); checkbox **„Potrzebuję faktury/rachunku"**; sekcja rozróżnienia **drobna praca vs duży remont** przykładami; przy kategorii Elektryka — inline-info o fladze „wymaga uprawnień" + przykłady bez flagi (żarówka/oprawa).
- **Stany puste:** świeży formularz z przykładami-podpowiedziami w każdym polu (placeholdery: „np. cieknący syfon pod zlewem").
- **Walidacje:** minimum publikacji = **kategoria + lokalizacja + (opis LUB zdjęcie) + termin**; wybór **„duży remont"** → **ekran informacyjny „Platforma łączy z fachowcami od drobnych prac"** BEZ publikacji (D-06); kategoria „Elektryka (instalacja)" ustawia `wymaga_uprawnien=true` automatycznie; formularz publikuje się **< 1 min** na telefonie. Po publikacji: natychmiastowe **potwierdzenie zasięgu** „Twoje zlecenie widzi N fachowców w powiecie X" (N = realny COUNT fachowców z abonamentem, powiat+specjalizacja zgodne).

### E4 — Lista i szczegóły moich zleceń (klient) · *K1+K2 / S4d + S4g*
- **Elementy:** lista wg statusu; szczegóły zlecenia = dane wprowadzone + status + **oś zdarzeń** (opublikowano → oferty → wybór → realizacja → zakończenie); sekcja **Q&A** (pytania fachowców + moje odpowiedzi z przełącznikiem widoczności); sekcja **Oferty** (patrz E7); akcje wg stanu (edytuj [tylko `otwarte`], anuluj, wybierz ofertę).
- **Stany puste:** `otwarte` bez ofert → **`awaiting`**: „Zlecenie opublikowane — czekamy, aż fachowcy z okolicy odpowiedzą" + harmonogram „co się teraz wydarzy" (NIE aktywne CTA sugerujące porażkę usera — ONBOARDING §6 pkt 5).
- **Walidacje:** edycja treści zlecenia dozwolona tylko w stanie `otwarte`; po podwójnej akceptacji ustaleń zlecenie **nieedytowalne**.

### E5 — Lista lokalnych zleceń fachowca (pulpit „lista dnia") · *F1 / S4e*
- **Elementy:** nagłówki liczbowe **„7 nowych zleceń", „3 do 5 km", „2 na dziś"**; **jedna lista kart** (rodzaj naprawy + zdjęcie + dzielnica + **odległość** [haversine] + termin); **filtry specjalizacji** (Hydraulika / Elektryka / Złota rączka …); sort domyślny wg świeżości/odległości/terminu. **Furtka wartości:** fachowiec **BEZ abonamentu** widzi **skrócony podgląd** (rodzaj/dzielnica/odległość/termin) — **bez kontaktu i bez przycisku oferty** + baner „Kup abonament, by odpowiadać".
- **Stany puste:** w opłaconym/wybranym powiecie brak zleceń → „W powiecie X nie ma teraz świeżych zleceń w Twoich specjalizacjach. Damy znać, gdy się pojawią." (zależność zimnego startu — §4.3 scope).
- **Walidacje:** lista pokazuje **wyłącznie** zlecenia z `powiat ∈ opłacone/wybrane` **∧** `kategoria ∈ specjalizacje`; skrócony podgląd nie ujawnia danych kontaktowych.

### E6 — Szczegóły zlecenia + Q&A + formularz oferty · *F1 / S4f*
- **Elementy:** pełny opis + zdjęcia + dzielnica/odległość/termin; **przed ofertą** widoczne: imię klienta, średnia ocen, liczba zakończonych zleceń, **ostrzeżenie o kliencie** jeśli aktywne (§0.2); sekcja **Q&A** — fachowiec zadaje pytanie (zawsze publiczne); **formularz oferty** (tylko z abonamentem): **widełki ceny ALBO propozycja oględzin** (D-06), termin, wiadomość, deklaracja faktura/rachunek.
- **Stany puste:** brak pytań → „Zadaj pytanie, jeśli czegoś brakuje w opisie".
- **Walidacje:** oferta wymaga **aktywnego abonamentu** (bez → CTA zakupu, blokada); do zlecenia z `wymaga_uprawnien` — oferta tylko z **ważną deklaracją SEP** (D-04, inaczej blokada z komunikatem); oferta = dokładnie jedna z form (widełki XOR oględziny); jeden fachowiec = jedna aktywna oferta na zlecenie.

### E7 — Lista ofert dla klienta + wybór wykonawcy · *K2 / S4g*
- **Elementy:** lista ofert **posortowana `score DESC, czas ASC`** (D-11); każda oferta: widełki/oględziny, termin, wiadomość, **badge Firma (z nazwą) / Osoba prywatna** (D-10), **ikona faktura/rachunek**, imię + oceny fachowca; przycisk **„Wybieram"**; przy wykonawcy bez faktury — **ostrzeżenie**, a gdy klient zaznaczył potrzebę dokumentu → **twarde dodatkowe potwierdzenie** (D-10).
- **Stany puste:** `awaiting` (jak E4) do pierwszej oferty.
- **Walidacje:** wybór wykonawcy → **pozostałe oferty auto-zamknięte** „wybrano innego wykonawcę"; **dopiero teraz ujawniany telefon** wybranego; wybór „bez faktury" mimo zaznaczonej potrzeby = wymaga potwierdzenia checkboxem; przy rezygnacji wybranego → ścieżka **przywrócenia** wcześniejszych ofert po ponownym potwierdzeniu dostępności (patrz §4 flow, §5.2 oferta).

### E8 — Komunikator + podsumowanie ustaleń · *W2 / S4h*
- **Elementy:** wątek uruchamiany **dopiero po wyborze**; wiadomości: **tekst / zdjęcia / dokumenty / głos** (nagranie → **auto-transkrypcja**, edytowalna, etykieta „edytowano"); przycisk **„Pilna wiadomość" (SMS)** z licznikiem pozostałych (max 2/24 h); panel **„Podsumowanie ustaleń"** (AI z rozmowy) z wersją, przyciskami **Akceptuję / Edytuj**, znacznikami akceptacji per strona.
- **Stany puste:** świeży wątek → „Ustalcie szczegóły: zakres, cena, termin, dojazd. Gdy skończycie, aplikacja przygotuje podsumowanie."
- **Walidacje:** SMS pilny blokowany po 2/24 h i przy blokadzie 2-dniowej; edycja podsumowania resetuje akceptację drugiej strony (§5.3); po podwójnej akceptacji podsumowanie i zlecenie **zamrożone**.

### E9 — Aktywna realizacja / zakończenie / odrzucenie · *W2 / S4h*
- **Elementy (fachowiec):** status realizacji; przycisk **„Oznacz jako zakończone"** (start licznika 4 dni). **(klient):** po zgłoszeniu zakończenia — **„Potwierdzam wykonanie"** / **„Odrzucam zakończenie"** (powód + opcjonalne zdjęcie); widoczny licznik/termin auto-zamknięcia; przypomnienia 24/72 h (push/e-mail).
- **Stany puste:** przed zgłoszeniem zakończenia → „Praca w toku. Fachowiec oznaczy, gdy skończy."
- **Walidacje:** odrzucenie wymaga powodu; **pierwsze odrzucenie → powrót do `w_realizacji`**; **drugie odrzucenie → kolejka operatora** (`w_sporze`, D-09); brak reakcji 4 doby → auto `zamkniete_wykonane`.

### E10 — Ocena klienta i fachowca (dwustronna) · *W3 / S4i*
- **Elementy:** formularz **1–5 gwiazdek + komentarz**, powiązany z **zakończonym** zleceniem, widoczne **imię autora**; sekcja **rezygnacji** z listą usprawiedliwionych powodów (zmiana zakresu / niebezpieczne warunki / nagła choroba lub awaria — D-14) + opis + opcjonalny dowód; opcja **zakwestionowania** rezygnacji drugiej strony (→ operator).
- **Stany puste:** przed zamknięciem → „Ocena będzie dostępna po zakończeniu zlecenia."
- **Walidacje:** ocena **tylko po** `zamkniete_wykonane`; jedna ocena per strona per zlecenie; **rezygnacja z powodem z listy + opis nie obniża `score`**; rezygnacja bez powodu / poza listą = **nieuzasadniona** (−25, §0.2).

### E11 — Profile klienta i fachowca · *W1+W3 / S4a (oceny w S4i)*
- **Elementy (fachowiec):** zdjęcie, imię, specjalizacje, obszar (opłacone powiaty), **badge Firma/Osoba prywatna**, faktura/rachunek, **deklaracja SEP** (numer + ważność) przy Elektryce, średnia ocen + komentarze, liczba realizacji. **(klient):** imię, województwo/powiat/miasto-dzielnica, historia zleceń, średnia ocen.
- **Stany puste:** brak ocen → „Brak ocen — to pierwsze zlecenia."
- **Walidacje:** wyłącznie imię (bez nazwiska); SEP wymaga numeru + daty ważności; oceny odchodzącego pracownika **znikają z publicznego profilu firmy** (historia zostaje do sporów — D-12).

### E12 — Ustawienia obszaru i powiadomień · *W3/A-07 (powiadomienia S4j) + F2 (obszar S4k)*
- **Elementy (powiadomienia):** przełączniki **per kanał** (in-app / e-mail / SMS) — domyślnie **wszystkie ON**; fachowiec dodatkowo **dni i godziny doręczeń** (bez narzuconej ciszy nocnej). **(obszar, fachowiec):** lista specjalizacji; lista opłaconych powiatów; przycisk „dokup powiat".
- **Stany puste:** —
- **Walidacje:** SMS dotyczy **tylko** pilnych i OTP (info w UI); zmiana **przypisania** powiatów bazowych możliwa **przy odnowieniu okresu** (D-12); dodatkowy powiat aktywny natychmiast (proracja).

### E13 — Zakup i zarządzanie abonamentem + powiaty · *F2 / S4k*
- **Elementy:** wybór planu **Fachowiec 99 zł/mc (990 zł/rok)** / **Firma 149 zł/mc (1490 zł/rok)**; **2 powiaty w cenie** (wybór z listy); dokupienie **+19 zł/mc powiat** (quantity, proracja) i **+39 zł/mc pracownik** (firma); Stripe Checkout (**karta dopiero tu**); portal zarządzania subskrypcją (starter); pole na **kod rabatowy** (Coupons/Promo operatora); informacja o **braku triala** i **gwarancji startowej** (regulamin).
- **Stany puste:** bez abonamentu → baner „Widzisz skrócony podgląd. Kup abonament, by odpowiadać na zlecenia."
- **Walidacje:** rok = równowartość **10 miesięcy** (rabat tylko abonament główny; dodatki płatne z góry za rok); po **wygaśnięciu** → spadek do **skróconego podglądu**; dodatkowy powiat po wyłączeniu działa **do końca opłaconego okresu**; KYC = krok `stripe_kyc` (Connect Standard operatora, direct charges, `application_fee_percent` z `wfa_projects.fee_percent`).

### E14 — Panel firmy i pracowników · *F2 / S4k*
- **Elementy:** administracja kontem firmy (nazwa, NIP opcjonalny); zarządzanie **slotami pracowników** (zaproszenie/odpięcie osoby — slot płatny +39 zł/mc); dwa **tryby obsługi**: **(a)** właściciel przydziela zlecenia pracownikom, **(b)** pracownicy odpowiadają samodzielnie; podgląd deklaracji SEP pracowników z datą ważności.
- **Stany puste:** brak pracowników → „Dodaj pracownika, by obsługiwać więcej zleceń."
- **Walidacje:** **przypisanie pracownika do zlecenia z flagą `wymaga_uprawnien` wymaga jego ważnej deklaracji SEP** (blokada bez); zmiana osoby w slocie w dowolnym momencie — **odchodzący traci dostęp, jego publiczne oceny znikają** (historia zostaje — D-12); **brak uprawnionego zastępcy = rezygnacja firmy** (usprawiedliwiona tylko jeśli z listy powodów).

### E15 — (operator) Panel sporów i zgłoszeń · *O1 / S4l* → patrz §2.

---

## 2. Panel operatora (klient-operator = inwestobiznes@gmail.com)

Starter (dashboard MRR/churn, użytkownicy, płatności, **rabaty = Coupons+Promotion Codes**, wiadomości, ustawienia, „Marka" logo/favicon) **+ nisza:**

### 2.1 Kolejka „Spory i zgłoszenia" (D-09)
- **Typy:** `drugie_odrzucenie_zakonczenia` · `zgloszenie_nieobecnosci` · `naduzycie_pilnych_sms` · `inne_naduzycie` · `zakwestionowana_rezygnacja`.
- **Widok sporu:** **oś zdarzeń zlecenia** + **stanowiska obu stron** (formularz odpowiedzi drugiej strony z **terminem 48 h**); decyzja klikiem: **uznaj / odrzuć / zamknij bez rozstrzygnięcia** + adnotacja.
- **Skutki AUTOMATYCZNE decyzji:** odblokowanie oceny · **blokada pilnych SMS 2 dni** · korekta wskaźnika rzetelności (dodanie/cofnięcie −25) · zamknięcie/wznowienie zlecenia. Skutek wykonuje serwer po decyzji (RPC service-role), nie ręcznie.

### 2.2 Dashboard aktywacji DWUSTRONNEJ (standard fabryki, ONBOARDING §6)
- **DWA lejki per strona** (Klient / Fachowiec), osobne progi: **activation rate** (cel ≥35–40 %, alarm <20 %), **mediana TTFV**, **drop-off per krok**, **D7 retention**.
- Klient: `signed_up → jtbd_selected(klient) → zlecenie_opublikowane (proxy) → oferta_otrzymana (activated, serwerowe) → wykonawca_wybrany → zamknięte+ocena (habit)`.
- Fachowiec: `signed_up → jtbd_selected(fachowiec) → zlecenia_lokalne_zobaczone (activated) → oferta_wyslana (konwersja/habit)`.
- **„Realized value" osobno** (nie jako activation): klient `oferta_otrzymana` mierzony medianą z celem „ta sama doba"; fachowiec `oferta_wyslana` jako predyktor retencji.

### 2.3 Meta-onboarding operatora
Checklista **„Pierwsze kroki operatora"**: ustaw ceny (Stripe Prices) → potwierdź aha per strona → **liquidity concierge** (pozyskaj podaż startową fachowców + realne zlecenia) → zajrzyj w dashboard. Rabaty startowe (founding member −50 %/3 mc) = **Coupons + Promotion Codes** (zero dodatkowej budowy).

---

## 3. User stories per rola

### Klient
- Jako klient publikuję **bezpłatne** zlecenie (zdjęcie+opis+kategoria+lokalizacja+termin) w **< 1 min**, żeby szybko znaleźć fachowca do drobnej naprawy.
- Jako klient od razu po publikacji widzę **zasięg** („widzi N fachowców w powiecie X"), żeby wiedzieć, że zlecenie dotarło.
- Jako klient **porównuję oferty** (cena/oględziny, oceny, Firma/Osoba, faktura), żeby świadomie wybrać wykonawcę.
- Jako klient **wybieram** wykonawcę i **dopiero wtedy** ujawniam kontakt, żeby nie być zasypany telefonami.
- Jako klient ustalam szczegóły w **komunikatorze** i akceptuję **podsumowanie**, żeby mieć jasne, spisane ustalenia.
- Jako klient **potwierdzam lub odrzucam** zakończenie (z powodem/zdjęciem), żeby płacić tylko za realnie wykonaną pracę.
- Jako klient **oceniam** fachowca po zamknięciu, żeby budować lokalną reputację.
- Jako klient przy rezygnacji wybranego mogę **przywrócić** wcześniejsze oferty, żeby nie zaczynać od zera.

### Fachowiec solo
- Jako fachowiec **bez abonamentu** widzę **skrócony podgląd** realnych zleceń mojego powiatu, żeby ocenić, czy warto płacić (aha przed zakupem).
- Jako fachowiec **kupuję abonament** (2 powiaty w cenie) i widzę **lista dnia** ze zleceniami z moich powiatów i specjalizacji, z odległością i terminem.
- Jako fachowiec **zadaję pytania** przed ofertą i składam ofertę (**widełki albo oględziny**), żeby wycenić także to, czego nie widać na zdjęciu.
- Jako fachowiec **dokupuję powiat** (+19 zł) z proracją, żeby rozszerzyć zasięg natychmiast.
- Jako fachowiec **rezygnuję z uzasadnionego powodu** (zmiana zakresu/niebezpieczne warunki/choroba) bez utraty pozycji, żeby uczciwe sytuacje mnie nie karały.
- Jako fachowiec **oceniam klienta** i widzę **ostrzeżenie** o kliencie z historią nieuzasadnionych rezygnacji.

### Właściciel firmy
- Jako właściciel **administruję kontem firmy** i **abonamentem firmowym** (149 zł), żeby obsługiwać zlecenia zespołem.
- Jako właściciel **dodaję/odpinam pracowników** (sloty +39 zł), żeby elastycznie zarządzać kadrą.
- Jako właściciel wybieram **tryb obsługi** (przydzielam sam / pracownicy odpowiadają sami), żeby dopasować do organizacji pracy.
- Jako właściciel **nie przypiszę pracownika bez ważnego SEP** do zlecenia elektrycznego, żeby nie łamać wymogu uprawnień.
- Jako właściciel wiem, że **oceny odchodzącego pracownika znikają** z profilu firmy, a historia zostaje do sporów.

### Pracownik firmy
- Jako pracownik **odpowiadam na przydzielone** lub **samodzielnie wybieram** zlecenia (wg trybu firmy), żeby realizować pracę.
- Jako pracownik **utrzymuję ważną deklarację SEP**, żeby móc brać zlecenia elektryczne.
- Jako pracownik po odejściu **startuję od zera** na koncie indywidualnym (bez migracji ocen — D-12).

### Operator
- Jako operator **rozstrzygam każdy typ sporu** klikiem, a skutki (blokada SMS, korekta scoringu, odblokowanie oceny) wykonują się automatycznie.
- Jako operator widzę **dwa lejki aktywacji** z realnymi eventami i reaguję, gdy activation <20 %.
- Jako operator **pozyskuję podaż startową** i wystawiam **kody rabatowe** (Coupons/Promo), żeby rozwiązać zimny start bez łamania „braku triala".
- Jako operator **podmieniam logo/markę** i zarządzam cenami/rabatami bez kodu.

---

## 4. Flow user + flow operatora (sekwencje krok-po-kroku)

### 4.1 Pełna pętla marketplace (happy path)
1. **Publikacja (klient).** E3: zdjęcie+opis+kategoria+lokalizacja+termin+[faktura] → walidacja minimum → (jeśli „duży remont" → ekran info STOP) → INSERT zlecenie stan `otwarte` → **potwierdzenie zasięgu** „widzi N fachowców" → **event `zlecenie_opublikowane`** (proxy-aha klient).
2. **Widoczność + podgląd (fachowiec).** E5: fachowiec (z abonamentem lub w skróconym podglądzie) widzi zlecenie, bo `powiat ∈ opłacone/wybrane ∧ kategoria ∈ specjalizacje`; wejście na listę = **event `zlecenia_lokalne_zobaczone`** (aha fachowiec, `activated`).
3. **Pytania (Q&A).** E6: fachowiec zadaje pytanie (publiczne). Klient odpowiada z przełącznikiem **„Widoczna dla wszystkich" (domyślnie) / „Tylko dla pytającego"** (D-02). Odpowiedzi fachowców zawsze publiczne.
4. **Oferta (fachowiec).** E6: z **aktywnym abonamentem** (bramka SEP jeśli flaga) → **widełki ceny XOR propozycja oględzin** + termin + wiadomość + deklaracja faktura → INSERT oferta stan `zlozona`. **Serwer** emituje do klienta **event `oferta_otrzymana`** (activated klient, `aha_source=server-webhook`) przy PIERWSZEJ ofercie; fachowcowi **event `oferta_wyslana`** (konwersja/habit).
5. **Wybór (klient).** E7: lista ofert `score DESC, czas ASC`; klient „Wybieram" → (jeśli bez faktury mimo potrzeby → twarde potwierdzenie) → oferta `wybrana`, **pozostałe → `odrzucona_wybrano_innego`**, zlecenie `otwarte → wykonawca_wybrany`, **ujawnienie telefonu**, komunikator otwarty. **Event `wykonawca_wybrany`**.
6. **Komunikator (obie strony).** E8: tekst/zdjęcia/dokumenty/głos (auto-transkrypcja edytowalna). Pilna wiadomość = SMS (limit 2/24 h).
7. **Podsumowanie AI.** E8: „Generuj podsumowanie" → edge `podsumowanie-ustalen` tworzy **wersję v1**.
8. **Akceptacje (D-07, §5.3).** Każda strona **Akceptuję** (na konkretnej wersji) albo **Edytuj** (tworzy nową wersję + reset akceptacji drugiej). Gdy **OBIE** akceptacje wskazują tę samą ostatnią wersję → **`w_realizacji`**, zlecenie i podsumowanie **zamrożone**, ogłoszenie zablokowane dla innych fachowców.
9. **Realizacja.** E9: status w toku; materiały/zapłatę strony rozliczają **poza aplikacją**.
10. **Zakończenie (fachowiec).** E9: „Oznacz jako zakończone" → `zakonczenie_zgloszone`, **start licznika 4 dni**, przypomnienia do klienta po 24/72 h (push/e-mail).
11. **Potwierdzenie/odrzucenie (klient).** E9: „Potwierdzam" → `zamkniete_wykonane`. „Odrzucam" (powód+zdjęcie) → **1. raz** wraca do `w_realizacji`; **2. raz** → `w_sporze` (operator). Brak reakcji 4 doby → auto `zamkniete_wykonane`.
12. **Oceny (obie strony).** E10: 1–5 + komentarz, powiązane z zamkniętym zleceniem. **Event `habit`** (klient: domknięte+ocenione zlecenie; fachowiec: kolejna wysłana oferta / zamknięte zlecenie).

### 4.2 Ścieżka poboczna — rezygnacja wybranego fachowca
Fachowiec (stan `wykonawca_wybrany` lub `w_realizacji`) → **rezygnacja** z powodem (D-14) → jeśli powód z listy + opis = uzasadniona (bez kary), inaczej nieuzasadniona (−25). Zlecenie: klient dostaje opcję **„Przywróć wcześniejsze oferty"** → system **ponownie potwierdza dostępność** pozostałych fachowców (te, które nadal aktywne, wracają do `zlozona`) → zlecenie wraca do `otwarte`/wybór. Jeśli brak dostępnych → klient publikuje ponownie.

### 4.3 Spory — flow operatora (D-09)
1. **Zdarzenie wyzwalające** trafia do kolejki: drugie odrzucenie zakończenia (auto), zgłoszenie nieobecności, zgłoszenie nadużycia SMS, zakwestionowana rezygnacja, inne nadużycie.
2. Operator otwiera spór → widzi **oś zdarzeń** + **stanowisko strony A**; **strona B** dostaje **formularz odpowiedzi (termin 48 h)**.
3. Operator: **uznaj / odrzuć / zamknij bez rozstrzygnięcia** + adnotacja.
4. **Skutki automatyczne:** np. uznanie nadużycia SMS → blokada 2 dni; uznanie nieuzasadnionej rezygnacji → −25 do score; odrzucenie odrzucenia zakończenia → `zamkniete_wykonane` + odblokowanie ocen. Wszystko RPC service-role, log w osi zdarzeń.

### 4.4 Abonament fachowca z powiatami (monetyzacja)
1. Fachowiec bez abonamentu → E5 skrócony podgląd → CTA „Kup abonament".
2. E13: wybór planu (Fachowiec/Firma), **wybór 2 powiatów w cenie**, opcjonalnie kod rabatowy → **Stripe Checkout** (karta dopiero tu) → `stripe_kyc` operatora już aktywny → direct charge + `application_fee_percent`.
3. Po opłaceniu: dostęp do pełnej listy + ofertowania w opłaconych powiatach; **event konwersji przy pierwszej ofercie** (`oferta_wyslana`).
4. **Dokupienie powiatu** (+19 zł): quantity subskrypcji, **proracja** natychmiast, auto-odnowienie; po wyłączeniu działa do końca okresu.
5. **Firma:** E14 — dodanie pracownika (+39 zł slot), wybór trybu obsługi, kontrola SEP przy przypisaniu.
6. **Wygaśnięcie:** brak płatności → spadek do **skróconego podglądu** (nie utrata konta). Gwarancja startowa / founding member = ręczny refund/kod operatora (zero kodu w v1).

---

## 5. Maszyny stanów (JAWNE listy przejść)

### 5.1 ZLECENIE — `zlecenia.status`
Stany: `otwarte` · `wykonawca_wybrany` · `w_realizacji` · `zakonczenie_zgloszone` · `zamkniete_wykonane` · `anulowane` · `w_sporze`.

| # | Z | → Do | Wyzwalacz / warunek |
|---|---|---|---|
| T1 | (—) | `otwarte` | Klient publikuje (walidacja minimum; „duży remont" NIE tworzy zlecenia) |
| T2 | `otwarte` | `wykonawca_wybrany` | Klient wybiera ofertę → ujawnienie telefonu, pozostałe oferty auto-zamknięte |
| T3 | `otwarte` | `anulowane` | Klient anuluje zlecenie |
| T4 | `wykonawca_wybrany` | `w_realizacji` | **Podwójna akceptacja** ustaleń na tej samej wersji (§5.3) → zamrożenie |
| T5 | `wykonawca_wybrany` | `otwarte` | Rezygnacja wybranego fachowca → klient przywraca oferty (ponowne potwierdzenie dostępności) |
| T6 | `w_realizacji` | `zakonczenie_zgloszone` | Fachowiec „Oznacz jako zakończone" → **start licznika 4 dni** |
| T7 | `w_realizacji` | `otwarte` | Rezygnacja fachowca w trakcie realizacji → przywrócenie ofert (jak T5) |
| T8 | `zakonczenie_zgloszone` | `zamkniete_wykonane` | Klient potwierdza **LUB** upływ 4 dób ciszy (auto) |
| T9 | `zakonczenie_zgloszone` | `w_realizacji` | **1. odrzucenie** zakończenia (powód+zdjęcie) |
| T10 | `zakonczenie_zgloszone` | `w_sporze` | **2. odrzucenie** zakończenia → kolejka operatora (D-09) |
| T11 | `w_sporze` | `zamkniete_wykonane` / `w_realizacji` / `anulowane` | Decyzja operatora (skutek wg typu sporu) |
| T12 | dowolny aktywny | `w_sporze` | Zgłoszenie nieobecności / nadużycia / zakwestionowana rezygnacja |

Reguły niezmienne: edycja treści zlecenia tylko w `otwarte`; po T4 zlecenie nieedytowalne i niewidoczne dla innych fachowców; oceny tylko po `zamkniete_wykonane`.

### 5.2 OFERTA — `oferty.status`
Stany: `zlozona` · `wybrana` · `odrzucona_wybrano_innego` · `wycofana` · `przywrocona`.

| Z | → Do | Wyzwalacz |
|---|---|---|
| (—) | `zlozona` | Fachowiec z abonamentem składa ofertę (bramka SEP jeśli flaga) |
| `zlozona` | `wybrana` | Klient wybiera tę ofertę |
| `zlozona` | `odrzucona_wybrano_innego` | Klient wybrał inną ofertę (auto) |
| `zlozona` | `wycofana` | Fachowiec wycofuje przed wyborem |
| `wybrana` | `przywrocona`→`zlozona` | Fachowiec rezygnuje → klient przywraca po potwierdzeniu dostępności |
| `odrzucona_wybrano_innego` | `zlozona` | Przywrócenie ofert po rezygnacji wybranego (jeśli fachowiec nadal dostępny) |

### 5.3 PODSUMOWANIE USTALEŃ — akceptacja wersjonowana (D-07)
- Encja `ustalenia`: `wersja` (int rosnący), `tresc`, `akceptacja_klient_wersja` (int|null), `akceptacja_fachowiec_wersja` (int|null).
- **AI generuje** wersję 1. **Edycja dowolnej strony** → `wersja+1`, treść nadpisana, **`akceptacja_druga_strona = null`** (reset), akceptacja edytującego może zostać ustawiona na nową wersję lub null (implementacyjnie: edycja NIE liczy się jako akceptacja — user musi kliknąć „Akceptuję" po edycji).
- **Akceptacja** = `akceptacja_<strona>_wersja = bieżąca wersja`.
- **Blokada (double-accept)** = `akceptacja_klient_wersja == akceptacja_fachowiec_wersja == max(wersja)` → wyzwala T4 (zlecenie `w_realizacji`, zamrożenie).

### 5.4 SUBSKRYPCJA — `subskrypcje.status` (Stripe-mirror)
Stany: `aktywna` · `past_due` (dunning) · `anulowana` · `wygasla`. Przejścia z webhooka Stripe (inbox pattern → processor idempotentnie). `wygasla`/`anulowana` → dostęp fachowca spada do **skróconego podglądu** (nie utrata konta). Dodatki (powiat/pracownik) = pozycje subskrypcji z `quantity` + proracja.

---

## 6. Eventy instrumentacji (nazwy STAŁE — `track.js` standard + niszowe)

> Wszystkie idą do `app_events` (RLS: user wstawia własne). Aha klienta wstawiane **SERWEROWO** (service-role). Każdy event niesie `variant` (uczenie między apkami). Dashboard TTFV liczy serwerowo z `profiles.activated_at`.

| Event | Strona | Kiedy / źródło | Meta | Rola w lejku |
|---|---|---|---|---|
| `signed_up` | obie | rejestracja (t0), `auth.js` | `{metoda:'email'\|'sms'}` | start (standard) |
| `jtbd_selected` | obie | wybór strony w survey, `onboard.js` | **`{strona:'klient'\|'fachowiec'}`** | segmentacja (steruje lejkiem) |
| `zlecenie_opublikowane` | klient | publikacja E3 (client), in-session | `{zlecenie_id, kategoria, powiat, zasieg_n}` | **proxy-aha klient** (TTFV<10 min) |
| `oferta_otrzymana` | klient | PIERWSZA oferta na zlecenie, **SERWEROWO** (edge, service-role) | `{aha_source:'server-webhook', zlecenie_id, oferta_id}` | **`activated` KLIENT** |
| `zlecenia_lokalne_zobaczone` | fachowiec | wejście na listę lokalną E5 (client) | `{powiat, liczba_zlecen}` | **`activated` FACHOWIEC** |
| `oferta_wyslana` | fachowiec | wysłanie oferty E6 (z abonamentem) | `{zlecenie_id, oferta_id, ma_abonament:true}` | konwersja/habit (NIE activation) |
| `activated` | obie | emitowane w chwili aha danej strony (ustawia `profiles.activated_at`) | `{strona, aha_event, aha_source?, time_since_signup}` | activation uniwersalne (standard) |
| `habit` | obie | powtórka rdzenia: klient=2. domknięte+ocenione zlecenie; fachowiec=kolejna oferta/zamknięte zlecenie | `{strona, kind}` | predyktor retencji (standard) |

**Uzupełniająco (standard onboardingowy):** `onboarding_started`, `setup_completed`, `onboarding_step_done` (checklista „Pierwsze kroki" per strona), `onboarding_friction` (mikro-prompt „co Cię zatrzymało"). 

**Reguła podwójnego emitu aha:** przy aha danej strony emitujemy JEDNOCZEŚNIE (a) event niszowy (`oferta_otrzymana` / `zlecenia_lokalne_zobaczone`) do feedu operatora oraz (b) `activated` z `meta.strona` + `meta.aha_event` (ustawia `activated_at` przez lifecycle-emails). Każdy user należy do JEDNEJ strony, więc `activated_at` jest jednoznaczny.

---

## 7. Ton i kryteria globalne

- **Ton:** praktyczny, roboczy, po polsku, **senior-friendly** — duże cele dotykowe, duże ceny/odległości/terminy, minimum żargonu, krótkie komunikaty. Zero „przepraszających" empty-state sugerujących porażkę usera.
- **Design (PREVIEW-BRIEF, wiążący dla UI):** tło piaskowe `#F3EFE5`, karty kremowe `#FFFDF7`, akcent/CTA pomarańcz `#F05A28`, robocza zieleń statusów `#2F7D57` (zielony TYLKO dla stanów pozytywnych/domkniętych); mocny zwarty grotesk; zaokrąglenia 12 px, ciemne obrysy, krótkie offsetowe cienie; etykiety zleceń jak papierowe znaczniki z warsztatu.
- **Mobile-first** (fachowiec w trasie, klient na telefonie): sweep 360/390/414.
- **Każdy ekran:** stany puste / błędów / ładowania; walidacje inline; TTFV proxy < 10 min egzekwowany na `zlecenie_opublikowane` (klient) i `zlecenia_lokalne_zobaczone` (fachowiec).
- **Granica v1 vs rozwój:** wg 01-MVP-SCOPE §5 — strojenie progów (score/przypomnienia) i copy = w cenie; zmiana logiki D-* lub nowy byt danych = rozwój.

---

## 8. Otwarte / zależne (sygnalizacja — NIE zmieniam decyzji)

- **B-01 miasto startu** — blokuje seed słownika TERYT i copy landingu; schemat i haversine buduje się bez niego (city-agnostic). Owner: klient, krok `dane_operatora`.
- **`activated`(KLIENT)=`oferta_otrzymana`** strukturalnie zależny od podaży → TTFV<10 min egzekwować na proxy `zlecenie_opublikowane`; `oferta_otrzymana` raportować z celem „ta sama doba" (bramka płynności = warunek launchu, nie metryka do poprawy po fakcie).
- **Panel firmy/pracownicy (D-12)** = najcięższy przyrost zakresu; tor rekomenduje jako pierwszy fast-follow, ale zostaje w scope (MUST-HAVE).
- **Głos+transkrypcja (A-04)** = najcięższy technicznie element W2; tekstowy komunikator dowozi całą pętlę — naturalny punkt cięcia pod presją czasu.
