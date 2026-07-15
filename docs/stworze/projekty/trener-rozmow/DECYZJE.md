# DECYZJE — osobisty trener rozmów biznesowych (rejestr, 2026-07-15)

> Otwarte decyzje z handoff packu (§11) + rozstrzygnięcia zaproponowane przez sesję fabryki.
> Statusy: PROPOZYCJA (czeka na Tomka) / ROZSTRZYGNIĘTE (data, kto) / ODŁOŻONE (dokąd).
> Lustro w panelu: wfa_notes (kind=decyzja) projektu 858427d1-107f-48a9-9b91-3fe4999702e0.

| # | Decyzja | Rekomendacja sesji | Status |
|---|---|---|---|
| **D1** | Trening w v1: tekst / głos / oba? | **TEKST (czat)**. Głos = duży koszt, inna architektura, prywatność, ocena pauz — a wartość treningu (struktura, domknięcie, ocena) realizuje się w tekście. Głos = kandydat #1 na v1.1 (rozwój, osobna wycena). Kryteria „głosowe" (przerywanie, pośpiech) mapujemy na tekst: odpowiadanie bez parafrazy/zrozumienia, formułki, nadmierne tłumaczenie. | PROPOZYCJA (kluczowa) |
| **D2** | Które źródła auto, które ręczne? | AUTO: strona WWW firmy (crawl podanego URL) + web search w API modelu (publikacje, sytuacja, rynek). RĘCZNE: LinkedIn/social (użytkownik wkleja — ToS zabrania scrapingu), wiedza z kontaktów osobistych. | PROPOZYCJA |
| **D3** | Integracje CRM w v1? | **ŻADNE** — poza zakresem v1 (deklarowana lista „poza zakresem" klienta i tak ją sugeruje). v1.1+: import kontaktu z CSV zanim jakikolwiek CRM. | PROPOZYCJA |
| **D4** | Zakres odpowiedzialności rozmówcy: podaje user czy ustala AI? | OBA: user podaje rolę (pole formularza), AI proponuje typowe zakresy odpowiedzialności/KPI dla tej roli jako „wniosek AI" do zatwierdzenia/edycji. | PROPOZYCJA |
| **D5** | Kto zatwierdza research do symulacji konkretnego rozmówcy? | Użytkownik (jedyna osoba w v1). Tryb „konkretny rozmówca" dostępny, gdy zatwierdzone: komplet kryteriów obowiązkowych (cel, firma, rola, następny krok) + ≥5 zatwierdzonych faktów o firmie/rozmówcy. | PROPOZYCJA |
| **D6** | Próg trybu neutralnego klienta? | Poniżej progu z D5 → symulacja startuje jako NEUTRALNY klient z wyraźnym komunikatem („opieram się na wiedzy ogólnej, nie danych o tej osobie"). | PROPOZYCJA |
| **D7** | Czym różni się trening od egzaminu? | TRENING: plan widoczny obok, podpowiedzi trenera w trakcie, można przerwać, wynik nieoficjalny (nie wchodzi do historii jako ocena). EGZAMIN: bez podpowiedzi, twarde scenariusze (obiekcje, presja czasu, kwestionowanie wartości), wymuszona próba domknięcia, wynik 1–10 do historii. | PROPOZYCJA |
| **D8** | Czy „następny krok" wchodzi do 40% podstaw gotowości? | **TAK** — klient sam ma go w kryteriach obowiązkowych; spójność wymaga, by liczył się do podstaw. | PROPOZYCJA |
| **D9** | Naturalne określenie zamiast „hipotezy problemu klienta"? | Propozycje (od najlepszej): **„Prawdopodobny problem klienta"** (+ podpis „Twoje przypuszczenie — potwierdzisz w rozmowie"), „Co może boleć klienta?", „Twój strzał: problem klienta". | PROPOZYCJA (klientowa, przy demo) |
| **D10** | Retencja nagrań/transkrypcji? | v1 tekstowa → „nagranie" nie istnieje. Transkrypcja czatu: domyślnie USUWANA po wygenerowaniu raportu (zostają: ocena, wnioski, krótkie zanonimizowane cytaty). Opt-in „zachowaj treść rozmowy" per przygotowanie; retencja opt-in 90 dni, potem auto-delete (cron). Anonimizacja cytatów w raporcie automatyczna. | PROPOZYCJA |
| **D11** | Cytaty w raporcie: dosłowne czy parafrazy? | Dosłowne KRÓTKIE cytaty, zanonimizowane (późniejsze wymaganie klienta w bazie wiedzy przesądza: „raport ma zawierać krótkie, dosłowne cytaty"). | ROZSTRZYGNIĘTE bazą wiedzy |
| **D12** | Konta firmowe / cennik zespołowy / administracja? | v1: konta INDYWIDUALNE. „Pakiet firmowy" obsługuje operator poza produktem: kody rabatowe Stripe (moduł rabatów) + faktura; strona „dla firm" na landingu = kontakt. Multi-seat + panel administratora firmy = rozwój (v1.1+), świadomie poza granicą v1. | PROPOZYCJA (kluczowa) |
| **D13** | Źródło terminu wydarzenia na pulpicie? | Termin wpisywany ręcznie w formularzu przygotowania. Bez integracji kalendarza w v1 (Google Calendar = rozwój). | PROPOZYCJA |
| **D14** | Skala ocen | Gotowość = %, egzamin = 1–10 (rozstrzygnięte w bazie wiedzy przez klienta). | ROZSTRZYGNIĘTE bazą wiedzy |

## Uwagi operacyjne
- **U1 (materiały klienta):** klient ma materiały referencyjne PNG (przykłady), których nie dało się
  załączyć w spowedniku → poprosić o wgranie przez portal (karta „Materiały") — dotyczy kroku
  `dane_operatora`; wpisane do wfa_notes.
- **U2 (marka robocza):** makiety sparingu używają nazwy „**Rozmowny Plan**" — rozmownyplan.pl
  jest WOLNA; traktować jako kandydata klienta w kroku `nazwa`.
