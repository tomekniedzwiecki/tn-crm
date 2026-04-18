# Design Brief — tomekniedzwiecki

## Positioning

**Personal brand Tomka Niedźwieckiego jako partnera wzrostu dla kancelarii prawnych.** Nie generic "web developer / marketer". Specjalizacja: kancelarie w niszach mass-market (imigracja, upadłość konsumencka, rozwody, prawo pracy). Łączy CRM/software + performance marketing + strategic advisory.

**Adresat:** właściciel lub partner kancelarii 3-15 osobowej, zmęczony Excelem, rosnący ale chaotycznie, wie że potrzebuje systemu ale nie wie od czego zacząć.

**Anchor klient:** Paweł Stachurski / GetMyPermit (kancelaria imigracyjna Wrocław). Case study widoczny w całej stronie.

## Value proposition

**"Kancelaria, która działa jak firma. Nie jak biuro."**

Buduję system (CRM + intake klienta + kampanie + analityka), który sprawia że kancelaria obsługuje 3× więcej spraw bez dokładania godzin. Płacisz za wyniki, nie za widoczność.

## Design direction

**Visual vibe:** Premium editorial + legal gravitas. Nie korporacyjny. Nie startupowy. Bardziej jak The Economist / Stripe / Rally.

**Tło:** Kremowe, ciepłe `#faf8f3` (nie czyste białe — bardziej "papier"). Dodatkowe tła sekcji: `#f0ede6` dla contrast blocks.

**Kolor primary:** Granat `#1e3a5f` (typowy dla legal brands). Headings, key text.

**Kolor akcent:** Burgund `#991b1b` dla CTA button + highlight. Rzadko używany, ale mocno.

**Kolor success/neutral:** `#166534` (ciemny szmaragd) dla "checkmark" list. `#57534e` (stone-600) dla body text.

**Typografia:**
- **Display/heading:** `Fraunces` (variable, opsz 144) — editorial serif z optical sizing dla wielkich głów. Waga 500-700.
- **Body:** `Inter` 400/500. Waga 600 dla emfazy.
- **Eyebrow/kicker/label:** `Space Mono` 500, uppercase, letter-spacing 0.12em, 11-12px. Dla technical labels i liczby.

**Typography rules dla PL:**
- Fraunces heading → `line-height: 1.15` MINIMUM (żeby Ł/Ś/Ź/Ż/ą się nie obcinały)
- Font-optical-sizing auto włączone
- Max 4 font-weights załadowanych

**Radius:** 8-14px zwykle, 20px dla hero cards, 999px dla pill badges. Bez ostrych.

**Shadow:** Minimalne, `0 1px 2px rgba(30,58,95,0.05)` dla cards. Heavier tylko dla pricing highlighted card.

**Animations:** Subtle. Opacity + translateY 16px, `cubic-bezier(0.2, 0.9, 0.3, 1)`, 600-800ms. IntersectionObserver dla scroll-reveal. No gimmicks.

## Page structure (7 sekcji)

1. **Hero** — sticky nav + value prop + dual CTA + social proof row
2. **Problem** — 3 pain points card layout
3. **System** — 4 moduły produktu (CRM, Intake, Kampanie, Admin)
4. **Case study** — Paweł/GetMyPermit z realnymi liczbami z CRM
5. **Proces** — 4-step onboarding (discovery / setup / szkolenie / growth)
6. **Pricing** — 3 tier + addon performance marketing
7. **FAQ** — 6-8 pytań (RODO, etyka, integracje, własność kodu)
8. **O Tomku** — bio + credentials + kontakt

Footer: social + subtle copyright.

## Content principles

- **Pisz konkretnie.** Nie "zwiększamy efektywność" — "prawnicy oszczędzają 20h/msc".
- **Liczby > przymiotniki.** 5 075 spraw > "dużo spraw".
- **Case study w dwóch miejscach:** hero social proof + dedykowana sekcja.
- **Pricing widoczny.** Żadnego "skontaktuj się w sprawie wyceny" w tier Starter/Growth.
- **No B2B fluff.** Nie "synergia", "unikalne rozwiązania", "lider rynku".

## Brand voice

Warm but authoritative. Prosty polski. Jak doświadczony przedsiębiorca rozmawiający z innym właścicielem firmy. Nie prawnik do prawnika. Nie startuperowiec.

## Tech

- Vanilla CSS z `:root` variables (konwencja tn-crm)
- Preconnect fonts: Google Fonts
- Minimal JS: scroll-reveal IntersectionObserver + FAQ accordion + smooth scroll nav
- PageSpeed target: 95+ mobile (no heavy images, SVG icons)
- Responsive: mobile-first, breakpoints 640/1024
- Accessibility: WCAG AA contrast, focus rings, semantic HTML

## Out of scope (version 1)

- Blog/content marketing sekcja
- Multi-language (tylko PL)
- Video testimoniale
- Interactive CRM demo
- Newsletter signup

Wersja 2 po pierwszych 10 konsultacjach z landing.
