# Section Variants — biblioteka wariantów per sekcja (35: 10 hero + 6 features + 6 testimonials + 13 Tier 2 v5.0)

**Cel:** zamiast jednego układu każdej sekcji — bank wariantów, z którego Claude autonomicznie wybiera **jeden** per sekcja na bazie kategorii produktu + persony + price point.

**Zakres (Tier 1):** 3 sekcje × warianty = **22 snippety**
- **Hero:** 10 wariantów
- **Solution / Features:** 6 wariantów
- **Testimonials / Proof:** 6 wariantów

**Nie-warianty (Tier 3):** Offer box, Header, Footer, FAQ, Final CTA, Sticky CTA, Cookie Banner — te pozostają standardowe (patrz [`02-generate.md`](../02-generate.md)). Zmieniać je = ryzyko dla konwersji.

**Klasy CSS — konwencja:** każdy wariant zawiera w nagłówku **„Klasy wymagane"** (muszą być obecne żeby `verify-landing.sh` przeszedł) oraz **„Klasę identyfikującą (FROZEN)"** `*-v-*` (v5.0) — ta JEDNA klasa jest NIEMODYFIKOWALNA: po niej verify-landing sprawdza zgodność deklaracji z briefu sekcji 9 z faktycznym HTML („zadeklarowane = zbudowane"). Resztę klas (lokalnych dla wariantu) możesz modyfikować.

---

# 1. HERO — 10 wariantów

## H1 — Split klasyczny (tekst + packshot)

**Kiedy:** default dla produktów fizycznych o standardowej prezentacji (AGD, sprzęt, tools). Bezpieczny wybór.

**Kategoria produktu:** wszystkie (default).
**Persona emotion:** neutral / desire.
**Price:** wszystkie.

**Klasy wymagane:** `<section class="hero">`, wewnątrz `class="... hero-figure hero-product"`.
**Klasa identyfikująca (FROZEN, v5.0):** `hero-v-split` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

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
**Klasa identyfikująca (FROZEN, v5.0):** `hero-v-fullbleed` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

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
@media(max-width:768px){.hero-fullbleed{height:min(560px,82vh)}.hero-overlay{padding-bottom:48px}.hero-overlay-inner h1{font-size:clamp(32px,7vw,44px)}}
```

---

## H3 — Dashboard mockup split (phone/app UI + produkt)

**Kiedy:** smart home, tech z aplikacją, safety-focused device (Ring/Nest/Eight Sleep style). Klient kupuje KONTROLĘ.

**Kategoria:** smart home, health tech, IoT, safety device, app-controlled product.
**Persona emotion:** anxiety → reassurance, optimization.
**Price:** premium (1000+).

**Klasy wymagane:** `<section class="hero">`, `class="... hero-figure hero-mockup"`.
**Klasa identyfikująca (FROZEN, v5.0):** `hero-v-dashboard` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

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
@media(max-width:900px){.hero-mockup{min-height:420px}.hero-phone{width:62%}.hero-device-ph{width:56%}}
@media(max-width:480px){.hero-mockup{min-height:360px}.hero-phone{width:65%;transform:rotate(-2deg)}}
```

> Szczegółowa implementacja phone UI: patrz `landing-pages/glassnova/index.html` (referencyjny).

---

## H4 — Editorial numerał (monumentalna liczba tła)

**Kiedy:** produkty premium z jedną mocną liczbą specyfikacji (5600 Pa, 26 s, 30 kPa). Sygnalizuje inżynierię.

**Kategoria:** premium AGD, tech, editorial luxury.
**Persona emotion:** desire, connoisseur, identity-seeking.
**Price:** premium-luxury (1500+).

**Klasy wymagane:** `<section class="hero">`, `class="... hero-figure"`.
**Klasa identyfikująca (FROZEN, v5.0):** `hero-v-numeral` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

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
@media(max-width:900px){.hero-numeral-bg{font-size:clamp(200px,30vw,320px);top:auto;right:-10px;bottom:-20px}}
```

---

## H5 — Oversized typography (headline wypełnia hero)

**Kiedy:** editorial/manifesto, food/drink DTC z mocnym ton-of-voice, marki których charakter = słowa (Graza, Aesop, Liquid Death).

**Kategoria:** food/drink DTC, editorial premium, lifestyle minimalist.
**Persona emotion:** identity-seeking, desire.
**Price:** wszystkie (copy-driven).

**Klasy wymagane:** `<section class="hero">`, `class="... hero-figure"` (zdjęcie mniejsze, poniżej headline).
**Klasa identyfikująca (FROZEN, v5.0):** `hero-v-typo` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

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
@media(max-width:768px){.hero-oversized{padding:120px 0 60px}.hero-oversized-h1{font-size:clamp(40px,12vw,72px);line-height:1.02}.hero-oversized .hero-figure{aspect-ratio:4/3;border-radius:12px}}
```

---

## H6 — Persona portrait (osoba z produktem)

**Kiedy:** wellness, beauty, femtech, produkt osobisty. Klient chce zobaczyć kogoś podobnego do siebie używającego produktu.

**Kategoria:** wellness, beauty, femtech, health, skincare, supplement.
**Persona emotion:** identity-seeking, aspiration.
**Price:** mid-premium.

**Klasy wymagane:** `<section class="hero">`, `class="... hero-figure hero-image"`.
**Klasa identyfikująca (FROZEN, v5.0):** `hero-v-persona` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

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
@media(max-width:900px){.hero-portrait .hero-grid{grid-template-columns:1fr;gap:32px}.hero-portrait .hero-figure{max-height:480px;aspect-ratio:4/5}.hero-quote{font-size:15px;max-width:100%}}
```

---

## H7 — Product macro / zoom (mega close-up detalu)

**Kiedy:** premium produkty gdzie materiał lub detal sprzedaje (skórzane buty, drewniane meble, biżuteria, precyzyjna mechanika).

**Kategoria:** craft, luxury materials, premium hardware, precision tools.
**Persona emotion:** desire, connoisseur, identity.
**Price:** premium-luxury.

**Klasy wymagane:** `<section class="hero">`, `class="... hero-figure hero-image"`.
**Klasa identyfikująca (FROZEN, v5.0):** `hero-v-macro` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

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
@media(max-width:768px){.hero-macro{min-height:min(580px,82vh)}.hero-macro-overlay{padding-bottom:40px}.hero-macro-overlay h1{font-size:clamp(28px,6.5vw,40px)}}
```

---

## H8 — Split z ceną widoczną

**Kiedy:** value-oriented buyer, produkt budget/mid, comparison shopper (Shark style). Klient porównuje — daj mu od razu cenę + CTA.

**Kategoria:** value AGD, budget electronics, comparison-shopped products.
**Persona emotion:** skepticism, value-seeking.
**Price:** budget-mid (<800 zł).

**Klasy wymagane:** `<section class="hero">`, `class="... hero-figure hero-product"`.
**Klasa identyfikująca (FROZEN, v5.0):** `hero-v-price` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

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
@media(max-width:480px){.hero-price-box{gap:12px}.hero-price-current{font-size:34px}.hero-price-old{font-size:18px}}
```

---

## H9 — Video loop / cinemagraph

**Kiedy:** cinematic premium, produkty z dramatycznym ruchem (auto, tech, drone, espresso maker). Klient kupuje moment.

**Kategoria:** premium tech, mechanical beauty, motion-centric product.
**Persona emotion:** desire, aspiration.
**Price:** premium-luxury.

**Klasy wymagane:** `<section class="hero">`, `class="... hero-figure hero-image"` (placeholder na video poster).
**Klasa identyfikująca (FROZEN, v5.0):** `hero-v-video` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

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
@media(max-width:768px){.hero-video{min-height:min(560px,82vh)}.hero-video-overlay h1{font-size:clamp(32px,8vw,48px);margin-bottom:20px}}
```

> Uwaga: jeśli brak video w zasobach → fallback na H2 Full-bleed lifestyle.

---

## H10 — Before/After split (transformation)

**Kiedy:** produkty transformacyjne — odchudzanie, porządkowanie, sprzątanie, ładowanie skóry, regeneracja. Sprzedajesz ZMIANĘ.

**Kategoria:** cleaning, wellness transformation, skincare, organization, productivity tool.
**Persona emotion:** anxiety → reassurance, transformation aspiration.
**Price:** wszystkie.

**Klasy wymagane:** `<section class="hero">`, `class="... hero-figure hero-image"` (przynajmniej 1 placeholder).
**Klasa identyfikująca (FROZEN, v5.0):** `hero-v-ba` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

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
**Klasa identyfikująca (FROZEN, v5.0):** `feat-v-bento` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

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
**Klasa identyfikująca (FROZEN, v5.0):** `feat-v-asym` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

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
**Klasa identyfikująca (FROZEN, v5.0):** `feat-v-linear` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

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
**Klasa identyfikująca (FROZEN, v5.0):** `feat-v-mockups` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

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
**Klasa identyfikująca (FROZEN, v5.0):** `feat-v-scroll` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

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
**Klasa identyfikująca (FROZEN, v5.0):** `feat-v-sticky` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

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

**Klasy wymagane:** `<section class="testimonials voices personas">`, ≥2 `class="... testi-avatar-figure"` lub `avatar-figure`/`voice-figure`.
**Klasa identyfikująca (FROZEN, v5.0):** `testi-v-grid` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

```html
<section class="testimonials voices personas">
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
        <div class="voice-avatar testi-avatar-figure avatar-figure persona-figure">
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

**Klasy wymagane:** `<section class="testimonials social-proof personas">`, ≥2 `class="... avatar-figure"`.
**Klasa identyfikująca (FROZEN, v5.0):** `testi-v-ba` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

```html
<section class="testimonials social-proof personas">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">Nº 07 · Dane klientów</div>
      <h2>Nie opinie. <em>Liczby przed i po.</em></h2>
    </div>
    <div class="ba-grid">
      <article class="ba-card">
        <div class="ba-person">
          <div class="ba-avatar testi-avatar-figure avatar-figure persona-figure"><div class="ph"><div class="ph-mark">[inicj]</div></div></div>
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

**Klasy wymagane:** `<section class="testimonials voices personas">`, ≥2 `class="... voice-figure"` (thumbnail video = placeholder).
**Klasa identyfikująca (FROZEN, v5.0):** `testi-v-video` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

```html
<section class="testimonials voices personas">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">Nº 07 · Wideo opinie</div>
      <h2>[Headline] <em>[kluczowe]</em>.</h2>
    </div>
    <div class="video-testi-grid">
      <article class="video-testi">
        <div class="video-testi-thumb voice-figure testi-avatar-figure persona-figure">
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

**Klasy wymagane:** `<section class="testimonials social-proof personas">`, ≥2 `class="... avatar-figure"` lub `voice-figure`.
**Klasa identyfikująca (FROZEN, v5.0):** `testi-v-ugc` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

```html
<section class="testimonials social-proof personas">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">Nº 07 · #[hashtag]</div>
      <h2>[Headline] <em>[kluczowe]</em>.</h2>
      <p class="section-sub">Ponad [N] zdjęć od klientów na Instagramie.</p>
    </div>
    <div class="ugc-grid">
      <div class="ugc-tile voice-figure avatar-figure persona-figure"><div class="ph">[U1 — 600×600]</div><div class="ugc-handle">@[user1]</div></div>
      <div class="ugc-tile voice-figure avatar-figure persona-figure"><div class="ph">[U2]</div><div class="ugc-handle">@[user2]</div></div>
      <div class="ugc-tile voice-figure avatar-figure persona-figure"><div class="ph">[U3]</div><div class="ugc-handle">@[user3]</div></div>
      <div class="ugc-tile voice-figure avatar-figure persona-figure"><div class="ph">[U4]</div><div class="ugc-handle">@[user4]</div></div>
      <div class="ugc-tile voice-figure avatar-figure persona-figure"><div class="ph">[U5]</div><div class="ugc-handle">@[user5]</div></div>
      <div class="ugc-tile voice-figure avatar-figure persona-figure"><div class="ph">[U6]</div><div class="ugc-handle">@[user6]</div></div>
      <div class="ugc-tile voice-figure avatar-figure persona-figure"><div class="ph">[U7]</div><div class="ugc-handle">@[user7]</div></div>
      <div class="ugc-tile voice-figure avatar-figure persona-figure"><div class="ph">[U8]</div><div class="ugc-handle">@[user8]</div></div>
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

**Klasy wymagane:** `<section class="testimonials voices personas">`, 1+ `class="... testi-avatar-figure"`.
**Klasa identyfikująca (FROZEN, v5.0):** `testi-v-single` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

```html
<section class="testimonials voices personas">
  <div class="container">
    <div class="single-testi">
      <div class="eyebrow">Nº 07 · Opinia</div>
      <blockquote class="single-testi-quote js-split">
        „[Długi cytat 3-4 zdania, mocny, konkretny, z nazwą marki. Ten jeden cytat niesie całą sekcję.]"
      </blockquote>
      <div class="single-testi-author">
        <div class="single-testi-avatar testi-avatar-figure avatar-figure voice-figure persona-figure">
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

## T6 — Ściana atestów / certyfikatów + 1 cytat (authority) — przepisany v5.0

**Kiedy:** produkt z REALNYMI certyfikatami/atestami (z `workflow_products` / dostawcy).

> **⛔ v5.0: NIGDY zaszyte logotypy prasy (VOGUE/NYT/ELLE/WIRED/FORBES).** Produkt
> dropshippingowy klienta NIE był w tych mediach — klient wkleja demo do sklepu i bierze
> na siebie fabrykowany authority claim (Omnibus/UOKiK; verify-landing Grupa 10h).
> Zamiast prasy: ściana atestów WYŁĄCZNIE jako placeholdery `.ph` z briefem
> „wstaw TYLKO certyfikaty, które produkt faktycznie posiada (źródło: workflow_products
> / dostawca) — wpisanie atestu bez potwierdzenia = claim zdrowotny, ryzyko UOKiK".
> Nazwy przykładowe (CE, OEKO-TEX) tylko w komentarzu HTML, NIGDY jako renderowany tekst.

**Kategoria:** evidence, premium, produkt z papierami.

**Klasy wymagane:** `<section class="testimonials social-proof personas">`, ≥2 `class="... avatar-figure"` (atest = placeholder).
**Klasa identyfikująca (FROZEN, v5.0):** `testi-v-certs` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

```html
<section class="testimonials social-proof personas">
  <div class="container">
    <div class="press-wall">
      <div class="eyebrow center">Certyfikaty i atesty</div>
      <h2 class="press-headline">Potwierdzone dokumentami, <em>nie obietnicami.</em></h2>
      <div class="press-logos">
        <!-- Brief: wstaw TYLKO faktycznie posiadane atesty (źródło: workflow_products/dostawca).
             Przykłady KATEGORII (nie wpisuj bez potwierdzenia!): znak zgodności, certyfikat tkanin,
             atest higieniczny. Fabrykowany atest = claim zdrowotny, ryzyko UOKiK. -->
        <div class="press-logo voice-figure avatar-figure testi-avatar-figure persona-figure"><div class="ph"><div class="ph-mark">ATEST 1</div><div class="ph-note">logo certyfikatu z dokumentów produktu</div></div></div>
        <div class="press-logo voice-figure avatar-figure testi-avatar-figure persona-figure"><div class="ph"><div class="ph-mark">ATEST 2</div><div class="ph-note">logo certyfikatu z dokumentów produktu</div></div></div>
        <div class="press-logo voice-figure avatar-figure testi-avatar-figure persona-figure"><div class="ph"><div class="ph-mark">ATEST 3</div><div class="ph-note">logo certyfikatu z dokumentów produktu</div></div></div>
      </div>
      <blockquote class="press-quote">
        „[Cytat z realnej opinii klienta LUB zdanie ze specyfikacji — NIE wymyślony cytat z magazynu]"
        <cite>— [źródło: opinia #N / specyfikacja]</cite>
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

## ⚠️ Reguła pierwszeństwa (tiebreaker)

**Pierwsza pasująca reguła z góry tabeli wygrywa.** Jeśli produkt pasuje do kilku warunków (np. „premium AGD z aplikacją" = Smart home ✓ + Premium AGD ✓), wybierasz wariant z **pierwszej pasującej linii**, nie „najlepszej" (to byłoby subiektywne). Default (ostatni wiersz) włącza się **tylko** jeśli żadna wcześniejsza reguła nie pasuje.

**Przykład:** Dyson V15 (premium AGD + aplikacja) → Smart home linia 1 wygrywa → **H3 Dashboard mockup**.

> **v5.0 (GAP-5):** usunięto instrukcję „edytuj brief, żeby wymusić inny wariant" — brief
> jest AUDYTOWALNYM zapisem produktu, nie dźwignią do gamingu drzewa. Jeśli wynik drzewa
> wydaje się zły, to znaczy że WARUNKI w tabeli wymagają poprawki (zmień procedurę, nie brief).

## Kanoniczne mapowanie warunków → pola briefu (v5.0 — determinizm)

Warunki tabel NIE są osądami „na oko" — każdy mapuje się na konkretne pola briefu.
**Dwa runy na tym samym produkcie MUSZĄ dać ten sam wariant.**

| Fraza warunku | Definicja deterministyczna (pola briefu) |
|---|---|
| „Smart home / IoT / app-controlled" | produkt MA aplikację/łączność w spec (`workflow_products.description` zawiera app/Bluetooth/Wi-Fi/sterowanie) |
| „Premium AGD >1500 zł" | kategoria funkcjonalna AGD ∧ cena > 1500 zł |
| „mocna liczba spec" | sekcja 13.3 briefu ma ≥1 liczbę techniczną z jednostką (kPa/BAR/W/dB/strefy) o wartości wyróżniającej |
| „Value/budget (<800 zł)" | cena < 800 zł |
| **pasmo 800-1500 zł (domknięte v5.0)** | NIE jest „value" ani „premium >1500" — przechodzi do kolejnych reguł (lifestyle/persona/transformation), default H1 |
| „Transformation product" | `big-idea:`/VOC zawiera mierzalną zmianę stanu przed→po (sekcja 13) |
| „persona-driven" | `awareness: problem-aware` ∧ persona z sekcji 5 jest osią big-idea |
| „comparison shopper" | `awareness: product-aware` (sekcja 13.1) |
| „bold copy / editorial manifesto" | styl Atlasu z briefu ∈ {editorial-print, poster-utility, brutalist-diy} |
| „aktywny UGC / video assets" | workflow MA realne assety (reels w `workflow_video.video_links` / zdjęcia opinii) — NIE „mógłby mieć" |
| „PR-backed" | workflow MA realne certyfikaty/publikacje w `workflow_products`/raporcie — NIE domniemane |

## Hero (wybierz 1 z 10)

| Warunki | Wybierz |
|---------|---------|
| Smart home / IoT / app-controlled | **H3 Dashboard mockup** |
| Produkt z 1 dominującą liczbą spec ∧ styl dopuszcza loud typografię (poster/brutalist/newsroom/edgy) | **H5 Oversized typography (type-led)** — typografia ZAMIAST hero image (stock w hero = najsłabszy wariant wg researchu) |
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

## Tier 2 (v5.0) — Problem / How It Works / Comparison / Offer

> Dotychczas dolny lejek był klonem 1:1 na każdym landingu — sztanca dokładnie tam,
> gdzie zapada decyzja zakupowa. Wybór tak samo first-match-wins; loguj w briefie sekcji 9
> liniami `- **Problem:** P2 ...` / `- **How:** W1 ...` / `- **Comparison:** C1 ...` / `- **Offer:** O1 ...`.

### Problem (wybierz 1 z 4)

| Warunki (deterministyczne — mapowanie wyżej) | Wybierz |
|---------|---------|
| `awareness: problem-aware` ∧ liczba kosztu problemu w sekcji 13.3 briefu | **P1 Stat-led** |
| `awareness: problem-aware` ∧ codzienny moment użycia (Krok 1.4 = codzienność) ∧ brak liczby kosztu | **P2 Mini-narracja dnia** |
| `awareness: product-aware` ∧ ≥2 liczby kosztu status quo w 13.3 | **P3 Koszt bezczynności** |
| transformation product (definicja wyżej) ∧ realne foto „przed" możliwe | **P4 Wizualny stan-przed** |
| **Default** | **P1** jeśli jest liczba w 13.3, inaczej **P2** |

### How It Works (wybierz 1 z 3)

| Warunki | Wybierz |
|---------|---------|
| styl ∈ evidence-cluster (apothecary/clinical-*/swiss/spec-sheet/field-manual/newsroom/receipt) | **W3 Spec-strip** |
| kroki mają naturalne foto z użycia (placeholder briefy sensowne per krok) | **W2 Pionowy timeline z foto** |
| **Default** | **W1 3 kroki poziome** |

### Comparison (wybierz 1 z 3) — ⛔ ZAWSZE vs KATEGORIA, nigdy nazwany konkurent

| Warunki | Wybierz |
|---------|---------|
| ≥4 porównywalne cechy w spec produktu ∧ `awareness: product-aware` | **C1 Tabela ✓/✗** |
| porównanie emocjonalne (życie z vs bez), `problem-aware` | **C2 Karty z/bez** |
| styl quiet (japandi/clinical-warmth) ∧ 1 dominująca metryka | **C3 Spec-bar** |
| **Default** | **C1** |

### Offer (wybierz 1 z 3)

| Warunki | Wybierz |
|---------|---------|
| produkt zużywalny/parowalny ∧ cena jednostkowa <300 zł (guardraile O2 w wariancie!) | **O2 Multipack** |
| styl quiet/evidence ∧ `awareness: product-aware` (risk-reversal jako differentiator) | **O3 Guarantee-led** |
| **Default** | **O1 Single (kanon H)** |

---

# 5. Log wyborów w briefie

Po wyborze 3 wariantów dopisz na końcu `_brief.md` sekcję:

```markdown
## 9. Warianty sekcji (autonomicznie wybrane)

- **Hero:** H3 Dashboard mockup split — smart home + anxiety persona (kontrola przez aplikację)
- **Features:** F4 Cards z mockupami — produkt ma aplikację, feature cards z UI screenshots sprzedają funkcje
- **Testimonials:** T2 Before/After ze statsami — transformacja mierzalna (czas / koszt / bezpieczeństwo)
```

**v5.0:** sekcja 9 jest PARSOWANA przez verify-landing („zadeklarowane = zbudowane"):
deklaracja `- **Hero:** H4 ...` mapuje się na klasę FROZEN `hero-v-numeral`, która MUSI być
w HTML (rollout: WARN → FAIL). Analogicznie Features/Testimonials. Dlatego format linii
musi zaczynać się dokładnie od `- **Hero:** H<N>` / `- **Features:** F<N>` / `- **Testimonials:** T<N>`.

---

## Relacja do pozostałych plików

- `02-generate.md` → rozdział „Autonomiczny wybór wariantów sekcji" odsyła tutaj
- `01-direction.md` → Krok 8 ma check „wybierz 3 warianty po napisaniu manifesta"
- `patterns.md` → biblioteka 22 snippetów signature elementów (cross-section, opcjonalne), niezależna od tej biblioteki (tamta = cross-section, ta = per-section)
- `verify-landing.sh` → każdy wariant tutaj respektuje wymagane klasy CSS (testowane: każdy przejdzie weryfikację)

---

# 6. JS Effects coverage — obowiązkowa weryfikacja po wyborze wariantów

> **Verify-landing.sh Grupa 7** wymaga 5 JS effects globalnie w pliku:
> - `.js-split` ≥1 (headline hero)
> - `.js-counter` ≥2 (animowane liczby)
> - `.magnetic` ≥2 (CTA z przyciąganiem)
> - `.js-tilt` ≥2 (karty z 3D tilt)
> - `.js-parallax` ≥1 (parallax numerals/elementów)
>
> **Niektóre warianty NIE mają wszystkich 5 effects — musisz uzupełnić w klasycznych sekcjach.**

### Pokrycie per wariant

| Wariant | js-split | js-counter | magnetic | js-tilt | js-parallax |
|---------|:--------:|:----------:|:--------:|:-------:|:-----------:|
| H1 Split klasyczny | ✅ | — | ✅ | — | — |
| H2 Full-bleed | ✅ | — | ✅ | — | — |
| H3 Dashboard mockup | ✅ | ✅ (1) | ✅ | — | — |
| H4 Editorial numerał | ✅ | — | ✅ | — | ✅ |
| H5 Oversized typography | ✅ | — | ✅ | — | — |
| H6 Persona portrait | ✅ | — | ✅ | — | — |
| H7 Product macro | ✅ | — | ✅ | — | — |
| H8 Split z ceną | ✅ | — | ✅ | — | — |
| H9 Video loop | ✅ | — | ✅ | — | — |
| H10 Before/After | ✅ | — | ✅ | — | — |
| F1 Bento 2×2 | — | — | — | ✅ (4) | — |
| F2 Bento asymetryczny | — | — | — | — | — |
| F3 Linear stack | — | ✅ (1) | — | — | — |
| F4 Cards z mockupami | — | ✅ (1) | — | ✅ (4) | — |
| F5 Horizontal scroll | — | — | — | — | — |
| F6 Split sticky | — | — | — | — | — |
| T1-T6 | — | — | — | — | — |

### Reguła uzupełniania fallbacków (OBOWIĄZKOWE w Kroku 4 ETAP 2)

> **v5.0: NAJPIERW Motion Budget stylu, POTEM ta tabela.** Wymagane są WYŁĄCZNIE efekty
> z `js_effects_required` pliku stylu (STYLE LOCK sekcja 10, minima z `js_effects_count`).
> Efektu z `js_effects_forbidden` **NIGDY nie dodawaj jako fallback** — to FAIL verify Grupa 7
> (dawna wersja tej tabeli kazała dodawać magnetic/split wbrew lockowi apothecary/clinical-warmth
> /swiss-grid/dark-academia → uczyło to pipeline `--no-verify`).

Po złożeniu HTML z wybranymi wariantami policz wystąpienia **wymaganych przez styl** efektów.
Jeśli któryś jest poniżej minimum, dodaj go w tych miejscach:

| Brakujący WYMAGANY efekt | Gdzie dodać fallback |
|------|----------------------|
| **`.js-counter`** | Hero stats (jeśli H nie ma) **lub** Offer box „Oszczędzasz <span class="js-counter" data-target="400">0</span> zł" + Problem section z dużą liczbą statystyki |
| **`.js-tilt`** | Trust Bar icons (owiń 2+ `.trust-item` w `.js-tilt`) **lub** How It Works kroki (każdy `.how-step` dostaje `.js-tilt`) |
| **`.js-parallax`** | Problem section — numeral w tle (stylizowany jak [patterns.md #21](patterns.md#21-parallax-numerals)) **lub** Final CTA bg-number |
| **`.magnetic`** | Dodaj do sticky-cta + offer-cta (poza hero) |
| **`.js-split`** | h1 hero (warianty H mają go domyślnie — ale TYLKO gdy styl dopuszcza) |

### Weryfikacja

Po uzupełnieniu fallbacków uruchom:

```bash
bash scripts/verify-landing.sh [slug]
```

Grupa 7 „JS effects" musi być 100% zielona (zgodność z Motion Budgetem w OBA kierunki:
wymagane obecne ≥ min, zakazane nieobecne).

### ⚠️ HARD RULE dla js-split: word-by-word, NIE char-by-char

Implementacja `.js-split` w klasycznych snippetach była char-by-char (każda litera w osobnym `<span>` z `display:inline-block`). **PROBLEM:** przeglądarka na mobile może złamać linię **w środku słowa** między spanami-literami (np. „Bez" w jednej linii, „telefonu" w drugiej — ale też „Bez tel\nefonu" w środku słowa).

**Fix (standard od 2026-04-20):** split POSŁOWO (`split(/(\s+)/)`), każde słowo wrapowane w `<span style="white-space:nowrap">` z własnym delay. Spacje między słowami zostają jako zwykłe text nodes — przeglądarka łamie tylko na granicy słów, nigdy w środku.

```javascript
document.querySelectorAll('.js-split').forEach(el => {
  const html = el.innerHTML;
  const parts = html.split(/(<em[^>]*>.*?<\/em>)/);
  let wordIdx = 0;
  const wrapWord = (word, delayMs) =>
    `<span style="display:inline-block;white-space:nowrap;opacity:0;transform:translateY(18px);transition:opacity .5s ease ${delayMs}ms,transform .5s ease ${delayMs}ms">${word}</span>`;
  el.innerHTML = parts.map(p => {
    if (p.startsWith('<em')) {
      const m = p.match(/<em([^>]*)>(.*?)<\/em>/);
      const attrs = m ? m[1] : '';
      const inner = m ? m[2] : p;
      return '<em' + attrs + '>' + inner.split(/(\s+)/).map(w => {
        if (/^\s+$/.test(w)) return ' ';
        return wrapWord(w, (wordIdx++) * 50);
      }).join('') + '</em>';
    }
    return p.split(/(\s+)/).map(w => {
      if (/^\s+$/.test(w)) return ' ';
      return wrapWord(w, (wordIdx++) * 50);
    }).join('');
  }).join('');
  setTimeout(() => {
    el.querySelectorAll('span').forEach(s => { s.style.opacity = 1; s.style.transform = 'translateY(0)'; });
  }, 100);
});
```

---

# 7. PROBLEM — 4 warianty

> Budżet scrollability dla sekcji Problem ([`02-generate.md`](../02-generate.md)): **1-2 liczby** (jedna konkretna konsekwencja). P1 i P3 zużywają budżet liczbowy, P2 i P4 to breathing momenty (zero metryk). Grupa 11 verify-landing łapie sekcję po regexie `problem|pain|agitation` — każdy wariant ma `<section class="problem ...">`.

## P1 — Stat-led (jedna brutalna liczba problemu)

**Kiedy:** brief ma JEDNĄ wiarygodną, kanoniczną liczbę kosztu problemu (czas, pieniądze, powtórzenia) i persona reaguje na konkret. Dense-lite: max 2 liczby w sekcji (duża liczba + jedna w agitacji) — mieści się w budżecie Problem 1-2.

**Kategoria:** AGD/cleaning, tools, produktywność, wszystko co oszczędza czas lub pieniądze.
**Awareness (brief 13.1):** problem-aware z liczbą.
**Persona emotion:** frustration → urgency.

**Klasy wymagane:** `<section class="problem">` (Grupa 11: `problem|pain|agitation`), wewnątrz `class="prob-stat-num"`.
**Klasa identyfikująca (FROZEN, v5.0):** `prob-v-stat` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

```html
<section class="problem problem-stat prob-v-stat">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">Nº 02 · Problem</div>
      <h2>[Nazwij problem wprost] <em>[kluczowe 2 słowa]</em>.</h2>
    </div>
    <div class="prob-stat-grid">
      <div class="prob-stat-left">
        <div class="prob-stat-num">[N]<span class="prob-stat-unit">[min / zł / razy]</span></div>
        <div class="prob-stat-caption">[czego dotyczy liczba — np. „tyle czasu dziennie zabiera Ci X”]</div>
      </div>
      <div class="prob-stat-right">
        <p class="prob-agitation">[Zdanie 1: co konkretnie się dzieje i co to kosztuje — akcja + skutek, bez metafor].</p>
        <p class="prob-agitation">[Zdanie 2: co się stanie za [N] miesięcy, jeśli nic się nie zmieni — ostatnia liczba w tej sekcji].</p>
        <div class="prob-stat-bar"><span class="prob-stat-bar-fill"></span></div>
        <div class="prob-stat-bar-label">[podpis wizualizacji — opisowy, bez nowej liczby]</div>
      </div>
    </div>
  </div>
</section>
```

```css
.problem-stat{padding:120px 0;background:var(--paper)}
.prob-stat-grid{display:grid;grid-template-columns:1fr 1.15fr;gap:64px;align-items:center}
.prob-stat-num{font-family:var(--font-display);font-size:clamp(88px,12vw,168px);font-weight:400;line-height:.9;letter-spacing:-.04em;color:var(--ink)}
.prob-stat-unit{font-size:.24em;font-family:var(--font-accent);letter-spacing:.08em;color:var(--primary);margin-left:8px}
.prob-stat-caption{margin-top:16px;font-family:var(--font-accent);font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink);opacity:.6;max-width:320px}
.prob-agitation{font-family:var(--font-body);font-size:18px;line-height:1.65;color:var(--ink);margin-bottom:16px;max-width:480px}
.prob-stat-bar{height:8px;border-radius:999px;background:var(--rule);overflow:hidden;margin-top:28px;max-width:420px}
.prob-stat-bar-fill{display:block;height:100%;width:72%;background:var(--primary);border-radius:999px}
.prob-stat-bar-label{margin-top:10px;font-family:var(--font-accent);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink);opacity:.55}
@media(max-width:768px){.problem-stat{padding:80px 0}.prob-stat-grid{grid-template-columns:1fr;gap:32px}.prob-stat-num{font-size:clamp(72px,22vw,110px)}}
```

**Kiedy NIE używać:** gdy brief nie ma zweryfikowanej liczby problemu — liczba dorobiona na potrzeby sekcji to FAIL wiarygodności (wtedy P2 lub P4). Nie łącz z liczbowym hero (H4/H8), jeśli budżet 8-12 liczb na landing przestaje się domykać.

---

## P2 — Mini-narracja dnia (scena 7:30 rano)

**Kiedy:** persona przeżywa problem codziennie w konkretnym momencie dnia i kupuje emocją, nie spec-sheetem. Breathing moment (liczy się do min 3 per landing). ZERO liczb-metryk — godzina w narracji („7:30”) to scenografia, nie metryka, i nie wlicza się do budżetu liczb.

**Kategoria:** home/family, wellness, beauty, pet, produkty „codziennej ulgi”.
**Awareness (brief 13.1):** problem-aware emocjonalny.
**Persona emotion:** zmęczenie / rezygnacja → rozpoznanie siebie.

**Klasy wymagane:** `<section class="problem">` (Grupa 11: `problem|pain|agitation`), wewnątrz `class="prob-story-figure"` z placeholderem.
**Klasa identyfikująca (FROZEN, v5.0):** `prob-v-story` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

```html
<section class="problem problem-story prob-v-story">
  <div class="container prob-story-grid">
    <div class="prob-story-text">
      <div class="eyebrow">Nº 02 · Codzienna scena</div>
      <p class="prob-story-time">[7:30] · [miejsce — np. kuchnia]</p>
      <p class="prob-story-lead">[Zdanie 1: konkretna godzina + fizyczna czynność persony, czas teraźniejszy, 2. osoba — np. „Jest 7:30. Trzeci raz wycierasz ten sam blat, bo…”].</p>
      <p class="prob-story-body">[Zdanie 2: co konkretnie idzie nie tak — przedmiot, czynność, skutek. Bez metafor i personifikacji.]</p>
      <p class="prob-story-body">[Zdanie 3: czego persona przez to dziś nie zrobi — konkret z planu dnia, bez liczb.]</p>
      <p class="prob-story-punch">[Zdanie 4: punchline nazywająca problem wprost — krótko, jak polski copywriter DR, nie aforyzm.]</p>
    </div>
    <div class="prob-story-figure">
      <div class="ph">
        <div class="ph-mark">P</div>
        <div class="ph-title">Scena „przed” z życia persony</div>
        <div class="ph-size">1000 × 1250 (4:5, pion)</div>
        <div class="ph-note">Reportażowy kadr dokładnie tej sceny z narracji: [miejsce] o poranku, persona w trakcie [czynność z problemem]. Naturalne światło zza okna, lekki nieład, zero pozowania i zero uśmiechu do kamery.</div>
      </div>
    </div>
  </div>
</section>
```

```css
.problem-story{padding:140px 0;background:var(--paper)}
.prob-story-grid{display:grid;grid-template-columns:1.1fr 1fr;gap:64px;align-items:center}
.prob-story-time{font-family:var(--font-accent);font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--primary);margin:18px 0 20px}
.prob-story-lead{font-family:var(--font-display);font-size:clamp(24px,3vw,34px);line-height:1.35;color:var(--ink);margin-bottom:20px}
.prob-story-body{font-family:var(--font-body);font-size:17px;line-height:1.7;color:var(--ink);opacity:.75;margin-bottom:14px;max-width:480px}
.prob-story-punch{font-family:var(--font-display);font-style:italic;font-size:20px;line-height:1.5;color:var(--ink);margin-top:24px;padding-left:18px;border-left:2px solid var(--primary);max-width:440px}
.prob-story-figure{aspect-ratio:4/5;border-radius:16px;overflow:hidden}
@media(max-width:768px){.problem-story{padding:80px 0}.prob-story-grid{grid-template-columns:1fr;gap:32px}.prob-story-lead{font-size:clamp(22px,6vw,28px)}.prob-story-figure{max-height:440px}}
```

**Kiedy NIE używać:** dla comparison shoppera / persony solution-aware, która porównuje parametry — scena ją spowalnia zamiast przekonywać (wtedy P1 lub P3). Też gdy landing ma już 3+ breathing momentów, a brakuje mu twardego dowodu problemu.

---

## P3 — Koszt bezczynności (rachunek za status quo)

**Kiedy:** persona value-seeking/sceptyczna, a status quo ma policzalny koszt. **Wszystkie 3 liczby (2 pozycje + suma) MUSZĄ pochodzić z liczb kanonicznych briefu** — żadnych kwot dorabianych na potrzeby rachunku. 3 liczby przekraczają standardowy budżet sekcji Problem (1-2), więc traktuj P3 jako sekcję dense: kompensuj zerem liczb w How it works i max 1 w Features.

**Kategoria:** produkty oszczędzające pieniądze/czas, zamienniki droższych nawyków, narzędzia kończące powtarzalne zakupy.
**Awareness (brief 13.1):** problem-aware z liczbą.
**Persona emotion:** skepticism / value-seeking → policzony wstyd status quo.

**Klasy wymagane:** `<section class="problem">` (Grupa 11: `problem|pain|agitation`), wewnątrz `class="prob-receipt"`.
**Klasa identyfikująca (FROZEN, v5.0):** `prob-v-cost` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

```html
<section class="problem problem-cost prob-v-cost">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">Nº 02 · Koszt status quo</div>
      <h2>Nic nie robiąc, <em>też płacisz</em>.</h2>
    </div>
    <div class="prob-receipt">
      <div class="prob-receipt-head">Rachunek za [problem] — co miesiąc</div>
      <!-- Budżet liczb: pozycja 1 + pozycja 2 + suma = 3. Pozycja 3 celowo bez kwoty. -->
      <div class="prob-receipt-row"><span>[Pozycja 1 — np. środki / wymiany / poprawki]</span><span class="prob-receipt-dots"></span><span class="prob-receipt-amount">[N] zł</span></div>
      <div class="prob-receipt-row"><span>[Pozycja 2 — np. stracone godziny przeliczone wg briefu]</span><span class="prob-receipt-dots"></span><span class="prob-receipt-amount">[N] zł</span></div>
      <div class="prob-receipt-row"><span>[Pozycja 3 — koszt niepoliczalny, np. „[skutek] przy każdym użyciu”]</span><span class="prob-receipt-dots"></span><span class="prob-receipt-amount">—</span></div>
      <div class="prob-receipt-total"><span>Razem, miesiąc w miesiąc</span><span class="prob-receipt-sum">[suma] zł+</span></div>
    </div>
    <p class="prob-receipt-note">[1 zdanie zestawiające rachunek z jednorazowym zakupem — opisowo, BEZ kolejnej liczby; cenę pokazuje sekcja Offer].</p>
  </div>
</section>
```

```css
.problem-cost{padding:120px 0}
.prob-receipt{max-width:560px;margin:0 auto;background:var(--paper);border:1px solid var(--rule);border-radius:16px;padding:36px 32px}
.prob-receipt-head{font-family:var(--font-accent);font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink);opacity:.6;padding-bottom:16px;border-bottom:1px dashed var(--rule)}
.prob-receipt-row{display:flex;align-items:baseline;gap:12px;padding:16px 0;border-bottom:1px dashed var(--rule);font-family:var(--font-body);font-size:16px;line-height:1.45;color:var(--ink)}
.prob-receipt-dots{flex:1;min-width:24px;border-bottom:1px dotted var(--rule);transform:translateY(-4px)}
.prob-receipt-amount{font-family:var(--font-accent);font-weight:600;white-space:nowrap;color:var(--ink)}
.prob-receipt-total{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding-top:22px;font-family:var(--font-display);font-size:20px;color:var(--ink)}
.prob-receipt-sum{font-size:32px;font-weight:600;letter-spacing:-.02em;color:var(--primary)}
.prob-receipt-note{text-align:center;margin:24px auto 0;max-width:480px;font-size:15px;line-height:1.6;color:var(--ink);opacity:.7}
@media(max-width:768px){.problem-cost{padding:80px 0}.prob-receipt{padding:28px 20px}.prob-receipt-total{font-size:18px}.prob-receipt-sum{font-size:26px}}
```

**Kiedy NIE używać:** gdy kosztu status quo nie da się uczciwie wyprowadzić z liczb kanonicznych briefu (kategorie czysto emocjonalne: prezent, rytuał beauty) — wtedy P2/P4. Nie łącz z hero H8 (cena w hero): dwa „rachunki” na górze strony robią landing transakcyjnym, zanim zbuduje desire.

---

## P4 — Wizualny stan-przed (placeholder-dowód)

**Kiedy:** problem jest WIDOCZNY (brud, bałagan, zużycie, splątanie) i jedno zdjęcie mówi więcej niż akapit. Breathing moment (dominujące zdjęcie, zero liczb) — liczy się do min 3 per landing.

**Kategoria:** cleaning, organizacja, ogród, renowacja, pielęgnacja powierzchni — wszystko z fotografowalnym „przed”.
**Awareness (brief 13.1):** problem-aware emocjonalny.
**Persona emotion:** rozpoznanie własnego problemu na zdjęciu → ulga, że jest nazwany.

**Klasy wymagane:** `<section class="problem">` (Grupa 11: `problem|pain|agitation`), wewnątrz `class="prob-visual-frame"` z placeholderem i `class="prob-pains"`.
**Klasa identyfikująca (FROZEN, v5.0):** `prob-v-visual` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

```html
<section class="problem problem-visual prob-v-visual">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">Nº 02 · Stan obecny</div>
      <h2>[Nazwij to, co widać] <em>[kluczowe 2 słowa]</em>.</h2>
    </div>
    <figure class="prob-visual-figure">
      <div class="prob-visual-frame">
        <div class="ph">
          <div class="ph-mark">P</div>
          <div class="ph-title">Stan „przed” — wizualny dowód problemu</div>
          <div class="ph-size">1920 × 1080 (16:9, pełna szerokość kontenera)</div>
          <div class="ph-note">Realny, niewyretuszowany kadr problemu z briefu (np. zaschnięte zacieki, splątane kable, zniszczona powierzchnia). Światło dzienne, bez stylizacji — ma wyglądać jak zdjęcie z telefonu klienta, nie jak stock.</div>
        </div>
      </div>
      <figcaption class="prob-visual-caption">[1 zdanie: co dokładnie widać i dlaczego ten stan wraca — konkret, bez liczb].</figcaption>
    </figure>
    <ul class="prob-pains">
      <li>[Pain 1 — moment z dnia: czasownik + przedmiot, max 8 słów]</li>
      <li>[Pain 2 — co trzeba powtarzać / co przestaje działać]</li>
      <li>[Pain 3 — czego persona unika przez ten stan]</li>
    </ul>
  </div>
</section>
```

```css
.problem-visual{padding:120px 0}
.prob-visual-figure{margin:0}
.prob-visual-frame{aspect-ratio:16/9;border-radius:20px;overflow:hidden}
.prob-visual-caption{margin-top:14px;font-family:var(--font-display);font-style:italic;font-size:15px;line-height:1.55;color:var(--ink);opacity:.65;max-width:640px}
.prob-pains{list-style:none;margin:40px 0 0;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.prob-pains li{position:relative;min-height:44px;padding:18px 20px 18px 46px;background:var(--paper);border:1px solid var(--rule);border-radius:12px;font-family:var(--font-body);font-size:15px;line-height:1.5;color:var(--ink)}
.prob-pains li::before{content:"×";position:absolute;left:18px;top:14px;font-family:var(--font-display);font-size:20px;line-height:1.4;color:var(--primary)}
@media(max-width:768px){.problem-visual{padding:80px 0}.prob-visual-frame{aspect-ratio:4/3;border-radius:12px}.prob-pains{grid-template-columns:1fr;gap:12px}}
```

**Kiedy NIE używać:** dla produktów bez fotografowalnego „przed” (suplementy, sen, usługi, efekty odczuwalne, ale niewidoczne) — zmyślony lub stockowy kadr „przed” podważa wiarygodność całego landingu; wtedy P2. Też gdy hero to H10 (Before/After) — drugi „stan przed” dubluje przekaz.

---

---

# 4. HOW IT WORKS — 3 warianty

## W1 — 3 kroki poziome (klasyk z ikonami)

**Kiedy:** default dla produktów o prostej obsłudze (zamów → przygotuj → używaj). Najszybszy do zeskanowania wzrokiem — klient w 5 sekund rozumie, że „to jest proste".

**Kategoria:** wszystkie (default).

**Klasy wymagane:** `<section class="how">` z `id="how"` (cel linku „Zobacz jak działa" z hero), dokładnie 3× `<article class="how-step">`.
**Klasa identyfikująca (FROZEN, v5.0):** `how-v-horizontal` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

```html
<section class="how how-v-horizontal" id="how">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">Nº 04 · Jak to działa</div>
      <h2>[Headline o prostocie] <em>[kluczowe 2 słowa]</em>.</h2>
    </div>
    <div class="how-grid">
      <article class="how-step">
        <div class="how-step-num">01</div>
        <div class="how-step-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="m3 8 9 5 9-5"/><path d="M12 13v8"/></svg>
        </div>
        <h3 class="how-step-title">[Krok 1 — czasownik, np. Zamawiasz]</h3>
        <p>[1 zdanie: co robi użytkownik — bez obietnic czasu dostawy].</p>
      </article>
      <article class="how-step">
        <div class="how-step-num">02</div>
        <div class="how-step-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3v8"/><path d="M6.3 7.6a7.5 7.5 0 1 0 11.4 0"/></svg>
        </div>
        <h3 class="how-step-title">[Krok 2 — czasownik, np. Włączasz]</h3>
        <p>[1 zdanie: pierwsze użycie, podkreśl że bez instrukcji/narzędzi].</p>
      </article>
      <article class="how-step">
        <div class="how-step-num">03</div>
        <div class="how-step-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5.5"/></svg>
        </div>
        <h3 class="how-step-title">[Krok 3 — efekt, np. Widzisz różnicę]</h3>
        <p>[1 zdanie: po czym użytkownik pozna, że działa].</p>
      </article>
    </div>
  </div>
</section>
```

```css
.how{padding:120px 0}
.how-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:32px}
.how-step{position:relative;padding:36px 28px;background:var(--paper);border:1px solid var(--rule);border-radius:20px;text-align:center}
.how-grid .how-step:not(:last-child)::after{content:"→";position:absolute;top:50%;right:-26px;transform:translateY(-50%);font-family:var(--font-display);font-size:22px;font-style:italic;color:var(--primary);z-index:1}
.how-step-num{font-family:var(--font-mono);font-size:11px;letter-spacing:.2em;color:var(--muted);margin-bottom:16px}
.how-step-icon{width:56px;height:56px;margin:0 auto 20px;border-radius:50%;background:var(--paper);border:1px solid var(--rule);color:var(--primary);display:flex;align-items:center;justify-content:center}
.how-step-icon svg{width:26px;height:26px}
.how-step-title{font-family:var(--font-display);font-size:21px;font-weight:500;letter-spacing:-.01em;margin-bottom:10px}
.how-step p{font-family:var(--font-body);font-size:15px;color:var(--muted);line-height:1.6;max-width:280px;margin:0 auto}
@media(max-width:768px){.how{padding:80px 0}.how-grid{grid-template-columns:1fr;gap:20px}.how-grid .how-step:not(:last-child)::after{top:auto;bottom:-24px;right:50%;transform:translateX(50%) rotate(90deg)}}
```

**Kiedy NIE używać:** gdy kroki wymagają wizualnej demonstracji (montaż, wieloetapowy rytuał użycia, produkt nieintuicyjny) — ikona nie udźwignie, weź W2 z foto. Dla stylów evidence/clinical/swiss-grid okrągłe ikony w kartach wyglądają obco — weź W3.

---

## W2 — Pionowy timeline z foto

**Kiedy:** produkt z procesem, który trzeba POKAZAĆ (montaż, przygotowanie, rytuał pielęgnacji, urządzenie z kilkoma fazami pracy). Persona problem-aware musi zobaczyć, że „dam radę". Foto kroków = 1 z 3 wymaganych lifestyle photos (SCROLLABILITY).

**Kategoria:** AGD z przygotowaniem, beauty/wellness z rytuałem, narzędzia, produkty z montażem.

**Klasy wymagane:** `<section class="how">` z `id="how"`, dokładnie 3× `<article class="how-step">`, każdy krok z `class="step-figure"` (placeholder 4-polowy).
**Klasa identyfikująca (FROZEN, v5.0):** `how-v-timeline` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

```html
<section class="how how-v-timeline" id="how">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">Nº 04 · Jak to działa</div>
      <h2>[Headline o procesie] <em>[kluczowe]</em>.</h2>
    </div>
    <div class="timeline-track">
      <article class="how-step timeline-step">
        <div class="timeline-card">
          <h3>[Krok 1 — czasownik]</h3>
          <p>[1-2 zdania: co robi użytkownik i dlaczego to proste].</p>
        </div>
        <div class="timeline-dot">1</div>
        <div class="step-figure">
          <div class="ph">
            <div class="ph-mark">K1</div>
            <div class="ph-title">Krok 1 w użyciu</div>
            <div class="ph-size">800 × 600 (4:3)</div>
            <div class="ph-note">Ręce użytkownika wykonują krok 1 (np. napełnienie, montaż), zbliżenie, kontekst domowy, naturalne światło.</div>
          </div>
        </div>
      </article>
      <article class="how-step timeline-step">
        <div class="timeline-card">
          <h3>[Krok 2 — czasownik]</h3>
          <p>[1-2 zdania: co robi produkt, co widzi użytkownik w trakcie].</p>
        </div>
        <div class="timeline-dot">2</div>
        <div class="step-figure">
          <div class="ph">
            <div class="ph-mark">K2</div>
            <div class="ph-title">Krok 2 — produkt w trakcie pracy</div>
            <div class="ph-size">800 × 600 (4:3)</div>
            <div class="ph-note">Produkt w działaniu, widoczny efekt pracy (para, ruch, piana), kadr z boku, bez twarzy.</div>
          </div>
        </div>
      </article>
      <article class="how-step timeline-step">
        <div class="timeline-card">
          <h3>[Krok 3 — efekt]</h3>
          <p>[1-2 zdania: po czym użytkownik pozna efekt końcowy].</p>
        </div>
        <div class="timeline-dot">3</div>
        <div class="step-figure">
          <div class="ph">
            <div class="ph-mark">K3</div>
            <div class="ph-title">Krok 3 — efekt końcowy</div>
            <div class="ph-size">800 × 600 (4:3)</div>
            <div class="ph-note">Efekt po użyciu w tym samym kadrze co K1, użytkownik rozmyty w tle, światło dzienne.</div>
          </div>
        </div>
      </article>
    </div>
  </div>
</section>
```

```css
.how-v-timeline{padding:120px 0}
.timeline-track{position:relative;display:flex;flex-direction:column;gap:72px}
.timeline-track::before{content:"";position:absolute;left:50%;top:0;bottom:0;width:1px;background:var(--rule);transform:translateX(-50%)}
.timeline-step{position:relative;display:grid;grid-template-columns:1fr 64px 1fr;gap:24px;align-items:center}
.timeline-dot{grid-column:2;grid-row:1;justify-self:center;width:44px;height:44px;border-radius:50%;background:var(--primary);color:var(--paper);font-family:var(--font-display);font-size:18px;font-weight:500;display:flex;align-items:center;justify-content:center;z-index:1}
.timeline-card{grid-column:1;grid-row:1;text-align:right}
.timeline-step .step-figure{grid-column:3;grid-row:1}
.timeline-step:nth-child(even) .timeline-card{grid-column:3;text-align:left}
.timeline-step:nth-child(even) .step-figure{grid-column:1}
.timeline-card h3{font-family:var(--font-display);font-size:24px;font-weight:500;letter-spacing:-.01em;margin-bottom:10px}
.timeline-card p{font-family:var(--font-body);font-size:15px;color:var(--muted);line-height:1.65;max-width:380px;display:inline-block}
.step-figure{aspect-ratio:4/3;border-radius:16px;overflow:hidden;background:var(--paper);border:1px solid var(--rule)}
@media(max-width:768px){.how-v-timeline{padding:80px 0}.timeline-track{gap:48px}.timeline-track::before{left:22px;transform:none}.timeline-step{grid-template-columns:44px 1fr;gap:16px;align-items:start}.timeline-dot{grid-column:1;grid-row:1}.timeline-card,.timeline-step:nth-child(even) .timeline-card{grid-column:2;grid-row:1;text-align:left}.timeline-card p{display:block;max-width:none}.timeline-step .step-figure,.timeline-step:nth-child(even) .step-figure{grid-column:2;grid-row:2;margin-top:8px}}
```

**Kiedy NIE używać:** gdy kroki są trywialne (zamów → odbierz → używaj) — 3 zdjęcia do oczywistości marnują scroll i budżet fotografa, weź W1. Nie używaj też, gdy landing ma już komplet placeholderów figure w Features (F3/F6) — dwie foto-ciężkie sekcje obok siebie spowalniają stronę.

---

## W3 — Numerowany spec-strip (techniczny, evidence)

**Kiedy:** style evidence / clinical-warmth / swiss-grid i produkty techniczne, gdzie precyzja procedury sprzedaje (urządzenia pomiarowe, filtracja, sprzęt warsztatowy). Czyta się jak kartka ze specyfikacji — zero ozdobników.

**Kategoria:** evidence, clinical, swiss, precision tools, tech z procedurą.

**Klasy wymagane:** `<section class="how">` z `id="how"`, dokładnie 3× `<article class="how-step spec-step">`.
**Klasa identyfikująca (FROZEN, v5.0):** `how-v-spec` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

```html
<section class="how how-v-spec" id="how">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">Nº 04 · Procedura</div>
      <h2>[Headline o procedurze] <em>[kluczowe]</em>.</h2>
    </div>
    <div class="spec-steps">
      <!-- SCROLLABILITY: budżet liczb How It Works = 0. [parametr] wypełnij liczbą TYLKO gdy
           globalny budżet 8-12 liczb na landing nie jest wyczerpany — inaczej wpisz frazę
           bez cyfr (np. „bez narzędzi", „jedna dłoń", „gotowe od razu"). -->
      <article class="how-step spec-step">
        <div class="spec-step-num">01</div>
        <div class="spec-step-body">
          <h3>[Krok 1 — czasownik, co robi użytkownik]</h3>
          <p>[1 zdanie: jak przebiega i po czym poznasz, że gotowe].</p>
        </div>
        <div class="spec-step-param">[parametr lub fraza bez cyfr]</div>
      </article>
      <article class="how-step spec-step">
        <div class="spec-step-num">02</div>
        <div class="spec-step-body">
          <h3>[Krok 2 — czasownik]</h3>
          <p>[1 zdanie: co dzieje się w urządzeniu/produkcie].</p>
        </div>
        <div class="spec-step-param">[parametr lub fraza bez cyfr]</div>
      </article>
      <article class="how-step spec-step">
        <div class="spec-step-num">03</div>
        <div class="spec-step-body">
          <h3>[Krok 3 — efekt]</h3>
          <p>[1 zdanie: mierzalny lub widoczny rezultat].</p>
        </div>
        <div class="spec-step-param">[parametr lub fraza bez cyfr]</div>
      </article>
    </div>
  </div>
</section>
```

```css
.how-v-spec{padding:120px 0}
.spec-steps{border-top:1px solid var(--rule)}
.spec-step{display:grid;grid-template-columns:96px 1fr auto;gap:32px;align-items:center;padding:36px 0;border-bottom:1px solid var(--rule)}
.spec-step-num{font-family:var(--font-mono);font-size:clamp(36px,4vw,52px);font-weight:400;line-height:1;letter-spacing:-.02em;color:var(--primary)}
.spec-step-body h3{font-family:var(--font-display);font-size:22px;font-weight:500;letter-spacing:-.01em;margin-bottom:8px}
.spec-step-body p{font-family:var(--font-body);font-size:15px;color:var(--muted);line-height:1.6;max-width:520px}
.spec-step-param{font-family:var(--font-mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);border:1px solid var(--rule);border-radius:999px;padding:10px 16px;white-space:nowrap;text-align:right}
@media(max-width:768px){.how-v-spec{padding:80px 0}.spec-step{grid-template-columns:64px 1fr;gap:16px;padding:28px 0}.spec-step-num{font-size:32px}.spec-step-param{grid-column:2;justify-self:start;text-align:left}}
```

**Kiedy NIE używać:** dla ciepłych stylów lifestyle/beauty/food — spec-strip wygląda jak instrukcja serwisowa i zabija desire. Jeśli wypełnisz wszystkie 3 parametry liczbami, sekcja staje się trzecim „dense" kandydatem — przy 2 już obecnych (KPI/spec table/versus) zostaw frazy bez cyfr albo weź W1.

---

# 7. COMPARISON — 3 warianty (sekcja Nº 08)

### Reguła C — zawsze vs KATEGORIA

> ⛔ Porównanie budujesz ZAWSZE jako „[Marka] vs zwykłe [kategoria produktu]" lub „vs stary sposób" — **NIGDY nazwany konkurent** (marka, model, sklep, „tańsze zamienniki z [serwis]"). Nazwany konkurent = ryzyko z ustawy o zwalczaniu nieuczciwej konkurencji (reklama porównawcza, art. 16 u.z.n.k.). Reguła obejmuje nagłówki, komórki tabeli, alt-texty, aria-label i briefy fotografa. Kolumna/karta „zwykłe [kategoria]" opisuje cechy KATEGORII, nie konkretnego produktu z rynku.

## C1 — Tabela ✓/✗ (porównanie cech)

**Kiedy:** najmocniejsza sekcja konwersyjna dla comparison shoppera — klient świadomy produktu, porównuje przed zakupem. Produkt ma ≥4 wyraźne przewagi cechowe nad kategorią.

**Kategoria:** wszystkie z konkretnymi przewagami (AGD, tools, tech, value products).
**Persona emotion:** skepticism, value-seeking.
**Price:** wszystkie (najlepiej budget-mid, gdzie klient porównuje).

**Klasy wymagane:** `<section class="comparison">` (łapane przez verify-landing Grupa 11), wewnątrz `class="vs-table"`.
**Klasa identyfikująca (FROZEN, v5.0):** `comp-v-table` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

```html
<section class="comparison comp-v-table">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">Nº 08 · Porównanie</div>
      <h2>[Marka] vs zwykłe [kategoria]. <em>Cecha po cesze.</em></h2>
    </div>
    <div class="vs-table-wrap">
      <table class="vs-table">
        <thead>
          <tr>
            <th class="vs-col-feature">Co porównujesz</th>
            <th>Zwykłe [kategoria]</th>
            <th class="vs-col-brand">[Marka]</th>
          </tr>
        </thead>
        <tbody>
          <!-- 4-6 wierszy. Max 2-3 liczby w CAŁEJ tabeli (SCROLLABILITY) — reszta ✓/✗ + 2-4 słowa.
               Kolumna „zwykłe" opisuje KATEGORIĘ, nigdy nazwany produkt konkurenta (Reguła C). -->
          <tr><td>[Cecha 1 — np. czas montażu]</td><td><span class="vs-x">✗</span> [jak wypada zwykłe]</td><td class="vs-col-brand"><span class="vs-check">✓</span> [konkret marki, np. 3 min]</td></tr>
          <tr><td>[Cecha 2 — funkcja]</td><td><span class="vs-x">✗</span> [brak / wymaga dokupienia]</td><td class="vs-col-brand"><span class="vs-check">✓</span> [w zestawie]</td></tr>
          <tr><td>[Cecha 3 — materiał/mechanizm]</td><td><span class="vs-x">✗</span> [słabszy odpowiednik]</td><td class="vs-col-brand"><span class="vs-check">✓</span> [konkret materiału]</td></tr>
          <tr><td>[Cecha 4 — akcesoria]</td><td><span class="vs-x">✗</span> [kupujesz osobno]</td><td class="vs-col-brand"><span class="vs-check">✓</span> [w cenie]</td></tr>
          <tr><td>[Cecha 5 — zwrot]</td><td><span class="vs-x">✗</span> [standard sklepu]</td><td class="vs-col-brand"><span class="vs-check">✓</span> [30 dni na zwrot]</td></tr>
        </tbody>
      </table>
    </div>
    <p class="vs-swipe-hint">← Przesuń tabelę →</p>
    <div class="vs-cta-row">
      <a href="#offer" class="btn-primary">Zamów [Marka] →</a>
    </div>
  </div>
</section>
```

```css
.vs-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:0 -24px;padding:0 24px}
.vs-table{width:100%;min-width:600px;border-collapse:separate;border-spacing:0;background:var(--paper);border:1px solid var(--rule);border-radius:16px;overflow:hidden}
.vs-table th,.vs-table td{padding:16px 20px;text-align:left;font-family:var(--font-body);font-size:15px;line-height:1.45;color:var(--ink);border-bottom:1px solid var(--rule)}
.vs-table thead th{font-family:var(--font-accent);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.vs-table tbody tr:last-child td{border-bottom:none}
.vs-table td:first-child{font-weight:600}
.vs-table .vs-col-brand{position:relative;font-weight:600}
.vs-table .vs-col-brand::before{content:"";position:absolute;inset:0;background:var(--primary);opacity:.08;pointer-events:none}
.vs-table thead .vs-col-brand{color:var(--primary)}
.vs-check{color:var(--primary);font-weight:700;margin-right:6px}
.vs-x{color:var(--muted);margin-right:6px}
.vs-swipe-hint{display:none;text-align:center;font-family:var(--font-accent);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-top:12px}
.vs-cta-row{text-align:center;margin-top:32px}
.vs-cta-row .btn-primary{display:inline-flex;align-items:center;min-height:48px}
@media(max-width:768px){.vs-table-wrap{margin:0 -16px;padding:0 16px}.vs-table th,.vs-table td{padding:13px 14px;font-size:14px}.vs-swipe-hint{display:block}}
```

**Kiedy NIE używać:** to sekcja **dense** (SCROLLABILITY: max 2 dense/landing) — nie łącz z KPI dashboardem + spec table w jednym landingu. Nie używaj też, gdy produkt ma <4 realne przewagi (puste ✗ wyglądają jak strawman) ani w stylach quiet/japandi/clinical (tam C3).

---

## C2 — Karty „z produktem vs bez" (emocjonalne)

**Kiedy:** zakup emocjonalny, problem-aware persona — klient kupuje zmianę codzienności, nie specyfikację. Dwie sceny: życie bez produktu vs z produktem.

**Kategoria:** transformation, lifestyle, home, wellness, produkty „ulgi od frustracji".
**Persona emotion:** frustracja → ulga, anxiety → reassurance.
**Price:** wszystkie.

**Klasy wymagane:** `<section class="comparison">` (łapane przez verify-landing Grupa 11), wewnątrz 2× `class="vs-card"`.
**Klasa identyfikująca (FROZEN, v5.0):** `comp-v-cards` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

```html
<section class="comparison comp-v-cards">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">Nº 08 · Porównanie</div>
      <h2>Bez i z [Marka]. <em>Ta sama czynność, dwa wyniki.</em></h2>
    </div>
    <!-- Max 2 liczby ŁĄCZNIE w obu kartach (SCROLLABILITY). Bullety = akcja + konkret, zero poetyki. -->
    <div class="vs-cards">
      <article class="vs-card vs-without">
        <div class="vs-card-tag">Zwykłe [kategoria]</div>
        <div class="vs-card-figure">
          <div class="ph">
            <div class="ph-mark">B</div>
            <div class="ph-title">Scena „bez" — pain point</div>
            <div class="ph-size">800 × 600</div>
            <div class="ph-note">Realna scena problemu starym sposobem. Światło płaskie, kadr IDENTYCZNY jak w karcie „z" obok.</div>
          </div>
        </div>
        <ul class="vs-list">
          <li><span class="vs-x">✗</span> [Pain 1 — co zabiera czas]</li>
          <li><span class="vs-x">✗</span> [Pain 2 — co się nie udaje]</li>
          <li><span class="vs-x">✗</span> [Pain 3 — co trzeba powtarzać/dokupywać]</li>
        </ul>
      </article>
      <article class="vs-card vs-with">
        <div class="vs-card-tag">Z [Marka]</div>
        <div class="vs-card-figure">
          <div class="ph">
            <div class="ph-mark">Z</div>
            <div class="ph-title">Scena „z [Marka]" — efekt</div>
            <div class="ph-size">800 × 600</div>
            <div class="ph-note">Ten sam kadr co „bez", produkt w użyciu, efekt widoczny. Światło cieplejsze, scena uporządkowana.</div>
          </div>
        </div>
        <ul class="vs-list">
          <li><span class="vs-check">✓</span> [Gain 1 — akcja + liczba, np. gotowe w 12 min]</li>
          <li><span class="vs-check">✓</span> [Gain 2 — co odpada z listy obowiązków]</li>
          <li><span class="vs-check">✓</span> [Gain 3 — efekt, który widać]</li>
        </ul>
        <a href="#offer" class="btn-primary vs-card-cta">Wybieram [Marka] →</a>
      </article>
    </div>
  </div>
</section>
```

```css
.vs-cards{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:stretch}
.vs-card{background:var(--paper);border:1px solid var(--rule);border-radius:20px;padding:28px;display:flex;flex-direction:column;gap:18px}
.vs-card-tag{font-family:var(--font-accent);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
.vs-card-figure{aspect-ratio:4/3;border-radius:12px;overflow:hidden}
.vs-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}
.vs-list li{font-family:var(--font-body);font-size:15px;line-height:1.5;display:flex;gap:10px;align-items:flex-start}
.vs-without .vs-card-figure{filter:grayscale(.55) contrast(.92)}
.vs-without .vs-list li{color:var(--muted)}
.vs-with{border:2px solid var(--primary)}
.vs-with .vs-card-tag{color:var(--primary)}
.vs-with .vs-list li{color:var(--ink);font-weight:500}
.vs-card-cta{margin-top:auto;display:inline-flex;align-items:center;justify-content:center;min-height:48px}
.vs-check{color:var(--primary);font-weight:700}
.vs-x{color:var(--muted)}
@media(max-width:768px){.vs-cards{grid-template-columns:1fr;gap:16px}.vs-card{padding:22px}}
```

**Kiedy NIE używać:** gdy przewaga produktu jest czysto techniczna/mierzalna i klient jest product-aware (porównuje parametry — wtedy C1). Nie używaj też, gdy landing ma już hero H10 Before/After — dwie sekcje „przed/po" obok siebie to redundancja.

---

## C3 — Jednowierszowy spec-bar (minimalny, quiet)

**Kiedy:** produkt z JEDNĄ killer-metryką, gdzie więcej = lepiej (moc, zasięg, liczba cykli, m² na jednym ładowaniu). Styl quiet — porównanie szepcze, nie krzyczy.

**Kategoria:** premium minimal, japandi, clinical, quiet luxury.
**Persona emotion:** connoisseur, desire (bez agresywnej sprzedaży).
**Price:** mid-premium.

**Klasy wymagane:** `<section class="comparison">` (łapane przez verify-landing Grupa 11), wewnątrz `class="vs-bar"`.
**Klasa identyfikująca (FROZEN, v5.0):** `comp-v-bar` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

```html
<section class="comparison comp-v-bar">
  <div class="container">
    <div class="vs-bar-head">
      <div class="eyebrow">Nº 08 · Porównanie</div>
      <h2>Zwykłe [kategoria] vs [Marka]. <em>Jedna miara wystarczy.</em></h2>
    </div>
    <!-- Wybierz metrykę, w której WIĘCEJ = LEPIEJ — pasek marki MUSI być dłuższy.
         Dokładnie 2 liczby w całej sekcji. Szary odcinek = gdzie kończy kategoria. -->
    <div class="vs-bar" role="img" aria-label="Zwykłe [kategoria]: [N] [jednostka]. [Marka]: [3×N] [jednostka].">
      <div class="vs-bar-side">
        <div class="vs-bar-name">Zwykłe [kategoria]</div>
        <div class="vs-bar-val">[N] [jednostka]</div>
      </div>
      <div class="vs-bar-meter">
        <div class="vs-bar-old" style="width:30%"></div>
      </div>
      <div class="vs-bar-side is-brand">
        <div class="vs-bar-name">[Marka]</div>
        <div class="vs-bar-val">[3×N] [jednostka]</div>
      </div>
    </div>
    <p class="vs-bar-note">[1 zdanie: mechanizm odpowiadający za różnicę — bez claimów zdrowotnych].</p>
  </div>
</section>
```

```css
.comp-v-bar .container{max-width:880px}
.vs-bar-head{text-align:center;margin-bottom:48px}
.vs-bar-head .eyebrow{justify-content:center}
.vs-bar{display:grid;grid-template-columns:auto 1fr auto;gap:24px;align-items:center;padding:28px 0;border-top:1px solid var(--rule);border-bottom:1px solid var(--rule)}
.vs-bar-name{font-family:var(--font-accent);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-bottom:6px;white-space:nowrap}
.vs-bar-val{font-family:var(--font-display);font-size:24px;color:var(--ink);white-space:nowrap}
.vs-bar-side.is-brand{text-align:right}
.vs-bar-side.is-brand .vs-bar-name{color:var(--primary)}
.vs-bar-side.is-brand .vs-bar-val{color:var(--primary);font-weight:600}
.vs-bar-meter{position:relative;height:8px;border-radius:999px;background:var(--primary);min-width:120px}
.vs-bar-old{position:absolute;left:0;top:0;bottom:0;border-radius:999px 0 0 999px;background:var(--rule)}
.vs-bar-note{text-align:center;font-family:var(--font-body);font-size:14px;color:var(--muted);margin-top:24px;max-width:520px;margin-left:auto;margin-right:auto}
@media(max-width:768px){.vs-bar{grid-template-columns:1fr;gap:14px;padding:24px 0}.vs-bar-side.is-brand{text-align:left}}
```

**Kiedy NIE używać:** gdy produkt nie ma jednej metryki typu „więcej = lepiej" (np. przewaga to czas — krótszy pasek marki czyta się jako przegrana) albo gdy przewag jest ≥4 i klient porównuje cechy (wtedy C1). Nie używaj w stylach głośnych/retro — jeden cichy pasek ginie między gęstymi sekcjami.

---

---

# 4. OFFER — 3 warianty

> Offer box = 80% konwersji po Hero ([`04-design.md` sekcja H](../04-design.md) — kanon OBOWIĄZKOWY). Warianty O różnią się układem, ale **każdy zawiera pełną anatomię H**: stara cena przekreślona + savings badge + „Oszczędzasz N zł" + `.offer-shipping` pod ceną + rating 4,6-4,8 z `data-placeholder` i przypisem [1] + guarantee pod CTA + trust strip + BLIK-first payment + primary CTA z `data-demo-modal` (nigdy martwy, H.11). Budżet liczb sekcji Offer: 2-3 (cena, oszczędność, dni gwarancji) — patrz SCROLLABILITY RULES w [`02-generate.md`](../02-generate.md).

## O1 — Single offer box (kanon H, DEFAULT)

**Kiedy:** default dla każdego landingu z jednym produktem / jednym zestawem. Pełna anatomia H.1 Z-pattern w jednej karcie — wariant referencyjny, w 100% zgodny z kanonem H. Jeśli żaden guardrail O2/O3 nie pasuje → bierzesz O1.

**Kategoria:** wszystkie (default).
**Price:** wszystkie.

**Klasy wymagane:** `<section class="offer" id="offer">`, karta `class="offer-box" id="offer-box"` (id wymagane przez dwuwarunkowy gating sticky-CTA, H.7), wewnątrz: `offer-rating` + `stars`, `offer-price-old`, `save-badge`, `save-text` („Oszczędzasz N zł"), `offer-shipping`, `offer-cta` z `href="#" data-demo-modal` (albo realny checkout URL — H.11), `offer-guarantee`, `trust-strip`, `pay-row` (BLIK pierwszy).
**Klasa identyfikująca (FROZEN, v5.0):** `offer-v-single` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

```html
<section class="offer offer-v-single" id="offer">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">Nº 11 · Oferta</div>
      <h2>[Headline oferty: co dostaje + 1 korzyść] <em>[kluczowe]</em>.</h2>
    </div>
    <div class="offer-box" id="offer-box">
      <span class="offer-badge">Bestseller · −25%</span><!-- sticker tylko jeśli uzasadniony danymi (H.6) -->
      <div class="offer-grid">
        <div class="offer-visual">
          <figure class="offer-figure">
            <div class="ph">
              <div class="ph-mark">O</div>
              <div class="ph-title">Zestaw oferty (show-what-you-get)</div>
              <div class="ph-size">1000 × 1250 (4:5)</div>
              <div class="ph-note">Wszystko co klient dostaje w pudełku: produkt + akcesoria + opakowanie. Flat-lay lub lekki kąt, jasne tło, miękkie światło.</div>
            </div>
          </figure>
        </div>
        <div class="offer-main">
          <div class="offer-rating">
            <span class="stars">★★★★★</span>
            <span>4,7/5 · <strong data-placeholder="reviews">1 247</strong> opinii<sup><a href="#footnote-reviews">[1]</a></sup></span>
          </div>
          <!-- Przypis [1] do stopki: „Ocena i liczba opinii mają charakter poglądowy (faza wprowadzenia produktu) — do podmiany na realne dane sklepu." (H.3, wzorzec cervana) -->
          <h3>[Nazwa produktu / zestawu]</h3>
          <p class="offer-lede">[Lede max 12 słów: problem → rozwiązanie].</p>
          <div class="price-row">
            <span class="offer-price-old">199 zł</span>
            <span class="offer-price-now">149 zł</span>
            <span class="save-badge">−25%</span>
          </div>
          <p class="save-text">Oszczędzasz 50 zł</p>
          <p class="offer-shipping">Darmowa dostawa · InPost / DPD / kurier</p>
          <ul class="offer-includes">
            <li>[Benefit 1: benefit → feature → emocja, np. „Filtr 27 dB — dziecko śpi mimo hałasu wesela"]</li>
            <li>[Benefit 2]</li>
            <li>[Benefit 3]</li>
            <li>[Benefit 4 — max 5 pozycji]</li>
          </ul>
          <a href="#" data-demo-modal class="offer-cta magnetic">Zamawiam — 149 zł</a>
          <!-- Handler data-demo-modal: patterns.md #24 Demo-Checkout Modal (H.11). Gdy workflow ma realny checkout URL → podmień href, usuń data-demo-modal. -->
          <div class="offer-guarantee">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></svg>
            <span>30 dni na zwrot · bez pytań</span>
          </div>
          <div class="trust-strip">
            <div><b>Darmowa</b> dostawa</div>
            <div><b>30 dni</b> na zwrot</div>
            <div><b>2 lata</b> gwarancji</div>
          </div>
          <div class="pay-row">
            <span class="pay-chip">BLIK</span>
            <span class="pay-chip">Visa / Mastercard</span>
            <span class="pay-chip">Przelewy24</span>
            <span class="pay-chip">Apple Pay</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

```css
.offer{padding:120px 0}
.offer-box{position:relative;max-width:960px;margin:0 auto;background:var(--paper);border:1px solid var(--rule);border-radius:24px;overflow:hidden}
.offer-badge{position:absolute;top:18px;right:18px;z-index:2;padding:8px 14px;background:var(--accent,var(--primary));color:#fff;border-radius:8px;font-family:var(--font-body);font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;transform:rotate(-3deg)}
.offer-grid{display:grid;grid-template-columns:1fr 1.1fr}
.offer-visual{position:relative;min-height:480px}
.offer-figure{position:absolute;inset:0;margin:0;overflow:hidden}
.offer-main{padding:48px 44px}
.offer-rating{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--muted);margin-bottom:16px}
.offer-rating .stars{color:var(--accent,var(--primary));font-size:15px;letter-spacing:2px}
.offer-main h3{font-family:var(--font-display);font-size:30px;font-weight:500;letter-spacing:-.02em;color:var(--ink);margin-bottom:8px}
.offer-lede{font-size:15px;color:var(--muted);line-height:1.5;margin-bottom:22px}
.price-row{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap}
.offer-price-old{font-size:22px;color:var(--muted);text-decoration:line-through}
.offer-price-now{font-family:var(--font-display);font-size:clamp(44px,5vw,56px);font-weight:600;line-height:1;letter-spacing:-.02em;color:var(--ink)}
.save-badge{padding:5px 11px;background:var(--accent,var(--primary));color:#fff;border-radius:999px;font-size:12px;font-weight:700;transform:rotate(-3deg)}
.save-text{font-size:14px;font-weight:600;color:var(--primary);margin-top:8px}
.offer-shipping{font-size:13px;color:var(--muted);margin:6px 0 22px}
.offer-includes{list-style:none;padding:0;margin:0 0 26px;display:flex;flex-direction:column;gap:10px}
.offer-includes li{position:relative;padding-left:26px;font-size:15px;line-height:1.5;color:var(--ink)}
.offer-includes li::before{content:"✓";position:absolute;left:0;color:var(--primary);font-weight:700}
.offer-cta{display:flex;align-items:center;justify-content:center;width:100%;min-height:58px;background:var(--primary);color:#fff;border-radius:14px;font-family:var(--font-body);font-size:17px;font-weight:700;text-decoration:none;transition:transform .2s,box-shadow .2s}
.offer-cta:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(0,0,0,.15)}
.offer-guarantee{display:flex;gap:9px;align-items:center;justify-content:center;font-size:13px;color:var(--muted);margin-top:14px}
.trust-strip{display:flex;justify-content:space-between;gap:12px;border-top:1px solid var(--rule);margin-top:26px;padding-top:18px;font-size:12px;color:var(--muted);text-align:center}
.trust-strip b{color:var(--ink)}
.pay-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}
.pay-chip{padding:6px 12px;border:1px solid var(--rule);border-radius:999px;font-size:11px;font-weight:600;letter-spacing:.04em;color:var(--muted)}
@media(max-width:768px){.offer{padding:80px 0}.offer-grid{grid-template-columns:1fr}.offer-visual{min-height:0}.offer-figure{position:relative;aspect-ratio:4/3}.offer-main{padding:32px 22px}.offer-price-now{font-size:40px}.offer-price-old{font-size:18px}.trust-strip{flex-direction:column;gap:8px;text-align:left}}
```

**Kiedy NIE używać:** w zasadzie nigdy — to bezpieczny default. Ustępuje tylko O2 (gdy spełnione OBA guardraile multipacka i celem kampanii jest AOV) lub O3 (gdy ruch jest product-aware i główną obiekcją jest ryzyko zakupu).

---

## O2 — Multipack 1/2/3 szt. (dźwignia AOV)

**Kiedy:** dźwignia AOV. GUARDRAILE: (a) wybieraj TYLKO gdy produkt zużywalny/parowalny ORAZ cena jednostkowa <300 zł — inaczej first-match spada do O1; (b) ceny pakietów liczone DETERMINISTYCZNIE z ceny jednostkowej wg formuły: 2 szt = 2×cena −10%, 3 szt = 3×cena −15% (zaokrąglone do pełnych zł w dół), ZAKAZ wymyślania kwot ad hoc; (c) obowiązkowy komentarz `<!-- DEMO-PRICING: ceny pakietów z formuły -10%/-15%, do akceptacji klienta -->` w HTML.

**Kategoria:** consumables (kosmetyki, suplementy, wkłady, filtry), produkty parowalne (wkładki, skarpetki kompresyjne, akcesoria kupowane „dla dwojga / na zapas").
**Price:** budget-mid (<300 zł/szt. — twardy guardrail (a)).
**Budżet liczb:** multipack to sekcja dense — zjada ~6-8 z landingowego budżetu 8-12 liczb. Reszta landingu musi być lżejsza (Hero 1 liczba, Features 0-1).

**Klasy wymagane:** `<section class="offer" id="offer">`, wrapper kart `id="offer-box"`, `offer-rating` + `stars`, `offer-price-old` (suma cen jednostkowych, przekreślona), `save-badge`, `save-text`, `offer-shipping`, featured CTA `class="offer-cta ..."` z `data-demo-modal`, `offer-guarantee`, `trust-strip`, `pay-row` (BLIK pierwszy).
**Klasa identyfikująca (FROZEN, v5.0):** `offer-v-multipack` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

Przykład formuły dla ceny jednostkowej 149 zł: 2 szt = 298 −10% = **268 zł**; 3 szt = 447 −15% = **379 zł** (floor do pełnych zł). Przekreślona „stara cena" pakietu = suma cen jednostkowych (referencja realna, zgodna z EU Omnibus).

```html
<section class="offer offer-v-multipack" id="offer">
  <!-- DEMO-PRICING: ceny pakietów z formuły -10%/-15%, do akceptacji klienta -->
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">Nº 11 · Oferta</div>
      <h2>[Headline: im więcej, tym taniej] <em>[kluczowe]</em>.</h2>
      <div class="offer-rating">
        <span class="stars">★★★★★</span>
        <span>4,7/5 · <strong data-placeholder="reviews">1 247</strong> opinii<sup><a href="#footnote-reviews">[1]</a></sup></span>
      </div>
    </div>
    <div class="packs-grid" id="offer-box">
      <article class="pack-card">
        <figure class="pack-figure">
          <div class="ph">
            <div class="ph-mark">1</div>
            <div class="ph-title">Packshot 1 szt.</div>
            <div class="ph-size">800 × 600 (4:3)</div>
            <div class="ph-note">Jedna sztuka produktu. Ten sam kadr, tło i światło co pozostałe pakiety — różnica tylko w liczbie sztuk.</div>
          </div>
        </figure>
        <h3 class="pack-name">1 sztuka</h3>
        <div class="pack-price-row"><span class="pack-price">149 zł</span></div>
        <p class="pack-unit">[na start / na próbę]</p>
        <a href="#" data-demo-modal class="pack-cta">Wybieram — 149 zł</a>
      </article>
      <article class="pack-card pack-featured">
        <span class="pack-flag">Najczęściej wybierane</span>
        <figure class="pack-figure">
          <div class="ph">
            <div class="ph-mark">2</div>
            <div class="ph-title">Packshot 2 szt.</div>
            <div class="ph-size">800 × 600 (4:3)</div>
            <div class="ph-note">Dwie sztuki obok siebie — identyczna kompozycja jak karta 1 szt.</div>
          </div>
        </figure>
        <h3 class="pack-name">2 sztuki</h3>
        <div class="pack-price-row">
          <span class="offer-price-old">298 zł</span>
          <span class="pack-price">268 zł</span>
          <span class="save-badge">−10%</span>
        </div>
        <p class="save-text">Oszczędzasz 30 zł · 134 zł/szt.</p>
        <a href="#" data-demo-modal class="offer-cta magnetic">Zamawiam 2 szt. — 268 zł</a>
      </article>
      <article class="pack-card">
        <figure class="pack-figure">
          <div class="ph">
            <div class="ph-mark">3</div>
            <div class="ph-title">Packshot 3 szt.</div>
            <div class="ph-size">800 × 600 (4:3)</div>
            <div class="ph-note">Trzy sztuki w spójnej kompozycji serii — to samo tło i światło.</div>
          </div>
        </figure>
        <h3 class="pack-name">3 sztuki</h3>
        <div class="pack-price-row">
          <span class="offer-price-old">447 zł</span>
          <span class="pack-price">379 zł</span>
          <span class="save-badge">−15%</span>
        </div>
        <p class="save-text">Oszczędzasz 68 zł</p>
        <a href="#" data-demo-modal class="pack-cta">Wybieram — 379 zł</a>
      </article>
    </div>
    <div class="offer-meta">
      <p class="offer-shipping">Darmowa dostawa · InPost / DPD / kurier</p>
      <div class="offer-guarantee">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></svg>
        <span>30 dni na zwrot · bez pytań · dotyczy każdego pakietu</span>
      </div>
      <div class="trust-strip">
        <div><b>Darmowa</b> dostawa</div>
        <div><b>30 dni</b> na zwrot</div>
        <div><b>2 lata</b> gwarancji</div>
      </div>
      <div class="pay-row">
        <span class="pay-chip">BLIK</span>
        <span class="pay-chip">Visa / Mastercard</span>
        <span class="pay-chip">Przelewy24</span>
        <span class="pay-chip">Apple Pay</span>
      </div>
    </div>
  </div>
</section>
```

```css
.offer{padding:120px 0}
.offer .section-head .offer-rating{display:flex;justify-content:center;align-items:center;gap:10px;font-size:13px;color:var(--muted);margin-top:14px}
.offer-rating .stars{color:var(--accent,var(--primary));font-size:15px;letter-spacing:2px}
.packs-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:1040px;margin:0 auto;align-items:stretch}
.pack-card{position:relative;display:flex;flex-direction:column;background:var(--paper);border:1px solid var(--rule);border-radius:20px;padding:28px 22px;text-align:center}
.pack-featured{border:2px solid var(--primary);transform:translateY(-10px)}
.pack-flag{position:absolute;top:-14px;left:50%;transform:translateX(-50%);white-space:nowrap;padding:6px 14px;background:var(--primary);color:#fff;border-radius:999px;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}
.pack-figure{margin:0 0 18px;aspect-ratio:4/3;border-radius:12px;overflow:hidden}
.pack-name{font-family:var(--font-display);font-size:21px;font-weight:500;color:var(--ink);margin-bottom:6px}
.pack-price-row{display:flex;justify-content:center;align-items:baseline;gap:10px;flex-wrap:wrap;margin:10px 0 4px}
.offer-price-old{font-size:17px;color:var(--muted);text-decoration:line-through}
.pack-price{font-family:var(--font-display);font-size:34px;font-weight:600;line-height:1;letter-spacing:-.02em;color:var(--ink)}
.pack-featured .pack-price{font-size:42px}
.save-badge{padding:4px 10px;background:var(--accent,var(--primary));color:#fff;border-radius:999px;font-size:11px;font-weight:700;transform:rotate(-3deg)}
.save-text{font-size:13px;font-weight:600;color:var(--primary);margin-bottom:18px}
.pack-unit{font-size:13px;color:var(--muted);margin-bottom:18px}
.pack-cta{margin-top:auto;display:flex;align-items:center;justify-content:center;min-height:50px;border:1.5px solid var(--ink);border-radius:12px;color:var(--ink);font-size:15px;font-weight:700;text-decoration:none}
.pack-featured .offer-cta{margin-top:auto;display:flex;align-items:center;justify-content:center;min-height:56px;background:var(--primary);color:#fff;border-radius:12px;font-size:16px;font-weight:700;text-decoration:none}
.offer-meta{max-width:1040px;margin:32px auto 0;text-align:center}
.offer-shipping{font-size:13px;color:var(--muted);margin-bottom:12px}
.offer-guarantee{display:flex;gap:9px;align-items:center;justify-content:center;font-size:13px;color:var(--muted)}
.trust-strip{display:flex;justify-content:center;gap:32px;border-top:1px solid var(--rule);margin-top:22px;padding-top:18px;font-size:12px;color:var(--muted)}
.trust-strip b{color:var(--ink)}
.pay-row{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:16px}
.pay-chip{padding:6px 12px;border:1px solid var(--rule);border-radius:999px;font-size:11px;font-weight:600;letter-spacing:.04em;color:var(--muted)}
@media(max-width:900px){.offer{padding:80px 0}.packs-grid{grid-template-columns:1fr;max-width:420px}.pack-featured{transform:none;order:-1;margin-top:14px}.trust-strip{flex-direction:column;gap:8px;align-items:center}}
```

**Kiedy NIE używać:** produkty trwałe kupowane raz na lata (AGD, elektronika, meble) i wszystko ≥300 zł/szt. — wybór pakietu dodaje friction i tłumi konwersję zamiast podnosić AOV. Nie używaj też, gdy klient nie zatwierdził polityki rabatowej — ceny z formuły to DEMO do akceptacji, nie cennik.

---

## O3 — Guarantee-led (gwarancja jako nagłówek boxu)

**Kiedy:** risk-reversal NAD ceną — „30 dni testu. Nie działa — oddajemy 100%." jako nagłówek karty (wzorzec Ridge „99 dni" ze swipe corpus), dopiero potem cena+CTA. Dla stylów quiet/evidence (clinical-warmth, apothecary, swiss-grid) i ruchu product-aware (remarketing, klient zna produkt — ostatnią obiekcją jest ryzyko, nie cena).

**Kategoria:** wellness, health, ortopedia, produkty „nie uwierzę, dopóki nie sprawdzę na sobie".
**Persona emotion:** skepticism / risk-aversion.
**Price:** mid-premium (200+).

**Klasy wymagane:** `<section class="offer" id="offer">`, karta `class="offer-box offer-gbox" id="offer-box"`, `offer-rating` + `stars`, `offer-price-old`, `save-badge`, `save-text`, `offer-shipping`, `offer-cta` z `data-demo-modal` (albo realny checkout URL — H.11), `offer-guarantee` (mikro-gwarancja POD CTA zostaje mimo nagłówka — wymóg H.3), `trust-strip`, `pay-row` (BLIK pierwszy).
**Klasa identyfikująca (FROZEN, v5.0):** `offer-v-guarantee` — dodaj do `<section>`; NIEMODYFIKOWALNA (verify-landing mapuje deklarację z briefu sekcji 9 na tę klasę).

```html
<section class="offer offer-v-guarantee" id="offer">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">Nº 11 · Oferta</div>
      <h2>[Headline oferty] <em>[kluczowe]</em>.</h2>
    </div>
    <div class="offer-box offer-gbox" id="offer-box">
      <div class="gbox-head">
        <h3>30 dni testu. Nie działa — oddajemy 100%.</h3>
        <p>Używasz [produkt] u siebie przez 30 dni. Odeślesz — zwracamy pełną kwotę. Bez formularzy, bez pytań.</p>
      </div>
      <div class="gbox-body">
        <figure class="gbox-figure">
          <div class="ph">
            <div class="ph-mark">G</div>
            <div class="ph-title">Produkt w użyciu (lifestyle)</div>
            <div class="ph-size">1000 × 625 (16:10)</div>
            <div class="ph-note">Produkt w realnym użyciu w domu klienta — spokojny kadr, naturalne światło, zero studyjnego packshotu. Obraz ma uwiarygadniać obietnicę testu.</div>
          </div>
        </figure>
        <div class="offer-rating">
          <span class="stars">★★★★★</span>
          <span>4,7/5 · <strong data-placeholder="reviews">1 247</strong> opinii<sup><a href="#footnote-reviews">[1]</a></sup></span>
        </div>
        <p class="gbox-product">[Nazwa produktu / zestawu]</p>
        <ul class="offer-includes">
          <li>[Benefit 1: benefit → feature → emocja]</li>
          <li>[Benefit 2]</li>
          <li>[Benefit 3 — w tym wariancie max 3, gwarancja gra pierwsze skrzypce]</li>
        </ul>
        <div class="price-row">
          <span class="offer-price-old">199 zł</span>
          <span class="offer-price-now">149 zł</span>
          <span class="save-badge">−25%</span>
        </div>
        <p class="save-text">Oszczędzasz 50 zł</p>
        <p class="offer-shipping">Darmowa dostawa · InPost / DPD / kurier</p>
        <a href="#" data-demo-modal class="offer-cta">Zamawiam — 149 zł</a>
        <div class="offer-guarantee">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></svg>
          <span>Zwrot 100% w ciągu 30 dni · bez pytań</span>
        </div>
        <div class="trust-strip">
          <div><b>Darmowa</b> dostawa</div>
          <div><b>30 dni</b> na zwrot</div>
          <div><b>2 lata</b> gwarancji</div>
        </div>
        <div class="pay-row">
          <span class="pay-chip">BLIK</span>
          <span class="pay-chip">Visa / Mastercard</span>
          <span class="pay-chip">Przelewy24</span>
          <span class="pay-chip">Apple Pay</span>
        </div>
      </div>
    </div>
  </div>
</section>
```

```css
.offer{padding:120px 0}
.offer-gbox{max-width:600px;margin:0 auto;background:var(--paper);border:1px solid var(--rule);border-radius:24px;overflow:hidden}
.gbox-head{background:var(--ink);color:var(--paper);padding:36px 40px;text-align:center}
.gbox-head h3{font-family:var(--font-display);font-size:clamp(24px,3.2vw,32px);font-weight:500;line-height:1.25;letter-spacing:-.02em;color:inherit}
.gbox-head p{font-size:14px;line-height:1.55;opacity:.82;margin-top:12px;max-width:420px;margin-left:auto;margin-right:auto}
.gbox-body{padding:36px 40px;text-align:center}
.gbox-figure{margin:0 0 22px;aspect-ratio:16/10;border-radius:14px;overflow:hidden}
.offer-rating{display:flex;justify-content:center;align-items:center;gap:10px;font-size:13px;color:var(--muted);margin-bottom:10px}
.offer-rating .stars{color:var(--accent,var(--primary));font-size:15px;letter-spacing:2px}
.gbox-product{font-family:var(--font-display);font-size:24px;font-weight:500;color:var(--ink);margin-bottom:18px}
.offer-includes{list-style:none;padding:0;margin:0 auto 24px;max-width:400px;display:flex;flex-direction:column;gap:9px;text-align:left}
.offer-includes li{position:relative;padding-left:26px;font-size:15px;line-height:1.5;color:var(--ink)}
.offer-includes li::before{content:"✓";position:absolute;left:0;color:var(--primary);font-weight:700}
.price-row{display:flex;justify-content:center;align-items:baseline;gap:14px;flex-wrap:wrap}
.offer-price-old{font-size:20px;color:var(--muted);text-decoration:line-through}
.offer-price-now{font-family:var(--font-display);font-size:clamp(42px,5vw,52px);font-weight:600;line-height:1;letter-spacing:-.02em;color:var(--ink)}
.save-badge{padding:5px 11px;background:var(--accent,var(--primary));color:#fff;border-radius:999px;font-size:12px;font-weight:700;transform:rotate(-3deg)}
.save-text{font-size:14px;font-weight:600;color:var(--primary);margin-top:8px}
.offer-shipping{font-size:13px;color:var(--muted);margin:6px 0 22px}
.offer-cta{display:flex;align-items:center;justify-content:center;width:100%;min-height:58px;background:var(--primary);color:#fff;border-radius:14px;font-family:var(--font-body);font-size:17px;font-weight:700;text-decoration:none;transition:transform .2s,box-shadow .2s}
.offer-cta:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(0,0,0,.15)}
.offer-guarantee{display:flex;gap:9px;align-items:center;justify-content:center;font-size:13px;color:var(--muted);margin-top:14px}
.trust-strip{display:flex;justify-content:space-between;gap:12px;border-top:1px solid var(--rule);margin-top:26px;padding-top:18px;font-size:12px;color:var(--muted)}
.trust-strip b{color:var(--ink)}
.pay-row{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:16px}
.pay-chip{padding:6px 12px;border:1px solid var(--rule);border-radius:999px;font-size:11px;font-weight:600;letter-spacing:.04em;color:var(--muted)}
@media(max-width:768px){.offer{padding:80px 0}.gbox-head{padding:28px 22px}.gbox-body{padding:28px 20px}.offer-price-now{font-size:40px}.trust-strip{flex-direction:column;gap:8px;text-align:left}}
```

**Kiedy NIE używać:** impulse low-ticket (<100 zł), gdzie ryzyko nie jest obiekcją — gwarancja nad ceną osłabia anchor cenowy i spowalnia decyzję; wtedy O1. Nie używaj też, jeśli sklep klienta nie obsługuje realnie 30-dniowego zwrotu ze 100% refundacją — obietnica z nagłówka musi być pokryta operacyjnie, inaczej to dark pattern (H.8).
