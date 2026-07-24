# MARKA — Odkrywek (parasol) · projekt f7e2ef31-5faa-4a4c-ab96-64f66140c761

Kontrakt kroku `marka` (marka PARASOLOWA) wf2. Klient: Damian Mordalski.
Portfel (rotuje — marka POJEMNA): drapak/domek dla kota (379 zł), dziecięce
walkie-talkie z kamerą (89,90 zł), masażer do dłoni (zablokowany).
Klimat umbrelli: dom, rodzina, sprytne znaleziska.

## 1. Nazwa
**Odkrywek** (project.name i domain='odkrywek.pl' były wybrane wcześniej — nietknięte).
- **Top-3:** Odkrywek (wybrany — czyste pole kolizyjne, „każdy produkt to odkrycie")
  / Konkretek (pole zatłoczone: konkret.pro i in.) / Dogodnik.
- Shortlista + RDAP/WHOIS wykonane wcześniej — **WOLNE .pl:** konkretek, dogodnik,
  odkrywek, sprycik, perelek, zmyslnik, trafek. **ZAJĘTE:** pewniak, wygodnik,
  usprawnik, bystrzak, pomocnik, przydatnik, celnik, fajnik.
- „Odkrywek" jest pojemny (nie koduje jednego zastosowania — spełnia rubrykę nazwy
  anty-Popiołek): otwiera się na cały rotujący portfel dom/rodzina.

## 2. Tagline + opis
- **Tagline:** „Każdy produkt to małe odkrycie" — rdzeń marki: radość znajdowania
  perełek; krótki, zapamiętywalny, bez frazesów cenowych.
- **Opis (strona główna):** „Odkrywek to miejsce, w którym dobrze wybrane rzeczy do
  domu same znajdują właściciela. Przeglądamy setki produktów i wybieramy te naprawdę
  przydatne — sprytne, solidne, takie, które ułatwiają codzienność całej rodzinie.
  Zamiast przytłaczać wyborem, podajemy Ci perełki, które chce się mieć u siebie."
- **Uzasadnienie:** konkret zamiast „najlepsze produkty w najlepszych cenach";
  ciepły ton (dom/rodzina), obietnica KURACJI (wybór za klienta) — spójne z „perełka"
  = potoczne „prawdziwe znalezisko", nie luksus.

## 3. Paleta (JASNE tła — zakaz ciemnych teł sklepów)
| rola | hex | nazwa robocza |
|---|---|---|
| primary (znak, CTA) | `#E2613A` | persymona / koralowy żar |
| secondary (akcenty, „odkrycia") | `#1E7D71` | morska głębia (teal) |
| ink (tekst, wordmark) | `#3A2A24` | kakaowy brąz |
| highlight (tinty sekcji) | `#F6C98B` | ciepły piaskowy |
| tło | `#FBF4E9` | kremowa bawełna |
| muted (tekst drugorzędny, obramowania) | `#7A6A5E` | kawa z mlekiem |

**Odróżnienie od Zaradka** (granat #1F2A44 / grass-green #2F8F5B / amber #F0B441 / ecru):
Odkrywek jest **ciepło-kotwiczony** (brąz + persymona) z chłodnym akcentem teal —
zupełnie inny gestalt niż chłodny granatowo-zielony Zaradek. Świadomie NIE użyto
żółto-miodowego amberu (Zaradek), by uniknąć kolizji palet 1:1.
Kolejność podana do `brand-forge` (`#3A2A24,#1E7D71,#E2613A,#F6C98B,#FBF4E9,#7A6A5E`)
wynika z konwencji skryptu: palette[0]=ink wordmarku, palette[:3]=kolory znaku,
palette[2]=ink favicona mono. Prezentacja human-facing porządkuje wg wagi (primary=persymona).

## 4. Fonty (latin-ext, glify PL zweryfikowane fontTools)
- **Heading / wordmark: Fraunces** (Black, optical) — miękki, ciepły serif z ball-terminalami;
  „kuratorowane odkrycia / perełki", editorial-homely. Maksymalnie odróżnia się od
  geometrycznego Quicksand (Zaradek). Pełne latin-ext (ąćęłńóśźż OK; nazwa „Odkrywek" bez diakrytyków).
- **Body: Figtree** — czysty, przyjazny humanist sans; kontrast do serifowego headingu,
  wysoka czytelność, pełne latin-ext (zinstancowany do statycznego 400 z variable).
- Zweryfikowano wizualnie (podgląd wordmarku Fraunces vs Gabarito vs Bricolage) — Fraunces
  najlepiej oddaje ciepło/kurację i różni się od Zaradka.

## 5. Znak / favicon — proces (diversity-first, 2 rundy)
- Kanał: lokalny OpenAI `gpt-image-2` 1024, quality=medium (domyślne brand-forge), n=1/req.
- **Runda 1** (metafory: lupa z perełką / kompas z iskrą / skrzynka z promieniem):
  5/6 kandydatów odrzuconych twardo za >5 kolorów (cieniowanie/tinty); ostał się tylko
  kompas m1-0 (mono 0.123). **FAIL rubryki:** @16px kompas rozpadał się w cienki pierścień
  (Q2), słaby mono (Q6), metafora generyczno-eksploracyjna. → regeneracja z zaostrzeniem.
- **Runda 2** (metafory: iskra odkrycia / perełka-klejnot z iskrą / dom z iskrą; charakter
  dociśnięty na „jeden pełny kolor, bold, czytelny @16px, bez cienkich linii"):
  wszystkie 6 przeszły selektor (0 odrzuceń). Finaliści z RÓŻNYCH konceptów:
  - m0-0 iskra (mono 0.201) — główna gwiazda trzyma @16, ale mała iskra-towarzysz zlewa się;
    sparkle bywa trendowo-generyczny (Q3 słabe).
  - m1-x perełka z iskrą (mono 0.296–0.32) — wewnętrzna iskra (negatyw) ZNIKA @16 → blob.
  - **m2-0 dom z iskrą (mono 0.306)** — sylwetka domu + gwiazda-wycięcie trzymają się @16;
    najlepsza czytelność i mono; metafora „znalezisko/odkrycie DO DOMU" trafia w rdzeń umbrelli.
- **Decyzja:** wybór VISION = **m2-0**, nadpisujący skryptowy top-1 (m0-0 iskra).
  Deliverables odbudowane z m2-0 przez `finalize-odkrywek.py` (reużycie funkcji brand-forge,
  bez nowej generacji), re-upload upsert do Storage.

## 6. Rubryka werdyktu marki 6×T/N — zwycięzca m2-0 (dom z iskrą)
1. Czytelny @32px? **T** — dom + wycięcie-gwiazda wyraźne.
2. Czytelny @16px (oba tła, brand-context)? **T** — sylwetka domu trzyma na jasnym i ciemnym
   (persymona czytelna na czerni; nie znika jak near-black).
3. Metafora oddaje nazwę/korzyść (nie clipart)? **T** — dom (dla domu/rodziny) + iskra (odkrycie).
4. Flat 1–2 kolory, zero gradientu/3D/cienia? **T** — jednolita persymona.
5. Zero liter/cyfr/tekstu? **T**.
6. Sylwetka czytelna w mono (favicon-mono.png)? **T** — czysty brązowy dom z iskrą.
=> **6×T PASS.**
**Najsłabsza rzecz (wymuszona krytyka):** sylwetka domu w oderwaniu od wordmarku może
w pierwszym rzucie sugerować kategorię „dom/nieruchomości"; jednoznaczna staje się z
iskrą-odkryciem i podpisem „Odkrywek". Do obserwacji przy pl_branding.

## 7. Deliverables (Storage: bud-assets/parasol-odkrywek/brand/)
favicon-512/256/32/16/mono.png · wordmark(+dark).png · logo-combo(+dark).png ·
brand-context.png (DOWÓD @16/32/64 jasne+ciemne + lockupy) · brand.json · upload-urls.json.
- logo_url = …/logo-combo.png · favicon_url = …/favicon-256.png

## 8. Zapis (persystencja)
- `wf2_projects`: tagline, brand_opis, palette, fonts, logo_url, favicon_url (name/domain NIETKNIĘTE).
- `wf2_artifacts` (kind='brand', product_id NULL): brand-context (DOWÓD, meta werdykt),
  favicon-512, logo-combo.
- `wf2_costs`: kind='gpt-image', step='marka', amount 2,0 zł (2 rundy × 6 = 12 generacji gpt-image-2 1024).
- `wf2_steps` marka: status=done + fields + checklista 9/9 + nota (top-3).
