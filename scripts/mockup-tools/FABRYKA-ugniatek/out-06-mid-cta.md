**Siatka:** szeroka karta 2-kolumnowa (packshot 55% / treść 45%); mobile: packshot → nagłówek → cena → CTA → mikrokomunikat.

```html
<section id="mid-cta" class="mc-section sect-pad" aria-labelledby="mc-title">
  <div class="wrap">
    <div class="mc-card reveal">
      <div class="mc-visual">
        <img
          class="mc-image"
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/packshot-34.webp"
          width="1200"
          height="760"
          loading="lazy"
          alt="Ugniatek – urządzenie do masażu z uchwytami i głowicami masującymi"
        >
      </div>

      <div class="mc-content">
        <h2 id="mc-title" class="mc-title display">
          Dwie formy masażu.<br>Jedno urządzenie.
        </h2>

        <p class="mc-price">
          <span data-price>189,00 zł</span>
        </p>

        <a class="btn cta mc-cta" data-checkout href="#zamow">
          Zamawiam Ugniatka
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
    }

    #mid-cta .mc-card {
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
      align-items: center;
      gap: var(--s6);
      width: 100%;
      padding: var(--s5);
      overflow: hidden;
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
    }

    #mid-cta .mc-visual {
      display: grid;
      place-items: center;
      min-width: 0;
      overflow: hidden;
      border-radius: var(--radius-lg);
      background: var(--paper-3);
    }

    #mid-cta .mc-image {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 30 / 19;
      object-fit: cover;
      border-radius: var(--radius-lg);
    }

    #mid-cta .mc-content {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      min-width: 0;
      padding-block: var(--s3);
    }

    #mid-cta .mc-title {
      max-width: 13ch;
      margin: 0;
      color: var(--ink);
      font-size: clamp(2rem, 2.7vw, 2.125rem);
      font-weight: 700;
      line-height: 1.08;
      letter-spacing: -0.025em;
    }

    #mid-cta .mc-price {
      margin: var(--s4) 0 var(--s3);
      color: var(--ink);
      font-family: var(--font-display);
      font-size: clamp(2.5rem, 3.6vw, 2.75rem);
      font-weight: 700;
      line-height: 1;
      letter-spacing: -0.03em;
    }

    #mid-cta .mc-cta {
      width: 100%;
      min-height: 3.75rem;
      justify-content: center;
      text-align: center;
    }

    #mid-cta .mc-micro {
      margin: var(--s2) 0 0;
      color: var(--body);
      font-size: 0.84375rem;
      line-height: 1.45;
      text-align: center;
    }

    @media (max-width: 760px) {
      #mid-cta .mc-card {
        grid-template-columns: 1fr;
        gap: var(--s4);
        padding: var(--s3);
      }

      #mid-cta .mc-content {
        padding: 0 var(--s1) var(--s2);
      }

      #mid-cta .mc-title {
        max-width: none;
        font-size: clamp(2rem, 9vw, 2.625rem);
        line-height: 1.1;
      }

      #mid-cta .mc-price {
        margin-top: var(--s4);
        font-size: clamp(2.75rem, 13vw, 4rem);
      }

      #mid-cta .mc-cta {
        width: 100%;
      }
    }
  </style>
</section>
```