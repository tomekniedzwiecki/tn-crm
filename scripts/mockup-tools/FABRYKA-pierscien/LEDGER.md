# LEDGER — SKROLIK (FABRYKA-pierscien)

## Naprawa 23.07 (audyt): hero "ozywiona pocztowka" -> JEDEN kadr full-bleed (kanon mata) + i2v
Powod: audyt 23.07 — hero byl scena w RAMCE (.hr-media radius+box-shadow, split 52/48 obok tekstu) =
"ozywiona pocztowka". Zlamanie STANDARD F1.7c: "OSADZENIE = TLO" (LL-074).

### A) OCENA REUSE-vs-NEW (uczciwa, vision) — NEW
Istniejaca scena `sceny/sc-hero.webp` = PORTRAIT 1024x1536, kompozycja pod karte (telefon po lewej /
dlon z pierscieniem po prawej — obie strony niosa tresc, ZERO czystej strefy negative-space na copy;
landscape full-bleed by ja pocial). NIE nadaje sie do osadzenia z nakladka copy -> generacja NOWEJ sceny.

### B) SCENA (F3) — nowy jeden kadr landscape pod full-bleed
- Generacja: `genimg.py` (wf2-gen, gpt-image-2, 3:2, quality high) z ref=stara `sc-hero.webp` (wiernosc pierscienia).
- Kompozycja: dlon z rozowym pierscieniem Skrolik (2 trojkatne przyciski + boczny) + telefon z feedem po PRAWEJ;
  LEWA ~40% = jasny krem/blush negative-space pod copy+scrim (harmonia z --paper #F8F1F0). Przyjete v1.
- Runner: `scripts/mockup-tools/regen-hero-v4-skrolik-tlo.py`.

### C) i2v (F6) — Kling v2.1 PRO
- Beat: feed na ekranie telefonu przewija sie PIONOWO (kafle -> portrety) = DZIALANIE Skrolika + klik kciukiem;
  pierscien/dlon/telefon rigid (NEG lock).
- GATE AMPLITUDY: diff(0->2.5s)=6.31 | diff(0->5s)=8.21 (prog >=8.0) = PASS (marginalny, ale RUCH REALNY:
  feed przewija content; NIE falszywy diff z przebarwien). Inspekcja klatek: pierscien+dlon wierne, bez morfingu.
- Ping-pong. Upload NOWE nazwy: `assets/sc-hero-tlo.webp` (+ -800), `video/hero-loop-tlo.mp4` (+ poster). 1 podejscie.

### D) MARKUP — kanon mata, skorka Skrolika
- `.hr-scene` absolute inset:0; JS-mount wideo w `#hero .hr-scene-vid` (poster, fade-in, IO play/pause, guard
  reduced-motion + save-data, muted+playsinline). Scrim w --paper #F8F1F0. Tresc NA scenie. Mobile band (46svh,
  object-position 58% 48%). ZERO radius/shadow na scenie.
- Copy/CTA BEZ zmian (H1 "Telefon stoi. Ty przewijasz kciukiem."; "Zamawiam Skrolika"). Hero Skrolika BEZ ceny
  (jak w oryginale — zachowane). `.hr-sig` (luki sygnalu) usuniete (przypiete do dawnej ramki). #zamow NIETKNIETY.
- WAZNE: rule `[id="ekran-zostaje"] .ez-figure .anim-video` (wspoldzielony) byl hostowany w hero scoped-style —
  PRZENIESIONY 1:1 do nowego bloku, zeby wymiana hero nie zdjela stylu tamtej sceny. Globalny loader anim-video
  (inne sekcje: demo/ekran-zostaje/wideo) NIETKNIETY. Preload sc-hero.webp -> sc-hero-tlo.webp. Backup: `index.html.bak-hero-tlo`.

### E) PUBLISH + GESTALT
- `platform-sync.py publish c2af0524-... skrolik` -> HTTP 200, published-gate 0 FAIL, noindex zdjety.
- F7.4 GESTALT (glowna sesja, wlasne screenshoty 1440/1920/390 + scroll + #zamow) — HERO = PASS ("mata", petla gra
  = feed przewija, pierscien wierny, kasa integralna). Szczegoly: `GESTALT.md`.
- FLAGA (poza hero): #wideo rail UGC (tt1-3.mp4) — NIE zaudytowany wizualnie (wojna o fokus przegladarki); ten sam
  wzorzec co Ugniatek (gdzie wykryto obca marke) -> zalecany reczny przeglad tresci klipow. Poza zakresem hero.

### KOSZTY (do raportu glownej sesji)
- Scena: 1x genimg gpt-image-2 (quality high) [OpenAI/wf2-gen].
- i2v: 1x Kling v2.1 PRO ~5s [fal]; saldo fal 65.87 -> 65.38 USD (delta ~0.49 dla petli skrolika).
