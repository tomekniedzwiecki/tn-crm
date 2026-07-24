#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Rebrand Sprytek→Sprytko: favicon (żarówka-S) reużyty z kandydata fav-m0-0,
wordmark re-render 'Sprytko', re-upload do bud-assets/parasol-sprytko/brand/."""
import importlib.util, os, io, json, sys, re
for _s in (sys.stdout, sys.stderr):
    try: _s.reconfigure(encoding="utf-8")
    except Exception: pass
ROOT = r"C:\repos_tn\tn-crm"; os.chdir(ROOT)
spec = importlib.util.spec_from_file_location("brandforge", os.path.join(ROOT, "scripts", "mockup-tools", "brand-forge.py"))
bf = importlib.util.module_from_spec(spec); spec.loader.exec_module(bf)
KEY = re.search(r'SUPABASE_SERVICE_KEY=(\S+)', open(os.path.join(ROOT, ".env"), encoding="utf-8").read()).group(1)

slug = "parasol-sprytko"; nazwa = "Sprytko"
palette = ["#4CAF6E", "#24303A", "#FCF9F3", "#1F3D34", "#EAE4D8"]
font = os.path.join(ROOT, "scripts", "mockup-tools", "fonts", "quicksand-v37-latin_latin-ext-700.ttf")
outdir = os.path.join(ROOT, "FABRYKA-parasol-sprytko", "brand")
os.makedirs(outdir, exist_ok=True)
best_path = os.path.join(ROOT, "FABRYKA-parasol-sprytek", "brand", "kandydaci", "fav-m0-0.png")
INK = "#24303A"

favs, master = bf.export_favicons(best_path, outdir, ink=INK)
wm = bf.render_wordmark(nazwa, font, palette, outdir, color=INK)
wm_dark = bf.render_wordmark(nazwa, font, palette, outdir, color="#FFFFFF", fname="wordmark-dark.png")
combo_path, combo_img = bf.compose_combo(master, wm, outdir)
combo_dark_path, combo_dark_img = bf.compose_combo(master, wm_dark, outdir, fname="logo-combo-dark.png")
sheet_path = bf.contact_sheet(master, combo_img, combo_dark_img, palette, outdir)
brand_json = os.path.join(outdir, "brand.json")
io.open(brand_json, "w", encoding="utf-8").write(json.dumps({
    "nazwa": nazwa, "slug": slug, "paleta": palette, "font": os.path.basename(font),
    "metafora": "iskra pomyslu / zarowka aha (S w zarniku)",
    "pliki": ["favicon-512.png","favicon-256.png","favicon-32.png","favicon-16.png","favicon-mono.png",
              "wordmark.png","wordmark-dark.png","logo-combo.png","logo-combo-dark.png","brand-context.png"],
}, ensure_ascii=False, indent=1))
uploaded = {}
for p in list(favs.values()) + [wm["path"], wm_dark["path"], combo_path, combo_dark_path, sheet_path, brand_json]:
    try: uploaded[os.path.basename(p)] = bf.upload_storage(slug, p, KEY)
    except Exception as e: print("   upload FAIL", os.path.basename(p), e)
io.open(os.path.join(outdir, "upload-urls.json"), "w", encoding="utf-8").write(json.dumps(uploaded, ensure_ascii=False, indent=1))
print("[g] upload -> bud-assets/%s/brand/ (%d plikow)" % (slug, len(uploaded)))
print("FAVICON_URL:", uploaded.get("favicon-256.png"))
print("LOGO_URL:", uploaded.get("logo-combo.png"))
print("LOGO_DARK_URL:", uploaded.get("logo-combo-dark.png"))
