**Siatka sekcji**
- **Desktop ≥768 px:** 2 kolumny 1fr/1fr, gap 4 px, wspólna wysokość `clamp(560px, 85vh, 860px)`. Karta absolutnie wyśrodkowana, nachodzi na dolną część dyptyku. Callout na prawym-górnym obszarze lewego kadru.
- **Mobile <768 px:** 1 kolumna: kadr L `16:10` → karta z `margin-top:-40px` → kadr P `16:10`. Treść karty i CTA wyśrodkowane, CTA na pełną szerokość.

```html
<section id="hero" class="hr-hero">
  <div class="wrap hr-wrap">
    <div class="hr-layout">
      <figure class="hr-frame hr-frame-l">
        <img
          class="hr-image"
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/hero-L.webp"
          width="1024"
          height="1536"
          loading="eager"
          fetchpriority="high"
          alt="Mężczyzna dociska bezprzewodowy masażer Ugniatek do karku, trzymając go oburącz."
        >

        <div class="callout reveal hr-callout" aria-label="Dwa uchwyty masażera">
          <svg class="hr-callout-line" viewBox="0 0 94 52" aria-hidden="true">
            <circle cx="4" cy="46" r="3" fill="currentColor" stroke="none"></circle>
            <path d="M7 44 57 8h33"></path>
            <circle cx="90" cy="8" r="2" fill="currentColor" stroke="none"></circle>
          </svg>
          <span class="hr-callout-text">2 uchwyty</span>
        </div>
      </figure>

      <figure class="hr-frame hr-frame-p">
        <img
          class="hr-image"
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/hero-P.webp"
          width="1024"
          height="1536"
          loading="eager"
          alt="Mężczyzna opiera plecy o bezprzewodowy masażer Ugniatek podczas odpoczynku na kanapie."
        >
      </figure>

      <div class="reveal hr-card">
        <h1 class="hr-title">
          <span class="hr-title-line">Dociskaj oburącz.</span>
          <span class="hr-title-line">Albo oprzyj się plecami.</span>
        </h1>

        <p class="lead hr-lead">
          Płaski, bezprzewodowy masażer z 6 głowicami — na kark, barki, uda i łydki albo pod plecy.
        </p>

        <div class="hr-price">
          <span data-price>189,00 zł</span>
        </div>

        <a class="btn cta hr-cta" data-checkout href="#zamow">Zamawiam Ugniatka</a>

        <p class="hr-micro">
          Płatność online lub przy odbiorze · 14 dni na zwrot
        </p>

        <div class="hr-pills" aria-label="Informacje o zakupie">
          <div class="pill hr-pill">
            <svg class="hr-pill-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z"></path>
              <path d="m4 7.5 8 4.5 8-4.5M12 12v9M8 5.25l8 4.5"></path>
            </svg>
            <span>Za pobraniem</span>
          </div>

          <div class="pill hr-pill">
            <svg class="hr-pill-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4.7 8.2A8.5 8.5 0 1 1 5 16.4"></path>
              <path d="M4.7 3.8v4.4h4.4"></path>
            </svg>
            <span>Zwrot 14 dni</span>
          </div>

          <div class="pill hr-pill">
            <svg class="hr-pill-icon" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="5" y="6" width="13" height="14" rx="2"></rect>
              <path d="M9 3h5v3M18 10h2v6h-2M8.5 10h6M8.5 13h6M8.5 16h6"></path>
            </svg>
            <span>Bezprzewodowy</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style scoped>
  #hero.hr-hero {
    position: relative;
    overflow: clip;
    background: var(--paper);
    color: var(--ink);
  }

  #hero .hr-wrap {
    position: relative;
  }

  #hero .hr-layout {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 4px;
    padding-bottom: 124px;
  }

  #hero .hr-frame {
    position: relative;
    min-width: 0;
    height: clamp(560px, 85vh, 860px);
    margin: 0;
    overflow: hidden;
    border-radius: var(--radius-lg);
    background: var(--card);
  }

  #hero .hr-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  #hero .hr-frame-l .hr-image {
    object-position: 50% 48%;
  }

  #hero .hr-frame-p .hr-image {
    object-position: 50% 50%;
  }

  #hero .hr-card {
    position: absolute;
    z-index: 3;
    left: 50%;
    bottom: -106px;
    width: min(560px, calc(100% - 48px));
    padding: 26px 30px 14px;
    border-radius: var(--radius-lg);
    background: var(--card);
    box-shadow: var(--shadow-lg);
    text-align: center;
    transform: translateX(-50%);
  }

  #hero .hr-title {
    margin: 0;
    color: var(--ink);
    font-family: var(--font-display);
    font-size: var(--h1-d);
    font-weight: 700;
    line-height: 0.98;
    letter-spacing: -0.045em;
  }

  #hero .hr-title-line {
    display: block;
  }

  #hero .hr-lead {
    max-width: 500px;
    margin: 16px auto 0;
    color: var(--body);
    font-family: var(--font-text);
    line-height: 1.45;
  }

  #hero .hr-price {
    margin-top: 14px;
    color: var(--ink);
    font-family: var(--font-display);
    font-size: 44px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.025em;
  }

  #hero .hr-cta {
    display: flex;
    width: 100%;
    min-height: 64px;
    margin-top: 14px;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  #hero .hr-micro {
    margin: 12px 0 0;
    color: var(--body);
    font-family: var(--font-text);
    font-size: 13.5px;
    line-height: 1.35;
  }

  #hero .hr-pills {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-top: 14px;
  }

  #hero .hr-pill {
    display: flex;
    min-width: 0;
    min-height: 54px;
    padding: 9px 12px;
    align-items: center;
    justify-content: center;
    gap: 9px;
    color: var(--ink);
    font-family: var(--font-text);
    font-size: 13.5px;
    line-height: 1.2;
    white-space: nowrap;
  }

  #hero .hr-pill-icon {
    width: 25px;
    height: 25px;
    flex: 0 0 25px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  #hero .hr-callout {
    position: absolute;
    z-index: 2;
    top: 18%;
    right: 12%;
    display: flex;
    padding: 0;
    align-items: flex-start;
    gap: 8px;
    border: 0;
    background: transparent;
    box-shadow: none;
    color: var(--card);
    font-family: var(--font-text);
    font-size: 16px;
    line-height: 1.2;
    white-space: nowrap;
  }

  #hero .hr-callout-line {
    width: 94px;
    height: 52px;
    flex: 0 0 94px;
    overflow: visible;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  #hero .hr-callout-text {
    padding-top: 1px;
  }

  @media (max-width: 767px) {
    #hero .hr-layout {
      display: flex;
      flex-direction: column;
      gap: 0;
      padding-bottom: 0;
    }

    #hero .hr-frame {
      width: 100%;
      height: auto;
      aspect-ratio: 16 / 10;
    }

    #hero .hr-frame-l {
      order: 1;
    }

    #hero .hr-frame-p {
      order: 3;
      margin-top: 20px;
    }

    #hero .hr-frame-l .hr-image {
      object-position: 50% 43%;
    }

    #hero .hr-frame-p .hr-image {
      object-position: 50% 55%;
    }

    #hero .hr-card {
      position: relative;
      z-index: 3;
      order: 2;
      left: auto;
      bottom: auto;
      width: calc(100% - 28px);
      margin: -40px auto 0;
      padding: 38px 18px 16px;
      transform: none;
    }

    #hero .hr-title {
      font-size: var(--h1-m);
      line-height: 1.02;
      letter-spacing: -0.04em;
    }

    #hero .hr-lead {
      margin-top: 16px;
      line-height: 1.4;
    }

    #hero .hr-price {
      margin-top: 18px;
      font-size: 42px;
    }

    #hero .hr-cta {
      min-height: 58px;
      margin-top: 16px;
    }

    #hero .hr-micro {
      margin-top: 12px;
    }

    #hero .hr-pills {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 7px;
      margin-top: 14px;
    }

    #hero .hr-pill {
      min-height: 52px;
      padding: 8px 5px;
      gap: 5px;
      font-size: 12px;
      white-space: normal;
    }

    #hero .hr-pill-icon {
      width: 22px;
      height: 22px;
      flex-basis: 22px;
    }

    #hero .hr-callout {
      top: 25%;
      right: 10%;
      gap: 6px;
      font-size: 15px;
    }

    #hero .hr-callout-line {
      width: 72px;
      height: 44px;
      flex-basis: 72px;
    }
  }

  @media (max-width: 420px) {
    #hero .hr-card {
      width: calc(100% - 20px);
      padding-inline: 14px;
    }

    #hero .hr-pills {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    #hero .hr-pill:last-child {
      grid-column: 1 / -1;
    }

    #hero .hr-callout {
      right: 6%;
    }
  }
</style>
```