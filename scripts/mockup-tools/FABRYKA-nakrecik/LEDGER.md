# LEDGER — NAKRĘCIK (magnetyczny uchwyt POV na szyję)

Rejestr decyzji, kosztów API i odstępstw. Slug `nakrecik`. Projekt
`62e5422a-9475-4e9b-afa3-483c53b62169`, produkt `ee6e4040-1551-4447-a037-3c4bfc8bd878`,
tt `09a2e387-ae53-4268-a20d-8bcdf509e8bb`, ali `1005006455949937`.

## Wzorzec
Zaklipek (`sklepy/tomek-niedzwiecki/zaklipek/` + `scripts/mockup-tools/FABRYKA-zaklipek/`) —
kopiujemy strukturę/jakość/mechanikę, NIE treść. Model per faza wg Z8.

## 🔒 BEZPIECZNIK RENTOWNOŚCI (krok 1) — **PASSED**
- Kurs NBP USD: **3,7946** (odczyt `_nbp_usd_rate` 2026-07-24).
- Wariant bazowy sprzedawany = **„Grey" $29.03** → **110,16 zł landed** (= $29.03 × 3,7946;
  zgodne z `wf2_products.cost_purchase = 110,16`).
- Cena PL (kalkulacja Etap 1, już ustawiona): **124,90 zł**; prowizja 2% → 122,40 zł;
  `unit_profit` brutto **12,24 zł** (~11% narzut = pasmo testowe 10–15%).
- Z cłem ryczałt 13 zł/szt. (od 1.07.2026): 122,40 − 110,16 − 13 = **−0,76 zł netto** przy cenie
  testowej — **celowo cienkie** (doktryna TEST-margin: silnik windzie po potwierdzeniu popytu).
- **Headroom rynkowy:** przy 149 zł → 146,02 − 123,16 = **+22,9 zł netto (~18,5%)**; przy 159 zł
  → **+32,7 zł (~26,5%)**. Rynek udźwignie 149–159 zł (premium: stal+aluminium+silikon, 16
  neodymów, 20× ★5) → **produkt spina przy cenie osiągalnej. BUDUJEMY DO KOŃCA.**
- Nota: fabryka landingów NIE zmienia ceny (zostaje 124,90 zł na stronie, gate `cena_panel`).

## Koszty API (wf2_costs — twarde API: gpt-image / fal; Claude = abonament, NIE liczyć)
| faza | co | koszt USD |
|---|---|---|
| F0 | 0 (dane/wizja) | 0 |

## Odstępstwa (Z4/Z8)
- **F1 PLAN + PRZEWODNIK autorsko agent (Opus)**, nie gpt-5.6-sol. Dozwolone (Z4: plan może pisać
  agent LUB gpt; Z8: F1 = osobna oś kosztu). Powód: spójność całości + pełna kontrola partytury/
  manifestu pod ten produkt. Gate'y F6/F7 rozstrzygają jakość niezależnie od autora.

## Log faz
- **F0 (dane/karta/kuracja/paszport/mapa/ICP/wideo) — DONE 2026-07-24.** source=detail ✓ (gate
  PASS). gallery_curated: 8 kadrów → 5 keep / 3 odrzuty. videos_curated: Ali video brandowane →
  hero-video F5; sekcja wideo-UGC = blokada-tomek. Bezpiecznik PASSED (wyżej). Bogaty produkt:
  20× ★5, 4,8/187/96,8%, 426 sold, wideo produktowe on-product, 10 zdjęć kupujących.
- **F1 (plan + przewodnik) — DONE 2026-07-24.** Motyw „TWÓJ KADR, OBIE RĘCE WOLNE" (POV/wizjer).
  Partytura: Space Grotesk (display) · Hanken Grotesk (text) · akcent emerald #12B76A (z wariantu
  Green) · tło ciepła kość · archetyp hero A (full-bleed) · sygnatura wizjer/REC. Cross-landing
  5/5 osi ≠ zaklipek. MANIFEST: 17 sekcji (zdjecia-kupujacych=build — mamy 5 zdjęć ★5;
  wideo-ugc=blokada-tomek). TOR-I: demo 1-2-3 + tryby (przełącznik ujęć, flagowa). ANIM-3:
  hero + rozwiazanie(para) + final(park golden hour).
