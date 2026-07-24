# -*- coding: utf-8 -*-
"""F0 panel-sync dla gadulek (import panel_sync przez importlib)."""
import importlib.util, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
PS = os.path.join(HERE, "..", "panel-sync.py")
spec = importlib.util.spec_from_file_location("ps", PS)
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

PROJ = "f7e2ef31-5faa-4a4c-ab96-64f66140c761"
PROD = "c80ddb0c-1349-4a27-9e55-3da297473772"
SLUG = "gadulek"
BASE = "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments"

# 1) kolumny produktu (NIE ruszamy ceny/kosztu — Etap 1)
ps.product_meta(PROD, {"slug": SLUG, "status": "w_budowie"})

# 2) doki fabryki -> prywatny wf2-docs + chipy
DOCS = [
    ("KARTA-PRAWDY.md", "KARTA PRAWDY"),
    ("PASZPORT.md", "PASZPORT wizualny"),
    (os.path.join("galeria-kuracja", "GALERIA.md"), "GALERIA (kuracja)"),
    ("WIDEO.md", "WIDEO (kuracja)"),
    ("MAPA-ZASTOSOWAN.md", "MAPA ZASTOSOWAN"),
    ("ICP-GRUPA-DOCELOWA.md", "ICP / grupa docelowa"),
    ("LEDGER.md", "LEDGER"),
]
for rel, label in DOCS:
    ps.doc_add(PROJ, PROD, "lp_dane", os.path.join(HERE, rel), SLUG, label=label)

# 3) artefakty galerii (kadry keep)
GAL = [
    (f"{BASE}/bud-products/1005010623173867/g0.webp", "g0 packshot (CROP watermark Magecam)", {"kadr": "g0", "werdykt": "CROP", "kolejnosc": 1}),
    (f"{BASE}/bud-reviews/1005010623173867/6-0.webp", "UGC ekran dziala (podglad kamery)", {"kadr": "ugc-6-0", "werdykt": "POKAZ", "kolejnosc": 2}),
    (f"{BASE}/bud-reviews/1005010623173867/7-1.webp", "UGC ekran z awatarem", {"kadr": "ugc-7-1", "werdykt": "POKAZ", "kolejnosc": 3}),
    (f"{BASE}/bud-reviews/1005010623173867/0-0.webp", "UGC zestaw 2-pak + smycz + Type-C", {"kadr": "ugc-0-0", "werdykt": "POKAZ", "kolejnosc": 4}),
    (f"{BASE}/bud-reviews/1005010623173867/9-3.webp", "UGC pudelko (co dostajesz)", {"kadr": "ugc-9-3", "werdykt": "POKAZ", "kolejnosc": 5}),
]
for url, label, meta in GAL:
    ps.artifact_add(PROJ, PROD, "lp_dane", "gallery", url, label=label, meta=meta)

# 4) zamkniecie kroku lp_dane (checklista VERBATIM z WS)
CHECK = [
    "source=detail potwierdzony (albo STOP z notą)",
    "Galeria skurowana → gallery_curated (≥4 kadry keep)",
    "Wideo skurowane → videos_curated (gate po klatce środkowej)",
    "KARTA-PRAWDY.md gotowa (cena+NBP, specs 1:1, destylacja FAKT/BEŁKOT)",
    "PASZPORT.md gotowy (elementy + „CZEGO NIE MA\")",
    "Liczby oznaczone [KONKRET/SPEC/BEŁKOT]",
    "Slug + mini-marka zarezerwowane w bud_brand_names",
]
FIELDS = {
    "source_ok": "tak — detail (aukcja 1005010623173867)",
    "cena_pl": "89,90 zł (2-pak)",
    "koszt_landed": "79,57 zł ($20.94 × NBP 3,8000, tab.142/A/NBP/2026)",
    "marza": "8,53 zł (~9,5%) — cienka, decyzja Etapu 1",
    "ocena": "★4,7/5 · 687 ocen · 93,4% poz.",
    "zdjecia_keep": "5 (g0 CROP + UGC 6-0/7-1/0-0/9-3)",
    "wideo_keep": "0 — blokada-tomek (brak wideo produktu; okładka TT off-product)",
    "karta_url": "wf2-docs/gadulek/KARTA-PRAWDY.md",
    "paszport_url": "wf2-docs/gadulek/PASZPORT.md",
    "rozjazd_cover": "cover_url→1005011544279474 (INNE ID); galeria z 1005010623173867 (poprawna). Naprawa=orkiestrator.",
}
ps.step_update(PROJ, PROD, "lp_dane", status="done",
               fields=FIELDS,
               checklist=[{"t": t, "done": True} for t in CHECK])
print("F0 SYNC OK")
