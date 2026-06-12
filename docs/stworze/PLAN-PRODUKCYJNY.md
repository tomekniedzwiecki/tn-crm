# Stworzę — produkcjonizacja (plan + architektura)

Data: 2026-06-13. Cel: z prototypu lejka /stworze zrobić narzędzie produkcyjne:
backend z kosztami, panel admina „TN Aplikacje", auth (Google/FB + telefon),
flow mailowe Resend, redesign strony głównej.

## Struktura plików (decyzja porządkująca)

| Co | Gdzie | Dlaczego |
|---|---|---|
| Strona główna /stworze + sparing | `tomekniedzwiecki.pl/aplikacja/` | marka — domena główna (decyzja Tomka) |
| Panel admina TN Aplikacje | `tn-crm/tn-aplikacje/index.html` | obok tn-workflow; deploy crm.tomekniedzwiecki.pl |
| Edge functions | `tn-crm/supabase/functions/spar-*` | jeden projekt Supabase yxmavwkwnfuphjqbelws |
| Migracje | `tn-crm/supabase/migrations/2026*_stworze_*.sql` | jw. |
| Dokumentacja | `tn-crm/docs/aplikacja/` | ten plik + maile |
| Prompt sparingu | `c:\tmp\stworze-sparing-prompt-v1.md` → settings DB | NIE do repo (tn-crm publiczne!) |

## DB (migracja 20260613_stworze_produkcja.sql)

- `spar_usage` — koszt każdego wywołania AI: session_id, kind(chat/plan/image),
  model, input/cached/output_tokens, images, cost_usd, created_at.
  Koszt liczony w edge function przy zapisie (cennik w kodzie), panel przelicza
  na PLN wg settings `usd_pln_rate`.
- `spar_emails` — idempotencja follow-upów: UNIQUE(session_id, kind).
- `spar_sessions` + phone, auth_user_id, auth_provider, paid_at, last_user_at.
- RLS: SELECT dla authenticated (panel admina) na spar_sessions/messages/usage/
  emails/feedback; zapis nadal tylko service_role (edge functions).

## Cennik (stałe w edge functions, USD)

- gpt-5.5: in $5/M, cached $0.50/M, out $30/M
- gpt-5.1: in $1.25/M, cached $0.125/M, out $10/M
- gpt-image-2 1536x1024: low $0.011 / medium $0.041 / high $0.167
- Kurs PLN: settings `usd_pln_rate` (edytowalny w panelu, default 4.00)

## Pipeline leadów (panel)

Etapy wyliczane z danych (bez osobnej kolumny stage):
1. **Rozmowa** — sesja bez emaila
2. **Lead** — email podany (lead_id ustawiony)
3. **Projekt** — preview_images niepuste (wygenerował grafiki)
4. **Zielony werdykt** — verdict='zielony'
5. **Opłacone 500 zł** — paid_at (cron spina orders po lead_id + offer
   a1656695-db0d-4ae7-b107-230832042076 ze statusem paid)

## Follow-upy mailowe (spar-followups, cron co godzinę)

| kind | Warunek | Treść/link |
|---|---|---|
| `abandoned_chat` | email jest, brak werdyktu, last_user_at 3–48h temu | „Twój projekt czeka" → ?id=SID |
| `verdict_no_payment` | verdict zielony, brak paid_at, werdykt 20–72h temu | karta+plan, CTA rezerwacja → ?id=SID#projekt |
| `paid_welcome` | paid_at < 1h temu | „co dalej: Tomek przygotowuje plan, odezwie się osobiście" |

Zasady: max 1 mail per kind per sesja (UNIQUE), wysyłka 8:00–20:00 PL,
od `Tomek Niedźwiecki <...>` przez send-email (Resend). Linki zawsze
z `?id=<sid>` (+ #projekt-plan dla planu) + utm_source=email&utm_campaign=kind.

## Auth w sparingu

- Bramka inline: imię + email + **telefon** (zapis spar_sessions.phone + lead-upsert).
- Google/Facebook przez Supabase Auth (implicit flow, redirect na sparing);
  po powrocie session → email/name z provider'a wypełnia bramkę automatycznie,
  auth_user_id/provider zapisywane do sesji sparingu.
- WYMAGA od Tomka: konfiguracja providerów w Supabase Dashboard
  (Google OAuth client + Facebook app) — instrukcja na końcu wdrożenia.

## Panel TN Aplikacje (tn-crm/tn-aplikacje/)

Zakładki: Dashboard (KPI: sesje, leady, konwersje, koszty PLN dzień/7d/zakres,
wykres dzienny) · Pipeline (5 kolumn jw.) · Sesje (tabela: nazwa projektu,
osoba, werdykt, wiadomości, generacje, KOSZT PLN, daty; szczegół = transkrypt,
grafiki, plan, koszty breakdown, maile) · Ustawienia (kurs USD/PLN, limity env).
Auth gate jak tn-workflow. Nawigacja „TN Aplikacje" dopisana do przełącznika
produktów we wszystkich panelach.

## Strona główna /stworze (redesign)

Narracja: „Buduję aplikację na Twoim pomyśle → pozyskuję klientów → wdrażam Cię
→ przekazuję stery". Styl: spójny ze /zbuduje i /zwolnie + smaczki AI-firm
(Vercel/Supabase: glow, grid-pattern, gradient borders, scroll-reveal).
Sekcje: hero → jak to działa (4 kroki) → ostatnie generowania (feed z
spar-public-feed, webp width=480) → model współpracy (50/50, 50 klientów,
stery, 20%) → społeczność (spotkania online+stacjonarne, Tomek aktywny) →
FAQ/CTA. Obrazy feedu: Supabase render API format=webp&width=480&quality=70.

## spar-public-feed

Edge function (anon-safe): ostatnie N sesji z preview_images + zielony werdykt,
zwraca TYLKO {nazwa, panel_url} (zero PII), cache 10 min w pamięci instancji.
