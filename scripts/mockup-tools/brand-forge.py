# -*- coding: utf-8 -*-
"""
brand-forge.py — pipeline logo+favicon+wordmark fabryki landingow (F2.5 BRANDING).
SSOT: docs/zbuduje/STANDARD-LANDING-SKLEPY.md (F0 rejestr nazw, F2.5 branding, 7e).

Kroki (R3 — po audycie 19.07: diversity-first, natywna alfa, HIGH lokalnie):
  (a) REZERWACJA nazwy: mini-marka -> bud_brand_names (INSERT-or-fail; kolizja => exit 3);
      parasol -> claim wf2_projects.name (--project-id; kolizja z innym projektem => exit 3).
      Rezerwacja PRZED generacja (reserve-before-generate — nie palimy kasy przy kolizji).
  (b) GENERACJA kandydatow: DIVERSITY-FIRST — K roznych metafor (--metafory "a;b;c")
      x ceil(count/K) wariantow kazda (fixation-guard: N klonow 1 metafory = lokalne optimum).
      Kanal domyslny: LOKALNY OpenAI /v1/images/generations (OPENAI_API_KEY z .env),
      quality HIGH + background transparent (bez limitu wall-clock edge; STANDARD: favicon=high).
      Fallback: edge wf2-gen (quality medium — wall-clock). Favicon NIGDY nie dostaje
      referencji styl-mastera (styl-master = referencja MAKIET; /edits ze scena = bleed tla).
  (c) SELEKTOR skryptowy @32px (n_kolorow / gestosc krawedzi / kontrast / brak-tekstu OCR /
      margines-wypelnienie / bleed tla) -> ranking + odrzuty twarde; top-2 z ROZNYCH konceptow.
  (d) ALFA: natywna z modelu gdy jest; inaczej tlo->alpha z PROBKI ROGOW (nie zalozona biel)
      + DEFRINGE (bez niego jasna obwodka na ciemnym tle checkoutu). Eksport 512/256/32/16
      (dosharpowanie po KAZDYM downscalu) + favicon-mono.
  (e) WORDMARK z pliku fontu (guard glifow: brak znaku nazwy w cmap = twardy STOP; polskie
      diakrytyki bez pokrycia = WARN) -> wordmark.png + wordmark-dark.png; logo-combo.png
      + logo-combo-dark.png (skala znaku do wysokosci glifow — korekta optyczna).
  (f) DOWOD: brand-context.png (favicon @16/32/64 na jasnym I ciemnym + lockupy na tlach)
      — do wgrania w wf2_artifacts jako kompozyt kontekstowy.
  (g) UPLOAD do Storage bucket `attachments`, prefix bud-assets/<slug>/brand/ (x-upsert)
      + brand.json (SSOT: nazwa/paleta/font/pliki).
  Werdykt vision top-2 zostaje nadzorcy — skrypt wypisuje sciezki top-2 + RUBRYKE pytan.

Zaleznosci: Pillow, numpy, pytesseract (OCR opcjonalny — degraduje do heurystyki).
Uruchamiac przez venv: scripts/mockup-tools/.venv/Scripts/python.exe

  --dry-run : walidacja parametrow + sprawdzenie rezerwacji (GET, bez zapisu) — nic nie generuje.

TRYB PARASOLOWY (marka parasolowa sklepu, krok 'marka' w TN Sklepy): pominac
--product-id i --styl-master => rezerwacja nazwy przez wf2_projects (--project-id),
generacja BEZ referencji. Konwencja slug: 'parasol-<slug>'
(upload -> bud-assets/parasol-<slug>/brand/).
"""
import sys, os, io, re, json, time, base64, argparse, urllib.request, urllib.parse, math

# --- Sekrety / baza -----------------------------------------------------------
ENV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".env")
# bud_tt_products / bud_brand_names / wf2-gen zyja w projekcie tn-crm (jak genimg.py).
DEFAULT_URL = "https://yxmavwkwnfuphjqbelws.supabase.co"

def _env(name):
    try:
        txt = io.open(os.path.abspath(ENV_PATH), encoding="utf-8", errors="ignore").read()
    except Exception:
        return None
    m = re.search(r"^%s=(.+)$" % re.escape(name), txt, re.M)
    return m.group(1).strip() if m else None

def project_url():
    return (_env("SUPABASE_URL") or os.environ.get("SUPABASE_URL") or DEFAULT_URL).rstrip("/")

# --- lazy PIL/numpy -----------------------------------------------------------
def _pil():
    from PIL import Image, ImageFont, ImageDraw, ImageFilter, ImageOps
    return Image, ImageFont, ImageDraw, ImageFilter, ImageOps

# =============================================================================
# (a) REZERWACJA NAZWY
# =============================================================================
def _rest_headers(service_key, extra=None):
    h = {"apikey": service_key, "Authorization": "Bearer " + service_key,
         "Content-Type": "application/json"}
    if extra: h.update(extra)
    return h

def reservation_check(product_id, name, slug, service_key):
    """GET: czy nazwa/slug juz zajete dla tego produktu. Zwraca lista kolidujacych wierszy."""
    q = ("product_id=eq.%s&or=(name.ilike.%s,slug.eq.%s)&select=id,name,slug"
         % (urllib.parse.quote(product_id), urllib.parse.quote(name), urllib.parse.quote(slug)))
    url = "%s/rest/v1/bud_brand_names?%s" % (project_url(), q)
    req = urllib.request.Request(url, headers=_rest_headers(service_key))
    raw = urllib.request.urlopen(req, timeout=30).read()
    return json.loads(raw.decode("utf-8"))

def reserve_name(product_id, name, slug, service_key, landing_ref=None, user_ref=None):
    """INSERT-or-fail. Zwraca (True, row) przy sukcesie; (False, None) przy kolizji."""
    body = json.dumps({"product_id": product_id, "name": name, "slug": slug,
                       "landing_ref": landing_ref, "user_ref": user_ref}).encode("utf-8")
    url = "%s/rest/v1/bud_brand_names" % project_url()
    hdr = _rest_headers(service_key, {"Prefer": "return=representation,resolution=ignore-duplicates"})
    req = urllib.request.Request(url, data=body, headers=hdr, method="POST")
    try:
        raw = urllib.request.urlopen(req, timeout=30).read()
    except urllib.error.HTTPError as e:
        # 409: UNIQUE, ktorego `resolution=ignore-duplicates` nie pokrywa (inny conflict target
        # niz PK — np. UNIQUE(name) albo UNIQUE(slug)). To nadal KOLIZJA, nie awaria skryptu —
        # rozstrzyga ja wywolujacy przez reservation_check (czy to nasz wlasny, wczesniejszy wpis).
        if e.code == 409:
            return False, None
        raise
    rows = json.loads(raw.decode("utf-8") or "[]")
    if not rows:   # ON CONFLICT DO NOTHING -> 0 wierszy = kolizja
        return False, None
    return True, rows[0]

def parasol_name_check(project_id, name, service_key):
    """Parasol: czy INNY projekt ma juz te nazwe (wf2_projects.name, case-insensitive)."""
    q = "name=ilike.%s&select=id,name,customer_name" % urllib.parse.quote(name)
    url = "%s/rest/v1/wf2_projects?%s" % (project_url(), q)
    req = urllib.request.Request(url, headers=_rest_headers(service_key))
    rows = json.loads(urllib.request.urlopen(req, timeout=30).read().decode("utf-8"))
    return [r for r in rows if r.get("id") != project_id]

def parasol_claim(project_id, name, service_key):
    """Reserve-before-generate: zapisz nazwe na projekcie PRZED wydaniem kasy na generacje."""
    url = "%s/rest/v1/wf2_projects?id=eq.%s" % (project_url(), urllib.parse.quote(project_id))
    body = json.dumps({"name": name}).encode("utf-8")
    hdr = _rest_headers(service_key, {"Prefer": "return=representation"})
    req = urllib.request.Request(url, data=body, headers=hdr, method="PATCH")
    rows = json.loads(urllib.request.urlopen(req, timeout=30).read().decode("utf-8") or "[]")
    return bool(rows)

# =============================================================================
# (b) GENERACJA FAVICONOW — PROMPT = WIZJA I CHARAKTER, NIE SPIS DETALI
# -----------------------------------------------------------------------------
# ESENCJA RESEARCHU (gpt-image-2 / „image 2.0", 2025-2026) — czytaj PRZED zmiana promptu.
# Zrodla: OpenAI cookbook „GPT Image prompting guide" (developers.openai.com), fal.ai
# „Prompting GPT Image 2", DesignRush „Logo design prompts 2026", image2.ing brand guide.
#  1. gpt-image-2 rozumie INTENCJE — brief jak dla dyrektora artystycznego bije stackowanie
#     slow-kluczy. „modern minimalist logo" usrednia wszystkie loga swiata => clipart.
#  2. Prowadz CHARAKTEREM marki i zastosowaniem, NIE wyliczaniem ksztaltow. Mikro-spec
#     („2-3 prymitywy: kolo/luk/linia; grube rowne kreski; BOLD SOLID FILLED") ODBIERA
#     modelowi swobode i produkuje sztywna, clipartowa ikone — dokladnie to zepsulo
#     pierwszy znak Zaradka (doslowny „splatany wezel + strzalka", muli sie @32px,
#     granatowy element ginie na ciemnym UI).
#  3. Metafora = KIERUNEK do INTERPRETACJI, nie przedmiot do narysowania doslownie
#     („a single rope knot" => model rysuje splatany wezel). Podajemy idee i prosimy
#     o designerska interpretacje („brand mark, jaki wypusciloby prawdziwe studio").
#  4. Ograniczaj DOSC, by nie dryfowac w generyk, ale formuluj POZYTYWNIE (co MA byc) —
#     litania zakazow to sam szum. Twarde wymogi TECHNICZNE zostaja, bo trzyma je pipeline:
#     jedno jednolite jasne tlo (alfa z probki rogow + defringe), brak tekstu (OCR-guard +
#     rubryka #5), plaskie kolory bez gradientu/3D (mono-test #6, rubryka #4), czytelnosc
#     @32px, srodek + margines (guard fill 0.15-0.92 — export_favicons kadruje do bbox, wiec
#     surowy fill tylko odsiewa patologicznie male ikony; ranking preferuje 0.55-0.80).
#  5. „minimal/flat/modern" latwo laduje w „bezpiecznej strefie" modelu — kotwiczymy
#     KONKRETNYM charakterem marki zamiast pustych przymiotnikow; kolor pewny, czytelny
#     na jasnym I ciemnym UI (guard, ktory stary znak oblal).
# ZASADA NADRZEDNA: prompt = wizja i charakter, nie spis detali; image 2.0 dostaje swobode.
# =============================================================================
def favicon_prompt(nazwa, metafora, palette, charakter=None):
    """Vision-led brief (patrz ESENCJA RESEARCHU wyzej): prowadzimy charakterem marki i
    kierunkiem, oddajemy modelowi swobode FORMY; twarde wymogi techniczne zostaja, bo
    trzyma je pipeline (alfa z jednolitego tla + defringe, mono-test, favicon @16/32).
    `charakter` = krotki opis osobowosci marki (opcjonalny --charakter); gdy brak,
    brief i tak prowadzi kierunkiem, nie mikro-specem."""
    cols = ", ".join(palette[:3]) if palette else "the brand's palette"
    charakter = (charakter or "").strip()
    charakter_zd = (" Brand character: %s." % charakter) if charakter else ""
    return (
        "Design a single, original, professional brand symbol (app icon / favicon) for "
        "the brand \"%s\".%s "
        "Creative direction — evoke it, do NOT illustrate it literally: %s. "
        "Interpret it the way a senior identity designer would: one clear, memorable idea, "
        "a confident geometric mark with a strong silhouette and smart negative space — "
        "the kind of mark a real studio would ship, not a stock clip-art icon. "
        "Flat vector look, solid flat fills, one or two colours drawn from %s; choose a "
        "confident colour that stays legible on BOTH light and dark UI (avoid an "
        "all-near-black mark that disappears on dark backgrounds). "
        "It must read cleanly at 32px and still hold up in one flat colour. "
        "Centred, with a generous even margin, on one plain, uniform, near-white background "
        "(no scene, no backdrop, no texture). "
        "No lettering, no words, no gradient, no 3D, no shadow, no photo, no mockup frame."
        % (nazwa, charakter_zd, metafora, cols)
    )

def _save_candidates(items, outdir, tag):
    cand_dir = os.path.join(outdir, "kandydaci"); os.makedirs(cand_dir, exist_ok=True)
    paths = []
    for i, (data, url) in enumerate(items):
        p = os.path.join(cand_dir, "fav-%s%d.png" % (tag, i))
        open(p, "wb").write(data)
        paths.append({"i": "%s%d" % (tag, i), "path": p, "url": url})
    return paths

def gen_favicons_local(prompt, count, api_key, outdir, tag=""):
    """LOKALNY OpenAI /v1/images/generations. UWAGA: gpt-image-2 NIE wspiera
    background:transparent (potwierdzone 400 'not supported for this model') —
    generujemy na czystej bieli, alfa = extract_alpha (probka rogow + defringe).
    Favicon NIE dostaje referencji (styl-master = referencja MAKIET, nie znaku).
    ⚠️ INFRA (ssawek 23.07): quality HIGH gpt-image-2 trwa >100s/obraz i Cloudflare
    przed api.openai.com zwraca wtedy HTTP 520 (dokladnie klasa 'blipy OpenAI /
    transient resilience'). Dlatego: (1) domyslnie quality=medium (env
    BRAND_FORGE_QUALITY podbija do 'high', jesli infra pozwoli), (2) n=1 na request
    (krotsza generacja = pod limitem proxy), (3) retry transienta (520/timeout/5xx)."""
    quality = os.environ.get("BRAND_FORGE_QUALITY", "medium")
    items = []
    for k in range(max(1, count)):
        body = json.dumps({"model": "gpt-image-2", "prompt": prompt, "n": 1,
                           "size": "1024x1024", "quality": quality}).encode("utf-8")
        last = None
        for attempt in range(4):
            try:
                req = urllib.request.Request("https://api.openai.com/v1/images/generations",
                    data=body, headers={"Content-Type": "application/json",
                                        "Authorization": "Bearer " + api_key})
                raw = urllib.request.urlopen(req, timeout=300).read()
                j = json.loads(raw.decode("utf-8"))
                data = j.get("data") or []
                b64 = data[0].get("b64_json") if data else None
                if not b64:
                    raise RuntimeError("pusta odpowiedz: " + json.dumps(j)[:300])
                items.append((base64.b64decode(b64), None))
                last = None
                break
            except Exception as e:
                last = e
                code = getattr(e, "code", None)
                transient = code in (429, 500, 502, 503, 504, 520, 522, 524) or code is None
                if attempt < 3 and transient:
                    time.sleep(6 * (attempt + 1))
                    continue
                break
        if last is not None:
            print("   [gen] obraz %s%d nieudany po retry: %r" % (tag, k, last))
    if not items:
        raise SystemExit("OpenAI images: 0 kandydatow (quality=%s) — transient/limit" % quality)
    return _save_candidates(items, outdir, tag)

def gen_favicons(slug, prompt, count, wf2_secret, outdir, tag=""):
    """FALLBACK: edge wf2-gen (quality medium — wall-clock edge; bez referencji)."""
    payload = {"fn": "generate-image", "payload": {
        "prompt": prompt, "count": count, "workflow_id": "brand-" + slug,
        "type": "logo", "provider": "gpt-image-2", "quality": "medium",
        "aspect_ratio": "1:1",
    }}
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(project_url() + "/functions/v1/wf2-gen", data=body,
        headers={"Content-Type": "application/json", "x-wf2-secret": wf2_secret})
    raw = urllib.request.urlopen(req, timeout=600).read()
    j = json.loads(raw.decode("utf-8"))
    imgs = j.get("images") or []
    if not imgs:
        raise SystemExit("wf2-gen nie zwrocil obrazow: " + json.dumps(j)[:500])
    items = []
    for im in imgs:
        url = im.get("url")
        if not url: continue
        items.append((urllib.request.urlopen(url, timeout=180).read(), url))
    return _save_candidates(items, outdir, tag)

# =============================================================================
# (c/d) ALFA + SELEKTOR SKRYPTOWY @32px
# =============================================================================
def white_to_alpha(im):
    """Legacy fallback: biel -> alpha (progi 250/205). Uzywac TYLKO gdy probka rogow
    zawiedzie — preferowana sciezka to extract_alpha()."""
    Image, _, _, _, _ = _pil()
    import numpy as np
    rgb = im.convert("RGB")
    arr = np.asarray(rgb).astype(np.float32)
    mn = arr.min(axis=2)
    alpha = np.clip((250.0 - mn) * (255.0 / 45.0), 0, 255).astype("uint8")
    out = np.dstack([np.asarray(rgb).astype("uint8"), alpha])
    return Image.fromarray(out, "RGBA")

def has_native_alpha(im):
    if im.mode != "RGBA": return False
    import numpy as np
    a = np.asarray(im)[:, :, 3]
    return bool((a < 250).mean() > 0.02)

def corner_bg(im, frac=0.06):
    """Probka tla z 4 rogow. Zwraca (kolor RGB, tlo_jednolite_i_jasne)."""
    import numpy as np
    arr = np.asarray(im.convert("RGB")).astype(np.float32)
    h, w = arr.shape[:2]; k = max(4, int(min(h, w) * frac))
    tiles = [arr[:k, :k], arr[:k, -k:], arr[-k:, :k], arr[-k:, -k:]]
    means = np.array([t.reshape(-1, 3).mean(axis=0) for t in tiles])
    stds = np.array([t.reshape(-1, 3).std() for t in tiles])
    bg = means.mean(axis=0)
    uniform = bool(means.std(axis=0).max() < 12 and stds.max() < 10)
    return tuple(float(x) for x in bg), (uniform and bool(bg.min() > 200))

def extract_alpha(im):
    """(rgba, info): natywna alfa modelu, gdy jest; inaczej tlo->alpha z koloru
    PROBKI ROGOW (nie zalozonej bieli — kremowe tla robily halo/dziury) + DEFRINGE
    (unpremultiply: odjecie przymieszanego tla z pikseli polprzezroczystych; bez
    tego znak ma jasna obwodke na ciemnym tle). info['reject'] = tlo niejednolite
    lub ciemne (bleed sceny) — kandydat do twardego odrzutu."""
    Image = _pil()[0]
    import numpy as np
    if has_native_alpha(im):
        return im.convert("RGBA"), {"alpha": "native", "reject": None}
    bg, ok = corner_bg(im)
    if not ok:
        return white_to_alpha(im), {"alpha": "legacy-fallback", "reject": "tlo niejednolite/ciemne (bleed sceny?)"}
    rgb = np.asarray(im.convert("RGB")).astype(np.float32)
    bgv = np.array(bg, dtype=np.float32)
    dist = np.abs(rgb - bgv).max(axis=2)
    a = np.clip((dist - 6.0) * (255.0 / 40.0), 0, 255)
    af = (a / 255.0)[..., None]
    unp = np.where(af > 0.02,
                   np.clip((rgb - (1.0 - af) * bgv) / np.maximum(af, 0.02), 0, 255), rgb)
    out = np.dstack([unp.astype("uint8"), a.astype("uint8")])
    return Image.fromarray(out, "RGBA"), {"alpha": "bg-sampled+defringe", "reject": None}

def ocr_available():
    try:
        import pytesseract
        pytesseract.get_tesseract_version()
        return True
    except Exception:
        return False

def ocr_has_text(im):
    """True jesli OCR wykryje realny tekst. Degraduje do None gdy brak tesseract."""
    try:
        import pytesseract
        Image, _, _, _, ImageOps = _pil()
        g = im.convert("L").resize((256, 256))
        g = ImageOps.autocontrast(g)
        txt = pytesseract.image_to_string(g, config="--psm 11")
        letters = re.findall(r"[A-Za-z0-9]{2,}", txt)
        return len(letters) > 0
    except Exception:
        return None   # None = OCR niedostepny (heurystyka nizej)

def _flatten_white(rgba):
    Image = _pil()[0]
    base = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
    base.paste(rgba, (0, 0), rgba)
    return base.convert("RGB")

def score_candidate(path):
    """Metryki @32px + odrzuty twarde. Zwraca dict."""
    Image, _, _, ImageFilter, ImageOps = _pil()
    import numpy as np
    raw = Image.open(path)
    rgba, ainfo = extract_alpha(raw)
    im = _flatten_white(rgba)                      # metryki liczone na spójnym białym tle
    thumb = im.resize((32, 32), Image.LANCZOS)
    arr = np.asarray(thumb).astype(np.float32)
    q = thumb.quantize(colors=8, method=Image.FASTOCTREE)
    counts = sorted((q.getcolors(1024) or []), reverse=True)
    total = sum(c for c, _ in counts) or 1
    n_signif = sum(1 for c, _ in counts if c / total > 0.02)
    edges = np.asarray(thumb.convert("L").filter(ImageFilter.FIND_EDGES)).astype(np.float32)
    edge_density = float(edges.mean() / 255.0)
    lum = 0.2126 * arr[:, :, 0] + 0.7152 * arr[:, :, 1] + 0.0722 * arr[:, :, 2]
    contrast = float(lum.std() / 255.0)
    a = np.asarray(rgba)[:, :, 3]
    ys, xs = np.where(a > 40)
    if len(xs) == 0:
        fill = 0.0
    else:
        bw = (xs.max() - xs.min() + 1); bh = (ys.max() - ys.min() + 1)
        fill = (bw * bh) / float(a.shape[0] * a.shape[1])
    has_text = ocr_has_text(im)
    # test MONO: znak musi zyc sylwetka, nie kolorem (binaryzacja alfy @32)
    a32 = np.asarray(rgba.resize((32, 32), Image.LANCZOS))[:, :, 3]
    mono_fill = float((a32 > 96).mean())
    rejects = []
    if ainfo["reject"]: rejects.append(ainfo["reject"])
    if n_signif > 5: rejects.append("za duzo kolorow (%d>5)" % n_signif)
    if edge_density > 0.30: rejects.append("mush/za gesto krawedzi (%.2f)" % edge_density)
    if has_text is True: rejects.append("wykryto tekst (OCR)")
    # fill = pole bbox znaku / pole kadru SUROWEGO kandydata. export_favicons() i tak kadruje
    # do treści (getbbox + pad) przed resize do 512, więc surowy fill nie odzwierciedla finalnego
    # znaku. gpt-image konsekwentnie generuje ikonę ~0.19-0.28 kadru → próg 0.30 odrzucał WSZYSTKICH
    # i wymuszał ręczną finalizację co przebieg. Reject tylko dla patologicznie małych (<0.15 area
    # ≈ <360px bbox w kadrze 1024 = realny upscale/utrata jakości). Ranking (s_fill) dalej preferuje 0.55-0.80.
    if fill < 0.15: rejects.append("znak za maly (fill %.2f)" % fill)
    if fill > 0.92: rejects.append("brak marginesu (fill %.2f)" % fill)
    if mono_fill < 0.06: rejects.append("sylwetka znika w mono (%.2f)" % mono_fill)
    s_col = 1.0 - min(abs(n_signif - 3), 5) / 5.0
    s_edge = 1.0 - min(edge_density / 0.30, 1.0)
    s_contr = min(contrast / 0.30, 1.0)
    s_fill = 1.0 - min(abs(((max(min(fill, 0.80), 0.55)) - fill)) / 0.25, 1.0)
    s_text = 0.0 if has_text is True else (0.5 if has_text is None else 1.0)
    score = round(2.0*s_col + 1.5*s_edge + 1.0*s_contr + 1.5*s_fill + 1.2*s_text, 3)
    return {"path": path, "n_kolorow": n_signif, "edge_density": round(edge_density, 3),
            "kontrast": round(contrast, 3), "fill": round(fill, 3), "mono_fill": round(mono_fill, 3),
            "alpha": ainfo["alpha"], "ocr_text": has_text, "odrzuty": rejects,
            "odrzucony": bool(rejects), "score": score}

# =============================================================================
# (d) EKSPORT FAVICON master 512 + 256 + 32 + 16 + mono
# =============================================================================
def _recolor(rgba, hexcolor):
    Image = _pil()[0]
    import numpy as np
    c = hexcolor.lstrip("#")
    if len(c) == 3: c = "".join(ch*2 for ch in c)
    r, g, b = int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16)
    arr = np.asarray(rgba.convert("RGBA")).copy()
    arr[:, :, 0] = r; arr[:, :, 1] = g; arr[:, :, 2] = b
    return Image.fromarray(arr, "RGBA")

def export_favicons(best_path, outdir, ink="#111111"):
    Image, _, _, ImageFilter, _ = _pil()
    rgba, _info = extract_alpha(Image.open(best_path))
    a = rgba.split()[3]
    bbox = a.getbbox()
    if bbox:
        pad = int(max(rgba.size) * 0.06)
        x0 = max(0, bbox[0]-pad); y0 = max(0, bbox[1]-pad)
        x1 = min(rgba.size[0], bbox[2]+pad); y1 = min(rgba.size[1], bbox[3]+pad)
        rgba = rgba.crop((x0, y0, x1, y1))
    side = max(rgba.size)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(rgba, ((side-rgba.size[0])//2, (side-rgba.size[1])//2), rgba)
    m512 = canvas.resize((512, 512), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.2, percent=90))
    out = {}
    for size, nm in ((512, "favicon-512.png"), (256, "favicon-256.png"),
                     (32, "favicon-32.png"), (16, "favicon-16.png")):
        p = os.path.join(outdir, nm)
        img = m512.resize((size, size), Image.LANCZOS)
        if size <= 64:   # dosharpowanie PO downscalu — resize re-zmiekczal 32/16
            img = img.filter(ImageFilter.UnsharpMask(radius=0.6, percent=130, threshold=0))
        img.save(p)
        out[nm] = p
    p_mono = os.path.join(outdir, "favicon-mono.png")
    _recolor(m512, ink).save(p_mono)
    out["favicon-mono.png"] = p_mono
    return out, m512

# =============================================================================
# (e) WORDMARK z fontu + logo-combo (guard glifow + korekta optyczna)
# =============================================================================
PL_DIACRITICS = "ąćęłńóśźżĄĆĘŁŃÓŚŹŻ"

def _missing_glyphs(font, text):
    """Znaki bez glifu w foncie (render identyczny z .notdef / pusty)."""
    def mask_bytes(ch):
        try:
            m = font.getmask(ch, mode="L")
            return bytes(m) if m.size[0] and m.size[1] else b""
        except Exception:
            return None
    try:
        ref = mask_bytes("͸")   # nieprzydzielony kodepunkt => bitmapa .notdef
    except Exception:
        ref = None
    miss = []
    for ch in dict.fromkeys(text):   # unikaty, zachowana kolejnosc
        if ch.isspace(): continue
        b = mask_bytes(ch)
        if b is None or b == b"" or (ref not in (None, b"") and b == ref):
            miss.append(ch)
    return miss

def render_wordmark(nazwa, font_path, palette, outdir, color=None, fname="wordmark.png"):
    Image, ImageFont, ImageDraw, _, _ = _pil()
    color = color or (palette[0] if palette else "#111111")
    px = 220
    try:
        font = ImageFont.truetype(font_path, px)
    except Exception as e:
        raise SystemExit("Nie wczytano fontu '%s' (%s). Uzyj pliku .ttf/.otf (woff2 bywa "
                         "nieobslugiwany przez FreeType w Pillow)." % (font_path, e))
    miss = _missing_glyphs(font, nazwa)
    if miss:
        raise SystemExit("Font '%s' NIE MA glifow dla: %s — wordmark bylby tofu. "
                         "Uzyj kroju z latin-ext." % (os.path.basename(font_path), " ".join(miss)))
    miss_pl = _missing_glyphs(font, PL_DIACRITICS)
    if miss_pl:
        print("  UWAGA: font bez pelnego latin-ext (brak: %s) — nazwa OK, ale tagline/"
              "naglowki z diakrytykami wymagaja innego kroju." % " ".join(miss_pl))
    tmp = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
    bbox = tmp.textbbox((0, 0), nazwa, font=font)
    tw, th = bbox[2]-bbox[0], bbox[3]-bbox[1]
    pad = int(px*0.14)
    im = Image.new("RGBA", (tw+2*pad, th+2*pad), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.text((pad-bbox[0], pad-bbox[1]), nazwa, font=font, fill=color)
    p = os.path.join(outdir, fname)
    im.save(p)
    return {"path": p, "img": im, "glyph_h": th, "pad": pad}

def compose_combo(fav_img, wm, outdir, fname="logo-combo.png"):
    """favicon LEWA + wordmark PRAWA. Korekta optyczna: znak skalowany do ~1.18x
    wysokosci GLIFOW (nie calego pudelka z paddingiem — pudelko robilo znak-olbrzyma),
    wyrownany do pionowego srodka glifow; gap z wysokosci glifow."""
    Image = _pil()[0]
    word_img, glyph_h, pad = wm["img"], wm["glyph_h"], wm["pad"]
    fh = max(8, int(glyph_h * 1.18))
    fav = fav_img.resize((fh, fh), Image.LANCZOS)
    gap = int(glyph_h * 0.45)
    H = max(word_img.size[1], fh)
    W = fh + gap + word_img.size[0]
    combo = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glyph_cy = pad + glyph_h // 2 + (H - word_img.size[1]) // 2
    combo.paste(fav, (0, max(0, glyph_cy - fh // 2)), fav)
    combo.paste(word_img, (fh + gap, (H - word_img.size[1]) // 2), word_img)
    p = os.path.join(outdir, fname)
    combo.save(p)
    return p, combo

# =============================================================================
# (f) DOWOD KONTEKSTOWY — brand-context.png
# =============================================================================
def _hex_rgb(hx):
    c = hx.lstrip("#")
    if len(c) == 3: c = "".join(ch*2 for ch in c)
    return (int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16))

def contact_sheet(master512, combo, combo_dark, palette, outdir):
    """Kompozyt kontekstowy: favicon @16/32/64 na tle JASNYM i CIEMNYM (pasek karty)
    + lockup na tle z palety i na ciemnym. To jest DOWOD do wf2_artifacts —
    odpowiednik kompozytow makiet (dowody, nie deklaracje)."""
    Image, _, ImageDraw, _, _ = _pil()
    W = 1080
    bg_light, bg_dark = (250, 250, 250), (17, 17, 17)
    brand_bg = _hex_rgb(palette[3]) if len(palette) > 3 else (253, 248, 242)
    sheet = Image.new("RGB", (W, 720), (255, 255, 255))
    d = ImageDraw.Draw(sheet)
    # rzad 1: favicony na jasnym i ciemnym
    for col, (bg, x0) in enumerate(((bg_light, 0), (bg_dark, W // 2))):
        d.rectangle([x0, 0, x0 + W // 2 - 1, 240], fill=bg)
        x = x0 + 60
        for s in (64, 32, 16):
            fav = master512.resize((s, s), Image.LANCZOS)
            sheet.paste(fav, (x, 120 - s // 2), fav)
            x += s + 70
    # rzad 2: lockup na tle marki (jasnym) / rzad 3: lockup-dark na ciemnym
    for (im, bg, y0) in ((combo, brand_bg, 240), (combo_dark, bg_dark, 480)):
        d.rectangle([0, y0, W, y0 + 240], fill=bg)
        cw = min(W - 160, 760)
        ratio = cw / im.size[0]
        ch = int(im.size[1] * ratio)
        if ch > 160: ratio *= 160.0 / ch; cw = int(im.size[0] * ratio); ch = int(im.size[1] * ratio)
        imr = im.resize((cw, ch), Image.LANCZOS)
        sheet.paste(imr, ((W - cw) // 2, y0 + 120 - ch // 2), imr)
    p = os.path.join(outdir, "brand-context.png")
    sheet.save(p)
    return p

RUBRYKA_VISION = """RUBRYKA WERDYKTU MARKI (odpowiedz T/N na KAZDE, po kolei; TAK bez 6xT = FAIL;
frazy-wytrychy typu 'pomijalne/akceptowalne/swiadoma decyzja' = FAIL):
  1. Czytelny @32px (nie zlewa sie w plame)?
  2. Czytelny @16px w pasku karty (brand-context.png, oba tla)?
  3. Metafora znaku oddaje nazwe/korzysc marki (nie generyczny clipart)?
  4. Flat 1-2 kolory, zero gradientow/3D/cienia/fotorealizmu?
  5. Zero liter/cyfr/tekstu w znaku?
  6. Sylwetka czytelna w mono (favicon-mono.png)?
+ Podaj JEDNA najslabsza rzecz znaku (wymuszona krytyka)."""

# =============================================================================
# (g) UPLOAD do Storage
# =============================================================================
def upload_storage(slug, local_path, service_key):
    name = os.path.basename(local_path)
    key = "bud-assets/%s/brand/%s" % (slug, name)
    url = "%s/storage/v1/object/attachments/%s" % (project_url(), key)
    data = open(local_path, "rb").read()
    ctype = "application/json" if name.endswith(".json") else "image/png"
    req = urllib.request.Request(url, data=data, method="POST", headers={
        "apikey": service_key, "Authorization": "Bearer " + service_key,
        "x-upsert": "true", "Content-Type": ctype})
    urllib.request.urlopen(req, timeout=120).read()
    return "%s/storage/v1/object/public/attachments/%s" % (project_url(), key)

# =============================================================================
# MAIN
# =============================================================================
def build_args():
    ap = argparse.ArgumentParser(description="brand-forge — favicon+wordmark+rejestr nazw (F2.5)")
    ap.add_argument("--slug", required=True, help="slug marki (lowercase; parasol: 'parasol-<slug>')")
    ap.add_argument("--nazwa", required=True, help="nazwa marki (wordmark)")
    ap.add_argument("--product-id", help="bud_tt_products.id (UUID). BRAK = tryb PARASOLOWY")
    ap.add_argument("--project-id", help="wf2_projects.id — parasol: claim nazwy PRZED generacja "
                    "(reserve-before-generate; kolizja z innym projektem = exit 3)")
    ap.add_argument("--styl-master", help="[przestarzale dla favicona] styl-master NIE jest juz "
                    "referencja znaku (bleed tla przez /edits); zostaje referencja MAKIET")
    ap.add_argument("--paleta", required=True, help="hexy palety, po przecinku: '#0f172a,#f5a623,...'")
    ap.add_argument("--metafory", help="2-3 ROZNE metafory znaku po ';' (diversity-first). "
                    "Np. 'tarcza z rzutka;otwarte pudelko z iskra;kompas'")
    ap.add_argument("--metafora", help="[kompatybilnosc] jedna metafora — lepiej podac --metafory")
    ap.add_argument("--charakter", help="krotki opis OSOBOWOSCI/charakteru marki (vision-led: "
                    "prowadzi brief zamiast mikro-specu ksztaltu). Np. 'resourceful, friendly, "
                    "practical, warm — everyday cleverness, not cold high-tech'")
    ap.add_argument("--font", help="sciezka do fontu .ttf/.otf wordmarka (wymagany poza --dry-run)")
    ap.add_argument("--outdir", help="katalog FABRYKA na kandydatow/wyniki (domyslnie ./FABRYKA-<slug>/brand)")
    ap.add_argument("--count", type=int, default=6, help="LACZNA liczba kandydatow (rozlozona po metaforach)")
    ap.add_argument("--channel", choices=["auto", "local", "edge"], default="auto",
                    help="auto: lokalny OpenAI HIGH gdy OPENAI_API_KEY w .env, inaczej edge medium")
    ap.add_argument("--landing-ref", help="slug/sciezka landingu zajmujacego nazwe")
    ap.add_argument("--user-ref", default="brand-forge", help="kto rezerwuje")
    ap.add_argument("--dry-run", action="store_true", help="walidacja + rezerwacja-check (GET), zero zapisu/generacji")
    return ap

def main():
    try: sys.stdout.reconfigure(encoding="utf-8")
    except Exception: pass
    args = build_args().parse_args()
    slug = args.slug.strip()
    if slug != re.sub(r"[^a-z0-9-]", "", slug):
        raise SystemExit("slug musi byc lowercase [a-z0-9-]: '%s'" % slug)
    palette = [c.strip() for c in args.paleta.split(",") if c.strip()]
    for c in palette:
        if not re.match(r"^#[0-9a-fA-F]{3,8}$", c):
            raise SystemExit("nieprawidlowy hex w palecie: '%s'" % c)
    metafory = [m.strip() for m in (args.metafory or args.metafora or "").split(";") if m.strip()]
    if not metafory:
        raise SystemExit("podaj --metafory 'a;b;c' (2-3 rozne koncepty) albo --metafora")
    if len(metafory) == 1:
        print("UWAGA: jedna metafora = ryzyko fixation (5 klonow jednego pomyslu). "
              "Lepiej 2-3 rozne koncepty w --metafory.")
    service_key = _env("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_SERVICE_KEY")
    wf2_secret = _env("WF2_GEN_SECRET") or os.environ.get("WF2_GEN_SECRET")
    openai_key = _env("OPENAI_API_KEY") or os.environ.get("OPENAI_API_KEY")
    if not service_key:
        raise SystemExit("brak SUPABASE_SERVICE_KEY w .env")
    outdir = args.outdir or os.path.join(os.getcwd(), "FABRYKA-" + slug, "brand")
    parasol = not args.product_id
    channel = args.channel
    if channel == "auto":
        channel = "local" if openai_key else "edge"

    # ---- DRY-RUN: walidacja + rezerwacja-check (bez zapisu) ----
    if args.dry_run:
        print("[dry-run] baza:", project_url())
        print("[dry-run] slug=%s nazwa=%s product_id=%s%s" % (slug, args.nazwa, args.product_id,
              " [TRYB PARASOLOWY]" if parasol else ""))
        print("[dry-run] kanal generacji:", channel, "(local=OpenAI HIGH transparent / edge=wf2-gen medium)")
        print("[dry-run] paleta=%s" % palette)
        print("[dry-run] metafory (%d):" % len(metafory))
        for m in metafory:
            print("   -", m)
            print("     prompt:", favicon_prompt(args.nazwa, m, palette, args.charakter)[:140] + "…")
        if args.font:
            print("[dry-run] font %s: %s" % (args.font, "OK" if os.path.isfile(args.font) else "BRAK PLIKU!"))
        else:
            print("[dry-run] font: (niepodany — wymagany w trybie realnym)")
        print("[dry-run] OCR (tesseract):", "DOSTEPNY" if ocr_available() else "BRAK — guard liter zdegradowany do vision")
        if parasol:
            if args.project_id:
                hits = parasol_name_check(args.project_id, args.nazwa, service_key)
                print("[dry-run] REZERWACJA parasola:", ("KOLIZJA: " + json.dumps(hits, ensure_ascii=False)) if hits
                      else "wolna — claim wf2_projects.name przy realnym przebiegu")
            else:
                print("[dry-run] REZERWACJA parasola: podaj --project-id (claim nazwy przed generacja)")
        else:
            try:
                hits = reservation_check(args.product_id, args.nazwa, slug, service_key)
                if hits:
                    print("[dry-run] REZERWACJA: KOLIZJA — nazwa/slug juz zajete:", json.dumps(hits, ensure_ascii=False))
                else:
                    print("[dry-run] REZERWACJA: wolne — mozna zarezerwowac '%s' / '%s'" % (args.nazwa, slug))
            except Exception as e:
                print("[dry-run] rezerwacja-check nieudany (sprawdz klucz/uprawnienia):", e)
        print("[dry-run] OK — walidacja parametrow przeszla, nic nie zapisano.")
        return

    # ---- REALNY PRZEBIEG ----
    if not args.font or not os.path.isfile(args.font):
        raise SystemExit("--font (plik .ttf/.otf) jest wymagany w trybie realnym")
    # FAIL-FAST fontu PRZED generacja (lekcja Ugniatek 21.07: uszkodzony TTF = 404-HTML z
    # GitHuba wywalal krok (e) PO spaleniu kosztu 6 generacji; wordmark trzeba bylo
    # dokanczac recznie). Walidujemy ladowalnosc + glify nazwy TERAZ, nie w kroku (e).
    try:
        _probe_font = _pil()[1].truetype(args.font, 64)
    except Exception as e:
        raise SystemExit("--font '%s' nie jest poprawnym TTF/OTF (%s) — sprawdz plik "
                         "(magic bytes; GitHub raw potrafi zwrocic strone 404 zamiast fontu)"
                         % (args.font, e))
    _probe_miss = _missing_glyphs(_probe_font, args.nazwa)
    if _probe_miss:
        raise SystemExit("font '%s' nie ma glifow znakow nazwy: %s — wybierz inny plik"
                         % (args.font, ", ".join(repr(c) for c in _probe_miss)))
    if channel == "local" and not openai_key:
        raise SystemExit("--channel local wymaga OPENAI_API_KEY w .env")
    if channel == "edge" and not wf2_secret:
        raise SystemExit("brak WF2_GEN_SECRET w .env (potrzebny do wf2-gen)")
    os.makedirs(outdir, exist_ok=True)

    # (a) rezerwacja PRZED generacja (reserve-before-generate — nie palimy kasy przy kolizji)
    if parasol:
        if args.project_id:
            hits = parasol_name_check(args.project_id, args.nazwa, service_key)
            if hits:
                print("KOLIZJA — nazwa parasolowa '%s' zajeta przez inny projekt: %s"
                      % (args.nazwa, json.dumps(hits, ensure_ascii=False)))
                sys.exit(3)
            if parasol_claim(args.project_id, args.nazwa, service_key):
                print("[a] parasol: nazwa '%s' zapisana na projekcie %s (claim)" % (args.nazwa, args.project_id))
            else:
                print("[a] UWAGA: claim nazwy nie zapisal wiersza — sprawdz project-id")
        else:
            print("[a] tryb PARASOLOWY bez --project-id — dedup TYLKO domena .pl (podaj --project-id!)")
    else:
        ok, row = reserve_name(args.product_id, args.nazwa, slug, service_key, args.landing_ref, args.user_ref)
        if not ok:
            # IDEMPOTENCJA (20.07): rezerwacja mogla powstac WCZESNIEJ w tym samym landingu
            # (F0/karta prawdy rezerwuje nazwe przed F2.5). Ta sama trojka product_id+nazwa+slug
            # to NIE kolizja, tylko powtorzony przebieg — inaczej brand-forge nie da sie uruchomic
            # drugi raz i trzeba omijac rezerwacje wrapperem (precedens Drapek 19.07).
            hits = reservation_check(args.product_id, args.nazwa, slug, service_key)
            mine = [h for h in hits
                    if (h.get("name") or "").strip().lower() == args.nazwa.strip().lower()
                    and (h.get("slug") or "") == slug]
            if mine:
                print("[a] rezerwacja JUZ ISTNIEJE dla tego produktu (idempotentnie, bez zmian):",
                      json.dumps(mine[0], ensure_ascii=False))
            else:
                print("KOLIZJA — nazwa '%s' lub slug '%s' zajete dla product_id=%s przez INNY wpis: %s. "
                      "Podaj nastepna kandydatke."
                      % (args.nazwa, slug, args.product_id, json.dumps(hits, ensure_ascii=False)))
                sys.exit(3)
        else:
            print("[a] zarezerwowano nazwe:", json.dumps(row, ensure_ascii=False))

    # (b) generacja: K metafor x ceil(count/K) wariantow (diversity-first)
    print("[b] OCR (tesseract):", "DOSTEPNY" if ocr_available() else
          "BRAK — twardy guard liter OFF, litery lapie dopiero rubryka vision (pyt. 5)")
    per = max(1, math.ceil(args.count / len(metafory)))
    cands = []
    for mi, met in enumerate(metafory):
        prompt = favicon_prompt(args.nazwa, met, palette, args.charakter)
        tag = "m%d-" % mi
        if channel == "local":
            batch = gen_favicons_local(prompt, per, openai_key, outdir, tag=tag)
        else:
            batch = gen_favicons(slug, prompt, per, wf2_secret, outdir, tag=tag)
        for b in batch: b["concept"] = mi; b["metafora"] = met
        cands += batch
        print("[b] metafora %d/%d ('%s…'): %d kandydatow [%s]"
              % (mi+1, len(metafory), met[:40], len(batch), channel))

    # (c) selektor + top-2 z ROZNYCH konceptow
    scored = []
    for c in cands:
        m = score_candidate(c["path"]); m["i"] = c["i"]; m["url"] = c["url"]
        m["concept"] = c["concept"]; m["metafora"] = c["metafora"]
        scored.append(m)
    survivors = [m for m in scored if not m["odrzucony"]]
    survivors.sort(key=lambda m: m["score"], reverse=True)
    ranking = survivors + [m for m in scored if m["odrzucony"]]
    io.open(os.path.join(outdir, "selektor-wyniki.json"), "w", encoding="utf-8").write(
        json.dumps({"metafory": metafory, "ranking": ranking}, ensure_ascii=False, indent=1))
    if not survivors:
        print("[c] WSZYSCY kandydaci odrzuceni twardo — regeneracja z zaostrzeniem (mniej ksztaltow).")
        print("    wyniki:", os.path.join(outdir, "selektor-wyniki.json"))
        sys.exit(4)
    best = survivors[0]
    top2 = [best]
    for m in survivors[1:]:
        if m["concept"] != best["concept"]:
            top2.append(m); break
    if len(top2) == 1 and len(survivors) > 1:
        top2.append(survivors[1])
    print("[c] TOP-1 (skryptowo):", best["path"], "score", best["score"],
          "| koncept:", best["metafora"][:40], "| alfa:", best["alpha"])

    # (d) eksport favicon (512/256/32/16 + mono)
    ink = palette[2] if len(palette) > 2 else "#111111"
    favs, master = export_favicons(best["path"], outdir, ink=ink)
    print("[d] favicon:", ", ".join(favs.keys()))

    # (e) wordmark + comba (jasne i ciemne tlo)
    wm = render_wordmark(args.nazwa, args.font, palette, outdir)
    wm_dark = render_wordmark(args.nazwa, args.font, palette, outdir,
                              color="#FFFFFF", fname="wordmark-dark.png")
    combo_path, combo_img = compose_combo(master, wm, outdir)
    combo_dark_path, combo_dark_img = compose_combo(master, wm_dark, outdir, fname="logo-combo-dark.png")
    print("[e] wordmark + logo-combo (jasny/ciemny) gotowe")

    # (f) DOWOD kontekstowy
    sheet_path = contact_sheet(master, combo_img, combo_dark_img, palette, outdir)
    print("[f] brand-context.png (dowod kontekstowy @16/32/64 + lockupy) gotowy")

    # (g) upload + brand.json
    brand_json = os.path.join(outdir, "brand.json")
    io.open(brand_json, "w", encoding="utf-8").write(json.dumps({
        "nazwa": args.nazwa, "slug": slug, "paleta": palette,
        "font": os.path.basename(args.font), "metafora": best["metafora"],
        "pliki": ["favicon-512.png", "favicon-256.png", "favicon-32.png", "favicon-16.png",
                  "favicon-mono.png", "wordmark.png", "wordmark-dark.png",
                  "logo-combo.png", "logo-combo-dark.png", "brand-context.png"],
    }, ensure_ascii=False, indent=1))
    uploaded = {}
    for p in list(favs.values()) + [wm["path"], wm_dark["path"], combo_path,
                                    combo_dark_path, sheet_path, brand_json]:
        try:
            uploaded[os.path.basename(p)] = upload_storage(slug, p, service_key)
        except Exception as e:
            print("   upload FAIL", os.path.basename(p), e)
    print("[g] upload -> bud-assets/%s/brand/ (%d plikow)" % (slug, len(uploaded)))
    io.open(os.path.join(outdir, "upload-urls.json"), "w", encoding="utf-8").write(
        json.dumps(uploaded, ensure_ascii=False, indent=1))

    # WERDYKT VISION top-2 zostawiamy nadzorcy — wypisz sciezki + RUBRYKE
    print("\n=== DO WERDYKTU VISION (top-2 z roznych konceptow) ===")
    for m in top2:
        print("  ", m["path"], "| score", m["score"], "| koncept:", m["metafora"][:50],
              "| kolory", m["n_kolorow"], "| fill", m["fill"], "| mono", m["mono_fill"])
    print("\n" + RUBRYKA_VISION)
    print("\nKatalog wynikow:", outdir)

if __name__ == "__main__":
    main()
