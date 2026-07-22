# -*- coding: utf-8 -*-
"""PRZEBIEG Skrolik (pierscien do przewijania) — gadzet-handsPOV, wzorzec @hellozdvj8x 280.5k.
Stack: 5xFLF (Kling 2.5) + nano-banana/edit; music-forward (bez VO); SFX diegetyczne klik+scroll.
Doktryna EDYTUJ PRAWDE: klatki = nano-edycja packshotu Ali (identity z Image 2), akcja slowem.
Etapy: python przebieg.py a1 | a2 | render   (bramka/montaz robione osobno przez operatora)
"""
import os, sys, subprocess
sys.path.insert(0, r"C:/tmp/video-factory/tools")
import fal, render

SLUG = "skrolik"
BASE = rf"C:\tmp\video-factory\{SLUG}"
GEN  = os.path.join(BASE, "gen"); os.makedirs(GEN, exist_ok=True)
REFS = os.path.join(BASE, "refs")
MAX_PARALLEL = 6
fal.set_project(SLUG)

def upref(n): return fal.store(os.path.join(REFS, n), f"{SLUG}/r_" + n)
def upg(n):   return fal.store(os.path.join(GEN, n), f"{SLUG}/g_" + n)
def nano(tag, prompt, imgs):
    return {"model": "fal-ai/nano-banana/edit", "tag": tag,
            "payload": {"prompt": prompt, "image_urls": imgs, "num_images": 1,
                        "output_format": "png", "aspect_ratio": "9:16"}}

KEEP = ("Image 2 is the exact product identity reference: a matte pastel-PINK finger scroll-ring "
        "worn on the index finger. KEEP the ring EXACTLY as in Image 2 - same wedge/keystone shape, "
        "same three round buttons in one row on top, same OPEN silicone C-clip, same pink color; do "
        "NOT change its shape, do NOT add or remove buttons, do NOT close the clip, no text or logo on it. ")
SCREENS = ("The phone screen shows a GENERIC vertical short-video feed of abstract colorful cards - "
           "no brand names, no readable text, no recognizable app interface; any tiny text is blurred "
           "and illegible. ")
SKIN = ("Natural hand skin with visible pores and fine texture, subsurface scattering, not waxy, not "
        "airbrushed; clean natural fingernails, no nail polish, no bracelet, no watch, no other jewelry. ")
ANTI = ("Photorealistic UGC smartphone look, slight grain, uneven natural window light, tiny handheld "
        "imperfection. 9:16 vertical. EXACTLY ONE pink ring on ONE finger; the other hand holds no "
        "second device. No on-screen captions, no logos.")

def P(pose_scene): return (pose_scene + " " + SCREENS + SKIN + ANTI)

# ── FALA A: klatki-FIRST niezalezne + CALE audio ─────────────────────────────
MUSIC = ("upbeat bright lifestyle pop with a punchy kick and crisp snare driving CONSTANTLY from the "
         "very first second, radio-ready punchy mix, energetic and clean, constant energy until the "
         "very end, no outro, no fade out, absolutely no vocals, NO lo-fi, NO ambient")
AMBIENT = "quiet bright living-room room tone, faint airy hum, steady and seamless, NO melody, NO music, NO vocals"
SFX = {
 "sfx_click": ("sound effect foley: a single small soft plastic button click, tactile, at the very "
               "beginning then silence, very close microphone, dry, NO music, NO reverb", 0.5),
 "sfx_scroll": ("sound effect foley: one short soft paper-like swipe whoosh of a phone feed scrolling "
                "once, at the very beginning then silence, very close microphone, dry, NO music, NO reverb", 0.6),
}

def a1():
    pose_thumb = upref("keep4-detal-klips.png")      # POSE: kciuk na przyciskach
    pack = upref("packshot_pink.png")                # PRODUCT identity (pink)
    pose_desk = upref("keep5-lifestyle.png")         # POSE+kontekst: pierscien na palcu, biurko
    troj = upref("trojpak.png")                      # 3 kolory identity

    HOOK = P("Use Image 1 ONLY for the hand pose and thumb-on-buttons position - ignore its color, "
             "product and background. " + KEEP +
             "Scene: extreme close-up macro of a woman's hand, the pink ring clipped on her index finger, "
             "her thumb resting on the top buttons about to press; behind the hand, softly out of focus, a "
             "smartphone stands upright hands-free (leaning against a couple of books, NOT a branded stand) "
             "showing a vertical feed. Bright modern home, warm high-key daylight.")
    DEMO = P("Use Image 1 ONLY for the hand and thumb pose - ignore its color, product and background. " + KEEP +
             "Scene: even TIGHTER macro from a slightly different angle - the three round buttons of the pink "
             "ring on the index finger fill the frame, the thumb hovering just over the TOP button; the propped "
             "phone glows softly out of focus behind. Bright high-key daylight.")
    KONT = P("Use Image 1 for the hand pose (pink ring on the index finger) and the relaxed home context - "
             "ignore any on-screen text and background brand. " + KEEP +
             "Scene: pull back to a cozy living room, NO face in frame - only a hand and forearm and lap. A "
             "woman sits on a couch, one hand loosely holding a plain mug, the OTHER hand wears the pink ring "
             "on its index finger resting near her knee; on the coffee table a phone stands upright hands-free "
             "showing a vertical feed. Warm cozy daylight.")
    KOLORY = ("Image 1 shows the three product colors. Create a clean product beat: THREE of these finger "
              "scroll-rings resting on a bright neutral surface - one BLACK, one IVORY WHITE, one PINK - "
              "arranged in a soft row, each ring matching Image 1 EXACTLY (same wedge shape, three round "
              "buttons in one row, open silicone C-clip). Shallow depth of field, high-key soft daylight. " +
              ANTI.replace("EXACTLY ONE pink ring on ONE finger", "exactly three rings, one of each color") )

    jobs = [
      nano("hook_first", HOOK, [pose_thumb, pack]),
      nano("demo_first", DEMO, [pose_thumb, pack]),
      nano("kontekst_first", KONT, [pose_desk, pack]),
      nano("kolory", KOLORY, [troj]),
      {"model": "fal-ai/stable-audio-25/text-to-audio", "tag": "music",
       "payload": {"prompt": MUSIC, "seconds_total": 25, "num_inference_steps": 8}},
      {"model": "fal-ai/stable-audio-25/text-to-audio", "tag": "ambient",
       "payload": {"prompt": AMBIENT, "seconds_total": 20, "num_inference_steps": 8}},
    ]
    for t, (pr, _tr) in SFX.items():
        jobs.append({"model": "fal-ai/stable-audio-25/text-to-audio", "tag": t + "_raw",
                     "payload": {"prompt": pr, "seconds_total": 10, "num_inference_steps": 8}})
    got = fal.gen_batch(jobs, outdir=GEN, max_parallel=MAX_PARALLEL, project=SLUG)
    for t, (_pr, trim) in SFX.items():
        raw = os.path.join(GEN, t + "_raw.mp3")
        if os.path.exists(raw):
            subprocess.run(["ffmpeg", "-v", "error", "-i", raw, "-af",
                f"silenceremove=start_periods=1:start_threshold=-45dB,atrim=0:{trim},afade=t=out:st={max(0,trim-0.2):.2f}:d=0.2",
                "-y", os.path.join(GEN, t + ".mp3")], check=True)
    print("A1 done:", {k: bool(v) for k, v in got.items()})

# ── FALA B: klatki-LAST (chain z FIRST, zmiana TYLKO kciuk+feed) ─────────────
def a2():
    hf = upg("hook_first.png"); df = upg("demo_first.png"); kf = upg("kontekst_first.png")
    def last(scene_change):
        return ("Image 1 is the exact previous frame. Keep EXACTLY the same framing, lighting, background, "
                "camera angle, the hand and the pink ring position, pixel-faithful. Change ONLY this: " +
                scene_change + " Do NOT add or remove any part of the ring; keep exactly three buttons and "
                "the open clip; no new objects, no new hands. " + SCREENS + "9:16 vertical.")
    jobs = [
      nano("hook_last", last("the thumb has PRESSED the top button (pushed down), and on the phone behind "
                             "the vertical feed has scrolled UP by one card."), [hf]),
      nano("demo_last", last("the thumb has just TAPPED the top button (pressed down), and on the soft-focus "
                             "phone behind the feed has advanced by one card."), [df]),
      nano("kontekst_last", last("the thumb of the ring hand has pressed a button and the phone's vertical "
                                 "feed has scrolled up one card; the other hand still holds the mug, "
                                 "untouched."), [kf]),
    ]
    got = fal.gen_batch(jobs, outdir=GEN, max_parallel=MAX_PARALLEL, project=SLUG)
    print("A2 done:", {k: bool(v) for k, v in got.items()})

# ── RENDER: 5xFLF ────────────────────────────────────────────────────────────
NEG_PINK = ("closed solid ring band, four buttons, five buttons, two buttons, metal ring body, chrome, "
            "RGB glow, screen on the ring, charging cable, brand logo on product, second controller, "
            "black ring body, white ring body, horizontal carousel scroll")
NEG_KOL = ("closed solid ring band, four buttons, two buttons, metal, chrome, RGB glow, screen on the ring, "
           "charging cable, brand logo, more than three rings, horizontal carousel scroll")
DRIFT = " Subtle handheld micro-drift, no full rotation, no fast motion."

def do_render():
    hf = upg("hook_first.png"); hl = upg("hook_last.png")
    df = upg("demo_first.png"); dl = upg("demo_last.png")
    kf = upg("kontekst_first.png"); kl = upg("kontekst_last.png")
    ko = upg("kolory.png")
    scenes = [
      {"tag": "hook", "engine": "flf", "image_url": hf, "tail_image_url": hl,
       "prompt": "The thumb presses one of the top buttons with a small tactile push; on the phone behind, "
                 "the vertical feed scrolls UP one item hands-free, the screen is never touched." + DRIFT,
       "negative_extra": NEG_PINK},
      {"tag": "demo", "engine": "flf", "image_url": df, "tail_image_url": dl,
       "prompt": "The thumb taps the top button once, clearly; on the soft-focus phone the vertical feed "
                 "advances one card. Only the thumb moves." + DRIFT, "negative_extra": NEG_PINK},
      {"tag": "kontekst", "engine": "flf", "image_url": kf, "tail_image_url": kl,
       "prompt": "The thumb of the ring hand presses a button; the phone feed scrolls up hands-free while "
                 "she keeps holding the mug; no free hand touches the phone." + DRIFT, "negative_extra": NEG_PINK},
      {"tag": "kolory", "engine": "flf", "image_url": ko, "tail_image_url": ko,
       "prompt": "Static product reveal hold: the three rings stay perfectly in place, only soft light "
                 "shimmer." + DRIFT, "negative_extra": NEG_KOL},
      {"tag": "cta", "engine": "flf", "image_url": hf, "tail_image_url": hf,
       "prompt": "One more gentle thumb tap on the top button, then the shot settles back into this exact "
                 "framing (compositional loop, not a rewind)." + DRIFT, "negative_extra": NEG_PINK},
    ]
    done = render.render_scenes(scenes, GEN, project=SLUG)
    print("RENDER done:", {k: bool(v) for k, v in done.items()})

if __name__ == "__main__":
    step = sys.argv[1] if len(sys.argv) > 1 else "a1"
    fal.preflight(floor_usd=15)
    {"a1": a1, "a2": a2, "render": do_render}[step]()
