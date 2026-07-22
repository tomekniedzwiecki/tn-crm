# -*- coding: utf-8 -*-
"""F6 hero-video Ugniatka: Kling v2.5-turbo pro i2v na bazie hero-L (beat DOCISK<->LUZ,
kamera statyczna, szew petli w fazie LUZ). Wynik: assets/hero-video.mp4"""
import importlib.util, io, os, sys, urllib.request

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location(
    'fal_client', r'c:\repos_tn\tn-crm\scripts\video-factory\fal.py')
fal = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fal)
try:
    fal.set_project('wf2-ugniatek')
except Exception:
    pass

IMG = ('https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
       'bud-assets/ugniatek/assets/hero-L.webp')
PROMPT = ('Static camera, seamless subtle loop, realistic home evening scene: the man seen '
          'from behind presses the flat oval grey massager into his neck and shoulder with '
          'both hands — the t-shirt fabric and the shoulder visibly compress under the '
          'pressure, then the press releases: fabric and shoulder relax back, arms drop '
          'one or two centimeters like a quiet exhale, calm breathing rhythm, then the '
          'press returns. Camera perfectly static, no zoom, no pan. The massager keeps '
          'its exact shape and satin silver-grey color, no morphing, no light changes.')
NEG = ('camera movement, zoom, pan, morphing product, extra hands, deformed fingers, '
       'flickering light, color shift, text, watermark, fast motion, jump cut')

res = fal.gen('fal-ai/kling-video/v2.5-turbo/pro/image-to-video',
              {'prompt': PROMPT, 'image_url': IMG, 'duration': '5',
               'negative_prompt': NEG, 'cfg_scale': 0.5},
              tag='ugniatek-hero-video')
url = (res.get('video') or {}).get('url')
if not url:
    raise SystemExit('brak video.url w odpowiedzi: %s' % str(res)[:400])
out = os.path.join(HERE, 'assets', 'hero-video.mp4')
urllib.request.urlretrieve(url, out)
print('OK hero-video:', out, os.path.getsize(out), 'B')
