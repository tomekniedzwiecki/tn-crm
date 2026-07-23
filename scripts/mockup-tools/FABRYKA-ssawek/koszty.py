# -*- coding: utf-8 -*-
"""Koszty F2 SSAWEK -> wf2_costs (przez panel-sync, UTF-8):
 (1) kind='openai-image' — REALNY koszt generacji obrazow z out/worklog.jsonl (edge MEDIUM ~$0.06,
     local HIGH ~$0.25). Styl-master + makiety desktop + mobile + regeny.
 (2) kind='claude' — koszt PRACY AGENTA (dyrektywa Tomka 23.07): tokeny sesji [mln] x $9.00/MTok
     (Opus 4.8, blend input/output 80/20). Liczba tokenow = SZACUNEK SESJI (podana ENV WF2_CLAUDE_MTOK).
Uzycie: WF2_CLAUDE_MTOK=3.0 python koszty.py"""
import importlib.util, io, json, os, sys
from collections import Counter
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
PS = os.path.join(HERE, '..', 'panel-sync.py')
spec = importlib.util.spec_from_file_location('ps', PS)
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

PROJ = '1a097f94-1b64-48ec-91c6-cf32565f79a4'
PROD = '051dd9c1-546d-4ee0-891e-1576eaef85dc'
UNIT = {('local', 'high'): 0.25, ('edge', 'medium'): 0.06}

recs = [json.loads(l) for l in io.open(os.path.join(HERE, 'out', 'worklog.jsonl'),
                                       encoding='utf-8') if l.strip()]
c = Counter((r['channel'], r['quality']) for r in recs)
img_amount = 0.0
parts = []
for k, n in sorted(c.items()):
    u = UNIT.get(k, 0.19)
    img_amount += n * u
    parts.append('%d x %s/%s @ $%.2f' % (n, k[0], k[1], u))
img_amount = round(img_amount, 2)

IMG_NOTE = ('F2 makiety Popiolek (SSAWEK): %d generacji gpt-image-2 (%s) — 1 styl-master DNA + 14 '
            'desktop + 14 mobile + regeny; kanal edge wf2-gen MEDIUM (local HIGH 520 przez '
            'Cloudflare, LEDGER F2.5 — WF2_SKIP_LOCAL). Koszt realny wg stawek proxy.'
            % (len(recs), ' + '.join(parts)))
cid1 = ps.cost_add(PROJ, PROD, img_amount, kind='openai-image', currency='USD',
                   step='lp_makiety', stage=2, note=IMG_NOTE, created_by='fabryka')
print('COST openai-image id=%s amount=$%.2f' % (cid1, img_amount))

# (2) praca agenta
mtok = float(os.environ.get('WF2_CLAUDE_MTOK', '0') or '0')
if mtok > 0:
    claude_amount = round(mtok * 9.00, 2)
    CL_NOTE = ('Praca agenta F2 (Opus 4.8, claude-opus-4-8): ~%.2f MTok sesji x $9.00/MTok '
               '(blend 80/20 input/output) = SZACUNEK SESJI wg liczby wywolan (odczyty docow/'
               'STANDARD, ~29 odczytow obrazow vision-krytyk, pisanie skryptow gen/upload/close, '
               'panel-sync).' % mtok)
    cid2 = ps.cost_add(PROJ, PROD, claude_amount, kind='claude', currency='USD',
                       step='lp_makiety', stage=2, note=CL_NOTE, created_by='fabryka')
    print('COST claude id=%s amount=$%.2f (%.2f MTok)' % (cid2, claude_amount, mtok))
else:
    print('WF2_CLAUDE_MTOK nie podany — pomijam koszt pracy agenta')

# weryfikacja kompletu artefaktow makiet (read-only)
zarzuty = ps._sprawdz_makiety_komplet(PROJ, PROD)
print('GATE KOMPLETU MAKIET:', 'OK (komplet)' if not zarzuty else 'ZARZUTY: ' + ' | '.join(zarzuty))
