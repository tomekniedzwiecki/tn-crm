# LANDING-KONCEPT — Majster Blisko (nazwa robocza: {{APP_NAME}})

Spec WIĄŻĄCY dla budowniczego (krok `landing`). Autor: zarządzający (sesja 22.07.2026).
Wejście: LANDING-RESEARCH.md (pomiary + wzorce), 01-MVP-SCOPE.md, PRICING-FINAL.md,
04-STYLEGUIDE-draft.md (tokeny), 09-SEO-draft.md. Placeholdery {{APP_NAME}}/{{MIASTO}}/{{DOMAIN}}
podstawić po kroku `nazwa` i danych operatora (B-01).

## 0. Architektura (decyzja z researchu §2)

**DWIE strony, każda sprzedaje JEDNĄ personę** (doktryna „Dwie persony — NIE miksować"):
- **`/` (root)** — dominanta KLIENTA (0 zł, masowy ruch z reklam do miasta) + wyraźne DRZWI fachowca
  w hero i dedykowana sekcja-drzwi niżej. Root NIE pokazuje cennika (klient nie płaci).
- **`/dla-fachowca`** — pełny landing SPRZEDAŻOWY płacącej persony: własny hero, dowody, jawny
  cennik 99/149, gwarancja startowa, founding −50%, darmowy podgląd zleceń jako furtka.
  Reklamy do fachowców kierować PROSTO tu.
- Bez toggle. Nawigacja root: logo · „Dla fachowców" · „Zaloguj się" · CTA „Dodaj zlecenie".

## 1. HERO-IMPULS

### Root (klient)
- **Nagłówek (wybrany):** „Popsuło się? Majster jest blisko." (4 słowa + interiekcja; ból→rozwiązanie,
  senior-czytelny, „blisko" = rdzeń USP). Typografia: 64px desktop / 40px mobile, waga 650,
  tracking −0.02em, line-height 1.02 (Archivo).
- **Subline:** „Opisz usterkę i dodaj zdjęcie — w kilka minut dostajesz oferty od fachowców
  z Twojego powiatu. Publikacja zlecenia jest darmowa." (18–20px, max ~60 znaków/linia).
- **DOKŁADNIE 2 CTA:** primary solid pomarańcz „Dodaj zlecenie za darmo" (→ rejestracja/kreator;
  min-height 56px — senior) + secondary ghost z obrysem „Jestem fachowcem →" (→ /dla-fachowca).
- **Mikro-trust pod CTA:** „0 zł za zlecenie · Twój numer widzi dopiero wybrany fachowiec".
- **Hero ≤100dvh na 360/390/768/1280** (asercja w weryfikacji budowy).

### /dla-fachowca
- **Nagłówek:** „Zlecenia z okolicy. Bez prowizji." (5 słów; hak anty-pay-per-lead).
- **Subline:** „U innych jedno wygrane zlecenie to ~100 zł za same kontakty. U nas cały miesiąc
  lokalnych zleceń kosztuje 99 zł — a pierwszy miesiąc bez zleceń w Twojej okolicy zwracamy."
- **2 CTA:** primary „Zobacz zlecenia w Twojej okolicy" (→ rejestracja fachowca → darmowy skrócony
  podgląd = DOWÓD-ARTEFAKT zamiast PDF; to nasz odpowiednik „dowodu-dokumentu") + secondary ghost
  „Zobacz cennik" (anchor #cennik).
- **Mikro-trust:** „2 powiaty w cenie · bez opłat za kontakt · gwarancja pierwszego miesiąca".

## 2. POKAZ PRODUKTU W RUCHU (root, w hero obok/pod tekstem)

Żywy DOM z komponentów design-systemu (04-STYLEGUIDE), **STAŁA wysokość kadru** — fazy podmieniają
się W MIEJSCU (crossfade+slide 12px, kropki postępu pod kadrem), NIGDY stack w dół. Kadr = ramka
telefonu (kremowa karta #FFFDF7, obrys, offsetowy cień, radius 12).

Sekwencja (pętla ~16 s, pauza 1,2 s między fazami; fazy stemplowane `data-phase`):
1. **Faza 1 „Zgłoszenie" (4 s):** formularz kreatora — wpada zdjęcie cieknącego syfonu (fade 0.4s),
   kategoria „Hydraulika" zaznacza się, chip terminu „Dziś" klika się; przycisk „Opublikuj bezpłatnie".
2. **Faza 2 „Widzą lokalni" (4 s):** karta zlecenia pojawia się na liście fachowca (papierowy
   znacznik kategorii, dzielnica, „1,8 km", termin); pasek liczb pulpitu tyka count-upem:
   „7 nowych zleceń · 3 do 5 km · 2 na dziś" (count-up 0.6s, tabular nums).
3. **Faza 3 „Oferty wracają" (4 s):** do zlecenia wpadają kolejno 2 oferty (stagger 300 ms):
   widełki „150–250 zł", termin „jutro 9:00", badge „Faktura: tak".
4. **Faza 4 — KULMINACJA (4 s):** widok klienta „3 oferty do wyboru" + klik „Wybierz" na
   najlepszej → zielony chip „Wybrano wykonawcę" + odsłonięcie telefonu (blur→sharp 0.3s).
   Elementy kulminacji BEZ kolizji, bounding-box w widocznym obszarze na 390 i 1280.
- **prefers-reduced-motion:** statyczny kadr fazy 4 (kulminacja — klient z 3 ofertami), zero animacji,
  kropki postępu ukryte.

## 3. NARRACJA SEKCJI — root (jedna myśl / sekcję) + rytm tonalny

1. **HERO** (piaskowe tło #F3EFE5) — jw.
2. **Pasek dowodu-mechaniki** (zaraz pod hero, wzorzec logo-strip; my bez logotypów):
   3 fakty ikonowe: „0 zł za zlecenie" · „Numer chroniony do wyboru" · „Oceny od sąsiadów". Jedna linia.
3. **Ból → transformacja** — „Koniec obdzwaniania i grup na Facebooku": 2 kolumny przed/po,
   ton spokojny. (Myśl: nie szukasz — fachowcy przychodzą do Ciebie.)
4. **Jak to działa — 3 kroki** (numerowane karty: Opisz i dodaj zdjęcie → Porównaj oferty →
   Wybierz i oceń). Kroki = komponenty kreatora, nie stock. (Myśl: prościej niż telefon.)
5. **⬛ UDERZENIE TONALNE 1 — kraft/papier:** „Do czego ludzie nas wołają" — siatka papierowych
   znaczników z przykładami drobnych prac (cieknący kran, gniazdko, złożenie szafy, listwy,
   malowanie, rynny…). Tekstura papieru z warsztatu (sygnatura marki). (Myśl: to TE prace.)
6. **Ochrona i zaufanie** — sekcja mechaniki: ochrona numeru, podsumowanie ustaleń zatwierdzane
   przez obie strony, oceny dwustronne, badge Firma/Prywatny + faktura. (Myśl: bezpiecznie i uczciwie.)
7. **Drzwi fachowca** (kremowa karta na całą szerokość): „Jesteś fachowcem? Świeże zlecenia
   z Twojego powiatu czekają" + 1 CTA → /dla-fachowca. (Jedyne miejsce o fachowcu poza hero.)
8. **FAQ** (5–7 pytań: ile kosztuje [0 zł], kto widzi mój numer, co jeśli fachowiec nie przyjdzie,
   czy mogę prosić o fakturę, jakie prace, {{MIASTO}}-zakres).
9. **⬛ UDERZENIE TONALNE 2 — pomarańczowy finał** (#F05A28, biały tekst ≥24px bold — kontrast
   3.39 wystarcza dla dużego tekstu): „Popsuło się? Zgłoś teraz." + primary CTA (biały przycisk).
Stopka: kontakt operatora, regulamin/prywatność, „Dla fachowców".

### /dla-fachowca (osobna oś)
1. HERO (jw.) → 2. Pasek: „2 powiaty w cenie · bez prowizji · zwrot za 1. miesiąc bez zleceń" →
3. Jak zarabiasz (3 kroki: Ustaw obszar → Odpowiadaj ofertą → Realizuj i zbieraj oceny) →
4. **Darmowy podgląd jako furtka**: „Sprawdź, ile zleceń jest teraz u Ciebie" (CTA → rejestracja;
   myśl: zobacz towar zanim zapłacisz) → 5. Liczby-przeliczniki wartości (count-up: „~100 zł —
   tyle kosztuje jedno zlecenie u konkurencji" vs „99 zł/mc — u nas cały miesiąc"; „zwraca się
   z 1 zlecenia w miesiącu") → 6. **⬛ CENNIK** (#cennik, wzorzec Booksy): dwie karty
   [Fachowiec 99 zł/mc | Firma 149 zł/mc], w każdej: 2 powiaty · wszystkie funkcje · bez prowizji ·
   bez opłat za kontakt; przełącznik mies./rok = „2 miesiące gratis przy płatności rocznej";
   dodatki drobnie pod kartami (+39 pracownik · +19 powiat); **plakietka gwarancji na karcie**:
   „1. miesiąc bez zleceń w Twojej okolicy? Zwracamy."; baner founding: „Pierwsi fachowcy
   w {{MIASTO}}: −50% przez 3 miesiące". CENY WYŁĄCZNIE Z API (public_prices; fallback bez kwot) →
7. FAQ fachowca (jak liczą się powiaty, zmiana powiatów, firma i pracownicy, SEP/uprawnienia,
   rezygnacje i wskaźnik) → 8. Pomarańczowy finał + CTA.

## 4. MOTION SYSTEM (wartości; jakość, nie gadżety)

- **Hover (mikro):** 0.12s ease; karty: translateY(−2px) + cień offsetowy rośnie o 2px;
  przyciski: przyciemnienie do --color-accent-hover.
- **Reveal sekcji:** fade-up 16px, 0.45s ease-out, stagger 70 ms w gridach, `once: true`
  (IntersectionObserver; próg 0.2). Nagłówki sekcji BEZ animacji (senior — treść stoi).
- **Count-up:** liczby pulpitu w mocku i przeliczniki na /dla-fachowca — 0.6s, tabular nums,
  odpala raz przy wejściu w viewport.
- **JEDEN ambient (DNA marki):** papierowy znacznik w hero kołysze się subtelnie
  (rotate −1°…+1°, 6 s ease-in-out, infinite) — wolny, nierozpraszający (reguła seniora).
  ŻADNYCH innych elementów ciągle ruchomych.
- **Sekwencja produktu:** wg §2 (crossfade 0.4s + slide 12px).
- **prefers-reduced-motion:** komplet — zero transition/animation, sekwencja = statyczny kadr
  kulminacji, count-up = wartości końcowe od razu.

## 5. Twarde zasady budowy

- Tokeny WYŁĄCZNIE z 04-STYLEGUIDE (base.css :root); zero kolorów ad hoc; zieleń #2F7D57 tylko
  statusy pozytywne (chip „Wybrano wykonawcę"), nie dekoracja.
- Hero-mock = żywy DOM z komponentów design-systemu (karta zlecenia, chipy, pasek liczb) —
  NIE obrazek/wideo/gif; retina-czyste.
- Ceny WYŁĄCZNIE z API (public_prices) — zero hardkodu kwot w HTML; fallback: karta bez kwoty.
- Zero stocków, zero AI-grafik, zero bibliotek JS/CSS (vanilla + IntersectionObserver).
- Senior: body 18px (root), touch ≥48px, kontrast wg tabeli WCAG z 04 (drobny tekst na piaskowym
  tle tylko grafit albo warianty *-text), język bez anglicyzmów na ścieżce klienta.
- Zakazy copy: ZERO „24h", zero obietnic czasu reakcji/wolumenu zleceń (płynność nieznana),
  zero zmyślonych liczb i opinii (dowody = mechanika, §4 researchu); zero „pobranie/raty".
- Mobile 390: sticky CTA po przescrollowaniu hero (root: „Dodaj zlecenie za darmo"), menu wg
  kanonu, zero poziomego scrolla, marginesy boczne ≥20px.
- OG-cover z tokenów (piaskowe tło + znacznik + tagline), SEO z 09-SEO-draft.
- `?ref` capture i markery suity E2E nienaruszone (standard startera).

## 6. Otwarte do podstawienia przed budową

- {{APP_NAME}}, {{DOMAIN}} — po kroku `nazwa` (bramka Tomka).
- {{MIASTO}} — po B-01 (dane_operatora). Do tego czasu build może iść z „w Twojej okolicy"
  wszędzie tam, gdzie miałoby stać miasto (copy degraduje się bezpiecznie).
- Liczba „~100 zł u konkurencji" = z PRICING-RESEARCH-A (kotwica); przy budowie sekcji
  przeliczników nie podawać nazw konkurentów wprost na landingu (bez wywoływania Fixly/Oferteo
  z nazwy — „u konkurencji"/„w serwisach za kontakt").
