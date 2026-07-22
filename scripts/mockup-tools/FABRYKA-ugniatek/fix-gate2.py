# -*- coding: utf-8 -*-
"""F7 runda 2: nazwy makiet = stemy panelowe; alias interakcja (plik+artefakt);
SEMANTYKA.md; kompresje df-B/st-panel/og."""
import importlib.util, io, os, shutil, sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
ARCH = r'C:\Users\tomek\Desktop\TN-Sklepy-grafiki\FABRYKA-2026-07\ugniatek'
FAB = r'c:\repos_tn\tn-crm\scripts\mockup-tools\FABRYKA-ugniatek'
os.chdir(FAB)
spec = importlib.util.spec_from_file_location('ps', r'c:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py')
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)
PROJ = 'c2af0524-3c37-4ada-9c9c-acae739a1373'
PROD = 'c5977c4d-76dd-472e-8953-d9fb12b1120b'
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'

# 1. przemianowanie makiet archiwum na stemy panelowe
mk = os.path.join(ARCH, 'makiety')
REN = {
 'ugniatek-m-hero-v2.png': '01-hero.png', 'ugniatek-m-dwie-formy.png': '02-dwie-formy.png',
 'ugniatek-m-anatomia-v2.png': '03-anatomia.png', 'ugniatek-m-sterowanie.png': '04-sterowanie.png',
 'ugniatek-m-wieczorem.png': '05-wieczorem.png',
 'ugniatek-m-hero-mobile-v2.png': '08-hero-mobile.png',
 'ugniatek-m-dwie-formy-mobile.png': '09-dwie-formy-mobile.png',
 'ugniatek-m-interakcja-dwie-formy-mobile.png': '09-dwie-formy-interakcja-mobile.png',
 'm-03-anatomia-mobile.png': '03-anatomia-mobile.png', 'm-04-sterowanie-mobile.png': '04-sterowanie-mobile.png',
 'm-05-wieczorem-mobile.png': '05-wieczorem-mobile.png', 'm-06-mid-cta-mobile.png': '06-mid-cta-mobile.png',
 'm-07-zestaw-mobile.png': '07-zestaw-mobile.png', 'm-08-zamow-mobile.png': '08-zamow-mobile.png',
 'm-09-faq-mobile.png': '09-faq-mobile.png', 'm-10-final-mobile.png': '10-final-mobile.png',
}
for old, new in REN.items():
    po = os.path.join(mk, old)
    if os.path.isfile(po):
        os.replace(po, os.path.join(mk, new))
print('OK makiety przemianowane:', sorted(os.listdir(mk)))

# 2. alias interakcja: upload + artefakt (spojnosc panel<->archiwum)
src = os.path.join(mk, '09-dwie-formy-interakcja-mobile.png')
dest = 'bud-assets/ugniatek/makiety/09-dwie-formy-interakcja-mobile.webp'
ps.storage_upload(src, dest, to_webp=True)
ps.artifact_add(PROJ, PROD, 'lp_makiety', 'makieta_mobile', PUB + dest,
                label='TOR-I dwie-formy — makieta mobile (alias interakcji, F2.4)',
                meta={'section': '02-dwie-formy', 'viewport': 'mobile', 'alias': 'interakcja'})
print('OK alias interakcja w panelu')

# 3. SEMANTYKA.md (PASS 5)
sem = '''# SEMANTYKA — PASS 5 (audyt vision krzyzowy, 22.07.2026; agent Sonnet CDP)

## Q1 PODPIS<->OBRAZ — werdykty per wystapienie
hero callout „2 uchwyty" OK · hero alt L/P OK · dwie-formy alt df-A/df-B OK ·
anatomia alt an-spod OK · anatomia 4 callouty (uchwyty/glowice/22 300 mm2/630-650 nm) OK ·
„plaski owal — 11 cm" OK · an-makro caption OK · wieczorem alty + callout + karta OK ·
mid-cta alt OK · zestaw alt flat-lay (4 elementy widoczne) + „komplet w pudelku" + „11 cm" OK ·
final alt packshot + callout „6 kulowych glowic" OK · final alt wi-biurko OK.
NAPRAWIONE po audycie:
- [MEDIUM] final alt df-A „do gornej czesci plecow" -> „do uda" (obraz pokazuje udo; alt byl
  sprzeczny z poprawnym altem tego samego pliku w dwie-formy).
- [LOW] sterowanie callout „wyswietlacz + 3 przyciski" -> „wyswietlacz + przyciski trybow"
  (obraz pokazuje 4 przyciski: power + tryb + plus/minus); FAQ „trzy przyciski" -> „przyciski".

## Q2 TOZSAMOSC PRODUKTU cross-section — OK (wszystkie ujecia)
Plaski owal, satynowy srebrno-szary, 2 uchwyty z ryflowaniem, 6 czarnych kul 2x3, centralne
pole diod, panel boczny +/-. Zgodne: hero L(video)/P, df-A/B, an-spod/profil/makro, st-panel,
wi-biurko/trening, packshot, ze-flatlay/profil, final x3. Nota: glowice czern vs ciemnoszare
= roznica oswietlenia, ten sam produkt.

## Q3 AUTENTYCZNOSC — OK
Brak sekcji opinii/UGC; zadna scena nie udaje zdjecia klienta; stopka jawnie „Zdjecia maja
charakter pogladowy".

## Q4 REALNOSC DANYCH — OK z 1 nota
Liczby spojne miedzy sekcjami i FAQ (P1-P9, 1-9, 2000 mAh, 2 h/3,5 h, 10 min, 630-650 nm,
28x16,5x11 cm, 1113 g, 10 W, 22 300 mm2, 189,00 zl) — zero sprzecznosci. Wyswietlacz „P3"
w hero/st-panel/wi-biurko/packshot/final = sensowny tryb.
NOTA SWIADOMA [LOW, zaakceptowana]: ze-profil pokazuje „88", ze-flatlay „8.8." (wzor segmentow
jak przy prezentacji wyswietlacza) — niespojnosc z P-notacja pozostalych ujec; nie-belkot,
nie-klamstwo; regeneracja 2 scen studyjnych dla samej notacji wyswietlacza = nieproporcjonalna
(decyzja: nota zamiast regen; przy ewentualnej przyszlej podmianie kadrow ustawic P3).

## Q5 OBIETNICE SEKCJI — OK
Naglowki pokryte trescia; czerwone podswietlenie jawnie „cecha konstrukcji" (FAQ), zero
claimow medycznych.

## PODSUMOWANIE
3 problemy (0 krytycznych): 1 MEDIUM naprawiony, 1 LOW naprawiony, 1 LOW zaakceptowany z nota.
Werdykt PASS. Linki prawne {{*_URL}} = placeholdery do publikacji (legal-forge, pl_prawne).
'''
io.open(os.path.join(ARCH, 'dopasowanie', 'SEMANTYKA.md'), 'w', encoding='utf-8').write(sem)
io.open(os.path.join(FAB, 'dopasowanie', 'SEMANTYKA.md'), 'w', encoding='utf-8').write(sem)
print('OK SEMANTYKA.md')

# 4. kompresje: df-B, st-panel (webp q82), og -> jpg q88
for name in ('df-B', 'st-panel'):
    src_png = os.path.join(FAB, 'assets', name + '.png')
    im = Image.open(src_png).convert('RGB')
    outw = os.path.join(FAB, 'assets', name + '.webp')
    q = 82
    while True:
        im.save(outw, 'WEBP', quality=q, method=6)
        kb = os.path.getsize(outw) // 1024
        if kb <= 118 or q <= 60:
            break
        q -= 4
    print('OK', name, kb, 'KB q', q)
    ps.storage_upload(outw, 'bud-assets/ugniatek/assets/%s.webp' % name)
    shutil.copy(outw, os.path.join(ARCH, 'assets', name + '.webp'))

og = Image.open(os.path.join(FAB, 'assets', 'og-1200x630.png')).convert('RGB')
ogj = os.path.join(FAB, 'assets', 'og-1200x630.jpg')
q = 90
while True:
    og.save(ogj, 'JPEG', quality=q, optimize=True)
    kb = os.path.getsize(ogj) // 1024
    if kb <= 118 or q <= 70:
        break
    q -= 5
print('OK og jpg', kb, 'KB q', q)
ps.storage_upload(ogj, 'bud-assets/ugniatek/assets/og-1200x630.jpg')
shutil.copy(ogj, os.path.join(ARCH, 'assets', 'og-1200x630.jpg'))
os.remove(os.path.join(ARCH, 'assets', 'og-1200x630.png'))

# meta og:image -> .jpg
IDX = r'c:\repos_tn\tn-crm\sklepy\rafal-hoffa\ugniatek\index.html'
t = io.open(IDX, encoding='utf-8').read()
t = t.replace('bud-assets/ugniatek/assets/og-1200x630.png', 'bud-assets/ugniatek/assets/og-1200x630.jpg', 1)
io.open(IDX, 'w', encoding='utf-8').write(t)
shutil.copy(IDX, os.path.join(ARCH, 'index.html'))
print('OK og:image -> jpg + archiwum odswiezone')
