**Siatka sekcji**
- Nagłówek: eyebrow + H2.
- Desktop: zdjęcie ~60% po lewej, 3 korzyści po prawej.
- Dół: 2 pille + CTA.
- Mobile: zdjęcie → korzyści → pille i CTA.

```html
<section id="zawies" class="zw-section sect-pad">
  <div class="wrap">
    <header class="zw-head reveal">
      <p class="eyebrow">ZAWIEŚ I ODSĄCZ</p>
      <h2 class="h2">Zawieś. Niech ocieka nad garnkiem.</h2>
    </header>

    <div class="zw-layout">
      <figure class="zw-photo reveal">
        <img
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/sc-zawieszony.webp"
          width="1400"
          height="1000"
          loading="lazy"
          alt="Druciany kosz zawieszony koroną na rancie garnka, z którego krople oleju ociekają do środka"
        >

        <svg
          class="arc zw-arc"
          viewBox="0 0 120 60"
          aria-hidden="true"
          focusable="false"
          fill="none"
          stroke="var(--cta)"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M104 7C103 31 86 49 57 51"></path>
          <path d="M64 43L56 51L66 54"></path>
        </svg>
      </figure>

      <div class="zw-features reveal">
        <div class="zw-feature">
          <div class="zw-icon-card" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none">
              <path d="M10 9.5h28M11.5 10v10.5M36.5 10v10.5"></path>
              <path d="M11.5 20.5l-5 8 7 4 5-9 5.5 8 5.5-8 5 9 7-4-5-8"></path>
              <path d="M6.5 28.5c2.8 5.8 32.2 5.8 35 0"></path>
            </svg>
          </div>
          <p>Korona z drutów opiera się<br>o rant garnka</p>
        </div>

        <div class="zw-feature">
          <div class="zw-icon-card" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none">
              <path d="M24 5.5c4.5 8 11.5 15.2 11.5 24A11.5 11.5 0 0 1 12.5 30C12.5 20.7 19.5 13.5 24 5.5Z"></path>
              <path d="M17.5 28.5c0 4.2 2.5 6.8 6.5 7.5"></path>
            </svg>
          </div>
          <p>Olej ocieka z powrotem<br>do garnka</p>
        </div>

        <div class="zw-feature">
          <div class="zw-icon-card" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none">
              <path d="M19.5 41V30.5c0-2.7-1-5.3-2.8-7.3l-3.3-3.7"></path>
              <path d="M13.4 19.5 10 14.8c-.8-1.1-2.6-.2-2.1 1.1l2.8 7.4-4-5.5c-.8-1.1-2.6-.1-2 1.2l4.4 8.2c1.1 2.1 2.8 3.8 4.8 5"></path>
              <path d="M28.5 41V30.5c0-2.7 1-5.3 2.8-7.3l3.3-3.7"></path>
              <path d="m34.6 19.5 3.4-4.7c.8-1.1 2.6-.2 2.1 1.1l-2.8 7.4 4-5.5c.8-1.1 2.6-.1 2 1.2l-4.4 8.2c-1.1 2.1-2.8 3.8-4.8 5"></path>
            </svg>
          </div>
          <p>Ręce wolne —<br>nic nie trzymasz</p>
        </div>
      </div>
    </div>

    <div class="zw-actions reveal">
      <div class="zw-pills">
        <div class="pill zw-pill">
          <svg viewBox="0 0 40 40" aria-hidden="true" fill="none">
            <path d="m7 12 13-7 13 7v16l-13 7-13-7Z"></path>
            <path d="m7 12 13 7 13-7M20 19v16"></path>
          </svg>
          <span>Płatność<br>przy odbiorze</span>
        </div>

        <div class="pill zw-pill">
          <svg viewBox="0 0 40 40" aria-hidden="true" fill="none">
            <path d="M8 15A13 13 0 0 1 31 12"></path>
            <path d="m31 7 .5 6-6-.5"></path>
            <path d="M32 25A13 13 0 0 1 9 28"></path>
            <path d="m9 33-.5-6 6 .5"></path>
          </svg>
          <span>14 dni<br>na zwrot</span>
        </div>
      </div>

      <a class="btn cta zw-cta" href="#zamow">
        <span>Zamawiam Odsączek</span>
        <svg viewBox="0 0 28 20" aria-hidden="true" fill="none">
          <path d="M2 10h22M17 3l7 7-7 7"></path>
        </svg>
      </a>
    </div>
  </div>

  <style scoped>
    #zawies {
      background: var(--paper-2);
      color: var(--ink);
    }

    #zawies .zw-head {
      max-width: 900px;
      margin-inline: auto;
      margin-bottom: var(--s5);
      text-align: center;
    }

    #zawies .zw-head .eyebrow {
      margin-bottom: var(--s2);
    }

    #zawies .zw-head .h2 {
      margin: 0;
      font-size: var(--h2-d);
      color: var(--ink);
    }

    #zawies .zw-layout {
      display: grid;
      grid-template-columns: minmax(0, 3fr) minmax(300px, 2fr);
      gap: var(--s5);
      align-items: stretch;
    }

    #zawies .zw-photo {
      position: relative;
      align-self: start;
      margin: 0;
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      background: var(--card);
      box-shadow: var(--shadow-sm);
    }

    #zawies .zw-photo img {
      display: block;
      width: 100%;
      height: auto;
      border-radius: var(--radius-lg);
    }

    #zawies .zw-arc {
      position: absolute;
      top: 52%;
      right: 6%;
      width: 112px;
      height: auto;
      pointer-events: none;
    }

    #zawies .zw-features {
      display: grid;
      align-content: center;
    }

    #zawies .zw-feature {
      display: grid;
      grid-template-columns: 64px minmax(0, 1fr);
      gap: var(--s3);
      align-items: center;
      padding-block: var(--s4);
      border-bottom: 1px solid var(--line);
    }

    #zawies .zw-feature:last-child {
      border-bottom: 0;
    }

    #zawies .zw-icon-card {
      display: grid;
      width: 64px;
      height: 64px;
      place-items: center;
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      background: var(--card);
      box-shadow: var(--shadow-sm);
    }

    #zawies .zw-icon-card svg {
      width: 42px;
      height: 42px;
      stroke: var(--ink);
      stroke-width: 1.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    #zawies .zw-feature p {
      margin: 0;
      color: var(--body);
      font-size: var(--body-fs);
      line-height: 1.45;
    }

    #zawies .zw-actions {
      display: grid;
      grid-template-columns: minmax(0, auto) minmax(280px, 1fr);
      gap: var(--s4);
      align-items: stretch;
      margin-top: var(--s4);
    }

    #zawies .zw-pills {
      display: flex;
      gap: var(--s3);
    }

    #zawies .zw-pill {
      display: flex;
      min-height: 64px;
      align-items: center;
      gap: var(--s2);
      padding: var(--s2) var(--s3);
      border: 1px solid var(--line);
      background: var(--card);
      color: var(--body);
      font-size: var(--body-fs);
      line-height: 1.2;
    }

    #zawies .zw-pill svg {
      width: 36px;
      height: 36px;
      flex: 0 0 auto;
      stroke: var(--ink);
      stroke-width: 1.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    #zawies .zw-cta {
      display: flex;
      min-height: 64px;
      align-items: center;
      justify-content: center;
      gap: var(--s3);
      text-align: center;
    }

    #zawies .zw-cta svg {
      width: 28px;
      height: 20px;
      margin-left: auto;
      stroke: var(--cta-ink);
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    @media (max-width: 760px) {
      #zawies .zw-head {
        margin-bottom: var(--s4);
      }

      #zawies .zw-head .h2 {
        font-size: var(--h2-m);
      }

      #zawies .zw-layout {
        grid-template-columns: 1fr;
        gap: var(--s3);
      }

      #zawies .zw-arc {
        top: 53%;
        right: 5%;
        width: 92px;
      }

      #zawies .zw-feature {
        padding-block: var(--s3);
      }

      #zawies .zw-actions {
        grid-template-columns: 1fr;
        gap: var(--s3);
      }

      #zawies .zw-pills {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--s2);
      }

      #zawies .zw-pill {
        min-width: 0;
        padding-inline: var(--s2);
      }

      #zawies .zw-cta {
        width: 100%;
      }
    }

    @media (max-width: 420px) {
      #zawies .zw-feature {
        grid-template-columns: 64px minmax(0, 1fr);
        gap: var(--s2);
      }

      #zawies .zw-pills {
        grid-template-columns: 1fr;
      }
    }
  </style>
</section>
```