# -*- coding: utf-8 -*-
"""LL-044 (dyrektywa Tomka 22.07): sekcja wideo POKAZUJE klipy DODANE do produktu —
zero selekcji fabryki. Self-host: yt-dlp (TikTok) / requests z UA+referer (Ali CDN)
→ ffmpeg web + poster → bud-assets/<slug>/tt/. Dla: ugniatek, odsaczek."""
import importlib.util, io, os, re, subprocess, sys

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUTD = os.path.join(HERE, 'tt-selfhost')
os.makedirs(OUTD, exist_ok=True)
spec = importlib.util.spec_from_file_location('ps', r'c:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py')
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

PRODUKTY = {
    'ugniatek': [
        dict(key='tt1', typ='tiktok',
             url='https://www.tiktok.com/@jierebyqcwi/video/7656006222906264863',
             autor='@jierebyqcwi'),
    ],
    'odsaczek': [
        dict(key='tt1', typ='tiktok',
             url='https://www.tiktok.com/@kitchen_in_china/video/7651833944396008725',
             autor='@kitchen_in_china'),
        dict(key='ali1', typ='ali',
             url='https://video.aliexpress-media.com/play/u/ae_sg_item/2211017637212/p/1/e/6/t/10301/312482555837.mp4',
             autor=''),
    ],
}


def fetch(item, raw_path):
    if item['typ'] == 'tiktok':
        subprocess.run([sys.executable, '-m', 'yt_dlp', '-f', 'mp4', '-o', raw_path,
                        '--no-playlist', item['url']], check=True)
    else:
        import requests
        r = requests.get(item['url'], timeout=120, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Referer': 'https://www.aliexpress.com/'})
        r.raise_for_status()
        open(raw_path, 'wb').write(r.content)
    assert os.path.getsize(raw_path) > 50000, 'plik podejrzanie maly'


for slug, items in PRODUKTY.items():
    for it in items:
        raw = os.path.join(OUTD, '%s-%s-raw.mp4' % (slug, it['key']))
        web = os.path.join(OUTD, '%s-%s.mp4' % (slug, it['key']))
        poster = os.path.join(OUTD, '%s-%s-poster.jpg' % (slug, it['key']))
        if not os.path.isfile(raw):
            print('POBIERAM', slug, it['key'], '...')
            fetch(it, raw)
        # web: max 1080 wys, zachowaj proporcje (kafel rail = 9:16 cover)
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', raw,
                        '-vf', "scale='-2:min(1080,ih)'",
                        '-c:v', 'libx264', '-preset', 'slow', '-crf', '27',
                        '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
                        '-c:a', 'aac', '-b:a', '96k', web], check=True)
        # poster = klatka ~25% (srodek akcji, nie czarna pierwsza)
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', '1.2', '-i', web,
                        '-frames:v', '1', '-q:v', '3', poster], check=True)
        vurl = ps.storage_upload(web, 'bud-assets/%s/tt/%s.mp4' % (slug, it['key']))
        purl = ps.storage_upload(poster, 'bud-assets/%s/tt/%s-poster.webp' % (slug, it['key']),
                                 to_webp=True, max_width=900)
        print('OK', slug, it['key'], os.path.getsize(web) // 1024, 'KB', '\n  ', vurl, '\n  ', purl)
print('KONIEC')
