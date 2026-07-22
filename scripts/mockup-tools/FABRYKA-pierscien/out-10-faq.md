Siatka: 1 kolumna; nagłówek i podkreślenie wyrównane do lewej, poniżej wyśrodkowana karta o szerokości 100% i max-width 880px. Mobile: układ bez zmian, karta zajmuje pełną dostępną szerokość.

```html
<section id="faq" class="fq-section sect-pad">
  <div class="wrap">
    <header class="fq-header reveal">
      <h2 class="h2">Pytania i odpowiedzi</h2>
      <span class="fq-underline" aria-hidden="true"></span>
    </header>

    <div class="fq-card reveal">
      <!--FAQ-ACCORDION-->
    </div>
  </div>

  <style scoped>
    .fq-section {
      background: var(--paper-2);
    }

    .fq-header {
      margin-bottom: var(--s5);
    }

    .fq-header .h2 {
      margin: 0;
      color: var(--ink);
      font-size: var(--h2-d);
    }

    .fq-underline {
      display: block;
      width: 44px;
      height: 3px;
      margin-top: var(--s2);
      border-radius: var(--radius-sm);
      background: var(--cta);
    }

    .fq-card {
      width: 100%;
      max-width: 880px;
      min-height: var(--s7);
      margin-inline: auto;
      overflow: hidden;
      border-radius: var(--radius-lg);
      background: var(--card);
      box-shadow: var(--shadow-sm);
    }

    @media (max-width: 767px) {
      .fq-header .h2 {
        font-size: var(--h2-m);
      }
    }
  </style>
</section>
```