# -*- coding: utf-8 -*-
"""F5-fix ODSACZEK: scena mid-cta (rubryka P1 — makieta ma scene full-bleed, F3 crop-first
ja pominal). GEN HIGH: image[0]=realny packshot g2 (wiernosc), image[1]=crop sceny z makiety 07.
Kompozycja POD RUCH (LL-041/ANIM-3): cienie lisci + tkanina jako nosniki, wystawione."""
import base64, io, os, re, sys, time
from PIL import Image
import requests

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
ASSETS = os.path.join(HERE, 'assets')
REFS = os.path.join(HERE, 'refs-cache')
ENV = io.open(r'c:/repos_tn/tn-crm/.env', encoding='utf-8', errors='ignore').read()
KEY = re.search(r'^OPENAI_API_KEY=(.+)$', ENV, re.M).group(1).strip()

im = Image.open(os.path.join(OUT, '07-mid-cta.png')).convert('RGB')
im.crop((0, 0, 1536, 510)).save(os.path.join(REFS, 'ref-mc-scena.png'))
print('OK ref-mc-scena.png (crop makiety 07)')

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
     '#4 REMOVE every text, chip, badge, UI element and overlay — pure photo. ')

PROMPT = (S + 'Scene: the fully expanded wire basket stands on a bright warm stone kitchen '
          'counter in soft morning sun; gentle dappled leaf shadows play across the wall and '
          'counter (leave open wall space so the shadows can breathe), a small potted plant '
          'and wooden board on the left, stacked ceramic bowls and a softly folded striped '
          'kitchen towel on the right with its edge lying loose. Motion-ready composition: '
          'the dappled shadows and the loose towel edge are fully inside the frame, not cut '
          'by the crop. ' + NEG)

files = [('image[]', ('g2.png', open(os.path.join(REFS, 'g2.png'), 'rb'), 'image/png')),
         ('image[]', ('ref-mc-scena.png', open(os.path.join(REFS, 'ref-mc-scena.png'), 'rb'), 'image/png'))]
for attempt in (1, 2, 3):
    try:
        r = requests.post('https://api.openai.com/v1/images/edits',
                          headers={'Authorization': 'Bearer ' + KEY},
                          data={'model': 'gpt-image-2', 'prompt': PROMPT, 'size': '1536x1024',
                                'quality': 'high', 'n': '1'},
                          files=files, timeout=600)
        if r.status_code != 200:
            raise RuntimeError('HTTP %s: %s' % (r.status_code, r.text[:300]))
        p = os.path.join(ASSETS, 'mc-scena.png')
        open(p, 'wb').write(base64.b64decode(r.json()['data'][0]['b64_json']))
        print('OK', p)
        break
    except Exception as e:
        print('proba %d FAIL: %s' % (attempt, str(e)[:200]))
        if attempt == 3:
            raise
        time.sleep(10 * attempt)
