# -*- coding: utf-8 -*-
"""F3 ODSACZEK: cropy assetow z ZAAKCEPTOWANYCH makiet (pixel-perfect, $0) + realne
packshoty g2/g3 -> assets/. Po zapisie: kontrolka contact-sheet do ogladu."""
import os, sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
REFS = os.path.join(HERE, 'refs-cache')
ASSETS = os.path.join(HERE, 'assets'); os.makedirs(ASSETS, exist_ok=True)

# (plik makiety, bbox x0,y0,x1,y1) — makiety 1536x1024
CROPS = {
    'jr-A': ('02-jeden-ruch.png', (60, 165, 750, 762)),     # kosz zanurzony w garnku
    'jr-B': ('02-jeden-ruch.png', (788, 165, 1478, 762)),   # kosz uniesiony z porcja
    'sc-szuflada': ('04-zloz.png', (85, 688, 906, 1012)),   # dysk wsuwany do szuflady
    'dur-mak': ('05-durszlak.png', (40, 238, 758, 942)),    # makaron pod kranem
    'dur-owoce': ('05-durszlak.png', (786, 238, 1502, 942)),# owoce pod kranem
    'myc-glowna': ('06-mycie.png', (562, 205, 1148, 800)),  # pusty kosz pod kranem
    'myc-makro': ('06-mycie.png', (1158, 205, 1502, 800)),  # makro siatki
}
for name, (src, box) in CROPS.items():
    im = Image.open(os.path.join(OUT, src)).convert('RGB')
    im.crop(box).save(os.path.join(ASSETS, name + '.png'))
    print('crop', name, box)

# realne packshoty (klasa R)
for src, dst in (('g2.png', 'packshot-rozlozony'), ('g3.png', 'packshot-plaski')):
    im = Image.open(os.path.join(REFS, src)).convert('RGB')
    im.save(os.path.join(ASSETS, dst + '.png'))
    print('real', dst, im.size)

# contact-sheet do ogladu (3 kolumny)
files = sorted(f for f in os.listdir(ASSETS) if f.endswith('.png') and not f.startswith('sc-hero')
               and not f.startswith('sc-zawieszony') and not f.startswith('sc-final'))
TH = 340
cols = 3
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * TH, rows * TH), (244, 239, 229))
from PIL import ImageDraw
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(os.path.join(ASSETS, f))
    im.thumbnail((TH - 12, TH - 26))
    x = (i % cols) * TH; y = (i // cols) * TH
    sheet.paste(im, (x + 6, y + 6))
    d.text((x + 8, y + TH - 18), f, fill=(34, 30, 22))
sheet.save(os.path.join(HERE, 'crops-sheet.png'))
print('OK crops-sheet.png (%d assetow)' % len(files))
