
# SEKCJA 01-hero (archetyp C — karta mikro-oferty nachodzi na scenę lifestyle)
Prefiks `.hr-`. Sekcja: <section id="hero" class="hr-hero hero sect-pad"> (klasa .hero WYMAGANA
— IO sticky-buy). Topbar z wordmarkiem „Brzuszek" już istnieje w szkielecie — NIE dubluj logo.
UKŁAD wg makiety: scena lifestyle wypełnia prawą/górną część, KARTA mikro-oferty (--card,
radius-lg, shadow-lg, szer. 520–600px) NACHODZI na dolno-lewą krawędź sceny (margin ujemny
~ -64px desktop). Na mobile: scena u góry, karta pod nią nachodząca ~ -40px, cena+CTA w foldzie.
SCENA — <picture>:
  <source media="(max-width:600px)" srcset="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/brzuszek/assets/sc-hero-mobile.webp">
  <source media="(max-width:900px)" srcset="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/brzuszek/assets/sc-hero-800.webp">
  <img src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/brzuszek/assets/sc-hero.webp" width="1536" height="1024" loading="eager"
   fetchpriority="high" alt="Kobieta ćwiczy brzuch na biało-różowej składanej maszynie w jasnym
   salonie">. object-fit cover, radius-lg.
KARTA (kolejność): eyebrow „TWOJA DOMOWA SERIA" + <span class="reps" aria-hidden="true"><i></i>
<i></i><i></i><i></i><i></i></span>; H1 .display (var(--h1-d), font-stretch 125%, 800,
line-height 1.02): „Brzuch i <span class="swash">core</span>. U siebie."; sub .lead: „Składana
maszyna z ruchomym wózkiem, 5 wysokościami, 2 kątami nachylenia i licznikiem LCD."; cena
<span class="display hr-price" data-price>429,00 zł</span> (var(--price-fs), 800); CTA
<a class="btn cta" data-checkout href="#zamow">Zamawiam Brzuszek</a>; micro 13.5px --body:
„Płatność przy odbiorze, BLIK lub online · 14 dni na zwrot"; marker <!--PAYBADGES--> (bez
wrappera, pod micro).
POD KARTĄ (lub w dolnym pasku karty) 3 trust-pille .pill w rzędzie [ikona SVG stroke 1.75px ink
| tekst]: (ikona składania/zawiasu) „Składana konstrukcja" / (ikona kąta/A-frame) „2 kąty · 5
wysokości" / (ikona wagi/nośności) „Udźwig ≈ 200 kg". Na mobile pille zawijają się (flex-wrap).
Ikony wyłącznie liniowe w --ink, mechaniczne (nie fitness generyczny).

ID sekcji: <section id="hero">.

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
