# -*- coding: utf-8 -*-
"""
brand-forge.py — pipeline logo+favicon+wordmark fabryki landingow (F2.5 BRANDING).
SSOT: docs/zbuduje/STANDARD-LANDING-SKLEPY.md (F0 rejestr nazw, F2.5 branding, 7e).

Kroki (R2):
  (a) REZERWACJA nazwy w bud_brand_names (REST INSERT-or-fail; kolizja => exit 3)
  (b) GENERACJA N=5 faviconow przez wf2-gen (gpt-image-2, type=logo, quality MEDIUM - high z ref = 504, 1:1,
      ref styl-master type=ref), prompt-recepta wg R2
  (c) SELEKTOR skryptowy @32px (n_kolorow / gestosc krawedzi / kontrast / brak-tekstu OCR /
      margines-wypelnienie) -> ranking + odrzuty twarde; zapis kandydatow i wynikow
  (d) BIEL->ALPHA + eksport favicon-512/256/32.png
  (e) WORDMARK z pliku fontu (--font ttf/otf; Pillow ImageFont) -> wordmark.png transparent
      + logo-combo.png (favicon LEWA + wordmark PRAWA, gap, wyrownanie optyczne)
  (f) UPLOAD do Storage bucket `attachments`, prefix bud-assets/<slug>/brand/ (x-upsert)
  Werdykt vision top-2 zostaje nadzorcy — skrypt wypisuje sciezki top-2.

Zaleznosci: Pillow, numpy, pytesseract (OCR opcjonalny — degraduje do heurystyki).
Uruchamiac przez venv: scripts/mockup-tools/.venv/Scripts/python.exe

  --dry-run : walidacja parametrow + sprawdzenie rezerwacji (GET, bez zapisu) — nic nie generuje.

TRYB PARASOLOWY (marka parasolowa sklepu, krok 'marka' w TN Sklepy): pominac
--product-id i --styl-master => rezerwacja w bud_brand_names POMIJANA (tabela
wymaga product_id; dedup parasola = domena .pl) i generacja BEZ referencji
(parasol jest abstrakcyjny — nie ma packshotu ani styl-mastera). Konwencja
slug: 'parasol-<slug>' (upload -> bud-assets/parasol-<slug>/brand/).
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
    raw = urllib.request.urlopen(req, timeout=30).read()
    rows = json.loads(raw.decode("utf-8") or "[]")
    if not rows:   # ON CONFLICT DO NOTHING -> 0 wierszy = kolizja
        return False, None
    return True, rows[0]

# =============================================================================
# (b) GENERACJA FAVICONOW przez wf2-gen
# =============================================================================
def favicon_prompt(nazwa, metafora, palette):
    cols = ", ".join(palette[:2]) if palette else "brand colors"
    return (
        "Flat vector app-icon / favicon symbol for %s — a single %s. "
        "ONE simple geometric mark built from 2-3 primitive shapes (circle/arc/line), "
        "thick even strokes, high contrast, readable at 32px. Colors: %s. "
        "Centered on PLAIN PURE WHITE background, even margin ~20%%. "
        "Wykluczenia: no text, no letters, no wordmark, no gradient, no 3D, no shadow, "
        "no bevel, no photo, no watermark, no fine detail, no thin lines, "
        "no multiple objects, no mockup frame." % (nazwa, metafora, cols)
    )

def gen_favicons(slug, prompt, styl_master_url, count, wf2_secret, outdir):
    """1 call count=N przez wf2-gen -> lista lokalnych PNG kandydatow.
    styl_master_url=None (tryb PARASOLOWY) => generacja BEZ referencji
    (/v1/images/generations po stronie edge; parasol nie ma styl-mastera)."""
    payload = {"fn": "generate-image", "payload": {
        "prompt": prompt, "count": count, "workflow_id": "brand-" + slug,
        "type": "logo", "provider": "gpt-image-2", "quality": "medium",  # high+ref = 504 wall-clock (Odpalak 17.07)
        "aspect_ratio": "1:1",
    }}
    if styl_master_url:
        payload["payload"]["reference_images"] = [{"url": styl_master_url, "type": "ref"}]
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(project_url() + "/functions/v1/wf2-gen", data=body,
        headers={"Content-Type": "application/json", "x-wf2-secret": wf2_secret})
    raw = urllib.request.urlopen(req, timeout=600).read()
    j = json.loads(raw.decode("utf-8"))
    imgs = j.get("images") or []
    if not imgs:
        raise SystemExit("wf2-gen nie zwrocil obrazow: " + json.dumps(j)[:500])
    cand_dir = os.path.join(outdir, "kandydaci"); os.makedirs(cand_dir, exist_ok=True)
    paths = []
    for i, im in enumerate(imgs):
        url = im.get("url");
        if not url: continue
        data = urllib.request.urlopen(url, timeout=180).read()
        p = os.path.join(cand_dir, "fav-%d.png" % i)
        open(p, "wb").write(data)
        paths.append({"i": i, "path": p, "url": url})
    return paths

# =============================================================================
# (c) SELEKTOR SKRYPTOWY @32px
# =============================================================================
def white_to_alpha(im):
    """Biel -> alpha. Zwraca RGBA (kanal alfa z odleglosci od bieli)."""
    Image, _, _, _, _ = _pil()
    import numpy as np
    rgb = im.convert("RGB")
    arr = np.asarray(rgb).astype(np.float32)
    mn = arr.min(axis=2)                       # min kanalow: wysoki = bialy
    # min>=250 -> alpha 0 ; min<=205 -> alpha 255 ; miedzy = liniowo (anti-alias)
    alpha = np.clip((250.0 - mn) * (255.0 / 45.0), 0, 255).astype("uint8")
    out = np.dstack([np.asarray(rgb).astype("uint8"), alpha])
    return Image.fromarray(out, "RGBA")

def ocr_has_text(im):
    """True jesli OCR wykryje realny tekst. Degraduje do False gdy brak tesseract."""
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

def score_candidate(path):
    """Metryki @32px + odrzuty twarde. Zwraca dict."""
    Image, _, _, ImageFilter, ImageOps = _pil()
    import numpy as np
    im = Image.open(path).convert("RGB")
    thumb = im.resize((32, 32), Image.LANCZOS)
    arr = np.asarray(thumb).astype(np.float32)
    # n_kolorow po kwantyzacji
    q = thumb.quantize(colors=8, method=Image.FASTOCTREE)
    counts = sorted((q.getcolors(1024) or []), reverse=True)
    total = sum(c for c, _ in counts) or 1
    n_signif = sum(1 for c, _ in counts if c / total > 0.02)
    # gestosc krawedzi (FIND_EDGES na L)
    edges = np.asarray(thumb.convert("L").filter(ImageFilter.FIND_EDGES)).astype(np.float32)
    edge_density = float(edges.mean() / 255.0)
    # kontrast = std luminancji
    lum = 0.2126 * arr[:, :, 0] + 0.7152 * arr[:, :, 1] + 0.0722 * arr[:, :, 2]
    contrast = float(lum.std() / 255.0)
    # margines / wypelnienie z alfy (biel->alpha na natywnej rozdzielczosci)
    rgba = white_to_alpha(im)
    a = np.asarray(rgba)[:, :, 3]
    ys, xs = np.where(a > 40)
    if len(xs) == 0:
        fill = 0.0
    else:
        bw = (xs.max() - xs.min() + 1); bh = (ys.max() - ys.min() + 1)
        fill = (bw * bh) / float(a.shape[0] * a.shape[1])
    has_text = ocr_has_text(im)
    # ---- odrzuty twarde ----
    rejects = []
    if n_signif > 5: rejects.append("za duzo kolorow (%d>5)" % n_signif)
    if edge_density > 0.30: rejects.append("mush/za gesto krawedzi (%.2f)" % edge_density)
    if has_text is True: rejects.append("wykryto tekst (OCR)")
    if fill < 0.30: rejects.append("znak za maly (fill %.2f)" % fill)
    if fill > 0.92: rejects.append("brak marginesu (fill %.2f)" % fill)
    # ---- ranking ważony (wyzej=lepiej) ----
    s_col = 1.0 - min(abs(n_signif - 3), 5) / 5.0            # cel ~<=3 kolory
    s_edge = 1.0 - min(edge_density / 0.30, 1.0)             # mniej krawedzi = czyściej
    s_contr = min(contrast / 0.30, 1.0)                      # wyrazisty
    s_fill = 1.0 - min(abs(((max(min(fill, 0.80), 0.55)) - fill)) / 0.25, 1.0)  # cel 0.55-0.80
    s_text = 0.0 if has_text is True else (0.8 if has_text is None else 1.0)
    score = round(2.0*s_col + 1.5*s_edge + 1.0*s_contr + 1.5*s_fill + 1.2*s_text, 3)
    return {"path": path, "n_kolorow": n_signif, "edge_density": round(edge_density, 3),
            "kontrast": round(contrast, 3), "fill": round(fill, 3),
            "ocr_text": has_text, "odrzuty": rejects, "odrzucony": bool(rejects),
            "score": score}

# =============================================================================
# (d) EKSPORT FAVICON master 512 + 256 + 32
# =============================================================================
def export_favicons(best_path, outdir):
    Image, _, _, ImageFilter, _ = _pil()
    rgba = white_to_alpha(Image.open(best_path))
    # przytnij do bbox alfy z lekkim marginesem
    a = rgba.split()[3]
    bbox = a.getbbox()
    if bbox:
        pad = int(max(rgba.size) * 0.06)
        x0 = max(0, bbox[0]-pad); y0 = max(0, bbox[1]-pad)
        x1 = min(rgba.size[0], bbox[2]+pad); y1 = min(rgba.size[1], bbox[3]+pad)
        rgba = rgba.crop((x0, y0, x1, y1))
    # kwadrat 512 master
    side = max(rgba.size)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(rgba, ((side-rgba.size[0])//2, (side-rgba.size[1])//2), rgba)
    m512 = canvas.resize((512, 512), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.2, percent=90))
    out = {}
    for size, nm in ((512, "favicon-512.png"), (256, "favicon-256.png"), (32, "favicon-32.png")):
        p = os.path.join(outdir, nm)
        m512.resize((size, size), Image.LANCZOS).save(p)
        out[nm] = p
    return out, m512

# =============================================================================
# (e) WORDMARK z fontu + logo-combo
# =============================================================================
def render_wordmark(nazwa, font_path, palette, outdir):
    Image, ImageFont, ImageDraw, _, _ = _pil()
    color = palette[0] if palette else "#111111"
    px = 220
    try:
        font = ImageFont.truetype(font_path, px)
    except Exception as e:
        raise SystemExit("Nie wczytano fontu '%s' (%s). Uzyj pliku .ttf/.otf (woff2 bywa "
                         "nieobslugiwany przez FreeType w Pillow)." % (font_path, e))
    tmp = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
    bbox = tmp.textbbox((0, 0), nazwa, font=font)
    tw, th = bbox[2]-bbox[0], bbox[3]-bbox[1]
    pad = int(px*0.14)
    im = Image.new("RGBA", (tw+2*pad, th+2*pad), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.text((pad-bbox[0], pad-bbox[1]), nazwa, font=font, fill=color)
    p = os.path.join(outdir, "wordmark.png")
    im.save(p)
    return p, im

def compose_combo(fav_img, word_img, outdir):
    """favicon LEWA + wordmark PRAWA, wyrownanie optyczne w pionie, gap ~0.4 wys. znaku."""
    Image, _, _, _, _ = _pil()
    H = word_img.size[1]
    fav = fav_img.resize((H, H), Image.LANCZOS)
    gap = int(H*0.4)
    W = fav.size[0] + gap + word_img.size[0]
    combo = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    combo.paste(fav, (0, 0), fav)
    combo.paste(word_img, (fav.size[0]+gap, (H-word_img.size[1])//2), word_img)
    p = os.path.join(outdir, "logo-combo.png")
    combo.save(p)
    return p

# =============================================================================
# (f) UPLOAD do Storage
# =============================================================================
def upload_storage(slug, local_path, service_key):
    name = os.path.basename(local_path)
    key = "bud-assets/%s/brand/%s" % (slug, name)
    url = "%s/storage/v1/object/attachments/%s" % (project_url(), key)
    data = open(local_path, "rb").read()
    req = urllib.request.Request(url, data=data, method="POST", headers={
        "apikey": service_key, "Authorization": "Bearer " + service_key,
        "x-upsert": "true", "Content-Type": "image/png"})
    urllib.request.urlopen(req, timeout=120).read()
    return "%s/storage/v1/object/public/attachments/%s" % (project_url(), key)

# =============================================================================
# MAIN
# =============================================================================
def build_args():
    ap = argparse.ArgumentParser(description="brand-forge — favicon+wordmark+rejestr nazw (F2.5)")
    ap.add_argument("--slug", required=True, help="slug marki (lowercase; parasol: 'parasol-<slug>')")
    ap.add_argument("--nazwa", required=True, help="nazwa marki (wordmark)")
    ap.add_argument("--product-id", help="bud_tt_products.id (UUID). BRAK = tryb PARASOLOWY: "
                    "rezerwacja w bud_brand_names POMIJANA (tabela wymaga product_id; "
                    "dedup parasola = domena .pl)")
    ap.add_argument("--styl-master", help="URL styl-mastera (referencja type=ref). BRAK = tryb "
                    "PARASOLOWY: generacja bez referencji (parasol jest abstrakcyjny)")
    ap.add_argument("--paleta", required=True, help="hexy palety, po przecinku: '#0f172a,#f5a623'")
    ap.add_argument("--metafora", required=True, help="metafora korzysci / esencja marki (do promptu favicona)")
    ap.add_argument("--font", help="sciezka do fontu .ttf/.otf wordmarka (wymagany poza --dry-run)")
    ap.add_argument("--outdir", help="katalog FABRYKA na kandydatow/wyniki (domyslnie ./FABRYKA-<slug>/brand)")
    ap.add_argument("--count", type=int, default=5, help="liczba kandydatow favicona (domyslnie 5)")
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
    service_key = _env("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_SERVICE_KEY")
    wf2_secret = _env("WF2_GEN_SECRET") or os.environ.get("WF2_GEN_SECRET")
    if not service_key:
        raise SystemExit("brak SUPABASE_SERVICE_KEY w .env")
    outdir = args.outdir or os.path.join(os.getcwd(), "FABRYKA-" + slug, "brand")

    parasol = not args.product_id
    # ---- DRY-RUN: walidacja + rezerwacja-check (bez zapisu) ----
    if args.dry_run:
        print("[dry-run] baza:", project_url())
        print("[dry-run] slug=%s nazwa=%s product_id=%s%s" % (slug, args.nazwa, args.product_id,
              " [TRYB PARASOLOWY]" if parasol else ""))
        print("[dry-run] paleta=%s" % palette)
        print("[dry-run] metafora=%s" % args.metafora)
        print("[dry-run] prompt favicona:\n  " + favicon_prompt(args.nazwa, args.metafora, palette))
        if args.font:
            print("[dry-run] font %s: %s" % (args.font, "OK" if os.path.isfile(args.font) else "BRAK PLIKU!"))
        else:
            print("[dry-run] font: (niepodany — wymagany w trybie realnym)")
        if parasol:
            print("[dry-run] REZERWACJA: pomijana (parasol; dedup = domena .pl)")
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
    if not wf2_secret:
        raise SystemExit("brak WF2_GEN_SECRET w .env (potrzebny do wf2-gen)")
    os.makedirs(outdir, exist_ok=True)

    # (a) rezerwacja PRZED generacja (parasol: pomijana — bud_brand_names wymaga product_id,
    #     dedup parasola = domena .pl kupowana przez Tomka)
    if parasol:
        print("[a] tryb PARASOLOWY — rezerwacja w bud_brand_names pomijana")
    else:
        ok, row = reserve_name(args.product_id, args.nazwa, slug, service_key, args.landing_ref, args.user_ref)
        if not ok:
            print("KOLIZJA — nazwa '%s' lub slug '%s' zajete dla product_id=%s. Podaj nastepna kandydatke."
                  % (args.nazwa, slug, args.product_id))
            sys.exit(3)
        print("[a] zarezerwowano nazwe:", json.dumps(row, ensure_ascii=False))

    # (b) generacja faviconow
    prompt = favicon_prompt(args.nazwa, args.metafora, palette)
    cands = gen_favicons(slug, prompt, args.styl_master, args.count, wf2_secret, outdir)
    print("[b] wygenerowano %d kandydatow" % len(cands))

    # (c) selektor
    scored = []
    for c in cands:
        m = score_candidate(c["path"]); m["i"] = c["i"]; m["url"] = c["url"]
        scored.append(m)
    survivors = [m for m in scored if not m["odrzucony"]]
    survivors.sort(key=lambda m: m["score"], reverse=True)
    ranking = survivors + [m for m in scored if m["odrzucony"]]
    io.open(os.path.join(outdir, "selektor-wyniki.json"), "w", encoding="utf-8").write(
        json.dumps({"prompt": prompt, "ranking": ranking}, ensure_ascii=False, indent=1))
    if not survivors:
        print("[c] WSZYSCY kandydaci odrzuceni twardo — regeneracja z zaostrzeniem (mniej ksztaltow).")
        print("    wyniki:", os.path.join(outdir, "selektor-wyniki.json"))
        sys.exit(4)
    best = survivors[0]
    print("[c] TOP-1 (skryptowo):", best["path"], "score", best["score"])

    # (d) eksport favicon
    favs, master = export_favicons(best["path"], outdir)
    print("[d] favicon:", ", ".join(favs.keys()))

    # (e) wordmark + combo
    wm_path, wm_img = render_wordmark(args.nazwa, args.font, palette, outdir)
    combo_path = compose_combo(master, wm_img, outdir)
    print("[e] wordmark + logo-combo gotowe")

    # (f) upload
    uploaded = {}
    for p in list(favs.values()) + [wm_path, combo_path]:
        try:
            uploaded[os.path.basename(p)] = upload_storage(slug, p, service_key)
        except Exception as e:
            print("   upload FAIL", os.path.basename(p), e)
    print("[f] upload -> bud-assets/%s/brand/ (%d plikow)" % (slug, len(uploaded)))
    io.open(os.path.join(outdir, "upload-urls.json"), "w", encoding="utf-8").write(
        json.dumps(uploaded, ensure_ascii=False, indent=1))

    # WERDYKT VISION top-2 zostawiamy nadzorcy — wypisz sciezki
    top2 = survivors[:2]
    print("\n=== DO WERDYKTU VISION (top-2, nadzorca ocenia 6/6 wg R2) ===")
    for m in top2:
        print("  ", m["path"], "| score", m["score"], "| kolory", m["n_kolorow"], "| fill", m["fill"])
    print("Katalog wynikow:", outdir)

if __name__ == "__main__":
    main()
