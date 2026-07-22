# -*- coding: utf-8 -*-
"""F1 close ODSACZEK: PRZEWODNIK do ARCH/storage, artefakty doc, koszt, lp_plan done.
Uruchamiac PO werdykcie krytyka (PASS / PASS-Z-POPRAWKAMI wdrozonymi)."""
import importlib.util, io, json, os, re, shutil, sys
import requests

sys.stdout.reconfigure(encoding='utf-8')
FAB = r'c:\repos_tn\tn-crm\scripts\mockup-tools\FABRYKA-koszyk'
ARCH = r'C:\Users\tomek\Desktop\TN-Sklepy-grafiki\FABRYKA-2026-07\odsaczek'
PROJ = 'c2af0524-3c37-4ada-9c9c-acae739a1373'
PROD = 'f69d7cee-6e1e-42b1-8ccf-39afb9a47a34'
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
spec = importlib.util.spec_from_file_location('ps', r'c:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py')
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

# przewodnik -> plik kanoniczny + ARCH
shutil.copy(os.path.join(FAB, 'out-przewodnik.md'), os.path.join(FAB, 'PRZEWODNIK-GRAFICZNY.md'))
shutil.copy(os.path.join(FAB, 'PRZEWODNIK-GRAFICZNY.md'), os.path.join(ARCH, 'PRZEWODNIK-GRAFICZNY.md'))
ps.storage_upload(os.path.join(FAB, 'PLAN.md'), 'wf2-docs/odsaczek/PLAN.md')
ps.storage_upload(os.path.join(FAB, 'PRZEWODNIK-GRAFICZNY.md'), 'wf2-docs/odsaczek/PRZEWODNIK-GRAFICZNY.md')
ps.artifact_add(PROJ, PROD, 'lp_plan', 'doc', PUB + 'wf2-docs/odsaczek/PLAN.md',
                label='PLAN.md (motyw „Jednym łukiem nad garnek", 10 sekcji + anty-mismatch)', meta={'f': 'F1'})
ps.artifact_add(PROJ, PROD, 'lp_plan', 'doc', PUB + 'wf2-docs/odsaczek/PRZEWODNIK-GRAFICZNY.md',
                label='PRZEWODNIK-GRAFICZNY.md (9 scen, seedy EN + ORIENT + NEG, krytyk PASS)', meta={'f': 'F1.5'})

# koszt F1 (2 calle gpt-5.6-sol)
env = io.open(r'c:\repos_tn\tn-crm\.env', encoding='utf-8-sig').read()
KEY = re.search(r'^SUPABASE_SERVICE_KEY=(.+)$', env, re.M).group(1).strip()
B = 'https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1'
H = {'apikey': KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json'}
have = requests.get(B + '/wf2_costs?product_id=eq.%s&step_key=eq.lp_plan&select=id' % PROD, headers=H, timeout=30).json()
if not have:
    r = requests.post(B + '/wf2_costs', headers=H, data=json.dumps({
        'project_id': PROJ, 'product_id': PROD, 'step_key': 'lp_plan', 'stage': 2,
        'amount': 0.30, 'currency': 'USD', 'kind': 'openai',
        'note': 'F1 plan + F1.5 przewodnik graficzny (2 calle gpt-5.6-sol z 3-4 refami vision) '
                '+ krytyk przewodnika (subagent) — estymat',
        'created_by': 'auto'}), timeout=30)
    print('koszt F1:', r.status_code)

CHECK = [
    {'t': 'Plan GPT gotowy (motyw ≠ „clean e-commerce")', 'done': True},
    {'t': 'Tabela CLAIM→ŹRÓDŁO: każda korzyść z kotwicą', 'done': True},
    {'t': 'Jasne tła + CTA checkout + esencja produktu na scenach kluczowych', 'done': True},
    {'t': 'Przewodnik graficzny: matryca osi wypełniona', 'done': True},
    {'t': 'Reguła rytmu OK, człowiek ≥30%', 'done': True},
    {'t': 'Krytyk przewodnika: PASS', 'done': True},
]
NOTE = os.environ.get('KRYTYK_NOTA', 'krytyk PASS')
ps.step_update(PROJ, PROD, 'lp_plan', status='done', checklist=CHECK, fields={
    'motyw': '„Jednym łukiem nad garnek" — trajektoria zanurz→wyjmij→zawieś + transformacja w płaski dysk',
    'sekcje': ('1 hero (H stos zoning) · 2 jeden-ruch · 3 zawies-i-odsacz · 4 zloz-na-plasko (TOR-I kandydat) · '
               '5 jak-durszlak · 6 proste-mycie · 7 mid-cta · 8 zamow (checkout-inline) · 9 faq · 10 final · '
               'wideo=SKIP (brak czystego materiału; ruch = hero-video Kling)'),
    'paleta': 'len #F4EFE5 / karty #FFFCF6 / akcent butelkowa zieleń #176B3A · Bricolage Grotesque + Figtree',
    'plan_url': PUB + 'wf2-docs/odsaczek/PLAN.md',
    'przewodnik_url': PUB + 'wf2-docs/odsaczek/PRZEWODNIK-GRAFICZNY.md'}, note=NOTE)
print('OK lp_plan done — F1 ODSACZEK zamkniete')
