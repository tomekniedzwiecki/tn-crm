Siatka: **1. kadr full-width z łukiem → 2. hook na `--paper` → 3. karta oferty: miniatura + zakup + 2 pille**. Mobile: kadr `42svh`, skrócony lead, karta lekko nachodzi na hook.

```html
<section id="hero" class="hr-hero">
  <div class="hr-media reveal">
    <img
      class="hr-hero-img"
      src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/sc-hero.webp"
      alt="Dłoń wyjmuje koszyk pełen frytek z woka"
      width="1536"
      height="1024"
      loading="eager"
      fetchpriority="high"
    >

    <svg class="arc hr-arc" viewBox="0 0 120 60" aria-hidden="true">
      <path d="M108 53C101 21 77 7 37 8"></path>
      <path d="M45 2L35 8L43 16"></path>
    </svg>
  </div>

  <div class="hr-hook">
    <div class="wrap hr-hook-inner reveal">
      <h1 class="display hr-title">Wyjmij całą porcję jednym ruchem</h1>

      <p class="lead hr-lead hr-lead-desktop">
        Składany koszyk ze stali nierdzewnej do smażenia w garnku lub woku — koniec łowienia frytek sztuka po sztuce.
      </p>

      <p class="lead hr-lead hr-lead-mobile">
        Składany koszyk ze stali — koniec łowienia frytek.
      </p>
    </div>
  </div>

  <div class="hr-offer-zone">
    <div class="wrap hr-offer-wrap">
      <div class="hr-offer-card reveal">
        <div class="hr-packshot">
          <img
            src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/packshot-rozlozony.webp"
            alt="Rozłożony składany koszyk ze stali nierdzewnej"
            width="1024"
            height="1024"
            loading="lazy"
          >
        </div>

        <div class="hr-buy">
          <span class="hr-price" data-price>29,90 zł</span>

          <a class="btn cta hr-cta" data-checkout href="#zamow">
            Zamawiam Odsączek
          </a>

          <p class="hr-micro">
            Płatność online lub przy odbiorze
            <span aria-hidden="true">·</span>
            14 dni na zwrot
          </p>
        </div>

        <div class="hr-benefits" aria-label="Najważniejsze cechy">
          <span class="pill hr-pill">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3.5 19 6v5.2c0 4.5-2.8 7.6-7 9.3-4.2-1.7-7-4.8-7-9.3V6l7-2.5Z"></path>
              <path d="M9 11.8 11 14l4-4.5"></path>
            </svg>
            Stal nierdzewna
          </span>

          <span class="pill hr-pill">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <ellipse cx="12" cy="7" rx="8" ry="2.5"></ellipse>
              <path d="M4 7v4c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5V7"></path>
              <path d="M4 11v4c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5v-4"></path>
            </svg>
            Składa się na płasko
          </span>
        </div>
      </div>
    </div>
  </div>

  <style scoped>
    .hr-hero {
      overflow: hidden;
      background: var(--paper);
      color: var(--ink);
    }

    .hr-media {
      position: relative;
      width: 100%;
      height: 56vh;
      min-height: 360px;
      overflow: hidden;
      background: var(--paper-2);
    }

    .hr-hero-img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 30%;
    }

    .hr-arc {
      position: absolute;
      top: 14%;
      right: 31%;
      width: 120px;
      height: auto;
      pointer-events: none;
      stroke: var(--cta);
      stroke-width: 2px;
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
    }

    .hr-hook {
      position: relative;
      z-index: 1;
      background: var(--paper);
    }

    .hr-hook-inner {
      padding-top: var(--s4);
      padding-bottom: var(--s4);
      text-align: center;
    }

    .hr-title {
      max-width: 980px;
      margin: 0 auto;
      color: var(--ink);
      font-size: var(--h1-d);
      line-height: 1.02;
      text-wrap: balance;
    }

    .hr-lead {
      max-width: 980px;
      margin: var(--s2) auto 0;
      color: var(--body);
      font-size: var(--body-fs);
      line-height: 1.5;
      text-wrap: balance;
    }

    .hr-lead-mobile {
      display: none;
    }

    .hr-offer-zone {
      position: relative;
      z-index: 2;
      padding: 0 0 var(--s5);
      background: var(--paper);
    }

    .hr-offer-card {
      display: grid;
      grid-template-columns: 120px minmax(300px, 1fr) minmax(220px, 290px);
      align-items: center;
      gap: var(--s4);
      padding: var(--s4);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      background: var(--card);
      box-shadow: var(--shadow-md);
    }

    .hr-packshot {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .hr-packshot img {
      display: block;
      width: 120px;
      max-width: 100%;
      height: auto;
      border-radius: var(--radius-sm);
    }

    .hr-buy {
      min-width: 0;
      padding-inline: var(--s4);
      border-inline: 1px solid var(--line);
    }

    .hr-price {
      display: block;
      margin-bottom: var(--s2);
      color: var(--ink);
      font-family: var(--font-display);
      font-size: var(--price-fs);
      font-weight: 700;
      line-height: 1;
    }

    .hr-cta {
      width: 100%;
      text-align: center;
    }

    .hr-micro {
      margin: var(--s2) 0 0;
      color: var(--body);
      font-size: 13.5px;
      line-height: 1.4;
    }

    .hr-micro span {
      margin-inline: 0.35em;
    }

    .hr-benefits {
      display: grid;
      gap: var(--s2);
    }

    .hr-pill {
      display: flex;
      min-height: 48px;
      align-items: center;
      gap: var(--s2);
      justify-content: flex-start;
      color: var(--ink);
      white-space: nowrap;
    }

    .hr-pill svg {
      flex: 0 0 24px;
      width: 24px;
      height: 24px;
      fill: none;
      stroke: var(--ink);
      stroke-width: 1.5px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    @media (max-width: 760px) {
      .hr-media {
        height: 42svh;
        min-height: 250px;
        max-height: 390px;
      }

      .hr-hero-img {
        object-position: center 30%;
      }

      .hr-arc {
        top: 11%;
        right: 8%;
        width: 88px;
      }

      .hr-hook-inner {
        padding-top: var(--s3);
        padding-bottom: calc(var(--s5) + var(--s2));
        text-align: left;
      }

      .hr-title {
        margin: 0;
        font-size: var(--h1-m);
        line-height: 1.02;
      }

      .hr-lead {
        margin-top: var(--s2);
        font-size: var(--body-fs);
        line-height: 1.35;
      }

      .hr-lead-desktop {
        display: none;
      }

      .hr-lead-mobile {
        display: block;
      }

      .hr-offer-zone {
        padding-bottom: var(--s4);
      }

      .hr-offer-wrap {
        padding-inline: var(--s2);
      }

      .hr-offer-card {
        grid-template-columns: 120px minmax(0, 1fr);
        gap: var(--s2);
        margin-top: calc(var(--s4) * -1);
        padding: var(--s2);
      }

      .hr-buy {
        padding: 0;
        border: 0;
      }

      .hr-price {
        margin-bottom: var(--s2);
      }

      .hr-cta {
        display: flex;
        min-height: 48px;
        align-items: center;
        justify-content: center;
        padding-inline: var(--s2);
      }

      .hr-micro {
        margin-top: var(--s2);
      }

      .hr-benefits {
        grid-column: 1 / -1;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--s1);
        padding-top: var(--s2);
        border-top: 1px solid var(--line);
      }

      .hr-pill {
        min-height: 42px;
        padding-inline: var(--s2);
        white-space: normal;
      }

      .hr-pill svg {
        flex-basis: 21px;
        width: 21px;
        height: 21px;
      }
    }

    @media (max-width: 390px) {
      .hr-offer-wrap {
        padding-inline: var(--s1);
      }

      .hr-offer-card {
        grid-template-columns: 104px minmax(0, 1fr);
      }

      .hr-packshot img {
        width: 104px;
      }

      .hr-micro span {
        display: none;
      }

      .hr-micro span + * {
        display: block;
      }

      .hr-pill {
        font-size: 13.5px;
      }
    }
  </style>
</section>
```