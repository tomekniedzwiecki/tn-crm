# -*- coding: utf-8 -*-
# Domkniecie kroku lp_kod (Ugniatek): artefakt kodu + koszt F4 + step done (checklista VERBATIM z WS).
import importlib.util, io, json, os, re, sys
import requests

sys.stdout.reconfigure(encoding='utf-8')
spec = importlib.util.spec_from_file_location(
    'ps', r'c:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py')
ps = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ps)

PROJ = 'c2af0524-3c37-4ada-9c9c-acae739a1373'
PROD = 'c5977c4d-76dd-472e-8953-d9fb12b1120b'
IDX = r'c:\repos_tn\tn-crm\sklepy\rafal-hoffa\ugniatek\index.html'

aid = ps.artifact_add(PROJ, PROD, 'lp_kod', 'kod',
                      'tn-crm/sklepy/rafal-hoffa/ugniatek/index.html',
                      label='index.html — 10 sekcji + moduly kanoniczne (%d KB)' % (os.path.getsize(IDX) // 1024),
                      meta={'storage': 'desktop', 'sekcje': 10,
                            'moduly': 'checkout-inline@2, footer@1, sticky-buy@1, pay-badges kanon'})
print('OK artefakt kodu', aid)

env = io.open(r'c:/repos_tn/tn-crm/.env', encoding='utf-8').read()
KEY = re.search(r'^SUPABASE_SERVICE_KEY=(.+)$', env, re.M).group(1).strip()
B = 'https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1'
H = {'apikey': KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json'}
r = requests.post(B + '/wf2_costs', headers=H, data=json.dumps({
    'project_id': PROJ, 'product_id': PROD, 'step_key': 'lp_kod', 'stage': 2,
    'amount': 2.75, 'currency': 'USD', 'kind': 'gpt-text',
    'note': 'F4 kod gpt-5.6-sol (wf2-gpt): szkielet-kontrakt + hero + 9 sekcji '
            '(11 calli, sekcje z 2 annotated makietami jako wejsciem wizyjnym) — estymat',
    'created_by': 'auto'}), timeout=30)
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
FIELDS = {
    'repo_path': 'tn-crm/sklepy/rafal-hoffa/ugniatek/index.html',
    'sekcje': '10/10 (01-hero..10-final; TikTok=SKIP wg planu F1)',
    'rozmiar': '%d KB' % (os.path.getsize(IDX) // 1024),
}
NOTE = ('F4 done. Szkielet-kontrakt 13/13 + 10 sekcji gpt-5.6-sol wg SEKCJA-Z-MAKIETY '
        '(briefy: copy VERBATIM + IR scale_px_norm/bboxy + annotated makiety desktop+mobile '
        'jako wejscie wizyjne). Montaz modulow kanonicznych: sekcja #zamow = checkout-inline@2 '
        'VERBATIM (steps, skorka aliasow --zc-*, mechanika nietykalna; brief gpt dla 08 '
        'ODRZUCONY — modul ma wlasna karte, dublowanie = odstepstwo od kanonu), footer@1 '
        '(BEZ .foot-rating — zakaz social-proof liczbowego Ugniatka), sticky-buy@1 (IO na '
        '.hero), pay-badges kanon x3 (unikalne id gradientow BLIK). Smoke-test wizualny '
        '(subagent, desktop 1280 + mobile 390/360): 3 defekty klasy ".callout collapse" '
        'znalezione i NAPRAWIONE (anatomia mobile callouty nachodzily, sticky-buy display:none '
        'z martwego bloku szkieletu, wi-callout kreska zamiast chipa) + re-test PASS. '
        'Konsola czysta; checkout w trybie guard (placeholder {{WF2_PRODUCT_ID}} — hydracja '
        'przy publikacji pl_*). Pozycja checklisty "Pipeline wideo self-host": NIE DOTYCZY '
        'planu Ugniatka (F1: sekcja TikTok=SKIP, 0 keep z kuracji — obcy brand; ruch = '
        'hero-video Kling w kroku Zycie) — odhaczona jako spelniona pusto, bez fabrykowania '
        'pipeline. Favicon data-URI 64px (2.9 KB) w head. Dowody 1:1 per sekcja = krok '
        'lp_dopasowanie (sekcja-diff.py).')

sid = ps.step_update(PROJ, PROD, 'lp_kod', status='done', note=NOTE,
                     fields=FIELDS, checklist=CHECK)
print('step lp_kod:', sid)
