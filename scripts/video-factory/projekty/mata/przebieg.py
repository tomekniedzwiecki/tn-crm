# -*- coding: utf-8 -*-
"""PRZEBIEG mata — wzorzec ROWNOLEGLOSCI + lekcje stolika (pre-neutralizacja refow,
kotwica tla w promptach OD RAZU, check_music po fali A, weryfikacja fixow w pelnej rozdz.).
Etapy: python przebieg.py neutralizuj | fala_a | fala_b | render
"""
import os, sys, json, subprocess
sys.path.insert(0, r"C:/tmp/video-factory/tools")
import fal, render

SLUG = "mata"
BASE = rf"C:\tmp\video-factory\{SLUG}"
GEN  = os.path.join(BASE, "gen"); os.makedirs(GEN, exist_ok=True)
REFS = os.path.join(BASE, "refs")
MAX_PARALLEL = 8
fal.set_project(SLUG)

BP = {s["id"]: s for s in json.load(open(os.path.join(BASE, "blueprint.json"), encoding="utf-8"))["sceny"]}
KARTA = json.load(open(os.path.join(BASE, "KARTA.json"), encoding="utf-8"))
NEG_EXTRA = ", ".join(KARTA["product"]["forbidden_leaks"])
SCENE_NEG = ("cream mat, ivory mat, white mat, grey spikes, blue-grey spikes, circular inset graphic, "
             "readable text, diagram, studio white background, face fully visible, person lying face down")

KEEP1 = ("Image 1 is a real product photo of a black acupressure mat set with purple lotus spikes "
         "(mat + half-round pillow roll). KEEP the product EXACTLY as its pixels in Image 1 - same "
         "black linen fabric, same purple lotus spike rosettes in a regular grid, same black margin, "
         "same half-round pillow roll. Do NOT recolour, reshape or add parts. Only replace the "
         "surroundings with the described scene.")
ANTI = ("No readable text, no logos, no labels; EXACTLY ONE mat and ONE pillow roll; hands natural "
        "with five fingers, no rings, no jewelry, no nail polish; bright high-key warm light, NOT dark; "
        "photorealistic, natural skin texture with visible pores; the woman's face stays out of frame "
        "or turned away.")

def upref(name): return fal.store(os.path.join(REFS, name), f"{SLUG}/ref_" + name)
def upfr(name):  return fal.store(os.path.join(GEN, name), f"{SLUG}/fr_" + name)

# ── PRE-NEUTRALIZACJA REFA (lekcja stolika; PROCEDURA 5b pkt 5) ─────────────────
NEUTRAL = ("Image 1 is a real product photo of a black acupressure mat set with purple lotus spikes. "
           "KEEP the mat and the pillow roll EXACTLY as their pixels - same fabric, spikes, colours, "
           "geometry. Change ONLY: REMOVE the circular zoom inset graphic in the top-left corner "
           "completely, leaving a plain clean white background there. Nothing else changes.")

def neutralizuj():
    got = fal.gen_batch([{"model": "fal-ai/nano-banana/edit", "tag": "g4_clean",
                          "payload": {"prompt": NEUTRAL, "image_urls": [upref("ali_g4.jpg")],
                                      "num_images": 1, "output_format": "png"}}],
                        outdir=GEN, max_parallel=MAX_PARALLEL, project=SLUG)
    import shutil
    shutil.copy(os.path.join(GEN, "g4_clean.png"), os.path.join(REFS, "g4_clean.png"))
    print("NEUTRALIZACJA:", {k: bool(v) for k, v in got.items()}, "-> refs/g4_clean.png (OBEJRZYJ w pelnej rozdz.!)")

# ── FALA A ──────────────────────────────────────────────────────────────────────
def frames_first_spec():
    jobs = []
    for sid in ["hook", "kolce", "lezenie", "relaks", "stopy"]:
        sc = BP[sid]
        base = sc["baza_packshot"].split("/")[-1]
        prompt = KEEP1 + " SCENE: " + sc["first_frame_brief_en"] + " " + ANTI
        jobs.append({"model": "fal-ai/nano-banana/edit", "tag": sid + "_first",
                     "payload": {"prompt": prompt, "image_urls": [upref(base)], "num_images": 1,
                                 "output_format": "png", "aspect_ratio": "9:16"}})
    return jobs

VOICE = "Aria"
VO = {
 "vo_hook":    "Całe dnie za biurkiem?",
 "vo_kolce":   "Wyglądają groźnie, wiem.",
 "vo_lezenie": "Kładę się na nich plecami.",
 "vo_relaks":  "Dziesięć minut i luz.",
 "vo_stopy":   "Stopom też robi dobrze.",
 "vo_cta":     "Codziennie wieczorem.",
}
VODIR = os.path.join(GEN, "vo_txt"); os.makedirs(VODIR, exist_ok=True)
PL_DIAC = set("ąćęłńóśźż") | set("ĄĆĘŁŃÓŚŹŻ")

MUSIC = ("warm mellow chillout pop with a steady soft beat from the very first second, cozy evening "
         "bedroom vibe, gentle percussion, warm pads, constant energy until the very end, no outro, "
         "no fade out, NO lo-fi, NO ambient")
AMBIENT = ("quiet bedroom room tone at evening, very soft house interior ambience, faint fabric "
           "rustle, steady and seamless, NO melody, NO music")
SFX = {
 "sfx_unroll": ("sound effect foley: a fabric mat unrolled briskly onto a bed, cloth rustle then a soft padded thud, close-up, dry, NO music, NO reverb", 1.6),
 "sfx_taps":   ("sound effect foley: fingertips pressing and dragging slowly over dense small plastic spikes, soft tactile rustle, close-up ASMR, dry, NO music, NO reverb", 1.8),
 "sfx_settle": ("sound effect foley: a body settling slowly onto padded fabric on a bed, soft cloth compression and gentle creak, close-up, dry, NO music, NO reverb", 1.8),
 "sfx_exhale": ("sound effect foley: a soft relaxed human female exhale, a long gentle sigh of relief, close-up, dry, NO music, NO reverb", 1.6),
 "sfx_steps":  ("sound effect foley: bare feet slowly shifting weight in place on a spiky plastic mat, soft pressing rustle, close-up, dry, NO music, NO reverb", 1.8),
 "sfx_pat":    ("sound effect foley: a soft single pat of a palm on dense fabric with small plastic spikes, gentle, close-up, dry, NO music, NO reverb", 1.2),
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
    # Straznik ASCII-degradacji: twardy STOP gdy CALY zestaw VO bez diakrytykow
    # (pojedyncza fraza moze legalnie nie miec ogonkow — fix 19.07 po falszywym pozytywie).
    all_txt = ""
    for tag in VO:
        txt = open(os.path.join(VODIR, tag + ".txt"), encoding="utf-8").read().strip()
        all_txt += txt
        if not any(c in PL_DIAC for c in txt):
            print(f"[VO] warning: '{tag}' bez diakrytykow ('{txt}') — OK jesli fraza naturalnie ich nie ma", flush=True)
        jobs.append({"model": "fal-ai/elevenlabs/tts/eleven-v3", "tag": tag,
                     "payload": {"text": txt, "voice": VOICE, "stability": 0.3}})
    if not any(c in PL_DIAC for c in all_txt):
        raise RuntimeError("VO: CALY zestaw bez polskich znakow -> ASCII-degradacja, STOP")
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

# ── FALA B: klatki CTA (chain z hook_first) ─────────────────────────────────────
CTA_FIRST = ("Image 1 is the exact start frame of this video. Keep EVERYTHING identical - the same "
             "bedroom, bed, lamp, light, camera framing and the same black acupressure mat with purple "
             "lotus spikes, pixel-faithful. Change ONLY this: the mat is now fully unrolled and flat on "
             "the bed with the half-round pillow roll at its head end, and the woman's hand rests flat "
             "and relaxed on the purple spikes. Nothing else changes. " + ANTI)
CTA_LAST = ("Image 1 is the exact previous frame. Keep EVERYTHING identical - room, bed, lamp, light, "
            "framing, the black acupressure mat and pillow roll, pixel-faithful. Change ONLY the "
            "woman's hand: it now grips the near corner edge of the mat, gently lifting it a few "
            "centimeters, mid-gesture of starting to roll it up. Nothing else changes. " + ANTI)

def fala_b():
    hook_url = upfr("hook_first.png")
    fal.gen_batch([{"model": "fal-ai/nano-banana/edit", "tag": "cta_first",
                    "payload": {"prompt": CTA_FIRST, "image_urls": [hook_url], "num_images": 1,
                                "output_format": "png", "aspect_ratio": "9:16"}}],
                  outdir=GEN, max_parallel=MAX_PARALLEL, project=SLUG)
    cta_url = upfr("cta_first.png")
    fal.gen_batch([{"model": "fal-ai/nano-banana/edit", "tag": "cta_last",
                    "payload": {"prompt": CTA_LAST, "image_urls": [cta_url], "num_images": 1,
                                "output_format": "png", "aspect_ratio": "9:16"}}],
                  outdir=GEN, max_parallel=MAX_PARALLEL, project=SLUG)
    print("FALA B done", flush=True)

# ── RENDER ──────────────────────────────────────────────────────────────────────
def kref_element():
    return {"frontal_image_url": upref("g4_clean.png"),
            "reference_image_urls": [upref("g4_clean.png"), upref("ali_g5.jpg")]}

def scenes_spec():
    el = kref_element()
    scenes = []
    for sid in ["hook", "kolce", "lezenie", "relaks", "stopy"]:
        sc = BP[sid]
        scenes.append({"tag": sid, "engine": "kref",
                       "image_urls": [upfr(sid + "_first.png")],
                       "elements": [el],
                       "prompt": sc["motion_prompt_en"],
                       "negative_prompt": render.NEG + ", " + NEG_EXTRA + ", " + SCENE_NEG,
                       "duration": "5", "aspect_ratio": "9:16"})
    cta = BP["cta"]
    scenes.append({"tag": "cta", "engine": "flf",
                   "image_url": upfr("cta_first.png"), "tail_image_url": upfr("cta_last.png"),
                   "prompt": cta["motion_prompt_en"],
                   "negative_extra": NEG_EXTRA + ", " + SCENE_NEG})
    return scenes

def main():
    step = sys.argv[1] if len(sys.argv) > 1 else "fala_a"
    if step == "neutralizuj":
        fal.preflight(floor_usd=15)
        neutralizuj()
    elif step == "fala_a":
        audio_jobs, sfx_trims = audio_spec()
        firsts = frames_first_spec()
        fala = firsts + audio_jobs
        print(f"FALA A: {len(firsts)} klatek-FIRST + {len(audio_jobs)} audio = {len(fala)} jobow", flush=True)
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
