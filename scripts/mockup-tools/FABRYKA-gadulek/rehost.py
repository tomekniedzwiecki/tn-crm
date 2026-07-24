# -*- coding: utf-8 -*-
"""Rehost makiet do bud-assets/gadulek/makiety/ (webp, max_width 1440, q82).
Uzycie: python rehost.py desktop | mobile | both"""
import importlib.util, os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("ps", os.path.join(HERE, "..", "panel-sync.py"))
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)
OUT = os.path.join(HERE, "out")
SLUG = "gadulek"
SECTIONS = ["01-hero", "02-opinie", "03-jak-dziala", "04-zastosowania", "05-mid-cta",
            "06-anatomia", "07-porownanie", "08-zdjecia-od-kupujacych",
            "09-specyfikacja-zestaw", "10-faq", "11-zamow", "12-final"]

mode = sys.argv[1] if len(sys.argv) > 1 else "both"
urls = {}
for s in SECTIONS:
    if mode in ("desktop", "both"):
        p = os.path.join(OUT, f"{s}.png")
        if os.path.isfile(p):
            urls[s] = ps.storage_upload(p, f"bud-assets/{SLUG}/makiety/{s}.webp",
                                        to_webp=True, max_width=1440, quality=82)
    if mode in ("mobile", "both"):
        p = os.path.join(OUT, f"{s}-mobile.png")
        if os.path.isfile(p):
            urls[s + "-mobile"] = ps.storage_upload(p, f"bud-assets/{SLUG}/makiety/{s}-mobile.webp",
                                                    to_webp=True, max_width=1440, quality=82)
json.dump(urls, open(os.path.join(HERE, f"rehost-{mode}.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)
print("REHOST %s: %d plikow" % (mode, len(urls)))
