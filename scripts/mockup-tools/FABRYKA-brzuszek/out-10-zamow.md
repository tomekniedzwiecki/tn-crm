Siatka: nagłówek sekcji → desktop 5/7: sticky karta produktu + karta modułu checkout; mobile: kompaktowy produkt → checkout.

```html
<section id="zamow" class="zm-zamow sect-pad">
  <div class="wrap">
    <header class="zm-head reveal">
      <div class="zm-kicker">
        <span class="eyebrow">ZAMÓWIENIE</span>
        <span class="reps" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
      </div>

      <h2 class="h2 display">
        Twój Brzuszek. Jeden <span class="swash">wariant</span>, bez zgadywania.
      </h2>
    </header>

    <div class="zm-grid">
      <article class="zm-product reveal">
        <div class="zm-product-inner">
          <div class="zm-packshot">
            <img
              src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/brzuszek/assets/packshot-alpha.png"
              width="1591"
              height="1528"
              loading="lazy"
              alt="Biało-różowa maszyna Brzuszek"
            >
          </div>

          <div class="zm-product-copy">
            <h3 class="zm-product-name display">
              Brzuszek — składana maszyna do ćwiczeń brzucha i core
            </h3>

            <p class="zm-color">
              <span>Kolor:</span>
              <strong>biało-różowy</strong>
            </p>

            <span class="zm-price display" data-price>429,00 zł</span>
          </div>
        </div>

        <div class="zm-trust" aria-label="Informacje o zakupie">
          <span class="pill">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4.5 8.5V4.75m0 0h3.75m-3.75 0 3.1 3.1a7.5 7.5 0 1 1-1.55 8.25"/>
              <path d="M8.75 12.25 11 14.5l4.5-5"/>
            </svg>
            <span>14 dni na zwrot</span>
          </span>

          <span class="pill">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3.5 13.5h3l2.25 2.25a2 2 0 0 0 2.8 0l2.2-2.15a2 2 0 0 1 1.4-.6h5.35"/>
              <path d="M7 13.5V8.25l5-2.75 5 2.75V13"/>
              <path d="M9 9.5h6M12 5.5v8"/>
              <path d="M3.5 11v6.5H7V13"/>
            </svg>
            <span>Płatność przy odbiorze</span>
          </span>

          <span class="pill">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="5" y="2.75" width="14" height="18.5" rx="2.25"/>
              <path d="M8 6.25h8M10 17.75h4"/>
            </svg>
            <span>BLIK/online</span>
          </span>
        </div>
      </article>

      <div class="zm-checkout-card reveal"><!--CHECKOUT-INLINE--></div>
    </div>
  </div>

  <style scoped>
    #zamow {
      background: var(--paper);
      color: var(--ink);
      font-family: var(--font-text);
    }

    #zamow .zm-head {
      max-width: 960px;
      margin-bottom: var(--s5);
    }

    #zamow .zm-kicker {
      display: flex;
      align-items: center;
      gap: var(--s3);
      margin-bottom: var(--s3);
    }

    #zamow .zm-head .h2 {
      max-width: 920px;
      margin: 0;
      color: var(--ink);
      font-size: var(--h2-d);
      line-height: 1.04;
    }

    #zamow .zm-grid {
      display: grid;
      grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
      align-items: start;
      gap: var(--s4);
    }

    #zamow .zm-product,
    #zamow .zm-checkout-card {
      min-width: 0;
      background: var(--card);
      border-radius: var(--radius-lg);
    }

    #zamow .zm-product {
      position: sticky;
      top: 84px;
      padding: var(--s4);
      box-shadow: var(--shadow-sm);
    }

    #zamow .zm-product-inner {
      display: grid;
      gap: var(--s3);
    }

    #zamow .zm-packshot {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      max-width: 320px;
      margin-inline: auto;
      padding: var(--s2);
      overflow: hidden;
      background: var(--card);
      border-radius: var(--radius-sm);
    }

    #zamow .zm-packshot img {
      display: block;
      width: 100%;
      height: auto;
      max-height: 320px;
      object-fit: contain;
      border-radius: var(--radius-lg);
    }

    #zamow .zm-product-copy {
      min-width: 0;
    }

    #zamow .zm-product-name {
      margin: 0 0 var(--s2);
      color: var(--ink);
      font-size: 22px;
      font-weight: 700;
      font-stretch: 125%;
      line-height: 1.2;
    }

    #zamow .zm-color {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 5px;
      margin: 0 0 var(--s3);
      color: var(--body);
      font-size: 13px;
      line-height: 1.45;
    }

    #zamow .zm-color strong {
      color: var(--ink);
      font-size: 15px;
      font-weight: 600;
    }

    #zamow .zm-price {
      display: block;
      color: var(--ink);
      font-size: var(--price-fs);
      font-weight: 800;
      font-stretch: 125%;
      line-height: 1;
    }

    #zamow .zm-trust {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--s2);
      margin-top: var(--s4);
    }

    #zamow .zm-trust .pill {
      display: flex;
      min-width: 0;
      align-items: center;
      justify-content: flex-start;
      gap: 8px;
      padding: 10px;
      color: var(--ink);
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      font-size: 13px;
      line-height: 1.25;
    }

    #zamow .zm-trust svg {
      flex: 0 0 24px;
      width: 24px;
      height: 24px;
      fill: none;
      stroke: var(--ink);
      stroke-width: 1.75;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    #zamow .zm-checkout-card {
      min-height: 180px;
      overflow: hidden;
      box-shadow: var(--shadow-lg);
    }

    /* Skin modułu checkout-inline@2 */
    #zamow .zc-checkout {
      width: 100%;
      color: var(--ink);
      background: var(--card);
      border-radius: var(--radius-lg);
      font-family: var(--font-text);
      font-size: 17px;
    }

    #zamow .zc-checkout .zc-head {
      display: none;
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
      box-shadow: none;
    }

    #zamow .zc-checkout input:not([type="radio"]):not([type="checkbox"]):focus,
    #zamow .zc-checkout select:focus,
    #zamow .zc-checkout textarea:focus {
      border-color: var(--cta);
    }

    #zamow .zc-checkout .zc-option,
    #zamow .zc-checkout .zc-radio-card,
    #zamow .zc-checkout label:has(input[type="radio"]) {
      color: var(--ink);
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
    }

    #zamow .zc-checkout .zc-option.is-selected,
    #zamow .zc-checkout .zc-radio-card.is-selected,
    #zamow .zc-checkout .zc-option[aria-checked="true"],
    #zamow .zc-checkout .zc-radio-card[aria-checked="true"],
    #zamow .zc-checkout label:has(input[type="radio"]:checked) {
      border-color: var(--cta);
    }

    #zamow .zc-checkout input[type="radio"] {
      accent-color: var(--cta);
    }

    #zamow .zc-checkout .zc-radio-dot {
      border-color: var(--line);
    }

    #zamow .zc-checkout .is-selected .zc-radio-dot,
    #zamow .zc-checkout [aria-checked="true"] .zc-radio-dot,
    #zamow .zc-checkout input[type="radio"]:checked + .zc-radio-dot {
      border-color: var(--cta);
      background: var(--cta);
    }

    #zamow .zc-checkout .zc-step-number,
    #zamow .zc-checkout .zc-step-num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--card);
      background: var(--ink);
      border-radius: 50%;
      font-weight: 700;
    }

    #zamow .zc-checkout small,
    #zamow .zc-checkout .zc-small,
    #zamow .zc-checkout .zc-help,
    #zamow .zc-checkout .zc-note,
    #zamow .zc-checkout .zc-legal {
      color: var(--body);
      font-size: 13px;
      line-height: 1.45;
    }

    #zamow .zc-checkout a {
      color: var(--ink);
      text-decoration: underline;
      text-underline-offset: 4px;
    }

    #zamow .zc-checkout button[type="submit"],
    #zamow .zc-checkout .zc-submit,
    #zamow .zc-checkout .btn.cta {
      display: inline-flex;
      width: 100%;
      min-height: 54px;
      align-items: center;
      justify-content: center;
      padding: var(--s3) var(--s4);
      color: var(--cta-ink);
      background: var(--cta);
      border: 0;
      border-radius: var(--radius-lg);
      font-family: var(--font-display);
      font-size: 17px;
      font-weight: 700;
      font-stretch: 125%;
      line-height: 1.15;
      cursor: pointer;
    }

    #zamow .zc-checkout button[type="submit"]:hover,
    #zamow .zc-checkout .zc-submit:hover,
    #zamow .zc-checkout .btn.cta:hover {
      background: var(--cta-hover);
    }

    @media (max-width: 760px) {
      #zamow .zm-head {
        margin-bottom: var(--s4);
      }

      #zamow .zm-kicker {
        align-items: flex-start;
        flex-direction: column;
        gap: var(--s2);
      }

      #zamow .zm-head .h2 {
        font-size: var(--h2-m);
      }

      #zamow .zm-grid {
        grid-template-columns: minmax(0, 1fr);
        gap: var(--s3);
      }

      #zamow .zm-product {
        position: static;
        top: auto;
        padding: var(--s3);
      }

      #zamow .zm-product-inner {
        grid-template-columns: 96px minmax(0, 1fr);
        align-items: center;
        gap: var(--s3);
      }

      #zamow .zm-packshot {
        width: 96px;
        height: 96px;
        padding: 4px;
      }

      #zamow .zm-packshot img {
        width: 96px;
        max-height: 96px;
      }

      #zamow .zm-product-name {
        margin-bottom: 6px;
        font-size: 17px;
      }

      #zamow .zm-color {
        margin-bottom: 8px;
      }

      #zamow .zm-price {
        font-size: var(--price-fs);
      }

      #zamow .zm-trust {
        display: none;
      }

      #zamow .zm-checkout-card,
      #zamow .zc-checkout {
        border-radius: var(--radius-lg);
      }
    }
  </style>
</section>
```