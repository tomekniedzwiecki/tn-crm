# LEDGER — Brzuszek (FABRYKA-brzuszek / produkt platformy „Maszyna do ćwiczeń brzucha Merach")

## 2026-07-23 — NAPRAWA OSADZENIA HERO (kanon mata, F1.7c pkt 2) · REUSE sceny+pętli v2
Audyt 23.07: hero = „ożywiona pocztówka" — oryginalny archetyp C (biała karta mikro-oferty `.hr-card`
nachodząca na scenę lifestyle `margin-top:-64px`; na desktopie karta pływająca na full-bleed scenie;
scena w boxie radius+shadow na mobile). Naprawa: przebudowa markupu+CSS na kanon **mata** (jak Rozmrozik v4):
- `.hr-scene` full-bleed `position:absolute; inset:0; z-index:0` POD treścią; usunięto `.hr-wrap`,
  białą kartę `.hr-card` (border/radius/shadow), `.hr-video-inject`, mobilny box radius+shadow.
- `.hr-scrim` gradient 100deg w tokenie `--paper` (rgb 247,245,251) → czytelność copy po lewej
  (zawoalowanie sofy/rośliny/nóg w papier).
- `.hr-content` = lewa kolumna na scenie (`max-width:calc(hr-inset + 512px)`, ~658px na 1440),
  text-align:left; frosted karta ceny (429 zł + CTA + pay-badges) + frosted kafelki zaufania NA scenie;
  zachowana sygnatura `.reps`. object-position 52% 44% (desktop) / 50% 40% (mobile band).
- Mobile ≤900: scena pełnokadrowy band (`height:clamp(300px,48svh,440px)`) → treść na papierze.
- JS-mount pętli przepięty na slot `.hr-scene-vid`, obserwuje `#hero` (LL-049). Backup: `index.html.bak-hero-tlo`.

**Decyzja scena:** REUSE. Tło harmonizuje 1:1 z `--paper`; po przebudowie podmiot+ruch czytelne po
prawej, copy na zawoalowanej lewej (zweryfikowane renderowo 1440/1920/390). Pętla `hero-loop-pp-v2.mp4`
(AKTYWNY, ampl. 11.9, pełne powtórzenie ćwiczenia) już wzorcowa; regen ruchu człowieka i2v = ryzyko
wierności. **Koszt generacji: $0.**

**F7.4 GESTALT:** świeży visual-verify → **CZYSTY** (hero integralne, mata nie pocztówka; checkout
spójny; 0 błędów/overflow). Werdykt: `GESTALT.md`. Uwagi kosmetyczne PRE-ISTNIEJĄCE poza zakresem hero
(klipy UGC #wideo z ang. napisami; kolejność FAQ) — do decyzji Tomka. Publish: https://ulepszek.pl/brzuszek
HTTP 200, 0 FAIL, noindex zdjęty. HOME bez zmian (ten sam plik pętli). #zamow nietknięty. TPAY nietknięty.
