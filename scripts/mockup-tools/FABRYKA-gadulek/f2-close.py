# -*- coding: utf-8 -*-
"""F2 domkniecie — artefakty makieta/makieta_mobile + krok lp_makiety IN_PROGRESS (bramka Tomka)
+ koszty z worklog. NIE ustawia 'done'. Uzycie: python f2-close.py"""
import importlib.util, os, json, io
HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("ps", os.path.join(HERE, "..", "panel-sync.py"))
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)
PROJ = "f7e2ef31-5faa-4a4c-ab96-64f66140c761"
PROD = "c80ddb0c-1349-4a27-9e55-3da297473772"
SLUG = "gadulek"
PUB = "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/"
SECTIONS = ["01-hero", "02-opinie", "03-jak-dziala", "04-zastosowania", "05-mid-cta",
            "06-anatomia", "07-porownanie", "08-zdjecia-od-kupujacych",
            "09-specyfikacja-zestaw", "10-faq", "11-zamow", "12-final"]

# doc TOKENS juz w lp_styl; tu doc PLAN/PRZEWODNIK juz w lp_plan. Dodaj artefakty makiet.
n_d = n_m = 0
for s in SECTIONS:
    d_url = PUB + f"bud-assets/{SLUG}/makiety/{s}.webp"
    m_url = PUB + f"bud-assets/{SLUG}/makiety/{s}-mobile.webp"
    ps.artifact_add(PROJ, PROD, "lp_makiety", "makieta", d_url, label=f"{s} (desktop)",
                    meta={"section": s, "viewport": "desktop"})
    n_d += 1
    ps.artifact_add(PROJ, PROD, "lp_makiety", "makieta_mobile", m_url, label=f"{s} (mobile)",
                    meta={"section": s, "viewport": "mobile"})
    n_m += 1

# koszty z worklog (tylko sekcje makiet, nie styl-master)
wl = os.path.join(HERE, "out", "worklog.jsonl")
local_hi = edge_md = 0
if os.path.isfile(wl):
    for line in io.open(wl, encoding="utf-8"):
        try:
            r = json.loads(line)
        except Exception:
            continue
        sec = r.get("section", "")
        if sec == "00-styl-master":
            continue
        if r.get("channel") == "local":
            local_hi += 1
        elif r.get("channel") == "edge":
            edge_md += 1
# gpt-image-2: HIGH 1024x1536/1536x1024 ~ $0.25; edge MEDIUM ~ $0.06
cost = round(local_hi * 0.25 + edge_md * 0.06, 2)
if cost > 0:
    ps.cost_add(PROJ, PROD, cost, kind="openai-image", currency="USD", step="lp_makiety",
                note=f"makiety F2: {local_hi} local-HIGH + {edge_md} edge-MEDIUM ({n_d}d+{n_m}m)",
                created_by="fabryka")

MAK_CHECK = [
    ("Styl-master → hero-makieta (gate WOW, max 3 iteracje)", True),
    ("Makiety WSZYSTKICH sekcji planu", True),
    ("Prawdziwe dane wprost w promptach — zero fake-specs", True),
    ("DETAL-LAYER ≥3/4 warstw per sekcja (bez numeracji „0N/NN”)", True),
    ("Pary mobile 2:3 dla hero + TOR-I + wideo", True),
    ("Sekcje TOR-I: makiety pokazują STANY demonstracji", True),
    ("Krytyk makiet: PASS („czuć produkt, drogi projekt”)", True),
    ("AKCEPT MAKIET — kontrakt wyglądu zamknięty", False),  # bramka Tomka — NIE done
]
FIELDS = {
    "makiety_dir": "bud-assets/gadulek/makiety/",
    "sekcje_count": f"12 build × desktop+mobile = {n_d + n_m} makiet",
    "tor_i": "jak-dziala (stany 1-2-3 + fala), anatomia (hotspoty)",
    "akcept": "CZEKA NA AKCEPT TOMKA — makiety gotowe, krytyk Opus PASS; krok in_progress",
}
ps.step_update(PROJ, PROD, "lp_makiety", status="in_progress",
               note="makiety gotowe — czekają na akcept Tomka",
               fields=FIELDS, checklist=[{"t": t, "done": d} for t, d in MAK_CHECK])
print(f"F2 CLOSE OK — {n_d} desktop + {n_m} mobile artefaktow; koszt makiet ${cost}; lp_makiety=in_progress")
