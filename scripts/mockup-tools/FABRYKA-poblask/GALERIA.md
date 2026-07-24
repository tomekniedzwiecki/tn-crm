# GALERIA — kuracja AliExpress (F0.5, POBLASK) · 2026-07-24

Aukcja źródłowa: `1005006904591428`, **source=detail (ZAUFANE, gate F0 PASS)**. 8 kadrów
(`ali_snapshot.images`): g0–g5 = galeria detail (WebP 900²), g6 = packshot zestawu (avif),
g7 = render sklepowy (`bud-shop-imgs`, jpg). Proporcje g0–g6 ≈ kwadrat → `--gal-aspect: 1/1`;
g7 ~1/1. Werdykty zapisane też w `bud_tt_products.gallery_curated`.

⚠️ **CECHA KLUCZOWA:** produkt to **światło** — większość kadrów pokazuje taśmę ŚWIECĄCĄ (RGB),
co jest esencją produktu. Brak „wyłączonego" packshotu na białym; **jest za to czysty pokaz
kolorów (g4) i realne montaże (g5)** — nie trzeba generować packshotu od zera (jak przy zaklipku).
Kolejność on-page (F4): scena kolor (g4/g7) → montaż (g5) → app/muzyka (g2) → detal sterownika (g3).

## KEEP (4 on-page + 1 detal) — na stronę PO CROP-ie (klasa R)
| kadr | rola | werdykt | retusz/crop | uwaga |
|---|---|---|---|---|
| g4 | detal/kolory — ta sama taśma w 9 barwach (siatka 3×3) | **KEEP** | brak (zero tekstu) | **najczystszy dowód „pełne RGB / 64 kolory"**; giętka akrylowa taśma świecąca; można pokazać całość albo crop 1 panelu |
| g5 | in-use — 4 realne montaże wzdłuż deski (drewniana listwa), świeci tęczą | **KEEP** | drobny crop (zero wypalonego tekstu) | autentyczne montaże, świecenie na desce; dowodzi_zastosowania: ambient wzdłuż deski |
| g7 | lifestyle/hero-ref — wnętrze nocą, niebieska poświata + skyline + zestaw + app | **KEEP (CROP)** | ✂️ crop GÓRNEJ sceny wnętrza (bez dolnego kolażu zestawu + etykiet app); ⚠️ scena aspiracyjna/composite (idealizacja full-interior) | premium nastrój hero; jako REF nastroju, nie „dowód że jedna taśma robi całe auto" |
| g2 | demo/app — dłoń z telefonem (kolory) + taśma wzdłuż deski + footwell | **KEEP (CROP)** | ✂️ usuń nałożone grafiki equalizera + nut muzycznych; retusz „Fccemc" na ekranie jeśli czytelny | dowód sterowania z aplikacji + reakcji na muzykę (crop do dłoni+telefon+taśma) |
| g3 | detal — sterownik USB + przycinalność + elastyczność (3 panele) | **KEEP (CROP/DANE)** | ✂️ crop czystego sterownika USB (dół-lewo, białe tło) i/lub kadru przycinania nożyczkami; usuń wypalony EN | **[DANE]: giętka, przycinalna (uwaga na diody), USB plug&play, przycisk on/switch/off** → §2b KARTY |

## DANE (nie na stronę as-is) — TREŚĆ → materiał do KARTY
| kadr | klasa | werdykt | dlaczego | treść → KARTA |
|---|---|---|---|---|
| g0 | infografika-z-tekstem | **DANE** | wypalone „SYMPHONY MOOD LIGTHS (typo) for universal car models" + pasek USP; render dashboardu z tęczową taśmą | **[DANE/USP]: USB interface · Mobile App & Remote Control · Non Destructive Installation** → §2b/§3; scena dashboardu = REF nastroju (nie as-is) |
| g1 | before/after-infografika | **DANE** | wypalone „BEFORE/AFTER" + „slightly monotonous… / romantic atmosphere, cool and psychedelic" | **[DANE]: kąt problem→rozwiązanie** (ciemna, martwa deska → poświata RGB); scena AFTER = REF sceny `rozwiazanie`; „psychedelic" = BEŁKOT-CUT |
| g6 | packshot zestawu (wariant „in 2") | **DANE** | wypalone „110CM * 2" — pokazuje **2 taśmy** (wariant „in 2", NIE bazowy) + pilot + sterownik + taśma klejąca + klin | **[DANE]: zawartość zestawu** (sterownik/pilot/taśma klejąca/klin) → §2b; ⛔ nie jako packshot bazowego (bazowy = 1 taśma) |

## Zdjęcia kupujących (UGC — pula do sekcji „zdjęcia od kupujących", klasa dowodowa)
Filtr twardy: `stars==5` — **WSZYSTKIE 20 recenzji = 5★**, 41 zdjęć. RANKING przy buildzie (F2/F3),
nie pierwsze-lepsze. Kandydaci MOCNI (ostre, taśma świeci w realnym aucie, bez pudełka/screena):

| zdjęcie | recenzja | co pokazuje | ocena wstępna |
|---|---|---|---|
| r15_0 / r15_1 | [—] | Audi A3 — niebieska taśma wzdłuż deski, czysty montaż | **MOCNY** (autentyczny, ostry) |
| r12_0 / r12_2 | [—] | Mazda CX-30 — fioletowa taśma wzdłuż deski, dzień/wnętrze | **MOCNY** |
| r0_0 | [0] | deska z tęczową taśmą (gradient) | mocny (para z tekstem op.[0]) |
| r10_0 | [10] | czerwona falująca taśma na desce (nocą) | mocny |
| r7_1 / r7_2 | [7] | Smart — niebieska/tęczowa taśma + footwell | mocny |
| r18_0 | [—] | deska + niebieska taśma + panel klimatyzacji | dobry |
| r14_1 | [14] | dłoń trzyma zwiniętą świecącą taśmę (tęcza) | dobry (dowód elastyczność+kolor) |
| r3_0 / r3_1 | [3] | kokpit nocą, fioletowa poświata | dobry |
| — ODRZUĆ | r1_0/r1_1/r1_2 (prawie czarne), r2_0/r9_0 (ekran/screen), r11/r16/r17/r6_0 (**pudełka z nadrukiem „Vehicle Intelligent Lighting System"**), r13_0 (test na biurku, off-context) | — | poza kanonem / white-label / ciemne |

Uwaga: sekcja „zdjęcia od kupujących" = **BUILD** (materiał obfity i zgodny z kanonem — inaczej niż
zaklipek). Selekcja 4–6 najlepszych par (zdjęcie+cytat z TEJ SAMEJ recenzji) w F2/F3.

## Białe-labelowe RETUSZE (przed użyciem kadru na stronie)
- **Wideo produktowe** — watermark „FCCEMC®" lewy-górny róg → CROP/retusz (WIDEO.md).
- **g2** — „Fccemc" na ekranie monitora auta (jeśli czytelne po crop) → retusz.
- **UGC** — pudełka „Vehicle Intelligent Lighting System" → NIE używać tych kadrów.
Sama taśma i sterownik NIE mają czytelnego nadruku marki na kadrach świecenia — dobrze.

## Notatka kompozycji
Galeria BOGATA po odsiewie: 4 keep on-page (g4 kolory + g5 montaże + g7 crop hero + g2 crop app) +
g3 detal + obfita pula UGC (autentyczne montaże). **Hero/packshot bazowy = crop/generacja F3**
(taśma 110 cm świecąca jednym łukiem wzdłuż deski, nocą). Proporcje kafli 1/1. Sekcja galerii
on-page: g4 (kolory) → g5 (montaż) → g2 (app/muzyka) → g3 (sterownik) → sceny F3 + UGC wplecione.
