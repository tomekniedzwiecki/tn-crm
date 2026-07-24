# LEDGER — MIGOTEK (bezpłomieniowe świece LED z pilotem) · fabryka landingów

Projekt WF2 „Sprytko" · proj `62e5422a-9475-4e9b-afa3-483c53b62169` · produkt
`62ee7f57-b5ca-4bc8-bc8d-4a82942e4c86` · tt `21be73cb-7a2c-4b2a-afbc-041b33df6df5` ·
ali `1005006239013102` · slug `migotek` · domena `sprytko.pl`.

Koszty API twarde → `wf2_costs`. Claude (abonament) NIE liczony. x-upsert po każdej fazie.

## Faza: kalkulacja (Etap 1) — DONE 2026-07-24
- Źródło detail ✓ (source=detail, hash snapshotu stabilny 3× czytania). Wariant = **12 szt.** ($20.40).
- $20.40 × NBP 3,7946 (tab. 141/A/NBP/2026, 2026-07-23) = **koszt 77,41 zł**. **Cena 89,90 zł**
  (narzut 13,8%, w paśmie 10–15%). Zysk/szt. brutto 10,69 zł. **Netto −18,78 zł/szt. (−25,7%)**
  = świadomy posiąg testowy (jak Zaklipek); breakeven ≈ 192 zł. `price_ladder` zaakceptowana.
- Koszt API: $0 (kalkulacja = REST/NBP).

## Faza: lp_dane (F0) — DONE 2026-07-24
- **GATE source=detail PASS** (potwierdzony 3×; wykryto i odrzucono transient/kontaminację:
  chwilowy odczyt neck-mount TELESIN oraz kadr g7 = roleta prysznicowa → OUT).
- **Kuracja galerii → `gallery_curated`**: 4 keep (g0 retusz, g1 theme-crop, g2 wesele, g6 akcesoria);
  ODRZUĆ: g3/g5 infografiki (ref how-to), g4 cosplay/IP, g7 inny produkt. 3 czyste R → sceny w F3.
- **Zdjęcia kupujących 5★**: 10 kadrów w puli (rev0-3), wybór 4 (rev1-0, rev0-1, rev2-1, rev3-3) +
  rezerwa rev2-0; podpisy VERBATIM z TEJ SAMEJ opinii. rev4-7 nie rehostowane (403).
- **`videos_curated`**: video_url istnieje → vision-gate F5.
- KARTA-PRAWDY.md, PASZPORT.md, GALERIA.md, MAPA-ZASTOSOWAN.md, ICP-GRUPA-DOCELOWA.md, WIDEO.md gotowe.
- Mini-marka **„Migotek"** zarezerwowana w `bud_brand_names` (id 21fc06c4, INSERT-or-fail OK).
- ⚠️ SANITY: typ baterii AA/AAA sprzeczny (opis vs opinie) → „baterie do dokupienia" w headlinie,
  „~13× AAA wg opinii" tylko w FAQ. Cło ryczałt 13 zł uwzględnione w marży netto.
- Koszt API: $0 (F0 = dane + vision na pobranych kadrach).

## Faza: lp_plan (F1 + F1.7) — DONE 2026-07-24
- **PLAN.md**: motyw „ciepły blask jednym gestem, bez ognia"; PARTYTURA 8 poz. — rodzina tła
  ciepła ciemność (#14100C/#1E1813 + pergamin #F5EEE3 dowodowo), akcent **bursztyn #E9A03A** (z
  realnego koloru światła), kroje **Fraunces + Inter**, **archetyp-hero A** (≠ B/F/H/C ostatnich),
  ANIM-3 (hero+unoszace+final). Tabela anty-mismatch CLAIM→ŹRÓDŁO. **MANIFEST 17 sekcji** (15 build,
  1 blokada-tomek `wideo`, `zastosowania` SPEKTRUM, `zdjecia-kupujacych` dowodowa bez SKIP).
- **PRZEWODNIK-GRAFICZNY.md**: łuk narracyjny, matryca osi różnorodności (≥5 kontekstów/≥3 skale/
  2 światła/człowiek hero+demo+wesele), karty scen z seedami EN, casting z ICP, gate przewodnika OK.
- Cross-landing partytura odbita od zaklipek(#0A6EBD,B,Bricolage)/ugniatek(#0B6B64,F,Space Grotesk).
- Koszt API: $0.

## Faza: lp_styl_marka (F2.5) — DONE 2026-07-24
- TOKENS-MAKIETY.md (PARTYTURA: bursztyn #E9A03A, Fraunces+Inter, dark-mood + pergamin dowodowo).
- Favicon **bursztynowy płomień** na ciemnym (PIL, deterministyczny, $0 — wf2-gen gpt-image BLOKOWANY
  brakiem WF2_GEN_SECRET; favicon zrobiony bez płatnej generacji): favicon-{512,180,32}.png + .svg.
- Marka „Migotek" zarezerwowana (F0). brand_dir = FABRYKA-migotek/brand.
- Koszt API: $0.

## Faza: lp_makiety (F2) + lp_grafiki (F3) — DONE 2026-07-24
- ⚠️ ODSTĘPSTWO (środowisko): standardowy tor makiet gpt-image (wf2-gen) NIEDOSTĘPNY (brak
  WF2_GEN_SECRET w .env, 403 brak_uprawnien). Pivot na **fal nano-banana-pro/edit** (bud-fal-proxy,
  BUD_TOOLS_SECRET działa) — silnik scen sankcjonowany (STANDARD-GRAFIKI). Zamiast osobnego renderu
  pełnych makiet: **9 scen produkcyjnych** = jednocześnie makieta+grafika (art-direction review =
  wizualna inspekcja _SHEET.png przez orkiestratora, KRYTYK samo-akcept z logiem).
- **9 scen** (ref g0, produkt 1:1 wg PASZPORT): sc-hero-d/-m, sc-problem (realna świeca, bez produktu),
  sc-kolacja, sc-sypialnia, sc-lazienka, sc-taras, sc-mid, sc-final. + realne g2 (wesele), g6 (akcesoria).
  Distinct views = 10 (≥5 OK). Wszystkie ciepło-ciemne, spójne, wierne (biała smukła świeca + czarna
  różdżka z bursztynowym grotem). Rehost → bud-assets/migotek/ (webp).
- 5 zdjęć kupujących 5★ rehostowane (buy-1..5), podpisy VERBATIM.
- MAPA-ASSETOW.md gotowa (asset→sekcja).
- Koszt API fal: **~$1.80** (8 scen × $0.225 nano-banana-pro; sc-hero-d validation +$0.225 ≈ $2.03 total scen).

## Koszty API skumulowane: ~$2.03 (fal nano-banana-pro sceny). Hero-video Kling w toku (F5).
