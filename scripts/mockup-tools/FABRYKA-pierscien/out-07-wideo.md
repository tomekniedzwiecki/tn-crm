Siatka:
- **Desktop:** 2 kolumny 42% / 58%, wyrównane pionowo do środka. Lewa: rail wideo + atrybucja. Prawa: eyebrow, H2, opis, CTA.
- **Mobile:** 1 kolumna: eyebrow + H2 → rail wideo → atrybucja → opis → CTA na pełną szerokość.

```html
<section id="wideo" class="vd-section">
  <div class="wrap sect-pad vd-grid">
    <div class="vd-media">
      <div class="vd-rail reveal"><!--WIDEO-RAIL--></div>
      <p class="vd-credit">@hellozdvj8x</p>
    </div>

    <div class="vd-copy">
      <header class="vd-header reveal">
        <p class="eyebrow vd-eyebrow">
          <svg class="vd-camera" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect>
            <path d="M3.5 9h17"></path>
            <path d="M8 4.5v4.5"></path>
            <path d="M16 4.5v4.5"></path>
            <path d="M10 12.25l4.5 2.75L10 17.75z"></path>
          </svg>
          <span>WIDEO</span>
        </p>

        <h2 class="h2 vd-title">Zobacz Skrolik w akcji</h2>
      </header>

      <p class="vd-body reveal">
        Jeden klip od twórcy — pierścień na palcu, klik kciukiem i ekran rusza.
      </p>

      <a class="btn cta vd-cta reveal" data-checkout href="#zamow">Zamawiam Skrolika</a>
    </div>
  </div>
</section>

<style>
  #wideo.vd-section {
    background: var(--paper-2);
    color: var(--ink);
  }

  #wideo .vd-grid {
    display: grid;
    grid-template-columns: minmax(0, 42%) minmax(0, 1fr);
    gap: var(--s7);
    align-items: center;
  }

  #wideo .vd-media,
  #wideo .vd-copy {
    min-width: 0;
  }

  #wideo .vd-media {
    display: grid;
    gap: var(--s2);
  }

  #wideo .vd-credit {
    margin: 0;
    color: var(--body);
    font-size: 12px;
    line-height: 1.4;
    text-align: center;
  }

  #wideo .vd-copy {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--s4);
  }

  #wideo .vd-header {
    display: grid;
    gap: var(--s3);
  }

  #wideo .vd-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: var(--s2);
    margin: 0;
  }

  #wideo .vd-camera {
    width: 24px;
    height: 24px;
    flex: 0 0 auto;
    fill: none;
    stroke: var(--ink);
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  #wideo .vd-title {
    max-width: 12ch;
    margin: 0;
    font-size: var(--h2-d);
  }

  #wideo .vd-body {
    max-width: 35ch;
    margin: 0;
    color: var(--body);
    font-size: 17px;
    line-height: 1.55;
  }

  #wideo .vd-cta {
    margin-top: var(--s1);
  }

  @media (max-width: 767px) {
    #wideo .vd-grid {
      grid-template-columns: minmax(0, 1fr);
      gap: var(--s4);
      align-items: stretch;
    }

    #wideo .vd-media,
    #wideo .vd-copy {
      display: contents;
    }

    #wideo .vd-header {
      order: 1;
    }

    #wideo .vd-rail {
      order: 2;
    }

    #wideo .vd-credit {
      order: 3;
    }

    #wideo .vd-body {
      order: 4;
      max-width: none;
    }

    #wideo .vd-cta {
      order: 5;
      width: 100%;
      margin-top: 0;
    }

    #wideo .vd-title {
      max-width: 13ch;
      font-size: var(--h2-m);
    }
  }
</style>
```