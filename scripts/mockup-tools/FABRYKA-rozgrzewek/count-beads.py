# -*- coding: utf-8 -*-
"""Powieksz makro glowicy face-on 2.4x do policzenia kulek + przytnij rozowy pasek z navy-whole."""
import os, sys
from PIL import Image
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
REFS = os.path.join(HERE, 'refs-cache')

# 1) upscale makra do liczenia
f = Image.open(os.path.join(REFS, 'head-face.png')).convert('RGB')
big = f.resize((int(f.width * 2.4), int(f.height * 2.4)), Image.LANCZOS)
big.save(os.path.join(REFS, 'head-face-BIG.png'))
print('head-face-BIG', big.size)

# 2) navy-whole: utnij lewy rozowy sliver (magenta wariant zaglada z lewej)
w = Image.open(os.path.join(REFS, 'navy-whole.png')).convert('RGB')
w2 = w.crop((22, 0, w.width, w.height))   # zetnij 22px z lewej
w2.save(os.path.join(REFS, 'navy-whole.png'))
print('navy-whole trimmed', w2.size)
