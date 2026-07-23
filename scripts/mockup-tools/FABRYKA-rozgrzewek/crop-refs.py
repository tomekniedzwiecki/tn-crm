# -*- coding: utf-8 -*-
"""Cropy GRANATOWYCH egzemplarzy z g0.webp (kolaz 3 wariantow -> tylko Blue).
3 refy wiernosci: navy-whole (caly produkt) · head-face (makro 21 kulek + czerwony LED) ·
head-profile (profil zebrowanej glowki). Auto-trim bialego tla + zapis PNG do refs-cache/."""
import io, os, sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
REFS = os.path.join(HERE, 'refs-cache')
os.makedirs(REFS, exist_ok=True)
G0 = r'C:\repos_tn\tn-crm\FABRYKA-masazer\galeria\g0.webp'

img = Image.open(G0).convert('RGB')
W, H = img.size
print('g0 size:', W, H)

# Regiony (1000x1000): pole z lekkim zapasem, potem auto-trim bialego
BOXES = {
    'navy-whole':    (585, 80, 905, 935),   # upright granatowy produkt (prawa)
    'head-face':     (65, 545, 490, 975),    # makro glowicy face-on (dol-lewo): 21 kulek + red LED
    'head-profile':  (435, 545, 845, 975),   # profil zebrowanej kopuly (dol-srodek)
}


def autotrim(im, thresh=244, pad=10):
    """Bounding box pikseli ciemniejszych niz thresh (produkt na bialym), + padding."""
    g = im.convert('L')
    px = g.load()
    w, h = g.size
    x0, y0, x1, y1 = w, h, 0, 0
    for y in range(h):
        for x in range(w):
            if px[x, y] < thresh:
                if x < x0: x0 = x
                if y < y0: y0 = y
                if x > x1: x1 = x
                if y > y1: y1 = y
    if x1 <= x0:
        return im
    x0 = max(0, x0 - pad); y0 = max(0, y0 - pad)
    x1 = min(w, x1 + pad); y1 = min(h, y1 + pad)
    return im.crop((x0, y0, x1, y1))


for name, box in BOXES.items():
    crop = img.crop(box)
    crop = autotrim(crop)
    # Podklad bialy (produkt jak izolowany packshot na bieli)
    out = os.path.join(REFS, name + '.png')
    crop.save(out)
    print('OK %-14s box=%s -> crop=%s -> %s' % (name, box, crop.size, out))
print('KONIEC cropow')
