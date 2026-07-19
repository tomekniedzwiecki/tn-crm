# MOST-PANEL — kontrakt syncu fabryki landingów ↔ panel „tn-sklepy"

**Status: OBOWIĄZUJE (od 2026-07-18).** Narzędzie: `scripts/mockup-tools/panel-sync.py`.
Skrót operacyjny (mapa faza→krok) jest w `STANDARD-LANDING-SKLEPY.md §1-sync` — TU jest pełny
kontrakt, reguły renderowania panelu i pułapki.

## Po co
Fabryka pracuje w plikach na Desktopie (`FABRYKA-*/<slug>/…`) i w Storage. Panel `/tn-sklepy`
(`tn-crm/tn-sklepy/projekt.html`) = jedyne okno Tomka na postęp. MOST przenosi stan fazy do
tabel `wf2_*`, żeby panel pokazał: krok DONE, wypełnione pola, checklistę i oglądalne artefakty
(makiety/branding/dowody jako miniatury, dokumenty jako chipy).

**Zasada twarda: sync jest częścią „definicji ukończenia" fazy.** Faza bez syncu = niewidoczna.

## Konfiguracja
- Projekt Supabase: `yxmavwkwnfuphjqbelws` (to główny projekt CRM — NIE `ZE_SUPABASE_URL` z `.env`,
  które wskazuje inny projekt sparingu!). REST `…/rest/v1`, Storage `…/storage/v1`.
- Klucz: `SUPABASE_SERVICE_KEY` z `c:\repos_tn\tn-crm\.env` (service-role `sb_secret_*`, bypass RLS).
  Skrypt czyta go sam (Pythonem, UTF-8); można nadpisać przez env `SUPABASE_SERVICE_KEY` / `TN_CRM_ENV`.
- Runtime: `scripts/mockup-tools/.venv` (ma `requests` + `pillow`).
- Storage: bucket **`attachments`** (publiczny), folder-prefix **`bud-assets/<slug>/`**
  (`brand/`, `refs/`, `makiety/`, `assets/`, `panel/`, `ads/` [kreacje reklamowe + `ads/dowody/`]).
  Publiczny URL:
  `…/storage/v1/object/public/attachments/bud-assets/<slug>/<plik>`.

## Model danych (tabele `wf2_*`)
- **`wf2_products`** — portfel. Kroki `lp_*`/`pl_*`/`ads_*` są `scope=product`. Ceny/koszt/status
  = KOLUMNY: `price, cost_purchase, cost_shipping, fees_pct(dom.2.0), margin_mode(test|scale),
  status(kandydat|zaakceptowany|w_budowie|gotowy|live|test|winner|kill|skala), slug, repo_path,
  cover_url, platform_product_id, checkout_url, platform_name, platform_page_url, campaign_id,
  video_url…`. `unit_profit` = **GENERATED** (`price − cost_purchase − cost_shipping − price·fees_pct/100`)
  — nigdy nie zapisywać.
- **`wf2_steps`** — postęp. Unik `(project_id, product_id, step_key)`. `status ∈
  pending|in_progress|done|skipped|blocked`. `data jsonb = {note, fields{}, checklist[{t,done}]}`.
  `done` → `completed_at=now`, `completed_by='fabryka'`.
- **`wf2_artifacts`** — oglądalne kafle. `kind` (bez CHECK — dowolny string; używane:
  image|mockup|makieta|makieta_mobile|brand|branding|styl_master|proof|dowod|scena|gallery|
  ad_creative|video|doc|link|screenshot_final|gate_check|landing_live). `storage` CHECK ∈
  **supabase|repo|desktop|external**. `meta jsonb` (np. `{section, viewport, ssim}`). Wiązanie z
  krokiem = `(product_id, step_key)`. Bez uniku → dedup po `(product_id, step_key, url)`.
- **`wf2_projects.links jsonb`** = pasek „Podglądy" (`[{label, url, icon}]`).
- RPC **`wf2_ensure_steps(p_project)`** = dosiewa brakujące instancje kroków (project + product ×
  aktywne defs; NOT-EXISTS, idempotentne). Wołane po `link_product`.

## API narzędzia (importowalne + CLI)
Import: `import importlib.util` po ścieżce (nazwa z myślnikiem) lub dopisać katalog do `sys.path`
i `import panel_sync as ps`. Każda funkcja loguje `insert/update/skip + id`.

| Funkcja | Sygnatura | Zachowanie (idempotentne) |
|---|---|---|
| `link_product` | `(project, tt, name, slug=None, sort=None, cover=None, supplier=None) → product_id` | GET po `(project, tt_product_id)`; jest→zwróć id; brak→POST (`status='w_budowie'`, fallback `kandydat`+nota gdy CHECK; `sort`=COALESCE(sort, licznik portfela); `cover_url`), potem `wf2_ensure_steps`. |
| `step_update` | `(project, product, step, status=None, note=None, fields=None, checklist=None) → step_id` | GET po `(project, product, step_key)`; merge `data` (fields=old‖new, note nadpisz, checklist nadpisz); PATCH gdy jest, POST gdy brak; `done`→completed_at/by. `product=None` → krok projektu. |
| `artifact_add` | `(project, product, step, kind, url, label=None, meta=None, storage='supabase') → id` | dedup GET po `(product, step, url)`; jest→PATCH label/meta; brak→POST. |
| `product_meta` | `(product, patch: dict) → dict` | WHITELISTA kolumn (patrz wyżej + `name, video_cost_usd, video_ai_labeled, ads_creatives, notes`); poza listą = pominięte z logiem; PATCH. |
| `project_link_add` | `(project, label, url, icon='ph-link') → links` | GET links; dedup po `label`; PATCH. |
| `storage_upload` | `(local, dest, bucket='attachments', content_type=None, upsert=True, max_width=None, to_webp=False, quality=82) → public_url` | POST `/storage/v1/object/{bucket}/{dest}` z `x-upsert`; opcjonalny PIL downscale + WebP. |
| `public_url` | `(path, bucket='attachments') → url` | buduje publiczny URL. |
| `cost_add` | `(project, product, amount, kind='fal', currency='USD', step=None, stage=5, note=None) → id` | Koszt do `wf2_costs` (tabela BEZ uniku). Dedup po `(project, product, step, kind, note)` — **bez `note` NIE deduplikuje** (świadomie: kolejne pozycje). `step` = kolumna `step_key`. ⚠ Fabryka banerów: koszt fal loguje `ad-forge --finalize` sam (`kind='fal'`, `step='agr_generacja'`) — operator NIE woła własnego `cost_add` (noty się różnią → dublet w nagłówku bloku). Manus usunięty z modułu (19.07). |
| `activity_add` | `(project, action, description, actor='auto') → id` | Wpis na oś czasu `wf2_activities` (log fabryki, kropka zielona `actor='auto'`). Bez dedup — każde wołanie = nowy wiersz. |

**CLI:** `panel-sync.py {link|step|artifact|meta|projlink|upload} …` (`-h` po szczegóły).
`step`/`artifact`: `product='-'`/`projekt` = krok projektu. `--fields/--checklist/--meta/patch` = JSON.
`--checklist` przyjmuje listę stringów (owija w `{t,done:true}`) lub gotowe `{t,done}`.
⚠️ Polskie znaki przez CLI na Windows = ryzyko cp1250 — do backfillu z PL tekstem **importuj w Pythonie**.

## Jak panel renderuje (co warunkuje efekt)
- **Krok**: kafel etapu czyta `status` + `data.fields` (mapowane na pola z `WS[step_key].fields`)
  + `data.checklist`. `mergedChecklist` łączy zapis z szablonem **po dokładnym tekście `t`**.
- **Ceny/marża**: panel liczy z KOLUMN produktu (`price/cost/fees/unit_profit`), NIE z `data.fields`.
- **Artefakt → miniatura vs chip** (`artifactsGallery`):
  - `webVisible = storage ∉ {repo, desktop}`.
  - `isImg = webVisible ∧ ( url ma rozszerzenie png|jpe?g|webp|avif|gif ∨ kind ∈ {mockup, makieta,
    makieta_mobile, scena, dowod, proof, ad_creative, screenshot_final, styl_master, gallery,
    branding, brand} )`.
  - `isImg` → **miniatura** (render API `…/render/image/public/…?width=360&resize=contain`; działa też
    na WebP), klik = lightbox. Inaczej → **chip** z ikoną (klikalny gdy url `http(s)` LUB url
    `wf2-docs/…` — wtedy `openPrivateDoc()` robi signed URL 1 h z sesji team; w innym razie
    pokazuje badge `storage`).
- **Wniosek:** makiety/branding/sceny/dowody → `storage='supabase'` + URL Storage = miniatury.
  **DOKI (.md/.json) → `panel-sync.py doc` = upload do PRYWATNEGO `wf2-docs/<slug>/` + artefakt
  `storage='supabase'` z url `wf2-docs/…` = KLIKALNY chip** (Tomek 19.07: „dostępne z każdego
  miejsca"; bucket prywatny, bo karta/ledger niosą koszty i marże — publiczny `attachments`
  ZAKAZANY dla doków; migracja `20260719e_wf2_docs_bucket`). ⛔ `storage='desktop'` dla nowych
  artefaktów = ZAKAZ (martwy chip). Repo (kod) → `storage='repo'` = chip.

## 🗺️ KATALOG MAPOWAŃ (artefakt/etap fabryki → krok panelu + kind + fields) — EGZEKWOWANY
**To jest tabela prawdy mostu.** Każdy etap/artefakt fabryki ma DOKŁADNIE JEDNO miejsce w panelu.
Egzekwuje `gate-check.py` blok `panel_sync` (severity FAIL) — kolumna „Gate" wskazuje regułę w
`gate-manifest.json`, która pilnuje danego wiersza (sync = część definicji DONE, nie uznaniowość agenta).

| Etap / artefakt fabryki | Krok panelu | kind artefaktu | Co w `data.fields` / kolumnach | Gate (`panel_sync`) |
|---|---|---|---|---|
| wybór/kalkulacja produktu | *(wiersz produktu)* | — | KOLUMNY `price, cost_purchase, cost_shipping, fees_pct, margin_mode, status, slug, repo_path` | `karta_kolumny_wymagane` |
| F0 kadry keep (galeria ref) | `lp_dane` | `gallery` | `{source_ok, cena_pl, koszt_landed, marza, ocena, zdjecia_keep, wideo_keep}` | `kroki_done[lp_dane]` |
| F0 KARTA-PRAWDY.md / PASZPORT.md / GALERIA.md / WIDEO.md / LEDGER.md | `lp_dane` | `doc` (**`panel-sync doc` → wf2-docs, klikalny chip**) | `{karta_url, paszport_url}` (url = `wf2-docs/<slug>/…`) | `kroki_done[lp_dane]` |
| F1 PLAN.md / PRZEWODNIK-GRAFICZNY.md | `lp_plan` | `doc` (wf2-docs) | `{motyw, sekcje, tor_i_demo, plan_url, przewodnik_url}` | `kroki_done[lp_plan]` |
| F2.5 styl-master | `lp_styl_marka` | `styl_master` | `{marka_nazwa, slug, font, paleta, styl_master_url, brand_dir}` | `kroki_done[lp_styl_marka]` |
| F2.5 favicon / wordmark / logo-combo | `lp_styl_marka` | `branding` | *(j.w.)* | `kroki_done[lp_styl_marka]` |
| F2 makiety desktop | `lp_makiety` | `makieta` | `meta{section, viewport:'desktop'}` · `{sekcje_count, akcept}` | `artefakty_liczba[makiety desktop]` (stem, tol 2) |
| **F2 makiety mobile** *(nowe 18.07)* | `lp_makiety` | **`makieta_mobile`** | `meta{viewport:'mobile'}` | `artefakty_liczba[makiety mobile]` (stem, tol 2) |
| F3 sceny produkcyjne (full-bleed) | `lp_grafiki` | `scena` / `image` | `{assets_dir, distinct_views, waga_first}` | `artefakty_liczba[grafiki produktowe]` (stem, tol 2) |
| **F3 galeria HIGH (`g*-hq`)** *(nowe 18.07)* | `lp_grafiki` | `gallery` / `image` | *(j.w.)* | `artefakty_liczba[grafiki produktowe]` (stem, tol 2) |
| F3 MAPA-ASSETOW.md | `lp_grafiki` | `doc` (wf2-docs) | `{mapa_url}` | `kroki_done[lp_grafiki]` |
| **F3A WIERNOSC.md** *(nowe 18.07)* | `lp_grafiki` | **`doc`** (token `wiernosc`) | — | **`doc_wymagane[WIERNOSC.md]`** |
| F4 kod (index.html) | `lp_kod` | `link` / `screenshot_final` | `{preview_url, repo_path, video_count, moduly_uzyte}` | `kroki_done[lp_kod]` |
| **F4 footer (`footer@1`)** *(nowe 18.07)* | `lp_kod` | *(fields)* | `moduly_uzyte` zawiera `footer@1` | **`kod_wzmianki[footer]`** (FAIL) |
| **F4 logo/brand w kodzie** *(nowe 18.07)* | `lp_kod` | *(fields)* / `branding` na `lp_styl_marka` | wzmianka `favicon/wordmark` | **`kod_wzmianki[logo]`** (WARN) |
| **F5 hero-video / wideo** *(nowe 18.07)* | `lp_zycie` | **`video`** (+ `lp_kod.video_count`) | `{tor_i_done, motion_dna}` | **`kod_wzmianki[wideo]`** |
| F5 życie / choreografia | `lp_zycie` | `video` / `screenshot_final` | `{motion_dna, interakcja_flagowa, tor_i_done}` | `kroki_done[lp_zycie]` *(opcjonalny→WARN)* |
| F7.1 kompozyty / contact-sheety | `lp_dopasowanie` | `dowod` / `proof` | `{sekcje_done, ssim_min, dopasowanie_dir}` | `artefakty_liczba[dowod]` *(obecnosc)* + `kroki_done` |
| F6/F7/F8 finisz | `lp_finisz` | `gate_check`, `landing_live`, `screenshot_final` | `{gate_check, landing_url, nowe_wnioski}` + `product_meta(status:'gotowy')` | *(karta: `status`)* |
| **G2 kreacje ads (3× demo/problem/lifestyle, 4:5; `proof` opcjonalny)** *(rev2 19.07)* | `ads_grafiki` | **`ad_creative`** | blob `ads_creatives[]{angle,format,headline,badge,image_url,approved}` + rejestr `wf2_creatives` (media_type='image', angle/format/ai_labeled) → `bud-assets/<slug>/ads/ad_<angle>_<fmt>.png` | *(bramka ludzka: 3× akcept toggle + milestone `agr_final`)* |
| **G3–G5 dowody bramek QA** *(rev2 19.07)* | `ads_grafiki` | **`proof`** | miniatury@320px / safe-zones / pHash z `ad-gate.py` → `bud-assets/<slug>/ads/dowody/` | *(bramka: `ad-gate.py` pomiary + werdykt agenta wg SSOT)* |

**⚖️ REGUŁA KATALOGU (twarda): nowy typ artefaktu/etapu MUSI dostać wiersz w TEJ tabeli ZANIM
wejdzie do fabryki** — inaczej nie wiadomo, gdzie w panelu ląduje, i most staje się znów „na pamięć".
Wiersz katalogu = para {miejsce w panelu (krok+kind+fields)} + {reguła w `gate-manifest.json panel_sync`,
która to egzekwuje} (`kroki_done` / `artefakty_liczba` / `doc_wymagane` / `kod_wzmianki`). Dodanie nowego
etapu bez wiersza tutaj i bez reguły w manifeście = etap NIEKOMPLETNY (blokada w code-review fabryki).
Progi tolerancji i severity są DANE w manifeście (tuning tam, nie w kodzie checka).

## Pułapki (P0)
1. **Checklisty VERBATIM.** Panel merguje po dokładnym `t` z `WS` w `tn-sklepy/projekt.html`.
   Każda literówka/„drobne ulepszenie" tworzy sierotę (podwójna pozycja). Najbezpieczniej: wyciągnąć
   `WS[step_key].check` skryptem z projekt.html (parser stringów w `[]` respektujący cudzysłowy).
2. **Ceny w KOLUMNACH, nie w fields.** `product_meta(...)`, nie `step_update(fields=...)`.
3. **`unit_profit` GENERATED** — nie pisać (400/„cannot insert into generated column").
4. **Storage rozróżnia miniaturę** — `repo`/`desktop` NIGDY nie dają miniatury; **doki = ZAWSZE
   `panel-sync doc` (wf2-docs, klikalny chip), `storage='desktop'` dla nowych artefaktów ZAKAZANY**.
5. **Wiązanie** = `product_id` + `step_key`. Zły `step_key` = artefakt „w kosmosie".
6. **Duży PNG** (makieta ~2 MB) → `storage_upload(max_width=1440, to_webp=True, quality=82)` (~40–160 KB).
7. **Projekt vs produkt scope**: kroki `lp_*/pl_*/ads_*` są per-produkt (`product` ≠ None); statusy
   projektu (`start→budowa→…`) przez `product_meta`? NIE — to `wf2_projects`; PATCH bezpośrednio.

## Przykład referencyjny (Drapek, backfill F0–F2, 18.07)
```python
import panel_sync as ps
PROJ = "baacc66f-3dd0-462a-9799-de9c7aaea639"; TT = "af7d0a29-b5b7-4884-adcf-06159ddc92e5"
cover = ps.public_url("bud-assets/drapek/refs/prod-1.png")
pid = ps.link_product(PROJ, TT, "Drapek", slug="drapek", sort=5, cover=cover)
ps.product_meta(pid, {"name":"Drapek","slug":"drapek","price":149.90,"cost_purchase":66.64,
                      "margin_mode":"test","status":"w_budowie","repo_path":"sklepy/tomek-niedzwiecki/drapek"})
ps.step_update(PROJ, pid, "lp_dane", status="done",
    note="F0 wykonane w fabryce; KARTA/PASZPORT w archiwum",
    fields={"source_ok":True,"cena_pl":"149,90 zł","koszt_landed":"66,64 zł","marza":"~56%",
            "ocena":"★4,7 / 182 / 94,3%","zdjecia_keep":4,"wideo_keep":5},
    checklist=[{"t":t,"done":True} for t in WS_lp_dane_check])   # ← VERBATIM z projekt.html
ps.artifact_add(PROJ, pid, "lp_dane", "gallery", cover, label="Referencja produktu 1")
ps.doc_add(PROJ, pid, "lp_dane", r"…\drapek\KARTA-PRAWDY.md", slug="drapek", label="KARTA-PRAWDY.md")  # → wf2-docs, klikalny chip
url = ps.storage_upload(r"…\makiety\03-problem.png", "bud-assets/drapek/makiety/03-problem.webp",
                        max_width=1440, to_webp=True, quality=82)
ps.artifact_add(PROJ, pid, "lp_makiety", "makieta", url, label="03 · Problem",
                meta={"section":"03-problem","viewport":"desktop"})
```
Wynik w panelu: Drapek w portfelu (sort 5, cover, `unit_profit≈80,26`), kroki `lp_dane/lp_plan/
lp_styl_marka/lp_makiety` = DONE (checklisty 7/6/6/8 zaznaczone), 26 artefaktów (2 gallery + 4 doc-chip
+ 4 branding/styl + 16 makiet-miniatur). Pozostałe kroki `pending`. 5 kandydatów nietkniętych.

## Idempotencja
Cała ścieżka `GET → (PATCH|POST)`; uploady `x-upsert` (nadpisują ten sam obiekt); artefakty dedup po
URL. Puszczenie backfillu 2× = ten sam stan (Drapek: 26 artefaktów, nie 52). Bezpieczne do restartu fazy.
