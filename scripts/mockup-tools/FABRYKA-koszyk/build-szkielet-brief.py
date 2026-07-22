# -*- coding: utf-8 -*-
"""Buduje briefing-szkielet.md ODSACZKA: nowe bloki (HEAD/:root/slownik/struktura/zakazy)
+ RUNTIME VERBATIM z briefu ugniatka (sekcja '## RUNTIME' .. '## ZAKAZY')."""
import base64, io, os, sys

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
UG = io.open(r'c:\repos_tn\tn-crm\scripts\mockup-tools\FABRYKA-ugniatek\briefing-szkielet.md',
             encoding='utf-8').read()
i0 = UG.index('## RUNTIME')
i1 = UG.index('## ZAKAZY TWARDE')
RUNTIME = UG[i0:i1].rstrip()
i2 = UG.index('## FORMAT ODPOWIEDZI')
FORMAT = UG[i2:]

fav = base64.b64encode(open(os.path.join(HERE, 'brand', 'favicon-32.png'), 'rb').read()).decode()
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
A = PUB + 'bud-assets/odsaczek/assets/'
BR = PUB + 'bud-assets/odsaczek/brand/'

BRIEF = '''# ZADANIE: SZKIELET-KONTRAKT index.html — landing „Odsączek" (fabryka landingów sklepów)

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
  ''' + A + '''og-1200x630.jpg
- <link rel="canonical" href="{{CANONICAL_URL}}"> + og:url {{CANONICAL_URL}} + <meta name="robots" content="noindex">
  z komentarzem: PREVIEW na crm.*; publikacja przez API zdejmuje noindex.
- favicon data-URI: data:image/png;base64,''' + fav + '''
  + <link rel="icon" sizes="256x256"> i apple-touch-icon: ''' + BR + '''favicon-256.png
- Fonty Google (preconnect + preload + stylesheet): Bricolage Grotesque 500;700 + Figtree 400;600, display=swap.
- preload as=image: ''' + A + '''sc-hero.webp
- JSON-LD Product: name Odsączek, brand Zaradek, image = packshot-rozlozony.webp (pełny URL
  ''' + A + '''packshot-rozlozony.webp), description krótki,
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

''' + RUNTIME + '''

## ZAKAZY TWARDE
Zero gwiazdek/liczb opinii; zero ciemnych teł sekcji; zero fikcyjnych promocji/przekreśleń;
zero „24h"; zero wymiarów w cm i pojemności; zero „zmywarki"; jedyny akcent = --cta w scope
{CTA, aktywne stany, strzałki .arc}; nie zmieniaj tokenów; nie dodawaj treści sekcji
(szkielet!); polskie znaki wprost w treści.

''' + FORMAT
io.open(os.path.join(HERE, 'briefing-szkielet.md'), 'w', encoding='utf-8').write(BRIEF)
print('OK briefing-szkielet.md (%d B, runtime %d B)' % (len(BRIEF), len(RUNTIME)))
