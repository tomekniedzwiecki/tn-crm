# -*- coding: utf-8 -*-
# Cropy-refy kompozycji z zaakceptowanych makiet (do REGEN referencyjnego scen F3).
import os, sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
REFS = os.path.join(HERE, 'refs-cache')
os.makedirs(REFS, exist_ok=True)


def crop(src, box_rel, name):
    im = Image.open(os.path.join(OUT, src))
    W, H = im.size
    x0, y0, x1, y1 = [int(v * s) for v, s in zip(box_rel, (W, H, W, H))]
    im.crop((x0, y0, x1, y1)).save(os.path.join(REFS, name))
    print(name, (x1 - x0, y1 - y0))


# hero v2 (1536x1024): dyptyk — L ~[0.01..0.50], P ~[0.50..0.99], pod topbarem (~0.08)
crop('ugniatek-m-hero-v2.png', (0.005, 0.08, 0.50, 1.0), 'mk-hero-L.png')
crop('ugniatek-m-hero-v2.png', (0.50, 0.08, 0.995, 1.0), 'mk-hero-P.png')
# sterowanie: foto po lewej ~[0.03..0.60] x [0.22..0.93]
crop('ugniatek-m-sterowanie.png', (0.03, 0.22, 0.60, 0.93), 'mk-st-foto.png')
# wieczorem: duza scena L ~[0.03..0.60] x [0.22..0.98]; trening P-gora ~[0.60..0.97] x [0.17..0.60]
crop('ugniatek-m-wieczorem.png', (0.03, 0.22, 0.60, 0.98), 'mk-wi-biurko.png')
crop('ugniatek-m-wieczorem.png', (0.60, 0.17, 0.97, 0.60), 'mk-wi-trening.png')
# zestaw (plansza 06): flat lay lewy-dol ~[0.03..0.58] x [0.54..0.95]
crop('ugniatek-m-midcta-zestaw.png', (0.03, 0.54, 0.58, 0.95), 'mk-ze-flatlay.png')
print('refy kompozycji gotowe ->', REFS)
