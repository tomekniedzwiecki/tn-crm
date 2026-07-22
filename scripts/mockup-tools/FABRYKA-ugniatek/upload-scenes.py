# -*- coding: utf-8 -*-
# Rehost scen F3 do bud-assets/ugniatek/assets/ (WebP) + artefakty kroku lp_grafiki.
import importlib.util, os, sys, shutil

sys.stdout.reconfigure(encoding='utf-8')
spec = importlib.util.spec_from_file_location(
    'ps', r'c:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py')
ps = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ps)

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, 'assets')
PROJ = 'c2af0524-3c37-4ada-9c9c-acae739a1373'
PROD = 'c5977c4d-76dd-472e-8953-d9fb12b1120b'
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'

SCENY = {
    'hero-L': ('01-hero', 'U', 'hero-L: docisk do karku (pion 2:3, HIGH)'),
    'hero-P': ('01-hero', 'U', 'hero-P: oparcie lędźwi (pion 2:3, HIGH)'),
    'an-makro': ('03-anatomia', 'S', 'anatomia: makro diod (uczciwy glow)'),
    'st-panel': ('04-sterowanie', 'U', 'sterowanie: palec na + (panel P3)'),
    'wi-biurko': ('05-wieczorem', 'U', 'wieczorem: kącik przy biurku (lędźwie)'),
    'wi-trening': ('05-wieczorem', 'U', 'wieczorem: mata po treningu (łydka)'),
    'packshot-34': ('06-mid-cta', 'P', 'packshot kanoniczny 3/4 (reuse: final/sticky/OG)'),
    'ze-flatlay': ('07-zestaw', 'S', 'zestaw: flat lay (karton PLAIN)'),
    'ze-profil': ('07-zestaw', 'P', 'zestaw: profil boczny 11 cm'),
}
for name, (section, klasa, label) in SCENY.items():
    local = os.path.join(ASSETS, name + '.png')
    if not os.path.isfile(local):
        print('BRAK', local); continue
    dest = 'bud-assets/ugniatek/assets/%s.webp' % name
    ps.storage_upload(local, dest, to_webp=True)
    aid = ps.artifact_add(PROJ, PROD, 'lp_grafiki', 'scena', PUB + dest, label=label,
                          meta={'section': section, 'klasa': klasa, 'quality': 'high',
                                'wiernosc': 'PASS 2 pary oczu (WIERNOSC.md)'})
    print('OK', name, aid)

# realny spod jako asset anatomii (klasa R — najwierniejszy mozliwy kadr)
src = os.path.join(HERE, 'refs-cache', 'spod-packshot.webp')
dest = 'bud-assets/ugniatek/assets/an-spod.webp'
ps.storage_upload(src, dest)
aid = ps.artifact_add(PROJ, PROD, 'lp_grafiki', 'scena', PUB + dest,
                      label='anatomia: REALNY spód (kuracja Ali — kanon wierności)',
                      meta={'section': '03-anatomia', 'klasa': 'R'})
print('OK an-spod (realny)', aid)
