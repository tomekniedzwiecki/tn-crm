# -*- coding: utf-8 -*-
"""LL-044 v2 (Tomek: "po 4-5 video w tej sekcji"): dociagniecie klipow z puli produktu
(videos_curated.items = surowe klipy radaru, BEZ patrzenia na werdykty) wg plays DESC.
Self-host tt2..tt5 -> bud-assets/<slug>/tt/. Bledy pobran nie przerywaja (raport)."""
import importlib.util, os, subprocess, sys

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUTD = os.path.join(HERE, 'tt-selfhost')
spec = importlib.util.spec_from_file_location('ps', r'c:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py')
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

NOWE = {
    'ugniatek': [
        ('tt2', 'https://www.tiktok.com/@monster.planet/video/7485602722805304583', '@monster.planet'),
        ('tt3', 'https://www.tiktok.com/@seaurchin/video/7274357039378271531', '@seaurchin'),
        ('tt4', 'https://www.tiktok.com/@jierebyqcwi/video/7653828367489322271', '@jierebyqcwi'),
        ('tt5', 'https://www.tiktok.com/@ayitireveye2026/video/7638418303257644301', '@ayitireveye2026'),
    ],
    'odsaczek': [
        ('tt2', 'https://www.tiktok.com/@goodthingsfindsa/video/7176258997408763142', '@goodthingsfindsa'),
        ('tt3', 'https://www.tiktok.com/@rozzdelite/video/7659202777079500063', '@rozzdelite'),
        ('tt4', 'https://www.tiktok.com/@reasuretrove/video/7463415140671606047', '@reasuretrove'),
    ],
}

ok, fail = [], []
for slug, items in NOWE.items():
    for key, url, autor in items:
        raw = os.path.join(OUTD, '%s-%s-raw.mp4' % (slug, key))
        web = os.path.join(OUTD, '%s-%s.mp4' % (slug, key))
        poster = os.path.join(OUTD, '%s-%s-poster.jpg' % (slug, key))
        try:
            if not os.path.isfile(raw):
                subprocess.run([sys.executable, '-m', 'yt_dlp', '-f', 'mp4', '-o', raw,
                                '--no-playlist', url], check=True, timeout=180)
            assert os.path.getsize(raw) > 50000
            subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', raw, '-vf', "scale='-2:min(1080,ih)'",
                            '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p',
                            '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '96k', web], check=True)
            subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', '1.2', '-i', web,
                            '-frames:v', '1', '-q:v', '3', poster], check=True)
            ps.storage_upload(web, 'bud-assets/%s/tt/%s.mp4' % (slug, key))
            ps.storage_upload(poster, 'bud-assets/%s/tt/%s-poster.webp' % (slug, key), to_webp=True, max_width=900)
            ok.append((slug, key, autor))
            print('OK', slug, key, autor)
        except Exception as e:
            fail.append((slug, key, autor, str(e)[:120]))
            print('FAIL', slug, key, autor, str(e)[:120])
print('WYNIK ok=%d fail=%d' % (len(ok), len(fail)))
for f in fail:
    print('  FAIL:', f)
