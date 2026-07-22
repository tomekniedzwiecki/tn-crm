**Siatka:** jedna centrowana karta (max. 880px). Desktop: 2 kolumny 40% / 60%, wyrównane pionowo do środka. Mobile: jeden stos — packshot → nazwa → opis → cena → CTA → microcopy.

```html
<section id="mid-cta" class="mc-section sect-pad">
  <div class="wrap">
    <div class="mc-card reveal">
      <div class="mc-media">
        <svg class="sig mc-sig" viewBox="0 0 64 64" aria-hidden="true">
          <path d="M25 38a11 11 0 0 1 0-15.6" />
          <path d="M18 45a21 21 0 0 1 0-29.7" />
          <path d="M11 52a31 31 0 0 1 0-43.8" />
        </svg>

        <img
          class="mc-image"
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/skrolik/galeria/keep2-packshot-pink.webp"
          width="600"
          height="600"
          loading="lazy"
          alt="Różowy pierścień-pilot Skrolik do telefonu"
        >
      </div>

      <div class="mc-content">
        <h2 class="display mc-name">Skrolik</h2>
        <p class="mc-description">
          Mały pierścień-pilot do telefonu —<br class="mc-desktop-break">
          w tej ofercie kolor różowy
        </p>
        <p class="mc-price"><span data-price>34,90 zł</span></p>
        <a class="btn cta mc-cta" data-checkout href="#zamow">Zamawiam Skrolika</a>
        <p class="mc-micro">Płatność online lub przy odbiorze · 14 dni na zwrot</p>
      </div>
    </div>
  </div>

  <style scoped>
    #mid-cta {
      background: var(--paper-2);
    }

    #mid-cta .mc-card {
      display: grid;
      grid-template-columns: minmax(0, 40%) minmax(0, 60%);
      align-items: center;
      width: 100%;
      max-width: 880px;
      margin-inline: auto;
      padding: var(--s5);
      overflow: hidden;
      background: var(--card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
    }

    #mid-cta .mc-media {
      position: relative;
      display: grid;
      place-items: center;
      min-width: 0;
    }

    #mid-cta .mc-image {
      position: relative;
      z-index: 1;
      display: block;
      width: 100%;
      max-width: 300px;
      height: auto;
      margin-inline: auto;
      border-radius: var(--radius-lg);
    }

    #mid-cta .mc-sig {
      position: absolute;
      z-index: 0;
      top: 3%;
      left: 1%;
      width: min(78%, 250px);
      height: auto;
      fill: none;
      stroke: var(--cta);
      stroke-width: 1.5px;
      stroke-linecap: round;
      opacity: 0.55;
      pointer-events: none;
    }

    #mid-cta .mc-content {
      min-width: 0;
      padding-inline-start: var(--s5);
    }

    #mid-cta .mc-name {
      margin: 0 0 var(--s2);
      color: var(--ink);
      font-size: 24px;
      line-height: 1.15;
    }

    #mid-cta .mc-description {
      margin: 0;
      color: var(--body);
      font-size: 17px;
      line-height: 1.55;
    }

    #mid-cta .mc-price {
      margin: var(--s4) 0;
      color: var(--ink);
      font-family: var(--font-display);
      font-size: var(--price-fs);
      font-weight: 700;
      line-height: 1.1;
    }

    #mid-cta .mc-cta {
      display: flex;
      width: 100%;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    #mid-cta .mc-micro {
      margin: var(--s2) 0 0;
      color: var(--body);
      font-size: 13.5px;
      line-height: 1.45;
      text-align: center;
    }

    @media (max-width: 700px) {
      #mid-cta .mc-card {
        grid-template-columns: 1fr;
        padding: var(--s4);
      }

      #mid-cta .mc-media {
        margin-bottom: var(--s3);
      }

      #mid-cta .mc-image {
        max-width: 220px;
      }

      #mid-cta .mc-sig {
        left: calc(50% - 130px);
        width: 190px;
      }

      #mid-cta .mc-content {
        padding-inline-start: 0;
      }

      #mid-cta .mc-desktop-break {
        display: none;
      }
    }
  </style>
</section>
```