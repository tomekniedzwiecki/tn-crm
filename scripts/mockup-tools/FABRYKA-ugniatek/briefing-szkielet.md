# ZADANIE: SZKIELET-KONTRAKT index.html — landing „Ugniatek" (fabryka landingów sklepów)

Jesteś senior front-end koderem fabryki. Wygeneruj JEDEN kompletny plik `index.html` —
SZKIELET landingu (bez treści sekcji — sekcje puste z markerami). Polski e-commerce COD.
Vanilla HTML+CSS+JS, zero frameworków, zero CDN poza Google Fonts.

## HEAD (dokładnie)
- lang="pl", charset UTF-8, viewport.
- <title>Ugniatek — płaski masażer z 6 głowicami | 189,00 zł</title>
- meta description: "Ugniatek to płaski, bezprzewodowy masażer z 6 głowicami i dwoma uchwytami.
  Dociskaj oburącz albo połóż i oprzyj się plecami. 189,00 zł · płatność przy odbiorze · 14 dni na zwrot."
- theme-color #EEF1F2. OG: type website, title/description jak wyżej, og:image =
  https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/packshot-34.webp
- <link rel="canonical" href="{{CANONICAL_URL}}"> + og:url {{CANONICAL_URL}} + <meta name="robots" content="noindex">
  z komentarzem: PREVIEW na crm.*; publikacja przez API zdejmuje noindex.
- favicon data-URI: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFXElEQVR4nMVXX4hUVRj/feee+2fujJlrZttGlEaiD0WFBBLYQ0UEWT5MCOWfWFvZlbUWpB7HeS162UxdUaiwCJeI6KGgiCSSIPuDyID4IGS26qaQuzM79557zxfn3Fmd1Z2ZXTX6lsvcs/ee8/t93/m+33cu8D8b3fC8UolQqWTzV61ilMv6ljJrYYTSWtnyWbHozH/BuVqpJK542dfnFjwsB/FSsEgSwWfqw/v/sM8Y1FiVbx2BYtHB6Gh6W29vVxrKIYBfgtYPQEphcTTXAPoVxHurw/s/aSLCN0+glHke9G9Z47j+IXLd+1kpIE0BZhMRghBE0gEcBxyrz31Ut1x67+PLYCYQ8Y0TKGXg4fYtj5L0jxCowIlSYDggoqb5BkQDrCkXunpq6kjtjp5nUKmkGB01JFuSEB3Jbd4cAPIQkSiwUglALojENeTNvWOeca0WizC3Nj9+ZpfZNhSL7TDQ+mGp5FjvC/IVEQQrOY4TELWqgCYq5PJUXYPEG7lt23osCRPJeROACakJHr0MnXIj5HMxgtaaAj8HV7/QCUe0XMSU3MBAAcBKTlICuG0orzMGC60fzwbft3xNzDLRqJwRFMo58e0E3Abm+YmmiZapAGCJHY+tMGvK2bZCzhiZF8iITTmx7JSMWShFoBxuzOqNSlIzMJpkW155kNWsXrBx42Is7Xpw4tLpE9V9+y6EA73n4DgLoNTc84CZIUz90ymbyP1bHxOFYBlN1I5PlMsnm/VBXPWcOBzofY67whOcxkfzhe5jC/v7F4HoS3KlAZ57szFENRNr/Wlh+6vrhe/+jEQf1r53PNy+tc+CN/oGTWt3fkfvnZzSSXLdhYjjmAp5jycnP6RA7mSF81b1mG1udPA+Id+XOop/rC3peTK8+Nc5EmIxkiSGlB7SNNKJs3xqZOSscVxgl0045hTPi8A34ApEHldrCXn+Zq7XlyJNX6d8KAFOGvLbEhyOI1nrlB1sCM+feVMEvgE3GuKZX/J9n9z06cYMcSUrCbS8IZmNXsaCjQn/s+qeg7t5cvIdCkMX0hEWiGESNbWXGQMpeZ6EII04elYqnSfPLXM9SkF0tU0TmBjL7P3YmJXUBnubkFfDa+RWKS08d0U42PdN9f2Db/FUbQOAs5TLScr5kjzXIc9zKBdI8n2HtT6G6tRDWlBFu/I7K89aN/eM6W3Pqqq7u4O4EDnGA+HKp/KDfb9RiuPV4f33plG8nmM1omP1LSv1tY7Vu9DJE9XhkdUI/G5y5O8Q4m4kiamcthiyLYEmEuS6D7NEJT/42kcaem+1658dKI/G9p2hYi4fLVqTH+z7ghxnnW3VidKtwTmdhQCnbUmobEHy/U0O86b83wsnMdA7bksuxl0UyMBkEEdR1nrbeU7IhGlsrKm7EV1oe4zKFmSuR6bvExynAEGF7CSgwVGcOdCccC3cB+iivevuNkGtWFAtcFTYptPhjEC27xtQRmqbRCY89jzQ0YRpbMTimB1VKrZhZEoIID/+50/k+6s5iubW++djplQ9T3Icn6gtuecRq6zlcqMKzPm+XNYsqZ91GkFKIzrKavpNA9vMUEagTNSEoAGUy0njm4IzAo1TS234wC8cq3VMOE9BzojOtChx06U7X+avQd4RREHgQtBlHavi5O4DP9iIG0xcq+uN43du26Ye8nM7iflFMN/XJJjZDLPls8XG+mQcboy1Nv87C6KvVBS/HY98cGoao3nKTGt+YWgol+eJZZpFAZFVNDhCSBbaQwsjQKVaxHA0CSmqYSRPj+/ZM3nd2m2NmXB4/p9ZLc0AtziYUoepMz9C52vZR6vZkJtP5v/K/gVMHqGzRLVxGwAAAABJRU5ErkJggg==
  + <link rel="icon" sizes="256x256"> i apple-touch-icon:
  https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/brand/favicon-256.png
- Fonty Google (preconnect + preload + stylesheet): Space Grotesk 500;700 + Work Sans 400;600, display=swap.
- preload as=image: .../bud-assets/ugniatek/assets/hero-L.webp (min-width:1024px)
  oraz .../assets/hero-L.webp (max-width:767px) — hero mobile używa tego samego pionu 2:3.
- JSON-LD Product: name Ugniatek, brand Zaradek, image = packshot-34.webp (pełny URL),
  description krótki, offers: PLN, price 189.00, availability InStock, url {{CANONICAL_URL}}.
  ⛔ ZERO aggregateRating/review (produkt bez opinii — twardy zakaz fałszywego social-proof).

## :root — TOKENY (wklej DOSŁOWNIE, zakaz zmian wartości)
```css
:root{
  --font-display:"Space Grotesk",system-ui,sans-serif; --font-text:"Work Sans",system-ui,sans-serif;
  --paper:#EEF1F2; --paper-2:#E6EBEC; --paper-3:#DCE2E4; --card:#FBFCFC;
  --ink:#14211F; --body:#26312F; --line:#CBD5D8;
  --cta:#0B6B64; --cta-hover:#07554F; --cta-ink:#FFFFFF;
  --radius-lg:10px; --radius-sm:6px;
  --shadow-sm:0 1px 2px rgba(20,40,45,.05);
  --shadow-md:0 1px 2px rgba(20,40,45,.05),0 8px 24px rgba(20,40,45,.09);
  --shadow-lg:0 2px 4px rgba(20,40,45,.06),0 18px 40px rgba(20,40,45,.11);
  --s1:8px;--s2:16px;--s3:24px;--s4:32px;--s5:48px;--s6:64px;--s7:96px;
  --sect-pad-d:112px;--sect-pad-m:72px;--content-w:1180px;
  --h1-d:clamp(38px,7.5vw,68px);--h1-m:clamp(38px,8.5vw,50px);--h2-d:clamp(30px,3.8vw,48px);
  --body-fs:17px;--body-lh:1.55;
}
:root{ --plus:var(--line); --star:var(--cta);
  --mo-dur-s:.24s;--mo-dur-m:.38s;--mo-dur-l:.58s;--mo-ease:cubic-bezier(.22,1,.36,1);--mo-dist:16px; }
```

## BASE + SŁOWNIK KLAS GLOBALNYCH (styl serii — porcelanowa mgła, techniczny)
Jak w standardzie fabryki: *{box-sizing}, body na --paper/--body/--font-text, img max-width,
.wrap (max-width var(--content-w), padding 0 22px), .sect-pad (clamp 56px..112px),
.eyebrow (caps, tracking .2em, --font-text 800, --ink), .h2 (--font-display 700, --ink,
letter-spacing -.01em), .lead, .display (font-display).
- .btn / .btn.cta: bg --cta, tekst --cta-ink, radius var(--radius-sm), font --font-display 700,
  hover --cta-hover + lekki lift; focus-visible outline.
- .pill (trust-pill): fill --card, border 1px --line, tekst/ikony --ink, radius 999px — JEDEN styl globalnie.
- SYGNATURA serii: .callout (techniczny hairline-callout): cienka linia 1px --ink z kropką
  końcową (::before dot 4px) + mikro-etykieta --font-text 600 12px; komponent absolute w kontenerze .callout-wrap.
- Ikony: inline SVG stroke 1.5px, kolor --ink (NIGDY petrol). Grain: jedno źródło SVG
  feTurbulence opacity .03 jako body::after (pointer-events:none).
- Reveal-on-scroll helper: .reveal { opacity:0; transform:translateY(var(--mo-dist)) } .reveal.in
  { opacity:1; transform:none; transition ... } + IntersectionObserver w JS (threshold .18,
  prefers-reduced-motion → bez animacji).

## STRUKTURA BODY (sekcje PUSTE — tylko kontrakt)
Topbar sticky (logo lockup: favicon-256 img 28px + wordmark "Ugniatek" jako ŻYWY TEKST
--font-display 700; nav anchor: Dwie formy / Budowa / Sterowanie / Zestaw / FAQ; chip .pill
"Bezpieczne zakupy" z ikoną tarczy SVG).
Potem sekcje w DOKŁADNIE tej kolejności, każda jako <section id="..." class="sect-..."> z
komentarzem-markerem początku i końca (np. <!-- SEKCJA:01-hero START --> ... <!-- SEKCJA:01-hero END -->):
1. id="hero" (bez .sect-pad — pełny pierwszy ekran)
2. id="dwie-formy"
3. id="anatomia"
4. id="sterowanie"
5. id="wieczorem"
6. id="mid-cta"
7. id="zestaw"
8. id="zamow"  (tu wewnątrz marker <!--CHECKOUT-INLINE--> — moduł fabryki wejdzie w montażu)
9. id="faq"
10. id="final"
Po sekcjach: <footer> placeholder z markerem <!--FOOTER@1-->, sticky-buy mobile placeholder
z markerem <!--STICKY-BUY--> (fixed bottom, hidden do czasu montażu; korzysta z [data-price]
i [data-checkout]). Marker <!--PAYBADGES--> będzie używany WEWNĄTRZ sekcji zamow/final w montażu.

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
zero „24h"; jedyny akcent = --cta w scope {CTA, aktywne stany}; nie zmieniaj tokenów;
nie dodawaj treści sekcji (szkielet!); polskie znaki wprost w treści.

## FORMAT ODPOWIEDZI
NAJPIERW krótka siatka struktury (lista), POTEM JEDEN blok kodu ```html z KOMPLETNYM index.html.
