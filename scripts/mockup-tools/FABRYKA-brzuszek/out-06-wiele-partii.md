Siatka: nagłówek z sygnaturą → desktop: kafele 2×2 z naprzemiennym układem zdjęcie/tekst → mobile: jedna kolumna, zdjęcie nad opisem.

```html
<section id="wiele-partii" class="mp-partie sect-pad">
  <div class="wrap">
    <header class="mp-partie__header reveal">
      <div class="mp-partie__signature">
        <p class="eyebrow">WIĘCEJ NIŻ JEDEN RUCH</p>
        <span class="reps" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
      </div>

      <h2 class="h2 display">Nie tylko <span class="swash">brzuch</span>.</h2>
      <p class="lead">Maszyna jest przeznaczona do ćwiczeń brzucha, talii, pośladków, ramion i nóg.</p>
    </header>

    <div class="mp-partie__grid">
      <article class="mp-partie__card reveal">
        <div class="mp-partie__photo">
          <img
            src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/brzuszek/assets/sc-partie-core.webp"
            width="1200"
            height="1500"
            loading="lazy"
            alt="Kobieta wykonuje crunch, klęk na U-wałku biało-różowej maszyny"
          >
        </div>

        <div class="mp-partie__content">
          <span class="mp-partie__icon" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none">
              <path d="M8 38h32"/>
              <path d="M13 34 31 10"/>
              <path d="m19 31 9-12"/>
              <rect x="17" y="25" width="11" height="7" rx="3.5"/>
              <path d="M31 10h6"/>
              <path d="M34 10v7"/>
              <path d="M30 17c0 3.5 2.2 6 5.5 6S41 20.5 41 17"/>
              <circle cx="14" cy="38" r="2.5"/>
              <circle cx="36" cy="38" r="2.5"/>
            </svg>
          </span>
          <div>
            <h3 class="mp-partie__title display">Brzuch i core</h3>
            <p class="mp-partie__body">Wózek z wałkiem porusza się po pochyłej szynie podczas ruchu crunch.</p>
          </div>
        </div>
      </article>

      <article class="mp-partie__card mp-partie__card--photo-right reveal">
        <div class="mp-partie__photo">
          <img
            src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/brzuszek/assets/sc-partie-glute.webp"
            width="1200"
            height="1500"
            loading="lazy"
            alt="Wariant side leg raise na biało-różowej maszynie"
          >
        </div>

        <div class="mp-partie__content">
          <span class="mp-partie__icon" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none">
              <path d="M19 10c-2 5-3 9-3 14s1 10 3 14"/>
              <path d="M29 10c2 5 3 9 3 14s-1 10-3 14"/>
              <path d="M18 21c4 3 8 3 12 0"/>
              <path d="M18 27c4-3 8-3 12 0"/>
              <path d="M12 24H4"/>
              <path d="m8 20-4 4 4 4"/>
              <path d="M36 24h8"/>
              <path d="m40 20 4 4-4 4"/>
              <path d="M24 25v13"/>
            </svg>
          </span>
          <div>
            <h3 class="mp-partie__title display">Talia i pośladki</h3>
            <p class="mp-partie__body">W materiałach produktu pokazano wariant side leg raise.</p>
          </div>
        </div>
      </article>

      <article class="mp-partie__card reveal">
        <div class="mp-partie__photo">
          <img
            class="mp-partie__arms-image"
            src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/brzuszek/assets/sc-partie-arms.webp"
            width="1200"
            height="1500"
            loading="lazy"
            alt="Trening ramion na linkach oporowych przy maszynie"
          >
        </div>

        <div class="mp-partie__content">
          <span class="mp-partie__icon" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none">
              <path d="M9 39h30"/>
              <path d="M14 39 29 13"/>
              <path d="M18 32h11"/>
              <path d="M29 13c3 8 5 14 7 20"/>
              <path d="M36 33c1.5 0 3 1.5 3 3s-1.5 3-3 3-3-1.5-3-3 1.5-3 3-3Z"/>
              <path d="m27 14 5-6"/>
              <rect x="30" y="5" width="8" height="5" rx="2.5"/>
              <path d="M14 39c-3-3-4-7-2-10"/>
              <path d="m10 27 4-3"/>
            </svg>
          </span>
          <div>
            <h3 class="mp-partie__title display">Ramiona</h3>
            <p class="mp-partie__body">Do treningu ramion służą linki lub gumy oporowe z piankowymi uchwytami.</p>
          </div>
        </div>
      </article>

      <article class="mp-partie__card mp-partie__card--photo-right reveal">
        <div class="mp-partie__photo">
          <img
            src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/brzuszek/assets/sc-partie-legs.webp"
            width="1200"
            height="1500"
            loading="lazy"
            alt="Detal pasków lub strzemion u podstawy maszyny"
          >
        </div>

        <div class="mp-partie__content">
          <span class="mp-partie__icon" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none">
              <path d="M7 37h34"/>
              <path d="M12 37V25"/>
              <path d="M36 37V25"/>
              <path d="M12 29h8"/>
              <path d="M28 29h8"/>
              <path d="M18 12v16"/>
              <path d="M30 12v16"/>
              <path d="M16 19h4"/>
              <path d="M28 19h4"/>
              <path d="M12 29c0 5 3 8 8 8"/>
              <path d="M36 29c0 5-3 8-8 8"/>
              <path d="M20 28v6"/>
              <path d="M28 28v6"/>
            </svg>
          </span>
          <div>
            <h3 class="mp-partie__title display">Nogi</h3>
            <p class="mp-partie__body">U podstawy znajdują się paski lub strzemiona pedałów, a nogi są wymienione w obszarach treningu.</p>
          </div>
        </div>
      </article>
    </div>
  </div>

  <style>
    #wiele-partii {
      background: var(--paper-2);
      color: var(--ink);
    }

    #wiele-partii .mp-partie__header {
      max-width: 760px;
      margin-bottom: var(--s5);
    }

    #wiele-partii .mp-partie__signature {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--s3);
      margin-bottom: var(--s3);
    }

    #wiele-partii .mp-partie__signature .eyebrow {
      margin: 0;
    }

    #wiele-partii .mp-partie__header .h2 {
      margin: 0;
      font-size: var(--h2-d);
      color: var(--ink);
    }

    #wiele-partii .mp-partie__header .lead {
      max-width: 620px;
      margin: var(--s3) 0 0;
      color: var(--body);
      font-size: 17px;
    }

    #wiele-partii .mp-partie__grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--s4);
    }

    #wiele-partii .mp-partie__card {
      display: grid;
      grid-template-columns: minmax(0, 1.08fr) minmax(190px, .92fr);
      align-items: stretch;
      gap: var(--s3);
      padding: 10px;
      overflow: hidden;
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    #wiele-partii .mp-partie__card--photo-right {
      grid-template-columns: minmax(190px, .92fr) minmax(0, 1.08fr);
    }

    #wiele-partii .mp-partie__card--photo-right .mp-partie__photo {
      grid-column: 2;
      grid-row: 1;
    }

    #wiele-partii .mp-partie__card--photo-right .mp-partie__content {
      grid-column: 1;
      grid-row: 1;
    }

    #wiele-partii .mp-partie__photo {
      min-width: 0;
      overflow: hidden;
      border-radius: var(--radius-sm);
      background: var(--paper);
    }

    #wiele-partii .mp-partie__photo img {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 4 / 5;
      object-fit: cover;
      object-position: center;
      border-radius: var(--radius-sm);
    }

    #wiele-partii .mp-partie__photo .mp-partie__arms-image {
      object-position: center top;
    }

    #wiele-partii .mp-partie__content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      gap: var(--s3);
      min-width: 0;
      padding: var(--s3) var(--s2);
    }

    #wiele-partii .mp-partie__icon {
      display: grid;
      width: 58px;
      height: 58px;
      place-items: center;
      flex: 0 0 auto;
      color: var(--ink);
      background: var(--paper-2);
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
    }

    #wiele-partii .mp-partie__icon svg {
      width: 36px;
      height: 36px;
      stroke: currentColor;
      stroke-width: 1.75px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    #wiele-partii .mp-partie__title {
      margin: 0;
      color: var(--ink);
      font-size: 20px;
      font-weight: 700;
      line-height: 1.15;
    }

    #wiele-partii .mp-partie__body {
      margin: var(--s2) 0 0;
      color: var(--body);
      font-family: var(--font-text);
      font-size: 15px;
      line-height: 1.55;
    }

    @media (max-width: 760px) {
      #wiele-partii .mp-partie__header {
        margin-bottom: var(--s4);
      }

      #wiele-partii .mp-partie__signature {
        align-items: flex-start;
        flex-direction: column;
        gap: var(--s2);
      }

      #wiele-partii .mp-partie__header .h2 {
        font-size: var(--h2-m);
      }

      #wiele-partii .mp-partie__grid {
        grid-template-columns: 1fr;
      }

      #wiele-partii .mp-partie__card,
      #wiele-partii .mp-partie__card--photo-right {
        grid-template-columns: 1fr;
        gap: 0;
      }

      #wiele-partii .mp-partie__card--photo-right .mp-partie__photo,
      #wiele-partii .mp-partie__card--photo-right .mp-partie__content {
        grid-column: 1;
      }

      #wiele-partii .mp-partie__card--photo-right .mp-partie__photo {
        grid-row: 1;
      }

      #wiele-partii .mp-partie__card--photo-right .mp-partie__content {
        grid-row: 2;
      }

      #wiele-partii .mp-partie__content {
        flex-direction: row;
        justify-content: flex-start;
        padding: var(--s3) var(--s2) var(--s3);
      }

      #wiele-partii .mp-partie__icon {
        width: 54px;
        height: 54px;
      }
    }
  </style>
</section>
```