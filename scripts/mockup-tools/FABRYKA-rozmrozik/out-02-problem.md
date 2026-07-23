**Siatka:** desktop 5/7 — copy po lewej, scena full-bleed po prawej; mobile — scena ~45vh, następnie copy i dwie karty w stosie.

```html
<section id="problem" class="pb-section">
  <div class="pb-grid">
    <div class="pb-media reveal">
      <picture>
        <source
          media="(max-width: 767px)"
          srcset="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/sc-problem-900.webp"
        >
        <img
          class="pb-image"
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/sc-problem.webp"
          width="1536"
          height="1024"
          loading="lazy"
          alt="Miska ciepłej wody z zamrożonym mięsem w zlewie, mikrofala w tle"
        >
      </picture>
    </div>

    <div class="pb-copy sect-pad reveal">
      <div class="pb-heading">
        <p class="eyebrow">16:30. KAŻDEMU SIĘ ZDARZA.</p>
        <span class="thaw" aria-hidden="true"></span>

        <h2 class="h2">
          Zamrażarka pamięta. Ty nie <span class="swash">musisz</span>.
        </h2>

        <p class="lead pb-intro">
          Wracasz z pracy, rodzina pyta o obiad, a mięso nadal jest twarde i pokryte szronem.
        </p>
      </div>

      <div class="pb-cards" aria-label="Typowe problemy z rozmrażaniem">
        <article class="pb-card">
          <svg class="pb-icon" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M11 22h26c0 8-5.8 14-13 14S11 30 11 22Z"></path>
            <path d="M18 36h12M20 40h8"></path>
            <path d="M18 17c-2-2-2-4 0-6s2-4 0-6"></path>
            <path d="M24 17c-2-2-2-4 0-6s2-4 0-6"></path>
            <path d="M30 17c-2-2-2-4 0-6s2-4 0-6"></path>
          </svg>
          <p>Miska ciepłej wody zajmująca zlew?</p>
        </article>

        <article class="pb-card">
          <svg class="pb-icon" viewBox="0 0 48 48" aria-hidden="true">
            <rect x="6" y="9" width="36" height="29" rx="2"></rect>
            <rect x="10" y="14" width="22" height="18"></rect>
            <path d="M36 13v21"></path>
            <circle cx="39" cy="18" r="2.5"></circle>
            <circle cx="39" cy="28" r="3"></circle>
            <path d="M11 38v4h7v-4M33 38v4h6v-4"></path>
          </svg>
          <p>Mikrofala i brzegi, które zaczynają się gotować?</p>
        </article>
      </div>

      <p class="lead pb-point">
        Rozmrozik daje zamrożonym porcjom osobne miejsce: aluminiową płytę pod kopułą oraz tackę ociekową zbierającą wodę.
      </p>
    </div>
  </div>

  <style>
    #problem.pb-section {
      width: 100%;
      overflow: hidden;
      background: var(--paper-2);
      color: var(--ink);
    }

    #problem .pb-grid {
      display: grid;
      grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
      align-items: stretch;
      min-height: 42rem;
    }

    #problem .pb-copy {
      grid-column: 1;
      grid-row: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-width: 0;
      padding-block: var(--s7);
      padding-left: max(var(--s4), calc((100vw - var(--content-w)) / 2));
      padding-right: var(--s5);
      background: var(--paper-2);
      position: relative;
      z-index: 2;
    }

    #problem .pb-heading {
      max-width: 42rem;
    }

    #problem .eyebrow {
      margin: 0;
    }

    #problem .thaw {
      display: block;
      margin-top: var(--s2);
      margin-bottom: var(--s4);
    }

    #problem .h2 {
      margin: 0;
      font-size: var(--h2-d);
      color: var(--ink);
    }

    #problem .pb-intro {
      max-width: 38rem;
      margin: var(--s4) 0 0;
      font-size: 17px;
      color: var(--body);
    }

    #problem .pb-cards {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--s3);
      width: 100%;
      max-width: 44rem;
      margin-top: var(--s5);
    }

    #problem .pb-card {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: center;
      gap: var(--s3);
      min-width: 0;
      padding: var(--s4);
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    #problem .pb-card p {
      margin: 0;
      font-size: 17px;
      line-height: 1.45;
      color: var(--body);
    }

    #problem .pb-icon {
      display: block;
      width: 3rem;
      height: 3rem;
      flex: 0 0 auto;
      fill: none;
      stroke: var(--ink);
      stroke-width: 1.75px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    #problem .pb-point {
      max-width: 42rem;
      margin: var(--s4) 0 0;
      font-size: 15px;
      color: var(--body);
    }

    #problem .pb-media {
      grid-column: 2;
      grid-row: 1;
      position: relative;
      min-width: 0;
      min-height: 100%;
      overflow: hidden;
    }

    #problem .pb-media picture {
      display: block;
      width: 100%;
      height: 100%;
    }

    #problem .pb-image {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 100%;
      object-fit: cover;
      object-position: center;
      border-radius: var(--radius-lg) 0 0 var(--radius-lg);
    }

    #problem .pb-media::after {
      content: "";
      position: absolute;
      z-index: 1;
      inset-block: 0;
      left: 0;
      width: 120px;
      pointer-events: none;
      background: linear-gradient(to right, var(--paper-2), transparent);
    }

    @media (max-width: 767px) {
      #problem .pb-grid {
        display: flex;
        flex-direction: column;
        min-height: 0;
      }

      #problem .pb-media {
        order: 1;
        width: 100%;
        height: 45vh;
        min-height: 20rem;
      }

      #problem .pb-image {
        width: 100%;
        height: 100%;
        min-height: 0;
        object-fit: cover;
        object-position: center;
        border-radius: 0 0 var(--radius-lg) var(--radius-lg);
      }

      #problem .pb-media::after {
        inset: auto 0 0;
        width: 100%;
        height: 30%;
        background: linear-gradient(to bottom, transparent, var(--paper-2));
      }

      #problem .pb-copy {
        order: 2;
        width: 100%;
        padding-block: var(--s5) var(--s7);
        padding-inline: var(--s4);
      }

      #problem .thaw {
        margin-bottom: var(--s4);
      }

      #problem .h2 {
        font-size: var(--h2-m);
      }

      #problem .pb-intro {
        margin-top: var(--s4);
        font-size: 17px;
      }

      #problem .pb-cards {
        grid-template-columns: 1fr;
        gap: var(--s3);
        margin-top: var(--s5);
      }

      #problem .pb-card {
        grid-template-columns: 3.5rem minmax(0, 1fr);
        padding: var(--s4);
      }

      #problem .pb-icon {
        width: 3.25rem;
        height: 3.25rem;
      }

      #problem .pb-point {
        margin-top: var(--s4);
      }
    }
  </style>
</section>
```