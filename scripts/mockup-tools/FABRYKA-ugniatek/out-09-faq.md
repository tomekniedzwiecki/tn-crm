**Siatka:** nagłówek sekcji nad akordeonem; desktop — 2 kolumny po 5 pytań, mobile — 1 kolumna, 10 pytań w kolejności.

```html
<section id="faq" class="fq-section sect-pad">
  <div class="wrap">
    <header class="fq-head reveal">
      <p class="eyebrow">FAQ</p>
      <h2 class="h2">Pytania przed zakupem</h2>
    </header>

    <div class="fq-grid reveal">
      <div class="fq-col">
        <details class="fq-item">
          <summary>
            Czym różnią się dwie formy użycia?
            <span class="fq-x" aria-hidden="true"></span>
          </summary>
          <div class="fq-a">Ugniatka używasz na dwa sposoby: chwytasz za oba uchwyty i dociskasz głowice tam, gdzie sięgasz (kark, barki, uda, łydki), albo kładziesz go na sofie czy podłodze i opierasz się plecami lub lędźwiami — wtedy masuje ciężar ciała.</div>
        </details>

        <details class="fq-item">
          <summary>
            Na jakich partiach ciała mogę go używać?
            <span class="fq-x" aria-hidden="true"></span>
          </summary>
          <div class="fq-a">Docisk oburącz: kark, barki, uda, łydki. Forma leżąca: plecy i lędźwie.</div>
        </details>

        <details class="fq-item">
          <summary>
            Jak zmieniam tryby i intensywność?
            <span class="fq-x" aria-hidden="true"></span>
          </summary>
          <div class="fq-a">Na bocznym panelu masz wyświetlacz i trzy przyciski. Wybierasz jeden z 9 trybów (P1–P9) i jeden z 9 poziomów intensywności.</div>
        </details>

        <details class="fq-item">
          <summary>
            Ile trwa praca i ładowanie?
            <span class="fq-x" aria-hidden="true"></span>
          </summary>
          <div class="fq-a">Akumulator 2000 mAh wystarcza na do 2 h pracy. Ładowanie przez USB trwa około 3,5 h.</div>
        </details>

        <details class="fq-item">
          <summary>
            Jak działa auto-stop?
            <span class="fq-x" aria-hidden="true"></span>
          </summary>
          <div class="fq-a">Urządzenie samo wyłącza się po 10 minutach sesji — możesz je po prostu włączyć ponownie.</div>
        </details>
      </div>

      <div class="fq-col">
        <details class="fq-item">
          <summary>
            Czym jest czerwone podświetlenie?
            <span class="fq-x" aria-hidden="true"></span>
          </summary>
          <div class="fq-a">W centrum spodu znajduje się pole diod świecących ciepłym czerwonym światłem (630–650 nm). To cecha konstrukcji — przyjemny, ciepły akcent podczas masażu.</div>
        </details>

        <details class="fq-item">
          <summary>
            Co znajdę w zestawie?
            <span class="fq-x" aria-hidden="true"></span>
          </summary>
          <div class="fq-a">Masażer, kabel USB do ładowania, instrukcję obsługi i pudełko.</div>
        </details>

        <details class="fq-item">
          <summary>
            Jakie są wymiary i waga?
            <span class="fq-x" aria-hidden="true"></span>
          </summary>
          <div class="fq-a">28 × 16,5 × 11 cm i 1113 g — płaska forma, którą łatwo położyć na sofie albo zabrać w torbie.</div>
        </details>

        <details class="fq-item">
          <summary>
            Jak zapłacić przy odbiorze?
            <span class="fq-x" aria-hidden="true"></span>
          </summary>
          <div class="fq-a">W zamówieniu wybierz opcję «Przy odbiorze (za pobraniem)» — płacisz kurierowi przy dostawie.</div>
        </details>

        <details class="fq-item">
          <summary>
            Jak działa zwrot 14 dni?
            <span class="fq-x" aria-hidden="true"></span>
          </summary>
          <div class="fq-a">Masz 14 dni na zwrot bez podawania przyczyny. Napisz do nas, odeślij produkt i otrzymasz zwrot pieniędzy.</div>
        </details>
      </div>
    </div>
  </div>

  <style>
    #faq {
      background: var(--paper);
      color: var(--ink);
    }

    #faq .fq-head {
      max-width: 48rem;
      margin-bottom: var(--s5);
    }

    #faq .fq-head .eyebrow {
      margin-bottom: var(--s2);
    }

    #faq .fq-head .h2 {
      margin: 0;
    }

    #faq .fq-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: start;
      gap: var(--s3);
    }

    #faq .fq-col {
      display: grid;
      gap: var(--s3);
    }

    #faq .fq-item {
      overflow: hidden;
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      color: var(--ink);
      box-shadow: var(--shadow-sm);
    }

    #faq .fq-item summary {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: var(--s3);
      min-height: 4.75rem;
      padding: var(--s3) var(--s4);
      color: var(--ink);
      font-size: clamp(1rem, 1.4vw, 1.125rem);
      font-weight: 600;
      line-height: 1.35;
      cursor: pointer;
      list-style: none;
    }

    #faq .fq-item summary::-webkit-details-marker {
      display: none;
    }

    #faq .fq-item summary:focus-visible {
      outline: 2px solid var(--ink);
      outline-offset: -3px;
      border-radius: var(--radius-lg);
    }

    #faq .fq-x {
      position: relative;
      display: block;
      width: 1.25rem;
      height: 1.25rem;
      flex: 0 0 auto;
      color: var(--ink);
      transition: transform 280ms ease;
    }

    #faq .fq-x::before,
    #faq .fq-x::after {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 1.25rem;
      height: 1.5px;
      background: currentColor;
      content: "";
      transform: translate(-50%, -50%);
      transform-origin: center;
      transition: transform 280ms ease, opacity 220ms ease;
    }

    #faq .fq-x::after {
      transform: translate(-50%, -50%) rotate(90deg);
    }

    #faq .fq-item[open] .fq-x {
      transform: rotate(180deg);
    }

    #faq .fq-item[open] .fq-x::after {
      opacity: 0;
      transform: translate(-50%, -50%) rotate(90deg) scaleX(0);
    }

    #faq .fq-a {
      max-height: 0;
      overflow: hidden;
      padding: 0 var(--s4);
      border-top: 1px solid transparent;
      color: var(--body);
      font-size: var(--body-fs);
      line-height: 1.65;
      opacity: 0;
      transition:
        max-height 420ms ease,
        padding 320ms ease,
        border-color 320ms ease,
        opacity 260ms ease;
    }

    #faq .fq-item[open] .fq-a {
      max-height: 24rem;
      padding-top: var(--s3);
      padding-bottom: var(--s4);
      border-top-color: var(--line);
      opacity: 1;
    }

    @media (max-width: 767px) {
      #faq .fq-head {
        margin-bottom: var(--s4);
      }

      #faq .fq-grid {
        grid-template-columns: 1fr;
      }

      #faq .fq-item summary {
        min-height: 4.5rem;
        padding: var(--s3);
      }

      #faq .fq-a {
        padding-right: var(--s3);
        padding-left: var(--s3);
      }

      #faq .fq-item[open] .fq-a {
        padding-bottom: var(--s3);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #faq .fq-x,
      #faq .fq-x::after,
      #faq .fq-a {
        transition: none;
      }
    }
  </style>
</section>
```