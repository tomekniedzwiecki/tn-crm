# FAZA 2 — RAG copy + generator wariantów (PROJEKT, domyślnie WYŁĄCZONE)

**Status: PROJEKT — NIEAKTYWNE.** ⛔ Nie wpięte w żywy przepływ fabryki. Do czasu jawnego akceptu
Tomka **copy powstaje jak dziś** (świeże, z `PASZPORT` + `ICP-GRUPA-DOCELOWA.md`). Ten plik to
**design + bezpieczniki**, nie działający moduł. Powód ostrożności: research (Diversity Collapse /
Verbalized Sampling) pokazał, że naiwny few-shot na poprzednim copy → **klony fraz i rytmu**. To
JEDYNA część kapitalizacji wrażliwa na jakość — dlatego gated.

> **Priorytet Tomka (21.07): jakość ponad wszystko.** Ta faza wchodzi TYLKO jeśli udowodni w
> pilocie side-by-side, że **nie obniża** jakości copy. Inaczej zostaje wyłączona.

---

## Cel

1. **Podnieść floor** copy (mniej słabych pierwszych wersji) i **przyspieszyć** — bez homogenizacji.
2. **Generować RÓŻNORODNE warianty A/B** kierunków hero/copy — celowo odmienne, nie „ten sam tekst ×3".

## Ryzyko (dlaczego gated)

- **Diversity Collapse:** few-shot na poprzednim copy ściąga model do średniej → powtarzalne
  frazy, ten sam rytm, te same otwarcia. To dokładnie mechanizm klonów masażer↔Drapek, przeniesiony
  z wizji na słowo.
- **Mode collapse RLHF:** model domyślnie zwraca 1 „najbezpieczniejszy" wariant, nie rozkład.

---

## Mechanizm A — RAG copy (RAMY, nie zdania)

**Zasada twarda: retrieval zwraca RAMĘ, nigdy gotowe zdania do przepisania.**

- **Indeks** = dla każdego landingu ekstrahujemy **abstrakcję**, nie treść: jakie obiekcje adresuje
  hero, typ dowodu w opiniach, struktura argumentów FAQ, mechanika oferty/risk-reversal. Korpus
  RAM, **nie korpus zdań**.
- **Retrieval:** nowy produkt → pokrewne RAMY + obiekcje z `ICP §obawy` → generator dostaje **ramę
  do WYPEŁNIENIA** świeżym copy z PASZPORT/ICP. Zdania zawsze nowe, z prawdy o produkcie.
- **Guardrail anty-klon copy (odpowiednik `cross_landing` dla słowa):** wygenerowane copy
  porównywane n-gram/embedding do korpusu poprzednich copy → **za blisko = regen**. Twardy próg,
  jak ΔE dla palet.

## Mechanizm B — generator wariantów (QD/MAP-Elites + Verbalized Sampling)

- **Osie różnorodności (siatka MAP-Elites)**, np. `ton {rzeczowy↔ciepły}` × `wejście
  {problem↔aspiracja}` × `dowód {liczba↔historia}`. Generujemy **po komórce siatki** →
  różnorodność gwarantowana konstrukcją, nie nadzieją.
- **Verbalized Sampling:** prompt prosi o **k jawnie różnych** wariantów z rozkładem
  (nie 1 „najlepszy") — udokumentowane obejście mode collapse.
- **Filtr = ISTNIEJĄCE bramki, nie nowa jakość:** każdy wariant przechodzi `verify-style-lock`
  i checki copy; wygrywa wg celu konwersji, **nie wg podobieństwa**. Żadnego obniżenia progu.

## Mechanizm C — biblioteka archetypów person

Katalog **archetypów** person (nie konkretnych person) jako punkt startu `F0.6a` — przyspiesza
draft ICP; ICP i tak **weryfikowane realnym kontem/briefem** (SEED DRIFT). Archetyp = rusztowanie,
nie prawda.

---

## Bezpieczniki (twarde, warunki istnienia fazy)

1. **Flaga OFF domyślnie.** Włączenie = jawna decyzja Tomka.
2. **RAG = ramy, nie zdania** + wewnętrzny similarity-gate na copy (regen gdy za blisko historii).
3. **Warianty przechodzą WSZYSTKIE dotychczasowe bramki** — zero wyjątków, zero miękczenia progów.
4. **Poziom C (partytura) pozostaje generatywny** — RAG copy **nie dotyka** wizji, palety, scen.
5. `cross_landing` zostaje włączony i twardy.

## Kryteria aktywacji (checklista przed włączeniem)

- [ ] **≥ ~8–10 landingów** w `EXEMPLARY-INDEX` (dość danych, by RAMY były reprezentatywne, nie 2 przykłady).
- [ ] Zbudowany **similarity-gate copy** (anty-klon słowa) i przetestowany na historii.
- [ ] **Pilot na 1 produkcie**: side-by-side copy „z Fazą 2" vs „jak dziś" — Tomek orzeka, że
      jakość ≥ baseline i **różnorodność wyższa**. Dopiero PASS = włączenie.

---

### Powiązane
`KAPITALIZACJA-OPS.md` §5 (bezpieczniki) · `PLAN-REUSE-KAPITALIZACJA.md` (Faza 2) ·
`EXEMPLARY-INDEX.md` (źródło RAM) · `feedback-seed-drift-realny-content-klienta` (pamięć) ·
`gate-manifest.json` `cross_landing`.
