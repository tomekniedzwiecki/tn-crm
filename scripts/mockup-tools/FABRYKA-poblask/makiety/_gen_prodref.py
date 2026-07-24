# -*- coding: utf-8 -*-
"""Clean PRODUCT-REF packshot dla makiet POBLASK — thin flat RGB LED light-strip + USB controller."""
import os, sys, io, re, json, time, base64, urllib.request
sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "_product-ref.png")
ENV = io.open(r"c:/repos_tn/tn-crm/.env", encoding="utf-8-sig", errors="ignore").read()
KEY = re.search(r"^OPENAI_API_KEY=(.+)$", ENV, re.M).group(1).strip()
PROMPT = (
 "A clean high-quality studio product PACKSHOT on a soft LIGHT neutral surface (cool light "
 "lavender/platinum, gentle gradient, soft shadow): a SLIM, FLAT, FLEXIBLE car-interior RGB LED "
 "ambient light-strip — a thin dark flexible base with a light-guide top edge that emits a "
 "CONTINUOUS LINE of colour glowing a smooth RGB rainbow gradient along its length; the strip is "
 "gently curved/coiled once to show it is flexible. Next to it, a small translucent USB controller "
 "module with a USB-A plug and a single button, and a thin cable. It is a THIN FLAT STRIP, NOT a "
 "round fibre-optic rope, NOT a thick tube, NOT a glass neon tube. Photoreal, crisp, premium, even "
 "soft light. NO printed brand text, NO logos, NO burned text, no packaging, single product only.")
def gen():
    body = json.dumps({"model":"gpt-image-2","prompt":PROMPT,"n":1,"size":"1536x1024","quality":"high"}).encode()
    for a in range(1,4):
        try:
            req=urllib.request.Request("https://api.openai.com/v1/images/generations",data=body,
                headers={"Content-Type":"application/json","Authorization":"Bearer "+KEY})
            j=json.loads(urllib.request.urlopen(req,timeout=600).read().decode())
            b64=(j.get("data") or [{}])[0].get("b64_json")
            if not b64: raise RuntimeError("empty")
            return base64.b64decode(b64)
        except Exception as e:
            print("  retry",a,str(e)[:120]);
            if a<3: time.sleep(8*a)
            else: raise
from PIL import Image
Image.open(io.BytesIO(gen())).convert("RGB").save(OUT)
print("OK product-ref ->", OUT)
