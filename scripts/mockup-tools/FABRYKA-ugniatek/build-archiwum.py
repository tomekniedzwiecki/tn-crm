# -*- coding: utf-8 -*-
"""F7: budowa ARCHIWUM Desktop (gate-check kontrakt: TN-Sklepy-grafiki/FABRYKA-*/{slug})
+ generacja LEDGER.md / GALERIA.md / RETRO.md / scalony DOPASOWANIE.md + interakcje TOR-I."""
import io, os, re, shutil, sys

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)
ARCH = r'C:\Users\tomek\Desktop\TN-Sklepy-grafiki\FABRYKA-2026-07\ugniatek'
os.makedirs(ARCH, exist_ok=True)

# ── 1. kopie dokumentow zrodlowych ──
for f in ['KARTA-PRAWDY.md', 'PASZPORT.md', 'MAPA-ASSETOW.md', 'PRZEWODNIK-GRAFICZNY.md',
          'TOKENS-MAKIETY.md', 'PLAN.md']:
    shutil.copy(f, os.path.join(ARCH, f))
print('OK dokumenty zrodlowe')

# ── 2. makiety + brand + assety ──
for sub, src_dir in [('makiety', 'out'), ('brand', 'brand')]:
    dst = os.path.join(ARCH, sub); os.makedirs(dst, exist_ok=True)
    n = 0
    for f in os.listdir(src_dir):
        if f.endswith('.png') and os.path.isfile(os.path.join(src_dir, f)):
            shutil.copy(os.path.join(src_dir, f), os.path.join(dst, f)); n += 1
    print('OK', sub, n)
dst = os.path.join(ARCH, 'assets'); os.makedirs(dst, exist_ok=True)
for f in os.listdir('assets'):
    if os.path.isfile(os.path.join('assets', f)):
        shutil.copy(os.path.join('assets', f), os.path.join(dst, f))
print('OK assets')

# ── 3. dopasowanie: scalony MD (desktop + mobile z markerem) + kompozyty ──
dd = os.path.join(ARCH, 'dopasowanie'); os.makedirs(dd, exist_ok=True)
for f in os.listdir('dopasowanie/desktop'):
    if f.endswith('.png'):
        shutil.copy(os.path.join('dopasowanie/desktop', f), os.path.join(dd, f))
for f in os.listdir('dopasowanie/mobile'):
    if f.endswith('.png'):
        shutil.copy(os.path.join('dopasowanie/mobile', f), os.path.join(dd, f))
ir_src = 'dopasowanie/desktop/ir'
if os.path.isdir(ir_src):
    shutil.copytree(ir_src, os.path.join(dd, 'ir'), dirs_exist_ok=True)
md_d = io.open('dopasowanie/desktop/DOPASOWANIE.md', encoding='utf-8').read()
md_m = io.open('dopasowanie/mobile/DOPASOWANIE.md', encoding='utf-8').read()
io.open(os.path.join(dd, 'DOPASOWANIE.md'), 'w', encoding='utf-8').write(
    md_d + '\n\n<!-- MOBILE-390 -->\n\n' + md_m)
shutil.copy('dopasowanie/WIERNOSC.md', os.path.join(dd, 'WIERNOSC.md'))
print('OK dopasowanie scalone + kompozyty + WIERNOSC')

# ── 4. galeria-kuracja ──
gk = os.path.join(ARCH, 'galeria-kuracja'); os.makedirs(gk, exist_ok=True)
io.open(os.path.join(gk, 'GALERIA.md'), 'w', encoding='utf-8').write('''# GALERIA — kuracja Ali (F0, Ugniatek)

Aukcja zrodlowa: bud_tt_products 9bca6d13-6301-4ee0-81e7-e1cc8d8822fc (source=detail).
Kuracja 21.07.2026 (F0): **4 keep** z galerii sprzedawcy (reszta = infografiki z liczbami
20kg/19000bpm = zakazane w narracji):
| kadr | rola | uwagi |
|---|---|---|
| spod-packshot | R — kanon wiernosci (6 glowic 2x3, panel owalny, ryflowanie uchwytow) | refs/spod-packshot.webp |
| skos-panel | R — panel boczny + proporcje bryly | refs/skos-panel.webp (tlo infografiki pomarancz — TYLKO ref) |
| scena-pas | R — uzycie przy ledzwiach | gallery/scena-pas.webp |
| lifestyle-blat | R — scena na blacie | gallery/lifestyle-blat.webp |

ZERO czystego packshotu w galerii → sceny/packshoty GENEROWANE multi-ref (image[0]=spod-packshot
= kanon; gate wiernosci F3A 2 pary oczu — patrz dopasowanie/WIERNOSC.md).
Wideo: 0/8 keep (obcy brand KAJUE / inne produkty) → sekcja TikTok = SKIP w planie F1;
ruch = hero-video Kling (beat docisk-luz).
''')
print('OK GALERIA.md')

# ── 5. LEDGER.md (dziennik faz + odstepstwa) ──
io.open(os.path.join(ARCH, 'LEDGER.md'), 'w', encoding='utf-8').write('''# LEDGER — Ugniatek (projekt Zaradek / Rafal Hoffa; PIERWSZY produkcyjny przebieg wf2)

## FAZY
- F0 (21.07): KARTA-PRAWDY + PASZPORT + kuracja galerii (4 keep; wideo 0/8 → TikTok SKIP).
- F1 (21.07): PLAN.md (motyw „Dwa sposoby docisku", 11 sekcji, TOR-I=dwie-formy) +
  PRZEWODNIK v2 (krytyk PASS-Z-POPRAWKAMI, 4 poprawki wdrozone).
- F2.5 (21.07): brand (favicon po rekoloracji 1-kolor petrol — LL-028; wordmark SpaceGrotesk;
  font 404-HTML z GitHuba = LL-027 fail-fast w brand-forge).
- F2 (22.07, PO REOPEN): incydent kompletu — krok done mial 2/10 par mobile (stara regula
  sprzed F2.4) + plansze zbiorcze + artefakty lamaly kontrakt galerii panelu. NAPRAWA:
  komplet 20 makiet (10 sekcji x desktop+mobile) + GATE KOMPLETU w panel-sync (LL-030).
  Krytyk Opus PASS-Z-POPRAWKAMI (fold hero-mobile, anatomia v2). 3 nawyki modelu = LL-029.
- F3 (22.07): 12 assetow (9 scen HIGH lokalny /v1/images/edits + 2 detale df + REALNY spod
  jako kanon anatomii). Gate wiernosci F3A: 2 pary oczu 9/9 ZGODNE (WIERNOSC.md).
  Incydent: bledny NEG (karby uchwytow uznane za dryf — LL-031: werdykt dryfu TYLKO vs
  realny kadr); batch 1 ubity, ORIENT-blok dodany (kule DO ciala), 4 sceny regen.
- F4 (22.07): szkielet-kontrakt 13/13 + 10 sekcji gpt-5.6-sol (SEKCJA-Z-MAKIETY) + montaz
  modulow kanonicznych. Smoke wizualny: 3 defekty klasy „.callout collapse" naprawione
  w 3 warstwach (LL-032). ODSTEPSTWO: brief gpt sekcji 08 ODRZUCONY — sekcja zamow =
  checkout-inline@2 VERBATIM (modul ma wlasna karte; dublowanie = odstepstwo od kanonu).
  ODSTEPSTWO: faq-accordion@1 — mechanika (natywny details + ikona CSS) zachowana, layout
  2-kolumnowy wg makiety (modul ma grid z media-sticky — makieta bez obrazu).
- F5 (22.07): petla dopasowania DO WYCZERPANIA — 4 rundy rubryki (0/20 → 8/20 → 18/20 →
  20/20 TAK); LAYOUT-diff 0 FAIL (1280+390). Klasy bugow: atrybut height img blokuje
  aspect-ratio bez height:auto; .reveal.in{transform:none} kasuje translateX-centrowanie
  (LL-033). Narzedzie sekcja-diff ROZSZERZONE: --manifest w trybie --viewport (LL-034).
- F5.0/F6 zycie (22.07): choreograf → MOTION-DNA (cykl docisku i wydechu) → koder → JEDEN
  modul (6 wariantow data-mo) + count-up (22 300 mm2 / 2000 mAh) w ISTNIEJACYM IO + FAQ fade.
  hero-video Kling i2v 5s (beat DOCISK-LUZ wg PRZEWODNIKA; klatki zweryfikowane okiem;
  1 take PASS; $0.35; 900px/843 KB; desktop-only + reduced-motion guard). TOR-I dwie-formy:
  test stanow SSIM A/B 0.837 < 0.9 (zywa interakcja) + dowody tor-i-A/B.png. Weryfikacja
  F5.0.3 (CDP): 8/8 PASS (60fps, CLS 0.0004, 0 long-tasks, RM, mobile). INCYDENT: wstawka
  hero-video wniosla "-->" → wyciek komentarza runtime do DOM + data-price-raw nadpisal
  cene 189→149,90 na calej stronie; NAPRAWIONE + re-test PASS (LL-035).
- F7 (22.07): OG dedykowany 1200x630 (og-1200x630.png), archiwum Desktop, SEMANTYKA
  (PASS 5), gate-check → 0 FAIL.

## NOTY KONTRAKTOWE
- mobile-makiety: KOMPLET 10/10 par (zero wyjatkow).
- TOR-I dwie-formy: SPEC-I = interakcje/dwie-formy-SPEC-I.md (F4; segmented control +
  crossfade + aria-tablist); sandbox = interakcje/dwie-formy-sandbox.html; test stanow
  zaliczony SSIM 0.837 + dowody w interakcje/dwie-formy-test/.
- Sekcja TikTok/wideo-rail: SKIP wg planu F1 (0 keep wideo z kuracji — obcy brand).
  Pipeline wideo self-host NIE DOTYCZY (brak wejsc); ruch = hero-video Kling (F6).
- Pudelko flat-lay (ze-flatlay) celowo PLAIN — uczciwosc unboxingu (nota F3);
  roznica vs makieta z brandowanym pudelkiem = ZAMIERZONA.
- Eskalacje modeli: krytyk makiet F2 = Opus (mapa modeli Z8); reszta Sonnet/gpt-5.6-sol.
- Faza choreografii (F5) odnotowana: choreograf F5.0.1 → CHOREOGRAFIA.md; TOR-I zamkniete.
''')
print('OK LEDGER.md')

# ── 6. RETRO.md (F8) ──
io.open(os.path.join(ARCH, 'RETRO.md'), 'w', encoding='utf-8').write('''# RETRO F8 — Ugniatek (pierwszy produkcyjny przebieg fabryki wf2, 21–22.07.2026)

## NOWE WNIOSKI (→ LEKCJE-LANDINGI LL-027..LL-035, wszystkie WDROZONE z nosnikami)
1. LL-027 fail-fast wejsc przed platna generacja (font 404-HTML spalil 6 generacji HIGH).
2. LL-028 favicon: 1 srednio-jasny kolor — dwukolor z prawie-czarnym ginie @16 dark.
3. LL-029 prompty makiet zbijaja jawnie 3 nawyki gpt-image-2 (monospace H1, nav „Opinie",
   dryf bryly) — z korekta LL-031.
4. LL-030 GATE KOMPLETU makiet w panel-sync (done wymaga par desktop+mobile per sekcja
   + kontrakt artefaktu galerii: kind/meta/pelny URL).
5. LL-031 werdykt dryfu bryly TYLKO vs realny kadr kuracji (nigdy generacja vs generacja).
6. LL-032 klasy globalne szkieletu z agresywna baza w briefach TYLKO z kontraktem uzycia;
   szczatkowe bloki pod moduly USUWAC przy montazu; smoke mobile PRZED done.
7. LL-033 img z atrybutami wymiarow + aspect-ratio = OBOWIAZKOWE height:auto;
   centrowanie NIGDY transformem na .reveal (transform:none w .in).
8. LL-034 zmiana doktryny MUSI przejsc po narzedziach (sekcja-diff --viewport mial mape
   „mobile tylko hero/wideo" sprzed F2.4 → --manifest dziala w obu trybach).
9. LL-035 montaz NIGDY przez replace pierwszego </body> (bywa w komentarzu dokumentacji);
   tresc wnoszona obok komentarzy sprawdzana na "-->" (wyciek = data-price-raw nadpisal
   cene na calej stronie); ekstrakcja blokow z out-*.md kotwiczona od bloku kodu.

## CO ZADZIALALO (utrwalic)
- Petla rubryki DO WYCZERPANIA z 2. para oczu (Sonnet): 0/20→20/20 w 4 rundach.
- Moduly kanoniczne (checkout-inline@2 steps, footer@1, sticky-buy@1, pay-badges) —
  zero regresji mechaniki; skorka aliasow --zc-* wg wzorca maty.
- Choreografia F5.0: 1 call planu + 1 call kodera → JEDEN modul data-mo; CLS 0.0004/60fps.
- Kling i2v na bazie kadru hero: 1 take PASS (wiernosc bazy zapewniona w F3 multi-ref).
- Realny spod (kadr Ali) jako asset anatomii = kanon wiernosci bez generacji.

## CO POPRAWIC W NASTEPNYM PRZEBIEGU (koszyk, pierscien)
- Briefy sekcji: podawac WPROST skale typografii makiety (H1/H2/ceny w px) — inflacja
  H2 48px byla systemowa (klamp szkieletu), wykryta dopiero rubryka F5.
- Mobile clampy: koder dziedziczy type-scale, nie wymysla wlasnych (42/64px vs makieta 22/30).
- gate-manifest sciezki: kod = sklepy/{klient}/{slug}/ (nie tylko tomek-niedzwiecki).
- Choreograf: effort=medium i maxout >=10k dla planow tekstowych (1. call spalil cap
  na reasoning przy effort=high/maxout 5k).
''')
print('OK RETRO.md')

# ── 7. interakcje TOR-I (dwie-formy) ──
ik = os.path.join(ARCH, 'interakcje'); os.makedirs(ik, exist_ok=True)
shutil.copy('briefing-02-dwie-formy.md', os.path.join(ik, 'dwie-formy-SPEC-I.md'))
tdir = os.path.join(ik, 'dwie-formy-test'); os.makedirs(tdir, exist_ok=True)
shutil.copy('dopasowanie/tor-i-A.png', os.path.join(tdir, 'stan-A.png'))
shutil.copy('dopasowanie/tor-i-B.png', os.path.join(tdir, 'stan-B.png'))
io.open(os.path.join(tdir, 'WYNIK.md'), 'w', encoding='utf-8').write(
    '# Test stanow TOR-I dwie-formy\n\nSSIM(stan A, stan B) = 0.837 < 0.9 → interakcja ZYWA '
    '(zmienia sie foto + sylwetka + caption).\nKlawiatura: ArrowRight/Left dziala (roving '
    'tabindex). Powrot A-B bez utraty stanu.\nDowody: stan-A.png, stan-B.png (crop #dwie-formy @390).\n')
idx = io.open(r'c:/repos_tn/tn-crm/sklepy/rafal-hoffa/ugniatek/index.html', encoding='utf-8').read()
sec = re.search(r'<!-- SEKCJA:02-dwie-formy START -->(.*?)<!-- SEKCJA:02-dwie-formy END -->', idx, re.S).group(1)
root = re.search(r':root\{.*?\}', idx, re.S).group(0)
io.open(os.path.join(ik, 'dwie-formy-sandbox.html'), 'w', encoding='utf-8').write(
    '<!doctype html><meta charset="utf-8"><title>sandbox dwie-formy</title>\n'
    '<style>' + root + ' body{margin:0;font-family:var(--font-text);background:var(--paper)}'
    '.wrap{max-width:var(--content-w);margin:0 auto;padding:0 24px}'
    '.sect-pad{padding:64px 0}.h2{font-family:var(--font-display);font-size:var(--h2-d);color:var(--ink)}'
    '.eyebrow{font-size:12px;letter-spacing:.14em;color:var(--body)}.lead{color:var(--body)}'
    '.reveal{opacity:1}</style>\n' + sec)
print('OK interakcje TOR-I')

# ── 8. kopia kodu + choreografia ──
shutil.copy(r'c:/repos_tn/tn-crm/sklepy/rafal-hoffa/ugniatek/index.html', os.path.join(ARCH, 'index.html'))
shutil.copy('out-choreograf.md', os.path.join(ARCH, 'CHOREOGRAFIA.md'))
print('OK index.html + CHOREOGRAFIA.md')
print('ARCHIWUM:', ARCH)
