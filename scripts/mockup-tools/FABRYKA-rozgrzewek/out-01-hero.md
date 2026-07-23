Siatka: desktop — scena 46% / copy i oferta 54%; mobile — scena → kręgi i eyebrow → hook → nazwa → oferta → trust.

```html
<section id="hero" class="hr-hero hero sect-pad" data-hook="1">
  <div class="wrap hr-wrap">
    <div class="hr-scene reveal">
      <picture>
        <source
          media="(max-width: 899px)"
          srcset="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozgrzewek/assets/sc-hero-mobile.webp"
        >
        <img
          class="hr-image"
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozgrzewek/assets/sc-hero.webp"
          width="1536"
          height="1024"
          loading="eager"
          fetchpriority="high"
          alt="Granatowy masażer Rozgrzewek na ciepłym stoliku, obok parujący kubek i ciepła lampa"
        >
      </picture>
    </div>

    <div class="hr-content reveal">
      <div class="hr-intro">
        <span class="rings-wrap">
          <svg class="rings" viewBox="0 0 88 46" aria-hidden="true" focusable="false">
            <path class="r-out" d="M4 44a40 40 0 0 1 80 0"/>
            <path class="r-mid" d="M15 44a29 29 0 0 1 58 0"/>
            <path class="r-in" d="M26 44a18 18 0 0 1 36 0"/>
          </svg>
        </span>
        <p class="eyebrow hr-eyebrow">TWÓJ WIECZORNY RYTUAŁ</p>
      </div>

      <div class="hr-hooks">
        <div class="hr-hook hr-hook-1">
          <h1 class="display hr-title">
            Wieczorny masaż, który zaczyna się od <span class="swash">ciepła</span>.
          </h1>
          <p class="lead hr-lead hr-lead-desktop">
            Rozgrzewek łączy delikatny ciepły okład, wibracje i tryb EMS — każdy z 9 poziomami intensywności.
          </p>
          <p class="lead hr-lead hr-lead-mobile">
            Ciepły okład, wibracje i tryb EMS — każdy z 9 poziomami.
          </p>
        </div>

        <div class="hr-hook hr-hook-2">
          <h1 class="display hr-title">
            3 tryby. 9 poziomów. Jeden <span class="swash">rytuał</span> po Twojemu.
          </h1>
          <p class="lead hr-lead hr-lead-desktop">
            Podgrzewanie, wibracje i mikroprądy/EMS w ręcznym, bezprzewodowym masażerze do ciała.
          </p>
          <p class="lead hr-lead hr-lead-mobile">
            Podgrzewanie, wibracje i EMS w ręcznym, bezprzewodowym masażerze.
          </p>
        </div>

        <div class="hr-hook hr-hook-3">
          <h1 class="display hr-title">
            Gdy po całym dniu chcesz już tylko chwili dla <span class="swash">siebie</span>.
          </h1>
          <p class="lead hr-lead hr-lead-desktop">
            Sięgnij po rozgrzewający masaż karku, ramion, pleców lub ud — we własnym wieczornym rytmie.
          </p>
          <p class="lead hr-lead hr-lead-mobile">
            Rozgrzewający masaż karku, ramion, pleców lub ud — w Twoim rytmie.
          </p>
        </div>
      </div>

      <p class="hr-product-name">ROZGRZEWEK — PODGRZEWANY MASAŻER DO CIAŁA</p>

      <div class="hr-offer">
        <span class="display hr-price" data-price>84,90 zł</span>
        <a class="btn cta hr-cta" data-checkout href="#zamow">Chcę swój Rozgrzewek</a>
        <p class="hr-micro">Płatność przy odbiorze • 14 dni na zwrot</p>
      </div>

      <div class="hr-trust" aria-label="Informacje o płatności i zgodności">
        <div class="pill hr-trust-pill">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="m3.5 7.5 8.5-4 8.5 4v9L12 21l-8.5-4.5z"/>
            <path d="m3.5 7.5 8.5 4 8.5-4M12 11.5V21"/>
          </svg>
          <span>Płatność przy odbiorze</span>
        </div>

        <div class="pill hr-trust-pill">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <rect x="3" y="2.5" width="11" height="19" rx="2"/>
            <path d="M7 5.5h3M7.5 18.5h2"/>
            <rect x="9" y="8" width="12" height="8" rx="1.5"/>
            <path d="M11.5 11h7"/>
          </svg>
          <span>BLIK i płatność online</span>
        </div>

        <div class="pill hr-trust-pill">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 2.5 20 6v5.5c0 5-3.2 8.2-8 10-4.8-1.8-8-5-8-10V6z"/>
            <path d="m8.5 12 2.2 2.2 4.8-5"/>
          </svg>
          <span>CE i RoHS</span>
        </div>
      </div>
    </div>
  </div>

  <style scoped>
    .hr-hero {
      overflow: hidden;
      background: var(--paper);
      color: var(--body);
    }

    .hr-hero .hr-wrap {
      display: grid;
      grid-template-columns: minmax(0, 46fr) minmax(0, 54fr);
      align-items: center;
      gap: var(--s6);
    }

    .hr-hero .hr-scene {
      position: relative;
      min-width: 0;
      overflow: hidden;
      border-radius: var(--radius-lg);
      background: var(--paper-2);
      box-shadow: var(--shadow-sm);
      isolation: isolate;
    }

    .hr-hero .hr-scene picture {
      display: block;
      height: 100%;
    }

    .hr-hero .hr-image {
      display: block;
      width: 100%;
      height: min(680px, 72vh);
      object-fit: cover;
      border-radius: var(--radius-lg);
    }

    .hr-hero .hr-scene::after {
      position: absolute;
      z-index: 1;
      top: -12%;
      right: -12%;
      width: 55%;
      aspect-ratio: 1;
      border-radius: 50%;
      background: radial-gradient(circle, var(--card) 0%, transparent 68%);
      content: "";
      pointer-events: none;
      opacity: 0.28;
      animation: hr-ambient-breathe 6s ease-in-out infinite;
    }

    @keyframes hr-ambient-breathe {
      0%,
      100% {
        opacity: 0.2;
      }
      50% {
        opacity: 0.38;
      }
    }

    .hr-hero .hr-content {
      min-width: 0;
      text-align: center;
    }

    .hr-hero .hr-intro {
      display: grid;
      justify-items: center;
      gap: var(--s2);
      margin-bottom: var(--s3);
    }

    .hr-hero .rings-wrap {
      display: block;
      width: 88px;
      height: 46px;
    }

    .hr-hero .rings {
      display: block;
      width: 88px;
      height: 46px;
      overflow: visible;
      fill: none;
      stroke-linecap: round;
      stroke-width: 1.75px;
    }

    .hr-hero .rings path {
      stroke: var(--line);
      stroke-dasharray: 130;
      stroke-dashoffset: 130;
      transition: stroke-dashoffset 900ms ease;
    }

    .hr-hero .rings .r-out {
      stroke: var(--cta);
    }

    .hr-hero .reveal.in .rings path {
      stroke-dashoffset: 0;
    }

    .hr-hero .hr-eyebrow {
      margin: 0;
      color: var(--ink);
    }

    .hr-hero .hr-hook {
      display: none;
    }

    .hr-hero .hr-hook-1 {
      display: block;
    }

    .hr-hero[data-hook="2"] .hr-hook-1,
    .hr-hero[data-hook="3"] .hr-hook-1 {
      display: none;
    }

    .hr-hero[data-hook="2"] .hr-hook-2,
    .hr-hero[data-hook="3"] .hr-hook-3 {
      display: block;
    }

    .hr-hero .hr-title {
      max-width: 800px;
      margin: 0 auto;
      color: var(--ink);
      font-size: var(--h1-d);
      line-height: 1.02;
    }

    .hr-hero .hr-lead {
      max-width: 720px;
      margin: var(--s3) auto 0;
      color: var(--body);
      font-size: 17px;
    }

    .hr-hero .hr-lead-mobile {
      display: none;
    }

    .hr-hero .hr-product-name {
      margin: var(--s4) auto var(--s2);
      color: var(--ink);
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.1em;
      line-height: 1.4;
      text-transform: uppercase;
    }

    .hr-hero .hr-offer {
      display: grid;
      gap: var(--s3);
      width: min(100%, 590px);
      margin-inline: auto;
      padding: var(--s4);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      background: var(--card);
      box-shadow: var(--shadow-md);
    }

    .hr-hero .hr-price {
      display: block;
      color: var(--ink);
      font-size: var(--price-fs);
      font-weight: 700;
      line-height: 1;
    }

    .hr-hero .hr-cta {
      width: 100%;
    }

    .hr-hero .hr-micro {
      margin: 0;
      color: var(--body);
      font-size: 13.5px;
      line-height: 1.35;
    }

    .hr-hero .hr-trust {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--s2);
      width: min(100%, 650px);
      margin: var(--s3) auto 0;
    }

    .hr-hero .hr-trust-pill {
      display: flex;
      min-width: 0;
      align-items: center;
      justify-content: center;
      gap: var(--s2);
      padding: var(--s2) var(--s3);
      border: 1px solid var(--line);
      background: var(--card);
      color: var(--ink);
      font-size: 13.5px;
      line-height: 1.25;
      text-align: left;
    }

    .hr-hero .hr-trust-pill svg {
      flex: 0 0 27px;
      width: 27px;
      height: 27px;
      fill: none;
      stroke: var(--ink);
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 1.75px;
    }

    @media (max-width: 899px) {
      .hr-hero {
        padding-top: var(--s2);
      }

      .hr-hero .hr-wrap {
        grid-template-columns: 1fr;
        gap: var(--s2);
      }

      .hr-hero .hr-scene {
        width: 100%;
        border-radius: var(--radius-lg);
        box-shadow: none;
      }

      .hr-hero .hr-image {
        width: 100%;
        height: 24vh;
        max-height: 38vh;
        min-height: 175px;
        object-fit: cover;
        object-position: center 42%;
      }

      .hr-hero .hr-scene::after {
        width: 45%;
        opacity: 0.22;
      }

      .hr-hero .hr-intro {
        gap: 2px;
        margin-bottom: var(--s1);
      }

      .hr-hero .rings-wrap,
      .hr-hero .rings {
        width: 66px;
        height: 35px;
      }

      .hr-hero .hr-eyebrow {
        font-size: 12px;
      }

      .hr-hero .hr-title {
        max-width: 380px;
        font-size: var(--h1-m);
        line-height: 1.03;
      }

      .hr-hero .hr-lead-desktop {
        display: none;
      }

      .hr-hero .hr-lead-mobile {
        display: block;
      }

      .hr-hero .hr-lead {
        max-width: 360px;
        margin-top: var(--s2);
        font-size: 16px;
        line-height: 1.3;
      }

      .hr-hero .hr-product-name {
        max-width: 350px;
        margin-top: var(--s2);
        margin-bottom: var(--s1);
        font-size: 11px;
        line-height: 1.3;
      }

      .hr-hero .hr-offer {
        gap: var(--s2);
        width: 100%;
        padding: var(--s2);
      }

      .hr-hero .hr-price {
        line-height: 0.95;
      }

      .hr-hero .hr-cta {
        min-height: 48px;
        padding-block: var(--s2);
      }

      .hr-hero .hr-micro {
        font-size: 12.5px;
      }

      .hr-hero .hr-trust {
        grid-template-columns: 1fr;
        gap: var(--s2);
        margin-top: var(--s3);
      }

      .hr-hero .hr-trust-pill {
        justify-content: flex-start;
      }
    }

    @media (max-width: 420px) and (max-height: 860px) {
      .hr-hero .hr-image {
        height: 21vh;
        min-height: 160px;
      }

      .hr-hero .hr-wrap {
        gap: var(--s1);
      }

      .hr-hero .hr-intro {
        margin-bottom: 2px;
      }

      .hr-hero .hr-lead {
        margin-top: var(--s1);
      }

      .hr-hero .hr-product-name {
        margin-top: var(--s1);
      }

      .hr-hero .hr-offer {
        gap: var(--s1);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .hr-hero .hr-scene::after {
        animation: none;
        opacity: 0.28;
      }

      .hr-hero .rings path {
        transition: none;
      }
    }
  </style>

  <script scoped>
    (function () {
      try {
        var section = document.getElementById("hero");
        if (!section) return;

        var hook = new URLSearchParams(window.location.search).get("h");
        section.setAttribute("data-hook", hook === "2" || hook === "3" ? hook : "1");
      } catch (error) {
        var fallback = document.getElementById("hero");
        if (fallback) fallback.setAttribute("data-hook", "1");
      }
    }());
  </script>
</section>
```