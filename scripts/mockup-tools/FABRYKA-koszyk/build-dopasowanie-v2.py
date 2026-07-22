# -*- coding: utf-8 -*-
"""Finalne DOPASOWANIE.md dla OBU produktow Zaradka po LL-044 (sekcja wideo z dodanych
klipow) — LL-036: plik pisany W CALOSCI. Werdykty sekcji sprzed zmiany = przeniesione
z finalnych rund F5 (landing tych sekcji NIE zmienil sie post-F5 poza checkoutem MOBILE
POLISH i sekcja wideo — obie objete swiezym werdyktem visual-verify 22.07); wiersz
'wideo' = werdykt swiezej pary oczu (subagent). Pomiary SSIM/LAYOUT = swiezy sekcja-diff
z LIVE zaradek.pl. Kompozyty kopiowane do archiwum Desktop."""
import io, os, re, shutil, sys

sys.stdout.reconfigure(encoding='utf-8')
MT = r'c:\repos_tn\tn-crm\scripts\mockup-tools'
ARCH = r'C:\Users\tomek\Desktop\TN-Sklepy-grafiki\FABRYKA-2026-07'
R = 'skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK'

# werdykty sekcji wideo = visual-verify RUNDA 2 (22.07, po LL-044v2 + LL-045)
WIDEO = {
    'ugniatek': {
        'd': (R, 'N=4 kafle 278×494 (9:16, repeat(4,1fr) po fixie LL-045 width:100%); postery, podpisy i atrybucje @autor komplet; kropki ukryte — visual-verify R2'),
        'm': (R, 'rail flex 68% z peekiem + 4 kropki; atrybucje/mute OK — visual-verify R2'),
    },
    'odsaczek': {
        'd': (R, 'N=5 kafli 212px (9:16, repeat(5,1fr)); postery/atrybucje komplet; kafel 2 = wideo producenta z CN napisami (fakt materialu, LL-044); kafle 4/5 watermarki tworcow (UGC) — visual-verify R2'),
        'm': (R, 'rail z peekiem + 5 kropek, pierwsza aktywna — visual-verify R2'),
    },
}

UGN_D = {
    'hero': 'karta wyśrodkowana nad szwem dyptyku; topbar w środku zrzutu = artefakt capture; hero-L v2 + pille 12px po LL-039/040',
    'dwie-formy': 'TOR-I: render = stan A + przełącznik (makieta pokazuje 2 stany dokumentacyjnie)',
    'anatomia': 'r4: H2 32px/30ch — 2 wiersze, dominujący; układ [stage+2 karty] 1:1',
    'sterowanie': 'etykieta na foto z tekstem (fix span static)',
    'wieczorem': 'struktura 1:1; kadr lewego foto portretowy (kadr, nie układ)',
    'mid-cta': 'r4: 50/50 + 20ch — H2 w 2 wierszach, cena 36px dominująca',
    'zestaw': 'wiersze spec 18px pion; flat-lay kadr bardziej kwadratowy (kadr foto)',
    'zamow': 'realny modul checkout-inline@2 steps na LIVE (publish zhydratowal product_id); MOBILE POLISH LL-043',
    'faq': '+eyebrow FAQ (sygnatura serii); akordeon 2-kol, 10 pozycji',
    'final': 'poziome pasmo [kadr / tresc / kadr]; kadry rowne po height:auto',
}
UGN_M = {
    'hero': 'karta kompakt; pasek w srodku zrzutu = sticky topbar (artefakt)',
    'dwie-formy': 'TOR-I stan A + przelacznik; sylwetka 232px; sticky-buy w zrzucie = artefakt',
    'sticky': 'pasek kompletny: miniatura + Ugniatek 189,00 zl + BLIK/karta/pobranie + CTA; touch-target OK',
    'anatomia': 'calloutsy = pionowa lista pod obrazem; H2 3 wiersze jak makieta',
    'sterowanie': 'etykieta na foto z tekstem; karty spec czytelne',
    'wieczorem': 'dwa foto + karta Po pracy/Po treningu kompakt',
    'mid-cta': 'title 22 / cena 30; kadr produktu 4:3',
    'zestaw': 'flat-lay + spec 12px + panel 11 cm — komplet',
    'zamow': 'realny checkout steps; MOBILE POLISH LL-043 (pola 52px, CTA 58px)',
    'faq': '+eyebrow FAQ (sygnatura serii); akordeon 10 pozycji touch-friendly',
    'final': 'boczne kadry = kwadraty (height:auto vs atrybut height=800)',
}
ODS_D = {
    'hero': 'archetyp H: scena→hook→karta oferty 1:1; nav nad zdjęciem = sticky topbar w kadrze (artefakt capture); ambient hero-video LL-041 (poster=sc-hero, kadr zgodny)',
    'jeden-ruch': 'tytuł + 2 kadry + podpisy + linia + pasek pill/CTA — komplet elementów',
    'zawies': 'eyebrow/H2/foto L + 3 callouty P + pasek 2 pille+CTA — układ 1:1',
    'zloz': 'TOR-I: render = stan A + przełącznik (makieta 2 stany dokumentacyjnie); r2: duplikaty etykiet stanów USUNIĘTE, strzałka-sierota usunięta',
    'durszlak': 'tytuł+subtitle + 2 kadry (makaron/owoce) z podpisami — 1:1',
    'mycie': 'r2: martwe pole pod H2 zamknięte (align-self:start); equal-height kart zdjęć; pasek 3 spec',
    'mid-cta': 'r2 po odbudowie: scena full-frame (mc-scena, ANIM-ready) + 2 żywe chipy + karta rekapu + pasek 3 spec — 3 bloki jak makieta',
    'zamow': 'moduł checkout-inline@2 na LIVE: żywy formularz steps (root #zamow = .zc-checkout, skórka 1-kol desktop); MOBILE POLISH LL-043',
    'faq': 'moduł faq-accordion@1, pierwszy otwarty z foto — jak makieta; +eyebrow FAQ',
    'final': 'pionowy stack tytuł/scena/pasek oferty/linia marki 1:1',
}
ODS_M = {
    'hero': 'marka+scena+H1+karta 29,90+CTA; sticky-buy w kadrze = artefakt capture',
    'jeden-ruch': 'stack 2 kadrów + podpisy + pille + CTA; sticky-buy artefakt',
    'sticky': 'pasek kompletny: thumb + Odsączek 29,90 zł + BLIK/karta/pobranie + Zamawiam; touch OK',
    'zawies': 'callouty pionowo pod foto; touch OK',
    'zloz': 'TOR-I stan A + przełącznik; r2: duplikaty etykiet usunięte',
    'durszlak': '2 duże kadry stack z podpisami',
    'mycie': 'tekst nad kadrami (reflow mobilny OK); pasek spec pionowo',
    'mid-cta': 'r2: scena 4:3 z chipami NA DOLE sceny + karta pełne CTA + pasek spec 2-liniowy',
    'zamow': 'karta-wrapper znika (LL-043), moduł oddycha na 390: pola 52px, CTA 58px',
    'faq': 'akordeon 1-kol, pierwszy otwarty; touch-friendly',
    'final': 'tytuł/scena/karta oferty/linia marki — 1:1 stack',
}

PRODUKTY = [
    ('ugniatek', os.path.join(MT, 'FABRYKA-ugniatek', 'dopasowanie'), UGN_D, UGN_M, 11,
     'Rundy F5: r1 0/20 → r2 8/20 → r3 18/20 → r4 20/20 TAK. Sekcja wideo PRZEBUDOWANA '
     '22.07 wg LL-044 (N=1, klip dodany do produktu — tiktok @jierebyqcwi) — werdykt '
     'świeżej pary oczu (visual-verify) w wierszu wideo; checkout po MOBILE POLISH LL-043 '
     'objęty tym samym przebiegiem.'),
    ('odsaczek', os.path.join(MT, 'FABRYKA-koszyk', 'dopasowanie'), ODS_D, ODS_M, 11,
     'Rundy F5: r1 9/10 TAK (NIE: mid-cta) → r2 6/6 TAK → 10/10 oba viewporty. Sekcja '
     'wideo DODANA 22.07 wg LL-044 (N=2: tiktok @kitchen_in_china + wideo aukcji) + '
     'ambient hero-video (LL-041) — werdykty świeżej pary oczu w wierszach wideo/hero; '
     'checkout po MOBILE POLISH LL-043.'),
]


def fill_desktop(text, uw, wideo_w):
    out = []
    for ln in text.splitlines():
        mm = re.match(r'\| ([a-z-]+) \| (scenowa|kodowa|inna) \| ', ln)
        if mm and 'WERDYKT: ?' in ln:
            sec = mm.group(1)
            if sec == 'wideo':
                rub, uwaga = wideo_w
            else:
                rub, uwaga = R, uw.get(sec, '')
            ln = ln.replace('skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ?', rub + ' | ' + uwaga + ' (1280)')
        out.append(ln)
    return '\n'.join(out)


def fill_mobile(text, uw, wideo_w):
    out = []
    for ln in text.splitlines():
        mm = re.match(r'\| ([a-z-]+) \| ', ln)
        if mm and ln.rstrip().endswith('|  |'):
            sec = mm.group(1)
            if sec == 'wideo':
                rub, uwaga = wideo_w
                w = rub + ' | **TAK** — ' + uwaga
            elif sec == 'sticky':
                w = 'werdykt jakosci: OK — ' + uw['sticky']
            else:
                w = R + ' | **TAK** — ' + uw.get(sec, '')
            ln = ln.rstrip()[:-2] + ' ' + w + ' |'
        out.append(ln)
    return '\n'.join(out)


for slug, base, uw_d, uw_m, n_sekcji, nota in PRODUKTY:
    ww = WIDEO[slug]
    assert ww['d'] and ww['m'], 'brak werdyktu wideo dla %s — uzupelnij WIDEO po visual-verify' % slug
    d = io.open(os.path.join(base, 'desktop', 'DOPASOWANIE.md'), encoding='utf-8').read()
    m = io.open(os.path.join(base, 'mobile', 'DOPASOWANIE.md'), encoding='utf-8').read()
    # sekcja-diff DOPISUJE '## MOBILE (' do istniejacego pliku (nie nadpisuje) — bierz
    # z d TYLKO czesc desktop (utnij od pierwszego '## MOBILE ('), z m TYLKO OSTATNIA
    # (swieza) sekcje '## MOBILE (' — starsze wypelnione tabele w m to poprzednie rundy.
    MOB = '## MOBILE ('
    d = d.split(MOB)[0].rstrip() + '\n'
    assert MOB in m, 'brak sekcji MOBILE w pliku mobile'
    m = ('<!-- MOBILE-390 -->\n# DOPASOWANIE MOBILE 390 — dowody per sekcja (rubryka R13)\n\n'
         + MOB + m.rsplit(MOB, 1)[1])
    d2 = fill_desktop(d, uw_d, ww['d'])
    d2 = d2.replace('| sekcja | typ | makieta | SSIM | LAYOUT | werdykt (rubryka) |',
                    '| sekcja | typ | makieta | SSIM | LAYOUT | werdykt (rubryka) | uwagi |')
    d2 = d2.replace('|---|---|---:|---|---|\n', '|---|---|---:|---|---|---|\n')
    m2 = fill_mobile(m, uw_m, ww['m'])
    m2 = m2.replace('| sekcja | dowod mobile | SSIM/typ | werdykt (TAK/NIE — vision) |',
                    '| sekcja | dowod mobile | SSIM/typ | rubryka | werdykt |')
    m2 = m2.replace('|---|---|---|---|\n', '|---|---|---|---|---|\n')
    fin = d2 + '\n\n' + m2 + '\n\n> ' + nota + '\n'
    arch = os.path.join(ARCH, slug, 'dopasowanie')
    os.makedirs(arch, exist_ok=True)
    io.open(os.path.join(arch, 'DOPASOWANIE.md'), 'w', encoding='utf-8').write(fin)
    n = 0
    for sub, pat in (('desktop', r'^\d\d[a-z]?-[a-z-]+\.png$'), ('mobile', r'^\d\d[a-z]?-[a-z-]+-m\.png$')):
        src_dir = os.path.join(base, sub)
        for f in os.listdir(src_dir):
            if re.match(pat, f):
                shutil.copy(os.path.join(src_dir, f), os.path.join(arch, f))
                n += 1
    rows = re.findall(r'^\| [a-z-]+ \| (?:scenowa|kodowa|inna) \|.*WERDYKT: TAK', fin, re.M)
    mrows = re.findall(r'WERDYKT: TAK \| \*\*TAK\*\*', fin)
    print('%s: DOPASOWANIE.md OK · kompozyty %d · desktop TAK=%d · mobile TAK=%d' % (slug, n, len(rows), len(mrows)))
    assert len(rows) == n_sekcji and len(mrows) == n_sekcji, 'niepelne werdykty %s!' % slug
print('KONIEC')
