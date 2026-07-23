**Siatka sekcji**
1. Nagłówek: eyebrow + pasek odwilży, H2, lead  
2. Marker montażowy `<!--WIDEO-RAIL-->`  
3. Podkreślony link do zamówienia  

```html
<section id="wideo" class="wd-video sect-pad" aria-labelledby="wd-wideo-title">
  <div class="wrap wd-header reveal">
    <p class="eyebrow">ZOBACZ W PIONIE</p>
    <span class="thaw"></span>

    <h2 id="wd-wideo-title" class="h2 wd-title">
      Pięć krótkich klipów. Jeden <span class="swash">produkt</span>.
    </h2>

    <p class="lead wd-lead">
      Przesuń rail i odtwórz wybrany materiał.
    </p>
  </div>

  <!--WIDEO-RAIL-->

  <div class="wrap wd-order">
    <a class="wd-order-link" href="#zamow">Przejdź do zamówienia →</a>
  </div>

  <style scoped>
    .wd-video {
      padding-block: var(--s7);
    }

    .wd-header {
      margin-bottom: var(--s4);
    }

    .wd-header .thaw {
      margin-top: var(--s2);
      margin-bottom: var(--s4);
    }

    .wd-title {
      max-width: var(--content-w);
      margin: 0;
      font-size: var(--h2-d);
    }

    .wd-lead {
      max-width: var(--content-w);
      margin: var(--s3) 0 0;
      font-size: 17px;
    }

    .wd-order {
      margin-top: var(--s4);
      text-align: center;
    }

    .wd-order-link {
      color: var(--ink);
      font-size: 17px;
      text-decoration: underline;
      text-underline-offset: 0.25em;
    }

    @media (max-width: 767px) {
      .wd-video {
        padding-block: var(--s6);
      }

      .wd-header {
        margin-bottom: var(--s3);
      }

      .wd-title {
        font-size: var(--h2-m);
      }

      .wd-order {
        margin-top: var(--s3);
      }
    }
  </style>
</section>
```