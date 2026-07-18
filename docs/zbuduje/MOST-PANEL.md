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
  (`brand/`, `refs/`, `makiety/`, `assets/`, `panel/`). Publiczny URL:
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
    na WebP), klik = lightbox. Inaczej → **chip** z ikoną (klikalny gdy url `http(s)`, w innym razie
    pokazuje badge `storage`).
- **Wniosek:** makiety/branding/sceny/dowody → `storage='supabase'` + URL Storage = miniatury.
  Lokalne `.md` (KARTA/PASZPORT/PLAN/PRZEWODNIK/MAPA) → `storage='desktop'`, `url` = ścieżka Desktop
  = chip (nieklikalny). Repo (kod) → `storage='repo'` = chip.

## Pułapki (P0)
1. **Checklisty VERBATIM.** Panel merguje po dokładnym `t` z `WS` w `tn-sklepy/projekt.html`.
   Każda literówka/„drobne ulepszenie" tworzy sierotę (podwójna pozycja). Najbezpieczniej: wyciągnąć
   `WS[step_key].check` skryptem z projekt.html (parser stringów w `[]` respektujący cudzysłowy).
2. **Ceny w KOLUMNACH, nie w fields.** `product_meta(...)`, nie `step_update(fields=...)`.
3. **`unit_profit` GENERATED** — nie pisać (400/„cannot insert into generated column").
4. **Storage rozróżnia miniaturę** — `repo`/`desktop` NIGDY nie dają miniatury (celowo, dla lokaliów).
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
ps.artifact_add(PROJ, pid, "lp_dane", "doc", r"…\drapek\KARTA-PRAWDY.md", label="KARTA-PRAWDY.md", storage="desktop")
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
