# -*- coding: utf-8 -*-
"""Hero-loop v3 Rozmrozika — feedback Tomka 23.07: JEDEN KADR pokazujacy dwie sytuacje
(zamrozone L | rozmrozone+Rozmrozik R na tym samym blacie), zamiast dyptyku 2 zdjec.
Zrodlo i2v = sc-hero-v3 (genimg, 1536x1024). Kling v2.1 PRO, ruch = dwa nosniki pary:
mgla mrozu nad zamrozonym stekiem (L) + ciepla para znad rozmrozonego miesa/kubka (R).
Produkt/mieso/blat/deska/patelnia/kubek LOCK. GATE AMPLITUDY diff(0-5s) >= 8.0 przed uploadem.
Ping-pong ffmpeg. Poster = klatka 0 raw (zero skoku). Upload jako *-v3 (stare pliki NIETKNIETE)."""
import io, json, subprocess, time, urllib.request, urllib.error, os

BASE = "https://yxmavwkwnfuphjqbelws.supabase.co"
PROXY = BASE + "/functions/v1/bud-fal-proxy"
MODEL = "fal-ai/kling-video/v2.1/pro/image-to-video"
SCRATCH = r"C:\Users\tomek\AppData\Local\Temp\claude\c--repos-tn\e7bbf08e-df82-420b-a8c9-42f30dd45047\scratchpad"
GEN_PNG = os.path.join(SCRATCH, "hero-v3-gen", "sc-hero-v3.png")
RESULT = os.path.join(SCRATCH, "hero-v3-result.json")

env = {}
for line in io.open(r"C:\repos_tn\tn-crm\.env", encoding="utf-8-sig"):
    line = line.strip()
    if "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1); env[k] = v.strip()
TOOLS = env["BUD_TOOLS_SECRET"]; SRV = env["SUPABASE_SERVICE_KEY"]

PROMPT = ("Cold frost mist wisps slowly and continuously upward from the frosty frozen steak on "
          "the light wooden board on the left, drifting and fading the whole time. On the right, "
          "a soft warm plume of steam rises gently and continuously from the thawed meat under the "
          "transparent dome and from the coffee mug, curling upward and dissolving, clearly visible "
          "the whole time. The light sheer curtain by the window sways very softly and continuously "
          "in a faint draft. The frozen steak, the wooden board, the black defrosting box, the "
          "transparent dome, the meat portions, the frying pan, the mug and the countertop all stay "
          "completely still and unchanged. Locked-off camera, photorealistic, no color change.")
NEG = ("camera movement, camera pan, camera zoom, product morphing, dome deformation, box changing "
       "shape or color, meat changing shape or color, meat cooking, display changing, new objects, "
       "second box, second device, hands, people, text, captions, watermark, flicker, glitch, jerky "
       "motion, split screen, collage, seam, dividing line, color shift, product turning color")

def proxy(op, **kw):
    body = json.dumps({"op": op, **kw}).encode("utf-8")
    req = urllib.request.Request(PROXY, data=body, headers={
        "Content-Type": "application/json", "x-tools-secret": TOOLS})
    try:
        return json.loads(urllib.request.urlopen(req, timeout=120).read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return {"_http": e.code, "_body": e.read().decode("utf-8", "replace")[:300]}

def upload(name, path, ct):
    data = open(path, "rb").read()
    req = urllib.request.Request(BASE + "/storage/v1/object/attachments/" + name,
        data=data, method="POST",
        headers={"apikey": SRV, "Authorization": "Bearer " + SRV,
                 "Content-Type": ct, "x-upsert": "true"})
    urllib.request.urlopen(req, timeout=180).read()
    print("UP", name, len(data) // 1024, "KB")

def log(**kw):
    io.open(RESULT, "w", encoding="utf-8").write(json.dumps(kw, ensure_ascii=False))

from PIL import Image, ImageChops, ImageStat
assert os.path.isfile(GEN_PNG), "brak " + GEN_PNG

# 0) src.jpg (1536) do Kling -> Storage public URL
src_jpg = os.path.join(SCRATCH, "sc-hero-v3-src.jpg")
Image.open(GEN_PNG).convert("RGB").save(src_jpg, "JPEG", quality=92)
upload("bud-assets/rozmrozik/video/hero-src-v3.jpg", src_jpg, "image/jpeg")
SRC_URL = BASE + "/storage/v1/object/public/attachments/bud-assets/rozmrozik/video/hero-src-v3.jpg"

# 1) submit
sub = proxy("submit", model=MODEL, payload={
    "prompt": PROMPT, "image_url": SRC_URL, "duration": "5",
    "negative_prompt": NEG, "cfg_scale": 0.65})
rid = sub.get("request_id")
print("submit ->", rid or json.dumps(sub)[:300])
if not rid:
    log(status="submit_fail", raw=sub); raise SystemExit(1)
status_url = sub["status_url"]; response_url = sub["response_url"]

# 2) poll
t0 = time.time(); st = None
while time.time() - t0 < 1500:
    time.sleep(25)
    st = proxy("poll", url=status_url + "?logs=0").get("status")
    print("poll:", st)
    if st == "COMPLETED": break
    if st in ("FAILED", "ERROR"):
        log(status="kling_fail", rid=rid); raise SystemExit(1)
if st != "COMPLETED":
    log(status="timeout", rid=rid); raise SystemExit(1)

# 3) download + pp + gate + poster
res = proxy("poll", url=response_url)
vurl = ((res.get("video") or {}).get("url")) or res.get("video_url")
if not vurl:
    log(status="no_video", resp=str(res)[:500]); raise SystemExit(1)
rawp = os.path.join(SCRATCH, "rozmrozik-v3-raw.mp4")
open(rawp, "wb").write(urllib.request.urlopen(vurl, timeout=300).read())
pp = os.path.join(SCRATCH, "rozmrozik-v3-pp.mp4")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", rawp,
    "-filter_complex", "[0:v]split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[v]",
    "-map", "[v]", "-an", "-c:v", "libx264", "-crf", "27", "-preset", "medium",
    "-movflags", "+faststart", "-pix_fmt", "yuv420p", pp], check=True)
fr = {}
for t in ("0", "2.5", "5"):
    fp = os.path.join(SCRATCH, f"rozmrozik-v3-f{t}.jpg")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", t, "-i", pp,
                    "-frames:v", "1", "-qscale:v", "3", fp], check=True)
    fr[t] = Image.open(fp).convert("L")
d25 = ImageStat.Stat(ImageChops.difference(fr["0"], fr["2.5"])).mean[0]
d5 = ImageStat.Stat(ImageChops.difference(fr["0"], fr["5"])).mean[0]
print(f"AMPLITUDA: diff 0-2.5 = {d25:.2f} | diff 0-5 = {d5:.2f} (prog >= 8.0)")
sz = os.path.getsize(pp) // 1024
b = proxy("billing")
log(status="done", d25=round(d25, 2), d5=round(d5, 2), pp_kb=sz, vurl=vurl,
    gate="PASS" if d5 >= 8.0 else "FAIL", billing=b)
print("pp:", sz, "KB | billing:", json.dumps(b))
print("klatki do inspekcji: rozmrozik-v3-f{0,2.5,5}.jpg + raw/pp mp4 w scratchpad")
if d5 < 8.0:
    print("GATE AMPLITUDY: FAIL — NIE uploaduje pp (klatki lokalnie, inspekcja + ew. compose)")
    raise SystemExit(0)

# 4) poster (klatka 0 raw = zero skoku) w 2 rozmiarach + upload v3
poster_raw = os.path.join(SCRATCH, "rozmrozik-v3-poster.jpg")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", rawp,
    "-frames:v", "1", "-qscale:v", "3", poster_raw], check=True)
pim = Image.open(poster_raw).convert("RGB")
p1536 = os.path.join(SCRATCH, "sc-hero-v3.webp")
pim.save(p1536, "WEBP", quality=84)
p800 = os.path.join(SCRATCH, "sc-hero-v3-800.webp")
w, h = pim.size
pim.resize((800, round(800 * h / w))).save(p800, "WEBP", quality=82)
upload("bud-assets/rozmrozik/assets/sc-hero-v3.webp", p1536, "image/webp")
upload("bud-assets/rozmrozik/assets/sc-hero-v3-800.webp", p800, "image/webp")
upload("bud-assets/rozmrozik/video/hero-loop-pp-v3.mp4", pp, "video/mp4")
upload("bud-assets/rozmrozik/video/hero-loop-poster-v3.webp", p1536, "image/webp")
upload("bud-assets/rozmrozik/assets/hero-video-v3.mp4", pp, "video/mp4")
print("GATE AMPLITUDY: PASS + upload v3 OK")
