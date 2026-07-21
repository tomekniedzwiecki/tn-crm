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

## Warstwa 2 — weryfikacja wizualna (decyzja Tomka 21.07: „blisko 100% → zatwierdzaj")

`bud-img-verify {op:'verify_shop_match', limit?:25, minConf?:0.9, dryRun?}` porównuje
**packshot z TikTok Shop** ze **zdjęciami aukcji z `ali_snapshot`** + nazwą PL. To łapie
dokładnie to, czego tekst nie umie: „karmnik dla psa" ze `score = 1.0` okazał się
**podstawką pod karmnik** kontra kompletny karmnik z kamerą (werdykt NIE, pewność 0.99).

- `TAK` i `confidence ≥ minConf` → `auto_match.is_auto = false`, `confirmed_by = 'vision'`,
  `tt_shop.source = 'vision_confirmed'` — **zatwierdzone automatycznie**
- cokolwiek innego → zostaje `is_auto = true` + zapisany `auto_match.vision`

Model ma instrukcję: **przy wątpliwości odpowiadaj NIEPEWNE, nie zgaduj**. Lepiej zostawić
do przeglądu niż zatwierdzić błąd. Funkcja pomija rekordy, które mają już `vision` — ponowne
uruchomienie nie płaci drugi raz. Koszt idzie do `bud_usage` (`kind='img-verify'`).

**Ważne dla wycofania:** `auto_match.by` NIE znika przy zatwierdzeniu. Rollback po
`is_auto = 'true'` obejmuje tylko niezatwierdzone; żeby cofnąć **wszystko**, czego dotknął
automat (łącznie z potwierdzonym wizualnie), filtruj po:

```sql
where tt_shop->'auto_match'->>'by' = 'bud-shop-radar/match_existing'
```

Przegląd werdyktów:

```sql
select key, pl_name,
       tt_shop->'auto_match'->'vision'->>'verdict'    as werdykt,
       tt_shop->'auto_match'->'vision'->>'confidence' as pewnosc,
       tt_shop->'auto_match'->'vision'->>'reason'     as powod
from bud_tt_products
where tt_shop->'auto_match'->'vision' is not null
order by (tt_shop->'auto_match'->'vision'->>'verdict'),
         (tt_shop->'auto_match'->'vision'->>'confidence')::numeric desc;
```

Werdykt `NIE` = w rekordzie siedzą **cudze** dane sprzedaży. To kandydaci do rollbacku
w pierwszej kolejności, nie do przeglądu „kiedyś".

## WYNIK PRZEBIEGU 21.07.2026 — czytaj to przed zaufaniem automatowi

72 rekordy dopasowane po tytule, potem obejrzane (2 niezależne przebiegi):

| wynik | ile | co to znaczy |
|---|---|---|
| ✓ zatwierdzone automatycznie | **20** | oba przebiegi: TAK, oba ≥ 0.9 |
| ⛔ odrzucone (oba: NIE) | **23** | **to był inny produkt** — wycofane |
| ? niezgodne przebiegi | **10** | raz TAK, raz NIE — z definicji niepewne |
| ~ niepewne / poniżej progu | **19** | zostają do przeglądu |

**Blisko 1/3 dopasowań po tytule było po prostu błędnych** — mimo że 66 z 72 miało
`score = 1.0`. To najważniejsza liczba w tym dokumencie: **`score = 1.0` nie znaczy
„to ten produkt", tylko „wszystkie słowa zapytania są w tytule".**

Przykłady odrzuceń (odniesienie → co automat wpisał):
- pług ręczny **na kołach** → motyka-grabki bez kół
- rozrusznik auta → *lampa stroboskopowa do ustawiania zapłonu* dopasowana do boostera
- nakładka na fotel **z wentylatorem** → żelowa poduszka plaster miodu
- karmnik dla psa (podstawka) → kompletny karmnik dla kota z kamerą
- saszetki podróżne na ubrania → organizer na tabletki

### Po trzecim przebiegu (`{op:'verify_shop_tiebreak'}`)

Trzeci głos rozstrzygający, decyzja większością 3 (do zatwierdzenia: ≥2× TAK,
**zero** głosów NIE, średnia pewność TAK ≥ minConf):

| wynik | ile |
|---|---|
| ✓ zatwierdzone | **22** |
| ⛔ odrzucone (nagrobek) | **28** |
| ~ jednogłośne 3× TAK, średnia < 0.9 | **16** |
| ~ sporne (2× TAK, 1× NIE) | **6** |

Czyli **28 z 72 dopasowań po tytule (39%) okazało się innym produktem.**

Grupa „jednogłośne 3× TAK poniżej progu" to przypadki, gdzie trzy niezależne przebiegi
zgadzają się co do TAK, ale pewność siedzi w paśmie 0.78–0.89 — zwykle znaczy to „ten sam
typ rzeczy, inny model/wariant". Próg 0.9 był kalibrowany dla POJEDYNCZEGO przebiegu;
przy jednogłośności trzech mierzy już co innego. **Decyzja o traktowaniu tej grupy należy
do Tomka — nie obniżać progu samodzielnie** (dobieranie reguły pod pożądany wynik to
dokładnie ten błąd, przez który 66 rekordów miało `score = 1.0` i cudze dane w środku).

### Nagrobek po odrzuceniu

Odrzucone NIE mają `tt_shop = null`, tylko „nagrobek":

```jsonc
{ "source": "auto_match_rejected",
  "auto_match": { "rejected": true, "is_auto": false, "vision": {...},
                  "odrzucony_produkt": { "title": ..., "seo_url": ..., "sold_count": ... } } }
```

Powód: `tt_shop = null` sprawiłoby, że kolejny `match_existing` wpisze **ten sam błąd**
jeszcze raz. Nagrobek trzyma dowód i wyklucza rekord z ponownego dopasowania. Sprzedaż
i cena są usunięte, więc rekord nie liczy się już jako „dowód sprzedaży". `shop_url`
wyczyszczony tam, gdzie ustawił go automat.

## Gotcha przy ponownym uruchomieniu

Rekord, którego nie da się dopasować (`brak_wynikow`), zostaje z `tt_shop = null`, więc
**każda kolejna runda bierze go znowu** — i za każdym razem kosztuje 1 kredyt. Przy
przebiegu 21.07 z 28 pominięć realnie unikalnych było **3**; reszta to ten sam rekord
mielony w kółko (~25 kredytów w błoto).

Uruchamiając ponownie: albo celuj `keys:[...]`, albo przerwij pętlę, gdy runda zwróci
`filled = 0`. Skrypt `scratchpad/match-shop.py` tego NIE robił.

Wyszukiwarka TikToka bywa też **niedeterministyczna** — „flipper zero" wypadł w dwóch
rundach jako `slabe_dopasowanie`, a w trzeciej trafił poprawnie (score 0.67). Pojedyncze
`brak_wynikow` nie znaczy więc „nigdy się nie uda".

## Powiązane

- Klipy z auto-dopasowania wideo: `videos_curated.mode = 'auto_match'`, każdy item
  `keep:false`, `werdykt:'PROPOZYCJA'`. Tam NIC nie jest zatwierdzane — inaczej niż tutaj.
- Panel `/trendy` odróżnia jedno i drugie znacznikiem przy produkcie i przy kaflu wideo.
