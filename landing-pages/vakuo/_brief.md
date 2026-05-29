# Design Brief — VAKUO

<!-- Workflow 94eea5d0-7911-4079-926a-bad66586d697 · Waldemar Magner · plecak podróżny z funkcją próżniową -->
<!-- Produkt: czarny plecak kompresyjny 900D + elektryczna pompka VakuPump USB-C. Cena pakietu 349 zł (reg. 599 zł). -->

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [x] Nowy (opisz poniżej): **Flight Deck Instrument** — plecak czytany jak panel pokładowy. Matowy, inżynieryjny sprzęt na chłodnym lab-white, dane w IBM Plex Mono, turkusowe akcenty na liczbach, pomarańcz wyłącznie na „liczbie wroga" (280 zł kary za bagaż). Sygnaturą jest lotniskowy sizer (rama 45×36×20 cm), przez którą plecak przechodzi bez dopłaty.

**Uzasadnienie wyboru** (1-2 zdania z auditu produktu): Główna persona (Kamil, cyfrowy nomada IT) kupuje „na chłodnej kalkulacji użyteczności" — analizuje 900D, mAh, wymiary easyJet — więc landing musi mówić językiem liczb i specyfikacji, nie emocji. Styl Clinical Kitchen (dashboard + spec + comparison charts + IBM Plex) jest dokładnym nośnikiem tej psychologii, a metafora kokpitu/sizera zamienia suche dane w jeden zapamiętywalny obraz.

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

> Marki z prawdziwego świata, NIE inne landingi z `landing-pages/`. Każda referuje konkretny element wizualny lub tonalny.

1. **Teenage Engineering** — estetyka panelu instrumentu: monospace mikro-etykiety nad każdą wartością, ponumerowane bloki-„moduły", zasada „każdy odczyt ma jednostkę". Pożyczam: mono spec-labels + instrument-cluster KPI grid w hero.
2. **Braun / Dieter Rams (industrial design)** — funkcjonalizm: matowy czarny produkt na neutralnym chłodnym tle, jeden akcent koloru, zero ornamentu, „form follows function". Pożyczam: packshot na lab-white + jeden turkusowy akcent + brak dekoracji.
3. **Linear (software)** — chłodna siatka, ostra hierarchia typografii, subtelne gradienty tylko w rogach kart (nie pełne tła), pewna powściągliwość. Pożyczam: 12-col cool grid + radialny gradient teal/navy w narożniku, nie na całej sekcji.

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent):** #00C2CB  (teal — litera V, podświetlenia danych, CTA accent)
- **Ink (główny tekst):** #0B2A45  (deep navy — tekst, liczby, sekcje ciemne)
- **Paper (tło):** #F4F6F8  (cool lab white — tła sekcji jasnych)
- **Accent / alarm (opcjonalny):** #FF8A1F  (orange — TYLKO liczba kary 280 zł + alerty urgency)
- Slate (tekst drugorzędny): #5A6472 · Near-black (najgłębsza ciemna / produkt): #0E1116

## 4. Typografia (z workflow_branding type=font — placeholdery heading/body/accent, dobrane wg Style Lock Clinical Kitchen)

- **Display (nagłówki):** IBM Plex Sans 500/600/700 — neutralny techniczny sans
- **Body (treść):** IBM Plex Sans 400/500 — ten sam rodzaj, czytelny
- **Mono / Caption:** IBM Plex Mono 400/500 — liczby specyfikacji, readouty, eyebrow labels

> ⚠️ IBM Plex Sans + Mono mają pełne polskie diakrytyki (Ł/Ś/Ż OK w UPPERCASE). Google Fonts URL BEZ `&subset=latin-ext`. Max 3 rodziny (1 rodzina Plex w 2 krojach).

## 5. Persona główna (z report_pdf)

- **Wiek / zawód / status:** Kamil, mężczyzna 25–36 lat, duże miasto, IT / marketing / freelancer, dochód > 7 000 PLN netto. Tryb „workation" — łączy pracę z podróżą.
- **Kluczowy pain point** (co najbardziej frustruje): dopłata 280 zł przy bramce za bagaż, który „nie wszedł" w sizer; ryzyko uszkodzenia laptopa 16"; strata czasu w kolejkach do nadania i odbioru bagażu.
- **Kluczowa motywacja zakupu** (czego oczekuje od produktu): spakować ubrania na 10 dni + laptopa + ładowarki do jednej kabinówki, przejść przez sizer bez dopłaty, podróżować na własnych warunkach. Kupuje na chłodnej kalkulacji (900D, USB-C, pojemność, ROI).
- **Cytat brzmiący jak wypowiedź persony** (do testimonials): „Lecę średnio dwa razy w miesiącu. Odkąd wszystko mieści mi się pod fotelem — laptop, ładowarki i ubrania na tydzień — ani razu nie zapłaciłem 280 zł kary za bagaż. Plecak zwrócił się po pierwszym locie."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

- **Już istnieje:** `vitrix` — Panoramic Calm (Plus Jakarta + Instrument Serif, paper/navy/teal, panoramic wide hero). Kierunek tech-premium użyty 2× w ostatnich 5 landingach (lensora, inne).
- **Czego unikam (signature elements istniejącego):** NIE kopiuję Plus Jakarta + Instrument Serif italic eyebrow ani panoramicznego lifestyle-hero vitrixa. Vakuo idzie w stronę instrument-panel / spec-sheet (IBM Plex Sans + Mono, KPI dashboard, comparison bar charts), nie architektonicznej panoramy. Inny font, inny layout DNA (dashboard zamiast panorama), inna sygnatura (rama sizera zamiast Instrument Serif jewelry).

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? (Teenage Engineering, Braun/Rams, Linear — marki design/industrial/software, nie sklepy ani landingi)
- [x] Czy odwracając logo nadal zgaduję branżę? (sizer 45×36×20, boarding pass, „dopłata 280 zł", KPI lotnicze — od razu wiadomo: smart travel / bagaż lotniczy)
- [x] Czy persona NIE pasowałaby do innego baseline'u z tabeli? (Kamil cyfrowy-nomada-analityk jest unikalny — nie eko-mama, nie premium-luxury, nie dziecko/pet)
- [x] Czy manifest w 5 linijkach da się zacytować bez słów „premium", „luxury", „wysoka jakość"? (TAK — operuje liczbami i metaforą kokpitu/sizera, nie przymiotnikami)

## 8. Signature element

> Jeden charakterystyczny element wizualny, który zostanie po obejrzeniu landinga.

**Twój signature element:** **Rama lotniskowego sizera (45 × 36 × 20 cm)** renderowana jako turkusowo-granatowy outline z monospace wymiarami w rogach — w hero plecak Vakuo przechodzi przez nią ze stemplem `PASS / 0 zł`, a w sekcjach dividery echo­ją kształt ramy. Wspólnie z **kokpitowym klastrem KPI** (IBM Plex Mono: `50 L`, `90 sek`, `0 zł`, `1,4 kg`) buduje czytelność „panelu pokładowego".

## 9. Warianty sekcji (LIMITED przez allowed_variants w Style Lock clinical-kitchen)

- **Hero:** H3 Dashboard mockup — split hero: po lewej headline + kokpitowy klaster KPI (instrument cluster), po prawej lifestyle/packshot z ramą sizera. Idealny dla evidence-persony Kamila (allowed: H3, H4, H1 → H3 top-1).
- **Features:** F4 Cards z mockupami — karty cech ze zdjęciami (wodoodporność 900D, zamki YKK + kieszeń RFID, elektryczna pompka USB-C, przedział na laptop 17,3"). (allowed: F4, F1 → F4 top-1).
- **Testimonials:** T2 Before/After stats — evidence-based zestawienie „Przed: 280 zł/lot, pognieciony chaos / Po: 0 zł, porządek pod fotelem" + cytaty z liczbami. (allowed: T2, T1 → T2 top-1).

---

## 10. STYLE LOCK — wybrany styl z Atlas (OBOWIĄZKOWE od v4.0)

### 10.1 Wybrany styl
- **Style ID:** `clinical-kitchen`
- **Plik:** [`docs/landing/style-atlas/clinical-kitchen.md`](../../docs/landing/style-atlas/clinical-kitchen.md)

### 10.2 Product DNA (z Kroku 9a.1)
- Utility↔Ritual: **utility** (plecak wykonuje pracę — kompresja, omijanie dopłat; kotwice: Anker PowerCore, Dyson V15)
- Precision↔Expression: **precision** (900D, 1600 mAh IATA, wymiary 45×36×20, ROI 280 zł; kotwice: Swiss watch, powerbank mAh)
- Evidence↔Feeling: **evidence** (Kamil kupuje na chłodnej kalkulacji; kotwice: Anker 20000 mAh, Apple M3 benchmarks)
- Solo↔Community: **solo** (one-bag travel, indywidualny podróżnik; kotwice: notebook, meditation app)
- Quiet↔Loud: **moderate** (pewny siebie + lekka ironia wobec linii, orange urgency, NIE infantylny)
- Tradition↔Future: **future** (USB-C, próżnia, RFID; kotwice: DJI drone, Tesla/Linear)
- Intimate↔Public: **public** (lotnisko, podróż, TikTok, manifest buntu; kotwice: streetwear, Yeti cooler)

Match z wybranym stylem: **6/7** (różni się tylko intimate vs public). Argumentacja (1 zdanie): Clinical Kitchen jako jedyny łączy `utility·precision·evidence·solo·moderate·future` z aparatem KPI-dashboard + spec-table + comparison bar charts + IBM Plex, czyli dokładnym nośnikiem number-driven psychologii Kamila; różnicę `public` domykam publicznymi lifestyle'ami z lotniska/podróży w hero i breathing momentach.

### 10.3 MUSZĄ być użyte (auto-paste z pliku stylu)
- Font display: `IBM Plex Sans` w font-family
- Font mono: `IBM Plex Mono` (liczby specyfikacji, readouty)
- Min 1 `.kpi-grid` lub `.dashboard` (primitive 1 — hero instrument cluster)
- Min 1 `.chart-compare` / `.chart-bar` (primitive 2 — poziome bar charts w comparison)
- Tło sekcji: chłodne lab-white `#F4F6F8` / `#FFFFFF` dla min 4 sekcji
- Min 8 unikalnych specs (liczba + unit) w całym landingu
- Min 3 `.js-counter` (KPI cards)

### 10.4 NIE WOLNO użyć (auto-paste)
- **Fonty:** NIE `Fraunces`, `Cormorant`, `Playfair`, `Italiana`, `Archivo Black`, `Caveat`
- **Layout:** NIE editorial-column, NIE `Nº` eyebrow, NIE full-bleed color sekcji (Poster style)
- **Elementy:** NIE warm cream tło, NIE gold accent, NIE script/handwriting, NIE italic `em` w h1/h2 (em = normal-style)
- **Kolory:** NIE `#F6F3ED`, NIE `#E09A3C`, NIE `#C9A961` (ciepłe kremy/złoto)
- **Motion:** NIE `.js-parallax`, NIE `.js-split`, NIE `.magnetic`

### 10.5 Section Architecture (z pliku stylu sekcja 8)
Required (min 11): Header · Mobile Menu · Hero Dashboard (`.kpi-grid`) · Instrument Panel (`.trust-panel` KPI zamiast trust-bar ikon) · Problem (z liczbami) · Features Cards (F4) · How It Works (3 steps) · Comparison Bar Charts (`.chart-compare`) · Testimonials z KPI (T2) · FAQ · Offer (spec-dense) · Final CTA · Footer · Sticky CTA
Forbidden: Editorial eyebrow `Nº` · Warm cream sections · Script/handwriting accent

### 10.6 Motion Budget (z pliku stylu sekcja 10)
```yaml
js_effects_required: [.fade-in, .js-counter]   # counter_min 3
js_effects_forbidden: [.js-split, .js-parallax, .magnetic]
js_effects_count: { counter_min: 3, counter_max: 10, tilt_min: 2 }
```

---

## 11. Wow Moments (audyt z ETAP 4)

### Wow Moment 1
- **Strefa:** hero zone
- **Lokalizacja:** sekcja Hero
- **Element:** Rama lotniskowego sizera `45 × 36 × 20 CM` (turkusowo-granatowy outline z mono-wymiarami w narożnikach), przez którą skompresowany plecak przechodzi ze stemplem `PASS · 0 ZŁ` — obok kokpitowy klaster KPI (`50 L` / `90 SEK` / `0 ZŁ`) z animacją counter.
- **Czemu unique:** żaden landing tech/AGD nie używa fizycznej ramy sizera jako bohatera kompozycji; to wizualizacja głównego lęku persony (Sizer Anxiety) zamiast generycznego packshotu na białym.
- **Implementation status:** ✅ obecny w HTML (`.sizer-frame` + `.kpi-grid`)

### Wow Moment 2
- **Strefa:** mid zone
- **Lokalizacja:** sekcja Comparison / „Matematyka bramki"
- **Element:** Poziome bar charts (`.chart-compare`) pokazujące koszt po przeciwnej stronie — `280 ZŁ × lot` (orange) vs `0 ZŁ` (teal) — plus licznik oszczędności narastający przy scrollu.
- **Czemu unique:** porównanie jako wykres finansowy (nie checkmark-tabela), gra na „Smart Traveler Triumph"; orange użyty wyłącznie tu jako „liczba wroga".
- **Implementation status:** ✅ obecny w HTML (`.chart-compare`)

### Wow Moment 3
- **Strefa:** conversion zone
- **Lokalizacja:** sekcja Offer
- **Element:** Offer box jako „taca instrumentu" — zdjęcie unboxingu (pudełko + plecak + pompka + kabel) + kolumna `SPECYFIKACJA` w IBM Plex Mono obok kolumny „Co dostajesz", animowany border-beam teal→navy.
- **Czemu unique:** oferta czytana jak karta katalogowa sprzętu (mono spec column), nie zwykła karta produktu; spina narrację „inżynierii" z momentem zakupu.
- **Implementation status:** ✅ obecny w HTML (`.offer-box` + `.offer-spec`)
