# -*- coding: utf-8 -*-
"""PRZEBIEG Odsaczek (skladany stalowy kosz do smazenia/odsaczania) — gadzet-handsPOV,
wzorzec @kitchen_in_china 717.6k. Stack: 7xFLF (Kling 2.5) + nano-banana/edit; music-forward
+ ASMR-prominent SFX (skwierczenie/kapanie/plunge/dump/fold). Doktryna EDYTUJ PRAWDE:
klatki produktowe = nano-edycja packshotow/realnej sceny Ali (g0/g2/g3), akcja slowem, zakazy negative.
Etapy: python przebieg.py a1 | a2 | render   (bramka/montaz osobno przez operatora)
"""
import os, sys, subprocess
sys.path.insert(0, r"c:/repos_tn/tn-crm/scripts/video-factory")
import fal, render

SLUG = "odsaczek"
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

# ── KLAUZULE ─────────────────────────────────────────────────────────────────
KEEP = ("The product is a COLLAPSIBLE BARE STAINLESS-STEEL WIRE-MESH frying basket: open spiral "
        "chain-link wire mesh (no solid bottom), a crown of triangular wire ribs around the top rim, "
        "and TWO fold-up wire handle-arms that meet at the top as a single carry-bail; polished silver "
        "steel, no coating, no plastic, no color, no logo, no text. KEEP the basket EXACTLY this shape; "
        "do NOT give it a solid bottom, do NOT add plastic grips or color, do NOT duplicate it. ")
SCENE = ("Bright clean modern home kitchen: white square-tile backsplash, light stone countertop, a plain "
         "round black wok with a wood handle on an induction cooktop, a cook in a green-and-white striped "
         "apron with a grey oven mitt. NO wall mural, NO cartoon decor, NO brand logos, NO Chinese text, "
         "NO on-screen captions. ")
SKIN = ("Natural hand skin with visible pores and fine texture, subsurface scattering, not waxy, not "
        "airbrushed; bare hands, no rings, no bracelet, no watch, no nail polish. ")
ANTI = ("Photorealistic UGC smartphone look, slight grain, warm natural window light, tiny handheld "
        "imperfection, appetizing high-key daylight. 9:16 vertical. EXACTLY ONE wire basket in the scene; "
        "no second basket. No on-screen text, no logos, no Chinese characters.")
OIL = ("The hot cooking oil is real liquid: it bubbles gently around the food and drips as continuous "
       "droplets and thin streams through the wire mesh; it must NOT turn into white foam, blobs or clumps. ")

def P(body, oil=False):
    return body + " " + (OIL if oil else "") + SCENE + SKIN + ANTI

# ── AUDIO ────────────────────────────────────────────────────────────────────
MUSIC = ("upbeat bright modern kitchen lifestyle pop with a punchy kick and crisp snare driving CONSTANTLY "
         "from the very first second, radio-ready punchy mix, energetic and clean, constant energy until the "
         "very end, no outro, no fade out, absolutely no vocals, NO lo-fi, NO ambient")
AMBIENT = ("quiet warm home kitchen room tone, faint airy hum with a soft distant frying background, steady "
           "and seamless, NO melody, NO music, NO vocals")
SFX = {
 "sfx_sizzle": ("close-up ASMR sound effect: hot oil frying sizzle, food crackling in deep oil, continuous, "
                "very close microphone, dry, NO music, NO reverb", 2.0),
 "sfx_drip":   ("close-up ASMR sound effect: hot oil droplets dripping and thin streams trickling back into a "
                "pan, at the very beginning then silence, very close microphone, dry, NO music, NO reverb", 1.4),
 "sfx_plunge": ("close-up sound effect: a basket of food lowered into hot oil, a sudden burst of sizzling and "
                "bubbling, at the very beginning then steady sizzle, very close microphone, dry, NO music, NO reverb", 1.6),
 "sfx_dump":   ("close-up ASMR sound effect: a pile of crispy fried fries tumbling onto a ceramic plate, light "
                "crunchy patter, at the very beginning then silence, very close microphone, dry, NO music, NO reverb", 1.3),
 "sfx_fold":   ("close-up sound effect: springy stainless-steel wire mesh collapsing and folding flat, a metallic "
                "shhk and soft clink, at the very beginning then silence, very close microphone, dry, NO music, NO reverb", 1.2),
}

def a1():
    g0 = upref("g0_scena_wyjmowanie.png")   # realna scena lift+drain (identity+context)
    g2 = upref("g2_packshot_rozlozony.png") # packshot rozlozony (identity)
    g3 = upref("g3_packshot_zlozony.png")   # packshot zlozony na plasko (identity fold)

    HOOK = ("Use Image 1 as the base scene AND the exact product identity: keep the stainless-steel wire "
            "basket, the golden-crisp fries inside it, and the black wok exactly as in Image 1. " + KEEP +
            "Reframe to a clean vertical 9:16 side macro of the hand lifting the loaded basket straight up "
            "just above the wok of hot oil, hot oil dripping through the mesh back into the wok; brighten to "
            "appetizing high-key. Remove any text or logo from the scene. ")
    LOWER = ("Use Image 1 for the kitchen scene and the exact wire basket identity; " + KEEP +
             "Scene: a top-down side angle over the black wok — the same steel wire basket, now loaded with "
             "PALE RAW-CUT potato fries (not yet fried), held by its bail handle and being lowered down toward "
             "the surface of shimmering hot oil in the wok on the induction cooktop. ")
    DRAIN = ("Use Image 1 for the kitchen scene and the exact wire basket identity; " + KEEP +
             "Scene: a side macro — the wire basket full of finished golden-crisp fries now RESTS HOOKED on the "
             "rim of the black wok, draining hands-free; the hand has just let go and hovers beside it, not "
             "touching; oil drips steadily through the mesh back into the wok. ")
    DUMP = ("Image 1 shows the exact wire basket identity. " + KEEP +
            "Scene: on a clean light kitchen countertop, a hand tips the steel wire basket over a clean white "
            "plate and crispy golden fries tumble out onto the plate; on the counter just beside it a SECOND "
            "white plate already holds golden fried nuggets. Bright clean kitchen. ")
    FOLD_A = ("Image 1 shows the exact wire basket identity (expanded). " + KEEP +
              "Scene: the EMPTY clean steel wire basket stands expanded on a light kitchen countertop, both bare "
              "hands gripping its two wire handle-arms and starting to press them outward and down to collapse "
              "it; no food anywhere. Bright clean kitchen. ")
    FOLD_B = ("Image 1 shows the exact product FOLDED FLAT into a round spiral steel disk — keep this exact flat "
              "spiral disk shape. Scene: the basket now collapsed completely flat into a round spiral stainless "
              "disk lying on a light kitchen countertop, the wound spiral center clearly visible, one bare hand "
              "resting a fingertip on it; top-down view, bright clean kitchen. ")

    jobs = [
      nano("hook_first",  P(HOOK, oil=True),  [g0]),
      nano("lower_first", P(LOWER, oil=True), [g0, g2]),
      nano("drain_first", P(DRAIN, oil=True), [g0]),
      nano("dump_first",  P(DUMP),            [g0, g2]),
      nano("fold_a_first", P(FOLD_A),         [g2]),
      nano("fold_b_first", P(FOLD_B),         [g3]),
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

# ── FALA B: klatki-LAST (chain z FIRST, zmiana TYLKO stan akcji) ─────────────
def a2():
    hf = upg("hook_first.png"); lf = upg("lower_first.png"); drf = upg("drain_first.png")
    duf = upg("dump_first.png"); faf = upg("fold_a_first.png")
    def last(scene_change, oil=False):
        return ("Image 1 is the exact previous frame. Keep EXACTLY the same framing, lighting, background, "
                "camera angle and the wire basket identity and position, pixel-faithful. Change ONLY this: " +
                scene_change + " Do NOT change the basket shape; keep the open wire mesh, the triangular rib "
                "crown and the two-arm bail; no solid bottom, no second basket, no new objects. " +
                (OIL if oil else "") + "No text, no logo, no Chinese characters. 9:16 vertical.")
    jobs = [
      nano("hook_last",  last("a few more oil droplets have fallen through the mesh into the wok; the loaded "
                              "basket has settled a touch lower, still held above the oil.", oil=True), [hf]),
      nano("lower_last", last("the basket has been lowered INTO the hot oil, the pale fries now submerged and "
                              "bubbling as they start to fry, gentle even bubbles and light steam.", oil=True), [lf]),
      nano("drain_last", last("a few more oil droplets and thin glistening threads have dripped down through the "
                              "mesh into the wok below; the golden fries glisten and faint steam rises.", oil=True), [drf]),
      nano("dump_last",  last("the golden fries have tumbled out into a satisfying pile on the white plate and the "
                              "basket is now nearly empty."), [duf]),
      nano("fold_a_last", last("the two handle-arms have been pressed further outward and down; the wire frame has "
                               "just begun to relax and flatten, still mostly expanded."), [faf]),
    ]
    got = fal.gen_batch(jobs, outdir=GEN, max_parallel=MAX_PARALLEL, project=SLUG)
    print("A2 done:", {k: bool(v) for k, v in got.items()})

# ── RENDER: 7xFLF ────────────────────────────────────────────────────────────
NEG = ("solid bottom fryer basket, closed rigid basket, plastic handle grip, colored coating on wire, second "
       "basket, duplicate basket, white foam, oil blobs, oil clumps, cartoon mural, animal face on wall, brand "
       "logo, chinese text, readable text, horizontal carousel")
DRIFT = " Subtle handheld micro-drift, no full rotation, no fast motion."

def do_render():
    hf = upg("hook_first.png"); hl = upg("hook_last.png")
    lf = upg("lower_first.png"); ll = upg("lower_last.png")
    drf = upg("drain_first.png"); drl = upg("drain_last.png")
    duf = upg("dump_first.png"); dul = upg("dump_last.png")
    faf = upg("fold_a_first.png"); fal_ = upg("fold_a_last.png")
    fbf = upg("fold_b_first.png")
    scenes = [
      {"tag": "hook", "engine": "flf", "image_url": hf, "tail_image_url": hl,
       "prompt": "The hand holds the loaded basket steady just above the wok; hot oil keeps dripping in "
                 "continuous droplets through the mesh back into the oil, a little steam rises." + DRIFT,
       "negative_extra": NEG},
      {"tag": "lower", "engine": "flf", "image_url": lf, "tail_image_url": ll, "n": 2,
       "prompt": "The basket lowers into the hot oil and the oil bubbles up gently and evenly around the fries "
                 "as they begin to fry, real liquid oil, no foam." + DRIFT, "negative_extra": NEG},
      {"tag": "drain", "engine": "flf", "image_url": drf, "tail_image_url": drl,
       "prompt": "Extreme macro: hot oil keeps dripping in thin continuous glistening threads and droplets through "
                 "the wire mesh, the golden fries glisten and faint steam rises; the basket barely moves." + DRIFT,
       "negative_extra": NEG},
      {"tag": "dump", "engine": "flf", "image_url": duf, "tail_image_url": dul,
       "prompt": "The basket tips and the golden fries tumble out onto the white plate in a satisfying pile; "
                 "only the food moves as the basket empties." + DRIFT, "negative_extra": NEG},
      {"tag": "fold_a", "engine": "flf", "image_url": faf, "tail_image_url": fal_,
       "prompt": "Both hands press the wire handle-arms of the empty basket outward and down; the wire frame just "
                 "begins to relax and collapse." + DRIFT, "negative_extra": NEG},
      {"tag": "fold_b", "engine": "flf", "image_url": fbf, "tail_image_url": fbf,
       "prompt": "The flat round spiral steel disk rests on the counter; one fingertip gives it a tiny tap, only "
                 "a soft light shimmer, nothing morphs." + DRIFT, "negative_extra": NEG},
      {"tag": "cta", "engine": "flf", "image_url": hf, "tail_image_url": hf,
       "prompt": "The loaded basket of golden fries is held above the wok, a few last oil droplets fall through "
                 "the mesh, and the shot settles into this exact framing (compositional loop, not a rewind)." + DRIFT,
       "negative_extra": NEG},
    ]
    done = render.render_scenes(scenes, GEN, project=SLUG)
    print("RENDER done:", {k: bool(v) for k, v in done.items()})

if __name__ == "__main__":
    step = sys.argv[1] if len(sys.argv) > 1 else "a1"
    fal.preflight(floor_usd=15)
    {"a1": a1, "a2": a2, "render": do_render}[step]()
