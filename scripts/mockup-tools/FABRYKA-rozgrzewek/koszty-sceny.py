# -*- coding: utf-8 -*-
"""F3 ROZGRZEWEK: koszt generacji SCEN produkcyjnych -> wf2_costs (ps.cost_add, UTF-8, step=lp_grafiki).
Liczony z out/worklog.jsonl, TYLKO rekordy scen (section startswith 'sc-'); makiety maja osobny
koszt (lp_makiety). Crop-first ($0): glowica-head + tryby-panel + packshot-alpha (cv2) + 3 UGC rehost."""
import importlib.util, io, json, os, sys
from collections import Counter

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
PS = r'C:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py'
spec = importlib.util.spec_from_file_location('ps', PS)
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

PROJ = '448f2395-0961-4f62-8fee-d42b9fb6cf29'
PROD = '4404200a-c774-48fe-ad50-0529ac08a095'
UNIT = {('local', 'high'): 0.25, ('edge', 'medium'): 0.06}   # jak koszty.py makiet

recs = [json.loads(l) for l in io.open(os.path.join(HERE, 'out', 'worklog.jsonl'),
                                       encoding='utf-8') if l.strip()]
scen = [r for r in recs if str(r.get('section', '')).startswith('sc-')]
c = Counter((r['channel'], r['quality']) for r in scen)
amount, parts = 0.0, []
for k, n in sorted(c.items()):
    u = UNIT.get(k, 0.19); amount += n * u
    parts.append('%d x %s/%s @ $%.2f' % (n, k[0], k[1], u))
amount = round(amount, 2)
edge_secs = sorted(set(r['section'] for r in scen if r['channel'] == 'edge'))

NOTE = ('F3 sceny produkcyjne Rozgrzewek: %d generacji gpt-image-2 (%s) — hero d+m (nosnik ruchu: '
        'kubek+para+lampa), moment d+m, obszary x4 (kark/ramiona/plecy/uda), autonomia d+m, final '
        'd+m; multi-ref (navy-whole+head-face+crop makiety), 12/12 PASS gate F3A, 0 regenow; '
        'kanal local /v1/images HIGH z fallbackiem edge wf2-gen MEDIUM przy HTTP 520 (edge: %s). '
        'Crop-first $0: glowica-head + tryby-panel + packshot-alpha (cv2) + 3 UGC rehost. Wycena szacunkowa.'
        % (len(scen), ' + '.join(parts), ', '.join(edge_secs)))

cid = ps.cost_add(PROJ, PROD, amount, kind='gpt-image', currency='USD',
                  step='lp_grafiki', stage=3, note=NOTE, created_by='fabryka')
print('COST id=%s amount=$%.2f' % (cid, amount))
print('  ', NOTE)
