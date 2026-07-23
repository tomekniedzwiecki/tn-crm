Siatka: eyebrow + pasek powtórzeń → H2 → trzy kafelki metod → zdanie-most.

```html
<section id="problem" class="pb-problem sect-pad">
  <div class="wrap">
    <header class="pb-problem__header reveal">
      <p class="eyebrow">ZNASZ TO?</p>
      <span class="reps" aria-hidden="true">
        <i></i><i></i><i></i><i></i><i></i>
      </span>
      <h2 class="h2">
        Mata, karnet, aplikacja — i tak się to
        <span class="swash">rzuca</span>.
      </h2>
    </header>

    <div class="pb-problem__grid reveal">
      <article class="pb-problem__card">
        <svg class="pb-problem__icon" viewBox="0 0 96 72" aria-hidden="true">
          <path d="M29 27 61 13c7-3 15 1 18 8 3 8-1 16-8 19L39 54"></path>
          <path d="M29 27c-10 4-15 14-11 24 4 9 14 14 24 10"></path>
          <path d="M28 34c-6 2-9 9-6 15 2 6 9 9 15 6 6-2 9-9 6-15-2-6-9-9-15-6Z"></path>
          <path d="M30 40c-3 1-4 4-3 7 1 3 4 4 7 3 3-1 4-4 3-7-1-3-4-4-7-3Z"></path>
          <path d="m42 61 31 7c3 1 6 0 8-3l11-15c2-3 1-6-3-7l-18-3"></path>
        </svg>
        <p>Brzuszki na macie → boli kręgosłup i szyja, a nuda wygrywa.</p>
      </article>

      <article class="pb-problem__card">
        <svg class="pb-problem__icon" viewBox="0 0 96 72" aria-hidden="true">
          <rect x="15" y="12" width="66" height="48" rx="8"></rect>
          <path d="M25 31h10M61 25h10M61 35h10M61 45h10"></path>
          <path d="M35 24v26M47 24v26"></path>
          <path d="M35 28h12M35 46h12"></path>
          <path d="M25 31v12M53 31v12M21 34v6M57 34v6"></path>
        </svg>
        <p>Karnet na siłownię → drogo, daleko, brak czasu.</p>
      </article>

      <article class="pb-problem__card">
        <svg class="pb-problem__icon" viewBox="0 0 112 72" aria-hidden="true">
          <path d="M8 39h23M59 39h13M15 33v12M66 33v12"></path>
          <ellipse cx="45" cy="39" rx="17" ry="27"></ellipse>
          <ellipse cx="45" cy="39" rx="10" ry="21"></ellipse>
          <path d="m38 24 6 15-7 13M52 25l-7 14 7 13"></path>
          <rect x="78" y="8" width="27" height="56" rx="6"></rect>
          <path d="M87 14h9M85 53h13M86 45V35h5v10M92 45V29h5v16"></path>
        </svg>
        <p>Ab-roller i aplikacje → za trudne na start, porzucone po tygodniu.</p>
      </article>
    </div>

    <p class="pb-problem__bridge lead reveal">
      Dlatego robisz to u siebie, po swojemu — na sprzęcie, który reguluje trudność.
    </p>
  </div>

  <style>
    .pb-problem {
      background: var(--paper-2);
      color: var(--ink);
    }

    .pb-problem .pb-problem__header {
      max-width: 980px;
      margin-inline: auto;
      text-align: center;
    }

    .pb-problem .eyebrow {
      margin: 0;
    }

    .pb-problem .reps {
      margin: var(--s2) auto var(--s3);
    }

    .pb-problem .pb-problem__header .h2 {
      margin: 0;
      color: var(--ink);
      font-family: var(--font-display);
      font-size: var(--h2-d);
      font-stretch: 125%;
      line-height: 1.08;
      text-wrap: balance;
    }

    .pb-problem .pb-problem__grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--s3);
      margin-top: var(--s5);
    }

    .pb-problem .pb-problem__card {
      display: flex;
      min-width: 0;
      min-height: 250px;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding: var(--s4);
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      background: var(--card);
      box-shadow: var(--shadow-sm);
      text-align: center;
    }

    .pb-problem .pb-problem__icon {
      display: block;
      width: 112px;
      height: 88px;
      margin-bottom: var(--s3);
      color: var(--ink);
      fill: none;
      stroke: currentColor;
      stroke-width: 1.75;
      stroke-linecap: round;
      stroke-linejoin: round;
      flex: 0 0 auto;
    }

    .pb-problem .pb-problem__card p {
      margin: 0;
      color: var(--body);
      font-family: var(--font-text);
      font-size: 17px;
      font-weight: 600;
      line-height: 1.55;
      text-wrap: balance;
    }

    .pb-problem .pb-problem__bridge {
      max-width: 60ch;
      margin: var(--s4) auto 0;
      color: var(--body);
      font-size: 17px;
      line-height: 1.6;
      text-align: center;
      text-wrap: balance;
    }

    @media (max-width: 760px) {
      .pb-problem .pb-problem__header .h2 {
        font-size: var(--h2-m);
      }

      .pb-problem .pb-problem__grid {
        grid-template-columns: 1fr;
        gap: var(--s2);
        margin-top: var(--s4);
      }

      .pb-problem .pb-problem__card {
        min-height: 0;
        padding: var(--s4);
      }

      .pb-problem .pb-problem__icon {
        width: 96px;
        height: 72px;
        margin-bottom: var(--s2);
      }
    }
  </style>
</section>
```