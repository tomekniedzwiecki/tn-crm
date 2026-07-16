# Research 2 — Sekwencje e-mail onboardingu (Sonnet 5, 2026-07-16)
> Surowy materiał do syntezy. Źródła z URL w treści oryginalnej.

## Kluczowe liczby
- Optimum: 4-7 maili / 7-14 dni, każdy 1 cel. Activation rate B2B SaaS śr. 37,5% (top-kwartyl 40%+).
- Welcome: open 50-70% (top serii), click 20-40%; MUSI wyjść w sekundy (opóźnienie −50% open).
- Behawioralne vs kalendarzowe: +30% konwersji, ~4,5× engagement. Triggered CTR 6,76% vs newsletter 2,14%.
- 72h bez zaangażowania = 90% churn → okno nudge KRÓTKIE. Onboardowani konwertują 3× częściej.
- Milestone email: +28% retencja, +42% LTV 12-mies., −25-35% wczesnego churnu.
- Zmęczenie: 69% wypisuje się przez za dużo maili; degradacja ~3-5% open/mail; cel unsub ~0,2%.
- Metryki sukcesu = KLIKI + EVENTY in-product, NIE openy (Apple MPP zawyża).

## Oś czasu ról (uniwersalna)
D0 welcome+1 krok · D1 aha/quick-win (tylko nieaktywowani) · D3 usuwanie blokad · D7 druga wartość (aktywowani) · D14 dowód społeczny/ekspansja.
Realne: Clay 6 (1/6..6/6), ActiveCampaign 7, Asana 5, Typeform 4 (pasek %), Intercom 1, Customer.io 3 behaw.

## PRAWO (PL, 2026) — KRYTYCZNE
- TRANSAKCYJNE (potwierdzenie, faktura, reset, dunning-info, powiadomienia techniczne) = BEZ zgody marketingowej (realizacja umowy).
- MARKETINGOWE/lifecycle (oferta, upgrade, rabat, zachęta) = zgoda RODO + PKE (od 10.11.2024, TAKŻE B2B). Adres imienny=dane osobowe.
- Opt-out w stopce KAŻDEGO marketingowego; sprzeciw art.21 = natychmiastowy. Rozdziel kind transakcyjny od marketingowego.

## SZKIELET SERII FABRYKI (UNIWERSALNE szkielet / PER-PROJEKT treść+aha)
| # | kind | wyzwalacz (aha_event per projekt) | cel | 1 CTA | typ prawny |
|---|---|---|---|---|---|
| 1 | welcome | signup_confirmed→sekundy | „jesteś w środku"+1 krok+oczekiwania | zrób pierwszy krok | transakcyjny |
| 2 | activation_step | welcome+24h AND NOT quick_win | quick win <1 dzień | zobacz quick win | transakcyjny |
| 3 | activation_nudge | signup+48-72h AND NOT aha | nudge wartościowy, usuń blokadę | dokończ aha/pomoc | transakcyjny/graniczny |
| 4 | milestone (LUKA!) | aha_event=true natychmiast | gratulacje+co dalej, nawyk | zrób krok 2 | transakcyjny |
| 5 | feature_education | aha+4d (aktywowani) | druga funkcja | wypróbuj funkcję 2 | marketing (zgoda+unsub) |
| 6 | social_proof | d7-14 aktywowani | dowód/tip/ekspansja | zobacz case/zaproś | marketing |
| 7 | reengagement | N dni idle | winback pod blokadę, potem wycisz | wróć do wartości | marketing |

## Reguły silnika (uniwersalne)
1. Każdy mail=1 CTA. 2. Wyzwalacz behawioralny + fallback czasowy (nie odwrotnie). 3. aha_event=true → NATYCHMIAST wygasza całą serię onboardingu (exit+suppress). 4. Priorytet: transakcyjny/dunning > activation > marketing; 1 priorytetowy/okno. 5. Rozdziel kind transakcyjny (bez unsub) od marketingowego (zgoda+unsub) — PKE. 6. Metryki na eventach/klikach. 7. Kadencja 4-7/14d.
Spięcie: welcome#1 masz; activation_nudge#3 wyzwalany BRAKIEM aha; DODAĆ #2 quick-win + #4 MILESTONE (luka); trial_ending ROZGAŁĘZIENIE (aktywowany=upgrade / nie=extension); onboarding WYGASA przy aktywacji; dunning PRIORYTET, wstrzymuje marketing w oknie (logika w OBU webhookach TPay+Revolut).

## PER PROJEKT
aha_event + quick_win_event; nazwy funkcji #2/#5; treść+tematy; próg okna nudge (zależny od trialu); case/klient #6.
