# LEKCJE FABRYKI — księga główna pętli uczenia się

> **Po co ten plik:** każda aplikacja ma uczyć fabrykę. Sekcje `LEKCJE → FABRYKA` w BUILDLOG-ach
> aplikacji to SKRZYNKI NADAWCZE (rozproszone, per apka); ten plik to KSIĘGA GŁÓWNA — jedno miejsce
> ze STATUSEM każdej lekcji. Bez statusów lekcje „kandydujące" ginęły (audyt 2026-07-20: rls-smoke,
> auth-e2e, single-source edge↔UI — zgłoszone, nigdy nie zbudowane).
>
> **Kto pisze:** (1) krok `retro_fabryki` każdego projektu wfa (przenosi z BUILDLOG-a, nadaje status);
> (2) każda sesja fabryczna, która robi backport ad-hoc (dopisuje wiersz od razu ze statusem WDROŻONA).
> **Zasada statusów:** lekcja NIE znika — najwyżej dostaje ODRZUCONA z powodem. Wiersz = 1 linia tabeli.
> **Typy:** MODUŁ (kod do template/) · NARZĘDZIE (honor-system → skrypt/gate) · DOKTRYNA (zasada do
> CLAUDE.md/brief/metodyki) · PROCEDURA (zmiana rytuału/kroku wfa). Lekcje NARZĘDZIE historycznie
> utykały najczęściej — przy retro sprawdzaj je w pierwszej kolejności.

## Rejestr

| ID | Data | Źródło | Typ | Lekcja (1 linia) | Status | Nośnik |
|----|------|--------|-----|------------------|--------|--------|
| L-001 | 2026-07-20 | Sygno GATE A | DOKTRYNA | Lekcje RLS zapisane per `user_id` nie generalizują się na model per-FIRMA — doktryna musi mówić o KLUCZU NAJMU (user_id LUB firma_id/org_id) | WDROŻONA | starter `template/brief/03` zasady 7-9 (commit 779426c) + template/CLAUDE.md (uogólnienie) |
| L-002 | 2026-07-20 | Sygno GATE A | DOKTRYNA | Polityka INSERT członkostw NIE może mieć OR-gałęzi self-bootstrap; założyciela dopisuje WYŁĄCZNIE trigger SECURITY DEFINER | WDROŻONA | starter brief/03 zasada 7 |
| L-003 | 2026-07-20 | Sygno GATE A | DOKTRYNA | Tabela z kolumnami silnikowymi (status/werdykt/is_demo/score) = obowiązkowe column-grants; komentarz „robi to service-role" bez REVOKE nie egzekwuje niczego | WDROŻONA | starter brief/03 zasada 9 |
| L-004 | 2026-07-20 | Sygno GATE A | NARZĘDZIE | audit-static nie czyta semantyki migracji — 3 reguły WARN: self-grant OR z auth.uid(), tabela potomna bez exists(parent), kolumny silnikowe bez revoke | W TOKU | sesja 2026-07-20 (agent starter) |
| L-005 | 2026-07-20 | Sygno GATE A | NARZĘDZIE | Test izolacji RLS ręcznymi curl-ami = niepełne pokrycie z fałszywą pewnością (Sygno: 1/9 tabel, 0/4 blockerów trafionych) → generyczne `rls-matrix.mjs` + fixture per apka, PEŁNA macierz jako dowód kroku schemat_db | W TOKU | sesja 2026-07-20 (agent starter) |
| L-006 | 2026-07-20 | Sygno (pad sesji) | PROCEDURA | Pad techniczny sesji (błędy API tura-po-turze) nie ma runbooka — odzysk = BUILDLOG-first, git-log-second, task-outputy-third, transkrypt ostatni; BUILDLOG pisać PRZYROSTOWO, commit per faza | W TOKU | METODYKA-BUDOWY.md §3b (sesja 2026-07-20) |
| L-007 | 2026-07-20 | audyt pętli uczenia | PROCEDURA | Backport nie jest krokiem workflow → lekcje przenosi tylko pamięć sesji; nowy krok `retro_fabryki` w Etapie 5 + sekcja `LEKCJE → FABRYKA` w każdym wpisie BUILDLOG | W TOKU | METODYKA §3 + wfa_step_defs (sesja 2026-07-20) |
| L-008 | 2026-07-19 | Dobry Wstęp S2 | NARZĘDZIE | „Test kluczem anon jako powtarzalny skrypt" (rls-smoke.mjs) — zgłoszone, nie zbudowane | ZASTĄPIONA | konsumuje L-005 (rls-matrix obejmuje sondy anon) |
| L-009 | 2026-07-16 | Dobry Wstęp S3 | NARZĘDZIE | auth-E2E jako skrypt fabryki (auth-e2e.mjs) zamiast ręcznych FAZ 0-5 przy kroku auth_konta (~1-2 h/apkę → minuty) | W TOKU | sesja 2026-07-20 (agent starter, po rls-matrix) |
| L-010 | 2026-07-16 | Dobry Wstęp S4c | NARZĘDZIE | Kontrakt edge↔UI „jedno źródło liczb, generacja .js z .ts" — dziś bliźniacze pliki ręcznie synchronizowane + test porównujący | ZGŁOSZONA | dobrywstep BUILDLOG S4c; wzorzec (g) w template/CLAUDE.md działa jako mitygacja |
| L-011 | 2026-07-17 | Dobry Wstęp S8 | PROCEDURA | Dedykowane klucze Resend per apka z sending_access + domainId (least-privilege) jako standard forge/kroku S3 | ZGŁOSZONA | dobrywstep BUILDLOG S8 |
| L-012 | 2026-07-20 | Sygno przegląd | DOKTRYNA | `account/export` bez tabel niszy + delete osieroca firmę solo-właściciela = RODO LIVE-defekt; krok schemat_db MUSI domykać export/erasure W TEJ SAMEJ SESJI, a test eksportu asertuje sekcje domenowe | W TOKU | sesja 2026-07-20 (agent Sygno); doktryna już w template/CLAUDE.md („RODO — KRYTYCZNE") — brakowało EGZEKUCJI |
| L-013 | 2026-07-20 | audyt pętli uczenia | PROCEDURA | Reguła „moduł awansuje po 2 apkach" (MODULES.md) nie ma wsparcia — przy retro_fabryki porównuj BACKPORT-LISTY apek i podbijaj powtórzone wzorce | ZGŁOSZONA | ten plik = miejsce porównania; egzekucja w kroku retro_fabryki |
| L-014 | 2026-07-20 | audyt pętli uczenia | NARZĘDZIE | Brak drift-detekcji apka↔starter (poprawka bezpieczeństwa w starterze nie dociera do żywych apek) — inwentarz „która apka ile commitów za starterem" + przegląd przy retro | ZGŁOSZONA | kandydat: skrypt porównujący template/ z repo apki (hash plików wspólnych) |
| L-015 | 2026-07-20 | Sygno GATE A (koszt) | PROCEDURA | Najdroższy czas budowy = pętla audytowa (zbuduj→Opus wykrywa→napraw→re-test→re-audyt, ~5 przebiegów) → SHIFT-LEFT: tanie detektory w sesji budującej, audyt POTWIERDZA; klasa odkryta przez audyt = kandydat na detektor | WDROŻONA | METODYKA §2a pkt 1 |
| L-016 | 2026-07-20 | wzór fabryki landingów Z8 | PROCEDURA | Modele per typ kroku (Sonnet default, Haiku mechaniczne, Opus tylko audyt/architektura/krytyk wrażliwy) — gate'y ubezpieczają tańszy model; jawny model przy każdym spawnie | WDROŻONA | METODYKA §2a pkt 3 |
| L-017 | 2026-07-20 | Sygno GATE A | PROCEDURA | Podwójny niezależny audyt TYLKO dla izolacji danych/płatności (przy 0024 komplementarne znaleziska); reszta = 1 audyt + tani krytyk; audyt w TLE, sesja kontynuuje kroki niezależne | WDROŻONA | METODYKA §2a pkt 4-5 |
| L-018 | 2026-07-20 | optymalizacja tempa | PROCEDURA | BUILDLOG notuje czas ścienny sesji (1 linia) → retro_fabryki porównuje tempo między apkami i wskazuje kroki-pożeracze | WDROŻONA | METODYKA §2a pkt 7 |

## Jak czytać statusy
- **ZGŁOSZONA** — czeka na decyzję/budowę (retro_fabryki przegląda WSZYSTKIE przy każdym projekcie).
- **W TOKU** — sesja pracuje nad wdrożeniem (wpis wskazuje którą).
- **WDROŻONA** — jest w starterze/metodyce/gate (nośnik = commit/plik).
- **ZASTĄPIONA** — skonsumowana przez inną lekcję (wskaż którą).
- **ODRZUCONA** — świadoma decyzja z powodem (nie kasować wiersza).
