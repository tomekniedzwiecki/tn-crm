Siatka: desktop — treść i zakup po lewej, packshot na białym polu po prawej; mobile — nagłówek, packshot, cena, pełne CTA i informacja o płatności.

```html
<section id="mid-cta" class="mc-mid sect-pad">
  <div class="wrap">
    <div class="mc-card reveal">
      <span class="mc-ghost display" aria-hidden="true">SERIA</span>

      <div class="mc-copy">
        <h2 class="mc-title h2 display">
          Gotowa ustawić swoją <span class="swash">serię</span>?
        </h2>
        <p class="mc-product">Brzuszek — biało-różowy.</p>
      </div>

      <div class="mc-visual">
        <img
          class="mc-packshot"
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/brzuszek/assets/packshot-alpha.png"
          width="1591"
          height="1528"
          loading="lazy"
          alt="Biało-różowa maszyna Brzuszek"
        >
      </div>

      <div class="mc-order">
        <div class="mc-buy">
          <span class="mc-price display" data-price>429,00 zł</span>
          <a class="btn cta mc-cta" data-checkout href="#zamow">
            Przechodzę do zamówienia
          </a>
        </div>
        <p class="mc-micro">
          Płatność przy odbiorze, BLIK lub online · 14 dni na zwrot
        </p>
      </div>
    </div>
  </div>

  <style>
    .mc-mid {
      background: var(--paper);
    }

    .mc-mid .mc-card {
      position: relative;
      z-index: 0;
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(300px, 0.72fr);
      grid-template-areas:
        "copy visual"
        "order visual";
      align-items: center;
      gap: var(--s4) var(--s6);
      overflow: hidden;
      padding: var(--s6);
      background: var(--card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
    }

    .mc-mid .mc-ghost {
      position: absolute;
      top: calc(var(--s4) * -1);
      right: var(--s4);
      z-index: 0;
      color: var(--paper-2);
      font-size: 160px;
      font-weight: 800;
      line-height: 1;
      letter-spacing: -0.06em;
      pointer-events: none;
      user-select: none;
      white-space: nowrap;
    }

    .mc-mid .mc-copy,
    .mc-mid .mc-visual,
    .mc-mid .mc-order {
      position: relative;
      z-index: 1;
    }

    .mc-mid .mc-copy {
      grid-area: copy;
      align-self: end;
    }

    .mc-mid .mc-title {
      max-width: 690px;
      margin: 0;
      color: var(--ink);
      font-size: var(--h2-d);
      line-height: 1.04;
    }

    .mc-mid .mc-product {
      margin: var(--s3) 0 0;
      color: var(--body);
      font-family: var(--font-text);
      font-size: 15px;
      line-height: 1.5;
    }

    .mc-mid .mc-visual {
      grid-area: visual;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      max-width: 400px;
      margin-left: auto;
      padding: var(--s3);
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
    }

    .mc-mid .mc-packshot {
      display: block;
      width: 100%;
      max-width: 360px;
      height: auto;
      object-fit: contain;
      background: var(--card);
      border-radius: var(--radius-lg);
    }

    .mc-mid .mc-order {
      grid-area: order;
      align-self: start;
    }

    .mc-mid .mc-buy {
      display: flex;
      align-items: center;
      gap: var(--s4);
    }

    .mc-mid .mc-price {
      flex: 0 0 auto;
      color: var(--ink);
      font-size: var(--price-fs);
      font-weight: 800;
      line-height: 1;
      white-space: nowrap;
    }

    .mc-mid .mc-cta {
      flex: 1 1 auto;
      justify-content: center;
      text-align: center;
    }

    .mc-mid .mc-micro {
      margin: var(--s3) 0 0;
      color: var(--body);
      font-family: var(--font-text);
      font-size: 13.5px;
      line-height: 1.5;
    }

    @media (max-width: 760px) {
      .mc-mid .mc-card {
        grid-template-columns: minmax(0, 1fr);
        grid-template-areas:
          "copy"
          "visual"
          "order";
        gap: var(--s4);
        padding: var(--s4);
      }

      .mc-mid .mc-ghost {
        top: var(--s2);
        right: var(--s2);
        font-size: 84px;
      }

      .mc-mid .mc-title {
        font-size: var(--h2-m);
      }

      .mc-mid .mc-product {
        margin-top: var(--s2);
      }

      .mc-mid .mc-visual {
        width: min(100%, 260px);
        margin-right: auto;
        margin-left: auto;
        padding: var(--s2);
      }

      .mc-mid .mc-packshot {
        max-width: 260px;
      }

      .mc-mid .mc-buy {
        flex-direction: column;
        align-items: stretch;
        gap: var(--s3);
      }

      .mc-mid .mc-price {
        display: block;
      }

      .mc-mid .mc-cta {
        width: 100%;
      }
    }
  </style>
</section>
```