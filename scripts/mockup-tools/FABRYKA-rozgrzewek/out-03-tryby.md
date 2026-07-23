Siatka: desktop 42/58 — packshot po lewej, treść z zakładkami i panelem po prawej; mobile — packshot, nagłówek, zakładki, panel, dopisek i CTA w jednej kolumnie.

```html
<section id="tryby" class="tr-section sect-pad">
  <div class="wrap">
    <div class="tr-layout">
      <figure class="tr-packshot reveal">
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozgrzewek/assets/packshot-alpha.png"
          width="900"
          height="1100"
          loading="lazy"
          alt="Granatowy masażer Rozgrzewek — rączka z okrągłym wyświetlaczem i głowica z kulkami"
        >
      </figure>

      <div class="tr-content">
        <div class="tr-heading reveal">
          <div class="tr-kicker">
            <span class="rings-wrap"><svg class="rings" viewBox="0 0 88 46" aria-hidden="true" focusable="false"><path class="r-out" d="M4 44a40 40 0 0 1 80 0"/><path class="r-mid" d="M15 44a29 29 0 0 1 58 0"/><path class="r-in" d="M26 44a18 18 0 0 1 36 0"/></svg></span>
            <span class="eyebrow">WYBIERZ SWÓJ TRYB</span>
          </div>

          <h2 class="h2">Trzy tryby. Intensywność ustawiasz od 1 do <span class="swash">9</span>.</h2>
          <p class="lead">Dotknij trybu, aby zobaczyć jego wskaźnik i zakres ustawień.</p>
        </div>

        <div
          class="tr-tabs reveal"
          role="tablist"
          aria-label="Tryby urządzenia"
          aria-orientation="horizontal"
        >
          <button
            class="tr-tab is-active"
            id="tr-tab-heat"
            type="button"
            role="tab"
            aria-selected="true"
            aria-controls="tr-mode-panel"
            tabindex="0"
            data-mode="heat"
          >
            <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
              <path d="M9 27c-2.5-2.8-2.5-5.6 0-8.4s2.5-5.6 0-8.4M16 27c-2.5-2.8-2.5-5.6 0-8.4s2.5-5.6 0-8.4M23 27c-2.5-2.8-2.5-5.6 0-8.4s2.5-5.6 0-8.4"/>
            </svg>
            <span>Ciepło</span>
          </button>

          <button
            class="tr-tab"
            id="tr-tab-vibe"
            type="button"
            role="tab"
            aria-selected="false"
            aria-controls="tr-mode-panel"
            tabindex="-1"
            data-mode="vibe"
          >
            <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
              <path d="M12 11c-2.8 2.8-2.8 7.2 0 10M8 7c-5 5-5 13 0 18M20 11c2.8 2.8 2.8 7.2 0 10M24 7c5 5 5 13 0 18"/>
              <circle cx="16" cy="16" r="2.5"/>
            </svg>
            <span>Wibracje</span>
          </button>

          <button
            class="tr-tab"
            id="tr-tab-ems"
            type="button"
            role="tab"
            aria-selected="false"
            aria-controls="tr-mode-panel"
            tabindex="-1"
            data-mode="ems"
          >
            <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
              <path d="M3 17h6l3-9 5 17 4-14 3 6h5"/>
            </svg>
            <span>EMS</span>
          </button>
        </div>

        <div
          class="tr-panel reveal"
          id="tr-mode-panel"
          role="tabpanel"
          aria-labelledby="tr-tab-heat"
          tabindex="0"
        >
          <div class="tr-display">
            <img
              src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozgrzewek/assets/tryby-panel.webp"
              width="700"
              height="700"
              loading="lazy"
              alt="Okrągły wyświetlacz LED z cyfrą i wskaźnikami trybów"
            >

            <div class="tr-indicators" role="group" aria-label="Wskaźniki statusu trybów">
              <span class="tr-indicator tr-indicator--heat is-active" data-status="heat">
                <span class="tr-dot" aria-hidden="true"></span>
                <span class="tr-sr">Ciepło aktywne</span>
              </span>
              <span class="tr-indicator tr-indicator--vibe" data-status="vibe">
                <span class="tr-dot" aria-hidden="true"></span>
                <span class="tr-sr">Wibracje wygaszone</span>
              </span>
              <span class="tr-indicator tr-indicator--ems" data-status="ems">
                <span class="tr-dot" aria-hidden="true"></span>
                <span class="tr-sr">EMS wygaszone</span>
              </span>
            </div>
          </div>

          <div class="tr-panel-copy" aria-live="polite">
            <h3 class="tr-mode-title">Ciepło</h3>
            <p class="tr-mode-description">Delikatny ciepły okład z 9 poziomami. Aktywny tryb wskazuje czerwony wskaźnik.</p>
          </div>
        </div>

        <p class="tr-note reveal">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 10.5v6M12 7.5h.01"/>
          </svg>
          <span>Czerwone światło LED jest widoczną cechą głowicy — nie przedstawiamy go jako terapii.</span>
        </p>

        <div class="tr-cta-wrap reveal">
          <a class="btn cta" data-checkout href="#zamow">Wybieram Rozgrzewek — 84,90 zł</a>
        </div>
      </div>
    </div>
  </div>

  <style scoped>
    .tr-section {
      overflow: hidden;
      background: var(--paper);
      color: var(--body);
      font-size: 17px;
    }

    .tr-section *,
    .tr-section *::before,
    .tr-section *::after {
      box-sizing: border-box;
    }

    .tr-layout {
      display: grid;
      grid-template-columns: minmax(0, 42fr) minmax(0, 58fr);
      gap: var(--s6);
      align-items: center;
    }

    .tr-packshot {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 0;
      margin: 0;
      padding: var(--s5);
      overflow: hidden;
      border-radius: var(--radius-lg);
      background: var(--paper-2);
    }

    .tr-packshot img {
      display: block;
      width: 100%;
      max-width: 560px;
      height: auto;
      max-height: 720px;
      object-fit: contain;
      border-radius: var(--radius-lg);
    }

    .tr-content {
      min-width: 0;
    }

    .tr-heading {
      margin-bottom: var(--s4);
    }

    .tr-kicker {
      display: flex;
      align-items: flex-end;
      gap: var(--s3);
      margin-bottom: var(--s3);
    }

    .tr-kicker .rings-wrap {
      display: inline-flex;
      flex: 0 0 auto;
      width: 88px;
      height: 46px;
    }

    .tr-kicker .rings {
      display: block;
      width: 88px;
      height: 46px;
      overflow: visible;
      fill: none;
      stroke-linecap: round;
      stroke-width: 1.75;
    }

    .tr-kicker .r-out {
      stroke: var(--cta);
    }

    .tr-kicker .r-mid,
    .tr-kicker .r-in {
      stroke: var(--line);
    }

    .tr-kicker .rings path {
      stroke-dasharray: 130;
      stroke-dashoffset: 130;
      transition: stroke-dashoffset 700ms ease;
    }

    .tr-heading.reveal.in .rings path {
      stroke-dashoffset: 0;
    }

    .tr-kicker .eyebrow {
      padding-bottom: 2px;
      color: var(--ink);
    }

    .tr-heading .h2 {
      max-width: 900px;
      margin: 0 0 var(--s3);
      color: var(--ink);
      font-size: var(--h2-d);
    }

    .tr-heading .lead {
      max-width: 720px;
      margin: 0;
      color: var(--body);
      font-size: 17px;
    }

    .tr-tabs {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--s2);
      margin-bottom: var(--s3);
    }

    .tr-tab {
      display: inline-flex;
      min-width: 0;
      min-height: 58px;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 12px 16px;
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      background: var(--card);
      color: var(--ink);
      font: inherit;
      font-weight: 700;
      line-height: 1.2;
      cursor: pointer;
      transition:
        background-color 180ms ease,
        border-color 180ms ease,
        color 180ms ease;
    }

    .tr-tab svg {
      width: 28px;
      height: 28px;
      flex: 0 0 auto;
      fill: none;
      stroke: currentColor;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 1.75;
    }

    .tr-tab.is-active {
      border-color: var(--ink);
      background: var(--ink);
      color: var(--cta-ink);
    }

    .tr-tab:focus-visible {
      outline: 2px solid var(--ink);
      outline-offset: 3px;
    }

    .tr-panel {
      display: grid;
      grid-template-columns: minmax(220px, 42%) minmax(0, 58%);
      align-items: center;
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      background: var(--card);
      box-shadow: var(--shadow-sm);
    }

    .tr-panel:focus {
      outline: none;
    }

    .tr-panel:focus-visible {
      outline: 2px solid var(--ink);
      outline-offset: 3px;
    }

    .tr-display {
      position: relative;
      display: flex;
      min-width: 0;
      align-items: center;
      justify-content: center;
      gap: var(--s3);
      padding: var(--s4);
      border-right: 1px solid var(--line);
    }

    .tr-display img {
      display: block;
      width: min(100%, 230px);
      height: auto;
      border-radius: var(--radius-lg);
    }

    .tr-indicators {
      display: flex;
      flex: 0 0 auto;
      flex-direction: column;
      gap: 12px;
      padding: 10px 8px;
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      background: var(--card);
    }

    .tr-indicator {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .tr-dot {
      display: block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--line);
      opacity: .35;
      box-shadow: none;
      transition:
        background-color 180ms ease,
        box-shadow 180ms ease,
        opacity 180ms ease;
    }

    .tr-indicator--heat {
      --tr-dot-color: var(--led-heat);
    }

    .tr-indicator--vibe {
      --tr-dot-color: var(--led-vibe);
    }

    .tr-indicator--ems {
      --tr-dot-color: var(--led-ems);
    }

    .tr-indicator.is-active .tr-dot {
      background: var(--tr-dot-color);
      opacity: 1;
      box-shadow:
        0 0 0 4px color-mix(in srgb, var(--tr-dot-color) 16%, transparent),
        0 0 12px color-mix(in srgb, var(--tr-dot-color) 34%, transparent);
    }

    .tr-panel-copy {
      min-width: 0;
      padding: var(--s5);
    }

    .tr-mode-title {
      margin: 0 0 var(--s2);
      color: var(--ink);
      font-size: 28px;
      line-height: 1.15;
    }

    .tr-mode-description {
      max-width: 520px;
      margin: 0;
      color: var(--body);
      font-size: 17px;
      line-height: 1.65;
    }

    .tr-note {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      gap: 10px;
      margin: var(--s3) auto 0;
      color: var(--body);
      font-size: 17px;
      line-height: 1.5;
    }

    .tr-note svg {
      width: 23px;
      height: 23px;
      flex: 0 0 auto;
      margin-top: 1px;
      fill: none;
      stroke: var(--ink);
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 1.75;
    }

    .tr-cta-wrap {
      display: flex;
      justify-content: center;
      margin-top: var(--s4);
    }

    .tr-cta-wrap .btn.cta {
      text-align: center;
    }

    .tr-sr {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    @media (max-width: 980px) {
      .tr-layout {
        grid-template-columns: minmax(0, 1fr);
        gap: var(--s5);
      }

      .tr-packshot {
        width: min(100%, 420px);
        margin-inline: auto;
        padding: var(--s3);
      }

      .tr-packshot img {
        max-height: 380px;
      }

      .tr-heading {
        text-align: center;
      }

      .tr-kicker {
        justify-content: center;
      }

      .tr-heading .h2,
      .tr-heading .lead {
        margin-inline: auto;
      }
    }

    @media (max-width: 700px) {
      .tr-layout {
        gap: var(--s4);
      }

      .tr-packshot {
        width: min(78%, 300px);
      }

      .tr-packshot img {
        max-height: 280px;
      }

      .tr-kicker {
        flex-direction: column;
        align-items: center;
        gap: var(--s2);
      }

      .tr-heading .h2 {
        font-size: var(--h2-m);
      }

      .tr-tabs {
        display: flex;
        flex-wrap: wrap;
      }

      .tr-tab {
        flex: 1 1 145px;
        padding-inline: 12px;
      }

      .tr-panel {
        grid-template-columns: minmax(0, 1fr);
      }

      .tr-display {
        gap: var(--s3);
        padding: var(--s4) var(--s3);
        border-right: 0;
        border-bottom: 1px solid var(--line);
      }

      .tr-display img {
        width: min(72%, 250px);
      }

      .tr-indicators {
        flex-direction: column;
      }

      .tr-panel-copy {
        padding: var(--s4);
      }

      .tr-mode-title {
        font-size: 25px;
      }

      .tr-note {
        justify-content: flex-start;
      }

      .tr-cta-wrap {
        display: block;
      }

      .tr-cta-wrap .btn.cta {
        display: flex;
        width: 100%;
        justify-content: center;
      }
    }

    @media (max-width: 420px) {
      .tr-tabs {
        gap: 8px;
      }

      .tr-tab {
        flex-basis: calc(50% - 4px);
        min-height: 54px;
        font-size: 16px;
      }

      .tr-tab:last-child {
        flex-basis: 100%;
      }

      .tr-display img {
        width: min(76%, 220px);
      }

      .tr-panel-copy {
        padding: var(--s3);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .tr-kicker .rings path,
      .tr-tab,
      .tr-dot {
        transition: none;
      }

      .tr-kicker .rings path {
        stroke-dashoffset: 0;
      }
    }
  </style>

  <script scoped>
    (() => {
      const script = document.currentScript;
      const root = script ? script.closest(".tr-section") : null;
      if (!root) return;

      const tabs = Array.from(root.querySelectorAll('[role="tab"][data-mode]'));
      const panel = root.querySelector("#tr-mode-panel");
      const title = root.querySelector(".tr-mode-title");
      const description = root.querySelector(".tr-mode-description");
      const indicators = Array.from(root.querySelectorAll("[data-status]"));

      if (!tabs.length || !panel || !title || !description || !indicators.length) return;

      const modes = {
        heat: {
          title: "Ciepło",
          description: "Delikatny ciepły okład z 9 poziomami. Aktywny tryb wskazuje czerwony wskaźnik."
        },
        vibe: {
          title: "Wibracje",
          description: "Wibracje z 9 poziomami. Aktywny tryb wskazuje niebieski wskaźnik."
        },
        ems: {
          title: "EMS",
          description: "Tryb mikroprądów/EMS z 9 poziomami. Aktywny tryb wskazuje zielony wskaźnik."
        }
      };

      const labels = {
        heat: "Ciepło",
        vibe: "Wibracje",
        ems: "EMS"
      };

      const activate = (tab, moveFocus = false) => {
        const mode = tab.dataset.mode;
        const content = modes[mode];
        if (!content) return;

        tabs.forEach((item) => {
          const selected = item === tab;
          item.classList.toggle("is-active", selected);
          item.setAttribute("aria-selected", String(selected));
          item.tabIndex = selected ? 0 : -1;
        });

        indicators.forEach((indicator) => {
          const active = indicator.dataset.status === mode;
          indicator.classList.toggle("is-active", active);

          const accessibleText = indicator.querySelector(".tr-sr");
          if (accessibleText) {
            accessibleText.textContent =
              labels[indicator.dataset.status] + (active ? " aktywne" : " wygaszone");
          }
        });

        title.textContent = content.title;
        description.textContent = content.description;
        panel.setAttribute("aria-labelledby", tab.id);

        if (moveFocus) tab.focus();
      };

      tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => activate(tab));

        tab.addEventListener("keydown", (event) => {
          let nextIndex = index;

          if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            nextIndex = (index + 1) % tabs.length;
          } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            nextIndex = (index - 1 + tabs.length) % tabs.length;
          } else if (event.key === "Home") {
            nextIndex = 0;
          } else if (event.key === "End") {
            nextIndex = tabs.length - 1;
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