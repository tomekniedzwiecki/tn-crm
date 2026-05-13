# Design Brief — Hydrium

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [x] Nowy: **Clinical Precision** (Style Atlas: `clinical-kitchen`)

**Uzasadnienie wyboru** (1-2 zdania z auditu produktu):
Hydrium = przenośny generator wody wodorowej (3500 PPB, membrana SPE/PEM platynowana, szkło borokrzemowe) — produkt sprzedaje DANE, nie historię: biohackerzy kupują liczby, certyfikaty, mitochondrialne mechanizmy. Layout dashboard + KPI grid + comparison charts jest jedynym pasującym mood'em.

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

1. **Whoop / Oura Ring** — biometric dashboard hero, KPI grid z liczbami jako design element (PPB, mV, sekundy), spec callouty z linii prowadzących na product shot.
2. **Withings (waga Body Smart / app)** — clinical trust + warm undertone w neutralnej palecie, comparison bar charts pokazujące „przed/po", liczby tabular-nums w roli typografii.
3. **DJI Mavic product page** — feature cards z exploded view, dashboard mockup zintegrowany z hero, spec readouty w monospace pod packshot.

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent):** #00B8D4 (Hydrogen Cyan — KPI fill, charts, brand hit)
- **Ink (główny tekst):** #0A0F1C (Deep Obsidian — premium scientific authority)
- **Paper (tło):** #F7FAFC (Lab White — sekcje dashboardów)
- **Accent / Mint reset:** #00E5A0 (Mint reset — używany TYLKO w: aktywne stany counterów po wpisaniu w viewport, dot przy „LIVE" w stripe, hover na CTA secondary)
- **Support 1 (chart grid):** #B8BFC9 (Platinum Steel — gridlines, divider)
- **Support 2 (slate body):** #4A5568 (subskrypcje, captions)

## 4. Typografia (z workflow_branding type=font)

- **Display (nagłówki):** Space Grotesk 500/600/700 — geometryczny technical sans, perfekcyjny do liczb specyfikacji
- **Body (treść):** Inter 400/500/600/700 — neutralny czytelny sans
- **Mono / Caption:** JetBrains Mono 400/700 — spec readouts, KPI eyebrows, data labels w uppercase

> Wszystkie 3 fonty mają polskie znaki ✅. Pominięte `&subset=latin-ext` zgodnie z safety.md #10.
> Max 3 rodziny fontów.

## 5. Persona główna (z brand_info + ai_prompts, brak raportu czytelnego)

- **Wiek / zawód / status:** 32-45 lat, „Ambitny Więzień Etatu" z aspiracjami biohackerskimi, programista/menedżer/przedsiębiorca early-stage, dochód 8-25k netto/mies., singiel lub para bez dzieci/z małymi dziećmi.
- **Kluczowy pain point:** niska energia poranna mimo „zdrowego stylu" (sen, suplementy, gym) — wie że espresso to plaster, magnez to placebo, ale szuka dźwigni biologicznej która działa na poziomie komórki, nie subiektywnego samopoczucia.
- **Kluczowa motywacja zakupu:** chce *mierzyć* a nie *wierzyć* — kupuje liczby (3500 PPB, mV ORP), nie obietnice „lepszego życia". Longevity protokoły Hubermana/Bryan Johnsona to jego baza.
- **Cytat brzmiący jak wypowiedź persony** (do testimonials): „Po 5 latach na Athletic Greens, Whoop i 12 suplementach przestałem wierzyć w marketing. Tu są mV w aplikacji i puste oksydanty po 3 minutach. To mówi samo za siebie."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

> Procedura wymaga ZAWSZE budowania od zera (MODE=forge).

- **Już istnieje:** `vitrix` — Panoramic Calm (utility·precision·evidence·future·public). Też tech premium, ALE: Plus Jakarta + Instrument Serif + paper/navy/teal + architectural wide hero z lifestyle photo.
- **Już istnieje:** `h2vital` — Organic/Natural (woda, wellness). Też kategoria nawodnienia, ALE: rounded sans + greens/beiges + organic shapes + softer wellness tone.
- **Czego unikam:**
  - NIE kopiuję Plus Jakarta/Instrument Serif z vitrixa — Space Grotesk + Inter + JetBrains Mono (brand_info).
  - NIE używam architectural wide lifestyle photo hero z vitrix — moje hero = KPI dashboard split z packshot.
  - NIE używam organic/green wellness tone z h2vital — Hydrium jest CLINICAL i LAB, nie SPA.
  - NIE używam editorial Nº eyebrow ani italic em w h1 (forbidden Clinical Kitchen).
  - NIE używam warm cream tła (#F6F3ED) ani gold accent (#C9A961) — forbidden w Style Lock.

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? — Whoop/Oura (wearables), Withings (consumer health), DJI (consumer drones). Wszystkie B2C ale poza klasycznym DTC e-com.
- [x] Czy odwracając logo nadal zgaduję branżę? — KPI dashboard z PPB/mV + JetBrains Mono = oczywista tech-zdrowotna kategoria.
- [x] Czy persona NIE pasowałaby do innego baseline'u z tabeli? — biohacker z mV i certyfikatami nie pasuje do paromia (luxury), h2vital (spa), pupilnik (zabawa), vibestrike (gaming) ani kafina (workwear). Tylko Clinical Kitchen.
- [x] Czy manifest w 5 linijkach da się zacytować bez słów „premium", „luxury", „wysoka jakość"? — Tak. Używam: zmierzone, certyfikowane, 3500 PPB, mitochondrialne, reset.

## 8. Signature element

> Jeden charakterystyczny element wizualny, który zostanie po obejrzeniu landinga.

**Twój signature element:**
**KPI Dashboard Grid pod hero headline** — 4 karty z monumentalnymi liczbami `3500 PPB · 1450 mV · 180 s · 99.9%`, każda animowana counterem od 0, w `font-variant-numeric: tabular-nums`, z mono eyebrow „MOLEKULARNY WODÓR / ORP NEGATYWNY / CZAS RESETU / CZYSTOŚĆ MEMBRAN". Drugi signature: **CAD-style exploded callouts na packshot** (membrana SPE/PEM, elektroda platynowa, szkło borokrzemowe, sensor TDS) — linie prowadzące jak rysunek techniczny Apple/Dyson product page.

## 9. Warianty sekcji (z section-variants.md, LIMITED przez allowed_variants w Style Lock)

- **Hero:** H3 Dashboard mockup — PERFECT match (Clinical Kitchen primitive 1)
- **Features:** F4 Cards z mockupami / piktogramami — ideał (Clinical Kitchen forbids tekstowe bento)
- **Testimonials:** T2 Before/After stats — evidence-based (Clinical Kitchen forbids voice grid jako primary)

---

## 10. STYLE LOCK — wybrany styl z Atlas (OBOWIĄZKOWE od v4.0)

### 10.1 Wybrany styl
- **Style ID:** `clinical-kitchen`
- **Plik:** [`docs/landing/style-atlas/clinical-kitchen.md`](../../docs/landing/style-atlas/clinical-kitchen.md)

### 10.2 Product DNA (z Kroku 9a.1)
- Utility↔Ritual: **ritual** (3-min reset jak mikro-rytuał, kotwice: matcha ceremony / Aesop hand wash — daje *doświadczenie* spokoju mitochondrialnego, nie tylko nawodnienia)
- Precision↔Expression: **precision** (3500 PPB, SPE/PEM, kotwice: Swiss watch / sous-vide cooker)
- Evidence↔Feeling: **evidence** (mitochondria nie kłamią, kotwice: Anker mAh specs / Dyson „99% pick up")
- Solo↔Community: **solo** (osobisty reset, kotwice: meditation app / skincare serum)
- Quiet↔Loud: **moderate** (premium scientific tone, kotwice: Dyson / Whoop — mówi, nie szepcze, nie krzyczy)
- Tradition↔Future: **future** (kotwice: DJI / AirPods Max / Linear)
- Intimate↔Public: **intimate** (osobisty pomiar, kotwice: skincare routine / sleep tracker)

Match z wybranym stylem: **6/7**. Argumentacja: jedyna różnica to ritual vs utility (Hydrium ma 3-min rytuał, ale w Atlas tylko Clinical Kitchen kombinuje precision+evidence+future+intimate dla solo biohackera — pozostałe top-3 mają niższy match: Apothecary Label 4/7 (quiet+present zamiast moderate+future), Panoramic Calm 5/7 (public zamiast intimate).

### 10.3 MUSZĄ być użyte (auto-paste z pliku stylu)
- Font display: `Space Grotesk` (override IBM Plex Sans → brand_info priority) — w font-family
- Font body: `Inter` (override IBM Plex Sans → brand_info priority)
- Font mono: `JetBrains Mono` (override IBM Plex Mono → brand_info priority)
- Paleta (min 3 z 5): `#00B8D4`, `#0A0F1C`, `#F7FAFC` (+ `#B8BFC9`, `#00E5A0`)
- Layout DNA: **Dashboard** — grid kart/tiles z KPI, charts, comparisons. Hero = split z dashboard mockup
- Signature primitive #1: `.kpi-grid` z 4 KPI cards w hero (3500 PPB / 1450 mV / 180 s / 99.9%)
- Signature primitive #2: `.chart-compare` (Hydrium vs. zwykła woda vs. suplementy)
- Section architecture min: 11 sekcji

### 10.4 NIE WOLNO użyć (auto-paste)
- **Fonty:** NIE `Fraunces`, `Cormorant`, `Playfair`, `Italiana`, `Archivo Black`, `Caveat`
- **Layout:** NIE editorial-column, NIE Nº eyebrow, NIE full-bleed color sekcji (Poster style)
- **Elementy:** NIE warm cream tło, NIE gold accent, NIE script handwriting, NIE italic em w h1/h2
- **Kolory:** NIE `#F6F3ED`, NIE `#E09A3C`, NIE `#C9A961`
- **Motion:** NIE `.js-parallax`, NIE `.js-split`, NIE `.magnetic`

### 10.5 Section Architecture (z pliku stylu sekcja 8)
Required (min 11):
1. Header (solid #FFFFFF)
2. Mobile Menu
3. Hero Dashboard (`.hero-dashboard` + `.kpi-grid`)
4. Instrument Panel (trust strip jako KPI panel)
5. Problem z liczbami (KPI of pain — koszt rocznie kawa+magnez+adaptogeny)
6. Features Cards (grid z piktogramami / CAD callouts)
7. How It Works (3 steps z mockups)
8. Comparison Bar Charts (`.chart-compare`)
9. Testimonials z KPI (Before/After stats)
10. FAQ
11. Offer (spec-dense)
12. Final CTA
13. Footer

Optional: Sticky CTA (włączone — to performance landing).

Forbidden: Editorial eyebrow Nº, Warm cream sections, Script/handwriting accent.

### 10.6 Motion Budget (z pliku stylu sekcja 10)
```yaml
js_effects_required:
  - .fade-in
  - .js-counter           # min 3 (KPI cards w hero + trust panel)
js_effects_forbidden:
  - .js-split
  - .js-parallax
  - .magnetic
js_effects_count:
  counter_min: 3
  counter_max: 10
  tilt_min: 2             # OK na cards feature
```

### 10.7 Copy Voice (z Atlas sekcji 11)
- Register: technical + calm, evidence-based, cite-able
- Sentence length: medium (12-18 słów)
- Person: 2-osoba + bezosobowy mix (przy specyfikacjach)
- Allowed power words: „zmierzone", „testowane", „certyfikowane", „verified", „badanie X", „mV ORP", „PPB"
- Forbidden: „premium", „luxury", „rewolucyjne", „innowacyjne"
