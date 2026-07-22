**Siatka:** wyśrodkowany nagłówek → karta max. 720 px → rząd produktu 96 px / nazwa / cena → marker checkoutu → marker płatności pod kartą.

```html
<section id="zamow" class="zm-section sect-pad">
  <div class="wrap">
    <h2 class="zm-title h2 reveal">Zamów Ugniatka</h2>

    <article class="zm-card reveal">
      <div class="zm-product">
        <img
          class="zm-product__image"
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/packshot-34.webp"
          width="96"
          height="96"
          loading="lazy"
          alt="Ugniatek – urządzenie do masażu stóp"
        >
        <span class="zm-product__name display">Ugniatek</span>
        <span class="zm-product__price display" data-price>189,00 zł</span>
      </div>

      <!--CHECKOUT-INLINE-->
    </article>

    <!--PAYBADGES-->
  </div>

  <style scoped>
    .zm-section {
      background: var(--paper);
      color: var(--ink);
    }

    .zm-title {
      margin: 0 0 var(--s4);
      text-align: center;
    }

    .zm-card {
      width: min(100%, 720px);
      margin-inline: auto;
      padding: var(--s4);
      background: var(--paper-2);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
    }

    .zm-product {
      display: grid;
      grid-template-columns: 96px minmax(0, 1fr) auto;
      align-items: center;
      gap: var(--s3);
      margin-bottom: var(--s4);
    }

    .zm-product__image {
      display: block;
      width: 96px;
      height: 96px;
      object-fit: contain;
      background: var(--card);
      border-radius: var(--radius-sm);
    }

    .zm-product__name,
    .zm-product__price {
      color: var(--ink);
      font-weight: 700;
      line-height: 1.05;
    }

    .zm-product__price {
      white-space: nowrap;
      text-align: right;
    }

    .zm-card :where(
      input:not([type="radio"]):not([type="checkbox"]):not([type="submit"]),
      select,
      textarea
    ) {
      width: 100%;
      color: var(--body);
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      outline: none;
    }

    .zm-card :where(
      input:not([type="radio"]):not([type="checkbox"]):not([type="submit"]),
      select,
      textarea
    ):focus {
      border-color: var(--cta);
    }

    .zm-card :where(
      .checkout-inline__payment,
      .checkout-inline__payment-option,
      .payment-option,
      .payment-card,
      label:has(input[type="radio"])
    ) {
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      background: var(--card);
    }

    .zm-card :where(
      .checkout-inline__payment.is-selected,
      .checkout-inline__payment-option.is-selected,
      .payment-option.is-selected,
      .payment-card.is-selected,
      label:has(input[type="radio"]:checked)
    ) {
      border-color: var(--cta);
    }

    .zm-card input[type="radio"] {
      appearance: none;
      width: 20px;
      height: 20px;
      flex: 0 0 20px;
      margin: 0;
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 50%;
    }

    .zm-card input[type="radio"]:checked {
      background: var(--cta);
      border-color: var(--cta);
      box-shadow: inset 0 0 0 4px var(--card);
    }

    .zm-card :where(
      button[type="submit"],
      input[type="submit"],
      .checkout-inline__submit
    ) {
      display: inline-flex;
      width: 100%;
      align-items: center;
      justify-content: center;
      color: var(--cta-ink);
      background: var(--cta);
      border: 1px solid var(--cta);
      border-radius: var(--radius-sm);
      cursor: pointer;
    }

    .zm-card :where(
      button[type="submit"],
      input[type="submit"],
      .checkout-inline__submit
    ):hover {
      background: var(--cta-hover);
      border-color: var(--cta-hover);
    }

    .zm-card :where(
      .checkout-inline__return,
      .return-note,
      [data-return-note]
    ) {
      color: var(--body);
      font-size: 13px;
      text-align: center;
    }

    @media (max-width: 560px) {
      .zm-card {
        padding: var(--s3);
      }

      .zm-product {
        grid-template-columns: 96px minmax(0, 1fr);
      }

      .zm-product__price {
        grid-column: 2;
        text-align: left;
      }
    }
  </style>
</section>
```