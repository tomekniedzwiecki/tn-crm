# -*- coding: utf-8 -*-
"""OG 1200x630 v2 BEZ CENY (LL-048, feedback Tomka: cena zmienna — nie wolno jej piec
w metadanych/obrazku). Layout jak v1 (typografia L + packshot P), badge ceny -> chip
'Płatność przy odbiorze'. Upload + archiwum."""
import importlib.util, os, shutil, sys
from PIL import Image, ImageDraw, ImageFont

sys.stdout.reconfigure(encoding='utf-8')
MT = r'c:\repos_tn\tn-crm\scripts\mockup-tools'
ARCH = r'C:\Users\tomek\Desktop\TN-Sklepy-grafiki\FABRYKA-2026-07'
spec = importlib.util.spec_from_file_location('ps', os.path.join(MT, 'panel-sync.py'))
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

CFG = [
    dict(slug='odsaczek', bg=(244, 239, 229), ink=(34, 30, 22), cta=(23, 107, 58),
         body=(55, 50, 42), marka='Odsączek',
         hook=['Wyjmij całą porcję', 'jednym ruchem'],
         sub=['Składany koszyk ze stali nierdzewnej', 'do smażenia w garnku lub woku'],
         f_disp=os.path.join(MT, 'FABRYKA-koszyk', 'fonts', 'BricolageGrotesque.ttf'),
         f_text=os.path.join(MT, 'FABRYKA-koszyk', 'fonts', 'Figtree.ttf'),
         packshot=os.path.join(MT, 'FABRYKA-koszyk', 'refs-cache', 'g2.png'),
         pack_bg=(255, 255, 255)),
    dict(slug='ugniatek', bg=(240, 244, 244), ink=(20, 33, 31), cta=(11, 107, 100),
         body=(38, 49, 47), marka='Ugniatek',
         hook=['Dociskaj oburącz.', 'Albo oprzyj się', 'plecami.'],
         sub=['Płaski masażer z 6 głowicami'],
         f_disp=os.path.join(MT, 'fonts', 'SpaceGrotesk-Bold.ttf'),
         f_text=os.path.join(MT, 'fonts', 'SpaceGrotesk-Medium.ttf'),
         packshot=os.path.join(MT, 'FABRYKA-ugniatek', 'assets', 'packshot-34.png'),
         pack_bg=None),
]

for c in CFG:
    W, H = 1200, 630
    im = Image.new('RGB', (W, H), c['bg'])
    d = ImageDraw.Draw(im)
    # prawa: packshot
    pk = Image.open(c['packshot']).convert('RGB')
    ph = 560
    pk = pk.resize((int(pk.size[0] * ph / pk.size[1]), ph), Image.LANCZOS)
    if pk.size[0] > 560:
        pk = pk.crop(((pk.size[0] - 560) // 2, 0, (pk.size[0] - 560) // 2 + 560, ph))
    im.paste(pk, (W - pk.size[0] - 35, (H - ph) // 2))
    # lewa: typografia
    d.text((72, 120), c['marka'], font=ImageFont.truetype(c['f_disp'], 56), fill=c['cta'])
    y = 230
    for ln in c['hook']:
        d.text((72, y), ln, font=ImageFont.truetype(c['f_disp'], 46), fill=c['ink'])
        y += 56
    y += 18
    for ln in c['sub']:
        d.text((72, y), ln, font=ImageFont.truetype(c['f_text'], 27), fill=c['body'])
        y += 36
    # chip COD zamiast ceny (LL-048)
    y += 26
    chip = 'Płatność przy odbiorze'
    f = ImageFont.truetype(c['f_text'], 26)
    tw = d.textlength(chip, font=f)
    d.rounded_rectangle([72, y, 72 + tw + 48, y + 54], radius=16, fill=c['cta'])
    d.text((72 + 24, y + 13), chip, font=f, fill=(255, 255, 255))

    out = os.path.join(MT, 'FABRYKA-koszyk', 'og-%s-v2.jpg' % c['slug'])
    im.save(out, quality=88, optimize=True)
    ps.storage_upload(out, 'bud-assets/%s/assets/og-1200x630.jpg' % c['slug'])
    dst = os.path.join(ARCH, c['slug'], 'assets', 'og-1200x630.jpg')
    if os.path.isdir(os.path.dirname(dst)):
        shutil.copy(out, dst)
    print('OK', c['slug'], out)
print('KONIEC')
