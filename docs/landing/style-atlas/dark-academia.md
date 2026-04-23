# Dark Academia — burgundy, Libre Caslon, vibe „Penguin Classics"

## 1. Product DNA profil
- Utility↔Ritual: **ritual** · Precision↔Expression: **expression** · Evidence↔Feeling: **feeling**
- Solo↔Community: **solo** · Quiet↔Loud: **quiet** · Tradition↔Future: **tradition** · Intimate↔Public: **intimate**

### DNA Anchors
1. **Pelikan/Caran d'Ache fountain pen** — ritual, expression, tradition.
2. **Margaret Howell clothing** — ritual, tradition, intimate, quiet.
3. **Leather-bound notebook (Moleskine limited)** — ritual, tradition.

## 2. Kategorie produktów
- Narzędzia pisarskie (pióra, atramenty, notebooki skórzane)
- Perfumy z historią (Byredo, Le Labo old-world)
- Herbata premium z ceremonią
- Książki, papeteria, archival supplies
- Whisky, wino, tytoń premium (18+)

## 3. Real-world refs
- **Penguin Classics book covers** — burgundy/gray/tan, centered serif
- **Margaret Howell** — editorial minimal tan + navy
- **Byredo early website** — centered column, serif, ciemne tony
- **The Rake magazine** — menswear tradition
- **Oxford University Press** — academic serif, conservative

## 4. Font stack

- **Display:** `Libre Caslon Display` 400/500 — book cover aesthetic
- **Body:** `Libre Caslon Text` 400/500 — body serif jednolity
- **Accent:** `Libre Caslon Display` italic

```html
<link href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Display&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
```

## 5. Paleta

| Rola | Nazwa | Hex | Gdzie |
|------|-------|-----|-------|
| Dominant 60% | Parchment | `#E8E0CF` | tło |
| Secondary 30% | Oxblood Burgundy | `#6B1F1F` | headings, accent |
| Accent 10% | Antique Gold | `#A17C2E` | underlines, fine rules |
| Support 1 | Deep Ink | `#1A1410` | body text |
| Support 2 | Library Tan | `#C9B89E` | secondary bg |

**Filozofia:** burgundy dominuje emocjonalnie, parchment tło daje „stara książka". Gold 1-2 cienkie rules per sekcja. Zero saturated primary.

## 6. Layout DNA

**Editorial column** — wąska centralna kolumna (max 580px body), dużo padding, centered hero title w Caslon Display. Obrazy w cieniu (sepia lub duotone burgundy).

## 7. Signature primitives

### Primitive 1: Center-aligned Caslon Display hero
```css
h1 { font-family: 'Libre Caslon Display'; font-size: clamp(56px, 6vw, 88px); font-weight: 400; text-align: center; color: var(--burgundy); line-height: 1.08; letter-spacing: -0.005em; }
```

### Primitive 2: Drop-cap opening paragraph
Pierwszy paragraf po hero: pierwsza litera w oversized Caslon italic.

```css
.drop-cap::first-letter { font-family: 'Libre Caslon Display'; font-size: 72px; font-style: italic; float: left; line-height: 0.85; padding-right: 8px; color: var(--burgundy); }
```

### Primitive 3: Chapter divider z ornamental rule
```html
<hr class="chapter-rule">
<div class="chapter-num">§ III.</div>
```
```css
.chapter-rule { border: 0; border-top: 1px solid var(--gold); width: 120px; margin: 80px auto 16px; }
.chapter-num { text-align: center; font-family: 'Libre Caslon Display'; font-style: italic; color: var(--burgundy); font-size: 18px; margin-bottom: 40px; }
```

### Primitive 4: Sepia/duotone images
```css
img.vintage { filter: sepia(0.3) saturate(0.8) contrast(1.05); }
```

### Primitive 5: Marginalia notes
Prawy margin: mała notka dlaczego/źródło, serif italic, font 13px.

---

## 8. Section Architecture

**Minimum sekcji:** 9

```yaml
required:
  - Header (centered brand name, minimal)
  - Mobile Menu
  - Hero (centered Caslon title + cytat subtitle)
  - Drop-cap Manifesto (1-2 akapity z drop cap)
  - Chapter Features (numerowane § I, § II + chapter rules)
  - How It Works (3 steps w editorial column)
  - Offer (centered, konserwatywny)
  - Footer (centered, copyright z rokiem MMXXVI)

optional:
  - Problem (tylko gdy pasuje do tradition narrative)
  - Testimonials (1 pullquote jako epigraph)
  - FAQ (bez collapse, bold Q centered)

forbidden:
  - Trust Bar z ikonami
  - Bento 2×2
  - Poster full-bleed colors
  - Charts/Dashboards
  - Stickers rotated
```

## 9. Allowed Variants

```yaml
hero_allowed: [H5, H1]
hero_forbidden: [H2, H3, H4, H6, H7, H8, H9, H10]
# H5 Oversized typography — Caslon Display huge centered
# H1 fallback (split ale centered)

features_allowed: [F3]
features_forbidden: [F1, F2, F4, F5, F6]

testimonials_allowed: [T5]
testimonials_forbidden: [T1, T2, T3, T4, T6]
```

## 10. Motion Budget

**Level:** still

```yaml
js_effects_required:
  - .fade-in

js_effects_forbidden:
  - .js-split .js-parallax .magnetic .js-tilt .js-counter

js_effects_count:
  counter_min: 0
  parallax_min: 0
```

## 11. Copy Voice

- **Register:** literary + formal + timeless
- **Sentence length:** medium-long (15-25 słów), dopuszczalne bardziej złożone zdania
- **Person:** 2-osoba (Ty/Twój) lub 3-osoba (bezosobowo)
- **Allowed:** archaizmy („zaprawdę", „wszak"), klasyczne metafory
- **Forbidden:** korporacyjne, power words

## 12. Example Snippet

```html
<section class="hero">
  <div class="chapter-num">§ Liber primus</div>
  <h1>Para, rzecz <em>stara jak babka twoja</em>.</h1>
  <p class="hero-sub">I zarazem nowa jak filiżanka w poranek.</p>
</section>

<section class="manifesto">
  <p class="drop-cap">Czystość nie wymaga chemii. Przed detergentami była para. Wrzątek na metalu, płótno nad garnkiem — znała to każda matka i każda babka. Steamla wraca do tej wiedzy w rozmiarze dłoni.</p>
  <hr class="chapter-rule">
</section>
```

```css
:root {
  --display: 'Libre Caslon Display', Georgia, serif;
  --body: 'Libre Caslon Text', Georgia, serif;
  --parchment: #E8E0CF;
  --burgundy: #6B1F1F;
  --gold: #A17C2E;
  --ink: #1A1410;
}
body { font-family: var(--body); background: var(--parchment); color: var(--ink); line-height: 1.65; }
h1 { font-family: var(--display); font-size: clamp(56px, 6vw, 88px); text-align: center; color: var(--burgundy); }
h1 em { font-style: italic; }
.hero { padding: 160px 0 80px; max-width: 580px; margin: 0 auto; text-align: center; }
.chapter-num { font-family: var(--display); font-style: italic; color: var(--burgundy); margin-bottom: 32px; font-size: 18px; }
```

---

## MUSZĄ / NIE WOLNO

### MUSZĄ
- Display font: `Libre Caslon` (grep)
- Paleta: `#E8E0CF` parchment + `#6B1F1F` burgundy (grep oba)
- Min 1 `.drop-cap` albo `.chapter-rule`
- Centered hero (`text-align: center`)

### NIE WOLNO
- **Fonty:** NIE `Archivo Black`, NIE `IBM Plex`, NIE `Fraunces` (to DIFFERENT vibe), NIE `Caveat`
- **Layout:** NIE bento, NIE dashboardy, NIE full-bleed color sekcji, NIE centered w stylu startupu (centered to tu tradycja, nie clean centering)
- **Elementy:** NIE stickers, NIE charts, NIE oversized italic numeral „Nº" (§ zamiast)
- **Motion:** wszystkie JS effects poza fade-in ZAKAZANE

---

## Podobne style

- [`editorial-print.md`](./editorial-print.md) — Editorial to Fraunces + Nº + paper/ink/gold — magazine luxury. Dark Academia to Caslon + § + parchment/burgundy — old bookshop.
- [`japandi-serenity.md`](./japandi-serenity.md) — Japandi jest bright paper + Noto Serif + wabi-sabi. Dark Academia jest parchment + Caslon + formal.
- [`cottagecore-botanical.md`](./cottagecore-botanical.md) — Cottagecore ma ilustracje botaniczne. Dark Academia jest tekstowe, bez ornamentów.

## Changelog
- 2026-04-23 utworzony, v4.0
