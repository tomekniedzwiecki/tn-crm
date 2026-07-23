Siatka: desktop 55/45 — foto-karta po lewej, copy po prawej. Mobile — scena 4:5, następnie eyebrow, H2, lead i link.

```html
<section id="moment" class="mo-section sect-pad">
  <div class="wrap">
    <div class="mo-grid">
      <div class="mo-media-card reveal">
        <div class="mo-scene">
          <img
            src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozgrzewek/assets/sc-moment.webp"
            width="1536"
            height="1024"
            loading="lazy"
            alt="Kobieta na sofie pod kocem prowadzi granatowy masażer po ramieniu, obok lampa i kubek"
          >
          <span class="mo-candle-glow" aria-hidden="true"></span>
        </div>
      </div>

      <div class="mo-copy reveal">
        <p class="eyebrow">PO DNIU, PO SWOJEMU</p>

        <h2 class="h2">
          Ciepły moment, który mieści się w
          <span class="swash">wieczorze</span>.
        </h2>

        <p class="lead">
          Spięte barki i kark po dniu przy biurku znają to uczucie. Usiądź z herbatą, wybierz poziom i prowadź masażer po karku, ramionach, plecach lub udach. Rozgrzewek działa bez przewodu, więc rytuał nie musi odbywać się przy gniazdku.
        </p>

        <a class="mo-link" href="#tryby">Zobacz 3 tryby</a>
      </div>
    </div>
  </div>

  <style>
    #moment.mo-section {
      overflow: hidden;
      background: var(--paper);
      color: var(--ink);
    }

    #moment .mo-grid {
      display: grid;
      grid-template-columns: minmax(0, 55fr) minmax(0, 45fr);
      align-items: center;
      gap: var(--s6);
    }

    #moment .mo-media-card {
      min-width: 0;
      padding: 12px;
      overflow: hidden;
      border-radius: var(--radius-lg);
      background: var(--card);
      box-shadow: var(--shadow-md);
    }

    #moment .mo-scene {
      position: relative;
      aspect-ratio: 4 / 5;
      overflow: hidden;
      border-radius: var(--radius-sm);
      background: var(--paper-2);
      isolation: isolate;
    }

    #moment .mo-scene img {
      position: absolute;
      inset: 0;
      z-index: 1;
      display: block;
      width: 100%;
      height: auto;
      min-height: 100%;
      object-fit: cover;
      object-position: 62% center;
      border-radius: var(--radius-sm);
    }

    #moment .mo-candle-glow {
      position: absolute;
      z-index: 2;
      top: 34%;
      right: 8%;
      width: 18%;
      aspect-ratio: 1;
      border-radius: 50%;
      pointer-events: none;
      opacity: 0.22;
      background: radial-gradient(
        circle,
        rgba(255, 255, 255, 0.72) 0%,
        rgba(255, 255, 255, 0.3) 30%,
        rgba(255, 255, 255, 0) 72%
      );
      mix-blend-mode: screen;
      animation: mo-candle-breathe 3.8s ease-in-out infinite;
    }

    #moment .mo-copy {
      max-width: 34rem;
    }

    #moment .mo-copy .eyebrow {
      margin: 0 0 var(--s3);
    }

    #moment .mo-copy .h2 {
      margin: 0;
      color: var(--ink);
      font-size: var(--h2-d);
    }

    #moment .mo-copy .lead {
      max-width: 40rem;
      margin: var(--s4) 0 0;
      color: var(--body);
      font-size: 17px;
    }

    #moment .mo-link {
      display: inline-block;
      margin-top: var(--s4);
      color: var(--ink);
      font-size: 17px;
      font-weight: 600;
      text-decoration-line: underline;
      text-decoration-thickness: 1px;
      text-underline-offset: 0.25em;
      transition: text-decoration-thickness 180ms ease;
    }

    #moment .mo-link:hover {
      text-decoration-thickness: 2px;
    }

    #moment .mo-link:focus-visible {
      outline: 2px solid var(--ink);
      outline-offset: 4px;
      border-radius: var(--radius-sm);
    }

    @keyframes mo-candle-breathe {
      0%,
      100% {
        opacity: 0.18;
        scale: 0.94;
      }

      50% {
        opacity: 0.32;
        scale: 1.08;
      }
    }

    @media (max-width: 767px) {
      #moment .mo-grid {
        grid-template-columns: minmax(0, 1fr);
        gap: var(--s5);
      }

      #moment .mo-scene {
        aspect-ratio: 4 / 5;
      }

      #moment .mo-scene img {
        object-position: 60% center;
      }

      #moment .mo-copy {
        width: 100%;
        max-width: 40ch;
      }

      #moment .mo-copy .eyebrow {
        margin-bottom: var(--s3);
      }

      #moment .mo-copy .h2 {
        font-size: var(--h2-m);
      }

      #moment .mo-copy .lead {
        max-width: 40ch;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #moment .mo-candle-glow {
        animation: none;
        opacity: 0.22;
      }

      #moment .mo-link {
        transition: none;
      }
    }
  </style>
</section>
```