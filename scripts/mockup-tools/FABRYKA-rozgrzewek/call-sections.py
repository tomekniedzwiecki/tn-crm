# -*- coding: utf-8 -*-
"""F4 ROZGRZEWEK: briefy + calle gpt-5.6-sol dla sekcji 01..11 (bez 10-zamow = modul checkout)
+ wklejka w markery szkieletu. Sekwencyjnie, retry x3, walidacja hexow serii.
Wejscie wizyjne: makiety desktop+mobile (Z2). Copy VERBATIM z PLANU + DECYZJE WIAZACE (krytyk F2/F3A)."""
import io, os, re, subprocess, sys, time

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
A = PUB + 'bud-assets/rozgrzewek/assets/'
M = PUB + 'bud-assets/rozgrzewek/makiety/'
IDX = r'c:/repos_tn/tn-crm/sklepy/patryk-skrzypniak/rozgrzewek/index.html'
DOZWOLONE = {'#FAF3EF', '#F3E9E3', '#FFFFFF', '#2B2622', '#453E38', '#E4D7CE',
             '#2E46C8', '#2438A6', '#D8433A', '#3FA05A', '#000000'}

RINGS = ('<span class="rings-wrap"><svg class="rings" viewBox="0 0 88 46" aria-hidden="true" '
         'focusable="false"><path class="r-out" d="M4 44a40 40 0 0 1 80 0"/>'
         '<path class="r-mid" d="M15 44a29 29 0 0 1 58 0"/>'
         '<path class="r-in" d="M26 44a18 18 0 0 1 36 0"/></svg></span>')

WSPOLNE = '''
## KONTRAKT/ZAKAZY (wspólne serii — Rozgrzewek)
- Sekcja wklejana w gotowy szkielet: istnieją tokeny :root (--paper #FAF3EF / --paper-2 #F3E9E3 /
  --card #FFFFFF / --ink #2B2622 / --body #453E38 / --line #E4D7CE / --cta #2E46C8 /
  --cta-hover #2438A6 / --cta-ink #FFFFFF / --led-heat #D8433A / --led-vibe #2E46C8 /
  --led-ems #3FA05A / --radius-lg 18px / --radius-sm 10px / --shadow-sm/-md/-lg /
  --s1..--s7 / --content-w / --h1-d / --h1-m / --h2-d / --h2-m / --price-fs / --body-fs)
  oraz klasy globalne .wrap .sect-pad .eyebrow .rings .h2 .lead .display .btn.cta .pill .band
  .reveal .swash. UŻYWAJ ich; style sekcyjne w scoped <style> z PREFIKSEM sekcji.
- SKALA TYPOGRAFII ŻYWEJ (twarda): H1=var(--h1-d)/var(--h1-m), H2=var(--h2-d)/var(--h2-m),
  ceny=var(--price-fs), body 17px. ⛔ ZERO clampów sekcyjnych powyżej tej skali.
- KOLORY WYŁĄCZNIE tokenami; ZERO nowych hexów (poza rgba() cieni serii i tokenami --led-* dla
  DIOD STATUSU urządzenia). Dozwolone hexy dosłowne: #FAF3EF #F3E9E3 #FFFFFF #2B2622 #453E38
  #E4D7CE #2E46C8 #2438A6 #D8433A #3FA05A #000000.
- AKCENT #2E46C8 (indygo) TYLKO: (a) przycisk .btn.cta, (b) swash (1 słowo), (c) ZEWNĘTRZNY łuk
  kręgów (.r-out). ⛔ NIGDY na: linkach tekstowych (=--ink z podkreśleniem), nagłówkach kart,
  aktywnych zakładkach (=fill --ink / tekst biały), ikonach (=--ink outline 1.75px).
  Kolory --led-heat/--led-vibe/--led-ems = WYŁĄCZNIE diody statusu urządzenia (czerwony=grzanie,
  niebieski=wibracje, zielony=EMS), NIE dekoracja UI.
- SYGNATURA „kręgi ciepła": tam gdzie brief każe, wstaw DOKŁADNIE ten markup przy eyebrow:
  ''' + RINGS + '''
  (2-3 koncentryczne łuki; wewnętrzne --line, zewnętrzny --cta; rysuje się przy .reveal.in).
- SWASH: <span class="swash">słowo</span> w H1/H2 — ZAWSZE DOKŁADNIE JEDNO słowo, maks. 1/sekcja.
- ZAKAZY TWARDE (Karta Prawdy §ZAKAZY): ZERO twierdzeń medycznych/leczniczych (drenaż limfatyczny,
  krążenie, meridiany, terapia światłem/mikroprądami, leczenie bólu), ZERO odchudzania/modelowania
  sylwetki (fat burner, cellulit), ZERO temperatur w °C, ZERO wymiarów cm/kg, ZERO nazwy „Hailicare"
  ani nazw sklepów, ZERO social-proof liczbowego (gwiazdki/liczby opinii/„sprzedano N"), ZERO
  fałszywej pilności/przecen, ZERO „darmowej dostawy", ZERO wypalonego tekstu EN/watermarków.
  Słowo „COD" NIGDY w copy widocznym — pisz „płatność przy odbiorze". Wariant = wyłącznie
  „Granatowy (Blue)" / „granatowy"; ZERO selektora kolorów. Liczby dozwolone: 84,90 zł · 9 poziomów
  · 21 kulek (tylko zdaniem, patrz 04) · 14 dni · ok. 1200 mAh / ok. 3 h / ok. 50 min / ok. 30 min.
  Funkcje wolno wymieniać NEUTRALNIE (ciepły okład, wibracje, tryb EMS/mikroprądy) BEZ obietnicy efektu.
- Obrazy: <img> z width/height (i CSS height:auto), loading="lazy" (poza hero=eager), alt PL
  opisowy (produkt zawsze „granatowy"), radius var(--radius-lg/sm). Dodawaj .reveal do głównych bloków.
- ⛔ NIE centruj transformem (kolizja z .reveal.in{transform:none}) — używaj margin-inline/justify.
- NAJPIERW wypisz krótką siatkę sekcji, POTEM kod.

## FORMAT ODPOWIEDZI
Krótka siatka, potem JEDEN blok ```html: WYŁĄCZNIE <section id="ID"> + scoped <style> (+ scoped
<script> IIFE tylko jeśli brief każe). ZERO markdown poza tym blokiem.
'''

S = {}

S['01-hero'] = dict(sid='hero', imgs=['01-hero.webp', '01-hero-mobile.webp'], brief='''
# SEKCJA 01-hero (archetyp D — packshot/scena centralna na polu koloru; message match)
Prefiks `.hr-`. Sekcja: <section id="hero" class="hr-hero hero sect-pad"> (klasa .hero WYMAGANA — IO
sticky-buy). Topbar z lockupem JUŻ istnieje w szkielecie — NIE dubluj logo.
DESKTOP (≥900px): 2 kolumny, LEWA (~46%) = scena, PRAWA (~54%) = copy+oferta (editorialnie,
wyśrodkowana w kolumnie, bez bocznych podkolumn).
LEWA scena (.reveal): <img> ''' + A + '''sc-hero.webp (1536x1024, eager, fetchpriority="high",
alt "Granatowy masażer Rozgrzewek na ciepłym stoliku, obok parujący kubek i ciepła lampa") na polu
--paper-2, radius-lg, object-fit cover; delikatna ambientowa poświata lampy w prawym-górnym rogu
ramy (subtelny radialny gradient, powolny „oddech" opacity ~6s; @prefers-reduced-motion → statyczny;
ZERO ruchu produktu/LED).
PRAWA copy (.reveal): na górze kręgi + eyebrow „TWÓJ WIECZORNY RYTUAŁ" (kręgi NAD eyebrow, użyj
markup RINGS). Potem H1 .display var(--h1-d) — WARIANTY HOOK pod ?h= (domyślnie h1):
  hook-1 (domyślny widoczny): H1 „Wieczorny masaż, który zaczyna się od <span class="swash">ciepła</span>."
    sub .lead „Rozgrzewek łączy delikatny ciepły okład, wibracje i tryb EMS — każdy z 9 poziomami intensywności."
  hook-2: H1 „3 tryby. 9 poziomów. Jeden <span class="swash">rytuał</span> po Twojemu."
    sub „Podgrzewanie, wibracje i mikroprądy/EMS w ręcznym, bezprzewodowym masażerze do ciała."
  hook-3: H1 „Gdy po całym dniu chcesz już tylko chwili dla <span class="swash">siebie</span>."
    sub „Sięgnij po rozgrzewający masaż karku, ramion, pleców lub ud — we własnym wieczornym rytmie."
Zaimplementuj 3 bloki .hr-hook (hook-1/2/3), domyślnie widoczny hook-1 (CSS .hr-hook{display:none};
.hr-hook-1{display:block}); scoped <script> IIFE czyta ?h= (2 lub 3) i przełącza data-hook na kontenerze
(CSS [data-hook="2"] .hr-hook-1{display:none} itd.), w try/catch, bez konsoli. Domyślnie (brak/inny param)
= hook-1.
Pod H1/sub: NAZWA caps 14px letter-spacing .1em --ink: „ROZGRZEWEK — PODGRZEWANY MASAŻER DO CIAŁA".
KARTA OFERTY (--card, radius-lg, shadow-md, padding s4): cena <span class="display hr-price"
data-price>84,90 zł</span> (var(--price-fs), 700, --ink) → CTA <a class="btn cta" data-checkout
href="#zamow">Chcę swój Rozgrzewek</a> (full-width) → linia redukcji ryzyka .hr-micro 13.5px
„Płatność przy odbiorze • 14 dni na zwrot".
POD kartą PAS ZAUFANIA: 3 trust-pille (.pill, białe, border --line, ikona --ink 1.75px, tekst --ink):
„Płatność przy odbiorze" (ikona pudełka) · „BLIK i płatność online" (ikona telefonu/karty) · „CE i RoHS"
(ikona tarczy). To PIGUŁKI trust, NIE loga płatności.
MOBILE (<900px) — kolejność makiety: scena (zcapowana!) → kręgi+eyebrow → H1 → sub → NAZWA → karta
oferty → trust-pille. **TWARDA REGUŁA FOLD (decyzja krytyka): cena 84,90 zł + CTA MUSZĄ być w pierwszym
ekranie 390x844 z zapasem.** Dlatego: scena mobile <img> ''' + A + '''sc-hero-mobile.webp
(1024x1536, eager, alt jw.) z `max-height:38vh; object-fit:contain/cover` (kilka % mniej niż makieta);
H1 var(--h1-m) line-height ~1.03; sub skrócony do 2 linii; karta oferty kompakt zaraz pod sub. Trust-pille
i redukcja ryzyka mogą wejść pod zgięcie. Cel: price+CTA nad ~760px.
''')

S['02-moment'] = dict(sid='moment', imgs=['02-moment.webp', '02-moment-mobile.webp'], brief='''
# SEKCJA 02-moment (typ A — scena lifestyle LEWA, copy PRAWA; wieczorny kontekst)
Prefiks `.mo-`. Sekcja na --paper (albo .band). DESKTOP: grid 55/45.
LEWA (.reveal) foto-karta (--card padding 12px radius-lg shadow-md): <img> ''' + A + '''sc-moment.webp
(1536x1024, lazy, aspect-ratio 4/5 lub 3/2 wg makiety, cover, radius-sm, alt "Kobieta na sofie pod kocem
prowadzi granatowy masażer po ramieniu, obok lampa i kubek"). Świeca na stoliku = subtelny „oddech"
poświaty (CSS, @reduced-motion off); produkt statyczny.
PRAWA (.reveal): eyebrow „PO DNIU, PO SWOJEMU" (BEZ kręgów tu); H2 „Ciepły moment, który mieści się
w <span class="swash">wieczorze</span>."; body .lead VERBATIM: „Spięte barki i kark po dniu przy biurku
znają to uczucie. Usiądź z herbatą, wybierz poziom i prowadź masażer po karku, ramionach, plecach lub
udach. Rozgrzewek działa bez przewodu, więc rytuał nie musi odbywać się przy gniazdku."; link tekstowy
w --ink z podkreśleniem (NIGDY --cta): „Zobacz 3 tryby" href="#tryby".
MOBILE: scena 4:5 na górze → eyebrow → H2 → body (kolumna do ~40 znaków) → link.
''')

S['03-tryby'] = dict(sid='tryby', imgs=['03-tryby.webp', '03-tryby-mobile.webp'], brief='''
# SEKCJA 03-tryby (TOR-I — 3 zakładki ciepło/wibracje/EMS; DECYZJA WIĄŻĄCA: podświetlaj TYLKO
#                   wskaźnik aktywnego trybu; pozostałe diody wygaszone)
Prefiks `.tr-`. DESKTOP: LEWA (~42%) duży <img> ''' + A + '''sc-hero.webp? NIE — użyj packshotu sceny
produktu: <img> ''' + A + '''packshot-alpha.png (lazy, alt "Granatowy masażer Rozgrzewek — rączka
z okrągłym wyświetlaczem i głowica z kulkami", na polu --paper-2 radius-lg). PRAWA (~58%) copy+panel:
kręgi + eyebrow „WYBIERZ SWÓJ TRYB" (użyj RINGS); H2 „Trzy tryby. Intensywność ustawiasz od 1 do
<span class="swash">9</span>."; intro .lead „Dotknij trybu, aby zobaczyć jego wskaźnik i zakres ustawień."
TOR-I: 3 przełączniki (role="tab", aria-selected, sterowane klik+klawiatura strzałki; button):
„Ciepło" (ikona fal ciepła) / „Wibracje" (ikona fal) / „EMS" (ikona pulsu). AKTYWNA zakładka =
fill --ink, tekst --cta-ink (biały), border --ink; NIEAKTYWNE = --card, border --line, tekst --ink.
(⛔ NIE indygo na zakładce — akcent tylko CTA/swash/łuk.)
PANEL pod zakładkami (--card radius-lg border --line): LEWA = reprodukcja wyświetlacza:
<img> ''' + A + '''tryby-panel.webp (lazy, alt "Okrągły wyświetlacz LED z cyfrą i wskaźnikami trybów")
+ NAD/OBOK niego KODOWY klaster 3 wskaźników statusu (kropki): Ciepło=--led-heat, Wibracje=--led-vibe,
EMS=--led-ems — AKTYWNY tryb: jego kropka pełny kolor + delikatna poświata (box-shadow tego samego
koloru, niski alfa); POZOSTAŁE 2 kropki WYGASZONE (kolor --line, opacity .35, bez poświaty). Zmiana
zakładki przełącza który jeden wskaźnik jest zapalony (DOKŁADNIE JEDEN aktywny). PRAWA panelu =
nagłówek trybu w --ink (NIE indygo) + opis; treści zakładek VERBATIM:
  Ciepło:   nagłówek „Ciepło"   opis „Delikatny ciepły okład z 9 poziomami. Aktywny tryb wskazuje czerwony wskaźnik."
  Wibracje: nagłówek „Wibracje" opis „Wibracje z 9 poziomami. Aktywny tryb wskazuje niebieski wskaźnik."
  EMS:      nagłówek „EMS"      opis „Tryb mikroprądów/EMS z 9 poziomami. Aktywny tryb wskazuje zielony wskaźnik."
Domyślnie aktywny = Ciepło. Pod panelem DOPISEK (ikona „i" w kółku --ink 1.75px): „Czerwone światło LED
jest widoczną cechą głowicy — nie przedstawiamy go jako terapii." Pod całością CTA:
<a class="btn cta" data-checkout href="#zamow">Wybieram Rozgrzewek — 84,90 zł</a>.
Scoped <script> IIFE: przełączanie zakładek (klik+klawiatura), aktualizacja nagłówka/opisu i JEDNEGO
zapalonego wskaźnika; aria-selected; bez błędów konsoli.
MOBILE: packshot na górze (mały) → kręgi+eyebrow → H2 → intro → 3 zakładki (mogą się zawijać) → panel
(wyświetlacz + wskaźniki + opis, bez poziomego scrolla) → dopisek → CTA full-width.
''')

S['04-glowica'] = dict(sid='glowica', imgs=['04-glowica.webp', '04-glowica-mobile.webp'], brief='''
# SEKCJA 04-glowica (makro dowodowe; DECYZJA WIĄŻĄCA: ZAKAZ dużej cyfry „21" i count-upu;
#                    H2 złagodzone; liczba 21 tylko zwykłym zdaniem w body)
Prefiks `.gl-`. Na --paper lub .band. DESKTOP: grid 45/55.
LEWA (.reveal) copy: kręgi + eyebrow „KRĘGI CIEPŁA" (użyj RINGS); H2 (BEZ prefiksu „21", BEZ wielkiej
cyfry, BEZ count-upu): „Stalowe kulki w koncentrycznych <span class="swash">pierścieniach</span>.";
body .lead VERBATIM (liczba 21 TYLKO tu, zwykłym zdaniem): „Kopułowa główka masażera ma 21 stalowych
kulkowych bolców ułożonych w pierścieniach. W główce widoczne jest również czerwone światło LED.";
mikrocopy (ikona oka --ink 1.75px): „Bez dopisywania cudów. Pokazujemy dokładnie to, co znajduje się
w produkcie."; link tekstowy --ink podkreślony (NIGDY --cta): „Zobacz, gdzie możesz go używać" href="#obszary".
⛔ ABSOLUTNIE ZERO wielkiej typograficznej „21" jako grafiki i ZERO animacji count-up (makieta pokazuje
dużą „21" — NIE odziedzicz tego).
PRAWA (.reveal): pełnokadrowe makro <img> ''' + A + '''glowica-head.webp (lazy, aspect-ratio 16/10 desktop
/ 1/1 mobile, cover, radius-lg, alt "Makro kopułowej głowicy granatowego masażera: stalowe kulki
w pierścieniach i czerwone światło LED").
MOBILE: makro na górze (1:1) → kręgi+eyebrow → H2 → body → mikrocopy → link.
''')

S['05-obszary'] = dict(sid='obszary', imgs=['05-obszary.webp', '05-obszary-mobile.webp'], brief='''
# SEKCJA 05-obszary (4 kadry obszarów użycia; mozaika)
Prefiks `.ob-`. Na --paper. DESKTOP: header (eyebrow „TWÓJ RYTM"; H2 „Kark, ramiona, plecy albo
<span class="swash">uda</span>."; body .lead „Wybierz obszar i prowadź masażer ręcznie, dopasowując
poziom do własnych preferencji.") + mozaika 2×2 kart (--card radius-lg border --line shadow-sm):
  kafel1 <img> ''' + A + '''sc-obszary-neck.webp (alt "Dłoń prowadzi granatowy masażer po karku") + etykieta „Kark"
  kafel2 <img> ''' + A + '''sc-obszary-shoulder.webp (alt "Granatowy masażer przy ramieniu, chwyt za głowicę") + „Ramiona"
  kafel3 <img> ''' + A + '''sc-obszary-back.webp (alt "Górna część pleców i granatowy masażer, naturalny zasięg dłoni") + „Plecy"
  kafel4 <img> ''' + A + '''sc-obszary-thigh.webp (alt "Granatowy masażer na udzie w domowej stylizacji") + „Uda"
wszystkie 4:5 cover radius-sm, lazy, etykiety .display --ink na dole kafla. Pod mozaiką NOTA .lead 15px:
„To produkt do domowego masażu i relaksu, nie urządzenie lecznicze." Link tekstowy --ink podkreślony:
„Sprawdź ładowanie i czas pracy" href="#autonomia". ⛔ ZERO schematów anatomicznych/„stref bólu".
MOBILE: header → sekwencja pionowa 4 kadrów (te same pliki) z etykietami → nota → link.
''')

S['06-autonomia'] = dict(sid='autonomia', imgs=['06-autonomia.webp', '06-autonomia-mobile.webp'], brief='''
# SEKCJA 06-autonomia (karty parametrów; zasilanie/ładowanie — „ok." OBOWIĄZKOWE)
Prefiks `.au-`. Na .band. DESKTOP: grid 55/45 (copy+karty LEWA, mały packshot PRAWA) LUB header na górze
+ rząd 4 kart (wg makiety). Eyebrow „NAŁADUJ I UŻYWAJ BEZ PRZEWODU"; H2 „Około 50 minut pracy po
<span class="swash">naładowaniu</span>."; 4 karty (--card radius-lg border --line shadow-sm), każda:
duża liczba .display --ink + podpis --body:
  „ok. 1200 mAh" / „Pojemność baterii"
  „ok. 3 h" / „Czas ładowania"
  „ok. 50 min" / „Czas pracy"
  „ok. 30 min" / „Automatyczne wyłączenie"
(⛔ NIE usuwaj „ok." — wartości z opisu, nie z pomiaru). Dopisek .lead 15px: „Obudowa: ABS i TPR.
Produkt zgodny z CE i RoHS." Mały packshot <img> ''' + A + '''packshot-alpha.png (lazy, alt
"Granatowy masażer Rozgrzewek") przy kartach; ⛔ ZERO wizualizacji portu/kabla. Liniowe ikony --ink 1.75px
(bateria/zegar/timer). CTA <a class="btn cta" data-checkout href="#zamow">Zamawiam za 84,90 zł</a>.
MOBILE: header → karty 2×2 → dopisek → CTA.
''')

S['07-zdjecia-kupujacych'] = dict(sid='zdjecia', imgs=['07-zdjecia-kupujacych.webp', '07-zdjecia-kupujacych-mobile.webp'], brief='''
# SEKCJA 07-zdjecia-kupujacych (UGC realne, 3 kafle granatowe; ZERO ocen/gwiazdek/liczb — bramka ≥2 PASS
#                              spełniona: 3 klatki granatowe)
Prefiks `.ug-`. Na --paper. Header: eyebrow „POZA PACKSHOTEM"; H2 „Zdjęcia od <span class="swash">kupujących</span>.";
body .lead „Prawdziwe domowe kadry granatowego wariantu — bez ocen, gwiazdek i liczników popularności."
GALERIA 3 kafle (--card radius-lg border --line, overflow hidden):
  <img> ''' + A + '''ugc/ugc-1.webp (alt "Zdjęcie od kupującego: granatowy masażer w dłoni, widoczna głowica")
  <img> ''' + A + '''ugc/ugc-2.webp (alt "Zdjęcie od kupującego: granatowy masażer, świecący wyświetlacz")
  <img> ''' + A + '''ugc/ugc-3.webp (alt "Zdjęcie od kupującego: makro głowicy z czerwonym światłem LED")
wszystkie lazy, cover, aspect-ratio 4/5 lub 1/1; POD KAŻDYM podpis 13px --body: „Granatowy wariant Blue".
DESKTOP: 3 kadry w spokojnej siatce (repeat(3,1fr)). MOBILE: jeden duży kadr + 2 mniejsze (bez agresywnego
poziomego railu). ⛔ ZERO gwiazdek, liczb, „opinii N", ocen. Link tekstowy --ink podkreślony:
„Chcę granatowy Rozgrzewek" href="#zamow".
''')

S['08-mid-cta'] = dict(sid='mid-cta', imgs=['08-mid-cta.webp', '08-mid-cta-mobile.webp'], brief='''
# SEKCJA 08-mid-cta (konwersyjna; packshot na polu koloru)
Prefiks `.mc-`. Na .band. SZEROKA karta --card (radius-lg shadow-lg, overflow hidden, position relative).
DESKTOP: LEWA kolumna: kręgi + eyebrow „MAŁY RYTUAŁ DLA SIEBIE" (użyj RINGS); H2 „Rozgrzewek w jednej,
stałej <span class="swash">cenie</span>."; cena <span class="display" data-price>84,90 zł</span>
(var(--price-fs) 700 --ink); CTA <a class="btn cta" data-checkout href="#zamow">Wybieram Rozgrzewek</a>;
DWA chipy redukcji ryzyka [ikona --ink 1.75px | tekst] (--card border --line radius-sm): „Możesz zapłacić
przy odbiorze." (ikona dłoni/pudełka) / „Masz 14 dni na zwrot." (ikona strzałki kołowej / „14").
PRAWA: <img> ''' + A + '''packshot-alpha.png (lazy, alt "Granatowy masażer Rozgrzewek") na polu --paper-2 radius-lg.
MOBILE: stack — kręgi+eyebrow → H2 → packshot (max ~260px) → cena → CTA full → chipy (2 w rzędzie).
''')

S['09-faq'] = dict(sid='faq', imgs=['09-faq.webp', '09-faq-mobile.webp'], brief='''
# SEKCJA 09-faq (accordion natywny <details>/<summary>, ZERO JS; pierwsze OTWARTE; ikona +/- CSS --ink)
Prefiks `.fq-`. Na --paper. Header: H2 „Zanim zamówisz — konkretnie i bez <span class="swash">przesady</span>."
Akordeon max 860px, karta --card border --line radius-lg shadow-sm. KAŻDA pozycja:
<details class="fq-item"><summary>PYTANIE<span class="fq-ic" aria-hidden="true"></span></summary>
<div class="fq-a">ODPOWIEDŹ</div></details>. Ikona +/- rysowana CSS (dwie kreski 1.75px --ink przez
::before/::after na .fq-ic, obrót przy [open]; NIGDY --cta). summary::-webkit-details-marker + ::marker ukryte.
PIERWSZA pozycja ma atrybut `open`. 8 pozycji VERBATIM:
1. „Czy masażer grzeje bardzo mocno?" → „Nie. To delikatny ciepły okład, a nie intensywne grzanie jak od żelazka. Jeśli szukasz bardzo wysokiej temperatury, ten produkt może nie odpowiadać Twoim oczekiwaniom."
2. „Czy intensywność będzie dla mnie wystarczająca?" → „Wibracje, podgrzewanie i tryb EMS mają po 9 poziomów, ale odczucie intensywności jest indywidualne. Wśród opinii pojawia się również głos, że ktoś chciałby mocniejszego działania."
3. „Czy rączka jest długa?" → „Nie podajemy wymiarów, ponieważ nie mamy potwierdzonych danych. Pokazujemy rzeczywisty kształt produktu na zdjęciach, a wśród opinii pojawia się uwaga, że przydałaby się dłuższa rączka."
4. „Jak sprawdzę ustawiony poziom?" → „Poziom od 1 do 9 pokazuje okrągły wyświetlacz LED. Czerwony wskaźnik oznacza grzanie, niebieski wibracje, a zielony tryb EMS."
5. „Jak długo działa po naładowaniu?" → „Według opisu ładowanie trwa około 3 godzin, a czas pracy wynosi około 50 minut. Urządzenie wyłącza się automatycznie po 30 minutach."
6. „Jaki kolor otrzymam?" → „Sprzedajemy wyłącznie granatowy wariant Blue widoczny na zdjęciach. W checkoutcie nie ma wyboru koloru."
7. „Czy mogę zapłacić przy odbiorze?" → „Tak. Dostępna jest płatność przy odbiorze oraz BLIK lub płatność online."
8. „Czy mogę zwrócić produkt?" → „Tak. Masz 14 dni na odstąpienie od umowy."
POD listą kompaktowy blok oferty (wyśrodkowany): cena <span class="display" data-price>84,90 zł</span>
→ CTA <a class="btn cta" data-checkout href="#zamow">Przejdź do zamówienia — 84,90 zł</a> → linia 13.5px „14 dni na zwrot".
⛔ Rola grafiki: TYLKO liniowe +/- w --ink; ZERO ilustracji/zdjęć. MOBILE: 1 kolumna, to samo.
''')

S['11-final'] = dict(sid='final', imgs=['11-final.webp', '11-final-mobile.webp'], brief='''
# SEKCJA 11-final (domknięcie emocjonalne; scena wieczorna, copy DÓŁ)
Prefiks `.fn-`. Pełna jasna scena. DESKTOP: duża scena z copy w dolnej części (overlay copy nad dolną
częścią sceny LUB grid 55/45 scena+copy — wg makiety). <img> ''' + A + '''sc-final.webp (1536x1024, lazy,
cover, radius-lg, alt "Granatowy masażer Rozgrzewek na stoliku obok herbaty i koca, ciepła lampa"); firanka
w scenie = subtelny „oddech"/ruch tkaniny (CSS, @reduced-motion off; produkt statyczny). COPY: kręgi +
eyebrow „CIEPŁO ZATACZA KRĘGI" (użyj RINGS); H2 „Zrób miejsce na mały wieczorny <span class="swash">rytuał</span>.";
body .lead „Delikatne ciepło, wibracje i tryb EMS możesz ustawić na jednym z 9 poziomów i używać na wybranym
obszarze ciała."; cena <span class="display" data-price>84,90 zł</span> (var(--price-fs) 700); CTA
<a class="btn cta" data-checkout href="#zamow">Przejdź do zamówienia</a>; redukcja ryzyka .lead 13.5px
„Płatność przy odbiorze • 14 dni na zwrot".
MOBILE: scena na górze (~40vh cover, plik ''' + A + '''sc-final-mobile.webp 1024x1536) → kręgi+eyebrow →
H2 → body → cena → CTA full → redukcja ryzyka.
''')

ORDER = ['01-hero', '02-moment', '03-tryby', '04-glowica', '05-obszary',
         '06-autonomia', '07-zdjecia-kupujacych', '08-mid-cta', '09-faq', '11-final']


def call(section):
    cfg = S[section]
    bpath = 'briefing-%s.md' % section
    opath = 'out-%s.md' % section
    io.open(bpath, 'w', encoding='utf-8').write(
        cfg['brief'] + '\nID sekcji: <section id="%s">.\n' % cfg['sid'] + WSPOLNE)
    imgs = [M + i for i in cfg['imgs']]
    env = dict(os.environ, WF2_EFFORT='medium', WF2_MAXOUT='16000')
    for attempt in (1, 2, 3):
        r = subprocess.run([sys.executable, '../wf2gpt-call.py', bpath, opath] + imgs,
                           env=env, capture_output=True, text=True, timeout=590)
        if r.returncode == 0 and os.path.isfile(opath) and os.path.getsize(opath) > 500:
            return opath
        print('  [%s] call proba %d FAIL: %s' % (section, attempt, (r.stderr or r.stdout)[-240:]))
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
    hexy = set(h.upper() for h in re.findall(r'#[0-9A-Fa-f]{6}\b', sec))
    obce = hexy - DOZWOLONE
    if obce:
        print('  [%s] UWAGA obce hexy: %s' % (section, obce))
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
