# -*- coding: utf-8 -*-
"""PRZEBIEG mata v2 — TESTIMONIAL Z TWARZĄ (doktryna WIERNOŚĆ WZORCOWI 20.07).

Wzorzec @thebeccaflores = 100% talking-head (35 s twarzy, mata tylko zrolowana w dłoni,
10,3 cięć/min). v1 (6 ujęć produktowych bez twarzy) zgubiła nośnik viralności — v2 to
HYBRYDA wg nowej reguły: twarz na beatach testimonialu + B-roll dowodu z v1 (reuse .pass).

STRUKTURA 15 s / 4 ujęcia (3 cięcia = 12/min, wzorzec 10,3 ±30% ✓):
  1. hook_v2  ~4,0 s  omnihuman  persona TWARZĄ do kamery, mówi, rulon maty w dłoniach
  2. lezenie  ~3,8 s  REUSE v1   kładzie się plecami na macie (gen/lezenie.mp4, ma .pass)
  3. ulga_v2  ~3,7 s  omnihuman  twarz: wydech ulgi + uśmiech, dłoń na karku
  4. cta_v2   ~3,5 s  flf        mikro-gest na rulonie; first=last=p_hook -> LOOP 1:1 z hookiem

Świat = JEDEN (master-wnętrze): wszystkie nowe klatki chainowane z gen/hook_first.png v1
(sypialnia high-key, kremowa pościel, kobieta w kremowym swetrze z ciemnym kokiem).
Etapy: python przebieg_v2.py fala_a | fala_b | render
"""
import os, sys, json, subprocess
sys.path.insert(0, r"C:/tmp/video-factory/tools")
import fal, render

SLUG = "mata"
BASE = rf"C:\tmp\video-factory\{SLUG}"
GEN  = os.path.join(BASE, "gen")            # świat + klipy v1 (reuse)
GEN2 = os.path.join(BASE, "gen_v2"); os.makedirs(GEN2, exist_ok=True)
REFS = os.path.join(BASE, "refs")
MAX_PARALLEL = 8
fal.set_project(SLUG + "-v2")

KARTA = json.load(open(os.path.join(BASE, "KARTA.json"), encoding="utf-8"))
NEG_EXTRA = ", ".join(KARTA["product"]["forbidden_leaks"])
SCENE_NEG = ("cream mat, ivory mat, white mat, grey spikes, blue-grey spikes, readable text, "
             "diagram, studio white background, second person, duplicate mat")

ANTI = ("No readable text, no logos, no labels; EXACTLY ONE rolled mat and ONE pillow roll; hands "
        "natural with five fingers, no rings, no jewelry, no nail polish; bright high-key warm "
        "light, NOT dark; photorealistic, natural skin texture with visible pores.")

def upref(name): return fal.store(os.path.join(REFS, name), f"{SLUG}/ref_" + name)
def upv1(name):  return fal.store(os.path.join(GEN, name), f"{SLUG}/fr_" + name)
def upv2(name):  return fal.store(os.path.join(GEN2, name), f"{SLUG}/v2_" + name)

# ── KLATKI ──────────────────────────────────────────────────────────────────────
# Persona TWARZĄ do kamery — chain ze świata v1 (hook_first: kobieta TYŁEM rozwija matę).
P_HOOK = ("Image 1 shows a woman with dark hair in a loose bun, wearing a cream knit sweater, "
          "sitting on a bed in a warm softly lit bedroom with cream bedding, next to a black "
          "acupressure mat with purple lotus spikes. Image 2 is the product photo of that mat set. "
          "Recompose the SAME woman in the SAME bedroom on the SAME bed with the SAME warm light: "
          "she now SITS FACING THE CAMERA directly, medium close-up UGC selfie framing (head and "
          "upper body, phone-camera eye level), looking straight into the lens, mouth closed with "
          "a calm friendly neutral expression, holding the mat ROLLED UP in both hands at chest "
          "height so the purple spikes of the rolled mat clearly face the camera. Her face is a "
          "natural everyday European woman in her early 30s, light natural makeup, NOT a glamour "
          "model. The half-round pillow roll lies on the bed beside her. Keep the bedroom, bedding "
          "and lighting IDENTICAL to Image 1. " + ANTI)

# Ulga — chain z p_hook (TA SAMA twarz!): dłoń na karku, wydech, zamknięte usta.
P_ULGA = ("Image 1 is the exact reference of this woman, her clothes, the bedroom and the camera "
          "framing. Keep the SAME woman with the IDENTICAL face, hair bun, cream sweater, the SAME "
          "bed, bedroom and warm light, pixel-faithful. Change ONLY this: the rolled mat is no "
          "longer in her hands - it lies flat and unrolled on the bed beside her; her right hand "
          "rests gently on the back of her neck, her eyes are softly closed, head tilted a little "
          "back, a calm relieved smile with closed mouth - the feeling of tension melting away. "
          + ANTI)

def fala_a():
    """p_hook_first (persona twarzą) + 3 nowe VO — jedna fala."""
    for tag, txt in VO.items():
        open(os.path.join(VODIR, tag + ".txt"), "w", encoding="utf-8").write(txt)
    all_txt = "".join(VO.values())
    if not any(c in PL_DIAC for c in all_txt):
        raise RuntimeError("VO v2: zestaw bez polskich znakow -> ASCII-degradacja, STOP")
    jobs = [{"model": "fal-ai/nano-banana/edit", "tag": "p_hook_first",
             "payload": {"prompt": P_HOOK, "image_urls": [upv1("hook_first.png"), upref("g4_clean.png")],
                         "num_images": 1, "output_format": "png", "aspect_ratio": "9:16"}}]
    for tag, txt in VO.items():
        jobs.append({"model": "fal-ai/elevenlabs/tts/eleven-v3", "tag": tag,
                     "payload": {"text": txt, "voice": VOICE, "stability": 0.3}})
    got = fal.gen_batch(jobs, outdir=GEN2, max_parallel=MAX_PARALLEL, project=SLUG + "-v2")
    fails = [t for t in got if os.path.exists(os.path.join(GEN2, t + ".failed"))]
    print("FALA A v2 done. fails:", fails or "brak", flush=True)

def fala_b():
    """p_ulga_first (chain z p_hook — ta sama twarz)."""
    got = fal.gen_batch([{"model": "fal-ai/nano-banana/edit", "tag": "p_ulga_first",
                          "payload": {"prompt": P_ULGA, "image_urls": [upv2("p_hook2.png")],
                                      "num_images": 1, "output_format": "png", "aspect_ratio": "9:16"}}],
                        outdir=GEN2, max_parallel=MAX_PARALLEL, project=SLUG + "-v2")
    fails = [t for t in got if os.path.exists(os.path.join(GEN2, t + ".failed"))]
    print("FALA B v2 done. fails:", fails or "brak", flush=True)

# ── VO v2 (testimonial-synced; diakrytyki z plikow UTF-8) ───────────────────────
VOICE = "Aria"
VO = {
 "vo_hook_v2": "Całe dnie za biurkiem? To jest dla ciebie.",
 "vo_demo_v2": "Wyglądają groźnie, wiem — a kładę się na nich plecami.",
 "vo_ulga_v2": "[sighs] Dziesięć minut… i plecy odpuszczają.",
}
VODIR = os.path.join(GEN2, "vo_txt"); os.makedirs(VODIR, exist_ok=True)
PL_DIAC = set("ąćęłńóśźż") | set("ĄĆĘŁŃÓŚŹŻ")

def pad_audio(tag):
    """kwestia + 0,6 s pad (driving OmniHuman) -> GEN2/<tag>_pad.mp3, zwraca URL fal.store."""
    src = os.path.join(GEN2, tag + ".mp3")
    out = os.path.join(GEN2, tag + "_pad.mp3")
    subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-af", "apad=pad_dur=0.6", "-y", out],
                   check=True)
    return upv2(tag + "_pad.mp3")

# ── RENDER ──────────────────────────────────────────────────────────────────────
EXPR_HOOK = ("A natural everyday woman speaks directly to the camera in a casual honest UGC "
             "testimonial tone, subtle head movements, warm direct eye contact, slightly tired "
             "but genuine at first, small emphatic nod on the last phrase, she keeps holding the "
             "rolled spiky mat at chest height with both hands, the mat stays EXACTLY as it is.")
EXPR_ULGA = ("The woman exhales slowly with visible relief, eyes softly closed then gently "
             "opening, a genuine relaxed smile grows, her hand slowly massages the back of her "
             "neck once, calm slow breathing, deep relaxation, she speaks softly mid-exhale.")
CTA_MOTION = ("Take @Image1 as the start frame. The woman gives the rolled mat in her hands one "
              "gentle satisfied pat and a tiny lift, then settles it back to the exact starting "
              "pose, subtle warm smile, micro handheld camera drift, everything else stays still.")

def do_render():
    p_hook = upv2("p_hook2.png")
    p_ulga = upv2("p_ulga_first.png")
    scenes = [
        {"tag": "hook_v2", "engine": "omnihuman", "n": 2,
         "image_url": p_hook, "audio_url": pad_audio("vo_hook_v2"), "prompt": EXPR_HOOK},
        {"tag": "ulga_v2", "engine": "omnihuman", "n": 2,
         "image_url": p_ulga, "audio_url": pad_audio("vo_ulga_v2"), "prompt": EXPR_ULGA},
        {"tag": "cta_v2", "engine": "flf",
         "image_url": p_hook, "tail_image_url": p_hook,     # first=last => LOOP 1:1 z hookiem
         "prompt": CTA_MOTION, "negative_extra": NEG_EXTRA + ", " + SCENE_NEG},
    ]
    print("RENDER v2", [s["tag"] + "/" + s["engine"] for s in scenes], flush=True)
    done = render.render_scenes(scenes, GEN2, project=SLUG + "-v2")
    print("DONE:", json.dumps({k: bool(v) for k, v in done.items()}), flush=True)

def main():
    step = sys.argv[1] if len(sys.argv) > 1 else "fala_a"
    if step == "fala_a":
        fal.preflight(floor_usd=15)
        fala_a()
    elif step == "fala_b":
        fala_b()
    elif step == "render":
        do_render()

if __name__ == "__main__":
    main()
