# -*- coding: utf-8 -*-
"""Domyka lp_makiety SSAWEK: krok DONE (krytyk czysty), checklista VERBATIM. KAMIEN 'AKCEPT MAKIET'
= BRAMKA TOMKA -> zostaje done=False z nota 'do akceptu Tomka (retro)'. Gate kompletu
(_sprawdz_makiety_komplet) musi byc OK (14 desktop + 14 mobile par)."""
import importlib.util, os, sys
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
PS = os.path.join(HERE, '..', 'panel-sync.py')
spec = importlib.util.spec_from_file_location('ps', PS)
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

PROJ = '1a097f94-1b64-48ec-91c6-cf32565f79a4'
PROD = '051dd9c1-546d-4ee0-891e-1576eaef85dc'

# doc SPEC-I demo -> wf2-docs (TOR-I kontrakt)
ps.doc_add(PROJ, PROD, 'lp_makiety', os.path.join(HERE, 'interakcje', '05-demo-SPEC-I.md'),
           slug='ssawek', label='05-demo-SPEC-I.md (TOR-I kontrakt — T0 kwalifikacja + stany)')

zarzuty = ps._sprawdz_makiety_komplet(PROJ, PROD)
if zarzuty:
    print('!! GATE KOMPLETU NIE OK:'); [print('   -', z) for z in zarzuty]; sys.exit(1)

CHECK = [
 {'t': 'Styl-master → hero-makieta (gate WOW, max 3 iteracje)', 'done': True},
 {'t': 'Makiety WSZYSTKICH sekcji planu', 'done': True},
 {'t': 'Prawdziwe dane wprost w promptach — zero fake-specs', 'done': True},
 {'t': 'DETAL-LAYER ≥3/4 warstw per sekcja (bez numeracji „0N/NN")', 'done': True},
 {'t': 'Pary mobile 2:3 dla hero + TOR-I + wideo', 'done': True},
 {'t': 'Sekcje TOR-I: makiety pokazują STANY demonstracji', 'done': True},
 {'t': 'Krytyk makiet: PASS („czuć produkt, drogi projekt")', 'done': True},
 {'t': 'AKCEPT MAKIET — kontrakt wyglądu zamknięty', 'done': False},  # BRAMKA TOMKA
]
ps.step_update(PROJ, PROD, 'lp_makiety', status='done', checklist=CHECK, force_kolejnosc=True,
    note=('Odstepstwo kolejnosci: kalkulacja (Etap 1) N/D w torze Allegro (force_kolejnosc, LEDGER F0). '
          'F2 zamkniete — KRYTYK CZYSTY (14/14 desktop + 14/14 mobile PASS w 1. rundzie; 2 regeny '
          'desktop = transient edge 500, nie jakosc). Styl-master DNA -> hero archetyp C. Sekcje '
          'build=14 (manifest 16; wideo #12 + ugc-zdjecia #13 = blokada-tomek, bez makiety — klasa '
          'dowodowa, decyzja Tomka). Hero nosnik ruchu = ZWARTA SMUGA POPIOLU wciagana do dyszy '
          '(klasa dym/para = fizyczny obiekt; NIE zakazane swiatlo+pylki). TOR-I 05-demo: 3 stany '
          'na kadrze + SPEC-I. EMOCJA↔PRODUKT: problem BEZ produktu. Cross-landing 5/5 osi vs '
          'zaradek/mata/drapek. Anatomia OK; brak near-dup scen. Akcent JEDYNY (CTA+swash+★opinie). '
          'KAMIEN „akcept makiet" = PENDING (bramka Tomka, retro-akcept). Gen edge MEDIUM '
          '(WF2_SKIP_LOCAL — local HIGH 520 Cloudflare).'),
    fields={'makiety_dir': 'bud-assets/ssawek/makiety/', 'sekcje_count': '14 (build; 16 manifest, 2 blokada-tomek)',
            'tor_i': '05-demo (L3 — 3 stany + SPEC-I)',
            'akcept': 'PENDING — do akceptu Tomka (retro); kamien celowo niezaznaczony'})
print('OK lp_makiety done (akcept = pending, bramka Tomka)')
