# MODUŁ POLECENIA (referral) — koncept fabryki

> Standard fabryki TN App (decyzja Tomka 14.07). Uniwersalny — buduje się w starterze, każda apka dziedziczy.
> Oparty na researchu: `docs/stworze/research-polecenia.md`. Krok workflow: `polecenia` (E3, sort 86);
> uruchomienie jako kanał → dopisane do `gtm_50` (E6). Rozszerza istniejący zalążek `referral` (kod + ?ref).

## Model (z researchu — „Miesiąc za miesiąc", dwustronny, kredyt Stripe, po pierwszej płatności)

- **Dwustronny** (konwertuje ~2× lepiej): polecający i polecony oboje zyskują.
- **Polecający:** za każde polecenie, które **opłaci pierwszą fakturę** → kredyt na abonament
  (`customer_balance`, ujemny) — DOMYŚLNIE **cały miesiąc gratis** (100% ceny mies.); **stackuje się**.
- **Polecony:** pierwszy miesiąc **taniej** (DOMYŚLNIE −50%) — coupon `once` wpięty z linku polecającego.
- **Przyznanie:** dopiero webhook Connect `invoice.paid` poleconego (NIE po rejestracji/trialu — krytyczne
  przy trialu bez karty; inaczej farma fejków). Bufor anti-refund (dni) przed uwolnieniem.
- **Forma w Stripe (konto connected):** kredyt polecającego = customer balance transaction; zniżka poleconego
  = coupon/promotion. Klucz platformy `sk_live` + `Stripe-Account` (rk_ nie działa — pamięć). Wyzwalacz =
  Connect webhook z filtrem `event.account` (istniejący stripe-webhook + processor).

> „50%": to dźwignia KONFIGUROWALNA. Tomek chce domyślnie wysoką stawkę — dajemy hojnie: polecony −50% na
> start, polecający cały darmowy miesiąc. Operator może to zmienić (patrz Konfiguracja). Rev-share (50% przez
> N mies.) = tryb „ambasador", domyślnie OFF (drogie, ciągłe zobowiązanie — research odradza jako domyślny).

## UX (prosty, ale zachęcający — marketing = ważny kanał)

- **Gdzie:** sekcja **Konto → „Polecaj i miej gratis"** (stała) + **kontekstowy prompt po momencie aha**
  (np. po 1. wygenerowanej ofercie: „Podoba się? Poleć kolegę — obaj macie miesiąc gratis").
- **Obietnica jednym zdaniem = korzyść usera:** „Polecasz kolegę z branży — obaj macie miesiąc {{APP_NAME}}
  za darmo." (nie „poleć znajomego"). Wyjaśnienie 2-3 zdania (z researchu, edytowalne przez operatora).
- **Udostępnianie WhatsApp/SMS-FIRST** (>90% dzielenia linków tym kanałem u tej grupy): przyciski jednym
  tapnięciem (WhatsApp / SMS) z GOTOWĄ, edytowalną treścią + auto-wstawiony link; „Kopiuj link" jako zapas.
- **Status (prosty licznik):** „Zaproszeni: X · Opłacili: Y · Twoje darmowe miesiące: Z" + info o najbliższej
  obniżonej opłacie. Własny licznik (natywne saldo Stripe w portalu jest dyskretne).
- Mail „dostałeś nagrodę" (layout z MODUŁ-WIADOMOSCI) po opłaceniu przez poleconego.

## Anti-abuse (minimum z researchu — wpisane w budowę)
- Przyznanie tylko po `invoice.paid` (nie signup/trial). Bufor na refund/chargeback (cofnij kredyt w oknie).
- Self-referral blokada: ten sam e-mail / `payment_method` fingerprint / operator-account / IP-urządzenie.
- Zniżka poleconego = unikalny link/kod (nie publiczny kupon). Nagroda polecającego = kredyt salda (nie kod).
- Limity: cap nagradzanych poleceń / kredytu na okres; limit użyć kodu.
- Monitoring red flags (wiele poleceń z 1 IP, disposable maile, płać-i-churn) — log do przeglądu operatora.

## Konfiguracja operatora (per apka — tab „Polecenia" w panelu operatora)
- Włącz/wyłącz program.
- Nagroda polecającego: `pełny miesiąc (100%)` [default] / `pół miesiąca (50%)` / `kwota PLN` / `rev-share X% × N mies.` (OFF default).
- Zniżka poleconego: 0 / 25 / **50%** [default] / darmowy miesiąc.
- Moment: po 1. płatności [default] / po N. Cap poleceń/kredytu. Bufor anti-refund (dni).
- Teksty: nagłówek-obietnica, wyjaśnienie, gotowa wiadomość WhatsApp/SMS (edytowalne, auto-link).
- Stats: zaproszeni / opłacili / kredyt wypłacony / konwersja; lista poleceń ze statusem.

## Schemat (do 03/migracji apki — rozszerza referral startera)
- `profiles.referral_code` (jest), `profiles.referred_by` (jest) — dołożyć: `referral_reward_state`
  (pending/credited/refunded), znaczniki anti-abuse (payment_fingerprint, signup_ip).
- `referrals` (nowa): referrer_id, referee_id, status (invited/paid/rewarded/refunded), reward_amount,
  credited_at, stripe_balance_txn_id, coupon_id, flags jsonb. RLS: referrer widzi swoje; operator wszystkie
  (przez edge). Kredyt nakłada się przez edge (service-role → Stripe connected), nie z frontu.
- `app_settings`: `referral_config` (jsonb — wszystkie parametry operatora).

## Zakres per warstwa
- **STARTER (uniwersalne):** pełna mechanika (edge `referral` rozbudowa: get_link/stats + handler `invoice.paid`
  w processorze nakładający kredyt+coupon z anti-abuse), tab „Polecenia" operatora, sekcja Konto usera z
  WhatsApp/SMS share, prompt aha (hook), `referral_config` z defaultami (hojnymi), migracja `referrals`.
- **APKA (per nisza):** teksty (obietnica/WhatsApp) pod język niszy; moment aha wpięty w kluczową akcję niszy.

## Uruchomienie jako kanał (krok `gtm_50`, E6)
Włączenie programu, ustawienie stawki, przygotowanie materiałów do dzielenia (grafika/tekst dla operatora do
jego sieci), wpięcie promptu aha — polecenia jako element planu 0→50 klientów (research: sieć operatora +
polecenia to najtańszy kanał przy niskim ACV).
