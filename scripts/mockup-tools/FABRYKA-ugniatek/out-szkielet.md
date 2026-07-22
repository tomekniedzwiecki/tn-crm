### Siatka struktury
- `head`: SEO, Open Graph, canonical, fonty, favicony, preload hero, JSON-LD
- Sticky topbar: logo, nawigacja, trust pill
- 10 pustych sekcji kontraktowych: `hero` → `final`
- Checkout i paybadges: markery montażowe
- Footer: `<!--FOOTER@1-->`
- Mobile sticky-buy: `<!--STICKY-BUY-->`
- Reveal-on-scroll
- Runtime workflow v2 wklejony przed `</body>`

```html
<!doctype html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Ugniatek — płaski masażer z 6 głowicami | 189,00 zł</title>
  <meta name="description" content="Ugniatek to płaski, bezprzewodowy masażer z 6 głowicami i dwoma uchwytami. Dociskaj oburącz albo połóż i oprzyj się plecami. 189,00 zł · płatność przy odbiorze · 14 dni na zwrot.">
  <meta name="theme-color" content="#EEF1F2">

  <!-- PREVIEW na crm.*; publikacja przez API zdejmuje noindex. -->
  <meta name="robots" content="noindex">
  <link rel="canonical" href="{{CANONICAL_URL}}">

  <meta property="og:type" content="website">
  <meta property="og:title" content="Ugniatek — płaski masażer z 6 głowicami | 189,00 zł">
  <meta property="og:description" content="Ugniatek to płaski, bezprzewodowy masażer z 6 głowicami i dwoma uchwytami. Dociskaj oburącz albo połóż i oprzyj się plecami. 189,00 zł · płatność przy odbiorze · 14 dni na zwrot.">
  <meta property="og:image" content="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/packshot-34.webp">
  <meta property="og:url" content="{{CANONICAL_URL}}">

  <link rel="icon" type="image/png" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFXElEQVR4nMVXX4hUVRj/feee+2fujJlrZttGlEaiD0WFBBLYQ0UEWT5MCOWfWFvZlbUWpB7HeS162UxdUaiwCJeI6KGgiCSSIPuDyID4IGS26qaQuzM79557zxfn3Fmd1Z2ZXTX6lsvcs/ee8/t93/m+33cu8D8b3fC8UolQqWTzV61ilMv6ljJrYYTSWtnyWbHozH/BuVqpJK542dfnFjwsB/FSsEgSwWfqw/v/sM8Y1FiVbx2BYtHB6Gh6W29vVxrKIYBfgtYPQEphcTTXAPoVxHurw/s/aSLCN0+glHke9G9Z47j+IXLd+1kpIE0BZhMRghBE0gEcBxyrz31Ut1x67+PLYCYQ8Y0TKGXg4fYtj5L0jxCowIlSYDggoqb5BkQDrCkXunpq6kjtjp5nUKmkGB01JFuSEB3Jbd4cAPIQkSiwUglALojENeTNvWOeca0WizC3Nj9+ZpfZNhSL7TDQ+mGp5FjvC/IVEQQrOY4TELWqgCYq5PJUXYPEG7lt23osCRPJeROACakJHr0MnXIj5HMxgtaaAj8HV7/QCUe0XMSU3MBAAcBKTlICuG0orzMGC60fzwbft3xNzDLRqJwRFMo58e0E3Abm+YmmiZapAGCJHY+tMGvK2bZCzhiZF8iITTmx7JSMWShFoBxuzOqNSlIzMJpkW155kNWsXrBx42Is7Xpw4tLpE9V9+y6EA73n4DgLoNTc84CZIUz90ymbyP1bHxOFYBlN1I5PlMsnm/VBXPWcOBzofY67whOcxkfzhe5jC/v7F4HoS3KlAZ57szFENRNr/Wlh+6vrhe/+jEQf1r53PNy+tc+CN/oGTWt3fkfvnZzSSXLdhYjjmAp5jycnP6RA7mSF81b1mG1udPA+Id+XOop/rC3peTK8+Nc5EmIxkiSGlB7SNNKJs3xqZOSscVxgl0045hTPi8A34ApEHldrCXn+Zq7XlyJNX6d8KAFOGvLbEhyOI1nrlB1sCM+feVMEvgE3GuKZX/J9n9z06cYMcSUrCbS8IZmNXsaCjQn/s+qeg7t5cvIdCkMX0hEWiGESNbWXGQMpeZ6EII04elYqnSfPLXM9SkF0tU0TmBjL7P3YmJXUBnubkFfDa+RWKS08d0U42PdN9f2Db/FUbQOAs5TLScr5kjzXIc9zKBdI8n2HtT6G6tRDWlBFu/I7K89aN/eM6W3Pqqq7u4O4EDnGA+HKp/KDfb9RiuPV4f33plG8nmM1omP1LSv1tY7Vu9DJE9XhkdUI/G5y5O8Q4m4kiamcthiyLYEmEuS6D7NEJT/42kcaem+1658dKI/G9p2hYi4fLVqTH+z7ghxnnW3VidKtwTmdhQCnbUmobEHy/U0O86b83wsnMdA7bksuxl0UyMBkEEdR1nrbeU7IhGlsrKm7EV1oe4zKFmSuR6bvExynAEGF7CSgwVGcOdCccC3cB+iivevuNkGtWFAtcFTYptPhjEC27xtQRmqbRCY89jzQ0YRpbMTimB1VKrZhZEoIID/+50/k+6s5iubW++djplQ9T3Icn6gtuecRq6zlcqMKzPm+XNYsqZ91GkFKIzrKavpNA9vMUEagTNSEoAGUy0njm4IzAo1TS234wC8cq3VMOE9BzojOtChx06U7X+avQd4RREHgQtBlHavi5O4DP9iIG0xcq+uN43du26Ye8nM7iflFMN/XJJjZDLPls8XG+mQcboy1Nv87C6KvVBS/HY98cGoao3nKTGt+YWgol+eJZZpFAZFVNDhCSBbaQwsjQKVaxHA0CSmqYSRPj+/ZM3nd2m2NmXB4/p9ZLc0AtziYUoepMz9C52vZR6vZkJtP5v/K/gVMHqGzRLVxGwAAAABJRU5ErkJggg==">
  <link rel="icon" sizes="256x256" href="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/brand/favicon-256.png">
  <link rel="apple-touch-icon" href="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/brand/favicon-256.png">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Work+Sans:wght@400;600&display=swap">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Work+Sans:wght@400;600&display=swap">

  <link rel="preload" as="image" href="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/hero-L.webp" media="(min-width:1024px)">
  <link rel="preload" as="image" href="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/hero-L.webp" media="(max-width:767px)">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Ugniatek",
    "brand": {
      "@type": "Brand",
      "name": "Zaradek"
    },
    "image": [
      "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/packshot-34.webp"
    ],
    "description": "Płaski, bezprzewodowy masażer z 6 głowicami i dwoma uchwytami.",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "PLN",
      "price": "189.00",
      "availability": "https://schema.org/InStock",
      "url": "{{CANONICAL_URL}}"
    }
  }
  </script>

  <style>
:root{
  --font-display:"Space Grotesk",system-ui,sans-serif; --font-text:"Work Sans",system-ui,sans-serif;
  --paper:#EEF1F2; --paper-2:#E6EBEC; --paper-3:#DCE2E4; --card:#FBFCFC;
  --ink:#14211F; --body:#26312F; --line:#CBD5D8;
  --cta:#0B6B64; --cta-hover:#07554F; --cta-ink:#FFFFFF;
  --radius-lg:10px; --radius-sm:6px;
  --shadow-sm:0 1px 2px rgba(20,40,45,.05);
  --shadow-md:0 1px 2px rgba(20,40,45,.05),0 8px 24px rgba(20,40,45,.09);
  --shadow-lg:0 2px 4px rgba(20,40,45,.06),0 18px 40px rgba(20,40,45,.11);
  --s1:8px;--s2:16px;--s3:24px;--s4:32px;--s5:48px;--s6:64px;--s7:96px;
  --sect-pad-d:112px;--sect-pad-m:72px;--content-w:1180px;
  --h1-d:clamp(38px,7.5vw,68px);--h1-m:clamp(38px,8.5vw,50px);--h2-d:clamp(30px,3.8vw,48px);
  --body-fs:17px;--body-lh:1.55;
}
:root{ --plus:var(--line); --star:var(--cta);
  --mo-dur-s:.24s;--mo-dur-m:.38s;--mo-dur-l:.58s;--mo-ease:cubic-bezier(.22,1,.36,1);--mo-dist:16px; }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    html {
      scroll-behavior: smooth;
      scroll-padding-top: 80px;
    }

    body {
      min-width: 320px;
      margin: 0;
      background: var(--paper);
      color: var(--body);
      font-family: var(--font-text);
      font-size: var(--body-fs);
      line-height: var(--body-lh);
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
    }

    body::after {
      position: fixed;
      z-index: 9999;
      inset: 0;
      pointer-events: none;
      content: "";
      opacity: .03;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
      background-repeat: repeat;
      background-size: 180px 180px;
    }

    img,
    svg {
      display: block;
      max-width: 100%;
    }

    button,
    input,
    textarea,
    select {
      font: inherit;
    }

    a {
      color: inherit;
    }

    [hidden] {
      display: none !important;
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
      margin: 0;
      color: var(--ink);
      font-family: var(--font-display);
      font-size: var(--h1-d);
      font-weight: 700;
      line-height: .98;
      letter-spacing: -.025em;
    }

    .eyebrow {
      margin: 0;
      color: var(--ink);
      font-family: var(--font-text);
      font-size: 12px;
      font-weight: 800;
      line-height: 1.3;
      letter-spacing: .2em;
      text-transform: uppercase;
    }

    .h2 {
      margin: 0;
      color: var(--ink);
      font-family: var(--font-display);
      font-size: var(--h2-d);
      font-weight: 700;
      line-height: 1.08;
      letter-spacing: -.01em;
    }

    .lead {
      max-width: 68ch;
      margin: 0;
      color: var(--body);
      font-size: clamp(18px, 2vw, 21px);
      line-height: 1.55;
    }

    .btn {
      display: inline-flex;
      min-height: 50px;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 13px 22px;
      border: 1px solid transparent;
      border-radius: var(--radius-sm);
      background: var(--cta);
      box-shadow: var(--shadow-sm);
      color: var(--cta-ink);
      font-family: var(--font-display);
      font-weight: 700;
      line-height: 1.2;
      text-align: center;
      text-decoration: none;
      cursor: pointer;
      transition:
        transform var(--mo-dur-s) var(--mo-ease),
        background-color var(--mo-dur-s) var(--mo-ease),
        box-shadow var(--mo-dur-s) var(--mo-ease);
    }

    .btn.cta {
      background: var(--cta);
      color: var(--cta-ink);
    }

    .btn:hover,
    .btn.cta:hover {
      background: var(--cta-hover);
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .btn:active,
    .btn.cta:active {
      transform: translateY(0);
    }

    .btn:focus-visible {
      outline: 3px solid var(--cta);
      outline-offset: 3px;
    }

    .pill {
      display: inline-flex;
      min-height: 36px;
      align-items: center;
      gap: 8px;
      padding: 7px 12px;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: var(--card);
      box-shadow: var(--shadow-sm);
      color: var(--ink);
      font-size: 13px;
      font-weight: 600;
      line-height: 1;
      white-space: nowrap;
    }

    .pill svg {
      width: 17px;
      height: 17px;
      flex: 0 0 17px;
      fill: none;
      stroke: var(--ink);
      stroke-width: 1.5px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .callout-wrap {
      position: relative;
    }

    .callout {
      position: absolute;
      width: min(180px, 36vw);
      height: 1px;
      background: var(--ink);
      color: var(--ink);
    }

    .callout::before {
      position: absolute;
      top: 50%;
      left: 0;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--ink);
      content: "";
      transform: translate(-50%, -50%);
    }

    .callout > span {
      position: absolute;
      bottom: 8px;
      left: 0;
      color: var(--ink);
      font-family: var(--font-text);
      font-size: 12px;
      font-weight: 600;
      line-height: 1.25;
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
      z-index: 1000;
      top: 0;
      border-bottom: 1px solid var(--line);
      background: rgba(238, 241, 242, .92);
      box-shadow: var(--shadow-sm);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
    }

    .topbar__inner {
      display: flex;
      min-height: 68px;
      align-items: center;
      gap: var(--s3);
    }

    .brand-lockup {
      display: inline-flex;
      flex: 0 0 auto;
      align-items: center;
      gap: 10px;
      color: var(--ink);
      text-decoration: none;
    }

    .brand-lockup:focus-visible,
    .topbar__nav a:focus-visible {
      border-radius: 3px;
      outline: 3px solid var(--cta);
      outline-offset: 3px;
    }

    .brand-lockup img {
      width: 28px;
      height: 28px;
      object-fit: contain;
    }

    .brand-lockup__wordmark {
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 700;
      line-height: 1;
      letter-spacing: -.02em;
    }

    .topbar__nav {
      display: flex;
      flex: 1 1 auto;
      align-items: center;
      justify-content: center;
      gap: clamp(14px, 2.5vw, 30px);
    }

    .topbar__nav a {
      color: var(--ink);
      font-family: var(--font-display);
      font-size: 14px;
      font-weight: 500;
      line-height: 1;
      text-decoration: none;
      white-space: nowrap;
    }

    .topbar__nav a:hover {
      text-decoration: underline;
      text-decoration-thickness: 1px;
      text-underline-offset: 5px;
    }

    .sect-hero {
      min-height: calc(100svh - 69px);
    }

    .sect-dwie-formy,
    .sect-anatomia,
    .sect-sterowanie,
    .sect-wieczorem,
    .sect-mid-cta,
    .sect-zestaw,
    .sect-zamow,
    .sect-faq,
    .sect-final {
      min-height: clamp(160px, 22vw, 280px);
      padding-block: clamp(56px, 8vw, var(--sect-pad-d));
    }

    .sect-dwie-formy,
    .sect-sterowanie,
    .sect-mid-cta,
    .sect-zamow,
    .sect-final {
      background: var(--paper-2);
    }

    .sect-anatomia,
    .sect-wieczorem,
    .sect-zestaw,
    .sect-faq {
      background: var(--paper);
    }

    footer {
      min-height: 120px;
      border-top: 1px solid var(--line);
      background: var(--paper-3);
    }

    .sticky-buy {
      position: fixed;
      z-index: 1200;
      right: 12px;
      bottom: 12px;
      left: 12px;
      display: none;
      align-items: center;
      justify-content: space-between;
      gap: var(--s2);
      padding: 10px;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      background: var(--card);
      box-shadow: var(--shadow-lg);
    }

    .sticky-buy__price {
      color: var(--ink);
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 700;
      white-space: nowrap;
    }

    @media (max-width: 900px) {
      .topbar__nav {
        display: none;
      }

      .topbar__inner {
        justify-content: space-between;
      }
    }

    @media (max-width: 767px) {
      html {
        scroll-padding-top: 70px;
      }

      .wrap {
        padding-inline: 18px;
      }

      .display {
        font-size: var(--h1-m);
      }

      .topbar__inner {
        min-height: 62px;
      }

      .topbar .pill {
        min-height: 34px;
        padding-inline: 10px;
        font-size: 12px;
      }

      .sect-hero {
        min-height: calc(100svh - 63px);
      }

      .sect-dwie-formy,
      .sect-anatomia,
      .sect-sterowanie,
      .sect-wieczorem,
      .sect-mid-cta,
      .sect-zestaw,
      .sect-zamow,
      .sect-faq,
      .sect-final {
        min-height: 180px;
        padding-block: var(--sect-pad-m);
      }
    }

    @media (max-width: 420px) {
      .brand-lockup__wordmark {
        font-size: 18px;
      }

      .topbar .pill {
        gap: 6px;
      }

      .topbar .pill svg {
        width: 15px;
        height: 15px;
        flex-basis: 15px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      html {
        scroll-behavior: auto;
      }

      *,
      *::before,
      *::after {
        animation-duration: .01ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
        transition-duration: .01ms !important;
      }

      .reveal {
        opacity: 1;
        transform: none;
      }
    }
  </style>
</head>

<body>
  <header class="topbar">
    <div class="wrap topbar__inner">
      <a class="brand-lockup" href="#hero" aria-label="Ugniatek — przejdź na początek strony">
        <img src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/brand/favicon-256.png" width="28" height="28" alt="">
        <span class="brand-lockup__wordmark">Ugniatek</span>
      </a>

      <nav class="topbar__nav" aria-label="Nawigacja główna">
        <a href="#dwie-formy">Dwie formy</a>
        <a href="#anatomia">Budowa</a>
        <a href="#sterowanie">Sterowanie</a>
        <a href="#zestaw">Zestaw</a>
        <a href="#faq">FAQ</a>
      </nav>

      <span class="pill">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3.5 19 6v5.2c0 4.4-2.7 7.7-7 9.3-4.3-1.6-7-4.9-7-9.3V6l7-2.5Z"></path>
          <path d="m9 12 2 2 4-4"></path>
        </svg>
        <span>Bezpieczne zakupy</span>
      </span>
    </div>
  </header>

  <main>
    <!-- SEKCJA:01-hero START -->
    <section id="hero" class="sect-hero"></section>
    <!-- SEKCJA:01-hero END -->

    <!-- SEKCJA:02-dwie-formy START -->
    <section id="dwie-formy" class="sect-dwie-formy"></section>
    <!-- SEKCJA:02-dwie-formy END -->

    <!-- SEKCJA:03-anatomia START -->
    <section id="anatomia" class="sect-anatomia"></section>
    <!-- SEKCJA:03-anatomia END -->

    <!-- SEKCJA:04-sterowanie START -->
    <section id="sterowanie" class="sect-sterowanie"></section>
    <!-- SEKCJA:04-sterowanie END -->

    <!-- SEKCJA:05-wieczorem START -->
    <section id="wieczorem" class="sect-wieczorem"></section>
    <!-- SEKCJA:05-wieczorem END -->

    <!-- SEKCJA:06-mid-cta START -->
    <section id="mid-cta" class="sect-mid-cta"></section>
    <!-- SEKCJA:06-mid-cta END -->

    <!-- SEKCJA:07-zestaw START -->
    <section id="zestaw" class="sect-zestaw"></section>
    <!-- SEKCJA:07-zestaw END -->

    <!-- SEKCJA:08-zamow START -->
    <section id="zamow" class="sect-zamow">
      <!--CHECKOUT-INLINE-->
      <!--PAYBADGES-->
    </section>
    <!-- SEKCJA:08-zamow END -->

    <!-- SEKCJA:09-faq START -->
    <section id="faq" class="sect-faq"></section>
    <!-- SEKCJA:09-faq END -->

    <!-- SEKCJA:10-final START -->
    <section id="final" class="sect-final">
      <!--PAYBADGES-->
    </section>
    <!-- SEKCJA:10-final END -->
  </main>

  <footer>
    <!--FOOTER@1-->
  </footer>

  <div class="sticky-buy" hidden aria-label="Szybki zakup">
    <!--STICKY-BUY-->
    <span class="sticky-buy__price" data-price>189,00 zł</span>
    <a class="btn cta" data-checkout href="#zamow">Zamawiam</a>
  </div>

  <script>
    (function () {
      'use strict';

      var reducedMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var reveals = document.querySelectorAll('.reveal');

      if (reducedMotion || !('IntersectionObserver' in window)) {
        reveals.forEach(function (el) {
          el.classList.add('in');
        });
        return;
      }

      var observer = new IntersectionObserver(function (entries, io) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        });
      }, { threshold: .18 });

      reveals.forEach(function (el) {
        observer.observe(el);
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