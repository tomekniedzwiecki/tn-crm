# Design Brief — InnerScan v2 (Dark Industrial Workshop)

> Wariant 2 do porównania z v1 (`landing-pages/innerscan/` — clean tech-startup minimal).
> Kontrast względem v1: ciemne tło, blueprint/schematic estetyka, ciężka typografia industrial.

## 1. Kierunek manifesta

- [x] **MODE=forge — Dark Industrial Workshop / Tool Manual**

**Uzasadnienie wyboru:**
Produkt to narzędzie diagnostyczne dla fachowców — mechaników, hydraulików, elektryków, zaawansowanych DIY. V1 sprzedaje „produkt technologiczny" (tech-startup voice). V2 sprzedaje „ciężkie, niezawodne narzędzie zawodowe" — jak katalog Milwaukee, Fluke albo Ridgid. Target persona = „Piotr, 42 l., właściciel warsztatu samochodowego" — ta osoba ufa wizualnie rzeczy, które wyglądają jak spec sheet, nie jak app landing.

## 2. Moodboard — 3 marki referencyjne

1. **Milwaukee Tool (katalog M18)** — czarno-czerwone spec sheets, duże numery techniczne, blueprint hairlines
2. **Fluke Test Tools** — żółto-grafitowe layouty z dokumentacji pomiarowej, precyzyjne wymiary obok produktu
3. **Leatherman Reference Card** — wymiarowanie narzędzia ze strzałkami i etykietami jak w instrukcji serwisowej

## 3. Paleta

- **Primary (akcent):** `#FF6B35` (Alert Orange — safety/caution, jak taśmy ostrzegawcze)
- **Ink (tekst jasny):** `#E2E8F0` (Light Slate — odczyt na ciemnym tle)
- **Paper (tło główne):** `#0A1628` (Deep Navy — workshop night)
- **Surface alt:** `#1A1F2E` (Carbon Black — podłoże kart)
- **Detail cyan:** `#00D4FF` (Scan Cyan — hairlines, spec markers)
- **Muted:** `#4A5568` (Steel Gray — dimensions labels)

## 4. Typografia

- **Display (H1/H2):** `Space Grotesk` 700 — heavier, geometric, tool-like
- **Body:** `Inter` 400/500/600 (max czytelność na dark bg)
- **Mono (spec labels, numbers, captions):** `JetBrains Mono` 500 — DOMINUJĄCY element wizualny, nie tylko akcent

> Polskie „Ł" w UPPERCASE: Space Grotesk ✅ ma latin-ext. `line-height: 1.4` wymuszone w uppercase'ach.

## 5. Persona

- **Wiek/zawód:** 35–55 l., mechanik / hydraulik / DIY zaawansowany / właściciel warsztatu
- **Pain point:** „Nie widzę co jest nie tak — a demontaż to 2h roboty + ryzyko zepsucia czegoś jeszcze"
- **Motywacja:** szybka, pewna diagnoza przed podjęciem decyzji o naprawie. Narzędzie ma wyglądać jak sprzęt, nie gadget
- **Cytat:** „Kupiłem trzy endoskopy przez 5 lat. Dwa padły po miesiącu. Ten jest inny — czuć że zrobiony do roboty."

## 6. Anty-referencje

- **Już istnieje:** `innerscan/` (v1) — clean tech-startup, cyan-dominant, białe tło, friendly kopywriting
- **Czego unikam z v1:** białego tła, delikatnych cieni cyan glow, „friendly" copy w stylu „zobacz swoimi oczami". V2 jest cięższa, bardziej zawodowa, spec-sheet'owa.
- **Inne landingi dark:** `vibestrike/` (Retro-Futuristic gaming) — NIE kopiuję neonów / glitch efektów. Mój dark jest industrialny, nie gaming.

## 7. Test anty-generic

- [x] Marki referencyjne spoza e-commerce? TAK (Milwaukee/Fluke/Leatherman = narzędzia zawodowe B2B)
- [x] Po zasłonięciu logo zgaduję branżę? TAK (blueprint + orange safety + mono specs = narzędzie techniczne)
- [x] Persona NIE pasuje do innych baseline'ów? TAK (Rugged Heritage = outdoor/workwear, InnerScan v2 = precision tool, inna estetyka)
- [x] Manifest bez słów „premium/luxury/wysoka jakość"? TAK

## 8. Signature element

**„Spec stamp" w rogu każdej sekcji + schematic hairlines wokół hero produktu**

Konkretnie:
- Każda sekcja ma monospace marker w rogu: `§ 01 / SPECYFIKACJA`, `§ 02 / PROCEDURA`, itd. — numerowanie jak w instrukcji serwisowej
- Hero produktu otoczony cienkimi cyan'owymi liniami z adnotacjami wymiarów (strzałki + `4.3" IPS`, `IP67`, `Ø 8mm`, `1m PŁYWAJĄCY PRZEWÓD`)
- Offer box wygląda jak PART NUMBER / DATASHEET CTA, nie koszyk
- Pasek nagłówka ma thin cyan bottom border + pomarańczowy dot w lewym rogu (active indicator, jak LED na urządzeniu)

## 9. Copy tone

**„Spec sheet > sales pitch."** Krótkie zdania, mono labels, liczby uprzedzają przymiotniki (`IP67` przed „wodoodporny"; `4.3"` przed „duży ekran"). Nagłówki agresywne, techniczne: „WIDZISZ. DIAGNOZUJESZ. DECYDUJESZ." zamiast v1 „Zobacz więcej. Napraw szybciej.".

## 10. CTA / Checkout

- Checkout: `https://innerscan.pl/checkout?products=103035094` (z v1, bez zmian)
- Price: 499 PLN → **299 PLN** (savings 200)
