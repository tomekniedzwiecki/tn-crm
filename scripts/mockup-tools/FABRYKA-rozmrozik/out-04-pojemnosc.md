**Siatka:** desktop 5/7 — plakat i specyfikacja po lewej, karta z przełącznikiem i zdjęciem po prawej. Mobile — nagłówek, liczby, toggle, zdjęcie, opisy, dwuwierszowa specyfikacja.

```html
<section id="pojemnosc" class="pj-capacity band">
  <div class="wrap sect-pad">
    <div class="pj-grid">
      <div class="pj-copy">
        <header class="pj-heading reveal">
          <p class="eyebrow">MIEJSCE NA OBIAD</p>
          <span class="thaw"></span>

          <h2 class="h2">
            Nie jedna porcja.<br>
            <span class="swash">Cztery</span>.
          </h2>
        </header>

        <div class="pj-numbers reveal">
          <div
            class="pj-volume display"
            data-countup
            data-countup-value="4,2"
            aria-label="Pojemność: 4,2 litra"
          >
            4,2 L
          </div>

          <div class="pj-capacity-row" aria-label="Cztery steki lub cztery porcje ryby">
            <span class="pj-capacity-item">
              <strong class="display">4</strong>
              <span>steki</span>
            </span>

            <span class="pj-slash" aria-hidden="true">/</span>

            <span class="pj-capacity-item">
              <strong class="display">4</strong>
              <span>porcje ryby</span>
            </span>
          </div>
        </div>

        <div class="pj-description reveal">
          <p>Komora o pojemności 4,2 L mieści jednocześnie 4 steki lub 4 porcje ryby.</p>
          <p>Tacka ociekowa ABS zbiera wodę powstającą podczas rozmrażania.</p>
        </div>

        <div class="pj-specs reveal" aria-label="Materiały urządzenia">
          <span class="pj-spec-line">
            <span>PŁYTA: STOP ALUMINIUM</span>
            <span aria-hidden="true">·</span>
            <span>KOPUŁA: PS</span>
          </span>
          <span class="pj-spec-line">
            <span>TACKA: ABS</span>
            <span aria-hidden="true">·</span>
            <span>ELEMENTY: NTC</span>
          </span>
        </div>
      </div>

      <div class="pj-media reveal">
        <div class="pj-tabs" role="tablist" aria-label="Wybierz zawartość komory">
          <button
            class="pj-tab is-active"
            id="pj-tab-steak"
            type="button"
            role="tab"
            aria-selected="true"
            aria-controls="pj-panel-steak"
            tabindex="0"
            data-pj-target="steak"
          >
            Steki
          </button>

          <button
            class="pj-tab"
            id="pj-tab-fish"
            type="button"
            role="tab"
            aria-selected="false"
            aria-controls="pj-panel-fish"
            tabindex="-1"
            data-pj-target="fish"
          >
            Ryba
          </button>
        </div>

        <div class="pj-stage">
          <div class="pj-stage-frame">
            <div
              class="pj-panel is-active"
              id="pj-panel-steak"
              role="tabpanel"
              aria-labelledby="pj-tab-steak"
              aria-hidden="false"
              data-pj-panel="steak"
            >
              <img
                src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/sc-capacity-steak.webp"
                width="1536"
                height="1024"
                loading="lazy"
                alt="Widok z góry: cztery steki na perforowanej płycie"
              >
            </div>

            <div
              class="pj-panel"
              id="pj-panel-fish"
              role="tabpanel"
              aria-labelledby="pj-tab-fish"
              aria-hidden="true"
              data-pj-panel="fish"
            >
              <img
                src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/sc-capacity-fish.webp"
                width="1536"
                height="1024"
                loading="lazy"
                alt="Widok z góry: cztery porcje ryby na perforowanej płycie"
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <style scoped>
    .pj-capacity {
      position: relative;
      overflow: hidden;
      color: var(--ink);
      background-color: var(--paper-2);
      isolation: isolate;
    }

    .pj-capacity::before {
      position: absolute;
      inset: 0;
      z-index: -1;
      content: "";
      pointer-events: none;
      opacity: .22;
      background-image:
        radial-gradient(circle, var(--line) 0 .6px, transparent .7px);
      background-size: 7px 7px;
    }

    .pj-grid {
      display: grid;
      grid-template-columns: repeat(12, minmax(0, 1fr));
      gap: var(--s5);
      align-items: stretch;
    }

    .pj-copy {
      display: flex;
      grid-column: 1 / span 5;
      flex-direction: column;
      min-width: 0;
    }

    .pj-heading .eyebrow {
      margin: 0;
    }

    .pj-heading .thaw {
      display: block;
      margin-top: var(--s2);
      margin-bottom: var(--s4);
    }

    .pj-heading .h2 {
      margin: 0;
      font-size: var(--h2-d);
      line-height: .98;
      text-wrap: balance;
    }

    .pj-numbers {
      margin-top: var(--s4);
    }

    .pj-volume {
      margin: 0;
      color: var(--ink);
      font-size: clamp(72px, 9vw, 128px);
      font-weight: 700;
      line-height: .82;
      letter-spacing: -.055em;
      white-space: nowrap;
    }

    .pj-capacity-row {
      display: flex;
      gap: var(--s3);
      align-items: center;
      margin-top: var(--s4);
      font-size: 28px;
      line-height: 1;
    }

    .pj-capacity-item {
      display: inline-flex;
      gap: var(--s2);
      align-items: baseline;
      white-space: nowrap;
    }

    .pj-capacity-item strong {
      color: var(--ink);
      font-size: 1.8em;
      font-weight: 700;
      line-height: .8;
    }

    .pj-slash {
      color: var(--cold);
      font-size: 2.15em;
      font-weight: 400;
      line-height: 1;
    }

    .pj-description {
      margin-top: var(--s5);
      color: var(--body);
      font-size: 17px;
      line-height: 1.55;
    }

    .pj-description p {
      margin: 0;
    }

    .pj-description p + p {
      margin-top: var(--s2);
    }

    .pj-specs {
      display: flex;
      gap: var(--s2);
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
      padding-top: var(--s3);
      border-top: 1px solid var(--line);
      color: var(--body);
      font-size: 12px;
      line-height: 1.45;
      letter-spacing: .08em;
    }

    .pj-spec-line {
      display: inline-flex;
      gap: var(--s2);
      align-items: center;
      white-space: nowrap;
    }

    .pj-media {
      display: flex;
      grid-column: 6 / -1;
      flex-direction: column;
      gap: 12px;
      min-width: 0;
      padding: 12px;
      border-radius: var(--radius-lg);
      background: var(--card);
      box-shadow: var(--shadow-md);
    }

    .pj-tabs {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      width: min(100%, 290px);
      padding: 2px;
      border: 1px solid var(--ink);
      border-radius: 999px;
      background: var(--card);
    }

    .pj-tab {
      min-height: 44px;
      padding: 8px var(--s3);
      border: 0;
      border-radius: 999px;
      color: var(--ink);
      background: transparent;
      font: inherit;
      font-size: 17px;
      line-height: 1;
      cursor: pointer;
      transition:
        color .2s ease,
        background-color .2s ease;
    }

    .pj-tab.is-active {
      color: var(--card);
      background: var(--ink);
    }

    .pj-tab:focus-visible {
      outline: 2px solid var(--ink);
      outline-offset: 3px;
    }

    .pj-stage {
      min-width: 0;
    }

    .pj-stage-frame {
      position: relative;
      overflow: hidden;
      width: 100%;
      aspect-ratio: 5 / 4;
      border-radius: var(--radius-lg);
      background: var(--paper);
    }

    .pj-panel {
      position: absolute;
      inset: 0;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      transition: opacity .35s ease;
    }

    .pj-panel.is-active {
      z-index: 1;
      opacity: 1;
      pointer-events: auto;
    }

    .pj-panel img {
      display: block;
      width: 120%;
      max-width: none;
      height: auto;
      margin-left: -10%;
      border-radius: var(--radius-lg);
      object-fit: cover;
    }

    @media (max-width: 767px) {
      .pj-grid {
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .pj-copy,
      .pj-media {
        display: contents;
      }

      .pj-heading {
        order: 1;
      }

      .pj-heading .thaw {
        margin-bottom: var(--s3);
      }

      .pj-heading .h2 {
        font-size: var(--h2-m);
      }

      .pj-numbers {
        order: 2;
        margin-top: var(--s4);
      }

      .pj-volume {
        font-size: 72px;
        line-height: .86;
      }

      .pj-capacity-row {
        gap: var(--s2);
        justify-content: space-between;
        margin-top: var(--s3);
        font-size: 22px;
      }

      .pj-capacity-item {
        gap: var(--s2);
      }

      .pj-capacity-item strong {
        font-size: 1.75em;
      }

      .pj-slash {
        font-size: 1.9em;
      }

      .pj-tabs {
        order: 3;
        width: 100%;
        margin-top: var(--s4);
      }

      .pj-stage {
        order: 4;
        margin-top: var(--s3);
        padding: 12px;
        border-radius: var(--radius-lg);
        background: var(--card);
        box-shadow: var(--shadow-md);
      }

      .pj-description {
        order: 5;
        margin-top: var(--s4);
        font-size: 17px;
      }

      .pj-specs {
        display: grid;
        order: 6;
        grid-template-columns: 1fr;
        gap: var(--s2);
        margin-top: var(--s4);
        padding-top: var(--s3);
      }

      .pj-spec-line {
        display: grid;
        grid-template-columns: max-content auto max-content;
        gap: var(--s2);
        justify-content: start;
        white-space: normal;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .pj-panel,
      .pj-tab {
        transition: none;
      }
    }
  </style>

  <script scoped>
    (() => {
      const section = document.getElementById('pojemnosc');
      if (!section) return;

      const tabs = Array.from(section.querySelectorAll('[role="tab"]'));
      const panels = Array.from(section.querySelectorAll('[role="tabpanel"]'));

      const activate = (tab, moveFocus = false) => {
        const target = tab.dataset.pjTarget;

        tabs.forEach((item) => {
          const active = item === tab;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-selected', String(active));
          item.tabIndex = active ? 0 : -1;
        });

        panels.forEach((panel) => {
          const active = panel.dataset.pjPanel === target;
          panel.classList.toggle('is-active', active);
          panel.setAttribute('aria-hidden', String(!active));
        });

        if (moveFocus) tab.focus();
      };

      tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => activate(tab));

        tab.addEventListener('keydown', (event) => {
          let nextIndex = index;

          if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            nextIndex = (index + 1) % tabs.length;
          } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            nextIndex = (index - 1 + tabs.length) % tabs.length;
          } else if (event.key === 'Home') {
            nextIndex = 0;
          } else if (event.key === 'End') {
            nextIndex = tabs.length - 1;
          } else {
            return;
          }

          event.preventDefault();
          activate(tabs[nextIndex], true);
        });
      });
    })();
  </script>
</section>
```