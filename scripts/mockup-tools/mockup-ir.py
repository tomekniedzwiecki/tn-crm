# -*- coding: utf-8 -*-
"""
mockup-ir.py <makieta.png> [--out dir]

Produkuje IR.json + <name>-annotated.png dla makiety sekcji (fabryka landingow, procedura SEKCJA-Z-MAKIETY v2).

IR zawiera:
  - palette: 6-8 hex + % udzialu (k-means), z oznaczeniem tla (najwiekszy jasny klaster) i akcentu (najbardziej nasycony)
  - typography: OCR bbox (pytesseract jesli dostepny) -> klastry wysokosci (H1/H2/body/caption w px) + teksty z pozycjami
  - blocks: OpenCV findContours (adaptive threshold, RETR_EXTERNAL, filtr pola >1% i prostokatnosci) -> [{n,x,y,w,h,x1000,...}]

Anotacja: kopia makiety z ponumerowanymi bboxami (czerwone), siatka co 128px, stopka "IMAGE WxH px".
"""
import sys, os, re, json, argparse, colorsys, subprocess
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import cv2
from sklearn.cluster import KMeans

# ---------- OCR (odbudowa pomiaru — audyt wiernosci 18.07) ----------
# Kolejnosc silnikow: PaddleOCR (jesli w .venv) -> Tesseract (jezyk auto: pol jesli jest,
# inaczej eng) -> morph-geometria (bboxy linii, tekst="" NIE "[?]") + copy z PROMPTU makiety.
# Zasada: NIGDY nie zwracaj "[?]" — albo realny tekst, albo pusty string z jawnym ocr_engine.
def find_tesseract():
    cands = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Programs\Tesseract-OCR\tesseract.exe"),
        os.path.expandvars(r"%LOCALAPPDATA%\Tesseract-OCR\tesseract.exe"),
    ]
    for c in cands:
        if os.path.isfile(c):
            return c
    return None

def tesseract_langs(tess):
    """Zwraca zbior dostepnych jezykow Tesseract (parsuje --list-langs).
    Powod (audyt 18.07): kod wolal na sztywno 'pol+eng'; gdy pol.traineddata brak,
    starsze buildy Tesseract rzucaja wyjatek -> caly OCR pada w morph-fallback -> '[?]'.
    Wykrywamy realnie zainstalowane jezyki i budujemy lang string z tego, co jest."""
    try:
        out = subprocess.run([tess, "--list-langs"], capture_output=True, text=True, timeout=20)
        langs = set()
        for ln in (out.stdout or "").splitlines():
            ln = ln.strip()
            if ln and " " not in ln and ":" not in ln and "List of" not in ln:
                langs.add(ln)
        return langs
    except Exception:
        return set()

def pick_tess_lang(tess):
    """pol+eng jesli oba sa; pol jesli tylko pol; eng jesli tylko eng; None gdy nic sensownego."""
    langs = tesseract_langs(tess)
    if "pol" in langs and "eng" in langs:
        return "pol+eng"
    if "pol" in langs:
        return "pol"
    if "eng" in langs:
        return "eng"
    return None

def load_prompt_copy(img_path):
    """Ground-truth copy z PROMPTU makiety (sidecar obok PNG) — uzywane gdy ZADEN OCR nie
    dziala (ocr_engine:none). Szuka: <name>.prompt.txt / <name>-prompt.txt / <name>.txt /
    prompt.txt / copy.txt w katalogu makiety. Wyciaga frazy w cudzyslowach (prompt podaje copy
    w cudzyslowach — patrz SEKCJA-Z-MAKIETY 'treść w prompcie w cudzysłowach')."""
    base = os.path.splitext(img_path)[0]
    d = os.path.dirname(os.path.abspath(img_path))
    cands = [base + ".prompt.txt", base + "-prompt.txt", base + ".txt",
             base + ".copy.txt", os.path.join(d, "prompt.txt"), os.path.join(d, "copy.txt")]
    txt = None
    for c in cands:
        if os.path.isfile(c):
            try:
                txt = open(c, encoding="utf-8").read()
                src = c
                break
            except Exception:
                continue
    else:
        return {"source": None, "lines": []}
    # frazy w cudzyslowach prostych/typograficznych/backtickach, dl. 2..120
    quoted = re.findall(r'[`"„”“«»\'’]([^`"„”“«»\'’]{2,120})[`"„”“«»\'’]', txt)
    seen, lines = set(), []
    for q in quoted:
        q = q.strip()
        if q and q.lower() not in seen:
            seen.add(q.lower()); lines.append(q)
    return {"source": os.path.basename(src), "lines": lines}

def run_paddle(img_rgb):
    """PaddleOCR jesli zainstalowane (pip install paddleocr paddlepaddle). Zwraca words albo None.
    Uwaga: paddlepaddle nie ma wheeli dla najnowszego Pythona (3.14) -> zwykle None (fallback tesseract)."""
    try:
        from paddleocr import PaddleOCR
    except Exception:
        return None
    try:
        ocr = PaddleOCR(use_angle_cls=False, lang="pl", show_log=False)
    except Exception:
        try:
            ocr = PaddleOCR(lang="pl")
        except Exception:
            return None
    try:
        res = ocr.ocr(img_rgb, cls=False)
    except Exception:
        return None
    words = []
    # PaddleOCR: [[ [ [box4pts], (text, conf) ], ... ]]
    blocks = res[0] if res and isinstance(res, list) and res and res[0] else []
    for item in (blocks or []):
        try:
            box, (text, conf) = item[0], item[1]
            xs = [p[0] for p in box]; ys = [p[1] for p in box]
            x, y = int(min(xs)), int(min(ys))
            w, h = int(max(xs) - min(xs)), int(max(ys) - min(ys))
            t = (text or "").strip()
            if t and conf and float(conf) > 0.4 and h >= 6:
                words.append({"text": t, "x": x, "y": y, "w": w, "h": h, "conf": round(float(conf) * 100, 1)})
        except Exception:
            continue
    return words or None

def hexof(rgb):
    return "#%02X%02X%02X" % (int(rgb[0]), int(rgb[1]), int(rgb[2]))

def saturation(rgb):
    r, g, b = [x / 255.0 for x in rgb]
    return colorsys.rgb_to_hsv(r, g, b)[1]

def luminance(rgb):
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]

# ---------- PALETA ----------
def palette(img_rgb, k=8):
    small = cv2.resize(img_rgb, (200, int(200 * img_rgb.shape[0] / img_rgb.shape[1])), interpolation=cv2.INTER_AREA)
    data = small.reshape(-1, 3).astype(np.float32)
    km = KMeans(n_clusters=k, n_init=4, random_state=0).fit(data)
    labels = km.labels_
    counts = np.bincount(labels, minlength=k)
    total = counts.sum()
    entries = []
    for i in range(k):
        c = km.cluster_centers_[i]
        entries.append({
            "hex": hexof(c),
            "rgb": [int(round(x)) for x in c],
            "pct": round(100.0 * counts[i] / total, 1),
            "_lum": luminance(c),
            "_sat": saturation(c),
        })
    entries.sort(key=lambda e: -e["pct"])
    # tlo: NAJWIEKSZY klaster wsrod jasnych (lum>150); gdy jasnych brak albo sa marginalne
    # (<12% — motyw ciemny) -> najwiekszy klaster w ogole. Poprawka audytu 18.07: stare
    # "pierwszy z lum>170" wybieralo drobny jasny akcent na ciemnej makiecie jako --paper.
    light = [e for e in entries if e["_lum"] > 150]
    if light and light[0]["pct"] >= 12:
        bg = max(light, key=lambda e: e["pct"])
    elif light and entries[0]["_lum"] > 150:
        bg = entries[0]
    elif light:
        bg = max(light, key=lambda e: e["pct"])
    else:
        bg = entries[0]
    bg["role"] = "background"
    # akcent: najbardziej nasycony (sat>0.25), preferuj nie-tlo
    acc_cands = [e for e in entries if e is not bg and e["_sat"] > 0.20]
    acc = max(acc_cands, key=lambda e: e["_sat"]) if acc_cands else max(entries, key=lambda e: e["_sat"])
    acc["role"] = acc.get("role", "accent")
    if acc.get("role") != "background":
        acc["role"] = "accent"
    # tekst: najciemniejszy
    txt = min(entries, key=lambda e: e["_lum"])
    if "role" not in txt:
        txt["role"] = "text"
    for e in entries:
        e.pop("_lum", None); e.pop("_sat", None)
        e.setdefault("role", "")
    return entries

# ---------- OCR / TYPOGRAFIA ----------
def ocr_words(img_rgb, tess, lang="pol+eng"):
    import pytesseract
    pytesseract.pytesseract.tesseract_cmd = tess
    data = pytesseract.image_to_data(img_rgb, lang=lang, output_type=pytesseract.Output.DICT)
    words = []
    n = len(data["text"])
    for i in range(n):
        t = (data["text"][i] or "").strip()
        try:
            conf = float(data["conf"][i])
        except Exception:
            conf = -1
        if t and conf > 40 and data["height"][i] >= 6:
            words.append({
                "text": t, "x": int(data["left"][i]), "y": int(data["top"][i]),
                "w": int(data["width"][i]), "h": int(data["height"][i]), "conf": round(conf, 1),
            })
    return words

def text_lines_fallback(img_rgb):
    """Bez OCR: wykryj linie/slowa tekstu przez morfologie (adaptive threshold + pozioma dylatacja),
    zwroc bboxy tekstopodobne. Content nierozpoznany (text=""), ale wysokosc/pozycja realne.
    NIE zwracamy '[?]' (audyt 18.07: '[?]' zatruwal IR i koder nie mial jak uzyc tekstu)."""
    H, W = img_rgb.shape[:2]
    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
    th = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 25, 12)
    # scal znaki w slowa (pozioma dylatacja), ale NIE lacz linii w pionie
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (18, 3))
    dil = cv2.dilate(th, kernel, iterations=1)
    cnts, _ = cv2.findContours(dil, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    words = []
    for c in cnts:
        x, y, w, h = cv2.boundingRect(c)
        if h < 8 or h > 0.10 * H:      # linia tekstu, nie blok
            continue
        if w < h * 0.8:                # tekst jest szerszy niz wyzszy
            continue
        if w > 0.9 * W:                # cala szerokosc = raczej separator/tlo
            continue
        fill = cv2.countNonZero(dil[y:y+h, x:x+w]) / float(w * h + 1e-6)
        if fill < 0.25:
            continue
        words.append({"text": "", "x": int(x), "y": int(y), "w": int(w), "h": int(h), "conf": -1})
    return words

def cluster_heights(words, max_levels=4):
    if not words:
        return {}, []
    hs = np.array([[w["h"]] for w in words], dtype=np.float32)
    uniq = len(set(int(w["h"]) for w in words))
    k = max(1, min(max_levels, uniq))
    km = KMeans(n_clusters=k, n_init=4, random_state=0).fit(hs)
    centers = sorted([(float(c[0]), i) for i, c in enumerate(km.cluster_centers_)], reverse=True)
    names = ["H1", "H2", "body", "caption"][:k]
    level_by_cluster = {}
    scale = {}
    for rank, (h, ci) in enumerate(centers):
        level_by_cluster[ci] = names[rank]
        scale[names[rank]] = int(round(h))
    for w, lab in zip(words, km.labels_):
        w["level"] = level_by_cluster[int(lab)]
    return scale, words

# ---------- BLOKI ----------
def _img_cards(img_rgb, bg_rgb, area_img, W, H):
    """Duze karty obrazu/koloru: wysoki prog delty od tla (odrzuca subtelne dekory)."""
    bg = np.array(bg_rgb, dtype=np.float32)
    delta = np.linalg.norm(img_rgb.astype(np.float32) - bg, axis=2)
    mask = (delta > 42).astype(np.uint8) * 255
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((21, 21), np.uint8), iterations=2)
    cnts, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    res = []
    for c in cnts:
        x, y, w, h = cv2.boundingRect(c)
        area = w * h
        if area < 0.03 * area_img:
            continue
        rect = cv2.contourArea(c) / float(area + 1e-6)
        if rect < 0.45:
            continue
        if w > 0.985 * W and h > 0.985 * H:
            continue
        res.append({"x": x, "y": y, "w": w, "h": h, "_area": area, "kind": "card/image"})
    return res

def _text_groups(words, area_img, W, H):
    """Grupuj slowa OCR w linie (ta sama y), potem sasiednie linie w bloki tekstu."""
    if not words:
        return []
    ws = sorted(words, key=lambda w: (w["y"], w["x"]))
    # linie
    lines = []
    for w in ws:
        placed = False
        for ln in lines:
            if abs((w["y"] + w["h"] / 2) - ln["cy"]) < 0.6 * w["h"]:
                ln["x0"] = min(ln["x0"], w["x"]); ln["y0"] = min(ln["y0"], w["y"])
                ln["x1"] = max(ln["x1"], w["x"] + w["w"]); ln["y1"] = max(ln["y1"], w["y"] + w["h"])
                ln["cy"] = (ln["y0"] + ln["y1"]) / 2; placed = True; break
        if not placed:
            lines.append({"x0": w["x"], "y0": w["y"], "x1": w["x"] + w["w"], "y1": w["y"] + w["h"],
                          "cy": w["y"] + w["h"] / 2})
    # scal sasiednie linie w blok (odstep < 1.6x wysokosci linii)
    lines.sort(key=lambda l: l["y0"])
    groups = []
    for ln in lines:
        h = ln["y1"] - ln["y0"]
        if groups:
            g = groups[-1]
            gap = ln["y0"] - g["y1"]
            overlap_x = min(g["x1"], ln["x1"]) - max(g["x0"], ln["x0"])
            if gap < 1.6 * h and overlap_x > 0:
                g["x0"] = min(g["x0"], ln["x0"]); g["y0"] = min(g["y0"], ln["y0"])
                g["x1"] = max(g["x1"], ln["x1"]); g["y1"] = max(g["y1"], ln["y1"]); continue
        groups.append(dict(ln))
    res = []
    for g in groups:
        x, y = int(g["x0"]), int(g["y0"])
        w, h = int(g["x1"] - g["x0"]), int(g["y1"] - g["y0"])
        res.append({"x": x, "y": y, "w": w, "h": h, "_area": w * h, "kind": "text"})
    return res

# ---------- PROJECTION-PROFILE XY-CUT (rozbicie mega-bloba) ----------
def _content_mask(img_rgb, bg_rgb):
    """Maska tresci: piksel rozni sie od tla LUB jest krawedzia (tekst/karta). Lekkie domkniecie
    POZIOME scala litery w slowa, ale NIE bandy w pionie (zeby guttery poziome przetrwaly)."""
    bg = np.array(bg_rgb, dtype=np.float32)
    delta = np.linalg.norm(img_rgb.astype(np.float32) - bg, axis=2)
    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
    gx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
    edge = np.sqrt(gx * gx + gy * gy)
    m = ((delta > 22) | (edge > 40)).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((1, 7), np.uint8))
    return m

def _gutters(prof, minlen):
    """Wewnetrzne 'puste' pasma profilu (rzutu jasnosci/tresci) szersze niz minlen."""
    thr = max(1.0, 0.03 * float(prof.max()))
    empty = prof <= thr
    runs = []; s = None
    for i, v in enumerate(empty):
        if v and s is None: s = i
        if (not v) and s is not None:
            runs.append((s, i)); s = None
    if s is not None: runs.append((s, len(empty)))
    return [(a, b) for (a, b) in runs if a > 2 and b < len(prof) - 2 and (b - a) >= minlen]

def _projection_cut(mask, x0, y0, x1, y1, depth, out, min_size, W, H):
    """Rekurencyjny XY-cut: tnij region wzdluz NAJSZERSZEGO guttera (wiersz/kolumna o niskiej
    projekcji tresci). To odzyskuje siatke z mega-bloba, ktory findContours zlewa w 1 region."""
    reg = mask[y0:y1, x0:x1]
    h, w = reg.shape
    if h < min_size or w < min_size or depth <= 0:
        out.append((x0, y0, x1, y1)); return
    row = reg.sum(axis=1).astype(np.float32)  # tresc per wiersz
    col = reg.sum(axis=0).astype(np.float32)  # tresc per kolumna
    min_gut_v = max(6, int(0.012 * H))   # poziomy gutter miedzy wierszami tresci
    min_gut_h = max(10, int(0.020 * W))  # pionowy gutter miedzy kolumnami
    best = None
    for (a, b) in _gutters(row, min_gut_v):
        if best is None or (b - a) > best[0]: best = (b - a, "h", a, b)
    for (a, b) in _gutters(col, min_gut_h):
        if best is None or (b - a) > best[0]: best = (b - a, "v", a, b)
    if best is None:
        out.append((x0, y0, x1, y1)); return
    _, axis, a, b = best; mid = (a + b) // 2
    if axis == "h":
        _projection_cut(mask, x0, y0, x1, y0 + mid, depth - 1, out, min_size, W, H)
        _projection_cut(mask, x0, y0 + mid, x1, y1, depth - 1, out, min_size, W, H)
    else:
        _projection_cut(mask, x0, y0, x0 + mid, y1, depth - 1, out, min_size, W, H)
        _projection_cut(mask, x0 + mid, y0, x1, y1, depth - 1, out, min_size, W, H)

def xy_cut_blocks(img_rgb, bg_rgb, W, H):
    """Segmentacja mega-bloba przez projection-profile. Zwraca bboxy kart/kolumn/wierszy tam,
    gdzie findContours zlewa wszystko w 1 region (pastelowe full-bleed makiety AI)."""
    mask = _content_mask(img_rgb, bg_rgb)
    ys, xs = np.where(mask > 0)
    if len(xs) < 50:
        return []
    x0, y0, x1, y1 = int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1
    out = []
    _projection_cut(mask, x0, y0, x1, y1, depth=6, out=out,
                    min_size=max(24, int(0.03 * min(W, H))), W=W, H=H)
    res = []
    for (a, b, c, d) in out:
        if (c - a) < 0.04 * W and (d - b) < 0.03 * H:   # odrzuc drobiny
            continue
        sub = mask[b:d, a:c]
        if sub.size == 0 or sub.mean() < 0.02:          # pusty region
            continue
        sy, sx = np.where(sub > 0)
        if len(sx) < 10:
            continue
        a2, b2 = a + int(sx.min()), b + int(sy.min())
        c2, d2 = a + int(sx.max()) + 1, b + int(sy.max()) + 1
        res.append({"x": a2, "y": b2, "w": c2 - a2, "h": d2 - b2,
                    "_area": (c2 - a2) * (d2 - b2), "kind": "block"})
    return res

def blocks(img_rgb, bg_rgb, words):
    """Bloki = duze karty obrazu/koloru (CV) + grupy tekstu (OCR). Numeracja gora->dol, lewo->prawo.
    MEGA-BLOB guard (audyt 18.07): gdy CV zwraca 0-1 region kryjacy >55% kanwy -> XY-cut."""
    H, W = img_rgb.shape[:2]
    area_img = W * H
    cards = _img_cards(img_rgb, bg_rgb, area_img, W, H)
    big = [c for c in cards if c["_area"] > 0.55 * area_img]
    if len(cards) <= 1 or big:
        xy = xy_cut_blocks(img_rgb, bg_rgb, W, H)
        if len(xy) > len(cards):
            cards = xy
    texts = _text_groups(words, area_img, W, H)
    out = cards + texts
    # dedup: usun tekst calkowicie zawarty w karcie. WYJATEK: tekst nalozony na scene full-bleed
    # (blok >55% kanwy = hero/scena) ZACHOWaj — inaczej mega-scena polyka H1/cene/CTA (audyt 18.07).
    out.sort(key=lambda b: -b["_area"])
    kept = []
    for b in out:
        dup = False
        for k in kept:
            ix = max(0, min(b["x"] + b["w"], k["x"] + k["w"]) - max(b["x"], k["x"]))
            iy = max(0, min(b["y"] + b["h"], k["y"] + k["h"]) - max(b["y"], k["y"]))
            inter = ix * iy
            k_scene = k["_area"] > 0.55 * area_img
            if b.get("kind") == "text" and k_scene:
                continue                                  # tekst na scenie -> nie dedupuj
            if inter > 0.80 * b["_area"] and k["kind"] in ("card/image", "block") and not k_scene:
                dup = True; break
            if inter > 0.85 * b["_area"] and not k_scene:
                dup = True; break
        if not dup:
            kept.append(b)
    # sortuj czytelnie: gora->dol, lewo->prawo
    kept.sort(key=lambda b: (round(b["y"] / 40.0), b["x"]))
    res = []
    for n, b in enumerate(kept, 1):
        res.append({
            "n": n, "kind": b.get("kind", ""), "x": b["x"], "y": b["y"], "w": b["w"], "h": b["h"],
            "x1000": round(1000 * b["x"] / W), "y1000": round(1000 * b["y"] / H),
            "w1000": round(1000 * b["w"] / W), "h1000": round(1000 * b["h"] / H),
        })
    return res

# ---------- ANOTACJA ----------
def font(sz):
    for f in ["arialbd.ttf", "arial.ttf", "DejaVuSans-Bold.ttf"]:
        try:
            return ImageFont.truetype(f, sz)
        except Exception:
            continue
    return ImageFont.load_default()

def annotate(img_pil, blk, out_path):
    W, H = img_pil.size
    im = img_pil.convert("RGB").copy()
    d = ImageDraw.Draw(im, "RGBA")
    # siatka 128px
    for gx in range(0, W, 128):
        d.line([(gx, 0), (gx, H)], fill=(0, 120, 255, 90), width=1)
        d.text((gx + 2, 2), str(gx), fill=(0, 90, 200, 255), font=font(11))
    for gy in range(0, H, 128):
        d.line([(0, gy), (W, gy)], fill=(0, 120, 255, 90), width=1)
        d.text((2, gy + 2), str(gy), fill=(0, 90, 200, 255), font=font(11))
    # bboxy
    fb = font(22)
    for b in blk:
        d.rectangle([b["x"], b["y"], b["x"] + b["w"], b["y"] + b["h"]], outline=(255, 0, 0, 255), width=3)
        tag = str(b["n"])
        tw = d.textlength(tag, font=fb)
        d.rectangle([b["x"], b["y"], b["x"] + tw + 10, b["y"] + 28], fill=(255, 0, 0, 235))
        d.text((b["x"] + 5, b["y"] + 2), tag, fill=(255, 255, 255, 255), font=fb)
    # stopka
    foot = "IMAGE %dx%d px" % (W, H)
    ff = font(20)
    fw = d.textlength(foot, font=ff)
    d.rectangle([0, H - 30, fw + 16, H], fill=(0, 0, 0, 200))
    d.text((8, H - 27), foot, fill=(255, 255, 0, 255), font=ff)
    im.save(out_path)

# ---------- :root + SKALA TYPO (fundament dla kodera — P2 audytu: zakaz re-aproksymacji) ----------
def _dist(a, b):
    return sum((x - y) ** 2 for x, y in zip(a, b)) ** 0.5

def pick_line_color(pal, bg, ink):
    """Kolor hairline/linii: neutralny klaster jasniejszy niz tekst a ciemniejszy niz tlo,
    najmniej nasycony, rozny od tla. Fallback: przyciemnione tlo ~14%."""
    lb = luminance(bg["rgb"])
    cands = []
    for e in pal:
        if e.get("role") in ("background", "accent"):
            continue
        if _dist(e["rgb"], bg["rgb"]) < 14:
            continue
        lum = luminance(e["rgb"])
        if 90 < lum < lb:
            cands.append((saturation(e["rgb"]), e))
    if cands:
        cands.sort(key=lambda c: c[0])
        return cands[0][1]["hex"]
    r, g, b = bg["rgb"]
    return hexof((int(r * 0.86), int(g * 0.86), int(b * 0.86)))

def build_root_css(pal):
    """Gotowy blok :root{} z DOKLADNIE zmierzonej palety. Koder wkleja 1:1 (zakaz aproksymacji
    typu --paper #FAF3E6 gdy zmierzone #F6F2ED — incydent audytu 18.07)."""
    bg = next((e for e in pal if e.get("role") == "background"), pal[0])
    ink = min(pal, key=lambda e: luminance(e["rgb"]))
    acc = next((e for e in pal if e.get("role") == "accent"), None)
    cta = acc["hex"] if acc else ink["hex"]
    line = pick_line_color(pal, bg, ink)
    return {"paper": bg["hex"], "ink": ink["hex"], "cta": cta, "line": line,
            "css": ":root{--paper:%s;--ink:%s;--cta:%s;--line:%s}" % (bg["hex"], ink["hex"], cta, line)}

def build_typo_clamp(scale_norm, render_width):
    """clamp() per poziom z ZMIERZONYCH (znormalizowanych do renderu) px. max=zmierzony px,
    min=~62% (naglowki)/92% (body), preferowany vw = px/render_width*100 (font≈px @render_width)."""
    css = {}
    for lvl, px in scale_norm.items():
        if not isinstance(px, (int, float)):
            continue
        px = int(round(px))
        if lvl in ("body", "caption"):
            mn = max(13, int(round(px * 0.92)))
        else:
            mn = max(18, int(round(px * 0.62)))
        mn = min(mn, px)   # min nigdy > max (drobny caption: clamp degeneruje do stalej)
        vw = round(100.0 * px / max(1, render_width), 2)
        css[lvl] = "clamp(%dpx, %.2fvw, %dpx)" % (mn, vw, px)
    return css

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("makieta")
    ap.add_argument("--out", default=None)
    ap.add_argument("--render-width", type=int, default=1180,
                    help="szerokosc renderu docelowego (px) do normalizacji skali; makieta 1536/1024 -> ~1180")
    a = ap.parse_args()
    src = a.makieta
    name = os.path.splitext(os.path.basename(src))[0]
    outdir = a.out or os.path.dirname(os.path.abspath(src))
    os.makedirs(outdir, exist_ok=True)

    img_pil = Image.open(src).convert("RGB")
    img_rgb = np.array(img_pil)
    W, H = img_pil.size

    pal = palette(img_rgb, k=8)

    # OCR: PaddleOCR -> Tesseract (jezyk auto: pol jesli jest, inaczej eng) -> morph-geometria
    # (bboxy linii, tekst="") + copy z PROMPTU makiety. NIGDY nie zwracamy "[?]".
    words, engine, prompt_copy = [], "none", {"source": None, "lines": []}
    pw = run_paddle(img_rgb)
    if pw:
        words, engine = pw, "paddleocr"
    else:
        tess = find_tesseract()
        lang = pick_tess_lang(tess) if tess else None
        if tess and lang:
            try:
                words = ocr_words(img_rgb, tess, lang=lang)
                engine = "tesseract:%s" % lang
            except Exception as e:
                words, engine = [], "none(tess-error:%s)" % type(e).__name__
        if not words:
            words = text_lines_fallback(img_rgb)          # geometria (tekst="")
            prompt_copy = load_prompt_copy(src)            # ground-truth copy jesli sidecar jest
            engine = "none(morph-geometry)" + (" +prompt-copy" if prompt_copy["lines"] else "")
    scale, words = cluster_heights(words)

    bg_entry = next((e for e in pal if e.get("role") == "background"), pal[0])
    blk = blocks(img_rgb, bg_entry["rgb"], words)

    # --- normalizacja skali do szerokosci renderu (koder uzywa scale_px_norm, NIE surowych px) ---
    render_width = a.render_width
    sf = render_width / float(W)
    scale_norm = {k: int(round(v * sf)) for k, v in scale.items() if isinstance(v, (int, float))}
    for b in blk:
        b["x_r"] = round(b["x"] * sf); b["y_r"] = round(b["y"] * sf)
        b["w_r"] = round(b["w"] * sf); b["h_r"] = round(b["h"] * sf)
    root = build_root_css(pal)
    typo_clamp = build_typo_clamp(scale_norm, render_width)

    ir = {
        "source": os.path.abspath(src),
        "image": {"w": W, "h": H},
        "render_width": render_width,
        "scale_factor": round(sf, 4),
        "root": root,                 # {paper,ink,cta,line, css:":root{...}"} — gotowe do wklejenia
        "typo_clamp": typo_clamp,     # {H1:"clamp(...)", ...} z px znormalizowanych do renderu
        "palette": pal,
        "typography": {
            "ocr_engine": engine,
            "scale_px": scale,            # surowe px na kanwie makiety
            "scale_px_norm": scale_norm,  # PRZESKALOWANE do render_width — TE podajemy koderowi
            "prompt_copy": prompt_copy,   # ground-truth copy gdy ocr_engine=none
            "texts": [{"text": w["text"], "x": w["x"], "y": w["y"], "h": w["h"],
                       "h_r": round(w["h"] * sf), "level": w.get("level", ""),
                       "x1000": round(1000 * w["x"] / W), "y1000": round(1000 * w["y"] / H)}
                      for w in words],
        },
        "blocks": blk,
    }
    ir_path = os.path.join(outdir, name + "-IR.json")
    with open(ir_path, "w", encoding="utf-8") as f:
        json.dump(ir, f, ensure_ascii=False, indent=2)

    ann_path = os.path.join(outdir, name + "-annotated.png")
    annotate(img_pil, blk, ann_path)

    print("IR:", ir_path)
    print("ANNOTATED:", ann_path)
    print("palette:", ", ".join("%s(%s%% %s)" % (e["hex"], e["pct"], e["role"]) for e in pal))
    print("ROOT:", root["css"])
    print("SKALA TYPO @%dpx:" % render_width,
          ", ".join("%s~=%spx" % (k, v) for k, v in scale_norm.items()),
          "| clamp:", "; ".join("%s %s" % (k, v) for k, v in typo_clamp.items()))
    print("OCR:", engine, "| words:", len(words),
          ("| prompt-copy: %d linii (%s)" % (len(prompt_copy["lines"]), prompt_copy["source"])
           if prompt_copy["lines"] else ""))
    print("blocks:", len(blk))

if __name__ == "__main__":
    main()
