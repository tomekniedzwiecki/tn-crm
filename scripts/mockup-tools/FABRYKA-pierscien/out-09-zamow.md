**Siatka:** nagłówek wyśrodkowany nad całością. Desktop: 2 kolumny — po lewej sticky karta produktu, po prawej slot formularza; wyrównanie do góry. Mobile: 1 kolumna, kompaktowa karta produktu nad formularzem, obraz 96 px obok informacji, bez sticky.

```html
<section id="zamow">
  <div class="wrap sect-pad">
    <h2 class="h2 zm-heading">Zamów Skrolika</h2>

    <div class="zm-grid">
      <article class="zm-product-card reveal">
        <div class="zm-product-media">
          <img
            src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/skrolik/galeria/keep2-packshot-pink.webp"
            width="600"
            height="600"
            loading="lazy"
            alt="Różowy Skrolik — pierścień do pionowego przewijania"
          >
        </div>

        <div class="zm-product-info">
          <h3 class="display zm-product-name">Skrolik — pierścień do przewijania</h3>
          <p class="zm-product-meta">Kolor: różowy · Bluetooth · zdalna migawka</p>
          <p class="zm-product-price">
            <span data-price>34,90 zł</span>
          </p>
        </div>
      </article>

      <div class="zm-checkout-card reveal">
        <!--CHECKOUT-INLINE-->
      </div>
    </div>
  </div>

  <style scoped>
    #zamow .zm-heading {
      margin: 0 0 var(--s4);
      text-align: center;
    }

    #zamow .zm-grid {
      display: grid;
      grid-template-columns: minmax(340px, .75fr) minmax(0, 1.25fr);
      gap: var(--s4);
      align-items: start;
    }

    #zamow .zm-product-card {
      position: sticky;
      top: var(--s3);
      overflow: hidden;
      min-width: 0;
      padding: var(--s3);
      background: var(--card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    #zamow .zm-product-media {
      overflow: hidden;
      background: var(--card);
      border-radius: var(--radius-sm);
    }

    #zamow .zm-product-media img {
      display: block;
      width: 100%;
      height: auto;
      object-fit: contain;
      border-radius: var(--radius-sm);
    }

    #zamow .zm-product-info {
      padding-top: var(--s3);
    }

    #zamow .zm-product-name {
      margin: 0;
      color: var(--ink);
      font-size: 20px;
      line-height: 1.25;
    }

    #zamow .zm-product-meta {
      margin: var(--s1) 0 0;
      color: var(--body);
      font-size: 14px;
      line-height: 1.5;
    }

    #zamow .zm-product-price {
      margin: var(--s2) 0 0;
      color: var(--cta);
      font-family: var(--font-display);
      font-size: var(--price-fs);
      font-weight: 700;
      line-height: 1.15;
    }

    #zamow .zm-checkout-card {
      min-width: 0;
    }

    @media (max-width: 767px) {
      #zamow .zm-grid {
        grid-template-columns: minmax(0, 1fr);
      }

      #zamow .zm-product-card {
        position: static;
        display: grid;
        grid-template-columns: 96px minmax(0, 1fr);
        gap: var(--s3);
        align-items: center;
        padding: var(--s2);
      }

      #zamow .zm-product-media {
        width: 96px;
        height: 96px;
      }

      #zamow .zm-product-media img {
        width: 96px;
        height: 96px;
      }

      #zamow .zm-product-info {
        min-width: 0;
        padding-top: 0;
      }

      #zamow .zm-product-meta {
        white-space: normal;
      }

      #zamow .zm-product-price {
        margin-top: var(--s1);
      }
    }
  </style>
</section>
```