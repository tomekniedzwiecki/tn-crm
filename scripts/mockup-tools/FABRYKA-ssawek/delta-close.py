# -*- coding: utf-8 -*-
"""Delta MAPA-ZASTOSOWAN (szerokosc funkcji) SSAWEK/Popiolek:
 - upload 2 NOWYCH scen (sc-zast-mokro WET + sc-zast-pellet) -> bud-assets/ssawek/assets/*.webp + artefakty scena
 - kopia + upload regen makiety 06-zastosowania (desktop [+mobile jesli jest]) -> makiety/ + bud-assets/ssawek/makiety/
Idempotentne (x-upsert). NIE loguje kosztow tu (koszt delty logowany zbiorczo w domknieciu ZADANIE 5).
Uzycie: python delta-close.py [scenes|makieta|all]"""
import importlib.util, os, shutil, sys
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
MAK = os.path.join(HERE, 'makiety')
PS = os.path.join(HERE, '..', 'panel-sync.py')
spec = importlib.util.spec_from_file_location('ps', PS)
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

PROJ = '1a097f94-1b64-48ec-91c6-cf32565f79a4'
PROD = '051dd9c1-546d-4ee0-891e-1576eaef85dc'
SLUG = 'ssawek'
ADIR = 'bud-assets/%s/assets/' % SLUG
MDIR = 'bud-assets/%s/makiety/' % SLUG

# nowe sceny szerokosci (wiernosc: 2 pary oczu — Opus pass-1 + swiezy Sonnet pass-2 = ZGODNA/ZGODNA)
NEW_SCENES = [
    ('sc-zast-mokro', 'zastosowania', 'kafel-woda-mokro', 'S', 'C'),
    ('sc-zast-pellet', 'zastosowania', 'kafel-pellet', 'S', 'C'),
]


def do_scenes():
    for out_name, section, vp, klasa, osadz in NEW_SCENES:
        src = os.path.join(OUT, out_name + '.png')
        if not os.path.isfile(src):
            print('BRAK', src); continue
        # kopia lokalna do assets/ (spojnosc z reszta scen; sekcja MAPA-ASSETOW)
        shutil.copyfile(src, os.path.join(HERE, 'assets', out_name + '.png'))
        blob, _ = ps._process_image(src, max_width=1600, to_webp=True, quality=82)
        url = ps.storage_upload(src, ADIR + out_name + '.webp', bucket='attachments',
                                to_webp=True, max_width=1600, quality=82)
        ps.artifact_add(PROJ, PROD, 'lp_grafiki', 'scena', url,
                        label='%s — %s (%s) [delta szerokosc]' % (section, vp, klasa),
                        meta={'section': section, 'viewport': vp, 'klasa': klasa,
                              'osadzenie': osadz, 'wiernosc': 'ZGODNA',
                              'gate': 'F3A 2 pary oczu (Opus pass-1 + swiezy Sonnet pass-2)'})
        print('OK scena', out_name, '%.0f KB' % (len(blob) / 1024))


def do_makieta():
    for base in ('06-zastosowania', '06-zastosowania-mobile'):
        src = os.path.join(OUT, base + '.png')
        if not os.path.isfile(src):
            print('POMIJAM (brak)', src); continue
        # kanoniczna makieta lokalna (sekcja-diff czyta makiety/)
        shutil.copyfile(src, os.path.join(MAK, base + '.png'))
        url = ps.storage_upload(src, MDIR + base + '.webp', bucket='attachments',
                                to_webp=True, max_width=1600, quality=82)
        vp = 'mobile' if 'mobile' in base else 'desktop'
        ps.artifact_add(PROJ, PROD, 'lp_makiety', 'makieta_mobile' if vp == 'mobile' else 'makieta',
                        url, label='06-zastosowania (%s) — MOZAIKA 6 swiatow [regen delta]' % vp,
                        meta={'section': 'zastosowania', 'viewport': vp, 'regen': 'mapa-zastosowan-6-kafli'})
        print('OK makieta', base, '(%s)' % vp)


if __name__ == '__main__':
    what = sys.argv[1] if len(sys.argv) > 1 else 'all'
    if what in ('scenes', 'all'):
        do_scenes()
    if what in ('makieta', 'all'):
        do_makieta()
    print('DELTA-CLOSE done:', what)
