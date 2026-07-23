# -*- coding: utf-8 -*-
"""Rebuild deliverables brandu Brzuszek z kandydata fav-m1-0 (werdykt vision: top-1
skryptowy fav-m2-1 = kreski zlewaja sie @16px; m0-*/m2-0 = litery A/B -> FAIL pyt.5)."""
import importlib.util, io, json, os, re, sys

sys.stdout.reconfigure(encoding='utf-8')
BF = r'c:\repos_tn\tn-crm\scripts\mockup-tools\brand-forge.py'
spec = importlib.util.spec_from_file_location('brandforge', BF)
bf = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bf)

ENV = io.open(r'c:/repos_tn/tn-crm/.env', encoding='utf-8', errors='ignore').read()
SERVICE = re.search(r'^SUPABASE_SERVICE_KEY=(.+)$', ENV, re.M).group(1).strip()

outdir = r'C:\repos_tn\tn-crm\FABRYKA-merach\brand'
cand = os.path.join(outdir, 'kandydaci', 'fav-m1-0.png')
palette = ['#A21CAF', '#241E2E', '#F7F5FB', '#C9C2D6']
FONT = (r'C:\Users\tomek\AppData\Local\Temp\claude\c--repos-tn'
        r'\e7bbf08e-df82-420b-a8c9-42f30dd45047\scratchpad\fonts\Archivo-Expanded-Bold.ttf')

favs, master = bf.export_favicons(cand, outdir, ink='#241E2E')
print('[d] favicon:', ', '.join(favs.keys()))
wm = bf.render_wordmark('Brzuszek', FONT, palette, outdir)
wm_dark = bf.render_wordmark('Brzuszek', FONT, palette, outdir, color='#FFFFFF', fname='wordmark-dark.png')
combo_path, combo_img = bf.compose_combo(master, wm, outdir)
combo_dark_path, combo_dark_img = bf.compose_combo(master, wm_dark, outdir, fname='logo-combo-dark.png')
print('[e] wordmark + comba OK')
sheet_path = bf.contact_sheet(master, combo_img, combo_dark_img, palette, outdir)
print('[f] brand-context OK')
brand_json = os.path.join(outdir, 'brand.json')
io.open(brand_json, 'w', encoding='utf-8').write(json.dumps({
    'nazwa': 'Brzuszek', 'slug': 'brzuszek', 'paleta': palette,
    'font': 'Archivo-Expanded-Bold.ttf',
    'metafora': 'zwinieta sylwetka w crunchu (fala core z glowa)',
    'pliki': ['favicon-512.png', 'favicon-256.png', 'favicon-32.png', 'favicon-16.png',
              'favicon-mono.png', 'wordmark.png', 'wordmark-dark.png',
              'logo-combo.png', 'logo-combo-dark.png', 'brand-context.png'],
}, ensure_ascii=False, indent=1))
uploaded = {}
for p in list(favs.values()) + [wm['path'], wm_dark['path'], combo_path, combo_dark_path, sheet_path, brand_json]:
    for attempt in (1, 2, 3):
        try:
            uploaded[os.path.basename(p)] = bf.upload_storage('brzuszek', p, SERVICE)
            break
        except Exception as e:
            print('  retry', os.path.basename(p), attempt, str(e)[:80])
print('[g] upload:', len(uploaded), 'plikow')
