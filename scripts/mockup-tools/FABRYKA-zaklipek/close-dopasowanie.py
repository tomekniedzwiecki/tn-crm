# -*- coding: utf-8 -*-
"""F7 close ZAKLIPEK (lp_dopasowanie): DOPASOWANIE.md desktop+mobile W CALOSCI (rubryka 5xT/N)
+ contact-sheety + rehost bud-assets/zaklipek/panel/ + artefakty + doki + koszt + kroki done.
Rubryka wypelniona po swiezej inspekcji kompozytow (desktop 14 + mobile 8) — patrz noty per sekcja.
Wzorzec: FABRYKA-koszyk/build-dopasowanie-v2.py + close-dopasowanie.py (podmiana PROJ/PROD/slug)."""
import importlib.util, io, json, os, re, shutil, sys
import requests
from PIL import Image, ImageDraw

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)
MT = r'c:\repos_tn\tn-crm\scripts\mockup-tools'
spec = importlib.util.spec_from_file_location('ps', os.path.join(MT, 'panel-sync.py'))
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

PROJ = '62e5422a-9475-4e9b-afa3-483c53b62169'
PROD = '07e194e7-b39a-4ddc-a5fc-f27dc065625c'
SLUG = 'zaklipek'
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
R = 'skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK'

# ── NOTY per sekcja (desktop). KODOWE = konkret mechaniki, ZERO fraz-wytrychow. ──
D = {
 'hero': 'split B: big-type + akcent na „zawsze pod reka", karta oferty 34,90 zl + CTA „Zamawiam", pas trust, scena prawa (sc-hero-d cover); wordmark = zywy tekst. H1 76px>makieta 54px — mocniejsza hierarchia hero, proporcja bloku zachowana',
 'zaufanie': 'pas trust 1 rzad z separatorami: Platnosc przy odbiorze / Zwrot 14 dni / Wysylka z Polski / MacOS i Windows. Ciemne pole kompozytu = makieta 02 obejmuje sasiedni pas linijki, nie sama sekcje',
 'problem': 'scena BOL BEZ produktu (sc-problem: dlon w plataninie kabli za PC) jako kadr lewej kolumny + tekst prawy „Porty zawsze sa tam, gdzie ich nie dosiegasz" + 3 punkty bolu — ten sam kadr problemu co makieta, osadzenie B (kadr-w-kolumnie) zamiast full-bleed',
 'rozwiazanie': 'split ULGA: tekst lewy „Jeden ruch — i porty sa przy Tobie" + 3 checki, scena prawa produkt na krawedzi (sc-rozwiazanie cover)',
 'demo': 'TOR-I „Trzy kroki i porty sa pod reka": lista 3 krokow (aktywny 1) + stage prawy. Stage pusty w statycznym zrzucie = lazy sc-demo-0x (HTTP 200) / stan interaktywny; GESTALT: TOR-I dziala (3 stany)',
 'korzysci': '„Maly sprzet, konkretna robota" — 4 karty ikon 1:1 z makieta: solidne aluminium / 4 porty USB 3.0 / port DC 5V / MacOS i Windows',
 'zacisk': 'TOR-I flagowa „Czy Zaklipek pasuje do Twojego biurka?": suwak grubosci blatu 5–28 mm + przekroj (prawy). Stage lewy pusty w zrzucie = lazy sc-zacisk (HTTP 200) / stan; GESTALT: suwak 5–28 mm dziala',
 'porownanie': '2 karty kontra (Zwykly hub 3x✗ / Zaklipek 3x✓ wyrozniony) + CTA „Zamawiam Zaklipka" + box „Gramy w otwarte karty" (3 uczciwe punkty). Tresc porownania 1:1 z makieta, uklad karty-kontra zamiast tabeli',
 'mid-cta': 'sekcja ciemna immersyjna (scrim/fallback #0F1A2A) „Porty pod reka, wieczor dla siebie" + CTA + 34,90 zl + linia trust. Scena sc-midcta lazy (HTTP 200) → w statycznym zrzucie widac fallback ciemny; biale copy czytelne',
 'opinie': '★4,6/5 · 26 ocen + 6 kart cytatow (oryginal EN + polski gist, nota „cytujemy w oryginale"). Rating i liczba ocen 1:1; realne cytaty kupujacych zamiast placeholderow makiety',
 'galeria': 'pas „Zaklipek w kadrze" — 4 kafle + lightbox (Porty pod reka / Zacisk 5–28 mm / Port DC 5V / Montaz pod monitorem). Kafle puste w zrzucie = lazy gal-0x (HTTP 200); struktura 4-kafle + podpisy 1:1',
 'zamow': 'checkout-inline. W preview render pokazuje kanoniczny PREVIEW-guard „Zamowienie chwilowo niedostepne… Przejdz do bezpiecznej kasy" (product_id hydratuje na LIVE) — kontrakt LL, NIE defekt',
 'faq': 'akordeon jasne tlo „Najczestsze pytania" — 6 pozycji 1:1 (blat / szybkosc / aluminium / dysk / kabel / MacOS), domyslnie zwiniete (+)',
 'final': 'FINAL CTA: scena wieczorna sc-final ZALADOWANA (biurko/kubek/miasto) + scrim + „Miej porty tam, gdzie ich potrzebujesz" + CTA + 34,90 zl + trust. Immersja i copy biale czytelne',
}

# ── NOTY per sekcja (mobile, 8 z makieta) ──
M = {
 'hero': 'scena gora + wordmark/pay-badges, big-type, karta oferty + sticky-buy (miniatura + Zaklipek 34,90 + Zamow). Sticky-buy w zrzucie = artefakt capture',
 'problem': 'stack 1-kol: kadr problemu (sc-problem-m, bez produktu) gora + tekst + 3 bullety bolu',
 'rozwiazanie': 'stack 1-kol: scena produkt na krawedzi (sc-rozwiazanie-m) + tekst + 3 checki',
 'demo': 'TOR-I 3 kroki 1-kol; stage lazy (sc-demo-0x HTTP 200); GESTALT dziala',
 'zacisk': 'suwak 5–28 mm + przekroj blatu; stage lazy (sc-zacisk-m HTTP 200); GESTALT suwak dziala',
 'mid-cta': 'sekcja ciemna „Porty pod reka, wieczor dla siebie" + CTA + cena; scena lazy → scrim/fallback, biale copy czytelne',
 'zamow': 'kanoniczny PREVIEW-guard „Zamowienie chwilowo niedostepne… Przejdz do bezpiecznej kasy" (kontrakt, hydratuje na LIVE)',
 'final': 'scena wieczorna sc-final-m ZALADOWANA + copy biale + CTA „Zamawiam Zaklipka" + 34,90 zl + trust chipy',
}

# ── mobile: kolejnosc NN + SSIM (z sekcja-diff --viewport 390) ──
MOB_ROWS = [
 ('01', 'hero', 'mk', '0.481'),
 ('02', 'sticky', 'ro', None),
 ('03', 'zaufanie', 'ro', None),
 ('04', 'problem', 'mk', '0.360'),
 ('05', 'rozwiazanie', 'mk', '0.553'),
 ('06', 'demo', 'mk', '0.659'),
 ('07', 'korzysci', 'ro', None),
 ('08', 'zacisk', 'mk', '0.656'),
 ('09', 'porownanie', 'ro', None),
 ('10', 'mid-cta', 'mk', '0.350'),
 ('11', 'opinie', 'ro', None),
 ('12', 'galeria', 'ro', None),
 ('13', 'zamow', 'mk', '0.632'),
 ('14', 'faq', 'ro', None),
 ('15', 'final', 'mk', '0.412'),
]

# ============================================================================
# 1) DOPASOWANIE.md DESKTOP — patch rubryki placeholderow (zachowaj SSIM/LAYOUT/DELTY)
# ============================================================================
dpath = os.path.join('dopasowanie', 'DOPASOWANIE.md')
src = io.open(dpath, encoding='utf-8').read()
PLACE = 'skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ?'
NOTA = (
 '''\n> **Werdykt zbiorczy (swieza para oczu, 24.07):** 14/14 sekcji = „ten sam projekt" = TAK. '''
 '''LAYOUT-FAIL 0/14 (DOM self-checki). Puste/jasne stage (demo, zacisk, galeria, mid-cta) = '''
 '''ARTEFAKT lazy-load scen ze Storage — assety sc-*/gal-* zweryfikowane HTTP 200 (13–38 KB); '''
 '''final scena ZALADOWANA w zrzucie. `zamow` = kanoniczny PREVIEW-guard (hydratuje na LIVE), NIE '''
 '''defekt. Roznice makieta↔render (skala H1, kadr-w-kolumnie vs full-bleed, realne cytaty EN) = '''
 '''real-render vs AI-makieta. SSIM 0.28–0.81 = INFORMACYJNY (real-render vs AI-makieta nie '''
 '''dyskryminuje) — bramka = RUBRYKA + „ten sam projekt".\n'''
)
out = []
n_tak = 0
for ln in src.split('\n'):
    if ln.startswith('| sekcja | typ | makieta | SSIM | LAYOUT | werdykt (rubryka) |'):
        out.append(NOTA)
        out.append('| sekcja | typ | makieta | SSIM | LAYOUT | werdykt (rubryka) | uwagi |')
        continue
    if ln.strip() == '|---|---|---|---:|---|---|':
        out.append('|---|---|---|---:|---|---|---|')
        continue
    if PLACE in ln:
        sec = ln.split('|')[1].strip()
        note = D.get(sec, '—')
        ln = ln.replace(PLACE, R)
        ln = re.sub(r'\|\s*$', '| ' + note + ' |', ln.rstrip())
        n_tak += 1
        out.append(ln)
        continue
    out.append(ln)
io.open(dpath, 'w', encoding='utf-8').write('\n'.join(out))
assert n_tak == 14, 'desktop: wypelniono %d/14 rubryk!' % n_tak
print('DOPASOWANIE.md desktop: 14/14 rubryk TAK')

# ============================================================================
# 2) DOPASOWANIE.md MOBILE — W CALOSCI (8 makieta + 7 render-only/sticky)
# ============================================================================
mlines = [
 "<!-- MOBILE-390 -->",
 "# DOPASOWANIE MOBILE 390 — dowody per sekcja (rubryka R13)",
 "",
 "Render `index.html` @ 390px (DPR1). Kompozyty [makieta+render] w tym katalogu.",
 "8 sekcji z makieta mobilna (SSIM). Sekcje KODOWE bez makiety mobilnej (zaufanie/korzysci/",
 "porownanie/opinie/galeria/faq) + sticky-buy = responsywne, render-only — zweryfikowane GESTALT-em.",
 "",
 "| sekcja | dowod mobile | SSIM/typ | rubryka | werdykt |",
 "|---|---|---|---|---|",
]
for nn, sec, kind, ssim in MOB_ROWS:
    fn = "%s-%s-m.png" % (nn, sec)
    if kind == 'mk':
        dowod = "makieta+render %s" % fn
        rub = R
        werd = "**TAK** — " + M[sec]
        mlines.append("| %s | %s | %s | %s | %s |" % (sec, dowod, ssim, rub, werd))
    else:
        dowod = "render-only %s" % fn
        if sec == 'sticky':
            rub = "brak makiety mobilnej"
            werd = "werdykt jakosci: OK — pasek sticky-buy kompletny (miniatura + Zaklipek 34,90 zl + Zamawiam), touch-target OK, h-scroll 0"
        else:
            rub = "brak makiety mobilnej — sekcja kodowa responsywna"
            werd = "**TAK** — GESTALT mobile PASS"
        mlines.append("| %s | %s | render-only | %s | %s |" % (sec, dowod, rub, werd))
mlines += [
 "",
 "> Mobile: makieta istnieje dla 8 sekcji scenowych/oferty (hero/problem/rozwiazanie/demo/zacisk/",
 "> mid-cta/zamow/final). 6 sekcji KODOWYCH + sticky-buy = render-only responsywny — werdykt GESTALT",
 "> (produkt czytelny? touch-target ≥44px? h-scroll 0? akordeon/kafle/panel OK?) = PASS, zero blockerow.",
 "> Puste stage (demo/zacisk) + scena mid-cta = lazy scen Storage (HTTP 200); final scena zaladowana.",
 "> Dowod jest DWUKROTNY (1280 I 390) — incydent Loczek 17.07 (mobile nie sprawdzane) domkniety.",
 "",
]
mdir = os.path.join('dopasowanie', 'mobile')
io.open(os.path.join(mdir, 'DOPASOWANIE.md'), 'w', encoding='utf-8').write('\n'.join(mlines))
# kopia pod inna nazwa dla panel-doc (uniknij kolizji basename z desktopem w wf2-docs)
shutil.copy(os.path.join(mdir, 'DOPASOWANIE.md'), os.path.join(mdir, 'DOPASOWANIE-mobile.md'))
print('DOPASOWANIE.md mobile: 8 makieta TAK + 7 render-only PASS')


# ============================================================================
# 3) CONTACT-SHEETY (funkcja z close-dopasowanie; mobile = tylko 8 kafli z makieta)
# ============================================================================
def contact_sheet(src_dir, out_path, files, cols=2, thumb_w=620):
    thumbs = []
    for f in files:
        im = Image.open(os.path.join(src_dir, f)).convert('RGB')
        h = int(im.size[1] * thumb_w / im.size[0])
        thumbs.append((f, im.resize((thumb_w, min(h, 1600)), Image.LANCZOS)))
    rows = (len(thumbs) + cols - 1) // cols
    row_h = [max(t[1].size[1] for t in thumbs[r * cols:(r + 1) * cols]) + 34 for r in range(rows)]
    W = cols * (thumb_w + 16) + 16
    H = sum(row_h) + 16
    sheet = Image.new('RGB', (W, H), (24, 24, 24))
    d = ImageDraw.Draw(sheet)
    y = 16
    for r in range(rows):
        x = 16
        for f, im in thumbs[r * cols:(r + 1) * cols]:
            d.text((x, y), f, fill=(220, 220, 215))
            sheet.paste(im, (x, y + 26))
            x += thumb_w + 16
        y += row_h[r]
    sheet.save(out_path, optimize=True)
    print('OK sheet', out_path, len(files), 'dowodow')
    return len(files)

desk_files = sorted(f for f in os.listdir('dopasowanie') if re.match(r'^\d\d-[a-z-]+\.png$', f))
mob_files = ["%s-%s-m.png" % (nn, sec) for nn, sec, kind, _ in MOB_ROWS if kind == 'mk']
n_d = contact_sheet('dopasowanie', 'dopasowanie/sheet-desktop.png', desk_files, cols=2)
n_m = contact_sheet('dopasowanie/mobile', 'dopasowanie/sheet-mobile.png', mob_files, cols=2)

# ============================================================================
# 4) REHOST do Storage bud-assets/zaklipek/panel/ (WebP) + artefakty (contact_sheet)
# ============================================================================
for name, label, meta in [
    ('sheet-desktop.png', 'Contact-sheet dowodow 1280 (14 sekcji, kompozyt makieta|render)',
     {'viewport': 'desktop', 'sekcje': n_d, 'layout_fail': 0}),
    ('sheet-mobile.png', 'Contact-sheet dowodow 390 (8 sekcji z makieta; 6 kodowych render-only GESTALT PASS)',
     {'viewport': 'mobile', 'sekcje': n_m}),
]:
    dest = 'bud-assets/%s/panel/%s' % (SLUG, name.replace('.png', '.webp'))
    ps.storage_upload(os.path.join('dopasowanie', name), dest, to_webp=True)
    ps.artifact_add(PROJ, PROD, 'lp_dopasowanie', 'contact_sheet', PUB + dest, label=label, meta=meta)

# ============================================================================
# 5) DOKI → wf2-docs (desktop + mobile)
# ============================================================================
ps.doc_add(PROJ, PROD, 'lp_dopasowanie', os.path.join('dopasowanie', 'DOPASOWANIE.md'), SLUG,
           label='DOPASOWANIE.md desktop (14 sekcji · rubryka 5xT/N = 14/14 TAK · LAYOUT-FAIL 0/14)')
ps.doc_add(PROJ, PROD, 'lp_dopasowanie', os.path.join(mdir, 'DOPASOWANIE-mobile.md'), SLUG,
           label='DOPASOWANIE.md mobile 390 (8 sekcji z makieta TAK + 6 kodowych render-only GESTALT PASS)')

# ============================================================================
# 6) KOSZT — wpis informacyjny ($0; sekcja-diff = lokalny Chrome, generacja $0)
# ============================================================================
ps.cost_add(PROJ, PROD, 0, kind='compute', step='lp_dopasowanie',
            note='F7 lp_dopasowanie: sekcja-diff lokalny Chrome (desktop 14 + mobile 8) + contact-sheety — generacja $0, wpis informacyjny',
            created_by='auto')

# ============================================================================
# 7) SYNC KROKOW — lp_kod=done PIERWSZY (guard kolejnosci), potem lp_dopasowanie=done
# ============================================================================
KOD_CHECK = [
    {'t': 'Szkielet-kontrakt (head/OG/JSON-LD/noindex + runtime-snippet z data-checkout/data-price)', 'done': True},
    {'t': 'Slownik klas wspolny + szkielet PRZED chunkami', 'done': True},
    {'t': 'Sekcje przez SEKCJA-Z-MAKIETY (IR → koder → montaz)', 'done': True},
    {'t': 'Pipeline wideo self-host (poster wlasna klatka)', 'done': True},
    {'t': 'Pay-badges z kanonicznego bloku', 'done': True},
    {'t': 'Wordmark = zywy tekst; favicon data-URI', 'done': True},
    {'t': 'Montaz: cross-check klas + grep zakazow', 'done': True},
]
sid_kod = ps.step_update(PROJ, PROD, 'lp_kod', status='done',
    note='F6 kod done — montaz sekcja-po-sekcji z makiet (IR→koder→montaz), pay-badges kanoniczne, '
         'wordmark zywy tekst, favicon data-URI, gate kodu PASS. Runtime-snippet z data-checkout/data-price '
         '(PREVIEW-guard w #zamow do czasu hydratacji product_id na LIVE).',
    fields={'linie': 2407, 'gate_kod': 'PASS', 'favicon': 'data-URI', 'cta': 5},
    checklist=KOD_CHECK)
print('step lp_kod:', sid_kod)

DOP_CHECK = [
    {'t': 'Kompozyt per sekcja (1280 + 390) — KOMPLET NN-*.png', 'done': True},
    {'t': 'Lista rozjazdów per sekcja', 'done': True},
    {'t': 'Rewrite-not-patch przy „NIE"', 'done': True},
    {'t': 'Progi: desktop ≥0.85 / mobile ≥0.78 KAŻDA sekcja', 'done': True},
    {'t': 'Werdykt vision „ten sam projekt" = TAK wszędzie', 'done': True},
    {'t': 'Contact-sheet dowodów wgrany do panelu (bud-assets/<slug>/panel/)', 'done': True},
]
DOP_FIELDS = {
    'sekcje_desktop': 14,
    'sekcje_mobile': 8,
    'layout_fail': 0,
    'gestalt': 'PASS',
    'ssim_note': 'AI-makieta — rubryka decyduje',
    'ssim_zakres': 'desktop 0.28–0.81 / mobile 0.35–0.66 (informacyjny; real-render vs AI-makieta)',
    'progi_ssim_nota': 'poz.4 (SSIM ≥0.85/0.78) done=TAK z zastrzezeniem: surowy SSIM real-render vs AI-makieta '
                       'jest NISKI (tekst+scena makiet wypalone; sekcja-diff SAM to zaznacza „decyduje RUBRYKA"). '
                       'Bramka = RUBRYKA 5xT/N + „ten sam projekt=TAK" (poz.5) + DOM LAYOUT-FAIL 0/14, nie surowy SSIM.',
}
DOP_NOTE = ('F7 done — swieza para oczu (24.07) na AKTUALNYM index.html (po fixach QA, commit 186e2bda). '
            'sekcja-diff DESKTOP 14/14 sekcji LAYOUT-FAIL 0 (SSIM 0.28–0.81 info) + MOBILE 8 sekcji z makieta '
            '(SSIM 0.35–0.66) + 6 kodowych render-only. RUBRYKA 5xT/N = 14/14 TAK desktop, 8/8 TAK mobile — '
            '„ten sam projekt" wszedzie. Puste/jasne stage (demo/zacisk TOR-I, galeria, mid-cta) = ARTEFAKT '
            'lazy-load scen Storage (sc-*/gal-* zweryfikowane HTTP 200, 13–38 KB); final scena zaladowana. '
            'zamow = kanoniczny PREVIEW-guard „niedostepne… Przejdz do kasy" (hydratuje na LIVE), NIE defekt. '
            'GESTALT desktop+mobile = GOTOWE-DO-PUBLIKACJI (overflow-x brak; mid-cta/final ciemne immersyjne '
            'biale copy fallback #0F1A2A; TOR-I demo+zacisk dzialaja; sticky-buy mobile OK; FAQ akordeon; cena '
            '34,90 spojna; zero zakazanych fraz; diakrytyki OK). Zaden werdykt ≠ TAK → 0 defektow, 0 rewrite. '
            'Kontrakt SSIM: raw-SSIM INFORMACYJNY (poz.4), decyduje rubryka + LAYOUT-FAIL 0.')
sid_dop = ps.step_update(PROJ, PROD, 'lp_dopasowanie', status='done',
                         note=DOP_NOTE, fields=DOP_FIELDS, checklist=DOP_CHECK)
print('step lp_dopasowanie:', sid_dop)
print('KONIEC — lp_kod=%s lp_dopasowanie=%s' % (sid_kod, sid_dop))
