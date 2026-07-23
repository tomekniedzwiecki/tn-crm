# -*- coding: utf-8 -*-
"""Rebuild deliverables brandu Rozmrozik z kandydata fav-m1-1 (werdykt vision wybral #2:
kopula-klosz ze sniezynka/para — top-1 skryptowy mial serce+wok = FAIL rubryki pyt.3)."""
import importlib.util, io, json, os, re, sys

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
BF = os.path.join(HERE, '..', 'brand-forge.py')
spec = importlib.util.spec_from_file_location('brandforge', BF)
bf = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bf)

ENV = io.open(r'c:/repos_tn/tn-crm/.env', encoding='utf-8', errors='ignore').read()
SERVICE = re.search(r'^SUPABASE_SERVICE_KEY=(.+)$', ENV, re.M).group(1).strip()

outdir = r'C:\repos_tn\tn-crm\FABRYKA-rozmrozik\brand'
cand = os.path.join(outdir, 'kandydaci', 'fav-m1-1.png')
palette = ['#E8590C', '#232A31', '#F2F7FA', '#9BB8CE']
FONT = r'C:\Users\tomek\AppData\Local\Temp\claude\c--repos-tn\e7bbf08e-df82-420b-a8c9-42f30dd45047\scratchpad\fonts\ZillaSlab-Bold.ttf'

favs, master = bf.export_favicons(cand, outdir, ink='#232A31')
print('[d] favicon:', ', '.join(favs.keys()))
wm = bf.render_wordmark('Rozmrozik', FONT, palette, outdir)
wm_dark = bf.render_wordmark('Rozmrozik', FONT, palette, outdir, color='#FFFFFF', fname='wordmark-dark.png')
combo_path, combo_img = bf.compose_combo(master, wm, outdir)
combo_dark_path, combo_dark_img = bf.compose_combo(master, wm_dark, outdir, fname='logo-combo-dark.png')
print('[e] wordmark + comba OK')
sheet_path = bf.contact_sheet(master, combo_img, combo_dark_img, palette, outdir)
print('[f] brand-context OK')
brand_json = os.path.join(outdir, 'brand.json')
io.open(brand_json, 'w', encoding='utf-8').write(json.dumps({
    'nazwa': 'Rozmrozik', 'slug': 'rozmrozik', 'paleta': palette,
    'font': 'ZillaSlab-Bold.ttf', 'metafora': 'przezroczysta kopula-klosz nad plaska taca (sniezynka/para)',
    'pliki': ['favicon-512.png', 'favicon-256.png', 'favicon-32.png', 'favicon-16.png',
              'favicon-mono.png', 'wordmark.png', 'wordmark-dark.png',
              'logo-combo.png', 'logo-combo-dark.png', 'brand-context.png'],
}, ensure_ascii=False, indent=1))
uploaded = {}
for p in list(favs.values()) + [wm['path'], wm_dark['path'], combo_path, combo_dark_path, sheet_path, brand_json]:
    uploaded[os.path.basename(p)] = bf.upload_storage('rozmrozik', p, SERVICE)
print('[g] upload:', len(uploaded), 'plikow')
