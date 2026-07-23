
# SEKCJA 09-zamow (SKÓRKA checkoutu — mechanika = moduł fabryki w montażu!)
Prefiks `.zm-`. Eyebrow "ZAMÓWIENIE" + thaw; H2: "Rozmrozik".
DESKTOP: DWIE karty (grid 5/7):
LEWA karta produktu (--card, radius-lg, shadow-sm; sticky top 84px): packshot <img>
https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/packshot-alpha.png (lazy, alt "Rozmrozik — wariant czarny", max 320px, na polu
--paper-2 radius-sm), nazwa "Rozmrozik" .display 700 24px, linia body 15px: "Elektryczny box
do rozmrażania żywności z komorą 4,2 L, kopułą PS, aluminiową płytą i tacką ociekową ABS.",
wiersz "Kolor: czarny" (label 13px --body + wartość 15px 600 --ink; BEZ selektora), cena
<span class="display" data-price>289,00 zł</span> (var(--price-fs) 700), pod nią linia 13px
"Koszt dostawy i pełną kwotę zobaczysz w podsumowaniu przed złożeniem zamówienia."
PRAWA karta checkout (--card, radius-lg, shadow-lg): wewnątrz WYŁĄCZNIE marker:
<!--CHECKOUT-INLINE-->
(nic więcej — moduł fabryki wchodzi w montażu; NIE koduj pól formularza ani radiów!).
W scoped <style> przygotuj SKIN dla modułu wg makiety (selektory na przyszłej zawartości
#zamow .zc-checkout): inputy = tło --card, border 1px --line, radius-sm, focus border --cta;
radio-karty płatności = border 1px --line radius-sm, wybrana = border --cta + kropka --cta;
przycisk submit = jak .btn.cta full-width (radius-lg); drobny tekst 13px --body.
Pod kartami marker <!--PAYBADGES--> (bez wrappera). Na dole pas 3 itemów [ikona|tekst]:
"COD — płatność przy odbiorze" / "BLIK/online" / "14 dni na zwrot".
MOBILE: stack — karta produktu KOMPAKT (thumb 96px + nazwa + "Kolor: czarny" + cena w jednym
wierszu) → karta checkout → PAYBADGES → pas.

ID sekcji: <section id="zamow">.

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
