# -*- coding: utf-8 -*-
"""F3 — retusz white-label galerii SSAWEK (Popiolek).
1. Nadpisuje bud-assets/ssawek/galeria/{g07,g11,g09}.webp zretuszowanymi kadrami
   (LEHMANN TOOLS usuniete pionowym klonem stali; tabliczka g09 spixelowana, CE zostaje).
2. Aktualizuje bud_tt_products.gallery_curated: retusz_done + nota; g05 advisory = ocenione
   NIECZYTELNE (nozzle + reflektujaca sciana zbiornika bez czytelnej marki) -> bez retuszu.
Retusz = ten sam uklad -> x-upsert na produkcyjny URL dozwolony (STANDARD F3 pkt 6)."""
import importlib.util, os, sys, json, datetime, requests
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
RET = r'C:\Users\tomek\AppData\Local\Temp\claude\c--repos-tn\e06da69a-a462-4444-84ed-3066c7a28d56\scratchpad\retusz'
PS = os.path.join(HERE, '..', 'panel-sync.py')
spec = importlib.util.spec_from_file_location('ps', PS)
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

TT = '6d2c2366-f05b-4447-b17f-80cfc3c7e811'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
SLUG = 'ssawek'

# 1) upload zretuszowanych (te same parametry co f0.py: webp, max_width 1600, q85)
for g in ('g07', 'g11', 'g09'):
    src = os.path.join(RET, g + '.jpg')
    if not os.path.isfile(src):
        print('!! brak', src); sys.exit(1)
    url = ps.storage_upload(src, 'bud-assets/%s/galeria/%s.webp' % (SLUG, g),
                            bucket='attachments', to_webp=True, max_width=1600, quality=85)
    print('UPLOAD retusz', g, '->', url)

# 2) update gallery_curated werdyktow
rows = ps._get('bud_tt_products', {'id': 'eq.' + TT, 'select': 'gallery_curated'})
gc = rows[0]['gallery_curated']
RETUSZ_DONE = {
 'g07': 'RETUSZ WYKONANY (F3): nadruk LEHMANN TOOLS na czole zbiornika usuniety pionowym klonem stali (feather); brak czytelnej marki.',
 'g11': 'RETUSZ WYKONANY (F3): nadruk LEHMANN TOOLS na czole zbiornika usuniety pionowym klonem stali (feather); brak czytelnej marki.',
 'g09': 'RETUSZ WYKONANY (F3): pole tekstowe tabliczki znamionowej (marka/model) spixelowane do nieczytelnosci; symbol CE zostawiony.',
}
for it in gc.get('items', []):
    k = it.get('kadr')
    if k in RETUSZ_DONE:
        it['retusz_done'] = True
        it['retusz_at'] = NOW
        it['retusz_powod'] = RETUSZ_DONE[k]
    if k == 'g05':
        # advisory rozstrzygniete: nozzle + widoczna (odbijajaca) sciana zbiornika BEZ czytelnej marki
        it['retusz_done'] = False
        it['retusz_at'] = NOW
        it['retusz_powod'] = ('Advisory ROZSTRZYGNIETE (F3): po powiekszeniu ssawka podlogowa i '
                              'widoczna (reflektujaca) sciana zbiornika NIE nios czytelnego nadruku '
                              'LEHMANN (czolo z logo odwrocone) -> retusz NIE wymagany.')
gc['nota'] = (gc.get('nota', '') + ' | F3 RETUSZ WYKONANY: g07/g11 (LEHMANN TOOLS na zbiorniku, '
              'pionowy klon stali) + g09 (tabliczka spixelowana, CE zostaje); g05 advisory = '
              'nieczytelne, bez retuszu. Zaden kadr on-page nie niesie czytelnego LEHMANN.')
r = requests.patch(ps.REST + '/bud_tt_products?id=eq.' + TT,
                   headers={**ps.HJSON, 'Prefer': 'return=minimal'},
                   data=json.dumps({'gallery_curated': gc}, ensure_ascii=False).encode('utf-8'),
                   timeout=60)
print('PATCH gallery_curated', r.status_code, r.text[:200])
r.raise_for_status()
print('OK retusz galerii + gallery_curated zaktualizowane')
