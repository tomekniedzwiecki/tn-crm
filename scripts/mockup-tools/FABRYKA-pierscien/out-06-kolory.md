**Siatka:** desktop — 4 kolumny; szeroki kafel zajmuje 2 kolumny i 2 wiersze, obok układ 2 × 2 z trzema zdjęciami i kartą spec. Mobile — 2 kolumny: szeroki kafel, dwa małe zdjęcia w rzędzie, następnie pełnoszerokie kafle klipsa i specyfikacji. Linia oferty pod gridem, wyśrodkowana.

```html
<section id="kolory" class="ko-section sect-pad">
  <div class="wrap">
    <h2 class="h2 ko-title reveal">Mniejszy niż kciuk. I w trzech kolorach.</h2>

    <!--GALERIA-->
    <div class="ko-gallery reveal">
      <figure class="ko-tile ko-photo ko-photo--wide">
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/skrolik/galeria/keep1-trojpak.webp"
          width="800"
          height="800"
          loading="lazy"
          alt="Trzy kolory pierścienia: czarny, kremowy i różowy"
        >
      </figure>

      <figure class="ko-tile ko-photo ko-photo--pink">
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/skrolik/galeria/keep2-packshot-pink.webp"
          width="600"
          height="600"
          loading="lazy"
          alt="Różowy Skrolik — trzy przyciski"
        >
      </figure>

      <figure class="ko-tile ko-photo ko-photo--port">
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/skrolik/galeria/keep3-detal-port.webp"
          width="700"
          height="700"
          loading="lazy"
          alt="Wpuszczone gniazdo ładowania w pierścieniu"
        >
      </figure>

      <figure class="ko-tile ko-photo ko-photo--clip">
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/skrolik/galeria/keep4-detal-klips.webp"
          width="430"
          height="430"
          loading="lazy"
          alt="Otwarty klips na palcu — kciuk na przyciskach"
        >
      </figure>

      <div class="ko-tile ko-spec">
        <svg
          class="ko-spec-drawing"
          viewBox="0 0 180 150"
          role="img"
          aria-label="Rysunek wymiarowy klinowatego pierścienia Skrolik"
        >
          <g class="ko-device">
            <path d="M49 39L119 27Q128 26 132 34L134 51Q135 59 127 63L116 67L113 105Q112 116 102 120L92 122Q84 123 84 114L86 101Q88 88 78 83Q68 78 61 88L53 100Q48 108 41 102L35 96Q30 90 33 80L39 61Z"/>
            <path d="M49 39Q45 42 46 48Q47 55 55 57L119 47Q128 46 132 39"/>
            <path d="M39 61Q47 67 58 65L127 54"/>
            <path d="M61 88Q70 73 84 78Q101 84 99 101L97 116"/>
            <ellipse cx="67" cy="44" rx="10" ry="4"/>
            <ellipse cx="91" cy="40" rx="10" ry="4"/>
            <ellipse cx="115" cy="36" rx="10" ry="4"/>
          </g>

          <g class="ko-dim">
            <path d="M27 39V113"/>
            <path d="M23 43L27 37L31 43"/>
            <path d="M23 109L27 115L31 109"/>

            <path d="M45 132L104 126"/>
            <path d="M50 128L43 132L51 135"/>
            <path d="M99 123L106 126L100 130"/>

            <path d="M111 126L151 104"/>
            <path d="M116 126L109 127L113 120"/>
            <path d="M145 103L153 103L149 110"/>
          </g>
        </svg>

        <div class="ko-spec-copy">
          <p class="display ko-size">3,0 × 2,8 × 1,3 cm</p>
          <p class="ko-spec-text">Zakładasz i nie przeszkadza</p>
        </div>
      </div>
    </div>

    <p class="display ko-offer reveal">
      <span>W tej ofercie: <b style="color:var(--cta)">kolor różowy</b></span>
      <svg class="ko-swatch" viewBox="0 0 14 14" width="14" height="14" aria-hidden="true">
        <circle cx="7" cy="7" r="7" fill="var(--cta)" opacity=".45"/>
      </svg>
    </p>
  </div>

  <style scoped>
    #kolory.ko-section {
      background: var(--paper-2);
      color: var(--ink);
    }

    #kolory .ko-title {
      max-width: var(--content-w);
      margin-inline: auto;
      margin-bottom: var(--s5);
      text-align: center;
    }

    #kolory .ko-gallery {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      grid-template-rows: repeat(2, minmax(0, 1fr));
      gap: var(--s2);
      width: 100%;
      max-width: 860px;
      margin-inline: auto;
    }

    #kolory .ko-tile {
      min-width: 0;
      margin: 0;
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      background: var(--card);
      box-shadow: var(--shadow-sm);
    }

    #kolory .ko-photo {
      display: flex;
      align-items: center;
      justify-content: center;
      aspect-ratio: 1 / 1;
    }

    #kolory .ko-photo--wide {
      grid-column: 1 / span 2;
      grid-row: 1 / span 2;
      max-height: 420px;
    }

    #kolory .ko-photo--pink {
      grid-column: 3;
      grid-row: 1;
    }

    #kolory .ko-photo--port {
      grid-column: 4;
      grid-row: 1;
    }

    #kolory .ko-photo--clip {
      grid-column: 3;
      grid-row: 2;
    }

    #kolory .ko-photo img {
      display: block;
      width: 100%;
      height: auto;
      max-height: 100%;
      box-sizing: border-box;
      padding: var(--s2);
      border-radius: var(--radius-lg);
      object-fit: contain;
    }

    #kolory .ko-spec {
      grid-column: 4;
      grid-row: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      aspect-ratio: 1 / 1;
      padding: var(--s2);
      text-align: center;
    }

    #kolory .ko-spec-drawing {
      display: block;
      width: 100%;
      height: auto;
      max-height: 132px;
    }

    #kolory .ko-device {
      fill: none;
      stroke: var(--ink);
      stroke-width: 1.5px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    #kolory .ko-dim {
      fill: none;
      stroke: var(--line);
      stroke-width: 1.5px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    #kolory .ko-spec-copy {
      margin-top: var(--s1);
    }

    #kolory .ko-size {
      margin: 0;
      color: var(--ink);
      font-size: 20px;
      line-height: 1.2;
    }

    #kolory .ko-spec-text {
      margin: var(--s1) 0 0;
      color: var(--body);
      font-size: 17px;
      line-height: 1.4;
    }

    #kolory .ko-offer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--s2);
      margin: var(--s4) auto 0;
      color: var(--ink);
      font-size: 18px;
      line-height: 1.4;
      text-align: center;
    }

    #kolory .ko-swatch {
      display: block;
      flex: 0 0 14px;
    }

    @media (max-width: 700px) {
      #kolory .ko-title {
        margin-bottom: var(--s4);
      }

      #kolory .ko-gallery {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        grid-template-rows: auto;
        max-width: 100%;
      }

      #kolory .ko-photo--wide {
        grid-column: 1 / -1;
        grid-row: auto;
        max-height: 420px;
      }

      #kolory .ko-photo--pink,
      #kolory .ko-photo--port {
        grid-column: auto;
        grid-row: auto;
      }

      #kolory .ko-photo--clip {
        grid-column: 1 / -1;
        grid-row: auto;
        aspect-ratio: 2 / 1;
      }

      #kolory .ko-spec {
        grid-column: 1 / -1;
        grid-row: auto;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        display: grid;
        aspect-ratio: auto;
        min-height: 210px;
        padding: var(--s3);
        text-align: left;
      }

      #kolory .ko-spec-drawing {
        max-height: 180px;
      }

      #kolory .ko-spec-copy {
        margin-top: 0;
        padding-left: var(--s2);
      }

      #kolory .ko-offer {
        margin-top: var(--s3);
      }
    }
  </style>
</section>
```