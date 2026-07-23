
# SEKCJA 04-regulacja (dowód liczbowy 5/2; przełącznik Łagodniej/Trudniej; count-up)
Prefiks `.rg-`. <section id="regulacja" class="rg-reg sect-pad">. Eyebrow „REGULUJESZ TRUDNOŚĆ"
+ <span class="reps" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>.
H2: „Nie musisz zaczynać od <span class="swash">najtrudniejszego</span> ustawienia."
DESKTOP grid ~ 5/7. LEWA (plakat typograficzny): DWIE gigantyczne liczby obok siebie oddzielone
pionową kreską 1px --line: „5" .display 800 (clamp(72px,9vw,128px), --ink, data-countup) podpis
„wysokości"; „2" analogicznie podpis „kąty nachylenia". Pod nimi body .lead: „Wyższe ustawienie
oznacza większą trudność, więc możesz dobrać poziom od początkującego do zaawansowanego."; niżej
mikrocopy 14px --body: „Poziom dobieraj do własnych możliwości i poprawnej techniki ruchu."
Pod tym RZĄD: przełącznik-pigułka .rg-toggle (2 segmenty <button role="tab">: „Łagodniej" /
„Trudniej"; aktywny = fill --ink + tekst biały, nieaktywny = tekst --ink na --card; obwódka 1px
--line; NIGDY --cta) + CTA <a class="btn cta" data-checkout href="#zamow">Wybieram swój poziom</a>.
PRAWA foto-karta (--card padding 12px radius-lg shadow-md) LUB pole --paper-2: <img>
src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/brzuszek/assets/sc-reg-side.webp" width="1600" height="1100" loading="lazy" alt="Boczny profil
biało-różowej maszyny z widoczną szyną i regulacją"; object-fit cover, radius-sm.
Scoped <script> IIFE: (1) count-up „5" i „2" przy pierwszym wejściu w viewport (IntersectionObserver;
prefers-reduced-motion → wartości statyczne 5/2); (2) toggle Łagodniej/Trudniej przełącza aktywny
segment (aria-selected) i aktualizuje mały helper-text pod przełącznikiem („Niższe ustawienie —
łatwiejszy ruch." / „Wyższe ustawienie — większa trudność."). BEZ dodawania skali liczbowej spoza
danych. MOBILE: liczby najpierw (H2 → 5 / 2 → body → mikrocopy → toggle → CTA → foto-karta).

ID sekcji: <section id="regulacja">.

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
