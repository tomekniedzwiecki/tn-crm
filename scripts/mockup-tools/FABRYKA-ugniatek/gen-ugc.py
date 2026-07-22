# -*- coding: utf-8 -*-
"""Sekcja wideo Ugniatka (LL-042 plan B): 3 pionowe sceny 'nakrecone telefonem w domu'
(surowy UGC-vibe, ale gate wiernosci + anatomii twardy jak zawsze). Z nich Kling i2v klipy.
Wyjscie: assets/ugc-1.png ugc-2.png ugc-3.png (1024x1536)."""
import base64, io, os, re, sys, time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, 'assets')
REFS = os.path.join(HERE, 'refs-cache')
ENV = io.open(r'c:/repos_tn/tn-crm/.env', encoding='utf-8', errors='ignore').read()
KEY = re.search(r'^OPENAI_API_KEY=(.+)$', ENV, re.M).group(1).strip()
A = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'

NEG = ('Product fidelity (hard, copy from image 1): flat oval massager in SATIN SILVER-GREY '
       '(misty gray) finish — soft metallic satin look, NOT mirror chrome, NOT dark graphite; '
       'two integrated cut-out handles WITH molded finger grooves on their underside; exactly '
       'six black foam ball heads in a 2x3 grid underneath, oval perforated panel in the center '
       'of the underside, side control panel with segment display and plus/minus buttons; no '
       'pistol grip, no interchangeable heads, single colorway, no text overlays, no logos, no '
       'watermarks, no phone UI, no captions. '
       'Hand anatomy (hard): natural relaxed hands, five fingers each, straight wrists; '
       'no twisted or bent-back wrists, no contorted fingers, no extra or fused fingers.')

ORIENT = ('USAGE ORIENTATION (hard): the six black ball heads FACE THE BODY and press into '
          'the muscles — mostly HIDDEN between the device and the body; the smooth grey TOP '
          'COVER faces the camera; side control panel visible on the edge. ')

UGC = ('Style: candid vertical smartphone video frame — handheld feel, real home, natural '
       'imperfect framing, soft available light, believable everyday person (no studio, no '
       'model-perfect look), photorealistic. Motion-ready composition: subject centered with '
       'breathing room, background elements (curtain, plant, blanket) free to move subtly. ')


def fetch(url, name):
    p = os.path.join(REFS, name)
    if not os.path.isfile(p):
        urllib.request.urlretrieve(url, p)
    return p


def call_edits(prompt, ref_paths, out_name, tries=3):
    import requests
    for attempt in range(1, tries + 1):
        try:
            files = []
            for rp in ref_paths:
                mime = 'image/webp' if rp.endswith('.webp') else 'image/png'
                files.append(('image[]', (os.path.basename(rp), open(rp, 'rb'), mime)))
            r = requests.post('https://api.openai.com/v1/images/edits',
                              headers={'Authorization': 'Bearer ' + KEY},
                              data={'model': 'gpt-image-2', 'prompt': prompt,
                                    'size': '1024x1536', 'quality': 'high', 'n': '1'},
                              files=files, timeout=600)
            if r.status_code != 200:
                raise RuntimeError('HTTP %s: %s' % (r.status_code, r.text[:300]))
            out = os.path.join(ASSETS, out_name)
            open(out, 'wb').write(base64.b64decode(r.json()['data'][0]['b64_json']))
            return out
        except Exception as e:
            print('  [%s] proba %d/%d FAIL: %s' % (out_name, attempt, tries, str(e)[:200]))
            if attempt == tries:
                raise
            time.sleep(8 * attempt)


def main():
    spod = fetch(A + 'ugniatek/refs/spod-packshot.webp', 'spod-packshot.webp')
    skos = fetch(A + 'ugniatek/refs/skos-panel.webp', 'skos-panel.webp')
    tasks = {
        'ugc-1.png': (UGC + ORIENT + 'Scene: a woman in her 40s in a comfy sweater sits on a '
                      'sofa filmed from the side by a phone propped on the coffee table; she '
                      'presses the flat oval grey massager against the side of her neck with '
                      'ONE hand wrapped naturally around one handle, eyes closed, relieved; '
                      'evening blanket and cushion nearby. ' + NEG),
        'ugc-2.png': (UGC + ORIENT + 'Scene: a man in a hoodie leans back on a couch, the '
                      'massager tucked between his LOWER BACK and the backrest cushion, both '
                      'hands resting free on his knees, head tilted back relaxed; warm floor '
                      'lamp, TV glow in the background blur. ' + NEG),
        'ugc-3.png': (UGC + ORIENT + 'Scene: after home workout — a young adult in sportswear '
                      'sits on a yoga mat on the floor, pressing the massager against one CALF '
                      'with both hands on the handles, water bottle and phone beside the mat, '
                      'daylight from a balcony window. ' + NEG),
    }
    with ThreadPoolExecutor(max_workers=3) as ex:
        futs = {ex.submit(call_edits, p, [spod, skos], k): k for k, p in tasks.items()}
        for f in as_completed(futs):
            k = futs[f]
            try:
                print('OK', k, '->', f.result())
            except Exception as e:
                print('FAIL', k, str(e)[:200])


if __name__ == '__main__':
    main()
