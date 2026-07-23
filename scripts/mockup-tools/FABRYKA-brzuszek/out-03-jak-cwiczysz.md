Siatka: nagłówek na całą szerokość; desktop 7/12 stage + 5/12 interaktywny stepper; mobile kolejno nagłówek, stage 4:3, stepper, mikrocopy i link.

```html
<section id="jak-cwiczysz" class="jd-jak sect-pad">
  <div class="wrap">
    <header class="jd-jak__header reveal">
      <p class="eyebrow">JAK ĆWICZYSZ</p>
      <span class="reps" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
      <h2 class="h2 display">Ustaw. Oprzyj się. Napnij i <span class="swash">suń</span>.</h2>
    </header>

    <div class="jd-jak__grid">
      <div class="jd-jak__stage reveal">
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/brzuszek/assets/packshot-alpha.png"
          width="1591"
          height="1528"
          loading="lazy"
          alt="Biało-różowa maszyna Brzuszek — widok z boku"
        >

        <div
          id="jd-callout-1"
          class="jd-jak__callout jd-jak__callout--one is-active"
          data-step="1"
          aria-hidden="false"
        >
          <span class="jd-jak__callout-dot" aria-hidden="true"></span>
          <span class="jd-jak__callout-line" aria-hidden="true"></span>
          <span class="jd-jak__callout-label">Selektor wysokości</span>
        </div>

        <div
          id="jd-callout-2"
          class="jd-jak__callout jd-jak__callout--two"
          data-step="2"
          aria-hidden="true"
        >
          <span class="jd-jak__callout-label">U-kształtny wałek</span>
          <span class="jd-jak__callout-line" aria-hidden="true"></span>
          <span class="jd-jak__callout-dot" aria-hidden="true"></span>
        </div>

        <div
          id="jd-callout-3"
          class="jd-jak__callout jd-jak__callout--three"
          data-step="3"
          aria-hidden="true"
        >
          <span class="jd-jak__callout-dot" aria-hidden="true"></span>
          <span class="jd-jak__callout-line" aria-hidden="true"></span>
          <span class="jd-jak__callout-label">Podstawa i szyna</span>
        </div>
      </div>

      <div class="jd-jak__content reveal">
        <div
          class="jd-jak__stepper"
          role="tablist"
          aria-label="Sposób ćwiczenia"
          aria-orientation="vertical"
        >
          <button
            id="jd-step-1"
            class="jd-jak__step is-active"
            type="button"
            role="tab"
            aria-selected="true"
            aria-controls="jd-callout-1"
            tabindex="0"
            data-step="1"
          >
            <span class="jd-jak__number display" aria-hidden="true">1</span>

            <span class="jd-jak__mechanic" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none">
                <path d="M9 13h30M9 24h30M9 35h30"></path>
                <circle cx="19" cy="13" r="4"></circle>
                <circle cx="31" cy="24" r="4"></circle>
                <circle cx="17" cy="35" r="4"></circle>
              </svg>
            </span>

            <span class="jd-jak__copy">
              <span class="jd-jak__title display">Ustaw poziom</span>
              <span class="jd-jak__text">Wybierz 1 z 5 wysokości i 1 z 2 kątów nachylenia; wyższe ustawienie zwiększa trudność.</span>
            </span>
          </button>

          <button
            id="jd-step-2"
            class="jd-jak__step"
            type="button"
            role="tab"
            aria-selected="false"
            aria-controls="jd-callout-2"
            tabindex="-1"
            data-step="2"
          >
            <span class="jd-jak__number display" aria-hidden="true">2</span>

            <span class="jd-jak__mechanic" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none">
                <path d="M14 11c-5 4-7 10-7 17v7c0 3 2 5 5 5h24c3 0 5-2 5-5v-7c0-7-2-13-7-17"></path>
                <path d="M14 11c2-2 5 0 4 3-2 4-3 8-3 13v4h18v-4c0-5-1-9-3-13-1-3 2-5 4-3"></path>
                <path d="M19 40v5h10v-5M18 35h12"></path>
              </svg>
            </span>

            <span class="jd-jak__copy">
              <span class="jd-jak__title display">Oprzyj się stabilnie</span>
              <span class="jd-jak__text">Kolana lub łokcie opierasz na pogrubionym, U-kształtnym wałku piankowym, a przy konsoli masz dwa dodatkowe wałki pod klatkę lub przedramiona.</span>
            </span>
          </button>

          <button
            id="jd-step-3"
            class="jd-jak__step"
            type="button"
            role="tab"
            aria-selected="false"
            aria-controls="jd-callout-3"
            tabindex="-1"
            data-step="3"
          >
            <span class="jd-jak__number display" aria-hidden="true">3</span>

            <span class="jd-jak__mechanic" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none">
                <path d="M6 39 42 17"></path>
                <path d="m16 21 14-7 5 10-14 7z"></path>
                <circle cx="22" cy="33" r="4"></circle>
                <circle cx="31" cy="28" r="4"></circle>
                <path d="m8 31-4 1 2-4M38 11l5-1-2 5"></path>
              </svg>
            </span>

            <span class="jd-jak__copy">
              <span class="jd-jak__title display">Napnij i suń</span>
              <span class="jd-jak__text">Przedni wózek porusza się po szynie na 3 zestawach cichych kółek.</span>
            </span>
          </button>
        </div>

        <p class="jd-jak__microcopy">
          <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <rect x="5" y="6" width="30" height="28" rx="3"></rect>
            <rect x="10" y="11" width="20" height="11" rx="1"></rect>
            <path d="M15 29h10"></path>
            <circle cx="10" cy="28" r="1"></circle>
            <circle cx="30" cy="28" r="1"></circle>
          </svg>
          <span>LCD pokazuje powtórzenia, czas i kalorie jako funkcje licznika.</span>
        </p>

        <a class="jd-jak__link" href="#regulacja">Zobacz poziomy trudności →</a>
      </div>
    </div>
  </div>

  <style scoped>
    .jd-jak {
      overflow: hidden;
      color: var(--ink);
      background: var(--paper);
    }

    .jd-jak *,
    .jd-jak *::before,
    .jd-jak *::after {
      box-sizing: border-box;
    }

    .jd-jak__header {
      max-width: 940px;
      margin-bottom: var(--s5);
    }

    .jd-jak__header .eyebrow {
      margin: 0;
    }

    .jd-jak__header .reps {
      display: flex;
      margin-top: var(--s2);
      margin-bottom: var(--s3);
    }

    .jd-jak__header .h2 {
      max-width: 900px;
      margin: 0;
      color: var(--ink);
      font-size: var(--h2-d);
      line-height: 1.08;
    }

    .jd-jak__grid {
      display: grid;
      grid-template-columns: minmax(0, 7fr) minmax(340px, 5fr);
      gap: var(--s5);
      align-items: start;
    }

    .jd-jak__stage {
      position: relative;
      display: grid;
      min-width: 0;
      overflow: hidden;
      padding: 12px 20px;
      border-radius: var(--radius-lg);
      background: var(--card);
      box-shadow: var(--shadow-md);
      isolation: isolate;
    }

    .jd-jak__stage img {
      display: block;
      width: 100%;
      max-width: 100%;
      height: auto;
      margin: auto;
      object-fit: contain;
      border-radius: var(--radius-lg);
    }

    .jd-jak__callout {
      position: absolute;
      z-index: 2;
      display: flex;
      align-items: center;
      max-width: 42%;
      opacity: .34;
      transition: opacity 180ms ease;
      pointer-events: none;
    }

    .jd-jak__callout.is-active {
      opacity: 1;
    }

    .jd-jak__callout--one {
      top: 24%;
      left: 46%;
    }

    .jd-jak__callout--two {
      top: 55%;
      left: 9%;
    }

    .jd-jak__callout--three {
      right: 8%;
      bottom: 12%;
    }

    .jd-jak__callout-dot {
      width: 15px;
      height: 15px;
      flex: 0 0 15px;
      border: 2px solid var(--ink);
      border-radius: 50%;
      background: var(--card);
      box-shadow: 0 0 0 3px var(--card);
    }

    .jd-jak__callout.is-active .jd-jak__callout-dot {
      background: var(--cta);
    }

    .jd-jak__callout-line {
      width: 42px;
      height: 1px;
      flex: 0 1 42px;
      background: var(--ink);
    }

    .jd-jak__callout-label {
      padding: 7px 10px;
      border: 1px solid var(--line);
      border-radius: 999px;
      color: var(--ink);
      background: var(--card);
      font-family: var(--font-text);
      font-size: 13px;
      font-weight: 600;
      line-height: 1.2;
      white-space: nowrap;
      box-shadow: var(--shadow-sm);
    }

    .jd-jak__content {
      min-width: 0;
    }

    .jd-jak__stepper {
      position: relative;
      display: grid;
      gap: var(--s3);
    }

    .jd-jak__stepper::before {
      position: absolute;
      top: 32px;
      bottom: 32px;
      left: 25px;
      width: 1px;
      background: var(--line);
      content: "";
    }

    .jd-jak__step {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: 50px 58px minmax(0, 1fr);
      gap: var(--s3);
      width: 100%;
      min-width: 0;
      padding: var(--s4);
      border: 1px solid var(--line);
      border-left: 3px solid transparent;
      border-radius: var(--radius-sm);
      color: var(--body);
      background: var(--card);
      box-shadow: var(--shadow-sm);
      font: inherit;
      text-align: left;
      cursor: pointer;
      transition: border-color 180ms ease, box-shadow 180ms ease;
    }

    .jd-jak__step:hover {
      border-color: var(--seg);
      box-shadow: var(--shadow-md);
    }

    .jd-jak__step:focus-visible {
      outline: 2px solid var(--ink);
      outline-offset: 3px;
    }

    .jd-jak__step.is-active {
      border-left-color: var(--cta);
      box-shadow: var(--shadow-md);
    }

    .jd-jak__number {
      position: relative;
      z-index: 2;
      display: grid;
      width: 44px;
      height: 44px;
      place-items: center;
      align-self: start;
      border: 1px solid var(--line);
      border-radius: 8px;
      color: var(--ink);
      background: var(--card);
      font-size: 24px;
      font-weight: 700;
      line-height: 1;
    }

    .jd-jak__step.is-active .jd-jak__number {
      border-color: var(--ink);
      color: var(--card);
      background: var(--ink);
    }

    .jd-jak__mechanic {
      display: grid;
      width: 58px;
      height: 58px;
      place-items: center;
      align-self: start;
      color: var(--ink);
    }

    .jd-jak__mechanic svg {
      display: block;
      width: 48px;
      height: 48px;
      stroke: currentColor;
      stroke-width: 1.75;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .jd-jak__copy {
      display: block;
      min-width: 0;
    }

    .jd-jak__title {
      display: block;
      margin-bottom: 7px;
      color: var(--ink);
      font-size: 21px;
      font-weight: 700;
      line-height: 1.15;
    }

    .jd-jak__text {
      display: block;
      color: var(--body);
      font-family: var(--font-text);
      font-size: 17px;
      line-height: 1.48;
    }

    .jd-jak__microcopy {
      display: flex;
      align-items: center;
      gap: var(--s3);
      margin: var(--s4) 0 var(--s3);
      color: var(--body);
      font-family: var(--font-text);
      font-size: 14px;
      line-height: 1.45;
    }

    .jd-jak__microcopy svg {
      width: 34px;
      height: 34px;
      flex: 0 0 34px;
      color: var(--ink);
      stroke: currentColor;
      stroke-width: 1.75;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .jd-jak__link {
      display: inline-block;
      color: var(--ink);
      font-family: var(--font-text);
      font-size: 17px;
      font-weight: 700;
      text-decoration: underline;
      text-decoration-thickness: 1px;
      text-underline-offset: 4px;
    }

    .jd-jak__link:hover {
      text-decoration-thickness: 2px;
    }

    .jd-jak__link:focus-visible {
      outline: 2px solid var(--ink);
      outline-offset: 4px;
    }

    @media (max-width: 900px) {
      .jd-jak__header {
        margin-bottom: var(--s4);
      }

      .jd-jak__header .h2 {
        font-size: var(--h2-m);
      }

      .jd-jak__grid {
        grid-template-columns: minmax(0, 1fr);
        gap: var(--s4);
      }

      .jd-jak__stage {
        aspect-ratio: 4 / 3;
        padding: 12px;
      }

      .jd-jak__stage img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .jd-jak__callout {
        max-width: 48%;
      }

      .jd-jak__callout--one {
        top: 24%;
        left: 48%;
      }

      .jd-jak__callout--two {
        top: 55%;
        left: 5%;
      }

      .jd-jak__callout--three {
        right: 5%;
        bottom: 11%;
      }
    }

    @media (max-width: 620px) {
      .jd-jak__step {
        grid-template-columns: 42px 48px minmax(0, 1fr);
        gap: var(--s2);
        padding: var(--s3);
      }

      .jd-jak__stepper::before {
        left: 21px;
      }

      .jd-jak__number {
        width: 38px;
        height: 38px;
        font-size: 21px;
      }

      .jd-jak__mechanic {
        width: 48px;
        height: 48px;
      }

      .jd-jak__mechanic svg {
        width: 42px;
        height: 42px;
      }

      .jd-jak__title {
        font-size: 19px;
      }

      .jd-jak__callout-line {
        width: 24px;
        flex-basis: 24px;
      }

      .jd-jak__callout-label {
        max-width: 118px;
        padding: 5px 7px;
        overflow: hidden;
        font-size: 11px;
        text-overflow: ellipsis;
      }

      .jd-jak__callout-dot {
        width: 12px;
        height: 12px;
        flex-basis: 12px;
      }
    }

    @media (max-width: 430px) {
      .jd-jak__step {
        grid-template-columns: 38px 42px minmax(0, 1fr);
      }

      .jd-jak__mechanic {
        width: 42px;
      }

      .jd-jak__mechanic svg {
        width: 38px;
        height: 38px;
      }

      .jd-jak__text {
        font-size: 17px;
      }

      .jd-jak__callout--one {
        left: 45%;
      }

      .jd-jak__callout--two {
        left: 3%;
      }

      .jd-jak__callout--three {
        right: 3%;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-jak__callout,
      .jd-jak__step {
        transition: none;
      }
    }
  </style>

  <script>
    (() => {
      const section = document.currentScript.closest(".jd-jak");
      if (!section) return;

      const tabs = Array.from(section.querySelectorAll(".jd-jak__step[role='tab']"));
      const callouts = Array.from(section.querySelectorAll(".jd-jak__callout"));

      const activateStep = (index, moveFocus = false) => {
        const normalizedIndex = (index + tabs.length) % tabs.length;

        tabs.forEach((tab, tabIndex) => {
          const isActive = tabIndex === normalizedIndex;
          tab.classList.toggle("is-active", isActive);
          tab.setAttribute("aria-selected", String(isActive));
          tab.tabIndex = isActive ? 0 : -1;
        });

        callouts.forEach((callout, calloutIndex) => {
          const isActive = calloutIndex === normalizedIndex;
          callout.classList.toggle("is-active", isActive);
          callout.setAttribute("aria-hidden", String(!isActive));
        });

        if (moveFocus) tabs[normalizedIndex].focus();
      };

      tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => activateStep(index));

        tab.addEventListener("keydown", (event) => {
          let nextIndex = index;

          if (event.key === "ArrowDown" || event.key === "ArrowRight") {
            nextIndex = index + 1;
          } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
            nextIndex = index - 1;
          } else if (event.key === "Home") {
            nextIndex = 0;
          } else if (event.key === "End") {
            nextIndex = tabs.length - 1;
          } else {
            return;
          }

          event.preventDefault();
          activateStep(nextIndex, true);
        });
      });

      activateStep(0);
    })();
  </script>
</section>
```