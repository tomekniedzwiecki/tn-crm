# -*- coding: utf-8 -*-
"""Generator makiet ZAKLIPEK (F2) — LOKALNY OpenAI gpt-image-2 HIGH.
Uzycie:
  python _gen.py <outname.png> <size> <prompt_file> [ref1.png ref2.png ...]
size: 1536x1024 (desktop 3:2) | 1024x1536 (mobile 2:3) | 1024x1024
Gdy podane refy -> /v1/images/edits (styl-master/product jako referencja DNA).
Bez refow -> /v1/images/generations (np. sekcja `problem` bez produktu).
Retry na blipach (429/5xx/520). PLIK zapisany do makiety/<outname>."""
import os, sys, io, re, json, time, base64, urllib.request
import requests

sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
ENV = io.open(r"c:/repos_tn/tn-crm/.env", encoding="utf-8-sig", errors="ignore").read()
OPENAI_KEY = re.search(r"^OPENAI_API_KEY=(.+)$", ENV, re.M).group(1).strip()

def gen_generations(prompt, size):
    body = json.dumps({"model": "gpt-image-2", "prompt": prompt, "n": 1,
                       "size": size, "quality": "high"}).encode("utf-8")
    req = urllib.request.Request("https://api.openai.com/v1/images/generations",
        data=body, headers={"Content-Type": "application/json",
                            "Authorization": "Bearer " + OPENAI_KEY})
    raw = urllib.request.urlopen(req, timeout=600).read()
    j = json.loads(raw.decode("utf-8"))
    b64 = (j.get("data") or [{}])[0].get("b64_json")
    if not b64:
        raise RuntimeError("pusta odpowiedz: " + json.dumps(j)[:300])
    return base64.b64decode(b64)

def gen_edits(prompt, size, refs):
    files = []
    for i, r in enumerate(refs):
        files.append(("image[]", (os.path.basename(r), open(r, "rb").read(), "image/png")))
    data = {"model": "gpt-image-2", "prompt": prompt, "n": "1",
            "size": size, "quality": "high"}
    resp = requests.post("https://api.openai.com/v1/images/edits",
        headers={"Authorization": "Bearer " + OPENAI_KEY},
        data=data, files=files, timeout=600)
    if resp.status_code >= 400:
        raise urllib.error.HTTPError(resp.url, resp.status_code, resp.text[:300], None, None)
    j = resp.json()
    b64 = (j.get("data") or [{}])[0].get("b64_json")
    if not b64:
        raise RuntimeError("pusta odpowiedz edits: " + json.dumps(j)[:300])
    return base64.b64decode(b64)

def main():
    outname, size, prompt_file = sys.argv[1:4]
    refs = sys.argv[4:]
    prompt = io.open(prompt_file, encoding="utf-8").read()
    last = None
    for attempt in range(1, 5):
        try:
            blob = gen_edits(prompt, size, refs) if refs else gen_generations(prompt, size)
            from PIL import Image
            im = Image.open(io.BytesIO(blob)).convert("RGB")
            out = os.path.join(HERE, outname)
            im.save(out)
            print("OK %s [%s] %s -> %s" % (outname, "edits" if refs else "gen", im.size, out))
            return
        except Exception as e:
            last = e
            code = getattr(e, "code", None)
            transient = code in (429, 500, 502, 503, 504, 520, 522, 524) or code is None
            print("  [%d/4] %s (code=%s)" % (attempt, str(e)[:180], code))
            if attempt < 4 and transient:
                time.sleep(8 * attempt); continue
            break
    raise last

if __name__ == "__main__":
    main()
