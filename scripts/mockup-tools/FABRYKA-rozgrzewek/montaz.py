# -*- coding: utf-8 -*-
"""F4 MONTAZ modulow kanonicznych do index.html ROZGRZEWKA:
- <!--CHECKOUT-SECTION--> -> checkout-inline@2 JAKO wlasna sekcja #zamow (skorka Rozgrzewka,
  data-zc-layout=steps, data-zc-product/api/thumb/delivery-days na ROOCIE = poprawna rezolucja
  configu; H2 „Zamow granatowy Rozgrzewek.", wiersz Wariant „Granatowy (Blue)", merchant Ulepszek,
  kregi ciepla w naglowku). Mechanika/JS NIETYKALNE (CTA = kanoniczne „Zamawiam i place [przy odbiorze]").
- PB_CSS globalny + pay-badges (checkout natywnie #1, footer #2).
- FOOTER@1 (skorka Rozgrzewka; BEZ ratingu).
- STICKY-BUY@1 (IO na .hero + drugi IO na #zamow -> chowa sticky gdy checkout w viewport; wymog modulu).
- LL-052: interceptor a[href="#zamow"] -> scroll do .zc-form.
- RUNTIME-SNIPPET: landing-runtime-snippet.html ({{WF2_PRODUCT_ID}} zostaje do publikacji).
Montaz WYLACZNIE po markerach jednoznacznych (LL-035)."""
import io, re, sys

sys.stdout.reconfigure(encoding='utf-8')
IDX = r'c:/repos_tn/tn-crm/sklepy/patryk-skrzypniak/rozgrzewek/index.html'
MOD = r'c:/repos_tn/tn-crm/docs/zbuduje/moduly/checkout-inline@2.html'
SNIP = r'c:/repos_tn/tn-crm/docs/zbuduje/assets/landing-runtime-snippet.html'
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
BR = PUB + 'bud-assets/rozgrzewek/'
PACKSHOT = BR + 'assets/packshot-alpha.png'

idx = io.open(IDX, encoding='utf-8').read()
mod = io.open(MOD, encoding='utf-8').read()

RINGS = ('<span class="rings-wrap"><svg class="rings" viewBox="0 0 88 46" aria-hidden="true" '
         'focusable="false"><path class="r-out" d="M4 44a40 40 0 0 1 80 0"/>'
         '<path class="r-mid" d="M15 44a29 29 0 0 1 58 0"/>'
         '<path class="r-in" d="M26 44a18 18 0 0 1 36 0"/></svg></span>')


# ── pay-badges kanon ──
def paybadges(uid):
    return ('<div class="pay-badges" aria-label="Dostępne metody płatności">'
      '<span class="pb pb--blik" title="BLIK"><svg viewBox="0 0 135.639 64.18" role="img" aria-label="BLIK"><defs>'
      '<linearGradient id="blikPa%s" x1=".5" x2=".5" y1=".993" y2=".004" gradientUnits="objectBoundingBox">'
      '<stop offset="0" stop-color="#5a5a5a"/><stop offset=".146" stop-color="#484848"/><stop offset=".52" stop-color="#212121"/>'
      '<stop offset=".817" stop-color="#080808"/><stop offset="1"/></linearGradient>'
      '<linearGradient id="blikDo%s" x1=".147" x2=".854" y1=".146" y2=".854" gradientUnits="objectBoundingBox">'
      '<stop offset="0" stop-color="#e52f08"/><stop offset="1" stop-color="#e94f96"/></linearGradient></defs>'
      '<path d="m175.934 48.266h-119.81a7.919 7.919 0 0 0 -7.914 7.907v48.367a7.919 7.919 0 0 0 7.914 7.906h119.81a7.92 7.92 0 0 0 7.915-7.906v-48.367a7.92 7.92 0 0 0 -7.915-7.907z" fill="#fff" transform="translate(-48.21 -48.266)"/>'
      '<path d="m176.419 49.579h-119.81a7.083 7.083 0 0 0 -7.087 7.079v48.368a7.082 7.082 0 0 0 7.087 7.078h119.81a7.082 7.082 0 0 0 7.086-7.078v-48.368a7.083 7.083 0 0 0 -7.086-7.079z" fill="url(#blikPa%s)" transform="translate(-48.695 -48.752)"/>'
      '<g transform="translate(20.254 6.714)"><path d="m37.086 3.355h7.923v44.956h-7.923z" fill="#fff"/>'
      '<path d="m52.04 18.866h7.923v29.445h-7.923z" fill="#fff"/>'
      '<path d="m97.69 79.461a14.968 14.968 0 0 0 -7.108 1.784v-17h-7.924v30.242a15.03 15.03 0 1 0 15.032-15.026zm0 22.26a7.233 7.233 0 1 1 7.233-7.234 7.231 7.231 0 0 1 -7.233 7.234z" fill="#fff" transform="translate(-81.203 -60.889)"/>'
      '<circle cx="7.088" cy="7.088" r="7.088" fill="url(#blikDo%s)" transform="matrix(.00649258 -.99997892 .99997892 .00649258 17.293 15.212)"/></g>'
      '<path d="m205.694 109.2h10.206l-12.262-15.837 11.119-13.608h-9.257l-10.919 13.693v-29.2h-7.925v44.952h7.925l-.006-15.714z" fill="#fff" transform="translate(-99.413 -54.173)"/></svg></span>'
      '<span class="pb pb--visa" title="Visa"><svg viewBox="0 0 24 24" role="img" aria-label="Visa"><path fill="#1A1F71" d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z"/></svg></span>'
      '<span class="pb pb--mc" title="Mastercard"><svg viewBox="0 0 36 22" role="img" aria-label="Mastercard"><circle cx="13" cy="11" r="10" fill="#EB001B"/><circle cx="23" cy="11" r="10" fill="#F79E1B"/><path d="M18 3.05a9.98 9.98 0 010 15.9 9.98 9.98 0 010-15.9z" fill="#FF5F00"/></svg></span>'
      '<span class="pb pb--cod" title="Płatność przy odbiorze"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>ZA POBRANIEM</span>'
      '</div>') % (uid, uid, uid, uid)


PB_CSS = '''<style>
  .pay-badges{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .pay-badges .pb{display:inline-flex;align-items:center;justify-content:center;height:34px;
    padding:0 14px;background:#FFFFFF;border:1px solid var(--line);border-radius:var(--radius-sm);box-shadow:var(--shadow-sm)}
  .pay-badges .pb svg{display:block;height:16px;width:auto}
  .pay-badges .pb--blik svg{height:18px}
  .pay-badges .pb--cod{font:800 12px/1 var(--font-text);letter-spacing:.04em;color:var(--ink);white-space:nowrap;gap:7px}
  .pay-badges .pb--cod svg{height:14px;color:var(--cta)}
  @media(max-width:420px){.pay-badges{gap:8px}.pay-badges .pb{height:31px;padding:0 11px}}
  #zamow .pay-badges{justify-content:flex-start;margin-top:4px}
</style>
'''

# ── checkout-inline@2 -> sekcja #zamow (skorka Rozgrzewka) ──
m_style = re.search(r'<!-- \(1\) STYLE.*?-->\s*(<style>.*?</style>)', mod, re.S).group(1)
m_markup = re.search(r'(<section id="zamow".*?</section>)', mod, re.S).group(1)
m_script = re.search(r'<!-- \(3\) SKRYPT.*?-->\s*(<script>.*?</script>)', mod, re.S).group(1)

# root: dodaj klase sect-pad + data-zc-layout/thumb/delivery-days (product/api juz sa w module)
new_open = ('<section id="zamow" class="zc-checkout sect-pad" aria-labelledby="zc-title" '
            'data-zc-product="{{WF2_PRODUCT_ID}}" '
            'data-zc-api="https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-landing-api" '
            'data-zc-layout="steps" data-zc-thumb-src="' + PACKSHOT + '" data-zc-delivery-days="2">')
m_markup = re.sub(r'<section id="zamow"[^>]*>', new_open, m_markup, count=1)

# naglowek: kregi + ZAMOWIENIE + „Zamow granatowy Rozgrzewek."
new_head = ('<header class="zc-head">' + RINGS
            + '<p class="zc-eyebrow">ZAMÓWIENIE</p>'
            + '<h2 id="zc-title" class="zc-h2">Zamów granatowy <span class="swash">Rozgrzewek</span>.</h2>'
            + '</header>')
m_markup = re.sub(r'<header class="zc-head">.*?</header>', new_head, m_markup, count=1, flags=re.S)

# wiersz Wariant „Granatowy (Blue)" w podsumowaniu (po wierszu Produkt)
variant_row = '<div class="zc-sum-row"><span>Wariant</span><span>Granatowy (Blue)</span></div>'
prod_row = '<div class="zc-sum-row"><span>Produkt</span><span data-zc-line-product>—</span></div>'
assert prod_row in m_markup, 'brak wiersza Produkt w podsumowaniu modulu'
m_markup = m_markup.replace(prod_row, prod_row + variant_row, 1)

# merchant
m_markup = m_markup.replace(
    'Sprzedawca: nazwa firmy · adres · NIP 000-000-00-00. Ceny zawierają VAT.',
    'Sprzedawca: sklep Ulepszek · pełne dane sprzedawcy w Regulaminie. Ceny zawierają VAT.')

SKIN = '''<!-- SKORKA modulu checkout-inline@2 pod Rozgrzewka (aliasy tokenow; mechanika NIETYKALNA) -->
<style>
  #zamow.zc-checkout{
    --zc-bg:transparent; --zc-card:var(--card); --zc-border:var(--line);
    --zc-text:var(--ink); --zc-muted:var(--body);
    --zc-accent:var(--cta); --zc-accent-text:var(--cta-ink);
    --zc-ok:#3FA05A; --zc-error:#D8433A;
    --zc-radius:var(--radius-lg); --zc-radius-sm:var(--radius-sm); --zc-radius-cta:var(--radius-lg);
    --zc-shadow:var(--shadow-md); --zc-font:var(--font-text);
    background:var(--paper);
  }
  #zamow.zc-checkout .zc-head{display:flex;flex-direction:column;align-items:center;gap:10px}
  #zamow.zc-checkout .zc-eyebrow{font-family:var(--font-text);color:var(--ink);letter-spacing:.2em}
  #zamow.zc-checkout .zc-h2{font-family:var(--font-display);font-weight:700;letter-spacing:-.01em;color:var(--ink)}
  #zamow.zc-checkout .zc-card{box-shadow:var(--shadow-md)}
  #zamow.zc-checkout .zc-sum-thumb{width:72px;height:72px;background:var(--paper-2)}
  #zamow.zc-checkout .zc-cta{font-family:var(--font-display)}
</style>
'''

checkout_block = SKIN + '\n' + m_style + '\n\n' + m_markup + '\n\n' + m_script
assert idx.count('<!--CHECKOUT-SECTION-->') == 1, 'CHECKOUT-SECTION != 1'
idx = idx.replace('<!--CHECKOUT-SECTION-->', checkout_block, 1)
print('OK checkout-inline@2 jako sekcja #zamow (%d znakow)' % len(checkout_block))

# ── FOOTER@1 (Rozgrzewek) ──
FOOTER = PB_CSS + '''<style>
  #footer{background:var(--paper-2);border-top:1px solid var(--line);color:var(--body);--muted:var(--body)}
  #footer .foot-top{display:grid;grid-template-columns:1.5fr 1fr 1.2fr;gap:clamp(26px,4vw,60px);
    padding:clamp(46px,6vw,74px) 0 clamp(30px,3.4vw,44px)}
  #footer .foot-brand{display:flex;align-items:center;gap:10px;color:var(--ink)}
  #footer .foot-brand .brand-mark{height:36px;width:auto;display:block;flex:0 0 auto}
  #footer .foot-brand span{font-family:var(--font-display);font-weight:700;font-size:26px;letter-spacing:-.01em}
  #footer .foot-claim{margin-top:15px;font-size:14.5px;color:var(--body);line-height:1.55;max-width:340px}
  #footer .foot-h{font-family:var(--font-display);font-weight:700;font-size:15px;color:var(--ink);letter-spacing:.02em;margin-bottom:16px}
  #footer .foot-nav{list-style:none;margin:0;padding:0;display:grid;gap:2px}
  #footer .foot-nav a{font-size:14.5px;color:var(--body);display:inline-flex;align-items:center;min-height:44px;transition:color .18s ease}
  #footer .foot-nav a:hover{color:var(--cta)}
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
<footer id="footer">
  <div class="wrap">
    <div class="foot-top">
      <div class="foot-brandcol">
        <div class="foot-brand">
          <img class="brand-mark" src="''' + BR + '''brand/favicon-256.png" width="96" height="96" alt="" aria-hidden="true" loading="lazy" decoding="async">
          <span>Rozgrzewek</span>
        </div>
        <p class="foot-claim">Podgrzewany masażer do ciała: delikatny ciepły okład, wibracje i tryb EMS — każdy z 9 poziomami. Kopułowa głowica ze stalowymi kulkami i czerwonym światłem LED.</p>
      </div>
      <nav class="foot-col" aria-label="Informacje i pomoc">
        <p class="foot-h">Zakupy i pomoc</p>
        <ul class="foot-nav">
          <li><a href="{{REGULAMIN_URL}}">Regulamin</a></li>
          <li><a href="{{POLITYKA_URL}}">Polityka prywatności</a></li>
          <li><a href="{{COOKIES_URL}}">Polityka cookies</a></li>
          <li><a href="{{ZWROTY_URL}}">Zwroty i reklamacje</a></li>
          <li><a href="{{DOSTAWA_URL}}">Dostawa</a></li>
          <li><a href="{{KONTAKT_URL}}">Kontakt</a></li>
        </ul>
      </nav>
      <div class="foot-col">
        <p class="foot-h">Bezpieczne zakupy</p>
        <div class="foot-trust">
          ''' + paybadges('F2') + '''
          <div class="foot-chips">
            <span class="foot-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg> 14 dni na odstąpienie od umowy</span>
            <span class="foot-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3Z"/><path d="M9 12l2 2 4-4"/></svg> Bezpieczne płatności — BLIK, karta lub przy odbiorze</span>
            <span class="foot-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.5" y="6" width="13" height="10" rx="1.5"/><path d="M14.5 9H18l3.5 3.2V16h-7z"/><circle cx="6" cy="18" r="1.9"/><circle cx="17" cy="18" r="1.9"/></svg> Wysyłka pod wskazany adres</span>
          </div>
        </div>
      </div>
    </div>
    <div class="foot-bottom">
      <p class="foot-copy">© 2026 Rozgrzewek · sklep Ulepszek · Wszystkie prawa zastrzeżone</p>
      <p class="foot-note">Ceny zawierają VAT · Zdjęcia mają charakter poglądowy</p>
    </div>
  </div>
</footer>
'''
patf = re.compile(r'<footer[^>]*>\s*<!--FOOTER@1-->\s*</footer>', re.S)
assert patf.search(idx), 'brak markera FOOTER@1'
idx = patf.sub(lambda m: FOOTER, idx, count=1)
print('OK footer@1')

# ── STICKY-BUY@1 + LL-052 (IO .hero + IO #zamow chowa sticky) ──
STICKY = '''<style>
  .sticky-buy{position:fixed;left:0;right:0;bottom:0;z-index:60;transform:translateY(120%);
    transition:transform .32s cubic-bezier(.4,0,.2,1);background:rgba(250,243,239,.95);
    backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-top:1px solid var(--line);
    box-shadow:0 -8px 30px rgba(80,50,25,.12);padding:10px 16px calc(10px + env(safe-area-inset-bottom))}
  .sticky-buy.show{transform:translateY(0)}
  .sticky-buy .sb{display:flex;align-items:center;gap:12px;max-width:var(--content-w);margin:0 auto}
  .sticky-buy .sb-thumb{width:44px;height:44px;border-radius:var(--radius-sm);object-fit:contain;flex:0 0 auto;background:var(--paper-2)}
  .sticky-buy .sb-info{flex:1;min-width:0}
  .sticky-buy .sb-price{font-weight:700;font-size:16.5px;color:var(--ink)}
  .sticky-buy .sb-price b{font-family:var(--font-display);font-weight:700}
  .sticky-buy .sb-sub{font-size:11.5px;color:var(--body);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sticky-buy .btn{padding:13px 24px;font-size:15.5px;white-space:nowrap}
  @media (min-width:900px){.sticky-buy{display:none}}
  @media (max-width:899px){body{padding-bottom:calc(74px + env(safe-area-inset-bottom))}}
</style>
<div class="sticky-buy" role="region" aria-label="Szybkie zamówienie">
  <div class="sb">
    <img class="sb-thumb" src="''' + PACKSHOT + '''" width="120" height="120" loading="lazy" alt="Rozgrzewek">
    <div class="sb-info">
      <div class="sb-price">Rozgrzewek · <b data-price>84,90 zł</b></div>
      <div class="sb-sub">Płatność przy odbiorze · BLIK · 14 dni na zwrot</div>
    </div>
    <a class="btn cta" data-checkout href="#zamow">Zamawiam</a>
  </div>
</div>
<script>
(function(){try{
  var sticky=document.querySelector('.sticky-buy');
  var hero=document.querySelector('.hero');
  var zamow=document.getElementById('zamow');
  if(!sticky) return;
  var pastHero=false, atCheckout=false;
  function apply(){ if(pastHero && !atCheckout){sticky.classList.add('show');} else {sticky.classList.remove('show');} }
  if('IntersectionObserver'in window){
    if(hero){ new IntersectionObserver(function(es){es.forEach(function(e){pastHero=!e.isIntersecting;});apply();},{threshold:0}).observe(hero); }
    else { pastHero=true; }
    if(zamow){ new IntersectionObserver(function(es){es.forEach(function(e){atCheckout=e.isIntersecting;});apply();},{threshold:0}).observe(zamow); }
    apply();
  } else { sticky.classList.add('show'); }
}catch(e){try{document.querySelector('.sticky-buy').classList.add('show');}catch(_e){}}
})();
</script>
<script>
/* LL-052: CTA #zamow -> scroll do formularza (.zc-form), nie do naglowka sekcji */
(function(){
  document.addEventListener('click',function(ev){
    var a=ev.target&&ev.target.closest?ev.target.closest('a[href="#zamow"]'):null;
    if(!a)return;
    var f=document.querySelector('#zamow .zc-form')||document.getElementById('zamow');
    if(!f)return;
    ev.preventDefault();
    f.scrollIntoView({behavior:'smooth',block:'start'});
  },true);
})();
</script>
'''
assert idx.count('<!--STICKY-BUY-->') == 1, 'brak markera STICKY-BUY'
idx = idx.replace('<!--STICKY-BUY-->', STICKY, 1)
print('OK sticky-buy@1 + LL-052')

# ── RUNTIME SNIPPET ──
snippet = io.open(SNIP, encoding='utf-8').read()
assert idx.count('<!--RUNTIME-SNIPPET-->') == 1, 'brak markera RUNTIME-SNIPPET'
idx = idx.replace('<!--RUNTIME-SNIPPET-->', snippet, 1)
print('OK runtime-snippet')

io.open(IDX, 'w', encoding='utf-8').write(idx)
print('ZAPISANE — index.html: %d znakow' % len(idx))
