# -*- coding: utf-8 -*-
"""Upload makiet (desktop/mobile) do bud-assets/rozmrozik/makiety/ + artefakty panelu.
Uzycie: python upload-makiety.py desktop|mobile|all"""
import os, subprocess, sys

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
PS = os.path.join(HERE, '..', 'panel-sync.py')
PROJ = '448f2395-0961-4f62-8fee-d42b9fb6cf29'
PROD = '60215ce4-a1bb-4af3-a850-f28d1ce0442b'
SECTIONS = ['01-hero', '02-problem', '03-jak-dziala', '04-pojemnosc', '05-funkcje',
            '06-wideo', '07-mid-cta', '08-faq', '09-zamow', '10-final']

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
        dest = 'bud-assets/rozmrozik/makiety/%s%s.webp' % (sec, suffix)
        url = run([PS, 'upload', src, dest, '--webp', '--quality', '82', '--max-width', '1440'])
        if not url: continue
        run([PS, 'artifact', PROJ, PROD, 'lp_makiety', kind, url,
             '--label', '%s (%s)' % (sec, vp),
             '--meta', '{"section":"%s","viewport":"%s"}' % (sec, vp)])
        print('OK', sec, vp)
print('KONIEC')
