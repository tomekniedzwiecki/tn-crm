# -*- coding: utf-8 -*-
"""Sekcja wideo Ugniatka (LL-042): 3 klipy Kling i2v z zaakceptowanych scen UGC
(pass-2: 3x PRZYJAC). Petla first=last, kamera statyczna handheld-vibe. Upload webp
posterow + mp4 web do bud-assets/ugniatek/video/."""
import importlib.util, os, sys, urllib.request, subprocess
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, 'assets')

spec = importlib.util.spec_from_file_location('ps', r'c:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py')
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)
spec2 = importlib.util.spec_from_file_location('fal_client', r'c:\repos_tn\tn-crm\scripts\video-factory\fal.py')
fal = importlib.util.module_from_spec(spec2); spec2.loader.exec_module(fal)
try:
    fal.set_project('wf2-ugniatek')
except Exception:
    pass

BASE_NEG = ('camera movement, zoom, pan, morphing product, extra hands, deformed fingers, '
            'twisted wrists, flickering light, color shift, text, watermark, fast motion, jump cut')
CLIPS = {
    'ugc-1': ('Static handheld-feel camera, seamless subtle loop: the woman gently presses the '
              'grey massager into the side of her neck, her head tilts a touch further with '
              'relief, shoulders drop slowly, soft breathing, loose hair strand moves subtly; '
              'then she eases back to the starting pose. Product keeps exact shape and color.'),
    'ugc-2': ('Static camera, seamless subtle loop: the man leans his lower back slightly '
              'deeper into the massager against the backrest, chest rises with a slow relieved '
              'breath, head tilts back a bit more, hands stay relaxed on his knees; then he '
              'returns to the starting pose. TV glow flickers very softly in the blur.'),
    'ugc-3': ('Static camera, seamless subtle loop: the young woman rolls the massager slowly '
              'a few centimeters along her calf and back, her focused expression softens with '
              'relief, toes flex gently; then the device returns to the starting spot. Product '
              'keeps exact shape, no morphing.'),
}

for key, prompt in CLIPS.items():
    img = os.path.join(ASSETS, key + '.png')
    webp = os.path.join(ASSETS, key + '.webp')
    Image.open(img).convert('RGB').save(webp, 'WEBP', quality=84)
    iurl = ps.storage_upload(webp, 'bud-assets/ugniatek/video/%s-poster.webp' % key)
    print('POSTER:', iurl)
    res = fal.gen('fal-ai/kling-video/v2.5-turbo/pro/image-to-video',
                  {'prompt': prompt, 'image_url': iurl, 'duration': '5',
                   'negative_prompt': BASE_NEG, 'cfg_scale': 0.5},
                  tag='ugniatek-%s' % key)
    url = (res.get('video') or {}).get('url')
    if not url:
        print('FAIL', key, str(res)[:300])
        continue
    raw = os.path.join(ASSETS, key + '-raw.mp4')
    urllib.request.urlretrieve(url, raw)
    web = os.path.join(ASSETS, key + '.mp4')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', raw, '-vf', 'scale=720:1080',
                    '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p',
                    '-movflags', '+faststart', '-an', web], check=True)
    vurl = ps.storage_upload(web, 'bud-assets/ugniatek/video/%s.mp4' % key)
    print('OK', key, '->', vurl, os.path.getsize(web), 'B')
print('KONIEC')
