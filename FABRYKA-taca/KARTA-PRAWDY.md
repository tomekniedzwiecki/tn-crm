# KARTA PRAWDY PRODUKTU — Rozmrozik (box do szybkiego rozmrażania)

Źródło: `bud_tt_products.ali_snapshot` (source=**detail**, fetched 2026-07-17, refresh 2026-07-22)
· aukcja `1005011774118215` · projekt wf2 `448f2395` (Ulepszek) · produkt `60215ce4-a1bb-4af3-a850-f28d1ce0442b`

## 0. Tożsamość
- Klasa produktu: **elektryczny box do rozmrażania żywności** (taca + przezroczysta kopuła +
  zdejmowany moduł z generatorem plazmy i lampą UVC, panel dotykowy LED, ładowanie USB-C).
  Tytuł aukcji: "Type-C Charging Defrosting Box Ultra-fast Fresh Recovery Machine Beef Frozen
  Food Meat Seafood Defrosting Plate". Kategoria Ali (WEWNĘTRZNA): Specialty Tools / Dom & Kuchnia.
- Mini-marka: **Rozmrozik** · slug `rozmrozik` (rezerwacja bud_brand_names — patrz F0).
- ⚠️ Galeria aukcji miksuje 2 produkty — g6/g7 (pasywna taca) NIE są naszym produktem (GALERIA.md).

## 1. Cena
- Koszt zakupu (sku_prices): black **$65.66** · white **$65.66** (sale; original $65.67).
- Kurs NBP zapisany przy kalkulacji 2026-07-22: **3.7945 PLN/USD** → koszt 249,15 zł.
- **NASZA cena PL = 289,00 zł** (ODCZYT z `wf2_products.price`, krok kalkulacja done; narzut 14%,
  zysk 34,07 zł po prowizji). Jedna cena dla obu wariantów. [KONKRET-SKU]
- Cena zapieczona w HTML MUSI == `wf2_products.price` (gate `cena_panel`).

## 2. Specyfikacja (specs 1:1, puste pominięte)
| Cecha | Wartość |
|---|---|
| Brand Name | NONE |
| Origin | Mainland China |
| Require Food Contact | No |
| High-concerned chemical | None |
| Type | Specialty Tools |

⚠️ Specs UBOGIE — ZERO liczb (wymiary/waga/moc/czas NIEZNANE → żadnych zmyślonych wartości).
⚠️ „Require Food Contact: No" — NIE claimować „food-grade / bezpieczny kontakt z żywnością".

## 3. Opis sprzedawcy — DESTYLACJA
Opis HTML aukcji: PUSTY. Fakty pochodzą z tytułu + galerii detail (infografiki = DANE):
- FAKT [tytuł]: ładowanie **USB-C (Type-C)**; przeznaczenie: mięso / mrożonki / owoce morza.
- FAKT [galeria g3]: pojemność komory **4,2 L**; mieści **4 steki lub 4 porcje ryby** naraz.
- FAKT [galeria g3/g1]: start jednym dotknięciem („One Click Start"), panel dotykowy z LED.
- FAKT [galeria g4]: budowa: radiator, **generator plazmy**, elementy **NTC**, kopuła **PS**
  (przezroczysta pokrywa chroniąca przed kurzem), **płyta rozmrażająca ze stopu aluminium**,
  **tacka ociekowa ABS** (zbiera wodę z rozmrażania).
- FAKT [galeria g4]: funkcje wg producenta: „Plasma Locking" (plazma), „UVC Antibacterial"
  (lampa UVC o działaniu antybakteryjnym) — BEZ liczb (żadnych „99,9%").
- BEŁKOT (CUT): „Ultra-fast", „Fresh Recovery Machine", „Eco-friendly", „Natural and Safe",
  „Aviation Heat Conduction" (kadr g6 = inny produkt!).
- WĄTPLIWE (CUT): jakikolwiek konkretny CZAS rozmrażania (brak danych); „bez prądu" (jest
  elektryczny); wszystko z kadrów g6/g7 (inny produkt).

## 4. Warianty
| Oryg. | PL | Koszt USD | Swatch? |
|---|---|---|---|
| black | Czarny | $65.66 | ✅ (cała galeria pokazuje czarny) |
| white | Biały | $65.66 | ❌ BRAK dowodu koloru w galerii → wariant bez swatcha wizualnego; na stronie tylko wybór tekstowy (albo pominąć wariant biały — decyzja F1) |

MODEL CENY: JEDNA cena PL 289,00 zł; wariant = wybór estetyczny.

## 5. Dowód
- `sold_volume` = **25** (globalne Ali) → PONIŻEJ progu 1000 → **ZAKAZ jakiejkolwiek frazy
  o sprzedaży**; rola wyłącznie wewnętrzna.
- `review_stats`: avg 5,0 · **N=5** · 100% pozytywnych → **N za małe: ZAKAZ social-proof
  liczbowego na stronie** (żadnych „★5,0 · 5 ocen"). Opinie: 5 szt., generyczne EN
  („AliExpress Shopper", bez zdjęć, bez text_pl) → sekcja opinii = SKIP (stan danych).
- `video_url` aukcji: BRAK.
- `shop`: „European stores Store" — 🚫 NIGDY na stronie (white-label; grep gate F6).
- Wideo dodane do produktu (LL-044, pula → sekcja WIDEO, kolejność deterministyczna):
  1. tiktok_url (jawnie dodany): https://www.tiktok.com/@sam.shan.shops/video/7634292430455475476 (10 087 145 plays)
  2. videos_curated.items wg plays DESC: @apieceofmyglamhome 288 878 · @aliexpress.us 165 319 ·
     @dailydeals.tiktokshop 92 438 · @crystelmontenegrohome 24 321 (limit 5 kafli; reszta puli: 6 562 / 6 030 / 316)
  ⚠️ items = auto_match po tekście zapytania — pokazuję 1:1 bez oceny (LL-044); klip
  niepobieralny yt-dlp = pomiń z notą.

## 5b. Handel / Checkout (kotwica dla claimów płatności i zwrotu)
- Płatność: **przy odbiorze (COD)** oraz **BLIK / płatność online** — metody kasy sklepu
  Ulepszek na platformie (checkout-inline; delivery-methods z isCashOnDelivery).
- Zwrot: **14 dni** od otrzymania — ustawowe prawo odstąpienia konsumenta (art. 27 UoPK);
  strona /return sklepu. Żadnych rozszerzonych gwarancji (brak danych).
- Dostawa: koszt wg wybranej metody w podsumowaniu kasy; ZERO deklaracji „darmowa dostawa"
  i ZERO obietnic czasu doręczenia.

## 6. Galeria
→ `bud_tt_products.gallery_curated` + `FABRYKA-taca/GALERIA.md`. Klasa R na stronę: TYLKO g0.

## 7. Wskaźniki
→ `FABRYKA-taca/PASZPORT.md` (cechy dyskryminujące + model użycia) · `videos_curated` (pula wideo).

## ZAKAZY TWARDE tego landingu
1. Zero liczb spoza tej karty (czas rozmrażania, moc, wymiary, waga = BRAK DANYCH).
2. Zero claimów zdrowotnych/sanitarnych z liczbami („zabija 99,9% bakterii"); dozwolone TYLKO
   „lampa UVC o działaniu antybakteryjnym" (kotwica: galeria g4).
3. Zero social-proof liczbowego (5 ocen / sold 25) i pseudo-liczników.
4. Zero „food-grade/atest do żywności" (spec: Require Food Contact=No).
5. Zero nadruku „KAYUSO" i watermarków na jakimkolwiek materiale strony.
6. Zero kadrów/claimów z g6/g7 (inny produkt — pasywna taca, „aviation heat conduction").
7. Shop-name NIGDY. Zero fałszywej pilności/przecen.
