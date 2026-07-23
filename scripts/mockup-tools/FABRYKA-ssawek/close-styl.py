# -*- coding: utf-8 -*-
"""Domyka lp_styl_marka (8/8) SSAWEK: styl-master DNA -> Storage + artefakt + krok done.
Branding (favicon/wordmark/lockup/brand-context) domkniety w F2.5; ta faza dodaje STYL-MASTER
(plansza DNA serii, F2 pkt 1) = brakujacy 8. element kroku. Checklista VERBATIM z projekt.html."""
import importlib.util, os, sys
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
PS = os.path.join(HERE, '..', 'panel-sync.py')
spec = importlib.util.spec_from_file_location('ps', PS)
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

PROJ = '1a097f94-1b64-48ec-91c6-cf32565f79a4'
PROD = '051dd9c1-546d-4ee0-891e-1576eaef85dc'
STYL_URL = ps.PUBLIC_BASE + '/attachments/bud-assets/ssawek/brand/00-styl-master.webp'

# artefakt styl_master (miniatura w panelu)
ps.artifact_add(PROJ, PROD, 'lp_styl_marka', 'styl_master', STYL_URL,
                label='Styl-master DNA — Popiolek (plansza specimen)',
                meta={'section': 'styl-master', 'viewport': 'desktop'})

# doc TOKENS-MAKIETY.md -> wf2-docs
ps.doc_add(PROJ, PROD, 'lp_styl_marka', os.path.join(HERE, 'TOKENS-MAKIETY.md'),
           slug='ssawek', label='TOKENS-MAKIETY.md (SSOT tokenow makiety — KANON+PARTYTURA)')

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
ps.step_update(PROJ, PROD, 'lp_styl_marka', status='done', checklist=CHECK, force_kolejnosc=True,
    note=('Odstepstwo kolejnosci: krok kalkulacja (Etap 1) N/D w torze Allegro->Marka (cena DANA '
          '119 zl, brak silnika marzy) — force_kolejnosc, jak w lp_dane (LEDGER F0). '
          'Styl-master DNA (plansza specimen, F2 pkt 1) wygenerowany i wgrany — domyka 8/8. '
          'Paleta z rolami + 2 fonty z KONTRASTEM (Barlow Semi Condensed display / Hanken Grotesk '
          'text) + jeden radius + ikony outline ink + trust-pill + ciepla glebia + sygnatura S6 '
          'znacznik-rozek + DUZE liczby (119 zl · 2000 W · 20 l · 4,7 kg) + kafel PRODUKT (kanister '
          'czerwona pokrywa, wierny) + kafel SWIAT (kominek/garaz). Krytyk: PASS (akcent JEDYNY = '
          'CTA+swash; produkt wierny; brudna goraca robota ujarzmiona). Gen edge MEDIUM (local HIGH '
          '520 przez Cloudflare — LEDGER F2.5). Branding F2.5 (favicon vortex/wordmark/lockup/'
          'brand-context) domkniety wczesniej.'),
    fields={'marka_nazwa': 'Popiolek', 'styl_master_url': STYL_URL,
            'brand_dir': 'bud-assets/ssawek/brand/',
            'font': 'Barlow Semi Condensed (display) / Hanken Grotesk (text)',
            'paleta': '#F3EDE4 piasek · #1C1815 ink · #C2381B akcent (czerwien pokrywy)',
            'tokens_url': 'wf2-docs/ssawek/TOKENS-MAKIETY.md'})
print('OK lp_styl_marka done 8/8')
