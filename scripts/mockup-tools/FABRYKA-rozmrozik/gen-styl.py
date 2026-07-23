# -*- coding: utf-8 -*-
"""Styl-master ROZMROZIK (F2.5): 1 generacja medium 3:2 przez wf2-gen.
Plansza DNA serii (NIE druga hero-scena): paleta+2 fonty+radius+ikony+trust-pill+głębia
+ sygnatura „pasek odwilży" + kafel PRODUKT (kotwica koloru). Ref g0 jako 'ref' (STANDARD F2.1)."""
import io, json, os, re, sys, urllib.request

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
ENV = io.open(r'c:/repos_tn/tn-crm/.env', encoding='utf-8', errors='ignore').read()
SECRET = re.search(r'^WF2_GEN_SECRET=(.+)$', ENV, re.M).group(1).strip()
BASE = 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-gen'
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
G = PUB + 'bud-products/1005011774118215/'

DNA = ('STYLE-DNA: icy pale-blue page #F2F7FA with section bands #EAF1F6 and white cards '
       '#FFFFFF; ink #232A31, body #2E3740, hairlines #CFDCE6; EXACTLY ONE accent '
       'burnt-tangerine #E8590C used ONLY for the CTA button, a thin italic underline-swash '
       'under one headline word, and the warm end of the signature "thaw line" (a 2px hairline '
       'gradient from icy blue #9BB8CE to tangerine #E8590C under section eyebrows); all '
       'functional icons thin 1.75px outline in ink; display font Zilla Slab (warm sturdy slab '
       'serif) for headlines, prices and BIG numbers; text font Instrument Sans; one series '
       'radius 12px; trust-pills: white fill, 1px hairline border, ink text; soft layered '
       'warm-ambient shadows, subtle grain on bands only; light backgrounds only. Polish '
       'diacritics correct.')

PROMPT = (
    'STYLE-MASTER SPECIMEN BOARD (3:2 landscape) for a Polish e-commerce landing page series — '
    'a DESIGN-SYSTEM BOARD, not a hero scene: an organized specimen sheet on the icy pale-blue '
    'page background #F2F7FA presenting the complete visual DNA of the series in labeled tiles. '
    'GRID OF TILES: '
    '(1) PALETTE tile: five swatch chips with hex labels #F2F7FA, #EAF1F6, #FFFFFF, #232A31, '
    '#E8590C plus one small icy-blue chip #9BB8CE. '
    '(2) TYPE tile: display specimen "Rozmrozik" and a BIG price "289,00 zł" in Zilla Slab '
    '(warm sturdy slab serif, ink), one body paragraph line in Instrument Sans "Elektryczny '
    'box do rozmrażania" and an eyebrow in ALL-CAPS tracked Instrument Sans "PLAN AWARYJNY NA '
    'OBIAD"; under the word "Rozmrozik" a thin tangerine italic underline-swash. '
    '(3) SIGNATURE tile: the "thaw line" — a thin 2px horizontal hairline that fades from icy '
    'blue #9BB8CE on the left into tangerine #E8590C on the right, shown under a small eyebrow; '
    'plus BIG numbers specimen "4,2 L · 4" in Zilla Slab ink. '
    '(4) UI tile: a white card (radius 12px, soft layered warm shadow) with a full-width '
    'tangerine #E8590C button "Zamawiam Rozmrozik" in white text, above it the price '
    '"289,00 zł" in slab, below two trust pills "Płatność przy odbiorze" and "14 dni na zwrot" '
    '(white fill, 1px hairline border, ink text). '
    '(5) ICONS tile: four thin 1.75px outline icons in ink only: a dome cover, a droplet, '
    'a USB-C plug, a touch fingertip. '
    '(6) PRODUCT tile: small clean photo of the defrosting box from image 1 (flat tray base '
    'with black rim, transparent faceted dome, black module with round vent grille and LED '
    'panel on top) on a white card — color anchor of the series, keep the product EXACTLY as '
    'in image 1. '
    '(7) MOOD tile: one small muted photo chip of a Polish kitchen counter in cool late-'
    'afternoon window light with a hint of warm evening light on the right edge. '
    'Tiles separated by generous whitespace on the icy page, small ink labels above each tile '
    '(PALETA, TYPOGRAFIA, SYGNATURA, UI, IKONY, PRODUKT, ŚWIAT). ' + DNA +
    ' No watermarks, no phone frames, no browser chrome, crisp UI rendering, EXACTLY ONE '
    'BOARD and nothing else.')

payload = {'fn': 'generate-image', 'payload': {
    'prompt': PROMPT, 'count': 1, 'workflow_id': 'rozmrozik-styl-master',
    'type': 'mockup', 'provider': 'gpt-image-2', 'quality': 'medium', 'aspect_ratio': '3:2',
    'reference_images': [
        {'url': G + 'g0.webp', 'type': 'ref'},
    ]}}
req = urllib.request.Request(BASE, data=json.dumps(payload).encode('utf-8'),
                             headers={'Content-Type': 'application/json', 'x-wf2-secret': SECRET})
j = json.loads(urllib.request.urlopen(req, timeout=600).read().decode('utf-8'))
url = (j.get('images') or [{}])[0].get('url')
if not url:
    print('FAIL:', json.dumps(j)[:300]); sys.exit(1)
data = urllib.request.urlopen(url, timeout=120).read()
out = os.path.join(HERE, 'brand', '00-styl-master.png')
os.makedirs(os.path.dirname(out), exist_ok=True)
open(out, 'wb').write(data)
print('OK styl-master ->', out, len(data) // 1024, 'KB')
