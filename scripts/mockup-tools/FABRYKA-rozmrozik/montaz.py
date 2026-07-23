# -*- coding: utf-8 -*-
"""F4 MONTAZ modulow kanonicznych do index.html ROZMROZIKA:
- SEKCJA:09-zamow: marker <!--CHECKOUT-INLINE--> -> CALY modul checkout-inline@2
  (skorka aliasow --zc-*; mechanika NIETYKALNA; submit = 'Zamawiam z obowiazkiem zaplaty')
- pay-badges kanon (markery <!--PAYBADGES--> w hero i zamow; CSS raz)
- SEKCJA:06-wideo: CALA sekcja -> modul wideo-rail@1 z 5 kaflami tt1..tt5 (repeat(5,1fr))
- FOOTER@1 (skorka Rozmrozika; BEZ ratingu)
- STICKY-BUY@1 (IO na .hero; thumb=packshot-thumb.webp)
- LL-052: interceptor a[href="#zamow"] -> scroll do .zc-form
Montaz WYLACZNIE po markerach jednoznacznych (LL-035)."""
import io, re, sys

sys.stdout.reconfigure(encoding='utf-8')
IDX = r'c:/repos_tn/tn-crm/sklepy/patryk-skrzypniak/rozmrozik/index.html'
MOD = r'c:/repos_tn/tn-crm/docs/zbuduje/moduly/checkout-inline@2.html'
RAIL = r'c:/repos_tn/tn-crm/docs/zbuduje/moduly/wideo-rail@1.html'
A = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/'

idx = io.open(IDX, encoding='utf-8').read()
mod = io.open(MOD, encoding='utf-8').read()
rail = io.open(RAIL, encoding='utf-8').read()

# ── checkout-inline@2 ──
m_style = re.search(r'<!-- \(1\) STYLE.*?-->\s*(<style>.*?</style>)', mod, re.S).group(1)
m_markup = re.search(r'(<section id="zamow".*?</section>)', mod, re.S).group(1)
m_script = re.search(r'<!-- \(3\) SKRYPT.*?-->\s*(<script>.*?</script>)', mod, re.S).group(1)

inner = re.search(r'<section id="zamow"[^>]*>(.*)</section>\s*$', m_markup, re.S).group(1)
m_markup2 = ('<div class="zc-checkout" data-zc-layout="steps" data-zc-product="{{WF2_PRODUCT_ID}}">'
             + inner + '</div>')
m_markup2 = m_markup2.replace('>Dokończ zamówienie<', '>Zamawiam z obowiązkiem zapłaty<')
m_markup2 = m_markup2.replace(
    'Sprzedawca: nazwa firmy · adres · NIP 000-000-00-00. Ceny zawierają VAT.',
    'Sprzedawca: sklep Ulepszek · pełne dane sprzedawcy w Regulaminie. Ceny zawierają VAT.')

SKIN = '''<!-- SKORKA modulu checkout-inline@2 pod Rozmrozika (aliasy tokenow; mechanika NIETYKALNA) -->
<style>
  #zamow .zc-checkout{
    --zc-bg:transparent; --zc-card:var(--card); --zc-border:var(--line);
    --zc-text:var(--ink); --zc-muted:var(--body);
    --zc-accent:var(--cta); --zc-accent-text:var(--cta-ink);
    --zc-radius:var(--radius-lg); --zc-radius-sm:var(--radius-sm); --zc-radius-cta:var(--radius-lg);
    --zc-shadow:none; --zc-font:var(--font-text);
  }
  #zamow .zc-checkout .zc-eyebrow{font-family:var(--font-text)}
  #zamow .zc-checkout .zc-h2{font-family:var(--font-display);font-weight:700;letter-spacing:-.02em}
</style>
'''

blok = SKIN + '\n' + m_style + '\n\n' + m_markup2 + '\n\n' + m_script
pat_ci = re.compile(r'<!--CHECKOUT-INLINE-->')
assert len(pat_ci.findall(idx)) == 1, 'CHECKOUT-INLINE != 1 wystapienie (%d)' % len(pat_ci.findall(idx))
idx = pat_ci.sub(lambda m: blok, idx, count=1)
print('OK checkout-inline@2 w karcie #zamow (%d znakow)' % len(blok))


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
  #zamow .pay-badges{justify-content:center;margin-top:18px}
</style>
'''

pat_pb = re.compile(r'<!--PAYBADGES-->')
n_pb = len(pat_pb.findall(idx))
assert n_pb >= 1, 'brak markera PAYBADGES'
idx = pat_pb.sub(lambda m: PB_CSS + paybadges('Zc'), idx, count=1)
idx = pat_pb.sub(lambda m: paybadges('X2'), idx)
print('OK pay-badges (%d markerow)' % n_pb)

# ── WIDEO-RAIL@1: cala sekcja 06 -> modul z 5 kaflami ──
r_style = re.search(r'(<style>.*?</style>)', rail, re.S).group(1)
r_script = re.search(r'(<script>.*?</script>)\s*</section>', rail, re.S).group(1)
# skora Rozmrozika: eyebrow-linia -> thaw gradient; border kafla -> --line
r_style = r_style.replace('background: var(--cta);\n    }',
                          'background: linear-gradient(90deg, var(--cold), var(--cta));\n      height: 2px;\n      width: 76px;\n    }', 1)
r_style = r_style.replace('border: 1px solid rgba(241, 87, 58, .2);', 'border: 1px solid var(--line);')
r_style = r_style.replace('grid-template-columns: repeat(4, 1fr);', 'grid-template-columns: repeat(5, 1fr);')

tile_tpl = re.search(r'(<li class="vid__tile".*?</li>)', rail, re.S).group(1)
KLIPY = [
    ('tt1', '@sam.shan.shops', 'Klip 1', 'Rozmrozik w użyciu — klip z TikToka'),
    ('tt2', '@apieceofmyglamhome', 'Klip 2', 'Prezentacja boxu do rozmrażania w kuchni'),
    ('tt3', '@aliexpress.us', 'Klip 3', 'Pokaz działania urządzenia'),
    ('tt4', '@dailydeals.tiktokshop', 'Klip 4', 'Rozmrażanie porcji mięsa w boxie'),
    ('tt5', '@crystelmontenegrohome', 'Klip 5', 'Box do rozmrażania na blacie kuchennym'),
]
tiles, dots = [], []
for i, (key, autor, cap, alt) in enumerate(KLIPY):
    t = tile_tpl
    t = t.replace('{{MP4_1}}', A + 'tt/%s.mp4' % key)
    t = t.replace('{{POSTER_1}}', A + 'tt/%s-poster.webp' % key)
    t = t.replace('{{AUTOR_1}}', autor).replace('{{CAP_1}}', cap).replace('{{ALT_1}}', alt)
    tiles.append(t)
    dots.append('<button class="vid__dot%s" type="button" data-index="%d" aria-label="Pokaż wideo %d"%s></button>'
                % (' is-active' if i == 0 else '', i, i + 1, ' aria-current="true"' if i == 0 else ''))

SEKCJA_WIDEO = '''<section id="wideo" class="sect-pad" aria-labelledby="vid-h">
''' + r_style + '''
  <div class="wrap">
    <header class="vid__head">
      <p class="eyebrow vid__eyebrow">ZOBACZ W PIONIE</p>
      <div class="vid__title-wrap">
        <h2 id="vid-h" class="h2 vid__title">Pięć krótkich klipów. Jeden <span class="swash">produkt</span>.</h2>
        <svg class="vid__swash" viewBox="0 0 560 150" aria-hidden="true" focusable="false">
          <path d="M4 88C88 9 154 18 220 84s132 80 194 22 92-69 142-43" fill="none" stroke="currentColor" stroke-width="2"/>
          <path d="M5 99C92 20 154 31 218 94s128 73 193 13 95-67 145-31" fill="none" stroke="currentColor" stroke-width="1.4"/>
          <path d="M18 76C92 3 160 10 229 72s132 75 194 17 88-58 127-43" fill="none" stroke="currentColor" stroke-width="1"/>
        </svg>
      </div>
      <p class="vid__sub">Przesuń rail i odtwórz wybrany materiał.</p>
    </header>
    <ul class="vid__grid" role="list">
''' + '\n'.join(tiles) + '''
    </ul>
    <div class="vid__dots" aria-label="Wybierz wideo">
''' + '\n'.join(dots) + '''
    </div>
    <p class="vid__next" style="margin:26px 0 0;text-align:center">
      <a href="#zamow" style="color:var(--ink);font-weight:600;text-decoration:underline;text-underline-offset:4px">Przejdź do zamówienia →</a>
    </p>
  </div>
''' + r_script + '''
</section>'''

pat_w = re.compile(r'(<!--\s*SEKCJA:06-wideo START\s*-->).*?(<!--\s*SEKCJA:06-wideo END\s*-->)', re.S)
assert pat_w.search(idx), 'brak markerow 06-wideo'
idx = pat_w.sub(lambda m: m.group(1) + '\n' + SEKCJA_WIDEO + '\n' + m.group(2), idx)
print('OK wideo-rail@1 (5 kafli, repeat(5,1fr))')

# ── FOOTER@1 ──
FOOTER = '''<style>
  #footer{background:var(--paper-2);border-top:1px solid var(--line);color:var(--body);--muted:var(--body)}
  #footer .foot-top{display:grid;grid-template-columns:1.5fr 1fr 1.2fr;gap:clamp(26px,4vw,60px);
    padding:clamp(46px,6vw,74px) 0 clamp(30px,3.4vw,44px)}
  #footer .foot-brand{display:flex;align-items:center;gap:10px;color:var(--ink)}
  #footer .foot-brand .brand-mark{height:34px;width:auto;display:block;flex:0 0 auto}
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
          <img class="brand-mark" src="''' + A + '''brand/favicon-256.png" width="96" height="96" alt="" aria-hidden="true" loading="lazy" decoding="async">
          <span>Rozmrozik</span>
        </div>
        <p class="foot-claim">Elektryczny box do rozmrażania: aluminiowa płyta pod przezroczystą kopułą, start jednym dotknięciem i tacka zbierająca wodę.</p>
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
            <span class="foot-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg> 14 dni na zwrot bez podawania przyczyny</span>
            <span class="foot-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3Z"/><path d="M9 12l2 2 4-4"/></svg> Bezpieczne płatności — BLIK, karta lub za pobraniem</span>
            <span class="foot-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.5" y="6" width="13" height="10" rx="1.5"/><path d="M14.5 9H18l3.5 3.2V16h-7z"/><circle cx="6" cy="18" r="1.9"/><circle cx="17" cy="18" r="1.9"/></svg> Wysyłka pod wskazany adres</span>
          </div>
        </div>
      </div>
    </div>
    <div class="foot-bottom">
      <p class="foot-copy">© 2026 Rozmrozik · Wszystkie prawa zastrzeżone</p>
      <p class="foot-note">Ceny zawierają VAT · Zdjęcia mają charakter poglądowy</p>
    </div>
  </div>
</footer>
'''
patf = re.compile(r'<footer[^>]*>\s*<!--FOOTER@1-->\s*</footer>', re.S)
assert patf.search(idx), 'brak markera FOOTER@1'
idx = patf.sub(lambda m: FOOTER, idx, count=1)
print('OK footer@1')

# ── STICKY-BUY@1 ──
STICKY = '''<style>
  .sticky-buy{position:fixed;left:0;right:0;bottom:0;z-index:60;transform:translateY(120%);
    transition:transform .32s cubic-bezier(.4,0,.2,1);background:rgba(242,247,250,.95);
    backdrop-filter:blur(12px);border-top:1px solid var(--line);box-shadow:0 -8px 30px rgba(40,55,70,.10);
    padding:10px 16px calc(10px + env(safe-area-inset-bottom))}
  .sticky-buy.show{transform:translateY(0)}
  .sticky-buy .sb{display:flex;align-items:center;gap:12px;max-width:var(--content-w);margin:0 auto}
  .sticky-buy .sb-thumb{width:44px;height:44px;border-radius:var(--radius-sm);object-fit:cover;flex:0 0 auto;background:var(--paper-2)}
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
    <img class="sb-thumb" src="''' + A + '''assets/packshot-thumb.webp" width="120" height="120" loading="lazy" alt="Rozmrozik">
    <div class="sb-info">
      <div class="sb-price">Rozmrozik · <b data-price>289,00 zł</b></div>
      <div class="sb-sub">COD · BLIK · 14 dni na zwrot</div>
    </div>
    <a class="btn cta" data-checkout href="#zamow">Zamawiam</a>
  </div>
</div>
<script>
(function(){try{
  var stickyEl=document.querySelector('.sticky-buy'),heroEl=document.querySelector('.hero');
  if(stickyEl&&heroEl&&'IntersectionObserver'in window){
    new IntersectionObserver(function(es){es.forEach(function(en){en.isIntersecting?stickyEl.classList.remove('show'):stickyEl.classList.add('show');});},{threshold:0}).observe(heroEl);
  }else if(stickyEl){stickyEl.classList.add('show');}
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
pats = re.compile(r'<!--STICKY-BUY-->')
assert pats.search(idx), 'brak markera STICKY-BUY'
idx = pats.sub(lambda m: STICKY, idx, count=1)
print('OK sticky-buy@1 + LL-052')

io.open(IDX, 'w', encoding='utf-8').write(idx)
print('ZAPISANE — index.html: %d znakow' % len(idx))
