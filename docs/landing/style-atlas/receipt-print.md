# Receipt Print — paragon z drukarki termicznej zamiast strony www

> Cały landing to jedna wąska taśma paragonu (~420px) wydrukowana na termicznym kremie: 100% mono, kropkowane linie z ceną do prawej, gwiazdkowe separatory `* * * *`, a oferta to „SUMA" z rabatem i podwójną linią. Cena gra główną rolę — styl mówi „policzmy to razem" zamiast „poczuj atmosferę". Dla niskiego/średniego ticketu, value + playful-lite, klient product-aware.

## 1. Product DNA profil
- **Utility ↔ Ritual:** utility
- **Precision ↔ Expression:** precision
- **Evidence ↔ Feeling:** evidence
- **Solo ↔ Community:** solo
- **Quiet ↔ Loud:** moderate
- **Tradition ↔ Future:** present
- **Intimate ↔ Public:** intimate

### DNA Anchors (3 produkty które ten styl obsłużyłby)
1. **Młynek żarnowy do kawy ~199 zł** — utility (mieli), precision (cena co do grosza, parametry żaren), evidence (rachunek „kawiarnia 18 zł × 20 dni vs młynek raz"), product-aware klient porównuje ceny.
2. **Multipack codzienny (ściereczki z mikrofibry / gąbki, 6-pak ~89 zł)** — value, cena za sztukę na linii paragonu, O2 multipack jako naturalna SUMA.
3. **Gadżet kuchenny low-ticket (elektryczny spieniacz ~129 zł)** — impulse + kalkulacja, intimate (do domu), moderate (stempel „RABAT" może być głośny, ale taśma jest cicha).

## 2. Kategorie produktów
- Akcesoria kuchenne i kawowe low/mid ticket (do ~300 zł)
- Multipacki home essentials (ściereczki, organizery, pojemniki)
- Drobna elektronika użytkowa z prostą metryką ceny (spieniacze, wagi, timery)
- Produkty „zamiast subskrypcji/kawiarni" — wszędzie tam gdzie działa rachunek oszczędności
- Papeteria / desk accessories (notesy, organizery biurka)

## 3. Real-world refs
- **Receiptify** — viralowy „paragon ze Spotify": kropkowane linie pozycji, SUMA, barcode — pożyczamy cały layout taśmy i hierarchię pozycja→cena
- **Square / SumUp POS receipts** — współczesny druk termiczny: gwiazdkowe separatory, ceny do prawej, meta-nagłówek sklepu (NR / DATA / KASA)
- **SSENSE** — utilitarna, cennikowa typografia e-commerce (packing slip as design) — pożyczamy chłód i mono-dyscyplinę
- **Muji price tags** — japoński retail mono-minimalizm: cena jako element graficzny, zero ozdobników
- **Plakaty-paragony (independent print, „kitchen receipt posters")** — dowód że estetyka paragonu niesie się jako dekoracja, nie tylko dokument

## 4. Font stack

> ⚠️ PL safety: sprawdź renderowanie Ł/Ś/Ć/Ź/Ż/Ń/Ó w UPPERCASE na frazie `ZAMÓW ŁÓŻKO ŻYCIE`. Space Mono i Courier Prime mają pełny latin-ext.

- **Display:** `Space Mono` 400/700 (+ italic 400) — geometryczny mono z charakterem na headline'y i ceny; uppercase trzyma polskie znaki
- **Body:** `Courier Prime` 400/700 (+ italic) — klasyczna maszyna do pisania, czytelna w 15–16px, „wydrukowany" ton
- **Mono / Accent:** brak trzeciego fontu — CAŁA strona jest mono (to jest sygnatura stylu)

Link Google Fonts (BEZ `&subset=latin-ext`):
```html
<link href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
```

## 5. Paleta (60/30/10)

| Rola | Nazwa | Hex | Gdzie |
|------|-------|-----|-------|
| Dominant 60% | Thermal Cream | `#F5EFE2` | tło taśmy paragonu |
| Secondary 30% | Print Black (ciepła czerń druku) | `#221E1A` | body text, linie, headline |
| Accent 10% | Tusz Granat | `#2B3990` | CTA, ceny-bohaterki, stemple, `em` w h1 (brand primary z workflow_branding TYLKO jeśli ciemny, „tuszowy") |
| Support 1 | Desk (blat pod taśmą) | `#E4DCC9` | tło strony POZA taśmą (desktop) |
| Support 2 | Czerwień Pieczątki | `#B3402F` | rabaty, przekreślenia cen, max 1-2 użycia per sekcja |

**Filozofia koloru:** duotone druku — krem termiczny + ciepła czerń, z granatowym tuszem pieczątki jako jedynym akcentem; czerwień wyłącznie dla rabatu. Zero gradientów, zero czystej bieli — papier termiczny nigdy nie jest biały.

## 6. Layout DNA

**Editorial column (extreme-narrow)** — JEDNA centralna taśma `.rcpt-tape` max-width 420–480px na CAŁĄ treść, od headera po footer. Taśma leży na ciemniejszym „blacie" (`--desk`) z miękkim cieniem. Sekcje oddzielone perforacją `2px dashed`. Mobile ≤480px: taśma na full width. ZERO grid 2+ kolumn dla treści, ZERO full-bleed sekcji treściowych.

## 7. Signature primitives

### Primitive 1: rcpt-line — linia paragonu z ceną do prawej (DOMINANTA, min 5×)
Pozycja paragonu: nazwa + kropkowany leader + cena wyrównana do prawej. Używana w hero, features, problem (koszty status quo) i ofercie.

```html
<div class="rcpt-line">
  <span class="rcpt-name">Młynek żarnowy K-01</span>
  <span class="rcpt-dots"></span>
  <span class="rcpt-price">199,00</span>
</div>
```
```css
.rcpt-line { display: flex; align-items: baseline; gap: 8px; padding: 10px 0; font-size: 15px; }
.rcpt-dots { flex: 1; border-bottom: 2px dotted var(--ink); transform: translateY(-4px); }
.rcpt-price { font-family: var(--display); font-weight: 700; white-space: nowrap; }
```

### Primitive 2: rcpt-tape — taśma z perforacją
Wąska kolumna-paragon z ząbkowaną krawędzią góra/dół (CSS, bez obrazków) i perforacją między sekcjami.

```html
<main class="rcpt-tape"> <!-- cała treść strony --> </main>
```
```css
body { background: var(--desk); }
.rcpt-tape { max-width: 444px; margin: 0 auto; background: var(--paper); padding: 0 24px; box-shadow: 0 16px 48px rgba(34,30,26,.18); }
.rcpt-tape::before, .rcpt-tape::after { content: ""; display: block; height: 14px;
  background: linear-gradient(-45deg, transparent 7px, var(--paper) 0) 0 0 / 14px 100%; }
.rcpt-tape::after { transform: scaleY(-1); }
.rcpt-section { border-top: 2px dashed var(--ink); padding: 64px 0; }
```

### Primitive 3: rcpt-stars — gwiazdkowe separatory
Separator `* * * * * *` jak na wydruku z kasy — między blokami wewnątrz sekcji, min 3 na stronę.

```html
<div class="rcpt-stars" aria-hidden="true">* * * * * * * * * * * *</div>
```
```css
.rcpt-stars { text-align: center; letter-spacing: .35em; color: var(--faded); padding: 18px 0; font-family: var(--display); }
```

### Primitive 4: rcpt-suma — SUMA jako motyw oferty
Offer = podsumowanie paragonu: pozycje `.rcpt-line`, rabat na czerwono, „SUMA" w podwójnej linii z licznikiem `js-counter`.

```html
<div class="rcpt-suma" id="suma">
  <div class="rcpt-line"><span class="rcpt-name">Młynek K-01</span><span class="rcpt-dots"></span><span class="rcpt-price">249,00</span></div>
  <div class="rcpt-line rcpt-rabat"><span class="rcpt-name">RABAT −20%</span><span class="rcpt-dots"></span><span class="rcpt-price">−50,00</span></div>
  <div class="rcpt-total"><span>SUMA</span><span><span class="js-counter" data-target="199">199</span>,00 zł</span></div>
</div>
```
```css
.rcpt-total { display: flex; justify-content: space-between; border-top: 3px double var(--ink); border-bottom: 3px double var(--ink); padding: 14px 0; font-family: var(--display); font-weight: 700; font-size: 24px; text-transform: uppercase; }
.rcpt-rabat .rcpt-name, .rcpt-rabat .rcpt-price { color: var(--stamp); }
```

### Primitive 5: rcpt-stamp + rcpt-barcode — pieczątka i kod kreskowy
Stempel tuszowy (gwarancja/„OPŁACONO") lekko obrócony + barcode CSS w footerze.

```html
<span class="rcpt-stamp">GWARANCJA 30 DNI</span>
<div class="rcpt-barcode" aria-hidden="true"></div>
```
```css
.rcpt-stamp { display: inline-block; border: 3px double var(--primary); color: var(--primary); font-family: var(--display); font-weight: 700; text-transform: uppercase; letter-spacing: .12em; padding: 8px 16px; transform: rotate(-5deg); }
.rcpt-barcode { height: 56px; background: repeating-linear-gradient(90deg, var(--ink) 0 2px, transparent 2px 5px, var(--ink) 5px 8px, transparent 8px 12px); }
```

---

## 8. Section Architecture

**Minimum sekcji:** 12 (z 14 available)

```yaml
required:
  - Header                  # .header — wąski pasek nad taśmą: logo mono + 1 CTA
  - Mobile Menu             # .mobile-menu
  - Rcpt Meta               # .rcpt-meta — nagłówek paragonu: MARKA · NR 0001 · DATA (ZAMIAST trust-bar)
  - Hero                    # .hero — H5 w taśmie + placeholder packshotu full-tape-width + pierwsza .rcpt-line z ceną
  - Problem                 # .problem — P3 „rachunek za status quo" jako mini-paragon kosztów bezczynności
  - Features                # .rcpt-feat-list — każdy benefit jako .rcpt-line + 1-2 zdania opisu (F3 stacked)
  - How It Works            # .how-it-works — W3 numerowany spec-strip 01/02/03 jak pozycje wydruku
  - Comparison              # .comparison — C1 wąska tabela ✓/✗ albo C3 spec-bar
  - Testimonials            # .testimonials — T5/T1, cytaty jako „pozycje specjalne" z .rcpt-stars
  - FAQ                     # .faq — akordeon z dashed borders (5-7 pytań)
  - Offer                   # .offer — .rcpt-suma (sygnaturowa SUMA + rabat + total + .rcpt-stamp gwarancji)
  - Footer                  # <footer> — .rcpt-barcode + „DZIĘKUJEMY ZA ZAKUPY" + footnotes

optional:
  - Sticky CTA Mobile       # .sticky-cta — pasek „SUMA: 199 zł → Zamów"
  - Gallery w taśmie        # zdjęcia/placeholdery produktu full-tape-width, max 3

forbidden:
  - Trust Bar dark          # ciemny z icon-circles — zamiast tego .rcpt-meta
  - Social Proof Marquee    # przewijany pasek rozbija pion taśmy
  - Full-bleed lifestyle    # treść NIGDY nie wychodzi poza taśmę (poza nią tylko tło --desk)
```

## 9. Allowed Variants

> Z [`../reference/section-variants.md`](../reference/section-variants.md).

```yaml
hero_allowed: [H5, H8, H7]
hero_forbidden: [H1, H2, H3, H4, H6, H9, H10]
# H5 Oversized typography — DEFAULT: headline uppercase mono wypełnia taśmę
# H8 Split z ceną — adaptacja: cena od razu w .rcpt-line pod headline (split = stack w taśmie)
# H7 Product macro — packshot full-tape-width pod headline
# Reszta wymaga szerokości / lifestyle / video / numerali — łamie taśmę 420px

features_allowed: [F3]
features_forbidden: [F1, F2, F4, F5, F6]
# F3 Linear stack — jedyny składający się do 420px (bez alternacji L/R, czysty pion)
# F1/F2 bento — fizycznie brak szerokości; F5 carousel i F6 sticky-split wymagają 2 kolumn

testimonials_allowed: [T5, T1]
testimonials_forbidden: [T2, T3, T4, T6]
# T5 Single hero — 1 cytat jako „pozycja specjalna" otoczona .rcpt-stars
# T1 Voices — stacked w taśmie, oceny jako ***** w Space Mono
# T3/T4 siatki video/UGC łamią taśmę; T6 ściana atestów za authority-heavy dla low-ticket

problem_allowed: [P3, P1]
problem_forbidden: [P2, P4]
# P3 Koszt bezczynności — IDEALNY: „rachunek za status quo" jako mini-paragon (.rcpt-line kosztów)
# P1 Stat-led — jedna brutalna liczba w taśmie OK
# P2 narracja dnia = lifestyle nie pasuje do cennika; P4 wymaga szerokiego foto „przed"

how_allowed: [W3]
how_forbidden: [W1, W2]
# W3 Numerowany spec-strip — 01/02/03 jak numeracja pozycji wydruku
# W1 okrągłe ikony w kartach wyglądają obco w mono-druku; W2 timeline z foto za ciężki dla taśmy

comparison_allowed: [C1, C3]
comparison_forbidden: [C2]
# C1 Tabela ✓/✗ — wąska 2-3 kolumnowa wersja (product-aware porównuje parametry)
# C3 Spec-bar — jednowierszowy, quiet, pasuje do gęstej taśmy
# C2 karty emocjonalne z foto — za szerokie i feeling-driven

offer_allowed: [O2, O1]
offer_forbidden: [O3]
# O2 Multipack — DEFAULT: pozycje ×1/×2/×3 jako .rcpt-line w .rcpt-suma (dźwignia AOV przy low-ticket)
# O1 Single offer box — gdy produkt się nie multipackuje; nadal renderowany jako SUMA
# O3 guarantee-led osłabia anchor cenowy przy low-ticket; gwarancja = .rcpt-stamp obok SUMY
```

## 10. Motion Budget

**Level:** subtle

```yaml
js_effects_required:
  - .fade-in               # zawsze — sekcje „dodrukowują się" przy scrollu
  - .js-counter            # min 1 — SUMA / oszczędność liczy się do wartości

js_effects_forbidden:
  - .js-split              # paragon nie animuje liter — psuje wrażenie wydruku
  - .js-parallax           # taśma jest płaska, brak warstw tła
  - .magnetic              # za DTC/playful, łamie statykę druku
  - .js-tilt               # 3D niszczy płaskość papieru termicznego

js_effects_count:
  counter_min: 1
  counter_max: 4
  magnetic_min: 0          # zakaz
  tilt_min: 0              # zakaz
  parallax_min: 0          # zakaz
```

## 11. Copy Voice

- **Register:** direct value-DR („policzmy") — body copy ZAWSZE polski direct response; charakter paragonu żyje WYŁĄCZNIE w warstwie dekoracyjnej (gwiazdki, stemple, „DZIĘKUJEMY ZA ZAKUPY", meta-nagłówek) — lekcja dark-academia v5.0
- **Sentence length:** short (8-14 słów); etykiety `.rcpt-line` 2-4 słowa
- **Person:** 2-osoba (Ty/Twój), bez „my/nasz"
- **Allowed power words:** „policzmy", „oszczędzasz X zł", „cena za sztukę", „rachunek", konkretne kwoty co do grosza, „RABAT −X%"
- **Forbidden power words:** „premium", „luxury", „inwestycja w siebie", „wysokiej jakości", purple prose, AI-poetic (personifikacja produktu, „oddaje wieczór")

## 12. Example Snippet (hero + offer)

```html
<main class="rcpt-tape">
  <div class="rcpt-meta"><span>KAFINKA</span><span>NR 0001</span><span>2026-06-10</span></div>
  <section class="hero rcpt-section">
    <div class="rcpt-stars" aria-hidden="true">* * * * * * * * * * * *</div>
    <h1>Kawa jak z kawiarni. Bez rachunku <em>18 zł</em> za latte.</h1>
    <figure class="hero-figure img-placeholder"><div class="ph">packshot — full tape width</div></figure>
    <p class="hero-sub">Młynek żarnowy ze stalowymi żarnami — 60 s mielenia, zero prądu.</p>
    <div class="rcpt-line"><span class="rcpt-name">Młynek żarnowy K-01</span><span class="rcpt-dots"></span><span class="rcpt-price">199,00</span></div>
    <a href="#suma" class="btn-primary">DO SUMY → 199 zł</a>
  </section>

  <section class="offer rcpt-section" id="suma">
    <div class="rcpt-suma">
      <div class="rcpt-line"><span class="rcpt-name">Młynek K-01</span><span class="rcpt-dots"></span><span class="rcpt-price">249,00</span></div>
      <div class="rcpt-line rcpt-rabat"><span class="rcpt-name">RABAT −20%</span><span class="rcpt-dots"></span><span class="rcpt-price">−50,00</span></div>
      <div class="rcpt-total"><span>SUMA</span><span><span class="js-counter" data-target="199">199</span>,00 zł</span></div>
    </div>
    <span class="rcpt-stamp">GWARANCJA 30 DNI</span>
  </section>
</main>
```

```css
:root {
  --display: 'Space Mono', monospace;
  --body: 'Courier Prime', monospace;
  --paper: #F5EFE2;
  --desk: #E4DCC9;
  --ink: #221E1A;
  --primary: #2B3990;
  --faded: #8A8378;
  --stamp: #B3402F;
}
body { font-family: var(--body); background: var(--desk); color: var(--ink); font-size: 16px; }
.rcpt-tape { max-width: 444px; margin: 0 auto; background: var(--paper); padding: 0 24px; box-shadow: 0 16px 48px rgba(34,30,26,.18); }
.rcpt-section { border-top: 2px dashed var(--ink); padding: 64px 0; }
.rcpt-meta { display: flex; justify-content: space-between; padding: 14px 0; font-family: var(--display); font-size: 11px; letter-spacing: .12em; text-transform: uppercase; }
h1 { font-family: var(--display); font-weight: 700; font-size: clamp(26px, 7vw, 38px); line-height: 1.18; text-transform: uppercase; letter-spacing: -0.01em; }
h1 em { font-style: normal; color: var(--primary); }
.btn-primary { display: block; text-align: center; padding: 18px 24px; background: var(--primary); color: var(--paper); font-family: var(--display); font-weight: 700; font-size: 14px; letter-spacing: .1em; text-transform: uppercase; border-radius: 0; }
@media (max-width: 480px) { .rcpt-tape { max-width: 100%; box-shadow: none; } }
```

---

## MUSZĄ / NIE WOLNO — Style Lock (grep-sprawdzalne)

### MUSZĄ być użyte
- Display font: `Space Mono` w `font-family` (headline'y, ceny, meta)
- Body font: `Courier Prime` — 100% strony jest mono, zero sans/serif
- Thermal Cream `#F5EFE2` jako tło taśmy + Desk `#E4DCC9` poza taśmą
- Tusz Granat `#2B3990` jako akcent (lub brand primary, jeśli ciemny „tuszowy")
- `.rcpt-tape` max-width 420–480px — CAŁA treść w taśmie
- Primitive 1 `.rcpt-line` — min 5 wystąpień (hero + features + offer)
- `.rcpt-suma` z „SUMA" w sekcji Offer
- Min 3 separatory `.rcpt-stars` + perforacja `2px dashed` między sekcjami
- `border-radius: 0` na CTA i kartach (max 2px gdziekolwiek)

### NIE WOLNO użyć
- **Fonty:** NIE `IBM Plex` (Sans/Mono — apothecary/clinical), NIE `Fraunces`, `Cormorant`, `Playfair`, `Inter`, `Manrope`, `Archivo Black`, `Caveat`, `Fredoka` — żadnego fontu spoza pary mono
- **Layout:** NIE `grid-template-columns` 2+ kolumn dla treści (bento zakaz), NIE full-bleed sekcje treściowe, NIE container szerszy niż 560px dla tekstu
- **Kolory:** NIE czysta biel `#FFFFFF` jako tło taśmy, NIE `#FAFAF7` (paper white apothecary), NIE `linear-gradient` w tłach sekcji, NIE gold `#C9A961`
- **Elementy:** NIE `Nº` w eyebrow, NIE `.hero-numeral` (oversized italic), NIE dark `.trust-strip` z icon-circles, NIE `border-radius` ≥ 8px, NIE kolorowe glow box-shadow
- **Motion:** NIE `.js-split`, NIE `.js-parallax`, NIE `.magnetic`, NIE `.js-tilt`

---

## Podobne style (ale RÓŻNE)

- [`apothecary-label.md`](./apothecary-label.md) — oba evidence + mono akcenty, ale Apothecary to SZEROKA etykieta lab (IBM Plex, bloki 880px, sterylny paper white). Receipt Print to wąska taśma 420px, 100% mono, termiczny krem + granat tuszowy, cena jako bohater zamiast składu.
- [`clinical-kitchen.md`](./clinical-kitchen.md) — Clinical to KPI dashboard z charts/data viz. Receipt Print nie ma żadnych wykresów — tylko linie cenowe i SUMA.
- [`poster-utility.md`](./poster-utility.md) — Poster to loud full-width krzyk (Archivo Black, oversized). Receipt Print to intymna, wąska taśma — moderate, nie loud.
- [`swiss-grid.md`](./swiss-grid.md) — Swiss to 12-kolumnowy grid na pure white. Receipt Print to dokładnie JEDNA kolumna na kremie.

## Changelog
- 2026-06-10 utworzony, v5.x — domyka lukę „niski ticket + value + product-aware, gdzie cena gra główną rolę" (Apothecary/Clinical za sterylne i szerokie, Poster za głośny). Cały landing jako taśma paragonu z drukarki termicznej.
