# ETAP 6 — MOBILE: Polish Pass (OBOWIĄZKOWY)

> **Safety rules:** [`reference/safety.md`](reference/safety.md) — szczególnie #3 (dual bank), #7 (diakrytyki), #9 (header).
> **Mobile copy rules:** [`reference/copy.md`](reference/copy.md) Część 3.3.

**Kiedy uruchomić:** PO `screenshot-landing.sh` (ETAP 5 — [`05-verify.md`](05-verify.md)), PRZED commitem i deployem.

**Cel:** systematycznie dopracować landing na **375px** tak, by mobile user doznawał tego samego "wow" co desktop. VERIFY tylko wyłapuje bugi — ten etap je naprawia.

**Dlaczego obowiązkowy:** 60-70% ruchu to mobile. Landing który wygląda świetnie na 1440px ale "się rozjeżdża" na 375px = wyrzucone pieniądze na reklamę.

---

## Workflow

```
1. Otwórz C:/tmp/[slug]_shots/mobile_full.png          (Read tool)
2. Otwórz mobile_hero.png + mobile_900.png + 1800 + 2700
3. Przejdź checklist poniżej sekcja po sekcji
4. Popraw wszystkie znalezione problemy w index.html
5. Re-run: bash scripts/screenshot-landing.sh [slug]
6. Ponownie obejrzyj mobile_*.png → jeśli OK, idź do commit
```

**Iteruj aż mobile_full.png wygląda jak "premium appka", nie "desktop wciśnięty w iPhone'a".**

---

## Checklist — podzielony na 10 obszarów

### A. Touch targets (≥44px, Apple HIG)

- [ ] Wszystkie CTA buttons mają `min-height: 48px` (lepiej 52px)
- [ ] Link-y w nawigacji / footer mają padding `≥12px 16px` (nie goły text)
- [ ] FAQ accordion header = cały obszar klikalny (nie tylko strzałka)
- [ ] Odstępy między klikalnymi elementami ≥8px (żeby palec nie trafił w 2 naraz)
- [ ] Hamburger icon `min 44×44px` (sama ikona może być 24px, ale obszar 44)

**Grep sanity:**
```bash
grep -n "padding.*[0-9]px.*[0-9]px" landing-pages/[slug]/index.html | grep -iE "button|cta|nav-link"
```

### B. Typography — czytelność na 375px

- [ ] Body text **≥16px** (iOS zoom-on-input trigger poniżej)
- [ ] Hero headline mieści się w 2-3 linie, nie ucina się ("Niena..." bug)
- [ ] `clamp()` na wszystkich dużych headline'ach — `clamp(32px, 8vw, 56px)`
- [ ] `line-height: 1.15-1.25` dla display headings (nie desktopowe 1.5)
- [ ] `word-break: break-word` + `overflow-wrap: anywhere` na długich słowach (marka, email)
- [ ] `-webkit-text-size-adjust: 100%` w `<html>` (nie auto-scale w landscape)
- [ ] Polskie znaki renderują się (ą, ę, ć, ł, ń, ó, ś, ż, ź — zwłaszcza UPPERCASE)

**Copy-paste baseline:**
```css
html { -webkit-text-size-adjust: 100%; }
body { font-size: 16px; line-height: 1.6; }
h1 { font-size: clamp(32px, 8vw, 64px); line-height: 1.1; }
h2 { font-size: clamp(24px, 6vw, 40px); line-height: 1.2; }
h3 { font-size: clamp(20px, 5vw, 28px); line-height: 1.3; }
@media (max-width: 480px) {
  .lead, .intro { font-size: 17px; line-height: 1.55; }
}
```

### C. Spacing rhythm — oddech między sekcjami

- [ ] Każda `<section>` ma `padding-block: clamp(48px, 12vw, 96px)` (nie stały 80px!)
- [ ] Hero: top padding uwzględnia header (fixed) + urgency bar + 24px buforu
- [ ] Container `padding-inline: 20px` na mobile (nie `0`, nie `40px`)
- [ ] Gap w grid/flex **skalowalny**: `gap: clamp(12px, 3vw, 24px)`
- [ ] Ostatnia sekcja przed footerem ma min. 64px do dołu (nie styka się)

### D. Layout — stack, order, full-width

- [ ] Wszystkie `grid-template-columns: repeat(N, 1fr)` mają media-query → `1fr` na ≤768px
- [ ] Dwukolumnowe hero (text + visual) stack'uje się na mobile (text pierwszy!)
- [ ] Tabele → karty na mobile (`display: block` + labels via `::before`)
- [ ] Bento grid: tile-hero traci `grid-row: span 2` na mobile (zwykły flow)
- [ ] Footer: 4 kolumny → 1 lub 2 (nie squeeze do zera)
- [ ] `order` override dla sekcji hero gdy visual ma być nad textem (albo pod)

**Anti-pattern (PSUJE mobile):**
```css
/* ŹLE — mobile ma fixed width */
.hero-grid { grid-template-columns: 1fr 400px; }

/* DOBRZE */
.hero-grid { grid-template-columns: 1fr minmax(0, 400px); }
@media (max-width: 768px) { .hero-grid { grid-template-columns: 1fr; } }
```

### E. Hero mobile — pierwsze 5 sekund

- [ ] Headline + lede + CTA widoczne **above-the-fold** na 375×812 (iPhone 13)
- [ ] CTA primary jest `width: 100%` (nie `fit-content`) — trafić łatwo kciukiem
- [ ] Hero visual nie zajmuje >50% viewport (inaczej copy zjeżdża z ekranu)
- [ ] Brak floating decorations (pawłów, particles, glow rings) — `display:none` na ≤768px
- [ ] Trust badges: NIE 5 w linii — `flex-wrap: wrap` lub 2×2 grid
- [ ] Jeśli jest editorial numeral (Nº 01) — `font-size` zmniejszony min. 40%

### F. Navigation — header, sticky, urgency bar

- [ ] Header `position: fixed; top: 0;` (Conversion Toolkit wymaga!)
- [ ] Logo zmniejszony do `height: 32-40px` na mobile (nie 56px desktop)
- [ ] Hamburger: overlay `position: fixed; inset: 0;` z `transform: translateY(-100%)` default, `.open { translateY(0) }`
- [ ] Links w menu: `padding: 16px 20px`, `font-size: 18px` (touch-friendly)
- [ ] Menu zamyka się po kliknięciu linku (`mobileMenu.classList.remove('open')`)
- [ ] Body ma `padding-bottom: 70px` gdy aktywny mobile bottom bar (toolkit robi auto)
- [ ] Urgency bar ma `height: 44px` na mobile (nie padding!)

### G. Obrazy — ratio, lazy-load, placeholdery

- [ ] Wszystkie `<img>` mają `width` + `height` (CLS!)
- [ ] Hero image: `fetchpriority="high"`, BEZ `loading="lazy"` (LCP!)
- [ ] Reszta `<img>` ma `loading="lazy"` + `decoding="async"`
- [ ] Aspect-ratio preserved: `object-fit: cover; aspect-ratio: X/Y` zamiast fixed height
- [ ] `max-width: 100%` na wszystkich obrazach (żaden nie wyleje się z viewport)
- [ ] Produkt packshot na mobile: `max-height: 60vh` (żeby nie zajmował całego ekranu)

### H. Overflow-x — najczęstszy mobile bug

- [ ] `body { overflow-x: hidden; }` — ZAWSZE obecne
- [ ] Żaden element nie ma `width: 100vw` (powoduje scroll gdy jest scrollbar)
- [ ] Floating elements z `position: absolute; left: -X` są obcinane przez `overflow: hidden` na parent'cie
- [ ] Żadne `transform: translateX(...)` nie wystaje poza 100%

**Grep sanity (wykryj potencjalne leaki):**
```bash
grep -nE "width:\s*100vw|left:\s*-[0-9]+|right:\s*-[0-9]+" landing-pages/[slug]/index.html
```

### I. Interaktywne — touch zamiast hover

- [ ] Hover effects **działają też na tap** (`:active` obok `:hover`)
- [ ] FAQ accordion click działa (sprawdź w DevTools mobile emulacji)
- [ ] Testimonial carousel (jeśli jest) — swipe / scroll-snap
- [ ] Modale: close button `min 44×44px`, nie tylko `×`
- [ ] Sticky mobile CTA NIE zasłania ostatniej sekcji (body padding!)
- [ ] Żadne `:hover`-only interakcje ukrywające ważną treść (mobile user ich nigdy nie zobaczy)

### J. Performance mobile — LCP + CLS + INP

- [ ] Fonty: max 3 rodziny, `display=swap`, `&subset=latin-ext`
- [ ] `preconnect` do `fonts.googleapis.com` + `fonts.gstatic.com` (crossorigin!)
- [ ] Hero `<img>` ma `fetchpriority="high"`
- [ ] Heavy animacje (particles, parallax) wyłączone na `prefers-reduced-motion` + na ≤768px
- [ ] Żaden blocking script w `<head>` — JS przez `defer` lub koniec `<body>`
- [ ] Cel: **90+ mobile** w PageSpeed Insights (MEMORY.md)

---

## Bash scan — uruchom przed checklistą

Szybki grep-audit typowych mobile-sins na jednym landingu:

```bash
SLUG="[slug]"
F="landing-pages/$SLUG/index.html"

echo "=== A. Touch targets (ctas bez min-height) ==="
grep -cE "class=\"[^\"]*cta[^\"]*\"" "$F"
grep -nE "\.cta.*\{[^}]*(min-height|padding)" "$F" | head -5

echo "=== B. Typography — clamp() użyte na H1/H2? ==="
grep -nE "h[12].*\{[^}]*clamp\(" "$F" | head -5

echo "=== D. Grid → 1fr na mobile? ==="
grep -c "grid-template-columns: 1fr" "$F"  # powinno być ≥3

echo "=== G. Images bez width/height ==="
grep -nE "<img [^>]*>" "$F" | grep -vE "width=" | head -5

echo "=== H. Overflow-x hidden na body ==="
grep -nE "body\s*\{[^}]*overflow-x\s*:\s*hidden" "$F"

echo "=== H. Potencjalne leaki (100vw, negative positioning) ==="
grep -nE "width:\s*100vw|left:\s*-[0-9]+px" "$F" | head -5

echo "=== J. fetchpriority na hero ==="
grep -c 'fetchpriority="high"' "$F"  # powinno być ≥1

echo "=== J. preconnect do fontów ==="
grep -c 'rel="preconnect"' "$F"  # powinno być ≥2
```

Output pokazuje gdzie są luki — zaadresuj je, zanim pójdziesz przez checklist.

---

## Wzorcowe mobile-only fixy (copy-paste)

### Fix 1 — Hero stack z visual pod tekstem
```css
@media (max-width: 768px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .hero-content { order: 1; text-align: center; }
  .hero-visual  { order: 2; max-height: 50vh; }
  .hero-cta { width: 100%; }
}
```

### Fix 2 — Trust strip który NIE rozjeżdża się
```css
.trust-strip {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}
.trust-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
  white-space: nowrap;
}
.trust-item strong, .trust-item span, .trust-item em {
  white-space: nowrap;
}
@media (max-width: 480px) {
  .trust-strip { flex-direction: column; align-items: flex-start; }
}
```

### Fix 3 — Ukryj decorations, zachowaj treść
```css
@media (max-width: 768px) {
  .floating-paw, .floating-heart, .particles,
  .hero-glow, .hero-ring, .editorial-numeral-bg,
  .parallax-layer { display: none !important; }
  .editorial-numeral { font-size: clamp(48px, 14vw, 80px); opacity: 0.15; }
}
```

### Fix 4 — Bento hero tile → flat flow
```css
@media (max-width: 768px) {
  .bento-grid { grid-template-columns: 1fr; gap: 16px; }
  .bento-tile--hero { grid-row: auto; grid-column: auto; min-height: 280px; }
  .bento-tile { padding: 24px; }
}
```

### Fix 5 — Footer 4 kolumny → 2 kolumny → 1
```css
.footer-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
}
@media (max-width: 768px) {
  .footer-grid { grid-template-columns: 1fr 1fr; gap: 24px; }
}
@media (max-width: 480px) {
  .footer-grid { grid-template-columns: 1fr; gap: 20px; }
  .footer-brand { text-align: center; }
}
```

---

## Re-verify loop

Po naprawach:

```bash
bash scripts/screenshot-landing.sh [slug]
```

Obejrzyj ponownie **mobile_full.png** + 3 mid-scroll viewporty. Kontynuuj iterację aż:

- [ ] Nie ma horizontal scroll
- [ ] Wszystkie sekcje mają "oddech" (nie rozlepione, nie spłaszczone)
- [ ] Headline'y nie ucięte
- [ ] CTA łatwo trafić kciukiem
- [ ] Hero widoczny above-the-fold
- [ ] Rytm jasno/ciemno czytelny (nie "szara sieczka")

---

## Finalna mobile certyfikacja

Przed commitem odpowiedz TAK na wszystkie 5:

1. **Wrzuciłbym to na swój Instagram?** Ma być eye-candy, nie "CMS template"
2. **Klient otworzyłby portfel w 30 sek?** Hero + CTA + trust + cena — wszystko above-fold or 1 scroll
3. **Mieszczę się pod kciukiem?** CTA + nav + checkboxy — wszystko touch-friendly
4. **Nie ma "AI-looking" artefaktów?** Żadnych emoji zamiast ikon, żadnych tęczowych gradientów w nagłówkach
5. **Przeszedłby audyt senior designera?** Rytm, hierarchia, kontrast — nie "wszystko równo"

Jeśli którekolwiek NIE → wracaj do ETAP 4 (design polish) lub ETAP 2 (copy).

---

**Po ostatecznym PASS → commit + push + link.**

Patrz `05-verify.md` Krok 7 (commit & deploy).
