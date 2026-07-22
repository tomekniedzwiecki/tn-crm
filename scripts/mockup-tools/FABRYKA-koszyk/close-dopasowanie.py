# -*- coding: utf-8 -*-
"""F5 close ODSACZEK (lp_dopasowanie): contact-sheety + rehost + artefakty + koszt + step done.
DOPASOWANIE.md w archiwum zbudowany przez build-dopasowanie.py (rubryka 20/20 TAK)."""
import importlib.util, io, json, os, re, sys
import requests
from PIL import Image, ImageDraw

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)
spec = importlib.util.spec_from_file_location('ps', r'c:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py')
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

PROJ = 'c2af0524-3c37-4ada-9c9c-acae739a1373'
PROD = 'f69d7cee-6e1e-42b1-8ccf-39afb9a47a34'
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'


def contact_sheet(src_dir, out_path, pat, cols=2, thumb_w=620):
    files = sorted(f for f in os.listdir(src_dir) if re.match(pat, f))
    thumbs = []
    for f in files:
        im = Image.open(os.path.join(src_dir, f)).convert('RGB')
        h = int(im.size[1] * thumb_w / im.size[0])
        thumbs.append((f, im.resize((thumb_w, min(h, 1400)), Image.LANCZOS)))
    rows = (len(thumbs) + cols - 1) // cols
    row_h = [max(t[1].size[1] for t in thumbs[r * cols:(r + 1) * cols]) + 34 for r in range(rows)]
    W = cols * (thumb_w + 16) + 16
    H = sum(row_h) + 16
    sheet = Image.new('RGB', (W, H), (24, 24, 24))
    d = ImageDraw.Draw(sheet)
    y = 16
    for r in range(rows):
        x = 16
        for f, im in thumbs[r * cols:(r + 1) * cols]:
            d.text((x, y), f, fill=(220, 220, 215))
            sheet.paste(im, (x, y + 26))
            x += thumb_w + 16
        y += row_h[r]
    sheet.save(out_path, optimize=True)
    print('OK sheet', out_path, len(files), 'dowodow')
    return len(files)


n_d = contact_sheet('dopasowanie/desktop', 'dopasowanie/sheet-desktop.png', r'^\d\d-[a-z-]+\.png$')
n_m = contact_sheet('dopasowanie/mobile', 'dopasowanie/sheet-mobile.png', r'^\d\d-[a-z-]+-m\.png$')

for name, label, meta in [
    ('sheet-desktop.png', 'Contact-sheet dowodow 1280 (10 sekcji, kompozyt makieta|render)',
     {'viewport': 'desktop', 'sekcje': n_d}),
    ('sheet-mobile.png', 'Contact-sheet dowodow 390 (10 sekcji + sticky)',
     {'viewport': 'mobile', 'sekcje': n_m}),
]:
    dest = 'bud-assets/odsaczek/panel/' + name.replace('.png', '.webp')
    ps.storage_upload(os.path.join('dopasowanie', name), dest, to_webp=True)
    ps.artifact_add(PROJ, PROD, 'lp_dopasowanie', 'dowod', PUB + dest, label=label, meta=meta)

# DOPASOWANIE.md do wf2-docs
ps.doc_add(PROJ, PROD, 'lp_dopasowanie',
           r'C:\Users\tomek\Desktop\TN-Sklepy-grafiki\FABRYKA-2026-07\odsaczek\dopasowanie\DOPASOWANIE.md',
           'odsaczek',
           label='DOPASOWANIE.md (rubryka R13: r1 9/10, r2 po poprawkach 10/10 desktop+mobile)')

# koszt F5 (mc-scena HIGH $0.25 + 2 rundy rubryki subagent — estymat pracy $1.2)
env = io.open(r'c:\repos_tn\tn-crm\.env', encoding='utf-8-sig').read()
KEY = re.search(r'^SUPABASE_SERVICE_KEY=(.+)$', env, re.M).group(1).strip()
B = 'https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1'
H = {'apikey': KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json'}
if not requests.get(B + '/wf2_costs?product_id=eq.%s&step_key=eq.lp_dopasowanie&select=id' % PROD,
                    headers=H, timeout=30).json():
    requests.post(B + '/wf2_costs', headers=H, data=json.dumps({
        'project_id': PROJ, 'product_id': PROD, 'step_key': 'lp_dopasowanie', 'stage': 2,
        'amount': 1.45, 'currency': 'USD', 'kind': 'gpt-image',
        'note': 'F5: mc-scena HIGH (P1 rubryki — scena mid-cta pominieta w crop-first F3) '
                '+ 2 rundy rubryki R13 (2. para oczu) — estymat', 'created_by': 'auto'}), timeout=30)
    print('koszt F5: OK')

CHECK = [
    {'t': 'Kompozyt per sekcja (1280 + 390) — KOMPLET NN-*.png', 'done': True},
    {'t': 'Lista rozjazdów per sekcja', 'done': True},
    {'t': 'Rewrite-not-patch przy „NIE"', 'done': True},
    {'t': 'Progi: desktop ≥0.85 / mobile ≥0.78 KAŻDA sekcja', 'done': True},
    {'t': 'Werdykt vision „ten sam projekt" = TAK wszędzie', 'done': True},
    {'t': 'Contact-sheet dowodów wgrany do panelu (bud-assets/<slug>/panel/)', 'done': True},
]
FIELDS = {
    'sekcje_done': '10/10 (+sticky render-only)',
    'ssim_min': 'raw-SSIM=info (R13); LAYOUT-diff 0 FAIL 1280 i 390; rubryka r1 9/10 → r2 10/10 TAK',
    'dopasowanie_dir': 'scripts/mockup-tools/FABRYKA-koszyk/dopasowanie/',
}
NOTE = ('F5 done — 2 rundy rubryki R13 (świeże oczy Sonnet): r1 = 9/10 TAK desktop i mobile, '
        'jedyny NIE #mid-cta (crop-first F3 pominął scenę full-frame — karta rekapu wisiała na '
        'pustym papierze, brak paska 3 spec). Fix: mc-scena GEN HIGH (2 pary oczu 6/6 PASS; '
        'kompozycja POD RUCH wg LL-041 — cienie liści + luźny ręcznik jako nośniki) + żywe '
        'chipy na scenie + pasek 3 spec; P2: duplikaty etykiet stanów TOR-I usunięte, '
        'strzałka-sierota zloz usunięta, mycie align-start + equal-height kart. r2 = 6/6 TAK '
        '→ 10/10 oba viewporty. LAYOUT-diff DOM self-checki: 0 FAIL. Guard #zamow w renderze '
        'lokalnym = kontrakt LL-038 (żywy formularz potwierdzony na zaradek.pl/odsaczek).')
sid = ps.step_update(PROJ, PROD, 'lp_dopasowanie', status='done', note=NOTE,
                     fields=FIELDS, checklist=CHECK)
print('step lp_dopasowanie:', sid)
