# -*- coding: utf-8 -*-
# Helper: wolaj wf2-gen generate-image (gpt-image-2). UTF-8.
# Uzycie: python genimg.py <prompt.txt> <workflow_id> <aspect> <quality> <outdir> [ref1 ref2 ...]
# aspect: format Gemini "3:2" | "2:3" | "1:1" (pikselowe "1536x1024" itp. sa MAPOWANE na Gemini —
#         edge przy nieznanej wartosci robi CICHY fallback do 1:1 = kwadrat; incydent masazer 19.07)
# ref:    "url" (typ 'ref' — scena/styl) LUB "type:url", np. "product:https://..." (wiernosc 1:1,
#         idzie jako image[0]) / "logo:https://..." — ZAWSZE wysylane jako OBIEKTY {url,type}
# Zapisuje: <outdir>/<workflow_id>.url (URL) + pobiera PNG podglad <outdir>/<workflow_id>.png
import sys, json, io, os, urllib.request, re

ASPECT_MAP = {"1536x1024": "3:2", "1024x1536": "2:3", "1024x1024": "1:1",
              "3:2": "3:2", "2:3": "2:3", "1:1": "1:1"}

BASE = "https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-gen"
def secret():
    txt = io.open(r"c:/repos_tn/tn-crm/.env", encoding="utf-8", errors="ignore").read()
    m = re.search(r"^WF2_GEN_SECRET=(.+)$", txt, re.M)
    return m.group(1).strip()

prompt_path, wfid, aspect, quality, outdir = sys.argv[1:6]
refs = sys.argv[6:]
prompt = io.open(prompt_path, encoding="utf-8").read()
os.makedirs(outdir, exist_ok=True)

if aspect not in ASPECT_MAP:
    print(f"BLAD: aspect '{aspect}' nieznany (dozwolone: {sorted(set(ASPECT_MAP))}) — "
          "edge zrobilby cichy fallback do 1:1"); sys.exit(2)

def _ref_obj(r):
    m = re.match(r"^(product|logo|ref):(https?://.+)$", r)
    return {"url": m.group(2), "type": m.group(1)} if m else {"url": r, "type": "ref"}

payload = {"fn":"generate-image","payload":{
    "prompt": prompt, "count": 1, "workflow_id": wfid,
    "type":"mockup", "provider":"gpt-image-2", "quality": quality,
    "aspect_ratio": ASPECT_MAP[aspect],
}}
if refs:
    payload["payload"]["reference_images"] = [_ref_obj(r) for r in refs]

body = json.dumps(payload).encode("utf-8")
req = urllib.request.Request(BASE, data=body, headers={
    "Content-Type":"application/json", "x-wf2-secret": secret()})
raw = urllib.request.urlopen(req, timeout=600).read()
j = json.loads(raw.decode("utf-8"))
imgs = j.get("images") or []
if not imgs:
    print("NO IMAGES. resp:", json.dumps(j)[:800]); sys.exit(1)
url = imgs[0].get("url")
io.open(os.path.join(outdir, wfid+".url"),"w",encoding="utf-8").write(url)
# download preview
try:
    data = urllib.request.urlopen(url, timeout=120).read()
    ext = ".png"
    open(os.path.join(outdir, wfid+"_raw"), "wb").write(data)
    from PIL import Image
    im = Image.open(io.BytesIO(data)).convert("RGB")
    im.save(os.path.join(outdir, wfid+".png"))
    print("OK", wfid, im.size, "->", url)
except Exception as e:
    print("saved url but preview FAIL:", e, "url=", url)
