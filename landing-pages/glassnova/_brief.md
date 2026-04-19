# GlassNova — Landing Brief

**Status:** 🟢 migracja retrospektywna · **Kierunek:** Panoramic Clarity · **Workflow:** `0b97bf06-f91c-4b5f-9587-f4aeaf3ed1ca`

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

- **2026-04-19** — Migracja retrospektywna. Landing istniał sprzed briefowania. Przegląd verify-landing.sh: 18 ✅ / 5 ⚠️ / 10 ❌. Retrospective `_brief.md` zapisany. Wprowadzone fixy:
  - Meta head: shortened title/desc, added OG image (full Supabase URL), `&subset=latin-ext` dla fontów, html.js gate script
  - Header: solid `#FFFFFF` bez backdrop-filter (zgodnie z DESIGN.md sekcja 0.1)
  - Fade-in: gated za `html.js`, safety timeout 2500ms z viewport filter
  - JS effects: `.js-split` na h1 hero, `.js-counter` na hero-spec-value, `.magnetic` na wszystkich btn-primary, `.tile-tilt` na bento-card
  - Offer box overhaul (sekcja H.9 checklist): `-20%` savings badge, `★★★★★ 4.8/5 · 1 247 opinii` rating nad CTA, trust strip (3 ikony), payment logos row (BLIK-first: BLIK, Visa, MC, Przelewy24, Apple Pay)
  - Section numbering `01 / 10 — ...` przed każdą section-label (10 sekcji)
  - Trust bar: „Kurierem w 24-48h" → „InPost · DPD · kurier" (usunięcie obietnicy czasu)
  - Sticky mobile CTA (fixed bottom, price + button, visible po scroll poza offer)

## 7. JS Effects zaimplementowane

- [x] Split headline reveal (char-by-char, 22ms stagger)
- [x] Number counter (5600, 3, 20, 30 — 1.4s easing)
- [x] Magnetic CTA (0.18 factor, `(hover:hover)` only)
- [x] Tile 3D tilt (bento-card, max 4°, perspective 900px)
- [x] Scroll reveal fade-in (gated, safety-filtered)
- [x] Glass-panel cleanWipe + scan-line (hero signature, pre-existing)

## 8. Live link

https://tn-crm.vercel.app/landing-pages/glassnova/
