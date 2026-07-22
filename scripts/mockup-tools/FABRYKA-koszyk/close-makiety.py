# -*- coding: utf-8 -*-
"""F2 close ODSACZEK: upload mobile do storage, 20 artefaktow (makieta/makieta_mobile,
meta.section/viewport, pelny URL), koszt, lp_makiety done (gate kompletu w panel-sync),
archiwum makiety/, LEDGER. Uruchamiac PO werdykcie krytyka (PASS)."""
import glob, importlib.util, io, json, os, re, shutil, sys
import requests

sys.stdout.reconfigure(encoding='utf-8')
FAB = r'c:\repos_tn\tn-crm\scripts\mockup-tools\FABRYKA-koszyk'
OUT = os.path.join(FAB, 'out')
ARCH = r'C:\Users\tomek\Desktop\TN-Sklepy-grafiki\FABRYKA-2026-07\odsaczek'
PROJ = 'c2af0524-3c37-4ada-9c9c-acae739a1373'
PROD = 'f69d7cee-6e1e-42b1-8ccf-39afb9a47a34'
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
MB = 'bud-assets/odsaczek/makiety/'
spec = importlib.util.spec_from_file_location('ps', r'c:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py')
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

SEKCJE = ['01-hero', '02-jeden-ruch', '03-zawies', '04-zloz', '05-durszlak',
          '06-mycie', '07-mid-cta', '08-zamow', '09-faq', '10-final']

# 1. upload mobile (desktopy juz w storage)
for s in SEKCJE:
    ps.storage_upload(os.path.join(OUT, s + '-mobile.png'), MB + s + '-mobile.webp', to_webp=True)

# 2. artefakty 20 (idempotentnie — artifact_add sam deduplikuje po URL/label wg panel-sync)
for s in SEKCJE:
    ps.artifact_add(PROJ, PROD, 'lp_makiety', 'makieta', PUB + MB + s + '.webp',
                    label='Makieta %s (desktop)' % s,
                    meta={'section': s, 'viewport': 'desktop'})
    ps.artifact_add(PROJ, PROD, 'lp_makiety', 'makieta_mobile', PUB + MB + s + '-mobile.webp',
                    label='Makieta %s (mobile)' % s,
                    meta={'section': s, 'viewport': 'mobile'})

# 3. archiwum makiety/
am = os.path.join(ARCH, 'makiety'); os.makedirs(am, exist_ok=True)
for f in glob.glob(os.path.join(OUT, '*.png')):
    shutil.copy(f, os.path.join(am, os.path.basename(f)))
print('OK archiwum makiety/ (%d)' % len(os.listdir(am)))

# 4. koszt F2 (1 hero + 9 batch + 4 regen + 10 mobile = 24 generacje medium)
env = io.open(r'c:\repos_tn\tn-crm\.env', encoding='utf-8-sig').read()
KEY = re.search(r'^SUPABASE_SERVICE_KEY=(.+)$', env, re.M).group(1).strip()
B = 'https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1'
H = {'apikey': KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json'}
have = requests.get(B + '/wf2_costs?product_id=eq.%s&step_key=eq.lp_makiety&select=id' % PROD, headers=H, timeout=30).json()
if not have:
    r = requests.post(B + '/wf2_costs', headers=H, data=json.dumps({
        'project_id': PROJ, 'product_id': PROD, 'step_key': 'lp_makiety', 'stage': 2,
        'amount': 1.70, 'currency': 'USD', 'kind': 'gpt-image',
        'note': 'F2: 24 generacje medium (hero WOW 1 take + 9 sekcji + 4 regen fake-specs '
                '+ 10 mobile) — komplet 10 par desktop+mobile',
        'created_by': 'auto'}), timeout=30)
    print('koszt F2:', r.status_code)

# 5. krok done (gate kompletu makiet w panel-sync zweryfikuje pary)
CHECK = [
    {'t': 'Styl-master → hero-makieta (gate WOW, max 3 iteracje)', 'done': True},
    {'t': 'Makiety WSZYSTKICH sekcji planu', 'done': True},
    {'t': 'Prawdziwe dane wprost w promptach — zero fake-specs', 'done': True},
    {'t': 'DETAL-LAYER ≥3/4 warstw per sekcja (bez numeracji „0N/NN")', 'done': True},
    {'t': 'Pary mobile 2:3 dla hero + TOR-I + wideo', 'done': True},
    {'t': 'Sekcje TOR-I: makiety pokazują STANY demonstracji', 'done': True},
    {'t': 'Krytyk makiet: PASS („czuć produkt, drogi projekt")', 'done': True},
    {'t': 'AKCEPT MAKIET — kontrakt wyglądu zamknięty', 'done': True},
]
NOTE = os.environ.get('KRYTYK_NOTA', 'Krytyk makiet: PASS')
ps.step_update(PROJ, PROD, 'lp_makiety', status='done', checklist=CHECK, fields={
    'makiety_dir': 'bud-assets/odsaczek/makiety/',
    'sekcje_count': '10 sekcji × desktop+mobile = 20 makiet',
    'tor_i': 'zloz-na-plasko (toggle Rozłożony/Złożony — stany na makietach 04/04-mobile)',
    'akcept': '22.07.2026 — fabryka (hero WOW 1 take; 4 regeneracje za fake-specs: '
              'gwarancja/zmywarka/talerzy/waga)'}, note=NOTE)
print('OK lp_makiety done — F2 ODSACZEK zamkniete')

# 6. LEDGER
led = os.path.join(ARCH, 'LEDGER.md')
t = io.open(led, encoding='utf-8').read()
dop = ('- **F2 (lp_makiety) DONE 22.07:** 10 par desktop+mobile (20 makiet, medium). Hero WOW '
       '1 take (archetyp H: kadr/hook/karta). Gate fake-specs NA MAKIECIE ubił 4: „2 lata '
       'gwarancji" (02), „bezpieczny kontakt z żywnością"+„lekki" (06), „zmywarka"+„frytkownice"'
       '+„na lata" (07), „talerzy" (08) — regeneracje z twardymi listami pilli verbatim. '
       'Mobile = projekt od zera (wzorzec Drapka: scena ~45%%, hook, karta w foldzie). '
       'TOR-I zloz-na-plasko: stany Rozłożony/Złożony na makiecie. Koszt $1.70.\n')
if 'F2 (lp_makiety) DONE' not in t:
    t = t.replace('## Odstępstwa', dop + '\n## Odstępstwa', 1)
    io.open(led, 'w', encoding='utf-8').write(t)
print('OK LEDGER F2')
