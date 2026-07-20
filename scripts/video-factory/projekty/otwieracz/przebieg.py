# -*- coding: utf-8 -*-
"""PRZEBIEG otwieracz automatyczny (DEMO) — hands-FREE demo wg wzorca @freakinreviews.

Stack: 6×FLF (playbook gadzet-handsPOV), master-frame = refs/master_clean.png (white-label
z geometrii wzorca po de-brandzie — odstępstwo od Ali zalogowane, produkt DEMO bez aukcji).
TRIK PĘTLI: srebrne wieczko = symetria obrotowa → sceny obrotu (hook/twist/serie/cta) mają
first=last i prompt pełnego obrotu — klatka końcowa wygląda identycznie = seamless loop;
jedyna scena ze zmianą stanu = pop (first: na słoiku, last: uniesione z wieczkiem).
Etapy: python przebieg.py a1 | a2 | a3 | render
"""
import os, sys, json
sys.path.insert(0, r"C:/tmp/video-factory/tools")
import fal, render

SLUG = "otwieracz"
BASE = rf"C:\tmp\video-factory\{SLUG}"
GEN  = os.path.join(BASE, "gen"); os.makedirs(GEN, exist_ok=True)
REFS = os.path.join(BASE, "refs")
MAX_PARALLEL = 8
fal.set_project(SLUG)

def upref(n): return fal.store(os.path.join(REFS, n), f"{SLUG}/r_" + n)
def upg(n):   return fal.store(os.path.join(GEN, n), f"{SLUG}/g_" + n)

WORLD = ("bright modern kitchen: warm light-wood countertop, soft white cabinet fronts blurred in "
         "the background with two or three unlabeled preserve jars (bokeh), warm natural daylight "
         "from a window, HIGH-KEY warm light, photorealistic")
KEEP = ("Image 2 is the product reference: a white dome-shaped electric jar opener with a round "
        "yellow-green button on top and TWO light grey gripper arms clamping the jar lid. KEEP the "
        "device EXACTLY as in Image 2 - same shape, same colors, same two arms, same button, NO "
        "text or logos anywhere on it. ")
ANTI = (" No readable text anywhere (no labels on jars, nothing written on the device); EXACTLY "
        "ONE opener device; no hands, no people; photorealistic product video still, sharp focus.")

# ── FALA A1: świat-hook + CAŁE audio ────────────────────────────────────────────
VOICE = "Aria"
VO = {
 "vo_hook":  "Ten słoik? Otwiera się sam.",
 "vo_twist": "Klik. I kręci za mnie.",
 "vo_seria": "Działa na każdym wieczku.",
 "vo_cta":   "Koniec walki ze słoikami.",
}
PL_DIAC = set("ąćęłńóśźż") | set("ĄĆĘŁŃÓŚŹŻ")
MUSIC = ("upbeat playful kitchen pop with a steady punchy beat from the very first second, bright "
         "and energetic, constant energy until the very end, no outro, no fade out, NO lo-fi")
AMBIENT = "quiet bright kitchen room tone, faint refrigerator hum, steady and seamless, NO melody, NO music"
SFX = {
 "sfx_klik":   ("sound effect foley: a small plastic button click then a light motorized clamp closing with a short servo whirr, close-up, dry, NO music, NO reverb", 1.0),
 "sfx_warkot": ("sound effect foley: a small electric kitchen gadget motor whirring steadily while twisting a metal jar lid, gentle mechanical rotation, close-up, dry, NO music, NO reverb", 2.2),
 "sfx_pop":    ("sound effect foley: a metal jar lid popping open with a soft vacuum pop then a light glass clink, satisfying, close-up, dry, NO music, NO reverb", 1.2),
 "sfx_warkot2":("sound effect foley: a small electric motor whirring and twisting a plastic bottle cap, light rattle of the cap, close-up, dry, NO music, NO reverb", 1.8),
}
HOOK_FIRST = ("Create a photorealistic scene: " + KEEP + "The device sits centered on top of a "
              "medium glass jar of dark red jam (jar has NO label, jam visible through the glass), "
              "the jar stands on the countertop. Scene: " + WORLD + ". Framing: 9:16 vertical, "
              "close frontal shot from slightly above counter level, the device and jar fill most "
              "of the frame, the two grey gripper arms clearly clamped on the silver lid." + ANTI)

def a1():
    vodir = os.path.join(GEN, "vo_txt"); os.makedirs(vodir, exist_ok=True)
    for t, txt in VO.items():
        open(os.path.join(vodir, t + ".txt"), "w", encoding="utf-8").write(txt)
    if not any(c in PL_DIAC for c in "".join(VO.values())):
        raise RuntimeError("VO bez diakrytykow -> STOP")
    jobs = [{"model": "fal-ai/nano-banana/edit", "tag": "hook_first",
             "payload": {"prompt": HOOK_FIRST, "image_urls": [upref("wz_frame_front.jpg"), upref("master_clean.png")],
                         "num_images": 1, "output_format": "png", "aspect_ratio": "9:16"}},
            {"model": "fal-ai/stable-audio-25/text-to-audio", "tag": "music",
             "payload": {"prompt": MUSIC, "seconds_total": 25, "num_inference_steps": 8}},
            {"model": "fal-ai/stable-audio-25/text-to-audio", "tag": "ambient",
             "payload": {"prompt": AMBIENT, "seconds_total": 20, "num_inference_steps": 8}}]
    for t, txt in VO.items():
        jobs.append({"model": "fal-ai/elevenlabs/tts/eleven-v3", "tag": t,
                     "payload": {"text": txt, "voice": VOICE, "stability": 0.45}})
    for t, (pr, _trim) in SFX.items():
        jobs.append({"model": "fal-ai/stable-audio-25/text-to-audio", "tag": t + "_raw",
                     "payload": {"prompt": pr, "seconds_total": 10, "num_inference_steps": 8}})
    got = fal.gen_batch(jobs, outdir=GEN, max_parallel=MAX_PARALLEL, project=SLUG)
    import subprocess
    for t, (_pr, trim) in SFX.items():
        raw = os.path.join(GEN, t + "_raw.mp3")
        if os.path.exists(raw):
            subprocess.run(["ffmpeg", "-v", "error", "-i", raw, "-af",
                            f"silenceremove=start_periods=1:start_threshold=-45dB,atrim=0:{trim},afade=t=out:st={max(0,trim-0.25):.2f}:d=0.25",
                            "-y", os.path.join(GEN, t + ".mp3")], check=True)
    print("A1 done:", {k: bool(v) for k, v in got.items()})

# ── FALA A2: pozostałe klatki-FIRST (chain świata z hook_first + master) ───────
def a2():
    hf = upg("hook_first.png"); mс = upref("master_clean.png")
    KEEPW = ("Image 1 shows the canonical scene: a white electric jar opener with grey gripper "
             "arms sitting on an unlabeled jam jar on a warm wooden countertop in a bright kitchen. "
             "Image 2 is the product reference. Keep the SAME kitchen, countertop, light and the "
             "IDENTICAL device (no text on it). ")
    jobs = [
     {"model": "fal-ai/nano-banana/edit", "tag": "twist_first",
      "payload": {"prompt": KEEPW + "Recompose to a WIDER shot of the same scene from a slightly "
                  "lower frontal angle: the whole jam jar and device visible with some countertop "
                  "around, same kitchen background in bokeh." + ANTI,
                  "image_urls": [hf, mс], "num_images": 1, "output_format": "png", "aspect_ratio": "9:16"}},
     {"model": "fal-ai/nano-banana/edit", "tag": "seria1_first",
      "payload": {"prompt": KEEPW + "Change ONLY the jar: the device now sits on a TALLER glass "
                  "jar of pickled cucumbers (NO label, cucumbers visible through glass), standing "
                  "in the same spot on the countertop, same framing as Image 1." + ANTI,
                  "image_urls": [hf, mс], "num_images": 1, "output_format": "png", "aspect_ratio": "9:16"}},
     {"model": "fal-ai/nano-banana/edit", "tag": "seria2_first",
      "payload": {"prompt": KEEPW + "Change ONLY the container: the device now sits on a clear "
                  "glass bottle of orange juice with a metal twist cap (NO label, juice visible), "
                  "standing in the same spot on the countertop, same framing as Image 1." + ANTI,
                  "image_urls": [hf, mс], "num_images": 1, "output_format": "png", "aspect_ratio": "9:16"}},
    ]
    got = fal.gen_batch(jobs, outdir=GEN, max_parallel=MAX_PARALLEL, project=SLUG)
    print("A2 done:", {k: bool(v) for k, v in got.items()})

# ── FALA A3: pop_last (jedyna zmiana stanu) ────────────────────────────────────
def a3():
    tf = upg("twist_first.png")
    POP_LAST = ("Image 1 is the exact previous frame: a white electric jar opener with grey "
                "gripper arms on an unlabeled jam jar on a wooden countertop. Keep the IDENTICAL "
                "kitchen, countertop, jar position, light and framing, pixel-faithful. Change ONLY "
                "this: the device has FINISHED opening - it is now LIFTED about 10 centimeters "
                "above the jar, holding the silver lid gripped in its two grey arms underneath it; "
                "the jam jar below is OPEN (no lid, dark red jam visible at the rim). The jar "
                "stays exactly in place." + ANTI)
    got = fal.gen_batch([{"model": "fal-ai/nano-banana/edit", "tag": "pop_last",
                          "payload": {"prompt": POP_LAST, "image_urls": [tf], "num_images": 1,
                                      "output_format": "png", "aspect_ratio": "9:16"}}],
                        outdir=GEN, max_parallel=MAX_PARALLEL, project=SLUG)
    print("A3 done:", {k: bool(v) for k, v in got.items()})

# ── RENDER: 6×FLF (symetria obrotowa = first==last poza pop) ───────────────────
SPIN = ("The jar stands perfectly still on the counter, held steady by the two outer grey arms "
        "of the device pressing gently on the jar sides. The inner head of the white device grips "
        "the silver lid and rotates it smoothly and continuously around the vertical axis (one "
        "full turn) - visible steady mechanical rotation of the LID only, slight micro-vibration "
        "of the device body. The jar and the arms do not rotate. Nothing else moves, camera "
        "locked with subtle handheld micro-drift.")
NEG = ("readable text, letters, logo, label, second device, extra jar, human hand, fingers, "
       "person, dark kitchen, jar rotating, jar sliding")

def do_render():
    hf = upg("hook_first.png"); tf = upg("twist_first.png")
    s1 = upg("seria1_first.png"); s2 = upg("seria2_first2.png"); pst = upg("pop_still.png")
    scenes = [
     {"tag": "hook",   "engine": "flf", "image_url": hf, "tail_image_url": hf,
      "prompt": "At the very start the device gives a small click and its grey arms settle their grip, then: " + SPIN,
      "negative_extra": NEG},
     {"tag": "twist",  "engine": "flf", "image_url": tf, "tail_image_url": tf, "prompt": SPIN, "negative_extra": NEG},
     {"tag": "pop",    "engine": "flf", "image_url": pst, "tail_image_url": pst,
      "prompt": ("Static reveal hold: the open jam jar and the device resting on the counter with "
                 "the silver lid in its arms stay exactly in place; only subtle handheld camera "
                 "micro-drift and soft light shimmer. Nothing moves."), "negative_extra": NEG},
     {"tag": "seria1", "engine": "flf", "image_url": s1, "tail_image_url": s1, "prompt": SPIN, "negative_extra": NEG},
     {"tag": "seria2", "engine": "flf", "image_url": s2, "tail_image_url": s2,
      "prompt": SPIN.replace("jar", "bottle"), "negative_extra": NEG},
     {"tag": "cta",    "engine": "flf", "image_url": hf, "tail_image_url": hf, "prompt": SPIN, "negative_extra": NEG},
    ]
    done = render.render_scenes(scenes, GEN, project=SLUG)
    print("RENDER done:", json.dumps({k: bool(v) for k, v in done.items()}))

if __name__ == "__main__":
    step = sys.argv[1] if len(sys.argv) > 1 else "a1"
    fal.preflight(floor_usd=15)
    {"a1": a1, "a2": a2, "a3": a3, "render": do_render}[step]()
