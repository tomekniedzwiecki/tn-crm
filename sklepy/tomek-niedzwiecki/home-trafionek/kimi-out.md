```html
<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Trafionek — Trafione rzeczy na co dzień</title>
<meta name="description" content="Trafionek to sklep z rzeczami, które po prostu robią robotę — wybieramy je pojedynczo, a każdy ma własną stronę. Płacisz przy odbiorze i masz 14 dni na zwrot.">
<meta name="robots" content="noindex,nofollow">
<link rel="canonical" href="{{CANONICAL_URL}}">
<meta property="og:type" content="website">
<meta property="og:locale" content="pl_PL">
<meta property="og:title" content="Trafionek — Trafione rzeczy na co dzień">
<meta property="og:description" content="Rzeczy, które po prostu robią robotę — wybierane pojedynczo spośród setek trendów. Płatność przy odbiorze i 14 dni na zwrot.">
<meta property="og:image" content="{{OG_URL}}">
<meta property="og:url" content="{{CANONICAL_URL}}">
<link rel="icon" type="image/png" href="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/parasol-trafionek/brand/favicon-512.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
<script>document.documentElement.classList.add('js');</script>
<style>
  :root{
    --primary:#E63946;
    --primary-d:#C92A36;
    --ink:#26221E;
    --body:rgba(38,34,30,.82);
    --muted:rgba(38,34,30,.58);
    --bg:#FDF8F2;
    --bg-alt:#F6EDE2;
    --border:#E7DCCD;
    --card:#FFFFFF;
    --r:16px;
    /* mapowanie tokenów dla modułu footer@1 */
    --paper-2:var(--bg-alt);
    --line:var(--border);
    --cta:var(--primary);
    --cta-d:var(--primary-d);
  }
  *,*::before,*::after{box-sizing:border-box}
  html{overflow-x:clip;scroll-behavior:smooth}
  body{margin:0;font-family:"Nunito",sans-serif;font-size:16px;line-height:1.6;color:var(--body);
    background:var(--bg);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
  img{max-width:100%}
  h1,h2,h3{font-family:"Fredoka",sans-serif;color:var(--ink);margin:0;line-height:1.15}
  p{margin:0}
  ::selection{background:rgba(230,57,70,.18)}
  a:focus-visible,button:focus-visible{outline:3px solid rgba(230,57,70,.45);outline-offset:3px;border-radius:var(--r)}
  .wrap{max-width:1140px;margin:0 auto;padding-left:clamp(16px,4vw,24px);padding-right:clamp(16px,4vw,24px)}

  /* ---------- (1) TOPBAR ---------- */
  .topbar{background:var(--bg);border-bottom:1px solid var(--border)}
  .topbar-in{display:flex;align-items:center;justify-content:space-between;gap:8px 24px;flex-wrap:wrap;
    padding-top:16px;padding-bottom:16px}
  .topbar-brand{display:inline-flex;align-items:center;min-height:44px;text-decoration:none}
  .topbar-brand img{height:38px;width:auto;display:block}
  .topbar-trust{font-size:13.5px;font-weight:600;color:var(--muted);letter-spacing:.01em;white-space:nowrap}
  .topbar-trust .sep{color:var(--cta);font-weight:800;margin:0 6px}

  /* ---------- (2) INTRO ---------- */
  .intro{padding:clamp(56px,8vw,88px) 0 clamp(40px,5vw,64px);text-align:center}
  .intro-brand{display:block;font-weight:600;font-size:clamp(44px,7vw,64px);letter-spacing:.01em}
  .intro-tag{display:inline-flex;align-items:center;gap:10px;margin-top:16px;
    font-weight:500;font-size:clamp(19px,3vw,26px);color:var(--body)}
  .intro-tag .mark{width:24px;height:24px;flex:0 0 auto;color:var(--cta)}
  .intro-lead{max-width:640px;margin:24px auto 0;font-size:17px;line-height:1.65}

  /* ---------- (3) PAS ZAUFANIA ---------- */
  .trust{padding:0 0 clamp(48px,6vw,72px)}
  .trust-in{display:flex;justify-content:center;flex-wrap:wrap;gap:16px}
  .chip{display:inline-flex;align-items:center;gap:10px;min-height:44px;padding:10px 18px;
    background:var(--card);border:1px solid var(--border);border-radius:var(--r);
    font-size:14.5px;font-weight:700;color:var(--ink)}
  .chip svg{width:18px;height:18px;flex:0 0 auto;color:var(--cta)}

  /* ---------- (4) GALERIA KART ---------- */
  .shop{padding:0 0 clamp(56px,7vw,80px)}
  .sec-head{text-align:center;margin-bottom:40px}
  .sec-title{font-weight:600;font-size:clamp(28px,4vw,36px)}
  .sec-sub{margin-top:12px;font-size:15.5px;color:var(--muted)}
  .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}
  .card{display:flex;flex-direction:column;background:var(--card);border:1px solid var(--border);
    border-radius:var(--r);overflow:hidden;text-decoration:none;color:inherit;
    transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}
  .card:hover{transform:translateY(-3px);box-shadow:0 18px 36px -20px rgba(38,34,30,.3);border-color:#DCC9B0}
  .card-media{aspect-ratio:1/1;overflow:hidden;background:var(--bg-alt)}
  .card-media img{width:100%;height:100%;object-fit:cover;display:block}
  .card-body{display:flex;flex-direction:column;gap:10px;flex:1;padding:20px 20px 22px}
  .card-name{font-family:"Fredoka",sans-serif;font-weight:600;font-size:22px;color:var(--ink);line-height:1.2}
  .card-hook{font-size:15px;line-height:1.5;color:var(--body)}
  .card-row{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:8px}
  .card-price{font-size:19px;font-weight:800;color:var(--ink);letter-spacing:.01em}
  .card-cta{display:inline-flex;align-items:center;gap:6px;min-height:44px;
    font-size:15px;font-weight:800;color:var(--cta)}
  .card-cta svg{width:16px;height:16px;flex:0 0 auto}
  /* stan featured: dokładnie 1 karta */
  @media (min-width:760px){
    .cards[data-count="1"]{grid-template-columns:1fr}
    .cards[data-count="1"] .card{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);align-items:center}
    .cards[data-count="1"] .card-body{padding:32px 40px}
    .cards[data-count="1"] .card-name{font-size:30px}
    .cards[data-count="1"] .card-hook{font-size:16.5px}
    .cards[data-count="1"] .card-price{font-size:22px}
  }

  /* ---------- (5) BANDA „JAK TO DZIAŁA" ---------- */
  .how{background:var(--bg-alt);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
  .how-in{max-width:760px;margin:0 auto;text-align:center;padding-top:clamp(48px,6vw,72px);padding-bottom:clamp(48px,6vw,72px)}
  .how-title{display:inline-flex;align-items:center;gap:10px;font-weight:600;font-size:clamp(22px,3vw,26px)}
  .how-title .mark{width:22px;height:22px;flex:0 0 auto;color:var(--cta)}
  .how-text{margin-top:16px;font-size:16.5px;line-height:1.65}

  /* ---------- reveal (fade-in on scroll, fallback bez JS) ---------- */
  .js .reveal{opacity:0;transform:translateY(14px);transition:opacity .6s ease,transform .6s ease}
  .js .reveal.in{opacity:1;transform:none}

  /* ---------- pay-badges (tekstowe pigułki) ---------- */
  .pay-badges{display:flex;flex-wrap:wrap;gap:8px}
  .pay-badges .pay-pill{display:inline-flex;align-items:center;min-height:32px;padding:6px 14px;
    background:var(--card);border:1px solid var(--line);border-radius:var(--r);
    font-size:13px;font-weight:800;letter-spacing:.02em;color:var(--ink)}

  @media (prefers-reduced-motion: reduce){
    html{scroll-behavior:auto}
    *,*::before,*::after{transition:none !important;animation:none !important}
    .js .reveal{opacity:1;transform:none}
    .card:hover{transform:none}
  }
</style>

<!-- (footer@1) STYLE — skórka = tokeny marki -->
<style>
  #footer{background:var(--paper-2);border-top:1px solid var(--line);color:var(--body)}
  #footer .foot-top{display:grid;grid-template-columns:1.5fr 1fr 1.2fr;gap:clamp(26px,4vw,60px);
    padding:clamp(46px,6vw,74px) 0 clamp(30px,3.4vw,44px)}
  #footer .foot-brand{display:flex;align-items:center;gap:10px;color:var(--ink)}
  #footer .foot-brand .brand-mark{height:34px;width:auto;display:block;flex:0 0 auto}
  #footer .foot-brand span{font-family:"Fredoka",sans-serif;font-weight:600;font-size:27px;letter-spacing:.01em}
  #footer .foot-claim{margin-top:15px;font-size:14.5px;color:var(--body);line-height:1.55;max-width:340px}
  #footer .foot-h{font-family:"Fredoka",sans-serif;font-weight:600;font-size:15px;color:var(--ink);letter-spacing:.02em;margin:0 0 16px}
  #footer .foot-nav{list-style:none;margin:0;padding:0;display:grid;gap:2px}
  #footer .foot-nav a{font-size:14.5px;color:var(--body);display:inline-flex;align-items:center;min-height:44px;text-decoration:none;transition:color .18s ease}
  #footer .foot-nav a:hover{color:var(--cta-d)}
  #footer .foot-trust{display:grid;gap:16px}
  #footer .foot-chips{display:grid;gap:11px}
  #footer .foot-chip{display:inline-flex;align-items:center;gap:9px;font-size:13.5px;color:var(--body);line-height:1.35}
  #footer .foot-chip svg{width:18px;height:18px;flex:0 0 auto;color:var(--cta)}
  #footer .foot-bottom{border-top:1px solid var(--line);padding:22px 0 clamp(30px,3vw,42px);
    display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
  #footer .foot-copy{font-size:12.5px;color:var(--muted);line-height:1.5}
  #footer .foot-note{font-size:12px;color:var(--muted)}
  @media(max-width:820px){
    #footer .foot-top{grid-template-columns:1fr 1fr;gap:34px 28px}
    #footer .foot-brandcol{grid-column:1 / -1}
  }
  @media(max-width:520px){
    #footer .foot-top{grid-template-columns:1fr;gap:30px}
    #footer .foot-bottom{flex-direction:column;align-items:flex-start;gap:10px}
  }
</style>

<!--ITEMLIST:START--><!--ITEMLIST:END-->
</head>
<body>

<!-- (1) TOPBAR -->
<header class="topbar">
  <div class="wrap topbar-in">
    <a class="topbar-brand" href="/" aria-label="Trafionek — strona główna">
      <img src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/parasol-trafionek/brand/logo-combo.png" alt="Trafionek" decoding="async">
    </a>
    <p class="topbar-trust">Płatność przy odbiorze<span class="sep">·</span>14 dni na zwrot</p>
  </div>
</header>

<!-- (2) INTRO -->
<section class="intro">
  <div class="wrap">
    <h1 class="reveal">
      <span class="intro-brand">Trafionek</span>
      <span class="intro-tag">
        <svg class="mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/></svg>
        Trafione rzeczy na co dzień
      </span>
    </h1>
    <p class="intro-lead reveal">Trafionek to sklep z rzeczami, które po prostu robią robotę. Wybieramy je pojedynczo spośród setek trendów i zostawiamy tylko trafione — od domu i relaksu po auto i zwierzaki. Każdy produkt ma tu własną małą markę i stronę, na której dokładnie pokazujemy, co potrafi. Płacisz przy odbiorze, a jeśli coś nie zagra, masz 14 dni na zwrot.</p>
  </div>
</section>

<!-- (3) PAS ZAUFANIA -->
<section class="trust" aria-label="Gwarancje zakupów">
  <div class="wrap trust-in reveal">
    <span class="chip">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6.2 9.5h.01M17.8 14.5h.01"/></svg>
      Płatność przy odbiorze
    </span>
    <span class="chip">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>
      14 dni na zwrot
    </span>
    <span class="chip">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3Z"/><path d="M9 12l2 2 4-4"/></svg>
      Bezpieczne płatności
    </span>
  </div>
</section>

<main>
<!-- (4) GALERIA KART -->
<section class="shop">
  <div class="wrap">
    <div class="sec-head reveal">
      <h2 class="sec-title">Nasze trafienia</h2>
      <p class="sec-sub">Każdy produkt ma własną małą markę i stronę — kliknij kartę, żeby zobaczyć, co potrafi.</p>
    </div>
    <!--CARD-TEMPLATE
    <a class="card" href="{{CARD_URL}}">
      <span class="card-media"><img src="{{CARD_IMG}}" alt="{{CARD_ALT}}" width="800" height="800" loading="lazy" decoding="async"></span>
      <span class="card-body">
        <span class="card-name">{{CARD_NAME}}</span>
        <span class="card-hook">{{CARD_HOOK}}</span>
        <span class="card-row">
          <span class="card-price" data-wf2-product="{{CARD_PID}}">{{CARD_PRICE}}</span>
          <span class="card-cta">{{CARD_CTA}}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg></span>
        </span>
      </span>
    </a>
    CARD-TEMPLATE-->
    <div class="cards reveal" data-cards data-count="3"><!--CARDS:START--><!--CARDS:END--></div>
  </div>
</section>

<!-- (5) BANDA „JAK TO DZIAŁA" -->
<section class="how">
  <div class="wrap how-in reveal">
    <h2 class="how-title">
      <svg class="mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/></svg>
      Jak to działa?
    </h2>
    <p class="how-text">Wybierasz kartę i przechodzisz na stronę produktu — tam pokazujemy dokładnie, co potrafi. Zamawiasz w minutę, płacisz dopiero przy odbiorze, a jeśli coś nie zagra, masz 14 dni na zwrot.</p>
  </div>
</section>
</main>

<!-- (6) FOOTER — moduł footer@1 (skórka = tokeny marki, bez ratingu) -->
<footer id="footer">
  <div class="wrap">
    <div class="foot-top">
      <div class="foot-brandcol">
        <div class="foot-brand">
          <img class="brand-mark" src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/parasol-trafionek/brand/favicon-512.png" width="96" height="96" alt="" aria-hidden="true" loading="lazy" decoding="async">
          <span>Trafionek</span>
        </div>
        <p class="foot-claim">Trafione rzeczy na co dzień — wybierane pojedynczo, opisane uczciwie, z płatnością przy odbiorze.</p>
      </div>
      <nav class="foot-col" aria-label="Informacje i pomoc">
        <p class="foot-h">Zakupy i pomoc</p>
        <ul class="foot-nav">
          <li><a href="{{REGULAMIN_URL}}">Regulamin</a></li>
          <li><a href="{{POLITYKA_URL}}">Polityka prywatności</a></li>
          <li><a href="{{ZWROTY_URL}}">Zwroty i reklamacje</a></li>
          <li><a href="{{DOSTAWA_URL}}">Dostawa</a></li>
          <li><a href="{{KONTAKT_URL}}">Kontakt</a></li>
        </ul>
      </nav>
      <div class="foot-col">
        <p class="foot-h">Bezpieczne zakupy</p>
        <div class="foot-trust">
          <div class="pay-badges" aria-label="Dostępne metody płatności">
            <span class="pay-pill">BLIK</span>
            <span class="pay-pill">Visa</span>
            <span class="pay-pill">Mastercard</span>
            <span class="pay-pill">Pobranie</span>
          </div>
          <div class="foot-chips">
            <span class="foot-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg> 14 dni na zwrot bez podawania przyczyny</span>
            <span class="foot-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3Z"/><path d="M9 12l2 2 4-4"/></svg> Bezpieczne płatności — BLIK, karta lub za pobraniem</span>
            <span class="foot-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.5" y="6" width="13" height="10" rx="1.5"/><path d="M14.5 9H18l3.5 3.2V16h-7z"/><circle cx="6" cy="18" r="1.9"/><circle cx="17" cy="18" r="1.9"/></svg> Wysyłka pod wskazany adres</span>
          </div>
        </div>
      </div>
    </div>
    <div class="foot-bottom">
      <p class="foot-copy">© 2026 Trafionek · Wszystkie prawa zastrzeżone</p>
      <p class="foot-note">Ceny zawierają VAT · Zdjęcia mają charakter poglądowy</p>
    </div>
  </div>
</footer>

<script>
(function(){
  /* fade-in on scroll (IntersectionObserver + fallback) */
  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
      });
    },{threshold:.12});
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }

  /* hydratacja cen */
  function fmt(n){
    try{ return n.toLocaleString('pl-PL',{style:'currency',currency:'PLN'}); }
    catch(e){ return n.toFixed(2).replace('.',',')+' zł'; }
  }
  document.querySelectorAll('[data-wf2-product]').forEach(function(el){
    var id = el.getAttribute('data-wf2-product');
    if(!id) return;
    fetch('https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-landing-api?product=' + encodeURIComponent(id))
      .then(function(r){ if(!r.ok) throw new Error('bad status'); return r.json(); })
      .then(function(d){
        if(d && typeof d.price !== 'undefined' && d.price !== null){
          var n = Number(d.price);
          if(isFinite(n)) el.textContent = fmt(n);
        }
      })
      .catch(function(){});
  });

  /* analityka (defensywnie) */
  try{ window.trevio?.viewItemList?.(); }catch(e){}
})();
</script>
</body>
</html>
```