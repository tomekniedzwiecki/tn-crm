Siatka: desktop 5/7 — foto-karta po lewej, treść i parametry po prawej. Mobile — zdjęcie, nagłówek, udźwig, opis i lista cech.

```html
<section id="wytrzymalosc" class="wt-wytrz band sect-pad">
  <div class="wrap">
    <div class="wt-grid">
      <figure class="wt-card reveal">
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/brzuszek/assets/sc-wytrz-detal.webp"
          width="1600"
          height="1100"
          loading="lazy"
          alt="Niski kadr konstrukcji: poprzeczki podłogowe, diagonalna belka i punkty łączenia"
        >
      </figure>

      <div class="wt-content reveal">
        <header class="wt-header">
          <div class="wt-signature">
            <p class="eyebrow">KONSTRUKCJA</p>
            <span class="reps" aria-hidden="true">
              <i></i><i></i><i></i><i></i><i></i>
            </span>
          </div>

          <h2 class="h2">
            Trójkątna rama. Konkretna <span class="swash">nośność</span>.
          </h2>
        </header>

        <div class="wt-capacity" aria-label="Około 200 kilogramów deklarowanego udźwigu">
          <p class="wt-value display">
            <span aria-hidden="true">≈</span>
            <span class="wt-count" data-countup="200" aria-hidden="true">200</span>
            <span class="wt-unit" aria-hidden="true">kg</span>
          </p>
          <p class="wt-caption">deklarowany udźwig</p>
        </div>

        <p class="lead wt-lead">
          Konstrukcja ma trójkątny układ A-frame i pogrubione metalowe rurki.
        </p>

        <ul class="wt-features" aria-label="Cechy konstrukcji">
          <li class="wt-feature">
            <span class="wt-icon" aria-hidden="true">
              <svg viewBox="0 0 56 56" fill="none">
                <rect x="6.5" y="17.5" width="10" height="21" rx="4"></rect>
                <rect x="39.5" y="17.5" width="10" height="21" rx="4"></rect>
                <path d="M16.5 23.5h23M16.5 32.5h23"></path>
                <path d="M9.5 23h4M9.5 28h4M9.5 33h4M42.5 23h4M42.5 28h4M42.5 33h4"></path>
              </svg>
            </span>
            <p>Dwie poprzeczki są zakończone antypoślizgowymi końcówkami.</p>
          </li>

          <li class="wt-feature">
            <span class="wt-icon" aria-hidden="true">
              <svg viewBox="0 0 56 56" fill="none">
                <path d="M13 13.5h30a5 5 0 0 1 5 5v24a5 5 0 0 1-5 5H13a5 5 0 0 1-5-5v-24a5 5 0 0 1 5-5Z"></path>
                <path d="M20 13.5 23 8h10l3 5.5"></path>
                <rect x="21" y="21" width="14" height="5" rx="2"></rect>
                <path d="M15 42h26"></path>
              </svg>
            </span>
            <p>Obudowę wykonano z ABS.</p>
          </li>

          <li class="wt-feature">
            <span class="wt-icon" aria-hidden="true">
              <svg viewBox="0 0 56 56" fill="none">
                <path d="M28 9v7M20 13h16"></path>
                <path d="M14 19h28"></path>
                <path d="M17 19 9 33h16L17 19ZM39 19l-8 14h16l-8-14Z"></path>
                <path d="M28 19v25M19 47h18"></path>
              </svg>
            </span>
            <p>440 lbs według specyfikacji produktu, czyli około 200 kg.</p>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <style scoped>
    .wt-wytrz {
      color: var(--ink);
      overflow: hidden;
    }

    .wt-wytrz .wt-grid {
      display: grid;
      grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
      align-items: center;
      gap: var(--s6);
    }

    .wt-wytrz .wt-card {
      margin: 0;
      padding: 12px;
      overflow: hidden;
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
    }

    .wt-wytrz .wt-card img {
      display: block;
      width: 100%;
      height: auto;
      object-fit: cover;
      border-radius: var(--radius-sm);
    }

    .wt-wytrz .wt-content {
      display: grid;
      gap: var(--s4);
      min-width: 0;
    }

    .wt-wytrz .wt-header {
      display: grid;
      gap: var(--s3);
    }

    .wt-wytrz .wt-signature {
      display: grid;
      justify-items: start;
      gap: var(--s2);
    }

    .wt-wytrz .eyebrow {
      margin: 0;
    }

    .wt-wytrz .h2 {
      max-width: 14ch;
      margin: 0;
      font-size: var(--h2-d);
      color: var(--ink);
    }

    .wt-wytrz .wt-capacity {
      display: grid;
      justify-items: start;
      gap: var(--s1);
    }

    .wt-wytrz .wt-value {
      display: flex;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 0.12em;
      margin: 0;
      color: var(--ink);
      font-size: clamp(56px, 7vw, 96px);
      font-weight: 800;
      line-height: 0.9;
      letter-spacing: -0.055em;
    }

    .wt-wytrz .wt-count {
      min-width: 3ch;
      font-variant-numeric: tabular-nums;
      text-align: right;
    }

    .wt-wytrz .wt-unit {
      font-size: 0.56em;
      letter-spacing: -0.035em;
    }

    .wt-wytrz .wt-caption {
      margin: 0;
      color: var(--body);
      font-family: var(--font-text);
      font-size: var(--body-fs);
      line-height: 1.4;
    }

    .wt-wytrz .wt-lead {
      max-width: 34em;
      margin: 0;
      color: var(--body);
      font-size: var(--body-fs);
    }

    .wt-wytrz .wt-features {
      display: grid;
      gap: var(--s3);
      margin: var(--s1) 0 0;
      padding: 0;
      list-style: none;
    }

    .wt-wytrz .wt-feature {
      display: grid;
      grid-template-columns: 56px minmax(0, 1fr);
      align-items: center;
      gap: var(--s3);
    }

    .wt-wytrz .wt-feature p {
      margin: 0;
      color: var(--body);
      font-family: var(--font-text);
      font-size: var(--body-fs);
      line-height: 1.5;
    }

    .wt-wytrz .wt-icon {
      display: grid;
      width: 56px;
      height: 56px;
      place-items: center;
      color: var(--ink);
    }

    .wt-wytrz .wt-icon svg {
      display: block;
      width: 100%;
      height: 100%;
      stroke: currentColor;
      stroke-width: 1.75px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    @media (max-width: 760px) {
      .wt-wytrz .wt-grid {
        grid-template-columns: 1fr;
        gap: var(--s5);
      }

      .wt-wytrz .wt-card {
        width: 100%;
      }

      .wt-wytrz .wt-card img {
        width: 100%;
        height: 40vh;
        min-height: 280px;
        object-fit: cover;
        object-position: center;
      }

      .wt-wytrz .wt-content {
        gap: var(--s4);
      }

      .wt-wytrz .h2 {
        max-width: none;
        font-size: var(--h2-m);
      }

      .wt-wytrz .wt-value {
        font-size: 56px;
      }

      .wt-wytrz .wt-feature {
        grid-template-columns: 48px minmax(0, 1fr);
        align-items: start;
        gap: var(--s3);
      }

      .wt-wytrz .wt-icon {
        width: 48px;
        height: 48px;
      }
    }
  </style>

  <script>
    (() => {
      const section = document.getElementById('wytrzymalosc');
      if (!section) return;

      const count = section.querySelector('[data-countup]');
      if (!count) return;

      const target = Number(count.dataset.countup);
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reducedMotion || !Number.isFinite(target)) {
        count.textContent = String(target);
        return;
      }

      let started = false;

      const animate = () => {
        if (started) return;
        started = true;

        const duration = 1100;
        const startTime = performance.now();

        const tick = (now) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          count.textContent = String(Math.round(target * eased));

          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            count.textContent = String(target);
          }
        };

        requestAnimationFrame(tick);
      };

      if (!('IntersectionObserver' in window)) {
        animate();
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        animate();
      }, { threshold: 0.35 });

      observer.observe(section);
    })();
  </script>
</section>
```