# PROSPEKTOR — Test równowagi (LIA / Legitimate Interests Assessment)

> Ocena przesłanki uzasadnionego interesu (art. 6 ust. 1 lit. f RODO) dla przetwarzania
> danych kontaktowych w module Prospektor (outbound fabryki aplikacji TN App).
> Dokument wewnętrzny administratora. Do podpisania i przechowywania w dokumentacji RODO
> (rozliczalność — art. 5 ust. 2 RODO). Aktualizować przy istotnej zmianie zakresu/źródeł.

**Administrator:** Tomasz Niedźwiecki (jednoosobowa działalność gospodarcza) — pełne dane
identyfikacyjne (firma, NIP, adres) wg `settings.aplikacja_wykonawca_dane`, tożsame z danymi
podawanymi w stopce wiadomości.
**Kontakt w sprawie danych:** adres wysyłkowy modułu (`settings.wfp_from_email`,
obecnie `tomek@kontakt.tomekniedzwiecki.pl`) oraz adres podany w stopce.
**Data sporządzenia:** 2026-07-23 · **Wersja:** 1.0 · **Właściciel decyzji:** Tomasz Niedźwiecki.
**Zakres:** wysyłka pierwszego kontaktu B2B (cold outreach „partnerski") do (A) mikrofirm z
katalogów branżowych i rejestrów publicznych oraz (B) osób fizycznych z publicznych list
zawodowych (biegli sądowi z list sądów okręgowych). Kanał: e-mail (Resend) oraz LinkedIn.

> **Zakres tego dokumentu — RODO, nie PKE.** LIA ocenia WYŁĄCZNIE podstawę przetwarzania danych
> osobowych (art. 6 ust. 1 lit. f RODO). Reżim art. 398 PKE (zgoda na wysyłkę informacji
> handlowej środkami komunikacji elektronicznej) to ODRĘBNA warstwa prawna, świadomie
> zarządzana po stronie wykonania (neutralny pierwszy kontakt bez oferty/cen/linków, adresy
> firmowe/opublikowane do kontaktu, twardy opt-out, niski wolumen, akceptacja ręczna).
> Pozytywny wynik LIA nie „legalizuje" wysyłki w rozumieniu PKE i odwrotnie — to dwie niezależne
> oceny. Decyzja o działaniu w reżimie PKE jako ryzyku zarządzanym została podjęta odrębnie.

---

## Metoda

Test trójstopniowy (wytyczne EROD/UODO oraz linia orzecznicza po sprawie Bisnode/NSA):
1. **Test celu** — czy istnieje realny, zgodny z prawem, konkretnie nazwany interes.
2. **Test niezbędności** — czy przetwarzanie jest potrzebne do jego realizacji i czy nie da się
   go osiągnąć środkami mniej ingerującymi w prywatność.
3. **Test równowagi** — czy interes administratora nie jest nadrzędnie przeważony przez interesy,
   prawa i wolności osoby, przy uwzględnieniu jej rozsądnych oczekiwań i zastosowanych zabezpieczeń.

Ocenę przeprowadzono osobno dla dwóch kategorii podmiotów, bo różnią się ryzykiem.

═══════════════════════════════════════════════════════════════════════════

## CZĘŚĆ A — Firmy z katalogów branżowych i rejestrów publicznych

Dotyczy prospektów, których dane (nazwa firmy, adres e-mail ogólny/firmowy, WWW, NIP, miasto)
pochodzą z: katalogów branżowych publikujących dane kontaktowe do kontaktu biznesowego (np.
PSPDDD), rejestrów publicznych (CEIDG), wykazów BIP gmin oraz stron internetowych firm.
Źródło każdego rekordu jest zapisane w kolumnie `wfp_prospects.source`
(`pspddd`/`ceidg`/`bip-gmina`/`katalog`/`csv`/`manual`).

### A.1. Test celu
- **Interes:** nawiązanie współpracy biznesowej (B2B) — dotarcie do właściciela/eksperta z danej
  branży z propozycją wspólnego zbudowania i prowadzenia wyspecjalizowanej aplikacji (vertical
  SaaS) dla tej branży. Pozyskanie partnera-operatora to zwykły, legalny interes gospodarczy
  administratora (marketing bezpośredni B2B / poszukiwanie kontrahenta).
- **Zgodność z prawem:** tak. Marketing bezpośredni jest wprost wskazany w motywie 47 RODO jako
  mogący stanowić uzasadniony interes. Kontakt kierowany jest do firm i osób wykonujących
  działalność gospodarczą, na adresy przez nie opublikowane do kontaktu.
- **Realność:** tak — to podstawowy kanał pozyskania partnera dla modelu biznesowego fabryki
  aplikacji (odwrócony lejek). Bez kontaktu nie ma współpracy.

**Wynik testu celu: SPEŁNIONY.**

### A.2. Test niezbędności
- Przetwarzanie ograniczone do danych minimalnie potrzebnych do nawiązania kontaktu i oceny
  dopasowania: nazwa firmy, adres e-mail, WWW, NIP, miasto, ewentualnie imię i rola osoby
  kontaktowej opublikowanej przez firmę. Nie zbieramy danych wrażliwych, nie profilujemy w
  rozumieniu decyzji wywołujących skutki prawne.
- **Brak środka mniej ingerującego:** aby zaproponować konkretnej firmie z branży współpracę,
  trzeba się z nią skontaktować. Reklama masowa/nieadresowana nie realizuje celu (potrzebny jest
  jeden partner-operator na wertykal, dobrany merytorycznie). Adres e-mail firmowy jest
  najmniej inwazyjnym kanałem (odbiorca decyduje, kiedy i czy odpowie).
- Research AI opiera się wyłącznie na danych już publicznych (strona firmy, web_search) i służy
  temu, by kontakt był trafny i jednostkowy — co zmniejsza, a nie zwiększa uciążliwość
  (brak masówki).

**Wynik testu niezbędności: SPEŁNIONY** (zakres danych adekwatny, brak łagodniejszej alternatywy).

### A.3. Test równowagi
| Czynnik | Ocena |
|---|---|
| Charakter danych | Dane firmowe / kontaktowe do celów zawodowych. Adresy ogólne (biuro@, kontakt@) lub opublikowane do kontaktu biznesowego. Brak danych szczególnej kategorii (art. 9). Niskie ryzyko dla prywatności. |
| Źródło | Publiczne, opublikowane przez samą firmę lub udostępnione w rejestrze/katalogu do kontaktu. |
| Rozsądne oczekiwania | Firma publikująca adres kontaktowy realnie liczy się z kontaktem biznesowym. Propozycja współpracy w danej branży mieści się w oczekiwaniach przedsiębiorcy. |
| Skutki dla osoby | Minimalne: jedna krótka wiadomość, bez oferty/cen/nacisku, z natychmiastową możliwością rezygnacji. Brak skutków finansowych/prawnych. |
| Nierównowaga sił / wrażliwość podmiotu | Brak — adresat to przedsiębiorca działający na rynku, nie konsument w słabszej pozycji. |
| Interes administratora | Zwykły interes gospodarczy o umiarkowanej wadze. |

**Balans:** interes administratora nie jest przeważony przez prawa i wolności podmiotów, pod
warunkiem zachowania zabezpieczeń z sekcji „Zabezpieczenia wspólne". Kluczowe: pełny obowiązek
informacyjny art. 14 przy pierwszym kontakcie (lekcja Bisnode/NSA) oraz natychmiastowy,
nieodwracalny opt-out.

**Wynik testu równowagi: DODATNI. Przetwarzanie dopuszczalne na art. 6 ust. 1 lit. f RODO.**

═══════════════════════════════════════════════════════════════════════════

## CZĘŚĆ B — Osoby fizyczne z publicznych list zawodowych (biegli sądowi)

Dotyczy prospektów będących **osobami fizycznymi** — biegłych sądowych, których dane (imię i
nazwisko, specjalność, adres e-mail) pochodzą z **list biegłych publikowanych przez sądy
okręgowe** (BIP). Źródło zapisane jako `source = 'sad-okregowy'`. Ta kategoria wymaga
zaostrzonej oceny, bo adresatem jest osoba fizyczna, a dane bywają danymi kontaktu prywatnego.

> **Założenie wejściowe (bramka importu):** do zbioru trafiają wyłącznie e-maile, które biegły
> sam udostępnił na liście sądu jako kanał kontaktu zawodowego (kontakt OPT-IN po stronie sądu —
> patrz PROSPEKTOR-BAZA.md). Jeżeli dla danego biegłego lista nie zawiera opublikowanego adresu
> kontaktowego — NIE pozyskujemy adresu innymi drogami i nie kontaktujemy się mailowo.

### B.1. Test celu
- **Interes:** ten sam co w części A — nawiązanie współpracy B2B, tu: pozyskanie eksperta
  z danej dziedziny jako partnera-operatora aplikacji dla jego środowiska zawodowego.
- **Zgodność z prawem i realność:** jak w A.1. Biegły figuruje na liście jako profesjonalista
  świadczący odpłatnie usługi (opinie na zlecenie), a więc uczestnik obrotu — propozycja
  współpracy zawodowej jest z tym spójna.

**Wynik testu celu: SPEŁNIONY.**

### B.2. Test niezbędności
- Zakres danych zawężony do: imię i nazwisko, specjalność (wertykal), opublikowany adres e-mail.
  Bez adresu domowego, bez danych z akt, bez dodatkowego wzbogacania o dane spoza źródła
  publicznego poza tym, co konieczne do trafności kontaktu.
- **Brak łagodniejszej alternatywy** — jak w A.2. Dodatkowo: wolumen świadomie niski (mało
  rekordów, dużo pracy ręcznej — patrz BAZA.md), co samo w sobie ogranicza ingerencję.

**Wynik testu niezbędności: SPEŁNIONY.**

### B.3. Test równowagi
| Czynnik | Ocena |
|---|---|
| Charakter danych | Dane osoby fizycznej (imię, nazwisko, e-mail). Adres bywa prywatny/osobisty (np. imię.nazwisko@gmail) → wyższa wrażliwość niż w części A. Brak danych szczególnej kategorii. |
| Źródło | Publiczna lista sądu okręgowego. **Cel publikacji jest wąski** — umożliwienie kontaktu w sprawach związanych z funkcją biegłego. To zawęża rozsądne oczekiwania (patrz niżej). |
| Rozsądne oczekiwania | **Słabszy punkt oceny.** Biegły udostępnił adres do kontaktu w sprawach opiniodawczych, niekoniecznie oczekuje ofert współpracy biznesowej. Dlatego waga zabezpieczeń (pełny art. 14, łatwy sprzeciw, brak nacisku, brak powtórzeń) jest tu wyższa. |
| Skutki dla osoby | Minimalne: jedna wiadomość, natychmiastowy opt-out. Brak skutków prawnych/finansowych. |
| Nierównowaga sił / wrażliwość | Osoba fizyczna, ale profesjonalista świadomy obrotu — nie konsument w typowo słabszej pozycji. |
| Interes administratora | Zwykły interes gospodarczy o umiarkowanej wadze. |

**Balans:** dopuszczalny, ale **warunkowo i z podwyższonym rygorem zabezpieczeń**. W szczególności:
- pełny obowiązek informacyjny art. 14 ze **wskazaniem konkretnego źródła** (nazwa sądu + data/
  wersja listy) — nie ogólnikowe „rejestry publiczne";
- wyeksponowane prawo sprzeciwu (art. 21) realizowane natychmiast;
- **bezwzględny brak powtórnego kontaktu** przy braku odpowiedzi (jeden mail = jeden kontakt);
- krótsza retencja niż dla firm (patrz polityka retencji);
- jeśli biegły figuruje jednocześnie na kilku listach lub w kilku wertykalach — traktujemy jako
  **jedną osobę** (patrz zalecenie suppression per-tożsamość w audycie).

**Wynik testu równowagi: DODATNI WARUNKOWO** — pod warunkiem zaostrzonych zabezpieczeń wyżej.
Jeżeli którykolwiek warunek nie jest spełniony (np. nie umiemy podać konkretnego źródła w
stopce) — dla danego rekordu przetwarzania na 6.1.f nie uznajemy za zbalansowane i nie wysyłamy.

═══════════════════════════════════════════════════════════════════════════

## Zabezpieczenia wspólne (mitygacje uwzględnione w bilansie)

Bilans w częściach A i B jest dodatni **dzięki** poniższym zabezpieczeniom. Ich usunięcie
unieważnia ocenę.

1. **Akceptacja ręczna (human-in-the-loop).** Żadna wiadomość nie wychodzi automatycznie —
   każdą pierwszą wiadomość akceptuje administrator w panelu (kolejka „Akceptacja"). System nie
   prowadzi masowej wysyłki bez człowieka.
2. **Pełny obowiązek informacyjny art. 14 przy pierwszym kontakcie.** Stopka doklejana
   serwerowo wyłącznie przy wysyłce/drafcie pierwszego kontaktu
   (`settings.wfp_stopka_prawna` → `composeStopka`): tożsamość i dane administratora, źródło
   danych, cel, podstawa (6.1.f), prawa (dostęp, sprostowanie, usunięcie, ograniczenie,
   **sprzeciw**), prawo skargi do PUODO, okres przechowywania, instrukcja opt-out.
   Dla osób fizycznych (część B) — **wariant stopki ze wskazaniem konkretnej listy sądu i daty**.
3. **Opt-out natychmiastowy i nieodwracalny.** Odpowiedź „STOP" (i każdy sygnał sprzeciwu)
   klasyfikowana jest jako `opt_out` i realizowana automatycznie: `opted_out=true`, status
   `opt_out`, rekord nie wraca do lejka; z panelu opt-out jest nieusuwalny; import dedupem nie
   ożywia rekordu (unikalne indeksy). To najsilniejszy środek ochronny — daje podmiotowi pełną
   kontrolę.
4. **Neutralny pierwszy kontakt.** Bez ceny, oferty, linków i załączników; jedna krótka
   wiadomość, jedno pytanie. Minimalizuje uciążliwość i ryzyko odczucia „spamu".
5. **Adresy do kontaktu zawodowego.** Preferencja adresów ogólnych/firmowych (A) lub
   opublikowanych do kontaktu zawodowego (B). Nie pozyskujemy adresów spoza źródła publicznego.
6. **Limit dzienny (cap).** `settings.wfp_send_daily_cap` (start 25/dzień) ogranicza wolumen —
   działanie punktowe, nie masowe.
7. **Audytowalność źródła.** Kolumna `source` zapisuje pochodzenie każdego rekordu; umożliwia
   rzetelne podanie źródła w stopce i wykazanie rozliczalności.
8. **Minimalizacja i izolacja.** Zakres danych ograniczony do niezbędnych; research AI budowany
   wyłącznie z danych danego rekordu (izolacja), bez łączenia w profile poza celem.

═══════════════════════════════════════════════════════════════════════════

## Wynik zbiorczy i warunki utrzymania ważności

- **Część A (firmy):** przetwarzanie na art. 6 ust. 1 lit. f RODO — **DOPUSZCZALNE**.
- **Część B (osoby fizyczne — biegli):** przetwarzanie na art. 6 ust. 1 lit. f RODO —
  **DOPUSZCZALNE WARUNKOWO**, przy zaostrzonych zabezpieczeniach (konkretne źródło w stopce,
  brak powtórek, krótsza retencja, suppression per-tożsamość).

**Ocena traci ważność i wymaga powtórzenia, jeżeli:** zmieni się cel; zniknie któreś z
zabezpieczeń (zwłaszcza akceptacja ręczna, stopka art. 14 lub opt-out); wolumen przestanie być
punktowy; pojawi się nowa kategoria źródeł; UODO/sąd zajmie odmienne stanowisko wobec danej
praktyki.

**Realizacja sprzeciwu (art. 21 RODO):** przy marketingu bezpośrednim sprzeciw jest bezwarunkowy
— po jego wniesieniu dane tej osoby nie mogą być dalej przetwarzane do tego celu. Wykonanie:
mechanizm opt-out (suppression) + polityka retencji opt-out (bezterminowe utrzymanie minimalnego
znacznika wykluczenia — patrz PROSPEKTOR-PLAN / audyt retencji).

---

_Podpis administratora: ……………………………………  Data: ………………_

_Dokument przechowywany w dokumentacji RODO administratora (rozliczalność, art. 5 ust. 2 RODO)._
