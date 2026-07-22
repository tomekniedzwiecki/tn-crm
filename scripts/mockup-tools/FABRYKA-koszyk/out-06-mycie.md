**Siatka:** nagłówek na całą szerokość → desktop: tekst + łuk / zdjęcie główne / makro → pełny pas 3 cech. Mobile: tekst → zdjęcie główne → makro → 3 wiersze cech.

```html
<section id="mycie" class="my-section sect-pad">
  <div class="wrap">
    <header class="my-header reveal">
      <div class="eyebrow my-eyebrow">
        <svg class="my-eyebrow-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M12 2.75C9.7 6.45 5.75 10.35 5.75 15a6.25 6.25 0 0 0 12.5 0C18.25 10.35 14.3 6.45 12 2.75Z"></path>
          <path d="M9 15.25a3.25 3.25 0 0 0 3.25 3.25"></path>
        </svg>
        <span>PROSTE MYCIE</span>
      </div>

      <h2 class="h2 my-title">Mycie? Opłucz i gotowe</h2>
    </header>

    <div class="my-grid">
      <div class="my-copy reveal">
        <p class="my-text">
          Gładka stal nierdzewna nie trzyma resztek —<br>
          wystarczy opłukać pod bieżącą wodą.
        </p>

        <svg class="arc my-arc" viewBox="0 0 120 60" aria-hidden="true" focusable="false">
          <path d="M8 49C35 16 72 10 108 36"></path>
          <path d="M99 35L108 36L104 27"></path>
        </svg>
      </div>

      <figure class="my-card my-card-main reveal">
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/myc-glowna.webp"
          width="1200"
          height="900"
          loading="lazy"
          alt="Pusty stalowy kosz opłukiwany pod bieżącą wodą z kranu"
        >
      </figure>

      <figure class="my-card my-card-macro reveal">
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/myc-makro.webp"
          width="900"
          height="900"
          loading="lazy"
          alt="Zbliżenie stalowego splotu i obrzeża kosza"
        >
      </figure>
    </div>
  </div>

  <div class="my-band">
    <div class="wrap my-band-grid reveal">
      <div class="my-feature">
        <svg class="my-feature-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
          <path d="M16 3.5c3.1 2.5 6.3 3.5 10 3.8v8.1c0 6.2-3.7 10.5-10 13.1-6.3-2.6-10-6.9-10-13.1V7.3c3.7-.3 6.9-1.3 10-3.8Z"></path>
        </svg>
        <span>Stal nierdzewna</span>
      </div>

      <div class="my-feature">
        <svg class="my-feature-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
          <circle cx="16" cy="16" r="11.5"></circle>
          <path d="M10 8.2v15.6M16 4.5v23M22 8.2v15.6"></path>
        </svg>
        <span>Składa się na płasko</span>
      </div>

      <div class="my-feature">
        <svg class="my-feature-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
          <path d="M16 3.5C12.9 8.4 7.5 13.9 7.5 20a8.5 8.5 0 0 0 17 0c0-6.1-5.4-11.6-8.5-16.5Z"></path>
          <path d="M11.5 20.2a4.8 4.8 0 0 0 4.8 4.8"></path>
        </svg>
        <span>Mycie pod bieżącą wodą</span>
      </div>
    </div>
  </div>

  <style>
    #mycie {
      background: var(--paper);
      color: var(--ink);
      overflow: hidden;
    }

    #mycie .my-header {
      margin-bottom: var(--s5);
    }

    #mycie .my-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: var(--s2);
      margin-bottom: var(--s2);
    }

    #mycie .my-eyebrow-icon {
      width: 24px;
      height: 24px;
      fill: none;
      stroke: var(--ink);
      stroke-width: 1.5px;
      stroke-linecap: round;
      stroke-linejoin: round;
      flex: 0 0 auto;
    }

    #mycie .my-title {
      max-width: 18ch;
      margin: 0;
      font-size: var(--h2-d);
    }

    #mycie .my-grid {
      display: grid;
      grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.35fr) minmax(220px, 0.75fr);
      align-items: start;
      gap: var(--s4);
    }

    #mycie .my-copy {
      align-self: center;
      padding-right: var(--s2);
    }

    #mycie .my-text {
      margin: 0;
      color: var(--body);
      font-size: var(--body-fs);
      line-height: 1.65;
    }

    #mycie .my-arc {
      display: block;
      width: 120px;
      height: 60px;
      margin-top: var(--s3);
      margin-left: auto;
      fill: none;
      stroke: var(--cta);
      stroke-width: 2px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    #mycie .my-card {
      margin: 0;
      overflow: hidden;
      border-radius: var(--radius-lg);
      background: var(--card);
      box-shadow: var(--shadow-sm);
    }

    #mycie .my-card img {
      display: block;
      width: 100%;
      height: auto;
      border-radius: var(--radius-lg);
    }

    #mycie .my-band {
      width: 100%;
      margin-top: var(--s6);
      background: var(--paper-2);
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
    }

    #mycie .my-band-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    #mycie .my-feature {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--s3);
      min-width: 0;
      padding: var(--s4);
      color: var(--ink);
      font-size: var(--body-fs);
      line-height: 1.35;
    }

    #mycie .my-feature + .my-feature {
      border-left: 1px solid var(--line);
    }

    #mycie .my-feature-icon {
      width: 36px;
      height: 36px;
      flex: 0 0 36px;
      fill: none;
      stroke: var(--ink);
      stroke-width: 1.5px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    @media (max-width: 900px) {
      #mycie .my-header {
        margin-bottom: var(--s4);
      }

      #mycie .my-title {
        font-size: var(--h2-m);
      }

      #mycie .my-grid {
        grid-template-columns: 1fr;
        gap: var(--s4);
      }

      #mycie .my-copy {
        order: 1;
        padding-right: 0;
      }

      #mycie .my-card-main {
        order: 2;
      }

      #mycie .my-card-macro {
        order: 3;
      }

      #mycie .my-text br {
        display: none;
      }

      #mycie .my-arc {
        margin-top: var(--s2);
        margin-right: 0;
      }

      #mycie .my-band {
        margin-top: var(--s5);
      }

      #mycie .my-band-grid {
        grid-template-columns: 1fr;
      }

      #mycie .my-feature {
        justify-content: flex-start;
        padding: var(--s3) 0;
      }

      #mycie .my-feature + .my-feature {
        border-top: 1px solid var(--line);
        border-left: 0;
      }
    }
  </style>
</section>
```