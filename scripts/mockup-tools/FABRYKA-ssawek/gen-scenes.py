# -*- coding: utf-8 -*-
"""F3 sceny produktowe SSAWEK (Popiolek) — scene-from-mockup.
Doktryna F3A/prompt-lint: prompt = WIZJA SCENY; wyglad produktu = WYLACZNIE referencja
(image1 prod-clean, logo-free) + prefix 'Image 1 is the EXACT product... single source of truth'.
Kompozycja = makieta/ crop foto (image2). ZERO opisu cech produktu w prompcie.
Typ osadzenia: A (hero/mid-cta/final) = strefa fade do #F3EDE4; B/C (reszta) = pelny kadr.
problem = BEZ produktu (ref=comp-problem + styl-master, prompt jawnie wyklucza produkt).
Kanal: probe local HIGH; jak 520 -> edge MEDIUM (WF2_SKIP_LOCAL) z nota (LEDGER F2.5).
Uzycie: python gen-scenes.py all | hero-d problem ..."""
import os, sys, json, io
from concurrent.futures import ThreadPoolExecutor, as_completed
import genlib as G
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
REFS = os.path.join(HERE, 'refs-cache')
COMP = os.path.join(REFS, 'comp')
PUB = G.PUB + 'bud-assets/ssawek/'

# ── referencje lokalne (local HIGH) ──
PRODL = os.path.join(REFS, 'prod-clean.png')
STYLL = os.path.join(HERE, 'brand', '00-styl-master.png')
def cl(n): return os.path.join(COMP, n + '.png')
def ml(n): return os.path.join(OUT, n + '.png')
# ── referencje URL (edge MEDIUM) ──
PRODU = PUB + 'refs/prod-clean.webp'
STYLU = PUB + 'brand/00-styl-master.webp'
def cu(n): return PUB + 'refs/' + n + '.webp'
def mu(n): return PUB + 'makiety/' + n + '.webp'

# prefix referencji produktu (matchuje prompt-lint REF_PREFIX + --expect-product-ref)
PFX = ('Image 1 is the EXACT product and the single source of truth for how it looks — reproduce '
       'it completely unchanged, change ONLY the scene around it. Image 2 is the target scene '
       'layout — reproduce its framing, camera angle, product placement, setting and lighting. ')

SCENE_EXCL = (' Photorealistic photograph, natural realistic lighting and depth of field, no '
              'illustration or 3D-render look. NO text, NO captions, NO numbers, NO number tabs, '
              'NO UI, NO buttons, NO cards, NO watermark, NO brand logo or printed brand name '
              'anywhere in the image, NO price tags, NO badges, no browser chrome, no device or '
              'phone frame. Keep the product perfectly sharp, physically plausible and consistent.')

ANAT = (' Natural relaxed hands, straight wrists, five natural fingers per hand, anatomically '
        'correct comfortable grip; avoid twisted or bent-back wrists, contorted or fused fingers, '
        'impossible hand poses.')

HERO_SCENE = (PFX + 'A short canister vacuum stands on a warm brick-and-concrete hearth beside a lit '
              'fireplace in warm golden evening light; a DENSE, COHERENT ribbon of fine grey ash '
              'and soot — a solid rope of smoke-like ash, not scattered specks — is drawn in a '
              'soft spiral from the glowing hearth into the vacuum nozzle; firewood stacked nearby, '
              'cozy home-hearth mood. Reproduce this scene from Image 2 but REMOVE the top nav bar, '
              'the offer card and ALL text/UI; the ash ribbon stays prominent and entirely clear '
              'of the empty copy area. ')

def hero_fade(where):
    return ('Leave the %s of the frame as calm empty negative space that FADES SEAMLESSLY into '
            'flat solid sand colour #F3EDE4 for copy to be placed later (a smooth photographic '
            'transition, never a hard rectangle). ' % where)

# key -> (out_name, aspect, [ (local,url,type) refs ], prompt_body, person)
SC = {
 'hero-d': ('hero-d', '3:2',
    [(PRODL, PRODU, 'product'), (ml('01-hero'), mu('01-hero'), 'ref')],
    HERO_SCENE + 'Wide landscape framing, the product on the right third. ' + hero_fade('lower-left') + ANAT, True),
 'hero-m': ('hero-m', '2:3',
    [(PRODL, PRODU, 'product'), (ml('01-hero'), mu('01-hero'), 'ref')],
    HERO_SCENE + 'Tall portrait reframe of the SAME scene, product in the upper-centre so it stays '
    'fully visible above a bottom copy area. ' + hero_fade('lower area') + ANAT, True),
 'hero-t': ('hero-t', '1:1',
    [(PRODL, PRODU, 'product'), (ml('01-hero'), mu('01-hero'), 'ref')],
    HERO_SCENE + 'Square reframe of the SAME scene, product centre-right. ' + hero_fade('lower-left') + ANAT, True),

 'problem': ('problem', '1:1',
    [(cl('comp-problem'), cu('comp-problem'), 'ref'), (STYLL, STYLU, 'ref')],
    'Reproduce the same scene, framing and muted cool daylight as Image 1: a householder crouched '
    'at a cold fireplace scooping grey ash with a small hand shovel into a metal bucket; a soft '
    'cloud of fine ash rises and settles as grime over the hearth and floor; dusty, frustrating, '
    'messy. Remove any text or UI. ABSOLUTELY NO vacuum cleaner and NO appliance of ours anywhere '
    'in the frame — only the old shovel-and-bucket way. Full frame edge to edge, no empty colour '
    'panel.' + ANAT, True),

 'rozwiazanie': ('rozwiazanie', '1:1',
    [(PRODL, PRODU, 'product'), (cl('comp-rozwiazanie'), cu('comp-rozwiazanie'), 'ref')],
    PFX + 'The scene: the vacuum on a hearth cleanly drawing a controlled stream of grey fireplace '
    'ash, while a hand guides the metal wand from above; polished workshop tools hang on the wall '
    'behind; warm even light, close enough to read the machine clearly, no mess escaping. Remove '
    'all text and UI; full frame edge to edge, no empty colour panel.' + ANAT, True),

 'demo-01': ('demo-01', '1:1',
    [(PRODL, PRODU, 'product'), (cl('comp-demo-01'), cu('comp-demo-01'), 'ref')],
    PFX + 'Close scene: a hand clipping the metal wand and corrugated hose onto the side intake of '
    'the vacuum, which stands on its wheeled base on a workshop floor; warm practical light. Remove '
    'all text, numbers, tabs and UI; full frame edge to edge.' + ANAT, True),
 'demo-02': ('demo-02', '1:1',
    [(PRODL, PRODU, 'product'), (cl('comp-demo-02'), cu('comp-demo-02'), 'ref')],
    PFX + 'Scene: the vacuum on the floor, its wand and floor nozzle drawing a stream of grey ash '
    'and fine rubble from a hearth floor, a fireplace behind; warm light. Remove all text, numbers, '
    'tabs and UI; full frame edge to edge.', False),
 'demo-03': ('demo-03', '1:1',
    [(PRODL, PRODU, 'product'), (cl('comp-demo-03'), cu('comp-demo-03'), 'ref')],
    PFX + 'Scene: two gloved hands lifting the grey mesh basket filter out of the vacuum and tapping '
    'loose grey ash into a metal bucket; the red-topped lid of the vacuum is visible at the top of '
    'the frame; workshop setting, warm light. Remove all text, numbers, tabs and UI; full frame edge '
    'to edge.' + ANAT, True),

 'zast-kominek': ('zast-kominek', '3:2',
    [(PRODL, PRODU, 'product'), (cl('comp-zast-kominek'), cu('comp-zast-kominek'), 'ref')],
    PFX + 'Scene: the vacuum beside a black wood-burning stove with a visible fire, its hose running '
    'toward the stove, a wooden crate of logs nearby; warm indoor light. Remove all text, caption '
    'chips and UI; full frame edge to edge.', False),
 'zast-gruz': ('zast-gruz', '3:2',
    [(PRODL, PRODU, 'product'), (cl('comp-zast-gruz'), cu('comp-zast-gruz'), 'ref')],
    PFX + 'Scene: the vacuum on a concrete floor amid building rubble and plaster debris after a '
    'renovation, its hose extended across the rubble, a bare wall behind; cool daylight. Remove all '
    'text, caption chips and UI; full frame edge to edge.', False),
 'zast-warsztat': ('zast-warsztat', '1:1',
    [(PRODL, PRODU, 'product'), (cl('comp-zast-warsztat'), cu('comp-zast-warsztat'), 'ref')],
    PFX + 'Scene: the vacuum in a garage beside a car wheel, wood shavings on the floor, a tool '
    'cabinet behind; practical light. Remove all text, caption chips and UI; full frame edge to edge.', False),
 'zast-dzialka': ('zast-dzialka', '1:1',
    [(PRODL, PRODU, 'product'), (cl('comp-zast-dzialka'), cu('comp-zast-dzialka'), 'ref')],
    PFX + 'Scene: the vacuum outdoors on a paved patio using its blower function to blow dry autumn '
    'leaves across the pavement, garden greenery behind; natural daylight. Remove all text, caption '
    'chips and UI; full frame edge to edge.', False),

 'mid-cta': ('mid-cta', '3:2',
    [(PRODL, PRODU, 'product'), (ml('09-mid-cta'), mu('09-mid-cta'), 'ref')],
    PFX + 'Scene: the vacuum in warm workshop light with stacked firewood, a shovel and metal wands '
    'nearby and a fireplace hearth to the right; warm inviting decision mood. REMOVE the left copy '
    'card and all text/UI. Leave the LEFT ~45% of the frame as calm empty negative space that FADES '
    'SEAMLESSLY into flat solid sand colour #F3EDE4 for copy (a smooth photographic transition, '
    'never a hard rectangle).', False),

 'final': ('final', '3:2',
    [(PRODL, PRODU, 'product'), (ml('16-final'), mu('16-final'), 'ref')],
    PFX + 'Scene: a tidy cosy living room after a fire — the vacuum standing ready by a clean hearth '
    'where flames flicker softly, an armchair with a throw, a window with warm sunset light, wooden '
    'floor and a rug, the wand and floor nozzle resting nearby; calm warm end-of-day mood. REMOVE '
    'the bottom copy band and all text/UI. Leave the LOWER portion of the frame FADING SEAMLESSLY '
    'into flat solid sand colour #F3EDE4 as empty space for copy (smooth photographic transition, '
    'never a hard band).', False),
}


def build_prompt(body):
    return body + SCENE_EXCL


def gen(key):
    out_name, aspect, refs, body, _person = SC[key]
    prompt = build_prompt(body)
    local = [r[0] for r in refs]
    typed = [{'url': r[1], 'type': r[2]} for r in refs]
    return G.generate(key, 'sc-%s.png' % out_name, prompt, local, typed, aspect, 'ssawek-f3-%s' % out_name)


def dump_prompts():
    p = os.path.join(HERE, 'out', 'f3-prompts.txt')
    with io.open(p, 'w', encoding='utf-8') as f:
        for k in SC:
            f.write('# %s\n%s\n' % (k, build_prompt(SC[k][3])))
    print('prompty ->', p)


if __name__ == '__main__':
    args = sys.argv[1:]
    if args and args[0] == 'dump':
        dump_prompts(); sys.exit(0)
    todo = list(SC) if (not args or args == ['all']) else args
    ok, fail = [], []
    with ThreadPoolExecutor(max_workers=4) as ex:
        futs = {ex.submit(gen, s): s for s in todo}
        for fu in as_completed(futs):
            s = futs[fu]
            try:
                ok.append(fu.result()); print('OK', s)
            except Exception as e:
                fail.append(s); print('FAIL', s, str(e)[:180])
    print('GOTOWE sceny: %d OK, %d FAIL %s' % (len(ok), len(fail), fail))
