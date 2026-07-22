# -*- coding: utf-8 -*-
"""Styl-master SKROLIK (F2.5): 1 generacja medium 3:2 przez wf2-gen.
Plansza DNA serii: scena kanapowa (dlon z rozowym pierscieniem + telefon) + probki UI."""
import io, json, os, re, sys, urllib.request

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
ENV = io.open(r'c:/repos_tn/tn-crm/.env', encoding='utf-8', errors='ignore').read()
SECRET = re.search(r'^WF2_GEN_SECRET=(.+)$', ENV, re.M).group(1).strip()
BASE = 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-gen'
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
G = PUB + 'bud-assets/skrolik/galeria/'

DNA = ('STYLE-DNA: powder-rose page #F8F1F0 with near-white cards #FFFDFC; ink #2B2025 (warm '
       'rose-tinted near-black), body #6E5F63, hairlines #E6D8D9; EXACTLY ONE accent deep '
       'raspberry #B4265C used only for CTA, active states and thin incomplete concentric '
       'signal arcs radiating from interaction points (series signature, 1.5px, low opacity); '
       'icons thin 1.5px outline in ink; display font Gabarito (friendly rounded geometric '
       'sans, ABSOLUTELY NOT monospace), text font Mulish; cards radius 18px, buttons full '
       'pill shape; soft low shadows; light backgrounds only. Polish diacritics correct.')

NEG_PROD = (' The ring product must faithfully match image 1: pastel matte pink keystone-shaped '
            'block on an open silicone C-clip (never a closed ring), EXACTLY three round arrow '
            'buttons in one slanted line on the sloped top plate, buttons same pink as body; '
            'no screen on ring, no metal, no logos, no fourth button.')

PROMPT = (
    'STYLE-MASTER BOARD (3:2, landscape) for a Polish e-commerce landing page series — one '
    'cohesive board serving as the style reference for all section mockups. '
    'LEFT 60%: a hero-like scene in a bright daytime living room: close view of an adult hand '
    'WEARING a small pastel pink Bluetooth finger remote ON the index finger — the silicone '
    'C-clip is wrapped AROUND the index finger like a ring (finger passes through the clip), '
    'the keystone button block sits ON TOP of the finger, and the THUMB of the SAME hand '
    'reaches over to press the middle button. ABSOLUTELY NOT held or pinched between thumb '
    'and fingertips like a small remote — it is worn as a ring. The other fingers are relaxed. '
    'Next to and slightly behind the hand a smartphone propped upright against a pale sofa '
    'cushion shows a heavily blurred neutral vertical feed (no readable text, no app UI). '
    'Soft cool daylight from a window, pale sofa fabrics.' + NEG_PROD +
    ' NEGATIVE: product pinched or held in fingertips, product detached from finger, '
    'closed ring band, twisted wrist, deformed fingers.' +
    ' Above the scene a Polish display headline "Telefon stoi. Ty przewijasz kciukiem." in '
    'Gabarito ink #2B2025, and two thin deep-raspberry incomplete concentric arcs radiating '
    'from the ring (drawn as UI graphic over the photo — series signature). '
    'RIGHT 40% on powder-rose #F8F1F0: UI specimen column — a near-white card (radius 18px, '
    'soft shadow) with a small pink product thumbnail, price "34,90 zł" and a full-width deep '
    'raspberry #B4265C pill button "Zamawiam Skrolika" with white text; below it two trust '
    'pills "Płatność przy odbiorze" and "14 dni na zwrot" (card fill, 1px hairline, ink text); '
    'below a small typography specimen: "Skrolik" in Gabarito + one body line in Mulish '
    '"Mały pierścień-pilot do telefonu"; below three thin-outline icons (finger with ring, '
    'vertical arrows, camera shutter) and one specimen of thin concentric signal arcs in deep '
    'raspberry. ' + DNA + ' No watermarks, no phone frames around the board, crisp UI rendering.')

payload = {'fn': 'generate-image', 'payload': {
    'prompt': PROMPT, 'count': 1, 'workflow_id': 'skrolik-styl-master',
    'type': 'mockup', 'provider': 'gpt-image-2', 'quality': 'medium', 'aspect_ratio': '3:2',
    'reference_images': [
        {'url': G + 'keep2-packshot-pink.webp', 'type': 'product'},
        {'url': G + 'keep4-detal-klips.webp', 'type': 'ref'},
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
