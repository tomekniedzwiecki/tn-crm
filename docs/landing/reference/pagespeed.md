# PageSpeed Optimization

> **CEL**: Każdy landing page MUSI osiągać **90+ punktów** w PageSpeed Insights (mobile). To nie jest „nice to have" — wolne strony tracą konwersje.

## Kiedy czytać
- **ETAP 4 (design polish)** — przy implementacji hero + obrazów + fontów
- **Wczesny ETAP 5 (verify)** — przed Playwright screenshotami

## Cross-references
- Wymóg fontów `` → [`reference/safety.md` reguła #10](safety.md)
- Mobile performance checklist → [`06-mobile.md` obszar J](../06-mobile.md)

---

## Kluczowe metryki Core Web Vitals

| Metryka | Co mierzy | Target | Jak osiągnąć |
|---------|-----------|--------|--------------|
| **LCP** (Largest Contentful Paint) | Czas do wyrenderowania największego elementu | < 2.5s | Preload hero image, optymalizacja fontów |
| **FID** (First Input Delay) | Opóźnienie pierwszej interakcji | < 100ms | Defer JS, unikaj heavy computations |
| **CLS** (Cumulative Layout Shift) | Przesunięcia layoutu | < 0.1 | Zawsze podawaj width/height obrazów |

---

## 1. Fonty — KRYTYCZNE dla LCP

**ZAWSZE stosuj te praktyki:**

```html
<!-- 1. Preconnect do Google Fonts (ZAWSZE na początku <head>) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- 2. Font z display=swap (BEZ subset=latin-ext — to anty-wzorzec, patrz niżej) -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
```

**Zasady fontów:**
- **Max 2-3 fonty** — każdy dodatkowy font to +100-200ms
- **Max 3-4 warianty grubości** per font (np. 400;500;600;700, NIE 300;400;500;600;700;800;900)
- **ZAWSZE `display=swap`** — tekst widoczny od razu, font ładuje się w tle
- **NIGDY `&subset=latin-ext`** — anty-wzorzec. Google Fonts v2 przy tym parametrze serwuje dla niektórych fontów (Fredoka!) pojedynczy TTF bez `unicode-range`, polskie znaki wypadają → fallback cursive. Bez parametru Google zwraca `@font-face` per-subset, przeglądarka pobiera potrzebne. Patrz memory `feedback-landing-fonts-polish.md`.

**Fonty z polskimi znakami (bezpieczne):**
- Inter, Poppins, Roboto, Open Sans, Lato, Nunito, Montserrat
- Fredoka (NIE Fredoka One!), Caveat (zamiast Patrick Hand)

**Fonty BEZ polskich znaków (UNIKAJ):**
- Fredoka One, Patrick Hand, Pacifico (starsze wersje)

**Editorial fonty z OK polskimi (sprawdzone na „Ł"):**
- Fraunces ✅, Cormorant Garamond ✅, Libre Bodoni ✅, EB Garamond ✅
- Italiana ❌, Playfair Display SC ⚠️

---

## 2. Obrazy — KRYTYCZNE dla LCP i CLS

### Placeholder images (przed otrzymaniem zdjęć)

```html
<!-- ZAWSZE podawaj width i height (zapobiega CLS) -->
<img src="https://placehold.co/1200x900/f8f9fa/6b7280?text=Hero+Image"
     alt="[Opis produktu]"
     width="1200"
     height="900"
     loading="lazy"
     class="hero-image">
```

### Docelowe zdjęcia (po otrzymaniu od klienta)

```html
<!-- Hero image — BEZ lazy loading (LCP element!) -->
<img src="hero.webp"
     alt="[Opis]"
     width="1200"
     height="900"
     fetchpriority="high"
     decoding="async">

<!-- Pozostałe obrazy — Z lazy loading -->
<img src="product.webp"
     alt="[Opis]"
     width="800"
     height="600"
     loading="lazy"
     decoding="async">
```

**Zasady obrazów:**

| Zasada | Dlaczego |
|--------|----------|
| **ZAWSZE width + height** | Zapobiega CLS (layout shift) |
| **Hero image: `fetchpriority="high"`** | Przyspiesza LCP |
| **Hero image: BEZ `loading="lazy"`** | Lazy loading opóźnia LCP |
| **Pozostałe: `loading="lazy"`** | Oszczędza bandwidth |
| **Format WebP** | 25-35% mniejszy niż JPEG |
| **Max 200KB per image** | Większe = wolniejsze |

### Srcset dla responsywności (opcjonalne, ale zalecane)

```html
<img src="hero-1200.webp"
     srcset="hero-600.webp 600w, hero-900.webp 900w, hero-1200.webp 1200w"
     sizes="(max-width: 768px) 100vw, 1200px"
     alt="[Opis]"
     width="1200"
     height="900"
     fetchpriority="high">
```

---

## 3. CSS — Inline Critical, Defer Rest

**Struktura `<head>` dla optymalnej wydajności:**

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>...</title>

  <!-- 1. Preconnect (przed wszystkim innym) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <!-- 2. Preload critical assets (hero image) -->
  <link rel="preload" href="hero.webp" as="image" fetchpriority="high">

  <!-- 3. Fonty -->
  <link href="https://fonts.googleapis.com/css2?family=..." rel="stylesheet">

  <!-- 4. Critical CSS inline (above-the-fold styles) -->
  <style>
    /* TYLKO style potrzebne do pierwszego renderowania:
       - Reset/normalize
       - Typography base
       - Header
       - Hero section
       - Animacje fade-in
    */
  </style>
</head>
```

**W praktyce dla landing pages:**
- Trzymaj WSZYSTKO w jednym `<style>` inline — prostsze i szybsze dla SPA
- Jeśli CSS > 50KB, rozważ split na critical/non-critical

---

## 4. JavaScript — Defer i minimalizuj

```html
<!-- Skrypty na KOŃCU body, z defer -->
<script defer src="/landing-pages/shared/conversion-toolkit.js"></script>

<!-- Inline JS — tylko niezbędne -->
<script>
  // Fade-in observer (z safety timeout — patrz reference/safety.md #2)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => e.isIntersecting && e.target.classList.add('visible'));
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
</script>
```

**Zasady JS:**
- **NIGDY nie blokuj renderowania** — zawsze `defer` lub na końcu body
- **Unikaj `document.write()`** — blokuje parser
- **Minimalizuj obliczenia w load** — defer animacje do idle time

---

## 5. Struktura HTML dla szybkiego FCP

```html
<!DOCTYPE html>
<html lang="pl">
<head>
  <!-- Meta tags PIERWSZE -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Preconnect/preload DRUGIE -->
  <link rel="preconnect" href="...">
  <link rel="preload" as="image" href="hero.webp">

  <!-- Fonty TRZECIE -->
  <link href="fonts.googleapis.com/..." rel="stylesheet">

  <!-- Critical CSS CZWARTE (inline) -->
  <style>...</style>

  <!-- Title i meta PIĄTE -->
  <title>...</title>
  <meta name="description" content="...">
</head>
<body>
  <!-- Header PIERWSZY (fixed, nad wszystkim) -->
  <header class="header">...</header>

  <!-- Hero DRUGI (LCP element) -->
  <section class="hero">
    <img src="hero.webp" fetchpriority="high" ...>
  </section>

  <!-- Reszta contentu -->
  ...

  <!-- Scripts NA KOŃCU -->
  <script defer src="..."></script>
</body>
</html>
```

---

## 6. Animacje bez wpływu na wydajność

**DOBRE animacje (GPU-accelerated):**

```css
/* Używaj TYLKO transform i opacity */
.fade-in {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.fade-in.visible {
  opacity: 1;
  transform: translateY(0);
}

/* will-change dla heavy animacji */
.hero-glow {
  will-change: transform, opacity;
}
```

**ZŁE animacje (powodują reflow/repaint):**

```css
/* UNIKAJ animowania: */
/* - width, height, margin, padding */
/* - top, left, right, bottom */
/* - font-size, line-height */
/* - box-shadow (tylko subtelne) */
```

---

## 7. Lazy loading sekcji (dla długich stron)

```html
<!-- Obrazy poniżej fold — native lazy loading -->
<img loading="lazy" ...>

<!-- Dla iframe (np. video) -->
<iframe loading="lazy" ...>
```

---

## 8. Checklist PageSpeed (OBOWIĄZKOWA!)

**Przed deploy sprawdź:**

- [ ] **Preconnect** do `fonts.googleapis.com` i `fonts.gstatic.com`
- [ ] **Fonty**: max 3, max 4 wagi, `display=swap` (BEZ `subset=latin-ext` — anty-wzorzec dla polskich znaków)
- [ ] **Hero image**: `fetchpriority="high"`, BEZ `loading="lazy"`
- [ ] **Wszystkie obrazy**: mają `width` i `height` (zapobiega CLS)
- [ ] **Obrazy below fold**: `loading="lazy"`
- [ ] **CSS**: inline w `<style>` (lub critical inline + defer rest)
- [ ] **JS**: `defer` lub na końcu body
- [ ] **Animacje**: tylko `transform` i `opacity`
- [ ] **Brak render-blocking resources** (sprawdź w DevTools > Lighthouse)

**Test w PageSpeed Insights:**
```
https://pagespeed.web.dev/analysis?url=https://tn-crm.vercel.app/landing-pages/[slug]/
```

**Target scores:**
- Mobile: **90+** (minimum 85)
- Desktop: **95+** (minimum 90)

---

## 9. Przykład optymalnego `<head>`

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nazwa Produktu - Tagline | Marka</title>
  <meta name="description" content="Opis produktu w 150-160 znaków...">

  <!-- Preconnect (KRYTYCZNE!) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <!-- Preload hero image (LCP optimization) -->
  <link rel="preload" as="image" href="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/landing/[slug]/hero.webp" fetchpriority="high">

  <!-- Fonts (max 2-3, z display=swap, ) -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">

  <!-- Open Graph (pełny URL Supabase — patrz reference/safety.md #10) -->
  <meta property="og:title" content="...">
  <meta property="og:description" content="...">
  <meta property="og:image" content="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/landing/[slug]/og.jpg">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="pl_PL">

  <!-- html.js gate (patrz reference/safety.md #2) -->
  <script>document.documentElement.classList.add('js')</script>

  <!-- Critical CSS (inline) -->
  <style>
    /* ... wszystkie style ... */
  </style>
</head>
```

---

## Po naprawach

```bash
bash scripts/verify-landing.sh [slug]
# część 18 checks dotyczy PageSpeed (patrz 05-verify.md tabela)
```

Jeśli landing nadal <90/100 mobile w PageSpeed Insights:
1. Sprawdź zalecenia z Lighthouse w DevTools (concrete fixes)
2. Najczęściej brakuje: preconnect, fetchpriority, lazy loading dla obrazów below-fold
3. Re-test po każdym fixie — czasem jeden fix zmienia wynik o 10+ punktów
