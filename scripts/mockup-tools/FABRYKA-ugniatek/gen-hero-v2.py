# -*- coding: utf-8 -*-
"""Hero v2 Ugniatka (LL-039): upload hero-L-v2.webp (regen z gate anatomii) + nowy
hero-video Kling z tej klatki (beat DOCISK<->LUZ jak v1). Nowe nazwy = anty-stale-cache."""
import importlib.util, os, sys, urllib.request
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))

spec = importlib.util.spec_from_file_location('ps', r'c:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py')
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

src = os.path.join(HERE, 'assets', 'hero-L-v2a.png')
webp = os.path.join(HERE, 'assets', 'hero-L-v2.webp')
Image.open(src).convert('RGB').save(webp, 'WEBP', quality=86)
url_img = ps.storage_upload(webp, 'bud-assets/ugniatek/assets/hero-L-v2.webp')
print('IMG:', url_img)

spec2 = importlib.util.spec_from_file_location('fal_client', r'c:\repos_tn\tn-crm\scripts\video-factory\fal.py')
fal = importlib.util.module_from_spec(spec2); spec2.loader.exec_module(fal)
try:
    fal.set_project('wf2-ugniatek')
except Exception:
    pass

PROMPT = ('Static camera, seamless subtle loop, realistic home evening scene: the man seen '
          'from behind presses the flat oval grey massager into his neck and shoulder with '
          'both hands — the t-shirt fabric and the shoulder visibly compress under the '
          'pressure, then the press releases: fabric and shoulder relax back, arms drop '
          'one or two centimeters like a quiet exhale, calm breathing rhythm, then the '
          'press returns. Camera perfectly static, no zoom, no pan. The massager keeps '
          'its exact shape and satin silver-grey color, no morphing, no light changes. '
          'Hands stay natural with straight wrists, fingers keep their grip, no finger movement.')
NEG = ('camera movement, zoom, pan, morphing product, extra hands, deformed fingers, '
       'twisted wrists, flickering light, color shift, text, watermark, fast motion, jump cut')

res = fal.gen('fal-ai/kling-video/v2.5-turbo/pro/image-to-video',
              {'prompt': PROMPT, 'image_url': url_img, 'duration': '5',
               'negative_prompt': NEG, 'cfg_scale': 0.5},
              tag='ugniatek-hero-video-v2')
url = (res.get('video') or {}).get('url')
if not url:
    raise SystemExit('brak video.url: %s' % str(res)[:400])
out = os.path.join(HERE, 'assets', 'hero-video-v2.mp4')
urllib.request.urlretrieve(url, out)
print('OK hero-video-v2:', out, os.path.getsize(out), 'B')
vurl = ps.storage_upload(out, 'bud-assets/ugniatek/assets/hero-video-v2.mp4')
print('VIDEO URL:', vurl)
