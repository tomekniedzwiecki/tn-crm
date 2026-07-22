# -*- coding: utf-8 -*-
"""F3 SKROLIK: 5 scen produkcyjnych z seedow PRZEWODNIKA v2 (bloki ```text per ### sc-id).
Quality medium, referencje keep2 (product) + keep4 (ref). Dopisek zalecenia krytyka F2:
wszystkie 3 przyciski CZYTELNE w kadrach worn (wzorzec 11-final).
Uzycie: python gen-sceny.py all | sc-hero [sc-kanapa ...]"""
import io, json, os, re, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'sceny'); os.makedirs(OUT, exist_ok=True)
ENV = io.open(r'c:/repos_tn/tn-crm/.env', encoding='utf-8', errors='ignore').read()
SECRET = re.search(r'^WF2_GEN_SECRET=(.+)$', ENV, re.M).group(1).strip()
BASE = 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-gen'
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
G = PUB + 'bud-assets/skrolik/galeria/'

ASPECT = {'sc-hero': '2:3', 'sc-kanapa': '3:2', 'sc-kuchnia': '3:2',
          'sc-ebook': '1:1', 'sc-selfie': '3:2'}
DOPISEK = (' CRITICAL: all THREE round arrow buttons on the top plate must remain clearly '
           'recognizable in the final frame (choose hand angle so the thumb does not hide '
           'more than one button). CRITICAL CLIP FIT: the silicone C-clip WRAPS SNUGLY around '
           'the base or middle segment of the index finger — the finger FILLS the clip; the '
           'clip is NEVER dangling, NEVER hanging loose below the hand, NEVER stretched into '
           'a long tail, and the device is NEVER perched on the fingertip or pinched between '
           'fingers. NEGATIVE: dangling clip, loose strap, elongated silicone tail, device on '
           'fingertip, device pinched between thumb and finger.')

prz = io.open(os.path.join(HERE, 'out-przewodnik.md'), encoding='utf-8').read()
SEEDS = {}
for m in re.finditer(r'### (sc-[a-z]+)\n.*?```text\n(.*?)```', prz, re.S):
    SEEDS[m.group(1)] = m.group(2).strip()
assert set(SEEDS) == set(ASPECT), 'seedy=%s' % sorted(SEEDS)

# Poprawki v3 po 2. parze oczu (gate F3A):
EXTRA = {
    'sc-kuchnia': (' COMPOSITION FIX: the ring hand is held RELAXED at chest height AWAY from '
                   'the bowl (not hovering over flour); the index finger passes fully THROUGH '
                   'the C-clip at its middle segment, clip snug. BUTTONS FIX: the thumb hovers '
                   'NEXT TO the button plate (about to press), NOT covering ANY button — all '
                   'THREE buttons (triangle, diamond, triangle) fully visible and crisp.'),
    'sc-ebook': (' MATERIAL FIX: the ring color is EXACTLY the light pastel matte pink of the '
                 'product reference image — desaturated, soft, completely MATTE (no gloss, no '
                 'shine, no saturation boost). Do NOT draw any signal arcs, waves or graphic '
                 'lines in the scene — plain photo only (arcs added later in page layout).'),
    'sc-selfie': (' GRIP FIX (STRICT): the silicone loop opening is COMPLETELY FILLED by the '
                  'bent index finger — skin visible INSIDE the loop, no gap, no daylight '
                  'through the loop, loop never empty or dangling; the keystone block sits ON '
                  'TOP of that finger; the thumb presses the middle button from above; other '
                  'fingers curled below WITHOUT touching the device; device is worn like a '
                  'ring, never pinched between fingertips.'),
}


def gen(key):
    payload = {'fn': 'generate-image', 'payload': {
        'prompt': SEEDS[key] + DOPISEK + EXTRA.get(key, ''), 'count': 1, 'workflow_id': 'skrolik-scena-' + key,
        'type': 'mockup', 'provider': 'gpt-image-2', 'quality': 'medium',
        'aspect_ratio': ASPECT[key],
        'reference_images': [
            {'url': G + 'keep2-packshot-pink.webp', 'type': 'product'},
            {'url': G + 'keep4-detal-klips.webp', 'type': 'ref'},
        ]}}
    req = urllib.request.Request(BASE, data=json.dumps(payload).encode('utf-8'),
                                 headers={'Content-Type': 'application/json', 'x-wf2-secret': SECRET})
    j = json.loads(urllib.request.urlopen(req, timeout=600).read().decode('utf-8'))
    url = (j.get('images') or [{}])[0].get('url')
    if not url:
        return key, 'FAIL ' + json.dumps(j)[:200]
    data = urllib.request.urlopen(url, timeout=120).read()
    open(os.path.join(OUT, key + '.png'), 'wb').write(data)
    return key, 'OK %d KB' % (len(data) // 1024)


keys = sys.argv[1:] or ['all']
if keys == ['all']:
    keys = list(ASPECT)
with ThreadPoolExecutor(max_workers=5) as ex:
    futs = {ex.submit(gen, k): k for k in keys}
    for f in as_completed(futs):
        k, msg = f.result()
        print(k, msg)
