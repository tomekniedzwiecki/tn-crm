# Design Brief — Postawnik

<!-- Ten plik jest OBOWIĄZKOWY. scripts/verify-brief.sh blokuje ETAP 2 jeśli któraś sekcja jest pusta. -->
<!-- Wypełnij wszystkie 8 sekcji ZANIM przejdziesz do generowania HTML. -->
<!-- Pełna dokumentacja: docs/landing/01-direction.md -->

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [x] Nowy: **Apothecary Label — clinical specimen card**

**Uzasadnienie wyboru** (1-2 zdania z auditu produktu):

Postawnik to dyskretny gadget medyczny noszony bezpośrednio na ciele (intimate · solo · quiet) z mierzalnymi parametrami (25° pochylenia, 70 g, 15 dni baterii, silikon klasy spożywczej) — produkt mówi językiem etykiety leku, nie magazynu lifestylowego. Apothecary Label dopasowuje 6/7 osi DNA (utility, precision, evidence, solo, quiet, intimate; "future" reinterpretowane jako "present" — to fizyczny haptic device, nie smart-app).

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

> Marki z prawdziwego świata, NIE inne landingi z `landing-pages/`. Każda referuje konkretny element wizualny lub tonalny.

1. **Withings (Body Smart, ScanWatch)** — pionowy stack spec rows: liczba 25° / 70 g / 15 dni jako primary headline danych, nie jako "feature card" obok ikony. Tabular numerals + lab gray meta + ikona w czystym kolorze brand.
2. **Necessaire (body care apothecary)** — paper tło + ink near-black tekst + 1 brand color jako accent. Etykieta jest designem: gigantyczna typografia spec (`SKŁADNIK: H₂O`) zamiast hero photoshoot lifestyle.
3. **Oura Ring** — intimate body-worn device storytelling: "noszę pod koszulą / na palcu, nikt nie widzi", micro-haptics jako "voice". Ton: spokojny, kliniczny, ale ciepły dzięki paper-cream tłu.

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent):** #1E6F7A (deep teal — CTA, active highlights, em w h1)
- **Ink (główny tekst):** #1A1A1F (near-black z brand)
- **Paper (tło):** #F5F1EA (warm cream z brand — łamie strict apothecary "paper white", brand-priority per manifest v4.0)
- **Accent / Gold (opcjonalny):** #C9A961 (sparingly — LOT numbers, footnote markers `[1]`, dividers)
- **Support gray:** #8B8B92 (meta tekst, jednostki, lab-gray-equivalent)
- Drop **#EBA99C peach** NIE używamy (psuje clinical vibe)

## 4. Typografia (z workflow_branding type=font)

- **Display (nagłówki):** `Plus Jakarta Sans` 500/700/800 + `&display=swap`
- **Body (treść):** `Inter` 400/500/600/700 + `&display=swap`
- **Mono / Caption:** `Space Mono` 400/700 — etykieta LOT, jednostki, batch IDs

> ⚠️ Plus Jakarta Sans, Inter i Space Mono w pełni obsługują polskie diakrytyki — `subset=latin-ext` NIE jest potrzebny w Google Fonts v2 (memory: feedback-landing-fonts-polish.md).
> Max 3 rodziny fontów. ✓

## 5. Persona główna (z report_pdf — Raport_Strategiczny_dla_Korektora_Postawy.pdf)

- **Wiek / zawód / status:** Knowledge worker 30-45 lat, 8h dziennie przed monitorem (programista, księgowa, project manager) ALBO rodzic dziecka 7-14 lat, którego trzeba codziennie upominać o garbienie nad lekcjami. Często oba na raz — rodzic-pracownik biurowy.
- **Kluczowy pain point:** Próbował tradycyjnych pajączków/gorsetów, które ściskają pod ubraniem i niczego nie uczą — mięśnie wracają do garbienia po zdjęciu. Słyszał „wyprostuj się" przez całe życie i ma tego dość. W pracy nie chce widocznego sprzętu pod koszulą.
- **Kluczowa motywacja zakupu:** Chce nawyku, nie kontroli zewnętrznej. Coś, co działa w tle bez zmieniania ubioru, bez aplikacji, bez ładowania co dzień. Poszukuje „korektora bez upominania" — terapia nawyku, nie protezka mechaniczna.
- **Cytat brzmiący jak wypowiedź persony** (do testimonials): „Po dwóch tygodniach łapię się sam — czuję wibrację, prostuję plecy, wibracja znika. Mięśnie zapamiętały. Pierwszy raz coś w moich plecach zadziałało bez bólu i bez gorsetu."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

> Procedura wymaga ZAWSZE budowania od zera (MODE=forge). Tabela poniżej to historia, NIE template'y do kopiowania (memory: `feedback-landing-always-forge.md`).

Brak istniejącego landinga w kierunku Apothecary Label — to pierwszy projekt tego kierunku. Świadomie odróżniam od:

- **vitrix (Panoramic Calm)** — NIE używam architektonicznych panoram, dashboard-mockup hero, italic Instrument Serif eyebrow. Postawnik jest intimate (na ciele), nie public (architectural).
- **paromia (Editorial/Luxury)** — NIE używam Fraunces + Italiana + oversized Nº numeral italic. Postawnik mówi językiem etykiety leku, nie redakcji magazynu.
- **rysek (Playful)** — NIE używam Fredoka + Caveat + emoji decorations. Postawnik jest kliniczny i dyscyplinowany, nie zabawny.
- **kafina (Rugged)** — NIE używam Archivo Black + dark hero + stamp badges. Postawnik jest jasny, paper-cream, sterylny.

**Czego specyficznie unikam ze wszystkich 6 baseline'ów:** trust-bar z ikonami w kolorowych kółkach (Apothecary używa `sec-meta` strip jak header etykiety leku: `POSTAWNIK · LOT 2026-Q2 · BATCH 001 · CE`), bento 2×2 z kolorowymi gradientami (Apothecary używa pionowego `feat-spec-list` jak składu produktu).

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? — Withings, Necessaire, Oura: wszystkie DTC ale nie generic ecom; Withings to medical device, Oura to wearable subscription, Necessaire to apothecary-style body care. Żadna nie jest "Amazon basics".
- [x] Czy odwracając logo nadal zgaduję branżę (moodboard jest charakterystyczny)? — TAK: paper-cream + ink + spec table 25°/70g/15d natychmiast komunikuje "device pomiarowy / klinika". Nie wygląda jak fashion ani jak food.
- [x] Czy persona NIE pasowałaby do innego baseline'u z tabeli? — TAK: persona to "uciekinier od pajączków, który nie chce widocznego gadżetu" — wyklucza Playful (zbyt zabawne), Rugged (zbyt outdoor), Editorial (zbyt fashion), Retro-Futuristic (zbyt edgy). Tylko Apothecary i ewentualnie Clinical Kitchen pasują, a Clinical wymaga dashboard-data viz, którego Postawnik offline nie generuje.
- [x] Czy manifest w 5 linijkach da się zacytować bez słów „premium", „luxury", „wysoka jakość"? — TAK: cytat manifesta to „postawa to nie dyscyplina, to nawyk, który ktoś pilnuje za Ciebie" — żadnego słownika lifestyle.

## 8. Signature element

> Jeden charakterystyczny element wizualny, który zostanie po obejrzeniu landinga. NIE „nowoczesny design" — coś konkretnego.

**Twój signature element:** **Wielki spec-label block z parametrem `25°` jako monumentalna typografia (clamp 100-180px) w stylu etykiety leku** — `KĄT WYKRYWANIA: 25°`, otoczony 2px solid ink frame, padding 56px, pod spodem `spec-label-table` z tabular-nums numerami: 70 g · 15 dni · IPX5 · silikon klasy spożywczej. Ten blok pojawia się 2× w landingu (po hero jako "co mierzy", przed offer jako "co dostajesz") i jest emotional anchor: "to nie jest gadżet — to instrument".

Drugi mikrosignature: każda liczba w landingu ma footnote marker `[1]` w accent gold #C9A961 (Space Mono 11px), a w stopce sekcji jest aktywny `<table>` z odniesieniami: `[1] Pomiar IMU MPU-6050, kalibracja 25°±2° po 30s noszenia. [2] Test laboratoryjny baterii, 14h aktywności/dobę.` — to buduje zaufanie typu "evidence-based" zamiast typowego ecom „sprawdzone przez 10 000 klientów".

## 9. Warianty sekcji (z section-variants.md, LIMITED przez Style Lock)

- **Hero:** H1 Split klasyczny — pionowy spec-label po prawej zamiast packshotu lifestyle, headline po lewej z `em` w accent teal na kluczowym słowie ("nawyk").
- **Features:** F3 Linear stack — `feat-spec-list` z mono `01 · NAWYK`, `02 · DYSKRECJA`, `03 · POMIAR`, `04 · BATERIA`, `05 · MATERIAŁ`, `06 · GWARANCJA`. Pionowo, table-style separators.
- **Testimonials:** T2 Before/After stats — każdy testimonial z mierzalnym KPI obok ("dni do nawyku: 14", "godzin garbienia/dobę przed: 6.2 / po: 1.4").

---

## 10. STYLE LOCK — Apothecary Label

> Ta sekcja jest **kontraktem** — łamiesz ją = FAIL w `verify-style-lock.sh`.

### 10.1 Wybrany styl
- **Style ID:** `apothecary-label`
- **Plik:** [`docs/landing/style-atlas/apothecary-label.md`](../../docs/landing/style-atlas/apothecary-label.md)

### 10.2 Product DNA (z Kroku 9a.1)
- Utility↔Ritual: **utility** (kotwice: Withings Body Smart, parownica Steamla)
- Precision↔Expression: **precision** (kotwice: Anker PowerCore, Withings — konkretne metryki)
- Evidence↔Feeling: **evidence** (kotwice: Necessaire spec-first, Oura sleep score data)
- Solo↔Community: **solo** (kotwice: Oura Ring, mono-olej)
- Quiet↔Loud: **quiet** (kotwice: Oura, Necessaire — minimal apothecary aesthetic)
- Tradition↔Future: **present** (Postawnik to fizyczny haptic device offline; reinterpretacja "future" → "present" — działa w teraźniejszości, nie buduje IoT ekosystemu)
- Intimate↔Public: **intimate** (kotwice: Oura Ring na palcu, Necessaire body care, Postawnik pod koszulą)

Match z wybranym stylem: **6/7**. Argumentacja (1 zdanie): Apothecary Label to jedyny styl, którego cała architektura (spec-label, sec-meta, feat-spec-list, footnoted claims) odzwierciedla emocjonalną kategorię produktu — "to nie gadżet, to instrument medyczny" — bez psucia evidence-based tonu (clinical-kitchen wymaga dashboard data viz, którego Postawnik offline nie generuje).

### 10.3 MUSZĄ być użyte (po enforcement verify-style-lock)
- Display font: **`IBM Plex Sans`** (Style Lock strict — verify-style-lock.sh wymaga IBM Plex zamiast Plus Jakarta Sans z brandu; brand teal `#1E6F7A` zachowany jako primary accent)
- Mono font: **`IBM Plex Mono`** (zamiast Space Mono z brandu — Style Lock strict)
- Body: **`Inter`** (zgodne z brandem i atlasem)
- Paper: **`#FAFAF7`** Apothecary Paper White (Style Lock strict zamiast `#F5F1EA` cream z brandu)
- Ink: **`#0F1115`** Apothecary Ink (Style Lock strict zamiast `#1A1A1F` z brandu — różnica minimalna)
- Min 1 `<table>` lub `.spec-*-list` w landingu — zaplanowane: 2× spec-label-table + 1× feat-spec-list + 1× comparison-table + 1× footnotes-table
- Padding sekcji ≥ `100px 0` desktop (mam 120px)
- Primitive 1 (spec-label-section) obecny — 2× (po hero + przed offer)
- Primitive 2 (sec-meta strip) zamiast trust-bar z ikonami — `POSTAWNIK · LOT 2026-Q2 · BATCH 001 · CE · 30 DNI ZWROT`
- Primitive 3 (feat-spec-list) zamiast bento — features jako pionowa lista `01 · KEY → spec body`
- Primitive 4 (footnoted claims) — każda liczba z `[1]` markerem, stopka sekcji z odniesieniami

### 10.4 NIE WOLNO użyć (ścisły Style Lock — bez brand override)
- **Fonty:** NIE Fraunces, Cormorant, Playfair, Italiana, Libre Bodoni, Caveat, Fredoka, Archivo Black, Nunito, Plus Jakarta, Space Mono
- **Layout:** NIE `grid-template-columns: 1fr 1fr` dla features (bento 2×2 zakaz)
- **Elementy:** NIE `Nº` w eyebrow, NIE `.hero-numeral` (oversized italic), NIE `.trust-strip` z dark bg + icon circles
- **Kolory:** NIE `linear-gradient` w tłach sekcji, NIE `#C9A961` gold (verify-style-lock blokuje), NIE `#F6F3ED` linen cream
- **Motion:** NIE `.js-split`, NIE `.js-parallax`, NIE `.magnetic`

### 10.5 Section Architecture
Required (min 11): Header, Mobile Menu, Hero (H1 split + pionowa spec-label po prawej), Sec Meta Strip (nie trust-bar), Spec Label Big (signature primitive 1), Features as Spec Rows (feat-spec-list), How It Works (3 steps minimal), Comparison Table (NIE cards), FAQ, Offer (spec-dense), Final CTA, Footer
Forbidden: Trust Bar dark z ikonami w kolorowych kółkach, Social Proof Marquee, Final CTA Banner z full-bleed gradient

### 10.6 Motion Budget
```yaml
js_effects_required:
  - .fade-in
  - .js-counter (min 1, dla 25° / 70g / 15dni / IPX5)
js_effects_forbidden:
  - .js-split
  - .js-parallax
  - .magnetic
js_effects_count:
  counter_min: 1
  counter_max: 3
  magnetic_min: 0
  tilt_min: 0
  parallax_min: 0
```
