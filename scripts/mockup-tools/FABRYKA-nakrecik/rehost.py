# -*- coding: utf-8 -*-
"""Rehost scen (F3) + zdjec kupujacych do Storage bud-assets/nakrecik/. NAKRECIK.
PNG->WebP q82 (max szer 1600), upload service-role x-upsert. Zdjecia kupujacych:
pobierz z bud-reviews/1005006455949937 i wgraj jako reviews/buy-1..5.webp.
Zapis asset-urls.json. Wzor: migotek rehost."""
import io, os, json, urllib.request
from PIL import Image

BASE = "https://yxmavwkwnfuphjqbelws.supabase.co"
SLUG = "nakrecik"
HERE = os.path.dirname(os.path.abspath(__file__))
MAK = os.path.join(HERE, "makiety")
PUB = BASE + "/storage/v1/object/public/attachments/"

env = {}
for line in io.open(r"C:\repos_tn\tn-crm\.env", encoding="utf-8-sig"):
    line = line.strip()
    if "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1); env[k] = v.strip()
SRV = env["SUPABASE_SERVICE_KEY"]

def upload(path, data, ct):
    req = urllib.request.Request(BASE + "/storage/v1/object/attachments/" + path, data=data, method="POST",
        headers={"apikey": SRV, "Authorization": "Bearer " + SRV, "Content-Type": ct, "x-upsert": "true"})
    urllib.request.urlopen(req, timeout=180).read()

# scena PNG -> asset webp
SCENES = {
    "sc-hero-d.png": "sc-hero-d.webp", "sc-hero-m.png": "sc-hero-m.webp",
    "sc-problem.png": "sc-problem.webp", "sc-rozwiazanie.png": "sc-rozwiazanie.webp",
    "sc-demo-1.png": "sc-demo-1.webp", "sc-demo-2.png": "sc-demo-2.webp", "sc-demo-3.png": "sc-demo-3.webp",
    "sc-uzycie-kuchnia.png": "sc-uzycie-kuchnia.webp", "sc-uzycie-diy.png": "sc-uzycie-diy.webp",
    "sc-uzycie-sport.png": "sc-uzycie-sport.webp", "sc-uzycie-rodzic.png": "sc-uzycie-rodzic.webp",
    "sc-tryby.png": "sc-tryby.webp", "sc-midcta.png": "sc-midcta.webp", "sc-final.png": "sc-final.webp",
    "sc-og.png": "sc-og.webp", "pack-grafit.png": "pack-grafit.webp", "pack-green.png": "pack-green.webp",
}
urls = {}
for src, dst in SCENES.items():
    im = Image.open(os.path.join(MAK, src)).convert("RGB")
    w, h = im.size
    if w > 1600:
        im = im.resize((1600, int(h * 1600 / w)))
    buf = io.BytesIO(); im.save(buf, "WEBP", quality=82, method=6)
    data = buf.getvalue()
    upload(f"bud-assets/{SLUG}/assets/{dst}", data, "image/webp")
    urls[dst] = PUB + f"bud-assets/{SLUG}/assets/{dst}"
    print(f"OK assets/{dst}  {im.size}  {len(data)//1024}KB", flush=True)

# zdjecia kupujacych: bud-reviews -> reviews/buy-N.webp (GALERIA 3: 8-0,7-0,0-0,3-0,9-1)
BUY = [("8-0.webp", "buy-1.webp"), ("7-0.webp", "buy-2.webp"), ("0-0.webp", "buy-3.webp"),
       ("3-0.webp", "buy-4.webp"), ("9-1.webp", "buy-5.webp")]
SRC_REV = PUB + "bud-reviews/1005006455949937/"
for src, dst in BUY:
    raw = urllib.request.urlopen(SRC_REV + src, timeout=60).read()
    upload(f"bud-assets/{SLUG}/reviews/{dst}", raw, "image/webp")
    urls[dst] = PUB + f"bud-assets/{SLUG}/reviews/{dst}"
    print(f"OK reviews/{dst}  {len(raw)//1024}KB", flush=True)

json.dump(urls, io.open(os.path.join(HERE, "asset-urls.json"), "w", encoding="utf-8"), indent=1, ensure_ascii=False)
print("asset-urls.json ->", len(urls), "assetow")
