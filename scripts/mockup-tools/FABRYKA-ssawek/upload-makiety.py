# -*- coding: utf-8 -*-
"""Upload makiet SSAWEK (desktop/mobile) -> bud-assets/ssawek/makiety/ + artefakty panelu.
Kontrakt gate kompletu: kind makieta/makieta_mobile, pelny URL, meta.section + meta.viewport.
Uzycie: python upload-makiety.py desktop|mobile|all"""
import importlib.util, os, sys
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
PS = os.path.join(HERE, '..', 'panel-sync.py')
spec = importlib.util.spec_from_file_location('ps', PS)
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

PROJ = '1a097f94-1b64-48ec-91c6-cf32565f79a4'
PROD = '051dd9c1-546d-4ee0-891e-1576eaef85dc'
SECTIONS = ['01-hero', '02-zaufanie', '03-problem', '04-rozwiazanie', '05-demo', '06-zastosowania',
            '07-zestaw', '08-porownanie', '09-mid-cta', '10-opinie', '11-galeria', '14-faq',
            '15-zamow', '16-final']

mode = sys.argv[1] if len(sys.argv) > 1 else 'all'

for sec in SECTIONS:
    for kind, suffix, vp in (('makieta', '', 'desktop'), ('makieta_mobile', '-mobile', 'mobile')):
        if mode == 'desktop' and vp == 'mobile':
            continue
        if mode == 'mobile' and vp == 'desktop':
            continue
        src = os.path.join(OUT, '%s%s.png' % (sec, suffix))
        if not os.path.exists(src):
            print('BRAK', src); continue
        dest = 'bud-assets/ssawek/makiety/%s%s.webp' % (sec, suffix)
        url = ps.storage_upload(src, dest, bucket='attachments', to_webp=True,
                                max_width=1440, quality=82)
        ps.artifact_add(PROJ, PROD, 'lp_makiety', kind, url,
                        label='%s (%s)' % (sec, vp),
                        meta={'section': sec, 'viewport': vp})
        print('OK', sec, vp)
print('KONIEC')
