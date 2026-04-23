# Rugged Heritage — Archivo + dark hero + stamp badges (obecny „kafina")

> **Baseline:** [`landing-pages/kafina/`](../../../landing-pages/kafina/).

## 1. Product DNA profil
- Utility↔Ritual: **utility** · Precision↔Expression: **balanced** · Evidence↔Feeling: **evidence**
- Solo↔Community: **solo** · Quiet↔Loud: **moderate** · Tradition↔Future: **tradition** · Intimate↔Public: **public**

### DNA Anchors
1. **Kafina coffee gear** — utility, tradition, solo
2. **Filson workwear** — rugged heritage
3. **Red Wing Boots** — artisan tradition

## 2. Kategorie
- Coffee gear (moka pots, grinders, scales)
- Workwear, boots, leather goods
- Whiskey/spirits artisan
- Tools / hardware enthusiast
- Knives, kitchen pro tools

## 3. Refs
- **Filson** — heritage workwear
- **Red Wing** — boots artisan
- **Bellroy (older)** — utilitarian leather

## 4. Font stack
- Display: `Archivo` 700/800 (nie Black — mniej bold niż Poster Utility)
- Body: `Inter` 400/500
- Accent: `IM Fell English` serif dla stamp badges

## 5. Paleta
- Dark Charcoal `#1C1817`
- Cream Paper `#F2EBDD`
- Brass `#B5853A`
- Stamp Red `#8B2C28`

## 6. Layout DNA
Dark hero + stamp badges + editorial with utility. Crafted heritage vibe.

## 7. Signature primitives
1. Dark hero z cream + brass accent
2. Stamp badges `LOT 2026 · ISSUE 001` w mosiężnej ramce
3. IM Fell English serif dla heritage labels
4. Leather texture hints
5. Aged photography

## 8. Section Architecture
**Min:** 14

## 9. Allowed Variants

```yaml
hero_allowed: [H2, H7, H4]
features_allowed: [F2, F1]
testimonials_allowed: [T6, T5]
```

## 10. Motion Budget
**Level:** still (heritage = stable, nie kinetic)

```yaml
js_effects_forbidden: [.js-parallax, .js-tilt — za kinetic dla heritage]
```

## 11. Copy Voice
- Register: heritage + confident + earned
- Person: 2-osoba grounded

## 12. Example Snippet
→ [`landing-pages/kafina/index.html`](../../../landing-pages/kafina/index.html)

---

## MUSZĄ / NIE WOLNO

### MUSZĄ
- `Archivo` + `IM Fell English`
- Dark hero (charcoal `#1C1817` lub podobne)
- Stamp badges z serif label

### NIE WOLNO
- NIE Rugged dla wellness/clean/modern tech — wtedy Clinical/Panoramic/Apothecary

---

## Podobne style

- [`outdoorsy-expedition.md`](./outdoorsy-expedition.md) — Outdoorsy = khaki + Work Sans + orange signal + topographic. Rugged = charcoal + Archivo + brass + stamp badges.
- [`editorial-print.md`](./editorial-print.md) — Editorial premium luxury. Rugged artisan heritage.

## Changelog
- 2026-04-23 retrospektywa
