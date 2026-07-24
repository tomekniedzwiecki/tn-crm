```html
<!doctype html>
<html lang="pl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sprytko — Codzienność, tylko sprytniej</title>
  <meta name="description" content="Sprytko to sklep z praktycznymi gadżetami i domowymi patentami, które ułatwiają codzienność i po prostu działają — bez kombinowania i bez rozczarowań.">
  <meta name="robots" content="noindex,nofollow">
  <link rel="canonical" href="{{CANONICAL_URL}}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Sprytko — Codzienność, tylko sprytniej">
  <meta property="og:description" content="Praktyczne gadżety i domowe patenty wybrane tak, żeby ułatwiały codzienność i po prostu działały.">
  <meta property="og:image" content="{{OG_URL}}">
  <link rel="icon" href="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/parasol-sprytko/brand/favicon-256.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Quicksand:wght@600;700&display=swap&subset=latin-ext" rel="stylesheet">

  <style>
    :root {
      --primary: #4CAF6E;
      --ink: #24303A;
      --body: #4B5660;
      --muted: #727A80;
      --bg: #FCF9F3;
      --paper-2: #FFFFFF;
      --surface: #FFFFFF;
      --line: #EAE4D8;
      --radius: 16px;
      --shadow-hover: 0 16px 34px rgba(36, 48, 58, .11);
      --cta: var(--primary);
      --cta-d: var(--primary);
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
      min-width: 320px;
      margin: 0;
      overflow-x: hidden;
      background: var(--bg);
      color: var(--body);
      font-family: "Inter", sans-serif;
      line-height: 1.6;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
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

    :focus-visible {
      outline: 3px solid var(--primary);
      outline-offset: 3px;
    }

    .wrap {
      width: min(100% - 32px, 1140px);
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
    }

    .topbar-logo {
      min-width: 120px;
      min-height: 44px;
      display: inline-flex;
      align-items: center;
    }

    .topbar-logo img {
      width: auto;
      height: 40px;
    }

    .topbar-trust {
      margin: 0;
      color: var(--ink);
      font-size: 13px;
      font-weight: 600;
      line-height: 1.4;
      text-align: right;
    }

    .intro {
      padding: clamp(56px, 8vw, 96px) 0 clamp(48px, 7vw, 80px);
    }

    .intro-inner {
      max-width: 840px;
    }

    .intro h1 {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      margin-bottom: 24px;
      color: var(--ink);
      font-family: "Quicksand", sans-serif;
      font-size: clamp(38px, 6vw, 68px);
      font-weight: 700;
      letter-spacing: -.045em;
      line-height: 1.08;
    }

    .intro h1::before {
      content: "✓";
      width: 32px;
      height: 32px;
      margin-top: .16em;
      flex: 0 0 32px;
      display: inline-grid;
      place-items: center;
      border-radius: var(--radius);
      background: var(--primary);
      color: #FFFFFF;
      font-family: "Inter", sans-serif;
      font-size: 19px;
      font-weight: 700;
      letter-spacing: 0;
      line-height: 1;
      transform: rotate(-5deg);
    }

    .intro p {
      max-width: 720px;
      margin-bottom: 0;
      color: var(--body);
      font-size: clamp(17px, 2vw, 20px);
      line-height: 1.7;
    }

    .trust-strip {
      padding: 16px 0;
      background: var(--surface);
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
    }

    .trust-list {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .trust-chip {
      min-height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 8px 16px;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      color: var(--ink);
      font-size: 14px;
      font-weight: 600;
      text-align: center;
    }

    .trust-chip svg {
      width: 20px;
      height: 20px;
      flex: 0 0 auto;
      color: var(--primary);
    }

    .products {
      padding: clamp(64px, 8vw, 96px) 0;
    }

    .section-heading {
      max-width: 680px;
      margin-bottom: 32px;
    }

    .section-heading h2,
    .how-inner h2 {
      margin-bottom: 12px;
      color: var(--ink);
      font-family: "Quicksand", sans-serif;
      font-size: clamp(28px, 4vw, 40px);
      font-weight: 700;
      letter-spacing: -.025em;
      line-height: 1.2;
    }

    .section-heading p {
      margin-bottom: 0;
      font-size: 16px;
    }

    [data-cards] {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      width: 100%;
    }

    [data-cards] > a {
      min-width: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: var(--surface);
      color: var(--body);
      transition:
        transform .2s ease,
        box-shadow .2s ease,
        border-color .2s ease,
        opacity .4s ease;
    }

    [data-cards] > a:hover {
      transform: translateY(-3px);
      border-color: var(--primary);
      box-shadow: var(--shadow-hover);
    }

    .card-media {
      position: relative;
      overflow: hidden;
      aspect-ratio: 1 / 1;
      background: var(--bg);
    }

    .card-media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .card-content {
      min-width: 0;
      display: flex;
      flex: 1;
      flex-direction: column;
      align-items: flex-start;
      padding: 24px;
    }

    .card-name {
      margin-bottom: 8px;
      color: var(--ink);
      font-family: "Quicksand", sans-serif;
      font-size: 25px;
      font-weight: 700;
      letter-spacing: -.02em;
      line-height: 1.2;
    }

    .card-hook {
      margin-bottom: 24px;
      color: var(--body);
      font-size: 15px;
      line-height: 1.6;
    }

    .card-bottom {
      width: 100%;
      margin-top: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .card-price {
      color: var(--ink);
      font-size: 20px;
      font-weight: 700;
      white-space: nowrap;
    }

    .card-cta {
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 16px;
      border-radius: var(--radius);
      background: var(--primary);
      color: #FFFFFF;
      font-size: 14px;
      font-weight: 700;
      text-align: center;
    }

    [data-cards][data-count="1"] {
      max-width: 960px;
      margin-inline: auto;
      grid-template-columns: minmax(0, 1fr);
    }

    [data-cards][data-count="1"] > a {
      display: grid;
      grid-template-columns: minmax(280px, 1fr) minmax(280px, 1fr);
    }

    [data-cards][data-count="1"] .card-content {
      padding: clamp(24px, 5vw, 48px);
    }

    .reveal-ready [data-cards] > a {
      opacity: 0;
    }

    .reveal-ready [data-cards] > a.is-visible {
      opacity: 1;
    }

    .how {
      padding: clamp(48px, 7vw, 72px) 0;
      background: var(--surface);
      border-top: 1px solid var(--line);
    }

    .how-inner {
      max-width: 820px;
    }

    .how-inner p {
      margin-bottom: 0;
      font-size: 17px;
      line-height: 1.7;
    }

    @media (max-width: 760px) {
      .topbar-inner {
        min-height: 80px;
        gap: 16px;
      }

      .topbar-logo img {
        height: 36px;
      }

      .topbar-trust {
        max-width: 170px;
        font-size: 12px;
      }

      .trust-list {
        grid-template-columns: 1fr;
        gap: 8px;
      }

      .trust-chip {
        justify-content: flex-start;
      }

      [data-cards][data-count="1"] > a {
        display: flex;
      }
    }

    @media (max-width: 420px) {
      .wrap {
        width: min(100% - 24px, 1140px);
      }

      .intro h1 {
        gap: 10px;
        font-size: 36px;
      }

      .intro h1::before {
        width: 28px;
        height: 28px;
        flex-basis: 28px;
        font-size: 17px;
      }

      .card-bottom {
        align-items: flex-start;
        flex-direction: column;
      }

      .card-cta {
        width: 100%;
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
        transition-duration: .01ms !important;
      }

      [data-cards] > a,
      .reveal-ready [data-cards] > a {
        opacity: 1;
        transform: none;
      }
    }
  </style>

  <style>
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
      width: 34px;
      height: 34px;
      display: block;
      flex: 0 0 auto;
    }

    #footer .foot-brand span {
      font-family: "Quicksand", sans-serif;
      font-size: 27px;
      font-weight: 700;
      letter-spacing: .01em;
    }

    #footer .foot-claim {
      max-width: 340px;
      margin-top: 15px;
      margin-bottom: 0;
      color: var(--body);
      font-size: 14.5px;
      line-height: 1.55;
    }

    #footer .foot-h {
      margin-bottom: 16px;
      color: var(--ink);
      font-family: "Quicksand", sans-serif;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: .02em;
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
      transition: color .18s ease;
    }

    #footer .foot-nav a:hover {
      color: var(--primary);
    }

    #footer .foot-trust {
      display: grid;
      gap: 16px;
    }

    #footer .pay-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    #footer .pay-badge {
      min-height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 5px 10px;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: var(--bg);
      color: var(--ink);
      font-size: 12px;
      font-weight: 700;
      line-height: 1;
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
      color: var(--primary);
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
      <a class="topbar-logo" href="{{CANONICAL_URL}}" aria-label="Sprytko — strona główna">
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/parasol-sprytko/brand/logo-combo.png"
          width="166"
          height="40"
          alt="Sprytko"
          decoding="async">
      </a>
      <p class="topbar-trust">Płatność przy odbiorze · 14 dni na zwrot</p>
    </div>
  </header>

  <main>
    <section class="intro" aria-labelledby="intro-title">
      <div class="wrap intro-inner">
        <h1 id="intro-title">Sprytko — Codzienność, tylko sprytniej</h1>
        <p>Sprytko to sklep ze sprytnymi rzeczami, które naprawdę ułatwiają codzienność. Znajdziesz tu praktyczne gadżety i domowe patenty wybierane tak, by były proste w użyciu, przydatne od pierwszego dnia i po prostu działały. Bez zbędnego kombinowania, nietrafionych obietnic i rozczarowań.</p>
      </div>
    </section>

    <section class="trust-strip" aria-label="Bezpieczne i wygodne zakupy">
      <div class="wrap">
        <ul class="trust-list">
          <li class="trust-chip">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 7h16v10H4z"></path>
              <path d="M8 12h8"></path>
              <path d="M12 9v6"></path>
            </svg>
            Płatność przy odbiorze
          </li>
          <li class="trust-chip">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
            14 dni na zwrot
          </li>
          <li class="trust-chip">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3Z"></path>
              <path d="M9 12l2 2 4-4"></path>
            </svg>
            Bezpieczne płatności
          </li>
        </ul>
      </div>
    </section>

    <section class="products" aria-labelledby="products-title">
      <div class="wrap">
        <div class="section-heading">
          <h2 id="products-title">Sprytne wybory na co dzień</h2>
          <p>Wybierz rzecz, która rozwiązuje konkretny problem, i przejdź do jej szczegółów.</p>
        </div>

        <!--CARD-TEMPLATE
        <a class="product-card" href="{{CARD_URL}}" aria-label="{{CARD_CTA}} — {{CARD_NAME}}">
          <div class="card-media">
            <img src="{{CARD_IMG}}" width="800" height="800" loading="lazy" decoding="async" alt="{{CARD_ALT}}">
          </div>
          <div class="card-content">
            <h3 class="card-name">{{CARD_NAME}}</h3>
            <p class="card-hook">{{CARD_HOOK}}</p>
            <div class="card-bottom">
              <span class="card-price" data-wf2-product="{{CARD_PID}}">{{CARD_PRICE}}</span>
              <span class="card-cta">{{CARD_CTA}}</span>
            </div>
          </div>
        </a>
        CARD-TEMPLATE-->
        <div data-cards data-count="1"><!--CARDS:START--><!--CARDS:END--></div>
      </div>
    </section>

    <section class="how" aria-labelledby="how-title">
      <div class="wrap how-inner">
        <h2 id="how-title">Jak to działa</h2>
        <p>Przeglądasz wybrane rozwiązania, otwierasz kartę interesującego produktu i poznajesz wszystkie szczegóły. Jeśli pasuje do Twojej codzienności, zamawiasz je wygodnie z wybraną metodą płatności.</p>
      </div>
    </section>
  </main>

  <footer id="footer">
    <div class="wrap">
      <div class="foot-top">
        <div class="foot-brandcol">
          <div class="foot-brand">
            <img
              class="brand-mark"
              src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/parasol-sprytko/brand/favicon-256.png"
              width="96"
              height="96"
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async">
            <span>Sprytko</span>
          </div>
          <p class="foot-claim">Praktyczne gadżety i domowe patenty, które ułatwiają codzienność bez zbędnego kombinowania.</p>
        </div>

        <nav class="foot-col" aria-label="Informacje i pomoc">
          <p class="foot-h">Zakupy i pomoc</p>
          <ul class="foot-nav">
            <li><a href="{{REGULAMIN_URL}}">Regulamin</a></li>
            <li><a href="{{POLITYKA_URL}}">Polityka prywatności</a></li>
            <li><a href="{{POLITYKA_URL}}">Polityka cookies</a></li>
            <li><a href="{{ZWROTY_URL}}">Zwroty i reklamacje</a></li>
            <li><a href="{{DOSTAWA_URL}}">Dostawa</a></li>
            <li><a href="{{KONTAKT_URL}}">Kontakt</a></li>
          </ul>
        </nav>

        <div class="foot-col">
          <p class="foot-h">Bezpieczne zakupy</p>
          <div class="foot-trust">
            <div class="pay-badges" aria-label="Dostępne metody płatności">
              <span class="pay-badge">BLIK</span>
              <span class="pay-badge">Visa</span>
              <span class="pay-badge">Mastercard</span>
              <span class="pay-badge">Pobranie</span>
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
        <p class="foot-copy">© 2026 Sprytko · Wszystkie prawa zastrzeżone</p>
        <p class="foot-note">Ceny zawierają VAT · Zdjęcia mają charakter poglądowy</p>
      </div>
    </div>
  </footer>

  <script>
    (() => {
      const priceEndpoint = "https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-landing-api?product=";
      const priceNodes = document.querySelectorAll("[data-wf2-product]");

      priceNodes.forEach((node) => {
        const productId = node.getAttribute("data-wf2-product");
        if (!productId) return;

        fetch(priceEndpoint + encodeURIComponent(productId), { method: "GET" })
          .then((response) => {
            if (!response.ok) throw new Error("Price request failed");
            return response.json();
          })
          .then((data) => {
            const value = typeof data.price === "string"
              ? Number(data.price.replace(",", ".").replace(/[^\d.-]/g, ""))
              : Number(data.price);

            if (!Number.isFinite(value)) return;

            node.textContent = new Intl.NumberFormat("pl-PL", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(value) + " zł";
          })
          .catch(() => {});
      });

      const productImages = document.querySelectorAll("[data-cards] img");
      productImages.forEach((image, index) => {
        image.loading = index === 0 ? "eager" : "lazy";
      });

      if ("IntersectionObserver" in window) {
        document.documentElement.classList.add("reveal-ready");

        const cards = document.querySelectorAll("[data-cards] > a");
        const observer = new IntersectionObserver((entries, instance) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            instance.unobserve(entry.target);
          });
        }, { threshold: 0.12 });

        cards.forEach((card) => observer.observe(card));
      }

      try {
        window.trevio?.viewItemList?.();
      } catch (_) {}
    })();
  </script>
</body>
</html>
```