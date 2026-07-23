# -*- coding: utf-8 -*-
"""Buduje referencje produktowe SSAWEK pod makiety (F2):
- prod-whole.png = crop kanistra z g11 (pelna sylwetka: czerwona pokrywa + stal + czarna podstawa
  + klamry + waz) -> fidelity anchor dla /v1/images/edits.
- zestaw.png = g14 1:1 (packshot akcesoriow) dla sekcji 'zestaw'.
Upload obu -> attachments/bud-assets/ssawek/refs/ (webp) dla sciezki fallback edge.
Uzycie: python refs.py"""
import importlib.util, os, sys, shutil
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
IMG = r'C:\tmp\ALLEGRO-HADDO\img'
REFS = os.path.join(HERE, 'refs-cache')
os.makedirs(REFS, exist_ok=True)
PS = os.path.join(HERE, '..', 'panel-sync.py')
spec = importlib.util.spec_from_file_location('ps', PS)
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

# 1. crop kanistra z g11 (frakcje szer/wys -> niezalezne od wymiaru)
g11 = Image.open(os.path.join(IMG, 'g11.jpg')).convert('RGB')
W, H = g11.size
box = (int(0.45 * W), int(0.38 * H), int(0.80 * W), H)   # x0,y0,x1,y1
prod = g11.crop(box)
prod_path = os.path.join(REFS, 'prod-whole.png')
prod.save(prod_path)
print('prod-whole crop', prod.size, 'z g11', (W, H), 'box', box)

# 2. zestaw = g14 (packshot akcesoriow) 1:1
zest = Image.open(os.path.join(IMG, 'g14.jpg')).convert('RGB')
zest_path = os.path.join(REFS, 'zestaw.png')
zest.save(zest_path)
print('zestaw', zest.size)

# 3. upload webp -> bud-assets/ssawek/refs/
for local, dest in [(prod_path, 'bud-assets/ssawek/refs/prod-whole.webp'),
                    (zest_path, 'bud-assets/ssawek/refs/zestaw.webp')]:
    url = ps.storage_upload(local, dest, bucket='attachments', to_webp=True,
                            max_width=1200, quality=88)
    print('UPLOAD', url)
print('OK refs')
