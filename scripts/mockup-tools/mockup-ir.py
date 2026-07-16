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
import sys, os, json, argparse, colorsys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import cv2
from sklearn.cluster import KMeans

# ---------- OCR (opcjonalny) ----------
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
    # tlo: najwiekszy klaster o jasnosci >170 (fallback: najwiekszy)
    bg = None
    for e in entries:
        if e["_lum"] > 170:
            bg = e; break
    if bg is None:
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
def ocr_words(img_rgb, tess):
    import pytesseract
    pytesseract.pytesseract.tesseract_cmd = tess
    data = pytesseract.image_to_data(img_rgb, lang="pol+eng", output_type=pytesseract.Output.DICT)
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
    zwroc bboxy tekstopodobne. Content nierozpoznany ('[?]'), ale wysokosc/pozycja realne."""
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
        words.append({"text": "[?]", "x": int(x), "y": int(y), "w": int(w), "h": int(h), "conf": -1})
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

def blocks(img_rgb, bg_rgb, words):
    """Bloki = duze karty obrazu/koloru (CV) + grupy tekstu (OCR). Numeracja gora->dol, lewo->prawo."""
    H, W = img_rgb.shape[:2]
    area_img = W * H
    cards = _img_cards(img_rgb, bg_rgb, area_img, W, H)
    texts = _text_groups(words, area_img, W, H)
    out = cards + texts
    # dedup: usun tekst calkowicie zawarty w karcie
    out.sort(key=lambda b: -b["_area"])
    kept = []
    for b in out:
        dup = False
        for k in kept:
            ix = max(0, min(b["x"] + b["w"], k["x"] + k["w"]) - max(b["x"], k["x"]))
            iy = max(0, min(b["y"] + b["h"], k["y"] + k["h"]) - max(b["y"], k["y"]))
            inter = ix * iy
            if inter > 0.80 * b["_area"] and k["kind"] == "card/image":
                dup = True; break
            if inter > 0.85 * b["_area"]:
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

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("makieta")
    ap.add_argument("--out", default=None)
    a = ap.parse_args()
    src = a.makieta
    name = os.path.splitext(os.path.basename(src))[0]
    outdir = a.out or os.path.dirname(os.path.abspath(src))
    os.makedirs(outdir, exist_ok=True)

    img_pil = Image.open(src).convert("RGB")
    img_rgb = np.array(img_pil)
    W, H = img_pil.size

    pal = palette(img_rgb, k=8)

    tess = find_tesseract()
    ocr_ok = tess is not None
    engine = "NONE"
    words, scale = [], {}
    if ocr_ok:
        try:
            words = ocr_words(img_rgb, tess)
            scale, words = cluster_heights(words)
            engine = "pytesseract:" + tess
        except Exception as e:
            ocr_ok = False
            scale = {"_ocr_error": str(e)}
    if not ocr_ok:
        # fallback bez OCR: wysokosci linii tekstu z morfologii (content nierozpoznany)
        words = text_lines_fallback(img_rgb)
        scale, words = cluster_heights(words)
        engine = "morph-fallback(no-OCR)"

    bg_entry = next((e for e in pal if e.get("role") == "background"), pal[0])
    blk = blocks(img_rgb, bg_entry["rgb"], words)

    ir = {
        "source": os.path.abspath(src),
        "image": {"w": W, "h": H},
        "palette": pal,
        "typography": {
            "ocr_engine": engine,
            "scale_px": scale,
            "texts": [{"text": w["text"], "x": w["x"], "y": w["y"], "h": w["h"],
                       "level": w.get("level", ""),
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
    print("typo scale:", scale, "| OCR:", ir["typography"]["ocr_engine"], "| words:", len(words))
    print("blocks:", len(blk))

if __name__ == "__main__":
    main()
