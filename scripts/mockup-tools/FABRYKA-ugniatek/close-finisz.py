# -*- coding: utf-8 -*-
"""F7 close + F8 depozyt kapitalizacji dla UGNIATEK (gate 0 FAIL, PASS=122):
1. LEKCJE-LANDINGI.md: LL-036 (struktura plikow-dowodow = kontrakt gate) + LL-037 (cena_panel tresc elementu)
2. EXEMPLARY-INDEX.md: wiersz ugniatek
3. TOKEN-KONTRAKT.md: rejestr :root ugniatek
4. STANDARD §7e bullet + CHANGELOG DECYZJI wpis 22.07
5. RETRO.md (ARCH): dopis F7
6. wf2_costs: F7 $0.85 (3 sceny finalowe HIGH)
7. panel: lp_finisz done 9/9 VERBATIM + fields; artefakt OG; product_meta status=gotowy
"""
import importlib.util, io, json, os, re, sys
import requests

sys.stdout.reconfigure(encoding='utf-8')
ARCH = r'C:\Users\tomek\Desktop\TN-Sklepy-grafiki\FABRYKA-2026-07\ugniatek'
DOCS = r'c:\repos_tn\tn-crm\docs\zbuduje'
IDX = r'c:\repos_tn\tn-crm\sklepy\rafal-hoffa\ugniatek\index.html'
PROJ = 'c2af0524-3c37-4ada-9c9c-acae739a1373'
PROD = 'c5977c4d-76dd-472e-8953-d9fb12b1120b'
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
spec = importlib.util.spec_from_file_location('ps', r'c:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py')
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)


def patch(path, old, new, tag, must=True):
    t = io.open(path, encoding='utf-8').read()
    if new.strip() and new.strip() in t:
        print('  =', tag, '(juz jest)'); return
    if old not in t:
        print('  !!', tag, '— anchor nie znaleziony' + (' [FATAL]' if must else ' [pomijam]'))
        if must:
            sys.exit(1)
        return
    io.open(path, 'w', encoding='utf-8').write(t.replace(old, old + new, 1))
    print('  OK', tag)


# ---------------------------------------------------------------- 1. LEKCJE: LL-036 + LL-037
LL36 = ("| LL-036 | 2026-07-22 | Ugniatek F7 (gate WIERNOSC: 3 falszywe FAIL pass-2) | DOKTRYNA | "
        "Pliki-dowody czytane maszynowo (WIERNOSC/DOPASOWANIE) maja STRUKTURE jako czesc kontraktu gate: "
        "(1) wiersze dopisywane do pliku MUSZA trafic POD naglowek tabeli — parse_pipe_table przy braku "
        "tokenu w headerze bierze PIERWSZY wiersz pipe z pliku jako naglowek (wiersz fn-A przed tytulem "
        "pliku zostal headerem, jego komorka z 'pass-2' ustawila ci_pass2 i lamala poprawne wiersze); "
        "(2) uwagi wierszy NIE moga zawierac stemow INNYCH assetow — row-match to 'pierwszy wiersz "
        "zawierajacy stem po norm' ('z hero-L' w uwadze hero-video przechwytuje match hero-L); "
        "(3) anchor-replace do dopisywania wierszy = krucha mina: anchor zdezaktualizowany po "
        "wczesniejszej transformacji pliku (T->PASS) wypadl bez bledu i wiersze wyladowaly poza tabela. "
        "Zasada: dopisujesz do pliku-dowodu = PRZEPISZ cala tabele; po zapisie sanity-parse tym samym "
        "parserem co gate | WDROZONA | WIERNOSC.md ugniatek przepisany strukturalnie; precedens + zasada tu |\n")
LL37 = ("| LL-037 | 2026-07-22 | Ugniatek F7 (WARN 'brak data-price' mimo 4 cen) | NARZEDZIE | "
        "Kontrakt runtime-snippet trzyma zapieczona cene w TRESCI elementu (<span data-price>189,00 zl</span> "
        "— runtime nadpisuje textContent), a check cena_panel czytal WYLACZNIE wartosc atrybutu "
        "data-price=\"...\" -> falszywy WARN i ZERO porownania z panelem (kontrakt silnika cen!). Gate "
        "musi czytac OBIE formy; przy pisaniu checkow HTML zawsze sprawdz forme kanoniczna kontraktu, "
        "nie domyslna | WDROZONA | gate-check.py check_cena_panel: rx2 czyta tresc elementu z golym "
        "atrybutem (FIX 22.07) — ugniatek: PASS 4 ceny == panel 189 zl |\n")
lek = os.path.join(DOCS, 'LEKCJE-LANDINGI.md')
t = io.open(lek, encoding='utf-8').read()
anchor = t[t.index('| LL-035'):].split('\n', 1)[0] + '\n'
patch(lek, anchor, LL36 + LL37, 'LEKCJE LL-036/037')

# ---------------------------------------------------------------- 2. EXEMPLARY-INDEX wiersz
exi = os.path.join(DOCS, 'EXEMPLARY-INDEX.md')
te = io.open(exi, encoding='utf-8').read()
anchor_e = te[te.index('| **[usmieszek-checkout]'):].split('\n', 1)[0] + '\n'
ROW = ("| **[ugniatek](https://crm.tomekniedzwiecki.pl/sklepy/rafal-hoffa/ugniatek/)** | "
       "Płaski masażer 6 głowic, 2 uchwyty (Ugniatek · 189 zł) | **A** — hero-video full-bleed + scrim "
       "+ karta copy (brand lockup) | `#0B6B64` głęboka morska zieleń · Space Grotesk + Work Sans | "
       "10 · 203 | **checkout-inline@2 steps** · **hero-video (Kling i2v)** · TOR-I dwie-formy "
       "(przełącznik L/P) · count-up (22 300 mm²) · motion `data-mo` (6 wariantów) · sticky-buy@1 · "
       "footer@1 | hero › **interakcja**`_(dwie-formy)_` › anatomia › sterowanie › wieczorem › "
       "**mid-cta** › zestaw › zamow`_(checkout-inline)_` › faq › final | ◽ do oceny — **1. przebieg "
       "produkcyjny wf2** (klient Hoffa), gate 0 FAIL (PASS=122) |\n")
patch(exi, anchor_e, ROW, 'EXEMPLARY-INDEX ugniatek')

# ---------------------------------------------------------------- 3. TOKEN-KONTRAKT rejestr :root
root = re.search(r':root\s*\{[^}]+\}', io.open(IDX, encoding='utf-8').read()).group(0)
tk = os.path.join(DOCS, 'TOKEN-KONTRAKT.md')
anchor_t = ('_(zasiew: mata / masażer / Drapek — do uzupełnienia przy najbliższym depozycie; nowe landingi\n'
            'dopisują automatycznie w kroku flywheel `KAPITALIZACJA-OPS §4.3`)_\n')
BLOK = ('\n### ugniatek (rafal-hoffa · 2026-07-22 · F8)\n\n```css\n' + root + '\n```\n')
patch(tk, anchor_t, BLOK, 'TOKEN-KONTRAKT :root ugniatek')

# ---------------------------------------------------------------- 4. STANDARD: §7e bullet + CHANGELOG
std = os.path.join(DOCS, 'STANDARD-LANDING-SKLEPY.md')
B7E = ('- **Pliki-dowody = struktura to kontrakt (Ugniatek 22.07, LL-036/037):** dopisujesz wiersz do\n'
       '  WIERNOSC/DOPASOWANIE → przepisz CAŁĄ tabelę (anchor-replace pęka po transformacjach; wiersz\n'
       '  przed nagłówkiem zostaje headerem parsera), uwagi bez stemów innych assetów (row-match po\n'
       '  substringu), po zapisie sanity-parse parserem gate. Cena zapieczona = TREŚĆ elementu\n'
       '  `[data-price]` (kontrakt runtime-snippet) — gate-check czyta obie formy.\n')
ts = io.open(std, encoding='utf-8').read()
i8 = ts.index('## 8. ŹRÓDŁA')
if 'LL-036/037' not in ts:
    ts = ts[:i8] + B7E + '\n' + ts[i8:]
CHG = ('\n- **2026-07-22 (PIERWSZY PRZEBIEG PRODUKCYJNY — Ugniatek, klient Hoffa):** pełny cykl F0→F8\n'
       '  na kliencie produkcyjnym zamknięty z gate 0 FAIL (PASS=122). Do fabryki weszły w trakcie:\n'
       '  LL-032 (callout-collapse 3 warstwy), LL-033 (height:auto przy aspect-ratio + zakaz transformu\n'
       '  na .reveal do centrowania), LL-034 (sekcja-diff --manifest w mobile), LL-035 (montaż markerowy\n'
       '  — incydent nadpisanej ceny), LL-036 (struktura plików-dowodów = kontrakt gate), LL-037\n'
       '  (cena_panel czyta treść elementu [data-price]). Gate rozszerzony: checkout_inline_klasa w CTA,\n'
       '  klasa wag .mp4 przed hero, cena_panel dwie formy zapieczenia.\n')
ic = ts.index('## CHANGELOG DECYZJI (F8)\n')
if 'PIERWSZY PRZEBIEG PRODUKCYJNY — Ugniatek' not in ts:
    ts = ts[:ic + len('## CHANGELOG DECYZJI (F8)\n')] + CHG + ts[ic + len('## CHANGELOG DECYZJI (F8)\n'):]
io.open(std, 'w', encoding='utf-8').write(ts)
print('  OK STANDARD §7e + CHANGELOG')

# ---------------------------------------------------------------- 5. RETRO.md (ARCH) dopis F7
retro = os.path.join(ARCH, 'RETRO.md')
tr = io.open(retro, encoding='utf-8').read()
DOP = ('\n## F7 — rundy gate (3 iteracje 16→6→0 FAIL)\n'
       '- LL-036: WIERNOSC.md — wiersze przed nagłówkiem psuły parser (fn-A został headerem, ci_pass2\n'
       '  z jego komórki FAIL-ował hero-L/hero-P/packshot-34); anchor-replace z fix-gate1 wypadł bez\n'
       '  błędu po wcześniejszym T→PASS. Naprawa: tabela przepisana w całości (18 wierszy).\n'
       '- LL-037: cena_panel nie widział cen w TREŚCI elementów [data-price] (kontrakt runtime-snippet)\n'
       '  → fix w gate-check.py (rx2), teraz PASS „4 ceny == panel 189 zł" — kontrakt silnika cen żywy.\n'
       '- Anty-duplikat P0: #final dostał packshot-final.webp (crop ~92% kanonicznego 3/4, osobny hash).\n'
       '- ze-callout = 5. wystąpienie klasy `.callout` z collapse (LL-032) — reset height/background.\n'
       '- Koszt F7: $0.85 (fn-A v1+v2 + fn-B HIGH lokalnie). Kling zaksięgowany w F6.\n')
if 'F7 — rundy gate' not in tr:
    io.open(retro, 'w', encoding='utf-8').write(tr + DOP)
print('  OK RETRO.md F7')

# ---------------------------------------------------------------- 6. wf2_costs F7
env = io.open(r'c:\repos_tn\tn-crm\.env', encoding='utf-8-sig').read()
KEY = re.search(r'^SUPABASE_SERVICE_KEY=(.+)$', env, re.M).group(1).strip()
B = 'https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1'
H = {'apikey': KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json'}
have = requests.get(B + '/wf2_costs?product_id=eq.%s&step_key=eq.lp_finisz&select=id' % PROD, headers=H, timeout=30).json()
if not have:
    r = requests.post(B + '/wf2_costs', headers=H, data=json.dumps({
        'project_id': PROJ, 'product_id': PROD, 'step_key': 'lp_finisz', 'stage': 2,
        'amount': 0.85, 'currency': 'USD', 'kind': 'gpt-image',
        'note': 'F7 finisz: sceny finalowe fn-A (v1 + v2 regen ORIENT) + fn-B HIGH lokalnie '
                '(anty-klony packshota w #final) — 3 generacje',
        'created_by': 'auto'}), timeout=30)
    print('  koszt F7:', r.status_code)
else:
    print('  = koszt F7 juz zaksiegowany')

# ---------------------------------------------------------------- 7. panel: artefakt OG + lp_finisz done + status
ps.artifact_add(PROJ, PROD, 'lp_finisz', 'grafika', PUB + 'bud-assets/ugniatek/assets/og-1200x630.jpg',
                label='OG 1200×630 (kompozyt packshot + typografia)', meta={'gate': 'PASS=122 FAIL=0'})
CHECK = [
    {'t': 'F6 twarda: 0 konsoli, 0 h-scroll (390/768/1280), img OK', 'done': True},
    {'t': 'Grep zakazów + shop.name nie występuje w HTML', 'done': True},
    {'t': 'GATE-CHECK gate-check.py = 0 FAIL', 'done': True},
    {'t': 'Finalny pass: PASS 0-4 czyste', 'done': True},
    {'t': 'PASS 5 semantyka: SEMANTYKA.md komplet', 'done': True},
    {'t': 'Wersja + grafiki zarchiwizowane (Desktop)', 'done': True},
    {'t': 'RETRO F8: NOWE WNIOSKI + LEKSYKON + CHANGELOG', 'done': True},
    {'t': 'Koszty landinga zalogowane w wf2_costs (zakładka Koszty)', 'done': True},
    {'t': 'Status produktu → gotowy', 'done': True},
]
ps.step_update(PROJ, PROD, 'lp_finisz', status='done', checklist=CHECK, fields={
    'gate_check': '0 FAIL (PASS=122, WARN=7 nieblokujące; 3 rundy 16→6→0)',
    'landing_url': 'https://crm.tomekniedzwiecki.pl/sklepy/rafal-hoffa/ugniatek/',
    'nowe_wnioski': ('LL-032..037 wdrożone w trakcie przebiegu (nośniki: LEKCJE-LANDINGI, STANDARD §7e, '
                     'SEKCJA-Z-MAKIETY, sekcja-diff.py, gate-check.py). Najważniejsze: montaż markerowy '
                     'po incydencie nadpisanej ceny (LL-035); struktura plików-dowodów = kontrakt gate '
                     '(LL-036); cena_panel czyta treść [data-price] — kontrakt silnika cen żywy (LL-037). '
                     'Depozyt F8: EXEMPLARY-INDEX wiersz, TOKEN-KONTRAKT :root, RETRO.md w archiwum.')})
ps.product_meta(PROD, {'status': 'gotowy'})
print('  OK lp_finisz done 9/9 + status produktu gotowy')
print('KONIEC — F7+F8 domkniete.')
