# -*- coding: utf-8 -*-
"""Makiety SKROLIK (F2): desktop 3:2 przez wf2-gen (medium), ref = styl-master v2
(+packshot keep2 gdy produkt w kadrze; keep4 dla scen "jak siedzi na palcu").
Uzycie: python gen-makiety.py 01-hero [02-demo ...] | all"""
import io, json, os, re, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out'); os.makedirs(OUT, exist_ok=True)
ENV = io.open(r'c:/repos_tn/tn-crm/.env', encoding='utf-8', errors='ignore').read()
SECRET = re.search(r'^WF2_GEN_SECRET=(.+)$', ENV, re.M).group(1).strip()
BASE = 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-gen'
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
G = PUB + 'bud-assets/skrolik/galeria/'
STYL = PUB + 'bud-assets/skrolik/brand/styl-master.webp'

DNA = ('STYLE-DNA (match the style-master board reference): powder-rose page #F8F1F0 with '
       'near-white cards #FFFDFC; ink #2B2025 (warm rose-tinted near-black), body #6E5F63, '
       'hairlines #E6D8D9; EXACTLY ONE accent deep raspberry #B4265C used only for CTA, active '
       'states and thin incomplete concentric signal arcs radiating from interaction points '
       '(series signature, drawn as UI graphics over/next to photos, never physical objects); '
       'icons thin 1.5px outline in ink; display font Gabarito (friendly rounded geometric '
       'sans, ABSOLUTELY NOT monospace/typewriter, same family as button labels), text font '
       'Mulish; cards radius 18px, buttons full pill shape; soft low shadows; light backgrounds '
       'only. Polish diacritics correct. Top navigation links ENUMERATED VERBATIM when shown: '
       '"Jak działa", "Zastosowania", "FAQ" — NEVER "Opinie". No watermarks, crisp UI. ')

PROD = ('The ring product in every photo must faithfully match the real product reference '
        'image: pastel matte pink keystone-shaped ABS block (~3 x 2.8 x 1.3 cm) on an OPEN '
        'silicone C-shaped clip split underneath (never a closed ring band), EXACTLY three '
        'round slightly raised arrow buttons in ONE slanted line on the sloped top plate, '
        'buttons same pastel pink as body, one side with a long recessed rail. When worn: '
        'C-clip wrapped AROUND the index finger (finger passes through), block sits ON TOP of '
        'the finger, the SAME hand\'s thumb presses the buttons — ABSOLUTELY NOT pinched or '
        'held between fingertips. No screen on ring, no metal, no logos on product, no fourth '
        'button, no black or cream product in scenes (pink only), no cables, no charging dock. ')

HEAD = ('High-fidelity DESKTOP landing page SECTION mockup on a 3:2 landscape board, section '
        'shown full-width like a real webpage fragment (~1280px design). Polish e-commerce, '
        'light powder-rose background. ')

SCREEN = ('Any phone/tablet screens show ONLY heavily blurred neutral content blocks — no '
          'readable text, letters, numbers, no recognizable app UI, no logos. ')

TASKS = {
 '01-hero': HEAD + PROD + SCREEN + (
    'HERO, archetype B = split 55/45. Slim topbar above: tiny raspberry ring-glyph favicon + '
    '"Skrolik" wordmark left, nav links "Jak działa", "Zastosowania", "FAQ" right. LEFT 55% on '
    'flat powder-rose field: huge display hook in Gabarito ink "Telefon stoi. Ty przewijasz '
    'kciukiem.", short Mulish subline "Skrolik to mały pierścień-pilot Bluetooth: pionowe '
    'przewijanie, kartkowanie ebooków i zdalna migawka — zakładasz na palec i klikasz kciukiem", '
    'full pill deep-raspberry CTA "Zamawiam Skrolika" with white text, micro-copy row '
    '"Płatność online lub przy odbiorze · 14 dni na zwrot". RIGHT 45%: one tall photo card '
    '(radius 18, soft shadow): bright daytime living room, adult hand WEARING the pink ring '
    'remote on the index finger (clip wrapped around finger, thumb pressing middle button), '
    'smartphone propped against a pale sofa cushion slightly behind showing a blurred vertical '
    'feed; two thin raspberry concentric arcs radiate from the ring (UI graphic over photo). '
    'Clear split boundary between copy field and photo card.'),
 '02-demo': HEAD + PROD + SCREEN + (
    'INTERACTIVE DEMO SECTION "demo-scroll" (kodowa, TOR-I look). Header in Gabarito ink: '
    '"Naciśnij i patrz, jak ekran sam przewija". Layout: LEFT — a large flat vector-style '
    'phone mockup (simple ink outline frame, radius 18) whose screen shows 3 stacked neutral '
    'blurred content cards mid-scroll; RIGHT — a big clean cutout of the pink ring remote '
    '(three-quarter packshot view matching the reference) with a designed round raspberry '
    'demo button "▼" below it and caption "Kliknij ▼ — treść zjeżdża w dół" in Mulish; two '
    'thin raspberry concentric arcs radiate from the ring cutout toward the phone (UI '
    'graphic). Small honest note line: "Przewijanie działa w pionie". Light near-white '
    'section band, one raspberry accent only.'),
 '03-ekran-zostaje': HEAD + PROD + SCREEN + (
    'SECTION "ekran zostaje tam, gdzie stoi". Header Gabarito ink: "Nie sięgaj do ekranu po '
    'każdy kolejny fragment". Two equal photo cards side by side (radius 18): LEFT — bright '
    'daytime sofa, person framed shoulders-down under a light blanket, smartphone upright on '
    'a stand on a side table, hand with the pink ring resting on the blanket, thumb near '
    'buttons; RIGHT — bright kitchen counter, tablet propped showing a blurred recipe-like '
    'layout, one hand holding a ceramic bowl, the other wearing the pink ring clicking with '
    'thumb. Under each photo a short Mulish caption: "Scrollujesz spod koca — telefon stoi '
    'obok" / "Przepis przewijasz, nie dotykając ekranu". One thin raspberry arc accent at '
    'each ring (UI graphic).'),
 '04-ebooki': HEAD + PROD + SCREEN + (
    'SECTION "ebooki". Split: LEFT photo card — bright reading corner, pale armchair by a '
    'window, tablet on a stand showing a blurred ebook-like page (soft gray paragraph blocks, '
    'nothing readable), sharp foreground hand wearing the pink ring, thumb making a gentle '
    'press, two thin raspberry arcs from the ring; RIGHT on powder-rose field: header Gabarito '
    '"Jeszcze jedna strona — jednym kliknięciem", body Mulish "Kartkuj ebooki kciukiem, gdy '
    'telefon albo tablet stoi przed Tobą", small outline icons row (book, vertical arrows, '
    'finger with ring).'),
 '05-selfie': HEAD + PROD + SCREEN + (
    'SECTION "selfie i nagrywanie". Split mirrored: LEFT on powder-rose field: header Gabarito '
    '"Klik i gotowe ujęcie", body Mulish "Ustaw telefon, stań w kadrze i zrób zdjęcie albo '
    'start nagrania — kciukiem, z pierścienia", small outline icons (camera shutter, video '
    'record dot, finger with ring); RIGHT photo card — bright room beside a large window, '
    'smartphone vertical on a small tripod in the mid-ground, adult person farther away framed '
    'shoulders-down, raised hand with the pink ring in the MID-FOREGROUND large and sharp, '
    'thumb pressing, thin raspberry arcs from the ring.'),
 '06-kolory': HEAD + PROD + (
    'SECTION "mały i w 3 kolorach" — REAL PHOTO TILES layout (these will be replaced by real '
    'gallery photos in code; render them as realistic packshots). Header Gabarito ink: "Mniejszy '
    'niż kciuk. I w trzech kolorach." Grid: one WIDE tile — three ring remotes together (black '
    'front, ivory white and pink behind) on white background exactly like a product trio shot; '
    'three smaller tiles: macro of the three slanted buttons (pink), side view with recessed '
    'charging socket (ivory white), open C-clip worn on a finger (black); plus a small spec '
    'card: outline dimension diagram with "3,0 × 2,8 × 1,3 cm" and Mulish line "Zakładasz '
    'i nie przeszkadza". Below the grid a highlighted Mulish line: '
    '"W tej ofercie: kolor różowy" with a small pink color dot. Light band, radius 18 tiles.'),
 '07-wideo': HEAD + PROD + (
    'SECTION "wideo" — single vertical video tile (wzorzec 1-wideo). LEFT: one 9:16 video '
    'tile (radius 18, soft shadow) styled as a paused UGC clip: a gym treadmill console with '
    'a smartphone propped on it and EXACTLY ONE hand wearing the pink ring remote (all three '
    'buttons recognizable, thumb on the middle one) — no second hand anywhere in the frame; '
    'muted thumbnail with a big circular ink play button overlay and small caption chip below '
    'the tile: "Kciuk przewija feed — telefon stoi na konsoli bieżni"; small attribution line '
    '"@hellozdvj8x" under the tile. RIGHT on powder-rose: header Gabarito "Zobacz Skrolik w akcji", body '
    'Mulish "Jeden klip od twórcy — pierścień na palcu, klik kciukiem i ekran rusza", pill '
    'CTA "Zamawiam Skrolika". No star ratings, no view counts, no fake social proof.'),
 '08-mid-cta': HEAD + PROD + (
    'MID-CTA SECTION. Centered near-white offer card (radius 18, soft shadow) on powder-rose '
    'band: LEFT inside card — clean pink ring packshot three-quarter view (matching reference) '
    'with two thin raspberry arcs; RIGHT inside card — "Skrolik" Gabarito, one Mulish line '
    '"Mały pierścień-pilot do telefonu — w tej ofercie kolor różowy", big ink price "34,90 zł", '
    'full pill raspberry CTA "Zamawiam Skrolika" white text, micro-copy "Płatność online lub '
    'przy odbiorze · 14 dni na zwrot". Nothing else — one card, one argument. No crossed-out '
    'prices, no timers.'),
 '09-zamow': HEAD + PROD + (
    'CHECKOUT SECTION "zamow" — two-column layout per the factory pattern. Section header '
    'Gabarito ink: "Zamów Skrolika". LEFT narrow column (~40%): near-white PRODUCT CARD '
    '(radius 18, sticky look): pink ring packshot on top, product name "Skrolik — pierścień '
    'do przewijania" in Gabarito, price "34,90 zł", then ORDER SUMMARY rows inside the same '
    'card: "Produkt 34,90 zł", "Dostawa 9,99 zł", "Pobranie —", divider, bold "Razem 44,89 '
    'zł". RIGHT wide column (~60%): near-white FORM CARD with numbered steps stacked: "1 '
    'Kontakt" (fields E-mail, Telefon), "2 Adres" (Imię i nazwisko, Ulica, Kod, Miasto), '
    '"3 Dostawa" (radio cards: Kurier, Paczkomat), "4 Płatność" (radio cards: Płacę online, '
    'Przy odbiorze), full pill raspberry CTA "Zamawiam i płacę" white text, trust row with '
    'small payment badges and "14 dni na zwrot". Realistic form UI, Mulish labels, hairline '
    'inputs radius 12.'),
 '10-faq': HEAD + (
    'FAQ SECTION — accordion module look. Header Gabarito ink: "Pytania i odpowiedzi". '
    'Near-white card (radius 18) with 6 accordion rows, hairline separators, each row: small '
    'thin-outline pictogram + Mulish question + chevron; FIRST row expanded showing a short '
    'answer. Questions VERBATIM: "Czy działa z moim telefonem?", "Jak sparować pierścień?", '
    '"Czy przewija w bok?", "Jak się ładuje?", "Co jest w zestawie?", "Jak działa płatność '
    'przy odbiorze?". Expanded answer under the first: "Skrolik łączy się przez Bluetooth '
    'z telefonem i tabletem. Parujesz go raz — w ustawieniach Bluetooth." Tiny raspberry '
    'concentric arc accents at pictograms. One raspberry accent only, light band.'),
 '11-final': HEAD + PROD + (
    'FINAL CTA SECTION. Powder-rose band with subtle darker rose edge-to-edge field; centered '
    'near-white card (radius 18): clean pink ring packshot with thin raspberry arcs, Gabarito '
    'headline "Scrolluj, kartkuj i rób zdjęcia — jednym kciukiem", three small pill chips in '
    'one row: "Pionowy scroll", "Ebooki", "Zdalna migawka", big pill raspberry CTA "Zamawiam '
    'Skrolika za 34,90 zł" white text, micro-copy "Płatność online lub przy odbiorze · 14 dni '
    'na zwrot". Slim footer strip below the card: tiny lockup + links "Regulamin", "Polityka '
    'prywatności", "Kontakt".'),
}

REFS_SCENA = [{'url': STYL, 'type': 'ref'}, {'url': G + 'keep2-packshot-pink.webp', 'type': 'product'}]
REFS_UI = [{'url': STYL, 'type': 'ref'}]
REFS = {k: (REFS_UI if k == '10-faq' else REFS_SCENA) for k in TASKS}
REFS['06-kolory'] = [{'url': STYL, 'type': 'ref'}, {'url': G + 'keep1-trojpak.webp', 'type': 'product'}]


def gen(key):
    payload = {'fn': 'generate-image', 'payload': {
        'prompt': TASKS[key], 'count': 1, 'workflow_id': 'skrolik-makieta-' + key,
        'type': 'mockup', 'provider': 'gpt-image-2', 'quality': 'medium', 'aspect_ratio': '3:2',
        'reference_images': REFS[key]}}
    req = urllib.request.Request(BASE, data=json.dumps(payload).encode('utf-8'),
                                 headers={'Content-Type': 'application/json', 'x-wf2-secret': SECRET})
    j = json.loads(urllib.request.urlopen(req, timeout=600).read().decode('utf-8'))
    url = (j.get('images') or [{}])[0].get('url')
    if not url:
        return key, 'FAIL ' + json.dumps(j)[:200]
    data = urllib.request.urlopen(url, timeout=120).read()
    out = os.path.join(OUT, key + '.png')
    open(out, 'wb').write(data)
    return key, 'OK %d KB' % (len(data) // 1024)


keys = sys.argv[1:] or ['01-hero']
if keys == ['all']:
    keys = list(TASKS)
with ThreadPoolExecutor(max_workers=5) as ex:
    futs = {ex.submit(gen, k): k for k in keys}
    for f in as_completed(futs):
        k, msg = f.result()
        print(k, msg)
