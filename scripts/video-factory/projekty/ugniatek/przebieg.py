# -*- coding: utf-8 -*-
"""PRZEBIEG Ugniatek (masazer powieziowy 6-glowicowy) — gadzet-handsPOV, music-forward + ASMR knead.
Wzorzec radaru SKAZONY (KAJUE/pistolet 1-glowicowy) -> nosnik z proven category pattern (dotykowa
ulga wielostrefowa) + roznicowniki: 6 glowic, 2 formy uzycia. Doktryna EDYTUJ PRAWDE: kazdy
first-frame = nano-edycja WIERNEGO kadru landingu (an-makro/df-A/ugc-2/ugc-3, po F3A).
Stack: 5x FLF (Kling 2.5) + nano-banana/edit. SFX: knead + wydech ulgi.
Etapy: python przebieg.py a1 | a2 | render
"""
import os, sys, subprocess
sys.path.insert(0, r"C:/repos_tn/tn-crm/scripts/video-factory")
import fal, render

SLUG = "ugniatek"
PROJECT = "wf2-ugniatek-ads"
BASE = rf"C:\tmp\video-factory\{SLUG}"
GEN  = os.path.join(BASE, "gen"); os.makedirs(GEN, exist_ok=True)
REFS = os.path.join(BASE, "refs")
MAX_PARALLEL = 6
fal.set_project(PROJECT)

def upref(n): return fal.store(os.path.join(REFS, n), f"{SLUG}/r_" + n.replace('.webp', '.png') if n.endswith('.webp') else f"{SLUG}/r_" + n)
def upg(n):   return fal.store(os.path.join(GEN, n), f"{SLUG}/g_" + n)
def nano(tag, prompt, imgs):
    return {"model": "fal-ai/nano-banana/edit", "tag": tag,
            "payload": {"prompt": prompt, "image_urls": imgs, "num_images": 1,
                        "output_format": "png", "aspect_ratio": "9:16"}}

# ── KLAUZULE STALE ───────────────────────────────────────────────────────────
KEEP = ("KEEP the massager EXACTLY as in the product reference image: a FLAT OVAL cordless muscle "
        "massager in SATIN SILVER-GREY (soft brushed metallic, NOT mirror chrome, NOT dark graphite), "
        "with EXACTLY SIX black foam ball heads in a 2x3 grid on its underside, a central oval red-light "
        "diode panel between them, TWO integrated ribbed side handles, and a small dark side panel. "
        "Do NOT change its shape or colour, do NOT add a pistol/gun handle, keep exactly six heads "
        "(never four, never eight), no readable text, no brand, no price on the device. ")
SKIN = ("Natural human skin with visible pores and fine texture, subsurface scattering, not waxy, not "
        "airbrushed. ")
ANTI = ("Photorealistic UGC smartphone look, slight grain, uneven natural indoor light, tiny handheld "
        "imperfection. 9:16 vertical. EXACTLY ONE massager in the scene, no second device. No on-screen "
        "captions, no logos, no visible brand name, no price overlay. The device side panel stays small "
        "and out of focus, its markings illegible.")

# music-forward + ASMR
MUSIC = ("warm calm-confident lifestyle beat with a soft steady kick and a gentle pulse from the very "
         "first second, radio-ready and clean, understated and smooth so a close massage sound reads "
         "through it, constant energy until the very end, no outro, no fade out, absolutely no vocals, "
         "NO lo-fi, NO ambient-drone")
AMBIENT = ("quiet warm living-room room tone, faint airy hum, steady and seamless, NO melody, NO music, "
           "NO vocals")
SFX = {
 "sfx_knead": ("sound effect foley: a deep soft muffled kneading press of massage heads into muscle, a "
               "low warm mechanical thrum with a gentle skin contact, at the very beginning then silence, "
               "very close microphone, dry, NO music, NO reverb", 1.2),
 "sfx_exhale": ("sound effect foley: one soft relieved human exhale, a quiet breath of relief, at the "
                "very beginning then silence, very close microphone, dry, NO music, NO reverb", 1.0),
}

# ── FALA A: klatki-FIRST (nano-edycja wiernych kadrow) + CALE audio ───────────
def a1():
    makro = upref("an-makro.png")     # produkt: 6 glowic + panel diod (PRAWDA)
    pack  = upref("packshot.png")     # produkt: tozsamosc 3/4
    dfA   = upref("df-A.png")         # poza: oburacz, 2 uchwyty
    ugc2  = upref("ugc-2.png")        # forma2: oparcie ledzwiami, twarz-ulga
    ugc3  = upref("ugc-3.png")        # strefa: lydka, oburacz
    ugc1  = upref("ugc-1.png")        # skora/kark kontekst

    HOOK = ("Use Image 1 for the EXACT product identity ONLY — the six black foam ball heads in a 2x3 "
            "grid and the central glowing warm red-light diode panel of the grey satin massager; keep "
            "these EXACTLY, exactly six heads. Use Image 2 only for skin tone and the nape context. "
            "Scene: extreme close-up macro, the six heads of the massager pressed into the skin of the "
            "back of a person's neck and upper trapezius (the nape), the skin gently dimpling around the "
            "heads, the central red-light panel glowing warm between them. Warm soft indoor light. " +
            KEEP + SKIN + ANTI)
    FORMA1 = ("Reframe Image 1 into a 9:16 vertical composition. Keep the person sitting on a warm-lit "
              "couch, holding the grey satin massager by BOTH ribbed side handles and pressing its "
              "six-head underside firmly against her upper thigh, exactly as in Image 1 — same two-hand "
              "grip on the two handles, same device. Use Image 2 only to confirm the exact product "
              "identity. " + KEEP + SKIN + ANTI)
    FORMA2 = ("Reframe Image 1 into a 9:16 vertical composition. Keep the man leaning his lower back "
              "against the grey satin massager that lies heads-up on the couch backrest, hands-free, "
              "eyes closed and relaxed in warm evening lamp light, hands resting on his knees, exactly "
              "as in Image 1 — same device wedged between his lower back and the backrest. Use Image 2 "
              "only to confirm the exact product identity. " + KEEP + SKIN + ANTI)
    STREFA = ("Reframe Image 1 into a 9:16 vertical composition. Keep the young woman in workout clothes "
              "on a yoga mat pressing the grey satin massager by BOTH ribbed handles against her calf, "
              "bright daytime window light, exactly as in Image 1 — same two-hand grip, same device. "
              "Use Image 2 only to confirm the exact product identity. " + KEEP + SKIN + ANTI)

    jobs = [
      nano("hook_first",   HOOK,   [makro, ugc1]),
      nano("forma1_first", FORMA1, [dfA, pack]),
      nano("forma2_first", FORMA2, [ugc2, pack]),
      nano("strefa_first", STREFA, [ugc3, pack]),
      {"model": "fal-ai/stable-audio-25/text-to-audio", "tag": "music",
       "payload": {"prompt": MUSIC, "seconds_total": 25, "num_inference_steps": 8}},
      {"model": "fal-ai/stable-audio-25/text-to-audio", "tag": "ambient",
       "payload": {"prompt": AMBIENT, "seconds_total": 20, "num_inference_steps": 8}},
    ]
    for t, (pr, _tr) in SFX.items():
        jobs.append({"model": "fal-ai/stable-audio-25/text-to-audio", "tag": t + "_raw",
                     "payload": {"prompt": pr, "seconds_total": 10, "num_inference_steps": 8}})
    got = fal.gen_batch(jobs, outdir=GEN, max_parallel=MAX_PARALLEL, project=PROJECT)
    for t, (_pr, trim) in SFX.items():
        raw = os.path.join(GEN, t + "_raw.mp3")
        if os.path.exists(raw):
            subprocess.run(["ffmpeg", "-v", "error", "-i", raw, "-af",
                f"silenceremove=start_periods=1:start_threshold=-45dB,atrim=0:{trim},afade=t=out:st={max(0,trim-0.2):.2f}:d=0.2",
                "-y", os.path.join(GEN, t + ".mp3")], check=True)
    print("A1 done:", {k: bool(v) for k, v in got.items()})

# ── FALA B: klatki-LAST (chain z FIRST, zmiana TYLKO ruch/ugniecenie) ─────────
def a2():
    hf = upg("hook_first.png"); f1 = upg("forma1_first.png")
    f2 = upg("forma2_first.png"); sf = upg("strefa_first.png")
    def last(scene_change, extra=""):
        return ("Image 1 is the exact previous frame. Keep EXACTLY the same framing, lighting, "
                "background, camera angle and the massager's exact shape, colour and position, "
                "pixel-faithful. Change ONLY this: " + scene_change + " Do NOT change the device, keep "
                "exactly six heads, no new objects, no new hands. " + extra + " 9:16 vertical.")
    jobs = [
      nano("hook_last",   last("the six heads have pressed a little DEEPER into the muscle, the skin "
                               "dimples slightly more around them; the red-light panel still glows warm."), [hf]),
      nano("forma1_last", last("the hands have pressed the massager a touch DEEPER into the thigh in one "
                               "slow knead."), [f1]),
      nano("forma2_last", last("the man has settled his lower back a little DEEPER onto the massager and "
                               "taken a slow relieved breath — his chest risen a touch and his head "
                               "tilted back a little more; his hands still rest relaxed on his knees."), [f2]),
      nano("strefa_last", last("she has rolled the massager a few centimeters DOWN along her calf and "
                               "pressed it lightly."), [sf]),
    ]
    got = fal.gen_batch(jobs, outdir=GEN, max_parallel=MAX_PARALLEL, project=PROJECT)
    print("A2 done:", {k: bool(v) for k, v in got.items()})

# ── RENDER: 5x FLF ───────────────────────────────────────────────────────────
NEG_EXTRA = ("pistol gun handle, single interchangeable percussion head, set of screw-on nozzle "
             "attachments, touchscreen or colour LCD, mirror chrome finish, dark graphite gunmetal body, "
             "power cable to the device, readable text or numbers on the side panel, glowing UI glyphs, "
             "brand logo, the word KAJUE, price overlay, second massager, duplicate device, more than six "
             "heads, fewer than six heads, morphing device")
DRIFT = " Subtle handheld micro-drift, no full rotation, no camera spin, no fast motion."

def do_render():
    hf = upg("hook_first.png"); hl = upg("hook_last.png")
    f1 = upg("forma1_first.png"); f1l = upg("forma1_last.png")
    f2 = upg("forma2_first.png"); f2l = upg("forma2_last.png")
    sf = upg("strefa_first.png"); sfl = upg("strefa_last.png")
    scenes = [
      {"tag": "hook", "engine": "flf", "image_url": hf, "tail_image_url": hl,
       "prompt": "The six massage heads knead deep into the muscle with a small firm vibrating press; "
                 "the skin dimples and releases once. Only the heads press, the device keeps its exact "
                 "shape." + DRIFT, "negative_extra": NEG_EXTRA},
      {"tag": "forma1", "engine": "flf", "image_url": f1, "tail_image_url": f1l,
       "prompt": "She presses the massager by both handles a touch deeper into her thigh in one slow "
                 "knead; only the arms move, the device keeps its exact shape." + DRIFT, "negative_extra": NEG_EXTRA},
      {"tag": "forma2", "engine": "flf", "image_url": f2, "tail_image_url": f2l,
       "prompt": "He settles his lower back a little deeper onto the massager and takes a slow relieved "
                 "breath, chest rising, head tilting back a touch; hands relaxed on his knees; the device "
                 "stays put." + DRIFT, "negative_extra": NEG_EXTRA},
      {"tag": "strefa", "engine": "flf", "image_url": sf, "tail_image_url": sfl,
       "prompt": "She rolls the massager a few centimeters along her calf and presses it lightly; the "
                 "device keeps its exact shape." + DRIFT, "negative_extra": NEG_EXTRA},
      {"tag": "cta", "engine": "flf", "image_url": hl, "tail_image_url": hf,
       "prompt": "One more slow deep knead of the six heads into the muscle, then the shot settles back "
                 "into this exact macro composition (compositional loop, not a rewind)." + DRIFT,
       "negative_extra": NEG_EXTRA},
    ]
    done = render.render_scenes(scenes, GEN, project=PROJECT)
    print("RENDER done:", {k: bool(v) for k, v in done.items()})

if __name__ == "__main__":
    step = sys.argv[1] if len(sys.argv) > 1 else "a1"
    fal.preflight(floor_usd=15)
    {"a1": a1, "a2": a2, "render": do_render}[step]()
