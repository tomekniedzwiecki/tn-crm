# 01-MVP-SCOPE — PROPOZYCJA (2026-07-20, do cięcia i zatwierdzenia przez Tomka)

> Produkt: SaaS „back-to-back checker" umów podwykonawczych o roboty budowlane przy zamówieniach
> publicznych. Porównuje projekt umowy podwykonawczej z Kontraktem Głównym (KG) i przepisami KC/PZP,
> generuje raport kontrolny z flagami ryzyk i werdyktem. NIE jest opinią prawną.
> Klient-operator: magm5@interia.pl (środowisko Polskiego Forum Podwykonawców).
> Źródła: HANDOFF-PACK.md (168 itemów wiedzy, 117 wymagań v1), makiety sparingu („Luki Publiczne"),
> market_report (rekomendacja: wąski back-to-back, abonament 199–499 zł/mc).

## Funkcje rdzenia (co JEST w v1)

### F1 — Nowa analiza (wejście)
Formularz: inwestor, rola firmy (podwykonawca / dalszy podwykonawca), typ: roboty budowlane
(jedyny w v1; pole widoczne, zablokowane „wkrótce" dla usług/dostaw). Upload pełnego PDF projektu
umowy podwykonawczej — jeden dokument ALBO zestaw warunki ogólne + szczegółowe ze wskazaniem
hierarchii. Opcjonalnie KG + instrukcja, jak go pozyskać (wniosek o udostępnienie — zamówienia
publiczne = KG jest jawny). Podstawowe wejście: pusty wzór umowy (bez cen/danych osobowych).

### F2 — Przetwarzanie dokumentów (OCR + anonimizacja)
Odczyt PDF/skanów (OCR). Wykrycie danych osobowych → ostrzeżenie + automatyczna anonimizacja
(zanonimizowana kopia = to, co idzie do analizy). Nieczytelne fragmenty: użytkownik wgrywa lepszy
skan LUB poprawia tekst ręcznie; pełna historia korekt w osobnym pliku audytowym.

### F3 — Silnik analizy (serce produktu)
Analiza w interesie podwykonawcy: projekt umowy vs KG vs aktualne KC/PZP (baza przepisów wbudowana,
wersjonowana — w tym zmiana art. 463 PZP od 12.07.2026). Kontrola 18 obszarów MUST-HAVE z handoffu
(zabezpieczenia, limity/stawki/podstawy kar, zwłoka vs opóźnienie, waloryzacja, termin płatności
[flaga >30 dni, fraza „30 dni od wpływu faktury w KSeF"], gwarancja/rękojmia, odbiory, płatności
częściowe, zwrot zatrzymań, poufność, prawa autorskie, siła wyższa, korespondencja, akceptacja
i podpisanie, umocowania, odpowiedzialność RCO, pay-when-paid, uzależnienie zwrotu zabezpieczenia)
+ automatyczne wykrywanie dodatkowych istotnych warunków. Reguły ocen z handoffu §7 (m.in. każda
czerwona niezgodność → werdykt min. NEGOCJUJ; bez werdyktu STOP w v1). Tryb bez KG = „Informacja
ograniczona bez KG" z komunikatami zgodnie z handoffem.

### F4 — Raport kontrolny + PDF (deliverable)
Trzy części: I. kluczowe warunki · II. zgodność z KG/KC/PZP · III. obowiązki i terminy.
Tabela porównawcza wg wzoru z makiet: obszar | cytat projektu | cytat KG | flaga | podstawa
(KC/PZP art.) | komentarz „dlaczego to ryzyko" | „co negocjować" | kolumna „Uwagi" = „DO DECYZJI".
Pod tabelą: tabela kluczowych terminów odbioru i zwrotu kwot. Ekran werdyktu: pieczątka
(OK do podpisu / NEGOCJUJ PRZED PODPISEM) + 3 najważniejsze powody + podstawy prawne do rozmowy.
Eksport: raport PDF + osobny plik audytowy korekt OCR. Disclaimer prawny (materiał informacyjny,
nie opinia prawna) — treść do zatwierdzenia prawnego przed startem. Raport bez daty raportu.

### F5 — Konto firmy, historia, subskrypcja
Rejestracja/logowanie (e-mail+hasło), firma jako przestrzeń konta (użytkownicy firmy widzą
wyłącznie dokumenty i raporty SWOJEJ firmy — twarda izolacja RLS). Pulpit „kolejka spraw do
podpisu" (makieta panel): najbliższa umowa do decyzji + lista ostatnich analiz ze statusami.
Historia analiz i dokumentów. Subskrypcja Stripe (plany wg kroku pricing), panel operatora
(standard startera: użytkownicy, plany, rabaty, wiadomości, statystyki aktywacji).

### Wymagania doprecyzowane po weryfikacji packu vs pełna baza wiedzy (2026-07-20)
- **Czerwone instrukcje-dla-AI w referencyjnym PDF klientki**: fragmenty oznaczone na czerwono
  w wgrywanym wzorze bywają instrukcjami dla systemu — mają być NIEWIDOCZNE dla użytkownika
  i nie mogą trafić do raportu (jednocześnie zabezpieczenie klasy prompt-injection: treść
  dokumentu NIGDY nie jest wykonywana jako polecenie).
- **Reguła stanu prawnego**: część I raportu wg prawa AKTUALNEGO, część II wg stanu prawnego
  wskazanego w Kontrakcie Głównym (reguła klientki, nie otwarta kwestia).
- Wynik „UWAGA" prezentowany jako LISTA PUNKTÓW.
- Obszar obowiązkowy nieznaleziony → „UWAGA — nie znaleziono".
- Akceptacja dotyczy umowy PODPISANEJ (sama akceptacja projektu niewystarczająca — niuans RCO).
- Detekcja typu umowy: nie-budowlana → grzeczna odmowa analizy w v1.
- Przy niezgodności odnośnik do właściwego paragrafu projektu.

## Poza MVP (świadome cięcia — czego NIE MA w v1)
- Umowy na dostawy i usługi (tylko roboty budowlane).
- Gotowe zapisy naprawcze / aneksy / auto-negocjacje z drugą stroną.
- Pełna opinia prawna A-Z; werdykt „STOP".
- System obiegu dokumentów, podpisy, wersjonowanie umów między stronami.
- Techniczna integracja z KSeF (KSeF występuje wyłącznie jako fraza terminu płatności w raporcie).
- Osobne środowisko infrastrukturalne per firma (v1: wspólna infra + izolacja RLS + szyfrowanie;
  „dedykowane środowisko" = ewentualny plan enterprise później).
- Rozbudowane role/uprawnienia wewnątrz firmy (v1: właściciel konta zaprasza userów, wszyscy
  równorzędni w ramach firmy; granulacja ról = v1.1).
- Integracje CRM/kalendarz/API publiczne.

## Metryka aktywacji (aha) + TTFV
**Aha = użytkownik otwiera UKOŃCZONY raport kontrolny pierwszej WŁASNEJ umowy** (event `activated`:
pierwszy raport ze statusu done obejrzany). Typ aha: solo-async-AI (analiza trwa minuty →
ekran etapów przetwarzania zamiast spinnera, mail „raport gotowy").
**TTFV < 10 min**: od rejestracji do raportu własnej umowy (upload 2 min + analiza ≤5 min + otwarcie).
Furtka natychmiastowa: demo-analiza przykładowej umowy (jak makieta „Budowa hali sportowej") widoczna
od pierwszego wejścia — wartość widać w 60 sekund, zanim user wgra własny dokument.

## Granica „w cenie v1" vs rozwój
**W cenie v1** (po demo/testach klienta): korekty reguł kontrolnych i treści komentarzy, poprawki
jakości OCR/anonimizacji, zmiany układu/treści raportu i PDF, kosmetyka UI, poprawki błędów.
**Rozwój (osobna wycena / v1.1+):** nowe typy umów (dostawy/usługi), nowe moduły (obieg, aneksy,
opinie), integracja KSeF/API, role zaawansowane, dedykowane środowiska, wersja EN.

## Kryteria „gotowe" per funkcja
- F1: analiza startuje z formularza w <2 min; oba warianty wejścia (1 dok / WO+WS z hierarchią); KG opcjonalny.
- F2: skan testowy przechodzi OCR; dane osobowe w dokumencie testowym wykryte i zanonimizowane
  z ostrzeżeniem; korekta fragmentu działa i ląduje w pliku audytowym.
- F3: zestaw testowy umów (przygotowany z ekspertem/klientem) daje flagi zgodne z regułami §7
  handoffu; tryb bez KG działa z właściwymi komunikatami; podstawa prawna tylko gdy przepis ma
  zastosowanie; wersja prawa poprawna względem daty.
- F4: raport 3-częściowy zgodny z wymogami handoffu (kolumny, kolejność wg paragrafów, czerwone
  DO DECYZJI, tabela terminów pod tabelą porównawczą, disclaimer, bez daty); PDF pobieralny; plik audytowy osobno.
- F5: izolacja firm potwierdzona testem kluczem anon (zero przecieków); pulpit pokazuje kolejkę
  i historię; płatność E2E → dostęp wg planu.

## DO DECYZJI TOMKA (oznaczone miejsca)
1. **Model kont v1:** firma multi-user od startu (rekomendacja: TAK — handoff wprost wymaga
   „uprawniony użytkownik konta firmy"; prosty model: zaproszenia e-mail, bez ról) czy solo-user na start?
2. **Walidacja merytoryczna:** handoff wymaga „testów zatwierdzonych przez eksperta branżowego" —
   proponuję: zestaw umów testowych od klienta-operatora (on JEST ekspertem niszy) + jego akcept
   jakości analiz w kroku testy_klienta; udział prawnika PZP = decyzja osobna (koszt zewnętrzny).
3. **Nazewnictwo statusów** (niespójność w materiałach klienta): proponuję kanon —
   pozycja: Zgodny / Niezgodny / UWAGA; kolumna Uwagi: DO DECYZJI; werdykt końcowy:
   OK DO PODPISU / NEGOCJUJ PRZED PODPISEM (bez STOP). Flagi wizualne z makiet (LUKA/SPRZECZNOŚĆ/
   RYZYKO) mapują się na UWAGA/Niezgodny/UWAGA — do potwierdzenia przy demo z klientem.
4. **Zatwierdzanie anonimizacji przed analizą:** rekomendacja: podgląd zanonimizowanej kopii
   z przyciskiem „Analizuj" (jawny krok — buduje zaufanie, koszt niski).
