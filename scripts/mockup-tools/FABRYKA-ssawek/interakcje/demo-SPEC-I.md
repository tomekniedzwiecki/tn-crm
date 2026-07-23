# SPEC-I — sekcja `05-demo` (SSAWEK / Popiołek) · TOR-I · F2 (T0+T1) · 2026-07-23

> Kontrakt interakcji flagowej. Powstaje w F2 (na makietach), egzekwowany w F5/Życie (T2–T6).
> Źródło faktów = KARTA-PRAWDY.md; wygląd = TOKENS-MAKIETY.md; wierność = PASZPORT.md.

## T0 — KWALIFIKACJA (dlaczego TOR-I)
`05-demo` = sekcja **„jak działa" / demo 1-2-3** → **DOMYŚLNIE TOR-I** (SEKCJE-INTERAKTYWNE §T0).
Poziom **L3**. Skutek na makiecie (F2): makieta MUSI pokazać **STANY demonstracji** (osobny kadr
per krok 01/02/03), nie statyczną kartę z jednym zdjęciem — inaczej regeneracja makiety przed
akceptem. Interakcja z INTERAKCJE-KATALOG: **#stepper / przełącznik kroków** (stany A→B→C).

## CEL DEMONSTRACYJNY (co klient ma ZROZUMIEĆ)
„Obsługa jest banalna i bezworkowa: **wepnij** wąż/rurę → **wciągnij** popiół/gruz/wodę →
**wytrzep** filtr koszowy i użyj kolejnego. Trzy ruchy, zero worków, zero kombinowania." Rozbraja
obiekcję „czy to skomplikowane / czy będę musiał dokupować worki".

## TRYB DEMO (dwutrybowy — wzorzec ugniatek/masażer: stany + auto-fallback)
- **Tryb interaktywny (domyślny, JS):** trzy klikalne kroki-kafle (stepper `01 / 02 / 03`). Klik/tap
  na kroku (lub auto-advance co ~3,5 s do pierwszej interakcji użytkownika) przełącza AKTYWNY kadr
  i jego opis; aktywny krok = obwódka + akcent na numerze (JEDYNY akcent = #C2381B na aktywnym
  numerze/podkreśleniu, reszta ink). Klawiatura: ←/→ + focus-visible. `aria-selected` na tabach.
- **Tryb statyczny (no-JS / `prefers-reduced-motion`):** wszystkie trzy kadry widoczne jednocześnie
  jako sekwencja 01→02→03 z łącznikiem (pełna treść, zero ruchu mimowolnego). To jest też stan
  makiety desktop (3 kadry naraz) — makieta pokazuje KOMPLET stanów.

## STORYBOARD STANÓW (A → trigger → B → C)
| stan | trigger | kadr (asset) | podpis PL | zmiana widoczna |
|---|---|---|---|---|
| **01** (A, domyślny) | — | wpięcie metalowej rury/węża do króćca | „Wepnij wąż i rurę" | rura wchodzi w króciec |
| **02** (B) | klik krok 02 / auto +3,5 s | dysza wciąga smugę szarego popiołu/gruzu z paleniska | „Wciągnij popiół, gruz lub wodę" | strumień popiołu przy dyszy |
| **03** (C) | klik krok 03 / auto +3,5 s | wytrzepywanie szarego filtra koszowego nad wiadrem | „Wytrzep filtr koszowy i użyj kolejnego" | filtr wyjęty, popiół spada |

Klatki pośrednie: crossfade 240–320 ms (nie skok). Produkt WIERNY w każdym kadrze (kanister,
czerwona pokrywa, stalowy zbiornik — PASZPORT); każdy stan = **osobne ujęcie** (polityka PRODUKT
W SCENACH — nie ten sam kadr z filtrem CSS).

## ASSETY PER STAN (F3 dostarcza sceny; klasa S/R)
- `demo-01.webp` — wpięcie węża/rury (S wierna lub crop realny akcji).
- `demo-02.webp` — dysza + smuga popiołu (S; nośnik = zwarta smuga popiołu, nie pyłki).
- `demo-03.webp` — wytrzepanie filtra koszowego (S wierna).
Każdy oddzielny kadr (distinct product view) — near-dup między stanami = P1 (OBRAZY-ROLE).

## KRYTERIA AKCEPTACJI (mierzalne — T3 w Życiu)
- **SSIM(01,02) < 0,9 i SSIM(02,03) < 0,9** w regionie kadru (realna zmiana stanu; inaczej FAIL
  martwej interakcji).
- Klatki pośrednie ≠ 01 i ≠ 03 (przejście istnieje, nie skok).
- Czas przejścia 240–320 ms; auto-advance 3,5 s do 1. interakcji, potem stop.
- Działa **390 px** (tap ≥44 px) i **1280 px**; **no-JS** = 3 kadry sekwencyjnie (pełna treść);
  **reduced-motion** = zmiana natychmiastowa bez animacji, funkcja działa.
- 0 błędów konsoli; INP w normie.
- WERDYKT VISION na klatkach A/mid/B/C: „czy to DEMONSTRUJE 3 kroki obsługi bezworkowej?" TAK.

## CTA sekcji
Pod stepperem: `.btn.cta` „Zamawiam Popiołka — 119 zł" (JEDYNY akcent). Kolejność: demo → cena→CTA.

## GRANICE / ZAKAZY
⛔ Toggle zmieniający tylko klasę przycisku bez zmiany kadru (martwa interakcja). ⛔ Jeden kadr
z filtrem CSS udający 3 stany. ⛔ Claim antystatyczny przy „elektryzowaniu" (to FAQ, nie demo).
⛔ Numeracja SEKCJI — numery `01/02/03` = numery KROKÓW wewnątrz sekcji (dozwolone).
