# /trendy v3 — spec przebudowy (master-detail, sold-first)

> Architektura zatwierdzona 2026-07-17 na bazie: audytu UX, analizy decyzji (87% reject,
> heat nie różnicuje, 3 sub-kolejki gotowości), wzorców pro-narzędzi (Kalodata/FastMoss:
> gęsta tabela + detal; Superhuman/mod-queues: klawiatura + inbox-zero).
> Kontekst systemu: docs/zbuduje/RADAR-TRENDOW.md.

## Cel

Recenzent (Tomek/Maciek) ma przemielić kolejkę setek produktów szybko i trafnie.
Dominująca akcja = REJECT (87%). Sygnały decyzyjne wg ważności: sold_count (buckety),
product_score (gdzie jest), cena TT, packshoty/wideo (gut-check), kategoria, sezon.
Heat = szum (identyczna mediana dla approved i rejected) — degradujemy.

## Layout

```
┌ HEADER: brand · LEJEK: [Pending N] [Zatwierdzone N] [W bibliotece N (M do eksportu)] [⚠ Mismatche N] · Odśwież
├ TOOLBAR: search · kategoria · sort (Sprzedaż|Score|Cena|Najnowsze) · chipy sub-kolejek/filtrów · [Tabela] (tylko approved)
├──────────────┬────────────────────────────────┐
│ LISTA (420px)│ DETAL (flex-1, sticky, own scroll)
│ wiersz 56px: │ ┌ ACTION BAR sticky: [A Zatwierdź] [R Odrzuć ▾] [D Duplikat] | approved: [→ CRM] [To dobry link]
│ [thumb 48]   │ ├ tytuł + kategoria(select) + origin/sezon/mismatch badge + status
│ nazwa 1 linia│ ├ METRYKI: 🛒 sprzedane · $ cena TT · 📦 stock · ⚡ score · 🗓 sezon (+ Δ/tydz. gdy będzie)
│ 🛒15,5k $19  │ ├ MEDIA: wideo 9:16 (autoplay TYLKO TU, player/v1, montowany przy wyborze,
│ ⚡27 🎬 🖼3   │ │        odmontowany przy zmianie) + galeria packshotów (klik=lightbox)
│ (sel=accent) │ ├ ALI: przeniesione matchHtml + sourceTabsHtml (kandydaci, snapshot, refbox)
│ ...          │ ├ TRAKCJA (1 linia tekstu): N filmów · plays · zapisy · komentarze · eng% · heat (mały)
│ [pokaż więcej│ └ LINKI: TikTok · TikTok Shop · autor
└──────────────┴────────────────────────────────┘
```

- Lista: czysty HTML, ZERO wideo/iframe. Render batchy po 100 + „pokaż więcej" (lub scroll-append).
- Wybór wiersza (klik lub j/k) → detal renderuje pełne dane TEGO produktu. Jeden iframe wideo w aplikacji.
- Mobile <900px: lista full-width; wybór → detal jako fullscreen overlay z przyciskiem powrotu.

## Klawiatura (globalna, wyłączona gdy focus w input/select/textarea)

- `j`/`ArrowDown` następny wiersz · `k`/`ArrowUp` poprzedni (scroll-into-view)
- `a` = approve (jak obecny pick/approve flow — z triggerami rehost/snapshot/shop!)
- `r` = otwiera menu powodów odrzucenia; wybór klawiszem `1-8` lub klikiem; Esc anuluje
- `d` = duplikat
- Po każdej decyzji: wiersz znika z kolejki, licznik maleje, fokus → następny wiersz
- `?` = dymek ze ściągą skrótów

## Reject z powodem (nowa kolumna `reject_reason` — JUŻ ISTNIEJE w DB)

Powody: 1 za-drogie · 2 słaba-marża · 3 gabaryt-wysyłka · 4 marka-licencja · 5 moda-odzież ·
6 commodity-nuda · 7 zły-produkt · 8 inne. Zapis: status='rejected', reviewed_by (jak dotąd
przez RLS/uid → panel zapisuje nick jak obecnie), reviewed_at, reject_reason='za-drogie' itd.
Buduje dane do strojenia auto-filtra.

## Lejek w headerze (zastępuje kpis + stseg)

Klikalne segmenty = filtr statusu: Pending (pending) · Zatwierdzone (approved) ·
W bibliotece (approved ∩ INLIB; podpis „M do eksportu" = approved z sold>0 bez INLIB) ·
Mismatche (ali_mismatch=true) · [Odrzucone/Duplikaty w małym dropdownie „więcej"].

## Sub-kolejki pending (chipy, z licznikami)

- „Gotowe do decyzji": ma sold_count I cenę I ≥1 packshot
- „Do dogrywki": bez żadnych danych sklepowych (shop_url brak / tt_shop brak)
- „Bez packshotów": ma dane sklepowe, brak images_hosted/images
Plus istniejące chipy: Dowód sprzedaży · Po sezonie · Kończy się okno (Mismatche → do lejka).

## Sort

Sprzedaż (default, sold desc NULLS LAST → potem score desc) · Score · Cena (TT asc) ·
Najnowsze. HEAT WYPADA z sortów.

## Czystki (usuwamy)

- Martwy modal playera: openM/closeM, <div class="modal">, CSS .modalC/.pl, overlay .play bez onclick
- statfold (6 kafli statystyk wideo) → jedna linia „Trakcja" w detalu
- Badge heat z kart/listy; heat tylko małym tekstem w linii Trakcja
- Badge wieku/🔥 z rogu wideo (wiek jako tekst w detalu)
- openCard po q=pl_name → nawigacja po id (tabela klik → select w liście+detal)

## Zostaje bez zmian (nie ruszać logiki!)

- Flow approve `upd()` z triggerami bud-tt-rehost/bud-ali-snapshot/bud-tt-shop
- Eksport bud-crm-export (kontrakt {exported,updated,skipped:[{key,reason}]})
- healVisible (leczenie coverów), loadHistory (Δ — pokazywać gdy ≥2 snapshoty), paginacja .range po 1000
- Widok Tabela approved (ekonomia) — dostępny przyciskiem na zakładce approved
- RLS/gate (2 uid), zapisy przez supabase-js jak obecnie
- XSS-founduły: dane w onclick TYLKO przez x.id (UUID); teksty przez esc(); URL-e przez safeUrl-pattern

## Wydajność

- Lista bez obrazów ciężkich: thumb = images_hosted[0] (miniatura storage) lub cover, loading=lazy
- Detal: montaż/demontaż iframe przy zmianie wyboru; galeria lazy
- render listy NIE remontuje detalu (osobne funkcje renderList/renderDetail; decyzja aktualizuje
  wiersz w miejscu zamiast full re-render — koniec z restartem wideo)
