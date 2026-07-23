# -*- coding: utf-8 -*-
"""F3 rehost — assety -> Storage bud-assets/zaklipek/assets/*.webp + wf2_artifacts (lp_grafiki).
Import panel-sync jako moduł. Zwraca też budżet 1. ekranu. Uruchom: PYTHONIOENCODING=utf-8 python _rehost.py"""
import os, sys, io, importlib.util, json
sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
MT   = os.path.normpath(os.path.join(HERE, "..", ".."))
spec = importlib.util.spec_from_file_location("ps", os.path.join(MT, "panel-sync.py"))
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)
from PIL import Image

PROJECT = "62e5422a-9475-4e9b-afa3-483c53b62169"
PRODUCT = "07e194e7-b39a-4ddc-a5fc-f27dc065625c"
STEP    = "lp_grafiki"
SLUG    = "zaklipek"
DESTDIR = f"bud-assets/{SLUG}/assets"

# (plik, kind, section, viewport, rola, maxw, webp)
A = [
 ("packshot-base.png",              "image", "packshot",     "desktop", "packshot P (karta oferty/sticky/faq)", 800,  True),
 ("packshot-base-transparent.png",  "image", "packshot",     "desktop", "packshot P wariant alfa",              800,  True),
 ("sc-hero-d.png",                  "scena", "hero",         "desktop", "tło prawej kolumny (B)",               1200, True),
 ("sc-hero-m.png",                  "scena", "hero",         "mobile",  "tło górnej strefy",                    1024, True),
 ("sc-problem.png",                 "scena", "problem",      "desktop", "BÓL bez produktu (B)",                 1200, True),
 ("sc-problem-m.png",               "scena", "problem",      "mobile",  "BÓL bez produktu",                     1024, True),
 ("sc-rozwiazanie.png",             "scena", "rozwiazanie",  "desktop", "ULGA (B)",                             1200, True),
 ("sc-rozwiazanie-m.png",           "scena", "rozwiazanie",  "mobile",  "ULGA",                                 1024, True),
 ("sc-demo-01.png",                 "scena", "demo",         "desktop", "TOR-I stan 1 (C)",                     920,  True),
 ("sc-demo-02.png",                 "scena", "demo",         "desktop", "TOR-I stan 2 (C)",                     920,  True),
 ("sc-demo-03.png",                 "scena", "demo",         "desktop", "TOR-I stan 3 (C)",                     920,  True),
 ("sc-zacisk.png",                  "scena", "zacisk",       "desktop", "TOR-I flagowa detal (B)",              1100, True),
 ("sc-zacisk-m.png",                "scena", "zacisk",       "mobile",  "TOR-I flagowa detal",                  1024, True),
 ("sc-midcta.png",                  "scena", "mid-cta",      "desktop", "REGEN full-bleed (A)",                 1200, True),
 ("sc-final.png",                   "scena", "final",        "desktop", "REGEN full-bleed (A)",                 1200, True),
 ("gal-01.png",                     "image", "galeria",      "desktop", "kafel 1 dłoń+USB (C)",                 900,  True),
 ("gal-02.png",                     "image", "galeria",      "desktop", "kafel 2 spód zacisku (C)",             900,  True),
 ("gal-03.png",                     "image", "galeria",      "desktop", "kafel 3 DC 5V (C)",                    900,  True),
 ("gal-04.png",                     "image", "galeria",      "desktop", "kafel 4 pod monitorem (C)",            900,  True),
 ("og.png",                         "image", "og",           "desktop", "OG 1200x630 (social)",                1200, False),  # PNG social-safe
]

def kb(u):  # rozmiar w KB po ostatnim uploadzie (z loga storage_upload nie mamy -> mierz plik webp lokalnie po fakcie)
    return None

urls = {}; sizes = {}
for fn, kind, sec, vp, rola, maxw, webp in A:
    local = os.path.join(HERE, fn)
    ext = "webp" if webp else "png"
    stem = os.path.splitext(fn)[0]
    dest = f"{DESTDIR}/{stem}.{ext}"
    # zmierz rozmiar blobu jaki poleci (proces PIL identyczny jak w storage_upload)
    blob, ct = ps._process_image(local, max_width=maxw, to_webp=webp, quality=82)
    sizes[stem] = len(blob)
    url = ps.storage_upload(local, dest, bucket="attachments", max_width=maxw, to_webp=webp, quality=82)
    urls[stem] = url
    meta = {"section": sec, "viewport": vp, "rola": rola, "faza": "F3", "bytes": len(blob)}
    ps.artifact_add(PROJECT, PRODUCT, STEP, kind, url, label=f"{sec} · {stem}", meta=meta, storage="external")

# budżet 1. ekranu = hero-d + packshot
first = sizes.get("sc-hero-d", 0) + sizes.get("packshot-base", 0)
print("\n=== ROZMIARY (webp/png, B) ===")
for k in sorted(sizes): print("  %-26s %7d B  (%5.1f KB)" % (k, sizes[k], sizes[k]/1024))
print("\n1. EKRAN (sc-hero-d + packshot-base) = %d B = %.1f KB  [próg 350 KB: %s]" % (
    first, first/1024, "OK" if first <= 350*1024 else "PRZEKROCZONE"))
io.open(os.path.join(HERE, "_urls.json"), "w", encoding="utf-8").write(json.dumps(urls, ensure_ascii=False, indent=1))
print("URLs -> _urls.json")
