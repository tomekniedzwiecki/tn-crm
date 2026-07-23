# -*- coding: utf-8 -*-
"""F3 BRZUSZEK: koszt generacji scen produkcyjnych -> wf2_costs (ps.cost_add, UTF-8).
Crop-first ($0): 4 makro-detale g0-retusz + packshot-alpha + retusz UGC (cv2) = bez kosztu API."""
import importlib.util, os, sys

sys.stdout.reconfigure(encoding='utf-8')
PS = r'C:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py'
spec = importlib.util.spec_from_file_location('ps', PS)
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

PROJ = '448f2395-0961-4f62-8fee-d42b9fb6cf29'
PROD = '6dd560cf-3990-4029-86c4-9f0607a5a019'

# 10 scen gpt-image-2 HIGH przez /v1/images/edits (multi-ref), 0 regenow:
#   3 landscape 1536x1024 (hero-d, reg-side, wytrz-detal) + 7 portrait 1024x1536
#   (hero-mobile, partie-core/glute/arms/legs, sklad-rozloz, sklad-zloz).
# Crop-first ($0): det-konsola/uwalek/podstawa/linki + packshot-alpha + ugc-2-0-retusz.
GEN = 10
UNIT = 0.25                              # ~$0.25 / obraz HIGH (1536x1024 / 1024x1536) — szacunek
AMOUNT = round(GEN * UNIT, 2)           # ~$2.50
NOTE = ('F3 sceny produkcyjne: %d generacji gpt-image-2 HIGH (/v1/images/edits multi-ref g0-retusz '
        '+ crop makiety), 0 regenow, 10/10 PASS F3A; crop-first $0: 4 makro-detale + packshot-alpha '
        '+ retusz UGC 2-0 (cv2 inpaint) x ~$%.2f/obraz' % (GEN, UNIT))

cid = ps.cost_add(PROJ, PROD, AMOUNT, kind='gpt-image', currency='USD',
                  step='lp_grafiki', stage=3, note=NOTE, created_by='fabryka')
print('COST id=%s amount=$%.2f (%d gen x $%.2f)' % (cid, AMOUNT, GEN, UNIT))
