# -*- coding: utf-8 -*-
"""Styl-master ODSACZEK (F2.5): 1 generacja medium 3:2 przez wf2-gen.
Plansza DNA serii: scena kuchenna z koszem + probki UI (karta, CTA, pill, strzalka-sygnatura)."""
import io, json, os, re, sys, urllib.request

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
ENV = io.open(r'c:/repos_tn/tn-crm/.env', encoding='utf-8', errors='ignore').read()
SECRET = re.search(r'^WF2_GEN_SECRET=(.+)$', ENV, re.M).group(1).strip()
BASE = 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-gen'
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
G = PUB + 'bud-products/1005002491639276/'

DNA = ('STYLE-DNA: warm linen page #F4EFE5 with section bands #EDE6D8 and near-white cards '
       '#FFFCF6; ink #221E16, body #37322A, hairlines #DCD5C8; EXACTLY ONE accent bottle-green '
       '#176B3A used only for CTA, active states and thin arc-arrows with small arrowheads '
       '(series signature); icons thin 1.5px outline in ink; display font Bricolage Grotesque '
       '(characterful geometric grotesque), text font Figtree; one series radius 14px; '
       'trust-pills card fill 1px hairline border ink text; soft warm sepia-tinted shadows, '
       'subtle grain on bands only; light backgrounds only. Polish diacritics correct.')

PROMPT = (
    'STYLE-MASTER BOARD (3:2, landscape) for a Polish e-commerce landing page series — one '
    'cohesive board that will serve as the style reference for all section mockups. '
    'LEFT 60%: a hero-like scene in an ordinary bright home kitchen: an adult hand lifts a '
    'silver folding wire frying basket full of golden French fries out of a black wok on a '
    'home stove, clean pale oil drips back into the wok, soft daylight with a warm reflection. '
    'The basket must faithfully match image 1 (real product): bare silver stainless steel, '
    'open woven diamond mesh with no solid walls, crown of zigzag V-shaped wires around the '
    'rim, two wire handle arms joined by a flat hanger-shaped bridge, concentric wire rosette '
    'bottom. Above the scene a Polish display headline "Wyjmij całą porcję jednym ruchem" in '
    'Bricolage Grotesque ink #221E16, and one thin bottle-green arc-arrow with a small '
    'arrowhead tracing the basket\'s upward trajectory (drawn as UI graphic over the photo). '
    'RIGHT 40% on linen #F4EFE5: UI specimen column — a near-white card (radius 14px, warm '
    'sepia shadow) with product thumbnail, price "29,90 zł" and a full-width bottle-green '
    '#176B3A button "Zamawiam Odsączek" with white text; below it two trust pills '
    '"Płatność przy odbiorze" and "14 dni na zwrot" (card fill, 1px hairline, ink text); '
    'below a small typography specimen: "Odsączek" in Bricolage Grotesque + one body line in '
    'Figtree "Składany koszyk ze stali nierdzewnej"; below three thin-outline icons (pot, '
    'droplet, flat disk) and one thin arc-arrow specimen in bottle-green. ' + DNA +
    ' No watermarks, no phone frames, crisp UI rendering.')

payload = {'fn': 'generate-image', 'payload': {
    'prompt': PROMPT, 'count': 1, 'workflow_id': 'odsaczek-styl-master',
    'type': 'mockup', 'provider': 'gpt-image-2', 'quality': 'medium', 'aspect_ratio': '3:2',
    'reference_images': [
        {'url': G + 'g2.webp', 'type': 'product'},
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
