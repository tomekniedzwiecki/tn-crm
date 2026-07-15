# 02-SPEC-FUNKCJONALNY — Dobry Wstęp (DRAFT sesji fabryki, 2026-07-15)

> Draft do paczki `brief/02-SPEC-FUNKCJONALNY.md` (przejdzie tam po zatwierdzeniu MVP przez Tomka).
> Źródła: HANDOFF-PACK.md + 94 itemy bazy wiedzy + analiza makiet + DECYZJE.md (D1–D14).
> Zakłada rozstrzygnięcia rekomendowane (D1 tekst, D12 bez kont firmowych).

## 0. Decyzje techniczne rdzenia (WPROST)
- **AI:** OpenAI API. Env: `AI_MODEL_RESEARCH` (default gpt-5.5 + web_search, wzorzec spar-assess
  z tn-crm), `AI_MODEL_PLAN` i `AI_MODEL_SIM` (default gpt-5.1). Prompty systemowe w
  `app_settings` (edytowalne bez deployu — wzorzec bud-chat: prompt w settings, NIE w md).
- **Edge functions niszy:** `prep-research` (crawl WWW + web search → fakty z etykietami),
  `prep-plan` (plan + lista braków; gotowość liczona OSOBNO serwerowo), `prep-sim` (czat symulacji,
  turn-by-turn), `prep-report` (ocena wg wag + raport + anonimizacja cytatów), `prep-retention`
  (cron: kasowanie transkryptów opt-in po 90 dniach). Wszystkie: rate-limit startera, walidacja
  wejścia, koszty AI logowane do `app_events`.
- **Gotowość % = funkcja DETERMINISTYCZNA (SQL/TS), nie AI:** 40% podstawy (firma≥1 fakt
  zatwierdzony, rola rozmówcy, cel, następny krok — po 10%) + 30% pogłębienie (problem 10%,
  wartość 10%, obiekcje 10% — sekcje planu z ≥1 pozycją zatwierdzoną/wygenerowaną) + 30% trening
  (ukończona ≥1 symulacja: trening 15% / egzamin 30%). Zawsze z listą braków (czego brakuje do 100).
- **Ocena egzaminu = AI wg sztywnej rubryki** (prompt z wagami 40/25/20/15 + zasady z bazy wiedzy:
  premiuj parafrazę/pytanie przed odpowiedzią; karz formułki/tłumaczenie się/odpowiedź bez
  zrozumienia; długość wypowiedzi tylko pomocniczo). Wynik 1–10 + subscores.
- **Wymuszone domknięcie:** egzaminu nie można zakończyć przyciskiem, dopóki user nie podejmie
  próby domknięcia (detekcja: AI flaguje `close_attempt` w każdej turze; przycisk „Zakończ"
  aktywuje się po fladze albo prowadzi przez „spróbuj domknąć teraz").
- **Prywatność (D10):** po wygenerowaniu raportu `prep_sim_messages.content` jest czyszczone
  (UPDATE content=''), chyba że user włączył opt-in per przygotowanie; opt-in = retencja 90 dni
  (cron). Cytaty w raporcie anonimizowane przez AI na etapie raportu.
- **Limity planów:** Solo = N przygotowań/mc (env `PLAN_SOLO_PREP_LIMIT`, wg pricingu), licznik
  = COUNT(preparations WHERE created_at w bieżącym okresie); egzekwowane w `prep-research`
  (moment tworzenia researchu), komunikat z CTA upgrade.
- **AHA_EVENT:** `plan_generated` (pierwszy plan) → `activated_at`; event `report_generated`
  = zdrowie tygodnia 1 (lifecycle-maile startera).

## 1. Ekrany (user)
1. **Pulpit** — najbliższe spotkanie (tytuł, termin, licznik czasu), gotowość % (pierścień),
   ocena ostatniego egzaminu, CTA „Nowe przygotowanie", lista nadchodzących przygotowań
   (wzorzec makiety panel.png: karta = tytuł + czas|firma|osoba + CTA „Przygotuj się").
2. **Nowe przygotowanie (formularz)** — firma (nazwa + WWW), rozmówca (imię, rola, opcjonalna
   wklejka „co o nim wiem"), termin, kontekst spotkania (select: rozmowa z klientem / networking /
   rekrutacja / spotkanie firmowe / inne — jeden formularz, bez osobnych modułów), CEL,
   OCZEKIWANY NASTĘPNY KROK (co/kto/do kiedy), Plan B (opcjonalny). Naturalny język pól (D9).
3. **Research i fakty** — sekcje: Firma / Rozmówca / Rynek i sytuacja; każdy fakt = treść +
   etykieta (potwierdzone / wniosek AI / do sprawdzenia) + źródło + akcje: zatwierdź / edytuj /
   usuń / „Nie wiem — zapytaj klienta" (→ pytanie w planie). Dodaj własny fakt (wklejka).
   Pasek postępu kryteriów obowiązkowych. CTA „Generuj plan" (zablokowane do zatwierdzenia
   kompletu obowiązkowego).
4. **Plan rozmowy** — sekcje: Otwarcie · Pytania odkrywające · Prawdopodobny problem klienta +
   wartość Twojej propozycji · Obiekcje i reakcje (pary) · Do ustalenia w rozmowie (z „zapytaj
   klienta") · Follow-up/następny krok. Interakcje per pozycja: przeczytane / najważniejsze /
   ulubione / kopiuj (wzorzec makiet: keep/discard + etykiety tonu). Obok: **panel gotowości**
   (pierścień % + lista braków). CTA „Przećwicz rozmowę" (trening/egzamin).
5. **Symulacja (czat)** — nagłówek: tryb (TRENING/EGZAMIN), persona (Anna Kowalska, Dyrektor
   Marketingu / „neutralny klient" z wyraźnym komunikatem), poziom trudności (auto z historii,
   zmiana przed startem). TRENING: plan w bocznym panelu + przycisk „podpowiedź trenera".
   EGZAMIN: bez planu, bez podpowiedzi. Zakończenie wymaga próby domknięcia (D7).
6. **Raport** — wynik 1–10 (duża liczba), subscores (cel 40 / pytania 25 / obiekcje 20 /
   pewność 15), wnioski trenera, krótkie cytaty, wynik domknięcia (sukces / częściowy — mniejszy
   krok / brak). Po nieudanym domknięciu: wskazówka + CTA „Powtórz końcówkę" (1×) → obie próby
   obok siebie. Stopka prywatności: „treść rozmowy została usunięta / zachowana do [data]".
7. **Historia** — lista przygotowań (status, gotowość, wynik egzaminu, data), prosty trend ocen,
   wejście w archiwalne raporty.
8. **Konto** — profil (imię, rola, opis własnej oferty → kontekst planów), subskrypcja/billing
   (portal Stripe startera), polecenia (moduł startera), zgody/RODO (starter).

## 2. Panel operatora (klient = Tomek Jankowiak)
Starter (dashboard MRR/churn, użytkownicy, płatności, rabaty, wiadomości, ustawienia + „Marka"
logo/favicon) + nisza: kolumny „przygotowania (mc)" i „egzaminy (mc)" na liście userów; kafel
„koszt AI (mc)" na dashboardzie (suma z app_events); podgląd promptów systemowych (app_settings)
z edycją; kill-switch AI (`ai_enabled` FAIL-OPEN → komunikat serwisowy w apce).

## 3. Flow user (happy path, TTFV <10 min)
Rejestracja (starter, Confirm OFF) → onboarding 1 pytanie (Twoja rola/oferta — do profilu) →
„Nowe przygotowanie" (2-3 min) → research AI (1-2 min, progress) → przegląd i zatwierdzenie
faktów (2 min) → **PLAN = AHA #1** → (dzień przed spotkaniem) trening → egzamin → raport → po
spotkaniu: historia. Stany puste projektowane od razu (pulpit bez przygotowań = duże CTA + demo).

## 4. User stories (rdzeń — kryteria akceptacji w paczce per sesja)
- Jako user tworzę przygotowanie podając firmę+rozmówcę+cel+następny krok, żeby dostać plan
  konkretnej rozmowy (nie ogólny poradnik).
- Jako user widzę, które informacje są potwierdzone, a które to domysły AI, żeby nie wyjść na
  spotkaniu na nieprzygotowanego.
- Jako user zamieniam niepewny fakt w pytanie do klienta, żeby zabrzmiało to profesjonalnie.
- Jako user ćwiczę rozmowę z AI grającym MOJEGO rozmówcę i muszę spróbować domknąć następny krok.
- Jako user dostaję ocenę 1–10 z konkretnymi cytatami i wnioskami oraz jedną powtórkę końcówki.
- Jako user mam pewność, że treść mojej rozmowy nie jest przechowywana bez mojej zgody.
- Jako operator widzę użytkowników, płatności i koszty AI oraz mogę podmienić logo i prompty.

## 5. Ton produktu
Osobisty trener: konkretny, spokojny, po polsku, ZERO teatralnych bon motów i „ripost-gadżetów"
(twarde ryzyko z bazy wiedzy). Copy UI po ludzku (D9). Design: analiza-makiet.md (jasny motyw,
terakota+oliwka+kość słoniowa, szeryf+grotesk).
