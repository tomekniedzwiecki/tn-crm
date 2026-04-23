# Playful Toy — Nunito heavy + bouncy + pastel colors (obecny „pupilnik")

> **Baseline:** [`landing-pages/pupilnik/`](../../../landing-pages/pupilnik/).

## 1. Product DNA profil
- Utility↔Ritual: **ritual** · Precision↔Expression: **expression** · Evidence↔Feeling: **feeling**
- Solo↔Community: **dual** · Quiet↔Loud: **loud** · Tradition↔Future: **present** · Intimate↔Public: **social**

### DNA Anchors
1. **Pupilnik pet toys** — ritual, expression, dual (owner+pet)
2. **Bark** — pet DTC playful
3. **Mini Boden / HappySocks** — kids/playful

## 2. Kategorie
- Pet products
- Kids toys / learning
- Playful gadgets (fun tech)
- Party supplies / celebration
- Snack/food dla dzieci

## 3. Refs
- **Bark** — pet + sticker-heavy + bold color
- **Omsom** (playful side) — vibrant packaging
- **SmashMallow** — fun DTC

## 4. Font stack
- Display: `Nunito` 800/900 — rounded heavy, NIE Fredoka (PL issues)
- Body: `Nunito` 400/500/600
- Accent: `Caveat` 700 (handwritten)

## 5. Paleta
- Cream `#FFF8E7`
- Bright Primary (np. Coral `#FF6B9D`)
- Yellow Accent `#FFD93D`
- Ink Deep `#2D1B36`

## 6. Layout DNA
Playful bouncy cards + sticker overlays + rotations 2-5°. Radius 24-36px.

## 7. Signature primitives
1. Bouncy cards (border-radius 24-36px)
2. Emoji/icon heavy (ale stylized, nie generic)
3. Stickers rotated (patrz Brutalist ale playful kolory)
4. Wavy SVG dividers między sekcjami
5. Nunito Black huge headings

## 8. Section Architecture
**Min:** 14

## 9. Allowed Variants

```yaml
hero_allowed: [H1, H6, H2]
features_allowed: [F1, F5]
testimonials_allowed: [T1, T4]
```

## 10. Motion Budget
**Level:** expressive (wobble, bounce)

```yaml
js_effects_required: [.fade-in, .wobble, .js-counter]
js_effects_count: { counter_min: 2 }
```

## 11. Copy Voice
- Register: playful + friendly + casual
- Person: 2-osoba entuzjastyczna
- Dopuszczalne: wykrzykniki „!" (umiarkowanie), pytania retoryczne

## 12. Example Snippet
→ [`landing-pages/pupilnik/index.html`](../../../landing-pages/pupilnik/index.html)

---

## MUSZĄ / NIE WOLNO

### MUSZĄ
- `Nunito` 800/900 (NIE Fredoka — PL issues)
- Rounded corners ≥24px
- Bright primary palette

### NIE WOLNO
- NIE Fredoka One (brak PL znaków)
- NIE Playful dla utility/premium — wtedy Apothecary/Editorial

---

## Podobne style

- [`cottagecore-botanical.md`](./cottagecore-botanical.md) — Cottagecore warm romantic. Playful Toy bright loud.
- [`poster-utility.md`](./poster-utility.md) — Poster sharp hard edges. Playful rounded bouncy.

## Changelog
- 2026-04-23 retrospektywa
