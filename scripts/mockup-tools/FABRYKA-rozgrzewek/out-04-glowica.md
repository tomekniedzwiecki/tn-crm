Siatka: desktop 45/55 — copy po lewej, makro po prawej. Mobile — makro, sygnatura kręgów, H2, opis, mikrocopy, link.

```html
<section id="glowica" class="gl-section sect-pad">
  <div class="wrap">
    <div class="gl-grid">
      <div class="gl-copy reveal">
        <div class="gl-signature">
          <span class="rings-wrap"><svg class="rings" viewBox="0 0 88 46" aria-hidden="true" focusable="false"><path class="r-out" d="M4 44a40 40 0 0 1 80 0"/><path class="r-mid" d="M15 44a29 29 0 0 1 58 0"/><path class="r-in" d="M26 44a18 18 0 0 1 36 0"/></svg></span>
          <span class="eyebrow">KRĘGI CIEPŁA</span>
        </div>

        <h2 class="h2 gl-title">
          Stalowe kulki w koncentrycznych <span class="swash">pierścieniach</span>.
        </h2>

        <p class="lead gl-lead">Kopułowa główka masażera ma 21 stalowych kulkowych bolców ułożonych w pierścieniach. W główce widoczne jest również czerwone światło LED.</p>

        <div class="gl-note">
          <span class="gl-note-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M2.5 12s3.4-5.5 9.5-5.5 9.5 5.5 9.5 5.5-3.4 5.5-9.5 5.5S2.5 12 2.5 12Z"/>
              <circle cx="12" cy="12" r="2.75"/>
            </svg>
          </span>
          <p>Bez dopisywania cudów. Pokazujemy dokładnie to, co znajduje się w produkcie.</p>
        </div>

        <a class="gl-link" href="#obszary">Zobacz, gdzie możesz go używać</a>
      </div>

      <figure class="gl-media reveal">
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozgrzewek/assets/glowica-head.webp"
          width="1600"
          height="1000"
          loading="lazy"
          alt="Makro kopułowej głowicy granatowego masażera: stalowe kulki w pierścieniach i czerwone światło LED"
        >
      </figure>
    </div>
  </div>

  <style scoped>
    #glowica.gl-section {
      overflow: hidden;
      background: var(--paper);
      color: var(--ink);
    }

    #glowica .gl-grid {
      display: grid;
      grid-template-columns: minmax(0, 45fr) minmax(0, 55fr);
      align-items: center;
      gap: var(--s6);
    }

    #glowica .gl-copy {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      min-width: 0;
    }

    #glowica .gl-signature {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--s2);
      margin-bottom: var(--s4);
    }

    #glowica .rings-wrap {
      display: block;
      width: 88px;
      height: 46px;
    }

    #glowica .rings {
      display: block;
      width: 88px;
      height: 46px;
      overflow: visible;
      fill: none;
      stroke-linecap: round;
      stroke-width: 1.75px;
    }

    #glowica .rings path {
      stroke-dasharray: 130;
      stroke-dashoffset: 130;
      transition: stroke-dashoffset 700ms ease;
    }

    #glowica .rings .r-out {
      stroke: var(--cta);
    }

    #glowica .rings .r-mid,
    #glowica .rings .r-in {
      stroke: var(--line);
    }

    #glowica .gl-copy.reveal.in .rings path {
      stroke-dashoffset: 0;
    }

    #glowica .gl-copy.reveal.in .rings .r-mid {
      transition-delay: 100ms;
    }

    #glowica .gl-copy.reveal.in .rings .r-in {
      transition-delay: 200ms;
    }

    #glowica .gl-title {
      max-width: 16ch;
      margin: 0;
      color: var(--ink);
      font-size: var(--h2-d);
    }

    #glowica .gl-lead {
      max-width: 38rem;
      margin: var(--s4) 0 0;
      color: var(--body);
      font-size: 17px;
    }

    #glowica .gl-note {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: center;
      gap: var(--s3);
      width: 100%;
      max-width: 38rem;
      margin-top: var(--s4);
      padding-top: var(--s3);
      border-top: 1px solid var(--line);
      color: var(--body);
    }

    #glowica .gl-note-icon {
      display: grid;
      width: 42px;
      height: 42px;
      place-items: center;
      border: 1px solid var(--line);
      border-radius: 50%;
      color: var(--ink);
    }

    #glowica .gl-note-icon svg {
      width: 24px;
      height: 24px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.75px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    #glowica .gl-note p {
      margin: 0;
      font-size: 17px;
      line-height: 1.55;
    }

    #glowica .gl-link {
      margin-top: var(--s4);
      color: var(--ink);
      font-size: 17px;
      font-weight: 600;
      line-height: 1.4;
      text-decoration-line: underline;
      text-decoration-thickness: 1px;
      text-underline-offset: 0.3em;
    }

    #glowica .gl-link:hover {
      text-decoration-thickness: 2px;
    }

    #glowica .gl-link:focus-visible {
      outline: 2px solid var(--ink);
      outline-offset: 4px;
      border-radius: var(--radius-sm);
    }

    #glowica .gl-media {
      min-width: 0;
      margin: 0;
    }

    #glowica .gl-media img {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 16 / 10;
      object-fit: cover;
      border-radius: var(--radius-lg);
    }

    @media (max-width: 767px) {
      #glowica .gl-grid {
        grid-template-columns: 1fr;
        gap: var(--s5);
      }

      #glowica .gl-media {
        order: 1;
      }

      #glowica .gl-copy {
        order: 2;
      }

      #glowica .gl-media img {
        aspect-ratio: 1 / 1;
      }

      #glowica .gl-title {
        max-width: none;
        font-size: var(--h2-m);
      }

      #glowica .gl-lead,
      #glowica .gl-note,
      #glowica .gl-link {
        font-size: 17px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #glowica .rings path {
        transition: none;
      }
    }
  </style>
</section>
```