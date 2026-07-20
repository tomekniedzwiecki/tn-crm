#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ad-forge.py — tor STATYCZNYCH GRAFIK REKLAMOWYCH (FB/IG 4:5). Silnik = fal (nano-banana-pro/nb2).
SSOT: SPEC-ADFORGE + docs/zbuduje/STANDARD-GRAFIKI-SKLEPY.md.

Zasada nadrzędna (Tomek): PROMPT KIERUNKOWY (cel/wizja/nastrój, EN) — wygląd produktu
niosą WYŁĄCZNIE referencje (image[0] + prefix „reproduce unchanged"). ZERO opisu produktu
słowami. DRUGA zasada: tekst PL i logo NIGDY z modelu — zawsze deterministycznie kodem
(diakrytyki w WERSALIKACH przetrwają w TTF — to cała pointa).

FLOW: dane produktu (REST) → refy+branding (buildProductRefs/readBranding — logika wbudowana) →
copy+wizje scen (1 call wf2-gpt, json) → sceny (gpt-image-2 /images/edits albo gemini przez
wf2-gen) → format 4:5 1536×1920 → kompozycja tekst/logo (Pillow) → QA (ad-gate.py) →
publikacja (panel-sync: storage/creatives/artefakty/koszty/krok).

PIPELINE ETAPOWY v5 (2026-07-19, feedback Tomka „efekt ręki grafika; podziel na etapy jak w video"):
  A. SCENA — engine 'nbpro' (fal-ai/nano-banana-pro/edit, 2K 4:5) z refami rehostowanymi przez
     fal.store; BEST-OF-2 (auto-wybór: ostrość Laplace'a + jasność strefy negative-space layoutu).
  B. KOMPOZYCJA — typografia w górę: hook letter-spacing −1% / interlinia 1.04 / akcent [[słowo]];
     pigułki z gradientem + 1px highlight; cienie dwuwarstwowe; grain gaussa sklejający warstwy.
  C. FINISHER — złożony baner → nbpro („ręka grafika": realistyczne cienie/vignette/grade, głębia).
  D. BRAMKA LITER — pHash cropów nakładek B vs C; przekroczenie progu = finisher odrzucony (zostaje B).
  Koszt ~$0.68/grafika (best-of-2 + finisher) ≈ 2,7 zł. Fal → wf2_costs kind='fal'.

TRYB FULL-DESIGN (default dla nbpro, 2026-07-19 — feedback Tomka „chcę pełną kompozycję banera w jednym akcie"):
  model nano-banana-pro komponuje CAŁY baner w jednym akcie (foto+typografia+pigułki+linie+logo
  zintegrowane, nie „naklejki" Pillow). Brief = buildAdsInstruction (wierność 1:1,
  DNA marki, art-direction per kąt, zakazy uczciwości) + DOKŁADNE polskie napisy verbatim. Best-of-2/kąt.
  BRAMKA TEKSTU = agent (vision) porównuje litera-po-literze; literówka → drugi kandydat / chirurgiczny
  `nano-banana-pro/edit` fix / fallback overlay. `--mode overlay` = stary tor nakładek (fallback).

OPTYMALIZACJA v8 (2026-07-19, „czas/koszt/wartość" — Tomek):
  1. RÓWNOLEGŁOŚĆ PEŁNA: cały etap generacji przebiegu (wszystkie kąty × best-of-2 + bazy hooków +
     A/B) submitowany do kolejki fal NARAZ (jeden submit-all→poll-all, wzorzec gen_batch). Skrypt
     mierzy i wypisuje CZAS ŚCIANY etapu generacji (state.timings).
  2. TRYB PORTFELOWY: --batch <id1,id2,…> / --batch-project <project_id> — produkty generowane
     WSPÓŁBIEŻNIE (jeden batch fal na cały portfel; tagi namespace'owane slugiem), bramki oceniane
     ZBIORCZO (jeden arkusz), publikacja per produkt (tylko --finalize).
  3. BRAMKI ZBIORCZE: JEDEN arkusz kompozytów (siatka: kandydaci + packshot referencyjny) per
     przebieg → dowody/ARKUSZ-BRAMEK.png (ocena całości w 1-2 podejściach vision).
  4. RECLAIM: start przebiegu POLLUJE opłacone joby z ledgera (response_url) do katalogu staging
     (dociąga zamiast re-submitować — po padzie sesji).
  5. WARIANTY HOOKÓW ~$0: --hook-variants N — dodatkowa BAZA sceny „bez nagłówka" (górna strefa =
     czysty negative space) + N nagłówków nakładanych KODEM (font marki) = ad_<angle>_45_h1..hN.png,
     publikowane jako DODATKOWE artefakty ('AD <angle> hook N'); blob ads_creatives BEZ zmian.
  6. A/B SILNIKÓW (--ab-engine nano-banana-2): scena demo dodatkowo przez nano-banana-2/edit (ten sam
     brief/refy) → kompozyt AB-SILNIKI-nbpro-vs-nb2.png (podpisy model+cena; NIE publikowany do panelu).

CLI:
  python ad-forge.py <product_id> [--angles demo,problem,lifestyle] [--engine nbpro|gptimage|gemini]
    [--mode auto|fulldesign|overlay] [--out DIR] [--dry] [--no-register] [--no-finisher] [--quality high|medium]
    [--hook-variants N] [--ab-engine nano-banana-2] [--finalne-dir DIR]
  python ad-forge.py --batch <id1,id2,…> [--finalize] | --batch-project <project_id> [--dry] [--finalize]
  --dry: pobierz dane+refy, zbuduj prompty i copy, wypisz plan — BEZ generacji i BEZ rejestracji.

Uruchamiać venv: scripts/mockup-tools/.venv/Scripts/python.exe
"""
import os
import sys
import io
import re
import json
import time
import math
import shutil
import base64
import glob
import argparse
import subprocess
import importlib.util
from datetime import datetime, timezone

import requests

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8")
    except Exception:
        pass

# ── Konfiguracja stała ────────────────────────────────────────────────────────
SUPABASE_URL = "https://yxmavwkwnfuphjqbelws.supabase.co"
REST = SUPABASE_URL + "/rest/v1"
STORAGE_PUBLIC = SUPABASE_URL + "/storage/v1/object/public"
WF2GPT = SUPABASE_URL + "/functions/v1/wf2-gpt"
WF2GEN = SUPABASE_URL + "/functions/v1/wf2-gen"
OPENAI_EDITS = "https://api.openai.com/v1/images/edits"
OPENAI_GEN = "https://api.openai.com/v1/images/generations"

HERE = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.environ.get("TN_CRM_ENV", r"C:\repos_tn\tn-crm\.env")
FONTS_DIR = os.path.join(HERE, "fonts")
FALLBACK_FONT = os.path.join(FONTS_DIR, "Montserrat-Black.ttf")

FINAL_W, FINAL_H = 1536, 1920            # docelowy 4:5 (ostry pod kampanie płatne)
SQ_W, SQ_H = 1536, 1536                   # docelowy 1:1 (kanon 1080×1080; render wysokorozdzielczy)
GEN_SIZE = "1024x1536"                    # natywne gpt-image-2 (2:3) → smart-crop do 4:5
UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.I)

DEFAULT_ANGLES = ["demo", "problem", "lifestyle"]
ALLOWED_ANGLES = ["demo", "problem", "lifestyle"]

# ── FORMATY BANERA (v10, 2026-07-19 — dyrektywa Tomka „dodaj KWADRAT do fabryki") ──────────────
# '45' = 4:5 pion 1536×1920 (feed Meta, default kanału); '11' = 1:1 kwadrat 1536×1536 (kanon
# 1080×1080; kwadratowe placementy feedu). '916' = rozszerzenie na przyszłość (nie generowane).
# TRYB OSZCZĘDNY 1:1: kwadrat rodzi się z GOTOWEGO finału 4:5 (przekompozycja przez nbpro/edit —
# finał 4:5 jako ref[0] + refy produktu), 1 kandydat/format; bramka LITER (litera-po-literze,
# przekompozycja przerysowuje układ) + szybka wierność robi AGENT na kompozycie KWADRAT-<kąt>.png.
DEFAULT_FORMATS = ["45", "11"]
ALLOWED_FORMATS = ["45", "11"]
FORMAT_LABEL = {"45": "4:5", "11": "1:1", "916": "9:16"}
FORMAT_AR = {"45": "4:5", "11": "1:1", "916": "9:16"}
FORMAT_DIMS = {"45": (FINAL_W, FINAL_H), "11": (SQ_W, SQ_H)}

# ── KONTRAKT VERBATIM: checklista kroku „Banery reklamowe" (ads_grafiki) ──────
# MUSI być ZNAK-W-ZNAK identyczna z WS.ads_grafiki.check w tn-sklepy/projekt.html —
# panel merguje pozycje po DOKŁADNYM tekście `t` (literówka/rozjazd = sierota w panelu,
# patrz docs/zbuduje/MOST-PANEL.md „Checklisty VERBATIM"). Zmiana tu = zmiana TAM w tej
# samej sesji. `--finalize` odhacza pozycje wg FAKTÓW przebiegu (poza „zaakceptowane" —
# to bramka Tomka, zostaje false).
ADS_GRAFIKI_CHECKLIST = [
    "Karta produktu + copy gotowe",
    "Sceny wygenerowane (best-of-2, silnik fal)",
    "Bramki QA: litery PL · wierność produktu · ciągłość · powód kliknięcia — z dowodami",
    "Dowody w bud-assets/<slug>/ads/dowody/",
    "Warianty hooków opublikowane",
    "Rejestr wf2_creatives + koszty zalogowane",
    "Banery zaakceptowane w panelu (toggle ✓)",
]

# Koszt szacunkowy 1 obrazu gpt-image-2 high 1024×1536 ≈ $0.25 — konfigurowalny env.
ADFORGE_IMG_USD = float(os.environ.get("ADFORGE_IMG_USD", "0.25"))

# ── PIPELINE ETAPOWY v5 (nbpro = fal-ai/nano-banana-pro) ──────────────────────
# Domyślny silnik. gptimage/gemini zostają jako fallback.
NBPRO_EDIT = "fal-ai/nano-banana-pro/edit"           # scena z produktem (image_urls wymagane)
NBPRO_T2I = "fal-ai/nano-banana-pro"                 # scena bez produktu (PAIN); base model —
# UWAGA: subpath '/text-to-image' ma zepsutą ścieżkę kolejki fal (response_url 404 przy pobraniu);
# base 'fal-ai/nano-banana-pro' dzieli działającą ścieżkę z '/edit'. (incydent drapek 19.07)
NBPRO_USD = float(os.environ.get("ADFORGE_NBPRO_USD", "0.225"))  # 1 obraz 2K
# A/B SILNIKÓW (v8): nano-banana-2/edit — tańszy „challenger" nbpro do decyzji Tomka (NIE publikowany).
NB2_EDIT = "fal-ai/nano-banana-2/edit"
NB2_USD = float(os.environ.get("ADFORGE_NB2_USD", "0.10"))       # 1 obraz (est $0.08-0.12)
FAL_DIR = os.path.abspath(os.path.join(HERE, "..", "video-factory"))
BEST_OF = 2                                          # kandydatów sceny (auto-wybór ostrość+neg-space)

# Strefa „negative-space" per (angle, kind) — gdzie layout kładzie hook/callouty/CTA (dobór best-of-2).
# Box we frakcjach finalnego kadru 1536×1920.
NEG_ZONES = {
    ("demo", "hero"): (0.06, 0.02, 0.94, 0.30),
    ("problem", "pain"): (0.00, 0.00, 1.00, 0.30),
    ("problem", "fakt"): (0.00, 0.00, 1.00, 0.30),
    ("lifestyle", "ugc"): (0.06, 0.04, 0.94, 0.36),
}
NEG_ZONE_DEFAULT = (0.06, 0.02, 0.94, 0.30)

# ETAP C — FINISHER PASS („ręka grafika"): integracja nakładek ze zdjęciem BEZ ruszania liter.
FINISHER_PROMPT = (
    "Professional graphic designer finishing pass on this ad banner. Integrate the graphic overlays "
    "with the photo: add soft realistic drop shadows under the pills and buttons as if printed in the "
    "scene, unify color grade between photo and graphics, subtle vignette, very subtle film grain. "
    "Where a text pill overlaps the main subject (product, person or animal), make the subject's edge slightly overlap the pill "
    "for depth. CRITICAL: do NOT change, redraw, move or restyle ANY letters, words, numbers, logos or "
    "icons — every glyph must remain pixel-identical in shape; do not add any new text."
)
# ETAP D — bramka ochrony liter: pHash Hamming crop B vs C. > próg na KTÓRYMKOLWIEK regionie = odrzuć finisher.
LETTER_GATE_PHASH_MAX = int(os.environ.get("ADFORGE_LETTER_GATE_PHASH", "12"))

# ETAP B — grain gaussa sklejający warstwy (bardzo subtelny).
GRAIN_SIGMA = 26
GRAIN_ALPHA = 5

# Kolory bazowe (fallback, gdy paleta marki nie dostarczy) — kremowa biel + ciemny pas.
CREAM = (245, 241, 232)          # #F5F1E8
DARK_BAR = (23, 19, 16)          # #171310
GRAY_LABEL = (138, 133, 128)     # etykieta „STARY SPOSÓB"
ORANGE_LABEL = (232, 134, 58)    # fallback pomarańcz marki

# Mapa nazw fontów (fields.font) → pliki w scripts/mockup-tools/fonts/. ROZSZERZALNA.
# Wersaliki PL działają w każdym TTF — fallback = Montserrat-Black (skopiowany z video-factory).
FONT_MAP = {
    "montserrat": "Montserrat-Black.ttf",
    "montserrat black": "Montserrat-Black.ttf",
    # przykłady do dosypania gdy pliki trafią do fonts/:
    # "baloo 2": "Baloo2-ExtraBold.ttf", "poppins": "Poppins-Bold.ttf",
    # "inter": "Inter-Black.ttf", "anton": "Anton-Regular.ttf",
}

# ══════════════════════════════════════════════════════════════════════════════
# SZABLONY PROMPTÓW SCEN (kierunkowe, EN; {scene_vision}/{pain_vision} z copy-calla).
# ZAKAZ opisywania produktu — wygląd niesie referencja. EDYTOWALNE.
# ══════════════════════════════════════════════════════════════════════════════
HERO_DEMO = (
    "Cinematic premium product photograph. The product from the reference image is the single "
    "hero, resting on a deep charcoal-to-warm gradient studio backdrop with a soft reflection "
    "beneath it. {scene_vision} Soft dramatic key light from the upper left, subtle rim light "
    "tracing the silhouette. Minimal editorial composition; generous clean empty negative space "
    "across the top third for a headline. Mood: premium, calm confidence."
)
PAIN = (
    "Documentary-style candid photograph of a frustrating everyday moment: {pain_vision} Muted, "
    "slightly desaturated tones, tense uncomfortable mood, natural unflattering light. No products "
    "in frame, no text, no logos."
)
FAKT = (
    "Warm candid home photograph: the product from the reference image in natural, effortless use. "
    "{scene_vision} Golden warm light, cozy real interior, relaxed happy mood. Authentic, not "
    "staged. Keep the upper part of the frame calm and uncluttered."
)
LIFESTYLE = (
    "Authentic smartphone-style photo that looks like a customer's organic social post: the product "
    "from the reference image in real everyday use at home. {scene_vision} Warm natural daylight, "
    "true-to-life interior, candid framing with slight imperfection. No studio look, no text, no graphics."
)
# Prefix wierności produktu (image[0]). Zawiera „single source of truth" — rozpoznawany przez
# prompt-lint jako prefiks referencji (wymóg --expect-product-ref dla scen z produktem).
PRODUCT_PREFIX = (
    "Reproduce the product from the first reference image UNCHANGED — same shape, colors, materials, "
    "details; it is the single source of truth for the product. Reproduce ONLY the physical product "
    "itself — IGNORE and DROP any arrows, chevrons, badges, watermarks, text or graphic overlays that "
    "appear in the reference image. Change ONLY the scene."
)
STYLE_NOTE = " Match the mood and palette of the style reference image."


def log(msg):
    print("[ad-forge] " + str(msg), flush=True)


def _now():
    return datetime.now(timezone.utc).isoformat()


# ── Sekrety z .env (UTF-8, tolerancyjnie na CRLF; NIE logujemy wartości) ───────
def load_env():
    vals = {}
    try:
        with io.open(ENV_PATH, encoding="utf-8", errors="replace") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                vals[k.strip()] = v.strip().strip('"').strip("'")
    except FileNotFoundError:
        pass
    for k in ("OPENAI_API_KEY", "SUPABASE_SERVICE_KEY", "WF2_GEN_SECRET"):
        if not vals.get(k) and os.environ.get(k):
            vals[k] = os.environ[k]
    return vals


ENV = load_env()


def _service_headers():
    key = ENV.get("SUPABASE_SERVICE_KEY")
    if not key:
        raise SystemExit("brak SUPABASE_SERVICE_KEY w .env")
    return {"apikey": key, "Authorization": "Bearer " + key}


# ── Cienka warstwa REST (service-role) ────────────────────────────────────────
def rest_get(table, params):
    r = requests.get(REST + "/" + table, headers=_service_headers(), params=params, timeout=30)
    if r.status_code >= 300:
        raise RuntimeError("GET %s %s: %s" % (table, r.status_code, r.text[:300]))
    return r.json()


# ══════════════════════════════════════════════════════════════════════════════
# Kolejność wierności refów (logika kreacji wbudowana w ad-forge).
# curated_image → gallery_curated items[keep] → ali_snapshot main+images → cover_url.
# ══════════════════════════════════════════════════════════════════════════════
def build_product_refs(tt, cover_url):
    out = []
    seen = set()

    def push(u):
        s = str(u or "").strip()
        if not s or s.startswith("data:") or s in seen:
            return
        seen.add(s)
        out.append(s)

    tt = tt or {}
    push(tt.get("curated_image"))                                   # 1) kurowane przez admina
    gc = tt.get("gallery_curated")
    items = gc.get("items") if isinstance(gc, dict) and isinstance(gc.get("items"), list) else []
    for it in items:
        if it and it.get("keep") and it.get("url"):
            push(it.get("url"))                                     # 2) zaakceptowane kadry galerii
    snap = tt.get("ali_snapshot") or None
    if snap:
        push(snap.get("main_image"))                               # 3) główny kadr AliExpress
        if isinstance(snap.get("images"), list):
            for im in snap["images"]:
                push(im)
    push(cover_url)                                                # 4) okładka (ostatnia deska ratunku)
    return [{"url": u, "type": "product"} for u in out[:4]]


# ── Odczyt briefu mini-marki (port readBranding) ──────────────────────────────
BRANDING_STEP_PRIORITY = ["lp_styl_marka", "lp_branding", "branding", "lp_plan"]


def read_branding(steps, artifacts):
    steps = steps or []
    artifacts = artifacts or []

    def prio(k):
        try:
            return BRANDING_STEP_PRIORITY.index(k)
        except ValueError:
            return 99

    ordered = sorted(steps, key=lambda s: prio(str(s.get("step_key") or "")))
    f = {}
    for s in ordered:
        d = s.get("data") or {}
        fields = d.get("fields") if isinstance(d.get("fields"), dict) else d
        if not isinstance(fields, dict):
            continue
        for k, v in fields.items():
            if k not in f and v is not None and str(v).strip():
                f[k] = v                                            # wcześniejszy krok wygrywa per-pole

    def g(*keys):
        for k in keys:
            v = f.get(k)
            if v is not None and str(v).strip():
                return str(v).strip()
        return ""

    brand_name = g("marka_nazwa", "nazwa", "brand", "marka", "nazwa_marki", "chosen_name")[:60]

    # 1) LOGO z artefaktu brandingu (label/meta wskazujące logo-combo/logo)
    logo_raw = ""
    for a in artifacts:
        kind = str(a.get("kind") or "").lower()
        if kind not in ("branding", "brand"):
            continue
        lbl = str(a.get("label") or "").lower()
        try:
            meta_str = json.dumps(a.get("meta") or {}).lower()
        except Exception:
            meta_str = ""
        url = str(a.get("url") or "")
        if re.match(r"^https?://", url, re.I) and ("logo-combo" in lbl or "logo-combo" in meta_str or "logo" in lbl):
            logo_raw = url
            break
    # 2) pole logo_url/logo, 3) brand_dir → logo-combo.png
    if not logo_raw:
        logo_raw = g("logo_url", "logo")
    if not logo_raw:
        d = g("brand_dir")
        if d:
            if re.match(r"^https?://", d, re.I):
                logo_raw = d.rstrip("/") + "/logo-combo.png"
            else:
                logo_raw = "%s/attachments/%s/logo-combo.png" % (STORAGE_PUBLIC, d.strip("/"))
    logo_url = logo_raw if re.match(r"^https?://", logo_raw, re.I) else ""

    styl_raw = g("styl_master_url", "styl_master", "style_master_url", "master_url")
    styl_master_url = styl_raw if re.match(r"^https?://", styl_raw, re.I) else ""
    paleta = g("paleta", "palette", "kolory", "paleta_kolorow", "kolory_marki")
    fonty = g("fonty", "font", "fonts", "typografia", "krój")
    persona = g("persona", "dla_kogo", "avatar")
    obietnica = g("obietnica", "kat", "kąt", "wyroznik", "wyróżnik", "motyw")
    hooki = g("hooki", "hook", "hasla", "hasło", "haslo")
    ton = g("ton", "ton_marki")
    ust = {"dla_kogo": persona, "kat": obietnica, "ton_marki": ton}
    return {
        "brand_name": brand_name, "logo_url": logo_url, "styl_master_url": styl_master_url,
        "paleta": paleta, "fonty": fonty, "ust": ust, "obietnica": obietnica, "hooki": hooki,
    }


# ── Pobranie kompletu danych produktu ─────────────────────────────────────────
def fetch_product_bundle(product_id):
    prod = rest_get("wf2_products", {
        "id": "eq." + product_id,
        "select": "id,project_id,name,slug,platform_page_url,cover_url,tt_product_id,notes,ads_creatives",
    })
    if not prod:
        raise SystemExit("nie znaleziono produktu %s" % product_id)
    product = prod[0]

    tt = None
    tt_id = str(product.get("tt_product_id") or "")
    if tt_id and UUID_RE.match(tt_id):
        # Kolumny pewne (bez cover_url — nie istnieje na bud_tt_products); gallery_curated osobno.
        base = rest_get("bud_tt_products", {
            "id": "eq." + tt_id, "select": "pl_name,category,curated_image,ali_snapshot"})
        tt = base[0] if base else None
        if tt is not None:
            try:
                gc = rest_get("bud_tt_products", {"id": "eq." + tt_id, "select": "gallery_curated"})
                if gc:
                    tt["gallery_curated"] = gc[0].get("gallery_curated")
            except Exception:
                pass                                               # kolumna może nie istnieć — pomijamy

    steps = rest_get("wf2_steps", {
        "product_id": "eq." + product_id,
        "step_key": "in.(%s)" % ",".join(BRANDING_STEP_PRIORITY + ["lp_dane", "dane"]),
        "select": "step_key,data"})
    artifacts = rest_get("wf2_artifacts", {
        "product_id": "eq." + product_id, "kind": "in.(branding,brand)",
        "select": "kind,label,url,meta"})

    branding = read_branding([s for s in steps if s["step_key"] in BRANDING_STEP_PRIORITY], artifacts)

    # cena PL (opcjonalna — do copy, nie na grafikę bez potrzeby)
    cena_pl = ""
    for s in steps:
        if s["step_key"] in ("lp_dane", "dane"):
            d = s.get("data") or {}
            ff = d.get("fields") if isinstance(d.get("fields"), dict) else d
            cand = (ff or {}).get("cena_pl") or (ff or {}).get("cena")
            if cand and str(cand).strip():
                cena_pl = str(cand).strip()
                break

    # DEZAMBIGUACJA PRODUKTU (fakty, nie zgadywanie z nazwy marki):
    # tytuł aukcji TYLKO gdy source=='detail' (zasada wierności źródła) + alt_pl kadrów galerii (keep, max 3).
    snap = (tt or {}).get("ali_snapshot") or {}
    snap_title = str(snap.get("title") or "").strip() if str(snap.get("source") or "") == "detail" else ""
    alt_texts = []
    gc = (tt or {}).get("gallery_curated")
    gitems = gc.get("items") if isinstance(gc, dict) and isinstance(gc.get("items"), list) else []
    for it in gitems:
        if it and it.get("keep") and str(it.get("alt_pl") or "").strip():
            alt_texts.append(str(it["alt_pl"]).strip()[:120])
        if len(alt_texts) >= 3:
            break

    refs = build_product_refs(tt, str(product.get("cover_url") or ""))
    return {"product": product, "tt": tt, "branding": branding, "refs": refs, "cena_pl": cena_pl,
            "snap_title": snap_title, "alt_texts": alt_texts}


# ── Paleta: wyciągnij hexy z opisu marki ──────────────────────────────────────
def parse_palette(paleta_str):
    hexes = re.findall(r"#[0-9a-fA-F]{6}", paleta_str or "")
    out = []
    for h in hexes:
        out.append(tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)))
    return out


# ══════════════════════════════════════════════════════════════════════════════
# COPY + WIZJE SCEN — jeden call wf2-gpt (json_object wymuszony promptem + tolerant-parse).
# ══════════════════════════════════════════════════════════════════════════════
def build_copy_prompt(bundle, angles, with_hook_alts=False):
    p = bundle["product"]
    b = bundle["branding"]
    name = str(p.get("name") or (bundle["tt"] or {}).get("pl_name") or "produkt")
    marka = b["brand_name"] or ""
    dla = b["ust"].get("dla_kogo") or ""
    kat = b["ust"].get("kat") or b["obietnica"] or ""
    ton = b["ust"].get("ton_marki") or ""
    hooki = b["hooki"] or ""
    kategoria = str((bundle["tt"] or {}).get("category") or "")
    snap_title = bundle.get("snap_title") or ""
    alt_texts = bundle.get("alt_texts") or []
    fakty = ""
    if snap_title:
        fakty += "\n- Tytuł aukcji (FAKT): %s" % snap_title
    if alt_texts:
        fakty += "\n- Opisy kadrów produktu (FAKTY): %s" % " • ".join(alt_texts)

    # Schemat JSON per kąt (tylko wybrane kąty). hook_alts (v8) = alternatywne nagłówki do
    # wariantów hooków (--hook-variants), nakładanych KODEM na bazę „bez nagłówka".
    alts = ('"hook_alts":["ALTERNATYWNY nagłówek PL ≤4 słowa, INNY kąt niż hook_baner",'
            '"ALTERNATYWNY nagłówek PL ≤4 słowa","ALTERNATYWNY nagłówek PL ≤4 słowa"],'
            if with_hook_alts else "")
    schema_lines = []
    for a in angles:
        if a == "problem":
            schema_lines.append(
                '  "problem": {' + alts + '"hook_baner":"TRANSFORMACJA PL przed→po, 2-4 słowa (nazwij zmianę, którą daje produkt)",'
                '"headline":"2-4 słowa PL WERSALIKI-friendly","subline":"≤6 słów PL lub \\"\\"",'
                '"primary_text":"2-3 zdania PL, INNE otwarcie niż reszta","scene_vision":"1 zdanie EN — scena FAKTU: produkt w realnym użyciu (efekt/„po")",'
                '"pain_vision":"1 zdanie EN — scena frustracji/problemu BEZ produktu w kadrze","fakt_checkmarki":["≤3 słowa PL","≤3 słowa PL","≤3 słowa PL"]}')
        elif a == "demo":
            schema_lines.append(
                '  "demo": {' + alts + '"hook_baner":"PYTANIE-LUSTRO lub BENEFIT PL (nazwij główną korzyść albo ból persony)",'
                '"callouts_demo":["≤3 słowa PL z FAKTÓW — nazwa REALNEJ części/cechy produktu","≤3 słowa PL z FAKTÓW","≤3 słowa PL z FAKTÓW"],'
                '"headline":"2-4 słowa PL WERSALIKI-friendly","subline":"≤6 słów PL lub \\"\\"",'
                '"primary_text":"2-3 zdania PL, INNE otwarcie niż reszta","scene_vision":"STUDYJNA wskazówka EN, max kilka słów — '
                'tylko rekwizyt/kolor/faktura tła obok produktu, BEZ ludzi i BEZ scen wnętrz (np. \\"warm beige gradient, a folded towel beside it\\")"}')
        else:  # lifestyle
            schema_lines.append(
                ('  "%s": {' % a) + alts + '"hook_baner":"ODRĘCZNY MARKER PL — krótki, żywy, sprzedający GŁÓWNY EFEKT/KORZYŚĆ produktu w codziennym użyciu, ≤3 słowa, może z wykrzyknikiem",'
                '"mini_adnotacja":"OPCJONALNA druga odręczna adnotacja PL przy realnym detalu produktu, ≤3 słowa (albo pusty string)",'
                '"headline":"2-4 słowa PL WERSALIKI-friendly","subline":"≤6 słów PL lub \\"\\"",'
                '"primary_text":"2-3 zdania PL, INNE otwarcie niż reszta",'
                '"scene_vision":"1 zdanie EN — MECHANIZM/EFEKT W AKCJI: produkt w realnym, codziennym użyciu pokazujący główną korzyść (decydujący moment użycia), autentycznie jak w domu"}')
    schema = "{\n" + ",\n".join(schema_lines) + "\n}"

    return (
        "Jesteś marketerem DTC na rynek polski. Piszesz copy + wizje scen do statycznych reklam FB/IG "
        "dla jednoproduktowego sklepu (dropshipping → własna marka, płatność przy odbiorze).\n\n"
        "PRODUKT / BRIEF MARKI:\n"
        "- Produkt: %s\n- Marka: %s\n- Kategoria: %s\n- Dla kogo: %s\n- Kąt / obietnica: %s\n- Ton marki: %s\n- Hooki klienta: %s%s\n\n"
        "Opieraj się na FAKTACH z tytułu aukcji i opisów kadrów — nie zgaduj kategorii produktu z nazwy marki.\n\n"
        "ZADANIE — dla kątów: %s.\n"
        "Dla każdego kąta:\n"
        "• hook_baner: GŁÓWNY hook renderowany WIELKI na banerze. demo = pytanie-lustro lub benefit; "
        "problem = transformacja (przed→po); lifestyle = ODRĘCZNY MARKER sprzedający GŁÓWNY EFEKT/KORZYŚĆ "
        "produktu w codziennym użyciu (krótki, żywy). PL, z diakrytykami.\n"
        "• mini_adnotacja (TYLKO lifestyle): OPCJONALNA, malutka druga odręczna adnotacja przy realnym detalu "
        "produktu, ≤3 słowa (pusty string, gdy zbędna).\n"
        "• callouts_demo (TYLKO demo): 3 krótkie etykiety ≤3 słowa Z FAKTÓW produktu (tytuł aukcji/opisy kadrów) "
        "nazywające REALNE części/cechy produktu. ZERO zmyślania.\n"
        "• headline: 2-4 słowa PL, JEDNA obietnica, dobrze wygląda WERSALIKAMI (diakrytyki OK).\n"
        "• subline: opcjonalny, ≤6 słów PL (pusty string gdy zbędny).\n"
        "• primary_text: 2-3 zdania PL, hak w 1. zdaniu, lekkie CTA; KAŻDY kąt zaczyna się INNYM zdaniem.\n"
        "• USP-MOMENT (TWARDA zasada scen WSZYSTKICH kątów, gdzie produkt jest UŻYWANY): scena łapie GŁÓWNY "
        "MECHANIZM/EFEKT produktu W AKCJI — produkt w decydującym momencie realnego użycia, tak by w 0,5 s było "
        "jasne CO robi i DLACZEGO pomaga. ZAKAZ: produkt nieużywany/bierny rekwizyt, w opakowaniu, trzymany do "
        "kamery jak katalog. Wyprowadź moment użycia z FAKTÓW produktu (jak realnie się go używa).\n"
        "• scene_vision: 1 zdanie EN — konkretna wizja sceny dla TEGO produktu i persony (opisuj SCENĘ/otoczenie/"
        "światło/porę dnia oraz UŻYCIE produktu, NIGDY wyglądu produktu — wygląd niesie referencja; ZAWSZE "
        "respektuj USP-MOMENT powyżej).\n"
        "• WYJĄTEK dla kąta 'demo': scene_vision to STUDYJNA wskazówka (rekwizyt/kolor/faktura tła obok produktu, "
        "max kilka słów, BEZ ludzi i BEZ pełnych scen wnętrz) — demo to czysty produkt-bohater na tle (części "
        "widoczne pod callouty), nie druga scena lifestyle.\n"
        "Dla kąta 'problem' dodatkowo:\n"
        "• pain_vision: 1 zdanie EN — scena frustracji/problemu BEZ produktu w kadrze.\n"
        "• fakt_checkmarki: 3 korzyści PL, każda ≤3 słowa.\n\n"
        "ZASADY UCZCIWOŚCI TWARDE (Meta 2026, decyzja Tomka): zero zmyślonych rabatów/starych cen/„-%%”, "
        "zero urgency/countdownów, zero „darmowej dostawy” (niepotwierdzona), zero gwiazdek/opinii/liczb w copy, "
        "zero personal attributes (headline bezosobowo), zero opisu wyglądu produktu w scene_vision. "
        "Callouty i copy TYLKO z realnych faktów produktu.\n"
        "ZDROWIE/WELLNESS (twarde — Meta): dla produktów zdrowotnych/pielęgnacyjnych/wellness framing = "
        "relaks / komfort / odprężenie / ulga w napięciu mięśni / wygoda, NIGDY claim medyczny/terapeutyczny/"
        "leczniczy ani „koniec bólu”/„leczy”/„usuwa ból”/„natychmiastowa ulga”; ZERO before/after CIAŁA "
        "(sylwetka/skóra/waga) — w kącie problem dozwolony wyłącznie kontrast NASTROJU/napięcia tej samej "
        "osoby (zmęczenie→odprężenie), nie transformacja ciała.\n\n"
        "ZWRÓĆ WYŁĄCZNIE obiekt JSON (bez markdown, bez komentarza) o strukturze:\n%s"
        % (name, marka or "(brak — neutralnie)", kategoria or "—", dla or "—", kat or "—",
           ton or "—", hooki or "—", fakty, ", ".join(angles), schema)
    )


def tolerant_json(text):
    try:
        return json.loads(text)
    except Exception:
        pass
    m = re.search(r"\{[\s\S]*\}", text or "")
    if m:
        try:
            return json.loads(m.group(0))
        except Exception:
            pass
    return None


def call_copy(bundle, angles, with_hook_alts=False):
    secret = ENV.get("WF2_GEN_SECRET")
    if not secret:
        raise SystemExit("brak WF2_GEN_SECRET w .env (potrzebny do wf2-gpt)")
    prompt = build_copy_prompt(bundle, angles, with_hook_alts=with_hook_alts)
    # RESILIENCJA: gpt-5.6-sol (reasoning high) BYWA zwraca pusty text (blip) — retry z lekkim
    # podbiciem budżetu tokenów, zamiast przerywać (potem) DROGI przebieg generacji.
    last_err = ""
    for attempt in range(1, 3 + 1):
        payload = {
            "model": "gpt-5.6-sol",
            "input": [{"role": "user", "content": [{"type": "input_text", "text": prompt}]}],
            "max_output_tokens": 4000 + (attempt - 1) * 1500,
            "reasoning": {"effort": "high"},          # kreatywne = high (mapa fabryki)
        }
        try:
            r = requests.post(WF2GPT, data=json.dumps(payload).encode("utf-8"),
                              headers={"Content-Type": "application/json", "x-wf2-secret": secret}, timeout=600)
        except requests.RequestException as e:
            last_err = "sieć: %s" % e
            log("copy-call próba %d — %s; retry" % (attempt, last_err)); time.sleep(attempt * 2); continue
        if r.status_code >= 300:
            last_err = "wf2-gpt %s: %s" % (r.status_code, r.text[:200])
            log("copy-call próba %d — %s; retry" % (attempt, last_err)); time.sleep(attempt * 2); continue
        text = (r.json() or {}).get("text", "")
        data = tolerant_json(text)
        if isinstance(data, dict):
            return data, prompt
        last_err = "pusty/niepoprawny JSON (len=%d)" % len(text or "")
        log("copy-call próba %d — %s; retry" % (attempt, last_err)); time.sleep(attempt * 2)
    raise SystemExit("wf2-gpt nie zwrócił poprawnego JSON copy po 3 próbach: " + last_err)


# ══════════════════════════════════════════════════════════════════════════════
# PLAN SCEN — mapa kąt → lista scen (nazwa, szablon, czy z produktem).
# ══════════════════════════════════════════════════════════════════════════════
# Negative-space per kind (dopasowanie sceny do layoutu banera — jawne miejsce na tekst).
LAYOUT_NOTE = {
    "hero": (" Keep the top third AND the very bottom strip of the frame calm, clean and uncluttered "
             "(empty negative space) so a large headline can sit on top and a call-to-action bar at the "
             "bottom; place the product in the lower-central area, clearly separated from the background."),
    "fakt": (" Keep the top third of the frame calm and uncluttered for a headline; place the product and "
             "action in the lower two-thirds."),
    "ugc": (" Keep the upper area of the frame calm and uncluttered; place the product in the lower two-thirds "
            "with clean space just above it for a small hand-written sticker note."),
    "pain": (" Keep the top and bottom edges of the frame relatively calm; center the emotional moment."),
}


def build_scene_prompt(kind, copy_angle):
    """Zwraca (prompt, with_product) dla danej sceny."""
    if kind == "pain":
        pv = str(copy_angle.get("pain_vision") or "").strip()
        return PAIN.replace("{pain_vision}", pv) + LAYOUT_NOTE.get("pain", ""), False
    sv = str(copy_angle.get("scene_vision") or "").strip()
    tpl = {"hero": HERO_DEMO, "fakt": FAKT, "ugc": LIFESTYLE}[kind]
    scene = tpl.replace("{scene_vision}", sv) + LAYOUT_NOTE.get(kind, "")
    return scene, True


def scenes_for_angle(angle):
    if angle == "demo":
        return [("hero", "demo")]
    if angle == "problem":
        return [("pain", "problem"), ("fakt", "problem")]
    if angle == "lifestyle":
        return [("ugc", "lifestyle")]
    return []


def full_prompt(scene_prompt, with_product, has_style):
    if with_product:
        pre = PRODUCT_PREFIX + (STYLE_NOTE if has_style else "")
        return pre + "\n\n" + scene_prompt
    return scene_prompt


# ── prompt-lint (import; --expect-product-ref tylko dla scen z produktem) ──────
def _load_module(name, filename):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, filename))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def lint_scene(prompt, with_product):
    try:
        pl = _load_module("prompt_lint", "prompt-lint.py")
        return pl.lint(prompt, expect_ref=with_product)
    except Exception as e:
        return ["(prompt-lint niedostępny: %s)" % e]


# ══════════════════════════════════════════════════════════════════════════════
# GENERACJA SCEN.
# ══════════════════════════════════════════════════════════════════════════════
def _download(url, timeout=180):
    r = requests.get(url, headers={"User-Agent": "Mozilla/5.0 (ad-forge)", "Accept": "image/*"}, timeout=timeout)
    r.raise_for_status()
    ct = (r.headers.get("content-type") or "image/jpeg").split(";")[0].strip()
    return r.content, ct


def _ct_ext(ct):
    return "png" if "png" in ct else "webp" if "webp" in ct else "avif" if "avif" in ct else "jpg"


def gen_gptimage(prompt, ref_urls, quality, timeout=300):
    """Bezpośredni call api.openai.com. ref_urls: [(role, url)] — produkt PIERWSZY (image[0]).
    Brak refów → /images/generations (PAIN). Retry 2×."""
    key = ENV.get("OPENAI_API_KEY")
    if not key:
        raise SystemExit("brak OPENAI_API_KEY w .env")
    files = []
    for role, url in ref_urls:
        blob, ct = _download(url)
        files.append(("image[]", ("%s_%d.%s" % (role, len(files), _ct_ext(ct)), blob, ct)))
    last = None
    for attempt in range(1, 3 + 1):
        try:
            if files:
                data = {"model": "gpt-image-2", "prompt": prompt, "n": "1", "size": GEN_SIZE, "quality": quality}
                r = requests.post(OPENAI_EDITS, headers={"Authorization": "Bearer " + key},
                                  data=data, files=files, timeout=timeout)
            else:
                body = {"model": "gpt-image-2", "prompt": prompt, "n": 1, "size": GEN_SIZE, "quality": quality}
                r = requests.post(OPENAI_GEN, headers={"Authorization": "Bearer " + key,
                                  "Content-Type": "application/json"}, data=json.dumps(body).encode("utf-8"), timeout=timeout)
            if r.status_code >= 300:
                raise RuntimeError("OpenAI %s: %s" % (r.status_code, r.text[:300]))
            arr = (r.json() or {}).get("data") or []
            for it in arr:
                if it.get("b64_json"):
                    return base64.b64decode(it["b64_json"])
            raise RuntimeError("OpenAI: brak b64_json w odpowiedzi")
        except Exception as e:
            last = e
            log("  gpt-image próba %d nieudana: %s" % (attempt, e))
            if attempt < 3:
                time.sleep(attempt * 2)
    raise RuntimeError("gpt-image: wyczerpano próby — %s" % last)


def gen_gemini(prompt, ref_objs, slug, angle, timeout=600):
    """Engine gemini przez wf2-gen (provider gemini, 4:5, reference_images jako OBIEKTY)."""
    secret = ENV.get("WF2_GEN_SECRET")
    if not secret:
        raise SystemExit("brak WF2_GEN_SECRET w .env (potrzebny do wf2-gen)")
    payload = {"fn": "generate-image", "payload": {
        "prompt": prompt, "count": 1, "workflow_id": "adforge-%s-%s" % (slug, angle),
        "type": "ad", "provider": "gemini", "aspect_ratio": "4:5",
    }}
    if ref_objs:
        payload["payload"]["reference_images"] = ref_objs
    r = requests.post(WF2GEN, data=json.dumps(payload).encode("utf-8"),
                      headers={"Content-Type": "application/json", "x-wf2-secret": secret}, timeout=timeout)
    if r.status_code >= 300:
        raise SystemExit("wf2-gen %s: %s" % (r.status_code, r.text[:300]))
    imgs = (r.json() or {}).get("images") or []
    if not imgs or not imgs[0].get("url"):
        raise RuntimeError("wf2-gen nie zwrócił obrazu: " + json.dumps(r.json())[:300])
    blob, _ = _download(imgs[0]["url"])
    return blob


# ══════════════════════════════════════════════════════════════════════════════
# ETAP A — SILNIK 'nbpro' (fal-ai/nano-banana-pro przez bud-fal-proxy).
# Refy MUSZĄ być PUBLICZNE (rehost przez fal.store RAZ, cache w state). Best-of-2:
# 2 kandydatów sceny, auto-wybór (ostrość Laplace'a + jasność strefy negative-space).
# ══════════════════════════════════════════════════════════════════════════════
_FAL_MOD = None


def _fal():
    """Import fal.py z scripts/video-factory (importlib jak panel-sync). Cache modułu."""
    global _FAL_MOD
    if _FAL_MOD is None:
        spec = importlib.util.spec_from_file_location("fal_client", os.path.join(FAL_DIR, "fal.py"))
        m = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(m)
        try:
            m.set_project("adforge")                               # izolacja budżetu w ledgerze fal
        except Exception:
            pass
        _FAL_MOD = m
    return _FAL_MOD


def rehost_ref(local_path, dest, src_url, state):
    """Rehost lokalnego refa przez fal.store() RAZ; cache URL w state['fal_refs'] po src_url.
    Zwraca publiczny URL, który serwery fal na pewno pobiorą (AliExpress/CDN bywają niepobieralne)."""
    cache = state.setdefault("fal_refs", {})
    key = src_url or dest
    ent = cache.get(key)
    if isinstance(ent, dict) and ent.get("fal_url"):
        log("  ref cache HIT: %s → %s" % (os.path.basename(local_path), ent["fal_url"]))
        return ent["fal_url"]
    url = _fal().store(local_path, dest)
    cache[key] = {"src": src_url, "fal_url": url}
    log("  ref rehost fal.store: %s → %s" % (os.path.basename(local_path), url))
    return url


def gen_nbpro_batch(jobs, out_candidates_dir):
    """RÓWNOLEGŁA generacja kandydatów scen (fal.gen_batch). jobs: lista
    {tag, model, image_urls, prompt}. Zwraca {tag: local_png_path}. Koszt naliczany osobno.
    RESUME: pomija zadania z już istniejącym plikiem <tag>.png (odporność na pad/blip fal —
    nie płacimy 2× za sceny wygenerowane w poprzednim biegu)."""
    fal = _fal()
    os.makedirs(out_candidates_dir, exist_ok=True)
    out, fjobs = {}, []
    for j in jobs:
        p = os.path.join(out_candidates_dir, j["tag"] + ".png")
        if os.path.isfile(p) and os.path.getsize(p) > 10000:
            out[j["tag"]] = p                                      # już mamy — resume
            continue
        for stale in (p.rsplit(".", 1)[0] + ".failed", p.rsplit(".", 1)[0] + ".timeout"):
            try:
                os.remove(stale)
            except OSError:
                pass
        payload = {"prompt": j["prompt"], "aspect_ratio": "4:5", "resolution": "2K", "num_images": 1}
        if j.get("image_urls"):
            payload["image_urls"] = j["image_urls"]
        fjobs.append({"tag": j["tag"], "model": j["model"], "payload": payload})
    if out:
        log("nbpro batch RESUME: %d/%d kandydatów już na dysku (bez ponownej generacji)" % (len(out), len(jobs)))
    log("nbpro batch: %d nowych zadań (best-of-%d) → %s" % (len(fjobs), BEST_OF, out_candidates_dir))
    done = fal.gen_batch(fjobs, outdir=out_candidates_dir, project="adforge") if fjobs else {}
    for tag, val in done.items():
        if isinstance(val, str) and os.path.isfile(val):
            out[tag] = val
        else:
            log("  ⚠ nbpro FAILED %s: %s" % (tag, str(val)[:200]))
    return out


def gen_nbpro_one(prompt, image_urls, tag, aspect_ratio="4:5"):
    """Pojedyncza generacja nbpro (finisher / fallback / kwadrat 1:1). Zwraca bytes PNG."""
    fal = _fal()
    model = NBPRO_EDIT if image_urls else NBPRO_T2I
    payload = {"prompt": prompt, "aspect_ratio": aspect_ratio, "resolution": "2K", "num_images": 1}
    if image_urls:
        payload["image_urls"] = image_urls
    res = fal.gen(model, payload, tag=tag)
    url = (res.get("images") or [{}])[0].get("url")
    if not url:
        raise RuntimeError("nbpro brak url w wyniku: " + json.dumps(res)[:300])
    blob, _ = _download(url)
    return blob


def _laplacian_var(img_rgb):
    """Wariancja Laplace'a (ostrość) — wyższa = ostrzej. Bez numpy (kernel Pillow)."""
    Image, _, _, ImageFilter, _ = _pil()
    g = img_rgb.convert("L").resize((256, 256), Image.LANCZOS)
    k = ImageFilter.Kernel((3, 3), [0, 1, 0, 1, -4, 1, 0, 1, 0], scale=1, offset=128)
    px = list(g.filter(k).getdata())
    n = len(px) or 1
    mean = sum(px) / n
    return sum((p - mean) ** 2 for p in px) / n


def _zone_brightness(img_rgb, zone_frac):
    """Średnia luminancja strefy negative-space (0..255)."""
    W, H = img_rgb.size
    box = (int(zone_frac[0] * W), int(zone_frac[1] * H), int(zone_frac[2] * W), int(zone_frac[3] * H))
    return _region_lum(img_rgb, box)[0]


def pick_best_candidate(finals, zone):
    """finals: lista RGB (final 1536×1920). Zwraca (index, oceny) — ostrość 0.65 + neg-space 0.35."""
    metrics = [(_laplacian_var(f), _zone_brightness(f, zone)) for f in finals]
    lmax = max((m[0] for m in metrics), default=1.0) or 1.0
    bmax = max((m[1] for m in metrics), default=1.0) or 1.0
    best_i, best_s = 0, -1.0
    scores = []
    for i, (lap, br) in enumerate(metrics):
        s = 0.65 * (lap / lmax) + 0.35 * (br / bmax)
        scores.append((round(lap, 1), round(br, 1), round(s, 3)))
        if s > best_s:
            best_s, best_i = s, i
    return best_i, scores


# ══════════════════════════════════════════════════════════════════════════════
# FORMAT + KOMPOZYCJA (Pillow).
# ══════════════════════════════════════════════════════════════════════════════
def _pil():
    from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
    return Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance


def to_45(img, top_bias=0.30):
    """Smart-crop do 4:5 (0.8). Za szeroki → crop szer. centr.; za wysoki → crop wys.
    z zachowaniem negative space u góry i produktu w dolnych 2/3."""
    Image, _, _, _, _ = _pil()
    w, h = img.size
    target = 0.8
    ar = w / h
    if abs(ar - target) < 0.005:
        return img
    if ar > target:
        nw = int(round(h * target))
        x0 = (w - nw) // 2
        return img.crop((x0, 0, x0 + nw, h))
    nh = int(round(w / target))
    excess = h - nh
    y0 = int(round(excess * top_bias))
    return img.crop((0, y0, w, y0 + nh))


def to_11(img):
    """Smart-crop do 1:1 (kwadrat centralny) → resize SQ_W×SQ_H. Model generuje natywny 1:1
    (aspect_ratio '1:1'), więc crop jest zwykle no-op — defensywny na drobne odchyłki AR."""
    Image, _, _, _, _ = _pil()
    w, h = img.size
    s = min(w, h)
    x0, y0 = (w - s) // 2, (h - s) // 2
    sq = img.crop((x0, y0, x0 + s, y0 + s))
    return sq.resize((SQ_W, SQ_H), Image.LANCZOS)


def cover_fit(img, box_w, box_h):
    """Skaluj z pokryciem (cover) i przytnij centralnie do dokładnego boksa."""
    Image, _, _, _, _ = _pil()
    w, h = img.size
    scale = max(box_w / w, box_h / h)
    nw, nh = int(round(w * scale)), int(round(h * scale))
    img = img.resize((nw, nh), Image.LANCZOS)
    x0 = (nw - box_w) // 2
    y0 = (nh - box_h) // 2
    return img.crop((x0, y0, x0 + box_w, y0 + box_h))


def desaturate(img, amount=0.20):
    _, _, _, _, ImageEnhance = _pil()
    return ImageEnhance.Color(img.convert("RGB")).enhance(max(0.0, 1.0 - amount))


def scene_to_final(blob, engine):
    """Bytes sceny → RGB 1536×1920. gptimage: 2:3 → smart-crop 4:5 → resize. gemini: 4:5 → resize."""
    Image, _, _, _, _ = _pil()
    img = Image.open(io.BytesIO(blob)).convert("RGB")
    if engine == "gptimage":
        img = to_45(img)
    else:
        img = to_45(img)                                           # gemini 4:5 natywnie — no-op gdy AR≈0.8
    return img.resize((FINAL_W, FINAL_H), Image.LANCZOS)


# ── Typografia ────────────────────────────────────────────────────────────────
def resolve_font_path(fields_font):
    key = re.sub(r"\s+", " ", str(fields_font or "").strip().lower())
    if key in FONT_MAP:
        p = os.path.join(FONTS_DIR, FONT_MAP[key])
        if os.path.isfile(p):
            return p
    for name, fname in FONT_MAP.items():                            # dopasowanie po tokenie
        if name and name.split()[0] in key:
            p = os.path.join(FONTS_DIR, fname)
            if os.path.isfile(p):
                return p
    return FALLBACK_FONT


def _font(path, size):
    _, _, ImageFont, _, _ = _pil()
    return ImageFont.truetype(path, size)


def wrap_lines(draw, text, font, max_w):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        test = (cur + " " + w).strip()
        if not cur or draw.textlength(test, font=font) <= max_w:
            cur = test
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def fit_headline(draw, text, font_path, max_w, max_h, max_lines=2, hi=230, lo=44):
    for size in range(hi, lo - 1, -4):
        font = _font(font_path, size)
        lines = wrap_lines(draw, text, font, max_w)
        if len(lines) > max_lines:
            continue
        widths = [draw.textlength(ln, font=font) for ln in lines] or [0]
        bb = font.getbbox("ĄĘÓg")
        line_h = (bb[3] - bb[1])
        block_h = line_h * len(lines) * 1.14
        if max(widths) <= max_w and block_h <= max_h:
            return font, lines, line_h
    font = _font(font_path, lo)
    return font, wrap_lines(draw, text, font, max_w)[:max_lines], (font.getbbox("ĄĘÓg")[3])


def rel_lum(rgb):
    def ch(c):
        c = c / 255.0
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = rgb
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)


def contrast_ratio(a, b):
    la, lb = rel_lum(a), rel_lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def zone_avg_rgb(img, box):
    Image, _, _, _, _ = _pil()
    crop = img.crop(box).resize((16, 16), Image.LANCZOS)
    px = list(crop.getdata())
    n = len(px) or 1
    r = sum(p[0] for p in px) / n
    g = sum(p[1] for p in px) / n
    b = sum(p[2] for p in px) / n
    return (int(r), int(g), int(b))


def pick_text_fill(zone_rgb, palette):
    """Kremowa biel lub kolor z palety — kontrast ≥4.5 vs strefa; fallback ciemny."""
    candidates = [CREAM]
    for c in palette[:2]:
        candidates.append(c)
    candidates.append(DARK_BAR)
    for c in candidates:
        if contrast_ratio(c, zone_rgb) >= 4.5:
            return c
    # nic nie spełnia — wybierz najwyższy kontrast
    return max(candidates, key=lambda c: contrast_ratio(c, zone_rgb))


def draw_text_shadow(base_rgba, xy, text, font, fill, anchor="mm", canvas_h=FINAL_H):
    """Tekst z DWUWARSTWOWYM miękkim cieniem (ETAP B): szeroki blur ~2% wys. alpha 60 +
    ciasny blur ~0.5% alpha 90. Zwraca bbox narysowanego tekstu."""
    Image, ImageDraw, _, ImageFilter, _ = _pil()
    for blur_frac, alpha, off_frac in ((0.02, 60, 0.004), (0.005, 90, 0.002)):
        blur = max(1, int(canvas_h * blur_frac))
        off = max(1, int(canvas_h * off_frac))
        sh = Image.new("RGBA", base_rgba.size, (0, 0, 0, 0))
        ImageDraw.Draw(sh).text((xy[0] + off, xy[1] + off), text, font=font,
                                fill=(0, 0, 0, alpha), anchor=anchor, stroke_width=0)
        base_rgba.alpha_composite(sh.filter(ImageFilter.GaussianBlur(blur)))
    dd = ImageDraw.Draw(base_rgba)
    tcol = fill + (255,) if len(fill) == 3 else fill
    dd.text(xy, text, font=font, fill=tcol, anchor=anchor, stroke_width=0)
    return dd.textbbox(xy, text, font=font, anchor=anchor)


# ── HOOK: letter-spacing ~-1% + interlinia 1.04 + opcjonalny akcent koloru na słowie [[tak]] ──
def parse_accent(text):
    """'[[słowo]]' → akcent na tym słowie. Zwraca listę (word, is_accent) i czyści nawiasy."""
    toks = []
    for chunk in re.split(r"(\[\[.*?\]\])", str(text or "")):
        if not chunk:
            continue
        m = re.match(r"^\[\[(.*?)\]\]$", chunk)
        body = m.group(1) if m else chunk
        for w in body.split():
            toks.append((w, bool(m)))
    return toks


def _tok_width(draw, word, font, tracking):
    return sum(draw.textlength(ch, font=font) + tracking for ch in word)


def _line_tokens_width(draw, line_toks, font, tracking):
    space = draw.textlength(" ", font=font) + tracking
    w = 0.0
    for i, (word, _acc) in enumerate(line_toks):
        w += _tok_width(draw, word, font, tracking)
        if i < len(line_toks) - 1:
            w += space
    return w


def wrap_tokens(draw, toks, font, max_w, tracking):
    space = draw.textlength(" ", font=font) + tracking
    lines, cur, curw = [], [], 0.0
    for (word, acc) in toks:
        ww = _tok_width(draw, word, font, tracking)
        add = ww if not cur else space + ww
        if cur and curw + add > max_w:
            lines.append(cur)
            cur, curw = [(word, acc)], ww
        else:
            cur.append((word, acc))
            curw += add
    if cur:
        lines.append(cur)
    return lines


def fit_hook(draw, toks, font_path, max_w, max_h, max_lines=2, hi=230, lo=44,
             tracking_frac=-0.01, leading=1.04):
    for size in range(hi, lo - 1, -4):
        font = _font(font_path, size)
        tr = tracking_frac * size
        lines = wrap_tokens(draw, toks, font, max_w, tr)
        if len(lines) > max_lines:
            continue
        widths = [_line_tokens_width(draw, ln, font, tr) for ln in lines] or [0]
        bb = font.getbbox("ĄĘÓg")
        line_h = bb[3] - bb[1]
        block_h = line_h * len(lines) * (leading + 0.10)
        if max(widths) <= max_w and block_h <= max_h:
            return font, lines, line_h, tr
    font = _font(font_path, lo)
    tr = tracking_frac * lo
    bb = font.getbbox("ĄĘÓg")
    return font, wrap_tokens(draw, toks, font, max_w, tr)[:max_lines], (bb[3] - bb[1]), tr


def _render_line(d, x, y, line_toks, font, tracking, color_fn):
    space = d.textlength(" ", font=font) + tracking
    cx = x
    for i, (word, acc) in enumerate(line_toks):
        col = color_fn(acc)
        for ch in word:
            d.text((cx, y), ch, font=font, fill=col, anchor="la")
            cx += d.textlength(ch, font=font) + tracking
        if i < len(line_toks) - 1:
            cx += space
    return cx


def render_hook(canvas, topleft, text, font_path, max_w, max_h, base_fill, accent_fill,
                hi, lo, max_lines=2, leading=1.04, canvas_h=FINAL_H):
    """Rysuje HOOK z trackingiem −1%, interlinią 1.04, dwuwarstwowym cieniem i akcentem 1 słowa.
    Zwraca listę bboxów linii (ochrona liter w ETAPIE D)."""
    Image, ImageDraw, _, ImageFilter, _ = _pil()
    toks = parse_accent(text)
    draw = ImageDraw.Draw(canvas)
    font, lines, line_h, tr = fit_hook(draw, toks, font_path, max_w, max_h, max_lines, hi, lo, leading=leading)
    x0, y = int(topleft[0]), int(topleft[1])
    base = tuple(base_fill[:3]) + (255,)
    acc = (tuple(accent_fill[:3]) + (255,)) if accent_fill else base
    regions = []
    for line_toks in lines:
        for blur_frac, alpha, off_frac in ((0.02, 60, 0.004), (0.005, 90, 0.002)):
            blur = max(1, int(canvas_h * blur_frac))
            off = max(1, int(canvas_h * off_frac))
            sh = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
            _render_line(ImageDraw.Draw(sh), x0 + off, y + off, line_toks, font, tr,
                         lambda a, al=alpha: (0, 0, 0, al))
            canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(blur)))
        _render_line(ImageDraw.Draw(canvas), x0, y, line_toks, font, tr,
                     lambda a: acc if a else base)
        w = _line_tokens_width(draw, line_toks, font, tr)
        regions.append((x0 - 2, int(y), x0 + int(w) + 3, int(y + line_h * 1.12)))
        y += line_h * leading
    return regions


def apply_grain(canvas):
    """Delikatny grain gaussa (alpha ~5) na całości — sklejenie warstw (ETAP B)."""
    Image, _, _, _, _ = _pil()
    W, H = canvas.size
    noise = Image.effect_noise((W, H), GRAIN_SIGMA).convert("L")
    veil = Image.merge("RGBA", (noise, noise, noise, Image.new("L", (W, H), GRAIN_ALPHA)))
    canvas.alpha_composite(veil)


def edge_variance(img, box):
    Image, _, _, ImageFilter, _ = _pil()
    crop = img.crop(box).convert("L").filter(ImageFilter.FIND_EDGES).resize((32, 32), Image.LANCZOS)
    px = list(crop.getdata())
    n = len(px) or 1
    mean = sum(px) / n
    return sum((p - mean) ** 2 for p in px) / n


def _logo_pill(logo_img, height_px, pad_frac=0.28, max_w=None):
    """Logo na JASNEJ półprzezroczystej pigułce (biel ~85% alpha), padding ~28% wys. logo.
    max_w: opcjonalny limit szerokości pigułki (skalowanie w dół dla szerokiego combo)."""
    Image, ImageDraw, _, _, _ = _pil()
    lh = max(8, int(height_px))
    lw = max(8, int(logo_img.size[0] * lh / logo_img.size[1]))
    logo = logo_img.convert("RGBA").resize((lw, lh), Image.LANCZOS)
    pad = int(lh * pad_frac)
    W, H = lw + 2 * pad, lh + 2 * pad
    pill = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(pill)
    d.rounded_rectangle([0, 0, W - 1, H - 1], radius=int(H * 0.30), fill=(255, 255, 255, 217))  # biel ~85% alpha
    pill.alpha_composite(logo, (pad, pad))
    if max_w and pill.size[0] > max_w:
        sc = max_w / pill.size[0]
        pill = pill.resize((int(pill.size[0] * sc), max(1, int(pill.size[1] * sc))), Image.LANCZOS)
    return pill


def _region_lum(rgb, box):
    """(średnia_luminancja, wariancja_luminancji) regionu 24×24 — 'jasne tło' vs 'ciemny produkt/cień'."""
    Image, _, _, _, _ = _pil()
    x0, y0, x1, y1 = [int(v) for v in box]
    x0 = max(0, x0); y0 = max(0, y0); x1 = min(rgb.width, x1); y1 = min(rgb.height, y1)
    if x1 - x0 < 2 or y1 - y0 < 2:
        return (0.0, 0.0)
    crop = rgb.crop((x0, y0, x1, y1)).resize((24, 24), Image.LANCZOS)
    px = list(crop.getdata())
    n = len(px) or 1
    lums = [0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2] for p in px]
    mean = sum(lums) / n
    var = sum((l - mean) ** 2 for l in lums) / n
    return (mean, var)


def place_logo(canvas, logo_img, height_frac, allow_top=False, margin_frac=0.06, pill_frac=None):
    """Logo ZAWSZE na jasnej pigułce; TWARDY bounding-check: cała pigułka ≥4% od krawędzi kadru.
    Wybór rogu: preferuj JASNE tło, wyklucz strefy bardzo ciemne+jednolite (produkt/cień, gdzie
    biała pigułka nachodziłaby na produkt). allow_top=True → gdy oba dolne rogi kolidują z produktem,
    użyj góry (dozwolone tam, gdzie góra jest wolna od tekstu, np. lifestyle).
    pill_frac: docelowa WYSOKOŚĆ PIGUŁKI jako frakcja kadru (nadrzędne nad height_frac)."""
    if logo_img is None:
        return "brak-logo"
    W, H = canvas.size
    rgb = canvas.convert("RGB")
    if pill_frac:
        logo_h = max(8, int(H * pill_frac / (1 + 2 * 0.28)))       # pigułka = logo + 2×28% padding
        pill = _logo_pill(logo_img, logo_h, max_w=int(W * 0.42))
    else:
        pill = _logo_pill(logo_img, int(H * height_frac), max_w=int(W * 0.46))
    pw, ph = pill.size
    hard = int(min(W, H) * 0.04)                       # ≥4% od krawędzi (twarde)
    m = max(int(W * margin_frac), hard)
    bl = (m, H - m - ph)
    br = (W - m - pw, H - m - ph)
    tl = (m, m)
    tr = (W - m - pw, m)

    def score(pos):
        mean, var = _region_lum(rgb, (pos[0], pos[1], pos[0] + pw, pos[1] + ph))
        dark_uniform = (mean < 65 and var < 55)                    # produkt/cień → wyklucz
        return (0 if dark_uniform else 1, mean)                    # najpierw „nie-produkt", potem jaśniej

    best = sorted([bl, br], key=score, reverse=True)[0]
    if score(best)[0] == 0 and allow_top:                          # oba dolne = produkt/ciemne → góra
        top_best = sorted([tl, tr], key=score, reverse=True)[0]
        if score(top_best)[0] == 1:
            best = top_best
    x, y = best
    x = max(hard, min(x, W - hard - pw))               # clamp — pigułka w bezpiecznym polu
    y = max(hard, min(y, H - hard - ph))
    canvas.alpha_composite(pill, (x, y))
    where = ("GÓRA" if y < H // 2 else "DÓŁ") + "-" + ("LEWO" if x < W // 2 else "PRAWO")
    desc = "%s (pigułka %d×%dpx = %.1f%% wys.)" % (where, pw, ph, 100.0 * ph / H)
    log("logo → " + desc)
    return (x, y, x + pw, y + ph)                                  # bbox (ochrona liter/logo — ETAP D)


def place_logo_titlebar(canvas, logo_img, bar_h):
    """PROBLEM: logo na PASIE TYTUŁOWYM, prawy róg, wyśrodkowane w pasie (NIGDY na panelu PAIN).
    Szer. ograniczona do ≤24% kadru. Zwraca lewą krawędź logo (do zawężenia headline)."""
    if logo_img is None:
        return canvas.size[0]
    W, H = canvas.size
    pill = _logo_pill(logo_img, int(bar_h * 0.56), max_w=int(W * 0.24))
    pw, ph = pill.size
    hard = int(min(W, H) * 0.04)
    x = W - max(int(W * 0.05), hard) - pw
    y = max(0, (bar_h - ph) // 2)
    x = max(hard, x)
    canvas.alpha_composite(pill, (x, y))
    return x


def _rgba_canvas(img_rgb):
    return img_rgb.convert("RGBA")


# ══════════════════════════════════════════════════════════════════════════════
# PRYMITYWY BANEROWE (DR statyki). Typografia px @1080 → skala ×(W/1080). Akcent z palety
# (fallback pomarańcz); scrim/podkładki gwarantują kontrast ≥4,5:1; marginesy 6-8%.
# ══════════════════════════════════════════════════════════════════════════════
_PILL_REF = "ĄĘŚÓŻgy"


def _accent(palette):
    return palette[1] if len(palette) > 1 else ORANGE_LABEL


def _lighten(rgb, f):
    return tuple(min(255, int(c + (255 - c) * f)) for c in rgb[:3])


def _hook_accent(palette):
    """Kolor akcentu 1 słowa hooka na CIEMNYM scrimie — czytelny (≥3:1), inaczej rozjaśniony."""
    a = _accent(palette)
    return a if contrast_ratio(a, DARK_BAR) >= 3.0 else _lighten(a, 0.45)


def _grad_pill_tile(W_, H_, radius, top_rgba, bot_rgba):
    """Kafel pigułki: pionowy gradient (top→bottom) maskowany zaokrąglonym prostokątem
    + subtelny 1px wewnętrzny highlight. Zwraca RGBA."""
    from PIL import ImageChops
    Image, ImageDraw, _, _, _ = _pil()
    W_, H_ = max(1, int(W_)), max(1, int(H_))
    col = Image.new("RGBA", (1, H_))
    for y in range(H_):
        t = y / max(1, H_ - 1)
        col.putpixel((0, y), tuple(int(top_rgba[i] + (bot_rgba[i] - top_rgba[i]) * t) for i in range(4)))
    tile = col.resize((W_, H_))
    mask = Image.new("L", (W_, H_), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, W_ - 1, H_ - 1], radius=radius, fill=255)
    tile.putalpha(ImageChops.multiply(tile.getchannel("A"), mask))
    # 1px wewnętrzny highlight (delikatny „druk")
    ImageDraw.Draw(tile).rounded_rectangle(
        [1, 1, W_ - 2, H_ - 2], radius=max(1, radius - 1), outline=(255, 255, 255, 48), width=1)
    return tile


def _text_on(bg_rgb):
    """Kolor tekstu o WYŻSZYM kontraście vs tło (kremowy albo ciemny) — ≥4,5:1."""
    bg = tuple(bg_rgb[:3])
    return CREAM if contrast_ratio(CREAM, bg) >= contrast_ratio(DARK_BAR, bg) else DARK_BAR


def draw_scrim(canvas, box, top_alpha, bottom_alpha=None):
    """Ciemny scrim z pionowym gradientem alfy — gwarancja kontrastu pod tekstem."""
    Image, _, _, _, _ = _pil()
    x0, y0, x1, y1 = [int(v) for v in box]
    w, h = max(1, x1 - x0), max(1, y1 - y0)
    if bottom_alpha is None:
        bottom_alpha = top_alpha
    grad = Image.new("L", (1, h))
    for i in range(h):
        t = i / max(1, h - 1)
        grad.putpixel((0, i), int(top_alpha + (bottom_alpha - top_alpha) * t))
    band = Image.new("RGBA", (w, h), DARK_BAR + (0,))
    band.putalpha(grad.resize((w, h)))
    canvas.alpha_composite(band, (x0, y0))


def measure_pill(canvas, text, font, pad):
    Image, ImageDraw, _, _, _ = _pil()
    tw = ImageDraw.Draw(canvas).textlength(text, font=font)
    r = font.getbbox(_PILL_REF)
    return int(tw + 2 * pad[0]), int((r[3] - r[1]) + 2 * pad[1])


def draw_pill(canvas, text, font, bg_rgba, text_rgb, topleft, pad, radius=None):
    """Zaokrąglona pigułka z tekstem — subtelny pionowy gradient (+8% u góry) + 1px wewnętrzny
    highlight (ETAP B). top-left = topleft. Zwraca (x0,y0,x1,y1)."""
    Image, ImageDraw, _, _, _ = _pil()
    tw = ImageDraw.Draw(canvas).textlength(text, font=font)
    r = font.getbbox(_PILL_REF)
    W_, H_ = int(tw + 2 * pad[0]), int((r[3] - r[1]) + 2 * pad[1])
    x0, y0 = int(topleft[0]), int(topleft[1])
    if radius is None:
        radius = H_ // 2
    a = bg_rgba[3] if len(bg_rgba) == 4 else 255
    top = _lighten(bg_rgba, 0.08) + (a,)
    bot = tuple(bg_rgba[:3]) + (a,)
    tile = _grad_pill_tile(W_, H_, radius, top, bot)
    canvas.alpha_composite(tile, (x0, y0))
    tb = font.getbbox(text)
    tcol = (text_rgb + (255,)) if len(text_rgb) == 3 else text_rgb
    ImageDraw.Draw(canvas).text((x0 + pad[0], y0 + (H_ - (tb[3] - tb[1])) // 2 - tb[1]), text, font=font, fill=tcol)
    return (x0, y0, x0 + W_, y0 + H_)


def draw_pointer(canvas, start, end, color, width, dot_r):
    """Cienka linia-wskaźnik z kropką na końcu (przy produkcie)."""
    Image, ImageDraw, _, _, _ = _pil()
    d = ImageDraw.Draw(canvas)
    col = (color + (255,)) if len(color) == 3 else color
    d.line([tuple(start), tuple(end)], fill=col, width=width)
    dr = dot_r
    d.ellipse([end[0] - dr, end[1] - dr, end[0] + dr, end[1] + dr], fill=col)


def draw_curved_arrow(canvas, start, end, color, width):
    """Odręczna krzywa strzałka (kwadratowa Béziera) + grot — marker w candid."""
    import math
    Image, ImageDraw, _, _, _ = _pil()
    d = ImageDraw.Draw(canvas)
    col = (color + (255,)) if len(color) == 3 else color
    sx, sy = start
    ex, ey = end
    cxp = (sx + ex) / 2 + (ey - sy) * 0.28
    cyp = (sy + ey) / 2 - (ex - sx) * 0.28
    pts = []
    for i in range(0, 21):
        t = i / 20.0
        pts.append(((1 - t) ** 2 * sx + 2 * (1 - t) * t * cxp + t * t * ex,
                    (1 - t) ** 2 * sy + 2 * (1 - t) * t * cyp + t * t * ey))
    d.line(pts, fill=col, width=width, joint="curve")
    ax, ay = pts[-1]
    bx, by = pts[-4]
    ang = math.atan2(ay - by, ax - bx)
    ln = width * 4.5
    for da in (math.radians(152), math.radians(-152)):
        d.line([(ax, ay), (ax + ln * math.cos(ang + da), ay + ln * math.sin(ang + da))], fill=col, width=width)


def product_bbox(rgb, y_lo=0.42, y_hi=0.96, lum_thr=74):
    """Zgrubny bbox największego CIEMNEGO obszaru (deska) w dolnej części kadru — do celowania callboxów."""
    Image, _, _, _, _ = _pil()
    W, H = rgb.size
    sw, sh = 108, 135
    px = rgb.resize((sw, sh), Image.LANCZOS).load()
    xs, ys = [], []
    for yy in range(int(sh * y_lo), int(sh * y_hi)):
        for xx in range(sw):
            r, g, b = px[xx, yy][:3]
            if (0.2126 * r + 0.7152 * g + 0.0722 * b) < lum_thr:
                xs.append(xx); ys.append(yy)
    if len(xs) < 25:
        return None
    xs.sort(); ys.sort()
    q = lambda arr, p: arr[min(len(arr) - 1, max(0, int(len(arr) * p)))]
    return (int(q(xs, 0.05) / sw * W), int(q(ys, 0.05) / sh * H),
            int((q(xs, 0.95) + 1) / sw * W), int((q(ys, 0.95) + 1) / sh * H))


def _cool(img_rgb):
    """Lekko chłodniejszy ton (−R, +B) — 'stres' po stronie PRZED."""
    Image, _, _, _, _ = _pil()
    r, g, b = img_rgb.convert("RGB").split()
    r = r.point(lambda v: int(v * 0.92))
    b = b.point(lambda v: min(255, int(v * 1.08)))
    return Image.merge("RGB", (r, g, b))


def clean_price(cena_pl):
    """Czysta cena PL ('129 zł') z lp_dane; None gdy brak. BEZ starej ceny/„-%” (uczciwość ZG4)."""
    s = str(cena_pl or "").strip()
    if not s:
        return None
    m = re.search(r"(\d[\d\s.,]*)\s*(z[łl]|PLN)", s, re.I)
    if m:
        return "%s zł" % m.group(1).strip().rstrip(".,")
    m = re.search(r"\d[\d\s.,]*\d|\d", s)
    return ("%s zł" % m.group(0).strip()) if m else None


def _logo_corner(canvas, logo_img, h_px, corner="tl", margin_frac=0.05):
    """Małe logo na jasnej pigułce w danym rogu (chrome banera, nie na zdjęciu produktu)."""
    if logo_img is None:
        return
    W, H = canvas.size
    m = int(W * margin_frac)
    pill = _logo_pill(logo_img, h_px, max_w=int(W * 0.30))
    pw, ph = pill.size
    hard = int(min(W, H) * 0.035)
    x = m if "l" in corner else W - m - pw
    y = m if "t" in corner else H - m - ph
    x = max(hard, min(x, W - hard - pw))
    y = max(hard, min(y, H - hard - ph))
    canvas.alpha_composite(pill, (x, y))


def compose_demo(scene_img, ca, logo_img, palette, cena_pl, out_path):
    """CALLOUT/ANATOMIA: scena w użyciu + górny scrim z hookiem + 3 callouty-pigułki z liniami
    do części produktu + dolny pas (COD badge + CTA). Logo małe top-left.
    Zwraca listę bboxów nakładek tekstowych/logo (ochrona liter — ETAP D)."""
    Image, ImageDraw, _, _, _ = _pil()
    canvas = _rgba_canvas(scene_img)
    W, H = canvas.size
    S = W / 1080.0
    px = lambda v: max(1, int(round(v * S)))
    m = int(W * 0.06)
    accent = _accent(palette)
    fontp = resolve_font_path_glob
    hook = (ca.get("hook_baner") or ca.get("headline") or "").strip()
    callouts = [str(c).strip() for c in (ca.get("callouts_demo") or []) if str(c).strip()][:3]
    regions = []

    # ── górny scrim (0-20%) + logo top-left + HOOK biały bold, wyrównany do lewej ──
    scrim_h = int(H * 0.20)
    draw_scrim(canvas, (0, 0, W, scrim_h), 205, 120)
    logo_bottom = int(H * 0.022)
    if logo_img is not None:
        pill = _logo_pill(logo_img, px(56), max_w=int(W * 0.30))
        canvas.alpha_composite(pill, (m, int(H * 0.022)))
        logo_bottom = int(H * 0.022) + pill.size[1]
        regions.append((m, int(H * 0.022), m + pill.size[0], logo_bottom))
    if hook:
        hy = logo_bottom + px(12)
        regions += render_hook(canvas, (m, hy), hook.upper(), fontp, int(W * 0.88),
                               scrim_h - hy - px(6), CREAM, _hook_accent(palette),
                               hi=px(86), lo=px(44), max_lines=2, leading=1.04, canvas_h=H)

    # ── dolny pas: 2 mikro-badge COD (rząd) + CTA-pigułka POD spodem (bez nachodzenia) ──
    band_top = int(H * 0.83)
    bot_h = H - band_top
    draw_scrim(canvas, (0, band_top, W, H), 120, 215)
    bf = _font(fontp, px(31))
    bpad = (px(14), px(9))
    by = band_top + px(18)
    b1 = draw_pill(canvas, "PŁATNOŚĆ ZA POBRANIEM", bf, (255, 255, 255, 235), DARK_BAR, (m, by), bpad)
    b2 = draw_pill(canvas, "14 DNI NA ZWROT", bf, (255, 255, 255, 235), DARK_BAR, (b1[2] + px(12), by), bpad)
    ctaf = _font(fontp, px(50))
    cta = "ZAMÓW ZA POBRANIEM  →"
    cw, ch = measure_pill(canvas, cta, ctaf, (px(28), px(15)))
    cbox = draw_pill(canvas, cta, ctaf, accent + (255,), _text_on(accent), ((W - cw) // 2, b1[3] + px(16)), (px(28), px(15)))
    regions += [b1, b2, cbox]

    # ── callouty-pigułki z liniami-wskaźnikami do części produktu (schowek/powierzchnia/krawędź) ──
    # deska = DOLNE ~40% kadru (nie ciemne tło nocy); cele docięte NAD dolnym pasem, żeby dot był na widocznej desce.
    bbox = product_bbox(scene_img, y_lo=0.60)
    if bbox and callouts:
        bx0, by0, bx1, by1 = bbox
        bw, bh = max(1, bx1 - bx0), max(1, by1 - by0)
        clampy = lambda yv: min(int(yv), band_top - px(16))
        targets = [
            (int(bx0 + bw * 0.80), clampy(by0 + bh * 0.28)),   # schowek (prawa-góra deski)
            (int(bx0 + bw * 0.32), clampy(by0 + bh * 0.30)),   # powierzchnia ścierna
            (int(bx0 + bw * 0.55), clampy(by0 + bh * 0.55)),   # krawędź / spód
        ]
        yb0, yb1 = max(0, int(by0 - bh * 0.2)), min(H, by1)
        left_busy = edge_variance(scene_img, (0, yb0, max(2, bx0), yb1))
        right_busy = edge_variance(scene_img, (min(W - 2, bx1), yb0, W, yb1))
        side = "left" if left_busy <= right_busy else "right"
        cf = _font(fontp, px(40))
        pad = (px(20), px(12))
        top_stack, bot_stack = int(H * 0.30), band_top - px(26)
        n = max(1, len(callouts))
        for i, txt in enumerate(callouts):
            t = txt.upper()
            pw_, ph_ = measure_pill(canvas, t, cf, pad)
            cy = int(top_stack + (bot_stack - top_stack) * (i + 0.5) / n) - ph_ // 2
            stag = px(34) if i == 1 else 0                     # środkowa odsunięta (Z-feel)
            if side == "left":
                cx = m + stag; anchor_pt = (cx + pw_, cy + ph_ // 2)
            else:
                cx = W - m - pw_ - stag; anchor_pt = (cx, cy + ph_ // 2)
            cx = max(m, min(cx, W - m - pw_))
            tgt = targets[i] if i < len(targets) else (int((bx0 + bx1) / 2), int((by0 + by1) / 2))
            draw_pointer(canvas, anchor_pt, tgt, accent, px(3), px(7))
            regions.append(draw_pill(canvas, t, cf, accent + (255,), _text_on(accent), (cx, cy), pad))

    apply_grain(canvas)
    canvas.convert("RGB").save(out_path, "PNG")
    return regions


def _draw_check(draw, x, y, size, color):
    """Wektorowy ptaszek ✓ (bez zależności od glifu fontu)."""
    w = max(3, int(size * 0.14))
    draw.line([(x, y + size * 0.55), (x + size * 0.35, y + size * 0.9)], fill=color, width=w)
    draw.line([(x + size * 0.35, y + size * 0.9), (x + size * 0.95, y + size * 0.12)], fill=color, width=w)


def compose_problem(pain_img, fakt_img, ca, marka, logo_img, palette, cena_pl, out_path):
    """PRZED/PO „STRES → SPOKÓJ": pionowy split 50/50 (PAIN desat+chłodno | FAKT ciepła),
    biała linia na styku, pigułki PRZED/PO, hook na górnym scrimie, dolny pas cena+CTA."""
    Image, ImageDraw, _, _, _ = _pil()
    W, H = FINAL_W, FINAL_H
    S = W / 1080.0
    px = lambda v: max(1, int(round(v * S)))
    m = int(W * 0.06)
    accent = _accent(palette)
    fontp = resolve_font_path_glob
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    half = W // 2
    pain = _cool(desaturate(pain_img, 0.20))
    canvas.alpha_composite(cover_fit(pain, half, H).convert("RGBA"), (0, 0))
    canvas.alpha_composite(cover_fit(fakt_img.convert("RGB"), W - half, H).convert("RGBA"), (half, 0))
    draw = ImageDraw.Draw(canvas)
    lw = px(7)
    draw.rectangle([half - lw // 2, 0, half + lw // 2 + (lw % 2), H], fill=(255, 255, 255, 255))  # biała linia styku

    # ── górny scrim + logo top-right + HOOK (transformacja) wyrównany do lewej (bez kolizji) ──
    regions = []
    scrim_h = int(H * 0.16)
    draw_scrim(canvas, (0, 0, W, scrim_h), 210, 110)
    logo_left = W
    if logo_img is not None:
        pill = _logo_pill(logo_img, px(48), max_w=int(W * 0.22))
        lx = W - int(W * 0.05) - pill.size[0]
        canvas.alpha_composite(pill, (lx, int(H * 0.022)))
        logo_left = lx
        regions.append((lx, int(H * 0.022), lx + pill.size[0], int(H * 0.022) + pill.size[1]))
    hook = (ca.get("hook_baner") or ca.get("headline") or "").strip()
    if hook:
        hmax = max(int(W * 0.40), (logo_left - int(W * 0.02)) - m)
        regions += render_hook(canvas, (m, px(16)), hook.upper(), fontp, hmax,
                               scrim_h - px(24), CREAM, _hook_accent(palette),
                               hi=px(82), lo=px(40), max_lines=2, leading=1.04, canvas_h=H)

    # pigułki PRZED (szara) / PO (akcent) w górnych rogach połówek
    lf = _font(fontp, px(46))
    py = scrim_h + px(22)
    regions.append(draw_pill(canvas, "PRZED", lf, GRAY_LABEL + (240,), CREAM, (m, py), (px(22), px(11))))
    pw2, _ = measure_pill(canvas, "PO", lf, (px(22), px(11)))
    regions.append(draw_pill(canvas, "PO", lf, accent + (255,), _text_on(accent), (W - m - pw2, py), (px(22), px(11))))

    # ── dolny pas: BLOK CENY (prawdziwa) po LEWEJ + krótkie CTA po PRAWEJ (jeden rząd, bez nachodzenia) ──
    bot_h = int(H * 0.185)
    band_top = H - bot_h
    draw_scrim(canvas, (0, band_top, W, H), 110, 218)
    cena = clean_price(cena_pl)
    if cena:
        pf = _font(fontp, px(92))
        sf = _font(fontp, px(35))
        py2 = band_top + px(30)
        regions.append(draw_text_shadow(canvas, (m, py2), cena, pf, CREAM, anchor="la", canvas_h=H))
        regions.append(draw_text_shadow(canvas, (m + px(4), py2 + px(96)), "za pobraniem", sf, accent, anchor="la", canvas_h=H))
        ctaf = _font(fontp, px(54))
        cta = "ZAMÓW  →"
        cw, ch = measure_pill(canvas, cta, ctaf, (px(30), px(16)))
        regions.append(draw_pill(canvas, cta, ctaf, accent + (255,), _text_on(accent), (W - m - cw, band_top + (bot_h - ch) // 2), (px(30), px(16))))
    else:
        ctaf = _font(fontp, px(52))
        cta = "ZAMÓW ZA POBRANIEM  →"
        cw, ch = measure_pill(canvas, cta, ctaf, (px(28), px(15)))
        regions.append(draw_pill(canvas, cta, ctaf, accent + (255,), _text_on(accent), ((W - cw) // 2, band_top + (bot_h - ch) // 2), (px(28), px(15))))

    apply_grain(canvas)
    canvas.convert("RGB").save(out_path, "PNG")
    return regions


def _pill_label(canvas, draw, text, font, color, center):
    Image, ImageDraw, _, _, _ = _pil()
    tw = draw.textlength(text, font=font)
    bb = font.getbbox("ĄĘg")
    th = bb[3] - bb[1]
    padx, pady = int(th * 0.7), int(th * 0.45)
    cx, cy = center
    box = [cx - tw / 2 - padx, cy - th / 2 - pady, cx + tw / 2 + padx, cy + th / 2 + pady]
    pill = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    pd = ImageDraw.Draw(pill)
    pd.rounded_rectangle(box, radius=int(th * 0.8), fill=(23, 19, 16, 210))
    canvas.alpha_composite(pill)
    d2 = ImageDraw.Draw(canvas)
    d2.text((cx, cy), text, font=font, fill=color + (255,), anchor="mm")


def compose_lifestyle(scene_img, ca, logo_img, palette, out_path):
    """CANDID/UGC-LOOK: minimum grafiki — JEDEN odręczny callout-marker (krzywa strzałka + krótki
    tekst-naklejka, lekko obrócony) wskazujący produkt + mała żółta kapsułka „za pobraniem" w rogu.
    Bez pasów/scrimów. Logo malutkie (6%). Ma wyglądać jak post, nie reklama."""
    Image, ImageDraw, _, _, _ = _pil()
    canvas = _rgba_canvas(scene_img)
    W, H = canvas.size
    S = W / 1080.0
    px = lambda v: max(1, int(round(v * S)))
    accent = _accent(palette)
    fontp = resolve_font_path_glob
    marker = (ca.get("hook_baner") or "").strip()
    regions = []

    bbox = product_bbox(scene_img)
    if marker and bbox:
        bx0, by0, bx1, by1 = bbox
        txt = re.sub(r"\[\[|\]\]", "", marker).upper()            # marker candid nie renderuje akcentu
        mf = _font(fontp, px(44))
        pad = (px(18), px(10))
        tw = ImageDraw.Draw(canvas).textlength(txt, font=mf)
        r = mf.getbbox(_PILL_REF)
        pw_, ph_ = int(tw + 2 * pad[0]), int((r[3] - r[1]) + 2 * pad[1])
        stamp = Image.new("RGBA", (pw_, ph_), (0, 0, 0, 0))
        sd = ImageDraw.Draw(stamp)
        sd.rounded_rectangle([0, 0, pw_, ph_], radius=ph_ // 2, fill=(255, 255, 255, 232))
        tb = mf.getbbox(txt)
        sd.text((pad[0], (ph_ - (tb[3] - tb[1])) // 2 - tb[1]), txt, font=mf, fill=DARK_BAR + (255,))
        stamp = stamp.rotate(-7, expand=True, resample=Image.BICUBIC)
        # naklejka nad produktem, po stronie z miejscem (unikaj prawej, gdzie zwykle osoba)
        sx = max(int(W * 0.06), min(int(bx0 + (bx1 - bx0) * 0.05), W - stamp.size[0] - int(W * 0.06)))
        sy = max(int(H * 0.30), by0 - stamp.size[1] - px(46))
        canvas.alpha_composite(stamp, (sx, sy))
        regions.append((sx, sy, sx + stamp.size[0], sy + stamp.size[1]))
        draw_curved_arrow(canvas, (sx + stamp.size[0] // 2, sy + stamp.size[1] - px(4)),
                          (int(bx0 + (bx1 - bx0) * 0.5), int(by0 + (by1 - by0) * 0.35)), accent, px(5))

    # żółta kapsułka „za pobraniem" w rogu (36px)
    yf = _font(fontp, px(36))
    YEL = (245, 202, 60)
    pw2, _ = measure_pill(canvas, "za pobraniem", yf, (px(16), px(9)))
    regions.append(draw_pill(canvas, "za pobraniem", yf, YEL + (240,), DARK_BAR, (W - int(W * 0.06) - pw2, int(H * 0.055)), (px(16), px(9))))

    lbox = place_logo(canvas, logo_img, 0.06, allow_top=True, pill_frac=0.058)   # logo malutkie, jasny róg
    if isinstance(lbox, tuple):
        regions.append(lbox)

    apply_grain(canvas)
    canvas.convert("RGB").save(out_path, "PNG")
    return regions


# Globalny uchwyt na ścieżkę fontu (ustawiany w run() po odczycie brandingu).
resolve_font_path_glob = FALLBACK_FONT


# ══════════════════════════════════════════════════════════════════════════════
# ETAP D — BRAMKA OCHRONY LITER (pHash crop B vs C; > próg = finisher odrzucony).
# ══════════════════════════════════════════════════════════════════════════════
_DCT_COS = {}


def _dct_cos(N, K):
    key = (N, K)
    if key not in _DCT_COS:
        _DCT_COS[key] = [[math.cos(math.pi * (2 * n + 1) * k / (2 * N)) for n in range(N)] for k in range(K)]
    return _DCT_COS[key]


def phash(img, hash_size=8, N=32):
    """Perceptual hash (separable DCT, bez numpy). Zwraca 63-bit int (DC pominięty)."""
    Image, _, _, _, _ = _pil()
    g = img.convert("L").resize((N, N), Image.LANCZOS)
    px = list(g.getdata())
    f = [px[y * N:(y + 1) * N] for y in range(N)]
    cos = _dct_cos(N, hash_size)
    R = [[0.0] * hash_size for _ in range(N)]
    for y in range(N):
        fy = f[y]
        for u in range(hash_size):
            cu = cos[u]
            R[y][u] = sum(fy[x] * cu[x] for x in range(N))
    D = [[0.0] * hash_size for _ in range(hash_size)]
    for v in range(hash_size):
        cv = cos[v]
        for u in range(hash_size):
            D[v][u] = sum(R[y][u] * cv[y] for y in range(N))
    vals = [D[v][u] for v in range(hash_size) for u in range(hash_size)][1:]   # pomiń DC
    med = sorted(vals)[len(vals) // 2]
    bits = 0
    for val in vals:
        bits = (bits << 1) | (1 if val > med else 0)
    return bits


def hamming(a, b):
    return bin(a ^ b).count("1")


def _rms(a, b):
    Image, _, _, _, _ = _pil()
    ga = list(a.convert("L").resize((64, 64), Image.LANCZOS).getdata())
    gb = list(b.convert("L").resize((64, 64), Image.LANCZOS).getdata())
    n = len(ga) or 1
    return (sum((ga[i] - gb[i]) ** 2 for i in range(n)) / n) ** 0.5


def letter_gate(imgB, imgC, regions, phash_max=LETTER_GATE_PHASH_MAX):
    """Porównuje cropy bboxów (litery/loga) wersji B vs C. Przekroczenie progu pHash na
    KTÓRYMKOLWIEK regionie = finisher odrzucony. Zwraca (ok, details, worst_phash)."""
    W, H = imgB.size
    Wc, Hc = imgC.size
    sx, sy = Wc / W, Hc / H
    pad = int(0.01 * H)
    details, worst, ok = [], 0, True
    for box in regions:
        x0, y0, x1, y1 = [int(v) for v in box]
        bx = (max(0, x0 - pad), max(0, y0 - pad), min(W, x1 + pad), min(H, y1 + pad))
        if bx[2] - bx[0] < 6 or bx[3] - bx[1] < 6:
            continue
        cropB = imgB.crop(bx)
        cropC = imgC.crop((int(bx[0] * sx), int(bx[1] * sy), int(bx[2] * sx), int(bx[3] * sy)))
        d = hamming(phash(cropB), phash(cropC))
        rms = _rms(cropB, cropC)
        fail = d > phash_max
        details.append({"box": bx, "phash": d, "rms": round(rms, 1), "fail": fail})
        worst = max(worst, d)
        if fail:
            ok = False
    return ok, details, worst


# ══════════════════════════════════════════════════════════════════════════════
# ETAP C — FINISHER PASS („ręka grafika") + bramka liter D.
# ══════════════════════════════════════════════════════════════════════════════
def run_finisher(out_dir, creatives, regions_by_angle, state, slug):
    """Złożony baner B → nbpro finisher → C. Bramka liter (pHash) decyduje C vs B.
    Zapisuje ad_<angle>_45.png (wybrana) + ad_<angle>_45_pre_finisher.png. Zwraca (added_usd, verdicts)."""
    Image, _, _, _, _ = _pil()
    fal = _fal()
    jobs, pre_by_angle = [], {}
    for cr in creatives:
        a, b_path = cr["angle"], cr["path"]
        pre_path = os.path.join(out_dir, "ad_%s_45_pre_finisher.png" % a)
        shutil.copyfile(b_path, pre_path)
        pre_by_angle[a] = pre_path
        url = fal.store(pre_path, "adforge/%s/finisher_in_%s.png" % (slug, a))
        jobs.append({"tag": a, "model": NBPRO_EDIT, "image_urls": [url], "prompt": FINISHER_PROMPT})
    log("FINISHER: %d banerów → nbpro (2K, 4:5)…" % len(jobs))
    got = gen_nbpro_batch(jobs, os.path.join(out_dir, "finisher"))
    added = NBPRO_USD * len(jobs)
    verdicts = []
    for cr in creatives:
        a, b_path = cr["angle"], cr["path"]
        regions = regions_by_angle.get(a) or []
        c_path = got.get(a)
        if not c_path or not os.path.isfile(c_path):
            verdicts.append({"angle": a, "verdict": "BRAK_FINISHERA", "worst": None, "regions": len(regions)})
            log("finisher %s: BRAK wyniku — zostaje B" % a)
            continue
        imgB = Image.open(pre_by_angle[a]).convert("RGB")
        imgC = to_45(Image.open(c_path).convert("RGB")).resize((FINAL_W, FINAL_H), Image.LANCZOS)
        ok, details, worst = letter_gate(imgB, imgC, regions)
        if ok:
            imgC.save(b_path, "PNG")
            verdicts.append({"angle": a, "verdict": "APPLIED", "worst": worst, "regions": len(regions)})
            log("finisher %s: APPLIED (worst pHash=%s ≤ %d, %d regionów)" %
                (a, worst, LETTER_GATE_PHASH_MAX, len(regions)))
        else:
            rej = os.path.join(out_dir, "ad_%s_45_rejected_finisher.png" % a)
            imgC.save(rej, "PNG")
            verdicts.append({"angle": a, "verdict": "REJECTED", "worst": worst, "regions": len(regions)})
            log("finisher %s: REJECTED (worst pHash=%s > %d) — zostaje B; C→%s" %
                (a, worst, LETTER_GATE_PHASH_MAX, os.path.basename(rej)))
        for dd in details:
            if dd["fail"]:
                log("   region FAIL box=%s pHash=%d rms=%s" % (dd["box"], dd["phash"], dd["rms"]))
    state.setdefault("finisher", {})["verdicts"] = verdicts
    return added, verdicts


# ══════════════════════════════════════════════════════════════════════════════
# BRAMKA „POWÓD KLIKNIĘCIA" (v7.1, Tomek: „czy banery PRZEKONUJĄ do wejścia w reklamę — klik, nie estetyka").
# Vision-checklista finałów: AGENT ogląda KAŻDY baner i odpowiada 3 pytania; brak jasnej odpowiedzi =
# poprawka briefu + regeneracja kąta. Werdykty agenta w KLIK.json → state.klik_verdicts (audyt).
# ══════════════════════════════════════════════════════════════════════════════
CLICK_GATE_QUESTIONS = [
    "(a) CO widz rozumie w 0,5 s (jeden rzut oka, zanim scrolluje dalej)?",
    "(b) JAKI HAK każe kliknąć (ciekawość / benefit / ulga) — a nie sama estetyka?",
    "(c) Czy USP/mechanizm produktu (to, co realnie robi i dlaczego pomaga) jest WIDOCZNY w kadrze — moment użycia, nie martwy packshot?",
]


def print_click_gate(angles, klik=None):
    """Wypisuje bramkę powodu kliknięcia jako OBOWIĄZKOWĄ checklistę finałów (odpowiada AGENT z vision)."""
    print("BRAMKA POWODU KLIKNIĘCIA (vision — obejrzyj KAŻDY finał; brak jasnej odpowiedzi = poprawka briefu + regen):")
    for q in CLICK_GATE_QUESTIONS:
        print("   %s" % q)
    if klik and isinstance(klik.get("werdykty"), list):
        for v in klik["werdykty"]:
            print("  • %-10s klik=%-4s | 0.5s: %s | hak: %s | USP: %s" %
                  (str(v.get("kreacja", "?")), str(v.get("werdykt", "?")), v.get("s05", "?"),
                   v.get("hak", "?"), v.get("usp", "?")))


# ══════════════════════════════════════════════════════════════════════════════
# QA + PUBLIKACJA.
# ══════════════════════════════════════════════════════════════════════════════
def run_ad_gate(out_dir):
    dowody = os.path.join(out_dir, "dowody")
    cmd = [sys.executable, os.path.join(HERE, "ad-gate.py"), out_dir, "--out", dowody]
    log("QA: " + " ".join(cmd))
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", timeout=300)
        print(p.stdout)
        if p.stderr:
            print(p.stderr)
        return p.returncode
    except Exception as e:
        log("ad-gate nie uruchomiony: %s" % e)
        return None


# ══════════════════════════════════════════════════════════════════════════════
# PEŁNA EMISJA PRZEBIEGU DO PANELU (życzenie Tomka: „wszystko co dzieje się w generowaniu
# dopasuj do kroku — chcę widzieć wszystko ważne tam"). Wypełnia sub-kroki agr_* z FAKTÓW
# przebiegu (state) + krok główny ads_grafiki (checklista VERBATIM, grafiki_url) + oś czasu.
# Wzorzec 1:1 z fabryką wideo (avi_*) i landingów (panel-sync). Odporne: brak pliku/pola nie
# przerywa publikacji.
# ══════════════════════════════════════════════════════════════════════════════
def _hooks_line(state, angles):
    """„demo — „hook” · problem — „hook” · …" z copy w state (do noty briefu)."""
    copy = state.get("copy") or {}
    parts = []
    for a in angles:
        h = _fd_txt((copy.get(a) or {}).get("hook_baner") or (copy.get(a) or {}).get("headline") or "")
        if h:
            parts.append("%s — „%s”" % (a, h))
    return " · ".join(parts)


def _qa_lines(state, angles):
    """Werdykty 4 bramek per kąt z state: litery (fd_gate) · wierność (fidelity_verdicts,
    cechy twarde T/N) · klik (klik_verdicts). Brak danych = „—"."""
    fdg = state.get("fd_gate") or {}
    fv = state.get("fidelity_verdicts") or {}
    fv_hard = fv.get("cechy_twarde") or []
    fv_verd = fv.get("werdykty") or []
    kv = (state.get("klik_verdicts") or {}).get("werdykty") or []

    def _match(lst, a):
        for e in lst:
            if isinstance(e, dict) and str(e.get("kreacja", "")).lower().startswith(a):
                return e
        return {}

    lines = []
    for a in angles:
        lit = str((fdg.get(a) or {}).get("verdict") or "").split("(")[0].strip() or "—"
        fe = _match(fv_verd, a)
        if fv_hard and fe:
            wr = "OK" if all(str(fe.get(k, "")).strip().upper().startswith("T") for k in fv_hard) else "UWAGA"
        else:
            wr = "—"
        klik = str(_match(kv, a).get("werdykt") or "—")
        lines.append("• %s — litery: %s · wierność: %s · klik: %s" % (a, lit, wr, klik))
    return lines


def _upload_proofs(ps, project, product_id, out_dir, slug, angles):
    """Dowody bramek → Storage bud-assets/<slug>/ads/dowody/ (WebP) + artefakty kind='proof'
    na kroku agr_qa: ARKUSZ-BRAMEK (buduje gdy brak) + WIERNOSC-CIAGLOSC + WIERNOSC-<kąt>."""
    dowody = os.path.join(out_dir, "dowody")
    product_locals = sorted(glob.glob(os.path.join(out_dir, "refs", "packshot-*")))
    sheet = os.path.join(dowody, "ARKUSZ-BRAMEK.png")
    if not os.path.isfile(sheet):
        try:
            build_gate_sheet(out_dir, product_locals, angles)      # standardowy full-design go nie tworzy
        except Exception as e:
            log("proof: arkusz bramek nieudany: %s" % e)
    plan = []
    if os.path.isfile(sheet):
        plan.append((sheet, "Arkusz bramek (kandydaci + finały)"))
    cont = os.path.join(dowody, "WIERNOSC-CIAGLOSC.png")
    if os.path.isfile(cont):
        plan.append((cont, "Dowód ciągłości (realny produkt | finały)"))
    for a in angles:
        wf = os.path.join(dowody, "WIERNOSC-%s.png" % a)
        if os.path.isfile(wf):
            plan.append((wf, "Wierność %s (packshot | kreacja)" % a))
    for a in angles:
        kp = os.path.join(dowody, "KWADRAT-%s.png" % a)
        if os.path.isfile(kp):
            plan.append((kp, "Kwadrat 1:1 %s (4:5 źródło | 1:1)" % a))
    n = 0
    for src, label in plan:
        try:
            base = os.path.basename(src).rsplit(".", 1)[0] + ".webp"
            dest = "bud-assets/%s/ads/dowody/%s" % (slug, base)
            pub = ps.storage_upload(src, dest, bucket="attachments", max_width=1600, to_webp=True, quality=82)
            ps.artifact_add(project, product_id, "agr_qa", "proof", pub, label=label, meta={"gate_sheet": True})
            n += 1
        except Exception as e:
            log("proof upload nieudany (%s): %s" % (os.path.basename(src), e))
    log("dowody bramek → panel: %d artefaktów kind='proof' na agr_qa" % n)
    return n


def emit_full_panel(bundle, engine, out_dir, slug, creatives, total_usd, state, finalize=True, formats=None):
    """Pełna emisja do panelu. finalize=True: agr_brief/generacja/qa/final → done + krok
    główny ads_grafiki → done (checklista wg faktów, grafiki_url) + activity. finalize=False
    (po samej generacji): brief/generacja/qa done + ads_grafiki → in_progress, agr_final zostaje
    pending — Tomek widzi przebieg zanim uruchomisz --finalize.
    formats: lista opublikowanych formatów ('45'/'11') do not (liczba formatów)."""
    ps = _load_module("panel_sync", "panel-sync.py")
    p = bundle["product"]
    project = p["project_id"]
    product_id = p["id"]
    state = state or {}
    angles = [c["angle"] for c in creatives]
    formats = [f for f in (formats or ["45"]) if f in ALLOWED_FORMATS] or ["45"]
    fmt_txt = " + ".join(FORMAT_LABEL.get(f, f) for f in formats)
    n_fmt = len(formats)
    copy = state.get("copy") or {}
    karta = state.get("karta") or {}
    n_cech = len(karta.get("cechy") or []) if isinstance(karta, dict) else 0
    timings = state.get("timings") or {}
    walls = [v for k, v in timings.items() if k.endswith("_wall_s") and isinstance(v, (int, float)) and v > 0]
    wall = max(walls) if walls else 0.0
    n_regen = len(state.get("regens") or [])
    n_fix = len(state.get("fd_fixes") or []) + len(state.get("fidelity_fixes") or [])
    n_jobs = BEST_OF * max(1, len(creatives)) + BEST_OF * n_regen
    hook_files = sorted(glob.glob(os.path.join(out_dir, "ad_*_45_h[0-9]*.png")))
    n_variants = len(hook_files)
    has_variants = bool(state.get("hook_variants")) or n_variants > 0

    # ── agr_brief: karta produktu + copy (hook per kąt) ──
    brief_note = "Brief gotowy · karta produktu: %s · copy dla %d kątów." % (
        ("%d cech" % n_cech) if n_cech else "dziedziczona z fabryki landingu", len(angles))
    hl = _hooks_line(state, angles)
    if hl:
        brief_note += "\nHooki: " + hl
    ps.step_update(project, product_id, "agr_brief", status="done", note=brief_note)

    # ── agr_generacja: silnik · joby · formaty · czas ściany · koszt ──
    gen_note = ("Silnik: fal-ai/nano-banana-pro (full-design, best-of-%d) · joby: %d · regeneracje: %d · "
                "formaty: %s (%d) · koszt fal: ~$%.2f (~%.2f zł)." %
                (BEST_OF, n_jobs, n_regen, fmt_txt, n_fmt, total_usd, total_usd * 4.0))
    if wall > 0:
        gen_note += " Czas ściany generacji: %.0fs." % wall
    ps.step_update(project, product_id, "agr_generacja", status="done", note=gen_note)

    # ── agr_qa: werdykty 4 bramek + dowody (proof do Storage) ──
    qa_note = "Bramki QA (dowody w folderze ads/dowody/):\n" + "\n".join(_qa_lines(state, angles))
    qa_note += ("\nCiągłość: WIERNOSC-CIAGLOSC.png (ten sam obiekt między scenami). "
                "Fixy chirurgiczne: %d · regeneracje: %d." % (n_fix, n_regen))
    ps.step_update(project, product_id, "agr_qa", status="done", note=qa_note)
    try:
        _upload_proofs(ps, project, product_id, out_dir, slug, angles)
    except Exception as e:
        log("dowody bramek nie wgrane: %s" % e)

    # ── ads_grafiki: checklista wg faktów (VERBATIM) + grafiki_url ──
    registered = finalize            # rejestr wf2_creatives + koszt logujemy dopiero na publikacji
    facts = {
        "Karta produktu + copy gotowe": bool(copy),
        "Sceny wygenerowane (best-of-2, silnik fal)": bool(creatives),
        "Bramki QA: litery PL · wierność produktu · ciągłość · powód kliknięcia — z dowodami": True,
        "Dowody w bud-assets/<slug>/ads/dowody/": True,
        "Warianty hooków opublikowane": has_variants,
        "Rejestr wf2_creatives + koszty zalogowane": registered,
        "Banery zaakceptowane w panelu (toggle ✓)": False,      # bramka Tomka — nigdy nie odhaczamy sami
    }
    checklist = [{"t": t, "done": bool(facts.get(t, False))} for t in ADS_GRAFIKI_CHECKLIST]
    folder_url = ps.public_url("bud-assets/%s/ads/" % slug)
    variants_txt = (" + %d wariantów hooków" % n_variants) if n_variants else ""

    if finalize:
        # ── agr_final: publikacja + warianty + public URL-e (wszystkie formaty) ──
        final_note = "Opublikowano %d kątów × %d formatów [%s] (%s)%s." % (
            len(creatives), n_fmt, fmt_txt, "/".join(angles), variants_txt)
        for c in creatives:
            urls = c.get("urls") or ({"45": c["image_url"]} if c.get("image_url") else {})
            for f in formats:
                if urls.get(f):
                    final_note += "\n%s · %s → %s" % (c["angle"], FORMAT_LABEL.get(f, f), urls[f])
        ps.step_update(project, product_id, "agr_final", status="done", note=final_note)

        main_note = ("Fabryka ad-forge v10 (full-design nano-banana-pro): %d kątów × %d formatów [%s]%s "
                     "opublikowane · 4 bramki z dowodami · koszt ~$%.2f (~%.2f zł). Akcept kreacji = "
                     "bramka Tomka (toggle ✓ przy każdym banerze)." %
                     (len(creatives), n_fmt, fmt_txt, variants_txt, total_usd, total_usd * 4.0))
        ps.step_update(project, product_id, "ads_grafiki", status="done", note=main_note,
                       fields={"grafiki_url": folder_url}, checklist=checklist)
        ps.activity_add(project, "ads_grafiki",
                        "Banery reklamowe (ad-forge v10): %d kątów × %d formatów [%s]%s → panel · "
                        "4 bramki z dowodami · koszt ~$%.2f (~%.2f zł)" %
                        (len(creatives), n_fmt, fmt_txt, variants_txt, total_usd, total_usd * 4.0))
    else:
        main_note = ("Generacja gotowa (full-design nano-banana-pro): %d kątów × %d formatów [%s]%s · "
                     "dowody bramek w panelu. Po weryfikacji uruchom ad-forge --finalize "
                     "(publikacja + rejestr)." % (len(creatives), n_fmt, fmt_txt, variants_txt))
        ps.step_update(project, product_id, "ads_grafiki", status="in_progress", note=main_note,
                       fields={"grafiki_url": folder_url}, checklist=checklist)
    log("PANEL: emisja %s → ads_grafiki + agr_brief/generacja/qa%s"
        % ("FINALIZE" if finalize else "GENERACJA", "/final" if finalize else ""))


def publish(bundle, engine, out_dir, creatives, total_usd, state=None, formats=None, square_usd=0.0):
    """Rejestracja przez import panel-sync: storage → product_meta → creative_upsert →
    artifact_add → cost_add, a na końcu PEŁNA emisja przebiegu (emit_full_panel): sub-kroki
    agr_* + krok główny ads_grafiki (checklista/grafiki_url) + oś czasu.
    formats: lista formatów do publikacji ('45'/'11'); dla każdego (kąt×format) z istniejącym
    plikiem ad_<kąt>_<fmt>.png = storage + wiersz wf2_creatives + artefakt + element blobu."""
    ps = _load_module("panel_sync", "panel-sync.py")
    p = bundle["product"]
    project = p["project_id"]
    product_id = p["id"]
    slug = str(p.get("slug") or product_id)
    formats = [f for f in (formats or ["45"]) if f in ALLOWED_FORMATS]

    # ── storage + elementy blobu: klucz = (kąt, format) ──
    new_by_key, rows = {}, []      # rows = [(angle, fmt, url, cr)]
    for cr in creatives:
        cr.setdefault("urls", {})
        for fmt in formats:
            fpath = os.path.join(out_dir, "ad_%s_%s.png" % (cr["angle"], fmt))
            if not os.path.isfile(fpath):
                if fmt == "45":
                    fpath = cr.get("path") or fpath          # 45 = ścieżka z creatives (back-compat)
                if not os.path.isfile(fpath):
                    continue
            dest = "bud-assets/%s/ads/ad_%s_%s.png" % (slug, cr["angle"], fmt)
            pub = ps.storage_upload(fpath, dest, bucket="attachments", upsert=True)
            cr["urls"][fmt] = pub
            new_by_key[(cr["angle"], fmt)] = {
                "angle": cr["angle"], "format": fmt, "headline": cr["headline"],
                "primary_text": cr["primary_text"], "badge": "", "image_url": pub, "approved": False,
            }
            rows.append((cr["angle"], fmt, pub, cr))
        cr["image_url"] = cr["urls"].get("45") or (next(iter(cr["urls"].values()), None))

    # MERGE po (kąt,format): NIE nadpisuj całego blobu — podmień przetworzone pary, zachowaj resztę
    # (świeży GET, żeby nie zgubić równoległych zmian panelu; legacy element bez 'format' = '45').
    def _key(el):
        return (el.get("angle"), str(el.get("format") or "45")) if isinstance(el, dict) else None
    try:
        cur = rest_get("wf2_products", {"id": "eq." + product_id, "select": "ads_creatives"})
        existing = (cur[0].get("ads_creatives") if cur else None) or []
        if not isinstance(existing, list):
            existing = []
    except Exception:
        existing = []
    merged, seen = [], set()
    for el in existing:
        k = _key(el)
        if k in new_by_key:
            merged.append(new_by_key[k]); seen.add(k)
        elif isinstance(el, dict):
            merged.append(el)
    for k, item in new_by_key.items():
        if k not in seen:
            merged.append(item)
    ps.product_meta(product_id, {"ads_creatives": merged})
    log("ads_creatives MERGE: podmieniono %s, blob ma teraz %d elementów (%s)" %
        (sorted("%s/%s" % k for k in new_by_key), len(merged),
         ", ".join("%s·%s" % (x.get("angle", "?"), x.get("format", "?")) for x in merged)))

    per_cost = round(total_usd / max(1, len(rows)), 4)
    for angle, fmt, url, cr in rows:
        cslug = "%s-ad-%s-%s" % (slug, angle, fmt)
        ps.creative_upsert(cslug, project_id=project, product_id=product_id, media_type="image",
                           angle=angle, format=fmt, ai_labeled=True, status="ready",
                           public_url=url, cost_usd=per_cost,
                           meta={"engine": "adforge-" + engine, "headline": cr["headline"], "format": fmt})
        ps.artifact_add(project, product_id, "agr_generacja", "ad_creative", url,
                        label="AD %s %s" % (angle, fmt), meta={"angle": angle, "format": fmt})
    # KOSZT: kwadraty 1:1 = OSOBNY wiersz, kwota WYPROWADZONA z liczby opublikowanych plików '11'
    # (idempotencja po note — dogenerowanie 1:1 mogło paść w osobnym przebiegu --gen-11 --no-register,
    # więc NIE polegamy na przekazanym square_usd). Baza (4:5 + fixy) = total minus koszt kwadratów.
    n_sq = sum(1 for r in rows if r[1] == "11")
    sq_cost = round(NBPRO_USD * n_sq, 4)
    base_usd = round(max(0.0, total_usd - sq_cost), 4)
    if base_usd > 0:                                              # recompose ($0) nie dokłada wierszy kosztu
        cost_kind = "fal" if engine == "nbpro" else "gpt-image"     # nbpro → fal (nie gpt-image)
        ps.cost_add(project, product_id, base_usd, kind=cost_kind, step="agr_generacja",
                    stage=5, note="ad-forge %d kreacji (%s)" % (len(creatives), engine))
    if n_sq > 0:
        ps.cost_add(project, product_id, sq_cost, kind="fal", step="agr_generacja",
                    stage=5, note="ad-forge kwadraty 1:1 (%d kątów)" % n_sq)
    # PEŁNA emisja przebiegu do panelu (agr_* + krok główny + oś czasu). Publikacja = finalize.
    emit_full_panel(bundle, engine, out_dir, slug, creatives, total_usd, state, finalize=True, formats=formats)
    return merged


# ── kompozycja wszystkich kątów + finisz (współdzielone: generacja i --recompose) ──
def _pick_demo_scene(scene_imgs):
    """Demo (callout/anatomia) korzysta z ISTNIEJĄCEJ sceny w użyciu — produkt większy/czytelniejszy
    pod linie: preferuj problem_fakt (deska + smakołyki w schowku, oddzielna od lifestyle), potem
    lifestyle_ugc, na końcu studyjny demo_hero."""
    for key in (("problem", "fakt"), ("lifestyle", "ugc"), ("demo", "hero")):
        if key in scene_imgs:
            return scene_imgs[key]
    return next(iter(scene_imgs.values())) if scene_imgs else None


def compose_all(angles, copy, scene_imgs, out_dir, brand_name, logo_img, palette, cena_pl):
    creatives = []
    regions_by_angle = {}
    for a in angles:
        ca = copy.get(a) or {}
        out_path = os.path.join(out_dir, "ad_%s_45.png" % a)
        regs = []
        if a == "demo":
            regs = compose_demo(_pick_demo_scene(scene_imgs), ca, logo_img, palette, cena_pl, out_path)
        elif a == "problem":
            regs = compose_problem(scene_imgs[(a, "pain")], scene_imgs[(a, "fakt")], ca, brand_name,
                                   logo_img, palette, cena_pl, out_path)
        elif a == "lifestyle":
            regs = compose_lifestyle(scene_imgs[(a, "ugc")], ca, logo_img, palette, out_path)
        regions_by_angle[a] = [tuple(int(v) for v in bx) for bx in (regs or []) if bx]
        creatives.append({"angle": a, "path": out_path,
                          "headline": (ca.get("hook_baner") or ca.get("headline") or ""),
                          "primary_text": ca.get("primary_text") or ""})
        log("Kompozycja gotowa: %s (%d regionów-liter)" % (out_path, len(regions_by_angle[a])))
    return creatives, regions_by_angle


def finish(args, bundle, engine, out_dir, creatives, total_usd, mode="gen",
           regions_by_angle=None, state=None, run_finisher_pass=False, formats=None, square_usd=0.0):
    slug = str(bundle["product"].get("slug") or bundle["product"]["id"])
    finisher_verdicts = []
    if run_finisher_pass and not getattr(args, "no_finisher", False):
        print("-" * 88)
        added, finisher_verdicts = run_finisher(out_dir, creatives, regions_by_angle or {}, state or {}, slug)
        total_usd += added
        # zapisz werdykty do state na dysku
        try:
            sp = os.path.join(out_dir, "adforge-state.json")
            st = json.loads(io.open(sp, encoding="utf-8").read()) if os.path.isfile(sp) else {}
            st.setdefault("finisher", {})["verdicts"] = finisher_verdicts
            st["regions"] = {a: [list(b) for b in (regions_by_angle or {}).get(a, [])] for a in (regions_by_angle or {})}
            io.open(sp, "w", encoding="utf-8").write(json.dumps(st, ensure_ascii=False, indent=1))
        except Exception as e:
            log("state zapis werdyktów nieudany: %s" % e)
    print("-" * 88)
    gate_rc = run_ad_gate(out_dir)
    if args.no_register:
        print("-" * 88)
        print("[--no-register] Pominięto rejestrację w panelu.")
    else:
        print("-" * 88)
        log("Publikacja do panelu (panel-sync)…")
        publish(bundle, engine, out_dir, creatives, total_usd, state=state,
                formats=formats, square_usd=square_usd)
    print("=" * 88)
    fmt_pub = " · formaty: %s" % (" + ".join(FORMAT_LABEL.get(f, f) for f in (formats or ["45"]))) if formats else ""
    print("GOTOWE (%s) — %d kątów (%s)%s, koszt płatny ~$%.2f (~%.2f zł)" %
          (mode, len(creatives), engine, fmt_pub, total_usd, total_usd * 4.0))
    for cr in creatives:
        print("  • %-10s %s  | headline: %s" % (cr["angle"], cr["path"], cr["headline"]))
    if finisher_verdicts:
        print("BRAMKA LITER (finisher B vs C):")
        for v in finisher_verdicts:
            print("  • %-10s %-14s worst_pHash=%s (próg %d, %d regionów)" %
                  (v["angle"], v["verdict"], v["worst"], LETTER_GATE_PHASH_MAX, v["regions"]))
    print("Werdykt ad-gate: %s (agent ogląda finały SAM — skrypt tylko raportuje)" %
          ("PASS" if gate_rc == 0 else ("FLAG" if gate_rc == 1 else "n/d")))
    print("out=%s" % out_dir)
    return gate_rc


def load_logo(logo_url, refs_dir):
    if not logo_url:
        return None
    try:
        from PIL import Image
        lblob, _ = _download(logo_url)
        os.makedirs(refs_dir, exist_ok=True)
        io.open(os.path.join(refs_dir, "logo-combo.png"), "wb").write(lblob)
        return Image.open(io.BytesIO(lblob)).convert("RGBA")
    except Exception as e:
        log("logo pobranie nieudane: %s" % e)
        return None


# ══════════════════════════════════════════════════════════════════════════════
# TRYB FULL-DESIGN (nowy default dla nbpro) — model komponuje CAŁY baner w JEDNYM akcie
# (foto + typografia + pigułki + linie + logo zintegrowane), a nie nakładki Pillow („naklejki").
# Brief buildAdsInstruction (rev3) — kompozycja pełnego banera:
# wierność 1:1 przez załącznik, DNA marki, art-direction per kąt, zakazy uczciwości COD/Meta,
# diakrytyki w wersalikach. RÓŻNICA: copy już mamy (call_copy) → podajemy DOKŁADNE napisy verbatim.
# Bramka tekstu = AGENT (vision) porównuje litera-po-literze; skrypt daje kandydatów + fix chirurgiczny.
# ══════════════════════════════════════════════════════════════════════════════
FD_HEADER = (
    "You are a senior creative director at a top D2C advertising agency. Design ONE finished, "
    "polished 4:5 vertical ad banner (IG/FB feed) for a Polish single-product store with CASH ON "
    "DELIVERY (płatność przy odbiorze). Output a complete, ready-to-run ad — YOU compose EVERYTHING "
    "as one cohesive design: photography, layout, typography, pills/labels, connector lines and logo "
    "placement fully INTEGRATED into the image (this is graphic design, NOT stickers pasted on a "
    "photo). Agency-grade: cinematic light, deliberate composition, generous negative space, crisp "
    "kerning; the FEWER elements, the more expensive it looks."
)
FD_PRODUCT = (
    "\n\nPRODUCT — 1:1 FIDELITY (sacred): the FIRST reference image is the EXACT product. Reproduce it "
    "1:1 wherever it appears — same shape, colors, materials, details and on-product branding. Reproduce "
    "ONLY the physical product; IGNORE and DROP any arrows, chevrons, watermarks or text baked into the "
    "reference. Do not reinterpret, restyle or invent a variant."
)


def _fd_product_para(n_product):
    """Akapit wierności produktu. Przy MULTI-REF (2-4 kadry) mówi JEDNO zdanie ról — wygląd niosą
    refy, NIE recytujemy anatomii słowem (doktryna 0i/GRAFIKA-Z-MAKIETY §4b)."""
    if n_product <= 1:
        return FD_PRODUCT
    return (
        "\n\nPRODUCT — 1:1 FIDELITY (sacred): Images 1-%d show the SAME product from different angles and "
        "states — reproduce this exact product with its exact geometry (overall silhouette, proportions, "
        "thickness, and every functional part, opening or moving element); do not redesign or invent "
        "variations. Keep its shape, colors, "
        "materials, details and on-product branding identical wherever it appears. Reproduce ONLY the physical "
        "product; IGNORE and DROP any arrows, chevrons, watermarks, measurement lines or text baked into the "
        "reference images." % n_product
    )
FD_HONESTY = (
    "\n\nHONESTY (Meta 2026 / COD): NO invented urgency or countdowns; NO shipping-time or 'in-stock in "
    "Poland' claims; NO invented numbers, stars or reviews; NO foreign brand logos; NO medical/wellness "
    "claims; NO before/after of a human body; NO personal attributes accusing the viewer. Render NO price "
    "or number except where explicitly listed below."
)
FD_TEXT_RULE = (
    "\n\nEXACT TEXT — render these Polish strings VERBATIM, character-for-character, WITH Polish diacritics "
    "PRESERVED EVEN IN UPPERCASE (keep Ó Ń Ś Ż Ź Ą Ę Ł Ć — never flatten to O N S Z A E L C). Do NOT "
    "translate, paraphrase, reorder, add or drop any word or letter. Use a clean bold modern sans. "
    "Every glyph must be sharp and spelled correctly. Put NO other text anywhere on the image.\n"
)

# ART-DIRECTION per kąt — PRODUCT-AGNOSTIC (generalizacja v9, lekcja Masażer 19.07: fabryka była
# zahardkodowana pod Drapka/psa; scenariusz/AKCJĘ niesie teraz scene_vision/pain_vision z copy —
# per produkt — a szablon opisuje tylko KOMPOZYCJĘ/layout/światło. Placeholdery {SCENE}/{PAIN}/{MINI}
# podstawia build_fulldesign z copy.
FD_ART = {
    "demo": (
        "ART DIRECTION — DEMO / ANATOMY (hero product + callouts): the product is the clear HERO, prominently "
        "and fully visible so thin connector lines can reach the exact parts named by the callouts, on a warm, "
        "premium, un-busy background that suits the product (soft natural light; NEVER a flat clinical white "
        "studio, NEVER a dark scene). Follow the STUDIO HINT below for backdrop, props and mood. A big headline "
        "sits across a clean calm area at the top. 2-3 short callout labels, each connected by ONE thin elegant "
        "line/dot to the exact product part it names. A small cash-on-delivery trust pill and a clear CTA button "
        "anchored at the bottom. Everything integrated, premium, un-cluttered.\nSTUDIO HINT: {SCENE}"
    ),
    "problem": (
        "ART DIRECTION — PROBLEM / PRZED→PO (transformation, split-screen): a vertical 50/50 split. LEFT "
        "(PRZED): a desaturated, cool, tense documentary photo of the FRUSTRATION described in PROBLEM-SCENE — "
        "WITHOUT the product anywhere in frame. RIGHT (PO): a bright, warm photo of the RELIEF / RESULT "
        "described in SOLUTION-SCENE, WITH the product in natural real use. A crisp thin divider between the "
        "halves. A big transformation headline across the top. A muted 'PRZED' tag on the left, an accent 'PO' "
        "tag on the right. At the bottom: the real price block and a short CTA. Strong visual contrast between "
        "the two sides.\nPROBLEM-SCENE (LEFT half, NO product): {PAIN}\nSOLUTION-SCENE (RIGHT half, WITH product in use): {SCENE}"
    ),
    "lifestyle": (
        "ART DIRECTION — LIFESTYLE / UGC (organic post): an authentic phone-style photo in warm natural light "
        "in a real everyday setting — the product in genuine real-life use exactly as the SCENE below "
        "describes. It must look like a real customer's candid social post, NOT a studio ad: phone-style "
        "framing, slight imperfection, no stocky perfection. Minimal graphics: ONE small slightly-rotated "
        "hand-written sticker note with a curved arrow pointing at the product doing its job, {MINI}a small "
        "rounded 'za pobraniem' capsule in a corner{LOGO}. No banner bars, no big pills."
        "\nSCENE (compose exactly this): {SCENE}"
    ),
}
# USP-MOMENT (product-agnostic): KAŻDY kadr, w którym produkt jest UŻYWANY (scena DEMO/LIFESTYLE oraz
# połówka PO w PRZED/PO), MUSI złapać GŁÓWNY MECHANIZM/EFEKT produktu W AKCJI — inaczej reklama nie
# sprzedaje USP. Dołączane do briefu każdego kąta w build_fulldesign. Konkret AKCJI niesie scene_vision.
FD_USP_MOMENT = (
    "\n\nUSP-MOMENT (MANDATORY — the single most important thing wherever the product is shown in use: the "
    "DEMO and LIFESTYLE scenes and the PO half of a before/after): capture the product's core MECHANISM / "
    "BENEFIT IN ACTION exactly as the facts and the SCENE describe it — the product visibly DOING ITS JOB at "
    "the decisive moment of real use, so the payoff is unmistakable. BANNED: the product sitting unused as a "
    "passive prop, still in packaging, held up to the camera like a catalog shot, or a staged studio pose with "
    "no action. A viewer must understand in HALF A SECOND what the product does and why it helps."
)

# ── TRYB OSZCZĘDNY 1:1 (v10): przekompozycja gotowego finału 4:5 → kwadrat ────────────────────
# Model dostaje FINALNY baner 4:5 jako ref[0] (jedyne źródło layoutu/copy/stylu) + refy produktu
# (wierność). ZADANIE: ten sam baner przekomponowany do 1:1 — identyczny styl/copy/brand, układ
# dopasowany do kwadratu (nic nie ucięte). Napisy VERBATIM (diakrytyki w wersalikach).
SQUARE_RECOMPOSE = (
    "The FIRST reference image is a FINISHED 4:5 vertical advertising banner. RE-COMPOSE THE SAME "
    "ad into a 1:1 SQUARE canvas for a square feed placement. It must stay the SAME advertisement: "
    "identical art-direction, photography style, colors, brand identity, logo, product, pills, "
    "callouts/connector lines, CTA and — CRITICAL — the EXACT SAME Polish text, VERBATIM, "
    "character-for-character, with Polish diacritics PRESERVED EVEN IN UPPERCASE (Ó Ń Ś Ż Ź Ą Ę Ł "
    "Ć — never flatten). Do NOT translate, paraphrase, reorder, add or drop any word, letter, "
    "number or graphic element. Only ADAPT THE LAYOUT to the square: re-balance and re-flow the "
    "photo and the text blocks so the composition breathes in 1:1 and NOTHING is cropped, cut off "
    "or pushed off-canvas (use the wider/shorter square proportions sensibly — headline, pills and "
    "CTA fully inside safe margins). The remaining reference images show the REAL product — keep it "
    "1:1 faithful (same shape, colors, materials, on-product branding). Output a single finished, "
    "polished 1:1 square banner, feed-ready, maximum sharpness."
)


def _fd_txt(s):
    return re.sub(r"\[\[|\]\]", "", str(s or "")).strip()


def build_fulldesign(angle, ca, b, palette, cena, has_logo, has_styl, n_product=1, no_hook=False):
    """Zwraca (prompt, intended_texts). intended_texts = DOKŁADNE napisy PL do weryfikacji przez agenta.
    n_product = liczba kadrów produktu w image_urls (multi-ref: wygląd niesie N refów, nie słowo).
    no_hook=True (v8, --hook-variants): baner BEZ nagłówka — górna strefa hooka zostaje czystym
    negative-space (nagłówek dokładany później KODEM); reszta elementów bez zmian."""
    brand = b.get("brand_name") or ""
    paleta = b.get("paleta") or ""
    fonty = b.get("fonty") or ""
    hook = _fd_txt(ca.get("hook_baner") or ca.get("headline") or "").upper()
    parts = [FD_HEADER, _fd_product_para(n_product)]
    if no_hook:
        # logo tylko gdy marka MA logo — inaczej NIE wymuszaj (produkt bez brandu = bez wymyślonego znaku)
        logo_line = (" Put the brand LOGO in a BOTTOM corner (never at the top — the top band must stay empty)."
                     if has_logo else " Keep the top band empty; this product has NO brand logo — do NOT add any logo or wordmark.")
        parts.append(
            "\n\nHEADLINE ZONE EMPTY (variant base): leave the top ~22% headline band as CLEAN, EMPTY "
            "negative space with ABSOLUTELY NO headline text or sticker note there — a headline will be "
            "composited on top later." + logo_line + " Keep ALL OTHER elements exactly as described "
            "(callouts, trust pill, CTA button, price, PRZED/PO tags, connector lines, product and photography).")

    logo_ref = ("The reference image right after the %d product photos" % n_product) if n_product > 1 else "The SECOND reference image"
    brand_line = "\n\nBRAND: %s." % (brand or "(no name — neutral, consistent branding; do NOT invent a name)")
    if has_logo:
        brand_line += (" %s is the brand LOGO — place it 1:1 (do NOT redraw its shape, "
                       "letters or colors) in ONE corner at 8-12%% of frame height, never centered." % logo_ref)
    else:
        # produkt bez brandu (np. mata akupresury): NIE wymyślaj logo/wordmarku — czysty, bezmarkowy layout
        brand_line += " This product has NO brand logo — do NOT invent, draw or place any logo, wordmark or brand mark anywhere."
    if has_styl:
        brand_line += " The LAST reference image is the brand's visual STYLE-MASTER — keep mood and palette consistent with it."
    if paleta:
        brand_line += "\nBrand palette (use these colors): %s." % paleta
    if fonty:
        brand_line += "\nTypography vibe: %s (clean bold modern sans, Polish text)." % fonty
    parts.append(brand_line)
    # ART-DIRECTION per kąt — SUBIEKT/AKCJĘ niesie scene_vision/pain_vision z copy (per produkt),
    # NIE hardcode scenariusza (generalizacja v9: fabryka product-agnostic — lekcja Masażer 19.07).
    scene_v = _fd_txt(ca.get("scene_vision") or "")
    pain_v = _fd_txt(ca.get("pain_vision") or "")
    mini_v = _fd_txt(ca.get("mini_adnotacja") or "")
    art = FD_ART.get(angle, FD_ART["lifestyle"])
    art = art.replace("{SCENE}", scene_v or "(the product in natural, real everyday use — its core benefit visible)")
    art = art.replace("{PAIN}", pain_v or "(a candid moment of the everyday frustration this product solves — NO product in frame)")
    mini_hint = ("PLUS a second tiny hand-written annotation with a short arrow pointing at a key product detail, "
                 if (angle == "lifestyle" and mini_v) else "")
    art = art.replace("{MINI}", mini_hint)
    art = art.replace("{LOGO}", (", and the small brand logo" if has_logo else ""))   # bez logo = brak wzmianki
    parts.append("\n\n" + art)
    parts.append(FD_USP_MOMENT)                                    # mechanizm/efekt W AKCJI (product-agnostic)

    intended, lines = [], []

    def add(label, s):
        s = _fd_txt(s)
        if s:
            intended.append(s)
            lines.append('- %s: "%s"' % (label, s))

    if angle == "demo":
        if not no_hook:
            add("Big headline (top)", hook)
        callouts = [c for c in (ca.get("callouts_demo") or []) if _fd_txt(c)][:3]
        hints = ["→ point the connector line to the exact product part this label names"] * 3
        for i, c in enumerate(callouts):
            add("Callout label %d %s" % (i + 1, hints[i] if i < len(hints) else ""), _fd_txt(c).upper())
        add("Trust pill (bottom)", "PŁATNOŚĆ PRZY ODBIORZE")
        add("CTA button (bottom)", "ZAMÓW ZA POBRANIEM")
    elif angle == "problem":
        if not no_hook:
            add("Big transformation headline (top)", hook)
        add("Left tag (muted)", "PRZED")
        add("Right tag (accent)", "PO")
        if cena:
            add("Price (bottom-left, large)", cena)
            add("Under price (small)", "za pobraniem")
        add("CTA button (bottom-right)", "ZAMÓW")
    else:  # lifestyle
        if not no_hook:
            add("Hand-written sticker note (arrow pointing at the product in use)", hook)
        mini = _fd_txt(ca.get("mini_adnotacja") or "")
        if mini:
            add("Tiny second annotation (short arrow to a key product detail)", mini)
        add("Small capsule (corner)", "za pobraniem")

    parts.append(FD_TEXT_RULE + "\n".join(lines))
    parts.append(FD_HONESTY)
    parts.append("\n\nRender at maximum sharpness, aspect 4:5, feed-ready. Output a single finished banner image.")
    return "".join(parts), intended


def fulldesign_surgical_fix(out_dir, slug, angle, bad, good, state):
    """Chirurgiczny fix JEDNEGO napisu na gotowym banerze (nano-banana-pro/edit): zmień tylko '<bad>'
    → '<good>', nie ruszaj reszty. Rehost aktualnego finału + edit + zapis. Zwraca (path, added_usd)."""
    b_path = os.path.join(out_dir, "ad_%s_45.png" % angle)
    url = _fal().store(b_path, "adforge/%s/fdfix_in_%s.png" % (slug, angle))
    prompt = ("Fix ONLY the text \"%s\" so it reads exactly \"%s\" (Polish, keep diacritics Ó Ń Ś Ż Ź Ą Ę Ł Ć). "
              "Match the existing font, size, color, weight and position pixel-for-pixel. Do NOT change, move, "
              "restyle or re-render ANYTHING else in the image — no other text, product, colors or layout." % (bad, good))
    blob = gen_nbpro_one(prompt, [url], "fdfix_%s" % angle)
    final = to_45(_pil()[0].open(io.BytesIO(blob)).convert("RGB")).resize((FINAL_W, FINAL_H), _pil()[0].LANCZOS)
    final.save(b_path, "PNG")
    state.setdefault("fd_fixes", []).append({"angle": angle, "bad": bad, "good": good})
    log("fulldesign fix [%s]: '%s' → '%s' zapisany do %s" % (angle, bad, good, b_path))
    return b_path, NBPRO_USD


# ── MULTI-REF PRODUKTU + BRAMKA WIERNOŚCI (feedback Tomka 19.07: produkt „nieco inaczej niż faktycznie") ──
# Mechanizmy przeniesione z fabryki VIDEO (0i „edytuj prawdę", rubryka per-ELEMENT, klasa „morf produktu
# między scenami") i landingów (GRAFIKA-Z-MAKIETY §4b: LEPSZY REF, nie słowny opis cechy).
PRODUCT_REF_MAX = 3          # ile RÓŻNYCH kadrów produktu podać nbpro (packshot główny + wysunięta szuflada + akcja)


def _save_state(out_dir, state):
    try:
        io.open(os.path.join(out_dir, "adforge-state.json"), "w", encoding="utf-8").write(
            json.dumps(state, ensure_ascii=False, indent=1))
    except Exception as e:
        log("state zapis nieudany: %s" % e)


def _load_json_file(path):
    try:
        return json.loads(io.open(path, encoding="utf-8").read())
    except Exception:
        return None


def prep_fd_refs(bundle, out_dir, slug, refs_dir, logo_url, styl_url, state):
    """Pobierz + rehostuj (fal.store RAZ, cache w state.fal_refs) MULTI-REF produktu (2-4 RÓŻNE kadry
    z gallery_curated[keep]), logo-combo i styl-master. Zwraca dict URL-i fal + lokalnych packshotów.
    Kolejność image_urls generacji = product×N (packshot główny, wysunięta szuflada, akcja) → logo → styl."""
    os.makedirs(refs_dir, exist_ok=True)
    product_urls = [r["url"] for r in (bundle.get("refs") or [])][:PRODUCT_REF_MAX]
    product_local, product_fal = [], []
    for i, u in enumerate(product_urls):
        try:
            blob, ct = _download(u)
            pth = os.path.join(refs_dir, "packshot-%d.%s" % (i, _ct_ext(ct)))
            io.open(pth, "wb").write(blob)
            product_local.append(pth)
        except Exception as e:
            log("packshot %d pobranie nieudane: %s" % (i, e))
            continue
        try:
            fu = rehost_ref(pth, "adforge/%s/fd_prod%d.%s" % (slug, i, pth.rsplit(".", 1)[-1]), u, state)
            product_fal.append(fu)
        except Exception as e:
            log("packshot %d rehost nieudany: %s" % (i, e))
    logo_local = os.path.join(refs_dir, "logo-combo.png")
    logo_fal = rehost_ref(logo_local, "adforge/%s/fd_logo.png" % slug, logo_url, state) \
        if (logo_url and os.path.isfile(logo_local)) else None
    styl_local, styl_fal = None, None
    if styl_url:
        try:
            blob, ct = _download(styl_url)
            styl_local = os.path.join(refs_dir, "styl-master." + _ct_ext(ct))
            io.open(styl_local, "wb").write(blob)
            styl_fal = rehost_ref(styl_local, "adforge/%s/fd_styl.%s" % (slug, styl_local.rsplit(".", 1)[-1]), styl_url, state)
        except Exception as e:
            log("styl-master ref nieudany: %s" % e)
    _save_state(out_dir, state)
    log("MULTI-REF: %d kadrów produktu + logo=%s + styl=%s" %
        (len(product_fal), "TAK" if logo_fal else "NIE", "TAK" if styl_fal else "NIE"))
    return {"product_fal": product_fal, "product_local": product_local,
            "logo_fal": logo_fal, "styl_fal": styl_fal, "styl_local": styl_local}


def _fd_image_urls(refsd):
    return list(refsd["product_fal"]) + [u for u in (refsd["logo_fal"], refsd["styl_fal"]) if u]


# ── Kompozyty side-by-side (DOWODY WIERNOŚCI) — VLM (agent) porównuje 1:1, nie z pamięci (0i) ──
def _montage(cells, out_path, cell_w=560, gap=18, label_h=46):
    """cells = [(pil_img, label)]. Ułóż POZIOMO na kremowym tle, wspólna wysokość, podpis pod komórką."""
    Image, ImageDraw, ImageFont, _, _ = _pil()
    prepared = []
    for img, lab in cells:
        im = img.convert("RGB")
        w, h = im.size
        nh = max(1, int(round(h * cell_w / max(1, w))))
        prepared.append((im.resize((cell_w, nh), Image.LANCZOS), lab))
    body_h = max(im.size[1] for im, _ in prepared)
    n = len(prepared)
    W = n * cell_w + (n + 1) * gap
    H = body_h + label_h + 2 * gap
    canvas = Image.new("RGB", (W, H), (245, 241, 232))
    d = ImageDraw.Draw(canvas)
    try:
        f = ImageFont.truetype(FALLBACK_FONT, 26)
    except Exception:
        f = ImageFont.load_default()
    x = gap
    for im, lab in prepared:
        canvas.paste(im, (x, gap + (body_h - im.size[1]) // 2))
        d.text((x + cell_w // 2, gap + body_h + 8), lab, font=f, fill=(23, 19, 16), anchor="ma")
        x += cell_w + gap
    canvas.save(out_path, "PNG")
    return out_path


def build_fidelity_composite(product_local, creative_path, out_path, label):
    """DOWÓD WIERNOŚCI: realne packshoty | kreacja — do checklisty T/N per cecha."""
    Image = _pil()[0]
    cells = [(Image.open(p), "REALNY packshot %d" % i) for i, p in enumerate(product_local[:PRODUCT_REF_MAX])]
    cells.append((Image.open(creative_path), label))
    return _montage(cells, out_path)


def build_continuity_composite(product_local, finals, out_path):
    """DOWÓD CIĄGŁOŚCI: realny produkt | 3 finały obok siebie — czy to TEN SAM obiekt (geometria)."""
    Image = _pil()[0]
    cells = []
    if product_local:
        cells.append((Image.open(product_local[0]), "REALNY produkt"))
    for a, p in finals:
        if os.path.isfile(p):
            cells.append((Image.open(p), "kreacja %s" % a))
    return _montage(cells, out_path, cell_w=620)


def build_all_composites(out_dir, refsd, angles):
    """Zbuduj WIERNOSC-<angle>.png (finał) + per-kandydat + CIAGLOSC. Zwraca dict ścieżek."""
    dowody = os.path.join(out_dir, "dowody")
    os.makedirs(dowody, exist_ok=True)
    plocal = refsd["product_local"]
    paths = {}
    finals = []
    for a in angles:
        fin = os.path.join(out_dir, "ad_%s_45.png" % a)
        if os.path.isfile(fin):
            p = os.path.join(dowody, "WIERNOSC-%s.png" % a)
            build_fidelity_composite(plocal, fin, p, "kreacja %s (FINAŁ)" % a)
            paths[a] = p
            finals.append((a, fin))
        for c in range(BEST_OF):
            cf = os.path.join(out_dir, "ad_%s_45_c%d.png" % (a, c))
            if os.path.isfile(cf):
                build_fidelity_composite(plocal, cf, os.path.join(dowody, "WIERNOSC-%s-c%d.png" % (a, c)),
                                         "kandydat %s #c%d" % (a, c))
    if finals:
        paths["_ciaglosc"] = build_continuity_composite(plocal, finals, os.path.join(dowody, "WIERNOSC-CIAGLOSC.png"))
    return paths


def fidelity_surgical_fix(out_dir, slug, angle, cecha, product_fal, state):
    """Chirurgiczna korekta GEOMETRII produktu na gotowym banerze (nano-banana-pro/edit):
    baner = image[0], realne kadry produktu = kolejne refy; napraw TYLKO <cecha> (litery nietknięte)."""
    b_path = os.path.join(out_dir, "ad_%s_45.png" % angle)
    banner_fal = _fal().store(b_path, "adforge/%s/fidfix_in_%s.png" % (slug, angle))
    image_urls = [banner_fal] + list(product_fal or [])
    prompt = ("The FIRST image is a finished ad banner; the following images show the REAL product from "
              "different angles. Make the product match the reference images exactly: fix %s. Keep the exact "
              "same layout, background, subject/person, logo and ALL text/letters pixel-identical — change "
              "ONLY the product so its geometry matches the real references. Do not change anything else." % cecha)
    blob = gen_nbpro_one(prompt, image_urls, "fidfix_%s" % angle)
    Image = _pil()[0]
    final = to_45(Image.open(io.BytesIO(blob)).convert("RGB")).resize((FINAL_W, FINAL_H), Image.LANCZOS)
    final.save(b_path, "PNG")
    state.setdefault("fidelity_fixes", []).append({"angle": angle, "cecha": cecha})
    log("fidelity fix [%s]: '%s' → %s" % (angle, cecha, b_path))
    return b_path, NBPRO_USD


def regen_fd_angle(out_dir, slug, angle, ca, b, palette, cena, refsd, state):
    """Pełna REGENERACJA jednego kąta best-of-2 na MULTI-REF (świeży katalog — bez resume starych)."""
    Image = _pil()[0]
    image_urls = _fd_image_urls(refsd)
    n_prod = len(refsd["product_fal"])
    prompt, _intended = build_fulldesign(angle, ca, b, palette, cena, bool(refsd["logo_fal"]), bool(refsd["styl_fal"]), n_prod)
    n = state.get("regen_count", 0) + 1
    state["regen_count"] = n
    regen_dir = os.path.join(out_dir, "regen", "%s_%d" % (angle, n))
    jobs = [{"tag": "%s_r%d" % (angle, c), "model": NBPRO_EDIT, "image_urls": image_urls, "prompt": prompt}
            for c in range(BEST_OF)]
    got = gen_nbpro_batch(jobs, regen_dir)
    cand = [got.get("%s_r%d" % (angle, c)) for c in range(BEST_OF)]
    cand = [p for p in cand if p and os.path.isfile(p)]
    if not cand:
        raise SystemExit("regen %s: brak kandydatów (reclaim: fal.py reclaim %s)" % (angle, regen_dir))
    finals = [to_45(Image.open(p).convert("RGB")).resize((FINAL_W, FINAL_H), Image.LANCZOS) for p in cand]
    for c, f in enumerate(finals):
        f.save(os.path.join(out_dir, "ad_%s_45_c%d.png" % (angle, c)), "PNG")
    best_i, _ = pick_best_candidate(finals, (0.0, 0.0, 1.0, 1.0))
    finals[best_i].save(os.path.join(out_dir, "ad_%s_45.png" % angle), "PNG")
    state.setdefault("regens", []).append({"angle": angle, "run": n})
    log("REGEN [%s] best-of-%d → provizorycznie #%d" % (angle, len(finals), best_i))
    return NBPRO_USD * len(cand)


# ══════════════════════════════════════════════════════════════════════════════
# FORMAT 1:1 (KWADRAT) — tryb OSZCZĘDNY: przekompozycja gotowego finału 4:5 → 1:1.
# Model dostaje ad_<kąt>_45.png jako ref[0] (layout/copy/styl) + refy produktu (wierność) i
# przekomponowuje TEN SAM design do kwadratu (1 kandydat). Bramkę LITER (litera-po-literze) +
# szybką wierność robi AGENT na kompozycie KWADRAT-<kąt>.png. FAIL → --gen-11 (retry oszczędny)
# albo --regen-11 (pełna generacja kwadratu build_fulldesign z aspect 1:1).
# ══════════════════════════════════════════════════════════════════════════════
def _square_final(blob):
    """Bytes → RGB SQ_W×SQ_H (defensywny crop 1:1 + resize)."""
    Image = _pil()[0]
    return to_11(Image.open(io.BytesIO(blob)).convert("RGB"))


def gen_square_economy(out_dir, slug, angle, refsd, state, attempt=0):
    """OSZCZĘDNY 1:1: finał 4:5 jako ref[0] + do 2 refów produktu → przekompozycja do kwadratu
    (1 kandydat). Zapisuje ad_<kąt>_11.png. Zwraca koszt (NBPRO_USD)."""
    b45 = os.path.join(out_dir, "ad_%s_45.png" % angle)
    if not os.path.isfile(b45):
        raise SystemExit("kwadrat %s: brak finału 4:5 %s (wygeneruj/finalizuj 4:5 najpierw)" % (angle, b45))
    seed_url = _fal().store(b45, "adforge/%s/sq_seed_%s_%d.png" % (slug, angle, attempt))
    image_urls = [seed_url] + list(refsd.get("product_fal") or [])[:2]
    tag = "%s__sq_%s%s" % (slug, angle, ("_r%d" % attempt) if attempt else "")   # slug-namespace (ledger)
    blob = gen_nbpro_one(SQUARE_RECOMPOSE, image_urls, tag, aspect_ratio="1:1")
    _square_final(blob).save(os.path.join(out_dir, "ad_%s_11.png" % angle), "PNG")
    state.setdefault("squares", {})[angle] = {"mode": "economy", "attempt": attempt}
    log("KWADRAT [%s] oszczędny (przekompozycja 4:5 → 1:1, próba %d) → ad_%s_11.png" % (angle, attempt, angle))
    return NBPRO_USD


def _square_prompt_full(p):
    """Zamienia zamknięcie briefu full-design 4:5 na 1:1 (fallback pełnej generacji kwadratu)."""
    p = p.replace("4:5 vertical ad banner", "1:1 square ad banner")
    p = p.replace("aspect 4:5", "aspect 1:1 (square)")
    return p


def gen_square_full(out_dir, slug, angle, ca, b, palette, cena, refsd, state):
    """FALLBACK 1:1: pełna generacja kwadratu (build_fulldesign, aspect 1:1) — bez seeda 4:5,
    gdy oszczędny psuje litery/układ. 1 kandydat. Zapisuje ad_<kąt>_11.png. Zwraca koszt."""
    image_urls = _fd_image_urls(refsd)
    n_prod = len(refsd["product_fal"])
    prompt, _intended = build_fulldesign(angle, ca, b, palette, cena, bool(refsd["logo_fal"]),
                                         bool(refsd["styl_fal"]), n_prod)
    blob = gen_nbpro_one(_square_prompt_full(prompt), image_urls, "%s__sqfull_%s" % (slug, angle), aspect_ratio="1:1")
    _square_final(blob).save(os.path.join(out_dir, "ad_%s_11.png" % angle), "PNG")
    state.setdefault("squares", {})[angle] = {"mode": "full"}
    log("KWADRAT [%s] PEŁNA generacja (aspect 1:1) → ad_%s_11.png" % (angle, angle))
    return NBPRO_USD


def build_square_composite(out_dir, refsd, angle):
    """DOWÓD KWADRATU: finał 4:5 | finał 1:1 (+ realny packshot) — agent porównuje litery/układ/wierność."""
    Image = _pil()[0]
    dowody = os.path.join(out_dir, "dowody"); os.makedirs(dowody, exist_ok=True)
    b45 = os.path.join(out_dir, "ad_%s_45.png" % angle)
    b11 = os.path.join(out_dir, "ad_%s_11.png" % angle)
    if not (os.path.isfile(b45) and os.path.isfile(b11)):
        return None
    cells = [(Image.open(b45), "4:5 (źródło) %s" % angle), (Image.open(b11), "1:1 (kwadrat) %s" % angle)]
    plocal = (refsd or {}).get("product_local") or []
    if plocal and os.path.isfile(plocal[0]):
        cells.append((Image.open(plocal[0]), "REALNY produkt"))
    out_path = os.path.join(dowody, "KWADRAT-%s.png" % angle)
    return _montage(cells, out_path, cell_w=560)


def ensure_squares(out_dir, slug, angles, formats, gen_list, full_list, copy, b, palette, cena, refsd, state):
    """Dogeneruj kwadraty 1:1 dla kątów wg formatów. Reguła: --regen-11 = pełna generacja;
    --gen-11 lub brak pliku ad_<kąt>_11.png = oszczędny (przekompozycja 4:5). Buduje kompozyty
    KWADRAT-<kąt>.png do oceny agenta. Zwraca (added_usd, sq_angles)."""
    if "11" not in formats:
        return 0.0, []
    added, done = 0.0, []
    for a in angles:
        sq_path = os.path.join(out_dir, "ad_%s_11.png" % a)
        ca = copy.get(a) or {}
        if a in full_list:
            added += gen_square_full(out_dir, slug, a, ca, b, palette, cena, refsd, state)
            done.append(a)
        elif a in gen_list or not os.path.isfile(sq_path):
            added += gen_square_economy(out_dir, slug, a, refsd, state)
            done.append(a)
        try:
            build_square_composite(out_dir, refsd, a)
        except Exception as e:
            log("kwadrat %s: kompozyt nieudany: %s" % (a, e))
    _save_state(out_dir, state)
    return added, done


def do_fulldesign(args, bundle, out_dir, slug, b, palette, copy, angles, logo_url, styl_url, refs_dir, state):
    """ETAP FULL-DESIGN (multi-ref): rehost 2-4 kadrów produktu + logo + styl → best-of-2 per kąt →
    provizoryczny wybór (ostrość; BRAMKĘ WIERNOŚCI robi agent na kompozytach) → dowody + state.
    Zwraca (creatives, total_usd, refsd)."""
    Image = _pil()[0]
    log("FULL-DESIGN: rehost MULTI-REF przez fal.store…")
    refsd = prep_fd_refs(bundle, out_dir, slug, refs_dir, logo_url, styl_url, state)
    if not refsd["product_fal"]:
        raise SystemExit("full-design: brak żadnego rehostowanego kadru produktu — przerwano.")
    cena = clean_price(bundle.get("cena_pl"))
    image_urls = _fd_image_urls(refsd)
    n_prod = len(refsd["product_fal"])
    fd_dir = os.path.join(out_dir, "fulldesign")
    ftag = lambda a, c: "%s__%s_c%d" % (slug, a, c)      # slug-namespace (spójnie z portfelem/hook-wariantami)
    intended_by_angle, jobs = {}, []
    print("-" * 88)
    print("FULL-DESIGN PROMPTY + DOKŁADNE NAPISY (bramka tekstu) · MULTI-REF produktu = %d kadry:" % n_prod)
    for a in angles:
        ca = copy.get(a) or {}
        prompt, intended = build_fulldesign(a, ca, b, palette, cena, bool(refsd["logo_fal"]), bool(refsd["styl_fal"]), n_prod)
        intended_by_angle[a] = intended
        print("  ── KĄT %s ── napisy do wyrenderowania: %s" % (a.upper(), intended))
        for c in range(BEST_OF):
            jobs.append({"tag": ftag(a, c), "model": NBPRO_EDIT, "image_urls": image_urls, "prompt": prompt})
    _t0 = time.time()
    got = gen_nbpro_batch(jobs, fd_dir)
    state.setdefault("timings", {})["fulldesign_wall_s"] = round(time.time() - _t0, 1)   # czas ściany etapu generacji
    total_usd = NBPRO_USD * len(jobs)

    creatives = []
    cand_by_angle = {}
    for a in angles:
        ca = copy.get(a) or {}
        cand_paths = [got.get(ftag(a, c)) for c in range(BEST_OF)]
        cand_paths = [pp for pp in cand_paths if pp and os.path.isfile(pp)]
        if not cand_paths:
            raise SystemExit("full-design: brak kandydatów dla %s (reclaim: fal.py reclaim %s)" % (a, fd_dir))
        finals = [to_45(Image.open(pp).convert("RGB")).resize((FINAL_W, FINAL_H), Image.LANCZOS) for pp in cand_paths]
        best_i, scores = pick_best_candidate(finals, (0.0, 0.0, 1.0, 1.0))
        cand_files = []
        for c, f in enumerate(finals):
            cf = os.path.join(out_dir, "ad_%s_45_c%d.png" % (a, c))
            f.save(cf, "PNG")
            cand_files.append(cf)
        out_path = os.path.join(out_dir, "ad_%s_45.png" % a)
        finals[best_i].save(out_path, "PNG")                       # provizoryczne (agent zweryfikuje wierność+tekst)
        cand_by_angle[a] = cand_files
        log("  [%s] best-of-%d → provizorycznie #%d (ostrość); kandydaci: %s" %
            (a, len(finals), best_i, [os.path.basename(x) for x in cand_files]))
        creatives.append({"angle": a, "path": out_path,
                          "headline": (ca.get("hook_baner") or ca.get("headline") or ""),
                          "primary_text": ca.get("primary_text") or ""})

    state["mode"] = "fulldesign"
    state["fd_intended"] = intended_by_angle
    state["fd_candidates"] = {a: [os.path.basename(x) for x in v] for a, v in cand_by_angle.items()}
    state["fd_provisional"] = {a: True for a in angles}
    state["engine"] = "nbpro"
    state["total_usd"] = round(total_usd, 4)
    merged_copy = dict((state.get("copy") or {}))
    for a in angles:
        merged_copy[a] = copy.get(a) or {}
    state["copy"] = merged_copy
    _save_state(out_dir, state)
    return creatives, total_usd, refsd


def _parse_formats(s):
    """'45,11' → ['45','11'] (whitelist, kolejność zachowana); puste → DEFAULT_FORMATS."""
    out = []
    for f in str(s or "").split(","):
        f = f.strip()
        if f in ALLOWED_FORMATS and f not in out:
            out.append(f)
    return out or list(DEFAULT_FORMATS)


def _parse_angle_list(s, allowed):
    """'demo,problem' / 'all' → lista kątów (przecięcie z allowed); puste → []."""
    s = str(s or "").strip().lower()
    if not s:
        return []
    if s == "all":
        return list(allowed)
    return [a.strip() for a in s.split(",") if a.strip() in allowed]


def do_fd_postgen(args, bundle, out_dir, slug, b, palette, logo_img, angles, logo_url, styl_url, refs_dir):
    """BRAMKA WIERNOŚCI po generacji: --pick / --regen / --fix / --finalize (publikacja MERGE).
    Wznawia ze stanu (adforge-state.json); refy rehostowane RAZ (cache) → operacje ~$0 poza generacją."""
    state_path = os.path.join(out_dir, "adforge-state.json")
    if not os.path.isfile(state_path):
        raise SystemExit("--finalize/--fix/--regen/--pick: brak %s — uruchom generację najpierw." % state_path)
    state = json.loads(io.open(state_path, encoding="utf-8").read())
    copy = state.get("copy") or {}
    if not copy:
        raise SystemExit("state bez copy — uruchom pełną generację.")
    cena = clean_price(bundle.get("cena_pl"))
    refsd = prep_fd_refs(bundle, out_dir, slug, refs_dir, logo_url, styl_url, state)  # cache → ~$0
    added = 0.0

    # 1) --pick ANGLE=cN : wybierz kandydata jako finał
    for spec in (args.pick or []):
        for token in spec.split(","):
            if "=" not in token:
                continue
            a, csel = token.split("=", 1)
            a, csel = a.strip(), csel.strip().lstrip("c")
            src = os.path.join(out_dir, "ad_%s_45_c%s.png" % (a, csel))
            if not os.path.isfile(src):
                raise SystemExit("--pick: brak kandydata %s" % src)
            shutil.copyfile(src, os.path.join(out_dir, "ad_%s_45.png" % a))
            state.setdefault("fd_picks", {})[a] = "c%s" % csel
            log("PICK [%s] ← kandydat c%s" % (a, csel))

    # 2) --regen ANGLES : pełna regeneracja best-of-2 (multi-ref)
    regen_angles = []
    for spec in (args.regen or "").split(","):
        s = spec.strip().lower()
        if s in ALLOWED_ANGLES:
            regen_angles.append(s)
    for a in regen_angles:
        added += regen_fd_angle(out_dir, slug, a, copy.get(a) or {}, b, palette, cena, refsd, state)

    # 3) --fix ANGLE=cecha : chirurgiczna korekta geometrii produktu
    for spec in (args.fix or []):
        if "=" not in spec:
            raise SystemExit("--fix wymaga formatu ANGLE=opis-cechy (np. lifestyle=prostokątny schowek przy krawędzi)")
        a, cecha = spec.split("=", 1)
        a, cecha = a.strip().lower(), cecha.strip()
        if a not in ALLOWED_ANGLES:
            raise SystemExit("--fix: nieznany kąt %s" % a)
        _p, cost = fidelity_surgical_fix(out_dir, slug, a, cecha, refsd["product_fal"], state)
        added += cost

    # 4) FORMAT 1:1 (KWADRAT) — dogeneruj z gotowych finałów 4:5 (tryb oszczędny; pełny = --regen-11)
    formats = _parse_formats(args.formats)
    gen11 = _parse_angle_list(args.gen_11, angles)
    full11 = _parse_angle_list(args.regen_11, angles)
    square_usd = 0.0
    if "11" in formats:
        square_usd, sq_done = ensure_squares(out_dir, slug, angles, formats, gen11, full11,
                                             copy, b, palette, cena, refsd, state)
        added += square_usd
        if sq_done:
            log("KWADRATY 1:1 dogenerowane dla: %s" % ", ".join(sq_done))

    total_usd = round(state.get("total_usd", 0.0) + added, 4)
    state["total_usd"] = total_usd

    # KARTA + werdykty (opcjonalne pliki agenta) → state + stdout
    karta = _load_json_file(args.karta or os.path.join(out_dir, "KARTA.json"))
    if karta:
        state["karta"] = karta
    verdicts = _load_json_file(args.verdicts or os.path.join(out_dir, "VERDICTS.json"))
    if verdicts:
        state["fidelity_verdicts"] = verdicts
    klik = _load_json_file(args.klik or os.path.join(out_dir, "KLIK.json"))
    if klik:
        state["klik_verdicts"] = klik

    # przebuduj wszystkie dowody (finały + kandydaci + ciągłość)
    comp = build_all_composites(out_dir, refsd, angles)
    _save_state(out_dir, state)

    print("-" * 88)
    print("BRAMKA WIERNOŚCI — DOWODY (obejrzyj przed publikacją):")
    for a in angles:
        if a in comp:
            print("  • %-10s %s" % (a, comp[a]))
    if "_ciaglosc" in comp:
        print("  • CIĄGŁOŚĆ   %s" % comp["_ciaglosc"])
    # DOWODY KWADRATU (4:5 | 1:1) — bramka LITER/wierności robi agent (litera-po-literze)
    if "11" in formats:
        print("-" * 88)
        print("BRAMKA KWADRATU 1:1 — DOWODY (4:5 źródło | 1:1 kwadrat; sprawdź litery i układ):")
        for a in angles:
            kp = os.path.join(out_dir, "dowody", "KWADRAT-%s.png" % a)
            b11 = os.path.join(out_dir, "ad_%s_11.png" % a)
            if os.path.isfile(kp):
                intended = (state.get("fd_intended") or {}).get(a) or []
                print("  • %-10s %s" % (a, kp))
                if intended:
                    print("      napisy VERBATIM do sprawdzenia: %s" % intended)
            elif os.path.isfile(b11):
                print("  • %-10s ad_%s_11.png (bez kompozytu)" % (a, a))

    print("-" * 88)
    print_click_gate(angles, state.get("klik_verdicts"))
    if state.get("karta"):
        print("KARTA PRODUKTU (%s): %d cech" % (state["karta"].get("produkt", "?"), len(state["karta"].get("cechy", []))))
    if added > 0:
        print("Koszt operacji tej rundy: ~$%.2f (fixy/regeny/kwadraty)" % added)

    if not args.finalize:
        print("-" * 88)
        print("[--finalize pominięte] Nie publikuję. Po weryfikacji (litery+wierność kwadratu) uruchom z --finalize.")
        print("out=%s" % out_dir)
        return 0

    creatives = [{"angle": a, "path": os.path.join(out_dir, "ad_%s_45.png" % a),
                  "headline": ((copy.get(a) or {}).get("hook_baner") or (copy.get(a) or {}).get("headline") or ""),
                  "primary_text": (copy.get(a) or {}).get("primary_text") or ""} for a in angles]
    rc = finish(args, bundle, "nbpro", out_dir, creatives, total_usd, mode="fulldesign-finalize",
                regions_by_angle={}, state=state, run_finisher_pass=False,
                formats=formats, square_usd=square_usd)
    if args.finalne_dir:
        try:
            sync_finalne(out_dir, args.finalne_dir, angles, {}, None)
        except Exception as e:
            log("czysty folder (finalne) sync nieudany: %s" % e)
    return rc


# ══════════════════════════════════════════════════════════════════════════════
# ORKIESTRACJA.
# ══════════════════════════════════════════════════════════════════════════════
def do_recompose(args, bundle, out_dir, palette, logo_img, angles):
    """Rekompozycja z zapisanych surowych scen (out/sceny/) — crop/kompozycja/publikacja, $0
    (płatnej generacji obrazów). Copy-call ODŚWIEŻANY (nowe pola hook_baner/callouts — grosze)."""
    b = bundle["branding"]
    sceny = os.path.join(out_dir, "sceny")
    state_path = os.path.join(out_dir, "adforge-state.json")
    if not os.path.isdir(sceny):
        raise SystemExit("--recompose: brak katalogu %s — uruchom pełną generację raz (sceny nie zapisane)." % sceny)
    state = {}
    if os.path.isfile(state_path):
        try:
            state = json.loads(io.open(state_path, encoding="utf-8").read())
        except Exception:
            state = {}
    engine = state.get("engine", args.engine)
    print("-" * 88)
    log("RECOMPOSE z %s (engine=%s) — kąty=%s" % (sceny, engine, angles))
    # copy: użyj zapisanego, jeśli ma już nowe pola (hook_baner); inaczej świeży copy-call (grosze)
    saved = state.get("copy") or {}
    need_fresh = any(not (saved.get(a) or {}).get("hook_baner") for a in angles)
    if need_fresh:
        log("Copy-call (brak hook_baner w zapisie — odświeżam)…")
        copy, _ = call_copy(bundle, angles)
        merged_copy = dict(saved)
        for a in angles:
            merged_copy[a] = copy.get(a) or {}
        try:
            io.open(state_path, "w", encoding="utf-8").write(json.dumps(
                {"engine": engine, "quality": state.get("quality", args.quality), "copy": merged_copy},
                ensure_ascii=False, indent=1))
        except Exception:
            pass
    else:
        copy = saved
        log("Copy z zapisu (hook_baner/callouts obecne) — bez copy-calla ($0)")
    # załaduj WSZYSTKIE zapisane sceny (demo pożycza problem_fakt/lifestyle_ugc)
    scene_imgs = {}
    for f in sorted(os.listdir(sceny)):
        mm = re.match(r"^scene_([a-z]+)_([a-z]+)\.(png|webp|jpg|jpeg|avif)$", f, re.I)
        if not mm:
            continue
        blob = io.open(os.path.join(sceny, f), "rb").read()
        scene_imgs[(mm.group(1).lower(), mm.group(2).lower())] = scene_to_final(blob, engine)
        log("  scena %s/%s ← %s" % (mm.group(1), mm.group(2), f))
    # weryfikacja wymaganych scen per kąt (demo pożycza dowolną scenę w użyciu)
    for a in angles:
        if a == "demo":
            if not any(k in scene_imgs for k in (("problem", "fakt"), ("lifestyle", "ugc"), ("demo", "hero"))):
                raise SystemExit("--recompose: demo wymaga jakiejkolwiek sceny w użyciu (problem_fakt/lifestyle_ugc/demo_hero) — brak w %s." % sceny)
        else:
            for kind, _ang in scenes_for_angle(a):
                if (a, kind) not in scene_imgs:
                    raise SystemExit("--recompose: brak sceny scene_%s_%s.* w %s (wygeneruj kąt '%s' raz)." % (a, kind, sceny, a))
    creatives, regions_by_angle = compose_all(angles, copy, scene_imgs, out_dir, b["brand_name"],
                                              logo_img, palette, bundle.get("cena_pl"))
    # RECOMPOSE = $0 (bez płatnej generacji); finisher pominięty (naliczałby fal). Użyj pełnego runu.
    return finish(args, bundle, engine, out_dir, creatives, 0.0, mode="recompose",
                  regions_by_angle=regions_by_angle, state=state, run_finisher_pass=False)


# ══════════════════════════════════════════════════════════════════════════════
# v8 — RÓWNOLEGŁOŚĆ / RECLAIM / BRAMKI ZBIORCZE / HOOK-WARIANTY / A/B SILNIKÓW / PORTFEL.
# ══════════════════════════════════════════════════════════════════════════════
def _reclaim_paid(staging_dir, expected_tags, project="adforge"):
    """RECLAIM (pkt 4): przed generacją POLLUJ opłacone joby z ledgera (response_url) i dociągnij do
    staging_dir pod nazwą zgodną z RESUME (<job_tag>.png) — zamiast re-submitować po padzie sesji.
    SCOPE = expected_tags (tylko joby tego przebiegu; unikamy footguna „ściąga wszystkie projekty")."""
    fal = _fal()
    try:
        led = json.loads(io.open(fal.LEDGER, encoding="utf-8").read())
    except Exception as e:
        log("reclaim: brak/uszkodzony ledger (%s) — pomijam" % e)
        return []
    os.makedirs(staging_dir, exist_ok=True)
    want = {project + "_" + t: t for t in expected_tags}       # ledger_tag → job_tag
    got = []
    for c in reversed(led.get("calls", [])):                    # najnowszy submit danego tagu wygrywa
        tag = str(c.get("tag") or "")
        if tag not in want:
            continue
        job_tag, ru = want[tag], c.get("response_url")
        base = os.path.join(staging_dir, job_tag)
        if any(os.path.exists(base + e) for e in (".png", ".failed", ".timeout")):
            want.pop(tag, None); continue                       # już mamy — RESUME to podniesie
        if not ru:
            continue
        try:
            res = fal._post({"op": "poll", "url": ru})
        except Exception:
            continue                                            # niegotowy / błąd — pominie, batch dogeneruje
        url, _ext = fal._extract_url_ext(res)
        if url:
            try:
                fal.download(url, base + ".png"); got.append(job_tag); want.pop(tag, None)
                log("reclaim: dociągnięto OPŁACONY %s.png (bez re-submitu)" % job_tag)
            except Exception:
                pass
    log("RECLAIM: %s" % ("dociągnięto %d opłaconych jobów" % len(got) if got
                         else "brak opłaconych-niepobranych jobów (nic do dociągnięcia)"))
    return got


def _grid_montage(rows, out_path, cell_w=380, gap=14, label_h=34):
    """Siatka kompozytów (BRAMKI ZBIORCZE, pkt 3). rows = lista wierszy; wiersz = lista (pil_img, label).
    Kremowe tło, kolumny wyrównane do cell_w, podpis pod komórką."""
    Image, ImageDraw, ImageFont, _, _ = _pil()
    try:
        f = ImageFont.truetype(FALLBACK_FONT, 20)
    except Exception:
        f = ImageFont.load_default()
    prep = []
    for row in rows:
        prow = []
        for img, lab in row:
            im = img.convert("RGB"); w, h = im.size
            nh = max(1, int(round(h * cell_w / max(1, w))))
            prow.append((im.resize((cell_w, nh), Image.LANCZOS), lab))
        if prow:
            prep.append(prow)
    if not prep:
        return None
    ncol = max(len(r) for r in prep)
    row_h = [max(im.size[1] for im, _ in r) for r in prep]
    W = ncol * cell_w + (ncol + 1) * gap
    H = sum(row_h) + len(prep) * (label_h + gap) + gap
    canvas = Image.new("RGB", (W, H), (245, 241, 232))
    d = ImageDraw.Draw(canvas)
    y = gap
    for ri, row in enumerate(prep):
        x = gap
        for im, lab in row:
            canvas.paste(im, (x, y + (row_h[ri] - im.size[1]) // 2))
            d.text((x + cell_w // 2, y + row_h[ri] + 4), str(lab)[:46], font=f, fill=(23, 19, 16), anchor="ma")
            x += cell_w + gap
        y += row_h[ri] + label_h + gap
    canvas.save(out_path, "PNG")
    return out_path


def build_gate_sheet(out_dir, product_locals, angles, sheet_name="ARKUSZ-BRAMEK.png", extra_rows=None):
    """JEDEN arkusz bramek (pkt 3): wiersz/kąt = [packshot | c0 | c1 | FINAŁ] + opcjonalne wiersze
    wariantów hooków. Ocena całości w 1-2 podejściach vision. Zwraca ścieżkę albo None."""
    Image = _pil()[0]
    dowody = os.path.join(out_dir, "dowody"); os.makedirs(dowody, exist_ok=True)
    packshot = product_locals[0] if product_locals else None
    rows = []
    for a in angles:
        row = []
        if packshot and os.path.isfile(packshot):
            row.append((Image.open(packshot), "REF %s" % a))
        for c in range(BEST_OF):
            cf = os.path.join(out_dir, "ad_%s_45_c%d.png" % (a, c))
            if os.path.isfile(cf):
                row.append((Image.open(cf), "%s c%d" % (a, c)))
        fin = os.path.join(out_dir, "ad_%s_45.png" % a)
        if os.path.isfile(fin):
            row.append((Image.open(fin), "%s FINAŁ" % a))
        if row:
            rows.append(row)
    for r in (extra_rows or []):
        if r:
            rows.append(r)
    if not rows:
        return None
    return _grid_montage(rows, os.path.join(dowody, sheet_name))


def overlay_hook_variant(base_path, text, font_path, palette, out_path):
    """WARIANT HOOKA ~$0 (pkt 5): nakłada nagłówek KODEM na bazę „bez nagłówka" (górny scrim + render_hook
    z fontem marki, tracking/interlinia/cień jak w kompozycjach). Zwraca out_path."""
    Image = _pil()[0]
    canvas = Image.open(base_path).convert("RGBA")
    W, H = canvas.size
    S = W / 1080.0
    px = lambda v: max(1, int(round(v * S)))
    m = int(W * 0.06)
    scrim_h = int(H * 0.20)
    draw_scrim(canvas, (0, 0, W, scrim_h), 205, 120)
    hy = int(H * 0.03)
    render_hook(canvas, (m, hy), _fd_txt(text).upper(), font_path, int(W * 0.88),
                scrim_h - hy - px(6), CREAM, _hook_accent(palette),
                hi=px(86), lo=px(44), max_lines=2, leading=1.04, canvas_h=H)
    apply_grain(canvas)
    canvas.convert("RGB").save(out_path, "PNG")
    return out_path


def build_ab_composite(product_locals, nbpro_final, nb2_final, out_path):
    """A/B SILNIKÓW (pkt 6): realny produkt | nbpro | nb2 obok siebie z podpisami model+cena."""
    Image = _pil()[0]
    cells = []
    if product_locals and os.path.isfile(product_locals[0]):
        cells.append((Image.open(product_locals[0]), "REALNY produkt (ref)"))
    if nbpro_final and os.path.isfile(nbpro_final):
        cells.append((Image.open(nbpro_final), "nano-banana-pro  ~$0.225/obraz"))
    if nb2_final and os.path.isfile(nb2_final):
        cells.append((Image.open(nb2_final), "nano-banana-2  ~$0.10/obraz"))
    if len(cells) < 2:
        return None
    return _montage(cells, out_path, cell_w=640)


def publish_hook_variants(bundle, out_dir, hook_files, added_usd):
    """Publikuje warianty hooków jako DODATKOWE artefakty (label 'AD <angle> hook N'); blob
    ads_creatives BEZ zmian (nie przez creative_upsert). Koszt fal → wf2_costs. Idempotentne."""
    ps = _load_module("panel_sync", "panel-sync.py")
    p = bundle["product"]; project = p["project_id"]; product_id = p["id"]
    slug = str(p.get("slug") or product_id)
    total = 0
    for a, hf in hook_files.items():
        for v in hf["variants"]:
            dest = "bud-assets/%s/ads/ad_%s_45_h%d.png" % (slug, a, v["idx"])
            pub = ps.storage_upload(v["file"], dest, bucket="attachments", upsert=True)
            ps.artifact_add(project, product_id, "agr_generacja", "ad_creative", pub,
                            label="AD %s hook %d" % (a, v["idx"]),
                            meta={"angle": a, "format": "45", "hook_variant": v["idx"], "hook_text": v["text"]})
            log("opublikowano wariant %s h%d → %s" % (a, v["idx"], pub))
            total += 1
    if added_usd > 0:
        # note STABILNY (bez licznika) → cost_add idempotentny między gen a osobnym --finalize
        ps.cost_add(project, product_id, round(added_usd, 4), kind="fal", step="agr_generacja",
                    stage=5, note="ad-forge hook-variants+A/B")
    log("hook-variants: opublikowano %d artefaktów (blob ads_creatives BEZ zmian; koszt ~$%.2f)" % (total, added_usd))


def sync_finalne(out_dir, finalne_dir, angles, hook_files, ab_path):
    """Aktualizuje czysty folder: finały + dowód wierności + warianty hooków + A/B + arkusz bramek."""
    os.makedirs(finalne_dir, exist_ok=True)
    names = {"demo": "1-demo-callouty", "problem": "2-problem-przed-po", "lifestyle": "3-lifestyle-candid"}
    for a in angles:
        fin = os.path.join(out_dir, "ad_%s_45.png" % a)
        if os.path.isfile(fin):
            shutil.copyfile(fin, os.path.join(finalne_dir, "%s.png" % names.get(a, a)))
        sq = os.path.join(out_dir, "ad_%s_11.png" % a)                 # KWADRAT 1:1 (v10)
        if os.path.isfile(sq):
            shutil.copyfile(sq, os.path.join(finalne_dir, "%s-1x1.png" % names.get(a, a)))
    cont = os.path.join(out_dir, "dowody", "WIERNOSC-CIAGLOSC.png")
    if os.path.isfile(cont):
        shutil.copyfile(cont, os.path.join(finalne_dir, "0-DOWOD-WIERNOSCI.png"))
    if hook_files:
        hv = os.path.join(finalne_dir, "warianty-hookow"); os.makedirs(hv, exist_ok=True)
        for a, hf in hook_files.items():
            for v in hf["variants"]:
                if os.path.isfile(v["file"]):
                    shutil.copyfile(v["file"], os.path.join(hv, "%s-h%d.png" % (a, v["idx"])))
    if ab_path and os.path.isfile(ab_path):
        shutil.copyfile(ab_path, os.path.join(finalne_dir, "AB-SILNIKI-nbpro-vs-nb2.png"))
    sheet = os.path.join(out_dir, "dowody", "ARKUSZ-BRAMEK.png")
    if os.path.isfile(sheet):
        shutil.copyfile(sheet, os.path.join(finalne_dir, "ARKUSZ-BRAMEK.png"))
    log("czysty folder zaktualizowany: %s" % finalne_dir)


def do_hookvariants(args, bundle, out_dir, slug, b, palette, logo_img, angles, logo_url, styl_url, refs_dir, font_path):
    """HOOK-WARIANTY (~$0) + A/B SILNIKÓW. Generuje bazy scen BEZ nagłówka (best-of-1) i A/B demo (nb2)
    w JEDNYM równoległym batchu, nakłada N nagłówków kodem, buduje arkusz bramek i kompozyt A/B.
    RESPEKTUJE istniejące finały (NIE regeneruje ich). --finalize → publikacja wariantów (finały nietknięte)."""
    Image = _pil()[0]
    nvar = max(1, int(args.hook_variants))
    # Tagi ledgera fal MUSZĄ być namespace'owane slugiem — inaczej RECLAIM (_reclaim_paid poluje
    # ledger po project+"_"+tag) dociąga OPŁACONE joby INNEGO produktu o tym samym tagu (incydent
    # Masażer 19.07: reclaim pociągnął bazy 'hbase_*' Drapka do przebiegu masażera). Wzorzec 'slug__…'
    # jak w trybie portfelowym (do_portfolio).
    htag = lambda a: "%s__hbase_%s" % (slug, a)
    abtag = lambda c: "%s__ab_demo_c%d" % (slug, c)
    state_path = os.path.join(out_dir, "adforge-state.json")
    state = _load_json_file(state_path) or {}

    # 1) COPY z hook_alts (świeży call jeśli brak alts) — zachowaj PROWEN hook_baner jako h1 (kontrola A/B)
    copy = dict(state.get("copy") or {})
    if any(not (copy.get(a) or {}).get("hook_alts") for a in angles):
        log("Copy-call z hook_alts (alternatywne nagłówki do wariantów)…")
        fresh, _ = call_copy(bundle, angles, with_hook_alts=True)
        for a in angles:
            ca = dict(copy.get(a) or {}); fa = fresh.get(a) or {}
            if fa.get("hook_alts"):
                ca["hook_alts"] = fa["hook_alts"]
            if not ca.get("hook_baner") and fa.get("hook_baner"):
                ca["hook_baner"] = fa["hook_baner"]
            copy[a] = ca
        state["copy"] = copy

    # 2) refy (fal.store cache → ~$0)
    cena = clean_price(bundle.get("cena_pl"))
    refsd = prep_fd_refs(bundle, out_dir, slug, refs_dir, logo_url, styl_url, state)
    if not refsd["product_fal"]:
        raise SystemExit("hook-variants: brak rehostowanych kadrów produktu.")
    image_urls = _fd_image_urls(refsd); n_prod = len(refsd["product_fal"])

    # 3) JEDEN batch: bazy „bez nagłówka" (best-of-1/kąt) + A/B demo nb2 (best-of-2)
    hv_dir = os.path.join(out_dir, "hookvariants")
    jobs = []
    for a in angles:
        ca = copy.get(a) or {}
        prompt, _ = build_fulldesign(a, ca, b, palette, cena, bool(refsd["logo_fal"]),
                                     bool(refsd["styl_fal"]), n_prod, no_hook=True)
        jobs.append({"tag": htag(a), "model": NBPRO_EDIT, "image_urls": image_urls, "prompt": prompt})
    ab_on = bool(args.ab_engine)
    if ab_on:
        ca = copy.get("demo") or (copy.get(angles[0]) or {})
        ab_angle = "demo" if "demo" in angles else angles[0]
        ab_prompt, _ = build_fulldesign(ab_angle, ca, b, palette, cena, bool(refsd["logo_fal"]),
                                        bool(refsd["styl_fal"]), n_prod, no_hook=False)
        for c in range(BEST_OF):
            jobs.append({"tag": abtag(c), "model": NB2_EDIT, "image_urls": image_urls, "prompt": ab_prompt})

    est = NBPRO_USD * len(angles) + (NB2_USD * BEST_OF if ab_on else 0.0)
    if args.dry:
        print("-" * 88)
        print("[DRY] hook-variants: %d baz bez naglowka + %s; szac. koszt ~$%.2f (~%.2f zl). Bez generacji." %
              (len(angles), ("A/B nb2 best-of-%d" % BEST_OF) if ab_on else "bez A/B", est, est * 4.0))
        for a in angles:
            ca = copy.get(a) or {}
            vs = [(ca.get("hook_baner") or "")] + [x for x in (ca.get("hook_alts") or []) if str(x).strip()]
            print("   %-10s warianty (%d): %s" % (a, nvar, [_fd_txt(v) for v in vs if str(v).strip()][:nvar]))
        print("[DRY] out=%s" % out_dir)
        return 0
    if args.budget and est > args.budget + 1e-6:
        raise SystemExit("BUDŻET: szac. koszt ~$%.2f > limit $%.2f — przerwano przed generacją." % (est, args.budget))

    # 4) RECLAIM opłaconych (scope = tagi tego przebiegu) → RESUME
    _reclaim_paid(hv_dir, [j["tag"] for j in jobs])

    # 5) PEŁNA RÓWNOLEGŁOŚĆ: jeden submit-all → poll-all + CZAS ŚCIANY
    # new_tags = joby faktycznie do wygenerowania (po reclaim/resume) → naliczamy koszt TYLKO za nie
    # (bez tego --finalize na już-wygenerowanych podwajałby raportowany koszt).
    new_tags = {j["tag"] for j in jobs if not os.path.isfile(os.path.join(hv_dir, j["tag"] + ".png"))}
    pre_exist = len(jobs) - len(new_tags)
    print("-" * 88)
    log("ETAP GENERACJI (v8 równoległy): %d jobów w JEDNYM batchu (bazy hooków%s); %d już na dysku (resume)" %
        (len(jobs), " + A/B nb2" if ab_on else "", pre_exist))
    t0 = time.time()
    got = gen_nbpro_batch(jobs, hv_dir)
    wall = round(time.time() - t0, 1)
    log("CZAS ŚCIANY etapu generacji: %.1fs (%d jobów, %d nowych)" % (wall, len(jobs), len(jobs) - pre_exist))
    tim = state.setdefault("timings", {})
    tim["hookvariants_ab_wall_s"] = wall
    tim["hookvariants_ab_jobs"] = len(jobs)
    tim["hookvariants_ab_new"] = len(jobs) - pre_exist
    added = 0.0

    # 6) BAZY + NAKŁADKI wariantów (font marki)
    hook_files = {}
    for a in angles:
        bp = got.get(htag(a))
        if not bp or not os.path.isfile(bp):
            log("  UWAGA: baza bez naglowka [%s] BRAK - pomijam warianty tego kata" % a); continue
        if htag(a) in new_tags:
            added += NBPRO_USD                                     # naliczaj tylko za świeżą generację
        base_final = to_45(Image.open(bp).convert("RGB")).resize((FINAL_W, FINAL_H), Image.LANCZOS)
        base_path = os.path.join(out_dir, "ad_%s_45_hbase.png" % a)
        base_final.save(base_path, "PNG")
        ca = copy.get(a) or {}
        variants = [(ca.get("hook_baner") or ca.get("headline") or "")]
        variants += [x for x in (ca.get("hook_alts") or []) if str(x).strip()]
        variants = [v for v in variants if str(v).strip()][:nvar]
        files = []
        for i, txt in enumerate(variants, 1):
            op = os.path.join(out_dir, "ad_%s_45_h%d.png" % (a, i))
            overlay_hook_variant(base_path, txt, font_path, palette, op)
            files.append({"file": op, "text": _fd_txt(txt), "idx": i})
            log("  hook wariant [%s] h%d <- %s" % (a, i, _fd_txt(txt)))
        hook_files[a] = {"base": base_path, "variants": files}

    # 7) A/B kompozyt (nb2 vs nbpro; NIE publikujemy nb2)
    ab_path = None
    if ab_on:
        cand = [got.get(abtag(c)) for c in range(BEST_OF)]
        cand = [pp for pp in cand if pp and os.path.isfile(pp)]
        if cand:
            added += NB2_USD * sum(1 for c in range(BEST_OF)
                                   if abtag(c) in new_tags and got.get(abtag(c)))
            nb2_finals = [to_45(Image.open(pp).convert("RGB")).resize((FINAL_W, FINAL_H), Image.LANCZOS) for pp in cand]
            bi, _ = pick_best_candidate(nb2_finals, (0.0, 0.0, 1.0, 1.0))
            nb2_best = os.path.join(out_dir, "ad_demo_45_nb2.png")
            nb2_finals[bi].save(nb2_best, "PNG")
            for c, f in enumerate(nb2_finals):
                f.save(os.path.join(out_dir, "ad_demo_45_nb2_c%d.png" % c), "PNG")
            ab_angle_final = os.path.join(out_dir, "ad_%s_45.png" % ("demo" if "demo" in angles else angles[0]))
            ab_path = os.path.join(out_dir, "AB-SILNIKI-nbpro-vs-nb2.png")
            if not build_ab_composite(refsd["product_local"], ab_angle_final, nb2_best, ab_path):
                ab_path = None
        else:
            log("A/B nb2: brak kandydatów (sprawdź model %s; reclaim: fal.py reclaim %s)" % (NB2_EDIT, hv_dir))

    # 8) ARKUSZ BRAMEK ZBIORCZY (finały + warianty)
    extra_rows = []
    for a in angles:
        hf = hook_files.get(a)
        if not hf:
            continue
        row = [(Image.open(hf["base"]), "%s baza(0hook)" % a)]
        for v in hf["variants"]:
            row.append((Image.open(v["file"]), "%s h%d" % (a, v["idx"])))
        extra_rows.append(row)
    sheet = build_gate_sheet(out_dir, refsd["product_local"], angles, extra_rows=extra_rows)

    # 9) state + koszt — spent = SKUMULOWANY realny wydatek fal (przetrwa gen→osobny --finalize)
    state["hook_variants"] = {a: [v["text"] for v in hf["variants"]] for a, hf in hook_files.items()}
    state["ab_engine"] = args.ab_engine or None
    state["ab_composite"] = ab_path
    prior_spent = max(tim.get("hookvariants_spent_usd", 0.0), tim.get("hookvariants_added_usd", 0.0))
    spent = round(max(prior_spent, added), 4)                  # realny wydatek (odporny na gen→osobny --finalize)
    tim["hookvariants_added_usd"] = round(added, 4)
    tim["hookvariants_spent_usd"] = spent
    _save_state(out_dir, state)

    print("=" * 88)
    print("HOOK-WARIANTY + A/B — koszt płatny tej rundy ~$%.2f (~%.2f zł)" % (added, added * 4.0))
    print("CZAS ŚCIANY etapu generacji (v8 równoległy): %.1fs · %d jobów · %d nowych" %
          (wall, len(jobs), len(jobs) - pre_exist))
    print("WARIANTY HOOKÓW (baza bez nagłówka + nagłówek nałożony kodem, font marki):")
    for a, hf in hook_files.items():
        for v in hf["variants"]:
            print("  • %-10s h%d  %s  -> %s" % (a, v["idx"], os.path.basename(v["file"]), v["text"]))
    if sheet:
        print("ARKUSZ BRAMEK ZBIORCZY (oceniaj JEDEN obraz): %s" % sheet)
    if ab_path:
        print("A/B SILNIKÓW (NIE publikowany do panelu): %s" % ab_path)
    print("BRAMKA WIERNOŚCI wariantów/A-B: obejrzyj arkusz + kompozyt A/B (agent, vision).")

    # 10) publikacja wariantów (tylko --finalize; finały NIE ruszane) — koszt = SKUMULOWANY wydatek
    if args.finalize and not args.no_register:
        print("-" * 88)
        publish_hook_variants(bundle, out_dir, hook_files, spent)
    else:
        print("[--finalize pominięte] Warianty nieopublikowane — po ocenie arkusza uruchom z --finalize.")

    # 11) czysty folder
    if args.finalne_dir:
        sync_finalne(out_dir, args.finalne_dir, angles, hook_files, ab_path)
    print("out=%s" % out_dir)
    return 0


def _resolve_pids(args):
    """Lista product_id dla trybu portfelowego: --batch (jawne id) lub --batch-project (ze slugiem)."""
    if args.batch:
        return [x.strip() for x in args.batch.split(",") if x.strip()]
    rows = rest_get("wf2_products", {"project_id": "eq." + args.batch_project,
                                     "select": "id,slug,name,sort", "order": "sort.asc"})
    return [r["id"] for r in rows if str(r.get("slug") or "").strip()]


def do_portfolio(args):
    """TRYB PORTFELOWY (pkt 2): produkty przetwarzane WSPÓŁBIEŻNIE na etapie generacji (jeden batch fal
    na cały portfel, tagi namespace'owane slugiem), bramki oceniane ZBIORCZO (jeden arkusz), publikacja
    per produkt (tylko --finalize)."""
    if args.engine != "nbpro":
        raise SystemExit("--batch/--batch-project wspiera tylko --engine nbpro (full-design).")
    angles = [a.strip().lower() for a in args.angles.split(",") if a.strip()]
    angles = [a for a in angles if a in ALLOWED_ANGLES] or DEFAULT_ANGLES
    pids = _resolve_pids(args)
    if not pids:
        raise SystemExit("--batch/--batch-project: brak produktów (slug wymagany).")
    Image = _pil()[0]

    # ── DRY = plan bez efektów ubocznych (żadnego copy-calla / rehostu / zapisu stanu) ──
    if args.dry:
        est = NBPRO_USD * len(pids) * len(angles) * BEST_OF
        print("=" * 88)
        print("[DRY] TRYB PORTFELOWY — %d produktów × %d kątów × best-of-%d = %d jobów (est ~$%.2f / ~%.2f zł)" %
              (len(pids), len(angles), BEST_OF, len(pids) * len(angles) * BEST_OF, est, est * 4.0))
        for pid in pids:
            print("  • %s" % pid)
        print("[DRY] jeden batch fal na cały portfel; bramki zbiorcze; publikacja per produkt (--finalize).")
        return 0

    # ── prep każdego produktu (bez submitu): bundle, copy, refy ──
    ctxs = []
    for pid in pids:
        pid = pid.strip()
        if not UUID_RE.match(pid):
            log("portfolio: pomijam nie-UUID %s" % pid); continue
        bundle = fetch_product_bundle(pid)
        p = bundle["product"]; bb = bundle["branding"]
        slug = str(p.get("slug") or pid)
        out_dir = args.out or os.path.join(r"C:\tmp\ad-forge", slug)
        refs_dir = os.path.join(out_dir, "refs"); os.makedirs(refs_dir, exist_ok=True)
        palette = parse_palette(bb["paleta"])
        state = _load_json_file(os.path.join(out_dir, "adforge-state.json")) or {}
        copy, _ = call_copy(bundle, angles)
        merged = dict(state.get("copy") or {})
        for a in angles:
            merged[a] = copy.get(a) or {}
        state["copy"] = merged
        refsd = prep_fd_refs(bundle, out_dir, slug, refs_dir, bb["logo_url"], bb["styl_master_url"], state)
        if not refsd["product_fal"]:
            log("portfolio: %s — brak rehostowanych refów, pomijam" % slug); continue
        ctxs.append({"pid": pid, "bundle": bundle, "b": bb, "slug": slug, "out_dir": out_dir,
                     "refs_dir": refs_dir, "palette": palette, "copy": merged, "refsd": refsd,
                     "state": state, "font_path": resolve_font_path(bb["fonty"])})
        log("portfolio prep OK: %s (%s)" % (slug, pid))

    if not ctxs:
        raise SystemExit("portfolio: żaden produkt nie nadaje się do generacji.")

    # ── wspólny batch (namespace tag = slug__angle_cN) ──
    staging = os.path.join(r"C:\tmp\ad-forge", "_batch")
    os.makedirs(staging, exist_ok=True)
    all_jobs = []
    for ctx in ctxs:
        refsd = ctx["refsd"]; image_urls = _fd_image_urls(refsd); n_prod = len(refsd["product_fal"])
        cena = clean_price(ctx["bundle"].get("cena_pl"))
        for a in angles:
            ca = ctx["copy"].get(a) or {}
            prompt, _ = build_fulldesign(a, ca, ctx["b"], ctx["palette"], cena,
                                         bool(refsd["logo_fal"]), bool(refsd["styl_fal"]), n_prod)
            for c in range(BEST_OF):
                all_jobs.append({"tag": "%s__%s_c%d" % (ctx["slug"], a, c), "model": NBPRO_EDIT,
                                 "image_urls": image_urls, "prompt": prompt})
    est = NBPRO_USD * len(all_jobs)
    print("=" * 88)
    print("TRYB PORTFELOWY — %d produktów × %d kątów × best-of-%d = %d jobów (est ~$%.2f / ~%.2f zł)" %
          (len(ctxs), len(angles), BEST_OF, len(all_jobs), est, est * 4.0))
    for ctx in ctxs:
        print("  • %s (%s)" % (ctx["slug"], ctx["pid"]))
    if args.budget and est > args.budget + 1e-6:
        raise SystemExit("BUDŻET: szac. koszt ~$%.2f > limit $%.2f — przerwano." % (est, args.budget))

    # ── RECLAIM + jeden submit-all→poll-all na CAŁY portfel ──
    _reclaim_paid(staging, [j["tag"] for j in all_jobs])
    pre_exist = sum(1 for j in all_jobs if os.path.isfile(os.path.join(staging, j["tag"] + ".png")))
    print("-" * 88)
    log("ETAP GENERACJI PORTFELA (jeden batch): %d jobów, %d na dysku (resume)" % (len(all_jobs), pre_exist))
    t0 = time.time()
    got = gen_nbpro_batch(all_jobs, staging)
    wall = round(time.time() - t0, 1)
    log("CZAS ŚCIANY etapu generacji (portfel): %.1fs (%d jobów, %d nowych)" % (wall, len(all_jobs), len(all_jobs) - pre_exist))

    # ── consume per produkt + wiersze do arkusza zbiorczego ──
    all_rows = []
    for ctx in ctxs:
        slug = ctx["slug"]; out_dir = ctx["out_dir"]; creatives = []
        packshot = ctx["refsd"]["product_local"][0] if ctx["refsd"]["product_local"] else None
        for a in angles:
            cand = [got.get("%s__%s_c%d" % (slug, a, c)) for c in range(BEST_OF)]
            cand = [pp for pp in cand if pp and os.path.isfile(pp)]
            if not cand:
                log("portfolio %s/%s: brak kandydatów — pomijam" % (slug, a)); continue
            finals = [to_45(Image.open(pp).convert("RGB")).resize((FINAL_W, FINAL_H), Image.LANCZOS) for pp in cand]
            bi, _ = pick_best_candidate(finals, (0.0, 0.0, 1.0, 1.0))
            for c, f in enumerate(finals):
                f.save(os.path.join(out_dir, "ad_%s_45_c%d.png" % (a, c)), "PNG")
            finals[bi].save(os.path.join(out_dir, "ad_%s_45.png" % a), "PNG")
            ca = ctx["copy"].get(a) or {}
            creatives.append({"angle": a, "path": os.path.join(out_dir, "ad_%s_45.png" % a),
                              "headline": (ca.get("hook_baner") or ca.get("headline") or ""),
                              "primary_text": ca.get("primary_text") or ""})
            row = []
            if packshot and os.path.isfile(packshot):
                row.append((Image.open(packshot), "%s REF" % slug))
            for c in range(BEST_OF):
                cf = os.path.join(out_dir, "ad_%s_45_c%d.png" % (a, c))
                if os.path.isfile(cf):
                    row.append((Image.open(cf), "%s %s c%d" % (slug, a, c)))
            row.append((finals[bi], "%s %s FINAŁ" % (slug, a)))
            all_rows.append(row)
        ctx["creatives"] = creatives
        st = ctx["state"]; st["engine"] = "nbpro"; st["mode"] = "fulldesign"
        st["total_usd"] = round(NBPRO_USD * BEST_OF * len(angles), 4)
        st.setdefault("timings", {})["portfolio_wall_s"] = wall
        _save_state(out_dir, st)
        try:
            build_all_composites(out_dir, ctx["refsd"], angles)
        except Exception as e:
            log("portfolio %s: dowody nieudane: %s" % (slug, e))

    sheet_dir = os.path.join(staging, "dowody"); os.makedirs(sheet_dir, exist_ok=True)
    sheet = _grid_montage(all_rows, os.path.join(sheet_dir, "ARKUSZ-BRAMEK-PORTFEL.png")) if all_rows else None
    print("-" * 88)
    print("BRAMKI ZBIORCZE (oceniaj JEDEN arkusz portfela): %s" % (sheet or "brak"))
    for ctx in ctxs:
        print("  • %-16s %d finałów" % (ctx["slug"], len(ctx.get("creatives") or [])))

    if args.finalize and not args.no_register:
        print("-" * 88); log("Publikacja per produkt…")
        for ctx in ctxs:
            if ctx.get("creatives"):
                publish(ctx["bundle"], "nbpro", ctx["out_dir"], ctx["creatives"], ctx["state"]["total_usd"],
                        state=ctx["state"])
    else:
        print("[--finalize pominięte] Portfel nieopublikowany — po ocenie arkusza uruchom z --finalize.")
    print("=" * 88)
    print("PORTFEL GOTOWY — %d produktów, czas ściany generacji %.1fs (~$%.2f)" %
          (len(ctxs), wall, est))
    return 0


def run(args):
    global resolve_font_path_glob
    pid = args.product_id.strip()
    if not UUID_RE.match(pid):
        raise SystemExit("product_id musi być UUID: %s" % pid)
    angles = [a.strip().lower() for a in args.angles.split(",") if a.strip()]
    angles = [a for a in angles if a in ALLOWED_ANGLES] or DEFAULT_ANGLES

    mode = getattr(args, "mode", "auto")
    if mode == "auto":                                             # nbpro → full-design; reszta → overlay
        mode = "fulldesign" if args.engine == "nbpro" else "overlay"

    log("Produkt %s · kąty=%s · engine=%s · mode=%s · quality=%s%s" %
        (pid, angles, args.engine, mode, args.quality, "  [DRY]" if args.dry else ""))
    bundle = fetch_product_bundle(pid)
    p = bundle["product"]
    b = bundle["branding"]
    slug = str(p.get("slug") or pid)
    out_dir = args.out or os.path.join(r"C:\tmp\ad-forge", slug)
    refs_dir = os.path.join(out_dir, "refs")
    os.makedirs(refs_dir, exist_ok=True)

    palette = parse_palette(b["paleta"])
    resolve_font_path_glob = resolve_font_path(b["fonty"])
    logo_url = b["logo_url"]
    styl_url = b["styl_master_url"]
    product_refs = bundle["refs"]

    # ── raport wejścia ──
    print("=" * 88)
    print("AD-FORGE — produkt: %s (slug=%s)" % (p.get("name"), slug))
    print("=" * 88)
    print("Marka: %s | dla_kogo: %s | kąt: %s | ton: %s" %
          (b["brand_name"] or "—", b["ust"].get("dla_kogo") or "—", b["ust"].get("kat") or "—", b["ust"].get("ton_marki") or "—"))
    print("Paleta: %s  → hexy: %s" % (b["paleta"] or "—", [("#%02X%02X%02X" % c) for c in palette] or "—"))
    print("Font: %s → %s" % (b["fonty"] or "—", os.path.basename(resolve_font_path_glob)))
    print("Logo: %s" % (logo_url or "BRAK"))
    print("Styl-master: %s" % (styl_url or "BRAK"))
    print("Refy produktu (%d, wierność malejąco):" % len(product_refs))
    for i, r in enumerate(product_refs):
        print("  [%d] %s" % (i, r["url"]))
    packshots = [r["url"] for r in product_refs][:PRODUCT_REF_MAX]  # MULTI-REF (2-4 różne kadry produktu)
    print("Packshoty MULTI-REF do generacji (max %d): %s" % (PRODUCT_REF_MAX, packshots))
    print("Tytuł aukcji (dezambiguacja, source=detail): %s" % (bundle.get("snap_title") or "BRAK"))
    print("Opisy kadrów (alt_pl keep, max 3): %s" % (bundle.get("alt_texts") or "BRAK"))
    print("Cena PL (lp_dane, na blok ceny): %s → %s" % (bundle.get("cena_pl") or "BRAK", clean_price(bundle.get("cena_pl")) or "—"))

    logo_img = load_logo(logo_url, refs_dir)

    # ── HOOK-WARIANTY (~$0) + A/B SILNIKÓW (v8) — respektuje istniejące finały, NIE regeneruje ──
    if getattr(args, "hook_variants", 0):
        if args.engine != "nbpro":
            raise SystemExit("--hook-variants wymaga --engine nbpro (full-design).")
        return do_hookvariants(args, bundle, out_dir, slug, b, palette, logo_img, angles,
                               logo_url, styl_url, refs_dir, resolve_font_path_glob)

    # ── BRAMKA WIERNOŚCI (post-generacja): --finalize / --fix / --regen / --pick / --gen-11 / --regen-11 ──
    # Wznawia ze stanu; publikacja PO przejściu checklisty wierności + ciągłości + kwadratu (agent na kompozytach).
    if args.finalize or args.fix or args.regen or args.pick or args.gen_11 or args.regen_11:
        return do_fd_postgen(args, bundle, out_dir, slug, b, palette, logo_img, angles, logo_url, styl_url, refs_dir)

    # ── RECOMPOSE: z zapisanych scen, bez copy-calla i bez płatnej generacji ──
    if args.recompose:
        return do_recompose(args, bundle, out_dir, palette, logo_img, angles)

    # ── copy + wizje scen (1 call wf2-gpt) ──
    print("-" * 88)
    log("Copy + wizje scen przez wf2-gpt (gpt-5.6-sol, json)…")
    copy, copy_prompt = call_copy(bundle, angles)
    for a in angles:
        ca = copy.get(a) or {}
        print("  ── KĄT %s ──" % a.upper())
        print("     hook_baner: %s" % ca.get("hook_baner"))
        if a == "demo":
            print("     callouts : %s" % ca.get("callouts_demo"))
        print("     headline : %s" % ca.get("headline"))
        print("     subline  : %s" % (ca.get("subline") or "(brak)"))
        print("     primary  : %s" % ca.get("primary_text"))
        print("     scene_vis: %s" % ca.get("scene_vision"))
        if a == "problem":
            print("     pain_vis : %s" % ca.get("pain_vision"))
            print("     checkmark: %s" % ca.get("fakt_checkmarki"))

    # ── stan (fal_refs cache + copy + intended texts) ──
    state_path = os.path.join(out_dir, "adforge-state.json")
    state = {}
    if os.path.isfile(state_path):
        try:
            state = json.loads(io.open(state_path, encoding="utf-8").read())
        except Exception:
            state = {}

    # ── FULL-DESIGN (default nbpro): model komponuje CAŁY baner; AGENT = bramka tekstu ──
    if mode == "fulldesign":
        if args.engine != "nbpro":
            raise SystemExit("--mode fulldesign wymaga --engine nbpro")
        if args.dry:
            print("-" * 88)
            est = NBPRO_USD * BEST_OF * len(angles)
            print("[DRY] full-design — %d kątów × best-of-%d = ~$%.2f (~%.2f zł)" %
                  (len(angles), BEST_OF, est, est * 4.0))
            return 0
        print("-" * 88)
        creatives, total_usd, refsd = do_fulldesign(args, bundle, out_dir, slug, b, palette, copy, angles,
                                                    logo_url, styl_url, refs_dir, state)
        # DOWODY WIERNOŚCI (agent ogląda kompozyty per kąt + ciągłość — NIE publikujemy w ciemno)
        comp = build_all_composites(out_dir, refsd, angles)
        _save_state(out_dir, state)
        # PANEL: krok „Banery reklamowe" → in_progress + brief/generacja/qa + dowody (Tomek widzi
        # przebieg zanim uruchomisz --finalize; publikacja creatives dopiero na --finalize).
        if not args.no_register:
            try:
                emit_full_panel(bundle, "nbpro", out_dir, slug, creatives, total_usd, state, finalize=False)
            except Exception as e:
                log("panel (in_progress) emisja nieudana: %s" % e)
        print("=" * 88)
        print("GENERACJA GOTOWA (full-design MULTI-REF) — %d kreacji, koszt ~$%.2f (~%.2f zł)" %
              (len(creatives), total_usd, total_usd * 4.0))
        print("BRAMKA WIERNOŚCI: obejrzyj kompozyty (realny produkt | kreacja) i checklistę T/N:")
        for a in angles:
            if a in comp:
                print("  • %-10s %s" % (a, comp[a]))
        if "_ciaglosc" in comp:
            print("  • CIĄGŁOŚĆ   %s" % comp["_ciaglosc"])
        print("-" * 88)
        print_click_gate(angles)
        print("Po weryfikacji: --fix ANGLE='opis cechy' / --regen ANGLE / --pick ANGLE=cN, na końcu --finalize.")
        print("out=%s" % out_dir)
        return 0

    # ── plan scen + prompty + prompt-lint (tryb OVERLAY) ──
    print("-" * 88)
    print("PLAN SCEN + PROMPTY (kierunkowe, produkt = referencja):")
    demo_borrows = ("demo" in angles) and any(x in angles for x in ("problem", "lifestyle"))
    plan = []
    for a in angles:
        ca = copy.get(a) or {}
        for kind, ang in scenes_for_angle(a):
            if a == "demo" and kind == "hero" and demo_borrows:
                print("  • [demo/hero] POMINIĘTE — demo pożyczy scenę problem_fakt/lifestyle_ugc (oszczędność)")
                continue
            sp, with_product = build_scene_prompt(kind, ca)
            fp = full_prompt(sp, with_product, bool(styl_url) and with_product)
            probs = lint_scene(fp, with_product)
            plan.append({"angle": a, "kind": kind, "prompt": fp, "with_product": with_product})
            print("  • [%s/%s] produkt=%s  lint=%s" %
                  (a, kind, "TAK" if with_product else "NIE", "OK" if not probs else "FLAGI"))
            print("      %s" % fp.replace("\n\n", "  ⏎  "))
            for pr in probs:
                print("      ⚠ %s" % pr)

    is_nbpro = args.engine == "nbpro"
    per_scene = (BEST_OF * NBPRO_USD) if is_nbpro else ADFORGE_IMG_USD
    if args.dry:
        print("-" * 88)
        print("[DRY] Zatrzymano PRZED generacją obrazów i rejestracją.")
        n_fin = len(angles) if (is_nbpro and not getattr(args, "no_finisher", False)) else 0
        est = per_scene * len(plan) + n_fin * NBPRO_USD
        print("[DRY] Sceny: %s (best-of-%d) + finisher×%d → koszt szac. ~$%.2f (~%.2f zł)" %
              ([pl["kind"] for pl in plan], BEST_OF if is_nbpro else 1, n_fin, est, est * 4.0))
        print("[DRY] out=%s" % out_dir)
        return 0

    # ── stan (fal_refs cache + copy) ──
    state_path = os.path.join(out_dir, "adforge-state.json")
    state = {}
    if os.path.isfile(state_path):
        try:
            state = json.loads(io.open(state_path, encoding="utf-8").read())
        except Exception:
            state = {}

    # ── generacja + format + kompozycja ──
    print("-" * 88)
    styl_local = None
    if styl_url:
        try:
            blob, ct = _download(styl_url)
            styl_local = os.path.join(refs_dir, "styl-master." + _ct_ext(ct))
            io.open(styl_local, "wb").write(blob)
        except Exception as e:
            log("styl-master pobranie nieudane: %s" % e)
    packshot_local = []
    for i, u in enumerate(packshots):
        try:
            pblob, pct = _download(u)
            pth = os.path.join(refs_dir, "packshot-%d.%s" % (i, _ct_ext(pct)))
            io.open(pth, "wb").write(pblob)
            packshot_local.append(pth)
        except Exception as e:
            log("packshot %d pobranie nieudane: %s" % (i, e))

    sceny_dir = os.path.join(out_dir, "sceny")                     # surowe sceny do --recompose
    os.makedirs(sceny_dir, exist_ok=True)
    scene_imgs = {}                                                # (angle,kind) → RGB final
    total_usd = 0.0

    if is_nbpro:
        # ── ETAP A: rehost refów PRZEZ fal.store RAZ (public URL, cache w state) ──
        log("Rehost refów przez fal.store (public URL dla nbpro)…")
        packshot_fal = None
        if packshot_local and packshots:
            packshot_fal = rehost_ref(packshot_local[0], "adforge/%s/packshot0.%s" %
                                      (slug, packshot_local[0].rsplit(".", 1)[-1]), packshots[0], state)
        styl_fal = None
        if styl_local and styl_url:
            styl_fal = rehost_ref(styl_local, "adforge/%s/styl.%s" %
                                  (slug, styl_local.rsplit(".", 1)[-1]), styl_url, state)
        # zapisz cache refów zanim ruszy generacja (odporność na pad)
        try:
            io.open(state_path, "w", encoding="utf-8").write(json.dumps(state, ensure_ascii=False, indent=1))
        except Exception:
            pass

        # ── ETAP A: best-of-2 równolegle (fal.gen_batch) ──
        jobs = []
        for pl in plan:
            a, kind, fp, wp = pl["angle"], pl["kind"], pl["prompt"], pl["with_product"]
            image_urls = []
            if wp and packshot_fal:
                image_urls.append(packshot_fal)
                if styl_fal:
                    image_urls.append(styl_fal)
            model = NBPRO_EDIT if image_urls else NBPRO_T2I
            for c in range(BEST_OF):
                jobs.append({"tag": "%s_%s_c%d" % (a, kind, c), "model": model,
                             "image_urls": image_urls, "prompt": fp})
        cand_dir = os.path.join(sceny_dir, "cand")
        got = gen_nbpro_batch(jobs, cand_dir)
        total_usd += per_scene * len(plan)

        for pl in plan:
            a, kind = pl["angle"], pl["kind"]
            cand_paths = [got.get("%s_%s_c%d" % (a, kind, c)) for c in range(BEST_OF)]
            cand_paths = [pp for pp in cand_paths if pp and os.path.isfile(pp)]
            if not cand_paths:
                raise SystemExit("nbpro: brak kandydatów dla %s/%s — przerwano (dociągnij: fal.py reclaim %s)" % (a, kind, cand_dir))
            finals = [scene_to_final(io.open(pp, "rb").read(), "nbpro") for pp in cand_paths]
            zone = NEG_ZONES.get((a, kind), NEG_ZONE_DEFAULT)
            best_i, scores = pick_best_candidate(finals, zone)
            log("  best-of-%d [%s/%s] → kandydat #%d %s (ostrość/jasność/score)" %
                (len(finals), a, kind, best_i, scores))
            # zapisz OBU kandydatów do sceny/ + wybraną jako kanoniczną scene_<a>_<kind>.png
            for c, pp in enumerate(cand_paths):
                shutil.copyfile(pp, os.path.join(sceny_dir, "scene_%s_%s_cand%d.png" % (a, kind, c)))
            shutil.copyfile(cand_paths[best_i], os.path.join(sceny_dir, "scene_%s_%s.png" % (a, kind)))
            scene_imgs[(a, kind)] = finals[best_i]
    else:
        for pl in plan:
            a, kind, fp, wp = pl["angle"], pl["kind"], pl["prompt"], pl["with_product"]
            log("Generacja [%s/%s] engine=%s…" % (a, kind, args.engine))
            if args.engine == "gptimage":
                ref_urls = [("product", packshots[0])] if wp and packshots else []
                if wp and styl_url:
                    ref_urls.append(("style", styl_url))
                blob = gen_gptimage(fp, ref_urls, args.quality)
            else:
                ref_objs = []
                if wp and packshots:
                    ref_objs.append({"url": packshots[0], "type": "product"})
                if wp and styl_url:
                    ref_objs.append({"url": styl_url, "type": "ref"})
                blob = gen_gemini(fp, ref_objs, slug, "%s-%s" % (a, kind))
            total_usd += ADFORGE_IMG_USD
            io.open(os.path.join(sceny_dir, "scene_%s_%s.png" % (a, kind)), "wb").write(blob)  # PRZED overlay
            scene_imgs[(a, kind)] = scene_to_final(blob, args.engine)

    # stan do --recompose (engine + copy + kąty) — MERGE copy po angle; zachowaj fal_refs.
    merged_copy = dict((state.get("copy") or {}))
    for a in angles:
        merged_copy[a] = copy.get(a) or {}
    state["engine"] = args.engine
    state["quality"] = args.quality
    state["copy"] = merged_copy
    io.open(state_path, "w", encoding="utf-8").write(json.dumps(state, ensure_ascii=False, indent=1))

    creatives, regions_by_angle = compose_all(angles, copy, scene_imgs, out_dir, b["brand_name"],
                                              logo_img, palette, bundle.get("cena_pl"))
    finish(args, bundle, args.engine, out_dir, creatives, total_usd, mode="gen",
           regions_by_angle=regions_by_angle, state=state, run_finisher_pass=is_nbpro)
    return 0


def build_argparser():
    ap = argparse.ArgumentParser(
        prog="ad-forge.py",
        description="Tor statycznych grafik reklamowych 4:5 (silnik fal nano-banana-pro/nb2).")
    ap.add_argument("product_id", nargs="?", help="UUID produktu wf2_products (opcjonalny przy --batch/--batch-project)")
    ap.add_argument("--angles", default="demo,problem,lifestyle",
                    help="kąty po przecinku (demo,problem,lifestyle)")
    ap.add_argument("--engine", default="nbpro", choices=["nbpro", "gptimage", "gemini"],
                    help="silnik scen (domyślnie nbpro = fal-ai/nano-banana-pro, best-of-2 + finisher)")
    ap.add_argument("--mode", default="auto", choices=["auto", "fulldesign", "overlay"],
                    help="fulldesign = model komponuje CAŁY baner (default dla nbpro); overlay = nakładki Pillow (fallback)")
    ap.add_argument("--no-finisher", action="store_true",
                    help="pomiń ETAP C finisher (tryb overlay/nbpro) — tylko sceny best-of-2 + kompozycja B")
    ap.add_argument("--out", help="katalog wyjściowy (domyślnie C:\\tmp\\ad-forge\\<slug>)")
    ap.add_argument("--dry", action="store_true",
                    help="pobierz dane+refy, zbuduj prompty i copy, wypisz plan — bez generacji/rejestracji")
    ap.add_argument("--recompose", action="store_true",
                    help="użyj zapisanych surowych scen z out/sceny/ — tylko crop/kompozycja/publikacja, BEZ płatnej generacji")
    ap.add_argument("--no-register", action="store_true", help="nie rejestruj w panelu (tylko pliki lokalne)")
    ap.add_argument("--quality", default="high", choices=["high", "medium"], help="jakość gpt-image-2")
    # ── BRAMKA WIERNOŚCI (full-design, post-generacja) ──
    ap.add_argument("--finalize", action="store_true",
                    help="full-design: publikacja MERGE po przejściu checklisty wierności (wznawia ze stanu)")
    ap.add_argument("--fix", action="append", default=[], metavar="ANGLE=CECHA",
                    help="chirurgiczna korekta geometrii produktu (nbpro/edit) — powtarzalne (np. --fix lifestyle='prostokątny schowek przy krawędzi')")
    ap.add_argument("--regen", default="",
                    help="pełna regeneracja best-of-2 (multi-ref) danych kątów po przecinku (np. --regen problem,lifestyle)")
    ap.add_argument("--pick", action="append", default=[], metavar="ANGLE=cN",
                    help="wybierz kandydata jako finał (np. --pick demo=c1) — powtarzalne / po przecinku")
    ap.add_argument("--karta", default="", help="ścieżka KARTA.json (domyślnie out/KARTA.json)")
    ap.add_argument("--verdicts", default="", help="ścieżka VERDICTS.json (domyślnie out/VERDICTS.json)")
    ap.add_argument("--klik", default="", help="ścieżka KLIK.json — werdykty bramki powodu kliknięcia (domyślnie out/KLIK.json)")
    # ── FORMATY (v10): 4:5 + kwadrat 1:1 ──
    ap.add_argument("--formats", default="45,11",
                    help="formaty do publikacji po przecinku (45=4:5, 11=1:1 kwadrat). Default '45,11'")
    ap.add_argument("--gen-11", dest="gen_11", default="",
                    help="(re)generuj kwadrat 1:1 OSZCZĘDNIE (przekompozycja finału 4:5) dla kątów po przecinku lub 'all'")
    ap.add_argument("--regen-11", dest="regen_11", default="",
                    help="pełna generacja kwadratu 1:1 (aspect 1:1, bez seeda 4:5) dla kątów po przecinku lub 'all' — fallback gdy oszczędny psuje litery")
    # ── v8: hook-warianty / A/B silników / portfel / budżet / czysty folder ──
    ap.add_argument("--hook-variants", type=int, default=0, metavar="N",
                    help="N wariantow naglowka na bazie sceny bez naglowka (nakladka kodem, font marki); publikacja jako dodatkowe artefakty")
    ap.add_argument("--ab-engine", default="", metavar="MODEL",
                    help="A/B silników: dodatkowa scena demo przez nano-banana-2 (podaj np. nano-banana-2) — kompozyt porównawczy, NIE publikowany")
    ap.add_argument("--batch", default="", help="TRYB PORTFELOWY: lista product_id po przecinku")
    ap.add_argument("--batch-project", default="", help="TRYB PORTFELOWY: wszystkie produkty projektu (ze slugiem)")
    ap.add_argument("--budget", type=float, default=0.0, metavar="USD",
                    help="twardy limit szacowanego kosztu przebiegu (0 = bez limitu) — STOP przed submitem gdy przekroczony")
    ap.add_argument("--finalne-dir", default="", help="czysty folder do aktualizacji (finały + warianty + A/B), np. C:\\tmp\\DRAPEK-BANERY-FINALNE")
    return ap


def main(argv=None):
    args = build_argparser().parse_args(argv)
    if args.batch or args.batch_project:
        return do_portfolio(args)
    if not args.product_id:
        raise SystemExit("podaj product_id albo --batch/--batch-project")
    return run(args)


if __name__ == "__main__":
    sys.exit(main())
