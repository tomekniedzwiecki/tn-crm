Siatka: desktop 2 kolumny 45% / 55%; po lewej nagłówek, opis i ikony, po prawej foto wyrównane centralnie. Mobile: 1 kolumna w kolejności nagłówek → foto → opis → ikony.

```html
<section id="selfie" class="se-selfie sect-pad">
  <div class="wrap se-grid">
    <header class="se-head reveal">
      <span class="eyebrow se-eyebrow">selfie i nagrywanie</span>
      <h2 class="h2">Klik i gotowe ujęcie</h2>
    </header>

    <figure class="se-photo reveal">
      <img
        src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/skrolik/sceny/sc-selfie.webp"
        width="1536"
        height="1024"
        loading="lazy"
        alt="Dłoń naciskająca pierścień do zdalnego wykonania zdjęcia telefonem ustawionym w kadrze"
      >

      <svg class="sig se-sig" viewBox="0 0 64 64" aria-hidden="true">
        <path d="M28 42 A14 14 0 0 1 42 28"></path>
        <path d="M20 48 A24 24 0 0 1 48 20"></path>
        <path d="M12 54 A34 34 0 0 1 54 12"></path>
      </svg>
    </figure>

    <div class="se-copy reveal">
      <p class="se-body">
        Ustaw telefon, stań w kadrze i zrób zdjęcie albo start nagrania — kciukiem, z pierścienia.
      </p>

      <div class="se-icons" aria-label="Zdjęcia, nagrywanie i obsługa pierścieniem">
        <span class="se-icon">
          <svg viewBox="0 0 48 48" role="img" aria-label="Migawka aparatu">
            <circle cx="24" cy="24" r="15"></circle>
            <path d="M24 9l7 12"></path>
            <path d="M38 18H24"></path>
            <path d="M36 32l-7-12"></path>
            <path d="M24 39l-7-12"></path>
            <path d="M10 30h14"></path>
            <path d="M12 16l7 12"></path>
          </svg>
        </span>

        <span class="se-icon">
          <svg viewBox="0 0 48 48" role="img" aria-label="Start nagrywania">
            <circle class="se-record-dot" cx="24" cy="24" r="9"></circle>
          </svg>
        </span>

        <span class="se-icon">
          <svg viewBox="0 0 48 48" role="img" aria-label="Dłoń obsługująca pierścień">
            <path d="M17 39V24.5a2.5 2.5 0 0 1 5 0V30"></path>
            <path d="M22 30V18.5a2.5 2.5 0 0 1 5 0V29"></path>
            <path d="M27 29v-7.5a2.5 2.5 0 0 1 5 0V30"></path>
            <path d="M32 30v-5.5a2.5 2.5 0 0 1 5 0v8.8c0 4.5-3.7 8.2-8.2 8.2h-3.6c-3.1 0-5.9-1.7-7.4-4.4l-4.2-7.5a2.7 2.7 0 0 1 4.3-3.2L22 30"></path>
            <rect x="21.5" y="12" width="6" height="9" rx="2"></rect>
            <circle cx="24.5" cy="16.5" r="1.3"></circle>
          </svg>
        </span>
      </div>
    </div>
  </div>

  <style>
    .se-selfie {
      background: var(--paper-2);
      color: var(--ink);
    }

    .se-selfie .se-grid {
      display: grid;
      grid-template-columns: minmax(0, 45fr) minmax(0, 55fr);
      grid-template-areas:
        "head photo"
        "copy photo";
      column-gap: var(--s6);
      row-gap: var(--s4);
      align-items: center;
    }

    .se-selfie .se-head {
      grid-area: head;
      align-self: end;
    }

    .se-selfie .se-eyebrow {
      display: inline-flex;
      width: fit-content;
      margin-bottom: var(--s3);
      padding: var(--s1) var(--s3);
      border-radius: 999px;
      background: var(--cta);
      color: var(--cta-ink);
      font-size: 12px;
      line-height: 1.2;
      text-transform: uppercase;
    }

    .se-selfie .se-head .h2 {
      margin: 0;
      max-width: 10ch;
      font-size: var(--h2-d);
    }

    .se-selfie .se-photo {
      position: relative;
      grid-area: photo;
      width: 100%;
      margin: 0;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    .se-selfie .se-photo img {
      display: block;
      width: 100%;
      height: auto;
      border-radius: var(--radius-lg);
    }

    .se-selfie .se-sig {
      position: absolute;
      right: 29%;
      bottom: 24%;
      width: 18%;
      height: auto;
      pointer-events: none;
    }

    .se-selfie .se-sig path {
      fill: none;
      stroke: var(--cta);
      stroke-width: 1.5px;
      stroke-linecap: round;
      opacity: .55;
    }

    .se-selfie .se-copy {
      grid-area: copy;
      align-self: start;
    }

    .se-selfie .se-body {
      max-width: 35rem;
      margin: 0;
      color: var(--body);
      font-size: 17px;
      line-height: 1.65;
    }

    .se-selfie .se-icons {
      display: flex;
      flex-wrap: wrap;
      gap: var(--s3);
      margin-top: var(--s4);
    }

    .se-selfie .se-icon {
      display: grid;
      width: 72px;
      aspect-ratio: 1;
      place-items: center;
      border: 1px solid var(--line);
      border-radius: 50%;
      background: var(--card);
    }

    .se-selfie .se-icon svg {
      display: block;
      width: 44px;
      height: 44px;
      overflow: visible;
      fill: none;
      stroke: var(--ink);
      stroke-width: 1.5px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .se-selfie .se-icon .se-record-dot {
      fill: var(--cta);
      stroke: none;
    }

    @media (max-width: 760px) {
      .se-selfie .se-grid {
        grid-template-columns: minmax(0, 1fr);
        grid-template-areas:
          "head"
          "photo"
          "copy";
        gap: var(--s4);
      }

      .se-selfie .se-head .h2 {
        max-width: 12ch;
        font-size: var(--h2-m);
      }

      .se-selfie .se-photo {
        margin-top: var(--s1);
      }

      .se-selfie .se-copy {
        display: grid;
        gap: var(--s4);
      }

      .se-selfie .se-icons {
        justify-content: center;
        margin-top: 0;
      }

      .se-selfie .se-icon {
        width: 68px;
      }
    }
  </style>
</section>
```