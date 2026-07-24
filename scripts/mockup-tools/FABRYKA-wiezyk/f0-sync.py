# -*- coding: utf-8 -*-
"""Sync F0 (lp_dane) do panelu dla WIEZYK. Import panel-sync jako modul (UTF-8, bez pulapki argv)."""
import os, io, sys, importlib.util
sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
MT = os.path.dirname(HERE)  # scripts/mockup-tools
spec = importlib.util.spec_from_file_location("panel_sync", os.path.join(MT, "panel-sync.py"))
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

PROJ = "f7e2ef31-5faa-4a4c-ab96-64f66140c761"
PID  = "a139b0e9-b3ad-4256-9ee9-f00775b8ea37"
SLUG = "wiezyk"
BASE = "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-products/1005012500407228/"

# 1. KOLUMNY produktu (whitelista): slug + status
ps.product_meta(PID, {"slug": SLUG, "status": "w_budowie"})

# 2. KROK lp_dane — done + fields + checklist VERBATIM (z WS w tn-sklepy/projekt.html)
fields = {
    "source_ok": "TAK (datahub = ZAUFANE, gate F0 PASS)",
    "cena_pl": "379,00 zl",
    "koszt_landed": "323,19 zl",
    "marza": "~48 zl/szt (narzut ~17%, prow. 2%)",
    "ocena": "5,0/5 (1 ocena — MALE LICZBY, zakaz social-proof)",
    "zdjecia_keep": "4 keep (g0 bez-hero, g2 bez-human, g7 jasnoszary, g6 ciemnoszary) z 8",
    "wideo_keep": "0 (video_url null; tiktok cudzy=prawa) -> blokada-tomek",
    "karta_url": "wf2-docs/wiezyk/KARTA-PRAWDY.md",
    "paszport_url": "wf2-docs/wiezyk/PASZPORT.md",
}
import json
_cl = json.load(io.open(os.path.join(HERE, "checklists.json"), encoding="utf-8"))
checklist = [{"t": t, "done": True} for t in _cl["lp_dane"]]
note = ("F0 OK. source=datahub (ZAUFANE). Mini-marka Wiezyk / slug wiezyk zarezerwowana. "
        "Galeria BOGATA: 4 czyste lifestyle (3 kolory) + 4 DANE. 1 opinia = zakaz social-proof. "
        "Wideo i zdjecia kupujacych = blokada-tomek (protokol wyczerpania). "
        "SANITY do Tomka: marza cienka ~48 zl/szt; koszt DB 323,19 (brief mowil 301,41).")
ps.step_update(PROJ, PID, "lp_dane", status="done", fields=fields, checklist=checklist, note=note)

# 3. ARTEFAKTY galerii (4 keep) — miniatury w panelu
keeps = [
    ("g0.webp", "Wieżyk beż — hero (5 kotów, biblioteka)", 1, "bez"),
    ("g2.webp", "Wieżyk beż — właścicielka bawi kota", 2, "bez"),
    ("g7.webp", "Wieżyk jasnoszary — pełna struktura", 3, "jasnoszary"),
    ("g6.webp", "Wieżyk ciemnoszary — salon chesterfield", 4, "ciemnoszary"),
]
for fn, label, k, war in keeps:
    ps.artifact_add(PROJ, PID, "lp_dane", "gallery", BASE + fn, label=label,
                    meta={"kolejnosc": k, "wariant": war, "keep": True}, storage="external")

# 4. DOKI FABRYKI -> prywatny wf2-docs + klikalny chip
docs = [
    ("KARTA-PRAWDY.md", "KARTA PRAWDY"),
    ("PASZPORT.md", "PASZPORT"),
    ("GALERIA.md", "GALERIA (kuracja)"),
    ("WIDEO.md", "WIDEO (nota)"),
    ("MAPA-ZASTOSOWAN.md", "MAPA ZASTOSOWAŃ"),
    ("ICP-GRUPA-DOCELOWA.md", "ICP / grupa docelowa"),
    ("LEDGER.md", "LEDGER"),
]
for fn, label in docs:
    ps.doc_add(PROJ, PID, "lp_dane", os.path.join(HERE, fn), SLUG, label=label)

print("F0 SYNC OK")
