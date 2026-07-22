# 04 — Styleguide (draft) · Majster Blisko

> **Doktryna fabryki:** manifest z `zrodla/PREVIEW-BRIEF.json` = **KANON**. Sampling makiet PNG =
> tylko **POTWIERDZENIE rodziny barw**. Przy rozjeździe **WYGRYWA MANIFEST**, kontrasty dociągane do
> **WCAG AA**. Struktura mapuje 1:1 na `saas-starter/template/public/css/base.css` (custom properties `:root`).
> **ZAKAZ katalogu gotowych skórek** (`projekt-stworze-design-per-projekt`) — design robi się PER apka z makiet.
>
> **Źródło:** manifest designu + 5 makiet PNG (1536×1024) obejrzanych + sampling `pngjs` (średnia
> odporna na tekst/krawędzie — środkowe 50% luminancji). Makiety: `podglad-landing` (strona sprzedażowa),
> `podglad-panel` (pulpit fachowca, lista-dnia), `podglad-glowna` (kreator „Dodaj zlecenie"),
> `podglad-dodatkowa` (szczegół zlecenia + odpowiedź), `podglad-podsumowanie` (plansza problem/oferta).
>
> **Uwaga proceduralna:** w kroku 04 `base.css` NIE jest edytowany (04 = kontrakt tokenów). Wpisanie
> wartości do `:root` + biblioteka komponentów = krok **Design** (`design-system/`). Poniższa tabela jest
> wersją docelową do przeniesienia 1:1.

---

## 1. Paleta

Kolumna „Źródło": **manifest** = wartość kanoniczna z briefu; **sampling** = zmierzone z makiet (potwierdzenie
rodziny); **wyprowadzone** = dobrane spójnie + dociągnięte do WCAG.

| Token (CSS var) | Wartość | Zastosowanie | Źródło |
|---|---|---|---|
| `--color-bg` | `#F3EFE5` | tło strony — ciepły piaskowy | **manifest**. Sampling makiet cieplejszy/jaśniejszy (`#F8F4EC`…`#FEF9F1`) → rozjazd JASNOŚCI, rozwiązany na korzyść manifestu (ciemniejszy = bezpieczniejszy WCAG) |
| `--color-surface` | `#FFFDF7` | karty, panele, pola, kafelki — kremowa biel | **manifest**. Sampling wnętrza kart potwierdza kremową biel „unoszącą się" nad piaskiem |
| `--color-text` | `#22262B` | tekst główny, nagłówki, ciemne obrysy — ciepły grafit | **wyprowadzone** (manifest nie podaje). Nagłówki na makietach = prawie-czerń; `#22262B` daje AAA na tle i powierzchni |
| `--color-text-muted` | `#6A6252` | tekst drugorzędny — dzielnica, „opcjonalnie", jednostki, podpisy | **wyprowadzone** — ciepła szarość (nie chłodna); AA na obu tłach |
| `--color-accent` | `#F05A28` | CTA, ikony działów, duże liczby/kwoty, aktywny filtr | **manifest**. Sampling `#EA4F0E`…`#FE5D15` otacza `#F05A28` centralnie → **energetyczny pomarańcz potwierdzony** |
| `--color-accent-hover` | `#C63E0C` | hover/pressed CTA **oraz drobny tekst pomarańczowy** na powierzchni | **wyprowadzone** — pogłębiony wariant; jako TŁO małych przycisków i jako INK drobnych etykiet (AA) |
| `--color-accent-text` | `#FFFFFF` | tekst/ikona na wypełnieniu akcentu | **manifest/sampling** — etykiety przycisków białe, pogrubione |
| `--color-border` | `#E4DDCE` | hairline 1px, dzielniki wierszy — ciepła, niskokontrastowa | **wyprowadzone** — spójna z piaskiem, widoczna jako 1px na powierzchni |
| `--color-success` | `#2F7D57` | statusy pozytywne (`done`, aktywne, „na dziś" godziny), zieleń robocza | **manifest** (`akcent2`). Sampling `#2F744F` na landingu ≈ manifest → **potwierdzony niemal 1:1** |
| `--color-warning` | `#B4790F` | ostrzeżenia — tło badge z grafitowym tekstem, obrys, ikona | **wyprowadzone** — ciepły bursztyn/miód, odsunięty tonalnie od pomarańczy (żeby nie mylić) |
| `--color-error` | `#B22F1B` | błędy, strefa destrukcyjna, baner impersonacji | **wyprowadzone** — ceglasta czerwień w rodzinie ciepłej, wyraźnie „czerwieńsza" od akcentu |

**Tokeny SYGNATUROWE (dopisać w kroku Design — base.css dziś ich nie ma):**

| Token | Wartość | Zastosowanie |
|---|---|---|
| `--color-success-text` | `#256341` | drobny tekst statusu na KAŻDYM tle (AA także na piasku, gdzie bazowa zieleń nie dochodzi) |
| `--color-warning-text` | `#8A5A08` | drobny tekst ostrzeżenia (AA; bazowy `--color-warning` do tekstu za jasny) |
| `--color-outline` | `#22262B` | **sygnaturowy ciemny obrys 2px** kart-naklejek, przycisków i plakietek (manifest: „wyraźne ciemne obrysy") |
| `--color-tag-paper` | `#E9DABB` | tło „papierowego znacznika" (kraft/manila) — sygnatura zleceń |
| `--color-tag-stitch` | `#8A7A57` | perforacja/przeszycie i sznurek plakietki (dashed) |

### Kontrasty WCAG — pary POLICZONE (realnie, wzór 2.x; nie szacowane)

| Para | Wynik | Werdykt / reguła użycia |
|---|---|---|
| `#22262B` na `#F3EFE5` (tekst na tle) | **13.25:1** | AAA — bez ograniczeń |
| `#22262B` na `#FFFDF7` (tekst na karcie) | **14.96:1** | AAA — bez ograniczeń |
| `#6A6252` na `#FFFDF7` (muted na karcie) | **5.93:1** | AA ✓ (także drobny) |
| `#6A6252` na `#F3EFE5` (muted na tle) | **5.25:1** | AA ✓ — nie schodzić poniżej 14 px dla komfortu seniorów |
| biały na `#F05A28` (etykieta na akcencie) | **3.39:1** | **TYLKO duży/pogrubiony** (≥18.66 px bold lub ≥24 px). Przyciski primary: label ≥18 px bold ✓. Drobny biały tekst na pomarańczy = **ZAKAZ** |
| biały na `#C63E0C` (hover/pressed, mały przycisk) | **5.13:1** | AA ✓ — **małe przyciski z drobną etykietą → to jest wariant tła** |
| `#F05A28` na `#FFFDF7` (ikony / duże liczby) | **3.33:1** | OK dla UI ≥3:1 (ikony, „1,2 km", kwoty display); **drobny tekst pomarańczowy = ZAKAZ** |
| `#C63E0C` na `#FFFDF7` (drobny tekst pomarańczowy) | **5.04:1** | AA ✓ — drobne etykiety/linki pomarańczowe używają tego wariantu |
| `#2F7D57` na `#FFFDF7` (zieleń na karcie) | **4.92:1** | AA ✓ nawet drobny tekst — statusy/godziny na karcie OK |
| `#2F7D57` na `#F3EFE5` (zieleń na tle) | **4.36:1** | **<4.5** — tylko ikony/kropki/duże liczby (≥3:1); drobny tekst na tle → `--color-success-text` |
| biały na `#2F7D57` (ikona/label na zieleni) | **5.01:1** | AA ✓ — zielony przycisk kołowy „Jestem fachowcem", checki |
| `#256341` na `#F3EFE5` / `#FFFDF7` (success-text) | **6.22 / 7.02:1** | AA ✓ wszędzie |
| `#B22F1B` na `#FFFDF7` (error) / biały na nim | **5.59 / 6.33:1** | AA ✓ w obie strony |
| `#B4790F` na `#FFFDF7` (warning) | **3.63:1** | tylko ikona/obrys/tło-badge z grafitowym tekstem; drobny tekst → `--color-warning-text` |
| `#8A5A08` na `#FFFDF7` (warning-text) | **5.82:1** | AA ✓ |

**Reguła nadrzędna użycia koloru na akcencie:** biały tekst wolno kłaść na `--color-accent` **wyłącznie**
gdy jest duży i pogrubiony (przyciski primary, wielkie CTA). Każdy drobny tekst pomarańczowy → `--color-accent-hover`
(`#C63E0C`). Każdy drobny tekst zielony na piaskowym tle → `--color-success-text` (`#256341`).

---

## 2. Typografia

Charakter na makietach: nagłówki i wielkie liczby = **ciężki, zwarty grotesk** o solidnym, „warsztatowym" rysunku
(„Majster Blisko", „Drobna naprawa?", ceny `160 zł`, odległości `1,2 km`, godziny `15:00`). UI = czytelny, gęsty,
telefonowy. Wymóg twardy: **pełne polskie znaki** (ą ć ę ł ń ó ś ź ż) — `feedback-landing-fonts-polish`.

### Wybór kierunku — JEDEN: **Archivo** (head/liczby) + **Inter** (body/UI)

Analiza kandydatów:

- **Space Grotesk** — ODRZUCONY. Choć aktualna wersja Google Fonts obejmuje Latin Extended (polskie znaki
  renderują), krój jest zbyt „quirky/techniczny", ma cyfry **nietabularne** i wąski zakres wag — słabo niesie
  „mocny, roboczy" charakter i duże, wyrównane w kolumnach ceny/odległości/terminy z manifestu. Niedopasowanie
  charakteru, nie tylko technikalia.
- **Sora** — ODRZUCONY. Geometryczny, „miękki" i lekko zaokrąglony; przy ciężkich wagach traci solidność. Bliżej
  chłodnego SaaS niż warsztatu.
- **Archivo** — **WYBRANY**. Grotesk o zwartym, sturdy rysunku, **zmienna waga 100–900**, **pełne Latin Extended
  (komplet polskich znaków)**, dostępne **cyfry tabularne** (`font-variant-numeric: tabular-nums`) — idealne do
  wielkich cen, odległości i terminów, które manifest stawia w centrum. Ciężkie wagi (700–800) dają „warsztatową
  tabliczkę", zwykłe (400–600) są czytelne w gęstym UI.
- **Inter** (`--font-body`) — humanistyczny sans, najwyższa czytelność na telefonie i dla seniorów, pełne PL. Niesie
  dużo drobnego tekstu formularzy/list bez zmęczenia. Fallback: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.

> Można rozważyć **Archivo dla całości** (jeden krój). Rekomendacja: **split Archivo/Inter** — Archivo daje
> sygnaturę i liczby, Inter gwarantuje senior-friendly legibility gęstego UI. Ostateczne potwierdzenie w kroku Design.

**Ładowanie:** `<link>` Google Fonts we wszystkich stronach `public/` — `Archivo:wght@500;600;700;800` +
`Inter:wght@400;500;600;700`. Subset `latin` + `latin-ext` (polskie znaki). `font-display: swap`.

- `--font-head`: `"Archivo", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`
- `--font-body`: `"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`

### Skala rozmiarów (px)

`13 / 14 / 16 / 18 / 22 / 28 / 36 / 48` (+ hero display `clamp(2.25rem, 6vw, 4rem)` ≈ 36→64).
**Body bazowe 16 px** (podłoga dostępności dla seniorów — patrz §6). Etykiety/podpisy min. 13–14 px.

### Wagi

- Body 400 (treść), 500 (etykiety pól), 600 (przyciski, akcenty).
- Head 600 (nagłówki sekcji), 700–800 (hero, nazwy zleceń, wielkie liczby).

### Klasa `.stat` — wielkie liczby (ceny · odległości · terminy)

Sygnaturowy element manifestu („duże ceny, odległości i terminy"). Widoczna na makietach: `7`, `1,2 km`, `160 zł`,
`15:00`, `99 zł`.

```
.stat        { font-family: var(--font-head); font-weight: 800; font-variant-numeric: tabular-nums;
               line-height: 1; color: var(--color-text); }
.stat--lg    { font-size: 36px; }   /* pulpit: „7", ceny display        */
.stat--md    { font-size: 28px; }   /* karta zlecenia: „1,2 km", godzina */
.stat--sm    { font-size: 22px; }   /* w wierszu, obok etykiety          */
.stat__unit  { font-size: .5em; font-weight: 600; color: var(--color-text-muted); }  /* „km", „zł" */
.stat--accent{ color: var(--color-accent); }   /* odległość — akcent (UI ≥3:1 OK) */
.stat--pos   { color: var(--color-success); }   /* godzina „na dziś" — TYLKO pozytyw na karcie */
```

Reguła: jednostka (`km`, `zł`) zawsze mniejsza i `--color-text-muted`. Kolor `--color-accent` na liczbie wolno
(to duży glif, ≥3:1). Zieleń na liczbie tylko jako pozytywny status — nie dekoracja (§7).

---

## 3. Geometria i cienie

- **Promień (`--radius`): 12 px** (manifest — potwierdzone na makietach). Warianty do dodania w Design:
  `--radius-sm: 8px` (chipy, badge, plakietki-znaczniki), `--radius-lg: 16px` (duże panele/karty zlecenia),
  `--radius-pill: 999px` (kropki statusu, przyciski kołowe, liczniki).
- **Odstępy (`--sp-1..8` = 4/8/12/16/24/32/48/64):** skala startera zostaje — makiety są przewiewne. Karty
  formularza rozdzielone `--sp-4/5`; pola wysokie.
- **Obrysy — DWA rejestry (manifest: „wyraźne ciemne obrysy"):**
  - **Hairline** `--border-w: 1px solid var(--color-border)` (`#E4DDCE`) — dzielniki wierszy, standardowe karty
    danych (kafle pulpitu, karty listy) razem z krótkim cieniem.
  - **Sygnatura** — `2px solid var(--color-outline)` (`#22262B`) — karty-naklejki (hero „Potrzebuję pomocy" /
    „Jestem fachowcem"), przyciski-naklejki, plakietki znaczników. To „warsztatowy" akcent, rezerwowany dla
    wyróżnień, nie dla każdej karty (na makietach panel = hairline, landing hero = ciemny obrys).
- **Cienie — „krótkie offsetowe" (manifest):** kierunkowy, krótki, mało rozmyty (efekt naklejki).
  - `--shadow-sm: 0 2px 0 rgba(34,38,43,.08), 0 2px 6px rgba(34,38,43,.06)` — karty danych, pola.
  - `--shadow-md: 0 3px 0 rgba(34,38,43,.10), 0 6px 16px rgba(34,38,43,.10)` — panele wyróżnione, modale.
  - `--shadow-sticker: 4px 4px 0 rgba(34,38,43,.12)` (sygnatura) — twardy offset dla kart-naklejek i plakietek.
  - Tint grafitowy (`34,38,43`), nie czysta czerń. **Zero neonów, poświat, kolorowych cieni.**

### Komponent-sygnatura: „papierowy znacznik" (etykieta zlecenia z warsztatu)

Manifest: „etykiety zleceń stylizowane na papierowe znaczniki z warsztatu". Na makietach — kraft/manila tag ze
sznurkiem, oczkiem i perforacją (`#2417`, `ZLECENIE #2470`, `ZLECENIE / LOKALNE / PILNE`). Budowa CSS-em:

```
.tag {
  position: relative; display: inline-flex; align-items: center; gap: var(--sp-2);
  background: var(--color-tag-paper);                 /* #E9DABB kraft */
  color: var(--color-text);                           /* grafit 11:1 na kraft */
  border: 1.5px solid var(--color-tag-stitch);        /* obrys przeszycia */
  border-radius: var(--radius-sm);
  padding: var(--sp-1) var(--sp-3) var(--sp-1) var(--sp-4);
  font-family: var(--font-head); font-weight: 700; letter-spacing: .04em; text-transform: uppercase;
  font-size: 13px; transform: rotate(-2deg);          /* lekko obrócona etykieta */
  box-shadow: var(--shadow-sticker);
}
/* perforacja/przeszycie: przerywana linia wzdłuż etykiety */
.tag::after {
  content: ""; position: absolute; inset: 3px auto 3px 6px; width: 0;
  border-left: 1.5px dashed var(--color-tag-stitch); opacity: .7;
}
/* oczko + sznurek: kółko z otworem po lewej (pseudo-element ::before) */
.tag::before {
  content: ""; flex: none; width: 10px; height: 10px; border-radius: 50%;
  border: 2px solid var(--color-tag-stitch); background: var(--color-bg);
}
.tag__id { color: var(--color-accent); }              /* numer w akcencie — duży/bold ≥13px */
```

Wariant pilny „WYMAGA UPRAWNIEŃ / PILNE": obrys `--color-accent` 2px + krótkie **ukośne pasy ostrzegawcze**
(hazard stripes) w rogu jako `repeating-linear-gradient`. Numer zlecenia (`--color-tag-paper` daje 3.4:1 dla
pomarańczu → tylko duży/bold, ≥13 px, spełnione).

---

## 4. Mapowanie 1:1 na `:root` (`base.css` startera)

Tokeny obecne w `base.css` — wartości docelowe (przenieść w kroku Design):

| Token `:root` | Wartość docelowa | Zmiana vs starter |
|---|---|---|
| `--color-bg` | `#F3EFE5` | ← `#ffffff` |
| `--color-surface` | `#FFFDF7` | ← `#f7f8fa` |
| `--color-text` | `#22262B` | ← `#14161a` |
| `--color-text-muted` | `#6A6252` | ← `#5b6472` |
| `--color-accent` | `#F05A28` | ← `#2563eb` |
| `--color-accent-hover` | `#C63E0C` | ← `#1d4ed8` |
| `--color-accent-text` | `#FFFFFF` | bez zmian |
| `--color-border` | `#E4DDCE` | ← `#e3e6eb` |
| `--color-success` | `#2F7D57` | ← `#158a52` |
| `--color-warning` | `#B4790F` | ← `#b45309` |
| `--color-error` | `#B22F1B` | ← `#c02626` |
| `--font-head` | `"Archivo", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` | ← system-ui |
| `--font-body` | `"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` | ← system-ui |
| `--radius` | `12px` | ← `8px` |
| `--border-w` | `1px` | bez zmian |
| `--shadow-sm` | `0 2px 0 rgba(34,38,43,.08), 0 2px 6px rgba(34,38,43,.06)` | ← neutralny |
| `--shadow-md` | `0 3px 0 rgba(34,38,43,.10), 0 6px 16px rgba(34,38,43,.10)` | ← neutralny |

Spacing (`--sp-1..8`), `--maxw`, skala `--z-*` — **bez zmian** (kanon fabryki).

**Nowe tokeny do dopisania w Design** (base.css dziś nie ma): `--radius-sm: 8px`, `--radius-lg: 16px`,
`--radius-pill: 999px`, `--color-success-text: #256341`, `--color-warning-text: #8A5A08`,
`--color-outline: #22262B`, `--color-tag-paper: #E9DABB`, `--color-tag-stitch: #8A7A57`,
`--shadow-sticker: 4px 4px 0 rgba(34,38,43,.12)`.

---

## 5. Komponenty kluczowe niszy

Poglądowa specyfikacja tokenowa — pełna biblioteka powstaje w kroku Design (`design-system/`).

### 5.1 Karta zlecenia (`.job-card`) — pulpit/lista fachowca
Układ z `podglad-panel`: **[papierowy znacznik #ID] · [zdjęcie 1:1] · [nazwa + dzielnica] · [odległość] · [termin]**.
- Kontener: `--color-surface`, `--radius-lg`, hairline `--border-w` `--color-border`, `--shadow-sm`. Klikalny cały
  wiersz (`cursor:pointer`, hover = `--shadow-md`, NIE scale).
- Zdjęcie: kwadrat/miniatura `--radius` po lewej (na mobile u góry).
- Nazwa naprawy: `--font-head` 700, `--color-text`, 18–22 px. Dzielnica pod nią: ikona pinezki (Lucide,
  `--color-accent`) + `--color-text-muted` 14 px.
- Odległość: `.stat--md .stat--accent` (`1,2` pomarańcz) + `.stat__unit` „km" muted.
- Termin: ikona kalendarza + `Dziś`/`Jutro` (`--color-text-muted`, 14 px) nad godziną `.stat--md` (godzina „na
  dziś" może być `--color-success` = pozytyw; zwykły termin grafit).
- Znacznik `#ID`: komponent `.tag` (papierowy) przyklejony do lewej krawędzi, lekko obrócony.

### 5.2 Chip statusu (`.chip`) — **zieleń TYLKO dla done/aktywnych pozytywów**
Małe, WERSALIKI, `letter-spacing .04em`, waga 700, ~12–13 px, `--radius-sm`.
- **aktywne / zrobione (pozytyw):** kropka `--color-success` (`.dot`) + etykieta `--color-success-text` (drobny
  tekst → wariant AA na piasku). To JEDYNE miejsce zieleni.
- **nowe / oczekuje:** tło `--color-surface`, obrys 1.5px grafit, etykieta grafit (neutralne).
- **do poprawki / uwaga:** obrys 1.5px `--color-accent`, tekst `--color-accent-hover` (`#C63E0C`, drobny AA).
- **pilne / wymaga uprawnień:** obrys pomarańczowy + hazard-stripes (patrz §3 sygnatura); NIE czerwień.
- **błąd / odrzucone:** obrys + tekst `--color-error`.

### 5.3 Badge Firma / Osoba prywatna (`.badge-actor`)
Rozróżnienie zleceniodawcy/wykonawcy — neutralne, NIE zielone (zieleń zarezerwowana dla statusów).
- **Osoba prywatna:** ikona osoby (Lucide) + label; tło `--color-surface`, obrys `--color-border`, tekst
  `--color-text-muted`. Wersalikowa, `--radius-sm`.
- **Firma:** ikona budynku/teczki + label; **wypełnienie grafit `--color-text`, tekst biały** (solidny, „zweryfikowany
  podmiot") — wyróżnia się bez użycia koloru-statusu.

### 5.4 Znacznik „wymaga uprawnień" (`.req-license`)
Ostrzeżenie kompetencyjne (np. instalacja gazowa/elektryczna z uprawnieniami). NIE błąd → **warning, nie error**.
- Ikona tarczy/certyfikatu + tekst `--color-warning-text` (`#8A5A08`, AA), obrys/ikona `--color-warning`,
  tło `--color-surface`. Wariant „naklejka" na karcie: hazard-stripes w rogu (sygnatura), obrys 2px `--color-warning`.

### 5.5 Pasek liczb pulpitu (`.stat-bar`) — „7 nowych zleceń · 3 do 5 km · 2 na dziś"
Z `podglad-panel`: rząd 3 kafli. Każdy kafel:
- `--color-surface`, `--radius-lg`, hairline + `--shadow-sm`.
- Ikona w kwadraciku `--radius`: dzwonek/pinezka/kalendarz. Kolor kafla-ikony: `--color-accent` (nowe, termin)
  lub `--color-success` (blisko — pozytyw). Ikona biała na wypełnieniu (accent 3.39 / green 5.01 — ikona to duży glif ✓).
- Liczba: `.stat--lg` (`7`, `3`, `2`) grafit; podpis „nowych zleceń" / „do 5 km" / „na dziś" `--color-text-muted` 14 px.
- Mobile (§6): 3 kafle w rzędzie schodzą do poziomego scrolla albo stacku 1-kol.; liczby pozostają wielkie.

### 5.6 Przycisk „Opublikuj bezpłatnie" (`.btn-primary`)
Główne CTA klienta (`podglad-glowna`, `podglad-landing`).
- Wypełnienie `--color-accent`, tekst `--color-accent-text` biały, **waga 600–700, ≥18 px** (spełnia 3.39:1 dla
  dużego/bold), ikona metki (Lucide) + label. `--radius` 12, wysokość **≥48 px**, `--shadow-sm`.
- Hover/pressed → `--color-accent-hover` (`#C63E0C`). Na mobile: `btn-block` (pełna szerokość, sticky u dołu kreatora).
- Wariant zielony kołowy (`.btn-circle--pos`, „Jestem fachowcem"): wypełnienie `--color-success`, biała strzałka
  (5.01 ✓), `--radius-pill`. Zieleń tu = pozytywne wejście fachowca, nie dekoracja.

### 5.7 Formularz krokowy „Dodaj zlecenie" (`.wizard` + senior-friendly)
Insight z briefu: klient musi dodać zlecenie **w < 1 minutę**. Wykorzystać starterowy `@dsWizard`, ale w trybie
senior-friendly (jedna myśl / ekran):
- **1 kolumna zawsze.** Duże pola: input/select wysokość **≥48 px**, tekst **≥16 px**, `--radius` 12, `--color-surface`,
  obrys `--color-border` (focus: obrys 2px `--color-accent`).
- Każde pole ma **widoczny `<label>`** (placeholder ≠ label): „Zdjęcie (opcjonalnie)", „Co trzeba naprawić?",
  „Kategoria", „Lokalizacja", „Termin realizacji".
- Kategoria/termin jako **duże przyciski-segmenty** (`Dziś` / `Jutro` / `W tym tygodniu`) — wybrany = wypełnienie
  `--color-accent` + biały label (≥16 px, bold, spełnia); niewybrane = surface + obrys. Cel dotyku ≥48 px.
- Pole zdjęcia: duży dropzone z ikoną aparatu `--color-accent`, label „Dodaj zdjęcie".
- Licznik znaków opisu (`34/80`) `--color-text-muted`, 13 px, w rogu pola.
- CTA „Opublikuj bezpłatnie" przyklejone do dołu (sticky), pełna szerokość, ≥48 px.
- Po zapisie ZAWSZE feedback (loading → „Opublikowano" / błąd przy polu). `inputmode` dopasowany (np. brak — sam wybór).

---

## 6. Mobile-first (390 px) + dostępność seniorów

Nisza pracuje z telefonu, w domu i „między zleceniami" (manifest). Grupa: także **seniorzy** i osoby nietechniczne.

- **Breakpoint bazowy 390 px** (projektujemy od telefonu w górę).
- **Tekst min. 16 px** dla treści i pól (etykiety/podpisy min. 13–14 px). Nie zmniejszać poniżej — komfort wzroku.
- **Cele dotykowe ≥44 px** (preferowane **48 px**): przyciski, wiersze kart zleceń, chipy klikalne, segmenty
  terminu, filtry kategorii.
- **Jedna kolumna** poniżej ~640 px: kafle pulpitu, karta zlecenia (zdjęcie u góry), sekcje kreatora, wejścia
  landingu („Potrzebuję pomocy" / „Jestem fachowcem") układają się pionowo.
- **Kontrast AA wszędzie** — patrz tabela §1; drobny tekst kolorowy zawsze w wariancie AA (`-hover` / `-text`).
- **Sticky CTA** kreatora u dołu ekranu (główna akcja pod kciukiem). FAB/akcje nie zasłaniają treści (starter:
  `initFabAutoHide`).
- Ikony: **wyłącznie SVG z jednego zestawu** (rekomendacja **Lucide** — konturowe, techniczne), stały `viewBox 24`,
  **zakaz emoji jako ikon**.
- `:focus-visible` widoczny (obrys 2px `--color-accent`) na wszystkim klikalnym; `prefers-reduced-motion`
  respektowany (bez pulsów/gadżetów).
- Zero poziomego scrolla strony: paski 3-kaflowe / szerokie tabele → `overflow-x:auto` w kontenerze, nie rozpychanie
  viewportu.

---

## 7. Czego NIE robić (anty-wzorce)

- **NIE ciemne tła.** Aplikacja jest **jasna** (piaskowy + kremowe karty) wg manifestu — zakaz dark mode i ciemnych
  sekcji (`feedback-sklepy-zakaz-ciemnych-tel`, `@dsGeneration` jasny motyw).
- **NIE generyczne gradienty AI**, tęczowe/pastelowe przejścia, glassmorphism, neumorphism, neony, kolorowe poświaty.
  Akcent to **jedna** pomarańcz + jedna zieleń statusów. Zero fioletu/niebieskiego „typowy SaaS".
- **Zieleń nie do dekoracji.** `--color-success` / `--color-success-text` **tylko** dla pozytywnych statusów
  (`done`, aktywne, „na dziś", potwierdzenia). Nie barwić nią przycisków neutralnych, tła sekcji, ikon ogólnych.
- **NIE drobny biały tekst na pomarańczy** ani drobny pomarańczowy tekst na jasnym tle — kolor na akcencie/akcencie
  tylko dla dużych/bold; drobne → warianty `-hover` / `-text` (§1).
- **NIE cienkich „modowych" krojów** ani AI-poetyckich ozdobników (`feedback-landing-anti-ai-poetic`,
  `feedback-landing-no-purple-prose`). Krój = mocny, roboczy grotesk.
- **NIE zaokrąglać „bąbelkowo".** Geometria umiarkowana (12 px), charakter techniczno-warsztatowy, nie zabawkowy.
- **NIE rezygnować z sygnatury** (papierowy znacznik z perforacją/sznurkiem, hazard-stripes dla pilnych, ciemne
  obrysy naklejek) na rzecz sterylnego, chłodnego UI — „warsztatowość" to wyróżnik marki.
- **NIE emoji jako ikony**, nie mieszać zestawów ikon — jeden zestaw konturowy (Lucide).

---

> **Adnotacja:** ten plik (04) = **kontrakt tokenów** wyprowadzony z manifestu (kanon) + potwierdzony samplingiem
> makiet. Ekrany i landing stylują się WYŁĄCZNIE tokenami/komponentami z `base.css` — stylowanie ad hoc zabronione.
> Realizacja (wpis do `:root`, biblioteka `.job-card/.chip/.tag/.stat-bar/...`, podglądy `design-system/`) = krok **Design**.
