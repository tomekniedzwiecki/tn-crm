**Siatka sekcji**
- Nagłówek `.h2`
- Desktop: karta produktu 58% + karta checkout 42%
- Pod kartami: `<!--PAYBADGES-->`
- Pas korzyści: 4 równe elementy
- Mobile: kompaktowa karta produktu → checkout → pas 2×2

```html
<section id="zamow" class="zm-section sect-pad">
  <div class="wrap">
    <h2 class="h2 zm-title">Zamów Odsączek</h2>

    <div class="zm-grid">
      <article class="zm-product-card reveal">
        <div class="zm-product-media">
          <img
            class="zm-packshot"
            src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/packshot-rozlozony.webp"
            width="1000"
            height="1000"
            loading="lazy"
            alt="Rozłożony składany koszyk Odsączek ze stali nierdzewnej"
          >

          <figure class="zm-flat-pack">
            <img
              src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/packshot-plaski.webp"
              width="320"
              height="320"
              loading="lazy"
              alt="Odsączek złożony na płasko"
            >
            <figcaption>składa się na płasko</figcaption>
          </figure>
        </div>

        <div class="zm-product-info">
          <div class="zm-product-copy">
            <h3 class="display zm-product-name">Odsączek</h3>
            <p class="zm-product-desc">Składany koszyk ze stali nierdzewnej</p>
          </div>

          <span class="zm-price" data-price>29,90 zł</span>
        </div>
      </article>

      <div class="zm-checkout-card reveal"><!--CHECKOUT-INLINE--></div>
    </div>

    <!--PAYBADGES-->

    <div class="zm-benefits reveal" aria-label="Najważniejsze informacje o zamówieniu">
      <div class="zm-benefit">
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path d="M8 15 24 6l16 9v19l-16 9-16-9V15Z"/>
          <path d="m8 15 16 9 16-9M24 24v19"/>
        </svg>
        <span>Płatność przy odbiorze</span>
      </div>

      <div class="zm-benefit">
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path d="M11 18a15 15 0 1 1-1 13"/>
          <path d="M11 10v8h8"/>
        </svg>
        <span>14 dni na zwrot</span>
      </div>

      <div class="zm-benefit">
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path d="M24 5c5 8 13 16 13 25a13 13 0 0 1-26 0c0-9 8-17 13-25Z"/>
          <path d="M17 30c0 4 3 7 7 7"/>
        </svg>
        <span>Stal nierdzewna</span>
      </div>

      <div class="zm-benefit">
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path d="M12 18h24v20H12z"/>
          <path d="M9 18h30M16 18v-3c0-2 2-4 4-4h8c2 0 4 2 4 4v3"/>
          <path d="M12 23c-4 0-7-1-7-3s3-3 7-3M36 23c4 0 7-1 7-3s-3-3-7-3"/>
        </svg>
        <span>Do garnka i woka</span>
      </div>
    </div>
  </div>

  <style scoped>
    .zm-section {
      background: var(--paper);
      color: var(--ink);
    }

    .zm-title {
      margin: 0 0 var(--s4);
      font-size: var(--h2-d);
    }

    .zm-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(340px, .85fr);
      gap: var(--s3);
      align-items: stretch;
    }

    .zm-product-card,
    .zm-checkout-card {
      box-sizing: border-box;
      min-width: 0;
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
    }

    .zm-product-card {
      display: grid;
      grid-template-rows: minmax(0, 1fr) auto;
      overflow: hidden;
      padding: var(--s3);
    }

    .zm-product-media {
      position: relative;
      display: grid;
      min-height: 390px;
      place-items: center;
    }

    .zm-packshot {
      display: block;
      width: min(100%, 570px);
      height: auto;
      border-radius: var(--radius-lg);
      object-fit: contain;
    }

    .zm-flat-pack {
      position: absolute;
      bottom: var(--s2);
      left: 0;
      width: 116px;
      margin: 0;
    }

    .zm-flat-pack img {
      display: block;
      box-sizing: border-box;
      width: 96px;
      height: auto;
      padding: var(--s1);
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      object-fit: contain;
    }

    .zm-flat-pack figcaption {
      margin-top: var(--s1);
      color: var(--body);
      font-size: 13px;
      line-height: 1.25;
    }

    .zm-product-info {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: var(--s3);
      padding-top: var(--s2);
    }

    .zm-product-copy {
      min-width: 0;
    }

    .zm-product-name {
      margin: 0;
      font-weight: 700;
      line-height: 1.05;
    }

    .zm-product-desc {
      max-width: 28ch;
      margin: var(--s1) 0 0;
      color: var(--body);
      font-size: var(--body-fs);
      line-height: 1.45;
    }

    .zm-price {
      flex: 0 0 auto;
      font-size: var(--price-fs);
      font-weight: 700;
      line-height: 1;
      white-space: nowrap;
    }

    .zm-checkout-card {
      min-height: 560px;
      padding: var(--s4);
      box-shadow: var(--shadow-lg);
    }

    /* Skin przyszłego modułu checkout */
    .zm-checkout-card form {
      display: grid;
      gap: var(--s2);
    }

    .zm-checkout-card input:not([type="radio"]):not([type="checkbox"]),
    .zm-checkout-card textarea,
    .zm-checkout-card select {
      box-sizing: border-box;
      width: 100%;
      min-height: 54px;
      padding: var(--s2);
      background: var(--card);
      color: var(--ink);
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      font: inherit;
    }

    .zm-checkout-card textarea {
      min-height: 110px;
      resize: vertical;
    }

    .zm-checkout-card input:focus,
    .zm-checkout-card textarea:focus,
    .zm-checkout-card select:focus {
      border-color: var(--cta);
      outline: none;
    }

    .zm-checkout-card input[type="radio"] {
      width: 22px;
      height: 22px;
      margin: 0;
      accent-color: var(--cta);
    }

    .zm-checkout-card .payment-option,
    .zm-checkout-card .payment-card,
    .zm-checkout-card [data-payment-option] {
      display: flex;
      align-items: center;
      gap: var(--s2);
      box-sizing: border-box;
      min-height: 66px;
      padding: var(--s2);
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      cursor: pointer;
    }

    .zm-checkout-card .payment-option:has(input[type="radio"]:checked),
    .zm-checkout-card .payment-card:has(input[type="radio"]:checked),
    .zm-checkout-card [data-payment-option]:has(input[type="radio"]:checked),
    .zm-checkout-card [aria-checked="true"] {
      border-color: var(--cta);
    }

    .zm-checkout-card button[type="submit"],
    .zm-checkout-card input[type="submit"],
    .zm-checkout-card .btn.cta {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      width: 100%;
      min-height: 58px;
      padding: var(--s2) var(--s3);
      background: var(--cta);
      color: var(--cta-ink);
      border: 1px solid var(--cta);
      border-radius: var(--radius-lg);
      font: inherit;
      font-weight: 700;
      text-align: center;
      cursor: pointer;
    }

    .zm-checkout-card button[type="submit"]:hover,
    .zm-checkout-card input[type="submit"]:hover,
    .zm-checkout-card .btn.cta:hover {
      background: var(--cta-hover);
      border-color: var(--cta-hover);
    }

    .zm-checkout-card .return-note,
    .zm-checkout-card .checkout-return,
    .zm-checkout-card [data-return-note] {
      color: var(--body);
      font-size: 13px;
      line-height: 1.4;
      text-align: center;
    }

    .zm-benefits {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      margin-top: var(--s3);
      background: var(--paper-2);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
    }

    .zm-benefit {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--s2);
      min-width: 0;
      padding: var(--s3);
      color: var(--ink);
      font-size: var(--body-fs);
      line-height: 1.35;
    }

    .zm-benefit + .zm-benefit {
      border-left: 1px solid var(--line);
    }

    .zm-benefit svg {
      flex: 0 0 44px;
      width: 44px;
      height: 44px;
      fill: none;
      stroke: var(--ink);
      stroke-width: 1.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    @media (max-width: 760px) {
      .zm-title {
        margin-bottom: var(--s3);
        font-size: var(--h2-m);
      }

      .zm-grid {
        grid-template-columns: 1fr;
      }

      .zm-product-card {
        grid-template-columns: 104px minmax(0, 1fr);
        grid-template-rows: auto;
        align-items: center;
        gap: var(--s2);
        padding: var(--s2);
      }

      .zm-product-media {
        min-height: 0;
      }

      .zm-packshot {
        width: 104px;
        border-radius: var(--radius-sm);
      }

      .zm-flat-pack {
        display: none;
      }

      .zm-product-info {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
        gap: var(--s2);
        padding: 0;
      }

      .zm-product-name {
        font-size: 24px;
      }

      .zm-product-desc {
        display: none;
      }

      .zm-price {
        font-size: var(--price-fs);
      }

      .zm-checkout-card {
        min-height: 0;
        padding: var(--s3);
      }

      .zm-benefits {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .zm-benefit {
        justify-content: flex-start;
        padding: var(--s2);
        font-size: 15px;
      }

      .zm-benefit + .zm-benefit {
        border-left: 0;
      }

      .zm-benefit:nth-child(even) {
        border-left: 1px solid var(--line);
      }

      .zm-benefit:nth-child(n + 3) {
        border-top: 1px solid var(--line);
      }

      .zm-benefit svg {
        flex-basis: 36px;
        width: 36px;
        height: 36px;
      }
    }

    @media (max-width: 420px) {
      .zm-product-card {
        grid-template-columns: 84px minmax(0, 1fr);
      }

      .zm-packshot {
        width: 84px;
      }

      .zm-product-info {
        grid-template-columns: 1fr;
        gap: var(--s1);
      }

      .zm-benefits {
        grid-template-columns: 1fr;
      }

      .zm-benefit:nth-child(even) {
        border-left: 0;
      }

      .zm-benefit:nth-child(n + 2) {
        border-top: 1px solid var(--line);
      }
    }
  </style>
</section>
```