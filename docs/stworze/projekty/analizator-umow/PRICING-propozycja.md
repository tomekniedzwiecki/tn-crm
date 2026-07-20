# PRICING — PROPOZYCJA (Sygno, 2026-07-20; do rozmowy i decyzji Tomka)

> Źródła: zrodla/research-pricing-konkurencja.md + zrodla/research-pricing-wtp.md (agenci Opus,
> web research ze źródłami) + market_report sparingu. Model per-FIRMA (nie per-user) — płatnik
> = właściciel/zarządzająca kontraktami, użytkowników 1-3.

## Kotwice (z researchu)
- Generyczne „AI prawniki" PL: 99–120 zł/mc → być WYŻEJ (nie konkurujemy z commodity).
- Umownik (CLM, bez naszej funkcji): 300 zł netto/mc — najbliższa kotwica SaaS.
- Kancelaria za JEDNĄ analizę back-to-back (2 dokumenty): realnie 1–3 tys. zł, nietransparentnie.
- Branża budowlana płaci kilkaset zł/mc za SaaS bez oporu (Ofertis 350–480, PlanRadar do ~640/user).
- Koszt błędu: kary do 10% netto–30% brutto kontraktu, zatrzymania 5–20% — na kontrakcie 1 mln zł
  ekspozycja 100–300 tys. zł. Rama sprzedażowa = „ubezpieczenie od ryzyka".
- WTP: podłoga ~150/mc · środek 200–300/mc · sufit 400–500/mc (abonament roczny preferowany, faktura/przelew).

## WARIANT A (rekomendowany) — dwa plany, prosto
| | **Start** | **Pro** |
|---|---|---|
| Cena netto | **249 zł/mc** · **2 490 zł/rok** (2 mies. gratis) | **449 zł/mc** · **4 490 zł/rok** |
| Analizy | 5 / mc | 15 / mc |
| Użytkownicy firmy | 3 | bez limitu |
| Raport PDF + plik audytowy | ✅ | ✅ |
| Tryb bez KG | ✅ | ✅ |
| Priorytet kolejki analiz | — | ✅ |
| Nadmiar | 99 zł / analiza | 79 zł / analiza |

- **Trial: 14 dni BEZ karty, limit 2 pełne analizy własnych umów** + demo-analiza widoczna od
  pierwszego wejścia (aha bez czekania). Standard startera (app_settings.trial_days), karta
  dopiero przy przejściu na płatny plan (B2B na fakturę — wymóg karty ściąłby rejestracje).
- **Founding dla sieci operatorki (PFP): 149 zł/mc z lockiem 12 mies. dla pierwszych 20 firm**
  — przez moduł rabatów Stripe operatora (kody imienne), jawnie ograniczone okno.
- Uzasadnienie ceny na landingu: jedna analiza w kancelarii = 1–3 tys. zł; Sygno Start = 249 zł/mc
  za 5 analiz. Jedna wychwycona klauzula (pay-when-paid, kara bez limitu) zwraca abonament na lata.

## WARIANT B — jeden plan (maksymalna prostota)
**Sygno 349 zł netto/mc · 3 490 zł/rok** — 10 analiz/mc, userzy bez limitu, nadmiar 99 zł/analiza.
Trial jw. Mniej tarcia decyzyjnego, ale gubi tanie wejście (Start 249) i upsell (Pro 449).

## Świadomie ODRZUCONE
- Czysty per-dokument (bill shock, sezonowość budownictwa; przy 8–25 umowach/rok abonament i tak wygrywa).
- Trial z kartą na wejściu (polskie B2B kupuje na fakturę/proformę).
- Plan „dedykowane środowisko" w v1 (decyzja D5 — ewentualny enterprise później, wycena indywidualna).
- Per-user pricing (płatnik płaci za FIRMĘ, userów mało).

## Do potwierdzenia w rozmowie
1. Wariant A czy B (rekomendacja: A).
2. Wysokości: Start 249 vs 199? (199 = bezpieczniej na start w konserwatywnej branży,
   249 = spójniej z wartością; rekomendacja: 249, founding 149 amortyzuje wejście).
3. Limity analiz (5/15) — kalibracja po realnych kosztach AI na prawdziwych umowach (sesja
   funkcja_glowna zmierzy koszt/analizę; limity trzymamy w app_settings, zmiana bez deployu).
4. Okno founding: 20 firm / 12 mies. — ostateczne liczby.
