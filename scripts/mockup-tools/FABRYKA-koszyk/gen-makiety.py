# -*- coding: utf-8 -*-
"""Makiety ODSACZEK (F2): desktop 3:2 przez wf2-gen (medium), ref = styl-master (+packshot
gdy produkt w kadrze). Uzycie: python gen-makiety.py 01-hero [02-jeden-ruch ...] | all"""
import io, json, os, re, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out'); os.makedirs(OUT, exist_ok=True)
ENV = io.open(r'c:/repos_tn/tn-crm/.env', encoding='utf-8', errors='ignore').read()
SECRET = re.search(r'^WF2_GEN_SECRET=(.+)$', ENV, re.M).group(1).strip()
BASE = 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-gen'
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
G = PUB + 'bud-products/1005002491639276/'
STYL = PUB + 'bud-assets/odsaczek/brand/00-styl-master.webp'

DNA = ('STYLE-DNA: warm linen page #F4EFE5 with section bands #EDE6D8 and near-white cards '
       '#FFFCF6; ink #221E16, body #37322A, hairlines #DCD5C8; EXACTLY ONE accent bottle-green '
       '#176B3A only for CTA, active states and thin arc-arrows with small arrowheads (series '
       'signature, drawn as UI graphics over/next to photos, never baked into the photo itself); '
       'icons thin 1.5px outline in ink; display font Bricolage Grotesque (characterful geometric '
       'grotesque), text font Figtree; one series radius 14px; trust-pills card fill 1px hairline '
       'border ink text; soft warm sepia-tinted shadows, subtle grain on bands only; light '
       'backgrounds only. Polish diacritics correct. No watermarks, no phone frames, crisp UI. ')

PROD = ('The wire basket in every photo must faithfully match the real product reference image: '
        'bare silver stainless steel folding basket, open woven diamond mesh (no solid walls), '
        'crown of zigzag V-shaped wires around the rim, two wire handle arms joined by a flat '
        'hanger-shaped bridge, concentric wire rosette bottom with small center eye. ')

HEAD = ('High-fidelity DESKTOP landing page SECTION mockup on a 3:2 landscape board, section '
        'shown full-width like a real webpage fragment (~1280px design). Polish e-commerce, '
        'light warm linen background. ')

TASKS = {
 '01-hero': HEAD + PROD + (
    'HERO, archetype H = zoned stack adapted to desktop: TOP ZONE — wide photo band (~55% of '
    'board height): ordinary bright home kitchen, an adult hand lifts the silver folding wire '
    'basket FULL of golden French fries out of a black wok on the stove, clean pale oil drips '
    'back into the wok, gentle steam, warm daylight; one thin bottle-green arc-arrow with small '
    'arrowhead traces the upward trajectory over the photo (UI graphic). Small brand lockup '
    'top-left over the photo: tiny green pot-with-arc icon + "Odsączek" wordmark. MIDDLE ZONE '
    'on linen: huge display hook in Bricolage Grotesque ink: "Wyjmij całą porcję jednym ruchem" '
    'with a short Figtree subline "Składany koszyk ze stali nierdzewnej do smażenia w garnku '
    'lub woku — koniec łowienia frytek sztuka po sztuce". BOTTOM ZONE: near-white offer card '
    '(radius 14, warm sepia shadow, visible zone boundary): small product thumbnail, price '
    '"29,90 zł" big in ink, full-width DESIGNED bottle-green CTA button "Zamawiam Odsączek" '
    '(white text, radius 14), micro-copy row "Płatność online lub przy odbiorze · 14 dni na '
    'zwrot" and two trust pills "Stal nierdzewna", "Składa się na płasko". Three clear stacked '
    'zones with visible boundaries — photo, hook, offer.'),
 '02-jeden-ruch': HEAD + PROD + (
    'SECTION "jeden ruch" — the core argument against fishing fries out one by one. Header in '
    'Bricolage ink: "Koniec łowienia frytek sztuka po sztuce". Two equal photo cards side by '
    'side (radius 14): LEFT — the basket SUBMERGED in bubbling oil inside a steel pot on a home '
    'stove, fries frying INSIDE the basket, wire arms folded out to the sides; RIGHT — the same '
    'kitchen, the basket LIFTED above the pot with the whole golden portion inside, held by one '
    'hand at the joined handle bridge. ONE thin bottle-green arc-arrow curves from the left '
    'photo to the right photo (UI graphic between cards, small arrowhead). Under each photo a '
    'short Figtree caption: "Frytki smażą się w koszyku" / "Cała porcja w górę — jednym '
    'ruchem". Below: one body line "Nic nie zostaje na dnie garnka — wyjmujesz wszystko naraz." '
    'Bottom row: ONLY two trust pills "Płatność przy odbiorze" and "14 dni na zwrot" plus the '
    'green CTA "Zamawiam Odsączek". STRICT: no warranty text, no guarantee years, no ratings.'),
 '03-zawies': HEAD + PROD + (
    'SECTION "zawieś i odsącz". Header: "Zawieś. Niech ocieka nad garnkiem." Large photo card: '
    'close side view of the basket HANGING on the rim of a steel pot — the zigzag V-wire crown '
    'rests ON the pot rim, handle arms released and relaxed, golden fries inside, a few clean '
    'oil droplets falling from the mesh bottom INTO the pot, gentle steam; nobody holds it. '
    'A thin bottle-green arc-arrow points from the basket bottom into the pot (UI graphic). '
    'Right column on linen: three short Figtree lines with thin outline icons: "Korona z '
    'drutów opiera się o rant garnka", "Olej ocieka z powrotem do garnka", "Ręce wolne — '
    'nic nie trzymasz". No dimensions, no health claims.'),
 '04-zloz': HEAD + PROD + (
    'SECTION "złóż na płasko" — transformation. Header: "Po smażeniu składa się na płasko". '
    'Interactive-style comparison block on a near-white card: LEFT state — the basket fully '
    'EXPANDED (studio packshot on warm near-white, matching real reference); RIGHT state — the '
    'same basket FOLDED into a FLAT DISK (concentric wire circles rosette, top view). Between '
    'them a bottle-green toggle/slider control UI element (two labeled states "Rozłożony" / '
    '"Złożony") and one thin arc-arrow. Below: photo strip of a hand sliding the flat disk '
    'into an ordinary kitchen drawer among other utensils. Caption: "Płaski jak pokrywka — '
    'wsuwasz do szuflady".'),
 '05-durszlak': HEAD + PROD + (
    'SECTION "jak durszlak" — layout MUST DIFFER from photo-left/rail-right pattern: header '
    'CENTERED "Działa też jak durszlak" with one short Figtree line under it; below TWO photo '
    'cards side by side of EQUAL size: LEFT — basket full of cooked penne pasta rinsed under '
    'running tap in a bright sink, water streaming through the diamond mesh; RIGHT — same '
    'basket with fresh strawberries and grapes being rinsed, droplets falling. Under each card '
    'a one-line caption: "Odcedzisz makaron i warzywa" / "Opłuczesz owoce prosto w koszyku". '
    'One thin green arc-arrow linking the two cards. No side rail, no CTA in this section.'),
 '06-mycie': HEAD + PROD + (
    'SECTION "proste mycie". Header: "Mycie? Opłucz i gotowe". Photo card: EMPTY basket rinsed '
    'under a kitchen tap, water drops on the shiny steel mesh, hand tilting it; second smaller '
    'macro photo card: close-up of the clean diamond mesh weave and smooth wires with water '
    'droplets. Body line: "Gładka stal nierdzewna nie trzyma resztek — wystarczy opłukać pod '
    'bieżącą wodą." Bottom band: EXACTLY three feature items, verbatim: "Stal nierdzewna" / '
    '"Składa się na płasko" / "Mycie pod bieżącą wodą". STRICT: no dishwasher, no food-safety '
    'claims, no weight or lightness claims, no durability promises, no warranty.'),
 '07-mid-cta': HEAD + PROD + (
    'MID-CTA band on section band #EDE6D8: horizontal near-white offer card. LEFT: sequence of '
    'three small square photo thumbnails connected by thin bottle-green arc-arrows: basket in '
    'oil → basket lifted with fries → basket hanging on pot rim. RIGHT: display line "Smaż. '
    'Wyjmij. Zawieś." in Bricolage ink, price "29,90 zł" big, DESIGNED full bottle-green CTA '
    '"Zamawiam Odsączek" (white text, radius 14), micro-copy "Płatność online lub przy '
    'odbiorze · 14 dni na zwrot". Top strip: ONLY two pills "Płatność przy odbiorze" / "14 dni '
    'na zwrot". Bottom band: EXACTLY three items verbatim: "Stal nierdzewna" / "Do garnka '
    'i woka" / "Składa się na płasko". STRICT: no dishwasher, no deep-fryer, no plates, no '
    'durability promises, no warranty, no fat/health wording beyond "olej ocieka do garnka".'),
 '08-zamow': HEAD + PROD + (
    'CHECKOUT section. Header: "Zamów Odsączek". TWO-column layout: LEFT near-white product '
    'card — studio packshot of the expanded basket on warm near-white + small thumbnail of the '
    'folded flat disk, name "Odsączek", one-line "Składany koszyk ze stali nierdzewnej", price '
    '"29,90 zł" big in ink. RIGHT near-white checkout card: full-width outlined Figtree inputs '
    '(Imię i nazwisko, Telefon, Adres), two stacked payment radio cards "Płatność online" '
    '(selected: bottle-green border and dot) and "Przy odbiorze (za pobraniem)", full-width '
    'DESIGNED green CTA "Zamawiam i płacę" (white text radius 14), micro-copy "14 dni na '
    'zwrot" + slim grey payment badge row (BLIK, karty). No counters, no fake promos. Bottom band: EXACTLY four items verbatim: "Płatność przy '
    'odbiorze" / "14 dni na zwrot" / "Stal nierdzewna" / "Do garnka i woka". STRICT: no '
    '"talerzy", no dishwasher, no warranty.'),
 '09-faq': HEAD + (
    'FAQ section. Header: "Pytania przed zakupem". Five full-width accordion rows on '
    'near-white cards (radius 14) with thin "+" icons in ink, FIRST row expanded showing a '
    'short answer with a tiny photo thumbnail (basket in pot): rows: "Jak używać go w garnku '
    'lub woku?", "Jak zawiesić go na rancie garnka?", "Jak złożyć go na płasko?", "Czy działa '
    'jak durszlak?", "Jak zapłacić przy odbiorze?". Clean Figtree text, generous spacing, '
    'thin hairline separators.'),
 '10-final': HEAD + PROD + (
    'FINAL section. Display line centered: "Cała porcja. Jeden ruch. Zero łowienia." Wide '
    'photo card: the basket with golden chicken nuggets hanging on the rim of a steel pot on '
    'an ordinary counter with a wooden board in background, warm daylight. Below: price '
    '"29,90 zł", DESIGNED full bottle-green CTA "Zamawiam Odsączek" (white text radius 14), '
    'micro-copy "Płatność online lub przy odbiorze · 14 dni na zwrot", small brand lockup '
    '(green pot icon + Odsączek). One thin arc-arrow accent near the photo.'),
}

REF_PACKSHOT = {'01-hero', '02-jeden-ruch', '03-zawies', '04-zloz', '05-durszlak',
                '06-mycie', '07-mid-cta', '08-zamow', '10-final'}


def gen(section, tries=3):
    prompt = TASKS[section] + ' ' + DNA
    refs = [{'url': STYL, 'type': 'ref'}]
    if section in REF_PACKSHOT:
        refs.insert(0, {'url': G + 'g2.webp', 'type': 'product'})
    if section == '04-zloz':
        refs.insert(1, {'url': G + 'g3.webp', 'type': 'product'})
    payload = {'fn': 'generate-image', 'payload': {
        'prompt': prompt, 'count': 1, 'workflow_id': 'odsaczek-m-%s' % section,
        'type': 'mockup', 'provider': 'gpt-image-2', 'quality': 'medium',
        'aspect_ratio': '3:2', 'reference_images': refs}}
    body = json.dumps(payload).encode('utf-8')
    for attempt in range(1, tries + 1):
        try:
            req = urllib.request.Request(BASE, data=body, headers={
                'Content-Type': 'application/json', 'x-wf2-secret': SECRET})
            j = json.loads(urllib.request.urlopen(req, timeout=600).read().decode('utf-8'))
            url = (j.get('images') or [{}])[0].get('url')
            if not url:
                raise RuntimeError('no images: ' + json.dumps(j)[:200])
            data = urllib.request.urlopen(url, timeout=120).read()
            out = os.path.join(OUT, '%s.png' % section)
            open(out, 'wb').write(data)
            return out
        except Exception as e:
            print('  [%s] proba %d/%d FAIL: %s' % (section, attempt, tries, str(e)[:160]))
            if attempt == tries:
                raise
            time.sleep(10 * attempt)


args = sys.argv[1:]
todo = list(TASKS) if args == ['all'] else args
ok, fail = [], []
with ThreadPoolExecutor(max_workers=4) as ex:
    futs = {ex.submit(gen, s): s for s in todo}
    for f in as_completed(futs):
        s = futs[f]
        try:
            ok.append(f.result()); print('OK', s)
        except Exception as e:
            fail.append(s); print('FAIL', s, str(e)[:120])
print('GOTOWE: %d OK, %d FAIL %s' % (len(ok), len(fail), fail))
