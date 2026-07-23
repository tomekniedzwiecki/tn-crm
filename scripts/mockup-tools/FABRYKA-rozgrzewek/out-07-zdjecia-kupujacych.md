Siatka: nagłówek z sygnaturą i leadem → galeria 3 kafli; desktop 3 kolumny, mobile 1 duży + 2 mniejsze → podkreślony link do zamówienia.

```html
<section id="zdjecia" class="ug-section sect-pad">
  <div class="wrap">
    <header class="ug-header reveal">
      <div class="ug-kicker">
        <span class="rings-wrap">
          <svg class="rings" viewBox="0 0 88 46" aria-hidden="true" focusable="false">
            <path class="r-out" d="M4 44a40 40 0 0 1 80 0"/>
            <path class="r-mid" d="M15 44a29 29 0 0 1 58 0"/>
            <path class="r-in" d="M26 44a18 18 0 0 1 36 0"/>
          </svg>
        </span>
        <p class="eyebrow">POZA PACKSHOTEM</p>
      </div>

      <h2 class="h2">Zdjęcia od <span class="swash">kupujących</span>.</h2>
      <p class="lead">
        Prawdziwe domowe kadry granatowego wariantu — bez ocen, gwiazdek i liczników popularności.
      </p>
    </header>

    <div class="ug-gallery reveal">
      <figure class="ug-card">
        <img
          class="ug-image"
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozgrzewek/assets/ugc/ugc-1.webp"
          width="800"
          height="1000"
          loading="lazy"
          alt="Zdjęcie od kupującego: granatowy masażer w dłoni, widoczna głowica"
        >
        <figcaption class="ug-caption">Granatowy wariant Blue</figcaption>
      </figure>

      <figure class="ug-card">
        <img
          class="ug-image"
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozgrzewek/assets/ugc/ugc-2.webp"
          width="800"
          height="1000"
          loading="lazy"
          alt="Zdjęcie od kupującego: granatowy masażer, świecący wyświetlacz"
        >
        <figcaption class="ug-caption">Granatowy wariant Blue</figcaption>
      </figure>

      <figure class="ug-card">
        <img
          class="ug-image"
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozgrzewek/assets/ugc/ugc-3.webp"
          width="800"
          height="1000"
          loading="lazy"
          alt="Zdjęcie od kupującego: makro głowicy z czerwonym światłem LED"
        >
        <figcaption class="ug-caption">Granatowy wariant Blue</figcaption>
      </figure>
    </div>

    <div class="ug-link-wrap reveal">
      <a class="ug-link" href="#zamow">Chcę granatowy Rozgrzewek</a>
    </div>
  </div>

  <style>
    #zdjecia.ug-section {
      background: var(--paper);
      color: var(--ink);
    }

    #zdjecia .ug-header {
      max-width: 920px;
      margin-inline: auto;
      text-align: center;
    }

    #zdjecia .ug-kicker {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--s2);
      margin-bottom: var(--s3);
    }

    #zdjecia .ug-kicker .eyebrow {
      margin: 0;
    }

    #zdjecia .ug-kicker .rings-wrap {
      display: block;
      width: 88px;
      height: 46px;
    }

    #zdjecia .ug-kicker .rings {
      display: block;
      width: 88px;
      height: 46px;
    }

    #zdjecia .ug-header .h2 {
      margin: 0;
    }

    #zdjecia .ug-header .lead {
      max-width: 820px;
      margin: var(--s3) auto 0;
      color: var(--body);
      font-size: 17px;
    }

    #zdjecia .ug-gallery {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--s4);
      margin-top: var(--s5);
    }

    #zdjecia .ug-card {
      min-width: 0;
      margin: 0;
      overflow: hidden;
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    #zdjecia .ug-image {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 4 / 5;
      object-fit: cover;
      border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    }

    #zdjecia .ug-caption {
      padding: var(--s3);
      color: var(--body);
      font-size: 13px;
      line-height: 1.4;
      text-align: center;
    }

    #zdjecia .ug-link-wrap {
      display: flex;
      justify-content: center;
      margin-top: var(--s5);
    }

    #zdjecia .ug-link {
      color: var(--ink);
      font-size: 17px;
      font-weight: 700;
      line-height: 1.4;
      text-decoration: underline;
      text-decoration-thickness: 1px;
      text-underline-offset: 0.22em;
    }

    #zdjecia .ug-link:hover,
    #zdjecia .ug-link:focus-visible {
      color: var(--ink);
      text-decoration-thickness: 2px;
    }

    #zdjecia .ug-link:focus-visible {
      outline: 1px solid var(--ink);
      outline-offset: 4px;
      border-radius: var(--radius-sm);
    }

    @media (max-width: 767px) {
      #zdjecia .ug-gallery {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--s3);
      }

      #zdjecia .ug-card:first-child {
        grid-column: 1 / -1;
      }

      #zdjecia .ug-card:first-child .ug-image {
        aspect-ratio: 4 / 5;
      }

      #zdjecia .ug-card:not(:first-child) .ug-image {
        aspect-ratio: 1 / 1;
      }

      #zdjecia .ug-caption {
        padding: var(--s2);
      }
    }
  </style>
</section>
```