# LEJEK V2 — /sklep: „wow first, kolejka, budżet ich"

> Decyzje Tomka z 2026-07-06 po analizie 49 realnych rozmów (0 wpłat / 51 leadów).
> Ten dokument = SSOT nowej narracji przedrezerwacyjnej. Wdrożenie: bud-chat prompty,
> bud-landing (P0), front /sklep, bud-drip/bud-followups (dopasowanie copy).

## Diagnoza (dane, nie domysły)

- 49/49 rozmów kończy się wypowiedzią bota — ludzie znikają w trakcie, nikt nie odmawia.
- Kartę rezerwacji zobaczyły 4 osoby z 48; **3 z 4 kliknęły „Rezerwuję"** (orders pending,
  nikt nie dokończył płatności). Lejek umiera PRZED ceną, nie na cenie.
- **`landing_url` = NULL u 100% sesji** (landing_html istnieje u 20) → „wow" (żywy sklep)
  nigdy nie dociera; `seen_landing_at` nigdy się nie stempluje (bud-project wymaga
  landing_url) → sekwencja odsłon (gate `seen_landing` w bud-drip) nigdy nie rusza.
- Trzy wzorce śmierci rozmów:
  1) **zrzut cennika** — „9400 zł… 10% od przychodu" → cisza (David, Mical, Ewelina),
  2) **przesłuchanie** — pytania o budżet/czas/doświadczenie/etat, podwójne wiadomości,
     powtórki (Ewelina 4× pytanie o doświadczenie) → cisza (Daniel, Albert, Dan),
  3) **odroczona odpowiedź** — „raty dogadasz z Tomkiem PO rezerwacji" → cisza (Grduszak).
- Lęk #1 leadów: pieniądze/scam. Bot sam eskalował (symulacja wykupu 180–240 tys. zł
  u „zielonego" leada → „to nadal dla mnie za duże kwoty").

## Decyzje (ostateczne, 2026-07-06)

1. **Rezerwacja 100 zł zostaje** (zwrotna, wliczana). Framing: **„rezerwuję miejsce
   w kolejce"** — „Tomek prowadzi ograniczoną liczbę budów jednocześnie". Bez konkretnej
   liczby budów, bez dynamicznego licznika. **ŻADNEGO downsellu / zamrożenia projektu.**
2. **Zero kwot przed rezerwacją.** Bot NIE wymienia 9400 zł, wykupu, symulacji. Na pytanie
   wprost o koszt budowy: „nie ma jednego cennika — plan (towar, reklamy, budowa) układamy
   pod kwotę, którą możesz zainwestować; dlatego pytam o budżet, szczegółowy podział
   dostaniesz od Tomka".
3. **Zero procentu.** Bot NIE mówi „10% od przychodu". Narracja: „udział Tomka ustalamy
   indywidualnie po rezerwacji — zależy od zakresu jego pracy i Twojego zaangażowania;
   mamy być wspólnikami, więc warunki muszą być ok dla obu stron".
4. **Otoczka biznesowa = rdzeń narracji** (to działa, zostaje): wspólny biznes, Tomek
   buduje → wdraża → prowadzi do ~1000 zamówień → oddaje stery; zarabia dopiero, gdy
   zarabia lead.
5. **Budżet leada = mechanizm oferty** (nie kwalifikacja): PO pokazaniu sklepa pytamy
   „jaką kwotę realnie możesz zainwestować w start?" (chipy: do 2 tys. / 2–5 tys. /
   5–10 tys. / 10 tys.+) → zapis do `bud_sessions.budget_declared` → „Tomek ułoży plan
   pod tę kwotę". **Bramka: < 2000 zł → uczciwie „z takim budżetem to się nie uda"**,
   bez wciskania; projekt zostaje, lecą zwykłe followupy.
6. **Zero kwalifikacji przed sklepem.** OUT: pytania o budżet*, czas/tydz., doświadczenie,
   etat/firmę, „czego się boisz". (*budżet wraca w pkt 5 jako element oferty, po wow.)
   Pytania przedrezerwacyjne = wyłącznie personalizacja (produkt, marka, styl).
   Kwalifikację Tomek robi po wpłacie. To usuwa też podwójne wiadomości i powtórki.
7. **Wow first (P0 tech):** żywy sklep jako klikalny link (`landing_url`) — naprawić
   pipeline bud-landing (dziś tylko landing_html w bazie, hostowany podgląd nie powstaje).
   Odblokuje `seen_landing_at` + sekwencję odsłon.
8. **Sprawdzić checkout E2E** — 3/3 porzucenia na samej płatności to możliwy problem
   techniczny (BLIK/webhook), nie tylko decyzyjny.

## Docelowy przebieg rozmowy

A. Produkt → krótkie potwierdzenie potencjału (2–3 zdania) → ustalenia auto (1 klik)
   → styl + nazwa marki. Zero innych pytań.
B. **WOW:** link do żywego sklepu z ich marką + reklamy/makiety. „To prototyp Twojego
   biznesu."
C. Otoczka (bez kwot i procentów, pkt 2–4) → pytanie o budżet inwestycji (pkt 5)
   → bramka 2000.
D. Karta rezerwacji: miniatura ICH sklepu + „Rezerwuję miejsce w kolejce — 100 zł,
   zwrotne, wliczane". Po wpłacie: Tomek dzwoni, zbiera kwalifikację, przedstawia
   indywidualny plan i warunki.

## Zakres wdrożenia

| # | Co | Gdzie | Prio |
|---|----|-------|------|
| 1 | Diagnoza+fix: landing_url nie powstaje | supabase/functions/bud-landing (+bud-chat kick) | P0 |
| 2 | E2E checkout rezerwacji (BLIK/webhook/tpay) | bud-project buy_reservation → tpay | P0 |
| 3 | Prompty: nowa narracja (pkt 2–6), usunięcie kwalifikacji i skryptowych wtrąceń | bud-chat (UWAGA: cache promptów → redeploy) | P1 |
| 4 | Budżet-chipy + zapis budget_declared + bramka 2000 | bud-chat + front /sklep | P1 |
| 5 | Karta rezerwacji: miniatura sklepu + copy „kolejka" | front /sklep (tomekniedzwiecki.pl/sklep) | P1 |
| 6 | Side CTA / paywall / mobile CTA — copy „kolejka" zamiast „rozmowa z Tomkiem" | front /sklep | P1 |
| 7 | Followupy/drip: dopasowanie copy do nowej narracji (bez kwot/procentu) | bud-followups, bud-drip | P2 |
| 8 | SSOT oferty + pamięć (aktualizacja starych zasad) | settings/docs/memory | P2 |

## Co się zmienia względem starych zasad

- „Budżet bez rozbijania + raty reaktywnie" → raty w ogóle nie są tematem przed
  rezerwacją (nie ma kwoty, więc nie ma rat); zasada żyje dalej PO rezerwacji.
- „Udział 10% od przychodu" (SSOT narracji) → w rozmowie przedrezerwacyjnej zastąpione
  „ustalane indywidualnie po rezerwacji"; 10% pozostaje domyślną strukturą samej umowy.
- LEKKI START / reportPropose — bez zmian, zgodne z v2 (ustalenia = propozycja).

## AKTUALIZACJA V2.1 — JAWNA CENA (decyzja Tomka 2026-07-10)

> Nadrzędne nad pkt 2 i 5 decyzji z 2026-07-06. Powód: dowody z lejka /aplikacja
> (jawna stała cena + proaktywne domknięcie = 8 płatności, 0 porzuconych checkoutów;
> ukrywanie kwot w /sklep = 0 rezerwacji, 10 porzuconych kas) + rynkowa kotwica
> (software house / agencja liczy 25–40 tys. zł za analogiczny zakres w 1. roku).

1. **CENA BUDOWY JEST JAWNA: 4900 zł, jedna i stała** (100 zł zwrotnej rezerwacji
   wliczone → przy umowie zostaje 4800 zł; ⚠️ OBNIŻKA 2026-07-21 decyzją Tomka —
   wcześniej 9400/8900). Bot podaje ją PROAKTYWNIE w turze
   domknięcia (po <zielone>) i na każde pytanie o koszt — ZAWSZE z kotwicą wartości
   (portfel 10 produktów, budowa, kampanie Tomka do ~1000 zamówień, wdrożenie;
   u agencji rynkowo 25–40 tys. zł w pierwszym roku).
2. **BUDŻET REKLAMOWY — WYŁĄCZNIE REAKTYWNIE:** bot NIE wywołuje tematu; gdy lead
   zapyta → „działamy na ok. 1000 zł budżetu łącznie na start i skalujemy z dochodów
   sklepu". Kwota na suwakach Opłacalności = docelowa skala finansowana z obrotu.
3. **Karta „kwoty inwestycji" i bramka 2000 zł — WYCOFANE** (front: maybeBudgetAfterShop
   = no-op; renderBudgetGate/soft-exit zostają w kodzie na wypadek rewersji). Jawna
   cena sama filtruje; przy deklaracji kwoty wyraźnie poniżej ceny bot uczciwie mówi,
   że się nie spina (projekt zostaje zapisany). Marker <budzet_kwota> działa pasywnie.
4. **Raty wracają reaktywnie:** „da się rozłożyć — formy ustala Tomek po rezerwacji".
5. **Bez zmian:** zero procentu udziału przed rezerwacją; zero kwalifikacji przed
   sklepem; „miejsce w kolejce"; maile/drip nadal z jedyną liczbą 100 zł (cena
   z kotwicą pada w rozmowie, nie w zimnym mailu).

Wdrożone 2026-07-10 w: settings (budowanie_model_biznesowy, budowanie_etap_wspolpraca,
budowanie_etap_gate, budowanie_sparing_prompt; backupy *_bak_0710_jawnakwota),
bud-chat (FALLBACK_MODEL_FACTS/COLLAB, MISSION, NARRATIVE_WEAVE, QUALIFY B3, blok
FAKTY OFERTY), front sklep/index.html (karta rezerwacji + facts modal + timeline
z ceną; karta budżetu no-op).
