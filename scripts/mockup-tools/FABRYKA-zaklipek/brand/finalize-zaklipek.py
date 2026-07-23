# -*- coding: utf-8 -*-
"""Finalizacja marki ZAKLIPEK — kandydat fav-m0-1 (C-clamp/zacisk chwytajacy krawedz + srubka,
czyta sie tez jako litera C) przeszedl koncepcyjnie, selektor odrzucil go tylko na 'za maly fill';
export_favicons crop-to-bbox to naprawia (wzor: finalize-brand-sprytko.py). Re-render wordmark
'Zaklipek' z Bricolage Grotesque ExtraBold (partytura display), lockupy, brand-context, upload
do bud-assets/zaklipek/brand/."""
import importlib.util, os, io, json, sys, re
for _s in (sys.stdout, sys.stderr):
    try: _s.reconfigure(encoding="utf-8")
    except Exception: pass
ROOT = r"C:\repos_tn\tn-crm"
spec = importlib.util.spec_from_file_location(
    "brandforge", os.path.join(ROOT, "scripts", "mockup-tools", "brand-forge.py"))
bf = importlib.util.module_from_spec(spec); spec.loader.exec_module(bf)
KEY = re.search(r'SUPABASE_SERVICE_KEY=(\S+)',
                io.open(os.path.join(ROOT, ".env"), encoding="utf-8-sig").read()).group(1)

slug = "zaklipek"; nazwa = "Zaklipek"
INK = "#1C2530"
# paleta w kolejnosci pod couplingi brand-forge: [0]=ink(wordmark), [2]=ink(mono), [3]=light(brand-bg)
palette = ["#1C2530", "#0A6EBD", "#1C2530", "#E1E5EC", "#5B6B7A"]
font = os.path.join(ROOT, "scripts", "mockup-tools", "fonts", "BricolageGrotesque-ExtraBold.ttf")
outdir = os.path.join(ROOT, "scripts", "mockup-tools", "FABRYKA-zaklipek", "brand")
best_path = os.path.join(outdir, "kandydaci", "fav-m0-1.png")
os.makedirs(outdir, exist_ok=True)

favs, master = bf.export_favicons(best_path, outdir, ink=INK)
print("[d] favicon:", ", ".join(favs.keys()))
wm = bf.render_wordmark(nazwa, font, palette, outdir, color=INK)
wm_dark = bf.render_wordmark(nazwa, font, palette, outdir, color="#FFFFFF", fname="wordmark-dark.png")
combo_path, combo_img = bf.compose_combo(master, wm, outdir)
combo_dark_path, combo_dark_img = bf.compose_combo(master, wm_dark, outdir, fname="logo-combo-dark.png")
sheet_path = bf.contact_sheet(master, combo_img, combo_dark_img, palette, outdir)
print("[e/f] wordmark + logo-combo + brand-context gotowe")

brand_json = os.path.join(outdir, "brand.json")
io.open(brand_json, "w", encoding="utf-8").write(json.dumps({
    "nazwa": nazwa, "slug": slug, "paleta": palette, "font": "BricolageGrotesque-ExtraBold.ttf",
    "font_display": "Bricolage Grotesque (800)", "font_text": "Figtree (400/500/700)",
    "accent": "#0A6EBD", "ink": INK,
    "metafora": "klips/zacisk C obejmujacy krawedz blatu + srubka regulacyjna (czyta sie tez jako litera C)",
    "pliki": ["favicon-512.png","favicon-256.png","favicon-32.png","favicon-16.png","favicon-mono.png",
              "wordmark.png","wordmark-dark.png","logo-combo.png","logo-combo-dark.png","brand-context.png"],
}, ensure_ascii=False, indent=1))

uploaded = {}
for p in list(favs.values()) + [wm["path"], wm_dark["path"], combo_path, combo_dark_path, sheet_path, brand_json]:
    try: uploaded[os.path.basename(p)] = bf.upload_storage(slug, p, KEY)
    except Exception as e: print("   upload FAIL", os.path.basename(p), e)
io.open(os.path.join(outdir, "upload-urls.json"), "w", encoding="utf-8").write(
    json.dumps(uploaded, ensure_ascii=False, indent=1))
print("[g] upload -> bud-assets/%s/brand/ (%d plikow)" % (slug, len(uploaded)))
print("FAVICON_256:", uploaded.get("favicon-256.png"))
print("LOGO_COMBO:", uploaded.get("logo-combo.png"))
print("BRAND_CONTEXT:", uploaded.get("brand-context.png"))
