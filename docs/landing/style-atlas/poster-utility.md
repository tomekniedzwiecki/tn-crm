# Poster Utility — bold DTC manifesto z oversized statement typography

## 1. Product DNA profil
- **Utility ↔ Ritual:** utility
- **Precision ↔ Expression:** expression
- **Evidence ↔ Feeling:** feeling
- **Solo ↔ Community:** community
- **Quiet ↔ Loud:** loud
- **Tradition ↔ Future:** present
- **Intimate ↔ Public:** public

### DNA Anchors
1. **Liquid Death woda w puszce** — utility + expression + loud + public. Woda sprzedawana jak piwo metalowe.
2. **Graza olive oil** — utility, expression, loud. Oliwa jak poster z mojego ulubionego kina.
3. **HU Kitchen chocolate** — utility, expression, feeling, public. Czekolada jako manifesto.

## 2. Kategorie produktów
- DTC beverage/food bold branding (woda, oleje, herbaty)
- Supplement/performance (shake'i, batony, proteiny)
- Everyday-hero household (parownice, mopy jako manifesto)
- Snack/functional food (chipsy, przekąski rzemieślnicze)
- Pet food z charakterem

## 3. Real-world refs
- **Liquid Death** — oversized „Murder Your Thirst", metal aesthetic + utility, meme-adjacent
- **Graza** — Sierra Madre olive oil: bold „Sizzle"/„Drizzle" posters, primary colors
- **Athletic Greens** — hero z dużym statement'em „One scoop. 75 vitamins."
- **HU Kitchen** — „Get back to human" poster typography
- **Omsom** — Asian pantry DTC: bold packaging jako web aesthetic

## 4. Font stack

- **Display:** `Archivo Black` (900) — poster weight, oversized. Bulletproof PL.
- **Body:** `Inter` 400/500/600 — czytelność 15-17px
- **Mono:** `JetBrains Mono` 500 — fine print, meta

```html
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
```

## 5. Paleta (60/30/10)

| Rola | Nazwa | Hex | Gdzie |
|------|-------|-----|-------|
| Dominant 60% | [brand primary] | brand | hero bg, 1-2 sekcje full-bleed |
| Secondary 30% | Off-white Canvas | `#F4EFE4` | sekcje body |
| Accent 10% | Ink Deep | `#111216` | tekst body, sekcje ciemne |
| Support 1 | [brand secondary] | brand | 1-2 sekcje kontrastowe |
| Support 2 | Black | `#000000` | CTA, divider strong |

**Filozofia koloru:** polychrome bold. Brand color wypełnia tło 100% w 1-2 sekcjach (full-bleed), nie ukrywa się jako 10% akcent.

## 6. Layout DNA

**Poster bold** — pełnoekranowe statement'y. Sekcja = plakat z jednym dominującym sloganem w `Archivo Black 120-240px`. Full-bleed kolorowe bloki naprzemiennie.

## 7. Signature primitives

### Primitive 1: Oversized statement hero
```html
<section class="hero-poster">
  <h1>H<sub>2</sub>O.<br>To wszystko.</h1>
  <p class="hero-sub">1500 W, 3 bary, zero chemii.</p>
  <a href="#offer" class="btn-poster">Weź — 599 zł →</a>
</section>
```
```css
.hero-poster { background: var(--primary); color: var(--paper); min-height: 90vh; display: flex; flex-direction: column; justify-content: center; padding: 80px; }
.hero-poster h1 { font-family: var(--display); font-size: clamp(80px, 15vw, 220px); font-weight: 900; line-height: 0.9; letter-spacing: -0.04em; text-transform: uppercase; }
```

### Primitive 2: Full-bleed color claim sekcje
Sekcje na przemian: brand color 100% szerokości, jeden gigantyczny claim.

```html
<section class="poster-claim" style="--bg: var(--primary);">
  <h2>15 sek.<br><em>Koniec.</em></h2>
</section>
```

### Primitive 3: Spec chips (zamiast tables)
Feature jako pill-chip z liczbą + label, jak stickery.

```html
<ul class="spec-chips">
  <li><strong>1500 W</strong>moc</li>
  <li><strong>3 BARY</strong>ciśnienie</li>
</ul>
```

### Primitive 4: Meme-adjacent short copy
Krótkie, 3-5 słów: „Spoiler: para wygrywa.", „H₂O. Nudny skład. Ekscytujący efekt."

### Primitive 5: Sticker badges (rotated)
```html
<div class="sticker">BEZ<br>CHEMII</div>
```
```css
.sticker { position: absolute; top: 40px; right: 40px; background: var(--ink); color: var(--paper); border-radius: 50%; width: 140px; height: 140px; display: flex; align-items: center; justify-content: center; text-align: center; font-family: var(--display); font-size: 20px; font-weight: 900; line-height: 0.95; text-transform: uppercase; transform: rotate(-6deg); }
```

---

## 8. Section Architecture

**Minimum sekcji:** 10 (z 13 available)

```yaml
required:
  - Header
  - Mobile Menu
  - Hero Poster              # .hero-poster (primitive 1)
  - Spec Chips Strip         # .spec-chips (ZAMIAST trust bar)
  - Problem Poster           # .poster-claim (pełno-bleed)
  - Features Posters         # .poster-claim ×3-4 (ZAMIAST bento)
  - How It Works Posters     # bold 3 posters (nie ritual steps)
  - Comparison Bold          # pełno-bleed split (dark vs light)
  - Testimonials Posters     # big cards z jednym mocnym cytatem
  - FAQ
  - Offer Bold               # full-bleed primary
  - Final CTA Poster
  - Footer

optional:
  - Sticky CTA

forbidden:
  - Trust Bar subtle         # PT nie ma subtelnych trust strip
  - Editorial eyebrow „Nº"   # nigdy
```

## 9. Allowed Variants

```yaml
hero_allowed: [H5, H9, H10]
hero_forbidden: [H1, H2, H3, H4, H6, H7, H8]
# H5 Oversized typography — NATIVE match dla Poster
# H9 Video loop — OK jeśli cinematic
# H10 Before/After — OK dla transformation w bold stylu

features_allowed: [F5]
features_forbidden: [F1, F2, F3, F4, F6]
# F5 Horizontal scroll — karuzela kolorowych posterów
# Wszystkie inne są za subtle/tabelarne

testimonials_allowed: [T4, T5]
testimonials_forbidden: [T1, T2, T3, T6]
# T4 UGC wall — OK dla community DTC
# T5 Single hero — OK dla bold voice
```

## 10. Motion Budget

**Level:** expressive

```yaml
js_effects_required:
  - .fade-in
  - .js-split              # oversized statement char-by-char entry
  - [slide-in sekcji full-bleed]

js_effects_forbidden:
  - .js-parallax           # subtle parallax nie pasuje do bold posterów
  - .magnetic              # tilt jest za miękki, używamy wobble

js_effects_count:
  split_min: 1
  counter_min: 0           # niekoniecznie (poster statements > liczby)
  wobble_min: 1            # stickers mają wobble hover
  tilt_min: 0              # zakaz
```

## 11. Copy Voice

- **Register:** manifesto + casual + punchy
- **Sentence length:** VERY short (3-8 słów) na posterach, medium (10-15) body
- **Person:** 2-osoba, imperatywna („Weź", „Zamień", „Wymień")
- **Allowed power words:** „zero", „koniec", „dość", „wystarczy", „spoiler"
- **Forbidden:** „premium", „luxury", „nasz", „wysokiej jakości"

## 12. Example Snippet

```html
<section class="hero-poster">
  <h1 class="js-split">H<sub>2</sub>O.<br>To wszystko.</h1>
  <p class="hero-sub">1500 W, 3 bary, 15 sekund. Chemia? Nie ma jej tu.</p>
  <a href="#offer" class="btn-poster">Weź — 599 zł →</a>
  <div class="sticker">BEZ<br>CHEMII</div>
</section>

<section class="poster-claim" style="--bg:#3DB5C9">
  <h2>15 sek.<br><em>Koniec debaty.</em></h2>
  <ul class="spec-chips">
    <li><strong>1500 W</strong>moc</li>
    <li><strong>3 bary</strong>ciśnienie</li>
  </ul>
</section>
```

```css
:root {
  --display: 'Archivo Black', system-ui, sans-serif;
  --body: 'Inter', -apple-system, sans-serif;
  --primary: #3DB5C9;
  --paper: #F4EFE4;
  --ink: #111216;
}
body { font-family: var(--body); background: var(--paper); color: var(--ink); }
h1, h2 { font-family: var(--display); text-transform: uppercase; line-height: 0.9; letter-spacing: -0.03em; }
h2 em { font-style: normal; color: var(--ink); background: var(--paper); padding: 0 16px; display: inline-block; }
.btn-poster { display: inline-block; padding: 22px 40px; background: var(--ink); color: var(--paper); font-family: var(--display); font-size: 18px; letter-spacing: 0.04em; text-transform: uppercase; }
```

---

## MUSZĄ / NIE WOLNO — Style Lock

### MUSZĄ
- Display font: `Archivo Black` (grep)
- Hero h1 font-size ≥ 80px desktop (grep `font-size: clamp(80px` lub większe)
- Min 2 sekcje z brand primary jako background (grep `background: var(--primary)` lub konkretny hex)
- Min 1 sticker primitive
- Min 1 `.poster-claim` full-bleed

### NIE WOLNO
- **Fonty:** NIE `Fraunces`, `Cormorant`, `Playfair`, `Italiana`, `IBM Plex Sans`, `Caveat`
- **Layout:** NIE bento 2×2 dla features, NIE `.eyebrow`, NIE Nº numeracja
- **Elementy:** NIE oversized italic numeral w tle, NIE subtle hover shadows (`box-shadow: 0 4px...`)
- **Kolory:** NIE linen cream `#F6F3ED` dominant, NIE gold/brass accent
- **Motion:** NIE subtle fade-only — używaj expressive (split, slide, wobble)

---

## Podobne style (ale RÓŻNE)

- [`retro-futuristic.md`](./retro-futuristic.md) — RF jest dark+neon+glitch. Poster Utility jest bright+primary+bold.
- [`brutalist-diy.md`](./brutalist-diy.md) — Brutalist = Times New Roman + raw + DIY zine. Poster Utility = refined bold, graficzny.
- [`playful-toy.md`](./playful-toy.md) — Playful = Nunito rounded + delikatny. Poster Utility = sharp, hard edges.

## Changelog
- 2026-04-23 utworzony, v4.0
