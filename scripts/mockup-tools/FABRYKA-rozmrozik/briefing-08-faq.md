
# SEKCJA 08-faq (accordion; mechanika details/summary)
Prefiks `.fq-`. Eyebrow "BEZ DROBNEGO DRUKU" + thaw; H2: "Pytania przed
<span class="swash">zamówieniem</span>."
Akordeon max 860px: 9 pozycji, KAŻDA: <details class="fq-item"><summary>PYTANIE<span
class="fq-x" aria-hidden="true"></span></summary><div class="fq-a">ODPOWIEDŹ</div></details>
— ikona +/− rysowana CSS-em (dwie kreski 1.75px --ink, obrót przy open; NIGDY --cta), karta
--card border 1px --line radius-lg, płynne rozwijanie. PIERWSZA pozycja OTWARTA (atrybut open).
PYTANIA+ODPOWIEDZI (VERBATIM, fakty tylko stąd):
1. "Jak szybko rozmraża?" → "Nie podajemy czasu rozmrażania, ponieważ dostępne materiały nie
zawierają danych, które pozwalają uczciwie go zadeklarować."
2. "Czy to nie kolejny gadżet?" → "To urządzenie o jednym konkretnym zadaniu: rozmrażaniu
żywności; składa się z płaskiej tacy-bazy, kopuły i zdejmowanego modułu na szczycie."
3. "Ile mieści?" → "Komora ma 4,2 L i mieści jednocześnie 4 steki lub 4 porcje ryby."
4. "Co dzieje się z wodą?" → "Wodę zbiera tacka ociekowa wykonana z ABS."
5. "Co oznaczają plazma i UVC?" → "Producent opisuje funkcje jako „Plasma Locking" oraz „UVC
Antibacterial"; nie komunikujemy sterylizacji, skuteczności procentowej ani działania
medycznego."
6. "Jak uruchamia się urządzenie?" → "Jednym dotknięciem panelu LED."
7. "Jaki kolor otrzymam?" → "Sprzedajemy wariant czarny — dokładnie ten, który widzisz na
zdjęciach."
8. "Jak mogę zapłacić?" → "Przy odbiorze albo przez BLIK/online."
9. "Czy mogę zwrócić produkt?" → "Na zwrot masz 14 dni."
POD akordeonem kompaktowy blok oferty (wyśrodkowany): cena <span class="display" data-price>
289,00 zł</span> (var(--price-fs)) → CTA <a class="btn cta" data-checkout href="#zamow">
Przejdź do zamówienia</a> → linia 13.5px "14 dni na zwrot".
MOBILE: 1 kolumna, to samo.

ID sekcji: <section id="faq">.

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
