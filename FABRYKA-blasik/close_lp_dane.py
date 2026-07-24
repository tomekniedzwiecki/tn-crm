# -*- coding: utf-8 -*-
import importlib.util
spec = importlib.util.spec_from_file_location(
    "panelsync", r"C:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py")
ps = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ps)

PROJECT = "bc92c138-5101-4919-a7f5-d4d75b17daba"
PRODUCT = "78dc560d-bf39-4eb0-bfd9-991ea7824cc2"

checklist = [
    {"t": "source=detail potwierdzony (albo STOP z notą)", "done": True},
    {"t": "Galeria skurowana → gallery_curated (≥4 kadry keep)", "done": True},
    {"t": "Wideo skurowane → videos_curated (gate po klatce środkowej)", "done": True},
    {"t": "KARTA-PRAWDY.md gotowa (cena+NBP, specs 1:1, destylacja FAKT/BEŁKOT)", "done": True},
    {"t": "PASZPORT.md gotowy (elementy + „CZEGO NIE MA\")", "done": True},
    {"t": "Liczby oznaczone [KONKRET/SPEC/BEŁKOT]", "done": True},
    {"t": "Slug + mini-marka zarezerwowane w bud_brand_names", "done": True},
]

fields = {
    "source_ok": True,
    "karta_url": "wf2-docs/blasik/KARTA-PRAWDY.md",
    "paszport_url": "wf2-docs/blasik/PASZPORT.md",
    "cena_pl": "14,90 zł (kalkulacja done)",
}

note = ("F0 done: source=datahub PASS (∈ zaufane); galeria 5 keep (2 packshot + 3 crop; czysty packshot ISTNIEJE); "
        "mini-marka Blasik (bud_brand_names 26874369); nadruki BIAT/Heinast BRAK na produkcie (retusz zbędny); "
        "230°/350 lm/Type-C = CUT (spec Beam=180°, brak lumenów w specs, kable USB-A); wideo BRAK (0 klipów → sekcja nie powstaje); "
        "zdjęcia kupujących: 4 keep (wszystkie 5★). Cena 14,90 / koszt 12,94 — ODCZYT, nie zmieniane; NBP 3,8000 (24.07).")

sid = ps.step_update(PROJECT, PRODUCT, "lp_dane", status="done",
                     note=note, fields=fields, checklist=checklist)
print("lp_dane done →", sid)
