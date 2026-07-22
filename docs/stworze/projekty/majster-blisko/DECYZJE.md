# DECYZJE — Majster Blisko (nazwa robocza)

Projekt wfa: `e3c7f9e8-87c9-4e06-bf9e-3f744dfbb13e` · sesja spar: `637ef07e-883d-4e5a-9e2d-886837904550`
Klient/operator: inwestobiznes@gmail.com · pełna płatność 14.07.2026 · know-how zamknięty 15.07.2026

Rozstrzygnięcia sesji 22.07.2026 (decyzja Tomka 20.07: decyzje produktowe podejmuje SESJA;
Tomek może nadpisać jednym zdaniem; akcept merytoryczny = klient przy demo).
Zasada nadrzędna: najszybszy go-to-market, zero przekombinowania, v1 = drobne prace w jednym mieście.

## Otwarte decyzje z handoffu (§11) — rozstrzygnięcia

### D-01 — Model obszaru dojazdu ✅
**Decyzja:** Jednostka obszaru = POWIAT (zgodnie z abonamentem: 2 powiaty w cenie, +19 zł/powiat).
Widoczność zlecenia dla fachowca = powiat zlecenia ∈ opłacone powiaty fachowca (+ filtr specjalizacji).
Klient przy zleceniu podaje: miasto/dzielnicę (z listy) — powiat wynika ze słownika.
Odległość na kartach = haversine z centroidów miast/dzielnic (statyczny słownik TERYT w DB,
seed dla miasta startu + powiaty ościenne). **Bez zewnętrznego API map w v1** (zero kosztów i kluczy).
Powiadomienie o nowym zleceniu: fachowcy z abonamentem, powiat + specjalizacja zgodne.
*Dlaczego:* spójne z modelem monetyzacji (powiat = jednostka sprzedaży), proste do policzenia,
zero zależności zewnętrznych; promień/mapa = v1.1, jeśli rynek o to poprosi.

### D-02 — Widoczność odpowiedzi klienta ✅
**Decyzja:** Przy każdej odpowiedzi klienta przełącznik dwustanowy: **„Widoczna dla wszystkich" (domyślnie)**
/ „Tylko dla pytającego". Odpowiedzi fachowców (pytania i oferty) — zawsze publiczne (wymóg klienta).
*Dlaczego:* publiczne Q&A zmniejsza liczbę powtórzonych pytań (wartość dla obu stron); jeden prosty
przełącznik = czytelne dla seniorów; dokładnie dwie opcje bo trzecia („ukryj częściowo") to przekombinowanie.

### D-03 — Lista prac ryzykownych ✅
**Decyzja:** W v1 JEDNA kategoria oznaczona flagą „wymaga uprawnień": **Elektryka** (prace przy instalacji
— wymagane świadectwo kwalifikacyjne SEP E do 1 kV; drobnica typu wymiana żarówki/oprawy bez flagi,
rozróżnienie przykładami w formularzu). **Gaz i awaryjne otwieranie zamków = POZA v1** (patrz D-05).
*Dlaczego:* elektryka jest w rdzeniu specjalizacji aplikacji i ma jasną podstawę prawną (SEP);
poszerzanie listy = analiza prawna, która nie blokuje startu.

### D-04 — Weryfikacja uprawnień ✅
**Decyzja:** v1 = **SAMODEKLARACJA**: fachowiec przy specjalizacji „Elektryka" zaznacza posiadanie
świadectwa SEP i podaje jego numer (widoczny na profilu). Przy ofercie do zlecenia z flagą „wymaga
uprawnień" system dopuszcza tylko fachowców z deklaracją. Platforma NIE weryfikuje dokumentów
(zgodnie z Kartą Projektu); regulamin: odpowiedzialność za prawdziwość deklaracji po stronie wykonawcy,
operator może zablokować konto po zgłoszeniu. Firmy: system pilnuje aktualności deklaracji pracownika
przed przypisaniem do zlecenia z flagą (pole „ważne do" — świadectwa SEP są terminowe, 5 lat).
*Dlaczego:* rozstrzyga sprzeczność handoffu (Karta wyłącza weryfikację dokumentów vs wymóg kontroli):
kontrola = bramka deklaracji + termin ważności, nie ocena dokumentów. Weryfikacja dokumentów = v1.1+.

### D-05 — Awaryjne otwieranie mieszkań i samochodów ✅
**Decyzja:** **POZA v1.** Kategoria niedostępna w formularzu (nie pokazujemy jej wcale).
*Dlaczego:* wymaga realnej weryfikacji ślusarza i prawa klienta do lokalu/pojazdu — ryzyko prawne
nieproporcjonalne do wartości startu; klient sam oznaczył „zakres po analizie wymogów prawnych".
Wraca w v1.1 po analizie prawnej.

### D-06 — Duże prace ✅
**Decyzja:** v1 obsługuje WYŁĄCZNIE drobne prace (kilka godzin – ~2 dni). Formularz rozróżnia
przykładami; wybór „duży remont" = ekran informacyjny „Platforma łączy z fachowcami od drobnych prac"
(bez publikacji). KAŻDE zlecenie może dostać ofertę w formie: widełki ceny LUB propozycja oględzin
(mechanizm oględzin jest w rdzeniu, nie tylko dla dużych prac).
*Dlaczego:* zgodne z §10 handoffu (większe remonty poza zakresem); oględziny rozwiązują problem
„nie wycenię ze zdjęcia" także przy drobnych pracach.

### D-07 — Poprawki podsumowania ustaleń ✅
**Decyzja:** Podsumowanie generuje aplikacja (AI z rozmowy). Stan akceptacji trzymany OSOBNO per strona.
Każda edycja (dowolnej strony) resetuje akceptację DRUGIEJ strony; blokada ogłoszenia następuje, gdy
OBIE strony mają zaakceptowaną tę samą (ostatnią) wersję. Edytować może każda ze stron przed podwójną
akceptacją.
*Dlaczego:* najprostszy model bez ról „kto może poprawiać"; niemożliwe zatwierdzenie rozjechanych wersji.

### D-08 — Start odliczania 4 dni ✅
**Decyzja:** Licznik startuje w momencie oznaczenia „zakończone" przez fachowca. Po 4 dobach bez
reakcji klienta zlecenie zamyka się automatycznie jako wykonane. Przypomnienia do klienta po 24 h
i po 72 h (push/e-mail; bez SMS — to nie jest „pilna wiadomość").
*Dlaczego:* jedyny jednoznaczny moment startu; przypomnienia ratują przypadki „zapomniałem".

### D-09 — Ręczna weryfikacja sporów ✅
**Decyzja:** v1 = kolejka „Spory i zgłoszenia" w panelu operatora. Typy: drugie odrzucenie zakończenia,
zgłoszenie nieobecności, zgłoszenie nadużycia pilnych SMS, inne nadużycie. Operator widzi oś zdarzeń
zlecenia + stanowiska obu stron (formularz odpowiedzi drugiej strony z terminem 48 h) i wydaje decyzję
klikiem (uznaj / odrzuć / zamknij bez rozstrzygnięcia) z adnotacją. Decyzja operatora wyzwala skutki
automatycznie (np. odblokowanie oceny, blokada SMS 2 dni, korekta wskaźnika rzetelności).
*Dlaczego:* klient sam założył ręczną moderację; automatyzować będzie v2 po realnych danych.

### D-10 — Prezentacja firma/osoba prywatna ✅
**Decyzja:** Badge na profilu i przy każdej ofercie: „Firma" (z nazwą firmy) albo „Osoba prywatna".
Obok ikona dokumentu: „Wystawia fakturę/rachunek" / brak → ostrzeżenie przy ofercie (wymóg handoffu).
*Dlaczego:* minimum które realizuje wymaganie przejrzystości; NIP na profilu firmy opcjonalny.

### D-11 — Algorytm pozycji ofert po rezygnacjach ✅
**Decyzja:** Jawny, prosty scoring: pozycja ofert = sort po (score DESC, czas złożenia ASC).
Score bazowy 100; każda NIEUZASADNIONA rezygnacja z ostatnich 90 dni: −25 pkt (max −75).
Powrót do 100 po 3 poprawnie zakończonych realizacjach bez kolejnej nieuzasadnionej rezygnacji
(mechanizm już wymagany w handoffu). Wskaźnik NIE zmienia oceny gwiazdkowej.
*Dlaczego:* deterministyczny, wytłumaczalny użytkownikowi i operatorowi; bez ukrytych wag.

### D-12 — Przenoszenie opłaconych dodatków ✅
**Decyzja:** Dodatkowy POWIAT: zmiana przypisania (który powiat) możliwa przy odnowieniu okresu
rozliczeniowego — tak samo jak 2 powiaty bazowe. Dodatkowy PRACOWNIK: to slot — przypisanie osoby
można zmienić w dowolnym momencie (odchodzący traci dostęp, jego oceny znikają z publicznego profilu
firmy; historia wewnętrzna zostaje do sporów — wymogi handoffu).
*Dlaczego:* powiat = zasięg sprzedażowy (stabilny w okresie), pracownik = rotacja kadrowa (płynna).

### D-13 — Cennik firm / warianty ✅ (kotwica; finalizacja w kroku `pricing`)
**Decyzja:** Kotwica = cennik klienta: 0 zł klient / 99 zł mies. fachowiec / 149 zł mies. firma /
+39 zł pracownik / +19 zł powiat (brutto); rok = 10 miesięcy (rabat tylko na abonament główny,
dodatki płatne z góry za rok). Bez okresu próbnego (decyzja klienta). Bez dalszych wariantów w v1.
Krok `pricing` waliduje researchem i może zaproponować korektę (decyzja tam, z liczbami).

### D-14 — Nagłe zdarzenia ✅
**Decyzja:** Bez osobnego mechanizmu „wyjątków". Nagła choroba/awaria = usprawiedliwiony powód
rezygnacji (lista z handoffu): rezygnacja z powodem z listy + opis + opcjonalny dowód nie obniża
wskaźnika; druga strona może zakwestionować → trafia do kolejki operatora (D-09).
*Dlaczego:* wymogi handoffu już to pokrywają; dodatkowy mechanizm = przekombinowanie.

## Decyzje architektoniczne (A-*)

### A-01 — Stack
Standard fabryki (saas-starter): statyczny HTML + vanilla JS + Supabase (nowy projekt EU) + Vercel +
Resend. Bez frameworków. Deploy = git push main.

### A-02 — Logowanie
E-mail + hasło (silnik startera) **oraz** telefon + kod SMS (wymóg MUST-HAVE klienta).
SMS OTP przez Supabase Auth **Send SMS hook** → SMSAPI (ekosystem TN ma wzorzec: edge fn `send-sms`
w tn-crm). Kolejność budowy: e-mail+hasło w sesji auth, SMS OTP jako osobna sesja przed testami E2E.
Telefon = pole obowiązkowe konta niezależnie od metody logowania (potrzebny do ujawnienia po wyborze
oferty i pilnych SMS).

### A-03 — SMS transakcyjne
SMSAPI (jak w tn-crm). Wyłącznie: kody logowania + „pilna wiadomość" w aktywnym zleceniu
(limit 2/24 h per strona, blokada 2 dni po potwierdzonym nadużyciu — decyzja operatora).

### A-04 — Transkrypcja głosowa + podsumowanie ustaleń
OpenAI (model transkrypcji + model tekstowy) przez edge functions. Koszt = pass-through na operatora
(standard fabryki: rozliczenie AI po stronie operatora). Transkrypcja edytowalna z etykietą „edytowano".

### A-05 — Lokalizacja
Statyczny słownik w DB (TERYT): powiaty → miasta → dzielnice z centroidami (lat/lng).
Seed: miasto startu operatora + powiaty ościenne (miasto startu = dane_operatora, BLOKADA B-01).
Odległość = haversine. Bez API map.

### A-06 — Płatności
Stripe Connect standard fabryki: konto Standard operatora (KYC = krok stripe_kyc), direct charges,
application_fee_percent z wfa_projects.fee_percent. Abonamenty = Stripe Subscriptions; dodatkowe
powiaty i pracownicy = pozycje subskrypcji z quantity; proporcjonalne naliczenie (proration) Stripe
przy dokupieniu w trakcie okresu. Rabaty operatora = moduł startera (Coupons + Promotion Codes).

### A-07 — Powiadomienia
In-app (tabela + badge) + e-mail (Resend) + SMS (tylko pilne). Wszystkie kanały domyślnie ON;
ustawienia per kanał; fachowiec dodatkowo dni/godziny doręczeń (bez narzuconej ciszy nocnej).

## Blokady (B-*)

### B-01 — Miasto startu nieznane (owner: KLIENT, krok `dane_operatora`)
Aplikacja jest „na jedno miasto" — nie wiemy które. Wpływa na: seed słownika lokalizacji,
copy landingu, GTM. NIE blokuje budowy rdzenia (schemat city-agnostic). Do pozyskania od klienta
wraz z materiałami operatora.

## Rozstrzygnięcia wątpliwości toru schematu (S-*, sesja 22.07)

- **S-01 Ostrzeżenie o kliencie:** mechanizm GENERYCZNY na `mb_profiles.ostrzezenie_aktywne` dla OBU stron
  (handoff: wskaźnik rzetelności obowiązuje jednakowo klientów i fachowców). Klient: 3 nieuzasadnione
  rezygnacje → fachowcy widzą ostrzeżenie przy zleceniu; znika po 3 prawidłowych realizacjach. Fachowiec:
  analogicznie przez score (D-11).
- **S-02 Dokładny adres:** NIE trzymamy dokładnego adresu w bazie w v1 (mniej PII). `mb_zlecenie_kontakt`
  trzyma TYLKO telefon (ujawniany wybranemu wykonawcy); adres klient przekazuje w komunikatorze
  (zgodnie z handoff §3 pkt 6). Pole adresu usunąć z draftu schematu przy aplikacji.
- **S-03 Oceny i komentarze:** publiczne dla zalogowanych, obustronnie (reputacja dwustronna z handoffu);
  ukrywanie tylko przez flagę D-12 (były pracownik) i decyzję operatora.
- **S-04 Score:** interpretacja toru POTWIERDZONA — kara za rezygnację odpracowana, gdy po jej dacie
  są ≥3 poprawne realizacje.
- **S-05 Spójność abonamentu:** `profiles.lifecycle_status` (starter) + `mb_abonamenty` (powiaty dla RLS)
  pisze OBA stripe-processor — wymóg do brief/06-CLAUDE.md-NOTES (sekcja gotchas).
- **S-06 Podgląd bez abonamentu:** widzi publiczne Q&A (tekst), NIE widzi zdjęć ani kontaktu — POTWIERDZONE
  (FOMO wartości; zdjęcia = wartość płatna).
- **S-07 Seed lokalizacji:** czeka na B-01; schemat city-agnostic.

## Odłożone świadomie (v1.1+)
- Awaryjne otwieranie zamków (D-05) — po analizie prawnej.
- Kategorie gazowe — poza zakresem.
- Weryfikacja dokumentów uprawnień przez platformę (D-04) — v1 samodeklaracja.
- Promień/mapa jako model obszaru (D-01) — v1 powiaty.
- Płatności za usługę w aplikacji, kalendarz, auto-dobieranie fachowca, katalog usług,
  abonament klientów, duże remonty (handoff §10).
