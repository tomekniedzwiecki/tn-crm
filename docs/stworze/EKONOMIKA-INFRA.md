# Ekonomika infrastruktury per aplikacja (zweryfikowane cenniki, 2026-07-11)

> Research W5 z FLOW-AUTONOMIA §10. Kurs orientacyjny 3,9 zł/USD. Źródła: vercel.com/pricing,
> supabase.com/pricing (+billing FAQ), resend.com/pricing, stripe.com/en-pl/pricing, OVH .pl.

## Fakty cennikowe (potwierdzone)
- **Vercel**: Hobby ZAKAZUJE komercji (ToS). Pro = 20 USD/seat/mc (1 seat Tomka), **wiele projektów bez dopłat**;
  1 TB bandwidth + 10 mln req — ogromny zapas dla portfela niszowych apek.
- **Supabase**: Pro = 25 USD/mc per ORGANIZACJA (zawiera 10 USD compute = 1 projekt Micro).
  **Każdy kolejny projekt = ~10 USD/mc (compute NIE jest współdzielony)** → wzór: 25 + 10×(N−1).
  Free pauzuje po ~7 dniach nieaktywności (OK tylko na fazę budowy).
- **Resend**: free = 3k maili/mc, **1 domena**; Pro 20 USD = do 10 domen (≈10 apek); >10 domen → wyższy tier (~35 USD, szacunek).
- **Domeny .pl**: rejestracja promo 5-20 zł, ODNOWIENIE decyduje: **OVH ~73 zł brutto/rok** (nazwa.pl/home.pl 169-220 zł — unikać).
  Cloudflare NIE obsługuje .pl.
- **Stripe**: zero opłat stałych; Standard connected account = 0 zł dla platformy. PL: karty EEA 1,5% + 1 zł, BLIK 1,6% + 1 zł.

## Koszt miesięczny (w portfelu ~10 apek; standalone drożej)
| Faza | / apkę / mc |
|---|---|
| Budowa (free Supabase/Resend + istniejący Vercel Pro) | ~6 zł (domena/12) |
| Produkcja mała (<100 userów) | **~60 zł (~15,5 USD)** |
| Produkcja średnia (100-1000) | ~64-78 zł |

Portfel: 5 apek ≈ 441 zł/mc · 12 apek ≈ 815 zł/mc. Standalone (1. apka bez amortyzacji) ≈ 180 zł/mc.

## Zobowiązanie umowne „12 mies. hostingu Tomka"
**≈ 900-1 100 zł / apkę** (pesymistycznie standalone ~1 900 zł) = **~8% (max 15%) z opłaty 12 500 zł**.
WNIOSEK: infrastruktura NIE jest ryzykiem modelu — upfront pokrywa ją 7-12×. Realne pozycje kosztowe to praca,
rozruch marketingowy i ewentualne AI w produkcie (tokeny — licz per apka osobno, zwykle > hosting).

## Zasady operacyjne
1. Faza budowy na free Supabase (znosić auto-pauzę), przejście na Pro org przy starcie produkcyjnym.
2. Wszystkie apki w JEDNEJ org Supabase Pro (amortyzacja 25 USD) + jedno Vercel Pro + jedno Resend Pro.
3. Domeny wyłącznie OVH; pilnować cen ODNOWIEŃ, nie promocji rejestracji.
4. Próg ~10 apek: sprawdzić limit domen Resend (może wymusić Scale/2. konto).
5. Koszty wpisywać do `biznes_costs` dopiero gdy REALNIE poniesione (start apki), nie prognozy.
