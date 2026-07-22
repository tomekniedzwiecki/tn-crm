# -*- coding: utf-8 -*-
"""F4 ODSACZEK: briefy + calle gpt-5.6-sol dla sekcji 01..10 + wklejka w markery szkieletu.
Sekwencyjnie, retry x3, walidacja hexow serii. Wejscie wizyjne: makiety desktop+mobile."""
import io, os, re, subprocess, sys, time

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
A = PUB + 'bud-assets/odsaczek/assets/'
M = PUB + 'bud-assets/odsaczek/makiety/'
IDX = r'c:/repos_tn/tn-crm/sklepy/rafal-hoffa/odsaczek/index.html'
DOZWOLONE = {'#F4EFE5', '#EDE6D8', '#E3DBC9', '#FFFCF6', '#221E16', '#37322A', '#DCD5C8',
             '#176B3A', '#115530', '#FFFFFF', '#000000'}

WSPOLNE = '''
## KONTRAKT/ZAKAZY (wspólne serii)
- Sekcja wklejana w szkielet: istnieją tokeny :root (--paper/--paper-2/--paper-3/--card/--ink/
  --body/--line/--cta/--cta-hover/--cta-ink/--radius-lg/--radius-sm/--shadow-*/--s1..--s7/
  --content-w/--h2-d/--h2-m/--price-fs/--body-fs) i klasy globalne .wrap .sect-pad .eyebrow .h2
  .lead .display .btn.cta .pill .arc .reveal. UŻYWAJ ich; style sekcyjne w scoped <style> z prefiksem.
- SKALA TYPOGRAFII ŻYWEJ (twarda): H2 = var(--h2-d) desktop / var(--h2-m) mobile (26-30px!),
  ceny var(--price-fs) 28-36px, body 17px. ⛔ ZERO clampów sekcyjnych powyżej tej skali.
- Kolory WYŁĄCZNIE tokenami; zero nowych hexów (poza rgba() ciepłych cieni serii).
  Akcent zieleń TYLKO CTA/aktywne stany/strzałki .arc. Ikony: inline SVG stroke 1.5px --ink.
- SYGNATURA: strzałka .arc = inline <svg class="arc" viewBox="0 0 120 60"> z ćwiartkowym łukiem
  + małym grotem, stroke var(--cta) 2px, fill none; pozycjonowanie w klasie SEKCYJNEJ
  (np. .jr-arc), NIE w .arc. Używaj tam, gdzie brief każe.
- Zero gwiazdek/liczb opinii, zero przekreśleń cen, zero „24h", zero ciemnych teł,
  ⛔ zero WYMIARÓW (cm/l), zero „zmywarki", zero gwarancji, zero claimów zdrowotnych
  („mniej tłuszczu" ZAKAZ; wolno OPISOWO „olej ocieka z powrotem do garnka").
- Obrazy: <img> z width/height (i CSS height:auto), loading="lazy" (poza hero), alt PL opisowy,
  radius var(--radius-lg). Dodawaj .reveal do głównych bloków.
- ⛔ NIE centruj transformem (kolizja z .reveal.in{transform:none}) — left/right/margin-inline.
- NAJPIERW wypisz siatkę sekcji, POTEM kod.

## FORMAT ODPOWIEDZI
Krótka siatka, potem JEDEN blok ```html: WYŁĄCZNIE <section id="ID"> + scoped <style> (+ scoped
<script> IIFE tylko jeśli brief każe).
'''

S = {}
S['01-hero'] = dict(sid='hero', imgs=['01-hero.webp', '01-hero-mobile.webp'], brief='''
# SEKCJA 01-hero (archetyp H — stos zoning'owy: kadr → hook → karta oferty)
Prefiks `.hr-`. UWAGA: topbar z lockupem już istnieje w szkielecie — NIE dubluj logo w hero.
STREFA 1 (kadr): pełnoszerokie foto ''' + A + '''sc-hero.webp (dłoń wynurza kosz frytek z woka;
eager loading, fetchpriority="high", width/height 1536x1024) w kontenerze .hr-media: desktop
wysokość ~56vh (object-fit cover, object-position center 30%), mobile ~42svh. Na kadrze JEDEN
.arc (łuk trajektorii w górę przy koszu, pozycja absolutna w .hr-media, desktop i mobile).
STREFA 2 (hook, na --paper): H1 .display (użyj --h1-d/--h1-m z :root): "Wyjmij całą porcję
jednym ruchem" + jedna linia .lead: "Składany koszyk ze stali nierdzewnej do smażenia w garnku
lub woku — koniec łowienia frytek sztuka po sztuce." (mobile: skróć do "Składany koszyk ze
stali — koniec łowienia frytek").
STREFA 3 (karta oferty, near-white --card, radius-lg, shadow-md, WYRAŹNA granica strefy,
na mobile lekko nachodzi na strefę 2 ujemnym marginesem jak makieta): rząd [miniatura =
''' + A + '''packshot-rozlozony.webp 120px radius-sm | kolumna: cena <span data-price>29,90 zł</span>
(--font-display 700, var(--price-fs)) + CTA <a class="btn cta" data-checkout href="#zamow">Zamawiam
Odsączek</a> + micro 13.5px "Płatność online lub przy odbiorze · 14 dni na zwrot"].
Obok/pod: 2 pille "Stal nierdzewna" (ikona tarczy) i "Składa się na płasko" (ikona dysku).
Mobile: karta full-width, CTA full-width; wszystkie 3 strefy W PIERWSZYM ekranie (fold!).
''')
S['02-jeden-ruch'] = dict(sid='jeden-ruch', imgs=['02-jeden-ruch.webp', '02-jeden-ruch-mobile.webp'], brief='''
# SEKCJA 02-jeden-ruch (rdzeń argumentu)
Prefiks `.jr-`. .h2: "Koniec łowienia frytek sztuka po sztuce" (bez eyebrow).
Desktop: DWIE równe foto-karty obok siebie: ''' + A + '''jr-A.webp (kosz zanurzony w garnku,
frytki smażą się W koszu) i ''' + A + '''jr-B.webp (ta sama kuchnia, kosz uniesiony z całą
porcją). MIĘDZY kartami JEDEN .arc (łuk z lewej karty do prawej). Pod każdą kartą caption
14px --body: "Frytki smażą się w koszyku" / "Cała porcja w górę — jednym ruchem".
Niżej jedna linia .lead centrowana: "Nic nie zostaje na dnie garnka — wyjmujesz wszystko naraz."
Na dole rząd: 2 pille ("Płatność przy odbiorze" ikona paczki, "14 dni na zwrot" ikona strzałki
kołowej) + CTA <a class="btn cta" data-checkout href="#zamow">Zamawiam Odsączek</a>.
Mobile: stack karta A → pionowy .arc → karta B → captiony pod kartami → lead → pille → CTA full.
''')
S['03-zawies'] = dict(sid='zawies', imgs=['03-zawies.webp', '03-zawies-mobile.webp'], brief='''
# SEKCJA 03-zawies (USP zawieszenia)
Prefiks `.zw-`. Eyebrow "ZAWIEŚ I ODSĄCZ", .h2: "Zawieś. Niech ocieka nad garnkiem."
Desktop: LEWA duża foto-karta (~60%) = ''' + A + '''sc-zawieszony.webp (kosz zawieszony koroną
na rancie garnka, nikt nie trzyma, krople wracają) + na foto-karcie JEDEN .arc (krótki łuk
od dna kosza w dół do garnka). PRAWA kolumna: 3 wiersze [ikona SVG w kwadratowej karcie
--card 64px | tekst 2 linie]: (ikona korony-zygzaka) "Korona z drutów opiera się o rant
garnka" / (ikona kropli) "Olej ocieka z powrotem do garnka" / (ikona dłoni) "Ręce wolne —
nic nie trzymasz". Na dole rząd: 2 pille (płatność/zwrot) + CTA jak w 02.
Mobile: stack foto → 3 wiersze → pille+CTA.
''')
S['04-zloz'] = dict(sid='zloz', imgs=['04-zloz.webp', '04-zloz-mobile.webp'], brief='''
# SEKCJA 04-zloz (TOR-I — interaktywny przełącznik transformacji)
Prefiks `.zl-`. .h2: "Po smażeniu składa się na płasko" (bez eyebrow).
INTERAKCJA (JEDEN przełącznik; makieta pokazuje OBA STANY dokumentacyjnie): duża karta
near-white ze STAGE: dwa panele stanu crossfade (opacity .38s var(--mo-ease)):
STAN A: packshot rozłożony = ''' + A + '''packshot-rozlozony.webp + label "Rozłożony";
STAN B: packshot płaskiego dysku = ''' + A + '''packshot-plaski.webp + label "Złożony".
Segmented control (2 pigułki: "Rozłożony" / "Złożony"; aktywna = zieleń fill + biały tekst;
role="tablist", aria-selected, obsługa klawiatury; scoped <script> IIFE). Na karcie JEDEN
.arc między stanami. POD kartą pas-karta: foto ''' + A + '''sc-szuflada.webp (dłoń wsuwa
płaski dysk do szuflady) + obok tekst .display ~22px: "Płaski jak pokrywka — wsuwasz do
szuflady" + 3 małe ikony outline (garnek/kropla/dysk).
Na dole rząd: 2 pille (płatność/zwrot) + CTA. Mobile: stack toggle+stage → pas szuflady → CTA.
''')
S['05-durszlak'] = dict(sid='durszlak', imgs=['05-durszlak.webp', '05-durszlak-mobile.webp'], brief='''
# SEKCJA 05-durszlak (drugie zastosowanie; BEZ CTA, BEZ raila — układ centrowany)
Prefiks `.du-`. .h2 CENTROWANY: "Działa też jak durszlak" + .lead centrowany: "Koszyk z siatki
pozwala szybko odcedzić makaron, warzywa i owoce — bez przekładania do innego naczynia."
DWIE równe foto-karty obok siebie: ''' + A + '''dur-mak.webp (makaron pod kranem) i
''' + A + '''dur-owoce.webp (owoce pod kranem). Pod każdą caption: "Odcedzisz makaron
i warzywa" / "Opłuczesz owoce prosto w koszyku". Między kartami mały .arc.
Mobile: stack karta → karta, captiony pod.
''')
S['06-mycie'] = dict(sid='mycie', imgs=['06-mycie.webp', '06-mycie-mobile.webp'], brief='''
# SEKCJA 06-mycie
Prefiks `.my-`. Eyebrow "PROSTE MYCIE" (z małą ikoną kropli), .h2: "Mycie? Opłucz i gotowe".
Desktop: LEWA kolumna tekstowa: body 2-3 linie: "Gładka stal nierdzewna nie trzyma resztek —
wystarczy opłukać pod bieżącą wodą." + mały .arc dekoracyjny; ŚRODEK foto-karta =
''' + A + '''myc-glowna.webp (pusty kosz pod kranem); PRAWA węższa foto-karta =
''' + A + '''myc-makro.webp (makro splotu siatki).
Na dole PAS (band --paper-2, full-width sekcji) z DOKŁADNIE trzema itemami [ikona | tekst]:
"Stal nierdzewna" (tarcza) / "Składa się na płasko" (dysk) / "Mycie pod bieżącą wodą" (kropla).
Mobile: stack tekst → foto główna → makro → pas (3 wiersze).
''')
S['07-mid-cta'] = dict(sid='mid-cta', imgs=['07-mid-cta.webp', '07-mid-cta-mobile.webp'], brief='''
# SEKCJA 07-mid-cta (konwersyjna, na tle --paper-2)
Prefiks `.mc-`. Sekcja na pasie --paper-2. SZEROKA karta near-white (radius-lg, shadow-lg):
LEWA połowa: sekwencja TRZECH kwadratowych mini-kadrów (radius-sm, ~150px): ''' + A + '''jr-A.webp
(caption "w oleju") → ''' + A + '''jr-B.webp ("wyjmij") → ''' + A + '''sc-zawieszony.webp
("zawieś"); MIĘDZY kadrami dwa małe .arc. PRAWA kolumna: .display 700 (~26px): "Smaż. Wyjmij.
Zawieś.", cena <span data-price>29,90 zł</span> (var(--price-fs)), CTA <a class="btn cta"
data-checkout href="#zamow">Zamawiam Odsączek</a>, micro 13.5px: "Płatność online lub przy
odbiorze · 14 dni na zwrot".
Mobile: stack mini-kadry (3 w rzędzie, mniejsze) → display → cena → CTA full → micro.
''')
S['08-zamow'] = dict(sid='zamow', imgs=['08-zamow.webp', '08-zamow-mobile.webp'], brief='''
# SEKCJA 08-zamow (SKÓRKA checkoutu — mechanika = moduł fabryki w montażu!)
Prefiks `.zm-`. Sekcja renderuje: .h2 "Zamów Odsączek" + DWIE karty:
LEWA karta produktu (near-white, radius-lg): packshot = ''' + A + '''packshot-rozlozony.webp
(duży), w rogu mała miniatura ''' + A + '''packshot-plaski.webp (96px, radius-sm, border 1px
--line, caption "składa się na płasko"), nazwa "Odsączek" .display 700, linia "Składany koszyk
ze stali nierdzewnej", cena <span data-price>29,90 zł</span> (var(--price-fs)).
PRAWA karta checkout (near-white, radius-lg, shadow-lg): wewnątrz WYŁĄCZNIE marker:
<!--CHECKOUT-INLINE-->
(nic więcej — moduł fabryki wchodzi w montażu; NIE koduj pól formularza ani radiów!).
W scoped <style> przygotuj SKIN dla modułu wg makiety (selektory na przyszłej zawartości):
inputy = tło --card, border 1px --line, radius-sm, focus border --cta; radio-karty płatności =
border 1px --line radius-sm, wybrana = border --cta + kropka --cta; przycisk submit = jak
.btn.cta full-width (radius-lg); drobny tekst "14 dni na zwrot" 13px.
Pod kartami marker <!--PAYBADGES--> (bez wrappera). Na dole pas 4 itemów [ikona|tekst]:
"Płatność przy odbiorze" / "14 dni na zwrot" / "Stal nierdzewna" / "Do garnka i woka".
Mobile: stack karta produktu (kompakt: thumb+nazwa+cena) → karta checkout → pas.
''')
S['09-faq'] = dict(sid='faq', imgs=['09-faq.webp', '09-faq-mobile.webp'], brief='''
# SEKCJA 09-faq (moduł faq-accordion@1 — mechanika NIETYKALNA, tu treść+skórka)
Prefiks `.fq-`. Eyebrow "FAQ", .h2: "Pytania przed zakupem" + .lead "Wszystko, co warto
wiedzieć przed zamówieniem." Obok nagłówka (desktop) 2 pille: płatność/zwrot.
Akordeon: 7 pozycji, KAŻDA: <details class="fq-item"><summary>PYTANIE<span class="fq-x"
aria-hidden="true"></span></summary><div class="fq-a">ODPOWIEDŹ</div></details> — ikona +/−
rysowana CSS-em (dwie kreski 1.5px --ink, obrót przy open; NIGDY zieleń), karta --card border
1px --line radius-lg, animacja max-height. PIERWSZA pozycja OTWARTA (atrybut open) z małą
miniaturą ''' + A + '''jr-A.webp (120px, radius-sm) obok odpowiedzi.
PYTANIA+ODPOWIEDZI (fakty TYLKO z tych danych; ⛔ zero wymiarów, zmywarki, blanszowania):
1. "Jak używać go w garnku lub woku?" → "Rozłóż koszyk, włóż do garnka lub woka z olejem
i smaż frytki, nuggetsy czy placki bezpośrednio w nim. Po smażeniu unieś całość za spięte
uchwyty — cała porcja wychodzi jednym ruchem."
2. "Jak zawiesić go na rancie garnka?" → "Korona z zygzakowatych drutów opiera się o krawędź
garnka. Zawieś koszyk po wyjęciu z oleju — ocieka prosto do garnka, a Ty masz wolne ręce."
3. "Jak złożyć go na płasko?" → "Po umyciu złóż koszyk — zwija się w płaski dysk, który
wsuniesz do szuflady jak pokrywkę."
4. "Czy działa jak durszlak?" → "Tak. Odcedzisz w nim makaron i warzywa albo opłuczesz owoce
pod bieżącą wodą — woda swobodnie przepływa przez siatkę."
5. "Jak go myć?" → "Gładka stal nierdzewna nie trzyma resztek. Wystarczy opłukać koszyk pod
bieżącą wodą i osuszyć."
6. "Jak zapłacić przy odbiorze?" → "W zamówieniu wybierz opcję «Przy odbiorze (za pobraniem)»
— płacisz kurierowi przy dostawie."
7. "Jak działa zwrot 14 dni?" → "Masz 14 dni na zwrot bez podawania przyczyny. Napisz do nas,
odeślij produkt i otrzymasz zwrot pieniędzy."
Desktop: 1 kolumna max 860px. Mobile: 1 kolumna.
''')
S['10-final'] = dict(sid='final', imgs=['10-final.webp', '10-final-mobile.webp'], brief='''
# SEKCJA 10-final (domknięcie + CTA)
Prefiks `.fn-`. Układ CENTRALNY: .h2 (wyśrodkowany, użyj .display): "Cała porcja. Jeden ruch.
Zero łowienia." Pod spodem SZEROKA foto-karta = ''' + A + '''sc-final.webp (kosz z nuggetsami
zawieszony na rancie garnka; radius-lg) + na niej JEDEN .arc (łuk w górę przy koszu).
Pod kartą rząd/karta oferty: cena <span data-price>29,90 zł</span> (var(--price-fs)),
CTA <a class="btn cta" data-checkout href="#zamow">Zamawiam Odsączek</a>, obok 2 pille
"Płatność online lub przy odbiorze" / "14 dni na zwrot".
Na samym dole mały lockup: <img> favicon-256 (''' + PUB + '''bud-assets/odsaczek/brand/favicon-256.png,
28px) + "Odsączek" żywy tekst --font-display 700 (separator 1px --line).
Mobile: stack h2 → foto → cena → CTA full → pille → lockup.
''')

ORDER = ['01-hero', '02-jeden-ruch', '03-zawies', '04-zloz', '05-durszlak',
         '06-mycie', '07-mid-cta', '08-zamow', '09-faq', '10-final']


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
    if '-->' in sec.replace('<!--CHECKOUT-INLINE-->', '').replace('<!--PAYBADGES-->', ''):
        extra = re.findall(r'<!--.*?-->', sec, re.S)
        print('  [%s] komentarze w sekcji: %s' % (section, [e[:40] for e in extra]))
    hexy = set(re.findall(r'#[0-9A-Fa-f]{6}\b', sec))
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
