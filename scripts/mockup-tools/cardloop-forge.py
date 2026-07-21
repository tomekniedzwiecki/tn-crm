#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
cardloop-forge.py — CARD-LOOPY dla kafli strony głównej (krok pl_glowna).
SSOT: docs/zbuduje/STRONA-GLOWNA.md §1 „Wideo w KAFLU KARTY".

Problem: hero-loopy landingów typu „fade" (kremowa strefa pod copy) NIE nadają się na
kafel karty (decyzja Tomka 21.07). Ten skrypt AUTOMATYZUJE tor wykonany ręcznie 21.07:

  scan <projekt>            stan klipów produktów galerii (card-loop / hero-loop OK / FADE / brak)
  gen  <projekt> [--slug s] dla produktów bez ważnego klipu: scene-brief (gpt-5.6-sol) →
                            scena gpt-image HIGH z refami (packshot+hero, wierność) →
                            BRAMKA wierności vision (rubryka 5×T/N; FAIL=regeneracja, max 2) →
                            Kling 2.5 i2v tail=first (pętla) → kontrola RMS first↔last <12 →
                            ffmpeg 720px mp4+webm → upload bud-assets/<slug>/video/card-loop-m.*
                            + dowody QA (klatka+werdykt) do bud-assets/<slug>/video/qa/
  run  <projekt>            scan → gen (wszystkie braki) → home-forge render+publish

Bramki (dowody, nie deklaracje): werdykt vision = 1. para oczu W AUTOMACIE; kompozyt
dowodowy zapisywany do Storage — SESJA fabryki (prompt-mapa pl_glowna) ogląda go jako
DRUGA para oczu przed zamknięciem kroku. Koszt ~1,5 zł/klip (scena HIGH + Kling $0.35).

Zależności: ffmpeg w PATH, PIL, OPENAI_API_KEY + WF2_GEN_SECRET + SUPABASE_SERVICE_KEY
w tn-crm/.env, sekret fal w C:/tmp/tt.txt (bud-fal-proxy, jak video-factory/fal.py).
"""
import io
import os
import re
import sys
import json
import base64
import argparse
import tempfile
import subprocess
import importlib.util

import requests

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8")
    except Exception:
        pass

_HERE = os.path.dirname(os.path.abspath(__file__))


def _load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


hf = _load("home_forge", os.path.join(_HERE, "home-forge.py"))
fal = _load("fal_driver", os.path.join(_HERE, "..", "video-factory", "fal.py"))
ps = hf.ps
PUB = hf.PUB


def log(msg):
    print(f"[cardloop-forge] {msg}", flush=True)


def _envval(name):
    for line in io.open(ps.ENV_PATH, encoding="utf-8", errors="replace"):
        if line.strip().startswith(name + "="):
            return line.split("=", 1)[1].strip()
    raise SystemExit(f"[cardloop-forge] brak {name} w {ps.ENV_PATH}")


# ── stan klipu per produkt ──

def clip_state(slug):
    """('card-loop', url) | ('hero-loop', url) | ('fade', url_hero) | ('brak', None)"""
    for base in ("card-loop-m", "card-loop"):
        u = f"{PUB}/bud-assets/{slug}/video/{base}.mp4"
        if hf._url_ok(u):
            return "card-loop", u
    for base in ("hero-loop-m", "hero-loop"):
        u = f"{PUB}/bud-assets/{slug}/video/{base}.mp4"
        if hf._url_ok(u):
            return ("fade", u) if hf._fade_frame(u) else ("hero-loop", u)
    return "brak", None


def cmd_scan(a):
    data = hf.collect(a.project)
    todo = []
    for p in data["products"]:
        state, url = clip_state(p["slug"])
        mark = {"card-loop": "✅", "hero-loop": "✅", "fade": "🔴 POTRZEBNY card-loop", "brak": "⚪ brak klipu (opcjonalny)"}[state]
        log(f"{p['slug']:<12} {state:<10} {mark}")
        if state == "fade":
            todo.append(p)
    return data, todo


# ── generacja ──

SCENE_RULES = ("Photorealistic vertical product scene for a looping hero animation, full-bleed "
               "edge-to-edge composition. HARD RULES: the ENTIRE frame is filled with the scene — "
               "NO fade-out zones, NO large empty color fields, NO vignettes, NO gradients into a "
               "background color, NO text, NO logos, NO UI. The product must look EXACTLY like in "
               "the reference images (shape, color, materials, buttons — reproduce faithfully, do "
               "not invent features). Warm natural light, cozy Polish home. Design the frame FOR "
               "MOTION: include a DOMINANT physical motion carrier that can plausibly move in a "
               "subtle 5-second loop (a person/animal interacting with the product, fabric, curtain, "
               "plant — NOT just light and dust). Complete human/animal anatomy.")


def _wf2gpt(payload):
    r = requests.post(f"https://{ps.PROJECT_REF}.supabase.co/functions/v1/wf2-gpt",
                      data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
                      headers={"Content-Type": "application/json", "x-wf2-secret": _envval("WF2_GEN_SECRET")},
                      timeout=600)
    j = r.json()
    if r.status_code != 200:
        raise SystemExit(f"[cardloop-forge] wf2-gpt {r.status_code}: {json.dumps(j)[:300]}")
    return j.get("text", "")


def scene_brief(p):
    """Kreatywny opis sceny per produkt (gpt-5.6-sol, effort high) — CO/KOMU/RUCH, nie dyktat."""
    content = [{"type": "input_text", "text":
                f"Produkt: {p['mini']} — {p['hook']}. Napisz JEDEN akapit po angielsku (60-110 słów): "
                f"opis fotorealistycznej PIONOWEJ sceny 2:3 do 5-sekundowej pętli wideo na kafel karty "
                f"sklepu. Wymogi twarde: produkt używany zgodnie z przeznaczeniem, kadr full-bleed bez "
                f"stref fade/winiet/tekstu, DOMINUJĄCY fizyczny nośnik ruchu (człowiek/zwierzę/tkanina/"
                f"roślina), kompletna anatomia, ciepły polski dom. Packshot produktu w załączniku — "
                f"opisz produkt wiernie. Zwróć wyłącznie akapit sceny."},
               {"type": "input_image", "image_url": p["cover"]}]
    txt = _wf2gpt({"model": "gpt-5.6-sol", "input": [{"role": "user", "content": content}],
                   "max_output_tokens": 1200, "reasoning": {"effort": "high"}})
    return txt.strip()


def gen_scene(p, scene_txt, out_png):
    """gpt-image /v1/images/edits HIGH 1024x1536 z refami packshot+hero (wierność)."""
    key = _envval("OPENAI_API_KEY")
    refs = [p["cover"]]
    hero = f"{PUB}/bud-assets/{p['slug']}/scenes/hero-d.webp"
    if hf._url_ok(hero):
        refs.append(hero)
    boundary = "----cardloop" + p["slug"]
    parts = []
    for name, val in (("model", "gpt-image-2"), ("prompt", SCENE_RULES + " SCENE: " + scene_txt),
                      ("size", "1024x1536"), ("quality", "high"), ("n", "1")):
        parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"\r\n\r\n{val}\r\n".encode())
    for i, u in enumerate(refs):
        data = requests.get(u, timeout=60).content
        parts.append((f"--{boundary}\r\nContent-Disposition: form-data; name=\"image[]\"; "
                      f"filename=\"ref{i}.webp\"\r\nContent-Type: image/webp\r\n\r\n").encode() + data + b"\r\n")
    parts.append(f"--{boundary}--\r\n".encode())
    r = requests.post("https://api.openai.com/v1/images/edits", data=b"".join(parts),
                      headers={"Authorization": f"Bearer {key}",
                               "Content-Type": f"multipart/form-data; boundary={boundary}"}, timeout=900)
    j = r.json()
    if r.status_code != 200:
        raise SystemExit(f"[cardloop-forge] images/edits {r.status_code}: {json.dumps(j)[:300]}")
    open(out_png, "wb").write(base64.b64decode(j["data"][0]["b64_json"]))


def verdict_scene(p, scene_url):
    """Bramka wierności vision (1. para oczu w automacie): rubryka 5×T/N → dict."""
    content = [{"type": "input_text", "text":
                "Jesteś bramką WIERNOŚCI PRODUKTU. Obraz 1 = kandydat (scena), obraz 2 = REALNY "
                "packshot. Oceń T/N: (1) kształt/proporcje produktu zgodne, nic nie dodane/ujęte; "
                "(2) kolory i materiały zgodne; (3) detale funkcyjne poprawne; (4) anatomia "
                "człowieka/zwierzęcia kompletna i naturalna; (5) kadr FULL-BLEED — zero stref "
                "fade/gradientu do jednolitego koloru, zero winiet/tekstu/logo. "
                "Zwróć TYLKO JSON: {\"t\":[bool,bool,bool,bool,bool],\"powod_fail\":\"...\"}"},
               {"type": "input_image", "image_url": scene_url},
               {"type": "input_image", "image_url": p["cover"]}]
    txt = _wf2gpt({"model": "gpt-5.6-sol", "input": [{"role": "user", "content": content}],
                   "max_output_tokens": 600})
    m = re.search(r"\{.*\}", txt, re.S)
    v = json.loads(m.group(0)) if m else {"t": [False] * 5, "powod_fail": "brak JSON w werdykcie"}
    return v


MOTION_PROMPT = ("Subtle seamless cinemagraph loop, static camera: the main subject moves naturally "
                 "and gently (person breathes/adjusts the product, animal interacts playfully, fabric "
                 "or plant sways in a light breeze). No cuts, no camera motion, seamless loop.")
NEG = ("text, watermark, logo, morphing, distortion, extra fingers, extra limbs, deformed product, "
       "camera shake, cuts, flicker")


def _rms_loop(mp4):
    from PIL import Image, ImageChops, ImageStat
    with tempfile.TemporaryDirectory() as td:
        a, b = os.path.join(td, "a.png"), os.path.join(td, "b.png")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", mp4, "-vf", "select=eq(n\\,0)",
                        "-vframes", "1", a], check=True)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-sseof", "-0.15", "-i", mp4,
                        "-vframes", "1", b], check=True)
        ia = Image.open(a).convert("L").resize((256, 384))
        ib = Image.open(b).convert("L").resize((256, 384))
        return ImageStat.Stat(ImageChops.difference(ia, ib)).rms[0]


def _upload(path, dest, ct):
    data = open(path, "rb").read()
    r = requests.post(f"https://{ps.PROJECT_REF}.supabase.co/storage/v1/object/attachments/{dest}",
                      data=data, headers={**ps.H, "Content-Type": ct, "x-upsert": "true"}, timeout=120)
    if r.status_code not in (200, 201):
        raise SystemExit(f"[cardloop-forge] upload {dest} FAIL {r.status_code}: {r.text[:200]}")
    return f"{PUB}/{dest}", len(data)


def gen_one(p, workdir):
    slug = p["slug"]
    # 1) scena z bramką wierności (max 2 próby)
    scene_png = os.path.join(workdir, f"{slug}-scene.png")
    scene_url = None
    for attempt in (1, 2):
        brief = scene_brief(p)
        log(f"{slug}: scene-brief[{attempt}]: {brief[:110]}…")
        gen_scene(p, brief, scene_png)
        scene_url, _ = _upload(scene_png, f"bud-assets/{slug}/video/qa/cardloop-scene.png", "image/png")
        v = verdict_scene(p, scene_url + f"?a={attempt}")
        log(f"{slug}: werdykt wierności {v['t']}" + ("" if all(v["t"]) else f" FAIL: {v.get('powod_fail', '')[:120]}"))
        if all(v["t"]):
            break
        if attempt == 2:
            raise SystemExit(f"[cardloop-forge] {slug}: scena 2× FAIL wierności — eskalacja do sesji (obejrzyj {scene_url})")
    # 2) Kling i2v (pętla first=last), kontrola RMS, max 2 próby
    fal.set_project("cardloop")
    raw = os.path.join(workdir, f"{slug}-raw.mp4")
    for attempt in (1, 2):
        out = fal.gen("fal-ai/kling-video/v2.5-turbo/pro/image-to-video",
                      {"image_url": scene_url, "tail_image_url": scene_url, "duration": "5",
                       "prompt": MOTION_PROMPT, "negative_prompt": NEG}, tag=f"{slug}-cardloop")
        vid_url = None
        if isinstance(out, dict):
            vid_url = (out.get("video") or {}).get("url") or out.get("url")
        if not vid_url:
            raise SystemExit(f"[cardloop-forge] {slug}: brak URL wideo w odpowiedzi fal: {str(out)[:200]}")
        open(raw, "wb").write(requests.get(vid_url, timeout=300).content)
        rms = _rms_loop(raw)
        log(f"{slug}: Kling OK, pętla RMS first↔last = {rms:.1f} (próg <12)")
        if rms < 12:
            break
        if attempt == 2:
            log(f"⚠️ {slug}: pętla niedomknięta po 2 próbach (RMS {rms:.1f}) — klip idzie dalej z NOTĄ (miękkie przejście)")
    # 3) kompresja + upload
    mp4 = os.path.join(workdir, f"{slug}-card-loop-m.mp4")
    webm = os.path.join(workdir, f"{slug}-card-loop-m.webm")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-vf", "scale=720:-2,fps=24", "-an",
                    "-c:v", "libx264", "-preset", "slow", "-crf", "26", "-movflags", "+faststart",
                    "-pix_fmt", "yuv420p", mp4], check=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-vf", "scale=720:-2,fps=24", "-an",
                    "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "38", "-row-mt", "1", webm], check=True)
    u1, s1 = _upload(mp4, f"bud-assets/{slug}/video/card-loop-m.mp4", "video/mp4")
    _upload(webm, f"bud-assets/{slug}/video/card-loop-m.webm", "video/webm")
    # 4) dowód QA: klatka środkowa
    frame = os.path.join(workdir, f"{slug}-qa.png")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", "2.5", "-i", mp4, "-vframes", "1", frame], check=True)
    qa_url, _ = _upload(frame, f"bud-assets/{slug}/video/qa/cardloop-frame.png", "image/png")
    log(f"DOWÓD: {slug} card-loop-m.mp4 {s1 // 1024}KB → {u1} · QA-klatka: {qa_url}")
    return u1


def cmd_gen(a):
    data, todo = cmd_scan(a)
    if a.slug:
        todo = [p for p in data["products"] if p["slug"] == a.slug]
        if not todo:
            raise SystemExit(f"[cardloop-forge] brak produktu {a.slug} w galerii")
    if not todo:
        log("nic do zrobienia — wszystkie karty mają ważny klip albo świadomie brak")
        return
    with tempfile.TemporaryDirectory() as td:
        for p in todo:
            gen_one(p, td)
    log(f"gotowe: {len(todo)} card-loop(y). DRUGA para oczu: obejrzyj QA-klatki (bud-assets/<slug>/video/qa/) przed zamknięciem kroku.")


def cmd_run(a):
    cmd_gen(a)
    r = subprocess.run([sys.executable, os.path.join(_HERE, "home-forge.py"), "render", a.project],
                       capture_output=True, text=True, encoding="utf-8")
    print(r.stdout.strip())
    if r.returncode != 0:
        raise SystemExit(f"[cardloop-forge] render FAIL: {r.stderr[-300:]}")
    r = subprocess.run([sys.executable, os.path.join(_HERE, "home-forge.py"), "publish", a.project, "--no-step"],
                       capture_output=True, text=True, encoding="utf-8")
    print(r.stdout.strip())
    if r.returncode != 0:
        raise SystemExit(f"[cardloop-forge] publish FAIL: {r.stderr[-300:]}")
    log("run: klipy + render + publish OK (pamiętaj o flushu cache domeny custom przy re-publish — README platforma-api)")


def main():
    ap = argparse.ArgumentParser(description="Card-loopy kafli strony głównej. SSOT: docs/zbuduje/STRONA-GLOWNA.md")
    sub = ap.add_subparsers(dest="cmd", required=True)
    for name in ("scan", "gen", "run"):
        s = sub.add_parser(name)
        s.add_argument("project")
        if name == "gen":
            s.add_argument("--slug")
    a = ap.parse_args()
    {"scan": lambda x: cmd_scan(x), "gen": cmd_gen, "run": cmd_run}[a.cmd](a)


if __name__ == "__main__":
    main()
