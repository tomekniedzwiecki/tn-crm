Siatka: desktop 55/45 — po lewej foto-karta, po prawej treść sprzedażowa z CTA, chipami i wierszem zamykającym. Mobile: jeden stos w kolejności foto → treść → CTA → dwa chipy → caps.

```html
<section id="final" class="fn-final sect-pad">
  <div class="wrap">
    <div class="fn-final__grid">
      <figure class="fn-final__media reveal">
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/sc-final.webp"
          width="1536"
          height="1024"
          loading="lazy"
          alt="Rozmrozik na blacie wieczorem, obok patelnia i ręka odkładająca szczypce"
        >
      </figure>

      <div class="fn-final__content reveal">
        <div class="fn-final__intro">
          <p class="eyebrow">NA KOLEJNE 16:30</p>
          <span class="thaw" aria-hidden="true"></span>
        </div>

        <h2 class="h2 fn-final__title">
          Każdemu zdarza się zapomnieć. Dobrze mieć
          <span class="swash">plan</span>.
        </h2>

        <p class="lead fn-final__lead">
          Rozmrozik to osobny box do rozmrażania z komorą 4,2 L, startem jednym
          dotknięciem i tacką zbierającą wodę.
        </p>

        <span class="display fn-final__price" data-price>289,00 zł</span>

        <a class="btn cta fn-final__cta" data-checkout href="#zamow">
          Wracam do zamówienia
        </a>

        <div class="fn-final__chips" aria-label="Warunki zakupu">
          <div class="fn-final__chip">
            <svg
              class="fn-final__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/>
              <path d="m3.5 7.5 8.5 4.6 8.5-4.6M12 12.1V21"/>
              <path d="m7.8 5.2 8.6 4.5v3.4"/>
            </svg>
            <span>Płatność przy odbiorze lub BLIK/online</span>
          </div>

          <div class="fn-final__chip">
            <svg
              class="fn-final__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M4 8V4m0 0h4M4 4l3.2 3.2A8 8 0 1 1 4.7 15"/>
              <path d="M4.7 15H2m2.7 0v2.7"/>
            </svg>
            <span>14 dni na zwrot</span>
          </div>
        </div>

        <div class="fn-final__closing">
          <p>4,2 L · 4 STEKI</p>
          <span class="thaw" aria-hidden="true"></span>
        </div>
      </div>
    </div>
  </div>

  <style>
    #final.fn-final {
      background: var(--paper-2);
      color: var(--ink);
    }

    #final .fn-final__grid {
      display: grid;
      grid-template-columns: minmax(0, 55fr) minmax(0, 45fr);
      gap: var(--s6);
      align-items: stretch;
    }

    #final .fn-final__media {
      margin: 0;
      padding: 12px;
      overflow: hidden;
      background: var(--card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
    }

    #final .fn-final__media img {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 3 / 2;
      object-fit: cover;
      border-radius: var(--radius-sm);
    }

    #final .fn-final__content {
      display: flex;
      min-width: 0;
      flex-direction: column;
      justify-content: center;
      padding-block: var(--s3);
    }

    #final .fn-final__intro .eyebrow {
      margin: 0;
    }

    #final .fn-final__intro .thaw,
    #final .fn-final__closing .thaw {
      display: block;
      width: 100%;
      margin-top: var(--s2);
    }

    #final .fn-final__title {
      margin: var(--s4) 0 0;
      font-size: var(--h2-d);
    }

    #final .fn-final__lead {
      max-width: 38rem;
      margin: var(--s3) 0 0;
      color: var(--body);
      font-size: 17px;
    }

    #final .fn-final__price {
      display: block;
      margin-top: var(--s4);
      color: var(--ink);
      font-size: var(--price-fs);
      font-weight: 700;
      line-height: 1;
    }

    #final .fn-final__cta {
      display: flex;
      width: 100%;
      margin-top: var(--s3);
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    #final .fn-final__chips {
      display: grid;
      grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
      gap: var(--s2);
      margin-top: var(--s3);
    }

    #final .fn-final__chip {
      display: flex;
      min-width: 0;
      min-height: 64px;
      align-items: center;
      gap: var(--s2);
      padding: var(--s2) var(--s3);
      color: var(--ink);
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      font-size: 14px;
      line-height: 1.35;
    }

    #final .fn-final__icon {
      width: 28px;
      height: 28px;
      flex: 0 0 auto;
      color: var(--ink);
    }

    #final .fn-final__closing {
      width: 100%;
      margin-top: auto;
      padding-top: var(--s5);
    }

    #final .fn-final__closing p {
      margin: 0;
      color: var(--body);
      font-size: 13px;
      font-weight: 700;
      line-height: 1.3;
      letter-spacing: 0.12em;
    }

    @media (max-width: 767px) {
      #final .fn-final__grid {
        grid-template-columns: 1fr;
        gap: var(--s4);
      }

      #final .fn-final__media {
        padding: 12px;
      }

      #final .fn-final__media img {
        height: 40vh;
        min-height: 280px;
        aspect-ratio: 3 / 2;
      }

      #final .fn-final__content {
        padding-block: 0;
      }

      #final .fn-final__title {
        margin-top: var(--s3);
        font-size: var(--h2-m);
      }

      #final .fn-final__lead {
        margin-top: var(--s3);
        font-size: 17px;
      }

      #final .fn-final__price {
        margin-top: var(--s3);
      }

      #final .fn-final__cta {
        width: 100%;
      }

      #final .fn-final__chips {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: var(--s1);
      }

      #final .fn-final__chip {
        min-height: 76px;
        padding: var(--s2);
        gap: var(--s1);
        font-size: 13px;
      }

      #final .fn-final__icon {
        width: 25px;
        height: 25px;
      }

      #final .fn-final__closing {
        margin-top: 0;
        padding-top: var(--s4);
      }
    }
  </style>
</section>
```