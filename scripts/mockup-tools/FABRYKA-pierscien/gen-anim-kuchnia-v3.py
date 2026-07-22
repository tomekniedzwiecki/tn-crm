# -*- coding: utf-8 -*-
"""F5 SKROLIK v3 — kuchnia: zmiana nosnika ruchu po 2x FAIL (Kling materializuje karte
przepisu w powietrzu przy kazdej wzmiance o tresci ekranu + deformuje produkt).
v3 = czysty ambient: TYLKO para z miski; ekran, dlonie, produkt — statyka absolutna."""
import importlib.util, os, subprocess, sys

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
spec2 = importlib.util.spec_from_file_location('fal_client', r'c:\repos_tn\tn-crm\scripts\video-factory\fal.py')
fal = importlib.util.module_from_spec(spec2); spec2.loader.exec_module(fal)

A = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/skrolik/'
OUT = os.path.join(HERE, 'assets')
NEG = ('screen content changing, scrolling, floating screen, floating UI, ghost interface, hologram, '
       'paper, card, sticker, label, text appearing, subtitles, captions, letters, numbers, '
       'new objects appearing, anything materializing, camera movement, zoom, pan, parallax, '
       'morphing hands, extra fingers, product deformation, product moving, color change of the ring, '
       'flicker, scene cut, people walking, face appearing')

jobs = [{'model': 'fal-ai/kling-video/v2.5-turbo/pro/image-to-video', 'tag': 'anim-kuchnia', 'payload': {
    'prompt': ('Static camera, seamless subtle loop. Gentle faint wisps of steam rise slowly from '
               'the bowl and dissolve; warm daylight breathes very subtly. Absolutely everything '
               'else is frozen still: both hands, the pink finger ring, the tablet and its screen '
               'content, the counter, the whole kitchen. No other motion of any kind. '
               'Loop returns to the exact first frame.'),
    'image_url': A + 'sceny/sc-kuchnia.webp', 'duration': '5',
    'negative_prompt': NEG, 'cfg_scale': 0.5}}]

done = fal.gen_batch(jobs, outdir=OUT, project='wf2-skrolik-v3', timeout_s=2400, poll_every=20)
raw = done.get('anim-kuchnia')
assert isinstance(raw, str) and os.path.isfile(raw), str(done)[:200]
rawp = os.path.join(OUT, 'anim-kuchnia-v3-raw.mp4')
os.replace(raw, rawp)
for nm, args in (('first', ['-vf', "select='eq(n,0)'", '-vframes', '1']),
                 ('mid', ['-ss', '2.5', '-vframes', '1']),
                 ('last', ['-sseof', '-0.15', '-vframes', '1'])):
    inp = ['-i', rawp] if nm == 'first' else (['-ss', '2.5', '-i', rawp] if nm == 'mid' else ['-sseof', '-0.15', '-i', rawp])
    outargs = ['-vf', "select='eq(n,0)'", '-vframes', '1'] if nm == 'first' else ['-vframes', '1']
    subprocess.run(['ffmpeg', '-y', '-v', 'error'] + inp + outargs
                   + [os.path.join(OUT, 'gate3-kuchnia-%s.jpg' % nm)], check=True)
print('OK v3 raw + klatki gate3 (bez uploadu — gate najpierw)')
