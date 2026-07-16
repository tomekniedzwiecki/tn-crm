# LANDING-KONCEPT — dobrywstep.pl (zarządzający/Fable, 2026-07-16)

> Spec WIĄŻĄCY dla kroku `landing` (budowa 1:1). Źródła: zrodla/landing-research-topowe.md
> (rzemiosło, zmierzone) + zrodla/landing-research-nisza.md (język, 15 punktów) + 04-STYLEGUIDE
> (tokeny, @ds*). Ton: papierowy briefing premium; ZAKAZ AI-poetic/purple prose; zero żargonu.
> Ceny FINALNE z kroku pricing. Kopia do brief/ przy budowie.

## HERO (sekcja 1)
- Eyebrow (pill oliwkowy): „OSOBISTY TRENER ROZMÓW BIZNESOWYCH — PO POLSKU"
- **H1 (szeryf, 64-72px, ls −0.02em, 6 słów):** „Wejdź w rozmowę przygotowany, nie spięty"
- Sub (2 krótkie linie): „Research firmy i rozmówcy, plan rozmowy i trening z AI." /
  „Zanim wejdziesz na spotkanie naprawdę."
- 2 CTA: primary terakota „Zacznij przygotowanie" (→ rejestracja/trial) + secondary
  „Zobacz przykładowy plan" (→ scroll do sekcji PRÓBKA — dowód-dokument).
- Micro-copy pod CTA (kłódka): „Prywatnie i bez oceniania. Treść treningu znika po raporcie."

## POKAZ PRODUKTU W RUCHU (hero, pod/obok CTA)
Karta briefingu „składająca się" sekwencyjnie (DOM+CSS, easeOutExpo .16,1,.3,1, fazy po ~600ms,
sterowane IntersectionObserver + timeline; ZERO wideo/bibliotek):
F1 formularz (firma „Kowalski Meble", rozmówca „Anna Kowalska, Dyrektor Marketingu", cel) →
F2 fakty wskakują z etykietami (potwierdzone/wniosek AI) → F3 plan 4 filary (numerowane kółka) →
F4 pierścień gotowości count-up 0→70% → F5 dymki czatu symulacji (2 wymiany) → F6 stempel
raportu „7,4 / 10". **reduced-motion:** statyczny kolaż finalnego stanu (wszystkie fazy widoczne).
Treść w mockupie = REALNA (z prawdziwego przebiegu, zanonimizowana) — lekcja Granoli.

## NARRACJA SEKCJI (jedna myśl/sekcję; oddechy 112-160px; szpalta 660px; sekcje 900-1200px)
2. **Pytania-lęki** (wzór Livespace, 5 kart): „Ważna rozmowa jutro, a plan masz w głowie — czyli
   nigdzie?" · „Wchodzisz do klienta, o którym wiesz tyle, co z jego stopki mailowej?" ·
   „Obiekcję cenową słyszysz dziesiąty raz — i dziesiąty raz improwizujesz?" · „Po spotkaniu
   wiesz, co POSZŁO źle, ale nie wiesz, jak to zmienić?" · „ChatGPT odpowiada — ale nie
   przećwiczy z Tobą rozmowy?"
3. **Jak działa (4 kroki pętli, numerowane filary):** 1 Opisz spotkanie (2 min) → 2 Dostań
   research i zatwierdź fakty (AI sprawdza firmę i rozmówcę; Ty decydujesz, co pewne) →
   3 Przejrzyj plan i gotowość % → 4 Przećwicz z AI grającym Twojego rozmówcę i dostań ocenę
   1–10. Pod spodem pasek: „Od rejestracji do gotowego planu: niecałe 2 minuty" (zmierzone 47-61 s
   — komunikujemy ostrożnie „niecałe 2 minuty").
4. **PRÓBKA (dowód #1):** dwie karty side-by-side: fragment REALNEGO planu (otwarcie + 2 pytania
   + para obiekcja→reakcja, kursywa szeryfowa) + fragment REALNEGO raportu (wynik, 2 subscores,
   1 wniosek trenera). Podpis: „Prawdziwy plan i raport z aplikacji — zanonimizowane." CTA
   secondary „Przygotuj własny plan".
5. **Dlaczego nie po prostu ChatGPT?** (obiekcja #1 wprost, 4 wiersze porównania): ChatGPT
   odpowie na pytanie — nie zrobi za Ciebie researchu TEJ firmy w gotowy plan · nie zada Ci
   trudnych pytań i nie wymusi próby domknięcia · nie oceni Cię wg stałych kryteriów i nie
   pokaże postępu · wymaga promptowania — tu wpisujesz firmę i klikasz. Zamknięcie: „Taniej
   niż ChatGPT Plus — i zrobione pod jedno zadanie."
6. **Prywatność (dowód #2, mechanizm konkretnie):** „Treść Twojej rozmowy usuwamy po
   wygenerowaniu raportu — zostaje ocena i wnioski." · „Nie trenujemy AI na Twoich danych." ·
   „Research z publicznych źródeł; Twoje notatki zostają u Ciebie." Ikona kłódki, ton spokojny.
7. **Dla firm (krótko, D12):** „Zespół sprzedaży? Młodzi menedżerowie? Pakiet firmowy na
   fakturę — napisz." (mailto/kontakt; bez osobnego cennika).
8. **CENNIK INLINE (jawny — wzór Claude; rozbraja lęk scam):** karty Solo 79 zł netto/mc
   (759/rok, „10 przygotowań miesięcznie — dla większości aż nadto") i Pro 149 zł netto/mc
   (1429/rok, bez limitu, faktura, priorytet) — Pro badge „Dla profesjonalistów"; trial:
   „14 dni za darmo — pełna wersja". Kotwica pod kartami: „Jeden dzień szkolenia sprzedażowego:
   760–2 490 zł. Rok Dobrego Wstępu: 759 zł." (źródłowane w FAQ).
9. **FAQ (5-6):** Czym różni się od ChatGPT? · Czy będę brzmiał sztucznie? („Nie uczymy formułek —
   wchodzisz przygotowany, więc brzmisz swobodnie") · Co z poufnością danych klienta? · Jak
   działa trial i karta? · Faktura na firmę? · Czy to działa na telefonie?
10. **CTA końcowe:** H2 szeryf „Następna ważna rozmowa? Wejdź przygotowany." + primary CTA.
Stopka: prawne (regulamin/prywatność — krok prawne), kontakt, „Made in Polska" ton spokojny.

## MOTION SYSTEM (jakość, nie gadżety)
- Reveal sekcji: fade + rise 16px, easeOutExpo, 500ms, stagger 80ms; JEDEN easing wszędzie.
- Count-up: gotowość % w mockupie i liczby kotwic (raz, on-view).
- Hover CTA: transform+cień+jasność w jednej tranzycji 160ms (cały-ciałem).
- prefers-reduced-motion: wszystko statyczne (twardy wymóg).
- Zakazy: parallax-dekoracje, particles, tilt, marquee, gradient-anim.

## TWARDE WYMAGANIA BUDOWY
Tokeny/komponenty WYŁĄCZNIE z systemu (tokens.css/@ds*); tło kremowe #F7F3EC (zakaz ciemnych);
SEO wg brief/09 (noindex do startu → zdjąć przy start_live); ceny z API public_prices jeśli
starter eksponuje (inaczej stałe z 05-STRIPE-CONFIG z adnotacją); mobile-first, scrollWidth==vw
na 360/390/414; konsola 0; Lighthouse perf ≥90; bramki verify fabryki. Landing = public/index.html
(zastępuje placeholder „Już wkrótce" DOPIERO w kroku landing — commit z tym konceptem 1:1).
