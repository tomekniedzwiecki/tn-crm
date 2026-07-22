# Poprawki lejka Aplikacja — spec wdrożeniowy (prawo → kod)

> Status: PLAN po rekonesansie i researchu prawnym 21.07.2026. Wdrożenie PO akceptacji Tomka
> (dokumenty prawne muszą wejść pierwsze — checkboxy linkują do nowego regulaminu).
> Luki wykryte w: `aplikacja/sparing/index.html`, `spar-public-feed`, checkout/v2.

## P1 — Zgoda na publikację w Inspiracjach (NAJPILNIEJSZE — dziś publikujemy bez żadnej zgody)

Stan: `spar-public-feed` publikuje nazwę pomysłu + makiety każdej sesji nie-testowej
(`hidden_from_feed=false` = default). User nigdzie nie wyraża zgody. Ryzyko: RODO (zgoda),
prawa autorskie do treści usera, sprzeczność z przyszłym NDA.

Docelowo:
1. Migracja: `spar_sessions.showcase_consent_at timestamptz`, `showcase_consent_source text`.
2. `spar-public-feed`: warunek feedu += `showcase_consent_at IS NOT NULL` (twardy filtr).
3. Front sparingu: checkbox (NIEzaznaczony) w naturalnym momencie — po wygenerowaniu makiet
   („Pokaż mój projekt w Inspiracjach — zanonimizowany: robocza nazwa + makiety, bez moich
   danych. Mogę cofnąć w każdej chwili."), zapis przez spar-project + timestamp.
4. Cofnięcie: przycisk w ustawieniach konta sparingu → NULL + znika z feedu (cache do 7 dni
   — komunikat). Panel tn-aplikacje: kolumna zgody + ręczne wyłączenie.
5. ISTNIEJĄCE karty w galerii: brak zgód wstecz → decyzja Tomka: (a) wyczyścić feed do czasu
   zebrania zgód (bezpiecznie), (b) zostawić karty w pełni zanonimizowane (nazwa+makiety bez
   PII — ryzyko niskie, ale bez podstawy licencyjnej), (c) mail do userów z prośbą o zgodę.
   Rekomendacja: (b) przejściowo + zgoda dla nowych sesji od wdrożenia; sporne karty ukrywać
   na żądanie.
6. Oznaczenie AI (art. 50 ust. 4 AI Act, od 2.08.2026): w galerii i na kartach dopisek
   „Makiety wygenerowane z udziałem AI".

## P2 — Rejestracja konta: akceptacja regulaminu

Stan: formularz konta (`authFormHTML`) bez żadnego checkboxa/linku.
Docelowo: pod przyciskiem rejestracji stała formuła (implicit consent — jak /zapisy):
„Zakładając konto akceptujesz [regulamin](https://tomekniedzwiecki.pl/aplikacja/regulamin/)
i [politykę prywatności](/dokumenty/polityka-prywatnosci.html)." + zapis wersji regulaminu
przy tworzeniu konta (metadane usera). OAuth Google — ta sama formuła nad przyciskiem.

## P3 — Rozmowa 49 zł: zgoda na natychmiastowe wykonanie

Stan: przycisk „Zapłać BLIK-iem — 49 zł" bez zgody konsumenckiej.
Docelowo: checkbox (NIEzaznaczony) przy paywallu:
„Chcę zacząć rozmowę od razu — żądam wykonania usługi przed upływem 14-dniowego terminu
odstąpienia. Wiem, że po pełnym przeprowadzeniu rozmowy utracę prawo odstąpienia, a przy
wcześniejszej rezygnacji zapłacę proporcjonalnie ([regulamin])."
Zapis: `orders.consent_digital_service/consented_at` (BLIK inline → przekazać w create-transaction
meta; checkout redirect → istniejący mechanizm). Mail potwierdzający (trwały nośnik) — jest
w przepływie zamówienia.

## P4 — Mail-capture: checkbox NIE może być domyślnie zaznaczony

Stan: okno generacji ma checkbox „Możecie pisać do mnie w sprawie tego projektu" DOMYŚLNIE
ZAZNACZONY → zgoda marketingowa pre-ticked = wadliwa (RODO/PKE).
Docelowo: domyślnie odznaczony. (Konwersja: dopisać 1 zdanie wartości zamiast pre-ticka.)

## P5 — Informacja o AI (art. 50 AI Act — obowiązek od 2.08.2026)

Stan: UI mówi „rozmowa z AI" w wielu miejscach (zasadniczo OK — „oczywistość" wyłącza
obowiązek), brak formalnej noty.
Docelowo (wzmocnienie, tanie): stała linijka pod pierwszą wiadomością rozmowy:
„Rozmawiasz z systemem AI działającym w imieniu Tomka. Wygenerowane materiały mają charakter
koncepcyjny." + zapis w regulaminie (jest w nowym draftcie).

## P6 — Rezerwacja 500 zł: teksty zgody + reżim zwrotnej zaliczki (Regulamin §9)

Inline sparing mówi „opłata 500 zł", checkout „opłata rezerwacyjna" — ujednolicić na wersję
checkoutu; po publikacji NOWEGO regulaminu zaktualizować oba linki (URL bez zmian).

**Reżim rezerwacji ≠ reżim 49 zł (kluczowe).** Rezerwacja 500 zł to **w pełni zwrotna opłata
rezerwacyjna (zaliczka na poczet ceny budowy)**, a NIE zadatek (art. 394 k.c. wyłączony) i NIE
wynagrodzenie za plan/rozmowę (czynności przygotowawcze są nieodpłatne). W przeciwieństwie do
kolejnej Rozmowy 49 zł (P3) rezerwacja **NIE ma checkboxa żądania natychmiastowego wykonania
usługi** — nie ma tu usługi cyfrowej wykonywanej „od ręki", więc nie odbieramy prawa odstąpienia
tym mechanizmem. Copy przy płatności: „W pełni zwrotna opłata rezerwacyjna — jeśli nie zawrzemy
umowy o budowę, oddajemy całe 500 zł" (bez „przepada", bez zadatku).

**Wymagania produktowe (z Regulaminu §9 — DOPISANE do spec):**
1. **Kontakt w 3 dni robocze od wpłaty** — po zaksięgowaniu rezerwacji uruchomić zadanie/przypomnienie
   kontaktu 1:1 (SLA 3 dni robocze). [Termin oznaczony w Regulaminie jako DO POTWIERDZENIA — TOMEK.]
2. **Zwrot 7 dni od decyzji** o niezawieraniu współpracy (na życzenie Klienta lub decyzję którejkolwiek
   strony) — szybsza ścieżka niż ustawowe 14 dni; obsłużyć ręczny trigger zwrotu.
3. **Rezygnacja e-mailem w każdej chwili** przed zawarciem Umowy Budowy = pełny zwrot; przyjąć zgłoszenie
   na `ceo@tomekniedzwiecki.pl` (adres ujednolicony z Regulaminem).
4. Potwierdzenie zawarcia Umowy Rezerwacyjnej na trwałym nośniku (e-mail) — jak w istniejącym przepływie
   zamówienia.
5. **Kwoty prezentowane w ofercie/checkoucie (NIE w regulaminie).** Regulamin nie podaje już kwot (decyzja
   Tomka 22.07), więc oferta i checkout MUSZĄ pokazać cenę PRZED zapłatą: cena kolejnej rozmowy (49 zł),
   Opłata Rezerwacyjna (500 zł) oraz cena budowy — jednoznacznie, przy przycisku z obowiązkiem zapłaty
   (art. 12 i art. 17 UoPK). Budżet reklamowy rozruchu (jeśli komunikowany na tym etapie) finansuje klient
   (Partner) — patrz Umowa Budowy § 1 ust. 4.

> **Uwaga (decyzja Tomka 22.07):** automatyczny zwrot rezerwacji po 60 dniach USUNIĘTY — nie wdrażamy
> pola `reservation_paid_at`/crona 60 dni na potrzeby auto-refundu; zwrot idzie ścieżką ręczną (7 dni od
> decyzji) oraz na rezygnację e-mailem w każdej chwili.

## Kolejność wdrożenia

1. Publikacja nowego regulaminu (URL ten sam) + polityka prywatności bez zmian.
2. P1 (migracja + edge + front + galeria) — najpilniejsze.
3. P2, P3, P4, P5, P6 — jeden przebieg frontu sparingu + checkout.
4. Weryfikacja: visual-verify lejka + test feedu (karta bez zgody nie wychodzi).
