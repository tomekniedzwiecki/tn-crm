# Apothecary Label — uczciwa etykieta składu zamiast magazynu lifestylowego

## 1. Product DNA profil
- **Utility ↔ Ritual:** utility
- **Precision ↔ Expression:** precision
- **Evidence ↔ Feeling:** evidence
- **Solo ↔ Community:** solo
- **Quiet ↔ Loud:** quiet
- **Tradition ↔ Future:** present
- **Intimate ↔ Public:** intimate

### DNA Anchors (3 produkty które ten styl obsłużyłby)
1. **Parownica ręczna eko-mamy (Steamla)** — utility (czyści), precision (3 bary), evidence (H₂O 100%)
2. **Mono-olej do twarzy (squalane)** — utility, precision, evidence, intimate. Nie tworzy rytuału, likwiduje rytuał.
3. **Proszek probiotyczny Seed/Ritual** — utility, precision, evidence. Kapsułka + lista szczepów + badanie kliniczne.

## 2. Kategorie produktów
- Clean home cleaning tools (parownice, mopy elektryczne, odkurzacze)
- Refillable personal care (szampony w proszku, mydła)
- Skład-first DTC food (oleje, ocet, herbaty mono-składnikowe)
- Beauty minimal ingredient (squalane, mono-oleje, serum 1-ingredient)
- Baby safe cleaning (dermatologiczne dla dzieci)

## 3. Real-world refs
- **Thrive Market** — private label: duży spec block „Ingredients: Organic Olive Oil" jako hero, pionowy stack
- **Seventh Generation** — uczciwa typografia pudełka: sans + mono, recycled-paper beige + deep navy
- **Common Heir** — apothecary pill bottles: oversized product label, bottle-as-hero
- **Necessaire** — body-care: spec-first, technical disclosure as design
- **Native** — deodorant label: flat color blocks, benefit-as-typography

## 4. Font stack

- **Display:** `IBM Plex Sans` 500/600/700 — etykieta leku, nie magazyn
- **Body:** `Inter` 400/500/600 — spec tables 15-17px
- **Mono:** `IBM Plex Mono` 400/500 — jednostki, ingredients, version numbers

```html
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

## 5. Paleta (60/30/10)

| Rola | Nazwa | Hex | Gdzie |
|------|-------|-----|-------|
| Dominant 60% | Paper White | `#FAFAF7` | tło strony |
| Secondary 30% | Ink | `#0F1115` | body text, headings |
| Accent 10% | [brand primary z workflow_branding] | brand | CTA, 1-2 highlights |
| Support 1 | Lab Gray | `#6B6F76` | meta, units |
| Support 2 | Seal Red | `#C53030` | ostrzegawcze liczby (opcjonalne) |

**Filozofia koloru:** monochrome + 1 brand color. Zero gradient, zero warm cream. Laboratorium nie apteka — sterylne ale nie chłodne.

## 6. Layout DNA

**Stack dense** — pionowe sekcje z gęstą informacją jak instrukcja leku. Centralna kolumna max 720px na tekst, full-bleed tylko dla spec tables (1200px). ZERO bento 2×2.

## 7. Signature primitives

### Primitive 1: Full-width spec label (dominanta strony)
Gigantyczna etykieta produktu, `SKŁADNIK: H₂O — 100%` jako headline sekcji. Ramka 2px solid ink, padding 48px, font 64-120px.

```html
<section class="spec-label-section">
  <div class="spec-label-block">
    <div class="spec-label-head">SKŁADNIK</div>
    <div class="spec-label-big">H₂O</div>
    <div class="spec-label-sub">100% · bez dodatków</div>
    <table class="spec-label-table">
      <tr><td>Objętość</td><td>350 ml</td></tr>
      <tr><td>Temperatura pary</td><td>105 °C</td></tr>
    </table>
  </div>
</section>
```
```css
.spec-label-block { border: 2px solid var(--ink); padding: 56px; max-width: 880px; margin: 0 auto; }
.spec-label-big { font-family: var(--display); font-size: clamp(80px, 12vw, 160px); font-weight: 700; letter-spacing: -0.04em; line-height: 0.9; }
.spec-label-table { width: 100%; border-collapse: collapse; font-family: var(--mono); font-size: 14px; }
.spec-label-table td { padding: 14px 0; border-top: 1px solid var(--ink); }
```

### Primitive 2: Sec-meta strip (ZAMIAST trust-bar)
Zamiast `Nº 03 — PRODUKT`, używamy: `PRODUKT · LOT 2026-Q2 · BATCH 001 · STEAMLA` w pełnej szerokości.

```html
<div class="sec-meta">
  <span>PRODUKT</span><span>LOT 2026-Q2</span><span>BATCH 001</span><span>STEAMLA HANDHELD</span>
</div>
```
```css
.sec-meta { display: flex; justify-content: space-between; padding: 14px 0; border-top: 1px solid var(--ink); border-bottom: 1px solid var(--ink); font-family: var(--mono); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; }
```

### Primitive 3: Features = spec-rows (nie bento)
Features jako tabelaryczne wpisy, max 6.

```html
<ul class="feat-spec-list">
  <li>
    <span class="feat-key">01 · Skład</span>
    <span class="feat-body"><strong>H₂O 100%</strong> — tylko zwykła woda, żadnych dodatków.</span>
  </li>
</ul>
```
```css
.feat-spec-list { list-style: none; padding: 0; max-width: 820px; }
.feat-spec-list li { display: grid; grid-template-columns: 180px 1fr; gap: 32px; padding: 28px 0; border-top: 1px solid var(--ink); align-items: baseline; }
.feat-key { font-family: var(--mono); font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; }
.feat-body strong { font-family: var(--display); font-size: 22px; font-weight: 600; display: block; margin-bottom: 6px; }
```

### Primitive 4: Footnoted claims
Każda liczba z przypisem `[1]` + stopka z odniesieniem.

### Primitive 5: Empty-space as design
Padding sekcji ≥ 120px desktop, 80px mobile.

---

## 8. Section Architecture

**Minimum sekcji:** 10 (z 12 available)

```yaml
required:
  - Header                    # .header
  - Mobile Menu               # .mobile-menu
  - Hero                      # .hero z spec-label primitive
  - Sec Meta Strip            # .sec-meta (ZAMIAST trust-bar)
  - Spec Label Big            # .spec-label-section (sygnaturowa)
  - Features as Spec Rows     # .feat-spec-list (NIE bento)
  - How It Works              # .how-it-works (3 steps minimal)
  - Comparison Table          # .comparison-table (NIE cards)
  - FAQ                       # .faq (5-7 pytań)
  - Offer                     # .offer (minimal)
  - Footer                    # <footer>

optional:
  - Problem                   # opcjonalne — utility product nie musi
  - Testimonials Spec-style   # .testimonials w spec-row format
  - Sticky CTA                # .sticky-cta

forbidden:
  - Trust Bar dark            # ciemny z ikonami w kółkach (Apothecary używa sec-meta)
  - Social Proof Marquee      # nie pasuje do tonu etykiety
  - Final CTA Banner (wide)   # używamy prostego offer zakończenia
```

## 9. Allowed Variants

```yaml
hero_allowed: [H1, H5, H8]
hero_forbidden: [H2, H3, H4, H6, H7, H9, H10]
# H1 Split klasyczny — OK, pionowy spec-label po prawej
# H5 Oversized typography — OK dla „H₂O. Jedyny składnik."
# H8 Split z ceną — OK dla budget utility
# Resztę zabraniamy: H2 lifestyle, H4 oversized italic numeral = editorial

features_allowed: [F3, F6]
features_forbidden: [F1, F2, F4, F5]
# F3 Linear stack — OK (pasuje do spec-row format)
# F6 Sticky scrollytelling — OK dla „jak działa w szczegółach"
# F1 Bento 2×2 ZAKAZANE — core forbidden dla tego stylu

testimonials_allowed: [T2, T5]
testimonials_forbidden: [T1, T3, T4, T6]
# T2 Before/After stats — OK (evidence-based)
# T5 Single hero — OK (strong voice bez theatrics)
```

## 10. Motion Budget

**Level:** subtle

```yaml
js_effects_required:
  - .fade-in               # zawsze
  - .js-counter            # min 1 (dla specyfikacji jak 99,9% roztoczy)

js_effects_forbidden:
  - .js-split              # char-by-char zbyt editorial, psuje minimalism
  - .js-parallax           # oversized numeral w tle jest zakazany → bezcelowe
  - .magnetic              # zbyt DTC/playful

js_effects_count:
  counter_min: 1
  counter_max: 3
  magnetic_min: 0          # zakaz
  tilt_min: 0              # zakaz
  parallax_min: 0          # zakaz
```

## 11. Copy Voice

- **Register:** technical + direct (instrukcja leku)
- **Sentence length:** short-medium (10-18 słów)
- **Person:** 2-osoba (Ty/Twój), bez „my/nasz"
- **Allowed power words:** „certyfikowane", „testowane", „dermatologicznie sprawdzone" (ze źródłem)
- **Forbidden:** „premium", „luxury", „wysokiej jakości", „innowacyjne", „rewolucyjne"

## 12. Example Snippet

```html
<section class="hero">
  <div class="sec-meta">
    <span>STEAMLA</span><span>PAROWNICA HANDHELD</span><span>LOT 2026-Q2</span>
  </div>
  <div class="container">
    <h1>Skład — jeden. <br>Składnik — <em>H<sub>2</sub>O</em>.</h1>
    <p class="hero-sub">Parownica 1500 W, 3 bary, zbiorniczek na zwykłą wodę z kranu.</p>
    <a href="#offer" class="btn-primary">Zamów — 599 zł</a>
  </div>
</section>

<section class="spec-label-section">
  <div class="spec-label-block">
    <div class="spec-label-head">SKŁADNIK</div>
    <div class="spec-label-big">H<sub>2</sub>O</div>
    <div class="spec-label-sub">100% · bez dodatków</div>
    <table class="spec-label-table">
      <tr><td>Objętość</td><td>350 ml</td></tr>
      <tr><td>Temperatura pary</td><td>105 °C</td></tr>
      <tr><td>Czas do gotowości</td><td>15 s</td></tr>
    </table>
  </div>
</section>
```

```css
:root {
  --display: 'IBM Plex Sans', system-ui, sans-serif;
  --body: 'Inter', -apple-system, sans-serif;
  --mono: 'IBM Plex Mono', 'Courier New', monospace;
  --paper: #FAFAF7;
  --ink: #0F1115;
  --primary: #3DB5C9;
  --lab-gray: #6B6F76;
}
body { font-family: var(--body); background: var(--paper); color: var(--ink); }
h1 { font-family: var(--display); font-size: clamp(52px, 7vw, 96px); font-weight: 700; letter-spacing: -0.03em; line-height: 0.95; }
h1 em { font-style: normal; color: var(--primary); font-weight: 700; }
.btn-primary { display: inline-block; padding: 18px 32px; background: var(--ink); color: var(--paper); font-family: var(--mono); font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase; border-radius: 0; }
.hero { padding: 160px 0 120px; }
.container { max-width: 960px; margin: 0 auto; padding: 0 32px; }
```

---

## MUSZĄ / NIE WOLNO — Style Lock (grep-sprawdzalne)

### MUSZĄ być użyte
- Display font: `IBM Plex Sans` w `font-family`
- Mono font: `IBM Plex Mono` — min 1 występ per sekcja
- Min 1 `<table>` lub `.spec-*-list` w landingu
- Padding sekcji ≥ `100px 0` (grep CSS)
- Primitive 1 (spec-label-section) obecny

### NIE WOLNO użyć
- **Fonty:** NIE `Fraunces`, `Cormorant`, `Playfair`, `Italiana`, `Libre Bodoni`, `Caveat`, `Fredoka`, `Archivo Black`, `Nunito`
- **Layout:** NIE `grid-template-columns: 1fr 1fr` dla features (bento 2×2 zakaz)
- **Elementy:** NIE `Nº` w eyebrow, NIE `.hero-numeral` (oversized italic), NIE `.trust-strip` z dark bg + icon circles
- **Kolory:** NIE `#F6F3ED` (linen cream), NIE `#E09A3C` `#C9A961` (gold/brass), NIE `linear-gradient` w tłach sekcji
- **Motion:** NIE `.js-split`, NIE `.js-parallax`, NIE `.magnetic`

---

## Podobne style (ale RÓŻNE)

- [`clinical-kitchen.md`](./clinical-kitchen.md) — Clinical ma data viz/dashboardy (charts, KPI cards). Apothecary ma etykiety/tabele (label aesthetics, bez charts).
- [`swiss-grid.md`](./swiss-grid.md) — Swiss używa Helvetica Now + strict modular grid. Apothecary może być cieplejszy (label metaphor, sec-meta strips).
- [`brutalist-diy.md`](./brutalist-diy.md) — Brutalist = ekspresja, Times New Roman, raw. Apothecary = dyscyplina, geometric sans, refined.

## Changelog
- 2026-04-23 utworzony, v4.0
