# MAPA ASSETÓW — Brzuszek · F3 (2026-07-23)

Klasy: **P** = packshot/derywat realny · **U** = UGC/wideo realne · **S** = scena generowana
(multi-ref g0-retusz + crop makiety) · **R** = crop/retusz realny bez generacji ($0).
Baza: `attachments/bud-assets/brzuszek/assets/` (Storage public).
URL bazowy: `…/storage/v1/object/public/attachments/bud-assets/brzuszek/assets/<plik>`.

| Asset (plik) | Klasa | Slot (sekcja / rola) | Kadr źródłowy | Uwagi |
|---|---|---|---|---|
| `sc-hero.webp` | S | hero (full-bleed C, ciężar PRAWA; pętla ANIM #1) | crop makiety 01 + g0 | klęk na U-wałku, twarz odwrócona |
| `sc-hero-mobile.webp` | S | hero mobile (pion 3:4, osobny kadr m) | crop makiety 01 + g0 | ta sama poza, kadr pionowy |
| `sc-reg-side.webp` | S | regulacja (obraz w module B, LEWA) | crop makiety 04 + g0 | izolacja na lila-mgle, bez osoby; **mobile = CSS-crop tego kadru** (izolacja produktu na polu — kadr pionowy trywialny; brak osobnej generacji, decyzja koszt-świadoma) |
| `sc-partie-core.webp` | S | wiele-partii kafel 1 (CORE, foto LEWA) | crop makiety 06 + g0 | crunch, klęk na U-wałku |
| `sc-partie-glute.webp` | S | wiele-partii kafel 2 (GLUTE, foto PRAWA) | crop makiety 06 + **g4 pose** + g0 | side leg raise; poza z g4 (POZA, nie styl) |
| `sc-partie-arms.webp` | S | wiele-partii kafel 3 (ARMS, foto LEWA; ANIM #2 linka) | crop makiety 06 + g0 | stojąca na linkach oporowych |
| `sc-partie-legs.webp` | S | wiele-partii kafel 4 (LEGS, foto PRAWA) | crop makiety 06 + g0 | czysty detal podstawy, **BEZ stopy** |
| `sc-wytrz-detal.webp` | S | wytrzymalosc (obraz w module B, LEWA; ANIM #3 światło) | crop makiety 07 + g0 | niski 3/4 ramy, bez osoby; **mobile = CSS-crop** (izolacja) |
| `sc-sklad-rozloz.webp` | S | skladanie dyptyk **L** (rozłożona) | crop makiety 09 + g0 | klęk, dłoń na mechanizmie |
| `sc-sklad-zloz.webp` | S | skladanie dyptyk **R** — ALTERNATYWA | crop makiety 09 + **UGC 2-0** + g0 | generacja warunkowa PRZESZŁA F3A; **NIE główny** (patrz niżej) |
| `ugc-2-0-retusz.webp` | U / R | skladanie dyptyk **R** — **GŁÓWNY** wizual złożonej | UGC `2-0.webp` rehost + retusz | podpis „zdjęcie od kupującego"; MERACH + naklejki wyretuszowane (cv2 inpaint) |
| `packshot-alpha.png` | P | mid-cta, zamow (miniatura), jak-cwiczysz (TOR-I cutout warstwowy) | g0-retusz biel→alpha | 1591×1528, alpha; TYLKO na polach koloru + TOR-I |
| `det-konsola.webp` | R | jak-cwiczysz (TOR-I punkt podparcia: klatka/przedramiona) · funkcje | crop g0-retusz | makro: LCD + przycisk + 2 wałki + kierownica |
| `det-uwalek.webp` | R | jak-cwiczysz (TOR-I punkt: kolana) | crop g0-retusz | makro: U-wałek na wózku |
| `det-podstawa.webp` | R | wytrzymalosc (ikona/detal poprzeczki) | crop g0-retusz | makro: poprzeczka T + szare końcówki |
| `det-linki.webp` | R | wiele-partii/ramiona (detal) · funkcje | crop g0-retusz | makro: linki + czarne piankowe uchwyty |

## Doktryna stanu złożonego (G-SKLAD-ZLOZ)
GŁÓWNY wizual = **`ugc-2-0-retusz`** (realne „zdjęcie od kupującego" — autentyk > generacja, PLAN §9 /
PRZEWODNIK). `sc-sklad-zloz` (generacja warunkowa) PRZESZŁA F3A i jest **czystą alternatywą S** do
dyspozycji F4 (kadr pionowy oparty o kanapę). Reguła: przy FAIL F3A byłby WYŁĄCZNIE UGC — F3A PASS
więc oba dostępne, ale placement/priorytet decyduje główna sesja (domyślnie UGC-first).

## Allowlista slotów
- Sceny **S** NIGDY jako „dowód produktu" (sekcja `galeria-dowodowa` = SKIP w PLAN).
- **packshot-alpha** TYLKO na jasnych polach koloru (mid-cta / zamow) + warstwowy cutout TOR-I;
  poza światem lifestyle (WYJĄTKI ŚWIATA).
- **UGC** wyłącznie z podpisem „zdjęcie od kupującego", bez gwiazdek / liczb (ZAKAZ social-proof).
- **det-** (R) tylko w kartach funkcji / TOR-I / detalach wytrzymałości — nie jako samodzielny hero.

## Kadry pionowe d↔m (partie / skladanie)
Generacja 1024×1536 (2:3) obsługuje ZARÓWNO desktop 1200×1500 JAK I mobile 1080×1350 (oba 4:5) —
F4 dokadrowuje `object-fit` do 4:5; brak osobnej generacji mobile dla kafli/dyptyku (ten sam kadr,
świadome). Osobny kadr mobile TYLKO dla hero (full-bleed, framing istotny).

## Wagi (weryfikacja twarda w F6)
Sceny WebP q84: hero 1536×1024 / partie-sklad 1024×1536 — zakres ~106–200 KB/scena; `packshot-alpha.png`
835 KB (alpha, lossless) → w F4 osadzić jako miniaturę (downscale) lub przekonwertować do WebP-alpha
jeśli 1. ekran przekroczy budżet. `det-*` ≤ 14 KB. UGC 36 KB.

## distinct product views (≥5) ✓
hero (3/4 od tyłu, klęk) · reg-side (3/4 profil izolowany) · partie-core (3/4 blisko) · partie-glute
(3/4 bok, noga w bok) · partie-arms (bok, stojąca) · partie-legs (niski detal podstawy) · wytrz-detal
(niski 3/4 ramy) · sklad-rozloz (klęk bok) · sklad-zloz/UGC (złożona) · packshot-alpha (izolowany) ·
det-cropy (makro ×4) = **11 widoków**, zero klonów pozy.
