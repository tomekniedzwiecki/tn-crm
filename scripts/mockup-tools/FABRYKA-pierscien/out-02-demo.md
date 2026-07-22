Siatka:
- **Desktop:** nagłówek na całą szerokość; niżej 2 kolumny z odstępem `--s6`, wyrównane centralnie: telefon CSS po lewej, produkt z przyciskiem i podpisem po prawej; nota pod kolumnami.
- **Mobile:** nagłówek → produkt + przycisk + podpis → telefon → nota.

```html
<section id="02-demo" class="dm-demo sect-pad">
  <div class="wrap">
    <h2 class="h2 dm-title reveal">Naciśnij i patrz, jak ekran sam przewija</h2>

    <div class="dm-grid">
      <div class="dm-phone-wrap reveal">
        <div class="dm-phone" aria-label="Symulowany ekran telefonu z pionowym feedem">
          <div class="dm-screen">
            <div class="dm-feed">
              <article class="dm-card">
                <div class="dm-photo" aria-hidden="true">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div class="dm-copy" aria-hidden="true">
                  <span></span>
                  <span></span>
                </div>
              </article>

              <article class="dm-card">
                <div class="dm-photo" aria-hidden="true">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div class="dm-copy" aria-hidden="true">
                  <span></span>
                  <span></span>
                </div>
              </article>

              <article class="dm-card">
                <div class="dm-photo" aria-hidden="true">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div class="dm-copy" aria-hidden="true">
                  <span></span>
                  <span></span>
                </div>
              </article>

              <article class="dm-card">
                <div class="dm-photo" aria-hidden="true">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div class="dm-copy" aria-hidden="true">
                  <span></span>
                  <span></span>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>

      <div class="dm-product reveal">
        <div class="dm-product-visual">
          <svg class="sig dm-sig" viewBox="0 0 64 64" aria-hidden="true">
            <path d="M27 24a11 11 0 0 0 0 16"></path>
            <path d="M22 18a19 19 0 0 0 0 28"></path>
            <path d="M17 12a27 27 0 0 0 0 40"></path>
          </svg>

          <img
            class="dm-packshot"
            src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/skrolik/galeria/keep2-packshot-pink.webp"
            width="600"
            height="600"
            loading="lazy"
            alt="Różowy Skrolik z trzema przyciskami"
          >
        </div>

        <button
          class="dm-btn"
          type="button"
          aria-label="Przewiń symulowany ekran w dół"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5.5 8.5h13L12 17z"></path>
          </svg>
        </button>

        <p class="dm-caption">Kliknij ▼ — treść zjeżdża w dół</p>
      </div>
    </div>

    <div class="pill dm-note reveal">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3v18"></path>
        <path d="m8.5 6.5 3.5-3.5 3.5 3.5"></path>
        <path d="m8.5 17.5 3.5 3.5 3.5-3.5"></path>
      </svg>
      <span>Przewijanie działa w pionie</span>
    </div>
  </div>

  <style scoped>
    #02-demo {
      background: var(--paper);
      color: var(--ink);
      overflow: hidden;
    }

    #02-demo .dm-title {
      max-width: var(--content-w);
      margin: 0 auto var(--s6);
      font-size: var(--h2-d);
      text-align: center;
      text-wrap: balance;
    }

    #02-demo .dm-grid {
      display: grid;
      grid-template-areas: "phone product";
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: center;
      gap: var(--s6);
    }

    #02-demo .dm-phone-wrap {
      grid-area: phone;
      width: 100%;
    }

    #02-demo .dm-phone {
      width: min(100%, 300px);
      margin-inline: auto;
      padding: 10px;
      border: 2px solid var(--ink);
      border-radius: 36px;
      background: var(--card);
      box-shadow: var(--shadow-md);
    }

    #02-demo .dm-screen {
      width: 100%;
      max-width: 300px;
      aspect-ratio: 9 / 16;
      overflow: hidden;
      border-radius: 26px;
      background: var(--paper-3);
    }

    #02-demo .dm-feed {
      display: flex;
      flex-direction: column;
      gap: var(--s2);
      padding: var(--s2);
      will-change: transform;
      transition: transform .45s var(--mo-ease);
    }

    #02-demo .dm-card {
      flex: 0 0 140px;
      height: 140px;
      overflow: hidden;
      border-radius: var(--radius-sm);
      background: var(--paper-2);
    }

    #02-demo .dm-photo {
      position: relative;
      display: grid;
      grid-template-columns: 1.2fr .8fr;
      gap: var(--s1);
      height: 96px;
      padding: var(--s2);
      background: var(--paper-3);
    }

    #02-demo .dm-photo span {
      display: block;
      border-radius: var(--radius-sm);
      background: var(--line);
    }

    #02-demo .dm-photo span:first-child {
      grid-row: 1 / span 2;
    }

    #02-demo .dm-copy {
      display: grid;
      gap: 7px;
      padding: 11px var(--s2);
    }

    #02-demo .dm-copy span {
      display: block;
      height: 5px;
      border-radius: var(--radius-sm);
      background: var(--line);
    }

    #02-demo .dm-copy span:last-child {
      width: 68%;
    }

    #02-demo .dm-product {
      grid-area: product;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 0;
      text-align: center;
    }

    #02-demo .dm-product-visual {
      position: relative;
      width: min(100%, 390px);
      margin-inline: auto;
    }

    #02-demo .dm-packshot {
      position: relative;
      z-index: 2;
      display: block;
      width: min(100%, 320px);
      height: auto;
      margin-inline: auto;
      border-radius: var(--radius-lg);
    }

    #02-demo .dm-sig {
      position: absolute;
      z-index: 1;
      top: 50%;
      left: 0;
      width: 58%;
      height: auto;
      margin-top: -29%;
      fill: none;
      stroke: var(--cta);
      stroke-width: 1.5px;
      stroke-linecap: round;
      opacity: .55;
    }

    #02-demo .dm-btn {
      display: grid;
      width: 56px;
      height: 56px;
      margin: var(--s2) auto 0;
      padding: 0;
      place-items: center;
      border: 0;
      border-radius: 50%;
      background: var(--cta);
      color: var(--cta-ink);
      box-shadow: var(--shadow-md);
      cursor: pointer;
      transition:
        background-color .2s var(--mo-ease),
        transform .15s var(--mo-ease),
        box-shadow .2s var(--mo-ease);
    }

    #02-demo .dm-btn:hover {
      background: var(--cta-hover);
    }

    #02-demo .dm-btn:active {
      transform: scale(.94);
    }

    #02-demo .dm-btn:focus-visible {
      outline: 2px solid var(--ink);
      outline-offset: 4px;
    }

    #02-demo .dm-btn svg {
      width: 24px;
      height: 24px;
      fill: currentColor;
    }

    #02-demo .dm-caption {
      margin: var(--s2) 0 0;
      color: var(--body);
      font-size: 14px;
      line-height: 1.45;
    }

    #02-demo .dm-note {
      display: flex;
      width: fit-content;
      margin: var(--s5) auto 0;
      align-items: center;
      gap: var(--s2);
      color: var(--body);
      font-size: 14px;
    }

    #02-demo .dm-note svg {
      width: 22px;
      height: 22px;
      flex: 0 0 22px;
      fill: none;
      stroke: var(--ink);
      stroke-width: 1.5px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    @media (max-width: 767px) {
      #02-demo .dm-title {
        margin-bottom: var(--s5);
        font-size: var(--h2-m);
      }

      #02-demo .dm-grid {
        grid-template-areas:
          "product"
          "phone";
        grid-template-columns: minmax(0, 1fr);
        gap: var(--s6);
      }

      #02-demo .dm-product-visual {
        width: min(100%, 330px);
      }

      #02-demo .dm-packshot {
        max-width: 280px;
      }

      #02-demo .dm-phone {
        max-width: 260px;
      }

      #02-demo .dm-note {
        margin-top: var(--s4);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #02-demo .dm-feed,
      #02-demo .dm-btn {
        transition-duration: .01ms;
      }
    }
  </style>

  <script scoped>
    (() => {
      const section = document.getElementById('02-demo');
      if (!section) return;

      const button = section.querySelector('.dm-btn');
      const feed = section.querySelector('.dm-feed');
      const cards = Array.from(section.querySelectorAll('.dm-card'));

      if (!button || !feed || !cards.length) return;

      let activeCard = 0;

      const getStep = () => {
        const styles = window.getComputedStyle(feed);
        const gap = parseFloat(styles.rowGap || styles.gap) || 0;
        return cards[0].getBoundingClientRect().height + gap;
      };

      const updateFeed = () => {
        feed.style.transform = `translateY(${-activeCard * getStep()}px)`;
      };

      button.addEventListener('click', () => {
        activeCard = activeCard >= cards.length - 1 ? 0 : activeCard + 1;
        updateFeed();
      });

      window.addEventListener('resize', updateFeed, { passive: true });
    })();
  </script>
</section>
```