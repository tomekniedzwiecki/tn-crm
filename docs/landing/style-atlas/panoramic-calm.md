# Panoramic Calm — Plus Jakarta + Instrument Serif + paper/navy/teal (obecny „vitrix")

> **Baseline:** [`landing-pages/vitrix/`](../../../landing-pages/vitrix/). Retrospektywa.

## 1. Product DNA profil
- Utility↔Ritual: **utility** · Precision↔Expression: **precision** · Evidence↔Feeling: **evidence**
- Solo↔Community: **solo** · Quiet↔Loud: **quiet** · Tradition↔Future: **future** · Intimate↔Public: **public**

### DNA Anchors
1. **Vitrix smart window cleaner** — utility, precision, future
2. **Apple product pages** — tech premium minimalism
3. **Linear** — clean tech premium

## 2. Kategorie produktów
- Smart home tech (apps + devices)
- Architektura/spatial products
- Premium tech minimalist
- SaaS landing dla tech

## 3. Real-world refs
- **Apple** — architectural + wide shots
- **Stripe** — gradient panoramic
- **Linear** — clean grid tech

## 4. Font stack
- Display: `Plus Jakarta Sans` 600/700
- Body: `Plus Jakarta Sans` 400/500
- Accent: `Instrument Serif` italic (eyebrow jewelry)

## 5. Paleta
- Paper `#F7F5F0`
- Navy `#0B1F3A`
- Teal `#08A5A5`
- Gold sparingly

## 6. Layout DNA
Panorama wide — szerokie obrazy + dashboard mockups + architektoniczne siatki.

## 7. Signature primitives
1. Dashboard mockup hero split
2. Architectural grid overlay
3. Wide panoramic hero images (16:9 lub 21:9)
4. Instrument Serif italic eyebrow
5. Smooth gradient backgrounds

## 8. Section Architecture
**Minimum:** 14

```yaml
required: [Header, Mobile Menu, Hero, Trust Bar, Problem, Solution, How It Works, Comparison, Testimonials, FAQ, Offer, Final CTA, Footer, Sticky CTA]
```

## 9. Allowed Variants

```yaml
hero_allowed: [H3, H2, H9]
features_allowed: [F4, F1]
testimonials_allowed: [T2, T1]
```

## 10. Motion Budget

**Level:** moderate

```yaml
js_effects_required: [.fade-in, .js-split, .js-counter, .magnetic, .js-tilt]
js_effects_count: { counter_min: 2, magnetic_min: 2, tilt_min: 2 }
```

## 11. Copy Voice
- Register: tech-premium + clean
- Person: 2-osoba

## 12. Example Snippet
→ [`landing-pages/vitrix/index.html`](../../../landing-pages/vitrix/index.html)

---

## MUSZĄ / NIE WOLNO

### MUSZĄ
- `Plus Jakarta Sans` + `Instrument Serif`
- Dashboard mockup hero
- Panoramic wide images

### NIE WOLNO (dla OD Panoramic Calm innego stylu)
- NIE używać dla traditional/warm products — wtedy Cottagecore/Editorial/Dark Academia

---

## Podobne style

- [`clinical-kitchen.md`](./clinical-kitchen.md) — Clinical ma IBM Plex + charts + KPI dashboards. Panoramic ma Plus Jakarta + architectural panorama.
- [`swiss-grid.md`](./swiss-grid.md) — Swiss jest strict 12-col + Helvetica. Panoramic ma gradient + wide flow.

## Changelog
- 2026-04-23 retrospektywa utworzona, v4.0
