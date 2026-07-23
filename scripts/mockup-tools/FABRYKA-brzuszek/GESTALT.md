# GESTALT (F7.4) — Brzuszek · naprawa OSADZENIA hero

**Data:** 2026-07-23
**Kontekst:** naprawa audytu 23.07 „ożywiona pocztówka". Oryginalny archetyp C (briefing-01):
biała karta mikro-oferty `.hr-card` NACHODZĄCA na scenę lifestyle (`margin-top:-64px`, na desktopie
karta pływająca na full-bleed scenie) + scena w boxie radius+shadow na mobile. To „pocztówka w
eleganckim przebraniu" (STANDARD F1.7c pkt 2). Przebudowa na kanon **mata**: scena = TŁO strony
full-bleed `position:absolute; inset:0` POD treścią, scrim gradientowy w tokenie `--paper #F7F5FB`,
treść (eyebrow/reps/H1/lead/frosted karta ceny/frosted kafelki) leży NA scenie.

**Decyzja scena/pętla:** REUSE (oceniona uczciwie vision-em + empirycznie po przebudowie).
Tło sceny (jasny chłodny salon: lawendowa sofa, biel, szarości) harmonizuje 1:1 z tokenami
`--paper #F7F5FB`/`--paper-2 #F0ECF7`. Podmiot (ćwicząca kobieta) jest centralny, ale po przebudowie:
scrim zawoalowuje LEWĄ (sofa/roślina/nogi w mauve) w papier pod czytelnym copy, a cała maszyna +
tors/ramiona + konsola LCD + ruch pozostają czytelne po prawej (object-position 52% 44%). Renderowo
potwierdzone na 1440/1920/390 — brak kolizji copy↔podmiot, brak overflow. Pętla `video/hero-loop-pp-v2.mp4`
(klasa AKTYWNY, amplituda 11.9 = wzorzec dobry, pokazuje pełne powtórzenie ćwiczenia) reused;
regeneracja ruchu CZŁOWIEKA przez i2v = wysokie ryzyko wierności (morfing kończyn/twarzy), a loop
jest wartościowy. **Koszt generacji: $0.** HOME bez zmian (ten sam plik pętli).

**Viewporty audytu (świeży agent visual-verify, nie znał zmian):** desktop 1440 + 1920, mobile 390,
hero z GRAJĄCĄ pętlą (readyState 4, `on=true`, currentTime narastał; klatka t=0.5 = szczyt powtórzenia,
t≈6.9 = głęboki crunch — realny pełny ruch ćwiczenia), pełny scroll, #zamow.

## Werdykt: **GESTALT: CZYSTY**
Brak zgrzytów strukturalnych. Hero w kanonie mata — scena wchodzi pod header, wypływa poza kartę
ceny do prawej krawędzi i w dół; ZERO ramki/zaokrąglenia/cienia/białej karty oddzielającej; copy
leży BEZPOŚREDNIO na scenie na miękkim jasnym scrim po lewej. Jedyne „karty" na scenie = intencjonalny
biały box ceny 429 zł + półprzezroczyste chipy = overlay UI, nie panel pod tekstem. Checkout (#zamow)
natywna część strony (ten sam eyebrow/pasek/grotesk/tło). 0 błędów konsoli, brak overflow, polskie znaki OK.

**Cytat-klucz:** „Scena wchodzi pod header i wypływa poza kartę ceny — kobieta realnie robi powtórzenie
na maszynie, a nagłówek leży wprost na tym kadrze; to żywe tło strony, nie ożywiona pocztówka w białej ramce."

## Uwagi (kosmetyczne, PRE-ISTNIEJĄCE, POZA zakresem osadzenia hero — do decyzji Tomka)
- Sekcja `#wideo` (ZOBACZ RUCH): 3 klipy UGC = najniższy poziom produkcji, z wypalonymi ANGIELSKIMI
  napisami; maszyny w klipach wyglądają biało/szaro (nie ewidentnie biało-różowo). Buduje autentyczność,
  ale to najsłabszy wizualnie punkt strony. NIE dotyczy hero.
- IA: FAQ (`#final`) po `#zamow` — do obrony (obiekcje domykane na końcu). NIE dotyczy hero.

**Dowody publish:** `platform-sync publish` → https://ulepszek.pl/brzuszek HTTP 200 · 240109 B ·
runtime product_id w HTML: TAK · noindex ZDJĘTY · published-gate 0 FAIL.
