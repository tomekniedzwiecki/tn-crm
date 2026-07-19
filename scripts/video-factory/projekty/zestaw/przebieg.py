# -*- coding: utf-8 -*-
"""PRZEBIEG zestaw — NOWOSC: kref element PER SCENA (kazda scena sledzi inne narzedzie).
Etapy: python przebieg.py fala_a | fala_b | render
"""
import os, sys, json, subprocess
sys.path.insert(0, r"C:/tmp/video-factory/tools")
import fal, render

SLUG = "zestaw"
BASE = rf"C:\tmp\video-factory\{SLUG}"
GEN  = os.path.join(BASE, "gen"); os.makedirs(GEN, exist_ok=True)
REFS = os.path.join(BASE, "refs")
MAX_PARALLEL = 8
fal.set_project(SLUG)

BP = {s["id"]: s for s in json.load(open(os.path.join(BASE, "blueprint.json"), encoding="utf-8"))["sceny"]}
KARTA = json.load(open(os.path.join(BASE, "KARTA.json"), encoding="utf-8"))
NEG_EXTRA = ", ".join(KARTA["product"]["forbidden_leaks"])
SCENE_NEG = ("pink tools, pink vacuum, cleaning gel, slime, yellow rubber gloves, power drill, foam, "
             "suds, water, readable text, badge, second identical tool, face visible, dark night interior")

KEEP = ("Image 1 is a real product photo (crop) of a tool from a blue car detailing kit. KEEP the tool "
        "EXACTLY as its pixels - same shape, colours, materials, proportions. Do NOT redraw, reshape or "
        "recolour it. Only place it into the described scene with the described hand and action.")
ANTI = ("No readable text, no logos, no badges anywhere; EXACTLY ONE such tool in the scene; hand natural "
        "with five fingers, light grey casual sleeve, no rings, no nail polish; bright warm daylight "
        "interior, never dark; photorealistic, natural skin texture; no person's face in frame.")

def upref(name): return fal.store(os.path.join(REFS, name), f"{SLUG}/ref_" + name)
def upfr(name):  return fal.store(os.path.join(GEN, name), f"{SLUG}/fr_" + name)

SCENE_REFS = {"hook": "duster.png", "nawiewy": "vent.png", "szczeliny": "pedzel.png",
              "rekawica": "rekawica.png", "total": "zestaw_clean2.png"}

def frames_first_spec():
    jobs = []
    for sid, ref in SCENE_REFS.items():
        sc = BP[sid]
        prompt = KEEP + " SCENE: " + sc["first_frame_brief_en"] + " " + ANTI
        jobs.append({"model": "fal-ai/nano-banana/edit", "tag": sid + "_first",
                     "payload": {"prompt": prompt, "image_urls": [upref(ref)], "num_images": 1,
                                 "output_format": "png", "aspect_ratio": "9:16"}})
    return jobs

VOICE = "Aria"
VO = {
 "vo_hook":      "Co tydzień ten sam rytuał.",
 "vo_nawiewy":   "Nawiewy? Trzy sekundy.",
 "vo_szczeliny": "Dociera w każdą szczelinę.",
 "vo_rekawica":  "Kierownica jak nowa.",
 "vo_total":     "Auto jak spod igły.",
 "vo_cta":       "Do następnego tygodnia.",
}
VODIR = os.path.join(GEN, "vo_txt"); os.makedirs(VODIR, exist_ok=True)
PL_DIAC = set("ąćęłńóśźż") | set("ĄĆĘŁŃÓŚŹŻ")

MUSIC = ("clean upbeat feel-good groove with a steady beat from the very first second, light funky bass, "
         "crisp percussion, satisfying-cleaning vibe, constant energy until the very end, no outro, "
         "no fade out, NO lo-fi, NO ambient")
AMBIENT = ("quiet parked car interior room tone at midday, faint distant street sounds through closed "
           "windows, steady and seamless, NO melody, NO music")
SFX = {
 "sfx_sweep": ("sound effect foley: soft chenille microfiber duster sweeping along a plastic car dashboard, gentle fabric swish, close-up, dry, NO music, NO reverb", 1.8),
 "sfx_vent":  ("sound effect foley: microfiber-covered plastic tongs sliding along car air vent slats, soft plastic-fabric glide, close-up, dry, NO music, NO reverb", 1.6),
 "sfx_brush": ("sound effect foley: quick light strokes of a soft detailing brush on plastic trim, fine bristle flicks, close-up, dry, NO music, NO reverb", 1.6),
 "sfx_wipe":  ("sound effect foley: microfiber mitt wiping around a leather steering wheel rim, soft fabric rub, close-up, dry, NO music, NO reverb", 1.8),
 "sfx_zip":   ("sound effect foley: a zipper being pulled closed along a fabric bag in one satisfying stroke, close-up, dry, NO music, NO reverb", 1.4),
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

CTA_FIRST = ("Image 1 is a product photo of the open black zip bag with blue trim and blue tools of a car "
             "detailing kit. KEEP the bag and tools EXACTLY as their pixels. SCENE: the open bag sits on "
             "the passenger seat of a modern car in warm afternoon sunlight; a woman's hand in a light "
             "grey sleeve lowers the blue chenille dashboard duster INTO the bag, head first. " + ANTI)

def fala_b():
    j1 = [{"model": "fal-ai/nano-banana/edit", "tag": "cta_first",
           "payload": {"prompt": CTA_FIRST, "image_urls": [upref("zestaw_clean2.png"), upref("duster.png")],
                       "num_images": 1, "output_format": "png", "aspect_ratio": "9:16"}}]
    fal.gen_batch(j1, outdir=GEN, max_parallel=MAX_PARALLEL, project=SLUG)
    CTA_LAST = ("Image 1 is the exact previous frame. Keep EVERYTHING identical and pixel-faithful - the "
                "car seat, light, framing, the black bag with blue trim. Change ONLY: the duster is now "
                "fully inside the bag (not visible), the bag is ZIPPED CLOSED, and the woman's hand rests "
                "flat on top of the closed bag. Nothing else changes. " + ANTI)
    j2 = [{"model": "fal-ai/nano-banana/edit", "tag": "cta_last",
           "payload": {"prompt": CTA_LAST, "image_urls": [upfr("cta_first.png")],
                       "num_images": 1, "output_format": "png", "aspect_ratio": "9:16"}}]
    fal.gen_batch(j2, outdir=GEN, max_parallel=MAX_PARALLEL, project=SLUG)
    print("FALA B done", flush=True)

def scenes_spec():
    scenes = []
    for sid, ref in SCENE_REFS.items():
        sc = BP[sid]
        el = {"frontal_image_url": upref(ref),
              "reference_image_urls": [upref(ref), upref("zestaw_clean2.png")]}
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
