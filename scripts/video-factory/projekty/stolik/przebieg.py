# -*- coding: utf-8 -*-
"""PRZEBIEG stolik — WZORZEC ROWNOLEGLOSCI (pierwszy pelny bieg _szablon_przebiegu).
FALA A: 5 klatek-FIRST + CALE audio (muzyka+ambient+VO x6+SFX x5) jednym gen_batch.
FALA B: cta_first (chain z hook_first) -> B2: cta_last (chain z cta_first).
Potem: BRAMKA klatek (glowna sesja oglada SAMA) -> render_scenes (5x kref + 1x flf)
-> qa_gate/product_gate -> montaz. ASCII printy; tresci VO w plikach UTF-8.
Uruchamianie etapami: python przebieg.py fala_a | fala_b | render
"""
import os, sys, json, subprocess
sys.path.insert(0, r"C:/tmp/video-factory/tools")
import fal, render

SLUG = "stolik"
BASE = rf"C:\tmp\video-factory\{SLUG}"
GEN  = os.path.join(BASE, "gen"); os.makedirs(GEN, exist_ok=True)
REFS = os.path.join(BASE, "refs")
MAX_PARALLEL = 8
fal.set_project(SLUG)

BP = {s["id"]: s for s in json.load(open(os.path.join(BASE, "blueprint.json"), encoding="utf-8"))["sceny"]}
KARTA = json.load(open(os.path.join(BASE, "KARTA.json"), encoding="utf-8"))
NEG_EXTRA = ", ".join(KARTA["product"]["forbidden_leaks"])

KEEP1 = ("Image 1 is a real product photo of a gold side table with a white marble top. KEEP the table "
         "EXACTLY as its pixels in Image 1 - same slim gold metal frame, same single thin white marble top, "
         "same geometry, construction and proportions. Do NOT redraw, reshape, re-colour, thicken or add "
         "parts to the table (no extra shelf, no second tier, no wood). Only replace the surroundings with "
         "the described scene.")
ANTI = ("No readable text, no logos, no brand wordmark anywhere; EXACTLY ONE side table in the scene; "
        "no second shelf or lower tier; no dark wood table; no black or silver frame; the woman's hand is "
        "natural with five fingers, neutral short nails, no rings, no jewelry, no nail polish; bright "
        "high-key warm light, NOT dark; photorealistic, natural skin texture with visible pores.")

def upref(name): return fal.store(os.path.join(REFS, name), f"{SLUG}/ref_" + name)
def upfr(name):  return fal.store(os.path.join(GEN, name), f"{SLUG}/fr_" + name)

def nano_job(tag, brief, base_ref):
    prompt = KEEP1 + " SCENE: " + brief + " " + ANTI
    return {"model": "fal-ai/nano-banana/edit", "tag": tag,
            "payload": {"prompt": prompt, "image_urls": [upref(base_ref)], "num_images": 1,
                        "output_format": "png", "aspect_ratio": "9:16"}}

def frames_first_spec():
    jobs = []
    for sid in ["hook", "kawa", "deco", "laptop", "total"]:
        sc = BP[sid]
        jobs.append(nano_job(sid + "_first", sc["first_frame_brief_en"], sc["baza_packshot"].split("/")[-1]))
    return jobs

# ── AUDIO ──
VOICE = "Aria"
VO = {
 "vo_hook":   "Wsuwa się pod kanapę…",
 "vo_kawa":   "…i kawa ma już miejsce.",
 "vo_deco":   "Książka i świeca też.",
 "vo_laptop": "Wieczorem? Małe biurko.",
 "vo_total":  "Mały, a robi cały salon.",
 "vo_cta":    "No i jak go nie kochać?",
}
VODIR = os.path.join(GEN, "vo_txt"); os.makedirs(VODIR, exist_ok=True)
PL_DIAC = set("ąćęłńóśźż") | set("ĄĆĘŁŃÓŚŹŻ")

def write_vo_files():
    for tag, txt in VO.items():
        open(os.path.join(VODIR, tag + ".txt"), "w", encoding="utf-8").write(txt)

MUSIC = ("warm upbeat pop-house with a steady groove from the very first second, elegant cozy evening "
         "living-room vibe, light percussion, soft piano accents, constant energy until the very end, "
         "no outro, no fade out, NO lo-fi, NO ambient")
AMBIENT = ("room tone of a quiet cozy living room, very soft house interior ambience, faint candle "
           "crackle and fabric rustle, steady and seamless, NO melody, NO music")
SFX = {
 "sfx_slide": ("sound effect foley: a small metal-framed table sliding briefly on a wooden floor then a soft gentle thud as it settles, close-up, dry, NO music, NO reverb", 1.6),
 "sfx_clink": ("sound effect foley: a porcelain coffee cup on a saucer set down gently on a stone table top, one soft ceramic clink, close-up, dry, NO music, NO reverb", 1.4),
 "sfx_thud":  ("sound effect foley: a hardcover book laid flat on a stone surface, one soft muffled thud then a tiny slide, close-up, dry, NO music, NO reverb", 1.4),
 "sfx_keys":  ("sound effect foley: a few quiet laptop keyboard key taps, soft and sparse, close-up, dry, NO music, NO reverb", 1.8),
 "sfx_tap":   ("sound effect foley: a soft single pat of a palm on a stone table top, gentle and warm, close-up, dry, NO music, NO reverb", 1.2),
}

def audio_spec():
    write_vo_files()
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
    for tag in VO:
        txt = open(os.path.join(VODIR, tag + ".txt"), encoding="utf-8").read().strip()
        if not any(c in PL_DIAC for c in txt):
            raise RuntimeError(f"VO {tag}: payload BEZ diakrytykow -> STOP ('{txt}')")
        jobs.append({"model": "fal-ai/elevenlabs/tts/eleven-v3", "tag": tag,
                     "payload": {"text": txt, "voice": VOICE, "stability": 0.3}})
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

# ── FALA B: klatki CTA (chain 2-stopniowy) ──
CTA_FIRST_PROMPT = (
 "Image 1 is the exact start frame of this video. Keep EVERYTHING identical - the same room, sofa, "
 "lamp, light, camera framing and the same gold side table with white marble top, pixel-faithful. "
 "Change ONLY this: on the marble top now stand a white cappuccino cup on a saucer, a cream hardcover "
 "book with a lit candle in a glass jar on it, and a small gold wire vase with a eucalyptus sprig; "
 "the woman's hand now rests flat and relaxed on the marble top. Nothing else changes. " + ANTI)
CTA_LAST_PROMPT = (
 "Image 1 is the exact previous frame. Keep EVERYTHING identical - room, sofa, lamp, light, framing, "
 "the gold side table with white marble top and all items on it, pixel-faithful. Change ONLY the "
 "woman's hand: it now presses gently at the near edge of the marble top, mid-gesture of giving the "
 "table a tiny push. Nothing else changes. " + ANTI)

def fala_b():
    hook_url = upfr("hook_first.png")
    got = fal.gen_batch([{"model": "fal-ai/nano-banana/edit", "tag": "cta_first",
                          "payload": {"prompt": CTA_FIRST_PROMPT, "image_urls": [hook_url],
                                      "num_images": 1, "output_format": "png", "aspect_ratio": "9:16"}}],
                        outdir=GEN, max_parallel=MAX_PARALLEL, project=SLUG)
    cta_url = upfr("cta_first.png")
    got2 = fal.gen_batch([{"model": "fal-ai/nano-banana/edit", "tag": "cta_last",
                           "payload": {"prompt": CTA_LAST_PROMPT, "image_urls": [cta_url],
                                       "num_images": 1, "output_format": "png", "aspect_ratio": "9:16"}}],
                         outdir=GEN, max_parallel=MAX_PARALLEL, project=SLUG)
    print("FALA B done:", {**got, **got2})

# ── RENDER ──
def kref_element():
    return {"frontal_image_url": upref("ali_g1.jpg"),
            "reference_image_urls": [upref("g0_clean.jpg"), upref("ali_g2.jpg"), upref("ali_g5.jpg")]}

def scenes_spec():
    el = kref_element()
    scenes = []
    for sid in ["hook", "kawa", "deco", "laptop", "total"]:
        sc = BP[sid]
        scenes.append({"tag": sid, "engine": "kref",
                       "image_urls": [upfr(sid + "_first.png")],
                       "elements": [el],
                       "prompt": sc["motion_prompt_en"],
                       "negative_prompt": render.NEG + ", " + NEG_EXTRA,
                       "duration": "5", "aspect_ratio": "9:16"})
    cta = BP["cta"]
    scenes.append({"tag": "cta", "engine": "flf",
                   "image_url": upfr("cta_first.png"), "tail_image_url": upfr("cta_last.png"),
                   "prompt": cta["motion_prompt_en"],
                   "negative_extra": NEG_EXTRA})
    return scenes

def main():
    step = sys.argv[1] if len(sys.argv) > 1 else "fala_a"
    if step == "fala_a":
        fal.preflight(floor_usd=15)
        audio_jobs, sfx_trims = audio_spec()
        firsts = frames_first_spec()
        fala = firsts + audio_jobs
        print(f"FALA A: {len(firsts)} klatek-FIRST + {len(audio_jobs)} audio = {len(fala)} jobow, max_parallel={MAX_PARALLEL}", flush=True)
        got = fal.gen_batch(fala, outdir=GEN, max_parallel=MAX_PARALLEL, project=SLUG)
        trim_sfx(sfx_trims)
        fails = [t for t in list(got) if os.path.exists(os.path.join(GEN, t + ".failed"))]
        print("FALA A done. fails:", fails or "brak", flush=True)
    elif step == "fala_b":
        fala_b()
    elif step == "render":
        scenes = scenes_spec()
        print("RENDER", [s["tag"] + "/" + s["engine"] for s in scenes], flush=True)
        done = render.render_scenes(scenes, GEN, project=SLUG)
        print("DONE:", json.dumps({k: bool(v) for k, v in done.items()}), flush=True)
        for s in scenes:
            f = os.path.join(GEN, s["tag"] + ".failed")
            if os.path.exists(f): print("FAILED", s["tag"], open(f).read()[:200], flush=True)

if __name__ == "__main__":
    main()
