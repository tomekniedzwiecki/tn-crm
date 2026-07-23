# -*- coding: utf-8 -*-
"""F3 ROZGRZEWEK: upload scen produkcyjnych (out/sc-*.png) + assetow crop-first (assets/*.png)
do Storage bud-assets/rozgrzewek/assets/ (WebP q85; packshot-alpha jako PNG = zachowana alpha).
NIE oznacza krokow panelu (glowna sesja po 2. parze oczu). Zapis mapy URL -> assets-urls.json."""
import importlib.util, json, os, sys

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
ASSETS = os.path.join(HERE, 'assets')
PS = r'C:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py'
spec = importlib.util.spec_from_file_location('ps', PS)
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

DEST = 'bud-assets/rozgrzewek/assets'

# Sceny generowane (S) -> WebP q85 (z out/)
SCENES = [
    'sc-hero', 'sc-hero-mobile', 'sc-moment', 'sc-moment-mobile',
    'sc-obszary-neck', 'sc-obszary-shoulder', 'sc-obszary-back', 'sc-obszary-thigh',
    'sc-autonomia', 'sc-autonomia-mobile', 'sc-final', 'sc-final-mobile',
]
# Crop-first klasa R -> WebP q85 (z assets/)
CROP_WEBP = ['glowica-head', 'tryby-panel']
# Crop-first klasa P (alpha) -> PNG (z assets/)
CROP_PNG = ['packshot-alpha']

urls = {}
for name in SCENES:
    src = os.path.join(OUT, name + '.png')
    if not os.path.exists(src):
        print('BRAK', src); continue
    urls[name] = ps.storage_upload(src, '%s/%s.webp' % (DEST, name), to_webp=True, quality=85)
for name in CROP_WEBP:
    src = os.path.join(ASSETS, name + '.png')
    if not os.path.exists(src):
        print('BRAK', src); continue
    urls[name] = ps.storage_upload(src, '%s/%s.webp' % (DEST, name), to_webp=True, quality=85)
for name in CROP_PNG:
    src = os.path.join(ASSETS, name + '.png')
    if not os.path.exists(src):
        print('BRAK', src); continue
    urls[name] = ps.storage_upload(src, '%s/%s.png' % (DEST, name), content_type='image/png')

json.dump(urls, open(os.path.join(HERE, 'assets-urls.json'), 'w', encoding='utf-8'),
          ensure_ascii=False, indent=2)
print('KONIEC — %d assetow -> %s' % (len(urls), DEST))
for k, v in urls.items():
    print(' ', k, '->', v)
