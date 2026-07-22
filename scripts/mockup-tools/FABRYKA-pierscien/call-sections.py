# -*- coding: utf-8 -*-
"""F4 SKROLIK: briefy + calle gpt-5.6-sol dla sekcji 01..11 + wklejka w markery szkieletu.
Sekwencyjnie, retry x3 (wf2gpt-call ma fallback lokalny LL-051), walidacja hexow serii.
Wejscie wizyjne: makiety desktop+mobile. Moduly (wideo-rail/checkout/faq/galeria) wchodza
w MONTAZU pythonem - briefy tych sekcji buduja tylko kontener+copy."""
import io, os, re, subprocess, sys, time

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
A = PUB + 'bud-assets/skrolik/'
M = PUB + 'bud-assets/skrolik/makiety/'
IDX = r'c:/repos_tn/tn-crm/sklepy/rafal-hoffa/skrolik/index.html'
DOZWOLONE = {'#F8F1F0', '#F3E8E7', '#ECDCDB', '#FFFDFC', '#2B2025', '#6E5F63', '#E6D8D9',
             '#B4265C', '#971D49', '#FFFFFF', '#000000'}

WSPOLNE = '''
## KONTRAKT/ZAKAZY (wspólne serii SKROLIK)
- Sekcja wklejana w szkielet: istnieją tokeny :root (--paper/--paper-2/--paper-3/--card/--ink/
  --body/--line/--cta/--cta-hover/--cta-ink/--radius-lg/--radius-sm/--shadow-*/--s1..--s7/
  --content-w/--h1-d/--h1-m/--h2-d/--h2-m/--price-fs/--body-fs) i klasy globalne .wrap
  .sect-pad .eyebrow .h2 .lead .display .btn.cta .pill .sig .reveal. UŻYWAJ ich; style
  sekcyjne w scoped <style> z prefiksem sekcji.
- SKALA TYPOGRAFII ŻYWEJ (twarda): H1 var(--h1-d)/var(--h1-m), H2 = var(--h2-d)/var(--h2-m),
  cena var(--price-fs), body 17px. ⛔ ZERO clampów sekcyjnych powyżej tej skali.
- Kolory WYŁĄCZNIE tokenami; zero nowych hexów (poza rgba() cieni serii). Akcent MALINA
  TYLKO CTA/aktywne stany/łuki .sig/eyebrow. Ikony: inline SVG stroke 1.5px --ink.
- SYGNATURA: pierścienie sygnału .sig = inline <svg class="sig" viewBox="0 0 64 64"> z 2-3
  koncentrycznymi NIEPEŁNYMI łukami (path arc o rosnących promieniach), stroke var(--cta)
  1.5px, fill none, opacity .55; pozycjonowanie w klasie SEKCYJNEJ (np. .hr-sig), NIE w .sig.
  ⛔ Bez strzałek z grotem, bez calloutów, bez wielkich liczb.
- Zakazy treściowe (KARTA PRAWDY): ⛔ zero gwiazdek/liczb opinii/liczb sprzedaży, zero
  przekreśleń cen i zegarów, zero „24h"/„z Polski", zero ciemnych teł, ⛔ zero wyliczania
  systemów (iOS/Android/iPhone — wolno tylko „z telefonem i tabletem"), ⛔ zero „muzyki"
  i „podstawki", ⛔ zero mAh/zasięgu/czasu pracy/czasu ładowania, ⛔ scroll TYLKO pionowy
  (nigdy nie obiecuj przewijania w bok), zero claimów zdrowotnych, zero „premium".
- CENA: wyłącznie <span data-price>34,90 zł</span> (fallback zapieczony; runtime hydratuje).
- KAŻDE CTA: <a class="btn cta" data-checkout href="#zamow">Zamawiam Skrolika</a>.
- Obrazy: <img> z width/height (i CSS height:auto), loading="lazy" (poza hero), alt PL
  opisowy, radius var(--radius-lg). Dodawaj .reveal do głównych bloków.
- ⛔ NIE centruj transformem (kolizja z .reveal.in{transform:none}) — margin-inline:auto.
- NAJPIERW wypisz siatkę sekcji (wiersze/kolumny/wyrównania), POTEM kod.

## FORMAT ODPOWIEDZI
Krótka siatka, potem JEDEN blok ```html: WYŁĄCZNIE <section id="ID"> + scoped <style>
(+ scoped <script> IIFE tylko jeśli brief każe).
'''

S = {}
S['01-hero'] = dict(sid='hero', imgs=[M + '01-hero.webp', M + '01-hero-m.webp'], brief='''
# SEKCJA 01-hero (archetyp B — split 55/45: copy | scena)
Prefiks `.hr-`. UWAGA: topbar z lockupem już istnieje w szkielecie — NIE dubluj logo w hero.
Desktop grid 55/45 (align-items center, gap --s5), min-height ~78vh:
LEWA (na --paper): H1 .display (--h1-d): "Telefon stoi. Ty przewijasz kciukiem." (kropki jak
na makiecie), potem .lead: "Skrolik to mały pierścień-pilot Bluetooth: pionowe przewijanie,
kartkowanie ebooków i zdalna migawka — zakładasz na palec i klikasz kciukiem", potem CTA
<a class="btn cta" data-checkout href="#zamow">Zamawiam Skrolika</a> (duży, min-height 54px),
pod nim micro 13.5px --body: "Płatność online lub przy odbiorze · 14 dni na zwrot".
PRAWA: foto-karta .hr-media (radius-lg, shadow-md, overflow hidden, aspect-ratio 2/3,
max-height ~78vh): <img src="''' + A + '''sceny/sc-hero.webp" (eager, fetchpriority="high",
width/height 1100x1650, object-fit cover). W .hr-media zakotwiczony JEDEN .sig (pozycja
absolutna ~48%/38% nad pierścieniem — jak na makiecie łuki od pierścienia; klasa .hr-sig).
UWAGA: .hr-media to przyszły nośnik HERO-VIDEO — zostaw strukturę figure>img czystą.
Mobile (jak makieta mobile): stack: H1 → lead (2 linie) → foto-karta (aspect 4/5,
max-height ~46svh) → CTA full-width → micro. Wszystko w pierwszym ekranie + początek foto.
''')
S['02-demo'] = dict(sid='demo', imgs=[M + '02-demo.webp', M + '02-demo-m.webp'], brief='''
# SEKCJA 02-demo (TOR-I: symulacja "klik ▼ → feed zjeżdża")
Prefiks `.dm-`. .h2 centrowany: "Naciśnij i patrz, jak ekran sam przewija" (bez eyebrow).
Desktop dwie kolumny (gap --s6, align center):
LEWA: wektorowy telefon .dm-phone ZBUDOWANY W CSS (nie obraz): zaokrąglona ramka 2px --ink
radius 36px, tło --card, wewnątrz .dm-screen (overflow hidden, aspect ~9/16, max-width 300px)
z kolumną .dm-feed z CZTERECH kart-bloków (tło --paper-2, radius-sm, wys ~140px, wewnątrz
szary blok "zdjęcia" + 2 linie placeholdera --line) — feed przesuwany transformem.
PRAWA: duży cutout produktu <img src="''' + A + '''galeria/keep2-packshot-pink.webp"
width/height 600x600, max-width 320px> z .sig za nim (klasa .dm-sig), pod spodem okrągły
przycisk .dm-btn (56px, bg --cta, biały trójkąt ▼ SVG, shadow-md, cursor pointer,
focus-visible, aria-label "Przewiń symulowany ekran w dół") + caption 14px:
"Kliknij ▼ — treść zjeżdża w dół". Pod spodem mała nota .pill z ikoną pionowych strzałek:
"Przewijanie działa w pionie".
INTERAKCJA (scoped <script> IIFE): klik/Enter na .dm-btn → feed przesuwa się o JEDNĄ kartę
w górę (translateY, transition .45s var(--mo-ease)); po ostatniej karcie wraca płynnie na
start. Przycisk lekko "wciska się" (scale .94) na active. Bez autoplay.
Mobile: stack: h2 → cutout+przycisk+caption → telefon (max-width 260px) → nota.
''')
S['03-ekran-zostaje'] = dict(sid='ekran-zostaje', imgs=[M + '03-ekran-zostaje.webp', M + '03-ekran-zostaje-m.webp'], brief='''
# SEKCJA 03-ekran-zostaje
Prefiks `.ez-`. .h2 centrowany: "Nie sięgaj do ekranu po każdy kolejny fragment".
Desktop: DWIE równe foto-karty obok siebie (radius-lg, shadow-sm):
''' + A + '''sceny/sc-kanapa.webp (width/height 1536x1024) i ''' + A + '''sceny/sc-kuchnia.webp
(width/height 1536x1024). Pod każdą caption 14px --body centrowany: "Scrollujesz spod koca —
telefon stoi obok" / "Przepis przewijasz, nie dotykając ekranu". Przy każdej karcie mały .sig
w rogu (klasa .ez-sig, subtelnie nad zdjęciem przy pierścieniu — lewy-dol pierwszej,
srodek drugiej — jak na makiecie).
UWAGA: obie foto-karty to przyszłe nośniki ANIM — struktura figure>img czysta.
Mobile: stack karta → caption → karta → caption.
''')
S['04-ebooki'] = dict(sid='ebooki', imgs=[M + '04-ebooki.webp', M + '04-ebooki-m.webp'], brief='''
# SEKCJA 04-ebooki (na pasie --paper-2)
Prefiks `.eb-`. Desktop split (foto LEWA ~55%, copy PRAWA):
LEWA foto-karta: ''' + A + '''sceny/sc-ebook.webp (width/height 1200x1200, radius-lg).
NAD zdjęciem (absolutnie, przy pierścieniu ~40%/45%) JEDEN .sig (klasa .eb-sig) — scena
celowo BEZ wypalonych łuków, łuki daje layout.
PRAWA: eyebrow "EBOOKI", .h2: "Jeszcze jedna strona — jednym kliknięciem", body 2 linie:
"Kartkuj ebooki kciukiem, gdy telefon albo tablet stoi przed Tobą.", rząd 3 małych ikon
w kółkach 1px --line (książka / pionowe strzałki / dłoń z pierścieniem) z podpisami 12px.
Mobile: stack: eyebrow+h2 → foto → body → ikony.
''')
S['05-selfie'] = dict(sid='selfie', imgs=[M + '05-selfie.webp', M + '05-selfie-m.webp'], brief='''
# SEKCJA 05-selfie (lustrzany split względem 04)
Prefiks `.se-`. Desktop split (copy LEWA, foto PRAWA ~55%):
LEWA: eyebrow w pigułce malinowej (bg --cta, biały tekst 12px caps radius 999): "selfie
i nagrywanie", .h2: "Klik i gotowe ujęcie", body: "Ustaw telefon, stań w kadrze i zrób
zdjęcie albo start nagrania — kciukiem, z pierścienia.", rząd 3 ikon w kółkach (migawka /
kropka nagrywania wypełniona --cta / dłoń z pierścieniem).
PRAWA foto-karta: ''' + A + '''sceny/sc-selfie.webp (width/height 1536x1024, radius-lg,
shadow-sm) + mały .sig przy pierścieniu (klasa .se-sig).
Mobile: stack: pigułka+h2 → foto → body → ikony.
''')
S['06-kolory'] = dict(sid='kolory', imgs=[M + '06-kolory.webp', M + '06-kolory-m.webp'], brief='''
# SEKCJA 06-kolory (dowód formy — REALNE kadry z aukcji; galeria z lightboxem wejdzie w montażu)
Prefiks `.ko-`. .h2 centrowany: "Mniejszy niż kciuk. I w trzech kolorach."
Grid kafli (desktop: 1 szeroki + 3 mniejsze + karta spec; jak na makiecie):
- kafel SZEROKI (span 2, aspect 1/1 max-height 420px): <img ''' + A + '''galeria/keep1-trojpak.webp
  width/height 800x800> alt "Trzy kolory pierścienia: czarny, kremowy i różowy";
- kafel: keep2-packshot-pink.webp (600x600) alt "Różowy Skrolik — trzy przyciski";
- kafel: keep3-detal-port.webp (700x700) alt "Wpuszczone gniazdo ładowania w pierścieniu";
- kafel: keep4-detal-klips.webp (430x430) alt "Otwarty klips na palcu — kciuk na przyciskach";
- karta SPEC (near-white --card): prosty rysunek wymiarowy INLINE SVG (obrys klinowatego
  pierścienia liniami 1.5px --ink + strzałki wymiarowe --line) + tekst .display 20px:
  "3,0 × 2,8 × 1,3 cm" + linia body: "Zakładasz i nie przeszkadza".
Wszystkie kafle: radius-lg, tło --card, obrazy object-fit contain z paddingiem --s2 (kadry
mają własne białe tła — NIE cover!), loading lazy. Kontener kafli dostaje marker
<!--GALERIA--> jako komentarz PRZED gridem (lightbox wejdzie w montażu).
POD gridem centrowana linia .display 18px: "W tej ofercie: <b style="color:var(--cta)">kolor
różowy</b>" + małe kółko SVG (14px, fill var(--cta), opacity .45) jako swatch.
Mobile: kafel szeroki → rząd 2 małych → kafel klips → karta spec → linia oferty.
''')
S['07-wideo'] = dict(sid='wideo', imgs=[M + '07-wideo.webp', M + '07-wideo-m.webp'], brief='''
# SEKCJA 07-wideo (wzorzec 1-wideo; kafel wideo = MODUŁ w montażu)
Prefiks `.vd-`. Desktop dwie kolumny (kafel LEWA ~42%, copy PRAWA):
LEWA: kontener .vd-rail zawiera TYLKO komentarz <!--WIDEO-RAIL--> (moduł wideo-rail@1
z kaflem 9:16 wchodzi w montażu — NIE buduj kafla, NIE stylizuj .vid__*; zostaw pusty div).
Pod kontenerem linia 12px --body: "@hellozdvj8x" (atrybucja twórcy).
PRAWA: eyebrow "WIDEO" (z małą ikoną kamery), .h2: "Zobacz Skrolik w akcji", body:
"Jeden klip od twórcy — pierścień na palcu, klik kciukiem i ekran rusza.", CTA
<a class="btn cta" data-checkout href="#zamow">Zamawiam Skrolika</a>.
Mobile: stack: eyebrow+h2 → kontener wideo → atrybucja → body → CTA full-width.
''')
S['08-mid-cta'] = dict(sid='mid-cta', imgs=[M + '08-mid-cta.webp', M + '08-mid-cta-m.webp'], brief='''
# SEKCJA 08-mid-cta (konwersyjna, na pasie --paper-2)
Prefiks `.mc-`. JEDNA centrowana karta near-white (--card, radius-lg, shadow-md, max-width
880px, margin-inline auto), wewnątrz desktop 2 kolumny (foto 40% | treść):
LEWA: packshot <img ''' + A + '''galeria/keep2-packshot-pink.webp width/height 600x600,
max-width 300px> z .sig za produktem (klasa .mc-sig).
PRAWA: nazwa .display 24px "Skrolik", linia body: "Mały pierścień-pilot do telefonu —
w tej ofercie kolor różowy", cena <span data-price>34,90 zł</span> (var(--price-fs),
--font-display 700, --ink), CTA <a class="btn cta" data-checkout href="#zamow">Zamawiam
Skrolika</a> (full-width w kolumnie), micro 13.5px: "Płatność online lub przy odbiorze ·
14 dni na zwrot". NIC WIĘCEJ — jedna karta, jeden argument.
Mobile: stack w karcie: packshot (max-width 220px) → nazwa → linia → cena → CTA full → micro.
''')
S['09-zamow'] = dict(sid='zamow', imgs=[M + '09-zamow.webp', M + '09-zamow-m.webp'], brief='''
# SEKCJA 09-zamow (checkout inline — MODUŁ w montażu; wzorzec osadzenia Z KARTĄ PRODUKTU)
Prefiks `.zm-`. UWAGA KRYTYCZNA: sekcja <section id="zamow"> JUŻ ISTNIEJE w szkielecie
z atrybutami data-zc-* — Ty budujesz TYLKO wnętrze (bez zmiany atrybutów sekcji).
Nagłówek .h2 "Zamów Skrolika" (centrowany, margin-bottom --s4).
Grid .zm-grid: desktop `grid-template-columns: minmax(340px,.75fr) minmax(0,1.25fr)`,
gap --s4, align-items start:
LEWA karta produktu .zm-product-card (near-white --card, radius-lg, shadow-sm, position
sticky top var(--s3)): .zm-product-media z <img ''' + A + '''galeria/keep2-packshot-pink.webp
width/height 600x600> (contain, tło --card, radius-sm), potem .zm-product-info: nazwa
.display 20px "Skrolik — pierścień do przewijania", jedna linia 14px --body "Kolor: różowy ·
Bluetooth · zdalna migawka", cena <span data-price>34,90 zł</span> (--font-display 700 24px
--cta). ⛔ NIE buduj podsumowania zamówienia (zc-summary modułu zostanie tu PRZENIESIONE
w montażu — zostaw kartę otwartą na dole).
PRAWA kolumna .zm-checkout-card: TYLKO komentarz <!--CHECKOUT-INLINE--> (moduł formularza
steps wchodzi w montażu; NIE stylizuj .zc-*).
Mobile: karta produktu KOMPAKT (media 96px w wierszu z nazwą i ceną), grid 1 kolumna,
karta NAD formularzem, sticky OFF (position static).
''')
S['10-faq'] = dict(sid='faq', imgs=[M + '10-faq.webp', M + '10-faq-m.webp'], brief='''
# SEKCJA 10-faq
Prefiks `.fq-`. .h2 "Pytania i odpowiedzi" z krótkim malinowym podkreśleniem (element 44x3px
bg --cta pod nagłówkiem). Kontener karta near-white (radius-lg, shadow-sm, max-width 880px,
margin-inline auto) zawierający TYLKO komentarz <!--FAQ-ACCORDION--> (moduł faq-accordion@1
z pytaniami wchodzi w montażu — NIE buduj wierszy akordeonu).
Mobile: bez zmian (karta full-width).
''')
S['11-final'] = dict(sid='final', imgs=[M + '11-final.webp', M + '11-final-m.webp'], brief='''
# SEKCJA 11-final (FINAL CTA, na pasie --paper-3 edge-to-edge)
Prefiks `.fn-`. Centrowana karta near-white (--card, radius-lg, shadow-lg, max-width 760px,
margin-inline auto, padding --s5, text-align center):
packshot <img ''' + A + '''galeria/keep2-packshot-pink.webp width/height 600x600, max-width
240px, margin-inline auto> z .sig za produktem (klasa .fn-sig), H2 .display (--h2-d):
"Scrolluj, kartkuj i rób zdjęcia — jednym kciukiem", rząd .fn-pills: 3 pille ("Pionowy
scroll" ikona pionowych strzałek / "Ebooki" ikona książki / "Zdalna migawka" ikona migawki)
— pille z white-space:normal na mobile (LL: nowrap łamie 360px), CTA duży
<a class="btn cta" data-checkout href="#zamow">Zamawiam Skrolika za <span data-price>34,90
zł</span></a>, micro: "Płatność online lub przy odbiorze · 14 dni na zwrot".
Grid wewnętrzny karty: kolumny minmax(0,1fr) (⛔ nie sztywne — LL overflow).
Mobile: wszystko stack, CTA full-width, pille zawijane.
''')

ORDER = ['01-hero', '02-demo', '03-ekran-zostaje', '04-ebooki', '05-selfie', '06-kolory',
         '07-wideo', '08-mid-cta', '09-zamow', '10-faq', '11-final']


def call(section):
    cfg = S[section]
    bpath = 'briefing-%s.md' % section
    opath = 'out-%s.md' % section
    io.open(bpath, 'w', encoding='utf-8').write(cfg['brief'] + WSPOLNE)
    env = os.environ.copy()
    env['WF2_EFFORT'] = 'medium'
    env['WF2_MAXOUT'] = '9000'
    for attempt in (1, 2, 3):
        r = subprocess.run([sys.executable, '../wf2gpt-call.py', bpath, opath] + cfg['imgs'],
                           env=env, capture_output=True, text=True, timeout=880)
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
        # auto-korekta: koder bywa daje wlasne id (np. "02-demo", "final-cta") —
        # przemapuj KAZDE id pierwszego <section> na sid (takze w selektorach #id CSS/JS)
        m_id = re.search(r'<section id="([^"]+)"', sec)
        if m_id:
            zle = m_id.group(1)
            sec = sec.replace('<section id="%s"' % zle, '<section id="%s"' % cfg['sid'], 1)
            sec = re.sub(r'#%s(?![\w-])' % re.escape(zle), '#' + cfg['sid'], sec)
            sec = sec.replace('[id="%s"]' % zle, '[id="%s"]' % cfg['sid'])
            sec = sec.replace("getElementById('%s')" % zle, "getElementById('%s')" % cfg['sid'])
            sec = sec.replace('getElementById("%s")' % zle, 'getElementById("%s")' % cfg['sid'])
            print('  [%s] auto-fix id: %s -> %s' % (section, zle, cfg['sid']))
        else:
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
        print('  splice OK (%d B)' % n)
print('KONIEC')
