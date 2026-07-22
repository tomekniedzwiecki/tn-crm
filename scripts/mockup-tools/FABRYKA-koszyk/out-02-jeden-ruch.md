**Siatka sekcji**
- H2 bez eyebrow.
- Desktop: karta A → poziomy łuk → karta B; podpisy pod zdjęciami.
- Lead wyśrodkowany.
- Dolny rząd: 2 pille + CTA.
- Mobile: karta A → podpis → pionowy łuk → karta B → podpis → lead → pille → CTA full width.

```html
<section id="jeden-ruch" class="jr-section sect-pad">
  <div class="wrap">
    <h2 class="h2 jr-title reveal">Koniec łowienia frytek sztuka po sztuce</h2>

    <div class="jr-comparison reveal">
      <figure class="jr-card jr-card-a">
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/jr-A.webp"
          width="1200"
          height="1000"
          loading="lazy"
          alt="Koszyk z frytkami zanurzony w garnku podczas smażenia"
        >
        <figcaption>Frytki smażą się w koszyku</figcaption>
      </figure>

      <div class="jr-arrow" aria-hidden="true">
        <svg class="arc jr-arc" viewBox="0 0 120 60">
          <path d="M8 45C38 18 76 14 108 31"></path>
          <path d="M99 20L108 31L94 33"></path>
        </svg>
      </div>

      <figure class="jr-card jr-card-b">
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/jr-B.webp"
          width="1200"
          height="1000"
          loading="lazy"
          alt="Uniesiony nad garnkiem koszyk z całą porcją frytek"
        >
        <figcaption>Cała porcja w górę — jednym ruchem</figcaption>
      </figure>
    </div>

    <p class="lead jr-lead reveal">
      Nic nie zostaje na dnie garnka — wyjmujesz wszystko naraz.
    </p>

    <div class="jr-actions reveal">
      <div class="jr-pills">
        <div class="pill jr-pill">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path d="M5.5 9.5 16 4l10.5 5.5v13L16 28 5.5 22.5z"></path>
            <path d="M5.5 9.5 16 15l10.5-5.5M16 15v13"></path>
          </svg>
          <span>Płatność przy odbiorze</span>
        </div>

        <div class="pill jr-pill">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path d="M7.5 10.5A11 11 0 1 1 5 19"></path>
            <path d="M7.5 5.5v5h5"></path>
          </svg>
          <span>14 dni na zwrot</span>
        </div>
      </div>

      <a class="btn cta jr-cta" data-checkout href="#zamow">
        Zamawiam Odsączek
      </a>
    </div>
  </div>

  <style>
    #jeden-ruch {
      background: var(--paper);
      color: var(--ink);
    }

    #jeden-ruch,
    #jeden-ruch * {
      box-sizing: border-box;
    }

    #jeden-ruch .jr-title {
      max-width: var(--content-w);
      margin: 0 auto var(--s5);
      color: var(--ink);
      font-size: var(--h2-d);
      text-align: center;
      text-wrap: balance;
    }

    #jeden-ruch .jr-comparison {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 72px minmax(0, 1fr);
      align-items: center;
      width: 100%;
    }

    #jeden-ruch .jr-card {
      min-width: 0;
      margin: 0;
    }

    #jeden-ruch .jr-card img {
      display: block;
      width: 100%;
      height: auto;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    #jeden-ruch .jr-card figcaption {
      margin-top: var(--s2);
      color: var(--body);
      font-size: 14px;
      line-height: 1.45;
      text-align: center;
    }

    #jeden-ruch .jr-arrow {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }

    #jeden-ruch .jr-arc {
      display: block;
      width: 68px;
      height: auto;
      overflow: visible;
      fill: none;
      stroke: var(--cta);
      stroke-width: 2px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    #jeden-ruch .jr-lead {
      max-width: var(--content-w);
      margin: var(--s5) auto 0;
      color: var(--body);
      font-size: var(--body-fs);
      text-align: center;
    }

    #jeden-ruch .jr-actions {
      display: flex;
      align-items: stretch;
      justify-content: center;
      gap: var(--s3);
      margin-top: var(--s4);
    }

    #jeden-ruch .jr-pills {
      display: flex;
      gap: var(--s3);
    }

    #jeden-ruch .jr-pill {
      display: flex;
      align-items: center;
      gap: var(--s2);
      min-height: 54px;
      padding: var(--s2) var(--s3);
      border: 1px solid var(--line);
      color: var(--body);
      background: var(--card);
      font-size: 14px;
      line-height: 1.3;
    }

    #jeden-ruch .jr-pill svg {
      flex: 0 0 auto;
      width: 30px;
      height: 30px;
      fill: none;
      stroke: var(--ink);
      stroke-width: 1.5px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    #jeden-ruch .jr-cta {
      min-height: 54px;
      padding-inline: var(--s5);
      white-space: nowrap;
    }

    @media (max-width: 760px) {
      #jeden-ruch .jr-title {
        margin-bottom: var(--s4);
        font-size: var(--h2-m);
      }

      #jeden-ruch .jr-comparison {
        grid-template-columns: minmax(0, 1fr);
        gap: 0;
      }

      #jeden-ruch .jr-card-a {
        grid-row: 1;
      }

      #jeden-ruch .jr-arrow {
        grid-row: 2;
        min-height: 70px;
      }

      #jeden-ruch .jr-card-b {
        grid-row: 3;
      }

      #jeden-ruch .jr-arc {
        width: 64px;
        transform: rotate(90deg);
        transform-origin: center;
      }

      #jeden-ruch .jr-lead {
        margin-top: var(--s4);
      }

      #jeden-ruch .jr-actions {
        flex-direction: column;
        gap: var(--s3);
      }

      #jeden-ruch .jr-pills {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--s2);
      }

      #jeden-ruch .jr-pill {
        min-width: 0;
        padding-inline: var(--s2);
      }

      #jeden-ruch .jr-cta {
        width: 100%;
      }
    }

    @media (max-width: 430px) {
      #jeden-ruch .jr-pills {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  </style>
</section>
```