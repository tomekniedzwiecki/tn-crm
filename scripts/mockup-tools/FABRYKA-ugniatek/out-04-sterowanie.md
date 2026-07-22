**Siatka:** nagłówek na pełną szerokość → desktop: foto-karta 7/12 + tabela 5/12, pille pod tabelą → mobile: foto → tabela → pille.

```html
<section id="sterowanie" class="st-section sect-pad">
  <div class="wrap">
    <header class="st-header reveal">
      <p class="eyebrow">STEROWANIE</p>
      <h2 class="h2">Wybierz tryb i poziom intensywności.</h2>
      <p class="lead">Pełna kontrola masażu dopasowana do Ciebie.</p>
    </header>

    <div class="st-grid">
      <figure class="st-photo-card reveal">
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/st-panel.webp"
          width="1536"
          height="1024"
          loading="lazy"
          alt="Panel sterowania masażera z wyświetlaczem i trzema przyciskami"
        >
        <figcaption class="st-callout callout">
          <span>wyświetlacz +<br>3 przyciski</span>
        </figcaption>
      </figure>

      <div class="st-details">
        <div class="st-table-card reveal">
          <table class="st-table" aria-label="Parametry sterowania masażerem">
            <tbody>
              <tr>
                <td class="st-icon-cell" aria-hidden="true">
                  <span class="st-icon">
                    <svg viewBox="0 0 32 32" fill="none">
                      <circle cx="9" cy="8" r="3"></circle>
                      <circle cx="20" cy="7" r="3"></circle>
                      <circle cx="25" cy="16" r="3"></circle>
                      <circle cx="18" cy="17" r="3"></circle>
                      <circle cx="8" cy="18" r="3"></circle>
                      <circle cx="12" cy="26" r="3"></circle>
                      <circle cx="24" cy="26" r="3"></circle>
                      <path d="M5 11.5 3.5 14M16 8.5l-2.5 3M23 10l2 2.5"></path>
                    </svg>
                  </span>
                </td>
                <th scope="row">Tryby pracy</th>
                <td class="st-value display">9 (P1–P9)</td>
              </tr>

              <tr>
                <td class="st-icon-cell" aria-hidden="true">
                  <span class="st-icon">
                    <svg viewBox="0 0 32 32" fill="none">
                      <path d="M5 27h5V19H5zM13.5 27h5V14h-5zM22 27h5V7h-5z"></path>
                    </svg>
                  </span>
                </td>
                <th scope="row">Poziomy intensywności</th>
                <td class="st-value display">1–9</td>
              </tr>

              <tr>
                <td class="st-icon-cell" aria-hidden="true">
                  <span class="st-icon">
                    <svg viewBox="0 0 32 32" fill="none">
                      <path d="M12 6V3.5h8V6M10 7h12a2 2 0 0 1 2 2v19H8V9a2 2 0 0 1 2-2Z"></path>
                      <path d="M12.5 13h7M12.5 18h7M12.5 23h7"></path>
                    </svg>
                  </span>
                </td>
                <th scope="row">Praca / ładowanie USB</th>
                <td class="st-value display">do 2 h / ok. 3,5 h</td>
              </tr>

              <tr>
                <td class="st-icon-cell" aria-hidden="true">
                  <span class="st-icon">
                    <svg viewBox="0 0 32 32" fill="none">
                      <circle cx="16" cy="16" r="12"></circle>
                      <path d="M16 7v9l7 5"></path>
                    </svg>
                  </span>
                </td>
                <th scope="row">Auto-stop</th>
                <td class="st-value display">po 10 min</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="st-pills reveal" aria-label="Dodatkowe cechy">
          <div class="pill st-pill">
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <circle cx="16" cy="16" r="2"></circle>
              <path d="M11.5 11.5a6.4 6.4 0 0 0 0 9M20.5 11.5a6.4 6.4 0 0 1 0 9"></path>
              <path d="M7.5 7.5a12 12 0 0 0 0 17M24.5 7.5a12 12 0 0 1 0 17"></path>
            </svg>
            <span>Bezprzewodowy</span>
          </div>

          <div class="pill st-pill">
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d="M12 6V3.5h8V6M10 7h12a2 2 0 0 1 2 2v19H8V9a2 2 0 0 1 2-2Z"></path>
              <path d="M12.5 14h7M12.5 19h7M12.5 24h7"></path>
            </svg>
            <span>Akumulator 2000 mAh</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <style>
    .st-section {
      overflow: hidden;
      background: var(--paper);
      color: var(--ink);
    }

    .st-section .st-header {
      max-width: 70rem;
      margin: 0 auto var(--s6);
      text-align: center;
    }

    .st-section .st-header .eyebrow {
      margin: 0 0 var(--s2);
    }

    .st-section .st-header .h2 {
      margin: 0;
    }

    .st-section .st-header .lead {
      max-width: 46rem;
      margin: var(--s3) auto 0;
      color: var(--body);
    }

    .st-section .st-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.55fr) minmax(22rem, 1fr);
      gap: var(--s4);
      align-items: stretch;
    }

    .st-section .st-photo-card {
      position: relative;
      min-width: 0;
      margin: 0;
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      background: var(--card);
      box-shadow: var(--shadow-lg);
    }

    .st-section .st-photo-card img {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 34rem;
      object-fit: cover;
      object-position: center;
      border-radius: var(--radius-lg);
    }

    .st-section .st-callout {
      position: absolute;
      left: var(--s4);
      bottom: var(--s5);
      z-index: 1;
      margin: 0;
      padding: var(--s2) var(--s3);
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      background: var(--card);
      color: var(--ink);
      font-size: var(--body-fs);
      font-weight: 700;
      line-height: 1.25;
      box-shadow: var(--shadow-sm);
    }

    .st-section .st-callout::after {
      position: absolute;
      top: 50%;
      left: 100%;
      width: clamp(3rem, 8vw, 7rem);
      height: 1px;
      background: var(--line);
      content: "";
    }

    .st-section .st-details {
      display: flex;
      min-width: 0;
      flex-direction: column;
      gap: var(--s4);
    }

    .st-section .st-table-card {
      flex: 1;
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      background: var(--card);
      box-shadow: var(--shadow-md);
    }

    .st-section .st-table {
      width: 100%;
      height: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }

    .st-section .st-table tr + tr {
      border-top: 1px solid var(--line);
    }

    .st-section .st-table th,
    .st-section .st-table td {
      padding: var(--s4) var(--s3);
      vertical-align: middle;
    }

    .st-section .st-table th {
      width: 42%;
      color: var(--body);
      font-size: var(--body-fs);
      font-weight: 600;
      line-height: 1.35;
      text-align: left;
    }

    .st-section .st-icon-cell {
      width: 4.75rem;
      padding-right: 0;
    }

    .st-section .st-icon {
      display: grid;
      width: 3.5rem;
      height: 3.5rem;
      place-items: center;
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      color: var(--ink);
      background: var(--paper-2);
    }

    .st-section .st-icon svg {
      width: 2rem;
      height: 2rem;
      stroke: currentColor;
      stroke-width: 1.5px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .st-section .st-value.display {
      width: 34%;
      color: var(--ink);
      font-family: var(--font-display);
      font-size: clamp(1.25rem, 1.8vw, 1.75rem);
      font-weight: 700;
      line-height: 1.15;
      text-align: right;
      text-wrap: balance;
    }

    .st-section .st-pills {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      background: var(--card);
      box-shadow: var(--shadow-sm);
    }

    .st-section .st-pill {
      display: flex;
      min-width: 0;
      min-height: 7rem;
      align-items: center;
      justify-content: center;
      gap: var(--s3);
      padding: var(--s3);
      border: 0;
      border-radius: 0;
      background: transparent;
      color: var(--ink);
      font-weight: 600;
      line-height: 1.3;
    }

    .st-section .st-pill + .st-pill {
      border-left: 1px solid var(--line);
    }

    .st-section .st-pill svg {
      width: 2.75rem;
      height: 2.75rem;
      flex: 0 0 auto;
      stroke: currentColor;
      stroke-width: 1.5px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    @media (max-width: 62rem) {
      .st-section .st-grid {
        grid-template-columns: 1fr;
      }

      .st-section .st-photo-card img {
        min-height: 0;
        aspect-ratio: 4 / 3;
      }
    }

    @media (max-width: 40rem) {
      .st-section .st-header {
        margin-bottom: var(--s5);
      }

      .st-section .st-grid,
      .st-section .st-details {
        gap: var(--s3);
      }

      .st-section .st-photo-card img {
        aspect-ratio: 1 / 1;
      }

      .st-section .st-callout {
        left: var(--s3);
        bottom: var(--s3);
        font-size: 0.9rem;
      }

      .st-section .st-table th,
      .st-section .st-table td {
        padding: var(--s3) var(--s2);
      }

      .st-section .st-icon-cell {
        width: 3.75rem;
        padding-left: var(--s3);
      }

      .st-section .st-icon {
        width: 3rem;
        height: 3rem;
      }

      .st-section .st-icon svg {
        width: 1.75rem;
        height: 1.75rem;
      }

      .st-section .st-table th {
        width: auto;
        font-size: 0.95rem;
      }

      .st-section .st-value.display {
        width: 34%;
        font-size: clamp(1.05rem, 5vw, 1.4rem);
      }

      .st-section .st-pill {
        min-height: 6.5rem;
        flex-direction: column;
        gap: var(--s2);
        text-align: center;
      }
    }
  </style>
</section>
```