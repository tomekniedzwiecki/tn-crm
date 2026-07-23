# LEDGER — Rozgrzewek (Ulepszek) · projekt wf2 `448f2395` · produkt wf2 `4404200a` · TT `5e1d40a8`

## F0 (22.07)
- **Gate `source='detail'` PASS** (snapshot fetched 2026-07-21). Kuracja galerii: keep **TYLKO g0**
  (packshot); g1/g3/g4/g5 = infografiki z wypalonym tekstem EN (DANE); **g2 = ODRZUT** (claimy medyczne:
  ból pleców/karku/menstruacyjny — ZAKAZ). Sekcja galerii z detail sama się nie zepnie (1<4) → fallback
  CROP g0 + UGC z opinii + sceny natywne (GALERIA.md).
- **KOREKTA CENY (lekcja Merach) — WYKONANA:**
  - Stary `cost_purchase` 65,23 zł = policzony z **teasera/najtańszego SKU WHITE $17.19** (== `price.sale`).
  - `sku_prices`: WHITE $17.19 · Blue $17.74 · GRAY $18.65 · **Ivory $19.03 (MAX)**.
  - Baza marży = MAX = Ivory **$19.03** (GALERIA-ALI §5). Kurs NBP 3,7945 → koszt **72,21 zł** (+11%).
  - Diff vs 65,23 = **10,7% > 5% → rekalkulacja**: `panel-sync.py kalkulacja … --cost-usd 19.03 --force
    --no-refresh` → **cena 74,90 → 84,90 zł**, narzut **15%**, zysk **10,99 zł/szt.** (przy 74,90 zł realny
    narzut był tylko 2% / 1,19 zł — poza pasmem 10–15%).
  - Zapisy: `wf2_products` (cost_purchase, price, price_ladder, margin_mode) + `wf2_notes` id `1fae763d`
    (author=fabryka, tag=info). Nota + korekta udokumentowane.
- **Wariant do sprzedaży (rekomendacja F1): GRANATOWY (Blue)** — jedyny z pełnym dowodem wizualnym
  (g0 główny + wszystkie infografiki granatowe); biały/kość/szary mają tylko miniaturę z góry w g0
  → ryzyko niezgodności. Cena bez zmian niezależnie od koloru (baza = MAX SKU).
- **DECYZJA MARKI — kandydaci (USP-first, PL, ciepła, jednowyrazowa):**
  1. **Rozgrzewek** ⭐ — od „rozgrzewać/podgrzewany"; koduje USP grzania, ciepły i dojrzały ton,
     bezpieczny (ciepło = zero claimu medycznego), szerokie spektrum (masaż całego ciała). **WYBRANY.**
  2. Gładzik — od „gładzić" (gua sha); ale koliduje ze słowem pospolitym (gładzik = paca tynkarska).
  3. Rozluźnik — od „rozluźniać mięśnie"; dobry, lecz „Roz-" echo z Rozmrozikiem + lekko funkcjonalny.
  4. Głaskun — od „głaskać"; ciepły/self-care, ale czyta się trochę „zwierzęco".
  5. Ciepłuś — od „ciepło"; distinct i cieplutki, ale końcówka „-uś" bywa zbyt dziecinna dla ICP dorosłej.
  - Uzasadnienie zwycięzcy: najmocniej trafia w PRIMARY kryteria zlecenia (USP=podgrzewanie, korzyść,
    ciepły ton, 1 słowo, PL) i jest **najbezpieczniejszy prawnie** (ciepło ≠ obietnica lecznicza).
    Rozważony minus: prefiks „Roz-" jak w siostrzanym Rozmroziku (ta sama półka Ulepszek) — uznany za
    drobny (inny drugi człon i znaczenie; anti-clone gate `cross_landing` dotyczy warstwy WIZUALNEJ,
    nie nazwy). Wszystkie 5 kandydatek wolne w `bud_brand_names`.
  - **Rezerwacja:** `bud_brand_names` id `2ff78b6f` (name=Rozgrzewek, slug=rozgrzewek,
    product_id=TT `5e1d40a8` [FK po TT-id, nie wf2-id], landing_ref=ulepszek, user_ref=fabryka).
  - **`wf2_products.slug` = `rozgrzewek`** (PATCH done).
- **Koszt F0: $0** (kuracja + korekta bez generacji obrazów).

## Artefakty F0 (FABRYKA-masazer/)
KARTA-PRAWDY.md · PASZPORT.md · GALERIA.md · ICP-GRUPA-DOCELOWA.md · LEDGER.md · galeria/g0–g5.webp
(pobrane i obejrzane). Do zrobienia w kroku sync: `panel-sync.py doc … --slug rozgrzewek` (bucket
wf2-docs) — poza zakresem tego zadania F0.

## F1 + F1.7 (23.07)
- **Autorstwo:** PLAN.md = **gpt-5.6-sol** (kompletny, bez urwania) · PRZEWODNIK-GRAFICZNY.md = **Opus**.
- **Krytyk:** **Opus — PASS-Z-POPRAWKAMI** (9 poprawek do wdrożenia przed budową).
- **9 poprawek wdrożonych** (PLAN + PRZEWODNIK):
  1. hero: packshot mobile zcapowany do **≤44–48%** wys. pola + twarda reguła „cena 84,90 zł + CTA w pierwszym ekranie mobile (fold), z zapasem od dolnej krawędzi".
  2. PRZEWODNIK §7 NEG wspólny: dopisane `no pink/magenta/rose variant, no champagne/ivory-gold variant` (g0 pokazuje magenta główkę innego wariantu).
  3. `zdjecia-kupujacych`: **bramka ≥2 klatki UGC granatowe** po vision-gate, inaczej SKIP bez placeholdera; nie zakładać 3 z góry (PLAN sekcja + tabela G-UGC + PRZEWODNIK card).
  4. `moment`: werbalny **hak napięcia** na wejściu body („Spięte barki i kark po dniu przy biurku znają to uczucie.") — kodowo, bez nowej sceny, bez grymasu bólu.
  5. scena obszarów **-BELLY → -THIGH (uda)**; label „Brzuch"→„Uda", enumeracje (hero ?h=3, moment, obszary) brzuch→uda, seed/NEG na uda (anty-cellulit/wyszczuplanie).
  6. `glowica`: warunek — przed wypaleniem cyfry **„21"** zweryfikować 21 policzalnych kulek w cropie g0; inaczej złagodzić do „stalowe kulki w koncentrycznych pierścieniach" bez liczby.
  7. PRZEWODNIK paleta: zdanie **anty-dryf tła** — #FAF3EF ma być różowo-ciepłe (muszla/brzoskwinia), NIGDY żółtawy len (odsaczek) ani pudrowy róż (skrolik).
  8. `autonomia`: timer ujednolicony na **„ok. 30 min"** (spójność z [OPIS]; poprawiona też reguła RYZYKA, która wcześniej wymuszała dokładny timer).
  9. trust-pill **„COD przy odbiorze" → „Płatność przy odbiorze"**; wszystkie COD w copy widocznym dla klienta → „płatność przy odbiorze" (skrót COD zostaje tylko w notach wykonawczych: Kotwice/FUNKCJE/KONCEPCJA).
- **Decyzja poprawki 5:** wybrano **-THIGH (uda)**, bo PASZPORT MODEL UŻYCIA jawnie wymienia „uda" wśród Obszary (spec Application=BODY; obszary z g2/g4) → jest dowód; brzuch niósł ryzyko ramki wyszczuplania/„waist-pinching" (własny ciężki NEG), uda są neutralniejszym obszarem masażu przy pozycjonowaniu gua-sha/relaks.
- **Decyzje trwałe:** wariant **wyłącznie granatowy Blue** · **wideo SKIP** (gate pobieralności/jakości/praw) · **UGC z bramką ≥2 klatki granatowe**, inaczej SKIP sekcji.

## F2.5 brand (23.07)
- **Font:** Fraunces variable (roman+italic) z Google Fonts → instancje statyczne fonttools
  (Bold 700 / SemiBold 600 / Italic-SemiBold 600; opsz=144, SOFT=50, WONK=0; PL diakrytyki OK)
  → scratchpad/fonts/.
- **Incydent wywołania:** 1. run z product_id **wf2** (4404200a) = KOLIZJA z pustą listą —
  `--product-id` brand-forge to **bud_tt_products.id** (radar: 5e1d40a8); rezerwacja z F0
  wisiała na 5e1d40a8. Popr. wywołanie → idempotencja OK (wpis 2ff78b6f bez zmian).
- **Przebieg 1 (6 kandydatów, 3 metafory):** WSZYSCY odrzuceni twardo przez selektor @32px
  (za dużo kolorów 6>5; znak za mały fill 0.26). **Przebieg 2 z zaostrzeniem** (flat, max 3
  kolory, jeden duży kształt, 2 metafory): 6 kandydatów → top-2 z konceptu „pojedyncza
  miękka fala ciepła".
- **WERDYKT rubryką 6×T/N: fav-m1-0 („fala ciepła" — płomyk z zawinięciem) = 6×T PASS.**
  Najsłabsze (wymuszona krytyka): przy szybkim zerknięciu skojarzenie z cyfrą „6";
  na czerni indygo traci nieco kontrastu @16px. fav-m1-1 ODRZUCONY — sylwetka zbyt
  bliska literze „S" (pyt. 5).
- Deliverables (favicon 512/256/32/16 + mono, wordmark z Fraunces-Bold — font, nie
  gpt-image; lockupy jasny/ciemny, brand-context @16/32/64) → **bud-assets/rozgrzewek/brand/**
  (11 plików). Kanał generacji: edge (wf2-gen).

## F2 makiety + krytyk (23.07)
- **Styl-master 1 iteracja PASS** → 00-styl-master.webp (brand/). **22 makiety** (11 sekcji
  × d+m): desktop 11/11 PASS 1. iteracją; mobile 1 regen (03-tryby); 4 generacje przez edge
  MEDIUM po HTTP 520 lokalnego (06 d+m, 08 m, 11 m). Artefakty panelu 22 z meta.section/
  viewport — gate kompletu OK. Koszt **$5.24** (wf2_costs 44604438), 24 generacje.
- **KRYTYK F2 (Opus, świeże oczy; kotwice = hero Rozmrozika I Brzuszka):
  PASS-Z-POPRAWKAMI, zero regeneracji, zero naruszeń KARTY.** Sygnatura „kręgi ciepła"
  11/11 sekcji; swash 1 słowo/sekcję; cross-landing odróżnialny natychmiast (jedyny serif
  display + unikalne indygo); mobile-od-zera TAK; anti-bleed czysto.
### DECYZJE POKRYTYKOWE → F3/F4
1. **Hero d+m (F3):** scena hero MUSI dostać nośnik ruchu wg G-HERO-LOOP (rozmyty kubek
   z parą / poświata lampy na brzegu kadru; produkt statyczny); rozważyć pole #F3E9E3
   pod packshotem. (Najsłabszy punkt kompletu — makieta ma pusty packshot bez nośnika.)
2. **Linki sekundarne = ink** (F4) — „Zobacz 3 tryby" był w indygo; scope akcentu wąski.
3. **TOR-I (F4):** podświetlać TYLKO wskaźnik aktywnego trybu (makieta pokazuje 3 diody
   równo — kod nie może tego odziedziczyć); nagłówek karty „Ciepło" w ink.
4. **Hero mobile fold (F4):** cap H1/packshotu o kilka %, by cena+CTA miały gwarantowany
   zapas nad zgięciem (na makiecie zapas cienki).
- Znane do F3: 04-glowica makro generowane → podmiana na crop z g0 (ZAKAZ generacji
  finalnej głowicy); 07 zdjęcia-kupujących placeholdery → realny UGC z bramką ≥2 granatowe
  klatki, inaczej SKIP sekcji; „zł" gubione w wielkich cenach → kod odtwarza copy.
- **lp_styl_marka done 8/8 · lp_makiety done 7/8** — kamień „AKCEPT MAKIET" u Tomka (retro).

## F3 + F3A (23.07)
- **12 scen 12/12 PASS 1. generacją, 0 regenów** (4 przez edge MEDIUM po HTTP 520 lokalnego).
  **HERO d+m z nośnikiem ruchu** (rozmyty kubek z parą + poświata lampy przy prawej
  krawędzi; produkt statyczny centralny na polu #F3E9E3) — decyzja krytyka F2 wykonana.
- Crop-first $0: glowica-head + tryby-panel (makra z g0); **packshot-alpha z makiety
  01-hero** (w g0 brak czystego izolatu granatu — nachodzi na leżącą głowicę; keying
  peach-distance + luminancja + hole-fill + największa składowa; prowenancja w MAPIE).
- **UGC bramka: 3/10 klatek granatowych** (6-2, 7-3 pełny produkt; 5-1 makro głowicy
  z LED) → sekcja zostaje (3 kafle); odrzuty: pudełka z tekstem, wariant szaro-różowy
  i różowy. Rehost → assets/ugc/.
- **F3A 2 pary oczu: 1. para 12/12 · 2. para NIEZALEŻNIE 18/18 PASS, ZERO sporów.**
  Uzupełnienia 2. pary (kosmetyka, nie regen): shoulder — chwyt za głowicę nie rączkę;
  final — cyfra wyświetlacza słabo czytelna; kołnierz waha się srebro↔szampańskie złoto
  (g0 = złoto).
- **DECYZJA WIĄŻĄCA → F4 („21"):** NIE wypalać dużej cyfry „21" ani count-upu — kulki
  na kadrach niepoliczalne (~19–22); H2 sekcji głowicy = „Stalowe kulki w koncentrycznych
  pierścieniach"; liczba 21 (fakt z g3) tylko zwykłym zdaniem w body. Obie pary oczu
  poparły niezależnie (claim falsyfikowalny przez klienta liczącego kulki).
- Storage: bud-assets/rozgrzewek/assets/ = 19 plików (12 S + 2 R + packshot P + 3 UGC
  + sc-hero-800 dorobiony). Koszt F3: **$2.24** (wf2_costs 03845cd3).
  **lp_grafiki done** (force-kolejnosc — kamień AKCEPT makiet u Tomka).

## F4 + PUBLISH (23.07)
- **LANDING LIVE: https://ulepszek.pl/rozgrzewek** (200; kasa 200; product_id ×2; noindex
  zdjęty; „drenaż"=0, Hailicare=0, „21" w nagłówkach=0 — weryfikacja niezależna).
  Koszt F4: $0.85 (wf2_costs bb953d07).
- Decyzje wiążące wdrożone: TOR-I = DOKŁADNIE 1 dioda zapalona per tryb, aktywna zakładka
  w ink; głowica H2 „Stalowe kulki w koncentrycznych pierścieniach." (21 tylko zdaniem
  w body); linki sekundarne ink; akcent #2E46C8 tylko CTA/swash/zewnętrzny łuk.
- **COMPLIANCE FIX (ważny wzorzec):** `wf2_products.platform_name` był NULL → landing-API
  zwracało nazwę systemową „Podgrzewany masażer do drenażu limfatycznego" (claim ZAKAZANY)
  do podsumowania kasy/sticky. Ustawiono „Rozgrzewek — podgrzewany masażer do ciała".
  LEKCJA: przy każdym produkcie sprawdzić platform_name PRZED publish.
- **Checkout jako WŁASNA sekcja #zamow** (forma kanoniczna modułu) — zagnieżdżanie w
  sekcji GPT gubi data-zc-api z roota (lekcja z Brzuszka/Rozmrozika). Submit kanoniczny
  „Zamawiam i płacę / …przy odbiorze" (art. 17). Dostawa realna 9,99 → Razem 94,89 zł.
- **Wideo: SKIP na bramce** — klip TT pobrany (1080p, produkt granatowy OK), ale wypalone
  napisy EN z claimem drenażu („FLUID JUST LIKE THIS") = zakaz Karty; bez placeholdera
  (zgodnie z trwałą decyzją). Sticky-buy z drugim IO na #zamow (chowa pasek nad kasą).
- Produkt Trevio utworzony w F4 (pid 019f8cc2-4b9b…, slug=rozgrzewek; bez duplikatu).
  ⛔ ZAKAZ ponownego ensure_product. Smoke: 0 konsoli, 0 h-scroll, 18/18 obrazów,
  hero mobile fold z ~200 px zapasu. **lp_kod done.**

## F7.1 dopasowanie (23.07)
- **LAYOUT-DIFF 0 FAIL · vision „ten sam projekt" 23/23 TAK (11 d + 12 m) · ZERO
  poprawek kodu.** Kluczowe rozstrzygnięcie: tokeny kodu (--paper #FAF3EF/#F3E9E3)
  = KANON Z2; delty makiet (jaśniejsze tło #FCF8F5, H2 58–68, pozycja swasha,
  lifestyle↔cutout) = DRIFT generacji AI, nie defekty kodu — aplikacja delt
  pogorszyłaby wierność (dowód szumu: kierunki delt H2 niespójne między sekcjami).
- SSIM 0.32–0.67 = informacyjny (doktryna sekcja-diff; precedensy Drapek/Rozmrozik/
  Brzuszek). Pozycja progów w checkliście done:false świadomie.
- Świadome odstępstwa potwierdzone: głowica bez „21"; TOR-I 1 dioda (kod=wzorzec);
  brak sekcji wideo; checkout realny; aktywny tab ink.
- RE-PUBLISH 200 (product_id TAK, noindex zdjęty, data-zc-api na #zamow.zc-checkout);
  smoke live 0/0. Dowody: FABRYKA-masazer/dopasowanie/ (23 kompozyty + DOPASOWANIE.md
  + NOTA-SSIM) + contact-sheet w panelu (artefakt 6000b232). **lp_dopasowanie done (5/6).**

## F8 — FINISZ (gate-check → 0 FAIL blokujących) · 23.07
- **Struktura archiwum wg gate-check:** `galeria-kuracja/GALERIA.md`, `dopasowanie/WIERNOSC.md`,
  `dopasowanie/SEMANTYKA.md`, `RETRO.md`, `makiety/*.png` (11 desktop + 11 mobile z FABRYKA-rozgrzewek/out;
  mobile rozpoznawane po sufiksie `-mobile`). WIERNOSC.md przepisany w formacie MASZYNOWYM (tabela
  „| grafika | …cechy… | WIERNOŚĆ |”; werdykt `WIERNOŚĆ: ZGODNA · pass-2: TAK`; K=8 PASS wg PASZPORT).
- **[baza] `--product-key` WYMAGANY:** gate domyślnie bierze wf2-id z KARTY (`4404200a`), którego NIE ma
  w `bud_tt_products` → FAIL „brak wiersza”. Radar TT id = **`5e1d40a8-a351-4609-a8d7-c9492e2c6dd8`**.
  Uruchamiać: `gate-check.py rozgrzewek … --product-key 5e1d40a8-a351-4609-a8d7-c9492e2c6dd8`.
  `gallery_curated` w radarze było NULL → zapisana REALNA kuracja F0.5 z GALERIA.md (items g0–g5,
  keep=g0; g2 ODRZUT medyczny). `videos_curated` NULL, ale check przechodzi przez notę „wideo” w LEDGER.
- **[cross_landing] Fraunces — ŚWIADOME ODSTĘPSTWO (font NIE zmieniany):** gate porównuje font display
  z 3 poprzednimi z `sklepy/tomek-niedzwiecki/*` (home-zaradek, mata, drapek). Kolizja: **`mata` też
  Fraunces**. To MIS-SCOPE: Rozgrzewek stoi w `sklepy/patryk-skrzypniak/` (parasol **Ulepszek**), nie
  tomek-niedzwiecki — anty-rodzeństwo mierzy WRÓG serię. Fraunces = partytura zadana briefem F1 i
  **jedyny serif w SERII Ulepszek** (siostrzane używają Zilla=slab / Archivo=sans; akcent #2E46C8
  dE≥47 od wszystkich 3 → RÓŻNY). `cross_landing` NIE ma mechanizmu per-landing noty/wyjątku (jedyny
  lever = globalny `wyklucz_slugi` — odrzucony: wykluczenie `mata` globalnie osłabiłoby gate dla
  PRZYSZŁYCH landingów tomek-niedzwiecki). → FAIL STRUKTURALNY, udokumentowany; **font zostaje Fraunces.**
- **Wagi ≤120 KB (Storage x-upsert, kod bez zmian):** sc-moment 196→114, sc-obszary-neck 164→114,
  -shoulder 172→103, sc-final 154→108, -back 132→97, -thigh 122→88, sc-final-mobile 122→90 (WebP
  q72–80, method 6). `packshot-alpha.png` 292→47 KB (quantize 256 z alpha; dims 341×670 = realnie
  używane, render max 430 px mid-cta). Lokalna kopia packshotu podmieniona.
- **Kod (potem RE-PUBLISH):** (a) JSON-LD **offers usunięte** (LL-048); (b) 4 linki tekstowe
  `min-height:44px` inline-flex (touch ≥44 mobile); (c) pigułki hero padding-inline 24→16 (koniec
  ucięcia @1280); (d) hero `object-position:50% 42%` (crop cover P1→P2, sterowane intencjonalnie);
  (e) **P0-dedup packshot:** tryby → `tryby-panel.webp` (wyświetlacz TOR-I), autonomia →
  `sc-autonomia.webp` (scena stolika), packshot ZOSTAJE tylko w mid-cta (allowlista MAPA-ASSETOW);
  (f) semantyka: 1× h1 (hooki 2/3 h1→p), `<main id="main">` wrapper.
- **[panel] lp_kod note** dopisano: „Moduły: checkout-inline@2 + footer@1 + sticky-buy@1 + pay-badges +
  faq-accordion@1” (footer@1 domyka `panel_sync` kod_wzmianki; status kroku BEZ zmian = done).
