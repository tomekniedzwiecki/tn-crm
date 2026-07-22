# -*- coding: utf-8 -*-
"""F2.5 close ODSACZEK: upload rekolorowanych faviconow + dowodow, artefakty, koszt,
lp_styl_marka done (checklista VERBATIM WS), LEDGER dopis."""
import importlib.util, io, json, os, re, shutil, sys
import requests

sys.stdout.reconfigure(encoding='utf-8')
FAB = r'c:\repos_tn\tn-crm\scripts\mockup-tools\FABRYKA-koszyk'
BR = os.path.join(FAB, 'brand')
ARCH = r'C:\Users\tomek\Desktop\TN-Sklepy-grafiki\FABRYKA-2026-07\odsaczek'
PROJ = 'c2af0524-3c37-4ada-9c9c-acae739a1373'
PROD = 'f69d7cee-6e1e-42b1-8ccf-39afb9a47a34'
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
BB = 'bud-assets/odsaczek/brand/'
spec = importlib.util.spec_from_file_location('ps', r'c:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py')
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

# 1. upload rekolorowanych + dowod v2 (nadpisanie)
for f in ('favicon-512.png', 'favicon-256.png', 'favicon-32.png', 'favicon-16.png', 'brand-context-v2.png'):
    ps.storage_upload(os.path.join(BR, f), BB + f)

# 2. archiwum brand/
ab = os.path.join(ARCH, 'brand'); os.makedirs(ab, exist_ok=True)
for f in os.listdir(BR):
    src = os.path.join(BR, f)
    if os.path.isfile(src):
        shutil.copy(src, os.path.join(ab, f))
print('OK archiwum brand/ (%d plikow)' % len(os.listdir(ab)))

# 3. artefakty panelu
ps.artifact_add(PROJ, PROD, 'lp_styl_marka', 'styl_master', PUB + BB + '00-styl-master.webp',
                label='Styl-master (plansza DNA: scena + UI specimen, gate PASS)', meta={'f': 'F2.5'})
ps.artifact_add(PROJ, PROD, 'lp_styl_marka', 'branding', PUB + BB + 'brand-context-v2.png',
                label='brand-context v2 — dowód @16/32/64 oba tła (favicon po rekoloracji do #176B3A)',
                meta={'f': 'F2.5', 'werdykt': '6xT PASS'})
ps.artifact_add(PROJ, PROD, 'lp_styl_marka', 'branding', PUB + BB + 'logo-combo.png',
                label='Lockup Odsączek (favicon + wordmark Bricolage Grotesque)', meta={'f': 'F2.5'})
ps.artifact_add(PROJ, PROD, 'lp_styl_marka', 'branding', PUB + BB + 'favicon-512.png',
                label='Favicon 512 (garnek + łuk trajektorii, zieleń butelkowa)', meta={'f': 'F2.5'})

# 4. koszt F2.5
env = io.open(r'c:\repos_tn\tn-crm\.env', encoding='utf-8-sig').read()
KEY = re.search(r'^SUPABASE_SERVICE_KEY=(.+)$', env, re.M).group(1).strip()
B = 'https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1'
H = {'apikey': KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json'}
have = requests.get(B + '/wf2_costs?product_id=eq.%s&step_key=eq.lp_styl_marka&select=id' % PROD, headers=H, timeout=30).json()
if not have:
    r = requests.post(B + '/wf2_costs', headers=H, data=json.dumps({
        'project_id': PROJ, 'product_id': PROD, 'step_key': 'lp_styl_marka', 'stage': 2,
        'amount': 1.45, 'currency': 'USD', 'kind': 'gpt-image',
        'note': 'F2.5: styl-master 1x medium (edge) + favicon 6 kandydatow HIGH lokalnie '
                '(3 metafory x 2) — wordmark/lockupy z fontu (Pillow, $0)',
        'created_by': 'auto'}), timeout=30)
    print('koszt F2.5:', r.status_code)

# 5. krok done
CHECK = [
    {'t': 'Styl-master ×1 gotowy (gate: motyw↔korzyść, jasno, produkt wierny)', 'done': True},
    {'t': 'Nazwa zarezerwowana w bud_brand_names (INSERT-or-fail)', 'done': True},
    {'t': 'Favicon: N=4-6 → selektor @32px → werdykt vision top-2', 'done': True},
    {'t': 'Wordmark wyrenderowany Z FONTU landingu (nie gpt-image)', 'done': True},
    {'t': 'Lockup: favicon LEWA + wordmark PRAWA', 'done': True},
    {'t': 'Pliki brand/ obejrzane i wgrane do Storage', 'done': True},
    {'t': 'Werdykt rubryką 6×T/N (32/16/metafora/flat/zero liter/mono) — bez 6×T = FAIL', 'done': True},
    {'t': 'Kompozyt kontekstowy brand-context.png → wf2_artifacts', 'done': True},
]
ps.step_update(PROJ, PROD, 'lp_styl_marka', status='done', checklist=CHECK,
    note=('Znak: fav-m1-1 „garnek + łuk trajektorii z grotem" (kategoria motion-path; top-2 vs romb '
          'siatki z kroplą). Rubryka 6×T PASS po REKOLORACJI do #176B3A (kandydaci wyszli w beżu '
          'palety — jak ugniatek/petrol). Najsłabsza rzecz: masywny grot @16 zlewa się z rantem '
          '(zostaje czytelny garnek z pałąkiem). Wordmark Bricolage Grotesque, glify PL OK.'))
print('OK lp_styl_marka done — F2.5 ODSACZEK zamkniete')

# 6. LEDGER
led = os.path.join(ARCH, 'LEDGER.md')
t = io.open(led, encoding='utf-8').read()
dop = ('- **F2.5 (lp_styl_marka) DONE 22.07:** styl-master PASS (scena wyjmowania + łuk-sygnatura + '
       'UI specimen; medium 3:2, ref g2+g0). Favicon: 6 kandydatów HIGH (3 metafory ×2), top-1 = '
       '„garnek + łuk z grotem" (motion-path), REKOLORACJA beż→#176B3A, rubryka 6×T PASS '
       '(najsłabsze: masywny grot @16). Wordmark/lockupy z BricolageGrotesque.ttf (Pillow). '
       'Komplet w bud-assets/odsaczek/brand/ + ARCH/brand/. Koszt $1.45.\n')
if 'F2.5 (lp_styl_marka) DONE' not in t:
    t = t.replace('## Odstępstwa', dop + '\n## Odstępstwa', 1)
    io.open(led, 'w', encoding='utf-8').write(t)
print('OK LEDGER F2.5')
