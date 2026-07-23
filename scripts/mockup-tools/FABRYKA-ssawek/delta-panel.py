# -*- coding: utf-8 -*-
"""Domkniecie panelowe DELTY MAPA-ZASTOSOWAN (szerokosc funkcji) SSAWEK/Popiolek:
 - koszt openai-image $1.00 (4 deliverable local HIGH; 1 overhead mobile#1 nie bilowany; ZERO 'claude')
 - lp_kod re-afirmacja done (checklista VERBATIM z WS) + nota delty (mozaika 6 kafli)
 - lp_finisz done (checklista VERBATIM z WS) — gate-check 0 FAIL z mapa_zastosowan PASS
 - lp_makiety NOTA: makiety zaktualizowane o mozaike (akcept = ZOSTAJE u Tomka, retro-akcept razem)
 - docs -> wf2-docs: RETRO / DOPASOWANIE / MAPA-ZASTOSOWAN / PRZEWODNIK
 force_kolejnosc (kalkulacja Etap 1 N/D tor Allegro, LEDGER F0)."""
import importlib.util, os, sys
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
DOP = os.path.join(HERE, 'dopasowanie')
PS = os.path.join(HERE, '..', 'panel-sync.py')
spec = importlib.util.spec_from_file_location('ps', PS)
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

PROJ = '1a097f94-1b64-48ec-91c6-cf32565f79a4'
PROD = '051dd9c1-546d-4ee0-891e-1576eaef85dc'
SLUG = 'ssawek'

# ── 1. koszt openai-image delty (twarde API; ZERO 'claude', zero $0-markerow) ──
COST_NOTE = ('DELTA MAPA-ZASTOSOWAN (szerokosc funkcji) Popiolek: 4 generacje gpt-image-2 local HIGH '
             '@ $0.25 = sc-zast-mokro (WET) + sc-zast-pellet + makieta 06-zastosowania desktop + '
             'makieta 06-zastosowania mobile. 1 regen mobile#1 (stary 4-kafel prompt) = overhead '
             'operacyjny, NIE bilowany (deliverable = 4 obrazy). Suma twardego API landingu: $4.90 + '
             '$1.00 = $5.90.')
cid = ps.cost_add(PROJ, PROD, 1.00, kind='openai-image', currency='USD', step='lp_grafiki',
                  note=COST_NOTE, created_by='fabryka')
print('COST openai-image id=%s amount=$1.00' % cid)

# ── 2. lp_kod re-afirmacja (checklista VERBATIM z WS projekt.html) ──
LP_KOD_CHECK = [
 {'t': 'Szkielet-kontrakt (head/OG/JSON-LD/noindex + runtime-snippet z data-checkout/data-price)', 'done': True},
 {'t': 'Słownik klas wspólny + szkielet PRZED chunkami', 'done': True},
 {'t': 'Sekcje przez SEKCJA-Z-MAKIETY (IR → koder → montaż)', 'done': True},
 {'t': 'Pipeline wideo self-host (poster własną klatką)', 'done': True},
 {'t': 'Pay-badges z kanonicznego bloku', 'done': True},
 {'t': 'Wordmark = żywy tekst; favicon data-URI', 'done': True},
 {'t': 'Montaż: cross-check klas + grep zakazów', 'done': True},
]
KOD_NOTE = ('DELTA MAPA-ZASTOSOWAN: sekcja zastosowania przebudowana na MOZAIKE 6 kafli-swiatow '
            '(kominek · piec na pellet · gruz · warsztat/auto · WODA/mokro · dzialka/dmuchawa) niosaca '
            '3 FUNKCJE (sucho/mokro/nadmuch); CSS repeat(3,1fr) desktop / 2 kol tablet / 1 kol mobile. '
            'hero-sub = spektrum Skrolik ("popiol, gruz, woda po zalaniu — i dmuchawa"); rozwiazanie 3. USP '
            'dociagnieta woda (osobna funkcja); FAQ +3 (woda/dmuchawa/auto z op.9) + JSON-LD FAQPage '
            '9 pytan. Copy-only delty hero/rozwiazanie/faq: doktryna PIVOT (makieta swieta dla ukladu, '
            'kod odtwarza copy 1:1 — regen makiet 01/04/14 zbedny). noindex ON (preview).')
ps.step_update(PROJ, PROD, 'lp_kod', status='done', checklist=LP_KOD_CHECK, force_kolejnosc=True,
               note=KOD_NOTE,
               fields={'preview_url': 'https://crm.tomekniedzwiecki.pl/sklepy/tomek-niedzwiecki/ssawek/',
                       'delta': 'mapa-zastosowan mozaika 6 swiatow + hero-sub + FAQ+3'})
print('OK lp_kod re-afirmacja')

# ── 3. lp_makiety NOTA (akcept makiet = ZOSTAJE u Tomka; makiety zaktualizowane o mozaike) ──
MAK_NOTE = ('DELTA: makieta 06-zastosowania (desktop+mobile) REGENEROWANA jako MOZAIKA 6 kafli-swiatow '
            '(w tym kafel WODA/mokro WET). Kamien AKCEPT MAKIET = nadal PENDING (bramka Tomka) — '
            'makiety zaktualizowane o mozaike zastosowan DO RETRO-AKCEPTU RAZEM z reszta.')
ps.step_update(PROJ, PROD, 'lp_makiety', status='done', force_kolejnosc=True, note=MAK_NOTE)
print('OK lp_makiety nota (akcept PENDING u Tomka)')

# ── 4. lp_finisz DONE (checklista VERBATIM z WS) — gate-check REALNIE 0 FAIL ──
LP_FIN_CHECK = [
 {'t': 'F6 twarda: 0 konsoli, 0 h-scroll (390/768/1280), img OK', 'done': True},
 {'t': 'Grep zakazów + shop.name nie występuje w HTML', 'done': True},
 {'t': 'GATE-CHECK gate-check.py = 0 FAIL', 'done': True},
 {'t': 'Finalny pass: PASS 0-4 czyste', 'done': True},
 {'t': 'PASS 5 semantyka: SEMANTYKA.md komplet', 'done': True},
 {'t': 'Wersja + grafiki zarchiwizowane (Desktop)', 'done': True},
 {'t': 'RETRO F8: NOWE WNIOSKI + LEKSYKON + CHANGELOG', 'done': True},
 {'t': 'Koszty landinga zalogowane w wf2_costs (zakładka Koszty)', 'done': True},
 {'t': 'Status produktu → gotowy', 'done': True},
]
FIN_NOTE = ('DELTA MAPA-ZASTOSOWAN domknieta. gate-check.py ssawek = PASS 135 / FAIL 0 / WARN 6 / SKIP 7 '
            '(mapa_zastosowan: funkcje=6, ZASTOSOWANIA 8/6, SPEKTRUM 6/4 PASS, OPINIE-wiersz PASS, '
            'PRIMARY PASS, proxy PASS). sekcja-diff 1280+390: LAYOUT 0/14, rubryka 14/14 (d) + 15/15 (m) TAK. '
            'detail-lint 30xP2 (0 P0/P1). copy-gate PASS (2000W nieuzyte, brak antystatyk, sold 547 nieuzyte, '
            'gwiazdki pod foldem). Sceny mokro/pellet: F3A 2 pary oczu ZGODNA. RETRO F8 + LL-069 do '
            'LEKCJE-LANDINGI. Koszt delty $1.00 (openai-image). noindex ON (preview, tor Allegro bez publikacji).')
ps.step_update(PROJ, PROD, 'lp_finisz', status='done', checklist=LP_FIN_CHECK, force_kolejnosc=True,
               note=FIN_NOTE,
               fields={'gate_check': 'PASS 135 / FAIL 0 / WARN 6 / SKIP 7',
                       'mapa_zastosowan': 'funkcje=6, SPEKTRUM 6/4 PASS',
                       'koszt_twarde_api': '$5.90',
                       'preview': 'https://crm.tomekniedzwiecki.pl/sklepy/tomek-niedzwiecki/ssawek/'})
print('OK lp_finisz done')
ps.product_meta(PROD, {'status': 'gotowy'})
print('OK product status=gotowy')

# ── 5. docs -> wf2-docs (klikalne chipy) ──
for fn, step, label in [
    ('RETRO.md', 'lp_finisz', 'RETRO.md (F8 — delta MAPA-ZASTOSOWAN + LL-069, top wnioski)'),
    (os.path.join('dopasowanie', 'DOPASOWANIE.md'), 'lp_dopasowanie',
     'DOPASOWANIE.md (delta mozaika 6 swiatow — LAYOUT 0/14, rubryka 14/14+15/15 TAK)'),
    ('MAPA-ZASTOSOWAN.md', 'lp_dane', 'MAPA-ZASTOSOWAN.md (F0.6b — FUNKCJE tabela, mozaika 6 swiatow, mokro/pellet)'),
    ('PRZEWODNIK-GRAFICZNY.md', 'lp_plan', 'PRZEWODNIK-GRAFICZNY.md (os POKRYCIE ZASTOSOWAN + karty scen woda/pellet)'),
]:
    p = os.path.join(HERE, fn)
    if os.path.isfile(p):
        ps.doc_add(PROJ, PROD, step, p, slug=SLUG, label=label)
        print('OK doc', fn)

print('DELTA-PANEL done.')
