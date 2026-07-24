# -*- coding: utf-8 -*-
"""Sekcja DEMO-WIDEO (realny klip aukcji) — MIGOTEK · F5.3.
Klip aukcji (ali_snapshot.video_url) PRZESZEDL vision-gate warunkowo: on-product (te
swiece LED + rozdzka-pilot w akcji), zero cudzej marki. JEDYNA skaza = wypalony ANG
napis-caption ("Light On / Candle Flickering / Turn ON/OFF / Timer") w oknie ~2.0-7.7 s.
=> TNIEMY CZYSTY OGON 8.5 s -> 30.5 s (22 s): szeroki blask -> reka macha rozdzka ->
swiece gasna. Zero napisow. Format 16:9 landscape (jedna wersja = desktop+mobile).
Wyjscie: video/demo.{mp4,webm} + demo-poster.webp -> bud-assets/migotek/video/.
Wzor: gen-hero-zaklipek.py (encode + upload service-role, x-upsert)."""
import io, os, subprocess, sys, urllib.request, argparse

BASE = "https://yxmavwkwnfuphjqbelws.supabase.co"
SLUG = "migotek"
SRC_URL = "https://video.aliexpress-media.com/play/u/ae_sg_item/250720418/p/1/e/6/t/10301/1100200657411.mp4"
OUT = os.path.join(os.environ.get("SCRATCH", os.path.dirname(os.path.abspath(__file__))), "demo-build")

# Czyste okno (po vision-gate): napis-caption zniknal ~7.7 s; startujemy 8.5 s dla marginesu.
CLIP_SS = 8.5      # start (s)
CLIP_DUR = 22.0    # dlugosc (s) -> 8.5..30.5: blask + demo rozdzki (25-28) + gasniecie (29-30.5)

env = {}
for line in io.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", ".env"),
                    encoding="utf-8-sig"):
    line = line.strip()
    if "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1); env[k] = v.strip()
SRV = env.get("SUPABASE_SERVICE_KEY", "")


def upload(path, data, ct):
    req = urllib.request.Request(BASE + "/storage/v1/object/attachments/" + path,
        data=data, method="POST",
        headers={"apikey": SRV, "Authorization": "Bearer " + SRV,
                 "Content-Type": ct, "x-upsert": "true"})
    urllib.request.urlopen(req, timeout=180).read()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--raw", default=os.path.join(OUT, "demo-raw.mp4"), help="lokalny surowy klip")
    ap.add_argument("--upload", action="store_true", help="wgraj do Storage po enkodowaniu")
    args = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)

    raw = args.raw
    if not os.path.exists(raw):
        print("[dl] pobieram klip aukcji ...")
        data = urllib.request.urlopen(SRC_URL, timeout=120).read()
        open(raw, "wb").write(data)
        print("[dl] %d KB" % (len(data) // 1024))

    vf = "format=yuv420p"  # bez fade: ogon konczy sie przygaszona ciepla scena -> lagodna petla
    mp4 = os.path.join(OUT, "demo.mp4")
    webm = os.path.join(OUT, "demo.webm")
    poster_j = os.path.join(OUT, "demo-poster.jpg")
    poster_w = os.path.join(OUT, "demo-poster.webp")

    # MP4 (h264) — seek przed -i (szybko), potem -t
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", str(CLIP_SS), "-i", raw,
        "-t", str(CLIP_DUR), "-vf", vf, "-an",
        "-c:v", "libx264", "-crf", "23", "-preset", "medium",
        "-movflags", "+faststart", mp4], check=True)
    # WebM (vp9)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", str(CLIP_SS), "-i", raw,
        "-t", str(CLIP_DUR), "-vf", vf, "-an",
        "-c:v", "libvpx-vp9", "-crf", "32", "-b:v", "0", "-row-mt", "1", webm], check=True)
    # Poster = pierwsza klatka okna (== start wideo, brak skoku)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", str(CLIP_SS), "-i", raw,
        "-frames:v", "1", "-qscale:v", "3", poster_j], check=True)
    from PIL import Image
    Image.open(poster_j).save(poster_w, "WEBP", quality=82)
    # 3 klatki weryfikacyjne z ZAKODOWANEGO mp4 (start / demo-rozdzka / gasniecie)
    for name, t in (("v-start", "0.3"), ("v-wand", "17"), ("v-off", "21")):
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", t, "-i", mp4,
            "-frames:v", "1", "-qscale:v", "3", os.path.join(OUT, name + ".jpg")], check=True)

    mp4b = open(mp4, "rb").read(); webmb = open(webm, "rb").read(); posb = open(poster_w, "rb").read()
    print("[enc] mp4=%dKB webm=%dKB poster=%dKB  okno %.1f..%.1f s" %
          (len(mp4b) // 1024, len(webmb) // 1024, len(posb) // 1024, CLIP_SS, CLIP_SS + CLIP_DUR))
    print("[enc] OUT=%s" % OUT)

    if args.upload:
        if not SRV:
            print("[up] BRAK SUPABASE_SERVICE_KEY — pomijam upload"); return
        upload("bud-assets/%s/video/demo.mp4" % SLUG, mp4b, "video/mp4")
        upload("bud-assets/%s/video/demo.webm" % SLUG, webmb, "video/webm")
        upload("bud-assets/%s/video/demo-poster.webp" % SLUG, posb, "image/webp")
        print("[up] -> bud-assets/%s/video/demo.{mp4,webm} + demo-poster.webp" % SLUG)


if __name__ == "__main__":
    main()
