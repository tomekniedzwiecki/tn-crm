# -*- coding: utf-8 -*-
"""Hero-loopy Brzuszek + Rozgrzewek (Kling PRO — lekcja final-loop: standard morfuje).
Beaty z PRZEWODNIKÓW: produkt/człowiek STATYCZNE, nośnik ruchu ambientowy.
Wynik: *-pp.mp4 (ping-pong 10 s) + poster → Storage bud-assets/<slug>/video/ + assets/hero-video.mp4."""
import io, json, subprocess, time, urllib.request, urllib.error, os

BASE = "https://yxmavwkwnfuphjqbelws.supabase.co"
PROXY = BASE + "/functions/v1/bud-fal-proxy"
MODEL = "fal-ai/kling-video/v2.1/pro/image-to-video"
LOCAL = r"C:\repos_tn\tn-crm\scripts\mockup-tools\hero-loops"

env = {}
for line in io.open(r"C:\repos_tn\tn-crm\.env", encoding="utf-8-sig"):
    line = line.strip()
    if "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1); env[k] = v.strip()
TOOLS = env["BUD_TOOLS_SECRET"]; SRV = env["SUPABASE_SERVICE_KEY"]

NEG = ("camera movement, camera pan, camera zoom, people moving, person moving, face, "
       "product deforming or morphing, machine moving, object color change, glow, text, "
       "captions, watermark, flicker, glitch, fast motion, new objects appearing")

CLIPS = [
    {"slug": "brzuszek",
     "src": BASE + "/storage/v1/object/public/attachments/bud-assets/brzuszek/assets/sc-hero.webp",
     "prompt": ("Cinemagraph-style very subtle looping motion: the light sheer curtain by the "
                "window sways gently in a draft and the leaves of the houseplant tremble very "
                "slightly. The woman holding her crunch position and the white-pink exercise "
                "machine stay PERFECTLY still, frozen like a photograph. Locked-off camera, "
                "photorealistic, calm seamless loop.")},
    {"slug": "rozgrzewek",
     "src": BASE + "/storage/v1/object/public/attachments/bud-assets/rozgrzewek/assets/sc-hero.webp",
     "prompt": ("Cinemagraph-style very subtle looping motion: a thin wisp of steam rises slowly "
                "from the blurred tea mug at the edge of the frame and dissolves; the warm lamp "
                "glow breathes almost imperceptibly. The navy-blue massager product in the center "
                "stays PERFECTLY still and unchanged, like a photograph. Locked-off camera, "
                "photorealistic, calm seamless loop.")},
]

def proxy(op, **kw):
    body = json.dumps({"op": op, **kw}).encode("utf-8")
    req = urllib.request.Request(PROXY, data=body, headers={
        "Content-Type": "application/json", "x-tools-secret": TOOLS})
    try:
        return json.loads(urllib.request.urlopen(req, timeout=120).read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return {"_http": e.code, "_body": e.read().decode("utf-8", "replace")[:300]}

def to_jpg_b64(url):
    from PIL import Image
    import base64
    raw = urllib.request.urlopen(url, timeout=60).read()
    im = Image.open(io.BytesIO(raw)).convert("RGB")
    buf = io.BytesIO(); im.save(buf, "JPEG", quality=92)
    return base64.b64encode(buf.getvalue()).decode(), im.size

def upload(path, data, ct):
    req = urllib.request.Request(BASE + "/storage/v1/object/attachments/" + path,
        data=data, method="POST",
        headers={"apikey": SRV, "Authorization": "Bearer " + SRV,
                 "Content-Type": ct, "x-upsert": "true"})
    urllib.request.urlopen(req, timeout=120).read()

os.makedirs(LOCAL, exist_ok=True)
jobs = []
for c in CLIPS:
    b64, size = to_jpg_b64(c["src"])
    st = proxy("store", path=f"hero-loops/{c['slug']}-src.jpg", b64=b64, contentType="image/jpeg")
    src_url = st.get("publicUrl") or st.get("url")
    sub = proxy("submit", model=MODEL, payload={
        "prompt": c["prompt"], "image_url": src_url, "duration": "5",
        "negative_prompt": NEG, "cfg_scale": 0.7})
    rid = sub.get("request_id")
    print(f"[{c['slug']}] size={size} -> request {rid or sub}")
    if rid:
        jobs.append({**c, "rid": rid, "status_url": sub["status_url"], "response_url": sub["response_url"]})

t0 = time.time()
pending = list(jobs)
while pending and time.time() - t0 < 1500:
    time.sleep(30)
    for j in list(pending):
        s = proxy("poll", url=j["status_url"] + "?logs=0").get("status")
        print(f"  poll {j['slug']}: {s}")
        if s == "COMPLETED":
            res = proxy("poll", url=j["response_url"])
            vurl = ((res.get("video") or {}).get("url")) or res.get("video_url")
            raw = urllib.request.urlopen(vurl, timeout=300).read()
            rawp = os.path.join(LOCAL, f"{j['slug']}-hero-raw.mp4")
            open(rawp, "wb").write(raw)
            pp = os.path.join(LOCAL, f"{j['slug']}-hero-pp.mp4")
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", rawp,
                "-filter_complex", "[0:v]split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[v]",
                "-map", "[v]", "-an", "-c:v", "libx264", "-crf", "27", "-preset", "medium",
                "-movflags", "+faststart", "-pix_fmt", "yuv420p", pp], check=True)
            poster = os.path.join(LOCAL, f"{j['slug']}-hero-poster.jpg")
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", rawp,
                "-frames:v", "1", "-qscale:v", "3", poster], check=True)
            from PIL import Image
            im = Image.open(poster); wp = poster.replace(".jpg", ".webp")
            im.save(wp, "WEBP", quality=80)
            ppd = open(pp, "rb").read()
            upload(f"bud-assets/{j['slug']}/video/hero-loop-pp.mp4", ppd, "video/mp4")
            upload(f"bud-assets/{j['slug']}/video/hero-loop-poster.webp", open(wp, "rb").read(), "image/webp")
            upload(f"bud-assets/{j['slug']}/assets/hero-video.mp4", ppd, "video/mp4")
            print(f"[{j['slug']}] DONE pp={len(ppd)//1024} KB -> video/ + assets/hero-video.mp4 (kafel home)")
            pending.remove(j)
        elif s in ("FAILED", "ERROR"):
            print(f"[{j['slug']}] FAILED"); pending.remove(j)
for j in pending:
    print(f"[{j['slug']}] TIMEOUT — request_id={j['rid']}")
