**Siatka sekcji**
1. Nagłówek: eyebrow → H2 → lead.  
2. Jeden przełącznik segmentowy z dwoma zakładkami.  
3. Aktywny panel: foto + karta stref, poniżej caption.  
4. Mobile: przełącznik full-width, następnie foto → karta → caption.

```html
<section id="dwie-formy" class="sect-pad">
  <div class="wrap">
    <header class="df-head reveal">
      <p class="eyebrow">DWIE FORMY</p>
      <h2 class="h2">Jedna płaska forma. Dwa sposoby użycia.</h2>
      <p class="lead">Używaj tak, jak Ci wygodnie — dociskaj oburącz lub połóż i oprzyj się.</p>
    </header>

    <div class="df-experience reveal">
      <div class="df-tabs" role="tablist" aria-label="Wybierz sposób użycia Ugniatka">
        <button
          class="df-tab"
          id="df-tab-a"
          type="button"
          role="tab"
          aria-selected="true"
          aria-controls="df-panel-a"
          tabindex="0"
        >
          Dociskam oburącz
        </button>

        <button
          class="df-tab"
          id="df-tab-b"
          type="button"
          role="tab"
          aria-selected="false"
          aria-controls="df-panel-b"
          tabindex="-1"
        >
          Kładę i opieram się
        </button>
      </div>

      <div class="df-panels">
        <article
          class="df-panel df-panel-active"
          id="df-panel-a"
          role="tabpanel"
          aria-labelledby="df-tab-a"
          aria-hidden="false"
        >
          <div class="df-panel-grid">
            <div class="df-photo">
              <img
                src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/df-A.webp"
                width="1200"
                height="800"
                loading="lazy"
                alt="Osoba trzyma Ugniatka za oba uchwyty i dociska urządzenie do uda"
              />
            </div>

            <div class="df-card">
              <svg
                class="df-zones"
                viewBox="0 0 430 430"
                role="img"
                aria-labelledby="df-front-title df-front-desc"
              >
                <title id="df-front-title">Strefy masażu od przodu</title>
                <desc id="df-front-desc">Sylwetka człowieka z oznaczeniami karku, barków, ud i łydek.</desc>

                <g class="df-figure">
                  <path d="M153 52c-16 0-25 12-25 28 0 8 3 15 8 20v15c0 8-6 12-14 15l-18 7c-13 5-19 14-21 29l-7 63-12 48 8 3 16-45 8-51 5 77-1 38 8 82-2 45c0 12 6 20 16 20 9 0 14-7 14-18l3-48 10-71 10 71 3 48c0 11 5 18 14 18 10 0 16-8 16-20l-2-45 8-82-1-38 5-77 8 51 16 45 8-3-12-48-7-63c-2-15-8-24-21-29l-18-7c-8-3-14-7-14-15v-15c5-5 8-12 8-20 0-16-9-28-25-28Z" />
                  <path d="M116 154c8 17 15 27 31 27s23-10 31-27M101 261c12 8 25 11 46 11s34-3 46-11M147 181v91" />
                  <path d="M68 277l-4 15 5 2 5-10 1 13 6 1 4-19M226 277l4 15-5 2-5-10-1 13-6 1-4-19" />
                </g>

                <g class="df-marker">
                  <circle cx="164" cy="106" r="5" />
                  <path d="M169 106H292" />
                  <text x="310" y="112">kark</text>

                  <circle cx="180" cy="147" r="5" />
                  <path d="M185 147H292" />
                  <text x="310" y="153">barki</text>

                  <circle cx="176" cy="282" r="5" />
                  <path d="M181 282H292" />
                  <text x="310" y="288">uda</text>

                  <circle cx="174" cy="345" r="5" />
                  <path d="M179 345H292" />
                  <text x="310" y="351">łydki</text>
                </g>
              </svg>
            </div>
          </div>

          <p class="df-caption">Dociskasz urządzenie oburącz tam, gdzie sięgasz.</p>
        </article>

        <article
          class="df-panel"
          id="df-panel-b"
          role="tabpanel"
          aria-labelledby="df-tab-b"
          aria-hidden="true"
        >
          <div class="df-panel-grid">
            <div class="df-photo">
              <img
                src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/df-B.webp"
                width="1200"
                height="800"
                loading="lazy"
                alt="Ugniatek ułożony między lędźwiami siedzącej osoby a oparciem sofy"
              />
            </div>

            <div class="df-card">
              <svg
                class="df-zones"
                viewBox="0 0 430 430"
                role="img"
                aria-labelledby="df-back-title df-back-desc"
              >
                <title id="df-back-title">Strefy masażu od tyłu</title>
                <desc id="df-back-desc">Sylwetka człowieka od tyłu z oznaczeniami pleców i lędźwi.</desc>

                <g class="df-figure">
                  <path d="M153 52c-16 0-25 12-25 28 0 8 3 15 8 20v15c0 8-6 12-14 15l-18 7c-13 5-19 14-21 29l-7 63-12 48 8 3 16-45 8-51 5 77-1 38 8 82-2 45c0 12 6 20 16 20 9 0 14-7 14-18l3-48 10-71 10 71 3 48c0 11 5 18 14 18 10 0 16-8 16-20l-2-45 8-82-1-38 5-77 8 51 16 45 8-3-12-48-7-63c-2-15-8-24-21-29l-18-7c-8-3-14-7-14-15v-15c5-5 8-12 8-20 0-16-9-28-25-28Z" />
                  <path d="M147 148v48M112 159c10 15 20 22 35 22s25-7 35-22M101 261c12 8 25 11 46 11s34-3 46-11" />
                  <path d="M68 277l-4 15 5 2 5-10 1 13 6 1 4-19M226 277l4 15-5 2-5-10-1 13-6 1-4-19" />
                </g>

                <g class="df-marker">
                  <circle cx="180" cy="171" r="5" />
                  <path d="M185 171H292" />
                  <text x="310" y="177">plecy</text>

                  <circle cx="174" cy="235" r="5" />
                  <path d="M179 235H292" />
                  <text x="310" y="241">lędźwie</text>
                </g>
              </svg>
            </div>
          </div>

          <p class="df-caption">Kładziesz Ugniatka i opierasz się — masuje ciężar ciała.</p>
        </article>
      </div>
    </div>
  </div>

  <style scoped>
    #dwie-formy {
      overflow: hidden;
      color: var(--ink);
      background: var(--paper);
    }

    #dwie-formy .df-head {
      max-width: 58rem;
      margin-inline: auto;
      text-align: center;
    }

    #dwie-formy .df-head .h2 {
      margin-block: var(--s2) var(--s2);
      text-wrap: balance;
    }

    #dwie-formy .df-head .lead {
      max-width: 48rem;
      margin-inline: auto;
      text-wrap: balance;
    }

    #dwie-formy .df-experience {
      margin-top: var(--s5);
      padding: var(--s3);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      background: var(--card);
      box-shadow: var(--shadow-sm);
    }

    #dwie-formy .df-tabs {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      width: min(100%, 44rem);
      margin: 0 auto var(--s3);
      padding: 0;
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      background: var(--paper-2);
    }

    #dwie-formy .df-tab {
      min-width: 0;
      min-height: 3rem;
      padding: var(--s2) var(--s3);
      border: 0;
      border-radius: var(--radius-sm);
      color: var(--ink);
      background: transparent;
      font: inherit;
      font-weight: 600;
      line-height: 1.2;
      cursor: pointer;
      transition:
        color 0.25s var(--mo-ease, ease),
        background-color 0.25s var(--mo-ease, ease);
    }

    #dwie-formy .df-tab[aria-selected="true"] {
      color: var(--cta-ink);
      background: var(--cta);
    }

    #dwie-formy .df-tab[aria-selected="true"]:hover {
      background: var(--cta-hover);
    }

    #dwie-formy .df-tab:focus-visible {
      position: relative;
      z-index: 2;
      outline: 2px solid var(--ink);
      outline-offset: -3px;
    }

    #dwie-formy .df-panels {
      display: grid;
    }

    #dwie-formy .df-panel {
      grid-area: 1 / 1;
      min-width: 0;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition:
        opacity 0.38s var(--mo-ease, ease),
        visibility 0s linear 0.38s;
    }

    #dwie-formy .df-panel.df-panel-active {
      z-index: 1;
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
      transition:
        opacity 0.38s var(--mo-ease, ease),
        visibility 0s linear 0s;
    }

    #dwie-formy .df-panel-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.35fr) minmax(18rem, 0.65fr);
      gap: var(--s3);
      align-items: stretch;
    }

    #dwie-formy .df-photo {
      min-width: 0;
      overflow: hidden;
      border-radius: var(--radius-lg);
      background: var(--paper-3);
    }

    #dwie-formy .df-photo img {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 28rem;
      object-fit: cover;
      border-radius: var(--radius-lg);
    }

    #dwie-formy .df-card {
      display: grid;
      place-items: center;
      min-width: 0;
      min-height: 28rem;
      padding: var(--s3);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      background: var(--paper-2);
    }

    #dwie-formy .df-zones {
      display: block;
      width: min(100%, 28rem);
      height: auto;
      overflow: visible;
      color: var(--ink);
    }

    #dwie-formy .df-figure {
      fill: none;
      stroke: currentColor;
      stroke-width: 1.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    #dwie-formy .df-marker circle {
      fill: currentColor;
      stroke: none;
    }

    #dwie-formy .df-marker path {
      fill: none;
      stroke: currentColor;
      stroke-width: 1.5;
      stroke-linecap: round;
      opacity: 0.55;
    }

    #dwie-formy .df-marker text {
      fill: currentColor;
      stroke: none;
      font-family: inherit;
      font-size: 19px;
      font-weight: 500;
    }

    #dwie-formy .df-caption {
      margin: var(--s3) 0 0;
      color: var(--body);
      font-size: var(--body-fs);
      line-height: 1.5;
    }

    @media (max-width: 720px) {
      #dwie-formy .df-head {
        text-align: left;
      }

      #dwie-formy .df-experience {
        margin-top: var(--s4);
        padding: var(--s2);
      }

      #dwie-formy .df-tabs {
        width: 100%;
        margin-bottom: var(--s2);
      }

      #dwie-formy .df-tab {
        min-height: 3.5rem;
        padding-inline: var(--s2);
      }

      #dwie-formy .df-panel-grid {
        grid-template-columns: minmax(0, 1fr);
        gap: var(--s2);
      }

      #dwie-formy .df-photo img {
        min-height: 0;
        aspect-ratio: 16 / 9;
      }

      #dwie-formy .df-card {
        min-height: 0;
        padding: var(--s2);
      }

      #dwie-formy .df-zones {
        width: min(100%, 25rem);
      }

      #dwie-formy .df-caption {
        margin-top: var(--s2);
      }
    }

    @media (max-width: 460px) {
      #dwie-formy .df-tab {
        font-size: 0.9rem;
      }

      #dwie-formy .df-marker text {
        font-size: 18px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #dwie-formy .df-panel,
      #dwie-formy .df-tab {
        transition-duration: 0.01ms;
      }
    }
  </style>

  <script>
    (() => {
      const init = () => {
        const section = document.getElementById("dwie-formy");
        if (!section || section.dataset.dfReady === "true") return;

        const tabs = Array.from(section.querySelectorAll('[role="tab"]'));
        const panels = Array.from(section.querySelectorAll('[role="tabpanel"]'));

        const activate = (tab, moveFocus = false) => {
          tabs.forEach((item) => {
            const isActive = item === tab;
            item.setAttribute("aria-selected", String(isActive));
            item.tabIndex = isActive ? 0 : -1;
          });

          panels.forEach((panel) => {
            const isActive = panel.id === tab.getAttribute("aria-controls");
            panel.classList.toggle("df-panel-active", isActive);
            panel.setAttribute("aria-hidden", String(!isActive));
          });

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

        section.dataset.dfReady = "true";
      };

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
      } else {
        init();
      }
    })();
  </script>
</section>
```