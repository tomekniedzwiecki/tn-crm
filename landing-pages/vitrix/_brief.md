# Vitrix — Landing Brief

**Status:** 🟢 Live · **Kierunek:** Panoramic Calm · **Workflow:** `8c3494aa-d776-4eac-956e-4c90ebda643f`

---

## 1. Design Manifesto

### Kierunek: **Panoramic Calm**
Estetyka architektonicznego spokoju. Strona ma czuć się jak widok z 18. piętra o poranku: dużo światła, proste linie, jeden moment dramatyzmu. Nie „tech produkt", tylko „element dobrego życia".

### Tempo: **spokojne**
Padding sekcji 140-180px desktop, 80-100px mobile. Animacje wolne (800-1000ms cubic-bezier), nigdy bouncy.

### Typografia
- **Display:** `Plus Jakarta Sans` 500/700 — geometryczny grotesk z subtelnym ciepłem
- **Editorial accent:** `Instrument Serif` italic — hero numeral (5800), finale numeral, section eyebrow
- **Body:** `Inter` 400/500
- **Technical mono:** `Space Mono` 400 10-11px uppercase — micro-labels, spec sheet

### Paleta 60/30/10
- **60% Dominant:** `#F8FAFC` Cloud White + `#F4F2ED` Paper (warmer off-white)
- **30% Secondary:** `#0D2137` Deep Navy + `#0A1628` Midnight — w 2 ciemnych sekcjach (Spec Sheet + Finale)
- **10% Accent:** `#00B4A6` Crystal Teal — wyłącznie: italic em, hover, stat labels
- **Urgency (1×):** `#FF7B6B` Soft Coral — tylko przekreślona cena

### Signature elements
1. **Hero numeral:** `5800 Pa` w Instrument Serif italic clamp(220px, 26vw, 440px), nawy 6% opacity, rotate(-3deg)
2. **Section numbering:** `Nº 01–10` w Space Mono + długa linia per sekcja
3. **Spec Sheet moment:** ciemna sekcja Midnight z przekrojem + karta techniczna
4. **Finale numeral:** „10" w środku Finale, centered, parallax

### Od czego uciekam
- Glow orbs + pulsujące waves + sparkle particles
- Gradient backgrounds w każdej sekcji
- Teal shadow na każdej bento card hover
- Identyczny 2×2 bento grid
- Ikony ✓/✗
- Inter jako display

---

## 2. Photo System

### Reference product image
`https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/ai-generated/vitrix/1776059897924_0.jpg`

Produkt: biały robot do mycia okien, kształt prostokątny z zaokrąglonymi rogami, centralny biało-srebrny okrągły dysk, dwie szare poduszki z mikrofibry, czarne gumowe uszczelki, mały przycisk. ~25×18 cm.

### Lighting
Miękkie naturalne światło poranne, kierunkowe z lewej (wschód), rozproszone. Bez hard shadows. „7am autumn Nordic morning", chłodny ton.

### Paleta scen
- **Tła wnętrz:** off-white ściany `#F4F2ED`, linen sofa pastel, dąb podłoga, Muji/HAY vibe
- **Akcenty:** subtelny petrol/teal na 1 elemencie (kubek, książka) — NIGDY całe meble
- **Niebo:** zachmurzone szaro-błękitne, Warszawa out-of-focus
- **Unikamy:** golden hour, neon, mocne kontrasty

### Kadrowanie
- **Hero:** low-angle, produkt w 1/3 lewej, pusta przestrzeń
- **Lifestyle:** half-body lub detal rąk, nigdy full-body stock
- **Detal produktu:** makro 45° z cross-light
- **Personas:** environmental portrait, naturalne włosy

### Stały suffix promptu (realism injector)
```
Shot on 35mm film (Kodak Portra 400), slightly grainy, mild halation,
imperfect hand-held framing with slight tilt, natural imperfections —
faint dust on surfaces, slightly smudged glass, lived-in feel with one
or two out-of-place objects. Candid documentary photography session,
not studio product shot. No text, no captions, no labels, no watermarks.
```

### Negatywy — NIGDY
- Neon glow / LED (nie ma na referencji)
- Golden hour warm tones
- Stock-photo body language
- Clutter (zabawki, plakaty)
- Tekst w kadrze
- Halucynacje funkcji produktu

---

## 3. Personas (z raportu strategicznego)

### Anna — 36 l., prawniczka, Warszawa Wola
- Apartament 18. piętro, panoramiczne okna
- Capsule wardrobe: cream cashmere, minimal jewelry, tied-back brown hair
- Weekendy górskie, po pracy zmęczona
- **Cytat:** „Po 12 godzinach w kancelarii nie wejdę na drabinę. Firma sprzątająca jest za 280 zł."

### Marek — 42 l., IT Manager, Kraków Podgórze
- Para bez dzieci, Mercedes GLC, tech-oriented
- Kupił mamie na urodziny (68 lat, wchodziła na parapet)
- Minimalist casual, dark sweater + white tee
- **Cytat:** „Kupiłem mamie. Pilot jest prostszy niż aplikacja — ogarnęła w dwie minuty."

### Kasia — 34 l., architektka wnętrz, Poznań Jeżyce
- Loft z 4-metrowymi oknami, Instagram @studio
- Kreatywna, messy bun, linen overshirt
- **Cytat:** „Loft z 4-metrowymi oknami. Próbowałam droższych robotów — za dużo aplikacji."

---

## 4. Mapping manifesto → decyzje w kodzie

| Decyzja | Wartość |
|---|---|
| Hero background | `#F4F2ED` paper + architektoniczna siatka 12-col |
| Hero headline | Plus Jakarta 700 + 1 słowo Instrument Serif italic teal |
| Signature HTML | `<div class="hero-numeral">5800<sup>Pa</sup></div>` rotate(-3deg) |
| Dark section rytm | 2 ciemne: Spec Sheet + Final CTA |
| Animacja hero | Subtle fade-in + scroll parallax numeral (speed 0.18) |
| Border-radius global | 4px; offer-box wyjątek 16px |
| Shadow | `rgba(13,33,55,.08)` navy, nigdy czarny |
| Divider | Eyebrow `Nº XX/10 ── NAZWA` + linia |

---

## 5. Referencje moodboard (Krok 2 DIRECTION)

1. **Dyson** (V15 Detect) — mikrotypograficzne bloki danych tech
2. **Kinfolk magazine** — oversized editorial numerals, Nº sekcji
3. **Bang & Olufsen** (Beosound Balance) — theatrical dark, biały tekst na granat

---

## 6. Decisions log

- **2026-04-17 v1** Generacja pierwsza: bento `grid-row:span 2` → puste komórki. Fix: full-width tile-hero banner (3 cols)
- **2026-04-17 v2** Header: `rgba + backdrop-filter` → czysty `#FFFFFF`. Usunięty wordmark obok logo
- **2026-04-17 v3** Spec Sheet: 2-col grid → centered header + 2-col body
- **2026-04-17 v4** Offer: kompaktowy → editorial spec-sheet z monumentalną ceną 140px + teal rule
- **2026-04-17 v5** Obrazy: pierwsze AI „postcard-perfect" → 35mm film realism injector (Kodak Portra 400)
- **2026-04-17 v6** tile_hero: shape constraint „MATCH PRODUCT EXACTLY" — poprawił kształt z owalnego na prostokątny
- **2026-04-17 v7** Film grain overlay body::before usunięty (użytkownik: nietrafiony)
- **2026-04-17 v8** JS effects: 4 dodane (split headline, counter, magnetic CTA, tile tilt)
- **2026-04-17 v9** Fade-in safety: bezwarunkowy timeout → filtruje `getBoundingClientRect().top < innerHeight`

---

## 7. JS Effects zaimplementowane

- `.js-split` na hero H1 (22ms/char stagger)
- `.js-counter` na 3 hero stats (5800 Pa, 20 min, 30 dni) + offer savings — easeOutCubic 1.4s
- `.magnetic` na .btn-primary, .btn-light — factor 0.18
- Tile tilt — rotateX/Y max 4°, perspective 900px
- Scroll parallax — hero-numeral speed 0.18, finale-numeral speed 0.12
- Staggered fade-in — atelier/ritual/personas/voices/epochs/faq grids

---

## 8. Live link

https://tn-crm.vercel.app/landing-pages/vitrix/
