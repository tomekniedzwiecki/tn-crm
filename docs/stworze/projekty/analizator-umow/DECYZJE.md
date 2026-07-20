# DECYZJE — Sygno (analizator umów podwykonawczych), rejestr 2026-07-20

> Skonsolidowane: §11 handoff packu + itemy kind=decyzja/luka (weryfikacja 1:1 vs 168 itemów —
> raport: zrodla/raport-weryfikacja-handoff.md). Statusy: PROPOZYCJA (czeka na Tomka) /
> ROZSTRZYGNIĘTE (bazą wiedzy / decyzją) / BUDOWA (rozstrzyga sesja budowlana z defaultem) /
> ODŁOŻONE. Lustro w panelu: wfa_notes (kind=decyzja).

## Decyzje Etapu 1 (fundamentowe)

| # | Decyzja | Rekomendacja sesji | Status |
|---|---|---|---|
| **D1** | Model kont: firma multi-user od startu? | **TAK** — handoff wymaga „uprawniony użytkownik konta firmy"; model prosty: właściciel zaprasza e-mailem, wszyscy równorzędni; granulacja ról = v1.1. | PROPOZYCJA (kluczowa) |
| **D2** | Kanon nazewnictwa statusów (baza niespójna: UWAGA/DO DECYZJI/NEGOCJUJ vs ekranowe podpisz/negocjuj/stop) | Pozycja: **Zgodny / Niezgodny / UWAGA**; kolumna „Uwagi": **DO DECYZJI**; werdykt: **OK DO PODPISU / NEGOCJUJ PRZED PODPISEM** (bez STOP). Flagi wizualne makiet (LUKA/SPRZECZNOŚĆ/RYZYKO) = warstwa ikon, mapowana 1:1; potwierdzić z klientką przy demo. | PROPOZYCJA |
| **D3** | Walidacja merytoryczna („testy zatwierdzone przez eksperta branżowego") | Zestaw umów testowych od klientki-operatorki (ona jest ekspertem niszy) + jej akcept w kroku testy_klienta. Udział prawnika PZP = opcja płatna, osobna decyzja. | PROPOZYCJA |
| **D4** | Udział prawnika PZP w walidacji + treść disclaimera | Disclaimer i komunikaty prawne = krok `prawne` (przed startem, twardy gate z handoffu „zatwierdzone prawnie komunikaty przed uruchomieniem"); rekomendacja: jeden przegląd prawnika przed START. | PROPOZYCJA |
| **D5** | Osobne środowisko per firma (bariera poufności) | v1: wspólna infra + twarda izolacja RLS + szyfrowanie + osobne klucze; „dedykowane środowisko" = przyszły plan enterprise (pricing D-19). NIE budować multi-env w v1. | PROPOZYCJA (wpływa na pricing) |
| **D6** | Pakiety produktowe / limity analiz | Wg PRICING-propozycja.md (limit analiz/mc per plan; dedykowane środowisko poza cennikiem v1). | PROPOZYCJA → krok pricing |
| **D7** | Zatwierdzanie zanonimizowanej kopii przed analizą | TAK — podgląd kopii + przycisk „Analizuj" (jawny krok budujący zaufanie; bariera zakupowa #1 = poufność). | PROPOZYCJA |

## Rozstrzygnięte bazą wiedzy (wpisane do specu, nie ruszać)
- Format podstawy prawnej: nr artykułu + krótki opis, tylko gdy przepis ma zastosowanie.
- Termin w sobotę/dzień wolny → następny dzień roboczy + ostrzeżenie.
- Obszar obowiązkowy nieznaleziony → „UWAGA — nie znaleziono".
- Analiza bez KG dozwolona = „Informacja ograniczona bez KG" + komunikaty.
- Kara „za opóźnienie" gdy KG ma „zwłokę" → NEGOCJUJ + „UWAGA — ryzyko szersze" + DO DECYZJI.
- Reguła stanu prawnego: cz. I wg prawa aktualnego, cz. II wg stanu wskazanego w KG.
- „UWAGA" prezentowana jako lista punktów.
- Czerwone instrukcje-dla-AI w PDF: niewidoczne dla usera, nie trafiają do raportu.
- Cytaty wyłącznie w kolumnach „Zapisy projektu" / „Zapisy KG"; ostatnia kolumna „Uwagi" = tylko „DO DECYZJI".
- Raport bez daty; disclaimer na końcu; werdykt bez STOP w v1.
- Płatność: pokazywać wyłącznie „30 dni od daty wpływu faktury w KSeF"; >30 dni = flaga.

## Rozstrzyga budowa (default w kodzie, parametryzowalnie)
B1 Umiejscowienie podstawy KC/PZP w tabeli (default: kolumna „Podstawa" jak na makiecie) ·
B2 Hierarchia dokumentów bez jasnej klauzuli (default: szczegółowe > ogólne + UWAGA) ·
B3 Moment re-analizy po korekcie OCR (default: przycisk „Analizuj ponownie" po zapisie korekt) ·
B4 Zakres historii korekt (default: user, czas, przed/po, strona) · B5 Niejednoznaczny początek
terminu (default: najwcześniejsze zdarzenie + podstawa + UWAGA) · B6 „14 dni od podpisania" —
doprecyzowanie liczenia · B7 Wersjonowanie prawa (art. 463 PZP od 12.07.2026; baza przepisów
wersjonowana datą) · B8 Braki załączników/RCO/danych (default: osobne ostrzeżenie) · B9 Nazwa
Tabeli II (default: „Porównanie" — rekomendacja bazy) · B10 Niska pewność OCR/oceny (default:
flaga UWAGA + prośba o lepszy skan) · B11 Dostęp serwisowy: nadanie/odbiór per plik przez klienta
(default: toggle w ustawieniach firmy) · B12 Architektura zabezpieczeń = krok audyt (checklist §7
+ wymogi handoffu: szyfrowanie, osobne klucze, brak treści w logach, zakaz trenowania).

## Uwagi operacyjne
- **U1:** Klientka = KOBIETA (formy żeńskie w komunikacji!). Brak imienia i nazwiska w systemie —
  uzupełni się przy umowie (portal, dane firmy). E-mail: magm5@interia.pl.
- **U2:** Nazwa robocza klientki z makiet: „Luki Publiczne" (lukipubliczne.pl było wolne).
  WYBÓR TOMKA 20.07: **Sygno / sygno.pl**.
- **U3:** Linia komunikacyjna na barierę poufności (język klientki): „Aplikacja nie buduje bazy
  informacji o Twojej firmie"; wejście = pusty wzór umowy bez cen i danych osobowych.
  ZAKAZ obiecywania „zero wycieków" bez audytu.
- **U4:** Załącznik klientki: apka.pdf (2-stronicowa koncepcja z układem raportu) — pobrać
  ze Storage spar do brief/zrodla przy kroku paczka_cc.
