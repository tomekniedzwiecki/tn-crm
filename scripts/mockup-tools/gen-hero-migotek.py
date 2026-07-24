# -*- coding: utf-8 -*-
"""Hero-loopy MIGOTEK (Kling PRO i2v) — F5 lp_zycie. Cinemagraph: świece migoczą (LED flame pulsuje),
dłoń + pilot-różdżka STATYCZNE, kamera locked. 2 klipy: desktop (sc-hero-d) + mobile (sc-hero-m).
Wynik: video/hero-loop{,-m}.{mp4,webm} + -poster.webp + assets/hero-video.mp4. Adaptacja gen-hero-zaklipek.py."""
import io, json, subprocess, time, urllib.request, urllib.error, os, base64
BASE = "https://yxmavwkwnfuphjqbelws.supabase.co"
PROXY = BASE + "/functions/v1/bud-fal-proxy"
MODEL = "fal-ai/kling-video/v2.1/pro/image-to-video"
LOCAL = r"C:\repos_tn\tn-crm\scripts\mockup-tools\hero-loops"
SLUG = "migotek"
env = {}
for line in io.open(r"C:\repos_tn\tn-crm\.env", encoding="utf-8-sig"):
    line = line.strip()
    if "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1); env[k] = v.strip()
TOOLS = env["BUD_TOOLS_SECRET"]; SRV = env["SUPABASE_SERVICE_KEY"]
NEG = ("camera movement, camera pan, camera zoom, people moving, person moving, hand moving, fingers "
       "moving, face, wand moving, candle moving or deforming or morphing, object color change, real "
       "fire, dripping wax, smoke, new objects appearing, text, captions, watermark, glitch, fast motion")
ASSETS = BASE + "/storage/v1/object/public/attachments/bud-assets/migotek/assets/"
PROMPT = ("Cinemagraph-style very subtle looping motion: the warm-white flame-shaped LED tips of the "
          "flameless candles flicker and breathe gently, casting a soft amber glow that wavers almost "
          "imperceptibly. The white candles, the hand and the black magic-wand remote stay PERFECTLY "
          "still, frozen like a photograph — no hand or wand motion, no candle movement. Locked-off "
          "camera, photorealistic, calm seamless loop, warm dark cozy interior.")
CLIPS = [
    {"out": "hero-loop",   "src": ASSETS + "sc-hero-d.webp", "home": True},
    {"out": "hero-loop-m", "src": ASSETS + "sc-hero-m.webp", "home": False},
]
def proxy(op, **kw):
    body = json.dumps({"op": op, **kw}).encode("utf-8")
    req = urllib.request.Request(PROXY, data=body, headers={"Content-Type": "application/json", "x-tools-secret": TOOLS})
    try:
        return json.loads(urllib.request.urlopen(req, timeout=120).read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return {"_http": e.code, "_body": e.read().decode("utf-8", "replace")[:300]}
def to_jpg_b64(url):
    from PIL import Image
    raw = urllib.request.urlopen(url, timeout=60).read()
    im = Image.open(io.BytesIO(raw)).convert("RGB")
    buf = io.BytesIO(); im.save(buf, "JPEG", quality=92)
    return base64.b64encode(buf.getvalue()).decode(), im.size
def upload(path, data, ct):
    req = urllib.request.Request(BASE + "/storage/v1/object/attachments/" + path, data=data, method="POST",
        headers={"apikey": SRV, "Authorization": "Bearer " + SRV, "Content-Type": ct, "x-upsert": "true"})
    urllib.request.urlopen(req, timeout=180).read()
os.makedirs(LOCAL, exist_ok=True)
jobs = []
for c in CLIPS:
    b64, size = to_jpg_b64(c["src"])
    st = proxy("store", path=f"hero-loops/{SLUG}-{c['out']}-src.jpg", b64=b64, contentType="image/jpeg")
    src_url = st.get("publicUrl") or st.get("url")
    if not src_url:
        print(f"[{c['out']}] STORE FAIL -> {st}"); continue
    sub = proxy("submit", model=MODEL, payload={"prompt": PROMPT, "image_url": src_url, "duration": "5", "negative_prompt": NEG, "cfg_scale": 0.7})
    rid = sub.get("request_id")
    print(f"[{c['out']}] size={size} -> request {rid or sub}", flush=True)
    if rid:
        jobs.append({**c, "rid": rid, "status_url": sub["status_url"], "response_url": sub["response_url"]})
t0 = time.time(); pending = list(jobs)
while pending and time.time() - t0 < 1500:
    time.sleep(30)
    for j in list(pending):
        s = proxy("poll", url=j["status_url"] + "?logs=0").get("status")
        print(f"  poll {j['out']}: {s}  (+{int(time.time()-t0)}s)", flush=True)
        if s == "COMPLETED":
            res = proxy("poll", url=j["response_url"])
            vurl = ((res.get("video") or {}).get("url")) or res.get("video_url")
            raw = urllib.request.urlopen(vurl, timeout=300).read()
            rawp = os.path.join(LOCAL, f"{SLUG}-{j['out']}-raw.mp4"); open(rawp, "wb").write(raw)
            pp = os.path.join(LOCAL, f"{SLUG}-{j['out']}-pp.mp4")
            subprocess.run(["ffmpeg","-y","-loglevel","error","-i",rawp,"-filter_complex",
                "[0:v]split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[v]","-map","[v]","-an","-c:v","libx264",
                "-crf","27","-preset","medium","-movflags","+faststart","-pix_fmt","yuv420p",pp], check=True)
            webm = os.path.join(LOCAL, f"{SLUG}-{j['out']}.webm")
            subprocess.run(["ffmpeg","-y","-loglevel","error","-i",pp,"-c:v","libvpx-vp9","-crf","34","-b:v","0","-an","-row-mt","1",webm], check=True)
            poster = os.path.join(LOCAL, f"{SLUG}-{j['out']}-poster.jpg")
            subprocess.run(["ffmpeg","-y","-loglevel","error","-i",rawp,"-frames:v","1","-qscale:v","3",poster], check=True)
            from PIL import Image
            wp = poster.replace(".jpg", ".webp"); Image.open(poster).save(wp, "WEBP", quality=80)
            ppd = open(pp,"rb").read(); wbd = open(webm,"rb").read()
            upload(f"bud-assets/{SLUG}/video/{j['out']}.mp4", ppd, "video/mp4")
            upload(f"bud-assets/{SLUG}/video/{j['out']}.webm", wbd, "video/webm")
            upload(f"bud-assets/{SLUG}/video/{j['out']}-poster.webp", open(wp,"rb").read(), "image/webp")
            if j.get("home"): upload(f"bud-assets/{SLUG}/assets/hero-video.mp4", ppd, "video/mp4")
            print(f"[{j['out']}] DONE mp4={len(ppd)//1024}KB webm={len(wbd)//1024}KB", flush=True)
            pending.remove(j)
        elif s in ("FAILED", "ERROR"):
            print(f"[{j['out']}] FAILED -> {proxy('poll', url=j['response_url'])}"); pending.remove(j)
for j in pending: print(f"[{j['out']}] TIMEOUT — request_id={j['rid']}")
print("KONIEC gen-hero-migotek")
