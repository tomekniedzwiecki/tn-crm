Siatka: nagłówek → jednokolumnowy FAQ (9 kart, max 980px) → panel końcowy: hasło / parametry / cena / CTA; na mobile pełny stack.

```html
<section id="final" class="fn-final sect-pad">
  <div class="wrap">
    <header class="fn-head reveal">
      <p class="eyebrow">FAQ</p>
      <span class="reps" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
      <h2 class="h2 display">Pytania przed <span class="swash">zamówieniem</span>.</h2>
    </header>

    <div class="fn-list reveal">
      <details class="fn-item" open>
        <summary>Jaki kolor otrzymam?<span class="fn-x" aria-hidden="true"></span></summary>
        <div class="fn-a">Sprzedajemy wyłącznie wariant biało-różowy; w checkoutcie nie ma wyboru koloru.</div>
      </details>

      <details class="fn-item">
        <summary>Jak reguluje się trudność?<span class="fn-x" aria-hidden="true"></span></summary>
        <div class="fn-a">Masz 2 kąty nachylenia i 5 wysokości; wyższe ustawienie oznacza większą trudność.</div>
      </details>

      <details class="fn-item">
        <summary>Jaki jest udźwig?<span class="fn-x" aria-hidden="true"></span></summary>
        <div class="fn-a">Deklarowany udźwig to 440 lbs, czyli około 200 kg.</div>
      </details>

      <details class="fn-item">
        <summary>Czy można ją złożyć?<span class="fn-x" aria-hidden="true"></span></summary>
        <div class="fn-a">Tak, konstrukcja jest składana i korzysta z zawleczki zabezpieczającej.</div>
      </details>

      <details class="fn-item">
        <summary>Czy montaż jest trudny?<span class="fn-x" aria-hidden="true"></span></summary>
        <div class="fn-a">Produkt jest opisany jako łatwy w montażu i jest dostarczany z instrukcją.</div>
      </details>

      <details class="fn-item">
        <summary>Co pokazuje LCD?<span class="fn-x" aria-hidden="true"></span></summary>
        <div class="fn-a">Licznik pokazuje powtórzenia, czas i kalorie; wskazanie kalorii jest funkcją licznika, nie obietnicą spalania ani efektu sylwetkowego.</div>
      </details>

      <details class="fn-item">
        <summary>Jak chronione są kolana?<span class="fn-x" aria-hidden="true"></span></summary>
        <div class="fn-a">Kolana opierają się na pogrubionym, U-kształtnym wałku piankowym zaprojektowanym z myślą o komforcie podparcia.</div>
      </details>

      <details class="fn-item">
        <summary>Jak mogę zapłacić?<span class="fn-x" aria-hidden="true"></span></summary>
        <div class="fn-a">Przy odbiorze, BLIK-iem lub online.</div>
      </details>

      <details class="fn-item">
        <summary>Ile mam czasu na zwrot?<span class="fn-x" aria-hidden="true"></span></summary>
        <div class="fn-a">14 dni.</div>
      </details>
    </div>

    <div class="fn-closing reveal">
      <div class="fn-closing-copy">
        <span class="reps" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
        <p class="fn-closing-title display">Ustaw poziom. Zrób swoją serię. Złóż.</p>
      </div>

      <div class="fn-stats" aria-label="5 wysokości, 2 kąty, udźwig około 200 kilogramów">
        <div class="fn-stat">
          <strong class="display">5</strong>
          <span>wysokości</span>
        </div>
        <span class="fn-dot" aria-hidden="true">·</span>
        <div class="fn-stat">
          <strong class="display">2</strong>
          <span>kąty</span>
        </div>
        <span class="fn-dot" aria-hidden="true">·</span>
        <div class="fn-stat">
          <strong class="display">≈200 kg</strong>
          <span>udźwig</span>
        </div>
      </div>

      <span class="fn-price display" data-price>429,00 zł</span>
      <a class="btn cta" data-checkout href="#zamow">Przejdź do zamówienia</a>
    </div>
  </div>

  <style>
    .fn-final {
      background: var(--paper);
      color: var(--ink);
    }

    .fn-final,
    .fn-final * {
      box-sizing: border-box;
    }

    .fn-final .fn-head {
      width: min(100%, 980px);
      margin-inline: auto;
    }

    .fn-final .fn-head > .reps {
      margin-top: var(--s2);
    }

    .fn-final .fn-head .h2 {
      max-width: 900px;
      margin: var(--s3) 0 0;
      color: var(--ink);
      font-size: var(--h2-d);
      line-height: 1.08;
    }

    .fn-final .fn-list {
      display: grid;
      width: min(100%, 980px);
      margin: var(--s5) auto 0;
      gap: var(--s2);
    }

    .fn-final .fn-item {
      width: 100%;
      overflow: hidden;
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      color: var(--body);
    }

    .fn-final .fn-item summary {
      position: relative;
      display: flex;
      min-height: 72px;
      align-items: center;
      justify-content: space-between;
      gap: var(--s3);
      padding: var(--s3) var(--s4);
      color: var(--ink);
      font-family: var(--font-text);
      font-size: var(--body-fs);
      font-weight: 700;
      line-height: 1.35;
      cursor: pointer;
      list-style: none;
    }

    .fn-final .fn-item summary::-webkit-details-marker {
      display: none;
    }

    .fn-final .fn-item summary::marker {
      content: "";
    }

    .fn-final .fn-item summary:focus-visible {
      outline: 2px solid var(--ink);
      outline-offset: -5px;
      border-radius: var(--radius-lg);
    }

    .fn-final .fn-x {
      position: relative;
      flex: 0 0 24px;
      width: 24px;
      height: 24px;
      color: var(--ink);
      transition: transform 240ms ease;
    }

    .fn-final .fn-x::before,
    .fn-final .fn-x::after {
      position: absolute;
      inset: 0;
      width: 18px;
      height: 1.75px;
      margin: auto;
      background: currentColor;
      content: "";
      transition: transform 240ms ease, opacity 240ms ease;
    }

    .fn-final .fn-x::after {
      transform: rotate(90deg);
    }

    .fn-final .fn-item[open] .fn-x {
      transform: rotate(180deg);
    }

    .fn-final .fn-item[open] .fn-x::after {
      opacity: 0;
      transform: rotate(90deg) scaleX(0);
    }

    .fn-final .fn-a {
      padding: 0 var(--s4) var(--s4);
      color: var(--body);
      font-family: var(--font-text);
      font-size: var(--body-fs);
      line-height: 1.65;
    }

    .fn-final .fn-closing {
      display: grid;
      grid-template-columns: minmax(250px, 1.4fr) auto auto auto;
      align-items: center;
      gap: var(--s4);
      margin-top: var(--s5);
      padding: var(--s5);
      background: var(--paper-2);
      border-radius: var(--radius-lg);
    }

    .fn-final .fn-closing-copy {
      min-width: 0;
    }

    .fn-final .fn-closing-title {
      margin: var(--s3) 0 0;
      color: var(--ink);
      font-size: 22px;
      font-weight: 700;
      line-height: 1.2;
    }

    .fn-final .fn-stats {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--s3);
      white-space: nowrap;
    }

    .fn-final .fn-stat {
      display: grid;
      justify-items: center;
      gap: 4px;
      color: var(--ink);
    }

    .fn-final .fn-stat strong {
      font-size: 28px;
      font-weight: 800;
      line-height: 1;
    }

    .fn-final .fn-stat span {
      color: var(--body);
      font-size: 12px;
      line-height: 1.2;
    }

    .fn-final .fn-dot {
      color: var(--ink);
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 800;
    }

    .fn-final .fn-price {
      color: var(--ink);
      font-size: var(--price-fs);
      font-weight: 800;
      line-height: 1;
      white-space: nowrap;
    }

    .fn-final .fn-closing .btn.cta {
      justify-self: end;
      white-space: nowrap;
    }

    @media (max-width: 980px) {
      .fn-final .fn-closing {
        grid-template-columns: 1fr 1fr;
      }

      .fn-final .fn-closing .btn.cta {
        width: 100%;
        justify-self: stretch;
        text-align: center;
      }
    }

    @media (max-width: 700px) {
      .fn-final .fn-head .h2 {
        font-size: var(--h2-m);
      }

      .fn-final .fn-list {
        margin-top: var(--s4);
      }

      .fn-final .fn-item summary {
        min-height: 64px;
        padding: var(--s3);
      }

      .fn-final .fn-a {
        padding: 0 var(--s3) var(--s3);
      }

      .fn-final .fn-closing {
        grid-template-columns: 1fr;
        align-items: stretch;
        padding: var(--s4);
      }

      .fn-final .fn-closing-title {
        font-size: 20px;
      }

      .fn-final .fn-stats {
        justify-content: space-between;
        gap: var(--s2);
        padding-block: var(--s3);
        border-bottom: 1px solid var(--line);
      }

      .fn-final .fn-stat {
        flex: 1 1 0;
      }

      .fn-final .fn-stat strong {
        font-size: 26px;
      }

      .fn-final .fn-price {
        justify-self: center;
        text-align: center;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .fn-final .fn-x,
      .fn-final .fn-x::before,
      .fn-final .fn-x::after {
        transition: none;
      }
    }
  </style>

  <script>
    (() => {
      const section = document.querySelector("#final");
      if (!section) return;

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

      section.querySelectorAll(".fn-item").forEach((item) => {
        const summary = item.querySelector("summary");

        summary.addEventListener("click", (event) => {
          if (reducedMotion.matches || !item.animate) return;

          event.preventDefault();
          if (item.dataset.animating === "true") return;

          item.dataset.animating = "true";

          const startHeight = item.getBoundingClientRect().height;
          const borders =
            parseFloat(getComputedStyle(item).borderTopWidth) +
            parseFloat(getComputedStyle(item).borderBottomWidth);

          item.style.height = `${startHeight}px`;
          item.style.overflow = "hidden";

          let endHeight;

          if (item.open) {
            endHeight = summary.getBoundingClientRect().height + borders;
          } else {
            item.open = true;
            endHeight = item.scrollHeight + borders;
          }

          const animation = item.animate(
            [
              { height: `${startHeight}px` },
              { height: `${endHeight}px` }
            ],
            {
              duration: 280,
              easing: "cubic-bezier(.2,.7,.2,1)"
            }
          );

          animation.onfinish = () => {
            if (startHeight > endHeight) item.open = false;
            item.style.height = "";
            item.style.overflow = "";
            delete item.dataset.animating;
          };

          animation.oncancel = () => {
            item.style.height = "";
            item.style.overflow = "";
            delete item.dataset.animating;
          };
        });
      });
    })();
  </script>
</section>
```