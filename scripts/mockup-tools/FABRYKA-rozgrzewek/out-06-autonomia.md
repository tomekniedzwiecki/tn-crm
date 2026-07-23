Siatka: desktop 55/45 — nagłówek i 4 karty po lewej, packshot po prawej; mobile — nagłówek, karty 2×2, dopisek i CTA.

```html
<section id="autonomia" class="au-section band sect-pad">
  <div class="wrap">
    <div class="au-layout">
      <div class="au-content">
        <header class="au-header reveal">
          <div class="au-kicker">
            <span class="rings-wrap"><svg class="rings" viewBox="0 0 88 46" aria-hidden="true" focusable="false"><path class="r-out" d="M4 44a40 40 0 0 1 80 0"/><path class="r-mid" d="M15 44a29 29 0 0 1 58 0"/><path class="r-in" d="M26 44a18 18 0 0 1 36 0"/></svg></span>
            <p class="eyebrow">NAŁADUJ I UŻYWAJ BEZ PRZEWODU</p>
          </div>

          <h2 class="h2 au-title">
            Około 50 minut pracy po
            <span class="swash">naładowaniu</span>.
          </h2>
        </header>

        <div class="au-cards reveal">
          <article class="au-card">
            <svg class="au-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
              <rect x="13" y="9" width="22" height="34" rx="3"></rect>
              <path d="M20 9V5h8v4"></path>
              <path d="m26 16-7 11h7l-4 10 8-13h-7l3-8Z"></path>
            </svg>
            <p class="display au-value">ok. 1200 mAh</p>
            <p class="au-label">Pojemność baterii</p>
          </article>

          <article class="au-card">
            <svg class="au-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
              <circle cx="24" cy="24" r="18"></circle>
              <path d="M24 13v12l9 6"></path>
            </svg>
            <p class="display au-value">ok. 3 h</p>
            <p class="au-label">Czas ładowania</p>
          </article>

          <article class="au-card">
            <svg class="au-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
              <circle cx="24" cy="26" r="16"></circle>
              <path d="M19 5h10"></path>
              <path d="M24 5v5"></path>
              <path d="M36 13l3 3"></path>
              <path d="M24 17v10l7 4"></path>
            </svg>
            <p class="display au-value">ok. 50 min</p>
            <p class="au-label">Czas pracy</p>
          </article>

          <article class="au-card">
            <svg class="au-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
              <circle cx="24" cy="24" r="18"></circle>
              <path d="M24 10v14"></path>
              <path d="M16 16a11 11 0 1 0 16 0"></path>
            </svg>
            <p class="display au-value">ok. 30 min</p>
            <p class="au-label">Automatyczne wyłączenie</p>
          </article>
        </div>

        <div class="au-footer reveal">
          <p class="lead au-note">Obudowa: ABS i TPR. Produkt zgodny z CE i RoHS.</p>
          <a class="btn cta au-cta" data-checkout href="#zamow">Zamawiam za 84,90 zł</a>
        </div>
      </div>

      <figure class="au-packshot reveal">
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozgrzewek/assets/packshot-alpha.png"
          width="720"
          height="900"
          loading="lazy"
          alt="Granatowy masażer Rozgrzewek"
        >
      </figure>
    </div>
  </div>

  <style>
    .au-section {
      overflow: hidden;
      background: var(--paper-2);
      color: var(--ink);
    }

    .au-layout {
      display: grid;
      grid-template-columns: minmax(0, 55fr) minmax(280px, 45fr);
      gap: var(--s6);
      align-items: center;
    }

    .au-content {
      min-width: 0;
    }

    .au-header {
      margin-bottom: var(--s5);
    }

    .au-kicker {
      display: flex;
      align-items: flex-end;
      gap: var(--s3);
      margin-bottom: var(--s3);
    }

    .au-kicker .rings-wrap {
      display: inline-flex;
      flex: 0 0 66px;
      width: 66px;
    }

    .au-kicker .rings {
      display: block;
      width: 100%;
      height: auto;
      overflow: visible;
      fill: none;
      stroke-linecap: round;
      stroke-width: 1.75px;
    }

    .au-kicker .r-out {
      stroke: var(--cta);
    }

    .au-kicker .r-mid,
    .au-kicker .r-in {
      stroke: var(--line);
    }

    .au-kicker .r-out,
    .au-kicker .r-mid,
    .au-kicker .r-in {
      stroke-dasharray: 130;
      stroke-dashoffset: 130;
      transition: stroke-dashoffset 700ms ease;
    }

    .au-header.reveal.in .r-out,
    .au-header.reveal.in .r-mid,
    .au-header.reveal.in .r-in {
      stroke-dashoffset: 0;
    }

    .au-kicker .eyebrow {
      margin: 0 0 4px;
    }

    .au-title {
      max-width: 15ch;
      margin: 0;
      color: var(--ink);
      font-size: var(--h2-d);
    }

    .au-cards {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: var(--s2);
    }

    .au-card {
      display: flex;
      min-width: 0;
      min-height: 220px;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--s4) var(--s2);
      text-align: center;
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    .au-icon {
      width: 48px;
      height: 48px;
      margin-bottom: var(--s3);
      fill: none;
      stroke: var(--ink);
      stroke-width: 1.75px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .au-value {
      margin: 0 0 var(--s2);
      color: var(--ink);
      line-height: 1.05;
    }

    .au-label {
      margin: 0;
      color: var(--body);
      font-size: 17px;
      line-height: 1.35;
    }

    .au-footer {
      margin-top: var(--s4);
    }

    .au-note {
      margin: 0 0 var(--s4);
      color: var(--body);
      font-size: 15px;
      line-height: 1.55;
    }

    .au-cta {
      display: inline-flex;
      justify-content: center;
      text-align: center;
    }

    .au-packshot {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 0;
      margin: 0;
    }

    .au-packshot img {
      display: block;
      width: min(100%, 390px);
      height: auto;
      margin-inline: auto;
      border-radius: var(--radius-lg);
    }

    @media (max-width: 980px) {
      .au-layout {
        grid-template-columns: 1fr;
      }

      .au-packshot {
        display: none;
      }

      .au-title {
        font-size: var(--h2-m);
      }

      .au-cards {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .au-card {
        min-height: 200px;
      }

      .au-cta {
        width: 100%;
      }
    }

    @media (max-width: 560px) {
      .au-header {
        margin-bottom: var(--s4);
      }

      .au-kicker {
        align-items: center;
        gap: var(--s2);
      }

      .au-kicker .rings-wrap {
        flex-basis: 54px;
        width: 54px;
      }

      .au-cards {
        gap: var(--s2);
      }

      .au-card {
        min-height: 180px;
        padding: var(--s3) var(--s2);
      }

      .au-icon {
        width: 42px;
        height: 42px;
        margin-bottom: var(--s2);
      }

      .au-label {
        font-size: 17px;
      }
    }
  </style>
</section>
```