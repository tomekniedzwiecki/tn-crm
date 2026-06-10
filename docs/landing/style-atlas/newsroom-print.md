# Newsroom Print — pierwsza strona dziennika: fakt dnia zamiast obietnicy

## 1. Product DNA profil
- **Utility ↔ Ritual:** utility — produkt robi robotę, a sprzedaje go zweryfikowany fakt
- **Precision ↔ Expression:** precision — liczba z przypisem, nie nastrój
- **Evidence ↔ Feeling:** evidence — klient kupuje dowód („312 mg CaCO₃/l"), nie emocję
- **Solo ↔ Community:** dual — problem domowy, ale komunikowany jak news publiczny
- **Quiet ↔ Loud:** loud — masthead krzyczy nagłówkiem na 120px
- **Tradition ↔ Future:** present — dzisiejszy fakt, dzisiejsza cena, dzisiejsze wydanie
- **Intimate ↔ Public:** public — fakt dnia to manifest, nie sekret łazienki

### DNA Anchors (3 produkty które ten styl obsłużyłby)
1. **Filtr prysznicowy typu Jolie** — raport jakości wody jako hero („Twoja woda ma 312 mg kamienia") = evidence + loud, fakt publiczny
2. **Oczyszczacz powietrza (Smart Air / antysmogowy)** — dane PM2.5 z dzisiejszego dnia to dosłownie news; liczba sprzedaje, nie lifestyle
3. **Suplement typu AG1** — badania + składy komunikowane głośno, manifest „fakty zamiast marketingu"

## 2. Kategorie produktów
- Filtracja wody i powietrza (produkt = odpowiedź na mierzalny, newsowy problem)
- Suplementy / żywność funkcjonalna z badaniami (evidence claims komunikowane głośno)
- AGD z jednym brutalnym wynikiem (kamień, roztocza, kWh — liczba jako tytuł)
- Produkty anty-problemowe z hookiem z wiadomości (smog, twarda woda, drożyzna energii)
- Challenger FMCG z manifestem popartym liczbą (anty-kategoria, „sprawdziliśmy za was")

## 3. Real-world refs
- **The Economist** — czerwień + czarny grotesk + biały papier; nagłówek jako cały komunikat
- **The New York Times (front page)** — hierarchia rules: gruba belka 4px + cienka 1px, łamane kolumny z column-rule
- **Bloomberg Businessweek** — loud editorial: brutalne liczby jako tytuły, dane traktowane plakatowo
- **Morning Brew / The Hustle** — masthead + datownik + „dzisiejsze wydanie" jako rama produktu newsletterowego
- **Feature stories Guardiana** — fact-box w ramce z czarną belką nagłówkową, przypisy źródłowe

## 4. Font stack

> ⚠️ PL safety: sprawdź renderowanie Ł/Ś/Ć/Ź/Ż/Ń/Ó w UPPERCASE na frazie `ZAMÓW ŁÓŻKO ŻYCIE`.

- **Display:** `Oswald` 500/600/700 (latin-ext ✓) — wysoki, zbity grotesk nagłówkowy; masthead i tytuły jak z pierwszej strony dziennika
- **Body:** `PT Serif` 400/700 + italic 400 (latin-ext ✓) — serif projektowany do druku prasowego, deck i body 17-18px
- **Mono / Accent:** `Courier Prime` 400/700 (latin-ext ✓) — maszynopis depeszy: datownik, podpisy zdjęć, przypisy, ceny

```html
<link href="https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Oswald:wght@500;600;700&family=PT+Serif:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
```

## 5. Paleta (60/30/10)

| Rola | Nazwa | Hex | Gdzie |
|------|-------|-----|-------|
| Dominant 60% | Newsprint | `#FAF8F4` | tło strony (gazetowy złamany biały) |
| Secondary 30% | Press Ink | `#181614` | tytuły, body, rule lines |
| Accent 10% | Press Red | `#C42B1C` | belka FAKT DNIA, CTA, podkreślenia w tytule |
| Support 1 | Halftone Gray | `#6F6A61` | datownik, podpisy, przypisy |
| Support 2 | Raster Tint | `#F1ECE3` | tła naprzemiennych sekcji, fact-box fill |

**Filozofia koloru:** duotone czerń-na-papierze + jedna redakcyjna czerwień; zero gradientów — wszystko wygląda jak wydrukowane farbą, czerwień to jedyny „dodruk".

## 6. Layout DNA

**Editorial column (broadsheet)** — centralna kolumna max 1140px, wewnątrz gazetowe łamy: `column-count: 2` z `column-rule: 1px solid` na tekstach, hierarchia rules (4px belka + 1px linia) zamiast cieni i kart. ZERO bento 2×2, ZERO glassmorphism.

## 7. Signature primitives

### Primitive 1: News masthead (nagłówek-belka z rule) — dominanta strony
Belka tytułowa sekcji jak masthead dziennika: gruba rule 4px nad, cienka 1px pod, Oswald uppercase + datownik w mono po prawej.

```html
<div class="news-masthead">
  <span class="masthead-kicker">WYDANIE 06/2026</span>
  <h2 class="masthead-title">FAKT DNIA: TWARDA WODA</h2>
  <span class="masthead-date">WROCŁAW · WTOREK</span>
</div>
```
```css
.news-masthead { display: flex; align-items: baseline; justify-content: space-between; gap: 24px; padding: 14px 0 10px; border-top: 4px solid var(--ink); border-bottom: 1px solid var(--ink); }
.masthead-title { font-family: var(--display); font-weight: 700; font-size: clamp(22px, 3vw, 34px); letter-spacing: 0.02em; text-transform: uppercase; }
.masthead-kicker, .masthead-date { font-family: var(--mono); font-size: 12px; letter-spacing: 0.08em; color: var(--gray); white-space: nowrap; }
```

### Primitive 2: Dateline strip (ZAMIAST trust-bar)
Pasek wydania między rules: numer wydania, nakład, cena — meta produktu w konwencji stopki redakcyjnej.

```html
<div class="news-dateline">
  <span>WYDANIE 06/2026</span><span>NAKŁAD: 10 000 SZT.</span><span>GWARANCJA: 30 DNI</span><span>CENA: 149 ZŁ</span>
</div>
```
```css
.news-dateline { display: flex; justify-content: space-between; gap: 16px; padding: 12px 0; border-top: 1px solid var(--ink); border-bottom: 1px solid var(--ink); font-family: var(--mono); font-size: 12px; letter-spacing: 0.06em; }
```

### Primitive 3: Fact box („FAKT DNIA")
Ramka 2px z czarną (lub czerwoną) belką nagłówkową i brutalną liczbą + źródło z przypisem. Kotwica evidence+loud.

```html
<aside class="news-factbox">
  <div class="factbox-bar">FAKT DNIA</div>
  <div class="factbox-num js-counter" data-target="312">312</div>
  <p class="factbox-src">mg CaCO₃/l — średnia twardość wody we Wrocławiu [1]</p>
</aside>
```
```css
.news-factbox { border: 2px solid var(--ink); background: var(--tint); }
.factbox-bar { background: var(--accent); color: var(--paper); font-family: var(--display); font-size: 14px; letter-spacing: 0.14em; text-transform: uppercase; padding: 8px 16px; }
.factbox-num { font-family: var(--display); font-weight: 700; font-size: clamp(72px, 10vw, 140px); line-height: 0.9; padding: 24px 24px 0; }
.factbox-src { font-family: var(--mono); font-size: 13px; color: var(--gray); padding: 8px 24px 24px; }
```

### Primitive 4: Headline + deck (tytuł i podtytuł gazetowy)
H1 w Oswald uppercase, pod nim deck w PT Serif italic — para tytuł/lead jak w dzienniku. Czerwień tylko na 1-2 słowach tytułu.

```css
.news-headline { font-family: var(--display); font-weight: 700; font-size: clamp(48px, 8vw, 110px); line-height: 0.95; letter-spacing: -0.01em; text-transform: uppercase; }
.news-headline em { font-style: normal; color: var(--accent); }
.news-deck { font-family: var(--body); font-style: italic; font-size: clamp(18px, 2.2vw, 24px); line-height: 1.45; max-width: 60ch; }
```

### Primitive 5: Łamane kolumny z column-rule
Tekst sekcji (problem, opinie) łamany w 2 kolumny z cienką linią między łamami — natychmiastowy „druk".

```css
.news-columns { column-count: 2; column-gap: 48px; column-rule: 1px solid var(--ink); }
@media (max-width: 720px) { .news-columns { column-count: 1; } }
```

---

## 8. Section Architecture

**Minimum sekcji:** 11 (z 14 available)

```yaml
required:
  - Header                    # .header — masthead pełny: logo Oswald + gruba rule 4px
  - Mobile Menu               # .mobile-menu
  - Hero                      # .hero z news-headline + news-factbox (primitive 1+3+4)
  - Dateline Strip            # .news-dateline (ZAMIAST trust-bar)
  - Problem                   # .problem — P1 stat-led, fakt dnia w fact-boxie
  - Features as News Briefs   # .news-briefs — depesze w łamanych kolumnach (NIE bento)
  - How It Works              # .how-it-works (W3 numerowany spec-strip)
  - Comparison                # .comparison — C1 tabela ✓/✗ jak tabela danych w dzienniku
  - Testimonials              # .testimonials — „listy do redakcji" (T5/T2)
  - FAQ                       # .faq (5-7 pytań)
  - Offer                     # .offer — O1 z datownikiem ceny
  - Footer                    # <footer> — stopka jak impressum redakcji

optional:
  - Final CTA Banner          # belka „Z OSTATNIEJ CHWILI" przed offer
  - Gallery                   # kolumna foto z podpisami w Courier Prime (caption-first)
  - Sticky CTA                # .sticky-cta

forbidden:
  - Trust Bar dark            # ciemny z ikonami w kółkach — Newsroom używa news-dateline
  - Social Proof Marquee      # jarmarczny scroll nie pasuje do statycznego druku
  - KPI Dashboard             # to Clinical Kitchen; tu liczby żyją w fact-boxach z przypisem
```

## 9. Allowed Variants

> Z [`../reference/section-variants.md`](../reference/section-variants.md). Wybór Claude'a LIMITED do listy niżej.

```yaml
hero_allowed: [H5, H1, H8]
hero_forbidden: [H2, H3, H4, H6, H7, H9, H10]
# H5 Oversized typography — naturalny: tytuł dziennika wypełnia pierwszą stronę
# H1 Split klasyczny — packshot jako „zdjęcie dnia" z podpisem w Courier Prime
# H8 Split z ceną — „CENA WYDANIA: 149 ZŁ" w datowniku, czysty DR
# H2 lifestyle = magazyn nie dziennik; H4 numerał italic = Editorial Print; H9 video = druk jest statyczny

features_allowed: [F3, F2]
features_forbidden: [F1, F4, F5, F6]
# F3 Linear stack — kolumna depesz, każda z masthead-belką
# F2 Bento asymetryczny — mozaika pierwszej strony (hierarchia newsów, różne rozmiary)
# F1 bento 2×2 = konwergencja zakaz; F4 mockupy = SaaS; F5 carousel — druk się nie przewija

testimonials_allowed: [T5, T2]
testimonials_forbidden: [T1, T3, T4, T6]
# T5 Single hero — „cytat numeru" na pełną szerokość między rules
# T2 Before/After stats — evidence, liczby czytelnika przed/po
# T1 avatary-grid generic; T4 UGC wall = social nie print; T6 dubluje fact-box

problem_allowed: [P1, P3]
problem_forbidden: [P2, P4]
# P1 Stat-led — to dosłownie FAKT DNIA w fact-boxie
# P3 Koszt bezczynności — rachunek za status quo jako gazetowa tabela
# P2 mini-narracja sceny = feeling, łamie evidence; P4 foto-led = type-led styl

how_allowed: [W3, W1]
how_forbidden: [W2]
# W3 Numerowany spec-strip — techniczny, evidence, między rules
# W1 3 kroki poziome — klasyk, numery w Oswald zamiast ikon
# W2 pionowy timeline z foto = magazynowy lifestyle

comparison_allowed: [C1]
comparison_forbidden: [C2, C3]
# C1 Tabela ✓/✗ — tabela danych jak w dzienniku, rules zamiast kart
# C2 karty emocjonalne = feeling; C3 jednowierszowy spec-bar = za cichy dla loud

offer_allowed: [O1, O2]
offer_forbidden: [O3]
# O1 Single offer box — kanon, w ramce 2px z belką i datownikiem ceny
# O2 Multipack — framing „wydanie pojedyncze / prenumerata" (1/2/3 szt.)
# O3 guarantee-led — gwarancja jako nagłówek osłabia fakt; gwarancja = wiersz w datowniku
```

## 10. Motion Budget

**Level:** subtle

```yaml
js_effects_required:
  - .fade-in               # zawsze wymagany
  - .js-counter            # min 1 — liczba FAKTU DNIA nabija się przy scrollu

js_effects_forbidden:
  - .js-split              # char-by-char psuje iluzję wydrukowanej strony
  - .js-parallax           # papier nie ma warstw
  - .magnetic              # za DTC/playful dla powagi dziennika
  - .js-tilt               # 3D łamie metaforę druku

js_effects_count:
  counter_min: 1
  counter_max: 3
  magnetic_min: 0          # zakaz
  tilt_min: 0              # zakaz
  parallax_min: 0          # zakaz
```

## 11. Copy Voice

> Lekcja dark-academia v5.0: charakter stylu żyje WYŁĄCZNIE w warstwie dekoracyjnej (masthead, datownik, rubryki, podpisy). Body copy = czysty polski direct response.

- **Register:** depesza + DR — krótkie zdania faktograficzne, każda liczba z odniesieniem; gazetowy sznyt („WYDANIE", „FAKT DNIA", „Z OSTATNIEJ CHWILI") TYLKO w eyebrows/belkach/meta, NIGDY w body
- **Sentence length:** short (8-14 słów); deck pod tytułem może mieć 16-22
- **Person:** 2-osoba (Ty/Twój) w body i CTA; rubryki bezosobowo
- **Allowed power words:** „sprawdzone", „zmierzone", „potwierdzone [źródło]", „dane z [rok]" — wyłącznie z przypisem lub źródłem
- **Forbidden power words:** „SZOK", „NIE UWIERZYSZ" (tabloid), „premium", „luxury", „rewolucyjne", personifikacja produktu, purple prose

## 12. Example Snippet

```html
<!-- Hero -->
<section class="hero">
  <div class="news-masthead">
    <span class="masthead-kicker">WYDANIE 06/2026</span>
    <h2 class="masthead-title">FAKT DNIA: TWARDA WODA</h2>
    <span class="masthead-date">WROCŁAW · WTOREK</span>
  </div>
  <div class="container hero-grid">
    <div>
      <h1 class="news-headline">Kamień znika w <em>15 minut</em>. Bez szorowania.</h1>
      <p class="news-deck">Jeden zabieg parą 105&nbsp;°C usuwa osad, który zwykły płyn zostawia po trzech myciach. Sprawdziliśmy na wodzie 312&nbsp;mg CaCO₃/l.</p>
      <a href="#offer" class="btn-primary">Zamów — 149 zł</a>
    </div>
    <aside class="news-factbox fade-in">
      <div class="factbox-bar">FAKT DNIA</div>
      <div class="factbox-num js-counter" data-target="312">312</div>
      <p class="factbox-src">mg CaCO₃/l — średnia twardość wody we Wrocławiu [1]</p>
    </aside>
  </div>
  <div class="news-dateline">
    <span>WYDANIE 06/2026</span><span>NAKŁAD: 10 000 SZT.</span><span>GWARANCJA: 30 DNI</span><span>CENA: 149 ZŁ</span>
  </div>
</section>

<!-- Feature (news briefs) -->
<section class="news-briefs">
  <div class="container">
    <div class="news-masthead">
      <span class="masthead-kicker">SKRÓT DEPESZ</span>
      <h2 class="masthead-title">Co potwierdziły testy</h2>
      <span class="masthead-date">STRONA 2</span>
    </div>
    <div class="news-columns">
      <article class="brief">
        <h3>105 °C w 15 sekund</h3>
        <p>Para gotowa zanim napełnisz wiadro. Zmierzone od wciśnięcia przycisku do pierwszego wyrzutu pary.</p>
      </article>
      <article class="brief">
        <h3>0 zł na chemię miesięcznie</h3>
        <p>Zbiornik na zwykłą wodę z kranu. Rachunek za płyny i odkamieniacze spada do zera od pierwszego dnia.</p>
      </article>
    </div>
  </div>
</section>
```

```css
:root {
  --display: 'Oswald', system-ui, sans-serif;
  --body: 'PT Serif', Georgia, serif;
  --mono: 'Courier Prime', 'Courier New', monospace;
  --paper: #FAF8F4;
  --ink: #181614;
  --accent: #C42B1C;
  --gray: #6F6A61;
  --tint: #F1ECE3;
}
body { font-family: var(--body); background: var(--paper); color: var(--ink); font-size: 17px; line-height: 1.6; }
.container { max-width: 1140px; margin: 0 auto; padding: 0 32px; }
.hero-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 56px; align-items: start; padding-top: 56px; padding-bottom: 56px; }
.btn-primary { display: inline-block; margin-top: 32px; padding: 18px 36px; background: var(--accent); color: var(--paper); font-family: var(--display); font-size: 15px; letter-spacing: 0.12em; text-transform: uppercase; border-radius: 0; }
.brief h3 { font-family: var(--display); font-size: 24px; text-transform: uppercase; margin-bottom: 8px; }
.brief { break-inside: avoid; padding-bottom: 28px; }
@media (max-width: 720px) { .hero-grid { grid-template-columns: 1fr; } }
```

---

## MUSZĄ / NIE WOLNO — Style Lock (grep-sprawdzalne)

### MUSZĄ być użyte
- Display font: `Oswald` w `font-family`
- Body font: `PT Serif`
- Mono font: `Courier Prime` — datownik, podpisy, przypisy
- Tło: `#FAF8F4` (newsprint) + min 3 z 5 hex-ów z sekcji 5
- Primitive 1 (`.news-masthead`) obecny — min 2 wystąpienia (hero + 1 sekcja)
- Min 1 `.news-factbox` LUB `.news-columns` (column-rule)
- Rule lines: min 1 `border-top: 4px solid` (gruba belka masthead)

### NIE WOLNO użyć
- **Fonty:** NIE `IBM Plex Sans`, `IBM Plex Mono` (clinical/apothecary), NIE `Fraunces`, `Cormorant`, `Playfair`, `Italiana` (editorial/warmth), NIE `Archivo Black` (poster), NIE `Caveat`, `Fredoka` (playful)
- **Layout:** NIE bento 2×2 (`F1`), NIE 12-col Swiss modular grid, NIE card-grid z `box-shadow` (druk nie ma cieni — tylko rules)
- **Kolory:** NIE `#F6F3ED` (linen cream), NIE `#C9A961` `#E09A3C` (gold/amber), NIE `#FAFAF7` (paper white apothecary — używaj `#FAF8F4`), NIE `linear-gradient` w tłach
- **Elementy:** NIE `Nº` w eyebrow (Editorial), NIE `.hero-numeral` (oversized italic), NIE `backdrop-filter`/glassmorphism, NIE trust bar z icon circles
- **Motion:** NIE `.js-split`, NIE `.js-parallax`, NIE `.magnetic`, NIE `.js-tilt`

---

## Podobne style (ale RÓŻNE)

- [`poster-utility.md`](./poster-utility.md) — też loud, ale feeling/expression: Archivo Black i plakat bez przypisów. Newsroom = evidence: każda liczba ma źródło, serif body, rules zamiast posterów.
- [`apothecary-label.md`](./apothecary-label.md) — też evidence, ale quiet/intimate sterylna etykieta IBM Plex. Newsroom krzyczy 110px nagłówkiem i czerwoną belką.
- [`swiss-grid.md`](./swiss-grid.md) — też rules i siatka, ale pure white + Helvetica + quiet neutralność. Newsroom ma złamany papier, redakcyjną czerwień i hierarchię pierwszej strony.
- [`editorial-print.md`](./editorial-print.md) — też print, ale magazynowy ritual/feeling (Fraunces, Nº, oddech). Newsroom to dziennik faktów: gęsty, datowany, z przypisami.

## Changelog
- 2026-06-10 utworzony, v5.0
