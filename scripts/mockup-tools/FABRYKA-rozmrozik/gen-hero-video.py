# -*- coding: utf-8 -*-
"""F6 ANIM-3 Rozmrozik — 3 pętle cinemagraph przez bud-fal-proxy (Kling na fal.ai).

Beaty z PRZEWODNIKA (## SCENY ANIMOWANE): produkt ZAWSZE statyczny, nośnik ruchu
wystawiony (para/zasłona · para z miski · heat-haze+ściereczka). Kamera zablokowana.
Wynik: mp4 lokalnie (video/) + upload do Storage bud-assets/rozmrozik/video/.
"""
import io, json, re, sys, time, urllib.request, urllib.error

BASE = "https://yxmavwkwnfuphjqbelws.supabase.co"
PROXY = BASE + "/functions/v1/bud-fal-proxy"
MODEL = "fal-ai/kling-video/v2.1/standard/image-to-video"
ASSETS = BASE + "/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/"
OUT_PREFIX = "bud-assets/rozmrozik/video/"
LOCAL = r"C:\repos_tn\tn-crm\scripts\mockup-tools\FABRYKA-rozmrozik\video"

env = {}
for line in io.open(r"C:\repos_tn\tn-crm\.env", encoding="utf-8-sig"):
    line = line.strip()
    if "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1); env[k] = v.strip()
TOOLS = env["BUD_TOOLS_SECRET"]; SRV = env["SUPABASE_SERVICE_KEY"]

NEG = ("camera movement, camera pan, camera zoom, people appearing, faces, text, captions, "
       "watermark, product deforming or morphing, food changing shape, flicker, glitch, "
       "color shift, fast motion")

CLIPS = [
    {"id": "hero-loop", "src": "sc-hero-thawed.webp",
     "prompt": ("Cinemagraph-style very subtle looping motion: steam rises gently from the tea mug "
                "and slowly dissolves; the light sheer curtain by the window sways softly and returns. "
                "The defrosting box, the meat under the transparent dome, the frying pan and the "
                "counter stay perfectly still. Locked-off camera, photorealistic, calm seamless loop.")},
    {"id": "problem-loop", "src": "sc-problem.webp",
     "prompt": ("Cinemagraph-style very subtle looping motion: steam rises cyclically from the bowl "
                "of warm water in the sink and softly dissipates. The woman's hand, the meat pack, "
                "the microwave and the whole kitchen stay perfectly still. Locked-off camera, "
                "photorealistic, calm seamless loop.")},
    {"id": "final-loop", "src": "sc-final.webp",
     "prompt": ("Cinemagraph-style very subtle looping motion: gentle heat haze shimmers above the "
                "pan on the stove and the hanging kitchen towel sways very slightly and returns. "
                "The defrosting box and everything else stay perfectly still. Locked-off camera, "
                "warm evening light, photorealistic, calm seamless loop.")},
]

def proxy(op, **kw):
    body = json.dumps({"op": op, **kw}).encode("utf-8")
    req = urllib.request.Request(PROXY, data=body, headers={
        "Content-Type": "application/json", "x-tools-secret": TOOLS})
    try:
        return json.loads(urllib.request.urlopen(req, timeout=120).read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return {"_http": e.code, "_body": e.read().decode("utf-8", "replace")[:400]}

def to_jpg_b64(url):
    from PIL import Image
    import base64
    raw = urllib.request.urlopen(url, timeout=60).read()
    im = Image.open(io.BytesIO(raw)).convert("RGB")
    buf = io.BytesIO(); im.save(buf, "JPEG", quality=92)
    return base64.b64encode(buf.getvalue()).decode(), im.size

def main():
    import os
    os.makedirs(LOCAL, exist_ok=True)
    jobs = []
    for c in CLIPS:
        b64, size = to_jpg_b64(ASSETS + c["src"])
        st = proxy("store", path=f"rozmrozik-anim/{c['id']}-src.jpg", b64=b64, contentType="image/jpeg")
        src_url = st.get("publicUrl") or st.get("url")
        if not src_url:
            print(f"[{c['id']}] STORE FAIL: {st}"); continue
        sub = proxy("submit", model=MODEL, payload={
            "prompt": c["prompt"], "image_url": src_url, "duration": "5",
            "negative_prompt": NEG, "cfg_scale": 0.5})
        rid = sub.get("request_id")
        surl = sub.get("status_url"); rurl = sub.get("response_url")
        print(f"[{c['id']}] size={size} submit -> request_id={rid}")
        if not rid:
            print(f"[{c['id']}] SUBMIT FAIL: {json.dumps(sub)[:400]}"); continue
        jobs.append({**c, "rid": rid, "status_url": surl, "response_url": rurl})

    t0 = time.time()
    pending = list(jobs)
    while pending and time.time() - t0 < 1500:
        time.sleep(30)
        for j in list(pending):
            stt = proxy("poll", url=j["status_url"] + "?logs=0")
            s = stt.get("status")
            print(f"  poll {j['id']}: {s}")
            if s == "COMPLETED":
                res = proxy("poll", url=j["response_url"])
                vurl = ((res.get("video") or {}).get("url")) or res.get("video_url")
                if not vurl:
                    print(f"[{j['id']}] RESULT bez video: {json.dumps(res)[:300]}")
                    pending.remove(j); continue
                mp4 = urllib.request.urlopen(vurl, timeout=300).read()
                lp = f"{LOCAL}\\{j['id']}.mp4"
                open(lp, "wb").write(mp4)
                up = urllib.request.Request(
                    BASE + f"/storage/v1/object/attachments/{OUT_PREFIX}{j['id']}.mp4",
                    data=mp4, method="POST",
                    headers={"apikey": SRV, "Authorization": "Bearer " + SRV,
                             "Content-Type": "video/mp4", "x-upsert": "true"})
                try:
                    urllib.request.urlopen(up, timeout=120).read()
                    print(f"[{j['id']}] DONE {len(mp4)//1024} KB -> {OUT_PREFIX}{j['id']}.mp4 + {lp}")
                except urllib.error.HTTPError as e:
                    print(f"[{j['id']}] mp4 lokalnie OK, upload Storage FAIL {e.code}: {e.read()[:200]}")
                pending.remove(j)
            elif s in ("FAILED", "ERROR"):
                print(f"[{j['id']}] FAILED: {json.dumps(stt)[:300]}")
                pending.remove(j)
    for j in pending:
        print(f"[{j['id']}] TIMEOUT pollingu (>25 min) — request_id={j['rid']} (dokończ ręcznie)")

main()
