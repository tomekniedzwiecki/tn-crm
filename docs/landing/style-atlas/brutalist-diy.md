# Brutalist DIY — Times New Roman, raw borders, zin-like kolaż

## 1. Product DNA profil
- Utility↔Ritual: **dual** · Precision↔Expression: **expression** · Evidence↔Feeling: **blend**
- Solo↔Community: **solo** · Quiet↔Loud: **loud** · Tradition↔Future: **present** · Intimate↔Public: **public**

### DNA Anchors
1. **Readymag templates** — raw HTML aesthetic, bez zaokrągleń, Times New Roman
2. **Are.na** — link library aesthetic, grayscale + monospace
3. **Cash App (2018)** — bold flat + raw grid (before rebrand)

## 2. Kategorie produktów
- Indie software/SaaS alternatywy
- Zine-like publishing, books, niezależne media
- Art supplies, creative tools, DIY kits
- Underground music/events
- Subversive health (psilocybin adjacent, CBD indie)

## 3. Real-world refs
- **Are.na** — Times New Roman + grey + subtle hover
- **Craigslist** — raw functional aesthetic (updated)
- **Readymag case studies** — experimental web
- **Village Voice 1980s** — zin print aesthetic

## 4. Font stack

- **Display:** `Times New Roman` (system fallback `Georgia`) — statement brutalist
- **Body:** `Inter` lub system `Arial` — neutralne body
- **Mono:** `Courier New` — raw aesthetic

```html
<!-- brak Google Fonts potrzebnych; używamy system -->
<style>body { font-family: 'Inter', Arial, sans-serif; } h1, h2, h3 { font-family: 'Times New Roman', Georgia, serif; }</style>
```

## 5. Paleta

| Rola | Nazwa | Hex | Gdzie |
|------|-------|-----|-------|
| Dominant 60% | Raw Paper | `#F5F3EE` | tło |
| Secondary 30% | Print Black | `#000000` | tekst, borders |
| Accent 10% | Primary Red | `#FF0000` albo [brand] | ostrzeżenia, call-out |
| Support 1 | Primary Blue | `#0000FF` | link default |
| Support 2 | Primary Yellow | `#FFFF00` | highlight text |

**Filozofia:** RGB primaries na raw paper. Zero gradient, zero polish. Underline na linkach zawsze.

## 6. Layout DNA

**Collage/Zine** — elementy nachodzące na siebie, rotacje ±2-5°, asymetria celowa. Borders 2-3px solid black bez radius. Underline linki.

## 7. Signature primitives

### Primitive 1: Rotated stickers/callouts
Elementy obrócone ±3°, jakby naklejone.

```css
.sticker-callout { border: 2px solid black; padding: 12px 20px; background: yellow; transform: rotate(-2deg); font-family: 'Times New Roman', serif; font-size: 22px; display: inline-block; }
```

### Primitive 2: Raw Times New Roman huge headings
```css
h1 { font-family: 'Times New Roman', serif; font-size: clamp(64px, 10vw, 160px); font-weight: 400; line-height: 0.95; letter-spacing: -0.01em; }
h1 em { font-style: italic; }
```

### Primitive 3: Underlined links only (zero styling)
`a { color: blue; text-decoration: underline; }` nothing more.

### Primitive 4: Photo-copy style images
Obrazy z efektem grayscale/high-contrast, jakby z xero. CSS filter.

```css
.xerox-img { filter: grayscale(1) contrast(1.4); }
```

### Primitive 5: Asymmetric overlapping sekcje
Sekcje bez grids — divy pozycjonowane absolute z z-index nakładaniem.

---

## 8. Section Architecture

**Minimum sekcji:** 8

```yaml
required:
  - Header (raw brand name + linki underlined)
  - Mobile Menu
  - Hero (times new roman huge + rotated sticker)
  - Manifesto Block (pojedynczy akapit z borders)
  - Features (listy ze `-` i `*`, nie bento)
  - Offer (raw card z border 3px black)
  - Footer (raw copyright)

optional:
  - How It Works (rotated numbered cards)
  - Testimonials (handwriting-like: raw quote z borderem)
  - FAQ (bold Q/A bez collapse)

forbidden:
  - Bento 2×2 z zaokrągleniami
  - Gradient tła
  - Trust Bar z kolorowymi ikonami
  - Subtle hover shadows
```

## 9. Allowed Variants

```yaml
hero_allowed: [H5, H1]
hero_forbidden: [H2, H3, H4, H6, H7, H8, H9, H10]
# H5 Oversized typography — native (Times New Roman huge)
# H1 fallback

features_allowed: [F3]
features_forbidden: [F1, F2, F4, F5, F6]

testimonials_allowed: [T5, T4]
testimonials_forbidden: [T1, T2, T3, T6]
# T4 UGC wall — raw grid
# T5 Single hero — raw quote
```

## 10. Motion Budget

**Level:** still albo moderate z wobble

```yaml
js_effects_required:
  - .fade-in

js_effects_forbidden:
  - .js-split
  - .js-parallax
  - .magnetic
  - .js-tilt

js_effects_count:
  counter_min: 0
  wobble_min: 1          # stickers można wobble hover
```

## 11. Copy Voice

- **Register:** raw + punk + honest
- **Sentence length:** short (5-12 słów)
- **Person:** 1-2 osoba mieszane, czasem 3-osoba komunikat
- **Allowed:** wulgarne PL („cholernie dobre"), fragmenty zdań, pauzy
- **Forbidden:** korporacyjne, „premium", „luxury", jakiekolwiek „nasz"

## 12. Example Snippet

```html
<section class="hero">
  <h1>Skład: H<sub>2</sub>O.<br><em>Koniec pytań.</em></h1>
  <div class="sticker-callout">TYLKO WODA. SERIO.</div>
  <p>Parownica. 1500 W. 15 s. <a href="#offer">→ Zamów za 599 zł</a></p>
</section>
```

```css
body { font-family: 'Inter', Arial, sans-serif; background: #F5F3EE; color: #000; }
h1, h2 { font-family: 'Times New Roman', Georgia, serif; font-weight: 400; line-height: 0.95; }
h1 { font-size: clamp(64px, 10vw, 160px); }
a { color: #0000FF; text-decoration: underline; }
.sticker-callout { border: 2px solid #000; padding: 12px 20px; background: #FFFF00; transform: rotate(-2deg); font-size: 22px; display: inline-block; margin: 24px 0; }
.hero { padding: 120px 40px; max-width: 1100px; margin: 0 auto; }
```

---

## MUSZĄ / NIE WOLNO

### MUSZĄ
- Display font: `Times New Roman` lub `Georgia` w h1/h2 (grep)
- `border-radius: 0` dla cards
- Underline na linkach (grep `text-decoration: underline`)
- Min 1 rotated element (primitive 1) — `transform: rotate(`

### NIE WOLNO
- **Fonty:** NIE `Fraunces`, `Cormorant`, `IBM Plex`, `Archivo Black` w h1 (bo używamy Times)
- **Layout:** NIE bento z zaokrągleniami, NIE gradients
- **Elementy:** NIE subtle shadows, NIE polished cards, NIE linen cream
- **Motion:** NIE split, parallax, tilt, magnetic

---

## Podobne style

- [`poster-utility.md`](./poster-utility.md) — Poster Utility to refined bold z Archivo Black. Brutalist to raw Times New Roman.
- [`swiss-grid.md`](./swiss-grid.md) — Swiss jest dyscyplina + Helvetica. Brutalist jest chaos + Times.
- [`retro-futuristic.md`](./retro-futuristic.md) — RF ma neon + dark. Brutalist ma RGB primaries + raw paper.

## Changelog
- 2026-04-23 utworzony, v4.0
