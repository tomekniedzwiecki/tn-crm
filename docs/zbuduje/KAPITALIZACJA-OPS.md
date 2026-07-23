# KAPITALIZACJA-OPS — runbook reuse fabryki landingów

**Status: OBOWIĄZUJE (2026-07-21).** Operacyjne spięcie systemu kapitalizacji: jak fabryka
WYKORZYSTUJE to, co już zbudowała, przy każdym kolejnym landingu — bez utraty jakości i bez
kopii 1:1. Ten plik = runbook; asortyment (co reuse'ujemy) opisuje `PLAN-REUSE-KAPITALIZACJA.md`.

> **Zasada nadrzędna (decyzja Tomka 21.07):** priorytet = **JAKOŚĆ**, koszt drugorzędny.
> Optymalizujemy **czas / spójność / ilość reworku** wyłącznie tam, gdzie to **PODNOSI albo
> NIE RUSZA** jakości. Każdy mechanizm tu opisany jest **ADDITYWNY** — to narzędzia **PRZED**
> bramkami, nigdy zamiast nich. ⛔ Reuse NIGDY nie omija bramek: `cross_landing`, wierność F3A,
> `layout_diff`, `detail-lint`, `finalny_pass` zostają twardym progiem dla KAŻDEGO landingu.
>
> **🎈 REUSE = MIŁY DODATEK, NIE SPOSÓB DZIAŁANIA (dyrektywa Tomka 21.07).** Domyślny tryb fabryki
> pozostaje: **buduj każdy landing świeżo, jakość ponad tempo.** Kapitalizacja pomaga, GDY się opłaca —
> nie jest przymusem ani ramą. Dlatego bramki tego systemu (`kapitalizacja_deposit`, `reuse_preflight`)
> są **WARN — miękkie przypomnienia, NIC nie blokuje DONE**. Nie robimy reuse agresywnie.

---

## 0. Trzy poziomy reuse (taksonomia z PLAN §mapa)

| poziom | co | reuse | źródło |
|---|---|---|---|
| **A — INWARIANT** | moduły kanoniczne, gate'y, skrypty, rytm 8pt, KANON warsztatu | **1:1** (kopiuj mechanikę) | `moduly/`, `gate-*`, `TOKENS-MAKIETY §KANON` |
| **B — PARAMETRYCZNY** | skeletony sekcji, kontrakt tokenów, struktura briefingu | **struktura reuse, wartości ŚWIEŻE** | `moduly/*@N`, `PARTIALE-PROMPTY.md`, `TOKEN-KONTRAKT.md` |
| **C — GENERATYWNY / PARTYTURA** | wizja, archetyp hero, paleta, copy, sceny | **ZAWSZE od nowa** | ICP + PASZPORT + PLAN per landing |

⛔ **Anti-klon (root cause zbieżności masażer↔Drapek 9/10):** exemplary/wzorce służą **WYŁĄCZNIE
rzemiosłu** (rytm, kod, mechanika modułów) — **NIGDY wizji ani copy**. Zawsze **rotacja + dobór
różnorodny**, nigdy 1 stały wzorzec. `cross_landing` (font=FAIL, ΔE<15=FAIL, archetyp=FAIL,
sekwencja>80%=WARN) pilnuje tego maszynowo i **zostaje włączony**.

---

## 1. WEJŚCIE — retrieval (przed F1)

1. Z `EXEMPLARY-INDEX.md` dobierz **2–5** wcześniejszych landingów wg **dwóch osi jednocześnie**:
   - **trafność** — najbliższy typ produktu / kontekst użycia / archetyp,
   - **różnorodność** — celowo różne archetypy i palety (anty-mode-collapse; nie bierz 3× tego
     samego „najbliższego").
2. Użyj ich do: skeletonów sekcji (B), inspiracji rytmu i rozwiązań rzemieślniczych (A).
   **Nie** do przepisywania wizji, palety ani copy (C).
3. Zasil `cross_landing` realnym zbiorem „N poprzednich" z indexu (nie pustką) → bramka anty-klon
   liczy dystans do PRAWDZIWEJ historii, nie do niczego.

---

## 2. PROMPT prefix-first — automatyczny prompt-cache (zero ryzyka dla jakości)

`wf2-gpt` = proxy do OpenAI Responses API (gpt-5.6-sol), gdzie **prefix ≥1024 tok jest cache'owany
AUTOMATYCZNIE**. Warunek trafienia: identyczny **statyczny prefiks NA GÓRZE** briefingu.

Składaj każdy briefing F1 / F4 / krytyk tak:
```
[STATYCZNY PREFIKS]  ← PARTIALE-PROMPTY.md verbatim: KANON/STYLE-DNA · „DOKŁADNIE JEDNA SEKCJA” ·
                        szablon PASZPORT · typ osadzenia sceny · reguły seedów
[ZMIENNE]            ← PASZPORT produktu · ICP · PLAN · tokeny · konkretna sekcja
```
Efekt: szybciej i taniej, a **jakość IDENTYCZNA** (to ten sam tekst, tylko kolejność sekcji
briefingu). To jedyna „implementacja" cachingu — **żadnej zmiany w kodzie proxy** (`wf2gpt-call.py`
przepuszcza tekst 1:1; nie dokładamy pól do payloadu = zero ryzyka odrzucenia).

---

## 3. PRE-DECYZJE — preflight (twardy check PRZED F1.7 / makietami)

Złap decyzje, które i tak egzekwują bramki — **zanim** zbudujesz, nie po (mniej reworku = wyższa
jakość przy tym samym wysiłku). Brak którejkolwiek = **STOP**, nie „uzupełnię później":

- [ ] **typ osadzenia** każdej sceny orzeczony (A full-bleed / B split / C kafel) — steruje
      `fade()` vs `fullframe()` i anty-szwem. *(nośnik: gate F3A#2, GRAFIKA §1)*
- [ ] **hero pod hero-video** — makieta hero ma nośnik zapętlonego ruchu; ⛔ martwy packshot = regen.
- [ ] **MANIFEST SEKCJI** wypełniony — kontrakt kompletności: rdzeń `hero/zamow/final/mid-cta` +
      WSZYSTKIE należne (UGC/wideo TikTok, opinie, porównanie, FAQ, zaufanie…); skip = jawny+logowany.
      *(nośnik: STANDARD §F1a, gate `check_sekcje_plan`)*
- [ ] **szkielet CTA** — ≥4 CTA, **dedykowana mid-CTA** (sekcja z realnym buttonem), sekcje z
      „**designed CTA**" wskazane. *(nośnik: gate `check_cta`, krytyk +11, F2 pkt.3)*
- [ ] **anty-szew** — dwie sąsiednie pełnokadrowe sceny NIE po tej samej stronie (zig-zag /
      sekcja rozdzielająca / kontener). *(nośnik: PRZEWODNIK „REGUŁA RYTMU", render-lint `scene_seam`)*
- [ ] **ICP** — jeśli `ICP-GRUPA-DOCELOWA.md` istnieje, zasila casting scen (§5) i hook (§3).

---

## 4. WYJŚCIE — flywheel deposit (po F8 = DONE)

Po każdym ukończonym landingu **zdeponuj** kapitał (inaczej wiedza ginie — archiwum Desktop
zostało wyczyszczone; to był single point of failure). Kolejność:

1. **EXEMPLARY-INDEX** → dopisz wiersz (slug · typ · archetyp · moduły · sekwencja · akcent/font ·
   poziom · link).
2. **Skeleton** → tylko jeśli sekcja wyszła **wybitnie i nowatorsko mechanicznie**: wydziel
   headless kandydata do `moduly/*@N` (⛔ nie cały landing, ⛔ nie jako exemplar wizji).
3. **Tokeny** → zarchiwizuj semantyczny `:root` produktu do rejestru `TOKEN-KONTRAKT.md`
   (paleta policzalna → realny materiał dla `cross_landing` ΔE).
4. **LEKCJA** → każdy defekt złapany/naprawiony → wpis w `LEKCJE-LANDINGI.md` z **NOŚNIKIEM**
   (gate / moduł / doktryna / pamięć), nie do pamięci człowieka. To domyka flywheel: następny
   landing startuje mądrzejszy.
5. **Archiwum do repo** → `PLAN/PASZPORT/ICP/DOPASOWANIE` landinga do `FABRYKA-*/<slug>/` **w repo**
   (nie na Desktopie).
6. **Koszt = też depozyt** → upewnij się, że KAŻDA faza zdeponowała do `wf2_costs` (zakładka „Koszty"):
   twarde API **ORAZ** `kind='claude'` (zmierzone tokeny agenta × stawka mieszana 80/20 — Sonnet
   $5,40 / Opus $9,00 / Haiku $1,80 /MTok; `note` = model + tokeny + „blend 80/20"). Główna pętla
   zostaje szacunkiem w `WORKFLOW-V2-TOKENY.md`. Reguła i przykłady: `STANDARD-LANDING-SKLEPY.md` §6 pkt 10.

⛔ Depozyt = skeletony / tokeny / lekcje / metadane. **NIGDY „gotowy landing jako wzorzec do
skopiowania"** — to droga do klonów.

---

## 5. Bezpieczniki jakości (czego reuse NIE robi)

- **Nie zamraża** wizji, palety ani archetypu — partytura (poziom C) zawsze świeża.
- **Nie omija ani nie zmiękcza** żadnej bramki — wszystkie progi liczą się dla każdego landingu.
- **Nie karmi** generatora „poprzednim copy" jako wzorem do naśladowania. RAG copy i generator
  wariantów = **Faza 2** (`FAZA2-COPY-WARIANTY.md`), status PROJEKT, **domyślnie wyłączone**,
  operują na RAMACH/wzorcach obiekcji (nie na zdaniach) i wymagają akceptu Tomka + tych samych bramek.

---

### Powiązane
`PLAN-REUSE-KAPITALIZACJA.md` (asortyment + roadmapa) · `EXEMPLARY-INDEX.md` (retrieval) ·
`PARTIALE-PROMPTY.md` (statyczny prefiks) · `LEKCJE-LANDINGI.md` (flywheel wiedzy) ·
`TOKEN-KONTRAKT.md` (przenośność skeletonów) · `moduly/MODULY.md` (poziom A) ·
`scripts/mockup-tools/gate-manifest.json` (`cross_landing` / `check_sekcje_plan` / `check_cta`) ·
`STANDARD-LANDING-SKLEPY.md` §F0.6a/§F1a.
