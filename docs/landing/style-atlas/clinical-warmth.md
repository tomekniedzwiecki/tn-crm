# Clinical Warmth — ciepła apteczna precyzja zamiast sterylnego laboratorium

> Apothecary Label, ale ocieplony: szeryfowa elegancja + ciepły papier + jeden medyczny akcent. Dla produktów zdrowotnych/wellness, które muszą budzić zaufanie medyczne (evidence) i jednocześnie spokój regeneracji. Premium bez krzykliwości.

## 1. Product DNA profil
- **Utility ↔ Ritual:** utility
- **Precision ↔ Expression:** precision
- **Evidence ↔ Feeling:** evidence
- **Solo ↔ Community:** solo
- **Quiet ↔ Loud:** quiet
- **Tradition ↔ Future:** present
- **Intimate ↔ Public:** intimate

### DNA Anchors (3 produkty które ten styl obsłużyłby)
1. **Poduszka ortopedyczna / wyrób medyczny klasy I** — utility (likwiduje ból), precision (strefy anatomiczne), evidence (certyfikaty, fizjoterapeuta), intimate (sypialnia).
2. **Suplement / probiotyk premium z badaniem klinicznym** — evidence + quiet + serif autorytet (nie tech-dashboard).
3. **Pielęgnacja dermatologiczna mono-składnikowa** — precision, intimate, ciepły apteczny ton (Aesop-adjacent).

## 2. Kategorie produktów
- Wyroby medyczne / ortopedyczne (poduszki, ortezy, korektory postawy)
- Wellness / sleep tech z autorytetem medycznym
- Dermokosmetyki i pielęgnacja z dowodem (clean, evidence-first)
- Suplementy premium (klinicznie udokumentowane)
- Femtech / regeneracja / fizjoterapia D2C

## 3. Real-world refs
- **Aesop** — etykieta-jako-design, ciepły off-white papier, typograficzna powściągliwość
- **Necessaire** — technical disclosure as design (spec-first, jawne parametry)
- **Bang & Olufsen** — precyzja, cisza premium, pojedynczy akcent
- **Kinfolk magazine** — szeryfowa kolumna editorial, dużo pustki
- **Maude** — clean wellness, ciepła paleta, medyczny spokój

## 4. Font stack

- **Display:** `Cormorant Garamond` 400/500/600/700 (+ italic) — elegancki szeryf = autorytet medyczny + ciepło, poprawne polskie „Ł" w uppercase
- **Body:** `Inter` 400/500/600 — neutralny, czytelny w spec tables 15–17px
- **Label/Mono:** `Manrope` 500/600/700 — uppercase letter-spaced dla sec-meta, jednostek, numeracji stref (rola „mono-like")

```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@400;500;600;700&family=Manrope:wght@500;600;700&display=swap" rel="stylesheet">
```

## 5. Paleta (60/30/10)

| Rola | Nazwa | Hex | Gdzie |
|------|-------|-----|-------|
| Dominant 60% | Morning Light (ciepły papier) | `#F7F4ED` | tło wszystkich sekcji |
| Secondary 30% | Ink / brand dark | `#1A2332` | body text, headings |
| Accent 10% | [brand primary z workflow_branding] | brand | CTA, akcenty, highlight kolumny |
| Support 1 | Linen Cream | `#E8DCC4` | karty, dividery, nagłówki tabel |
| Support 2 | warm accent (coral/clay) | `#C8826B` | 1 ciepła akcenta per sekcja (footnote, podkreślenie) |

**Filozofia koloru:** ciepły monochrome papier + 1 brand color (medyczny granat/błękit) + 1 ciepły akcent. Zero zimnej bieli `#FFFFFF` jako tła (poza headerem). Zero gradientów w tłach sekcji. Cień zamiast neonu.

## 6. Layout DNA

**Stack editorial** — pionowe sekcje, centralna kolumna max 780px na tekst, full-bleed tylko dla spec-label i comparison table. Border 2px ink dla bloków „karty wyrobu". Border-radius mały (4–8px) — etykieta, nie playful. ZERO bento 2×2.

## 7. Signature primitives

### Primitive 1: Anatomiczna spec-label (dominanta strony)
Pełnoszerokościowy blok „karta wyrobu" w ramce 2px ink. Nagłówek z wielką liczbą display (np. liczba stref) + tabelaryczne wpisy z numeracją `01–05` w Manrope mono-uppercase.

### Primitive 2: Sec-meta strip (ZAMIAST dark trust-bar)
Full-width pasek meta: `MARKA · PARAMETR · CERTYFIKAT` w Manrope uppercase, border-top/bottom 1px ink.

### Primitive 3: Features = spec-rows (F3 Linear stack, nie bento)
Tabelaryczne wpisy `01 · Nazwa — opis`, grid `klucz | nazwa | opis`, border-bottom 1px.

### Primitive 4: Footnoted claims
Każda kluczowa liczba/twierdzenie z przypisem `[n]` + stopka źródłowa w footerze — apteczna uczciwość zamiast superlatyw.

### Primitive 5: Empty-space as design
Padding sekcji ≥ 120px desktop, ≥ 80px mobile.

---

## 8. Section Architecture

**Minimum sekcji:** 12 (z 14 available)

```yaml
required:
  - Header                    # .header (solid #FFFFFF)
  - Mobile Menu               # .mobile-menu
  - Hero                      # .hero (H1 split, hero-figure)
  - Sec Meta Strip            # .sec-meta (ZAMIAST trust-bar)
  - Problem                   # .problem (agitacja PAS)
  - Spec Label / Anatomia     # .spec-label (sygnaturowa, F3 spec rows)
  - How It Works              # .how-it-works (3 kroki)
  - Comparison Table          # .comparison (NIE cards z ✓/✗)
  - Testimonials              # .testimonials (T2 evidence-style)
  - FAQ                       # .faq (5-7 pytań)
  - Offer                     # .offer (price anchor + trust)
  - Final CTA                 # .final-cta (solid brand color, NIE gradient)
  - Footer                    # <footer> z footnotes
  - Sticky CTA                # .sticky-cta (mobile)

optional:
  - Personas / dual-angle     # .personas (2 segmenty)

forbidden:
  - Trust Bar dark            # ciemny z icon-circles (używamy sec-meta)
  - Social Proof Marquee      # nie pasuje do tonu etykiety
  - Bento 2×2                 # core forbidden
```

## 9. Allowed Variants

```yaml
hero_allowed: [H1, H5, H8]
hero_forbidden: [H2, H3, H4, H6, H7, H9, H10]
# H1 Split klasyczny — OK (copy + CTA lewo, hero-figure prawo)

features_allowed: [F3]
features_forbidden: [F1, F2, F4, F5, F6]
# F3 Linear stack (spec-rows) — JEDYNY (pasuje do karty wyrobu)

testimonials_allowed: [T2, T5]
testimonials_forbidden: [T1, T3, T4, T6]
# T2 Before/After / evidence-style — OK; T5 Single hero — OK
```

## 10. Motion Budget

**Level:** subtle

```yaml
js_effects_required:
  - .fade-in               # zawsze, delikatne
  - .js-counter            # min 1 (liczby spec: strefy / gęstość / klienci)

js_effects_forbidden:
  - .js-split              # char-by-char zbyt editorial, psuje spokój
  - .js-parallax           # brak oversized numerals w tle
  - .magnetic              # zbyt DTC/playful dla tonu medycznego
  - .js-tilt               # 3D tilt psuje powagę kliniczną

js_effects_count:
  counter_min: 1
  counter_max: 3
  magnetic_min: 0
  tilt_min: 0
  parallax_min: 0
```

## 11. Copy Voice

- **Register:** technical + warm-direct (instrukcja wyrobu, ale ludzka)
- **Sentence length:** short-medium (10–18 słów)
- **Person:** 2-osoba (Ty/Twój), bez „my/nasz"
- **Allowed power words:** „certyfikowane", „testowane", „dermatologicznie sprawdzone" (ze źródłem)
- **Forbidden:** „premium", „luxury", „wysokiej jakości", „innowacyjne", „rewolucyjne", purple prose, AI-poetic

## 12. Example Snippet

```html
<section class="hero">
  <div class="sec-meta"><span>MARKA</span><span>PROFIL MOTYLKOWY</span><span>OEKO-TEX</span></div>
  <div class="hero-grid">
    <div>
      <span class="eyebrow hero-eyebrow">Anatomia spokojnego snu</span>
      <h1>Obudź się bez bólu karku już po <em>pierwszej nocy</em></h1>
      <a href="#oferta" class="btn btn-primary">Zamów — 199 zł</a>
    </div>
    <figure class="hero-figure img-placeholder"><div class="ph">…</div></figure>
  </div>
</section>
```

```css
:root{
  --display:'Cormorant Garamond',Georgia,serif;
  --body:'Inter',sans-serif;
  --label:'Manrope',sans-serif;
  --paper:#F7F4ED; --ink:#1A2332; --primary:#2D4A6B; --accent:#C8826B;
}
body{font-family:var(--body);background:var(--paper);color:var(--ink)}
h1{font-family:var(--display);font-weight:600;font-size:clamp(40px,5.6vw,72px)}
h1 em{font-style:italic;color:var(--primary)}
.sec-meta{border-top:1px solid var(--ink);border-bottom:1px solid var(--ink);font-family:var(--label);text-transform:uppercase;letter-spacing:.14em}
```

---

## MUSZĄ / NIE WOLNO — Style Lock (grep-sprawdzalne)

### MUSZĄ być użyte
- Display font: `Cormorant Garamond` w `font-family`
- Label font: `Manrope` — min 1 występ per sekcja (sec-meta / jednostki)
- Min 1 `<table>` lub `.spec-*-list` (Comparison Table + spec-rows)
- Padding sekcji ≥ `100px 0` (grep CSS)
- Primitive 1 (spec-label) obecny
- Ciepły papier `#F7F4ED` jako tło (NIE czysta biel poza headerem)
- Brand primary z workflow_branding jako akcent

### NIE WOLNO użyć
- **Fonty:** NIE `Fraunces`, `IBM Plex`, `Archivo Black`, `Caveat`, `Fredoka`, `Nunito`
- **Layout:** NIE `grid-template-columns: 1fr 1fr` dla features (bento 2×2 zakaz)
- **Elementy:** NIE `Nº` w eyebrow, NIE `.hero-numeral` (oversized italic), NIE dark `.trust-strip` z icon-circles
- **Kolory:** NIE czysta biel `#FFFFFF` jako tło sekcji, NIE `linear-gradient` w tłach sekcji, NIE złoto bright `#C9A961`
- **Motion:** NIE `.js-split`, NIE `.js-parallax`, NIE `.magnetic`, NIE `.js-tilt`

---

## Podobne style (ale RÓŻNE)

- [`apothecary-label.md`](./apothecary-label.md) — Apothecary jest sterylny lab (IBM Plex, paper-white #FAFAF7, monochrome). Clinical Warmth ociepla: Cormorant serif + ciepły papier + brand color. Ten sam DNA, inna temperatura.
- [`japandi-serenity.md`](./japandi-serenity.md) — Japandi jest cichy ritual bez konwersji (zakaz comparison/trust/counter). Clinical Warmth jest evidence + DR (comparison, offer, counter dozwolone).
- [`editorial-print.md`](./editorial-print.md) — Editorial to ekspresja/feeling/luxury (Fraunces + Nº + gold). Clinical Warmth to evidence/precision/medical (Cormorant + spec-label + bez gold).

## Changelog
- 2026-05-29 utworzony, v4.x — wyodrębniony z landingu cervila (poduszka ortopedyczna). Rozwiązuje brak stylu dla „szeryf + ciepła paleta + autorytet medyczny" (Apothecary forbidził Cormorant/cream, Japandi forbidził konwersję).
