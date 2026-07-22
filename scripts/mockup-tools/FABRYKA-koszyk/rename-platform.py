# -*- coding: utf-8 -*-
"""Rename produktow platformy (LL-046): platforma nie ma UPDATE nazwy ani DELETE, wiec
rename = nowy produkt (ensure_product) + PRZEPIECIE sluga kasy (stary wariant -> slug
archiwalny '<slug>-arch', nowy wariant -> slug wlasciwy) + product_meta w DB."""
import importlib.util, json, sys, urllib.request

sys.stdout.reconfigure(encoding='utf-8')
spec = importlib.util.spec_from_file_location('psync', r'c:\repos_tn\tn-crm\scripts\mockup-tools\platform-sync.py')
psync = importlib.util.module_from_spec(spec)
sys.argv = ['platform-sync.py', 'status', 'x']  # nie odpalaj main
try:
    spec.loader.exec_module(psync)
except SystemExit:
    pass
adapter_ok = psync.adapter_ok
ps = psync.ps

PROJ = 'c2af0524-3c37-4ada-9c9c-acae739a1373'
SID = '019f8634-3305-723a-9cfb-bec36487203b'
PLAN = [
    ('c5977c4d-76dd-472e-8953-d9fb12b1120b', 'ugniatek', 'Ugniatek — masażer powięziowy'),
    ('f69d7cee-6e1e-42b1-8ccf-39afb9a47a34', 'odsaczek', 'Odsączek — składany koszyk do smażenia'),
]

for wf2_id, slug, name in PLAN:
    listing = adapter_ok({'action': 'products', 'shop_id': SID, 'page_size': 50}, 'products')
    rows = listing.get('data', [])
    stary = None
    nowy = None
    for x in rows:
        v = (x.get('variants') or [{}])[0]
        if v.get('checkoutSlug') == slug:
            stary = (x['id'], v['id'], x.get('name'))
        if x.get('name') == name:
            nowy = (x['id'], (x.get('variants') or [{}])[0].get('id'))
    if not nowy:
        prow = psync._product_row(PROJ, wf2_id)
        ep = adapter_ok({'action': 'ensure_product', 'shop_id': SID, 'name': name,
                         'price': float(prow['price'])}, 'ensure_product')
        listing = adapter_ok({'action': 'products', 'shop_id': SID, 'search': name,
                              'page_size': 50}, 'products')
        hit = next((x for x in listing.get('data', []) if x.get('id') == ep.get('id')), None)
        assert hit, 'ensure_product nie zwrocil znajdowalnego produktu'
        nowy = (hit['id'], (hit.get('variants') or [{}])[0].get('id'))
    print(slug, '| stary:', stary, '| nowy:', nowy)
    if stary and stary[0] != nowy[0]:
        adapter_ok({'action': 'set_checkout_slug', 'shop_id': SID, 'product_id': stary[0],
                    'variant_id': stary[1], 'slug': slug + '-arch'}, 'set_checkout_slug')
        print('  stary slug ->', slug + '-arch')
    adapter_ok({'action': 'set_checkout_slug', 'shop_id': SID, 'product_id': nowy[0],
                'variant_id': nowy[1], 'slug': slug}, 'set_checkout_slug')
    print('  nowy slug ->', slug)
    ps.product_meta(wf2_id, {'platform_product_id': nowy[0], 'platform_name': name})
    ps._patch('wf2_products', {'id': 'eq.' + wf2_id}, {'platform_variant_id': nowy[1],
                                                       'platform_synced_at': ps._now()})
    import requests
    code = requests.get('https://zaradek.pl/checkout?p=' + slug, timeout=30).status_code
    print('  DOWOD kasa /checkout?p=%s -> HTTP %s' % (slug, code))
print('KONIEC')
