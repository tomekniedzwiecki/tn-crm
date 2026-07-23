# -*- coding: utf-8 -*-
"""KROK 5 ROZGRZEWEK: koszt generacji makiet -> wf2_costs (przez panel-sync.cost_add, UTF-8),
liczony z out/worklog.jsonl (kazda udana generacja = 1 wpis {channel,quality}).
+ weryfikacja kompletu artefaktow makiet w panelu (read-only)."""
import importlib.util, io, json, os, sys
from collections import Counter

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
PS = r'C:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py'
spec = importlib.util.spec_from_file_location('panelsync', PS)
ps = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ps)

PROJ = '448f2395-0961-4f62-8fee-d42b9fb6cf29'
PROD = '4404200a-c774-48fe-ad50-0529ac08a095'

# Szacunkowa wycena / obraz (gpt-image-2, proxy = stawki gpt-image-1):
#   local HIGH (1536x1024 / 1024x1536) ~ $0.25 · edge MEDIUM ~ $0.06
UNIT = {('local', 'high'): 0.25, ('edge', 'medium'): 0.06}

recs = [json.loads(l) for l in io.open(os.path.join(HERE, 'out', 'worklog.jsonl'),
                                       encoding='utf-8') if l.strip()]
c = Counter((r['channel'], r['quality']) for r in recs)
amount = 0.0
parts = []
for k, n in sorted(c.items()):
    u = UNIT.get(k, 0.19)
    amount += n * u
    parts.append('%d x %s/%s @ $%.2f' % (n, k[0], k[1], u))
amount = round(amount, 2)
edge_secs = sorted(set(r['section'] for r in recs if r['channel'] == 'edge'))

NOTE = ('F2.5+F2+F2.4 makiety Rozgrzewek: %d generacji gpt-image-2 (%s) — 1 styl-master + 11 '
        'desktop + 12 mobile [11 + 1 regen 03-tryby]; kanal local /v1/images HIGH z fallbackiem '
        'edge wf2-gen MEDIUM przy HTTP 520 (edge: %s). Wycena szacunkowa.'
        % (len(recs), ' + '.join(parts), ', '.join(edge_secs)))

cid = ps.cost_add(PROJ, PROD, amount, kind='gpt-image', currency='USD',
                  step='lp_makiety', stage=2, note=NOTE, created_by='fabryka')
print('COST id=%s amount=$%.2f' % (cid, amount))
print('  ', NOTE)

# Weryfikacja kompletu artefaktow makiet (kontrakt panelu, read-only — NIE zamyka kroku)
zarzuty = ps._sprawdz_makiety_komplet(PROJ, PROD)
rows = [r for r in ps._get('wf2_artifacts', ps._scope_param(
        {'project_id': 'eq.%s' % PROJ, 'step_key': 'eq.lp_makiety',
         'select': 'kind,meta'}, PROD)) if r.get('kind') in ('makieta', 'makieta_mobile')]
d = len([r for r in rows if r['kind'] == 'makieta'])
m = len([r for r in rows if r['kind'] == 'makieta_mobile'])
print('ARTEFAKTY: desktop=%d mobile=%d (total=%d)' % (d, m, d + m))
print('GATE KOMPLETU:', 'OK (komplet)' if not zarzuty else 'ZARZUTY: ' + ' | '.join(zarzuty))
