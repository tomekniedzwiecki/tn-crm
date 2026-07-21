# Auto-dopasowanie TikTok Shop — co to jest i jak to wycofać

**Decyzja Tomka 21.07.2026:** „zacznij automatycznie to wypełniać albo oznacz sobie to gdzieś
w danych, że to było automatyczne wypełnienie i w razie czego wrócimy do tego i usuniemy".

## Co robi

Operacja `{op:'match_existing'}` w `bud-shop-radar` bierze rekordy **`status='approved'` bez
`tt_shop`** i wypełnia je produktem z TikTok Shop znalezionym po kolumnie **`query`** — tym samym
angielskim zapytaniu, którym produkt pierwotnie trafił do radaru.

```
{op:'match_existing', limit?:20, keys?:[...], dryRun?:false, detail?:true, minScore?:0.5}
```

Deploy: `npx supabase functions deploy bud-shop-radar --no-verify-jwt --project-ref <ref>`.
Gate: `x-tools-secret` albo JWT team_membera. Koszt: **2 kredyty/rekord** (search + detail;
`detail:false` schodzi do 1, ale traci `stock` i powiązane wideo).

## ⚠️ Czym to NIE jest

`tt_shop` w normalnym trybie oznacza **potwierdzony dowód sprzedaży** — napędza scoring
i premisę „sprzedaż ponad wiralowość". Tutaj podstawą jest **zgodność TYTUŁU z zapytaniem**,
a nie oględziny produktu. Po wypełnieniu część rekordów zacznie wyglądać na zwalidowane
sprzedażowo, mimo że nikt ich nie obejrzał. Znacznik `is_auto` to odróżnia — **patrząc na
liczby sprzedaży trzeba go uwzględnić.**

Zaobserwowany typ pomyłki (21.07): „automatyczny karmnik dla **psa**" dopasował się do
„PETLIBRO RFID Automatic **Cat** Feeder" — ta sama kategoria, inny odbiorca. Dlatego przy
każdym wpisie zostaje 5 odrzuconych kandydatów.

## Ślad w danych

Wewnątrz `tt_shop`:

```jsonc
"auto_match": {
  "is_auto": true,                    // ← znacznik do wycofania
  "at": "2026-07-21T...",
  "by": "bud-shop-radar/match_existing",
  "query": "gravity inversion boots", // czym szukaliśmy
  "score": 1.0,                       // udział słów zapytania w tytule (0..1)
  "picked_title": "Anti-Gravity Inversion Boots — ...",
  "picked_seo_url": "https://www.tiktok.com/shop/pdp/...",
  "set_shop_url": true,               // czy shop_url wpisaliśmy MY (czy był pusty)
  "candidates": [ /* 5 odrzuconych, z tytułem, score, sold, ceną i linkiem */ ]
}
```

Dodatkowo `tt_shop.source = 'auto_match'` (normalnie `hashtag`/`shop_radar`/`seller_mine`).

## Jak znaleźć

```sql
-- wszystkie auto-wypełnione
select key, pl_name,
       tt_shop->'auto_match'->>'score'        as score,
       tt_shop->>'title'                      as dopasowany_tytul,
       tt_shop->>'sold_count'                 as sold
from bud_tt_products
where tt_shop->'auto_match'->>'is_auto' = 'true'
order by (tt_shop->'auto_match'->>'score')::numeric, key;
```

Najpierw oglądać te z **najniższym score** — tam ryzyko pomyłki jest największe.

## Jak wycofać

**Wszystko naraz.** W Postgresie wyrażenia w `SET` liczą się na STARYM wierszu, więc `case`
poniżej widzi jeszcze `tt_shop` — jest bezpieczny:

```sql
update bud_tt_products
set tt_shop  = null,
    shop_url = case when tt_shop->'auto_match'->>'set_shop_url' = 'true'
                    then null else shop_url end
where tt_shop->'auto_match'->>'is_auto' = 'true';
```

**Pojedynczy rekord** — dołóż `and key = '...'`.

**Zatwierdzenie dopasowania** (uznajesz je za prawdziwe → przestaje być „auto"):

```sql
update bud_tt_products
set tt_shop = (tt_shop - 'auto_match') || jsonb_build_object('source','manual_confirmed')
where key = '...';
```

## Znane ograniczenie wycofania

`cover` był ustawiany **tylko tam, gdzie był pusty**, na zrehostowany packshot dopasowanego
produktu — ale fakt ten NIE jest odnotowany w `auto_match`. Po rollbacku taka miniatura
zostaje. Jest to nieszkodliwe (lepsza niż brak), ale jeśli chcesz je wyczyścić, kandydatów
znajdziesz tak — **przed** wykonaniem rollbacku:

```sql
select key, cover from bud_tt_products
where tt_shop->'auto_match'->>'is_auto' = 'true'
  and cover like '%/storage/v1/%';
```

## Powiązane

- Klipy z auto-dopasowania wideo: `videos_curated.mode = 'auto_match'`, każdy item
  `keep:false`, `werdykt:'PROPOZYCJA'`. Tam NIC nie jest zatwierdzane — inaczej niż tutaj.
- Panel `/trendy` odróżnia jedno i drugie znacznikiem przy produkcie i przy kaflu wideo.
