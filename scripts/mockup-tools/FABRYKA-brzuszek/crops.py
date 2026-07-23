# -*- coding: utf-8 -*-
"""F3 BRZUSZEK crop-first ($0):
  (A) G-*-PACKSHOT = packshot-alpha z wyretuszowanego g0-retusz (biel->alpha) -> mid-cta / zamow /
      TOR-I cutout warstwowy (jak-cwiczysz).
  (B) DETALE MAKRO z g0-retusz (crop-first tam, gdzie makro produktu wystarczy): konsola LCD,
      U-walek, podstawa (poprzeczka + koncowki), linki oporowe. Klasa R (bez generacji).
  (C) RETUSZ UGC 2-0 (stan zlozony) = usuniecie nadruku 'MERACH' + naklejek (flat-fill probka
      bialego plastiku) -> GLOWNY wizual stanu zlozonego (G-SKLAD-ZLOZ, klasa U/R).
Po zapisie: contact-sheet do ogladu (1. para oczu)."""
import os, sys
from PIL import Image, ImageDraw, ImageFilter

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
GALERIA = r'C:\repos_tn\tn-crm\FABRYKA-merach\galeria'
REFS = os.path.join(HERE, 'refs-cache'); os.makedirs(REFS, exist_ok=True)
ASSETS = os.path.join(HERE, 'assets'); os.makedirs(ASSETS, exist_ok=True)

# ---- (A) + (B): g0-retusz (1600x1600, biel + rozowe walki, MERACH juz wyretuszowany) ----
g0 = Image.open(os.path.join(GALERIA, 'g0-retusz.png')).convert('RGB')

# makro-cropy (bbox x0,y0,x1,y1) — detale konstrukcji (crop-first, klasa R)
DET = {
    'det-konsola': (760, 120, 1480, 500),    # konsola LCD + okragly przycisk + 2 walki + kierownica
    'det-uwalek':  (110, 730, 790, 1270),    # U-walek rozowy na przednim wozku
    'det-podstawa': (0, 1270, 830, 1600),    # przednia poprzeczka T + szare antyposlizgowe koncowki
    'det-linki':   (810, 560, 1270, 1170),   # linki oporowe z czarnymi piankowymi uchwytami
}
for name, box in DET.items():
    g0.crop(box).save(os.path.join(ASSETS, name + '.png'))
    print('crop', name, box)

# packshot-alpha: biel -> alpha (prog + defringe krawedziowe), crop do bbox + margines
rgba = g0.convert('RGBA')
px = rgba.load(); w, h = rgba.size
for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        mn = min(r, g, b)
        if mn > 246:                       # czysta biel tla
            px[x, y] = (r, g, b, 0)
        elif mn > 232:                     # halo krawedziowe -> polprzezroczyste
            px[x, y] = (r, g, b, int((246 - mn) / 14.0 * 255))
bbox = rgba.getbbox()
if bbox:
    m = 16
    bbox = (max(0, bbox[0]-m), max(0, bbox[1]-m), min(w, bbox[2]+m), min(h, bbox[3]+m))
    rgba = rgba.crop(bbox)
rgba.save(os.path.join(ASSETS, 'packshot-alpha.png'))
print('OK packshot-alpha.png', rgba.size)

# ---- (C): RETUSZ UGC 2-0 (540x960) — usun MERACH + naklejki (cv2.inpaint, ciasna maska) ----
import cv2, numpy as np
img = cv2.cvtColor(np.array(Image.open(os.path.join(REFS, 'ugc-2-0.webp')).convert('RGB')),
                   cv2.COLOR_RGB2BGR)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
mask = np.zeros(gray.shape, np.uint8)

# strefy z tekstem/naklejka (x0,y0,x1,y1) + tryb: 'dark' = prog ciemnego tekstu na bialej belce,
# 'all' = cala naklejka (bialy label na bialej rurze — prog nie zlapie, maskujemy w calosci)
ZONES = [
    ((278, 226, 328, 290), 'dark'),   # logo + napis MERACH na skosnej belce
    ((272, 296, 306, 364), 'dark'),   # czerwona naklejka + pionowy druk spec na belce
    ((334, 326, 394, 356), 'all'),    # kod kreskowy / etykieta na rurze podstawy
]
for (x0, y0, x1, y1), mode in ZONES:
    sub = gray[y0:y1, x0:x1]
    if mode == 'dark':
        m = (sub < 175).astype(np.uint8) * 255           # ciemny tekst/logo na jasnym plastiku
    else:
        m = np.full(sub.shape, 255, np.uint8)            # cala etykieta
    mask[y0:y1, x0:x1] = m
mask = cv2.dilate(mask, np.ones((3, 3), np.uint8), iterations=2)
out = cv2.inpaint(img, mask, 5, cv2.INPAINT_TELEA)
ugc = Image.fromarray(cv2.cvtColor(out, cv2.COLOR_BGR2RGB))
ugc.save(os.path.join(ASSETS, 'ugc-2-0-retusz.png'))
print('OK ugc-2-0-retusz.png (inpaint TELEA)', ugc.size)

# ---- contact-sheet ----
files = ['det-konsola.png', 'det-uwalek.png', 'det-podstawa.png', 'det-linki.png',
         'packshot-alpha.png', 'ugc-2-0-retusz.png']
TH = 360
cols = 3
rows_n = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols*TH, rows_n*TH), (247, 245, 251))
dr = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(os.path.join(ASSETS, f))
    if im.mode == 'RGBA':
        bg = Image.new('RGB', im.size, (240, 236, 247)); bg.paste(im, (0, 0), im); im = bg
    im = im.convert('RGB'); im.thumbnail((TH-12, TH-26))
    x = (i % cols)*TH; y = (i // cols)*TH
    sheet.paste(im, (x+6, y+6)); dr.text((x+8, y+TH-18), f, fill=(35, 30, 46))
sheet.save(os.path.join(HERE, 'crops-sheet.png'))
print('OK crops-sheet.png (%d assetow)' % len(files))
