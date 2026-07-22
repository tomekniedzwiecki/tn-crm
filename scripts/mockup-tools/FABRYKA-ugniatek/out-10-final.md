**Siatka:** centralny nagłówek → packshot z calloutem → 2 mini-kadry obok siebie → cena → CTA → informacja o płatności i zwrocie.

```html
<section id="final" class="sect-pad">
  <div class="wrap">
    <div class="fn-shell">
      <header class="fn-header reveal">
        <h2 class="h2">Dociskaj tam, gdzie sięgasz. Oprzyj się tam, gdzie trudniej.</h2>
      </header>

      <div class="fn-product reveal">
        <img
          class="fn-packshot"
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/packshot-34.webp"
          width="1200"
          height="800"
          loading="lazy"
          alt="Ugniatek z uchwytami i sześcioma kulowymi głowicami masującymi"
        >
        <span class="callout fn-callout">6 kulowych głowic</span>
      </div>

      <div class="fn-scenes reveal" aria-label="Przykłady użycia Ugniatka">
        <figure class="fn-scene">
          <img
            src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/df-A.webp"
            width="800"
            height="800"
            loading="lazy"
            alt="Dociskanie Ugniatka oburącz do górnej części pleców"
          >
        </figure>

        <figure class="fn-scene">
          <img
            src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/wi-biurko.webp"
            width="800"
            height="800"
            loading="lazy"
            alt="Ugniatek używany przy lędźwiach podczas siedzenia"
          >
        </figure>
      </div>

      <div class="fn-order reveal">
        <p class="display fn-price">
          <span data-price>189,00 zł</span>
        </p>

        <a class="btn cta fn-cta" data-checkout href="#zamow">
          Zamawiam Ugniatka
        </a>

        <p class="fn-micro">
          Płatność online lub przy odbiorze · 14 dni na zwrot
        </p>
      </div>
    </div>
  </div>

  <style>
    #final {
      background: var(--paper-2);
      color: var(--ink);
    }

    #final .fn-shell {
      width: min(100%, 62rem);
      margin-inline: auto;
      padding: clamp(var(--s4), 5vw, var(--s7));
      overflow: hidden;
      text-align: center;
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
    }

    #final .fn-header {
      max-width: 52rem;
      margin-inline: auto;
    }

    #final .fn-header .h2 {
      margin: 0;
      text-wrap: balance;
    }

    #final .fn-product {
      position: relative;
      width: min(100%, 35rem);
      margin: var(--s5) auto var(--s4);
    }

    #final .fn-packshot {
      display: block;
      width: 100%;
      height: auto;
      margin-inline: auto;
      border-radius: var(--radius-lg);
    }

    #final .fn-callout {
      position: absolute;
      right: 0;
      bottom: var(--s3);
      max-width: calc(100% - (2 * var(--s2)));
      background: var(--paper);
      color: var(--ink);
      border: 1px solid var(--line);
      box-shadow: var(--shadow-sm);
      white-space: nowrap;
    }

    #final .fn-scenes {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 16.25rem));
      justify-content: center;
      gap: var(--s3);
      margin: 0 auto;
    }

    #final .fn-scene {
      margin: 0;
      overflow: hidden;
      background: var(--paper-3);
      border-radius: var(--radius-lg);
    }

    #final .fn-scene img {
      display: block;
      width: 100%;
      aspect-ratio: 1 / 1;
      object-fit: cover;
      filter: saturate(.72);
      border-radius: var(--radius-lg);
    }

    #final .fn-order {
      display: grid;
      justify-items: center;
      width: min(100%, 32rem);
      margin: var(--s5) auto 0;
    }

    #final .fn-price {
      margin: 0 0 var(--s3);
      color: var(--ink);
      font-family: var(--font-display);
      font-size: clamp(2.5rem, 6vw, 3.5rem);
      font-weight: 700;
      line-height: 1;
      letter-spacing: -.025em;
    }

    #final .fn-cta {
      width: min(100%, 25rem);
      justify-content: center;
      text-align: center;
    }

    #final .fn-micro {
      margin: var(--s3) 0 0;
      color: var(--body);
      font-size: calc(var(--body-fs) * .875);
      line-height: 1.5;
    }

    @media (max-width: 40rem) {
      #final .fn-shell {
        padding: var(--s5) var(--s3);
      }

      #final .fn-product {
        margin-top: var(--s4);
      }

      #final .fn-callout {
        right: var(--s2);
        bottom: var(--s2);
      }

      #final .fn-scenes {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--s2);
      }

      #final .fn-order {
        margin-top: var(--s5);
      }

      #final .fn-cta {
        width: 100%;
      }
    }
  </style>
</section>
```