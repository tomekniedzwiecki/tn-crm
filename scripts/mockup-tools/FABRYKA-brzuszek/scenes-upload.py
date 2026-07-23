# -*- coding: utf-8 -*-
"""F3 BRZUSZEK: upload scen produkcyjnych + assetow crop-first do Storage
attachments/bud-assets/brzuszek/assets/ (PNG->WebP q84 wg wzorca; packshot-alpha jako PNG =
zachowana przezroczystosc). NIE oznacza krokow panelu (robi to glowna sesja po 2. parze oczu).
Zapisuje mape URL do assets-urls.json (zrodlo dla MAPA-ASSETOW.md)."""
import importlib.util, json, os, sys

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, 'assets')
PS = r'C:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py'
spec = importlib.util.spec_from_file_location('ps', PS)
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

DEST = 'bud-assets/brzuszek/assets'

# sceny generowane (S) + UGC retusz + detale (R) -> WebP; packshot-alpha (P, alpha) -> PNG
WEBP = [
    'sc-hero', 'sc-hero-mobile', 'sc-reg-side', 'sc-partie-core', 'sc-partie-glute',
    'sc-partie-arms', 'sc-partie-legs', 'sc-wytrz-detal', 'sc-sklad-rozloz', 'sc-sklad-zloz',
    'det-konsola', 'det-uwalek', 'det-podstawa', 'det-linki', 'ugc-2-0-retusz',
]
PNG = ['packshot-alpha']

urls = {}
for name in WEBP:
    src = os.path.join(ASSETS, name + '.png')
    if not os.path.exists(src):
        print('BRAK', src); continue
    url = ps.storage_upload(src, '%s/%s.webp' % (DEST, name), to_webp=True, quality=84)
    urls[name] = url
for name in PNG:
    src = os.path.join(ASSETS, name + '.png')
    if not os.path.exists(src):
        print('BRAK', src); continue
    url = ps.storage_upload(src, '%s/%s.png' % (DEST, name), content_type='image/png')
    urls[name] = url

with open(os.path.join(HERE, 'assets-urls.json'), 'w', encoding='utf-8') as f:
    json.dump(urls, f, ensure_ascii=False, indent=2)
print('KONIEC — %d assetow -> %s' % (len(urls), DEST))
for k, v in urls.items():
    print(' ', k, '->', v)
