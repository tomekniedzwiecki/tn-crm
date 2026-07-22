# 00-KONTEKST-BIZNESOWY — {{APP_NAME}} (nazwa robocza: „Majster Blisko") · DRAFT do paczki, 2026-07-22

> Nazwa finalna **NIE wybrana** — w treściach produktu/landingu używamy placeholdera `{{APP_NAME}}`.
> „Majster Blisko" to wyłącznie nazwa robocza projektu (nie kanon marketingowy).
> Zbudowane z: HANDOFF-PACK.md (12 sekcji) · DECYZJE.md (D-01..D-14, A-01..A-07, B-01) · 01-MVP-SCOPE.md · zrodla/PREVIEW-BRIEF.json · PRICING-FINAL.md.

---

## 1. Nisza i problem główny

**Nisza.** Lokalny marketplace drobnych prac domowych **w jednym mieście** (v1 = jedno miasto, schemat city-agnostic). Segment: drobne, pilne naprawy trwające od kilku godzin do ~2 dni — hydraulika, elektryka, złota rączka, malowanie, montaż, drobne prace ślusarskie i budowlane. Świadomie **poza** segmentem: duże remonty (kilka dni), awaryjne otwieranie zamków, kategorie gazowe (patrz §4, D-05/D-06).

**Problem główny.** Klient z drobną, pilną usterką (cieknący syfon, montaż, wymiana oprawy) traci czas w grupach na Facebooku i na obdzwanianiu numerów, nie mając pewności co do dostępności, ceny ani rzetelności wykonawcy. Fachowiec z drugiej strony płaci u konkurencji (Fixly/Oferteo) za każdy pojedynczy kontakt — bez gwarancji wygranej. `{{APP_NAME}}` rozwiązuje oba końce: klient w < 1 min i **za 0 zł** publikuje zlecenie i widzi realnych lokalnych fachowców, a fachowiec płaci **stały abonament za dostęp do świeżych zleceń z własnego powiatu**, nie za każdy kontakt.

**USP.** „Drobna naprawa? Fachowiec z Twojej okolicy" — gęsta lokalna podaż w jednym mieście, ochrona danych kontaktowych do momentu wyboru oferty i dwustronna reputacja. Przewaga nad grupami FB i pay-per-lead: klient płaci 0 zł, kontakt chroniony do wyboru, fachowiec ma parytet kosztu już przy ~3 kontaktach/mies., a przy 10+ jest wielokrotnie taniej (PRICING-FINAL).

---

## 2. Ludzie i model biznesowy

- **Klient / operator (merchant of record):** **Jakub Gajowiak** — inwestobiznes@gmail.com, tel. **517511405**. Jego Stripe, jego marka, jego miasto startu. Rozstrzyga merytorycznie przy demo.
- **Fee platformy TN:** **10% od przychodu** (`wfa_projects.fee_percent`), realizowane jako `application_fee_percent` na Stripe Connect (konto Standard operatora, direct charges — A-06).
- **Monetyzacja JEDNOSTRONNA:** klient zlecający płaci **0 zł**; przychód wyłącznie z abonamentów fachowców/firm. Klient nie ma abonamentu w v1 (świadome cięcie — szybszy popyt).

**Cennik (BRUTTO, PLN) — kotwica klienta utrzymana (PRICING-FINAL, D-13):**

| Plan | Miesięcznie | Rocznie (= 10 mies., −16,7%) |
|---|---|---|
| Klient zlecający | **0 zł** | — |
| Fachowiec (solo) | **99 zł** | **990 zł** |
| Firma | **149 zł** | **1490 zł** |
| + dodatkowy pracownik | **39 zł/mc** | 468 zł/rok (bez rabatu, z góry) |
| + dodatkowy powiat | **19 zł/mc** | 228 zł/rok (bez rabatu, z góry) |

- Abonament bazowy (fachowiec i firma) obejmuje **2 powiaty**. Jednostka sprzedaży = **powiat** (D-01).
- Rabat roczny **tylko** na abonament główny; dodatki w planie rocznym płatne z góry za rok. Dokupienie dodatku w trakcie okresu = proporcjonalnie (Stripe proration), odnawia się automatycznie.
- **Bez okresu próbnego** (twarda decyzja klienta). Furtka wartości przed zakupem = **darmowy skrócony podgląd** realnych zleceń w obszarze (bez danych kontaktowych i bez ofertowania).
- Prośba o kartę dopiero przy zakupie (Stripe Checkout), nigdy wcześniej.
- Benchmark rynkowy: tańsi od Booksy (135–145 zł netto + 35 zł/pracownik) przy tej samej strukturze; parytet z pay-per-lead już przy ~3 kontaktach/mc.

---

## 3. Rozstrzygnięcia decyzji — skrót (pełne uzasadnienia: DECYZJE.md)

**Decyzje produktowe D-01..D-14** (rozstrzyga SESJA; Tomek nadpisuje jednym zdaniem; akcept merytoryczny = klient przy demo):

| ID | Temat | Rozstrzygnięcie (skrót) |
|---|---|---|
| D-01 | Model obszaru | Jednostka = **POWIAT** (2 w cenie, +19 zł/powiat); widoczność = powiat zlecenia ∈ opłacone powiaty + specjalizacja; odległość = haversine z centroidów TERYT, **bez API map** |
| D-02 | Widoczność odpowiedzi klienta | Przełącznik 2-stanowy: „Widoczna dla wszystkich" (domyślnie) / „Tylko dla pytającego"; odpowiedzi fachowców zawsze publiczne |
| D-03 | Prace ryzykowne | v1: jedna flaga „wymaga uprawnień" = **Elektryka** (instalacja, SEP E do 1 kV); gaz i otwieranie zamków poza v1 |
| D-04 | Weryfikacja uprawnień | **Samodeklaracja** SEP + numer + „ważne do"; bramka przy zleceniu z flagą; platforma NIE weryfikuje dokumentów (Karta Projektu) |
| D-05 | Awaryjne otwieranie | **POZA v1** — kategoria niepokazywana (ryzyko prawne); wraca w v1.1 po analizie |
| D-06 | Duże prace | v1 = tylko drobne (godziny–~2 dni); „duży remont" = ekran informacyjny bez publikacji; oferta = widełki **albo** oględziny |
| D-07 | Podsumowanie ustaleń | AI generuje z rozmowy; akceptacja OSOBNO per strona; edycja resetuje akcept drugiej; blokada po podwójnej akceptacji tej samej wersji |
| D-08 | Odliczanie 4 dni | Start w momencie „zakończone" przez fachowca; przypomnienia 24 h i 72 h (push/e-mail, bez SMS); auto-zamknięcie jako wykonane |
| D-09 | Spory (ręcznie) | Kolejka operatora: 2. odrzucenie zakończenia, nieobecność, nadużycie SMS, inne; decyzja klikiem, skutki automatyczne |
| D-10 | Firma / osoba prywatna | Badge przy profilu i ofercie + ikona faktura/rachunek; ostrzeżenie i twarde potwierdzenie „bez faktury" wg potrzeby klienta |
| D-11 | Scoring pozycji ofert | Jawny: bazowo 100; nieuzasadniona rezygnacja (90 dni) −25 pkt (max −75); powrót po 3 poprawnych; NIE zmienia gwiazdek |
| D-12 | Przenoszenie dodatków | Powiat: zmiana przy odnowieniu; pracownik = slot (osoba zmienna w czasie; oceny odchodzącego znikają z profilu, historia zostaje do sporów) |
| D-13 | Cennik firm/warianty | Kotwica klienta utrzymana (patrz §2); bez dalszych wariantów w v1; finalizacja w kroku `pricing` (→ PRICING-FINAL) |
| D-14 | Nagłe zdarzenia | Bez osobnego mechanizmu; choroba/awaria = usprawiedliwiony powód rezygnacji; kwestionowanie → kolejka operatora |

**Decyzje architektoniczne A-01..A-07:**

| ID | Obszar | Rozstrzygnięcie (skrót) |
|---|---|---|
| A-01 | Stack | saas-starter: statyczny HTML + vanilla JS + Supabase (nowy projekt EU) + Vercel + Resend; deploy = git push main |
| A-02 | Logowanie | E-mail+hasło (silnik startera) **oraz** telefon+SMS OTP (Supabase Send SMS hook → SMSAPI); telefon = pole obowiązkowe konta |
| A-03 | SMS transakcyjne | SMSAPI; wyłącznie kody logowania + „pilna wiadomość" (limit 2/24 h per strona, blokada 2 dni po nadużyciu) |
| A-04 | Transkrypcja + podsumowanie | OpenAI (transkrypcja + tekst) przez edge fns; koszt = **pass-through na operatora**; transkrypcja edytowalna z etykietą „edytowano" |
| A-05 | Lokalizacja | Statyczny słownik TERYT w DB (powiat→miasto→dzielnica + centroidy); haversine; **bez API map** |
| A-06 | Płatności | Stripe Connect (konto Standard operatora, direct charges, KYC = krok `stripe_kyc`); Subscriptions + dodatki quantity + proracja; rabaty = Coupons/Promo |
| A-07 | Powiadomienia | In-app + e-mail (Resend) + SMS (tylko pilne); kanały domyślnie ON; fachowiec dodatkowo dni/godziny doręczeń |

---

## 4. Ryzyka (HANDOFF §12) + mitygacje (SCOPE)

| Ryzyko (HANDOFF §12) | Mitygacja (01-MVP-SCOPE / PRICING-FINAL) |
|---|---|
| Za mało zleceń w mieście zniechęci fachowców do abonamentu | **Skrócony podgląd** = wbudowany hak płynności (widzisz realne zlecenia za darmo, ofertujesz po abonamencie); **gwarancja startowa** (1. miesiąc bez ani jednego zlecenia w obszarze = zwrot 99/149 zł, ręczny refund operatora) |
| Równoległe pozyskanie klientów i fachowców; start = jedno miasto | **Liquidity concierge operatora** (§4.3 SCOPE): najpierw pionierska podaż fachowców (kod founding member −50% na 3 mies.), równolegle realny popyt zleceń; ZERO fałszywego seedu |
| Fałszywe oceny, rezygnacje, nieobecności, nadużycia SMS | Ręczna kolejka operatora (D-09); jawny scoring rzetelności (D-11); limit i blokada pilnych SMS |
| Nie każdą pracę wycenisz ze zdjęcia | Oferta = widełki ceny **albo** propozycja oględzin w rdzeniu (D-06) |
| Sprzeczność zakresowa: Karta wyłącza weryfikację dokumentów vs kontrola uprawnień | Kontrola = **bramka samodeklaracji SEP + termin ważności**, nie ocena dokumentów (D-04) |
| Nieustalone wymogi prawne (elektryka, otwieranie zamków) | Otwieranie zamków i gaz **poza v1** (D-05); elektryka = SEP E do 1 kV (jasna podstawa) |
| Błędy transkrypcji/podsumowania AI wpływają na ustalenia | Podsumowanie do **podwójnej akceptacji**; transkrypcja edytowalna z etykietą „edytowano"; sygnalizowane jako punkt cięcia pod presją czasu (§7 SCOPE) |
| Nieustalony model danych lokalizacyjnych / odległości | Statyczny słownik TERYT + haversine (A-05); bez zależności zewnętrznych |
| Brak dostawców płatności/SMS/e-mail/map/plików | Rozstrzygnięte: Stripe / SMSAPI / Resend / słownik TERYT / Supabase Storage / OpenAI |
| Panel firmy, abonamenty, spory, weryfikacja = duży przyrost zakresu | Sygnalizacja §7 SCOPE: rozważyć firmę/pracowników jako **fast-follow v1.1**, launch na parze klient–fachowiec indywidualny (zostaje w scope wg MUST-HAVE) |

**Bramka launchu (SCOPE §4.3):** minimalny **próg płynności** w mieście startu (podaż fachowców × świeże zlecenia) traktujemy jak **warunek uruchomienia**, nie jak metrykę do optymalizacji po fakcie. `activated`(KLIENT)=`oferta_otrzymana` jest strukturalnie zależne od podaży — bez zobowiązania operatora do płynności startowej metryka aha klienta będzie martwa niezależnie od jakości produktu. TTFV < 10 min egzekwujemy na proxy-aha `zlecenie_opublikowane`; `oferta_otrzymana` raportujemy z celem „ta sama doba".

---

## 5. Otwarte uwagi i blokady

- **B-01 — Miasto startu NIEZNANE (owner: KLIENT, krok `dane_operatora`).** Aplikacja jest „na jedno miasto", ale nie wiemy które. Wpływa na: seed słownika lokalizacji (TERYT), copy landingu, GTM, słowa kluczowe SEO (`{{MIASTO}}`). **NIE blokuje** budowy rdzenia — schemat city-agnostic buduje się bez tej wartości. Do pozyskania od klienta wraz z materiałami operatora.
- **Nazwa finalna `{{APP_NAME}}`** — niewybrana; „Majster Blisko" = nazwa robocza. Blokuje finalny brand/domenę i copy z nazwą (landing, OG, title).
- **Otwarte z DECYZJE (świadomie odłożone v1.1+):** awaryjne otwieranie zamków (D-05), kategorie gazowe, weryfikacja dokumentów przez platformę (D-04), promień/mapa jako model obszaru (D-01), płatność za usługę w aplikacji, kalendarz, auto-matching, katalog usług, abonament klienta, duże remonty.

---

## 6. Zegar umowny

- **Pełna płatność:** 14.07.2026 (zapłacone).
- **Know-how zamknięty:** 15.07.2026.
- **Deadline dostarczenia:** **08.09.2026**.
- Projekt wfa: `e3c7f9e8-87c9-4e06-bf9e-3f744dfbb13e` · sesja spar: `637ef07e-883d-4e5a-9e2d-886837904550`.

---

## 7. Źródła

HANDOFF-PACK.md (12 sekcji) · DECYZJE.md (D-01..D-14, A-01..A-07, B-01) · 01-MVP-SCOPE.md (SCOPE v1 ZATWIERDZONY) · PRICING-FINAL.md · zrodla/PREVIEW-BRIEF.json · zrodla/PRICING-RESEARCH-A/B.
