
# SEKCJA 11-final (FAQ accordion JEDNOKOLUMNOWY + panel końcowy; domknięcie)
Prefiks `.fn-`. <section id="final" class="fn-final sect-pad">. Eyebrow „FAQ"; H2: „Pytania przed
<span class="swash">zamówieniem</span>."
AKORDEON JEDNOKOLUMNOWY (max ~980px, zaakceptowane odstępstwo — NIE 2 kolumny), 9 pozycji, KAŻDA:
<details class="fn-item"><summary>PYTANIE<span class="fn-x" aria-hidden="true"></span></summary>
<div class="fn-a">ODPOWIEDŹ</div></details> — ikona +/− rysowana CSS (dwie kreski 1.75px --ink,
obrót przy [open]; NIGDY --cta), karta --card border 1px --line radius-lg, płynne rozwijanie.
PIERWSZA pozycja OTWARTA (atrybut open). PYTANIA+ODPOWIEDZI (VERBATIM):
1. „Jaki kolor otrzymam?" → „Sprzedajemy wyłącznie wariant biało-różowy; w checkoutcie nie ma
   wyboru koloru."
2. „Jak reguluje się trudność?" → „Masz 2 kąty nachylenia i 5 wysokości; wyższe ustawienie
   oznacza większą trudność."
3. „Jaki jest udźwig?" → „Deklarowany udźwig to 440 lbs, czyli około 200 kg."
4. „Czy można ją złożyć?" → „Tak, konstrukcja jest składana i korzysta z zawleczki
   zabezpieczającej."
5. „Czy montaż jest trudny?" → „Produkt jest opisany jako łatwy w montażu i jest dostarczany
   z instrukcją."
6. „Co pokazuje LCD?" → „Licznik pokazuje powtórzenia, czas i kalorie; wskazanie kalorii jest
   funkcją licznika, nie obietnicą spalania ani efektu sylwetkowego."
7. „Jak chronione są kolana?" → „Kolana opierają się na pogrubionym, U-kształtnym wałku
   piankowym zaprojektowanym z myślą o komforcie podparcia."
8. „Jak mogę zapłacić?" → „Przy odbiorze, BLIK-iem lub online."
9. „Ile mam czasu na zwrot?" → „14 dni."
POD akordeonem PANEL KOŃCOWY na pasie --paper-2 (radius-lg, padding, desktop 1 rząd / mobile
stack): <span class="reps" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span> +
tekst .display 700 „Ustaw poziom. Zrób swoją serię. Złóż." + grupa liczb typograficznych
„5 · 2 · ≈200 kg" (.display 800; podpisy mini 12px --body: wysokości / kąty / udźwig) + cena
<span class="display" data-price>429,00 zł</span> (var(--price-fs)) + CTA
<a class="btn cta" data-checkout href="#zamow">Przejdź do zamówienia</a>. Accordion dostępny
klawiaturą; bez dekoracyjnej fotografii.

ID sekcji: <section id="final">.

## KONTRAKT/ZAKAZY (wspólne serii Brzuszek)
- Sekcja wklejana w szkielet: istnieją tokeny :root (--paper #F7F5FB / --paper-2 #F0ECF7 /
  --card #FFFFFF / --ink #241E2E / --body #38323F / --line #DCD5E8 / --cta #A21CAF /
  --cta-hover #86158F / --cta-ink #FFFFFF / --seg #C9C2D6 / --radius-lg 24px / --radius-sm 12px /
  --shadow-sm/-md/-lg / --s1..--s7 / --content-w 1180 / --h1-d clamp(56,6vw,80) / --h1-m /
  --h2-d clamp(30,3.9vw,48) / --h2-m / --price-fs clamp(32,3.8vw,48) / --body-fs 17 /
  --font-display "Archivo" (font-stretch:125%) / --font-text "Figtree") i klasy GLOBALNE
  .wrap .sect-pad .display .eyebrow .reps .h2 .lead .swash .btn.cta .pill .band .reveal.
  UŻYWAJ ich; style sekcyjne w scoped <style> z prefiksem sekcji.
- SKALA TYPOGRAFII ŻYWEJ (twarda): H2 = var(--h2-d) desktop / var(--h2-m) mobile,
  ceny var(--price-fs), body 17px. ⛔ ZERO clampów sekcyjnych powyżej tej skali.
- Kolory WYŁĄCZNIE tokenami; zero nowych hexów (poza rgba() cieni serii). Tła jasne (lila-mgła);
  ⛔ ciemne tła, ⛔ neon, ⛔ ciepły pudrowy róż jako tło.
- AKCENT #A21CAF DOKŁADNIE JEDEN, scope: {przyciski .btn.cta · swash · ostatni segment paska
  powtórzeń}. NIC WIĘCEJ nie jest fioletowe. Ikony funkcjonalne = inline SVG stroke 1.75px
  w kolorze var(--ink). LINKI TEKSTOWE drugorzędne = var(--ink) z podkreśleniem (text-underline-
  offset:4px), NIGDY --cta (poprawka krytyka F2 — dotyczy zwł. sekcji jak-cwiczysz).
- IKONY POD MECHANIZM PRODUKTU: poprzeczka podłogowa, opór linkowy/gumowy, wózek na szynie,
  U-kształtny wałek, licznik LCD. ⛔ ZAKAZ ikon: hantel, biceps, generyczny fitness/siłownia.
- SYGNATURA „pasek powtórzeń": po .eyebrow (w sekcjach z sygnaturą) wstaw
  <span class="reps" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span> (klasa
  globalna — 5 segmentów, ostatni w --cta). SWASH: <span class="swash">słowo</span> w H1/H2 —
  ZAWSZE DOKŁADNIE JEDNO słowo (prosta kreska 3px z klasy globalnej), maks. jeden swash/sekcję.
- Zero gwiazdek/liczb opinii, zero „sprzedano N"/liczby ocen/odtworzeń, zero przekreśleń cen,
  zero „darmowa dostawa", zero fałszywej pilności/timerów, zero „MERACH"/„Shop1103659154",
  zero obietnic zdrowotnych/odchudzania/spalania, zero body-shamingu, zero czasów treningu
  („10 minut" = ZAKAZ), zero liczb kalorii (LCD „kalorie" tylko jako funkcja licznika),
  zero zmyślonych wymiarów/wagi maszyny. Jeden wariant: biało-różowy; czarno-niebieski NIGDZIE.
  Jedyne liczby dozwolone: 5 (wysokości) · 2 (kąty) · ≈200 kg / 440 lbs (udźwig) · 429,00 zł
  · 14 dni · 3 (zestawy kółek).
- Obrazy: <img> z width/height (i CSS height:auto), loading="lazy" (poza hero=eager), alt PL
  opisowy (bez „MERACH"), radius var(--radius-lg). Dodawaj .reveal do głównych bloków.
- ⛔ NIE centruj transformem (kolizja z .reveal.in{transform:none}) — używaj margin/justify/grid.
- NAJPIERW wypisz krótką siatkę sekcji, POTEM kod.

## FORMAT ODPOWIEDZI
Krótka siatka, potem JEDEN blok ```html: WYŁĄCZNIE <section id="ID"> + scoped <style> (+ scoped
<script> IIFE tylko jeśli brief każe). Bez markdown poza tym blokiem.
