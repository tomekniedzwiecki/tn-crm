# -*- coding: utf-8 -*-
"""F4: briefy + calle gpt-5.6-sol dla sekcji 02..10 + wklejka w markery szkieletu.
Sekwencyjnie (stabilnosc edge), retry x2, walidacja hexow serii po kazdej sekcji."""
import io, json, os, re, subprocess, sys, time

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)
A = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/'
IDX = r'c:/repos_tn/tn-crm/sklepy/rafal-hoffa/ugniatek/index.html'
DOZWOLONE = {'#EEF1F2', '#E6EBEC', '#DCE2E4', '#FBFCFC', '#14211F', '#26312F', '#CBD5D8',
             '#0B6B64', '#07554F', '#FFFFFF', '#000000'}

WSPOLNE = '''
## KONTRAKT/ZAKAZY (wspólne serii)
- Sekcja wklejana w szkielet: istnieją tokeny :root (--paper/--paper-2/--paper-3/--card/--ink/
  --body/--line/--cta/--cta-hover/--cta-ink/--radius-lg/--radius-sm/--shadow-*/--s1..--s7/
  --content-w/--h2-d/--body-fs) i klasy globalne .wrap .sect-pad .eyebrow .h2 .lead .display
  .btn.cta .pill .callout .reveal. UŻYWAJ ich; style sekcyjne w scoped <style> z prefiksem klas.
- Kolory WYŁĄCZNIE tokenami; zero nowych hexów (poza rgba() chłodnych cieni serii).
  Akcent petrol TYLKO CTA/aktywne stany. Ikony: inline SVG stroke 1.5px currentColor (--ink).
- Zero gwiazdek/liczb opinii, zero przekreśleń cen, zero „24h", zero ciemnych teł sekcji.
- Obrazy: <img> z width/height, loading="lazy", alt PL opisowy, radius var(--radius-lg).
- Dodawaj .reveal do głównych bloków.
- NAJPIERW wypisz siatkę sekcji, POTEM kod.

## FORMAT ODPOWIEDZI
Krótka siatka, potem JEDEN blok ```html: WYŁĄCZNIE <section id="ID"> + scoped <style>.
'''

S = {}
S['02-dwie-formy'] = dict(sid='dwie-formy', imgs=['ugniatek-m-dwie-formy-annotated.png',
                                                  'ugniatek-m-dwie-formy-mobile-annotated.png'], brief='''
# SEKCJA 02-dwie-formy (TOR-I — interaktywny przełącznik dwóch form użycia)
Prefiks klas `.df-`. Nagłówek: eyebrow "DWIE FORMY", .h2: "Jedna płaska forma. Dwa sposoby użycia."
+ .lead: "Używaj tak, jak Ci wygodnie — dociskaj oburącz lub połóż i oprzyj się."
INTERAKCJA (⚠ JEDEN przełącznik, nie dwa panele naraz — makieta pokazuje OBA STANY tylko
dokumentacyjnie!): segmented control z dwoma pigułkami: "Dociskam oburącz" / "Kładę i opieram się";
aktywna = petrol fill + biały tekst; przełączanie crossfade (opacity .38s var(--mo-ease)) między
DWOMA panelami stanu; aria-selected + role="tablist"; działa też z klawiatury; JS w scoped
<script> (IIFE, bez globali poza init).
STAN A: rząd [foto | karta stref]: foto = ''' + A + '''assets/df-A.webp (dłonie na obu uchwytach,
docisk do uda); karta stref = near-white .df-card z PROSTĄ sylwetką człowieka PRZÓD jako inline
SVG (outline 1.5px --ink) + 4 markery (kropka --ink + hairline + label): "kark", "barki", "uda",
"łydki". Caption pod: "Dociskasz urządzenie oburącz tam, gdzie sięgasz."
STAN B: rząd [foto | karta]: foto = ''' + A + '''assets/df-B.webp (między lędźwiami a sofą);
sylwetka TYŁ z markerami: "plecy", "lędźwie". Caption: "Kładziesz Ugniatka i opierasz się —
masuje ciężar ciała."
MOBILE (makieta 2): segmented control full-width, stack foto→karta stref→caption.
''')
S['03-anatomia'] = dict(sid='anatomia', imgs=['ugniatek-m-anatomia-v2-annotated.png',
                                              'm-03-anatomia-mobile-annotated.png'], brief='''
# SEKCJA 03-anatomia (sygnaturowa — techniczne calloutsy)
Prefiks `.an-`. Eyebrow "ANATOMIA", .h2: "Sześć głowic pod kontrolą dwóch uchwytów."
+ .lead: "Przemyślana konstrukcja, w której każdy element ma swoje zadanie."
Layout desktop: LEWA duża karta (.an-stage, --card, radius-lg): obraz REALNEGO spodu =
''' + A + '''assets/an-spod.webp + 4 CALLOUTSY jako pozycjonowane absolutnie elementy
(hairline 1px --ink + kropka 4px + label 12.5px): "2 zintegrowane uchwyty" (lewy-górny,
wskazuje uchwyt), "6 kulowych głowic" (prawy-górny), "powierzchnia robocza do 22 300 mm²"
(lewy-dolny), "centralne podświetlenie 630–650 nm" (dolny-środek, wskazuje pole diod).
Pozycje calloutów w % kontenera; na mobile calloutsy przechodzą w LISTĘ pod obrazem
(kropka+hairline+label w wierszach — jak makieta mobile).
PRAWA kolumna: karta z ''' + A + '''assets/ze-profil.webp + callout "płaski owal — 11 cm";
pod nią karta-pas z ''' + A + '''assets/an-makro.webp + caption "Ciepłe czerwone podświetlenie
w centrum spodu" (⛔ zero claimów efektów).
''')
S['04-sterowanie'] = dict(sid='sterowanie', imgs=['ugniatek-m-sterowanie-annotated.png',
                                                  'm-04-sterowanie-mobile-annotated.png'], brief='''
# SEKCJA 04-sterowanie
Prefiks `.st-`. Eyebrow "STEROWANIE", .h2: "Wybierz tryb i poziom intensywności."
+ .lead: "Pełna kontrola masażu dopasowana do Ciebie."
Desktop: LEWA foto-karta = ''' + A + '''assets/st-panel.webp + callout "wyświetlacz + 3 przyciski";
PRAWA karta-tabela (4 wiersze; ⚠ lewa kolumna = SAMA etykieta, prawa = SAMA wartość — bez
duplikowania wartości w etykiecie): [ikona kropki-tryby | "Tryby pracy" | "9 (P1–P9)"],
[ikona słupków | "Poziomy intensywności" | "1–9"], [ikona baterii | "Praca / ładowanie USB" |
"do 2 h / ok. 3,5 h"], [ikona zegara | "Auto-stop" | "po 10 min"]. Wartości --font-display 700.
Pod tabelą rząd 2 pille: "Bezprzewodowy" (ikona fal), "Akumulator 2000 mAh" (ikona baterii).
Mobile: stack foto→tabela→pille (makieta 2).
''')
S['05-wieczorem'] = dict(sid='wieczorem', imgs=['ugniatek-m-wieczorem-annotated.png',
                                                'm-05-wieczorem-mobile-annotated.png'], brief='''
# SEKCJA 05-wieczorem (scenowa, BEZ akcentu petrol — sekcja bez CTA)
Prefiks `.wi-`. Eyebrow "TWÓJ MOMENT", .h2: "Twój moment po całym dniu."
+ .lead: "Bez przewodu, bez umawiania się — w domu, kiedy chcesz."
Desktop: LEWA duża foto-karta (55%) = ''' + A + '''assets/wi-biurko.webp + callout "docisk oburącz";
PRAWA kolumna: mniejsza foto-karta = ''' + A + '''assets/wi-trening.webp, pod nią karta korzyści
z 2 wierszami (ikona outline + tekst): "Po pracy:" b + "kark, barki, lędźwie" /
"Po treningu:" b + "uda i łydki".
Mobile: stack duża foto→mała foto→karta korzyści.
''')
S['06-mid-cta'] = dict(sid='mid-cta', imgs=['06-mid-cta-annotated.png',
                                            'm-06-mid-cta-mobile-annotated.png'], brief='''
# SEKCJA 06-mid-cta (konwersyjna)
Prefiks `.mc-`. SZEROKA karta near-white (--card, radius-lg, shadow-lg) na tle --paper-2:
LEWA połowa = ''' + A + '''assets/packshot-34.webp (packshot na polu mgły);
PRAWA kolumna (tekst PO PRAWEJ): .display 700 ~34px: "Dwie formy masażu. Jedno urządzenie.",
cena <span data-price>189,00 zł</span> (--font-display 700 ~44px), CTA:
<a class="btn cta" data-checkout href="#zamow">Zamawiam Ugniatka</a>, micro 13.5px:
"Płatność online lub przy odbiorze · 14 dni na zwrot".
Mobile: stack packshot→tekst→cena→CTA full-width→micro (makieta 2).
''')
S['07-zestaw'] = dict(sid='zestaw', imgs=['07-zestaw-annotated.png',
                                          'm-07-zestaw-mobile-annotated.png'], brief='''
# SEKCJA 07-zestaw
Prefiks `.ze-`. Eyebrow "ZESTAW", .h2: "Co dokładnie dostajesz".
Desktop: LEWA foto-karta = ''' + A + '''assets/ze-flatlay.webp + callout "komplet w pudełku";
PRAWA karta-tabela spec (4 wiersze, etykieta | wartość --font-display 700): "Wymiary" |
"28 × 16,5 × 11 cm"; "Waga" | "1113 g"; "Moc" | "10 W"; "Certyfikaty" | "CE · RoHS · FCC".
Pod tabelą pas-karta: ''' + A + '''assets/ze-profil.webp z bocznym wymiarem "11 cm"
(pionowa hairline + label — element kodowy, nie na obrazie).
Mobile: stack flat-lay→tabela→profil.
''')
S['08-zamow'] = dict(sid='zamow', imgs=['08-zamow-annotated.png',
                                        'm-08-zamow-mobile-annotated.png'], brief='''
# SEKCJA 08-zamow (SKÓRKA checkoutu — mechanika = moduł fabryki w montażu!)
Prefiks `.zm-`. Sekcja renderuje: nagłówek .h2 "Zamów Ugniatka" (krótko) + DUŻĄ kartę
near-white (radius-lg, shadow-lg, max 720px): wewnątrz górny rząd [miniatura produktu =
''' + A + '''assets/packshot-34.webp 96px radius-sm | "Ugniatek" .display 700 |
<span data-price>189,00 zł</span> .display 700] a POD nim WYŁĄCZNIE marker:
<!--CHECKOUT-INLINE-->
(nic więcej w karcie — moduł fabryki checkout-inline wchodzi tam w montażu; NIE koduj pól
formularza ani radiów!). W scoped <style> przygotuj SKIN dla modułu wg makiety (selektory
działające na przyszłej zawartości karty): inputy = tło --card, border 1px --line, radius-sm,
focus border --cta; radio-karty płatności = border 1px --line radius-sm, wybrana = border --cta
+ kropka --cta; przycisk submit = jak .btn.cta full-width; drobny tekst "14 dni na zwrot" 13px.
Pod kartą marker <!--PAYBADGES--> (bez wrappera).
''')
S['09-faq'] = dict(sid='faq', imgs=['09-faq-annotated.png',
                                    'm-09-faq-mobile-annotated.png'], brief='''
# SEKCJA 09-faq (moduł faq-accordion@1 — mechanika NIETYKALNA, tu tylko treść+skórka)
Prefiks `.fq-`. Eyebrow "FAQ", .h2: "Pytania przed zakupem". Akordeon: 10 pozycji, KAŻDA:
<details class="fq-item"><summary>PYTANIE<span class="fq-x" aria-hidden="true"></span></summary>
<div class="fq-a">ODPOWIEDŹ</div></details> — ikona +/− rysowana CSS-em (dwie kreski 1.5px --ink,
obrót przy open; NIGDY petrol), karta --card border 1px --line radius-lg, animacja max-height.
PYTANIA+ODPOWIEDZI (fakty TYLKO z tych danych):
1. "Czym różnią się dwie formy użycia?" → "Ugniatka używasz na dwa sposoby: chwytasz za oba
uchwyty i dociskasz głowice tam, gdzie sięgasz (kark, barki, uda, łydki), albo kładziesz go na
sofie czy podłodze i opierasz się plecami lub lędźwiami — wtedy masuje ciężar ciała."
2. "Na jakich partiach ciała mogę go używać?" → "Docisk oburącz: kark, barki, uda, łydki.
Forma leżąca: plecy i lędźwie."
3. "Jak zmieniam tryby i intensywność?" → "Na bocznym panelu masz wyświetlacz i trzy przyciski.
Wybierasz jeden z 9 trybów (P1–P9) i jeden z 9 poziomów intensywności."
4. "Ile trwa praca i ładowanie?" → "Akumulator 2000 mAh wystarcza na do 2 h pracy. Ładowanie
przez USB trwa około 3,5 h."
5. "Jak działa auto-stop?" → "Urządzenie samo wyłącza się po 10 minutach sesji — możesz je
po prostu włączyć ponownie."
6. "Czym jest czerwone podświetlenie?" → "W centrum spodu znajduje się pole diod świecących
ciepłym czerwonym światłem (630–650 nm). To cecha konstrukcji — przyjemny, ciepły akcent
podczas masażu."
7. "Co znajdę w zestawie?" → "Masażer, kabel USB do ładowania, instrukcję obsługi i pudełko."
8. "Jakie są wymiary i waga?" → "28 × 16,5 × 11 cm i 1113 g — płaska forma, którą łatwo
położyć na sofie albo zabrać w torbie."
9. "Jak zapłacić przy odbiorze?" → "W zamówieniu wybierz opcję «Przy odbiorze (za pobraniem)»
— płacisz kurierowi przy dostawie."
10. "Jak działa zwrot 14 dni?" → "Masz 14 dni na zwrot bez podawania przyczyny. Napisz do nas,
odeślij produkt i otrzymasz zwrot pieniędzy."
Desktop: 2 kolumny (5+5) jak makieta; mobile: 1 kolumna.
''')
S['10-final'] = dict(sid='final', imgs=['10-final-annotated.png',
                                        'm-10-final-mobile-annotated.png'], brief='''
# SEKCJA 10-final (domknięcie + CTA)
Prefiks `.fn-`. Układ CENTRALNY: .h2 (wyśrodkowane): "Dociskaj tam, gdzie sięgasz. Oprzyj się
tam, gdzie trudniej." Pod spodem packshot = ''' + A + '''assets/packshot-34.webp (max 560px,
wyśrodkowany) + callout "6 kulowych głowic" (⛔ BEZ „360°" — to fake-spec). Rząd 2 mini-kadrów
(muted, radius-lg, ~260px): ''' + A + '''assets/df-A.webp (docisk oburącz) i
''' + A + '''assets/wi-biurko.webp (użycie przy lędźwiach). Cena <span data-price>189,00 zł</span>
(--font-display 700 ~40px), CTA <a class="btn cta" data-checkout href="#zamow">Zamawiam
Ugniatka</a>, micro: "Płatność online lub przy odbiorze · 14 dni na zwrot".
Mobile: stack nagłówek→packshot→mini-kadry (2 obok siebie)→cena→CTA full-width→micro.
''')

ORDER = ['02-dwie-formy', '03-anatomia', '04-sterowanie', '05-wieczorem',
         '06-mid-cta', '07-zestaw', '08-zamow', '09-faq', '10-final']


def call(section):
    cfg = S[section]
    bpath = 'briefing-%s.md' % section
    opath = 'out-%s.md' % section
    io.open(bpath, 'w', encoding='utf-8').write(
        cfg['brief'] + '\nID sekcji: <section id="%s">.\n' % cfg['sid'] + WSPOLNE)
    imgs = [A + 'ir/' + i for i in cfg['imgs']]
    env = dict(os.environ, WF2_EFFORT='medium', WF2_MAXOUT='12000')
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
        print('OK', s, n, 'znakow', flush=True)
    else:
        print('OK call', s, os.path.getsize('out-%s.md' % s), 'B', flush=True)
print('DONE')
