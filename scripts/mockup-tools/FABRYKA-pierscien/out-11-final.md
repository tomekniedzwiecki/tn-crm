Siatka: pas edge-to-edge `--paper-3`; pośrodku karta do 760px. Wewnątrz jedna elastyczna kolumna `minmax(0, 1fr)`: packshot z sygnaturą, H2, zawijany rząd pilli, CTA i microcopy. Mobile: pełny stack, pille w jednej kolumnie, CTA 100%.

```html
<section id="final" class="fn-section sect-pad">
  <div class="wrap">
    <div class="fn-card reveal">
      <div class="fn-packshot">
        <svg class="sig fn-sig" viewBox="0 0 64 64" aria-hidden="true">
          <path d="M24 38 A12 12 0 0 1 38 24"></path>
          <path d="M17 43 A21 21 0 0 1 43 17"></path>
          <path d="M10 48 A30 30 0 0 1 48 10"></path>
        </svg>

        <img
          class="fn-image"
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/skrolik/galeria/keep2-packshot-pink.webp"
          width="600"
          height="600"
          loading="lazy"
          alt="Różowy Skrolik do pionowego przewijania, kartkowania ebooków i zdalnego robienia zdjęć"
        >
      </div>

      <h2 class="display fn-title">
        Scrolluj, kartkuj i rób zdjęcia — jednym kciukiem
      </h2>

      <div class="fn-pills" aria-label="Najważniejsze funkcje Skrolika">
        <span class="pill fn-pill">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3v18"></path>
            <path d="m8.5 6.5 3.5-3.5 3.5 3.5"></path>
            <path d="m8.5 17.5 3.5 3.5 3.5-3.5"></path>
          </svg>
          <span>Pionowy scroll</span>
        </span>

        <span class="pill fn-pill">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3.5 5.5A3.5 3.5 0 0 1 7 4h5v16H7a3.5 3.5 0 0 0-3.5 1.5z"></path>
            <path d="M20.5 5.5A3.5 3.5 0 0 0 17 4h-5v16h5a3.5 3.5 0 0 1 3.5 1.5z"></path>
          </svg>
          <span>Ebooki</span>
        </span>

        <span class="pill fn-pill">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7.5h3l1.5-2h7l1.5 2h3a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5a2 2 0 0 1 2-2z"></path>
            <circle cx="12" cy="13.5" r="3.5"></circle>
          </svg>
          <span>Zdalna migawka</span>
        </span>
      </div>

      <a class="btn cta fn-cta" data-checkout href="#zamow">Zamawiam Skrolika</a>

      <p class="fn-micro">
        Płatność online lub przy odbiorze · 14 dni na zwrot
      </p>
    </div>
  </div>

  <style>
    #final {
      box-sizing: border-box;
      width: 100%;
      background: var(--paper-3);
      color: var(--ink);
    }

    #final *,
    #final *::before,
    #final *::after {
      box-sizing: border-box;
    }

    #final .fn-card {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      justify-items: center;
      gap: var(--s4);
      width: 100%;
      max-width: 760px;
      margin-inline: auto;
      padding: var(--s5);
      overflow: hidden;
      text-align: center;
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
    }

    #final .fn-packshot {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      place-items: center;
      width: 100%;
      min-width: 0;
    }

    #final .fn-sig {
      grid-area: 1 / 1;
      align-self: center;
      justify-self: center;
      width: min(100%, 280px);
      height: auto;
      margin-inline: auto;
      z-index: 0;
      fill: none;
      stroke: var(--cta);
      stroke-width: 1.5px;
      stroke-linecap: round;
      opacity: 0.55;
    }

    #final .fn-image {
      grid-area: 1 / 1;
      display: block;
      width: 100%;
      max-width: 240px;
      height: auto;
      margin-inline: auto;
      z-index: 1;
      border-radius: var(--radius-lg);
    }

    #final .fn-title {
      max-width: 680px;
      margin: 0;
      color: var(--ink);
      font-size: var(--h2-d);
    }

    #final .fn-pills {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--s2);
      width: 100%;
      min-width: 0;
    }

    #final .fn-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--s2);
      min-width: 0;
      white-space: nowrap;
    }

    #final .fn-pill svg {
      flex: 0 0 auto;
      width: 24px;
      height: 24px;
      fill: none;
      stroke: var(--ink);
      stroke-width: 1.5px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    #final .fn-cta {
      min-height: 56px;
      padding-inline: var(--s5);
    }

    #final .fn-micro {
      margin: 0;
      color: var(--body);
      font-size: 17px;
      line-height: 1.5;
    }

    @media (max-width: 640px) {
      #final .fn-card {
        gap: var(--s3);
        padding: var(--s5);
      }

      #final .fn-title {
        font-size: var(--h2-m);
      }

      #final .fn-pills {
        flex-direction: column;
        align-items: stretch;
      }

      #final .fn-pill {
        width: 100%;
        justify-content: flex-start;
        white-space: normal;
        text-align: left;
      }

      #final .fn-cta {
        width: 100%;
      }
    }
  </style>
</section>
```