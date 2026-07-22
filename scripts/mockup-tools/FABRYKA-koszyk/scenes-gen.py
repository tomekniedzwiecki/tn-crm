# -*- coding: utf-8 -*-
"""F3 ODSACZEK: 3 czyste sceny HIGH (hero / zawieszenie / final) lokalnym /v1/images/edits.
image[0] = realny packshot g2 (WIERNOSC), image[1] = crop sceny z ZAAKCEPTOWANEJ makiety
(kompozycja/swiatlo). Pattern: recreate as clean photo, REMOVE text/UI/arrows."""
import base64, io, os, re, sys, time
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image
import requests

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
ASSETS = os.path.join(HERE, 'assets'); os.makedirs(ASSETS, exist_ok=True)
REFS = os.path.join(HERE, 'refs-cache')
ENV = io.open(r'c:/repos_tn/tn-crm/.env', encoding='utf-8', errors='ignore').read()
KEY = re.search(r'^OPENAI_API_KEY=(.+)$', ENV, re.M).group(1).strip()

# cropy scen z makiet (ref kompozycji)
CROPS = {
    'ref-hero-scena.png': ('01-hero.png', (0, 0, 1536, 560)),
    'ref-zawies-scena.png': ('03-zawies.png', (40, 200, 1010, 930)),
    'ref-final-scena.png': ('10-final.png', (95, 150, 1440, 730)),
}
for name, (src, box) in CROPS.items():
    im = Image.open(os.path.join(OUT, src)).convert('RGB')
    im.crop(box).save(os.path.join(REFS, name))
print('OK 3 refy kompozycji z makiet')

NEG = ('Product fidelity (hard, copy construction from image 1): bare silver stainless steel '
       'folding frying/draining basket — open woven diamond wire mesh with NO solid wall '
       'sections, a crown of repeated zigzag V-shaped support wires around the upper rim, two '
       'wire handle arms joined by a flat hanger-shaped bridge, concentric wire rosette bottom '
       'with a small center eye. NO silicone or colored grips, NO solid bottom, NO telescoping '
       'parts, NO plastic latches, NO colored coatings, NO logos on the product, NO lid, NO '
       'feet. No text overlays, no UI, no watermarks, no arrows, no graphics.')

S = ('Recreate this exact scene as a clean production photograph. REQUIREMENTS: '
     '#1 same room, framing, composition and light as the mockup scene reference (image 2); '
     '#2 the wire basket SAME size and position as in the mockup, but its exact construction '
     'copied faithfully from the real product photo (image 1); '
     '#3 FULL frame edge to edge, NO fade, NO empty color field, NO text zone; '
     '#4 REMOVE every text, logo, UI element, callout and green arrow overlay — pure photo. ')

TASKS = {
 'sc-hero': (S + 'Scene: ordinary bright home kitchen, an adult hand lifts the basket FULL of '
    'golden French fries out of a black wok on the stove; clean pale oil drips back into the '
    'wok, gentle steam, warm daylight, quiet upper background. ORIENT: basket fully expanded, '
    'upright, front three-quarter view centered above the wok; both wire arms joined, held by '
    'one hand at the flat bridge; fries inside, rosette bottom facing down, droplets falling '
    'straight into the wok. ' + NEG, 'ref-hero-scena.png', '1536x1024'),
 'sc-zawieszony': (S + 'Scene: close side view — the basket with golden fries HANGS on the rim '
    'of a steel pot on a home stove; the zigzag V-wire crown rests ON the pot rim, handle arms '
    'released and relaxed to the sides, NOBODY holds it; a few clean oil droplets fall from '
    'the mesh bottom INTO the pot, gentle steam, warm daylight kitchen. ORIENT: basket hangs '
    'by the zigzag crown ON the pot rim, lower half inside the pot, drops fall inside. '
    + NEG, 'ref-zawies-scena.png', '1536x1024'),
 'sc-final': (S + 'Scene: wide kitchen counter shot — the basket with golden chicken nuggets '
    'hanging on the rim of a steel pot, wooden cutting board and small plant in background, '
    'striped kitchen towel on the counter, warm daylight. ORIENT: basket hangs by the zigzag '
    'crown on the pot rim, handles up and relaxed, nuggets inside, nobody holds it. '
    + NEG, 'ref-final-scena.png', '1536x1024'),
}


def gen(name, tries=3):
    prompt, ref, size = TASKS[name]
    refs = [os.path.join(REFS, 'g2.webp'), os.path.join(REFS, ref)]
    for attempt in range(1, tries + 1):
        try:
            files = []
            for rp in refs:
                mime = 'image/webp' if rp.endswith('.webp') else 'image/png'
                files.append(('image[]', (os.path.basename(rp), open(rp, 'rb'), mime)))
            r = requests.post('https://api.openai.com/v1/images/edits',
                              headers={'Authorization': 'Bearer ' + KEY},
                              data={'model': 'gpt-image-2', 'prompt': prompt, 'size': size,
                                    'quality': 'high', 'n': '1'},
                              files=files, timeout=600)
            if r.status_code != 200:
                raise RuntimeError('HTTP %s: %s' % (r.status_code, r.text[:250]))
            out = os.path.join(ASSETS, name + '.png')
            open(out, 'wb').write(base64.b64decode(r.json()['data'][0]['b64_json']))
            return out
        except Exception as e:
            print('  [%s] proba %d/%d FAIL: %s' % (name, attempt, tries, str(e)[:180]))
            if attempt == tries:
                raise
            time.sleep(8 * attempt)


todo = sys.argv[1:] or list(TASKS)
ok, fail = [], []
with ThreadPoolExecutor(max_workers=3) as ex:
    futs = {ex.submit(gen, s): s for s in todo}
    for f in as_completed(futs):
        s = futs[f]
        try:
            ok.append(f.result()); print('OK', s)
        except Exception as e:
            fail.append(s); print('FAIL', s, str(e)[:120])
print('GOTOWE: %d OK, %d FAIL %s' % (len(ok), len(fail), fail))
