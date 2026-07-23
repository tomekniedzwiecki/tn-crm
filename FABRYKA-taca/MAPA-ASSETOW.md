# MAPA ASSETÓW — Rozmrozik · F3 (2026-07-23)

Klasy: **P** = packshot/derywat realny · **U** = UGC/wideo realne · **S** = scena generowana
(multi-ref g0 + crop makiety) · **R** = crop realny bez generacji.
Baza: `bud-assets/rozmrozik/assets/` (Storage attachments, public).

| Asset | Klasa | Slot (sekcja) | Kadr źródłowy | Uwagi |
|---|---|---|---|---|
| sc-hero-frozen.webp (+‑800) | S | hero L (dyptyk) | crop makiety 01 | BEZ produktu (strefa mrozu) |
| sc-hero-thawed.webp (+‑800) | S | hero R (dyptyk; pętla ANIM #1) | crop makiety 01 | v3; zwis tylnego końca modułu = zgodny z g0 (decyzja niżej) |
| sc-problem.webp (+‑900) | S | problem (full-bleed A) | crop makiety 02 | BEZ produktu (EMOCJA↔PRODUKT); mikrofala w tle (v2) |
| sc-demo-place/cover/touch.webp | S ×3 | jak-dziala (TOR-I stany 1-3) | crop makiety 03 | ten sam kadr, zmienia się stan |
| sc-capacity-steak/fish.webp | S ×2 | pojemnosc (toggle) | crop makiety 04 | DOKŁADNIE 4 porcje |
| sc-final.webp | S | final (ANIM #3) | crop makiety 10 | heat-haze + ściereczka |
| fn-modul/panel/plyta/kopula.png→webp | R | funkcje (karty 1-4) | cropy z g0 | karta USB-C = fn-modul (PASZPORT: bez zbliżenia portu) |
| packshot-alpha.png | P | mid-cta, zamow (miniatura) | g0 biel→alpha | 806×538 |
| tt/tt1..tt5.mp4 + *-poster.webp | U | wideo (rail 9:16) | TikTok self-host | tt1=hero klip @sam.shan.shops |
| brand/* (favicon, wordmark, lockup) | P | topbar, head, final | brand-forge | favicon data-URI w F4 |

**Allowlista slotów:** sceny S NIGDY jako „dowód produktu" (galeria dowodowa = SKIP); klasa R
(fn-*) tylko w kartach funkcji; packshot-alpha tylko na polach koloru (mid-cta/zamow).

**distinct product views ≥5:** hero-thawed (3/4 front) · demo (3/4 blisko, 3 stany) ·
capacity (top-down) · final (niski kąt wieczorny) · packshot-alpha (izolowany) ·
fn-cropy (makro) = 6 widoków, zero klonów pozy. ✓

**Wagi:** wszystkie sceny WebP q82-84 ≤1600px; hero ma warianty 800px (picture mobile);
1. ekran (hero L+R 800px + lockup) budżet ≤350 KB — weryfikacja twarda w F6.

**Decyzja rozstrzygająca F3A (2 pary oczu, spór o warunek 2 hero-thawed):**
v2/v3 miały „nawis" tylnego końca modułu poza krawędź topu kopuły. Wzorzec prawdy = g0:
realny packshot pokazuje IDENTYCZNY zwis (moduł dłuższy niż płaski top; stopka nad skosem).
Wymóg „zero overhang" był ponad-paszportowy → **sc-hero-thawed v3 = PASS** (perforacja
koncentryczna naprawiona w v2, osadzenie = 1:1 z g0). Zapis także w WIERNOSC.md i LEDGER.
