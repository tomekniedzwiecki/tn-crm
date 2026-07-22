# -*- coding: utf-8 -*-
"""F4 MONTAZ modulow kanonicznych do landingu SKROLIKA (fabryka wf2).
Montaz WYLACZNIE po markerach jednoznacznych (assert count==1 przed kazda podmiana).
Wzorce 1:1 z ZMONTOWANEGO odsaczka (LL-050 summary-w-karcie, LL-052 interceptor,
anim-video IO 240px, pay-badges kanon, footer/sticky skinowane pod tokeny Skrolika).
Mechanika/JS modulow NIETYKALNE."""
import io, re, sys

sys.stdout.reconfigure(encoding='utf-8')

IDX = r'c:/repos_tn/tn-crm/sklepy/rafal-hoffa/skrolik/index.html'
MOD_CHECKOUT = r'c:/repos_tn/tn-crm/docs/zbuduje/moduly/checkout-inline@2.html'
MOD_LIGHTBOX = r'c:/repos_tn/tn-crm/docs/zbuduje/moduly/lightbox@1.html'
RUNTIME = r'c:/repos_tn/tn-crm/docs/zbuduje/assets/landing-runtime-snippet.html'

A = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/skrolik/'
KEEP2 = A + 'galeria/keep2-packshot-pink.webp'
TT_MP4 = A + 'tt/tt1.mp4'
TT_POSTER = A + 'tt/tt1-poster.webp'
FAVICON = A + 'brand/favicon-256.png'
API = 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-landing-api'

idx = io.open(IDX, encoding='utf-8').read()
mod = io.open(MOD_CHECKOUT, encoding='utf-8').read()
lb = io.open(MOD_LIGHTBOX, encoding='utf-8').read()
runtime = io.open(RUNTIME, encoding='utf-8').read()

sizes = {}


def assert1(marker, text=None):
    t = text if text is not None else idx
    n = t.count(marker)
    assert n == 1, 'marker %r wystapil %d razy (oczekiwano 1)' % (marker, n)


# ─────────────────────────────────────────────────────────────────────────
# A) CHECKOUT (LL-050) — wytnij czesci modulu, przenies summary do karty produktu
# ─────────────────────────────────────────────────────────────────────────
m_style = re.search(r'<!-- \(1\) STYLE.*?-->\s*(<style>.*?</style>)', mod, re.S).group(1)
m_markup = re.search(r'(<section id="zamow".*?</section>)', mod, re.S).group(1)
m_script = re.search(r'<!-- \(3\) SKRYPT.*?-->\s*(<script>.*?</script>)', mod, re.S).group(1)

# WNETRZE modulu (zdejmij zewnetrzny <section id="zamow"> wrapper — sekcja Skrolika juz jest)
inner = re.search(r'<section id="zamow"[^>]*>(.*)</section>\s*$', m_markup, re.S).group(1)

# WYTNIJ blok .zc-summary (do przeniesienia do .zm-product-card)
before_main = inner[:inner.index('<div class="zc-main">')]
summary_block = re.search(r'<div class="zc-summary".*</div>\s*</div>', before_main, re.S).group(0)
inner_no_summary = inner.replace(
    summary_block,
    '<!-- (1) PASEK PODSUMOWANIA — przeniesiony do .zm-product-card (LL-050) -->',
    1)
assert '<div class="zc-summary"' not in inner_no_summary, 'summary nie wyciety z checkoutu'

# Podmiany tresci w skorce (CTA ustawowe NIETKNIETE)
inner_no_summary = inner_no_summary.replace('>Dokończ zamówienie<', '>Zamów Skrolika<')
inner_no_summary = inner_no_summary.replace(
    'Sprzedawca: nazwa firmy · adres · NIP 000-000-00-00. Ceny zawierają VAT.',
    'Sprzedawca: sklep Zaradek · pełne dane sprzedawcy w Regulaminie. Ceny zawierają VAT.')

# SKIN LL-050 — aliasy --zc-*, neutralizacja padding (bo sect-pad siedzi na .wrap),
# przeniesienie summary do karty produktu, formularz w prawej karcie = 1 kolumna
SKIN = '''<!-- SKORKA modulu checkout-inline@2 pod Skrolika (aliasy tokenow; mechanika NIETYKALNA) -->
<style>
  /* root modulu = section#zamow (skrypt czyta config i stany na getElementById('zamow'),
     CSS stanow celuje .zc-checkout[data-zc-*] — ten sam element). Padding sekcji siedzi
     na .wrap.sect-pad — baza modulu ustawia padding na .zc-checkout, wiec ZERUJEMY go tu,
     zeby nie podwajac rytmu (bg = paper, jak sasiednie sekcje). */
  #zamow.zc-checkout{
    --zc-bg:transparent; --zc-card:var(--card); --zc-border:var(--line);
    --zc-text:var(--ink); --zc-muted:var(--body);
    --zc-accent:var(--cta); --zc-accent-text:var(--cta-ink);
    --zc-radius:var(--radius-lg); --zc-radius-sm:var(--radius-sm); --zc-radius-cta:var(--radius-lg);
    --zc-shadow:none; --zc-font:var(--font-text);
    background:var(--paper);
    padding:0;
  }
  #zamow.zc-checkout .zc-eyebrow{font-family:var(--font-text)}
  #zamow.zc-checkout .zc-h2{font-family:var(--font-display);font-weight:700;letter-spacing:-.02em}
  /* LL-050 (feedback Tomka): PODSUMOWANIE ZAMOWIENIA mieszka w KARCIE PRODUKTU (lewa
     kolumna, pod cena; karta sticky = rachunek zawsze na oku), a prawa karta = czysty
     formularz na pelnej szerokosci (bez kolumny summary). */
  @media (min-width:900px){
    #zamow.zc-checkout .zm-checkout-card .zc-form{
      grid-template-columns:minmax(0,1fr);
      grid-template-areas:"main" "trust";
    }
  }
  #zamow.zc-checkout .zm-product-card .zc-summary{
    position:static;grid-area:auto;margin-top:var(--s2);
    border:0;border-top:1px solid var(--line);border-radius:0;background:transparent;overflow:visible;
  }
  #zamow.zc-checkout .zm-product-card .zc-sum-bar{display:none}
  #zamow.zc-checkout .zm-product-card .zc-sum-details{display:block;padding:6px 0 0;border-top:0}
  /* mobile: karta produktu = grid 96px + 1fr; summary musi objac obie kolumny */
  @media (max-width:767px){
    #zamow.zc-checkout .zm-product-card .zc-summary{grid-column:1/-1;margin-top:var(--s2)}
  }
</style>
'''

# PB_CSS — styl pay-badges (potrzebny by trust modulu wyrenderowal biale pigulki badge'ow)
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

checkout_block = SKIN + '\n' + m_style + '\n\n<div class="zc-inline"><!-- markup modulu; root/konfiguracja zyje na section#zamow -->\n' + inner_no_summary + '</div>\n\n' + m_script + '\n' + PB_CSS
sizes['CHECKOUT-INLINE'] = len(checkout_block)

assert1('<!--CHECKOUT-INLINE-->')
idx = idx.replace('<!--CHECKOUT-INLINE-->', checkout_block, 1)
print('OK checkout-inline@2 (LL-050) — blok %d znakow; summary=%d znakow wyciete' % (len(checkout_block), len(summary_block)))

# przenies summary do .zm-product-card PO zamknieciu .zm-product-info
sum_target = re.compile(
    r'(<p class="zm-product-price">\s*<span data-price>34,90 zł</span>\s*</p>\s*</div>)(\s*</article>)', re.S)
assert len(sum_target.findall(idx)) == 1, 'kotwica .zm-product-info != 1'
sum_ins = ('\\1\n\n        <!-- PODSUMOWANIE ZAMÓWIENIA w karcie produktu (LL-050, feedback Tomka:\n'
           '             rachunek pod cena; karta sticky = rachunek zawsze na oku) -->\n        '
           + summary_block + '\\2')
idx = sum_target.sub(lambda m: m.group(1) + '\n\n        <!-- PODSUMOWANIE ZAMÓWIENIA w karcie produktu (LL-050, feedback Tomka:\n'
                     '             rachunek pod cena; karta sticky = rachunek zawsze na oku) -->\n        '
                     + summary_block + m.group(2), idx, count=1)
print('OK summary przeniesione do .zm-product-card')

# tag sekcji #zamow: zc-checkout + steps + config
old_sec = '<section id="zamow">'
assert1(old_sec)
new_sec = ('<section id="zamow" class="zc-checkout" data-zc-layout="steps" aria-labelledby="zc-title"\n'
           '         data-zc-product="{{WF2_PRODUCT_ID}}"\n'
           '         data-zc-api="' + API + '" data-zc-thumb-src="' + KEEP2 + '">')
idx = idx.replace(old_sec, new_sec, 1)
print('OK section#zamow: +zc-checkout +data-zc-* (LL-050 root)')


# ─────────────────────────────────────────────────────────────────────────
# B) WIDEO-RAIL (LL-045) — jeden kafel 1:1, mechanika anim-video IO (240px)
# ─────────────────────────────────────────────────────────────────────────
VIDEO_RAIL = '''<style>
  #wideo .vd-tile{margin:0}
  #wideo .vd-frame{
    position:relative;width:100%;aspect-ratio:1/1;overflow:hidden;
    border:1px solid var(--line);border-radius:var(--radius-lg);
    background:var(--paper-3);box-shadow:var(--shadow-md);
  }
  #wideo .vd-frame .vd-poster{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  #wideo .vd-frame .anim-video{position:absolute;inset:0;z-index:1;display:block;width:100%;height:100%;
    object-fit:cover;opacity:0;pointer-events:none;transition:opacity var(--mo-dur-l) var(--mo-ease)}
  #wideo .vd-frame .anim-video.on{opacity:1}
  #wideo .vd-caption{margin:var(--s2) 0 0;color:var(--body);font-size:14px;line-height:1.45;text-align:center}
  @media (prefers-reduced-motion:reduce){#wideo .vd-frame .anim-video{transition:none !important}}
</style>
<figure class="vd-tile">
  <div class="vd-frame">
    <img class="vd-poster" src="''' + TT_POSTER + '''" width="720" height="720" loading="lazy" decoding="async" alt="Kadr z filmu: kciuk na Skroliku przewija feed, telefon oparty na konsoli bieżni">
    <video class="anim-video" muted loop playsinline preload="none"
      poster="''' + TT_POSTER + '''" data-anim-src="''' + TT_MP4 + '''"></video>
  </div>
  <figcaption class="vd-caption">Kciuk przewija feed — telefon stoi na konsoli bieżni</figcaption>
</figure>'''
sizes['WIDEO-RAIL'] = len(VIDEO_RAIL)
assert1('<!--WIDEO-RAIL-->')
idx = idx.replace('<!--WIDEO-RAIL-->', VIDEO_RAIL, 1)
print('OK wideo-rail (LL-045, jeden kafel 1:1, anim-video) — %d znakow' % len(VIDEO_RAIL))


# ─────────────────────────────────────────────────────────────────────────
# C) FAQ — natywny details/summary (ZERO JS), 6 pozycji VERBATIM
# ─────────────────────────────────────────────────────────────────────────
FAQ_ITEMS = [
    ('Czy działa z moim telefonem?',
     'Skrolik łączy się przez Bluetooth z telefonem i tabletem. Parujesz go raz — w ustawieniach Bluetooth.', True),
    ('Jak sparować pierścień?',
     'Włącz Bluetooth w telefonie, wybierz Skrolika z listy urządzeń i gotowe. Parujesz raz — potem pierścień łączy się sam.', False),
    ('Czy przewija w bok?',
     'Nie — Skrolik przewija w pionie. Tak przewijasz feed, artykuły i ebooki.', False),
    ('Jak się ładuje?',
     'Przez gniazdo ładowania wbudowane w pierścień.', False),
    ('Co jest w zestawie?',
     'Pierścień Skrolik — 1 sztuka.', False),
    ('Jak działa płatność przy odbiorze?',
     'Zamawiasz na tej stronie, a płacisz kurierowi dopiero przy odbiorze paczki. Masz też 14 dni na zwrot bez podawania przyczyny.', False),
]
faq_details = []
for q, a, is_open in FAQ_ITEMS:
    op = ' open' if is_open else ''
    faq_details.append(
        '        <details class="faq-item"%s>\n'
        '          <summary>%s<span class="faq-ic" aria-hidden="true"></span></summary>\n'
        '          <div class="faq-a">%s</div>\n'
        '        </details>' % (op, q, a))
FAQ = '''<style>
  #faq .faq-item{border-bottom:1px solid var(--line)}
  #faq .faq-item:last-child{border-bottom:0}
  #faq .faq-item summary{display:flex;align-items:center;justify-content:space-between;gap:22px;
    min-height:72px;padding:18px clamp(12px,1.6vw,22px);color:var(--ink);
    font-size:clamp(16px,1.35vw,20px);font-weight:700;line-height:1.35;cursor:pointer;list-style:none}
  #faq .faq-item summary::-webkit-details-marker{display:none}
  #faq .faq-item summary::marker{content:""}
  #faq .faq-item summary:focus-visible{outline:2px solid var(--cta);outline-offset:-3px;border-radius:12px}
  #faq .faq-ic{position:relative;flex:0 0 18px;width:18px;height:18px}
  #faq .faq-ic::before,#faq .faq-ic::after{content:"";position:absolute;top:50%;left:50%;width:16px;height:2px;
    border-radius:2px;background:var(--cta);transform:translate(-50%,-50%);transition:opacity .2s ease,transform .2s ease}
  #faq .faq-ic::after{transform:translate(-50%,-50%) rotate(90deg)}
  #faq .faq-item[open] .faq-ic::after{opacity:0;transform:translate(-50%,-50%) rotate(0deg)}
  #faq .faq-a{padding:0 clamp(12px,1.6vw,22px) 22px;color:var(--body);font-size:clamp(15px,1.12vw,17px);line-height:1.65}
  @media (max-width:767px){#faq .faq-item summary{min-height:64px;padding-block:16px}}
  @media (max-width:480px){#faq .faq-item summary{gap:14px}}
</style>
''' + '\n'.join(faq_details)
sizes['FAQ-ACCORDION'] = len(FAQ)
assert1('<!--FAQ-ACCORDION-->')
idx = idx.replace('<!--FAQ-ACCORDION-->', FAQ, 1)
print('OK faq-accordion@1 (6 pozycji, ZERO JS) — %d znakow' % len(FAQ))


# ─────────────────────────────────────────────────────────────────────────
# D) GALERIA / LIGHTBOX — mechanika lightbox@1 + tag .gitem na kaflach-zdjeciach
# ─────────────────────────────────────────────────────────────────────────
lb_overlay = re.search(r'(<div class="lb-overlay".*?</div>)', lb, re.S).group(1)
lb_script = re.search(r'(<script>.*?</script>)', lb, re.S).group(1)
LIGHTBOX = '''<!-- lightbox@1 (mechanika NIETYKALNA; skorka pod tokeny Skrolika) -->
<style>
  .lb-overlay{position:fixed;inset:0;z-index:120;display:none;align-items:center;justify-content:center;
    background:rgba(43,32,37,.82);backdrop-filter:blur(4px);padding:24px}
  .lb-overlay.open{display:flex}
  .lb-overlay img{max-width:min(92vw,1000px);max-height:88vh;width:auto;height:auto;border-radius:var(--radius-lg);
    box-shadow:0 30px 80px rgba(43,32,37,.5)}
  .lb-overlay .lb-x{position:absolute;top:18px;right:20px;width:44px;height:44px;border-radius:50%;
    border:none;background:rgba(255,255,255,.94);color:var(--ink);font-size:22px;cursor:pointer;line-height:1}
  .gitem{cursor:zoom-in}
</style>
''' + lb_overlay + '\n' + lb_script
sizes['GALERIA'] = len(LIGHTBOX)
assert1('<!--GALERIA-->')
idx = idx.replace('<!--GALERIA-->', LIGHTBOX, 1)

# tag .gitem + data-full na 4 kaflach-zdjeciach (NIE karta spec SVG)
n_tiles = 0
for suffix in ('wide', 'pink', 'port', 'clip'):
    old = '<figure class="ko-tile ko-photo ko-photo--%s">' % suffix
    new = '<figure class="gitem ko-tile ko-photo ko-photo--%s">' % suffix
    assert idx.count(old) == 1, 'kafel ko-photo--%s != 1' % suffix
    idx = idx.replace(old, new, 1)
    n_tiles += 1
# data-full = URL pelnego zdjecia na <a>? kafle to <figure> — lightbox czyta img src (fallback).
# Dodaj data-full na figure wprost (kontrakt galeria@1), pobierajac src z <img> kafla.
for m in re.finditer(r'<figure class="gitem ko-tile ko-photo[^"]*">\s*<img\s+src="([^"]+)"', idx):
    pass  # src juz jest w img — lightbox@1 uzywa fallbacku g.querySelector('img').src
print('OK lightbox@1 zamontowany + %d kafli oznaczonych .gitem (spec-karta pominieta)' % n_tiles)


# ─────────────────────────────────────────────────────────────────────────
# E) STICKY-BUY — wzor montaz.py, skin Skrolika; IO na .hero
# ─────────────────────────────────────────────────────────────────────────
STICKY = '''<style>
  .sticky-buy{position:fixed;left:0;right:0;bottom:0;z-index:60;transform:translateY(120%);
    transition:transform .32s cubic-bezier(.4,0,.2,1);background:rgba(248,241,240,.95);
    backdrop-filter:blur(12px);border-top:1px solid var(--line);box-shadow:0 -8px 30px rgba(43,32,37,.10);
    padding:10px 16px calc(10px + env(safe-area-inset-bottom))}
  .sticky-buy.show{transform:translateY(0)}
  .sticky-buy .sb{display:flex;align-items:center;gap:12px;max-width:var(--content-w);margin:0 auto}
  .sticky-buy .sb-thumb{width:44px;height:44px;border-radius:var(--radius-sm);object-fit:cover;flex:0 0 auto;background:var(--paper-2)}
  .sticky-buy .sb-info{flex:1;min-width:0}
  .sticky-buy .sb-price{font-weight:700;font-size:16.5px;color:var(--ink);white-space:nowrap}
  .sticky-buy .sb-price b{font-family:var(--font-display);font-weight:700}
  .sticky-buy .sb-sub{font-size:11.5px;color:var(--body);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sticky-buy .btn{padding:13px 24px;font-size:15.5px;white-space:nowrap}
  @media (min-width:900px){.sticky-buy{display:none}}
  @media (max-width:899px){body{padding-bottom:calc(74px + env(safe-area-inset-bottom))}}
</style>
<div class="sticky-buy" role="region" aria-label="Szybkie zamówienie">
  <div class="sb">
    <img class="sb-thumb" src="''' + KEEP2 + '''" width="120" height="120" loading="lazy" alt="Skrolik">
    <div class="sb-info">
      <div class="sb-price">Skrolik · <b data-price>34,90 zł</b></div>
      <div class="sb-sub">BLIK · karta · za pobraniem</div>
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
</script>'''
sizes['STICKY-BUY'] = len(STICKY)
assert1('<!--STICKY-BUY-->')
idx = idx.replace('<!--STICKY-BUY-->', STICKY, 1)
print('OK sticky-buy@1 (skin Skrolika) — %d znakow' % len(STICKY))

# klasa .hero na sekcji hero (wymog IO sticky)
old_hero = '<section id="hero" class="hr-hero sect-pad">'
assert1(old_hero)
idx = idx.replace(old_hero, '<section id="hero" class="hr-hero sect-pad hero">', 1)
print('OK klasa .hero dodana do sekcji hero')


# ─────────────────────────────────────────────────────────────────────────
# F) FOOTER@1 — skin Skrolika (BEZ ratingu; paybadges F2)
# ─────────────────────────────────────────────────────────────────────────
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
          <img class="brand-mark" src="''' + FAVICON + '''" width="96" height="96" alt="" aria-hidden="true" loading="lazy" decoding="async">
          <span>Skrolik</span>
        </div>
        <p class="foot-claim">Pierścień Bluetooth do przewijania — kciuk naciska przycisk, ekran przewija się sam. Kartkuje ebooki i robi zdjęcia zdalnie.</p>
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
      <p class="foot-copy">© 2026 Skrolik · Wszystkie prawa zastrzeżone</p>
      <p class="foot-note">Ceny zawierają VAT · Zdjęcia mają charakter poglądowy</p>
    </div>
  </div>
</footer>'''
sizes['FOOTER@1'] = len(FOOTER)
patf = re.compile(r'<footer>\s*<!--FOOTER@1-->\s*</footer>', re.S)
assert len(patf.findall(idx)) == 1, 'marker FOOTER@1 (footer wrapper) != 1'
idx = patf.sub(lambda m: FOOTER, idx, count=1)
print('OK footer@1 (skin Skrolika, BEZ ratingu, paybadges F2) — %d znakow' % len(FOOTER))


# ─────────────────────────────────────────────────────────────────────────
# G) RUNTIME-SNIPPET — anim-video IO (240px) + LL-052 interceptor + runtime
# ─────────────────────────────────────────────────────────────────────────
VIDEO_IO = '''<script>
  (() => {
    // ANIM-3 / wideo-rail: lazy [data-anim-src] — kazdy viewport (IO 240px, LL-045/LL-049)
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || !("IntersectionObserver" in window)) return;

    const vids = document.querySelectorAll("video.anim-video[data-anim-src]");
    if (!vids.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const v = en.target;
        if (!en.isIntersecting) { if (v._on) v.pause(); return; }
        if (!v.src) {
          v.addEventListener("canplay", () => {
            const p = v.play();
            const ok = () => { v.classList.add("on"); v._on = true; };
            if (p && typeof p.then === "function") p.then(ok).catch(() => {});
            else ok();
          }, { once: true });
          v.src = v.getAttribute("data-anim-src");
          v.load();
        } else if (v._on) {
          const p = v.play();
          if (p && typeof p.catch === "function") p.catch(() => {});
        }
      });
    }, { rootMargin: "240px 0px", threshold: 0.15 });

    vids.forEach((v) => io.observe(v));
  })();
</script>'''

LL052 = '''<script>
  (() => {
    // LL-052: na mobile CTA -> #zamow laduje na FORMULARZU danych (.zc-form),
    // nie na karcie produktu u gory sekcji. Desktop: karta+formularz obok siebie, bez zmian.
    const mq = matchMedia("(max-width: 899px)");
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href="#zamow"]');
      if (!a || !mq.matches) return;
      const form = document.querySelector("#zamow .zc-form");
      if (!form) return;
      e.preventDefault();
      const tb = document.querySelector(".topbar");
      const off = (tb && getComputedStyle(tb).position === "sticky" ? tb.offsetHeight : 0) + 10;
      window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - off, behavior: "smooth" });
      history.replaceState(null, "", "#zamow");
    });
  })();
</script>'''

RUNTIME_BLOCK = VIDEO_IO + '\n\n' + LL052 + '\n\n' + runtime.strip()
sizes['RUNTIME-SNIPPET'] = len(RUNTIME_BLOCK)
assert1('<!--RUNTIME-SNIPPET-->')
idx = idx.replace('<!--RUNTIME-SNIPPET-->', RUNTIME_BLOCK, 1)
print('OK runtime-snippet + LL-052 + anim-video IO — %d znakow' % len(RUNTIME_BLOCK))


# ═════════════════════════════════════════════════════════════════════════
# WALIDACJA KONCOWA
# ═════════════════════════════════════════════════════════════════════════
print('\n══════════ WALIDACJA ══════════')
ok = True

markers = ['<!--GALERIA-->', '<!--WIDEO-RAIL-->', '<!--CHECKOUT-INLINE-->', '<!--FAQ-ACCORDION-->',
           '<!--FOOTER@1-->', '<!--STICKY-BUY-->', '<!--RUNTIME-SNIPPET-->']
for mk in markers:
    c = idx.count(mk)
    print('  marker %-22s : %d %s' % (mk, c, 'OK' if c == 0 else 'FAIL — nieskonsumowany!'))
    ok = ok and c == 0

n_zamow = idx.count('<section id="zamow"')
print('  <section id="zamow"      : %d %s' % (n_zamow, 'OK' if n_zamow == 1 else 'FAIL'))
ok = ok and n_zamow == 1

n_pid = idx.count('{{WF2_PRODUCT_ID}}')
print('  {{WF2_PRODUCT_ID}}       : %d %s (>=2)' % (n_pid, 'OK' if n_pid >= 2 else 'FAIL'))
ok = ok and n_pid >= 2

n_price = idx.count('data-price')
n_price_hook = len(re.findall(r'data-price(?![-\w])', idx))
print('  data-price (hook)        : %d %s (>=3)' % (n_price_hook, 'OK' if n_price_hook >= 3 else 'FAIL'))
ok = ok and n_price_hook >= 3

head = idx[:idx.index('</head>')]
has_price_head = '34,90' in head
print('  "34,90" w <head>         : %s %s' % (has_price_head, 'OK (brak)' if not has_price_head else 'FAIL — cena w head!'))
ok = ok and not has_price_head

for tag in ['<section', '<style', '<script']:
    op = len(re.findall(re.escape(tag) + r'[ >]', idx))
    cl = idx.count('</' + tag[1:] + '>')
    bal = op == cl
    print('  balans %-8s          : %d otw / %d zam %s' % (tag, op, cl, 'OK' if bal else 'FAIL'))
    ok = ok and bal

# hexy spoza palety
palette = {'#F8F1F0', '#F3E8E7', '#ECDCDB', '#FFFDFC', '#2B2025', '#6E5F63', '#E6D8D9',
           '#B4265C', '#971D49', '#FFFFFF'}
canon = {'#5A5A5A', '#484848', '#212121', '#080808', '#E52F08', '#E94F96',
         '#1A1F71', '#EB001B', '#F79E1B', '#FF5F00', '#FFF', '#000'}
zc_defaults = {'#F5F6F8', '#E4E7EC', '#111827', '#667085', '#16A34A', '#DC2626', '#FF5F00'}
allowed = {h.upper() for h in (palette | canon | zc_defaults)}
hexes = re.findall(r'#[0-9a-fA-F]{3,6}\b', idx)
foreign = {}
for h in hexes:
    H = h.upper()
    if H in allowed:
        continue
    foreign[H] = foreign.get(H, 0) + 1
print('\n  hexy spoza palety/kanonu (do przegladu):')
if foreign:
    for h, c in sorted(foreign.items()):
        print('    %s ×%d' % (h, c))
else:
    print('    (brak — wszystkie hexy = paleta Skrolika / kanon pay-badges / defaulty --zc-*)')

# --zc-ok / --zc-error obecne (defaulty modulu)
print('  --zc-ok/--zc-error w pliku: %s / %s' % ('#16a34a' in idx, '#dc2626' in idx))

print('\n  rozmiar pliku koncowy    : %d znakow (%.1f KB)' % (len(idx), len(idx) / 1024.0))
print('\n  rozmiary blokow montazu:')
for k in ['CHECKOUT-INLINE', 'WIDEO-RAIL', 'FAQ-ACCORDION', 'GALERIA', 'STICKY-BUY', 'FOOTER@1', 'RUNTIME-SNIPPET']:
    print('    %-18s : %d znakow' % (k, sizes[k]))

print('\n  WERDYKT: %s' % ('ZIELONY — wszystko OK' if ok else 'CZERWONY — patrz FAIL wyzej'))

if not ok:
    print('\n⛔ NIE ZAPISANO — walidacja nie przeszla.')
    sys.exit(1)

io.open(IDX, 'w', encoding='utf-8').write(idx)
print('\n✅ ZAPISANO: %s (%d znakow)' % (IDX, len(idx)))
