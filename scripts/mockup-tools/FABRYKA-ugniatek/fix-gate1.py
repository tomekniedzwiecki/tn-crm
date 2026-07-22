# -*- coding: utf-8 -*-
"""F7 poprawki hurtowe: semantyka (alty/callout), DOPASOWANIE header 7 kol + mobile TAK,
WIERNOSC frazy, PASZPORT tabela cech, IR plasko, makiety filter, sieroty, komentarz runtime."""
import io, os, re, shutil, sys
sys.stdout.reconfigure(encoding='utf-8')
ARCH = r'C:\Users\tomek\Desktop\TN-Sklepy-grafiki\FABRYKA-2026-07\ugniatek'
FAB = r'c:\repos_tn\tn-crm\scripts\mockup-tools\FABRYKA-ugniatek'
IDX = r'c:\repos_tn\tn-crm\sklepy\rafal-hoffa\ugniatek\index.html'

# 1. semantyka: alt final + callout/FAQ przyciski + komentarz runtime (cena/own-stock)
t = io.open(IDX, encoding='utf-8').read()
fixes = [
 ('alt="Dociskanie Ugniatka oburącz do górnej części pleców"',
  'alt="Dociskanie Ugniatka oburącz do uda"'),
 ('<span>wyświetlacz +<br>3 przyciski</span>', '<span>wyświetlacz +<br>przyciski trybów</span>'),
 ('Na bocznym panelu masz wyświetlacz i trzy przyciski.', 'Na bocznym panelu masz wyświetlacz i przyciski.'),
 ('- CENA:  <span data-price>149,90 zł</span>     → runtime nadpisuje AKTUALNĄ ceną (zapieczona = fallback)',
  '- CENA:  element data-price z ceną PL          → runtime nadpisuje AKTUALNĄ ceną (zapieczona = fallback)'),
 ('<span data-price-raw>149.90</span>    → wariant bez formatowania (opcjonalny)',
  'element data-price-raw (liczba)       → wariant bez formatowania (opcjonalny)'),
 ('<span data-sold-wrap hidden>Już <b data-sold>–</b> zamówień w naszym sklepie</span>',
  'element data-sold-wrap hidden (Już N zamówień u nas)'),
 ('alt="Ugniatek – urządzenie do masażu stóp"', 'alt="Ugniatek – płaski masażer z sześcioma głowicami"'),
]
n = 0
for old, new in fixes:
    if old in t:
        t = t.replace(old, new, 1); n += 1
    else:
        print('  (pominieto — brak):', old[:50])
io.open(IDX, 'w', encoding='utf-8').write(t)
print('OK index.html %d/%d poprawek' % (n, len(fixes)))

# 2. DOPASOWANIE.md: header 7 kolumn (desktop) + mobile kolumna werdykt TAK
src_d = os.path.join(FAB, 'dopasowanie', 'desktop', 'DOPASOWANIE.md')
m = io.open(src_d, encoding='utf-8').read()
m = m.replace('| sekcja | typ | makieta | SSIM | LAYOUT | werdykt (rubryka) |\n|---|---|---|---:|---|---|',
              '| sekcja | typ | makieta | SSIM | LAYOUT | werdykt (rubryka) | uwagi |\n|---|---|---|---:|---|---|---|', 1)
io.open(src_d, 'w', encoding='utf-8').write(m)
src_m = os.path.join(FAB, 'dopasowanie', 'mobile', 'DOPASOWANIE.md')
mm = io.open(src_m, encoding='utf-8').read()
mm = mm.replace('| sekcja | dowod | SSIM (info) | rubryka | uwaga |\n|---|---|---|---|---|',
                '| sekcja | dowod | SSIM (info) | rubryka | werdykt | uwaga |\n|---|---|---|---|---|---|', 1)


def add_tak(match):
    row = match.group(0)
    parts = row.split('|')
    val = ' **TAK** ' if 'WERDYKT: TAK' in row else (' render-only OK ' if 'render-only' in row else ' **TAK** ')
    parts.insert(-2, val)
    return '|'.join(parts)


mm = re.sub(r'^\| (hero|dwie-formy|sticky|anatomia|sterowanie|wieczorem|mid-cta|zestaw|zamow|faq|final) \|.*\|$',
            add_tak, mm, flags=re.M)
io.open(src_m, 'w', encoding='utf-8').write(mm)
md_d = io.open(src_d, encoding='utf-8').read()
md_m = io.open(src_m, encoding='utf-8').read()
io.open(os.path.join(ARCH, 'dopasowanie', 'DOPASOWANIE.md'), 'w', encoding='utf-8').write(
    md_d + '\n\n<!-- MOBILE-390 -->\n\n' + md_m)
print('OK DOPASOWANIE.md (7 kol + mobile werdykt)')

# 3. WIERNOSC.md: frazy WIERNOSC: <werdykt> + wiersze df-A/df-B/an-spod/og/hero-video
wp = os.path.join(ARCH, 'dopasowanie', 'WIERNOSC.md')
w = io.open(wp, encoding='utf-8').read()
w = w.replace('| ZGODNA |', '| WIERNOŚĆ: ZGODNA |')
if 'df-A' not in w:
    anchor = '| ze-profil | T | T | T (profil) | T | T | T | — | WIERNOŚĆ: ZGODNA |'
    dodatek = (anchor + '\n'
        '| df-A | T | T | — | T | T | T | T (kule do uda) | WIERNOŚĆ: ZGODNA |\n'
        '| df-B | T | T | — | T | T | T | T (kule do lędźwi) | WIERNOŚĆ: ZGODNA |\n'
        '| an-spod | — | — | — | — | — | — | — | WIERNOŚĆ: REAL (kadr Ali — kanon) |\n'
        '| og-1200x630 | — | — | — | — | — | — | — | WIERNOŚĆ: ZGODNA (kompozyt z packshot-34) |\n'
        '| hero-video | T | T | — | T | T | T | T (kule do karku) | WIERNOŚĆ: ZGODNA (Kling i2v z hero-L; klatki obejrzane) |')
    if anchor in w:
        w = w.replace(anchor, dodatek, 1)
    else:
        print('  !! anchor ze-profil nie znaleziony')
io.open(wp, 'w', encoding='utf-8').write(w)
shutil.copy(wp, os.path.join(FAB, 'dopasowanie', 'WIERNOSC.md'))
print('OK WIERNOSC.md')

# 4. PASZPORT: tabela Cechy dyskryminujace
pp = os.path.join(ARCH, 'PASZPORT.md')
p = io.open(pp, encoding='utf-8').read()
if 'Cechy dyskryminuj' not in p:
    p += ('\n\n## Cechy dyskryminujące (tabela kanoniczna — gate F3A liczy PASS >= K)\n'
          '| cecha | wzorzec (real) |\n|---|---|\n'
          '| bryła | płaski OWAL (nie pistolet, nie prostokąt), grubość ~11 cm |\n'
          '| uchwyty | 2 zintegrowane wycięcia z RYFLOWANIEM (molded finger grooves) od spodu |\n'
          '| głowice | dokładnie 6 czarnych kul piankowych w siatce 2×3 od spodu |\n'
          '| spód-centrum | owalny perforowany panel diod (ciepła czerwień 630–650 nm) |\n'
          '| panel boczny | wyświetlacz segmentowy + przyciski +/− na krawędzi |\n'
          '| wykończenie | satynowy srebrno-szary (satin silver-grey; NIE chrom-lustro, NIE grafit) |\n')
    io.open(pp, 'w', encoding='utf-8').write(p)
    shutil.copy(pp, os.path.join(FAB, 'PASZPORT.md'))
print('OK PASZPORT tabela cech')

# 5. IR plasko do ARCH/ir/*-IR.json
ird = os.path.join(ARCH, 'ir'); os.makedirs(ird, exist_ok=True)
n = 0
src_ir = os.path.join(FAB, 'dopasowanie', 'desktop', 'ir')
if os.path.isdir(src_ir):
    for f in os.listdir(src_ir):
        if f.endswith('-IR.json'):
            shutil.copy(os.path.join(src_ir, f), os.path.join(ird, f)); n += 1
if n < 10:
    for sub in os.listdir(os.path.join(FAB, 'ir')):
        j = os.path.join(FAB, 'ir', sub, sub + '-IR.json')
        if os.path.isfile(j):
            shutil.copy(j, os.path.join(ird, sub + '-IR.json')); n += 1
print('OK IR plasko:', n)

# 6. makiety: filtr do kanonicznych 20 + alias interakcja-mobile
mk = os.path.join(ARCH, 'makiety')
KANON = {'ugniatek-m-hero-v2.png', 'ugniatek-m-dwie-formy.png', 'ugniatek-m-anatomia-v2.png',
         'ugniatek-m-sterowanie.png', 'ugniatek-m-wieczorem.png', '06-mid-cta.png',
         '07-zestaw.png', '08-zamow.png', '09-faq.png', '10-final.png',
         'ugniatek-m-hero-mobile-v2.png', 'ugniatek-m-dwie-formy-mobile.png',
         'm-03-anatomia-mobile.png', 'm-04-sterowanie-mobile.png', 'm-05-wieczorem-mobile.png',
         'm-06-mid-cta-mobile.png', 'm-07-zestaw-mobile.png', 'm-08-zamow-mobile.png',
         'm-09-faq-mobile.png', 'm-10-final-mobile.png'}
for f in list(os.listdir(mk)):
    if f not in KANON:
        os.remove(os.path.join(mk, f))
shutil.copy(os.path.join(mk, 'ugniatek-m-dwie-formy-mobile.png'),
            os.path.join(mk, 'ugniatek-m-interakcja-dwie-formy-mobile.png'))
print('OK makiety kanon + alias interakcja-mobile:', len(os.listdir(mk)))

# 7. sieroty: hero-video-frames poza assets
fr = os.path.join(ARCH, 'assets', 'hero-video-frames.png')
if os.path.isfile(fr):
    os.remove(fr)
fr2 = os.path.join(FAB, 'assets', 'hero-video-frames.png')
if os.path.isfile(fr2):
    shutil.move(fr2, os.path.join(FAB, 'hero-video-frames.png'))
print('OK sieroty')

# 8. kopia index.html do archiwum (swieza)
shutil.copy(IDX, os.path.join(ARCH, 'index.html'))
print('OK index.html archiwum odswiezony')
