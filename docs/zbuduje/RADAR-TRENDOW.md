# RADAR TRENDÓW — fundament wyboru produktów (SSOT)

> Stan: 2026-07-16 (commity `c7ad0a77`, `17348c10`, `d0febfc4`, `3b3e5358`). Ten plik = źródło
> prawdy o architekturze i operacjach radaru. Cel biznesowy: znajdować produkty, które
> **dobrze się sprzedają na TikTok Shop**, dopasowywać je na AliExpress i podawać sprzedawcom
> do sklepów jednoproduktowych.

## Zasady nadrzędne (decyzje Tomka, 2026-07-16)

1. **Sprzedaż > viral.** Sygnałem jest licznik sprzedanych sztuk z TikTok Shop, nie odtworzenia wideo (audyt: heat NIE koreluje ze sprzedażą).
2. **Zbieramy WYŁĄCZNIE produkty obecne w TikTok Shop** (`requireShop=true` w skanie hashtagowym; shop-radar spełnia z definicji). Dają dowód sprzedaży + packshoty.
3. **Packshoty > okładki wideo.** Dopasowanie Ali i dedup pracują na zdjęciach produktu (okładki-haczyki dawały sufit ~1/3 trafień).
4. **Sezonowość:** każdy produkt ma okno sprzedażowe; po oknie nie jest sprzedawany (karuzela filtruje na żywo).
5. Karuzela `/sklep` = **równe szanse** (seeded shuffle, zero premii heat/score — decyzja 2026-07-10). Jakość pilnowana bramką approve.

## Przepływ danych

```
ŹRÓDŁA                       KOLEJKA (/trendy)                 KONSUMPCJA
─────────                    ─────────────────                 ──────────
bud-shop-radar ──┐                                         ┌─> bud-tt-featured → karuzela /sklep
(sold-first)     ├─> bud_tt_products (pending) ─ review ──>│   (approved, w oknie sezonu, shuffle)
bud-tt-trends ───┘   • dedup: nazwa+item-id+PHASH          │
(hashtagi,           • auto-filter przydatności            └─> bud-crm-export → workflow_products
 requireShop)        • sort: sprzedaż                          (biblioteka CRM /tn-workflow/products)
```

## Tabele

- **`bud_tt_products`** — serce. Kluczowe kolumny: `key` (norm(pl_name), IDENTYFIKATOR — nigdy nie zmieniać), `pl_name` (dopracowywana), `status` (pending/approved/rejected/duplicate), `origin` ('hashtag'|'shop_radar'), `shop_url`, `tt_shop` (jsonb: sold_count, price, stock, `images` CDN, `images_hosted` storage, fetched_at), `product_score` + `score_meta`, `ali_candidates`/`chosen_link`/`ali_snapshot`, `ali_mismatch` (flaga „inny produkt"), `img_hash` (jsonb, max 3× 64-bit phash hex), `season_type`/`season_label`/`sell_from`/`sell_to` ('MM-DD', wrap-around OK), `name_refined_at`.
- **`bud_tt_shop_history`** — snapshoty sold_count/price/stock w czasie → tempo sprzedaży (Δ/tydz. w panelu). Zapis przy każdym pobraniu danych Shop (guard anty-dup <20 h + ten sam sold).
- **`bud_radar_queries`** — 28 tematów pod persony AWE, rotacja `bud_radar_next_queries(n)`.
- **`workflow_products`** (workflow_id NULL) — biblioteka CRM; łączenie z radarem po `bud_key`; `orders_sold`+`orders_sold_source='tiktok_shop'`, `tiktok_url`, season_*.

## Edge functions

| Funkcja | Rola | Uwagi |
|---|---|---|
| `bud-shop-radar` | **Główne źródło**: `/v1/tiktok/shop/search` (ScrapeCreators; paginacja `page`, `amount` NIE działa; `seo_url` to OBIEKT) + enrich `/v1/tiktok/product` → pending z sold/stock/wideo/packshotami/nazwą PL/sezonem od zera | deadline 300 s (gateway idle 150 s — odpowiedź może nie dojechać, funkcja kończy server-side); sanityzacja surogatów UTF-16; upsert per-chunk; ~1 kredyt/produkt |
| `bud-tt-trends` | Skan hashtagów (uzupełniający); `requireShop` DEFAULT true; GPT wyłuskuje produkt + sezon | `extractShop()` łapie link z shop_product_url/products_info/anchors |
| `bud-tt-ingest` | Upsert pending; chroni rehostowane covery; waliduje pola sezonowe | |
| `bud-tt-shop` | Dane TikTok Shop + `product_score` (sprzedaż 40/narzut 25/heat 20/ocena 10/świeżość 5; ΣW=1.0, brak składowej = 0); scope pending/approved/all; historia; markup TYLKO gdy snapshot `source='detail'` | backfill rotuje po najstarszym fetched_at/scored_at |
| `bud-tt-dedup` | Warstwy: item-id → **image (phash, Hamming ≤6 auto; 7–10 → image_suspects; odsiew płaskich hashy popcount<8/>56)** → nazwa (0.8+kategoria) | O(n²) — przy puli >5k rozważyć cache popcount |
| `bud-tt-rehost` | Covery wideo (oEmbed→storage) + `{op:'shop_images'}` = backfill packshotów do `attachments/bud-shop-imgs/` | packshoty CDN wygasają! |
| `bud-ali-snapshot` | Snapshot aukcji Ali + auto-dopracowanie `pl_name` z tytułu (raz, `name_refined_at`) | `source`: detail=pewna aukcja, search=możliwy INNY produkt |
| `bud-img-verify` | GPT-vision filtruje kandydatów Ali (kotwica=nazwa, referencja=packshot) | |
| `bud-tt-featured` | PUBLICZNY feed karuzeli: approved + **w oknie sezonu** + seeded shuffle; detal `?id=<uuid|key>` **TYLKO approved** (bez filtra dałoby się enumerować pending) | cap 500 (uwaga przy wzroście puli) |
| `bud-crm-export` | Most → biblioteka CRM po `bud_key`; skip `poza_sezonem` (body `force:true` omija); UPDATE nie rusza PDF/is_active/visible | |

Deploy: zawsze `--no-verify-jwt --project-ref yxmavwkwnfuphjqbelws` z katalogu `tn-crm`.

## Cron (pg_cron; sekret z Vault `bud_tools_secret`; `timeout_milliseconds=350000` — pg_net default 5 s!)

- `bud-radar-scan` pn/czw 06:00 UTC — 4 queries z rotacji, minSold 1000
- `bud-radar-refresh-approved` sob / `-pending` niedz 05:00 — refresh sprzedaży → historia (Δ)
- `bud-radar-dedup` pn/czw 07:00

## Narzędzia lokalne (`C:\tmp\trendy-tools\`)

- `collect-trendy.mjs N` — skan hashtagowy (requireShop) → ingest → dedup
- `img-hash.py` — phash packshotów (Python imagehash/PIL czyta webp; edge nie dekoduje obrazów). **Odpalać po każdej serii skanów, przed dedupem** — produkty z crona czekają na hash do lokalnej sesji
- `rev-run.cjs` / `paced-run.cjs` / `multi-run.cjs` — reverse-image AliExpress (Playwright, aparat Ali, anti-bot per IP ~65-70/sesję, cooldowny). Wybierają packshot `[SHOP]` przed okładką `[COVER]`. **2026-07-16: dopasowanie Ali WSTRZYMANE na życzenie Tomka**

## Reguły jakości (auto-filter przydatności)

REJECT: marki/licencje (podróbka), odzież/buty/biżuteria/torebki, etui na elektronikę, gabaryty (meble/AGD/pojazdy elektryczne/TV), materiały budowlane, chemia gospodarcza, **kosmetyki płynne/kremy (CPNP!)**, wyroby medyczne/claimy lecznicze, e-collar, cena >90 USD, commodity bez wow. House-brandy Ali-native (Ulanzi, Neewer…) = OK. Wątpliwe → KEEP (panel decyduje). Rejected zamiast DELETE (dedup wyklucza po istniejących kluczach — delete = powrót przy skanach).

## Sezonowość

Okno sprzedażowe ≠ sezon użytkowania: start ~4-6 tyg. przed sezonem, koniec ~2-3 tyg. przed
końcem (potem zwroty). Przykłady: lato 04-15→08-05 · grill/ogród 03-15→08-15 · zima 09-15→01-31 ·
święta 10-15→12-18 · Halloween 09-01→10-25. Wątpliwe → all_year (fałszywy „sezon" ukrywa dobry
produkt). GPT klasyfikuje przy skanie; `inWindow()` (4 kopie: featured/export/trendy/products —
utrzymywać identyczną semantykę, granice inclusive, wrap-around) filtruje na żywo. Znana drobnostka:
front liczy „dziś" lokalnie, edge w UTC — rozjazd max ~2 h na granicy okna.

## Znane pułapki (skrót)

- **Surogaty UTF-16**: `slice()` tnie emoji → jsonb `invalid input syntax` / PGRST102. Sanityzacja jest w shop-radar (`deepSanitize`) i tt-shop (`deepClean`) — przy nowych zapisach jsonb używać tego samego wzorca.
- **PostgREST 1000 wierszy**: każda pełna paginacja przez `.range()` po 1000.
- **Windows curl + polskie znaki**: payloady przez plik (`--data-binary @plik`), nie inline (cp1250).
- **Snapshot `source='search'`** może być innym produktem — scoring pomija narzut, panel flaguje ⚠, `ali_mismatch` do ręcznej podmiany linku.
- Panel `/trendy`: dostęp RLS = 2 uid (Tomek+Maciek); `bud_tt_shop_history` SELECT też.
