# Rozliczanie kosztów AI — standard fabryki TN App (SSOT)

> Decyzja Tomka 2026-07-16: AI działa na TOKENIE FABRYKI (konto OpenAI Tomka), ale zużycie
> jest **przenoszone na operatora (pass-through)** i rozliczane z nim OSOBNO co miesiąc.
> Panel operatora MUSI mieć bardzo dokładne rozpisanie zużycia. **Liczy się WYŁĄCZNIE zużycie
> końcowych userów panelu** — NIE testy fabryki, NIE podglądy/impersonacja operatora, NIE konta testowe.

---

## 1. Model (co i komu)

- **Kto płaci OpenAI:** Tomek (klucz fabryki `OPENAI_API_KEY` w Supabase każdej apki). Operator
  NIE ma własnego klucza (na etapie testów/pilotażu; docelowo przy 90/10 do rewizji).
- **Kto ponosi koszt ekonomicznie:** OPERATOR — pass-through. Tomek refakturuje operatorowi
  miesięczne zużycie AI JEGO userów (obok 10% rev-share i hostingu). To osobna pozycja rozliczenia
  Tomek↔operator (NIE przez Stripe operatora — to kanał operator↔jego klienci).
- **Co jest rozliczalne (`billable=true`):** wyłącznie wywołania AI wykonane przez PRAWDZIWYCH
  końcowych userów aplikacji (trial i płacący — to klienci/prospekci operatora).
- **Co NIE jest rozliczalne (`billable=false`, koszt Tomka):** konta testowe fabryki
  (`+alias@`, domeny testowe, `profiles.is_test=true`), operator w trybie impersonacji/podglądu,
  wywołania systemowe/admina, testy E2E na prodzie. To zużycie = koszt własny fabryki (dev/QA).

## 2. Pomiar (co logujemy — kanoniczne `ai_usage` per apka)

Każde wywołanie modelu przez helper AI (`openai-fetch`/`callModelJson`) zapisuje wiersz:

| Kolumna | Opis |
|---|---|
| `id`, `created_at` | — |
| `user_id` | końcowy user, który wywołał (NULL dla system/cron) |
| `area` | `research` / `plan` / `sim` / `report` / inne (funkcja niszy) |
| `model` | np. gpt-5.5, gpt-5.1 |
| `input_tokens`, `cached_tokens`, `output_tokens` | — |
| `cost_usd` | liczony przy zapisie z cennika modelu (SSOT cennika w helperze) |
| **`billable`** | **TRUE tylko dla genuine end-user; ustawiane W EDGE przy zapisie wg §3** |
| `prep_id` / `sim_id` | (opcjonalnie) do drill-downu per przygotowanie/rozmowę |

Zasada: NIE liczymy kosztu z frontu ani szacunkowo — zawsze z realnego `usage` odpowiedzi modelu.

## 3. Klasyfikacja `billable` (egzekwowana W EDGE, nie do obejścia z frontu)

Przy zapisie `ai_usage` edge fn ustala `billable`:
```
billable = true  WTEDY I TYLKO WTEDY gdy:
  - jest user_id (wywołanie userowe, nie system/cron), ORAZ
  - to NIE operator tej apki (is_operator(user_id) = false; impersonacja/podgląd operatora ≠ koszt operatora), ORAZ
  - konto NIE jest testowe: profiles.is_test = false ORAZ email nie pasuje do wzorca testowego
    (settings.ai_billing_test_email_pattern, np. 'tomekniedzwiecki+%@gmail.com' + domeny testowe)
w każdym innym przypadku billable = false
```
- **`profiles.is_test`** — nowa kolumna (default false). Konta zakładane przez fabrykę do QA
  oznaczane `is_test=true` (i tak są kasowane CASCADE, ale w żywym miesiącu muszą być wykluczone).
- Wzorzec e-maili testowych w `settings` (konfigurowalny) — druga warstwa na wypadek nieoznaczonego konta.
- **Wykrycie operatora:** `is_operator()` — jego własne klikanie/impersonacja NIE obciąża jego rachunku.

## 4. Agregacja (per apka, miesięcznie)

Funkcja SQL SECURITY DEFINER `ai_billing_month(p_period date)` → zwraca dla okresu (miesiąc):
- `total_usd`, `total_pln` (rozliczalne), rozbicie po `area` (usd+pln),
- liczniki: aktywni userzy, liczba research/plan/sim/report, tokeny in/out,
- osobno `nonbillable_usd` (koszt własny fabryki — do reconciliacji), z wykluczenia.
Kurs USD→PLN: `settings.ai_billing_usd_pln` (patrz §7).

## 5. Widok operatora — „Zużycie AI" (billing-grade, NIE tylko ops-tile)

Osobna zakładka/sekcja w panelu operatora (odrębna od ops-owego kafla „Koszt AI"):
- **Bieżący okres:** suma zł (rozliczalna), rozbicie po funkcji (Analiza rozmówcy / Plan / Symulacja
  / Ocena), liczba aktywnych userów, liczba przygotowań/symulacji/ocen, (opcjonalnie) top userzy.
- **Historia miesięczna:** tabela okres → zł → liczby.
- **Jasny komunikat:** „To koszt AI Twoich użytkowników — rozliczamy go osobno co miesiąc.
  Nie obejmuje Twoich testów ani podglądów." (transparentność = zero zaskoczenia na fakturze).
- Waluta ZAWSZE zł (kurs pokazany). Zero USD w panelu operatora.

## 6. Widok fabryki (tn-crm) — rozliczenie Tomek↔operatorzy

Apki są w osobnych projektach Supabase → potrzebny CENTRALNY zrzut w tn-crm:
- **Cron miesięczny per apka** (lub push): wylicza `ai_billing_month` i zapisuje do tn-crm
  tabeli `wfa_ai_billing` (project_id, period, total_pln, breakdown jsonb, nonbillable_pln, liczby, created_at).
- **Panel TN App** (nowa sekcja lub w `tn-app/projekt` per projekt + zbiorczy widok): dla każdego
  operatora miesięczne rozliczalne zł AI = kwota do refaktury (obok rev-share). Zbiorczo wszystkie apki.
- **Reconciliacja:** SUMA (billable wszystkich apek + nonbillable wszystkich apek) ≈ rachunek OpenAI
  Tomka za miesiąc. Różnica = koszt czystego dev poza apkami. Pozwala zweryfikować, że refaktura jest pełna.

## 7. Decyzje biznesowe (defaulty przyjęte — do potwierdzenia/retro Tomka)

1. **Kurs USD→PLN:** default `settings.ai_billing_usd_pln` = 4,00 (konfigurowalny per apka/globalnie).
   REKOMENDACJA docelowo: średni NBP (tab. A) z ostatniego dnia okresu + bufor 3% (zmienność FX +
   koszt przewalutowania). Na start stały 4,00 — łatwy do zmiany w settings. **Do decyzji: NBP-auto czy stały.**
2. **Narzut na koszt AI:** default = **pass-through po koszcie** (koszt OpenAI × kurs, ZERO marży) —
   zgodnie z „kasować za to użycie". **Do decyzji Tomka:** czy chce mały narzut (np. +10-15% na
   pokrycie FX/overhead/wahań cennika OpenAI) — ustawialny `settings.ai_billing_markup_pct` (default 0).
3. **Trial userzy = rozliczalni** (są userami panelu / prospektami operatora) — koszt akwizycji
   ponosi operator. Do potwierdzenia; jeśli Tomek chce, dodamy tryb „trial na koszt fabryki".
4. **Kadencja:** rozliczenie miesięczne, zamknięcie okresu 1. dnia następnego miesiąca (zrzut cronem).

## 8. Zabezpieczenie (cap + alert — chroni token Tomka)

- **Alert:** `settings.ai_cost_alert_pln` (per apka) — po przekroczeniu miesięcznego progu billable →
  Slack #aplikacje/#sparing + mail PLATFORM_ALERT_EMAIL (dokładnie raz/okres).
- **Twardy cap (opcjonalny):** `settings.ai_cost_cap_pln` — po przekroczeniu auto-`kill_ai=true`
  (userzy widzą komunikat serwisowy) + alert; zdejmuje Tomek ręcznie. Domyślnie WYŁĄCZONY (NULL).
- Oba dotyczą billable (koszt operatora); nonbillable (testy fabryki) osobny, mniejszy alert do Tomka.

## 9. Standard fabryki (backport)

- `ai_usage` kanoniczne + `billable` + `profiles.is_test` → migracja szablonu startera.
- Klasyfikacja billable w helperze/edge (każda apka AI).
- Funkcja `ai_billing_month` + widok operatora „Zużycie AI" + cron zrzutu do tn-crm.
- tn-crm: `wfa_ai_billing` + panel rozliczeń + reconciliacja.
- Wpis w MODULES.md startera: „każda apka z AI = rozliczenie pass-through per operator".

## 10. Prywatność

Rozliczenie operuje na METADANYCH (tokeny/koszt/liczby/area/user_id), NIGDY na treści przygotowań/
rozmów. Zgodne z regułą „operator widzi liczby, nie treść" i z retencją D10.
