# -*- coding: utf-8 -*-
"""LL-044 v2 (Tomek: "po 4-5 video w tej sekcji"): remontaz sekcji wideo z modulu
kanonicznego (po fixie vid__tile width:100% — LL-045). Wycina istniejaca sekcje
miedzy markerami i montuje N=4 (Ugniatek) / N=5 (Odsaczek). Kolejnosc kafli:
jawnie dodane (tiktok_url, ali video_url) -> reszta puli wg plays DESC. Zero kuracji."""
import io, re, sys

sys.stdout.reconfigure(encoding='utf-8')
MOD = r'c:\repos_tn\tn-crm\docs\zbuduje\moduly\wideo-rail@1.html'
AU = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/tt/'
AO = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/tt/'

mod_raw = io.open(MOD, encoding='utf-8').read()
i = mod_raw.index('-->')
mod_raw = mod_raw[i + 3:].lstrip('\n')
assert mod_raw.startswith('<section id="wideo"')
assert 'width: 100%;' in mod_raw, 'brak fixu LL-045 w module!'


def zmontuj(n, data, eyebrow, tytul, podtytul, kolory=None):
    mod = mod_raw
    if kolory:
        for stary, nowy in kolory.items():
            mod = mod.replace(stary, nowy)
    mod = re.sub(r'grid-template-columns: repeat\(4, 1fr\);\s*/\* N kafli[^\n]*\*/',
                 'grid-template-columns: repeat(%d, 1fr);   /* N=%d kafle = repeat(N,1fr); NIE auto-flow */' % (n, n), mod)
    assert 'repeat(%d, 1fr)' % n in mod

    tile_m = re.search(r'( *<li class="vid__tile" role="listitem">.*?</li>\n)', mod, re.S)
    tile_tpl = tile_m.group(1)
    tiles = []
    for (mp4, poster, autor, cap, alt) in data:
        t = tile_tpl
        if not autor:
            t = t.replace('          <span class="vid__author">{{AUTOR_1}}</span>\n', '')
        t = t.replace('{{MP4_1}}', mp4).replace('{{POSTER_1}}', poster)
        t = t.replace('aria-label="Odtwórz wideo — {{AUTOR_1}}"',
                      'aria-label="Odtwórz wideo — %s"' % (autor or cap))
        t = t.replace('data-author="{{AUTOR_1}}"', 'data-author="%s"' % (autor or 'aukcja'))
        t = t.replace('{{AUTOR_1}}', autor or '').replace('{{CAP_1}}', cap).replace('{{ALT_1}}', alt)
        tiles.append(t)
    mod = mod.replace(tile_m.group(1), ''.join(tiles), 1)
    mod = mod.replace('      <!-- ...powtórz <li.vid__tile> dla każdego kafla (2..N)... -->\n', '')

    dots = ''
    for k in range(n):
        act = ' is-active' if k == 0 else ''
        cur = ' aria-current="true"' if k == 0 else ''
        dots += ('      <button class="vid__dot%s" type="button" data-index="%d" aria-label="Pokaż wideo %d"%s></button>\n'
                 % (act, k, k + 1, cur))
    mod = re.sub(r' *<button class="vid__dot is-active".*?</button>\n *<!-- \.\.\.button\.vid__dot.*?-->\n',
                 dots, mod, count=1, flags=re.S)
    mod = mod.replace('{{EYEBROW}}', eyebrow).replace('{{TYTUL}}', tytul).replace('{{PODTYTUL}}', podtytul)
    assert '{{' not in mod, re.search(r'\{\{[A-Z_0-9]+\}\}', mod).group(0)
    return mod


def podmien(plik, marker, naglowek, mod):
    s = io.open(plik, encoding='utf-8').read()
    m = re.search(r'( *<!-- SEKCJA:%s START[^\n]*-->\n).*?(<!-- SEKCJA:%s END -->)' % (marker, marker), s, re.S)
    assert m, 'brak markerow %s' % marker
    s = s[:m.start()] + '    ' + naglowek + '\n' + mod.rstrip() + '\n' + m.group(2) + s[m.end():]
    io.open(plik, 'w', encoding='utf-8').write(s)


UGN_DATA = [
    (AU + 'tt1.mp4', AU + 'tt1-poster.webp', '@jierebyqcwi', 'Masaż pleców w praktyce',
     'Nagranie z TikToka: masaż dolnych pleców masażerem z dwoma uchwytami'),
    (AU + 'tt3.mp4', AU + 'tt3-poster.webp', '@seaurchin', 'Recenzja z TikToka',
     'Nagranie z TikToka: recenzja masażera powięziowego'),
    (AU + 'tt4.mp4', AU + 'tt4-poster.webp', '@jierebyqcwi', 'Wieczorny masaż',
     'Nagranie z TikToka: wieczorny masaż na macie przy świecach'),
    (AU + 'tt5.mp4', AU + 'tt5-poster.webp', '@ayitireveye2026', 'Po treningu — łydki',
     'Nagranie z TikToka: masaż łydki po treningu'),
]
ODS_DATA = [
    (AO + 'tt1.mp4', AO + 'tt1-poster.webp', '@kitchen_in_china', 'Ociekanie prosto nad wokiem',
     'Nagranie z TikToka: koszyk z krążkami cebulowymi ocieka z oleju nad wokiem'),
    (AO + 'ali1.mp4', AO + 'ali1-poster.webp', None, 'Od frytek po podanie na stół',
     'Wideo producenta: rozłożony koszyk z frytkami podany na talerzu'),
    (AO + 'tt2.mp4', AO + 'tt2-poster.webp', '@goodthingsfindsa', 'Przekąski bez tłuszczu',
     'Nagranie z TikToka: rozłożony koszyk przy talerzach przekąsek'),
    (AO + 'tt3.mp4', AO + 'tt3-poster.webp', '@rozzdelite', 'Efekt: chrupiące i suche',
     'Nagranie z TikToka: miska chrupiących przekąsek odsączonych z tłuszczu'),
    (AO + 'tt4.mp4', AO + 'tt4-poster.webp', '@reasuretrove', 'Koszyk w woku — start',
     'Nagranie z TikToka: koszyk rozłożony w woku na kuchence'),
]

mod_u = zmontuj(4, UGN_DATA, 'W akcji', 'Zobacz, jak pracuje',
                'Krótkie nagrania z TikToka — masaż w codziennym użyciu.')
podmien(r'c:\repos_tn\tn-crm\sklepy\rafal-hoffa\ugniatek\index.html', '05b-wideo',
        '<!-- SEKCJA:05b-wideo START (LL-044 v2: wideo dodane do produktu — wideo-rail@1 N=4) -->', mod_u)
print('OK Ugniatek N=4 (%d B)' % len(mod_u))

mod_o = zmontuj(5, ODS_DATA, 'W akcji', 'Zobacz go przy pracy',
                'Krótkie nagrania — koszyk w codziennym użyciu.',
                kolory={'241, 87, 58': '23, 107, 58', '58, 42, 46': '46, 38, 24',
                        '43, 25, 20': '34, 30, 22', '80, 45, 39': '46, 38, 24'})
podmien(r'c:\repos_tn\tn-crm\sklepy\rafal-hoffa\odsaczek\index.html', '06b-wideo',
        '<!-- SEKCJA:06b-wideo START (LL-044 v2: wideo dodane do produktu — wideo-rail@1 N=5) -->', mod_o)
print('OK Odsaczek N=5 (%d B)' % len(mod_o))
