Siatka: nagłówek z sygnaturą → dyptyk 2 kolumny / stos mobilny → 3 kroki → mikrocopy → wyśrodkowane CTA.

```html
<section id="skladanie" class="sk-sklad sect-pad">
  <div class="wrap">
    <header class="sk-sklad__header reveal">
      <div class="sk-sklad__signature">
        <span class="eyebrow">PO TRENINGU</span>
        <span class="reps" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
      </div>

      <h2 class="h2">Po serii składasz sprzęt, nie <span class="swash">plan</span>.</h2>

      <p class="lead">
        Maszyna ma składaną konstrukcję z zawleczką zabezpieczającą, dzięki czemu po treningu możesz ją złożyć i odłożyć.
      </p>
    </header>

    <div class="sk-sklad__diptych reveal">
      <figure class="sk-sklad__figure">
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/brzuszek/assets/sc-sklad-rozloz.webp"
          width="1200"
          height="1500"
          loading="lazy"
          alt="Kobieta klęka przy rozłożonej biało-różowej maszynie i sięga do mechanizmu"
        >
        <figcaption class="sk-sklad__chip">ROZŁOŻONA</figcaption>
      </figure>

      <figure class="sk-sklad__figure">
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/brzuszek/assets/ugc-2-0-retusz.webp"
          width="1000"
          height="1250"
          loading="lazy"
          alt="Biało-różowa maszyna złożona i oparta o kanapę"
        >
        <figcaption class="sk-sklad__chip sk-sklad__chip--ugc">
          <span>ZŁOŻONA</span>
          <small>zdjęcie od kupującego</small>
        </figcaption>
      </figure>
    </div>

    <ol class="sk-sklad__steps reveal" aria-label="Jak złożyć konstrukcję">
      <li class="sk-sklad__step">
        <span class="sk-sklad__number" aria-hidden="true">1</span>
        <span>Zwolnij zawleczkę zgodnie z instrukcją.</span>
      </li>
      <li class="sk-sklad__step">
        <span class="sk-sklad__number" aria-hidden="true">2</span>
        <span>Złóż konstrukcję.</span>
      </li>
      <li class="sk-sklad__step">
        <span class="sk-sklad__number" aria-hidden="true">3</span>
        <span>Zabezpiecz ją przed odłożeniem.</span>
      </li>
    </ol>

    <div class="sk-sklad__footer reveal">
      <p class="sk-sklad__microcopy">
        Produkt jest opisany jako łatwy w montażu i jest dostarczany z instrukcją.
      </p>
      <a class="btn cta sk-sklad__cta" data-checkout href="#zamow">
        Zamawiam składany Brzuszek
      </a>
    </div>
  </div>

  <style scoped>
    .sk-sklad {
      overflow: hidden;
      color: var(--ink);
      background: var(--paper);
    }

    .sk-sklad__header {
      max-width: 880px;
      margin-bottom: var(--s5);
    }

    .sk-sklad__signature {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--s2);
      margin-bottom: var(--s3);
    }

    .sk-sklad__header .h2 {
      margin: 0;
      font-size: var(--h2-d);
      color: var(--ink);
    }

    .sk-sklad__header .lead {
      max-width: 760px;
      margin: var(--s3) 0 0;
      color: var(--body);
      font-size: 17px;
    }

    .sk-sklad__diptych {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }

    .sk-sklad__figure {
      position: relative;
      aspect-ratio: 4 / 5;
      margin: 0;
      padding: 10px;
      overflow: hidden;
      border-radius: var(--radius-lg);
      background: var(--card);
      box-shadow: var(--shadow-md);
    }

    .sk-sklad__figure img {
      display: block;
      width: 100%;
      height: auto;
      min-height: 100%;
      object-fit: cover;
      border-radius: var(--radius-lg);
    }

    .sk-sklad__chip {
      position: absolute;
      top: calc(10px + var(--s2));
      left: calc(10px + var(--s2));
      z-index: 1;
      display: inline-flex;
      align-items: center;
      min-height: 34px;
      margin: 0;
      padding: 8px 12px;
      border-radius: 999px;
      background: var(--card);
      color: var(--ink);
      font-family: var(--font-text);
      font-size: 11px;
      font-weight: 700;
      line-height: 1;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      box-shadow: var(--shadow-sm);
    }

    .sk-sklad__chip--ugc {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
      line-height: 1.1;
    }

    .sk-sklad__chip--ugc small {
      color: var(--body);
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0;
      text-transform: none;
    }

    .sk-sklad__steps {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
      margin: var(--s4) 0 0;
      padding: 0;
      list-style: none;
    }

    .sk-sklad__step {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: center;
      gap: 12px;
      min-height: 68px;
      padding: 12px 16px;
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      background: var(--card);
      color: var(--body);
      font-size: 15px;
      line-height: 1.45;
      box-shadow: var(--shadow-sm);
    }

    .sk-sklad__number {
      display: grid;
      width: 36px;
      height: 36px;
      place-items: center;
      border-radius: 8px;
      background: var(--paper-2);
      color: var(--ink);
      font-weight: 700;
      line-height: 1;
    }

    .sk-sklad__footer {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: var(--s4);
      text-align: center;
    }

    .sk-sklad__microcopy {
      max-width: 680px;
      margin: 0;
      color: var(--body);
      font-size: 14px;
      line-height: 1.5;
    }

    .sk-sklad__cta {
      margin-top: var(--s3);
      margin-inline: auto;
      text-align: center;
    }

    @media (max-width: 767px) {
      .sk-sklad__header {
        margin-bottom: var(--s4);
      }

      .sk-sklad__signature {
        gap: var(--s1);
      }

      .sk-sklad__header .h2 {
        font-size: var(--h2-m);
      }

      .sk-sklad__diptych,
      .sk-sklad__steps {
        grid-template-columns: 1fr;
      }

      .sk-sklad__figure {
        padding: 8px;
      }

      .sk-sklad__chip {
        top: calc(8px + var(--s2));
        left: calc(8px + var(--s2));
      }

      .sk-sklad__steps {
        gap: 10px;
      }

      .sk-sklad__step {
        min-height: 62px;
      }

      .sk-sklad__cta {
        width: 100%;
        justify-content: center;
      }
    }
  </style>
</section>
```