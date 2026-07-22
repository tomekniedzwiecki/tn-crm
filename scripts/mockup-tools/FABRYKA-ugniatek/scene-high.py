# -*- coding: utf-8 -*-
"""Runner scen HIGH dla Ugniatka (F3): lokalny OpenAI /v1/images/edits, gpt-image-2,
quality=high, multi-ref (image[0] = PRODUKT wierność; dalsze = kompozycja/scena).
Zadania z TASKS; retry x2 na transient; 3 watki. Wyjscie: FABRYKA-ugniatek/assets/*.png"""
import base64, io, json, os, re, sys, time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, 'assets')
REFS = os.path.join(HERE, 'refs-cache')
os.makedirs(ASSETS, exist_ok=True)
os.makedirs(REFS, exist_ok=True)

ENV = io.open(r'c:/repos_tn/tn-crm/.env', encoding='utf-8', errors='ignore').read()
KEY = re.search(r'^OPENAI_API_KEY=(.+)$', ENV, re.M).group(1).strip()

NEG = ('Product fidelity (hard, copy from image 1): flat oval massager in SATIN SILVER-GREY '
       '(misty gray) finish — soft metallic satin look, NOT mirror chrome, NOT dark graphite; '
       'two integrated cut-out handles WITH molded finger grooves on their underside (as in the '
       'real photo); exactly six black foam ball heads in a 2x3 grid underneath, oval perforated '
       'panel in the center of the underside, side control panel with segment display and '
       'plus/minus buttons; no pistol grip, no interchangeable heads, single colorway, '
       'no text overlays, no logos, no watermarks.')

A = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'


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


def main(only=None):
    # refy realne (wiernosc) + cropy kompozycji z makiet (przygotowane przez prep-refs.py)
    real = {
        'spod': fetch(A + 'ugniatek/refs/spod-packshot.webp', 'spod-packshot.webp'),
        'skos': fetch(A + 'ugniatek/refs/skos-panel.webp', 'skos-panel.webp'),
        'pas': fetch(A + 'ugniatek/gallery/scena-pas.webp', 'scena-pas.webp'),
        'blat': fetch(A + 'ugniatek/gallery/lifestyle-blat.webp', 'lifestyle-blat.webp'),
    }
    mk = lambda n: os.path.join(REFS, n)  # cropy makiet z prep-refs.py

    S = ('Recreate this exact scene as a clean production photo. REQUIREMENTS: '
         '#1 same room, framing and light as the mockup reference; '
         '#2 the product SAME size and position as in the mockup, but its exact look copied '
         'from the real product photo (image 1); '
         '#3 FULL frame edge to edge, NO fade, NO empty color field, NO text zone; '
         '#4 REMOVE all text, UI, callout lines and overlays — pure photographic scene. ')

    # ORIENTACJA UZYCIA (poprawka 1. pary oczu 22.07: model kopiowal widok image[0]=spod
    # i kierowal kule DO KAMERY = masaz "pokrywa"; scena uczyla zlego uzycia)
    ORIENT = ('USAGE ORIENTATION (hard): the six black ball heads FACE THE BODY and press into '
              'the muscles — the balls are mostly HIDDEN between the device and the body; the '
              'smooth grey TOP COVER with subtle contour lines faces the CAMERA; the side control '
              'panel stays visible on the edge. NEVER point the ball heads at the camera while '
              'the device is in use. ')

    TASKS = {
        'hero-L': dict(size='1024x1536', refs=[real['spod'], real['skos'], mk('mk-hero-L.png')],
            prompt=S + ORIENT + 'Scene: adult in grey home t-shirt seen from behind on a couch, '
            'pressing the flat oval grey massager with both hands against their neck and shoulder '
            '(ball heads against the neck muscles, top cover to camera), evening living room, '
            'cool dusk window plus one warm lamp, porcelain-grey palette. ' + NEG),
        'hero-P': dict(size='1024x1536', refs=[real['spod'], mk('mk-hero-P.png'), real['pas']],
            prompt=S + ORIENT + 'Scene: the same living room, dusk light and palette as the '
            'companion frame: the massager lies on the sofa seat with its ball heads pointing UP, '
            'and the person leans their lower back ONTO the ball heads, relaxed posture, side '
            'panel visible on the device edge. ' + NEG),
        'an-makro': dict(size='1536x1024', refs=[real['spod']],
            prompt='Macro close-up of the CENTER of the underside of this exact device: oval '
            'perforated panel glowing with soft warm red light between black foam ball heads, '
            'subtle honest glow, no lens flare, dark-grey panel area, shallow depth of field, '
            'realistic product photography. ' + NEG),
        'st-panel': dict(size='1536x1024', refs=[real['spod'], real['skos'], mk('mk-st-foto.png')],
            prompt=S + 'Scene: top-down angled view of the massager lying on a light wooden '
            'sideboard by a window, side control panel with segment display showing P3 and '
            'plus/minus buttons, an adult finger pressing the plus button, correct complete hand '
            'anatomy, soft daylight, potted plant blurred in background. ' + NEG),
        'wi-biurko': dict(size='1536x1024', refs=[real['spod'], mk('mk-wi-biurko.png')],
            prompt=S + ORIENT + 'Scene: adult in a home office corner at dusk, sitting relaxed '
            'on an armchair by a desk with a warm desk lamp, naturally holding the flat oval grey '
            'massager with both hands against their lower back — ball heads pressed into the '
            'lower back, top cover to camera (comfortable, unforced pose), tired-but-relieved '
            'posture, cool evening light. ' + NEG),
        'wi-trening': dict(size='1536x1024', refs=[real['spod'], mk('mk-wi-trening.png')],
            prompt=S + ORIENT + 'Scene: adult in casual everyday sportswear sitting on an '
            'exercise mat in a home corner after a workout, pressing the massager with both '
            'handles against their calf — ball heads against the calf muscle, top cover to '
            'camera, water bottle nearby, evening home light. ' + NEG),
        'packshot-34': dict(size='1536x1024', refs=[real['spod'], real['skos']],
            prompt='Canonical clean product packshot: three-quarter studio view of this exact '
            'device on a flat porcelain-mist #EEF1F2 field, slim oval profile with two smooth '
            'integrated handles, six black ball heads just visible underneath, soft even studio '
            'light, gentle soft shadow, generous empty space around. ' + NEG),
        'ze-flatlay': dict(size='1536x1024', refs=[real['spod'], mk('mk-ze-flatlay.png')],
            prompt=S + 'Scene: overhead flat lay on porcelain-grey background: the massager, a '
            'neatly coiled white USB cable, a folded PLAIN paper manual (no branding), and a '
            'PLAIN brown cardboard box WITHOUT any print or logo, even spacing, soft shadowless '
            'light. ' + NEG),
        'ze-profil': dict(size='1536x1024', refs=[real['spod'], real['skos']],
            prompt='Clean side profile of this exact device standing on a porcelain-grey surface, '
            'showing its full 11 cm thickness: flat oval satin silver-grey body on six black ball heads '
            '(three visible in a row from the side), studio light, plain background. ' + NEG),
    }
    TASKS.update({
        'df-A': dict(size='1536x1024', refs=[real['spod'], real['blat']],
            prompt='Close-up detail photo: two hands gripping BOTH integrated grooved handles of '
            'the flat oval satin silver-grey massager, pressing its six black ball heads into a '
            'thigh (balls against the muscle, mostly hidden; smooth top cover to camera), '
            'home setting, soft light, correct complete hand anatomy. ' + ORIENT + NEG),
        'df-B': dict(size='1536x1024', refs=[real['spod'], real['pas']],
            prompt='Close-up detail photo: the flat oval satin silver-grey massager tucked '
            'between the lower back of a seated person and a light sofa backrest, ball heads pressing into '
            'the lower back, side control panel with segment display visible on the edge, cozy '
            'home light, no faces. ' + ORIENT + NEG),
    })
    TASKS.update({
        'fn-A': dict(size='1024x1536', refs=[real['spod'], real['blat']],
            prompt=S + ORIENT + 'Scene: close portrait crop, adult in soft grey home knit seen '
            'from the side-back, pressing the flat oval grey massager with both hands against '
            'the BACK OF THE NECK high under the hairline (tight vertical framing, head gently '
            'tilted forward). CRITICAL: the six black ball heads are INVISIBLE in this photo — '
            'they are pressed flat AGAINST THE NECK SKIN; the camera sees ONLY the smooth plain '
            'grey TOP COVER of the device and the two handles held by the hands. If any black '
            'ball is visible, the orientation is WRONG. Warm evening home light, porcelain-grey '
            'palette. ' + NEG),
        'fn-B': dict(size='1024x1536', refs=[real['spod'], real['pas']],
            prompt=S + ORIENT + 'Scene: vertical portrait crop, adult sitting on a light '
            'fabric armchair, the massager tucked between the MID-BACK (between shoulder '
            'blades) and the armchair backrest, person leaning back with closed-eyes calm, '
            'side control panel visible on device edge, soft dusk light. ' + NEG),
    })
    todo = {k: v for k, v in TASKS.items() if not only or k in only}
    print('zadan:', len(todo))
    ok, fail = [], []
    with ThreadPoolExecutor(max_workers=3) as ex:
        futs = {ex.submit(call_edits, t['prompt'], t['refs'], t['size'], k + '.png'): k
                for k, t in todo.items()}
        for f in as_completed(futs):
            k = futs[f]
            try:
                p = f.result()
                ok.append(k); print('OK', k, '->', p)
            except Exception as e:
                fail.append(k); print('FAIL', k, str(e)[:200])
    print('\nOK:', len(ok), 'FAIL:', fail or '-')


if __name__ == '__main__':
    main(set(sys.argv[1:]) or None)
