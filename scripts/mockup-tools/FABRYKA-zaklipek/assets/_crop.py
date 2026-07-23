# -*- coding: utf-8 -*-
"""F3 CROP-first — wycina czyste sceny/packshot/galerie z ZAAKCEPTOWANYCH makiet Zaklipka.
Makiety mają JUŻ czyste rendery (tekst OBOK sceny, nie na niej) => CROP = pixel-perfect, $0.
REGEN (mid-cta, final) robiony osobno (_regen.py) bo tam tekst leży NA scenie.
Uruchom: PYTHONIOENCODING=utf-8 python _crop.py"""
import os, io, sys
from PIL import Image, ImageFilter
sys.stdout.reconfigure(encoding="utf-8")

HERE = os.path.dirname(os.path.abspath(__file__))
MAK  = os.path.normpath(os.path.join(HERE, "..", "makiety"))
def M(n): return Image.open(os.path.join(MAK, n)).convert("RGB")
def save(im, name):
    p = os.path.join(HERE, name); im.save(p)
    print("  OK %-20s %s" % (name, im.size))

# ── 1. BASE PACKSHOT — CROP lewej strony 14-zamow.png (czysty srebrny hub na bieli) ──
z = M("14-zamow.png")                       # 1536x1024
pack = z.crop((40, 205, 775, 770))          # produkt + zacisk + śruba, nad linią ticków
save(pack, "packshot-base.png")

# wariant transparent: flood-fill near-white z 4 rogów (tło ~#F7F8FA jednolite)
def to_transparent(src, tol=16):
    im = src.convert("RGBA"); px = im.load(); W, Hh = im.size
    bg = px[2, 2]
    from collections import deque
    seen = bytearray(W * Hh); q = deque()
    for c in [(0,0),(W-1,0),(0,Hh-1),(W-1,Hh-1)]:
        q.append(c)
    def near(a, b): return abs(a[0]-b[0])<=tol and abs(a[1]-b[1])<=tol and abs(a[2]-b[2])<=tol
    while q:
        x, y = q.popleft()
        if x<0 or y<0 or x>=W or y>=Hh or seen[y*W+x]: continue
        seen[y*W+x] = 1
        r,g,b,a = px[x,y]
        if not near((r,g,b), bg): continue
        px[x,y] = (r,g,b,0)
        q.extend([(x+1,y),(x-1,y),(x,y+1),(x,y-1)])
    return im
try:
    tr = to_transparent(pack, tol=18)
    save(tr, "packshot-base-transparent.png")
except Exception as e:
    print("  (transparent skip:", str(e)[:80], ")")

# ── 2. SCENY — CROP regionów scen z makiet (tekst OBOK, scena czysta) ──
# hero desktop: scena = PRAWA część (dłoń wpina USB w hub, monitor, roślina, kubek z parą)
# left=735 aby uciąć ghost-narożnik karty oferty w dolnym-lewym rogu
save(M("01-hero.png").crop((735, 0, 1536, 1024)), "sc-hero-d.png")
# hero mobile: scena = GÓRA (przed kartą oferty)
save(M("01-hero-m.png").crop((0, 0, 1024, 782)), "sc-hero-m.png")

# problem desktop: BÓL BEZ PRODUKTU = LEWA część (dłoń za obudową PC w plątaninie kabli)
save(M("03-problem.png").crop((0, 0, 812, 1024)), "sc-problem.png")
# problem mobile: scena GÓRA
save(M("03-problem-m.png").crop((0, 0, 1024, 892)), "sc-problem-m.png")

# rozwiazanie desktop: ULGA = PRAWA część (produkt na krawędzi biurka, okno/roślina/firana)
# left=700 aby uciąć fragmenty nagłówka („edzi-"/„e", ciemny do x=688) wchodzące w scenę
save(M("04-rozwiazanie.png").crop((700, 0, 1536, 1024)), "sc-rozwiazanie.png")
# rozwiazanie mobile: scena GÓRA
save(M("04-rozwiazanie-m.png").crop((0, 0, 1024, 872)), "sc-rozwiazanie-m.png")

# demo desktop: 3 STANY TOR-I = 3 kafle (fotograficzna górna część każdej karty)
d = M("05-demo.png")
save(d.crop((60, 300, 498, 695)),   "sc-demo-01.png")   # zaciśnij na krawędzi (śruba + linijka)
save(d.crop((524, 300, 986, 695)),  "sc-demo-02.png")   # wepnij pendrive
save(d.crop((1012, 300, 1476, 695)),"sc-demo-03.png")   # porty pod ręką (kable wpięte)

# zacisk desktop: detal mechanizmu + linijka + dłoń (TOR-I flagowa) = LEWA karta
save(M("07-zacisk.png").crop((52, 58, 712, 908)), "sc-zacisk.png")
# zacisk mobile: scena GÓRA
save(M("07-zacisk-m.png").crop((0, 0, 1024, 858)), "sc-zacisk-m.png")

# ── 3. GALERIA — 4 kafle z 11-galeria.png (już czyste rendery) ──
g = M("11-galeria.png")
save(g.crop((54, 34, 748, 470)),    "gal-01.png")   # dłoń wpina USB (biurko)
save(g.crop((788, 34, 1482, 470)),  "gal-02.png")   # spód zacisku, caliper 5-28mm
save(g.crop((54, 504, 748, 940)),   "gal-03.png")   # 3/4 z portem DC 5V
save(g.crop((788, 504, 1482, 940)), "gal-04.png")   # montaż pod monitorem (lifestyle)

print("CROP DONE")
