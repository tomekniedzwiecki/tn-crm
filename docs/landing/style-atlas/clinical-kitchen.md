# Clinical Kitchen — tech utility z dashboardami i data viz zamiast storytellingu

## 1. Product DNA profil
- **Utility ↔ Ritual:** utility
- **Precision ↔ Expression:** precision
- **Evidence ↔ Feeling:** evidence
- **Solo ↔ Community:** solo
- **Quiet ↔ Loud:** moderate
- **Tradition ↔ Future:** future
- **Intimate ↔ Public:** intimate

### DNA Anchors
1. **Anker PowerCore 20000mAh** — utility, precision, evidence, solo, future
2. **Philips Avent podgrzewacz butelek** — utility, precision, evidence, intimate (baby)
3. **Withings Body Smart waga** — utility, precision, evidence, future (dashboardy)

## 2. Kategorie produktów
- Smart home tech (robot vacuum, smart thermostat, air purifier)
- Medical-grade household (irygatory, nebulizatory, wagi medyczne)
- Kitchen tech (sous-vide, air fryer, blender premium)
- Health tech (glukometry, ciśnieniomierze, termometry)
- Baby tech (podgrzewacze, monitory oddechu)

## 3. Real-world refs
- **Anker / Eufy** — liczby spec, porównania tabelaryczne, clean tech layout
- **DJI** — dron pages: feature z dashboard mockupem, rozłożone specs
- **Philips Avent** — clinical trust + warm undertone, data comparison
- **Medela** — clinical evidence-based, specs tabelaryczne
- **Withings** — dashboard hero, liczby jako design element

## 4. Font stack

- **Display:** `IBM Plex Sans` 500/600 — technical sans, neutral
- **Body:** `IBM Plex Sans` 400/500 — ten sam rodzaj, różne weighty
- **Mono:** `IBM Plex Mono` 400/500 — liczby specyfikacji, readouts

```html
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

## 5. Paleta (60/30/10)

| Rola | Nazwa | Hex | Gdzie |
|------|-------|-----|-------|
| Dominant 60% | Lab White | `#F7F9FB` | tło sekcji, dashboardy |
| Secondary 30% | Instrument Ink | `#0A1420` | text body, data liczby |
| Accent 10% | [brand primary] | brand | data highlight, chart bars, CTA |
| Support 1 | Chart Gray 1 | `#C4CCD4` | chart grid lines |
| Support 2 | Warning Amber | `#E0930D` | alerts, ostrzegawcze liczby |

**Filozofia koloru:** chłodny minimalizm + 1 brand hit. Zero warm creams. Tło prawie-białe, tekst prawie-czarny, brand jako aktywny highlight w danych.

## 6. Layout DNA

**Dashboard** — grid kart/tiles z KPI-like liczbami, charts, comparisons. Hero = product mockup split z dashboard app (pokazuje dane jako visualization).

## 7. Signature primitives

### Primitive 1: KPI Dashboard Hero
```html
<section class="hero-dashboard">
  <div class="hero-left">
    <h1>Para pod kontrolą. <em>Bez chemii.</em></h1>
    <div class="kpi-grid">
      <div class="kpi"><strong>105 °C</strong><span>para</span></div>
      <div class="kpi"><strong>3 bar</strong><span>ciśnienie</span></div>
      <div class="kpi"><strong>15 s</strong><span>start</span></div>
      <div class="kpi"><strong>99,9%</strong><span>roztoczy eliminacja</span></div>
    </div>
  </div>
  <div class="hero-right">[packshot]</div>
</section>
```
```css
.kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.kpi { background: #fff; border: 1px solid var(--chart-gray-1); border-radius: 8px; padding: 20px 24px; }
.kpi strong { display: block; font-family: var(--display); font-size: 36px; font-weight: 600; font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }
.kpi span { font-family: var(--mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--chart-gray-1); }
```

### Primitive 2: Comparison bar charts
Zamiast tekstowego comparison: poziome bar charts.

```html
<div class="chart-compare">
  <div class="chart-row">
    <span class="chart-label">Koszt/mies.</span>
    <div class="chart-bar"><div class="chart-fill" style="width:100%">100 zł</div></div>
    <span class="chart-ref">Chemia</span>
  </div>
</div>
```

### Primitive 3: Product CAD shot z callouts
Packshot z liniowymi callout-ami wskazującymi parts. Technical drawing vibe.

### Primitive 4: Data-driven testimonials
Każdy testimonial z KPI obok (zaoszczędzone godziny/pieniądze/alergeny).

### Primitive 5: Instrument-panel trust strip
Trust strip jako panel z KPI zamiast ikon w kółkach.

```html
<section class="trust-panel">
  <div class="trust-kpi"><strong>4,8/5</strong><span>1 247 opinii</span></div>
  <div class="trust-kpi"><strong>2 lata</strong><span>gwarancji</span></div>
</section>
```

---

## 8. Section Architecture

**Minimum sekcji:** 11 (z 13 available)

```yaml
required:
  - Header
  - Mobile Menu
  - Hero Dashboard           # .hero-dashboard (primitive 1)
  - Instrument Panel         # .trust-panel (KPI-style, ZAMIAST trust-bar)
  - Problem (z liczbami)     # .problem — z KPI
  - Features Cards           # grid 2×2 z piktogramami (NIE bento tekstowe)
  - How It Works             # 3 steps z mockups
  - Comparison Bar Charts    # .chart-compare (primitive 2)
  - Testimonials z KPI       # data-driven
  - FAQ
  - Offer (spec-dense)
  - Final CTA
  - Footer

optional:
  - Sticky CTA

forbidden:
  - Editorial eyebrow Nº
  - Warm cream sections
  - Script/handwriting accent
```

## 9. Allowed Variants

```yaml
hero_allowed: [H3, H4, H1]
hero_forbidden: [H2, H5, H6, H7, H8, H9, H10]
# H3 Dashboard mockup — PERFECT match
# H4 Editorial numerał — OK bo killer-liczba tech, ale bez italic
# H1 fallback

features_allowed: [F4, F1]
features_forbidden: [F2, F3, F5, F6]
# F4 Cards z mockupami — ideał
# F1 Bento 2×2 acceptable z piktogramami (nie z tekstem)

testimonials_allowed: [T2, T1]
testimonials_forbidden: [T3, T4, T5, T6]
# T2 Before/After stats — evidence-based
# T1 Voices grid — OK jako fallback
```

## 10. Motion Budget

**Level:** subtle

```yaml
js_effects_required:
  - .fade-in
  - .js-counter           # min 3 (dla KPI cards)

js_effects_forbidden:
  - .js-split             # za editorial
  - .js-parallax          # za miękkie
  - .magnetic             # zbyt DTC

js_effects_count:
  counter_min: 3          # KPI cards wymagają counter'ów
  counter_max: 10
  tilt_min: 2             # OK na cards feature
```

## 11. Copy Voice

- **Register:** technical + calm. Evidence-based, cite-able
- **Sentence length:** medium (12-18 słów)
- **Person:** 2-osoba + bezosobowy mix (przy specyfikacjach)
- **Allowed power words:** „zmierzone", „testowane", „certyfikowane", „verified", „badanie X"
- **Forbidden:** „premium", „luxury", „rewolucyjne", „innowacyjne"

## 12. Example Snippet

```html
<section class="hero-dashboard">
  <div class="hero-left">
    <h1>Para pod kontrolą. <em>Bez chemii.</em></h1>
    <div class="kpi-grid">
      <div class="kpi"><strong class="js-counter" data-target="105" data-suffix=" °C">0</strong><span>para</span></div>
      <div class="kpi"><strong class="js-counter" data-target="3" data-suffix=" bar">0</strong><span>ciśnienie</span></div>
      <div class="kpi"><strong class="js-counter" data-target="15" data-suffix=" s">0</strong><span>start</span></div>
      <div class="kpi"><strong>99,9%</strong><span>roztoczy</span></div>
    </div>
    <a href="#offer" class="btn-tech">Zamów — 599 zł</a>
  </div>
</section>
```

```css
:root {
  --display: 'IBM Plex Sans', system-ui, sans-serif;
  --body: 'IBM Plex Sans', system-ui, sans-serif;
  --mono: 'IBM Plex Mono', monospace;
  --paper: #F7F9FB;
  --ink: #0A1420;
  --primary: #3DB5C9;
  --chart-gray-1: #C4CCD4;
}
body { font-family: var(--body); background: var(--paper); color: var(--ink); }
h1 { font-family: var(--display); font-size: clamp(42px, 5vw, 64px); font-weight: 600; letter-spacing: -0.02em; line-height: 1.1; }
h1 em { color: var(--primary); font-style: normal; }
.btn-tech { display: inline-block; padding: 16px 28px; background: var(--ink); color: var(--paper); font-family: var(--mono); font-size: 13px; letter-spacing: 0.1em; border-radius: 6px; }
```

---

## MUSZĄ / NIE WOLNO — Style Lock

### MUSZĄ
- Display font: `IBM Plex Sans` (grep)
- Mono font: `IBM Plex Mono` (grep)
- Min 1 `.kpi-grid` lub `.dashboard` (primitive 1)
- Min 1 `.chart-compare` lub `.chart-bar` (primitive 2)
- Tło sekcji: `#F7F9FB` lub `#FFFFFF` dla min 4 sekcji
- Min 8 unique specs (liczba + unit) w landingu
- Min 3 `.js-counter`

### NIE WOLNO
- **Fonty:** NIE `Fraunces`, `Cormorant`, `Playfair`, `Italiana`, `Archivo Black`, `Caveat`
- **Layout:** NIE editorial-column, NIE Nº eyebrow, NIE full-bleed color sekcji (Poster style)
- **Elementy:** NIE warm cream tło, NIE gold accent, NIE script handwriting, NIE italic em w h1/h2 (em może być normal-style)
- **Kolory:** NIE `#F6F3ED`, NIE `#E09A3C`, NIE `#C9A961`
- **Motion:** NIE `.js-parallax`, NIE `.js-split`, NIE `.magnetic`

---

## Podobne style (ale RÓŻNE)

- [`apothecary-label.md`](./apothecary-label.md) — Apothecary = etykiety + tabele + label aesthetics. Clinical = dashboardy + charts + data viz.
- [`panoramic-calm.md`](./panoramic-calm.md) — Panoramic = architectural wide + lifestyle images. Clinical = data-heavy, KPI-first.
- [`swiss-grid.md`](./swiss-grid.md) — Swiss = strict modular grid z Helvetica. Clinical = dashboards asymmetric z IBM Plex.

## Changelog
- 2026-04-23 utworzony, v4.0
