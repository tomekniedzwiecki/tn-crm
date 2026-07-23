# LEDGER — ZAKLIPEK (F0) · tor AliExpress (source=detail) · 2026-07-23

| pole | wartość |
|---|---|
| slug roboczy | zaklipek (mini-marka „Zaklipek" prowizoryczna — rezerwacja w F2.5) |
| bud_tt_products | 1ededa68-9f03-4b62-ad8b-f305c60ad0da |
| wf2_projects | 62e5422a-9475-4e9b-afa3-483c53b62169 |
| wf2_products | 07e194e7-b39a-4ddc-a5fc-f27dc065625c |
| ali_product_id | 1005008397815113 (chosen_link: pl.aliexpress.com/item/1005008397815113.html) |
| source | detail (ZAUFANE — gate F0 PASS) |
| cena PL | 34,90 zł (ODCZYT wf2_products.price; kalkulacja DONE — NIE zmieniana) |
| koszt zakupu | 28,61 zł ($7.54 × NBP 3,7946, tab. 141/A/NBP/2026, 2026-07-23) |
| marża | ~20% · zysk 5,59 zł/szt. (prowizja 2%; unit_profit) |

## Faza F0 — wykonane
- **Gate source='detail' = PASS** (twardy, pierwszy krok). Snapshot pełny (title, price, 7 specs,
  12 variants, 12 sku_prices, 7 images, review_stats, 11 reviews, description).
- **F-1 INWENTARZ MATERIAŁU** (kosztorys grafiki, NIE bramka produktu):
  - Realne packshoty po odsiewie: **0 czystych** (wszystkie g0–g5 = infografiki z wypalonym tekstem
    ENG; g6 = inny produkt ORICO). → faza graficzna CIĘŻKA: czysty packshot wariantu bazowego
    (4-port srebrny) = do WYGENEROWANIA w F3; keep = 4 crop-kandydaci (g1/g2/g3/g5).
  - Opinie z treścią: **11** (9×5★, 2×4★); z realnym mięsem ~5 (op. 1,3,8,10,11).
  - Zdjęcia od kupujących (5★): **4** (rev0×3 + rev1×1); użyteczne ~2–3 (rev0_2 = zrzut benchmarku
    OUT; rev0 = czarny wariant 10Gbps ≠ kanon srebrny; rev1_0 = srebrny in-use, pasuje).
  - Klipy wideo dodane do produktu: **0 realnych** (video_url=null; tiktok=inny produkt ORICO).
  - Puste specs: „Funtion"=None, „High-concerned chemical"=None → zero zmyślonych parametrów.
- **F0.5 KURACJA GALERII** (obejrzane wszystkie 7 kadrów vision): **4 keep (crop) / 3 odsiew**.
  Werdykty → `bud_tt_products.gallery_curated` + GALERIA.md (kopia w galeria-kuracja/).
  - keep (crop tekstu): g2 (in-use), g1 (lifestyle), g5 (detal zacisk + [DANE] 5–28 mm), g3 (detal DC5V).
  - odsiew: g0 (7-in-1 obcy wariant + burned text; render→ref F3), g4 (heavy text + zrzut apki;
    treść→§2b), g6 (INNY produkt — czarny hub ORICO).
  - white-label: nadruki marki tylko INCYDENTALNE w scenach (g2 ekran, g4 okno, g5 dysk) → retusz;
    sam produkt bez czytelnego nadruku.
- **F0.6 KARTA-PRAWDY** (specs 1:1, destylacja FAKT/BEŁKOT, 11 opinii, SANITY portów/prędkości/
  wariantów, koszty wariantów USD + NBP) + **PASZPORT** (cechy dyskryminujące + „CZEGO NIE MA" +
  white-label) + **WIDEO** (brak wideo) + **ICP** (persona: biurkowi profesjonaliści/twórcy/gracze).
- `videos_curated` = nota „brak realnego wideo produktu".
- Panel: link_product (istniał) + slug=zaklipek + lp_dane in_progress→done (fields + checklista).

## ⚠️ SANITY / RYZYKA (zgłoszone Tomkowi — buduj dalej, nie zatrzymuj)
1. **ROZBIEŻNOŚĆ DANE vs BRIEF:** brief zlecenia podał „27 ocen / sold 36 / koszt 27,17 zł" — realny
   snapshot: **26 ocen · sold 34 · koszt 28,61 zł**. Na stronę idą wartości ze snapshotu/bazy.
2. **MATRYCA WARIANTÓW MIESZA KLASY PRODUKTU:** 12 wariantów $7.54–$25.58. Bazowy 4-port USB 3.0
   ($7.54→28,61 zł) mieści się w 34,90 zł; warianty 10 Gbps / 7-in-1 / **4K-60Hz HDMI $25.58
   (~97 zł landed)** są STRATNE za 34,90 → **strona sprzedaje TYLKO wariant bazowy**; reszty nie oferować.
3. **GALERIA REKLAMUJE NIE TEN WARIANT:** większość kadrów pokazuje 10 Gbps / 7-in-1 / czytnik kart.
   ⛔ Na stronie ZAKAZ „10 Gbps", „7-in-1", „czytnik SD/TF", „HDMI/4K" — bazowy = 4 porty USB 3.0, 5 Gbps.
4. **UKŁAD PORTÓW WARIANTU BAZOWEGO NIEROZSTRZYGNIĘTY** (etykiety A–J nieczytelne): 4× USB-A czy
   3×USB-A+1×USB-C — potwierdzić przy wyborze wariantu/packshocie (F2.5/F3). Copy: „4 porty USB 3.0".
5. **ZŁĄCZE ZASILANIA WĄTPLIWE:** opis „Micro USB power interface" vs obraz „DC 5V USB-C" (g3/g5) →
   podawać „port zasilania DC 5V" bez przesądzania złącza.
6. **BRAK CZYSTEGO PACKSHOTU** → F3 musi wygenerować packshot bazowy (srebrny, 4-port). Zdjęcia
   kupujących mieszają kolor (czarny 10Gbps vs srebrny) — kanon = SREBRNY aluminiowy.
7. **BRAK WIDEO** produktu; TikTok = inny produkt (ORICO). Sekcja wideo = blokada-tomek (F1a).

## Odstępstwa (świadome)
- Krok `kalkulacja` (Etap 1) JUŻ DONE (3/3 checklista, source=detail, cena 34,90 zł) → `lp_dane`
  zamknięte NORMALNIE (bez --force-kolejnosc; blokada kolejności spełniona).
- Checklista `lp_dane` **6/7**: „Slug + mini-marka zarezerwowane w bud_brand_names" = **done=false**
  — mini-marka „Zaklipek" celowo ODŁOŻONA do F2.5 (rezerwacja w `bud_brand_names`). Slug roboczy
  `zaklipek` ustawiony na `wf2_products.slug`.
- `wf2_products.status` = `kandydat` (link_product fallback z CHECK) — NIE zmieniane w F0 (poza
  scope; docelowo w_budowie ustawi kolejny krok/Tomek).

## Koszty F0
- **0 USD** (kuracja + karta + odczyt istniejących kadrów; zero generacji AI).

## Definicja DONE F0 (sync panelu)
- lp_dane = done · fields {source_ok, cena_pl 34,90 zł, koszt_landed 28,61 zł, marza ~20%/5,59 zł,
  ocena ★4,6/5 · 26 ocen, zdjecia_keep 4, wideo_keep 0, karta_url, paszport_url} · checklista 6/7 VERBATIM.
- Doki → wf2-docs/zaklipek/: KARTA-PRAWDY, PASZPORT, GALERIA, WIDEO, ICP-GRUPA-DOCELOWA, LEDGER.
- Artefakty gallery: 4 keep (g1/g2/g3/g5) + gallery_curated zapisane.
