# Field Manual — instrukcja polowa zamiast katalogu outdoorowego

> Strona czyta się jak FM 21-76: numeracja MIL, figury „FIG. N", kratka miernicza i jeden sygnałowy pomarańcz. Sprzęt opisany jak wyposażenie, nie jak lifestyle.

## 1. Product DNA profil

- **Utility ↔ Ritual:** utility
- **Precision ↔ Expression:** precision
- **Evidence ↔ Feeling:** evidence
- **Solo ↔ Community:** solo
- **Quiet ↔ Loud:** moderate
- **Tradition ↔ Future:** present
- **Intimate ↔ Public:** public

### DNA Anchors — 3 produkty które ten styl obsłużyłby
1. **Multitool klasy Leatherman (EDC, stal 420HC, 19 narzędzi)** — utility (wykonuje pracę), precision (tolerancje, twardość HRC), evidence (gwarancja 25 lat, atest stali). Kupowany na parametry, noszony publicznie.
2. **Filtr do wody outdoor typu Sawyer/Katadyn (0,1 µm)** — evidence w czystej postaci: log redukcji bakterii, przepływ l/min, żywotność membrany. Zero emocji, sama specyfikacja.
3. **Siekiera kempingowa typu Fiskars X-series** — utility + precision (geometria ostrza, waga głowicy, balans), moderate (widoczna na biwaku), present (nowoczesny kompozyt, nie heritage-larp).

## 2. Kategorie produktów (3-5)

- Narzędzia ręczne i multitoole (EDC, scyzoryki, klucze, zestawy bitów)
- Sprzęt survival/bushcraft (filtry wody, krzesiwa, noże, apteczki IFAK)
- Akcesoria kempingowo-trekkingowe (latarki czołowe, paracord, organizery, kuchenki)
- Wyposażenie warsztatowo-garażowe mid-price (imadła, miernice, organizacja narzędzi)
- Plecaki/torby techniczne spec-first (MOLLE, litraż, Cordura — bez fashion overlay)

## 3. Real-world refs (3-5 marek)

- **US Army Field Manuals (FM 21-76 Survival)** — artefakt źródłowy: numeracja rozdziałów 1.1/1.2, figury „Figure 3-2", layout dwukolumnowy, zero ozdobników
- **Leatherman** — exploded diagrams narzędzi, spec callouts z liniami odniesienia, gwarancja 25 lat jako twardy claim
- **Best Made Co. (archiwalne)** — produkt jako figura na neutralnym tle z podpisem technicznym, manual typography
- **GoRuck** — „built to spec" copy, parametry MIL-SPEC jako argument sprzedażowy, sygnałowy orange na utility tle
- **5.11 Tactical** — spec-tabele przy produkcie, nazewnictwo modelowe (kod + liczba), feature callouts bez lifestyle'u

## 4. Font stack

> ⚠️ PL safety: sprawdź renderowanie Ł/Ś/Ć/Ź/Ż/Ń/Ó w UPPERCASE na frazie `ZAMÓW ŁÓŻKO ŻYCIE`. Wszystkie 3 fonty mają latin-ext (zweryfikowane w Google Fonts CSS 2026-06-10).

- **Display:** `Saira Condensed` 600/700 — condensed, inżynierski, stencil-ish w UPPERCASE z letter-spacing; nagłówki jak tytuły rozdziałów manuala
- **Body:** `Barlow` 400/500/600 — grotesk rodem z publicznego oznakowania (low-contrast, utility), czytelny w 15-17px
- **Mono / Accent:** `Overpass Mono` 400/600 — dziedzictwo Highway Gothic; numeracja MIL, etykiety FIG, tabliczka znamionowa

Link Google Fonts (BEZ `&subset=latin-ext`):
```html
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Overpass+Mono:wght@400;600&family=Saira+Condensed:wght@600;700&display=swap" rel="stylesheet">
```

## 5. Paleta (60/30/10)

| Rola | Nazwa | Hex | Gdzie |
|------|-------|-----|-------|
| Dominant 60% | Canvas Khaki | `#EAE6D8` | tło strony (papier polowy) |
| Secondary 30% | Olive Drab | `#3F4434` | nagłówki, ramki, sekcje dark, footer |
| Accent 10% | Signal Orange | `#E8551F` | CTA, numery MIL, etykiety FIG, highlights |
| Support 1 | Grid Tan | `#D6D1BC` | kratka miernicza, hairlines, separatory |
| Support 2 | Field Ink | `#20231A` | body text na khaki |

**Filozofia koloru:** warm-neutral duotone (khaki + oliwka) + 1 sygnałowy akcent — jak strona manuala z pomarańczowym markerem instruktora; zero gradientów, zero moro/camo.

## 6. Layout DNA

**Stack dense** — pionowe „strony instrukcji": gęste sekcje z numeracją MIL, kolumna treści max 760px, full-bleed tylko dla tabel porównawczych i dark-olive pasów (1200px). Kratka miernicza w tle wybranych sekcji robi robotę „papieru technicznego". ZERO bento 2×2.

## 7. Signature primitives (3-5)

### Primitive 1: `fm-fig` — figura z etykietą „FIG. N" (dominanta stylu)
Każde zdjęcie/placeholder produktu to figura z manuala: ramka 1px olive + narożniki 3px + podpis mono `FIG. 01 — ...`.

```html
<figure class="fm-fig">
  <div class="fm-fig-media"><!-- placeholder / packshot --></div>
  <figcaption class="fm-fig-cap">
    <span class="fm-fig-no">FIG. 01</span> Multitool M-240 — widok ogólny, skala 1:1
  </figcaption>
</figure>
```
```css
.fm-fig { position: relative; border: 1px solid var(--olive); padding: 16px; margin: 0; background: var(--paper); }
.fm-fig::before, .fm-fig::after { content: ''; position: absolute; width: 18px; height: 18px; }
.fm-fig::before { top: -1px; left: -1px; border-top: 3px solid var(--olive); border-left: 3px solid var(--olive); }
.fm-fig::after { bottom: -1px; right: -1px; border-bottom: 3px solid var(--olive); border-right: 3px solid var(--olive); }
.fm-fig-media { aspect-ratio: 4 / 3; background: var(--grid-tan); display: grid; place-items: center; }
.fm-fig-cap { font-family: var(--mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; padding-top: 12px; border-top: 1px solid var(--grid-tan); margin-top: 12px; }
.fm-fig-no { color: var(--signal); font-weight: 600; margin-right: 8px; }
```

### Primitive 2: `fm-mil` — numeracja MIL nagłówków (1.1, 3.2)
Każda sekcja ma numer rozdziału jak w manualu wojskowym, mono + signal orange przed nagłówkiem condensed UPPERCASE.

```html
<h2 class="fm-h"><span class="fm-mil">3.1</span> Specyfikacja techniczna</h2>
```
```css
.fm-h { font-family: var(--display); font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em; font-size: clamp(32px, 4.5vw, 52px); line-height: 1.05; }
.fm-mil { font-family: var(--mono); font-weight: 600; font-size: 0.5em; color: var(--signal); vertical-align: 0.45em; margin-right: 16px; letter-spacing: 0.08em; }
```

### Primitive 3: `fm-grid-bg` — kratka miernicza w tle sekcji
Subtelna siatka 24px (CSS background, bez obrazków) na 2-3 sekcjach — papier milimetrowy/poligonowy. Jedyny dozwolony „gradient" na landingu.

```css
.fm-grid-bg { background-color: var(--paper); background-image:
  repeating-linear-gradient(0deg, var(--grid-tan) 0 1px, transparent 1px 24px),
  repeating-linear-gradient(90deg, var(--grid-tan) 0 1px, transparent 1px 24px); }
```

### Primitive 4: `fm-corners` — ramka z narożnikami (karty, offer box)
Bracket frame: cienka ramka + pogrubione narożniki. Offer box OBOWIĄZKOWO w tej ramce.

```html
<div class="fm-corners">...</div>
```
```css
.fm-corners { position: relative; border: 1px solid var(--olive); padding: 40px; background: var(--paper); }
.fm-corners::before, .fm-corners::after { content: ''; position: absolute; width: 22px; height: 22px; }
.fm-corners::before { top: -1px; right: -1px; border-top: 3px solid var(--signal); border-right: 3px solid var(--signal); }
.fm-corners::after { bottom: -1px; left: -1px; border-bottom: 3px solid var(--signal); border-left: 3px solid var(--signal); }
```

### Primitive 5: `fm-plate` — tabliczka znamionowa (zamiast trust-bar)
Pas key-value mono jak data plate na sprzęcie: `MODEL M-240 · STAL 420HC · MASA 241 G · GWARANCJA 25 LAT`.

```html
<div class="fm-plate">
  <span>MODEL M-240</span><span>STAL 420HC</span><span>MASA 241 G</span><span>GWARANCJA 25 LAT</span>
</div>
```
```css
.fm-plate { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px 24px; padding: 14px 0; border-top: 2px solid var(--olive); border-bottom: 2px solid var(--olive); font-family: var(--mono); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; }
```

---

## 8. Section Architecture

**Minimum sekcji:** 11 (z 14 available)

```yaml
required:
  - Header                  # .header (logo + fm-plate skrót w pasku)
  - Mobile Menu             # .mobile-menu
  - Hero                    # .hero z fm-fig (packshot jako FIG. 01) + fm-mil "1.1"
  - Spec Plate              # .fm-plate (ZAMIAST trust-bar)
  - Problem                 # .problem — P1/P3, numeracja "2.1"
  - Features as Figures     # .feat-manual — linear stack, każda cecha z fm-fig (FIG. 02+)
  - How It Works            # .how-it-works — W3 spec-strip, numeracja "4.1"
  - Comparison              # .comparison — C1 tabela ✓/✗ w fm-corners
  - Testimonials            # .testimonials — T2 lub T6
  - FAQ                     # .faq (5-7 pytań, numeracja MIL pytań: 7.1, 7.2...)
  - Offer                   # .offer w fm-corners + fm-plate z parametrami zestawu
  - Footer                  # <footer> dark olive

optional:
  - Gallery FIG             # dodatkowe figury produktu (FIG. 05+) na fm-grid-bg
  - Final CTA Banner        # dark olive pas z signal orange CTA
  - Sticky CTA Mobile       # .sticky-cta

forbidden:
  - Social Proof Marquee    # nie pasuje do tonu instrukcji
  - Trust Bar dark z ikonami w kółkach  # zastępuje go fm-plate
  - Lifestyle gallery full-bleed        # zdjęcia tylko jako figury FIG z podpisem
```

## 9. Allowed Variants

> Z [`../reference/section-variants.md`](../reference/section-variants.md). Wybór Claude'a LIMITED do listy niżej.

```yaml
hero_allowed: [H1, H5, H7]
hero_forbidden: [H2, H3, H4, H6, H8, H9, H10]
# H1 Split klasyczny — OK: copy lewo, packshot prawo jako fm-fig „FIG. 01"
# H5 Oversized typography — OK: condensed stencil-ish headline na fm-grid-bg
# H7 Product macro — OK: detal ostrza/mechanizmu jako figura z podpisem skali
# H2 lifestyle, H4 editorial numeral, H6 portret = nie-manual; H9 video za miękkie; H10 dubluje P-warianty

features_allowed: [F3, F6]
features_forbidden: [F1, F2, F4, F5]
# F3 Linear stack — DEFAULT: każda cecha = fm-fig + parametr (FIG. 02, FIG. 03...)
# F6 Sticky scrollytelling — OK dla „mechanizm krok po kroku"
# F1/F2 bento ZAKAZ (core forbidden), F4 phone mockupy obce, F5 carousel za DTC

testimonials_allowed: [T2, T6]
testimonials_forbidden: [T1, T3, T4, T5]
# T2 Before/After stats — OK (evidence, liczby z terenu)
# T6 Ściana atestów + 1 cytat — OK (atesty/normy pasują do manuala)
# T1 avatary-grid i T4 UGC-wall za social-lifestyle, T3 video obce, T5 magazine-style za editorial

problem_allowed: [P1, P3]
problem_forbidden: [P2, P4]
# P1 Stat-led — OK: jedna brutalna liczba awarii/kosztu sprzętu-zabawki
# P3 Koszt bezczynności — OK: rachunek za tani sprzęt wymieniany co sezon
# P2 scena 7:30 za lifestyle; P4 foto „przed" dubluje konwencję figur FIG

how_allowed: [W3]
how_forbidden: [W1, W2]
# W3 Numerowany spec-strip — JEDYNY (section-variants wprost: evidence style → W3)
# W1 okrągłe ikony wyglądają obco w manualu, W2 foto-timeline za lifestyle

comparison_allowed: [C1, C3]
comparison_forbidden: [C2]
# C1 Tabela ✓/✗ — DEFAULT, w ramce fm-corners, vs KATEGORIA
# C3 Jednowierszowy spec-bar — OK gdy landing już dense
# C2 karty emocjonalne łamią rejestr evidence

offer_allowed: [O1, O3]
offer_forbidden: [O2]
# O1 Single offer box — DEFAULT, w fm-corners + fm-plate parametrów
# O3 Guarantee-led — OK gdy realna długa gwarancja (kultura 25-lat Leatherman)
# O2 multipack nie pasuje do narzędzi kupowanych w 1 szt.
```

Default (jeśli pierwsza reguła z drzewa decyzyjnego w section-variants.md trafia w forbidden) → weź **pierwszy z allowed** w kolejności z listy.

## 10. Motion Budget

**Level:** subtle

```yaml
js_effects_required:
  - .fade-in               # zawsze, delikatne
  - .js-counter            # min 1 (parametry: masa / lata gwarancji / liczba narzędzi)

js_effects_forbidden:
  - .js-split              # char-by-char psuje wojskową dyscyplinę typografii
  - .js-parallax           # brak oversized numerals w tle, kratka jest statyczna
  - .magnetic              # za DTC/playful dla tonu instrukcji
  - .js-tilt               # 3D tilt psuje „papierowość" manuala

js_effects_count:
  counter_min: 1
  counter_max: 3
  magnetic_min: 0          # zakaz
  tilt_min: 0              # zakaz
  parallax_min: 0          # zakaz
```

## 11. Copy Voice

> Lekcja dark-academia v5.0: charakter stylu żyje WYŁĄCZNIE w warstwie dekoracyjnej (numeracja MIL, etykiety FIG, mono plate). Body copy = normalny polski direct response.

- **Register:** technical + direct (karta sprzętu, nie powieść wojenna) — body copy ZAWSZE polski DR
- **Sentence length:** short (8-16 słów), zdania oznajmujące, parametr + korzyść
- **Person:** 2-osoba (Ty/Twój), bez „my/nasz"
- **Allowed power words:** „testowane", „atestowane", „norma [konkretna]", „gwarancja [liczba] lat" — zawsze ze źródłem/liczbą
- **Forbidden power words:** „premium", „luxury", „rewolucyjny", „arsenał", „misja", „bojowy", „taktyczny" (chyba że produkt faktycznie taki jest) — ZAKAZ militarnego LARP-u w body copy; żadnego AI-poetic i purple prose

## 12. Example Snippet (hero + feature)

```html
<!-- Hero (H1 split) -->
<section class="hero fm-grid-bg">
  <div class="container hero-split">
    <div>
      <h1 class="fm-h"><span class="fm-mil">1.1</span> Jedno narzędzie. <em>19 funkcji.</em> 25 lat gwarancji.</h1>
      <p class="hero-sub">Multitool M-240 ze stali 420HC — kombinerki, 2 ostrza, bity i otwieracz w 241 gramach.</p>
      <a href="#offer" class="btn-primary">Zamów M-240 — 349 zł</a>
    </div>
    <figure class="fm-fig">
      <div class="fm-fig-media"><!-- packshot placeholder --></div>
      <figcaption class="fm-fig-cap"><span class="fm-fig-no">FIG. 01</span> M-240 — widok ogólny</figcaption>
    </figure>
  </div>
  <div class="container"><div class="fm-plate">
    <span>MODEL M-240</span><span>STAL 420HC</span><span>MASA 241 G</span><span>GWARANCJA 25 LAT</span>
  </div></div>
</section>

<!-- Feature (F3 linear z figurą) -->
<section class="feat-manual">
  <div class="container">
    <h2 class="fm-h"><span class="fm-mil">3.1</span> Blokada ostrza</h2>
    <div class="feat-row">
      <figure class="fm-fig">
        <div class="fm-fig-media"><!-- detal placeholder --></div>
        <figcaption class="fm-fig-cap"><span class="fm-fig-no">FIG. 02</span> Mechanizm liner-lock — detal</figcaption>
      </figure>
      <p>Ostrze blokuje się automatycznie po otwarciu. Zamykasz jedną ręką, w rękawicy roboczej też.</p>
    </div>
  </div>
</section>
```

```css
:root {
  --display: 'Saira Condensed', 'Arial Narrow', sans-serif;
  --body: 'Barlow', system-ui, sans-serif;
  --mono: 'Overpass Mono', 'Courier New', monospace;
  --paper: #EAE6D8;
  --olive: #3F4434;
  --signal: #E8551F;
  --grid-tan: #D6D1BC;
  --ink: #20231A;
}
body { font-family: var(--body); background: var(--paper); color: var(--ink); }
h1 em { font-style: normal; color: var(--signal); }
.btn-primary { display: inline-block; padding: 18px 36px; background: var(--signal); color: #fff; font-family: var(--mono); font-size: 13px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; border-radius: 0; }
.hero { padding: 140px 0 80px; }
.hero-split { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 64px; align-items: center; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 32px; }
.feat-row { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 48px; align-items: center; }
@media (max-width: 720px) { .hero-split, .feat-row { grid-template-columns: 1fr; } }
```

---

## MUSZĄ / NIE WOLNO — Style Lock (grep-sprawdzalne)

### MUSZĄ być użyte
- Display font: `Saira Condensed` w `font-family` (nagłówki UPPERCASE)
- Body font: `Barlow`; Mono: `Overpass Mono` (numeracja MIL + FIG + plate)
- Paleta: min 3 z 5 hex-ów z sekcji 5 (w tym `#E8551F` na CTA)
- Primitive 1 obecny: `.fm-fig` min 3 wystąpienia (FIG. 01-03+)
- Numeracja MIL: `.fm-mil` w nagłówkach sekcji (1.1, 2.1, 3.1...)
- Kratka miernicza: `repeating-linear-gradient` (`.fm-grid-bg`) w min 2 sekcjach
- Offer box w `.fm-corners`

### NIE WOLNO użyć
- **Fonty:** NIE `IBM Plex Sans`, `IBM Plex Mono`, `Inter` (apothecary/clinical), NIE `Helvetica` (swiss), NIE `Fraunces`, `Cormorant`, `Playfair` (editorial/luxury), NIE `Archivo Black` (poster), NIE `Space Mono`, `Work Sans` (outdoorsy-expedition), NIE `Black Ops One`/`Allerta Stencil` (kostiumowy stencil)
- **Layout:** NIE bento 2×2 (`grid-template-columns: 1fr 1fr` dla features), NIE 12-col modular grid
- **Kolory:** NIE `#FAFAF7` (apothecary paper), NIE `#FFFFFF` jako tło sekcji, NIE `#C9A961`/`#E09A3C` (gold/brass), NIE camo/moro tekstury, NIE `linear-gradient` w tłach (wyjątek: `repeating-linear-gradient` kratki)
- **Elementy:** NIE `Nº` eyebrow, NIE `.hero-numeral` (oversized italic), NIE okrągłe ikony w kółkach, NIE stamp badges (rugged-heritage)
- **Motion:** NIE `.js-split`, NIE `.js-parallax`, NIE `.magnetic`, NIE `.js-tilt`
- **Copy:** NIE militarny LARP w body („misja", „arsenał", „bojowy")

---

## Podobne style (ale RÓŻNE)

- [`outdoorsy-expedition.md`](./outdoorsy-expedition.md) — Expedition to mapa/wyprawa (Work Sans + Space Mono, koordynaty, tradition, stamps). Field Manual to strona instrukcji (Saira Condensed, numeracja MIL, figury FIG, kratka miernicza).
- [`swiss-grid.md`](./swiss-grid.md) — Swiss = pure white + Helvetica + 12-col, chłodny i quiet. Field Manual = khaki papier + kratka + sygnałowy orange, moderate.
- [`apothecary-label.md`](./apothecary-label.md) — Apothecary to etykieta leku (IBM Plex, sterylny paper white, spec-label). Field Manual to instrukcja sprzętu (figury z narożnikami, olive/khaki, MIL).
- [`rugged-heritage.md`](./rugged-heritage.md) — Rugged = heritage/tradition (Archivo, stamp badges, masculine nostalgia). Field Manual = present-day utility bez nostalgii i bez stempli.

## Changelog
- 2026-06-10 utworzony, v5.0 (evidence cluster — zapowiedziany w `clusters.md`)
