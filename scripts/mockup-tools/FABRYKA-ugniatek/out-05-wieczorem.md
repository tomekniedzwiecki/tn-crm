**Siatka:** nagłówek → desktop: foto 55% z calloutem | foto + karta korzyści 45% → mobile: duża foto → mała foto → karta korzyści.

```html
<section id="wieczorem" class="wi-section sect-pad" aria-labelledby="wi-title">
  <div class="wrap">
    <header class="wi-head reveal">
      <p class="eyebrow">TWÓJ MOMENT</p>
      <h2 class="h2" id="wi-title">Twój moment po całym dniu.</h2>
      <p class="lead">Bez przewodu, bez umawiania się — w domu, kiedy chcesz.</p>
    </header>

    <div class="wi-grid">
      <figure class="wi-photo wi-photo--main reveal">
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/wi-biurko.webp"
          width="1536"
          height="1024"
          loading="lazy"
          alt="Mężczyzna korzystający z masażera na odcinku lędźwiowym podczas pracy przy biurku"
        >
        <figcaption class="callout wi-callout">docisk oburącz</figcaption>
      </figure>

      <div class="wi-side">
        <figure class="wi-photo wi-photo--training reveal">
          <img
            src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/wi-trening.webp"
            width="1536"
            height="1024"
            loading="lazy"
            alt="Mężczyzna masujący łydkę po treningu na macie"
          >
        </figure>

        <div class="wi-benefits reveal" aria-label="Zastosowanie masażera po pracy i treningu">
          <div class="wi-benefit">
            <div class="wi-icon" aria-hidden="true">
              <svg viewBox="0 0 64 64" fill="none">
                <path d="M26 8c-6 2-10 7-10 14 0 5 2 8 5 11v8c0 3-2 5-5 6l-4 2v7"/>
                <path d="M38 56v-9c0-4-2-7-5-9-3-2-5-5-5-9"/>
                <path d="M28 10c7 0 12 5 12 12 0 4-2 8-5 10"/>
                <path d="M29 17c2 1 3 3 3 5"/>
                <path d="M26 35c4 2 7 6 8 11"/>
                <path d="M25 30c-1 7 1 13 6 18"/>
                <path d="M23 38l2 1m1 4 2 1m1 4 2 1"/>
              </svg>
            </div>
            <p><strong>Po pracy:</strong><span>kark, barki, lędźwie</span></p>
          </div>

          <div class="wi-benefit">
            <div class="wi-icon" aria-hidden="true">
              <svg viewBox="0 0 64 64" fill="none">
                <path d="M24 7c-2 8-1 14 4 19l7 7c3 3 3 7 1 11l-5 9"/>
                <path d="M35 8c-1 7 1 12 6 17 5 5 6 11 3 17l-6 12"/>
                <path d="M31 53c3 3 7 4 13 3"/>
                <path d="M38 54c2 3 5 4 10 4"/>
                <path d="M36 31l3 2m-5 4 3 2m-5 4 3 2m-5 4 3 1"/>
              </svg>
            </div>
            <p><strong>Po treningu:</strong><span>uda i łydki</span></p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <style scoped>
    #wieczorem {
      overflow: hidden;
      background: var(--paper);
      color: var(--ink);
    }

    #wieczorem .wi-head {
      max-width: 58rem;
      margin-bottom: var(--s5);
    }

    #wieczorem .eyebrow {
      color: var(--ink);
    }

    #wieczorem .wi-head .h2 {
      margin-top: var(--s2);
      margin-bottom: var(--s2);
    }

    #wieczorem .wi-head .lead {
      max-width: 48rem;
      color: var(--body);
    }

    #wieczorem .wi-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.22fr) minmax(0, 1fr);
      gap: var(--s4);
      align-items: stretch;
    }

    #wieczorem .wi-side {
      display: grid;
      grid-template-rows: minmax(0, 1.08fr) minmax(15rem, 0.92fr);
      gap: var(--s4);
      min-width: 0;
    }

    #wieczorem .wi-photo {
      position: relative;
      min-width: 0;
      margin: 0;
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      background: var(--paper-2);
      box-shadow: var(--shadow-sm);
    }

    #wieczorem .wi-photo--main {
      min-height: 38rem;
    }

    #wieczorem .wi-photo img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: var(--radius-lg);
    }

    #wieczorem .wi-photo--main img {
      object-position: center;
    }

    #wieczorem .wi-photo--training img {
      object-position: center;
    }

    #wieczorem .wi-callout {
      position: absolute;
      right: var(--s4);
      bottom: var(--s4);
      z-index: 1;
      margin: 0;
      border: 1px solid var(--line);
      background: var(--card);
      color: var(--ink);
      box-shadow: var(--shadow-sm);
    }

    #wieczorem .wi-callout::before {
      content: "";
      position: absolute;
      right: 72%;
      bottom: calc(100% + var(--s2));
      width: 4.5rem;
      border-top: 1px solid currentColor;
      transform: rotate(-58deg);
      transform-origin: right center;
      opacity: 0.7;
    }

    #wieczorem .wi-benefits {
      display: grid;
      grid-template-rows: repeat(2, minmax(0, 1fr));
      padding: 0 var(--s4);
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      background: var(--card);
      box-shadow: var(--shadow-sm);
    }

    #wieczorem .wi-benefit {
      display: grid;
      grid-template-columns: 5.5rem minmax(0, 1fr);
      gap: var(--s4);
      align-items: center;
      padding: var(--s4) 0;
    }

    #wieczorem .wi-benefit + .wi-benefit {
      border-top: 1px solid var(--line);
    }

    #wieczorem .wi-icon {
      width: 5rem;
      height: 5rem;
      color: var(--ink);
    }

    #wieczorem .wi-icon svg {
      display: block;
      width: 100%;
      height: 100%;
      stroke: currentColor;
      stroke-width: 1.5px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    #wieczorem .wi-benefit p {
      display: grid;
      gap: var(--s1);
      margin: 0;
      color: var(--body);
      font-size: var(--body-fs);
      line-height: 1.45;
    }

    #wieczorem .wi-benefit strong {
      color: var(--ink);
      font-weight: 700;
    }

    @media (max-width: 62rem) {
      #wieczorem .wi-grid,
      #wieczorem .wi-side {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: auto;
      }

      #wieczorem .wi-grid,
      #wieczorem .wi-side {
        gap: var(--s3);
      }

      #wieczorem .wi-photo--main,
      #wieczorem .wi-photo--training {
        min-height: 0;
        aspect-ratio: 16 / 9;
      }

      #wieczorem .wi-photo--training {
        aspect-ratio: 2 / 1;
      }

      #wieczorem .wi-benefits {
        padding: 0 var(--s4);
      }
    }

    @media (max-width: 40rem) {
      #wieczorem .wi-head {
        margin-bottom: var(--s4);
      }

      #wieczorem .wi-photo--main {
        aspect-ratio: 4 / 3;
      }

      #wieczorem .wi-photo--training {
        aspect-ratio: 16 / 9;
      }

      #wieczorem .wi-photo--main img {
        object-position: 58% center;
      }

      #wieczorem .wi-benefit {
        grid-template-columns: 4.5rem minmax(0, 1fr);
        gap: var(--s3);
        padding: var(--s4) 0;
      }

      #wieczorem .wi-icon {
        width: 4rem;
        height: 4rem;
      }

      #wieczorem .wi-callout {
        right: var(--s3);
        bottom: var(--s3);
      }

      #wieczorem .wi-callout::before {
        display: none;
      }
    }
  </style>
</section>
```