# Research: Program poleceń (referral) dla fabryki aplikacji — pilot Fachmat

> Kontekst: Fachmat = generator ofert PDF dla jednoosobowych instalatorów. 99 zł brutto/mc, trial 14 dni bez karty, subskrypcje Stripe na koncie operatora (Connect, konto connected). Cel: PROSTY, ale realnie zachęcający program poleceń jako ważny kanał wzrostu.
> Data researchu: 2026-07-14. Odbiorca: rzemieślnik/instalator — zero żargonu, telefon w ręku, dzieli się przez WhatsApp/SMS.

---

## 1. Mechaniki zwycięskich programów SaaS — co konwertuje

### Jedno- vs dwustronna nagroda (kluczowy wniosek)
- **Dwustronne (obie strony dostają) konwertują ~2× lepiej.** Programy two-sided konwertują zaproszenia średnio na poziomie **10–25%**, jednostronne około połowy tego. Nagroda po obu stronach usuwa „transakcyjność" i niezręczność polecania. [track360](https://track360.io/blog/saas-referral-program-examples-2026), [Referral Rock](https://referralrock.com/blog/starting-your-saas-referral-program/)
- **Rekomendacja z rynku:** referee (polecony) dostaje zniżkę na start, referrer (polecający) dostaje nagrodę **po opłaceniu pierwszej faktury** przez poleconego. [Referral Rock B2B](https://referralrock.com/blog/b2b-referral-programs/)

### Formy nagrody i co działa u małych/samozatrudnionych
- **Kredyt na abonament / darmowy miesiąc / „waluta produktu"** — najtańszy dla operatora (marginalny koszt bliski zeru) i wiąże nagrodę z retencją. Dropbox płacił **miejscem na dysku**: wzrost podwajał się co 3 miesiące, 23 mln poleceń w miesiąc, +3900% userów w 15 mies. [track360](https://track360.io/blog/saas-referral-program-examples-2026)
- **Gotówka** działa, ale **przyciąga „łowców wypłat", nie fanów produktu** — droga i podatna na abuse; wymaga limitów i kontroli fraudu (casus PayPal: dwustronna gotówka, skuteczna, ale kosztowna). [track360](https://track360.io/blog/saas-referral-program-examples-2026)
- **Kredyt / feature unlock / dodatkowa pojemność przyciągają userów, którym naprawdę zależy na produkcie.** [track360](https://track360.io/blog/saas-referral-program-examples-2026)
- **Moment „aha" > onboarding.** Prośbę o polecenie pokazuj po sukcesie (np. Airtable prosi PO momencie wartości, nie w dniu 1). Ludzie polecają w szczycie satysfakcji — tuż po kluczowym rezultacie lub pozytywnym kontakcie z supportem. [track360](https://track360.io/blog/saas-referral-program-examples-2026)

### Standardowe stawki (i co daje „wysoka" 50%)
- **B2B ogólnie:** 5–25% pierwszej sprzedaży. **SaaS specyficznie:** typowo **15–30%**, przy affiliate nawet 20–70% zależnie od produktu. **SMB / low-touch B2B:** $100–500 albo 10–20% pierwszorocznego MRR/ARR przez 12 mies. [Cello B2B](https://cello.so/complete-guide-to-your-b2b-referral-program/), [Referral Rock](https://referralrock.com/blog/starting-your-saas-referral-program/), [Quora – SaaS commission rates](https://www.quora.com/What-are-standard-referral-commission-rates-for-a-SaaS-business)
- **„Wysoka" 50% jako recurring** to poziom Notion/Webflow (**50% przez ~12 mies.**), ConvertKit/Kit **30% lifetime**. To formalny **program afiliacyjny dla poważnych promotorów** (twórcy, agencje) — nie prosty przycisk „poleć koledze". Wymaga infrastruktury śledzenia i wypłat, obsługi podatków. [track360](https://track360.io/blog/saas-referral-program-examples-2026)

**Wniosek dla Fachmata:** dwustronny + nagroda w **kredycie na abonament** (waluta produktu), przyznawana **po pierwszej płatności**, wyzwalana w momencie „aha". „50% recurring/rev-share" to model dla afiliantów, nie dla masowego, samoobsługowego programu dla rzemieślnika.

---

## 2. „50% — czego?" Porównanie trzech modeli

| Model | Co dostaje polecający | Prostota dla rzemieślnika | Koszt / ryzyko operatora | Anti-abuse |
|---|---|---|---|---|
| **(a) 50% pierwszej płatności jako jednorazowy kredyt** | ~49,50 zł kredytu (raz, po 1. fakturze poleconego) | Wysoka: „połowa pierwszej opłaty tego, kogo polecisz" | Niski, **capowany** (jednorazowo, znany z góry) | Najlepszy: jednorazowe, wpięte w realną płatność |
| **(b) 50% rev-share przez X miesięcy** | ~49,50 zł/mc dopóki polecony płaci | Niska: „procent, dopóki on płaci" — trudne do policzenia | **Wysoki, ciągłe zobowiązanie**; kanibalizuje MRR | Trudniejszy: długi ogon wypłat, trzeba pilnować churnu/fraudu |
| **(c) 50% zniżki dla POLECONEGO + kredyt dla polecającego** | polecony ma taniej na start, polecający kredyt | Wysoka po obu stronach | Niski–średni | Dobry, jeśli zniżka to unikalny kod/link, nie publiczny kupon |

**Werdykt:** Dla samoobsługowego programu masowego **(a) i (c) wygrywają** (proste, tanie, capowane, bezpieczne). **(b) rev-share odradzany jako domyślny** — najlepszy tylko jako osobna ścieżka „ambasador/afiliant" dla nielicznych, którzy polecają hurtowo. Rzemieślnik myśli w **całych darmowych miesiącach**, nie w procentach — dlatego liczbę „50%" najlepiej **przetłumaczyć na abonament** (patrz Rekomendacja). [track360](https://track360.io/blog/saas-referral-program-examples-2026), [Cello](https://cello.so/complete-guide-to-your-b2b-referral-program/)

---

## 3. UX programu

- **Gdzie żyje:** stała pozycja w menu/**sekcji Konta** to minimum („table stakes" — dostępna dla tych, co szukają). Do tego **kontekstowy prompt po momencie „aha"** (np. po wygenerowaniu pierwszej oferty PDF). [Voucherify UX](https://www.voucherify.io/blog/referral-programs-ux-and-ui-best-practices), [track360](https://track360.io/blog/saas-referral-program-examples-2026)
- **Obietnica jednym zdaniem = benefit usera, nie „poleć znajomego".** „Get a free month" bije „Refer a friend"; najlepsze programy (Dropbox, Uber, Robinhood) prowadzą tym, **co user zyskuje**. [Adapty](https://adapty.io/blog/mobile-app-referral-program/), [Voucherify UX](https://www.voucherify.io/blog/referral-programs-ux-and-ui-best-practices)
- **Status:** pokazuj prostą listę — „Zaproszeni: X · Opłacili: Y · Twoje darmowe miesiące: Z". Widoczny kredyt/następna opłata.
- **Udostępnianie dla nie-technicznych (WhatsApp/SMS-first):** ponad **90% bezpośredniego dzielenia się linkami idzie przez WhatsApp i SMS**. Dawaj **przyciski jednym tapnięciem** (WhatsApp, SMS) + **gotową, edytowalną treść wiadomości** — user nie ma pisać pitcha od zera. [SaaSquatch – opcje udostępniania](https://docs.saasquatch.com/success/share-options), [Adapty](https://adapty.io/blog/mobile-app-referral-program/)
- Kopiuj-link jako zapas, ale WhatsApp/SMS na pierwszym miejscu (to kanał instalatorów).

---

## 4. Anti-abuse — minimum

- **Przyznawaj PO PŁATNOŚCI, nie po rejestracji/trialu.** Nagroda tylko po realnej akcji (opłacona pierwsza faktura), nie za sam signup — to zabija główny wektor (farmienie fejkowych kont, zwłaszcza przy trialu bez karty). [Voucherify anti-abuse](https://www.voucherify.io/blog/blowing-the-whistle-how-to-combat-referral-abuse-and-fraud), [Unit21](https://www.unit21.ai/trust-safety-dictionary/referral-fraud)
- **Blokada self-referral:** ten sam e-mail, ta sama karta/`payment_method`, ten sam operator-account, ten sam IP/urządzenie. [Rewardful self-referral](https://www.rewardful.com/self-referral-fraud-detection), [Voucherify](https://www.voucherify.io/blog/blowing-the-whistle-how-to-combat-referral-abuse-and-fraud)
- **Opóźnienie/okno przyznania:** nagroda dopiero po zaksięgowaniu 1. płatności (np. po `invoice.paid`), z buforem na zwroty/chargebacki. [Persona](https://withpersona.com/blog/stop-online-marketplace-referral-fraud)
- **Limity:** cap na liczbę nagradzanych poleceń / kredytu na okres (np. max N miesięcy kredytu/mies.), limit użyć kodu. [Persona](https://withpersona.com/blog/stop-online-marketplace-referral-fraud)
- **Kupony vs kredyty:** zniżka poleconego = **unikalny link/kod**, nie publiczny kupon (publiczny wycieka i jest hurtowo abusowany). Nagroda polecającego = **kredyt na koncie (customer balance)**, nie kod. [Voucherify](https://www.voucherify.io/blog/blowing-the-whistle-how-to-combat-referral-abuse-and-fraud)
- **Red flags do monitoringu:** wiele poleceń z 1 IP, podobne/„disposable" e-maile, konta które płacą i natychmiast churnują, nienaturalnie szybkie konwersje. [Unit21](https://www.unit21.ai/trust-safety-dictionary/referral-fraud)

---

## 5. Implementacja na Stripe (subskrypcje na koncie connected)

**Trzy narzędzia Stripe:**
- **`customer_balance` (Customer Balance Transactions)** — kredyt = **ujemna** kwota na saldzie klienta; **automatycznie** schodzi z następnej sfinalizowanej faktury (do wysokości faktury), z niezmiennym audytem transakcji. Waluta salda musi = waluta faktury. API: `POST /v1/customers/{id}/balance_transactions -d amount=-9900 -d currency=pln`. [Stripe – customer balance](https://docs.stripe.com/billing/customer/balance)
- **Coupon** — zniżka wpinana z backendu (Ty decydujesz kto/kiedy), np. „pierwszy miesiąc 50%" na subskrypcji. Domyślne narzędzie do zniżek na subskrypcji. [Stripe – coupons](https://docs.stripe.com/billing/subscriptions/coupons)
- **Promotion code** — kod dla klienta (owija coupon), gdy user ma go sam wpisać. [Stripe – coupons/promo](https://docs.stripe.com/billing/subscriptions/coupons)

**Co najprostsze i widoczne dla usera:**
- **Nagroda polecającego → `customer_balance` (kredyt ujemny).** Stackuje się przy wielu poleceniach, sam schodzi z kolejnych faktur, nie trzeba nic redeemować. To rekomendowane podejście do „nagrody, która ma się kumulować". [GrowSurf – Stripe credits](https://growsurf.com/integration-guides/stripe-referral-credit-automation/), [Stripe](https://docs.stripe.com/billing/customer/balance)
- **Zniżka poleconego → `coupon`** (once, na 1. fakturę) wpięty przy zakładaniu subskrypcji z linku polecającego; albo **promotion code**, jeśli ma być wpisywany ręcznie. [Stripe – coupons](https://docs.stripe.com/billing/subscriptions/coupons)
- **Connect (uwaga operacyjna):** subskrypcje żyją na koncie **connected (Standard)**, więc kredyty i kupony twórz **na koncie connected** — nagłówek `Stripe-Account: acct_...` z platformowym `sk_live` (klucze `rk_` nie działają z `Stripe-Account`; zob. pamięć „Stripe platform: sk_live + Connect webhooki"). Wyzwalacz przyznania kredytu = webhook Connect `invoice.paid` z filtrem `event.account`.

> Widoczność: kredyt salda obniża „kwotę do zapłaty" na następnej fakturze i jest w historii transakcji. W panelu klienta warto продублować to własnym licznikiem „Twoje darmowe miesiące", bo natywna widoczność salda w Customer Portal bywa dyskretna.

---

## REKOMENDACJA dla fabryki (konkret)

**Program „Miesiąc za miesiąc" — dwustronny, kredyt na abonament, po pierwszej płatności.**

- **Model nagrody:** kredyt na abonament (waluta produktu), NIE gotówka, NIE rev-share.
- **Obustronność: TAK.**
  - **Polecający:** za każde polecenie, które **opłaci pierwszą fakturę** → **kredyt = 1 darmowy miesiąc (99 zł)** na koncie Stripe (`customer_balance`, ujemny), **stackuje się** (2 opłacone polecenia = 2 miesiące gratis).
  - **Polecony:** **pierwszy miesiąc 50% taniej (49,50 zł)** — dodatkowa zachęta obok trialu (coupon `once` / promotion code).
- **„Default 50% czego":** to jest **konfigurowalna dźwignia**. Domyślnie po stronie polecającego rekomenduję **100% jednego miesiąca (99 zł)** — bo rzemieślnik myśli w całych darmowych miesiącach, payback jest w 1 miesiąc (polecony płaci 99 zł/mc recurring), a nagroda i tak jest jednorazowa i capowana. **„50%" żyje po stronie poleconego** (pierwszy miesiąc −50%) oraz jako alternatywne ustawienie polecającego (operator może zejść na 50% miesiąca = 49,50 zł, żeby zmniejszyć koszt). Jeśli trzymać się 50% ściśle: model (a) „50% pierwszej płatności jako jednorazowy kredyt" jest najbezpieczniejszy; rev-share (b) odradzam jako domyślny.
- **Moment przyznania:** dla polecającego — **dopiero po pierwszej udanej płatności poleconego** (webhook `invoice.paid`), nie po rejestracji ani nie po trialu. Kluczowe przy trialu bez karty (bez tego = farma fejków).
- **Forma w Stripe:** kredyt polecającego = `customer_balance` (ujemny, na koncie connected); zniżka poleconego = `coupon`/`promotion_code` na 1. fakturę.
- **Gdzie w produkcie:** sekcja **Konto → „Polecaj i miej gratis"** + kontekstowy prompt po 1. wygenerowanej ofercie PDF (moment „aha”). Udostępnianie **WhatsApp/SMS-first** z gotową treścią.

---

## COPY — propozycje po polsku (język fachowca, zero żargonu)

**Obietnica jednym zdaniem (nagłówek):**
> **„Polecasz kolegę z branży — obaj macie miesiąc Fachmata za darmo."**

**Wyjaśnienie (2–3 zdania):**
> Wyślij swój link koledze. Jak założy konto i opłaci pierwszy miesiąc, my Ci dorzucamy **cały miesiąc gratis** — schodzi automatycznie z Twojej następnej opłaty. On na start ma **pierwszy miesiąc o połowę taniej**. Im więcej osób polecisz, tym dłużej masz za darmo — bez limitu.

**Gotowa wiadomość do WhatsApp/SMS (do wysłania jednym tapnięciem):**
> Cześć, robię teraz oferty dla klientów w Fachmacie — klikasz i masz gotowy PDF z ceną w minutę, wygląda profesjonalnie. Wejdź z mojego linku, pierwszy miesiąc masz 50% taniej: [LINK]

**Mail „dostałeś nagrodę" (po opłaceniu przez poleconego):**
> Temat: Masz miesiąc Fachmata za darmo 🎉
>
> Cześć [Imię],
>
> [Imię poleconego] założył konto z Twojego polecenia i opłacił pierwszy miesiąc. Dzięki!
>
> Dorzuciliśmy Ci **cały miesiąc gratis** — 99 zł zejdzie samo z Twojej najbliższej opłaty, nic nie musisz robić.
>
> Poleć kolejną osobę = kolejny miesiąc za darmo. Twój link masz w koncie, w zakładce „Polecaj i miej gratis”.
>
> Trzymaj się,
> Zespół Fachmat

---

## Anti-abuse — checklista wdrożeniowa

- [ ] Nagroda polecającego przyznawana **tylko po `invoice.paid`** (pierwsza realna płatność), nie po signup/trialu.
- [ ] **Bufor na zwroty/chargeback** przed lub przy przyznaniu (cofnij kredyt, jeśli refund w oknie).
- [ ] **Blokada self-referral:** ten sam e-mail / karta (`payment_method` fingerprint) / operator-account / IP-urządzenie.
- [ ] **Zniżka poleconego = unikalny link/kod**, nie publiczny kupon (żeby nie wyciekł hurtowo).
- [ ] **Nagroda polecającego = kredyt na saldzie**, nie kod do rozdania.
- [ ] **Limity:** cap kredytu/miesiąc (np. max N miesięcy gratis / okres), limit użyć jednego kodu.
- [ ] **Monitoring red flags:** wiele poleceń z 1 IP, disposable e-maile, konta płacące i natychmiast churnujące, nienaturalnie szybkie konwersje.
- [ ] Connect: kredyt/coupon tworzone na koncie **connected** (`Stripe-Account`), webhook z filtrem `event.account`.

---

## Co konfigurowalne przez operatora (per aplikacja w fabryce)

- **Włącz/wyłącz** program poleceń.
- **Model nagrody polecającego:** `pełny miesiąc (100%)` / `pół miesiąca (50%)` / `kwota PLN` / `rev-share X% przez N mies.` (rev-share domyślnie OFF, tryb „ambasador”).
- **Stawka poleconego:** zniżka pierwszego miesiąca (np. 0% / 25% / 50%) lub darmowy miesiąc.
- **Moment przyznania:** po 1. płatności (domyślnie) / po N płatnościach.
- **Cap** liczby nagradzanych poleceń i/lub kredytu na okres.
- **Bufor anti-refund** (dni) przed uwolnieniem kredytu.
- **Teksty:** nagłówek-obietnica, wyjaśnienie, gotowa wiadomość WhatsApp/SMS (edytowalne, z auto-wstawianym linkiem).

---

## Źródła
- [track360 — SaaS Referral Program Examples: 8 Teardowns (2026)](https://track360.io/blog/saas-referral-program-examples-2026)
- [Referral Rock — SaaS Referral Programs: How to Build One That Converts](https://referralrock.com/blog/starting-your-saas-referral-program/)
- [Referral Rock — B2B Referral Programs](https://referralrock.com/blog/b2b-referral-programs/)
- [Cello — Complete Guide to your B2B Referral Program](https://cello.so/complete-guide-to-your-b2b-referral-program/)
- [Quora — Standard referral commission rates for SaaS](https://www.quora.com/What-are-standard-referral-commission-rates-for-a-SaaS-business)
- [Voucherify — Referral UX & UI best practices](https://www.voucherify.io/blog/referral-programs-ux-and-ui-best-practices)
- [Voucherify — How to combat referral abuse and fraud](https://www.voucherify.io/blog/blowing-the-whistle-how-to-combat-referral-abuse-and-fraud)
- [Unit21 — Referral Abuse: Types & Prevention](https://www.unit21.ai/trust-safety-dictionary/referral-fraud)
- [Rewardful — Self-Referral Fraud Detection](https://www.rewardful.com/self-referral-fraud-detection)
- [Persona — Minimizing Marketplace Referral Fraud](https://withpersona.com/blog/stop-online-marketplace-referral-fraud)
- [Adapty — How to build a referral program for your app](https://adapty.io/blog/mobile-app-referral-program/)
- [SaaSquatch — Referral Program Sharing Options](https://docs.saasquatch.com/success/share-options)
- [Stripe — Customer credit balance](https://docs.stripe.com/billing/customer/balance)
- [Stripe — Coupons and promotion codes](https://docs.stripe.com/billing/subscriptions/coupons)
- [GrowSurf — Stripe Referral Credit Automation](https://growsurf.com/integration-guides/stripe-referral-credit-automation/)
