# -*- coding: utf-8 -*-
"""F5 ODSACZEK: finalny DOPASOWANIE.md (werdykty rubryki R13 rundy 1+2 świeżych oczu)
+ kopiowanie kompozytów do archiwum Desktop. LL-036: plik pisany W CAŁOŚCI."""
import io, os, re, shutil, sys

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
DESK = os.path.join(HERE, 'dopasowanie', 'desktop')
MOB = os.path.join(HERE, 'dopasowanie', 'mobile')
ARCH = r'C:\Users\tomek\Desktop\TN-Sklepy-grafiki\FABRYKA-2026-07\odsaczek\dopasowanie'
os.makedirs(ARCH, exist_ok=True)

R = 'skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK'
UW_D = {
    'hero': 'archetyp H: scena→hook→karta oferty 1:1; nav nad zdjęciem = sticky topbar w kadrze (artefakt capture)',
    'jeden-ruch': 'tytuł + 2 kadry + podpisy + linia + pasek pill/CTA — komplet elementów',
    'zawies': 'eyebrow/H2/foto L + 3 callouty P + pasek 2 pille+CTA — układ 1:1',
    'zloz': 'TOR-I: render = stan A + przełącznik (makieta 2 stany dokumentacyjnie); r2: duplikaty etykiet stanów USUNIĘTE, strzałka-sierota usunięta',
    'durszlak': 'tytuł+subtitle + 2 kadry (makaron/owoce) z podpisami — 1:1',
    'mycie': 'r2: martwe pole pod H2 zamknięte (align-self:start); equal-height kart zdjęć; pasek 3 spec',
    'mid-cta': 'r2 po odbudowie: scena full-frame (mc-scena, ANIM-ready) + 2 żywe chipy + karta rekapu + pasek 3 spec — 3 bloki jak makieta',
    'zamow': 'osadzenie modułu checkout-inline@2 kanoniczne (karta produktu + karta zamówienia + pay-badges); guard w renderze lokalnym = placeholder przed publish (na platformie formularz steps — werdykt visual-verify)',
    'faq': 'moduł faq-accordion@1, pierwszy otwarty z foto — jak makieta; +eyebrow FAQ',
    'final': 'pionowy stack tytuł/scena/pasek oferty/linia marki 1:1',
}
UW_M = {
    'hero': 'marka+scena+H1+karta 29,90+CTA; sticky-buy w kadrze = artefakt capture',
    'jeden-ruch': 'stack 2 kadrów + podpisy + pille + CTA; sticky-buy artefakt',
    'sticky': 'pasek kompletny: thumb + Odsączek 29,90 zł + BLIK/karta/pobranie + Zamawiam; touch OK',
    'zawies': 'callouty pionowo pod foto; touch OK',
    'zloz': 'TOR-I stan A + przełącznik; r2: duplikaty etykiet usunięte',
    'durszlak': '2 duże kadry stack z podpisami',
    'mycie': 'tekst nad kadrami (reflow mobilny OK); pasek spec pionowo',
    'mid-cta': 'r2: scena 4:3 z chipami NA DOLE sceny + karta pełne CTA + pasek spec 2-liniowy',
    'zamow': 'osadzenie modułu OK; guard = placeholder lokalny (patrz desktop)',
    'faq': 'akordeon 1-kol, pierwszy otwarty; touch-friendly',
    'final': 'tytuł/scena/karta oferty/linia marki — 1:1 stack',
}

d = io.open(os.path.join(DESK, 'DOPASOWANIE.md'), encoding='utf-8').read()
m = io.open(os.path.join(MOB, 'DOPASOWANIE.md'), encoding='utf-8').read()

def fill_desktop(text):
    out = []
    for ln in text.splitlines():
        mm = re.match(r'\| (\S+) \| (\S+) \| ', ln)
        if mm and 'WERDYKT: ?' in ln:
            sec = mm.group(1)
            ln = ln.replace('skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ?',
                            R + ' | ' + UW_D.get(sec, '') + ' (1280)')
        out.append(ln)
    return '\n'.join(out)

def fill_mobile(text):
    out = []
    for ln in text.splitlines():
        mm = re.match(r'\| (\S+) \| ', ln)
        if mm and ln.rstrip().endswith('|  |'):
            sec = mm.group(1)
            if sec == 'sticky':
                w = 'werdykt jakosci: OK — ' + UW_M['sticky']
            else:
                w = R + ' | **TAK** — ' + UW_M.get(sec, '')
            ln = ln.rstrip()[:-2] + ' ' + w + ' |'
        out.append(ln)
    return '\n'.join(out)

# naglowek tabeli desktop dostaje kolumne uwag (spojnie z wzorem ugniatka)
d2 = fill_desktop(d).replace('| sekcja | typ | makieta | SSIM | LAYOUT | werdykt (rubryka) |',
                             '| sekcja | typ | makieta | SSIM | LAYOUT | werdykt (rubryka) | uwagi |')
d2 = d2.replace('|---|---|---:|---|---|\n', '|---|---|---:|---|---|---|\n')
m2 = fill_mobile(m).replace('| sekcja | dowod mobile | SSIM/typ | werdykt (TAK/NIE — vision) |',
                            '| sekcja | dowod mobile | SSIM/typ | rubryka | werdykt |')
m2 = m2.replace('|---|---|---|---|\n', '|---|---|---|---|---|\n')

FIN = d2 + '\n\n' + m2 + ('\n\n> Rubryka R13: runda 1 (świeże oczy) 9/10 TAK desktop i mobile '
                          '(NIE: mid-cta — brak sceny i paska spec); runda 2 po poprawkach '
                          '(scena mc + pasek spec + P2 zloz/mycie): 6/6 TAK → 10/10 desktop, '
                          '10/10 mobile. Guard #zamow w renderze lokalnym = kontrakt publish '
                          '(LL-038); żywy formularz potwierdzony visual-verify na zaradek.pl.\n')
io.open(os.path.join(ARCH, 'DOPASOWANIE.md'), 'w', encoding='utf-8').write(FIN)
print('OK DOPASOWANIE.md ->', ARCH)

n = 0
for src_dir, pat in ((DESK, r'^\d\d-[a-z-]+\.png$'), (MOB, r'^\d\d-[a-z-]+-m\.png$')):
    for f in os.listdir(src_dir):
        if re.match(pat, f):
            shutil.copy(os.path.join(src_dir, f), os.path.join(ARCH, f))
            n += 1
print('OK kompozyty:', n)

# sanity-parse ta sama sciezka co gate (LL-036): tabela desktop ma 10 wierszy z WERDYKT: TAK
rows = re.findall(r'^\| [a-z-]+ \| (?:scenowa|kodowa|inna) \|.*WERDYKT: TAK', FIN, re.M)
mrows = re.findall(r'WERDYKT: TAK \| \*\*TAK\*\*', FIN)
print('sanity: desktop TAK =', len(rows), '· mobile TAK =', len(mrows))
assert len(rows) == 10 and len(mrows) == 10, 'niepelne werdykty!'
print('SANITY OK')
