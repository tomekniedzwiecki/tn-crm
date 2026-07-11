# 01-MVP-SCOPE — Oferta Instalatora (PROPOZYCJA do decyzji Tomka, 2026-07-11)

> Wygenerowane z handoff packu + 156 elementów bazy wiedzy spowiednika. Tomek TNIE i zatwierdza;
> po akceptcie klienta plik przechodzi do paczki `apka-<slug>-brief/01-MVP-SCOPE.md` w repo aplikacji.
> Projekt w panelu: /tn-app/projekt?id=102e4c74-ae3d-4cbf-885d-0826b283f7e6 · termin: 13.08.2026
>
> ✅ **ZATWIERDZONE przez Tomka 2026-07-11.** Rdzeń = F1–F5; urządzenia i PEŁNY VAT w rdzeniu (decyzja Tomka);
> **profil firmy** dopisany do F5 (był luką); **rabaty odłożone do v1.1** (były w F2). Akcept klienta = krok `akcept_klienta` (pending).

## Definicja v1 (1 zdanie)
Jednoosobowy instalator (sanitarny/grzewczy/gazowy) składa z własnego cennika profesjonalną ofertę PDF
w 3 minuty — robocizna z klikanych pozycji, materiały działami po jednej kwocie — zamiast Excela i notatek.

## Funkcje rdzenia (5)

**F1. Cennik usług (robocizny)**
Pozycje: nazwa, cena netto/brutto, jednostka (szt./mb/kpl./m²), domyślny dział. Lupa (szukanie po nazwie),
podręczne „ostatnio/najczęściej używane". Pełna edycja (nazwy, ceny, jednostki, kolejność, dodaj/usuń).
Start = **szablon z oczyszczonego cennika Grzegorza** (klucz do TTFV — user nie zaczyna od pustej kartki).

**F2. Kreator oferty**
- Robocizna: klik z cennika → tabela; ilość/cena edytowalne inline (bez modali); cena z cennika = startowa,
  nadpisanie nie zmienia cennika; pozycje jednorazowe spoza cennika; działy robocizny tworzą się AUTOMATYCZNIE
  z domyślnych działów pozycji (kolejność zmienialna).
- Materiały działami: kafelki (nazwa edytowalna + własny opis + JEDNA kwota brutto; zero ilości/jednostek);
  ściągawka-podpowiedź per dział (statyczna lista typowo pomijanych elementów uzbrojenia — treść od Grzegorza;
  czysta pomoc pamięciowa, zero logiki).
- Proponowane urządzenia: osobna biblioteka (marka, model, opis, cena) → jednym klikiem do sekcji
  „Proponowane urządzenia" POZA sumą główną (kilka kotłów jako opcje, bez sumowania).
- Warunki: ważność oferty (dni, per oferta), dopisek gwarancji (checkbox + treść), warunki płatności
  (dopisek tekstowy — bez auto-liczenia zaliczek), uwagi końcowe (jedna wolna sekcja, ZERO szablonów).
- Dane klienta: minimum imię + telefon (szkic i PDF działają); ulica/miejscowość/NIP-firma opcjonalne
  (puste = niewidoczne w PDF; bez przełącznika B2B/B2C).
- Flow: najpierw zakres i kwoty, dane klienta na końcu. Minimum przełączników („wchodzę, klikam, jadę dalej").

**F3. VAT i prezentacja**
Robocizna: jeden wybór na ofertę — samo netto / netto+8% / netto+23%. Materiały: wpisywane BRUTTO,
przeliczenie netto/VAT w tle; opcjonalny tryb netto; blokada kwoty brutto (auto-przeliczenie netto „w dół" —
praktyka rynkowa przy 8%). Tryb prezentacji „same kwoty netto". Przełącznik szczegółów robocizny w PDF
(jeden na ofertę; kalkulacja wewnętrzna zawsze pełna). Klient końcowy widzi ceny końcowe, nie rozbicie.

**F4. PDF + cykl życia oferty**
PDF wg makiet (tokeny: beton #F3F0EA, miedź #D96B28, grafit #2F3437; mocne kwoty, logo instalatora).
Kolejność: materiały → robocizna działami → warunki; podsumowanie: Materiały razem / Robocizna razem /
ew. VAT robocizny / SUMA; poniżej „Proponowane urządzenia". Numeracja auto **OFE/RRRR/NNN** lub ręczna.
Lista ofert ze statusami (nowa/wysłana/do poprawki). Szkic edytowalny; po oznaczeniu „wysłana" ZAMROŻONA;
poprawki wyłącznie przez „Utwórz wersję v2" (poprzednia nigdy nie znika). Zero automatycznych dopisków w PDF.

**F5. Konto + profil firmy + pulpit + subskrypcja**
Konto (e-mail+hasło). **Profil firmy instalatora** (nazwa, telefon, adres, opcjonalnie NIP + logo) — wypełniany
RAZ, auto-wchodzi w nagłówek/stopkę każdego PDF; minimalny profil (nazwa+telefon) wystarcza, logo opcjonalne
(żeby nie psuć TTFV). Pulpit „kolejka wycen" wg makiety (Do wysłania dzisiaj / liczby tygodnia / ostatnie
oferty), subskrypcja Stripe (trial 7 dni z kartą — patrz PRICING). Mobile-first CAŁOŚĆ (fachowiec w trasie).

## Poza zakresem v1 (świadome cięcia)
- automatyczne liczenie materiałów; rozbijanie materiałów na sztuki/podzespoły; kosztorysy KNR/przetargowe
- **kalkulatory pomocnicze (metry rury, przeliczniki przyborów)** — patrz Otwarta decyzja D12
- **rabaty (% i kwotowe) — ODŁOŻONE do v1.1** (decyzja Tomka 2026-07-11; łatwe do dołożenia, nie blokują wysyłki oferty)
- wiele cenników robocizny; zespoły/multi-user
- załączanie projektów/dokumentacji do oferty (D2 — proponuję później)
- publiczny link do oferty online + tracking „obejrzana" (dobry kandydat na v1.1)
- wysyłka e-mail z aplikacji (v1: pobierz PDF i wyślij po swojemu)
- integracje z hurtowniami; aplikacja natywna

## Metryka aktywacji + TTFV
**Aha-moment: pierwszy wygenerowany PDF oferty. Cel TTFV: < 10 minut od rejestracji** (możliwe dzięki
szablonowi cennika — user od razu klika pozycje). Zdrowy tydzień 1: ≥ 3 oferty. Te dwa eventy = `activated_at`
i baza lifecycle-maili.

## Granica „w cenie v1 vs rozwój" (do akceptu klienta — WPROST w mailu akceptacyjnym)
- **W cenie:** poprawki błędów; korekty UI/UX i treści; drobne modyfikacje funkcji z tej listy (łącznie do ~2 dni pracy po demo).
- **Rozwój (osobna wycena):** każda funkcja z listy „Poza zakresem", nowe sekcje/układy PDF poza uzgodnionym,
  integracje, nowe moduły. Rozstrzyga ten dokument.

## Kryteria „gotowe" (per funkcja — skrót; pełne w paczce)
F1: cennik z szablonem startowym, edycja+lupa działa, mobile OK. F2: oferta od zera do kompletnej w <3 min
przez telefon. F3: wszystkie 3 tryby VAT robocizny + brutto/netto materiałów liczą się poprawnie (testy).
F4: PDF 1:1 z uzgodnionym wzorem; zamrożenie/wersjonowanie działa; numeracja bez dziur. F5: trial z kartą
end-to-end na koncie testowym.

## Moduły → sesje budowy (do 08-PLAN-SESJI)
S4a: Cennik (F1) · S4b: Kreator — robocizna+materiały+urządzenia (F2) · S4c: VAT/prezentacja (F3)
· S4d: PDF (F4-render) · S4e: cykl życia ofert (F4-statusy/wersje). Pulpit = S5, subskrypcja = S7 (standard).
