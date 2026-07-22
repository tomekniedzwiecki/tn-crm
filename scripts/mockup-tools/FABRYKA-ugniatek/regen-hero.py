# -*- coding: utf-8 -*-
"""Regeneracja hero-L (feedback Tomka 22.07: wykrzywione nadgarstki/dlonie — LL-039).
2 kandydaci z twarda anatomia dloni w wizji sceny; gate anatomii wybiera. Wyjscie:
assets/hero-L-v2a.png / hero-L-v2b.png."""
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
       'two integrated cut-out handles WITH molded finger grooves on their underside (as in the '
       'real photo); exactly six black foam ball heads in a 2x3 grid underneath, oval perforated '
       'panel in the center of the underside, side control panel with segment display and '
       'plus/minus buttons; no pistol grip, no interchangeable heads, single colorway, '
       'no text overlays, no logos, no watermarks. '
       'Hand anatomy (hard): natural relaxed hands, five fingers each, straight wrists; '
       'no twisted or bent-back wrists, no contorted fingers, no extra or fused fingers, '
       'no impossible hand poses.')

S = ('Recreate this exact scene as a clean production photo. REQUIREMENTS: '
     '#1 same room, framing and light as the mockup reference; '
     '#2 the product SAME size and position as in the mockup, but its exact look copied '
     'from the real product photo (image 1); '
     '#3 FULL frame edge to edge, NO fade, NO empty color field, NO text zone; '
     '#4 REMOVE all text, UI, callout lines and overlays — pure photographic scene. ')

ORIENT = ('USAGE ORIENTATION (hard): the six black ball heads FACE THE BODY and press into '
          'the muscles — the balls are mostly HIDDEN between the device and the body; the '
          'smooth grey TOP COVER with subtle contour lines faces the CAMERA; the side control '
          'panel stays visible on the edge. NEVER point the ball heads at the camera while '
          'the device is in use. ')

# Wizja dloni PRZEPISANA (LL-039): chwyt jak trzymanie recznika na karku — najprostszy
# naturalny uklad; nadgarstki proste, lokcie nisko. Zakaz trudnej pozy "oburacz za glowa".
HANDS = ('HANDS (critical, most important part of this image): the person holds the massager '
         'against the base of the neck LIKE HOLDING A TOWEL DRAPED AROUND THE NECK — each hand '
         'wraps naturally around one side handle from the front, fingers curled comfortably '
         'around the handle, thumbs resting on top, WRISTS STRAIGHT and relaxed, elbows low '
         'by the sides. Both hands clearly natural and comfortable, nothing strained. ')


def fetch(url, name):
    p = os.path.join(REFS, name)
    if not os.path.isfile(p):
        urllib.request.urlretrieve(url, p)
    return p


def call_edits(prompt, ref_paths, size, out_name, tries=3):
    import requests
    for attempt in range(1, tries + 1):
        try:
            files = []
            for rp in ref_paths:
                mime = 'image/webp' if rp.endswith('.webp') else 'image/png'
                files.append(('image[]', (os.path.basename(rp), open(rp, 'rb'), mime)))
            data = {'model': 'gpt-image-2', 'prompt': prompt, 'size': size,
                    'quality': 'high', 'n': '1'}
            r = requests.post('https://api.openai.com/v1/images/edits',
                              headers={'Authorization': 'Bearer ' + KEY},
                              data=data, files=files, timeout=600)
            if r.status_code != 200:
                raise RuntimeError('HTTP %s: %s' % (r.status_code, r.text[:300]))
            b64 = r.json()['data'][0]['b64_json']
            out = os.path.join(ASSETS, out_name)
            open(out, 'wb').write(base64.b64decode(b64))
            return out
        except Exception as e:
            print('  [%s] proba %d/%d FAIL: %s' % (out_name, attempt, tries, str(e)[:200]))
            if attempt == tries:
                raise
            time.sleep(8 * attempt)


def main():
    real_spod = fetch(A + 'ugniatek/refs/spod-packshot.webp', 'spod-packshot.webp')
    real_skos = fetch(A + 'ugniatek/refs/skos-panel.webp', 'skos-panel.webp')
    mk_hero = os.path.join(REFS, 'mk-hero-L.png')
    base_prompt = (S + ORIENT + HANDS +
                   'Scene: adult in grey home t-shirt seen from behind on a couch, the flat oval '
                   'grey massager resting against the neck and shoulders (ball heads against the '
                   'neck muscles, top cover to camera), evening living room, cool dusk window '
                   'plus one warm lamp, porcelain-grey palette. ' + NEG)
    tasks = {
        'hero-L-v2a.png': dict(prompt=base_prompt, refs=[real_spod, real_skos, mk_hero]),
        # wariant b: bez makiety jako ref (makieta niosla wykrecony chwyt) — kompozycja z opisu
        'hero-L-v2b.png': dict(prompt=base_prompt, refs=[real_spod, real_skos]),
    }
    with ThreadPoolExecutor(max_workers=2) as ex:
        futs = {ex.submit(call_edits, t['prompt'], t['refs'], '1024x1536', k): k
                for k, t in tasks.items()}
        for f in as_completed(futs):
            k = futs[f]
            try:
                print('OK', k, '->', f.result())
            except Exception as e:
                print('FAIL', k, str(e)[:200])


if __name__ == '__main__':
    main()
