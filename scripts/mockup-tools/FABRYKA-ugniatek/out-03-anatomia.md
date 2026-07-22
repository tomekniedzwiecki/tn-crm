**Siatka sekcji**
- Nagłówek: eyebrow, H2 i lead.
- Desktop: 2 kolumny — duża karta spodu z 4 calloutsami oraz prawa kolumna z profilem i makro.
- Mobile: jedna kolumna; calloutsy jako lista pod zdjęciem, karta profilu ukryta zgodnie z makietą.

```html
<section id="anatomia" class="sect-pad">
  <div class="wrap">
    <header class="an-head reveal">
      <p class="eyebrow">ANATOMIA</p>
      <h2 class="h2">Sześć głowic pod kontrolą dwóch uchwytów.</h2>
      <p class="lead">Przemyślana konstrukcja, w której każdy element ma swoje zadanie.</p>
    </header>

    <div class="an-grid">
      <figure class="an-stage reveal">
        <div class="an-stage-media">
          <img
            src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/an-spod.webp"
            width="1200"
            height="900"
            loading="lazy"
            alt="Spód urządzenia z dwoma uchwytami, sześcioma kulowymi głowicami i centralnym polem podświetlenia"
          >

          <svg class="an-wires" viewBox="0 0 1000 750" aria-hidden="true">
            <path d="M165 91 H220 V245 H272" />
            <circle cx="272" cy="245" r="3" />

            <path d="M837 89 H780 L716 164" />
            <circle cx="716" cy="164" r="3" />

            <path d="M167 665 H420 V590" />
            <circle cx="420" cy="590" r="3" />

            <path d="M676 665 H510 V445" />
            <circle cx="510" cy="445" r="3" />
          </svg>

          <div class="callout an-callout an-callout--handles">
            2 zintegrowane uchwyty
          </div>

          <div class="callout an-callout an-callout--heads">
            6 kulowych głowic
          </div>

          <div class="callout an-callout an-callout--surface">
            powierzchnia robocza do 22 300 mm²
          </div>

          <div class="callout an-callout an-callout--light">
            centralne podświetlenie 630–650 nm
          </div>
        </div>

        <figcaption class="an-mobile-callouts">
          <div class="callout an-mobile-callout">
            <span class="an-mobile-dot" aria-hidden="true"></span>
            <span class="an-mobile-line" aria-hidden="true"></span>
            <span>2 zintegrowane uchwyty</span>
          </div>

          <div class="callout an-mobile-callout">
            <span class="an-mobile-dot" aria-hidden="true"></span>
            <span class="an-mobile-line" aria-hidden="true"></span>
            <span>6 kulowych głowic</span>
          </div>

          <div class="callout an-mobile-callout">
            <span class="an-mobile-dot" aria-hidden="true"></span>
            <span class="an-mobile-line" aria-hidden="true"></span>
            <span>powierzchnia robocza do 22 300 mm²</span>
          </div>

          <div class="callout an-mobile-callout">
            <span class="an-mobile-dot" aria-hidden="true"></span>
            <span class="an-mobile-line" aria-hidden="true"></span>
            <span>centralne podświetlenie 630–650 nm</span>
          </div>
        </figcaption>
      </figure>

      <div class="an-side">
        <figure class="an-profile reveal">
          <div class="an-profile-media">
            <img
              src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/ze-profil.webp"
              width="900"
              height="540"
              loading="lazy"
              alt="Urządzenie pokazane z profilu jako płaski owal"
            >

            <figcaption class="callout an-profile-callout">
              <span>płaski owal — 11 cm</span>
              <span class="an-profile-line" aria-hidden="true"></span>
              <span class="an-profile-dot" aria-hidden="true"></span>
            </figcaption>
          </div>
        </figure>

        <figure class="an-macro reveal">
          <img
            src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/an-makro.webp"
            width="900"
            height="390"
            loading="lazy"
            alt="Zbliżenie centralnego pola z ciepłym czerwonym podświetleniem"
          >
          <figcaption>Ciepłe czerwone podświetlenie w centrum spodu</figcaption>
        </figure>
      </div>
    </div>
  </div>

  <style>
    #anatomia {
      background: var(--paper);
      color: var(--ink);
    }

    #anatomia .an-head {
      max-width: 58rem;
      margin-bottom: var(--s4);
    }

    #anatomia .an-head .eyebrow {
      margin-bottom: var(--s2);
    }

    #anatomia .an-head .h2 {
      max-width: 19ch;
      margin-bottom: var(--s2);
    }

    #anatomia .an-head .lead {
      max-width: 48rem;
      color: var(--body);
    }

    #anatomia .an-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.65fr) minmax(19rem, 1fr);
      gap: var(--s3);
      align-items: stretch;
    }

    #anatomia .an-stage,
    #anatomia .an-profile,
    #anatomia .an-macro {
      margin: 0;
      overflow: hidden;
      background: var(--card);
      border: 1px solid var(--line);
      box-shadow: var(--shadow-sm);
    }

    #anatomia .an-stage {
      padding: var(--s2);
      border-radius: var(--radius-lg);
    }

    #anatomia .an-stage-media {
      position: relative;
      overflow: hidden;
      border-radius: var(--radius-lg);
    }

    #anatomia .an-stage-media > img {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 4 / 3;
      object-fit: cover;
      border-radius: var(--radius-lg);
    }

    #anatomia .an-wires {
      position: absolute;
      inset: 0;
      z-index: 2;
      width: 100%;
      height: 100%;
      overflow: visible;
      color: var(--ink);
      pointer-events: none;
    }

    #anatomia .an-wires path {
      fill: none;
      stroke: currentColor;
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
    }

    #anatomia .an-wires circle {
      fill: currentColor;
      stroke: none;
    }

    #anatomia .an-callout {
      position: absolute;
      z-index: 3;
      max-width: 12.5rem;
      padding: 0.15rem 0.3rem;
      background: var(--card);
      color: var(--ink);
      font-size: 12.5px;
      line-height: 1.3;
    }

    #anatomia .an-callout--handles {
      top: 7%;
      left: 3%;
      width: 18%;
    }

    #anatomia .an-callout--heads {
      top: 7%;
      right: 2%;
      width: 17%;
    }

    #anatomia .an-callout--surface {
      bottom: 6%;
      left: 3%;
      width: 27%;
    }

    #anatomia .an-callout--light {
      right: 5%;
      bottom: 5%;
      width: 25%;
    }

    #anatomia .an-mobile-callouts {
      display: none;
    }

    #anatomia .an-side {
      display: grid;
      grid-template-rows: minmax(0, 1fr) auto;
      gap: var(--s3);
      min-width: 0;
    }

    #anatomia .an-profile {
      padding: var(--s2);
      border-radius: var(--radius-lg);
    }

    #anatomia .an-profile-media {
      position: relative;
      height: 100%;
      min-height: 18rem;
      overflow: hidden;
      border-radius: var(--radius-lg);
    }

    #anatomia .an-profile img {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 18rem;
      object-fit: cover;
      border-radius: var(--radius-lg);
    }

    #anatomia .an-profile-callout {
      position: absolute;
      left: var(--s2);
      right: var(--s2);
      bottom: var(--s2);
      display: grid;
      grid-template-columns: max-content minmax(2.5rem, 1fr) 4px;
      align-items: center;
      gap: 0.5rem;
      color: var(--ink);
      font-size: 12.5px;
      line-height: 1.3;
    }

    #anatomia .an-profile-line {
      display: block;
      height: 1px;
      background: var(--ink);
    }

    #anatomia .an-profile-dot {
      display: block;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--ink);
    }

    #anatomia .an-macro {
      border-radius: var(--radius-lg);
    }

    #anatomia .an-macro img {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 2.3 / 1;
      object-fit: cover;
      border-radius: var(--radius-lg);
    }

    #anatomia .an-macro figcaption {
      padding: var(--s2) var(--s3);
      color: var(--body);
      font-size: var(--body-fs);
      line-height: 1.45;
    }

    @media (max-width: 920px) {
      #anatomia .an-grid {
        grid-template-columns: minmax(0, 1fr);
      }

      #anatomia .an-side {
        grid-template-rows: auto;
      }

      #anatomia .an-profile {
        display: none;
      }
    }

    @media (max-width: 680px) {
      #anatomia .an-head {
        margin-bottom: var(--s3);
      }

      #anatomia .an-head .h2 {
        max-width: 13ch;
      }

      #anatomia .an-stage {
        padding: var(--s2);
      }

      #anatomia .an-stage-media > img {
        aspect-ratio: auto;
        object-fit: contain;
      }

      #anatomia .an-wires,
      #anatomia .an-callout {
        display: none;
      }

      #anatomia .an-mobile-callouts {
        display: grid;
        gap: var(--s2);
        padding: var(--s3) var(--s2) var(--s2);
      }

      #anatomia .an-mobile-callout {
        display: grid;
        grid-template-columns: 4px minmax(2.5rem, 24%) minmax(0, 1fr);
        align-items: center;
        gap: var(--s2);
        color: var(--ink);
        font-size: 12.5px;
        line-height: 1.35;
      }

      #anatomia .an-mobile-dot {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: var(--ink);
      }

      #anatomia .an-mobile-line {
        width: 100%;
        height: 1px;
        background: var(--ink);
      }

      #anatomia .an-macro img {
        aspect-ratio: 2 / 1;
      }

      #anatomia .an-macro figcaption {
        padding: var(--s2);
      }
    }
  </style>
</section>
```