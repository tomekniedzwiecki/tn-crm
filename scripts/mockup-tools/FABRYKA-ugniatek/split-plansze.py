# -*- coding: utf-8 -*-
# Pociecie plansz zbiorczych 06 (mid-cta+zestaw) i 07 (zamow+faq+final) na OSOBNE makiety
# per sekcja (kontrakt panelu: 1 sekcja = 1 artefakt makieta + para mobile) + upload + artefakty.
import importlib.util, os, sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
spec = importlib.util.spec_from_file_location(
    'ps', r'c:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py')
ps = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ps)

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
PROJ = 'c2af0524-3c37-4ada-9c9c-acae739a1373'
PROD = 'c5977c4d-76dd-472e-8953-d9fb12b1120b'
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'

CUTS = [
    # (src, y0..y1 rel, out_name, section, label)
    ('ugniatek-m-midcta-zestaw.png', 0.00, 0.45, '06-mid-cta.webp', '06-mid-cta',
     '06 mid-cta — PASS'),
    ('ugniatek-m-midcta-zestaw.png', 0.45, 1.00, '07-zestaw.webp', '07-zestaw',
     '07 zestaw — PASS (F4: pudełko neutralne)'),
    ('ugniatek-m-zamow-faq-final.png', 0.00, 0.31, '08-zamow.webp', '08-zamow',
     '08 zamow (skórka checkoutu) — PASS'),
    ('ugniatek-m-zamow-faq-final.png', 0.31, 0.56, '09-faq.webp', '09-faq',
     '09 faq — PASS'),
    ('ugniatek-m-zamow-faq-final.png', 0.56, 1.00, '10-final.webp', '10-final',
     '10 final — PASS (F4: callout bez 360°)'),
]

for src, y0, y1, name, section, label in CUTS:
    im = Image.open(os.path.join(OUT, src))
    W, H = im.size
    crop = im.crop((0, int(y0 * H), W, int(y1 * H)))
    local = os.path.join(OUT, name.replace('.webp', '.png'))
    crop.save(local)
    dest = 'bud-assets/ugniatek/makiety/' + name
    ps.storage_upload(local, dest, to_webp=True)
    aid = ps.artifact_add(PROJ, PROD, 'lp_makiety', 'makieta', PUB + dest, label=label,
                          meta={'section': section, 'viewport': 'desktop'})
    print('OK', name, aid)

# przenumerowanie meta.section istniejacych zbiorczych artefaktow: usun stare zbiorcze wpisy
import io, re, json, requests
env = io.open(r'c:/repos_tn/tn-crm/.env', encoding='utf-8').read()
KEY = re.search(r'^SUPABASE_SERVICE_KEY=(.+)$', env, re.M).group(1).strip()
B = 'https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1'
H = {'apikey': KEY, 'Authorization': 'Bearer ' + KEY}
for old in ('06-midcta-zestaw.webp', '07-zamow-faq-final.webp'):
    r = requests.delete(B + '/wf2_artifacts', params={
        'product_id': 'eq.' + PROD, 'step_key': 'eq.lp_makiety',
        'url': 'eq.' + PUB + 'bud-assets/ugniatek/makiety/' + old}, headers=H, timeout=30)
    print('del zbiorczy', old, r.status_code)
