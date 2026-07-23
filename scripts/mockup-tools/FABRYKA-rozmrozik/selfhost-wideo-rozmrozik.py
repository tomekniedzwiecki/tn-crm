# -*- coding: utf-8 -*-
"""ROZMROZIK sekcja wideo (LL-044): 5 klipow TikTok self-host (hero sam.shan.shops
+ top-4 wg plays z videos_curated). yt-dlp -> ffmpeg web + poster -> bud-assets/rozmrozik/tt/.
Klip niepobieralny = pomin z nota (nie wysypuj calego runa)."""
import importlib.util, os, subprocess, sys

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUTD = os.path.join(HERE, 'tt-selfhost')
os.makedirs(OUTD, exist_ok=True)
spec = importlib.util.spec_from_file_location('ps', r'c:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py')
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

KLIPY = [
    dict(key='tt1', url='https://www.tiktok.com/@sam.shan.shops/video/7634292430455475476',
         autor='@sam.shan.shops'),
    dict(key='tt2', url='https://www.tiktok.com/@apieceofmyglamhome/video/7618420012512070943',
         autor='@apieceofmyglamhome'),
    dict(key='tt3', url='https://www.tiktok.com/@aliexpress.us/video/7210031422000598318',
         autor='@aliexpress.us'),
    dict(key='tt4', url='https://www.tiktok.com/@dailydeals.tiktokshop/video/7574652349155659039',
         autor='@dailydeals.tiktokshop'),
    dict(key='tt5', url='https://www.tiktok.com/@crystelmontenegrohome/video/7355994135968468267',
         autor='@crystelmontenegrohome'),
]

ok, skip = [], []
for it in KLIPY:
    raw = os.path.join(OUTD, 'rozmrozik-%s-raw.mp4' % it['key'])
    web = os.path.join(OUTD, 'rozmrozik-%s.mp4' % it['key'])
    poster = os.path.join(OUTD, 'rozmrozik-%s-poster.jpg' % it['key'])
    try:
        if not os.path.isfile(raw):
            print('POBIERAM', it['key'], it['autor'], '...')
            subprocess.run([sys.executable, '-m', 'yt_dlp', '-f', 'mp4', '-o', raw,
                            '--no-playlist', it['url']], check=True, timeout=300)
        assert os.path.getsize(raw) > 50000, 'plik podejrzanie maly'
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', raw,
                        '-vf', "scale='-2:min(1080,ih)'",
                        '-c:v', 'libx264', '-preset', 'slow', '-crf', '27',
                        '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
                        '-c:a', 'aac', '-b:a', '96k', web], check=True, timeout=600)
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', '1.2', '-i', web,
                        '-frames:v', '1', '-q:v', '3', poster], check=True, timeout=120)
        vurl = ps.storage_upload(web, 'bud-assets/rozmrozik/tt/%s.mp4' % it['key'])
        purl = ps.storage_upload(poster, 'bud-assets/rozmrozik/tt/%s-poster.webp' % it['key'],
                                 to_webp=True, max_width=900)
        ok.append(it['key'])
        print('OK', it['key'], os.path.getsize(web) // 1024, 'KB\n  ', vurl, '\n  ', purl)
    except Exception as e:
        skip.append((it['key'], it['autor'], str(e)[:120]))
        print('SKIP', it['key'], it['autor'], str(e)[:120])
print('KONIEC: %d OK %s, %d SKIP %s' % (len(ok), ok, len(skip), [s[0] for s in skip]))
