# Motion Library — 8 efektów do landing page (subtle/moderate budget)

> **Dlaczego ta biblioteka istnieje (2026-05-20):** OraVibe (dentaflow) i Auriko pokazały że landingi z dobranym zestawem mikro-animacji wyglądają o klasę bardziej premium niż czyste statyczne strony. Bez tych efektów landing wygląda jak "wireframe". Z nimi — jak product page Anker / Withings / DJI.
>
> **Skala:** każdy efekt jest **subtle** (intencjonalnie niewidoczny jako "animacja", widoczny jako "ta strona reaguje"). Nie używaj wszystkich 8 na każdym landingu — wybieraj per Style Lock (patrz tabela compatibility na końcu).

## Filozofia

| ✅ TAK | ❌ NIE |
|---|---|
| Subtle (0.1-0.3 opacity, 2-5s pętle) | Krzykliwe (full opacity, <1s) |
| Performant (CSS animation > JS, requestAnimationFrame) | Heavy JS scroll listeners bez throttle |
| Wskazujące funkcję (live signal pokazuje że HD stream działa) | Dekoracyjne bez powodu (cursor trails, sparkles) |
| Hover/scroll-triggered (user-initiated) | Auto-play loops co sekundę |
| Reduce-motion friendly (`prefers-reduced-motion` respect) | Forced animations nawet z reduce-motion |

---

## 1. Shimmer overlay na primary buttons (CSS-only)

**Kiedy:** primary CTAs (Hero + Final CTA). NIE na sekondary buttons (ghost/outline).
**Co daje:** diagonal light sweep co 3.5s — sygnalizuje "akcja możliwa", utrzymuje wzrok bez ruchu hover.

```css
.btn-primary { position: relative; overflow: hidden; }
.btn-primary::after {
  content: ''; position: absolute; top: 0; left: -100%;
  width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
  animation: btn-shimmer 3.5s infinite;
  pointer-events: none;
}
@keyframes btn-shimmer { 0% { left: -100%; } 60%, 100% { left: 200%; } }
```

**Style Lock compatibility:** wszystkie. NIE wpływa na strukturę.

---

## 2. Pulse-glow na offer CTA (CSS-only)

**Kiedy:** TYLKO główny offer button (jeden per landing). Nie multiplikuj.
**Co daje:** teal "breath" co 2.6s — kierunkuje wzrok na cenę + CTA na sekcji offer.

```css
.offer-content .btn-block {
  animation: cta-pulse-glow 2.6s ease-in-out infinite;
}
@keyframes cta-pulse-glow {
  0%, 100% { box-shadow: 0 2px 8px rgba(15,23,42,0.10); }
  50% { box-shadow: 0 6px 24px rgba(<primary-rgb>,0.32); }
}
.offer-content .btn-block:hover { animation: none; box-shadow: 0 8px 30px rgba(<primary-rgb>,0.40); }
```

**Style Lock compatibility:** Clinical Kitchen, Panoramic Calm, Editorial Print. NIE Rugged Heritage (za "soft tech").

---

## 3. Bouncy card easing (CSS-only)

**Kiedy:** wszystkie interaktywne cards (KPI tiles, bento, persona, testi, trust-kpi).
**Co daje:** hover lift z micro-overshoot zamiast smooth linear — odbierane jako "spring/physical", nie "digital".

```css
.bento-card, .persona-card, .testi-card, .kpi {
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.4s ease,
              border-color 0.3s ease;
}
.bento-card:hover, .persona-card:hover, .testi-card:hover {
  transform: translateY(-4px);
  /* shadow + border-color per style */
}
.kpi:hover { transform: translateY(-3px); }
```

**Style Lock compatibility:** wszystkie EXCEPT Swiss Grid (strict modular = lin easing only).

---

## 4. Hero subtle grain noise (CSS-only)

**Kiedy:** Hero dark/light sekcji premium/medical/editorial. NIE Playful Toy / Memphis (za clean).
**Co daje:** "paper texture" — eliminuje plastic flat look, daje lab/print feel.

```css
.hero { position: relative; }
.hero::after {
  content: ''; position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.025; pointer-events: none; z-index: 0;
  mix-blend-mode: multiply;
}
```

**Style Lock compatibility:** Clinical Kitchen, Apothecary Label, Editorial Print, Dark Academia, Rugged Heritage. NIE Playful Toy / Retro-Futuristic.

---

## 5. Bento cursor-follow spotlight (CSS+JS)

**Kiedy:** Features bento cards z 3-6 tiles. Daje "instrument panel" feel — DJI / Anker product page.
**Co daje:** radial gradient pod kursorem w karcie — interaktywne, premium tech vibe.

**CSS:**
```css
.bento-card { position: relative; overflow: hidden; }
.bento-card::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%),
                              rgba(<primary-rgb>, 0.08), transparent 50%);
  opacity: 0; transition: opacity 0.4s ease;
  pointer-events: none; z-index: 0;
}
.bento-card:hover::before { opacity: 1; }
.bento-card > * { position: relative; z-index: 1; }
```

**JS:**
```js
document.querySelectorAll('.bento-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
    card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
  });
});
```

**Style Lock compatibility:** Clinical Kitchen, Panoramic Calm, Swiss Grid. NIE Rugged Heritage / Cottagecore (handcraft conflict).

---

## 6. KPI counter stagger (JS)

**Kiedy:** hero KPI grid (4 tiles z liczbami). NIE rozsiane counters w landingu (te pojedyncze odpalają się normalnie przez IntersectionObserver).
**Co daje:** "dashboard boot sequence" — counters odpalają się sekwencyjnie 140ms apart zamiast wszystkie naraz. Withings / Apple Health feel.

```js
const heroKpiGrid = document.querySelector('.hero .kpi-grid');
const heroKpiCounters = heroKpiGrid
  ? Array.from(heroKpiGrid.querySelectorAll('.js-counter'))
  : [];

const counterIO = new IntersectionObserver((es) => es.forEach(e => {
  if (e.isIntersecting) { animateCounter(e.target); counterIO.unobserve(e.target); }
}), { threshold: 0.4 });

// Standardowe counters (poza hero kpi-grid)
document.querySelectorAll('.js-counter').forEach(el => {
  if (!heroKpiCounters.includes(el)) counterIO.observe(el);
});

// Stagger dla hero KPI grid
if (heroKpiGrid && heroKpiCounters.length) {
  const kpiGridIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        heroKpiCounters.forEach((c, i) => setTimeout(() => animateCounter(c), i * 140));
        kpiGridIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  kpiGridIO.observe(heroKpiGrid);
}
```

**Style Lock compatibility:** Clinical Kitchen, Panoramic Calm. Wymaga `.kpi-grid` w hero (primitive 1 Clinical Kitchen).

---

## 7. Scroll progress bar (CSS+JS)

**Kiedy:** każdy landing >2 ekrany. Modern SaaS / Linear / Stripe feel.
**Co daje:** thin teal line na top viewport — pokazuje ile zostało, podsvjadomy "keep going" cue.

**HTML (after `<body>`):**
```html
<div class="scroll-progress" id="scrollProgress" aria-hidden="true"></div>
```

**CSS:**
```css
.scroll-progress {
  position: fixed; top: 0; left: 0;
  height: 2px; width: 0%;
  background: linear-gradient(90deg, var(--primary), var(--coral));
  z-index: 200; pointer-events: none;
  transition: width 0.08s linear;
}
```

**JS:**
```js
const scrollProgress = document.getElementById('scrollProgress');
if (scrollProgress) {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
        scrollProgress.style.width = pct + '%';
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}
```

**Style Lock compatibility:** wszystkie EXCEPT Editorial Print (book-style czytania, brak progress).

---

## 8. App mockup live signal (CSS-only)

**Kiedy:** Hero z app mockup pokazujący "live HD" stream (Auriko, IoT devices, camera products).
**Co daje:** subtle brightness flicker co 5s + crosshair pulse co 3.4s — daje wrażenie real-time signal, nie statycznego screenshotu.

```css
.app-mock-view {
  /* ...background, position... */
  animation: signal-flicker 5s ease-in-out infinite;
}
@keyframes signal-flicker {
  0%, 88%, 100% { filter: brightness(1) contrast(1); }
  92%, 95% { filter: brightness(1.12) contrast(1.05); }
}

.app-mock-crosshair {
  /* ...position, border... */
  animation: crosshair-pulse 3.4s ease-in-out infinite;
}
@keyframes crosshair-pulse {
  0%, 100% { box-shadow: 0 0 0 1px rgba(255,255,255,0.2),
                          0 0 0 0 rgba(<primary-rgb>,0); }
  50%      { box-shadow: 0 0 0 1px rgba(255,255,255,0.3),
                          0 0 0 6px rgba(<primary-rgb>,0.18); }
}
```

**Style Lock compatibility:** Clinical Kitchen, Panoramic Calm. Wymaga dedykowanego mockupu HD stream w hero.

---

## ⚠️ CRITICAL: Fade-in IntersectionObserver — agresywne ustawienia

Przy dużej liczbie `.fade-in` (>20) na elementach z `grid` + `aspect-ratio`, restrykcyjny IO (threshold ≥0.1, negative rootMargin) może NIE triggered cards z opóźnionym layoutem. Playwright fullPage screenshot pokazuje puste sekcje.

**Bezpieczne ustawienia (przejęte od auriko 2026-05-20):**

```js
if ('IntersectionObserver' in window) {
  // Agresywny trigger (threshold 0, rootMargin +120px bottom = eager)
  const io = new IntersectionObserver((es) => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  }), { threshold: 0, rootMargin: '0px 0px 120px 0px' });
  document.querySelectorAll('.fade-in').forEach(el => io.observe(el));

  // Safety #1 — po 2.5s pokaż wszystkie elementy w viewport+200px (zgodne z safety.md #2)
  setTimeout(() => {
    document.querySelectorAll('.fade-in:not(.visible)').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 200) el.classList.add('visible');
    });
  }, 2500);

  // Safety #2 — po 5s WSZYSTKIE (Playwright/print/screenshot insurance)
  // Ten timeout odpala się DŁUŻEJ niż czas typowego user reading hero (~3s),
  // więc nie złamie scroll-reveal experience.
  setTimeout(() => {
    document.querySelectorAll('.fade-in:not(.visible)').forEach(el => el.classList.add('visible'));
  }, 5000);
} else {
  document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
}
```

---

## Style Lock × Effect compatibility matrix

| Effect | Apothecary | Clinical Kitchen | Panoramic Calm | Swiss Grid | Editorial Print | Rugged Heritage | Playful Toy | Retro-Futuristic |
|---|---|---|---|---|---|---|---|---|
| 1. Shimmer btn | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ subtle only | ❌ za premium | ❌ |
| 2. Pulse-glow CTA | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ | ❌ | ✅ | ✅ neon |
| 3. Bouncy easing | ✅ | ✅ | ✅ | ❌ strict lin | ✅ | ⚠️ | ✅ | ✅ |
| 4. Grain noise | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | ✅ | ❌ | ⚠️ scan lines |
| 5. Cursor spotlight | ⚠️ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| 6. KPI stagger | ✅ wymaga KPI | ✅ wymaga KPI | ✅ wymaga KPI | ✅ | ❌ | ❌ | ❌ | ⚠️ |
| 7. Scroll progress | ✅ | ✅ | ✅ | ✅ | ❌ book | ✅ | ✅ | ✅ |
| 8. Live signal | ❌ | ✅ wymaga mockup | ✅ wymaga mockup | ❌ | ❌ | ❌ | ❌ | ✅ glitch |

**Default per style (zalecane podstawowe 3-4 efekty):**
- **Clinical Kitchen / Panoramic Calm:** 1, 2, 3, 5, 6, 7, 8 (jeśli mockup)
- **Apothecary Label / Editorial Print:** 1, 3, 4
- **Swiss Grid:** 1, 5, 6, 7
- **Rugged Heritage:** 4 (subtle grain only)
- **Playful Toy / Retro-Futuristic:** 2, 3, 7 + style-specific (floating emoji, neon glow)

---

## Reduce-motion support (RECOMMENDED dodać do wszystkich)

```css
@media (prefers-reduced-motion: reduce) {
  .btn-primary::after,
  .offer-content .btn-block,
  .app-mock-view,
  .app-mock-crosshair,
  .scroll-progress { animation: none !important; }
  .bento-card::before { display: none; }
  html.js .fade-in { opacity: 1 !important; transform: none !important; transition: none !important; }
}
```

---

## Cross-references

- [`safety.md` #2](safety.md) — fade-in safety timeout (musi być filtered)
- [`patterns.md`](patterns.md) — pojedyncze signature snippets (NIE motion library)
- [`section-variants.md`](section-variants.md) — wybór wariantów Hero/Features/Testimonials
- [`style-atlas/README.md`](../style-atlas/README.md) — Motion Budget per style (`subtle/moderate/expressive`)

## Source landings

- **Auriko** (Clinical Kitchen) — pełna implementacja 8 efektów: [`landing-pages/auriko/index.html`](../../../landing-pages/auriko/index.html)
- **OraVibe / Dentaflow** (custom premium-tech) — referencja shimmer + pulse-glow + bouncy + floating decorations: [`landing-pages/dentaflow/index.html`](../../../landing-pages/dentaflow/index.html)

## Changelog

- 2026-05-20 — utworzony, v1.0. Wyciągnięte z auriko (Clinical Kitchen) i dentaflow (premium tech).
