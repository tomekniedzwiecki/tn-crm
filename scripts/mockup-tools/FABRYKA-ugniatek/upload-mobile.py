# -*- coding: utf-8 -*-
# Upload par mobile makiet + artefakty z kontraktem meta (section/viewport, kind makieta_mobile).
import importlib.util, os, sys

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

LABELS = {
    '03-anatomia': '03 anatomia — mobile',
    '04-sterowanie': '04 sterowanie — mobile',
    '05-wieczorem': '05 wieczorem — mobile',
    '06-mid-cta': '06 mid-cta — mobile (v2 po fix ról obrazów)',
    '07-zestaw': '07 zestaw — mobile (F4: pudełko neutralne)',
    '08-zamow': '08 zamow — mobile',
    '09-faq': '09 faq — mobile (v2 po fix ról obrazów)',
    '10-final': '10 final — mobile',
}
for section in sys.argv[1:]:
    local = os.path.join(OUT, 'm-%s-mobile.png' % section)
    if not os.path.isfile(local):
        print('BRAK', local); continue
    dest = 'bud-assets/ugniatek/makiety/%s-mobile.webp' % section
    ps.storage_upload(local, dest, to_webp=True)
    aid = ps.artifact_add(PROJ, PROD, 'lp_makiety', 'makieta_mobile', PUB + dest,
                          label=LABELS[section],
                          meta={'section': section, 'viewport': 'mobile'})
    print('OK', section, aid)
