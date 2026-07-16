# RESEARCH: onboarding gdy „aha" jest za asynchroniczną generacją AI

> Sonnet 5, 2026-07-17. Luka frameworku: aha = artefakt z modelu (wait 10-60 s + ryzyko błędu).
> Synteza wdrożona w `ONBOARDING-FABRYKA.md` §4b. Dotyczy Dobry Wstęp (plan) i Fachmat (PDF oferty).

## Fundament liczbowy (dowody)
- Pasek postępu vs brak: mediana cierpliwości **22,6 s vs 9 s** (NN/G) — czekają >2× dłużej gdy widzą progres.
- Widoczny progres → porzucenie **do ~30%** (userpilot / smart-interface-design-patterns).
- Tempo paska: „szybko na starcie" = **11,3% porzuceń**; „szczere" (wolno→szybko) = **21,8%**. Optymistyczny start wygrywa.
- Streaming tokenów: TTFT 4,1 s→0,6 s (−90%); postrzegana szybkość 4/10→9/10; drop-off po prompt **22%→7%** (pełny czas prawie bez zmian).
- Skeleton „czuje się szybciej", spinner „wolniej". Spinner OK do ~3 s; powyżej → pasek/skeleton + tekst.

## 1. Zarządzanie oczekiwaniem (ranking od najgorszego)
1. Nagi spinner = najgorszy (>3 s czyta się jak scam/zawieszenie).
2. Skeleton — dobry gdy znasz KSZTAŁT wyniku; rysuj układ docelowego artefaktu, nie generyczne paski.
3. Pasek z realnym progresem — tylko gdy masz mierzalne etapy; pasek utykający na 90% = gorszy niż spinner.
4. Progres etapowy (labeled, operacja-po-operacji) — dla nas NAJLEPSZY bez streamingu (*labor illusion*).
5. Streaming tokenów — najsilniejszy gdy artefakt tekstowy; łącz streaming treści + etykiety faz nie-tekstowych.

Reguły: R1.1 nigdy spinner >3 s; R1.2 tempo optymistyczne (pierwszy etap w 1-2 s); R1.3 streamuj gdy tekst;
R1.4 skeleton w kształcie artefaktu; R1.5 zero fałszywych procentów — nazwane etapy.

## 2. Redukcja PERCEIVED wait
R2.1 labeled progress > liczby; R2.2 operacja-po-operacji (rosnąca checklista ✓); R2.3 optymistyczny UI dla
taniej pewnej części (nazwa firmy/data/branża od razu w szkielecie); R2.4 pokazuj CZĘŚCIOWY wynik ASAP
(research zanim plan); R2.5 „ludzka" narracja 1. osoba (nie „tokenizuję/batch inference"); R2.6 min. czas
etapu ~600-900 ms (anti-flicker; natychmiastowość czyta się jak fejk, odrobina „widocznej pracy" > zaufanie).

## 3. Zaufanie sceptyka podczas czekania (lęk #1=scam)
R3.1 powiedz KTO/CO liczy na JEGO danych („Analizuję dane Twojej firmy z KRS…"); R3.2 widełki czasu nie
obietnica; R3.3 transparentność WARTOŚCI nie techniczna (etapy-jako-czynności, nie logi/prompty/modele);
R3.4 zakotwicz wartość zanim wynik przyjdzie („Za chwilę zobaczysz gotowy plan dopasowany do branży");
R3.5 zawsze widoczny ruch (rotacja etykiet co kilka s wg harmonogramu); R3.6 bez żargonu/straszenia.

## 4. Obsługa PORAŻKI pierwszej generacji (krytyczny moment aktywacji)
R4.1 zachowaj input ZAWSZE (localStorage + wiersz `pending`); R4.2 automatyczny cichy retry 1× z backoffem
PRZED pokazaniem błędu; R4.3 komunikat bez żargonu, wina po stronie systemu; R4.4 backend rozróżnia
`rate_limit|timeout|empty|quota|other`, UI = jeden ludzki komunikat, `insufficient_quota`=alert fabryki;
R4.5 fallback wartości (degradacja modelu / częściowy wynik / kolejka operatora „przyślemy mailem") — nigdy
pusty ekran; R4.6 timeout klienta > p95 modelu (p95=35 s → 75 s; edge split + deadline 330s);
R4.7 aha = pierwszy PERSONALIZOWANY output (przy research→plan: pierwsza sekcja planu, nie „research done").

## 5. Instrumentacja (Supabase)
Tabela `generations` (id, user_id, app, input_hash, status, model, created_at, first_token_at, first_value_at,
succeeded_at, failed_at, fail_reason, retry_count, client_abandoned_at). Statusy `pending→running→(partial)→
succeeded|failed|abandoned`. Eventy: `generation_started`(T0) · `generation_first_value`(=AHA) ·
`generation_succeeded` · `generation_failed`(reason,retry) · `generation_retried` · `generation_abandoned`.
R5.2 TTFV = first_value_at − T0 = KPI aktywacji (NIE succeeded); R5.3 NIE odejmuj czasu modelu od TTFV
produktowego, loguj `model_latency` osobno; R5.4 harmonogram etapów z p50/p95 logów napędza narrację + ETA;
R5.5 porzucenie: `sendBeacon` na visibilitychange/beforeunload + serwerowy sweep `running` przeterminowanych,
loguj etap; R5.6 `failed`(system) ≠ `abandoned`(user).

## 6. E-mail/nudge po porzuceniu lub porażce
R6.1 Trigger A (porzucił w trakcie): dokończ serwerowo + „Twój plan gotowy — dokończyliśmy za Ciebie", 15-60 min;
R6.2 Trigger B (2× failed): przeprosiny + REGENEROWANY artefakt; R6.3 dostarcz WARTOŚĆ w mailu nie „wróć";
R6.4 max 1-2 nudge; R6.5 personalizacja z zapisanego inputu (firma w temacie); R6.6 kill-switch gdy w
międzyczasie był sukces. Reply-to=ceo@; wysyłka wg reguł fabryki (nie autonomicznie); logika na `delivered_at`.

## TOP 5 do frameworku (wdrożone w §4b)
1. Generacja jako etapy z ludzką narracją (nie nagi spinner); streaming gdy tekst; tempo optymistyczne.
2. Porażka = pełnoprawny stan produktu (zapis inputu → cichy retry → komunikat bez żargonu → fallback).
3. TTFV jako KPI, aha = pierwszy personalizowany output (nie succeeded); model_latency osobno.
4. Standardowy zestaw eventów generacji + wykrycie porzucenia (beacon + serwerowy sweep).
5. Nudge z dostarczoną wartością (regeneruj serwerowo), nie „wróć"; max 1-2, kill-switch.

## Źródła
NN/G Progress Indicators; NN/G Skeleton Screens 101; Smart Interface Design Patterns (Loading UX);
Userpilot (Progress Bar SaaS); Onething (Skeleton vs Spinners); Redis (Streaming LLM / TTFT);
Nature Hum.Soc.Sci.Comm. (AI transparency & trust).
