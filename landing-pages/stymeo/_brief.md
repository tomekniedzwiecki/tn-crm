# Design Brief — STYMEO

<!-- Workflow UUID: 7ffc2803-3a11-4b7c-9696-d4209c1aa84b -->
<!-- Klient: Damian Mordalski (Mordalski Analytics) -->
<!-- Produkt: Stymeo — ręczna parownica wysokociśnieniowa 1500W, 3 bar, 100°C, 200g -->

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [x] **Nowy: Steam Apothecary** (adaptacja Apothecary Label z paletą cyan klienta)

**Uzasadnienie wyboru:** Stymeo to utility-precision product z agresywnym claimem (100°C, 3 bar, 200 g, zero chemii) — paleta klienta (Steam Cyan #00C2D4 + Deep Graphite #1A1F2E + Cloud White #F5F9FA) pcha w stronę technical apothecary, nie editorial. Tagline klienta „Tylko woda. Tylko czystość." czyta się jak etykieta składnika („H₂O — 100%, bez dodatków") — to dokładnie język Apothecary Label.

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

1. **Aesop** — apothecary label discipline; produkt nazywany surowo („Resurrection Aromatique Hand Wash"), spec opisany na butelce, brak adjective-spam. Z Aesop bierzemy *typograficzną grawitację etykiety* (mono nad headline, lista składników jako design).
2. **Anker (PowerCore product pages)** — spec-first hero: liczby (20000 mAh, 100W, 87 min) dominują nad lifestyle photo. Bierzemy *layout numerycznej dominanty* — w hero data block obok pistoletu pary.
3. **Necessaire (body care)** — technical disclosure jako estetyka; tabela INCI, certyfikaty, badania pod produktem zamiast „silky soft skin". Bierzemy *normalizację specyfikacji jako conversion driver* (cała sekcja Specyfikacja zamiast „features").

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent / brand):** `#00C2D4` (Steam Cyan — para techniczna)
- **Ink (główny tekst):** `#1A1F2E` (Deep Graphite)
- **Paper (tło):** `#F5F9FA` (Cloud White)
- **Mist (subtle highlight):** `#A8F0E1` (Mist Mint — tylko w 2 miejscach: w spec-numerze + w hover na CTA)
- **Lab Gray (meta):** `#5C6675` (Slate — mono, units, footnotes)
- **Obsidian (dark sections opcjonalne):** `#0A0E14`

> Filozofia: monochrome + 1 brand color (Steam Cyan). ZERO gradientów, ZERO warm cream. Sterylne ale czytelne — paleta laboratorium dla domu z małym dzieckiem.

## 4. Typografia (z workflow_branding type=font)

- **Display (nagłówki):** `Plus Jakarta Sans` 500/700/800 — `&display=swap` (PL-safe, ma diakrytyki w core; subset latin-ext NIE wymagany w v2)
- **Body (treść):** `Inter` 400/500/600/700 — `&display=swap`
- **Mono (accent, units, sec-meta):** `Space Grotesk` 400/500/700 — `&display=swap`

> ⚠️ **Konflikt ze Style Lock:** Apothecary Label klasycznie wymaga `IBM Plex Sans` + `IBM Plex Mono`. Klient zaakceptował Plus Jakarta + Inter + Space Grotesk w brandingu — branding ma priorytet (zasada Krok 4.4). Plus Jakarta to sans z mocnym x-height, geometric — sprawdza się jako label display.
> Polskie „Ł" w UPPERCASE: Plus Jakarta sprawdzona w innych landingach (h2vital), bezpieczna z line-height ≥ 1.4.
> Max 3 rodziny: spełnione.

## 5. Persona główna (z report_pdf)

- **Wiek / zawód / status:** Kobieta 28-38 lat, mama dziecka 0-5 lat, mieszkanka miasta, świadoma konsumentka — capsule wardrobe (Cos, Arket), Notino zamiast Rossmanna, czyta etykiety kosmetyków. Wykształcenie wyższe, dochód mid-high (HH 8-15k netto).
- **Kluczowy pain point:** Nie godzi się na chemiczny zapach w łazience, w której kąpie się jej dziecko. Nie wyciera podłogi, po której pełza małe dziecko, środkami z ostrzeżeniem na etykiecie. Traci weekendy na szorowanie fug, które i tak wracają zafarbowane.
- **Kluczowa motywacja zakupu:** Czystość bez chemii — z gwarancją techniczną (100°C zabija >99% bakterii), nie z marketingu („eco friendly"). Chce dane, nie obietnice.
- **Cytat brzmiący jak wypowiedź persony:** „Przestałam liczyć butelki z piktogramem czaszki. Para — i tyle. Dziecko pełza po podłodze 30 minut po sprzątaniu, ja nie wąchała nic poza wodą."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

- **Już istnieje (Apothecary Label):** `steamla/`, `postawnik/`, `calmfur/` — wszystkie używają tego samego stylu w ostatnich 6 miesiącach.
- **Steamla** (najbliższy — TEN SAM produkt parownica): używała headline „H₂O — jedyny składnik" + spec-label block 12vw z gigantyczną literą H₂O.
- **Czego unikam w Stymeo (signature differentiation):**
  - **NIE** kopiuję spec-label „H₂O 100%" jako pojedynczej gigantycznej litery — Stymeo użyje **„CHEMIA: 0%"** (negative spec) jako sygnaturę.
  - **NIE** stosuję paper white `#FAFAF7` Apothecary — paleta klienta ma `#F5F9FA` (lekko ciemniejsze, z cyan undertone).
  - **NIE** używam `IBM Plex Sans` — paleta typograficzna klienta (Plus Jakarta).
  - **NIE** stamp badge ani LOT/BATCH labels jako sec-meta (steamla użyła `LOT 2026-Q2`) — Stymeo użyje `INDEKS · 100°C · 3 BAR · 200 G · 0% CHEMII` jako tech-strip.

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? **TAK** (Aesop = retail/wellness, Anker = consumer tech spec pages, Necessaire = clean beauty).
- [x] Czy odwracając logo nadal zgaduję branżę (moodboard jest charakterystyczny)? **TAK** — sec-meta strip + spec-table + „CHEMIA: 0%" oversized = utility tool z technicznym claim, nie generic appliance.
- [x] Czy persona NIE pasowałaby do innego baseline'u z tabeli? **TAK** — capsule-wardrobe mama z dzieckiem nie kupi w Editorial/Luxury (zbyt magazyn) ani Playful (zbyt dziecięce), wybór Apothecary jest jedyny logiczny.
- [x] Czy manifest w 5 linijkach da się zacytować bez słów „premium", „luxury", „wysoka jakość"? **TAK** — manifest opiera się na liczbach (100°C, 3 bar, 200 g, 15 s, 0% chemii) i wyborach binarnych („tylko woda / żadnej chemii").

## 8. Signature element

**„CHEMIA: 0%" jako oversized spec-block (negative spec)**

Zamiast pokazywać co produkt MA, pokazujemy czego NIE MA. Pełnoekranowa sekcja na tle Cloud White, ramka 2px solid Deep Graphite, padding 56px, środek:

```
INDEKS SKŁADNIKÓW
0%        ← clamp(80px, 14vw, 220px), Plus Jakarta 800
CHEMIA · DETERGENTY · ZAPACHY · KONSERWANTY
─────────────────────────────────────────
SKŁADNIK     │   H₂O — 100%
ZBIORNIK     │   350 ml
PARA         │   100 °C · 3 bar
WAGA         │   200 g (pistolet)
```

To anchor signature dla całego landingu — pojawia się 1× w wybitnie eksponowanym miejscu (po hero, przed features), w treści powraca tylko jako mini-tag w stopkach (np. „BATCH 2026/05 · CHEMIA 0%"). Mist Mint `#A8F0E1` jako subtle hover na „0%".

## 9. Warianty sekcji (z section-variants.md, LIMITED przez allowed_variants w Style Lock)

- **Hero:** H1 Split klasyczny (allowed: H1/H5/H8) — split 60/40, lewa strona: headline + spec stack + CTA; prawa: pistolet pary AI image z subtle steam wisp animacją (.fade-in only, brak parallax).
- **Features:** F3 Linear stack (allowed: F3/F6) — 6 spec-rows w formacie `01 · KEY ─ value · description`, max-width 820px.
- **Testimonials:** T2 Before/After stats (allowed: T2/T5) — 3 testimoniale w spec-row format z meta-strip (`IMIĘ · MIASTO · WIEK · DAYS-OF-USE`).

---

## 10. STYLE LOCK — wybrany styl z Atlas (OBOWIĄZKOWE od v4.0)

### 10.1 Wybrany styl
- **Style ID:** `apothecary-label` (adaptacja z fontami klienta)
- **Plik:** [`docs/landing/style-atlas/apothecary-label.md`](../../docs/landing/style-atlas/apothecary-label.md)

### 10.2 Product DNA (z Kroku 9a.1)
- Utility↔Ritual: **utility** (parownica wykonuje pracę; kotwice: Dyson V15, Shark steam mop)
- Precision↔Expression: **precision** (3 bar, 100°C, 200 g — dokładność kluczowa; kotwice: Swiss watch, Sous-vide cooker)
- Evidence↔Feeling: **evidence** (klient kupuje liczby, nie emocję; kotwice: Anker 20000 mAh, Dyson „99% pick up")
- Solo↔Community: **solo** (sprzątanie prywatnie; kotwice: Steamla, skincare serum)
- Quiet↔Loud: **quiet** (Aesop-style spokojny manifesto; kotwice: Muji, Aesop apothecary)
- Tradition↔Future: **present** (current home tech, nie sci-fi ani vintage; kotwice: Anker spec page, Necessaire)
- Intimate↔Public: **intimate** (łazienka dziecka, prywatne rytuały; kotwice: Steamla, skincare routine)

Match z wybranym stylem: **7/7**. Argumentacja: DNA identyczne z DNA kotwiczącym Apothecary Label w Style Atlas (parownica ręczna eko-mamy / Steamla), a paleta cyan-graphite klienta jest naturalnym adaptation surface dla apothecary minimalism.

### 10.3 MUSZĄ być użyte (auto-paste z apothecary-label.md, adaptowane do brandingu klienta)
- Font display: **`Plus Jakarta Sans`** w font-family (adaptacja — Style Lock klasyczny wymaga IBM Plex Sans; klient ma Plus Jakarta w brandingu, branding ma priorytet)
- Font body: **`Inter`**
- Font mono: **`Space Grotesk`** (zamiast IBM Plex Mono) — min 1 występ per sekcja (sec-meta, units, spec-table)
- Paleta (min 3 z 5): `#F5F9FA` (paper), `#1A1F2E` (ink), `#00C2D4` (primary cyan)
- Min 1 `<table>` lub `.spec-*-list` w landingu (target: 1 spec-table w hero + 1 w „CHEMIA: 0%" sekcji + feat-spec-list)
- Padding sekcji ≥ `100px 0` (grep CSS, target ≥ 120px na desktop)
- **Signature primitive #1 (spec-label-section) obecny** — sekcja „CHEMIA: 0%" + spec-table

### 10.4 NIE WOLNO użyć (auto-paste z apothecary-label.md)
- **Fonty:** NIE `Fraunces`, `Cormorant`, `Playfair`, `Italiana`, `Libre Bodoni`, `Caveat`, `Fredoka`, `Archivo Black`, `Nunito`
- **Layout:** NIE `grid-template-columns: 1fr 1fr` dla features (bento 2×2 ZAKAZ)
- **Elementy:** NIE `Nº` w eyebrow, NIE `.hero-numeral` (oversized italic), NIE `.trust-strip` z dark bg + icon circles
- **Kolory:** NIE `#F6F3ED` (linen cream), NIE `#E09A3C` `#C9A961` (gold/brass), NIE `linear-gradient` w tłach sekcji
- **Motion:** NIE `.js-split`, NIE `.js-parallax`, NIE `.magnetic`
- **Sekcje:** NIE Trust Bar dark, NIE Social Proof Marquee, NIE Final CTA Banner (wide)
- **Copy:** NIE „premium", „luxury", „wysokiej jakości", „innowacyjne", „rewolucyjne"
- **Zakazy globalne:** NIE „24h", „magazyn w Polsce", NIE COD/za pobraniem/raty/PayPo/Klarna/Twisto (landingi ofertowe Tomka — payment BLIK/karta/przelew)

### 10.5 Section Architecture (z apothecary-label.md sekcja 8)
**Required (min 10 sekcji):**
- Header (sticky, solid white #F5F9FA, NIE rgba+backdrop)
- Mobile Menu
- Hero (H1 Split z spec-stack)
- Sec Meta Strip („STYMEO · PAROWNICA HANDHELD · 100°C · 3 BAR · 200 G · 0% CHEMII")
- Spec Label Big („CHEMIA: 0%" — sygnaturowa)
- Features as Spec Rows (F3 Linear, 6 wierszy)
- How It Works (3-step minimal: woda → 15 s → para)
- Comparison Table (parownica vs chemia detergentowa, 6 wierszy)
- FAQ (5-7 pytań)
- Testimonials Spec-style (T2 Before/After, 3 osoby)
- Offer (minimal box)
- Footer

**Forbidden:**
- Trust Bar dark (Apothecary używa sec-meta)
- Social Proof Marquee
- Final CTA Banner (wide)

### 10.6 Motion Budget (z apothecary-label.md sekcja 10)
```yaml
js_effects_required:
  - .fade-in               # zawsze
  - .js-counter            # min 1 (np. „99,9% bakterii" / „100°C" / „15 sek")

js_effects_forbidden:
  - .js-split              # char-by-char zbyt editorial, psuje minimalism
  - .js-parallax           # zakaz
  - .magnetic              # zbyt DTC/playful

js_effects_count:
  counter_min: 1
  counter_max: 3
  magnetic_min: 0          # zakaz
  tilt_min: 0              # zakaz
  parallax_min: 0          # zakaz
```

---

## 11. Wow Moments (3 explicit — z 04-design.md sekcja 1)

1. **Hero zone — „SKŁADNIK: H₂O" oversized eyebrow + pistolet pary z subtle steam wisp**
   - **Lokalizacja:** Hero, viewport pierwszy fold.
   - **Element:** Mono eyebrow „SKŁADNIK · H₂O · 100% · BEZ DODATKÓW" na 11px tracking 0.18em + pod nim headline w Plus Jakarta 88px „Tylko woda. Tylko czystość." Po prawej AI image pistoletu pary z animowanym subtle wispem (CSS `@keyframes steam-rise`, opacity 0.3-0.6, blur).
   - **Uniqueness:** Pierwszy hero w `landing-pages/` z mono-eyebrow składnika; steam-wisp animacja TYLKO w hero (nie powtarza się — anti-AI-slop).
   - **Implementation:** ETAP 2 (HTML) + 04-design.md polish.

2. **Mid — „CHEMIA: 0%" oversized negative spec block (signature)**
   - **Lokalizacja:** Po hero, przed features, full-width centered.
   - **Element:** Ramka 2px solid graphite, padding 56px, gigantyczne „0%" w clamp(80px, 14vw, 220px), pod nim lista wymienionych negatywów („CHEMIA · DETERGENTY · ZAPACHY · KONSERWANTY"), poniżej spec-table z 4 wierszami.
   - **Uniqueness:** Negative spec (czego NIE ma) zamiast positive spec (co MA) — pierwszy raz w `landing-pages/`. Steamla użyła „H₂O 100%" pozytywnie, Stymeo używa „CHEMIA 0%" negatywnie — to ten sam fakt, ale inny conversion angle.
   - **Implementation:** ETAP 2 (HTML).

3. **Conversion zone — Comparison table parownica vs chemia detergentowa (full-width 1200px)**
   - **Lokalizacja:** Tuż przed offer box, anchor decision point.
   - **Element:** Tabela 2-column z 6 wierszami: Czas / Koszt na sprzątanie / Chemia w domu z dzieckiem / Bakterie / Fugi / Alergie. Lewa kolumna Stymeo (cyan check + konkretna wartość), prawa „Detergenty + ścierki" (graphite cross + wartość).
   - **Uniqueness:** Comparison table jest rzadkością w Apothecary landingach (steamla nie ma); tu staje się głównym conversion driverem przed CTA.
   - **Implementation:** ETAP 2 (HTML) + ETAP 4 polish (sub-styling cyan/graphite).

---

## 12. Tabela mapowania manifesto → DESIGN (Krok 7 z 01-direction.md)

| Decyzja | Wartość z manifesto |
|---|---|
| Hero background | Cloud White `#F5F9FA` solid, brak gradientu |
| Hero headline font-family | `Plus Jakarta Sans` 800, clamp(48px, 7vw, 88px), letter-spacing -0.03em, line-height 1.0 |
| Hero headline font-style | Regular weight 800 + 1 słowo „czystość" w cyan `#00C2D4` (subtle emphasis, NIE italic) |
| Signature element HTML | `.zero-chem-block { border: 2px solid #1A1F2E; padding: 56px; max-width: 880px; }` z nested `.zero-chem-big { font-size: clamp(80px,14vw,220px); font-weight: 800; line-height: 0.9; }` |
| Dark section rytm | 1 ciemna sekcja: Hero NIE jest dark; testimonials sekcja w `#0A0E14` z paletą inverted, reszta paper |
| Animacja hero | Subtle steam wisp na pistolecie (CSS keyframe), NIE parallax; reszta strony .fade-in only |
| Border-radius globalny | 0px (Apothecary = label = sharp corners). Wyjątek: CTA button 0px też (label aesthetic) |
| Shadow styl | None default; subtle `box-shadow: 0 1px 0 #1A1F2E` na hover spec-row (1px stroke effect, nie diffuse blur) |
| Divider między sekcjami | `border-top: 1px solid #1A1F2E` (cienka linia, monolinia, NIE wave ani numbered) |

---

**Status briefa:** ✅ kompletny, gotowy do `verify-brief.sh`.
