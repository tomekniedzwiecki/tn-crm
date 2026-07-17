# SEZONOWOŚĆ POPYTU — SSOT funkcji

> Decyzje 2026-07-17 (po audycie: 2 twarde błędy motyw→sezon, ~96% okien za wąskich
> ze skopiowanych przykładów promptu; po projekcie kompletnej funkcji). Kontekst systemu:
> RADAR-TRENDOW.md.

## Definicja (jedyne kryterium)

Sezonowość POPYTU, nie motywu: „Czy przeciętny Polak kupi ten produkt w [miesiąc] tak samo
chętnie jak w szczycie? Jeśli poza oknem popyt praktycznie ZNIKA — sezonowy. Jeśli tylko
spada — all_year." Motyw wizualny/słowo w nazwie (aurora, pączek-Wielkanoc, dynia) NIGDY
sam nie przesądza sezonu. Wątpliwe → all_year (fałszywy sezon ukrywa dobry produkt — to
gorszy błąd). Dwusezonowych nie modelujemy (→ all_year).

## Enum sezonów PL (zamknięta lista — serwerowa tabela `_shared/seasons.ts`; GPT wybiera KOD, okna narzuca serwer)

| kod | label | okno sprzedażowe |
|---|---|---|
| all_year | całoroczny | — |
| lato | lato | 04-15 → 08-31 |
| zima_grzanie | zima | 09-15 → 01-31 (wrap) |
| swieta_bn | święta | 10-15 → 12-18 |
| ogrod_wiosna | ogród | 03-01 → 09-30 |
| grill | grill | 03-15 → 09-30 |
| back_to_school | szkoła | 08-01 → 09-15 |

Halloween i Wielkanoc NIE są sezonami (okna za wąskie na sklep jednoproduktowy —
produkt „tylko na Halloween" to reject, nie sezon).

## Proces oznaczania (3 warstwy)

1. **Draft przy skanie** (GPT low, batch): prompt z kryterium popytu + few-shot NEGATYWNE
   („projektor aurory → all_year", „lampka-pączek → all_year", „mata plażowa → lato",
   „ogrzewacz rąk → zima_grzanie") + zamknięty enum kodów. Okna Z SERWERA, nie od modelu.
2. **Weryfikacja** (tylko dla seasonal, <10% puli):
   - reguły twarde (`seasonReconcile` w ingest/radar): słownik wymuszeń
     (basen/wentylator/chłodz→lato; ogrzewacz/koc USB/sanki→zima_grzanie;
     choink/bombk/mikołaj-dekor→swieta_bn; grill/ruszt→grill) nadpisuje draft;
     label spoza enuma → all_year → `season_source='rule'`, verified=true;
   - druga opinia (`bud-season-verify`, GPT medium, per produkt, pytanie zamknięte
     POTWIERDZAM/ODRZUCAM) dla seasonal bez trafienia w regułę → `llm2`/degradacja all_year;
   - (przyszłość, flaga OFF) `bud-season-detect`: krzywa sold_count z bud_tt_shop_history —
     włączyć po ≥1 pełnym cyklu sezonu; `season_source='data'`.
3. **Człowiek w /trendy**: select sezonu w detalu (auto-okno z enuma; „edytuj okno" dla
   wyjątków) → `manual`, verified, by, at. Chip „Sezon do sprawdzenia" (seasonal,
   !verified) zamiast osobnej kolejki.

**Priorytet źródeł: data > manual > rule > llm2 > draft** — helper `applySeason` w zapisach;
re-skan nie depcze korekt.

## Cykl życia po sezonie — HIBERNACJA, nie reject

- „Odrzuć po sezonie" USUNIĘTE (dobry produkt sezonowy wraca za rok; rejected go grzebie).
- Hibernacja = stan WYLICZANY (seasonal + !inWindow(today)) — bez nowego statusu.
- Karuzela /sklep: filtruje na żywo (bez zmian). Eksport CRM: skip poza_sezonem (bez zmian).
- Biblioteka CRM: badge „poza sezonem" (ostrzeżenie), BEZ auto-zmiany visible_to_client
  dla produktów przypisanych do workflow klienta (nie sabotujemy budowanego sklepu).
- Pending seasonal poza oknem: chip „Na przyszły sezon" — wyłączone z domyślnej kolejki
  recenzji (nie marnować decyzji), wracają do kolejki gdy okno się zbliża.
- POWRÓT przed sezonem: nie „w ciemno" — cron odświeża sold/stock/link Ali ~14 dni przed
  sell_from, dopiero potem produkt normalnie wraca (okno się otwiera samo).

## Harmonogram

- Przy skanie: draft + reguły + druga opinia (synchronicznie).
- Tygodniowo: refresh sprzedaży (istniejący cron) buduje historię pod przyszły detect.
- Codziennie `bud-season-calendar` (tani): ~14 dni przed sell_to → flaga „kończy okno";
  ~14 dni przed sell_from → enqueue odświeżenia + wyciągnięcie pendingów „na przyszły
  sezon" do kolejki. ZERO auto-akcji destrukcyjnych.
- Panel: karta „Sezony" — 4 liczniki-filtry (wchodzą w sezon / kończą okno /
  w hibernacji / sezon do sprawdzenia).

## Gotchas

- 4 kopie `inWindow()` (featured/export/trendy/products) — utrzymywać IDENTYCZNĄ
  semantykę (inclusive, wrap-around). Drobny znany rozjazd: front liczy „dziś" lokalnie,
  edge w UTC (±2 h na granicy okna — akceptowalne).
- Skan lipcowy nie zawiera produktów zimowych — jesienią radar sam je złapie (rotacja
  tematów), ale warto dodać zimowe queries do bud_radar_queries przed sezonem.
