# Procedura dopracowania designu Landing Page

**Kiedy wywołać:** Po zakończeniu weryfikacji treści (CLAUDE_LANDING_REVIEW.md) **i manifesto kierunku** (CLAUDE_LANDING_DIRECTION.md).

Ta procedura przekształca "poprawny szablon" w **wyróżniającą się stronę marki**.

---

## 0. Zasady bezwarunkowe (przed wszystkim innym)

Te zasady obowiązują **niezależnie od wybranego kierunku** (Editorial, Organic, Playful, Brutalist, własny). Nie mają wyjątków.

### 0.1 Header ZAWSZE biały

```css
.header{
  position:fixed;top:0;left:0;right:0;z-index:100;
  background:#FFFFFF;               /* nie paper-2, nie backdrop-filter, nie rgba — czysty #FFF */
  border-bottom:1px solid var(--rule);
}
```

**Dlaczego:**
- Biały header zawsze kontrastuje z zawartością poniżej (hero, sekcje ciemne), niezależnie od palety produktu.
- Logo klienta jest zaprojektowane na białym tle — każdy inny kolor w headerze psuje jego czytelność.
- Użytkownik ustalił tę zasadę jako bezwzględną dla wszystkich landingów.

**NIE rób:** `rgba(...)` z `backdrop-filter: blur()` ani `var(--paper)` (off-white). Header ma być #FFFFFF zawsze.

### 0.2 Logo w headerze: tylko grafika, bez napisu tekstowego obok

Jeśli logo zawiera już nazwę marki, **nie dublujemy jej tekstem obok**.

```html
<!-- ✅ DOBRZE -->
<a href="#top" class="logo" aria-label="[Marka] — strona główna">
  <img src="...logo.png" alt="[Marka]" width="140" height="36">
</a>

<!-- ❌ ŹLE — dublowanie nazwy -->
<a href="#top" class="logo">
  <img src="...logo.png" alt="[Marka]"> [Marka]
</a>
```

Wyjątek: logo klienta jest bez napisu (tylko symbol) i marka jest mało znana → można dodać wordmark obok. Ale **nigdy gdy logo już zawiera nazwę**.

### 0.3 Header MA BYĆ fixed + zawsze widoczny

- `position: fixed; top: 0;`
- Bez hide-on-scroll JavaScript
- Z-index ≥ 100

Obowiązkowe — Conversion Toolkit wymaga, użytkownik scrollujący powinien mieć CTA w headerze stale dostępne.

---

## 1. Analiza obecnego stanu

Przed zmianami odpowiedz:
1. **Czy strona wygląda jak szablon?** (generyczna, przewidywalna, "widziałem to 100 razy")
2. **Co jest charakterystyczne dla tej marki?** (kolory, ton, energia)
3. **Jaki jest jeden element, który ktoś zapamięta?** (jeśli nie ma — musisz go stworzyć)

---

## 2. Wybór kierunku estetycznego

Strona musi mieć **ODWAŻNY, SPÓJNY KIERUNEK**. Wybierz jeden:

| Kierunek | Charakterystyka | Dla jakich produktów | Referencje |
|----------|-----------------|---------------------|-------------|
| **Editorial/Luxury** ⭐ | Oversized serif, magazine numbering (Nº 01–10), asymetria, ciepłe neutralne tła, rzadki gold accent | Premium AGD, kosmetyki, home, lifestyle, travel | `landing-pages/paromia/` |
| **Playful/Toy-like** | Zaokrąglone kształty, żywe kolory, bounce animations | Pet care, dzieci, gadżety | `landing-pages/pupilnik/` |
| **Brutalist/Raw** | Mocne kontrasty, surowe fonty, grid-breaking | Tech, startupy, edgy | — |
| **Organic/Natural** | Miękkie gradienty, naturalne kolory, fluid shapes | Wellness, eko, zdrowie | `landing-pages/h2vital/` |
| **Retro-Futuristic** | Neon na ciemnym, glitch, cyber vibes | Gaming, tech, młody target | `landing-pages/vibestrike/` |

**ZAPISZ WYBRANY KIERUNEK** — wszystkie decyzje muszą być z nim spójne.

### Editorial/Luxury — preset (kopiuj-wklej)

Dla produktów premium/lifestyle/AGD. Wzorzec referencyjny: `landing-pages/paromia/`.

**Fonty:**
- Display: **Fraunces** (variable, `opsz 144, SOFT 30–90`) — headlines
- Editorial: **Cormorant Garamond** (300/400) — eyebrows, page numbers, captions
  ⚠️ NIE używaj `Italiana` — ma uszkodzony glif polskiej „Ł" w uppercase
  (kreska wystaje nad literę). Szczegóły w `CLAUDE_LANDING_PROCEDURE.md` lekcja #6.
- Body: **Inter** — czytelny neutralny

**Kolorystyka:**
- Tła: Bone Ivory `#F5F1EA` / `#FAF7F2` / `#EEE8DE` — warstwy ciepłego papieru
- Ink: `#1A1A1F` (ciemny z nutą granatu, nie czysty czarny)
- Primary: kolor marki (np. Steam Teal `#1E6F7A`)
- Gold accent: `#C9A961` — rzadko, tylko w specsheet/final CTA

**Sekcje** (10 + header/footer):
Nº 01 Hero (asymetryczny, oversized numeral w tle) · Nº 02 Manifesto (sticky left + pull quote right) · Nº 03 Atelier/Features (asymmetric bento z 1 ciemną hero-tile) · Nº 04 Rytuał (3 akty z okrągłymi rzymskimi, linią łączącą) · Nº 05 Spec Sheet (ciemne tło) · Nº 06 Comparison (Poprzedni wiek vs Nowy standard) · Nº 07 Głosy (pull quotes, jedna featured ciemna) · Nº 08 FAQ (sticky-side layout) · Nº 09 Oferta · Nº 10 Final CTA (ciemny z gigantyczną cyfrą w tle).

**Rytm tła:** jasno / jasno / jasno / jasno / **CIEMNO** / jasno / jasno / jasno / jasno / **CIEMNO** / **CIEMNO** (footer). Min. 2 ciemne pasy między jasnymi — to tempo redakcyjne.

**Signature elements:**
1. Magazine numbering (eyebrow `Nº 03 — Atelier`)
2. Oversized editorial numeral w hero i final CTA
3. Tile page numbers (`01 / 06` w rogu karty)
4. FIG. 01 caption pod hero visual
5. Italic em na kluczowych słowach (1–2 per headline, Fraunces `SOFT 90`)

**Wszystkie snippety HTML/CSS** → `CLAUDE_LANDING_PATTERNS.md` (14 gotowych wzorców).

---

## 3. Checklist elementów do dopracowania

### A. Typografia — NIE UŻYWAJ GENERYCZNYCH FONTÓW

**Zakazane:** Inter, Roboto, Arial, Open Sans, system fonts

**Sprawdź:**
- [ ] Heading font jest charakterystyczny i pasuje do kierunku
- [ ] Body font jest czytelny ale nie nudny
- [ ] Jest font akcentowy (np. do cytatów, badge'ów)
- [ ] Rozmiary tworzą wyraźną hierarchię (nie 16/18/20 — raczej 16/24/48)
- [ ] Line-height i letter-spacing są dopracowane

**Sugestie fontów wg kierunku:**
- Luxury: Playfair Display, Cormorant, Libre Baskerville
- Playful: Quicksand, Nunito, Fredoka, Baloo 2
- Brutalist: Space Mono, IBM Plex Mono, Archivo Black
- Organic: Lora, Merriweather, Source Serif Pro
- Editorial: Fraunces, Newsreader, Libre Bodoni

### B. Kolory — DOMINACJA + AKCENT, NIE RÓWNOMIERNY ROZKŁAD

**Sprawdź:**
- [ ] Jest wyraźny kolor dominujący (>60% powierzchni)
- [ ] Akcent jest MOCNY i używany oszczędnie
- [ ] Gradienty są subtelne lub odważne — nie "w połowie drogi"
- [ ] Ciemne tła mają głębię (nie czysty #000000)
- [ ] Jasne tła mają ciepło lub chłód (nie czysty #FFFFFF)

**Techniki:**
```css
/* Zamiast czystej czerni */
--bg-dark: #0a0a0f;  /* z nutą granatu */
--bg-dark: #0f0a0a;  /* z nutą burgundu */

/* Zamiast czystej bieli */
--bg-light: #fefdfb;  /* ciepła */
--bg-light: #f8fafc;  /* chłodna */
```

### C. Przestrzeń i układ — PRZEŁAM PRZEWIDYWALNOŚĆ

**Sprawdź:**
- [ ] Nie wszystkie sekcje mają ten sam padding
- [ ] Jest przynajmniej jeden element "grid-breaking" (wychodzi poza kontener)
- [ ] Jest asymetria lub overlap gdzieś na stronie
- [ ] Negatywna przestrzeń jest celowa, nie przypadkowa
- [ ] Karty/elementy nie są wszystkie identyczne

**Techniki:**
- Sekcja hero może być wyższa niż 100vh
- Element może "wystawać" poza swoją sekcję
- Tekst może nachodzić na obraz
- Różne sekcje mogą mieć różne szerokości kontenera

### D. Animacje i micro-interactions — QUALITY OVER QUANTITY

**Sprawdź:**
- [ ] Page load ma orchestrated reveal (staggered animations)
- [ ] Hero ma split headline char-by-char reveal (z `.js-split`)
- [ ] Kluczowe liczby mają counter animation od 0 do target (z `.js-counter`)
- [ ] CTA buttony są magnetic (kursor je subtelnie przyciąga)
- [ ] Bento tiles mają subtle 3D tilt (max 4°, z perspective 900px)
- [ ] Hover states są zaskakujące (nie tylko kolor)
- [ ] Scroll animations dodają wartość (nie rozpraszają)
- [ ] Jest przynajmniej jeden "wow moment"
- [ ] Animacje są płynne (60fps, transform/opacity only)
- [ ] **Wszystko respektuje `prefers-reduced-motion: reduce`**

### D.1 OBOWIĄZKOWA paleta JS effects

Od teraz **każdy landing MUSI mieć minimum 4 JS effects** (bez nich wygląda statycznie, jak plik PDF):

| # | Efekt | Klasa / hook | Gdzie użyć | Referencja |
|---|---|---|---|---|
| 1 | **Split headline reveal** | `.js-split` na H1 hero | Jeden hero headline — char-by-char staggered reveal (18-22ms delay) | `CLAUDE_LANDING_PATTERNS.md` pattern 17 |
| 2 | **Number counter** | `.js-counter` + `data-target` + `data-suffix` | Hero stats (3 liczby), offer savings — liczą od 0 w 1.4s easing cubic | pattern 18 |
| 3 | **Magnetic CTA** | `.magnetic` na `.btn-primary` | CTA w hero + offer + finale — kursor przyciąga (0.18 factor, `(hover:hover)` only) | pattern 19 |
| 4 | **Tile 3D tilt** | Na `.tile:not(.tile-hero)` | Bento/feature tiles — subtle rotateX/Y max 4°, perspective 900px | pattern 20 |
| 5 | **Scroll parallax numerals** | JS `.hero-numeral`, `.finale-numeral` | Editorial numerals unoszą się przy scroll — speed 0.12-0.18 | pattern 21 |

**NIE dodawaj** bez potrzeby:
- ❌ Cursor followers (dot / circle chasing cursor) — odciąga uwagę
- ❌ Glitch / shake effects — nie pasuje do Editorial/Calm
- ❌ Confetti / particle explosions — playful/toy only
- ❌ Auto-play video w tle hero — powód #1 bounce rate
- ❌ Scroll-jacking / snap scrolling — frustracja użytkownika

### D.2 Kiedy który efekt pasuje do kierunku

| Kierunek | JS effects pasujące | Unikaj |
|---|---|---|
| **Editorial/Panoramic Calm** | Split headline (powolny), number counter, magnetic CTA (subtle), scroll parallax numerals | Tilt dramatyczny, cursor chase |
| **Playful/Toy** | Tile tilt (mocniejszy 8-10°), bouncy hover, marquee, emoji floating | Magnetic CTA (za subtle) |
| **Brutalist** | Hard text reveal (bez easing), cursor dot, glitch text | Split char-by-char (za delikatny) |
| **Organic/Natural** | Smooth blob morph, soft magnetic, gentle parallax | Tilt, counter (statyczny) |
| **Retro-Futuristic** | Terminal typing effect, neon glow pulse, glitch | Magnetic subtle, slow counter |

**Techniki:**
```css
/* Staggered reveal */
.card:nth-child(1) { animation-delay: 0ms; }
.card:nth-child(2) { animation-delay: 100ms; }
.card:nth-child(3) { animation-delay: 200ms; }

/* Zaskakujący hover */
.card:hover {
  transform: translateY(-8px) rotate(-1deg);
  box-shadow: 20px 20px 0 var(--accent);
}
```

### E. Tekstury i tła — DODAJ GŁĘBIĘ

**Sprawdź:**
- [ ] Tła nie są "płaskie" (mają gradient, noise, pattern)
- [ ] Jest przynajmniej jedna sekcja z wyróżniającym się tłem
- [ ] Shadows mają kolor (nie czysty czarny)
- [ ] Jest coś interesującego w tle hero (nie plain gradient)

**Techniki:**
```css
/* Noise texture overlay */
.section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,...") repeat;
  opacity: 0.03;
}

/* Colored shadows */
box-shadow: 0 20px 40px rgba(var(--primary-rgb), 0.15);

/* Mesh gradient */
background:
  radial-gradient(at 20% 30%, var(--color1) 0%, transparent 50%),
  radial-gradient(at 80% 70%, var(--color2) 0%, transparent 50%);
```

### F. Detale, które robią różnicę

**Sprawdź:**
- [ ] Ikony są spójne stylistycznie (nie mix różnych zestawów)
- [ ] Buttony mają charakterystyczny kształt (nie generic rounded)
- [ ] Dividers/separatory są ciekawe (nie zwykła linia)
- [ ] Liczby/statystyki mają wyróżniający styl
- [ ] Badge'e/tagi mają osobowość

---

### G. Layout Discipline (image-box fit) — OBOWIĄZKOWO

**„Zdjęcia nie mieszczą się w boxach" to najczęstszy widoczny bug landing pages.** 5 zasad:

#### Zasada 1 — Policz komórki grida ZANIM napiszesz kafelkę

Bento z asymetrycznie powiększoną kartą to klasyczna pułapka.

**Formuła:** `liczba_tiles × 1 + Σ(span_extra) = pełna liczba komórek grida`

Przykład **złego** layoutu: 3 kolumny, 4 tiles, jedna `grid-column:span 2; grid-row:span 2` (4 komórki). 3×1 + 4 = 7 z 9 → **2 puste dziury**.

**Dobre layouty dla 4 tiles z jedną featured:**

| Wariant | Układ | Komórek |
|---|---|---|
| **Banner top (3-col)** | hero `grid-column:1/-1` (row 1), 3 tiles row 2 | 3+3=6 |
| **Zebra (2-col)** | hero span 2 row 1, 2 tiles row 2, 4. tile span 2 row 3 | 2+2+2=6 |
| **L-shape (2-col)** | hero span 2 row 1, 2 tiles row 2, 1 tile span 2 row 3 | 2+2+2=6 |

#### Zasada 2 — aspect-ratio dopasowany do orientacji zdjęć

**Nigdy nie wymuszaj jednego aspect-ratio globalnie.**

| Typ zdjęcia | aspect-ratio | Dlaczego |
|---|---|---|
| Produkt packshot | `1/1` / `4/5` | Symetria, eliminuje cropping |
| Produkt w użyciu | `4/3` / `16/10` | Krajobraz, osoba + kontekst |
| Przekrój techniczny | `1/1` | Symetria, centered |
| Hero banner | `16/9` / `21/9` | Cinematograficzne |
| Portret persony | `4/5` | Twarz + ramiona w kadrze |
| How-it-works krok | `4/3` | Instruktaż |

#### Zasada 3 — `object-fit:cover` ZAWSZE razem z `object-position`

```css
.tile-figure img {
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: center;  /* 'center top' dla portretów, 'center 40%' dla produktów w użyciu */
}
```

#### Zasada 4 — tile-body + tile-figure flexem (wyrównana wysokość figur)

```css
.tile { display:flex; flex-direction:column; height:100% }
.tile-body { padding:32px; flex:1 }   /* rośnie, wypełnia przestrzeń */
.tile-figure {
  aspect-ratio: 4/3;
  background: var(--paper-3);
  border-top: 1px solid var(--rule);
}
.tile-figure img { width:100%; height:100%; object-fit:cover; object-position:center }
```

**Efekt:** figury wyrównane na dnie niezależnie od długości tekstu.

#### Zasada 5 — tile-hero (featured) ma wewnętrzny 2-col grid

Gdy kafelka zajmuje 2+ kolumn, **nie rób pionowej** (tekst-nad-figurą). Zrób inner 2-col grid: tekst lewo, figura prawo.

```css
.tile.tile-hero {
  grid-column: 1 / -1;
  display: grid; grid-template-columns: 1fr 1fr;
  padding: 0;
  min-height: 380px;
}
.tile.tile-hero .tile-body { padding:56px; display:flex; flex-direction:column; justify-content:center }
.tile.tile-hero .tile-figure {
  margin: 0;
  aspect-ratio: auto;
  height: 100%; min-height: 380px;
  border-left: 1px solid var(--rule);
}
@media (max-width:900px) {
  .tile.tile-hero { grid-template-columns: 1fr; min-height: 0 }
  .tile.tile-hero .tile-figure { order: -1; aspect-ratio: 16/10; height: auto; border-left: 0; border-bottom: 1px solid var(--rule); }
}
```

#### Anty-wzorce (NIE)

| ❌ Złe | ✅ Dobre |
|---|---|
| Bento 3-col z hero `span 2×2` + 3 zwykłe tiles → 2 puste komórki | Policz komórki przed CSS |
| Jeden globalny `aspect-ratio` | Per-sekcję wg orientacji |
| `object-fit: cover` bez `object-position` | Zawsze parą |
| `<img width="800" height="500">` gdy zdjęcie 4/5 | Dopasuj do realnej proporcji |
| Kafelki bez `flex:1` na body | `tile-body { flex:1 }` wyrównuje |

---

### H. OFFER BOX / CTA — kanoniczny playbook 2026 (OBOWIĄZKOWY)

**Źródło:** Baymard, NN/g, GoodUI, FTC Dark Patterns Report, EU Omnibus Directive, 7 real refs (Oura, Theragun, Apollo Neuro, Hatch, AG1, Eight Sleep, Foreo).

**Dlaczego osobna sekcja:** offer box to 80% konwersji po Hero. Pozostałe sekcje mogą być dopracowane 90%, ale jeśli offer box jest średni → strata pieniędzy na reklamach.

#### H.1 — Visual hierarchy (Z-pattern)

Kolejność wzroku w offer boxie:
```
┌─────────────────────────────────────┐
│ [sticker top-right: BESTSELLER -23%]│
│                                     │
│ ★★★★★ 4.8/5 · 1 247 opinii          │
│                                     │
│ Nazwa / Headline oferty             │
│ Lede (max 12 słów)                  │
│                                     │
│ 199 zł  → 149 zł        [-25%]      │
│        Oszczędzasz 50 zł            │
│ lub 3 raty po 50 zł z PayPo         │
│                                     │
│ ✓ Benefit 1 (benefit→feature→emo)  │
│ ✓ Benefit 2                         │
│ ✓ Benefit 3                         │
│ ✓ Benefit 4 (max 5)                 │
│                                     │
│ [  Zamawiam — 149 zł            ]   │
│                                     │
│ 🛡️ 30 dni na zwrot · bez pytań      │
│                                     │
│ ─── 🚚 🛡️ 🔄 ───                    │
│ Darmowa wysyłka · 30 dni zwrotu ·   │
│ 2 lata gwarancji                    │
│                                     │
│ [BLIK][Visa][MC][P24][Apple Pay]    │
└─────────────────────────────────────┘
```

**Jedno ognisko wizualne = CTA, nie cena.** NN/g: dwa elementy o równej wadze wizualnej = wzrok skacze, klient dłużej się waha. Cena 48-64px bold. CTA 56-64px wysokości, kontrastowy kolor (komplementarny do tła). Nie używaj tego samego accent color na cenie i CTA — np. cena ciemna granat, CTA teal/amber.

#### H.2 — Price anchoring (stara vs nowa + savings)

**Reguły bezwzględne:**
- Stara cena SZARA (`#9ca3af`) z `line-through`, rozmiar 60-70% nowej ceny
- Nowa cena kontrastowa (ciemna lub brand primary), 48-64px desktop / 40px+ mobile
- Savings pokazuj **DWA razy:** badge "-25%" + tekst "Oszczędzasz 50 zł"
- **Rule of 100:** % dla cen <100 zł (wygląda większe); kwota zł dla cen >100 zł (80 zł brzmi mocniej niż 20%)

**⚠️ EU Omnibus compliance (OBOWIĄZKOWE od 2023 w PL):**
Stara cena w strikethrough MUSI być najniższą ceną z ostatnich 30 dni. Inaczej UOKiK grzywny (do 10% rocznego obrotu). NIGDY nie wpisuj sztucznie wyższej "original price" żeby nakręcić savings — ścigane.

```html
<div class="price-row">
  <span class="price-old">199 zł</span>
  <span class="price-new">149 zł</span>
  <span class="price-save-badge">-25%</span>
</div>
<div class="price-save-text">Oszczędzasz 50 zł</div>
<!-- UWAGA: BNPL (PayPo/Klarna/raty) NIE stosujemy w TN — zob. H.3 -->
```

```css
.price-old{color:#9ca3af;text-decoration:line-through;font-size:22px;font-weight:500}
.price-new{color:var(--primary);font-size:56px;font-weight:800;line-height:1;letter-spacing:-.02em}
.price-save-badge{background:#fee2e2;color:#b91c1c;font-weight:700;font-size:14px;padding:4px 10px;border-radius:6px;transform:rotate(-3deg)}
.price-save-text{color:#059669;font-weight:600;font-size:14px;margin-top:4px}
.price-bnpl{font-size:13px;color:var(--text-soft);margin-top:8px;display:flex;align-items:center;gap:6px}
```

#### H.3 — Trust signals (MAX 3-5 typów)

**Baymard:** strony z 1-3 typami trust signals konwertują +23% lepiej; z 7+ typami konwertują -8% (cognitive clutter). Dobierz świadomie.

**Optimal stack (5 typów) dla landingów PL:**
1. **Rating + liczba opinii** NAD CTA: `★★★★★ 4.8/5 · 1 247 opinii` (+270% konwersji na high-ticket wg Baymard)
2. **Gwarancja** POD CTA — 1 linia: `🛡️ 30 dni na zwrot · bez pytań` (+21% visible MBG per Conversion Fanatics)
3. **Trust strip** z 3 ikonami + 1-liner: Darmowa wysyłka · 30 dni zwrotu · 2 lata gwarancji
4. **Payment logos** strip grayscale: **BLIK pierwsze** (PL-first), Visa, MC, Przelewy24, Apple Pay — max 6, wszystkie ~18-20px wysokości
5. **Social proof** jako dynamic counter (jeśli mamy prawdziwe dane): `Popular — 23 zamówienia w 24h`

**⚠️ TN-specyfic ZAKAZ** (zob. [MEMORY.md feedback-payment-methods](~/.claude/projects/c--repos-tn/memory/feedback-payment-methods.md)):
W `offer-payments` strip **NIGDY nie umieszczaj**:
- ❌ `ZA POBR.` / „za pobraniem" / „płatność przy odbiorze" — TN nie obsługuje COD
- ❌ `PayPo` / `Klarna` / `Twisto` / „3 raty" / „4 raty" — TN nie ma integracji ratalnej

Dozwolone: **BLIK** (zawsze pierwsze), **VISA**, **MC**, **P24** (Przelewy24), **APPLE PAY**, ewentualnie **GOOGLE PAY**.

Research rekomenduje BNPL jako winning pattern (5/7 premium brands). Dla TN to NIE PASUJE — mimo że pattern dobry, operacja tego nie wspiera. **Research = input, NIE command.** Jeśli wpiszesz BNPL/COD w copy to okłamujesz klienta wobec dostawcy = reklamacje.

**Placement reguła Baymard:** guarantee **pod** CTA (nie nad), shipping **obok ceny**, reviews **nad** CTA.

```html
<!-- Rating nad CTA -->
<div class="offer-rating">
  <span class="stars">★★★★★</span>
  <span>4.8/5 · <strong>1 247</strong> opinii</span>
</div>

<!-- CTA -->
<button class="cta-primary magnetic">Zamawiam — 149 zł</button>

<!-- Guarantee pod CTA -->
<p class="offer-guarantee">🛡️ 30 dni na zwrot · bez pytań · Płatność BLIK, karta, za pobraniem</p>

<!-- Trust strip -->
<div class="trust-strip">
  <span><svg>truck</svg> Darmowa wysyłka</span>
  <span><svg>shield</svg> 30 dni zwrotu</span>
  <span><svg>refresh</svg> 2 lata gwarancji</span>
</div>

<!-- Payment logos -->
<div class="payment-logos">
  <img src="blik.svg" alt="BLIK" height="20">
  <img src="visa.svg" alt="Visa" height="20">
  <img src="mastercard.svg" alt="Mastercard" height="20">
  <img src="przelewy24.svg" alt="Przelewy24" height="20">
  <img src="applepay.svg" alt="Apple Pay" height="20">
</div>
```

#### H.4 — Urgency / scarcity (tylko prawdziwa!)

**TAK** — jeśli masz real dane:
- Timer tied do prawdziwej kampanii z endDate w bazie (pokazuj TYLKO gdy `endsAt - now < 7 dni`)
- Stock-left z API (pokazuj TYLKO gdy `stock < 10`)
- Dynamic social proof z CRM: `23 zamówienia w ostatnich 24h` (prawdziwe dane)

**NIE** — dark patterns:
- "Tylko dzisiaj!" bez real endDate (FTC classyfikuje jako deceptive, UOKiK ściga)
- "Zostało 3 szt." bez realnego stocku
- Evergreen countdown (resetuje się przy reload) — 68% userów rozpoznaje i traci trust

**Fallback gdy nie ma real data:** zamiast fake scarcity użyj **social proof** — "42 osoby kupiły w tym tygodniu" (prawdziwe z CRM) albo "Bestseller w kategorii Health-Tech".

```js
// Timer pokazuj TYLKO gdy real promo
if (promo.endsAt && (promo.endsAt - Date.now()) < 7*24*3600*1000) showTimer();
```

#### H.5 — Copy microcopy (winning patterns)

**CTA button text — decyzja:**
- Impulse / low-ticket (<200 zł): **"Kup teraz"** lub **"Zamawiam"** (akcja)
- High-consideration (>300 zł): **benefit-driven** ("Zacznij słyszeć wyraźniej", "Odbierz komplet")
- **Hybrydowy winner (statystycznie stabilny):** `[CTA] [akcja] — [cena] zł` np. `"Zamawiam — 149 zł"` (akcja + value w buttonie)

**Guarantee microcopy — ZAWSZE konkret czasu:**
- ✅ "30 dni na zwrot · bez pytań"
- ❌ "Nie ryzykujesz ani złotówki" (abstract, brak konkretu)
- ❌ "Satysfakcja gwarantowana" (generic, nic nie znaczy)

**Bullets — benefit → feature → emotion, 3 warstwy w 1 linii:**
- ❌ (feature-only) "Filtr 27 dB SNR"
- ✅ (benefit→feature→emotion) "Filtr 27 dB — maluch zasypia mimo hałasu wesela"
- ❌ (feature-only) "Kamera 1080p Full HD"
- ✅ "Podgląd Full HD — widzisz dokładnie gdzie jesteś, zanim włożysz końcówkę"

**Subheadline pod nagłówkiem** — 1 zdanie, problem→solution, max 12 słów.

#### H.6 — Visual moves 2026 (które warto ukraść)

**TAK:**
- **"BESTSELLER" / "NAJCZĘŚCIEJ WYBIERANE" sticker** — corner top-right, nachylony -3°, kolor accent (amber/czerwony)
- **Subtle gradient border** (brand-primary → secondary) na 1 karcie (jeśli wariantów 2-3) — nie animuj
- **Dark card** dla premium (>500 zł tech, luxury) — ale dla emocjonalnych zakupów (rodzina, dzieci, health) **jasna karta** konwertuje lepiej (medical/pharma wzorzec)
- **Floating testimonial** obok CTA — krótkie (≤12 słów) + inicjały: "Mój syn w końcu nie boi się czyszczenia — Magda K."
- **Live social proof** (Theragun move): dynamic counter "23 zamówienia w ostatnich 24h" (z prawdziwej bazy)

**NIE:**
- **Separator "lub" między dwoma CTA** — sugeruje wahanie. Clean single CTA wygrywa (-10-30% primary action przy dwóch równorzędnych)
- **Animowany gradient border** — ruch rozprasza od decyzji
- **Auto-play video w offer boxie** — NN/g: obniża task completion

#### H.7 — Mobile specifics (375px)

**Sticky CTA na dole** (+8-15% conversion wg testów):
- Wywołuje się po scroll poza oryginalny offer box (nie od startu strony)
- Slide-up 200-300ms
- 56px+ wysokości (tap target threshold, Apple HIG)
- Full-width minus 16px margin
- Zawiera TYLKO: cena + button (nie warianty, nie dropdowny — modal on tap)
- `env(safe-area-inset-bottom)` dla iOS

```css
.sticky-cta{
  position:fixed;bottom:0;left:0;right:0;
  padding:12px 16px calc(12px + env(safe-area-inset-bottom));
  background:#fff;box-shadow:0 -4px 16px rgba(0,0,0,.08);
  z-index:50;display:flex;gap:12px;align-items:center;
  transform:translateY(100%);transition:transform .25s ease-out
}
.sticky-cta.visible{transform:translateY(0)}
.sticky-cta .price{font-weight:800;font-size:18px;white-space:nowrap}
.sticky-cta .btn{flex:1;min-height:56px;font-size:17px;font-weight:700}
```

```js
// Show sticky po scroll poza main offer
const mainCTA = document.querySelector('.offer-box');
const stickyBar = document.querySelector('.sticky-cta');
new IntersectionObserver(([e])=>{
  stickyBar.classList.toggle('visible', !e.isIntersecting);
},{threshold:0.1}).observe(mainCTA);
```

**Mobile — WSZYSTKIE benefity widoczne** (nie collapse). "Pokaż więcej" dla długich specyfikacji/FAQ, NIGDY dla sprzedażowych benefits (bounce).

**Price size mobile:** nie mniejsze niż 40px (zostaje dominantem), stara cena 18-20px.

#### H.8 — Anti-patterny (NIGDY)

| Anti-pattern | Dlaczego zły | Ryzyko |
|---|---|---|
| **"Tylko dzisiaj!"** bez real timera | FTC/UOKiK: deceptive urgency | Grzywna + brand distrust; 68% userów rozpoznaje manipulację |
| **"Zostało 3 szt."** bez realnego stocku | FTC explicit dark pattern | Enforcement risk |
| **Strikethrough z ceną WYŻSZĄ** niż była naprawdę w 30 dni | Narusza EU Omnibus (obowiązek 30-day low price) | Grzywna UOKiK do 10% obrotu |
| **Pre-checked upsell checkbox** | FTC named dark pattern | Enforcement risk |
| **Auto-play video w offer boxie** | Rozprasza od decyzji | NN/g: obniża task completion |
| **Exit-intent popup** z rabatem | Trenuje userów do „wyjścia = rabat"; Google penalizuje intrusive interstitials (mobile) | SEO penalty + uczone zachowanie |
| **Fake reviews / 5.0 z 3 opiniami** | Omnibus wymaga weryfikacji recenzji (EU) | Grzywna + trust erosion |
| **Ukryte koszty dopiero w kroku 3** | Baymard #1 powód abandon (48%) | Massive conversion leak |
| **Dwa CTA o równej wadze** | Decision paralysis | -10-30% primary action |
| **"Dołącz do 10 000+ klientów"** bez źródła | Dewaluuje social proof | Trust erosion |

#### H.9 — Checklist offer box (przed deployem MUST PASS)

- [ ] **Price anchoring** — stara cena GRAY strikethrough, nowa 48-64px bold
- [ ] **Savings dual display** — badge "-X%" + tekst "Oszczędzasz N zł"
- [ ] **EU Omnibus compliance** — stara cena = najniższa z 30 dni (nie sztucznie zawyżona)
- [ ] **CTA button** — text "Zamawiam — 149 zł" (akcja + value) albo benefit-driven
- [ ] **Guarantee microcopy POD CTA** — konkretna liczba dni ("30 dni na zwrot · bez pytań")
- [ ] **Trust strip** 3 ikony + 1-liner (darmowa wysyłka / zwrot / gwarancja)
- [ ] **Payment logos** grayscale, BLIK pierwsze (PL-first), max 6
- [ ] **Rating + liczba opinii** nad CTA (jeśli mamy prawdziwe dane)
- [ ] **Bestseller/Popular sticker** corner top-right (jeśli uzasadniony danymi)
- [ ] **Single dominant CTA** — nie 2 równorzędne
- [ ] **Mobile sticky CTA** 56px+, full-width, visible po scroll poza main offer
- [ ] **Benefit bulletów 3-5** — benefit→feature→emotion, nie feature-only
- [ ] **Zero fake urgency** (timer bez real endDate, stock bez realnego)
- [ ] **Zero pre-checked upsells**
- [ ] **Magnetic CTA** dla pointer-fine (+prefers-reduced-motion respected)

---

## 4. Proces dopracowania

### Krok 1: Audit
Przejrzyj całą stronę i zanotuj:
- Co wygląda generycznie?
- Co można wzmocnić?
- Gdzie brakuje charakteru?

### Krok 2: Hero jako priorytet — CENTRALNA KOMPOZYCJA

Hero to 80% pierwszego wrażenia. **NIE RÓB** standardowego 2-kolumnowego layoutu (tekst + obraz).

**Zamiast tego użyj CENTRALNEJ KOMPOZYCJI:**

```
┌─────────────────────────────────────────────┐
│        🐾  floating decorations  💕         │
│                                             │
│            [badge - centered]               │
│         [headline - centered]               │
│        [subheadline - centered]             │
│           [CTA buttons]                     │
│                                             │
│    ┌─────────────────────────┐              │
│    │   floating    PRODUCT   floating      │
│    │   badges ───► [image] ◄─── badges    │
│    │               + glow                   │
│    │               + ring                   │
│    └─────────────────────────┘              │
│                                             │
│         animated particles                  │
└─────────────────────────────────────────────┘
```

**Wymagane elementy Hero:**

1. **Floating decorations** w tle (emoji/ikony związane z produktem)
   - 5-8 elementów z `animation: float Xs ease-in-out infinite`
   - Różne rozmiary, pozycje, animation-delay

2. **Animated gradient orbs** (pseudo-elements ::before/::after)
   - Duże koła z radial-gradient
   - Subtelna animacja ruchu

3. **Produkt w centrum** z efektami:
   - **Glow ring** - pulsująca poświata
   - **Rotating ring** - obracający się dashed border z ikoną
   - **3D float animation** - produkt "unosi się"
   - **Hover**: zatrzymanie animacji + scale

4. **Feature badges** wokół produktu
   - 4 badge'e w rogach
   - Każdy z ikoną (emoji) + krótki tekst
   - Floating animation

5. **Animated particles** (opcjonalne, wg produktu)
   - Np. cząsteczki sierści dla pet care
   - Animacja "ssania" w stronę produktu

6. **Wavy divider** pod Hero
   - SVG wave zamiast prostej linii
   - 2 warstwy z różnymi kolorami

**CSS do skopiowania:**
```css
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.hero-product {
  animation: productFloat 4s ease-in-out infinite;
}

@keyframes productFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}
```

### Krok 3: Dopracowanie KAŻDEJ sekcji (nie tylko Hero!)

**Trust Bar:**
- Zmień z prostego paska na floating cards
- Dodaj ikony z animacją (wiggle on hover)
- Różne tło niż sąsiednie sekcje

**Problem Section:**
- Dodaj dekoracyjne elementy w tle (emoji, shapes)
- Statystyki z wyróżniającymi się liczbami (duży font, gradient)
- Hover na kartach stat z rotacją

**Solution/Benefits (Bento Grid):**
- Różne rozmiary kart (nie wszystkie identyczne!)
- Jedna karta może być 2x szeroka lub wysoka
- Ikony z bounce/rotate na hover
- Kolorowe offset shadows na hover

**How It Works:**
- Zamiast prostych kart — **timeline z linią łączącą**
- Lub **numbered steps z dużymi cyframi**
- Animowane strzałki/linie między krokami

**Testimonials:**
- Duże cudzysłowy jako dekoracja
- Zdjęcia/avatary z kolorowym border
- Karty z różnym tłem (co druga inna)

**Pricing/Offer — patrz sekcja H (pełna procedura offer box 2026).** To najważniejsza sekcja po Hero — ma własny kanoniczny playbook bo 80% konwersji zależy od niej.

**FAQ:**
- Accordion z płynną animacją
- Ikona +/- z rotacją
- Wyróżnione tło dla otwartego pytania

**Footer:**
- Wavy divider na górze
- Dekoracyjne elementy (logo duże, emoji)
- Social icons z hover effects

### Krok 4: Wavy dividers między sekcjami

**NIE UŻYWAJ** prostych linii ani border-top/bottom.

**UŻYWAJ** SVG wave dividers:
```html
<div class="wavy-divider">
  <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
    <path fill="#FEF7ED" d="M0,64 C360,120 720,0 1080,64 C1260,96 1380,80 1440,64 L1440,120 L0,120 Z"/>
  </svg>
</div>
```

Dodaj między: Hero→Trust, Problem→Solution, Testimonials→Offer

### Krok 5: MOBILE — OBOWIĄZKOWE DOPRACOWANIE

**Hero na mobile:**
- Ukryj floating decorations (`display: none`)
- Ukryj particles animations
- Feature badges w linii pod produktem (nie floating)
- Mniejszy produkt, mniejsze fonty
- Ring/glow ukryte lub zmniejszone

**Karty na mobile:**
- `grid-template-columns: 1fr` (jedna kolumna)
- Mniejsze paddingi
- Hover effects zamień na tap-friendly

**Testuj na 375px szerokości!**

```css
@media (max-width: 768px) {
  .floating-paw,
  .floating-heart,
  .suction-particles,
  .hero-product-ring,
  .hero-product-glow {
    display: none;
  }

  .feature-badge {
    position: static;
    animation: none;
  }

  .hero-feature-badges {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }
}
```

### Krok 6: Signature elements
Stwórz 2-3 elementy powtarzające się na stronie:
- Charakterystyczny styl kart (ten sam border-radius, shadow, hover)
- Unikalny sposób prezentacji liczb (gradient text, duży font)
- Spójny styl hover effects (ta sama rotacja, shadow offset)
- Spójna kolorystyka akcentów

### Krok 7: Final polish pass
Przejdź sekcja po sekcji i dopracuj:
- Spacing (różny padding między sekcjami!)
- Shadows (kolorowe, nie czarne)
- Border radius (spójny w całej stronie)
- Transitions (cubic-bezier, nie linear)

---

## 5. Anty-wzorce (NIE RÓB TEGO)

- ❌ Wszystkie sekcje z tym samym paddingiem i layoutem
- ❌ Karty które różnią się tylko treścią
- ❌ Gradienty purple-to-blue na białym tle (AI slop)
- ❌ Hover = tylko zmiana koloru
- ❌ Fonty Inter, Roboto, Arial
- ❌ Czysta czerń (#000) i biel (#FFF)
- ❌ Box-shadow z czarnym kolorem
- ❌ Brak żadnych animacji
- ❌ Wszystko idealnie wycentrowane

---

## 6. Checklist przed zakończeniem

- [ ] Strona ma wyraźny kierunek estetyczny
- [ ] Jest przynajmniej jeden "wow moment"
- [ ] Typografia jest charakterystyczna
- [ ] Kolory mają głębię i ciepło/chłód
- [ ] Animacje są płynne i celowe
- [ ] Detale są dopracowane
- [ ] Strona NIE wygląda jak szablon

---

## 7. Raport dla użytkownika

Po zakończeniu przedstaw:

```
## Design Review: [nazwa]

### Kierunek estetyczny: [wybrany kierunek]

### Wprowadzone zmiany:
- [lista zmian wizualnych]

### Signature elements:
- [elementy charakterystyczne dla tej strony]

### Link: https://tn-crm.vercel.app/landing-pages/[nazwa]/
```
