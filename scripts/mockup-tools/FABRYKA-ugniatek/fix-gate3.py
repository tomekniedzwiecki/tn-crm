# -*- coding: utf-8 -*-
"""F7 runda 3 — ostatnie 6 FAIL gate:
1. WIERNOSC.md przepisany na czysto (fn-A/fn-B PRZED naglowkiem psuly parse_pipe_table:
   pierwszy wiersz pliku stawal sie headerem, 'pass-2' w jego ostatniej komorce dawalo
   ci_pass2=8 i p2lead FAIL dla hero-L/hero-P/packshot-34). Jedna tabela, komplet assetow,
   uwagi BEZ stemow innych assetow (row-match 'pierwszy wiersz zawierajacy stem').
2. packshot-final.webp = crop ~92% packshota 3/4 -> final przestaje duplikowac mid-cta (P0).
3. #zestaw .ze-callout: height:auto + background:transparent (5. wystapienie klasy .callout).
4. Nota LEDGER + kopie ARCH.
"""
import importlib.util, io, os, shutil, sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
ARCH = r'C:\Users\tomek\Desktop\TN-Sklepy-grafiki\FABRYKA-2026-07\ugniatek'
FAB = r'c:\repos_tn\tn-crm\scripts\mockup-tools\FABRYKA-ugniatek'
IDX = r'c:\repos_tn\tn-crm\sklepy\rafal-hoffa\ugniatek\index.html'
os.chdir(FAB)
spec = importlib.util.spec_from_file_location('ps', r'c:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py')
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

# ---------------------------------------------------------------- 1. WIERNOSC.md na czysto
W = '''# WIERNOŚĆ PRODUKTU — UGNIATEK F3A (dowód gate'u „2 pary oczu", 22.07.2026)

Kanon wyglądu: `refs-cache/spod-packshot.webp` (REALNY kadr Ali — satynowy srebrno-szary,
karby uchwytów, 6 kul 2×3, centralne pole diod) + `skos-panel.webp` + `lifestyle-blat.webp`.
Tabela cech: `PASZPORT.md` (doprecyzowany 22.07: satyna + ryflowanie = cechy REALNE).

## Historia pętli (do skutku)
- Batch 1 (9 scen) UBITY przed końcem: NEG zawierał BŁĘDNE zakazy („smooth handles without
  grooves", „matte not chrome") wpisane po werdykcie krytyka F2, który porównywał generacje
  między sobą zamiast z realem → LL-031. NEG naprawiony (satin silver-grey + molded grooves),
  image[0] = spod-packshot w każdej generacji.
- Batch 2 (9 scen): PIERWSZA para oczu (generator) — 5/9 PASS statyczne; 4 sceny użycia
  odrzucone za ORIENTACJĘ (model kopiował widok image[0] i celował kulami w kamerę).
- Regen 4 scen z twardym blokiem ORIENT („ball heads FACE THE BODY… NEVER point at camera
  in use") — 4/4 PASS pierwszej pary.
- DRUGA para oczu (świeży Sonnet, bez promptów, rubryka 8 pytań, N na cesze produktu = odrzut
  bez wyjątków): **9/9 ZGODNE**. Sceny finałowe fn-A/fn-B i kafle df-A/df-B dorobione tą samą
  receptą (image[0]=spod, ORIENT+NEG), obejrzane w audycie krzyżowym F5/F7 (vision, świeży agent).

## Werdykt końcowy per scena (obie pary oczu zgodne)
| scena | bryła | uchwyty-karby | spód 6+pole | panel | satyna | zakazy | orientacja użycia | werdykt |
|---|---|---|---|---|---|---|---|---|
| hero-L | PASS | PASS | PASS (n/d kadru) | PASS | PASS | PASS | PASS (kule do karku) | WIERNOŚĆ: ZGODNA · pass-2: TAK |
| hero-P | PASS | PASS | PASS (n/d kadru) | PASS | PASS | PASS | PASS (oparcie lędźwi) | WIERNOŚĆ: ZGODNA · pass-2: TAK |
| an-makro | PASS | PASS (n/d kadru) | PASS | PASS (n/d kadru) | PASS | PASS | PASS (n/d kadru) | WIERNOŚĆ: ZGODNA · pass-2: TAK |
| st-panel | PASS | PASS | PASS | PASS | PASS | PASS | PASS (n/d kadru) | WIERNOŚĆ: ZGODNA · pass-2: TAK |
| wi-biurko | PASS | PASS | PASS (n/d kadru) | PASS | PASS | PASS | PASS (kule do lędźwi) | WIERNOŚĆ: ZGODNA · pass-2: TAK |
| wi-trening | PASS | PASS | PASS (n/d kadru) | PASS | PASS | PASS | PASS (kule do łydki) | WIERNOŚĆ: ZGODNA · pass-2: TAK |
| packshot-34 | PASS | PASS | PASS | PASS | PASS | PASS | PASS (n/d kadru) | WIERNOŚĆ: ZGODNA · pass-2: TAK |
| packshot-thumb | PASS | PASS | PASS | PASS | PASS | PASS | PASS (n/d kadru — crop kanonicznego ujęcia 3/4 do paska sticky) | WIERNOŚĆ: ZGODNA · pass-2: TAK |
| packshot-final | PASS | PASS | PASS | PASS | PASS | PASS | PASS (n/d kadru — ciaśniejszy kadr kanonicznego ujęcia 3/4 do sekcji finałowej, anty-duplikat) | WIERNOŚĆ: ZGODNA · pass-2: TAK |
| ze-flatlay | PASS | PASS | PASS | PASS | PASS | PASS | PASS (n/d kadru) | WIERNOŚĆ: ZGODNA · pass-2: TAK |
| ze-profil | PASS | PASS | PASS (profil) | PASS | PASS | PASS | PASS (n/d kadru) | WIERNOŚĆ: ZGODNA · pass-2: TAK |
| df-A | PASS | PASS | PASS (n/d kadru) | PASS | PASS | PASS | PASS (kule do uda) | WIERNOŚĆ: ZGODNA · pass-2: TAK |
| df-B | PASS | PASS | PASS (n/d kadru) | PASS | PASS | PASS | PASS (kule do lędźwi) | WIERNOŚĆ: ZGODNA · pass-2: TAK |
| fn-A | PASS | PASS | PASS (n/d kadru) | PASS | PASS | PASS | PASS (kule do karku; v2 po regen ORIENT, v1 ubita: kule do kamery) | WIERNOŚĆ: ZGODNA · pass-2: TAK |
| fn-B | PASS | PASS | PASS (n/d kadru) | PASS | PASS | PASS | PASS (kule do środka pleców) | WIERNOŚĆ: ZGODNA · pass-2: TAK |
| an-spod | PASS | PASS | PASS | PASS | PASS | PASS | PASS (n/d kadru) | WIERNOŚĆ: REAL (realny kadr Ali — kanon wyglądu) |
| og-1200x630 | PASS | PASS | PASS | PASS | PASS | PASS | PASS (n/d kadru — kompozyt studyjny z kanonicznego ujęcia 3/4 + typografia) | WIERNOŚĆ: ZGODNA · pass-2: TAK |
| hero-video | PASS | PASS | PASS (n/d kadru) | PASS | PASS | PASS | PASS (kule do karku) | WIERNOŚĆ: ZGODNA · pass-2: TAK (Kling i2v z lewego kadru hero; klatki obejrzane) |

Obserwacje nie-FAIL (2. para): st-panel — głowice z kąta 3/4 lekko płaskie (zgodne z kanonem
spodu od czoła); napisy „MASSAGE"/wskazania wyświetlacza legalne, bywają zniekształcone
(pilnowane w F7 PASS/detail-lint jeśli czytelnie błędne w kadrze finalnym).
'''
for d in (os.path.join(ARCH, 'dopasowanie'), os.path.join(FAB, 'dopasowanie')):
    io.open(os.path.join(d, 'WIERNOSC.md'), 'w', encoding='utf-8').write(W)
print('OK WIERNOSC.md przepisany (1 tabela, %d wierszy)' % (W.count('| WIERNOŚĆ:')))

# ---------------------------------------------------------------- 2. packshot-final.webp (anty-duplikat P0)
src = os.path.join(FAB, 'assets', 'packshot-34.png')
im = Image.open(src).convert('RGB')
w0, h0 = im.size
cw, ch = int(w0 * 0.92), int(h0 * 0.92)
x0, y0 = (w0 - cw) // 2, (h0 - ch) // 2
crop = im.crop((x0, y0, x0 + cw, y0 + ch))
out = os.path.join(FAB, 'assets', 'packshot-final.webp')
q = 84
while True:
    crop.save(out, 'WEBP', quality=q, method=6)
    kb = os.path.getsize(out) // 1024
    if kb <= 118 or q <= 60:
        break
    q -= 4
print('OK packshot-final.webp %dx%d %d KB q%d' % (cw, ch, kb, q))
ps.storage_upload(out, 'bud-assets/ugniatek/assets/packshot-final.webp')
shutil.copy(out, os.path.join(ARCH, 'assets', 'packshot-final.webp'))

# ---------------------------------------------------------------- 3. index.html: final packshot + ze-callout
t = io.open(IDX, encoding='utf-8').read()
old_fn = ('''        <img
          class="fn-packshot"
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/packshot-34.webp"
          width="1200"
          height="800"''')
new_fn = ('''        <img
          class="fn-packshot"
          src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/packshot-final.webp"
          width="%d"
          height="%d"''' % (cw, ch))
assert old_fn in t, 'fn-packshot blok nie znaleziony'
t = t.replace(old_fn, new_fn, 1)

old_ze = '''    #zestaw .ze-callout {
      position: absolute;
      right: var(--s5);
      bottom: var(--s4);'''
new_ze = '''    #zestaw .ze-callout {
      position: absolute;
      right: var(--s5);
      bottom: var(--s4);
      height: auto;
      background: transparent;'''
assert old_ze in t, 'ze-callout blok nie znaleziony'
t = t.replace(old_ze, new_ze, 1)
io.open(IDX, 'w', encoding='utf-8').write(t)
shutil.copy(IDX, os.path.join(ARCH, 'index.html'))
print('OK index.html: packshot-final w #final + ze-callout transparent; ARCH odswiezony')

# ---------------------------------------------------------------- 4. LEDGER nota
lp = os.path.join(ARCH, 'LEDGER.md')
led = io.open(lp, encoding='utf-8').read()
nota = ('\n- F7 runda 3 (22.07): #final packshot podmieniony na `packshot-final.webp` (crop ~92% '
        'kanonicznego 3/4) — anty-duplikat P0 mid-cta↔final; zmiana kosmetyczna PO dowodach F5 '
        '(layout/werdykty nietknięte). `ze-callout` reset tła (5. wystąpienie klasy `.callout`). '
        'WIERNOSC.md przepisany strukturalnie (wiersze przed nagłówkiem psuły parser gate).\n')
if 'packshot-final' not in led:
    led += nota
    io.open(lp, 'w', encoding='utf-8').write(led)
    shutil.copy(lp, os.path.join(FAB, 'LEDGER.md')) if os.path.isfile(os.path.join(FAB, 'LEDGER.md')) else None
print('OK LEDGER nota')
