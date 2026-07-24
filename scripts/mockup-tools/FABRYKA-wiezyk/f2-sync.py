# -*- coding: utf-8 -*-
"""Sync F2 (lp_makiety) do panelu dla WIEZYK: rehost 28 makiet -> bud-assets/wiezyk/makiety/ +
artefakty kind makieta/makieta_mobile z meta{section,viewport}. Krok zostaje IN_PROGRESS
(BRAMKA TOMKA — NIE done). Uruchom PO wygenerowaniu i po krytyku PASS."""
import os, io, sys, json, importlib.util
sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__)); MT = os.path.dirname(HERE)
spec = importlib.util.spec_from_file_location("panel_sync", os.path.join(MT, "panel-sync.py"))
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)
PROJ = "f7e2ef31-5faa-4a4c-ab96-64f66140c761"; PID = "a139b0e9-b3ad-4256-9ee9-f00775b8ea37"; SLUG = "wiezyk"
MAK = os.path.join(HERE, "makiety")
_cl = json.load(io.open(os.path.join(HERE, "checklists.json"), encoding="utf-8"))

# mapa name(index) -> plik na dysku (mobile zapisywany jako <name>.png)
idx = json.load(io.open(os.path.join(MAK, "_index.json"), encoding="utf-8"))
def section_of(name):  # "03-anatomia-m" -> "03-anatomia"
    return name[:-2] if name.endswith("-m") else name
def viewport_of(name):
    return "mobile" if name.endswith("-m") else "desktop"

count = 0
for it in idx:
    name = it["name"]; f = os.path.join(MAK, name + ".png")
    if not os.path.isfile(f):
        print("BRAK PLIKU:", f); continue
    sec = section_of(name); vp = viewport_of(name)
    dest = "bud-assets/wiezyk/makiety/%s.webp" % name
    ps.storage_upload(f, dest, max_width=1440, to_webp=True, quality=82)
    url = ps.public_url(dest)
    kind = "makieta" if vp == "desktop" else "makieta_mobile"
    ps.artifact_add(PROJ, PID, "lp_makiety", kind, url, label="%s (%s)" % (sec, vp),
                    meta={"section": sec, "viewport": vp}, storage="supabase")
    count += 1
print("zarejestrowano %d makiet" % count)

# krok lp_makiety = IN_PROGRESS (BRAMKA TOMKA) — komplet artefaktow, ale NIE done
done_map = {  # 0-6 done po krytyku PASS; 7 (AKCEPT) = czeka na Tomka
    0: True, 1: True, 2: True, 3: True, 4: True, 5: True, 6: True, 7: False,
}
checklist = [{"t": t, "done": done_map.get(i, False)} for i, t in enumerate(_cl["lp_makiety"])]
fields = {
    "makiety_dir": "bud-assets/wiezyk/makiety/",
    "sekcje_count": "14 sekcji build (28 makiet: 14 desktop + 14 mobile)",
    "tor_i": "anatomia-wiezy, trzy-kolory",
    "akcept": "CZEKA NA AKCEPT TOMKA (krok in_progress)",
}
note = ("Makiety gotowe — czekają na akcept Tomka. KOMPLET: 14 sekcji build × (desktop+mobile) = 28 "
        "makiet, tor lokalny gpt-image HIGH, prawdziwe dane w promptach, styl-DNA spójny, archetyp D. "
        "Krytyk makiet (Opus art-director+CRO) = PASS. TOR-I (anatomia/kolory) pokazują stany. "
        "BRAMKA TOMKA: NIE ustawiam done, nie wchodzę w F3.")
ps.step_update(PROJ, PID, "lp_makiety", status="in_progress", fields=fields, checklist=checklist, note=note)

# doc LEDGER (x-upsert nadpisuje) + koszt twardy API (28 makiet gpt-image HIGH)
ps.doc_add(PROJ, PID, "lp_makiety", os.path.join(HERE, "LEDGER.md"), SLUG, label="LEDGER")
ps.cost_add(PROJ, PID, 4.76, kind="gpt-image", currency="USD", step="lp_makiety")
print("F2 SYNC OK (lp_makiety = in_progress, bramka Tomka)")
