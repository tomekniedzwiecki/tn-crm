**Siatka:** desktop — lewa kolumna 42% (treść, oferta, pas zaufania), prawa 58% (dyptyk 1:1). Mobile — dyptyk → treść → oferta; pas zaufania ukryty.

```html
<section id="hero" class="hr-hero hero sect-pad">
  <div class="wrap hr-grid">
    <div class="hr-copy reveal">
      <div class="hr-intro">
        <p class="eyebrow">PLAN AWARYJNY NA ZAMROŻONY OBIAD</p>
        <span class="thaw"></span>

        <h1 class="display hr-title">
          Mięso z zamrażarki<br>
          nie musi rozwalać<br>
          <span class="swash">planu</span> na obiad.
        </h1>

        <p class="lead hr-lead hr-lead-desktop">
          Połóż porcje na aluminiowej płycie, przykryj je przezroczystą kopułą i uruchom elektryczny box jednym dotknięciem.
        </p>
        <p class="lead hr-lead hr-lead-mobile">
          Połóż, przykryj kopułą, dotknij — gotowe.
        </p>
      </div>

      <div class="hr-offer">
        <span class="display hr-price" data-price>289,00 zł</span>
        <a class="btn cta hr-cta" data-checkout href="#zamow">Zamawiam Rozmrozik</a>
        <p class="hr-micro">Płatność przy odbiorze lub BLIK/online · 14 dni na zwrot</p>
        <!--PAYBADGES-->
      </div>

      <div class="hr-trust" aria-label="Najważniejsze cechy produktu">
        <div class="hr-trust-item">
          <svg class="hr-icon" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M7 7h15v20H7zM22 11h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3M11 11h7M11 15h5M11 19h7" />
          </svg>
          <strong class="display">4,2 L</strong>
        </div>

        <div class="hr-trust-item">
          <svg class="hr-icon" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M7.5 10.5c3.8-4.2 11.7-4.8 16.1-1.1 2.9 2.4 3.4 6.7 1.3 9.8-2.9 4.2-9.1 5.7-14.5 4-4.9-1.5-6.3-8.8-2.9-12.7Z" />
            <path d="M13 13.5c1.6-1.5 4.4-1.5 5.8.1 1.1 1.3.4 3.4-1.2 4.1-1.9.8-4.6.1-5.3-1.6-.4-.9-.1-1.9.7-2.6ZM8.5 19.5c4.6 2.1 10.8 1.9 15.6-.7" />
          </svg>
          <strong class="display">4 steki lub<br>4 porcje ryby</strong>
        </div>

        <div class="hr-trust-item">
          <svg class="hr-icon" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M15 13V8.5a2.5 2.5 0 0 1 5 0V16M20 13.5a2.5 2.5 0 0 1 5 0V19c0 5.5-3.3 9-8.5 9-3.1 0-5.2-1.8-6.8-4.6L7 18.8a2.4 2.4 0 0 1 4-2.6l2 2.4V13a2 2 0 0 1 4 0v3" />
            <path d="M11.5 9.5a6 6 0 0 1 12 0M8.5 9.5a9 9 0 0 1 18 0" />
          </svg>
          <strong class="display">Start jednym<br>dotknięciem</strong>
        </div>

        <div class="hr-trust-item">
          <svg class="hr-icon" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M11 12v8M21 12v8M8 20h16v2a5 5 0 0 1-5 5h-6a5 5 0 0 1-5-5v-2ZM16 27v3M13 8v4M19 8v4" />
          </svg>
          <strong class="display">Ładowanie<br>USB-C</strong>
        </div>
      </div>
    </div>

    <div class="hr-diptych reveal" aria-label="Porównanie produktu przed i po rozmrożeniu">
      <figure class="hr-frame">
        <picture>
          <source
            media="(max-width:899px)"
            srcset="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/sc-hero-frozen-800.webp"
          >
          <img
            src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/sc-hero-frozen.webp"
            width="1024"
            height="1536"
            loading="eager"
            fetchpriority="high"
            alt="Zamrożony stek pokryty szronem na desce"
          >
        </picture>
        <figcaption class="hr-chip">ZAMROŻONE</figcaption>
      </figure>

      <figure class="hr-frame">
        <picture>
          <source
            media="(max-width:899px)"
            srcset="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/sc-hero-thawed-800.webp"
          >
          <img
            src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/sc-hero-thawed.webp"
            width="1024"
            height="1536"
            loading="eager"
            alt="Rozmrozik z porcjami mięsa pod kopułą obok patelni"
          >
        </picture>
        <figcaption class="hr-chip">ROZMROŻONE</figcaption>
      </figure>
    </div>
  </div>

  <style>
    .hr-hero {
      overflow: hidden;
      color: var(--ink);
      background: var(--paper);
    }

    .hr-hero .hr-grid {
      display: grid;
      grid-template-columns: minmax(0, 42fr) minmax(0, 58fr);
      gap: var(--s5);
      align-items: start;
    }

    .hr-hero .hr-copy {
      min-width: 0;
    }

    .hr-hero .hr-intro .eyebrow {
      margin: 0;
    }

    .hr-hero .hr-intro .thaw {
      display: block;
      margin-top: var(--s2);
      width: 100%;
    }

    .hr-hero .hr-title {
      margin: var(--s4) 0 var(--s3);
      max-width: 12ch;
      color: var(--ink);
      font-size: var(--h1-d);
      line-height: 1.01;
      letter-spacing: -0.035em;
    }

    .hr-hero .hr-lead {
      margin: 0;
      max-width: 38rem;
      color: var(--body);
      font-size: 17px;
    }

    .hr-hero .hr-lead-mobile {
      display: none;
    }

    .hr-hero .hr-offer {
      display: grid;
      gap: var(--s3);
      margin-top: var(--s4);
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
      text-align: center;
    }

    .hr-hero .hr-micro {
      margin: 0;
      color: var(--body);
      font-size: 13.5px;
      line-height: 1.45;
    }

    .hr-hero .hr-trust {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: var(--s2);
      margin-top: var(--s3);
    }

    .hr-hero .hr-trust-item {
      display: grid;
      align-content: start;
      justify-items: center;
      gap: var(--s2);
      min-width: 0;
      padding: var(--s3) var(--s2);
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      background: var(--card);
      box-shadow: var(--shadow-sm);
      text-align: center;
    }

    .hr-hero .hr-trust-item strong {
      color: var(--ink);
      font-size: 13.5px;
      font-weight: 700;
      line-height: 1.3;
    }

    .hr-hero .hr-icon {
      width: 32px;
      height: 32px;
      color: var(--ink);
      fill: none;
      stroke: currentColor;
      stroke-width: 1.75px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .hr-hero .hr-diptych {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      padding: 12px;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      background: var(--card);
      box-shadow: var(--shadow-md);
    }

    .hr-hero .hr-frame {
      position: relative;
      min-width: 0;
      margin: 0;
      overflow: hidden;
      border-radius: var(--radius-sm);
      background: var(--paper-2);
    }

    .hr-hero .hr-frame picture {
      display: block;
      height: 100%;
    }

    .hr-hero .hr-frame img {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 4 / 5;
      object-fit: cover;
      border-radius: var(--radius-sm);
    }

    .hr-hero .hr-chip {
      position: absolute;
      left: 12px;
      bottom: 12px;
      margin: 0;
      padding: 7px 11px;
      border: 1px solid var(--line);
      border-radius: 999px;
      color: var(--ink);
      background: var(--card);
      box-shadow: var(--shadow-sm);
      font-size: 11px;
      font-weight: 700;
      line-height: 1;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    @media (max-width: 899px) {
      .hr-hero .hr-grid {
        display: flex;
        flex-direction: column;
        gap: var(--s4);
      }

      .hr-hero .hr-diptych {
        order: 1;
        width: 100%;
        gap: 8px;
        padding: 8px;
      }

      .hr-hero .hr-copy {
        order: 2;
        width: 100%;
      }

      .hr-hero .hr-frame img {
        aspect-ratio: 1;
      }

      .hr-hero .hr-chip {
        left: 8px;
        bottom: 8px;
        padding: 6px 8px;
      }

      .hr-hero .hr-title {
        margin: var(--s3) 0 var(--s3);
        max-width: none;
        font-size: var(--h1-m);
        line-height: 1.02;
      }

      .hr-hero .hr-lead-desktop {
        display: none;
      }

      .hr-hero .hr-lead-mobile {
        display: block;
      }

      .hr-hero .hr-offer {
        width: 100%;
        margin-top: var(--s4);
      }

      .hr-hero .hr-cta {
        display: block;
        width: 100%;
      }

      .hr-hero .hr-trust {
        display: none;
      }
    }
  </style>
</section>
```