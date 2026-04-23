# Cottagecore Botanical — sage, EB Garamond, ilustracje botaniczne w rogach

## 1. Product DNA profil
- Utility↔Ritual: **ritual** · Precision↔Expression: **expression** · Evidence↔Feeling: **feeling**
- Solo↔Community: **dual** · Quiet↔Loud: **quiet** · Tradition↔Future: **tradition** · Intimate↔Public: **intimate**

### DNA Anchors
1. **Sezane vêtements** — ritual, feeling, tradition, intimate. Romantic French countryside.
2. **Doen dresses** — ritual, feeling, feminine, floral.
3. **Daylesford Organic farm shop** — ritual, tradition, dual (community/intimate).

## 2. Kategorie produktów
- Beauty naturalne / zielarstwo (maski, serum ziołowe, oleje ziołowe)
- Herbata ziołowa (Rooibos, chamomilla, herbaty kwiatowe)
- Świece zapachowe z ziół i kwiatów
- Ubrania/akcesoria linen + kwiatowe patterns
- Mydła handmade, kosmetyki z ekstraktami roślin

## 3. Real-world refs
- **Sezane** — warm cream + sage + vintage botanical illustrations, centered serif
- **Doen** — feminine + ziemiste tony + botanical motives
- **Daylesford Organic** — farm shop + cursive accent + earthy pastel
- **Eu Yan Sang premium line** — chinese herbal aesthetic

## 4. Font stack

- **Display:** `EB Garamond` 400/500 italic — old-world serif
- **Body:** `EB Garamond` 400 — consistent serif
- **Accent:** `La Belle Aurore` lub `Allura` — single script accent dla 2-3 miejsc

```html
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=La+Belle+Aurore&display=swap" rel="stylesheet">
```

## 5. Paleta

| Rola | Nazwa | Hex | Gdzie |
|------|-------|-----|-------|
| Dominant 60% | Butter Cream | `#F5EFDF` | tło |
| Secondary 30% | Sage Soft | `#8AA586` | accent ziemisty, hover |
| Accent 10% | Terracotta Warm | `#C17A4B` | CTA, highlights |
| Support 1 | Cocoa Ink | `#3D2F24` | body text |
| Support 2 | Blush Petal | `#E8C3B8` | delicate bg sekcji alt |

**Filozofia:** warm earth tones, natura wiejska, miękko i nostalgicznie. Zero cool tones, zero neon.

## 6. Layout DNA

**Editorial column z botanicznymi SVG w rogach** — centralna kolumna 680px, obrazy owijane tekstem (float), botaniczne gałązki SVG w rogach sekcji jako ornament.

## 7. Signature primitives

### Primitive 1: Botanical SVG corner ornaments
Każda sekcja ma cienką gałązkę/kwiat w rogu (right-top lub left-bottom), subtle.

```html
<svg class="botanical-corner" viewBox="0 0 100 100" aria-hidden="true">
  <path d="M10,90 Q30,70 50,50 Q70,30 90,10" stroke="var(--sage)" stroke-width="1" fill="none"/>
  <circle cx="50" cy="50" r="3" fill="var(--terracotta)"/>
  <!-- małe listki w różnych miejscach -->
</svg>
```
```css
.botanical-corner { position: absolute; top: 40px; right: 40px; width: 90px; height: 90px; opacity: 0.55; }
```

### Primitive 2: Italic script accent w hero
Jedno-słowny cytat script font dopisany obok serif headline.

```html
<h1>Zwykła woda <span class="script-accent">— tylko.</span></h1>
```
```css
.script-accent { font-family: 'La Belle Aurore', cursive; font-size: 0.65em; color: var(--terracotta); display: inline-block; transform: rotate(-3deg); vertical-align: middle; }
```

### Primitive 3: Letterpress-like raised letters (via box-shadow text)
```css
.letterpress { text-shadow: 0 1px 0 rgba(245,239,223,0.8), 0 2px 2px rgba(61,47,36,0.15); }
```

### Primitive 4: Sepia photography z soft border
```css
.cottage-img { border: 1px solid var(--sage); filter: sepia(0.15) saturate(0.95); padding: 8px; background: var(--butter); }
```

### Primitive 5: Recipe/ritual card format
Feature jako „recipe card" z nagłówkiem + listą składników/kroków + podpisem.

---

## 8. Section Architecture

**Minimum sekcji:** 10

```yaml
required:
  - Header (centered brand + subtle script tagline)
  - Mobile Menu
  - Hero (EB Garamond + script accent, botanical SVG)
  - Manifesto (cytat w italic z ornamental rule)
  - Features as Recipe Cards (3-4 cards z floral decoration)
  - How It Works (3 steps w editorial rytm)
  - Testimonials (pullquote script accent)
  - FAQ (bold serif pytania)
  - Offer (centered, butter cream bg)
  - Footer

optional:
  - Problem (tylko jeśli organic product)

forbidden:
  - Trust Bar dark
  - Bento 2×2 square
  - Dashboards/Charts
  - Stickers rotated
  - Neon/saturated colors
```

## 9. Allowed Variants

```yaml
hero_allowed: [H1, H5, H6]
hero_forbidden: [H2, H3, H4, H7, H8, H9, H10]
# H6 Persona portrait — OK (feminine warm portrait)
# H5 Oversized typography — OK z EB Garamond italic

features_allowed: [F3, F2]
features_forbidden: [F1, F4, F5, F6]
# F2 Bento asymetryczny — OK jeśli editorial cards
# F3 Linear stack — pasuje do recipe rytmu

testimonials_allowed: [T5, T1]
testimonials_forbidden: [T2, T3, T4, T6]
```

## 10. Motion Budget

**Level:** subtle

```yaml
js_effects_required:
  - .fade-in

js_effects_forbidden:
  - .js-split
  - .js-parallax
  - .magnetic
  - .js-tilt
  - .js-counter

js_effects_count:
  tilt_min: 0
  parallax_min: 0
```

## 11. Copy Voice

- **Register:** warm + romantic + nostalgic
- **Sentence length:** medium (12-20)
- **Person:** 2-osoba ciepła lub bezosobowa nostalgia
- **Allowed:** naturalne metafory („jak poranny rosa", „jak babcine"), deminutywy ograniczone
- **Forbidden:** power words, korporacyjne, liczby w copy (liczby tylko w spec table)

## 12. Example Snippet

```html
<section class="hero">
  <svg class="botanical-corner">...</svg>
  <h1>Czystość z ogrodu <span class="script-accent">— od babki.</span></h1>
  <p class="hero-sub"><em>Para, którą pamięta każdy dom przed detergentami.</em></p>
</section>
```

```css
:root {
  --display: 'EB Garamond', Georgia, serif;
  --body: 'EB Garamond', Georgia, serif;
  --script: 'La Belle Aurore', cursive;
  --butter: #F5EFDF;
  --sage: #8AA586;
  --terracotta: #C17A4B;
  --cocoa: #3D2F24;
}
body { font-family: var(--body); background: var(--butter); color: var(--cocoa); line-height: 1.7; font-size: 17px; }
h1 { font-family: var(--display); font-size: clamp(48px, 6vw, 76px); font-weight: 400; font-style: italic; text-align: center; color: var(--cocoa); line-height: 1.12; max-width: 680px; margin: 0 auto; }
```

---

## MUSZĄ / NIE WOLNO

### MUSZĄ
- Display: `EB Garamond` (grep)
- Min 1 `.botanical-corner` SVG (primitive 1)
- Min 1 `.script-accent` element (primitive 2)
- Paleta: `#F5EFDF` butter + `#8AA586` sage + `#C17A4B` terracotta (grep min 2 z 3)

### NIE WOLNO
- **Fonty:** NIE `Archivo Black`, `IBM Plex`, `Fraunces`, `Libre Caslon`, `Inter` w h1
- **Layout:** NIE bento 2×2 hard grid, NIE dashboards, NIE Swiss grid
- **Elementy:** NIE stickers raw, NIE neon, NIE gold (używamy terracotta zamiast)
- **Motion:** NIE parallax, NIE split, NIE counter

---

## Podobne style

- [`organic-natural.md`](./organic-natural.md) — Organic to rounded sans + green wellness. Cottagecore to Garamond + sage + botanical illustrations.
- [`dark-academia.md`](./dark-academia.md) — DA jest burgundy + Caslon, formal. Cottagecore jest warm butter + Garamond + floral.
- [`japandi-serenity.md`](./japandi-serenity.md) — Japandi jest minimal + puste. Cottagecore jest romantic + ornamental.

## Changelog
- 2026-04-23 utworzony, v4.0
