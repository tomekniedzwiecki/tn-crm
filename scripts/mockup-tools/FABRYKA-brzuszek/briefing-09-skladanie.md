
# SEKCJA 09-skladanie (dyptyk rozłożona/złożona; prawy kadr = REALNE UGC)
Prefiks `.sk-`. <section id="skladanie" class="sk-sklad sect-pad">. Eyebrow „PO TRENINGU"
+ <span class="reps" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>.
H2: „Po serii składasz sprzęt, nie <span class="swash">plan</span>."; body .lead: „Maszyna ma
składaną konstrukcję z zawleczką zabezpieczającą, dzięki czemu po treningu możesz ją złożyć
i odłożyć."
DYPTYK (desktop 2 kolumny gap 16px; mobile stack): każdy kadr = figure --card padding 8–12px
radius-lg shadow-md, aspect-ratio 4/5, object-fit cover, z chipem-etykietą (biała pigułka,
caps 11px --ink, górny-lewy róg):
  LEWA figure: <img> src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/brzuszek/assets/sc-sklad-rozloz.webp" width="1200" height="1500"
    loading="lazy" alt="Kobieta klęka przy rozłożonej biało-różowej maszynie i sięga do
    mechanizmu"; chip „ROZŁOŻONA".
  PRAWA figure: <img> src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/brzuszek/assets/ugc-2-0-retusz.webp" width="1000" height="1250"
    loading="lazy" alt="Biało-różowa maszyna złożona i oparta o kanapę"; chip DWULINIOWY:
    „ZŁOŻONA" + druga linia mniejsza „zdjęcie od kupującego". (To realne zdjęcie — bez ocen,
    gwiazdek, liczb.)
POD dyptykiem 3 kroki w rzędzie (mobile stack), każdy [numer w kwadracie --paper-2/--ink |
tekst 15px]: 1 „Zwolnij zawleczkę zgodnie z instrukcją." / 2 „Złóż konstrukcję." / 3 „Zabezpiecz
ją przed odłożeniem." Pod krokami mikrocopy 14px --body wyśrodkowana: „Produkt jest opisany jako
łatwy w montażu i jest dostarczany z instrukcją." Na dole CTA wyśrodkowane
<a class="btn cta" data-checkout href="#zamow">Zamawiam składany Brzuszek</a> (nie centruj
transformem — użyj margin-inline:auto / justify).

ID sekcji: <section id="skladanie">.

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
