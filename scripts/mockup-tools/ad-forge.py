#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ad-forge.py — tor STATYCZNYCH GRAFIK REKLAMOWYCH (FB/IG 4:5) bez Manusa.
SSOT: SPEC-ADFORGE + docs/zbuduje/STANDARD-GRAFIKI-SKLEPY.md.

Zasada nadrzędna (Tomek): PROMPT KIERUNKOWY (cel/wizja/nastrój, EN) — wygląd produktu
niosą WYŁĄCZNIE referencje (image[0] + prefix „reproduce unchanged"). ZERO opisu produktu
słowami. DRUGA zasada: tekst PL i logo NIGDY z modelu — zawsze deterministycznie kodem
(diakrytyki w WERSALIKACH przetrwają w TTF — to cała pointa).

FLOW: dane produktu (REST) → refy+branding (port buildProductRefs/readBranding z wf2-ads) →
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

TRYB FULL-DESIGN (default dla nbpro, 2026-07-19 — feedback Tomka „stare kreacje Manusa dużo lepsze"):
  model nano-banana-pro komponuje CAŁY baner w jednym akcie (foto+typografia+pigułki+linie+logo
  zintegrowane, nie „naklejki" Pillow). Brief = adaptacja wf2-ads buildAdsInstruction (wierność 1:1,
  DNA marki, art-direction per kąt, zakazy uczciwości) + DOKŁADNE polskie napisy verbatim. Best-of-2/kąt.
  BRAMKA TEKSTU = agent (vision) porównuje litera-po-literze; literówka → drugi kandydat / chirurgiczny
  `nano-banana-pro/edit` fix / fallback overlay. `--mode overlay` = stary tor nakładek (fallback).

CLI:
  python ad-forge.py <product_id> [--angles demo,problem,lifestyle] [--engine nbpro|gptimage|gemini]
    [--mode auto|fulldesign|overlay] [--out DIR] [--dry] [--no-register] [--no-finisher] [--quality high|medium]
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
GEN_SIZE = "1024x1536"                    # natywne gpt-image-2 (2:3) → smart-crop do 4:5
UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.I)

DEFAULT_ANGLES = ["demo", "problem", "lifestyle"]
ALLOWED_ANGLES = ["demo", "problem", "lifestyle"]

# Koszt szacunkowy 1 obrazu gpt-image-2 high 1024×1536 ≈ $0.25 — konfigurowalny env.
ADFORGE_IMG_USD = float(os.environ.get("ADFORGE_IMG_USD", "0.25"))

# ── PIPELINE ETAPOWY v5 (nbpro = fal-ai/nano-banana-pro) ──────────────────────
# Domyślny silnik. gptimage/gemini zostają jako fallback.
NBPRO_EDIT = "fal-ai/nano-banana-pro/edit"           # scena z produktem (image_urls wymagane)
NBPRO_T2I = "fal-ai/nano-banana-pro"                 # scena bez produktu (PAIN); base model —
# UWAGA: subpath '/text-to-image' ma zepsutą ścieżkę kolejki fal (response_url 404 przy pobraniu);
# base 'fal-ai/nano-banana-pro' dzieli działającą ścieżkę z '/edit'. (incydent drapek 19.07)
NBPRO_USD = float(os.environ.get("ADFORGE_NBPRO_USD", "0.225"))  # 1 obraz 2K
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
    "Where a text pill overlaps the dog or a person, make the subject's edge slightly overlap the pill "
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
# PORT 1:1 z supabase/functions/wf2-ads/index.ts — kolejność wierności refów.
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
    # tytuł aukcji TYLKO gdy source=='detail' (zasada z wf2-ads) + alt_pl kadrów galerii (keep, max 3).
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
def build_copy_prompt(bundle, angles):
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

    # Schemat JSON per kąt (tylko wybrane kąty).
    schema_lines = []
    for a in angles:
        if a == "problem":
            schema_lines.append(
                '  "problem": {"hook_baner":"TRANSFORMACJA PL, 2-4 słowa (np. \\"Koniec walki o pazury\\")",'
                '"headline":"2-4 słowa PL WERSALIKI-friendly","subline":"≤6 słów PL lub \\"\\"",'
                '"primary_text":"2-3 zdania PL, INNE otwarcie niż reszta","scene_vision":"1 zdanie EN — scena FAKTU z produktem",'
                '"pain_vision":"1 zdanie EN — scena bólu BEZ produktu","fakt_checkmarki":["≤3 słowa PL","≤3 słowa PL","≤3 słowa PL"]}')
        elif a == "demo":
            schema_lines.append(
                '  "demo": {"hook_baner":"PYTANIE-LUSTRO lub BENEFIT PL (np. \\"Twój pies nie znosi obcinania pazurów?\\")",'
                '"callouts_demo":["≤3 słowa PL z FAKTÓW (np. schowek na smakołyki)","≤3 słowa PL (np. ściera pazury naturalnie)","≤3 słowa PL (np. antypoślizgowy spód)"],'
                '"headline":"2-4 słowa PL WERSALIKI-friendly","subline":"≤6 słów PL lub \\"\\"",'
                '"primary_text":"2-3 zdania PL, INNE otwarcie niż reszta","scene_vision":"STUDYJNA wskazówka EN, max kilka słów — '
                'tylko rekwizyt/kolor/faktura tła obok produktu, BEZ ludzi i BEZ scen wnętrz (np. \\"a few dog treats scattered beside the board\\")"}')
        else:  # lifestyle
            schema_lines.append(
                '  "%s": {"hook_baner":"ODRĘCZNY MARKER PL sprzedający MECHANIZM — że pies robi to SAM, ≤3 słowa, z wykrzyknikiem (np. \\"SAM ŚCIERA PAZURY!\\")",'
                '"mini_adnotacja":"KRÓTKA druga odręczna adnotacja PL przy szufladzie, ≤3 słowa (np. \\"smakołyki w środku\\")",'
                '"headline":"2-4 słowa PL WERSALIKI-friendly","subline":"≤6 słów PL lub \\"\\"",'
                '"primary_text":"2-3 zdania PL, INNE otwarcie niż reszta",'
                '"scene_vision":"1 zdanie EN — MECHANIZM W AKCJI: pies SAM energicznie drapie deskę (pazury na czarnej powierzchni), szuflada uchylona ze smakołykami, wzrok na schowku, BEZ ludzkiej ręki podającej smakołyk"}' % a)
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
        "problem = transformacja (przed→po); lifestyle = ODRĘCZNY MARKER sprzedający MECHANIZM — że pies robi to SAM "
        "(np. \"SAM ŚCIERA PAZURY!\"), NIE „gdzie jest smakołyk\". PL, z diakrytykami.\n"
        "• mini_adnotacja (TYLKO lifestyle): druga, malutka odręczna adnotacja przy szufladzie, ≤3 słowa (np. \"smakołyki w środku\").\n"
        "• callouts_demo (TYLKO demo): 3 krótkie etykiety ≤3 słowa Z FAKTÓW produktu (tytuł aukcji/opisy kadrów) "
        "wskazujące części produktu (schowek na smakołyki / ściera pazury naturalnie / antypoślizgowy spód). ZERO zmyślania.\n"
        "• headline: 2-4 słowa PL, JEDNA obietnica, dobrze wygląda WERSALIKAMI (diakrytyki OK).\n"
        "• subline: opcjonalny, ≤6 słów PL (pusty string gdy zbędny).\n"
        "• primary_text: 2-3 zdania PL, hak w 1. zdaniu, lekkie CTA; KAŻDY kąt zaczyna się INNYM zdaniem.\n"
        "• USP-MOMENT (TWARDA zasada scen WSZYSTKICH kątów z produktem): scena łapie MECHANIZM W AKCJI — pies SAM energicznie DRAPIE "
        "(pazury w kontakcie z czarną powierzchnią ścierną), szuflada uchylona z WIDOCZNYMI smakołykami, wzrok psa na schowku. "
        "ZAKAZ: pies stojący/siedzący biernie; smakołyk podawany z ludzkiej ręki. Widz w 0,5 s musi zrozumieć, że pies robi to SAM.\n"
        "• scene_vision: 1 zdanie EN — konkretna wizja sceny dla TEGO produktu i persony (opisuj SCENĘ/otoczenie/światło/porę dnia, "
        "NIGDY wyglądu produktu — produkt niesie referencja; ZAWSZE respektuj USP-MOMENT powyżej).\n"
        "• WYJĄTEK dla kąta 'demo': scene_vision to STUDYJNA wskazówka (rekwizyt/kolor/faktura tła obok produktu, max kilka słów, "
        "BEZ ludzi i BEZ pełnych scen wnętrz) — reklama demo ma być czysto studyjna (produkt-bohater na gradiencie), nie druga scena lifestyle.\n"
        "Dla kąta 'problem' dodatkowo:\n"
        "• pain_vision: 1 zdanie EN — scena frustracji/bólu BEZ produktu w kadrze.\n"
        "• fakt_checkmarki: 3 korzyści PL, każda ≤3 słowa.\n\n"
        "ZASADY UCZCIWOŚCI TWARDE (Meta 2026, decyzja Tomka): zero zmyślonych rabatów/starych cen/„-%%”, "
        "zero urgency/countdownów, zero „darmowej dostawy” (niepotwierdzona), zero gwiazdek/opinii/liczb w copy, "
        "zero personal attributes (headline bezosobowo), zero obietnic medycznych, zero opisu wyglądu produktu w scene_vision. "
        "Callouty i copy TYLKO z realnych faktów produktu.\n\n"
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


def call_copy(bundle, angles):
    secret = ENV.get("WF2_GEN_SECRET")
    if not secret:
        raise SystemExit("brak WF2_GEN_SECRET w .env (potrzebny do wf2-gpt)")
    prompt = build_copy_prompt(bundle, angles)
    payload = {
        "model": "gpt-5.6-sol",
        "input": [{"role": "user", "content": [{"type": "input_text", "text": prompt}]}],
        "max_output_tokens": 4000,
        "reasoning": {"effort": "high"},          # kreatywne = high (mapa fabryki)
    }
    r = requests.post(WF2GPT, data=json.dumps(payload).encode("utf-8"),
                      headers={"Content-Type": "application/json", "x-wf2-secret": secret}, timeout=600)
    if r.status_code >= 300:
        raise SystemExit("wf2-gpt %s: %s" % (r.status_code, r.text[:300]))
    text = (r.json() or {}).get("text", "")
    data = tolerant_json(text)
    if not isinstance(data, dict):
        raise SystemExit("wf2-gpt nie zwrócił poprawnego JSON copy: " + (text or "")[:300])
    return data, prompt


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


def gen_nbpro_one(prompt, image_urls, tag):
    """Pojedyncza generacja nbpro (finisher / fallback). Zwraca bytes PNG."""
    fal = _fal()
    model = NBPRO_EDIT if image_urls else NBPRO_T2I
    payload = {"prompt": prompt, "aspect_ratio": "4:5", "resolution": "2K", "num_images": 1}
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
    "(c) Czy USP-MECHANIZM (pies SAM ściera pazury drapiąc po smakołyk w schowku) jest WIDOCZNY w kadrze?",
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


def publish(bundle, engine, out_dir, creatives, total_usd):
    """Rejestracja przez import panel-sync: storage → product_meta → creative_upsert →
    artifact_add → cost_add → step_update(agr_generacja→done)."""
    ps = _load_module("panel_sync", "panel-sync.py")
    p = bundle["product"]
    project = p["project_id"]
    product_id = p["id"]
    slug = str(p.get("slug") or product_id)

    new_by_angle = {}
    for cr in creatives:
        dest = "bud-assets/%s/ads/ad_%s_45.png" % (slug, cr["angle"])
        pub = ps.storage_upload(cr["path"], dest, bucket="attachments", upsert=True)
        cr["image_url"] = pub
        new_by_angle[cr["angle"]] = {
            "angle": cr["angle"], "format": "45", "headline": cr["headline"],
            "primary_text": cr["primary_text"], "badge": "", "image_url": pub, "approved": False,
        }
    # MERGE po angle: NIE nadpisuj całego blobu przy pojedynczym kącie — podmień przetworzone
    # kąty, zachowaj pozostałe (świeży GET, żeby nie zgubić równoległych zmian panelu).
    try:
        cur = rest_get("wf2_products", {"id": "eq." + product_id, "select": "ads_creatives"})
        existing = (cur[0].get("ads_creatives") if cur else None) or []
        if not isinstance(existing, list):
            existing = []
    except Exception:
        existing = []
    merged, seen = [], set()
    for a in existing:
        ang = a.get("angle") if isinstance(a, dict) else None
        if ang in new_by_angle:
            merged.append(new_by_angle[ang]); seen.add(ang)
        elif isinstance(a, dict):
            merged.append(a)
    for ang, item in new_by_angle.items():
        if ang not in seen:
            merged.append(item)
    ps.product_meta(product_id, {"ads_creatives": merged})
    log("ads_creatives MERGE: podmieniono %s, blob ma teraz %d kątów (%s)" %
        (sorted(new_by_angle), len(merged), ", ".join(x.get("angle", "?") for x in merged)))

    per_cost = round(total_usd / max(1, len(creatives)), 4)
    for cr in creatives:
        cslug = "%s-ad-%s-45" % (slug, cr["angle"])
        ps.creative_upsert(cslug, project_id=project, product_id=product_id, media_type="image",
                           angle=cr["angle"], format="45", ai_labeled=True, status="ready",
                           public_url=cr["image_url"], cost_usd=per_cost,
                           meta={"engine": "adforge-" + engine, "headline": cr["headline"]})
        ps.artifact_add(project, product_id, "agr_generacja", "ad_creative", cr["image_url"],
                        label="AD %s 45" % cr["angle"], meta={"angle": cr["angle"], "format": "45"})
    if total_usd > 0:                                              # recompose ($0) nie dokłada wierszy kosztu
        cost_kind = "fal" if engine == "nbpro" else "gpt-image"     # nbpro → fal (nie gpt-image)
        ps.cost_add(project, product_id, round(total_usd, 4), kind=cost_kind, step="agr_generacja",
                    stage=5, note="ad-forge %d kreacji (%s)" % (len(creatives), engine))
    ps.step_update(project, product_id, "agr_generacja", status="done",
                   note="ad-forge: %d kreacji (%s) · koszt ~$%.2f" % (len(creatives), engine, total_usd))
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
           regions_by_angle=None, state=None, run_finisher_pass=False):
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
        publish(bundle, engine, out_dir, creatives, total_usd)
    print("=" * 88)
    print("GOTOWE (%s) — %d kreacji (%s), koszt płatny ~$%.2f (~%.2f zł)" %
          (mode, len(creatives), engine, total_usd, total_usd * 4.0))
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
# Brief zaadaptowany z supabase/functions/wf2-ads/index.ts buildAdsInstruction (rev3):
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
        "states — reproduce this exact product with its exact geometry (drawer position, opening/compartment "
        "shape, proportions and thickness); do not redesign or invent variations. Keep its shape, colors, "
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

FD_ART = {
    "demo": (
        "ART DIRECTION — DEMO / ANATOMY (mechanism 'wow'): the product is the hero in a BRIGHT, warm, real "
        "home interior with soft natural daylight (NEVER a white studio, NEVER a dark night scene) — a dog "
        "CAUGHT MID-SCRATCH, working the board BY ITSELF: a front paw pressed and dragging on the black "
        "sandpaper toward the pulled-out treat drawer (NO human hand in frame). A big question headline sits "
        "across a clean calm area at the top. 2-3 short callout labels, each connected by ONE thin elegant "
        "line/dot to the exact product part it names. A small cash-on-delivery trust pill and a clear CTA "
        "button anchored at the bottom. Everything integrated, premium, un-cluttered."
    ),
    "problem": (
        "ART DIRECTION — PROBLEM / PRZED→PO (transformation, split-screen): a vertical 50/50 split. LEFT "
        "(PRZED): a desaturated, cool, tense documentary photo of a frustrated owner struggling to clip an "
        "anxious dog's nails — WITHOUT the product. RIGHT (PO): a bright, warm photo of the same kind of dog "
        "HAPPILY SCRATCHING the board BY ITSELF — a front paw dragging on the black sandpaper to reach the "
        "treats in the open drawer, NO human hand feeding it. A crisp thin divider between halves. A big "
        "transformation headline across the top. A muted 'PRZED' tag on the left, an accent 'PO' tag on the "
        "right. At the bottom: the real price block and a short CTA. Strong visual contrast between the two sides."
    ),
    "lifestyle": (
        "ART DIRECTION — LIFESTYLE / UGC (organic post): an authentic phone-style photo in warm golden-hour "
        "light in a real living room — the dog is CAUGHT MID-SCRATCH, working the board BY ITSELF: a front "
        "paw dragging on the black sandpaper to reach the treats in the open drawer, its gaze locked on the "
        "compartment. NO human in the frame, NO hand offering anything. It must look like a real customer's "
        "candid social post, NOT a studio ad: phone-style framing, slight imperfection, no stocky perfection. "
        "Minimal graphics: ONE small slightly-rotated hand-written sticker note with a curved arrow pointing "
        "at the scratching PAW / black surface, PLUS a second tiny hand-written annotation with a short arrow "
        "pointing at the open treat DRAWER, a small rounded 'za pobraniem' capsule in a corner, and the small "
        "brand logo. No banner bars, no big pills."
    ),
}
# USP-MOMENT (v7.1, twarda zasada Tomka „lifestyle za mało pokazuje USP; pies robi to SAM"): KAŻDY kadr,
# w którym pies używa produktu (scena DEMO/LIFESTYLE oraz połówka PO w PRZED/PO), MUSI złapać MECHANIZM
# W AKCJI — inaczej reklama nie sprzedaje USP. Dołączane do briefu każdego kąta w build_fulldesign.
FD_USP_MOMENT = (
    "\n\nUSP-MOMENT (MANDATORY — the single most important thing wherever the dog uses the product: the "
    "DEMO/LIFESTYLE scene, and the PO half of a before/after): capture the mechanism IN ACTION — the dog is "
    "ENERGETICALLY SCRATCHING the board BY ITSELF, at least one front paw pressed and DRAGGING across the "
    "BLACK sandpaper surface with claws visibly in contact, weight leaning into the scratch, its gaze locked "
    "on the pulled-out drawer. The drawer is AJAR with a few treats CLEARLY VISIBLE inside the light-wood "
    "compartment — this is WHY the dog scratches: it is working to reach the hidden treat. BANNED, never "
    "depict: a dog merely standing, sitting or sniffing passively; a human hand feeding, holding out or "
    "offering a treat; a treat pinched in fingers; an empty or closed drawer. A viewer must understand in "
    "HALF A SECOND that the DOG does this ITSELF — the self-service claw-grinding is the entire product."
)


def _fd_txt(s):
    return re.sub(r"\[\[|\]\]", "", str(s or "")).strip()


def build_fulldesign(angle, ca, b, palette, cena, has_logo, has_styl, n_product=1):
    """Zwraca (prompt, intended_texts). intended_texts = DOKŁADNE napisy PL do weryfikacji przez agenta.
    n_product = liczba kadrów produktu w image_urls (multi-ref: wygląd niesie N refów, nie słowo)."""
    brand = b.get("brand_name") or ""
    paleta = b.get("paleta") or ""
    fonty = b.get("fonty") or ""
    hook = _fd_txt(ca.get("hook_baner") or ca.get("headline") or "").upper()
    parts = [FD_HEADER, _fd_product_para(n_product)]

    logo_ref = ("The reference image right after the %d product photos" % n_product) if n_product > 1 else "The SECOND reference image"
    brand_line = "\n\nBRAND: %s." % (brand or "(no name — neutral, consistent branding; do NOT invent a name)")
    if has_logo:
        brand_line += (" %s is the brand LOGO — place it 1:1 (do NOT redraw its shape, "
                       "letters or colors) in ONE corner at 8-12%% of frame height, never centered." % logo_ref)
    if has_styl:
        brand_line += " The LAST reference image is the brand's visual STYLE-MASTER — keep mood and palette consistent with it."
    if paleta:
        brand_line += "\nBrand palette (use these colors): %s." % paleta
    if fonty:
        brand_line += "\nTypography vibe: %s (clean bold modern sans, Polish text)." % fonty
    parts.append(brand_line)
    parts.append("\n\n" + FD_ART.get(angle, FD_ART["lifestyle"]))
    parts.append(FD_USP_MOMENT)                                    # v7.1: mechanizm W AKCJI dla każdego kąta

    intended, lines = [], []

    def add(label, s):
        s = _fd_txt(s)
        if s:
            intended.append(s)
            lines.append('- %s: "%s"' % (label, s))

    if angle == "demo":
        add("Big headline (top)", hook)
        callouts = [c for c in (ca.get("callouts_demo") or []) if _fd_txt(c)][:3]
        hints = ["→ points to the treat drawer/compartment", "→ points to the black sandpaper scratch surface",
                 "→ points to the pull loop / drawer"]
        for i, c in enumerate(callouts):
            add("Callout label %d %s" % (i + 1, hints[i] if i < len(hints) else ""), _fd_txt(c).upper())
        add("Trust pill (bottom)", "PŁATNOŚĆ PRZY ODBIORZE")
        add("CTA button (bottom)", "ZAMÓW ZA POBRANIEM")
    elif angle == "problem":
        add("Big transformation headline (top)", hook)
        add("Left tag (muted)", "PRZED")
        add("Right tag (accent)", "PO")
        if cena:
            add("Price (bottom-left, large)", cena)
            add("Under price (small)", "za pobraniem")
        add("CTA button (bottom-right)", "ZAMÓW")
    else:  # lifestyle
        add("Hand-written sticker note (arrow to the scratching PAW / black surface)", hook)
        mini = _fd_txt(ca.get("mini_adnotacja") or "")
        if mini:
            add("Tiny second annotation (short arrow to the open treat DRAWER)", mini)
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
              "same layout, background, dog, logo and ALL text/letters pixel-identical — change ONLY the "
              "product so its geometry matches the real references. Do not change anything else." % cecha)
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
    intended_by_angle, jobs = {}, []
    print("-" * 88)
    print("FULL-DESIGN PROMPTY + DOKŁADNE NAPISY (bramka tekstu) · MULTI-REF produktu = %d kadry:" % n_prod)
    for a in angles:
        ca = copy.get(a) or {}
        prompt, intended = build_fulldesign(a, ca, b, palette, cena, bool(refsd["logo_fal"]), bool(refsd["styl_fal"]), n_prod)
        intended_by_angle[a] = intended
        print("  ── KĄT %s ── napisy do wyrenderowania: %s" % (a.upper(), intended))
        for c in range(BEST_OF):
            jobs.append({"tag": "%s_c%d" % (a, c), "model": NBPRO_EDIT, "image_urls": image_urls, "prompt": prompt})
    got = gen_nbpro_batch(jobs, fd_dir)
    total_usd = NBPRO_USD * len(jobs)

    creatives = []
    cand_by_angle = {}
    for a in angles:
        ca = copy.get(a) or {}
        cand_paths = [got.get("%s_c%d" % (a, c)) for c in range(BEST_OF)]
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
    print("-" * 88)
    print_click_gate(angles, state.get("klik_verdicts"))
    if state.get("karta"):
        print("KARTA PRODUKTU (%s): %d cech" % (state["karta"].get("produkt", "?"), len(state["karta"].get("cechy", []))))
    if added > 0:
        print("Koszt operacji tej rundy: ~$%.2f (fixy/regeny)" % added)

    if not args.finalize:
        print("-" * 88)
        print("[--finalize pominięte] Nie publikuję. Po weryfikacji uruchom z --finalize.")
        print("out=%s" % out_dir)
        return 0

    creatives = [{"angle": a, "path": os.path.join(out_dir, "ad_%s_45.png" % a),
                  "headline": ((copy.get(a) or {}).get("hook_baner") or (copy.get(a) or {}).get("headline") or ""),
                  "primary_text": (copy.get(a) or {}).get("primary_text") or ""} for a in angles]
    return finish(args, bundle, "nbpro", out_dir, creatives, total_usd, mode="fulldesign-finalize",
                  regions_by_angle={}, state=state, run_finisher_pass=False)


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

    # ── BRAMKA WIERNOŚCI (post-generacja): --finalize / --fix / --regen / --pick ──
    # Wznawia ze stanu; publikacja PO przejściu checklisty wierności + ciągłości (agent na kompozytach).
    if args.finalize or args.fix or args.regen or args.pick:
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
        description="Tor statycznych grafik reklamowych 4:5 (gpt-image-2 / gemini) bez Manusa.")
    ap.add_argument("product_id", help="UUID produktu wf2_products")
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
    return ap


def main(argv=None):
    args = build_argparser().parse_args(argv)
    return run(args)


if __name__ == "__main__":
    sys.exit(main())
