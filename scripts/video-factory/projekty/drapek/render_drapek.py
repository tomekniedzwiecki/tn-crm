# -*- coding: utf-8 -*-
"""Render FLF scen drapek przez rdzen render.py (Kling 2.5 first+last). project=drapek.
Wszystkie sceny flf; scratch = n:2 (ruch zwierzecia = ryzyko fizyki). ASCII printy."""
import os, sys, json
sys.path.insert(0, r"C:/tmp/video-factory/tools"); import fal, render
fal.set_project('drapek')

BASE = r"C:\tmp\video-factory\drapek"
FR = os.path.join(BASE, "frames"); GEN = os.path.join(BASE, "gen"); os.makedirs(GEN, exist_ok=True)
KARTA = json.load(open(os.path.join(BASE, "KARTA.json"), encoding="utf-8"))
BP = json.load(open(os.path.join(BASE, "blueprint.json"), encoding="utf-8"))
NEG_EXTRA = ", ".join(KARTA["product"]["forbidden_leaks"])
PHYS = KARTA["grammar"]["physics"]

def up(name):
    return fal.store(os.path.join(FR, name), "drapek/rn_" + name)

if __name__ == "__main__":
    only = sys.argv[1:] if len(sys.argv) > 1 else None
    scenes = []
    for sc in BP["sceny"]:
        sid = sc["id"]
        if only and sid not in only: continue
        img = up(f"{sid}_first.png"); tail = up(f"{sid}_last.png")
        motion = (f"{sc['motion_prompt_en']}. Physics: {PHYS}. "
                  f"Photorealistic, keep the exact product shape and count and the same one corgi with four legs, "
                  f"subtle handheld micro-drift, no full 360 rotation, no morphing, bright high-key room.")
        s = {"tag": sid, "engine": "flf", "image_url": img, "tail_image_url": tail,
             "prompt": motion, "negative_extra": NEG_EXTRA}
        if sc.get("n"): s["n"] = sc["n"]
        scenes.append(s)
    print("rendering", [s["tag"] for s in scenes], flush=True)
    done = render.render_scenes(scenes, GEN, project="drapek")
    print("DONE:", json.dumps(done), flush=True)
    for sc in scenes:
        for suf in ("", "__c1", "__c2"):
            f = os.path.join(GEN, sc["tag"] + suf + ".failed")
            if os.path.exists(f): print("FAILED", sc["tag"]+suf, open(f).read()[:200], flush=True)
