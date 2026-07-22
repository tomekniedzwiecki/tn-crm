# -*- coding: utf-8 -*-
"""F5 SKROLIK v2 — regeneracja 3 klipow po gate FAIL:
- hero: petla niedomknieta (tresc ekranu nie wrocila, kciuk odjechal),
- kanapa: PLYWAJACY ekran-widmo z tekstem nad kocem (halucynacja),
- kuchnia: kartka z tekstem zmaterializowana w misce.
Eskalacja: NEG o floating-UI/paper/nowe obiekty + prompt 'ONLY motion is inside the
screen' + hero 'last frame identical to first'."""
import importlib.util, os, subprocess, sys

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('ps', r'c:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py')
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)
spec2 = importlib.util.spec_from_file_location('fal_client', r'c:\repos_tn\tn-crm\scripts\video-factory\fal.py')
fal = importlib.util.module_from_spec(spec2); spec2.loader.exec_module(fal)

A = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/skrolik/'
OUT = os.path.join(HERE, 'assets')
MODEL = 'fal-ai/kling-video/v2.5-turbo/pro/image-to-video'
NEG = ('floating screen, floating UI, ghost interface, hologram, paper, card, sticker, label, '
       'text appearing in the scene, subtitles, captions, letters, numbers, new objects appearing, '
       'anything materializing out of thin air, camera movement, zoom, pan, parallax, morphing hands, '
       'extra fingers, product deformation, color change of the ring, flicker, scene cut, '
       'people walking, face appearing')
KOTWICA = (' The ONLY motion in the entire scene is the content sliding INSIDE the device screen. '
           'Nothing new appears anywhere; no floating elements; every object stays exactly where it is.')

JOBS = [
    {'model': MODEL, 'tag': 'hero-video', 'payload': {
        'prompt': ('Static camera. The thumb rests on the middle button of the pink finger remote '
                   'and stays in contact with it for the whole clip, pressing once very gently; '
                   'the blurred vertical feed inside the propped smartphone screen scrolls smoothly '
                   'upward by two content blocks, then scrolls back down to exactly where it started '
                   'and stops. The last frame is identical to the first frame. The hand, blanket, '
                   'sofa and window stay completely still.' + KOTWICA + ' Seamless loop.'),
        'image_url': A + 'sceny/sc-hero.webp', 'duration': '5',
        'negative_prompt': NEG, 'cfg_scale': 0.5}},
    {'model': MODEL, 'tag': 'anim-kanapa', 'payload': {
        'prompt': ('Static camera. The blurred vertical feed inside the standing smartphone screen '
                   'on the side table scrolls smoothly upward by two content blocks, then scrolls '
                   'back down to exactly where it started and stops. The last frame is identical '
                   'to the first frame. The relaxed hand with the pink finger remote resting on '
                   'the blanket stays completely still, only the thumb makes one tiny press.'
                   + KOTWICA + ' Seamless loop.'),
        'image_url': A + 'sceny/sc-kanapa.webp', 'duration': '5',
        'negative_prompt': NEG, 'cfg_scale': 0.5}},
    {'model': MODEL, 'tag': 'anim-kuchnia', 'payload': {
        'prompt': ('Static camera. The blurred recipe page inside the propped tablet screen glides '
                   'smoothly up by one section, then glides back to exactly where it started and '
                   'stops. The last frame is identical to the first frame. The hands stay still '
                   '(one holds the empty bowl, the other wears the pink finger remote, thumb makes '
                   'one tiny press). The bowl stays empty; the kitchen stays untouched.'
                   + KOTWICA + ' Seamless loop.'),
        'image_url': A + 'sceny/sc-kuchnia.webp', 'duration': '5',
        'negative_prompt': NEG, 'cfg_scale': 0.5}},
]

done = fal.gen_batch(JOBS, outdir=OUT, project='wf2-skrolik-v2', timeout_s=2400, poll_every=20)
print('gen_batch ->', {k: str(v)[:80] for k, v in done.items()})

for tag in ('hero-video', 'anim-kanapa', 'anim-kuchnia'):
    raw = done.get(tag)
    assert isinstance(raw, str) and os.path.isfile(raw), '%s: brak pliku (%s)' % (tag, str(done.get(tag))[:120])
    rawp = os.path.join(OUT, tag + '-v2-raw.mp4')
    os.replace(raw, rawp)
    web = os.path.join(OUT, tag + '-v2.mp4')
    probe = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0',
                            '-show_entries', 'stream=width,height', '-of', 'csv=p=0', rawp],
                           capture_output=True, text=True, check=True).stdout.strip()
    w, h = [int(x) for x in probe.split(',')[:2]]
    vf = "scale='-2:min(900,ih)'" if w >= h else "scale='min(900,iw):-2'"
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', rawp, '-vf', vf,
                    '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p',
                    '-movflags', '+faststart', '-an', web], check=True)
    for off, nm in (('first', "select='eq(n,0)'"), ):
        pass
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', web, '-vf', "select='eq(n,0)'",
                    '-vframes', '1', os.path.join(OUT, 'gate2-%s-first.jpg' % tag)], check=True)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', '2.5', '-i', web,
                    '-vframes', '1', os.path.join(OUT, 'gate2-%s-mid.jpg' % tag)], check=True)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-sseof', '-0.15', '-i', web,
                    '-vframes', '1', os.path.join(OUT, 'gate2-%s-last.jpg' % tag)], check=True)
    print('OK', tag, os.path.getsize(web) // 1024, 'KB (%dx%d raw) + klatki gate2' % (w, h))
print('KONIEC (bez uploadu — najpierw gate na klatkach gate2-*)')
