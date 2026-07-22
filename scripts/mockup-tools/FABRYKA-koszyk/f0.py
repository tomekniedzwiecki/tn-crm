# -*- coding: utf-8 -*-
"""F0 (lp_dane) KOSZYK -> ODSACZEK: gallery_curated + videos_curated (werdykt kuracji),
KARTA-PRAWDY.md + PASZPORT.md (FAB + ARCH + storage), rezerwacja bud_brand_names,
product_meta slug/repo_path, krok lp_dane done (checklista VERBATIM WS)."""
import importlib.util, io, json, os, re, sys
import requests

sys.stdout.reconfigure(encoding='utf-8')
FAB = r'c:\repos_tn\tn-crm\scripts\mockup-tools\FABRYKA-koszyk'
ARCH = r'C:\Users\tomek\Desktop\TN-Sklepy-grafiki\FABRYKA-2026-07\odsaczek'
os.makedirs(ARCH, exist_ok=True)
PROJ = 'c2af0524-3c37-4ada-9c9c-acae739a1373'
PROD = 'f69d7cee-6e1e-42b1-8ccf-39afb9a47a34'   # wf2_products koszyk
TT = 'f6e948ed-6660-425e-82ea-2dabde435d36'     # bud_tt_products
ALI = '1005002491639276'
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
G = PUB + 'bud-products/' + ALI + '/'
spec = importlib.util.spec_from_file_location('ps', r'c:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py')
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)
env = io.open(r'c:\repos_tn\tn-crm\.env', encoding='utf-8-sig').read()
KEY = re.search(r'^SUPABASE_SERVICE_KEY=(.+)$', env, re.M).group(1).strip()
B = 'https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1'
H = {'apikey': KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json'}

# ---------------------------------------------------------------- 1. rezerwacja mini-marki (INSERT-or-fail)
r = requests.post(B + '/bud_brand_names', headers={**H, 'Prefer': 'return=representation'},
                  data=json.dumps({'product_id': TT, 'name': 'Odsączek', 'slug': 'odsaczek',
                                   'landing_ref': 'sklepy/rafal-hoffa/odsaczek',
                                   'user_ref': 'rafal-hoffa'}), timeout=30)
if r.status_code == 201:
    print('OK marka Odsączek zarezerwowana')
elif r.status_code == 409:
    print('!! slug odsaczek ZAJĘTY w bud_brand_names — STOP, wybierz inną nazwę'); sys.exit(1)
else:
    print('?? brand insert:', r.status_code, r.text[:200]); sys.exit(1)

# ---------------------------------------------------------------- 2. gallery_curated (kuracja z oglądu)
gallery = {
  'nota': ('Kadry realne mocne (2 packshoty studyjne + 2 sceny), ale g4/g5/g6 maja WPIECZONE '
           'napisy EN (w tym claim zdrowotny "eat healthier" = ZAKAZ) -> sceny landingu '
           'GENEROWANE multi-ref; packshoty g2/g3 = kanon wygladu i transformacji.'),
  'items': [
    {'url': G + 'g2.webp', 'keep': True, 'role': 'packshot-rozlozony', 'class': 'P',
     'klasa': 'packshot-studyjny', 'kolejnosc': 1, 'werdykt': 'KEEP',
     'powod': 'Czysty packshot na bialym: kosz rozlozony, uchwyty zlozone do gory — KANON wygladu',
     'alt_pl': 'Rozłożony stalowy koszyk Odsączek z uchwytami złożonymi do góry'},
    {'url': G + 'g3.webp', 'keep': True, 'role': 'packshot-zlozony-plasko', 'class': 'P',
     'klasa': 'packshot-studyjny', 'kolejnosc': 2, 'werdykt': 'KEEP',
     'powod': 'Packshot zlozonego na plasko dysku — KANON transformacji (USP przechowywania)',
     'alt_pl': 'Odsączek złożony na płasko w formie dysku'},
    {'url': G + 'g0.webp', 'keep': True, 'role': 'scena-wyjmowanie', 'class': 'R',
     'klasa': 'zdjecie-realne', 'kolejnosc': 3, 'werdykt': 'KEEP',
     'powod': 'Realna scena: wyjmowanie kosza z frytkami z woka, olej ocieka — material hero-ref',
     'alt_pl': 'Wyjmowanie koszyka z frytkami z woka, olej ocieka do naczynia'},
    {'url': G + 'g1.webp', 'keep': True, 'role': 'scena-smazenie', 'class': 'R',
     'klasa': 'zdjecie-realne', 'kolejnosc': 4, 'werdykt': 'KEEP',
     'powod': 'Realna scena: kosz zanurzony w woku podczas smazenia (ramiona rozlozone na boki); '
              'plyta z napisami CN — do generacji jako referencja, nie 1:1',
     'alt_pl': 'Koszyk zanurzony w woku z frytkami podczas smażenia'},
    {'url': G + 'g4.webp', 'keep': False, 'role': 'ref-ociekanie', 'class': 'R',
     'klasa': 'infografika-z-tekstem', 'werdykt': 'REJECT (tekst EN + claim zdrowotny)',
     'powod': 'Wpieczone "DRAIN OIL WHEN LIFTED / eat healthier" — claim zdrowotny ZAKAZ; '
              'kadr (kosz nad garnkiem, ociekanie) wartosciowy TYLKO jako referencja generacji'},
    {'url': G + 'g5.webp', 'keep': False, 'role': 'ref-mycie', 'class': 'R',
     'klasa': 'infografika-z-tekstem', 'werdykt': 'REJECT (tekst EN)',
     'powod': 'Wpieczone "EASY TO CLEAN" — kadr mycia zlozonego dysku pod kranem = referencja '
              'sceny mycia do generacji'},
    {'url': G + 'g6.avif', 'keep': False, 'role': 'duplikat', 'class': 'R',
     'klasa': 'duplikat-male', 'werdykt': 'REJECT', 'powod': 'Duplikat g4 w 480px'},
    {'url': PUB + 'bud-covers/7651833944396008725.jpg', 'keep': False, 'role': 'ref-tiktok',
     'class': 'R', 'klasa': 'kadr-tiktok', 'werdykt': 'REJECT',
     'powod': 'Klatka TT (nuggetsy nad oktagonalna patelnia) — chaotyczne tlo, obcy mural; referencja'},
  ]}
r = requests.patch(B + '/bud_tt_products?id=eq.' + TT, headers=H,
                   data=json.dumps({'gallery_curated': gallery}), timeout=30)
print('gallery_curated:', r.status_code)

# ---------------------------------------------------------------- 3. videos_curated — werdykt kuracji
row = requests.get(B + '/bud_tt_products?id=eq.' + TT + '&select=videos_curated', headers=H, timeout=30).json()[0]
vc = row.get('videos_curated') or {}
vc['ali_video'] = {
  'url': 'https://video.aliexpress-media.com/play/u/ae_sg_item/2211017637212/p/1/e/6/t/10301/312482555837.mp4',
  'keep': False, 'werdykt': 'REJECT do landingu / KEEP jako zrodlo funkcji',
  'gate': 'klatki 25/50/75% obejrzane 22.07 (FABRYKA-koszyk/refs-cache/frame-v*.png)',
  'powod': ('Napisy CN wpieczone przez CALY czas trwania (30 s) — nie nadaje sie na landing. '
            'POTWIERDZA funkcje: zawieszenie kosza na rancie garnka (ociek bez trzymania), '
            'dlugie uchwyty z dala od oleju, wyjmowanie calej porcji jednym ruchem.')}
vc['nota_landing'] = ('Sekcja wideo landingu = DOWNGRADE (jak ugniatek): brak czystego materialu '
                      '(TT auto_match keep=false, ali z napisami CN); ruch = hero-video Kling.')
r = requests.patch(B + '/bud_tt_products?id=eq.' + TT, headers=H,
                   data=json.dumps({'videos_curated': vc}), timeout=30)
print('videos_curated:', r.status_code)

# ---------------------------------------------------------------- 4. KARTA-PRAWDY.md
KARTA = '''# KARTA PRAWDY — ODSĄCZEK (stalowy koszyk do frytkownicy) · F0.6 · 22.07.2026

JEDYNE źródło faktów landingu (Z7). Claim bez kotwicy w tej karcie = CUT.

## Produkt
- Składany koszyk do smażenia i odsączania ze stali nierdzewnej (mini-marka **Odsączek**,
  marka parasolowa Zaradek, klient rafal-hoffa).
- Aukcja: https://pl.aliexpress.com/item/1005002491639276.html — **source=detail** (21.07,
  fetched 18:53Z), qty 989, 1 SKU, sprzedawca Startcomfortablelife2021 Store.
- TT product: f6e948ed-6660-425e-82ea-2dabde435d36 · wf2_products: f69d7cee-6e1e-42b1-8ccf-39afb9a47a34.

## Cena [KONKRET]
- **Cena PL: 29,90 zł** (wf2_products.price — kalkulacja Etapu 1, pasmo 10–15%).
- Koszt zakupu: **$6.36 = 24,09 zł** (NBP tabela A z **21.07.2026, kurs 3,7885**; zgodne
  z wf2_products.cost_purchase 24,09).

## Specs sprzedawcy 1:1 (DataHub item_detail_6, 22.07)
| pole | wartość |
|---|---|
| Brand Name | NONE (bez marki) |
| Model Number | JJ0558 |
| Type | Colanders & Strainers |
| Metal Type | **Stainless steel** [SPEC] |
| High-concerned chemical | None |
| Origin | Mainland China |

**WYMIARY: BRAK DANYCH** — sprzedawca nie podaje (properties, opis pusty, sku bez wariantów).
Opinia klienta: „Nice product but kinna small". ⛔ ZAKAZ: podawania cm/pojemności, sugerowania
„duży/pojemny", „zmieści się do każdego garnka". Dozwolone: „do garnka i woka" (pokazane).

## Destylacja tytułu: FAKT vs BEŁKOT
- „Foldable" → **FAKT** (galeria g3: składa się w płaski dysk).
- „Stainless Steel" → **FAKT** (specs Metal Type).
- „French Fries Basket" → **FAKT** (sceny g0/g1: frytki).
- „Vegetable Fruit Filter Basket" → deklaracja sprzedawcy + konstrukcja sita — dozwolone
  „działa jak durszlak: odcedzisz i opłuczesz" (kotwica: tytuł aukcji + siatka).
- „Telescopic" → **BEŁKOT** (składany harmonijkowo, nie teleskopowy — nie używać).
- „Multifunction" → używać TYLKO przez wyliczenie funkcji potwierdzonych (niżej).

## Funkcje POTWIERDZONE OBRAZEM (galeria + wideo aukcji, obejrzane 22.07)
1. Wkład do smażenia: kosz zanurzony w oleju w garnku/woku, frytki smażą się W koszu (g1, wideo).
2. Wyjmowanie CAŁEJ porcji jednym ruchem — koniec łowienia łyżką cedzakową (g0, cover TT, wideo).
3. Ociekanie nad naczyniem: uniesiony kosz ocieka do garnka (g0/g4-ref); **zawieszenie na
   rancie garnka** — korona zygzaków opiera się o krawędź, ocieka BEZ trzymania (wideo 25%).
4. Długie ramiona-uchwyty = dłonie z dala od gorącego oleju (wideo 50%; bez deklaracji cm!).
5. Mycie pod bieżącą wodą; gładka stal nie trzyma resztek (g5-ref; „łatwe mycie" OK,
   zmywarka = BRAK DANYCH — nie deklarować).
6. Płaskie przechowywanie: złożony = dysk, wchodzi do szuflady (g3; bez podawania grubości).
7. Odcedzanie/płukanie jak durszlak (tytuł + konstrukcja; ostrożna forma).

## Zakazy twarde tego produktu
- ⛔ Claimy zdrowotne: „mniej tłuszczu", „zdrowsze jedzenie", „reduce fat intake" (wpieczone
  w g4 — NIE przenosić). Dozwolone opisowo: „olej ocieka z powrotem do garnka".
- ⛔ Social-proof liczbowy: sold **7**, opinie **3** (avg 4.7) — za mało; ZERO liczb sprzedaży,
  ZERO gwiazdek, ZERO cytatów opinii (3 szt. EN, w tym 1 o niedostarczeniu).
- ⛔ Wymiary/pojemność (brak danych) · ⛔ „telescopic" · ⛔ zmywarka · ⛔ marka (NONE — bez
  wymyślania producenta).
- ⛔ Obietnice dostawy/„24h/z PL" (doktryna) · płatność: COD risk-reversal wg kanonu.

## Warianty
1 SKU (jeden rozmiar, jeden kolor — srebrna stal). Bez wyboru wariantu na landingu.

## Materiał wizualny
- KEEP: g2 (packshot rozłożony — kanon), g3 (packshot płasko — kanon USP), g0 (scena
  wyjmowania), g1 (scena smażenia). REJECT z rolą referencji: g4/g5/g6 (teksty EN), cover TT.
- Wideo aukcji 30 s: REJECT na landing (napisy CN), KEEP jako źródło funkcji.
  Sekcja wideo = DOWNGRADE; ruch strony = hero-video Kling (i2v z hero-sceny).
'''
io.open(os.path.join(FAB, 'KARTA-PRAWDY.md'), 'w', encoding='utf-8').write(KARTA)
io.open(os.path.join(ARCH, 'KARTA-PRAWDY.md'), 'w', encoding='utf-8').write(KARTA)

# ---------------------------------------------------------------- 5. PASZPORT.md
PASZPORT = '''# PASZPORT PRODUKTU — ODSĄCZEK (wierność wizualna) · 22.07.2026

Kanon wyglądu: `refs-cache/g2.png` (rozłożony, białe tło) + `refs-cache/g3.png` (złożony
dysk) + sceny realne g0/g1. Werdykt dryfu bryły ZAWSZE vs te kadry (LL-031).

## Cechy dyskryminujące (tabela kanoniczna — gate F3A liczy PASS >= K)
| cecha | wzorzec (real) |
|---|---|
| bryła | rozłożony: głęboki OKRĄGŁY kosz z drucianej siatki; złożony: PŁASKI dysk |
| siatka | pleciona siatka rombowa (diamond mesh) z cienkiego drutu — ażur, ZERO pełnych ścianek |
| korona | wieniec zygzakowatych V-drutów wokół górnej krawędzi (usztywnienie + oparcie o rant garnka) |
| uchwyty | 2 druciane ramiona z płaskim mostkiem (kształt wieszaka), spinane razem nad koszem |
| dno | koncentryczna rozeta drutów z małym okrągłym oczkiem pośrodku (wzór pajęczyny) |
| wykończenie | polerowana srebrna stal nierdzewna, drut okrągły — połysk metaliczny |

## CZEGO NIE MA (model dorabia — UBIJAĆ)
- silikonowych/kolorowych nakładek na uchwyty (całość goła stal),
- pełnego (blaszanego) dna ani pełnych ścianek,
- mechanizmu teleskopowego, zawiasów z tworzywa, blokad/zatrzasków,
- powłok kolorowych (czarny/złoty), grawerów i logotypów NA PRODUKCIE,
- pokrywki, stopek/nóżek.

## Orientacje użycia (sceny)
- Smażenie: kosz ZANURZONY w oleju w garnku/woku, ramiona rozłożone na boki LUB spięte w górze.
- Ociek: kosz UNIESIONY nad naczyniem (kapiący olej) albo ZAWIESZONY koroną na rancie.
- Przechowywanie/mycie: złożony płaski dysk.
- ⛔ NIGDY: kosz jako miska na stole z owocami „dekoracyjnie" bez kontekstu kuchni frytur/odcedzania
  (mismatch scenariusza), kosz w piekarniku/mikrofali, kosz na ogniu bez naczynia.
'''
io.open(os.path.join(FAB, 'PASZPORT.md'), 'w', encoding='utf-8').write(PASZPORT)
io.open(os.path.join(ARCH, 'PASZPORT.md'), 'w', encoding='utf-8').write(PASZPORT)
print('OK KARTA-PRAWDY + PASZPORT (FAB + ARCH)')

# upload do storage wf2-docs + artefakty doc
ps.storage_upload(os.path.join(FAB, 'KARTA-PRAWDY.md'), 'wf2-docs/odsaczek/KARTA-PRAWDY.md')
ps.storage_upload(os.path.join(FAB, 'PASZPORT.md'), 'wf2-docs/odsaczek/PASZPORT.md')
ps.artifact_add(PROJ, PROD, 'lp_dane', 'doc', PUB + 'wf2-docs/odsaczek/KARTA-PRAWDY.md',
                label='KARTA-PRAWDY.md (F0.6 — jedyne źródło faktów)', meta={'f': 'F0.6'})
ps.artifact_add(PROJ, PROD, 'lp_dane', 'doc', PUB + 'wf2-docs/odsaczek/PASZPORT.md',
                label='PASZPORT.md (wierność wizualna + CZEGO NIE MA)', meta={'f': 'F0.6'})

# ---------------------------------------------------------------- 6. product_meta + krok lp_dane
ps.product_meta(PROD, {'slug': 'odsaczek', 'repo_path': 'tn-crm/sklepy/rafal-hoffa/odsaczek/'})
CHECK = [
    {'t': 'source=detail potwierdzony (albo STOP z notą)', 'done': True},
    {'t': 'Galeria skurowana → gallery_curated (≥4 kadry keep)', 'done': True},
    {'t': 'Wideo skurowane → videos_curated (gate po klatce środkowej)', 'done': True},
    {'t': 'KARTA-PRAWDY.md gotowa (cena+NBP, specs 1:1, destylacja FAKT/BEŁKOT)', 'done': True},
    {'t': 'PASZPORT.md gotowy (elementy + „CZEGO NIE MA")', 'done': True},
    {'t': 'Liczby oznaczone [KONKRET/SPEC/BEŁKOT]', 'done': True},
    {'t': 'Slug + mini-marka zarezerwowane w bud_brand_names', 'done': True},
]
ps.step_update(PROJ, PROD, 'lp_dane', status='done', checklist=CHECK, fields={
    'source_ok': 'TAK — detail (fetched 21.07 18:53Z, qty 989)',
    'karta_url': PUB + 'wf2-docs/odsaczek/KARTA-PRAWDY.md',
    'paszport_url': PUB + 'wf2-docs/odsaczek/PASZPORT.md',
    'cena_pl': '29,90 zł (koszt $6.36 = 24,09 zł, NBP 3,7885 z 21.07)'})
print('OK lp_dane done — F0 ODSACZEK zamkniete')
