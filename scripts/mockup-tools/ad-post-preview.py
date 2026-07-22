#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ad-post-preview.py — DETERMINISTYCZNY renderer podglądu POSTA Meta (feed) dla kroku `ads_zestaw`.

Feedback Tomka: „w kroku zestaw reklam + copy nigdzie nie widzę tego efektu — pokaż podgląd,
jak będzie wyglądać post". Ten skrypt bierze GOTOWE kreacje zestawu (statyki 4:5 + klatki
wideo-wariantów) i copy z `C:/tmp/ad-forge/<slug>/COPY-ZESTAW.md`, po czym renderuje makietę
posta feedu Meta (PIL, $0): pasek nagłówka (okrągły awatar marki + nazwa + „Sponsorowane"),
primary text (~200 znaków, zawijanie), kreacja (statyka wklejona 4:5 / kadr 1:1 z wideo przez
ffmpeg -ss 1) i szara karta linku (domena, HEADLINE ≤27, przycisk „Kup teraz").

⛔ ZG10 — w podglądzie NIE renderujemy ŻADNEJ ceny (żadnej kwoty). Cena żyje wyłącznie na
landingu (runtime wf2-landing-api). Baner/post z ceną = kłamstwo po pierwszej zmianie ceny.

Wyjście: 6 podglądów per produkt (3 statyki + 3 wideo-klatki) = PNG→WebP → Storage
`bud-assets/<slug>/ads/preview/post-N.webp` (panel-sync.storage_upload) + `artifact_add(...,
step='ads_zestaw', kind='proof', label='Podgląd posta: <kąt/wariant> — <headline>')` + nota
kroku `ads_zestaw`.

CLI:
  python ad-post-preview.py <project_id> [product_id ...]   # domyślnie wszystkie 'gotowy'
  flagi: --no-upload (tylko render lokalny), --out <dir>, --no-step (bez noty kroku)

Fonty: scripts/mockup-tools/fonts/ (Mulish). Kreacje statyk: C:/tmp/ad-forge/<slug>/ad_<angle>_45.png.
Wideo-warianty: bud-assets/<slug>/ads/*.mp4 (baza=kreacja_15s, hookA/hookB wg nazwy).
"""
import os
import re
import sys
import argparse
import tempfile
import subprocess
import importlib.util

import requests
from PIL import Image, ImageDraw, ImageFont

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8")
    except Exception:
        pass

_HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("panel_sync", os.path.join(_HERE, "panel-sync.py"))
ps = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(ps)

FONTS_DIR = os.path.join(_HERE, "fonts")
ADFORGE_ROOT = os.environ.get("AD_FORGE_ROOT", r"C:\tmp\ad-forge")
PUB_ATTACH = f"{ps.PUBLIC_BASE}/attachments"


def log(msg):
    print(f"[ad-post-preview] {msg}", flush=True)


# ── Makieta posta Meta (kanon wymiarów przy CARD_W=600) ──
CARD_W = 600
PAD = 16
AV = 40
HEAD_H = 64
LINE_H = 22
BODY_BOT_PAD = 12
LINK_H = 78

C_BG = (255, 255, 255)
C_INK = (5, 5, 5)              # Meta near-black
C_GRAY = (101, 103, 107)       # #65676B
C_LINKBG = (240, 242, 245)     # #F0F2F5
C_BORDER = (219, 221, 225)     # #DADDE1
C_BTN = (228, 230, 235)        # #E4E6EB (secondary CTA)


def _font(name, size):
    return ImageFont.truetype(os.path.join(FONTS_DIR, name), size)


def _fetch_image(url):
    r = requests.get(url, timeout=40)
    if r.status_code >= 300:
        raise RuntimeError(f"GET {url} {r.status_code}")
    from io import BytesIO
    return Image.open(BytesIO(r.content))


def _circle_avatar(img, size):
    """Okrągły awatar z antyaliasingiem (supersampling 4×)."""
    ss = size * 4
    a = img.convert("RGBA")
    # wpasuj w kwadrat (cover), potem maska koła
    a = _center_crop_aspect(a, 1.0).resize((ss, ss), Image.LANCZOS)
    mask = Image.new("L", (ss, ss), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, ss - 1, ss - 1), fill=255)
    a.putalpha(mask)
    return a.resize((size, size), Image.LANCZOS)


def _center_crop_aspect(img, ratio):
    """Center-crop do proporcji ratio = szer/wys."""
    w, h = img.size
    cur = w / h
    if cur > ratio:
        nw = int(round(h * ratio))
        x = (w - nw) // 2
        return img.crop((x, 0, x + nw, h))
    nh = int(round(w / ratio))
    y = (h - nh) // 2
    return img.crop((0, y, w, y + nh))


def _fit_creative(img, ratio):
    """Kreacja: center-crop do proporcji + resize na pełną szerokość karty."""
    img = _center_crop_aspect(img.convert("RGB"), ratio)
    h = int(round(CARD_W / ratio))
    return img.resize((CARD_W, h), Image.LANCZOS)


def _wrap(draw, text, font, max_w):
    lines, cur = [], ""
    for word in text.split():
        t = (cur + " " + word).strip()
        if draw.textlength(t, font=font) <= max_w or not cur:
            cur = t
        else:
            lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


def _draw_globe(draw, cx, cy, r, color):
    """Mała ikona globu przy „Sponsorowane" (jak w feedzie Meta)."""
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=color, width=1)
    draw.line((cx - r, cy, cx + r, cy), fill=color, width=1)
    draw.line((cx, cy - r, cx, cy + r), fill=color, width=1)
    draw.ellipse((cx - r * 0.5, cy - r, cx + r * 0.5, cy + r), outline=color, width=1)


def _video_frame(mp4_url, tmp_dir):
    """Klatka wideo (ffmpeg -ss 1). Zwraca RGB Image (natywne 9:16)."""
    fp = os.path.join(tmp_dir, "vframe.png")
    r = subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", "1", "-i", mp4_url,
                        "-frames:v", "1", fp], capture_output=True, timeout=120)
    if r.returncode != 0 or not os.path.isfile(fp):
        raise RuntimeError(f"ffmpeg frame FAIL: {r.stderr.decode(errors='replace')[:200]}")
    return Image.open(fp).convert("RGB")


def render_post(avatar, brand, domain, primary, creative_img, headline):
    """Zwraca gotową makietę posta feedu (PIL RGB). creative_img już wpasowany na CARD_W."""
    f_name = _font("Mulish-600.ttf", 16)
    f_spons = _font("Mulish-400.ttf", 12)
    f_body = _font("Mulish-400.ttf", 16)
    f_domain = _font("Mulish-600.ttf", 12)
    f_head = _font("Mulish-600.ttf", 18)
    f_btn = _font("Mulish-600.ttf", 14)

    # 1) wysokość bloku primary (zawijanie)
    tmp = Image.new("RGB", (10, 10))
    d0 = ImageDraw.Draw(tmp)
    body_lines = _wrap(d0, primary, f_body, CARD_W - 2 * PAD)
    primary_h = 6 + len(body_lines) * LINE_H + BODY_BOT_PAD

    cw, ch = creative_img.size
    creative_y = HEAD_H + primary_h
    link_y = creative_y + ch
    total_h = link_y + LINK_H

    im = Image.new("RGB", (CARD_W, total_h), C_BG)
    d = ImageDraw.Draw(im)

    # 2) nagłówek: awatar + nazwa + „Sponsorowane" + globe + menu (…)
    im.paste(_circle_avatar(avatar, AV), (PAD, 12), _circle_avatar(avatar, AV))
    tx = PAD + AV + 10
    d.text((tx, 12), brand, font=f_name, fill=C_INK)
    d.text((tx, 34), "Sponsorowane", font=f_spons, fill=C_GRAY)
    sw = d.textlength("Sponsorowane", font=f_spons)
    _draw_globe(d, tx + sw + 11, 41, 5, C_GRAY)
    for i in range(3):
        cxx = CARD_W - PAD - 4 - i * 8
        d.ellipse((cxx - 2, 22, cxx + 2, 26), fill=C_GRAY)

    # 3) primary text
    y = HEAD_H + 6
    for ln in body_lines:
        d.text((PAD, y), ln, font=f_body, fill=C_INK)
        y += LINE_H

    # 4) kreacja
    im.paste(creative_img, (0, creative_y))

    # 5) karta linku (szara): domena + HEADLINE + „Kup teraz"
    d.rectangle((0, link_y, CARD_W, total_h), fill=C_LINKBG)
    d.line((0, link_y, CARD_W, link_y), fill=C_BORDER, width=1)

    # przycisk „Kup teraz" (wyrównany do prawej, pionowo w centrum karty)
    btn_txt = "Kup teraz"
    btn_pad = 14
    bw = int(d.textlength(btn_txt, font=f_btn)) + 2 * btn_pad
    bh = 38
    bx2 = CARD_W - PAD
    bx1 = bx2 - bw
    by1 = link_y + (LINK_H - bh) // 2
    d.rounded_rectangle((bx1, by1, bx2, by1 + bh), radius=7, fill=C_BTN)
    d.text((bx1 + bw / 2, by1 + bh / 2), btn_txt, font=f_btn, fill=C_INK, anchor="mm")

    # domena + headline (lewa kolumna, do lewej krawędzi przycisku)
    text_max = bx1 - 12 - PAD
    d.text((PAD, link_y + 16), domain.upper(), font=f_domain, fill=C_GRAY)
    head = headline
    while head and d.textlength(head + "…", font=f_head) > text_max:
        head = head[:-1]
    if head != headline:
        head = head.rstrip() + "…"
    d.text((PAD, link_y + 33), head, font=f_head, fill=C_INK)

    # 6) ramka posta
    d.rectangle((0, 0, CARD_W - 1, total_h - 1), outline=C_BORDER, width=1)
    return im


# ── Parser COPY-ZESTAW.md ──
_STATIC_ANGLES = ("demo", "problem", "lifestyle")
_VIDEO_RANK = {"baza": 0, "hookA": 1, "hookB": 2}
_STATIC_RANK = {"demo": 0, "problem": 1, "lifestyle": 2}


def _clean_quotes(s):
    return s.strip().strip("„“”\"'").strip()


def parse_copy(md_path):
    """Zwraca {'primary': str, 'ads': [{kind,key,label,headline}]} posortowane kanonicznie."""
    txt = open(md_path, encoding="utf-8").read()

    # primary #1 z sekcji PRIMARY TEXTS
    primary = None
    in_primary = False
    for line in txt.splitlines():
        if line.strip().startswith("## PRIMARY"):
            in_primary = True
            continue
        if in_primary:
            if line.strip().startswith("## "):
                break
            m = re.match(r"^\s*1\.\s+(.*)$", line)
            if m:
                primary = m.group(1).strip()
                break
    if not primary:
        raise SystemExit(f"[ad-post-preview] brak PRIMARY #1 w {md_path}")

    # headlines z sekcji HEADLINES
    ads = []
    in_head = False
    for line in txt.splitlines():
        if line.strip().startswith("## HEADLINES"):
            in_head = True
            continue
        if in_head:
            if line.strip().startswith("## "):
                break
            if "→" not in line:
                continue
            label, _, rhs = line.partition("→")
            label = label.strip().lstrip("-").strip()
            headline = _clean_quotes(rhs)
            low = label.lower()
            if "statyka" in low:
                angle = next((a for a in _STATIC_ANGLES if a in low), None)
                if angle:
                    ads.append({"kind": "static", "key": angle, "label": label, "headline": headline})
            elif "wideo" in low:
                if "hooka" in low:
                    key = "hookA"
                elif "hookb" in low:
                    key = "hookB"
                else:
                    key = "baza"
                ads.append({"kind": "video", "key": key, "label": label, "headline": headline})

    def rank(a):
        if a["kind"] == "static":
            return (0, _STATIC_RANK.get(a["key"], 9))
        return (1, _VIDEO_RANK.get(a["key"], 9))

    ads.sort(key=rank)
    return {"primary": primary, "ads": ads}


def _resolve_video_url(slug, key, ads_files):
    """Mapuj wariant wideo na plik w Storage bud-assets/<slug>/ads/."""
    mp4 = [f for f in ads_files if f.lower().endswith(".mp4")]
    if key == "baza":
        name = next((f for f in mp4 if f == "kreacja_15s.mp4"), None) or \
               next((f for f in mp4 if "hook" not in f.lower()), None)
    else:
        tag = key.lower()  # hooka / hookb
        name = next((f for f in mp4 if tag in f.lower()), None)
    if not name:
        name = "kreacja_15s.mp4"
    return f"{PUB_ATTACH}/bud-assets/{slug}/ads/{name}", name


def _list_ads_files(slug):
    r = requests.post(f"{ps.STORAGE}/object/list/attachments",
                      json={"prefix": f"bud-assets/{slug}/ads/", "limit": 100},
                      headers=ps.H, timeout=30)
    try:
        return [o["name"] for o in r.json() if isinstance(o, dict) and o.get("name")]
    except Exception:
        return []


def _resolve_avatar(project):
    """Awatar posta = favicon marki parasolowej (256px, crisp) → favicon_url → logo."""
    pslug = None
    m = re.search(r"parasol-([a-z0-9-]+)/", project.get("logo_url") or "")
    if m:
        pslug = m.group(1)
    cands = []
    if pslug:
        cands.append(f"{PUB_ATTACH}/bud-assets/parasol-{pslug}/brand/favicon-256.png")
    if project.get("favicon_url"):
        cands.append(project["favicon_url"])
    if project.get("logo_url"):
        cands.append(project["logo_url"])
    for u in cands:
        try:
            return _fetch_image(u)
        except Exception as e:
            log(f"awatar: {u} niedostępny ({e}) — próbuję dalej")
    raise SystemExit("[ad-post-preview] brak awatara (favicon/logo marki)")


def process_product(project, product, avatar, out_dir, upload=True, do_step=True):
    slug = product["slug"]
    domain = project.get("domain") or "sklep.pl"
    brand = project.get("name") or slug.capitalize()

    md_path = os.path.join(ADFORGE_ROOT, slug, "COPY-ZESTAW.md")
    if not os.path.isfile(md_path):
        log(f"⚠️ {slug}: brak {md_path} — pomijam produkt")
        return []
    copy = parse_copy(md_path)
    primary = copy["primary"]
    if len(primary) > 200:
        primary = primary[:200].rsplit(" ", 1)[0].rstrip() + "…"

    ads_files = _list_ads_files(slug)
    prod_out = os.path.join(out_dir, slug)
    os.makedirs(prod_out, exist_ok=True)

    results = []
    with tempfile.TemporaryDirectory() as td:
        for n, spec in enumerate(copy["ads"], 1):
            try:
                if spec["kind"] == "static":
                    src = os.path.join(ADFORGE_ROOT, slug, f"ad_{spec['key']}_45.png")
                    if not os.path.isfile(src):
                        log(f"⚠️ {slug}: brak statyki {src} — pomijam post-{n}")
                        continue
                    creative = _fit_creative(Image.open(src), 4 / 5)
                else:
                    vurl, vname = _resolve_video_url(slug, spec["key"], ads_files)
                    frame = _video_frame(vurl, td)
                    creative = _fit_creative(frame, 1.0)
                    log(f"{slug}: post-{n} wideo klatka z {vname}")

                post = render_post(avatar, brand, domain, primary, creative, spec["headline"])
                local = os.path.join(prod_out, f"post-{n}.png")
                post.save(local, "PNG")
                label = f"Podgląd posta: {spec['label']} — {spec['headline']}"

                if upload:
                    dest = f"bud-assets/{slug}/ads/preview/post-{n}.webp"
                    url = ps.storage_upload(local, dest, bucket=ps.DEFAULT_BUCKET,
                                            to_webp=True, quality=90)
                    ps.artifact_add(project["id"], product["id"], "ads_zestaw",
                                    kind="proof", url=url, label=label,
                                    meta={"kind": spec["kind"], "key": spec["key"],
                                          "headline": spec["headline"]},
                                    storage="supabase")
                    results.append({"url": url, "label": label, "local": local})
                    log(f"{slug}: post-{n} → {url}")
                else:
                    results.append({"url": None, "label": label, "local": local})
                    log(f"{slug}: post-{n} (lokalnie) → {local}")
            except Exception as e:
                log(f"⚠️ {slug}: post-{n} ({spec['label']}) FAIL — {e}")

    if upload and do_step and results:
        ps.step_update(project["id"], product["id"], "ads_zestaw", status="done",
                       note=f"Podglądy postów: {len(results)} szt. w artefaktach kroku")
        log(f"{slug}: krok ads_zestaw done + nota ({len(results)} podglądów)")
    return results


def main(argv=None):
    ap = argparse.ArgumentParser(prog="ad-post-preview.py",
                                 description="Podglądy postów Meta (feed) dla kroku ads_zestaw (PIL, $0).")
    ap.add_argument("project", help="uuid projektu (wf2_projects.id)")
    ap.add_argument("products", nargs="*", help="uuid produktów; domyślnie wszystkie 'gotowy'")
    ap.add_argument("--out", default=None, help="katalog lokalny na PNG (domyślnie scratchpad/tmp)")
    ap.add_argument("--no-upload", action="store_true", help="tylko render lokalny (bez Storage/panelu)")
    ap.add_argument("--no-step", action="store_true", help="bez noty kroku ads_zestaw")
    a = ap.parse_args(argv)

    proj_rows = ps._get("wf2_projects", {"id": f"eq.{a.project}",
                        "select": "id,name,domain,favicon_url,logo_url"})
    if not proj_rows:
        raise SystemExit(f"[ad-post-preview] brak projektu {a.project}")
    project = proj_rows[0]

    params = {"project_id": f"eq.{a.project}", "select": "id,name,slug,status"}
    if a.products:
        params["id"] = f"in.({','.join(a.products)})"
    else:
        params["status"] = "eq.gotowy"
    products = [p for p in ps._get("wf2_products", params) if p.get("slug")]
    if not products:
        raise SystemExit("[ad-post-preview] 0 produktów do podglądu")

    out_dir = a.out or os.path.join(tempfile.gettempdir(), "ad-post-preview")
    os.makedirs(out_dir, exist_ok=True)
    avatar = _resolve_avatar(project)

    total = 0
    for p in products:
        res = process_product(project, p, avatar, out_dir,
                              upload=not a.no_upload, do_step=not a.no_step)
        total += len(res)
    log(f"GOTOWE: {total} podglądów, {len(products)} produkt(ów)")


if __name__ == "__main__":
    main()
