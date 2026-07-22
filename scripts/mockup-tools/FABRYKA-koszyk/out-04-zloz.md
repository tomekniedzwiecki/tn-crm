**Siatka sekcji**
- Nagłówek `.h2`
- Interaktywna karta: przełącznik → crossfade dwóch stanów → pojedyncza strzałka `.arc`
- Pas-karta: zdjęcie szuflady + tekst + 3 ikony
- Dolny rząd: 2 pille informacyjne + CTA; na mobile układ pionowy

```html
<section id="zloz" class="zl-section sect-pad">
  <div class="wrap">
    <h2 class="h2 zl-title">Po smażeniu składa się na płasko</h2>

    <div class="zl-stage-card reveal">
      <div
        class="zl-tabs"
        role="tablist"
        aria-label="Wybierz sposób prezentacji odsączka"
      >
        <button
          class="zl-tab is-active"
          id="zl-tab-open"
          type="button"
          role="tab"
          aria-selected="true"
          aria-controls="zl-panel-open"
          tabindex="0"
          data-zl-state="open"
        >
          Rozłożony
        </button>
        <button
          class="zl-tab"
          id="zl-tab-flat"
          type="button"
          role="tab"
          aria-selected="false"
          aria-controls="zl-panel-flat"
          tabindex="-1"
          data-zl-state="flat"
        >
          Złożony
        </button>
      </div>

      <div class="zl-stage">
        <div
          class="zl-state is-active"
          id="zl-panel-open"
          role="tabpanel"
          aria-labelledby="zl-tab-open"
          aria-hidden="false"
          data-zl-panel="open"
        >
          <span class="zl-state-label">Rozłożony</span>
          <img
            src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/packshot-rozlozony.webp"
            width="1200"
            height="1000"
            loading="lazy"
            alt="Rozłożony metalowy odsączek gotowy do użycia nad garnkiem"
          >
        </div>

        <div
          class="zl-state"
          id="zl-panel-flat"
          role="tabpanel"
          aria-labelledby="zl-tab-flat"
          aria-hidden="true"
          data-zl-panel="flat"
        >
          <span class="zl-state-label">Złożony</span>
          <img
            src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/packshot-plaski.webp"
            width="1200"
            height="1000"
            loading="lazy"
            alt="Złożony odsączek w formie płaskiego metalowego dysku"
          >
        </div>
      </div>

      <svg class="arc zl-arc" viewBox="0 0 120 60" aria-hidden="true">
        <path d="M18 18 C42 48 78 48 101 20"></path>
        <path d="M92 22 L102 19 L99 29"></path>
      </svg>
    </div>

    <div class="zl-drawer reveal">
      <div class="zl-drawer-media">
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/sc-szuflada.webp"
          width="1400"
          height="900"
          loading="lazy"
          alt="Dłoń wsuwająca płasko złożony odsączek do kuchennej szuflady"
        >
      </div>

      <div class="zl-drawer-copy">
        <p class="display zl-display">
          Płaski jak pokrywka — wsuwasz do szuflady
        </p>

        <div class="zl-icons" aria-label="Garnek, kropla i płaski dysk">
          <span class="zl-icon">
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <path d="M12 18h24v20a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4V18Z"></path>
              <path d="M9 18h30M18 14c0-3 2-5 6-5s6 2 6 5M5 22h7M36 22h7"></path>
            </svg>
          </span>

          <span class="zl-icon">
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <path d="M24 5C20 12 12 21 12 30a12 12 0 0 0 24 0C36 21 28 12 24 5Z"></path>
              <path d="M17 30c0 4 3 7 7 7"></path>
            </svg>
          </span>

          <span class="zl-icon">
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <ellipse cx="24" cy="24" rx="18" ry="8"></ellipse>
              <ellipse cx="24" cy="22" rx="14" ry="5"></ellipse>
              <path d="M6 24v4c0 4 8 8 18 8s18-4 18-8v-4"></path>
            </svg>
          </span>
        </div>
      </div>
    </div>

    <div class="zl-actions reveal">
      <div class="zl-benefits">
        <span class="pill zl-pill">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path d="M5 9 16 4l11 5v14l-11 5-11-5V9Z"></path>
            <path d="m5 9 11 5 11-5M16 14v14"></path>
          </svg>
          Płatność przy odbiorze
        </span>

        <span class="pill zl-pill">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path d="M7 10a11 11 0 1 1-2 8"></path>
            <path d="M7 4v6h6"></path>
          </svg>
          14 dni na zwrot
        </span>
      </div>

      <a class="btn cta zl-cta" href="#zamow">
        Zamawiam Odsączek
      </a>
    </div>
  </div>

  <style scoped>
    .zl-section {
      background: var(--paper);
      color: var(--ink);
    }

    .zl-title {
      max-width: var(--content-w);
      margin: 0 auto var(--s5);
      font-size: var(--h2-d);
      text-align: center;
    }

    .zl-stage-card {
      position: relative;
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      gap: var(--s3);
      min-height: 560px;
      padding: var(--s4);
      overflow: hidden;
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    .zl-tabs {
      position: relative;
      z-index: 3;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      width: min(100%, 360px);
      margin-inline: auto;
      padding: 4px;
      background: var(--paper-2);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
    }

    .zl-tab {
      min-height: 46px;
      padding: 8px 18px;
      color: var(--body);
      font: inherit;
      font-weight: 700;
      cursor: pointer;
      background: transparent;
      border: 0;
      border-radius: var(--radius-lg);
    }

    .zl-tab.is-active {
      color: var(--cta-ink);
      background: var(--cta);
    }

    .zl-tab:focus-visible {
      outline: 2px solid var(--cta);
      outline-offset: 3px;
    }

    .zl-stage {
      position: relative;
      min-height: 430px;
    }

    .zl-state {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      padding: var(--s4) var(--s4) var(--s6);
      opacity: 0;
      visibility: hidden;
      transition:
        opacity 0.38s var(--mo-ease),
        visibility 0s linear 0.38s;
      pointer-events: none;
    }

    .zl-state.is-active {
      z-index: 1;
      opacity: 1;
      visibility: visible;
      transition:
        opacity 0.38s var(--mo-ease),
        visibility 0s linear 0s;
      pointer-events: auto;
    }

    .zl-state img {
      display: block;
      width: min(100%, 650px);
      height: auto;
      max-height: 390px;
      object-fit: contain;
      border-radius: var(--radius-lg);
    }

    .zl-state-label {
      position: absolute;
      top: 0;
      left: var(--s3);
      padding: 7px 13px;
      color: var(--ink);
      font-size: 15px;
      font-weight: 700;
      background: var(--paper-2);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
    }

    .zl-arc {
      position: absolute;
      z-index: 2;
      right: var(--s4);
      bottom: var(--s3);
      width: 120px;
      height: 60px;
      stroke: var(--cta);
      stroke-width: 2px;
      fill: none;
      pointer-events: none;
    }

    .zl-drawer {
      display: grid;
      grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.75fr);
      margin-top: var(--s4);
      overflow: hidden;
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    .zl-drawer-media {
      min-height: 330px;
    }

    .zl-drawer-media img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: var(--radius-lg);
    }

    .zl-drawer-copy {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: var(--s4);
      padding: var(--s5);
    }

    .zl-display {
      margin: 0;
      color: var(--ink);
      font-size: 22px;
      font-weight: 700;
      line-height: 1.2;
    }

    .zl-icons {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      align-items: center;
    }

    .zl-icon {
      display: grid;
      place-items: center;
      min-height: 64px;
      border-right: 1px solid var(--line);
    }

    .zl-icon:last-child {
      border-right: 0;
    }

    .zl-icon svg {
      width: 48px;
      height: 48px;
      fill: none;
      stroke: var(--ink);
      stroke-width: 1.5px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .zl-actions {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(250px, 0.45fr);
      gap: var(--s3);
      align-items: stretch;
      margin-top: var(--s4);
    }

    .zl-benefits {
      display: flex;
      gap: var(--s2);
      min-width: 0;
    }

    .zl-pill {
      display: inline-flex;
      flex: 1 1 0;
      align-items: center;
      justify-content: center;
      gap: 10px;
      min-height: 58px;
      padding: 10px 16px;
      color: var(--ink);
      background: var(--card);
      border: 1px solid var(--line);
    }

    .zl-pill svg {
      flex: 0 0 auto;
      width: 29px;
      height: 29px;
      fill: none;
      stroke: var(--ink);
      stroke-width: 1.5px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .zl-cta {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 58px;
      text-align: center;
    }

    @media (max-width: 760px) {
      .zl-title {
        margin-bottom: var(--s4);
        font-size: var(--h2-m);
      }

      .zl-stage-card {
        min-height: 490px;
        padding: var(--s3);
      }

      .zl-tabs {
        width: 100%;
      }

      .zl-stage {
        min-height: 380px;
      }

      .zl-state {
        padding: var(--s3) var(--s2) var(--s6);
      }

      .zl-state img {
        max-height: 330px;
      }

      .zl-state-label {
        top: var(--s1);
        left: var(--s1);
      }

      .zl-arc {
        right: var(--s2);
        bottom: var(--s2);
        width: 92px;
      }

      .zl-drawer {
        grid-template-columns: 1fr;
      }

      .zl-drawer-media {
        min-height: 250px;
      }

      .zl-drawer-media img {
        height: auto;
        aspect-ratio: 4 / 3;
        object-fit: cover;
      }

      .zl-drawer-copy {
        padding: var(--s4);
      }

      .zl-display {
        font-size: 22px;
      }

      .zl-actions {
        grid-template-columns: 1fr;
      }

      .zl-benefits {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }

      .zl-pill {
        padding-inline: 10px;
        font-size: 14px;
      }

      .zl-cta {
        width: 100%;
      }
    }

    @media (max-width: 440px) {
      .zl-stage-card {
        min-height: 440px;
      }

      .zl-stage {
        min-height: 330px;
      }

      .zl-state img {
        max-height: 285px;
      }

      .zl-benefits {
        grid-template-columns: 1fr;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .zl-state {
        transition: none;
      }
    }
  </style>

  <script scoped>
    (() => {
      const section = document.getElementById('zloz');
      if (!section) return;

      const tabs = Array.from(section.querySelectorAll('[role="tab"]'));
      const panels = Array.from(section.querySelectorAll('[role="tabpanel"]'));

      const activateTab = (tab, moveFocus = false) => {
        const state = tab.dataset.zlState;

        tabs.forEach((item) => {
          const active = item === tab;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-selected', String(active));
          item.tabIndex = active ? 0 : -1;
        });

        panels.forEach((panel) => {
          const active = panel.dataset.zlPanel === state;
          panel.classList.toggle('is-active', active);
          panel.setAttribute('aria-hidden', String(!active));
        });

        if (moveFocus) tab.focus();
      };

      tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => activateTab(tab));

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
          activateTab(tabs[nextIndex], true);
        });
      });
    })();
  </script>
</section>
```