# -*- coding: utf-8 -*-
"""Makiety d+m sekcji wideo wg LL-044 (klipy DODANE do produktu): Ugniatek N=1 (update
05-wideo) + Odsaczek N=2 (nowe 06b-wideo). Kompozyt deterministyczny PIL z realnych
posterow w ukladzie modulu wideo-rail@1 + upload/artefakty lp_makiety."""
import importlib.util, os, sys
from PIL import Image, ImageDraw, ImageFont

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
TT = os.path.join(HERE, 'tt-selfhost')
ARCH = r'C:\Users\tomek\Desktop\TN-Sklepy-grafiki\FABRYKA-2026-07'
F_DISP = r'C:\Windows\Fonts\arialbd.ttf'
F_TEXT = r'C:\Windows\Fonts\arial.ttf'
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
PROJ = 'c2af0524-3c37-4ada-9c9c-acae739a1373'


def font(p, s):
    return ImageFont.truetype(p, s)


def rounded(im, radius):
    mask = Image.new('L', im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, im.size[0], im.size[1]], radius=radius, fill=255)
    out = Image.new('RGBA', im.size)
    out.paste(im, (0, 0), mask)
    return out


def kafel(canvas, poster_path, x, y, tw, th, cap, ink, badge=True):
    im = Image.open(poster_path).convert('RGB')
    scale = max(tw / im.size[0], th / im.size[1])
    im = im.resize((int(im.size[0] * scale) + 1, int(im.size[1] * scale) + 1), Image.LANCZOS)
    cx0 = (im.size[0] - tw) // 2
    cy0 = (im.size[1] - th) // 3
    im = im.crop((cx0, cy0, cx0 + tw, cy0 + th))
    canvas.paste(rounded(im, 18), (x, y), rounded(im, 18))
    d = ImageDraw.Draw(canvas)
    if badge:
        cxx, cyy, r = x + tw // 2, y + th // 2, 34
        d.ellipse([cxx - r, cyy - r, cxx + r, cyy + r], fill=(255, 255, 255, 235))
        d.polygon([(cxx - r * .28, cyy - r * .45), (cxx - r * .28, cyy + r * .45), (cxx + r * .5, cyy)], fill=ink)
    d.text((x + 20, y + th - 50), cap, font=font(F_TEXT, 23), fill=(255, 255, 255))


def build(size, mobile, cfg):
    W, H = size
    canvas = Image.new('RGB', size, cfg['paper2'])
    d = ImageDraw.Draw(canvas)
    mx = 64 if mobile else 96
    d.text((mx, 84), 'W AKCJI', font=font(F_TEXT, 23), fill=cfg['cta'])
    d.line([mx, 122, mx + 54, 122], fill=cfg['cta'], width=2)
    d.text((mx, 142), cfg['tytul'], font=font(F_DISP, 54 if mobile else 58), fill=cfg['ink'])
    d.text((mx, 220), cfg['sub_m'] if mobile else cfg['sub_d'], font=font(F_TEXT, 26), fill=cfg['body'])
    n = len(cfg['postery'])
    if not mobile:
        tw, th = cfg['tw_d'], int(cfg['tw_d'] * 16 / 9)
        gap = 24
        total = n * tw + (n - 1) * gap
        x0, y0 = (W - total) // 2, 296
        for i, (p, cap) in enumerate(zip(cfg['postery'], cfg['caps'])):
            kafel(canvas, p, x0 + i * (tw + gap), y0, tw, th, cap, cfg['ink'], badge=(i == 0))
    else:
        tw = int(W * 0.66)
        th = int(tw * 16 / 9)
        y0 = 300
        if n == 1:
            kafel(canvas, cfg['postery'][0], (W - tw) // 2, y0, tw, th, cfg['caps'][0], cfg['ink'])
        else:
            for i, (p, cap) in enumerate(zip(cfg['postery'][:2], cfg['caps'][:2])):
                kafel(canvas, p, 64 + i * (tw + 20), y0, tw, th, cap, cfg['ink'], badge=(i == 0))
            for i in range(n):
                cx, cy = W // 2 - (n - 1) * 20 + i * 40, y0 + th + 46
                d.ellipse([cx - 7, cy - 7, cx + 7, cy + 7], fill=cfg['cta'] if i == 0 else cfg['line'])
    return canvas


PRODUKTY = [
    dict(slug='ugniatek', prod='c5977c4d-76dd-472e-8953-d9fb12b1120b', plik='05-wideo',
         paper2=(230, 235, 236), ink=(20, 33, 31), body=(38, 49, 47), cta=(11, 107, 100),
         line=(176, 186, 187), tytul='Zobacz, jak pracuje',
         sub_d='Krótkie nagrania z TikToka — masaż w codziennym użyciu.',
         sub_m='Krótkie nagrania z TikToka — masaż w codziennym użyciu.',
         postery=[os.path.join(TT, 'ugniatek-%s-poster.jpg' % k) for k in ('tt1', 'tt3', 'tt4', 'tt5')],
         caps=['Masaż pleców w praktyce', 'Recenzja z TikToka', 'Wieczorny masaż', 'Po treningu — łydki'],
         tw_d=270),
    dict(slug='odsaczek', prod='f69d7cee-6e1e-42b1-8ccf-39afb9a47a34', plik='06b-wideo',
         paper2=(237, 230, 216), ink=(34, 30, 22), body=(55, 50, 42), cta=(23, 107, 58),
         line=(220, 213, 200), tytul='Zobacz go przy pracy',
         sub_d='Krótkie nagrania — koszyk w codziennym użyciu.',
         sub_m='Krótkie nagrania — koszyk w codziennym użyciu.',
         postery=[os.path.join(TT, 'odsaczek-%s-poster.jpg' % k) for k in ('tt1', 'ali1', 'tt2', 'tt3', 'tt4')],
         caps=['Ociekanie prosto nad wokiem', 'Od frytek po podanie na stół', 'Przekąski bez tłuszczu',
               'Efekt: chrupiące i suche', 'Koszyk w woku — start'],
         tw_d=215),
]

spec = importlib.util.spec_from_file_location('ps', r'c:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py')
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

for cfg in PRODUKTY:
    arch = os.path.join(ARCH, cfg['slug'], 'makiety')
    for nazwa, size, mob, kind, viewport in [
            (cfg['plik'] + '.png', (1536, 1024), False, 'makieta', 'desktop'),
            (cfg['plik'] + '-mobile.png', (1024, 1536), True, 'makieta_mobile', 'mobile')]:
        im = build(size, mob, cfg)
        p = os.path.join(arch, nazwa)
        im.save(p, optimize=True)
        dest = 'bud-assets/%s/makiety/%s' % (cfg['slug'], nazwa.replace('.png', '.webp'))
        ps.storage_upload(p, dest, to_webp=True, max_width=1440)
        ps.artifact_add(PROJ, cfg['prod'], 'lp_makiety', kind, PUB + dest,
                        label='Makieta sekcji wideo (%s) — LL-044: klipy dodane do produktu, wideo-rail@1 N=%d'
                              % (viewport, len(cfg['postery'])),
                        meta={'section': cfg['plik'], 'viewport': viewport})
        print('OK', p)
print('KONIEC')
