# Japandi Serenity — cisza między dwoma dyscyplinami (japońska + skandynawska)

## 1. Product DNA profil
- Utility↔Ritual: **ritual** · Precision↔Expression: **precision** · Evidence↔Feeling: **feeling**
- Solo↔Community: **solo** · Quiet↔Loud: **quiet** · Tradition↔Future: **tradition** · Intimate↔Public: **intimate**

### DNA Anchors
1. **Muji stationery** — ritual, precision, quiet, intimate. Zeszyt jako przedmiot do medytacji.
2. **Snow Peak titanium cup** — ritual, precision, tradition. Kubek jako artefakt codziennego rytuału.
3. **Hay Copenhagen chair** — ritual, precision, tradition + scandinavian.

## 2. Kategorie produktów
- Ceramika, drewniane akcesoria, tekstylia lniane
- Herbata (Japońska/Tajwańska), kawa rzemieślnicza
- Pielęgnacja skóry minimalistyczna (1-5 składników)
- Akcesoria do medytacji/yogi/rytuałów
- Home goods premium handmade

## 3. Real-world refs
- **Muji** — paper tones + minimal signage + centered pionowe layouts
- **Snow Peak** — outdoor serenity + off-white + titanium accents
- **Hay** — color blocks miękkie + geometric sans + pastel
- **Kinfolk magazine** — pionowa kolumna + dużo pustki + foto w cieniu
- **Tekla linen** — tekstury + pastele ziemi + ciasne Fraunces italic

## 4. Font stack

- **Display:** `Noto Serif JP` 400/500 LUB `Tenor Sans` 400 (jeśli serif jest ryzykowny — Tenor Sans jest serif-adjacent sans)
- **Body:** `Inter` 400/500 — czytelny, neutralny
- **Accent:** `Noto Serif` 400 italic dla 2-3 akcentów per strona

```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500&family=Tenor+Sans&display=swap" rel="stylesheet">
```

## 5. Paleta

| Rola | Nazwa | Hex | Gdzie |
|------|-------|-----|-------|
| Dominant 60% | Paper Pearl | `#F4F1EA` | tło wszystkich sekcji |
| Secondary 30% | Sumi Ink | `#1A1A17` | tekst body |
| Accent 10% | [brand] lub Moss Soft | `#95A182` | pojedyncze akcenty natury |
| Support 1 | Stone Warm | `#CFC7B8` | dividers, borders soft |
| Support 2 | Clay Blush | `#D6AD96` | 1 ciepła akcenta per sekcja |

**Filozofia:** monochrome paper + 1 natural accent (mchu/gliny). Zero gold. Zero neon. Cień zamiast line.

## 6. Layout DNA

**Editorial column** — pionowa centralna kolumna max 640px body. Dużo whitespace (padding sekcji 160-200px). Asymetria w obrazach — obraz nie jest nigdy centered, zawsze z lekkim offset.

## 7. Signature primitives

### Primitive 1: Negative-space dominanta
Sekcja z 70% pustki, 30% contentu. Tekst w jednej kolumnie zwężonej, obraz w drugiej z dużym marginesem.

### Primitive 2: Vertical line dividers
Zamiast horizontalnych linii — pionowe kreski po lewej stronie akapitu jako ornament.

```css
.pull-quote { border-left: 1px solid var(--stone-warm); padding-left: 32px; margin-left: 0; font-family: var(--display); font-style: italic; font-size: 22px; }
```

### Primitive 3: Image with breathable margin
Obrazy nigdy full-bleed. Zawsze z pad 40-80px ze wszystkich stron, w paperze.

### Primitive 4: Wabi-sabi timestamp
Mała metka np. „mokuyōbi · czwartek · 14:02" jako eyebrow — nadaje charakter „momentu". Inter mono-like uppercase.

### Primitive 5: Asymmetric product photo
Produkt zawsze z lewej albo prawej 45% viewportu, pozostałe 55% — pustka z małym tekstem w rogu.

---

## 8. Section Architecture

**Minimum sekcji:** 8 (z 13 — celowo mniej)

```yaml
required:
  - Header (minimalistyczny, zero CTA button w headerze)
  - Mobile Menu
  - Hero (z primitive 1 negative-space)
  - Manifesto (zamiast trust-bar) - 1 zdanie na sekcji z pionową linią
  - Features as linear stack (3 only, nie 4)
  - How It Works (3 kroki w pionowej linii, nie grid)
  - Offer (minimalne, pionowo centered)
  - Footer

optional:
  - Problem (tylko gdy potrzebne)
  - Testimonials (1 cytat max)
  - FAQ (krótkie, 4-5 pytań)

forbidden:
  - Trust Bar z ikonami
  - Bento 2×2
  - Comparison table
  - Social proof marquee
  - Sticky CTA mobile (psuje minimalizm)
```

## 9. Allowed Variants

```yaml
hero_allowed: [H6, H2, H1]
hero_forbidden: [H3, H4, H5, H7, H8, H9, H10]
# H6 Persona portrait — może (warm close-up)
# H2 Full-bleed lifestyle — OK z breathable margin

features_allowed: [F3]
features_forbidden: [F1, F2, F4, F5, F6]
# F3 Linear stack — JEDYNY wariant pasujący (pionowy rytm)

testimonials_allowed: [T5]
testimonials_forbidden: [T1, T2, T3, T4, T6]
# T5 Single hero — JEDYNY (cichy pojedynczy głos)
```

## 10. Motion Budget

**Level:** still

```yaml
js_effects_required:
  - .fade-in              # OK, ale delikatne

js_effects_forbidden:
  - .js-split
  - .js-parallax
  - .magnetic
  - .js-tilt
  - .js-counter           # liczby wyskakujące psują ciszę

js_effects_count:
  counter_min: 0          # ZAKAZ liczników
  tilt_min: 0
  parallax_min: 0
```

## 11. Copy Voice

- **Register:** poetic + quiet
- **Sentence length:** short-medium (8-15 słów), jedna myśl per zdanie
- **Person:** bezosobowo (rzadko Ty)
- **Allowed:** konkrety sensoryczne („lniane", „gliniane", „poranne")
- **Forbidden:** power words, „nasz", liczby z unitami w copy (liczby tylko w spec), metafory emocji

## 12. Example Snippet

```html
<section class="hero">
  <div class="hero-eyebrow">mokuyōbi · czwartek · 14:02</div>
  <h1>Czajnik <em>przy świetle</em><br>porannego okna.</h1>
  <p class="hero-body">350 ml wody. Jedna czynność.<br>Początek dnia bez pytań.</p>
</section>
```

```css
:root {
  --display: 'Noto Serif', Georgia, serif;
  --body: 'Inter', sans-serif;
  --paper: #F4F1EA;
  --ink: #1A1A17;
  --accent: #95A182;
  --stone: #CFC7B8;
}
body { font-family: var(--body); background: var(--paper); color: var(--ink); }
.hero { padding: 200px 0 160px; }
.hero-eyebrow { font-family: var(--body); font-size: 12px; letter-spacing: 0.22em; color: var(--ink); opacity: 0.6; margin-bottom: 40px; }
h1 { font-family: var(--display); font-size: clamp(40px, 4.5vw, 64px); font-weight: 400; line-height: 1.2; max-width: 560px; }
h1 em { font-style: italic; color: var(--accent); }
```

---

## MUSZĄ / NIE WOLNO

### MUSZĄ
- Display: `Noto Serif` lub `Tenor Sans` w `font-family`
- Padding sekcji ≥ `140px 0` (sparse)
- Max 8-10 sekcji (NIE 14)
- Tło: `#F4F1EA` lub podobne paper — min 5 sekcji

### NIE WOLNO
- **Fonty:** NIE `Fraunces` (za expressive), NIE `Archivo Black`, NIE `IBM Plex*`, NIE `Caveat`
- **Layout:** NIE bento, NIE dashboardy, NIE poster full-bleed
- **Elementy:** NIE oversized italic numeral, NIE chart bars, NIE stickers, NIE js-counter
- **Kolory:** NIE pure #FFFFFF (cooler paper), NIE neon, NIE gold bright
- **Motion:** NIE `.js-split`, NIE `.js-parallax`, NIE `.magnetic`, NIE `.js-counter`, NIE `.js-tilt`

---

## Podobne style (ale RÓŻNE)

- [`organic-natural.md`](./organic-natural.md) — Organic jest warm green + wellness. Japandi jest cold paper + ritual quiet.
- [`dark-academia.md`](./dark-academia.md) — Dark Academia jest burgundy + caslon + book-vibe. Japandi jest bright paper + noto + wabi-sabi.
- [`cottagecore-botanical.md`](./cottagecore-botanical.md) — Cottagecore ma botaniczne ornamenty. Japandi jest NIE-ornamentalne, puste.

## Changelog
- 2026-04-23 utworzony, v4.0
