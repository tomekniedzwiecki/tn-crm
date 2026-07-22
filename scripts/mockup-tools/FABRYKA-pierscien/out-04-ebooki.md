**Siatka:** Desktop — 2 kolumny 55/45%, zdjęcie po lewej przez całą wysokość, treść i ikony po prawej, wyrównane pionowo do środka. Mobile — 1 kolumna: eyebrow + H2 → zdjęcie → body → 3 ikony.

```html
<section id="ebooki" class="eb-section sect-pad">
  <div class="wrap eb-grid">
    <div class="eb-media reveal">
      <img
        class="eb-image"
        src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/skrolik/sceny/sc-ebook.webp"
        width="1200"
        height="1200"
        loading="lazy"
        alt="Dłoń obsługująca Skrolika przed tabletem z otwartym ebookiem"
      >

      <svg class="sig eb-sig" viewBox="0 0 64 64" aria-hidden="true">
        <path d="M26 43 A15 15 0 0 1 26 21"></path>
        <path d="M20 49 A23 23 0 0 1 20 15"></path>
        <path d="M14 55 A31 31 0 0 1 14 9"></path>
      </svg>
    </div>

    <p class="eyebrow eb-eyebrow reveal">EBOOKI</p>

    <h2 class="h2 eb-title reveal">
      Jeszcze jedna strona — jednym kliknięciem
    </h2>

    <p class="eb-body reveal">
      Kartkuj ebooki kciukiem, gdy telefon albo tablet stoi przed Tobą.
    </p>

    <div class="eb-features reveal" aria-label="Funkcje przydatne podczas czytania ebooków">
      <div class="eb-feature">
        <span class="eb-icon" aria-hidden="true">
          <svg viewBox="0 0 48 48">
            <path d="M7 11.5c6-2 11.5-.8 17 3.2v25c-5.5-4-11-5.2-17-3.2z"></path>
            <path d="M41 11.5c-6-2-11.5-.8-17 3.2v25c5.5-4 11-5.2 17-3.2z"></path>
          </svg>
        </span>
        <span class="eb-label">Wygodne czytanie</span>
      </div>

      <div class="eb-feature">
        <span class="eb-icon" aria-hidden="true">
          <svg viewBox="0 0 48 48">
            <path d="M24 7v34"></path>
            <path d="m17 14 7-7 7 7"></path>
            <path d="m17 34 7 7 7-7"></path>
          </svg>
        </span>
        <span class="eb-label">Pionowe kartkowanie</span>
      </div>

      <div class="eb-feature">
        <span class="eb-icon" aria-hidden="true">
          <svg viewBox="0 0 48 48">
            <path d="M18 41V25.5a3 3 0 0 1 6 0V31"></path>
            <path d="M24 31v-8a3 3 0 0 1 6 0v8"></path>
            <path d="M30 31v-5a3 3 0 0 1 6 0v8"></path>
            <path d="M36 34v-3a3 3 0 0 1 6 0v6c0 3.5-1.3 6.2-3.8 8H23.5L18 41"></path>
            <path d="M21 19v-7a6 6 0 0 1 12 0v8"></path>
            <rect x="19" y="17" width="16" height="7" rx="2"></rect>
            <circle cx="27" cy="20.5" r="1.5"></circle>
          </svg>
        </span>
        <span class="eb-label">Klik kciukiem</span>
      </div>
    </div>
  </div>

  <style scoped>
    .eb-section {
      overflow: hidden;
      background: var(--paper-2);
      color: var(--ink);
    }

    .eb-grid {
      display: grid;
      grid-template-columns: minmax(0, 11fr) minmax(0, 9fr);
      grid-template-areas:
        "media eyebrow"
        "media title"
        "media body"
        "media features";
      column-gap: var(--s6);
      align-items: center;
    }

    .eb-media {
      position: relative;
      grid-area: media;
      overflow: hidden;
      border-radius: var(--radius-lg);
    }

    .eb-image {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: var(--radius-lg);
    }

    .eb-sig {
      position: absolute;
      z-index: 2;
      top: 40%;
      left: 38%;
      width: 18%;
      height: auto;
      pointer-events: none;
    }

    .eb-sig path {
      fill: none;
      stroke: var(--cta);
      stroke-width: 1.5px;
      stroke-linecap: round;
      opacity: 0.55;
    }

    .eb-eyebrow {
      grid-area: eyebrow;
      align-self: end;
      margin: 0 0 var(--s3);
    }

    .eb-title {
      grid-area: title;
      align-self: start;
      max-width: 13ch;
      margin: 0;
      font-size: var(--h2-d);
    }

    .eb-body {
      grid-area: body;
      align-self: start;
      max-width: 37rem;
      margin: var(--s4) 0 0;
      color: var(--body);
      font-size: 17px;
      line-height: 1.65;
    }

    .eb-features {
      grid-area: features;
      align-self: start;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--s3);
      margin-top: var(--s5);
    }

    .eb-feature {
      display: grid;
      justify-items: center;
      align-content: start;
      gap: var(--s2);
      min-width: 0;
      text-align: center;
    }

    .eb-icon {
      display: grid;
      width: 76px;
      aspect-ratio: 1;
      place-items: center;
      border: 1px solid var(--line);
      border-radius: 50%;
    }

    .eb-icon svg {
      display: block;
      width: 42px;
      height: 42px;
      fill: none;
      stroke: var(--ink);
      stroke-width: 1.5px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .eb-label {
      max-width: 11ch;
      color: var(--body);
      font-size: 12px;
      line-height: 1.35;
    }

    @media (max-width: 760px) {
      .eb-grid {
        grid-template-columns: minmax(0, 1fr);
        grid-template-areas:
          "eyebrow"
          "title"
          "media"
          "body"
          "features";
        row-gap: 0;
      }

      .eb-eyebrow {
        margin-bottom: var(--s2);
      }

      .eb-title {
        max-width: 15ch;
        font-size: var(--h2-m);
      }

      .eb-media {
        width: 100%;
        margin-top: var(--s4);
      }

      .eb-body {
        margin-top: var(--s4);
      }

      .eb-features {
        gap: var(--s2);
        margin-top: var(--s4);
      }

      .eb-icon {
        width: 68px;
      }

      .eb-icon svg {
        width: 36px;
        height: 36px;
      }
    }
  </style>
</section>
```