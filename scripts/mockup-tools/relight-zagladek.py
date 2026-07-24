#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Relight Zaglądek (m0-0 „oko w ciemnej szczelinie") — remedium na rubryke pkt.2
(czytelnosc @16 na CIEMNYM). Znak jest dwutonowy: ciemne panele #211B14 + bursztynowe oko.
Na ciemnym UI panele zlewaja sie z tlem i znak redukuje sie do oka. Analog relightu Zapinka:
  (1) favicon-mono -> CIEMNY stempel #211B14 (byl jasny greige, bo brand-forge bral palette[2]);
  (2) master_dark: panele #211B14 -> ciepla jasnosc #EAE2D2 (czytelne na ciemnym), oko bursztyn zostaje;
  (3) logo-combo-dark: master_dark + biala nazwa (pelny znak zyje na ciemnym);
  (4) brand-context: rzad JASNY = master oryginalny (ciemne panele), rzad CIEMNY = master_dark;
  (5) re-upload zmienionych plikow na TE SAME sciezki bud-assets/zagladek/brand/.
Reszta plikow (favicon 512/256/32/16, logo-combo jasny, wordmarki) bez zmian kolorow."""
import sys, importlib.util, os, re
import numpy as np
from PIL import Image, ImageDraw
sys.stdout.reconfigure(encoding="utf-8")

ROOT = r"C:/repos_tn/tn-crm"
spec = importlib.util.spec_from_file_location("bf", ROOT + "/scripts/mockup-tools/brand-forge.py")
bf = importlib.util.module_from_spec(spec); sys.modules["bf"] = bf; spec.loader.exec_module(bf)
KEY = re.search(r'SUPABASE_SERVICE_KEY=(\S+)', open(ROOT + "/.env", encoding="utf-8").read()).group(1)

slug = "zagladek"; nazwa = "Zaglądek"
palette = ["#EFA019", "#211B14", "#F3EEE4", "#F7F9F8"]
font = ROOT + "/FABRYKA-zagladek/fonts-Archivo-Bold.ttf"
outdir = ROOT + "/FABRYKA-zagladek/brand-mini"
best = outdir + "/kandydaci/fav-m0-0.png"
INK = "#211B14"

# (1) re-eksport faviconow z CIEMNYM mono (ink=#211B14). Kolory 512/256/32/16 bez zmian.
favs, master = bf.export_favicons(best, outdir, ink=INK)

# (2) master_dark: ciemne panele -> ciepla jasnosc, bursztynowe oko zostaje
def dark_safe(m):
    arr = np.asarray(m.convert("RGBA")).copy()
    rgb = arr[:, :, :3].astype(np.int32); a = arr[:, :, 3]
    mx = rgb.max(axis=2)
    panel = (mx < 90) & (a > 40)      # tylko piksele ciemnego inku (panele/pupila)
    warm = (234, 226, 210)            # #EAE2D2 — ciepla off-white czytelna na ciemnym
    for i, v in enumerate(warm):
        ch = arr[:, :, i]; ch[panel] = v; arr[:, :, i] = ch
    return Image.fromarray(arr, "RGBA")
master_dark = dark_safe(master)

# (3) wordmarki + comba (combo jasny bez zmian; combo-dark z master_dark)
wm = bf.render_wordmark(nazwa, font, palette, outdir, color=palette[0])                 # amber
wm_dark = bf.render_wordmark(nazwa, font, palette, outdir, color="#FFFFFF", fname="wordmark-dark.png")
combo_path, combo_img = bf.compose_combo(master, wm, outdir)
combo_dark_path, combo_dark_img = bf.compose_combo(master_dark, wm_dark, outdir, fname="logo-combo-dark.png")

# (4) brand-context: JASNY rzad = master (ciemne panele) / CIEMNY rzad = master_dark (jasne panele)
def contact_sheet_relit(m_light, m_dark, combo, combo_dark, palette, outdir):
    W = 1080
    bg_light, bg_dark = (250, 250, 250), (17, 17, 17)
    brand_bg = bf._hex_rgb(palette[3]) if len(palette) > 3 else (253, 248, 242)
    sheet = Image.new("RGB", (W, 720), (255, 255, 255))
    d = ImageDraw.Draw(sheet)
    for (bg, x0, mm) in ((bg_light, 0, m_light), (bg_dark, W // 2, m_dark)):
        d.rectangle([x0, 0, x0 + W // 2 - 1, 240], fill=bg)
        x = x0 + 60
        for s in (64, 32, 16):
            fav = mm.resize((s, s), Image.LANCZOS)
            sheet.paste(fav, (x, 120 - s // 2), fav)
            x += s + 70
    for (im, bg, y0) in ((combo, brand_bg, 240), (combo_dark, bg_dark, 480)):
        d.rectangle([0, y0, W, y0 + 240], fill=bg)
        cw = min(W - 160, 760); ratio = cw / im.size[0]; ch = int(im.size[1] * ratio)
        if ch > 160: ratio *= 160.0 / ch; cw = int(im.size[0] * ratio); ch = int(im.size[1] * ratio)
        imr = im.resize((cw, ch), Image.LANCZOS)
        sheet.paste(imr, ((W - cw) // 2, y0 + 120 - ch // 2), imr)
    p = os.path.join(outdir, "brand-context.png"); sheet.save(p); return p
sheet_path = contact_sheet_relit(master, master_dark, combo_img, combo_dark_img, palette, outdir)

# (5) re-upload zmienionych plikow na TE SAME sciezki
changed = [favs["favicon-mono.png"], combo_dark_path, sheet_path]
uploaded = {}
for p in changed:
    uploaded[os.path.basename(p)] = bf.upload_storage(slug, p, KEY)
    print("re-upload OK:", os.path.basename(p), "->", uploaded[os.path.basename(p)])
print("RELIGHT DONE — mono ciemny, combo-dark + brand-context dark-safe, re-upload %d plikow" % len(uploaded))
