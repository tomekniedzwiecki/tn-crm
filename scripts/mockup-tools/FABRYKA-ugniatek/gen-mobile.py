# -*- coding: utf-8 -*-
"""Brakujace pary mobile makiet Ugniatka (F2.4: mobile dla WSZYSTKICH sekcji).
Kazda = reflow sekcji desktop (ref: makieta desktop + styl-master), 2:3, edge medium,
3 watki + retry. Wyjscie: out/m-<sekcja>-mobile.png"""
import io, json, os, re, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
ENV = io.open(r'c:/repos_tn/tn-crm/.env', encoding='utf-8', errors='ignore').read()
SECRET = re.search(r'^WF2_GEN_SECRET=(.+)$', ENV, re.M).group(1).strip()
BASE = 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-gen'
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
MAK = PUB + 'bud-assets/ugniatek/makiety/'
STYL = PUB + 'bud-assets/ugniatek/brand/00-styl-master.webp'

DNA = ('STYLE-DNA: cool porcelain-mist page #EEF1F2 with panels #E6EBEC and near-white cards; '
       'ink #14211F, body #26312F, hairlines #CBD5D8; EXACTLY ONE accent petrol #0B6B64 only for '
       'CTA/active states; icons thin 1.5px outline in ink; display font Space Grotesk (geometric '
       'sans, NOT monospace), text font Work Sans; one series radius 10px; trust-pills paper fill '
       '1px border ink text; soft layered cool-tinted shadows, subtle grain; light backgrounds '
       'only. Polish diacritics correct. Crisp mobile UI, no watermarks, no phone frame. ')

HEAD = ('High-fidelity MOBILE landing SECTION mockup, 390px-wide phone layout on a 2:3 portrait '
        'board. Image 1 = the DESKTOP mockup of this exact section: this is the CONTENT source — '
        'keep the SAME content, copy, photos and component styles, restacked into ONE narrow '
        'column. Image 2 = style reference board ONLY (match palette/typography/radius) — NEVER '
        'copy its tiles, swatches or specimen content onto the page. The output shows ONLY this '
        'one section, nothing else. ')

TASKS = {
    '03-anatomia': 'Stack: eyebrow ANATOMIA + header "Sześć głowic pod kontrolą dwóch uchwytów."; '
        'large clean bottom view of the device (six black ball heads 2x3, oval perforated center, '
        'two handles) on a near-white card; below it a compact list of four callout labels with '
        'ink dots and short hairlines: "2 zintegrowane uchwyty", "6 kulowych głowic", '
        '"powierzchnia robocza do 22 300 mm²", "centralne podświetlenie 630–650 nm"; below a '
        'narrow macro strip of the glowing red center panel with caption.',
    '04-sterowanie': 'Stack: header "Wybierz tryb i poziom intensywności."; photo card of the '
        'device on a wooden sideboard with a finger pressing plus on the side panel; below a '
        'near-white parameters card with four rows (9 trybów P1–P9 / 9 poziomów 1–9 / do 2 h '
        'pracy · ładowanie USB ok. 3,5 h / auto-stop po 10 min); below a row of two trust pills '
        '"Bezprzewodowy", "Akumulator 2000 mAh".',
    '05-wieczorem': 'Stack: header "Twój moment po całym dniu."; large photo card: adult at a '
        'home office corner at dusk pressing the massager against their lower back; smaller photo '
        'card: adult on an exercise mat pressing it against the calf; below a near-white card '
        'with two benefit lines with outline icons: "Po pracy: kark, barki, lędźwie" and '
        '"Po treningu: uda i łydki".',
    '06-mid-cta': 'Stack: near-white offer card with three-quarter product view on mist field, '
        'display line "Dwie formy masażu. Jedno urządzenie.", big price "189,00 zł", full-width '
        'petrol CTA "Zamawiam Ugniatka", micro-copy "Płatność online lub przy odbiorze · 14 dni '
        'na zwrot".',
    '07-zestaw': 'Stack: header "Co dokładnie dostajesz"; flat-lay photo card (massager, coiled '
        'white USB cable, plain manual, plain cardboard box); below a spec table card (Wymiary '
        '28 × 16,5 × 11 cm / Waga 1113 g / Moc 10 W / Certyfikaty CE · RoHS · FCC); below a slim '
        'side-profile photo strip of the device.',
    '08-zamow': 'Stack: checkout card — small product thumbnail + "Ugniatek" + price "189,00 zł"; '
        'full-width outlined inputs with Work Sans labels (Imię i nazwisko, Telefon, Adres); two '
        'stacked payment radio cards "Płatność online" (selected, petrol border and dot) and '
        '"Przy odbiorze (za pobraniem)"; full-width petrol CTA "Zamawiam i płacę"; micro-copy '
        '"14 dni na zwrot" + slim grey payment badges row.',
    '09-faq': 'Stack: header "Pytania przed zakupem"; five full-width accordion rows on '
        'near-white cards with thin "+" icons in ink, first row expanded with a short answer: '
        '"Czym różnią się dwie formy użycia?", "Ile trwa praca i ładowanie?", "Jak działa '
        'auto-stop?", "Jak zapłacić przy odbiorze?", "Jak działa zwrot 14 dni?".',
    '10-final': 'Stack: display line "Dociskaj tam, gdzie sięgasz. Oprzyj się tam, gdzie '
        'trudniej."; clean three-quarter product view centered; row of two small muted photo '
        'tiles (hands pressing with both handles / lower back leaning on device); price '
        '"189,00 zł"; full-width petrol CTA "Zamawiam Ugniatka"; micro-copy "Płatność online '
        'lub przy odbiorze · 14 dni na zwrot".',
}


def gen(section, desc, tries=3):
    prompt = HEAD + desc + ' ' + DNA
    payload = {'fn': 'generate-image', 'payload': {
        'prompt': prompt, 'count': 1, 'workflow_id': 'ugniatek-m-%s-mobile' % section,
        'type': 'mockup', 'provider': 'gpt-image-2', 'quality': 'medium',
        'aspect_ratio': '2:3',
        'reference_images': [
            {'url': MAK + section + '.webp', 'type': 'ref'},
            {'url': STYL, 'type': 'ref'},
        ]}}
    body = json.dumps(payload).encode('utf-8')
    for attempt in range(1, tries + 1):
        try:
            req = urllib.request.Request(BASE, data=body, headers={
                'Content-Type': 'application/json', 'x-wf2-secret': SECRET})
            raw = urllib.request.urlopen(req, timeout=600).read()
            j = json.loads(raw.decode('utf-8'))
            url = (j.get('images') or [{}])[0].get('url')
            if not url:
                raise RuntimeError('no images: ' + json.dumps(j)[:200])
            data = urllib.request.urlopen(url, timeout=120).read()
            out = os.path.join(OUT, 'm-%s-mobile.png' % section)
            open(out, 'wb').write(data)
            return out
        except Exception as e:
            print('  [%s] proba %d/%d FAIL: %s' % (section, attempt, tries, str(e)[:180]))
            if attempt == tries:
                raise
            time.sleep(10 * attempt)


ok, fail = [], []
ONLY = set(sys.argv[1:]) or None
with ThreadPoolExecutor(max_workers=3) as ex:
    futs = {ex.submit(gen, s, d): s for s, d in TASKS.items() if not ONLY or s in ONLY}
    for f in as_completed(futs):
        s = futs[f]
        try:
            p = f.result(); ok.append(s); print('OK', s, '->', p)
        except Exception as e:
            fail.append(s); print('FAIL', s, str(e)[:180])
print('\nOK:', len(ok), 'FAIL:', fail or '-')
