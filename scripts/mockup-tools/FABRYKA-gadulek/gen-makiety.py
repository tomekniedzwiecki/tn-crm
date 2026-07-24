# -*- coding: utf-8 -*-
"""Makiety DESKTOP GADULEK — F2, 3:2. local HIGH -> fallback edge MEDIUM.
Brief CELU + PRAWDZIWE dane VERBATIM z KARTY (cena 89,90 zl, USP, specs, opinie).
Ref: prod-whole (fidelity, para blue+roz) / styl-master (styl). Copy = PLAN/PRZEWODNIK/KARTA.
Uzycie: python gen-makiety.py all | 01-hero 07-porownanie ..."""
import os, sys
from concurrent.futures import ThreadPoolExecutor, as_completed
import genlib as G
from common import DNA, PROD, ANAT, HEAD_D, EXCL

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
REFS = os.path.join(HERE, 'refs-cache')
PRODP = os.path.join(REFS, 'prod-whole.png')
STYL = os.path.join(HERE, 'brand', '00-styl-master.png')
PRODU = G.PUB + 'bud-assets/gadulek/refs/prod-whole.webp'
STYLU = G.PUB + 'bud-assets/gadulek/brand/00-styl-master.webp'

TOPBAR = ('Slim topbar on top: the "Gadulek" wordmark left (rounded Fredoka ink) and enumerated nav '
          'links right, EXACTLY these three: "Jak to dziala", "Zastosowania", "FAQ" — never "Opinie". ')

TASKS = {
 '01-hero': ('prod', HEAD_D + PROD + ANAT + TOPBAR + (
    'HERO, archetype H = a mobile-first VERTICAL ZONING hero shown on desktop as three stacked zones. '
    'ZONE 1 (top, the animated hero stage): a sunny backyard/garden, two happy children about 5-7 (a '
    'boy and a girl) a few metres apart, each holding one of the pastel walkie-talkies (one blue, one '
    'pink), each screen showing the OTHER child\'s smiling face (video call); a large leafy branch and '
    'tall grass in the foreground gently swaying. ZONE 2 (middle): a BIG rounded Fredoka H1 "Nie tylko '
    'sie slysza. Teraz sie widza." with a soft raspberry #C5265B underline-swash under the word '
    '"widza"; an ALL-CAPS Alegreya Sans eyebrow above it "ZABAWA, NA KTOREJ SIE WIDZA"; one Alegreya '
    'Sans subline "Gadulek to 2 krotkofalowki z ekranem 2,0 cala i kamera — rozmowa glosem i obrazem, '
    'bez WiFi i karty SIM." ZONE 3 (bottom): a rounded off-white mikro-offer CARD (radius 20, little '
    '"+" marks in corners, warm layered shadow): a small product-name line "Gadulek — krotkofalowki z '
    'ekranem i kamera"; the price "89,90 zl" BIG in Fredoka with "za 2 sztuki" beside it; a full-width '
    'raspberry #C5265B CTA button "Zamawiam 2 Gadulki — 89,90 zl" (white text, radius 12); a pay-row '
    '(BLIK / Visa / Mastercard / za pobraniem); then a row of four trust pills (cream fill, 1px '
    'hairline, ink text) "Platnosc przy odbiorze", "Zwrot 14 dni", "Wysylka z Polski", "Od 3 lat". '
    'No star ratings and no review numbers anywhere in the hero.')),

 '02-opinie': ('styl', HEAD_D + (
    'SECTION "opinie" — real Polish parent reviews, BELOW the fold, honest (a couple critical). '
    'Code-style on the cream page, framed cards only, NO product photography. Header: eyebrow ALL-CAPS '
    '"CO MOWIA RODZICE"; H2 in rounded Fredoka ink "Realne opinie — z plusami i minusami." with a soft '
    'raspberry swash under the single word "Realne"; a small summary line in Alegreya Sans with the '
    'ONLY star glyphs on the page in raspberry "★ 4,7 / 5 — 687 ocen, 93,4% pozytywnych". A masonry of '
    'FIVE quote cards (off-white, 1px hairline, radius 20, a little "+" corner mark), each a short '
    'Polish review in Alegreya Sans with a small raspberry star row and an anonymised name initial: '
    'card 1 "Moj 3-latek uwielbia. Prosta obsluga, od razu zlapal." — "Kasia"; card 2 "Obraz i kamera '
    'naprawde dobre jak na te cene. Dzieci sie widza i piszcza z radosci." — "Marcin"; card 3 "Male i '
    'lekkie, dobrze lezy w rece dziecka. Type-C to duzy plus." — "Ola"; card 4 (4 stars) "Ekran '
    'czytelny, dzwiek wyrazny — jest lekkie opoznienie, ale za te cene super." — "Piotr"; card 5 '
    '"Kupilam corce na urodziny, bawi sie z bratem po calym domu." — "Ania". Honest mix, no fake '
    '5-star wall. No CTA button.')),

 '03-jak-dziala': ('prod', HEAD_D + PROD + ANAT + (
    'SECTION "jak-dziala" — a "jak to dziala" 1-2-3 demonstrator (TOR-I: this mockup MUST show THREE '
    'STATES as separate step frames in a bright child\'s room, not one static card). Header: eyebrow '
    'ALL-CAPS "PROSTE JAK RAZ-DWA-TRZY"; H2 in rounded Fredoka ink "Wlacz, sparuje sie samo, gadaj i '
    'patrz." with a soft raspberry swash under the single word "samo"; one Alegreya intro line "Bez '
    'WiFi, bez karty SIM, bez ustawien." THREE step cards in a row, each a FRAME with an in-card step '
    'number ("01","02","03" in Fredoka — in-section numbering, NOT section numbering), radius 20: card '
    '01 photo = a child\'s hand sliding the power switch, both pastel screens lighting up, caption '
    '"Wlacz obie krotkofalowki"; card 02 photo = the two devices linked by a soft raspberry SIGNAL '
    'WAVE with a small badge "Ten sam kanal — polaczone", caption "Sparuja sie same"; card 03 photo = '
    'both screens showing children\'s faces and the big side talk button glowing, caption "Gadaj i '
    'widz drugie dziecko". Under the row a small ink note "Gotowe od razu — para w zestawie." Then a '
    'raspberry #C5265B CTA button "Chce zestaw dla dwojga". NEG: no WiFi symbol, no SIM tray.')),

 '04-zastosowania': ('prod', HEAD_D + PROD + ANAT + (
    'SECTION "zastosowania" — breadth of play worlds. Header: eyebrow ALL-CAPS "JEDEN PREZENT, WIELE '
    'ZABAW"; H2 in rounded Fredoka ink "Glos, obraz i smieszne glosy — w domu i na dworze." with a '
    'soft raspberry swash under the single word "obraz". Then a FIVE-tile photo MOSAIC (an uneven '
    'bento grid, tile 1 the LARGEST), always a pastel walkie-talkie with a live screen in each, a '
    'small ink caption chip: tile 1 (LARGEST) "Widza sie podczas rozmowy" (over-the-shoulder on one '
    'screen showing the other child\'s face); tile 2 "Podchody i chowany w ogrodzie" (a child peeking '
    'from behind a play tent, speaking into the device); tile 3 "Wolanie z pokoju do pokoju" (a child '
    'in a room, a mother in the background); tile 4 "Park lub kemping — bez WiFi/SIM" (a tent, grass, '
    'sunshine); tile 5 "Zabawa efektami glosu" (a laughing child, a small badge "potwor"). A small ink '
    'note under the mosaic "Glos, obraz i smieszne glosy — jeden prezent, wiele zabaw." Every tile is '
    'ONE scene only; no price, no stars, no benefit chips. No CTA button.')),

 '05-mid-cta': ('prod', HEAD_D + PROD + ANAT + (
    'SECTION "mid-cta" — a dedicated decision moment, full-bleed warm afternoon LIVING-ROOM scene with '
    'a designed CTA on a peach scrim. THE SCENE: two children on a rug, each holding a pastel '
    'walkie-talkie with the other child\'s face on the screen, a sheer curtain gently moving at a '
    'sunlit window, a leafy houseplant; warm cream/peach palette; generous flat peach space #FFE9DC on '
    'one side for the copy. Copy on the scrim: eyebrow ALL-CAPS "PREZENT NA JUZ"; H2 in rounded Fredoka '
    'ink "Dwa okienka do wspolnej zabawy. Jedna cena." with a soft raspberry swash under the single '
    'word "Jedna"; the price "89,90 zl" BIG in Fredoka in CHARCOAL ink #3C1F28 (NOT raspberry — '
    'raspberry is reserved ONLY for the CTA button and the swash) with "za 2 sztuki"; a full-width '
    'raspberry #C5265B CTA button "Wybieram kolory i zamawiam" (white text); directly under it a risk-reducer '
    'line "Mozesz zaplacic przy odbiorze • Zwrot 14 dni". No topbar, no star ratings.')),

 '06-anatomia': ('prod', HEAD_D + PROD + (
    'SECTION "anatomia" — an interactive packshot with hotspots (TOR-I: show the hotspot callouts as '
    'STATES on the mockup). Header: eyebrow ALL-CAPS "POZNAJ GADULKA"; H2 in rounded Fredoka ink '
    '"Wszystko, co maly odkrywca lubi." with a soft raspberry swash under the single word "odkrywca". '
    'A large clean 3/4 studio packshot of ONE pastel-BLUE walkie-talkie (screen showing a child\'s '
    'face) on a soft cream field, with thin ink hairline CALLOUT lines to FIVE labelled hotspots '
    '(each a small dot; the active one a raspberry ring): "Ekran 2,0 cala IPS", "Kamera", "Duzy '
    'przycisk rozmowy", "Ladowanie Type-C", "Antena". Below the packshot a small dimension line "ok. '
    '12,4 × 5,4 cm" in Alegreya Sans tabular numerals, and one fact chip "ABS — odporne na upadki". '
    'NEG: no hotspot suggesting a touchscreen, a SIM tray or waterproofing. No CTA button.')),

 '07-porownanie': ('prod', HEAD_D + PROD + (
    'SECTION "porownanie" — an honest THREE-column comparison table (code-style, cream card). Header: '
    'eyebrow ALL-CAPS "UCZCIWIE"; H2 in rounded Fredoka ink "Gadulek z ekranem vs reszta." with a soft '
    'raspberry swash under the single word "ekranem". A table with three column headers — LEFT '
    '"Gadulek z ekranem" (a tiny faithful thumbnail of the pastel-blue walkie-talkie with a screen '
    'next to the name), MIDDLE "Zwykla krotkofalowka" (a GENERIC grey walkie-talkie silhouette WITHOUT '
    'a screen — never the pastel Gadulek body), RIGHT "Telefon" (a neutral phone silhouette) — and '
    'rows, each with a thin ink OUTLINE check on the Gadulek side and a thin ink OUTLINE cross where '
    'it does not apply: row "Rozmowa glosem" -> all three check; row "Widza swoje twarze" -> only '
    'Gadulek check; row "2 sztuki w zestawie" -> only Gadulek check; row "Bez WiFi i SIM" -> Gadulek '
    'check, phone cross; row "Prosty start dla dziecka" -> Gadulek check. Then ONE honest minus row, '
    'plainly stated, no cross: "Opoznienie dzwieku" -> "Moze wystapic lekkie opoznienie ok. 1-2 s." A '
    'small ink note "Obraz 480P — czytelny do zabawy, nie jakosc premium." Accent only on the Gadulek '
    'checks. No CTA button, NO star ratings.')),

 '08-zdjecia-od-kupujacych': ('prod', HEAD_D + PROD + ANAT + (
    'SECTION "zdjecia-od-kupujacych" — a gallery of REAL buyer photos (UGC look: candid, hand-held '
    'phone-photo style, slightly imperfect, NOT studio). Header: eyebrow ALL-CAPS "OD PRAWDZIWYCH '
    'RODZICOW"; H2 in rounded Fredoka ink "Zdjecia od kupujacych." with a soft raspberry swash under '
    'the single word "kupujacych"; a small raspberry badge "Zdjecia od kupujacych". FOUR photo tiles '
    '(radius 20), candid UGC of the pastel walkie-talkies: tile 1 a child\'s hand holding a blue '
    'device with the screen ON showing a live camera view; tile 2 a hand holding a device with a '
    'colourful cartoon avatar on the screen; tile 3 the pair (blue + pink) with lanyards and a Type-C '
    'cable on a table; tile 4 the product retail box. A small descriptive ink caption under each (what '
    'is visible, not an invented story). No CTA button. NEG: not studio-perfect, no invented user '
    'quotes.')),

 '09-specyfikacja-zestaw': ('prod', HEAD_D + PROD + (
    'SECTION "specyfikacja-zestaw" — parameters and what is in the box (code-style, uneven bento). '
    'Header: eyebrow ALL-CAPS "KONKRETY"; H2 in rounded Fredoka ink "Parametry i zawartosc zestawu." '
    'with a soft raspberry swash under the single word "zestawu". An uneven BENTO of fact tiles, each '
    'a thin 1.9px ink OUTLINE icon + a BIG number-as-graphic in Fredoka + an Alegreya label: "Ekran '
    '2,0 cala IPS"; "Wideo 480P"; "Zasieg 100-400 m w otwartym terenie"; "Bateria 600 mAh — do 3-5 h '
    'zabawy"; "Ladowanie Type-C 1-2 h"; "ok. 12,4 × 5,4 cm"; and ONE tile with a crossed-out water '
    'drop icon "Nie jest wodoodporny". Then a small "W zestawie:" list with outline bullets "2× '
    'krotkofalowka Gadulek", "2× smycz", "2× kabel Type-C", "Instrukcja". A colours line: three color '
    'pair chips "2× niebieski", "niebieski + rozowy", "2× rozowy". No CTA button, no watts, no HD/4K.')),

 '10-faq': ('prod', HEAD_D + PROD + (
    'SECTION "faq" — an honest accordion with a small product slot. Header: eyebrow ALL-CAPS "ZANIM '
    'ZAMOWISZ"; H2 in rounded Fredoka ink "Pytania rodzicow." An accordion of SIX full-width rows '
    'separated by hairlines, each with a thin ink "+" / "−" chevron on the right; the FIRST row '
    'EXPANDED shows its question in Fredoka and its answer in Alegreya, the rest collapsed (question '
    'only). Questions VERBATIM: row 1 EXPANDED "Czy Gadulek potrzebuje WiFi albo karty SIM?" answer '
    '"Nie. Dwa urzadzenia lacza sie bezposrednio i paruja automatycznie na tym samym kanale."; row 2 '
    '"Jaki jest realny zasieg?"; row 3 "Czy obraz jest HD?"; row 4 "Jak dlugo dziala bateria?"; row 5 '
    '"Od ilu lat jest ta zabawka?"; row 6 "Jak place i czy moge zwrocic?". On the side a small clean '
    'packshot of the pastel-blue walkie-talkie on an off-white card with radius 20. Only thin ink '
    'plus/minus visuals. No CTA button.')),

 '11-zamow': ('prod', HEAD_D + PROD + (
    'SECTION "zamow" — an on-page checkout skin. Header: eyebrow ALL-CAPS "ZAMOWIENIE"; H2 in rounded '
    'Fredoka ink "Zamow Gadulka." Two columns 7/5. LEFT ~58% a form card (off-white, radius 20) with '
    'labelled white input fields (1px hairline, radius 12): "Imie i nazwisko", "Telefon", "E-mail", '
    '"Ulica i numer", "Kod pocztowy", "Miejscowosc"; ABOVE the fields a colour-pair SELECTOR of three '
    'buttons with small thumbnails "2× niebieski", "niebieski + rozowy" (selected, raspberry outline), '
    '"2× rozowy" — same price, all show "89,90 zl"; a payment choice with two pills "Platnosc przy '
    'odbiorze" (selected) and "BLIK / online". RIGHT ~42% a sticky summary card: a small clean pastel '
    'pair thumbnail, the name "Gadulek — 2 krotkofalowki z ekranem", a line "Cena: 89,90 zl za 2 '
    'szt.", a summary "Produkt: 89,90 zl", "Dostawa: kurier", "Razem"; a small merchant-info line '
    '"Sprzedawca: [firma] • [adres] • NIP [___]"; BELOW a full-width raspberry #C5265B CTA button '
    '"Zamawiam z obowiazkiem zaplaty" (white text) and under it "Platnosc przy odbiorze • Masz 14 dni '
    'na zwrot." Delivery and total visible BEFORE the button. NEG: no "darmowa dostawa", no delivery-'
    'time promise.')),

 '12-final': ('prod', HEAD_D + PROD + ANAT + (
    'SECTION "final" — a warm closing scene, life with the product, at DUSK in a GARDEN/backyard (NOT '
    'a living room). THE SCENE: close on two children\'s hands at dusk, each holding a pastel '
    'walkie-talkie with the other child\'s face on the screen; a warm string-light garland and tall '
    'grass in the foreground gently swaying; soft golden dusk light, cosy calm end-of-day mood, lots '
    'of soft negative space. Copy in the lower area on a cream scrim: eyebrow ALL-CAPS "WIECZOR PELEN '
    'ROZMOW"; H2 in rounded Fredoka ink "Podaruj im zabawe, na ktorej sie widza." with a soft '
    'raspberry swash under the single word "widza"; the price "89,90 zl" in Fredoka; a raspberry '
    '#C5265B CTA button "Podaruj im Gadulka — zamow 2-pak"; a risk-reducer line "89,90 zl • platnosc '
    'przy odbiorze • 14 dni na zwrot". Under it a minimalist footer strip with small ink links '
    '"Regulamin · Polityka prywatnosci · Dane sprzedawcy" (no shop name).')),
}


def refs_for(kind):
    if kind == 'prod':
        return [PRODP, STYL], [{'url': PRODU, 'type': 'product'}, {'url': STYLU, 'type': 'ref'}]
    return [STYL], [{'url': STYLU, 'type': 'ref'}]


def gen(section):
    kind, body = TASKS[section]
    prompt = body + EXCL + DNA
    local, edge = refs_for(kind)
    return G.generate(section, '%s.png' % section, prompt, local, edge, '3:2',
                      'gadulek-d-%s' % section)


args = sys.argv[1:]
todo = list(TASKS) if (not args or args == ['all']) else args
ok, fail = [], []
with ThreadPoolExecutor(max_workers=3) as ex:
    futs = {ex.submit(gen, s): s for s in todo}
    for f in as_completed(futs):
        s = futs[f]
        try:
            ok.append(f.result()); print('OK', s)
        except Exception as e:
            fail.append(s); print('FAIL', s, str(e)[:180])
print('GOTOWE desktop: %d OK, %d FAIL %s' % (len(ok), len(fail), fail))
