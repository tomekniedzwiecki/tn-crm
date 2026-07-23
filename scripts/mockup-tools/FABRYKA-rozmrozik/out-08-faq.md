**Siatka:** nagłówek sekcji → akordeon FAQ (maks. 860 px, 9 pozycji) → wyśrodkowany blok oferty z ceną, CTA i informacją o zwrocie.

```html
<section id="faq" class="sect-pad">
  <div class="wrap">
    <header class="fq-head reveal">
      <div class="eyebrow">BEZ DROBNEGO DRUKU</div>
      <span class="thaw"></span>
      <h2 class="h2">Pytania przed <span class="swash">zamówieniem</span>.</h2>
    </header>

    <div class="fq-list reveal">
      <details class="fq-item" open>
        <summary>
          Jak szybko rozmraża?
          <span class="fq-x" aria-hidden="true"></span>
        </summary>
        <div class="fq-a">Nie podajemy czasu rozmrażania, ponieważ dostępne materiały nie zawierają danych, które pozwalają uczciwie go zadeklarować.</div>
      </details>

      <details class="fq-item">
        <summary>
          Czy to nie kolejny gadżet?
          <span class="fq-x" aria-hidden="true"></span>
        </summary>
        <div class="fq-a">To urządzenie o jednym konkretnym zadaniu: rozmrażaniu żywności; składa się z płaskiej tacy-bazy, kopuły i zdejmowanego modułu na szczycie.</div>
      </details>

      <details class="fq-item">
        <summary>
          Ile mieści?
          <span class="fq-x" aria-hidden="true"></span>
        </summary>
        <div class="fq-a">Komora ma 4,2 L i mieści jednocześnie 4 steki lub 4 porcje ryby.</div>
      </details>

      <details class="fq-item">
        <summary>
          Co dzieje się z wodą?
          <span class="fq-x" aria-hidden="true"></span>
        </summary>
        <div class="fq-a">Wodę zbiera tacka ociekowa wykonana z ABS.</div>
      </details>

      <details class="fq-item">
        <summary>
          Co oznaczają plazma i UVC?
          <span class="fq-x" aria-hidden="true"></span>
        </summary>
        <div class="fq-a">Producent opisuje funkcje jako „Plasma Locking" oraz „UVC Antibacterial"; nie komunikujemy sterylizacji, skuteczności procentowej ani działania medycznego.</div>
      </details>

      <details class="fq-item">
        <summary>
          Jak uruchamia się urządzenie?
          <span class="fq-x" aria-hidden="true"></span>
        </summary>
        <div class="fq-a">Jednym dotknięciem panelu LED.</div>
      </details>

      <details class="fq-item">
        <summary>
          Jaki kolor otrzymam?
          <span class="fq-x" aria-hidden="true"></span>
        </summary>
        <div class="fq-a">Sprzedajemy wariant czarny — dokładnie ten, który widzisz na zdjęciach.</div>
      </details>

      <details class="fq-item">
        <summary>
          Jak mogę zapłacić?
          <span class="fq-x" aria-hidden="true"></span>
        </summary>
        <div class="fq-a">Przy odbiorze albo przez BLIK/online.</div>
      </details>

      <details class="fq-item">
        <summary>
          Czy mogę zwrócić produkt?
          <span class="fq-x" aria-hidden="true"></span>
        </summary>
        <div class="fq-a">Na zwrot masz 14 dni.</div>
      </details>
    </div>

    <div class="fq-offer reveal">
      <span class="display" data-price>289,00 zł</span>
      <a class="btn cta" data-checkout href="#zamow">Przejdź do zamówienia</a>
      <p class="fq-return">14 dni na zwrot</p>
    </div>
  </div>

  <style>
    #faq {
      background: var(--paper);
      color: var(--ink);
    }

    #faq .fq-head,
    #faq .fq-list,
    #faq .fq-offer {
      width: min(100%, 860px);
      margin-inline: auto;
    }

    #faq .fq-head {
      margin-bottom: var(--s5);
    }

    #faq .fq-head .thaw {
      display: block;
      margin-top: var(--s2);
      margin-bottom: var(--s4);
    }

    #faq .fq-head .h2 {
      margin: 0;
      max-width: 16ch;
      font-size: var(--h2-d);
    }

    #faq .fq-list {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--s2);
    }

    #faq .fq-item {
      overflow: hidden;
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    #faq .fq-item summary {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--s4);
      min-height: 72px;
      padding: var(--s3) var(--s4);
      color: var(--ink);
      font-size: 17px;
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
      outline: 1.75px solid var(--ink);
      outline-offset: -4px;
      border-radius: var(--radius-lg);
    }

    #faq .fq-x {
      position: relative;
      flex: 0 0 22px;
      width: 22px;
      height: 22px;
    }

    #faq .fq-x::before,
    #faq .fq-x::after {
      position: absolute;
      top: 50%;
      left: 1px;
      width: 20px;
      height: 1.75px;
      background: var(--ink);
      content: "";
      transform-origin: center;
      transition: transform 240ms ease;
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

    #faq .fq-item::details-content {
      display: block;
      block-size: 0;
      overflow: hidden;
      opacity: 0;
      transition:
        block-size 280ms ease,
        opacity 220ms ease,
        content-visibility 280ms allow-discrete;
    }

    #faq .fq-item[open]::details-content {
      block-size: auto;
      opacity: 1;
    }

    #faq .fq-a {
      padding: 0 var(--s4) var(--s4);
      color: var(--body);
      font-size: 17px;
      line-height: 1.65;
    }

    #faq .fq-offer {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--s3);
      margin-top: var(--s5);
      text-align: center;
    }

    #faq .fq-offer .display {
      display: block;
      color: var(--ink);
      font-size: var(--price-fs);
      line-height: 1;
    }

    #faq .fq-offer .btn.cta {
      min-width: min(100%, 320px);
    }

    #faq .fq-return {
      margin: 0;
      color: var(--body);
      font-size: 13.5px;
      line-height: 1.4;
    }

    @media (max-width: 700px) {
      #faq .fq-head .h2 {
        max-width: 12ch;
        font-size: var(--h2-m);
      }

      #faq .fq-head {
        margin-bottom: var(--s4);
      }

      #faq .fq-item summary {
        min-height: 64px;
        padding: var(--s3);
      }

      #faq .fq-a {
        padding: 0 var(--s3) var(--s3);
      }

      #faq .fq-offer {
        margin-top: var(--s4);
      }

      #faq .fq-offer .btn.cta {
        width: 100%;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #faq .fq-x::before,
      #faq .fq-x::after,
      #faq .fq-item::details-content {
        transition: none;
      }
    }
  </style>
</section>
```