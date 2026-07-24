# GALERIA — kuracja + white-label · NAKRĘCIK · F0.5 · 2026-07-24

Procedura: `docs/zbuduje/GALERIA-ALI.md`. Klasa R (na stronę TYLKO z kuracji). Źródło:
`bud_tt_products.ali_snapshot.images` (8 kadrów) → zapis werdyktów do
`bud_tt_products.gallery_curated`.

## 1. Werdykty per kadr (8: g0–g6 + g7 TikTok cover)
| kadr | keep | rola | werdykt | powód / crop |
|---|---|---|---|---|
| g0 | ✅ | ref-bryła + packshot | **CROP** | packshot composite (grafitowa obręcz + czarny pierścień + telefon). Usuń wordmark „TELESIN" (lewy-górny) + 3 insety po prawej. Główna referencja bryły do F3. |
| g1 | ✅ | lifestyle-noszenie | **CROP** | górne ujęcie: osoba nosi uchwyt na szyi (telefon na wysokości klatki). Usuń tytuł EN „Sleek and minimalist" + dolne porównanie stare/nowe + zieloną etykietę. Referencja sceny noszenia. |
| g2 | ❌ | ref-przegub | **ODRZUĆ** | infografika + wypalony „TELESIN laboratories" + „10000" (bełkot-cut §2b KARTA). Mechanika przegubu = referencja do F3, treść niecytowana liczbą. |
| g3 | ✅ | in-use-POV | **CROP** | 3 realne kadry POV (dłoń ustawia telefon na uchwycie na szyi, tryby ujęcia). Usuń tytuł EN „Switch between…". Najlepsza referencja scen demo/POV. |
| g4 | ✅ | składanie-w-dłoni | **CROP** | złożony uchwyt mieści się w dłoni + noszony na szyi. Usuń tytuł „Folding storage / Lightweight travel". Referencja sceny przenośności. |
| g5 | ❌ | ref-specs | **ODRZUĆ** | diagram parametrów (220 g, 280×200×170 mm, kolory Grey/Green, materiały). **KLUCZOWE ŹRÓDŁO specs do KARTA** — na stronę NIE (EN + diagram). |
| g6 | ✅ | ref-bryła-alt | **CROP** | drugi packshot composite (redundant z g0). Crop „TELESIN" + insety. Referencja zapasowa do F3. |
| g7 | ❌ | ref-użycie-DIY | **ODRZUĆ** | okładka TikTok innego twórcy (remont/DIY POV), wypalony tekst „DAY THREE LIVINGROOM REMODEL". Potwierdza zastosowanie DIY (WEWN.), brandowana → nie na stronę. |

**Bilans:** 8 kadrów → **5 keep (crop-kandydaci: g0, g1, g3, g4, g6) / 3 odrzuty (g2, g5, g7)**. **Zero czystego packshotu** (każdy
keep ma wypalony „TELESIN" + tekst EN) → grafitowy i zielony packshot **generujemy w F3**. Galeria
na stronie = sceny F3 zbudowane z kuracji + packshoty, NIGDY surowe kadry z wypalonym brandem.

## 2. WHITE-LABEL (retusz obowiązkowy)
- Marka **„TELESIN"** i sklep **„TELESIN Photography Store"** — **NIGDY na stronie.**
- Wordmark „TELESIN" wypalony na: g0/g6 (lewy-górny), g1/g2 (na urządzeniu + infografice), g3/g4
  (molowany na module ramienia). Molowany napis na produkcie (drobny) → **packshot F3 renderuje
  BEZ nadruku**; w scenach z prawdziwych kadrów, jeśli „TELESIN" czytelny → RETUSZ/CROP.
- Wideo produktowe: wypalony wordmark + napisy EN → nie self-hostujemy (WIDEO.md).

## 3. ⭐ ZDJĘCIA KUPUJĄCYCH — selekcja (sekcja `zdjecia-kupujacych`, twardy filtr `stars==5`)
Pula rehostowana w Storage `bud-reviews/1005006455949937/`: **10 zdjęć z 4 recenzji, WSZYSTKIE
★5** (rev0–rev3). Cały snapshot to 20× ★5, więc filtr 5★ przechodzą wszystkie; wybór wg jakości
technicznej + produkt w kontekście + pozytywny odbiór pary zdjęcie+tekst.

**Kandydatki (vision-gate):** 10 → **wybrano 5**, odrzucono 5 (redundancja/tło-clutter/kadr).

| plik | recenzja (VERBATIM źródło podpisu) | werdykt | powód |
|---|---|---|---|
| `8-0.webp` (rev3-a) | [3] „…collar is very soft and flexible, the magnetic ring is very strong! I recommend it for those who lack one hand when shooting 👍" | ✅ #1 | zielona obręcz na pościeli + dołączona linka — czysto, pokazuje kolor Green + zestaw |
| `7-0.webp` (rev2-a→rev1-c) | [1] „…Adjustable arm is tight and fit… Underside of mount has a soft padding" | ✅ #2 | zbliżenie modułu przy MacBooku — kontekst twórcy/biurko, detal jakości |
| `0-0.webp` (rev0-a) | [0] „…perfect for first-person (POV) images and creating content." | ✅ #3 | uchwyt złożony w dłoni, jasne tło — czysto, POV/twórca |
| `3-0.webp` (rev1-a) | [1] „Durable structure… Adjustable arm is tight and fit." | ✅ #4 | rozłożone ramię/przegub w dłoni — pokazuje konstrukcję (lekki clutter w tle akceptowalny) |
| `9-1.webp` (rev3-b) | [3] „Very cool magnetic holder… the magnetic ring is very strong!" | ✅ #5 | grafitowa obręcz — prosty, czysty kadr |
| `1-1,2-2,4-1,5-2,6-3` | rev0/rev1 | ❌ | redundantne wobec wybranych / słabszy kadr / clutter |

**Zasada podpisu:** tekst przy zdjęciu = z **TEJ SAMEJ** recenzji (rev0→[0], rev1→[1],
rev2→[2], rev3→[3]). Na stronie tłumaczymy sens na PL (parafraza wierna), gwiazdki = ★5.
⚠️ Molowane „TELESIN" na module jest drobne i autentyczne (realne UGC) — jeśli czytelne w
finalnym kadrze sekcji, delikatny blur/crop; brand NIE jest naszym znakiem.
