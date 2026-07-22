# -*- coding: utf-8 -*-
"""OG 1200x630 Skrolika — BEZ CENY (LL-048), chip 'Płatność przy odbiorze'.
Layout wg gen-og-v2 (typografia L + packshot P), paleta partytury Skrolika."""
import importlib.util, os, shutil, sys
from PIL import Image, ImageDraw, ImageFont

sys.stdout.reconfigure(encoding='utf-8')
MT = r'c:\repos_tn\tn-crm\scripts\mockup-tools'
HERE = os.path.join(MT, 'FABRYKA-pierscien')
ARCH = r'C:\Users\tomek\Desktop\TN-Sklepy-grafiki\FABRYKA-2026-07\pierscien'
spec = importlib.util.spec_from_file_location('ps', os.path.join(MT, 'panel-sync.py'))
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

BG = (248, 241, 240)      # --paper #F8F1F0
INK = (43, 32, 37)        # --ink #2B2025
CTA = (180, 38, 92)       # --cta #B4265C
BODY = (110, 95, 99)      # --body #6E5F63
F_DISP = os.path.join(MT, 'fonts', 'Gabarito-700.ttf')
F_TEXT = os.path.join(MT, 'fonts', 'Mulish-600.ttf')

W, H = 1200, 630
im = Image.new('RGB', (W, H), BG)
d = ImageDraw.Draw(im)

# prawa: packshot keep2 (realny kadr, biale tlo packshota na karcie)
pk = Image.open(os.path.join(HERE, 'galeria', 'crops', 'keep2-packshot-pink.webp')).convert('RGB')
ph = 500
pk = pk.resize((int(pk.size[0] * ph / pk.size[1]), ph), Image.LANCZOS)
if pk.size[0] > 520:
    pk = pk.crop(((pk.size[0] - 520) // 2, 0, (pk.size[0] - 520) // 2 + 520, ph))
# karta pod packshotem (radius przez maske)
card = Image.new('RGB', (pk.size[0] + 40, ph + 40), (255, 253, 252))
card.paste(pk, (20, 20))
mask = Image.new('L', card.size, 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, card.size[0], card.size[1]], radius=24, fill=255)
im.paste(card, (W - card.size[0] - 48, (H - card.size[1]) // 2), mask)

# lekkie luki sygnalu przy karcie (sygnatura)
cx, cy = W - card.size[0] - 78, H // 2
for r, op in ((36, 160), (58, 120), (80, 90)):
    arc = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(arc).arc([cx - r, cy - r, cx + r, cy + r], start=120, end=240,
                            fill=CTA + (op,), width=4)
    im.paste(arc, (0, 0), arc)

# lewa: typografia
d.text((72, 96), 'Skrolik', font=ImageFont.truetype(F_DISP, 56), fill=CTA)
y = 196
for ln in ('Telefon stoi.', 'Ty przewijasz', 'kciukiem.'):
    d.text((72, y), ln, font=ImageFont.truetype(F_DISP, 52), fill=INK)
    y += 62
y += 16
for ln in ('Pierścień-pilot Bluetooth: pionowy scroll,', 'ebooki i zdalna migawka'):
    d.text((72, y), ln, font=ImageFont.truetype(F_TEXT, 26), fill=BODY)
    y += 36
y += 24
chip = 'Płatność przy odbiorze'
f = ImageFont.truetype(F_TEXT, 26)
tw = d.textlength(chip, font=f)
d.rounded_rectangle([72, y, 72 + tw + 48, y + 54], radius=16, fill=CTA)
d.text((72 + 24, y + 13), chip, font=f, fill=(255, 255, 255))

out = os.path.join(HERE, 'og-skrolik.jpg')
im.save(out, quality=88, optimize=True)
ps.storage_upload(out, 'bud-assets/skrolik/assets/og-1200x630.jpg')
os.makedirs(os.path.join(ARCH, 'assets'), exist_ok=True)
shutil.copy(out, os.path.join(ARCH, 'assets', 'og-1200x630.jpg'))
print('OK og-skrolik.jpg')
