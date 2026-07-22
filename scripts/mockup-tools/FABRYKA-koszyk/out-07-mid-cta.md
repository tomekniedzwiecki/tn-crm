**Siatka:** pas `--paper-2` → szeroka karta 2-kolumnowa: sekwencja 3 mini-kadrów z łukami | nagłówek, cena, CTA i mikrocopy. Mobile: kadry pozostają w jednym rzędzie, treść układa się pionowo, CTA na pełną szerokość.

```html
<section id="mid-cta" class="mc-section sect-pad" aria-labelledby="mc-title">
  <div class="wrap">
    <div class="mc-card reveal">
      <div class="mc-sequence" aria-label="Trzy kroki użycia Odsączka">
        <figure class="mc-shot">
          <img
            src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/jr-A.webp"
            width="600"
            height="600"
            loading="lazy"
            alt="Odsączek zanurzony w oleju podczas smażenia"
          >
          <figcaption>w oleju</figcaption>
        </figure>

        <svg class="arc mc-arrow" viewBox="0 0 120 60" aria-hidden="true">
          <path d="M8 49C31 15 72 11 105 34"></path>
          <path d="M105 34L91 29M105 34L98 46"></path>
        </svg>

        <figure class="mc-shot">
          <img
            src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/jr-B.webp"
            width="600"
            height="600"
            loading="lazy"
            alt="Odsączek wyjmowany znad naczynia po smażeniu"
          >
          <figcaption>wyjmij</figcaption>
        </figure>

        <svg class="arc mc-arrow" viewBox="0 0 120 60" aria-hidden="true">
          <path d="M8 49C31 15 72 11 105 34"></path>
          <path d="M105 34L91 29M105 34L98 46"></path>
        </svg>

        <figure class="mc-shot">
          <img
            src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/sc-zawieszony.webp"
            width="600"
            height="600"
            loading="lazy"
            alt="Odsączek zawieszony na brzegu garnka"
          >
          <figcaption>zawieś</figcaption>
        </figure>
      </div>

      <div class="mc-content">
        <h2 id="mc-title" class="display mc-display">
          Smaż. Wyjmij.<br>Zawieś.
        </h2>

        <p class="mc-price">
          <span data-price>29,90 zł</span>
        </p>

        <a class="btn cta mc-cta" data-checkout href="#zamow">
          Zamawiam Odsączek
        </a>

        <p class="mc-micro">
          Płatność online lub przy odbiorze · 14 dni na zwrot
        </p>
      </div>
    </div>
  </div>

  <style scoped>
    #mid-cta.mc-section {
      background: var(--paper-2);
      color: var(--ink);
    }

    #mid-cta .mc-card {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.8fr);
      align-items: center;
      gap: var(--s6);
      width: 100%;
      padding: var(--s5);
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
    }

    #mid-cta .mc-sequence {
      display: grid;
      grid-template-columns:
        minmax(110px, 150px) 36px
        minmax(110px, 150px) 36px
        minmax(110px, 150px);
      align-items: center;
      justify-content: center;
      gap: var(--s2);
      min-width: 0;
    }

    #mid-cta .mc-shot {
      min-width: 0;
      margin: 0;
      text-align: center;
    }

    #mid-cta .mc-shot img {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: var(--radius-sm);
    }

    #mid-cta .mc-shot figcaption {
      margin-top: var(--s2);
      color: var(--body);
      font-size: 13.5px;
      line-height: 1.35;
    }

    #mid-cta .mc-arrow {
      display: block;
      align-self: center;
      width: 36px;
      height: auto;
      margin-top: calc(var(--s3) * -1);
      overflow: visible;
      fill: none;
      stroke: var(--cta);
      stroke-width: 2px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    #mid-cta .mc-content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      min-width: 0;
    }

    #mid-cta .mc-display {
      margin: 0;
      color: var(--ink);
      font-size: var(--h2-d);
      font-weight: 700;
      line-height: 1.08;
    }

    #mid-cta .mc-price {
      margin: var(--s3) 0;
      color: var(--ink);
      font-size: var(--price-fs);
      font-weight: 700;
      line-height: 1;
    }

    #mid-cta .mc-cta {
      width: 100%;
      text-align: center;
    }

    #mid-cta .mc-micro {
      margin: var(--s2) 0 0;
      color: var(--body);
      font-size: 13.5px;
      line-height: 1.45;
    }

    @media (max-width: 720px) {
      #mid-cta .mc-card {
        grid-template-columns: minmax(0, 1fr);
        gap: var(--s4);
        padding: var(--s3);
      }

      #mid-cta .mc-sequence {
        grid-template-columns:
          minmax(0, 1fr) 18px
          minmax(0, 1fr) 18px
          minmax(0, 1fr);
        gap: var(--s1);
        width: 100%;
      }

      #mid-cta .mc-arrow {
        width: 18px;
        margin-top: calc(var(--s3) * -1);
      }

      #mid-cta .mc-shot figcaption {
        margin-top: var(--s1);
      }

      #mid-cta .mc-content {
        align-items: stretch;
        text-align: center;
      }

      #mid-cta .mc-display {
        font-size: var(--h2-m);
      }

      #mid-cta .mc-price {
        margin: var(--s3) 0;
      }

      #mid-cta .mc-cta {
        display: block;
        width: 100%;
      }

      #mid-cta .mc-micro {
        margin-top: var(--s2);
      }
    }
  </style>
</section>
```