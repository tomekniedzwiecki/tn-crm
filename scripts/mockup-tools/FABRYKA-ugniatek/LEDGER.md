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
