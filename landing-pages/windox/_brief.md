# Design Brief — Windox

<!-- v3 procedura 2026-04-21. MODE=forge. Workflow 59a27b7b-22e8-4da1-a8c0-e9a02d037c4d. -->

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [x] Nowy: **Engineered Air** — premium tech-precision z oddechem panoramicznego widoku. Inspiracja: Dyson (micro-typographic spec labels) + Bang & Olufsen (dark elegance + światło) + Leica (rzemiosło precyzji). Ciemny hero z monumentalną liczbą 5600 Pa, light body sekcje, cyan akcent TYLKO na liczbach i CTA. Unikam „smart home slop" (gradient purple/blue, glow orbs, neon tech).

**Uzasadnienie wyboru:** Windox sprzedaje **kontrolę nad bezpieczeństwem** (potrójne zabezpieczenie + 5600 Pa) — to nie lifestyle warm ani playful. Mocna techniczna liczba jako flagowy hook wymaga kierunku premium-tech z inżynierską powagą, ale także oddechu panoramicznego widoku (produkt daje CZYSTE OKNA = lepszy widok). Żaden z 6 istniejących baseline'ów tego nie zawiera.

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

1. **Dyson** — micro-typografia w stylu inżynierskim: `5600 PA` w Space Mono uppercase z long letter-spacing nad headline; „data block" z 3-4 mikro-liczbami jako spec-stack nad produktem. Geometryczny sans-serif bold.
2. **Bang & Olufsen** — ciemny hero z wielkim oddechem (duża przestrzeń między elementami), produkt fotografowany w niskim kluczu z dramatycznym światłem. Typografia premium ale powściągliwa, bez fajerwerków.
3. **Leica** — rzemiosło detalu: każda specyfikacja techniczna traktowana z namaszczeniem (liczba jest dziełem, nie kolejnym pułapką), materiał „technical drawing" jako element graficzny (grid, cross-hairs, wymiary).

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent):** #00D4E8 — Crystal Cyan (liczby, CTA, highlight)
- **Ink (główny tekst):** #0D1B2A — Deep Space (hero tło ciemne, nagłówki na jasnym body)
- **Paper (tło):** #F7FAFC — Cloud White (body sekcje, oddech)
- **Accent / Gold (opcjonalny):** #FF6D3A — Safety Orange (TYLKO badge bezpieczeństwa, ultra-sparingly)

Wsparcie: `#1B2838` Dark Navy (gradient hero), `#4A5568` Steel Gray (muted text, spec sekundarne)

## 4. Typografia (z workflow_branding type=font)

- **Display (nagłówki):** `Space Grotesk` — `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap` (geometryczny sans-serif premium tech, jak Dyson spec sheet; PL znaki OK).
- **Body (treść):** `Inter` — `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap` (neutral, czytelny, PL znaki OK).
- **Mono / Caption:** `Space Mono` — `https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap` (spec labels, liczby techniczne `5600 PA`, `Nº 03`).

> Łącznie 3 rodziny, BEZ `&subset=latin-ext`. Wszystkie mają poprawne PL w UPPERCASE (Ł/Ń/Ś). Manifest zakazuje Italiana / Fredoka One.

## 5. Persona główna (z report_pdf)

- **Wiek / zawód / status:** 40 lat, właściciel apartamentu w bloku 11-piętrowym (lub mieszkanie na 4. piętrze z panoramicznymi oknami), menadżer/przedsiębiorca IT, dochód 15-25k netto, capsule interior w stylu skandynawskim.
- **Kluczowy pain point:** Myje okna raz w roku bo boi się wychylać przez ramę 4 pięter nad ziemią (nie da się tego zrobić bezpiecznie) — okna zostają brudne, widok zamglony, wiosną ma wstyd jak przyjdą goście.
- **Kluczowa motywacja zakupu:** Chce odzyskać kontrolę nad czystością okien bez schodów i ryzyka. Gotowy zapłacić premium za coś co **uruchamia się pilotem**, ma **linkę i UPS** (nie spadnie na sąsiada), a on trzyma kawę w ręce.
- **Cytat brzmiący jak wypowiedź persony:** „Pierwszy raz od trzech lat widzę ostry horyzont z mojego salonu. Robot pracuje, ja piję kawę. To nie jest gadżet — to jest powód, dla którego w ogóle mam to okno."

Drugi kontekst: dzieci seniorów (30-45 lat) kupujące produkt rodzicom 65+ jako **prezent bezpieczeństwa** (lęk przed drabiną).

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzam)

Sprawdziłem `landing-pages/`: **vitrix** (Panoramic Calm) był najbliżej (też premium tech w domu), ale:

- **Już istnieje:** `vitrix/` — Panoramic Calm (Plus Jakarta + Instrument Serif, paper/navy/teal)
- **Czego unikam specyficznie:**
  - NIE kopiuję Plus Jakarta + Instrument Serif — moja typografia to Space Grotesk + Inter + Space Mono (premium tech, nie editorial)
  - NIE kopiuję palety paper/navy/teal — mam cyan crystal + deep space + safety orange (zimniejsza, bardziej industrial-tech)
  - NIE kopiuję signature Vitrixowego „architectural frame" — mam monumentalną liczbę `5600 PA` parallax w tle hero
  - NIE kopiuję ciepłego paper-tonu — mam chłodne Cloud White (#F7FAFC) z cyan highlight

**AI-slop do uniknięcia (specyficzne dla tej kategorii):**
- Purple-to-blue gradient (typowy „smart home" / „tech startup" slop)
- Neon cyan glow pulsujący na wszystkim (disco a nie inżynieria)
- Checkmark ✓ tabele porównawcze (użyć opisowych zdań w kartach)
- Border-left: 4px solid primary na kartach (generic AI)
- Glitch effects, holographic overlays

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? **TAK** — Dyson (brand-as-engineering), B&O (luxury audio), Leica (camera craft). Zero innych landingów.
- [x] Czy odwracając logo nadal zgaduję branżę (moodboard jest charakterystyczny)? **TAK** — ciemny hero + monumentalna liczba `5600 PA` + Space Mono spec labels to czytelnie „premium AGD tech" / „precision instrument".
- [x] Czy persona NIE pasowałaby do innego baseline'u z tabeli? **TAK** — „40-latek który boi się wychylać z 4. piętra" nie pasuje do Rugged Heritage (workwear), Playful (pet), Organic (wellness), Retro-Futuristic (gaming) ani Editorial luxury (Panoramic Calm jest blisko, ale nie ma tech/safety angle).
- [x] Czy manifest w 5 linijkach da się zacytować bez słów „premium", „luxury", „wysoka jakość"? **TAK** — opisuję przez materiał (Space Mono, Crystal Cyan), zachowanie (parallax `5600`, dark hero), emocję (kontrola, bezpieczeństwo, oddech panoramy) — nie przez puste etykiety.

## 8. Signature element

**Monumentalna liczba `5600` z indeksem górnym `Pa` jako tło hero sekcji** — Space Grotesk weight 300 italic, `clamp(280px, 28vw, 440px)`, kolor `rgba(0, 212, 232, 0.12)` (crystal cyan na ciemnym tle), letter-spacing `-0.04em`, parallax-scroll `data-speed="0.15"` (unosi się lekko przy scrollu). Sup `Pa` w Space Mono uppercase letter-spacing `.1em`. Jedna rzecz, którą klient zapamięta: **liczba mówiąca „tu nie ma zabawek, to jest inżynieria"**.

Dopełnienie (subtelne): cross-hair grid w rogu hero (2px cyan lines tworzące pojedynczy krzyż 64×64) — nawiązanie do technical drawing Leica.

## 9. Warianty sekcji (autonomicznie wybrane)

- **Hero:** H4 Editorial numerał — mamy jedną monumentalną liczbę spec (`5600 Pa`) która jest gwiazdą produktu; ciemny hero z dużą cyfrą tła + Space Grotesk + Space Mono `Pa` pasuje 1:1 do manifesta „Engineered Air".
- **Features:** F2 Bento asymetryczny — 6 funkcji (ssanie, linka, UPS, alarm, podwójne tarcze, pilot+aplikacja) mieszczą się w 6-polowym bento; hero tile ciemna z dominującą liczbą `5600 Pa` powtarza rytm z Hero i daje editorial feel bez generycznego 2×2 grid.
- **Testimonials:** T2 Before/After — Windox jest produktem transformacyjnym z MIERZALNĄ zmianą (czas: 3h → 20min, ryzyko: „wychylać się" → „pilot w ręce", widok: „mgła" → „ostry horyzont"); before/after karty z ciemnym tłem i cyan highlight na stronie „po" są mocniejsze niż 3 generyczne voice cards.
