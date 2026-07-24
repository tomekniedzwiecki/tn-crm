# LEDGER — Blasik (Patencik / Rafał Rogut bc92c138)

## F0 (24.07.2026, sesja AUTOPILOT WF2)
- ⚠️ Produkt z INCYDENTU „Latarka 17.07" — GATE source zweryfikowany bezwzględnie.
- GATE source: **`datahub`** (snapshot odświeżony 24.07 16:21 przy kalkulacji) — PASS (∈ {detail, allegro, datahub}).
- Kuracja galerii: 7 kadrów Ali + 1 doklejka sklepowa (shopimg0) → **5 keep** (2 packshot POKAŻ: c-lit, c-off
  + 3 CROP: c-worn, c-night, c-splash); cropy Pillow zweryfikowane vision; żółte łuki czujnika (overlay)
  usunięte ciasnym cropem + flat-fill. **Czysty packshot ISTNIEJE** (wycięty z kompozytu g0) → F3 = multi-ref
  z realnymi packshotami (c-off + c-lit + c-worn + diagram g4).
- Nadruki obcej marki (BIAT/Heinast/LX300): **BRAK na produkcie w każdym kadrze** → retusz marki niepotrzebny.
  Marka „Heinast" tylko w spec, „LX300" tylko na pudełku, „BIAT" tylko w nazwie wewnętrznej — WSZYSTKIE white-label.
- KARTA-PRAWDY / PASZPORT / MAPA-ZASTOSOWAN (3 funkcje → szerokość obowiązkowa, SPEKTRUM 6 światów) / ICP /
  GALERIA / WIDEO — komplet.
- SANITY LICZB: **230° = BEŁKOT-CUT** (sprzeczne ze spec Beam Angle=180°); **350 lm = CUT** (brak w specs,
  tylko marketing pudełko/infografiki); **Type-C = NIE deklarować** (g3 „not support usb-c pd" + kable USB-A
  sprzeczne z pudełkiem); czas pracy 2,5–8h = WĄTPLIWE (infografika, fizyka ~1,5h high) → bez twardej liczby;
  czujnik dźwięku = WĄTPLIWE (opinia 11 nie uruchomiła) → tylko czujnik RUCHU. Na stronę: 180° · 3W · 3,7V ·
  IPX4 · ~68g · 6 trybów · ~10cm · 1200mAh (miękko).
- Cena: cost_purchase 12,94 zł (kanoniczny, ODCZYT), price 14,90 zł (ODCZYT) — NIE zmieniane; NBP 3,8000 (24.07).
  Warianty = paczki 1/2/3/5 szt. (NIE kolory); jeden wygląd (czarny + żółta COB). Nota F-1: marża cienka
  (~1,96 zł) ale w paśmie 10–15% panelu — buduję dalej.
- Mini-marka: **Blasik** (bud_brand_names 26874369, INSERT-or-fail 1. kandydatka; od „blask", nie koduje
  jednego zastosowania). Alternatywy rozważone: Świtek, Czółko, Jaśnik.
- videos_curated: **pusty** (0 klipów — tiktok_url null, tt_shop.videos puste) → sekcja WIDEO nie powstaje (LL-044).
- Zdjęcia kupujących: **materiał JEST** (10 zrehostowanych, wszystkie 5★) → selekcja 4 keep (3-0, 2-1, 7-1, 1-0)
  + 2 backup; OUT: 0-0 (watermark), 9-0 (pudełko + „350 LUMENS"), 5-0/4-0. Filtr `stars==5`: F4.
- Koszty F0: **$0** (kuracja bez generacji; cropy lokalnie Pillow).
- Model: main-loop Opus (vision osąd zamknięty wg checklisty GALERIA-ALI).
- Odstępstwa: brak.
