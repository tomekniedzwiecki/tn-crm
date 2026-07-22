# ZADANIE: SZKIELET-KONTRAKT index.html — landing „Odsączek" (fabryka landingów sklepów)

Jesteś senior front-end koderem fabryki. Wygeneruj JEDEN kompletny plik `index.html` —
SZKIELET landingu (bez treści sekcji — sekcje puste z markerami). Polski e-commerce COD.
Vanilla HTML+CSS+JS, zero frameworków, zero CDN poza Google Fonts.

## HEAD (dokładnie)
- lang="pl", charset UTF-8, viewport.
- <title>Odsączek — składany koszyk do smażenia i odsączania | 29,90 zł</title>
- meta description: "Odsączek to składany koszyk ze stali nierdzewnej do smażenia w garnku
  lub woku. Wyjmij całą porcję jednym ruchem i zawieś na rancie — olej ocieka do garnka.
  29,90 zł · płatność przy odbiorze · 14 dni na zwrot."
- theme-color #F4EFE5. OG: type website, title/description jak wyżej, og:image =
  https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/og-1200x630.jpg
- <link rel="canonical" href="{{CANONICAL_URL}}"> + og:url {{CANONICAL_URL}} + <meta name="robots" content="noindex">
  z komentarzem: PREVIEW na crm.*; publikacja przez API zdejmuje noindex.
- favicon data-URI: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAD+UlEQVR4nK2XS4gcRRjHf9/MrI8NZH0cukVcPEh8XAQjOfQc1kAMPg5iQA8mGBH0kG5wCcgGPWgOuQhCkKmLIDmIS7yIoBJEkV1xOgoGRA9684XSLUrYmCg7OzMlX1O99vbOo3cyHxTdXfXV96p//atLmFC8MBBAm4pNTWwnsSMTOK0DvUEOvTBoAP3UxP1JghkpXhjUit/WWtc2smd5zAU7VmScghpKWm0rIlh7GT86+DxwDLi3pHoReBd4NTVx6ubWUxP3Jg7ACwPJS+2FwXPAm1WyAlaS1gf7RW7eYmNHAXiauWlbLPhR8wugWVL5EvgG6AB3AQeALcsE3Jqa+PdRlZChzhdCyxNPqfPvnYNcDiet9rIuSXnd/ai5F/gM2F0Y2p2a+G/F0CBwNoYUQOTJw9YLzdsF538krc89kQZiJHdYz/2LiBq/YK2d86Pme8DjbuyStesCx/s+bFuOxoDss3J5YXA7cCR3kLTOZs69MJgBuiKihnrbtqhIN4VDXhh8DWhF8KP9JjVx6OZ2xlWg756fFPp2icxn+zw18cagkrnMun4Y1O3ico87rrvfjw7l2R6z1oYi0tlWarZmn62TyyYP5Fxq4keqbKmyeGHwAnDafX4E3ALcl7TaohhSP2XU5t9PF/qWHNFU4YwME14YHPXC4AfgRGH4UXUOvOOca7K2HEBess0tl7TOfecQX4leXbB/AXfq8rt5m8BLltpHnI7dggFX9pq1r/X86P15191XXFn7Bn50diy9Jrse6/lRUzP70No18aOHLyt+XBA6dx+3CX4UXJOauDOKB84AzwD/piae5SrEC4PXgePA+dTEQXlcCsC7EVDGuwTsAW5yOheAa3d6cjo8KSYOAnO/vHL62/mTi2pL/exNTXxRfTcKhl8E7hlgKNvLVyE/AafmTy4qdV/v+pYcQCU7v7UnabVf8qOmrteGO+kOlAE0oWgVXgZ+BJQhZ5JW+4SyqdofhoF9wFeO6XK6nVS6DuwPpSb+uDxYKzhVPMzatX9wW2hakie5x65dUT+zxd1UK1FpR+Zm86inLT2Z0xWmUzyQamOinqYMPHlrQ5R3xPkVZa1KANY9lQ+YAgCLNlZKPrYHkJq4pzydtN76bUrV2JybnFr92Z0B/ZFL4EfNusjd+hoU8DAJF9gClh6UG2Yy2+U/olp5lvsbUno+DxinI25n5MQ0qvWdbna4AWdSE3/q/o57lUCYmriv5UpNHBXO9EYhmFGtVkC83hGe/bV0cam83axdRWQhv3JpNY66g2mUKJUvA2Fq4it2ZRV5YIEpX8nWsbaHtX9ibde1ddf+z7bq9YwqQbgqVNWvlwMfJpPcjkfNy9LfyVX9P4DivGUIwPVXAAAAAElFTkSuQmCC
  + <link rel="icon" sizes="256x256"> i apple-touch-icon: https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/brand/favicon-256.png
- Fonty Google (preconnect + preload + stylesheet): Bricolage Grotesque 500;700 + Figtree 400;600, display=swap.
- preload as=image: https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/sc-hero.webp
- JSON-LD Product: name Odsączek, brand Zaradek, image = packshot-rozlozony.webp (pełny URL
  https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/packshot-rozlozony.webp), description krótki,
  offers: PLN, price 29.90, availability InStock, url {{CANONICAL_URL}}.
  ⛔ ZERO aggregateRating/review (produkt bez opinii — twardy zakaz fałszywego social-proof).

## :root — TOKENY (wklej DOSŁOWNIE, zakaz zmian wartości)
```css
:root{
  --font-display:"Bricolage Grotesque",system-ui,sans-serif; --font-text:"Figtree",system-ui,sans-serif;
  --paper:#F4EFE5; --paper-2:#EDE6D8; --paper-3:#E3DBC9; --card:#FFFCF6;
  --ink:#221E16; --body:#37322A; --line:#DCD5C8;
  --cta:#176B3A; --cta-hover:#115530; --cta-ink:#FFFFFF;
  --radius-lg:14px; --radius-sm:8px;
  --shadow-sm:0 1px 2px rgba(46,38,24,.06);
  --shadow-md:0 1px 2px rgba(46,38,24,.06),0 10px 26px rgba(46,38,24,.10);
  --shadow-lg:0 2px 4px rgba(46,38,24,.07),0 18px 40px rgba(46,38,24,.12);
  --s1:8px;--s2:16px;--s3:24px;--s4:32px;--s5:48px;--s6:64px;--s7:96px;
  --sect-pad-d:112px;--sect-pad-m:72px;--content-w:1180px;
  --h1-d:clamp(26px,2.6vw,34px);--h1-m:clamp(22px,6vw,26px);--h2-d:clamp(24px,2.4vw,30px);
  --h2-m:clamp(20px,5.5vw,24px);--price-fs:clamp(28px,3vw,36px);
  --body-fs:17px;--body-lh:1.55;
  --mo-dur-s:.24s;--mo-dur-m:.38s;--mo-dur-l:.58s;--mo-ease:cubic-bezier(.22,1,.36,1);--mo-dist:16px;
}
```
UWAGA SKALA: to skala TYPOGRAFII ŻYWEJ (H1 desktop max 34px!) — makiety rysują większe
nagłówki na planszy, kod trzyma TĘ skalę (lekcja poprzedniego landingu).

## BASE + SŁOWNIK KLAS GLOBALNYCH (styl serii — ciepły len, warsztatowy)
Jak w standardzie fabryki: *{box-sizing}, body na --paper/--body/--font-text, img
{max-width:100%;height:auto} (height:auto OBOWIĄZKOWO — atrybuty width/height jako hint),
.wrap (max-width var(--content-w), padding 0 22px), .sect-pad (clamp 56px..112px),
.eyebrow (caps, tracking .2em, --font-text 700 12px, --cta), .h2 (--font-display 700, --ink,
letter-spacing -.01em, font-size var(--h2-d)), .lead, .display (font-display).
- .btn / .btn.cta: bg --cta, tekst --cta-ink, radius var(--radius-lg), font --font-display 700,
  hover --cta-hover + lekki lift; focus-visible outline.
- .pill (trust-pill): fill --card, border 1px --line, tekst/ikony --ink, radius 999px — JEDEN styl globalnie.
- SYGNATURA serii: .arc (łukowa strzałka) = inline SVG <svg class="arc"> z JEDNĄ ścieżką
  ćwiartkowego łuku + małym grotem, stroke var(--cta) 2px, fill none. Komponent OSADZANY
  w miejscu użycia (position wg kontekstu w sekcji, NIE w klasie bazowej — klasa bazowa
  ustawia TYLKO stroke/fill/display:block; zakaz position/height w .arc). ⛔ Bez pisma
  odręcznego, bez technicznych calloutów z hairline+dot.
- Ikony: inline SVG stroke 1.5px, kolor --ink (NIGDY zieleń). Grain: jedno źródło SVG
  feTurbulence opacity .03 na pasmach .band (--paper-2), NIE na body.
- Reveal-on-scroll helper: .reveal { opacity:0; transform:translateY(var(--mo-dist)) } .reveal.in
  { opacity:1; transform:none; transition ... } + IntersectionObserver w JS (threshold .18,
  prefers-reduced-motion → bez animacji). ⛔ NIGDY nie centruj elementów transformem
  (kolizja z .reveal.in{transform:none}) — centrowanie przez left/right/margin-inline:auto.

## STRUKTURA BODY (sekcje PUSTE — tylko kontrakt)
Topbar sticky (logo lockup: favicon-256 img 28px + wordmark "Odsączek" jako ŻYWY TEKST
--font-display 700, min-height 44px; nav anchor: Jeden ruch / Zawieś / Na płasko / FAQ;
chip .pill "Płatność przy odbiorze" z ikoną SVG).
Potem sekcje w DOKŁADNIE tej kolejności, każda jako <section id="..."> z komentarzem-markerem
początku i końca (np. <!-- SEKCJA:01-hero START --> ... <!-- SEKCJA:01-hero END -->):
1. id="hero" class="hr-hero hero" (bez .sect-pad — archetyp H: kadr → hook → karta oferty)
2. id="jeden-ruch"
3. id="zawies"
4. id="zloz"   (TOR-I: toggle Rozłożony/Złożony — mechanika wejdzie w F6, tu tylko sekcja)
5. id="durszlak"
6. id="mycie"
7. id="mid-cta"
8. id="zamow"  (tu wewnątrz marker <!--CHECKOUT-INLINE--> — moduł fabryki wejdzie w montażu)
9. id="faq"
10. id="final"
Po sekcjach: <footer> placeholder z markerem <!--FOOTER@1-->, sticky-buy mobile placeholder
z markerem <!--STICKY-BUY--> (fixed bottom, hidden do czasu montażu; korzysta z [data-price]
i [data-checkout]). Marker <!--PAYBADGES--> będzie używany WEWNĄTRZ sekcji zamow/final w montażu.
⛔ W szkielecie ZERO szczątkowych reguł CSS dla .sticky-buy/.zc-checkout poza placeholderem
(martwe bloki szkieletu biły moduły w poprzednim landingu — lekcja LL-032).

## RUNTIME (wklej PRZED </body> DOSŁOWNIE, bez żadnych zmian)
<!--
  LANDING RUNTIME (workflow v2 / fabryka landingów) — WKLEJANY PRZED </body> każdego landinga.
  Kontrakt DOM:
    - CTA:   <a data-checkout href="#zamow">…</a>  → runtime podmienia href na checkout_url z API
    - CENA:  <span data-price>149,90 zł</span>     → runtime nadpisuje AKTUALNĄ ceną (zapieczona = fallback)
             <span data-price-raw>149.90</span>    → wariant bez formatowania (opcjonalny)
    - SOLD (opcjonalny, UCZCIWY social-proof z REALNYCH zamówień naszego sklepu):
             <span data-sold-wrap hidden>Już <b data-sold>–</b> zamówień w naszym sklepie</span>
             → runtime wstawia liczbę i ODKRYWA wrap TYLKO gdy sold ≥ próg (data-sold-min,
             domyślnie 30). Poniżej progu sekcja zostaje ukryta — zero fałszywych liczb.
  Placeholdery podmieniane PRZY PUBLIKACJI (krok pl_publikacja):
    {{WF2_PRODUCT_ID}} — wf2_products.id
    {{PIXEL_ID}}       — Meta pixel (zwykle NIEPOTRZEBNY: platforma wstrzykuje pixel przez
                         integracje; placeholder zostaje na wypadek preview poza platformą)
  REGUŁY (SSOT: docs/zbuduje/platforma-api/README.md + STANDARD-LANDING-SKLEPY §5):
    1. INIT-GUARD META: platforma wstrzykuje pixel na strony isHtml — landing NIGDY nie robi
       drugiego init/PageView; dowiesza TYLKO ViewContent/AddToCart/InitiateCheckout.
       Własny loader fbq odpala się WYŁĄCZNIE, gdy po 3 s nie ma window.fbq (preview poza platformą).
    2. ANALITYKA PLATFORMY: window.trevio (SDK wstrzykiwany na stronach custom-HTML) —
       viewItem przy load, addToCart + beginCheckout przy kliknięciu CTA. PageView automatyczny.
    3. CENA: pobierana z wf2-landing-api (cache 5 min); brak sieci = zostaje zapieczona.
    4. ATRYBUCJA: do checkout_url doklejamy fbclid/_fbp/_fbc (wymóg CAPI §6 TESTY.md).
-->
<script>
(function () {
  'use strict';
  var CFG = {
    productId: '{{WF2_PRODUCT_ID}}',
    api: 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-landing-api',
    pixelId: '{{PIXEL_ID}}'
  };
  var configured = function (v) { return v && v.indexOf('{{') === -1; };
  var state = { name: document.title, price: null, currency: 'PLN', checkoutUrl: '' };

  function fmtPln(n) {
    try { return n.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł'; }
    catch (e) { return n + ' zł'; }
  }
  function getCookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  }
  // fallback: zapieczona cena z pierwszego [data-price-raw]/[data-price]
  (function bakedPrice() {
    var raw = document.querySelector('[data-price-raw]');
    if (raw) { var v = parseFloat(String(raw.textContent).replace(',', '.')); if (v > 0) { state.price = v; return; } }
    var el = document.querySelector('[data-price]');
    if (el) { var t = String(el.textContent).replace(/[^\d,\.]/g, '').replace(',', '.'); var p = parseFloat(t); if (p > 0) state.price = p; }
  })();

  function decorateCheckoutUrl(url) {
    try {
      var u = new URL(url);
      var qs = new URLSearchParams(location.search);
      var fbclid = qs.get('fbclid'); var fbp = getCookie('_fbp'); var fbc = getCookie('_fbc');
      if (fbclid && !u.searchParams.get('fbclid')) u.searchParams.set('fbclid', fbclid);
      if (fbp) u.searchParams.set('_fbp', fbp);
      if (fbc || fbclid) u.searchParams.set('_fbc', fbc || ('fb.1.' + Date.now() + '.' + fbclid));
      return u.toString();
    } catch (e) { return url; }
  }
  function applyState() {
    if (state.price != null) {
      document.querySelectorAll('[data-price]').forEach(function (el) { el.textContent = fmtPln(state.price); });
      document.querySelectorAll('[data-price-raw]').forEach(function (el) { el.textContent = String(state.price); });
    }
    if (state.checkoutUrl) {
      document.querySelectorAll('[data-checkout]').forEach(function (a) {
        if (a.tagName === 'A') a.setAttribute('href', decorateCheckoutUrl(state.checkoutUrl));
      });
    }
  }

  // ── aktualna cena + link kasy z API (fallback: zapieczone wartości) ──
  if (configured(CFG.productId)) {
    fetch(CFG.api + '?product=' + encodeURIComponent(CFG.productId))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d) return;
        if (d.price != null && d.price > 0) state.price = d.price;
        if (d.checkout_url) state.checkoutUrl = d.checkout_url;
        if (d.name) state.name = d.name;
        // social-proof: realne zamówienia sklepu; pokazujemy WYŁĄCZNIE od progu (uczciwe liczby)
        if (typeof d.sold === 'number') {
          document.querySelectorAll('[data-sold-wrap]').forEach(function (w) {
            var min = parseInt(w.getAttribute('data-sold-min') || '30', 10);
            if (d.sold >= min) {
              w.querySelectorAll('[data-sold]').forEach(function (el) { el.textContent = d.sold.toLocaleString('pl-PL'); });
              w.hidden = false; w.removeAttribute('hidden');
            }
          });
        }
        applyState();
        trevioViewItem();
      })
      .catch(function () { /* zapieczona cena zostaje */ });
  }

  // ── Meta pixel: init-guard (platforma wstrzykuje pixel — NIE dublować init/PageView) ──
  var vcSent = false;
  function fbqSafe(evt) {
    if (window.fbq) { try { window.fbq('track', evt); } catch (e) {} }
  }
  function viewContentOnce() { if (!vcSent && window.fbq) { vcSent = true; fbqSafe('ViewContent'); } }
  if (window.fbq) viewContentOnce();
  else {
    var waited = 0;
    var iv = setInterval(function () {
      waited += 250;
      if (window.fbq) { clearInterval(iv); viewContentOnce(); return; }
      if (waited >= 3000) {
        clearInterval(iv);
        // preview poza platformą: własny loader TYLKO gdy pixel skonfigurowany
        if (configured(CFG.pixelId)) {
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          window.fbq('init', CFG.pixelId); window.fbq('track', 'PageView');
          viewContentOnce();
        }
      }
    }, 250);
  }

  // ── analityka platformy (window.trevio — SDK stron custom-HTML) ──
  function trevioItem() {
    return { productId: CFG.productId, name: state.name, price: state.price != null ? state.price : 0 };
  }
  var viSent = false;
  function trevioViewItem() {
    if (viSent || !window.trevio || state.price == null) return;
    viSent = true;
    try { window.trevio.viewItem({ currency: state.currency, productId: CFG.productId, name: state.name, price: state.price }); } catch (e) {}
  }
  var tWait = 0;
  var tIv = setInterval(function () {
    tWait += 300;
    if (window.trevio) { clearInterval(tIv); trevioViewItem(); return; }
    if (tWait >= 4500) clearInterval(tIv);
  }, 300);

  // ── zdarzenia CTA: Meta ATC+IC oraz trevio addToCart+beginCheckout ──
  document.addEventListener('click', function (ev) {
    var el = ev.target && ev.target.closest ? ev.target.closest('[data-checkout]') : null;
    if (!el) return;
    // pixel-guard (Tomek 18.07): ATC/IC palimy TYLKO gdy przycisk realnie wychodzi na checkout
    // (href zhydratowany do URL platformy), NIE przy kliknięciu-scrollu do #zamow (fałszywe eventy)
    var _href = (el.getAttribute && el.getAttribute('href')) || '';
    if (_href.charAt(0) === '#' || !/^https?:/i.test(_href)) return;
    fbqSafe('AddToCart');
    fbqSafe('InitiateCheckout');
    if (window.trevio) {
      var item = trevioItem(); item.quantity = 1;
      try { window.trevio.addToCart({ currency: state.currency, productId: item.productId, name: item.name, price: item.price, quantity: 1 }); } catch (e) {}
      try { window.trevio.beginCheckout({ currency: state.currency, total: item.price, items: [item] }); } catch (e) {}
    }
  }, true);

  applyState();
})();
</script>

## ZAKAZY TWARDE
Zero gwiazdek/liczb opinii; zero ciemnych teł sekcji; zero fikcyjnych promocji/przekreśleń;
zero „24h"; zero wymiarów w cm i pojemności; zero „zmywarki"; jedyny akcent = --cta w scope
{CTA, aktywne stany, strzałki .arc}; nie zmieniaj tokenów; nie dodawaj treści sekcji
(szkielet!); polskie znaki wprost w treści.

## FORMAT ODPOWIEDZI
NAJPIERW krótka siatka struktury (lista), POTEM JEDEN blok kodu ```html z KOMPLETNYM index.html.
