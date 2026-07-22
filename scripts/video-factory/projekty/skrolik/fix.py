# -*- coding: utf-8 -*-
"""FIX Skrolik — MODEL UZYCIA (feedback Tomka 22.07): produkt to PILOT z PRZYCISKAMI, ktore
sie KLIKA kciukiem — NIE zyroskop/gest w powietrzu. Poprzedni przebieg pokazal palec WYCIAGNIETY
i CELUJACY w telefon (kontekst, hookvar2) oraz luzna piesc bez docisku (hook, demo) = zle uzycie.
Naprawa: kciuk TEJ SAMEJ dloni DOCISKA jeden z 3 przyciskow (wyrazny docisk, keep4 = wzorzec
interakcji); palec wskazujacy z pierscieniem ZGIETY/luzny, NIE wyciagniety, NIE celuje w telefon;
dlon luzno, Z DALA od telefonu; scroll na ekranie = SKUTEK kliku.
Sceny naprawiane: hook, demo, kontekst, hookvar2 (+ cta = echo hooka). kolory bez zmian.
Etapy: python fix.py a1 | a2 | render
"""
import os, sys
sys.path.insert(0, r"C:/tmp/video-factory/tools")
import fal, render

SLUG = "skrolik"
PROJ = "skrolik_fix"                       # osobny prefiks ledgera (2. sesja pcha ad-forge)
BASE = rf"C:\tmp\video-factory\{SLUG}"
GEN  = os.path.join(BASE, "gen")
REFS = os.path.join(BASE, "refs")
MAX_PARALLEL = 4
fal.set_project(PROJ)

def upref(n): return fal.store(os.path.join(REFS, n), f"{PROJ}/r_" + n)
def upg(n):   return fal.store(os.path.join(GEN, n), f"{PROJ}/g_" + n)
def nano(tag, prompt, imgs):
    return {"model": "fal-ai/nano-banana/edit", "tag": tag,
            "payload": {"prompt": prompt, "image_urls": imgs, "num_images": 1,
                        "output_format": "png", "aspect_ratio": "9:16"}}

KEEP = ("Image 2 is the exact product identity reference: a matte pastel-PINK finger scroll-ring "
        "worn on the index finger. KEEP the ring EXACTLY as in Image 2 - same wedge/keystone shape, "
        "same three round buttons in one row on top, same OPEN silicone C-clip, same pink color; do "
        "NOT change its shape, do NOT add or remove buttons, do NOT close the clip, no text or logo on it. ")
# MODEL UZYCIA — rdzen naprawy: kciuk DOCISKA przycisk, palec ZGIETY, dlon Z DALA od telefonu.
PRESS = ("CRITICAL - reproduce the exact hand interaction from Image 1: the pad of the THUMB is "
         "pressing DOWN firmly onto one of the three top buttons of the ring - a clear, deliberate "
         "button press, the thumb tip flattened against the button, the button visibly pushed in. "
         "The index finger that WEARS the ring stays CURLED in a relaxed natural grip; it is NOT "
         "extended, NOT straightened, NOT pointing, and does NOT reach toward the phone. The hand "
         "rests loose and still and is well AWAY from the phone; nobody touches the phone screen - "
         "the feed scrolls by itself as a RESULT of the button press. ")
SCREENS = ("The phone screen shows a GENERIC vertical short-video feed of abstract colorful cards - "
           "no brand names, no readable text, no recognizable app interface; any tiny text is blurred "
           "and illegible. ")
SKIN = ("Natural hand skin with visible pores and fine texture, subsurface scattering, not waxy, not "
        "airbrushed; clean natural fingernails, no nail polish, no bracelet, no watch, no other jewelry. ")
# ANTI z jawnym zakazem gestu/celowania (nano nie ma osobnego negative_prompt — zakaz w tekscie)
ANTI = ("Photorealistic UGC smartphone look, slight grain, uneven natural window light, tiny handheld "
        "imperfection. 9:16 vertical. EXACTLY ONE pink ring on ONE finger; the other hand holds no "
        "second device. No on-screen captions, no logos. Do NOT show the index finger extended or "
        "pointing at the phone, do NOT show the hand reaching toward the screen, do NOT show a "
        "finger gesturing in the air, do NOT tilt or rotate the ring like a joystick or gyroscope, "
        "do NOT show the thumb lifted away from the buttons.")

def P(pose_scene): return (pose_scene + " " + PRESS + SCREENS + SKIN + ANTI)

# ── FALA A: klatki-FIRST (poprawna interakcja: kciuk na przycisku) ────────────
def a1():
    pose = upref("keep4-detal-klips.png")            # WZORZEC INTERAKCJI: kciuk dociska przycisk
    pack = upref("packshot_pink.png")                # PRODUCT identity (pink)

    HOOK = P("Use Image 1 ONLY for the hand interaction (thumb pressing a top button, index finger "
             "curled) - ignore its color, product and background. " + KEEP +
             "Scene: extreme close-up macro of a woman's hand, the pink ring clipped on her curled "
             "index finger, her thumb pressing down on the top button; behind the hand, softly out of "
             "focus, a smartphone stands upright hands-free (leaning against a couple of books, NOT a "
             "branded stand) showing a vertical feed. Bright modern home, warm high-key daylight.")
    DEMO = P("Use Image 1 ONLY for the hand interaction (thumb pressing a top button) - ignore its "
             "color, product and background. " + KEEP +
             "Scene: even TIGHTER macro from a slightly different angle - the three round buttons of "
             "the pink ring on the curled index finger fill the frame, the THUMB pad pressing the TOP "
             "button down (clear press, button pushed in); the propped phone glows softly out of focus "
             "behind. Bright high-key daylight.")
    KONT = P("Use Image 1 ONLY for the hand interaction (thumb pressing a top button, index finger "
             "curled, NOT pointing). " + KEEP +
             "Scene: pull back to a cozy living room, NO face in frame - only a hand and forearm "
             "resting relaxed on the couch armrest. A woman sits on a couch, one hand loosely holding "
             "a plain mug, the OTHER hand wears the pink ring on its curled index finger and RESTS on "
             "the armrest near her knee, the thumb pressing a button; the index finger is curled, NOT "
             "extended toward the phone. On the coffee table, some distance away, a phone stands "
             "upright hands-free showing a vertical feed. Warm cozy daylight.")
    HVAR = P("Use Image 1 ONLY for the hand interaction (thumb pressing a top button, index finger "
             "curled, NOT pointing). " + KEEP +
             "Scene: bright morning bedroom, NO face - a hand rests relaxed on a white duvet, the pink "
             "ring on the curled index finger, the thumb pressing a top button; the index finger is "
             "curled and relaxed, NOT extended and NOT pointing at the phone. Some distance away a "
             "phone stands upright hands-free against the pillow showing a vertical feed. Soft bright "
             "morning daylight.")

    jobs = [
      nano("hook_first",     HOOK, [pose, pack]),
      nano("demo_first",     DEMO, [pose, pack]),
      nano("kontekst_first", KONT, [pose, pack]),
      nano("hookvar2_first", HVAR, [pose, pack]),
    ]
    got = fal.gen_batch(jobs, outdir=GEN, max_parallel=MAX_PARALLEL, project=PROJ)
    print("A1 done:", {k: bool(v) for k, v in got.items()})

# ── FALA B: klatki-LAST (chain z FIRST, zmiana TYLKO docisk konczy + feed scroll) ──
def a2():
    hf = upg("hook_first.png"); df = upg("demo_first.png")
    kf = upg("kontekst_first.png"); vf = upg("hookvar2_first.png")
    def last(scene_change):
        return ("Image 1 is the exact previous frame. Keep EXACTLY the same framing, lighting, "
                "background, camera angle, the hand, the curled index finger and the pink ring "
                "position, pixel-faithful. The index finger stays CURLED and does NOT point at the "
                "phone. Change ONLY this: " + scene_change + " Do NOT add or remove any part of the "
                "ring; keep exactly three buttons and the open clip; no new objects, no new hands. "
                + SCREENS + "9:16 vertical.")
    jobs = [
      nano("hook_last",     last("the thumb has fully PRESSED the top button (pushed down), and on the "
                                 "phone behind the vertical feed has scrolled UP by one card."), [hf]),
      nano("demo_last",     last("the thumb has fully pressed the top button down, and on the soft-focus "
                                 "phone behind the feed has advanced by one card."), [df]),
      nano("kontekst_last", last("the thumb of the ring hand has pressed a button and the phone's "
                                 "vertical feed has scrolled up one card; the other hand still holds "
                                 "the mug, untouched."), [kf]),
      nano("hookvar2_last", last("the thumb has pressed the top button and the phone against the pillow "
                                 "has scrolled its feed up by one card."), [vf]),
    ]
    got = fal.gen_batch(jobs, outdir=GEN, max_parallel=MAX_PARALLEL, project=PROJ)
    print("A2 done:", {k: bool(v) for k, v in got.items()})

# ── RENDER: 5xFLF (hook, demo, kontekst, cta=echo, hookvar2); kolory bez zmian ─
NEG_PINK = ("closed solid ring band, four buttons, five buttons, two buttons, metal ring body, chrome, "
            "RGB glow, screen on the ring, charging cable, brand logo on product, second controller, "
            "black ring body, white ring body, horizontal carousel scroll")
NEG_POINT = ("index finger extended, pointing finger, finger pointing at the phone, hand reaching "
             "toward the screen, finger gesturing in the air, waving hand, thumb away from the buttons, "
             "thumb not touching the buttons, open loose fist with no press, tilting or rotating the "
             "ring like a joystick or gyroscope, touching the phone screen")
NEG = NEG_PINK + ", " + NEG_POINT
DRIFT = (" The thumb presses the top button down with a small firm tactile click (the button visibly "
         "depresses); the index finger stays curled and still, it does NOT point at or move toward the "
         "phone. Subtle handheld micro-drift, no full rotation, no fast motion.")

def do_render():
    hf = upg("hook_first.png"); hl = upg("hook_last.png")
    df = upg("demo_first.png"); dl = upg("demo_last.png")
    kf = upg("kontekst_first.png"); kl = upg("kontekst_last.png")
    vf = upg("hookvar2_first.png"); vl = upg("hookvar2_last.png")
    scenes = [
      {"tag": "hook", "engine": "flf", "image_url": hf, "tail_image_url": hl,
       "prompt": "On the phone behind, the vertical feed scrolls UP one item hands-free, the screen is "
                 "never touched." + DRIFT, "negative_extra": NEG},
      {"tag": "demo", "engine": "flf", "image_url": df, "tail_image_url": dl,
       "prompt": "On the soft-focus phone the vertical feed advances one card." + DRIFT, "negative_extra": NEG},
      {"tag": "kontekst", "engine": "flf", "image_url": kf, "tail_image_url": kl,
       "prompt": "The phone feed scrolls up hands-free while she keeps holding the mug; no free hand "
                 "touches the phone." + DRIFT, "negative_extra": NEG},
      {"tag": "hookvar2", "engine": "flf", "image_url": vf, "tail_image_url": vl,
       "prompt": "On the phone against the pillow the vertical feed scrolls up one card hands-free." + DRIFT,
       "negative_extra": NEG},
      {"tag": "cta", "engine": "flf", "image_url": hf, "tail_image_url": hf,
       "prompt": "One more gentle thumb press on the top button, then the shot settles back into this "
                 "exact framing (compositional loop, not a rewind)." + DRIFT, "negative_extra": NEG},
    ]
    done = render.render_scenes(scenes, GEN, project=PROJ)
    print("RENDER done:", {k: bool(v) for k, v in done.items()})

if __name__ == "__main__":
    step = sys.argv[1] if len(sys.argv) > 1 else "a1"
    fal.preflight(floor_usd=15)
    {"a1": a1, "a2": a2, "render": do_render}[step]()
