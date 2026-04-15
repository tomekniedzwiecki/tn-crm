# TN Ads Filler

Rozszerzenie Chrome wypełniające formularze reklam (Meta Ads Manager, TakeDrop, TikTok Ads, Google Ads) kopiami wygenerowanymi w CRM — dokładnie dane z `workflow_ads.ad_copies.versions`.

## Co robi

1. Pobiera listę workflow z wygenerowanym copy reklamowym z Supabase
2. Na stronie reklamowej wykrywa pola: `Podstawowy tekst` / `Nagłówek` / `Opis` / `Wezwanie do działania` (PL + EN)
3. Wypełnia automatycznie wszystkie warianty (5×5 Advantage+, pojedyncze reklamy, dowolna platforma)
4. Wyświetla wizualny feedback (zielone ramki = wypełnione, żółte = brak danych, czerwone = błąd)
5. Obsługuje formularze Reactowe (natywne settery + dispatch `input/change/blur`)

## Instalacja

1. Otwórz `chrome://extensions/`
2. Włącz **Developer mode** (prawy górny róg)
3. Kliknij **Load unpacked** → wskaż folder `chrome-extensions/ads-filler`
4. Przypnij ikonę do paska

## Konfiguracja (jednorazowo)

1. Kliknij na ikonę → **⚙ (Opcje)**
2. Wklej **Supabase service role key** (Dashboard → Project Settings → API → `service_role`)
3. Kliknij **Testuj połączenie** — powinno zwrócić `OK ✓`
4. Zapisz

Klucz jest trzymany tylko lokalnie w `chrome.storage.local`.

## Użycie

### Scenariusz podstawowy
1. Wejdź na Meta Ads Manager → formularz tworzenia reklamy (musisz być na etapie "Ad creative" / "5 z 5")
2. Kliknij ikonę wtyczki
3. Wyszukaj workflow po nazwie klienta lub ofercie
4. Kliknij **Wypełnij wszystkie warianty** — wszystkie 5 pól tekstowych, nagłówków, opisów i CTA wypełniają się z 5 wariantów z CRM

### Pojedynczy wariant
W widoku szczegółów workflow każdy wariant ma dwa przyciski:
- **Wypełnij** — wypełnia wszystkie pola na stronie jednym wariantem (gdy nie ma 5×5)
- **Kopiuj** — kopiuje wariant do schowka (fallback gdy auto-fill nie działa)

### Skrót klawiszowy
`Alt+Shift+F` → wypełnia ostatnio wybrany workflow (bez otwierania popupa)

## Obsługiwane platformy

- `business.facebook.com` / `www.facebook.com` (Meta Ads Manager)
- `ads.tiktok.com`
- `ads.google.com`
- `app.takedrop.pl` i wszystkie subdomeny `*.takedrop.pl`

Jeśli chcesz dodać nową platformę — edytuj `manifest.json` (`host_permissions` + `content_scripts.matches`).

## Jak działa wykrywanie pól

Content script przegląda wszystkie `input` / `textarea` / `[role=combobox]` na stronie i dla każdego próbuje znaleźć etykietę (w kolejności):

1. `aria-label`
2. `<label for="id">`
3. `aria-labelledby`
4. wrapping `<label>`
5. `placeholder`
6. heurystyka: najbliższy heading/label u rodzeństwa wyżej w DOM

Matchowanie typu: regex na znormalizowanym tekście (PL + EN).

## Mapowanie CTA

Tekst wariantu (`cta` w `ad_copies`) jest mapowany do wartości dropdown-u:

| Tekst w CRM | Wartość Meta |
|---|---|
| Kup teraz | SHOP_NOW |
| Dowiedz się więcej | LEARN_MORE |
| Zarejestruj się / Zapisz się | SIGN_UP |
| Pobierz | DOWNLOAD |
| Zamów | ORDER_NOW |
| Subskrybuj | SUBSCRIBE |

Fallback: próbuje dopasować po dokładnym tekście opcji.

## Troubleshooting

**"Strona nie jest obsługiwana"** → wtyczka nie ma `host_permission` dla domeny. Dodaj do `manifest.json`.

**"Nie znaleziono pól"** → Meta/platforma zmieniła DOM albo jesteś na niewłaściwym etapie kreatora. Sprawdź `window.__TN_ADS_FILLER__` w konsoli — jeśli `undefined`, content script się nie wstrzyknął (reload karty).

**Pola wypełniają się i od razu czyszczą** → React nie łapie zdarzenia. Zgłoś — wtyczka używa natywnych setterów, ale niektóre frameworki wymagają dodatkowych eventów (`keydown`, `keyup`).

**Pola wypełniły się identyczną treścią w każdym wierszu** → to **nie** jest 5×5 layout, tylko jedno-wariantowe. Użyj "Wypełnij" z wybranego wariantu.

## Architektura

```
manifest.json        — MV3 config, permissions, commands
background.js        — service worker: Supabase REST proxy
content.js           — field detection + React-safe fill + toast UI
popup.html/js/css    — workflow picker + variant preview + actions
options.html/js      — Supabase URL + service key config
icons/icon.svg       — source icon (konwertuj do PNG 16/48/128 przed publikacją)
```

## TODO (jeśli okaże się za mało)

- [ ] Generowanie PNG ikon z SVG (użyj `sharp` lub online converter)
- [ ] Upload kreacji graficznych (`ad_creatives[].url`) do pól "Multimedia"
- [ ] Auto-scroll do następnego pola po wypełnieniu
- [ ] Wykrywanie wariacji pól (niektóre formularze mają `Tekst 1/2/3` jako osobne sekcje)
- [ ] Eksport wariantów do CSV
