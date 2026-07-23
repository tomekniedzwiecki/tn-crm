# -*- coding: utf-8 -*-
"""F3 ROZMROZIK crop-first ($0): G-FUNCTION-MACROS = 4 makro-cropy z realnego packshotu g0
(modul-kratka, panel LED, plyta perforowana, krawedz kopuly) + G-MID-PACKSHOT = g0 z biala
przezroczystoscia (alpha, defringe) na karte mid-cta. Po zapisie: contact-sheet do ogladu."""
import os, sys
from PIL import Image, ImageDraw

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
REFS = os.path.join(HERE, 'refs-cache')
ASSETS = os.path.join(HERE, 'assets'); os.makedirs(ASSETS, exist_ok=True)

g0 = Image.open(os.path.join(REFS, 'g0.webp')).convert('RGB')  # 874x874

# G-FUNCTION-MACROS: makro-cropy (bbox x0,y0,x1,y1) — kwadratowe sloty kart funkcji
CROPS = {
    'fn-modul': (330, 175, 660, 505),     # modul: kratka okragla + poczatek panelu
    'fn-panel': (400, 220, 700, 520),     # panel LED z ikonami dotykowymi
    'fn-plyta': (240, 360, 620, 740),     # plyta z perforacja koncentryczna przez kopule
    'fn-kopula': (30, 220, 360, 550),     # krawedz kopuly (sciete naroza) + baza
}
for name, box in CROPS.items():
    g0.crop(box).save(os.path.join(ASSETS, name + '.png'))
    print('crop', name, box)

# G-MID-PACKSHOT: biel -> alpha (prog + defringe krawedzi)
rgba = g0.convert('RGBA')
px = rgba.load()
w, h = rgba.size
for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        mn = min(r, g, b)
        if mn > 246:                      # czysta biel tla
            px[x, y] = (r, g, b, 0)
        elif mn > 232:                    # halo krawedziowe -> polprzezroczyste
            px[x, y] = (r, g, b, int((246 - mn) / 14.0 * 255))
# przytnij do bounding-boxa nieprzezroczystych pikseli + margines
bbox = rgba.getbbox()
if bbox:
    m = 12
    bbox = (max(0, bbox[0] - m), max(0, bbox[1] - m),
            min(w, bbox[2] + m), min(h, bbox[3] + m))
    rgba = rgba.crop(bbox)
rgba.save(os.path.join(ASSETS, 'packshot-alpha.png'))
print('OK packshot-alpha.png', rgba.size)

# contact-sheet do ogladu
files = ['fn-modul.png', 'fn-panel.png', 'fn-plyta.png', 'fn-kopula.png', 'packshot-alpha.png']
TH = 340
sheet = Image.new('RGB', (3 * TH, 2 * TH), (242, 247, 250))
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(os.path.join(ASSETS, f))
    if im.mode == 'RGBA':
        bg = Image.new('RGB', im.size, (234, 241, 246))
        bg.paste(im, (0, 0), im)
        im = bg
    im.thumbnail((TH - 12, TH - 26))
    x = (i % 3) * TH; y = (i // 3) * TH
    sheet.paste(im, (x + 6, y + 6))
    d.text((x + 8, y + TH - 18), f, fill=(35, 42, 49))
sheet.save(os.path.join(HERE, 'crops-sheet.png'))
print('OK crops-sheet.png (%d assetow)' % len(files))
