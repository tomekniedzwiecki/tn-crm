**Siatka:** centrowany nagłówek i lead → dwie równe foto-karty rozdzielone małą strzałką `.arc` → na mobile karty jedna pod drugą, każda z podpisem.

```html
<section id="durszlak" class="du-section sect-pad">
  <div class="wrap">
    <header class="du-header reveal">
      <h2 class="h2">Działa też jak durszlak</h2>
      <p class="lead">
        Koszyk z siatki pozwala szybko odcedzić makaron, warzywa i owoce — bez przekładania do innego naczynia.
      </p>
    </header>

    <div class="du-grid reveal">
      <figure class="du-card">
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/dur-mak.webp"
          width="1200"
          height="900"
          loading="lazy"
          alt="Makaron odcedzany w metalowym koszyku pod bieżącą wodą"
        >
        <figcaption class="du-caption">Odcedzisz makaron i warzywa</figcaption>
      </figure>

      <div class="du-arc-slot" aria-hidden="true">
        <svg class="arc du-arc" viewBox="0 0 120 60">
          <path
            d="M10 17 C38 45 78 48 105 23"
            stroke="var(--cta)"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
          />
          <path
            d="M96 24 L106 22 L103 32"
            stroke="var(--cta)"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <figure class="du-card">
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/dur-owoce.webp"
          width="1200"
          height="900"
          loading="lazy"
          alt="Owoce płukane w metalowym koszyku pod bieżącą wodą"
        >
        <figcaption class="du-caption">Opłuczesz owoce prosto w koszyku</figcaption>
      </figure>
    </div>
  </div>
</section>

<style>
  #durszlak.du-section {
    overflow: hidden;
    background: var(--paper);
    color: var(--ink);
  }

  #durszlak .du-header {
    max-width: 780px;
    margin-inline: auto;
    text-align: center;
  }

  #durszlak .du-header .h2 {
    margin: 0;
    font-size: var(--h2-d);
  }

  #durszlak .du-header .lead {
    max-width: 720px;
    margin: var(--s3) auto 0;
    color: var(--body);
    font-size: var(--body-fs);
    text-align: center;
  }

  #durszlak .du-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 72px minmax(0, 1fr);
    align-items: end;
    margin-top: var(--s6);
  }

  #durszlak .du-card {
    min-width: 0;
    margin: 0;
  }

  #durszlak .du-card img {
    display: block;
    width: 100%;
    height: auto;
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    background: var(--card);
    box-shadow: var(--shadow-sm);
  }

  #durszlak .du-caption {
    margin-top: var(--s3);
    color: var(--ink);
    font-size: var(--body-fs);
    line-height: 1.45;
    text-align: center;
  }

  #durszlak .du-arc-slot {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    min-height: 56px;
  }

  #durszlak .du-arc {
    display: block;
    width: 64px;
    height: auto;
    margin-bottom: 2px;
  }

  @media (max-width: 767px) {
    #durszlak .du-header .h2 {
      font-size: var(--h2-m);
    }

    #durszlak .du-grid {
      grid-template-columns: minmax(0, 1fr);
      gap: var(--s5);
      margin-top: var(--s5);
    }

    #durszlak .du-arc-slot {
      display: none;
    }

    #durszlak .du-caption {
      margin-top: var(--s2);
    }
  }
</style>
```