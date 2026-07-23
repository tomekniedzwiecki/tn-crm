# -*- coding: utf-8 -*-
"""F3 BRZUSZEK: sceny produkcyjne HIGH lokalnym /v1/images/edits (fallback: edge wf2-gen 520).
DERYWATY makiet (Z2): image[0] = wyretuszowany packshot g0-retusz (WIERNOSC paszportu),
image[LAST] = crop sceny z ZAAKCEPTOWANEJ makiety (kompozycja/swiatlo). Multi-ref dodatkowy:
g4-glute (POZA side leg raise), ugc-2-0-retusz (stan zlozony). Prompt = wizja sceny + FID blok
wiernosci (elementy paszportu obecne w kadrze) + NEG karty + KLAUZULE STALE. Pattern: recreate
as clean full-bleed photo, REMOVE text/UI/labels.
Uzycie: python scenes-gen.py [nazwa ...] | (bez arg = wszystkie)"""
import base64, io, os, re, sys, time
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image
import requests

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
ASSETS = os.path.join(HERE, 'assets'); os.makedirs(ASSETS, exist_ok=True)
REFS = os.path.join(HERE, 'refs-cache'); os.makedirs(REFS, exist_ok=True)
GALERIA = r'C:\repos_tn\tn-crm\FABRYKA-merach\galeria'
ENV = io.open(r'c:/repos_tn/tn-crm/.env', encoding='utf-8', errors='ignore').read()
KEY = re.search(r'^OPENAI_API_KEY=(.+)$', ENV, re.M).group(1).strip()

G0 = os.path.join(GALERIA, 'g0-retusz.png')          # product ref (image[0]) — WIERNOSC

# ---- cropy kompozycji z ZAAKCEPTOWANYCH makiet (1536x1024) + poza z g4 (1600x1600) ----
CROPS = {
    'ref-hero.png':   ('01-hero.png',        (560, 28, 1536, 1024)),
    'ref-reg.png':    ('04-regulacja.png',   (752, 48, 1502, 996)),
    'ref-wytrz.png':  ('07-wytrzymalosc.png', (26, 36, 816, 992)),
    'ref-core.png':   ('06-wiele-partii.png', (26, 276, 474, 620)),
    'ref-glute.png':  ('06-wiele-partii.png', (1006, 276, 1514, 620)),
    'ref-arms.png':   ('06-wiele-partii.png', (26, 626, 474, 970)),
    'ref-legs.png':   ('06-wiele-partii.png', (1006, 626, 1514, 970)),
    'ref-rozloz.png': ('09-skladanie.png',   (42, 282, 768, 768)),
    'ref-zloz.png':   ('09-skladanie.png',   (776, 282, 1504, 768)),
}
for name, (src, box) in CROPS.items():
    Image.open(os.path.join(OUT, src)).convert('RGB').crop(box).save(os.path.join(REFS, name))
# poza glute z g4 (kwadrant „Glute Workout" — POZA, nie styl; obetnij rozowy pasek podpisu)
Image.open(os.path.join(GALERIA, 'g4.png')).convert('RGB').crop(
    (812, 22, 1590, 686)).save(os.path.join(REFS, 'pose-glute.png'))
print('OK %d refow kompozycji z makiet + poza glute z g4' % len(CROPS))

# ---- KLAUZULE STALE ----
FID = ('Product fidelity (hard, copy the construction ONLY from image 1 = the real product '
       'packshot): the same white steel A-frame with a single diagonal main beam and a sliding '
       'front cart, the pink U-shaped foam knee roller on that cart, two pink cylindrical rollers '
       'beside a white LCD console with one round button, gray handlebar grips curving to the back, '
       'two resistance bands with black foam handles and pedal straps at the base, and two floor '
       'crossbars with gray non-slip end caps — do NOT invent a different device, do NOT describe '
       'or add construction that is not visible in image 1.')

NEG = ('no printed brand text, no MERACH logo, no Shop1103659154, no watermarks, no burned-in text '
       'or UI, no black-red variant, no black-blue variant, no dark or black frame — white frame '
       'with pink rollers only, no fantasy scenery (palms, beach, mountains), no flat sit-up bench, '
       'no exercise bike/stepper/orbitrek, no weight plates or dumbbells. ')

TONE = ('Tone: accent is cool fuchsia-magenta, the room reads as cool whitened lilac mist, never '
        'warm powder pink; rollers stay soft pink but the light stays cool and calm. ')

AVOID = ('Avoid: icy pale-blue kitchen world (rozmrozik); avoid: powder-pink desk / phone-scrolling '
         'world (skrolik); avoid: warm linen kitchen flat-lay (odsaczek); avoid: teal palette '
         '(ugniatek). ')

ANAT = ('Anatomy gate: realistic healthy everyday female figure (NOT a fitness model, no six-pack), '
        'correct natural body proportions, straight wrists, hands on the handlebar grips, face '
        'turned away / not emphasized; for a kneeling pose BOTH knees rest on the pink U-roller. ')

# scene wrapper (z packshotem: LAST = kompozycja makiety, image 1 = produkt)
S = ('Recreate this as a clean full-frame production photograph. REQUIREMENTS: #1 same room, '
     'framing, composition and light as the mockup scene reference (the LAST image); #2 the folding '
     'ab exercise machine at the SAME size and position as in that mockup scene, but its exact '
     'construction copied faithfully from the real product reference (image 1); #3 FULL frame edge '
     'to edge, no fade, no empty colour field, no text zone; #4 REMOVE every text, label chip, '
     'logo, UI element and callout — pure photo. SCENE: ')

# karty seedow EN (VERBATIM z PRZEWODNIK) + NEG-extra karty
CARD = {
 'sc-hero': (
    'Bright real Polish living room in the morning, a woman aged 28-45 with a realistic, healthy '
    'everyday figure (not a fitness model, no six-pack) performing a slow controlled crunch on the '
    'folding ab exercise machine (faithful to the product reference); she kneels with BOTH knees on '
    'the U-shaped roller, forearms resting on the rollers by the console, hands on the handlebar '
    'grips, wrists straight, natural proportions, face turned away from camera / not emphasized; '
    'parquet floor, a rug, a sofa and a leafy houseplant behind her, a window with a light sheer '
    'curtain, soft morning daylight. Locked-off camera, person and machine perfectly still. '
    'Full-frame photo edge to edge, no text. ',
    'no bodybuilder, no six-pack fitness model, no bikini/glamour, no gym/showroom, no children, '
    'no dumbbells/weight plates, no exercise bike/stepper, no flat sit-up bench. '),
 'sc-reg-side': (
    'Clean side profile of the folding ab exercise machine (faithful to the product reference) in a '
    'bright Polish living room, three-quarter-to-side view — frame and emphasize the side profile '
    'exactly as in the reference product photo; calm whitened-lilac background, soft neutral '
    'daylight, real parquet and a hint of sofa out of focus. No person. Full-frame, no text, no '
    'arrows, no measurement callouts. ',
    'no arrows, no burned-in numbers or labels, no gym. '),
 'sc-partie-core': (
    'The same woman (28-45, realistic figure, face not emphasized / turned away) mid-crunch on the '
    'folding ab machine (faithful to reference), kneeling with BOTH knees on the U-roller, forearms '
    'and chest resting against the two rollers by the console, hands gripping the handlebar, wrists '
    'straight, natural proportions; real rug and sofa, bright living room, soft daylight. '
    'Full-frame vertical, no text. ',
    'no six-pack, no glamour, no gym. '),
 'sc-partie-glute': (
    'The same woman performing a side leg raise on the folding ab machine (faithful to reference): '
    'supporting knee on the U-roller, one leg extended straight out to the side, hands on the '
    'handlebar grips, wrists straight, controlled posture, realistic figure, face not emphasized; '
    'same bright living room by the window, soft daylight. Natural hip and limb proportions. '
    'One reference (image 2) shows ONLY the target body pose (side leg raise) — copy the limb '
    'arrangement from it, NOT its dark studio styling. Full-frame vertical, no text. ',
    'no contortion, no glamour, no gym. '),
 'sc-partie-arms': (
    "The same woman training her arms on the machine's resistance bands (faithful to reference) — "
    'frame and show the band exercise exactly as in the reference product photo — standing in a '
    'slight lunge beside the machine which stays in frame as the anchor for the bands, controlled '
    'pull, wrists straight, realistic figure, face not emphasized; same bright living room, soft '
    'daylight. Full-frame vertical, no text. ',
    'no weight plates, no dumbbells, no gym, no glamour. '),
 'sc-partie-legs': (
    'Low close-up at the base of the folding ab machine (faithful to reference) — frame and '
    'emphasize the base area exactly as in the reference product photo, no foot and no staged use; '
    'the machine in frame as the anchor, same living room floor with a rug, bright daylight, '
    'realistic. Full-frame vertical, no text, no fantasy scenery. ',
    'no foot, no person, no fantasy scenery (palms/beach/mountains), no gym. '),
 'sc-wytrz-detal': (
    "Low, bright three-quarter detail of the folding ab machine's frame (faithful to reference) — "
    'frame and emphasize the lower structure exactly as in the reference product photo; calm '
    'whitened-lilac setting, soft daylight grazing the metal, real parquet floor. No person, no '
    'load-test props, no weights. Full-frame, no text. ',
    'no load-test rig, no weight plates, no person. '),
 'sc-sklad-rozloz': (
    'The same woman kneeling beside her sofa next to the UNFOLDED folding ab machine (faithful to '
    'reference), one hand on the safety pin / locking mechanism, face not emphasized, calm everyday '
    'mood; bright living room, soft daylight, real parquet and rug. Natural hand anatomy, straight '
    'wrist. Full-frame vertical, no text. ',
    'no visible dimensions/measurement callouts. '),
 'sc-sklad-zloz': (
    "The FOLDED folding ab machine (faithful to reference AND to the buyer's UGC photo, image 2) "
    'leaning neatly against the same sofa in the bright living room, compact and put away, soft '
    'daylight, real parquet. image 2 is the buyer\'s real photo of the machine in its folded / '
    'put-away state — match that folded configuration. No person, no visible dimensions or '
    'measurement callouts. Full-frame vertical, no text. ',
    'no dimension lines, no measuring tape, no ruler. '),
}

PERSON = {'sc-hero', 'sc-partie-core', 'sc-partie-glute', 'sc-partie-arms', 'sc-sklad-rozloz'}

# (refs w kolejnosci image[0..LAST], size). Produkt = G0 pierwszy; kompozycja makiety = LAST.
G = lambda n: os.path.join(REFS, n)
TASKS = {
 'sc-hero':         ([G0, G('ref-hero.png')],                       '1536x1024'),
 'sc-hero-mobile':  ([G0, G('ref-hero.png')],                       '1024x1536'),
 'sc-reg-side':     ([G0, G('ref-reg.png')],                        '1536x1024'),
 'sc-wytrz-detal':  ([G0, G('ref-wytrz.png')],                      '1536x1024'),
 'sc-partie-core':  ([G0, G('ref-core.png')],                       '1024x1536'),
 'sc-partie-glute': ([G0, G('pose-glute.png'), G('ref-glute.png')], '1024x1536'),
 'sc-partie-arms':  ([G0, G('ref-arms.png')],                       '1024x1536'),
 'sc-partie-legs':  ([G0, G('ref-legs.png')],                       '1024x1536'),
 'sc-sklad-rozloz': ([G0, G('ref-rozloz.png')],                     '1024x1536'),
 'sc-sklad-zloz':   ([G0, G(os.path.join('..', 'assets', 'ugc-2-0-retusz.png')), G('ref-zloz.png')],
                     '1024x1536'),
}


def build_prompt(name):
    card_key = name.replace('-mobile', '')
    seed, neg_extra = CARD[card_key]
    p = S + seed + FID + ' NEG: ' + neg_extra + NEG + TONE + AVOID
    if card_key in PERSON:
        p += ANAT
    if name.endswith('-mobile'):
        p += ('Vertical portrait 3:4 mobile framing — keep the woman and the machine centred, '
              'same room and light. ')
    return p


def gen(name, tries=3):
    refs, size = TASKS[name]
    prompt = build_prompt(name)
    for attempt in range(1, tries + 1):
        try:
            files = []
            for rp in refs:
                rp = os.path.normpath(rp)
                mime = 'image/webp' if rp.endswith('.webp') else 'image/png'
                files.append(('image[]', (os.path.basename(rp), open(rp, 'rb'), mime)))
            r = requests.post('https://api.openai.com/v1/images/edits',
                              headers={'Authorization': 'Bearer ' + KEY},
                              data={'model': 'gpt-image-2', 'prompt': prompt, 'size': size,
                                    'quality': 'high', 'n': '1'}, files=files, timeout=600)
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
