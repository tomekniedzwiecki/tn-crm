# -*- coding: utf-8 -*-
"""F3 ROZMROZIK: 9 czystych scen HIGH lokalnym /v1/images/edits (fallback: edge wf2-gen).
image[0] = realny packshot g0 (WIERNOSC), image[1] = crop sceny z ZAAKCEPTOWANEJ makiety
(kompozycja/swiatlo). Sceny problem/hero-frozen BEZ produktu: ref = crop makiety tylko.
Pattern: recreate as clean photo, REMOVE text/UI/labels."""
import base64, io, os, re, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image
import requests

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
ASSETS = os.path.join(HERE, 'assets'); os.makedirs(ASSETS, exist_ok=True)
REFS = os.path.join(HERE, 'refs-cache'); os.makedirs(REFS, exist_ok=True)
ENV = io.open(r'c:/repos_tn/tn-crm/.env', encoding='utf-8', errors='ignore').read()
KEY = re.search(r'^OPENAI_API_KEY=(.+)$', ENV, re.M).group(1).strip()
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'

# packshot g0 (wiernosc produktu)
G0 = os.path.join(REFS, 'g0.webp')
if not os.path.exists(G0):
    open(G0, 'wb').write(urllib.request.urlopen(
        PUB + 'bud-products/1005011774118215/g0.webp', timeout=120).read())
    print('OK g0.webp pobrany')

# cropy scen z makiet (ref kompozycji/swiatla)
CROPS = {
    'ref-hero-frozen.png': ('01-hero.png', (617, 128, 1050, 962)),
    'ref-hero-thawed.png': ('01-hero.png', (1050, 128, 1490, 962)),
    'ref-problem.png': ('02-problem.png', (640, 0, 1536, 1024)),
    'ref-demo.png': ('03-jak-dziala.png', (55, 250, 905, 930)),
    'ref-capacity.png': ('04-pojemnosc.png', (740, 30, 1510, 990)),
    'ref-final.png': ('10-final.png', (25, 30, 860, 1000)),
}
for name, (src, box) in CROPS.items():
    im = Image.open(os.path.join(OUT, src)).convert('RGB')
    im.crop(box).save(os.path.join(REFS, name))
print('OK %d refow kompozycji z makiet' % len(CROPS))

FID = ('Product fidelity (hard, copy construction from image 1): low-profile electric '
       'defrosting box — flat black base tray with a silver aluminum plate showing a '
       'concentric perforation dot pattern, a transparent truncated-pyramid dome with cut '
       'corners sitting on the base, and a black top module resting ON TOP of the dome '
       '(round metal grille + small LED touch panel). NO printed logos or brand text on the '
       'product, NO ice cubes as decoration, module NEVER lying on the plate, NO extra '
       'buttons, NO cables unless stated. No text overlays, no UI, no watermarks, no arrows, '
       'no floating badges or labels.')

S = ('Recreate this exact scene as a clean production photograph. REQUIREMENTS: '
     '#1 same room, framing, composition and light as the mockup scene reference (the LAST '
     'image); #2 the defrosting box SAME size and position as in the mockup, but its exact '
     'construction copied faithfully from the real product photo (image 1); '
     '#3 FULL frame edge to edge, NO fade, NO empty color field, NO text zone; '
     '#4 REMOVE every text, label chip, logo, UI element and callout — pure photo. ')

SNP = ('Recreate this exact scene as a clean production photograph. REQUIREMENTS: '
       '#1 same room, framing, composition and light as the mockup scene reference (the '
       'image provided); #2 FULL frame edge to edge, NO fade, NO empty color field, NO text '
       'zone; #3 REMOVE every text, label chip, logo, UI element and callout — pure photo. ')

AVOID = ('avoid: powder-pink desk world, phone-scrolling context (previous landing); avoid: '
         'warm linen kitchen flat-lay (two landings ago). ')

# (prompt, ref kompozycji, size, czy packshot w refach)
TASKS = {
 'sc-hero-frozen': (SNP + 'Scene: real Polish home kitchen at 4:30 PM, a frozen steak '
    'covered in thick frost on a light wooden board on the countertop by the window, cold '
    'blue late-afternoon window light, shallow depth of field, realistic food photography. '
    'No device, no gadget, no appliance anywhere in frame. NEG: no defrosting box, no dome, '
    'no text. ' + AVOID, 'ref-hero-frozen.png', '1024x1536', False),
 'sc-hero-thawed': (S + 'Scene: the defrosting box standing on a kitchen counter, meat '
    'portions visible under the transparent dome, a frying pan waiting beside it, a mug of '
    'tea with visible steam and a softly waving light curtain by the window, warm '
    'early-evening light mixing with cool daylight, realistic. The steam source (mug) and '
    'the curtain FULLY inside the frame, not cropped. CRITICAL DETAILS copied 1:1 from '
    'image 1: the aluminum plate perforation is arranged in CLEAN CONCENTRIC RINGS of tiny '
    'holes around the plate center (crisp arcs, never a scattered random cloud of dots), '
    'and the black top module LIES FULLY WITHIN the flat top face of the dome — its entire '
    'length rests on the dome top exactly as in image 1, all four corners supported, ZERO '
    'overhang beyond the top edge, nothing cantilevered in the air, no gap between module '
    'underside and dome surface. ' + AVOID + FID,
    'ref-hero-thawed.png', '1024x1536', True),
 'sc-problem': (SNP + 'Scene: wide real Polish kitchen, a bowl of warm water in the sink '
    'with a vacuum-sealed frozen meat pack soaking, visible steam rising; a MICROWAVE OVEN '
    'MUST be clearly visible on the counter in the background (same as in the mockup '
    'reference), its digital clock reading 16:30; a woman\'s hand resting on the counter '
    'in mild frustration (no face), cold daylight. NEG: no defrosting box, no dome, no '
    'countertop gadget other than the microwave, no text overlays. ' + AVOID,
    'ref-problem.png', '1536x1024', False),
 'sc-demo-place': (S + 'Scene, instructional step 1 of 3, fixed 3/4 camera angle on a '
    'bright counter: a hand placing a frozen meat portion on the aluminum plate of the '
    'base; the transparent dome with its top module is set aside on the counter, resting '
    'next to the base. Clean instructional food-appliance photography, neutral bright '
    'light. ' + AVOID + FID, 'ref-demo.png', '1536x1024', True),
 'sc-demo-cover': (S + 'Scene, instructional step 2 of 3, SAME fixed 3/4 camera angle and '
    'counter as step 1: two hands lowering the transparent dome (with its black top module '
    'on the dome) onto the base with the meat portion on the plate; dome hovering just '
    'above the base, mid-motion. Clean instructional photography, neutral bright light. '
    + AVOID + FID, 'ref-demo.png', '1536x1024', True),
 'sc-demo-touch': (S + 'Scene, instructional step 3 of 3, SAME fixed 3/4 camera angle: the '
    'dome fully closed over the meat portion, one finger touching the LED touch panel on '
    'the black top module on the dome. Clean instructional photography, neutral bright '
    'light. ' + AVOID + FID, 'ref-demo.png', '1536x1024', True),
 'sc-capacity-steak': (S + 'Scene: top-down view of the base without the dome (the dome '
    'set aside at the frame edge, top module on it), EXACTLY four raw steaks arranged on '
    'the perforated aluminum plate with visible concentric hole pattern, bright neutral '
    'light, real kitchen countertop texture. ' + AVOID + FID,
    'ref-capacity.png', '1536x1024', True),
 'sc-capacity-fish': (S + 'Scene: top-down view of the base without the dome (the dome set '
    'aside at the frame edge, top module on it), EXACTLY four raw white fish fillets '
    'arranged on the perforated aluminum plate with visible concentric hole pattern, '
    'bright neutral light, real kitchen countertop texture. ' + AVOID + FID,
    'ref-capacity.png', '1536x1024', True),
 'sc-final': (S + 'Scene: early evening Polish kitchen, warm cozy light, the defrosting '
    'box standing calmly on the counter, a pan with gentle steam and heat haze on the '
    'stove nearby, a striped kitchen towel hanging over the counter edge, a hand putting '
    'metal tongs down on the counter, low counter-level angle, relaxed after-dinner-prep '
    'mood. ' + AVOID + FID, 'ref-final.png', '1536x1024', True),
}


def gen(name, tries=3):
    prompt, ref, size, with_packshot = TASKS[name]
    refs = ([G0] if with_packshot else []) + [os.path.join(REFS, ref)]
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
