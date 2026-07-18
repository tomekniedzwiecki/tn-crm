# PLAYBOOK — archetyp BEAUTY / TALKING-HEAD

> Beauty i personal care: **osoba mówi do kamery i pokazuje urządzenie pracujące na jej ciele** (lokówka, depilator, masażer, szczotka).
> To najdroższy i najtrudniejszy archetyp (dryf twarzy) — pilot lokówki był tu wzorcem. Wzór blueprintu: `pilot-lokowka/blueprint-v2-przyklad-lokowka.json`.
> Czytaj po SSOT (sekcje 0, 0b) i przed `PROCEDURA-OPERATORA.md`.

## 1. Rozpoznanie archetypu
Jest twarz, jest synchronizowana mowa, jest eye-contact przerywany spojrzeniem na urządzenie. Urządzenie działa NA CIELE (głowa/skóra/twarz). Jeśli twarzy nie ma → to hands-POV, nie ten plik.
> **Sam gadający/reagujący prezenter to za mało (gadżet + UGC reakcja/testimonial):** gdy produkt NIE działa na ciele, a twarz tylko komentuje → idź do **`PLAYBOOK-gadzet-handsPOV.md`**. Kondensacja 15 s (SSOT 0c) tnie gadanie jako pierwsze, więc gadająca głowa nie przetrwa montażu — a to najdroższy i najtrudniejszy archetyp (dryf twarzy). Ten plik bierz TYLKO, gdy twarz/emocja JEST treścią dowodu (produkt działa NA ciele/twarzy).

## 2. Mapa silników — trzy silniki po funkcji sceny
Dobór z testów A/B 17.07: **wierność oryginałowi = sekret virala**, każdą scenę z gestem prowadź drivingiem.
- **omnihuman** (OmniHuman 1.5, audio-driven) — sceny MÓWIONE. Usta+mimika+gesty generowane z NASZEGO audio od podstaw (bije post-hoc lip-sync i Kling Avatar, który wygładza twarz i gubi sync). Wejście: klatka + `audio_url` (kwestia + 0,6 s pad) + `prompt` ekspresji. Scena dostaje n=2.
- **mc** (Kling 2.6 Motion Control) — sceny GESTU CIAŁA bez mowy (podanie pasma, potrząśnięcie lokami). Driving 3-10 s z ORYGINAŁU dziedziczy mikro-timing (swobodna generacja dryfuje w niemożliwe pozy). Postać widoczna przez CAŁY klip, bez cięć. Scena dostaje n=2.
- **flf** (Kling 2.5 first+last) — MAKRO MECHANIZMU bez ciała (komora urządzenia, strumień, before/after detalu). Deterministyczny → bez N (chyba że fizyka płynów).
- Klatki: **nano-banana/edit** z rolami obrazów — patrz `PROMPTY-BIBLIOTEKA.md` (1).

## 3. Persona (kotwica tożsamości)
- **`face_ref.png`** = kanoniczna twarz z ujęcia hero (nie z 1 losowej klatki) — wchodzi jako rola „face" do KAŻDEJ klatki nano-banana.
- **Brązowe oczy JAWNIE** w każdym promcie OmniHuman: `"warm brown eyes"` — OmniHuman potrafi zmienić kolor oczu między scenami (incydent 0b/6).
- `identity.eye_color: "warm brown"`, `identity.face_ref: "refs/face-ref.png"` w KARCIE.
- **Bramka tożsamości** per scena: twarz i kolor oczu vs `face_ref`; embedding twarzy (insightface) vs face_ref daje liczbowy dryf.

## 4. Gramatyka czynności „urządzenie pracuje na ciele"
Uogólnienie z lokówki (`grammar` w KARCIE, wchodzi w briefy scen): urządzenie **DOCIŚNIĘTE do punktu na ciele** (skroń/policzek/kark); prowadzenie **pod napięciem** drugą ręką; uwolnienie = **zjazd urządzenia wzdłuż** obszaru pracy, rezultat wysuwa się spodem; **wzrok wyprzedza czynność**; urządzenie stale w JEDNEJ dłoni, druga ma ciągłą rolę (podaje→prowadzi→wskazuje). Strona kadru stała (`scenography` — u pilota: prawa dłoń/prawa skroń/prawa strona).

## 5. Łuk emocji — min. 4 zwroty (bez tego = „reklama")
Sceptyczny deadpan (hook) → skupienie/napięcie → **ZASKOCZENIE+śmiech** przy pierwszym rezultacie → duma „patrzcie" → drugi szok (trwałość/lustro). Wzrok krąży kamera↔urządzenie↔obszar pracy, NIE stały eye-contact. OmniHuman: **jawny prompt ekspresji per scena** (`emotion` w blueprincie). Asymetria/transformacja NA EKRANIE: pół zabiegu zrobione przez ~70% video (zakaz skoku „przed→po"; transformacja trwa na ekranie = retencja).

## 6. VO i długość scen
VO = **ElevenLabs v3** z tagami emocji `[skeptical]`/`[gasp]`/`[laughs]` i PAUZAMI; licz ~14 zn/s. **Scena mówiona trwa = długość kwestii + 0,6 s pad** (driving OmniHuman = kwestia + `apad=pad_dur=0.6`). Miks z realną dynamiką (dip muzyki w suspensie, pik na reveal) robi `montaz.py`.

## 7. Które sceny dostają n=2
**Wszystkie `mc` i `omnihuman`** (ryzyko dryfu twarzy/pozy) + sceny fizyki płynów. `flf` makro bez N. Auto-wybór: najmniej flag bramki wygrywa. +$1-1,5/spot.

## 8. PUŁAPKI SPECYFICZNE
1. **DRYF TWARZY OmniHuman między scenami** (największy AI-tell wg audytu, ocena 5/10). Jedna kotwica nano-banana NIE wystarcza. Fix: face-swap odstających klatek nano-bananą z `face_ref` → regeneracja OmniHumanem; kontrola embeddingu twarzy vs face_ref na klatkach granicznych. Najtańszy unik = sceny makro bez twarzy tam, gdzie się da.
2. **DUPLIKAT PRODUKTU z gestykulującej dłoni w MC** (17.07 MC zhalucynował drugi egzemplarz, bo driving miał tam gestykulację). **Driving-check dłoni**: przed renderem MC spisz, co robi KAŻDA dłoń w drivingu — jeśli wolna dłoń manipuluje obiektem, klatka startowa musi jej dać właściwy obiekt albo zmień fragment drivingu. Prompt: `"EXACTLY ONE device, the other hand is EMPTY"` + negative `second device, duplicate product`.
3. **PRZECIEKI BIŻUTERII/PAZNOKCI z referencji pozy** (pierścionki, lakier, brandowany kabel z klipu referencyjnego). Referencja pozy daje TYLKO układ ciała; tożsamość produktu z Ali, twarz z face_ref. Negative: `rings, nail polish, jewelry`; `forbidden_leaks` w KARCIE. **Gdy CAŁY wzorzec ma inny kolor/wariant urządzenia niż nasza galeria Ali** → renderuj ZAWSZE wg Ali, kolor/wariant wzorca do `forbidden_leaks` (referencja ruchu silnie ciągnie ku barwie wzorca).
4. **ZMIANA KOLORU OCZU** — patrz §3, „warm brown eyes" w każdym promcie + bramka.
5. **CIĄGŁOŚĆ REKWIZYTÓW** (kabel!) — kolor/obecność kabla i rekwizytów identyczne we wszystkich scenach z urządzeniem (`consistency` w blueprincie).
