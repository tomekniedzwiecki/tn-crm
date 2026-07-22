**Siatka struktury:**
- Sticky topbar: logo, nawigacja, pill COD
- `#hero`
- `#jeden-ruch`
- `#zawies`
- `#zloz`
- `#durszlak`
- `#mycie`
- `#mid-cta`
- `#zamow` + checkout/paybadges placeholders
- `#faq`
- `#final` + paybadges placeholder
- Footer placeholder
- Mobile sticky-buy placeholder
- Reveal observer + wymagany runtime workflow v2

```html
<!doctype html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <title>Odsączek — składany koszyk do smażenia i odsączania | 29,90 zł</title>
  <meta name="description" content="Odsączek to składany koszyk ze stali nierdzewnej do smażenia w garnku lub woku. Wyjmij całą porcję jednym ruchem i zawieś na rancie — olej ocieka do garnka. 29,90 zł · płatność przy odbiorze · 14 dni na zwrot.">
  <meta name="theme-color" content="#F4EFE5">

  <!-- PREVIEW na crm.*; publikacja przez API zdejmuje noindex. -->
  <meta name="robots" content="noindex">
  <link rel="canonical" href="{{CANONICAL_URL}}">

  <meta property="og:type" content="website">
  <meta property="og:title" content="Odsączek — składany koszyk do smażenia i odsączania | 29,90 zł">
  <meta property="og:description" content="Odsączek to składany koszyk ze stali nierdzewnej do smażenia w garnku lub woku. Wyjmij całą porcję jednym ruchem i zawieś na rancie — olej ocieka do garnka. 29,90 zł · płatność przy odbiorze · 14 dni na zwrot.">
  <meta property="og:image" content="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/og-1200x630.jpg">
  <meta property="og:url" content="{{CANONICAL_URL}}">

  <link rel="icon" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAD+UlEQVR4nK2XS4gcRRjHf9/MrI8NZH0cukVcPEh8XAQjOfQc1kAMPg5iQA8mGBH0kG5wCcgGPWgOuQhCkKmLIDmIS7yIoBJEkV1xOgoGRA9684XSLUrYmCg7OzMlX1O99vbOo3cyHxTdXfXV96p//atLmFC8MBBAm4pNTWwnsSMTOK0DvUEOvTBoAP3UxP1JghkpXhjUit/WWtc2smd5zAU7VmScghpKWm0rIlh7GT86+DxwDLi3pHoReBd4NTVx6ubWUxP3Jg7ACwPJS+2FwXPAm1WyAlaS1gf7RW7eYmNHAXiauWlbLPhR8wugWVL5EvgG6AB3AQeALcsE3Jqa+PdRlZChzhdCyxNPqfPvnYNcDiet9rIuSXnd/ai5F/gM2F0Y2p2a+G/F0CBwNoYUQOTJw9YLzdsF538krc89kQZiJHdYz/2LiBq/YK2d86Pme8DjbuyStesCx/s+bFuOxoDss3J5YXA7cCR3kLTOZs69MJgBuiKihnrbtqhIN4VDXhh8DWhF8KP9JjVx6OZ2xlWg756fFPp2icxn+zw18cagkrnMun4Y1O3ico87rrvfjw7l2R6z1oYi0tlWarZmn62TyyYP5Fxq4keqbKmyeGHwAnDafX4E3ALcl7TaohhSP2XU5t9PF/qWHNFU4YwME14YHPXC4AfgRGH4UXUOvOOca7K2HEBess0tl7TOfecQX4leXbB/AXfq8rt5m8BLltpHnI7dggFX9pq1r/X86P15191XXFn7Bn50diy9Jrse6/lRUzP70No18aOHLyt+XBA6dx+3CX4UXJOauDOKB84AzwD/piae5SrEC4PXgePA+dTEQXlcCsC7EVDGuwTsAW5yOheAa3d6cjo8KSYOAnO/vHL62/mTi2pL/exNTXxRfTcKhl8E7hlgKNvLVyE/AafmTy4qdV/v+pYcQCU7v7UnabVf8qOmrteGO+kOlAE0oWgVXgZ+BJQhZ5JW+4SyqdofhoF9wFeO6XK6nVS6DuwPpSb+uDxYKzhVPMzatX9wW2hakie5x65dUT+zxd1UK1FpR+Zm86inLT2Z0xWmUzyQamOinqYMPHlrQ5R3xPkVZa1KANY9lQ+YAgCLNlZKPrYHkJq4pzydtN76bUrV2JybnFr92Z0B/ZFL4EfNusjd+hoU8DAJF9gClh6UG2Yy2+U/olp5lvsbUno+DxinI25n5MQ0qvWdbna4AWdSE3/q/o57lUCYmriv5UpNHBXO9EYhmFGtVkC83hGe/bV0cam83axdRWQhv3JpNY66g2mUKJUvA2Fq4it2ZRV5YIEpX8nWsbaHtX9ibde1ddf+z7bq9YwqQbgqVNWvlwMfJpPcjkfNy9LfyVX9P4DivGUIwPVXAAAAAElFTkSuQmCC">
  <link rel="icon" sizes="256x256" href="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/brand/favicon-256.png">
  <link rel="apple-touch-icon" href="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/brand/favicon-256.png">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;700&family=Figtree:wght@400;600&display=swap">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;700&family=Figtree:wght@400;600&display=swap">

  <link rel="preload" as="image" href="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/sc-hero.webp">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Odsączek",
    "brand": {
      "@type": "Brand",
      "name": "Zaradek"
    },
    "image": "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/packshot-rozlozony.webp",
    "description": "Składany koszyk ze stali nierdzewnej do smażenia i odsączania potraw w garnku lub woku.",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "PLN",
      "price": "29.90",
      "availability": "https://schema.org/InStock",
      "url": "{{CANONICAL_URL}}"
    }
  }
  </script>

  <style>
    :root{
      --font-display:"Bricolage Grotesque",system-ui,sans-serif; --font-text:"Figtree",system-ui,sans-serif;
      --paper:#F4EFE5; --paper-2:#EDE6D8; --paper-3:#E3DBC9; --card:#FFFCF6;
      --ink:#221E16; --body:#37322A; --line:#DCD5C8;
      --cta:#176B3A; --cta-hover:#115530; --cta-ink:#FFFFFF;
      --radius-lg:14px; --radius-sm:8px;
      --shadow-sm:0 1px 2px rgba(46,38,24,.06);
      --shadow-md:0 1px 2px rgba(46,38,24,.06),0 10px 26px rgba(46,38,24,.10);
      --shadow-lg:0 2px 4px rgba(46,38,24,.07),0 18px 40px rgba(46,38,24,.12);
      --s1:8px;--s2:16px;--s3:24px;--s4:32px;--s5:48px;--s6:64px;--s7:96px;
      --sect-pad-d:112px;--sect-pad-m:72px;--content-w:1180px;
      --h1-d:clamp(26px,2.6vw,34px);--h1-m:clamp(22px,6vw,26px);--h2-d:clamp(24px,2.4vw,30px);
      --h2-m:clamp(20px,5.5vw,24px);--price-fs:clamp(28px,3vw,36px);
      --body-fs:17px;--body-lh:1.55;
      --mo-dur-s:.24s;--mo-dur-m:.38s;--mo-dur-l:.58s;--mo-ease:cubic-bezier(.22,1,.36,1);--mo-dist:16px;
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    html {
      scroll-behavior: smooth;
      scroll-padding-top: 76px;
    }

    body {
      margin: 0;
      background: var(--paper);
      color: var(--body);
      font-family: var(--font-text);
      font-size: var(--body-fs);
      line-height: var(--body-lh);
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
    }

    img {
      display: block;
      max-width: 100%;
      height: auto;
    }

    a {
      color: inherit;
    }

    button,
    input,
    select,
    textarea {
      font: inherit;
    }

    .wrap {
      width: 100%;
      max-width: var(--content-w);
      margin-inline: auto;
      padding-inline: 22px;
    }

    .sect-pad {
      padding-block: clamp(56px, 8vw, var(--sect-pad-d));
    }

    .display {
      font-family: var(--font-display);
    }

    .eyebrow {
      margin: 0;
      color: var(--cta);
      font-family: var(--font-text);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: .2em;
      line-height: 1.3;
      text-transform: uppercase;
    }

    .h2 {
      margin: 0;
      color: var(--ink);
      font-family: var(--font-display);
      font-size: var(--h2-d);
      font-weight: 700;
      letter-spacing: -.01em;
      line-height: 1.15;
    }

    .lead {
      max-width: 65ch;
      margin: 0;
      color: var(--body);
      font-size: var(--body-fs);
      line-height: var(--body-lh);
    }

    .btn,
    .btn.cta {
      display: inline-flex;
      min-height: 50px;
      align-items: center;
      justify-content: center;
      gap: var(--s1);
      padding: 12px 22px;
      border: 1px solid var(--cta);
      border-radius: var(--radius-lg);
      background: var(--cta);
      color: var(--cta-ink);
      font-family: var(--font-display);
      font-weight: 700;
      line-height: 1.2;
      text-align: center;
      text-decoration: none;
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      transition:
        background-color var(--mo-dur-s) ease,
        border-color var(--mo-dur-s) ease,
        transform var(--mo-dur-s) var(--mo-ease),
        box-shadow var(--mo-dur-s) ease;
    }

    .btn:hover,
    .btn.cta:hover {
      border-color: var(--cta-hover);
      background: var(--cta-hover);
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .btn:focus-visible,
    .btn.cta:focus-visible,
    a:focus-visible,
    button:focus-visible {
      outline: 3px solid var(--cta);
      outline-offset: 3px;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 34px;
      padding: 7px 12px;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: var(--card);
      color: var(--ink);
      font-size: 14px;
      font-weight: 600;
      line-height: 1.2;
      white-space: nowrap;
      box-shadow: var(--shadow-sm);
    }

    .pill svg,
    .topbar svg {
      flex: 0 0 auto;
      color: var(--ink);
      stroke: currentColor;
      stroke-width: 1.5;
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .arc {
      display: block;
      fill: none;
      stroke: var(--cta);
    }

    .band {
      position: relative;
      isolation: isolate;
      background: var(--paper-2);
    }

    .band::before {
      position: absolute;
      z-index: -1;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='.03'/%3E%3C/svg%3E");
      content: "";
      pointer-events: none;
    }

    .reveal {
      opacity: 0;
      transform: translateY(var(--mo-dist));
    }

    .reveal.in {
      opacity: 1;
      transform: none;
      transition:
        opacity var(--mo-dur-l) var(--mo-ease),
        transform var(--mo-dur-l) var(--mo-ease);
    }

    .topbar {
      position: sticky;
      z-index: 100;
      top: 0;
      border-bottom: 1px solid var(--line);
      background: rgba(244, 239, 229, .94);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    .topbar__inner {
      display: flex;
      min-height: 60px;
      align-items: center;
      gap: var(--s3);
    }

    .brand {
      display: inline-flex;
      min-height: 44px;
      flex: 0 0 auto;
      align-items: center;
      gap: 10px;
      color: var(--ink);
      font-family: var(--font-display);
      font-weight: 700;
      letter-spacing: -.01em;
      text-decoration: none;
    }

    .brand img {
      width: 28px;
      height: 28px;
    }

    .topbar__nav {
      display: flex;
      flex: 1 1 auto;
      align-items: center;
      justify-content: center;
      gap: clamp(14px, 2.2vw, 30px);
    }

    .topbar__nav a {
      color: var(--ink);
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      text-underline-offset: 4px;
    }

    .topbar__nav a:hover {
      text-decoration: underline;
    }

    .hr-hero {
      min-height: min(780px, calc(100svh - 60px));
    }

    footer {
      min-height: 1px;
    }

    @media (max-width: 820px) {
      .topbar__inner {
        gap: var(--s2);
      }

      .topbar__nav {
        display: none;
      }

      .topbar__inner > .pill {
        margin-left: auto;
      }

      .h2 {
        font-size: var(--h2-m);
      }
    }

    @media (max-width: 480px) {
      .wrap {
        padding-inline: 18px;
      }

      .topbar__inner > .pill {
        padding-inline: 9px;
        font-size: 12px;
      }

      .brand {
        gap: 8px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      html {
        scroll-behavior: auto;
      }

      .reveal,
      .reveal.in {
        opacity: 1;
        transform: none;
        transition: none;
      }

      .btn,
      .btn.cta {
        transition: none;
      }
    }
  </style>
</head>

<body>
  <header class="topbar">
    <div class="wrap topbar__inner">
      <a class="brand" href="#hero" aria-label="Odsączek — przejdź na początek strony">
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/brand/favicon-256.png"
          width="28"
          height="28"
          alt=""
        >
        <span>Odsączek</span>
      </a>

      <nav class="topbar__nav" aria-label="Nawigacja główna">
        <a href="#jeden-ruch">Jeden ruch</a>
        <a href="#zawies">Zawieś</a>
        <a href="#zloz">Na płasko</a>
        <a href="#faq">FAQ</a>
      </nav>

      <span class="pill">
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3.75 7.5h10.5v9H3.75z"></path>
          <path d="M14.25 10.25h3.1l2.9 3v3.25h-6"></path>
          <circle cx="7.25" cy="17.5" r="1.75"></circle>
          <circle cx="17.5" cy="17.5" r="1.75"></circle>
        </svg>
        <span>Płatność przy odbiorze</span>
      </span>
    </div>
  </header>

  <main>
    <!-- SEKCJA:01-hero START -->
    <section id="hero" class="hr-hero hero"></section>
    <!-- SEKCJA:01-hero END -->

    <!-- SEKCJA:02-jeden-ruch START -->
    <section id="jeden-ruch" class="sect-pad"></section>
    <!-- SEKCJA:02-jeden-ruch END -->

    <!-- SEKCJA:03-zawies START -->
    <section id="zawies" class="sect-pad band"></section>
    <!-- SEKCJA:03-zawies END -->

    <!-- SEKCJA:04-zloz START -->
    <section id="zloz" class="sect-pad"></section>
    <!-- SEKCJA:04-zloz END -->

    <!-- SEKCJA:05-durszlak START -->
    <section id="durszlak" class="sect-pad band"></section>
    <!-- SEKCJA:05-durszlak END -->

    <!-- SEKCJA:06-mycie START -->
    <section id="mycie" class="sect-pad"></section>
    <!-- SEKCJA:06-mycie END -->

    <!-- SEKCJA:07-mid-cta START -->
    <section id="mid-cta" class="sect-pad band"></section>
    <!-- SEKCJA:07-mid-cta END -->

    <!-- SEKCJA:08-zamow START -->
    <section id="zamow" class="sect-pad">
      <!--CHECKOUT-INLINE-->
      <!--PAYBADGES-->
    </section>
    <!-- SEKCJA:08-zamow END -->

    <!-- SEKCJA:09-faq START -->
    <section id="faq" class="sect-pad band"></section>
    <!-- SEKCJA:09-faq END -->

    <!-- SEKCJA:10-final START -->
    <section id="final" class="sect-pad">
      <!--PAYBADGES-->
    </section>
    <!-- SEKCJA:10-final END -->
  </main>

  <footer>
    <!--FOOTER@1-->
  </footer>

  <div class="sticky-buy" hidden>
    <!--STICKY-BUY-->
  </div>

  <script>
    (function () {
      'use strict';

      var items = document.querySelectorAll('.reveal');
      if (!items.length) return;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
        items.forEach(function (item) {
          item.classList.add('in');
        });
        return;
      }

      var observer = new IntersectionObserver(function (entries, currentObserver) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          currentObserver.unobserve(entry.target);
        });
      }, {
        threshold: .18
      });

      items.forEach(function (item) {
        observer.observe(item);
      });
    })();
  </script>

<!--
  LANDING RUNTIME (workflow v2 / fabryka landingów) — WKLEJANY PRZED </body> każdego landinga.
  Kontrakt DOM:
    - CTA:   <a data-checkout href="#zamow">…</a>  → runtime podmienia href na checkout_url z API
    - CENA:  <span data-price>149,90 zł</span>     → runtime nadpisuje AKTUALNĄ ceną (zapieczona = fallback)
             <span data-price-raw>149.90</span>    → wariant bez formatowania (opcjonalny)
    - SOLD (opcjonalny, UCZCIWY social-proof z REALNYCH zamówień naszego sklepu):
             <span data-sold-wrap hidden>Już <b data-sold>–</b> zamówień w naszym sklepie</span>
             → runtime wstawia liczbę i ODKRYWA wrap TYLKO gdy sold ≥ próg (data-sold-min,
             domyślnie 30). Poniżej progu sekcja zostaje ukryta — zero fałszywych liczb.
  Placeholdery podmieniane PRZY PUBLIKACJI (krok pl_publikacja):
    {{WF2_PRODUCT_ID}} — wf2_products.id
    {{PIXEL_ID}}       — Meta pixel (zwykle NIEPOTRZEBNY: platforma wstrzykuje pixel przez
                         integracje; placeholder zostaje na wypadek preview poza platformą)
  REGUŁY (SSOT: docs/zbuduje/platforma-api/README.md + STANDARD-LANDING-SKLEPY §5):
    1. INIT-GUARD META: platforma wstrzykuje pixel na strony isHtml — landing NIGDY nie robi
       drugiego init/PageView; dowiesza TYLKO ViewContent/AddToCart/InitiateCheckout.
       Własny loader fbq odpala się WYŁĄCZNIE, gdy po 3 s nie ma window.fbq (preview poza platformą).
    2. ANALITYKA PLATFORMY: window.trevio (SDK wstrzykiwany na stronach custom-HTML) —
       viewItem przy load, addToCart + beginCheckout przy kliknięciu CTA. PageView automatyczny.
    3. CENA: pobierana z wf2-landing-api (cache 5 min); brak sieci = zostaje zapieczona.
    4. ATRYBUCJA: do checkout_url doklejamy fbclid/_fbp/_fbc (wymóg CAPI §6 TESTY.md).
-->
<script>
(function () {
  'use strict';
  var CFG = {
    productId: '{{WF2_PRODUCT_ID}}',
    api: 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-landing-api',
    pixelId: '{{PIXEL_ID}}'
  };
  var configured = function (v) { return v && v.indexOf('{{') === -1; };
  var state = { name: document.title, price: null, currency: 'PLN', checkoutUrl: '' };

  function fmtPln(n) {
    try { return n.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł'; }
    catch (e) { return n + ' zł'; }
  }
  function getCookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  }
  // fallback: zapieczona cena z pierwszego [data-price-raw]/[data-price]
  (function bakedPrice() {
    var raw = document.querySelector('[data-price-raw]');
    if (raw) { var v = parseFloat(String(raw.textContent).replace(',', '.')); if (v > 0) { state.price = v; return; } }
    var el = document.querySelector('[data-price]');
    if (el) { var t = String(el.textContent).replace(/[^\d,\.]/g, '').replace(',', '.'); var p = parseFloat(t); if (p > 0) state.price = p; }
  })();

  function decorateCheckoutUrl(url) {
    try {
      var u = new URL(url);
      var qs = new URLSearchParams(location.search);
      var fbclid = qs.get('fbclid'); var fbp = getCookie('_fbp'); var fbc = getCookie('_fbc');
      if (fbclid && !u.searchParams.get('fbclid')) u.searchParams.set('fbclid', fbclid);
      if (fbp) u.searchParams.set('_fbp', fbp);
      if (fbc || fbclid) u.searchParams.set('_fbc', fbc || ('fb.1.' + Date.now() + '.' + fbclid));
      return u.toString();
    } catch (e) { return url; }
  }
  function applyState() {
    if (state.price != null) {
      document.querySelectorAll('[data-price]').forEach(function (el) { el.textContent = fmtPln(state.price); });
      document.querySelectorAll('[data-price-raw]').forEach(function (el) { el.textContent = String(state.price); });
    }
    if (state.checkoutUrl) {
      document.querySelectorAll('[data-checkout]').forEach(function (a) {
        if (a.tagName === 'A') a.setAttribute('href', decorateCheckoutUrl(state.checkoutUrl));
      });
    }
  }

  // ── aktualna cena + link kasy z API (fallback: zapieczone wartości) ──
  if (configured(CFG.productId)) {
    fetch(CFG.api + '?product=' + encodeURIComponent(CFG.productId))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d) return;
        if (d.price != null && d.price > 0) state.price = d.price;
        if (d.checkout_url) state.checkoutUrl = d.checkout_url;
        if (d.name) state.name = d.name;
        // social-proof: realne zamówienia sklepu; pokazujemy WYŁĄCZNIE od progu (uczciwe liczby)
        if (typeof d.sold === 'number') {
          document.querySelectorAll('[data-sold-wrap]').forEach(function (w) {
            var min = parseInt(w.getAttribute('data-sold-min') || '30', 10);
            if (d.sold >= min) {
              w.querySelectorAll('[data-sold]').forEach(function (el) { el.textContent = d.sold.toLocaleString('pl-PL'); });
              w.hidden = false; w.removeAttribute('hidden');
            }
          });
        }
        applyState();
        trevioViewItem();
      })
      .catch(function () { /* zapieczona cena zostaje */ });
  }

  // ── Meta pixel: init-guard (platforma wstrzykuje pixel — NIE dublować init/PageView) ──
  var vcSent = false;
  function fbqSafe(evt) {
    if (window.fbq) { try { window.fbq('track', evt); } catch (e) {} }
  }
  function viewContentOnce() { if (!vcSent && window.fbq) { vcSent = true; fbqSafe('ViewContent'); } }
  if (window.fbq) viewContentOnce();
  else {
    var waited = 0;
    var iv = setInterval(function () {
      waited += 250;
      if (window.fbq) { clearInterval(iv); viewContentOnce(); return; }
      if (waited >= 3000) {
        clearInterval(iv);
        // preview poza platformą: własny loader TYLKO gdy pixel skonfigurowany
        if (configured(CFG.pixelId)) {
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          window.fbq('init', CFG.pixelId); window.fbq('track', 'PageView');
          viewContentOnce();
        }
      }
    }, 250);
  }

  // ── analityka platformy (window.trevio — SDK stron custom-HTML) ──
  function trevioItem() {
    return { productId: CFG.productId, name: state.name, price: state.price != null ? state.price : 0 };
  }
  var viSent = false;
  function trevioViewItem() {
    if (viSent || !window.trevio || state.price == null) return;
    viSent = true;
    try { window.trevio.viewItem({ currency: state.currency, productId: CFG.productId, name: state.name, price: state.price }); } catch (e) {}
  }
  var tWait = 0;
  var tIv = setInterval(function () {
    tWait += 300;
    if (window.trevio) { clearInterval(tIv); trevioViewItem(); return; }
    if (tWait >= 4500) clearInterval(tIv);
  }, 300);

  // ── zdarzenia CTA: Meta ATC+IC oraz trevio addToCart+beginCheckout ──
  document.addEventListener('click', function (ev) {
    var el = ev.target && ev.target.closest ? ev.target.closest('[data-checkout]') : null;
    if (!el) return;
    // pixel-guard (Tomek 18.07): ATC/IC palimy TYLKO gdy przycisk realnie wychodzi na checkout
    // (href zhydratowany do URL platformy), NIE przy kliknięciu-scrollu do #zamow (fałszywe eventy)
    var _href = (el.getAttribute && el.getAttribute('href')) || '';
    if (_href.charAt(0) === '#' || !/^https?:/i.test(_href)) return;
    fbqSafe('AddToCart');
    fbqSafe('InitiateCheckout');
    if (window.trevio) {
      var item = trevioItem(); item.quantity = 1;
      try { window.trevio.addToCart({ currency: state.currency, productId: item.productId, name: item.name, price: item.price, quantity: 1 }); } catch (e) {}
      try { window.trevio.beginCheckout({ currency: state.currency, total: item.price, items: [item] }); } catch (e) {}
    }
  }, true);

  applyState();
})();
</script>
</body>
</html>
```