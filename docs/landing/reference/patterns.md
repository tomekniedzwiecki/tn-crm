# Landing Page Patterns — biblioteka kopiuj-wklej

**Cel:** gotowe snippety signature elements, które odróżniają landing „pro" od „template".

Każdy snippet ma:
- **Kiedy użyć**
- **HTML**
- **CSS**
- **Efekt wizualny** (co daje)

---

## 1. Oversized Editorial Numeral (hero background)

**Kiedy:** produkty premium/luxury/lifestyle/editorial gdy masz jedną mocną liczbę (26 s, 30 kPa, 5× więcej).

**HTML:**
```html
<section class="hero">
  <div class="hero-numeral">26<sup>sek.</sup></div>
  ...
</section>
```

**CSS:**
```css
.hero { position: relative; isolation: isolate; overflow: hidden; }
.hero-numeral {
  position: absolute;
  top: -40px; right: -20px;
  font-family: var(--font-display);  /* Fraunces / Playfair / Recoleta */
  font-size: clamp(280px, 28vw, 440px);
  line-height: .78;
  font-weight: 300; font-style: italic;
  color: var(--paper-3);              /* bardzo jasna wersja tła */
  letter-spacing: -.04em;
  z-index: -1; user-select: none;
}
.hero-numeral sup {
  font-size: .22em; font-style: normal;
  font-family: var(--font-editorial);
  letter-spacing: .1em; color: var(--slate-2);
  vertical-align: top;
}
```

**Efekt:** gigantyczna cyfra w tle daje strony wagi jak okładka magazynu. Zapamiętywalna, nie ma drugiej takiej na rynku.

---

## 2. Magazine Page Numbering (Nº 01 — SECTION NAME)

**Kiedy:** ZAWSZE gdy kierunek = Editorial/Luxury. Nadaje stronie rytm „czasopisma".

**HTML:**
```html
<div class="eyebrow">Nº 03 — Atelier</div>
<h2>Precyzja,<br><em>nie przypadek.</em></h2>
```

**CSS:**
```css
.eyebrow {
  display: inline-flex; align-items: center; gap: 14px;
  font-family: var(--font-editorial);   /* Italiana / Didot */
  font-size: 13px; font-weight: 400;
  letter-spacing: .32em; text-transform: uppercase;
  color: var(--primary);
}
.eyebrow::before {
  content: ""; width: 32px; height: 1px; background: currentColor;
}
.eyebrow.center::after {
  content: ""; width: 32px; height: 1px; background: currentColor;
}
```

Numeruj **wszystkie sekcje** po kolei: Nº 01 (Hero), Nº 02 (Manifesto), Nº 03 (Atelier/Features), … Nº 10 (Final).

---

## 3. Tile Corner Page Numbers (w bento)

**Kiedy:** w każdej karcie bento, dodaje „page number" w rogu.

**HTML:**
```html
<article class="tile t-hero" data-no="01 / 06">
  <h3>...</h3>
  ...
  <div class="tile-footer"><span>Czas do pierwszej pary</span><span>Nº 01</span></div>
</article>
```

**CSS:**
```css
.tile { position: relative; }
.tile::after {
  content: attr(data-no);
  position: absolute; top: 20px; right: 24px;
  font-family: var(--font-editorial);
  font-size: 11px; letter-spacing: .28em;
  color: var(--slate-2); text-transform: uppercase;
}
.tile-footer {
  margin-top: auto; padding-top: 20px;
  border-top: 1px solid var(--rule);
  display: flex; justify-content: space-between;
  font-family: var(--font-editorial);
  font-size: 11px; letter-spacing: .28em;
  color: var(--slate); text-transform: uppercase;
}
```

---

## 4. Figure + Caption (pod hero visual)

**Kiedy:** podnosi hero visual z „zdjęcia" do „figury w artykule".

**HTML:**
```html
<figure class="hero-figure">...</figure>
<figcaption class="hero-caption">
  <span class="hero-caption-title">FIG. 01 — Paromia Handheld</span>
  <span class="hero-caption-meta">Nº 2026 / Edition I</span>
</figcaption>
```

**CSS:**
```css
.hero-caption {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-top: 20px;
  font-size: 12px; color: var(--slate);
  letter-spacing: .02em;
}
.hero-caption-title {
  font-family: var(--font-editorial);
  font-size: 13px; letter-spacing: .28em; text-transform: uppercase;
  color: var(--ink);
}
```

---

## 5. Asymmetric Bento (różne rozmiary, nie grid 2×2)

**Kiedy:** Features section. ŁAMIE regularność — sygnał że strona jest zaprojektowana, nie złożona z template.

**HTML:**
```html
<div class="bento">
  <article class="tile t-hero">...</article>       <!-- 4 kol × 2 rzędy, ciemna -->
  <article class="tile t-tall">...</article>       <!-- 2 kol × 2 rzędy -->
  <article class="tile t-wide">...</article>       <!-- 4 kol × 1 rząd -->
  <article class="tile t-small">...</article>      <!-- 2 kol × 1 rząd -->
  <article class="tile t-small">...</article>      <!-- 2 kol × 1 rząd -->
  <article class="tile t-wide">...</article>       <!-- 4 kol × 1 rząd -->
</div>
```

**CSS:**
```css
.bento {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: minmax(240px, auto);
  gap: 20px;
}
.tile.t-hero  { grid-column: span 4; grid-row: span 2; min-height: 520px;
                background: var(--ink); color: var(--paper-2); padding: 64px; }
.tile.t-tall  { grid-column: span 2; grid-row: span 2; min-height: 520px; }
.tile.t-wide  { grid-column: span 4; }
.tile.t-small { grid-column: span 2; }

@media (max-width: 1024px) {
  .bento { grid-template-columns: repeat(2, 1fr); }
  .tile.t-hero, .tile.t-tall, .tile.t-wide, .tile.t-small {
    grid-column: span 2; grid-row: auto; min-height: auto;
  }
}
@media (max-width: 768px) {
  .bento { grid-template-columns: 1fr; }
  .tile { grid-column: span 1 !important; }
}
```

Jedna karta hero (duża, ciemna, ze WIELKĄ liczbą w Fraunces italic) — to signature.

---

## 6. Spec Sheet (arkusz specyfikacji, ciemne tło)

**Kiedy:** dla produktów tech/AGD/premium. Sygnalizuje „inżynieria", nie „dropshipping".

**HTML:**
```html
<section class="specsheet">
  <div class="container">
    <div class="spec-grid">
      <div>
        <div class="eyebrow">Nº 05 — Arkusz Specyfikacji</div>
        <h2>Wszystko,<br>co zbudowaliśmy <em>pod spodem.</em></h2>
        <a href="#zamow" class="btn btn-gold">Zamów od 249 zł →</a>
      </div>
      <div class="spec-table">
        <div class="spec-row">
          <span class="spec-key">Czas nagrzewania</span>
          <span class="spec-val"><em>&lt; 26</em> sekund<small>Boosting 30 kPa aktywuje się natychmiast</small></span>
        </div>
        <div class="spec-row">
          <span class="spec-key">Ciśnienie pary</span>
          <span class="spec-val"><em>30</em> kPa / 24 g/min<small>3× więcej niż standardowe parownice</small></span>
        </div>
        <!-- ... -->
      </div>
    </div>
  </div>
</section>
```

**CSS:**
```css
.specsheet {
  padding: var(--sec) 0; background: var(--ink); color: var(--paper-2);
}
.specsheet .eyebrow { color: var(--gold); }
.specsheet h2 { color: var(--paper-2); }
.specsheet h2 em { color: var(--gold); font-style: italic; font-weight: 300; }

.spec-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 80px; align-items: start; }

.spec-row {
  display: grid; grid-template-columns: 1fr 1.2fr; gap: 24px;
  padding: 22px 0;
  border-bottom: 1px solid rgba(245,241,234,.08);
  align-items: baseline;
}
.spec-row:first-child { border-top: 1px solid rgba(245,241,234,.16); }
.spec-row:last-child { border-bottom: 1px solid rgba(245,241,234,.16); }
.spec-key {
  font-family: var(--font-editorial);
  font-size: 12px; letter-spacing: .28em; text-transform: uppercase;
  color: rgba(245,241,234,.55);
}
.spec-val {
  font-family: var(--font-display);
  font-size: 19px; font-weight: 400;
  color: var(--paper-2); letter-spacing: -.01em;
}
.spec-val em { color: var(--gold); font-style: italic; font-weight: 300; }
.spec-val small {
  display: block;
  font-family: var(--font-body); font-size: 12px;
  color: rgba(245,241,234,.5);
  margin-top: 4px; letter-spacing: 0;
}
```

---

## 7. Hero Spec Stack — DESKTOP absolute + MOBILE static (dual bank)

**Kiedy:** gdy masz „floating" spec badges nad hero visualem — MUSISZ mieć drugą wersję dla mobile.

**HTML (UWAGA — dwa banki):**
```html
<div class="hero-visual">
  <figure class="hero-figure">
    <div class="hero-placeholder-ph">...</div>
    <!-- DESKTOP: absolute floating nad figurą -->
    <div class="hero-spec-stack">
      <div class="hero-spec"><strong>26″</strong><span>do gotowości</span></div>
      <div class="hero-spec"><strong>30 kPa</strong><span>ciśnienie pary</span></div>
      <div class="hero-spec"><strong>730 g</strong><span>waga w dłoni</span></div>
    </div>
  </figure>
  <!-- MOBILE: static pod figurą -->
  <div class="hero-spec-stack-mobile">
    <div class="hero-spec"><strong>26″</strong><span>do gotowości</span></div>
    <div class="hero-spec"><strong>30 kPa</strong><span>ciśnienie pary</span></div>
    <div class="hero-spec"><strong>730 g</strong><span>waga w dłoni</span></div>
  </div>
</div>
```

**CSS:**
```css
.hero-spec-stack {
  position: absolute; bottom: 48px; left: 28px;
  display: flex; flex-direction: column; gap: 16px; z-index: 2;
}
.hero-spec {
  background: rgba(250,247,242,.94);
  backdrop-filter: blur(10px);
  padding: 14px 20px;
  display: flex; align-items: baseline; gap: 12px;
  border-left: 2px solid var(--primary);
}
.hero-spec strong {
  font-family: var(--font-display);
  font-size: 26px; font-weight: 500; color: var(--ink);
  line-height: 1; letter-spacing: -.02em;
}
.hero-spec span {
  font-family: var(--font-editorial);
  font-size: 11px; letter-spacing: .25em; text-transform: uppercase; color: var(--slate);
}

.hero-spec-stack-mobile { display: none; }

@media (max-width: 768px) {
  .hero-figure .hero-spec-stack { display: none; }
  .hero-spec-stack-mobile {
    display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;
    margin-top: 16px;
  }
  .hero-spec-stack-mobile .hero-spec {
    padding: 10px 8px; flex-direction: column; align-items: flex-start; gap: 2px;
    background: var(--paper-2); border: 1px solid var(--rule);
    border-left: 2px solid var(--primary);
  }
  .hero-spec-stack-mobile .hero-spec strong { font-size: 18px; }
  .hero-spec-stack-mobile .hero-spec span { font-size: 9px; letter-spacing: .18em; }
}
```

---

## 8. Ritual / How It Works — trzy akty z linią łączącą

**Kiedy:** zamiast zwykłych 3 kart z ikonami — timeline z rzymskimi numerami i linią horyzontalną.

**HTML:**
```html
<div class="ritual-steps">
  <div class="ritual-step">
    <div class="ritual-num">Akt <span>i</span></div>
    <div class="ritual-badge">I</div>
    <h3>Napełnij. <em>Włącz.</em></h3>
    <p>...</p>
  </div>
  <div class="ritual-step">
    <div class="ritual-num">Akt <span>ii</span></div>
    <div class="ritual-badge">II</div>
    <h3>Prasuj <em>pionowo</em>.</h3>
    <p>...</p>
  </div>
  <div class="ritual-step">
    <div class="ritual-num">Akt <span>iii</span></div>
    <div class="ritual-badge">III</div>
    <h3>Wyjdź <em>gotowy(a)</em>.</h3>
    <p>...</p>
  </div>
</div>
```

**CSS:**
```css
.ritual-steps {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 48px;
  position: relative;
}
.ritual-steps::before {
  content: "";
  position: absolute;
  top: 110px; left: 10%; right: 10%;
  height: 1px;
  background: linear-gradient(to right,
    transparent 0%, var(--rule-strong) 20%, var(--rule-strong) 80%, transparent 100%);
}
.ritual-badge {
  width: 56px; height: 56px; margin: 0 auto 36px;
  border-radius: 50%; background: var(--paper-2);
  border: 1px solid var(--primary);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  font-size: 22px; font-weight: 400; font-style: italic;
  color: var(--primary); position: relative; z-index: 2;
}
.ritual-badge::before {
  content: ""; position: absolute; inset: -8px;
  border: 1px solid var(--rule); border-radius: 50%;
}
```

---

## 9. Comparison — editorial split (POPRZEDNI WIEK vs NOWY STANDARD)

**Kiedy:** zamiast checkmark-table — pełna narracja obok list cech.

**HTML:**
```html
<div class="compare-grid">
  <div class="compare-col tradition">
    <span class="compare-label">Poprzedni wiek</span>
    <h3 class="compare-title">Żelazko i deska</h3>
    <p class="compare-body">Rytuał z czasów, gdy poranek zaczynał się od rozkładania sprzętu...</p>
    <ul class="compare-list">
      <li><span class="li-key">Start</span><span class="li-val">3–5 minut</span></li>
      <li><span class="li-key">Setup</span><span class="li-val">Deska, kabel, ręcznik</span></li>
      <!-- ... -->
    </ul>
  </div>
  <div class="compare-col paromia">
    <span class="compare-label">Nowy standard</span>
    <h3 class="compare-title"><em>Paromia</em> Handheld</h3>
    <p class="compare-body">Para pod ciśnieniem, ceramiczna stopa, wszystko w dłoni...</p>
    <ul class="compare-list">
      <li><span class="li-key">Start</span><span class="li-val"><strong>26 sekund</strong></span></li>
      <!-- ... -->
    </ul>
  </div>
</div>
```

**Zasada:** LEWA kolumna (tradition) → wszystko szare/faded/italic. PRAWA (brand) → akcenty koloru primary na kluczowych liczbach. **NIGDY** ✓/✗.

---

## 10. Placeholder z briefem dla fotografa (4 pola)

**Kiedy:** wszędzie gdzie brakuje produktu. Każdy placeholder MUSI mówić klientowi co dokładnie wstawić.

**HTML:**
```html
<div class="ph-box">
  <div class="ph-mark">P</div>
  <div class="ph-title">Fotografia produktowa</div>
  <div class="ph-size">Paromia Handheld · 1200 × 1500</div>
  <div class="ph-note">Neutralne tło (ivory/paper). Orientacja pionowa 4:5, przycięte ciasno. Światło miękkie, boczne, cień z lewej.</div>
</div>
```

**CSS:**
```css
.ph-box {
  position: absolute; inset: 20px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 24px; color: var(--slate);
  background:
    repeating-linear-gradient(45deg,
      transparent 0px, transparent 20px,
      rgba(var(--primary-rgb), .03) 20px,
      rgba(var(--primary-rgb), .03) 21px);
}
.ph-mark {
  font-family: var(--font-editorial);
  font-size: 80px; color: var(--primary);
  opacity: .28; line-height: 1;
}
.ph-title {
  font-family: var(--font-display);
  font-size: 28px; font-weight: 400; font-style: italic;
  color: var(--ink);
}
.ph-size {
  font-family: var(--font-editorial);
  font-size: 12px; letter-spacing: .32em; text-transform: uppercase;
  color: var(--slate);
}
.ph-note {
  font-size: 12px; color: var(--slate-2);
  max-width: 240px; text-align: center;
  line-height: 1.5; margin-top: 12px;
}
```

**Zawsze 4 pola:**
1. **Mark** — ikona lub inicjał marki (wizualny anchor)
2. **Title** — co to jest („Fotografia produktowa", „Hero image", „Lifestyle shot")
3. **Size** — dokładne wymiary px i aspect ratio
4. **Note** — instrukcja dla fotografa (tło, ton, światło, kadrowanie)

---

## 11. Fade-in safe (z JS gate'em)

**Kiedy:** ZAWSZE. To jest krytyczne — patrz KRYTYCZNE LEKCJE w `02-generate.md`.

**Head:**
```html
<script>document.documentElement.classList.add('js')</script>
```

**CSS:**
```css
html.js .fade-in {
  opacity: 0; transform: translateY(30px);
  transition: opacity .9s cubic-bezier(.22,1,.36,1), transform .9s cubic-bezier(.22,1,.36,1);
}
html.js .fade-in.visible { opacity: 1; transform: translateY(0); }
```

**JS:**
```js
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  }), { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.fade-in').forEach(el => io.observe(el));
  setTimeout(() =>
    document.querySelectorAll('.fade-in:not(.visible)').forEach(el => el.classList.add('visible')),
  2500);
} else {
  document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
}
```

---

## 12. Editorial color palette (premium/luxury)

**Kiedy:** kierunek Editorial/Luxury. **NIGDY** #FFFFFF / #000000 / #FF0000.

```css
:root {
  --ink:       #1A1A1F;              /* ciemny z nutą granatu */
  --ink-2:     #2F2F36;
  --slate:     #6B6B73;
  --slate-2:   #9A9AA2;
  --rule:      rgba(26,26,31,.08);
  --rule-strong: rgba(26,26,31,.16);

  --paper:     #F5F1EA;              /* bone ivory */
  --paper-2:   #FAF7F2;              /* lighter paper */
  --paper-3:   #EEE8DE;              /* darker ivory */

  --primary:   #1E6F7A;              /* brand primary */
  --gold:      #C9A961;              /* rare luxury accent */

  --sh-sm: 0 1px 2px rgba(26,26,31,.04);
  --sh-md: 0 10px 30px rgba(26,26,31,.06);
  --sh-lg: 0 24px 60px rgba(26,26,31,.08), 0 8px 20px rgba(30,111,122,.04);
  --sh-xl: 0 40px 90px rgba(26,26,31,.1),  0 14px 28px rgba(30,111,122,.06);
}
```

**Zasady:**
- Ink (ciemne) ma nutę kolorystyczną (granat/burgund), NIE pure black
- Paper (jasne) ma ciepło lub chłód, NIE pure white
- Shadows mają domieszkę primary (nie czysty rgba(0,0,0))
- Primary występuje w <10% powierzchni (luksus = rzadkie akcenty, nie kolorowy bałagan)

---

## 13. Typography stack — Fraunces + Cormorant Garamond + Inter

**Kiedy:** kierunek Editorial/Luxury. Fraunces ma `font-variation-settings` dla `opsz` i `SOFT` — wykorzystaj.

> ⚠️ **Nie używaj `Italiana`** — ma uszkodzony glif polskiej „Ł" w uppercase
> (kreska wystaje ponad literę). Zamiennik: Cormorant Garamond (ten sam
> editorial feel, poprawne PL diakrytyki).

**Head:**
```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,300;1,9..144,400&family=Inter:wght@300;400;500;600;700&family=Cormorant+Garamond:wght@300;400;500&display=swap&subset=latin-ext" rel="stylesheet">
```

**CSS:**
```css
:root {
  --font-display:   'Fraunces', Georgia, serif;
  --font-editorial: 'Cormorant Garamond', 'Didot', serif;  /* NIE Italiana */
  --font-body:      'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

h1, h2, h3, h4 {
  font-family: var(--font-display);   /* Fraunces */
  font-weight: 500; line-height: 1.02;
  letter-spacing: -.025em; color: var(--ink);
  font-variation-settings: "opsz" 144, "SOFT" 30;
}
h1 em, h2 em, h3 em {
  font-style: italic; font-weight: 400;
  font-variation-settings: "opsz" 144, "SOFT" 80;  /* KLUCZOWE — italiki z SOFT 80 wyglądają rzeźbiarsko */
}
```

**Reguła kciuka:** oversize headline'y (>80px), ciasne letter-spacing (-.03em), italic dla 1–2 słów akcentowych (nie całych zdań).

---

## 14. Color-changing shadow (hover z kolorem primary)

**Kiedy:** karty, buttony — zamiast pure black shadow.

```css
:root {
  --sh-primary: 0 8px 32px rgba(var(--primary-rgb), .25);
  --sh-gold:    0 18px 50px rgba(201,169,97,.28);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--sh-lg);              /* kolorowa shadow, nie czarna */
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--sh-primary);
}
```

---

## 15. Trust Strip — inline-flex bez łamania linii

**Kiedy:** pod hero, zwykle ciemny pasek z 4–5 itemami: `strong · span`.

**KRYTYCZNE**: bez `white-space:nowrap` na dzieciach flex, na mobile każda
część (`strong`, `em`, `span`) ląduje w osobnej linii — rozjazd 3 linie per item.

**HTML:**
```html
<section class="trust-strip">
  <div class="container">
    <div class="trust-item">
      <strong>30 dni</strong> <em>·</em> <span>na zwrot bez pytań</span>
    </div>
    <div class="trust-divider"></div>
    <div class="trust-item">
      <strong>Darmowa dostawa</strong> <em>·</em> <span>InPost · DPD · kurier</span>
    </div>
    <!-- ... -->
  </div>
</section>
```

**CSS (OBOWIĄZKOWY wzorzec):**
```css
.trust-strip { background: var(--ink); color: var(--paper-2); padding: 32px 0; }

.trust-strip .container {
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 20px;
}

.trust-item {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: nowrap;            /* KRYTYCZNE — bez tego łamie się */
  white-space: nowrap;
  font-family: var(--font-body); font-size: 13px;
  color: rgba(245,241,234,.85);
}
.trust-item strong {
  font-family: var(--font-editorial);
  font-size: 12px; letter-spacing: .2em;
  text-transform: uppercase;
  color: var(--paper-2); font-weight: 400;
  white-space: nowrap;          /* KRYTYCZNE */
}
.trust-item span { white-space: nowrap; font-size: 12px; }
.trust-item em { font-style: normal; color: var(--gold); font-size: 12px; }

.trust-divider {
  width: 1px; height: 20px;
  background: rgba(245,241,234,.2);
  flex-shrink: 0;
}

/* Mobile: 5 itemów pod sobą, każdy w 1 linii */
@media (max-width: 900px) {
  .trust-strip .container {
    flex-direction: column; justify-content: center; align-items: center;
    gap: 12px;
  }
  .trust-divider { display: none; }
  .trust-item strong, .trust-item span, .trust-item em { font-size: 11px; }
}

@media (max-width: 420px) {
  .trust-item strong, .trust-item span, .trust-item em {
    font-size: 10px; letter-spacing: .16em;
  }
}
```

**Anti-pattern (NIE RÓB):**
- ❌ `.trust-item { display: flex }` bez `flex-wrap: nowrap` na mobile → każdy element w osobnej linii
- ❌ Strong/span bez `white-space: nowrap` → łamią się w połowie słowa

---

## 16. Layout Discipline (image-box fit)

**Przeniesione do** [`04-design.md`](../04-design.md) sekcja **„G. Layout Discipline"** — to zestaw reguł obowiązkowych, nie snippet signature. Tam znajdziesz 5 zasad + anti-patterns.

---

## 17. Split Headline Reveal (char-by-char staggered)

**Kiedy:** hero H1 — subtelny editorial reveal na load. Kinfolk / Aesop vibe.

**HTML:**
```html
<h1 class="hero-headline js-split">Panoramiczny widok, <em>wolny weekend</em>.</h1>
```

**CSS (gated behind `html.js`):**
```css
html.js .split-char{
  display:inline-block;opacity:0;
  transform:translateY(30%) rotate(2deg);
  transition:opacity .9s cubic-bezier(.22,1,.36,1),transform .9s cubic-bezier(.22,1,.36,1);
}
html.js .split-char.visible{opacity:1;transform:translateY(0) rotate(0)}
html.js .split-word{display:inline-block;white-space:nowrap}
@media (prefers-reduced-motion: reduce){
  html.js .split-char,html.js .split-char.visible{opacity:1;transform:none;transition:none}
}
```

**JS:**
```js
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('.js-split').forEach(h => {
  const walk = (node) => {
    if (node.nodeType === 3) {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(word => {
        if (/^\s+$/.test(word)) { frag.appendChild(document.createTextNode(word)); return; }
        const ws = document.createElement('span'); ws.className = 'split-word';
        [...word].forEach(ch => {
          const s = document.createElement('span'); s.className = 'split-char'; s.textContent = ch;
          ws.appendChild(s);
        });
        frag.appendChild(ws);
      });
      node.parentNode.replaceChild(frag, node);
    } else if (node.nodeType === 1) [...node.childNodes].forEach(walk);
  };
  walk(h);
});
if (!reducedMotion) {
  requestAnimationFrame(() => {
    document.querySelectorAll('.js-split .split-char').forEach((c, i) => {
      c.style.transitionDelay = (i * 22) + 'ms';
      setTimeout(() => c.classList.add('visible'), 200);
    });
  });
} else {
  document.querySelectorAll('.split-char').forEach(c => c.classList.add('visible'));
}
```

**Kluczowe detale:**
- Podział na WORDS (owijane w `.split-word` z `white-space:nowrap`) żeby zapobiec łamaniu słowa w środku
- CHARS dostają `opacity:0 + translateY + rotate(2deg)` → czytelne „pojawianie się" z lekkim tilt
- Delay 22ms per char + staggered delay (word-by-word też działa)
- `<em>` nested zachowuje się poprawnie (walk przez childNodes)

**Anti-pattern:** char delay > 50ms per char — widz się nudzi. Trzymaj 15-25ms.

---

## 18. Number Counter (liczby animowane od 0 do target)

**Kiedy:** hero stats (3-4 kluczowe liczby), offer savings, porównanie.

**HTML:**
```html
<div class="hero-stat-value">
  <span class="js-counter" data-target="5800" data-suffix=" Pa">0 Pa</span>
</div>
```

**CSS:**
```css
html.js .js-counter{display:inline-block;font-variant-numeric:tabular-nums}
/* tabular-nums — liczby mają stałą szerokość, nie skaczą podczas animacji */
```

**JS:**
```js
const counters = document.querySelectorAll('.js-counter');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const animateCounter = (el) => {
  if (el.dataset.animated) return;
  el.dataset.animated = '1';
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  if (reducedMotion) { el.textContent = target.toLocaleString('pl-PL').replace(/,/g, ' ') + suffix; return; }
  const duration = 1400;
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);  // easeOutCubic
    el.textContent = Math.round(target * eased).toLocaleString('pl-PL').replace(/,/g, ' ') + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const cio = new IntersectionObserver(
  es => es.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); cio.unobserve(e.target); } }),
  { threshold: 0.5 }
);
counters.forEach(c => cio.observe(c));
```

**Kluczowe detale:**
- `data-target` + `data-suffix` oddzielone — łatwa modyfikacja bez dotykania JS
- `.toLocaleString('pl-PL').replace(/,/g, ' ')` → `5 800 Pa` (polska konwencja separator tysięcy = spacja)
- `threshold: 0.5` — counter odpala gdy 50% elementu widoczne, nie przy 0%
- `dataset.animated` guard — counter nie odpala się 2× przy ponownym scroll

---

## 19. Magnetic CTA Button (kursor subtelnie przyciąga button)

**Kiedy:** primary CTA w hero + offer + final CTA. Dodaje „życia" buttonowi bez krzyczenia.

**HTML:**
```html
<a href="#offer" class="btn btn-primary magnetic">Zamów</a>
```

**CSS:**
```css
html.js .magnetic{transition:transform .3s cubic-bezier(.22,1,.36,1)}
@media (prefers-reduced-motion: reduce){
  html.js .magnetic{transform:none!important}
}
```

**JS:**
```js
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reducedMotion && matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) * 0.18;
      const dy = (e.clientY - r.top - r.height / 2) * 0.18;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}
```

**Kluczowe detale:**
- `(hover: hover)` media query — NIE odpala się na touch (telefon, tablet — tam magnetic drażni)
- Factor `0.18` — button rusza się max 18% odległości kursora od środka. Więcej (>0.3) = za „skakający"
- `transition .3s` na `transform` — smooth kiedy kursor wychodzi z buttonu
- Działa też na `<button>` i `<a>` — dodaj klasę `.magnetic` gdziekolwiek

---

## 20. Tile 3D Tilt (subtle rotateX/Y na mouse)

**Kiedy:** bento tiles, karty feature, karty pricing — dodaje głębi bez flashy.

**KRYTYCZNE:** max 4° tilt. Większe (8°+) = playful/toy direction, nie Editorial.

**HTML:**
```html
<div class="tile">
  <div class="tile-body">...</div>
  <div class="tile-figure"><img src="..." alt="..."></div>
</div>
```

**CSS:**
```css
html.js .tile{will-change:transform}
html.js .tile.tilt-active{transition:transform .08s linear}
/* tilt-active — podczas hover, szybkie mikrotransitions */
```

**JS:**
```js
if (!reducedMotion && matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.tile:not(.tile-hero)').forEach(tile => {
    tile.addEventListener('mouseenter', () => tile.classList.add('tilt-active'));
    tile.addEventListener('mousemove', (e) => {
      const r = tile.getBoundingClientRect();
      const rx = ((e.clientY - r.top - r.height / 2) / r.height) * -4;
      const ry = ((e.clientX - r.left - r.width / 2) / r.width) * 4;
      tile.style.transform = `translateY(-6px) perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    tile.addEventListener('mouseleave', () => {
      tile.classList.remove('tilt-active');
      tile.style.transform = '';
    });
  });
}
```

**Kluczowe detale:**
- `translateY(-6px)` zachowany z baseline hover — tilt się KUMULUJE z liftem
- `perspective(900px)` — im większe, tym subtelniejszy tilt. 500px = dramatic, 900-1200px = Editorial
- `tilt-active` class zmienia transition na szybki 0.08s podczas mouse-move — smoother
- Bez `tilt-active` w CSS, standardowe `transition: transform .5s` powodowałoby laggy ruch
- Wyjątek dla `.tile-hero` (featured banner) — tilt tam wygląda dziwnie bo karta jest 2-col wide

---

## 21. Scroll Parallax Editorial Numerals

**Kiedy:** oversized numerals w hero / finale / sekcjach — unoszą się z scroll, dodają depth.

**HTML:**
```html
<section class="hero">
  <div class="hero-numeral" aria-hidden="true">5800<sup>Pa</sup></div>
  ...
</section>
```

**JS:**
```js
const parallaxEls = [
  { el: document.querySelector('.hero-numeral'), speed: 0.18, baseRotate: -3 },
  { el: document.querySelector('.finale-numeral'), speed: 0.12, baseRotate: 0 },
].filter(x => x.el);
if (parallaxEls.length && !reducedMotion) {
  let ticking = false;
  const apply = () => {
    const y = window.scrollY;
    parallaxEls.forEach(({el, speed, baseRotate}) => {
      const rect = el.getBoundingClientRect();
      const midpoint = y + rect.top + rect.height / 2;
      const delta = (y + window.innerHeight / 2 - midpoint) * speed;
      // Special handling dla finale-numeral (która jest centered przez translate(-50%,-50%))
      const translate = el.classList.contains('finale-numeral')
        ? `translate(-50%, calc(-50% + ${delta}px))`
        : `translateY(${delta}px)`;
      el.style.transform = `${translate} rotate(${baseRotate}deg)`;
    });
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(apply); ticking = true; }
  }, { passive: true });
  apply();
}
```

**Kluczowe detale:**
- `speed` 0.1-0.2 (hero) vs 0.08-0.12 (finale) — im niżej na stronie, tym wolniejsze
- `requestAnimationFrame` + `ticking` flag — nie spamujemy `scroll` event
- `{ passive: true }` — browser hint że scroll nie jest blokowany
- Zachowuje `baseRotate` (np. hero tilted -3°) — parallax kumuluje się z rotate

---

## 22. Shape Constraint (MATCH PRODUCT REFERENCE EXACTLY)

**Kiedy:** każdy prompt do `generate-image` z `reference_images:[{type:"product"}]` — bez tego Gemini 3 Pro Image Preview „interpretuje" kształt produktu zamiast go kopiować.

**Problem który rozwiązuje:** Gemini zna produkty konkurencji (Ecovacs, Dyson, Hobot, Philips Senseo) i domyślnie „poprawia" kształt do takiego jaki model ma w głowie. Rezultat: landing klienta pokazuje OWALNY robot zamiast PROSTOKĄTNEGO (Vitrix lekcja), lub parownicę z ekranem LCD którego nie ma.

**Wzorzec (prefix prompta, ZAWSZE na początku):**
```
MATCH THE PRODUCT IN REFERENCE IMAGE EXACTLY — do not redesign or modify shape.
Product: [GEOMETRIA — rectangular/oval/circular/cylindrical],
[GŁÓWNY ELEMENT FRONTALNY — co dominuje wizualnie],
[BOCZNE/TYLNE ELEMENTY — konkretne opisy],
[MATERIAŁY + KOLORY tylko z referencji, nic dodanego].

[DALSZA TREŚĆ SCENY — kto, gdzie, co robi]
```

**Przykład (Vitrix tile-hero v2 — uratował generację):**
```
MATCH THE PRODUCT IN REFERENCE IMAGE EXACTLY — do not redesign or modify shape.
Product: rectangular white plastic body with rounded corners (not oval,
not circular overall), a single LARGE central silver-white circular motor
disc dominating the front face, two gray fabric microfiber pads mounted on
the back, black rubber side seals, small physical button below the disc.

Macro product detail: the exact Vitrix robot from reference image shown in
close-up at 45-degree angle, pressed against a large panoramic glass pane...
```

**Kiedy ZAWSZE używać:**
- Produkt ma nietypowy kształt (Gemini nie widział podobnego)
- Poprzednia generacja wygenerowała inny kształt
- Produkt ma specyficzne detale (liczba LED, kształt przycisku, liczba portów)
- Prompt przekracza 50 słów — model zapomina referencję bez explicit constraint

**Kiedy pomijać:** flat-lay offer packshot (tam każda pozycja produktu = OK), persona portraits (produkt nie jest w kadrze).

**Anti-pattern:**
- ❌ Dodawanie fikcyjnych funkcji „żeby wyglądał bardziej tech" (LED, porty USB których nie ma)
- ❌ Kopiowanie opisu z marketingowej broszury (zawiera slogany, nie geometrię)
- ❌ „Product similar to Dyson" — model ucieknie do Dysona

**Pro tip:** Uruchom generację bez shape constraint pierwszy raz. Jeśli kształt pasuje → pomiń constraint dla kolejnych. Jeśli drift → wszystkie kolejne mają constraint.

---

## Kiedy NIE używać tych patternów

- **Sportowa/tech/gaming** marka → kierunek retro-futuristic, brutalist. Te patterny są za „miękkie".
- **Dziecięca/pet-care** marka → kierunek playful. Oversized numeral wygląda zbyt poważnie.
- **Food & beverage** → kierunek organic. Użyj miękkich fluid shapes, nie ostrych dividerów.

Patrz `04-design.md` → „Wybór kierunku estetycznego".
