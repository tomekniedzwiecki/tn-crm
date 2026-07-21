# WZÓR — Polityka Prywatności aplikacji Partnera (szablon do wypełnienia)

> **Metryczka**
> - **Status:** DRAFT do weryfikacji Tomka
> - **Data sporządzenia:** 2026-07-21
> - **Wersja:** v1
> - **Czym jest:** **szablon** polityki prywatności dla aplikacji budowanych klientom (Partnerom). Wstawiany jako podstrona prawna każdej wdrażanej aplikacji SaaS. Uzupełniany per aplikacja z placeholderów `{{...}}`.
> - **Kluczowa różnica ról:** w aplikacji Partnera **administratorem danych użytkowników końcowych jest PARTNER** (to on jest *merchant of record* i prowadzi biznes). **Tomek jest podmiotem przetwarzającym (procesorem)** — na podstawie DPA z Umowy Budowy (Załącznik 2), do czasu wykupu. To odwrotnie niż w polityce lejka /aplikacja, gdzie administratorem jest Tomek.

---

## ⚙️ INSTRUKCJA UŻYCIA (usunąć przed publikacją na stronie aplikacji)

Do wypełnienia per aplikacja:

| Placeholder | Co wstawić |
|---|---|
| `{{NAZWA_APLIKACJI}}` | nazwa marki/aplikacji (np. „Fachmat") |
| `{{DOMENA_APLIKACJI}}` | domena produkcyjna (np. `fachmat.pl`) |
| `{{PARTNER_DANE}}` | pełne dane administratora: imię i nazwisko / firma, forma prawna, adres, NIP, REGON/KRS |
| `{{PARTNER_EMAIL_KONTAKT}}` | adres e-mail do spraw danych osobowych (kontakt administratora) |
| `{{DATA_OBOWIAZYWANIA}}` | data wejścia w życie polityki |
| `{{LISTA_AI}}` | jeśli aplikacja korzysta z AI — dostawca modelu (np. OpenAI) i funkcja; jeśli nie — usunąć wiersz AI z tabeli i sekcję 6 |
| `{{ANALITYKA}}` | jeśli aplikacja używa analityki/pixeli (np. Meta Pixel, Google Analytics) — wpisać; jeśli nie — usunąć |
| `{{RETENCJA_KONTA}}` | okres przechowywania danych konta po jego usunięciu (np. „do 30 dni") |

Zasady:
- **Nie usuwaj** wierszy Supabase / Vercel / Resend, jeśli aplikacja z nich korzysta (standard fabryki).
- **Stripe zostaje zawsze** jako odrębny administrator (płatności w aplikacjach idą przez Stripe Connect — Partner jest *merchant of record*).
- Jeżeli aplikacja **nie używa AI**, usuń dostawcę AI z tabeli odbiorców, sekcję o AI (art. 50 AI Act) i wzmiankę o transferze do USA z tego tytułu.
- Po wypełnieniu **usuń tę instrukcję oraz sekcję „NOTATKI ROBOCZE".**

---

# Polityka Prywatności — {{NAZWA_APLIKACJI}}

**Obowiązuje od:** {{DATA_OBOWIAZYWANIA}}

Niniejsza Polityka wyjaśnia, jak przetwarzamy dane osobowe użytkowników serwisu **{{NAZWA_APLIKACJI}}**, dostępnego pod adresem **{{DOMENA_APLIKACJI}}**.

## 1. Administrator danych

Administratorem Twoich danych osobowych jest **{{PARTNER_DANE}}** (dalej: „Administrator" lub „my"). Kontakt w sprawach danych osobowych: **{{PARTNER_EMAIL_KONTAKT}}**.

## 2. Jakie dane przetwarzamy

- **dane konta:** adres e-mail, hasło (w postaci zaszyfrowanej), nazwa użytkownika,
- **dane identyfikacyjne i kontaktowe** podane przy korzystaniu z usługi (imię, nazwisko, nazwa firmy, NIP, adres, telefon — w zakresie potrzebnym do świadczenia usługi),
- **dane transakcyjne:** historia zamówień/subskrypcji, potwierdzenia płatności (bez pełnych danych karty — te przetwarza operator płatności),
- **treści** wprowadzane przez Ciebie w aplikacji,
- **dane techniczne:** adres IP, informacje o przeglądarce i urządzeniu, pliki cookies, logi.

## 3. Cele i podstawy prawne

| Cel | Podstawa (RODO) |
|---|---|
| Założenie i prowadzenie konta, świadczenie usług aplikacji | art. 6 ust. 1 lit. b (wykonanie umowy) |
| Obsługa płatności i subskrypcji | art. 6 ust. 1 lit. b oraz lit. c |
| Rachunkowość, podatki, wystawianie dokumentów | art. 6 ust. 1 lit. c (obowiązek prawny) |
| Kontakt, obsługa zgłoszeń, powiadomienia serwisowe | art. 6 ust. 1 lit. b oraz lit. f |
| Marketing bezpośredni własnych usług | art. 6 ust. 1 lit. f; e-mail marketingowy — art. 6 ust. 1 lit. a (zgoda) |
| Dochodzenie i obrona przed roszczeniami, bezpieczeństwo | art. 6 ust. 1 lit. f |

Podanie danych jest dobrowolne, ale niezbędne do korzystania z aplikacji.

## 4. Odbiorcy danych

Aby świadczyć usługę, korzystamy z zaufanych dostawców. Działają oni jako **podmioty przetwarzające** (w naszym imieniu), chyba że zaznaczono inaczej:

| Dostawca | Funkcja | Status | Transfer poza EOG |
|---|---|---|---|
| **Tomasz Niedźwiecki AI** (Tomek) | opieka techniczna, utrzymanie i serwis aplikacji, hosting płatności | podmiot przetwarzający (na podstawie DPA) | — |
| **Supabase** | baza danych, uwierzytelnianie, przechowywanie plików | podmiot przetwarzający (poddostawca) | możliwy — na podstawie SCC |
| **Vercel** | hosting aplikacji (warstwa frontowa) | podmiot przetwarzający (poddostawca) | USA — SCC |
| **Resend** | wysyłka e-maili transakcyjnych | podmiot przetwarzający (poddostawca) | USA — SCC |
| **{{LISTA_AI}}** *(jeśli aplikacja używa AI)* | przetwarzanie treści na potrzeby funkcji opartych o AI | podmiot przetwarzający (poddostawca) | np. USA — SCC / DPF |
| **Stripe** | obsługa płatności online (karty, subskrypcje) | **odrębny administrator** danych płatniczych | USA — SCC / DPF |
| **{{ANALITYKA}}** *(jeśli używana)* | analityka i pomiar ruchu | wg roli danego narzędzia | wg dostawcy |

Powierzenie Tomkowi i jego poddostawcom odbywa się na podstawie **umowy powierzenia przetwarzania danych (DPA)** zgodnej z art. 28 RODO. Aktualny wykaz poddostawców i lokalizacji przetwarzania udostępniamy na żądanie.

**Stripe** przetwarza dane płatnicze jako **samodzielny administrator** — nie mamy dostępu do pełnych danych Twojej karty.

**Transfery poza EOG** odbywają się na podstawie **standardowych klauzul umownych (SCC)** oraz — jeśli dotyczy — ram **Data Privacy Framework**, z niezbędnymi środkami dodatkowymi.

## 5. Okres przechowywania

- dane konta — przez czas posiadania konta; po usunięciu konta usuwane w terminie {{RETENCJA_KONTA}},
- dane transakcyjne i dokumenty księgowe — **5 lat** od końca roku, w którym powstał obowiązek podatkowy,
- dane na potrzeby roszczeń — do upływu przedawnienia (co do zasady **6 lat**),
- dane przetwarzane na podstawie zgody/uzasadnionego interesu — do wycofania zgody albo sprzeciwu.

## 6. Informacja o AI *(pozostawić tylko jeśli aplikacja używa AI)*

Aplikacja korzysta z funkcji opartych na sztucznej inteligencji. Tam, gdzie wchodzisz w interakcję z systemem AI, jest to **wyraźnie oznaczone** (art. 50 rozporządzenia (UE) 2024/1689 — AI Act). Wyniki generowane przez AI mogą zawierać błędy i mają charakter pomocniczy.

## 7. Twoje prawa

Masz prawo do: **dostępu**, **sprostowania**, **usunięcia**, **ograniczenia przetwarzania**, **przenoszenia danych**, **sprzeciwu** (w tym wobec marketingu) oraz **wycofania zgody** w każdej chwili. Aby skorzystać z praw — napisz na **{{PARTNER_EMAIL_KONTAKT}}**.

Przysługuje Ci też prawo skargi do organu nadzorczego — **Prezesa Urzędu Ochrony Danych Osobowych (PUODO)**, ul. Stawki 2, 00-193 Warszawa.

## 8. Zautomatyzowane decyzje

Twoje dane **nie służą** do zautomatyzowanego podejmowania decyzji wywołujących wobec Ciebie skutki prawne lub w podobny sposób istotnie na Ciebie wpływających.

## 9. Pliki cookies

Aplikacja używa plików cookies (niezbędnych, funkcjonalnych, a jeśli dotyczy — analitycznych i marketingowych). Ustawienia cookies zmienisz w przeglądarce.

## 10. Zmiany polityki

Politykę możemy aktualizować (np. przy zmianie przepisów lub dostawców). Aktualna wersja jest publikowana pod adresem {{DOMENA_APLIKACJI}} i obowiązuje od wskazanej daty.

---

## NOTATKI ROBOCZE (do usunięcia — także z każdej wygenerowanej instancji)

1. **[DO POTWIERDZENIA] Rola Tomka = procesor, do wykupu.** Szablon odzwierciedla § 12 i Załącznik 2 (DPA) Umowy Budowy: administrator = Partner, Tomek = podmiot przetwarzający. **Po wykupie** (§ 9 umowy) Tomek przestaje być procesorem, a Partner przejmuje pełną administrację infrastrukturą — wtedy wiersz „Tomasz Niedźwiecki AI" w tabeli odbiorców trzeba usunąć/zmodyfikować. Rozważ dodanie automatycznej noty przy wykupie.
2. **[DO POTWIERDZENIA] Płatności = Stripe (nie TPay).** W aplikacjach Partnerów płatności idą przez **Stripe Connect** (Partner = *merchant of record*), inaczej niż w lejku /aplikacja (TPay). Zostawiłem wyłącznie Stripe. Potwierdź, że żadna aplikacja nie używa TPay/innego operatora — jeśli używa, dopisać jako kolejnego odrębnego administratora.
3. **[DO POTWIERDZENIA] Lista poddostawców = spójna z DPA.** Supabase/Vercel/Resend/AI to „lista rodzajowa" z § D Załącznika 2 umowy. Utrzymać spójność: jeśli fabryka zmieni dostawcę (np. inny hosting maili), zaktualizować i DPA, i ten szablon.
4. **[DO POTWIERDZENIA] Standard fabryki.** Zakres MVP (Załącznik 1 umowy) wymienia „regulamin/polityka prywatności/RODO" jako element każdej budowy. Ten szablon powinien stać się kanonicznym źródłem (analogicznie do `templates/prawne-sklepy/` dla sklepów) — rozważyć umieszczenie w szablonach fabryki TN App i generowanie z placeholderów przy wdrożeniu, zamiast pisać ręcznie per aplikacja.
5. **[DO POTWIERDZENIA] Regulamin aplikacji Partnera.** Ten dokument to sama polityka prywatności. Każda aplikacja potrzebuje też **regulaminu** (usług elektronicznych, prawa konsumenta użytkowników Partnera) — to osobny szablon, tu nieobjęty. Zasygnalizować, czy przygotować analogiczny wzór regulaminu.
