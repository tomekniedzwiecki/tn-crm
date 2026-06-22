# TakeDrop checkout — ustalenia z sondy live (2026-06-10, kafina.pl)

Sonda: Playwright na https://kafina.pl/checkout?products=103052934-321258604 (mobile 390px + desktop).
Dotyczy CAŁEGO pipeline — każdy sklep klienta ma ten sam checkout TakeDrop.

## Twarde fakty techniczne
1. **URL nie przyjmuje ilości** — testowane formaty `ID-VARIANT:2`, `&quantity=2`, `ID,ID` (duplikat), `ID-VARIANT-2` → zawsze „1 szt.", Razem 299 zł. Quantity breaks TYLKO przez osobne produkty/warianty w TakeDrop (np. „2-pak" z własnym ID → landing linkuje inny checkout URL).
2. **Pole kodu promocyjnego ISTNIEJE** (ukryte za „Mam kod") → legalny exit-intent z realnym kodem jest wykonalny. **Prefill przez URL NIE działa** (`?code=`, `?promoCode=`, `?discountCode=` ignorowane) → w popupie dać przycisk „kopiuj kod" + instrukcję „wklej w polu Mam kod".
3. Formularz zbiera **telefon i e-mail** (pola wymagane) — ale dopiero na checkoucie; porzucenie PRZED wejściem w checkout = zero danych do recovery. E-mail/tel capture na landingu (Supabase) domyka tę lukę.
4. Dostawa: Płatność przy odbiorze **+19 zł** (badge „Najlepszy wybór"!), Kurier 0 zł, Paczkomaty InPost 0 zł. Darmowa dostawa istnieje, ale landing komunikuje ją słabo (2 wzmianki drobnym drukiem).

## Zabójcy zaufania na checkoucie (ostatnia mila!)
5. **`<title>` = „Twój sklep - super okazje!"** — domyślny placeholder TakeDrop. Widoczny w karcie przeglądarki w momencie wpisywania danych karty.
6. **Metoda płatności = radio z napisem „Stripe"** + logo stripe. Polski klient nie wie co to Stripe; brak logotypów BLIK/P24/Visa przy wyborze.
7. **Zero elementów trust na checkoucie** — żadnej wzmianki o 30 dniach zwrotu, 2 latach gwarancji, bezpieczeństwie płatności; stopka „Powered by TakeDrop".
8. **Brand whiplash**: landing premium (coal/brass/ivory, Rugged Heritage) → checkout generyczny biały szablon z czerwonymi akcentami i zaokrąglonym fontem. Pełna nawigacja sklepu (szukajka, wishlist, koszyk) = drogi ucieczki.
9. Szary przycisk „Złóż zamówienie" w trakcie scrolla wygląda jak disabled.

## Do zweryfikowania w panelu TakeDrop (per sklep)
- Czy da się zmienić title/nazwę sklepu (na pewno — placeholder).
- Czy panel pozwala wstrzyknąć custom CSS/HTML na checkout (restyling + trust block).
- Czy da się zmienić etykietę metody płatności („BLIK / karta / Przelewy24" zamiast „Stripe").
- Czy da się tworzyć kody promocyjne (pole istnieje, więc tak) — potrzebne do exit-intent.
- Czy COD może być 0 zł / inaczej opisany; kto kontroluje badge „Najlepszy wybór".
