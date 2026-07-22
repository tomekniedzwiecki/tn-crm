Siatka: kontener `.wrap` max. 860px → nagłówek z tekstem i 2 pillami obok na desktopie → poniżej jednokolumnowy akordeon 7 kart; na mobile nagłówek, pille i akordeon układają się pionowo.

```html
<section id="faq" class="fq-section sect-pad">
  <div class="wrap fq-wrap">
    <header class="fq-head reveal">
      <div class="fq-heading">
        <p class="eyebrow">FAQ</p>
        <h2 class="h2">Pytania przed zakupem</h2>
        <p class="lead">Wszystko, co warto wiedzieć przed zamówieniem.</p>
      </div>

      <div class="fq-pills" aria-label="Informacje o płatności i zwrocie">
        <div class="pill fq-pill">
          <svg class="fq-pill-icon" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M5.5 10.5 16 4.5l10.5 6v12L16 28.5l-10.5-6z"></path>
            <path d="M5.5 10.5 16 16.5l10.5-6M16 16.5v12"></path>
          </svg>
          <span>Płatność<br>przy odbiorze</span>
        </div>

        <div class="pill fq-pill">
          <svg class="fq-pill-icon" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M26.5 12.5A11 11 0 0 0 7.3 8.8L5 12"></path>
            <path d="m5 12 .4-5.1M5 12l5-.7"></path>
            <path d="M5.5 19.5a11 11 0 0 0 19.2 3.7L27 20"></path>
            <path d="m27 20-.4 5.1M27 20l-5 .7"></path>
          </svg>
          <span>14 dni<br>na zwrot</span>
        </div>
      </div>
    </header>

    <div class="fq-list reveal">
      <details class="fq-item" open>
        <summary>
          <span>Jak używać go w garnku lub woku?</span>
          <span class="fq-x" aria-hidden="true"></span>
        </summary>
        <div class="fq-a">
          <div class="fq-a-first">
            <img
              src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/jr-A.webp"
              width="120"
              height="120"
              loading="lazy"
              alt="Koszyk do smażenia unoszony nad wokiem"
            >
            <p>Rozłóż koszyk, włóż do garnka lub woka z olejem i smaż frytki, nuggetsy czy placki bezpośrednio w nim. Po smażeniu unieś całość za spięte uchwyty — cała porcja wychodzi jednym ruchem.</p>
          </div>
        </div>
      </details>

      <details class="fq-item">
        <summary>
          <span>Jak zawiesić go na rancie garnka?</span>
          <span class="fq-x" aria-hidden="true"></span>
        </summary>
        <div class="fq-a">
          <p>Korona z zygzakowatych drutów opiera się o krawędź garnka. Zawieś koszyk po wyjęciu z oleju — ocieka prosto do garnka, a Ty masz wolne ręce.</p>
        </div>
      </details>

      <details class="fq-item">
        <summary>
          <span>Jak złożyć go na płasko?</span>
          <span class="fq-x" aria-hidden="true"></span>
        </summary>
        <div class="fq-a">
          <p>Po umyciu złóż koszyk — zwija się w płaski dysk, który wsuniesz do szuflady jak pokrywkę.</p>
        </div>
      </details>

      <details class="fq-item">
        <summary>
          <span>Czy działa jak durszlak?</span>
          <span class="fq-x" aria-hidden="true"></span>
        </summary>
        <div class="fq-a">
          <p>Tak. Odcedzisz w nim makaron i warzywa albo opłuczesz owoce pod bieżącą wodą — woda swobodnie przepływa przez siatkę.</p>
        </div>
      </details>

      <details class="fq-item">
        <summary>
          <span>Jak go myć?</span>
          <span class="fq-x" aria-hidden="true"></span>
        </summary>
        <div class="fq-a">
          <p>Gładka stal nierdzewna nie trzyma resztek. Wystarczy opłukać koszyk pod bieżącą wodą i osuszyć.</p>
        </div>
      </details>

      <details class="fq-item">
        <summary>
          <span>Jak zapłacić przy odbiorze?</span>
          <span class="fq-x" aria-hidden="true"></span>
        </summary>
        <div class="fq-a">
          <p>W zamówieniu wybierz opcję «Przy odbiorze (za pobraniem)» — płacisz kurierowi przy dostawie.</p>
        </div>
      </details>

      <details class="fq-item">
        <summary>
          <span>Jak działa zwrot 14 dni?</span>
          <span class="fq-x" aria-hidden="true"></span>
        </summary>
        <div class="fq-a">
          <p>Masz 14 dni na zwrot bez podawania przyczyny. Napisz do nas, odeślij produkt i otrzymasz zwrot pieniędzy.</p>
        </div>
      </details>
    </div>
  </div>

  <style>
    #faq.fq-section {
      color: var(--ink);
      background: var(--paper);
    }

    #faq .fq-wrap {
      max-width: 860px;
    }

    #faq .fq-head {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: var(--s5);
      align-items: end;
      margin-bottom: var(--s6);
    }

    #faq .fq-heading {
      min-width: 0;
    }

    #faq .fq-heading .eyebrow {
      margin: 0 0 var(--s2);
    }

    #faq .fq-heading .h2 {
      margin: 0;
      color: var(--ink);
      font-size: var(--h2-d);
    }

    #faq .fq-heading .lead {
      max-width: 540px;
      margin: var(--s2) 0 0;
      color: var(--body);
      font-size: var(--body-fs);
    }

    #faq .fq-pills {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: var(--s2);
    }

    #faq .fq-pill {
      display: inline-flex;
      align-items: center;
      gap: var(--s2);
      min-height: 64px;
      padding: var(--s2) var(--s3);
      color: var(--ink);
      background: var(--paper-2);
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      font-size: 15px;
      line-height: 1.25;
      white-space: nowrap;
    }

    #faq .fq-pill-icon {
      flex: 0 0 auto;
      width: 30px;
      height: 30px;
      fill: none;
      stroke: var(--ink);
      stroke-width: 1.5px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    #faq .fq-list {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--s3);
    }

    #faq .fq-item {
      overflow: hidden;
      color: var(--ink);
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    #faq .fq-item summary {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--s4);
      min-height: 72px;
      padding: var(--s3) var(--s4);
      color: var(--ink);
      font-size: 18px;
      font-weight: 700;
      line-height: 1.35;
      cursor: pointer;
      list-style: none;
    }

    #faq .fq-item summary::-webkit-details-marker {
      display: none;
    }

    #faq .fq-item summary::marker {
      content: "";
    }

    #faq .fq-item summary:focus-visible {
      outline: 2px solid var(--ink);
      outline-offset: -4px;
      border-radius: var(--radius-lg);
    }

    #faq .fq-x {
      position: relative;
      flex: 0 0 auto;
      width: 24px;
      height: 24px;
      color: var(--ink);
    }

    #faq .fq-x::before,
    #faq .fq-x::after {
      position: absolute;
      top: 50%;
      left: 2px;
      width: 20px;
      height: 1.5px;
      content: "";
      background: var(--ink);
      transform-origin: center;
      transition: transform 220ms ease;
    }

    #faq .fq-x::before {
      transform: rotate(0deg);
    }

    #faq .fq-x::after {
      transform: rotate(90deg);
    }

    #faq .fq-item[open] .fq-x::before {
      transform: rotate(180deg);
    }

    #faq .fq-item[open] .fq-x::after {
      transform: rotate(180deg);
    }

    #faq .fq-a {
      max-height: 0;
      overflow: hidden;
      padding: 0 var(--s4);
      color: var(--body);
      font-size: var(--body-fs);
      line-height: 1.65;
      opacity: 0;
      transition:
        max-height 360ms ease,
        opacity 240ms ease,
        padding-bottom 360ms ease;
    }

    #faq .fq-item[open] .fq-a {
      max-height: 640px;
      padding-bottom: var(--s4);
      opacity: 1;
    }

    #faq .fq-a p {
      margin: 0;
    }

    #faq .fq-a-first {
      display: flex;
      align-items: center;
      gap: var(--s4);
    }

    #faq .fq-a-first img {
      flex: 0 0 120px;
      width: 120px;
      height: auto;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: var(--radius-sm);
    }

    @media (max-width: 767px) {
      #faq .fq-head {
        grid-template-columns: minmax(0, 1fr);
        gap: var(--s4);
        align-items: start;
        margin-bottom: var(--s5);
      }

      #faq .fq-heading .h2 {
        font-size: var(--h2-m);
      }

      #faq .fq-pills {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        width: 100%;
        justify-content: stretch;
      }

      #faq .fq-pill {
        min-width: 0;
        min-height: 60px;
        padding: var(--s2);
        white-space: normal;
      }

      #faq .fq-pill-icon {
        width: 28px;
        height: 28px;
      }

      #faq .fq-item summary {
        min-height: 68px;
        padding: var(--s3);
        font-size: 17px;
      }

      #faq .fq-a {
        padding-right: var(--s3);
        padding-left: var(--s3);
      }

      #faq .fq-item[open] .fq-a {
        padding-bottom: var(--s3);
      }

      #faq .fq-a-first {
        align-items: flex-start;
        gap: var(--s3);
      }
    }

    @media (max-width: 520px) {
      #faq .fq-pills {
        grid-template-columns: minmax(0, 1fr);
      }

      #faq .fq-a-first {
        flex-direction: column;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #faq .fq-a,
      #faq .fq-x::before,
      #faq .fq-x::after {
        transition: none;
      }
    }
  </style>
</section>
```