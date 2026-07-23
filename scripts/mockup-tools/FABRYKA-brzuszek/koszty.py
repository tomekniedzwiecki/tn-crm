# -*- coding: utf-8 -*-
"""KROK 5 BRZUSZEK: koszt generacji makiet -> wf2_costs (przez panel-sync.cost_add, UTF-8)
+ weryfikacja kompletu artefaktow makiet w panelu."""
import importlib.util, os, sys

sys.stdout.reconfigure(encoding='utf-8')
PS = r'C:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py'
spec = importlib.util.spec_from_file_location('panelsync', PS)
ps = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ps)

PROJ = '448f2395-0961-4f62-8fee-d42b9fb6cf29'
PROD = '6dd560cf-3990-4029-86c4-9f0607a5a019'

# Rachunek generacji gpt-image-2 medium (3:2 / 2:3):
#   1 styl-master + 11 desktop + 14 mobile (11 + 3 regen: 02-problem, 07-wytrzymalosc, 11-final)
GEN = 1 + 11 + 14                       # = 26 generacji
UNIT = 0.06                             # ~$0.06 / obraz medium (szacunek)
AMOUNT = round(GEN * UNIT, 2)           # ~1.56 USD
NOTE = ('F2.5+F2+F2.4 makiety: %d generacji gpt-image-2 medium '
        '(1 styl-master + 11 desktop + 14 mobile [11 + 3 regen: 02-problem, 07-wytrzymalosc, '
        '11-final]) x ~$%.2f' % (GEN, UNIT))

cid = ps.cost_add(PROJ, PROD, AMOUNT, kind='gpt-image', currency='USD',
                  step='lp_makiety', stage=2, note=NOTE, created_by='fabryka')
print('COST id=%s amount=$%.2f' % (cid, AMOUNT))

# Weryfikacja kompletu artefaktow makiet (kontrakt panelu)
zarzuty = ps._sprawdz_makiety_komplet(PROJ, PROD)
rows = [r for r in ps._get('wf2_artifacts', ps._scope_param(
        {'project_id': 'eq.%s' % PROJ, 'step_key': 'eq.lp_makiety',
         'select': 'kind,meta'}, PROD)) if r.get('kind') in ('makieta', 'makieta_mobile')]
d = len([r for r in rows if r['kind'] == 'makieta'])
m = len([r for r in rows if r['kind'] == 'makieta_mobile'])
print('ARTEFAKTY: desktop=%d mobile=%d (total=%d)' % (d, m, d + m))
print('GATE KOMPLETU:', 'OK (komplet)' if not zarzuty else 'ZARZUTY: ' + ' | '.join(zarzuty))
