Desktop: pełna scena z copy nałożonym w dolnej lewej części; produkt pozostaje statyczny, subtelnie porusza się świetlna warstwa firanki.
Mobile: scena ~40vh → kręgi i eyebrow → H2 → opis → cena → CTA full width → redukcja ryzyka.

```html
<section id="final" class="fn-final sect-pad" aria-labelledby="fn-final-title">
  <div class="fn-final-wrap wrap">
    <div class="fn-stage">
      <figure class="fn-scene reveal">
        <picture>
          <source
            media="(max-width: 767px)"
            srcset="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozgrzewek/assets/sc-final-mobile.webp"
          >
          <img
            src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozgrzewek/assets/sc-final.webp"
            width="1536"
            height="1024"
            loading="lazy"
            alt="Granatowy masażer Rozgrzewek na stoliku obok herbaty i koca, ciepła lampa"
          >
        </picture>
        <span class="fn-curtain-breath" aria-hidden="true"></span>
      </figure>

      <div class="fn-copy reveal">
        <div class="fn-signature">
          <span class="rings-wrap">
            <svg class="rings" viewBox="0 0 88 46" aria-hidden="true" focusable="false"><path class="r-out" d="M4 44a40 40 0 0 1 80 0"/><path class="r-mid" d="M15 44a29 29 0 0 1 58 0"/><path class="r-in" d="M26 44a18 18 0 0 1 36 0"/></svg>
          </span>
          <p class="eyebrow">CIEPŁO ZATACZA KRĘGI</p>
        </div>

        <h2 id="fn-final-title" class="h2">
          Zrób miejsce na mały wieczorny <span class="swash">rytuał</span>.
        </h2>

        <p class="lead fn-description">
          Delikatne ciepło, wibracje i tryb EMS możesz ustawić na jednym z 9 poziomów i używać na wybranym obszarze ciała.
        </p>

        <p class="fn-price">
          <span class="display" data-price>84,90 zł</span>
        </p>

        <a class="btn cta fn-cta" data-checkout href="#zamow">Przejdź do zamówienia</a>

        <p class="lead fn-risk">Płatność przy odbiorze • 14 dni na zwrot</p>
      </div>
    </div>
  </div>

  <style scoped>
    .fn-final {
      overflow: hidden;
      background: var(--paper);
      color: var(--ink);
    }

    .fn-final .fn-stage {
      position: relative;
      min-height: 760px;
      overflow: hidden;
      border-radius: var(--radius-lg);
      background: var(--paper-2);
      box-shadow: var(--shadow-lg);
    }

    .fn-final .fn-scene {
      position: absolute;
      inset: 0;
      margin: 0;
      overflow: hidden;
      border-radius: var(--radius-lg);
    }

    .fn-final .fn-scene::after {
      position: absolute;
      inset: 0;
      z-index: 1;
      content: "";
      pointer-events: none;
      background: linear-gradient(
        90deg,
        var(--paper) 0%,
        var(--paper) 27%,
        transparent 66%
      );
    }

    .fn-final .fn-scene picture {
      display: block;
      width: 100%;
      height: 100%;
    }

    .fn-final .fn-scene img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      border-radius: var(--radius-lg);
    }

    .fn-final .fn-curtain-breath {
      position: absolute;
      z-index: 2;
      top: 0;
      right: 0;
      width: 18%;
      height: 58%;
      pointer-events: none;
      opacity: 0.08;
      background: var(--paper);
      transform-origin: right center;
      mask-image: linear-gradient(90deg, transparent, #000000);
      animation: fn-curtain-breathe 7s ease-in-out infinite alternate;
    }

    .fn-final .fn-copy {
      position: absolute;
      z-index: 3;
      left: var(--s6);
      bottom: var(--s6);
      width: min(49%, 610px);
    }

    .fn-final .fn-signature {
      display: flex;
      align-items: flex-end;
      gap: var(--s3);
      margin-bottom: var(--s3);
    }

    .fn-final .rings-wrap {
      display: inline-flex;
      flex: 0 0 auto;
      align-items: flex-end;
      width: 88px;
      height: 46px;
    }

    .fn-final .rings {
      display: block;
      width: 88px;
      height: 46px;
      overflow: visible;
      fill: none;
      stroke-width: 1.75px;
      stroke-linecap: round;
    }

    .fn-final .rings .r-out {
      stroke: var(--cta);
    }

    .fn-final .rings .r-mid,
    .fn-final .rings .r-in {
      stroke: var(--line);
    }

    .fn-final .fn-copy.reveal .rings path {
      stroke-dasharray: 130;
      stroke-dashoffset: 130;
    }

    .fn-final .fn-copy.reveal.in .rings path {
      stroke-dashoffset: 0;
      transition: stroke-dashoffset 800ms ease;
    }

    .fn-final .fn-copy.reveal.in .rings .r-mid {
      transition-delay: 100ms;
    }

    .fn-final .fn-copy.reveal.in .rings .r-in {
      transition-delay: 180ms;
    }

    .fn-final .eyebrow {
      margin: 0 0 3px;
      color: var(--ink);
    }

    .fn-final .h2 {
      max-width: 610px;
      margin: 0 0 var(--s3);
      color: var(--ink);
      font-size: var(--h2-d);
    }

    .fn-final .fn-description {
      max-width: 560px;
      margin: 0 0 var(--s3);
      color: var(--body);
      font-size: 17px;
    }

    .fn-final .fn-price {
      margin: 0 0 var(--s3);
    }

    .fn-final .fn-price .display {
      color: var(--ink);
      font-size: var(--price-fs);
      font-weight: 700;
      line-height: 1;
    }

    .fn-final .fn-cta {
      width: min(100%, 390px);
      margin: 0;
      text-align: center;
    }

    .fn-final .fn-risk {
      margin: var(--s2) 0 0;
      color: var(--body);
      font-size: 13.5px;
      line-height: 1.45;
    }

    @keyframes fn-curtain-breathe {
      0% {
        opacity: 0.05;
        transform: scaleX(0.96);
      }

      100% {
        opacity: 0.11;
        transform: scaleX(1.04);
      }
    }

    @media (max-width: 767px) {
      .fn-final {
        padding-top: 0;
      }

      .fn-final .fn-final-wrap {
        width: 100%;
        max-width: none;
        padding-inline: 0;
      }

      .fn-final .fn-stage {
        min-height: 0;
        overflow: visible;
        border-radius: 0;
        background: var(--paper);
        box-shadow: none;
      }

      .fn-final .fn-scene {
        position: relative;
        inset: auto;
        width: 100%;
        height: 40vh;
        min-height: 320px;
        border-radius: 0;
      }

      .fn-final .fn-scene::after {
        display: none;
      }

      .fn-final .fn-scene img {
        border-radius: 0;
        object-position: center 53%;
      }

      .fn-final .fn-curtain-breath {
        width: 22%;
        height: 66%;
      }

      .fn-final .fn-copy {
        position: relative;
        left: auto;
        bottom: auto;
        width: auto;
        padding: var(--s5) var(--s3) 0;
      }

      .fn-final .fn-signature {
        gap: var(--s2);
        margin-bottom: var(--s3);
      }

      .fn-final .rings-wrap,
      .fn-final .rings {
        width: 72px;
        height: auto;
      }

      .fn-final .h2 {
        max-width: none;
        font-size: var(--h2-m);
      }

      .fn-final .fn-description {
        max-width: none;
      }

      .fn-final .fn-cta {
        display: block;
        width: 100%;
        max-width: none;
      }

      .fn-final .fn-risk {
        text-align: center;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .fn-final .fn-curtain-breath {
        animation: none;
      }

      .fn-final .fn-copy.reveal .rings path,
      .fn-final .fn-copy.reveal.in .rings path {
        stroke-dashoffset: 0;
        transition: none;
      }
    }
  </style>
</section>
```