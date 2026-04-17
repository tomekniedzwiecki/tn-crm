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

**Kiedy:** ZAWSZE. To jest krytyczne — patrz KRYTYCZNE LEKCJE w `CLAUDE_LANDING_PROCEDURE.md`.

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

## 16. Dyscyplina obrazów w boxach (IMAGE-BOX FIT) — krytyczny pattern

**Dlaczego osobny pattern:** „zdjęcia nie mieszczą się w boxach" to najczęstszy widoczny bug landing pages. Ucięte krawędzie, puste komórki grida, rozjechane proporcje, figura za mała vs kafelka — to rzuca się klientowi w oczy bardziej niż typografia.

### Zasada 1 — Policz komórki grida ZANIM napiszesz pierwszą kafelkę

Bento z asymetrycznie powiększoną kartą to klasyczna pułapka.

**Formuła:**
```
liczba_tiles × 1  +  Σ(span_extra każdej tile) = pełna liczba komórek grida
```

**Przykład złego layoutu:** 3 kolumny, 4 tiles, jedna ma `grid-column:span 2; grid-row:span 2` (zajmuje 4 komórki). 4 tiles = 3 normalne (po 1) + 1 featured (4) = 7 komórek z 3×3=9 → **2 puste = widoczne dziury**.

**Dobre layouty dla 4 tiles z jedną featured:**

| Wariant | Układ | Komórek |
|---|---|---|
| **Banner top (3-col)** | hero `grid-column:1/-1` (row 1), 3 tiles row 2 | 3+3=6 |
| **Zebra (2-col)** | hero span 2 row 1, 2 tiles row 2, 4. tile span 2 row 3 | 2+2+2=6 |
| **L-shape (2-col)** | hero span 2 row 1, 2 tiles row 2, 1 tile span 2 row 3 | 2+2+2=6 |

Przed kodowaniem zrób rysunek ASCII:
```
┌──────────────────┐
│ HERO (span 1/-1) │  row 1
├─────┬─────┬──────┤
│ T2  │ T3  │  T4  │  row 2 — perfect fill
└─────┴─────┴──────┘
```

### Zasada 2 — aspect-ratio dopasowany do orientacji zdjęć

**Nigdy nie wymuszaj jednego aspect-ratio globalnie.** Dostosuj do typu zdjęć w sekcji.

| Typ zdjęcia | aspect-ratio | Dlaczego |
|---|---|---|
| Produkt packshot | `1/1` lub `4/5` | Symetria, eliminuje cropping |
| Produkt w użyciu / lifestyle | `4/3` lub `16/10` | Krajobraz, osoba + kontekst |
| Przekrój techniczny | `1/1` | Symetria, centered |
| Hero / banner | `16/9` lub `21/9` | Cinematograficzne |
| Portret persony | `4/5` | Pionowy, twarz + ramiona w kadrze |
| How-it-works krok | `4/3` | Instruktaż |

**Anti-pattern:** `aspect-ratio: 16/10` dla zdjęcia portretowego 4/5 + `object-fit:cover` → cropujesz twarz do pasa. Rozwiązanie: dopasuj aspect-ratio boxa do zdjęcia, nie odwrotnie.

### Zasada 3 — `object-fit:cover` ZAWSZE razem z `object-position`

```css
.tile-figure img {
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: center;  /* decyduje CO zostaje w kadrze przy cropowaniu */
}
```

| Pozycja | Kiedy |
|---|---|
| `center` | Packshoty, lifestyle krajobrazowy, domyślne |
| `center top` | Portrety (głowa zawsze w kadrze), produkty pionowe |
| `center 40%` | Produkty w użyciu (twarz nad akcją) |
| `center bottom` | Gdy ważna jest podstawa / detal dolny |

### Zasada 4 — separacja `tile-body` + `tile-figure` flexem (nieświadoma wyrównywaczka wysokości)

Kafelki mają różne długości tekstu. Bez wyrównania figury pływają na różnych wysokościach → wygląda niechlujnie.

**HTML:**
```html
<div class="tile">
  <div class="tile-body">
    <div class="tile-num">A.01</div>
    <h3>Title</h3>
    <p>Body — dowolnej długości.</p>
  </div>
  <div class="tile-figure">
    <img src="..." alt="...">
  </div>
</div>
```

**CSS:**
```css
.tile { display:flex; flex-direction:column; height:100% }
.tile-body { padding:32px; flex:1 }   /* rośnie, wypełnia wolną przestrzeń */
.tile-figure {
  aspect-ratio: 4/3;
  background: var(--paper-3);
  border-top: 1px solid var(--rule);
}
.tile-figure img { width:100%; height:100%; object-fit:cover; object-position:center }
```

**Efekt:** wszystkie figury wyrównane na dnie. Tekst rośnie, figura stała.

### Zasada 5 — tile-hero (featured) ma wewnętrzny grid 2-kolumnowy

Gdy kafelka zajmuje 2+ kolumn, **nie rób z niej pionowej** (tekst-nad-figurą na całej szerokości wygląda jak zwykła kafelka przeciągnięta). Zrób wewnętrzny 2-col grid: tekst lewo, figura prawo.

```css
.tile.tile-hero {
  grid-column: 1 / -1;                     /* full width w zewn. gridzie */
  display: grid; grid-template-columns: 1fr 1fr;
  padding: 0;                              /* wewn. body/figure mają swój padding */
  min-height: 380px;
}
.tile.tile-hero .tile-body { padding:56px; display:flex; flex-direction:column; justify-content:center }
.tile.tile-hero .tile-figure {
  margin: 0;
  aspect-ratio: auto;                      /* wypełnia wysokość grida */
  height: 100%; min-height: 380px;
  border-top: 0;
  border-left: 1px solid var(--rule);
}

@media (max-width:900px) {
  .tile.tile-hero { grid-template-columns: 1fr; min-height: 0 }
  .tile.tile-hero .tile-figure {
    order: -1;                             /* na mobile figura na górze */
    aspect-ratio: 16/10;                   /* wracamy do fixed ratio */
    height: auto; min-height: 0;
    border-left: 0;
    border-bottom: 1px solid var(--rule);
  }
}
```

### Anty-wzorce (NIE RÓB)

| ❌ Złe | ✅ Dobre |
|---|---|
| Bento 3-col z hero spans 2×2 + 3 zwykłe tiles → 2 puste komórki | Policz tiles × span przed CSS, wybierz układ bez dziur |
| Jeden globalny `aspect-ratio` dla wszystkich figure'ów | Per-sekcję (portret 4/5, packshot 1/1, lifestyle 16/10) |
| `object-fit: cover` bez `object-position` | Zawsze parą — position decyduje co zostaje po cropie |
| `tile-figure { aspect-ratio: 16/10 }` + tile-hero wysoki na 2 wiersze → figura dziwnie spłaszczona | Tile-hero: `aspect-ratio: auto; height:100%` (wypełnia grida) |
| `<img width="800" height="500">` gdy zdjęcie realnie 4/5 | Dopasuj `width/height` do realnej proporcji (CLS + właściwy crop) |
| Kafelki bez `flex:1` na body → figury na różnych wysokościach | `tile-body { flex:1 }` wyrównuje automatycznie |

---

## Kiedy NIE używać tych patternów

- **Sportowa/tech/gaming** marka → kierunek retro-futuristic, brutalist. Te patterny są za „miękkie".
- **Dziecięca/pet-care** marka → kierunek playful. Oversized numeral wygląda zbyt poważnie.
- **Food & beverage** → kierunek organic. Użyj miękkich fluid shapes, nie ostrych dividerów.

Patrz `CLAUDE_LANDING_DESIGN.md` → „Wybór kierunku estetycznego".
