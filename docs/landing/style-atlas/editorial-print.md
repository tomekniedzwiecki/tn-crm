# Editorial Print — Fraunces + Nº numeracja + paper/ink/gold (obecny „paromia")

> **Baseline:** [`landing-pages/paromia/`](../../../landing-pages/paromia/). Retrospektywa obecnego stylu żeby nowe landingi NIE replikowały go „przypadkiem".

## 1. Product DNA profil
- Utility↔Ritual: **ritual** · Precision↔Expression: **expression** · Evidence↔Feeling: **feeling**
- Solo↔Community: **solo** · Quiet↔Loud: **quiet** · Tradition↔Future: **tradition** · Intimate↔Public: **social**

### DNA Anchors
1. **Paromia wine/luxury** — ritual, expression, feeling, tradition
2. **Byredo fragrances** — ritual, expression, quiet, intimate
3. **Kinfolk magazine aesthetic** — ritual, feeling, quiet

## 2. Kategorie produktów
- Wino, whisky, premium beverages
- Perfumy luxury (niche house)
- Lifestyle home goods premium
- Jewelry heritage
- Hotele/resorty premium

## 3. Real-world refs
- **Kinfolk magazine** — centered serif + paper tones
- **Cereal magazine** — editorial layout, figcaption
- **Aesop** (original) — apothecary-editorial hybrid

## 4. Font stack
- **Display:** `Fraunces` 400/500 (italic enabled) — editorial serif
- **Body:** `Inter` 400/500 — neutral counterpart
- **Accent:** `Cormorant Garamond` 300 italic (eyebrow, Nº numbers)

## 5. Paleta
- Dominant: Paper `#F5F1EA`
- Secondary: Ink `#1A1A1F`
- Accent: Gold `#C9A961`
- Support: Slate 2 `#9A9AA2`

**Filozofia:** paper + ink + rare gold. 10% gold = luxury rzadkość.

## 6. Layout DNA
Editorial column + magazine page numbers Nº 01-10.

## 7. Signature primitives (charakterystyczne dla tego stylu)
1. Nº eyebrow (`Nº 03 — ATELIER`)
2. Oversized italic numeral w tle hero (Fraunces 280-440px)
3. Figure + figcaption pod hero
4. Magazine page numbers per sekcja
5. Dark trust strip z ikonami w kółkach

## 8. Section Architecture

**Minimum sekcji:** 14 (all standard)

```yaml
required: [Header, Mobile Menu, Hero, Trust Bar, Problem, Solution/Bento, How It Works, Comparison, Testimonials, FAQ, Offer, Final CTA, Footer, Sticky CTA]
```

## 9. Allowed Variants

```yaml
hero_allowed: [H4, H1, H2]
features_allowed: [F2, F1]
testimonials_allowed: [T5, T6, T1]
```

## 10. Motion Budget

**Level:** moderate

```yaml
js_effects_required: [.fade-in, .js-split, .js-parallax, .magnetic, .js-tilt, .js-counter]
js_effects_count: { split_min: 1, counter_min: 2, magnetic_min: 2, tilt_min: 2, parallax_min: 1 }
```

## 11. Copy Voice
- Register: editorial + poetic restrained
- Person: 2-osoba
- Italic em dla 1-2 słów per heading

## 12. Example Snippet
→ [`landing-pages/paromia/index.html`](../../../landing-pages/paromia/index.html)

---

## MUSZĄ / NIE WOLNO (jak SIGNATURE tego stylu, ale też jako „wzorzec do UNIKNIĘCIA" dla innych stylów)

### MUSZĄ
- `Fraunces` + `Cormorant Garamond`
- Nº eyebrow, italic numeral hero, figure+figcaption

### NIE WOLNO (jeśli wybrałeś Editorial Print dla kolejnego produktu, sprawdź czy to naprawdę editorial a nie np. utility-cywk = Apothecary)
- NIE używać Editorial Print dla utility/evidence-heavy/precision products — wtedy wybieraj Apothecary/Clinical/Swiss

---

## Podobne style

- [`dark-academia.md`](./dark-academia.md) — DA ma Caslon + burgundy, book vibe. Editorial ma Fraunces + gold, magazine vibe.
- [`apothecary-label.md`](./apothecary-label.md) — Apothecary ma Plex Sans + label. Editorial ma Fraunces + poetic.

## Changelog
- 2026-04-23 retrospektywa utworzona, v4.0
