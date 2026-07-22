Siatka: nagłówek na pełną szerokość; desktop 3/5 foto-karta + 2/5 tabela i profil; mobile kolejno foto → tabela → profil.

```html
<section id="zestaw" class="ze-section sect-pad">
  <div class="wrap">
    <header class="ze-header reveal">
      <p class="eyebrow">ZESTAW</p>
      <h2 class="h2">Co dokładnie dostajesz</h2>
    </header>

    <div class="ze-grid">
      <figure class="ze-flatlay reveal">
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/ze-flatlay.webp"
          width="1536"
          height="1120"
          loading="lazy"
          alt="Ugniatek, przewód USB, instrukcja obsługi i pudełko zestawu"
        >
        <figcaption class="ze-callout callout">
          <span class="ze-callout-line" aria-hidden="true"></span>
          <span>komplet w pudełku</span>
        </figcaption>
      </figure>

      <div class="ze-details">
        <dl class="ze-spec reveal" aria-label="Specyfikacja urządzenia">
          <div class="ze-spec-row">
            <dt>Wymiary</dt>
            <dd>28 × 16,5 × 11 cm</dd>
          </div>
          <div class="ze-spec-row">
            <dt>Waga</dt>
            <dd>1113 g</dd>
          </div>
          <div class="ze-spec-row">
            <dt>Moc</dt>
            <dd>10 W</dd>
          </div>
          <div class="ze-spec-row">
            <dt>Certyfikaty</dt>
            <dd>CE · RoHS · FCC</dd>
          </div>
        </dl>

        <figure class="ze-profile reveal">
          <div class="ze-profile-image">
            <img
              src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/ze-profil.webp"
              width="1536"
              height="564"
              loading="lazy"
              alt="Ugniatek widziany z profilu"
            >
          </div>

          <figcaption class="ze-measure" aria-label="Wysokość urządzenia: 11 centymetrów">
            <span class="ze-measure-line" aria-hidden="true"></span>
            <span class="ze-measure-label">11 cm</span>
          </figcaption>
        </figure>
      </div>
    </div>
  </div>

  <style scoped>
    #zestaw {
      background: var(--paper);
      color: var(--ink);
    }

    #zestaw .ze-header {
      max-width: var(--content-w);
      margin-bottom: var(--s4);
    }

    #zestaw .ze-header .eyebrow {
      margin: 0 0 var(--s2);
    }

    #zestaw .ze-header .h2 {
      margin: 0;
    }

    #zestaw .ze-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.55fr) minmax(22rem, 1fr);
      gap: var(--s4);
      align-items: stretch;
    }

    #zestaw .ze-flatlay,
    #zestaw .ze-spec,
    #zestaw .ze-profile {
      margin: 0;
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    #zestaw .ze-flatlay {
      position: relative;
      min-height: 30rem;
      overflow: hidden;
    }

    #zestaw .ze-flatlay img {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 30rem;
      object-fit: cover;
      object-position: center;
      border-radius: var(--radius-lg);
    }

    #zestaw .ze-callout {
      position: absolute;
      right: var(--s5);
      bottom: var(--s4);
      display: flex;
      align-items: center;
      gap: var(--s2);
      white-space: nowrap;
      color: var(--ink);
    }

    #zestaw .ze-callout-line {
      position: relative;
      display: block;
      width: clamp(3rem, 8vw, 7.5rem);
      height: 1px;
      background: var(--ink);
    }

    #zestaw .ze-callout-line::before {
      position: absolute;
      top: 50%;
      left: 0;
      width: 0.4rem;
      height: 0.4rem;
      border-radius: 50%;
      background: var(--ink);
      content: "";
      transform: translate(-50%, -50%);
    }

    #zestaw .ze-details {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      gap: var(--s3);
      min-width: 0;
    }

    #zestaw .ze-spec {
      padding: var(--s3) var(--s4);
    }

    #zestaw .ze-spec-row {
      display: grid;
      grid-template-columns: minmax(7rem, 0.8fr) minmax(0, 1.2fr);
      gap: var(--s3);
      align-items: center;
      padding: var(--s3) 0;
      border-bottom: 1px solid var(--line);
    }

    #zestaw .ze-spec-row:first-child {
      padding-top: 0;
    }

    #zestaw .ze-spec-row:last-child {
      padding-bottom: 0;
      border-bottom: 0;
    }

    #zestaw .ze-spec dt,
    #zestaw .ze-spec dd {
      margin: 0;
    }

    #zestaw .ze-spec dt {
      color: var(--body);
    }

    #zestaw .ze-spec dd {
      color: var(--ink);
      font-family: var(--font-display);
      font-weight: 700;
      line-height: 1.2;
      text-align: right;
    }

    #zestaw .ze-profile {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 5.5rem;
      align-items: stretch;
      min-height: 14rem;
      overflow: hidden;
      padding: var(--s3);
    }

    #zestaw .ze-profile-image {
      display: flex;
      align-items: center;
      min-width: 0;
    }

    #zestaw .ze-profile img {
      display: block;
      width: 100%;
      height: auto;
      max-height: 13rem;
      object-fit: contain;
      border-radius: var(--radius-lg);
    }

    #zestaw .ze-measure {
      display: grid;
      grid-template-columns: 1.5rem 1fr;
      gap: var(--s2);
      align-items: center;
      min-width: 0;
      padding-left: var(--s2);
    }

    #zestaw .ze-measure-line {
      position: relative;
      justify-self: center;
      width: 1px;
      height: 78%;
      min-height: 7rem;
      background: var(--ink);
    }

    #zestaw .ze-measure-line::before,
    #zestaw .ze-measure-line::after {
      position: absolute;
      left: 50%;
      width: 1.5rem;
      height: 1px;
      background: var(--ink);
      content: "";
      transform: translateX(-50%);
    }

    #zestaw .ze-measure-line::before {
      top: 0;
    }

    #zestaw .ze-measure-line::after {
      bottom: 0;
    }

    #zestaw .ze-measure-label {
      color: var(--ink);
      font-family: var(--font-display);
      font-weight: 700;
      line-height: 1;
      white-space: nowrap;
    }

    @media (max-width: 900px) {
      #zestaw .ze-grid {
        grid-template-columns: 1fr;
      }

      #zestaw .ze-flatlay {
        min-height: 0;
        aspect-ratio: 4 / 3;
      }

      #zestaw .ze-flatlay img {
        min-height: 0;
      }

      #zestaw .ze-details {
        display: contents;
      }

      #zestaw .ze-spec {
        grid-row: auto;
      }

      #zestaw .ze-profile {
        min-height: 18rem;
      }
    }

    @media (max-width: 640px) {
      #zestaw .ze-header {
        margin-bottom: var(--s3);
      }

      #zestaw .ze-grid {
        gap: var(--s3);
      }

      #zestaw .ze-flatlay {
        aspect-ratio: 1 / 1;
      }

      #zestaw .ze-flatlay img {
        object-position: center;
      }

      #zestaw .ze-callout {
        display: none;
      }

      #zestaw .ze-spec {
        padding: var(--s3);
      }

      #zestaw .ze-spec-row {
        grid-template-columns: minmax(6.5rem, 0.9fr) minmax(0, 1.1fr);
        gap: var(--s2);
      }

      #zestaw .ze-profile {
        grid-template-columns: minmax(0, 1fr) 4.5rem;
        min-height: 16rem;
        padding: var(--s3) var(--s2) var(--s3) var(--s3);
      }

      #zestaw .ze-measure {
        grid-template-columns: 1rem 1fr;
        gap: var(--s1);
        padding-left: var(--s1);
      }

      #zestaw .ze-measure-line::before,
      #zestaw .ze-measure-line::after {
        width: 1rem;
      }
    }
  </style>
</section>
```