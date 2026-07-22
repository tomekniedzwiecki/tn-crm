# -*- coding: utf-8 -*-
"""(1) RETRY ugc-3 Ugniatka (timeout 15 min fal). (2) Hero-video ODSACZKA (feedback Tomka:
hero MUSI byc animowane zawsze) — Kling i2v z sc-hero, beat: unoszenie koszyka + olej + para,
petla first=last, kamera statyczna. Web-kompresja + upload."""
import importlib.util, os, subprocess, sys, urllib.request

sys.stdout.reconfigure(encoding='utf-8')
UGN = r'c:\repos_tn\tn-crm\scripts\mockup-tools\FABRYKA-ugniatek'
KOSZ = r'c:\repos_tn\tn-crm\scripts\mockup-tools\FABRYKA-koszyk'

spec = importlib.util.spec_from_file_location('ps', r'c:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py')
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)
spec2 = importlib.util.spec_from_file_location('fal_client', r'c:\repos_tn\tn-crm\scripts\video-factory\fal.py')
fal = importlib.util.module_from_spec(spec2); spec2.loader.exec_module(fal)

A = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
NEG = ('camera movement, zoom, pan, morphing product, extra hands, deformed fingers, '
       'twisted wrists, flickering light, color shift, text, watermark, fast motion, jump cut')


def klip(tag, image_url, prompt, out_raw, out_web, storage_path, scale):
    try:
        fal.set_project(tag.split('-')[0] if False else 'wf2-' + tag.split('/')[0])
    except Exception:
        pass
    res = fal.gen('fal-ai/kling-video/v2.5-turbo/pro/image-to-video',
                  {'prompt': prompt, 'image_url': image_url, 'duration': '5',
                   'negative_prompt': NEG, 'cfg_scale': 0.5}, tag=tag)
    url = (res.get('video') or {}).get('url')
    if not url:
        raise RuntimeError('brak video.url: %s' % str(res)[:300])
    urllib.request.urlretrieve(url, out_raw)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', out_raw, '-vf', scale,
                    '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p',
                    '-movflags', '+faststart', '-an', out_web], check=True)
    vurl = ps.storage_upload(out_web, storage_path)
    print('OK', tag, '->', vurl, os.path.getsize(out_web), 'B')


# (1) retry ugc-3
try:
    klip('ugniatek/ugc-3-retry',
         A + 'bud-assets/ugniatek/video/ugc-3-poster.webp',
         ('Static camera, seamless subtle loop: the young woman rolls the massager slowly '
          'a few centimeters along her calf and back, her focused expression softens with '
          'relief, toes flex gently; then the device returns to the starting spot. Product '
          'keeps exact shape, no morphing.'),
         os.path.join(UGN, 'assets', 'ugc-3-raw.mp4'),
         os.path.join(UGN, 'assets', 'ugc-3.mp4'),
         'bud-assets/ugniatek/video/ugc-3.mp4',
         'scale=720:1080')
except Exception as e:
    print('FAIL ugc-3 retry:', str(e)[:200])

# (2) hero-video Odsaczka z sc-hero (3:2 poziomy — ambient pod hero desktop+mobile)
klip('odsaczek/hero-video',
     A + 'bud-assets/odsaczek/assets/sc-hero.webp',
     ('Static camera, seamless subtle loop, bright home kitchen: the hand holding the wire '
      'basket full of golden fries above the wok lifts it one or two centimeters, pale clean '
      'oil drips fall from the mesh into the wok, gentle steam rises and drifts, the fries '
      'settle subtly; then the basket eases back down to the exact starting position. Camera '
      'perfectly static, no zoom, no pan. The steel wire basket keeps its exact woven '
      'construction and silver color, no morphing, hand stays natural with straight wrist.'),
     os.path.join(KOSZ, 'assets', 'hero-video-raw.mp4'),
     os.path.join(KOSZ, 'assets', 'hero-video.mp4'),
     'bud-assets/odsaczek/assets/hero-video.mp4',
     'scale=1350:900')
print('KONIEC')
