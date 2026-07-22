# -*- coding: utf-8 -*-
"""Montaz sekcji 'wideo' Ugniatka (LL-042 plan B): modul wideo-rail@1 VERBATIM, N=3,
klipy wlasne (bez @autora). Wstawka po markerze SEKCJA:05-wieczorem END (LL-035:
montaz TYLKO po markerach jednoznacznych; komentarz dokumentacyjny modulu WYCIETY)."""
import io, re, sys

sys.stdout.reconfigure(encoding='utf-8')
MOD = r'c:\repos_tn\tn-crm\docs\zbuduje\moduly\wideo-rail@1.html'
IDX = r'c:\repos_tn\tn-crm\sklepy\rafal-hoffa\ugniatek\index.html'
A = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/video/'

mod = io.open(MOD, encoding='utf-8').read()
# 1) wytnij komentarz dokumentacyjny naglowka (LL-035 — zero literalnych tagow w zywym DOM)
i = mod.index('-->')
mod = mod[i + 3:].lstrip('\n')
assert mod.startswith('<section id="wideo"'), mod[:60]

# 2) N=3: grid repeat(3,1fr)
mod = mod.replace('grid-template-columns: repeat(4, 1fr);   /* N kafli = repeat(N,1fr); NIE auto-flow */',
                  'grid-template-columns: repeat(3, 1fr);   /* N=3 kafle = repeat(3,1fr); NIE auto-flow */')
assert 'repeat(3, 1fr)' in mod

# 3) kafle: szablon z kafla 1
tile_m = re.search(r'( *<li class="vid__tile" role="listitem">.*?</li>\n)', mod, re.S)
tile_tpl = tile_m.group(1)
# bez spanu autora (material wlasny — LL-042)
tile_tpl = tile_tpl.replace('          <span class="vid__author">{{AUTOR_1}}</span>\n', '')

DATA = [
    ('ugc-1.mp4', 'ugc-1-poster.webp', 'Kark i barki',
     'Kobieta rozluźnia kark masażerem Ugniatek na kanapie'),
    ('ugc-2.mp4', 'ugc-2-poster.webp', 'Dolne plecy',
     'Mężczyzna opiera dolne plecy o Ugniatka na kanapie'),
    ('ugc-3.mp4', 'ugc-3-poster.webp', 'Po treningu',
     'Ugniatek dociskany oburącz do łydki po treningu na macie'),
]
tiles = []
for n, (mp4, poster, cap, alt) in enumerate(DATA, 1):
    t = tile_tpl
    t = t.replace('{{MP4_1}}', A + mp4).replace('{{POSTER_1}}', A + poster)
    t = t.replace('{{AUTOR_1}}', cap).replace('{{CAP_1}}', cap).replace('{{ALT_1}}', alt)
    tiles.append(t)
mod = mod.replace(tile_m.group(1), ''.join(tiles), 1)
mod = mod.replace('      <!-- ...powtórz <li.vid__tile> dla każdego kafla (2..N)... -->\n', '')

# 4) kropki 3
dots = ('      <button class="vid__dot is-active" type="button" data-index="0" aria-label="Pokaż wideo 1" aria-current="true"></button>\n'
        '      <button class="vid__dot" type="button" data-index="1" aria-label="Pokaż wideo 2"></button>\n'
        '      <button class="vid__dot" type="button" data-index="2" aria-label="Pokaż wideo 3"></button>\n')
mod = re.sub(r' *<button class="vid__dot is-active".*?</button>\n *<!-- \.\.\.button\.vid__dot.*?-->\n',
             dots, mod, count=1, flags=re.S)
assert mod.count('vid__dot') >= 3

# 5) tresci naglowka
mod = mod.replace('{{EYEBROW}}', 'W akcji')
mod = mod.replace('{{TYTUL}}', 'Zobacz, jak pracuje')
mod = mod.replace('{{PODTYTUL}}', 'Trzy krótkie ujęcia — kark, dolne plecy i łydki po treningu.')
assert '{{' not in mod, re.search(r'\{\{[A-Z_0-9]+\}\}', mod).group(0)

# 6) wstawka po markerze konca sekcji wieczorem
idx = io.open(IDX, encoding='utf-8').read()
MARK = '<!-- SEKCJA:05-wieczorem END -->'
assert idx.count(MARK) == 1 and 'id="wideo"' not in idx
wstawka = MARK + '\n\n    <!-- SEKCJA:05b-wideo START (LL-042 plan B: modul wideo-rail@1, klipy wlasne) -->\n' \
    + mod.rstrip() + '\n<!-- SEKCJA:05b-wideo END -->'
idx = idx.replace(MARK, wstawka, 1)
io.open(IDX, 'w', encoding='utf-8').write(idx)
print('OK montaz: sekcja wideo N=3 wstawiona po wieczorem (%d B modulu)' % len(mod))
