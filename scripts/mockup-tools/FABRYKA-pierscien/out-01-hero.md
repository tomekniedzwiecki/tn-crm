**Siatka:** desktop — 2 kolumny 55/45, tekst i akcje po lewej, pionowa foto-karta po prawej; wyrównanie centralne, gap `--s5`. Mobile — 1 kolumna: H1 → lead → foto → CTA → microcopy.

```html
<section id="hero" class="hr-hero sect-pad">
  <div class="wrap hr-grid">
    <h1 class="display hr-title reveal">
      Telefon stoi.<br>
      Ty przewijasz<br>
      kciukiem.
    </h1>

    <p class="lead hr-lead reveal">
      Skrolik to mały pierścień-pilot Bluetooth: pionowe przewijanie, kartkowanie ebooków i zdalna migawka — zakładasz na palec i klikasz kciukiem
    </p>

    <figure class="hr-media reveal">
      <img
        src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/skrolik/sceny/sc-hero.webp"
        alt="Skrolik założony na palec podczas zdalnego przewijania telefonu"
        width="1100"
        height="1650"
        loading="eager"
        fetchpriority="high"
      >
      <svg class="sig hr-sig" viewBox="0 0 64 64" aria-hidden="true">
        <path d="M38 24 A12 12 0 0 0 38 40"></path>
        <path d="M43 18 A20 20 0 0 0 43 46"></path>
        <path d="M48 12 A28 28 0 0 0 48 52"></path>
      </svg>
    </figure>

    <div class="hr-actions reveal">
      <a class="btn cta" data-checkout href="#zamow">Zamawiam Skrolika</a>
      <p class="hr-micro">Płatność online lub przy odbiorze · 14 dni na zwrot</p>
    </div>
  </div>

  <style scoped>
    .hr-hero {
      min-height: 78vh;
      overflow: hidden;
      background: var(--paper);
      color: var(--ink);
    }

    .hr-grid {
      display: grid;
      grid-template-columns: minmax(0, 55fr) minmax(0, 45fr);
      grid-template-areas:
        "title media"
        "lead media"
        "actions media";
      column-gap: var(--s5);
      row-gap: var(--s3);
      align-items: center;
      min-height: 78vh;
    }

    .hr-title {
      grid-area: title;
      align-self: end;
      max-width: 11ch;
      margin: 0;
      color: var(--ink);
      font-size: var(--h1-d);
      line-height: 1.02;
      text-wrap: balance;
    }

    .hr-lead {
      grid-area: lead;
      align-self: center;
      max-width: 34rem;
      margin: 0;
      color: var(--body);
      font-size: 17px;
      line-height: 1.6;
    }

    .hr-media {
      position: relative;
      grid-area: media;
      align-self: center;
      justify-self: end;
      width: min(100%, calc(78vh * 2 / 3));
      max-height: 78vh;
      margin: 0;
      overflow: hidden;
      aspect-ratio: 2 / 3;
      border-radius: var(--radius-lg);
      background: var(--paper-2);
      box-shadow: var(--shadow-md);
    }

    .hr-media img {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: var(--radius-lg);
      object-fit: cover;
    }

    .hr-sig {
      position: absolute;
      top: 28%;
      left: 30%;
      width: 34%;
      height: auto;
      pointer-events: none;
    }

    .hr-sig path {
      fill: none;
      stroke: var(--cta);
      stroke-width: 1.5;
      stroke-linecap: round;
      opacity: 0.55;
      vector-effect: non-scaling-stroke;
    }

    .hr-actions {
      grid-area: actions;
      align-self: start;
      width: min(100%, 30rem);
    }

    .hr-actions .btn.cta {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 54px;
      width: 100%;
      padding-inline: var(--s4);
      text-align: center;
    }

    .hr-micro {
      margin: var(--s2) 0 0;
      color: var(--body);
      font-size: 13.5px;
      line-height: 1.45;
      text-align: center;
    }

    @media (max-width: 760px) {
      .hr-hero {
        min-height: auto;
      }

      .hr-grid {
        grid-template-columns: minmax(0, 1fr);
        grid-template-areas:
          "title"
          "lead"
          "media"
          "actions";
        gap: var(--s3);
        min-height: auto;
        align-items: start;
      }

      .hr-title {
        align-self: auto;
        max-width: 100%;
        font-size: var(--h1-m);
        line-height: 1.04;
      }

      .hr-lead {
        max-width: none;
        line-height: 1.5;
      }

      .hr-media {
        justify-self: center;
        width: min(100%, calc(46svh * 4 / 5));
        max-height: 46svh;
        aspect-ratio: 4 / 5;
      }

      .hr-media img {
        object-position: center;
      }

      .hr-sig {
        top: 25%;
        left: 29%;
        width: 36%;
      }

      .hr-actions {
        width: 100%;
      }

      .hr-actions .btn.cta {
        width: 100%;
      }
    }
  </style>
</section>
```