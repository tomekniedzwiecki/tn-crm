# Stripe Connect — jednorazowa aktywacja platformy (instrukcja dla Tomka)

> Model (zaakceptowany 2026-07-11): konto Tomka = platforma Connect; klient-operator = **Standard connected account**
> (własne KYC, własny dashboard, merchant of record); płatności userów aplikacji = **direct charges** na koncie klienta;
> % Tomka pobierany automatycznie jako **application fee** przy każdej transakcji (w tym każdej fakturze subskrypcji).
> Prowizję Stripe ponosi klient (zapis w umowie). % konfigurowalny per projekt: `wfa_projects.fee_percent` (domyślnie 10).

## Krok po kroku (Dashboard Stripe, ~20 minut)

1. **Zaloguj się na główne konto Stripe** (to konto będzie zbierać Twój % ze wszystkich aplikacji).
2. **Włącz Connect:** Dashboard → **Connect** (menu boczne) → „Get started" / „Enable Connect".
   - Stripe zapyta o rolę platformy. Odpowiedzi zgodne z naszym modelem:
     - Kto jest merchant of record / kto obsługuje spory i zwroty → **connected account (klient)**.
     - Typ kont → **Standard**.
     - Kto płaci opłaty Stripe → **connected account (klient)** (przy direct charges to domyślne).
   - Zaakceptuj **Connect Platform Terms** (prawnie wiążące — czytaj świadomie).
3. **Uzupełnij profil platformy:** Connect → Settings:
   - Dane firmy (Twoja DG), nazwa platformy widoczna dla klientów przy onboardingu (np. „Tomek Niedźwiecki — Aplikacje"),
     e-mail supportu, adres strony (tomekniedzwiecki.pl).
   - **Branding onboardingu** (logo, kolor akcentu) — jednorazowo, współdzielone przez wszystkie aplikacje.
4. **Payment methods:** upewnij się, że na koncie platformy aktywne są karty + **BLIK** (Settings → Payment methods).
   BLIK trzeba będzie włączać także na każdym koncie klienta (to zrobi nasz onboarding / klient w swoim dashboardzie).
5. **Klucze i webhook Connect:**
   - Developers → API keys: zanotuj, że będziemy używać kluczy platformy w edge functions aplikacji
     (per aplikacja trafią do sekretów Supabase — NIE wysyłaj mi ich na czacie, wkleisz przy kroku `env_secrets`).
   - Developers → Webhooks → „Add endpoint" typu **Connect** (events: `account.updated`) — zrobimy przy pierwszej
     aplikacji (krok `stripe_plany` w workflow), na razie nic nie klikaj.
6. **Test mode:** przełącz Dashboard na test mode i sprawdź, że Connect działa też w trybie testowym
   (pierwszą integrację przetestujemy w całości na test keys: onboarding → checkout → application fee widoczny).

## Co potem dzieje się automatycznie (per aplikacja, w workflow /tn-app)

- Krok `stripe_kyc` (klient): generujemy Account Link → klient sam zakłada konto Standard i przechodzi KYC
  (dokumenty, konto bankowe). Zapisujemy `acct_…` w projekcie.
- Krok `stripe_plany` (my): produkty/ceny tworzone NA KONCIE KLIENTA (direct), application fee = `fee_percent` projektu;
  webhook aplikacji z weryfikacją sygnatury i idempotencją.
- Twój % ze wszystkich aplikacji: Dashboard → Connect → **Application fees** (zbiorczo, bez własnej księgowości).

## Uwagi

- NIE wybieramy Express (koszt ~2 USD/mies./konto + 0,25% payout) ani Custom (platforma bierze na siebie AML/compliance).
- Do umowy z klientem: klient ponosi prowizje Stripe (~1,5–2,9% + stała opłata), Tomek pobiera `fee_percent`% od przychodu.
- Rachunki/faktury dla userów aplikacji wystawia klient (merchant of record) — jego NIP, jego regulamin.
