# -*- coding: utf-8 -*-
"""Rehost makiet (F2) + kompozytow dopasowania (F7) do Storage bud-assets/nakrecik/ + rejestracja
wf2_artifacts (lp_makiety / lp_dopasowanie) + wf2_costs (kind='openai-image', step lp_makiety).
NAKRECIK. PNG->WebP q82. Idempotentne (artifact_add dedup po url; cost_add dedup po note).
Wzor: rehost.py + panel-sync.artifact_add/cost_add."""
import io, os, sys, json, importlib.util, urllib.request
from PIL import Image
sys.stdout.reconfigure(encoding="utf-8")

HERE = os.path.dirname(os.path.abspath(__file__))
SM = os.path.normpath(os.path.join(HERE, ".."))     # scripts/mockup-tools
MAK = os.path.join(HERE, "makiety")
DOP = os.path.join(HERE, "dopasowanie")
BASE = "https://yxmavwkwnfuphjqbelws.supabase.co"
PUB = BASE + "/storage/v1/object/public/attachments/"
SLUG = "nakrecik"
PROJECT = "62e5422a-9475-4e9b-afa3-483c53b62169"
PRODUCT = "ee6e4040-1551-4447-a037-3c4bfc8bd878"

env = {}
for line in io.open(r"C:\repos_tn\tn-crm\.env", encoding="utf-8-sig"):
    line = line.strip()
    if "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1); env[k] = v.strip()
SRV = env["SUPABASE_SERVICE_KEY"]

spec = importlib.util.spec_from_file_location("psync", os.path.join(SM, "panel-sync.py"))
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

def upload(path, data, ct):
    req = urllib.request.Request(BASE + "/storage/v1/object/attachments/" + path, data=data, method="POST",
        headers={"apikey": SRV, "Authorization": "Bearer " + SRV, "Content-Type": ct, "x-upsert": "true"})
    urllib.request.urlopen(req, timeout=180).read()

def to_webp(pil, maxw=1600):
    im = pil.convert("RGB"); w, h = im.size
    if w > maxw:
        im = im.resize((maxw, int(h * maxw / w)))
    buf = io.BytesIO(); im.save(buf, "WEBP", quality=82, method=6)
    return buf.getvalue(), im.size

# name -> (section, viewport, kind)
DESK = ["hero","zaufanie","problem","rozwiazanie","demo","zastosowania","korzysci","tryby",
        "porownanie","mid-cta","opinie","zdjecia-kupujacych","galeria","zamow","faq","final"]
DNUM = {s: "%02d-%s" % (i+1, s) for i, s in enumerate(DESK)}
MOBILE = ["hero","problem","rozwiazanie","demo","zastosowania","mid-cta","zamow","final"]

n_up = 0
# 1) makiety desktop
for sec in DESK:
    name = DNUM[sec]
    src = os.path.join(MAK, name + ".png")
    data, size = to_webp(Image.open(src))
    dest = f"bud-assets/{SLUG}/makiety/{name}.webp"
    upload(dest, data, "image/webp"); n_up += 1
    url = PUB + dest
    ps.artifact_add(PROJECT, PRODUCT, "lp_makiety", "makieta", url,
                    label=f"Makieta · {sec} (desktop)",
                    meta={"section": sec, "viewport": "desktop"})
    print("OK makieta", name, size, flush=True)

# 2) makiety mobile
for sec in MOBILE:
    name = DNUM[sec] + "-m"
    src = os.path.join(MAK, name + ".png")
    data, size = to_webp(Image.open(src), maxw=1080)
    dest = f"bud-assets/{SLUG}/makiety/{name}.webp"
    upload(dest, data, "image/webp"); n_up += 1
    url = PUB + dest
    ps.artifact_add(PROJECT, PRODUCT, "lp_makiety", "makieta_mobile", url,
                    label=f"Makieta · {sec} (mobile)",
                    meta={"section": sec, "viewport": "mobile"})
    print("OK makieta-m", name, size, flush=True)

# 3) kompozyty dopasowania (F7)
for sec in DESK:
    name = DNUM[sec]
    src = os.path.join(DOP, name + ".png")
    if not os.path.isfile(src):
        continue
    data, size = to_webp(Image.open(src))
    dest = f"bud-assets/{SLUG}/dopasowanie/{name}.webp"
    upload(dest, data, "image/webp"); n_up += 1
    url = PUB + dest
    ps.artifact_add(PROJECT, PRODUCT, "lp_dopasowanie", "dopasowanie", url,
                    label=f"Dopasowanie · {sec} [makieta|render]",
                    meta={"section": sec})
    print("OK dopas", name, size, flush=True)

# 4) koszt gpt-image do wf2_costs (24 makiety gpt-image-2 HIGH; 16 desktop 3:2 + 8 mobile 2:3)
ps.cost_add(PROJECT, PRODUCT, amount=5.04, kind="openai-image", currency="USD",
            step="lp_makiety",
            note="F2 REGEN makiety strony: 24x gpt-image-2 HIGH (16 desktop 1536x1024 + 8 mobile 1024x1536), tor LOKALNY /edits+/generations")

print(f"GOTOWE: {n_up} plikow do Storage + artefakty + koszt", flush=True)
