# Design Brief — Hovira

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [x] Nowy (opisz poniżej): **Quiet Hours** — smart home tech z dashboardem KPI, ale ciepły accent peach/handwriting sugeruje wieczór i rytuał (nie zimny lab).

**Uzasadnienie wyboru** (1-2 zdania z auditu produktu):
Robot z LiDAR i 5000 Pa to evidence-driven precision tech, ale tagline „Twój dom oddycha czystością" + opis o wieczornej bajce wskazują że klient nie kupuje gadgetu, tylko odzyskany wieczór. Dashboard layout (Clinical Kitchen) komunikuje powagę liczby, peach accent + ręczny napis Caveat dodaje ten 1 sygnał ciepła którego brakuje konkurentom (Roborock, Xiaomi).

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

> Marki z prawdziwego świata, NIE inne landingi z `landing-pages/`. Każda referuje konkretny element wizualny lub tonalny.

1. **Withings (Body Smart waga)** — dashboard hero z liczbami jako design element (waga, BMI, body composition); duże tabular-nums w karcie KPI to dokładnie to czego potrzebujemy dla 5000 Pa / 180 min / 60 dni.
2. **DJI (Mavic 3 product page)** — split hero packshot + dashboard data, callouty CAD na produkcie (LiDAR sensor wskazany linią), spec rows jako tabela `font-variant-numeric: tabular-nums`.
3. **Aesop (sklep online)** — chłodna powaga + jedno ciepłe miejsce na stronie (np. cytat klienta w handwriting). Pożyczamy „jeden moment ciepła w technicznym layoucie".

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent aktywny):** #4A90E2 (Sky Active — CTA, chart fills, headline em)
- **Ink (główny tekst):** #0F1B2D (Instrument Navy — h1, body, KPI strong)
- **Paper (tło dominant):** #FAFBFC (Lab White — sekcje, KPI cards)
- **Accent / Warmth (peach, RZADKO):** #FF9F7A (Evening Glow — 3 miejsca max: hero badge, quote pull, final CTA glow)
- **Support 1:** #C7DCE5 (Mist — chart grid, border KPI cards)
- **Support 2:** #94A6B6 (Gray Mute — captions, mono labels)

## 4. Typografia (z workflow_branding type=font)

- **Display (nagłówki):** Plus Jakarta Sans 600/700 + `&display=swap&subset=latin-ext`
- **Body (treść):** Inter 400/500 + `&display=swap&subset=latin-ext`
- **Mono (KPI labels, mono accent):** IBM Plex Mono 400/500 + `&display=swap`
- **Fallback (Style Lock IBM):** IBM Plex Sans 500/600 (jako fallback w font-family stack)

> ⚠️ Brand fonts (Plus Jakarta + Inter) na pierwszym miejscu, IBM Plex Sans/Mono jako Style Lock fallback. Caveat wycofany na rzecz mono peach (uppercase tracking) — Clinical Kitchen zakazuje handwritingu i brand override nie powinien naruszać hard constraint.
> Polskie „Ł" UPPERCASE: Plus Jakarta, Inter i IBM Plex są PL-safe.

## 5. Persona główna (z report_pdf + brand opisu)

- **Wiek / zawód / status:** 32-42 lat, profesjonalista po pracy biurowej / zdalnej, mieszkanie 60-90 m² w mieście (Kraków/Warszawa/Wrocław), partner + dziecko 3-8 lat + często pies.
- **Kluczowy pain point:** Po pracy nie chce zaczynać „drugiej zmiany" od mopa i odkurzacza. Sierść psa na dywanie, piasek z butów dziecka pod stopami, czas wieczorny ucieka na obowiązki domowe.
- **Kluczowa motywacja zakupu:** Odzyskać 180 minut wieczoru. Robot ma pracować w tle gdy oni czytają bajkę / oglądają serial / leżą z książką. Premium spec (LiDAR, 5000 Pa, autoczyszcząca stacja) ma uzasadniać że robot nie zawiedzie.
- **Cytat brzmiący jak wypowiedź persony:** „Wracam z pracy, zdejmuję buty i nie chcę już niczego sprzątać. Hovira sprząta zanim zdążę otworzyć książkę dziecku."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

- **Już istnieje:** vitrix — Panoramic Calm dla smart home tech (myjka okien), Plus Jakarta Sans + Instrument Serif + paper/navy/teal, editorial column z italic Nº eyebrow.
- **Czego unikam (signature elements Vitrix):**
  - NIE editorial column layout — Hovira robi **dashboard grid** (KPI cards, chart bars)
  - NIE paper hero z italic Instrument Serif eyebrow — Hovira ma **navy hero** z KPI grid
  - NIE teal accent (#5BA8A8) — Hovira używa **sky #4A90E2** + ciepły peach #FF9F7A
  - NIE Nº eyebrow numerals — Hovira ma **mono labels** (`SPEC // 01`)
  - NIE Italiana / Instrument Serif italic — Hovira ma **Caveat handwriting** w 2-3 miejscach

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? (Withings = health tech / dashboard refs, DJI = tech product page, Aesop = chłodna powaga z 1 ciepłym akcentem — żadna nie jest „polski sklep z robotami sprzątającymi")
- [x] Czy odwracając logo nadal zgaduję branżę? (dashboard z 5000 Pa / 180 min + ręczny napis „...a Ty czytasz" jednoznacznie sugeruje smart home + intymny moment)
- [x] Czy persona NIE pasowałaby do innego baseline'u? (rodzic-profesjonalista z dzieckiem + smart home — nie pasuje do Organic/h2vital, Editorial/paromia, Playful/pupilnik)
- [x] Czy manifest w 5 linijkach da się zacytować bez słów „premium", „luxury", „wysoka jakość"? (TAK — wszystko liczbami i emocją wieczoru)

## 8. Signature element

> Dashboard hero z 4 KPI cards w `font-variant-numeric: tabular-nums` (5000 Pa | 180 min | 60 dni | 99% mapy), nad którym ręcznie wpisane Caveat **„a Ty masz wieczór"** — to JEDEN moment ciepła w technicznym layoucie. Powtarza się drugi raz pod final CTA jako podpis.

Drugi element wzmacniający: **CAD-style packshot** w sekcji Features — robot z liniowymi callout-ami wskazującymi LiDAR / stację dock / czujnik upadku, jak rysunek techniczny DJI.

## 9. Warianty sekcji (z section-variants.md, LIMITED przez allowed_variants w Style Lock)

- **Hero:** H3 Dashboard Mockup — KPI grid + packshot (PERFECT match dla Clinical Kitchen)
- **Features:** F4 Cards z mockupami CAD callouts
- **Testimonials:** T2 Before/After stats (data-driven — godziny odzyskane w tygodniu)

---

## 10. STYLE LOCK — wybrany styl z Atlas (OBOWIĄZKOWE od v4.0)

> Ta sekcja jest **kontraktem** — łamiesz ją = FAIL w `verify-style-lock.sh`.

### 10.1 Wybrany styl
- **Style ID:** `clinical-kitchen`
- **Plik:** [`docs/landing/style-atlas/clinical-kitchen.md`](../../docs/landing/style-atlas/clinical-kitchen.md)
- **Override:** fonty z brand zamiast IBM Plex (Plus Jakarta Sans + Inter + Caveat), branding ma priorytet per `01-direction.md` Krok 4.4.

### 10.2 Product DNA (z Kroku 9a.1)
- Utility↔Ritual: **dual** (robot pracuje + daje wieczór; Dyson V15 + Aesop wash)
- Precision↔Expression: **precision** (5000Pa, LiDAR; Dyson, Apple M3)
- Evidence↔Feeling: **blend** (liczby uzasadniają emocję; La Mer + Dyson)
- Solo↔Community: **solo** (sprzątanie w domu; Steamla, skincare)
- Quiet↔Loud: **quiet** (tagline „oddycha czystością"; Muji, Aesop)
- Tradition↔Future: **future** (LiDAR, smart home; DJI, Linear)
- Intimate↔Public: **intimate** (wieczór z dzieckiem; Steamla, sleep tracker)

Match z Clinical Kitchen: 5/7 (różnice: dual vs utility, blend vs evidence, quiet vs moderate). Argumentacja: Clinical Kitchen jest jedynym stylem w Atlas który ma `future + intimate + precision` jednocześnie — drugi top (Apothecary) ma `present`, trzeci (Japandi) ma `tradition + feeling`. Hovira to smart home tech z 2026, nie apothecary.

### 10.3 MUSZĄ być użyte (auto-paste z pliku stylu + brand override)
- Font display: **Plus Jakarta Sans** (BRAND OVERRIDE, w font-family)
- Font body: **Inter** (BRAND OVERRIDE)
- Font accent: **Caveat** (max 3 miejsca: hero podpis, final CTA podpis, jeden testimonial pull)
- Paleta (min 3 z 6): `#0F1B2D` (Ink), `#4A90E2` (Sky CTA), `#FAFBFC` (Paper), `#FF9F7A` (Peach 3× max), `#C7DCE5` (Mist grid), `#94A6B6` (Gray Mute)
- Layout DNA: **Dashboard** — grid kart/tiles z KPI, charts, comparisons
- Signature primitive #1 (KPI Dashboard Hero) obecny — w hero section
- Signature primitive #2 (Comparison bar charts) obecny — w sekcji „Sprzątanie tradycyjne vs Hovira"
- Signature primitive #3 (CAD packshot z callouts) obecny — w sekcji Features
- Min 8 unique specs (liczba + unit): 5000 Pa, 180 min, 60 dni, 99% mapy LiDAR, 2400 mAh, 3 cm próg, 5 trybów, 4,5 h ładowanie, 0,3 mm kurz, 60 dB
- Min 3 `.js-counter` (KPI cards w hero + spec dense w offer)
- Section architecture min: 11 sekcji
- Tło sekcji: `#FAFBFC` lub `#FFFFFF` dla min 4 sekcji

### 10.4 NIE WOLNO użyć
- **Fonty:** NIE `Fraunces`, `Cormorant`, `Playfair`, `Italiana`, `Archivo Black`, `Instrument Serif` (Vitrix lock), `IBM Plex Sans/Mono` (przeniesione na Plus Jakarta przez brand override)
- **Layout:** NIE editorial-column, NIE Nº eyebrow, NIE full-bleed color sekcji (Poster style), NIE italic em w h1/h2
- **Elementy:** NIE warm cream tło (#F6F3ED), NIE gold accent (#C9A961), NIE script-w-body
- **Kolory:** NIE `#5BA8A8` (Vitrix teal), NIE `#E09A3C` gold, NIE pure `#FFFFFF` w hero
- **Motion:** NIE `.js-parallax`, NIE `.js-split`, NIE `.magnetic`. TAK `.fade-in`, `.js-counter`, `.js-tilt` na cards.

### 10.5 Section Architecture (z pliku stylu sekcja 8)
Required (min 11):
- Header (solid #FFFFFF)
- Mobile Menu
- Hero Dashboard (`.hero-dashboard` + `.kpi-grid` 4 cards + Caveat podpis)
- Instrument Panel (`.trust-panel` — 4 KPI: opinie/gwarancja/zwroty/dostawa)
- Problem (z liczbami: 14 godz/tydz tracone na sprzątanie)
- Features Cards 2×2 (CAD callouts: LiDAR / 5000 Pa / Stacja 60 dni / Cisza 60 dB)
- How It Works (3 steps: skanuje → sprząta → wraca i czyści)
- Comparison Bar Charts (`.chart-compare` — Hovira vs tradycyjne sprzątanie)
- Reviews / Testimonials z KPI (T2 — odzyskane godziny tygodniowo)
- FAQ
- Offer (spec-dense card)
- Final CTA (z Caveat podpisem)
- Footer

Forbidden:
- Editorial eyebrow Nº
- Warm cream sections
- Script handwriting w body (tylko 3 miejsca accent)
- Italic em w h1/h2

### 10.6 Motion Budget (z pliku stylu sekcja 10)
```yaml
js_effects_required:
  - .fade-in        # min 8 sekcji
  - .js-counter     # min 5 (4 KPI hero + offer card)
  - .js-tilt        # min 2 (feature cards)

js_effects_forbidden:
  - .js-split       # za editorial (Vitrix)
  - .js-parallax    # za miękkie
  - .magnetic       # za DTC

js_effects_count:
  counter_min: 5
  counter_max: 12
  tilt_min: 2
```
