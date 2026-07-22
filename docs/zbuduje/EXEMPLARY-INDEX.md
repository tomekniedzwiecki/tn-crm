# EXEMPLARY-INDEX — rejestr zbudowanych landingów (koło zamachowe reuse)

> **Teza.** Ten plik jest **rejestrem retrieval'owym**, nie nową bramką. Fabryka nie startuje
> od zera: przy F1 sięga po **2–5 najbliższych dobrych wzorców** (po **typie produktu** / archetypie),
> podaje je jako **few-shot** i **reużywa szkieletów** (moduły, rytm sekcji, mechanika CTA, gęstość dowodu).
> Priorytet Tomka = **JAKOŚĆ**; rejestr ją PODNOSI, bo koder zaczyna od sprawdzonego rzemiosła zamiast improwizować.
>
> **⛔ Exemplary WYŁĄCZNIE dla rzemiosła — kod, rytm sekcji, mechanika, gęstość — NIGDY dla wizji.**
> Świat / paleta / archetyp / archetyp hero to **decyzja kreatywna per produkt** (patrz pamięć: „KIERUNEK
> KREATYWNY = moja decyzja"). Kopiowanie wizji = **rodzeństwo** (masażer↔Drapek były 9/10 „ta sama strona
> z podmienionym produktem" — dlatego istnieje cross-landing gate: ΔE≥15, font≠, archetyp≠, sekwencja LCS<80%).
> Rejestr karmi **jak zbudować**, nigdy **jak ma wyglądać**.
>
> **Charakter:** ADDITYWNY. Nie zmienia żadnego zachowania generacji ani żadnej bramki. Czysty katalog.

Źródło: `sklepy/tomek-niedzwiecki/<slug>/index.html` (12 plików, stan 2026‑07‑21).
Link publiczny: `https://crm.tomekniedzwiecki.pl/sklepy/tomek-niedzwiecki/<slug>/`

---

## Baza modułów (wspólna dla WSZYSTKICH 12 — nie powtarzam w kolumnie „Moduły")
`sticky-buy@1` (mobile) · `faq-accordion@1` (natywny `<details>`) · `<footer>`\* · pay-badges (BLIK/Visa/MC/COD) ·
`[data-checkout]` CTA (≥4). Kolumna **Moduły** wymienia tylko to, co PONAD bazę.
\* footer: `usmieszek`/`usmieszek-checkout` go **nie mają**; `latarek` ma go jako `<section id="footer">`.

**Normalizacja sekwencji** — id z DOM sprowadzone do typów kanonicznych przez `gate-manifest.json`
(`sekcja_typy.aliasy` + `dopasowanie.aliasy_sekcji`): `zaufanie/cod-strip/platnosc/jak-zamowic → trust`,
`benefits → korzysci`, `video/tiktok → wideo`, `reviews/social → opinie`, `gallery/kolory → galeria`,
`oferta/zestaw → zamow`, `cta/recta → mid-cta`, `finalcta → final`. Sekcje produktowe bez mapy
(np. `prawda`, `konstrukcja`, `sterowanie`, `dla-kogo`, `parametry`) zostają **verbatim** — to one niosą
sygnał różnicowania (`_kursywa_`).

---

## Rejestr

| Slug (link) | Typ produktu (marka · cena) | Archetyp hero | Akcent · Font display | #sek · KB | Moduły (ponad bazę) | Sekwencja sekcji (znormalizowana) | Poziom |
|---|---|---|---|---|---|---|---|
| **[masazer](https://crm.tomekniedzwiecki.pl/sklepy/tomek-niedzwiecki/masazer/)** | Masażer karku/ramion (Odprężek · 299 zł) | **A** — scena full‑bleed + scrim + kolumna copy z kartą oferty | `#D97716` bursztyn · Baloo 2 + Nunito Sans | 14 · 136 | lightbox · demo TOR‑I (crossfade) · dedykowana **mid‑cta** | hero › trust`_(platnosc)_` › problem › demo › korzysci`_(sterowanie)_` › korzysci`_(bezkabla)_` › galeria › opinie › porownanie › **mid‑cta** › korzysci`_(materialy)_` › zamow › faq › final | ✅ **WZORZEC** |
| **[mata](https://crm.tomekniedzwiecki.pl/sklepy/tomek-niedzwiecki/mata/)** | Mata do akupresury + wałek (Kłujek · 179 zł) | **D** — „kanapka": copy górą / scena środkiem / karta oferty dołem | `#5E3A6E` **fiolet (outlier)** · Fraunces + Karla | 14 · 136 | lightbox · `--font-display` token jawny · hero‑video‑inject | hero › trust › problem › `_prawda_` › demo › korzysci`_(konstrukcja)_` › zamow`_(zestaw)_` › `_gdzie_` › galeria › opinie › `_dla-kogo_` › zamow › faq › final | ✅ **WZORZEC** |
| **[drapek](https://crm.tomekniedzwiecki.pl/sklepy/tomek-niedzwiecki/drapek/)** | Deska‑drapak dla psa (Drapek · 149,90 zł) | **A** — scena full‑bleed + scrim + jedna karta copy (brand lockup) | `#E0954A` ochra · Baloo 2 | 13 · 132 | wideo‑rail · lightbox · **źródło `footer@1`** | hero › trust › problem › demo › wideo › korzysci › galeria › korzysci`_(material)_` › opinie › porownanie › zamow › faq › final | ✅ **WZORZEC** |
| **[loczek](https://crm.tomekniedzwiecki.pl/sklepy/tomek-niedzwiecki/loczek/)** | Automatyczna lokówka 32 mm (Loczek · 139,90 zł) | **A** — scena full‑bleed + scrim + kolumna copy | `#F1573A` koral · Playfair Display | 12 · 120 | **wideo‑rail** · lightbox · (**źródło modułów @1 — plik do kosza**) | hero › trust › problem › demo › wideo › korzysci › porownanie › opinie › galeria › zamow › faq › final | ⛔ **ANTY‑WZORZEC** |
| **[odpalak](https://crm.tomekniedzwiecki.pl/sklepy/tomek-niedzwiecki/odpalak/)** | Rozrusznik + kompresor 150 PSI (Odpalak · 599 zł) | **A** — scena full‑bleed + scrim + kolumna copy + offer‑card | `#F2792B` bursztyn (`--amber`) · Archivo Black + Archivo | 12 · 104 | wideo‑rail (`vid-rail`) · lightbox · (**plik do kosza — slivery wideo**) | hero › trust › problem › demo › wideo › korzysci › porownanie › galeria › opinie › zamow › faq › final | ⛔ **ANTY‑WZORZEC** |
| **[latarek](https://crm.tomekniedzwiecki.pl/sklepy/tomek-niedzwiecki/latarek/)** | Obcinacz pazurów 2w1 z LED (Latarek · 79,90 zł) | **A** — scena full‑bleed + scrim + kolumna copy + karta | `#F26B4F` koral · Lora + Manrope | 12 · 104 | **interakcja (TOR‑I)** · lightbox · footer=`section#footer` · brak wideo | hero › trust › problem › demo › **interakcja** › korzysci › porownanie › galeria › opinie › zamow › faq › final | ◽ do oceny |
| **[switek](https://crm.tomekniedzwiecki.pl/sklepy/tomek-niedzwiecki/switek/)** | Budzik ze wschodem słońca / wake‑up (Świtek · 129,90 zł) | **A** — foto‑tło pełne + kolumna copy + karta oferty | `#E85D4A` cynober · Fraunces + Manrope | 13 · 132 | wideo (embed) · sceny animowane „świt" (dużo inline CSS) | hero › trust › demo › `_scene_` › `_band-morning_` › `_tabs_` › wideo › opinie › `_dla-kogo_` › zamow › faq › final | ◽ do oceny |
| **[blasik](https://crm.tomekniedzwiecki.pl/sklepy/tomek-niedzwiecki/blasik/)** | Maska LED do twarzy, 7 kolorów (Blasik · 149 zł) | **A′** — scena full‑bleed + kolumna copy, oferta inline (bez karty) | `#E85F3D` cynober · Manrope | 11 · 72 | brak wideo · brak lightbox (najlżejszy „bogaty") | hero › trust`_(jak-zamowic)_` › demo`_(rytual)_` › galeria`_(kolory)_` › korzysci › porownanie › galeria › opinie › zamow › faq › final | ◽ do oceny |
| **[zmiescik](https://crm.tomekniedzwiecki.pl/sklepy/tomek-niedzwiecki/zmiescik/)** | Pompka próżniowa + 15 worków (Zmieścik · 64,90 zł) | **B** — foto‑tło + hero‑inner: copy + karta‑aside (split na tle) | `#C94B38` rdza · Manrope | 13 · 92 | wideo (embed) · pasek `cod-strip` | hero › trust › wideo › demo`_(efekt)_` › zamow`_(zestaw)_` › korzysci`_(zastosowania)_` › demo`_(jak)_` › `_parametry_` › opinie › porownanie › zamow › faq › final | ◽ do oceny |
| **[chlodzacy-koc](https://crm.tomekniedzwiecki.pl/sklepy/tomek-niedzwiecki/chlodzacy-koc/)** | Chłodzący koc na upalne noce (Chłodzik · 59,90 zł) | **B** — foto‑tło + hero‑inner: copy + karta‑aside | brak `--cta`; navy `#123A6C` + koral `#FB5A4F` · Poppins | ~9 · 56 | wideo (embed) · **paleta chłodna** (jedyny nie‑ciepły) | hero › trust`_(cod-strip)_` › korzysci › galeria › wideo › opinie › porownanie › `_dla-kogo_` › zamow/final | ◽ do oceny |
| **[usmieszek](https://crm.tomekniedzwiecki.pl/sklepy/tomek-niedzwiecki/usmieszek/)** | Szczoteczka U‑kształtna (Uśmieszek · 129,90 zł) | **C** — wyśrodkowany stack NA scenie (chip → H1 → bullety‑ikony → oferta) | `#F36B43` koral · Cormorant Garamond + Manrope | 10 · 100 | wideo (embed) · brak footer | hero › trust › problem › demo › wideo › korzysci › porownanie › opinie`_(social)_` › zamow › faq | ◽ do oceny |
| **[usmieszek-checkout](https://crm.tomekniedzwiecki.pl/sklepy/tomek-niedzwiecki/usmieszek-checkout/)** | jw. — **wariant z checkoutem inline** (Uśmieszek · 129,90 zł) | **C** — jak `usmieszek` (bliźniak) | `#F36B43` koral · Cormorant Garamond + Manrope | 10 · **172** | **checkout‑inline** (`data-zc-config`) · wideo | hero › trust › problem › demo › wideo › korzysci › porownanie › opinie`_(social)_` › zamow › faq | ◽ do oceny |
| **[ugniatek](https://crm.tomekniedzwiecki.pl/sklepy/rafal-hoffa/ugniatek/)** | Płaski masażer 6 głowic, 2 uchwyty (Ugniatek · 189 zł) | **A** — hero-video full-bleed + scrim + karta copy (brand lockup) | `#0B6B64` głęboka morska zieleń · Space Grotesk + Work Sans | 10 · 203 | **checkout-inline@2 steps** · **hero-video (Kling i2v)** · TOR-I dwie-formy (przełącznik L/P) · count-up (22 300 mm²) · motion `data-mo` (6 wariantów) · sticky-buy@1 · footer@1 | hero › **interakcja**`_(dwie-formy)_` › anatomia › sterowanie › wieczorem › **mid-cta** › zestaw › zamow`_(checkout-inline)_` › faq › final | ◽ do oceny — **1. przebieg produkcyjny wf2** (klient Hoffa), gate 0 FAIL (PASS=122) |

**Uwaga o bliźniakach:** `usmieszek` i `usmieszek-checkout` to ta sama strona; `-checkout` dodaje osadzony
checkout (`data-zc-config`, +72 KB). Do reuse traktuj jako **jeden wzorzec** + wariant „inline checkout".

---

## Jak używać w F1 (dobór wzorców)

1. **Dobór 2–5, nie 1.** Z rejestru wybierz **trafność + różnorodność**:
   - *trafność* — najbliższy **typ produktu** (uroda: `blasik`/`loczek`/`usmieszek`; zwierzę: `drapek`/`latarek`;
     dom/komfort: `mata`/`masazer`/`chlodzacy-koc`/`switek`/`zmiescik`) lub najbliższy **archetyp hero**;
   - *różnorodność* — celowo dołóż wzorzec o **innym akcencie/foncie/sekwencji**, żeby few‑shot nie kolapsował
     do jednego „świata". Mata (fiolet, Fraunces, kanapka‑hero) = dobry dywersyfikator.
2. **Bierz WZORCE, omijaj ANTY‑WZORCE jako całość.** Ucz kod na `masazer`/`mata`/`drapek`.
   Z `loczek`/`odpalak` reużywaj **wyłącznie moduły kanoniczne** (`wideo-rail@1`, `lightbox@1`,
   `sticky-buy@1`, `faq-accordion@1` — wydzielone z `loczek@8726382b` przed audytem R13), **nigdy pliku strony**.
3. **Rotuj — nigdy 1 stały skeleton.** Ten sam wzorzec podawany za każdym razem = fabryka klonów.
   Zmieniaj zestaw few‑shot między produktami; niech cross‑landing gate (ΔE≥15, font≠, archetyp‑hero≠,
   sekwencja LCS<80%) pozostanie **strażnikiem różnicy** — rejestr karmi rzemiosło, gate pilnuje tożsamości.
4. **Co bierzesz vs czego NIE.** ✅ moduły, rytm sekcji, mechanika CTA (mid‑cta + final + re‑CTA), gęstość
   dowodu, wzorce interakcji (TOR‑I `latarek`/`masazer`). ⛔ paleta, font, archetyp hero, świat, packshoty —
   to projektujesz od nowa pod produkt (kierunek kreatywny = decyzja Tomka/kreacji, nie kopiuj).

---

## Weryfikacja (2026‑07‑21)

- **Policzono 12 landingów** = liczba plików `sklepy/tomek-niedzwiecki/*/index.html`. **Każdy ma wiersz** (12 wierszy).
- **Poziom** wyłącznie wg pamięci + `docs/zbuduje/moduly/MODULY.md` — WZORCE: `masazer`/`mata`/`drapek`;
  ANTY‑WZORCE: `loczek`/`odpalak` (MODULY: „Loczek/Odpalak jako pliki landingów idą do kosza — moduły
  przejmują ich rolę"); pozostałe **„do oceny"** (ocena NIE zmyślana).
- **Spot‑check wobec realnych plików:**
  - `mata` — `--cta:#5E3A6E` (l. 31, jedyny fiolet) + `--font-display:"Fraunces"` (l. 28) ✔; jedyny z modułem
    lightbox jawnym w tokenach + hero „kanapka" (copy `hero-intro` → `hero-scene` → `hero-offer`, l. 238–264) ✔.
  - `masazer` — `--cta:#D97716` bursztyn (l. 39) ✔; dedykowana sekcja `#cta` (mid‑cta, l. 1006) obecna ✔;
    14 sekcji od `#hero` do `#final` ✔.
  - `drapek` — `--cta:#E0954A` (l. 40) ✔; hero `picture.hero-media`+`hero-scrim`+`hero-card` z `brand-lockup`
    (l. 576–585) ✔; źródło `footer@1` (MODULY, 2026‑07‑18) ✔; `family=Baloo 2` (l. 21) ✔.
- **Moduły** liczone markerami: `sticky-buy` (12/12), `<details>` faq (12/12), `<footer>` (9/12; `latarek`
  = `section#footer`; brak w `usmieszek`/`-checkout`), `.gitem`/`data-full` lightbox (6: `drapek`,`latarek`,
  `mata`,`odpalak`,`loczek`,`masazer`), wideo‑rail (`loczek`,`odpalak`=`vid-rail`,`drapek`),
  `data-zc-config` checkout‑inline (tylko `usmieszek-checkout`).
