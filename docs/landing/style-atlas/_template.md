# [Nazwa stylu] — [tagline w 1 zdaniu]

> **Przykład:** `Apothecary Label — uczciwa etykieta składu zamiast magazynu lifestylowego.`

## 1. Product DNA profil

Wymiar po wymiarze (dokładnie te wartości, zgodnie ze schematem 7×3 z `README.md`):

- **Utility ↔ Ritual:** utility / dual / ritual
- **Precision ↔ Expression:** precision / balanced / expression
- **Evidence ↔ Feeling:** evidence / blend / feeling
- **Solo ↔ Community:** solo / dual / community
- **Quiet ↔ Loud:** quiet / moderate / loud
- **Tradition ↔ Future:** tradition / present / future
- **Intimate ↔ Public:** intimate / social / public

### DNA Anchors — 3 produkty które ten styl obsłużyłby
Konkretne produkty (realne marki lub przykłady) — uzasadnienie że styl NIE jest za szeroki:
1. [produkt/marka] — [dlaczego pasuje]
2. [produkt/marka] — j.w.
3. [produkt/marka] — j.w.

## 2. Kategorie produktów (3-5)
Do których pasuje najlepiej — konkretne nazwy segmentów.

## 3. Real-world refs (3-5 marek)
**SPOZA landing-pages/**. Konkretne marki industry, co konkretnie pożyczamy.

## 4. Font stack

> ⚠️ PL safety: sprawdź renderowanie Ł/Ś/Ć/Ź/Ż/Ń/Ó w UPPERCASE na frazie `ZAMÓW ŁÓŻKO ŻYCIE`.

- **Display:** [nazwa] (weights) — [dlaczego]
- **Body:** [nazwa] (weights)
- **Mono / Accent:** [nazwa] (opcjonalny)

Link Google Fonts (BEZ `&subset=latin-ext`):
```html
<link href="https://fonts.googleapis.com/css2?family=[...]&display=swap" rel="stylesheet">
```

## 5. Paleta (60/30/10)

| Rola | Nazwa | Hex | Gdzie |
|------|-------|-----|-------|
| Dominant 60% | | `#______` | |
| Secondary 30% | | `#______` | |
| Accent 10% | | `#______` | |
| Support 1 | | `#______` | |
| Support 2 | | `#______` | |

**Filozofia koloru:** [1 zdanie — monochrome/duotone/poly, warm/cool/neutral, co robi emocjonalnie]

## 6. Layout DNA

Jedno z (wybierz 1):
- Editorial column · Grid Swiss · Canvas asymmetric · Collage/Zine · Stack dense · Dashboard · Panorama wide · Poster bold

## 7. Signature primitives (3-5)

### Primitive 1-5: [nazwa, opis, HTML, CSS]

---

## 8. Section Architecture (NOWE — v4)

**Minimum sekcji:** [N — np. 10 z 14 available]

### Wymagane sekcje (obligatoryjne)
Lista nazw sekcji + klasa CSS + typ. Ordering też ma znaczenie.

```yaml
required:
  - Header                 # .header
  - Mobile Menu            # .mobile-menu
  - Hero                   # .hero z signature primitive 1
  - [Sekcja stylu X]       # .[class] — konkretna per styl
  - Features               # .[typ] — per styl (tabela/bento/chart/poster)
  - How It Works           # .how-it-works (3 steps)
  - Comparison             # .comparison — typ per styl
  - Testimonials           # .testimonials — typ per styl
  - FAQ                    # .faq (5-7 pytań)
  - Offer                  # .offer
  - Footer                 # <footer>
```

### Dozwolone ale opcjonalne
```yaml
optional:
  - Trust Bar              # może być ZAMIAST .sec-meta w Apothecary
  - Problem                # niektóre style go nie mają (np. pure utility)
  - Final CTA Banner       # wymienne z Hero
  - Sticky CTA Mobile      # .sticky-cta
```

### Zakazane w tym stylu
```yaml
forbidden:
  - [konkretna sekcja]     # dlaczego nie pasuje
```

## 9. Allowed Variants (NOWE — v4)

> Z [`../reference/section-variants.md`](../reference/section-variants.md). Nie wszystkie 10+6+6 wariantów pasują do każdego stylu. Wybór Claude'a LIMITED do listy niżej.

```yaml
hero_allowed: [H1, H5, H8, ...]       # z 10 opcji
hero_forbidden: [H2, H7, H9, ...]     # dlaczego nie pasują (komentarz)

features_allowed: [F1, F3, ...]       # z 6 opcji
features_forbidden: [F2, F4, F5, F6]  # dlaczego

testimonials_allowed: [T2, T5]        # z 6 opcji
testimonials_forbidden: [T1, T3, T4, T6]
```

Default (jeśli pierwsza reguła z drzewa decyzyjnego w section-variants.md trafia w forbidden) → weź **pierwszy z allowed** w kolejności z listy.

## 10. Motion Budget (NOWE — v4)

**Level:** still / subtle / moderate / expressive

```yaml
js_effects_required:
  - .fade-in               # zawsze wymagany
  - [inne specyficzne per styl]

js_effects_forbidden:
  - .js-split              # np. Apothecary: split-char za editorial
  - .js-parallax           # np. Swiss Grid: bez parallax

js_effects_count:
  magnetic_min: 0          # niektóre style wyłączają magnetic
  counter_min: 1           # minimum counter'ów (np. dla Clinical Kitchen 3)
  tilt_min: 0
  parallax_min: 0
```

## 11. Copy Voice

- **Register:** [formal/casual/technical/manifesto/...]
- **Sentence length:** short/medium/long (z konkretnymi liczbami słów)
- **Person:** 2-osoba / bezosobowo
- **Allowed power words:** [lista konkretnych — np. tylko evidence-based]
- **Forbidden power words:** [lista, np. „premium", „luxury", „nasz"]

## 12. Example Snippet (hero + feature)

```html
<!-- Hero -->
<section class="hero">...</section>
<!-- Feature -->
<section class="features">...</section>
```

```css
:root {
  --display: '[font]';
  --body: '[font]';
  --primary: #[hex];
  --ink: #[hex];
  --paper: #[hex];
}
/* core styles */
```

---

## MUSZĄ / NIE WOLNO — Style Lock (grep-sprawdzalne)

### MUSZĄ być użyte
- Display font: `[konkretna nazwa]` w `font-family`
- Body font: `[nazwa]`
- Paleta: min 3 z 5 hex-ów z sekcji 5
- Layout DNA z sekcji 6 (konkretny wzorzec CSS)
- Signature primitive #1 obecny (grep class/struktura)
- Section architecture z sekcji 8 (min N sekcji)

### NIE WOLNO użyć
- Fonty: NIE `[lista]`
- Layout: NIE `[konkretne wzorce]`
- Kolory: NIE `[konkretne hex]`
- Elementy: NIE `[lista — oversized italic, Nº eyebrow, bento 2×2, etc.]`
- Sekcje: NIE `[zakazane typy]`

---

## Podobne style (ale RÓŻNE)

- [`inny-styl.md`](./inny-styl.md) — różni się tym że [konkret]

## Changelog
- [YYYY-MM-DD] utworzony
