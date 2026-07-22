# -*- coding: utf-8 -*-
"""Pary MOBILE makiet SKROLIK (F2.4: mobile WSZYSTKICH sekcji, projekt OD ZERA pod 390px).
Ref: makieta desktop (tresc, z bud-assets/skrolik/makiety/) + styl-master v2 (styl). 2:3 medium.
Uzycie: python gen-mobile.py all | 01-hero ..."""
import io, json, os, re, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out'); os.makedirs(OUT, exist_ok=True)
ENV = io.open(r'c:/repos_tn/tn-crm/.env', encoding='utf-8', errors='ignore').read()
SECRET = re.search(r'^WF2_GEN_SECRET=(.+)$', ENV, re.M).group(1).strip()
BASE = 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-gen'
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
MAK = PUB + 'bud-assets/skrolik/makiety/'
STYL = PUB + 'bud-assets/skrolik/brand/styl-master.webp'

DNA = ('STYLE-DNA: powder-rose page #F8F1F0, near-white cards #FFFDFC; ink #2B2025, body '
       '#6E5F63, hairlines #E6D8D9; ONE accent deep raspberry #B4265C (CTA, active states, '
       'thin incomplete concentric signal arcs); icons 1.5px outline ink; display Gabarito '
       '(rounded geometric, NOT monospace), text Mulish; cards radius 18px, buttons full pill; '
       'soft low shadows; light backgrounds only. Polish diacritics correct. Crisp mobile UI, '
       'no watermarks, no phone frame. ')

HEAD = ('High-fidelity MOBILE landing SECTION mockup, 390px-wide phone layout on a 2:3 portrait '
        'board. Image 1 = the DESKTOP mockup of this exact section: CONTENT source — keep the '
        'SAME copy, photos and component styles, redesigned into ONE narrow column FOR PHONE '
        '(not a squeezed desktop). Image 2 = style reference ONLY — never copy its tiles onto '
        'the page. Output shows ONLY this one section. ')

TASKS = {
 '01-hero': ('MOBILE HERO (archetype B adapted to stack): tiny lockup + hamburger row; big '
    'hook "Telefon stoi. Ty przewijasz kciukiem." (EXACTLY 2-3 lines, tight leading, Gabarito '
    'ink); ONE SHORT Mulish subline (max 2 lines): "Mały pierścień-pilot: scroll, ebooki '
    'i migawka — klikasz kciukiem"; then the hero photo card (hand WEARING pink ring, propped '
    'phone with blurred feed, thin raspberry arcs) ~45%% of board height; then full-width pill '
    'raspberry CTA "Zamawiam Skrolika" + micro-copy "Płatność online lub przy odbiorze · 14 '
    'dni na zwrot". Everything inside the frame with breathing room.'),
 '02-demo': ('Stack: header "Naciśnij i patrz, jak ekran sam przewija"; big ring cutout with '
    'round raspberry demo button "▼" and caption "Kliknij ▼ — treść zjeżdża w dół"; below it '
    'the flat vector phone mockup with 3 blurred content cards mid-scroll; thin raspberry arcs '
    'from ring toward phone; honest note "Przewijanie działa w pionie".'),
 '03-ekran-zostaje': ('Stack: header "Nie sięgaj do ekranu po każdy kolejny fragment"; TWO '
    'stacked photo cards (sofa/blanket scene with propped phone; kitchen scene with tablet '
    'recipe and bowl) with short captions under each: "Scrollujesz spod koca — telefon stoi '
    'obok" / "Przepis przewijasz, nie dotykając ekranu".'),
 '04-ebooki': ('Stack: header "Jeszcze jedna strona — jednym kliknięciem"; photo card (reading '
    'corner, armchair, tablet with blurred ebook page, hand with pink ring, raspberry arcs); '
    'body line "Kartkuj ebooki kciukiem, gdy telefon albo tablet stoi przed Tobą"; small '
    'icons row (book, vertical arrows, finger with ring).'),
 '05-selfie': ('Stack: header "Klik i gotowe ujęcie"; photo card (bright window, phone on mini '
    'tripod, person shoulders-down farther away, raised hand with pink ring large in '
    'mid-foreground, raspberry arcs); body line "Ustaw telefon, stań w kadrze i klik — '
    'zdjęcie albo start nagrania"; icons row (shutter, record dot, finger with ring).'),
 '06-kolory': ('Stack: header "Mniejszy niż kciuk. I w trzech kolorach."; wide photo tile '
    '(three rings trio: black, ivory, pink); row of two smaller tiles (buttons macro pink / '
    'side socket ivory); one tile (open C-clip worn, black); small spec card with dimension '
    'diagram "3,0 × 2,8 × 1,3 cm" + line "Zakładasz i nie przeszkadza"; highlighted line '
    '"W tej ofercie: kolor różowy" with pink dot.'),
 '07-wideo': ('Stack: header "Zobacz Skrolik w akcji"; ONE vertical 9:16 video tile (paused '
    'UGC look: treadmill console with propped smartphone, hand with rings; big circular ink '
    'play button; caption chip "Kciuk przewija feed — telefon stoi na konsoli bieżni"; '
    'attribution "@hellozdvj8x"); below body line "Jeden klip od twórcy — pierścień na palcu, '
    'klik kciukiem i ekran rusza" + pill raspberry CTA "Zamawiam Skrolika". No ratings, no '
    'view counts.'),
 '08-mid-cta': ('Stack: near-white offer card: pink ring packshot with thin raspberry arcs; '
    '"Skrolik" Gabarito + line "W tej ofercie kolor różowy"; big ink price "34,90 zł"; '
    'full-width pill raspberry CTA "Zamawiam Skrolika"; micro-copy "Płatność online lub przy '
    'odbiorze · 14 dni na zwrot". One card, nothing else.'),
 '09-zamow': ('Stack: header "Zamów Skrolika"; COMPACT product card (small pink packshot + '
    '"Skrolik — pierścień do przewijania" + "34,90 zł" + summary rows Produkt 34,90 zł / '
    'Dostawa 9,99 zł / Pobranie — / bold Razem 44,89 zł); then FORM card with numbered steps '
    'stacked: "1 Kontakt" (E-mail, Telefon fields), "2 Adres", "3 Dostawa" (radio cards '
    'Kurier/Paczkomat), "4 Płatność" (radio cards Płacę online/Przy odbiorze); full-width '
    'pill raspberry CTA "Zamawiam i płacę"; trust row payment badges + "14 dni na zwrot".'),
 '10-faq': ('Stack: header "Pytania i odpowiedzi"; six full-width accordion rows with thin '
    'outline pictograms and chevrons, first expanded: "Czy działa z moim telefonem?" with '
    'answer "Skrolik łączy się przez Bluetooth z telefonem i tabletem. Parujesz go raz — w '
    'ustawieniach Bluetooth."; other rows VERBATIM: "Jak sparować pierścień?", "Czy przewija '
    'w bok?", "Jak się ładuje?", "Co jest w zestawie?", "Jak działa płatność przy odbiorze?".'),
 '11-final': ('Stack: centered near-white card: pink ring packshot with raspberry arcs; '
    'Gabarito headline "Scrolluj, kartkuj i rób zdjęcia — jednym kciukiem"; three pill chips '
    'stacked or wrapped: "Pionowy scroll", "Ebooki", "Zdalna migawka"; big pill raspberry CTA '
    '"Zamawiam Skrolika za 34,90 zł"; micro-copy payments/returns; slim footer strip (lockup + '
    'Regulamin / Polityka prywatności / Kontakt).'),
}


PROD = ('When the pink ring remote appears with a hand: it is WORN on the index finger — '
        'finger passes THROUGH the open silicone C-clip, keystone block sits ON TOP of the '
        'finger, the same hand\'s thumb presses the buttons; ABSOLUTELY NOT pinched or held '
        'between fingertips. EXACTLY three round arrow buttons in one slanted line; no metal, '
        'no logos, no fourth button, no closed ring band. ')


def gen(key):
    prompt = HEAD + TASKS[key] + ' ' + PROD + DNA
    payload = {'fn': 'generate-image', 'payload': {
        'prompt': prompt, 'count': 1, 'workflow_id': 'skrolik-makieta-m-' + key,
        'type': 'mockup', 'provider': 'gpt-image-2', 'quality': 'medium', 'aspect_ratio': '2:3',
        'reference_images': [
            {'url': MAK + key + '.webp', 'type': 'ref'},
            {'url': STYL, 'type': 'ref'},
        ]}}
    req = urllib.request.Request(BASE, data=json.dumps(payload).encode('utf-8'),
                                 headers={'Content-Type': 'application/json', 'x-wf2-secret': SECRET})
    j = json.loads(urllib.request.urlopen(req, timeout=600).read().decode('utf-8'))
    url = (j.get('images') or [{}])[0].get('url')
    if not url:
        return key, 'FAIL ' + json.dumps(j)[:200]
    data = urllib.request.urlopen(url, timeout=120).read()
    out = os.path.join(OUT, key + '-m.png')
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
