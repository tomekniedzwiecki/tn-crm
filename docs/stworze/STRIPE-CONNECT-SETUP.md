# Stripe Connect — jednorazowa aktywacja platformy (instrukcja dla Tomka)

> ✅ **WYKONANE 2026-07-13** (przy kroku stripe_plany fachmata). Platforma: `acct_1TshmjPfs96MHB0x`;
> `STRIPE_PLATFORM_SECRET` (pełny sk_live) + `STRIPE_PLATFORM_SECRET_TEST` + `STRIPE_CONNECT_WEBHOOK_SECRET`
> w sekretach edge tn-crm. **Kolejne aplikacje: ZERO akcji Tomka w Stripe** — sesja fabryki tworzy konto
> klienta, plany, webhook i sekrety sama (wzorce: fachmat 13.07, Dobry Wstęp 16.07). Poniższa instrukcja
> zostaje jako referencja historyczna.

> Model (zaakceptowany 2026-07-11): konto Tomka = platforma Connect; klient-operator = **Standard connected account**
> (własne KYC, własny dashboard, merchant of record); płatności userów aplikacji = **direct charges** na koncie klienta;
> % Tomka pobierany automatycznie jako **application fee** przy każdej transakcji (w tym każdej fakturze subskrypcji).
> Prowizję Stripe ponosi klient (zapis w umowie). % konfigurowalny per projekt: `wfa_projects.fee_percent` (domyślnie 10).
>
> **⚠️ Udział = NETTO + VAT (decyzja Tomka 23.07.2026).** `fee_percent` (i env `APP_FEE_PERCENT`) to stawka **NETTO** (10) — „10%"
> w umowie/panelu zostaje prawdą. Kwota faktycznie pobierana przez application fee to **BRUTTO**: NETTO × `VAT_RATE` (1.23).
> Realizacja w kodzie fabryki (`_shared/stripe.ts` → `VAT_RATE`; `applicationFeeAmount()` dla płatności jednorazowych,
> `application_fee_percent = feePct × VAT_RATE` dla subskrypcji). NIE zmieniamy danych ani env — mnożnik jest w kodzie.

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
   - Developers → API keys: `STRIPE_PLATFORM_SECRET` = **PEŁNY Secret key `sk_live_…`** (Reveal live key).
     ⚠️ Klucz **restricted (`rk_live_…`) NIE zadziała** — nie może wykonywać operacji na kontach połączonych
     przez nagłówek `Stripe-Account` (błąd „Please use a different key", empirycznie fachmat 13.07),
     a cały model direct charges na tym stoi (plany, webhooki, checkout). Klucz trafia do sekretów
     Supabase (tn-crm + per aplikacja jako `STRIPE_SECRET_KEY`) — NIGDY do repo/frontu; wyciek = roll
     w Dashboard + podmiana sekretu we wszystkich apkach.
   - Developers → Webhooks: endpoint typu **Connect** (events: `account.updated`) już istnieje →
     `wfa-stripe-webhook` (auto-odhaczanie KYC/BLIK). Webhooki APLIKACJI też są typu Connect na platformie —
     kont **Standard nie da się** obsłużyć webhookiem per-account przez API (`403 oauth_not_supported`);
     dlatego `stripe-webhook` każdej apki MUSI filtrować `event.account != STRIPE_ACCOUNT_ID` (jest w starterze).
6. **Test mode:** przełącz Dashboard na test mode i sprawdź, że Connect działa też w trybie testowym
   (pierwszą integrację przetestujemy w całości na test keys: onboarding → checkout → application fee widoczny).

## Co potem dzieje się automatycznie (per aplikacja, w workflow /tn-app)

- Krok `stripe_kyc` (klient): generujemy Account Link → klient sam zakłada konto Standard i przechodzi KYC
  (dokumenty, konto bankowe). Zapisujemy `acct_…` w projekcie.
- Krok `stripe_plany` (my): produkty/ceny tworzone NA KONCIE KLIENTA (direct), application fee = `fee_percent`% NETTO × 1.23 VAT
  (pobór BRUTTO, decyzja 23.07.2026 — `VAT_RATE` w `_shared/stripe.ts`); webhook aplikacji z weryfikacją sygnatury i idempotencją.
- Twój % ze wszystkich aplikacji: Dashboard → Connect → **Application fees** (zbiorczo, bez własnej księgowości).

## Uwagi

- NIE wybieramy Express (koszt ~2 USD/mies./konto + 0,25% payout) ani Custom (platforma bierze na siebie AML/compliance).
- Do umowy z klientem: klient ponosi prowizje Stripe (~1,5–2,9% + stała opłata), Tomek pobiera `fee_percent`% od przychodu.
- Rachunki/faktury dla userów aplikacji wystawia klient (merchant of record) — jego NIP, jego regulamin.
