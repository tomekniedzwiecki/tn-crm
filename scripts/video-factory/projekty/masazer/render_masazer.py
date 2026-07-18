# -*- coding: utf-8 -*-
"""RENDER masazer: 4x kref (Kling O1 ref-to-video, wiernosc produktu w ruchu 0i-b) + FLF (cta loop-close).
kref: image_urls=[start_frame], elements=[frontal g0_float + refy g0_worn/g5_deglow/g2_left], negative_prompt jawne.
FLF cta: image_url=hook_first (=cta_first echo), tail_image_url=cta_last.
Uruchamiaj: python render_masazer.py [tag ...]  (domyslnie wszystkie). project=masazer. ASCII printy."""
import os, sys, json
sys.path.insert(0, r"C:/tmp/video-factory/tools"); import fal, render
fal.set_project('masazer')

BASE = r"C:\tmp\video-factory\masazer"
GEN = os.path.join(BASE, "gen"); REFS = os.path.join(BASE, "refs")
KARTA = json.load(open(os.path.join(BASE, "KARTA.json"), encoding="utf-8"))
BP = {s["id"]: s for s in json.load(open(os.path.join(BASE, "blueprint.json"), encoding="utf-8"))["sceny"]}
NEG_EXTRA = ", ".join(KARTA["product"]["forbidden_leaks"])
KREF_NEG = render.NEG + ", " + NEG_EXTRA

def upfr(name):  return fal.store(os.path.join(GEN, name), "masazer/rn_" + name)
def upref(name): return fal.store(os.path.join(REFS, name), "masazer/rnref_" + name)

# elementy kref = jeden zestaw multi-view (wspolny dla scen produktowych)
def kref_element():
    return {"frontal_image_url": upref("g0_float.jpg"),
            "reference_image_urls": [upref("g0_worn.jpg"), upref("g5_deglow.jpg"), upref("g2_left.jpg")]}

KREF_SCENES = ["hook", "worn", "heads", "relief"]

def build_scenes(only):
    el = None
    scenes = []
    for sid in only:
        sc = BP[sid]
        if sc["engine"] == "kref":
            if el is None: el = kref_element()
            start = upfr(f"{sid}_first.png")
            scenes.append({
                "tag": sid, "engine": "kref",
                "image_urls": [start],
                "elements": [el],
                "prompt": sc["motion_prompt_en"],
                "negative_prompt": KREF_NEG,
                "duration": "5", "aspect_ratio": "9:16",
            })
        elif sc["engine"] == "flf":
            # cta: first = hook_first (echo hooka), last = cta_last
            first = upfr("hook_first.png"); tail = upfr("cta_last.png")
            scenes.append({
                "tag": sid, "engine": "flf",
                "image_url": first, "tail_image_url": tail,
                "prompt": sc["motion_prompt_en"],
                "negative_extra": NEG_EXTRA,
            })
    return scenes

if __name__ == "__main__":
    only = sys.argv[1:] or (KREF_SCENES + ["cta"])
    scenes = build_scenes(only)
    print("rendering", [s["tag"]+"/"+s["engine"] for s in scenes], flush=True)
    done = render.render_scenes(scenes, GEN, project="masazer")
    print("DONE:", json.dumps(done), flush=True)
    for sid in only:
        f = os.path.join(GEN, sid + ".failed")
        if os.path.exists(f): print("FAILED", sid, open(f).read()[:200], flush=True)
