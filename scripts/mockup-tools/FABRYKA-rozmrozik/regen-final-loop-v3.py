# -*- coding: utf-8 -*-
"""Regen final-loop (v2) — FAIL v1: kopuła zmorfowała w mleczną świecącą bryłę.
Twardy lock produktu w prompcie + rozszerzony NEG."""
import io, json, time, urllib.request, urllib.error

BASE = "https://yxmavwkwnfuphjqbelws.supabase.co"
PROXY = BASE + "/functions/v1/bud-fal-proxy"
MODEL = "fal-ai/kling-video/v2.1/pro/image-to-video"
SRC = BASE + "/storage/v1/object/public/attachments/video-factory/rozmrozik-anim/final-loop-src.jpg"
OUT = "bud-assets/rozmrozik/video/final-loop.mp4"
LOCAL = r"C:\repos_tn\tn-crm\scripts\mockup-tools\FABRYKA-rozmrozik\video\final-loop.mp4"

env = {}
for line in io.open(r"C:\repos_tn\tn-crm\.env", encoding="utf-8-sig"):
    line = line.strip()
    if "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1); env[k] = v.strip()
TOOLS = env["BUD_TOOLS_SECRET"]; SRV = env["SUPABASE_SERVICE_KEY"]

PROMPT = ("Cinemagraph-style very subtle looping motion: ONLY the faint heat haze above the pan "
          "shimmers and the hanging striped kitchen towel sways very slightly. The transparent "
          "plastic dome of the defrosting box stays PERFECTLY CLEAR and see-through exactly as in "
          "the input image, the silver aluminum plate inside stays visible through it, nothing "
          "about the box changes — no glow, no light, no color change, no material change. "
          "The hand with tongs stays still. Locked-off camera, photorealistic, calm seamless loop.")
NEG = ("camera movement, camera pan, camera zoom, product glowing, dome turning opaque, milky "
       "white dome, dome color change, tray color change, light emitting from the box, object "
       "morphing, melting, people, faces, text, watermark, flicker, glitch, fast motion")

def proxy(op, **kw):
    body = json.dumps({"op": op, **kw}).encode("utf-8")
    req = urllib.request.Request(PROXY, data=body, headers={
        "Content-Type": "application/json", "x-tools-secret": TOOLS})
    try:
        return json.loads(urllib.request.urlopen(req, timeout=120).read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return {"_http": e.code, "_body": e.read().decode("utf-8", "replace")[:400]}

sub = proxy("submit", model=MODEL, payload={
    "prompt": PROMPT, "image_url": SRC, "duration": "5",
    "negative_prompt": NEG, "cfg_scale": 0.7})
rid = sub.get("request_id")
print("submit ->", rid or json.dumps(sub)[:300])
if not rid:
    raise SystemExit(1)

t0 = time.time()
while time.time() - t0 < 900:
    time.sleep(30)
    stt = proxy("poll", url=sub["status_url"] + "?logs=0")
    s = stt.get("status")
    print("poll:", s)
    if s == "COMPLETED":
        res = proxy("poll", url=sub["response_url"])
        vurl = ((res.get("video") or {}).get("url")) or res.get("video_url")
        if not vurl:
            print("RESULT bez video:", json.dumps(res)[:300]); break
        mp4 = urllib.request.urlopen(vurl, timeout=300).read()
        open(LOCAL, "wb").write(mp4)
        up = urllib.request.Request(
            BASE + f"/storage/v1/object/attachments/{OUT}",
            data=mp4, method="POST",
            headers={"apikey": SRV, "Authorization": "Bearer " + SRV,
                     "Content-Type": "video/mp4", "x-upsert": "true"})
        urllib.request.urlopen(up, timeout=120).read()
        print(f"DONE v2 {len(mp4)//1024} KB -> {OUT} (nadpisane) + {LOCAL}")
        break
    if s in ("FAILED", "ERROR"):
        print("FAILED:", json.dumps(stt)[:300]); break
