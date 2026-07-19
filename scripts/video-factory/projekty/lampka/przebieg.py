# -*- coding: utf-8 -*-
"""PRZEBIEG lampka — rownoleglosc + lekcje stolika/maty. Transformacje swiatla = FLF.
Etapy: python przebieg.py fala_a | fala_b | render
"""
import os, sys, json, subprocess, shutil
sys.path.insert(0, r"C:/tmp/video-factory/tools")
import fal, render

SLUG = "lampka"
BASE = rf"C:\tmp\video-factory\{SLUG}"
GEN  = os.path.join(BASE, "gen"); os.makedirs(GEN, exist_ok=True)
REFS = os.path.join(BASE, "refs")
MAX_PARALLEL = 8
fal.set_project(SLUG)

BP = {s["id"]: s for s in json.load(open(os.path.join(BASE, "blueprint.json"), encoding="utf-8"))["sceny"]}
KARTA = json.load(open(os.path.join(BASE, "KARTA.json"), encoding="utf-8"))
NEG_EXTRA = ", ".join(KARTA["product"]["forbidden_leaks"])
SCENE_NEG = ("two lamps, two light circles, multiple orbits, ceiling fan, LED strip, readable text, "
             "labels, white lamp, silver lamp, harsh daylight, pitch black frame, face fully visible")

KEEP1 = ("Image 1 is a real product photo of a black sunset projection lamp on a telescopic stand. "
         "KEEP the lamp EXACTLY as its pixels in Image 1 - same round black head with red-pink lens, "
         "same U-mount, same black pole with thicker middle sleeve, same round flat base, same "
         "proportions. Do NOT redraw, reshape, recolour or add parts. Only place it into the "
         "described scene and add the described lighting.")
ANTI = ("No readable text, no logos, no labels anywhere; EXACTLY ONE lamp and at most ONE round "
        "light orbit; hands natural with five fingers, no rings, no jewelry, no nail polish; "
        "photorealistic, natural skin texture; the woman's face stays out of frame or turned away; "
        "the frame stays readable, never pitch black.")

def upref(name): return fal.store(os.path.join(REFS, name), f"{SLUG}/ref_" + name)
def upfr(name):  return fal.store(os.path.join(GEN, name), f"{SLUG}/fr_" + name)

def frames_first_spec():
    jobs = []
    for sid in ["hook", "orbita", "tryby", "lifestyle", "vibe"]:
        sc = BP[sid]
        prompt = KEEP1 + " SCENE: " + sc["first_frame_brief_en"] + " " + ANTI
        jobs.append({"model": "fal-ai/nano-banana/edit", "tag": sid + "_first",
                     "payload": {"prompt": prompt, "image_urls": [upref("packshot.png")], "num_images": 1,
                                 "output_format": "png", "aspect_ratio": "9:16"}})
    return jobs

VOICE = "Aria"
VO = {
 "vo_hook":      "Klik. I mam zachód słońca.",
 "vo_orbita":    "Kręcę nim jak chcę.",
 "vo_tryby":     "Szesnaście kolorów.",
 "vo_lifestyle": "Wieczór robi się miękki.",
 "vo_vibe":      "Najlepsza część dnia.",
 "vo_cta":       "Dobranoc, słońce.",
}
VODIR = os.path.join(GEN, "vo_txt"); os.makedirs(VODIR, exist_ok=True)
PL_DIAC = set("ąćęłńóśźż") | set("ĄĆĘŁŃÓŚŹŻ")

MUSIC = ("dreamy warm chillout pop with a steady soft beat from the very first second, cozy sunset "
         "bedroom vibe, gentle percussion, warm synth pads, constant energy until the very end, "
         "no outro, no fade out, NO lo-fi, NO ambient")
AMBIENT = ("quiet bedroom room tone at dusk, very soft house interior ambience, faint distant "
           "evening hum, steady and seamless, NO melody, NO music")
SFX = {
 "sfx_klik":   ("sound effect foley: a single soft click of a small lamp switch then a gentle warm electronic bloom swell, close-up, dry, NO music, NO reverb", 1.4),
 "sfx_obrot":  ("sound effect foley: a small plastic hinge joint rotating slowly with a soft friction sound, close-up, dry, NO music, NO reverb", 1.6),
 "sfx_pilot":  ("sound effect foley: a single quiet click of a small remote control button, close-up, dry, NO music, NO reverb", 1.0),
 "sfx_kartka": ("sound effect foley: a single soft page turn of a book, gentle paper rustle, close-up, dry, NO music, NO reverb", 1.2),
 "sfx_klik2":  ("sound effect foley: a single soft click of a small lamp switch then a gentle fading electronic hum down, close-up, dry, NO music, NO reverb", 1.4),
}

def audio_spec():
    for tag, txt in VO.items():
        open(os.path.join(VODIR, tag + ".txt"), "w", encoding="utf-8").write(txt)
    jobs = [
     {"model": "fal-ai/stable-audio-25/text-to-audio", "tag": "music",
      "payload": {"prompt": MUSIC, "seconds_total": 25, "num_inference_steps": 8}},
     {"model": "fal-ai/stable-audio-25/text-to-audio", "tag": "ambient",
      "payload": {"prompt": AMBIENT, "seconds_total": 20, "num_inference_steps": 8}},
    ]
    sfx_trims = {}
    for tag, (prompt, trim) in SFX.items():
        jobs.append({"model": "fal-ai/stable-audio-25/text-to-audio", "tag": tag + "_raw",
                     "payload": {"prompt": prompt, "seconds_total": 10, "num_inference_steps": 8}})
        sfx_trims[tag] = trim
    all_txt = ""
    for tag in VO:
        txt = open(os.path.join(VODIR, tag + ".txt"), encoding="utf-8").read().strip()
        all_txt += txt
        if not any(c in PL_DIAC for c in txt):
            print(f"[VO] warning: '{tag}' bez diakrytykow ('{txt}')", flush=True)
        jobs.append({"model": "fal-ai/elevenlabs/tts/eleven-v3", "tag": tag,
                     "payload": {"text": txt, "voice": VOICE, "stability": 0.3}})
    if not any(c in PL_DIAC for c in all_txt):
        raise RuntimeError("VO: CALY zestaw bez polskich znakow -> STOP")
    return jobs, sfx_trims

def trim_sfx(sfx_trims):
    for tag, trim in sfx_trims.items():
        raw = os.path.join(GEN, tag + "_raw.mp3")
        if not os.path.exists(raw):
            print("SFX brak raw:", tag); continue
        out = os.path.join(GEN, tag + ".mp3")
        af = (f"silenceremove=start_periods=1:start_threshold=-45dB,atrim=0:{trim},"
              f"afade=t=out:st={max(0.0, trim - 0.25):.2f}:d=0.25")
        subprocess.run(["ffmpeg", "-v", "error", "-i", raw, "-af", af, "-y", out], check=True)
        print("SFX trim", tag, "->", out)

def check_music(path, kreacja_s=15.0, floor_db=-30.0):
    holes = []
    for s in range(0, int(kreacja_s) + 2):
        out = subprocess.run(["ffmpeg", "-v", "info", "-ss", str(s), "-t", "1", "-i", path,
                              "-af", "volumedetect", "-f", "null", "-"],
                             capture_output=True, text=True).stderr
        for ln in out.splitlines():
            if "mean_volume" in ln:
                v = float(ln.split(":")[1].strip().split()[0])
                if v < floor_db: holes.append((s, v))
    print(("[MUZYKA] DZIURY: " + str(holes)) if holes else "[MUZYKA] profil OK", flush=True)
    return holes

def fala_b():
    hook_url = upfr("hook_first.png")
    tryby_url = upfr("tryby_first.png")
    j1 = [
     {"model": "fal-ai/nano-banana/edit", "tag": "hook_last",
      "payload": {"prompt": KEEP1 + " " + BP["hook"]["last_frame_brief_en"].replace("(hook_last = nano-CHAIN z hook_first) ", "Image 1 is the exact start frame. Keep EVERYTHING identical and pixel-faithful. ") + " " + ANTI,
                  "image_urls": [hook_url], "num_images": 1, "output_format": "png", "aspect_ratio": "9:16"}},
     {"model": "fal-ai/nano-banana/edit", "tag": "tryby_last",
      "payload": {"prompt": "Image 1 is the exact frame. Keep EVERYTHING identical and pixel-faithful - the room, bed, lamp, orbit shape, hand with remote, framing. Change ONLY the light colour: the round orbit on the wall and the whole room glow become vivid purple-pink (RGB mode change), the lamp lens glows pink. Nothing else changes. " + ANTI,
                  "image_urls": [tryby_url], "num_images": 1, "output_format": "png", "aspect_ratio": "9:16"}},
    ]
    fal.gen_batch(j1, outdir=GEN, max_parallel=MAX_PARALLEL, project=SLUG)
    hl_url = upfr("hook_last.png")
    j2 = [{"model": "fal-ai/nano-banana/edit", "tag": "cta_first",
           "payload": {"prompt": "Image 1 is the exact frame (lamp ON, sunset orbit on the wall, warm glow). Keep EVERYTHING identical and pixel-faithful. Change ONLY this: the woman's hand returns and rests right next to the lamp head, ready to switch it off. Nothing else changes. " + ANTI,
                       "image_urls": [hl_url], "num_images": 1, "output_format": "png", "aspect_ratio": "9:16"}}]
    fal.gen_batch(j2, outdir=GEN, max_parallel=MAX_PARALLEL, project=SLUG)
    # cta_last = hook_first VERBATIM (petla 1:1, $0)
    shutil.copy(os.path.join(GEN, "hook_first.png"), os.path.join(GEN, "cta_last.png"))
    print("FALA B done (cta_last = hook_first copy)", flush=True)

def kref_element():
    return {"frontal_image_url": upref("packshot.png"),
            "reference_image_urls": [upref("packshot.png")]}

def scenes_spec():
    el = kref_element()
    scenes = []
    for sid in ["orbita", "lifestyle", "vibe"]:
        sc = BP[sid]
        scenes.append({"tag": sid, "engine": "kref",
                       "image_urls": [upfr(sid + "_first.png")],
                       "elements": [el],
                       "prompt": sc["motion_prompt_en"],
                       "negative_prompt": render.NEG + ", " + NEG_EXTRA + ", " + SCENE_NEG,
                       "duration": "5", "aspect_ratio": "9:16"})
    for sid, first, last in [("hook", "hook_first.png", "hook_last.png"),
                              ("tryby", "tryby_first.png", "tryby_last.png"),
                              ("cta", "cta_first.png", "cta_last.png")]:
        sc = BP[sid]
        scenes.append({"tag": sid, "engine": "flf",
                       "image_url": upfr(first), "tail_image_url": upfr(last),
                       "prompt": sc["motion_prompt_en"],
                       "negative_extra": NEG_EXTRA + ", " + SCENE_NEG})
    return scenes

def main():
    step = sys.argv[1] if len(sys.argv) > 1 else "fala_a"
    if step == "fala_a":
        fal.preflight(floor_usd=15)
        audio_jobs, sfx_trims = audio_spec()
        firsts = frames_first_spec()
        fala = firsts + audio_jobs
        print(f"FALA A: {len(firsts)} klatek + {len(audio_jobs)} audio = {len(fala)} jobow", flush=True)
        got = fal.gen_batch(fala, outdir=GEN, max_parallel=MAX_PARALLEL, project=SLUG)
        trim_sfx(sfx_trims)
        check_music(os.path.join(GEN, "music.mp3"))
        fails = [t for t in list(got) if os.path.exists(os.path.join(GEN, t + ".failed"))]
        print("FALA A done. fails:", fails or "brak", flush=True)
    elif step == "fala_b":
        fala_b()
    elif step == "render":
        scenes = scenes_spec()
        print("RENDER", [s["tag"] + "/" + s["engine"] for s in scenes], flush=True)
        done = render.render_scenes(scenes, GEN, project=SLUG)
        print("DONE:", json.dumps({k: bool(v) for k, v in done.items()}), flush=True)

if __name__ == "__main__":
    main()
