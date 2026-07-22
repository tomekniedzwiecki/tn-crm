Plan: nadpisanie tokenów Motion-DNA, wspólne stany dzieci sterowane przez `data-mo-role` i `--i`, warianty wyłącznie przez `data-mo`, obsługa FAQ oraz pełne wyłączenie przejść przy reduced-motion. Istniejący `IntersectionObserver` pozostaje bez zmian.

```html
<!-- MOTION-MODULE: <style> pełny CSS modułu + korekta tokenów :root przez nadpisanie w tym stylu -->
<style>
  :root {
    --mo-dur-s: .22s;
    --mo-dur-m: .36s;
    --mo-dur-l: .62s;
    --mo-dist: 14px;
    --mo-stagger: .06s;
  }

  /*
   * Kontener wariantu nie wykonuje dodatkowego wejścia.
   * Stan końcowy transform:none nadal zapewnia bazowe .reveal.in.
   */
  .reveal[data-mo]:not(.in) {
    opacity: 1;
    transform: none;
  }

  .reveal[data-mo] [data-mo-child] {
    opacity: 1;
    transform: none;
    transition:
      transform var(--mo-dur-m) var(--mo-ease),
      opacity var(--mo-dur-s) var(--mo-ease);
    transition-delay: calc(var(--i, 0) * var(--mo-stagger));
  }

  .reveal[data-mo].in [data-mo-child] {
    opacity: 1;
  }

  /* 1. DYPTyk */
  .reveal[data-mo="dyptyk"]:not(.in)
    [data-mo-child][data-mo-role="left"] {
    opacity: 0;
    transform: translateX(-18px);
  }

  .reveal[data-mo="dyptyk"]:not(.in)
    [data-mo-child][data-mo-role="right"] {
    opacity: 0;
    transform: translateX(18px);
  }

  .reveal[data-mo="dyptyk"]:not(.in)
    [data-mo-child][data-mo-role="card"] {
    opacity: 0;
    transform: translateY(14px);
  }

  .reveal[data-mo="dyptyk"]
    [data-mo-child][data-mo-role="left"],
  .reveal[data-mo="dyptyk"]
    [data-mo-child][data-mo-role="right"] {
    transition-duration: var(--mo-dur-l), var(--mo-dur-m);
  }

  /* 2. HAIRLINES */
  .reveal[data-mo="hairlines"]:not(.in)
    [data-mo-child][data-mo-role="image"] {
    opacity: 0;
    transform: translateY(var(--mo-dist));
  }

  .reveal[data-mo="hairlines"]
    [data-mo-child][data-mo-role="line"] {
    opacity: 1;
    transition-duration: var(--mo-dur-s);
  }

  .reveal[data-mo="hairlines"]:not(.in)
    [data-mo-child][data-mo-role="line"][data-axis="x"] {
    transform: scaleX(0);
  }

  .reveal[data-mo="hairlines"]:not(.in)
    [data-mo-child][data-mo-role="line"][data-axis="y"] {
    transform: scaleY(0);
  }

  .reveal[data-mo="hairlines"]
    [data-mo-role="line"][data-axis="x"][data-side="l"] {
    transform-origin: 100% 50%;
  }

  .reveal[data-mo="hairlines"]
    [data-mo-role="line"][data-axis="x"][data-side="r"] {
    transform-origin: 0 50%;
  }

  .reveal[data-mo="hairlines"]
    [data-mo-role="line"][data-axis="y"][data-side="l"] {
    transform-origin: 50% 100%;
  }

  .reveal[data-mo="hairlines"]
    [data-mo-role="line"][data-axis="y"][data-side="r"] {
    transform-origin: 50% 0;
  }

  .reveal[data-mo="hairlines"]:not(.in)
    [data-mo-child][data-mo-role="label"] {
    opacity: 0;
  }

  .reveal[data-mo="hairlines"]
    [data-mo-child][data-mo-role="label"] {
    transition-duration: var(--mo-dur-s);
  }

  /* 3. DOSUW */
  .reveal[data-mo="dosuw"]:not(.in) [data-mo-child] {
    opacity: 0;
    transform: translateY(12px);
  }

  .reveal[data-mo="dosuw"]:not(.in)
    [data-mo-child][data-mo-role="left"] {
    transform: translateX(-16px);
  }

  .reveal[data-mo="dosuw"]:not(.in)
    [data-mo-child][data-mo-role="right"] {
    transform: translateX(16px);
  }

  /* 4. WYDECH */
  .reveal[data-mo="wydech"]:not(.in)
    [data-mo-child][data-mo-role="photo-left"] {
    opacity: 0;
    transform: translateX(8px);
  }

  .reveal[data-mo="wydech"]:not(.in)
    [data-mo-child][data-mo-role="photo-right"] {
    opacity: 0;
    transform: translateX(-8px);
  }

  .reveal[data-mo="wydech"]:not(.in)
    [data-mo-child][data-mo-role="card"] {
    opacity: 0;
    transform: translateY(var(--mo-dist));
  }

  /* 5. OSAD */
  .reveal[data-mo="osad"]:not(.in)
    [data-mo-child][data-mo-role="flat-lay"] {
    opacity: 0;
    transform: translateY(-10px);
  }

  .reveal[data-mo="osad"]:not(.in)
    [data-mo-child][data-mo-role="table"] {
    opacity: 0;
    transform: translateY(12px);
  }

  .reveal[data-mo="osad"]
    [data-mo-child][data-mo-role="measure-line"] {
    opacity: 1;
    transform-origin: 0 50%;
    transition-duration: var(--mo-dur-m);
  }

  .reveal[data-mo="osad"]:not(.in)
    [data-mo-child][data-mo-role="measure-line"] {
    transform: scaleX(0);
  }

  .reveal[data-mo="osad"]:not(.in)
    [data-mo-child][data-mo-role="measure-value"] {
    opacity: 0;
  }

  .reveal[data-mo="osad"]
    [data-mo-child][data-mo-role="measure-value"] {
    transition-duration: var(--mo-dur-s);
  }

  /* 6. PASMO */
  .reveal[data-mo="pasmo"]:not(.in)
    [data-mo-child][data-mo-role="left"] {
    opacity: 0;
    transform: translateX(-14px);
  }

  .reveal[data-mo="pasmo"]:not(.in)
    [data-mo-child][data-mo-role="center"] {
    opacity: 0;
    transform: translateY(12px);
  }

  .reveal[data-mo="pasmo"]:not(.in)
    [data-mo-child][data-mo-role="right"] {
    opacity: 0;
    transform: translateX(14px);
  }

  /* 7. FAQ — bez animowania height */
  .fq-a {
    opacity: 1;
    transform: none;
    transition:
      transform var(--mo-dur-s) var(--mo-ease),
      opacity var(--mo-dur-s) var(--mo-ease);
  }

  details:not([open]) .fq-a {
    opacity: 0;
    transform: translateY(4px);
  }

  details[open] .fq-a {
    opacity: 1;
  }

  /* Ambient hero-video */
  .hr-frame-l {
    position: relative;
  }

  .hr-video {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--mo-dur-l) var(--mo-ease);
  }

  .hr-video.on {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .reveal[data-mo] [data-mo-child],
    .fq-a,
    .hr-video {
      transition: none !important;
    }

    .reveal[data-mo]:not(.in) [data-mo-child],
    details:not([open]) .fq-a {
      opacity: 1;
      transform: none;
    }
  }
</style>
```

```html
<!-- HERO-VIDEO: <video> markup + <script> guard -->
<!-- Umieść wewnątrz .hr-frame-l, bezpośrednio nad istniejącym <img>. -->
<video
  class="hr-video"
  muted
  loop
  playsinline
  preload="none"
  poster="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/hero-L.webp"
></video>

<script>
  (() => {
    const desktop = matchMedia("(min-width: 768px)");
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

    if (!desktop.matches || reducedMotion.matches) return;

    const video = document.querySelector(".hr-video");
    if (!video) return;

    video.addEventListener("canplay", () => {
      const playback = video.play();

      if (playback && typeof playback.then === "function") {
        playback
          .then(() => video.classList.add("on"))
          .catch(() => {});
      } else {
        video.classList.add("on");
      }
    }, { once: true });

    video.src =
      "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/hero-video.mp4";
    video.load();
  })();
</script>
```

**Atrybuty do nadania:**

- Hero → sekcja/wrapper → `class="reveal" data-mo="dyptyk"`.
- Hero → lewa kolumna → `data-mo-child data-mo-role="left" style="--i:0"`.
- Hero → prawa kolumna → `data-mo-child data-mo-role="right" style="--i:0"`.
- Hero → karta → `data-mo-child data-mo-role="card" style="--i:2"` — daje `.12s`.
- Anatomia → sekcja/wrapper → `class="reveal" data-mo="hairlines"`.
- Anatomia → obraz → `data-mo-child data-mo-role="image" style="--i:0"`.
- Anatomia → linia calloutu → `data-mo-child data-mo-role="line" data-axis="x|y" data-side="l|r" style="--i:6"`.
- Anatomia → label calloutu → `data-mo-child data-mo-role="label" style="--i:8"`; sparowane etykiety otrzymują ten sam indeks.
- Sterowanie/mid-CTA → wrapper → `class="reveal" data-mo="dosuw"`.
- Sterowanie/mid-CTA → child 1 → `data-mo-child data-mo-role="left" style="--i:0"`.
- Sterowanie/mid-CTA → child 2 → `data-mo-child data-mo-role="right" style="--i:1"`.
- Sterowanie/mid-CTA → kolejne dzieci → `data-mo-child style="--i:N"`; maksymalnie `N:6`.
- Wieczorem → wrapper → `class="reveal" data-mo="wydech"`.
- Wieczorem → lewe zdjęcie → `data-mo-child data-mo-role="photo-left" style="--i:0"`.
- Wieczorem → prawe zdjęcie → `data-mo-child data-mo-role="photo-right" style="--i:0"`.
- Wieczorem → karta → `data-mo-child data-mo-role="card" style="--i:2"`.
- Zestaw → wrapper → `class="reveal" data-mo="osad"`.
- Zestaw → flat-lay → `data-mo-child data-mo-role="flat-lay" style="--i:0"`.
- Zestaw → tabela → `data-mo-child data-mo-role="table" style="--i:1"`.
- Zestaw → linia wymiaru → `data-mo-child data-mo-role="measure-line" style="--i:4"`.
- Zestaw → liczba wymiaru → `data-mo-child data-mo-role="measure-value" style="--i:6"`.
- Final → wrapper → `class="reveal" data-mo="pasmo"`.
- Final → lewy kadr → `data-mo-child data-mo-role="left" style="--i:0"`.
- Final → środkowy kadr → `data-mo-child data-mo-role="center" style="--i:1"`.
- Final → prawy kadr → `data-mo-child data-mo-role="right" style="--i:0"`.
- FAQ → wrapper sekcji → tylko `class="reveal"`.
- FAQ → treść odpowiedzi wewnątrz `details` → `class="fq-a"`.
- Zamów → wrapper sekcji → tylko `class="reveal"`.
- Hero → lewa ramka → zachować/dodać `class="hr-frame-l"` i umieścić w niej podany `.hr-video`.