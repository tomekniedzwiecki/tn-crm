# 00-KONTEKST-BIZNESOWY — Dobry Wstęp (DRAFT do paczki, 2026-07-15)

## Produkt
**Dobry Wstęp** (dobrywstep.pl) — osobisty trener rozmów biznesowych po polsku. Użytkownik
przygotowuje się do KONKRETNEJ rozmowy: aplikacja robi research firmy i rozmówcy, składa
interaktywny plan, liczy gotowość %, pozwala przećwiczyć rozmowę z AI odgrywającym rozmówcę
(z wymuszoną próbą domknięcia) i wystawia raport 1–10. USP vs ChatGPT: szybkość (zero
promptowania), stała struktura, egzamin z domknięciem, historia postępów.

## Ludzie i model
- **Klient/operator:** Tomek Jankowiak (tomasz.j.dyrektor@gmail.com, +48 601 767 111) —
  merchant of record, jego Stripe, jego marka. Fee platformy: 10% przychodu (wfa_projects.fee_percent).
- **Nisza:** JDG, konsultanci, młodzi menedżerowie i handlowcy w PL; płatnik indywidualny
  (~79 zł/mc) lub firma (Pro ~149 zł — decyzja pricingu w toku).
- **Ton:** osobisty trener — konkretny, spokojny, dyskretny; ZERO teatralnych bon motów
  (ryzyko „gadżetu" z bazy wiedzy = twarda reguła copy i promptów).
- Projekt wfa: 858427d1-107f-48a9-9b91-3fe4999702e0 · sesja sparingu 6f077f02-… · termin umowny 21.08.2026.

## Prywatność = cecha sprzedażowa
Minimalizacja danych (wymóg klienta): transkrypcja symulacji usuwana po raporcie (opt-in zapisu,
90 dni), cytaty anonimizowane, operator widzi liczby a NIE treść przygotowań userów.
Micro-copy zaufania w UI („Twoje dane są tylko dla Ciebie" — wzorzec makiet).

## Rozstrzygnięcia i granice
- DECYZJE.md D1–D14 (kluczowe: D1 symulacja TEKSTOWA w v1; D12 bez kont firmowych — pakiet
  firmowy przez operatora). Status: PROPOZYCJE do cięcia Tomka (15.07).
- Granica „w cenie v1 vs rozwój": 01-MVP-SCOPE §granica; poza v1: głos, CRM, kalendarz,
  multi-seat, auto-scraping social.
- Otwarta uwaga U-1: materiały PNG klienta → portal, karta Materiały (krok dane_operatora).

## Infrastruktura (stan 15/16.07)
Vercel `dobrywstep` (placeholder LIVE; domeny apex+www podpięte, NS czeka na zakup domeny przez
Tomka). Repo github.com/tomekniedzwiecki/dobrywstep (private, forge z saas-starter). Supabase EU:
ref w wfa_projects.supabase_ref. Stack twardy fabryki: statyczny HTML + vanilla JS + Supabase
Edge Functions + Vercel; deploy = git push main; RLS od 1. dnia; sekrety tylko w env edge fns.

## Źródła w brief/zrodla/
HANDOFF-PACK.md (12 sekcji) · analiza-makiet.md (tokeny, wzorce UI, mapowanie na jasny motyw) ·
research-pricing.md · landing-research.md (po sesji research) · DECYZJE.md · PRICING-propozycja.md.
