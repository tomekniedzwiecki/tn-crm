# Analiza makiet sparingu — „Rozmowny Plan" (2026-07-15, agent Opus)

> Makiety = INSPIRACJA + tokeny (nie finalny design). PNG w `zrodla/makiety/`.
> UWAGA HISTORYCZNA: makiety pokazują WCZESNĄ wizję produktu („5-minutowy plan rozmowy",
> marka robocza „Rozmowny Plan"); spowiednik rozwinął produkt do pełnego trenera
> (research → plan → gotowość → symulacja → raport). Wzorce UI pozostają aktualne.

## Co pokazują makiety
- **landing.png** — hero: eyebrow „PLAN ROZMOWY W 5 MINUT", H1 „Wejdź w rozmowę przygotowany,
  nie spięty", mockup produktu (sidebar spotkania + plan w 4 kolumnach 1-4: Wejście/Tematy/Pytania/
  Puenta, blok „⚠ Uważaj na" + „❝ Cytat/riposta"), pas zaufania (branże + „1 842+ użytkowników"),
  3 benefity: Oszczędzisz czas / Pewność bez sztywności / Unikasz wpadek.
- **glowna.png** — generator: formularz (typ spotkania / osoba / cel rozmowy / poziom swobody)
  + CTA „✦ Ułóż plan" + „🔒 Twoje dane są tylko dla Ciebie"; podgląd planu 6 sekcji:
  Wejście (pierwsze zdanie), Tematy (3 bezpieczne), Pytania (5), Puenta (pitch), Czego unikać
  (czerwone ✗), Follow-up (propozycja).
- **panel.png** — pulpit: 3 KPI (nadchodzące rozmowy / gotowe plany / ostatni follow-up) + lista
  kart wydarzeń (tytuł + czas|miejsce|osoba + CTA „Przygotuj plan").
- **dodatkowa.png** — krok kreatora „Puenta": stepper ①-④, podpowiedzi cytatów z etykietami tonu
  (luźne otwarcie / inteligentna puenta / wyjście z ciszy / łagodne zastrzeżenie / delikatna riposta),
  para akcji „+ Dodaj do planu / ✕ Zbyt mocne", stopka „Tylko Tobie do notatek".
- **podsumowanie.png** — one-pager biznesowy sparingu (problem, dla kogo, kto płaci 79 zł,
  konkurencja, ekrany v1, kanały; hasło „Twój plan. Twoje notatki. Pewniejsza rozmowa.").

## Tokeny (spróbkowane)
| Rola | Wartość |
|---|---|
| Tło makiet (dark shell — DO ODWRÓCENIA) | #111112–#151515 |
| Powierzchnie kremowe | #f8f5f2, #f6ece0, #f5ecdc; podkarty #fffffa |
| **Akcent 1: terakota** (CTA, aktywne, numery) | #B74F26 / #B05129 / #C4582B |
| **Akcent 2: oliwka** (statusy „gotowe", potwierdzenia, micro-copy) | #5F5F1D / #808144 / #8C924E |
| Tekst nagłówków (na kremie) | ~#2A2620 (ciemny brąz-węgiel) |
| Tekst pomocniczy | ~#8A8A86 |
| Negatyw (czego unikać) | czerwone ✗ ~#C0392B |
| Pill zaufania | #EFE7CC |

Typografia: DWOISTY system — **szeryf** (wysoki kontrast; nagłówki/logo/cytaty kursywą; hero
~90-110px) + **grotesk humanistyczny** (UI, etykiety caps z literspacingiem). Elegancja przez
rozmiar, nie grubość. Geometria: karty r=20-28px, przyciski 10-12px, pills 999px; cienie miękkie
ciepłe; gęstość przestronna. Ikony: line 1.5-2px w okrągłych żetonach; numery w wypełnionych kółkach.
Ton: **premium + ciepły + redakcyjny/gabinetowy** („dobry notes", papeteria, dyskrecja) — zero techno.

## Wzorce warte zachowania (do 02-SPEC / 04-STYLEGUIDE)
1. Plan jako ponumerowane filary (Wejście→Tematy→Pytania→Puenta) — motyw przewodni całej apki.
2. Status gotowości jako oliwkowy pill z checkiem („Gotowy do spotkania").
3. Dwoisty system list: oliwkowe kropki = rób / czerwone ✗ = unikaj.
4. Podpowiedzi z parą akcji „+ Dodaj do planu / ✕ Zbyt mocne" (keep/discard) + etykiety tonu.
5. Pulpit: 3 KPI + karty wydarzeń z meta (czas|miejsce|osoba) i jednym CTA.
6. Formularz 4 pól + jeden duży CTA; „poziom swobody" jako wybór tonu.
7. Micro-copy prywatności przy CTA („Twoje dane są tylko dla Ciebie") — kluczowe w tej niszy.
8. Stepper kroków przygotowania.
9. Cytaty „do wypowiedzenia" = kursywa szeryfowa (odróżnienie skryptu od UI).
10. Zestawienie „amunicja" (cytaty) i „miny" (uważaj na) w jednym rzucie oka.

## Mapowanie na JASNY motyw (zakaz ciemnych teł — reguła fabryki)
Tło strony = kość słoniowa **#F7F3EC/#FAF6EF** (dotychczasowy kolor kart), karty = **#FFFFFF/#FFFEFA**
z obrysem **#ECE4D8** + miękki ciepły cień `0 2px 12px rgba(60,45,30,.06)`; tekst **#2A2520 /
#5C554C / #8A837A**; terakota **#B74F26** (hover #A24421) i oliwka (przyciemniona dla kontrastu
**#6E7038**) BEZ ZMIAN — to sygnatura marki. Ciepły krem, NIE zimna czysta biel na całej stronie.
Efekt: „papierowy briefing/notes" — charakter zostaje, reguła jasnych teł spełniona.
