# 08-PLAN-SESJI — Dobry Wstęp (DRAFT, 2026-07-15)

> 1 moduł = 1 sesja (2× dłuższa sesja = 4× więcej porażek). Każda sesja: rytuał METODYKA-BUDOWY.md
> (BUILDLOG → wykonanie → dowody na preview/prod → mini-runda krytyka → BACKPORT-LISTA + LEKCJE).
> Scope creep → wfa_notes „na później". Status: [ ] pending / [x] done.

- [ ] **S1 — pipeline** (krok repo_vercel): forge → repo private → Vercel git connect → dowody
      Production/Preview → smoke 404 (BUILDLOG/brief niepubliczne). Placeholder zostaje na prodzie.
- [ ] **S2 — schemat DB** (krok schemat_db): migracja niszy wg brief/03 + RLS + test anon OD RAZU.
      Done: tabele istnieją, anon nie przecieka (dowód w BUILDLOG).
- [ ] **S3 — auth E2E** (krok auth_konta): weryfikacja startera na żywym deployu (rejestracja→
      logout→login→reset przez Resend SMTP) + smoke trialu. UWAGA: reset hasła wymaga Resend
      (krok resend_dns po delegacji NS) — jeśli DNS nie gotowy, reset odłożony z flagą.
- [ ] **S4a — przygotowanie (F1)**: formularz + encja preparations + pulpit-lista (bez KPI).
      Done: przygotowanie tworzy się i edytuje z telefonu <3 min.
- [ ] **S4b — research + fakty (F2)**: edge prep-research (crawl WWW + web search, etykiety),
      ekran faktów (zatwierdź/edytuj/„zapytaj klienta"/dodaj własny), bramka kompletu
      obowiązkowego. Done: fakty z realnej firmy testowej; plan zablokowany do zatwierdzenia.
- [ ] **S4c — plan + gotowość (F3)**: edge prep-plan, ekran planu (sekcje + oznaczenia + kopiuj),
      gotowość deterministyczna + lista braków. Done: plan kompletny; AHA_EVENT plan_generated
      emitowany; gotowość liczy się wg wag 40/30/30.
- [ ] **S4d — symulacja (F4a)**: edge prep-sim (czat, tryby trening/egzamin, persona konkretny/
      neutralny + komunikat, poziomy, flaga close_attempt, wymuszone domknięcie). Done: pełna
      rozmowa obu trybów na koncie testowym.
- [ ] **S4e — raport + powtórka + retencja (F4b)**: edge prep-report (rubryka 40/25/20/15,
      cytaty zanonimizowane, wnioski), 1 powtórka końcówki, porównanie prób, czyszczenie
      transkryptu (dowód w DB: content='' + transcript_wiped_at). Done: raport E2E + wipe.
- [ ] **S4f — pulpit + historia (F5a)**: KPI pulpitu (najbliższe spotkanie, licznik, gotowość,
      ostatnia ocena), historia z trendem. Done: dane realne, stany puste zaprojektowane.
- [ ] **S5 — panel usera reszta** (krok panel_usera): konto/profil (rola+oferta → kontekst),
      onboarding 1 pytanie, mobile sweep 360/390/414.
- [ ] **S6 — panel operatora** (krok panel_operatora): starter + nisza (kolumny przygotowań/
      egzaminów, kafel kosztów AI, edycja promptów z app_settings, kill-switch ai_enabled).
      UWAGA PRYWATNOŚĆ: operator NIE widzi treści przygotowań/rozmów userów — tylko liczby.
- [ ] **S7 — płatności** (krok platnosci_e2e): plany wg FINALNEGO pricingu (krok pricing!),
      limit Solo (licznik przygotowań + komunikat upgrade), trial wg decyzji. ⏸ gate: Stripe
      Connect platforma Tomka + stripe_kyc klienta.
- [ ] **S8 — lifecycle maile** (krok maile_trans): welcome (1 krok: stwórz pierwsze
      przygotowanie), nudge 24-48h po rejestracji bez planu („masz spotkanie? przygotuj się"),
      nudge po planie bez egzaminu („przećwicz zanim wejdziesz"), dunning. Behawioralne.
- [ ] **S9+ — moduły standardu**: wiadomości panel, seria trialowa, polecenia (koncepty
      MODUL-*.md) — po rdzeniu.
- [ ] **MINI-REVIEW rdzenia** po S4f (obowiązkowy, przed S5): świeży krytyk na pełnej pętli F1→F4.

## Kryteria globalne
Każdy ekran: mobile-first, stany puste/błędów/ładowania, zero żargonu (D9), ton trenera (zero
bon motów). Każda sesja: audit-static 0 FAIL; commit repo aplikacji; wpis BUILDLOG.
