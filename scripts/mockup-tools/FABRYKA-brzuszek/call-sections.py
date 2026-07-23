# -*- coding: utf-8 -*-
"""F4 BRZUSZEK: briefy + calle gpt-5.6-sol dla sekcji (bez wideo — montaz je sklada) + wklejka
w markery szkieletu. Sekwencyjnie, retry x3, walidacja hexow serii. Wejscie wizyjne: makiety
desktop+mobile (Z2 = makieta swieta). Poprawki krytyka F2 + F3A wbudowane w briefy WSPOLNE."""
import io, os, re, subprocess, sys, time

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
A = PUB + 'bud-assets/brzuszek/assets/'
M = PUB + 'bud-assets/brzuszek/makiety/'
IDX = r'c:/repos_tn/tn-crm/sklepy/patryk-skrzypniak/brzuszek/index.html'
DOZWOLONE = {'#F7F5FB', '#F0ECF7', '#FFFFFF', '#241E2E', '#38323F', '#DCD5E8',
             '#A21CAF', '#86158F', '#C9C2D6', '#000000'}

WSPOLNE = '''
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
'''

S = {}
S['01-hero'] = dict(sid='hero', imgs=['01-hero.webp', '01-hero-mobile.webp'], brief='''
# SEKCJA 01-hero (archetyp C — karta mikro-oferty nachodzi na scenę lifestyle)
Prefiks `.hr-`. Sekcja: <section id="hero" class="hr-hero hero sect-pad"> (klasa .hero WYMAGANA
— IO sticky-buy). Topbar z wordmarkiem „Brzuszek" już istnieje w szkielecie — NIE dubluj logo.
UKŁAD wg makiety: scena lifestyle wypełnia prawą/górną część, KARTA mikro-oferty (--card,
radius-lg, shadow-lg, szer. 520–600px) NACHODZI na dolno-lewą krawędź sceny (margin ujemny
~ -64px desktop). Na mobile: scena u góry, karta pod nią nachodząca ~ -40px, cena+CTA w foldzie.
SCENA — <picture>:
  <source media="(max-width:600px)" srcset="''' + A + '''sc-hero-mobile.webp">
  <source media="(max-width:900px)" srcset="''' + A + '''sc-hero-800.webp">
  <img src="''' + A + '''sc-hero.webp" width="1536" height="1024" loading="eager"
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
''')
S['02-problem'] = dict(sid='problem', imgs=['02-problem.webp', '02-problem-mobile.webp'], brief='''
# SEKCJA 02-problem (KODOWA — agitacja PAS, kontrast METOD nie ciał; BEZ produktu, BEZ zdjęć)
Prefiks `.pb-`. <section id="problem" class="pb-problem sect-pad">. WYŁĄCZNIE kod — żadnej
fotografii, żadnego packshotu, żadnej sceny.
Nagłówek: eyebrow „ZNASZ TO?"; H2 .h2: „Mata, karnet, aplikacja — i tak się to
<span class="swash">rzuca</span>."
TRZY kafelki kontrastu METOD w rzędzie (desktop grid 3 kolumny, mobile stack), każdy --card,
radius-lg, border 1px --line, padding ~24px, [ikona SVG stroke 1.75px --ink u góry | tekst]:
  K1 (ikona maty zwiniętej / leżenia): „Brzuszki na macie → boli kręgosłup i szyja, a nuda
     wygrywa."
  K2 (ikona budynku siłowni / karty-karnetu): „Karnet na siłownię → drogo, daleko, brak czasu."
  K3 (ikona kółka ab-roller / telefonu-aplikacji): „Ab-roller i aplikacje → za trudne na start,
     porzucone po tygodniu."
Pod kafelkami jedno zdanie-most .lead (wyśrodkowane w kolumnie, max 60ch, marż. górny s4):
„Dlatego robisz to u siebie, po swojemu — na sprzęcie, który reguluje trudność."
Bez CTA głównego; sekcja prowadzi wizualnie do #jak-cwiczysz. Kontrast dotyczy METOD, nie ciał
(ZAKAZ body-shamingu, ZAKAZ sylwetek).
''')
S['03-jak-cwiczysz'] = dict(sid='jak-cwiczysz', imgs=['03-jak-cwiczysz.webp', '03-jak-cwiczysz-mobile.webp'], brief='''
# SEKCJA 03-jak-cwiczysz (TOR-I — 3 stany/kroki; interakcja przełączania kroku)
Prefiks `.jd-`. <section id="jak-cwiczysz" class="jd-jak sect-pad">. Eyebrow „JAK ĆWICZYSZ";
H2: „Ustaw. Oprzyj się. Napnij i <span class="swash">suń</span>."
DESKTOP grid 7/12 + 5/12. LEWA STAGE = --card (#FFFFFF, radius-lg, shadow-md, padding 12–20px)
— TŁO BIAŁE (wymóg: packshot-alpha osadzać wyłącznie na białym; resztki łat niewidoczne):
w środku <img src="''' + A + '''packshot-alpha.png" width="1591" height="1528" loading="lazy"
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
''')
S['04-regulacja'] = dict(sid='regulacja', imgs=['04-regulacja.webp', '04-regulacja-mobile.webp'], brief='''
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
src="''' + A + '''sc-reg-side.webp" width="1600" height="1100" loading="lazy" alt="Boczny profil
biało-różowej maszyny z widoczną szyną i regulacją"; object-fit cover, radius-sm.
Scoped <script> IIFE: (1) count-up „5" i „2" przy pierwszym wejściu w viewport (IntersectionObserver;
prefers-reduced-motion → wartości statyczne 5/2); (2) toggle Łagodniej/Trudniej przełącza aktywny
segment (aria-selected) i aktualizuje mały helper-text pod przełącznikiem („Niższe ustawienie —
łatwiejszy ruch." / „Wyższe ustawienie — większa trudność."). BEZ dodawania skali liczbowej spoza
danych. MOBILE: liczby najpierw (H2 → 5 / 2 → body → mikrocopy → toggle → CTA → foto-karta).
''')
S['06-wiele-partii'] = dict(sid='wiele-partii', imgs=['06-wiele-partii.webp', '06-wiele-partii-mobile.webp'], brief='''
# SEKCJA 06-wiele-partii (2×2 zdjęcie+typografia; kadry S)
Prefiks `.mp-`. <section id="wiele-partii" class="mp-partie sect-pad">. Eyebrow „WIĘCEJ NIŻ JEDEN
RUCH" + <span class="reps" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>.
H2: „Nie tylko <span class="swash">brzuch</span>."; lead: „Maszyna jest przeznaczona do ćwiczeń
brzucha, talii, pośladków, ramion i nóg."
DESKTOP grid 2×2 (mobile 1 kolumna). KAŻDY kafel = --card radius-lg border 1px --line shadow-sm,
overflow hidden: część fotograficzna (<img>, aspect-ratio 4/5, object-fit cover, radius-sm) +
blok tekstu [ikona MECHANICZNA SVG stroke 1.75px --ink | tytuł .display 700 20px | body 15px]:
  Kafel „Brzuch i core" — foto ''' + A + '''sc-partie-core.webp (alt „Kobieta wykonuje crunch,
    klęk na U-wałku biało-różowej maszyny"), ikona = wózek na szynie/crunch, body: „Wózek z
    wałkiem porusza się po pochyłej szynie podczas ruchu crunch."
  Kafel „Talia i pośladki" — foto ''' + A + '''sc-partie-glute.webp (alt „Wariant side leg raise
    na biało-różowej maszynie"), ikona = biodro/ruch boczny, body: „W materiałach produktu
    pokazano wariant side leg raise."
  Kafel „Ramiona" — foto ''' + A + '''sc-partie-arms.webp (alt „Trening ramion na linkach
    oporowych przy maszynie"), ikona = LINKA/GUMA OPOROWA z uchwytem (NIE biceps, NIE hantel!),
    body: „Do treningu ramion służą linki lub gumy oporowe z piankowymi uchwytami."
    ⚠️ KADR arms: dokadruj tak, by DÓŁ kadru (strefa stopy) był poza widokiem —
    użyj object-position:center top (albo center 30%) na tym <img>.
  Kafel „Nogi" — foto ''' + A + '''sc-partie-legs.webp (alt „Detal pasków/strzemion u podstawy
    maszyny"), ikona = pasek/strzemię u podstawy, body: „U podstawy znajdują się paski lub
    strzemiona pedałów, a nogi są wymienione w obszarach treningu."
Naprzemienność foto-lewa/foto-prawa jak w makiecie. Bez strzałek, heatmap mięśni, sylwetek
przed/po. Bez CTA.
''')
S['07-wytrzymalosc'] = dict(sid='wytrzymalosc', imgs=['07-wytrzymalosc.webp', '07-wytrzymalosc-mobile.webp'], brief='''
# SEKCJA 07-wytrzymalosc (dowód konstrukcyjny; count-up ≈200)
Prefiks `.wt-`. <section id="wytrzymalosc" class="wt-wytrz band sect-pad"> (na pasie .band).
Eyebrow „KONSTRUKCJA" + <span class="reps" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i>
</span>. H2: „Trójkątna rama. Konkretna <span class="swash">nośność</span>."
DESKTOP grid ~ 5/7. LEWA foto-karta (--card padding 12px radius-lg shadow-md): <img>
src="''' + A + '''sc-wytrz-detal.webp" width="1600" height="1100" loading="lazy" alt="Niski kadr
konstrukcji: poprzeczki podłogowe, diagonalna belka, punkty łączenia"; object-fit cover radius-sm.
PRAWA: duża liczba „≈ 200 kg" .display 800 (clamp(56px,7vw,96px), --ink, data-countup na części
liczbowej 200) podpis „deklarowany udźwig"; body .lead: „Konstrukcja ma trójkątny układ A-frame
i pogrubione metalowe rurki."; TRZY cechy z ikonami MECHANICZNYMI SVG stroke 1.75px --ink (lista,
NIE hantel):
  (ikona poprzeczki z antypoślizgową końcówką) „Dwie poprzeczki są zakończone antypoślizgowymi
    końcówkami."
  (ikona bryły/ABS) „Obudowę wykonano z ABS."
  (ikona wagi/nośności) „440 lbs według specyfikacji produktu, czyli około 200 kg."
Bez wizualnych testów obciążeniowych. Scoped <script> IIFE: count-up 200 (prefers-reduced-motion
→ statyczne). MOBILE: foto górą (~40vh cover) → liczba → body → cechy. Bez CTA.
''')
S['08-mid-cta'] = dict(sid='mid-cta', imgs=['08-mid-cta.webp', '08-mid-cta-mobile.webp'], brief='''
# SEKCJA 08-mid-cta (konwersyjna; packshot na BIAŁYM polu; bez rabatu/timera)
Prefiks `.mc-`. <section id="mid-cta" class="mc-mid sect-pad">. SZEROKA karta --card (radius-lg,
shadow-lg, overflow hidden, position relative). Za treścią GHOST typografia „SERIA" lub „5·2·200"
(.display 800, ~160px, kolor --paper-2, position absolute, prawy-górny obszar, aria-hidden,
z-index 0). Treść z-index 1.
DESKTOP: LEWA kolumna: H2: „Gotowa ustawić swoją <span class="swash">serię</span>?"; podpis 15px
--body: „Brzuszek — biało-różowy."; RZĄD: cena <span class="display" data-price>429,00 zł</span>
(var(--price-fs) 800) + CTA <a class="btn cta" data-checkout href="#zamow">Przechodzę do
zamówienia</a>; micro 13.5px --body: „Płatność przy odbiorze, BLIK lub online · 14 dni na zwrot".
PRAWA: packshot <img> src="''' + A + '''packshot-alpha.png" width="1591" height="1528"
loading="lazy" alt="Biało-różowa maszyna Brzuszek" na polu --card / białym kole (radius-lg),
max ~360px, object-fit contain (packshot-alpha WYŁĄCZNIE na białym #FFFFFF — resztki łat
niewidoczne). MOBILE: stack — H2 → packshot (max 260px na białym polu) → cena → CTA full → micro.
''')
S['09-skladanie'] = dict(sid='skladanie', imgs=['09-skladanie.webp', '09-skladanie-mobile.webp'], brief='''
# SEKCJA 09-skladanie (dyptyk rozłożona/złożona; prawy kadr = REALNE UGC)
Prefiks `.sk-`. <section id="skladanie" class="sk-sklad sect-pad">. Eyebrow „PO TRENINGU"
+ <span class="reps" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>.
H2: „Po serii składasz sprzęt, nie <span class="swash">plan</span>."; body .lead: „Maszyna ma
składaną konstrukcję z zawleczką zabezpieczającą, dzięki czemu po treningu możesz ją złożyć
i odłożyć."
DYPTYK (desktop 2 kolumny gap 16px; mobile stack): każdy kadr = figure --card padding 8–12px
radius-lg shadow-md, aspect-ratio 4/5, object-fit cover, z chipem-etykietą (biała pigułka,
caps 11px --ink, górny-lewy róg):
  LEWA figure: <img> src="''' + A + '''sc-sklad-rozloz.webp" width="1200" height="1500"
    loading="lazy" alt="Kobieta klęka przy rozłożonej biało-różowej maszynie i sięga do
    mechanizmu"; chip „ROZŁOŻONA".
  PRAWA figure: <img> src="''' + A + '''ugc-2-0-retusz.webp" width="1000" height="1250"
    loading="lazy" alt="Biało-różowa maszyna złożona i oparta o kanapę"; chip DWULINIOWY:
    „ZŁOŻONA" + druga linia mniejsza „zdjęcie od kupującego". (To realne zdjęcie — bez ocen,
    gwiazdek, liczb.)
POD dyptykiem 3 kroki w rzędzie (mobile stack), każdy [numer w kwadracie --paper-2/--ink |
tekst 15px]: 1 „Zwolnij zawleczkę zgodnie z instrukcją." / 2 „Złóż konstrukcję." / 3 „Zabezpiecz
ją przed odłożeniem." Pod krokami mikrocopy 14px --body wyśrodkowana: „Produkt jest opisany jako
łatwy w montażu i jest dostarczany z instrukcją." Na dole CTA wyśrodkowane
<a class="btn cta" data-checkout href="#zamow">Zamawiam składany Brzuszek</a> (nie centruj
transformem — użyj margin-inline:auto / justify).
''')
S['10-zamow'] = dict(sid='zamow', imgs=['10-zamow.webp', '10-zamow-mobile.webp'], brief='''
# SEKCJA 10-zamow (SKÓRKA checkoutu — mechanika = moduł fabryki wchodzi w montażu!)
Prefiks `.zm-`. <section id="zamow" class="zm-zamow sect-pad">. Eyebrow „ZAMÓWIENIE"
+ <span class="reps" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>.
H2: „Twój Brzuszek. Jeden <span class="swash">wariant</span>, bez zgadywania."
DESKTOP grid 5/7 (mobile stack):
LEWA karta produktu (--card, radius-lg, shadow-sm; sticky top 84px): packshot <img>
src="''' + A + '''packshot-alpha.png" width="1591" height="1528" loading="lazy" alt="Biało-różowa
maszyna Brzuszek" na białym polu (--card, radius-sm, max ~320px, object-fit contain — packshot
tylko na białym); nazwa „Brzuszek — składana maszyna do ćwiczeń brzucha i core" .display 700 22px;
wiersz „Kolor: biało-różowy" (label 13px --body + wartość 15px 600 --ink; BEZ selektora); cena
<span class="display" data-price>429,00 zł</span> (var(--price-fs) 800); pod nią 3 trust-pille
.pill [ikona ink | tekst]: „14 dni na zwrot" / „Płatność przy odbiorze" / „BLIK/online".
PRAWA karta checkout (--card, radius-lg, shadow-lg): wewnątrz WYŁĄCZNIE marker:
<!--CHECKOUT-INLINE-->
(nic więcej — moduł checkout-inline@2 wchodzi w montażu; NIE koduj pól/radiów/kroków/przycisku!).
W scoped <style> przygotuj SKIN dla modułu (selektory na przyszłej zawartości #zamow .zc-checkout):
UKRYJ wewnętrzny nagłówek modułu: `#zamow .zc-checkout .zc-head{display:none}` (nasz H2 sekcji
pełni rolę nagłówka — makieta bez „Dokończ zamówienie"). Inputy: tło --card, border 1px --line,
radius-sm, focus border --cta; radio-karty (dostawa/płatność): border 1px --line radius-sm,
wybrana = border --cta + kropka --cta; przycisk submit = jak .btn.cta full-width radius-lg
(--font-display font-stretch 125%); drobny tekst 13px --body; numery kroków = tło --ink, tekst
biały. MOBILE: karta produktu KOMPAKT (thumb 96px + nazwa + „Kolor: biało-różowy" + cena) → karta
checkout.
''')
S['11-final'] = dict(sid='final', imgs=['11-final.webp', '11-final-mobile.webp'], brief='''
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
''')

ORDER = ['01-hero', '02-problem', '03-jak-cwiczysz', '04-regulacja', '06-wiele-partii',
         '07-wytrzymalosc', '08-mid-cta', '09-skladanie', '10-zamow', '11-final']


def call(section):
    cfg = S[section]
    bpath = 'briefing-%s.md' % section
    opath = 'out-%s.md' % section
    io.open(bpath, 'w', encoding='utf-8').write(
        cfg['brief'] + '\nID sekcji: <section id="%s">.\n' % cfg['sid'] + WSPOLNE)
    imgs = [M + i for i in cfg['imgs']]
    env = dict(os.environ, WF2_EFFORT='medium', WF2_MAXOUT='15000')
    for attempt in (1, 2, 3):
        r = subprocess.run([sys.executable, '../wf2gpt-call.py', bpath, opath] + imgs,
                           env=env, capture_output=True, text=True, timeout=580)
        if r.returncode == 0 and os.path.isfile(opath) and os.path.getsize(opath) > 500:
            return opath
        print('  [%s] call proba %d FAIL: %s' % (section, attempt, (r.stderr or r.stdout)[-200:]))
        time.sleep(10 * attempt)
    raise RuntimeError('call fail ' + section)


def splice(section):
    cfg = S[section]
    t = io.open('out-%s.md' % section, encoding='utf-8').read()
    m = re.search(r'```html\s*\n(.*?)\n```', t, re.S)
    if not m:
        raise RuntimeError('brak bloku html w out-%s' % section)
    sec = m.group(1).strip()
    if ('<section id="%s"' % cfg['sid']) not in sec:
        raise RuntimeError('brak <section id=%s>' % cfg['sid'])
    clean = sec.replace('<!--CHECKOUT-INLINE-->', '').replace('<!--PAYBADGES-->', '')
    if '-->' in clean:
        extra = re.findall(r'<!--.*?-->', clean, re.S)
        print('  [%s] komentarze w sekcji: %s' % (section, [e[:40] for e in extra]))
    hexy = set(h.upper() for h in re.findall(r'#[0-9A-Fa-f]{6}\b', sec))
    obce = hexy - DOZWOLONE
    if obce:
        print('  [%s] UWAGA obce hexy: %s' % (section, obce))
    # grep zakazow tekstowych
    low = sec.lower()
    for bad in ['merach', 'shop1103659154', 'darmowa dostawa', 'darmowej dostaw',
                '10 minut', 'schud', 'spalisz', 'spalanie kalorii']:
        if bad in low:
            print('  [%s] UWAGA zakazana fr4za: %r' % (section, bad))
    idx = io.open(IDX, encoding='utf-8').read()
    pat = re.compile(r'(<!--\s*SEKCJA:%s START\s*-->).*?(<!--\s*SEKCJA:%s END\s*-->)'
                     % (section, section), re.S)
    if not pat.search(idx):
        raise RuntimeError('brak markerow %s' % section)
    idx2 = pat.sub(lambda mm: mm.group(1) + '\n' + sec + '\n' + mm.group(2), idx)
    io.open(IDX, 'w', encoding='utf-8').write(idx2)
    return len(sec)


args = sys.argv[1:]
mode = 'full'
if args and args[0] in ('--call-only', '--splice-only'):
    mode = args[0][2:].replace('-only', '')
    args = args[1:]
only = set(args) or None
for s in ORDER:
    if only and s not in only:
        continue
    print('==', s, flush=True)
    if mode in ('full', 'call'):
        call(s)
    if mode in ('full', 'splice'):
        n = splice(s)
        print('  splice OK (%d B)' % n)
print('KONIEC')
