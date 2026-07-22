# PRICING — FINAŁ (decyzja sesji 22.07.2026)

Podstawa: kotwica klienta (spowiednik, intel_cenowy) + 2 tory researchu
(zrodla/PRICING-RESEARCH-A-konkurencja.md, zrodla/PRICING-RESEARCH-B-wtp.md).
Decyzja Tomka 20.07: pricing ustala SESJA; Tomkowi wynik informacyjnie — nadpisze zdaniem, jeśli zechce.

## Cennik (BRUTTO, PLN) — kotwica klienta UTRZYMANA

| Plan | Miesięcznie | Rocznie (= 10 mies., −16,7%) |
|---|---|---|
| Klient zlecający | **0 zł** | — |
| Fachowiec (solo) | **99 zł** | **990 zł** |
| Firma | **149 zł** | **1490 zł** |
| + dodatkowy pracownik | **39 zł/mc** | 468 zł/rok (bez rabatu, z góry) |
| + dodatkowy powiat | **19 zł/mc** | 228 zł/rok (bez rabatu, z góry) |

Abonament bazowy (fachowiec i firma) obejmuje **2 powiaty**. Rabat roczny TYLKO na abonament
główny (decyzja klienta); dodatki w planie rocznym płatne z góry za cały rok. Dokupienie
dodatku w trakcie okresu = proporcjonalnie (Stripe proration), odnawia się automatycznie.

## Trial / model wejścia

- **Bez okresu próbnego** (twarda decyzja klienta; zgodna z rynkiem — Fixly/Oferteo też nie dają
  pełnego triala). **Furtka wartości przed zakupem = darmowy SKRÓCONY podgląd zleceń** (fachowiec
  bez abonamentu widzi, że w jego obszarze są świeże zlecenia — bez danych kontaktowych i ofertowania).
- **Prośba o kartę: dopiero przy zakupie abonamentu** (Stripe Checkout). Nigdy wcześniej.
- Zimny start (research B: 67% marketplace'ów umiera po stronie podaży) — bez zmiany ceny bazowej:
  1. **Gwarancja startowa** (zapis w regulaminie): pierwszy opłacony miesiąc bez ANI JEDNEGO
     zlecenia opublikowanego w obszarze fachowca = zwrot 99/149 zł. Wykonanie: ręczny refund
     operatora w Stripe — zero dodatkowego kodu w v1.
  2. **Founding member**: −50% na pierwsze 3 miesiące dla pierwszych 10–20 fachowców per powiat —
     przez standardowy moduł rabatów operatora (Stripe Coupons + Promotion Codes; kody tworzy
     operator w panelu). Zero dodatkowej budowy.

## Kotwica rynkowa (z researchu, źródła w plikach zrodla/)

- Booksy (najbliższy benchmark abonamentu lokalnego): 135–145 zł netto (~166–178 brutto)
  + 35 zł netto/pracownik → jesteśmy TAŃSI od lidera przy tej samej strukturze (baza + per-pracownik).
- Pay-per-lead (Fixly/Oferteo): kontakt ~15–35 zł, skuteczność 15–30% → efektywnie ~80–150 zł
  za jedno WYGRANE zlecenie. Abonament 99 zł = parytet już przy ~3 kontaktach/mc, przy 10+ wielokrotnie taniej.
- Break-even fachowca: przy zleceniu 150–400 zł i marży 40–60% abonament zwraca się z ~1 zlecenia/mc.
- Odrzucone korekty: 79 zł (−24 tys. zł/rok na 100 subach + sygnał taniości), 129 zł (ryzyko
  odrzucenia na zimnym starcie), pełny trial (decyzja klienta + rynek go nie wymusza).

## Do sprzedaży (landing/copy)

„Stały abonament zamiast płacenia za każdy kontakt" — u konkurencji jedno wygrane zlecenie
kosztuje ~100 zł, u nas cały miesiąc lokalnych zleceń kosztuje 99 zł, a pierwszy miesiąc jest
objęty gwarancją: brak zleceń w Twojej okolicy = zwrot.

## Stripe (dla kroku stripe_plany)

- 1 Product + Prices: `_fachowiec_month` 99, `_fachowiec_year` 990, `_firma_month` 149,
  `_firma_year` 1490; dodatki jako osobne Prices z quantity: `_pracownik_month` 39,
  `_powiat_month` 19 (+ roczne warianty 468/228 z góry).
- Trial: `app_settings.trial_days = 0` (bez triala); w Stripe nic nie ustawiać.
- UWAGA dla paczki: >1 plan (fachowiec/firma) + dodatki z quantity ⇒ mapa PLANS w stripe-checkout
  startera wymaga rozszerzenia (krok Płatności E2E).
