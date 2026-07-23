# -*- coding: utf-8 -*-
"""Hero-loop Brzuszek v2 — produkt AKTYWNY: pokazujemy DZIAŁANIE (feedback Tomka 23.07).
Beat: jedno wolne, kontrolowane powtórzenie crunch — wózek z U-wałkiem sunie po pochyłej
belce ku konsoli i wraca; rama sztywna. Ping-pong = naturalny rytm powtórzeń."""
import io, json, subprocess, time, urllib.request, urllib.error, os

BASE = "https://yxmavwkwnfuphjqbelws.supabase.co"
PROXY = BASE + "/functions/v1/bud-fal-proxy"
MODEL = "fal-ai/kling-video/v2.1/pro/image-to-video"
SRC = BASE + "/storage/v1/object/public/attachments/video-factory/hero-loops/brzuszek-src.jpg"
LOCAL = r"C:\repos_tn\tn-crm\scripts\mockup-tools\hero-loops"

env = {}
for line in io.open(r"C:\repos_tn\tn-crm\.env", encoding="utf-8-sig"):
    line = line.strip()
    if "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1); env[k] = v.strip()
TOOLS = env["BUD_TOOLS_SECRET"]; SRV = env["SUPABASE_SERVICE_KEY"]

PROMPT = ("The woman performs ONE slow, controlled abdominal crunch repetition on the folding "
          "ab machine, exactly as the machine is designed to work: the kneeling carriage with "
          "the pink U-shaped knee roller GLIDES smoothly UP along the inclined white rail as "
          "she pulls her knees toward her chest, her torso folds slightly forward, then the "
          "carriage glides smoothly back DOWN to the starting position. Her hands stay on the "
          "fixed handlebar, forearms resting on the pink rollers by the console. The white "
          "A-frame of the machine stays completely rigid and planted on the rug — only the "
          "carriage and her body move along the rail. Sheer curtain sways very gently. "
          "Locked-off camera, photorealistic, smooth controlled exercise form, natural speed.")
NEG = ("camera movement, camera pan, camera zoom, machine frame bending or deforming, frame "
       "morphing, extra limbs, extra fingers, face visible, face distortion, body distortion, "
       "product color change, new objects, text, captions, watermark, flicker, glitch, "
       "fast jerky motion, jumping, standing up")

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
    "negative_prompt": NEG, "cfg_scale": 0.7})
rid = sub.get("request_id")
print("submit ->", rid or json.dumps(sub)[:300])
if not rid:
    raise SystemExit(1)

t0 = time.time()
while time.time() - t0 < 1200:
    time.sleep(30)
    s = proxy("poll", url=sub["status_url"] + "?logs=0").get("status")
    print("poll:", s)
    if s == "COMPLETED":
        res = proxy("poll", url=sub["response_url"])
        vurl = ((res.get("video") or {}).get("url")) or res.get("video_url")
        raw = urllib.request.urlopen(vurl, timeout=300).read()
        rawp = os.path.join(LOCAL, "brzuszek-hero-v2-raw.mp4")
        open(rawp, "wb").write(raw)
        pp = os.path.join(LOCAL, "brzuszek-hero-v2-pp.mp4")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", rawp,
            "-filter_complex", "[0:v]split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[v]",
            "-map", "[v]", "-an", "-c:v", "libx264", "-crf", "27", "-preset", "medium",
            "-movflags", "+faststart", "-pix_fmt", "yuv420p", pp], check=True)
        poster = os.path.join(LOCAL, "brzuszek-hero-v2-poster.jpg")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", rawp,
            "-frames:v", "1", "-qscale:v", "3", poster], check=True)
        from PIL import Image
        Image.open(poster).save(poster.replace(".jpg", ".webp"), "WEBP", quality=80)
        # upload pod NOWĄ nazwą (v2) — stary URL może wisieć w CDN cache
        for name, path, ct in [
            ("bud-assets/brzuszek/video/hero-loop-pp-v2.mp4", pp, "video/mp4"),
            ("bud-assets/brzuszek/video/hero-loop-poster-v2.webp", poster.replace(".jpg", ".webp"), "image/webp"),
            ("bud-assets/brzuszek/assets/hero-video.mp4", pp, "video/mp4"),
        ]:
            data = open(path, "rb").read()
            req = urllib.request.Request(BASE + "/storage/v1/object/attachments/" + name,
                data=data, method="POST",
                headers={"apikey": SRV, "Authorization": "Bearer " + SRV,
                         "Content-Type": ct, "x-upsert": "true"})
            urllib.request.urlopen(req, timeout=120).read()
            print("UP", name, len(data)//1024, "KB")
        break
    if s in ("FAILED", "ERROR"):
        print("FAILED:", s); break
