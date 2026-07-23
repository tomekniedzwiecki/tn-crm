# -*- coding: utf-8 -*-
"""F4 ROZMROZIK: briefy + calle gpt-5.6-sol dla sekcji 01..10 + wklejka w markery szkieletu.
Sekwencyjnie, retry x3, walidacja hexow serii. Wejscie wizyjne: makiety desktop+mobile.
Poprawki krytyka F2 wbudowane: swash ZAWSZE 1 slowo; karta USB-C bez zblizen portu."""
import io, os, re, subprocess, sys, time

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
A = PUB + 'bud-assets/rozmrozik/assets/'
M = PUB + 'bud-assets/rozmrozik/makiety/'
IDX = r'c:/repos_tn/tn-crm/sklepy/patryk-skrzypniak/rozmrozik/index.html'
DOZWOLONE = {'#F2F7FA', '#EAF1F6', '#FFFFFF', '#232A31', '#2E3740', '#CFDCE6',
             '#E8590C', '#C64A06', '#9BB8CE', '#000000'}

WSPOLNE = '''
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
'''

S = {}
S['01-hero'] = dict(sid='hero', imgs=['01-hero.webp', '01-hero-mobile.webp'], brief='''
# SEKCJA 01-hero (archetyp F — dyptyk ZAMROŻONE|ROZMROŻONE)
Prefiks `.hr-`. Sekcja: <section id="hero" class="hr-hero hero"> (klasa .hero WYMAGANA — IO
sticky-buy). UWAGA: topbar z lockupem już istnieje w szkielecie — NIE dubluj logo w hero.
DESKTOP (≥900px): dwie kolumny. LEWA (~42%): eyebrow "PLAN AWARYJNY NA ZAMROŻONY OBIAD"
+ thaw; H1 .display (var(--h1-d)): "Mięso z zamrażarki nie musi rozwalać
<span class="swash">planu</span> na obiad."; sub .lead: "Połóż porcje na aluminiowej płycie,
przykryj je przezroczystą kopułą i uruchom elektryczny box jednym dotknięciem."; karta oferty
(--card, radius-lg, shadow-md): cena <span class="display hr-price" data-price>289,00 zł</span>
(var(--price-fs), 700) + CTA <a class="btn cta" data-checkout href="#zamow">Zamawiam
Rozmrozik</a> + micro 13.5px "Płatność przy odbiorze lub BLIK/online · 14 dni na zwrot"
+ marker <!--PAYBADGES--> (bez wrappera). Pod kartą PAS ZAUFANIA: 4 kafelki [ikona SVG | tekst]:
"4,2 L" (ikona miarki) / "4 steki lub 4 porcje ryby" (ikona steku) / "Start jednym dotknięciem"
(ikona palca) / "Ładowanie USB-C" (ikona wtyczki) — liczby w .display 700, kolor --ink.
PRAWA (~58%): DYPTYK w ramie edytorialnej (--card padding 12px radius-lg shadow-md): dwa
pionowe kadry obok siebie (grid 1:1, gap 8px):
kadr L = <picture>: source media="(max-width:899px)" ''' + A + '''sc-hero-frozen-800.webp,
img src=''' + A + '''sc-hero-frozen.webp (1024x1536, eager, fetchpriority="high", alt
"Zamrożony stek pokryty szronem na desce") + chip label "ZAMROŻONE" (biała pigułka, caps 11px,
dolny lewy róg); kadr P = <picture> analogicznie sc-hero-thawed-800/sc-hero-thawed (alt
"Rozmrozik z porcjami mięsa pod kopułą obok patelni") + chip "ROZMROŻONE". Oba obrazy
object-fit cover, aspect-ratio 4/5, radius-sm.
MOBILE (<900px) — kolejność MAKIETY mobile: dyptyk (2 kwadratowe kadry obok siebie, ~30%
wysokości ekranu) → eyebrow+thaw → H1 (var(--h1-m), 3 krótkie linie) → jedna linia benefit
.lead: "Połóż, przykryj kopułą, dotknij — gotowe." → karta oferty full-width (cena, CTA
full-width, micro-copy, PAYBADGES). Pas zaufania na mobile UKRYJ (redundancja z kartą).
''')
S['02-problem'] = dict(sid='problem', imgs=['02-problem.webp', '02-problem-mobile.webp'], brief='''
# SEKCJA 02-problem (typ A — scena full-bleed z polem copy; BEZ produktu w scenie)
Prefiks `.pb-`. Sekcja full-width bez .wrap na scenie.
DESKTOP: grid 5/7. LEWA kolumna (na płaskim tle --paper-2, wyrównana do .wrap): eyebrow
"16:30. KAŻDEMU SIĘ ZDARZA." + thaw; H2: "Zamrażarka pamięta. Ty nie
<span class="swash">musisz</span>."; lead: "Wracasz z pracy, rodzina pyta o obiad, a mięso
nadal jest twarde i pokryte szronem."; DWIE karty problemu (--card, radius-lg, border 1px
--line) [ikona SVG | tekst]: (ikona miski z parą) "Miska ciepłej wody zajmująca zlew?" /
(ikona mikrofali) "Mikrofala i brzegi, które zaczynają się gotować?"; puenta .lead 15px:
"Rozmrozik daje zamrożonym porcjom osobne miejsce: aluminiową płytę pod kopułą oraz tackę
ociekową zbierającą wodę."
PRAWA: scena <img> ''' + A + '''sc-problem.webp (1536x1024, lazy, alt "Miska ciepłej wody
z zamrożonym mięsem w zlewie, mikrofala w tle") full-bleed do prawej krawędzi viewportu,
wysokość 100% sekcji, object-fit cover; na styku z kolumną copy nakładka gradientowa
(linear-gradient w prawo od --paper-2 do transparent, ~120px) — szew niewidoczny.
MOBILE: scena na górze (~45vh, <img> ''' + A + '''sc-problem-900.webp 900px, cover, center),
u dołu sceny fade do --paper-2 (gradient overlay), potem copy: eyebrow+thaw → H2 → lead →
2 karty stacked → puenta.
''')
S['03-jak-dziala'] = dict(sid='jak-dziala', imgs=['03-jak-dziala.webp', '03-jak-dziala-mobile.webp'], brief='''
# SEKCJA 03-jak-dziala (TOR-I — 3 stany demonstracji; interakcja crossfade)
Prefiks `.jd-`. Eyebrow "TRZY RUCHY" + thaw; H2: "Połóż. Przykryj.
<span class="swash">Dotknij</span>."
DESKTOP: grid 7/12 + 5/12. LEWA duża SCENA-STAGE (--card padding 12px radius-lg shadow-md):
3 panele stanów crossfade (position absolute, opacity .38s var(--mo-ease)):
stan 1 = ''' + A + '''sc-demo-place.webp (alt "Dłoń kładzie zamrożoną porcję na aluminiowej
płycie"), stan 2 = ''' + A + '''sc-demo-cover.webp (alt "Dłonie nasadzają przezroczystą kopułę
na bazę"), stan 3 = ''' + A + '''sc-demo-touch.webp (alt "Palec dotyka panelu LED na module
kopuły"). Wszystkie 1536x1024, lazy, aspect-ratio 3/2, cover.
PRAWA: pionowy STEPPER — 3 wiersze-przyciski (button, role="tab", aria-selected; połączone
cienką pionową linią --line): każdy = numer w .display (1/2/3; aktywny: kwadrat --ink, cyfra
biała; nieaktywny: cyfra --ink na --card) + tytuł .display 700 ("Połóż"/"Przykryj"/"Dotknij")
+ 1 linia body: "Umieść zamrożone porcje na płycie ze stopu aluminium." / "Nałóż przezroczystą
kopułę PS ze ściętymi bokami." / "Uruchom urządzenie jednym dotknięciem panelu LED."
Aktywny wiersz przełącza scenę (scoped <script> IIFE: klik + klawiatura strzałki; stan 1
domyślny). Pod stepperem status-chip (--card, ikona check w --ink): "Urządzenie uruchomione."
— widoczny TYLKO gdy aktywny stan 3 (toggle klasą). Na dole tekstowy link w ink z
podkreśleniem: "Zobacz, ile mieści →" href="#pojemnosc" (NIGDY kolor --cta).
MOBILE: stack — header (eyebrow+thaw, H2) → scena-stage (aspect-ratio 4/3) → stepper pionowy
pod sceną (te same 3 wiersze, pełna szerokość, mini-thumbnail 64px danego stanu po prawej
wiersza) → status-chip → link.
''')
S['04-pojemnosc'] = dict(sid='pojemnosc', imgs=['04-pojemnosc.webp', '04-pojemnosc-mobile.webp'], brief='''
# SEKCJA 04-pojemnosc (dowód liczbowy; toggle steki/ryba)
Prefiks `.pj-`. Na pasie .band (--paper-2 + grain).
DESKTOP: grid 5/7. LEWA plakat typograficzny: eyebrow "MIEJSCE NA OBIAD" + thaw; H2: "Nie
jedna porcja. <span class="swash">Cztery</span>."; GIGANT .display 700: "4,2 L"
(clamp(72px,9vw,128px), --ink, data-countup) + pod nim rząd: "4 steki" / separator ukośnik
--cold / "4 porcje ryby" (.display 700 ~28px); body: "Komora o pojemności 4,2 L mieści
jednocześnie 4 steki lub 4 porcje ryby."; body 2: "Tacka ociekowa ABS zbiera wodę powstającą
podczas rozmrażania."; na dole caps spec strip 12px letter-spacing .08em --body:
"PŁYTA: STOP ALUMINIUM · KOPUŁA: PS · TACKA: ABS · ELEMENTY: NTC" (hairline top 1px --line).
PRAWA foto-karta (--card padding 12px radius-lg shadow-md): toggle pill (2 segmenty "Steki" /
"Ryba"; aktywny = fill --ink, tekst biały; NIGDY --cta; role="tablist", klawiatura) nad sceną;
STAGE crossfade 2 kadrów: ''' + A + '''sc-capacity-steak.webp (alt "Widok z góry: cztery steki
na perforowanej płycie") / ''' + A + '''sc-capacity-fish.webp (alt "Widok z góry: cztery porcje
ryby na perforowanej płycie"); 1536x1024, lazy, aspect-ratio 5/4, cover. Scoped <script> IIFE
toggle.
MOBILE: liczby najpierw (eyebrow+thaw → H2 → GIGANT 4,2 L → 4 steki / 4 porcje ryby → toggle
→ foto-karta → 2 linie body → spec strip zawinięty w 2 linie).
''')
S['05-funkcje'] = dict(sid='funkcje', imgs=['05-funkcje.webp', '05-funkcje-mobile.webp'], brief='''
# SEKCJA 05-funkcje (4 karty techniczne; cropy realne)
Prefiks `.fk-`. Eyebrow "CO WIEMY O URZĄDZENIU" + thaw; H2: "Funkcje nazwane bez cudownych
<span class="swash">obietnic</span>."
DESKTOP: grid 2x2 kart (--card radius-lg border 1px --line shadow-sm). Każda karta: kwadratowy
slot foto po lewej (128px, radius-sm, overflow hidden) + tytuł .display 700 20px + 1-2 linie
body 15px:
K1 foto ''' + A + '''fn-modul.webp (alt "Moduł z okrągłą kratką na kopule"): "Plasma Locking" —
"Moduł generatora plazmy opisany przez producenta jako „Plasma Locking"."
K2 foto ''' + A + '''fn-plyta.webp (alt "Perforowana płyta pod kopułą"): "UVC Antibacterial" —
"Lampa UVC o działaniu antybakteryjnym według producenta; bez obietnic medycznych."
K3 foto ''' + A + '''fn-panel.webp (alt "Panel dotykowy LED z owalnym przyciskiem"): "Panel
dotykowy LED" — "Owalny przycisk i panel dotykowy umożliwiają start jednym dotknięciem."
K4 foto ''' + A + '''fn-kopula.webp (alt "Krawędź kopuły i baza urządzenia"): "USB-C" —
"Urządzenie jest ładowane przez USB-C." (⛔ ŻADNEGO zbliżenia portu — slot pokazuje krawędź
kopuły/bazy, to celowe).
Pod gridem NOTA na pasie --paper-2 (radius-lg, ikona "i" w kółku stroke --ink): "Nie podajemy
mocy, skuteczności procentowej ani czasu rozmrażania, ponieważ dostępne materiały nie
zawierają takich danych."
MOBILE: karty stacked pionowo (slot foto 96px), nota na dole.
''')
S['06-wideo'] = dict(sid='wideo', imgs=['06-wideo.webp', '06-wideo-mobile.webp'], brief='''
# SEKCJA 06-wideo (rail 9:16 — mechanika = moduł fabryki w montażu!)
Prefiks `.wd-`. Eyebrow "ZOBACZ W PIONIE" + thaw; H2: "Pięć krótkich klipów. Jeden
<span class="swash">produkt</span>."; sub .lead: "Przesuń rail i odtwórz wybrany materiał."
Potem WYŁĄCZNIE marker:
<!--WIDEO-RAIL-->
(nic więcej — moduł wideo-rail@1 wchodzi w montażu; NIE koduj video/karuzeli/kropek!).
W scoped <style> przygotuj TYLKO skórkę pozycjonowania sekcji (padding, nagłówek).
Pod markerem tekstowy link w ink z podkreśleniem: "Przejdź do zamówienia →" href="#zamow"
(NIGDY --cta).
MOBILE: nagłówek → marker → link (rail sam odpowiada za scroll poziomy).
''')
S['07-mid-cta'] = dict(sid='mid-cta', imgs=['07-mid-cta.webp', '07-mid-cta-mobile.webp'], brief='''
# SEKCJA 07-mid-cta (konwersyjna; packshot na polu koloru)
Prefiks `.mc-`. Na pasie .band. SZEROKA karta --card (radius-lg, shadow-lg, overflow hidden,
position relative): GHOST typografia "4,2 L" (.display 700, ~180px, kolor --paper-2, position
absolute za treścią, prawy górny obszar, aria-hidden, z-index 0).
DESKTOP: LEWA kolumna (z-index 1): eyebrow "PLAN NA ZAMROŻONE PORCJE" + thaw; H2: "Daj
rozmrażaniu własne <span class="swash">miejsce</span>."; sub .lead: "Elektryczny box z komorą
4,2 L, dotykowym startem i tacką ociekową."; rząd: cena <span class="display" data-price>
289,00 zł</span> (var(--price-fs) 700) + CTA <a class="btn cta" data-checkout href="#zamow">
Zamawiam Rozmrozik</a>; micro 13.5px: "Płatność przy odbiorze lub BLIK/online · 14 dni na
zwrot". PRAWA: packshot <img> ''' + A + '''packshot-alpha.png (806x538, lazy, alt "Rozmrozik —
elektryczny box do rozmrażania, wariant czarny") na tle --paper-2 (koło/pole radius-lg).
MOBILE: stack — eyebrow+thaw → H2 → packshot (max 260px) → cena → CTA full → micro.
''')
S['08-faq'] = dict(sid='faq', imgs=['08-faq.webp', '08-faq-mobile.webp'], brief='''
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
''')
S['09-zamow'] = dict(sid='zamow', imgs=['09-zamow.webp', '09-zamow-mobile.webp'], brief='''
# SEKCJA 09-zamow (SKÓRKA checkoutu — mechanika = moduł fabryki w montażu!)
Prefiks `.zm-`. Eyebrow "ZAMÓWIENIE" + thaw; H2: "Rozmrozik".
DESKTOP: DWIE karty (grid 5/7):
LEWA karta produktu (--card, radius-lg, shadow-sm; sticky top 84px): packshot <img>
''' + A + '''packshot-alpha.png (lazy, alt "Rozmrozik — wariant czarny", max 320px, na polu
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
''')
S['10-final'] = dict(sid='final', imgs=['10-final.webp', '10-final-mobile.webp'], brief='''
# SEKCJA 10-final (domknięcie; scena wieczorna LEWA)
Prefiks `.fn-`. DESKTOP: grid 55/45. LEWA foto-karta (--card padding 12px radius-lg shadow-md):
<img> ''' + A + '''sc-final.webp (1536x1024, lazy, alt "Rozmrozik na blacie wieczorem, obok
patelnia i ręka odkładająca szczypce", aspect-ratio 3/2, cover, radius-sm).
PRAWA kolumna: eyebrow "NA KOLEJNE 16:30" + thaw; H2: "Każdemu zdarza się zapomnieć. Dobrze
mieć <span class="swash">plan</span>."; sub .lead: "Rozmrozik to osobny box do rozmrażania
z komorą 4,2 L, startem jednym dotknięciem i tacką zbierającą wodę."; cena <span
class="display" data-price>289,00 zł</span> (var(--price-fs) 700); CTA <a class="btn cta"
data-checkout href="#zamow">Wracam do zamówienia</a>; DWA chipy [ikona|tekst] (--card border
--line radius-sm): "Płatność przy odbiorze lub BLIK/online" (ikona paczki) / "14 dni na zwrot"
(ikona strzałki kołowej). Na samym dole zamykający caps wiersz 13px letter-spacing .12em
--body: "4,2 L · 4 STEKI" + thaw (hairline pod spodem pełnej szerokości kolumny).
MOBILE: stack — foto na górze (~40vh cover) → eyebrow+thaw → H2 → sub → cena → CTA full →
chipy (2 w rzędzie) → caps + thaw.
''')

ORDER = ['01-hero', '02-problem', '03-jak-dziala', '04-pojemnosc', '05-funkcje',
         '06-wideo', '07-mid-cta', '08-faq', '09-zamow', '10-final']


def call(section):
    cfg = S[section]
    bpath = 'briefing-%s.md' % section
    opath = 'out-%s.md' % section
    io.open(bpath, 'w', encoding='utf-8').write(
        cfg['brief'] + '\nID sekcji: <section id="%s">.\n' % cfg['sid'] + WSPOLNE)
    imgs = [M + i for i in cfg['imgs']]
    env = dict(os.environ, WF2_EFFORT='medium', WF2_MAXOUT='14000')
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
    clean = sec.replace('<!--CHECKOUT-INLINE-->', '').replace('<!--PAYBADGES-->', '') \
               .replace('<!--WIDEO-RAIL-->', '')
    if '-->' in clean:
        extra = re.findall(r'<!--.*?-->', clean, re.S)
        print('  [%s] komentarze w sekcji: %s' % (section, [e[:40] for e in extra]))
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
