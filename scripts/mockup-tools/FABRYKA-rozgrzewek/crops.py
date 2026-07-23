# -*- coding: utf-8 -*-
"""F3 ROZGRZEWEK crop-first ($0) + refy kompozycji z makiet.
(A) REFY KOMPOZYCJI z out/*.png (1536x1024, ZAAKCEPTOWANE makiety) -> refs-cache/ref-*.png
    (LAST image dla scenes-gen: kadr/swiatlo/poza + WIERNY granatowy produkt z makiety).
(B) CROP-FIRST assety (do assets/, upload do Storage):
    - glowica-head.png  : makro glowicy face-on z g0 (klasa R, 21 kulek + czerwony LED) — ZAKAZ generacji
    - tryby-panel.png   : okragly wyswietlacz LED "9" + 3 diody + 2 przyciski z g0 (klasa R)
    - packshot-alpha.png: izolowany GRANATOWY produkt (biel/brzoskwinia->alpha) z makiety 01-hero
                          (klasa P, derywat zaakceptowanej makiety g0-wiernej) -> hero-base/mid-cta/checkout
Po zapisie: crops-sheet.png do ogladu (1. para oczu)."""
import os, sys
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFilter

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
REFS = os.path.join(HERE, 'refs-cache'); os.makedirs(REFS, exist_ok=True)
ASSETS = os.path.join(HERE, 'assets'); os.makedirs(ASSETS, exist_ok=True)
G0 = r'C:\repos_tn\tn-crm\FABRYKA-masazer\galeria\g0.webp'


# ---------- (A) REFY KOMPOZYCJI z makiet ----------
# box = (x0,y0,x1,y1) w makiecie 1536x1024
REF_CROPS = {
    'ref-hero.png':      ('01-hero.png',      (150, 108, 662, 1012)),   # packshot na polu koloru
    'ref-moment.png':    ('02-moment.png',    (22, 22, 902, 1006)),     # scena LEWA (sofa/lampa/kubek)
    'ref-neck.png':      ('05-obszary.png',   (30, 285, 762, 592)),     # kafel Kark
    'ref-shoulder.png':  ('05-obszary.png',   (778, 285, 1506, 592)),   # kafel Ramiona
    'ref-back.png':      ('05-obszary.png',   (30, 600, 762, 908)),     # kafel Plecy
    'ref-thigh.png':     ('05-obszary.png',   (778, 600, 1506, 908)),   # kafel Uda
    'ref-autonomia.png': ('06-autonomia.png', (852, 38, 1536, 1014)),   # produkt na stoliku przy lampie
    'ref-final.png':     ('11-final.png',     (626, 6, 1536, 1014)),    # scena stolik+kubek+lampa
}
for name, (src, box) in REF_CROPS.items():
    Image.open(os.path.join(OUT, src)).convert('RGB').crop(box).save(os.path.join(REFS, name))
    print('ref', name, box)


def autotrim(im, thresh=244, pad=12):
    g = np.asarray(im.convert('L'))
    ys, xs = np.where(g < thresh)
    if len(xs) == 0:
        return im
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    w, h = im.size
    return im.crop((max(0, x0 - pad), max(0, y0 - pad),
                    min(w, x1 + pad), min(h, y1 + pad)))


# ---------- (B) CROP-FIRST z g0 ----------
g0 = Image.open(G0).convert('RGB')

# glowica-head: bottom-left tilted head face-on (21 kulek + czerwony LED). Klasa R. Upscale 2.2x.
head = autotrim(g0.crop((52, 552, 506, 964)), pad=6)
head = head.resize((int(head.width * 2.2), int(head.height * 2.2)), Image.LANCZOS)
head.save(os.path.join(ASSETS, 'glowica-head.png'))
print('glowica-head', head.size)

# tryby-panel: okragly wyswietlacz "9" + 3 diody + 2 przyciski z navy-whole (natywny detal g0). Upscale 2x.
nw = Image.open(os.path.join(REFS, 'navy-whole.png')).convert('RGB')  # 298x855
panel = nw.crop((18, 92, 288, 470))
panel = panel.resize((int(panel.width * 2), int(panel.height * 2)), Image.LANCZOS)
panel.save(os.path.join(ASSETS, 'tryby-panel.png'))
print('tryby-panel', panel.size)

# ---------- (B) packshot-alpha: izolowany granat z makiety 01-hero ----------
# Klucz: tlo = peach-podobne I jasne (dist do peach < 55 AND luminancja > 165) -> alpha.
# Granat (ciemny) i chromowe kulki (neutralne, daleko od peach) zostaja; dziury (wyswietlacz,
# kolnierz, refleksy) domykane hole-fill; najwieksza spojna skladowa = produkt (odrzuca glify H1).
prod = Image.open(os.path.join(OUT, '01-hero.png')).convert('RGB').crop((168, 120, 600, 1006))
arr = np.array(prod).astype(np.int32)
peach = np.array([243, 233, 227])               # bg pola koloru #F3E9E3
dist = np.sqrt(((arr - peach) ** 2).sum(axis=2))
lum = (0.299 * arr[:, :, 0] + 0.587 * arr[:, :, 1] + 0.114 * arr[:, :, 2])
bg_mask = ((dist < 55) & (lum > 165)).astype(np.uint8) * 255   # 255 = tlo
prod_mask = cv2.bitwise_not(bg_mask)             # 255 = produkt (wstepnie)
# hole-fill: domknij dziury wewnatrz produktu (wyswietlacz/kolnierz/refleksy)
h, w = prod_mask.shape
ff = prod_mask.copy(); m2 = np.zeros((h + 2, w + 2), np.uint8)
cv2.floodFill(ff, m2, (0, 0), 255)               # zalej tlo-zewnetrzne
holes = cv2.bitwise_not(ff)
solid = cv2.bitwise_or(prod_mask, holes)
# najwieksza spojna skladowa (odrzuca odpryski/glif "k")
n, lbl, stats, _ = cv2.connectedComponentsWithStats(solid, connectivity=8)
if n > 1:
    big = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    solid = np.where(lbl == big, 255, 0).astype(np.uint8)
alpha = cv2.erode(solid, np.ones((2, 2), np.uint8), iterations=1)
alpha = cv2.GaussianBlur(alpha, (3, 3), 0)
rgba = np.dstack([np.array(prod), alpha])
pa = Image.fromarray(rgba, 'RGBA')
bbox = pa.getbbox()
if bbox:
    m = 14
    pa = pa.crop((max(0, bbox[0] - m), max(0, bbox[1] - m),
                  min(pa.width, bbox[2] + m), min(pa.height, bbox[3] + m)))
pa.save(os.path.join(ASSETS, 'packshot-alpha.png'))
print('packshot-alpha', pa.size)

# ---------- contact-sheet ----------
sheet_files = [os.path.join(REFS, n) for n in REF_CROPS] + \
    [os.path.join(ASSETS, f) for f in ('glowica-head.png', 'tryby-panel.png', 'packshot-alpha.png')]
TH, cols = 360, 4
rows_n = (len(sheet_files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * TH, rows_n * TH), (250, 243, 239))
dr = ImageDraw.Draw(sheet)
for i, fp in enumerate(sheet_files):
    im = Image.open(fp)
    if im.mode == 'RGBA':
        bgc = Image.new('RGB', im.size, (235, 226, 220)); bgc.paste(im, (0, 0), im); im = bgc
    im = im.convert('RGB'); im.thumbnail((TH - 12, TH - 26))
    x, y = (i % cols) * TH, (i // cols) * TH
    sheet.paste(im, (x + 6, y + 6)); dr.text((x + 8, y + TH - 18), os.path.basename(fp), fill=(43, 38, 34))
sheet.save(os.path.join(HERE, 'crops-sheet.png'))
print('OK crops-sheet.png (%d)' % len(sheet_files))
