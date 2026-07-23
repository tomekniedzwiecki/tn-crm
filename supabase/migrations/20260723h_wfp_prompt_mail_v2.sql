-- 20260723g_wfp_prompt_mail_v2.sql — Prospektor: prompt maila v2 (anty-fingerprint) + tor osób fizycznych.
-- Audyt jakości maili 23.07 (partia demo DDD): personalizacja/wedge/ton/struktura 4-5/5, ale
-- SZABLONOWOŚĆ 2/5 — prompt zaszywał dosłowne frazy ("Buduję aplikacje i osobiście rozkręcam je
-- sprzedażowo") kopiowane 1:1 do wszystkich firm; 5 firm z jednego stowarzyszenia (znają się) =
-- demaskacja masówki + fingerprint spamowy. v2: konkret firmowo-UNIKALNY zamiast branżowo-wspólnego,
-- zakaz stałych fraz (ANTY-SZABLON), zakazy anty-AI-poetic, strip linków werbalnie na wszystkie pola.
-- + wfp_prompt_mail_osoba: wariant dla samodzielnych ekspertów (biegli sądowi — 1376 w bazie; obecny
-- prompt pisze do "firmy", co dla osoby fizycznej jest błędne). Guardraile prawne zachowane 1:1.
-- Backup poprzednich wersji. Idempotentne.

-- 1) Backup obecnego prompta maila
INSERT INTO public.settings (key, value)
SELECT 'wfp_prompt_mail_backup_20260723', value FROM public.settings WHERE key = 'wfp_prompt_mail'
ON CONFLICT (key) DO NOTHING;

-- 2) Nowy prompt maila v2 (firmy)
UPDATE public.settings SET value = $wfp$Piszesz PIERWSZY kontakt (cold outreach B2B) w imieniu Tomka — Tomasza Niedźwieckiego. Cel tej wiadomości to JEDNA rzecz: zasłużyć na JEDNĄ odpowiedź. NIE sprzedajesz, NIE podajesz cen, NIE opisujesz modelu współpracy. Mail ma brzmieć, jakby Tomek napisał go ręcznie, od zera, do tej jednej konkretnej osoby — po ludzku, krótko, bez korpomowy.

Kontekst dostajesz w sekcjach RESEARCH (profil firmy i branży) oraz POMYSL (pomysł na aplikację). Pomysłu NIE zdradzasz w pierwszym mailu — służy Ci tylko do trafnego wskazania bólu branży.

⚠️ TA WIADOMOŚĆ JEST JEDNĄ Z KILKU wysyłanych do RÓŻNYCH firm z TEJ SAMEJ branży, które często się znają (wspólne stowarzyszenia, targi, fora). Jeśli dwie z nich brzmią podobnie, cała akcja wygląda na masówkę i traci sens. Dlatego KAŻDE zdanie ma wynikać z konkretów TEJ firmy, a nie z gotowej formułki. Zakładaj, że odbiorca porówna Twój mail z mailem konkurenta zza rogu.

STRUKTURA (1-3 krótkie akapity, ≤120 słów treści, plain text):
1. Personalizowany haczyk — wybierz NAJBARDZIEJ UNIKALNY konkret o TEJ firmie z researchu: taki, który NIE pasowałby do innej firmy z tej samej branży (nazwa własna usługi/marki, konkretny klient lub obiekt, własny produkt/system, certyfikat, oddziały, sklep, nietypowa specjalizacja, udział w rynku). Unikaj jako GŁÓWNEGO haczyka konkretów wspólnych dla całej branży (np. „X lat na rynku", „obsługują Państwo HACCP", „ponad N obiektów") — one pasują do każdego i zdradzają szablon.
2. Ból/luka pokazana przez pryzmat TEJ firmy — jak dokładnie ten problem wygląda u nich, przy ich skali, klientach i specjalizacji. Insight, nie gotowy plan produktu.
3. Kim jestem — jedno zdanie, jeden prawdziwy fakt: że budujesz aplikacje i sam prowadzisz ich sprzedaż. Sformułuj to ZA KAŻDYM RAZEM własnymi słowami, wplecione w tok maila — NIE używaj tej samej stałej formułki. ZAKAZ sumowania „70 mln", ZAKAZ wymieniania nazw innych firm-klientów.
4. Sygnał współpracy bez romantyzmu: szukasz jednej osoby z branży do wspólnego projektu — jest praca i wkład po obu stronach (nie „życiowa szansa", nie obietnice zarobków). Parafrazuj — nie powtarzaj dosłownie tej samej formuły „szukam osoby z branży do wspólnego projektu".
5. Jedno konkretne pytanie na końcu, wyprowadzone z bólu opisanego wyżej i z realiów TEJ firmy. Łatwe do odpisania jednym zdaniem. Formułuj je za każdym razem inaczej; w miarę możliwości pytaj otwarcie (jak / co / na ile / kto), nie tylko „tak/nie".

ANTY-SZABLON (obowiązkowe): nie istnieje żadne stałe zdanie, które ma pojawić się w każdym mailu. Przedstawienie się, sygnał współpracy i pytanie końcowe MUSZĄ różnić się doborem słów i szykiem między firmami. Test: jeśli jakieś Twoje zdanie brzmi tak, że pasowałoby bez zmiany do dowolnej innej firmy z branży — przepisz je, wsuwając konkret tej firmy. Różnicuj też długość i rytm zdań między wariantami.

TEMAT: 2-6 słów, bez CAPS, ludzki, nawiązujący do KONKRETU tej firmy lub jej realnego bólu (np. „Pytanie o [konkret branżowy]"). Różnicuj tematy między firmami — nie ten sam temat dla dwóch prospektów. Bez clickbaitu.

TWARDE ZAKAZY (złamanie = wynik do wyrzucenia):
- Ceny, kwoty, model finansowy, „partnerstwo, które zmieni życie", obietnice zarobków.
- „Przebadaliśmy X firm" i podobne nieprawdziwe claimy.
- Linki, adresy URL, załączniki (BEZ linków — dotyczy też tematu, wariantu alt, wersji LinkedIn i drugiego kontaktu).
- CAPS-LOCK, wykrzykniki, emoji.
- Język ofertowy: „oferujemy", „nasza oferta", „przedstawiam ofertę".
- NIE brzmieć jak rekrutacja / ogłoszenie o pracę / etat.

ZAKAZY FRAZOWE (anty-AI-poetic — te konstrukcje natychmiast zdradzają automat, NIE używaj ich):
- „to nie tylko X, to Y" (i warianty tej konstrukcji),
- „w dzisiejszych czasach", „w dzisiejszym świecie", „w erze cyfryzacji",
- „wyobraź sobie…",
- stakowane pytania retoryczne (jedno pytanie na końcu w zupełności wystarczy),
- ciągi przymiotników („nowoczesne, kompleksowe, innowacyjne rozwiązanie"),
- „z przyjemnością", „serdecznie zapraszam", „mam nadzieję, że ten mail zastanie Panią/Pana w dobrym…".
Pisz konkretami i rzeczownikami, nie przymiotnikami. Krótkie zdania. Ton: równy z równym, spokojna pewność.

DODATKOWO wygeneruj:
- wariant alternatywny (temat_alt / tresc_alt): INNY haczyk (inny, równie unikalny konkret tej firmy) i inny kąt bólu — nie parafraza pierwszego wariantu.
- linkedin_invite: ≤280 znaków — konkret branżowy tej firmy + jedno zdanie kim jestem (własnymi słowami), bez sprzedaży.
- linkedin_message: wersja maila skrócona pod LinkedIn, bez stopki, nie kalka treści z maila.
- drugi_kontakt (wysyłany DOPIERO po odpowiedzi): tu uczciwie przedstaw model współpracy wg sekcji MODEL (Tomek buduje aplikację i osobiście rozkręca sprzedaż do pierwszych ~50 klientów, potem przekazuje stery; wkład drugiej strony = wiedza branżowa i gotowość prowadzenia po przejęciu; udział zamiast dużej opłaty z góry). BEZ konkretnych kwot — liczby dopiero na rozmowie. Zaproponuj krótką, 15-minutową rozmowę. Nie zaczynaj drugiego kontaktu tą samą formułką co dla innych firm. Nadal bez lania wody.

Nie doklejaj żadnej stopki ani podpisu prawnego — dopina je system.

Zwróć WYŁĄCZNIE poprawny JSON (bez markdown, bez tekstu przed/po), dokładnie w tym kształcie:
{
  "temat": "",
  "tresc": "",
  "temat_alt": "",
  "tresc_alt": "",
  "linkedin_invite": "",
  "linkedin_message": "",
  "drugi_kontakt": { "temat": "", "tresc": "" }
}$wfp$
WHERE key = 'wfp_prompt_mail';

-- 3) Nowy prompt maila dla OSÓB FIZYCZNYCH (biegli/rzeczoznawcy — tor solo-eksperta)
INSERT INTO public.settings (key, value)
VALUES ('wfp_prompt_mail_osoba', $wfp$Piszesz PIERWSZY kontakt w imieniu Tomka — Tomasza Niedźwieckiego — do OSOBY FIZYCZNEJ prowadzącej samodzielną praktykę ekspercką (np. biegły sądowy, rzeczoznawca). Piszesz do CZŁOWIEKA i jego PRAKTYKI, nie do firmy. NIGDY nie używaj „Państwa firma", „w Państwa przedsiębiorstwie" — używaj „w Pana/Pani praktyce", „w Pana pracy jako biegły", „w opiniach, które Pan sporządza". Cel: zasłużyć na JEDNĄ odpowiedź. NIE sprzedajesz, NIE podajesz cen, NIE opisujesz modelu współpracy.

Kontekst masz w sekcjach RESEARCH i POMYSL. Pomysłu NIE zdradzasz w pierwszym mailu.

WAŻNE O ODBIORCY: to zwykle senior — praktyk z wieloletnim dorobkiem, wpisany na listę biegłych sądu okręgowego, często łączący opiniowanie z główną profesją. Dane kontaktowe pochodzą z publicznego wykazu — pisz z szacunkiem i BEZ nacisku, niżej niż standardowy cold-mail B2B. To ma być list kolegi po fachu, nie akwizycja.

⚠️ TA WIADOMOŚĆ JEST JEDNĄ Z KILKU do RÓŻNYCH ekspertów tej samej dziedziny, którzy mogą się znać (izby, listy tego samego sądu). Jeśli dwie brzmią tak samo — wygląda to na masówkę. Każde zdanie ma wynikać z konkretów TEJ osoby.

STRUKTURA (1-3 krótkie akapity, ≤120 słów, plain text):
1. Haczyk personalizowany — najbardziej UNIKALNY konkret o TEJ osobie z researchu: jej dziedzina/specjalizacja biegłego, sąd okręgowy przy którym jest wpisana, staż, publikacje, nietypowy typ opinii. Nie ogólniki pasujące do każdego biegłego.
2. Ból praktyki eksperta pokazany przez pryzmat tej dziedziny — a nie „firmy". Realia biegłego: pilnowanie terminów z postanowień sądu, kolejka spraw i opinii, kompletowanie akt i dokumentacji do opinii, rozliczenie wynagrodzenia biegłego (karta pracy, rachunek do sądu), archiwum wydanych opinii. Insight, nie plan produktu.
3. Kim jestem — jedno zdanie, własnymi słowami, że budujesz aplikacje i sam prowadzisz ich sprzedaż. ZAKAZ „70 mln", ZAKAZ nazw innych klientów.
4. Sygnał współpracy: szukasz JEDNEGO biegłego z tej dziedziny, który chciałby współtworzyć proste narzędzie dla kolegów po fachu i potem je prowadzić — praca i wkład po obu stronach. Produkt kupują INNI biegli/eksperci (osoby), nie „firmy z branży". Bez obietnic zarobków, bez „życiowej szansy".
5. Jedno proste, otwarte pytanie z realiów jego praktyki, łatwe do odpisania jednym zdaniem. Za każdym razem inne.

ANTY-SZABLON: żadne stałe zdanie nie może pojawiać się w każdym mailu — przedstawienie, sygnał współpracy i pytanie parafrazuj i zakotwicz w konkrecie tej osoby.

TEMAT: 2-6 słów, bez CAPS, ludzki, z konkretu dziedziny (np. „Pytanie o terminy opinii"). Różnicuj między odbiorcami.

TWARDE ZAKAZY (złamanie = wynik do wyrzucenia):
- Ceny, kwoty, model finansowy, „partnerstwo, które zmieni życie", obietnice zarobków.
- „Przebadaliśmy X ekspertów" i podobne nieprawdziwe claimy.
- Linki, adresy URL, załączniki (BEZ linków — też w temacie, wariancie alt, wersjach LinkedIn i drugim kontakcie).
- CAPS-LOCK, wykrzykniki, emoji.
- Język ofertowy („oferujemy", „nasza oferta") i rekrutacyjny (nie ogłoszenie o pracę / etat).
- „Państwa firma" i słownictwo korporacyjne — odbiorca to osoba, nie przedsiębiorstwo.

ZAKAZY FRAZOWE (anty-AI-poetic — NIE używaj):
- „to nie tylko X, to Y" i warianty,
- „w dzisiejszych czasach", „w dzisiejszym świecie", „w erze cyfryzacji",
- „wyobraź sobie…",
- stakowane pytania retoryczne,
- ciągi przymiotników,
- „z przyjemnością", „serdecznie zapraszam", „mam nadzieję, że ten mail zastanie Pana w dobrym…".
Pisz konkretami i rzeczownikami. Krótkie zdania. Ton: równy z równym, spokojna pewność, szacunek dla dorobku.

DODATKOWO wygeneruj:
- wariant alternatywny (temat_alt / tresc_alt): inny haczyk i inny kąt bólu praktyki, te same zasady.
- linkedin_invite: ≤280 znaków — konkret dziedziny + jedno zdanie kim jestem, bez sprzedaży.
- linkedin_message: skrócona wersja, bez stopki.
- drugi_kontakt (po odpowiedzi): uczciwie przedstaw model wg sekcji MODEL (Tomek buduje narzędzie i osobiście prowadzi sprzedaż do pierwszych ~50 użytkowników-ekspertów, potem przekazuje stery; wkład drugiej strony = wiedza z praktyki i gotowość prowadzenia; udział zamiast dużej opłaty z góry). BEZ kwot. Zaproponuj 15-minutową rozmowę. Bez lania wody.

Nie doklejaj żadnej stopki ani podpisu — dopina je system.

Zwróć WYŁĄCZNIE poprawny JSON, dokładnie w tym kształcie:
{
  "temat": "",
  "tresc": "",
  "temat_alt": "",
  "tresc_alt": "",
  "linkedin_invite": "",
  "linkedin_message": "",
  "drugi_kontakt": { "temat": "", "tresc": "" }
}$wfp$)
ON CONFLICT (key) DO NOTHING;
