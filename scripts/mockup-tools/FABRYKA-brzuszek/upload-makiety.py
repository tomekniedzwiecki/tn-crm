# -*- coding: utf-8 -*-
"""Upload makiet BRZUSZEK (desktop/mobile) do bud-assets/brzuszek/makiety/ + artefakty panelu.
Uzycie: python upload-makiety.py desktop|mobile|all"""
import os, subprocess, sys

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
PS = os.path.join(HERE, '..', 'panel-sync.py')
PROJ = '448f2395-0961-4f62-8fee-d42b9fb6cf29'
PROD = '6dd560cf-3990-4029-86c4-9f0607a5a019'
SECTIONS = ['01-hero', '02-problem', '03-jak-cwiczysz', '04-regulacja', '05-wideo',
            '06-wiele-partii', '07-wytrzymalosc', '08-mid-cta', '09-skladanie',
            '10-zamow', '11-final']

mode = sys.argv[1] if len(sys.argv) > 1 else 'all'


def run(args):
    r = subprocess.run([sys.executable] + args, capture_output=True, text=True,
                       encoding='utf-8', errors='replace')
    out = (r.stdout or '').strip().splitlines()
    if r.returncode != 0:
        print('FAIL', args[-3:], (r.stderr or '')[-300:]); return None
    return out[-1] if out else ''


for sec in SECTIONS:
    for kind, suffix, vp in (('makieta', '', 'desktop'), ('makieta_mobile', '-mobile', 'mobile')):
        if mode == 'desktop' and vp == 'mobile': continue
        if mode == 'mobile' and vp == 'desktop': continue
        src = os.path.join(OUT, '%s%s.png' % (sec, suffix))
        if not os.path.exists(src):
            print('BRAK', src); continue
        dest = 'bud-assets/brzuszek/makiety/%s%s.webp' % (sec, suffix)
        url = run([PS, 'upload', src, dest, '--webp', '--quality', '82', '--max-width', '1440'])
        if not url: continue
        run([PS, 'artifact', PROJ, PROD, 'lp_makiety', kind, url,
             '--label', '%s (%s)' % (sec, vp),
             '--meta', '{"section":"%s","viewport":"%s"}' % (sec, vp)])
        print('OK', sec, vp)
print('KONIEC')
