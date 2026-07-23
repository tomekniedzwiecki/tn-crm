# -*- coding: utf-8 -*-
"""Hero-loop v3 Rozgrzewek — v2 FAIL wierności (display przebarwiony na czerwono, kubek
różowy; amplituda 8.97 częściowo z przebarwień). v3: para dominująca + glow TYLKO pod
kulkami, DISPLAY i KUBEK zamrożone twardym NEG. Gate: amplituda >= 7.0 (czysty ruch,
bez przebarwień — próg minimalnie niżej, bo bez fałszywej amplitudy koloru)
+ RĘCZNA inspekcja klatek przez główną sesję PRZED podmianą w landingu."""
import io, json, subprocess, time, urllib.request, urllib.error, os

BASE = "https://yxmavwkwnfuphjqbelws.supabase.co"
PROXY = BASE + "/functions/v1/bud-fal-proxy"
MODEL = "fal-ai/kling-video/v2.1/pro/image-to-video"
SCRATCH = r"C:\Users\tomek\AppData\Local\Temp\claude\c--repos-tn\e7bbf08e-df82-420b-a8c9-42f30dd45047\scratchpad"
SRC = BASE + "/storage/v1/object/public/attachments/bud-assets/rozgrzewek/video/hero-src-v2.jpg"

env = {}
for line in io.open(r"C:\repos_tn\tn-crm\.env", encoding="utf-8-sig"):
    line = line.strip()
    if "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1); env[k] = v.strip()
TOOLS = env["BUD_TOOLS_SECRET"]; SRV = env["SUPABASE_SERVICE_KEY"]

PROMPT = ("Thick, clearly visible white steam rises from the beige mug behind the massager, "
          "swirling upward in a continuous, lively dancing ribbon filling the upper right of "
          "the frame. The soft warm red glow under the massage head between the silver rollers "
          "pulses gently - slightly brightening and dimming at the floor level only. "
          "Everything else is completely frozen: the navy massager body, buttons and the small "
          "round display keep EXACTLY the same look, colors and digits as the first frame; "
          "the beige mug keeps exactly the same beige color; the lamp stays constant. "
          "Locked-off camera, photorealistic, warm cozy evening mood.")
NEG = ("camera movement, camera pan, camera zoom, product morphing, device moving or tilting, "
       "display changing color, display turning red, digits changing, screen glow spreading, "
       "mug changing color, mug turning red or pink, background color shift, scene turning red, "
       "fire, flames, new objects, hands, people, text, captions, watermark, flicker, glitch")

def proxy(op, **kw):
    body = json.dumps({"op": op, **kw}).encode("utf-8")
    req = urllib.request.Request(PROXY, data=body, headers={
        "Content-Type": "application/json", "x-tools-secret": TOOLS})
    try:
        return json.loads(urllib.request.urlopen(req, timeout=120).read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return {"_http": e.code, "_body": e.read().decode("utf-8", "replace")[:300]}

sub = proxy("submit", model=MODEL, payload={
    "prompt": PROMPT, "image_url": SRC, "duration": "5",
    "negative_prompt": NEG, "cfg_scale": 0.75})
rid = sub.get("request_id")
print("submit ->", rid or json.dumps(sub)[:300])
if not rid:
    raise SystemExit(1)

t0 = time.time()
while time.time() - t0 < 1200:
    time.sleep(25)
    s = proxy("poll", url=sub["status_url"] + "?logs=0").get("status")
    print("poll:", s)
    if s == "COMPLETED":
        break
    if s in ("FAILED", "ERROR"):
        raise SystemExit("FAL FAILED")

res = proxy("poll", url=sub["response_url"])
vurl = ((res.get("video") or {}).get("url")) or res.get("video_url")
if not vurl:
    raise SystemExit("BRAK video.url: " + json.dumps(res)[:600])
rawp = os.path.join(SCRATCH, "rozgrzewek-v3-raw.mp4")
open(rawp, "wb").write(urllib.request.urlopen(vurl, timeout=300).read())
pp = os.path.join(SCRATCH, "rozgrzewek-v3-pp.mp4")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", rawp,
    "-filter_complex", "[0:v]split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[v]",
    "-map", "[v]", "-an", "-c:v", "libx264", "-crf", "27", "-preset", "medium",
    "-movflags", "+faststart", "-pix_fmt", "yuv420p", pp], check=True)

from PIL import Image, ImageChops, ImageStat
fr = {}
for t in ("0", "2.5", "5"):
    fp = os.path.join(SCRATCH, f"rozgrzewek-v3-f{t}.jpg")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", t, "-i", pp,
                    "-frames:v", "1", "-qscale:v", "3", fp], check=True)
    fr[t] = Image.open(fp).convert("L")
d25 = ImageStat.Stat(ImageChops.difference(fr["0"], fr["2.5"])).mean[0]
d5 = ImageStat.Stat(ImageChops.difference(fr["0"], fr["5"])).mean[0]
print(f"AMPLITUDA v3: 0-2.5 = {d25:.2f} | 0-5 = {d5:.2f} (prog >= 7.0)")
print("KLATKI do inspekcji: rozgrzewek-v3-f0/2.5/5.jpg — NIE uploaduje, decyzja glownej sesji")
