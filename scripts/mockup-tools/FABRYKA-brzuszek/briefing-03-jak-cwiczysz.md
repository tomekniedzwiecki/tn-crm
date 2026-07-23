
# SEKCJA 03-jak-cwiczysz (TOR-I — 3 stany/kroki; interakcja przełączania kroku)
Prefiks `.jd-`. <section id="jak-cwiczysz" class="jd-jak sect-pad">. Eyebrow „JAK ĆWICZYSZ";
H2: „Ustaw. Oprzyj się. Napnij i <span class="swash">suń</span>."
DESKTOP grid 7/12 + 5/12. LEWA STAGE = --card (#FFFFFF, radius-lg, shadow-md, padding 12–20px)
— TŁO BIAŁE (wymóg: packshot-alpha osadzać wyłącznie na białym; resztki łat niewidoczne):
w środku <img src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/brzuszek/assets/packshot-alpha.png" width="1591" height="1528" loading="lazy"
alt="Biało-różowa maszyna Brzuszek — widok z boku" style=" maxwidth do stage; object-fit
contain">. Na stage nałóż 2–3 znaczniki-callouty (position absolute): mały krążek/kropka
(border 2px --ink, fill --card) + cienka linia --ink + etykieta 13px --ink na białej pigułce;
callouty odpowiadają KROKOM: (a) selektor wysokości u góry ramy, (b) wózek/U-wałek na szynie,
(c) podstawa. AKTYWNY callout (dla aktywnego kroku) — kropka wypełniona --cta (JEDYNE użycie
akcentu tutaj poza niczym). Pozostałe przygaszone.
PRAWA = pionowy STEPPER: 3 wiersze-przyciski <button role="tab" aria-selected> połączone cienką
pionową linią --line; każdy = numer w .display (1/2/3; aktywny: kwadrat --ink z białą cyfrą +
lewy border 3px --cta; nieaktywny: cyfra --ink na --card) + ikona MECHANICZNA (1: suwaki/poziomy;
2: U-kształtny wałek; 3: wózek na pochyłej szynie — NIE hantel/biceps) + tytuł .display 700 +
1 linia body:
  1 „Ustaw poziom": „Wybierz 1 z 5 wysokości i 1 z 2 kątów nachylenia; wyższe ustawienie
    zwiększa trudność."
  2 „Oprzyj się stabilnie": „Kolana lub łokcie opierasz na pogrubionym, U-kształtnym wałku
    piankowym, a przy konsoli masz dwa dodatkowe wałki pod klatkę lub przedramiona."
  3 „Napnij i suń": „Przedni wózek porusza się po szynie na 3 zestawach cichych kółek."
Aktywny wiersz (stan 1 domyślny) przełącza aktywny callout na stage. Scoped <script> IIFE:
klik + strzałki klawiatury zmieniają aktywny krok (klasa .is-active na wierszu + na odpowiednim
calloutcie). Pod stepperem mikrocopy 14px --body z małą ikoną LCD: „LCD pokazuje powtórzenia,
czas i kalorie jako funkcje licznika." Na dole tekstowy link W KOLORZE --ink (NIGDY --cta),
podkreślony: „Zobacz poziomy trudności →" href="#regulacja".
MOBILE: header → stage (aspect-ratio 4/3, białe tło) → stepper pionowy pełnej szerokości →
mikrocopy LCD → link.

ID sekcji: <section id="jak-cwiczysz">.

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
