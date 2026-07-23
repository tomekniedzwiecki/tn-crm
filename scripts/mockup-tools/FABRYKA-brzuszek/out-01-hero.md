Desktop: szeroka scena lifestyle wyrównana do prawej; karta mikro-oferty nachodzi na jej dolno-lewą krawędź.
Mobile: przycięta scena u góry; karta nachodzi na nią, a pille zawijają się pod CTA.

```html
<section id="hero" class="hr-hero hero sect-pad">
  <div class="wrap hr-wrap">
    <picture class="hr-scene reveal">
      <source
        media="(max-width:600px)"
        srcset="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/brzuszek/assets/sc-hero-mobile.webp"
      >
      <source
        media="(max-width:900px)"
        srcset="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/brzuszek/assets/sc-hero-800.webp"
      >
      <img
        src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/brzuszek/assets/sc-hero.webp"
        width="1536"
        height="1024"
        loading="eager"
        fetchpriority="high"
        alt="Kobieta ćwiczy brzuch na biało-różowej składanej maszynie w jasnym salonie"
      >
    </picture>

    <article class="hr-card reveal" aria-labelledby="hr-title">
      <div class="eyebrow">TWOJA DOMOWA SERIA</div>
      <span class="reps" aria-hidden="true">
        <i></i><i></i><i></i><i></i><i></i>
      </span>

      <h1 id="hr-title" class="display hr-title">
        Brzuch i <span class="swash">core</span>. U siebie.
      </h1>

      <p class="lead hr-lead">
        Składana maszyna z ruchomym wózkiem, 5 wysokościami, 2 kątami nachylenia i licznikiem LCD.
      </p>

      <span class="display hr-price" data-price>429,00 zł</span>

      <a class="btn cta hr-cta" data-checkout href="#zamow">
        Zamawiam Brzuszek
      </a>

      <p class="hr-micro">
        Płatność przy odbiorze, BLIK lub online · 14 dni na zwrot
      </p>
      <!--PAYBADGES-->

      <div class="hr-trust" aria-label="Najważniejsze cechy konstrukcji">
        <div class="pill hr-pill">
          <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
            <path d="M4 26h24"></path>
            <path d="M7 24 12 7a2 2 0 0 1 3.8.2L18 16"></path>
            <path d="m9 23 12-5 7 4"></path>
            <circle cx="9" cy="23" r="2"></circle>
            <circle cx="18" cy="16" r="1.5"></circle>
          </svg>
          <span>Składana konstrukcja</span>
        </div>

        <div class="pill hr-pill">
          <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
            <path d="M4 26h24"></path>
            <path d="M7 24 13 6a2 2 0 0 1 3.8.2L22 24"></path>
            <path d="M10 20h10"></path>
            <path d="M12 15h6"></path>
            <circle cx="8" cy="24" r="2"></circle>
            <circle cx="22" cy="24" r="2"></circle>
          </svg>
          <span>2 kąty · 5 wysokości</span>
        </div>

        <div class="pill hr-pill">
          <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
            <path d="M10 11V8a6 6 0 0 1 12 0v3"></path>
            <path d="M13 11V8a3 3 0 0 1 6 0v3"></path>
            <path d="M9 11h14l3 5v8a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4v-8l3-5Z"></path>
            <path d="M16 16v6"></path>
          </svg>
          <span>Udźwig ≈ 200 kg</span>
        </div>
      </div>
    </article>
  </div>

  <style>
    .hr-hero {
      position: relative;
      overflow: clip;
      background: var(--paper-2);
      color: var(--ink);
      padding-block: var(--s3) var(--s6);
    }

    .hr-hero .hr-wrap {
      position: relative;
    }

    .hr-hero .hr-scene {
      display: block;
      width: calc(100% - var(--s5));
      margin-left: auto;
      overflow: hidden;
      border-radius: var(--radius-lg);
      background: var(--paper);
      box-shadow: var(--shadow-md);
    }

    .hr-hero .hr-scene img {
      display: block;
      width: 100%;
      height: auto;
      object-fit: cover;
      object-position: center;
      border-radius: var(--radius-lg);
    }

    .hr-hero .hr-card {
      position: relative;
      z-index: 2;
      width: min(580px, calc(100% - var(--s4)));
      margin-top: -64px;
      padding: var(--s5);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      background: var(--card);
      box-shadow: var(--shadow-lg);
    }

    .hr-hero .eyebrow {
      margin: 0;
      color: var(--ink);
    }

    .hr-hero .reps {
      margin-top: var(--s2);
    }

    .hr-hero .hr-title {
      max-width: 500px;
      margin: var(--s3) 0 0;
      font-family: var(--font-display);
      font-size: var(--h1-d);
      font-stretch: 125%;
      font-weight: 800;
      line-height: 1.02;
      letter-spacing: -0.035em;
      color: var(--ink);
    }

    .hr-hero .hr-lead {
      max-width: 490px;
      margin: var(--s3) 0 0;
      color: var(--body);
      font-family: var(--font-text);
      font-size: 17px;
      line-height: 1.55;
    }

    .hr-hero .hr-price {
      display: block;
      margin-top: var(--s3);
      color: var(--ink);
      font-family: var(--font-display);
      font-size: var(--price-fs);
      font-stretch: 125%;
      font-weight: 800;
      line-height: 1;
      letter-spacing: -0.025em;
    }

    .hr-hero .hr-cta {
      display: flex;
      width: 100%;
      margin-top: var(--s3);
      justify-content: center;
      text-align: center;
    }

    .hr-hero .hr-micro {
      margin: var(--s2) 0 0;
      color: var(--body);
      font-family: var(--font-text);
      font-size: 13.5px;
      line-height: 1.45;
    }

    .hr-hero .hr-trust {
      display: flex;
      flex-wrap: nowrap;
      gap: var(--s2);
      margin: var(--s4) calc(var(--s5) * -1) calc(var(--s5) * -1);
      padding: var(--s3) var(--s4);
      border-top: 1px solid var(--line);
      background: var(--card);
      border-radius: 0 0 var(--radius-lg) var(--radius-lg);
    }

    .hr-hero .hr-pill {
      min-width: 0;
      flex: 1 1 0;
      gap: var(--s2);
      padding: var(--s2);
      color: var(--ink);
      background: var(--card);
      border: 1px solid var(--line);
      box-shadow: var(--shadow-sm);
      font-size: 13.5px;
      line-height: 1.25;
    }

    .hr-hero .hr-pill svg {
      width: 30px;
      height: 30px;
      flex: 0 0 30px;
      fill: none;
      stroke: var(--ink);
      stroke-width: 1.75px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    @media (max-width: 900px) {
      .hr-hero {
        padding-top: var(--s2);
      }

      .hr-hero .hr-scene {
        width: 100%;
      }

      .hr-hero .hr-card {
        width: calc(100% - var(--s4));
        margin-top: -48px;
        margin-inline: auto;
      }

      .hr-hero .hr-trust {
        flex-wrap: wrap;
      }

      .hr-hero .hr-pill {
        flex-basis: calc(50% - var(--s2));
      }
    }

    @media (max-width: 600px) {
      .hr-hero {
        padding-bottom: var(--s5);
      }

      .hr-hero .hr-scene {
        min-height: 280px;
        max-height: 320px;
      }

      .hr-hero .hr-scene img {
        min-height: 280px;
        object-position: center;
      }

      .hr-hero .hr-card {
        width: calc(100% - var(--s2));
        margin-top: -40px;
        padding: var(--s4);
      }

      .hr-hero .hr-title {
        margin-top: var(--s2);
        font-size: var(--h1-m);
        letter-spacing: -0.03em;
      }

      .hr-hero .hr-lead,
      .hr-hero .hr-price,
      .hr-hero .hr-cta {
        margin-top: var(--s2);
      }

      .hr-hero .hr-trust {
        gap: var(--s2);
        margin: var(--s3) calc(var(--s4) * -1) calc(var(--s4) * -1);
        padding: var(--s3);
      }

      .hr-hero .hr-pill {
        flex: 1 1 100%;
        font-size: 13.5px;
      }
    }
  </style>
</section>
```