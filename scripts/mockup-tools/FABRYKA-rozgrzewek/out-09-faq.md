Siatka: nagłówek → akordeon 8 pozycji (pierwsza otwarta) → cena i CTA → informacja o zwrocie. Mobile: 1 kolumna.

```html
<section id="faq" class="fq-section">
  <div class="wrap sect-pad">
    <header class="fq-head reveal">
      <h2 class="h2">Zanim zamówisz — konkretnie i bez <span class="swash">przesady</span>.</h2>
    </header>

    <div class="fq-card reveal">
      <details class="fq-item" open>
        <summary>
          Czy masażer grzeje bardzo mocno?
          <span class="fq-ic" aria-hidden="true"></span>
        </summary>
        <div class="fq-a">Nie. To delikatny ciepły okład, a nie intensywne grzanie jak od żelazka. Jeśli szukasz bardzo wysokiej temperatury, ten produkt może nie odpowiadać Twoim oczekiwaniom.</div>
      </details>

      <details class="fq-item">
        <summary>
          Czy intensywność będzie dla mnie wystarczająca?
          <span class="fq-ic" aria-hidden="true"></span>
        </summary>
        <div class="fq-a">Wibracje, podgrzewanie i tryb EMS mają po 9 poziomów, ale odczucie intensywności jest indywidualne. Wśród opinii pojawia się również głos, że ktoś chciałby mocniejszego działania.</div>
      </details>

      <details class="fq-item">
        <summary>
          Czy rączka jest długa?
          <span class="fq-ic" aria-hidden="true"></span>
        </summary>
        <div class="fq-a">Nie podajemy wymiarów, ponieważ nie mamy potwierdzonych danych. Pokazujemy rzeczywisty kształt produktu na zdjęciach, a wśród opinii pojawia się uwaga, że przydałaby się dłuższa rączka.</div>
      </details>

      <details class="fq-item">
        <summary>
          Jak sprawdzę ustawiony poziom?
          <span class="fq-ic" aria-hidden="true"></span>
        </summary>
        <div class="fq-a">Poziom od 1 do 9 pokazuje okrągły wyświetlacz LED. Czerwony wskaźnik oznacza grzanie, niebieski wibracje, a zielony tryb EMS.</div>
      </details>

      <details class="fq-item">
        <summary>
          Jak długo działa po naładowaniu?
          <span class="fq-ic" aria-hidden="true"></span>
        </summary>
        <div class="fq-a">Według opisu ładowanie trwa około 3 godzin, a czas pracy wynosi około 50 minut. Urządzenie wyłącza się automatycznie po 30 minutach.</div>
      </details>

      <details class="fq-item">
        <summary>
          Jaki kolor otrzymam?
          <span class="fq-ic" aria-hidden="true"></span>
        </summary>
        <div class="fq-a">Sprzedajemy wyłącznie granatowy wariant Blue widoczny na zdjęciach. W checkoutcie nie ma wyboru koloru.</div>
      </details>

      <details class="fq-item">
        <summary>
          Czy mogę zapłacić przy odbiorze?
          <span class="fq-ic" aria-hidden="true"></span>
        </summary>
        <div class="fq-a">Tak. Dostępna jest płatność przy odbiorze oraz BLIK lub płatność online.</div>
      </details>

      <details class="fq-item">
        <summary>
          Czy mogę zwrócić produkt?
          <span class="fq-ic" aria-hidden="true"></span>
        </summary>
        <div class="fq-a">Tak. Masz 14 dni na odstąpienie od umowy.</div>
      </details>
    </div>

    <div class="fq-offer reveal">
      <span class="display fq-price" data-price>84,90 zł</span>
      <a class="btn cta fq-cta" data-checkout href="#zamow">Przejdź do zamówienia — 84,90 zł</a>
      <span class="fq-return">14 dni na zwrot</span>
    </div>
  </div>

  <style>
    #faq.fq-section {
      background: var(--paper);
      color: var(--ink);
    }

    #faq .fq-head {
      width: 100%;
      max-width: 860px;
      margin-inline: auto;
      margin-bottom: var(--s4);
      text-align: center;
    }

    #faq .fq-head .h2 {
      margin: 0;
      color: var(--ink);
      font-size: var(--h2-d);
    }

    #faq .fq-card {
      width: 100%;
      max-width: 860px;
      margin-inline: auto;
      overflow: hidden;
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    #faq .fq-item {
      margin: 0;
      background: var(--card);
    }

    #faq .fq-item + .fq-item {
      border-top: 1px solid var(--line);
    }

    #faq .fq-item summary {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--s3);
      min-height: 68px;
      padding: var(--s3) var(--s4);
      color: var(--ink);
      font-size: 20px;
      font-weight: 700;
      line-height: 1.3;
      cursor: pointer;
      list-style: none;
    }

    #faq .fq-item summary::-webkit-details-marker {
      display: none;
    }

    #faq .fq-item summary::marker {
      content: "";
      font-size: 0;
    }

    #faq .fq-item summary:focus-visible {
      outline: 2px solid var(--ink);
      outline-offset: -4px;
      border-radius: var(--radius-sm);
    }

    #faq .fq-ic {
      position: relative;
      flex: 0 0 20px;
      width: 20px;
      height: 20px;
      color: var(--ink);
      transition: transform 180ms ease;
    }

    #faq .fq-ic::before,
    #faq .fq-ic::after {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 18px;
      height: 1.75px;
      background: var(--ink);
      border-radius: var(--radius-sm);
      content: "";
      transform: translate(-50%, -50%);
      transform-origin: center;
      transition: opacity 180ms ease, transform 180ms ease;
    }

    #faq .fq-ic::after {
      transform: translate(-50%, -50%) rotate(90deg);
    }

    #faq .fq-item[open] .fq-ic {
      transform: rotate(180deg);
    }

    #faq .fq-item[open] .fq-ic::after {
      opacity: 0;
      transform: translate(-50%, -50%) rotate(0deg);
    }

    #faq .fq-a {
      max-width: 760px;
      padding: 0 var(--s4) var(--s4);
      color: var(--body);
      font-size: 17px;
      line-height: 1.65;
    }

    #faq .fq-offer {
      display: flex;
      width: 100%;
      max-width: 620px;
      margin: var(--s4) auto 0;
      flex-direction: column;
      align-items: center;
      gap: var(--s2);
      text-align: center;
    }

    #faq .fq-price {
      color: var(--ink);
      font-size: var(--price-fs);
      line-height: 1;
    }

    #faq .fq-cta {
      width: 100%;
      justify-content: center;
      text-align: center;
    }

    #faq .fq-return {
      color: var(--body);
      font-size: 13.5px;
      line-height: 1.4;
    }

    @media (max-width: 700px) {
      #faq .fq-head {
        text-align: left;
      }

      #faq .fq-head .h2 {
        font-size: var(--h2-m);
      }

      #faq .fq-item summary {
        min-height: 62px;
        padding: var(--s3);
        font-size: 18px;
      }

      #faq .fq-a {
        padding: 0 var(--s3) var(--s3);
      }

      #faq .fq-offer {
        max-width: 100%;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #faq .fq-ic,
      #faq .fq-ic::before,
      #faq .fq-ic::after {
        transition: none;
      }
    }
  </style>
</section>
```