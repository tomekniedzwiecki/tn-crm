# -*- coding: utf-8 -*-
"""F3 prep SSAWEK: (1) prod-clean.png = crop produktu z ZRETUSZOWANEGO g11 (logo-free) — ref
wiernosci (image1). (2) comp/<name>.png = crop REGIONU FOTO z makiety (bez kolumny tekstu) —
ref kompozycji scene-from-mockup (image2). Upload webp -> bud-assets/ssawek/refs/ (edge path).
Full-bleed A (hero/mid-cta/final) uzywaja calej makiety (juz w makiety/<sec>.webp)."""
import importlib.util, os, sys
from PIL import Image
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
COMP = os.path.join(HERE, 'refs-cache', 'comp')
os.makedirs(COMP, exist_ok=True)
RETG11 = r'C:\Users\tomek\AppData\Local\Temp\claude\c--repos-tn\e06da69a-a462-4444-84ed-3066c7a28d56\scratchpad\retusz\g11.jpg'
PS = os.path.join(HERE, '..', 'panel-sync.py')
spec = importlib.util.spec_from_file_location('ps', PS)
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)
SLUG = 'ssawek'

# (1) prod-clean z retuszowanego g11 (produkt logo-free); crop sylwetki calosci
g11 = Image.open(RETG11).convert('RGB')
prod = g11.crop((718, 285, 1200, 905))
prodp = os.path.join(HERE, 'refs-cache', 'prod-clean.png')
prod.save(prodp); print('prod-clean', prod.size)

# (2) crop REGIONOW FOTO z makiet (split/kafle) -> comp refs
CROPS = {
 'comp-problem':      ('03-problem.png',      (0, 0, 1010, 1024)),
 'comp-rozwiazanie':  ('04-rozwiazanie.png',  (620, 40, 1510, 985)),
 'comp-demo-01':      ('05-demo.png',         (40, 295, 505, 735)),
 'comp-demo-02':      ('05-demo.png',         (543, 295, 1008, 735)),
 'comp-demo-03':      ('05-demo.png',         (1038, 295, 1505, 735)),
 'comp-zast-kominek': ('06-zastosowania.png', (790, 45, 1505, 490)),
 'comp-zast-gruz':    ('06-zastosowania.png', (45, 435, 642, 865)),
 'comp-zast-warsztat':('06-zastosowania.png', (660, 510, 1050, 865)),
 'comp-zast-dzialka': ('06-zastosowania.png', (1074, 510, 1503, 865)),
}
for name, (src, box) in CROPS.items():
    im = Image.open(os.path.join(OUT, src)).convert('RGB')
    c = im.crop(box)
    p = os.path.join(COMP, name + '.png')
    c.save(p); print(name, c.size)

# (3) upload webp -> bud-assets/ssawek/refs/
urls = {}
urls['prod-clean'] = ps.storage_upload(prodp, 'bud-assets/%s/refs/prod-clean.webp' % SLUG,
                                       bucket='attachments', to_webp=True, max_width=1200, quality=90)
for name in CROPS:
    p = os.path.join(COMP, name + '.png')
    urls[name] = ps.storage_upload(p, 'bud-assets/%s/refs/%s.webp' % (SLUG, name),
                                   bucket='attachments', to_webp=True, max_width=1400, quality=88)
for k, v in urls.items():
    print('URL', k, v)
print('OK prep-f3')
