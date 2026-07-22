```html
<!doctype html>
<html lang="pl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Zaradek — Sprytne patenty na codzienność</title>
  <meta name="description" content="Zaradek to krótka, starannie wybrana lista sprytnych produktów, które ułatwiają codzienne sprawy — od kuchni i treningu po drobne domowe wygody.">
  <meta name="robots" content="noindex,nofollow">
  <link rel="canonical" href="{{CANONICAL_URL}}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Zaradek — Sprytne patenty na codzienność">
  <meta property="og:description" content="Krótka lista prostych, przemyślanych produktów, które naprawdę ułatwiają codzienność.">
  <meta property="og:image" content="{{OG_URL}}">
  <link rel="icon" type="image/png" sizes="32x32" href="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/parasol-zaradek/brand/favicon-32.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Mulish:wght@400;500;600;700&family=Quicksand:wght@600;700&display=swap&subset=latin-ext" rel="stylesheet">

  <script>document.documentElement.classList.add('js');</script>

  <style>
    :root {
      --ink: #1F2A44;
      --body: #4D5565;
      --muted: #737987;
      --paper: #FAF6EF;
      --paper-2: #F6F0E6;
      --surface: #FFFFFF;
      --line: #E5DCCB;
      --cta: #1F2A44;
      --cta-d: #1F2A44;
      --radius: 16px;
      --shadow: 0 16px 40px rgba(31, 42, 68, 0.10);
      --wrap: 1140px;
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    html {
      scroll-behavior: smooth;
      overflow-x: hidden;
    }

    body {
      margin: 0;
      min-width: 320px;
      overflow-x: hidden;
      background: var(--paper);
      color: var(--body);
      font-family: "Mulish", sans-serif;
      font-size: 16px;
      line-height: 1.6;
      text-rendering: optimizeLegibility;
    }

    img {
      display: block;
      max-width: 100%;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    p,
    h1,
    h2,
    h3 {
      margin-top: 0;
    }

    button,
    a {
      -webkit-tap-highlight-color: transparent;
    }

    :focus-visible {
      outline: 3px solid var(--cta);
      outline-offset: 3px;
    }

    .wrap {
      width: min(calc(100% - 32px), var(--wrap));
      margin-inline: auto;
    }

    .topbar {
      background: var(--surface);
      border-bottom: 1px solid var(--line);
    }

    .topbar-inner {
      min-height: 72px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      padding-block: 8px;
    }

    .topbar-logo {
      display: inline-flex;
      align-items: center;
      min-height: 48px;
      flex: 0 0 auto;
    }

    .topbar-logo img {
      width: auto;
      height: 40px;
    }

    .topbar-note {
      margin: 0;
      color: var(--ink);
      font-size: 13px;
      font-weight: 700;
      line-height: 1.4;
      text-align: right;
    }

    .intro {
      padding: clamp(56px, 8vw, 96px) 0 clamp(48px, 7vw, 80px);
    }

    .intro-copy {
      max-width: 850px;
    }

    .intro h1 {
      position: relative;
      margin-bottom: 24px;
      color: var(--ink);
      font-family: "Quicksand", sans-serif;
      font-size: clamp(40px, 7vw, 72px);
      font-weight: 700;
      letter-spacing: -0.045em;
      line-height: 1.06;
    }

    .intro h1::before {
      content: "✓";
      display: inline-grid;
      width: 40px;
      height: 40px;
      margin: 0 12px 8px 0;
      place-items: center;
      vertical-align: middle;
      border: 2px solid var(--cta);
      border-radius: var(--radius);
      color: var(--cta);
      font-family: "Mulish", sans-serif;
      font-size: 23px;
      line-height: 1;
      transform: rotate(-5deg);
    }

    .intro p {
      max-width: 740px;
      margin-bottom: 0;
      font-size: clamp(17px, 2vw, 20px);
      line-height: 1.7;
    }

    .trust-strip {
      border-block: 1px solid var(--line);
      background: var(--surface);
    }

    .trust-list {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
      padding-block: 16px;
    }

    .trust-chip {
      min-height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 8px 16px;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      color: var(--ink);
      font-size: 14px;
      font-weight: 700;
      text-align: center;
    }

    .trust-chip svg {
      width: 19px;
      height: 19px;
      flex: 0 0 auto;
      color: var(--cta);
    }

    .products {
      padding: clamp(64px, 8vw, 96px) 0;
    }

    .section-heading {
      max-width: 680px;
      margin-bottom: 32px;
    }

    .section-heading h2 {
      margin-bottom: 12px;
      color: var(--ink);
      font-family: "Quicksand", sans-serif;
      font-size: clamp(30px, 4vw, 44px);
      line-height: 1.15;
      letter-spacing: -0.03em;
    }

    .section-heading p {
      margin-bottom: 0;
      font-size: 17px;
    }

    [data-cards] {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      width: 100%;
    }

    .product-card {
      min-width: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: var(--surface);
      box-shadow: 0 6px 20px rgba(31, 42, 68, 0.04);
      transition: transform 180ms ease, box-shadow 180ms ease;
    }

    .product-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow);
    }

    .product-card__media {
      position: relative;
      width: 100%;
      aspect-ratio: 1 / 1;
      margin: 0;
      overflow: hidden;
      background: var(--paper-2);
    }

    .product-card__media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-card__body {
      min-width: 0;
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 24px;
    }

    .product-card__name {
      margin-bottom: 8px;
      color: var(--ink);
      font-family: "Quicksand", sans-serif;
      font-size: 25px;
      font-weight: 700;
      line-height: 1.2;
    }

    .product-card__hook {
      margin-bottom: 24px;
      color: var(--body);
      line-height: 1.55;
    }

    .product-card__meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-top: auto;
    }

    .product-card__price {
      color: var(--ink);
      font-size: 19px;
      font-weight: 800;
      white-space: nowrap;
    }

    .product-card__cta {
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 16px;
      border: 1px solid var(--cta);
      border-radius: var(--radius);
      background: var(--cta);
      color: var(--surface);
      font-size: 14px;
      font-weight: 800;
      line-height: 1.2;
      text-align: center;
    }

    [data-cards][data-count="1"] {
      max-width: 920px;
      margin-inline: auto;
      grid-template-columns: 1fr;
    }

    @media (min-width: 761px) {
      [data-cards][data-count="1"] .product-card {
        display: grid;
        grid-template-columns: minmax(320px, 1fr) minmax(0, 1fr);
      }

      [data-cards][data-count="1"] .product-card__body {
        justify-content: center;
        padding: clamp(32px, 5vw, 56px);
      }
    }

    .how-band {
      padding: 0 0 clamp(64px, 8vw, 96px);
    }

    .how-inner {
      padding: clamp(24px, 4vw, 40px);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: var(--surface);
    }

    .how-inner h2 {
      margin-bottom: 8px;
      color: var(--ink);
      font-family: "Quicksand", sans-serif;
      font-size: clamp(24px, 3vw, 32px);
      line-height: 1.2;
    }

    .how-inner p {
      max-width: 780px;
      margin-bottom: 0;
    }

    .js .reveal {
      opacity: 0;
      transform: translateY(16px);
      transition: opacity 500ms ease, transform 500ms ease;
    }

    .js .reveal.is-visible {
      opacity: 1;
      transform: none;
    }

    .pay-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .pay-badges span {
      min-height: 36px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 7px 11px;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: var(--surface);
      color: var(--ink);
      font-size: 12px;
      font-weight: 800;
      line-height: 1;
    }

    @media (max-width: 700px) {
      .topbar-inner {
        align-items: flex-start;
        flex-direction: column;
        gap: 4px;
        padding-block: 10px;
      }

      .topbar-note {
        text-align: left;
      }

      .trust-list {
        grid-template-columns: 1fr;
        gap: 8px;
      }

      .trust-chip {
        justify-content: flex-start;
      }

      .product-card__meta {
        align-items: flex-start;
        flex-direction: column;
      }

      .product-card__cta {
        width: 100%;
      }
    }

    @media (max-width: 420px) {
      .wrap {
        width: min(calc(100% - 24px), var(--wrap));
      }

      .intro h1::before {
        width: 34px;
        height: 34px;
        margin-right: 8px;
        font-size: 20px;
      }

      [data-cards] {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      html {
        scroll-behavior: auto;
      }

      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }

      .js .reveal {
        opacity: 1;
        transform: none;
      }

      .product-card:hover {
        transform: none;
      }
    }

    #footer {
      background: var(--paper-2);
      border-top: 1px solid var(--line);
      color: var(--body);
    }

    #footer .foot-top {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1.2fr;
      gap: clamp(26px, 4vw, 60px);
      padding: clamp(46px, 6vw, 74px) 0 clamp(30px, 3.4vw, 44px);
    }

    #footer .foot-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--ink);
    }

    #footer .foot-brand .brand-mark {
      width: auto;
      height: 34px;
      display: block;
      flex: 0 0 auto;
    }

    #footer .foot-brand span {
      font-family: "Quicksand", sans-serif;
      font-size: 27px;
      font-weight: 700;
      letter-spacing: 0.01em;
    }

    #footer .foot-claim {
      max-width: 340px;
      margin-top: 15px;
      font-size: 14.5px;
      line-height: 1.55;
    }

    #footer .foot-h {
      margin-bottom: 16px;
      color: var(--ink);
      font-family: "Quicksand", sans-serif;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    #footer .foot-nav {
      display: grid;
      gap: 2px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    #footer .foot-nav a {
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      color: var(--body);
      font-size: 14.5px;
      transition: color 180ms ease;
    }

    #footer .foot-nav a:hover {
      color: var(--cta-d);
    }

    #footer .foot-trust {
      display: grid;
      gap: 16px;
    }

    #footer .foot-chips {
      display: grid;
      gap: 11px;
    }

    #footer .foot-chip {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      color: var(--body);
      font-size: 13.5px;
      line-height: 1.35;
    }

    #footer .foot-chip svg {
      width: 18px;
      height: 18px;
      flex: 0 0 auto;
      color: var(--cta);
    }

    #footer .foot-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      flex-wrap: wrap;
      padding: 22px 0 clamp(30px, 3vw, 42px);
      border-top: 1px solid var(--line);
    }

    #footer .foot-copy {
      margin: 0;
      color: var(--muted);
      font-size: 12.5px;
      line-height: 1.5;
    }

    #footer .foot-note {
      margin: 0;
      color: var(--muted);
      font-size: 12px;
    }

    @media (max-width: 820px) {
      #footer .foot-top {
        grid-template-columns: 1fr 1fr;
        gap: 34px 28px;
      }

      #footer .foot-brandcol {
        grid-column: 1 / -1;
      }
    }

    @media (max-width: 520px) {
      #footer .foot-top {
        grid-template-columns: 1fr;
        gap: 30px;
      }

      #footer .foot-bottom {
        align-items: flex-start;
        flex-direction: column;
        gap: 10px;
      }
    }
  </style>

  <!--ITEMLIST:START--><!--ITEMLIST:END-->
</head>
<body>
  <header class="topbar">
    <div class="wrap topbar-inner">
      <a class="topbar-logo" href="{{CANONICAL_URL}}" aria-label="Zaradek — strona główna">
        <img src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/parasol-zaradek/brand/logo-combo.png" width="184" height="40" alt="Zaradek">
      </a>
      <p class="topbar-note">Płatność przy odbiorze · 14 dni na zwrot</p>
    </div>
  </header>

  <main>
    <section class="intro reveal" aria-labelledby="intro-title">
      <div class="wrap">
        <div class="intro-copy">
          <h1 id="intro-title">Zaradek — Sprytne patenty na codzienność</h1>
          <p>Zaradek to sklep z prostymi patentami, które ułatwiają codzienne sprawy — od kuchni, przez trening, po małe domowe wygody. Wybieramy rzeczy przemyślane, łatwe w użyciu i warte swojej ceny. Asortyment regularnie się zmienia, ale zasada pozostaje ta sama: krótka lista i same konkrety.</p>
        </div>
      </div>
    </section>

    <section class="trust-strip" aria-label="Bezpieczne i wygodne zakupy">
      <div class="wrap trust-list">
        <div class="trust-chip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2"></rect>
            <path d="M3 10h18M7 15h3"></path>
          </svg>
          Płatność przy odbiorze
        </div>
        <div class="trust-chip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
          14 dni na zwrot
        </div>
        <div class="trust-chip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3Z"></path>
            <path d="M9 12l2 2 4-4"></path>
          </svg>
          Bezpieczne płatności
        </div>
      </div>
    </section>

    <section class="products reveal" aria-labelledby="products-title">
      <div class="wrap">
        <div class="section-heading">
          <h2 id="products-title">Wybierz swój patent</h2>
          <p>Przejrzyj aktualną kolekcję Zaradka i przejdź do szczegółów produktu, który może uprościć Twój dzień.</p>
        </div>

        <!--CARD-TEMPLATE
        <a class="product-card" href="{{CARD_URL}}" aria-label="{{CARD_CTA}}">
          <figure class="product-card__media">
            <img src="{{CARD_IMG}}" width="720" height="720" alt="{{CARD_ALT}}" loading="lazy" decoding="async">
          </figure>
          <div class="product-card__body">
            <h3 class="product-card__name">{{CARD_NAME}}</h3>
            <p class="product-card__hook">{{CARD_HOOK}}</p>
            <div class="product-card__meta">
              <span class="product-card__price" data-wf2-product="{{CARD_PID}}">{{CARD_PRICE}}</span>
              <span class="product-card__cta">{{CARD_CTA}}</span>
            </div>
          </div>
        </a>
        CARD-TEMPLATE-->
        <div data-cards data-count="3">
          <!--CARDS:START--><!--CARDS:END-->
        </div>
      </div>
    </section>

    <section class="how-band reveal" aria-labelledby="how-title">
      <div class="wrap">
        <div class="how-inner">
          <h2 id="how-title">Jak to działa?</h2>
          <p>Wybierasz interesujący Cię patent, sprawdzasz jego szczegóły na stronie produktu i zamawiasz z dogodną formą płatności. My zajmujemy się resztą i wysyłamy paczkę pod wskazany adres.</p>
        </div>
      </div>
    </section>
  </main>

  <footer id="footer">
    <div class="wrap">
      <div class="foot-top">
        <div class="foot-brandcol">
          <div class="foot-brand">
            <img class="brand-mark" src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/parasol-zaradek/brand/favicon-32.png" width="96" height="96" alt="" aria-hidden="true" loading="lazy" decoding="async">
            <span>Zaradek</span>
          </div>
          <p class="foot-claim">Sprytne, proste w użyciu patenty, które pomagają wygodniej ogarniać codzienność.</p>
        </div>

        <nav class="foot-col" aria-label="Informacje i pomoc">
          <p class="foot-h">Zakupy i pomoc</p>
          <ul class="foot-nav">
            <li><a href="{{REGULAMIN_URL}}">Regulamin</a></li>
            <li><a href="{{POLITYKA_URL}}">Polityka prywatności</a></li>
            <li><a href="{{COOKIES_URL}}">Polityka cookies</a></li>
            <li><a href="{{ZWROTY_URL}}">Zwroty i reklamacje</a></li>
            <li><a href="{{DOSTAWA_URL}}">Dostawa</a></li>
            <li><a href="{{KONTAKT_URL}}">Kontakt</a></li>
          </ul>
        </nav>

        <div class="foot-col">
          <p class="foot-h">Bezpieczne zakupy</p>
          <div class="foot-trust">
            <div class="pay-badges" aria-label="Dostępne metody płatności">
              <span>BLIK</span>
              <span>Visa</span>
              <span>Mastercard</span>
              <span>Pobranie</span>
            </div>

            <div class="foot-chips">
              <span class="foot-chip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
                14 dni na zwrot bez podawania przyczyny
              </span>
              <span class="foot-chip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3Z"></path>
                  <path d="M9 12l2 2 4-4"></path>
                </svg>
                Bezpieczne płatności — BLIK, karta lub za pobraniem
              </span>
              <span class="foot-chip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="1.5" y="6" width="13" height="10" rx="1.5"></rect>
                  <path d="M14.5 9H18l3.5 3.2V16h-7z"></path>
                  <circle cx="6" cy="18" r="1.9"></circle>
                  <circle cx="17" cy="18" r="1.9"></circle>
                </svg>
                Wysyłka pod wskazany adres
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="foot-bottom">
        <p class="foot-copy">© 2026 Zaradek · Wszystkie prawa zastrzeżone</p>
        <p class="foot-note">Ceny zawierają VAT · Zdjęcia mają charakter poglądowy</p>
      </div>
    </div>
  </footer>

  <script>
    (function () {
      "use strict";

      var cardsContainer = document.querySelector("[data-cards]");
      if (cardsContainer) {
        var cards = cardsContainer.querySelectorAll(".product-card");
        cardsContainer.setAttribute("data-count", String(cards.length));

        cards.forEach(function (card, index) {
          var image = card.querySelector("img");
          if (!image) return;

          if (index === 0) {
            image.loading = "eager";
            image.fetchPriority = "high";
          } else {
            image.loading = "lazy";
          }
        });
      }

      var reducedMotion = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var reveals = document.querySelectorAll(".reveal");

      if (!reducedMotion && "IntersectionObserver" in window) {
        var observer = new IntersectionObserver(function (entries, instance) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              instance.unobserve(entry.target);
            }
          });
        }, {
          rootMargin: "0px 0px -48px",
          threshold: 0.08
        });

        reveals.forEach(function (element) {
          observer.observe(element);
        });
      } else {
        reveals.forEach(function (element) {
          element.classList.add("is-visible");
        });
      }

      var endpoint = "https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-landing-api?product=";
      var priceNodes = Array.prototype.slice.call(
        document.querySelectorAll("[data-wf2-product]")
      );

      var requests = priceNodes.map(function (node) {
        var productId = node.getAttribute("data-wf2-product");
        if (!productId) return Promise.resolve();

        return fetch(endpoint + encodeURIComponent(productId), {
          method: "GET",
          headers: { "Accept": "application/json" }
        })
          .then(function (response) {
            if (!response.ok) throw new Error("Price request failed");
            return response.json();
          })
          .then(function (payload) {
            var rawPrice = payload && payload.price;
            var numericPrice = typeof rawPrice === "number"
              ? rawPrice
              : Number(String(rawPrice).replace(/\s/g, "").replace(",", "."));

            if (!Number.isFinite(numericPrice)) return;

            node.textContent = new Intl.NumberFormat("pl-PL", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(numericPrice).replace(/\u00A0|\u202F/g, " ") + " zł";
          })
          .catch(function () {});
      });

      Promise.allSettled(requests).then(function () {
        try {
          window.trevio?.viewItemList?.();
        } catch (error) {}
      });
    })();
  </script>
</body>
</html>
```