# DECYZJE — Sygno (analizator umów podwykonawczych), rejestr 2026-07-20

> Skonsolidowane: §11 handoff packu + itemy kind=decyzja/luka (weryfikacja 1:1 vs 168 itemów —
> raport: zrodla/raport-weryfikacja-handoff.md). Statusy: PROPOZYCJA (czeka na Tomka) /
> ROZSTRZYGNIĘTE (bazą wiedzy / decyzją) / BUDOWA (rozstrzyga sesja budowlana z defaultem) /
> ODŁOŻONE. Lustro w panelu: wfa_notes (kind=decyzja).

## Decyzje Etapu 1 (fundamentowe)

> **20.07: Tomek delegował decyzje Etapu 1 sesji** („Ty jesteś dużo lepszy w podjęciu tych decyzji;
> ja decyduję o domenie"). Wszystkie D1-D7 = ROZSTRZYGNIĘTE przez sesję wg rekomendacji; Tomek może
> każdą nadpisać jednym zdaniem — wtedy naprawa + aktualizacja artefaktów.

| # | Decyzja | Rozstrzygnięcie | Status |
|---|---|---|---|
| **D1** | Model kont: firma multi-user od startu? | **TAK** — handoff wymaga „uprawniony użytkownik konta firmy"; model prosty: właściciel zaprasza e-mailem, wszyscy równorzędni; granulacja ról = v1.1. | ROZSTRZYGNIĘTE (sesja, 20.07) |
| **D2** | Kanon nazewnictwa statusów | Pozycja: **Zgodny / Niezgodny / UWAGA**; kolumna „Uwagi": **DO DECYZJI**; werdykt: **OK DO PODPISU / NEGOCJUJ PRZED PODPISEM** (bez STOP). Flagi makiet (LUKA/SPRZECZNOŚĆ/RYZYKO) = warstwa ikon 1:1; walidacja z KLIENTKĄ przy demo (jej produkt — ona jest właściwą bramką, nie Tomek). | ROZSTRZYGNIĘTE (sesja, 20.07) |
| **D3** | Walidacja merytoryczna | Zestaw umów testowych od klientki-operatorki + jej akcept w kroku testy_klienta. | ROZSTRZYGNIĘTE (sesja, 20.07) |
| **D4** | Prawnik + disclaimer | Disclaimer/komunikaty = krok `prawne` przed startem (twardy gate z handoffu). Zaangażowanie prawnika = WYDATEK zewnętrzny → jedno pytanie do Tomka przy kroku `prawne` (razem z tematem prawnika fachmata — jedna rozmowa, nie dwie). | ROZSTRZYGNIĘTE (sesja; wydatek→Tomek przy `prawne`) |
| **D5** | Osobne środowisko per firma | v1: wspólna infra + twarda izolacja RLS + szyfrowanie + osobne klucze; dedykowane środowisko = przyszły enterprise. | ROZSTRZYGNIĘTE (sesja, 20.07) |
| **D6** | Pricing / limity | **WARIANT A**: Start 249 zł netto/mc (5 analiz, 3 userów) / Pro 449 zł (15 analiz, bez limitu userów); rocznik = 2 mies. gratis (2490/4490); trial 14 dni BEZ karty (2 analizy + demo-analiza); founding 149 zł lock 12 mies. dla 20 firm z sieci PFP; nadmiar 99/79 zł. 249 nie 199 (branża płaci kilkaset zł/mc za SaaS; founding amortyzuje wejście; kotwica: kancelaria 1-3 tys. zł/analizę). Limity w app_settings — kalibracja po pomiarze kosztu AI/analizę w S4. | ROZSTRZYGNIĘTE (sesja, 20.07) |
| **D7** | Zatwierdzanie zanonimizowanej kopii | TAK — podgląd kopii + przycisk „Analizuj". | ROZSTRZYGNIĘTE (sesja, 20.07) |
| **D8** | Logo | **Wariant v2: sygnet-pieczątka S (bursztynowa ramka) + wordmark** — spójny z językiem produktu (werdykt-PIECZĄTKA na raporcie), sygnet daje favicon wprost (czytelny @32px, czego marker v3 nie daje). Marker zostaje w UI produktu (highlighty klauzul), nie musi być w logo. | ROZSTRZYGNIĘTE (sesja, 20.07) |

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
