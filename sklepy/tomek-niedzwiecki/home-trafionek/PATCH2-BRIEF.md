Dostajesz kompletny template.html strony głównej sklepu Trafionek (na dole). Wprowadź DOKŁADNIE opisane zmiany, nic więcej. Markery <!--CARDS:START/END-->, <!--CARD-TEMPLATE ... CARD-TEMPLATE-->, <!--ITEMLIST:START/END--> i placeholdery {{...}} — NIETYKALNE (poza jawnie wskazanymi rozszerzeniami).

ZMIANA 1 — HERO-VIDEO ROTATOR zamiast statycznego medalionu (desktop ≥980px):
- W miejscu obecnego medalionu z faviconem osadź rotator wideo: zaokrąglona karta (radius/border/cień w tokenach marki, tło bg-alt #F6EDE2) o proporcji 4:5, szerokość ~340-380px, subtelnie obrócona (-3deg) jak dotąd medalion.
- Dane klipów wstrzykuje montaż: dodaj TUŻ PRZED zamknięciem </body> markery:
  <!--HEROVIDS:START--><!--HEROVIDS:END-->
  Montaż wstawi tam <script>window.__HOME_VIDS=[{name,landing,mp4,webm,poster},...]</script>. Twój kod czyta window.__HOME_VIDS (defensywnie: brak/pusta lista → pokaż dotychczasowy statyczny medalion z faviconem jako fallback — zostaw jego markup ukryty).
- Mechanika rotatora: DWA elementy <video muted playsinline loop preload="none"> w karcie, naprzemienny crossfade (opacity .8s) co ~6 s między klipami po kolei (równe szanse — bez losowania). Źródła: webm (jeśli jest) + mp4; poster z pola poster. Start odtwarzania DOPIERO gdy hero w viewport (IntersectionObserver) — do tego czasu zero pobierania (preload="none", src ustawiane w JS).
- Na karcie rotatora, dolny lewy róg: chip (pigułka w stylu marki, tło białe, border, tekst ink) z nazwą aktualnego klipu, np. „Odprężek →" — chip jest LINKIEM do landing danego klipu (podmieniaj href i tekst przy zmianie klipu).
- prefers-reduced-motion: reduce → rotator wyłączony, pokazany statyczny medalion (fallback).
- Mobile <980px: rotator ukryty (display:none), jak dotychczasowy medalion.

ZMIANA 2 — HOVER-SWAP obrazów na kartach produktów:
- W CARD-TEMPLATE dodaj DRUGI obraz {{CARD_IMG2}} nakładany na {{CARD_IMG}} (position:absolute, inset:0, object-fit:cover, opacity:0, transition opacity .35s, loading="lazy", aria-hidden="true", alt="").
- Na hover/focus-visible karty: drugi obraz opacity:1 (płynny swap kadru). Na urządzeniach dotykowych (hover:none) — swap wyłączony (media query @media (hover:hover)).
- Kontener obrazu musi mieć position:relative i zachować obecną proporcję 1:1.

ZWRÓĆ WYŁĄCZNIE kompletny poprawiony HTML w jednym bloku ```html ... ``` — bez komentarza.

--- TEMPLATE.HTML ---
<!doctype html>
<html lang="pl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Trafionek — Trafione rzeczy na co dzień</title>
  <meta name="description" content="Trafionek wybiera praktyczne rzeczy do domu, relaksu, auta i dla zwierzaków. Każdy produkt ma własną stronę z jasnym opisem działania, płatnością przy odbiorze i możliwością zwrotu w ciągu 14 dni.">
  <meta name="robots" content="noindex,nofollow">
  <link rel="canonical" href="{{CANONICAL_URL}}">

  <meta property="og:type" content="website">
  <meta property="og:title" content="Trafionek — Trafione rzeczy na co dzień">
  <meta property="og:description" content="Praktyczne produkty wybrane spośród setek trendów — z jasnym opisem, płatnością przy odbiorze i 14 dniami na zwrot.">
  <meta property="og:image" content="{{OG_URL}}">
  <meta property="og:url" content="{{CANONICAL_URL}}">

  <link rel="icon" href="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/parasol-trafionek/brand/favicon-512.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Baloo+2:wght@500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap&subset=latin-ext" rel="stylesheet">

  <script>
    document.documentElement.classList.add("js");
  </script>

  <style>
    :root {
      --primary: #E63946;
      --ink: #26221E;
      --body: #514A43;
      --muted: #756C63;
      --bg: #FDF8F2;
      --bg-alt: #F6EDE2;
      --border: #E7DCCD;
      --white: #FFFFFF;
      --radius: 20px;
      --shadow: 0 14px 34px rgba(38, 34, 30, 0.09);

      --paper-2: var(--bg-alt);
      --line: var(--border);
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
      margin: 0;
      min-width: 320px;
      overflow-x: hidden;
      background: var(--bg);
      color: var(--body);
      font-family: "Nunito", sans-serif;
      font-size: 16px;
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

    .wrap {
      width: min(100% - 32px, 1140px);
      margin-inline: auto;
    }

    .topbar {
      background: var(--bg);
      border-bottom: 1px solid var(--border);
    }

    .topbar-inner {
      min-height: 72px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      padding-block: 12px;
    }

    .topbar-logo {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
      flex: 0 0 auto;
    }

    .topbar-logo img {
      width: auto;
      height: 38px;
      object-fit: contain;
    }

    .topbar-trust {
      margin: 0;
      color: var(--muted);
      font-size: 14px;
      font-weight: 700;
      text-align: right;
      line-height: 1.35;
    }

    .intro {
      padding: clamp(64px, 9vw, 112px) 0 clamp(56px, 8vw, 96px);
      background:
        radial-gradient(circle at 83% 18%, rgba(230, 57, 70, 0.07), transparent 28%),
        var(--bg);
    }

    .intro-copy {
      max-width: 850px;
    }

    .intro-signature {
      display: none;
    }

    .intro-kicker {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin: 0 0 16px;
      color: var(--primary);
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .intro-kicker::before {
      content: "✓";
      width: 28px;
      height: 28px;
      display: inline-grid;
      place-items: center;
      border: 2px solid var(--primary);
      border-radius: var(--radius);
      font-size: 16px;
      line-height: 1;
    }

    .intro h1 {
      max-width: 820px;
      margin-bottom: 24px;
      color: var(--ink);
      font-family: "Fredoka", "Baloo 2", sans-serif;
      font-size: clamp(44px, 7vw, 78px);
      font-weight: 700;
      line-height: 0.98;
      letter-spacing: -0.035em;
    }

    .intro h1 span {
      display: block;
    }

    .intro h1 small {
      display: block;
      margin-top: 12px;
      color: var(--ink);
      font: inherit;
      font-size: clamp(27px, 4vw, 46px);
      line-height: 1.08;
      letter-spacing: -0.025em;
    }

    .intro-text {
      max-width: 760px;
      margin-bottom: 0;
      color: var(--body);
      font-size: clamp(17px, 2vw, 20px);
      line-height: 1.65;
    }

    @media (min-width: 980px) {
      .intro .wrap {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 56px;
      }

      .intro-copy {
        max-width: 620px;
        flex: 1 1 55%;
      }

      .intro-signature {
        width: clamp(260px, 25vw, 300px);
        aspect-ratio: 1;
        display: grid;
        place-items: center;
        flex: 0 0 auto;
        padding: 28px;
        background: var(--bg-alt);
        border: 1px solid var(--border);
        border-radius: 42%;
        box-shadow: 0 20px 46px rgba(38, 34, 30, 0.1);
        transform: rotate(-4deg);
      }

      .intro-signature img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .trust-strip {
      padding: 24px 0;
      background: var(--bg-alt);
      border-block: 1px solid var(--border);
    }

    .trust-list {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .trust-chip {
      width: auto;
      min-height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 12px 16px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      color: var(--ink);
      font-size: 14px;
      font-weight: 800;
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
      background: var(--bg);
    }

    .products-heading {
      max-width: 680px;
      margin-bottom: 32px;
    }

    .products-heading h2 {
      margin-bottom: 8px;
      color: var(--ink);
      font-family: "Fredoka", "Baloo 2", sans-serif;
      font-size: clamp(32px, 5vw, 48px);
      line-height: 1.08;
      letter-spacing: -0.025em;
    }

    .products-heading p {
      margin-bottom: 0;
      color: var(--muted);
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
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      transition:
        transform 180ms ease,
        box-shadow 180ms ease,
        border-color 180ms ease;
    }

    .product-card:hover,
    .product-card:focus-visible {
      transform: translateY(-3px);
      border-color: var(--primary);
      box-shadow: var(--shadow);
    }

    .product-card:focus-visible {
      outline: 3px solid var(--primary);
      outline-offset: 3px;
    }

    .product-media {
      width: 100%;
      aspect-ratio: 1 / 1;
      overflow: hidden;
      background: var(--bg-alt);
      border-bottom: 1px solid var(--border);
    }

    .product-media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-content {
      min-width: 0;
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 24px;
    }

    .product-name {
      margin-bottom: 8px;
      color: var(--ink);
      font-family: "Fredoka", "Baloo 2", sans-serif;
      font-size: 28px;
      font-weight: 700;
      line-height: 1.1;
      letter-spacing: -0.015em;
    }

    .product-hook {
      margin-bottom: 24px;
      color: var(--body);
      line-height: 1.55;
    }

    .product-bottom {
      margin-top: auto;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 16px;
    }

    .product-price {
      color: var(--ink);
      font-family: "Fredoka", "Baloo 2", sans-serif;
      font-size: 24px;
      font-weight: 700;
      line-height: 1.2;
      white-space: nowrap;
    }

    .product-cta {
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 18px;
      background: var(--primary);
      border: 1px solid var(--primary);
      border-radius: var(--radius);
      color: var(--white);
      font-size: 14px;
      font-weight: 800;
      line-height: 1.2;
      text-align: center;
    }

    [data-cards][data-count="1"] {
      max-width: 940px;
      margin-inline: auto;
      grid-template-columns: 1fr;
    }

    @media (min-width: 760px) {
      [data-cards][data-count="1"] .product-card {
        display: grid;
        grid-template-columns: minmax(300px, 1fr) minmax(300px, 1.15fr);
      }

      [data-cards][data-count="1"] .product-media {
        border-right: 1px solid var(--border);
        border-bottom: 0;
      }

      [data-cards][data-count="1"] .product-content {
        padding: clamp(32px, 5vw, 56px);
      }

      [data-cards][data-count="1"] .product-name {
        font-size: clamp(32px, 4vw, 42px);
      }
    }

    .how-band {
      padding: clamp(48px, 7vw, 72px) 0;
      background: var(--bg-alt);
      border-top: 1px solid var(--border);
    }

    .how-inner {
      display: grid;
      grid-template-columns: minmax(220px, 0.7fr) minmax(0, 1.3fr);
      align-items: center;
      gap: 32px;
    }

    .how-band h2 {
      margin-bottom: 0;
      color: var(--ink);
      font-family: "Fredoka", "Baloo 2", sans-serif;
      font-size: clamp(30px, 4vw, 42px);
      line-height: 1.1;
      letter-spacing: -0.02em;
    }

    .how-band p {
      margin-bottom: 0;
      color: var(--body);
      font-size: 17px;
      line-height: 1.65;
    }

    .js .reveal {
      opacity: 0;
      transform: translateY(16px);
      transition:
        opacity 500ms ease,
        transform 500ms ease;
    }

    .js .reveal.is-visible {
      opacity: 1;
      transform: none;
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
      width: 34px;
      height: 34px;
      display: block;
      flex: 0 0 auto;
      object-fit: contain;
    }

    #footer .foot-brand span {
      font-family: "Fredoka", "Baloo 2", sans-serif;
      font-weight: 700;
      font-size: 27px;
      letter-spacing: 0.01em;
    }

    #footer .foot-claim {
      max-width: 340px;
      margin-top: 15px;
      font-size: 14.5px;
      color: var(--body);
      line-height: 1.55;
    }

    #footer .foot-h {
      margin-bottom: 16px;
      color: var(--ink);
      font-family: "Fredoka", "Baloo 2", sans-serif;
      font-weight: 700;
      font-size: 15px;
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

    #footer .foot-nav a:hover,
    #footer .foot-nav a:focus-visible {
      color: var(--cta-d);
    }

    #footer .foot-nav a:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
      border-radius: var(--radius);
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
      padding: 5px 11px;
      background: var(--bg);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      color: var(--ink);
      font-size: 12px;
      font-weight: 800;
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

    @media (max-width: 700px) {
      .topbar-inner {
        align-items: flex-start;
        flex-direction: column;
        gap: 4px;
      }

      .topbar-trust {
        text-align: left;
      }

      .trust-list {
        display: grid;
        grid-template-columns: 1fr;
      }

      .how-inner {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }

    @media (max-width: 520px) {
      .wrap {
        width: min(100% - 24px, 1140px);
      }

      .intro {
        padding-top: 48px;
      }

      .product-content {
        padding: 20px;
      }

      .product-bottom {
        align-items: stretch;
        flex-direction: column;
      }

      .product-cta {
        width: 100%;
      }

      #footer .foot-top {
        grid-template-columns: 1fr;
        gap: 30px;
      }

      #footer .foot-brandcol {
        grid-column: auto;
      }

      #footer .foot-bottom {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
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
    }
  </style>

  <!--ITEMLIST:START--><!--ITEMLIST:END-->
</head>
<body>
  <header class="topbar">
    <div class="wrap topbar-inner">
      <a class="topbar-logo" href="{{CANONICAL_URL}}" aria-label="Trafionek — strona główna">
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/parasol-trafionek/brand/logo-combo.png"
          width="209"
          height="40"
          alt="Trafionek"
          decoding="async">
      </a>
      <p class="topbar-trust">Płatność przy odbiorze · 14 dni na zwrot</p>
    </div>
  </header>

  <main>
    <section class="intro" aria-labelledby="intro-title">
      <div class="wrap">
        <div class="intro-copy reveal">
          <p class="intro-kicker">Wybrane, bo robią robotę</p>
          <h1 id="intro-title">
            <span>Trafionek</span>
            <small>Trafione rzeczy na co dzień</small>
          </h1>
          <p class="intro-text">Trafionek to sklep z rzeczami, które po prostu robią robotę. Spośród setek trendów wybieramy tylko trafione produkty do domu, relaksu, auta i dla zwierzaków. Każdy ma własną małą markę oraz stronę pokazującą dokładnie, co potrafi. Płacisz przy odbiorze, a jeśli coś nie zagra, masz 14 dni na zwrot.</p>
        </div>
        <div class="intro-signature" aria-hidden="true">
          <img
            src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/parasol-trafionek/brand/favicon-512.png"
            width="512"
            height="512"
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async">
        </div>
      </div>
    </section>

    <section class="trust-strip" aria-label="Bezpieczne zakupy">
      <div class="wrap">
        <div class="trust-list">
          <div class="trust-chip">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2"></rect>
              <path d="M3 10h18M16 15h2"></path>
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
      </div>
    </section>

    <section class="products" aria-labelledby="products-title">
      <div class="wrap">
        <div class="products-heading reveal">
          <h2 id="products-title">Poznaj nasze trafienia</h2>
          <p>Każda karta prowadzi do osobnej strony produktu z pełnym opisem jego działania.</p>
        </div>

        <!--CARD-TEMPLATE
        <a class="product-card reveal" href="{{CARD_URL}}" aria-label="{{CARD_CTA}}">
          <div class="product-media">
            <img src="{{CARD_IMG}}" width="720" height="720" alt="{{CARD_ALT}}" loading="lazy" decoding="async">
          </div>
          <div class="product-content">
            <h3 class="product-name">{{CARD_NAME}}</h3>
            <p class="product-hook">{{CARD_HOOK}}</p>
            <div class="product-bottom">
              <span class="product-price" data-wf2-product="{{CARD_PID}}">{{CARD_PRICE}}</span>
              <span class="product-cta">{{CARD_CTA}}</span>
            </div>
          </div>
        </a>
        CARD-TEMPLATE-->
        <div data-cards data-count="3"><!--CARDS:START--><!--CARDS:END--></div>
      </div>
    </section>

    <section class="how-band" aria-labelledby="how-title">
      <div class="wrap how-inner reveal">
        <h2 id="how-title">Jak to działa?</h2>
        <p>Wybierz produkt, przejdź na jego stronę i sprawdź szczegóły. Zamów z dostawą pod wskazany adres, zapłać wygodnie — także przy odbiorze — i skorzystaj z 14 dni na zwrot, jeśli zakup nie będzie trafiony.</p>
      </div>
    </section>
  </main>

  <footer id="footer">
    <div class="wrap">
      <div class="foot-top">
        <div class="foot-brandcol">
          <div class="foot-brand">
            <img class="brand-mark" src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/parasol-trafionek/brand/favicon-512.png" width="96" height="96" alt="" aria-hidden="true" loading="lazy" decoding="async">
            <span>Trafionek</span>
          </div>
          <p class="foot-claim">Trafione rzeczy, które pomagają w codzienności i po prostu robią robotę.</p>
        </div>

        <nav class="foot-col" aria-label="Informacje i pomoc">
          <p class="foot-h">Zakupy i pomoc</p>
          <ul class="foot-nav">
            <li><a href="{{REGULAMIN_URL}}">Regulamin</a></li>
            <li><a href="{{POLITYKA_URL}}">Polityka prywatności</a></li>
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
        <p class="foot-copy">© 2026 Trafionek · Wszystkie prawa zastrzeżone</p>
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
        if (cards.length) {
          cardsContainer.setAttribute("data-count", String(cards.length));

          cards.forEach(function (card, index) {
            var image = card.querySelector("img");
            if (!image) return;

            if (index === 0) {
              image.loading = "eager";
              image.setAttribute("fetchpriority", "high");
            } else {
              image.loading = "lazy";
            }
          });
        }
      }

      var revealItems = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
      var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion || !("IntersectionObserver" in window)) {
        revealItems.forEach(function (item) {
          item.classList.add("is-visible");
        });
      } else {
        var observer = new IntersectionObserver(function (entries, instance) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              instance.unobserve(entry.target);
            }
          });
        }, {
          threshold: 0.12,
          rootMargin: "0px 0px -32px 0px"
        });

        revealItems.forEach(function (item) {
          observer.observe(item);
        });
      }

      var formatter = new Intl.NumberFormat("pl-PL", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      document.querySelectorAll("[data-wf2-product]").forEach(function (priceNode) {
        var productId = priceNode.getAttribute("data-wf2-product");
        if (!productId) return;

        fetch(
          "https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-landing-api?product=" +
          encodeURIComponent(productId),
          {
            method: "GET",
            headers: { "Accept": "application/json" }
          }
        )
          .then(function (response) {
            if (!response.ok) throw new Error("Price request failed");
            return response.json();
          })
          .then(function (data) {
            if (!data || data.price === null || typeof data.price === "undefined") return;

            var normalized = typeof data.price === "string"
              ? data.price.replace(/\s/g, "").replace(",", ".")
              : data.price;

            var price = Number(normalized);
            if (!Number.isFinite(price)) return;

            priceNode.textContent = formatter.format(price) + " zł";
          })
          .catch(function () {});
      });

      try {
        window.trevio?.viewItemList?.();
      } catch (error) {}
    }());
  </script>
</body>
</html>