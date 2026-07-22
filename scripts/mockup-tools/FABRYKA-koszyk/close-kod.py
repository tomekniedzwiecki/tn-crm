# -*- coding: utf-8 -*-
"""F4 close ODSACZEK: koszt + lp_kod done + artefakt + LEDGER. Po re-checku smoke."""
import importlib.util, io, json, os, re, shutil, sys
import requests

sys.stdout.reconfigure(encoding='utf-8')
FAB = r'c:\repos_tn\tn-crm\scripts\mockup-tools\FABRYKA-koszyk'
ARCH = r'C:\Users\tomek\Desktop\TN-Sklepy-grafiki\FABRYKA-2026-07\odsaczek'
IDX = r'c:\repos_tn\tn-crm\sklepy\rafal-hoffa\odsaczek\index.html'
PROJ = 'c2af0524-3c37-4ada-9c9c-acae739a1373'
PROD = 'f69d7cee-6e1e-42b1-8ccf-39afb9a47a34'
spec = importlib.util.spec_from_file_location('ps', r'c:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py')
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

shutil.copy(IDX, os.path.join(ARCH, 'index.html'))
env = io.open(r'c:\repos_tn\tn-crm\.env', encoding='utf-8-sig').read()
KEY = re.search(r'^SUPABASE_SERVICE_KEY=(.+)$', env, re.M).group(1).strip()
B = 'https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1'
H = {'apikey': KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json'}
if not requests.get(B + '/wf2_costs?product_id=eq.%s&step_key=eq.lp_kod&select=id' % PROD, headers=H, timeout=30).json():
    r = requests.post(B + '/wf2_costs', headers=H, data=json.dumps({
        'project_id': PROJ, 'product_id': PROD, 'step_key': 'lp_kod', 'stage': 2,
        'amount': 2.60, 'currency': 'USD', 'kind': 'gpt-text',
        'note': 'F4 kod gpt-5.6-sol (wf2-gpt): szkielet-kontrakt + 10 sekcji (11 calli, sekcje '
                'z 2 makietami vision) — estymat', 'created_by': 'auto'}), timeout=30)
    print('koszt F4:', r.status_code)

CHECK = [
    {'t': 'Szkielet-kontrakt (head/OG/JSON-LD/noindex + runtime-snippet z data-checkout/data-price)', 'done': True},
    {'t': 'Słownik klas wspólny + szkielet PRZED chunkami', 'done': True},
    {'t': 'Sekcje przez SEKCJA-Z-MAKIETY (IR → koder → montaż)', 'done': True},
    {'t': 'Pipeline wideo self-host (poster własną klatką)', 'done': True},
    {'t': 'Pay-badges z kanonicznego bloku', 'done': True},
    {'t': 'Wordmark = żywy tekst; favicon data-URI', 'done': True},
    {'t': 'Montaż: cross-check klas + grep zakazów', 'done': True},
]
NOTE = os.environ.get('SMOKE_NOTA', 'Smoke wizualny: PASS po poprawkach')
ps.step_update(PROJ, PROD, 'lp_kod', status='done', checklist=CHECK, fields={
    'repo_path': 'tn-crm/sklepy/rafal-hoffa/odsaczek/',
    'preview_url': 'https://crm.tomekniedzwiecki.pl/sklepy/rafal-hoffa/odsaczek/',
    'video_count': '0 (sekcja wideo SKIP — brak czystego materiału; ruch = hero-video Kling w F6)'},
    note=NOTE)
kb = os.path.getsize(IDX) // 1024
ps.artifact_add(PROJ, PROD, 'lp_kod', 'doc',
                'https://crm.tomekniedzwiecki.pl/sklepy/rafal-hoffa/odsaczek/',
                label='index.html %d KB (10 sekcji + checkout-inline@2 + sticky-buy@1 + footer@1)' % kb,
                meta={'f': 'F4', 'kb': kb})
print('OK lp_kod done — F4 ODSACZEK zamkniete (%d KB)' % kb)

led = os.path.join(ARCH, 'LEDGER.md')
t = io.open(led, encoding='utf-8').read()
dop = ('- **F4 (lp_kod) DONE 22.07:** index.html %d KB — szkielet-kontrakt (runtime VERBATIM, '
       'komentarz ODKAŻONY z literalnych tagów PRZED montażem — prewencja LL-035) + 10 sekcji '
       'gpt-5.6-sol (11 calli; 0 obcych hexów!) + montaż markerowy modułów. Smoke (visual-verify): '
       '3×P1 naprawione: (1) sticky-buy martwy — resztka wrappera hidden ze szkieletu wokół modułu; '
       '(2) cropy mycia z wypalonym tekstem — recrop bboxów; (3) badge BLIK pusty — kolizja uid '
       'gradientu Zc z wbudowanym badge modułu checkout (przemianowany Z2). Koszt $2.60.\n' % kb)
if 'F4 (lp_kod) DONE' not in t:
    t = t.replace('## Odstępstwa', dop + '\n## Odstępstwa', 1)
    io.open(led, 'w', encoding='utf-8').write(t)
print('OK LEDGER F4')
