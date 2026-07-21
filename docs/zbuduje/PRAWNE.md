# PRAWNE.md — dokumenty prawne sklepów (krok pl_prawne) · SSOT

**Zasada: szablon RAZ, render WIELE.** Treść prawna żyje WYŁĄCZNIE w szablonach kanonicznych
`templates/prawne-sklepy/`; per sklep podstawiane są tylko dane sprzedawcy + tokeny marki.
Zmiana prawa = edycja szablonów + podbicie `VERSION` + `legal-forge.py update-all`
(wszystkie sklepy naraz). ⛔ Ręczna edycja dokumentów pojedynczego sklepu = ZAKAZ
(ginie przy najbliższym update-all; wyjątki tylko przez `--set` z notą w kroku).

Stan prawny szablonów: **21.07.2026** (research + audyt w sesji 0a6253d4). Wersja: patrz
`templates/prawne-sklepy/VERSION` (marker `<!--PRAWNE-V:…-->` w `<head>` każdej strony).

## 1. KOMPLET STRON (7)

| Szablon | Ścieżka na platformie | Zawartość (podstawa prawna) |
|---|---|---|
| `regulamin.html` | `/regulation` (SYSTEMOWA — linkuje ją kasa platformy i checkout-inline) | §1–§14: sprzedawca, definicje (+przedsiębiorca-konsument art. 38a), zamówienia, ceny (Omnibus: najniższa z 30 dni), płatności (COD), dostawa (uczciwie: magazyny zagraniczne), odstąpienie 14 dni (art. 27–38 UPK), niezgodność towaru z umową (rozdz. 5a: 2 lata, domniemanie, hierarchia, 14 dni odpowiedź), opinie (art. 7 pkt 5 upnpr — nie weryfikujemy), GPSR, ADR bez ODR, zmiany regulaminu z 14-dniowym wyprzedzeniem |
| `polityka-prywatnosci.html` | `/privacy-policy` (SYSTEMOWA) | RODO art. 13: administrator, cele/podstawy (tabela), odbiorcy kategoriami (platforma, kurierzy, dropship-dostawcy, płatności, Meta pixel), transfer poza EOG (DPF/SCC + art. 49.1.b dla logistyki), retencja, prawa + PUODO |
| `zwroty.html` | `/return` (SYSTEMOWA) | Odstąpienie krok-po-kroku, adres zwrotu w PL, „oryginalne opakowanie NIE jest warunkiem", reklamacje (niezgodność), protokół szkody = ułatwienie NIE warunek, ADR |
| `kontakt.html` | `/contact` (SYSTEMOWA) | Pełna identyfikacja + e-mail + telefon (Omnibus), adres zwrotów |
| `dostawa.html` | `/dostawa` (custom) | Metody/koszty (bez kwot na sztywno — koszyk), czasy {{DELIVERY_*}}, **box CŁO od 1.07.2026** (zniesienie zwolnienia 150 EUR; cena = KOŃCOWA, zero dopłat u kuriera), płatności, FAQ |
| `polityka-cookies.html` | `/polityka-cookies` (custom) | Art. 399 PKE (od 10.11.2024): kategorie (niezbędne/analityczne/marketingowe-Meta), zgoda i wycofanie, zarządzanie |
| `odstapienie.html` | `/formularz-odstapienia` (custom) | Wzór = załącznik nr 2 UPK, fakultatywny, print CSS |

Ścieżki systemowe NADPISUJEMY własnym HTML (`publish_landing` działa też na nich) — dzięki
temu kasa platformy i stopki pokazują NASZE treści zamiast „Default".

## 2. ARCHITEKTURA

- **Szablony:** `templates/prawne-sklepy/*.html` — szkielet brand-tokenizowany
  (`{{BG}} {{BG_ALT}} {{BORDER}} {{INK}} {{PRIMARY}} {{ACCENT}} {{FONT_HEAD}} {{FONT_BODY}}
  {{FONTS_LINK}} {{LOGO_URL}} {{FAVICON_URL}}` z `wf2_projects.palette/fonts`), dane
  (`{{BRAND_NAME}} {{DOMAIN}} {{COMPANY_NAME}} {{COMPANY_ADDRESS}} {{NIP}} {{REGON}} {{EMAIL}}
  {{PHONE}} {{RETURN_ADDRESS}} {{DELIVERY_TIME_TYPICAL}} {{DELIVERY_TIME_MAX}} {{UPDATE_DATE}}
  {{DOC_VERSION}} {{YEAR}}`), bloki warunkowe `<!--IF:NIP-->…<!--/IF:NIP-->` (NIP/REGON/PHONE —
  renderer usuwa gdy puste). Linki między dokumentami = `{{*_URL}}` — podmienia `platform-sync`
  (`_substitute`): REGULAMIN→/regulation · POLITYKA→/privacy-policy · ZWROTY→/return ·
  KONTAKT→/contact · DOSTAWA→/dostawa · COOKIES→/polityka-cookies · ODSTAPIENIE→/formularz-odstapienia.
- **Narzędzie:** `scripts/mockup-tools/legal-forge.py`
  - `data <projekt>` — rozwiązane dane + walidacja (wymagane: COMPANY_NAME, COMPANY_ADDRESS, EMAIL).
  - `render <projekt>` — → `sklepy/tomek-niedzwiecki/prawne-<slug>/*.html`.
  - `publish <projekt>` — render + 7× `platform-sync page` + weryfikacja (HTTP 200 + zgodność
    PRAWNE-V przez query-bypass) + `panel-sync` krok `pl_prawne` done (checklista VERBATIM).
  - `update-all [--dry-run] [--force]` — pętla po projektach z `platform_shop_id`
    (lifecycle=active): live-wersja ≠ VERSION → publish. **To jest dźwignia „zmiana prawa".**
- **Dane sprzedawcy:** krok `pl_dane` w portalu klienta (pola: company, nip, regon, address,
  nrb, email_kontakt, phone, return_address — wszystko co jest w dokumentach MA input w portalu).
  Fallback e-maila: `wf2_projects.platform_merchant_email`. Adres zwrotu: `return_address` albo
  adres firmy. Braki wymaganych = STOP (krok `in_progress` z notą; NIE zmyślaj danych;
  nadpisania tylko `--set KLUCZ=WARTOŚĆ` z jawnym źródłem).
- **HOT-UPDATE (portal → sklep, automatycznie):** zapis `pl_dane` w portalu (`wf2-portal`
  `task_save`) odpala w tle `refreshLegalPagesAfterClientEdit`: koalescencja 60 s (klient
  dopisuje kolejne pola), potem odczyt NAJNOWSZYCH danych → render szablonów ze **Storage**
  (`attachments/legal-szablony/` — sync robi legal-forge przy publish/update-all) → 7×
  `publish_landing` przez `wf2-platform` → aktualizacja pola `wersja`/`auto_refresh` kroku
  `pl_prawne` + wpis `legal_refresh` w kronice. Działa TYLKO gdy krok `pl_prawne` jest done
  i dane wymagane kompletne; best-effort (błąd nigdy nie psuje zapisu klienta). Flaga
  `legal_refresh_pending` w data kroku = anty-dubel (okno 5 min). Renderer TS w edge =
  odpowiednik `_render_one` legal-forge — zmiana kontraktu placeholderów wymaga zmiany OBU.

## 3. PROCEDURA KROKU pl_prawne (sort 50 — po pl_dostawy, PRZED produktami/landingami)

1. `python scripts/mockup-tools/legal-forge.py data <projekt>` — walidacja.
2. `python scripts/mockup-tools/legal-forge.py publish <projekt>` — reszta automatyczna.
3. Kolejność ma znaczenie: strony prawne publikujemy PRZED landingami, żeby linki stopek
   (footer@1: Regulamin·Polityka·Cookies·Zwroty·Dostawa·Kontakt) nigdy nie były martwe.

## 4. ZASADY TREŚCI — ZAKAZY (egzekwowane w szablonach; gate `published` łapie martwy ODR)

⛔ **Link do platformy ODR** (`ec.europa.eu/consumers/odr`) — wygaszona 20.07.2025
(rozp. 2024/3228). Wzmianka tekstowa o wyłączeniu = OK; zamiast niej ADR: rzecznicy
konsumentów, WIIH, `prawakonsumenta.uokik.gov.pl`, wykaz UE `consumer-redress.ec.europa.eu`.
⛔ Klauzule abuzywne (rejestr UOKiK): zmiana regulaminu „bez uprzedzenia" · „nie odpowiadamy
za kuriera" · zwrot „tylko w oryginalnym opakowaniu" · sąd właściwy sprzedawcy · wyłączenie
odpowiedzialności za różnice zdjęcie/produkt · warunkowanie reklamacji protokołem szkody.
⛔ „Wysyłka 24h" / „wysyłka z Polski" (dropshipping = nieuczciwa praktyka rynkowa) ·
nazwy operatorów płatności i przewoźników (zmienne — opisujemy rodzajowo) · nazwy platform
(Trevio/TakeDrop) · sygnatury wyroków · Google Analytics (sklepy używają analityki platformy).
✅ Terminologia konsumencka: „niezgodność towaru z umową" (rękojmia tylko B2B).
✅ Cło (od 1.07.2026): obietnica DDP — „cena końcowa, zero dopłat u kuriera" (cło ryczałtowe
3 EUR/pozycję rozlicza sprzedawca; wliczone w koszty — patrz CENNIK-PLAN §2g).

## 5. STAN PRAWNY 21.07.2026 (kotwice przyszłych aktualizacji)

| Co | Od kiedy | W szablonach |
|---|---|---|
| UPK: odstąpienie 14 dni, wzór zał. 2, brak pouczenia = +12 mies. | obowiązuje | regulamin §8, odstapienie, zwroty |
| Niezgodność towaru z umową (rozdz. 5a): 2 lata, domniemanie 2 lata, hierarchia | 01.01.2023 | regulamin §9, zwroty |
| Omnibus: najniższa cena 30 dni, weryfikacja opinii, telefon | 01.01.2023 | regulamin §5/§10, kontakt |
| Wygaszenie ODR (rozp. 2024/3228) | 20.07.2025 | regulamin §13, zwroty (bez linku!) |
| PKE art. 399: opt-in cookies opcjonalne | 10.11.2024 | polityka-cookies |
| Reforma celna: koniec zwolnienia 150 EUR; ryczałt 3 EUR/pozycję (do 1.07.2028) | 01.07.2026 | dostawa (box cło), regulamin §5 |
| GPSR (2023/988) + pol. ustawa (kary do 1 mln zł) | 13.12.2024 / 03.01.2026 | regulamin §11 |
| EAA dostępność — mikroprzedsiębiorca-usługodawca ZWOLNIONY | 28.06.2025 | — (nie dotyczy) |
| Prawo do naprawy (dyr. 2024/1799, AGD/elektronika: +12 mies. po naprawie) | implementacja PL do 31.07.2026 | ⏳ klauzula do aktywacji przy pierwszym produkcie AGD/RTV |

## 6. OBOWIĄZKI POZA DOKUMENTAMI (nie załatwia ich ta strona — pilnować osobno)

1. **Baner zgód cookies (CMP)** — platforma wstrzykuje pixel Meta server-side PRZED zgodą
   na wszystkich stronach = luka PKE/RODO **po stronie platformy**. Nota do Adriana
   (wf2_notes 21.07, id 1f936186). Polityka cookies opisuje model docelowy.
2. **GPSR per produkt** — osoba odpowiedzialna w UE + dane producenta + ostrzeżenia powinny
   być PRZY OFERCIE (landing/karta produktu). Fabryka landingów tego dziś nie podaje —
   kandydat na przyszły krok (dane z DataHub/dostawcy). Regulamin §11 = klauzula ogólna.
3. **BDO** — sklep wysyłający towar w opakowaniach = „wprowadzający opakowania": wpis do BDO
   + sprawozdanie roczne (do 15.03). Dotyczy KLIENTÓW (sprzedawców) — informacja przy
   onboardingu wspólnika, nie w dokumentach sklepu.
4. **Rejestr VAT/IOSS** — decyzja podatkowa per sprzedawca (poza fabryką).

## 7. PUŁAPKI

- **Weryfikacja świeżości po publish**: edge platformy cache'uje per URL wielogodzinnie —
  treść sprawdzaj przez query-bypass (`?lfv=…` robi to legal-forge), goły URL może być stary
  (README platforma-api §CACHE — DWA POZIOMY). Realni użytkownicy zobaczą nową wersję po
  wygaśnięciu edge / po purge Adriana.
- **Origin-snapshot pojedynczej ścieżki bywa ZAMROŻONY** (empirycznie 21.07: /regulation
  ignorował 3 kolejne PUT-y i unpublish przez >40 min, gdy sąsiednie ścieżki odświeżały się
  normalnie). legal-forge traktuje „200, ale stara wersja" jako **WARN** (PUT przyjęty,
  propagacja asynchroniczna) — ustaw monitor na marker PRAWNE-V, NIE ponawiaj publish
  w pętli. Twardy FAIL = tylko HTTP ≠ 200 / błąd renderu.
- **Checklisty kroku** = VERBATIM stała `CHECKLIST` w legal-forge ↔ obiekt `WS` w
  `tn-sklepy/projekt.html` (zmiana tekstów = zmiana w OBU + nadpisanie zapisanych checklist).
- **Strony systemowe** (`/regulation` itd.) nadpisane custom-HTML: `unpublish` na nich
  przywraca „Default" platformy — nie robić bez ponownego publish.
- Szablony NIE zawierają NRB — konto do zwrotów COD podaje konsument w oświadczeniu
  (zwrot „tą samą metodą" przy COD = przelew na wskazane konto).

## CHANGELOG

- **1.0 (21.07.2026)** — pierwszy kanon: 7 szablonów (research prawny lipiec 2026 + audyt
  zestawów v1/Trafionek), legal-forge.py (data/render/publish/update-all + sync szablonów do
  Storage), HOT-UPDATE portal→sklep w wf2-portal (zapis pl_dane = auto re-publish 7 stron),
  krok pl_prawne sort 95→50 + milestone, portal pl_dane +phone/+regon/+return_address,
  footer@1 +Cookies, gate `published` +COOKIES_URL/ODSTAPIENIE_URL +martwy-ODR,
  hotfix ODR na live Trafionka (§9 regulaminu).
