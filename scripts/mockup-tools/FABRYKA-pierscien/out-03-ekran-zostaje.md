**Siatka:** nagłówek wyśrodkowany nad sekcją; poniżej desktopowo 2 równe kolumny z układem zdjęcie → podpis. Mobile: 1 kolumna, kolejno karta → podpis → karta → podpis.

```html
<section id="03-ekran-zostaje" class="ez-section sect-pad">
  <div class="wrap">
    <h2 class="h2 ez-heading reveal">
      Nie sięgaj do ekranu po każdy kolejny fragment
    </h2>

    <div class="ez-grid">
      <article class="ez-item reveal">
        <div class="ez-photo">
          <figure class="ez-figure">
            <img
              src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/skrolik/sceny/sc-kanapa.webp"
              width="1536"
              height="1024"
              loading="lazy"
              alt="Osoba przewijająca treści na telefonie za pomocą Skrolika spod koca"
            >
          </figure>

          <svg class="sig ez-sig ez-sig--sofa" viewBox="0 0 64 64" aria-hidden="true">
            <path d="M35 26a8 8 0 0 1 0 12"></path>
            <path d="M39 21a14 14 0 0 1 0 22"></path>
            <path d="M43 16a20 20 0 0 1 0 32"></path>
          </svg>
        </div>

        <p class="ez-caption">Scrollujesz spod koca — telefon stoi obok</p>
      </article>

      <article class="ez-item reveal">
        <div class="ez-photo">
          <figure class="ez-figure">
            <img
              src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/skrolik/sceny/sc-kuchnia.webp"
              width="1536"
              height="1024"
              loading="lazy"
              alt="Osoba przewijająca przepis na tablecie za pomocą Skrolika"
            >
          </figure>

          <svg class="sig ez-sig ez-sig--kitchen" viewBox="0 0 64 64" aria-hidden="true">
            <path d="M35 26a8 8 0 0 1 0 12"></path>
            <path d="M39 21a14 14 0 0 1 0 22"></path>
            <path d="M43 16a20 20 0 0 1 0 32"></path>
          </svg>
        </div>

        <p class="ez-caption">Przepis przewijasz, nie dotykając ekranu</p>
      </article>
    </div>
  </div>

  <style>
    [id="03-ekran-zostaje"] {
      background: var(--paper-2);
    }

    [id="03-ekran-zostaje"] .ez-heading {
      max-width: 900px;
      margin: 0 auto var(--s6);
      color: var(--ink);
      text-align: center;
    }

    [id="03-ekran-zostaje"] .ez-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--s5);
      align-items: start;
    }

    [id="03-ekran-zostaje"] .ez-item {
      min-width: 0;
    }

    [id="03-ekran-zostaje"] .ez-photo {
      position: relative;
      overflow: hidden;
      border-radius: var(--radius-lg);
      background: var(--card);
      box-shadow: var(--shadow-sm);
    }

    [id="03-ekran-zostaje"] .ez-figure {
      margin: 0;
    }

    [id="03-ekran-zostaje"] .ez-figure img {
      display: block;
      width: 100%;
      height: auto;
      border-radius: var(--radius-lg);
    }

    [id="03-ekran-zostaje"] .ez-caption {
      margin: var(--s2) 0 0;
      color: var(--body);
      font-size: 14px;
      line-height: 1.45;
      text-align: center;
    }

    [id="03-ekran-zostaje"] .ez-sig {
      position: absolute;
      z-index: 1;
      width: 64px;
      height: 64px;
      fill: none;
      stroke: var(--cta);
      stroke-width: 1.5px;
      stroke-linecap: round;
      opacity: 0.55;
      pointer-events: none;
    }

    [id="03-ekran-zostaje"] .ez-sig--sofa {
      left: 36%;
      top: 51%;
    }

    [id="03-ekran-zostaje"] .ez-sig--kitchen {
      left: 42%;
      top: 48%;
    }

    @media (max-width: 720px) {
      [id="03-ekran-zostaje"] .ez-heading {
        margin-bottom: var(--s5);
      }

      [id="03-ekran-zostaje"] .ez-grid {
        grid-template-columns: 1fr;
        gap: var(--s4);
      }

      [id="03-ekran-zostaje"] .ez-caption {
        margin-top: var(--s2);
      }

      [id="03-ekran-zostaje"] .ez-sig {
        width: 56px;
        height: 56px;
      }
    }
  </style>
</section>
```