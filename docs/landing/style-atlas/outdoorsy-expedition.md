# Outdoorsy Expedition — topograficzne mapy, Work Sans, khaki + orange sygnał

## 1. Product DNA profil
- Utility↔Ritual: **utility** · Precision↔Expression: **balanced** · Evidence↔Feeling: **evidence**
- Solo↔Community: **dual** · Quiet↔Loud: **moderate** · Tradition↔Future: **tradition** · Intimate↔Public: **public**

### DNA Anchors
1. **Patagonia fleece** — utility, tradition, evidence, dual.
2. **Snow Peak titanium** — utility, precision, tradition, solo.
3. **Yeti cooler** — utility, tradition, public (lifestyle trade).

## 2. Kategorie produktów
- Outdoor gear (plecaki, namioty, butelki termiczne, latarki)
- Workwear (spodnie, kurtki, buty robocze)
- Adventure appliances (kuchenki turystyczne, filtry do wody, power banki XL)
- Car/cycling accessories (pasy, mocowania, narzędzia)
- Survival/preparedness gear

## 3. Real-world refs
- **Patagonia** — heritage workwear feel + earth tones + bold print headings
- **Snow Peak** — outdoor precision + grid + rust accent
- **Topo Designs** — topo maps jako pattern, warm oranges
- **Filson** — rugged heritage, warm khaki + red logo
- **REI co-op** — outdoor utility + bold typography

## 4. Font stack

- **Display:** `Work Sans` 700/800 — solid workwear sans
- **Body:** `Work Sans` 400/500 — consistent
- **Mono:** `Space Mono` 500 — spec labels, coordinates

```html
<link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;700;800&family=Space+Mono:wght@500&display=swap" rel="stylesheet">
```

## 5. Paleta

| Rola | Nazwa | Hex | Gdzie |
|------|-------|-----|-------|
| Dominant 60% | Canvas Khaki | `#E5D7B8` | tło |
| Secondary 30% | Trail Ink | `#1F1A14` | text |
| Accent 10% | Signal Orange | `#D35A1D` | CTA, highlights |
| Support 1 | Forest Deep | `#2F4A2D` | dark sekcje |
| Support 2 | Rust Heritage | `#8B4513` | 1-2 miejsca per sekcja |

**Filozofia:** earth tones + bright signal (orange). Zero luxury gold. Patina/weathered vibe.

## 6. Layout DNA

**Panorama wide** — wide hero images + typography overlay. Sections naprzemiennie: canvas khaki bg → forest deep bg → canvas khaki.

## 7. Signature primitives

### Primitive 1: Topographic map pattern (subtle bg)
```css
.topo-bg { background-image: url('data:image/svg+xml,...topo lines...'); background-size: 200px 200px; opacity: 0.12; }
```

### Primitive 2: Coordinate labels (monospace)
Każda sekcja oznaczona koordynatami GPS-like: `52°14′N · 21°01′E · ELEV 112m` — Space Mono monospace 11px uppercase.

### Primitive 3: Bold Print chapter headings
Work Sans 800 huge, czasem all-caps, dense tracking.

```css
h1 { font-family: 'Work Sans'; font-weight: 800; font-size: clamp(56px, 7vw, 100px); text-transform: uppercase; letter-spacing: -0.02em; line-height: 0.95; }
```

### Primitive 4: Stamp-style badges
```html
<div class="field-stamp">FIELD TESTED · 2026</div>
```
```css
.field-stamp { display: inline-block; border: 2px solid var(--rust); padding: 8px 16px; font-family: 'Space Mono'; font-size: 12px; letter-spacing: 0.2em; color: var(--rust); text-transform: uppercase; transform: rotate(-2deg); }
```

### Primitive 5: Gear grid (rectangle cards z padding)
Features jako gear kartka — prostokątne cards z width: 100%, border 2px forest, monospace label u góry, Work Sans heading.

---

## 8. Section Architecture

**Minimum sekcji:** 11

```yaml
required:
  - Header (Work Sans bold brand + signal orange CTA)
  - Mobile Menu
  - Hero Panorama (wide image + BOLD heading overlay)
  - Coordinate Strip (ZAMIAST trust-bar: GPS-like coords)
  - Problem (field narrative)
  - Features Gear Grid (2×2 rectangle cards)
  - How It Works (3 steps z stamp badges)
  - Comparison Field vs Office (split khaki vs forest)
  - Testimonials (field reports + stamp badges)
  - FAQ (Q: bold Work Sans, A: serif-adjacent)
  - Offer (gear kit vibe)
  - Footer

optional:
  - Final CTA banner (panorama wide)
  - Sticky CTA
```

## 9. Allowed Variants

```yaml
hero_allowed: [H2, H9, H7]
hero_forbidden: [H1, H3, H4, H5, H6, H8, H10]
# H2 Full-bleed lifestyle — native panorama match
# H9 Video loop — OK cinematic outdoor
# H7 Product macro — OK gear detail

features_allowed: [F1, F4]
features_forbidden: [F2, F3, F5, F6]
# F1 Bento 2×2 — gear grid
# F4 Cards z mockupami — OK z gear photos

testimonials_allowed: [T2, T6]
testimonials_forbidden: [T1, T3, T4, T5]
# T6 Press logos + cytat — field press badges
# T2 Before/After — evidence
```

## 10. Motion Budget

**Level:** moderate

```yaml
js_effects_required:
  - .fade-in
  - .js-counter           # dla spec counters (waga, temperatura, pojemność)

js_effects_forbidden:
  - .js-split
  - .magnetic

js_effects_count:
  counter_min: 2
  tilt_min: 0             # outdoor nie ma polish tilt
  parallax_min: 1         # OK dla map/landscape parallax
```

## 11. Copy Voice

- **Register:** field manual + heritage confident
- **Sentence length:** short-medium (8-16)
- **Person:** 2-osoba imperative + „my" rarely (z premedytacji, jako „my z pola")
- **Allowed:** konkretne locations, battle-tested verbs („wytrzymuje", „znosi", „odpowiada")
- **Forbidden:** luxury power words, korporacyjne

## 12. Example Snippet

```html
<section class="hero-panorama">
  <div class="hero-bg">[wide image]</div>
  <div class="hero-overlay">
    <div class="coord-label">N 52°14′ · FIELD</div>
    <h1>Para w terenie.<br>Bez chemii, <em>bez wymówek.</em></h1>
    <p>Parownica 1500 W — testowana od szopy po fotelik.</p>
    <a href="#offer" class="btn-signal">Zamów — 599 zł →</a>
  </div>
</section>
```

```css
:root {
  --display: 'Work Sans', sans-serif;
  --body: 'Work Sans', sans-serif;
  --mono: 'Space Mono', monospace;
  --khaki: #E5D7B8;
  --ink: #1F1A14;
  --signal: #D35A1D;
  --forest: #2F4A2D;
  --rust: #8B4513;
}
body { font-family: var(--body); background: var(--khaki); color: var(--ink); }
h1 { font-family: var(--display); font-weight: 800; font-size: clamp(56px, 7vw, 100px); text-transform: uppercase; letter-spacing: -0.02em; line-height: 0.95; }
h1 em { font-style: normal; color: var(--signal); }
.coord-label { font-family: var(--mono); font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--rust); margin-bottom: 24px; }
.btn-signal { display: inline-block; padding: 18px 32px; background: var(--signal); color: #fff; font-family: var(--display); font-weight: 700; font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase; border-radius: 0; }
```

---

## MUSZĄ / NIE WOLNO

### MUSZĄ
- Display: `Work Sans` 700/800 w h1 (grep)
- Mono: `Space Mono` dla coordinates (grep min 1 `.coord-label`)
- Paleta: `#E5D7B8` khaki + `#D35A1D` orange (grep oba)
- Min 1 `.field-stamp` (primitive 4)

### NIE WOLNO
- **Fonty:** NIE `Fraunces`, `IBM Plex`, `Caveat`, `Libre Caslon`, `EB Garamond`
- **Layout:** NIE editorial column wąski, NIE Japandi minimal puste
- **Elementy:** NIE gold accent, NIE linen cream dominant (chłodny), NIE script handwriting
- **Kolory:** NIE `#F6F3ED` linen, NIE burgundy `#6B1F1F`
- **Motion:** NIE split-char, NIE magnetic

---

## Podobne style

- [`rugged-heritage.md`](./rugged-heritage.md) — Rugged Heritage (kafina) ma Archivo + dark hero + stamp. Outdoorsy ma Work Sans + khaki + orange + topographic.
- [`clinical-kitchen.md`](./clinical-kitchen.md) — Clinical jest white + data. Outdoorsy jest khaki + field narrative.
- [`poster-utility.md`](./poster-utility.md) — Poster jest bold primary. Outdoorsy jest earth tones + signal orange jako jedyna jaskrawa nuta.

## Changelog
- 2026-04-23 utworzony, v4.0
