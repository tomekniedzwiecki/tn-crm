# -*- coding: utf-8 -*-
"""Finalizacja marki POBLASK — kandydat fav-m0-0 (LINIA/BELKA SWIATLA przecinajaca aperture:
dwa polksieżyce rozdzielone poziomą smugą światła wychodzącą poza okrąg = wiazka światła
rozswietlajaca ciemnosc; oddaje 'poblask' = blysk/poswiata + istote produktu = LINIA SWIATLA).
Vision-werdykt wybral ten koncept nad skryptowym top-1 (m1-1 spark+platki, metafora niejasna).
Re-render wordmark 'Poblask' z Montserrat Black (partytura display), lockupy, brand-context, upload
do bud-assets/poblask/brand/."""
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

slug = "poblask"; nazwa = "Poblask"
INK = "#1B1830"
# paleta w kolejnosci pod couplingi brand-forge: [0]=ink(wordmark), [1]=accent, [2]=ink(mono), [3]=light(brand-bg), [4]=mid
palette = ["#1B1830", "#6A3DE8", "#1B1830", "#DEDCEC", "#35314A"]
font = os.path.join(ROOT, "scripts", "mockup-tools", "fonts", "Montserrat-Black.ttf")
outdir = os.path.join(ROOT, "scripts", "mockup-tools", "FABRYKA-poblask", "brand")
best_path = os.path.join(outdir, "kandydaci", "fav-m0-0.png")
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
    "nazwa": nazwa, "slug": slug, "paleta": palette, "font": "Montserrat-Black.ttf",
    "font_display": "Montserrat (800/900)", "font_text": "Mulish (400/600/800)",
    "accent": "#6A3DE8", "ink": INK,
    "metafora": "linia/belka swiatla przecinajaca aperture (wiazka poswiaty rozswietlajaca ciemnosc) — 'poblask'=blysk + produkt=linia swiatla",
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
print("STYL_MASTER later separate upload")
