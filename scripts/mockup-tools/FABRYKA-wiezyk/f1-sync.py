# -*- coding: utf-8 -*-
"""Sync F1 (lp_plan) do panelu dla WIEZYK."""
import os, io, sys, json, importlib.util
sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__)); MT = os.path.dirname(HERE)
spec = importlib.util.spec_from_file_location("panel_sync", os.path.join(MT, "panel-sync.py"))
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)
PROJ = "f7e2ef31-5faa-4a4c-ab96-64f66140c761"; PID = "a139b0e9-b3ad-4256-9ee9-f00775b8ea37"; SLUG = "wiezyk"
_cl = json.load(io.open(os.path.join(HERE, "checklists.json"), encoding="utf-8"))

fields = {
    "motyw": "Pionowe krolestwo kota — od azylu na dole po punkt obserwacyjny na szczycie (metafora korzysci)",
    "sekcje": ("1 hero · 2 zaufanie · 3 anatomia-wiezy[TOR-I] · 4 pazury-meble · 5 azyl-drzemka · "
               "6 ruch-widok · 7 stabilnosc · 8 trzy-kolory[TOR-I] · 9 mid-cta · 10 zamow · "
               "11 specyfikacja · 12 opinia · 13 faq · 14 final · (blokada-tomek: wideo, zdjecia-kupujacych)"),
    "paleta": "tlo krem #FBF6EC · ink #2C2925 · akcent bursztyn #B0710E; fonty Newsreader + Source Sans 3; archetyp-hero D",
    "tor_i_demo": "anatomia-wiezy, trzy-kolory",
    "plan_url": "wf2-docs/wiezyk/PLAN.md",
    "przewodnik_url": "wf2-docs/wiezyk/PRZEWODNIK-GRAFICZNY.md",
}
checklist = [{"t": t, "done": True} for t in _cl["lp_plan"]]
note = ("F1 OK. Motyw = pionowe krolestwo kota. 14 sekcji build + 2 blokada-tomek (wideo, zdjecia). "
        "Partytura: archetyp D, akcent bursztyn #B0710E, Newsreader+Source Sans 3 (rozn. cross-landing 4/5). "
        "Krytyk przewodnika (Opus) = PASS; 3 poprawki nice-to-have wdrozone. 28 makiet do F2 (14 d + 14 m).")
ps.step_update(PROJ, PID, "lp_plan", status="done", fields=fields, checklist=checklist, note=note)

for fn, label in [("PLAN.md", "PLAN"), ("PRZEWODNIK-GRAFICZNY.md", "PRZEWODNIK GRAFICZNY"), ("LEDGER.md", "LEDGER")]:
    ps.doc_add(PROJ, PID, "lp_plan", os.path.join(HERE, fn), SLUG, label=label)

# KOSZT twardy API: plan gpt-5.6-sol (Responses) — input ~11995 + output ~12000 tok (usage log); szac.
ps.cost_add(PROJ, PID, 0.13, kind="gpt", currency="USD", step="lp_plan")
print("F1 SYNC OK")
