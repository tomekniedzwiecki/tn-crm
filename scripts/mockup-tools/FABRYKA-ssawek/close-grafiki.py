# -*- coding: utf-8 -*-
"""Domyka F3 (lp_grafiki) SSAWEK: upload 14 scen -> bud-assets/ssawek/assets/, artefakty kind='scena',
doc WIERNOSC + MAPA-ASSETOW -> wf2-docs, krok lp_grafiki DONE (checklista VERBATIM z WS), koszt
openai-image (realne $ za 14 scen wg kanalu; ZERO wpisu 'claude' — dyrektywa Tomka). force_kolejnosc
(kalkulacja Etap 1 N/D tor Allegro, LEDGER F0)."""
import importlib.util, io, json, os, sys
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
DOP = os.path.join(HERE, 'dopasowanie')
PS = os.path.join(HERE, '..', 'panel-sync.py')
spec = importlib.util.spec_from_file_location('ps', PS)
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

PROJ = '1a097f94-1b64-48ec-91c6-cf32565f79a4'
PROD = '051dd9c1-546d-4ee0-891e-1576eaef85dc'
SLUG = 'ssawek'
ADIR = 'bud-assets/%s/assets/' % SLUG

# (out_name, section, viewport/variant, klasa, osadzenie)
SCENES = [
 ('sc-hero-d', 'hero', 'desktop', 'S', 'A'),
 ('sc-hero-m', 'hero', 'mobile', 'S', 'A'),
 ('sc-hero-t', 'hero', 'tablet', 'S', 'A'),
 ('sc-problem', 'problem', 'desktop', 'S-kontekst', 'B'),
 ('sc-rozwiazanie', 'rozwiazanie', 'desktop', 'S', 'B'),
 ('sc-demo-01', 'demo', 'stan-01', 'S', 'C'),
 ('sc-demo-02', 'demo', 'stan-02', 'S', 'C'),
 ('sc-demo-03', 'demo', 'stan-03', 'S', 'C'),
 ('sc-zast-kominek', 'zastosowania', 'kafel-kominek', 'S', 'C'),
 ('sc-zast-gruz', 'zastosowania', 'kafel-gruz', 'S', 'C'),
 ('sc-zast-warsztat', 'zastosowania', 'kafel-warsztat', 'S', 'C'),
 ('sc-zast-dzialka', 'zastosowania', 'kafel-dzialka', 'S', 'C'),
 ('sc-mid-cta', 'mid-cta', 'desktop', 'S', 'A'),
 ('sc-final', 'final', 'desktop', 'S', 'A'),
]

# ── 1. upload + artefakty ──
sizes = {}
for out_name, section, vp, klasa, osadz in SCENES:
    src = os.path.join(OUT, out_name + '.png')
    blob, ct = ps._process_image(src, max_width=1600, to_webp=True, quality=82)
    sizes[out_name] = len(blob)
    url = ps.storage_upload(src, ADIR + out_name + '.webp', bucket='attachments',
                            to_webp=True, max_width=1600, quality=82)
    ps.artifact_add(PROJ, PROD, 'lp_grafiki', 'scena', url,
                    label='%s — %s (%s)' % (section, vp, klasa),
                    meta={'section': section, 'viewport': vp, 'klasa': klasa,
                          'osadzenie': osadz, 'wiernosc': 'ZGODNA'})
    print('OK scena', out_name, '%.0f KB' % (len(blob) / 1024))

waga_first = sizes['sc-hero-d']
print('WAGA 1. ekran (hero-d webp): %.0f KB (prog 350 KB): %s'
      % (waga_first / 1024, 'OK' if waga_first <= 350 * 1024 else 'PRZEKROCZONY'))

# ── 2. docs -> wf2-docs ──
ps.doc_add(PROJ, PROD, 'lp_grafiki', os.path.join(DOP, 'WIERNOSC.md'), slug=SLUG,
           label='WIERNOSC.md (F3A gate — 14/14 ZGODNA, 2 pary oczu: Opus + swiezy Sonnet)')
ps.doc_add(PROJ, PROD, 'lp_grafiki', os.path.join(DOP, 'MAPA-ASSETOW.md'), slug=SLUG,
           label='MAPA-ASSETOW.md (klasy P/U/S/R + allowlista slotow + swiat F1.7)')

# ── 3. koszt openai-image (realne $ za 14 scen wg FINALNEGO kanalu) ──
UNIT = {('local', 'high'): 0.25, ('edge', 'medium'): 0.06}
F3_SECTIONS = {s[0].replace('sc-', '') for s in SCENES} | {'hero-d', 'hero-m', 'hero-t'}
# ostatni wpis worklog per sekcja F3 = kanal deliverable
recs = [json.loads(l) for l in io.open(os.path.join(OUT, 'worklog.jsonl'), encoding='utf-8') if l.strip()]
final = {}
for r in recs:
    if r['section'] in F3_SECTIONS:
        final[r['section']] = (r['channel'], r['quality'])
amount = 0.0
parts = {}
for sec, k in final.items():
    u = UNIT.get(k, 0.19)
    amount += u
    parts[k] = parts.get(k, 0) + 1
amount = round(amount, 2)
pdesc = ' + '.join('%dx %s/%s @ $%.2f' % (n, k[0], k[1], UNIT.get(k, 0.19)) for k, n in sorted(parts.items()))
NOTE = ('F3 sceny produktowe Popiolek (SSAWEK): 14 scen scene-from-mockup (gpt-image-2) — %s. '
        'Kanal: local HIGH (api.openai.com) dziala w tej sesji (F2 Cloudflare 520 nie wystapil); '
        'czesc scen fallback edge MEDIUM po pojedynczych 520. Koszt = FINALNY deliverable (14 scen); '
        're-runy po padzie batcha = overhead operacyjny, nie bilowane 2x.' % pdesc)
cid = ps.cost_add(PROJ, PROD, amount, kind='openai-image', currency='USD', step='lp_grafiki',
                  note=NOTE, created_by='fabryka')
print('COST openai-image id=%s amount=$%.2f (%s)' % (cid, amount, pdesc))

# ── 4. krok lp_grafiki DONE (checklista VERBATIM z WS) ──
CHECK = [
 {'t': 'Rozpoznanie warstw per makieta (grafika vs kod) wg GRAFIKA-Z-MAKIETY', 'done': True},
 {'t': 'Sceny full-bleed = TA SAMA scena z makiety (gate side-by-side)', 'done': True},
 {'t': 'Hero 3 warianty (picture mobile/tablet/desktop)', 'done': True},
 {'t': 'Wierność produktu: paszport + gate vs realne zdjęcie', 'done': True},
 {'t': 'min_distinct_product_views ≥5; brak klonów pozy', 'done': True},
 {'t': 'Mapa assetów P/U/S/R + allowlista slotów', 'done': True},
 {'t': 'Wagi w budżecie (WebP; 1. ekran ≤350 KB)', 'done': waga_first <= 350 * 1024},
]
NOTE_STEP = (
 'F3 zamkniete — 14 scen scene-from-mockup (makieta=ref kompozycji, prod-clean logo-free=ref '
 'wiernosci). GATE F3A: 14/14 WIERNOSC ZGODNA, DWIE pary oczu (pass-1 Opus cecha-po-cesze + pass-2 '
 'SWIEZY Sonnet bez promptu/werdyktu-1) = 14/14 TAK, brak rozjazdu. Osadzenie: 5x typ A (fade '
 'gladki do #F3EDE4) + 9x B/C pelny kadr; 0 martwy-panel. Uzycie zgodne z modelem KARTY; 0 zle-uzycie. '
 'Anatomia 5 scen z dlonia = OK. problem = BOL BEZ produktu (EMOCJA<->PRODUKT). White-label: 0 scen z '
 'nadrukiem marki (prod-clean z retuszowanego g11). prompt-lint 14/14 czysto scenowo (13 z prefiksem '
 'referencji, problem bez). RETUSZ GALERII (g07/g11 LEHMANN TOOLS, g09 tabliczka) wykonany + g05 '
 'advisory rozstrzygniete (nieczytelne). Bazuje na makietach = retro-akcept Tomka PENDING (lp_makiety). '
 'force_kolejnosc: kalkulacja Etap 1 N/D tor Allegro (LEDGER F0).')
ps.step_update(PROJ, PROD, 'lp_grafiki', status='done', checklist=CHECK, force_kolejnosc=True,
               note=NOTE_STEP,
               fields={'assets_dir': ADIR, 'distinct_views': '13 (>= prog 5)',
                       'wiernosc': '14/14 ZGODNA (2 pary oczu)',
                       'waga_first': '%.0f KB (hero-d webp)' % (waga_first / 1024),
                       'retusz_white_label': 'g07/g11/g09 wykonany; g05 advisory=nieczytelne',
                       'mapa': 'dopasowanie/MAPA-ASSETOW.md'})
print('OK lp_grafiki done')
