# Section Variants — biblioteka wariantów per sekcja

**Cel:** zamiast jednego układu każdej sekcji — bank wariantów, z którego Claude autonomicznie wybiera **jeden** per sekcja na bazie kategorii produktu + persony + price point.

**Zakres (Tier 1):** 3 sekcje × warianty = **22 snippety**
- **Hero:** 10 wariantów
- **Solution / Features:** 6 wariantów
- **Testimonials / Proof:** 6 wariantów

**Nie-warianty (Tier 3):** Offer box, Header, Footer, FAQ, Final CTA, Sticky CTA, Cookie Banner — te pozostają standardowe (patrz [`02-generate.md`](../02-generate.md)). Zmieniać je = ryzyko dla konwersji.

**Klasy CSS — konwencja:** każdy wariant zawiera w nagłówku **„Klasy wymagane"** — muszą być obecne żeby `verify-landing.sh` przeszedł. Resztę klas (lokalnych dla wariantu) możesz modyfikować.

---

# 1. HERO — 10 wariantów

## H1 — Split klasyczny (tekst + packshot)

**Kiedy:** default dla produktów fizycznych o standardowej prezentacji (AGD, sprzęt, tools). Bezpieczny wybór.

**Kategoria produktu:** wszystkie (default).
**Persona emotion:** neutral / desire.
**Price:** wszystkie.

**Klasy wymagane:** `<section class="hero">`, wewnątrz `class="... hero-figure hero-product"`.

```html
<section class="hero">
  <div class="container hero-grid">
    <div class="hero-left">
      <div class="eyebrow">[Marka] · [Kategoria]</div>
      <h1 class="js-split">[Headline 3-8 słów] <em>[kluczowe 2 słowa]</em>.</h1>
      <p class="hero-sub">[Subheadline 1-2 zdania, konkret + bezpieczeństwo].</p>
      <div class="hero-cta-row">
        <a href="#offer" class="btn-primary magnetic">Zamów [Marka] →</a>
        <a href="#how" class="btn-secondary">Zobacz jak działa</a>
      </div>
    </div>
    <div class="hero-right">
      <div class="hero-figure hero-product">
        <div class="ph">
          <div class="ph-mark">H</div>
          <div class="ph-title">Packshot produktu</div>
          <div class="ph-size">1200 × 1500</div>
          <div class="ph-note">Produkt na neutralnym tle, 3/4 od góry, naturalne światło.</div>
        </div>
      </div>
    </div>
  </div>
</section>
```

```css
.hero{padding:140px 0 80px;background:linear-gradient(180deg,#fff 0%,var(--paper) 100%)}
.hero-grid{display:grid;grid-template-columns:1.1fr 1fr;gap:64px;align-items:center}
.hero-figure{aspect-ratio:4/5;background:var(--paper);border-radius:20px;overflow:hidden}
@media(max-width:900px){.hero-grid{grid-template-columns:1fr;gap:32px}}
```

---

## H2 — Full-bleed lifestyle (zdjęcie na całą szerokość + overlay)

**Kiedy:** premium AGD w kontekście domu (Dyson, lifestyle appliances). Produkt żyjący w przestrzeni.

**Kategoria:** premium AGD, lifestyle appliance, home tech.
**Persona emotion:** desire / identity-seeking.
**Price:** mid-premium (800+).

**Klasy wymagane:** `<section class="hero">`, `class="... hero-figure hero-image"`.

```html
<section class="hero hero-fullbleed">
  <div class="hero-figure hero-image">
    <div class="ph">
      <div class="ph-mark">H</div>
      <div class="ph-title">Produkt w kontekście domu (lifestyle)</div>
      <div class="ph-size">2400 × 1200 (16:8, desktop full-width)</div>
      <div class="ph-note">Szeroki kadr: produkt w salonie/kuchni, naturalne światło. Osoba rozmyta w tle, używa produktu.</div>
    </div>
  </div>
  <div class="hero-overlay">
    <div class="container">
      <div class="hero-overlay-inner">
        <div class="eyebrow light">[Marka]</div>
        <h1 class="js-split">[Headline] <em>[kluczowe 2 słowa]</em>.</h1>
        <p class="hero-sub light">[Subheadline 1 zdanie].</p>
        <a href="#offer" class="btn-primary magnetic">Zamów [Marka] →</a>
      </div>
    </div>
  </div>
</section>
```

```css
.hero-fullbleed{position:relative;height:min(720px,90vh);padding:0;overflow:hidden}
.hero-fullbleed .hero-figure{position:absolute;inset:0;aspect-ratio:auto;border-radius:0}
.hero-fullbleed .hero-overlay{position:absolute;inset:0;display:flex;align-items:flex-end;padding-bottom:80px;background:linear-gradient(to top,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0) 50%)}
.hero-overlay-inner{max-width:640px;color:#fff}
.hero-overlay-inner h1{color:#fff;font-size:clamp(40px,5vw,64px)}
.hero-overlay-inner .eyebrow.light{color:rgba(255,255,255,0.75)}
.hero-overlay-inner .hero-sub.light{color:rgba(255,255,255,0.9)}
```

---

## H3 — Dashboard mockup split (phone/app UI + produkt)

**Kiedy:** smart home, tech z aplikacją, safety-focused device (Ring/Nest/Eight Sleep style). Klient kupuje KONTROLĘ.

**Kategoria:** smart home, health tech, IoT, safety device, app-controlled product.
**Persona emotion:** anxiety → reassurance, optimization.
**Price:** premium (1000+).

**Klasy wymagane:** `<section class="hero">`, `class="... hero-figure hero-mockup"`.

```html
<section class="hero">
  <div class="container hero-grid">
    <div class="hero-left">
      <div class="eyebrow">[Marka] · Smart series</div>
      <h1 class="js-split">[Headline] <em>[kluczowe]</em>.</h1>
      <p class="hero-sub">[Sub 1 zdanie: co kontrolujesz przez aplikację].</p>
      <div class="hero-cta-row">
        <a href="#offer" class="btn-primary magnetic">Zamów →</a>
        <a href="#how" class="btn-secondary">Zobacz aplikację</a>
      </div>
      <div class="hero-stats">
        <div class="hero-stat"><span class="hero-stat-num"><span class="js-counter" data-target="[N]">0</span></span><span class="hero-stat-label">[jednostka]</span></div>
        <div class="hero-stat"><span class="hero-stat-num">[N]</span><span class="hero-stat-label">[jednostka]</span></div>
      </div>
    </div>
    <div class="hero-right">
      <div class="hero-figure hero-mockup">
        <div class="hero-phone"><!-- Fake phone UI z 3-4 blokami statusu, Pa, bateria, postęp --></div>
        <div class="hero-device-ph">
          <div class="ph">
            <div class="ph-mark">H</div>
            <div class="ph-title">Produkt w akcji (bg)</div>
            <div class="ph-size">1200 × 1500</div>
            <div class="ph-note">Produkt wykonujący swoją funkcję w realnym otoczeniu, z telefonem w ręce użytkownika.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

```css
.hero-mockup{position:relative;min-height:520px}
.hero-phone{position:absolute;left:0;top:20px;width:55%;aspect-ratio:9/18;background:var(--ink);border-radius:32px;padding:10px;box-shadow:var(--shadow-lg);transform:rotate(-3deg);z-index:2}
.hero-device-ph{position:absolute;right:0;top:0;width:56%;aspect-ratio:3/4;z-index:1}
```

> Szczegółowa implementacja phone UI: patrz `landing-pages/glassnova/index.html` (referencyjny).

---

## H4 — Editorial numerał (monumentalna liczba tła)

**Kiedy:** produkty premium z jedną mocną liczbą specyfikacji (5600 Pa, 26 s, 30 kPa). Sygnalizuje inżynierię.

**Kategoria:** premium AGD, tech, editorial luxury.
**Persona emotion:** desire, connoisseur, identity-seeking.
**Price:** premium-luxury (1500+).

**Klasy wymagane:** `<section class="hero">`, `class="... hero-figure"`.

> Pełen snippet w [`patterns.md` #1 Oversized Editorial Numeral](patterns.md). Tu skrócona wersja:

```html
<section class="hero hero-numeral">
  <div class="hero-numeral-bg js-parallax" data-speed="0.15">5600<sup>Pa</sup></div>
  <div class="container hero-grid">
    <div class="hero-left">
      <div class="eyebrow">[Marka] · Edition I</div>
      <h1 class="js-split">[Headline] <em>[kluczowe]</em>.</h1>
      <p class="hero-sub">[Sub z referencją do liczby].</p>
      <a href="#offer" class="btn-primary magnetic">Zamów →</a>
    </div>
    <div class="hero-right">
      <div class="hero-figure hero-product">
        <div class="ph">
          <div class="ph-mark">H</div>
          <div class="ph-title">Packshot z naciskiem na detal</div>
          <div class="ph-size">1200 × 1500</div>
          <div class="ph-note">Produkt z dramatycznym światłem, detal na pierwszym planie (np. głowica, dysza).</div>
        </div>
      </div>
    </div>
  </div>
</section>
```

```css
.hero-numeral{position:relative;overflow:hidden}
.hero-numeral-bg{position:absolute;top:-40px;right:-20px;font-family:var(--font-display);font-size:clamp(280px,28vw,440px);line-height:.78;font-weight:300;font-style:italic;color:var(--paper-2);letter-spacing:-.04em;z-index:0;user-select:none}
.hero-numeral-bg sup{font-size:.22em;font-style:normal;font-family:var(--font-mono);letter-spacing:.1em;color:var(--muted);vertical-align:top}
.hero-numeral .hero-grid{position:relative;z-index:1}
```

---

## H5 — Oversized typography (headline wypełnia hero)

**Kiedy:** editorial/manifesto, food/drink DTC z mocnym ton-of-voice, marki których charakter = słowa (Graza, Aesop, Liquid Death).

**Kategoria:** food/drink DTC, editorial premium, lifestyle minimalist.
**Persona emotion:** identity-seeking, desire.
**Price:** wszystkie (copy-driven).

**Klasy wymagane:** `<section class="hero">`, `class="... hero-figure"` (zdjęcie mniejsze, poniżej headline).

```html
<section class="hero hero-oversized">
  <div class="container">
    <div class="eyebrow center">[Marka]</div>
    <h1 class="hero-oversized-h1 js-split">
      [HEADLINE JEDNA MONUMENTALNA LINIJKA 4-6 SŁÓW]<br>
      <em>[kluczowe dopowiedzenie kursywą]</em>
    </h1>
    <p class="hero-sub center">[Sub 1 zdanie, podaje kontekst].</p>
    <div class="hero-cta-row center">
      <a href="#offer" class="btn-primary magnetic">Zamów →</a>
    </div>
    <div class="hero-figure hero-image">
      <div class="ph">
        <div class="ph-mark">H</div>
        <div class="ph-title">Produkt hero (landscape)</div>
        <div class="ph-size">1600 × 800 (szerokie)</div>
        <div class="ph-note">Produkt w kadrze poziomym, pod headline. Minimalistyczne tło, duża przestrzeń.</div>
      </div>
    </div>
  </div>
</section>
```

```css
.hero-oversized{padding:160px 0 100px;text-align:center}
.hero-oversized-h1{font-family:var(--font-display);font-size:clamp(56px,9vw,128px);font-weight:400;line-height:0.95;letter-spacing:-0.03em;margin:24px auto 28px;max-width:1000px}
.hero-oversized .eyebrow.center{justify-content:center;margin:0 auto 16px}
.hero-oversized .hero-sub.center{text-align:center;max-width:520px;margin:0 auto 32px}
.hero-oversized .hero-cta-row.center{justify-content:center;margin-bottom:56px}
.hero-oversized .hero-figure{aspect-ratio:2/1;max-width:1100px;margin:0 auto;border-radius:20px;overflow:hidden}
```

---

## H6 — Persona portrait (osoba z produktem)

**Kiedy:** wellness, beauty, femtech, produkt osobisty. Klient chce zobaczyć kogoś podobnego do siebie używającego produktu.

**Kategoria:** wellness, beauty, femtech, health, skincare, supplement.
**Persona emotion:** identity-seeking, aspiration.
**Price:** mid-premium.

**Klasy wymagane:** `<section class="hero">`, `class="... hero-figure hero-image"`.

```html
<section class="hero hero-portrait">
  <div class="container hero-grid">
    <div class="hero-left">
      <div class="eyebrow">[Marka] · Dla [persona]</div>
      <h1 class="js-split">[Headline o persona] <em>[korzyść]</em>.</h1>
      <p class="hero-sub">[Sub: do kogo jest, co daje].</p>
      <div class="hero-cta-row">
        <a href="#offer" class="btn-primary magnetic">Zamów →</a>
      </div>
      <blockquote class="hero-quote">
        „[Krótki cytat prawdziwego klienta 1-2 zdania]"
        <cite>— [Imię], [wiek], [miasto]</cite>
      </blockquote>
    </div>
    <div class="hero-right">
      <div class="hero-figure hero-image">
        <div class="ph">
          <div class="ph-mark">H</div>
          <div class="ph-title">Portret persony z produktem</div>
          <div class="ph-size">1000 × 1400 (pionowy 5:7)</div>
          <div class="ph-note">Osoba podobna do persony z raportu PDF, trzyma/używa produktu w kontekście codziennym. Oczy skierowane lekko poza kadr, naturalne światło, zero stock-photo uśmiechów.</div>
        </div>
      </div>
    </div>
  </div>
</section>
```

```css
.hero-portrait .hero-grid{grid-template-columns:1fr 1fr;gap:48px}
.hero-portrait .hero-figure{aspect-ratio:5/7}
.hero-quote{margin-top:32px;padding:18px 22px;border-left:2px solid var(--primary);font-family:var(--font-display);font-size:17px;font-style:italic;color:var(--ink);line-height:1.5;max-width:420px}
.hero-quote cite{display:block;font-family:var(--font-body);font-style:normal;font-size:13px;color:var(--muted);margin-top:10px}
```

---

## H7 — Product macro / zoom (mega close-up detalu)

**Kiedy:** premium produkty gdzie materiał lub detal sprzedaje (skórzane buty, drewniane meble, biżuteria, precyzyjna mechanika).

**Kategoria:** craft, luxury materials, premium hardware, precision tools.
**Persona emotion:** desire, connoisseur, identity.
**Price:** premium-luxury.

**Klasy wymagane:** `<section class="hero">`, `class="... hero-figure hero-image"`.

```html
<section class="hero hero-macro">
  <div class="hero-figure hero-image">
    <div class="ph">
      <div class="ph-mark">H</div>
      <div class="ph-title">Makro detalu produktu</div>
      <div class="ph-size">2400 × 1200 (szerokie)</div>
      <div class="ph-note">Ekstremalny close-up materiału/faktury/mechanizmu. Światło boczne, głębia pola ostrości, dramatyczny kontrast. Produkt wypełnia 80% kadru.</div>
    </div>
  </div>
  <div class="hero-macro-overlay">
    <div class="container">
      <div class="eyebrow light">[Marka]</div>
      <h1 class="js-split">[Headline krótki 3-5 słów] <em>[kluczowe]</em>.</h1>
      <p class="hero-sub light">[Sub o materiale, pochodzeniu, rzemiośle].</p>
      <a href="#offer" class="btn-primary magnetic">Zamów →</a>
    </div>
  </div>
</section>
```

```css
.hero-macro{position:relative;min-height:min(700px,88vh);padding:0;overflow:hidden}
.hero-macro .hero-figure{position:absolute;inset:0;border-radius:0;aspect-ratio:auto}
.hero-macro-overlay{position:absolute;inset:0;display:flex;align-items:flex-end;padding-bottom:60px;background:linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 45%)}
.hero-macro-overlay h1{color:#fff;font-size:clamp(36px,4.5vw,56px);max-width:720px}
.hero-macro-overlay .hero-sub.light{color:rgba(255,255,255,0.88);max-width:540px;margin-bottom:28px}
.hero-macro-overlay .eyebrow.light{color:rgba(255,255,255,0.7)}
```

---

## H8 — Split z ceną widoczną

**Kiedy:** value-oriented buyer, produkt budget/mid, comparison shopper (Shark style). Klient porównuje — daj mu od razu cenę + CTA.

**Kategoria:** value AGD, budget electronics, comparison-shopped products.
**Persona emotion:** skepticism, value-seeking.
**Price:** budget-mid (<800 zł).

**Klasy wymagane:** `<section class="hero">`, `class="... hero-figure hero-product"`.

```html
<section class="hero hero-price">
  <div class="container hero-grid">
    <div class="hero-left">
      <div class="eyebrow">[Marka] · [Kategoria]</div>
      <h1 class="js-split">[Headline value-focused] <em>[korzyść]</em>.</h1>
      <p class="hero-sub">[Sub: co dostajesz w cenie].</p>
      <div class="hero-price-box">
        <div class="hero-price-old">[stara cena] zł</div>
        <div class="hero-price-current">[cena] zł</div>
        <div class="hero-price-save">−[N]%</div>
      </div>
      <p class="hero-price-note">+ darmowa dostawa · 30 dni na zwrot</p>
      <div class="hero-cta-row">
        <a href="#offer" class="btn-primary magnetic">Zamów teraz →</a>
      </div>
      <div class="hero-rating">
        <span class="stars">★★★★★</span>
        <span>4,7 / 5 · [N] opinii</span>
      </div>
    </div>
    <div class="hero-right">
      <div class="hero-figure hero-product">
        <div class="ph">
          <div class="ph-mark">H</div>
          <div class="ph-title">Produkt na jasnym tle</div>
          <div class="ph-size">1200 × 1200 (kwadrat)</div>
          <div class="ph-note">Produkt wyraźny, jasne tło, zbliżony do e-commerce style (ale lepszej jakości). Show-what-you-get.</div>
        </div>
      </div>
    </div>
  </div>
</section>
```

```css
.hero-price-box{display:flex;align-items:baseline;gap:16px;margin:24px 0 8px;flex-wrap:wrap}
.hero-price-old{font-family:var(--font-display);font-size:22px;color:var(--muted);text-decoration:line-through}
.hero-price-current{font-family:var(--font-display);font-size:44px;font-weight:600;color:var(--ink);letter-spacing:-.02em}
.hero-price-save{padding:6px 12px;background:var(--accent);color:#fff;border-radius:999px;font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:.08em}
.hero-price-note{font-size:13px;color:var(--muted);margin-bottom:24px}
.hero-rating{margin-top:20px;display:flex;gap:10px;align-items:center;font-size:13px;color:var(--muted)}
.hero-rating .stars{color:var(--accent);font-size:15px;letter-spacing:2px}
```

---

## H9 — Video loop / cinemagraph

**Kiedy:** cinematic premium, produkty z dramatycznym ruchem (auto, tech, drone, espresso maker). Klient kupuje moment.

**Kategoria:** premium tech, mechanical beauty, motion-centric product.
**Persona emotion:** desire, aspiration.
**Price:** premium-luxury.

**Klasy wymagane:** `<section class="hero">`, `class="... hero-figure hero-image"` (placeholder na video poster).

```html
<section class="hero hero-video">
  <div class="hero-figure hero-image">
    <video class="hero-video-el" autoplay muted loop playsinline poster="/landing-pages/[slug]/hero-poster.jpg">
      <source src="/landing-pages/[slug]/hero-loop.mp4" type="video/mp4">
    </video>
    <div class="ph hero-video-ph">
      <div class="ph-mark">V</div>
      <div class="ph-title">Video loop 8-12 sek</div>
      <div class="ph-size">1920 × 1080 · MP4 H.264 · max 4 MB</div>
      <div class="ph-note">Pętla pokazująca produkt w ruchu (rotacja, mycie, parowanie, light play). Bez cięć, bez mowy. Fallback: poster image pierwszy frame.</div>
    </div>
  </div>
  <div class="hero-video-overlay">
    <div class="container">
      <div class="eyebrow light">[Marka]</div>
      <h1 class="js-split">[Headline] <em>[kluczowe]</em>.</h1>
      <a href="#offer" class="btn-primary magnetic">Zamów →</a>
    </div>
  </div>
</section>
```

```css
.hero-video{position:relative;min-height:min(720px,90vh);padding:0;overflow:hidden}
.hero-video .hero-figure{position:absolute;inset:0;border-radius:0;aspect-ratio:auto}
.hero-video-el{width:100%;height:100%;object-fit:cover;display:block}
.hero-video-ph{position:absolute;inset:0;pointer-events:none}
.hero-video-overlay{position:absolute;inset:0;display:flex;align-items:center;padding:0;background:linear-gradient(135deg,rgba(0,0,0,0.5) 0%,transparent 50%)}
.hero-video-overlay h1{color:#fff;font-size:clamp(40px,5.5vw,72px);max-width:620px;margin-bottom:32px}
.hero-video-overlay .eyebrow.light{color:rgba(255,255,255,0.75);margin-bottom:20px}
```

> Uwaga: jeśli brak video w zasobach → fallback na H2 Full-bleed lifestyle.

---

## H10 — Before/After split (transformation)

**Kiedy:** produkty transformacyjne — odchudzanie, porządkowanie, sprzątanie, ładowanie skóry, regeneracja. Sprzedajesz ZMIANĘ.

**Kategoria:** cleaning, wellness transformation, skincare, organization, productivity tool.
**Persona emotion:** anxiety → reassurance, transformation aspiration.
**Price:** wszystkie.

**Klasy wymagane:** `<section class="hero">`, `class="... hero-figure hero-image"` (przynajmniej 1 placeholder).

```html
<section class="hero hero-ba">
  <div class="container">
    <div class="eyebrow center">[Marka] · Transformacja</div>
    <h1 class="js-split center">[Headline transformacji] <em>[w czasie]</em>.</h1>
    <div class="hero-ba-grid">
      <div class="hero-ba-side">
        <div class="hero-ba-label">Przed</div>
        <div class="hero-figure hero-image">
          <div class="ph">
            <div class="ph-mark">B</div>
            <div class="ph-title">Stan „przed"</div>
            <div class="ph-size">800 × 1000</div>
            <div class="ph-note">Realistyczny stan problemu (brudne okno, zmęczona skóra, bałagan). Światło mniej korzystne, oddaje pain point.</div>
          </div>
        </div>
        <div class="hero-ba-stat"><span class="hero-ba-stat-num">[3 h]</span><span class="hero-ba-stat-label">[metryka przed]</span></div>
      </div>
      <div class="hero-ba-arrow">→</div>
      <div class="hero-ba-side after">
        <div class="hero-ba-label">Po [Marka]</div>
        <div class="hero-figure hero-image">
          <div class="ph">
            <div class="ph-mark">A</div>
            <div class="ph-title">Stan „po"</div>
            <div class="ph-size">800 × 1000</div>
            <div class="ph-note">Ten sam kadr, efekt produktu. Światło lepsze, scena czysta. Side-by-side z „przed" — ta sama kompozycja.</div>
          </div>
        </div>
        <div class="hero-ba-stat"><span class="hero-ba-stat-num">[20 min]</span><span class="hero-ba-stat-label">[metryka po]</span></div>
      </div>
    </div>
    <div class="hero-cta-row center">
      <a href="#offer" class="btn-primary magnetic">Zamów [Marka] →</a>
    </div>
  </div>
</section>
```

```css
.hero-ba{padding:120px 0 80px}
.hero-ba h1.center{text-align:center;max-width:880px;margin:20px auto 48px}
.hero-ba-grid{display:grid;grid-template-columns:1fr auto 1fr;gap:32px;align-items:center;margin-bottom:40px}
.hero-ba-side{display:flex;flex-direction:column;gap:16px}
.hero-ba-label{font-family:var(--font-mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);text-align:center}
.hero-ba-side.after .hero-ba-label{color:var(--primary)}
.hero-ba-arrow{font-family:var(--font-display);font-size:56px;color:var(--primary);font-style:italic}
.hero-ba-stat{text-align:center;padding:14px 18px;background:var(--paper);border-radius:12px}
.hero-ba-stat-num{display:block;font-family:var(--font-display);font-size:28px;font-weight:600;color:var(--ink)}
.hero-ba-side.after .hero-ba-stat-num{color:var(--primary)}
.hero-ba-stat-label{display:block;font-family:var(--font-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-top:4px}
@media(max-width:768px){.hero-ba-grid{grid-template-columns:1fr;gap:16px}.hero-ba-arrow{transform:rotate(90deg)}}
```

---

# 2. SOLUTION / FEATURES — 6 wariantów

## F1 — Bento 2×2 klasyczny

**Kiedy:** default, 4 równe features. Bezpieczny wybór dla standardowego produktu.

**Kategoria:** wszystkie.
**Liczba features:** dokładnie 4.

**Klasy wymagane:** `<section class="solution">` lub `class="solution bento"`, min 4 `<div class="tile ...">` z placeholder inside.

```html
<section class="solution">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">Nº 03 · Produkt</div>
      <h2>[Headline features] <em>[kluczowe]</em>.</h2>
    </div>
    <div class="bento">
      <article class="tile t-1 js-tilt"><div class="bento-image"><div class="ph">[brief 1]</div></div><h3>[Feature 1]</h3><p>[Opis]</p></article>
      <article class="tile t-2 js-tilt"><div class="bento-image"><div class="ph">[brief 2]</div></div><h3>[Feature 2]</h3><p>[Opis]</p></article>
      <article class="tile t-3 js-tilt"><div class="bento-image"><div class="ph">[brief 3]</div></div><h3>[Feature 3]</h3><p>[Opis]</p></article>
      <article class="tile t-4 js-tilt"><div class="bento-image"><div class="ph">[brief 4]</div></div><h3>[Feature 4]</h3><p>[Opis]</p></article>
    </div>
  </div>
</section>
```

```css
.bento{display:grid;grid-template-columns:1fr 1fr;gap:24px}
.tile{background:var(--paper);border:1px solid var(--rule);border-radius:20px;padding:32px;transition:transform .3s}
.tile:hover{transform:translateY(-4px)}
.bento-image{aspect-ratio:16/10;border-radius:12px;overflow:hidden;margin-bottom:20px}
@media(max-width:768px){.bento{grid-template-columns:1fr}}
```

---

## F2 — Bento asymetryczny (6-pole różne rozmiary)

**Kiedy:** 5-6 features, chcesz bardziej editorial feel. Jedna karta dominuje (hero tile ciemna).

**Kategoria:** premium editorial, lifestyle premium, paromia-style.
**Liczba features:** 5-6.

**Klasy wymagane:** `<section class="solution">`, min 4 `<article class="tile ...">`.

> Pełen snippet: [`patterns.md` #5 Asymmetric Bento](patterns.md). Tu struktura:

```html
<section class="solution">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">Nº 03 · Atelier</div>
      <h2>[Headline] <em>[kluczowe]</em>.</h2>
    </div>
    <div class="bento bento-asym">
      <article class="tile t-hero">[feature dominujący z dużą liczbą/hero image]</article>
      <article class="tile t-tall">[feature boczny pionowy]</article>
      <article class="tile t-wide">[feature szeroki]</article>
      <article class="tile t-small">[feature mały 1]</article>
      <article class="tile t-small">[feature mały 2]</article>
      <article class="tile t-wide">[feature szeroki 2]</article>
    </div>
  </div>
</section>
```

```css
.bento-asym{grid-template-columns:repeat(6,1fr);grid-auto-rows:minmax(220px,auto);gap:20px}
.tile.t-hero{grid-column:span 4;grid-row:span 2;background:var(--ink);color:var(--paper);padding:56px}
.tile.t-tall{grid-column:span 2;grid-row:span 2}
.tile.t-wide{grid-column:span 4}
.tile.t-small{grid-column:span 2}
@media(max-width:1024px){.bento-asym{grid-template-columns:repeat(2,1fr)}.tile{grid-column:span 2!important;grid-row:auto!important;min-height:auto}}
```

---

## F3 — Linear stack (features po kolei, każda pełnej szerokości z alternacją image L/R)

**Kiedy:** 3-5 features które WYMAGAJĄ dłuższego opisu (tech, complex, narrative). Każda feature dostaje własny scroll-stop.

**Kategoria:** complex tech, apps with many features, narrative product.
**Liczba features:** 3-5.

**Klasy wymagane:** `<section class="solution features">`, min 4 `<div class="tile ...">` lub `<article class="feature-row">`.

```html
<section class="solution features">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">Nº 03 · Co daje produkt</div>
      <h2>[Headline] <em>[kluczowe]</em>.</h2>
    </div>
    <article class="tile feature-row">
      <div class="feature-row-text">
        <div class="feature-row-num">01</div>
        <h3>[Feature 1]</h3>
        <p>[Długi opis 3-4 zdania, z konkretnymi detalami i liczbami. Różni się od pozostałych feature'ów szerokością narracji.]</p>
        <div class="feature-stat"><span class="js-counter" data-target="[N]">0</span> [jednostka]</div>
      </div>
      <div class="feature-row-image bento-image">
        <div class="ph">[brief 1 — 800×600]</div>
      </div>
    </article>
    <article class="tile feature-row reverse">
      <div class="feature-row-text"><div class="feature-row-num">02</div><h3>[Feature 2]</h3><p>[opis]</p></div>
      <div class="feature-row-image bento-image"><div class="ph">[brief 2]</div></div>
    </article>
    <article class="tile feature-row">
      <div class="feature-row-text"><div class="feature-row-num">03</div><h3>[Feature 3]</h3><p>[opis]</p></div>
      <div class="feature-row-image bento-image"><div class="ph">[brief 3]</div></div>
    </article>
    <article class="tile feature-row reverse">
      <div class="feature-row-text"><div class="feature-row-num">04</div><h3>[Feature 4]</h3><p>[opis]</p></div>
      <div class="feature-row-image bento-image"><div class="ph">[brief 4]</div></div>
    </article>
  </div>
</section>
```

```css
.feature-row{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;padding:72px 0;border-bottom:1px solid var(--rule)}
.feature-row.reverse .feature-row-text{order:2}
.feature-row.reverse .feature-row-image{order:1}
.feature-row-num{font-family:var(--font-mono);font-size:11px;letter-spacing:.2em;color:var(--primary);margin-bottom:12px}
.feature-row h3{font-family:var(--font-display);font-size:32px;font-weight:500;margin-bottom:16px;letter-spacing:-.02em}
.feature-row p{font-size:17px;color:var(--muted);line-height:1.65;max-width:440px;margin-bottom:20px}
.feature-row-image{aspect-ratio:4/3;border-radius:16px;overflow:hidden}
@media(max-width:900px){.feature-row{grid-template-columns:1fr;gap:24px;padding:48px 0}.feature-row.reverse .feature-row-text,.feature-row.reverse .feature-row-image{order:0}}
```

---

## F4 — Cards z mockupami (phone/app screens per feature)

**Kiedy:** produkt sterowany aplikacją, smart device, SaaS-adjacent. Każda karta ma realny screenshot UI.

**Kategoria:** smart home, IoT, health tech, app-controlled product.
**Liczba features:** 4.

**Klasy wymagane:** `<section class="solution features">`, min 4 `<div class="tile ...">` z bento-image.

```html
<section class="solution features">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">Nº 03 · Aplikacja</div>
      <h2>[Headline] <em>[kluczowe]</em>.</h2>
    </div>
    <div class="feature-cards-ui">
      <article class="tile feature-card-ui js-tilt">
        <div class="feature-card-ui-left">
          <div class="feature-num">01 · [Kategoria]</div>
          <h3>[Feature 1]</h3>
          <p>[Opis 2-3 zdania].</p>
          <div class="feature-stat"><span class="js-counter" data-target="[N]">0</span> [jednostka]</div>
        </div>
        <div class="feature-screen bento-image">
          <!-- Mini phone screen z UI labels -->
          <div class="feature-screen-inner">
            <div class="fs-label">[Metryka]</div><div class="fs-value">[Wartość]</div>
            <div class="fs-bar"></div><div class="fs-bar fs-bar-2"></div>
          </div>
        </div>
      </article>
      <!-- Powtórz dla Feature 2, 3, 4 -->
    </div>
  </div>
</section>
```

```css
.feature-cards-ui{display:grid;grid-template-columns:1fr 1fr;gap:24px}
.feature-card-ui{background:var(--paper);border:1px solid var(--rule);border-radius:20px;padding:32px;display:flex;gap:24px;align-items:center}
.feature-screen{width:110px;aspect-ratio:9/16;background:var(--ink);border-radius:14px;padding:6px;flex-shrink:0}
.feature-screen-inner{width:100%;height:100%;background:var(--ink);border-radius:10px;padding:10px 8px;color:#fff;display:flex;flex-direction:column;gap:8px}
.fs-label{font-family:var(--font-mono);font-size:8px;letter-spacing:.14em;color:rgba(255,255,255,0.55);text-transform:uppercase}
.fs-value{font-family:var(--font-display);font-size:14px;font-weight:500;color:var(--primary)}
.fs-bar{height:3px;border-radius:999px;background:var(--primary);width:60%}
.fs-bar.fs-bar-2{width:85%;opacity:.4}
@media(max-width:768px){.feature-cards-ui{grid-template-columns:1fr}.feature-card-ui{flex-direction:column}.feature-screen{width:90px;order:-1}}
```

---

## F5 — Horizontal scroll (carousel kart)

**Kiedy:** 6-10 features, zbyt dużo dla grida. Klient scrolluje poziomo przez karty jak w Apple.com.

**Kategoria:** lifestyle z wieloma wariantami, food/drink z wielowariantową ofertą, Apple-Watch-style.
**Liczba features:** 6-10.

**Klasy wymagane:** `<section class="solution features">`, min 4 tile.

```html
<section class="solution features">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">Nº 03 · Co znajdziesz w środku</div>
      <h2>[Headline] <em>[kluczowe]</em>.</h2>
    </div>
    <div class="h-scroll-wrapper">
      <div class="h-scroll-track">
        <article class="tile h-scroll-card"><div class="bento-image"><div class="ph">[F1]</div></div><h3>[Feature 1]</h3><p>[opis]</p></article>
        <article class="tile h-scroll-card"><div class="bento-image"><div class="ph">[F2]</div></div><h3>[Feature 2]</h3><p>[opis]</p></article>
        <article class="tile h-scroll-card"><div class="bento-image"><div class="ph">[F3]</div></div><h3>[Feature 3]</h3><p>[opis]</p></article>
        <article class="tile h-scroll-card"><div class="bento-image"><div class="ph">[F4]</div></div><h3>[Feature 4]</h3><p>[opis]</p></article>
        <article class="tile h-scroll-card"><div class="bento-image"><div class="ph">[F5]</div></div><h3>[Feature 5]</h3><p>[opis]</p></article>
        <article class="tile h-scroll-card"><div class="bento-image"><div class="ph">[F6]</div></div><h3>[Feature 6]</h3><p>[opis]</p></article>
      </div>
    </div>
    <p class="h-scroll-hint">← Przeciągnij aby zobaczyć więcej →</p>
  </div>
</section>
```

```css
.h-scroll-wrapper{overflow-x:auto;margin:0 -24px;padding:0 24px;-webkit-overflow-scrolling:touch;scroll-snap-type:x mandatory;scrollbar-width:none}
.h-scroll-wrapper::-webkit-scrollbar{display:none}
.h-scroll-track{display:flex;gap:20px;padding:8px 0 20px;width:max-content}
.h-scroll-card{flex:0 0 320px;scroll-snap-align:start;background:var(--paper);border-radius:20px;padding:24px;border:1px solid var(--rule)}
.h-scroll-card .bento-image{aspect-ratio:4/3;border-radius:12px;overflow:hidden;margin-bottom:18px}
.h-scroll-hint{text-align:center;font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;color:var(--muted);text-transform:uppercase;margin-top:16px}
```

---

## F6 — Split sticky scrollytelling

**Kiedy:** narracyjny produkt, demonstracja kroków procesu. Image sticky po lewej, treść scrolluje po prawej. Apple iPhone launch style.

**Kategoria:** complex/narrative product, transformation device, multi-step process.
**Liczba features:** 3-4 „beats".

**Klasy wymagane:** `<section class="solution features">`, ≥4 bento-image placeholderów wewnątrz.

```html
<section class="solution features">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">Nº 03 · Sekwencja</div>
      <h2>[Headline] <em>[kluczowe]</em>.</h2>
    </div>
    <div class="sticky-split">
      <div class="sticky-figure">
        <div class="bento-image">
          <div class="ph">
            <div class="ph-mark">S</div>
            <div class="ph-title">Obraz dominujący (sticky)</div>
            <div class="ph-size">1000 × 1200</div>
            <div class="ph-note">Jedno kluczowe ujęcie produktu w akcji, zostaje widoczne podczas scrollowania narracji obok.</div>
          </div>
        </div>
      </div>
      <div class="sticky-beats">
        <article class="tile sticky-beat">
          <div class="beat-num">01</div><h3>[Beat 1]</h3><p>[Długi opis 3-4 zdania tej fazy procesu].</p>
          <div class="bento-image small"><div class="ph">[F1 thumbnail]</div></div>
        </article>
        <article class="tile sticky-beat">
          <div class="beat-num">02</div><h3>[Beat 2]</h3><p>[opis]</p>
          <div class="bento-image small"><div class="ph">[F2]</div></div>
        </article>
        <article class="tile sticky-beat">
          <div class="beat-num">03</div><h3>[Beat 3]</h3><p>[opis]</p>
          <div class="bento-image small"><div class="ph">[F3]</div></div>
        </article>
        <article class="tile sticky-beat">
          <div class="beat-num">04</div><h3>[Beat 4]</h3><p>[opis]</p>
          <div class="bento-image small"><div class="ph">[F4]</div></div>
        </article>
      </div>
    </div>
  </div>
</section>
```

```css
.sticky-split{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:start}
.sticky-figure{position:sticky;top:100px;aspect-ratio:5/6;border-radius:20px;overflow:hidden}
.sticky-beats{display:flex;flex-direction:column;gap:80px}
.sticky-beat{padding:0}
.beat-num{font-family:var(--font-display);font-size:56px;font-weight:300;font-style:italic;color:var(--primary);line-height:1;margin-bottom:12px}
.sticky-beat h3{font-family:var(--font-display);font-size:28px;margin-bottom:14px}
.sticky-beat p{font-size:16px;color:var(--muted);line-height:1.65;margin-bottom:16px}
.sticky-beat .bento-image.small{aspect-ratio:16/9;border-radius:12px;overflow:hidden}
@media(max-width:900px){.sticky-split{grid-template-columns:1fr}.sticky-figure{position:relative;top:0;max-height:400px}}
```

---

# 3. TESTIMONIALS / PROOF — 6 wariantów

## T1 — Voices quote grid (default 3 karty z avatarami)

**Kiedy:** default. 3 opinie klientów jako karty z avatarem + imieniem + cytatem.

**Kategoria:** wszystkie (default).

**Klasy wymagane:** `<section class="testimonials voices">`, ≥2 `class="... testi-avatar-figure"` lub `avatar-figure`/`voice-figure`.

```html
<section class="testimonials voices">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">Nº 07 · Opinie</div>
      <h2>[Headline] <em>[kluczowe]</em>.</h2>
      <div class="rating-strip">
        <span class="stars">★★★★★</span>
        <span><b>4,8 / 5</b> · [N] opinii</span>
      </div>
    </div>
    <div class="voices-grid">
      <article class="voice-card">
        <div class="voice-avatar testi-avatar-figure avatar-figure">
          <div class="ph"><div class="ph-mark">[inicjały]</div></div>
        </div>
        <blockquote class="voice-quote">„[Cytat 2-3 zdania konkretnie o efekcie]"</blockquote>
        <cite class="voice-cite"><b>[Imię N.]</b>, [wiek] · [miasto]</cite>
      </article>
      <!-- 2 more -->
    </div>
  </div>
</section>
```

```css
.voices-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.voice-card{background:var(--paper);border-radius:20px;padding:32px;border:1px solid var(--rule)}
.voice-avatar{width:64px;height:64px;border-radius:50%;margin-bottom:18px;overflow:hidden;background:var(--primary-soft)}
.voice-quote{font-family:var(--font-display);font-size:17px;font-style:italic;line-height:1.55;color:var(--ink);margin-bottom:16px}
.voice-cite{font-family:var(--font-body);font-style:normal;font-size:13px;color:var(--muted)}
.voice-cite b{color:var(--ink);font-weight:600}
@media(max-width:900px){.voices-grid{grid-template-columns:1fr}}
```

---

## T2 — Before/After cards z konkretnymi statsami

**Kiedy:** produkt transformacyjny gdzie klient ma LICZBĘ do pokazania (czas zaoszczędzony, waga zrzucona, koszt obniżony).

**Kategoria:** transformation, productivity, cost-saving, wellness measurable.

**Klasy wymagane:** `<section class="testimonials social-proof">`, ≥2 `class="... avatar-figure"`.

```html
<section class="testimonials social-proof">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">Nº 07 · Dane klientów</div>
      <h2>Nie opinie. <em>Liczby przed i po.</em></h2>
    </div>
    <div class="ba-grid">
      <article class="ba-card">
        <div class="ba-person">
          <div class="ba-avatar testi-avatar-figure avatar-figure"><div class="ph"><div class="ph-mark">[inicj]</div></div></div>
          <div><div class="ba-name">[Imię N.]</div><div class="ba-meta">[kontekst, miasto]</div></div>
        </div>
        <div class="ba-compare">
          <div class="ba-side"><div class="ba-side-label">Przed</div><div class="ba-side-val">[3 h]</div><div class="ba-side-unit">[opis]</div></div>
          <div class="ba-arrow">→</div>
          <div class="ba-side after"><div class="ba-side-label">Po</div><div class="ba-side-val">[20 min]</div><div class="ba-side-unit">[opis]</div></div>
        </div>
        <p class="ba-quote">„[Cytat 1 zdanie o zmianie]"</p>
      </article>
      <!-- 2 more -->
    </div>
  </div>
</section>
```

```css
.ba-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.ba-card{background:var(--ink);color:#fff;border-radius:24px;padding:32px;box-shadow:var(--shadow-lg)}
.ba-avatar{width:56px;height:56px;border-radius:50%;border:2px solid var(--primary);margin-bottom:14px;overflow:hidden}
.ba-person{display:flex;gap:14px;align-items:center;margin-bottom:18px}
.ba-name{font-family:var(--font-display);font-size:16px}
.ba-meta{font-family:var(--font-mono);font-size:10px;letter-spacing:.14em;color:rgba(255,255,255,0.55);text-transform:uppercase;margin-top:3px}
.ba-compare{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center;padding:16px;background:rgba(255,255,255,0.05);border-radius:12px;margin-bottom:16px}
.ba-side{text-align:center}
.ba-side-label{font-family:var(--font-mono);font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,0.55);margin-bottom:4px}
.ba-side-val{font-family:var(--font-display);font-size:22px;font-weight:500}
.ba-side.after .ba-side-val{color:var(--primary)}
.ba-side-unit{font-family:var(--font-mono);font-size:9px;color:rgba(255,255,255,0.5);margin-top:3px;text-transform:uppercase}
.ba-arrow{font-family:var(--font-display);font-size:20px;color:var(--primary);font-style:italic}
.ba-quote{font-family:var(--font-display);font-size:14px;font-style:italic;line-height:1.5;color:rgba(255,255,255,0.9)}
@media(max-width:900px){.ba-grid{grid-template-columns:1fr}}
```

---

## T3 — Video-dominant (thumbnails video opinii)

**Kiedy:** produkt endorsowany przez realne osoby, celebryci, influencerzy. Video wideoopinii > tekst.

**Kategoria:** lifestyle, beauty, fitness, high-trust products z video production.

**Klasy wymagane:** `<section class="testimonials voices">`, ≥2 `class="... voice-figure"` (thumbnail video = placeholder).

```html
<section class="testimonials voices">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">Nº 07 · Wideo opinie</div>
      <h2>[Headline] <em>[kluczowe]</em>.</h2>
    </div>
    <div class="video-testi-grid">
      <article class="video-testi">
        <div class="video-testi-thumb voice-figure testi-avatar-figure">
          <div class="ph">
            <div class="ph-mark">V</div>
            <div class="ph-title">Video opinia [Imię]</div>
            <div class="ph-size">640 × 800 (4:5 pionowy)</div>
            <div class="ph-note">Thumbnail z play button, osoba w centrum kadru, neutralne tło domowe. Czas: 30-60 sek.</div>
          </div>
          <button class="video-play" aria-label="Odtwórz wideo">▶</button>
        </div>
        <div class="video-testi-text">
          <p>„[Kluczowy cytat z video, 1 zdanie]"</p>
          <cite><b>[Imię N.]</b>, [kontekst]</cite>
        </div>
      </article>
      <!-- 2 more -->
    </div>
  </div>
</section>
```

```css
.video-testi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.video-testi{background:var(--paper);border-radius:20px;overflow:hidden;border:1px solid var(--rule)}
.video-testi-thumb{position:relative;aspect-ratio:4/5;background:var(--ink);overflow:hidden}
.video-play{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.95);border:none;font-size:20px;cursor:pointer;box-shadow:var(--shadow-lg)}
.video-testi-text{padding:24px}
.video-testi-text p{font-family:var(--font-display);font-size:16px;font-style:italic;margin-bottom:12px;line-height:1.55}
.video-testi-text cite{font-style:normal;font-size:13px;color:var(--muted)}
@media(max-width:900px){.video-testi-grid{grid-template-columns:1fr}}
```

---

## T4 — UGC wall (siatka zdjęć Instagram-style)

**Kiedy:** beauty, fashion, food/drink. Społeczność publikuje zdjęcia z produktem. Glossier-style.

**Kategoria:** beauty, fashion DTC, food/drink lifestyle, community brand.

**Klasy wymagane:** `<section class="testimonials social-proof">`, ≥2 `class="... avatar-figure"` lub `voice-figure`.

```html
<section class="testimonials social-proof">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">Nº 07 · #[hashtag]</div>
      <h2>[Headline] <em>[kluczowe]</em>.</h2>
      <p class="section-sub">Ponad [N] zdjęć od klientów na Instagramie.</p>
    </div>
    <div class="ugc-grid">
      <div class="ugc-tile voice-figure avatar-figure"><div class="ph">[U1 — 600×600]</div><div class="ugc-handle">@[user1]</div></div>
      <div class="ugc-tile voice-figure avatar-figure"><div class="ph">[U2]</div><div class="ugc-handle">@[user2]</div></div>
      <div class="ugc-tile voice-figure avatar-figure"><div class="ph">[U3]</div><div class="ugc-handle">@[user3]</div></div>
      <div class="ugc-tile voice-figure avatar-figure"><div class="ph">[U4]</div><div class="ugc-handle">@[user4]</div></div>
      <div class="ugc-tile voice-figure avatar-figure"><div class="ph">[U5]</div><div class="ugc-handle">@[user5]</div></div>
      <div class="ugc-tile voice-figure avatar-figure"><div class="ph">[U6]</div><div class="ugc-handle">@[user6]</div></div>
      <div class="ugc-tile voice-figure avatar-figure"><div class="ph">[U7]</div><div class="ugc-handle">@[user7]</div></div>
      <div class="ugc-tile voice-figure avatar-figure"><div class="ph">[U8]</div><div class="ugc-handle">@[user8]</div></div>
    </div>
  </div>
</section>
```

```css
.ugc-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.ugc-tile{position:relative;aspect-ratio:1;border-radius:12px;overflow:hidden;cursor:pointer;transition:transform .3s}
.ugc-tile:hover{transform:scale(1.03)}
.ugc-handle{position:absolute;bottom:8px;left:10px;font-family:var(--font-mono);font-size:11px;color:#fff;background:rgba(0,0,0,0.65);padding:3px 8px;border-radius:4px}
@media(max-width:768px){.ugc-grid{grid-template-columns:repeat(2,1fr)}}
```

---

## T5 — Single hero testimonial (1 opinia magazine-style na pełną szerokość)

**Kiedy:** masz JEDNĄ killer opinię (CEO, znany influencer, magazyn). Lepsze ograć ją dużą niż rozproszyć 3 słabsze.

**Kategoria:** premium, luxury, endorsed product z 1 strong voice.

**Klasy wymagane:** `<section class="testimonials voices">`, 1+ `class="... testi-avatar-figure"`.

```html
<section class="testimonials voices">
  <div class="container">
    <div class="single-testi">
      <div class="eyebrow">Nº 07 · Opinia</div>
      <blockquote class="single-testi-quote js-split">
        „[Długi cytat 3-4 zdania, mocny, konkretny, z nazwą marki. Ten jeden cytat niesie całą sekcję.]"
      </blockquote>
      <div class="single-testi-author">
        <div class="single-testi-avatar testi-avatar-figure avatar-figure voice-figure">
          <div class="ph"><div class="ph-mark">[inicjały]</div></div>
        </div>
        <div>
          <div class="single-testi-name">[Imię Nazwisko]</div>
          <div class="single-testi-role">[Stanowisko, Firma / Tytuł magazynu]</div>
        </div>
      </div>
    </div>
  </div>
</section>
```

```css
.single-testi{max-width:860px;margin:0 auto;text-align:center;padding:40px 0}
.single-testi .eyebrow{justify-content:center;margin-bottom:32px}
.single-testi-quote{font-family:var(--font-display);font-size:clamp(28px,4vw,44px);font-style:italic;font-weight:400;line-height:1.25;letter-spacing:-.02em;color:var(--ink);margin-bottom:40px;max-width:800px;margin-left:auto;margin-right:auto}
.single-testi-author{display:flex;align-items:center;justify-content:center;gap:16px}
.single-testi-avatar{width:56px;height:56px;border-radius:50%;overflow:hidden}
.single-testi-name{font-family:var(--font-display);font-size:16px;font-weight:600;text-align:left}
.single-testi-role{font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;color:var(--muted);text-transform:uppercase;margin-top:3px;text-align:left}
```

---

## T6 — Press logos + 1 cytat (editorial authority)

**Kiedy:** produkt PR-owany, wspomniany w mediach. Zero „5 gwiazdek", za to Vogue/NYT/Elle logos + 1 krótki cytat z magazynu.

**Kategoria:** editorial, premium, PR-backed launch.

**Klasy wymagane:** `<section class="testimonials social-proof">`, ≥2 `class="... avatar-figure"` (logo magazynów = placeholder).

```html
<section class="testimonials social-proof">
  <div class="container">
    <div class="press-wall">
      <div class="eyebrow center">Nº 07 · W mediach</div>
      <h2 class="press-headline">Nagrodzone przez redakcje, <em>nie kupione recenzjami.</em></h2>
      <div class="press-logos">
        <div class="press-logo voice-figure avatar-figure testi-avatar-figure"><div class="ph"><div class="ph-mark">VOGUE</div></div></div>
        <div class="press-logo voice-figure avatar-figure testi-avatar-figure"><div class="ph"><div class="ph-mark">NYT</div></div></div>
        <div class="press-logo voice-figure avatar-figure testi-avatar-figure"><div class="ph"><div class="ph-mark">ELLE</div></div></div>
        <div class="press-logo voice-figure avatar-figure testi-avatar-figure"><div class="ph"><div class="ph-mark">WIRED</div></div></div>
        <div class="press-logo voice-figure avatar-figure testi-avatar-figure"><div class="ph"><div class="ph-mark">FORBES</div></div></div>
      </div>
      <blockquote class="press-quote">
        „[Cytat z jednego z magazynów, 2-3 zdania, z konkretną recenzją]"
        <cite>— [Nazwa magazynu], [rok]</cite>
      </blockquote>
    </div>
  </div>
</section>
```

```css
.press-wall{text-align:center;padding:40px 0;max-width:900px;margin:0 auto}
.press-wall .eyebrow.center{justify-content:center;margin-bottom:20px}
.press-headline{font-family:var(--font-display);font-size:clamp(28px,3.5vw,40px);font-weight:400;line-height:1.2;letter-spacing:-.02em;margin-bottom:48px}
.press-logos{display:grid;grid-template-columns:repeat(5,1fr);gap:32px;align-items:center;margin-bottom:56px;padding:32px 0;border-top:1px solid var(--rule);border-bottom:1px solid var(--rule)}
.press-logo{aspect-ratio:3/1;opacity:.65;filter:grayscale(1);transition:opacity .3s,filter .3s}
.press-logo:hover{opacity:1;filter:grayscale(0)}
.press-logo .ph{background:transparent;border:none;padding:0}
.press-logo .ph-mark{font-family:var(--font-display);font-size:18px;font-weight:500;letter-spacing:.1em;color:var(--muted);opacity:1}
.press-logo .ph-title,.press-logo .ph-size,.press-logo .ph-note{display:none}
.press-quote{font-family:var(--font-display);font-size:clamp(20px,2.8vw,28px);font-style:italic;line-height:1.4;color:var(--ink);max-width:720px;margin:0 auto}
.press-quote cite{display:block;font-family:var(--font-mono);font-style:normal;font-size:12px;letter-spacing:.14em;color:var(--muted);margin-top:20px;text-transform:uppercase}
@media(max-width:768px){.press-logos{grid-template-columns:repeat(3,1fr);gap:20px}}
```

---

# 4. Autonomiczny wybór — drzewo decyzyjne

> **Claude wybiera wariant per sekcja automatycznie** na bazie danych z briefa (kategoria + persona + price). Nie pyta użytkownika. Wybór loguje w `_brief.md` sekcji 9.

## Hero (wybierz 1 z 10)

| Warunki | Wybierz |
|---------|---------|
| Smart home / IoT / app-controlled | **H3 Dashboard mockup** |
| Premium AGD >1500 zł z mocną liczbą spec | **H4 Editorial numerał** |
| Premium AGD lifestyle bez jednej killer-liczby | **H2 Full-bleed lifestyle** |
| Craft / luxury / materialową estetyką | **H7 Product macro** |
| Wellness / beauty / femtech / persona-driven | **H6 Persona portrait** |
| Food/drink DTC / editorial manifesto / bold copy | **H5 Oversized typography** |
| Value/budget product (<800 zł), comparison shopper | **H8 Split z ceną** |
| Transformation product (przed/po sprzedaje) | **H10 Before/After split** |
| Cinematic premium z video assets | **H9 Video loop** |
| **Default** (nic powyżej) | **H1 Split klasyczny** |

## Solution / Features (wybierz 1 z 6)

| Warunki | Wybierz |
|---------|---------|
| Smart home / app-controlled — chcesz pokazać UI | **F4 Cards z mockupami** |
| Premium editorial (paromia, luxury lifestyle) | **F2 Bento asymetryczny** |
| Complex tech z dłuższymi opisami feature'ów (3-5) | **F3 Linear stack** |
| 6-10 features (wariantowy produkt, duża oferta) | **F5 Horizontal scroll** |
| Narracyjny produkt / multi-step process | **F6 Split sticky scrollytelling** |
| **Default** (standardowy produkt, 4 features) | **F1 Bento 2×2** |

## Testimonials / Proof (wybierz 1 z 6)

| Warunki | Wybierz |
|---------|---------|
| Transformation product z mierzalnymi liczbami | **T2 Before/After ze statsami** |
| Video assets od realnych klientów / influencerów | **T3 Video-dominant** |
| Beauty/fashion/food-drink z aktywnym UGC | **T4 UGC wall** |
| Premium/luxury/endorsed 1 strong voice | **T5 Single hero testimonial** |
| PR-backed z logo magazynów / editorial | **T6 Press logos + 1 cytat** |
| **Default** (standard DTC) | **T1 Voices quote grid** |

---

# 5. Log wyborów w briefie

Po wyborze 3 wariantów dopisz na końcu `_brief.md` sekcję:

```markdown
## 9. Warianty sekcji (autonomicznie wybrane)

- **Hero:** H3 Dashboard mockup split — smart home + anxiety persona (kontrola przez aplikację)
- **Features:** F4 Cards z mockupami — produkt ma aplikację, feature cards z UI screenshots sprzedają funkcje
- **Testimonials:** T2 Before/After ze statsami — transformacja mierzalna (czas / koszt / bezpieczeństwo)
```

To nie jest blokujące dla verify-brief (sekcja opcjonalna), ale zalecane dla dokumentacji decyzji.

---

## Relacja do pozostałych plików

- `02-generate.md` → rozdział „Autonomiczny wybór wariantów sekcji" odsyła tutaj
- `01-direction.md` → Krok 8 ma check „wybierz 3 warianty po napisaniu manifesta"
- `patterns.md` → biblioteka 22 snippetów signature elementów (MAX 3 per landing), niezależna od tej biblioteki (tamta = cross-section, ta = per-section)
- `verify-landing.sh` → każdy wariant tutaj respektuje wymagane klasy CSS (testowane: każdy przejdzie weryfikację)
