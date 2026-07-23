
# SEKCJA 07-mid-cta (konwersyjna; packshot na polu koloru)
Prefiks `.mc-`. Na pasie .band. SZEROKA karta --card (radius-lg, shadow-lg, overflow hidden,
position relative): GHOST typografia "4,2 L" (.display 700, ~180px, kolor --paper-2, position
absolute za treścią, prawy górny obszar, aria-hidden, z-index 0).
DESKTOP: LEWA kolumna (z-index 1): eyebrow "PLAN NA ZAMROŻONE PORCJE" + thaw; H2: "Daj
rozmrażaniu własne <span class="swash">miejsce</span>."; sub .lead: "Elektryczny box z komorą
4,2 L, dotykowym startem i tacką ociekową."; rząd: cena <span class="display" data-price>
289,00 zł</span> (var(--price-fs) 700) + CTA <a class="btn cta" data-checkout href="#zamow">
Zamawiam Rozmrozik</a>; micro 13.5px: "Płatność przy odbiorze lub BLIK/online · 14 dni na
zwrot". PRAWA: packshot <img> https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/packshot-alpha.png (806x538, lazy, alt "Rozmrozik —
elektryczny box do rozmrażania, wariant czarny") na tle --paper-2 (koło/pole radius-lg).
MOBILE: stack — eyebrow+thaw → H2 → packshot (max 260px) → cena → CTA full → micro.

ID sekcji: <section id="mid-cta">.

## KONTRAKT/ZAKAZY (wspólne serii)
- Sekcja wklejana w szkielet: istnieją tokeny :root (--paper/--paper-2/--card/--ink/--body/
  --line/--cta/--cta-hover/--cta-ink/--cold/--radius-lg/--radius-sm/--shadow-sm/-md/-lg/
  --s1..--s7/--content-w/--h1-d/--h1-m/--h2-d/--h2-m/--price-fs/--body-fs) i klasy globalne
  .wrap .sect-pad .eyebrow .thaw .h2 .lead .display .btn.cta .pill .band .reveal .swash.
  UŻYWAJ ich; style sekcyjne w scoped <style> z prefiksem sekcji.
- SKALA TYPOGRAFII ŻYWEJ (twarda): H2 = var(--h2-d) desktop / var(--h2-m) mobile,
  ceny var(--price-fs), body 17px. ⛔ ZERO clampów sekcyjnych powyżej tej skali.
- Kolory WYŁĄCZNIE tokenami; zero nowych hexów (poza rgba() cieni serii).
  Akcent mandarynka TYLKO: CTA / swash / ciepły koniec paska odwilży. Ikony: inline SVG
  stroke 1.75px w kolorze var(--ink). Linki tekstowe: var(--ink) z podkreśleniem, NIGDY --cta.
- SYGNATURA „pasek odwilży": po KAŻDYM .eyebrow wstaw <span class="thaw"></span> (klasa
  globalna — 2px gradient zimny→mandarynka). SWASH: <span class="swash">słowo</span> w H1/H2
  — ZAWSZE DOKŁADNIE JEDNO słowo, maks. jeden swash na sekcję.
- Zero gwiazdek/liczb opinii, zero przekreśleń cen, zero „24h"/„darmowa dostawa", zero
  ciemnych teł, ⛔ zero CZASÓW rozmrażania i mocy (W), zero wymiarów cm/kg, zero „food-grade",
  zero „KAYUSO", zero obietnic medycznych (plazma/UVC zawsze „według producenta").
  Jedyne liczby dozwolone: 4,2 L · 4 steki / 4 porcje ryby · 289,00 zł · 14 dni · USB-C
  · materiały (stop aluminium/PS/ABS/NTC).
- Obrazy: <img> z width/height (i CSS height:auto), loading="lazy" (poza hero), alt PL
  opisowy, radius var(--radius-lg). Dodawaj .reveal do głównych bloków.
- ⛔ NIE centruj transformem (kolizja z .reveal.in{transform:none}) — left/right/margin-inline.
- NAJPIERW wypisz siatkę sekcji, POTEM kod.

## FORMAT ODPOWIEDZI
Krótka siatka, potem JEDEN blok ```html: WYŁĄCZNIE <section id="ID"> + scoped <style> (+ scoped
<script> IIFE tylko jeśli brief każe).
