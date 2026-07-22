# -*- coding: utf-8 -*-
"""F6 ODSACZEK — ANIM-3 (LL-041/§F1.7b): 2 sceny animowane poza hero.
Wybor wg kryteriow: (1) sc-zawieszony [sekcja zawies, GORNA polowa] — naturalny nosnik:
olej ocieka z siatki do garnka + para; (2) mc-scena [mid-cta, DOLNA polowa] — nosnik:
cienie lisci drgaja w porannym swietle (scena ANIM-ready z F5). Produkt = statyka.
Kling i2v petla first=last, kamera statyczna; web-kompresja + upload."""
import importlib.util, io, os, subprocess, sys, urllib.request

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('ps', r'c:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py')
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)
spec2 = importlib.util.spec_from_file_location('fal_client', r'c:\repos_tn\tn-crm\scripts\video-factory\fal.py')
fal = importlib.util.module_from_spec(spec2); spec2.loader.exec_module(fal)
try:
    fal.set_project('wf2-odsaczek')
except Exception:
    pass

A = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
NEG = ('camera movement, zoom, pan, morphing product, deformed wire mesh, extra hands, '
       'flickering, color shift, text, watermark, fast motion, jump cut, people appearing')

PLAN = [
    ('odsaczek/anim-zawieszony',
     A + 'bud-assets/odsaczek/assets/sc-zawieszony.webp',
     ('Static camera, seamless subtle loop, bright kitchen: the steel wire basket hangs '
      'perfectly still on the pot rim; thin streams and drops of pale clean oil drip from '
      'the wire mesh down into the pot, gentle faint steam rises and drifts slowly, soft '
      'highlight shimmer on the steel wires. The basket and pot do not move at all, woven '
      'wire construction keeps exact shape, no morphing. Loop returns to the exact first frame.'),
     'anim-zawieszony.mp4'),
    ('odsaczek/anim-mc',
     A + 'bud-assets/odsaczek/assets/mc-scena.webp',
     ('Static camera, seamless subtle loop, morning kitchen counter: soft dappled leaf '
      'shadows sway very gently across the counter and the wall as if a light breeze moves '
      'leaves outside the window, warm morning light breathes subtly. The folded steel wire '
      'basket stays perfectly still, exact woven construction, no morphing, nothing else moves. '
      'Loop returns to the exact first frame.'),
     'anim-mc.mp4'),
]

for tag, image_url, prompt, outname in PLAN:
    res = fal.gen('fal-ai/kling-video/v2.5-turbo/pro/image-to-video',
                  {'prompt': prompt, 'image_url': image_url, 'duration': '5',
                   'negative_prompt': NEG, 'cfg_scale': 0.5}, tag=tag)
    url = (res.get('video') or {}).get('url')
    if not url:
        raise RuntimeError('brak video.url: %s' % str(res)[:300])
    raw = os.path.join(HERE, 'assets', outname.replace('.mp4', '-raw.mp4'))
    web = os.path.join(HERE, 'assets', outname)
    urllib.request.urlretrieve(url, raw)
    # dobierz skale do proporcji zrodla (Kling zwraca proporcje wejscia)
    probe = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0',
                            '-show_entries', 'stream=width,height', '-of', 'csv=p=0', raw],
                           capture_output=True, text=True, check=True).stdout.strip()
    w, h = [int(x) for x in probe.split(',')[:2]]
    vf = "scale='-2:min(900,ih)'" if w >= h else "scale='min(900,iw):-2'"
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', raw, '-vf', vf,
                    '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p',
                    '-movflags', '+faststart', '-an', web], check=True)
    vurl = ps.storage_upload(web, 'bud-assets/odsaczek/assets/' + outname)
    print('OK', tag, '->', vurl, os.path.getsize(web) // 1024, 'KB (zrodlo %dx%d)' % (w, h))
print('KONIEC')
