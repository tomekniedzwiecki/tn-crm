# -*- coding: utf-8 -*-
"""Makiety d+m sekcji 'wideo' Ugniatka (LL-042 plan B): kompozyt deterministyczny PIL
z realnych posterow UGC w ukladzie modulu wideo-rail@1 (N=3). Sekcja modulowa — uklad
dyktuje MODUL (mechanika nietykalna), wiec makieta = wierny mockup docelowego ukladu,
nie generacja AI. Zapis: archiwum makiety/05-wideo.png + 05-wideo-mobile.png + upload."""
import importlib.util, os, sys
from PIL import Image, ImageDraw, ImageFont

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, 'assets')
ARCH_MAK = r'C:\Users\tomek\Desktop\TN-Sklepy-grafiki\FABRYKA-2026-07\ugniatek\makiety'

PAPER2 = (230, 235, 236)
INK = (20, 33, 31)
BODY = (38, 49, 47)
CTA = (11, 107, 100)
CARD = (255, 255, 255)

F_DISP = r'C:\Windows\Fonts\arialbd.ttf'
F_TEXT = r'C:\Windows\Fonts\arial.ttf'


def font(path, size):
    return ImageFont.truetype(path, size)


def rounded(im, radius):
    mask = Image.new('L', im.size, 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([0, 0, im.size[0], im.size[1]], radius=radius, fill=255)
    out = Image.new('RGBA', im.size)
    out.paste(im, (0, 0), mask)
    return out


def play_badge(d, cx, cy, r=34):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 255, 255, 235))
    d.polygon([(cx - r * 0.28, cy - r * 0.45), (cx - r * 0.28, cy + r * 0.45),
               (cx + r * 0.5, cy)], fill=INK)


CAPS = ['Kark i barki', 'Dolne plecy', 'Po treningu']
POSTERS = ['ugc-1.png', 'ugc-2.png', 'ugc-3.png']


def build(size, mobile):
    W, H = size
    canvas = Image.new('RGB', size, PAPER2)
    d = ImageDraw.Draw(canvas)
    if not mobile:
        d.text((96, 84), 'W AKCJI', font=font(F_TEXT, 22), fill=CTA)
        d.line([96, 122, 150, 122], fill=CTA, width=2)
        d.text((96, 140), 'Zobacz, jak pracuje', font=font(F_DISP, 58), fill=INK)
        d.text((96, 218), 'Trzy krótkie ujęcia — kark, dolne plecy i łydki po treningu.',
               font=font(F_TEXT, 26), fill=BODY)
        tw, th = 380, 676
        gap = (W - 2 * 96 - 3 * tw) // 2
        y0 = 292
        for i, (p, cap) in enumerate(zip(POSTERS, CAPS)):
            x = 96 + i * (tw + gap)
            im = Image.open(os.path.join(ASSETS, p)).convert('RGB')
            im = im.resize((tw, int(im.size[1] * tw / im.size[0])), Image.LANCZOS)
            im = im.crop((0, max(0, (im.size[1] - th) // 3), tw, max(0, (im.size[1] - th) // 3) + th))
            canvas.paste(rounded(im, 18), (x, y0), rounded(im, 18))
            dd = ImageDraw.Draw(canvas)
            play_badge(dd, x + tw // 2, y0 + th // 2)
            dd.text((x + 22, y0 + th - 54), cap, font=font(F_TEXT, 24), fill=(255, 255, 255))
    else:
        d.text((64, 90), 'W AKCJI', font=font(F_TEXT, 24), fill=CTA)
        d.line([64, 130, 118, 130], fill=CTA, width=2)
        d.text((64, 150), 'Zobacz, jak pracuje', font=font(F_DISP, 54), fill=INK)
        d.text((64, 226), 'Przesuwaj — trzy krótkie ujęcia.', font=font(F_TEXT, 26), fill=BODY)
        # peek 68%: kafel 1 pelny + kawalek kafla 2 (kontrakt mobile modulu)
        tw = int(W * 0.66)
        th = int(tw * 16 / 9)
        y0 = 300
        for i, (p, cap) in enumerate(zip(POSTERS[:2], CAPS[:2])):
            x = 64 + i * (tw + 20)
            im = Image.open(os.path.join(ASSETS, p)).convert('RGB')
            im = im.resize((tw, int(im.size[1] * tw / im.size[0])), Image.LANCZOS)
            im = im.crop((0, max(0, (im.size[1] - th) // 3), tw, max(0, (im.size[1] - th) // 3) + th))
            canvas.paste(rounded(im, 18), (x, y0), rounded(im, 18))
            dd = ImageDraw.Draw(canvas)
            if i == 0:
                play_badge(dd, x + tw // 2, y0 + th // 2)
                dd.text((x + 20, y0 + th - 50), cap, font=font(F_TEXT, 24), fill=(255, 255, 255))
        # kropki
        for i in range(3):
            cx = W // 2 - 40 + i * 40
            cy = y0 + th + 46
            d.ellipse([cx - 7, cy - 7, cx + 7, cy + 7],
                      fill=CTA if i == 0 else (176, 186, 187))
    return canvas


for name, size, mob in [('05-wideo.png', (1536, 1024), False),
                        ('05-wideo-mobile.png', (1024, 1536), True)]:
    im = build(size, mob)
    p = os.path.join(ARCH_MAK, name)
    im.save(p, optimize=True)
    print('OK', p)

spec = importlib.util.spec_from_file_location('ps', r'c:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py')
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)
PROJ = 'c2af0524-3c37-4ada-9c9c-acae739a1373'
PROD = 'c5977c4d-76dd-472e-8953-d9fb12b1120b'
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
for name, viewport, kind in [('05-wideo.png', 'desktop', 'makieta'),
                             ('05-wideo-mobile.png', 'mobile', 'makieta_mobile')]:
    dest = 'bud-assets/ugniatek/makiety/' + name.replace('.png', '.webp')
    ps.storage_upload(os.path.join(ARCH_MAK, name), dest, to_webp=True, max_width=1440)
    ps.artifact_add(PROJ, PROD, 'lp_makiety', kind, PUB + dest,
                    label='Makieta sekcji wideo (%s) — mockup deterministyczny ukladu wideo-rail@1 (LL-042 plan B)' % viewport,
                    meta={'section': '05-wideo', 'viewport': viewport})
print('OK artefakty makiet wideo')
