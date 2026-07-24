# LEDGER — POBLASK (samochodowa taśma LED ambientowa RGB) · dziennik fabryki

Projekt wf2: `dfba24fb-70d0-4cba-ae3a-7f67b48e8413` (Tomasz Borowski) · parasol **Zmyślnik**
(zmyslnik.pl · shop_id `019f94f0-14a1-7626-8739-95aa8660698c`). Produkt `wf2_products.id =
c112eb99-075d-4993-87b6-6ef2d32e44e6` · `bud_tt_products.id = 71e8176b-de95-41aa-82d9-636ad2595c10`
· ali `1005006904591428`. Cena **39,90 zł** (DANA, kalkulacja done — NIE zmieniać).

---

## F-1 — INWENTARZ MATERIAŁU (kosztorys pracy graficznej, NIE ocena biznesu)
- **Kadry produktowe po odsiewie:** ≥2 CZYSTE (g4 siatka 64 kolorów bez tekstu · g5 realne montaże
  bez tekstu) + 3 crop (g2 app · g3 detal sterownika · g7 hero-ref) → **LEKKA faza graficzna**.
  Brak „wyłączonego" packshotu na białym → hero/packshot bazowy = crop/generacja F3 (istota =
  taśma świecąca, dobrze pokryta g4/g5/g7).
- **Opinie z treścią:** **20** (WSZYSTKIE 5★), **41 zdjęć** kupujących (realne auta) → sekcja
  opinii + sekcja „zdjęcia od kupujących" = **BUILD** (materiał obfity, zgodny z kanonem).
- **Klipy wideo DODANE:** **1** produktowy (`…1100191988031.mp4`, on-product, watermark FCCEMC →
  retusz) → sekcja `wideo` = **BUILD** (hero-video + demo). +1 TikTok (tylko ADS/wzorzec).
- **Specs PUSTE:** wymiary/waga BRAK → ⛔ zero zmyślonych mm/g. „High-concerned chemical"/„Choice" = pomiń.
- **Wniosek F-1:** strona wymaga MAŁO regeneracji (bogaty materiał realny); główna robota F3 =
  hero-scena nocna + 1–2 packshoty bazowej (1 taśma) + retusz watermarku wideo.

## F0 — DANE + KARTA + PASZPORT + KURACJA (krok `lp_dane`) — 2026-07-24
- **Gate F0:** `source='detail'` ✓ ZAUFANE; snapshot świeży (dziś, 2026-07-24T16:22Z). PASS.
- **Cena:** 39,90 zł [ODCZYT wf2_products.price]; koszt $8.30 × NBP **3,8000** (**142/A/NBP/2026,
  2026-07-24**) = **31,54 zł**; narzut ~24%, zysk 7,56 zł (prowizja 2%). ⚠️ tylko wariant bazowy
  „in 1" mieści się w marży („in 2" $13.69 ≈ 52 zł landed = strat­ny → nie oferować).
- **Mini-marka:** **„Poblask"** (slug `poblask`) — zarezerwowana w `bud_brand_names` (id
  `90ce5fe9`, product_id 71e8176b, 2026-07-24). Kandydaci wolne odrzucone: Poświatka/Klimacik/
  Poblask… („Blasik"/„Migotek"/„Świtek" ZAJĘTE). Wybrano „Poblask" (rdzeń korzyści = poświata/blask).
- **product_meta:** status `kandydat` → **`w_budowie`**; slug `poblask`.
- **Kuracja galerii:** `gallery_curated` (8 items, **5 keep**: g4/g5/g2/g3/g7). GALERIA.md.
- **Kuracja wideo:** `videos_curated` (1 item, gate PASS, on-product, watermark do retuszu). WIDEO.md.
- **Karta/Paszport/ICP:** KARTA-PRAWDY.md · PASZPORT.md · ICP-GRUPA-DOCELOWA.md gotowe.
- **ODSTĘPSTWA / UWAGI:**
  - ⚠️ **Nota tła (KANON vs produkt-nocny):** produkt = ŚWIATŁO w ciemności → sceny hero/lifestyle
    CIEMNE (kokpit nocą), ale UI/tła strony JASNE (anty-scam KANON). Rozstrzygnięte w ICP §3;
    partytura w PLAN.md/TOKENS-MAKIETY.md. To NIE ciemne tło strony.
  - ⚠️ **Over-promise guard:** bazowy = JEDNA taśma 110 cm = JEDEN łuk światła; sceny full-interior
    (g0/g7) aspiracyjne. Copy/sceny nie obiecują „całe auto obrysowane" z jednej taśmy (PASZPORT).
  - Produkt **1-funkcyjny** (ambient RGB do wnętrza; tryby: kolor/muzyka/jasność = MODY jednej
    funkcji) → MAPA-ZASTOSOWAN NIE wymagana (jak zaklipek). Różne konteksty (deska/drzwi/footwell,
    dzień/noc) = różnorodność scenografii, nie pokrycie różnych zadań.

## F1 — PLAN + PRZEWODNIK (krok `lp_plan`) — 2026-07-24
- **Motyw:** „linia światła, która rozbudza wnętrze" (poświata RGB, przemiana ciemne→klimat).
- **Partytura (5/5 osi cross-landing vs migotek/nakrecik/zaklipek):** display **Montserrat** (≠
  Fraunces/Space Grotesk/Bricolage) · akcent **#6A3DE8** electric violet (ΔE min 63,3 ≫ 15) ·
  archetyp **C** (≠ A migotek/nakrecik, ≠ B zaklipek) · tło lawendowa platyna · świat wnętrze nocą.
- **15 sekcji** (2 TOR-I: sterowanie 64 kolory+app+muzyka · montaz 1-2-3+przycinalna; sceny ANIM:
  hero/rozwiazanie/final). Anty-mismatch pełna (każda korzyść z kotwicą). Wideo + opinie/UGC = BUILD.
- **Nota tła:** UI/tła strony JASNE (KANON anty-scam), sceny (foto) CIEMNE (produkt-nocny).

## F2.5 — BRANDING + STYL-MASTER + TOKENY (krok `lp_styl_marka`) — 2026-07-24
- **Styl-master** (`brand/00-styl-master.png`): gate PASS — DNA komplet (paleta+akcent, Montserrat/
  Mulish, sygnatura „LINIA ŚWIATŁA", radius 16, 4 ikony outline ink, produkt wierny, świat nocny).
- **Favicon:** 6 kandydatów (3 metafory × 2), selektor top-1 = spark (m1-1); **VISION wybrał
  koncept LINIA ŚWIATŁA (fav-m0-0** — wiązka światła przez aperturę) jako bardziej on-brand →
  **6×T/N PASS** (32/16/metafora/flat/zero-liter/mono). ODSTĘPSTWO od skryptu udokumentowane
  (`finalize-poblask.py`). Wordmark „Poblask" z Montserrat Black (z fontu). Brand → bud-assets/poblask/brand/ (11 plików).
- **TOKENS-MAKIETY.md** spisany z planszy (KANON+PARTYTURA, :root z hexami).

## F2 — MAKIETY (krok `lp_makiety` = IN_PROGRESS, BRAMKA TOMKA) — 2026-07-24
- **30 makiet** (15 sekcji × desktop 1536×1024 + mobile 1024×1536), tor **LOKALNY gpt-image-2 HIGH**
  (`makiety/_prompts.py` + `_batch.py`; ref='prod' → /edits z `_product-ref.png`). Rehost →
  bud-assets/poblask/makiety/*.webp; artefakty makieta/makieta_mobile (meta section+viewport). KOMPLET
  par ✓ (każda sekcja desktop MA parę mobile).
- **Krytyk makiet: PASS** — archetyp C nailed (hero: scena nocna + karta oferty nachodząca), STYLE-DNA
  spójne, produkt wierny (cienka płaska taśma + sterownik USB, NIE fiber-rope/tube), EMOCJA↔PRODUKT
  (problem = ciemne wnętrze BEZ produktu), TOR-I STANY (sterowanie 3 stany, montaz 1-2-3 stacked na
  mobile), dane realne (39,90 zł, ★4,9/99 POD foldem, uczciwe minusy w porównaniu/opiniach), polskie
  znaki w kluczowych copy OK. ⛔ status IN_PROGRESS — czeka na akcept Tomka.
- **Drobne (kod F4 naprawia — live text):** część diakrytyków gubiona przez gpt-image w nagłówkach
  scen (normalne); pojedynczy artefakt „Zwrot I14 dni" na hero desktop. Makieta = wzorzec wizualny;
  F4 odtwarza treść 1:1 poprawnie.

## KOSZTY API (twarde — gpt-image-2 HIGH; Claude=abonament, nie liczony)
- styl-master: 1 · product-ref: 1 · favicony: 6 · makiety: 30 (5+10 desktop + 15 mobile) =
  **38 generacji gpt-image-2 HIGH** (F2.5+F2). 0 regeneracji (walidacja przeszła za 1. razem).
