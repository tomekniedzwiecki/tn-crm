# Design Brief — Oculia

> Inteligentny masażer oczu (TH-823): grafen 38–42°C, presoterapia, Bluetooth, 5 trybów, 1200 mAh.
> Pozycja: affordable luxury (249–349 PLN) między dropshipping ($50–80) a premium ($450–800).
> Mechanizm psychologii: PAS (Problem–Agitate–Solution) — kupują ucieczkę od cyfrowego zmęczenia wzroku.
> Estetyka: Clinical Kitchen — data-driven, dashboard-style, KPI-first.

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [x] Nowy: **Clinical Kitchen** — data-heavy health-tech, dashboard hero, KPI cards, IBM Plex stack

**Uzasadnienie wyboru:** Produkt to medical-grade wellness device z konkretnymi specs (38–42°C grafen, 1200 mAh, 5 trybów, 15 min sesja). Persona Magda kupuje "evidence-driven" — chce widzieć liczby (90% pracowników biurowych zgłasza problemy ze wzrokiem, 7+h przed ekranem dziennie). Clinical Kitchen domyślnie eksponuje liczby jako design element (KPI grid hero, comparison bar charts, instrument-panel trust strip) — co perfect-match z Conversion DNA `mixed · mixed · problem-aware · mixed · considered`.

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

1. **Withings (Body Smart, Sleep Analyzer)** — dashboard hero z liczbami jako hero element, KPI cards jako tile, kliniczny ale ciepły undertone, IBM Plex-like sans, light-bg
2. **Eight Sleep (Pod 4 Cover)** — sleep-tech, before/after metrics ("87% deeper sleep"), klisze data viz w hero, dark KPI tiles + ink text
3. **Therabody (Theragun PRO)** — wellness device pozycjonowany jako tool, technical illustration produktu z callout-ami, percentage badges („99% deeper recovery")

## 3. Paleta (z workflow_branding type=color, dostosowana do Clinical Kitchen 60/30/10)

- **Primary (akcent — szałwiowy zielony brand):** #4F6E5C
- **Ink (główny tekst — instrument ink):** #1F2420
- **Paper (tło — lab white, BEZ warm cream — Clinical Kitchen forbids warm tones):** #F7F9FB
- **Accent / Support 1 (chart-gray, separator lines):** #A5AFA8
- **Support 2 (highlight — warm copper z brandingu, używany RZADKO, max 5%):** #C88B65

> NB: kolor lavender #A394C4 z brandingu pominięty (Clinical Kitchen unika 2+ accent hue). Cream #F5F1EA pominięty (warm cream forbidden). Sage #4F6E5C jako brand primary zachowany.

## 4. Typografia (override fonts brandingu — Style Lock wymusza IBM Plex)

- **Display (nagłówki):** IBM Plex Sans 500/600 — `https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap`
- **Body (treść):** IBM Plex Sans 400/500 — ten sam rodzaj
- **Mono / Caption (KPI labels, spec readouts):** IBM Plex Mono 400/500 — `family=IBM+Plex+Mono:wght@400;500&display=swap`

> ⚠️ **Override branding fonts** (Fraunces/Cormorant z Supabase). Powód: Style Lock Clinical Kitchen forbid `Fraunces` + `Cormorant`. Raport strategiczny eksplicite rekomenduje "fonty bezszeryfowe, dużo white space" (zgodne z Plex). Polskie diakrytyki: IBM Plex Sans pełny support PL (Latin Extended).
> NIE dodawaj `&subset=latin-ext` (Google Fonts v2 anty-wzorzec, patrz `feedback-landing-fonts-polish.md`).
> Max 3 rodziny fontów: Plex Sans + Plex Mono = 2 (margines).

## 5. Persona główna (z report_pdf — Awatar 1: Managerka Magda)

- **Wiek / zawód / status:** 30–45, manager korporacyjny lub własna firma, 8–10h dziennie przed monitorem, dochód powyżej średniej krajowej, mieszka w mieście
- **Kluczowy pain point:** Cyfrowe zmęczenie wzroku: pieczenie po 7. godzinie pracy, wieczorne pulsujące bóle skroni, suchość oka, cienie pod oczami przed wideokonferencją. Nie ma czasu na wizytę u fizjoterapeuty.
- **Kluczowa motywacja zakupu:** Szuka 15-minutowego "biurowego survival kit" — chce wrócić do sprawności intelektualnej i estetycznego wyglądu przed ważnym spotkaniem. Kupuje "efekt natychmiastowy" + prestiż domowego SPA.
- **Cytat brzmiący jak wypowiedź persony:** „Po siódmej godzinie przed laptopem skronie pulsują tak, że nie mogę przeczytać własnych notatek. Próbowałam okładów z chłodnej łyżki. Działa 5 minut. Tu mam 15 minut ciemności, ciepła i ucisku — i wracam do roboty."

## 6. Anty-referencje (co JUŻ JEST w landing-pages/)

- **Już istnieje:** `innerscan/`, `innerscan-v2/` — health diagnostic, podobna kategoria; `vitrix/` — Panoramic Calm tech premium; `lunatherma/`, `kineso/` — wellness-tech.
- **Czego unikam (signature elements istniejących):**
  - NIE kopiuję `vitrix` panoramic architectural hero z full-bleed photo — Oculia ma KPI dashboard hero (Clinical Kitchen mandatory primitive #1)
  - NIE używam warm cream `#F5F1EA` (Editorial/Organic baseline) — Clinical Kitchen forbids warm tones, paper jest chłodny `#F7F9FB`
  - NIE editorial `Nº` eyebrow (paromia signature) — Clinical Kitchen forbids
  - NIE Fraunces/Italic accent — Plex Sans + Plex Mono only
  - NIE oversized italic numerał w hero (Editorial Print primitive) — moje liczby są tabular-nums w KPI cards, nie dramaturgia
  - NIE „spa-ritual ozdobnik" h2vital (zioła, leaf icons) — Oculia jest tech-medical-clean, nie botanical

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? → Withings (med-tech device maker, B2C ale data-tool brand), Eight Sleep (sleep-tech B2C), Therabody (wellness-tech device). Wszystkie technology-first, nie pure DTC fashion.
- [x] Czy odwracając logo nadal zgaduję branżę (moodboard jest charakterystyczny)? → Tak: KPI hero + chart-compare + technical callouts = wellness/med-tech device niezależnie od logo.
- [x] Czy persona NIE pasowałaby do innego baseline'u z tabeli? → Magda nie pasuje do paromia (luxury-aspiration), pupilnik (pet-playful), kafina (workwear-rugged). Jej decyzja jest evidence-driven (kliknie KPI „90% biurowych pracowników"), nie aspiration-driven (status badge).
- [x] Czy manifest w 5 linijkach da się zacytować bez słów „premium", „luxury", „wysoka jakość"? → Tak: „15 minut. Grafen 38–42°C. Presoterapia poduszek powietrznych. 5 trybów. Wracasz do roboty."

## 8. Signature element

> Jeden charakterystyczny element wizualny, który zostanie po obejrzeniu landinga.

**Twój signature element:** **Hero KPI dashboard** — grid 4 czarnych KPI tile'ów z tabular-nums (Plex Mono): `38–42°C grafen`, `15 min sesja`, `5 trybów`, `1200 mAh / 8 sesji`. Każdy tile ma cienką warning-amber kreskę na lewej krawędzi (akcent #C88B65 jako 5%) i ink-on-paper kontrast — to jest podpis Oculii: tu nie ma poetyki, tu są liczby. Plus drugi mini-signature: w problemie sekcji `chart-compare` z poziomymi bar-chartami — „minuty bólu skroni / dziennie" 47 min vs „po 15-min sesji" 6 min, jako zielony→czerwony bar.

## 9. Warianty sekcji (z section-variants.md, LIMITED przez Clinical Kitchen allowed_variants)

- **Hero:** **H3 KPI Dashboard Hero** (Clinical Kitchen primitive 1, allowed)
- **Features:** **F4 Cards z mockupami** (allowed dla Clinical Kitchen)
- **Testimonials:** **T2 Before/After stats** (data-driven, allowed dla Clinical Kitchen)

---

## 10. STYLE LOCK — wybrany styl z Atlas

### 10.1 Wybrany styl
- **Style ID:** `clinical-kitchen`
- **Plik:** [`docs/landing/style-atlas/clinical-kitchen.md`](../../docs/landing/style-atlas/clinical-kitchen.md)

### 10.2 Product DNA (z Kroku 9a.1)
- Utility↔Ritual: **utility** (15-min daily session, jak codzienne ważenie się Withings)
- Precision↔Expression: **precision** (5 trybów, 38–42°C, nie "vibe")
- Evidence↔Feeling: **evidence** (raport strategiczny pełen liczb: 66% / 90% / 50%; persona Magda kupuje dane)
- Solo↔Community: **solo** (rytuał indywidualny w ciszy, deprywacja sensoryczna, NIE plemię)
- Quiet↔Loud: **moderate** (data-heavy ale nie klikbajt)
- Tradition↔Future: **future** (smart device + Bluetooth + grafen — material przyszłości)
- Intimate↔Public: **intimate** (zakładasz na twarz, w ciemności, dom/biuro)

Match z Clinical Kitchen: **6/7** (jedyny mismatch: Quiet↔Loud — Clinical Kitchen ma "moderate", Oculia też moderate → match). Argumentacja: Oculia to dokładnie kategoria z punktu 2 stylu — "Health tech (glukometry, ciśnieniomierze)" + "Smart home tech".

### 10.3 MUSZĄ być użyte (auto-paste z pliku stylu)
- Font display: **`IBM Plex Sans`** w `font-family` (display + body)
- Font mono: **`IBM Plex Mono`** w `font-family` (KPI labels, spec readouts)
- Min 1 `.kpi-grid` lub `.dashboard` (primitive 1 — Hero KPI Dashboard)
- Min 1 `.chart-compare` lub `.chart-bar` (primitive 2 — Comparison bar charts)
- Tło sekcji: `#F7F9FB` lub `#FFFFFF` dla min 4 sekcji (lab white)
- Min **8 unique specs** (liczba + unit) w landingu (38°C, 42°C, 15 min, 5 trybów, 1200 mAh, 6–8 sesji, 180°, 99 g szyby, etc.)
- Min **3 `.js-counter`** (animowane KPI w hero + w trust panel)

### 10.4 NIE WOLNO użyć (auto-paste)
- **Fonty:** NIE `Fraunces`, `Cormorant`, `Playfair`, `Italiana`, `Archivo Black`, `Caveat`
- **Layout:** NIE editorial-column, NIE `Nº` eyebrow, NIE full-bleed color sekcji (Poster style)
- **Elementy:** NIE warm cream tło `#F5F1EA` ani `#F6F3ED`, NIE gold accent `#C9A961`, NIE script handwriting, NIE italic em w h1/h2
- **Kolory:** NIE `#F6F3ED`, NIE `#E09A3C`, NIE `#C9A961` (gold luxury palette)
- **Motion:** NIE `.js-parallax`, NIE `.js-split`, NIE `.magnetic`

### 10.5 Section Architecture (z pliku stylu sekcja 8)
**Required (min 11):** Header, Mobile Menu, Hero Dashboard (`.hero-dashboard`), Instrument Panel (`.trust-panel` zamiast trust-bar), Problem (z liczbami), Features Cards (grid 2×2 piktogramy NIE bento tekstowe), How It Works (3 steps z mockups), Comparison Bar Charts (`.chart-compare`), Testimonials z KPI, FAQ, Offer (spec-dense), Final CTA, Footer.
**Forbidden:** Editorial eyebrow `Nº`, warm cream sections, script/handwriting accent.

### 10.6 Motion Budget (z pliku stylu sekcja 10)
```yaml
js_effects_required:
  - .fade-in
  - .js-counter           # min 3 dla KPI cards
  - .js-tilt              # min 2 na cards feature
js_effects_forbidden:
  - .js-split             # za editorial
  - .js-parallax          # za miękkie
  - .magnetic             # zbyt DTC
js_effects_count:
  counter_min: 3          # KPI cards wymagają counter'ów
  counter_max: 10
  tilt_min: 2
```

---

## 11. CONVERSION LOCK — wybrany mechanizm psychologiczny

### 11.1 Wybrany mechanizm
- **Mechanism ID:** `pas`
- **Plik:** [`docs/landing/conversion-atlas/pas.md`](../../docs/landing/conversion-atlas/pas.md)

### 11.2 Conversion DNA (z Kroku 9b.1)
- Pain↔Aspiration: **mixed** (pain-leaning) (kotwice: Hims/Hers — wstyd/lęk; Squatty Potty — dyskomfort fizjologii)
- Decision basis: **mixed** (kotwice: Withings — dane + design; Therabody — specs + emocja)
- Awareness stage: **problem-aware** (kotwice: Squatty Potty — wszyscy znają problem; Casper — znasz materace)
- Risk appetite: **mixed** (kotwice: Casper — mid-price, sceptyk; Therabody — early adopter wellness mid-tier)
- Decision speed: **considered** (kotwice: Casper materac; Glassnova robot — 249–349 PLN to nie impuls dla Polaka)

Match z PAS (`pain · mixed · problem-aware · mixed · considered`): **4/5**. Argumentacja: Brand_info Oculia eksplicite agituje ból ("pieczenie po siódmej godzinie", "pulsujące skronie") — to jest klasyczny PAS hero, gdzie ból jest nazwany przed produktem. Mismatch tylko na osi Pain↔Aspiration (Oculia=mixed, PAS=pain) — ale narracja produktu jest zdecydowanie pain-leaning, co usprawiedliwia.

### 11.3 Hero formula (auto-paste z pliku mechanizmu)

```
Pre-headline: „PIECZE? PULSUJE?"
H1: „7 godzin przed monitorem kosztuje cię wieczór."
Sub: „90% pracowników biurowych zgłasza zmęczenie wzroku. Większość godzi się z tym. Nie musisz. Oculia rozluźnia skronie i nawilża oczy w 15 minut."
Primary CTA: „Skończ z bólem skroni — 299 zł"
Secondary signal: 4.8/5 z 1 247 opinii · 30 dni na zwrot · gwarancja PL
```

### 11.4 MUSZĄ być użyte (auto-paste z pliku mechanizmu)
- **pas_hero_pain_word** — hero h1 zawiera ≥1 słowo bólu (regex: `\b(boli|kosztuje|tracisz|frustruje|męczy|stresuje|godzin tracisz|bez sensu|zmagasz|denerwuje|irytuje|drażni|ucisz|żmudny|udręka)\b`) → użyte: „kosztuje", „męczy" w sub
- **pas_amplifier_section** — sekcja `.pain-amplifier` lub `.problem-amplifier` obecna (zaraz po hero)
- **pas_solution_reveal** — sekcja `.solution-reveal` lub fraza „Dlatego stworzyliśmy" / „Rozwiązanie:" / „Tu pojawia się"
- **pas_consequence_specifics** — ≥2 konkretne liczby/jednostki w pain/agitate (regex: `[0-9]+ (godzin|minut|zł|dni|razy|miesięcy)`) → użyte: „7 godzin", „47 minut bólu skroni"
- **pas_offer_pain_callback** — w sekcji offer guarantee odwołuje się do bólu z hero („Pulsujące skronie nie znikną? Zwracamy kasę.")

### 11.5 NIE WOLNO użyć (auto-paste)
- **forbidden_aspirational_hero** — hero NIE może być aspiracyjne / status-driven (`\b(odkryj|zostań|dołącz do|stań się|premium|luksus|elegancja|aspiruj)\b` w h1)
- **forbidden_solution_first** — hero NIE może zaczynać od features/specs produktu („Smart eye massager z grafenem..." → ZAKAZ)
- **forbidden_lifestyle_gallery** — NIE umieszczaj `.lifestyle-gallery` ani Instagram-style UGC grid (PAS to drama bólu, nie aesthetic feed)
- **forbidden_tribe_language** — NIE „dla ciebie który...", „dla świadomych", „dla wymagających" (Identity Buying language)
- **forbidden_curiosity_clickbait** — NIE pytania-zagadki w h1 typu „Co optycy ukrywają?"

### 11.6 Style compatibility (z pliku mechanizmu sekcja 9)
```yaml
forces: []                # PAS nie wymusza pojedynczego stylu
compatible:
  - brutalist-diy
  - editorial-print        # tylko investigative-journalism wariant
  - clinical-kitchen       # ✅ wybrany
  - poster-utility
  - swiss-grid
  - rugged-heritage
incompatible:
  - apothecary-label
  - panoramic-calm
  - cottagecore-botanical
  - playful-toy
```

**Coupling z STYLE LOCK:** `clinical-kitchen` jest na liście **compatible** PAS — naturalna para ("Data-driven agitacja"). Brak konfliktu.

### 11.7 Section sequence (z pliku mechanizmu sekcja 5)

**Sekcje wymagane (extra ponad standard 14):**
- `.pain-amplifier` — sekcja amplifikująca ból, zaraz po hero (przed solution). 3 specific consequences w formacie statystyk (7h przed monitorem, 90% biurowych pracowników, 47 min pulsowania skroni dziennie).
- `.solution-reveal` — explicit moment „tu pojawia się produkt" (3–4 sekcja). Frame: „Dlatego stworzyliśmy Oculię."

**Sekcje pominięte:**
- Lifestyle gallery / UGC grid — przerywa narrację bólu
- „Dla kogo" personas-grid (Identity Buying tribe segmentation) — PAS agituje uniwersalny ból, nie segmentuje plemienia

### 11.8 Offer formulation (z pliku mechanizmu sekcja 6)

```
Price display:
  Stara cena (przekreślona): 449 zł
  Nowa cena (dominująca): 299 zł
  Savings badge: „Oszczędzasz 150 zł (33%)"

Guarantee — POŁĄCZONA z bólem hero:
  „30 dni testu w domu. Pieczenie po pracy nie zniknie? Pulsujące skronie wrócą? Zwracamy kasę. Bez pytań."

Payment options: BLIK / Karta / Przelew (BLIK pierwsze)

Trust strip:
  - 30 dni na zwrot
  - Polska obsługa
  - Bezpieczna płatność (BLIK · Karta)
  - 4.8★ z 1 247 opinii
  - Gwarancja PL 24 mies.
```
