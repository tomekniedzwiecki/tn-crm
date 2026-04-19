# GlassNova — Landing Brief

**Status:** 🟢 v2 rebuild ukończony · **Kierunek:** Panoramic Clarity · **Workflow:** `0b97bf06-f91c-4b5f-9587-f4aeaf3ed1ca` · **Live:** https://tn-crm.vercel.app/landing-pages/glassnova/

---

## 1. Design Manifesto

### Kierunek: Panoramic Clarity
Świat oglądany zza idealnie czystej szyby. Nie „smart home gadget" ani „gaming tech" — to mood **widoku, światła i oddechu**. Klient nie kupuje robota, kupuje **panoramę bez smug** i wolne sobotnie popołudnie.

### Tempo: rytmiczne z przerwami
Animacje pojawiają się jak przebłyski światła na szkle (cleanWipe, sparkle, droplet rise) — nie ciągły ruch, ale orchestrated reveal co 2–4 sekundy. Padding sekcji 96–120px (nie 60, nie 160). Gęstość tekstu średnia: krótkie akapity 2–3 linie.

### Typografia
- **Display:** `Space Grotesk` 700 — geometryczne, „inżynierskie" litery, mówi „tech" ale z ciepłem. Dobre do numerów (5600Pa) i headline'ów.
- **Body:** `Inter` 400/500 — czytelny neutral, nie kradnie uwagi display'owi.
- **Accent:** `JetBrains Mono` 400/500 — używany TYLKO w eyebrow labels (`01 / 10 — ROZWIĄZANIE`), spec values nad hero, savings badge. Maks. 5 miejsc na stronie.

### Paleta 60/30/10
- **Dominant 60%** — `#FFFFFF` biel + `#F8FAFC` bone-cool + `#F1F5F9` cool-paper jako warstwy tła. „Oddech" strony.
- **Secondary 30%** — `#0A1628` deep navy (tekst, ciemne sekcje) + `#00D4E8` crystal teal (primary CTA, highlights). Duet „szyba nocą / szyba w słońcu".
- **Accent 10%** — `#F5A623` amber gold — używany TYLKO w: savings badge (-20%), bestseller sticker, star rating glow. Nic więcej.

### Signature element
**Hero „glass-panel" kompozycja** — cztery półprzezroczyste panele szyby rozmieszczone asymetrycznie wokół produktu, każdy z `cleanWipe` animacją (smuga mikrofibry zjeżdżająca po szybie co 6s). Plus pojedyncza `scan-line` przechodząca pionowo przez całe hero co 8s — sygnalizuje „AI skanuje okno". Kombinacja unikalna dla GlassNova — żaden inny landing w TN tego nie ma.

### Od czego świadomie uciekam
1. **Purple-to-blue gradient** (AI slop) — paleta sticle trzyma się teal/navy/amber, bez fioletu.
2. **Generic bento z 4 identycznymi kafelkami** — bento ma `bento-image` (pełna fotka) jako pierwszy tile + 5 różnych benefitów, nie symetryczne 2×2.
3. **Editorial Fraunces + Italiana** — to nie premium magazine, to tech. Didone byłby w konflikcie z produktem.
4. **Neon glow na ciemnym tle** (gaming/retro-futuristic) — landing ma białą dominację, neon zabiłby credibility dla 1199 PLN produktu.
5. **Obietnice „24h wysyłki / magazyn w PL"** — zakazane TN-wide (dropshipping Faza 1).

---

## 2. Photo System

- **Lighting:** miękkie światło dzienne, okno jako main light, minimum shadows. Nie studio flash.
- **Paleta scen:** bone-cool wnętrza (off-white ściany, jasne drewno, szkło, chromy). Akcenty cyan w reflektorach na szybie. Zero ciepłych żarówek.
- **Kadrowanie:**
  - Hero — 4/5 pionowy, produkt 60% kadru
  - Personas — 4/5, twarz + ramiona + kontekst okna
  - Bento tiles — 4/3 landscape
  - Problem — 4/3, narrative shot (osoba z drabiną/wiadrem)
  - Step (how-it-works) — 4/3 close-up na gesty
- **Realism injector:** odbicia okna w szybie, ślady palców przed myciem → widać rezultat „przed/po". Krople wody toczące się po krawędzi.
- **Kolorowe akcenty:** pojedynczy ręcznik/roślina w cyan/teal w kadrze (wiąże z primary).

---

## 3. Personas (z kopii strony)

| Persona | Tag | Pain / Quote |
|---|---|---|
| **Anna Kowalska** 35 · Warszawa · mieszkanie 65m² · 8. piętro | Mieszkanie na piętrze | „Mycie okien od zewnątrz na 8. piętrze było moim koszmarem. GlassNova całkowicie zmienił grę." |
| **Marek Nowak** 45 · Kraków · dom 180m² · 15 okien | Dom z ogrodem | „Dom z 15 oknami = cały weekend. Teraz GlassNova robi to za mnie, ja mam czas na rodzinę." |
| **Katarzyna Wiśniewska** 38 · Gdańsk · apartament z widokiem | Apartament z widokiem | „Płacę za widok — nie za smugi. Panoramiczne okna wreszcie wyglądają jak z katalogu." |

Persona główna dla hero: **Anna (mieszkanie na piętrze)** — największy pain (ryzyko upadku), najbardziej emocjonalny headline.

---

## 4. Mapowanie manifesto → kod

| Decyzja | Wartość |
|---|---|
| Hero background | `linear-gradient(135deg, rgba(0,212,232,0.03) 0%, #FFF 50%, rgba(245,166,35,0.03) 100%)` + glass-panel + scan-line |
| Hero headline font-family | Space Grotesk 700 |
| Hero headline font-style | Regular + `.highlight` teal accent na „Lśniące okna" |
| Signature element HTML | `.hero-animations > .glass-panel × 4` + `.scan-line` |
| Dark section rytm | 1 ciemna sekcja (cta-banner przed footerem), reszta jasna — kontrast oszczędny |
| Animacja hero | Rytmiczna (cleanWipe 6s, glassReflect 8s, scanDown 8s) + split headline + counter + magnetic CTA |
| Border-radius globalny | 10–32px (`--radius-sm: 10; md: 14; lg: 22; xl: 32`) |
| Shadow styl | Navy-tint: `rgba(10,22,40,0.08)` / teal glow na CTA `rgba(0,212,232,0.25)` |
| Divider między sekcjami | Brak wavy — subtelny border-top `1px solid rgba(10,22,40,0.06)` + gradient fade |
| Numeracja sekcji | `01 / 10 — ROZWIĄZANIE` (JetBrains Mono) przed section-label |

---

## 5. Moodboard (3 marki)

1. **Dyson** → mikrotypograficzne bloki technical data (5600Pa, 3min/m², UPS) nad produktem — „engineering is the story".
2. **Bang & Olufsen** → spokojny panoramiczny hero, dużo światła, produkt jako „piece in a room", nie „product on a pedestal".
3. **Linear (linear.app)** → subtelne gradient accents w detalach (hero-glow radial w rogu), minimalizm + precyzja w typografii.

**Nie czerpiemy z:** Apple (zbyt generic), iRobot (generic smart home), żadnych landingów z `landing-pages/`.

---

## 6. Decisions log

### v2 — 2026-04-19 · Full rebuild (commit `ddb5470`)

User poprosił o **pełen rebuild od zera** — poprzednia wersja miała zbyt dekoracyjne animacje (4× glass-panel z cleanWipe, 8 droplets, 6 sparkles, 6 particles, scan-line, hero-glow). Wykasowane na rzecz czystszej typografii i jaśniejszej hierarchii. 3449 linii usuniętych → 1401 wstawionych.

**Zmiany strukturalne:**
- 10 sekcji numerowanych `Nº 01..10` z `.eyebrow` zawierającym `num + dash + label` (editorial convention).
- Signature moved: zamiast CSS animacji w hero → oversized editorial numeral `01` w tle hero + `10` w tle finale (opacity 0.06 / 0.03).
- Sekcja ciemna `Nº 05 Technologia` (spec sheet list, rytm redakcyjny jasno/jasno/jasno/jasno/**ciemno**/jasno...) + Finale (ciemna przed footerem).
- Bento 3-col z `.tile.tile-hero` span 2-col grid wewnętrzny (text L + figure R) + 3 tile bez figure (tylko kicker + title + copy).
- Offer box przepisany wg H.9: sticker `-3deg` rotacja, rating, stara/nowa cena (old 60% size, line-through), savings-badge rotowany + text zielony, 5 bullets, magnetic CTA, guarantee, trust strip, payment logos (BLIK first).

**Wszystkie CTA (7 miejsc) → `glassnova.pl/checkout?products=103035102-321191852`:**
header-cta, hero-cta, mobile-menu, offer-cta, finale-cta, sticky-cta, cookie-banner link.

**Footer legal (3 miejsca):**
- Kolumna `.footer-col` „Pomoc"
- `.footer-legal` bar w `.footer-bottom`
- Link w cookie banner
URLs: `glassnova.pl/help/{regulation,privacy-policy,delivery}`.

**Bug fixes w procesie rebuild:**
- `.magnetic { display: inline-flex }` nadpisywało `.header-cta { display: none }` na mobile — usunięte `display`.
- Split reveal łamał słowo między literami („upadku" → „upadk / u") — rewrite JS: split po whitespace, każde słowo w `<span class="word">` z `white-space: nowrap`, chars wewnątrz.
- `.btn` dodana `min-height: 48px` + `:active` (touch targets Apple HIG 44px+).

**ETAP 4 Playwright:** 3 viewporty sprawdzone (1440 · 768 · 375). Zero horizontal scroll, hero above-the-fold, sticky mobile CTA widoczny po scroll poza offer.

**ETAP 4.5 Mobile Polish 10-obszarów (A-J):**
- A Touch: `.btn min-height:48`, offer-cta 58, sticky 50, mobile-menu-btn 54 ✅
- B Typography: `clamp()` × 11 na h1/h2/h3/hero-lede/offer-price/finale::before ✅
- C Spacing: `padding: clamp(72px, 9vw, 112px)` na section, container padding 20px mobile ✅
- D Layout: `grid-template-columns:1fr` × 18 (wszystkie 2/3/4-col stacks) ✅
- E Hero: content order 0 nad visual order 1 na ≤1024px, hero-figure max 320px mobile, CTAs column + 100% width ✅
- F Nav: header fixed + white, hamburger 44×44, mobile-menu fixed inset ✅
- G Images: wszystkie `<img>` mają width+height (CLS 0), hero fetchpriority=high, reszta loading=lazy ✅
- H Overflow: `body { overflow-x:hidden }`, zero leaks 100vw/negative ✅
- I Interactive: `-webkit-tap-highlight:transparent`, `:active` na .btn, FAQ accordion tap-friendly ✅
- J Performance: 2× preconnect, &subset=latin-ext, 3 font families max, heavy animacje respect prefers-reduced-motion ✅

**verify-landing.sh:** 33 ✅ / 0 ⚠️ / 0 ❌

### v1 — 2026-04-19 · Migracja retrospektywna (commit `2642bda`)

Landing istniał sprzed briefowania. Przegląd verify: 18✅ / 5⚠️ / 10❌. Dodane: html.js gate, OG image, latin-ext, solid header, fade-in gated + safety 2500ms, JS effects (split/counter/magnetic/tilt), offer box H.9 (savings badge, rating, trust strip, payment logos BLIK-first), Nº 01..10 numbering, trust-bar „24-48h"→„InPost · DPD · kurier", sticky mobile CTA.

## 7. JS Effects zaimplementowane

- [x] **Split headline** reveal — word-aware (każde słowo `inline-block; white-space:nowrap`, chars wewnątrz), 22ms stagger per char, fallback na `prefers-reduced-motion`
- [x] **Number counter** × 5 — 5600Pa (hero), 3 min (hero), 4 h (problem), 2×/rok (problem), 1247 opinii (offer rating). Easing cubic, 1400ms, IntersectionObserver threshold 0.4
- [x] **Magnetic CTA** × 4 — header + hero + offer + finale. Factor 0.18, `(hover:hover) and (pointer:fine)` only
- [x] **Tile 3D tilt** — bento `.tile:not(.tile-hero)`, max 4° rotateX/Y, perspective 900px
- [x] **Fade-in scroll reveal** — gated za `html.js`, threshold 0.12, rootMargin `-70px` bottom, safety 2500ms filtruje po `getBoundingClientRect().top < window.innerHeight`
- [x] **FAQ accordion** — smooth max-height transition, `aria-expanded` state
- [x] **Sticky mobile CTA** — IntersectionObserver na `.offer-box`, scroll position threshold 420px
- [x] **Header scroll state** — `.scrolled` class + box-shadow po scrollY > 40

## 8. Live link

https://tn-crm.vercel.app/landing-pages/glassnova/
