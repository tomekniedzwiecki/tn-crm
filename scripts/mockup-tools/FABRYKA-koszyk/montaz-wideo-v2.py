# -*- coding: utf-8 -*-
"""LL-044 (dyrektywa Tomka 22.07): sekcja wideo = klipy DODANE do produktu, zero kuracji.
(A) Ugniatek: PODMIANA sekcji 05b-wideo (N=3 wlasne -> N=1 tiktok @jierebyqcwi).
(B) Odsaczek: NOWA sekcja 06b-wideo (N=2: tiktok @kitchen_in_china + wideo aukcji ali1).
Modul wideo-rail@1 VERBATIM (mechanika nietykalna); skorka: kolory palety + szerokosc
railu dla malego N (max-width kontenera, kolumny nadal rowne) + dots off przy N=1."""
import io, re, sys

sys.stdout.reconfigure(encoding='utf-8')
MOD = r'c:\repos_tn\tn-crm\docs\zbuduje\moduly\wideo-rail@1.html'
UGN = r'c:\repos_tn\tn-crm\sklepy\rafal-hoffa\ugniatek\index.html'
ODS = r'c:\repos_tn\tn-crm\sklepy\rafal-hoffa\odsaczek\index.html'
AU = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/tt/'
AO = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/tt/'

mod_raw = io.open(MOD, encoding='utf-8').read()
i = mod_raw.index('-->')
mod_raw = mod_raw[i + 3:].lstrip('\n')
assert mod_raw.startswith('<section id="wideo"'), mod_raw[:60]


def zmontuj(n, data, eyebrow, tytul, podtytul, rail_max, kolory=None):
    """data = [(mp4, poster, autor|None, cap, alt), ...]; rail_max = max-width railu desktop."""
    mod = mod_raw
    if kolory:
        for stary, nowy in kolory.items():
            mod = mod.replace(stary, nowy)
    mod = mod.replace('grid-template-columns: repeat(4, 1fr);   /* N kafli = repeat(N,1fr); NIE auto-flow */',
                      'grid-template-columns: repeat(%d, 1fr);   /* N=%d kafle = repeat(N,1fr); NIE auto-flow */' % (n, n))
    assert 'repeat(%d, 1fr)' % n in mod

    # skorka malego N: rail nie rozciaga kafli na cala szerokosc contentu
    skorka = ('\n    /* skorka N=%d: waski rail wysrodkowany (kolumny nadal rowne) */\n'
              '    @media (min-width: 768px) {\n'
              '      #wideo .vid__grid { max-width: %s; margin-inline: auto; }\n'
              '    }\n'
              '    #wideo .vid__tile:only-child { margin-inline: auto; }\n' % (n, rail_max))
    if n == 1:
        skorka += '    #wideo .vid__dots { display: none; }\n'
    mod = mod.replace('  </style>', skorka + '  </style>', 1)

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


# ── (A) UGNIATEK: podmiana calej sekcji miedzy markerami 05b ──
idx = io.open(UGN, encoding='utf-8').read()
m = re.search(r'( *<!-- SEKCJA:05b-wideo START[^\n]*-->\n).*?(<!-- SEKCJA:05b-wideo END -->)', idx, re.S)
assert m, 'brak markerow 05b w Ugniatku'
mod_u = zmontuj(
    1,
    [(AU + 'tt1.mp4', AU + 'tt1-poster.webp', '@jierebyqcwi',
      'Masaż pleców w praktyce',
      'Nagranie z TikToka: osoba dociska masażer z dwoma uchwytami do dolnych pleców')],
    'W akcji', 'Zobacz, jak pracuje',
    'Krótkie nagranie z TikToka — tak wygląda masaż w codziennym użyciu.',
    '340px')
idx = idx[:m.start()] + \
    '    <!-- SEKCJA:05b-wideo START (LL-044: wideo dodane do produktu — wideo-rail@1 N=1) -->\n' + \
    mod_u.rstrip() + '\n' + m.group(2) + idx[m.end():]
io.open(UGN, 'w', encoding='utf-8').write(idx)
print('OK Ugniatek: sekcja wideo -> N=1 (tiktok @jierebyqcwi), %d B' % len(mod_u))

# ── (B) ODSACZEK: nowa sekcja po 06-mycie ──
ods = io.open(ODS, encoding='utf-8').read()
MARK = '<!-- SEKCJA:06-mycie END -->'
assert ods.count(MARK) == 1 and 'id="wideo"' not in ods
mod_o = zmontuj(
    2,
    [(AO + 'tt1.mp4', AO + 'tt1-poster.webp', '@kitchen_in_china',
      'Ociekanie prosto nad wokiem',
      'Nagranie z TikToka: koszyk z krążkami cebulowymi ocieka z oleju nad wokiem'),
     (AO + 'ali1.mp4', AO + 'ali1-poster.webp', None,
      'Od frytek po podanie na stół',
      'Wideo producenta: rozłożony koszyk z frytkami podany na talerzu')],
    'W akcji', 'Zobacz go przy pracy',
    'Dwa krótkie nagrania — ociekanie nad wokiem i koszyk w codziennym użyciu.',
    '660px',
    kolory={'241, 87, 58': '23, 107, 58',      # border/outline -> CTA zielen
            '58, 42, 46': '46, 38, 24',        # cien kafla -> tokeny cieni Odsaczka
            '43, 25, 20': '34, 30, 22',        # gradienty/overlaye -> --ink
            '80, 45, 39': '46, 38, 24'})       # cien przycisku play
wstawka = MARK + '\n\n    <!-- SEKCJA:06b-wideo START (LL-044: wideo dodane do produktu — wideo-rail@1 N=2) -->\n' \
    + mod_o.rstrip() + '\n<!-- SEKCJA:06b-wideo END -->'
ods = ods.replace(MARK, wstawka, 1)
io.open(ODS, 'w', encoding='utf-8').write(ods)
print('OK Odsaczek: sekcja wideo N=2 wstawiona po 06-mycie, %d B' % len(mod_o))
