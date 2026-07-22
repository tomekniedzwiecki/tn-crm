# -*- coding: utf-8 -*-
"""F5 SKROLIK: 3 klipy Kling i2v (hero + kanapa + kuchnia) wg beatow PRZEWODNIKA
(petla first=last przez POWROT tresci — korekta krytyka). gen_batch -> ffmpeg CRF27
-> upload bud-assets/skrolik/assets/. Koszt ~3x$0.35."""
import importlib.util, os, subprocess, sys

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('ps', r'c:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py')
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)
spec2 = importlib.util.spec_from_file_location('fal_client', r'c:\repos_tn\tn-crm\scripts\video-factory\fal.py')
fal = importlib.util.module_from_spec(spec2); spec2.loader.exec_module(fal)

A = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/skrolik/'
OUT = os.path.join(HERE, 'assets')
os.makedirs(OUT, exist_ok=True)
MODEL = 'fal-ai/kling-video/v2.5-turbo/pro/image-to-video'
NEG = ('camera movement, zoom, pan, parallax, morphing hands, extra fingers, '
       'product deformation, color change of the ring, UI elements appearing, '
       'readable text on screen, flicker, scene cut, people walking, face appearing')

JOBS = [
    {'model': MODEL, 'tag': 'hero-video', 'payload': {
        'prompt': ('Static camera. The thumb gently presses the middle button of the pink '
                   'finger remote once; immediately the blurred vertical feed on the propped '
                   'smartphone screen scrolls smoothly upward by two content blocks, then '
                   'gently settles back down to its starting position and stops. The hand, '
                   'blanket, sofa and window stay completely still. Subtle, realistic '
                   'motion, seamless loop.'),
        'image_url': A + 'sceny/sc-hero.webp', 'duration': '5',
        'negative_prompt': NEG, 'cfg_scale': 0.5}},
    {'model': MODEL, 'tag': 'anim-kanapa', 'payload': {
        'prompt': ('Static camera. On the side table, the propped smartphone shows a blurred '
                   'vertical feed; the thumb on the pink finger remote makes one tiny press '
                   'and the feed scrolls smoothly upward by two content blocks, then gently '
                   'settles back down to its starting position and stops. The relaxed hand '
                   'on the blanket, the sofa and the phone itself stay completely still. '
                   'Subtle, realistic motion, seamless loop.'),
        'image_url': A + 'sceny/sc-kanapa.webp', 'duration': '5',
        'negative_prompt': NEG, 'cfg_scale': 0.5}},
    {'model': MODEL, 'tag': 'anim-kuchnia', 'payload': {
        'prompt': ('Static camera. The propped tablet on the kitchen counter shows a blurred '
                   'recipe page; the thumb presses the pink finger remote once and the recipe '
                   'content glides smoothly up by one section, then gently settles back to '
                   'its starting position and stops. Faint wisps of steam rise from the bowl. '
                   'The hands near the bowl, the tablet as an object and the whole kitchen '
                   'stay completely still. Subtle, realistic motion, seamless loop.'),
        'image_url': A + 'sceny/sc-kuchnia.webp', 'duration': '5',
        'negative_prompt': NEG, 'cfg_scale': 0.5}},
]

done = fal.gen_batch(JOBS, outdir=OUT, project='wf2-skrolik', timeout_s=2400, poll_every=20)
print('gen_batch ->', {k: str(v)[:80] for k, v in done.items()})

for tag in ('hero-video', 'anim-kanapa', 'anim-kuchnia'):
    raw = done.get(tag)
    assert isinstance(raw, str) and os.path.isfile(raw), '%s: brak pliku (%s)' % (tag, str(done.get(tag))[:120])
    rawp = os.path.join(OUT, tag + '-raw.mp4')
    os.replace(raw, rawp)
    web = os.path.join(OUT, tag + '.mp4')
    probe = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0',
                            '-show_entries', 'stream=width,height', '-of', 'csv=p=0', rawp],
                           capture_output=True, text=True, check=True).stdout.strip()
    w, h = [int(x) for x in probe.split(',')[:2]]
    vf = "scale='-2:min(900,ih)'" if w >= h else "scale='min(900,iw):-2'"
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', rawp, '-vf', vf,
                    '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p',
                    '-movflags', '+faststart', '-an', web], check=True)
    ps.storage_upload(web, 'bud-assets/skrolik/assets/' + tag + '.mp4')
    print('OK', tag, os.path.getsize(web) // 1024, 'KB (%dx%d raw)' % (w, h))
print('KONIEC')
