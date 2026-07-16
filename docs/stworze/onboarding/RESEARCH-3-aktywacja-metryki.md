# Research 3 — Framework aktywacji/aha + metryki (Sonnet 5, 2026-07-16)
> Surowy materiał do syntezy. Źródła z URL w oryginale.

## Aha & aktywacja
- Aha=żarówka (subiektywne poczucie wartości), activation=przełącznik (mierzalne zdarzenie). Aha odkrywane Z DANYCH (korelacja z retencją D30/D90 + eksperyment na KAUZALNOŚĆ), nie z intuicji.
- Metoda: (1) kandydaci z ścieżki, (2) regresja/kohorty — najwcześniejsza akcja rozdzielająca zostających od churnujących, (3) eksperyment. Nowy produkt bez danych: wywiad→ankieta→hipoteza.
- Progi: FB 7 znajomych/10d, Twitter 30 obserwacji, Slack 2000 msg, Dropbox 1 plik, Zapier 1 Zap, e-comm ≥2 zamówienia (retencja ×2), Canva 1 projekt.

## Model 3 momentów (projektuj WSZYSTKIE)
- Setup („co zrobić?") — prerekwizyty, cel 60-75% w 24h. ≠ aktywacja.
- Aha („po co?") — 1. poczucie wartości TA SAMA sesja, cel 50-70% po Setup w 1. tyg.
- Habit („kiedy?") — powtórka rdzenia, cel 30-50% w 28d = najlepszy predyktor retencji.

## TTFV ↔ retencja (twarde)
- top-quartile self-serve single-player TTFV <5 min; z integracją <24h. Top: ≥40% activation, <5min TTV, ≥30% D7.
- wartość ≤14d → retencja 12-mies ≥80%; brak w 30d → 35-50%; brak zaangażowania 3d → ~90% churn.
- mierzenie TTV zamiast completion → +15-25% konwersji trial→paid.

## Benchmarki
- Activation rate B2B SaaS śr ~37,5% / mediana ~36% (60p=dobrze, 80p=świetnie); większość 15-20% (za długi onboarding). PLG 25-40% w 7d.
- Trial→paid mediana 18,5%, top 35-45%, elita 60%+.

## Model onboardingu
- Mikro-SaaS B2B/JDG (operator=właściciel, mało czasu, sceptyk, lęk#1=scam) = SELF-SERVE/product-led. Zero wymuszonego calla. „Pokaż wartość teraz" (TTFV w minutach, wartość PRZED pełną konfiguracją). Każdy krok tłumaczy „po co". Human-touch tylko REAKTYWNIE (mail/SMS przy drop-offie). Zachowuje się jak B2C w formie, B2B w treści.

## Anti-patterns
Vanity metrics (liczenie signupów); zła def aktywacji (nie koreluje z retencją); vanity onboarding (kroki bez wartości; Setup≠aktywacja); instrumentacja przed definicją; artefakty pomiaru (za krótkie okno lejka=fałszywe drop-offy); optymalizacja korelacji bez kauzalności.

## EVENTY (UNIWERSALNE nazwy / PER-PROJEKT wartości)
signed_up (t0), onboarding_started, jtbd_selected (segment), setup_completed (≠aktywacja), onboarding_step_done (step_name/index → lejek+drop-off), activated/aha (próg per-projekt; property time_since_signup=TTFV), habit (N× w oknie), activation_dropoff. Kolejność: DEFINIUJ activated PRZED instrumentacją.

## Panel operatora KPI (jeden dla wszystkich apek)
activation rate (activated/signed_up, okno 7d, target ≥35-40%, <20%=alarm), TTFV mediana+rozkład, setup rate (60-75% 24h), lejek onboardingu z drop-off per krok (podświetl największy), D7 retention, konwersja free→paid, habit rate (30-50% 28d), breakdown per segment/jtbd.

## Protokół aha per projekt
1. „User poczuje wartość gdy ___" (1 zdanie). 2. Rozpisz Setup/Aha/Habit. 3. 3-7 kandydatów. 4. Próg+okno (N akcji/M czasu). 5. Zapis jako event activated w SSOT. 6. Po danych: regresja+eksperyment. 7. Odrzuć „ukończył profil/setup" jeśli nie koreluje.

## 10 zasad aktywacji
1. aha z danych+kauzalność. 2. definiuj przed instrumentacją. 3. wszystkie 3 momenty. 4. TTFV w minutach, wartość przed konfiguracją. 5. progressive disclosure (1. sesja=tylko droga do aha). 6. segmentuj JTBD na wejściu. 7. mikro-SaaS=self-serve, human-touch reaktywnie, każdy krok „po co". 8. zero vanity. 9. optymalizuj krok o największym drop-offie najbliżej wartości. 10. iteruj lejek w pętli.
