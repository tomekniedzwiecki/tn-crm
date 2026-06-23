# Zipack — Design Manifesto & Brief

> Plecak podróżny z systemem kompresji próżniowej. Marka „dostępne premium" (349 zł) między tanią masówką z Allegro a Diwajs/Airback (589–1300 zł). Persona: Maciej „Smart-Traveler" 32 l. — analityczny tech-minimalista, lata Ryanair/Wizz Air, nienawidzi irracjonalnych opłat bagażowych.

## 1. Kierunek manifesta

- [x] **Field Manual (dark override)** — strona czyta się jak karta techniczna sprzętu: numeracja sekcji (1.1, 2.1), figury produktu „FIG. N" z narożnikami, tabliczka znamionowa, kratka miernicza. Odwrócona na ciemny motyw (obsidian) zgodnie z brandingiem klienta.
- [ ] Panoramic Calm — odrzucony: sygnaturowy „dashboard mockup hero" bez sensu dla fizycznego plecaka bez aplikacji
- [ ] Clinical Kitchen — odrzucony: styl AGD domowego (intimate), plecak jest public (lotnisko/status)

**Nazwa kierunku własna:** „Engineered Carry" — sprzęt opisany jak wyposażenie inżynieryjne, nie lifestyle. Mood: kontrola, precyzja, spryt. Tempo: rytmiczne (gęste sekcje techniczne przeplatane oddechem).

**Dlaczego ten kierunek (Product DNA → Style Pick, deterministyczny):**
- Product DNA: `utility · precision · evidence · solo · moderate · future · public`
- Match 6/7 remis: Panoramic Calm (quiet≠moderate), Clinical Kitchen (intimate≠public), **Field Manual (present≠future)**
- LRU: 2 ostatnie landingi = clinical-warmth, apothecary-label — żaden kandydat nie powtarza się, brak blokady
- Tie-break + argumentacja 9a.3: Clinical Kitchen niemożliwy do obronienia dla plecaka (styl AGD domowego, intimate). Field Manual wygrywa: plecak spec-first to **dosłownie** jego kategoria 2.5 („Plecaki/torby techniczne spec-first"), refs GoRuck / 5.11 Tactical = kategoria bagażu, match na energii (moderate=moderate), public ✓. Estetyka instruktażowo-techniczna = dokładnie to, co przekonuje analitycznego Macieja (twarde dane, monospace, „rysunki inżynierskie").
- Paletę i fonty Field Manual (khaki/Saira/Barlow) **nadpisuję brandingiem Zipack** (obsidian + signal orange + Space Grotesk/Inter/JetBrains Mono) — branding > Atlas (Krok 4.4 + reguła rollout v5.0). Prymitywy stylu (FIG, MIL, plate, kratka, narożniki) są paleta-agnostyczne i zostają nienaruszone.

## 2. Moodboard — 3 realne marki referencyjne (spoza landing-pages/)

1. **GoRuck** → copy „built to spec": parametr MIL-SPEC jako argument sprzedażowy, sygnałowy pomarańcz na utility tle. Pożyczam: spec jako bohater, nie jako apendyks.
2. **Teenage Engineering** → industrial-tech w czerni/grafit z jednym ostrym akcentem; etykiety monospace jak na tabliczce urządzenia. Pożyczam: tabliczka znamionowa (data plate) z parametrami w JetBrains Mono.
3. **Leica** → makro detalu mechanizmu na neutralnym tle z technicznym podpisem; precyzja jako estetyka. Pożyczam: zawór/zamek jako „FIG." z podpisem skali, nie marketingowe zbliżenie.

Zabronione referencje: inne landingi z `landing-pages/`, Midjourney gallery, Dribbble, generyczne „modern minimalist".

## 3. Paleta (z workflow_branding type=color)

Dominant 60%: **Obsidian** `#0E0F12` — matowe ciemne tło strony („karta techniczna"), tytanowy tekst na nim
Secondary 30%: **Graphite** `#2A2D33` — sekcje, ramki FIG, karty, tabliczki; **Titanium** `#E7E8EA` jako kolor tekstu/figur
Accent 10%: **Signal Orange** `#FF5A1F` — CTA, numery MIL (1.1), etykiety FIG, kluczowe liczby (TYLKO te 3 miejsca)
Wsparcie: **Ember** `#FF8A3D` (hover/gradient CTA), **Voltage Blue** `#2F6BFF` (drugorzędny akcent — linki/diagram sizer)

Filozofia: ciemny duotone obsydian/grafit + 1 sygnałowy pomarańcz. Zero camo/moro, zero gradientów w tłach (wyjątek: kratka miernicza repeating-linear-gradient).

## 4. Typografia (z workflow_branding type=font + safety #10)

- Display: **Space Grotesk** 500/700 — geometryczny grotesk, nagłówki UPPERCASE jak tytuły rozdziałów manuala; poprawne PL diakrytyki (safety #7 ✅)
- Body: **Inter** 400/500/600/700 — neutralny, czytelny w 15–17px; PL ✅ (branding override „zakazu Inter" — klient zaakceptował font)
- Mono / Accent: **JetBrains Mono** 400/700 — numeracja MIL, etykiety FIG, tabliczka znamionowa, dane spec

Google Fonts BEZ `&subset=latin-ext` (safety #10). Max 3 rodziny ✅.

## 5. Persona główna (z report_pdf — Awatar Główny)

**Maciej „Smart-Traveler", 32 lata.** Ekspert IT / digital marketing / sektor finansowy. Warszawa, Kraków, Wrocław lub Trójmiasto. Lata 4–6×/rok: delegacje 2–3 dni + przedłużone weekendy z partnerką, budżetowo (Ryanair / Wizz Air). Zarabia dobrze, ale **z zasady odmawia irracjonalnych opłat** — gadżet za 300 zł sprawia mu przyjemność, 150 zł za wirtualną walizkę w aplikacji to absurd.

- **Proces decyzyjny:** analityczny — weryfikuje funkcjonalność, potem kupuje. Śledzi social, ale decyzję podejmuje na danych.
- **Estetyka:** tech-minimalizm, matowe wykończenia, czerń/grafit, solidne metalowe okucia. Unika krzykliwych kolorów i taniego plastiku.
- **Główna obiekcja:** strach przed awarią mechanizmu — „co jeśli zawór się popsuje, a zamek pęknie, gdy pakuję się w drodze powrotnej z Hiszpanii?". Przekaz MUSI mieć twarde dane: 900D nylon, IP65, potrójne szwy, dowód wytrzymałości.
- **Persona poboczna (viral):** Karolina „Aesthetic Explorer" 27 l. — before/after pakowania, TikTok. Obsługiwana sekcją kompresji (before/after), nie głównym tonem.

## 6. Anty-referencje (co JUŻ JEST w landing-pages/, czego NIE powtarzam)

- **Panoramic Calm / vitrix** — NIE używam Plus Jakarta + Instrument Serif + paper/navy/teal ani „dashboard mockup hero". Zipack ma własne fonty (Space Grotesk/Inter/JetBrains Mono), własną paletę (obsidian/signal-orange) i NIE ma aplikacji/dashboardu — hero to packshot jako FIG, nie ekran.
- **Editorial/Luxury / paromia** — NIE Fraunces + Italiana + gold; brak oversized italic numerałów, brak magazine `Nº`. Tu rejestr techniczny (mono MIL), nie editorialny.
- **Rugged Heritage / kafina** — choć też „męski/techniczny", NIE powielam Archivo + stamp badges + heritage nostalgia. Field Manual = present-day utility bez stempli i nostalgii.
- Świeżość: Field Manual nieużyty w żadnym dotychczasowym landingu (anty-konwergencja), więc zero rodzeństwa.

## 7. Test anty-generic (4 odpowiedzi TAK)

- [x] **Unikalność** — manifesto NIE pasuje do 5 innych produktów: figury FIG + tabliczka znamionowa + numeracja MIL w obsydianie są zbudowane wokół spec plecaka (900D/IP65/42%/sizer 40×20×25), nie „dowolnego premium".
- [x] **Ryzyko** — TAK: ciemny motyw „karty technicznej" zamiast bezpiecznego jasnego lifestyle; condensed UPPERCASE nagłówki z numeracją MIL to mocny, nieoczywisty wybór dla plecaka travel.
- [x] **Portfolio** — TAK: pokazałbym to jako case „spec-sheet aesthetic dla travel-gear", odróżnia od typowych dropship-landingów.
- [x] **Konflikt z brandem** — sprawdzony: paleta i fonty manifesta = dokładnie `workflow_branding` (obsidian/orange + Space Grotesk/Inter/JetBrains). Tone-of-voice raportu („ekspercki, sprytny, NIE krzykliwy, budować autorytet") = rytm techniczny. Branding ma priorytet i jest zachowany 1:1.

## 8. Signature element

**Tabliczka znamionowa + figura FIG.** Każda kluczowa cecha produktu prezentowana jak na karcie sprzętu: packshot/detal w ramce z pogrubionymi narożnikami i podpisem mono `FIG. 0N — …`, a pod hero pas-tabliczka `900D NYLON · ZAMEK IP65 · KŁÓDKA TSA · DO −42% OBJĘTOŚCI`. Klient zapamięta „ten landing z plecakiem opisanym jak sprzęt wojskowy/inżynieryjny w czerni z pomarańczowym markerem".

### Mapowanie manifesto → decyzje (ETAP 4)

| Decyzja | Wartość |
|---|---|
| Hero background | Obsidian `#0E0F12` + kratka miernicza (fm-grid-bg) subtelna |
| Hero headline font | Space Grotesk 700 UPPERCASE, `<em>` w Signal Orange |
| Signature element HTML | `.fm-fig` (figura+narożniki+FIG.N) + `.fm-plate` (tabliczka znamionowa) |
| Dark section rytm | Cała strona dark; akcenty grafit dla kart, obsidian dla tła |
| Animacja hero | subtle — fade-in + js-counter na „−42%" (Field Manual motion budget) |
| Border-radius globalny | 0 (kanciaste, inżynieryjne) — wyjątek: brak |
| Shadow styl | minimalny; głębia przez ramki 1px grafit + narożniki orange, nie cienie |
| Divider między sekcjami | hairline grafit + numer MIL sekcji (1.1 / 2.1) jako rytm |

## 9. Warianty sekcji (autonomicznie wybrane — z section-variants.md, ograniczone Style Lock Field Manual)

- **Hero:** H1 Split klasyczny — copy lewo (mechanizm + obietnica + −42%) + packshot prawo jako `fm-fig` „FIG. 01"; jedyny wariant z packshotem zgodny z solution-aware (mechanizm + dowód) i Field Manual allowed [H1,H5,H7].
- **Features:** F3 Linear stack — 4–5 cech technicznych (kompresja / IP65 / 900D / TSA / organizacja) z dłuższymi opisami, każda jako `fm-fig` + parametr (FIG. 02+). Field Manual default; pasuje do „complex tech".
- **Testimonials:** T2 Before/After stats — before/after kompresji (sterta ubrań → zassany plecak, −42%), liczby z terenu; Field Manual allowed [T2,T6], obsługuje viral angle Karoliny + evidence Macieja.
- Problem: P3 Koszt bezczynności (rachunek za opłaty bagażowe). How: W3 spec-strip 4 kroki kompresji. Comparison: tabela porównawcza vs KATEGORIA w `fm-corners` (wartości opisowe, NIE gołe ✓/✗ — zgodnie z 02-generate). Offer: O1 single box w `fm-corners` + `fm-plate`.

## 10. STYLE LOCK

- **Style ID:** `field-manual` (dark override — branding > Atlas)

Tokeny FAKTYCZNE landingu (branding Zipack nadpisuje paletę/fonty khaki Field Manual; prymitywy stylu zachowane):

lock-font-display: Space Grotesk
lock-font-body: Inter
lock-font-mono: JetBrains Mono
lock-hex: #0E0F12
lock-hex: #2A2D33
lock-hex: #E7E8EA
lock-hex: #FF5A1F
lock-hex: #2F6BFF

### 10.3 MUSZĄ być użyte
- Display **Space Grotesk** (nagłówki UPPERCASE z numeracją MIL), Body **Inter**, Mono **JetBrains Mono** (FIG / plate / MIL)
- Paleta: obsidian `#0E0F12` jako dominanta, `#FF5A1F` na CTA i numerach MIL/FIG, `#E7E8EA` jako tekst/figury
- Primitive `.fm-fig` — min 3 figury produktu z narożnikami i podpisem `FIG. 0N` (FIG. 01–03+)
- Numeracja MIL `.fm-mil` w nagłówkach sekcji (1.1, 2.1, 3.1…) w mono + signal orange
- Kratka miernicza `repeating-linear-gradient` (`.fm-grid-bg`) w min 2 sekcjach (hero + jedna)
- Tabliczka znamionowa `.fm-plate` (key-value mono) jako pas zaufania zamiast okrągłych ikon
- Offer box w ramce `.fm-corners` (narożniki) + `.fm-plate` z parametrami zestawu

### 10.4 NIE WOLNO użyć
- Fonty: NIE Saira/Barlow/Overpass (zastąpione brandingiem), NIE Fraunces/Cormorant/Playfair (editorial), NIE Archivo Black (poster), NIE Italiana (bug Ł)
- Layout: NIE bento 2×2 (`grid-template-columns: 1fr 1fr` dla features), NIE 12-col modular grid, NIE okrągłe ikony w kółkach, NIE stamp badges, NIE oversized italic `Nº` numerał
- Motion: NIE `.js-split`, NIE `.magnetic`, NIE `.js-tilt`, NIE `.js-parallax` (motion budget subtle = wyłącznie `.fade-in` + `.js-counter`)
- Kolory/tło: NIE camo/moro, NIE `linear-gradient` w tłach sekcji (wyjątek: `repeating-linear-gradient` kratki), NIE jasny `#FFFFFF` jako tło sekcji (wyjątek: header solid biały — safety #9)
- Copy: NIE militarny LARP („misja", „arsenał", „bojowy", „taktyczny"), NIE purple prose, NIE AI-poetic; ZERO zakazanych fraz (24h, magazyn PL, COD/za pobraniem, raty/PayPo/Klarna/Twisto)

### 10.5 Uzasadnienie override
verify-style-lock dla Field Manual oczekuje khaki/Saira/Barlow — to koliduje z zaakceptowanym brandingiem klienta (obsidian + Space Grotesk/Inter/JetBrains). Zgodnie z regułą rollout v5.0 i Krok 4.4 (branding > Atlas) tokeny lock-* powyżej deklarują FAKTYCZNĄ paletę/fonty landingu. Prymitywy konwersyjne stylu (FIG, MIL, plate, kratka, narożniki) pozostają nienaruszone — to one niosą charakter Field Manual, nie konkretny hex/font.

## 11. Wow Moments (audyt finalny w ETAP 4)

### Wow Moment 1
- **Strefa:** hero zone
- **Lokalizacja:** sekcja 1.1 — Hero
- **Element:** schemat „sizer" — packshot plecaka wpisany w ramkę wymiarową 40 × 20 × 25 cm z liniami odniesienia i podpisami mono, jak rysunek techniczny zgodności z limitem Ryanair
- **Czemu unique:** żaden baseline nie rysuje produktu jako schematu wymiarowego; brand-specific (limit bramki), nie „ładny packshot"
- pattern-id: custom-sizer-diagram
- selector: .sizer-frame
- **Implementation status:** ⚠️ planowany (ETAP 2/4)

### Wow Moment 2
- **Strefa:** mid zone
- **Lokalizacja:** sekcja 8 — Testimonials/Before-After
- **Element:** dwustan kompresji — figura „przed" (pękaty plecak / sterta ubrań) → „po" (zassany, twardy) z licznikiem `−42%` i pasem objętości
- **Czemu unique:** to jest visual hook produktu (raport), zrealizowany jako para FIG z animowaną liczbą, nie zdjęcie obok zdjęcia
- pattern-id: custom-compression-reveal
- selector: .ba-compression
- **Implementation status:** ⚠️ planowany

### Wow Moment 3
- **Strefa:** conversion zone
- **Lokalizacja:** sekcja 5 — Problem (Koszt bezczynności) / wzmocnienie przy Offer
- **Element:** „rachunek bramki" — wizualna oś kosztu: 1 lot z karą = 200–250 zł vs plecak 349 zł → zwrot po 2. locie, w stylu paragonu/tabliczki mono
- **Czemu unique:** przekłada najmocniejszy argument racjonalizujący (raport) na konkretny wizualny rachunek, nie generyczny „oszczędzasz"
- pattern-id: custom-savings-ledger
- selector: .savings-ledger
- **Implementation status:** ⚠️ planowany

## 12. Mapa obiekcji

- Boję się, że zawór puści, a zamek pęknie w połowie podróży → sekcja: Features (FIG zamek/zawór) → rozbrojenie: 900D nylon + zamek IP65 + zawór z silikonową klapką, kompresja trzyma 48–72 h
- 349 zł to dużo za plecak, na Allegro są za 80 zł → sekcja: Comparison → rozbrojenie: tamte to worki bez próżni; jedna kara za nadbagaż (200–250 zł) i plecak już się zwrócił
- Czy naprawdę zmieści się w wymiarach bramki Ryanair/Wizz Air → sekcja: Hero (schemat sizer) → rozbrojenie: zaprojektowany pod 40×20×25 cm i 40×30×20 cm, wsuwa się do sizera za pierwszym razem
- Nie chcę uszkodzić plecaka zbyt mocną kompresją → sekcja: How It Works → rozbrojenie: 4 kroki + dołączona pompka pokazują bezpieczny zakres podciśnienia, bez przeciążania zamka
- Czy to nie kolejny chiński bubel z dropshippingu → sekcja: Offer / Founder note → rozbrojenie: marka, instrukcja, gwarancja i 30 dni na zwrot bez pytań — nie szara folia z marketu
- Wolę za pobraniem, bo nie ufam przedpłacie → sekcja: Offer (trust strip) → rozbrojenie: BLIK / karta / przelew z 30-dniowym zwrotem bez pytań zdejmuje ryzyko z przedpłaty

## 13. Big Idea + VOC + Liczby kanoniczne

big-idea: Inwestujesz raz w plecak, który odsysa powietrze i kurczy bagaż — i już nigdy nie płacisz frycowego za walizkę kabinową, bo wszystko mieści się w darmowym limicie.
mechanism: Jednokierunkowy zawór z silikonową klapką + hermetyczna komora TPU (nylon 900D, zamek IP65) odsysają powietrze spomiędzy ubrań i blokują objętość na 48–72 h — w przeciwieństwie do worków roll-compression, które puszczają powietrze w kilka godzin.
awareness: solution-aware — klient zna ból (opłaty bagażowe) i typ rozwiązania (plecak kabinowy), ale nie zna mechanizmu próżniowego; hero = mechanizm + dowód liczbowy + obietnica mieszczenia się w limicie.

**Język klienta (VOC):** BRAK DANYCH — produkt w fazie wprowadzenia, brak `workflow_reviews`; `source_url` AliExpress bez fetchu opinii w AUTO-RUN (twardy fallback Krok 1.6). Copy oparte na pain/benefit z raportu strategicznego (sekcja 2: strach przed karą, upokorzenie przy bramce, spryt „ogrania" linii).
- pain: stres przepakowywania bagażu na oczach kolejki przy sizerze; bilet za 80 zł kończy się na 400 zł przez walizkę
- benefit: lecisz z wolnymi rękami, wszystko spakowane, bez dopłaty; „ogrywasz" linię i masz kontrolę

**Liczby kanoniczne** (każda z weryfikowalnym źródłem):

| wartość | jednostka / kontekst | źródło |
|---|---|---|
| −42% | redukcja objętości bagażu | report_pdf str.1–2 + brand_info |
| 900D | gęstość nylonu (wytrzymałość) | report_pdf str.5,8 |
| IP65 | klasa szczelności zamka | report_pdf str.1 |
| 48–72 | godziny utrzymania kompresji | report_pdf str.1 |
| 40×20×25 | cm — limit bramki Ryanair | report_pdf str.2 |
| 200–250 | zł — kara za nadbagaż Ryanair | report_pdf str.4 |
| 349 | zł — cena marki | brand_info + report_pdf str.3 |
| 30 | dni na zwrot | oferta (zwrot ustawowy/gwarancja) |
| 4,7 | /5 — ocena (poglądowa, faza wprowadzenia) | placeholder + przypis do stopki |
| 399 | zł — cena regularna (poziom Wings Compresa) | report_pdf str.3 |
| 50 | zł — oszczędność wprowadzająca (399→349) | wyliczenie z 399 i 349 |
| 150 | zł — dopłata za walizkę kabinową | report_pdf str.4 |
| 59–120 | zł — tani worek „zgodny z Ryanair" z Allegro | report_pdf str.2,4 |
