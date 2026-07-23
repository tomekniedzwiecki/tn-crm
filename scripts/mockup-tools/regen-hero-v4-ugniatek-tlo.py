# -*- coding: utf-8 -*-
"""Hero-loop TLO Ugniatka — naprawa 23.07 (audyt): hero byl DIPTYK (dwa osobne kadry L+P,
pol martwe). Nowy kanon: JEDEN kadr + osadzenie full-bleed (mata). sc-hero-tlo = 3:2, back-view
mezczyzny dociskajacego Ugniatka OBURACZ do karku, LEWA 40% = negative-space pod copy+scrim.
Klasa produktu AKTYWNA -> beat pokazuje DZIALANIE (wolny cykl docisku/ugniatania). Ruch = donie
+ masazer pompuja lekko w kark (knead) + wlosy/koszulka + oddech; PRODUKT rigid (NEG lock ksztalt/
6 glowic/wyswietlacz/kolor/donie). GATE diff(0-5s) >= 8.0. Ping-pong. Upload pod NOWA nazwa -tlo."""
import io, json, subprocess, time, urllib.request, urllib.error, os

BASE = "https://yxmavwkwnfuphjqbelws.supabase.co"
PROXY = BASE + "/functions/v1/bud-fal-proxy"
MODEL = "fal-ai/kling-video/v2.1/pro/image-to-video"
SCRATCH = r"C:\Users\tomek\AppData\Local\Temp\claude\c--repos-tn\e7bbf08e-df82-420b-a8c9-42f30dd45047\scratchpad"
GEN_PNG = os.path.join(SCRATCH, "ugniatek-hero", "ugniatek-hero-tlo-v1.png")
RESULT = os.path.join(SCRATCH, "ugniatek-hero-v4-result.json")

env = {}
for line in io.open(r"C:\repos_tn\tn-crm\.env", encoding="utf-8-sig"):
    line = line.strip()
    if "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1); env[k] = v.strip()
TOOLS = env["BUD_TOOLS_SECRET"]; SRV = env["SUPABASE_SERVICE_KEY"]

PROMPT = ("The man's two hands slowly and continuously press the oval massager against the back "
          "of his neck and gently knead it in and out with a slow controlled rhythm the whole time, "
          "the massager pushing softly into the trapezius and easing back, clearly visible the whole "
          "time. His hair and the collar of his grey t-shirt shift very slightly, his shoulders rise "
          "and settle with a calm breath. The warm floor-lamp glow on the lower left brightens and "
          "dims very softly and continuously. The silver satin oval massager body, its two integrated "
          "handles, the six black foam ball heads, the central perforated panel, and the side display "
          "reading P3 with its buttons all keep their exact shape, colour and details, completely rigid "
          "and unchanged. Locked-off camera, photorealistic, no colour change.")
NEG = ("camera movement, camera pan, camera zoom, camera shake, product morphing, massager changing "
       "shape or colour, oval body deforming, handles bending, foam heads changing number or shape or "
       "colour, display changing, screen text changing, extra fingers, sixth finger, deformed hands, "
       "hand morphing, melting hands, new objects, second device, second massager, another person, "
       "face appearing, head turning around, text, captions, watermark, flicker, glitch, jerky motion, "
       "strobing, split screen, collage, seam, dividing line, colour shift, product turning colour")

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

src_jpg = os.path.join(SCRATCH, "ugniatek-hero-tlo-src.jpg")
Image.open(GEN_PNG).convert("RGB").save(src_jpg, "JPEG", quality=92)
upload("bud-assets/ugniatek/video/hero-src-tlo.jpg", src_jpg, "image/jpeg")
SRC_URL = BASE + "/storage/v1/object/public/attachments/bud-assets/ugniatek/video/hero-src-tlo.jpg"

sub = proxy("submit", model=MODEL, payload={
    "prompt": PROMPT, "image_url": SRC_URL, "duration": "5",
    "negative_prompt": NEG, "cfg_scale": 0.65})
rid = sub.get("request_id")
print("submit ->", rid or json.dumps(sub)[:300])
if not rid:
    log(status="submit_fail", raw=sub); raise SystemExit(1)
status_url = sub["status_url"]; response_url = sub["response_url"]

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

res = proxy("poll", url=response_url)
vurl = ((res.get("video") or {}).get("url")) or res.get("video_url")
if not vurl:
    log(status="no_video", resp=str(res)[:500]); raise SystemExit(1)
rawp = os.path.join(SCRATCH, "ugniatek-tlo-raw.mp4")
open(rawp, "wb").write(urllib.request.urlopen(vurl, timeout=300).read())
pp = os.path.join(SCRATCH, "ugniatek-tlo-pp.mp4")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", rawp,
    "-filter_complex", "[0:v]split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[v]",
    "-map", "[v]", "-an", "-c:v", "libx264", "-crf", "27", "-preset", "medium",
    "-movflags", "+faststart", "-pix_fmt", "yuv420p", pp], check=True)
fr = {}
for t in ("0", "2.5", "5"):
    fp = os.path.join(SCRATCH, f"ugniatek-tlo-f{t}.jpg")
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
if d5 < 8.0:
    print("GATE AMPLITUDY: FAIL — NIE uploaduje (klatki lokalnie do inspekcji/compose)")
    raise SystemExit(0)

poster_raw = os.path.join(SCRATCH, "ugniatek-tlo-poster.jpg")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", rawp,
    "-frames:v", "1", "-qscale:v", "3", poster_raw], check=True)
pim = Image.open(poster_raw).convert("RGB")
p1536 = os.path.join(SCRATCH, "sc-hero-tlo.webp")
pim.save(p1536, "WEBP", quality=84)
p800 = os.path.join(SCRATCH, "sc-hero-tlo-800.webp")
w, h = pim.size
pim.resize((800, round(800 * h / w))).save(p800, "WEBP", quality=82)
upload("bud-assets/ugniatek/assets/sc-hero-tlo.webp", p1536, "image/webp")
upload("bud-assets/ugniatek/assets/sc-hero-tlo-800.webp", p800, "image/webp")
upload("bud-assets/ugniatek/video/hero-loop-tlo.mp4", pp, "video/mp4")
upload("bud-assets/ugniatek/video/hero-loop-tlo-poster.webp", p1536, "image/webp")
print("GATE AMPLITUDY: PASS + upload TLO OK")
