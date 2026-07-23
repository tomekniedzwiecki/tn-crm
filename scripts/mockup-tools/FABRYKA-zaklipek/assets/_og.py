# -*- coding: utf-8 -*-
"""F3 OG image (1200x630) — dedykowany: wordmark Zaklipek + packshot bazowy + sygnatura krawędzi.
Styl-master: chłodna biel/platyna #F7F8FA, akcent #0A6EBD, Bricolage/Figtree. CROP packshot (wierny).
Uruchom: PYTHONIOENCODING=utf-8 python _og.py"""
import os, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
MT   = os.path.normpath(os.path.join(HERE, "..", ".."))   # scripts/mockup-tools
BRIC = os.path.join(MT, "fonts", "BricolageGrotesque-ExtraBold.ttf")
FIG  = os.path.join(MT, "FABRYKA-koszyk", "fonts", "Figtree.ttf")
BRAND= os.path.normpath(os.path.join(HERE, "..", "brand"))

W, H = 1200, 630
PAPER=(246,247,249)   # = kolor tła packshotu -> bezszwowe wtapianie
INK=(28,37,48); BODY=(56,66,78); CTA=(10,110,189); LINE=(197,203,213)

# tło: płaska chłodna biel (KANON) — identyczne z tłem packshotu (zero szwu)
bg = Image.new("RGB", (W, H), PAPER)

# ── packshot (CROP wierny) — feather-paste po prawej ──
pack = Image.open(os.path.join(HERE, "packshot-base.png")).convert("RGB")
pw = 600; ph = int(pack.height * pw / pack.width)
pack = pack.resize((pw, ph), Image.LANCZOS)
px, py = W - pw - 24, (H - ph)//2 + 6
# maska feather (miękkie krawędzie -> wtapia się w papier)
mask = Image.new("L", (pw, ph), 0)
md = ImageDraw.Draw(mask)
md.rectangle([0, 0, pw, ph], fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(34))
bg.paste(pack, (px, py), mask)

d = ImageDraw.Draw(bg)
# ── logo-combo (ikona + wordmark) lewy-górny ──
combo = Image.open(os.path.join(BRAND, "logo-combo.png")).convert("RGBA")
cw = 360; ch = int(combo.height * cw / combo.width)
combo = combo.resize((cw, ch), Image.LANCZOS)
bg.paste(combo, (64, 72), combo)

# ── tekst ──
f_h1  = ImageFont.truetype(BRIC, 62)
f_sub = ImageFont.truetype(FIG, 27)
f_pr  = ImageFont.truetype(BRIC, 52)
f_tr  = ImageFont.truetype(FIG, 22)
f_tick= ImageFont.truetype(FIG, 20)

d.text((64, 200), "Porty USB",        font=f_h1, fill=INK)
d.text((64, 272), "zawsze pod ręką",  font=f_h1, fill=INK)
d.text((66, 360), "Hub na klips do krawędzi biurka.", font=f_sub, fill=BODY)

d.text((64, 432), "34,90 zł", font=f_pr, fill=INK)
d.text((66, 500), "płatność przy odbiorze  ·  zwrot 14 dni", font=f_tr, fill=BODY)

# ── sygnatura „linia krawędzi" + ticki (echo 5–28 mm) ──
ly = 588
d.line([(64, ly), (W-40, ly)], fill=CTA, width=2)
for i in range(64, W-40, 46):
    d.line([(i, ly-5), (i, ly)], fill=CTA, width=1)
# etykieta 5–28 mm z tłem papieru
lbl = "5–28 mm"
bb = d.textbbox((0,0), lbl, font=f_tick); lw = bb[2]-bb[0]
cx = 470
d.rectangle([cx-8, ly-13, cx+lw+8, ly+13], fill=PAPER)
d.text((cx, ly-11), lbl, font=f_tick, fill=CTA)

bg.save(os.path.join(HERE, "og.png"))
print("OK og.png", bg.size)
