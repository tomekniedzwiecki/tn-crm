Siatka: nagłówek sekcji → 2×2 karty funkcji z kwadratowymi zdjęciami → nota informacyjna. Mobile: jedna kolumna, sloty zdjęć 96 px.

```html
<section id="funkcje" class="fk sect-pad" aria-labelledby="fk-title">
  <div class="wrap">
    <header class="fk-head reveal">
      <p class="eyebrow">CO WIEMY O URZĄDZENIU</p>
      <span class="thaw"></span>
      <h2 class="h2" id="fk-title">
        Funkcje nazwane bez cudownych <span class="swash">obietnic</span>.
      </h2>
    </header>

    <div class="fk-grid reveal">
      <article class="fk-card">
        <div class="fk-media">
          <img
            src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/fn-modul.webp"
            width="128"
            height="128"
            loading="lazy"
            alt="Moduł z okrągłą kratką na kopule"
          >
        </div>
        <div class="fk-copy">
          <h3 class="display">Plasma Locking</h3>
          <p>Moduł generatora plazmy opisany przez producenta jako „Plasma Locking”.</p>
        </div>
      </article>

      <article class="fk-card">
        <div class="fk-media">
          <img
            src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/fn-plyta.webp"
            width="128"
            height="128"
            loading="lazy"
            alt="Perforowana płyta pod kopułą"
          >
        </div>
        <div class="fk-copy">
          <h3 class="display">UVC Antibacterial</h3>
          <p>Lampa UVC o działaniu antybakteryjnym według producenta; bez obietnic medycznych.</p>
        </div>
      </article>

      <article class="fk-card">
        <div class="fk-media">
          <img
            src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/fn-panel.webp"
            width="128"
            height="128"
            loading="lazy"
            alt="Panel dotykowy LED z owalnym przyciskiem"
          >
        </div>
        <div class="fk-copy">
          <h3 class="display">Panel dotykowy LED</h3>
          <p>Owalny przycisk i panel dotykowy umożliwiają start jednym dotknięciem.</p>
        </div>
      </article>

      <article class="fk-card">
        <div class="fk-media">
          <img
            src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/fn-kopula.webp"
            width="128"
            height="128"
            loading="lazy"
            alt="Krawędź kopuły i baza urządzenia"
          >
        </div>
        <div class="fk-copy">
          <h3 class="display">USB-C</h3>
          <p>Urządzenie jest ładowane przez USB-C.</p>
        </div>
      </article>
    </div>

    <aside class="fk-note reveal" aria-label="Nota informacyjna">
      <svg
        class="fk-note-icon"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9"></circle>
        <path d="M12 10.5v6"></path>
        <path d="M12 7.5h.01"></path>
      </svg>
      <p>
        Nie podajemy mocy, skuteczności procentowej ani czasu rozmrażania, ponieważ dostępne
        materiały nie zawierają takich danych.
      </p>
    </aside>
  </div>

  <style>
    #funkcje.fk {
      background: var(--paper);
      color: var(--ink);
    }

    #funkcje .fk-head {
      margin-bottom: var(--s5);
    }

    #funkcje .fk-head .eyebrow {
      margin: 0;
    }

    #funkcje .fk-head .thaw {
      display: block;
      margin-top: var(--s2);
      margin-bottom: var(--s4);
    }

    #funkcje .fk-head .h2 {
      max-width: var(--content-w);
      margin: 0;
      color: var(--ink);
      font-size: var(--h2-d);
    }

    #funkcje .fk-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--s3);
    }

    #funkcje .fk-card {
      display: grid;
      grid-template-columns: 128px minmax(0, 1fr);
      align-items: center;
      gap: var(--s4);
      min-width: 0;
      padding: var(--s3);
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    #funkcje .fk-media {
      width: 128px;
      aspect-ratio: 1;
      overflow: hidden;
      border-radius: var(--radius-sm);
      background: var(--paper-2);
    }

    #funkcje .fk-media img {
      display: block;
      width: 100%;
      height: auto;
      border-radius: var(--radius-lg);
    }

    #funkcje .fk-copy {
      min-width: 0;
    }

    #funkcje .fk-copy .display {
      margin: 0 0 var(--s2);
      color: var(--ink);
      font-size: 20px;
      font-weight: 700;
      line-height: 1.2;
    }

    #funkcje .fk-copy p {
      margin: 0;
      color: var(--body);
      font-size: 17px;
      line-height: 1.55;
    }

    #funkcje .fk-note {
      display: flex;
      align-items: flex-start;
      gap: var(--s3);
      margin-top: var(--s3);
      padding: var(--s3) var(--s4);
      color: var(--ink);
      background: var(--paper-2);
      border-radius: var(--radius-lg);
    }

    #funkcje .fk-note-icon {
      flex: 0 0 auto;
      color: var(--ink);
    }

    #funkcje .fk-note p {
      margin: 0;
      color: var(--body);
      font-size: 17px;
      line-height: 1.55;
    }

    @media (max-width: 700px) {
      #funkcje .fk-head {
        margin-bottom: var(--s4);
      }

      #funkcje .fk-head .h2 {
        font-size: var(--h2-m);
      }

      #funkcje .fk-grid {
        grid-template-columns: minmax(0, 1fr);
      }

      #funkcje .fk-card {
        grid-template-columns: 96px minmax(0, 1fr);
        gap: var(--s3);
      }

      #funkcje .fk-media {
        width: 96px;
      }

      #funkcje .fk-note {
        padding: var(--s3);
      }
    }
  </style>
</section>
```