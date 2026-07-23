# -*- coding: utf-8 -*-
"""Hero-loopy v2 dla Rozmrozika i Rozgrzewka — feedback Tomka 23.07 (#6):
„w tacy oraz rozgrzewek to zdjęcie co miało się animować jest bardzo słabe, tam się nic
nie dzieje praktycznie" (Brzuszek v2 = wzorzec dobry).
Pomiar amplitudy przed regeneracją: brzuszek-v2 diff(0-5s)=11.9 | rozmrozik 6.8 | rozgrzewek 2.5.
GATE AMPLITUDY: diff(0-5s) >= 8.0 wymagane do uploadu; poniżej = FAIL (pliki zostają lokalnie).
Source i2v = pierwsza klatka OBECNEJ pętli (poster bez zmian => zero skoku)."""
import io, json, subprocess, time, urllib.request, urllib.error, os

BASE = "https://yxmavwkwnfuphjqbelws.supabase.co"
PROXY = BASE + "/functions/v1/bud-fal-proxy"
MODEL = "fal-ai/kling-video/v2.1/pro/image-to-video"
SCRATCH = r"C:\Users\tomek\AppData\Local\Temp\claude\c--repos-tn\e7bbf08e-df82-420b-a8c9-42f30dd45047\scratchpad"

env = {}
for line in io.open(r"C:\repos_tn\tn-crm\.env", encoding="utf-8-sig"):
    line = line.strip()
    if "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1); env[k] = v.strip()
TOOLS = env["BUD_TOOLS_SECRET"]; SRV = env["SUPABASE_SERVICE_KEY"]

JOBS = {
    "rozmrozik": {
        "prompt": ("Visible cold mist and thin steam rise from the defrosting tray under the "
                   "transparent dome - a clearly visible, softly swirling plume of vapor drifts "
                   "upward from the tray edges and fades out. The sheer curtain by the window "
                   "billows gently and continuously in a light breeze, clearly moving the whole "
                   "time. Steam above the coffee mug rises in a thick, visibly curling ribbon. "
                   "The tray, the transparent dome, the black module, the meat cutlets, the pan "
                   "and the countertop stay completely still. Locked-off camera, photorealistic, "
                   "cozy morning kitchen light."),
        "neg": ("camera movement, camera pan, camera zoom, product morphing, dome deformation, "
                "meat changing shape or color, meat cooking, new objects, hands, people, text, "
                "captions, watermark, flicker, glitch, jerky motion"),
    },
    "rozgrzewek": {
        "prompt": ("Thick, clearly visible steam rises from the beige mug behind the massager, "
                   "swirling upward in a continuous dancing ribbon the whole time. The warm red "
                   "glow under the massage head between the silver rollers pulses slowly and "
                   "visibly - brightening and dimming like breathing warmth, casting a soft "
                   "moving warm reflection on the tabletop. The lamp light in the background "
                   "breathes very subtly. The navy massager itself stays perfectly still - no "
                   "movement of the device, buttons or display digits. Locked-off camera, "
                   "photorealistic, warm cozy evening mood."),
        "neg": ("camera movement, camera pan, camera zoom, product morphing, device moving or "
                "tilting, display digits changing, new objects, hands, people, text, captions, "
                "watermark, flicker, glitch, product color shift"),
    },
}

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

# 1) source'y = pierwsza klatka obecnych petli (poster zostaje ten sam)
for slug in JOBS:
    src_local = os.path.join(SCRATCH, f"{slug}-f0.jpg")
    assert os.path.isfile(src_local), "brak " + src_local
    upload(f"bud-assets/{slug}/video/hero-src-v2.jpg", src_local, "image/jpeg")
    JOBS[slug]["src"] = BASE + f"/storage/v1/object/public/attachments/bud-assets/{slug}/video/hero-src-v2.jpg"

# 2) submit oba joby
for slug, j in JOBS.items():
    sub = proxy("submit", model=MODEL, payload={
        "prompt": j["prompt"], "image_url": j["src"], "duration": "5",
        "negative_prompt": j["neg"], "cfg_scale": 0.65})
    j["rid"] = sub.get("request_id"); j["status_url"] = sub.get("status_url")
    j["response_url"] = sub.get("response_url")
    print(slug, "submit ->", j["rid"] or json.dumps(sub)[:300])
    if not j["rid"]:
        raise SystemExit(1)

# 3) poll oba
t0 = time.time(); pend = set(JOBS)
while pend and time.time() - t0 < 1500:
    time.sleep(25)
    for slug in list(pend):
        j = JOBS[slug]
        s = proxy("poll", url=j["status_url"] + "?logs=0").get("status")
        print(slug, "poll:", s)
        if s == "COMPLETED":
            pend.discard(slug)
        elif s in ("FAILED", "ERROR"):
            j["fail"] = True; pend.discard(slug)
if pend:
    print("TIMEOUT:", pend); raise SystemExit(1)

# 4) download + pingpong + poster + GATE AMPLITUDY + upload
from PIL import Image, ImageChops, ImageStat
for slug, j in JOBS.items():
    if j.get("fail"):
        print(slug, "FAILED w fal"); continue
    res = proxy("poll", url=j["response_url"])
    vurl = ((res.get("video") or {}).get("url")) or res.get("video_url")
    if not vurl:
        print(slug, "BRAK video.url — pelny response:", json.dumps(res)[:800]); continue
    rawp = os.path.join(SCRATCH, f"{slug}-v2-raw.mp4")
    open(rawp, "wb").write(urllib.request.urlopen(vurl, timeout=300).read())
    pp = os.path.join(SCRATCH, f"{slug}-v2-pp.mp4")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", rawp,
        "-filter_complex", "[0:v]split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[v]",
        "-map", "[v]", "-an", "-c:v", "libx264", "-crf", "27", "-preset", "medium",
        "-movflags", "+faststart", "-pix_fmt", "yuv420p", pp], check=True)
    # gate amplitudy na pp (klatki 0 / 2.5 / 5 s)
    fr = {}
    for t in ("0", "2.5", "5"):
        fp = os.path.join(SCRATCH, f"{slug}-v2-f{t}.jpg")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", t, "-i", pp,
                        "-frames:v", "1", "-qscale:v", "3", fp], check=True)
        fr[t] = Image.open(fp).convert("L")
    d25 = ImageStat.Stat(ImageChops.difference(fr["0"], fr["2.5"])).mean[0]
    d5 = ImageStat.Stat(ImageChops.difference(fr["0"], fr["5"])).mean[0]
    print(f"{slug} AMPLITUDA: diff 0-2.5 = {d25:.2f} | diff 0-5 = {d5:.2f} (prog >= 8.0)")
    if d5 < 8.0:
        print(slug, "GATE AMPLITUDY: FAIL — NIE uploaduje (pliki lokalnie w scratchpad)")
        continue
    poster = os.path.join(SCRATCH, f"{slug}-v2-poster.jpg")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", rawp,
        "-frames:v", "1", "-qscale:v", "3", poster], check=True)
    Image.open(poster).save(poster.replace(".jpg", ".webp"), "WEBP", quality=80)
    upload(f"bud-assets/{slug}/video/hero-loop-pp-v2.mp4", pp, "video/mp4")
    upload(f"bud-assets/{slug}/video/hero-loop-poster-v2.webp", poster.replace(".jpg", ".webp"), "image/webp")
    upload(f"bud-assets/{slug}/assets/hero-video.mp4", pp, "video/mp4")
    print(slug, "GATE AMPLITUDY: PASS + upload OK")

b = proxy("billing")
print("saldo fal:", json.dumps(b))
