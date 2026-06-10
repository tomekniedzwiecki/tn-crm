# Design Brief — OKOFON

<!-- Inteligentne okulary AI (XG89): okulary przeciwsłoneczne + open-ear audio + tłumacz AI 144 języki. -->
<!-- Workflow: 28a402ca-b162-40ec-87d1-75faaabf5d62 · Klient: Piotr Pakulski -->

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [x] Nowy: **Instrument Index** — karta katalogowa precyzyjnego instrumentu optyczno-akustycznego na ciemnym tle (Specification Sheet w wariancie dark, brandowy neon jako jedyny marker wartości).

**Uzasadnienie wyboru** (1-2 zdania z auditu produktu): Produkt to gęsto-specyfikacyjna elektronika ubieralna kupowana przez early-adoptera, który porównuje parametry (144 języki, 38 g, UV400, do 6 h). Raport strategiczny wprost rekomenduje „chłodny, minimalistyczny design cyfrowy: głęboka czerń, grafity, czysta biel, przełamane pojedynczym wibrującym neonowym błękitem" — to dosłownie dark Specification Sheet, gdzie neon #00C2FF pełni rolę technicznego markera wymiaru.

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

1. **Teenage Engineering** — mono etykiety wartości (JetBrains Mono), numeracja dokumentowa sekcji (`2.0`), podpisy `RYS.`, produkt prezentowany jak karta katalogowa instrumentu, nie jak gadżet DTC.
2. **Leica** — głęboka czerń korpusu z JEDNYM akcentem (czerwona kropka → u nas neonowa kropka/linia wymiarowa); precyzja optyczna jako wartość premium odbierana wzrokiem.
3. **Bang & Olufsen** — powściągliwy, akustyczny minimalizm: dużo pustej, ciemnej przestrzeni, dźwięk komunikowany formą, nie krzykiem (parallela open-ear audio).

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent / neon):** #00C2FF (Neon Pulse — marker wartości, linie wymiarowe, CTA)
- **Ink (główny tekst / jasny na ciemnym):** #F4F7FA (Mist White)
- **Paper (tło — ciemne):** #0B0F14 (Carbon — głęboka czerń tła strony)
- **Surface (panele/karty):** #11161D / hairline #232A33 (Slate elevated)
- **Secondary (rzadki drugi akcent):** #7B61FF (Violet — tylko hover/gradient detal CTA, 1-2 miejsca)
- **Meta (jednostki, podpisy):** #6E7886 (slate z #3D4654 brandu)

> Branding > Atlas: paleta BRANDU klienta (dark + neon) zastępuje jasną „Steel Paper" Specification Sheet. Legalizacja przez `lock-*` w sekcji 10.4. Filozofia koloru zachowana: zimny monochrome + dokładnie jeden akcent wskazujący wartość.

## 4. Typografia (z workflow_branding type=font)

- **Display (nagłówki):** Space Grotesk (500/700) — techniczny grotesk z siatki konstrukcyjnej
- **Body (treść):** Inter (400/500/600)
- **Mono / Caption:** JetBrains Mono (400/600) — WSZYSTKIE wartości liczbowe, jednostki, numery sekcji, podpisy RYS.

> Wszystkie 3 mają pełny latin-ext (Ł Ś Ć Ż Ó renderują się poprawnie w UPPERCASE). Link Google Fonts BEZ `&subset=latin-ext`. Max 3 rodziny.

## 5. Persona główna (z report_pdf)

- **Wiek / zawód / status:** Marcin, 40 — właściciel średniej firmy / manager wysokiego szczebla, early-adopter, wysoka siła nabywcza, dużo podróżuje (biznes + egzotyka).
- **Kluczowy pain point:** niepewność językowa w negocjacjach i za granicą + tracenie czasu na plątaninę kabli/„pchełek" przy przesiadkach na lotniskach; nienawidzi czuć się bezradnie.
- **Kluczowa motywacja zakupu:** dyskretny, niezawodny tłumacz AI prosto do ucha + jedno urządzenie zamiast trzech; nowoczesny wizerunek i swoboda komunikacji.
- **Cytat persony (do testimonials):** „Założyłem je do marynarki we Frankfurcie i na plażę w Tajlandii — w obu miejscach po prostu rozumiałem ludzi, bez wpatrywania się w telefon."

**Persony poboczne (z raportu — do sekcji „Dla kogo" / testimonials):**
- Karolina, 35 — bieganie/rower szosowy; pain: „pchełki" wypadają od potu, ANC odcina od ruchu drogowego (boi się wypadku). Motywacja: open-ear + pełny nasłuch ulicy + UV400 + IPX4.
- Krzysztof, 50 — przedstawiciel handlowy, auto = biuro 6-10 h; pain: jednouszna słuchawka = asymetryczne zmęczenie i ból chrząstki, słońce kłóci się ze słuchawką. Motywacja: redukcja oślepiających odblasków + zestaw głośnomówiący z podwójnym mikrofonem.

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

- **Już istnieje:** `landing-pages/vibestrike/` — Retro-Futuristic (neon-on-black gaming). To NIE Okofon: vibestrike krzyczy glitchem i RGB, używa backdrop-filter w headerze i loud motion. Okofon = chłodna, powściągliwa karta katalogowa instrumentu — neon jest CHIRURGICZNYM markerem wartości (jedna linia wymiarowa, jeden licznik), nie tłem dyskotekowym.
- **Już istnieje (dark precedent):** `landing-pages/kafina/` — Rugged Heritage dark hero. Czego unikam: stamp-badge / workwear / Archivo. Okofon ma własną sygnaturę: linie wymiarowe RYS. + numer dokumentu DOK./REV, zero heritage.
- **Już istnieje (oculia/editorial):** żaden dark-tech — brak kolizji kierunku.

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? (Teenage Engineering / Leica / Bang & Olufsen — ikony designu sprzętu, nie landingi)
- [x] Czy odwracając logo nadal zgaduję branżę? (linie wymiarowe + spec-rows + neon marker = precyzyjny instrument optyczno-akustyczny)
- [x] Czy persona NIE pasowałaby do innego baseline'u? (globalny profesjonalista-podróżnik nie pasuje do wellness/playful/heritage)
- [x] Czy manifest da się zacytować bez „premium/luxury/wysoka jakość"? (TAK — „karta katalogowa instrumentu na czerni z jednym neonowym markerem wymiaru")

## 8. Signature element

**Linia wymiarowa neonowa (dim-line) jak na rysunku technicznym** — pod packshotem hero biegnie cienka neonowa linia ze strzałkami na końcach i etykietą mono „< 40 g" / „144 jęz.", a każda sekcja ma numer dokumentu w rogu (`DOK. OKF-XG89 · REV 1.0`). Klient zapamiętuje, że ogląda techniczną kartę instrumentu, nie zwykły sklep.

## 9. Warianty sekcji (z section-variants.md, LIMITED przez allowed_variants w Style Lock)

- **Hero:** H1 Split klasyczny (`hero-v-split`) — claim + packshot z neonową linią wymiarową pod spodem (jedyny evidence-friendly hero z dim-line; H7/H8 też legalne, ale H1 daje miejsce na mechanizm + dowód dla solution-aware).
- **Features:** F3 Linear stack (`feat-v-linear` + `feat-spec-list`) — 4 dłuższe bloki funkcji czytają się jak kolejne punkty dokumentu (bento ZAKAZANE w spec-sheet).
- **Testimonials:** T6 Ściana atestów + cytat (`testi-v-certs`) — UV400 / CE / RoHS / IPX4 jako pasek atestów + 1 mocny cytat persony z avatarem (evidence > lifestyle dla karty katalogowej).
- **Problem:** P1 Stat-led (`prob-v-stat`) — jedna brutalna konsekwencja (odcięcie od dźwięków ulicy).
- **How:** W3 Numerowany spec-strip (`how-v-spec`).
- **Comparison:** C1 Tabela cech (`comp-v-table`) — bez ✓/✗ ikon, opisowe komórki.
- **Offer:** O1 Single offer box (`offer-v-single`).

---

## 10. STYLE LOCK — wybrany styl z Atlas (OBOWIĄZKOWE od v4.0)

### 10.1 Wybrany styl
- **Style ID:** `specification-sheet`
- **Plik:** docs/landing/style-atlas/specification-sheet.md

lock-font-display: Space Grotesk
lock-font-body: Inter
lock-font-mono: JetBrains Mono
lock-hex: #0B0F14
lock-hex: #00C2FF
lock-hex: #F4F7FA
lock-hex: #11161D
lock-hex: #7B61FF

### 10.2 Product DNA (z Kroku 9a.1)
- Utility↔Ritual: **utility** (wykonuje pracę: tłumaczy, gra muzykę, chroni wzrok — kotwice: Anker PowerCore, AirPods)
- Precision↔Expression: **precision** (wartość = dokładność: 144 jęz./98%, 38 g, UV400 — kotwice: Swiss watch, power bank mAh)
- Evidence↔Feeling: **evidence** (early-adopter kupuje dowód spec — kotwice: Anker 20000 mAh, Apple M3 benchmarks)
- Solo↔Community: **solo** (osobiste urządzenie noszone w podróży/biegu — kotwice: sleep tracker, skincare)
- Quiet↔Loud: **quiet** (raport: chłodny minimalizm; neon to JEDEN powściągliwy marker, nie loud — kotwice: Muji, Aesop apothecary)
- Tradition↔Future: **future** (AI, wearable, awangarda — kotwice: DJI drone, AirPods Max, Linear)
- Intimate↔Public: **intimate** (noszone na twarzy, osobista komunikacja do ucha — kotwice: sleep tracker, face cream)

Match z `specification-sheet` (utility·precision·evidence·solo·quiet·future·intimate): **7/7**. Argumentacja: idealne dopasowanie wszystkich 7 osi; Teenage Engineering/Bosch/Keychron to dokładnie pozycjonowanie „karta katalogowa instrumentu" jakiego potrzebuje produkt walczący z Ray-Ban Meta na parametrach.

### 10.3 MUSZĄ być użyte (auto-paste z pliku stylu)
- Font display: `Space Grotesk` w font-family
- Font mono: `JetBrains Mono` — wszystkie wartości liczbowe
- Min 8 × `.sheet-row` (primitive #1)
- Min 1 × `.dim-line` (wymiarowanie CSS — primitive #2)
- Tło strony: `#0B0F14` (Carbon — brand dark, zastępuje Steel Paper przez lock-hex)
- Hairlines `1px solid` (NIE ramki 2px)
- Doc-head strip (`.sheet-doc-head`) zamiast trust-bar dark z ikonami w kółkach

### 10.4 NIE WOLNO użyć (auto-paste)
- **Fonty:** NIE IBM Plex Sans/Mono, NIE Fraunces, Cormorant, Playfair, Archivo Black, Caveat, Fredoka; NIE Helvetica jako display
- **Layout:** NIE bento 2×2 (`grid-template-columns: 1fr 1fr` dla features), NIE `repeat(12` grid showcase
- **Kolory:** NIE `#0A0A0F` (dark retro-futuristic literał — używamy brandowego `#0B0F14`); NIE warm cream/papier (#F6F3ED/#FAFAF7), NIE gold/amber (#C9A961/#E09A3C), NIE gradienty w tłach sekcji (poza chirurgicznym neon-glow w hero)
- **Elementy:** NIE `Nº` w eyebrow, NIE `.hero-numeral`, NIE ramki 2px solid, NIE KPI cards/charts
- **Motion:** NIE `.js-split`, `.js-parallax`, `.magnetic`, `.js-tilt`

### 10.5 Section Architecture (z pliku stylu sekcja 8)
Required (min 10): Header, Mobile Menu, Hero (split+dim-line), Doc Head Strip, Spec Sheet (≥8 sheet-row), Figure z wymiarowaniem, Features (F3 spec-strip), How It Works (W3), Comparison (C1), FAQ, Offer, Footer
Forbidden: Trust Bar dark (ikony w kółkach), Social Proof Marquee, UGC wall

### 10.6 Motion Budget (z pliku stylu sekcja 10)
```yaml
js_effects_required: [.fade-in, .js-counter]   # counter_min: 1
js_effects_forbidden: [.js-split, .js-parallax, .magnetic, .js-tilt]
js_effects_count: { counter_min: 1, counter_max: 4, magnetic_min: 0, tilt_min: 0, parallax_min: 0 }
```

## 11. Wow Moments (ETAP 4 — 3 explicit)

1. **Hero dim-line** — pod packshotem neonowa linia wymiarowa ze strzałkami i etykietą mono „38 g", animowana js-counterem przy wejściu w viewport. Lokalizacja: hero. Unikalność: nikt w kategorii nie wymiaruje okularów jak rysunek techniczny.
- selector: .dim-line
2. **Doc-head strip per sekcja** — pasek `DOK. OKF-XG89 · REV 1.0 · 2026-06` jak stopka rysunku; buduje wrażenie karty instrumentu.
- selector: .doc-head
3. **Spec sheet z neonowymi wartościami** — tabela parametrów z kropkowanymi leaderami i wartościami mono w neonie (144 / 38 g / UV400), licznik animuje kluczową liczbę.
- selector: .sheet-spec

## 12. Mapa obiekcji (v5.0, OBOWIĄZKOWA)

- Czy open-ear słychać dla otoczenia i czy gra na zewnątrz → sekcja: Solution/Features → rozbrojenie: podwójne głośniki kierunkowe prowadzą dźwięk do ucha, otoczenie prawie nic nie słyszy, a Ty zachowujesz pełny nasłuch ulicy.
- Tłumaczenie AI pewnie kuleje i wymaga gapienia się w ekran → sekcja: How It Works → rozbrojenie: mowa leci przetłumaczona prosto do ucha, patrzysz rozmówcy w oczy zamiast w telefon.
- [produkt-specyficzna] Po co przepłacać, skoro audio-okulary są na Allegro od 99 zł → sekcja: Comparison → rozbrojenie: generyki nie mają tłumacza AI ani certyfikowanego filtra UV400; premium daje to samo za 749-2199 zł.
- Bateria pewnie pada po godzinie → sekcja: Spec Sheet → rozbrojenie: do 6 godzin ciągłej pracy i pełne ładowanie w ok. 60 minut przez USB-C.
- A jak nie usiądą dobrze na mojej głowie → sekcja: Offer → rozbrojenie: 30 dni na zwrot bez pytań, jeśli oprawka nie pasuje.

## 13. Big Idea + VOC + Liczby kanoniczne (v5.0, OBOWIĄZKOWE)

### 13.1 Big Idea
big-idea: Trzy urządzenia — okulary przeciwsłoneczne, słuchawki i tłumacz AI — w jednej oprawce lżejszej niż 40 g: masz wolne ręce, otwarte uszy i rozumiesz każdy język.
mechanism: podwójne głośniki kierunkowe open-ear + tłumaczenie AI prosto do ucha (144 języki) w oprawce < 40 g z certyfikowanym filtrem UV400 (EN ISO 12312-1)
awareness: solution-aware (klient zna kategorię audio-okularów/aplikacji tłumaczących, nie zna TEGO urządzenia → hero = mechanizm + dowód spec)

### 13.2 Język klienta — VOC (Krok 1.6)
<!-- Źródło: AliExpress searchEvaluation item 1005012127359458 (20 opinii, tłumaczone z EN). Marketplace = brak realnego pain; wypełniam benefit + obiekcje. -->
- benefit: „lekkie, w ogóle nie uciskają grzbietu nosa"
- benefit: „komfortowe nawet przy długim noszeniu"
- benefit: „szybko reagują na komendy głosowe"
- benefit: „soczewki o wysokiej ostrości, bardzo wyraźne"
- benefit: „można nosić jak przeciwsłoneczne i słuchać muzyki"
- benefit: „bateria starcza na długo"
- benefit: „prosta obsługa, funkcje praktyczne"
- obiekcja: „czy dźwięk jest dobry na zewnątrz" (recenzenci obalają — gra dobrze open-ear)

### 13.3 Liczby kanoniczne
| wartość | jednostka | źródło |
|---------|-----------|--------|
| 144 | języki (tłumacz AI) | brand_info + report_pdf (110-144, 98% dokładności) |
| 38 | g (waga od) | report_pdf („od niespełna 38 gramów") |
| 6 | godzin (czas pracy do) | report_pdf (4-6 h ciągłej pracy) |
| 60 | min (pełne ładowanie ok.) | report_pdf (~60 min USB-C) |
| UV400 | filtr (norma) | report_pdf (UV400, EN ISO 12312-1) |
| IPX4 | wodoodporność | report_pdf (IPX4/IPX5 deszcz/pot) |
| 249 | zł (cena wprowadzająca) | report_pdf (rekomendowana cena detaliczna 249 zł) |
| 349 | zł (cena katalogowa, anchor) | mechanika promocji wprowadzającej |
| 100 | zł (oszczędność) | 349 − 249 |
| 30 | dni (zwrot) | oferta / standard sklepu |
| 29 | % (rabat wprowadzający) | 100/349 ≈ 29% |
| 4,7 | /5 rating | pasmo 4,6-4,8 + disclaimer „dane poglądowe / faza wprowadzenia" w stopce |
| 99 | zł (dolny pułap generyków) | report_pdf (Allegro/gadżety 99-445 zł) |
| 259 | zł (górny pułap generyków, tabela) | report_pdf (segment alternatywny) |
| 1449 | zł (premium dolny, tabela) | report_pdf (Meta Ray-Ban Wayfarer) |
| 2199 | zł (premium górny, tabela) | report_pdf (Meta Ray-Ban Wayfarer) |
