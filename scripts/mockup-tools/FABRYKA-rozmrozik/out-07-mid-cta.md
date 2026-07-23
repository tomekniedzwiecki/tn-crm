**Siatka sekcji**
- `.band` → `.wrap.sect-pad` → szeroka karta `.mc-card`
- Desktop: treść po lewej, packshot na polu `--paper-2` po prawej
- Mobile: eyebrow → H2 → packshot → cena → pełne CTA → microcopy

```html
<section id="mid-cta" class="mc-section band">
  <div class="wrap sect-pad">
    <div class="mc-card reveal">
      <span class="mc-ghost display" aria-hidden="true">4,2 L</span>

      <div class="mc-kicker">
        <p class="eyebrow">PLAN NA ZAMROŻONE PORCJE</p>
        <span class="thaw"></span>
      </div>

      <h2 class="mc-title h2">
        Daj rozmrażaniu własne <span class="swash">miejsce</span>.
      </h2>

      <p class="mc-lead lead">
        Elektryczny box z komorą 4,2 L, dotykowym startem i tacką ociekową.
      </p>

      <figure class="mc-packshot reveal">
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/packshot-alpha.png"
          width="806"
          height="538"
          loading="lazy"
          alt="Rozmrozik — elektryczny box do rozmrażania, wariant czarny"
        >
      </figure>

      <div class="mc-purchase">
        <span class="mc-price display" data-price>289,00 zł</span>
        <a class="btn cta mc-cta" data-checkout href="#zamow">
          Zamawiam Rozmrozik
        </a>
      </div>

      <p class="mc-micro">
        Płatność przy odbiorze lub BLIK/online · 14 dni na zwrot
      </p>
    </div>
  </div>

  <style>
    #mid-cta.mc-section {
      color: var(--ink);
      font-size: 17px;
    }

    #mid-cta .mc-card {
      position: relative;
      isolation: isolate;
      display: grid;
      grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
      grid-template-areas:
        "kicker packshot"
        "title packshot"
        "lead packshot"
        "purchase packshot"
        "micro packshot";
      column-gap: var(--s6);
      row-gap: var(--s3);
      overflow: hidden;
      padding: var(--s6);
      background: var(--card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
    }

    #mid-cta .mc-ghost {
      position: absolute;
      z-index: 0;
      top: var(--s3);
      right: var(--s5);
      margin: 0;
      color: var(--paper-2);
      font-size: 180px;
      font-weight: 700;
      line-height: 0.8;
      white-space: nowrap;
      pointer-events: none;
      user-select: none;
    }

    #mid-cta .mc-kicker,
    #mid-cta .mc-title,
    #mid-cta .mc-lead,
    #mid-cta .mc-packshot,
    #mid-cta .mc-purchase,
    #mid-cta .mc-micro {
      position: relative;
      z-index: 1;
    }

    #mid-cta .mc-kicker {
      grid-area: kicker;
      align-self: end;
    }

    #mid-cta .mc-kicker .eyebrow {
      margin: 0;
    }

    #mid-cta .mc-kicker .thaw {
      display: block;
      margin-top: var(--s2);
    }

    #mid-cta .mc-title {
      grid-area: title;
      margin: 0;
      font-size: var(--h2-d);
    }

    #mid-cta .mc-lead {
      grid-area: lead;
      max-width: 34rem;
      margin: 0;
      color: var(--body);
      font-size: 17px;
    }

    #mid-cta .mc-packshot {
      grid-area: packshot;
      align-self: stretch;
      display: grid;
      place-items: center;
      min-width: 0;
      margin: 0;
      padding: var(--s4);
      overflow: hidden;
      background: var(--paper-2);
      border-radius: var(--radius-lg);
    }

    #mid-cta .mc-packshot img {
      display: block;
      width: 100%;
      max-width: 806px;
      height: auto;
      border-radius: var(--radius-lg);
    }

    #mid-cta .mc-purchase {
      grid-area: purchase;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--s3);
    }

    #mid-cta .mc-price {
      color: var(--ink);
      font-size: var(--price-fs);
      font-weight: 700;
      line-height: 1;
      white-space: nowrap;
    }

    #mid-cta .mc-cta {
      flex: 0 0 auto;
      text-align: center;
    }

    #mid-cta .mc-micro {
      grid-area: micro;
      margin: 0;
      color: var(--body);
      font-size: 13.5px;
      line-height: 1.45;
    }

    @media (max-width: 760px) {
      #mid-cta .mc-card {
        grid-template-columns: minmax(0, 1fr);
        grid-template-areas:
          "kicker"
          "title"
          "packshot"
          "purchase"
          "micro";
        gap: var(--s3);
        padding: var(--s4);
      }

      #mid-cta .mc-ghost {
        top: var(--s4);
        right: var(--s3);
        font-size: 92px;
      }

      #mid-cta .mc-title {
        font-size: var(--h2-m);
      }

      #mid-cta .mc-lead {
        display: none;
      }

      #mid-cta .mc-packshot {
        justify-self: stretch;
        min-height: 0;
        padding: var(--s3);
      }

      #mid-cta .mc-packshot img {
        width: 100%;
        max-width: 260px;
        margin-inline: auto;
      }

      #mid-cta .mc-purchase {
        flex-direction: column;
        align-items: stretch;
        gap: var(--s3);
      }

      #mid-cta .mc-price {
        display: block;
        text-align: center;
      }

      #mid-cta .mc-cta {
        display: block;
        width: 100%;
      }

      #mid-cta .mc-micro {
        text-align: center;
      }
    }
  </style>
</section>
```