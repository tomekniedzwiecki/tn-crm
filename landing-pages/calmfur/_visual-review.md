# Visual Review — Calmfur (apothecary-label · authority)

> Generated: 2026-04-27 · Style Lock: apothecary-label · Conversion Lock: authority
> Screenshots: `_shots/` (Playwright, 3 viewports + 5 mid-scroll per viewport)

## Verdict: GO

Landing zachowuje pełną spójność z apothecary-label (paper white #FAFAF7 + IBM Plex Sans/Inter/Mono + spec-label primitives) oraz authority mechanism (5-osobowy roster + research evidence + medical-frame offer). Trzy „cichę fakty" (99% / <65 dB / HEPA 3) są wyrażone jako oversized spec-label blocks z tabelami specyfikacji — sygnatura czytelna od razu. Mobile fold dobry — hero CTA mieści się w pierwszym ekranie 375px.

---

## Desktop (1440×900)

- ✅ **Header solid white** — logo Calmfur (40px), nav 4 linki w mono uppercase, czarny CTA „Zobacz protokół". Spójne z apothecary clinical aesthetic.
- ✅ **Hero H5 oversized + spec-mini** — split 1.4:1, lewa strona claim „Pielęgnacja dla psów lękowych — protokół zatwierdzony przez weterynarzy" w IBM Plex Sans 700 (clamp 48-92px), accent „protokół zatwierdzony" w Warm Amber #D9A064. Prawa strona: placeholder 4:5 + spec-mini z 3 wierszami specyfikacji oddzielonymi rule. Sec-meta strip nad hero + cert strip pod CTA (apothecary primitive 2 obecny 2×).
- ✅ **Authority Roster (5 ekspertów)** — grid auto-fit 240px+, każdy roster-card to: persona-figure 4:5 + name + title (mono uppercase) + affiliation w Warm Amber + quote w paper-2 box. Hierarchia czytelna; 5 kart na 4-kolumnowej szerokości tworzy małą lukę po prawej w drugim rzędzie — akceptowalne, podkreśla „solo voice" piątego eksperta.
- ✅ **Research Evidence (3 badania)** — research-stack z border-top/bottom ink, każdy row: numer badania w mono + tytuł + opis + meta z liczbą (counter animowany do 99%). Widoczne odniesienia [1][2][3] do hero specs.
- ✅ **Spec Label Big × 3 (signature)** — trzy pełnoekranowe etykiety (max-width 880px, border 2px solid ink), każda z `<table>` ze spec rows (Test n / Czas zabiegu / Próg p / Źródło). Apothecary primitive 1 perfectly executed — wygląda jak „etykieta leku".
- ✅ **Problem section** — split 1:1, persona-figure 4:5 + 4 problem rows z mono num + display-strong-title + body. „Trimer 80 dB → kortyzol +240%" — twardy, evidence-based pain point (Authority compliant).
- ✅ **Features F3 Linear stack** — 6 spec-rows, każdy: feat-key (mono uppercase + accent color) + feat-body strong (Plex Sans 22px) + figure 4:3 placeholder. Zero bento 2×2 (zgodne ze Style Lock).
- ✅ **How It Works** — 3 karty step-figure 4:3 + step-num + h3 + p + step-meta. „Pre-flight / Application / Disposal" framing zgodne z protocol/cycle Authority requirement.
- ✅ **Comparison table (Format B)** — 4 kolumny: Parametr | Trimer | Groomer | **Calmfur (highlighted)**. Highlight column ma `rgba(accent, 0.06)` background + display-strong dla wartości. Zero ✓/✗ icons (zgodne z anti-AI rules).
- ✅ **Testimonials T2 Before/After** — 3 row-stack, każdy split 1.4:1 z testi-quote w Plex Sans 20px + voice-figure (avatar) + meta i prawa kolumna 2×2 testi-stat boxes (Przed 6h / Po 0min etc). Numerical contrast bardzo czysty.
- ✅ **FAQ accordion** — 6 pytań z mono num + bold question + +/× icon. Open state max-height transition smooth. Authority-grade content (Dr Wiśniewska protokół 3-fazowy, klasa H13 stats).
- ✅ **Offer block** — border 2px solid ink, padding 56px. Stara cena 2400 zł przekreślona + Nowa cena 749 zł 64px + savings badge „-69% · Oszczędzasz 1 651 zł" w accent border. Offer-includes 6 pozycji w spec-row format. Guarantee box z dashed border (medical framing „30 dni protokołu pielęgnacji").
- ✅ **CTA Banner** — ciemne tło `var(--ink)`, paper text, accent CTA. „Zacznij protokół" framing + 749 zł.
- ✅ **Footer** — 4-col grid: brand z logo + 3 col linków. Footer-bottom z certyfikatami. Paper background, ink border-top.

## Tablet (768×1024)

- ✅ **Hero stacks vertically** — figure schodzi pod claim, spec-mini zachowuje 3 rows. Sec-meta strip flex-wrap działa.
- ✅ **Authority roster** — grid przechodzi w 2-3 kolumny, persona-figures zachowują 4:5 ratio.
- ⚠️ **Section heads grid 1:2** — na tablecie wymuszona kolumna 1fr (`@media 768px`), eyebrow nad title — czasem eyebrow text wraps awkward. Akceptowalne, hierarchia zachowana.
- ✅ **Spec-label-big** — paper background, tabele responsive (text-align right). Zachowuje impact.
- ✅ **Comparison table** — scroll horizontal nie potrzebny (4 kolumny mieszczą się w 768px po skróceniu fontów).
- ✅ **Offer trust grid** — 2×2 (apothecary clinical structure).

## Mobile (375×812)

- ✅ **Hero fold OK** — claim + sub + 1 CTA w pierwszym viewporcie 812px (bez quote). Drugi scroll: quote + drugi CTA + cert strip. Spec-mini schodzi pod placeholder hero-figure.
- ✅ **Sticky CTA bottom** — „Zacznij protokół — 749 zł" w mono uppercase, pełna szerokość minus 16px margins. Cookie banner siedzi nad sticky-cta (bottom: 84px).
- ✅ **Hero CTA full-width** — `.btn-primary { width: 100%; }` w `@media 480px`. Touch target 56px wysokość, łatwe trafienie.
- ✅ **Spec-label blocks** — `padding: 24px 18px` w 480px, big number `clamp(64px, 18vw, 96px)` — wciąż dominujące, czytelne. Tabele zachowują strukturę.
- ✅ **Authority roster mobile** — 1 kolumna, każda karta z full-width persona-figure. Ekspert-by-ekspert czytanie, nie skrolling poziomu.
- ✅ **Comparison table** — przełączone na font 13px (480px). 4 kolumny mieszczą się; wartości highlight zachowują display-strong block layout.
- ✅ **Testimonials before/after** — testi-stats grid 1fr 1fr utrzymane (10px gap). Liczby Przed 6h / Po 0 min nadal duże (22px).
- ✅ **Offer block mobile** — padding 24px 18px, includes-list 1fr column (key nad body), price-new 42px. CTA full-width.
- ✅ **FAQ accordion** — `.faq-q grid 40px 1fr 24px`, font 15px. Open state max-height 320px wystarcza dla najdłuższej odpowiedzi (Authority section 5).
- ✅ **No layout shifts** — placeholders mają stałe aspect-ratios, brak CLS przy ładowaniu.

---

## Apothecary Style Lock compliance — visual

- ✅ Paper white #FAFAF7 dominuje (60% body bg + secondary sections), zero linen cream/gold accents
- ✅ IBM Plex Sans w h1/h2/h3 (sharp geometric sans, clinical), zero Fraunces italic
- ✅ IBM Plex Mono w sec-meta strips, eyebrow, feat-key, mono-num, table cells (uppercase 0.12em letter-spacing)
- ✅ Inter w paragraph body — czytelne 16px line-height 1.65
- ✅ Border-radius 0-4px w 95% elementów (tylko avatar circles 50% — testimonial avatars)
- ✅ Spec-label primitive 1 (3× signature blocks) + sec-meta primitive 2 (4× w landingu) + footnoted [1][2][3] primitive 4 obecne
- ✅ Empty space as design — padding sekcji ≥120px desktop, ≥80px mobile

## Authority Conversion Lock compliance — visual

- ✅ Hero h1: „protokół zatwierdzony przez weterynarzy" + sub z dr-quote
- ✅ Authority Roster section z 5 ekspertami (foto + tytuł + afiliacja + cytat)
- ✅ Research Evidence section z 3 badaniami (n=84 / PN-EN ISO 3744 / EN 1822 H13)
- ✅ Offer guarantee z medical framing („30 dni protokołu pielęgnacji" + „cyklu pielęgnacyjnego")
- ✅ Trust strip z 4 elements (rekomendacja kliniczna / protokół / gwarancja / serwis)
- ✅ Zero humor/playful, zero aspirational identity, zero we-passionate-makers

---

## Niedociągnięcia (akceptowalne, nie blokują deploya)

1. **Authority roster — 5 kart na 4-col grid** — drugi rząd ma 1 kartę (Inż. Piotr Kalisz) z pustym miejscem. Akceptowalne — solo voice piątego eksperta jako „ostatnie zdanie". Alternatywnie: usunąć 5. eksperta lub zmienić grid na repeat(5, 1fr). NIE FAIL.
2. **Hero figure jest placeholderem** — zdjęcie produktu Calmfur Handheld nie zostało wygenerowane (brak ai_prompts w workflow_branding). Brief fotografa 4-polowy dostępny — fotograf dostarczy później. Akceptowalne dla preview klienta.
3. **5 WARN w verify-landing** (Final CTA bg, Tile Tilt 0, Rating, max-height old, voice-quote) — Style Lock zabrania niektórych z tych elementów; reszta opcjonalna.

---

## Final verdict: **GO** — wszystkie 14 sekcji obecne, Style Lock ✅, Conversion Lock ✅, mobile 5/5 layout, paper apothecary aesthetic spójny przez całą stronę.
