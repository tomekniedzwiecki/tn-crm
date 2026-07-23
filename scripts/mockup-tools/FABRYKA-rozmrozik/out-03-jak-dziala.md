**Siatka:** desktop — nagłówek i scena 7/12, stepper 5/12; mobile — nagłówek → scena 4/3 → stepper z miniaturami → status → link.

```html
<section id="jak-dziala" class="jd-section">
  <div class="wrap sect-pad jd-wrap">
    <header class="jd-header reveal">
      <div class="eyebrow">TRZY RUCHY</div>
      <span class="thaw"></span>
      <h2 class="h2 jd-title">
        Połóż. Przykryj.<br>
        <span class="swash">Dotknij</span>.
      </h2>
    </header>

    <div
      class="jd-stage reveal"
      aria-live="polite"
      aria-label="Demonstracja działania urządzenia"
    >
      <div
        id="jd-panel-place"
        class="jd-panel is-active"
        role="tabpanel"
        aria-labelledby="jd-tab-place"
        aria-hidden="false"
      >
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/sc-demo-place.webp"
          width="1536"
          height="1024"
          loading="lazy"
          alt="Dłoń kładzie zamrożoną porcję na aluminiowej płycie"
        >
      </div>

      <div
        id="jd-panel-cover"
        class="jd-panel"
        role="tabpanel"
        aria-labelledby="jd-tab-cover"
        aria-hidden="true"
      >
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/sc-demo-cover.webp"
          width="1536"
          height="1024"
          loading="lazy"
          alt="Dłonie nasadzają przezroczystą kopułę na bazę"
        >
      </div>

      <div
        id="jd-panel-touch"
        class="jd-panel"
        role="tabpanel"
        aria-labelledby="jd-tab-touch"
        aria-hidden="true"
      >
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/sc-demo-touch.webp"
          width="1536"
          height="1024"
          loading="lazy"
          alt="Palec dotyka panelu LED na module kopuły"
        >
      </div>
    </div>

    <div class="jd-side reveal">
      <div class="jd-stepper" role="tablist" aria-label="Etapy działania urządzenia">
        <button
          id="jd-tab-place"
          class="jd-step is-active"
          type="button"
          role="tab"
          aria-selected="true"
          aria-controls="jd-panel-place"
          tabindex="0"
          data-jd-state="place"
        >
          <span class="jd-number display" aria-hidden="true">1</span>
          <span class="jd-copy">
            <span class="jd-step-title display">Połóż</span>
            <span class="jd-step-text">Umieść zamrożone porcje na płycie ze stopu aluminium.</span>
          </span>
          <span class="jd-thumb" aria-hidden="true">
            <img
              src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/sc-demo-place.webp"
              width="1536"
              height="1024"
              loading="lazy"
              alt=""
            >
          </span>
        </button>

        <button
          id="jd-tab-cover"
          class="jd-step"
          type="button"
          role="tab"
          aria-selected="false"
          aria-controls="jd-panel-cover"
          tabindex="-1"
          data-jd-state="cover"
        >
          <span class="jd-number display" aria-hidden="true">2</span>
          <span class="jd-copy">
            <span class="jd-step-title display">Przykryj</span>
            <span class="jd-step-text">Nałóż przezroczystą kopułę PS ze ściętymi bokami.</span>
          </span>
          <span class="jd-thumb" aria-hidden="true">
            <img
              src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/sc-demo-cover.webp"
              width="1536"
              height="1024"
              loading="lazy"
              alt=""
            >
          </span>
        </button>

        <button
          id="jd-tab-touch"
          class="jd-step"
          type="button"
          role="tab"
          aria-selected="false"
          aria-controls="jd-panel-touch"
          tabindex="-1"
          data-jd-state="touch"
        >
          <span class="jd-number display" aria-hidden="true">3</span>
          <span class="jd-copy">
            <span class="jd-step-title display">Dotknij</span>
            <span class="jd-step-text">Uruchom urządzenie jednym dotknięciem panelu LED.</span>
          </span>
          <span class="jd-thumb" aria-hidden="true">
            <img
              src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/sc-demo-touch.webp"
              width="1536"
              height="1024"
              loading="lazy"
              alt=""
            >
          </span>
        </button>
      </div>

      <div class="jd-status" role="status" hidden>
        <svg
          class="jd-status-icon"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9"></circle>
          <path d="m8 12 2.7 2.7L16.5 9"></path>
        </svg>
        <span>Urządzenie uruchomione.</span>
      </div>

      <a class="jd-link" href="#pojemnosc">Zobacz, ile mieści →</a>
    </div>
  </div>

  <style scoped>
    .jd-section {
      background: var(--paper-2);
      color: var(--ink);
    }

    .jd-wrap {
      display: grid;
      grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
      grid-template-areas:
        "header header"
        "stage side";
      gap: var(--s5) var(--s6);
    }

    .jd-header {
      grid-area: header;
      max-width: 48rem;
    }

    .jd-header .thaw {
      display: block;
      margin-top: var(--s2);
    }

    .jd-title {
      margin: var(--s3) 0 0;
      color: var(--ink);
      font-size: var(--h2-d);
    }

    .jd-stage {
      grid-area: stage;
      position: relative;
      align-self: start;
      aspect-ratio: 3 / 2;
      padding: 12px;
      overflow: hidden;
      background: var(--card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
    }

    .jd-panel {
      position: absolute;
      inset: 12px;
      opacity: 0;
      visibility: hidden;
      transition:
        opacity .38s var(--mo-ease),
        visibility 0s linear .38s;
    }

    .jd-panel.is-active {
      z-index: 1;
      opacity: 1;
      visibility: visible;
      transition:
        opacity .38s var(--mo-ease),
        visibility 0s linear 0s;
    }

    .jd-panel img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: var(--radius-lg);
    }

    .jd-side {
      grid-area: side;
      align-self: center;
      min-width: 0;
    }

    .jd-stepper {
      position: relative;
      display: grid;
      gap: var(--s3);
    }

    .jd-stepper::before {
      position: absolute;
      top: var(--s4);
      bottom: var(--s4);
      left: 34px;
      width: 1px;
      background: var(--line);
      content: "";
    }

    .jd-step {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: 68px minmax(0, 1fr);
      align-items: stretch;
      width: 100%;
      min-height: 132px;
      padding: 0;
      overflow: hidden;
      color: var(--ink);
      text-align: left;
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      box-shadow: var(--shadow-sm);
      cursor: pointer;
    }

    .jd-step:hover {
      box-shadow: var(--shadow-md);
    }

    .jd-step:focus-visible {
      outline: 2px solid var(--ink);
      outline-offset: 3px;
    }

    .jd-number {
      display: grid;
      place-items: center;
      min-height: 100%;
      color: var(--ink);
      font-size: 2.25rem;
      font-weight: 700;
      line-height: 1;
      background: var(--card);
      border-right: 1px solid var(--line);
    }

    .jd-step.is-active .jd-number {
      color: var(--card);
      background: var(--ink);
      border-color: var(--ink);
    }

    .jd-copy {
      display: flex;
      min-width: 0;
      flex-direction: column;
      justify-content: center;
      gap: var(--s2);
      padding: var(--s3) var(--s4);
    }

    .jd-step-title {
      display: block;
      color: var(--ink);
      font-size: 1.55rem;
      font-weight: 700;
      line-height: 1.05;
    }

    .jd-step-text {
      display: block;
      color: var(--body);
      font-size: 17px;
      line-height: 1.45;
    }

    .jd-thumb {
      display: none;
    }

    .jd-status {
      align-items: center;
      gap: var(--s3);
      margin-top: var(--s4);
      padding: var(--s3);
      color: var(--ink);
      font-size: 17px;
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      box-shadow: var(--shadow-sm);
    }

    .jd-status.is-visible {
      display: flex;
    }

    .jd-status-icon {
      flex: 0 0 auto;
      fill: none;
      stroke: var(--ink);
      stroke-width: 1.75px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .jd-link {
      display: inline-block;
      margin-top: var(--s4);
      color: var(--ink);
      font-size: 17px;
      font-weight: 700;
      text-decoration: underline;
      text-decoration-thickness: 1px;
      text-underline-offset: .3em;
    }

    .jd-link:hover {
      color: var(--ink);
      text-decoration-thickness: 2px;
    }

    .jd-link:focus-visible {
      outline: 2px solid var(--ink);
      outline-offset: 4px;
    }

    @media (max-width: 760px) {
      .jd-wrap {
        grid-template-columns: minmax(0, 1fr);
        grid-template-areas:
          "header"
          "stage"
          "side";
        gap: var(--s4);
      }

      .jd-title {
        font-size: var(--h2-m);
      }

      .jd-stage {
        width: 100%;
        aspect-ratio: 4 / 3;
      }

      .jd-side {
        align-self: auto;
      }

      .jd-stepper {
        gap: var(--s3);
      }

      .jd-stepper::before {
        left: 36px;
      }

      .jd-step {
        grid-template-columns: 72px minmax(0, 1fr) 64px;
        min-height: 112px;
      }

      .jd-number {
        font-size: 2rem;
      }

      .jd-copy {
        padding: var(--s3);
      }

      .jd-step-title {
        font-size: 1.35rem;
      }

      .jd-thumb {
        display: block;
        align-self: center;
        width: 64px;
        height: 64px;
        margin-right: var(--s3);
        overflow: hidden;
        border-radius: var(--radius-sm);
      }

      .jd-thumb img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: var(--radius-sm);
      }

      .jd-status {
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .jd-step {
        grid-template-columns: 60px minmax(0, 1fr) 64px;
      }

      .jd-stepper::before {
        left: 30px;
      }

      .jd-copy {
        padding: var(--s2);
      }

      .jd-step-title {
        font-size: 1.2rem;
      }

      .jd-step-text {
        line-height: 1.35;
      }

      .jd-thumb {
        margin-right: var(--s2);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-panel,
      .jd-panel.is-active {
        transition: none;
      }
    }
  </style>

  <script>
    (() => {
      const script = document.currentScript;
      const section = script && script.closest("#jak-dziala");

      if (!section) return;

      const tabs = Array.from(section.querySelectorAll('[role="tab"]'));
      const panels = Array.from(section.querySelectorAll('[role="tabpanel"]'));
      const status = section.querySelector(".jd-status");

      const activate = (tab, moveFocus = false) => {
        const panelId = tab.getAttribute("aria-controls");
        const isFinalState = tab.dataset.jdState === "touch";

        tabs.forEach((item) => {
          const active = item === tab;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-selected", String(active));
          item.tabIndex = active ? 0 : -1;
        });

        panels.forEach((panel) => {
          const active = panel.id === panelId;
          panel.classList.toggle("is-active", active);
          panel.setAttribute("aria-hidden", String(!active));
        });

        status.hidden = !isFinalState;
        status.classList.toggle("is-visible", isFinalState);

        if (moveFocus) tab.focus();
      };

      tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => activate(tab));

        tab.addEventListener("keydown", (event) => {
          const previousKeys = ["ArrowUp", "ArrowLeft"];
          const nextKeys = ["ArrowDown", "ArrowRight"];
          let nextIndex = index;

          if (previousKeys.includes(event.key)) {
            nextIndex = (index - 1 + tabs.length) % tabs.length;
          } else if (nextKeys.includes(event.key)) {
            nextIndex = (index + 1) % tabs.length;
          } else {
            return;
          }

          event.preventDefault();
          activate(tabs[nextIndex], true);
        });
      });

      activate(tabs[0]);
    })();
  </script>
</section>
```