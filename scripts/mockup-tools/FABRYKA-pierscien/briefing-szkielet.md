# ZADANIE: SZKIELET-KONTRAKT index.html — landing „SKROLIK" (fabryka landingów sklepów)

Jesteś senior front-end koderem fabryki. Wygeneruj JEDEN kompletny plik `index.html` —
SZKIELET landingu (bez treści sekcji — sekcje puste z markerami). Polski e-commerce COD.
Vanilla HTML+CSS+JS, zero frameworków, zero CDN poza Google Fonts. Zwróć WYŁĄCZNIE kod
w jednym bloku ```html.

## HEAD (dokładnie)
- lang="pl", charset UTF-8, viewport.
- <title>Skrolik — pierścień-pilot Bluetooth do telefonu | Zaradek</title>
  ⛔ ZAKAZ CENY w title/description/OG (cena zmienna — prowadzi ją silnik).
- meta description: "Skrolik to mały pierścień-pilot Bluetooth: pionowe przewijanie,
  kartkowanie ebooków i zdalna migawka. Zakładasz na palec i klikasz kciukiem — telefon
  stoi tam, gdzie go oparłeś. Płatność przy odbiorze · 14 dni na zwrot."
- theme-color #F8F1F0. OG: type website, title/description jak wyżej (bez ceny), og:image =
  https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/skrolik/assets/og-1200x630.jpg
- <link rel="canonical" href="{{{{CANONICAL_URL}}}}"> + og:url {{{{CANONICAL_URL}}}} + <meta name="robots" content="noindex">
  z komentarzem: PREVIEW na crm.*; publikacja przez API zdejmuje noindex.
- favicon data-URI: data:image/png;base64,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
  + <link rel="icon" sizes="256x256"> i apple-touch-icon: https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/skrolik/brand/favicon-256.png
- Fonty Google (preconnect + preload + stylesheet): Gabarito 500;700 + Mulish 400;600;700, display=swap.
- preload as=image: https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/skrolik/sceny/sc-hero.webp
- JSON-LD Product: name "Skrolik — pierścień do przewijania", brand Zaradek, image =
  https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/skrolik/galeria/keep2-packshot-pink.webp, description krótki (bez ceny).
  ⛔ BEZ pola offers (cena zmienna — silnik cen; LL-048). ⛔ ZERO aggregateRating/review.

## :root — TOKENY (wklej DOSŁOWNIE, zakaz zmian wartości)
```css
:root{{
  --font-display:"Gabarito",system-ui,sans-serif; --font-text:"Mulish",system-ui,sans-serif;
  --paper:#F8F1F0; --paper-2:#F3E8E7; --paper-3:#ECDCDB; --card:#FFFDFC;
  --ink:#2B2025; --body:#6E5F63; --line:#E6D8D9;
  --cta:#B4265C; --cta-hover:#971D49; --cta-ink:#FFFFFF;
  --radius-lg:18px; --radius-sm:12px;
  --shadow-sm:0 1px 2px rgba(72,38,52,.06);
  --shadow-md:0 1px 2px rgba(72,38,52,.06),0 10px 26px rgba(72,38,52,.10);
  --shadow-lg:0 2px 4px rgba(72,38,52,.07),0 18px 40px rgba(72,38,52,.12);
  --s1:8px;--s2:16px;--s3:24px;--s4:32px;--s5:48px;--s6:64px;--s7:96px;
  --sect-pad-d:112px;--sect-pad-m:72px;--content-w:1180px;
  --h1-d:clamp(26px,2.6vw,34px);--h1-m:clamp(22px,6vw,26px);--h2-d:clamp(24px,2.4vw,30px);
  --h2-m:clamp(20px,5.5vw,24px);--price-fs:clamp(28px,3vw,36px);
  --body-fs:17px;--body-lh:1.55;
  --mo-dur-s:.24s;--mo-dur-m:.38s;--mo-dur-l:.58s;--mo-ease:cubic-bezier(.22,1,.36,1);--mo-dist:16px;
}}
```
UWAGA SKALA: to skala TYPOGRAFII ŻYWEJ (H1 desktop max 34px!) — makiety rysują większe
nagłówki na planszy, kod trzyma TĘ skalę.

## BASE + SŁOWNIK KLAS GLOBALNYCH (styl serii — pudrowy róż, miękki, pill)
*{{box-sizing}}, body na --paper/--body/--font-text, img{{max-width:100%;height:auto}}
(height:auto OBOWIĄZKOWO — atrybuty width/height tylko jako hint), .wrap (max-width
var(--content-w), padding 0 22px), .sect-pad (clamp 56px..112px), .eyebrow (caps, tracking
.2em, --font-text 700 12px, --cta), .h2 (--font-display 700, --ink, letter-spacing -.01em,
font-size var(--h2-d)), .lead, .display (font-display).
- .btn / .btn.cta: bg --cta, tekst --cta-ink, radius 999px (PILL — język okrągłości
  produktu), font --font-display 700, hover --cta-hover + lekki lift; focus-visible outline.
- .pill (trust-pill): fill --card, border 1px --line, tekst/ikony --ink, radius 999px — JEDEN styl globalnie.
- SYGNATURA serii: .sig (pierścienie sygnału) = inline SVG <svg class="sig"> z DWOMA-TRZEMA
  koncentrycznymi NIEPEŁNYMI łukami (przerwane okręgi o rosnących promieniach od wspólnego
  środka), stroke var(--cta) 1.5px, fill none, opacity .5. Komponent OSADZANY w miejscu
  użycia (position wg kontekstu w sekcji, NIE w klasie bazowej — klasa bazowa ustawia TYLKO
  stroke/fill/display:block; ⛔ zakaz position/width/height w .sig). ⛔ Bez strzałek z grotem,
  bez calloutów technicznych, bez wielkich liczb.
- Ikony: inline SVG stroke 1.5px, kolor --ink (NIGDY malina). ⛔ Bez grain.
- Reveal-on-scroll helper: .reveal {{ opacity:0; transform:translateY(var(--mo-dist)) }}
  .reveal.in {{ opacity:1; transform:none; transition ... }} + IntersectionObserver w JS
  (threshold .18, prefers-reduced-motion → bez animacji). ⛔ NIGDY nie centruj elementów
  transformem (kolizja z .reveal.in{{transform:none}}) — centrowanie przez margin-inline:auto.

## STRUKTURA BODY (sekcje PUSTE — tylko kontrakt)
Topbar sticky .topbar (logo lockup: favicon-256 img 28px + wordmark "Skrolik" jako ŻYWY
TEKST --font-display 700, min-height 44px; nav anchor DOKŁADNIE: "Jak działa" → #demo,
"Zastosowania" → #ekran-zostaje, "FAQ" → #faq; chip .pill "Płatność przy odbiorze" z ikoną
SVG — chip UKRYTY na mobile <768px, topbar wtedy kompaktowy).
Potem sekcje w DOKŁADNIE tej kolejności, każda jako <section id="..."> z komentarzem-markerem
początku i końca (np. <!-- SEKCJA:01-hero START --> ... <!-- SEKCJA:01-hero END -->):
1. id="hero" class="hr-hero" (bez .sect-pad — archetyp B split 55/45: copy | scena)
2. id="demo"          (TOR-I: symulacja klik ▼ → feed; mechanika wejdzie w F5, tu tylko sekcja)
3. id="ekran-zostaje"
4. id="ebooki"
5. id="selfie"
6. id="kolory"
7. id="wideo"         (wewnątrz marker <!--WIDEO-RAIL--> — moduł fabryki w montażu)
8. id="mid-cta"
9. id="zamow"         (wewnątrz marker <!--CHECKOUT-INLINE--> — moduł fabryki w montażu)
10. id="faq"          (wewnątrz marker <!--FAQ-ACCORDION-->)
11. id="final"
Po sekcjach: <footer> placeholder z markerem <!--FOOTER@1-->, placeholder sticky-buy z JEDYNIE
komentarzem <!--STICKY-BUY--> (⛔ ZERO szczątkowych reguł CSS dla .sticky-buy/.zc-checkout —
martwe bloki szkieletu biją moduły; lekcja LL-032). Marker <!--PAYBADGES--> będzie używany
WEWNĄTRZ sekcji zamow/final w montażu.
PRZED </body>: wstaw TYLKO komentarz <!--RUNTIME-SNIPPET--> (snippet wklei montaż) oraz
skrypt IntersectionObserver dla .reveal.

## KONTRAKTY TWARDE
- KAŻDE CTA w sekcjach = <a class="btn cta" data-checkout href="#zamow">…</a> (⛔ nigdy link
  do kasy platformy).
- Cena pojawia się WYŁĄCZNIE jako <span data-price>34,90 zł</span> (zapieczona = fallback,
  runtime hydratuje) — w szkielecie zero wystąpień ceny poza tym wzorcem.
- Polskie znaki wszędzie poprawne. Zero lorem ipsum — sekcje puste (tylko markery).
