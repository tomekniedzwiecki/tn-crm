# -*- coding: utf-8 -*-
"""F3 -> panel: krok lp_grafiki = done (fields + checklista VERBATIM z WS['lp_grafiki'])."""
import os, sys, importlib.util
sys.stdout.reconfigure(encoding="utf-8")
MT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
spec = importlib.util.spec_from_file_location("ps", os.path.join(MT, "panel-sync.py"))
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

PROJECT = "62e5422a-9475-4e9b-afa3-483c53b62169"
PRODUCT = "07e194e7-b39a-4ddc-a5fc-f27dc065625c"

# VERBATIM z tn-sklepy/projekt.html WS['lp_grafiki'].check
CHECK = [
 'Rozpoznanie warstw per makieta (grafika vs kod) wg GRAFIKA-Z-MAKIETY',
 'Sceny full-bleed = TA SAMA scena z makiety (gate side-by-side)',
 'Hero 3 warianty (picture mobile/tablet/desktop)',
 'Wierność produktu: paszport + gate vs realne zdjęcie',
 'min_distinct_product_views ≥5; brak klonów pozy',
 'Mapa assetów P/U/S/R + allowlista slotów',
 'Wagi w budżecie (WebP; 1. ekran ≤350 KB)',
]
FIELDS = {
 "assets_dir": "scripts/mockup-tools/FABRYKA-zaklipek/assets (rehost: bud-assets/zaklipek/assets/*.webp)",
 "distinct_views": 13,
 "mapa_url": "wf2-docs/zaklipek/MAPA-ASSETOW.md",
 "waga_first": "57.7 KB (sc-hero-d 37.3 + packshot-base 20.5; próg 350 KB — OK)",
}
NOTE = ("F3: 16 CROP z makiet (pixel-perfect, $0: hero d/m, problem d/m, rozwiazanie d/m, "
        "demo 3 stany, zacisk d/m, galeria 4) + packshot bazowy CROP z 14-zamow + 2 REGEN "
        "czystych scen (mid-cta, final — tekst był NA scenie; gpt-image-2 HIGH, prompt-lint PASS). "
        "F3A wierność: 15/15 grafik ZGODNA, 2 pary oczu (pass-1 + świeży Sonnet pass-2), zero flag, "
        "dłonie anatomia OK. ≥13 distinct views. OG 1200x630 dedykowany. Hero: 2 warianty dedykowane "
        "(desktop 3:2 + mobile 2:3); tablet = reframe object-fit z desktop crop (F4).")

sid = ps.step_update(PROJECT, PRODUCT, "lp_grafiki", status="done",
                     note=NOTE, fields=FIELDS,
                     checklist=[{"t": t, "done": True} for t in CHECK])
print("step lp_grafiki -> done, id", sid)
