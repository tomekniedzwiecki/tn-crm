# ALLEGRO → MARKA — koncept oferty dla sprzedawców Allegro

> **STATUS: KONCEPT do decyzji Tomka (2026-07-22). NIE zaakceptowany, NIE wdrażać bez akceptu.**
> Źródło: 4 równoległe analizy agentowe (rynek · kanały GTM · oferta · wykonalność techniczna), sesja 22.07.2026.
> Pomysł Tomka: pójść do sprzedawców Allegro i na podstawie ich aukcji zbudować im markę + wszystko, co produkuje fabryka.

---

## 0. STRESZCZENIE DECYZYJNE

**Werdykt czterech analiz: GO warunkowy.** Rynek jest duży (~130–160 tys. profesjonalnych sprzedawców, rdzeń oferty ~20–40 tys.), ból realny i narastający (prowizje, CPC Ads, Temu, brak bazy klientów), trend hybrydy marketplace+własny kanał już zwalidowany danymi (+30% wzrostu przychodów), a wąskim gardłem rynku jest dokładnie to, co robi fabryka: **marka + kreacja + ruch**. Technicznie wejście z Allegro jest MAŁYM nakładem (OAuth + fetcher; ~85% danych mapuje się 1:1 lub lepiej niż z AliExpress; pipeline fabryki reuse bez zmian).

**Warunki powodzenia (wszystkie trzy):**
1. **Rama „wygrywaj mocniej na Allegro", nie „porzuć Allegro"** — wejście przez Strefę Marek (wymaga znaku towarowego → naturalny element oferty), D2C jako druga noga.
2. **Twarda kwalifikacja klientów** — marka nie uratuje czystego arbitrażu ceny; bramka: marża jednostkowa, AOV, choć częściowa wyłączność produktu.
3. **Akwizycja PULL, nie PUSH** — cold e-mail = ryzyko PKE (art. 398, brak stanowiska regulatora, precedens Bisnode 943 tys. zł); wiadomości Allegro = złamanie regulaminu i ban. Silnik: „wklej link aukcji → zobacz swoją markę".

**Zakaz konkurencji TakeDrop (do 31.03.2028) NIE blokuje pomysłu, tylko go kształtuje:** checkout produktów fizycznych wyłącznie przez white-label (niedzwiecki.ai/Trevio), zakaz promowania innych platform. Fabryka i tak wszystko stawia na Trevio automatem — spójne.

---

## 1. RAMA OFERTY (pozycjonowanie)

**NIE sprzedajemy „sklepu"** (słyszeli 100×, mieli, nie sprzedawał). **NIE sprzedajemy „ucieczki z Allegro"** (Allegro to ich maszyna wolumenu). Sprzedajemy trzy rzeczy naraz:

1. **Rozpoznawalność, która broni marży** — marka + zastrzeżony znak towarowy = wejście do **Strefy Marek Allegro** (tytuł „Oficjalny Sklep", lepsza pozycja, obrona przed „podpinaniem się" konkurencji pod oferty przez katalog/GS1). To wzmacnia ICH GŁÓWNY kanał — rozbraja konflikt.
2. **Własny klient** — Allegro celowo blokuje relację (usuwa telefony, zero zgód marketingowych). „Klient nie jest Twój" = najmocniejszy hak komunikacyjny. D2C = baza, remarketing, LTV.
3. **Aktywo zbywalne** — z konta Allegro nie zrobisz exitu; z marki (znak + baza + sklep) — tak.

Linia otwierająca (robocza): *„Sprzedajesz świetnie. Ale sprzedajesz towar bez nazwy — do pierwszego, który zbije Cię o 2 zł. Z konta Allegro nie zrobisz exitu. Z marki — tak."*

**Rama relacji: to NIE „wspólny biznes"** (odwrotnie niż /sklep). To ich firma — budujemy aktywo i oddajemy klucze; opcjonalnie prowadzimy płatny ruch za wynik.

---

## 2. RYNEK I SEGMENTY (raport rynkowy — skrót)

Fakty kluczowe (źródła w raporcie agenta):
- ~150 tys. sprzedających (ESG 2023, PL/CZ/SK); szacunek żywych na Allegro.pl 2026: 80–110 tys.
- Prowizje 1–17% netto + 1,2% transakcyjna + abonament; 2026: rosną dopłaty Smart; min. CPC Ads w górę, od X 2025 dynamiczne CPC.
- Temu wyprzedziło Allegro w użytkownikach (01.2026: 20,3 vs 18,9 mln); 53% klientów ogląda na Allegro, kupuje taniej u Chińczyków.
- Hybryda marketplace+sklep: +30% wzrostu przychodów r/r (E-commerce w Polsce 2025); 54% sprzedawców Shoper używa też Allegro.
- Strefa Marek: wymaga znaku (UPRP ~890 zł opłat, ~6 mies.; EUIPO 850 EUR) + weryfikacja potencjału. Ogromna większość sprzedawców = no-name.

**Segmenty wg dopasowania (targetować 1+2, selektywnie 3–4, pominąć 5):**

| # | Segment | Szacunek | Wyzwalacz | Ryzyko |
|---|---|---|---|---|
| 1 | **Private label / importer OEM sprzedający jako no-name** | 10–20 tys. | „Mam produkt, nie mam marki"; odciąć podpinanie się | część ma już agencję/markę |
| 2 | **Mono-produktowy hero-SKU z dopieszczoną aukcją** | 15–25 tys. | jeden produkt niesie biznes → kanał zapasowy; idealny wsad dla fabryki | bez wyłączności moat słaby |
| 3 | Średni multi-SKU, topniejąca marża, uzależniony od Ads | 8–15 tys. | dywersyfikacja + odzyskanie klienta | mogą robić in-house; dłuższy cykl |
| 4 | Rzemieślnik / handmade / lifestyle | 5–10 tys. | emocja „chcę być marką" | niski AOV = ekonomia ruchu się nie spina |
| 5 | Dystrybutor cudzych marek | 2–5 tys. | brak (nie ma praw do marki) | strukturalny konflikt — pomijać |

---

## 3. OFERTA — DRABINKA I ROZLICZENIE (raport ofertowy — skrót)

Kotwica cenowa rynku: agencja brandingowa 5–15 tys. zł za samą identyfikację (premium 25–80 tys.). Koszt krańcowy fabryki: kilkadziesiąt–200 zł/komplet.

| Poziom | Zakres | Cena (propozycja) | Marża |
|---|---|---|---|
| **L0 — Audyt marki z aukcji (HAK)** | link aukcji → w 48 h podgląd: nazwa (rejestr unikalności + wstępny check kolizji znaku), logo, mockup landingu, kalkulator „ile oddajesz Allegro rocznie" | **0 zł** (lub 49 zł zwrotne) | koszt akwizycji |
| **L1 — MARKA** | nazwa + logo + identyfikacja + mini-brandbook + przygotowanie zgłoszenia znaku (bilet do Strefy Marek; opłaty urzędowe osobno) | **2 900 zł** | ~97% |
| **L2 — MARKA + SKLEP D2C** | L1 + sklep na niedzwiecki.ai + strony prawne + landing premium + hero-video + pakiet banerów; handoff — klient operuje | **5 900–6 900 zł** + 99 zł/mies. platformy + 5% platformy | ~96% |
| **L3 — + RUCH** | L2 + prowadzenie kampanii Meta + silnik cenowy + portal | od 6 900 zł + rev-share TYLKO od kanału prowadzonego | zależna |

**Zasady rozliczenia (kluczowe):**
- Budowa = **fixed fee**. **ZERO dodatkowego % od przychodu D2C** — platforma już bierze 5%; nasze +5% = 10% obciążenia i śmierć argumentu marżowego u człowieka, który liczy prowizje.
- Rev-share tylko od kampanii, które realnie prowadzimy (L3): np. 10–15% przychodu przypisanego do kampanii albo retainer + % budżetu.
- Znak towarowy: **kancelaria patentowa jako partner** (polecenie/rev-share) — my nie świadczymy usług prawnych; pass-through opłat + fee za asystę.
- Platforma 99 zł/mies. + 5% = „koszt infrastruktury, nie nasz"; porównanie: Allegro abonament + 1–17% od każdej sztuki i klient Allegro vs 99 zł + 5% i klient Twój.

**Top obiekcje (pełne 10 w raporcie agenta):** „sklep bez ruchu martwy" → D2C nie substytut, my robimy ruch w L3, cel roku 1 = 10–20% sprzedaży na wyższej marży + baza; „Allegro mi wystarcza" → do pierwszego, kto zbije o 2 zł; „miałem sklep, nie sprzedał" → bo był pusty template bez marki i ruchu; „AI-strony tandetne" → zobacz podgląd SWOJEGO produktu zanim zapłacisz; „czemu wasza platforma" → wliczona, zintegrowana, dane Twoje (⛔ nie wymieniać Shoper/IdoSell z nazwy — zakaz konkurencji); „zostanę z niczym" → znak, marka, baza, sklep = Twoje aktywa.

---

## 4. KANAŁY SPRZEDAŻY (raport GTM — skrót)

### Twarde zakazy (ustalone faktami)
- **⛔ Wiadomości Allegro / „Zadaj pytanie" do pitchu** = wprost złamanie regulaminu (zakaz promocji poza Allegro) → ostrzeżenie/ban.
- **⛔ Masowy cold e-mail** = ryzyko PKE art. 398 (od 11.2024 zgoda wymagana TAKŻE B2B; „zapytanie o zgodę" sporne, brak stanowiska UKE/UODO; kary do 3% przychodu/1 mln zł; precedens Bisnode 943 tys. zł za art. 14 RODO). Zły fundament dla marki osobistej.
- **⛔ Scraping Allegro** = DataDome + zakaz regulaminowy + bazy sui generis. Dane pozyskiwać punktowo/ręcznie albo przez OAuth klienta.
- **⛔ Reprodukcja zdjęć/logo z cudzej aukcji w niezamówionym „podglądzie"** = ryzyko autorskie (autor = fotograf/dostawca, nie sprzedawca!) + uznk. W trybie PUSH tylko WŁASNA wizja/mockup, bez ich materiałów.

### Ranking kanałów (skrót; pełna tabela w raporcie)
1. **PULL „podgląd marki" (17/20) — REKOMENDACJA NR 1**: landing „wklej link swojej aukcji → zobacz swoją markę" + osobna seria contentowa (nowa persona!). Klient sam wkleja link → zero PKE, zero problemu praw (dobrowolne udostępnienie), maksymalny wow, koszt krańcowy ~0, buduje markę osobistą. Każdy podgląd = udostępnialny asset.
2. **Społeczności (16/20)**: Zjednoczeni Sprzedawcy (~41 tys.+), e-commerce Polska (~22+16 tys.), Społeczność Allegro, Marketplace Club (Discord, 59,90 zł/mies.). Tylko value-first — zero spamu.
3. **Agencje Allegro (15/20)**: filtr = **abonamentowe, BEZ własnego D2C**. Kandydaci: Vinson, AdsUp, Vinseo, Widoczni, Verseo, RaiseYourSales, Sellify, REFIX, VSprint, QSell, Westom, Imagik, Pryzmat Media, Ideo Force, Eskalio, Setup.pl. ⚠️ Nethansa = upadłość (12.2025); Gonito przejęte przez iCEA = KONKURENT (mają Paid Social/D2C). Modele: white-label fabryki / prowizja polecenia ~10% (wzór SellIntegro) / hybryda.
4. **Direct mail wymiarowy (13/20)** — jedyny legalny PUSH (poza PKE; adres firmy z oferty = legalny input): karta przed/po z WŁASNĄ wizją marki + QR do spersonalizowanego podglądu; benchmark dimensional 4–8% odzewu; 15–40 zł/szt., outsourcing druku.
5. Ekosystem narzędzi (Base/BaseLinker 30 tys.+ firm, Apilo, Allegro Certified Integrator) — oferta to usługa, nie plugin; ścieżka = afiliacja/co-marketing (webinary), wolna walidacja.
6. Konferencje 2026: **Olimp Marketplace VI — 2.10.2026 Warszawa** (najcelniejsza), Targi eHandlu 23.04 i 23.10.
7. Podcasty/YT ICP: Akademia Allegro Podcast, Rozmowy na Zapleczu, BaseLinker Polska.

### Separacja person (twarda)
Sprzedawca Allegro = **trzecia persona** (obok AWE i prezesów). Osobny landing, osobny lejek (klon mechaniki /sklep), osobna seria contentowa. ⛔ Nie mieszać z lejkiem „wspólny biznes" — seller odbije się od „to nasza firma".

### Plan 30/60/90 (Plan A — PULL; szczegóły w raporcie)
- **1–30:** landing z polem „wklej link" + 4–6 odcinków „Z aukcji do marki" + wartość w grupach. Cel: 50–150 wklejeń, 10–25 rozmów, 2–5 klientów.
- **31–60:** podcasty gościnnie, case'y z podglądów, kalkulator opłacalności. Cel: 150–300 podglądów, 5–10 klientów.
- **61–90:** pętla UGC, optymalizacja konwersji. Cel: 100+ podglądów/mies. organicznie, 8–15 klientów/mies.
- Równolegle: Plan B (agencje: 30–40 kontaktów 1:1 → 2–3 pilotaże) i/lub Plan C (direct mail 150–250 szt. jako szybki test PUSH).

---

## 5. TECHNIKA — WEJŚCIE `source='allegro'` (raport techniczny — skrót)

**Werdykt: wykonalne, mały nakład, miejscami LEPSZE dane niż z Ali.**

- **Ścieżka właściwa: oficjalne Allegro REST API za zgodą sprzedawcy** — klient klika „Połącz konto Allegro", OAuth Authorization Code, scope `allegro:api:sale:offers:read` (read-only). Access 12 h / refresh 3 mies. Rejestracja aplikacji: apps.developer.allegro.pl (samoobsługowa). Scraping odpada (DataDome + regulamin).
- **Mapowanie ~85% 1:1 lub lepiej:** zdjęcia czystsze (zakaz watermarków na Allegro), **EAN/GTIN** (Ali często nie ma), opinie **natywnie PL** (zero tłumaczenia), `stock.sold` 30 dni (realna sprzedaż), parametry produktu bogatsze. Eliminuje klasę błędu „Latarek" (dane z autoryzowanej oferty = z definicji autentyczne).
- **Do zbudowania:** OAuth flow (M) + edge `bud-allegro-snapshot` mapujący do kształtu `ali_snapshot` z `source='allegro'` (M) + rozszerzenie gate F0 o zaufane źródło (S). Pipeline F0.5→F8 (kuracja, KARTA PRAWDY, makiety, landing) = **reuse bez zmian**.
- **Największa niewiadoma = ekonomia, nie technika:** silnik CENY 3.0 / kalkulacja marży zaprojektowane pod dropship Ali (koszt USD, cło, narzut). U allegrowicza cena i koszt są JEGO → w tym torze silnik cen wyłączony lub przeprojektowany (decyzja produktowa, L).
- **Otwarte pytania techniczne:** ToS API co do użycia pobranych treści poza Allegro (przeczytać przed wdrożeniem); czy rejestracja aplikacji produkcyjnej wymaga weryfikacji; zdjęcia w opiniach przez API; rozróżnienie zdjęcie własne vs katalogowe (jak nie — klauzula gwarancji praw w regulaminie usługi).

---

## 6. RYZYKA I MITYGACJE

| Ryzyko | Mitygacja |
|---|---|
| **Ekonomia ruchu D2C** (CAC 30–80 zł vs marża generyka 10–30 zł = ujemna) | bramka selekcji przed L2/L3 (marża ≥15–20%, AOV, element wyłączności); najpierw remarketing/baza, nie zimna Meta; L3 nie dla wszystkich |
| Konflikt kanałów (za wczesne przesunięcie z Allegro) | rama „druga noga"; Strefa Marek najpierw wzmacnia Allegro |
| Prawa do zdjęć aukcji (autor = fotograf/dostawca) | tryb PULL (klient udostępnia); klauzula oświadczenia praw w regulaminie usługi; w PUSH tylko własne wizje |
| Lock-in platformy (obiekcja) vs obowiązek prawny (constraint TD) | komunikacja „wliczona i zintegrowana, dane Twoje"; ZWERYFIKOWAĆ realny eksport danych z Trevio zanim to obiecamy |
| Rozmycie marki osobistej | rozważyć sub-brand operacyjny linii (Tomek = autor strategii, silnik ma nazwę) |
| Kanibalizacja /sklep i mieszanie person | twarda separacja lejków od pierwszego kliknięcia; wyższa cena (5 900–6 900 vs 4 900) |
| Klient sprzedaje czysty arbitraż Temu | uczciwa odmowa (obiekcja #9) — lepiej odmówić niż spalić case |

---

## 7. PLAN WALIDACJI (MVP bez pisania kodu)

**Faza 0 — rezonans (3–4 dni, 0 kodu):** 2 ręczne „before/after" na realnych generycznych produktach z Allegro (fabryka to umie — wejście podać ręcznie) + 5 rozmów ze sprzedawcami (grupy, sieć Tomka). GO jeśli ≥3/5 mówi „pokaż to na MOIM produkcie".

**Faza 1 — audyt z aukcji (2–3 tyg., pół-ręcznie):** darmowy „Audyt marki z aukcji" dla 10–15 sprzedawców; dane z linku wyciągane ręcznie/agentem, reszta = istniejąca fabryka. Metryki: response-rate, wow-rate, konwersja audyt→płatność, obiekcja-zabójca. **Próg GO: ≥30% chce rozmawiać o L1/L2 i ≥1–2 PŁACI w 2 tyg.**

**Dopiero po GO:** adapter OAuth+fetcher Allegro, klon lejka AI /sklep dla nowej persony, landing PULL „wklej link".

---

## 8. OTWARTE DECYZJE TOMKA

1. **Go/no-go na Fazę 0** (3–4 dni, zero kodu, zero kosztów poza czasem fabryki).
2. **Sub-brand linii czy pod marką osobistą?** (rekomendacja agenta: sub-brand operacyjny pod parasolem Tomka).
3. **Ceny drabinki** — akcept/kalibracja L1 2 900 / L2 5 900–6 900 (vs 4 900 w /sklep — świadomie wyżej, inna persona).
4. **Kancelaria patentowa jako partner** do znaków towarowych (kto, warunki polecenia).
5. **Kanał partnerski agencyjny** — czy otwierać od razu (Plan B) czy po walidacji Fazy 1.
6. **Weryfikacja eksportu danych klientów z Trevio** (zanim obiecamy „dane Twoje" w obiekcji o lock-in) + zgłoszenie Adrianowi.
7. **Przeczytać ToS Allegro REST API** pod kątem użycia treści poza Allegro (przed budową adaptera).

---

## Źródła kluczowe (wybór; komplet URL-i w raportach agentów w transkrypcie sesji 22.07.2026)

- Sprzedawcy/skala: media.allegro.pl (153 tys. Q2 2024), raporty ESG Allegro, ecdb.com (GMV 2025).
- Bóle: sky-shop.pl / sellify.pl (prowizje 2025), cashless.pl (dopłaty Smart 2026), semtop.pl (CPC Ads), money.pl / wiadomoscihandlowe.pl (Temu vs Allegro), rp.pl 22.05.2025 (percepcja chińskich ofert), idosell.com (brak danych klienta).
- Strefa Marek/znak: allegro.pl regulamin Strefy Marek, rpms.pl, znakitowarowe-blog.pl, uprp.gov.pl, patentbox.pl.
- Prawo outreachu: prawo.pl / kirp.pl / outreachpilot.pl (PKE art. 398), uodo.gov.pl (Bisnode), allegro.pl/pomoc (zakaz promocji poza Allegro).
- GTM: business.allegro.pl (Ads Partner), grupa-icea.pl (przejęcie Gonito), muir.pl (upadłość Nethansy), sellintegro.pl (wzór prowizji), base.com / apilo.com (programy partnerskie), konferencja.vsprint.pl (Olimp Marketplace 2.10.2026), belkins.io / mailpro.org (benchmarki outreach/direct mail).
- API: developer.allegro.pl (OAuth, scope, oferty, rating), scrapfly.io (DataDome).
