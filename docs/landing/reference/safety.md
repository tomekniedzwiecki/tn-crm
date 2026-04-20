# Safety Rules — zasady bezwarunkowe (single source of truth)

> **Single source of truth dla 10 reguł safety.** Inne pliki (01-direction, 02-generate, 04-design, 05-verify, 06-mobile, reference/patterns) LINKUJĄ tutaj, nie duplikują.

## Kiedy czytać
- Przed ETAP 2 (generate) — jako checklist wejściowy
- W trakcie ETAP 4 (design polish) — przy modyfikacjach
- Przed deploy — `verify-landing.sh` waliduje każdą regułę przez grep checks

## Dlaczego te reguły
Każda z 10 reguł powstała z konkretnego incydentu (godziny debugowania, zepsute landingi, niezadowoleni klienci). Te problemy są zbyt drogie żeby je powtarzać.

---

## 1. NIGDY nie kopiuj layoutu z istniejących landingów

**Zasada bezwzględna (memory: `feedback-landing-always-forge.md`):** każdy nowy landing budujesz **od zera**. NIE używaj `cp -r landing-pages/$BASE` ani „adaptacji sprawdzonego layoutu" — nawet jeśli baseline „pasuje" do kierunku.

**Dlaczego:**
- **Local maxima** — kopiowanie istniejącego baseline = powielanie jego błędów + brak ewolucji designu
- **Klient widzi „rodzeństwo" landingów** zamiast unikalnej marki
- **AI-slop** — adaptacja sprawdzonego layoutu wygląda jak kolejna iteracja tego samego
- **Procedura nie jest uniwersalna** — gdyby `landing-pages/` było puste, copy-adapt by nie działał. Procedura ma działać uniwersalnie, **bez żadnego przykładu**.

**Co MOŻESZ używać** (to NIE są layouty):
- Architektura 14 sekcji z [`02-generate.md`](../02-generate.md) — szkielet semantyczny
- Snippety copy-paste z [`reference/patterns.md`](patterns.md) — safety primitywy (fade-in safe, dual-bank mobile, header solid, magnetic CTA, etc.)
- Tabela anty-referencji w [`01-direction.md` Krok 5](../01-direction.md) — historia co JUŻ JEST, czego NIE powtarzać

**Co MUSISZ od zera**:
- CSS tokens (paleta z `workflow_branding`, NIE z baseline)
- Typografia (z `workflow_branding`, NIE z baseline)
- Signature elements (per manifest z `_brief.md`, NIE z baseline)
- Layout sekcji (struktura 14 sekcji TAK, ale grid/spacing/proporcje od zera)
- Animacje (subtelne z `reference/patterns.md`, ale dobór per kierunek)

**Wyjątek:** [`migrate.md`](../migrate.md) Use case 2 — modyfikacja **istniejącego** landinga (nie tworzenie nowego od zera). Tam pracujesz z gotowym index.html.

---

## 2. Fade-in `opacity:0` MUSI mieć JS gate (html.js class)

**Antywzorzec (ŹLE — ukrywa 80% strony gdy JS padnie / bot crawluje):**
```css
.fade-in { opacity: 0; transform: translateY(30px); transition: ... }
.fade-in.visible { opacity: 1; }
```

**Poprawnie — gate'uj przez klasę `.js` na `<html>`:**
```html
<head>
  <script>document.documentElement.classList.add('js')</script>
</head>
```
```css
html.js .fade-in { opacity: 0; transform: translateY(30px); transition: ... }
html.js .fade-in.visible { opacity: 1; transform: translateY(0); }
```
```js
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  }), { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });
  document.querySelectorAll('.fade-in').forEach(el => io.observe(el));

  // Safety fallback: po 3s pokaż TYLKO te elementy które user powinien już widzieć
  setTimeout(() => {
    document.querySelectorAll('.fade-in:not(.visible)').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) el.classList.add('visible');
    });
  }, 3000);
} else {
  document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
}
```

**Dlaczego:** crawler, fullpage screenshot, print, slow JS, wyłączony JS = 80% strony niewidoczne. Bez `html.js` gate'u nigdy tego nie zauważysz.

### KRYTYCZNE — safety timeout MUSI filtrować po pozycji

```js
// ❌ ŹLE — po 2.5s wszystkie fade-in (też te na końcu strony) stają się visible
setTimeout(() => document.querySelectorAll('.fade-in:not(.visible)')
  .forEach(el => el.classList.add('visible')), 2500);
```
To psuje scroll-reveal — user siedzi w hero 3 sekundy, a cała strona (nawet offer 10 ekranów niżej) już się „odkryła". Gdy doscrolluje, nic się nie pojawia.

**✅ Poprawnie:** safety filtruje `getBoundingClientRect().top < window.innerHeight` — pokazuje tylko to co user powinien widzieć NA EKRANIE.

**Gotowy snippet do copy-paste:** [`reference/patterns.md` #11 Fade-in safe](patterns.md#11-fade-in-safe)

---

## 3. Element absolute position w karcie — dual bank dla mobile

Absolute positioning (spec badges nad produktem, floating elements) psuje się na mobile gdy kontener ma inny aspect-ratio. **Dwa banki treści:** jeden absolute desktop, drugi static mobile (pod kartą) z `display:none` na przeciwległym viewporcie.

```html
<figure class="hero-figure">
  <div class="hero-spec-stack"><!-- absolute, desktop only --></div>
</figure>
<div class="hero-spec-stack-mobile"><!-- static, mobile only --></div>
```
```css
.hero-spec-stack-mobile { display: none; }
@media (max-width:768px) {
  .hero-figure .hero-spec-stack { display: none; }
  .hero-spec-stack-mobile { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 16px; }
}
```

**Gotowy snippet:** [`reference/patterns.md` #7 Hero Spec Stack DUAL BANK](patterns.md#7-hero-spec-stack)

---

## 4a. KAŻDA sekcja wizualna MUSI mieć placeholder zdjęcia

**Zasada bezwzględna (memory: `feedback-landing-placeholder-per-section.md`, `feedback-landing-hero-image-required.md`):** każda sekcja która normalnie zawiera fotografię/ilustrację MUSI mieć placeholder z 4-polowym briefem fotografa. Signature element (numerał, ikona, pattern) NIE zastępuje placeholdera.

**Sekcje wizualne WYMAGANE (verify-landing.sh blokuje deploy jeśli brak):**

| Sekcja | Min liczba | Klasa CSS (dowolna z wymienionych) | Typ zdjęcia |
|--------|-----------|------------------------------------|-------------|
| Hero | 1 | `hero-figure` / `hero-image` / `hero-product` | Packshot produktu, lifestyle |
| Gallery | 5–6 | `gal-figure` / `bento-image` / `gallery-image` | Detail + context shots |
| Personas | 3 | `persona-figure` / `persona-image` | Persona w kontekście użycia |
| Testimonials | 2–4 | `testi-avatar-figure` / `voice-figure` / `avatar-figure` | Zdjęcie twarzy klienta 112×112 |
| Procedure / How | 3 | `step-figure` / `step-image` / `how-figure` | Ujęcie z wykonywania kroku |
| Final CTA | 1 (opcjonalne) | `final-cta-figure` / `cta-figure` / `bg-figure` | Panorama / bg image |

**Przykład (w `<section class="hero">`):**
```html
<div class="hero-figure img-placeholder">
  <div class="ph-mark">P · HERO</div>
  <div class="ph-title">Packshot Caffora w ręce</div>
  <div class="ph-size">1200 × 1500 · pionowa 4:5</div>
  <div class="ph-note">Caffora trzymana w ręce, dłoń mężczyzny. Tło: deep charcoal z brass vignette. Side-back 45°.</div>
</div>
```

**Dlaczego:** klient potrzebuje wyraźnego miejsca gdzie ma trafić zdjęcie W KAŻDEJ SEKCJI — nie tylko w hero. Landing bez placeholderów w testimonials/personas/steps = fotograf dostaje brief tylko na hero, reszta sekcji zostaje „naga" po podstawieniu zdjęć. Brak placeholderów w tych sekcjach był częstym błędem do 2026-04 (np. testimonial avatary zamieniane na gradient kółka z inicjałami zamiast brief na zdjęcie).

**Jak sprawdzić:** `verify-landing.sh` ma osobny blok `1a. Placeholder per section` — każda sekcja liczona osobno.

## 4. Placeholder MUSI być briefem dla klienta, nie „TODO"

**ŹLE:**
```html
<div class="img-placeholder">Hero Image 1200×900</div>
```

**DOBRZE — 4 pola** (mark, title, size, ton/światło):
```html
<div class="ph">
  <div class="ph-mark">P</div>
  <div class="ph-title">Fotografia produktowa</div>
  <div class="ph-size">Paromia Handheld · 1200 × 1500</div>
  <div class="ph-note">Neutralne tło (ivory/paper). Orientacja pionowa 4:5, przycięte ciasno. Światło miękkie, boczne.</div>
</div>
```

**Dlaczego:** placeholder zostaje na landingu dopóki klient nie dostarczy zdjęć. Bez briefu fotograf nie wie co strzelać → opóźnienie tygodni.

**Gotowy snippet:** [`reference/patterns.md` #10 Placeholder z briefem](patterns.md#10-placeholder)

---

## 5. Weryfikuj wizualnie ZANIM commit (ETAP 5 + 6 OBOWIĄZKOWE)

**Nigdy nie commituj bez sprawdzenia screenshotem.** ETAP 5 ([`05-verify.md`](../05-verify.md)) + ETAP 6 ([`06-mobile.md`](../06-mobile.md)) są obowiązkowe. Code review nie wyłapuje:
- 80% strony niewidocznej przez `opacity:0` (reguła #2)
- Hero rozjeżdżający się na 375px
- Polskie diakrytyki obcięte w UPPERCASE (reguła #7)
- Header rgba+backdrop nieczytelny na mobile (reguła #9)

W AUTO-RUN mode te etapy są autonomiczne (Playwright + bash scan), ale **nie pomijalne**.

---

## 6. ⛔ Zakazane obietnice — ZERO TOLERANCJI

Nigdy nie umieszczaj w trust-bar / FAQ / hero / offer:

### Wysyłka i dostawa
- ❌ „Wysyłka 24 h" / „Wysyłamy w 24h" / „D+1"
- ❌ „z magazynu w Polsce" / „z polskiego magazynu"

**Dlaczego:** większość produktów jest w Fazie 1 modelu (dropshipping AliExpress/agent w Chinach). Realna dostawa = 10–14 dni. Magazyn w Polsce to Faza 3, nieliczne projekty. Fałszywa obietnica = masa zwrotów i reklamacji.

**Zamiast tego:**
- ✅ „30 dni na zwrot" / „Bez pytań"
- ✅ „Darmowa dostawa" / „InPost · DPD · kurier"
- ✅ „2 lata gwarancji" / „polska obsługa"
- ✅ „Bezpieczna płatność"

**FAQ „Kiedy otrzymam przesyłkę?":**
```
Przesyłka dociera w 1–3 dni robocze od zaksięgowania wpłaty.
Dostawa InPostem, DPD lub kurierem — darmowa.
```
(bez konkretnej godziny wysyłki)

### Płatności — tylko przedpłata
- ❌ „Za pobraniem" / COD
- ❌ „Ratalnie" / „Rozłóż na raty" / PayPo / Klarna / Twisto
- ❌ Jakiekolwiek BNPL (Buy Now Pay Later)

**Zamiast tego (kolejność jak w offer/checkout):**
- ✅ **BLIK (PIERWSZE)** — najpopularniejsze w PL
- ✅ Karta VISA/MasterCard
- ✅ Przelewy24 / P24
- ✅ Apple Pay / Google Pay

### Grep control (uruchamiane przez verify-landing.sh)
```bash
grep -ciE "24 ?h|w 24h|polski magazyn|magazyn.*Polsce|D\+1|pobraniem|PayPo|Klarna|Twisto|raty|ratach|ratalnie" landing-pages/[SLUG]/index.html
# Oczekiwane: 0
```

---

## 7. Polskie diakrytyki UPPERCASE → line-height ≥ 1.2

Litery **Ł Ś Ć Ź Ż Ń Ó** mają kreski/kropki nad/pod znakiem. Domyślne `line-height: 1` + `text-transform: uppercase` + `letter-spacing` **obcina diakrytyki** — widać artefakty, odcięte kreski, nakładanie na sąsiedni wiersz.

**Widoczne najczęściej w:**
- Nav links, header CTA
- Eyebrow / kicker („N**º** 03 — ATELIER")
- Trust strip strong, buttons, footer headers
- Tile kickers, spec keys, persona meta

**Zawsze dodawaj do klas z `text-transform: uppercase`:**
```css
.nav-link, .eyebrow, .header-cta, .trust-item strong,
.btn, .footer-col h4, .tile-kicker {
  line-height: 1.4;   /* minimum 1.2, bezpieczne 1.4 */
  text-transform: uppercase;
}
```

**Lub jedna globalna reguła (zalecane dla editorial/luxury):**
```css
[class*="eyebrow"], [class*="kicker"], [class*="label"],
.nav-link, .header-cta, .mobile-link, .page-number,
.trust-item strong, .btn, .footer-col h4 {
  line-height: 1.4;
}
```

### UWAGA — nie każdy font renderuje „Ł" poprawnie w uppercase

| Font | Polska „Ł" w UPPERCASE | Używać? |
|------|-------------------------|---------|
| **Italiana** | ❌ ukośna kreska wychodzi **ponad** górną belkę | NIE |
| **Playfair Display SC** | ❌ czasem obcięte | ostrożnie |
| **Fredoka One** | ❌ brak polskich znaków | NIE — użyj `Fredoka` |
| **Patrick Hand** | ❌ brak polskich znaków | NIE — użyj `Caveat` |
| **Fraunces** | ✅ prawidłowa | TAK |
| **Cormorant Garamond** | ✅ prawidłowa, elegancka | TAK (editorial) |
| **Libre Bodoni** | ✅ prawidłowa | TAK |
| **EB Garamond** | ✅ prawidłowa | TAK |
| **Inter** | ✅ prawidłowa | TAK (body/nav) |
| **Poppins, Roboto, Space Grotesk** | ✅ prawidłowa | TAK |

**Przed wyborem fontu editorial dla eyebrow / page-numbers — przetestuj go na frazie `Nº 04 — RYTUAŁ` i `ZAMÓW · 249 ZŁ`.** Jeśli Ł ma kreskę nad literą → wymień font.

**Zamiennik Italiana:** `Cormorant Garamond` (waga 300/400) — ten sam editorial feel, poprawne PL.

---

## 8. Oversized editorial numeral > animated glow orbs

Dla produktów premium/luxury/lifestyle — pojedyncza wielka cyfra w tle hero (Fraunces italic, 280-440px, color: paper-3) wygląda 10× bardziej profesjonalnie niż animowane glow orby. To jeden element, który klient zapamięta.

```html
<div class="hero-numeral">26<sup>sek.</sup></div>
```
```css
.hero-numeral {
  position: absolute; top: -40px; right: -20px; z-index: -1;
  font-family: var(--font-display);
  font-size: clamp(280px, 28vw, 440px);
  font-weight: 300; font-style: italic;
  color: var(--paper-3); letter-spacing: -.04em; line-height: .78;
  user-select: none;
}
```

**Zakazane:** cursor followers, glitch effects, confetti, auto-play video w hero, animated background particles na mobile.

**Gotowy snippet:** [`reference/patterns.md` #1 Oversized Editorial Numeral](patterns.md#1-oversized-editorial-numeral)

---

## 9. Header — ZAWSZE solid #FFFFFF (NIE rgba + backdrop-filter)

```css
.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: #FFFFFF;               /* nie paper-2, nie backdrop-filter, nie rgba — czysty #FFF */
  border-bottom: 1px solid var(--rule);
}
```

**Dlaczego:**
- Biały header zawsze kontrastuje z zawartością poniżej (hero, sekcje ciemne), niezależnie od palety produktu
- Logo klienta jest zaprojektowane na białym tle — każdy inny kolor w headerze psuje jego czytelność
- `rgba() + backdrop-filter: blur()` jest nieczytelne na mobile (słaby kontrast nad treścią)

**Logo w headerze:** tylko grafika, BEZ napisu tekstowego obok (logo zawiera już nazwę marki — nie dublujemy).

**Header MA BYĆ fixed + zawsze widoczny:**
- `position: fixed; top: 0;`
- Bez hide-on-scroll JavaScript
- Z-index ≥ 100

---

## 10. Fonty / assety — zawsze pełne URL-e

### Google Fonts — NIGDY `&subset=latin-ext` (anty-wzorzec)
```html
<!-- ✅ DOBRZE — BEZ subset=latin-ext -->
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

**NIE dodawaj `&subset=latin-ext`.** Google Fonts v2 przy tym parametrze dla niektórych fontów (Fredoka, Nunito w starszych wersjach) serwuje **jeden plik TTF bez `unicode-range`** zawierający tylko basic latin (U+0000-00FF) → polskie znaki ą/ę/ć/ł/ó/ś/ź/ż/ń wypadają poza zakres → fallback na systemową kursywę dla pojedynczych glyphów („zdjęcia" ma `ę` w innym fonie niż reszta).

Bez parametru Google zwraca pełny CSS z multiple `@font-face` per `unicode-range` (latin, latin-ext, cyrillic, vietnamese) — przeglądarka sama pobiera potrzebne subsety. To standard Google Fonts v2. Memory: `feedback-landing-fonts-polish.md`.

**Max 3 rodziny fontów.** Każda dodatkowa = +200ms LCP.

### Fallbacki dla fontów bez polskich znaków
- `Fredoka One` → użyj `Fredoka`
- `Patrick Hand` → użyj `Caveat`

### OG image + logo — pełny URL Supabase (nie względny)

```html
<!-- ❌ ŹLE — względny path, nie zadziała po przeniesieniu na TakeDrop -->
<img src="./logo.png" alt="Logo">
<meta property="og:image" content="/landing-pages/foo/og.jpg">

<!-- ✅ DOBRZE — pełny URL Supabase Storage -->
<img src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/landing/foo/logo.png" alt="Logo" width="140" height="36">
<meta property="og:image" content="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/landing/foo/og.jpg">
```

**Dlaczego:** landingi są przenoszone na TakeDrop / inne hostingi — względne paths się rozjeżdżają.

**Upload assetu:**
```bash
curl -X POST "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/attachments/landing/[slug]/logo.png" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: image/png" \
  --data-binary @"landing-pages/[slug]/logo.png"
```

---

## Grep control — automatic enforcement

Każda reguła ma odpowiadający check w `scripts/verify-landing.sh`. Pełna tabela 18 checks → [`05-verify.md`](../05-verify.md).

**Przed deploy:**
```bash
bash scripts/verify-landing.sh [slug]   # 18/18 checks
```

**Przed każdą zmianą safety rule (regression):**
```bash
bash scripts/verify-all-landings.sh    # 6/6 baseline'ów
```

---

## Cross-references

- Implementacja kodu (snippety) → [`reference/patterns.md`](patterns.md)
- Wybór baseline'u (mismatch decision) → [`01-direction.md` Krok 6](../01-direction.md)
- Offer box (zakazane płatności H.3) → [`04-design.md` sekcja H](../04-design.md)
- Mobile-specific safety (touch targets, overflow) → [`06-mobile.md`](../06-mobile.md)
