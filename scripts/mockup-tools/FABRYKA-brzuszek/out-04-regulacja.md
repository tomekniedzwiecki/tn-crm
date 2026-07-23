Siatka: desktop 5/7 — treść i regulacja po lewej, foto-karta po prawej. Mobile — H2, liczby, opis, mikrocopy, przełącznik, CTA, zdjęcie.

```html
<section id="regulacja" class="rg-reg sect-pad" aria-labelledby="rg-title">
  <div class="wrap rg-wrap">
    <div class="rg-content reveal">
      <div class="rg-heading">
        <span class="eyebrow">REGULUJESZ TRUDNOŚĆ</span>
        <span class="reps" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>

        <h2 id="rg-title" class="h2">
          Nie musisz zaczynać od <span class="swash">najtrudniejszego</span> ustawienia.
        </h2>
      </div>

      <div class="rg-stats" aria-label="Zakres regulacji urządzenia">
        <div class="rg-stat">
          <span class="display rg-number" data-countup="5">5</span>
          <span class="rg-label">wysokości</span>
        </div>

        <div class="rg-stat">
          <span class="display rg-number" data-countup="2">2</span>
          <span class="rg-label">kąty nachylenia</span>
        </div>
      </div>

      <div class="rg-copy">
        <p class="lead">
          Wyższe ustawienie oznacza większą trudność, więc możesz dobrać poziom od początkującego do zaawansowanego.
        </p>
        <p class="rg-microcopy">
          Poziom dobieraj do własnych możliwości i poprawnej techniki ruchu.
        </p>
      </div>

      <div class="rg-actions">
        <div class="rg-toggle-group">
          <div class="rg-toggle" role="tablist" aria-label="Wybierz poziom trudności">
            <button
              type="button"
              role="tab"
              aria-selected="true"
              aria-controls="rg-helper"
              tabindex="0"
            >
              Łagodniej
            </button>
            <button
              type="button"
              role="tab"
              aria-selected="false"
              aria-controls="rg-helper"
              tabindex="-1"
            >
              Trudniej
            </button>
          </div>

          <p id="rg-helper" class="rg-helper" aria-live="polite">
            Niższe ustawienie — łatwiejszy ruch.
          </p>
        </div>

        <a class="btn cta rg-cta" data-checkout href="#zamow">
          Wybieram swój poziom
        </a>
      </div>
    </div>

    <div class="rg-media reveal">
      <img
        src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/brzuszek/assets/sc-reg-side.webp"
        width="1600"
        height="1100"
        loading="lazy"
        alt="Boczny profil biało-różowej maszyny z widoczną szyną i regulacją"
      >
    </div>
  </div>

  <style scoped>
    .rg-reg {
      background: var(--paper);
      color: var(--ink);
    }

    .rg-reg .rg-wrap {
      display: grid;
      grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
      gap: var(--s6);
      align-items: center;
    }

    .rg-reg .rg-content {
      min-width: 0;
    }

    .rg-reg .rg-heading {
      display: grid;
      justify-items: start;
    }

    .rg-reg .reps {
      margin-top: var(--s2);
    }

    .rg-reg .h2 {
      max-width: 13ch;
      margin: var(--s4) 0 0;
      color: var(--ink);
      font-size: var(--h2-d);
    }

    .rg-reg .rg-stats {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      max-width: 500px;
      margin-top: var(--s5);
    }

    .rg-reg .rg-stat {
      display: grid;
      align-content: end;
      justify-items: start;
      min-width: 0;
    }

    .rg-reg .rg-stat + .rg-stat {
      border-left: 1px solid var(--line);
      padding-left: var(--s5);
    }

    .rg-reg .rg-number {
      color: var(--ink);
      font-size: clamp(72px, 9vw, 128px);
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      line-height: .78;
      letter-spacing: -.06em;
    }

    .rg-reg .rg-label {
      margin-top: var(--s2);
      color: var(--ink);
      font-family: var(--font-text);
      font-size: 17px;
      font-weight: 600;
      line-height: 1.25;
    }

    .rg-reg .rg-copy {
      max-width: 590px;
      margin-top: var(--s5);
    }

    .rg-reg .lead {
      margin: 0;
      color: var(--body);
      font-size: 17px;
    }

    .rg-reg .rg-microcopy {
      margin: var(--s3) 0 0;
      color: var(--body);
      font-family: var(--font-text);
      font-size: 14px;
      line-height: 1.5;
    }

    .rg-reg .rg-actions {
      display: flex;
      gap: var(--s3);
      align-items: flex-start;
      margin-top: var(--s4);
    }

    .rg-reg .rg-toggle-group {
      flex: 1 1 270px;
      min-width: 230px;
    }

    .rg-reg .rg-toggle {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      padding: 3px;
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: var(--card);
    }

    .rg-reg .rg-toggle button {
      min-height: 48px;
      padding: 10px 16px;
      border: 0;
      border-radius: 999px;
      background: var(--card);
      color: var(--ink);
      font: 600 15px/1 var(--font-text);
      cursor: pointer;
    }

    .rg-reg .rg-toggle button[aria-selected="true"] {
      background: var(--ink);
      color: var(--card);
    }

    .rg-reg .rg-toggle button:focus-visible {
      outline: 2px solid var(--ink);
      outline-offset: 2px;
    }

    .rg-reg .rg-helper {
      min-height: 1.5em;
      margin: var(--s2) 0 0;
      color: var(--body);
      font-family: var(--font-text);
      font-size: 14px;
      line-height: 1.5;
    }

    .rg-reg .rg-cta {
      flex: 0 0 auto;
      justify-content: center;
      min-height: 56px;
      white-space: nowrap;
    }

    .rg-reg .rg-media {
      min-width: 0;
      padding: 12px;
      border-radius: var(--radius-lg);
      background: var(--card);
      box-shadow: var(--shadow-md);
    }

    .rg-reg .rg-media img {
      display: block;
      width: 100%;
      height: auto;
      object-fit: cover;
      border-radius: var(--radius-sm);
    }

    @media (max-width: 820px) {
      .rg-reg .rg-wrap {
        grid-template-columns: 1fr;
        gap: var(--s5);
      }

      .rg-reg .h2 {
        max-width: 16ch;
        font-size: var(--h2-m);
      }

      .rg-reg .rg-stats {
        max-width: none;
        margin-top: var(--s5);
      }

      .rg-reg .rg-stat {
        justify-items: center;
        text-align: center;
      }

      .rg-reg .rg-stat + .rg-stat {
        padding-left: var(--s3);
      }

      .rg-reg .rg-number {
        font-size: clamp(72px, 24vw, 128px);
      }

      .rg-reg .rg-copy {
        max-width: none;
      }

      .rg-reg .rg-actions {
        display: grid;
        grid-template-columns: 1fr;
      }

      .rg-reg .rg-toggle-group {
        min-width: 0;
      }

      .rg-reg .rg-cta {
        width: 100%;
        white-space: normal;
        text-align: center;
      }

      .rg-reg .rg-media {
        margin-top: 0;
      }
    }

    @media (max-width: 420px) {
      .rg-reg .rg-stat + .rg-stat {
        padding-left: var(--s2);
      }

      .rg-reg .rg-label {
        font-size: 15px;
      }

      .rg-reg .rg-toggle button {
        padding-inline: 10px;
      }
    }
  </style>

  <script>
    (() => {
      const section = document.getElementById('regulacja');
      if (!section) return;

      const counters = [...section.querySelectorAll('[data-countup]')];
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const setStaticValues = () => {
        counters.forEach((counter) => {
          counter.textContent = counter.dataset.countup;
        });
      };

      const runCounters = () => {
        counters.forEach((counter) => {
          const target = Number(counter.dataset.countup);
          const duration = 800;
          let startTime;

          counter.textContent = '0';

          const update = (time) => {
            if (!startTime) startTime = time;

            const progress = Math.min((time - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            counter.textContent = String(Math.round(target * eased));

            if (progress < 1) {
              window.requestAnimationFrame(update);
            } else {
              counter.textContent = String(target);
            }
          };

          window.requestAnimationFrame(update);
        });
      };

      if (reducedMotion || !('IntersectionObserver' in window)) {
        setStaticValues();
      } else {
        const counterObserver = new IntersectionObserver((entries, observer) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            runCounters();
            observer.disconnect();
          }
        }, { threshold: 0.3 });

        counterObserver.observe(section);
      }

      const tabs = [...section.querySelectorAll('.rg-toggle [role="tab"]')];
      const helper = section.querySelector('#rg-helper');
      const helperTexts = [
        'Niższe ustawienie — łatwiejszy ruch.',
        'Wyższe ustawienie — większa trudność.'
      ];

      const activateTab = (selectedTab) => {
        tabs.forEach((tab, index) => {
          const isActive = tab === selectedTab;
          tab.setAttribute('aria-selected', String(isActive));
          tab.tabIndex = isActive ? 0 : -1;

          if (isActive && helper) {
            helper.textContent = helperTexts[index];
          }
        });
      };

      tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => activateTab(tab));

        tab.addEventListener('keydown', (event) => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

          event.preventDefault();

          let nextIndex = index;
          if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
          if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
          if (event.key === 'Home') nextIndex = 0;
          if (event.key === 'End') nextIndex = tabs.length - 1;

          activateTab(tabs[nextIndex]);
          tabs[nextIndex].focus();
        });
      });
    })();
  </script>
</section>
```