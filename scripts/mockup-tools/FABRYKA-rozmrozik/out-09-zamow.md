Siatka: nagłówek → układ 5/7 (sticky karta produktu + karta montażowa checkoutu) → PAYBADGES → pas 3 korzyści. Mobile: kompaktowy produkt w jednym rzędzie → checkout → PAYBADGES → pas.

```html
<section id="zamow" class="sect-pad" aria-labelledby="zm-title">
  <div class="wrap">
    <header class="zm-head">
      <div class="eyebrow">ZAMÓWIENIE</div>
      <span class="thaw"></span>
      <h2 id="zm-title" class="h2"><span class="swash">Rozmrozik</span></h2>
    </header>

    <div class="zm-grid">
      <article class="zm-product-card reveal">
        <div class="zm-packshot">
          <img
            src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/packshot-alpha.png"
            width="800"
            height="800"
            loading="lazy"
            alt="Rozmrozik — wariant czarny"
          >
        </div>

        <div class="zm-product-copy">
          <h3 class="display zm-product-name">Rozmrozik</h3>

          <p class="zm-description">
            Elektryczny box do rozmrażania żywności z komorą 4,2 L, kopułą PS,
            aluminiową płytą i tacką ociekową ABS.
          </p>

          <p class="zm-color">
            <span>Kolor:</span>
            <strong>czarny</strong>
          </p>
        </div>

        <div class="zm-price-block">
          <span class="display zm-price" data-price>289,00 zł</span>
          <p class="zm-price-note">
            Koszt dostawy i pełną kwotę zobaczysz w podsumowaniu przed złożeniem zamówienia.
          </p>
        </div>
      </article>

      <div class="zm-checkout-card reveal"><!--CHECKOUT-INLINE--></div>
    </div>

    <!--PAYBADGES-->

    <div class="band zm-band reveal" aria-label="Informacje o płatności i zwrocie">
      <div class="zm-band-item">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z"></path>
          <path d="m4 7.5 8 4.5 8-4.5M12 12v9M8 5.25l8 4.5"></path>
        </svg>
        <span>COD — płatność przy odbiorze</span>
      </div>

      <div class="zm-band-item">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="6.5" y="2.5" width="11" height="19" rx="2"></rect>
          <path d="M10 5h4M11 18.5h2"></path>
        </svg>
        <span>BLIK/online</span>
      </div>

      <div class="zm-band-item">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 7v5h-5"></path>
          <path d="M19.2 12A7.5 7.5 0 1 1 17 6.7L20 9"></path>
        </svg>
        <span>14 dni na zwrot</span>
      </div>
    </div>
  </div>

  <style scoped>
    #zamow {
      background: var(--paper);
      color: var(--ink);
      font-size: 17px;
    }

    #zamow .zm-head {
      margin-bottom: var(--s5);
    }

    #zamow .zm-head .thaw {
      display: block;
      max-width: 620px;
      margin-top: var(--s2);
      margin-bottom: var(--s3);
    }

    #zamow .zm-head .h2 {
      margin: 0;
      font-size: var(--h2-d);
      line-height: 1.05;
    }

    #zamow .zm-grid {
      display: grid;
      grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
      align-items: start;
      gap: var(--s4);
    }

    #zamow .zm-product-card,
    #zamow .zm-checkout-card {
      box-sizing: border-box;
      min-width: 0;
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
    }

    #zamow .zm-product-card {
      position: sticky;
      top: 84px;
      display: grid;
      gap: var(--s3);
      padding: var(--s4);
      box-shadow: var(--shadow-sm);
    }

    #zamow .zm-checkout-card {
      overflow: hidden;
      min-height: 180px;
      box-shadow: var(--shadow-lg);
    }

    #zamow .zm-packshot {
      display: grid;
      place-items: center;
      min-height: 280px;
      padding: var(--s3);
      background: var(--paper-2);
      border-radius: var(--radius-sm);
    }

    #zamow .zm-packshot img {
      display: block;
      width: 100%;
      max-width: 320px;
      height: auto;
      border-radius: var(--radius-lg);
      object-fit: contain;
    }

    #zamow .zm-product-name {
      margin: 0 0 var(--s2);
      font-size: 24px;
      font-weight: 700;
      line-height: 1.15;
    }

    #zamow .zm-description {
      margin: 0;
      color: var(--body);
      font-size: 15px;
      line-height: 1.55;
    }

    #zamow .zm-color {
      display: flex;
      align-items: baseline;
      gap: var(--s1);
      margin: var(--s3) 0 0;
    }

    #zamow .zm-color span {
      color: var(--body);
      font-size: 13px;
    }

    #zamow .zm-color strong {
      color: var(--ink);
      font-size: 15px;
      font-weight: 600;
    }

    #zamow .zm-price-block {
      padding-top: var(--s3);
      border-top: 1px solid var(--line);
    }

    #zamow .zm-price {
      display: block;
      color: var(--ink);
      font-size: var(--price-fs);
      font-weight: 700;
      line-height: 1;
    }

    #zamow .zm-price-note {
      max-width: 42ch;
      margin: var(--s2) 0 0;
      color: var(--body);
      font-size: 13px;
      line-height: 1.45;
    }

    #zamow .zm-band {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--s2);
      margin-top: var(--s4);
      padding: var(--s3);
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    #zamow .zm-band-item {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--s2);
      min-width: 0;
      color: var(--ink);
      font-size: 15px;
      line-height: 1.35;
    }

    #zamow .zm-band-item svg {
      flex: 0 0 24px;
      width: 24px;
      height: 24px;
      fill: none;
      stroke: var(--ink);
      stroke-width: 1.75;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    /* Skin modułu checkoutu montowanego w miejscu markera. */
    #zamow .zc-checkout {
      box-sizing: border-box;
      color: var(--ink);
      font-size: 17px;
    }

    #zamow .zc-checkout *,
    #zamow .zc-checkout *::before,
    #zamow .zc-checkout *::after {
      box-sizing: border-box;
    }

    #zamow .zc-checkout input:not([type="radio"]):not([type="checkbox"]),
    #zamow .zc-checkout select,
    #zamow .zc-checkout textarea {
      width: 100%;
      color: var(--ink);
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      font: inherit;
      outline: none;
    }

    #zamow .zc-checkout input:not([type="radio"]):not([type="checkbox"]):focus,
    #zamow .zc-checkout select:focus,
    #zamow .zc-checkout textarea:focus,
    #zamow .zc-checkout input:not([type="radio"]):not([type="checkbox"]):focus-visible,
    #zamow .zc-checkout select:focus-visible,
    #zamow .zc-checkout textarea:focus-visible {
      border-color: var(--cta);
    }

    #zamow .zc-checkout input[type="radio"] {
      accent-color: var(--cta);
    }

    #zamow .zc-checkout .zc-payment-option,
    #zamow .zc-checkout .zc-radio-card,
    #zamow .zc-checkout label:has(input[type="radio"]) {
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      background: var(--card);
    }

    #zamow .zc-checkout .zc-payment-option.is-selected,
    #zamow .zc-checkout .zc-radio-card.is-selected,
    #zamow .zc-checkout .zc-payment-option:has(input[type="radio"]:checked),
    #zamow .zc-checkout .zc-radio-card:has(input[type="radio"]:checked),
    #zamow .zc-checkout label:has(input[type="radio"]:checked) {
      border-color: var(--cta);
    }

    #zamow .zc-checkout button[type="submit"],
    #zamow .zc-checkout input[type="submit"] {
      display: inline-flex;
      width: 100%;
      align-items: center;
      justify-content: center;
      color: var(--cta-ink);
      background: var(--cta);
      border: 1px solid var(--cta);
      border-radius: var(--radius-lg);
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }

    #zamow .zc-checkout button[type="submit"]:hover,
    #zamow .zc-checkout input[type="submit"]:hover {
      background: var(--cta-hover);
      border-color: var(--cta-hover);
    }

    #zamow .zc-checkout small,
    #zamow .zc-checkout .zc-small,
    #zamow .zc-checkout .zc-help,
    #zamow .zc-checkout .zc-note {
      color: var(--body);
      font-size: 13px;
      line-height: 1.45;
    }

    #zamow .zc-checkout a {
      color: var(--ink);
      text-decoration: underline;
      text-underline-offset: 0.15em;
    }

    @media (max-width: 820px) {
      #zamow .zm-head {
        margin-bottom: var(--s4);
      }

      #zamow .zm-head .h2 {
        font-size: var(--h2-m);
      }

      #zamow .zm-grid {
        grid-template-columns: 1fr;
        gap: var(--s3);
      }

      #zamow .zm-product-card {
        position: static;
        grid-template-columns: 96px minmax(0, 1fr) auto;
        align-items: center;
        gap: var(--s2);
        padding: var(--s2);
      }

      #zamow .zm-packshot {
        width: 96px;
        min-height: 96px;
        padding: var(--s1);
      }

      #zamow .zm-packshot img {
        width: 96px;
        max-width: 100%;
      }

      #zamow .zm-product-copy {
        min-width: 0;
      }

      #zamow .zm-product-name {
        margin-bottom: var(--s1);
        font-size: 24px;
      }

      #zamow .zm-description,
      #zamow .zm-price-note {
        display: none;
      }

      #zamow .zm-color {
        margin-top: 0;
        gap: 4px;
        white-space: nowrap;
      }

      #zamow .zm-price-block {
        padding-top: 0;
        border-top: 0;
        text-align: right;
        white-space: nowrap;
      }

      #zamow .zm-band {
        grid-template-columns: 1fr;
      }

      #zamow .zm-band-item {
        justify-content: flex-start;
      }
    }

    @media (max-width: 520px) {
      #zamow .zm-product-card {
        grid-template-columns: 96px minmax(0, 1fr);
      }

      #zamow .zm-price-block {
        grid-column: 2;
        text-align: left;
      }
    }
  </style>
</section>
```