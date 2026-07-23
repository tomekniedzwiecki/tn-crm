# -*- coding: utf-8 -*-
"""F3 ROZGRZEWEK: sceny produkcyjne (DERYWATY zaakceptowanych makiet Z2).
Primary local /v1/images/edits gpt-image-2 HIGH; fallback edge wf2-gen MEDIUM (genlib).
Refy: image[0]=navy-whole (panel/kolnierz), image[1]=head-face (21 kulek+LED), image[LAST]=ref-<scena>
(kadr/swiatlo/poza + wierny granat z makiety). Prompt = wizja sceny + FID (wiernosc) + NEG karty +
NEG wspolny + KLAUZULE (TONE anti-dryf tla, AVOID cross-landing) + ANAT (sceny z osoba).
HERO: nosnik ruchu WYSTAWIONY (rozmyty kubek z para + poswiata lampy na brzegu; produkt statyczny).
Uzycie: python scenes-gen.py all | sc-hero sc-moment ...
"""
import json, os, sys
from concurrent.futures import ThreadPoolExecutor, as_completed
import genlib as G

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
REFS = os.path.join(HERE, 'refs-cache')
R = lambda n: os.path.join(REFS, n)
NAVY, HEAD = R('navy-whole.png'), R('head-face.png')
REF_BASE = 'bud-assets/rozgrzewek/refs'

# ---------- KLAUZULE STALE ----------
FID = ('Product fidelity (HARD — copy the construction ONLY from the product reference images: '
       'image 1 = handle & control panel, image 2 = head macro): a NAVY-BLUE matte "mushroom" body '
       'massager — a rounded handle closed by a dome at the top, a round LED level display set in a '
       'metallic champagne bezel showing a digit with three tiny status dots (red / blue / green) '
       'and two physical buttons below it, a thin metallic champagne collar ring where the handle '
       'meets the head, and a rounded navy vertically-ribbed dome head carrying chromed steel '
       'ball-tipped beads in concentric rings with a subtle red LED glow between them. Do NOT invent '
       'a different device, do NOT change the colour, do NOT add cables, charging ports, extra '
       'buttons, screens or dimensions. ')

NEG = ('NEG: no printed brand text, no Hailicare logo, no watermarks, no burned-in text or UI, no '
       'caption chips, no white/gray/ivory variant, no pink/magenta/rose variant, no '
       'champagne/ivory-gold-BODIED variant (the champagne COLLAR RING stays) — navy-blue body with '
       'silver beaded head ONLY; no massage-gun / percussion pistol body, no jade roller, no stone '
       'gua-sha, no interchangeable heads; no medical clinic aesthetics, no spa salon, no therapist '
       'in a white coat, no red glowing energy rays. ')

TONE = ('Tone: warm cozy Polish evening; any flat background field is warm whitened seashell-peach '
        '#F3E9E3 (a warm peach-shell, NEVER yellow linen-beige, NEVER powder pink, NEVER lilac); '
        'warm table-lamp light, soft warm-ambient shadows. ')

AVOID = ('Avoid: cool lilac living-room workout world (previous landing), icy pale-blue kitchen, '
         'powder-pink desk, warm linen kitchen flat-lay, teal palette. ')

ANAT = ('Anatomy gate: a woman aged 30-55 with a realistic everyday figure (NOT a model), face '
        'turned away / cropped above the shoulders / off-axis and never emphasized; hands with '
        'correct anatomy, straight wrists, a natural grip on the massager handle, realistic '
        'non-contorted arm reach; calm relaxed self-care mood, NO pain grimace, no white coat, no '
        'clinic, no spa, no bikini/glamour, no children. ')

# wrapper: odtworz scene z refa kompozycji jako czysta pelnokadrowa fotografia
S = ('Recreate this as a clean, full-frame production photograph. REQUIREMENTS: #1 same room, '
     'framing, composition and light as the scene reference (the LAST image); #2 the navy massager '
     'at the same size and position as in that scene reference, but its exact construction copied '
     'faithfully from the product references (image 1 + image 2); #3 FULL frame edge to edge, no '
     'fade, no empty colour band, no text zone, no caption chip; #4 REMOVE every text, label chip, '
     'logo, UI overlay and caption — a pure photograph only. SCENE: ')

# ---------- KARTY (seed EN VERBATIM z PRZEWODNIKA) ----------
PERSON = {'sc-moment', 'sc-obszary-neck', 'sc-obszary-shoulder', 'sc-obszary-back', 'sc-obszary-thigh'}
AREA = ('Close 3/4 home shot, a woman\'s hand (no face in frame) gently guiding the navy body '
        'massager over %s, soft sweater or cozy home clothing, warm soft evening home light, '
        'relaxed self-care mood, real Polish home. Full-frame, no text. ')

CARD = {
 # HERO — nosnik ruchu WYSTAWIONY na brzegu (kubek+para+lampa); produkt statyczny, centralny.
 'sc-hero': (
    'Editorial product isolation on a flat calm warm whitened seashell-peach #F3E9E3 colour field: '
    'the navy massager stands upright and perfectly still in the centre with a soft warm layered '
    'shadow beneath it. Additionally introduce, entering softly from the RIGHT frame EDGE (clearly '
    'present, NOT cropped away, gently out of focus), a warm mug of tea with a single delicate wisp '
    'of rising steam and a warm table-lamp glow, so the edge reads as a living cozy evening ambience '
    'around the static product. The product, its LED display and its beads stay sharp and '
    'motionless; only the blurred mug, steam and lamp glow form the ambient layer. Calm evening '
    'mood. Full frame, no text. ', ''),
 # MOMENT — VERBATIM
 'sc-moment': (
    'A woman 30-55 (no face, cropped above the shoulders / off-axis) relaxing on a sofa under a soft '
    'knitted blanket in a real cozy Polish living room in the evening, holding the navy body '
    'massager (faithful to reference) resting against her upper arm/shoulder, a warm table lamp, a '
    'mug of tea and a lit candle on the side table behind, soft warm evening light, calm self-care '
    'mood, content-safe empty zone on the RIGHT. Full-frame, no text. ',
    'no pain grimace, no clinic, no spa. '),
 'sc-obszary-neck':     (AREA % 'the side of the neck and upper shoulder', ''),
 'sc-obszary-shoulder': (AREA % 'the shoulder and upper arm', ''),
 'sc-obszary-back':     (AREA % 'the upper back with a natural, non-contorted reach',
                         'no red heat-map, no pain-zone graphics, no contorted arm reach. '),
 'sc-obszary-thigh':    (AREA % 'the front of the thigh while seated, in comfortable loungewear',
                         'NO cellulite / anti-cellulite framing, NO slimming / weight-loss framing, '
                         'NO measuring tape, NO bikini / fitness styling — neutral home loungewear. '),
 # AUTONOMIA — VERBATIM
 'sc-autonomia': (
    'The navy body massager (faithful to reference) resting calmly on a bedside / side table next '
    'to a warm glowing lamp, a folded blanket edge and a small plant, cozy evening home corner, '
    'soft warm light. Full-frame, no text. ',
    'do NOT show a charging-port close-up or a cable. '),
 # FINAL — VERBATIM
 'sc-final': (
    'Early-evening cozy Polish home, the navy body massager (faithful to reference) lying calmly on '
    'a side table beside a mug of tea, a soft blanket and a warm glowing lamp, a sheer curtain by '
    'the window gently stirred by warm air, lots of empty negative space for text, relaxed after-day '
    'mood. Full-frame edge to edge, no text. ', ''),
}

# ---------- TASKS: (card_key, [refy lokalne], ref-composition-name, aspect) ----------
# aspect: '3:2'=1536x1024 desktop, '2:3'=1024x1536 mobile/portret
TASKS = {
 'sc-hero':            ('sc-hero',            'ref-hero.png',      '3:2'),
 'sc-hero-mobile':     ('sc-hero',            'ref-hero.png',      '2:3'),
 'sc-moment':          ('sc-moment',          'ref-moment.png',    '3:2'),
 'sc-moment-mobile':   ('sc-moment',          'ref-moment.png',    '2:3'),
 'sc-obszary-neck':    ('sc-obszary-neck',    'ref-neck.png',      '2:3'),
 'sc-obszary-shoulder':('sc-obszary-shoulder','ref-shoulder.png',  '2:3'),
 'sc-obszary-back':    ('sc-obszary-back',    'ref-back.png',      '2:3'),
 'sc-obszary-thigh':   ('sc-obszary-thigh',   'ref-thigh.png',     '2:3'),
 'sc-autonomia':       ('sc-autonomia',       'ref-autonomia.png', '3:2'),
 'sc-autonomia-mobile':('sc-autonomia',       'ref-autonomia.png', '2:3'),
 'sc-final':           ('sc-final',           'ref-final.png',     '3:2'),
 'sc-final-mobile':    ('sc-final',           'ref-final.png',     '2:3'),
}

MOBILE_NOTE = ('Vertical portrait framing (taller than wide) — keep the massager and the scene '
               'centred with generous headroom, same room and warm light, product not cropped. ')


def ensure_ref_urls():
    """Upload refow scen do Storage (idempotent, dla fallbacku edge). Cache: refs-urls.json."""
    cache = os.path.join(HERE, 'refs-urls.json')
    if os.path.exists(cache):
        return json.load(open(cache, encoding='utf-8'))
    import importlib.util
    PS = r'C:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py'
    spec = importlib.util.spec_from_file_location('ps', PS)
    ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)
    urls = {}
    for n in ['navy-whole.png', 'head-face.png'] + [t[1] for t in TASKS.values()]:
        if n in urls:
            continue
        dest = '%s/%s.webp' % (REF_BASE, n[:-4])
        urls[n] = ps.storage_upload(R(n), dest, to_webp=True, quality=88)
    json.dump(urls, open(cache, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    return urls


REF_URLS = None


def build_prompt(name):
    card_key, ref_name, aspect = TASKS[name]
    seed, neg_extra = CARD[card_key]
    p = S + seed + FID + (('NEG-extra: ' + neg_extra) if neg_extra else '') + NEG + TONE + AVOID
    if card_key in PERSON:
        p += ANAT
    if name.endswith('-mobile') or (aspect == '2:3' and card_key not in {'sc-moment'}):
        p += MOBILE_NOTE
    return p


def refs_for(name):
    card_key, ref_name, aspect = TASKS[name]
    local = [NAVY, HEAD, R(ref_name)]
    typed = [{'url': REF_URLS['navy-whole.png'], 'type': 'product'},
             {'url': REF_URLS['head-face.png'], 'type': 'product'},
             {'url': REF_URLS[ref_name], 'type': 'ref'}]
    return local, typed


def gen(name):
    card_key, ref_name, aspect = TASKS[name]
    prompt = build_prompt(name)
    local, typed = refs_for(name)
    return G.generate(name, name + '.png', prompt, local, typed, aspect, 'rozgrzewek-sc-' + card_key)


if __name__ == '__main__':
    args = sys.argv[1:]
    todo = list(TASKS) if (not args or args == ['all']) else args
    REF_URLS = ensure_ref_urls()
    ok, fail = [], []
    with ThreadPoolExecutor(max_workers=4) as ex:
        futs = {ex.submit(gen, s): s for s in todo}
        for f in as_completed(futs):
            s = futs[f]
            try:
                ok.append(f.result()); print('OK', s)
            except Exception as e:
                fail.append(s); print('FAIL', s, str(e)[:160])
    print('GOTOWE sceny: %d OK, %d FAIL %s' % (len(ok), len(fail), fail))
