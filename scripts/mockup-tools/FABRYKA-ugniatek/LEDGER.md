# LEDGER — UGNIATEK

## Naprawa 23.07 (audyt): hero DIPTYK -> JEDEN kadr full-bleed (kanon mata) + i2v
Powod: audyt 23.07 — hero byl DIPTYK (figure.hr-frame-l wideo hero-L + figure.hr-frame-p STATYCZNY
hero-P, data-mo="dyptyk"), pol hero martwe. Zlamanie STANDARD F1.7c: "JEDEN KADR = JEDNA SCENA"
(LL-072) + "OSADZENIE = TLO" (LL-074).

### A) SCENA (F3) — nowy jeden kadr pod full-bleed
- Generacja: `genimg.py` (wf2-gen, gpt-image-2, 3:2, quality high) z product-ref `packshot-final.webp`.
- Kompozycja: back-view mezczyzny dociskajacego Ugniatka OBURACZ do karku (docisk = DZIALANIE;
  klasa produktu aktywna, F1.7b), LEWA ~40% = spokojna porcelanowo-szara przestrzen pod copy+scrim,
  produkt wierny packshotowi (owal satyna-srebro, 6 czarnych glowic 2x3, panel, wyswietlacz P3, 2 uchwyty).
- Przyjete v1 (wiernosc > poprzedniego live hero-L, ktory zdryfowal do kwadratowej plyty). Runner:
  `scripts/mockup-tools/regen-hero-v4-ugniatek-tlo.py`.

### B) i2v (F6) — Kling v2.1 PRO przez bud-fal-proxy
- Beat: donie + masazer pompuja/ugniataja kark (wolny cykl), wlosy/koszulka/oddech; produkt rigid (NEG lock).
- GATE AMPLITUDY: diff(0->2.5s)=10.66 | diff(0->5s)=13.08 (prog >=8.0; wzorzec-dobry Brzuszek 11.9) = PASS.
- Inspekcja klatek 0/2.5/5: ruch REALNY (translacja masazera po karku), produkt/donie bez morfingu,
  twarz sie nie pojawia (back-view). NIE falszywy diff z przebarwien (lekcja Rozgrzewek v2 8.97).
- Ping-pong (first=last). Upload pod NOWYMI nazwami: `assets/sc-hero-tlo.webp` (+ -800), `video/hero-loop-tlo.mp4` (+ poster).
- 1 podejscie petli (PASS za pierwszym razem).

### C) MARKUP — kanon mata (wzorzec rozmrozik v4), skorka Ugniatka
- `.hr-scene` absolute inset:0 pod trescia; JS-mount wideo w `#hero .hr-scene-vid` (poster=scena, fade-in po
  'playing', IO play/pause, guard reduced-motion + save-data, muted+playsinline, gra na KAZDYM viewporcie).
- Scrim gradientowy w tokenach TEGO landinga (--paper #EEF1F2). Tresc NA scenie (lewa kolumna ~520px).
  Mobile band (46svh, object-position 66% 42%). ZERO border-radius/box-shadow na scenie.
- Copy/CTA/cena BEZ zmian tresciowych (189,00 zl; "Zamawiam Ugniatka"; 3 pille). Callout "2 uchwyty" USUNIETY
  (byl przypiety do dawnego lewego kadru diptyku; kanon mata bez adnotacji-pocztowek). #zamow NIETKNIETY.
- Preload LCP przelaczony hero-L-v2.webp -> sc-hero-tlo.webp. Martwy CSS diptyku (.hr-frame-l/.hr-video +
  data-mo="dyptyk") usuniety. `#ekran-zostaje`? n/d. Backup: `index.html.bak-hero-tlo`.

### D) PUBLISH + GESTALT
- `platform-sync.py publish c2af0524-... ugniatek` -> HTTP 200, published-gate 0 FAIL, noindex zdjety (zaradek.pl custom).
- F7.4 GESTALT (2 niezalezne recenzje: glowna sesja + swiezy visual-verify) — HERO = PASS ("mata", pętla gra,
  produkt wierny, kasa integralna). Szczegoly + cytaty: `GESTALT.md`.
- FLAGA (poza hero, pre-istniejace): #wideo "W akcji" pokazuje INNE produkty + OBCA MARKA "KAJUE" + pistolety
  powieziowe/perkusyjne (zla kategoria); #final callout "6 glowic" nachodzi na render; #anatomia rozjazd danych
  (22 081 vs 22 300 mm2). NIE w zakresie "napraw hero" — do triazu glownej sesji.

### KOSZTY (do raportu glownej sesji)
- Scena: 1x genimg gpt-image-2 (quality high) [billing OpenAI/wf2-gen].
- i2v: 1x Kling v2.1 PRO ~5s [fal]; saldo fal 66.00 -> 65.87 USD (delta ~0.13 dla petli ugniatka).


## TRIAŻ #1 (23.07): audyt sekcji #wideo "W akcji" — OBCA MARKA + zła kategoria → SEKCJA UKRYTA
Audyt klatek KAŻDEGO klipu (ffmpeg: 3 klatki/klip @15/50/85% czasu, inspekcja vision):
- **tt1** (@jierebyqcwi, 19s): CZARNY masazer OBCEJ MARKI "KAJUE" (nadruk na obudowie) + wypalony
  ekran TikTok Shop + "Search 'KAJUE' on TikTok Shop" + ceny $89.99/$34.98. → OFF-PRODUCT + reklama konkurencji. ODRZUT.
- **tt3** (@seaurchin, 30s): ZIELONY/miętowy PISTOLET perkusyjny (massage gun) — "six modes 1 2 3 4 5",
  "grab a partner". Inny produkt/kategoria (PASZPORT: BRAK raczki pistoletowej). ODRZUT.
- **tt4** (@jierebyqcwi, 30s): ten sam czarny KAJUE + "WORLD CUP SALE $34.98 Search 'KAJUE Massage Gun'"
  + ekran Amazon $89.99 vs "Ours $34.98". → OFF-PRODUCT + reklama konkurencji. ODRZUT.
- **tt5** (@ayitireveye2026, 62s): CZARNY pistolet perkusyjny z zestawem NAKLADEK (grot/kula) na nodze.
  Inny produkt (PASZPORT: BRAK zestawu nakladek, to NIE massage gun). ODRZUT.
Wynik: **4/4 OFF-PRODUCT** (2x czarny KAJUE-konkurencja + promo, 2x massage gun zla kategoria).

Materiał zastępczy — WYCZERPANY:
- storage `bud-assets/ugniatek/tt/`: TYLKO tt1/tt3/tt4/tt5 (tt2/tt6/tt7 = 404). Brak innych.
- `bud_tt_products` (kolumny videos/videos_curated/ali_snapshot/tiktok_url): brak wiersza on-product dla
  Ugniatka (handle'i z landinga @jierebyqcwi/@seaurchin/@ayitireveye2026 NIE ma w tabeli; jedyny match "ugniat"
  = "elektryczny ugniatacz do jamu" = sprzet kuchenny, rejected). ZERO on-product.
- archiwum `FABRYKA-ugniatek/assets/ugc-1.mp4 + ugc-2.mp4` (5s): pokazuja WLASCIWY satynowo-srebrny owalny
  masazer (ugc-1=docisk kobiety do karku, ugc-2=oparcie lędźwi "P2"), ALE to AI-demo (styl scen hero, wersje
  -raw), NIE realne UGC tworcy → nie pasuja do sekcji ramowanej jako "@author / od tworcy" bez falszowania
  atrybucji; redundantne z nowym hero.

**DECYZJA (b): SEKCJA #wideo UKRYTA** — `style="display:none" data-hidden-reason` na `<section id="wideo">`
+ komentarz z powodem. MARKUP ZACHOWANY (klipy nie laduja sie: display:none blokuje IO/lazy). Uzasadnienie:
obca marka (KAJUE) na wlasnej stronie sprzedazowej jest GORSZA niz brak sekcji; STANDARD F0 off-product=odrzut;
"klasa dowodowa bez SKIP" dopuszcza brak przy wyczerpaniu materialu.
**ODROBIC** gdy pojawi sie realne UGC pokazujace satynowo-srebrny owalny masazer (6 glowic 2x3, 2 uchwyty).
Alternatywa na przyszlosc: przeramowac sekcje na uczciwe "demo dwoch form" i uzyc ugc-1/ugc-2 (bez atrybucji @tworca).

## TRIAŻ #1 — poprawki #final + #anatomia
- **#final:** usuniety `<span class="fn-callout">6 kulowych głowic</span>` — floatujacy chip (position:absolute
  right:0 bottom) nachodzil na packshot jak zgubiony tooltip; info juz jest w #anatomia (redundancja). Weryfikacja
  live: `#final .fn-callout` nieobecny.
- **#anatomia:** BRAK BLEDU DANYCH. "22 300 mm²" to COUNT-UP (`<span class="cu" data-cu="22300">`) zgodny z
  KARTA-PRAWDY ("powierzchnia robocza do 22 300 mm²"). Wartosc "22 081" z audytu = klatka W TRAKCIE animacji
  count-up (0->22 300), nie rozjazd danych. Weryfikacja live: #anatomia renderuje "22 300 mm". Nic nie zmieniano.
- Publish: HTTP 200, published-gate 0 FAIL. Weryfikacja live: #wideo offsetHeight=0 display:none, 0 posterow
  konkurencji wyrenderowanych.
