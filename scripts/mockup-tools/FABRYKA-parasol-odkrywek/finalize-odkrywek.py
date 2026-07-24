#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Finalizacja marki Odkrywek: werdykt vision wybral kandydata m2-0 (dom z iskra
odkrycia), nie skryptowy top-1 m0-0 (iskra). Odbudowa deliverables z m2-0 przez
funkcje brand-forge (bez nowej generacji), re-upload do bud-assets/parasol-odkrywek/brand/."""
import importlib.util, os, io, json, sys, re
for _s in (sys.stdout, sys.stderr):
    try: _s.reconfigure(encoding="utf-8")
    except Exception: pass
ROOT = r"C:\repos_tn\tn-crm"; os.chdir(ROOT)
spec = importlib.util.spec_from_file_location("brandforge", os.path.join(ROOT, "scripts", "mockup-tools", "brand-forge.py"))
bf = importlib.util.module_from_spec(spec); spec.loader.exec_module(bf)
KEY = re.search(r'SUPABASE_SERVICE_KEY=(\S+)', open(os.path.join(ROOT, ".env"), encoding="utf-8").read()).group(1)

slug = "parasol-odkrywek"; nazwa = "Odkrywek"
palette = ["#3A2A24", "#1E7D71", "#E2613A", "#F6C98B", "#FBF4E9", "#7A6A5E"]
font = os.path.join(ROOT, "scripts", "mockup-tools", "fonts", "Fraunces_144.ttf")
outdir = os.path.join(ROOT, "scripts", "mockup-tools", "FABRYKA-parasol-odkrywek", "brand")
os.makedirs(outdir, exist_ok=True)
best_path = os.path.join(outdir, "kandydaci", "fav-m2-0.png")
INK = "#3A2A24"  # kakaowy braz — mono silhouette + wordmark ink

favs, master = bf.export_favicons(best_path, outdir, ink=INK)
wm = bf.render_wordmark(nazwa, font, palette, outdir, color=INK)
wm_dark = bf.render_wordmark(nazwa, font, palette, outdir, color="#FFFFFF", fname="wordmark-dark.png")
combo_path, combo_img = bf.compose_combo(master, wm, outdir)
combo_dark_path, combo_dark_img = bf.compose_combo(master, wm_dark, outdir, fname="logo-combo-dark.png")
sheet_path = bf.contact_sheet(master, combo_img, combo_dark_img, palette, outdir)
brand_json = os.path.join(outdir, "brand.json")
io.open(brand_json, "w", encoding="utf-8").write(json.dumps({
    "nazwa": nazwa, "slug": slug, "paleta": palette, "font": os.path.basename(font),
    "metafora": "dom z iskra odkrycia (gwiazdka-iskra wpisana w sylwetke domu) — sprytne znaleziska do domu",
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
print("CONTEXT_URL:", uploaded.get("brand-context.png"))
