Siatka: desktop — treść i CTA po lewej, packshot po prawej; mobile — nagłówek, packshot, cena, pełny CTA i dwa chipy.

```html
<section id="mid-cta" class="band" aria-labelledby="mc-mid-cta-title">
  <div class="wrap sect-pad">
    <div class="mc-card reveal">
      <div class="mc-intro">
        <span class="rings-wrap"><svg class="rings" viewBox="0 0 88 46" aria-hidden="true" focusable="false"><path class="r-out" d="M4 44a40 40 0 0 1 80 0"/><path class="r-mid" d="M15 44a29 29 0 0 1 58 0"/><path class="r-in" d="M26 44a18 18 0 0 1 36 0"/></svg></span>
        <p class="eyebrow">MAŁY RYTUAŁ DLA SIEBIE</p>
      </div>

      <h2 id="mc-mid-cta-title" class="h2 mc-title">
        Rozgrzewek w jednej, stałej <span class="swash">cenie</span>.
      </h2>

      <div class="mc-product reveal">
        <img
          class="mc-product-img"
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozgrzewek/assets/packshot-alpha.png"
          width="900"
          height="900"
          loading="lazy"
          decoding="async"
          alt="Granatowy masażer Rozgrzewek"
        >
      </div>

      <p class="mc-price">
        <span class="display" data-price>84,90 zł</span>
      </p>

      <div class="mc-actions">
        <a class="btn cta mc-cta" data-checkout href="#zamow">Wybieram Rozgrzewek</a>

        <div class="mc-risks" aria-label="Informacje dotyczące zakupu">
          <div class="mc-risk">
            <svg class="mc-risk-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
              <path d="M19 13.5 27 9l8 4.5-8 4.5-8-4.5Z"/>
              <path d="M19 13.5V23l8 4.5 8-4.5v-9.5M27 18v9.5"/>
              <path d="M5.5 30.5h5l5.5 7h11.5l13-9.5a4 4 0 0 0-5-6l-9 5"/>
              <path d="M16 31h10.5a3.5 3.5 0 0 0 0-7H19l-5.5 4.5"/>
              <path d="m5 29 5-2 6 13-5 2-6-13Z"/>
            </svg>
            <span>Możesz zapłacić przy odbiorze.</span>
          </div>

          <div class="mc-risk">
            <svg class="mc-risk-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
              <path d="M37.5 16.5A16 16 0 1 0 40 27"/>
              <path d="M31 9.5h7v7"/>
              <path d="m38 9.5-7.5 7"/>
              <text x="24" y="30" text-anchor="middle">14</text>
            </svg>
            <span>Masz 14 dni na zwrot.</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <style scoped>
    #mid-cta .mc-card {
      position: relative;
      display: grid;
      grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
      grid-template-areas:
        "intro product"
        "title product"
        "price product"
        "actions product";
      gap: var(--s4) var(--s6);
      overflow: hidden;
      padding: var(--s6);
      color: var(--ink);
      background: var(--card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
    }

    #mid-cta .mc-intro {
      grid-area: intro;
      align-self: end;
    }

    #mid-cta .mc-intro .rings-wrap {
      display: block;
      width: 88px;
      height: 46px;
      margin-bottom: var(--s2);
    }

    #mid-cta .mc-intro .rings {
      display: block;
      width: 88px;
      height: 46px;
      fill: none;
      stroke-linecap: round;
      stroke-width: 1.75px;
    }

    #mid-cta .mc-intro .rings path {
      stroke-dasharray: 130;
      stroke-dashoffset: 130;
    }

    #mid-cta .mc-intro .rings .r-out {
      stroke: var(--cta);
    }

    #mid-cta .mc-intro .rings .r-mid,
    #mid-cta .mc-intro .rings .r-in {
      stroke: var(--line);
    }

    #mid-cta .mc-card.reveal.in .mc-intro .rings path {
      stroke-dashoffset: 0;
      transition: stroke-dashoffset 700ms ease;
    }

    #mid-cta .mc-card.reveal.in .mc-intro .rings .r-mid {
      transition-delay: 90ms;
    }

    #mid-cta .mc-card.reveal.in .mc-intro .rings .r-in {
      transition-delay: 180ms;
    }

    #mid-cta .mc-intro .eyebrow {
      margin: 0;
      color: var(--ink);
    }

    #mid-cta .mc-title {
      grid-area: title;
      max-width: 16ch;
      margin: 0;
      color: var(--ink);
      font-size: var(--h2-d);
    }

    #mid-cta .mc-product {
      grid-area: product;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 490px;
      padding: var(--s5);
      overflow: hidden;
      background: var(--paper-2);
      border-radius: var(--radius-lg);
    }

    #mid-cta .mc-product-img {
      display: block;
      width: 100%;
      max-width: 430px;
      height: auto;
      margin-inline: auto;
      object-fit: contain;
      border-radius: var(--radius-lg);
    }

    #mid-cta .mc-price {
      grid-area: price;
      margin: 0;
    }

    #mid-cta .mc-price .display {
      color: var(--ink);
      font-size: var(--price-fs);
      font-weight: 700;
      line-height: 1;
    }

    #mid-cta .mc-actions {
      grid-area: actions;
      align-self: start;
      width: 100%;
      max-width: 580px;
    }

    #mid-cta .mc-cta {
      width: 100%;
      text-align: center;
    }

    #mid-cta .mc-risks {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--s2);
      margin-top: var(--s3);
    }

    #mid-cta .mc-risk {
      display: flex;
      align-items: center;
      gap: var(--s2);
      min-width: 0;
      min-height: 76px;
      padding: var(--s2) var(--s3);
      color: var(--body);
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      font-size: 17px;
      line-height: 1.35;
    }

    #mid-cta .mc-risk-icon {
      flex: 0 0 44px;
      width: 44px;
      height: 44px;
      color: var(--ink);
      fill: none;
      stroke: currentColor;
      stroke-width: 1.75px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    #mid-cta .mc-risk-icon text {
      fill: var(--ink);
      stroke: none;
      font: 700 14px sans-serif;
    }

    @media (max-width: 760px) {
      #mid-cta .mc-card {
        grid-template-columns: minmax(0, 1fr);
        grid-template-areas:
          "intro"
          "title"
          "product"
          "price"
          "actions";
        gap: var(--s3);
        padding: var(--s4);
      }

      #mid-cta .mc-intro {
        text-align: center;
      }

      #mid-cta .mc-intro .rings-wrap {
        margin-inline: auto;
      }

      #mid-cta .mc-title {
        max-width: none;
        text-align: center;
        font-size: var(--h2-m);
      }

      #mid-cta .mc-product {
        min-height: 0;
        padding: var(--s3);
      }

      #mid-cta .mc-product-img {
        max-width: 260px;
      }

      #mid-cta .mc-price {
        text-align: center;
      }

      #mid-cta .mc-actions {
        max-width: none;
      }

      #mid-cta .mc-risks {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      #mid-cta .mc-risk {
        flex-direction: column;
        justify-content: center;
        padding: var(--s2);
        text-align: center;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #mid-cta .mc-card.reveal.in .mc-intro .rings path {
        transition: none;
      }
    }
  </style>
</section>
```