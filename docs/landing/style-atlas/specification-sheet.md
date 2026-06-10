# Specification Sheet — karta katalogowa produktu przemysłowego zamiast strony sprzedażowej

## 1. Product DNA profil
- **Utility ↔ Ritual:** utility
- **Precision ↔ Expression:** precision
- **Evidence ↔ Feeling:** evidence
- **Solo ↔ Community:** solo
- **Quiet ↔ Loud:** quiet
- **Tradition ↔ Future:** future
- **Intimate ↔ Public:** intimate

### DNA Anchors (3 produkty które ten styl obsłużyłby)
1. **Ładowarka GaN 140 W (typ Anker/Ugreen)** — utility (ładuje), precision (W/V/A per port), evidence (klient porównuje tabelę parametrów), future (GaN). Kupowana po spec sheet, nie po zdjęciu lifestyle.
2. **Oczyszczacz powietrza (typ Philips/Xiaomi)** — utility, precision (CADR m³/h, dB, µg/m³), evidence (certyfikaty HEPA), intimate (stoi w sypialni). Cała decyzja = porównanie 6 liczb.
3. **Odkurzacz bezprzewodowy z głęboką specyfikacją** — utility, precision (Pa, AW, mAh, min pracy), evidence. Klient product-aware otwiera kartę katalogową i liczy.

## 2. Kategorie produktów
- Elektronika użytkowa z gęstą specyfikacją (ładowarki GaN, powerbanki, huby USB-C, stacje dokujące)
- AGD mierzalne parametrami (oczyszczacze, nawilżacze, odkurzacze, ekspresy ciśnieniowe)
- Audio z parametrami driverów (słuchawki, DAC-i, mikrofony)
- Elektronarzędzia i sprzęt warsztatowy (Nm, obr/min, mm uchwytu)
- Smart home sensory i mierniki (czujniki PM2.5, stacje pogodowe, mierniki energii)

## 3. Real-world refs
- **Teenage Engineering** — strony produktowe spec-first: mono font do wartości, hairline listy parametrów, numeracja dokumentowa
- **Bosch Professional** — techniczny błękit jako jedyny kolor na zimnej szarości; tabela parametrów jako główny moduł karty produktu
- **Hilti** — karta katalogowa B2B: numer dokumentu, rewizja, dane techniczne nad opisem marketingowym
- **Keychron** — spec table jako sekcja sprzedażowa (klient porównuje layouty/switche w tabeli, nie w bento)
- **DJI (zakładka Specs)** — głęboka specyfikacja jako osobny, pełnoprawny poziom strony — dowód że spec sprzedaje

## 4. Font stack

> ⚠️ PL safety: sprawdź renderowanie Ł/Ś/Ć/Ź/Ż/Ń/Ó w UPPERCASE na frazie `ZAMÓW ŁÓŻKO ŻYCIE`. Wszystkie 3 fonty mają pełny latin-ext.

- **Display:** `Space Grotesk` 500/700 — techniczny grotesk o rysunku z siatki konstrukcyjnej; nagłówki sekcji i hero
- **Body:** `Barlow` 400/500/600 — sans rodem z oznakowania przemysłowego; body 15-17px, klucze parametrów
- **Mono:** `JetBrains Mono` 400/600 — WSZYSTKIE wartości liczbowe, jednostki, numery dokumentów, podpisy rysunków (tabular figures)

Link Google Fonts (BEZ `&subset=latin-ext`):
```html
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
```

## 5. Paleta (60/30/10)

| Rola | Nazwa | Hex | Gdzie |
|------|-------|-----|-------|
| Dominant 60% | Steel Paper | `#F2F4F6` | tło strony (zimna szarość, NIE paper white) |
| Secondary 30% | Graphite Ink | `#1A1D21` | nagłówki, body text |
| Accent 10% | Technical Blue | `#0A5BC4` | wartości kluczowe, dim-lines, numery sekcji, CTA |
| Support 1 | Hairline Gray | `#C9CED4` | hairlines 1px, ramki figur, leadery kropkowane |
| Support 2 | Slate Meta | `#5C656F` | jednostki, meta, podpisy RYS. |

**Filozofia koloru:** zimny monochrome szarości + dokładnie jeden techniczny błękit — kolor pojawia się wyłącznie tam, gdzie wskazuje wartość lub wymiar (jak marker na rysunku technicznym). Zero ciepła, zero gradientów.

## 6. Layout DNA

**Stack dense** — w wariancie dokumentowym: strona czyta się jak karta katalogowa PDF. Numerowane sekcje (`1.0`, `2.0`…), pełnoszerokie hairline rules 1px, kolumna treści max 1080px (szersza niż editorial — tabele potrzebują miejsca). ZERO bento, ZERO ramek 2px solid ink (to Apothecary), ZERO 12-col showcase (to Swiss).

## 7. Signature primitives

### Primitive 1: Sheet-row — wiersz specyfikacji z jednostką (dominanta strony)
Parametr + kropkowany leader + wartość mono z jednostką w osobnym spanie. Min 8 wierszy na landing.

```html
<ul class="sheet-spec">
  <li class="sheet-row">
    <span class="sheet-key">Moc znamionowa</span>
    <span class="sheet-leader" aria-hidden="true"></span>
    <span class="sheet-value">140<span class="sheet-unit">W</span></span>
  </li>
  <li class="sheet-row">
    <span class="sheet-key">Poziom hałasu</span>
    <span class="sheet-leader" aria-hidden="true"></span>
    <span class="sheet-value">32<span class="sheet-unit">dB</span></span>
  </li>
</ul>
```
```css
.sheet-spec { list-style: none; padding: 0; margin: 0; max-width: 880px; }
.sheet-row { display: flex; align-items: baseline; gap: 16px; padding: 13px 0; border-bottom: 1px solid var(--hairline); }
.sheet-key { font-family: var(--body); font-size: 15px; font-weight: 500; color: var(--ink); }
.sheet-leader { flex: 1; border-bottom: 1px dotted var(--hairline); transform: translateY(-4px); }
.sheet-value { font-family: var(--mono); font-size: 16px; font-weight: 600; color: var(--ink); font-variant-numeric: tabular-nums; }
.sheet-unit { font-family: var(--mono); font-size: 11px; color: var(--meta); margin-left: 4px; text-transform: uppercase; }
```

### Primitive 2: Dim-line — wymiarowanie CSS jak na rysunku technicznym
Linia wymiarowa ze strzałkami na obu końcach (czyste CSS, pseudo-elementy) + etykieta wymiaru w mono. Pod/obok packshotu produktu.

```html
<div class="dim-line dim-h" style="--dim-w: 78%">
  <span class="dim-label">182 mm</span>
</div>
```
```css
.dim-line { position: relative; height: 1px; background: var(--accent); margin: 18px auto 0; width: var(--dim-w, 60%); }
.dim-line::before, .dim-line::after { content: ''; position: absolute; top: -3.5px; border-top: 4px solid transparent; border-bottom: 4px solid transparent; }
.dim-line::before { left: 0; border-right: 7px solid var(--accent); }
.dim-line::after { right: 0; border-left: 7px solid var(--accent); }
.dim-label { position: absolute; top: 6px; left: 50%; transform: translateX(-50%); font-family: var(--mono); font-size: 11px; color: var(--accent); background: var(--paper); padding: 0 8px; white-space: nowrap; }
```

### Primitive 3: Doc-head strip — nagłówek karty katalogowej (ZAMIAST trust-bar)
Numer dokumentu, rewizja, data — jak stopka rysunku technicznego.

```html
<div class="sheet-doc-head">
  <span>KARTA KATALOGOWA</span><span>DOK. PV-140-01</span><span>REV 2.1</span><span>2026-06</span>
</div>
```
```css
.sheet-doc-head { display: flex; justify-content: space-between; padding: 12px 0; border-top: 1px solid var(--hairline); border-bottom: 1px solid var(--hairline); font-family: var(--mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--meta); }
.sheet-doc-head span:nth-child(2) { color: var(--accent); }
```

### Primitive 4: Numerowane nagłówki sekcji (`2.0 SPECYFIKACJA`)
Numer w mono + Technical Blue, nagłówek w display; hairline pod spodem.

```html
<h2 class="sheet-sec-head"><span class="sheet-sec-num">2.0</span> Specyfikacja techniczna</h2>
```
```css
.sheet-sec-head { font-family: var(--display); font-size: clamp(28px, 4vw, 44px); font-weight: 700; letter-spacing: -0.02em; padding-bottom: 20px; border-bottom: 1px solid var(--hairline); }
.sheet-sec-num { font-family: var(--mono); font-size: 0.5em; font-weight: 600; color: var(--accent); vertical-align: super; margin-right: 12px; }
```

### Primitive 5: Sheet-figure — figura z podpisem RYS.
Placeholder/packshot w hairline ramce 1px + podpis `RYS. 1 — WIDOK OGÓLNY` w mono. Często łączony z dim-line.

```html
<figure class="sheet-figure">
  <div class="figure-frame"><!-- placeholder / packshot --></div>
  <figcaption class="figure-cap">RYS. 1 — WIDOK OGÓLNY</figcaption>
</figure>
```
```css
.figure-frame { border: 1px solid var(--hairline); background: #FFFFFF; padding: 32px; }
.figure-cap { font-family: var(--mono); font-size: 11px; letter-spacing: 0.1em; color: var(--meta); margin-top: 10px; text-transform: uppercase; }
```

---

## 8. Section Architecture

**Minimum sekcji:** 10 (z 13 available)

```yaml
required:
  - Header                    # .header
  - Mobile Menu               # .mobile-menu
  - Hero                      # .hero — split: claim + packshot z dim-line
  - Doc Head Strip            # .sheet-doc-head (ZAMIAST trust-bar)
  - Spec Sheet                # .sheet-spec — sygnaturowa, pełna tabela ≥8 .sheet-row
  - Figure z wymiarowaniem    # .sheet-figure + .dim-line (rysunek techniczny)
  - Features                  # numerowane sekcje z .sheet-row (NIE bento)
  - How It Works              # .how-it-works — W3 numerowany spec-strip
  - Comparison                # .comparison — C1 tabela cech
  - FAQ                       # .faq (5-7 pytań)
  - Offer                     # .offer
  - Footer                    # <footer>

optional:
  - Problem                   # P1 stat-led albo P3 koszt bezczynności
  - Testimonials              # T2 before/after stats albo T6 atesty
  - Sticky CTA Mobile         # .sticky-cta

forbidden:
  - Trust Bar dark            # ciemny z ikonami w kółkach — doc-head strip go zastępuje
  - Social Proof Marquee      # nie pasuje do tonu dokumentu technicznego
  - UGC wall                  # lifestyle grid sprzeczny z kartą katalogową
```

## 9. Allowed Variants

> Z [`../reference/section-variants.md`](../reference/section-variants.md).

```yaml
hero_allowed: [H1, H7, H8]
hero_forbidden: [H2, H3, H4, H5, H6, H9, H10]
# H1 Split klasyczny — OK: claim + packshot z dim-line pod spodem
# H7 Product macro — OK: zoom na detal techniczny (port, filtr, silnik)
# H8 Split z ceną — OK: elektronika budget, klient porównuje cenę jak parametr
# H2/H6/H9 lifestyle/persona/video = feeling; H4 editorial numerał zakaz;
# H5 oversized typo = terytorium Apothecary/Poster; H10 before/after za emocjonalne

features_allowed: [F3, F6]
features_forbidden: [F1, F2, F4, F5]
# F3 Linear stack — OK: czyta się jak kolejne punkty dokumentu
# F6 Split sticky scrollytelling — OK: deep-dive po parametrach
# F1/F2 bento ZAKAZANE (core forbidden); F4 app-mockupy nie-spec; F5 carousel za DTC

testimonials_allowed: [T2, T6]
testimonials_forbidden: [T1, T3, T4, T5]
# T2 Before/After stats — OK (mierzalna zmiana, evidence)
# T6 Ściana atestów + 1 cytat — OK (certyfikaty CE/RoHS pasują do dokumentu)
# T1 avatary/T3 video/T4 UGC/T5 magazine = za lifestyle dla karty katalogowej

problem_allowed: [P1, P3]
problem_forbidden: [P2, P4]
# P1 Stat-led — OK (jedna brutalna liczba); P3 koszt bezczynności — OK (rachunek = tabela)
# P2 mini-narracja = feeling; P4 wizualny stan-przed = lifestyle

how_allowed: [W3]
how_forbidden: [W1, W2]
# W3 Numerowany spec-strip — jedyny zgodny (evidence/clinical wprost z drzewa)
# W1 okrągłe ikony wyglądają obco w stylach evidence; W2 foto-timeline za lifestyle

comparison_allowed: [C1, C3]
comparison_forbidden: [C2]
# C1 Tabela ✓/✗ — default (klient product-aware porównuje parametry)
# C3 Jednowierszowy spec-bar — OK gdy jedna metryka "więcej = lepiej"
# C2 karty emocjonalne "z/bez" sprzeczne z precision

offer_allowed: [O1, O3]
offer_forbidden: [O2]
# O1 Single offer box — default; O3 guarantee-led — OK dla quiet/evidence
# O2 multipack — elektronikę/AGD kupuje się 1 szt., dźwignia AOV nie działa
```

Default (jeśli pierwsza reguła z drzewa decyzyjnego w section-variants.md trafia w forbidden) → weź **pierwszy z allowed** w kolejności z listy.

## 10. Motion Budget

**Level:** subtle

```yaml
js_effects_required:
  - .fade-in               # zawsze
  - .js-counter            # min 1 — animacja kluczowej wartości spec (np. 140 W, 32 dB)

js_effects_forbidden:
  - .js-split              # char/word split = editorial theatrics, psuje dokument
  - .js-parallax           # karta katalogowa nie pływa
  - .magnetic              # za DTC/playful
  - .js-tilt               # 3D tilt psuje precyzję rysunku technicznego

js_effects_count:
  counter_min: 1
  counter_max: 4
  magnetic_min: 0          # zakaz
  tilt_min: 0              # zakaz
  parallax_min: 0          # zakaz
```

## 11. Copy Voice

> Body copy ZAWSZE polski DR (lekcja dark-academia v5.0) — charakter stylu żyje wyłącznie w warstwie dekoracyjnej: numery dokumentów (`DOK./REV`), podpisy `RYS.`, jednostki mono, numeracja sekcji. Nagłówki mówią co produkt ROBI (akcja + liczba), nie jak brzmi inżynierski żargon.

- **Register:** techniczno-rzeczowy direct response (karta katalogowa pisana dla kupującego, nie dla działu konstrukcyjnego)
- **Sentence length:** short (8-16 słów); wartości zawsze z jednostką
- **Person:** 2-osoba (Ty/Twój), bez „my/nasz"
- **Allowed power words:** „zmierzone", „w teście", „deklarowane vs zmierzone", „certyfikat CE/RoHS" (ze źródłem), konkretne liczby z jednostkami (W, dB, Pa, mAh, m³/h)
- **Forbidden power words:** „premium", „luxury", „innowacyjny", „rewolucyjny", „najwyższa jakość", „zaawansowana technologia" (bez liczby obok)

## 12. Example Snippet

```html
<!-- Hero -->
<section class="hero">
  <div class="sheet-doc-head">
    <span>KARTA KATALOGOWA</span><span>DOK. PV-140-01</span><span>REV 2.1</span><span>2026-06</span>
  </div>
  <div class="container hero-grid">
    <div>
      <h1>140 W z jednego portu. <em>Zmierzone</em>, nie deklarowane.</h1>
      <p class="hero-sub">Ładowarka GaN: laptop, telefon i słuchawki jednocześnie — bez throttlingu.</p>
      <a href="#offer" class="btn-primary">Zamów — 249 zł</a>
    </div>
    <figure class="sheet-figure">
      <div class="figure-frame"><!-- packshot placeholder --></div>
      <div class="dim-line dim-h" style="--dim-w: 78%"><span class="dim-label">66 mm</span></div>
      <figcaption class="figure-cap">RYS. 1 — WIDOK OGÓLNY</figcaption>
    </figure>
  </div>
</section>

<!-- Feature: spec sheet -->
<section class="features">
  <div class="container">
    <h2 class="sheet-sec-head"><span class="sheet-sec-num">2.0</span> Specyfikacja techniczna</h2>
    <ul class="sheet-spec">
      <li class="sheet-row"><span class="sheet-key">Moc znamionowa</span><span class="sheet-leader" aria-hidden="true"></span><span class="sheet-value js-counter" data-target="140">140<span class="sheet-unit">W</span></span></li>
      <li class="sheet-row"><span class="sheet-key">Porty USB-C</span><span class="sheet-leader" aria-hidden="true"></span><span class="sheet-value">3<span class="sheet-unit">szt</span></span></li>
      <li class="sheet-row"><span class="sheet-key">Sprawność</span><span class="sheet-leader" aria-hidden="true"></span><span class="sheet-value">94<span class="sheet-unit">%</span></span></li>
      <li class="sheet-row"><span class="sheet-key">Masa</span><span class="sheet-leader" aria-hidden="true"></span><span class="sheet-value">232<span class="sheet-unit">g</span></span></li>
    </ul>
  </div>
</section>
```

```css
:root {
  --display: 'Space Grotesk', system-ui, sans-serif;
  --body: 'Barlow', -apple-system, sans-serif;
  --mono: 'JetBrains Mono', 'Courier New', monospace;
  --paper: #F2F4F6;
  --ink: #1A1D21;
  --accent: #0A5BC4;
  --hairline: #C9CED4;
  --meta: #5C656F;
}
body { font-family: var(--body); background: var(--paper); color: var(--ink); }
h1 { font-family: var(--display); font-size: clamp(40px, 5.5vw, 72px); font-weight: 700; letter-spacing: -0.03em; line-height: 1.0; }
h1 em { font-style: normal; color: var(--accent); }
.btn-primary { display: inline-block; padding: 16px 32px; background: var(--accent); color: #FFFFFF; font-family: var(--mono); font-size: 13px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; border-radius: 0; }
.hero { padding: 120px 0 100px; }
.hero-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 64px; align-items: center; }
.container { max-width: 1080px; margin: 0 auto; padding: 0 32px; }
@media (max-width: 720px) { .hero-grid { grid-template-columns: 1fr; } }
```

---

## MUSZĄ / NIE WOLNO — Style Lock (grep-sprawdzalne)

### MUSZĄ być użyte
- Display font: `Space Grotesk` w `font-family`
- Mono font: `JetBrains Mono` — wszystkie wartości liczbowe specyfikacji
- Min 8 × `.sheet-row` w landingu (primitive #1)
- Min 1 × `.dim-line` (wymiarowanie CSS — primitive #2)
- Steel Paper `#F2F4F6` jako tło strony
- Hairlines `1px solid` (NIE ramki 2px)

### NIE WOLNO użyć
- **Fonty:** NIE `IBM Plex Sans`, `IBM Plex Mono` (Apothecary/Clinical Kitchen), NIE `Fraunces`, `Cormorant`, `Playfair`, `Archivo Black`, `Caveat`, `Fredoka`, NIE `Helvetica` jako display (Swiss Grid)
- **Layout:** NIE bento 2×2 (`grid-template-columns: 1fr 1fr` dla features), NIE `repeat(12` grid showcase (Swiss)
- **Kolory:** NIE `#F6F3ED` / `#F7F4ED` (warm cream/papier), NIE `#FAFAF7` (paper white Apothecary), NIE `#C9A961` / `#E09A3C` (gold/amber), NIE `linear-gradient` w tłach sekcji
- **Elementy:** NIE `Nº` w eyebrow, NIE `.hero-numeral`, NIE `border: 2px solid` ramki bloków (Apothecary spec-label), NIE KPI cards / charts (Clinical Kitchen)
- **Motion:** NIE `.js-split`, NIE `.js-parallax`, NIE `.magnetic`, NIE `.js-tilt`

---

## Podobne style (ale RÓŻNE)

- [`apothecary-label.md`](./apothecary-label.md) — Apothecary = etykieta leku: IBM Plex, ramki 2px solid ink, paper white, metafora LOT/BATCH/SKŁADNIK. Specification Sheet = rysunek techniczny: hairlines 1px, zimna szarość + Technical Blue, wymiarowanie strzałkami, metafora DOK./REV/RYS.
- [`clinical-kitchen.md`](./clinical-kitchen.md) — Clinical Kitchen ma data viz (KPI cards, charts, dashboard). Specification Sheet ma ZERO kart i wykresów — tylko wiersze tabeli, leadery i wymiary.
- [`swiss-grid.md`](./swiss-grid.md) — Swiss = Helvetica + strict 12-col + pure white, typografia jako system. Specification Sheet = dokument stack dense z numeracją sekcji, mono wartościami i dimension lines; szare tło, nie białe.

## Changelog
- 2026-06-10 utworzony, v5.0
