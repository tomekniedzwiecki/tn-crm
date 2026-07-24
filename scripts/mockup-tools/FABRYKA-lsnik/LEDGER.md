# LEDGER — LŚNIK (listwa LED ambient do bagażnika) · dziennik fabryki

Slug `lsnik` · projekt wf2 `dfba24fb-70d0-4cba-ae3a-7f67b48e8413` (Tomasz Borowski) ·
produkt `fb75d66e-20a2-4040-b600-65559673f9c2` · tt `d7fbc61a-523d-44f3-af24-1616b808cba3` ·
marka parasolowa **Zmyślnik** (sklep `019f94f0-14a1-7626-8739-95aa8660698c`, zmyslnik.pl).
Cena 34,90 zł [ODCZYT] · koszt 26,83 zł · zysk/szt. 7,37 zł. x-upsert nadpisuje po każdej fazie.

## F-1 — INWENTARZ MATERIAŁU (kosztorys pracy graficznej, NIE ocena biznesu)
- **Kadry produktowe po odsiewie:** 6 keep (1 packshot-kandydat g5 + 5 lifestyle; 3 pary lifestyle+
  inset packshot). **Czystych packshotów bez tekstu: 0** (g5 wymaga CROP) → planuj **generację
  packshotu** (zwój biały + ciepły + 2-żyłowy przewód) i **hero-scen** (świecący obrys bagażnika).
- **Opinie z treścią:** 5 (4× 5★, 1× 4★). **Zdjęcia 5★: 3** (rev0 in-use biały + rev2 unboxing +
  rev1 pudełko) → sekcja „zdjęcia od kupujących" ma REALNY materiał = **BUILD**.
- **Klipy wideo dodane:** `video_url=null`; 1 TikTok źródłowy (surowy, wypalony tekst + Changan +
  tablica) → niezdatny → sekcja wideo = **blokada-tomek** (efekt dynamiczny oddany animacją hero F5).
- **Specs PUSTE** (Brand=NONE, Material=others) → ⛔ zero zmyślonych cm/kg/lumenów; konkrety (silikon,
  DC 12V, 2M/4M, biały/ciepły, auto-czujnik) mają kotwicę w OPISIE + galerii + instrukcji kupujących.
- **Wniosek F-1:** „ta strona wymaga generacji packshotu + 3–4 hero/scen (świecący bagażnik biały/
  ciepły) + retusz/crop 5 kadrów". Galeria realna wystarcza na 4–6 kafli po crop.

## F0 — DANE + KURACJA
- **Gate source:** `datahub` = ZAUFANE (PASS ✓). Snapshot świeży (2026-07-24T16:22Z, dziś).
- **Kalkulacja:** DONE (3/3) — cena 34,90, koszt 26,83 = $7.06 × NBP 3,8000 (tab. 142/A/NBP/2026,
  2026-07-24). Model ceny: sprzedajemy **2M** (biały/ciepły); **4M poza marżą** (~36,40 landed) → NIE oferować.
- **gallery_curated + videos_curated** zapisane do `bud_tt_products` (204). 6 keep / 1 odsiew (g6);
  3 zdjęcia kupujących 5★.
- **Rezerwacja mini-marki „Lśnik" / slug `lsnik`** w `bud_brand_names` (reserve-before-favicon, F0.6).
- **Dokumenty F0:** KARTA-PRAWDY · PASZPORT · galeria-kuracja/GALERIA · WIDEO · MAPA-ZASTOSOWAN · (ten) LEDGER.
- **Odstępstwa:** brak istotnych. g6 = okładka TikTok (obce marki/off-format) → ODRZUĆ. Chiński leaflet
  w rev2 = autentyczne UGC (dopuszczalne). Produkt bez marki producenta (Brand=NONE) — white-label czysty.

## F1 — PLAN + PRZEWODNIK
- **Motyw:** „świetlny obrys, który sam wita po otwarciu klapy". PRIMARY (auto-światło+wow) → hero;
  SPEKTRUM (utility+dekoracja) → `zastosowania`. HOOKS h1/h2/h3.
- **PARTYTURA:** display **Montserrat (800)** · text **Mulish** · akcent **#C21F30** (czerwień lamp
  tylnych — realny sygnał świata; amber/biały produktu nieużywalny) · tło ciepły kamień/greige
  `#F7F4EF/#EFE9E1/#E3DBCE` · sygnatura „świetlna linia obrysu" · **archetyp C** (karta nachodząca).
- **CROSS-LANDING 5/5** vs migotek(A/amber/Fraunces/krem) · nakrecik(green/Space Grotesk) ·
  zaklipek(B/azure/Bricolage): font ✓ · ΔE(min) 58,8 ✓ · archetyp C≠A ✓ · tło ✓ · świat ✓.
- **MANIFEST:** 14 sekcji build (d+m) + `wideo` = **blokada-tomek** (surowy TikTok z brandingiem).
  TOR-I: `demo` (montaż 1-2-3) + `kolor` (przełącznik biały↔ciepły, flagowa). ANIM-3: hero/rozwiązanie/final.
- **Odstępstwa:** brak. `zastosowania` = mozaika (F0.6b, 5 światów). Persona inline (brak ICP — dozwolone).

## F2.5 — BRANDING + STYL-MASTER + TOKENY
- **Styl-master** `00-styl-master.png` (local/high 1536×1024) — gate PASS (motyw↔korzyść „świetlny
  obrys", jasno, produkt wierny: silikonowy zwój + ciągły obrys, zero RGB/dot-LED). Świat = SUV
  o zmierzchu ze świecącym bagażnikiem. (Uwaga: specimen ma etykietę „IP67" na ikonie — ⛔ NIE
  cytować IP na landingu, brak spec; makiety mówią tylko „wodoodporna".)
- **brand-forge (PRODUKTOWY):** rezerwacja „Lśnik"/`lsnik` (idempotentna); 6 kandydatów (3 metafory),
  selektor @32px → TOP-1 = **fav-m1-1 (czerwona 4-ramienna iskra „gleam" = „lśnić")**. Rubryka
  **6×T/N = PASS** (32/16/metafora/flat/zero-liter/mono). Najsłabsza: cienkie ramiona iskry (mono_fill
  0,085) — rdzeń rombu czytelny. Wordmark „Lśnik" z Montserrat-Black (ś poprawne) + logo-combo(+dark)
  + brand-context. 11 plików → `bud-assets/lsnik/brand/`.
- **PARTYTURA/TOKENS-MAKIETY.md** zapisane (KANON+PARTYTURA + blok `:root`).
- **Odstępstwa:** brak.

## F2 — MAKIETY (BRAMKA TOMKA)
- Prompty: 14 sekcji build × (desktop+mobile) = **28 makiet**, tor LOKALNY gpt-image HIGH
  (`_gen.py`/`_batch.py`, ref `_product-ref.png` = zwój g5 + obrys g3). Wspólny STYLE-DNA w KAŻDYM
  prompcie. TOR-I: `demo` (stany montażu 1-2-3) + `kolor` (biały↔ciepły). „EXACTLY ONE SECTION" +
  zakazy (RGB/dot-LED/pilot/Changan/tablica). `problem` bez produktu (ref=None).
- Rehost → `bud-assets/lsnik/makiety/` (webp q82) + artefakty makieta/makieta_mobile (meta section/viewport).
- ⛔ **lp_makiety = in_progress (BRAMKA TOMKA — akcept makiet)**, NIE done.
- **Wynik:** 28/28 makiet OK (14 sekcji × d+m — komplet par). QA próbki (hero d/m, problem): archetyp C
  wykonany, wierność produktu (ciągły obrys, zero RGB/dot-LED), akcent czerwień tylko CTA, `problem`
  bez produktu. **Znany artefakt:** część big-type mobilnego zgubiła polskie diakrytyki (gpt-image) —
  kod F4 odtwarza żywy tekst z poprawnymi PL (makieta = kontrakt układu/stylu, nie źródło tekstu).
