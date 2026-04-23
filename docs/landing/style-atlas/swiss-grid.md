# Swiss Grid — modułowy Helvetica, lewa krawędź, zero ornamentu

## 1. Product DNA profil
- Utility↔Ritual: **utility** · Precision↔Expression: **precision** · Evidence↔Feeling: **evidence**
- Solo↔Community: **solo** · Quiet↔Loud: **quiet** · Tradition↔Future: **present** · Intimate↔Public: **public**

### DNA Anchors
1. **Vitsoe 606 shelf** — utility, precision, evidence. Półka ma być półką.
2. **IBM ThinkPad** — utility, precision, evidence. Zero decoration.
3. **Braun HL70 fan** — utility, precision, tradition (Dieter Rams legacy).

## 2. Kategorie produktów
- Modular office/home (półki, akcesoria, organizacja)
- Computing/tech hardware (laptopy, monitory, audio)
- Narzędzia warsztatowe (precyzja: miary, klucze, noże)
- Architektura/urbanistyka produkty
- Książki/dokumenty/typografia

## 3. Real-world refs
- **Vitsoe** — Helvetica Now + 12-col grid + minimal imagery
- **Helvetica Now specimens** — pure typography showcase
- **Muji (tech side)** — grid precision dla elektroniki
- **Dieter Rams / Braun documentation** — left-aligned, no curves
- **IBM design archives** — Plex Sans + modular info

## 4. Font stack

- **Display:** `Helvetica Neue` fallback `Inter` 500/600 — swiss archetype
- **Body:** `Inter` 400/500 — jako body i sub
- **Mono (opcjonalny):** `Inter Tight` 500 dla spec labels

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@500;600&display=swap" rel="stylesheet">
```

## 5. Paleta

| Rola | Nazwa | Hex | Gdzie |
|------|-------|-----|-------|
| Dominant 60% | Pure White | `#FFFFFF` | tło |
| Secondary 30% | Absolute Black | `#000000` | tekst, CTA |
| Accent 10% | [brand primary] lub Signal Red | `#E11D2A` | 1 highlight per sekcja |
| Support 1 | Grid Gray | `#707070` | secondary text |
| Support 2 | Rule Gray | `#DADADA` | cienkie border lines |

**Filozofia:** czysta czerń + biel + 1 kolor signal. Zero gradient, zero cieni, zero texture. Typografia i grid robią pracę.

## 6. Layout DNA

**Grid Swiss** — strict 12-col modular grid. Wszystko lewe-wyrównane. Cienkie linie 1px dzielą moduły. Hierarchia przez wielkość, nie kolor. Brak centering poza wyjątkami.

## 7. Signature primitives

### Primitive 1: 12-col grid z widocznymi rule lines
```css
.grid-swiss { display: grid; grid-template-columns: repeat(12, 1fr); gap: 24px; }
.grid-swiss > * { border-top: 1px solid var(--rule); padding-top: 16px; }
```

### Primitive 2: Left-aligned oversized headings
`font-size: 64-120px`, `font-weight: 500`, `letter-spacing: -0.03em`, ZAWSZE lewe, bez italic.

### Primitive 3: Index-style navigation
Zamiast top nav → lista pionowa po lewej („01 · Produkt", „02 · Funkcje", „03 · Oferta") z grubą linią na hover.

### Primitive 4: Footnote-driven meta
Każdy claim oznaczony `[01]`, `[02]` z odniesieniem na dole.

### Primitive 5: Info Box (ramka 1px z surovym typem)
```html
<aside class="info-box">
  <div class="info-box-label">SPEC · 2026</div>
  <p>1500 W, 3 bar, 15 s, 350 ml</p>
</aside>
```

---

## 8. Section Architecture

**Minimum sekcji:** 10

```yaml
required:
  - Header (minimalist, left brand name only)
  - Mobile Menu
  - Hero (grid 12-col, oversized left heading)
  - Info Box Panel (spec ramka zamiast trust bar)
  - Features (grid 12-col, 4-6 modułów)
  - How It Works (3 numbered rows)
  - Spec Table (tabelaryczne, monospace)
  - Comparison (tabela 2-col, strict)
  - Offer (left-aligned, NIE centered)
  - Footer (grid 12-col)

optional:
  - Problem (tylko gdy potrzebne, left heading)
  - Testimonials (1 pullquote z pionową linią)

forbidden:
  - Centered hero
  - Poster full-bleed color
  - Bento 2×2 z zaokrągleniami
  - Sticker badges
  - Gradient backgrounds
```

## 9. Allowed Variants

```yaml
hero_allowed: [H1, H5, H8]
hero_forbidden: [H2, H3, H4, H6, H7, H9, H10]
# H1 Split klasyczny — base
# H5 Oversized typography — left-aligned
# H8 Split z ceną — OK (spec + cena)

features_allowed: [F3, F1]
features_forbidden: [F2, F4, F5, F6]
# F3 Linear stack — native match
# F1 Bento 2×2 OK tylko bez zaokrągleń (border-radius: 0)

testimonials_allowed: [T5]
testimonials_forbidden: [T1, T2, T3, T4, T6]
# T5 Single hero z pionową linią — jedyny acceptable
```

## 10. Motion Budget

**Level:** still

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
  magnetic_min: 0
  tilt_min: 0
  parallax_min: 0
```

## 11. Copy Voice

- **Register:** objective + dokumentalny (jak białystok manual)
- **Sentence length:** short (6-14 słów)
- **Person:** 3-osoba, bezosobowo
- **Allowed:** spec labels (1500 W, 3 bar, 15 s), numerowane claim'y z przypisami
- **Forbidden:** wszystkie power words, metafory, adjectives subjective („piękny", „elegancki")

## 12. Example Snippet

```html
<section class="hero grid-swiss">
  <div class="col-span-8">
    <h1>Parownica. <br>1500 W.<br>15 s.</h1>
    <p class="hero-body">Skład: H<sub>2</sub>O. Nic więcej.<sup>[01]</sup></p>
    <a href="#offer" class="btn-swiss">Zamów / 599 zł</a>
  </div>
  <div class="col-span-4">
    <aside class="info-box">
      <div class="info-box-label">SPEC — 2026</div>
      <dl>
        <dt>Moc</dt><dd>1500 W</dd>
        <dt>Ciśnienie</dt><dd>3 bar</dd>
        <dt>Zbiornik</dt><dd>350 ml</dd>
      </dl>
    </aside>
  </div>
</section>
```

```css
:root {
  --display: 'Helvetica Neue', 'Inter', system-ui, sans-serif;
  --body: 'Inter', sans-serif;
  --paper: #FFFFFF;
  --ink: #000000;
  --accent: #E11D2A;
  --rule: #DADADA;
  --gray: #707070;
}
body { font-family: var(--body); background: var(--paper); color: var(--ink); }
.grid-swiss { display: grid; grid-template-columns: repeat(12, 1fr); gap: 24px; }
.col-span-8 { grid-column: span 8; }
.col-span-4 { grid-column: span 4; }
h1 { font-family: var(--display); font-size: clamp(64px, 9vw, 140px); font-weight: 500; letter-spacing: -0.03em; line-height: 0.95; text-align: left; }
.btn-swiss { display: inline-block; padding: 14px 0; border-bottom: 2px solid var(--ink); font-weight: 600; font-size: 14px; letter-spacing: 0.04em; }
.info-box { border: 1px solid var(--ink); padding: 24px; }
.info-box-label { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 16px; }
```

---

## MUSZĄ / NIE WOLNO

### MUSZĄ
- Display: `Helvetica` OR `Inter` w font-family
- Tło body: `#FFFFFF` (pure white, nie cream)
- Grid 12-col widoczny (grep `grid-template-columns: repeat(12, 1fr)`)
- Min 3 sekcje left-aligned (`text-align: left` lub brak `text-align: center`)
- `border-radius: 0` dla cards/tiles

### NIE WOLNO
- **Fonty:** NIE `Fraunces`, NIE `Playfair`, NIE `Archivo Black`, NIE `Caveat`, NIE `Cormorant`
- **Layout:** NIE centered hero, NIE full-bleed color
- **Elementy:** NIE stickers, NIE badges owalne, NIE hover shadows
- **Kolory:** NIE gradient tła, NIE warm cream, NIE gold
- **Motion:** NIE split-char, NIE parallax, NIE magnetic, NIE tilt

---

## Podobne style

- [`clinical-kitchen.md`](./clinical-kitchen.md) — Clinical ma charts/dashboardy. Swiss ma strict typography-only grid.
- [`apothecary-label.md`](./apothecary-label.md) — Apothecary ma label metaforę + warm undertone. Swiss jest pure white + left-aligned typography.
- [`brutalist-diy.md`](./brutalist-diy.md) — Brutalist używa Times New Roman + raw. Swiss jest Helvetica + dyscyplina.

## Changelog
- 2026-04-23 utworzony, v4.0
