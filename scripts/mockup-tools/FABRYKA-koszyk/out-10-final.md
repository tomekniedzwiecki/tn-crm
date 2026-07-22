**Siatka sekcji:** wyśrodkowany H2 → szeroka foto-karta z łukiem → karta oferty: cena / CTA / 2 pille → lockup marki. Na mobile wszystkie elementy układają się pionowo.

```html
<section id="final" class="sect-pad">
  <div class="wrap fn-wrap">
    <h2 class="h2 display fn-title reveal">
      Cała porcja. Jeden ruch.<br>
      Zero łowienia.
    </h2>

    <figure class="fn-photo reveal">
      <img
        src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/sc-final.webp"
        width="1536"
        height="1024"
        loading="lazy"
        alt="Kosz Odsączek z nuggetsami zawieszony na rancie garnka"
      >

      <svg class="arc fn-arc" viewBox="0 0 120 60" aria-hidden="true">
        <path d="M108 54C106 30 91 12 67 6"></path>
        <path d="M68 6L78 5M68 6L73 15"></path>
      </svg>
    </figure>

    <div class="fn-offer reveal">
      <div class="fn-price" aria-label="Cena 29 złotych 90 groszy">
        <span data-price>29,90 zł</span>
      </div>

      <a class="btn cta fn-cta" data-checkout href="#zamow">
        Zamawiam Odsączek
      </a>

      <div class="fn-benefits">
        <div class="pill fn-pill">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z"></path>
            <path d="m4 7.5 8 4.5 8-4.5M12 12v9"></path>
          </svg>
          <span>Płatność online lub przy odbiorze</span>
        </div>

        <div class="pill fn-pill">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 8a8 8 0 0 0-14.8-2"></path>
            <path d="M5 2v4h4"></path>
            <path d="M4 16a8 8 0 0 0 14.8 2"></path>
            <path d="M19 22v-4h-4"></path>
          </svg>
          <span>14 dni na zwrot</span>
        </div>
      </div>
    </div>

    <div class="fn-lockup reveal" aria-label="Odsączek">
      <span class="fn-lockup-mark">
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/brand/favicon-256.png"
          width="28"
          height="28"
          loading="lazy"
          alt=""
        >
      </span>
      <span class="fn-lockup-name">Odsączek</span>
    </div>
  </div>

  <style>
    #final {
      background: var(--paper);
      color: var(--ink);
    }

    #final .fn-wrap {
      display: grid;
      gap: var(--s4);
    }

    #final .fn-title {
      max-width: var(--content-w);
      margin: 0 auto;
      text-align: center;
      font-size: var(--h2-d);
      text-wrap: balance;
    }

    #final .fn-photo {
      position: relative;
      width: 100%;
      margin: 0;
      overflow: hidden;
      border-radius: var(--radius-lg);
      background: var(--paper-2);
      box-shadow: var(--shadow-sm);
    }

    #final .fn-photo img {
      display: block;
      width: 100%;
      height: auto;
      border-radius: var(--radius-lg);
    }

    #final .fn-arc {
      position: absolute;
      top: 22%;
      right: 20%;
      width: 120px;
      height: auto;
      fill: none;
      stroke: var(--cta);
      stroke-width: 2px;
      stroke-linecap: round;
      stroke-linejoin: round;
      pointer-events: none;
    }

    #final .fn-offer {
      display: grid;
      grid-template-columns: auto minmax(240px, 1fr) auto;
      align-items: center;
      gap: var(--s3);
      padding: var(--s3);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      background: var(--card);
      box-shadow: var(--shadow-sm);
    }

    #final .fn-price {
      white-space: nowrap;
      font-family: var(--font-display);
      font-size: var(--price-fs);
      font-weight: 700;
      line-height: 1;
      color: var(--ink);
    }

    #final .fn-cta {
      width: 100%;
      text-align: center;
    }

    #final .fn-benefits {
      display: flex;
      align-items: stretch;
      gap: var(--s2);
    }

    #final .fn-pill {
      display: flex;
      align-items: center;
      gap: var(--s2);
      min-height: 100%;
      font-size: var(--body-fs);
      line-height: 1.25;
      color: var(--body);
    }

    #final .fn-pill svg {
      width: 24px;
      height: 24px;
      flex: 0 0 24px;
      fill: none;
      stroke: var(--ink);
      stroke-width: 1.5px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    #final .fn-lockup {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--s2);
      margin-top: var(--s1);
    }

    #final .fn-lockup-mark {
      display: inline-flex;
      align-items: center;
      padding-right: var(--s2);
      border-right: 1px solid var(--line);
    }

    #final .fn-lockup-mark img {
      display: block;
      width: 28px;
      height: auto;
    }

    #final .fn-lockup-name {
      font-family: var(--font-display);
      font-size: var(--body-fs);
      font-weight: 700;
      line-height: 1;
      color: var(--ink);
    }

    @media (max-width: 760px) {
      #final .fn-wrap {
        gap: var(--s3);
      }

      #final .fn-title {
        font-size: var(--h2-m);
      }

      #final .fn-title br {
        display: none;
      }

      #final .fn-photo {
        aspect-ratio: 4 / 3;
      }

      #final .fn-photo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      #final .fn-arc {
        top: 17%;
        right: 9%;
        width: 88px;
      }

      #final .fn-offer {
        grid-template-columns: 1fr;
        gap: var(--s3);
        padding: var(--s3);
      }

      #final .fn-price {
        text-align: center;
      }

      #final .fn-cta {
        display: flex;
        width: 100%;
        justify-content: center;
      }

      #final .fn-benefits {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--s2);
      }

      #final .fn-pill {
        width: 100%;
        justify-content: flex-start;
      }

      #final .fn-lockup {
        margin-top: var(--s2);
      }
    }
  </style>
</section>
```