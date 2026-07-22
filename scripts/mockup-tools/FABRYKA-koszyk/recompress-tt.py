# -*- coding: utf-8 -*-
"""Wagi wideo do budzetu STANDARD (<=2.5MB/klip, poster <=60KB): adaptacyjny recompress
przekroczonych self-hostow (CRF 30 @720 -> CRF 32 @640 gdy za duzo) + reupload."""
import importlib.util, os, subprocess, sys

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
TT = os.path.join(HERE, 'tt-selfhost')
spec = importlib.util.spec_from_file_location('ps', os.path.join(HERE, '..', 'panel-sync.py'))
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

CELE = [
    ('ugniatek', 'tt3'), ('ugniatek', 'tt4'), ('ugniatek', 'tt5'),
    ('odsaczek', 'ali1'), ('odsaczek', 'tt2'), ('odsaczek', 'tt3'), ('odsaczek', 'tt4'),
]
LIMIT = 2_500_000

for slug, key in CELE:
    raw = os.path.join(TT, '%s-%s-raw.mp4' % (slug, key))
    web = os.path.join(TT, '%s-%s.mp4' % (slug, key))
    if os.path.getsize(web) <= LIMIT:
        print('OK-JUZ', slug, key, os.path.getsize(web) // 1024, 'KB')
        continue
    for vf, crf in (("scale='-2:min(720,ih)'", '30'), ("scale='-2:min(640,ih)'", '32')):
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', raw, '-vf', vf,
                        '-c:v', 'libx264', '-preset', 'slow', '-crf', crf, '-pix_fmt', 'yuv420p',
                        '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '64k', web], check=True)
        if os.path.getsize(web) <= LIMIT:
            break
    ps.storage_upload(web, 'bud-assets/%s/tt/%s.mp4' % (slug, key))
    print('OK', slug, key, os.path.getsize(web) // 1024, 'KB')

# poster tt3 Ugniatka >60KB
for slug, key in [('ugniatek', 'tt3')]:
    poster = os.path.join(TT, '%s-%s-poster.jpg' % (slug, key))
    ps.storage_upload(poster, 'bud-assets/%s/tt/%s-poster.webp' % (slug, key),
                      to_webp=True, max_width=560)
    print('OK poster', slug, key)
print('KONIEC')
