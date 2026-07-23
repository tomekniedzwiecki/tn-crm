Siatka: nagłówek → mozaika 2×2 (desktop) / 4 kadry pionowo (mobile) → nota i link.

```html
<section id="obszary" class="ob-section sect-pad">
  <div class="wrap">
    <header class="ob-header reveal">
      <span class="rings-wrap">
        <svg class="rings" viewBox="0 0 88 46" aria-hidden="true" focusable="false">
          <path class="r-out" d="M4 44a40 40 0 0 1 80 0"/>
          <path class="r-mid" d="M15 44a29 29 0 0 1 58 0"/>
          <path class="r-in" d="M26 44a18 18 0 0 1 36 0"/>
        </svg>
      </span>

      <p class="eyebrow">TWÓJ RYTM</p>
      <h2 class="h2">Kark, ramiona, plecy albo <span class="swash">uda</span>.</h2>
      <p class="lead ob-intro">
        Wybierz obszar i prowadź masażer ręcznie, dopasowując poziom do własnych preferencji.
      </p>
    </header>

    <div class="ob-grid reveal">
      <article class="ob-card">
        <img
          class="ob-image"
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozgrzewek/assets/sc-obszary-neck.webp"
          width="1200"
          height="1500"
          loading="lazy"
          alt="Dłoń prowadzi granatowy masażer po karku"
        >
        <h3 class="display ob-label">Kark</h3>
      </article>

      <article class="ob-card">
        <img
          class="ob-image"
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozgrzewek/assets/sc-obszary-shoulder.webp"
          width="1200"
          height="1500"
          loading="lazy"
          alt="Granatowy masażer przy ramieniu, chwyt za głowicę"
        >
        <h3 class="display ob-label">Ramiona</h3>
      </article>

      <article class="ob-card">
        <img
          class="ob-image"
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozgrzewek/assets/sc-obszary-back.webp"
          width="1200"
          height="1500"
          loading="lazy"
          alt="Górna część pleców i granatowy masażer, naturalny zasięg dłoni"
        >
        <h3 class="display ob-label">Plecy</h3>
      </article>

      <article class="ob-card">
        <img
          class="ob-image"
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozgrzewek/assets/sc-obszary-thigh.webp"
          width="1200"
          height="1500"
          loading="lazy"
          alt="Granatowy masażer na udzie w domowej stylizacji"
        >
        <h3 class="display ob-label">Uda</h3>
      </article>
    </div>

    <footer class="ob-footer reveal">
      <p class="lead ob-note">
        To produkt do domowego masażu i relaksu, nie urządzenie lecznicze.
      </p>
      <a class="ob-link" href="#autonomia">Sprawdź ładowanie i czas pracy</a>
    </footer>
  </div>

  <style scoped>
    #obszary {
      background: var(--paper);
      color: var(--body);
    }

    #obszary .ob-header {
      max-width: 920px;
      margin-inline: auto;
      margin-bottom: var(--s5);
      text-align: center;
    }

    #obszary .ob-header .rings-wrap {
      display: block;
      width: 88px;
      margin-inline: auto;
      margin-bottom: var(--s2);
    }

    #obszary .ob-header .rings {
      display: block;
      width: 88px;
      height: 46px;
      fill: none;
      stroke-linecap: round;
      stroke-width: 1.75px;
    }

    #obszary .ob-header .r-out {
      stroke: var(--cta);
    }

    #obszary .ob-header .r-mid,
    #obszary .ob-header .r-in {
      stroke: var(--line);
    }

    #obszary .ob-header .rings path {
      stroke-dasharray: 140;
      stroke-dashoffset: 140;
      transition: stroke-dashoffset 700ms ease;
    }

    #obszary .ob-header.reveal.in .rings path {
      stroke-dashoffset: 0;
    }

    #obszary .ob-header .r-mid {
      transition-delay: 90ms;
    }

    #obszary .ob-header .r-in {
      transition-delay: 180ms;
    }

    #obszary .ob-header .eyebrow {
      margin: 0 0 var(--s2);
    }

    #obszary .ob-header .h2 {
      margin: 0;
      color: var(--ink);
      font-size: var(--h2-d);
    }

    #obszary .ob-intro {
      max-width: 780px;
      margin: var(--s3) auto 0;
      font-size: 17px;
      color: var(--body);
    }

    #obszary .ob-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--s3);
    }

    #obszary .ob-card {
      min-width: 0;
      overflow: hidden;
      margin: 0;
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    #obszary .ob-image {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 4 / 5;
      object-fit: cover;
      border-radius: var(--radius-sm);
    }

    #obszary .ob-label {
      margin: 0;
      padding: var(--s3) var(--s4);
      color: var(--ink);
    }

    #obszary .ob-footer {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--s4);
      margin-top: var(--s4);
    }

    #obszary .ob-note {
      margin: 0;
      font-size: 15px;
      color: var(--body);
    }

    #obszary .ob-link {
      flex: 0 0 auto;
      color: var(--ink);
      font-size: 15px;
      font-weight: 600;
      text-decoration: underline;
      text-decoration-thickness: 1px;
      text-underline-offset: 0.25em;
    }

    #obszary .ob-link:hover,
    #obszary .ob-link:focus-visible {
      color: var(--ink);
      text-decoration-thickness: 2px;
    }

    @media (max-width: 760px) {
      #obszary .ob-header {
        margin-bottom: var(--s4);
      }

      #obszary .ob-header .h2 {
        font-size: var(--h2-m);
      }

      #obszary .ob-intro {
        margin-top: var(--s2);
      }

      #obszary .ob-grid {
        grid-template-columns: 1fr;
        gap: var(--s3);
      }

      #obszary .ob-label {
        padding: var(--s3);
      }

      #obszary .ob-footer {
        align-items: flex-start;
        flex-direction: column;
        gap: var(--s3);
      }

      #obszary .ob-link {
        white-space: normal;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #obszary .ob-header .rings path {
        stroke-dashoffset: 0;
        transition: none;
      }
    }
  </style>
</section>
```