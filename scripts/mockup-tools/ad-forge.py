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

CLI:
  python ad-forge.py <product_id> [--angles demo,problem,lifestyle] [--engine gptimage|gemini]
    [--out DIR] [--dry] [--no-register] [--quality high|medium]
  --dry: pobierz dane+refy, zbuduj prompty i copy, wypisz plan — BEZ generacji i BEZ rejestracji.

Uruchamiać venv: scripts/mockup-tools/.venv/Scripts/python.exe
"""
import os
import sys
import io
import re
import json
import time
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
    "details; it is the single source of truth for the product. Change ONLY the scene."
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
                '  "problem": {"headline":"2-4 słowa PL WERSALIKI-friendly","subline":"≤6 słów PL lub \\"\\"",'
                '"primary_text":"2-3 zdania PL, INNE otwarcie niż reszta","scene_vision":"1 zdanie EN — scena FAKTU z produktem",'
                '"pain_vision":"1 zdanie EN — scena bólu BEZ produktu","fakt_checkmarki":["≤3 słowa PL","≤3 słowa PL","≤3 słowa PL"]}')
        elif a == "demo":
            schema_lines.append(
                '  "demo": {"headline":"2-4 słowa PL WERSALIKI-friendly","subline":"≤6 słów PL lub \\"\\"",'
                '"primary_text":"2-3 zdania PL, INNE otwarcie niż reszta","scene_vision":"STUDYJNA wskazówka EN, max kilka słów — '
                'tylko rekwizyt/kolor/faktura tła obok produktu, BEZ ludzi i BEZ scen wnętrz (np. \\"a few dog treats scattered beside the board\\")"}')
        else:
            schema_lines.append(
                '  "%s": {"headline":"2-4 słowa PL WERSALIKI-friendly","subline":"≤6 słów PL lub \\"\\"",'
                '"primary_text":"2-3 zdania PL, INNE otwarcie niż reszta","scene_vision":"1 zdanie EN — konkretna wizja sceny dla TEGO produktu/persony (gdzie leży, co wokół, pora dnia)"}' % a)
    schema = "{\n" + ",\n".join(schema_lines) + "\n}"

    return (
        "Jesteś marketerem DTC na rynek polski. Piszesz copy + wizje scen do statycznych reklam FB/IG "
        "dla jednoproduktowego sklepu (dropshipping → własna marka, płatność przy odbiorze).\n\n"
        "PRODUKT / BRIEF MARKI:\n"
        "- Produkt: %s\n- Marka: %s\n- Kategoria: %s\n- Dla kogo: %s\n- Kąt / obietnica: %s\n- Ton marki: %s\n- Hooki klienta: %s%s\n\n"
        "Opieraj się na FAKTACH z tytułu aukcji i opisów kadrów — nie zgaduj kategorii produktu z nazwy marki.\n\n"
        "ZADANIE — dla kątów: %s.\n"
        "Dla każdego kąta:\n"
        "• headline: 2-4 słowa PL, JEDNA obietnica, dobrze wygląda WERSALIKAMI (diakrytyki OK).\n"
        "• subline: opcjonalny, ≤6 słów PL (pusty string gdy zbędny).\n"
        "• primary_text: 2-3 zdania PL, hak w 1. zdaniu, lekkie CTA; KAŻDY kąt zaczyna się INNYM zdaniem.\n"
        "• scene_vision: 1 zdanie EN — konkretna wizja sceny dla TEGO produktu i persony (opisuj SCENĘ/otoczenie/światło/porę dnia, "
        "NIGDY wyglądu produktu — produkt niesie referencja).\n"
        "• WYJĄTEK dla kąta 'demo': scene_vision to STUDYJNA wskazówka (rekwizyt/kolor/faktura tła obok produktu, max kilka słów, "
        "BEZ ludzi i BEZ pełnych scen wnętrz) — reklama demo ma być czysto studyjna (produkt-bohater na gradiencie), nie druga scena lifestyle.\n"
        "Dla kąta 'problem' dodatkowo:\n"
        "• pain_vision: 1 zdanie EN — scena frustracji/bólu BEZ produktu w kadrze.\n"
        "• fakt_checkmarki: 3 korzyści PL, każda ≤3 słowa.\n\n"
        "ZASADY UCZCIWOŚCI (Meta 2026): zero liczb/cen/gwiazdek, zero personal attributes (nie oskarżaj odbiorcy "
        "— headline bezosobowo), zero obietnic medycznych, zero opisu wyglądu produktu w scene_vision.\n\n"
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
def build_scene_prompt(kind, copy_angle):
    """Zwraca (prompt, with_product) dla danej sceny."""
    if kind == "pain":
        pv = str(copy_angle.get("pain_vision") or "").strip()
        return PAIN.replace("{pain_vision}", pv), False
    sv = str(copy_angle.get("scene_vision") or "").strip()
    tpl = {"hero": HERO_DEMO, "fakt": FAKT, "ugc": LIFESTYLE}[kind]
    scene = tpl.replace("{scene_vision}", sv)
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
    Image, ImageDraw, _, ImageFilter, _ = _pil()
    off = max(2, int(canvas_h * 0.004))
    shadow = Image.new("RGBA", base_rgba.size, (0, 0, 0, 0))
    ds = ImageDraw.Draw(shadow)
    ds.text((xy[0] + off, xy[1] + off), text, font=font, fill=(0, 0, 0, 90), anchor=anchor, stroke_width=0)
    shadow = shadow.filter(ImageFilter.GaussianBlur(off))
    base_rgba.alpha_composite(shadow)
    dd = ImageDraw.Draw(base_rgba)
    dd.text(xy, text, font=font, fill=fill + (255,) if len(fill) == 3 else fill, anchor=anchor, stroke_width=0)


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
    return desc


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


def compose_demo(scene_img, headline, subline, logo_img, palette, out_path):
    Image, ImageDraw, _, _, _ = _pil()
    canvas = _rgba_canvas(scene_img)
    W, H = canvas.size
    draw = ImageDraw.Draw(canvas)
    max_w = int(W * 0.86)
    zone = (int(W * 0.07), int(H * 0.04), int(W * 0.93), int(H * 0.30))   # górna strefa negatywna
    zone_rgb = zone_avg_rgb(scene_img, zone)
    fill = pick_text_fill(zone_rgb, palette)
    hl = (headline or "").upper()
    if hl:
        font, lines, line_h = fit_headline(draw, hl, resolve_font_path_glob, max_w, int(H * 0.20))
        y = int(H * 0.06)
        for ln in lines:
            draw_text_shadow(canvas, (W // 2, y), ln, font, fill, anchor="ma", canvas_h=H)
            y += int(line_h * 1.14)
        if subline:
            sf = _font(resolve_font_path_glob, max(28, int(H * 0.026)))
            draw_text_shadow(canvas, (W // 2, y + int(H * 0.01)), subline.upper(), sf, fill, anchor="ma", canvas_h=H)
    place_logo(canvas, logo_img, 0.09)
    canvas.convert("RGB").save(out_path, "PNG")


def _draw_check(draw, x, y, size, color):
    """Wektorowy ptaszek ✓ (bez zależności od glifu fontu)."""
    w = max(3, int(size * 0.14))
    draw.line([(x, y + size * 0.55), (x + size * 0.35, y + size * 0.9)], fill=color, width=w)
    draw.line([(x + size * 0.35, y + size * 0.9), (x + size * 0.95, y + size * 0.12)], fill=color, width=w)


def compose_problem(pain_img, fakt_img, headline, checkmarki, marka, logo_img, palette, out_path):
    Image, ImageDraw, _, _, _ = _pil()
    W, H = FINAL_W, FINAL_H
    bar_h = int(H * 0.13)
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    panel_h = H - bar_h
    half = W // 2
    pain_panel = cover_fit(desaturate(pain_img, 0.20), half, panel_h)
    fakt_panel = cover_fit(fakt_img.convert("RGB"), W - half, panel_h)
    canvas.alpha_composite(pain_panel.convert("RGBA"), (0, bar_h))
    canvas.alpha_composite(fakt_panel.convert("RGBA"), (half, bar_h))
    draw = ImageDraw.Draw(canvas)
    # pas tytułowy
    draw.rectangle([0, 0, W, bar_h], fill=DARK_BAR + (255,))
    # akcent = drugi kolor palety (pierwszy to zwykle ciemny primary); brak → domyślny pomarańcz
    orange = palette[1] if len(palette) > 1 else ORANGE_LABEL
    # LOGO na pasie tytułowym (prawy róg) — NIGDY na panelu PAIN; zwraca lewą krawędź do zawężenia headline
    logo_x = place_logo_titlebar(canvas, logo_img, bar_h)
    hl = (headline or "").upper()
    if hl:
        left_m = int(W * 0.04)
        head_right = (logo_x - int(W * 0.02)) if logo_img is not None else (W - left_m)
        head_cx = (left_m + head_right) // 2
        head_max_w = max(int(W * 0.30), head_right - left_m)
        font, lines, line_h = fit_headline(draw, hl, resolve_font_path_glob, head_max_w, int(bar_h * 0.74), max_lines=2)
        y = (bar_h - line_h * len(lines) * 1.1) / 2
        for ln in lines:
            draw_text_shadow(canvas, (head_cx, int(y)), ln, font, CREAM, anchor="ma", canvas_h=H)
            y += line_h * 1.1
    # etykiety-pigułki nad panelami (tuż pod pasem)
    lf = _font(resolve_font_path_glob, max(26, int(H * 0.024)))
    _pill_label(canvas, draw, "STARY SPOSÓB", lf, GRAY_LABEL, (half // 2, bar_h + int(H * 0.03)))
    _pill_label(canvas, draw, (marka or "TERAZ").upper(), lf, orange, (half + (W - half) // 2, bar_h + int(H * 0.03)))
    # 3 checkmarki na panelu FAKT (dół)
    cf = _font(resolve_font_path_glob, max(24, int(H * 0.022)))
    cx = half + int(W * 0.03)
    cy = H - int(H * 0.20)
    for txt in (checkmarki or [])[:3]:
        sz = int(H * 0.026)
        pill = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        pd = ImageDraw.Draw(pill)
        tw = pd.textlength(txt.upper(), font=cf)
        pd.rounded_rectangle([cx - int(sz * 0.5), cy - int(sz * 0.3), cx + sz * 1.4 + tw + int(sz * 0.5), cy + sz * 1.3],
                             radius=int(sz * 0.7), fill=(255, 255, 255, 150))
        canvas.alpha_composite(pill)
        d2 = ImageDraw.Draw(canvas)
        _draw_check(d2, cx, cy, sz, orange + (255,))
        d2.text((cx + sz * 1.4, cy + sz * 0.5), txt.upper(), font=cf, fill=DARK_BAR + (255,), anchor="lm")
        cy += int(H * 0.055)
    # logo już umieszczone na pasie tytułowym (NIE na panelu PAIN)
    canvas.convert("RGB").save(out_path, "PNG")


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


def compose_lifestyle(scene_img, logo_img, palette, out_path):
    canvas = _rgba_canvas(scene_img)
    # BEZ tekstu (default); mała pigułka (≤6.5% wys.), preferuj jasny róg, góra wolna → fallback na górę
    place_logo(canvas, logo_img, 0.07, allow_top=True, pill_frac=0.065)
    canvas.convert("RGB").save(out_path, "PNG")


# Globalny uchwyt na ścieżkę fontu (ustawiany w run() po odczycie brandingu).
resolve_font_path_glob = FALLBACK_FONT


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
        ps.cost_add(project, product_id, round(total_usd, 4), kind="gpt-image", step="agr_generacja",
                    stage=5, note="ad-forge %d kreacji (%s)" % (len(creatives), engine))
    ps.step_update(project, product_id, "agr_generacja", status="done",
                   note="ad-forge: %d kreacji (%s) · koszt ~$%.2f" % (len(creatives), engine, total_usd))
    return merged


# ── kompozycja wszystkich kątów + finisz (współdzielone: generacja i --recompose) ──
def compose_all(angles, copy, scene_imgs, out_dir, brand_name, logo_img, palette):
    creatives = []
    for a in angles:
        ca = copy.get(a) or {}
        out_path = os.path.join(out_dir, "ad_%s_45.png" % a)
        if a == "demo":
            compose_demo(scene_imgs[(a, "hero")], ca.get("headline") or "", ca.get("subline") or "",
                         logo_img, palette, out_path)
        elif a == "problem":
            compose_problem(scene_imgs[(a, "pain")], scene_imgs[(a, "fakt")], ca.get("headline") or "",
                            ca.get("fakt_checkmarki") or [], brand_name, logo_img, palette, out_path)
        elif a == "lifestyle":
            compose_lifestyle(scene_imgs[(a, "ugc")], logo_img, palette, out_path)
        creatives.append({"angle": a, "path": out_path, "headline": ca.get("headline") or "",
                          "primary_text": ca.get("primary_text") or ""})
        log("Kompozycja gotowa: %s" % out_path)
    return creatives


def finish(args, bundle, engine, out_dir, creatives, total_usd, mode="gen"):
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
    print("GOTOWE (%s) — %d kreacji (%s), koszt płatny ~$%.2f" % (mode, len(creatives), engine, total_usd))
    for cr in creatives:
        print("  • %-10s %s  | headline: %s" % (cr["angle"], cr["path"], cr["headline"]))
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
# ORKIESTRACJA.
# ══════════════════════════════════════════════════════════════════════════════
def do_recompose(args, bundle, out_dir, palette, logo_img, angles):
    """Rekompozycja z zapisanych surowych scen (out/sceny/) — crop/kompozycja/publikacja, $0."""
    b = bundle["branding"]
    sceny = os.path.join(out_dir, "sceny")
    state_path = os.path.join(out_dir, "adforge-state.json")
    if not os.path.isfile(state_path):
        raise SystemExit("--recompose: brak %s — poprzednia generacja nie zapisała scen (uruchom pełną generację raz)." % state_path)
    state = json.loads(io.open(state_path, encoding="utf-8").read())
    engine = state.get("engine", args.engine)
    copy = state.get("copy") or {}
    print("-" * 88)
    log("RECOMPOSE z %s (engine=%s) — kąty=%s" % (sceny, engine, angles))
    scene_imgs = {}
    for a in angles:
        for kind, ang in scenes_for_angle(a):
            hit = None
            for ext in ("png", "webp", "jpg", "jpeg", "avif"):
                cand = os.path.join(sceny, "scene_%s_%s.%s" % (a, kind, ext))
                if os.path.isfile(cand):
                    hit = cand
                    break
            if not hit:
                raise SystemExit("--recompose: brak zapisanej sceny scene_%s_%s.* w %s (wygeneruj kąt '%s' raz)." % (a, kind, sceny, a))
            blob = io.open(hit, "rb").read()
            scene_imgs[(a, kind)] = scene_to_final(blob, engine)
            log("  scena %s/%s ← %s" % (a, kind, os.path.basename(hit)))
    creatives = compose_all(angles, copy, scene_imgs, out_dir, b["brand_name"], logo_img, palette)
    return finish(args, bundle, engine, out_dir, creatives, 0.0, mode="recompose")


def run(args):
    global resolve_font_path_glob
    pid = args.product_id.strip()
    if not UUID_RE.match(pid):
        raise SystemExit("product_id musi być UUID: %s" % pid)
    angles = [a.strip().lower() for a in args.angles.split(",") if a.strip()]
    angles = [a for a in angles if a in ALLOWED_ANGLES] or DEFAULT_ANGLES

    log("Produkt %s · kąty=%s · engine=%s · quality=%s%s" %
        (pid, angles, args.engine, args.quality, "  [DRY]" if args.dry else ""))
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
    packshots = [r["url"] for r in product_refs][:2]              # max 2 najlepsze packshoty
    print("Packshoty do generacji (max 2): %s" % packshots)
    print("Tytuł aukcji (dezambiguacja, source=detail): %s" % (bundle.get("snap_title") or "BRAK"))
    print("Opisy kadrów (alt_pl keep, max 3): %s" % (bundle.get("alt_texts") or "BRAK"))

    logo_img = load_logo(logo_url, refs_dir)

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
        print("     headline : %s" % ca.get("headline"))
        print("     subline  : %s" % (ca.get("subline") or "(brak)"))
        print("     primary  : %s" % ca.get("primary_text"))
        print("     scene_vis: %s" % ca.get("scene_vision"))
        if a == "problem":
            print("     pain_vis : %s" % ca.get("pain_vision"))
            print("     checkmark: %s" % ca.get("fakt_checkmarki"))

    # ── plan scen + prompty + prompt-lint ──
    print("-" * 88)
    print("PLAN SCEN + PROMPTY (kierunkowe, produkt = referencja):")
    plan = []
    for a in angles:
        ca = copy.get(a) or {}
        for kind, ang in scenes_for_angle(a):
            sp, with_product = build_scene_prompt(kind, ca)
            fp = full_prompt(sp, with_product, bool(styl_url) and with_product)
            probs = lint_scene(fp, with_product)
            plan.append({"angle": a, "kind": kind, "prompt": fp, "with_product": with_product})
            print("  • [%s/%s] produkt=%s  lint=%s" %
                  (a, kind, "TAK" if with_product else "NIE", "OK" if not probs else "FLAGI"))
            print("      %s" % fp.replace("\n\n", "  ⏎  "))
            for pr in probs:
                print("      ⚠ %s" % pr)

    if args.dry:
        print("-" * 88)
        print("[DRY] Zatrzymano PRZED generacją obrazów i rejestracją.")
        print("[DRY] Wygenerowano by: %s (× 1 obraz każda) → koszt szac. ~$%.2f" %
              ([pl["kind"] for pl in plan], ADFORGE_IMG_USD * len(plan)))
        print("[DRY] out=%s" % out_dir)
        return 0

    # ── generacja + format + kompozycja ──
    print("-" * 88)
    if styl_url:
        try:
            blob, ct = _download(styl_url)
            io.open(os.path.join(refs_dir, "styl-master." + _ct_ext(ct)), "wb").write(blob)
        except Exception as e:
            log("styl-master pobranie nieudane: %s" % e)
    for i, u in enumerate(packshots):
        try:
            pblob, pct = _download(u)
            io.open(os.path.join(refs_dir, "packshot-%d.%s" % (i, _ct_ext(pct))), "wb").write(pblob)
        except Exception as e:
            log("packshot %d pobranie nieudane: %s" % (i, e))

    sceny_dir = os.path.join(out_dir, "sceny")                     # surowe sceny do --recompose
    os.makedirs(sceny_dir, exist_ok=True)
    scene_imgs = {}                                                # (angle,kind) → RGB final
    total_usd = 0.0
    for pl in plan:
        a, kind, fp, wp = pl["angle"], pl["kind"], pl["prompt"], pl["with_product"]
        log("Generacja [%s/%s] engine=%s…" % (a, kind, args.engine))
        if args.engine == "gptimage":
            ref_urls = [("product", packshots[0])] if wp and packshots else []
            if wp and styl_url:
                ref_urls.append(("style", styl_url))
            blob = gen_gptimage(fp, ref_urls, args.quality)
            ext = "png"
        else:
            ref_objs = []
            if wp and packshots:
                ref_objs.append({"url": packshots[0], "type": "product"})
            if wp and styl_url:
                ref_objs.append({"url": styl_url, "type": "ref"})
            blob = gen_gemini(fp, ref_objs, slug, "%s-%s" % (a, kind))
            ext = "png"
        total_usd += ADFORGE_IMG_USD
        io.open(os.path.join(sceny_dir, "scene_%s_%s.%s" % (a, kind, ext)), "wb").write(blob)  # PRZED overlay
        scene_imgs[(a, kind)] = scene_to_final(blob, args.engine)

    # stan do --recompose (engine + copy + kąty) — zawsze świeży dla przetworzonych kątów;
    # MERGE copy po angle, żeby recompose innego kąta później miał komplet.
    state_path = os.path.join(out_dir, "adforge-state.json")
    prev = {}
    if os.path.isfile(state_path):
        try:
            prev = json.loads(io.open(state_path, encoding="utf-8").read())
        except Exception:
            prev = {}
    merged_copy = dict((prev.get("copy") or {}))
    for a in angles:
        merged_copy[a] = copy.get(a) or {}
    io.open(state_path, "w", encoding="utf-8").write(json.dumps(
        {"engine": args.engine, "quality": args.quality, "copy": merged_copy}, ensure_ascii=False, indent=1))

    creatives = compose_all(angles, copy, scene_imgs, out_dir, b["brand_name"], logo_img, palette)
    return 0 if finish(args, bundle, args.engine, out_dir, creatives, total_usd, mode="gen") is not None else 0


def build_argparser():
    ap = argparse.ArgumentParser(
        prog="ad-forge.py",
        description="Tor statycznych grafik reklamowych 4:5 (gpt-image-2 / gemini) bez Manusa.")
    ap.add_argument("product_id", help="UUID produktu wf2_products")
    ap.add_argument("--angles", default="demo,problem,lifestyle",
                    help="kąty po przecinku (demo,problem,lifestyle)")
    ap.add_argument("--engine", default="gptimage", choices=["gptimage", "gemini"],
                    help="silnik generacji (domyślnie gptimage = bezpośredni OpenAI)")
    ap.add_argument("--out", help="katalog wyjściowy (domyślnie C:\\tmp\\ad-forge\\<slug>)")
    ap.add_argument("--dry", action="store_true",
                    help="pobierz dane+refy, zbuduj prompty i copy, wypisz plan — bez generacji/rejestracji")
    ap.add_argument("--recompose", action="store_true",
                    help="użyj zapisanych surowych scen z out/sceny/ — tylko crop/kompozycja/publikacja, BEZ płatnej generacji")
    ap.add_argument("--no-register", action="store_true", help="nie rejestruj w panelu (tylko pliki lokalne)")
    ap.add_argument("--quality", default="high", choices=["high", "medium"], help="jakość gpt-image-2")
    return ap


def main(argv=None):
    args = build_argparser().parse_args(argv)
    return run(args)


if __name__ == "__main__":
    sys.exit(main())
