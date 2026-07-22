# ZADANIE: SEKCJA 01-hero landingu „Ugniatek" — wierne kodowanie z makiety

Jesteś senior front-end koderem fabryki. Wygeneruj KOMPLETNĄ sekcję `<section id="hero">`
+ scoped `<style>` (wszystkie klasy sekcji z prefiksem `.hr-`). Sekcja zostanie wklejona
w istniejący szkielet (są już: tokeny :root, .wrap, .sect-pad, .eyebrow, .h2, .btn.cta,
.pill, .callout, .reveal, topbar sticky NAD sekcją — NIE koduj topbara ponownie!).

Obraz 1 = ANOTOWANA makieta DESKTOP (ponumerowane bboxy). Obraz 2 = ANOTOWANA makieta MOBILE.
Odtwórz layout WIERNIE (makieta jest święta) — struktura i proporcje z obrazów, liczby z IR.

## LAYOUT DESKTOP (z makiety)
Archetyp F — DYPTYK: dwa PIONOWE kadry foto obok siebie (po ~50% szerokości, gap 4px,
radius var(--radius-lg)), wysokość ~85vh (min 560px, max 860px), object-fit:cover.
Karta oferty (near-white var(--card), radius-lg, var(--shadow-lg)) NACHODZI centralnie na DÓŁ
obu kadrów (position absolute/negative margin; szerokość ~560px max), wyśrodkowana.
Callout „2 uchwyty" (komponent .callout) na LEWYM kadrze, wskazuje uchwyt produktu
(prawy-górny obszar lewego kadru).

## LAYOUT MOBILE (z makiety mobile — FOLD RULE!)
Stack: JEDEN kadr hero (hero-L, ~16:10 crop przez aspect-ratio) → karta oferty bezpośrednio
pod nim (lekko nachodzi, negative margin -40px) tak, by H1+cena+CTA były w 1. viewportcie →
DRUGI kadr (hero-P) PONIŻEJ karty. Breakpoint 768px.

## COPY (VERBATIM — dokładnie te stringi)
- H1 (var(--font-display) 700, --h1-d/--h1-m, kolor --ink): "Dociskaj oburącz. Albo oprzyj się plecami."
  (łamanie: po kropce pierwszego zdania)
- sub (--font-text, .lead): "Płaski, bezprzewodowy masażer z 6 głowicami — na kark, barki, uda i łydki albo pod plecy."
- cena: <div class="hr-price"><span data-price>189,00 zł</span></div> (--font-display 700, ~44px desktop)
- CTA: <a class="btn cta" data-checkout href="#zamow">Zamawiam Ugniatka</a> (pełna szerokość karty)
- micro pod CTA (13.5px, --body): "Płatność online lub przy odbiorze · 14 dni na zwrot"
- 3 pille (.pill, ikony inline SVG stroke 1.5 --ink): "Za pobraniem" (ikona paczka),
  "Zwrot 14 dni" (ikona strzałka-powrót arrow-counter-clockwise — NIE dymek!), "Bezprzewodowy" (ikona bateria)
- callout: "2 uchwyty"

## ASSETY (realne URL-e)
- kadr L: https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/hero-L.webp (pion 2:3; docisk do karku)
- kadr P: https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/hero-P.webp (pion 2:3; oparcie lędźwi)
Oba <img> z width/height 1024x1536, loading="eager", fetchpriority="high" (L), alt PL opisowe.

## IR — DANE TWARDE (desktop @1180; ZAKAZ re-aproksymacji)
SKALA TYPO (scale_px_norm): H1≈55px → używaj var(--h1-d); H2≈41px; body≈17-18px; caption≈12px.
BLOKI (0-1000, orientacyjnie — layout z obrazów):
  #1: x=0 y=13 w=132 h=62 (0-1000)
  #2: x=0 y=0 w=214 h=13 (0-1000)
  #3: x=16 y=19 w=971 h=47 (0-1000)
  #4: x=214 y=0 w=535 h=51 (0-1000)
  #5: x=749 y=0 w=251 h=74 (0-1000)
  #6: x=0 y=74 w=1000 h=800 (0-1000)
  #7: x=305 y=559 w=345 h=384 (0-1000)
  #8: x=0 y=874 w=146 h=126 (0-1000)
  #9: x=288 y=874 w=370 h=75 (0-1000)
  #10: x=827 y=874 w=173 h=126 (0-1000)
  #11: x=146 y=949 w=681 h=51 (0-1000)
MOBILE scale_px_norm: {"H1": 34, "H2": 20, "body": 10, "caption": 4}

## KONTRAKT/ZAKAZY
- Kolory/fonty WYŁĄCZNIE tokenami (--paper/--card/--ink/--body/--line/--cta...); ZERO nowych hexów
  poza rgba() cieni zgodnych z serią. Akcent petrol TYLKO na .btn.cta.
- Ikony w pillach: inline SVG stroke 1.5px, kolor currentColor (--ink). NIGDY petrol.
- data-price i data-checkout DOKŁADNIE jak w copy (runtime je hydratuje).
- Sekcja ma działać z .reveal (dodaj klasy reveal do karty i calloutu).
- Zero gwiazdek/opinii, zero przekreśleń, zero „24h".
- NAJPIERW wypisz siatkę sekcji (wiersze/kolumny/wyrównania), POTEM kod.

## FORMAT ODPOWIEDZI
Krótka siatka, potem JEDEN blok ```html zawierający WYŁĄCZNIE: <section id="hero">…</section>
+ <style> scoped. Bez <html>/<head>/<body>, bez topbara, bez runtime.
